// Small DOM helpers.

export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  cls = '',
  children: (Node | string)[] = [],
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  for (const c of children) el.append(c);
  return el;
}

export function rand(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Answer choices near the right answer (plausible distractors), within [min, max]. */
export function nearChoices(answer: number, count: number, min: number, max: number): number[] {
  const near = shuffle([-2, -1, 1, 2].map((d) => answer + d).filter((n) => n >= min && n <= max));
  const rest = shuffle(
    Array.from({ length: max - min + 1 }, (_, i) => min + i).filter((n) => n !== answer && !near.includes(n)),
  );
  return shuffle([answer, ...[...near, ...rest].slice(0, count - 1)]);
}

export function burst(at: HTMLElement, emoji = '✨', n = 10) {
  const r = at.getBoundingClientRect();
  for (let i = 0; i < n; i++) {
    const s = h('span', 'spark', [emoji]);
    s.style.left = `${r.left + r.width / 2}px`;
    s.style.top = `${r.top + r.height / 2}px`;
    const ang = (Math.PI * 2 * i) / n;
    s.style.setProperty('--dx', `${Math.cos(ang) * 90}px`);
    s.style.setProperty('--dy', `${Math.sin(ang) * 90}px`);
    document.body.append(s);
    setTimeout(() => s.remove(), 800);
  }
}
