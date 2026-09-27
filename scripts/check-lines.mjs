// Spoken-line check: every line Ember says follows "How Ember talks" (AGENTS.md).
//
//   just check        (runs this after the merge guard)
//
// Loads src/core/lines.ts and every src/games/<game>.lines.ts, renders each line
// (functions get sample numbers; a lines file can export `samples` with argument
// lists for lines that need something else; knip.json treats lines files as
// entry points, so that export isn't flagged as unused), splits it into sentences the way
// say() does, and flags:
// - a sentence of more than 7 words;
// - a word the guide bans (and the tone rule's never-words);
// - in a converted file (one with a sibling .lines.ts, or a src/core file), a
//   spoken string written inline in say()/prompt()/ask:/intro: instead of lines.

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { createServer } from 'vite';

const MAX_WORDS = 7;
const BANNED = ['equally', 'compare', 'digit', 'digits', 'situation', 'total', 'zap', 'blast', 'shoot', 'fire', 'chomp', 'enemy'];
// The last set ends in 0 so a trailing true/false switch is also rendered the false way.
const SAMPLE_ARGS = [[8, 5, 3, 2], [38, 5, 2, 3], [13, 5, 3, 2], [12, 4, 3, 0]];

const files = ['src/core/lines.ts', ...readdirSync('src/games').filter((f) => f.endsWith('.lines.ts')).map((f) => `src/games/${f}`)];
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
const problems = [];
let longest = { words: 0, text: '' };

for (const file of files) {
  const mod = await server.ssrLoadModule(`/${file}`);
  if (!mod.lines) {
    problems.push(`${file}: no \`lines\` export`);
    continue;
  }
  for (const [key, value] of Object.entries(mod.lines)) {
    for (const text of render(key, value, mod.samples?.[key], file)) checkText(`${file} lines.${key}`, text);
  }
}
await server.close();

// Inline spoken strings in converted files.
const converted = [
  ...readdirSync('src/core').filter((f) => f.endsWith('.ts') && f !== 'lines.ts' && f !== 'words.ts').map((f) => `src/core/${f}`),
  'src/main.ts',
  ...readdirSync('src/games').filter((f) => f.endsWith('.ts') && !f.endsWith('.lines.ts') && existsSync(`src/games/${f.replace(/\.ts$/, '.lines.ts')}`)).map((f) => `src/games/${f}`),
];
for (const file of converted) {
  readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
    if (/\b(say|prompt)\(\s*[`'"][^`'"]*[a-z]{2}/i.test(line) || /^\s*(ask|intro):\s*[`'"][^`'"]*[a-z]{2}/i.test(line)) {
      problems.push(`${file}:${i + 1}: spoken text written inline; put it in the lines file`);
    }
  });
}

for (const p of problems) console.log(`✗ ${p}`);
console.log(problems.length
  ? `${problems.length} spoken-line problem(s)`
  : `✓ spoken lines OK (${files.length} lines files; longest sentence ${longest.words} words: "${longest.text}")`);
process.exit(problems.length ? 1 : 0);

function render(key, value, samples, file) {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap((v, i) => render(`${key}[${i}]`, v, undefined, file));
  if (typeof value === 'function') {
    const argLists = samples ?? SAMPLE_ARGS.map((args) => args.slice(0, value.length));
    return argLists.flatMap((args) => {
      try {
        const out = value(...args);
        if (typeof out === 'string') return [out];
      } catch {}
      problems.push(`${file} lines.${key}: couldn't render with sample numbers; export \`samples.${key}\` with argument lists`);
      return [];
    });
  }
  return Object.entries(value).flatMap(([k, v]) => render(`${key}.${k}`, v, samples?.[k], file));
}

function checkText(where, text) {
  for (const sentence of text.match(/[^.!?]+[.!?]*/g) ?? []) {
    // Template placeholders ({a}, {total}) are filled in later, so they're not words yet.
    const words = sentence.replace(/\{\w+\}/g, 'N').trim().split(/\s+/).filter(Boolean);
    if (words.length > longest.words) longest = { words: words.length, text: sentence.trim() };
    if (words.length > MAX_WORDS) problems.push(`${where}: ${words.length} words: "${sentence.trim()}"`);
    const banned = words.map((w) => w.toLowerCase().replace(/[^a-z]/g, '')).filter((w) => BANNED.includes(w));
    if (banned.length) problems.push(`${where}: banned word "${banned[0]}": "${sentence.trim()}"`);
  }
}
