// Numbers as words for speech (0–20; bigger numbers are read from the numeral).
// Kept apart from voice.ts, which needs a browser, so scripts can load spoken lines.

const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];

export function word(n: number): string {
  return WORDS[n] ?? String(n);
}
