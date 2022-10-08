# Animation Changer
This is a Steam Deck Homebrew plugin for easily changing boot/suspend animations and randomizing
on boot.

## Usage
This plugin looks in `~/homebrew/animations` for directories containing webm animation videos.
The name of the directory is used as the animation label and each directory takes an optional
`config.json`. This allows configuring specifying a relative path to each animation if different
from the default names. An empty string `""` or a missing file means to revert to the stock
animation. `null` can be used to leave the existing animation. Each selected animation will
be symlinked into the animation override directory. From the quick-access menu the current
animation can be changed along with enabling animation randomization. 

Example `config.json` configuration:
```json
{
   "boot": "deck_startup.webm",
   "suspend": "deck-suspend-animation.webm",
   "throbber": "deck-suspend-animation-from-throbber.webm"
}
```
`"boot"` refers to the main boot animation, `"suspend"` refers to the suspend animation played when
not in a game, and `"throbber"` refers to the animation played when suspending from in-game.
