# 🎹 Bash Piano — piano-like tone using SoX
# Requires: brew install sox
#
# Mac keyboard maps ~1.5 octaves (G3–C5) for play-along songs.
# Full 88-key range (A0–C8) is available in the web UI only (web/app.js).

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
        q|Q) echo -e "\n👋 Bye!"; break ;;
    esac
done
