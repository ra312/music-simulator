/**
 * Twinkle Twinkle sheet music rendered with VexFlow (CDN ESM).
 * Melody notes are built from piano.sh PLAY_TWINKLE_PHRASE blocks.
 */

import {
  Renderer,
  Stave,
  StaveNote,
  Voice,
  Formatter,
  BarlineType,
} from "https://cdn.jsdelivr.net/npm/vexflow@4.2.5/build/esm/entry/vexflow.js";

const BEATS_PER_MEASURE = 4;

/**
 * @param {string} noteId e.g. C4, F#4
 */
export function noteIdToVfKey(noteId) {
  const m = noteId.match(/^([A-G])(#|b)?(\d+)$/);
  if (!m) return "c/4";
  return `${m[1].toLowerCase()}${m[2] ?? ""}/${m[3]}`;
}

/**
 * @param {number} sleepTime seconds until  note until next (from piano.sh)
 */
export function sleepToDuration(sleepTime) {
  return sleepTime >= 0.75 ? "h" : "q";
}

/** @param {string} duration VexFlow duration token */
function durationToBeats(duration) {
  if (duration === "w") return 4;
  if (duration === "h") return 2;
  if (duration === "q") return 1;
  if (duration === "8") return 0.5;
  return 1;
}

/**
 * Flatten all Twinkle phrases into one ordered melody list.
 * @param {Record<string, { notes: string[], times: number[] }>} twinklePhrases
 */
export function flattenTwinkleMelody(twinklePhrases) {
  /** @type {{ noteId: string, duration: string, phraseNum: number, phraseIndex: number, globalIndex: number }[]} */
  const melody = [];
  const phraseNums = Object.keys(twinklePhrases)
    .map(Number)
    .sort((a, b) => a - b);

  for (const phraseNum of phraseNums) {
    const phrase = twinklePhrases[String(phraseNum)];
    for (let i = 0; i < phrase.notes.length; i++) {
      melody.push({
        noteId: phrase.notes[i],
        duration: sleepToDuration(phrase.times[i]),
        phraseNum,
        phraseIndex: i,
        globalIndex: melody.length,
      });
    }
  }
  return melody;
}

/**
 * Split melody into measures (4/4) without breaking note entries.
 * @param {ReturnType<typeof flattenTwinkleMelody>} melody
 */
function splitIntoMeasures(melody) {
  /** @type {typeof melody[]} */
  const measures = [];
  /** @type {typeof melody} */
  let current = [];
  let beats = 0;

  for (const entry of melody) {
    const noteBeats = durationToBeats(entry.duration);
    if (beats + noteBeats > BEATS_PER_MEASURE && current.length > 0) {
      measures.push(current);
      current = [];
      beats = 0;
    }
    current.push(entry);
    beats += noteBeats;
    if (beats === BEATS_PER_MEASURE) {
      measures.push(current);
      current = [];
      beats = 0;
    }
  }
  if (current.length > 0) measures.push(current);
  return measures;
}

/** @param {ReturnType<typeof splitIntoMeasures>} measures @param {number} perSystem */
function chunkMeasuresIntoSystems(measures, perSystem = 4) {
  /** @type {ReturnType<typeof splitIntoMeasures>[]} */
  const systems = [];
  for (let i = 0; i < measures.length; i += perSystem) {
    systems.push(measures.slice(i, i + perSystem));
  }
  return systems;
}

export class TwinkleScore {
  /**
   * @param {HTMLElement} container
   * @param {Record<string, { notes: string[], times: number[] }>} twinklePhrases
   */
  constructor(container, twinklePhrases) {
    this.container = container;
    this.melody = flattenTwinkleMelody(twinklePhrases);
    /** @type {Map<number, SVGElement>} */
    this.noteElements = new Map();
    /** @type {Map<number, { noteId: string, phraseNum: number, phraseIndex: number }>} */
    this.noteMeta = new Map();
    this.cursorIndex = 0;
    this.practicePhraseNum = null;
    this.practicePhraseCursor = 0;
    /** @type {number | null} */
    this.highlightPhraseNum = null;

    this.render();
  }

  render() {
    this.container.innerHTML = "";
    this.noteElements.clear();
    this.noteMeta.clear();

    for (const entry of this.melody) {
      this.noteMeta.set(entry.globalIndex, {
        noteId: entry.noteId,
        phraseNum: entry.phraseNum,
        phraseIndex: entry.phraseIndex,
      });
    }

    const measures = splitIntoMeasures(this.melody);
    const systems = chunkMeasuresIntoSystems(measures, 4);

    const staveWidth = 720;
    const staveHeight = 110;
    const systemGap = 24;
    const totalHeight =
      systems.length * staveHeight + (systems.length - 1) * systemGap + 40;

    const renderer = new Renderer(this.container, Renderer.Backends.SVG);
    renderer.resize(staveWidth + 40, totalHeight);
    const context = renderer.getContext();
    context.setFont("Arial", 10);

    let y = 20;
    let isFirstSystem = true;

    for (const systemMeasures of systems) {
      const stave = new Stave(20, y, staveWidth);
      if (isFirstSystem) {
        stave.addClef("treble").addTimeSignature("4/4");
        isFirstSystem = false;
      } else {
        stave.setBegBarType(BarlineType.NONE);
      }
      stave.setContext(context).draw();

      /** @type {StaveNote[]} */
      const tickables = [];
      /** @type {number[]} */
      const globalIndices = [];

      for (const measure of systemMeasures) {
        for (const entry of measure) {
          const staveNote = new StaveNote({
            keys: [noteIdToVfKey(entry.noteId)],
            duration: entry.duration,
            autoStem: true,
          });
          staveNote.setAttribute("data-global-index", String(entry.globalIndex));
          staveNote.setAttribute("data-note-id", entry.noteId);
          staveNote.setAttribute("data-phrase", String(entry.phraseNum));
          tickables.push(staveNote);
          globalIndices.push(entry.globalIndex);
        }
      }

      const totalBeats = systemMeasures.reduce(
        (sum, measure) =>
          sum +
          measure.reduce((m, e) => m + durationToBeats(e.duration), 0),
        0
      );

      const voice = new Voice({ numBeats: totalBeats, beatValue: 4 });
      voice.setStrict(false);
      voice.addTickables(tickables);

      new Formatter().joinVoices([voice]).formatToStaveVoice(voice, stave);
      voice.draw(context, stave);

      tickables.forEach((staveNote, i) => {
        const svg = staveNote.getSVGElement();
        if (!svg) return;
        svg.classList.add("score-note");
        svg.setAttribute("data-global-index", String(globalIndices[i]));
        svg.setAttribute("data-note-id", staveNote.getAttribute("data-note-id") ?? "");
        this.noteElements.set(globalIndices[i], svg);
      });

      y += staveHeight + systemGap;
    }

    this.updateCursorVisual();
  }

  /** @param {number} globalIndex */
  jumpNote(globalIndex) {
    const el = this.noteElements.get(globalIndex);
    if (!el) return;
    el.classList.remove("jump");
    void el.offsetWidth;
    el.classList.add("jump");
    el.addEventListener(
      "animationend",
      () => el.classList.remove("jump"),
      { once: true }
    );
    this.cursorIndex = globalIndex + 1;
    this.updateCursorVisual();
  }

  /** @param {string} noteId */
  jumpAllMatchingPitch(noteId) {
    for (const [index, el] of this.noteElements) {
      const meta = this.noteMeta.get(index);
      if (meta?.noteId === noteId) {
        el.classList.remove("jump");
        void el.offsetWidth;
        el.classList.add("jump");
        el.addEventListener(
          "animationend",
          () => el.classList.remove("jump"),
          { once: true }
        );
      }
    }
  }

  /** @param {string} noteId */
  jumpNextMatchingPitch(noteId) {
    for (let i = this.cursorIndex; i < this.melody.length; i++) {
      if (this.melody[i].noteId === noteId) {
        this.jumpNote(i);
        return true;
      }
    }
    for (let i = 0; i < this.cursorIndex; i++) {
      if (this.melody[i].noteId === noteId) {
        this.jumpNote(i);
        return true;
      }
    }
    return false;
  }

  /**
   * Called when the user plays a note on the piano (not autoplay).
   * @param {string} noteId
   * @param {{ practicingPhrase: number | null, freePlay: boolean }} ctx
   */
  onUserNote(noteId, ctx) {
    if (ctx.practicingPhrase != null) {
      const phraseNotes = this.melody.filter((n) => n.phraseNum === ctx.practicingPhrase);
      const expected = phraseNotes[this.practicePhraseCursor];
      if (expected && expected.noteId === noteId) {
        this.jumpNote(expected.globalIndex);
        this.practicePhraseCursor += 1;
        if (this.practicePhraseCursor >= phraseNotes.length) {
          this.practicePhraseCursor = 0;
        }
      } else {
        this.jumpNextMatchingPitch(noteId);
      }
      return;
    }

    if (ctx.freePlay) {
      this.jumpNextMatchingPitch(noteId);
    }
  }

  /** @param {number | null} phraseNum */
  setPracticePhrase(phraseNum) {
    this.practicePhraseNum = phraseNum;
    this.practicePhraseCursor = 0;
    this.highlightPhraseNum = phraseNum;
    this.updateCursorVisual();
  }

  /** @param {number | null} phraseNum */
  highlightPhrase(phraseNum) {
    this.highlightPhraseNum = phraseNum;
    this.updateCursorVisual();
  }

  resetCursor() {
    this.cursorIndex = 0;
    this.practicePhraseCursor = 0;
    this.updateCursorVisual();
  }

  updateCursorVisual() {
    for (const [index, el] of this.noteElements) {
      el.classList.remove("current", "phrase-highlight");
      const meta = this.noteMeta.get(index);
      if (index === this.cursorIndex) {
        el.classList.add("current");
      }
      if (
        this.highlightPhraseNum != null &&
        meta?.phraseNum === this.highlightPhraseNum
      ) {
        el.classList.add("phrase-highlight");
      }
    }
  }

  /** Global index for phrase-local note position. */
  globalIndexFor(phraseNum, phraseIndex) {
    const entry = this.melody.find(
      (n) => n.phraseNum === phraseNum && n.phraseIndex === phraseIndex
    );
    return entry?.globalIndex ?? null;
  }
}
