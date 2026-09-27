// Egg Stairs's spoken lines. See "How Ember talks" in AGENTS.md; `just check` checks them.

export const lines = {
  intro: "Egg Stairs! Let's count the rows!",
  askFirstRow: (t: number) => `One row of ${t}. How many eggs?`,
  askLandmark: (from: number, t: number, known: number, to: number) =>
    `You know this. ${from} rows of ${t} is ${known}. How many is ${to} rows?`,
  askUp: (from: number, known: number, step: number, t: number) =>
    `${from} rows is ${known}. Add ${step === 1 ? 'one more row' : `${step} more rows`} of ${t}. How many now?`,
  askDown: (from: number, known: number, step: number) =>
    `${from} rows is ${known}. Take away ${step === 1 ? 'one row' : `${step} rows`}. How many now?`,
  hintFirstRow: 'Count the eggs in one row.',
  hintCountOn: (known: number, step: number) => `Start at ${known}. Count on the new ${step === 1 ? 'row' : 'rows'}.`,
  hintCountBack: (known: number) => `Start at ${known}. Count back.`,
  hintResult: (to: number, t: number, answer: number) => `${to} rows of ${t} is ${answer}.`,
  walkUp: (t: number, total: number) => `plus ${t} is ${total}`,
  walkDown: (t: number, total: number) => `minus ${t} is ${total}`,
};
