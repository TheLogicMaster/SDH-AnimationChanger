import json
import logging
import os
import random
import ssl
import aiohttp
import certifi
from aiohttp import ClientSession

CONFIG_PATH = '/home/deck/.config/AnimationChanger/config.json'
ANIMATIONS_PATH = '/home/deck/homebrew/animations'
OVERRIDE_PATH = '/home/deck/.steam/root/config/uioverrides/movies'
DOWNLOADS_PATH = '/home/deck/.config/AnimationChanger/downloads'

BOOT_VIDEO = 'deck_startup.webm'
SUSPEND_VIDEO = 'deck-suspend-animation.webm'
THROBBER_VIDEO = 'deck-suspend-animation-from-throbber.webm'

VIDEOS_NAMES = [BOOT_VIDEO, SUSPEND_VIDEO, THROBBER_VIDEO]
VIDEO_TYPES = ['boot', 'suspend', 'throbber']
VIDEO_TARGETS = ['boot', 'suspend', 'suspend']

REQUEST_RETRIES = 5

logging.basicConfig(filename="/tmp/animation_changer.log",
                    format='[Animation Changer] %(asctime)s %(levelname)s %(message)s',
                    filemode='w+',
                    force=True)
logger = logging.getLogger()
logger.setLevel(logging.INFO)

ssl_ctx = ssl.create_default_context(cafile=certifi.where())

config = {}
local_animations = []
local_sets = []
animation_cache = []


async def get_steamdeckrepo():
    try:
        animations = []
        page = 1
        while True:
            for _ in range(REQUEST_RETRIES):
                async with ClientSession() as web:
                    async with web.request(
                            'get',
                            f'https://steamdeckrepo.com/api/posts?page={page}',
                            ssl=ssl_ctx
                    ) as res:
                        if res.status == 200:
                            data = (await res.json())['posts']
                            break
                        logger.warning('steamdeckrepo fetch failed, retrying')
            else:
                raise Exception('Failed to fetch steamdeckrepo')
            if len(data) == 0:
                break
            animations += [{
                'id': entry['id'],
                'name': entry['title'],
                'preview_image': entry['thumbnail'],
                'preview_video': entry['video_preview'],
                'author': entry['user']['steam_name'],
                'description': entry['content'],
                'last_changed': entry['updated_at'],  # Todo: Ensure consistent date format
                'source': entry['url'],
                'download_url': entry['video'],
                'likes': entry['likes'],
                'downloads': entry['downloads'],
                'version': '',
                'target': 'suspend' if entry['type'] == 'suspend_video' else 'boot',
                'manifest_version': 1
            } for entry in data if entry['type'] in ['suspend_video', 'boot_video']]
            page += 1
        return animations
    except Exception as e:
        logger.error('Failed to fetch steamdeckrepo', exc_info=e)
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
            logger.error(f'Failed to find cached entry for id: {anim_id}')
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
    }

    async def save_new():
        try:
            await regenerate_downloads()
            save_config()
        except Exception as ex:
            logger.error('Failed to save new config', exc_info=ex)

    if os.path.exists(CONFIG_PATH):
        try:
            with open(CONFIG_PATH) as f:
                config.update(json.load(f))
                if type(config['randomize']) == bool:
                    config['randomize'] = ''
        except Exception as e:
            logger.error('Failed to load config', exc_info=e)
            await save_new()
    else:
        await save_new()


def raise_and_log(msg, ex=None):
    logger.error(msg, exc_info=ex)
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
                logger.warning(f'Failed to parse config.json for: {directory}', exc_info=e)
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
                'shuffle_exclusions': config['shuffle_exclusions']
            }
        }

    async def saveCustomSet(self, set_entry):
        """ Save custom set entry """
        remove_custom_set(set_entry['id'])
        config['custom_sets'].append(set_entry)
        save_config()

    async def removeCustomSet(self, set_id):
        """ Remove custom set """
        remove_custom_set(set_id)
        save_config()

    async def enableSet(self, set_id, enable):
        """ Enable or disable set """
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

    async def saveCustomAnimation(self, anim_entry):
        """ Save a custom animation entry """
        remove_custom_animation(anim_entry['id'])
        config['custom_animations'].append(anim_entry)
        save_config()

    async def removeCustomAnimation(self, anim_id):
        """ Removes custom animation with name """
        remove_custom_animation(anim_id)
        save_config()

    async def updateAnimationCache(self):
        """ Update backend animation cache """
        await update_cache()

    async def getCachedAnimations(self):
        """ Get cached repository animations """
        return {'animations': animation_cache}

    async def getCachedAnimation(self, anim_id):
        """ Get a cached animation entry for id """
        return find_cached_animation(anim_id)

    async def downloadAnimation(self, anim_id):
        """ Download a cached animation for id """
        for entry in config['downloads']:
            if entry['id'] == anim_id:
                return
        async with aiohttp.ClientSession() as web:
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

    async def deleteAnimation(self, anim_id):
        """ Delete a downloaded animation """
        config['downloads'] = [entry for entry in config['downloads'] if entry['id'] != anim_id]
        save_config()
        os.remove(f'{DOWNLOADS_PATH}/{anim_id}.webm')

    async def saveSettings(self, settings):
        """ Save settings to config file """
        config.update(settings)
        save_config()
        apply_animations()

    async def reloadConfiguration(self):
        """ Reload config file and local animations from disk """
        await load_config()
        load_local_animations()
        apply_animations()

    async def randomize(self, shuffle):
        """ Randomize animations """
        if shuffle:
            randomize_all()
        else:
            randomize_current_set()
        save_config()
        apply_animations()

    async def _main(self):
        logger.info('Initializing...')

        os.makedirs(ANIMATIONS_PATH, exist_ok=True)
        os.makedirs(OVERRIDE_PATH, exist_ok=True)
        os.makedirs(os.path.dirname(CONFIG_PATH), exist_ok=True)
        os.makedirs(DOWNLOADS_PATH, exist_ok=True)

        await load_config()
        load_local_animations()

        if config['randomize'] == 'all':
            randomize_all()
        elif config['randomize'] == 'set':
            randomize_current_set()

        try:
            apply_animations()
        except:
            ...

        try:
            await update_cache()
        except:
            ...

        logger.info('Initialized')
