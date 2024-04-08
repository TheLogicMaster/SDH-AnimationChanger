import asyncio
import json
import logging
import os
import random
import socket
import ssl
import aiohttp
import certifi
from aiohttp import ClientSession, TCPConnector
import decky_plugin

CONFIG_PATH = os.path.join(decky_plugin.DECKY_PLUGIN_SETTINGS_DIR, 'config.json')
ANIMATIONS_PATH = os.path.join(decky_plugin.DECKY_PLUGIN_RUNTIME_DIR, 'animations')
DOWNLOADS_PATH = os.path.join(decky_plugin.DECKY_PLUGIN_RUNTIME_DIR, 'downloads')
OVERRIDE_PATH = os.path.expanduser('~/.steam/root/config/uioverrides/movies')

BOOT_VIDEO = 'deck_startup.webm'
SUSPEND_VIDEO = 'deck-suspend-animation.webm'
THROBBER_VIDEO = 'deck-suspend-animation-from-throbber.webm'

VIDEOS_NAMES = [BOOT_VIDEO, SUSPEND_VIDEO, THROBBER_VIDEO]
VIDEO_TYPES = ['boot', 'suspend', 'throbber']
VIDEO_TARGETS = ['boot', 'suspend', 'suspend']

REQUEST_RETRIES = 5

ssl_ctx = ssl.create_default_context(cafile=certifi.where())

config = {}
local_animations = []
local_sets = []
animation_cache = []
unloaded = False


async def get_steamdeckrepo():
    try:
        for _ in range(REQUEST_RETRIES):
            async with ClientSession(connector=TCPConnector(family=socket.AF_INET) if config['force_ipv4'] else None) as web:
                async with web.request(
                        'get',
                        f'https://steamdeckrepo.com/api/posts/all',
                        ssl=ssl_ctx
                ) as res:
                    if res.status == 200:
                        data = (await res.json())['posts']
                        break
                    status = res.status
                    if res.status == 429:
                        raise Exception('Rate limit exceeded, try again in a minute')
                    decky_plugin.logger.warning(f'steamdeckrepo fetch failed, status={res.status}')
        else:
            raise Exception(f'Retry attempts exceeded, status code: {status}')
        return [{
            'id': entry['id'],
            'name': entry['title'],
            'preview_image': entry['thumbnail'],
            'preview_video': entry['video'],
            'author': entry['user']['steam_name'],
            'description': entry['content'],
            'last_changed': entry['updated_at'],  # Todo: Ensure consistent date format
            'source': entry['url'],
            'download_url': 'https://steamdeckrepo.com/post/download/' + entry['id'],
            'likes': entry['likes'],
            'downloads': entry['downloads'],
            'version': '',
            'target': 'suspend' if entry['type'] == 'suspend_video' else 'boot',
            'manifest_version': 1
        } for entry in data if entry['type'] in ['suspend_video', 'boot_video']]
    except Exception as e:
        decky_plugin.logger.error('Failed to fetch steamdeckrepo', exc_info=e)
        raise e


async def update_cache():
    global animation_cache
    animation_cache = await get_steamdeckrepo()
    # Todo: JSON URL based sources
    # Todo: How to merge sources with less metadata with steamdeckrepo results gracefully?


async def regenerate_downloads():
    downloads = []
    if len(animation_cache) == 0:
        await update_cache()
    for file in os.listdir():
        if not file.endswith('.webm'):
            continue
        anim_id = file[:-5]
        for anim in animation_cache:
            if anim['id'] == anim_id:
                downloads.append(anim)
                break
        else:
            decky_plugin.logger.error(f'Failed to find cached entry for id: {anim_id}')
    config['downloads'] = downloads


async def load_config():
    global config
    config = {
        'boot': '',
        'suspend': '',
        'throbber': '',
        'randomize': '',
        'current_set': '',
        'downloads': [],
        'custom_animations': [],
        'custom_sets': [],
        'shuffle_exclusions': [],
        'force_ipv4': False
    }

    async def save_new():
        try:
            await regenerate_downloads()
            save_config()
        except Exception as ex:
            decky_plugin.logger.error('Failed to save new config', exc_info=ex)

    if os.path.exists(CONFIG_PATH):
        try:
            with open(CONFIG_PATH) as f:
                config.update(json.load(f))
                if type(config['randomize']) == bool:
                    config['randomize'] = ''
        except Exception as e:
            decky_plugin.logger.error('Failed to load config', exc_info=e)
            await save_new()
    else:
        await save_new()


def raise_and_log(msg, ex=None):
    decky_plugin.logger.error(msg, exc_info=ex)
    if ex is None:
        raise Exception(msg)
    raise ex


def save_config():
    try:
        with open(CONFIG_PATH, 'w') as f:
            json.dump(config, f, indent=4)
    except Exception as e:
        raise_and_log('Failed to save config', e)


def load_local_animations():
    global local_animations
    global local_sets

    animations = []
    sets = []
    directories = next(os.walk(ANIMATIONS_PATH))[1]
    for directory in directories:
        is_set = False
        config_path = f'{ANIMATIONS_PATH}/{directory}/config.json'
        anim_config = {}
        if os.path.exists(config_path):
            try:
                with open(config_path) as f:
                    anim_config = json.load(f)
                is_set = True
            except Exception as e:
                decky_plugin.logger.warning(f'Failed to parse config.json for: {directory}', exc_info=e)
        else:
            for video in [BOOT_VIDEO, SUSPEND_VIDEO, THROBBER_VIDEO]:
                if os.path.exists(f'{ANIMATIONS_PATH}/{directory}/{video}'):
                    is_set = True
                    break
        if not is_set:
            continue

        local_set = {
            'id': directory,
            'enabled': anim_config['enabled'] if 'enabled' in anim_config else True
        }

        def process_animation(default, anim_type, target):
            filename = default if anim_type not in anim_config else anim_config[anim_type]
            if anim_type not in anim_config and not os.path.exists(f'{ANIMATIONS_PATH}/{directory}/{filename}'):
                filename = ''
            local_set[anim_type] = filename
            if filename != '' and filename is not None:
                animations.append({
                    'id': f'{directory}/{filename}',
                    'name': directory if anim_type == 'boot' else f'{directory} - {anim_type.capitalize()}',
                    'target': target
                })

        for i in range(3):
            process_animation(VIDEOS_NAMES[i], VIDEO_TYPES[i], VIDEO_TARGETS[i])

        sets.append(local_set)

    local_animations = animations
    local_sets = sets


def find_cached_animation(anim_id):
    for anim in animation_cache:
        if anim['id'] == anim_id:
            return anim
    return None


def apply_animation(video, anim_id):
    override_path = f'{OVERRIDE_PATH}/{video}'
    if os.path.islink(override_path) or os.path.exists(override_path):
        os.remove(override_path)

    if anim_id == '':
        return

    path = None
    for anim in config['downloads']:
        if anim['id'] == anim_id:
            path = f'{DOWNLOADS_PATH}/{anim_id}.webm'
            break
    else:
        for anim in config['custom_animations']:
            if anim['id'] == anim_id:
                path = anim['path']
                break
        else:
            for anim in local_animations:
                if anim['id'] == anim_id:
                    path = ANIMATIONS_PATH + '/' + anim_id
                    break

    if path is None or not os.path.exists(path):
        raise_and_log(f'Failed to find animation for: {anim_id}')

    os.symlink(path, override_path)


def apply_animations():
    for i in range(3):
        apply_animation(VIDEOS_NAMES[i], config[VIDEO_TYPES[i]])


def get_active_sets():
    return [entry for entry in local_sets + config['custom_sets'] if entry['enabled']]


def remove_custom_set(set_id):
    config['custom_sets'] = [entry for entry in config['custom_sets'] if entry['id'] != set_id]


def remove_custom_animation(anim_id):
    config['custom_animations'] = [anim for anim in config['custom_animations'] if anim['id'] != anim_id]


def randomize_current_set():
    active = get_active_sets()
    new_set = {'boot': '', 'suspend': '', 'throbber': ''}
    if len(active) > 0:
        new_set = active[random.randint(0, len(active) - 1)]
        config['current_set'] = new_set['id']
    for i in range(3):
        config[VIDEO_TYPES[i]] = new_set[VIDEO_TYPES[i]]['id']


def randomize_all():
    for i in range(3):
        pool = [
            anim for anim in local_animations + config['downloads'] + config['custom_animations']
            if anim['target'] == VIDEO_TARGETS[i] and anim['id'] not in config['shuffle_exclusions']
        ]
        if len(pool) > 0:
            config[VIDEO_TYPES[i]] = pool[random.randint(0, len(pool) - 1)]['id']
    config['current_set'] = ''


class Plugin:

    async def getState(self):
        """ Get backend state (animations, sets, and settings) """
        try:
            return {
                'local_animations': local_animations,
                'custom_animations': config['custom_animations'],
                'downloaded_animations': config['downloads'],
                'local_sets': local_sets,
                'custom_sets': config['custom_sets'],
                'settings': {
                    'randomize': config['randomize'],
                    'current_set': config['current_set'],
                    'boot': config['boot'],
                    'suspend': config['suspend'],
                    'throbber': config['throbber'],
                    'shuffle_exclusions': config['shuffle_exclusions'],
                    'force_ipv4': config['force_ipv4']
                }
            }
        except Exception as e:
            decky_plugin.logger.error('Failed to get state', exc_info=e)
            raise e

    async def saveCustomSet(self, set_entry):
        """ Save custom set entry """
        try:
            remove_custom_set(set_entry['id'])
            config['custom_sets'].append(set_entry)
            save_config()
        except Exception as e:
            decky_plugin.logger.error('Failed to save custom set', exc_info=e)
            raise e

    async def removeCustomSet(self, set_id):
        """ Remove custom set """
        try:
            remove_custom_set(set_id)
            save_config()
        except Exception as e:
            decky_plugin.logger.error('Failed to remove custom set', exc_info=e)
            raise e

    async def enableSet(self, set_id, enable):
        """ Enable or disable set """
        try:
            for entry in local_sets:
                if entry['id'] == set_id:
                    entry['enable'] = enable
                    with open(f'{ANIMATIONS_PATH}/{entry["name"]}/config.json', 'w') as f:
                        json.dump(entry, f)
                    return
            for entry in config['custom_sets']:
                if entry['id'] == set_id:
                    entry['enable'] = enable
                    save_config()
                    break
        except Exception as e:
            decky_plugin.logger.error('Failed to enable set', exc_info=e)
            raise e

    async def saveCustomAnimation(self, anim_entry):
        """ Save a custom animation entry """
        try:
            remove_custom_animation(anim_entry['id'])
            config['custom_animations'].append(anim_entry)
            save_config()
        except Exception as e:
            decky_plugin.logger.error('Failed to save custom animation', exc_info=e)
            raise e

    async def removeCustomAnimation(self, anim_id):
        """ Removes custom animation with name """
        try:
            remove_custom_animation(anim_id)
            save_config()
        except Exception as e:
            decky_plugin.logger.error('Failed to remove custom animation', exc_info=e)
            raise e

    async def updateAnimationCache(self):
        """ Update backend animation cache """
        try:
            await update_cache()
        except Exception as e:
            decky_plugin.logger.error('Failed to update animation cache', exc_info=e)
            raise e

    async def getCachedAnimations(self):
        """ Get cached repository animations """
        try:
            return {'animations': animation_cache}
        except Exception as e:
            decky_plugin.logger.error('Failed to get cached animations', exc_info=e)
            raise e

    async def getCachedAnimation(self, anim_id):
        """ Get a cached animation entry for id """
        try:
            return find_cached_animation(anim_id)
        except Exception as e:
            decky_plugin.logger.error('Failed to get cached animations', exc_info=e)
            raise e

    async def downloadAnimation(self, anim_id):
        """ Download a cached animation for id """
        try:
            for entry in config['downloads']:
                if entry['id'] == anim_id:
                    return
            async with aiohttp.ClientSession(connector=TCPConnector(family=socket.AF_INET) if config['force_ipv4'] else None) as web:
                if (anim := find_cached_animation(anim_id)) is None:
                    raise_and_log(f'Failed to find cached animation with id: {id}')
                async with web.get(anim['download_url'], ssl=ssl_ctx) as response:
                    if response.status != 200:
                        raise_and_log(f'Invalid download request status: {response.status}')
                    data = await response.read()
            with open(f'{DOWNLOADS_PATH}/{anim_id}.webm', 'wb') as f:
                f.write(data)
            config['downloads'].append(anim)
            save_config()
        except Exception as e:
            decky_plugin.logger.error('Failed to download animation', exc_info=e)
            raise e

    async def deleteAnimation(self, anim_id):
        """ Delete a downloaded animation """
        try:
            config['downloads'] = [entry for entry in config['downloads'] if entry['id'] != anim_id]
            save_config()
            os.remove(f'{DOWNLOADS_PATH}/{anim_id}.webm')
        except Exception as e:
            decky_plugin.logger.error('Failed to delete animation', exc_info=e)
            raise e

    async def saveSettings(self, settings):
        """ Save settings to config file """
        try:
            config.update(settings)
            save_config()
            apply_animations()
        except Exception as e:
            decky_plugin.logger.error('Failed to save settings', exc_info=e)
            raise e

    async def reloadConfiguration(self):
        """ Reload config file and local animations from disk """
        try:
            await load_config()
            load_local_animations()
            apply_animations()
        except Exception as e:
            decky_plugin.logger.error('Failed to reload configuration', exc_info=e)
            raise e

    async def randomize(self, shuffle):
        """ Randomize animations """
        try:
            if shuffle:
                randomize_all()
            else:
                randomize_current_set()
            save_config()
            apply_animations()
        except Exception as e:
            decky_plugin.logger.error('Failed to randomize animations', exc_info=e)
            raise e

    async def _main(self):
        decky_plugin.logger.info('Initializing...')

        try:
            os.makedirs(ANIMATIONS_PATH, exist_ok=True)
            os.makedirs(OVERRIDE_PATH, exist_ok=True)
            os.makedirs(os.path.dirname(CONFIG_PATH), exist_ok=True)
            os.makedirs(DOWNLOADS_PATH, exist_ok=True)
        except Exception as e:
            decky_plugin.logger.error('Failed to make plugin directories', exc_info=e)
            raise e

        try:
            await load_config()
            load_local_animations()
        except Exception as e:
            decky_plugin.logger.error('Failed to load config', exc_info=e)
            raise e

        try:
            if config['randomize'] == 'all':
                randomize_all()
            elif config['randomize'] == 'set':
                randomize_current_set()
        except Exception as e:
            decky_plugin.logger.error('Failed to randomize animations', exc_info=e)
            raise e

        try:
            apply_animations()
        except Exception as e:
            decky_plugin.logger.error('Failed to apply animations', exc_info=e)
            raise e

        await asyncio.sleep(5.0)
        if unloaded:
            return
        try:
            await update_cache()
        except Exception as e:
            decky_plugin.logger.error('Failed to update animation cache', exc_info=e)
            raise e

        decky_plugin.logger.info('Initialized')

    async def _unload(self):
        global unloaded
        unloaded = True
        decky_plugin.logger.info('Unloaded')

    async def _migration(self):
        decky_plugin.logger.info('Migrating')
        # `/tmp/animation_changer.log` will be migrated to `decky_plugin.DECKY_PLUGIN_LOG_DIR/template.log`
        decky_plugin.migrate_logs('/tmp/animation_changer.log')
        # `~/.config/AnimationChanger/config.json` will be migrated to `decky_plugin.DECKY_PLUGIN_SETTINGS_DIR/config.json`
        decky_plugin.migrate_settings(os.path.expanduser('~/.config/AnimationChanger/config.json'))
        # `~/homebrew/animations` will be migrated to `decky_plugin.DECKY_PLUGIN_RUNTIME_DIR/animations/`
        decky_plugin.migrate_any(ANIMATIONS_PATH, os.path.expanduser('~/homebrew/animations'))
        # `~/.config/AnimationChanger/downloads` will be migrated to `decky_plugin.DECKY_PLUGIN_RUNTIME_DIR/downloads/`
        decky_plugin.migrate_any(DOWNLOADS_PATH, os.path.expanduser('~/.config/AnimationChanger/downloads'))
