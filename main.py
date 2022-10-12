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
animation_cache = []  # Todo: Use dictionary?


async def get_steamdeckrepo():
    try:
        animations = []
        page = 1
        while True:
            async with ClientSession() as web:
                async with web.request(
                        'get',
                        f'https://steamdeckrepo.com/api/posts?page={page}',
                        ssl=ssl_ctx
                ) as res:
                    data = (await res.json())['posts']
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
                'target': 'boot',
                'manifest_version': 1
            } for entry in data]
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


def regenerate_downloads():
    # Todo: Regenerate downloaded animation data
    ...


def load_config():
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
    }

    def save_new():
        regenerate_downloads()
        try:
            save_config()
        except Exception as ex:
            logger.error('Failed to save new config', exc_info=ex)

    if os.path.exists(CONFIG_PATH):
        try:
            with open(CONFIG_PATH) as f:
                config.update(json.load(f))
        except Exception as e:
            logger.error('Failed to load config', exc_info=e)
            save_new()
    else:
        save_new()


def save_config():
    try:
        with open(CONFIG_PATH, 'w') as f:
            json.dump(config, f, indent=4)
    except Exception as e:
        logger.error('Failed to save config', exc_info=e)
        raise e


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
                logger.error(f'Failed to parse config.json for: {directory}', exc_info=e)
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

        def process_animation(default, target):
            filename = default if target not in anim_config else anim_config[target]
            if target not in anim_config and not os.path.exists(f'{ANIMATIONS_PATH}/{directory}/{filename}'):
                filename = ''
            local_set[target] = filename
            if filename != '' and filename is not None:
                animations.append({
                    'id': f'{directory}/{filename}',
                    'name': directory,
                    'target': target
                })

        process_animation(BOOT_VIDEO, 'boot')
        process_animation(SUSPEND_VIDEO, 'suspend')
        process_animation(THROBBER_VIDEO, 'throbber')

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
    if os.path.exists(override_path):
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
        raise Exception(f'Failed to find animation for: {anim_id}')

    os.symlink(path, override_path)


def apply_animations():
    apply_animation(BOOT_VIDEO, config['boot'])
    apply_animation(SUSPEND_VIDEO, config['suspend'])
    apply_animation(THROBBER_VIDEO, config['throbber'])


def randomize_current_set():
    ...  # Todo: Randomize current set from active sets


def randomize_all():
    ...  # Todo: Randomize using pool of all enabled sets


class Plugin:

    async def getAllSets(self):
        """ Get all available sets """
        return {'sets': local_sets + config['custom_sets']}

    async def getLocalSets(self):
        """ Get all sets defined in animations directory """
        return {'sets': local_sets}

    async def getCustomSets(self):
        """ Get all custom set entries """
        return {'sets': config['custom_sets']}

    async def saveCustomSet(self, set_entry):
        """ Save custom set entry """
        ...

    async def removeCustomSet(self, set_id):
        """ Remove custom set """
        ...

    async def enableSet(self, set_id, enable):
        """ Enable or disable set """
        ...

    async def getAllAnimations(self):
        """ Get all available animations """
        return {'animations': local_animations + config['downloads'] + config['custom_animations']}

    async def getLocalAnimations(self):
        """ Get all animations in animations directory """
        return {'animations': local_animations}

    async def getDownloadedAnimations(self):
        """ Get all downloaded animations """
        return {'animations': config['downloads']}

    async def getCustomAnimations(self):
        """ Get all custom animation entries """
        return {'animations': config['custom_animations']}

    async def saveCustomAnimation(self, anim_entry):
        """ Save a custom animation entry """
        ...

    async def removeCustomAnimation(self, anim_id):
        """ Removes custom animation with name """
        ...

    async def updateAnimationCache(self):
        """ Update backend animation cache """
        await update_cache()

    async def getCachedAnimations(self):
        """
        Get cached repository animations
        """
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
                raise Exception(f'Failed to find cached animation with id: {id}')
            async with web.get(anim['download_url'], ssl=ssl_ctx) as response:
                if response.status != 200:
                    raise Exception(f'Invalid download request status: {response.status}')
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

    async def getSettings(self):
        """ Get config settings """
        return {
            'randomize': config['randomize'],
            'current_set': config['current_set'],
            'boot': config['boot'],
            'suspend': config['suspend'],
            'throbber': config['throbber']
        }

    async def saveSettings(self, settings):
        """ Save settings to config file """
        config.update(settings)
        save_config()
        apply_animations()

    async def reloadConfiguration(self):
        """ Reload config file and local animations from disk """
        load_config()
        load_local_animations()
        apply_animations()

    async def randomizeSet(self):
        """ Randomize the currently selected set """
        randomize_current_set()
        save_config()
        apply_animations()

    async def randomizeAll(self):
        """ Randomize using pool of all enabled set animations """
        randomize_all()
        save_config()
        apply_animations()

    async def _main(self):
        logger.info('Initializing...')

        os.makedirs(ANIMATIONS_PATH, exist_ok=True)
        os.makedirs(OVERRIDE_PATH, exist_ok=True)
        os.makedirs(os.path.dirname(CONFIG_PATH), exist_ok=True)
        os.makedirs(DOWNLOADS_PATH, exist_ok=True)

        load_config()
        load_local_animations()
        if config['randomize'] == 'set':
            randomize_current_set()
        elif config['randomize'] == 'all':
            randomize_all()
        apply_animations()

        try:
            await update_cache()
        except:
            ...

        logger.info('Initialized')
