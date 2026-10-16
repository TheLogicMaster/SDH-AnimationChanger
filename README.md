# Animation Changer
This is a Steam Deck Homebrew plugin for easily changing boot/suspend animations and randomizing
on boot.

![screenshot](./assets/screenshot.png)

## Plugin Usage
Use the plugin's animations browser to automatically browser and install animations from
[SteamDeckRepo](https://steamdeckrepo.com/). For now, only boot animations are available automatically. 
From the quick access menu, you can switch between animations or enable randomization on boot.
Ensure that the Startup Movie is set to `deck_startup.web` in the Settings Customization tab for
the custom animation to take effect.

## Fullscreen Suspend Animations
To get support for fullscreen suspend animations, check out the 
[CssLoader](https://github.com/suchmememanyskill/SDH-CssLoader) plugin with the `Full Suspend` theme.

## Manual Usage
This plugin looks in `$DECKY_HOME/homebrew/data/Animation Changer/animations` for directories containing sets of webm animation videos.
For example, directory `$DECKY_HOME/homebrew/data/Animation Changer/animations/Test`, which could contain any or all of the three
animation types.
The name of the directory is used as the animation label and each directory takes an optional
`config.json`. This allows specifying a relative path to each animation if different
from the default names. An empty string `""` or a missing file means to revert to the stock
animation when changing sets (Animation sets not implemented yet). `null` can be used to leave
the existing animation.
Press the reload button in the plugin's quick access menu page for manually added animations
to be detected. 

Example `config.json` configuration (Using default file names):
```json
{
   "boot": "deck_startup.webm",
   "suspend": "deck-suspend-animation.webm",
   "throbber": "deck-suspend-animation-from-throbber.webm"
}
```
`"boot"` refers to the main boot animation, `"suspend"` refers to the suspend animation played when
not in a game, and `"throbber"` refers to the animation played when suspending from in-game.

## Internals
- The main config file and downloaded animations are stored in `$DECKY_HOME/homebrew/settings/Animation Changer/`
- View the log file in `$DECKY_HOME/homebrew/logs/Animation Changer/`
- Animations get enabled by creating symlinks in the Steam root's `config/uioverrides/movies` directory.
  Existing `~/.steam/root` directories and symlink targets (including custom locations) are preserved.
  If that compatibility path does not exist yet, the plugin uses `~/.local/share/Steam` without
  creating `~/.steam/root`, leaving Steam free to create its own compatibility symlink.
  The path is resolved again when applying animations so a subsequently created Steam link is honored.
  This prevents new path collisions; an already malformed `~/.steam/root` directory is not
  automatically moved or deleted. Back up its contents before any manual repair.

## Backend tests
Run `python3 -m unittest discover -s tests -v` (standard library only).
The tests load backend functions with temporary home directories and stubbed Decky/network calls,
without importing optional plugin dependencies or starting Steam or Decky.
Run on Linux to include the Steam bootstrap regression using real Unix symlink semantics.

## Building
Install pnpm and run `pnpm i` in the repo directory. Build with: `pnpm run build`. Copying the
project to the SDH plugins directory ~/homebrew/plugins at this point will install it. The VSCode
task does this cleanly without any unnecessary files and handles file permissions. 
