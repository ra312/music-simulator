# 🎹 Bash Piano — piano-like tone using SoX
# Requires: brew install sox
#
# Classic Mac keys: ~1.5 octaves (G3–C5) for play-along songs.
# Full 88-key range (A0–C8): letter rows + hold layers r/l/j — see # EXTENDED_KEYMAP below.

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

# --- Full 88-key range (A0–C8): QWERTY rows + layers ---
# Classic (no layer): Z X N, W E T Y U, A–K — G3–C5 for songs.
# Layer r (low): hold r or \\ r then note — A0–F#3 on full letter rows.
# Layer l (gap): hold l or \\ l then note — G#3, A#3 on I / i.
# Layer j (high): hold j or \\ j then note — C#5–C8 on top/home rows.
# EXTENDED_KEYMAP_BEGIN
[{"note":"A0","key":"z","layer":"r","bash":"r"},{"note":"A#0","key":"Z","layer":"r","bash":"r"},{"note":"B0","key":"x","layer":"r","bash":"r"},{"note":"C1","key":"X","layer":"r","bash":"r"},{"note":"C#1","key":"C","layer":"r","bash":"r"},{"note":"D1","key":"V","layer":"r","bash":"r"},{"note":"D#1","key":"n","layer":"r","bash":"r"},{"note":"E1","key":"m","layer":"r","bash":"r"},{"note":"F1","key":"a","layer":"r","bash":"r"},{"note":"F#1","key":"A","layer":"r","bash":"r"},{"note":"G1","key":"s","layer":"r","bash":"r"},{"note":"G#1","key":"S","layer":"r","bash":"r"},{"note":"A1","key":"d","layer":"r","bash":"r"},{"note":"A#1","key":"D","layer":"r","bash":"r"},{"note":"B1","key":"f","layer":"r","bash":"r"},{"note":"C2","key":"F","layer":"r","bash":"r"},{"note":"C#2","key":"g","layer":"r","bash":"r"},{"note":"D2","key":"G","layer":"r","bash":"r"},{"note":"D#2","key":"h","layer":"r","bash":"r"},{"note":"E2","key":"H","layer":"r","bash":"r"},{"note":"F2","key":"j","layer":"r","bash":"r"},{"note":"F#2","key":"J","layer":"r","bash":"r"},{"note":"G2","key":"k","layer":"r","bash":"r"},{"note":"G#2","key":"K","layer":"r","bash":"r"},{"note":"A2","key":"l","layer":"r","bash":"r"},{"note":"A#2","key":"q","layer":"r","bash":"r"},{"note":"B2","key":"Q","layer":"r","bash":"r"},{"note":"C3","key":"w","layer":"r","bash":"r"},{"note":"C#3","key":"W","layer":"r","bash":"r"},{"note":"D3","key":"e","layer":"r","bash":"r"},{"note":"D#3","key":"E","layer":"r","bash":"r"},{"note":"E3","key":"t","layer":"r","bash":"r"},{"note":"F3","key":"T","layer":"r","bash":"r"},{"note":"F#3","key":"y","layer":"r","bash":"r"},{"note":"G#3","key":"i","layer":"l","bash":"l"},{"note":"A#3","key":"I","layer":"l","bash":"l"},{"note":"C#5","key":"q","layer":"j","bash":"j"},{"note":"D5","key":"Q","layer":"j","bash":"j"},{"note":"D#5","key":"w","layer":"j","bash":"j"},{"note":"E5","key":"W","layer":"j","bash":"j"},{"note":"F5","key":"e","layer":"j","bash":"j"},{"note":"F#5","key":"E","layer":"j","bash":"j"},{"note":"G5","key":"t","layer":"j","bash":"j"},{"note":"G#5","key":"T","layer":"j","bash":"j"},{"note":"A5","key":"y","layer":"j","bash":"j"},{"note":"A#5","key":"Y","layer":"j","bash":"j"},{"note":"B5","key":"u","layer":"j","bash":"j"},{"note":"C6","key":"U","layer":"j","bash":"j"},{"note":"C#6","key":"I","layer":"j","bash":"j"},{"note":"D6","key":"a","layer":"j","bash":"j"},{"note":"D#6","key":"A","layer":"j","bash":"j"},{"note":"E6","key":"s","layer":"j","bash":"j"},{"note":"F6","key":"S","layer":"j","bash":"j"},{"note":"F#6","key":"d","layer":"j","bash":"j"},{"note":"G6","key":"D","layer":"j","bash":"j"},{"note":"G#6","key":"f","layer":"j","bash":"j"},{"note":"A6","key":"F","layer":"j","bash":"j"},{"note":"A#6","key":"g","layer":"j","bash":"j"},{"note":"B6","key":"G","layer":"j","bash":"j"},{"note":"C7","key":"h","layer":"j","bash":"j"},{"note":"C#7","key":"H","layer":"j","bash":"j"},{"note":"D7","key":"j","layer":"j","bash":"j"},{"note":"D#7","key":"J","layer":"j","bash":"j"},{"note":"E7","key":"k","layer":"j","bash":"j"},{"note":"F7","key":"K","layer":"j","bash":"j"},{"note":"F#7","key":"l","layer":"j","bash":"j"},{"note":"G7","key":"z","layer":"j","bash":"j"},{"note":"G#7","key":"Z","layer":"j","bash":"j"},{"note":"A7","key":"x","layer":"j","bash":"j"},{"note":"A#7","key":"X","layer":"j","bash":"j"},{"note":"B7","key":"V","layer":"j","bash":"j"},{"note":"C8","key":"m","layer":"j","bash":"j"}]
# EXTENDED_KEYMAP_END

PLAY_NOTE_LAYER() {
    case "$1:$2" in
        r:z) PLAY_NOTE "A0" ;;
        r:Z) PLAY_NOTE "A#0" ;;
        r:x) PLAY_NOTE "B0" ;;
        r:X) PLAY_NOTE "C1" ;;
        r:C) PLAY_NOTE "C#1" ;;
        r:V) PLAY_NOTE "D1" ;;
        r:n) PLAY_NOTE "D#1" ;;
        r:m) PLAY_NOTE "E1" ;;
        r:a) PLAY_NOTE "F1" ;;
        r:A) PLAY_NOTE "F#1" ;;
        r:s) PLAY_NOTE "G1" ;;
        r:S) PLAY_NOTE "G#1" ;;
        r:d) PLAY_NOTE "A1" ;;
        r:D) PLAY_NOTE "A#1" ;;
        r:f) PLAY_NOTE "B1" ;;
        r:F) PLAY_NOTE "C2" ;;
        r:g) PLAY_NOTE "C#2" ;;
        r:G) PLAY_NOTE "D2" ;;
        r:h) PLAY_NOTE "D#2" ;;
        r:H) PLAY_NOTE "E2" ;;
        r:j) PLAY_NOTE "F2" ;;
        r:J) PLAY_NOTE "F#2" ;;
        r:k) PLAY_NOTE "G2" ;;
        r:K) PLAY_NOTE "G#2" ;;
        r:l) PLAY_NOTE "A2" ;;
        r:q) PLAY_NOTE "A#2" ;;
        r:Q) PLAY_NOTE "B2" ;;
        r:w) PLAY_NOTE "C3" ;;
        r:W) PLAY_NOTE "C#3" ;;
        r:e) PLAY_NOTE "D3" ;;
        r:E) PLAY_NOTE "D#3" ;;
        r:t) PLAY_NOTE "E3" ;;
        r:T) PLAY_NOTE "F3" ;;
        r:y) PLAY_NOTE "F#3" ;;
        l:i) PLAY_NOTE "G#3" ;;
        l:I) PLAY_NOTE "A#3" ;;
        j:q) PLAY_NOTE "C#5" ;;
        j:Q) PLAY_NOTE "D5" ;;
        j:w) PLAY_NOTE "D#5" ;;
        j:W) PLAY_NOTE "E5" ;;
        j:e) PLAY_NOTE "F5" ;;
        j:E) PLAY_NOTE "F#5" ;;
        j:t) PLAY_NOTE "G5" ;;
        j:T) PLAY_NOTE "G#5" ;;
        j:y) PLAY_NOTE "A5" ;;
        j:Y) PLAY_NOTE "A#5" ;;
        j:u) PLAY_NOTE "B5" ;;
        j:U) PLAY_NOTE "C6" ;;
        j:I) PLAY_NOTE "C#6" ;;
        j:a) PLAY_NOTE "D6" ;;
        j:A) PLAY_NOTE "D#6" ;;
        j:s) PLAY_NOTE "E6" ;;
        j:S) PLAY_NOTE "F6" ;;
        j:d) PLAY_NOTE "F#6" ;;
        j:D) PLAY_NOTE "G6" ;;
        j:f) PLAY_NOTE "G#6" ;;
        j:F) PLAY_NOTE "A6" ;;
        j:g) PLAY_NOTE "A#6" ;;
        j:G) PLAY_NOTE "B6" ;;
        j:h) PLAY_NOTE "C7" ;;
        j:H) PLAY_NOTE "C#7" ;;
        j:j) PLAY_NOTE "D7" ;;
        j:J) PLAY_NOTE "D#7" ;;
        j:k) PLAY_NOTE "E7" ;;
        j:K) PLAY_NOTE "F7" ;;
        j:l) PLAY_NOTE "F#7" ;;
        j:z) PLAY_NOTE "G7" ;;
        j:Z) PLAY_NOTE "G#7" ;;
        j:x) PLAY_NOTE "A7" ;;
        j:X) PLAY_NOTE "A#7" ;;
        j:V) PLAY_NOTE "B7" ;;
        j:m) PLAY_NOTE "C8" ;;
        *) ;;
    esac
}


clear
ACTIVE_SONG="twinkle"

PLAY_ACTIVE_PHRASE() {
    case "$ACTIVE_SONG" in
        twinkle) PLAY_TWINKLE_PHRASE "$1" ;;
        xmas) PLAY_XMAS_PHRASE "$1" ;;
        ducks) PLAY_DUCKS_PHRASE "$1" ;;
        bridge) PLAY_BRIDGE_PHRASE "$1" ;;
        oysya) PLAY_OYSYA_PHRASE "$1" ;;
        golden) PLAY_GOLDEN_PHRASE "$1" ;;
        takedown) PLAY_TAKEDOWN_PHRASE "$1" ;;
    esac
}

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

  Song phrase keys (letters only):
   [b][c][i][o][p][v] = phrases 1–6 for ACTIVE song
   Active song changes when you play a full song key.

  Full-song keys (letters only):
   Twinkle [R]   Christmas [M]   Ducks [L]
   Bridge [B]    Oysya [O]       Golden [N]    Takedown [P]

  FULL 88 KEYS (A0–C8) — letter rows + layers (see Mac guide on web):
   Classic: press note keys directly (G3–C5, same as above).
   Low A0–F#3: hold [r] then letter, or [\][r] then letter in terminal.
   Gap G#3–A#3: hold [l] then [i] or [I], or [\][l][i].
   High C#5–C8: hold [j] then letter, or [\][j] then letter.
   Layer [j] alone still plays [j]=B4 when released without another key.

 ── Twinkle Twinkle — play along with keys ──

  [b] C C G G A A G     Twinkle, twinkle, little star
       A A G G H H G

  [c] F F E E D D C     How I wonder what you are
       F F D D S S A

  [i] G G F F E E D     Up above the world so high
       G G F F D D S

  [o] G G F F E E D     Like a diamond in the sky
       G G F F D D S

  [p] C C G G A A G     Twinkle, twinkle, little star
       A A G G H H G

  [v] F F E E D D C     How I wonder what you are
       F F D D S S A

 ── Merry Christmas — play along with keys ──

  [b] G C C E G C       We wish you a Merry Christmas
       Z A A D G A

  [c] G C C E G C       We wish you a Merry Christmas
       Z A A D G A

  [i] G C C E G C D E D C   and a Happy New Year
       Z A A D G A S D S A

  [o] E E E E E D C D E F D C   Good tidings we bring
       D D D D D S A S D F S A

  [p] E D C C B A A D D C   Good tidings for Christmas
       D S A A N X X S S A

  [v] G G F G G F G C   Oh bring us some figgy pudding
       Z Z F Z Z F Z A

 ── Five Little Ducks — play along with keys ──

  [b] G G G D E E D     Five little ducks went out one day
       G G G S D D S

  [c] E E D B C C       Over the hills and far away
       D D S N A A

  [i] C C D E G G G     Mother duck said, Quack, quack, quack, quack
       A A S D G G G

  [o] G G G D E E C     But only four little ducks came back
       G G G S D D A

  [p] G G G D E E D     Four little ducks went out one day
       G G G S D D S

  [v] G G G D E E C     But only three little ducks came back
       G G G S D D A

 ── London Bridge — play along with keys ──

  [b] G A G F E F G     London Bridge is falling down
       G H G F D F G

  [c] D E F E F G A G   Falling down, falling down
       S D F D F G H G

  [i] G A G F E F G     London Bridge is falling down
       G H G F D F G

  [o] C C B A G         My fair lady
       K K J H G

 ── Ойся ты ойся — play along with keys ──

  [b] A A G A D A A G F E     Ойся ты ойся, ты меня не бойся
       H H G H S H H G F D

  [c] E E D E F G G G A G     (melody continues)
       D D S D F G G G H G

  [i] F E D D A A G A D
       F D S S H H G H S

  [o] A A G F E E E D E F
       H H G F D D D S D F

  [p] G G G A G F E D D A
       G G G H G F D S S H

  [v] A G A D A A G F E E
       H G H S H H G F D D

 ── Golden — play along with keys ──

  [b] G A B B G A B B     (verse hook)
       G H J J G H J J

  [c] B B E E E           We're goin' up
       N N D D D

  [i] B B D D A           It's our moment
       N N S S X

  [o] D D D D C C C B     glowin'
       S S S S A A A N

  [p] D D D D C C C B     golden
       S S S S A A A N

  [v] E E G T E D D A     up with our voices
       D D G T D S S X

 ── Takedown (HUNTR/X) — play along with keys ──

  [b] W Y W Y           Takedown, takedown
       W U W U

  [c] H Y Y T Y         Takedown, down, down, down
       H U U F U

  [i] J Y J Y J Y J Y W Y   I don't think you're ready for the takedown
       J U J U J U J U W U

  [o] W Y W Y H H T Y   Woah-oh, da-da-da, down
       W U W U H H F U

  [p] W W W E W W W     So sweet, so easy on the eyes
       W W W D W W W

  [v] Y Y W T T T       Ima gear up and take you down
       U U W F F F

  [P] play full Takedown (all phrases)

   [Q] = quit
==========================================
EOF

while true; do
    read -r -s -n 1 key
    case "$key" in
        z|z) PLAY_NOTE "G3" ;;
        x|x) PLAY_NOTE "A3" ;;
        n|n) PLAY_NOTE "B3" ;;
        w|w) PLAY_NOTE "C#4" ;;
        e|e) PLAY_NOTE "D#4" ;;
        t|t) PLAY_NOTE "F#4" ;;
        y|y) PLAY_NOTE "G#4" ;;
        u|u) PLAY_NOTE "A#4" ;;
        a|a) PLAY_NOTE "C4" ;;
        s|s) PLAY_NOTE "D4" ;;
        d|d) PLAY_NOTE "E4" ;;
        f|f) PLAY_NOTE "F4" ;;
        g|g) PLAY_NOTE "G4" ;;
        h|h) PLAY_NOTE "A4" ;;
        j|j) PLAY_NOTE "B4" ;;
        k|k) PLAY_NOTE "C5" ;;
        b) PLAY_ACTIVE_PHRASE 1 ;;
        c) PLAY_ACTIVE_PHRASE 2 ;;
        i) PLAY_ACTIVE_PHRASE 3 ;;
        o) PLAY_ACTIVE_PHRASE 4 ;;
        p) PLAY_ACTIVE_PHRASE 5 ;;
        v) PLAY_ACTIVE_PHRASE 6 ;;
        R) ACTIVE_SONG="twinkle"; PLAY_TWINKLE ;;
        M) ACTIVE_SONG="xmas"; PLAY_XMAS ;;
        L) ACTIVE_SONG="ducks"; PLAY_DUCKS ;;
        B) ACTIVE_SONG="bridge"; PLAY_BRIDGE ;;
        O) ACTIVE_SONG="oysya"; PLAY_OYSYA ;;
        N) ACTIVE_SONG="golden"; PLAY_GOLDEN ;;
        P) ACTIVE_SONG="takedown"; PLAY_TAKEDOWN ;;
        \\)
            read -r -s -n 1 layer
            read -r -s -n 1 nk
            PLAY_NOTE_LAYER "$layer" "$nk"
            ;;
        q|Q) echo -e "\n👋 Bye!"; break ;;
    esac
done
