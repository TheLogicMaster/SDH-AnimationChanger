import json
import logging
import os
import random

CONFIG_PATH = '/home/deck/.config/AnimationChanger/config.json'
ANIMATIONS_PATH = '/home/deck/homebrew/animations'
OVERRIDE_PATH = '/home/deck/.steam/root/config/uioverrides/movies'
BOOT_VIDEO = 'deck_startup.webm'
SUSPEND_VIDEO = 'deck-suspend-animation.webm'
THROBBER_VIDEO = 'deck-suspend-animation-from-throbber.webm'

logging.basicConfig(filename="/tmp/animation_changer.log",
                    format='[Animation Changer] %(asctime)s %(levelname)s %(message)s',
                    filemode='w+',
                    force=True)
logger = logging.getLogger()
logger.setLevel(logging.INFO)

config = {}


def apply_animation(video, path):
    if path is None:
        return

    override_path = f'{OVERRIDE_PATH}/{video}'
    if os.path.exists(override_path):
        os.remove(override_path)

    if config['name'] == '' or path == '':
        return

    target_path = f'{ANIMATIONS_PATH}/{config["name"]}/{path}'
    if os.path.exists(target_path):
        os.symlink(target_path, override_path)


def apply_config():
    animation = {
        'themes': None,
        'boot': BOOT_VIDEO,
        'suspend': SUSPEND_VIDEO,
        'throbber': THROBBER_VIDEO
    }

    path = f'{ANIMATIONS_PATH}/{config["name"]}/config.json'
    if config["name"] != '' and os.path.exists(path):
        with open(path) as f:
            animation.update(json.load(f))

    apply_animation(BOOT_VIDEO, animation['boot'])
    apply_animation(SUSPEND_VIDEO, animation['suspend'])
    apply_animation(THROBBER_VIDEO, animation['throbber'])


class Plugin:

    async def loadConfig(self):
        global config
        config = {'randomize': False, 'name': ''}

        if os.path.exists(CONFIG_PATH):
            with open(CONFIG_PATH) as f:
                config.update(json.load(f))
            logger.info(f'Loaded: {config}')
        else:
            logger.info('Using default config')

        config['animations'] = next(os.walk(ANIMATIONS_PATH))[1]
        logger.info(f'Found: {config["animations"]}')

        config['current'] = 0
        for i in range(len(config['animations'])):
            if config['animations'][i] == config['name']:
                config['current'] = i + 1
                break
        else:
            config['name'] = ''

        return config

    async def saveConfig(self, current, randomize):
        if current > len(config['animations']):
            current = 0
        config['current'] = current
        config['name'] = config['animations'][current - 1] if current > 0 else ''
        config['randomize'] = randomize

        data = config.copy()
        del data['animations']
        del data['current']

        logger.info(f'Saving: {data}')

        with open(CONFIG_PATH, "w") as f:
            json.dump(data, f, indent=4)

        apply_config()

    async def _main(self):
        logger.info('Initializing...')

        os.makedirs(ANIMATIONS_PATH, exist_ok=True)
        os.makedirs(OVERRIDE_PATH, exist_ok=True)
        os.makedirs(os.path.dirname(CONFIG_PATH), exist_ok=True)

        await self.loadConfig(self)
        if config['randomize'] and len(config['animations']) > 0:
            current = random.randint(1, len(config['animations']))
            await self.saveConfig(self, current, config['randomize'])
            logger.info(f'Randomized to {config["name"]}')
        else:
            apply_config()

        logger.info('Initialized')
