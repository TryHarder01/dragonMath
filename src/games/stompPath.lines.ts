// Stomp Path's spoken lines. See "How Ember talks" in AGENTS.md; `just check` checks them.
// Numbers here are plain numerals (not `word()`): the path runs to 100, past what `word()` covers.

export const lines = {
  intro: 'Stomp Path! Help the T-rex hop home!',

  // Predict-then-stomp asks (L1/L2).
  hopForwardAsk: (start: number, amount: number) => `The T-rex is on ${start}. Hop ${amount}. Where will it land?`,
  hopBackAsk: (start: number, amount: number) => `The T-rex is on ${start}. Hop back ${amount} to the pond. Where will it land?`,
  stompPrompt: 'Now you stomp! Tap the foot for every hop.',

  // Ten-hops (L3), skip counting (L4), tens in one jump (L5).
  tenHopAsk: (start: number, hops: number, direction: 1 | -1) =>
    `${start}. ${hops === 1 ? 'One' : 'Two'} big ten-${hops === 1 ? 'hop' : 'hops'}${direction === -1 ? ' back' : ''}! Where does it land?`,
  skipAsk: (step: number, s1: number, s2: number, s3: number) => {
    const direction = s2 > s1 ? 1 : -1;
    return `Hopping by ${step === 2 ? 'twos' : step === 5 ? 'fives' : 'tens'}${direction === -1 ? ', going back' : ''}. ${s1}. ${s2}. ${s3}. Where next?`;
  },
  tensAsk: (start: number, direction: 1 | -1, amount: number) => `${start} ${direction === 1 ? 'plus' : 'minus'} ${amount}. Where does the T-rex land?`,

  // Open number line (L6/L7).
  addHopsAsk: (start: number, amount: number) => `${start} plus ${amount}. Tens first, then ones!`,
  subHopsAsk: (start: number, amount: number) => `${start} minus ${amount}. Tens first, then ones!`,

  // Estimation (L8).
  estimateAsk: (target: number) => `Where does ${target} live? Tap the path!`,
  estimateHintStart: "Let's count. Find the nearest big number.",
  estimateAnchor: (anchor: number) => `Start at ${anchor}. Count the tens.`,
  estimateOnesMore: (ones: number, back: boolean, target: number) => `${ones} more${back ? ' back' : ''}. ${target}!`,
  estimateFlagPrompt: (target: number) => `Tap the glowing flag for ${target}.`,
  estimateClose: "Close! It's right here.",

  // Hints (playHint, on the first miss).
  hintWindow: "Watch! Don't count the start. Count each new square.",
  hintTenHop: 'Watch! Make each big ten-hop. The ones stay the same.',
  hintSkip: (step: number) => `Watch! Keep the same ${step}-hop each time.`,
  hintOpenLine: 'Watch! Tens first, then ones!',
  crossTen: (boundary: number, more: number, back: boolean) => `Go to ${boundary}. ${more} more${back ? ' back' : ''}.`,
  hintWalkPath: "Watch! Let's walk the path.",
  missAgain: 'Look where the hops land. Try again.',

  // Praise.
  bigHopsFirst: 'Big hops first. Smart!',
  countedEveryStomp: 'You counted every stomp!',
};
