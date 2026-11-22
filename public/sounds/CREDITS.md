# UI sound credits

Each cue ships as `.webm` (Opus) and `.mp3`, mono, peak-normalised to -3 dBFS.
`src/utils/sound.ts` picks the format the browser supports and sets per-cue gain.

| Cue | Source | Licence |
|---|---|---|
| click | "SFX UI Button Click" by suntemple, Freesound #253168 (found via Openverse): https://freesound.org/people/suntemple/sounds/253168 | CC0 1.0 |
| open | earshot `open/drawer` | rendered by earshot (MIT); output belongs to this project |
| close | earshot `close/drawer` | as above |
| success | earshot `success/rise` (0.9 s) | as above |
| error | earshot `ui/error_buzz` | as above |
| power | earshot `power_up/rise` (1.3 s) | as above |
| jump | earshot `jump/chip` | as above |
| hit | earshot `hurt/chip` | as above |

earshot: https://github.com/Leonxlnx/earshot
