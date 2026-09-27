// Spoken prompts via the Web Speech API. Every instruction in the game goes
// through here, because players can't read yet.

let chosen: SpeechSynthesisVoice | null = null;
let lastPrompt = '';
// `?mute` in the URL silences speech (handy for automated checks), and `?fast`
// runs every pause ~20× quicker so scripts/playthrough.mjs can play whole rounds fast.
const params = new URLSearchParams(location.search);
let muted = params.has('mute');
const pace = params.has('fast') ? 0.05 : 1;

const PREFERRED = ['Samantha', 'Karen', 'Moira', 'Google US English', 'Microsoft Aria', 'Microsoft Jenny'];

function pickVoice(): SpeechSynthesisVoice | null {
  const voices = speechSynthesis.getVoices();
  for (const name of PREFERRED) {
    const v = voices.find((x) => x.name.includes(name));
    if (v) return v;
  }
  return voices.find((v) => v.lang.startsWith('en')) ?? null;
}

if ('speechSynthesis' in window) {
  chosen = pickVoice();
  speechSynthesis.addEventListener?.('voiceschanged', () => (chosen = pickVoice()));
}

export function setMuted(m: boolean) {
  muted = m;
  if (m) speechSynthesis?.cancel();
}

/** Speak text. Resolves when finished (or after a safety timeout). */
export function say(text: string, opts: { rate?: number; pitch?: number } = {}): Promise<void> {
  if (muted || !('speechSynthesis' in window)) return wait(300 + text.length * 40);
  if (speechSynthesis.speaking || speechSynthesis.pending) speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  if (chosen) u.voice = chosen;
  u.rate = opts.rate ?? 0.9;
  u.pitch = opts.pitch ?? 1.15;
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (!done) {
        done = true;
        resolve();
      }
    };
    u.onend = finish;
    u.onerror = finish;
    speechSynthesis.speak(u);
    setTimeout(finish, 1500 + text.length * 110);
  });
}

/** Speak an instruction and remember it for the 🔊 repeat button. */
export function prompt(text: string): Promise<void> {
  lastPrompt = text;
  return say(text);
}

export function repeatPrompt(): Promise<void> {
  return lastPrompt ? say(lastPrompt) : Promise.resolve();
}

export function wait(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms * pace));
}

const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];

export function word(n: number): string {
  return WORDS[n] ?? String(n);
}
