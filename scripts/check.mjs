// Merge guard: the cheap checks for mistakes that merging parallel branches
// makes, which typecheck doesn't catch.
//
//   just check        (also the first step of `just verify`)
//
// - Leftover conflict markers in any tracked text file.
// - Unbalanced { } in any `/* ---------- Name ---------- */` section of
//   src/styles.css. Git can keep a shared closing brace (e.g. the end of each
//   game's trailing @media block) only once, which silently nests every later
//   section inside a media query.

import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const problems = [];

const files = execSync('git ls-files', { encoding: 'utf8' }).split('\n').filter((f) => /\.(ts|mjs|js|css|html|md|json|toml|yaml)$|^justfile$/.test(f));
for (const file of files) {
  readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
    if (/^(<{7}|>{7})( |$)|^={7}$/.test(line)) problems.push(`${file}:${i + 1}: conflict marker`);
  });
}

let section = 'top of file';
let depth = 0;
readFileSync('src/styles.css', 'utf8').split('\n').forEach((line, i) => {
  const header = line.match(/^\/\* -{10} (.+?) -{10}/);
  if (header) {
    if (depth !== 0) problems.push(`src/styles.css: section "${section}" leaves ${depth} unclosed { before line ${i + 1}`);
    section = header[1];
    depth = 0;
  }
  depth += (line.match(/{/g) ?? []).length - (line.match(/}/g) ?? []).length;
});
if (depth !== 0) problems.push(`src/styles.css: section "${section}" ends with ${depth} unclosed {`);

for (const p of problems) console.log(`✗ ${p}`);
console.log(problems.length ? `${problems.length} problem(s)` : '✓ no conflict markers; every CSS section balanced');
process.exit(problems.length ? 1 : 0);
