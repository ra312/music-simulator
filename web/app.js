const PIANO_SH_URL = "../piano.sh";

/** Standard 88-key piano: A0 (MIDI 21) through C8 (MIDI 108). */
const MIDI_MIN = 21;
const MIDI_MAX = 108;
const CHROMATIC_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

const NOTE_NAMES = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

/** @param {number} midi */
function isBlackMidi(midi) {
  const pc = midi % 12;
  return pc === 1 || pc === 3 || pc === 6 || pc === 8 || pc === 10;
}

/** @param {number} midi */
function midiToNoteId(midi) {
  const octave = Math.floor(midi / 12) - 1;
  return CHROMATIC_NAMES[midi % 12] + octave;
}

/** @returns {{ whiteKeys: string[], blackAfterWhite: Record<string, string> }} */
function build88KeyLayout() {
  const whiteKeys = [];
  const midiByNote = new Map();

  for (let midi = MIDI_MIN; midi <= MIDI_MAX; midi++) {
    const noteId = midiToNoteId(midi);
    midiByNote.set(noteId, midi);
    if (!isBlackMidi(midi)) {
      whiteKeys.push(noteId);
    }
  }

  const blackAfterWhite = {};
  for (let i = 0; i < whiteKeys.length; i++) {
    const midi = midiByNote.get(whiteKeys[i]);
    const nextMidi = midi + 1;
    if (nextMidi <= MIDI_MAX && isBlackMidi(nextMidi)) {
      blackAfterWhite[whiteKeys[i]] = midiToNoteId(nextMidi);
    }
  }

  return { whiteKeys, blackAfterWhite };
}

const { whiteKeys: PIANO_WHITE_KEYS, blackAfterWhite: BLACK_KEY_AFTER_WHITE } =
  build88KeyLayout();

/** @type {Record<string, string>} */
const SONG_DISPLAY_ORDER = [
  "twinkle",
  "xmas",
  "ducks",
  "bridge",
  "oysya",
  "golden",
  "takedown",
];

const SELECTED_SONG_STORAGE_KEY = "music_simulator.selectedSong";

const SONG_META = {
  twinkle: {
    title: "Twinkle Twinkle Little Star",
    shortTitle: "Twinkle",
    fullKey: "R",
    phraseKeys: ["b", "c", "i", "o", "p", "v"],
    lyrics: [
      "Twinkle, twinkle, little star",
      "How I wonder what you are",
      "Up above the world so high",
      "Like a diamond in the sky",
      "Twinkle, twinkle, little star",
      "How I wonder what you are",
    ],
  },
  xmas: {
    title: "We Wish You a Merry Christmas",
    shortTitle: "Christmas",
    fullKey: "M",
    phraseKeys: ["b", "c", "i", "o", "p", "v"],
    lyrics: [
      "We wish you a Merry Christmas",
      "We wish you a Merry Christmas",
      "We wish you a Merry Christmas and a Happy New Year",
      "Good tidings we bring to you and your kin",
      "Good tidings for Christmas and a Happy New Year",
      "Oh bring us some figgy pudding",
    ],
  },
  ducks: {
    title: "Five Little Ducks",
    shortTitle: "Ducks",
    fullKey: "L",
    phraseKeys: ["b", "c", "i", "o", "p", "v"],
    lyrics: [
      "Five little ducks went out one day",
      "Over the hills and far away",
      "Mother duck said, Quack, quack, quack, quack",
      "But only four little ducks came back",
      "Four little ducks went out one day",
      "But only three little ducks came back",
    ],
  },
  bridge: {
    title: "London Bridge Is Falling Down",
    shortTitle: "Bridge",
    fullKey: "B",
    phraseKeys: ["b", "c", "i", "o"],
    lyrics: [
      "London Bridge is falling down",
      "Falling down, falling down",
      "London Bridge is falling down",
      "My fair lady",
    ],
  },
  oysya: {
    title: "Ойся ты ойся (Oysya ty oysya)",
    shortTitle: "Oysya",
    fullKey: "O",
    phraseKeys: ["b", "c", "i", "o", "p", "v"],
    lyrics: [
      "Ойся ты ойся, ты меня не бойся",
      "Ойся ты ойся, ты меня не бойся",
      "Ty menya ne boyasya",
      "Melody verse 4",
      "Melody verse 5",
      "Melody ending",
    ],
  },
  golden: {
    title: "Golden (HUNTR/X / Huntrix)",
    shortTitle: "Golden",
    fullKey: "N",
    phraseKeys: ["b", "c", "i", "o", "p", "v"],
    lyrics: [
      "Verse hook",
      "We're goin' up",
      "It's our moment",
      "glowin'",
      "golden",
      "up with our voices",
    ],
  },
  takedown: {
    title: "Takedown (KPop Demon Hunters)",
    shortTitle: "Takedown",
    fullKey: "P",
    phraseKeys: ["b", "c", "i", "o", "p", "v"],
    lyrics: [
      "Takedown, takedown",
      "Takedown, down, down, down",
      "I don't think you're ready for the takedown",
      "Woah-oh, da-da-da, down",
      "So sweet, so easy on the eyes",
      "Ima gear up and take you down",
    ],
  },
};

/** @type {AudioContext | null} */
let audioCtx = null;

/** @type {{ keys: string[], note: string, primaryKey: string }[]} */
let keymap = [];

/** @type {{ layer: string, key: string, note: string, bash?: string }[]} */
let extendedKeymap = [];

/** @type {Set<string>} Held layer keys (r=low, l=gap, j=high). */
const layersHeld = new Set();

/** True when a note was played while layer j was held (suppress B4 on j keyup). */
let jLayerUsed = false;

/** Layer keys: r never maps to a note; l/j also used as classic/layer notes. */
const LAYER_KEYS = new Set(["r", "l", "j"]);

/** @type {Record<string, { notes: string[], times: number[] }>} */
let songs = {
  twinkle: {},
  xmas: {},
  ducks: {},
  bridge: {},
  oysya: {},
  golden: {},
  takedown: {},
};

/** @type {Record<string, number>} */
let songPhraseGap = {
  twinkle: 0.12,
  xmas: 0.12,
  ducks: 0.12,
  bridge: 0.12,
  oysya: 0.12,
  golden: 0.12,
  takedown: 0.12,
};

/** @type {Map<string, HTMLElement>} */
const noteToKeyEl = new Map();

/** @type {Map<string, string>} */
const noteToKeyHint = new Map();

/** Classic note → key letter (no layer). @type {Map<string, string>} */
const classicHintsByNote = new Map();

/** Layer id → note → key letter. @type {Map<string, Map<string, string>>} */
const layerHintsByNote = new Map();

/** @type {Map<string, number>} */
const noteFreqCache = new Map();

/** @type {number[]} */
let phraseTimeouts = [];

/** Golden: silent note-by-note preview before audio (ms per note). */
const GOLDEN_PREVIEW_NOTE_MS = 400;

let coverKeysEnabled = false;
let showAllNoteLabels = false;

/** @type {string | null} */
let selectedSongId = null;

/** @type {Map<string, HTMLElement>} */
const songSectionById = new Map();

/** @type {HTMLElement | null} */
let practicingCard = null;

const errorBanner = document.getElementById("error-banner");
const keyboardEl = document.getElementById("keyboard");
const popLayer = document.getElementById("pop-layer");
const songsContainer = document.getElementById("songs-container");
const keyHintsEl = document.getElementById("key-hints");
const keyHintsCoveredEl = document.getElementById("key-hints-covered");
const btnCoverKeys = document.getElementById("btn-cover-keys");
const btnToggleLabels = document.getElementById("btn-toggle-labels");
const coverStatusEl = document.getElementById("cover-status");
const pianoScrollEl = document.getElementById("piano-scroll");

function showError(message) {
  errorBanner.textContent = message;
  errorBanner.classList.remove("hidden");
}

/**
 * @param {string} noteId e.g. C4, G3, C#4
 */
function noteToMidi(noteId) {
  const m = noteId.match(/^([A-G])(#|b)?(\d+)$/);
  if (!m) return 60;
  let midi = NOTE_NAMES[m[1]] + (parseInt(m[3], 10) + 1) * 12;
  if (m[2] === "#") midi += 1;
  if (m[2] === "b") midi -= 1;
  return midi;
}

/** @param {number} midi */
function midiToFreq(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/**
 * @param {string} noteId
 */
function noteToFreq(noteId) {
  if (noteFreqCache.has(noteId)) return noteFreqCache.get(noteId);
  const midi = noteToMidi(noteId);
  const freq = midiToFreq(midi);
  noteFreqCache.set(noteId, freq);
  return freq;
}

function noteLabel(noteId) {
  return noteId;
}

/** @param {string} noteId */
function shouldShowNoteLabel(noteId) {
  if (showAllNoteLabels) return true;
  return /^C\d+$/.test(noteId);
}

/**
 * @param {string} block
 */
function parsePhrasesFromBlock(block) {
  const parsed = {};
  const phraseRe = /(\d+)\)\s+notes=\(([^)]+)\)\s*\n\s*times=\(([^)]+)\)/g;
  let m;
  while ((m = phraseRe.exec(block)) !== null) {
    parsed[m[1]] = {
      notes: m[2].trim().split(/\s+/),
      times: m[3].trim().split(/\s+/).map(Number),
    };
  }
  return parsed;
}

/** @returns {string | null} */
function activeLayer() {
  if (layersHeld.has("j")) return "j";
  if (layersHeld.has("l")) return "l";
  if (layersHeld.has("r")) return "r";
  return null;
}

/** @param {string} layer @param {string} key */
function findLayeredNote(layer, key) {
  if (key.length !== 1) return undefined;
  return extendedKeymap.find((e) => e.layer === layer && e.key === key);
}

/** @param {EventTarget | null} target */
function isEditableTarget(target) {
  if (!target || !(target instanceof Element)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    target.isContentEditable
  );
}

/** Classic band: match primary key case-insensitively (Caps Lock / Shift+X → A3). */
function findClassicEntry(key) {
  if (key.length !== 1) return undefined;
  const lower = key.toLowerCase();
  return keymap.find(
    (e) =>
      e.primaryKey === lower ||
      e.keys.includes(key) ||
      e.keys.includes(lower)
  );
}

function clearLayersHeld() {
  if (layersHeld.size === 0) return;
  layersHeld.clear();
  jLayerUsed = false;
  refreshLayerUi();
}

/**
 * @param {string} text
 */
export function parseExtendedKeymap(text) {
  const match = text.match(
    /# EXTENDED_KEYMAP_BEGIN\s*\n([\s\S]*?)\n# EXTENDED_KEYMAP_END/
  );
  if (!match) {
    throw new Error("EXTENDED_KEYMAP block not found in piano.sh");
  }
  const entries = JSON.parse(match[1].trim());
  if (!Array.isArray(entries) || entries.length === 0) {
    throw new Error("EXTENDED_KEYMAP is empty or invalid");
  }
  return entries;
}

/**
 * Parse mappings from piano.sh (single source of truth).
 * @param {string} text
 */
export function parsePianoSh(text) {
  const parsedKeymap = [];
  const caseMatch = text.match(/case\s+"\$key"\s+in([\s\S]*?)esac/);
  if (!caseMatch) {
    throw new Error("Could not find case block in piano.sh");
  }

  const caseBody = caseMatch[1];
  const noteKeyRe = /([^\s|])\|([^\s)])\)\s+PLAY_NOTE\s+"([^"]+)"/g;
  let m;
  while ((m = noteKeyRe.exec(caseBody)) !== null) {
    parsedKeymap.push({
      keys: [m[1], m[2]],
      primaryKey: m[1],
      note: m[3],
    });
  }
  if (parsedKeymap.length === 0) {
    throw new Error("No PLAY_NOTE key mappings found in piano.sh");
  }

  const twinkleBlock = text.match(
    /PLAY_TWINKLE_PHRASE\(\)[\s\S]*?(?=\nPLAY_TWINKLE\(\)|\nPLAY_XMAS_PHRASE)/
  );
  const xmasBlock = text.match(
    /PLAY_XMAS_PHRASE\(\)[\s\S]*?(?=\nPLAY_XMAS\(\)|\nPLAY_DUCKS_PHRASE)/
  );
  const ducksBlock = text.match(
    /PLAY_DUCKS_PHRASE\(\)[\s\S]*?(?=\nPLAY_DUCKS\(\)|\nPLAY_BRIDGE_PHRASE)/
  );
  const bridgeBlock = text.match(
    /PLAY_BRIDGE_PHRASE\(\)[\s\S]*?(?=\nPLAY_BRIDGE\(\)|\nPLAY_OYSYA_PHRASE)/
  );
  const oysyaBlock = text.match(
    /PLAY_OYSYA_PHRASE\(\)[\s\S]*?(?=\nPLAY_OYSYA\(\)|\nPLAY_GOLDEN_PHRASE)/
  );
  const goldenBlock = text.match(
    /PLAY_GOLDEN_PHRASE\(\)[\s\S]*?(?=\nPLAY_GOLDEN\(\)|\nPLAY_TAKEDOWN_PHRASE)/
  );
  const takedownBlock = text.match(
    /PLAY_TAKEDOWN_PHRASE\(\)[\s\S]*?(?=\nPLAY_TAKEDOWN\(\)|\n# EXTENDED_KEYMAP_BEGIN)/
  );
  const parsedExtended = parseExtendedKeymap(text);

  if (!twinkleBlock) throw new Error("PLAY_TWINKLE_PHRASE not found in piano.sh");
  if (!xmasBlock) throw new Error("PLAY_XMAS_PHRASE not found in piano.sh");
  if (!ducksBlock) throw new Error("PLAY_DUCKS_PHRASE not found in piano.sh");
  if (!bridgeBlock) throw new Error("PLAY_BRIDGE_PHRASE not found in piano.sh");
  if (!oysyaBlock) throw new Error("PLAY_OYSYA_PHRASE not found in piano.sh");
  if (!goldenBlock) throw new Error("PLAY_GOLDEN_PHRASE not found in piano.sh");
  if (!takedownBlock) throw new Error("PLAY_TAKEDOWN_PHRASE not found in piano.sh");

  const twinklePhrases = parsePhrasesFromBlock(twinkleBlock[0]);
  const xmasPhrases = parsePhrasesFromBlock(xmasBlock[0]);
  const ducksPhrases = parsePhrasesFromBlock(ducksBlock[0]);
  const bridgePhrases = parsePhrasesFromBlock(bridgeBlock[0]);
  const oysyaPhrases = parsePhrasesFromBlock(oysyaBlock[0]);
  const goldenPhrases = parsePhrasesFromBlock(goldenBlock[0]);
  const takedownPhrases = parsePhrasesFromBlock(takedownBlock[0]);

  if (Object.keys(bridgePhrases).length === 0) {
    throw new Error("No London Bridge phrases found in piano.sh");
  }
  if (Object.keys(oysyaPhrases).length === 0) {
    throw new Error("No Oysya phrases found in piano.sh");
  }
  if (Object.keys(goldenPhrases).length === 0) {
    throw new Error("No Golden phrases found in piano.sh");
  }
  if (Object.keys(takedownPhrases).length === 0) {
    throw new Error("No Takedown phrases found in piano.sh");
  }

  const twinkleGap = text.match(/PLAY_TWINKLE\(\)[\s\S]*?sleep\s+([\d.]+)/);
  const xmasGap = text.match(/PLAY_XMAS\(\)[\s\S]*?sleep\s+([\d.]+)/);
  const ducksGap = text.match(/PLAY_DUCKS\(\)[\s\S]*?sleep\s+([\d.]+)/);
  const bridgeGap = text.match(/PLAY_BRIDGE\(\)[\s\S]*?sleep\s+([\d.]+)/);
  const oysyaGap = text.match(/PLAY_OYSYA\(\)[\s\S]*?sleep\s+([\d.]+)/);
  const goldenGap = text.match(/PLAY_GOLDEN\(\)[\s\S]*?sleep\s+([\d.]+)/);
  const takedownGap = text.match(/PLAY_TAKEDOWN\(\)[\s\S]*?sleep\s+([\d.]+)/);

  return {
    keymap: parsedKeymap,
    extendedKeymap: parsedExtended,
    songs: {
      twinkle: twinklePhrases,
      xmas: xmasPhrases,
      ducks: ducksPhrases,
      bridge: bridgePhrases,
      oysya: oysyaPhrases,
      golden: goldenPhrases,
      takedown: takedownPhrases,
    },
    songPhraseGap: {
      twinkle: twinkleGap ? parseFloat(twinkleGap[1]) : 0.12,
      xmas: xmasGap ? parseFloat(xmasGap[1]) : 0.12,
      ducks: ducksGap ? parseFloat(ducksGap[1]) : 0.12,
      bridge: bridgeGap ? parseFloat(bridgeGap[1]) : 0.12,
      oysya: oysyaGap ? parseFloat(oysyaGap[1]) : 0.12,
      golden: goldenGap ? parseFloat(goldenGap[1]) : 0.12,
      takedown: takedownGap ? parseFloat(takedownGap[1]) : 0.12,
    },
  };
}

function buildNoteToKeyHint() {
  noteToKeyHint.clear();
  classicHintsByNote.clear();
  layerHintsByNote.clear();

  for (const entry of keymap) {
    const hint = entry.primaryKey.toUpperCase();
    classicHintsByNote.set(entry.note, hint);
    noteToKeyHint.set(entry.note, hint);
  }

  for (const layer of ["r", "l", "j"]) {
    const byNote = new Map();
    for (const entry of extendedKeymap) {
      if (entry.layer === layer) {
        byNote.set(entry.note, entry.key.toUpperCase());
      }
    }
    layerHintsByNote.set(layer, byNote);
  }
}

/** @returns {string | null} Active layer for piano hints, or null for classic. */
function hintLayer() {
  return activeLayer();
}

/** @param {string} noteId */
function keyboardHintForNote(noteId) {
  const layer = hintLayer();
  if (layer) {
    return layerHintsByNote.get(layer)?.get(noteId) ?? "";
  }
  return classicHintsByNote.get(noteId) ?? "";
}

function updateKeyboardHints() {
  const layer = hintLayer();
  document.body.classList.toggle("layer-r-active", layer === "r");
  document.body.classList.toggle("layer-l-active", layer === "l");
  document.body.classList.toggle("layer-j-active", layer === "j");

  for (const [noteId, el] of noteToKeyEl) {
    const hint = keyboardHintForNote(noteId);
    let hintEl = el.querySelector(".key-hint");
    if (hint) {
      if (!hintEl) {
        hintEl = document.createElement("span");
        hintEl.className = "key-hint coverable";
        el.appendChild(hintEl);
      }
      hintEl.textContent = hint;
      hintEl.classList.remove("hidden");
    } else if (hintEl) {
      hintEl.remove();
    }
  }
}

function refreshLayerUi() {
  updateKeyboardHints();
}

/** @param {string[]} notes */
function notesToKeyRow(notes) {
  return notes.map((n) => noteToKeyHint.get(n) ?? "?").join(" ");
}

/** @param {string[]} notes */
function notesToNameRow(notes) {
  return notes.map((n) => noteLabel(n)).join(" ");
}

/** @param {string[]} notes */
function notesToChipsHtml(notes) {
  return notes
    .map(
      (n) =>
        `<span class="note-chip" data-note="${n}">${noteLabel(n)}</span>`
    )
    .join("");
}

function usesNotesFirstPreview(songId) {
  return songId === "golden";
}

function clearNotePreview() {
  document
    .querySelectorAll(".note-chip.preview-current")
    .forEach((el) => el.classList.remove("preview-current"));
  document
    .querySelectorAll(".piano-key.preview-highlight")
    .forEach((el) => el.classList.remove("preview-highlight"));
  document
    .querySelectorAll(".phrase-card.preview-active")
    .forEach((el) => el.classList.remove("preview-active"));
}

function scrollKeyIntoView(keyEl) {
  if (!pianoScrollEl || !keyEl) return;
  const scrollLeft =
    keyEl.offsetLeft -
    pianoScrollEl.clientWidth / 2 +
    keyEl.offsetWidth / 2;
  pianoScrollEl.scrollLeft = Math.max(0, scrollLeft);
}

/**
 * @param {string} noteId
 * @param {Element | null | undefined} chipEl
 */
function flashNotePreview(noteId, chipEl) {
  document
    .querySelectorAll(".note-chip.preview-current")
    .forEach((el) => el.classList.remove("preview-current"));
  document
    .querySelectorAll(".piano-key.preview-highlight")
    .forEach((el) => el.classList.remove("preview-highlight"));

  chipEl?.classList.add("preview-current");
  const keyEl = findKeyElForNote(noteId);
  if (keyEl) {
    keyEl.classList.add("preview-highlight");
    scrollKeyIntoView(keyEl);
  }
}

/**
 * @param {string} songId
 * @param {number} phraseNum
 * @param {() => void} [onComplete]
 */
function previewPhraseNotes(songId, phraseNum, onComplete) {
  const phrase = songs[songId]?.[String(phraseNum)];
  if (!phrase) {
    onComplete?.();
    return;
  }

  const card = songsContainer.querySelector(
    `.phrase-card[data-song="${songId}"][data-phrase="${phraseNum}"]`
  );
  card?.classList.add("preview-active");
  card?.scrollIntoView({ behavior: "smooth", block: "nearest" });

  const chips = card?.querySelectorAll(".note-chip") ?? [];

  let delayMs = 0;
  for (let i = 0; i < phrase.notes.length; i++) {
    const noteId = phrase.notes[i];
    const chip = chips[i] ?? null;
    const id = window.setTimeout(
      () => flashNotePreview(noteId, chip),
      delayMs
    );
    phraseTimeouts.push(id);
    delayMs += GOLDEN_PREVIEW_NOTE_MS;
  }

  const doneId = window.setTimeout(() => {
    card?.classList.remove("preview-active");
    clearNotePreview();
    onComplete?.();
  }, delayMs + 150);
  phraseTimeouts.push(doneId);
}

/**
 * @param {string} songId
 * @param {number} phraseNum
 * @param {HTMLElement | null} [activeBtn]
 */
function playPhraseNotesFirst(songId, phraseNum, activeBtn = null) {
  const phrase = songs[songId]?.[String(phraseNum)];
  if (!phrase) return;

  clearPhraseTimeouts();
  if (activeBtn) activeBtn.classList.add("active");

  previewPhraseNotes(songId, phraseNum, () => {
    playPhrase(songId, phraseNum, activeBtn);
  });
}

/**
 * @param {string} songId
 * @param {HTMLElement | null} [activeBtn]
 */
function playFullSongNotesFirst(songId, activeBtn = null) {
  const phraseMap = songs[songId];
  if (!phraseMap) return;

  clearPhraseTimeouts();
  if (activeBtn) activeBtn.classList.add("active");

  const phraseNums = Object.keys(phraseMap)
    .map(Number)
    .sort((a, b) => a - b);

  function previewNext(idx) {
    if (idx >= phraseNums.length) {
      playFullSong(songId, activeBtn);
      return;
    }
    previewPhraseNotes(songId, phraseNums[idx], () =>
      previewNext(idx + 1)
    );
  }

  previewNext(0);
}

/**
 * @param {string} songId
 * @param {number} phraseNum
 * @param {HTMLElement | null} [activeBtn]
 */
function triggerPhrasePlay(songId, phraseNum, activeBtn = null) {
  if (usesNotesFirstPreview(songId)) {
    playPhraseNotesFirst(songId, phraseNum, activeBtn);
  } else {
    playPhrase(songId, phraseNum, activeBtn);
  }
}

/**
 * @param {string} songId
 * @param {HTMLElement | null} [activeBtn]
 */
function triggerFullSongPlay(songId, activeBtn = null) {
  if (usesNotesFirstPreview(songId)) {
    playFullSongNotesFirst(songId, activeBtn);
  } else {
    playFullSong(songId, activeBtn);
  }
}

function setCoverKeys(enabled) {
  coverKeysEnabled = enabled;
  document.body.classList.toggle("cover-keys", enabled);
  btnCoverKeys.setAttribute("aria-pressed", String(enabled));
  btnCoverKeys.textContent = enabled ? "Show keys" : "Cover keys";
  coverStatusEl.textContent = enabled
    ? "Practice mode — key hints hidden"
    : "Key hints visible on piano and phrase cards";
}

/**
 * @param {HTMLElement | null} card
 */
function setPracticingCard(card) {
  if (practicingCard) {
    practicingCard.classList.remove("practicing");
  }
  practicingCard = card;
  if (practicingCard) {
    practicingCard.classList.add("practicing");
  }
}

/**
 * @param {string} songId
 * @param {number} phraseNum
 */
function startPhrasePractice(songId, phraseNum) {
  setCoverKeys(true);
  const card = songsContainer.querySelector(
    `.phrase-card[data-song="${songId}"][data-phrase="${phraseNum}"]`
  );
  setPracticingCard(card);
  card?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  keyboardEl.closest(".piano-section")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

async function unlockAudio() {
  const ctx = getAudioContext();
  if (ctx.state === "suspended") {
    await ctx.resume();
  }
}

function playNoteSound(noteId) {
  const freq = noteToFreq(noteId);
  if (!freq) return;

  const ctx = getAudioContext();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(freq, now);

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(freq * 6, now);
  filter.Q.setValueAtTime(1, now);

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.35, now + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 1.9);
}

function findKeyElForNote(noteId) {
  return noteToKeyEl.get(noteId) ?? null;
}

function spawnNotePop(noteId, anchorEl) {
  const pop = document.createElement("div");
  pop.className = "note-pop";
  pop.textContent = `♪ ${noteLabel(noteId)}`;

  const section = keyboardEl.parentElement;
  const sectionRect = section.getBoundingClientRect();

  let x;
  let y;
  if (anchorEl) {
    const keyRect = anchorEl.getBoundingClientRect();
    x = keyRect.left + keyRect.width / 2 - sectionRect.left;
    y = keyRect.top + keyRect.height / 2 - sectionRect.top;
  } else {
    x = sectionRect.width / 2;
    y = sectionRect.height / 2;
  }

  pop.style.left = `${x}px`;
  pop.style.top = `${y}px`;
  popLayer.appendChild(pop);
  pop.addEventListener("animationend", () => pop.remove());
}

function playNote(noteId, keyEl = null) {
  const anchor = keyEl ?? findKeyElForNote(noteId);
  if (anchor) {
    anchor.classList.add("pressed");
    setTimeout(() => anchor.classList.remove("pressed"), 180);
  }
  playNoteSound(noteId);
  spawnNotePop(noteId, anchor);
}

function clearPhraseTimeouts() {
  for (const id of phraseTimeouts) {
    clearTimeout(id);
  }
  phraseTimeouts = [];
  clearNotePreview();
  document
    .querySelectorAll(".phrase-btn.active, .btn-song-full.active")
    .forEach((el) => el.classList.remove("active"));
}

function playPhrase(songId, phraseNum, activeBtn = null) {
  const phrase = songs[songId]?.[String(phraseNum)];
  if (!phrase) return;

  clearPhraseTimeouts();
  if (activeBtn) activeBtn.classList.add("active");

  let delayMs = 0;
  for (let i = 0; i < phrase.notes.length; i++) {
    const noteId = phrase.notes[i];
    const wait = phrase.times[i] * 1000;
    const id = window.setTimeout(() => playNote(noteId), delayMs);
    phraseTimeouts.push(id);
    delayMs += wait;
  }

  const doneId = window.setTimeout(() => {
    if (activeBtn) activeBtn.classList.remove("active");
  }, delayMs);
  phraseTimeouts.push(doneId);
}

function playFullSong(songId, activeBtn = null) {
  const phraseMap = songs[songId];
  if (!phraseMap) return;

  clearPhraseTimeouts();
  if (activeBtn) activeBtn.classList.add("active");

  const gap = songPhraseGap[songId] * 1000;
  const phraseNums = Object.keys(phraseMap)
    .map(Number)
    .sort((a, b) => a - b);

  let delayMs = 0;
  for (const num of phraseNums) {
    const phrase = phraseMap[String(num)];
    for (let i = 0; i < phrase.notes.length; i++) {
      const noteId = phrase.notes[i];
      const noteDelay = delayMs;
      const id = window.setTimeout(() => playNote(noteId), noteDelay);
      phraseTimeouts.push(id);
      delayMs += phrase.times[i] * 1000;
    }
    delayMs += gap;
  }

  const doneId = window.setTimeout(() => {
    if (activeBtn) activeBtn.classList.remove("active");
  }, delayMs);
  phraseTimeouts.push(doneId);
}

/**
 * @param {string} noteId
 * @param {"white" | "black"} kind
 * @param {Map<string, { keys: string[], note: string, primaryKey: string }>} mappedByNote
 * @param {number} [afterWhiteIndex]
 */
function createKeyButton(noteId, kind, mappedByNote, afterWhiteIndex) {
  const entry = mappedByNote.get(noteId);
  const hasClassic = classicHintsByNote.has(noteId);
  const hasLayered = ["r", "l", "j"].some((layer) =>
    layerHintsByNote.get(layer)?.has(noteId)
  );
  const isMapped = hasClassic || hasLayered;

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = `piano-key ${kind}` + (isMapped ? " mapped-key" : "");
  btn.dataset.note = noteId;
  if (entry) btn.dataset.key = entry.primaryKey;
  if (afterWhiteIndex !== undefined) {
    btn.style.setProperty("--after-white-index", String(afterWhiteIndex));
  }

  const hintText = keyboardHintForNote(noteId);
  const keyHintHtml = hintText
    ? `<span class="key-hint coverable">${hintText}</span>`
    : "";

  const showLabel =
    isMapped || shouldShowNoteLabel(noteId);
  const labelHtml = showLabel
    ? `<span class="note-label">${noteLabel(noteId)}</span>`
    : "";

  btn.innerHTML = `${labelHtml}${keyHintHtml}`;

  const activate = (e) => {
    e.preventDefault();
    unlockAudio();
    playNote(noteId, btn);
  };
  btn.addEventListener("mousedown", activate);
  btn.addEventListener("touchstart", activate);

  noteToKeyEl.set(noteId, btn);
  return btn;
}

/** Mac letter rows for song range (G3–C5). Gaps match real keyboard (no R black key). */
const MAC_KEYBOARD_LAYOUT = {
  black: [
    { key: "W", note: "C#4" },
    { key: "E", note: "D#4" },
    { gap: true, label: "R" },
    { key: "T", note: "F#4" },
    { key: "Y", note: "G#4" },
    { key: "U", note: "A#4" },
  ],
  white: [
    { key: "Z", note: "G3", low: true },
    { key: "X", note: "A3", low: true },
    { key: "A", note: "C4", middleC: true },
    { key: "S", note: "D4" },
    { key: "D", note: "E4" },
    { key: "F", note: "F4" },
    { key: "G", note: "G4" },
    { key: "H", note: "A4" },
    { key: "J", note: "B4" },
    { key: "N", note: "B3", low: true },
    { key: "K", note: "C5" },
  ],
};

/** Mini QWERTY rows for the visual (blank = spacer). */
const MAC_MINI_ROWS = [
  {
    label: "Top row — black keys (sharps)",
    kind: "black",
    keys: [
      { blank: true, span: 2 },
      { key: "W", note: "C#4", kind: "black" },
      { key: "E", note: "D#4", kind: "black" },
      { blank: true, label: "R", hint: "gap", span: 1 },
      { key: "T", note: "F#4", kind: "black" },
      { key: "Y", note: "G#4", kind: "black" },
      { key: "U", note: "A#4", kind: "black" },
    ],
  },
  {
    label: "Home row — white keys",
    kind: "white",
    keys: [
      { key: "A", note: "C4", kind: "white", middleC: true },
      { key: "S", note: "D4", kind: "white" },
      { key: "D", note: "E4", kind: "white" },
      { key: "F", note: "F4", kind: "white" },
      { key: "G", note: "G4", kind: "white" },
      { key: "H", note: "A4", kind: "white" },
      { key: "J", note: "B4", kind: "white" },
      { key: "K", note: "C5", kind: "white" },
    ],
  },
  {
    label: "Bottom row — low white keys",
    kind: "white",
    keys: [
      { key: "Z", note: "G3", kind: "white", low: true },
      { key: "X", note: "A3", kind: "white", low: true },
      { blank: true, span: 5 },
      { key: "N", note: "B3", kind: "white", low: true },
    ],
  },
];

const MAC_LAYER_CARDS = [
  {
    id: "classic",
    title: "Classic",
    hold: "—",
    range: "G3–C5",
    detail: "Z X N · W E T Y U · A–K",
  },
  {
    id: "low",
    title: "Low",
    hold: "r",
    range: "A0–F♯3",
    detail: "Hold r + any letter row",
  },
  {
    id: "gap",
    title: "Gap",
    hold: "l + i",
    range: "G♯3, A♯3",
    detail: "Hold l, then i or I",
  },
  {
    id: "high",
    title: "High",
    hold: "j",
    range: "C♯5–C8",
    detail: "Hold j + letter; j alone = B4",
  },
];

function macMapPlayButton(noteId) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "mac-map-play";
  btn.textContent = "▶";
  btn.title = `Play ${noteLabel(noteId)}`;
  btn.setAttribute("aria-label", `Play ${noteLabel(noteId)}`);
  btn.addEventListener("click", () => {
    unlockAudio();
    playNote(noteId, noteToKeyEl.get(noteId) ?? null);
  });
  return btn;
}

function buildMacMapTable(title, rows, keyByNote) {
  const wrap = document.createElement("div");
  wrap.className = "mac-map-table-wrap";

  const heading = document.createElement("h3");
  heading.textContent = title;
  wrap.appendChild(heading);

  const table = document.createElement("table");
  table.className = "mac-map-table";
  table.innerHTML =
    "<thead><tr><th>Key</th><th>Note</th><th>Play</th></tr></thead>";
  const tbody = document.createElement("tbody");

  for (const slot of rows) {
    if (slot.gap) continue;
    const entry = keyByNote.get(slot.note);
    const tr = document.createElement("tr");
    if (slot.middleC) tr.classList.add("mac-map-middle-c");
    if (slot.low) tr.classList.add("mac-map-low");

    const keyCell = document.createElement("td");
    keyCell.innerHTML = `<kbd class="coverable">${slot.key}</kbd>`;
    tr.appendChild(keyCell);

    const noteCell = document.createElement("td");
    noteCell.className = "coverable";
    noteCell.textContent = entry ? noteLabel(slot.note) : slot.note;
    tr.appendChild(noteCell);

    const playCell = document.createElement("td");
    if (entry) playCell.appendChild(macMapPlayButton(slot.note));
    else playCell.textContent = "—";
    tr.appendChild(playCell);

    tbody.appendChild(tr);
  }

  table.appendChild(tbody);
  wrap.appendChild(table);
  return wrap;
}

function buildMacKeyboardGuide() {
  const keyByNote = new Map(keymap.map((e) => [e.note, e]));

  const mini = document.getElementById("mac-keys-mini");
  if (mini) {
    mini.innerHTML = "";
    for (const rowDef of MAC_MINI_ROWS) {
      const row = document.createElement("div");
      row.className = `mac-mini-row mac-mini-row-${rowDef.kind}`;
      row.setAttribute("aria-label", rowDef.label);

      const label = document.createElement("span");
      label.className = "mac-mini-row-label";
      label.textContent = rowDef.label;
      row.appendChild(label);

      const keys = document.createElement("div");
      keys.className = "mac-mini-keys";

      for (const slot of rowDef.keys) {
        if (slot.blank) {
          const gap = document.createElement("span");
          gap.className = "mac-mini-key mac-mini-blank";
          if (slot.span && slot.span > 1) {
            gap.style.gridColumn = `span ${slot.span}`;
          }
          if (slot.label) {
            gap.textContent = slot.label;
            gap.title = slot.hint ?? "No black key here (E–F gap)";
          }
          keys.appendChild(gap);
          continue;
        }

        const entry = keyByNote.get(slot.note);
        const el = document.createElement("span");
        el.className = `mac-mini-key mac-mini-${slot.kind}`;
        if (entry) el.classList.add("mapped");
        if (slot.middleC) el.classList.add("middle-c");
        if (slot.low) el.classList.add("low-note");

        const noteText = entry ? noteLabel(slot.note) : slot.note;
        el.innerHTML = `<span class="mac-mini-cap coverable">${slot.key}</span><span class="mac-mini-note coverable">${noteText}</span>`;
        keys.appendChild(el);
      }

      row.appendChild(keys);
      mini.appendChild(row);
    }
  }

  const tablesHost = document.getElementById("mac-guide-tables");
  if (tablesHost) {
    tablesHost.innerHTML = "";
    tablesHost.appendChild(
      buildMacMapTable(
        "White keys (home + bottom row)",
        MAC_KEYBOARD_LAYOUT.white,
        keyByNote
      )
    );
    tablesHost.appendChild(
      buildMacMapTable(
        "Black keys (top row)",
        MAC_KEYBOARD_LAYOUT.black,
        keyByNote
      )
    );
  }

  const layersHost = document.getElementById("mac-layer-cards");
  if (layersHost) {
    layersHost.innerHTML = "";
    for (const card of MAC_LAYER_CARDS) {
      const el = document.createElement("article");
      el.className = "mac-layer-card coverable";
      el.dataset.layer = card.id;
      el.innerHTML = `
        <h3 class="mac-layer-title">${card.title}</h3>
        <p class="mac-layer-hold"><span class="mac-layer-label">Hold</span> <kbd>${card.hold}</kbd></p>
        <p class="mac-layer-range">${card.range}</p>
        <p class="mac-layer-detail">${card.detail}</p>
      `;
      layersHost.appendChild(el);
    }
  }

  const detailsBody = document.getElementById("mac-88-details-body");
  if (detailsBody) {
    detailsBody.innerHTML = "";
    const table = document.createElement("table");
    table.className = "mac-88-table coverable";
    table.innerHTML = `
      <thead><tr><th>Band</th><th>Web</th><th>Terminal</th><th>Range</th></tr></thead>
      <tbody>
        <tr><td>Classic</td><td>press key</td><td>direct</td><td>G3–C5</td></tr>
        <tr><td>Low</td><td>hold <kbd>r</kbd> + letter</td><td>\\ <kbd>r</kbd> + letter</td><td>A0–F♯3</td></tr>
        <tr><td>Gap</td><td>hold <kbd>l</kbd> + <kbd>i</kbd></td><td>\\ <kbd>l</kbd> <kbd>i</kbd></td><td>G♯3, A♯3</td></tr>
        <tr><td>High</td><td>hold <kbd>j</kbd> + letter</td><td>\\ <kbd>j</kbd> + letter</td><td>C♯5–C8</td></tr>
      </tbody>
    `;
    detailsBody.appendChild(table);
    const note = document.createElement("p");
    note.className = "mac-88-note coverable";
    note.textContent =
      "Hold r, l, or j — piano letter hints switch to that layer; release to return to classic (Z X N, A–K, W E T Y U). Shift + letter = sharp in low/high bands. Tap j alone for B4. Phrase and full-song keys do not fire while a layer key is held.";
    detailsBody.appendChild(note);
  }
}

function scrollPianoToMiddleC() {
  const c4 = noteToKeyEl.get("C4");
  if (!c4 || !pianoScrollEl) return;
  const scrollLeft =
    c4.offsetLeft -
    pianoScrollEl.clientWidth / 2 +
    c4.offsetWidth / 2;
  pianoScrollEl.scrollLeft = Math.max(0, scrollLeft);
}

function setNoteLabelsMode(allLabels) {
  showAllNoteLabels = allLabels;
  if (btnToggleLabels) {
    btnToggleLabels.setAttribute("aria-pressed", String(allLabels));
    btnToggleLabels.textContent = allLabels ? "C labels only" : "All note labels";
    btnToggleLabels.title = allLabels
      ? "Show only C note names on white keys"
      : "Show every note name on white keys";
  }
  document.body.classList.toggle("piano-labels-all", allLabels);
  document.body.classList.toggle("piano-labels-c-only", !allLabels);
  buildKeyboard();
  scrollPianoToMiddleC();
}

function buildKeyboard() {
  keyboardEl.innerHTML = "";
  noteToKeyEl.clear();

  keyboardEl.className = "piano-horizontal";
  keyboardEl.style.setProperty("--white-count", String(PIANO_WHITE_KEYS.length));

  const whiteRow = document.createElement("div");
  whiteRow.className = "piano-white-keys";

  const blackRow = document.createElement("div");
  blackRow.className = "piano-black-keys";

  const mappedByNote = new Map(keymap.map((e) => [e.note, e]));

  PIANO_WHITE_KEYS.forEach((noteId, index) => {
    whiteRow.appendChild(createKeyButton(noteId, "white", mappedByNote));

    const blackNote = BLACK_KEY_AFTER_WHITE[noteId];
    if (blackNote) {
      blackRow.appendChild(
        createKeyButton(blackNote, "black", mappedByNote, index + 1)
      );
    }
  });

  keyboardEl.appendChild(whiteRow);
  keyboardEl.appendChild(blackRow);
}

function buildSongSection(songId) {
  const meta = SONG_META[songId];
  const phraseMap = songs[songId];
  const section = document.createElement("section");
  section.className = "song-section";
  if (songId === "golden") section.classList.add("song-golden");
  section.dataset.song = songId;

  const heading = document.createElement("h2");
  heading.textContent = meta.title;
  section.appendChild(heading);

  const melodyNotes = getMelodyNotesForSong(songId);
  if (melodyNotes.length > 0) {
    const summary = document.createElement("div");
    summary.className = "melody-summary";
    summary.innerHTML = `<span class="melody-summary-label">Melody</span><span class="melody-summary-notes">${notesToNameRow(melodyNotes)}</span>`;
    section.appendChild(summary);
  }

  const hint = document.createElement("p");
  hint.className = "song-hint";
  hint.textContent =
    songId === "golden"
      ? `Notes preview, then play — each phrase highlights note names on the piano (silent), then plays audio. Play along with the Notes row. Practice hides key hints. [${meta.phraseKeys.join("] [")}] / full song [${meta.fullKey}].`
      : `Play along using the Notes row (pitch names). Use Practice on a phrase to hide key hints. Auto-play with the Play button or [${meta.phraseKeys.join("] [")}] / full song [${meta.fullKey}].`;
  section.appendChild(hint);

  const blueprint = document.createElement("div");
  blueprint.className = "blueprint-grid";

  const nums = Object.keys(phraseMap)
    .map(Number)
    .sort((a, b) => a - b);

  nums.forEach((num, idx) => {
    const phrase = phraseMap[String(num)];
    const triggerKey = meta.phraseKeys[idx] ?? String(num);
    const lyric = meta.lyrics[idx] ?? "";

    const card = document.createElement("article");
    card.className = "phrase-card";
    card.dataset.song = songId;
    card.dataset.phrase = String(num);

    const header = document.createElement("div");
    header.className = "phrase-card-header";

    const title = document.createElement("h3");
    title.innerHTML = `Phrase <span class="phrase-num">${triggerKey}</span>`;
    if (lyric) {
      title.innerHTML += ` <span class="phrase-lyric">— ${lyric}</span>`;
    }
    header.appendChild(title);

    const actions = document.createElement("div");
    actions.className = "phrase-actions";

    const practiceBtn = document.createElement("button");
    practiceBtn.type = "button";
    practiceBtn.className = "btn-practice";
    practiceBtn.textContent = "Practice";
    practiceBtn.title = "Hide key hints and highlight this phrase";
    practiceBtn.addEventListener("click", () => {
      startPhrasePractice(songId, num);
    });
    actions.appendChild(practiceBtn);

    const playBtn = document.createElement("button");
    playBtn.type = "button";
    playBtn.className = "phrase-btn";
    playBtn.dataset.song = songId;
    playBtn.dataset.phrase = String(num);
    playBtn.textContent = `Play [${triggerKey}]`;
    playBtn.title =
      songId === "golden"
        ? `Press ${triggerKey} — preview notes, then play`
        : `Press ${triggerKey} to auto-play`;
    playBtn.addEventListener("click", () => {
      unlockAudio();
      triggerPhrasePlay(songId, num, playBtn);
    });
    actions.appendChild(playBtn);

    header.appendChild(actions);
    card.appendChild(header);

    const rowNotes = document.createElement("div");
    rowNotes.className = "note-row note-names";
    rowNotes.innerHTML =
      songId === "golden"
        ? `<span class="row-label">Notes</span><span class="row-values note-chips">${notesToChipsHtml(phrase.notes)}</span>`
        : `<span class="row-label">Notes</span><span class="row-values">${notesToNameRow(phrase.notes)}</span>`;
    card.appendChild(rowNotes);

    const rowKeys = document.createElement("div");
    rowKeys.className = "note-row note-keys coverable";
    rowKeys.innerHTML = `<span class="row-label">Keys</span><span class="row-values keys">${notesToKeyRow(phrase.notes)}</span>`;
    card.appendChild(rowKeys);

    blueprint.appendChild(card);
  });

  section.appendChild(blueprint);

  const fullBtn = document.createElement("button");
  fullBtn.type = "button";
  fullBtn.className = "btn-song-full";
  fullBtn.dataset.song = songId;
  fullBtn.textContent = `Play full song [${meta.fullKey}]`;
  fullBtn.title =
    songId === "golden"
      ? "Preview all phrase notes in order, then play full song"
      : "Play all phrases in order";
  fullBtn.addEventListener("click", () => {
    unlockAudio();
    triggerFullSongPlay(songId, fullBtn);
  });
  section.appendChild(fullBtn);

  return section;
}

function getAvailableSongIds() {
  return SONG_DISPLAY_ORDER.filter((id) => {
    const phraseMap = songs[id];
    return SONG_META[id] && phraseMap && Object.keys(phraseMap).length > 0;
  });
}

/** @param {string} songId */
function getMelodyNotesForSong(songId) {
  const phraseMap = songs[songId];
  if (!phraseMap) return [];
  return Object.keys(phraseMap)
    .map(Number)
    .sort((a, b) => a - b)
    .flatMap((num) => phraseMap[String(num)].notes);
}

/** @param {string} songId */
function selectSong(songId) {
  if (!songSectionById.has(songId)) return;
  selectedSongId = songId;
  sessionStorage.setItem(SELECTED_SONG_STORAGE_KEY, songId);

  for (const [id, section] of songSectionById) {
    section.hidden = id !== songId;
  }

  const select = document.getElementById("song-select");
  if (select && select.value !== songId) {
    select.value = songId;
  }

  songsContainer.querySelectorAll(".song-pill").forEach((pill) => {
    const active = pill.dataset.song === songId;
    pill.classList.toggle("active", active);
    pill.setAttribute("aria-selected", active ? "true" : "false");
  });

  setPracticingCard(null);
}

/** @param {string[]} songIds */
function buildSongPicker(songIds) {
  const picker = document.createElement("div");
  picker.className = "song-picker";

  const label = document.createElement("label");
  label.className = "song-picker-label";
  label.htmlFor = "song-select";
  label.textContent = "Choose a song";

  const select = document.createElement("select");
  select.id = "song-select";
  select.className = "song-select";
  select.setAttribute("aria-label", "Choose a song");

  const pills = document.createElement("div");
  pills.className = "song-picker-pills";
  pills.setAttribute("role", "tablist");
  pills.setAttribute("aria-label", "Songs");

  for (const id of songIds) {
    const meta = SONG_META[id];
    const option = document.createElement("option");
    option.value = id;
    option.textContent = meta.title;
    select.appendChild(option);

    const pill = document.createElement("button");
    pill.type = "button";
    pill.className = "song-pill";
    pill.dataset.song = id;
    pill.setAttribute("role", "tab");
    pill.textContent = meta.shortTitle ?? meta.title;
    pill.addEventListener("click", () => selectSong(id));
    pills.appendChild(pill);
  }

  select.addEventListener("change", () => {
    selectSong(select.value);
  });

  const quickLabel = document.createElement("span");
  quickLabel.className = "song-picker-quick-label";
  quickLabel.textContent = "Quick pick";

  picker.append(label, select, quickLabel, pills);
  return picker;
}

function buildSongsUI() {
  const songIds = getAvailableSongIds();
  songsContainer.innerHTML = "";
  songSectionById.clear();

  if (songIds.length === 0) {
    const empty = document.createElement("p");
    empty.className = "song-empty";
    empty.textContent = "No songs found in piano.sh.";
    songsContainer.appendChild(empty);
    return;
  }

  songsContainer.appendChild(buildSongPicker(songIds));

  const panel = document.createElement("div");
  panel.id = "song-panel";
  panel.className = "song-panel";

  for (const id of songIds) {
    const section = buildSongSection(id);
    songSectionById.set(id, section);
    panel.appendChild(section);
  }

  songsContainer.appendChild(panel);

  const stored = sessionStorage.getItem(SELECTED_SONG_STORAGE_KEY);
  const initial = stored && songIds.includes(stored) ? stored : songIds[0];
  selectSong(initial);
}

function updateKeyHints() {
  const mapped = keymap
    .map((e) => `[${e.primaryKey.toUpperCase()}]=${noteLabel(e.note)}`)
    .join("  ");
  const extended =
    "88 keys: hold [R] low A0–F#3 | [L]+I gap | [J] high C#5–C8 (or \\ r/l/j in terminal)";
  const shortcuts =
    "Phrase keys (selected song): [B][C][I][O][P][V]  |  Full songs: Twinkle [R], Christmas [M], Ducks [L], Bridge [B], Oysya [O], Golden [N], Takedown [P] (not while holding r/l/j)  |  Classic [X]=A3 (x or X)  |  [m] only with hold [r]  |  Black keys [W][E][T][Y][U]";
  const full = `${mapped}  |  ${extended}  |  ${shortcuts}`;
  keyHintsEl.textContent = full;
  keyHintsEl.dataset.fullHints = full;
}

function findPhraseKeyIndex(meta, key) {
  return meta.phraseKeys.indexOf(key);
}

function handleLayerKeyup(event) {
  if (isEditableTarget(event.target)) return;
  const key = event.key;
  if (key.length !== 1) return;
  const lower = key.toLowerCase();
  if (lower === "j" && layersHeld.has("j")) {
    if (!jLayerUsed) {
      const entry = keymap.find((e) => e.primaryKey === "j");
      if (entry) {
        unlockAudio();
        playNote(entry.note, noteToKeyEl.get(entry.note) ?? null);
      }
    }
    layersHeld.delete("j");
    jLayerUsed = false;
    refreshLayerUi();
    return;
  }
  if (LAYER_KEYS.has(lower)) {
    layersHeld.delete(lower);
    refreshLayerUi();
  }
}

function handleKeydown(event) {
  if (event.repeat) return;
  if (isEditableTarget(event.target)) return;

  const key = event.key;
  const lower = key.length === 1 ? key.toLowerCase() : "";

  if (lower && LAYER_KEYS.has(lower)) {
    if (lower === "j" && layersHeld.has("j")) {
      const ext = findLayeredNote("j", key);
      if (ext) {
        event.preventDefault();
        jLayerUsed = true;
        unlockAudio();
        playNote(ext.note, noteToKeyEl.get(ext.note) ?? null);
        return;
      }
    }
    event.preventDefault();
    layersHeld.add(lower);
    if (lower === "j") jLayerUsed = false;
    refreshLayerUi();
    return;
  }

  const layer = activeLayer();
  if (layer && key.length === 1) {
    const ext = findLayeredNote(layer, key);
    if (ext) {
      event.preventDefault();
      if (layer === "j") jLayerUsed = true;
      unlockAudio();
      playNote(ext.note, noteToKeyEl.get(ext.note) ?? null);
      return;
    }
  }

  const classic = findClassicEntry(key);
  if (classic) {
    event.preventDefault();
    unlockAudio();
    playNote(classic.note, noteToKeyEl.get(classic.note) ?? null);
    return;
  }

  if (layer) return;

  if (key === "R") {
    event.preventDefault();
    unlockAudio();
    playFullSong(
      "twinkle",
      songsContainer.querySelector('.btn-song-full[data-song="twinkle"]')
    );
    return;
  }

  if (key === "M") {
    event.preventDefault();
    unlockAudio();
    playFullSong(
      "xmas",
      songsContainer.querySelector('.btn-song-full[data-song="xmas"]')
    );
    return;
  }

  if (key === "L") {
    event.preventDefault();
    unlockAudio();
    playFullSong(
      "ducks",
      songsContainer.querySelector('.btn-song-full[data-song="ducks"]')
    );
    return;
  }

  if (key === "B") {
    event.preventDefault();
    unlockAudio();
    playFullSong(
      "bridge",
      songsContainer.querySelector('.btn-song-full[data-song="bridge"]')
    );
    return;
  }

  if (key === "O") {
    event.preventDefault();
    unlockAudio();
    playFullSong(
      "oysya",
      songsContainer.querySelector('.btn-song-full[data-song="oysya"]')
    );
    return;
  }

  if (key === "N") {
    event.preventDefault();
    unlockAudio();
    triggerFullSongPlay(
      "golden",
      songsContainer.querySelector('.btn-song-full[data-song="golden"]')
    );
    return;
  }

  if (key === "P") {
    event.preventDefault();
    unlockAudio();
    playFullSong(
      "takedown",
      songsContainer.querySelector('.btn-song-full[data-song="takedown"]')
    );
    return;
  }

  if (selectedSongId) {
    const songId = selectedSongId;
    const meta = SONG_META[songId];
    const idx = findPhraseKeyIndex(meta, key);
    if (idx !== -1) {
      const phraseNum = idx + 1;
      if (!songs[songId][String(phraseNum)]) return;
      event.preventDefault();
      unlockAudio();
      const btn = songsContainer.querySelector(
        `.phrase-btn[data-song="${songId}"][data-phrase="${phraseNum}"]`
      );
      triggerPhrasePlay(songId, phraseNum, btn);
    }
  }
}

function setupCoverToggle() {
  btnCoverKeys.addEventListener("click", () => {
    const next = !coverKeysEnabled;
    setCoverKeys(next);
    if (!next) {
      setPracticingCard(null);
    }
  });
  setCoverKeys(false);
}

function setupLabelToggle() {
  if (!btnToggleLabels) return;
  btnToggleLabels.addEventListener("click", () => {
    setNoteLabelsMode(!showAllNoteLabels);
  });
  setNoteLabelsMode(false);
}

async function init() {
  try {
    const res = await fetch(PIANO_SH_URL);
    if (!res.ok) {
      throw new Error(
        `Failed to load piano.sh (${res.status}). Run a local server from the project root.`
      );
    }
    const text = await res.text();
    const parsed = parsePianoSh(text);
    keymap = parsed.keymap;
    extendedKeymap = parsed.extendedKeymap;
    songs = parsed.songs;
    songPhraseGap = parsed.songPhraseGap;

    buildNoteToKeyHint();
    buildMacKeyboardGuide();
    buildKeyboard();
    buildSongsUI();
    updateKeyHints();
    setupCoverToggle();
    setupLabelToggle();
    scrollPianoToMiddleC();

    window.addEventListener("keydown", handleKeydown, { capture: true });
    window.addEventListener("keyup", handleLayerKeyup, { capture: true });
    window.addEventListener("blur", clearLayersHeld);

    document.body.addEventListener("click", () => unlockAudio(), {
      once: true,
    });
  } catch (err) {
    showError(
      err instanceof Error ? err.message : "Failed to initialize piano"
    );
    keyHintsEl.textContent =
      "Start server: python3 -m http.server 8080 — then open /web/";
  }
}

init();
