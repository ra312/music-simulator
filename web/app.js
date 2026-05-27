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
const SONG_META = {
  twinkle: {
    title: "Twinkle Twinkle Little Star",
    fullKey: "R",
    phraseKeys: ["1", "2", "3", "4", "5", "6"],
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
    fullKey: "M",
    phraseKeys: ["7", "8", "9", "0", "-", "="],
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
    fullKey: "L",
    phraseKeys: [",", ".", "/", ";", "[", "]"],
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
    fullKey: "!",
    phraseKeys: ["i", "o", "p", "v"],
    lyrics: [
      "London Bridge is falling down",
      "Falling down, falling down",
      "London Bridge is falling down",
      "My fair lady",
    ],
  },
  oysya: {
    title: "Ойся ты ойся (Oysya ty oysya)",
    fullKey: "&",
    phraseKeys: ["?", "@", "#", "$", "%", "^"],
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
    fullKey: "|",
    phraseKeys: [" ", "`", "(", ")", "'", '"'],
    lyrics: [
      "Verse hook",
      "We're goin' up",
      "It's our moment",
      "glowin'",
      "golden",
      "up with our voices",
    ],
  },
};

/** @type {AudioContext | null} */
let audioCtx = null;

/** @type {{ keys: string[], note: string, primaryKey: string }[]} */
let keymap = [];

/** @type {{ mods: string[], key: string, note: string, bash?: string }[]} */
let extendedKeymap = [];

/** @type {Record<string, { notes: string[], times: number[] }>} */
let songs = {
  twinkle: {},
  xmas: {},
  ducks: {},
  bridge: {},
  oysya: {},
  golden: {},
};

/** @type {Record<string, number>} */
let songPhraseGap = {
  twinkle: 0.12,
  xmas: 0.12,
  ducks: 0.12,
  bridge: 0.12,
  oysya: 0.12,
  golden: 0.12,
};

/** @type {Map<string, HTMLElement>} */
const noteToKeyEl = new Map();

/** @type {Map<string, string>} */
const noteToKeyHint = new Map();

/** @type {Map<string, string>} */
const noteToExtendedHint = new Map();

/** @type {Map<string, number>} */
const noteFreqCache = new Map();

/** @type {number[]} */
let phraseTimeouts = [];

/** Golden: silent note-by-note preview before audio (ms per note). */
const GOLDEN_PREVIEW_NOTE_MS = 400;

let coverKeysEnabled = false;
let showAllNoteLabels = false;

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

/** @param {string[]} mods */
function modsKey(mods) {
  return [...mods].sort().join("+");
}

/** @param {KeyboardEvent} event */
function modsFromEvent(event) {
  const mods = [];
  if (event.ctrlKey) mods.push("control");
  if (event.altKey) mods.push("alt");
  if (event.shiftKey) mods.push("shift");
  return mods;
}

/** @param {KeyboardEvent} event */
function hasModifiers(event) {
  return event.ctrlKey || event.altKey || event.shiftKey;
}

/** @param {string[]} mods @param {string} key */
function formatModHint(mods, key) {
  const symbols = { shift: "⇧", control: "⌃", alt: "⌥" };
  const prefix = [...mods]
    .sort()
    .map((m) => symbols[m] ?? m)
    .join("");
  return prefix + key.toUpperCase();
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
    /PLAY_GOLDEN_PHRASE\(\)[\s\S]*?(?=\nPLAY_GOLDEN\(\)|\n# EXTENDED_KEYMAP_BEGIN)/
  );
  const parsedExtended = parseExtendedKeymap(text);

  if (!twinkleBlock) throw new Error("PLAY_TWINKLE_PHRASE not found in piano.sh");
  if (!xmasBlock) throw new Error("PLAY_XMAS_PHRASE not found in piano.sh");
  if (!ducksBlock) throw new Error("PLAY_DUCKS_PHRASE not found in piano.sh");
  if (!bridgeBlock) throw new Error("PLAY_BRIDGE_PHRASE not found in piano.sh");
  if (!oysyaBlock) throw new Error("PLAY_OYSYA_PHRASE not found in piano.sh");
  if (!goldenBlock) throw new Error("PLAY_GOLDEN_PHRASE not found in piano.sh");

  const twinklePhrases = parsePhrasesFromBlock(twinkleBlock[0]);
  const xmasPhrases = parsePhrasesFromBlock(xmasBlock[0]);
  const ducksPhrases = parsePhrasesFromBlock(ducksBlock[0]);
  const bridgePhrases = parsePhrasesFromBlock(bridgeBlock[0]);
  const oysyaPhrases = parsePhrasesFromBlock(oysyaBlock[0]);
  const goldenPhrases = parsePhrasesFromBlock(goldenBlock[0]);

  if (Object.keys(bridgePhrases).length === 0) {
    throw new Error("No London Bridge phrases found in piano.sh");
  }
  if (Object.keys(oysyaPhrases).length === 0) {
    throw new Error("No Oysya phrases found in piano.sh");
  }
  if (Object.keys(goldenPhrases).length === 0) {
    throw new Error("No Golden phrases found in piano.sh");
  }

  const twinkleGap = text.match(/PLAY_TWINKLE\(\)[\s\S]*?sleep\s+([\d.]+)/);
  const xmasGap = text.match(/PLAY_XMAS\(\)[\s\S]*?sleep\s+([\d.]+)/);
  const ducksGap = text.match(/PLAY_DUCKS\(\)[\s\S]*?sleep\s+([\d.]+)/);
  const bridgeGap = text.match(/PLAY_BRIDGE\(\)[\s\S]*?sleep\s+([\d.]+)/);
  const oysyaGap = text.match(/PLAY_OYSYA\(\)[\s\S]*?sleep\s+([\d.]+)/);
  const goldenGap = text.match(/PLAY_GOLDEN\(\)[\s\S]*?sleep\s+([\d.]+)/);

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
    },
    songPhraseGap: {
      twinkle: twinkleGap ? parseFloat(twinkleGap[1]) : 0.12,
      xmas: xmasGap ? parseFloat(xmasGap[1]) : 0.12,
      ducks: ducksGap ? parseFloat(ducksGap[1]) : 0.12,
      bridge: bridgeGap ? parseFloat(bridgeGap[1]) : 0.12,
      oysya: oysyaGap ? parseFloat(oysyaGap[1]) : 0.12,
      golden: goldenGap ? parseFloat(goldenGap[1]) : 0.12,
    },
  };
}

function buildNoteToKeyHint() {
  noteToKeyHint.clear();
  noteToExtendedHint.clear();
  for (const entry of keymap) {
    noteToKeyHint.set(entry.note, entry.primaryKey.toUpperCase());
  }
  for (const entry of extendedKeymap) {
    const hint = formatModHint(entry.mods, entry.key);
    noteToExtendedHint.set(entry.note, hint);
    if (!noteToKeyHint.has(entry.note)) {
      noteToKeyHint.set(entry.note, hint);
    }
  }
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
  const extHint = noteToExtendedHint.get(noteId);
  const isMapped = Boolean(entry) || Boolean(extHint);

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = `piano-key ${kind}` + (isMapped ? " mapped-key" : "");
  btn.dataset.note = noteId;
  if (entry) btn.dataset.key = entry.primaryKey;
  if (afterWhiteIndex !== undefined) {
    btn.style.setProperty("--after-white-index", String(afterWhiteIndex));
  }

  const hintText = entry
    ? entry.primaryKey
    : extHint ?? "";
  const hintClass = entry
    ? "key-hint coverable"
    : "key-hint key-hint-extended coverable";
  const keyHintHtml = hintText
    ? `<span class="${hintClass}">${hintText}</span>`
    : "";

  const labelHtml = shouldShowNoteLabel(noteId)
    ? `<span class="note-label">${noteLabel(noteId)}</span>`
    : "";

  btn.innerHTML = `${keyHintHtml}${labelHtml}`;

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

/** Mac two-row layout (low → high). Gaps match real keyboard (no R black key). */
const MAC_KEYBOARD_LAYOUT = {
  black: [
    { key: "W", note: "C#4", twin: true },
    { key: "E", note: "D#4", twin: true },
    { gap: true, label: "R", hint: "no black key (E–F gap)" },
    { key: "T", note: "F#4" },
    { key: "Y", note: "G#4" },
    { key: "U", note: "A#4" },
  ],
  white: [
    { key: "Z", note: "G3", low: true },
    { key: "A", note: "C4", frontDoor: true },
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

function buildMacKeyboardGuide() {
  const container = document.getElementById("mac-keys-visual");
  if (!container) return;

  container.innerHTML = "";
  const keyByNote = new Map(keymap.map((e) => [e.note, e]));

  function makeRow(rowType, slots, rowLabel) {
    const row = document.createElement("div");
    row.className = `mac-row mac-row-${rowType}`;
    row.setAttribute("role", "list");
    row.setAttribute("aria-label", rowLabel);

    for (const slot of slots) {
      if (slot.gap) {
        const gap = document.createElement("div");
        gap.className = "mac-key mac-gap";
        gap.innerHTML = `<span class="mac-key-cap">${slot.label}</span><span class="mac-key-sub">${slot.hint ?? ""}</span>`;
        row.appendChild(gap);
        continue;
      }

      const entry = keyByNote.get(slot.note);
      const el = document.createElement("div");
      el.className = "mac-key";
      if (entry) el.classList.add("mapped");
      if (slot.twin) el.classList.add("twin-tower");
      if (slot.frontDoor) el.classList.add("front-door");
      if (slot.low) el.classList.add("low-note");

      const cap = slot.key;
      const sub = entry ? noteLabel(slot.note) : slot.note ?? "";
      el.innerHTML = `
        <span class="mac-key-cap coverable">${cap}</span>
        <span class="mac-key-sub coverable">${sub}</span>
      `;
      row.appendChild(el);
    }
    return row;
  }

  container.appendChild(
    makeRow("black", MAC_KEYBOARD_LAYOUT.black, "Top row — black keys (sharps)")
  );
  container.appendChild(
    makeRow("white", MAC_KEYBOARD_LAYOUT.white, "Home row — white keys")
  );

  const extGuide = document.getElementById("mac-extended-guide");
  if (extGuide) {
    extGuide.innerHTML = "";
    const heading = document.createElement("h3");
    heading.className = "coverable";
    heading.textContent = "Full 88 keys — octave layers (same note keys)";
    extGuide.appendChild(heading);
    const table = document.createElement("table");
    table.className = "extended-layers-table coverable";
    table.innerHTML = `
      <thead><tr><th>Layer</th><th>Web (hold)</th><th>Terminal</th><th>Range</th></tr></thead>
      <tbody>
        <tr><td>Classic</td><td><em>none</em></td><td>direct key</td><td>G3–C5 (songs)</td></tr>
        <tr><td>low2</td><td>⌃⌥</td><td>\\ then <kbd>a</kbd></td><td>≈ A0–C2</td></tr>
        <tr><td>low1</td><td>⌥</td><td>\\ then <kbd>s</kbd></td><td>≈ C#2–C3</td></tr>
        <tr><td>down</td><td>⌃</td><td>\\ then <kbd>d</kbd></td><td>≈ C#3–F3</td></tr>
        <tr><td>up</td><td>⇧</td><td>\\ then <kbd>g</kbd></td><td>≈ C#5–C6</td></tr>
        <tr><td>high1</td><td>⇧⌥</td><td>\\ then <kbd>h</kbd></td><td>≈ C#6–C7</td></tr>
        <tr><td>high2</td><td>⇧⌃</td><td>\\ then <kbd>j</kbd></td><td>≈ C#7–C8</td></tr>
        <tr><td>A#0</td><td>⇧⌃⌥ + <kbd>U</kbd></td><td>\\ <kbd>u</kbd> <kbd>U</kbd></td><td>A#0 only</td></tr>
      </tbody>
    `;
    extGuide.appendChild(table);
    const note = document.createElement("p");
    note.className = "extended-layers-note coverable";
    note.textContent =
      "Extended layers use the same note keys (Z X N, W E T Y U, A–K). Example: Shift+K = C6, Ctrl+Alt+X = A0.";
    extGuide.appendChild(note);
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

function buildSongsUI() {
  songsContainer.innerHTML = "";
  songsContainer.appendChild(buildSongSection("twinkle"));
  songsContainer.appendChild(buildSongSection("xmas"));
  songsContainer.appendChild(buildSongSection("ducks"));
  songsContainer.appendChild(buildSongSection("bridge"));
  songsContainer.appendChild(buildSongSection("oysya"));
  songsContainer.appendChild(buildSongSection("golden"));
}

function updateKeyHints() {
  const mapped = keymap
    .map((e) => `[${e.primaryKey.toUpperCase()}]=${noteLabel(e.note)}`)
    .join("  ");
  const extended =
    "88-key layers: ⌃⌥ low2 | ⌥ low1 | ⌃ down | ⇧ up | ⇧⌥ high1 | ⇧⌃ high2 | ⇧⌃⌥U=A#0";
  const shortcuts =
    "Twinkle [1]–[6] [R]  |  Christmas [7][8][9][0][-][=] [M]  |  Ducks [,][.][/][;] [[]] [L]  |  Bridge [I][O][P][V] [!]  |  Oysya [?][@][#][$][%][^] [&]  |  Golden [space][`][(][)]['] [\"] [|]  |  Black keys [W][E][T][Y][U]";
  const full = `${mapped}  |  ${extended}  |  ${shortcuts}`;
  keyHintsEl.textContent = full;
  keyHintsEl.dataset.fullHints = full;
}

function findPhraseKeyIndex(meta, key) {
  const lower = key.toLowerCase();
  return meta.phraseKeys.findIndex(
    (k) => k === key || k === lower || k.toUpperCase() === key.toUpperCase()
  );
}

function handleKeydown(event) {
  if (event.repeat) return;
  const key = event.key;

  if (hasModifiers(event)) {
    const keyLower = key.length === 1 ? key.toLowerCase() : key;
    const modKey = modsKey(modsFromEvent(event));
    const ext = extendedKeymap.find(
      (e) => e.key === keyLower && modsKey(e.mods) === modKey
    );
    if (ext) {
      event.preventDefault();
      unlockAudio();
      playNote(ext.note, noteToKeyEl.get(ext.note) ?? null);
    }
    return;
  }

  const entry = keymap.find(
    (e) =>
      e.keys.includes(key) ||
      e.keys.includes(key.toLowerCase()) ||
      e.primaryKey === key.toLowerCase()
  );
  if (entry) {
    event.preventDefault();
    unlockAudio();
    playNote(entry.note, noteToKeyEl.get(entry.note) ?? null);
    return;
  }

  if (key === "r" || key === "R") {
    event.preventDefault();
    unlockAudio();
    playFullSong(
      "twinkle",
      songsContainer.querySelector('.btn-song-full[data-song="twinkle"]')
    );
    return;
  }

  if (key === "m" || key === "M") {
    event.preventDefault();
    unlockAudio();
    playFullSong(
      "xmas",
      songsContainer.querySelector('.btn-song-full[data-song="xmas"]')
    );
    return;
  }

  if (key === "l" || key === "L") {
    event.preventDefault();
    unlockAudio();
    playFullSong(
      "ducks",
      songsContainer.querySelector('.btn-song-full[data-song="ducks"]')
    );
    return;
  }

  if (key === "!") {
    event.preventDefault();
    unlockAudio();
    playFullSong(
      "bridge",
      songsContainer.querySelector('.btn-song-full[data-song="bridge"]')
    );
    return;
  }

  if (key === "&") {
    event.preventDefault();
    unlockAudio();
    playFullSong(
      "oysya",
      songsContainer.querySelector('.btn-song-full[data-song="oysya"]')
    );
    return;
  }

  if (key === "|") {
    event.preventDefault();
    unlockAudio();
    triggerFullSongPlay(
      "golden",
      songsContainer.querySelector('.btn-song-full[data-song="golden"]')
    );
    return;
  }

  for (const songId of [
    "twinkle",
    "xmas",
    "ducks",
    "bridge",
    "oysya",
    "golden",
  ]) {
    const meta = SONG_META[songId];
    const idx = findPhraseKeyIndex(meta, key);
    if (idx === -1) continue;

    const phraseNum = idx + 1;
    if (!songs[songId][String(phraseNum)]) continue;

    event.preventDefault();
    unlockAudio();
    const btn = songsContainer.querySelector(
      `.phrase-btn[data-song="${songId}"][data-phrase="${phraseNum}"]`
    );
    triggerPhrasePlay(songId, phraseNum, btn);
    return;
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

    window.addEventListener("keydown", handleKeydown);

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
