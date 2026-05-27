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

## Full 88 keys from the keyboard (A0–C8)

The **classic mapping above is unchanged** — use it for songs and learning (G3–C5). To play any key on the 88-key piano, use **octave layers** on the same physical note keys (`Z` `X` `N`, `W` `E` `T` `Y` `U`, `A`–`K`):

| Layer | Web (hold) | Terminal `./piano.sh` | Approx. range |
|-------|------------|-------------------------|---------------|
| **Classic** | *(none)* | press key directly | G3–C5 |
| **low2** | Ctrl+Alt (⌃⌥) | `\` then `a` then note | A0–C2 |
| **low1** | Alt (⌥) | `\` then `s` then note | C♯2–C3 |
| **down** | Control (⌃) | `\` then `d` then note | C♯3–F3 |
| **up** | Shift (⇧) | `\` then `g` then note | C♯5–C6 |
| **high1** | Shift+Alt (⇧⌥) | `\` then `h` then note | C♯6–C7 |
| **high2** | Shift+Control (⇧⌃) | `\` then `j` then note | C♯7–**C8** |
| **A♯0** | Shift+Ctrl+Alt + `U` | `\` `u` `U` | A♯0 only |

**Examples:** `Shift+K` → C6 · `Ctrl+Alt+X` → A0 · `Shift+Ctrl+K` → C8 · `A` alone → C4 (middle C).

Mappings are defined in `piano.sh` between `# EXTENDED_KEYMAP_BEGIN` / `# EXTENDED_KEYMAP_END` (JSON). The web UI parses this block; the terminal uses `PLAY_NOTE_EXTENDED` (same offsets).

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

The page shows a **Mac keyboard map** (classic two rows for songs) plus an **octave-layer table** for the full range, and a **scrollable 88-key piano** (A0–C8). Click or tap any key, or use the computer keyboard: classic keys without modifiers, extended keys with modifier layers (see table above). Mapped keys are highlighted in gold (classic letter or modifier hint like ⇧K). **Cover keys** hides hints on both the Mac guide and the piano; **Practice** on a phrase hides hints on phrase cards too.

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
