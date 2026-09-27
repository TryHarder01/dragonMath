// Tiny WebAudio sound effects, synthesized so there are no asset files.

let ctx: AudioContext | null = null;

type NavigatorWithAudioSession = Navigator & {
  audioSession?: { type: string };
};

function ac(): AudioContext {
  const audioSession = (navigator as NavigatorWithAudioSession).audioSession;
  if (audioSession) audioSession.type = 'playback';
  ctx ??= new AudioContext();
  if (ctx.state !== 'running') void ctx.resume();
  return ctx;
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', vol = 0.18) {
  const a = ac();
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t = a.currentTime + start;
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(vol, t + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.connect(gain).connect(a.destination);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

/** Call from a user gesture so browsers allow audio later. */
export function unlockAudio() {
  ac();
}

export const sfx = {
  tap: () => tone(660, 0, 0.08, 'triangle', 0.12),
  count: (n: number) => tone(440 + n * 40, 0, 0.12, 'triangle', 0.12),
  // Soft rising shimmer for Ember's warm breath.
  glow: () => [392, 494, 587, 698].forEach((f, i) => tone(f, i * 0.05, 0.4, 'sine', 0.08)),
  right: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.3, 'triangle')),
  hmm: () => {
    tone(330, 0, 0.18, 'sine', 0.12);
    tone(294, 0.16, 0.25, 'sine', 0.12);
  },
  stomp: () => tone(90, 0, 0.2, 'square', 0.15),
  hatch: () => [392, 523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.07, 0.35, 'triangle', 0.14)),
};
