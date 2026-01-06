import type { PoemTask, RequirementSpec } from "@/data/tasks";
import { getPoemTaskById } from "@/data/tasks";
import { getTaskIdForRound } from "@/lib/taskAssignment";

export function splitNonEmptyLines(text: string): string[] {
  return text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

// removes structural prefixes for word counting/content checks
function stripStructuralPrefix(line: string): string {
  let s = line.trim();
  s = s.replace(/^•\s*/, "");
  s = s.replace(/^\d{2}:\d{2}\s*/, "");
  return s.trim();
}

function wordsInLine(line: string): string[] {
  const s = stripStructuralPrefix(line);
  return s.trim() ? s.trim().split(/\s+/) : [];
}

export function countWords(text: string): number {
  const lines = splitNonEmptyLines(text);
  return lines.reduce((sum, l) => sum + wordsInLine(l).length, 0);
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function wordRegex(word: string, wholeWord: boolean, caseSensitive: boolean): RegExp {
  const w = escapeRegex(word);
  const body = wholeWord ? `\\b${w}\\b` : w;
  return new RegExp(body, caseSensitive ? "g" : "gi");
}

function includesWord(text: string, word: string, wholeWord: boolean, caseSensitive: boolean): boolean {
  const re = wordRegex(word, wholeWord, caseSensitive);
  return re.test(text);
}

function countWordOccurrences(text: string, word: string, wholeWord: boolean, caseSensitive: boolean): number {
  const re = wordRegex(word, wholeWord, caseSensitive);
  const matches = text.match(re);
  return matches ? matches.length : 0;
}

function countChar(text: string, char: string): number {
  if (!char) return 0;
  return text.split(char).length - 1;
}

function firstAlphaChar(line: string): string {
  const s = stripStructuralPrefix(line);
  const m = s.match(/[A-Za-z]/);
  return m ? m[0] : "";
}

export type RequirementResult = {
  id: string;
  label: string;
  passed: boolean;
  details?: string;
};

export type CheckResult = {
  passed: boolean;
  results: RequirementResult[];
};

function checkRequirement(req: RequirementSpec, poem: string): RequirementResult {
  const lines = splitNonEmptyLines(poem);
  const totalWords = countWords(poem);

  const pass = (passed: boolean, details?: string): RequirementResult => ({
    id: req.id,
    label: req.label,
    passed,
    details,
  });

  switch (req.type) {
    case "lineCount": {
      const ok = lines.length === req.exact;
      return pass(ok, `Lines: ${lines.length}/${req.exact}`);
    }

    case "wordCount": {
      const minOk = req.min == null ? true : totalWords >= req.min;
      const maxOk = req.max == null ? true : totalWords <= req.max;
      const ok = minOk && maxOk;
      return pass(ok, `Words: ${totalWords}${req.min != null ? ` (min ${req.min})` : ""}${req.max != null ? ` (max ${req.max})` : ""}`);
    }

    case "maxWordsPerLine": {
      const counts = lines.map((l) => wordsInLine(l).length);
      const worst = counts.length ? Math.max(...counts) : 0;
      const ok = counts.every((c) => c <= req.max);
      return pass(ok, `Max line words: ${worst}/${req.max}`);
    }

    case "mustIncludeWords": {
      const cs = req.caseSensitive ?? false;
      const ww = req.wholeWord ?? true;

      const present = req.words.filter((w) => includesWord(poem, w, ww, cs));
      if (req.mode === "all") {
        const ok = present.length === req.words.length;
        return pass(ok, ok ? "All required words found." : `Missing: ${req.words.filter((w) => !present.includes(w)).join(", ")}`);
      } else {
        const need = req.atLeast ?? 1;
        const ok = present.length >= need;
        return pass(ok, `Found ${present.length}/${need}: ${present.join(", ")}`);
      }
    }

    case "wordOccursExactly": {
      const cs = req.caseSensitive ?? false;
      const ww = req.wholeWord ?? true;
      const n = countWordOccurrences(poem, req.word, ww, cs);
      const ok = n === req.exactly;
      return pass(ok, `Occurrences of "${req.word}": ${n}/${req.exactly}`);
    }

    case "mustNotIncludeWords": {
      const cs = req.caseSensitive ?? false;
      const ww = req.wholeWord ?? true;
      const found = req.words.filter((w) => includesWord(poem, w, ww, cs));
      const ok = found.length === 0;
      return pass(ok, ok ? "No banned words found." : `Found banned: ${found.join(", ")}`);
    }

    case "noPunctuation": {
      const found = req.chars.filter((c) => countChar(poem, c) > 0);
      const ok = found.length === 0;
      return pass(ok, ok ? "OK" : `Contains: ${found.join(" ")}`);
    }

    case "punctuationExactCount": {
      const n = countChar(poem, req.char);
      const ok = n === req.count;
      return pass(ok, `"${req.char}" count: ${n}/${req.count}`);
    }

    case "everyLineStartsWithTimestamp": {
      const re = /^\d{2}:\d{2}\b/;
      const ok = lines.every((l) => re.test(l));
      return pass(ok, ok ? "OK" : "Some lines do not start with HH:MM.");
    }

    case "hasTimestampOneWordLine": {
      // timestamp + exactly one word after it
      const re = /^\d{2}:\d{2}\s+\S+$/;
      const ok = lines.some((l) => re.test(l));
      return pass(ok, ok ? "OK" : "No timestamp+one-word line found.");
    }

    case "eachLineContainsOneOf": {
      const cs = req.caseSensitive ?? false;
      const ww = req.wholeWord ?? true;
      const misses: number[] = [];
      lines.forEach((raw, idx) => {
        const line = stripStructuralPrefix(raw);
        const okLine = req.words.some((w) => includesWord(line, w, ww, cs));
        if (!okLine) misses.push(idx + 1);
      });
      const ok = misses.length === 0;
      return pass(ok, ok ? "OK" : `Missing required word on line(s): ${misses.join(", ")}`);
    }

    case "hasLineWithExactWordCount": {
      const ok = lines.some((l) => wordsInLine(l).length === req.words);
      return pass(ok, ok ? "OK" : `No line with exactly ${req.words} words.`);
    }

    default:
      return pass(false, "Unknown requirement type");
  }
}

export function checkPoemAgainstTask(poem: string, task: PoemTask): CheckResult {
  const results = task.requirements.map((r) => checkRequirement(r, poem));
  const passed = results.every((r) => r.passed);
  return { passed, results };
}

export function checkPoemAgainstRound(poem: string, roundIndex: number, sessionId: string): CheckResult & { taskId: string } {
  const taskId = getTaskIdForRound(roundIndex, sessionId);
  const task = getPoemTaskById(taskId);
  return { taskId, ...checkPoemAgainstTask(poem, task) };
}
