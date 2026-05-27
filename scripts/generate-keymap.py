#!/usr/bin/env python3
"""Generate EXTENDED_KEYMAP JSON and PLAY_NOTE_LAYER bash cases for piano.sh."""
from __future__ import annotations

import json
import re
from pathlib import Path

CHROMATIC = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
MIDI_MIN, MIDI_MAX = 21, 108

CLASSIC = {
    "z": "G3",
    "x": "A3",
    "n": "B3",
    "w": "C#4",
    "e": "D#4",
    "t": "F#4",
    "y": "G#4",
    "u": "A#4",
    "a": "C4",
    "s": "D4",
    "d": "E4",
    "f": "F4",
    "g": "G4",
    "h": "A4",
    "j": "B4",
    "k": "C5",
}
RESERVED_LOWER = set("bciopv")
RESERVED_UPPER = set("RMLBONP")

FULL_STRIP = [
    ("z", "Z"),
    ("x", "X"),
    ("c", "C"),
    ("v", "V"),
    ("n", "N"),
    ("m", "M"),
    ("a", "A"),
    ("s", "S"),
    ("d", "D"),
    ("f", "F"),
    ("g", "G"),
    ("h", "H"),
    ("j", "J"),
    ("k", "K"),
    ("l", "L"),
    ("q", "Q"),
    ("w", "W"),
    ("e", "E"),
    (None, None),
    ("t", "T"),
    ("y", "Y"),
    ("u", "U"),
    ("i", "I"),
]
HIGH_STRIP = [
    ("q", "Q"),
    ("w", "W"),
    ("e", "E"),
    ("t", "T"),
    ("y", "Y"),
    ("u", "U"),
    ("i", "I"),
    ("a", "A"),
    ("s", "S"),
    ("d", "D"),
    ("f", "F"),
    ("g", "G"),
    ("h", "H"),
    ("j", "J"),
    ("k", "K"),
    ("l", "L"),
    ("z", "Z"),
    ("x", "X"),
    ("v", "V"),
    ("m", "M"),
]


def midi_to_note(m: int) -> str:
    return CHROMATIC[m % 12] + str(m // 12 - 1)


def note_to_midi(n: str) -> int:
    m = re.match(r"^([A-G])(#|b)?(\d+)$", n)
    if not m:
        raise ValueError(n)
    names = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}
    midi = names[m[1]] + (int(m[3]) + 1) * 12
    if m[2] == "#":
        midi += 1
    if m[2] == "b":
        midi -= 1
    return midi


def keys_from_strip(strip) -> list[str]:
    out: list[str] = []
    for lo, hi in strip:
        if lo and lo not in RESERVED_LOWER:
            out.append(lo)
        if hi and hi not in RESERVED_UPPER:
            out.append(hi)
    return out


def assign_band(notes: list[str], strip) -> list[tuple[str, str]]:
    keys = keys_from_strip(strip)
    if len(keys) < len(notes):
        raise SystemExit(f"need {len(notes)} keys, have {len(keys)}")
    return list(zip(keys[: len(notes)], notes))


def build_assignments() -> list[dict]:
    all_notes = [midi_to_note(m) for m in range(MIDI_MIN, MIDI_MAX + 1)]
    assignments: list[dict] = []

    for key, note in CLASSIC.items():
        assignments.append({"note": note, "key": key, "layer": None, "bash": None})

    low_notes = [n for n in all_notes if note_to_midi(n) < 55]
    gap_notes = [n for n in all_notes if note_to_midi(n) in (56, 58)]
    high_notes = [n for n in all_notes if note_to_midi(n) > 72]

    for key, note in assign_band(low_notes, FULL_STRIP):
        assignments.append({"note": note, "key": key, "layer": "r", "bash": "r"})
    for key, note in zip(["i", "I"], gap_notes):
        assignments.append({"note": note, "key": key, "layer": "l", "bash": "l"})
    for key, note in assign_band(high_notes, HIGH_STRIP):
        assignments.append({"note": note, "key": key, "layer": "j", "bash": "j"})

    if len(assignments) != 88:
        raise SystemExit(f"expected 88 assignments, got {len(assignments)}")
    if len({a["note"] for a in assignments}) != 88:
        raise SystemExit("duplicate notes in assignments")
    return assignments


def bash_case_lines(extended: list[dict]) -> list[str]:
    """One case per (layer, key); use ':' delimiter — '|' is bash case alternation."""
    seen: set[tuple[str, str]] = set()
    lines = []
    for a in extended:
        pair = (a["layer"], a["key"])
        if pair in seen:
            raise SystemExit(f"duplicate layer+key: {pair}")
        seen.add(pair)
        lines.append(f'        {a["layer"]}:{a["key"]}) PLAY_NOTE "{a["note"]}" ;;')
    return lines


def patch_piano_sh(piano_path: Path, extended: list[dict]) -> None:
    text = piano_path.read_text()
    json_line = json.dumps(extended, separators=(",", ":"))
    text = re.sub(
        r"# EXTENDED_KEYMAP_BEGIN\n.*?\n# EXTENDED_KEYMAP_END",
        f"# EXTENDED_KEYMAP_BEGIN\n{json_line}\n# EXTENDED_KEYMAP_END",
        text,
        flags=re.S,
    )
    cases = "\n".join(bash_case_lines(extended))
    text = re.sub(
        r"PLAY_NOTE_LAYER\(\) \{[\s\S]*?\n\}",
        "PLAY_NOTE_LAYER() {\n    case \"$1:$2\" in\n"
        + cases
        + "\n        *) ;;\n    esac\n}",
        text,
    )
    piano_path.write_text(text)


def main() -> None:
    assignments = build_assignments()
    extended = [a for a in assignments if a["layer"]]
    root = Path(__file__).resolve().parents[1]
    patch_piano_sh(root / "piano.sh", extended)
    print(f"Updated {root / 'piano.sh'} with {len(extended)} layered mappings")


if __name__ == "__main__":
    main()
