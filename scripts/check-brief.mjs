// Brief check: catches a brief that leaves scope implicit before it's launched.
//
//   just brief-check <file>
//
// Required sections are the headings of docs/briefs/TEMPLATE.md. Flags:
// - a missing required section;
// - a `You own` path (its first backticked token) that doesn't exist and
//   isn't marked `(new)`;
// - a vague scope word in `You own`, `In scope` or `Out of scope`: "if any",
//   "etc", "as needed", "where appropriate", "and so on".

import { existsSync, readFileSync } from 'node:fs';

const REQUIRED_SECTIONS = [
  'Goal',
  'Why',
  'Current state (facts to rely on)',
  'You own',
  "Don't touch",
  'In scope',
  'Out of scope',
  'Done when',
  'Verify',
  'Finish',
];
const VAGUE = ['if any', 'etc', 'as needed', 'where appropriate', 'and so on'];
const SCOPE_SECTIONS = ['You own', 'In scope', 'Out of scope'];

const file = process.argv[2];
if (!file) {
  console.log('✗ usage: node scripts/check-brief.mjs <file>');
  process.exit(1);
}

const problems = [];
const lines = readFileSync(file, 'utf8').split('\n');

const sections = {};
let current = null;
lines.forEach((line, i) => {
  const heading = line.match(/^## (.+)$/);
  if (heading) {
    current = heading[1].trim();
    sections[current] = sections[current] ?? [];
    return;
  }
  if (current) sections[current].push({ line, num: i + 1 });
});

for (const name of REQUIRED_SECTIONS) {
  if (!(name in sections)) problems.push(`missing required section: "${name}"`);
}

for (const { line, num } of sections['You own'] ?? []) {
  const bullet = line.match(/^-\s+(.*)$/);
  const path = bullet?.[1].match(/`([^`]+)`/)?.[1];
  if (!path) continue;
  if (!existsSync(path) && !line.includes('(new)')) {
    problems.push(`${file}:${num}: "You own" path doesn't exist and isn't marked (new): ${path}`);
  }
}

// Only top-level scope items (unindented bullets/numbers), not indented
// sub-bullets, so a scope item that quotes these phrases as examples
// (like this checker's own "In scope" entry) isn't flagged.
for (const name of SCOPE_SECTIONS) {
  for (const { line, num } of sections[name] ?? []) {
    if (!/^(-\s|\d+\.\s)/.test(line)) continue;
    for (const phrase of VAGUE) {
      if (new RegExp(`\\b${phrase}\\b`, 'i').test(line)) {
        problems.push(`${file}:${num}: vague scope word "${phrase}" in "${name}": "${line.trim()}"`);
      }
    }
  }
}

for (const p of problems) console.log(`✗ ${p}`);
console.log(problems.length ? `${problems.length} problem(s)` : '✓ brief OK');
process.exit(problems.length ? 1 : 0);
