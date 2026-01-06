export type TaskUIItem = {
  icon: string;
  heading: string;
  text: string;
};

export type RequirementSpec =
  | { type: "lineCount"; id: string; label: string; exact: number }
  | { type: "wordCount"; id: string; label: string; min?: number; max?: number }
  | { type: "maxWordsPerLine"; id: string; label: string; max: number }
  | {
  type: "mustIncludeWords";
  id: string;
  label: string;
  words: string[];
  mode: "all" | "atLeast";
  atLeast?: number;
  caseSensitive?: boolean;
  wholeWord?: boolean;
}
  | {
  type: "wordOccursExactly";
  id: string;
  label: string;
  word: string;
  exactly: number;
  caseSensitive?: boolean;
  wholeWord?: boolean;
}
  | {
  type: "mustNotIncludeWords";
  id: string;
  label: string;
  words: string[];
  caseSensitive?: boolean;
  wholeWord?: boolean;
}
  | { type: "noPunctuation"; id: string; label: string; chars: string[] }
  | { type: "punctuationExactCount"; id: string; label: string; char: string; count: number }
  | { type: "everyLineStartsWithTimestamp"; id: string; label: string }
  | { type: "hasTimestampOneWordLine"; id: string; label: string }
  | {
  type: "eachLineContainsOneOf";
  id: string;
  label: string;
  words: string[];
  caseSensitive?: boolean;
  wholeWord?: boolean;
}
  | { type: "hasLineWithExactWordCount"; id: string; label: string; words: number };

export type PoemTask = {
  id: string;
  title: string;
  intro: string;
  uiItems: TaskUIItem[];
  taskLines: string[];
  requirements: RequirementSpec[];
};

export const POEM_TASKS: PoemTask[] = [
  // TASK 1 - University
  {
    id: "t1-university",
    title: "University poem",
    intro: "Write a short poem about a tired student at university.",
    uiItems: [
      { icon: "📏", heading: "Form", text: "Exactly 4 lines.\nMax 8 words per line.\nMax 32 words total." },
      { icon: "🔑", heading: "Must include", text: 'Include "Coffee" and "Midnight" (exact spelling and case).' },
      { icon: "❌", heading: "Avoid", text: 'Do not use the word "study" or name specific subjects.' },
    ],
    taskLines: [
      "Write a short poem about a tired student at university.",
      "Exactly 4 lines. Max 8 words per line. Max 32 words total.",
      'Include "Coffee" and "Midnight" (exact spelling and case).',
      'Do not use the word "study" and do not name specific subjects.',
    ],
    requirements: [
      { type: "lineCount", id: "lines-4", label: "Exactly 4 lines", exact: 4 },
      { type: "maxWordsPerLine", id: "maxwpl-8", label: "Max 8 words per line", max: 8 },
      { type: "wordCount", id: "maxwords-32", label: "Max 32 words total", max: 32 },
      {
        type: "mustIncludeWords",
        id: "must-coffee-midnight",
        label: 'Must include "Coffee" and "Midnight"',
        words: ["Coffee", "Midnight"],
        mode: "all",
        caseSensitive: true,
        wholeWord: true,
      },
      {
        type: "mustNotIncludeWords",
        id: "avoid-study",
        label: 'Must not include "study" (any case)',
        words: ["study"],
        caseSensitive: false,
        wholeWord: false,
      },
    ],
  },

  // TASK 2 - Rainy bus stop
  {
    id: "t2-rainy",
    title: 'Rainy bus stop',
    intro: 'Write a short poem about waiting at a rainy bus stop.',
    uiItems: [
      { icon: "🧩", heading: "Form", text: 'Exactly 5 lines.' },
      { icon: "📏", heading: "Length", text: "Max 7 words per line.\nMax 35 words total." },
      { icon: "🔑", heading: "Must include", text: 'Include "umbrella" and "puddle".' },
      { icon: "🚫", heading: "Avoid", text: 'Do not use the words "wet" or "soaked"' },
    ],
    taskLines: [
      "Write a short poem about waiting at a rainy bus stop.",
      'Exactly 5 lines.',
      "Max 7 words per line. Max 35 words total.",
      'Include the words "umbrella" and "puddle".',
      'Do not use the words "wet" or "soaked".',
    ],
    requirements: [
      { type: "lineCount", id: "lines-5", label: "Exactly 5 lines", exact: 5 },
      { type: "maxWordsPerLine", id: "maxwpl-7", label: "Max 7 words per line", max: 7 },
      { type: "wordCount", id: "maxwords-35", label: "Max 35 words total", max: 35 },
      {
        type: "mustIncludeWords",
        id: "must-umbrella-puddle",
        label: 'Must include "umbrella" and "puddle"',
        words: ["umbrella", "puddle"],
        mode: "all",
        caseSensitive: false,
        wholeWord: false,
      },
      {
        type: "mustNotIncludeWords",
        id: "avoid-wet",
        label: 'Must not include "wet" or "soaked" (any case)',
        words: ["wet", "soaked"],
        caseSensitive: false,
        wholeWord: true,
      },
    ],
  },

  // TASK 3 - Lost keys
  {
    id: "t3-lost-keys",
    title: "Lost keys at midnight",
    intro: "Write a short poem about realizing your keys are missing.",
    uiItems: [
      { icon: "🧱", heading: "Form", text: "Exactly 6 lines.\nMax 10 words per line.\nMax 60 words total." },
      { icon: "🔑", heading: "Exact words", text: 'Use "keys" exactly once and "pocket" exactly once.' },
      { icon: "🔊", heading: "Sound", text: 'Include at least 2 of: "jingle", "clink", "click".' },
      { icon: "🚫", heading: "Avoid", text: 'Do not use the words that include "stress", "panic", or "scared".' },
    ],
    taskLines: [
      "Write a short poem about realizing your keys are missing at midnight.",
      "Exactly 6 lines. Max 10 words per line. Max 60 words total.",
      'Use "keys" exactly once and "pocket" exactly once (exact spelling).',
      'Include at least 2 of: "jingle", "clink", "click".',
      'Do not use the words that include "stress", "panic", or "scared".',
    ],
    requirements: [
      { type: "lineCount", id: "lines-6", label: "Exactly 6 lines", exact: 6 },
      { type: "maxWordsPerLine", id: "maxwpl-10", label: "Max 10 words per line", max: 10 },
      { type: "wordCount", id: "maxwords-60", label: "Max 60 words total", max: 60 },
      {
        type: "wordOccursExactly",
        id: "keys-once",
        label: 'Word "keys" exactly once (exact spelling)',
        word: "keys",
        exactly: 1,
        caseSensitive: false,
        wholeWord: true,
      },
      {
        type: "wordOccursExactly",
        id: "pocket-once",
        label: 'Word "pocket" exactly once (exact spelling)',
        word: "pocket",
        exactly: 1,
        caseSensitive: false,
        wholeWord: true,
      },
      {
        type: "mustIncludeWords",
        id: "sounds-2",
        label: "At least 2 sound-words",
        words: ["jingle", "clink", "click"],
        mode: "atLeast",
        atLeast: 2,
        caseSensitive: false,
        wholeWord: false,
      },
      {
        type: "mustNotIncludeWords",
        id: "avoid-stress",
        label: 'Must not include "stress", "panic", or "scared" (any case)',
        words: ["stress", "panic", "scared"],
        caseSensitive: false,
        wholeWord: false,
      },
    ],
  },

  // TASK 4 - Cat
  {
    id: "t4-cat",
    title: "Cat on the windowsill",
    intro: "Write a short poem about a cat judging the room.",
    uiItems: [
      { icon: "🧩", heading: "Form", text: 'Exactly 5 lines.' },
      { icon: "🐾", heading: "Cat words", text: 'Each line must include one of: whiskers, paws, purr, tail, nap, meow.' },
      { icon: "📌", heading: "Special line", text: "At least one line must be exactly 2 words." },
      { icon: "🚫", heading: "Avoid", text: 'Do not include the word "cute".' },
    ],
    taskLines: [
      "Write a short poem about a cat judging the room from a windowsill.",
      'Exactly 5 lines.',
      "Each line must include at least one of: whiskers, paws, purr, tail, nap, meow.",
      "At least one line must be exactly 2 words.",
      'Do not include the word "cute".',
    ],
    requirements: [
      { type: "lineCount", id: "lines-5", label: "Exactly 5 lines", exact: 5 },
      {
        type: "eachLineContainsOneOf",
        id: "catword-eachline",
        label: "Each line contains a cat-word",
        words: ["whiskers", "paws", "purr", "tail", "nap", "meow"],
        caseSensitive: false,
        wholeWord: false,
      },
      { type: "hasLineWithExactWordCount", id: "line-2words", label: "Has a 2-word line", words: 2 },
      {
        type: "mustNotIncludeWords",
        id: "avoid-cute",
        label: 'Must not include "cute" (any case)',
        words: ["cute"],
        caseSensitive: false,
        wholeWord: true,
      },
    ],
  },

  // TASK 5 - Cooking eggs
  {
    id: "t5-egg-cooking",
    title: "Cooking eggs at 2am",
    intro: "Write a short poem about cooking eggs late at night.",
    uiItems: [
      { icon: "🍳", heading: "Form", text: "Exactly 5 lines.\nMax 10 words per line.\nMax 50 words total." },
      { icon: "🧂", heading: "Must include", text: 'Include "pan" and "salt".' },
      { icon: "✂️", heading: "Punctuation", text: "Use exactly 2 commas total.\nNo ! and no ?." },
      { icon: "🚫", heading: "Avoid", text: 'Do not use the word "fridge", "healthy", or "oil".' },
    ],
    taskLines: [
      "Write a short poem about cooking eggs late at night.",
      "Exactly 5 lines. Max 10 words per line. Max 50 words total.",
      'Include "pan" and "salt".',
      "Use exactly 2 commas total.",
      "No exclamation marks and no question marks.",
      'Do not use the word "fridge", "healthy", or "oil".',
    ],
    requirements: [
      { type: "lineCount", id: "lines-5", label: "Exactly 5 lines", exact: 5 },
      { type: "maxWordsPerLine", id: "maxwpl-10", label: "Max 10 words per line", max: 10 },
      { type: "wordCount", id: "maxwords-50", label: "Max 50 words total", max: 50 },
      {
        type: "mustIncludeWords",
        id: "must-pan-salt",
        label: 'Must include words "pan" and "salt" (exact spelling and case)',
        words: ["pan", "salt"],
        mode: "all",
        caseSensitive: true,
        wholeWord: true,
      },
      { type: "punctuationExactCount", id: "commas-2", label: "Exactly 2 commas", char: ",", count: 2 },
      { type: "noPunctuation", id: "no-!-?", label: "No ! and no ?", chars: ["!", "?"] },
      {
        type: "mustNotIncludeWords",
        id: "avoid-fridge",
        label: 'Must not include "fridge", "healthy", or "oil" (any case)',
        words: ["fridge", "healthy", "oil"],
        caseSensitive: false,
        wholeWord: false,
      },
    ],
  },

  // TASK 6 - Robot vs Human
  {
    id: "t6-robot",
    title: "Tiny robot wakes up",
    intro: "Write a short poem: Robot vs Human.",
    uiItems: [
      { icon: "🤖", heading: "Form", text: "Exactly 4 lines." },
      { icon: "📏", heading: "Length", text: "Max 9 words per line.\nMax 36 words total." },
      { icon: "🔑", heading: "Must include", text: 'Include "battery" and "blink".' },
      { icon: "❓", heading: "Punctuation", text: "Exactly ONE question mark total." },
    ],
    taskLines: [
      "Write a short poem where a tiny robot wakes up and talks to a human.",
      'Exactly 4 lines.',
      "Max 9 words per line. Max 36 words total.",
      'Include "battery" and "blink".',
      "Exactly ONE question mark in the entire poem.",
    ],
    requirements: [
      { type: "lineCount", id: "lines-4", label: "Exactly 4 lines", exact: 4 },
      { type: "maxWordsPerLine", id: "maxwpl-9", label: "Max 9 words per line", max: 9 },
      { type: "wordCount", id: "maxwords-36", label: "Max 36 words total", max: 72 },
      {
        type: "mustIncludeWords",
        id: "must-battery-blink",
        label: 'Must include "battery" and "blink"',
        words: ["battery", "blink"],
        mode: "all",
        caseSensitive: false,
        wholeWord: false,
      },
      { type: "punctuationExactCount", id: "qmark-1", label: "Exactly 1 question mark", char: "?", count: 1 },
    ],
  },

  // TASK 7 - Train station dawn
  {
    id: "t7-dawn-station",
    title: "Train station at dawn",
    intro: "Write a short poem about a train station at dawn.",
    uiItems: [
      { icon: "🚉", heading: "Form", text: "Exactly 6 lines.\nMax 11 words per line.\nMax 66 words total." },
      { icon: "🎨", heading: "Colors", text: "Use at least 3 color-words: gray, gold, blue, green, black, white." },
      { icon: "✂️", heading: "Punctuation", text: "No commas allowed." },
      { icon: "📌", heading: "Special line", text: "At least one line must be exactly 3 words." },
    ],
    taskLines: [
      "Write a short poem about a train station at dawn.",
      "Exactly 6 lines. Max 11 words per line. Max 66 words total.",
      "Use at least 3 of these color-words: gray, gold, blue, green, black, white.",
      "No commas allowed.",
      "At least one line must be exactly 3 words.",
    ],
    requirements: [
      { type: "lineCount", id: "lines-6", label: "Exactly 6 lines", exact: 6 },
      { type: "maxWordsPerLine", id: "maxwpl-11", label: "Max 11 words per line", max: 11 },
      { type: "wordCount", id: "maxwords-66", label: "Max 66 words total", max: 66 },
      {
        type: "mustIncludeWords",
        id: "colors-3",
        label: "At least 3 color-words",
        words: ["gray", "gold", "blue", "green", "black", "white"],
        mode: "atLeast",
        atLeast: 3,
        caseSensitive: false,
        wholeWord: false,
      },
      { type: "punctuationExactCount", id: "comma-0", label: "No commas", char: ",", count: 0 },
      { type: "hasLineWithExactWordCount", id: "line-3words", label: "Has a 3-word line", words: 3 },
    ],
  },

  // TASK 8 - Power outage timeline
  {
    id: "t8-outage-timeline",
    title: "Power outage timeline (timestamps)",
    intro: "Write a short poem as a timeline during a power outage.",
    uiItems: [
      { icon: "⏱️", heading: "Form", text: "Exactly 5 lines.\nEach line starts with HH:MM (24h)." },
      { icon: "📏", heading: "Length", text: "Max 7 words per line.\nMax 35 words total." },
      { icon: "🕯️", heading: "Exact words", text: 'Mention "candle" exactly once and "silence" exactly once.' },
      { icon: "📌", heading: "Special line", text: "One line must be: timestamp + exactly ONE word." },
    ],
    taskLines: [
      "Write a short poem as a timeline during a power outage.",
      "Exactly 5 lines. Each line starts with HH:MM (24h).",
      "Max 7 words per line. Max 35 words total.",
      'Mention "candle" exactly once and "silence" exactly once.',
      "One line must be: timestamp + exactly ONE word.",
    ],
    requirements: [
      { type: "lineCount", id: "lines-5", label: "Exactly 5 lines", exact: 5 },
      { type: "everyLineStartsWithTimestamp", id: "ts-each", label: "Each line starts with HH:MM" },
      { type: "maxWordsPerLine", id: "maxwpl-7", label: "Max 7 words per line", max: 7 },
      { type: "wordCount", id: "maxwords-35", label: "Max 35 words total", max: 35 },
      {
        type: "wordOccursExactly",
        id: "candle-once",
        label: 'Word "candle" exactly once',
        word: "candle",
        exactly: 1,
        caseSensitive: false,
        wholeWord: false,
      },
      {
        type: "wordOccursExactly",
        id: "silence-once",
        label: 'Word "silence" exactly once',
        word: "silence",
        exactly: 1,
        caseSensitive: false,
        wholeWord: false,
      },
      { type: "hasTimestampOneWordLine", id: "ts-oneword", label: "Has a timestamp + one-word line" },
    ],
  },
];

export function getPoemTaskById(id: string): PoemTask {
  const t = POEM_TASKS.find((x) => x.id === id);
  if (!t) throw new Error(`Unknown poem task id: ${id}`);
  return t;
}
