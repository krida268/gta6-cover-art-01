# Vice Light — Cover Studio

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/krida268/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/krida268/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Vice Light turns your own photos and a caption into GTA-poster-style cover art,
right in the browser. No upload, no account, no network: photos are read on your
machine and never leave it.

## What it does

- **Any photo** — add one or several photos from your machine (file picker or
  drag & drop), or load the bundled sample photos. Click a photo, then click a
  panel to place it there; drag a photo straight onto a panel to swap it in.
- **Multi-panel covers** — six layouts: Hero + Three, Four-Panel Grid,
  Full-Bleed + Strip, Tilted Snapshots, Duo Portrait, and a Nine-Panel Grid.
- **Crop and position per panel** — click a panel to select it, drag on the
  preview to pan its photo, scroll (or the zoom slider) to zoom, flip it, or
  centre it again.
- **Colour grades** — five grades: Vice Sunset, Neon Night, Palm Gold, Teal
  Pink, and Mono Noir. Each one washes the photos in a sunset/neon gradient
  and tints the lettering to match.
- **Bold lettering** — a big Anton title with a sunset gradient fill and white
  outline, plus a glowing Pacifico neon-script subtitle. Both are editable
  live, along with the badge ribbon text.
- **Finish** — film grain and vignette toggles, a badge ribbon, and a five-star
  heat meter that prints on the exported cover. Undo and redo are included.
- **Export** — one click exports a PNG in 1080 × 1080, 1080 × 1350, or
  1920 × 1080.

## How to run it

```sh
node serve.ts
```

Then open http://localhost:8080 in desktop Chrome. The app is plain static
files under `app/` with no build step: `app/index.html` works from any static
server and makes no network request. Fonts (Anton and Pacifico, SIL Open Font
License — see `app/fonts/OFL-*.txt`) and the two sample photos are vendored
under `app/`.

## How a cover is made

1. Add photos (or press **Load sample photo**).
2. Pick a layout and a colour grade.
3. Type the title and subtitle.
4. Click panels to place photos, drag to pan, scroll to zoom.
5. Press an export button — a PNG downloads at the size you chose.

## Files

- `app/index.html` — the editor page
- `app/style.css` — the editor chrome
- `app/src/cover.js` — the canvas cover engine (layouts, grades, lettering,
  grain, vignette, badge, heat meter)
- `app/src/main.js` — editor state, photo tray, pan/zoom, undo/redo, export
- `app/src/shots.js` — `?shot=cover` and `?shot=editor` scenes used for the
  screenshots in `screenshots/`
- `app/fonts/` — Anton and Pacifico (SIL OFL) with their licence texts
- `app/samples/` — two sample photos made with an image model for make.fun,
  free to use
- `main.ts` — the entry program: copies `app/` and `screenshots/` to the
  output directory and writes `dossier.json`

## Licence

MIT — see `LICENSE`. All artwork, lettering and layouts are original; nothing
here is Rockstar Games artwork, a logo, or a game font.
