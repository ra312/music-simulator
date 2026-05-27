# 🎹 Bash Piano — piano-like tone using SoX
# Requires: brew install sox
#
# Classic Mac keys: ~1.5 octaves (G3–C5) for play-along songs.
# Full 88-key range (A0–C8): octave layers — see # EXTENDED_KEYMAP below.

PLAY_NOTE() {
    play -q -n \
        synth 1.8 pluck "$1" \
        fade h 0.005 1.8 1.6 \
        reverb 40 50 80 \
        gain -n -3 \
        2>/dev/null &
}

# Play one phrase of Twinkle Twinkle (1–6)
PLAY_TWINKLE_PHRASE() {
    local notes=() times=()
    case "$1" in
        1) notes=(C4 C4 G4 G4 A4 A4 G4)
           times=(0.45 0.45 0.45 0.45 0.45 0.45 0.9) ;;
        2) notes=(F4 F4 E4 E4 D4 D4 C4)
           times=(0.45 0.45 0.45 0.45 0.45 0.45 1.0) ;;
        3) notes=(G4 G4 F4 F4 E4 E4 D4)
           times=(0.45 0.45 0.45 0.45 0.45 0.45 0.9) ;;
        4) notes=(G4 G4 F4 F4 E4 E4 D4)
           times=(0.45 0.45 0.45 0.45 0.45 0.45 0.9) ;;
        5) notes=(C4 C4 G4 G4 A4 A4 G4)
           times=(0.45 0.45 0.45 0.45 0.45 0.45 0.9) ;;
        6) notes=(F4 F4 E4 E4 D4 D4 C4)
           times=(0.45 0.45 0.45 0.45 0.45 0.45 1.0) ;;
        *) return 1 ;;
    esac
    for i in "${!notes[@]}"; do
        PLAY_NOTE "${notes[i]}"
        sleep "${times[i]}"
    done
}

PLAY_TWINKLE() {
    for p in 1 2 3 4 5 6; do
        PLAY_TWINKLE_PHRASE "$p"
        sleep 0.12
    done
}

# Play one phrase of We Wish You a Merry Christmas (1–6)
PLAY_XMAS_PHRASE() {
    local notes=() times=()
    case "$1" in
        1) notes=(G3 C4 C4 E4 G4 C4)
           times=(0.45 0.45 0.45 0.45 0.45 0.9) ;;
        2) notes=(G3 C4 C4 E4 G4 C4)
           times=(0.45 0.45 0.45 0.45 0.45 0.9) ;;
        3) notes=(G3 C4 C4 E4 G4 C4 D4 E4 D4 C4)
           times=(0.45 0.45 0.45 0.45 0.45 0.45 0.45 0.45 0.45 1.0) ;;
        4) notes=(E4 E4 E4 E4 E4 D4 C4 D4 E4 F4 D4 C4)
           times=(0.4 0.4 0.4 0.4 0.4 0.4 0.4 0.4 0.4 0.4 0.4 1.0) ;;
        5) notes=(E4 D4 C4 C4 B3 A3 A3 D4 D4 C4)
           times=(0.45 0.45 0.45 0.45 0.45 0.45 0.45 0.45 0.45 1.0) ;;
        6) notes=(G3 G3 F4 G3 G3 F4 G3 C4)
           times=(0.45 0.45 0.45 0.45 0.45 0.45 0.45 1.0) ;;
        *) return 1 ;;
    esac
    for i in "${!notes[@]}"; do
        PLAY_NOTE "${notes[i]}"
        sleep "${times[i]}"
    done
}

PLAY_XMAS() {
    for p in 1 2 3 4 5 6; do
        PLAY_XMAS_PHRASE "$p"
        sleep 0.12
    done
}

# Play one phrase of Five Little Ducks (1–6)
PLAY_DUCKS_PHRASE() {
    local notes=() times=()
    case "$1" in
        1) notes=(G4 G4 G4 D4 E4 E4 D4)
           times=(0.45 0.45 0.45 0.45 0.45 0.45 0.9) ;;
        2) notes=(E4 E4 D4 B3 C4 C4)
           times=(0.45 0.45 0.45 0.45 0.45 1.0) ;;
        3) notes=(C4 C4 D4 E4 G4 G4 G4)
           times=(0.45 0.45 0.45 0.45 0.45 0.45 0.9) ;;
        4) notes=(G4 G4 G4 D4 E4 E4 C4)
           times=(0.45 0.45 0.45 0.45 0.45 0.45 1.0) ;;
        5) notes=(G4 G4 G4 D4 E4 E4 D4)
           times=(0.45 0.45 0.45 0.45 0.45 0.45 0.9) ;;
        6) notes=(G4 G4 G4 D4 E4 E4 C4)
           times=(0.45 0.45 0.45 0.45 0.45 0.45 1.0) ;;
        *) return 1 ;;
    esac
    for i in "${!notes[@]}"; do
        PLAY_NOTE "${notes[i]}"
        sleep "${times[i]}"
    done
}

PLAY_DUCKS() {
    for p in 1 2 3 4 5 6; do
        PLAY_DUCKS_PHRASE "$p"
        sleep 0.12
    done
}

# Play one phrase of London Bridge (1–4)
PLAY_BRIDGE_PHRASE() {
    local notes=() times=()
    case "$1" in
        1) notes=(G4 A4 G4 F4 E4 F4 G4)
           times=(0.45 0.45 0.45 0.45 0.45 0.45 0.9) ;;
        2) notes=(D4 E4 F4 E4 F4 G4 A4 G4)
           times=(0.45 0.45 0.45 0.45 0.45 0.45 0.45 0.9) ;;
        3) notes=(G4 A4 G4 F4 E4 F4 G4)
           times=(0.45 0.45 0.45 0.45 0.45 0.45 0.9) ;;
        4) notes=(C5 C5 B4 A4 G4)
           times=(0.45 0.45 0.45 0.45 1.0) ;;
        *) return 1 ;;
    esac
    for i in "${!notes[@]}"; do
        PLAY_NOTE "${notes[i]}"
        sleep "${times[i]}"
    done
}

PLAY_BRIDGE() {
    for p in 1 2 3 4; do
        PLAY_BRIDGE_PHRASE "$p"
        sleep 0.12
    done
}

# Play one phrase of Ойся ты ойся (Oysya ty oysya) — RH melody, 6 phrases
PLAY_OYSYA_PHRASE() {
    local notes=() times=()
    case "$1" in
        1) notes=(A4 A4 G4 A4 D4 A4 A4 G4 F4 E4)
           times=(0.45 0.45 0.45 0.45 0.45 0.45 0.45 0.45 0.45 0.9) ;;
        2) notes=(E4 E4 D4 E4 F4 G4 G4 G4 A4 G4)
           times=(0.45 0.45 0.45 0.45 0.45 0.45 0.45 0.45 0.45 0.9) ;;
        3) notes=(F4 E4 D4 D4 A4 A4 G4 A4 D4)
           times=(0.45 0.45 0.45 0.45 0.45 0.45 0.45 0.45 0.9) ;;
        4) notes=(A4 A4 G4 F4 E4 E4 E4 D4 E4 F4)
           times=(0.45 0.45 0.45 0.45 0.45 0.45 0.45 0.45 0.45 0.9) ;;
        5) notes=(G4 G4 G4 A4 G4 F4 E4 D4 D4 A4)
           times=(0.45 0.45 0.45 0.45 0.45 0.45 0.45 0.45 0.45 0.9) ;;
        6) notes=(A4 G4 A4 D4 A4 A4 G4 F4 E4 E4)
           times=(0.45 0.45 0.45 0.45 0.45 0.45 0.45 0.45 0.45 0.9) ;;
        *) return 1 ;;
    esac
    for i in "${!notes[@]}"; do
        PLAY_NOTE "${notes[i]}"
        sleep "${times[i]}"
    done
}

PLAY_OYSYA() {
    for p in 1 2 3 4 5 6; do
        PLAY_OYSYA_PHRASE "$p"
        sleep 0.12
    done
}

# Play one phrase of Golden (HUNTR/X / Huntrix) — chorus simplified, 6 phrases
PLAY_GOLDEN_PHRASE() {
    local notes=() times=()
    case "$1" in
        1) notes=(G4 A4 B4 B4 G4 A4 B4 B4)
           times=(0.45 0.45 0.45 0.45 0.45 0.45 0.45 0.9) ;;
        2) notes=(B3 B3 E4 E4 E4)
           times=(0.45 0.45 0.45 0.45 0.9) ;;
        3) notes=(B3 B3 D4 D4 A3)
           times=(0.45 0.45 0.45 0.45 0.9) ;;
        4) notes=(D4 D4 D4 D4 C4 C4 C4 B3)
           times=(0.45 0.45 0.45 0.45 0.45 0.45 0.45 0.9) ;;
        5) notes=(D4 D4 D4 D4 C4 C4 C4 B3)
           times=(0.45 0.45 0.45 0.45 0.45 0.45 0.45 0.9) ;;
        6) notes=(E4 E4 G4 F#4 E4 D4 D4 A3)
           times=(0.45 0.45 0.45 0.45 0.45 0.45 0.45 0.9) ;;
        *) return 1 ;;
    esac
    for i in "${!notes[@]}"; do
        PLAY_NOTE "${notes[i]}"
        sleep "${times[i]}"
    done
}

PLAY_GOLDEN() {
    for p in 1 2 3 4 5 6; do
        PLAY_GOLDEN_PHRASE "$p"
        sleep 0.12
    done
}

# Play one phrase of Takedown (HUNTR/X / KPop Demon Hunters) — hook simplified, 6 phrases
PLAY_TAKEDOWN_PHRASE() {
    local notes=() times=()
    case "$1" in
        1) notes=(C#4 G#4 C#4 G#4)
           times=(0.45 0.45 0.45 0.9) ;;
        2) notes=(A4 G#4 G#4 F#4 G#4)
           times=(0.45 0.45 0.45 0.45 0.9) ;;
        3) notes=(B4 G#4 B4 G#4 B4 G#4 B4 G#4 C#4 G#4)
           times=(0.45 0.45 0.45 0.45 0.45 0.45 0.45 0.45 0.45 0.9) ;;
        4) notes=(C#4 G#4 C#4 G#4 A4 A4 F#4 G#4)
           times=(0.45 0.45 0.45 0.45 0.45 0.45 0.45 0.9) ;;
        5) notes=(C#4 C#4 C#4 D#4 C#4 C#4 C#4)
           times=(0.45 0.45 0.45 0.45 0.45 0.45 0.9) ;;
        6) notes=(G#4 G#4 C#4 F#4 F#4 F#4)
           times=(0.45 0.45 0.45 0.45 0.45 0.9) ;;
        *) return 1 ;;
    esac
    for i in "${!notes[@]}"; do
        PLAY_NOTE "${notes[i]}"
        sleep "${times[i]}"
    done
}

PLAY_TAKEDOWN() {
    for p in 1 2 3 4 5 6; do
        PLAY_TAKEDOWN_PHRASE "$p"
        sleep 0.12
    done
}

# --- Full 88-key range (A0–C8): octave layers on classic keys ---
# Web: hold modifier(s) + note key. Terminal: \\ then layer letter then note key.
#   Layer │ Web modifiers        │ Bash \\+ │ Offset
#   low2  │ Ctrl+Alt (⌃⌥)        │ a        │ −3 octaves
#   low1  │ Alt (⌥)              │ s        │ −2 octaves
#   down  │ Control (⌃)          │ d        │ −1 octave
#   up    │ Shift (⇧)            │ g        │ +1 octave
#   high1 │ Shift+Alt (⇧⌥)       │ h        │ +2 octaves
#   high2 │ Shift+Ctrl (⇧⌃)      │ j        │ +3 octaves
#   abyss │ Shift+Ctrl+Alt (⇧⌃⌥) │ u + U    │ A#0 only
# EXTENDED_KEYMAP_BEGIN
[{"mods":["control","alt"],"key":"x","note":"A0","bash":"a"},{"mods":["control","alt"],"key":"n","note":"B0","bash":"a"},{"mods":["control","alt"],"key":"w","note":"C#1","bash":"a"},{"mods":["control","alt"],"key":"e","note":"D#1","bash":"a"},{"mods":["control","alt"],"key":"t","note":"F#1","bash":"a"},{"mods":["control","alt"],"key":"y","note":"G#1","bash":"a"},{"mods":["control","alt"],"key":"u","note":"A#1","bash":"a"},{"mods":["control","alt"],"key":"a","note":"C1","bash":"a"},{"mods":["control","alt"],"key":"s","note":"D1","bash":"a"},{"mods":["control","alt"],"key":"d","note":"E1","bash":"a"},{"mods":["control","alt"],"key":"f","note":"F1","bash":"a"},{"mods":["control","alt"],"key":"g","note":"G1","bash":"a"},{"mods":["control","alt"],"key":"h","note":"A1","bash":"a"},{"mods":["control","alt"],"key":"j","note":"B1","bash":"a"},{"mods":["control","alt"],"key":"k","note":"C2","bash":"a"},{"mods":["alt"],"key":"w","note":"C#2","bash":"s"},{"mods":["alt"],"key":"e","note":"D#2","bash":"s"},{"mods":["alt"],"key":"t","note":"F#2","bash":"s"},{"mods":["alt"],"key":"y","note":"G#2","bash":"s"},{"mods":["alt"],"key":"u","note":"A#2","bash":"s"},{"mods":["alt"],"key":"s","note":"D2","bash":"s"},{"mods":["alt"],"key":"d","note":"E2","bash":"s"},{"mods":["alt"],"key":"f","note":"F2","bash":"s"},{"mods":["alt"],"key":"g","note":"G2","bash":"s"},{"mods":["alt"],"key":"h","note":"A2","bash":"s"},{"mods":["alt"],"key":"j","note":"B2","bash":"s"},{"mods":["alt"],"key":"k","note":"C3","bash":"s"},{"mods":["control"],"key":"w","note":"C#3","bash":"d"},{"mods":["control"],"key":"e","note":"D#3","bash":"d"},{"mods":["control"],"key":"t","note":"F#3","bash":"d"},{"mods":["control"],"key":"y","note":"G#3","bash":"d"},{"mods":["control"],"key":"u","note":"A#3","bash":"d"},{"mods":["control"],"key":"s","note":"D3","bash":"d"},{"mods":["control"],"key":"d","note":"E3","bash":"d"},{"mods":["control"],"key":"f","note":"F3","bash":"d"},{"mods":["shift"],"key":"w","note":"C#5","bash":"g"},{"mods":["shift"],"key":"e","note":"D#5","bash":"g"},{"mods":["shift"],"key":"t","note":"F#5","bash":"g"},{"mods":["shift"],"key":"y","note":"G#5","bash":"g"},{"mods":["shift"],"key":"u","note":"A#5","bash":"g"},{"mods":["shift"],"key":"s","note":"D5","bash":"g"},{"mods":["shift"],"key":"d","note":"E5","bash":"g"},{"mods":["shift"],"key":"f","note":"F5","bash":"g"},{"mods":["shift"],"key":"g","note":"G5","bash":"g"},{"mods":["shift"],"key":"h","note":"A5","bash":"g"},{"mods":["shift"],"key":"j","note":"B5","bash":"g"},{"mods":["shift"],"key":"k","note":"C6","bash":"g"},{"mods":["shift","alt"],"key":"w","note":"C#6","bash":"h"},{"mods":["shift","alt"],"key":"e","note":"D#6","bash":"h"},{"mods":["shift","alt"],"key":"t","note":"F#6","bash":"h"},{"mods":["shift","alt"],"key":"y","note":"G#6","bash":"h"},{"mods":["shift","alt"],"key":"u","note":"A#6","bash":"h"},{"mods":["shift","alt"],"key":"s","note":"D6","bash":"h"},{"mods":["shift","alt"],"key":"d","note":"E6","bash":"h"},{"mods":["shift","alt"],"key":"f","note":"F6","bash":"h"},{"mods":["shift","alt"],"key":"g","note":"G6","bash":"h"},{"mods":["shift","alt"],"key":"h","note":"A6","bash":"h"},{"mods":["shift","alt"],"key":"j","note":"B6","bash":"h"},{"mods":["shift","alt"],"key":"k","note":"C7","bash":"h"},{"mods":["shift","control"],"key":"w","note":"C#7","bash":"j"},{"mods":["shift","control"],"key":"e","note":"D#7","bash":"j"},{"mods":["shift","control"],"key":"t","note":"F#7","bash":"j"},{"mods":["shift","control"],"key":"y","note":"G#7","bash":"j"},{"mods":["shift","control"],"key":"u","note":"A#7","bash":"j"},{"mods":["shift","control"],"key":"s","note":"D7","bash":"j"},{"mods":["shift","control"],"key":"d","note":"E7","bash":"j"},{"mods":["shift","control"],"key":"f","note":"F7","bash":"j"},{"mods":["shift","control"],"key":"g","note":"G7","bash":"j"},{"mods":["shift","control"],"key":"h","note":"A7","bash":"j"},{"mods":["shift","control"],"key":"j","note":"B7","bash":"j"},{"mods":["shift","control"],"key":"k","note":"C8","bash":"j"},{"mods":["shift","control","alt"],"key":"u","note":"A#0","bash":"u"}]
# EXTENDED_KEYMAP_END

PLAY_NOTE_EXTENDED() {
    case "$1|$2" in
        a|x|a|X) PLAY_NOTE "A0" ;;
        a|n|a|N) PLAY_NOTE "B0" ;;
        a|w|a|W) PLAY_NOTE "C#1" ;;
        a|e|a|E) PLAY_NOTE "D#1" ;;
        a|t|a|T) PLAY_NOTE "F#1" ;;
        a|y|a|Y) PLAY_NOTE "G#1" ;;
        a|u|a|U) PLAY_NOTE "A#1" ;;
        a|a|a|A) PLAY_NOTE "C1" ;;
        a|s|a|S) PLAY_NOTE "D1" ;;
        a|d|a|D) PLAY_NOTE "E1" ;;
        a|f|a|F) PLAY_NOTE "F1" ;;
        a|g|a|G) PLAY_NOTE "G1" ;;
        a|h|a|H) PLAY_NOTE "A1" ;;
        a|j|a|J) PLAY_NOTE "B1" ;;
        a|k|a|K) PLAY_NOTE "C2" ;;
        s|w|s|W) PLAY_NOTE "C#2" ;;
        s|e|s|E) PLAY_NOTE "D#2" ;;
        s|t|s|T) PLAY_NOTE "F#2" ;;
        s|y|s|Y) PLAY_NOTE "G#2" ;;
        s|u|s|U) PLAY_NOTE "A#2" ;;
        s|s|s|S) PLAY_NOTE "D2" ;;
        s|d|s|D) PLAY_NOTE "E2" ;;
        s|f|s|F) PLAY_NOTE "F2" ;;
        s|g|s|G) PLAY_NOTE "G2" ;;
        s|h|s|H) PLAY_NOTE "A2" ;;
        s|j|s|J) PLAY_NOTE "B2" ;;
        s|k|s|K) PLAY_NOTE "C3" ;;
        d|w|d|W) PLAY_NOTE "C#3" ;;
        d|e|d|E) PLAY_NOTE "D#3" ;;
        d|t|d|T) PLAY_NOTE "F#3" ;;
        d|y|d|Y) PLAY_NOTE "G#3" ;;
        d|u|d|U) PLAY_NOTE "A#3" ;;
        d|s|d|S) PLAY_NOTE "D3" ;;
        d|d|d|D) PLAY_NOTE "E3" ;;
        d|f|d|F) PLAY_NOTE "F3" ;;
        g|w|g|W) PLAY_NOTE "C#5" ;;
        g|e|g|E) PLAY_NOTE "D#5" ;;
        g|t|g|T) PLAY_NOTE "F#5" ;;
        g|y|g|Y) PLAY_NOTE "G#5" ;;
        g|u|g|U) PLAY_NOTE "A#5" ;;
        g|s|g|S) PLAY_NOTE "D5" ;;
        g|d|g|D) PLAY_NOTE "E5" ;;
        g|f|g|F) PLAY_NOTE "F5" ;;
        g|g|g|G) PLAY_NOTE "G5" ;;
        g|h|g|H) PLAY_NOTE "A5" ;;
        g|j|g|J) PLAY_NOTE "B5" ;;
        g|k|g|K) PLAY_NOTE "C6" ;;
        h|w|h|W) PLAY_NOTE "C#6" ;;
        h|e|h|E) PLAY_NOTE "D#6" ;;
        h|t|h|T) PLAY_NOTE "F#6" ;;
        h|y|h|Y) PLAY_NOTE "G#6" ;;
        h|u|h|U) PLAY_NOTE "A#6" ;;
        h|s|h|S) PLAY_NOTE "D6" ;;
        h|d|h|D) PLAY_NOTE "E6" ;;
        h|f|h|F) PLAY_NOTE "F6" ;;
        h|g|h|G) PLAY_NOTE "G6" ;;
        h|h|h|H) PLAY_NOTE "A6" ;;
        h|j|h|J) PLAY_NOTE "B6" ;;
        h|k|h|K) PLAY_NOTE "C7" ;;
        j|w|j|W) PLAY_NOTE "C#7" ;;
        j|e|j|E) PLAY_NOTE "D#7" ;;
        j|t|j|T) PLAY_NOTE "F#7" ;;
        j|y|j|Y) PLAY_NOTE "G#7" ;;
        j|u|j|U) PLAY_NOTE "A#7" ;;
        j|s|j|S) PLAY_NOTE "D7" ;;
        j|d|j|D) PLAY_NOTE "E7" ;;
        j|f|j|F) PLAY_NOTE "F7" ;;
        j|g|j|G) PLAY_NOTE "G7" ;;
        j|h|j|H) PLAY_NOTE "A7" ;;
        j|j|j|J) PLAY_NOTE "B7" ;;
        j|k|j|K) PLAY_NOTE "C8" ;;
        u|u|u|U) PLAY_NOTE "A#0" ;;
        *) ;;
    esac
}


clear
cat <<'EOF'
==========================================
          🎹  BASH PIANO  🎹
     Two-Row Mac Keyboard (Twin Towers)
==========================================

  TOP ROW — Black keys (sharps) above the gaps:
      [W]=C#  [E]=D#     (skip R — no black key between E & F)
      [T]=F#  [Y]=G#  [U]=A#

  HOME ROW — White keys (walk down the street):
      [A]=C  [S]=D  [D]=E  [F]=F  [G]=G  [H]=A  [J]=B  [K]=C↑

  LOW NOTES (below / left of home row):
      [Z]=G↓  [X]=A↓  [N]=B↓

  Twin Towers: [W] and [E] are the two black keys upstairs.
  Front door:  [A] downstairs left of the towers = Middle C (C4).

   Twinkle Twinkle:
   [R] = full song   [1]–[6] = one phrase   (T = F# black key)

   Merry Christmas:
   [M] = full song   [7][8][9][0][-][=] = phrases 1–6

   Five Little Ducks:
   [L] = full song   [,][.][/][;][[]] = phrases 1–6

   London Bridge:
   [!] = full song   [I][O][P][V] = phrases 1–4

   Ойся ты ойся (Oysya ty oysya):
   [&] = full song   [?][@][#][$][%][^] = phrases 1–6

   Golden (HUNTR/X / Huntrix):
   [|] = full song   [space][`][(][)][']["] = phrases 1–6

  FULL 88 KEYS (A0–C8) — same note keys, octave layers:
   Web: hold modifier + key (classic layer = no modifier).
   Terminal: type [\] then layer letter (a/s/d/g/h/j) then note key.
     low2 [\][a]  Ctrl+Alt     |  low1 [\][s]  Alt
     down [\][d]  Control      |  up   [\][g]  Shift
     high1[\][h]  Shift+Alt    |  high2[\][j]  Shift+Control
     A#0 only: [\][u][U]  Shift+Control+Alt

 ── Twinkle Twinkle — play along with keys ──

   [1] C C G G A A G     Twinkle, twinkle, little star
       A A G G H H G

   [2] F F E E D D C     How I wonder what you are
       F F D D S S A

   [3] G G F F E E D     Up above the world so high
       G G F F D D S

   [4] G G F F E E D     Like a diamond in the sky
       G G F F D D S

   [5] C C G G A A G     Twinkle, twinkle, little star
       A A G G H H G

   [6] F F E E D D C     How I wonder what you are
       F F D D S S A

 ── Merry Christmas — play along with keys ──

   [7] G C C E G C       We wish you a Merry Christmas
       Z A A D G A

   [8] G C C E G C       We wish you a Merry Christmas
       Z A A D G A

   [9] G C C E G C D E D C   and a Happy New Year
       Z A A D G A S D S A

   [0] E E E E E D C D E F D C   Good tidings we bring
       D D D D D S A S D F S A

   [-] E D C C B A A D D C   Good tidings for Christmas
       D S A A N X X S S A

   [=] G G F G G F G C   Oh bring us some figgy pudding
       Z Z F Z Z F Z A

 ── Five Little Ducks — play along with keys ──

   [,] G G G D E E D     Five little ducks went out one day
       G G G S D D S

   [.] E E D B C C       Over the hills and far away
       D D S N A A

   [/] C C D E G G G     Mother duck said, Quack, quack, quack, quack
       A A S D G G G

   [;] G G G D E E C     But only four little ducks came back
       G G G S D D A

   [[] G G G D E E D     Four little ducks went out one day
       G G G S D D S

   []] G G G D E E C     But only three little ducks came back
       G G G S D D A

 ── London Bridge — play along with keys ──

   [I] G A G F E F G     London Bridge is falling down
       G H G F D F G

   [O] D E F E F G A G   Falling down, falling down
       S D F D F G H G

   [P] G A G F E F G     London Bridge is falling down
       G H G F D F G

   [V] C C B A G         My fair lady
       K K J H G

 ── Ойся ты ойся — play along with keys ──

   [?] A A G A D A A G F E     Ойся ты ойся, ты меня не бойся
       H H G H S H H G F D

   [@] E E D E F G G G A G     (melody continues)
       D D S D F G G G H G

   [#] F E D D A A G A D
       F D S S H H G H S

   [$] A A G F E E E D E F
       H H G F D D D S D F

   [%] G G G A G F E D D A
       G G G H G F D S S H

   [^] A G A D A A G F E E
       H G H S H H G F D D

 ── Golden — play along with keys ──

   [ ] G A B B G A B B     (verse hook)
       G H J J G H J J

   [`] B B E E E           We're goin' up
       N N D D D

   [(] B B D D A           It's our moment
       N N S S X

   [)] D D D D C C C B     glowin'
       S S S S A A A N

   ['] D D D D C C C B     golden
       S S S S A A A N

   ["] E E G T E D D A     up with our voices
       D D G T D S S X

 ── Takedown (HUNTR/X) — play along with keys ──

   [b] W Y W Y           Takedown, takedown
       W U W U

   [B] H Y Y T Y         Takedown, down, down, down
       H U U F U

   [c] J Y J Y J Y J Y W Y   I don't think you're ready for the takedown
       J U J U J U J U W U

   [C] W Y W Y H H T Y   Woah-oh, da-da-da, down
       W U W U H H F U

   [~] W W W E W W W     So sweet, so easy on the eyes
       W W W D W W W

   [+] Y Y W T T T       Ima gear up and take you down
       U U W F F F

   [_] play full Takedown (all phrases)

   [Q] = quit
==========================================
EOF

while true; do
    read -r -s -n 1 key
    case "$key" in
        z|Z) PLAY_NOTE "G3" ;;
        x|X) PLAY_NOTE "A3" ;;
        n|N) PLAY_NOTE "B3" ;;
        w|W) PLAY_NOTE "C#4" ;;
        e|E) PLAY_NOTE "D#4" ;;
        t|T) PLAY_NOTE "F#4" ;;
        y|Y) PLAY_NOTE "G#4" ;;
        u|U) PLAY_NOTE "A#4" ;;
        a|A) PLAY_NOTE "C4" ;;
        s|S) PLAY_NOTE "D4" ;;
        d|D) PLAY_NOTE "E4" ;;
        f|F) PLAY_NOTE "F4" ;;
        g|G) PLAY_NOTE "G4" ;;
        h|H) PLAY_NOTE "A4" ;;
        j|J) PLAY_NOTE "B4" ;;
        k|K) PLAY_NOTE "C5" ;;
        1) PLAY_TWINKLE_PHRASE 1 ;;
        2) PLAY_TWINKLE_PHRASE 2 ;;
        3) PLAY_TWINKLE_PHRASE 3 ;;
        4) PLAY_TWINKLE_PHRASE 4 ;;
        5) PLAY_TWINKLE_PHRASE 5 ;;
        6) PLAY_TWINKLE_PHRASE 6 ;;
        7) PLAY_XMAS_PHRASE 1 ;;
        8) PLAY_XMAS_PHRASE 2 ;;
        9) PLAY_XMAS_PHRASE 3 ;;
        0) PLAY_XMAS_PHRASE 4 ;;
        -) PLAY_XMAS_PHRASE 5 ;;
        =) PLAY_XMAS_PHRASE 6 ;;
        ,|,) PLAY_DUCKS_PHRASE 1 ;;
        .|.) PLAY_DUCKS_PHRASE 2 ;;
        /|/) PLAY_DUCKS_PHRASE 3 ;;
        \;|;) PLAY_DUCKS_PHRASE 4 ;;
        \[|\[) PLAY_DUCKS_PHRASE 5 ;;
        \]|]) PLAY_DUCKS_PHRASE 6 ;;
        r|R) PLAY_TWINKLE ;;
        m|M) PLAY_XMAS ;;
        l|L) PLAY_DUCKS ;;
        i|I) PLAY_BRIDGE_PHRASE 1 ;;
        o|O) PLAY_BRIDGE_PHRASE 2 ;;
        p|P) PLAY_BRIDGE_PHRASE 3 ;;
        v|V) PLAY_BRIDGE_PHRASE 4 ;;
        !|!) PLAY_BRIDGE ;;
        ?|?) PLAY_OYSYA_PHRASE 1 ;;
        @|@) PLAY_OYSYA_PHRASE 2 ;;
        \#|#) PLAY_OYSYA_PHRASE 3 ;;
        \$|$) PLAY_OYSYA_PHRASE 4 ;;
        %|%) PLAY_OYSYA_PHRASE 5 ;;
        ^|^) PLAY_OYSYA_PHRASE 6 ;;
        &|&) PLAY_OYSYA ;;
        \ |'') PLAY_GOLDEN_PHRASE 1 ;;
        \`|`) PLAY_GOLDEN_PHRASE 2 ;;
        \(|() PLAY_GOLDEN_PHRASE 3 ;;
        \)|)) PLAY_GOLDEN_PHRASE 4 ;;
        \'|') PLAY_GOLDEN_PHRASE 5 ;;
        \"|") PLAY_GOLDEN_PHRASE 6 ;;
        \|'|`) PLAY_GOLDEN ;;
        b) PLAY_TAKEDOWN_PHRASE 1 ;;
        B) PLAY_TAKEDOWN_PHRASE 2 ;;
        c) PLAY_TAKEDOWN_PHRASE 3 ;;
        C) PLAY_TAKEDOWN_PHRASE 4 ;;
        ~) PLAY_TAKEDOWN_PHRASE 5 ;;
        +) PLAY_TAKEDOWN_PHRASE 6 ;;
        _|_) PLAY_TAKEDOWN ;;
        \\)
            read -r -s -n 1 layer
            read -r -s -n 1 nk
            PLAY_NOTE_EXTENDED "$layer" "$nk"
            ;;
        q|Q) echo -e "\n👋 Bye!"; break ;;
    esac
done
