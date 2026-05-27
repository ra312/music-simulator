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
- **Phrase keys (letters only):** `b` `c` `i` `o` `p` `v` (Bridge uses first 4).
- **Web behavior:** phrase keys trigger the currently selected song in the picker.
- **Terminal behavior:** phrase keys trigger the current active song (set when a full-song key is played).
- **Full-song keys (letters only):** Twinkle `R`, Christmas `M`, Ducks `L`, Bridge `B`, Oysya `O`, Golden `N`, Takedown `P`.

Melody for Oysya is a simplified RH arrangement from public piano-letter tutorials (Synthesia-style); MIDI export can be added later from the phrase notes in `piano.sh`.

Golden and Takedown use simplified chorus hooks (G3–C5, C♯ minor) from the K-pop soundtrack; all phrase/full controls now use letters only so terminal and web keyboard controls stay aligned.

## Full 88 keys from the keyboard (A0–C8)

The **classic home-row mapping is unchanged** for songs and learning (G3–C5). The piano UI labels keys with **note names only** (A0, C4, …); keyboard letters live in the Mac guide below the piano.

| Band | Web | Terminal `./piano.sh` | Range |
|------|-----|-------------------------|-------|
| **Classic** | press key | direct | G3–C5 (`Z` `X` `N`, `W` `E` `T` `Y` `U`, `A`–`K`) |
| **Low** | hold `r` + letter | `\` `r` + letter | A0–F♯3 (full QWERTY rows; uppercase = sharps) |
| **Gap** | hold `l` + `i` / `I` | `\` `l` `i` | G♯3, A♯3 |
| **High** | hold `j` + letter | `\` `j` + letter | C♯5–C8 (top row + extensions; uppercase = sharps) |

**Examples:** `A` → C4 · hold `r` and `z` → A0 · hold `j` and `K` → F7 · tap `j` alone → B4 · hold `l` and `i` → G♯3.

Phrase keys (`b` `c` `i` `o` `p` `v`) and full-song keys (`R` `M` `L` `B` `O` `N` `P`) are unchanged and do not fire while a layer key is held.

Mappings are defined in `piano.sh` between `# EXTENDED_KEYMAP_BEGIN` / `# EXTENDED_KEYMAP_END` (JSON). Regenerate with `python3 scripts/generate-keymap.py`. The web UI parses this block; the terminal uses `PLAY_NOTE_LAYER`.

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

The page shows a **Mac keyboard guide** (mini QWERTY layout, Key/Note/Play tables, and octave layer cards) plus a **scrollable 88-key piano** (A0–C8). **Choose a song** from the dropdown below the piano — only that song’s phrase cards are shown (your last choice is remembered in session storage). Click or tap any key, or use the computer keyboard. Piano keys show note names; optional single-letter hints when uncovered. **Cover keys** hides hints on the Mac guide and piano; **Practice** on a phrase hides hints on phrase cards too.

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
