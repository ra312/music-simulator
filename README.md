# Music Simulator

A simple piano simulator with a terminal interface and a browser GUI. All key, note, and song phrase mappings live in **`piano.sh`** — the web UI loads and parses that file at runtime.

## Two-row Mac keyboard (Twin Towers)

The piano uses the standard **two-row** layout:

| Row | Keys | Notes |
|-----|------|-------|
| **Top (black keys)** | W E · T Y U | C♯ D♯ — F♯ G♯ A♯ (R is empty — no key between E and F) |
| **Home (white keys)** | A S D F G H J K | C D E F G A B C (high) |
| **Low** | Z X N | G3 A3 B3 |

- **Twin Towers:** W and E are the two black keys above A–S.
- **Front door:** A = middle C (C4).
- **Twinkle full song:** R (not T — T is F♯).
- **Five Little Ducks phrases:** `,` `.` `/` `;` `[` `]`
- **London Bridge phrases:** `I` `O` `P` `V` — full song `!`
- **Ойся ты ойся (Oysya):** phrases `?` `@` `#` `$` `%` `^` — full song `&`
- **Golden (HUNTR/X / Huntrix):** phrases `space` `` ` `` `(` `)` `'` `"` — full song `|`

Melody for Oysya is a simplified RH arrangement from public piano-letter tutorials (Synthesia-style); MIDI export can be added later from the phrase notes in `piano.sh`.

Golden uses a simplified chorus hook (G3–C5) from the K-pop demo track; phrase keys avoid conflicts with other songs on the Mac layout.

## Terminal piano (SoX)

```bash
brew install sox
chmod +x piano.sh
./piano.sh
```

## Web piano (Web Audio)

```bash
cd /path/to/music_simulator
python3 -m http.server 8080
```

Open [http://localhost:8080/web/](http://localhost:8080/web/)

The page shows a **Mac keyboard map** (two rows, ~1½ octaves for songs) plus a **scrollable 88-key piano** (A0–C8, 52 white + 36 black keys). Click or tap any key to play via Web Audio; frequencies use MIDI 21–108 (A0 = 27.5 Hz). Scroll horizontally on narrow screens to reach low and high notes — the view starts centered on middle C (C4). Mapped Mac keys from `piano.sh` are highlighted in gold. Use **Cover keys** or **Practice** on a phrase to hide key hints while learning; toggle **All note labels** to show every pitch name (default: C notes only on white keys).

## Host online for free

This project is static files only (HTML + `piano.sh`). No server code required.

### Option 1: GitHub Pages (recommended)

1. Create a GitHub repository and push this folder:

```bash
cd /path/to/music_simulator
git init
git add .
git commit -m "Music simulator piano"
git branch -M main
git remote add origin https://github.com/YOUR_USER/music_simulator.git
git push -u origin main
```

2. On GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

3. After the workflow runs, open:

`https://YOUR_USER.github.io/music_simulator/web/`

The workflow file is [`.github/workflows/pages.yml`](.github/workflows/pages.yml).

### Option 2: Netlify Drop (no Git)

1. Zip the whole `music_simulator` folder.
2. Go to [https://app.netlify.com/drop](https://app.netlify.com/drop) and drag the zip.
3. Open `https://YOUR-SITE.netlify.app/web/`

### Option 3: Cloudflare Pages

1. Connect your GitHub repo at [https://pages.cloudflare.com/](https://pages.cloudflare.com/).
2. Build command: *(none)* · Output directory: `/` (repo root).
3. Visit `https://YOUR_PROJECT.pages.dev/web/`

**Note:** The app loads `piano.sh` from the parent folder (`../piano.sh`). Keep `piano.sh` at the repo root next to `web/` — do not deploy only the `web/` folder alone.

## Project layout

```
music_simulator/
├── piano.sh
├── web/
│   ├── index.html
│   ├── styles.css
│   └── app.js
└── README.md
```
