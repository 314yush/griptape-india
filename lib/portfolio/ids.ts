// Learners log in with their Griptape ID. Supabase Auth needs an email, so each ID maps to a
// placeholder address on the reserved .invalid TLD (never emailed).

/** "gt 7k2m9q", "7K2M9Q", "GT-7K2M9Q" → "GT-7K2M9Q". Returns null if it can't be an ID. */
export function normalizeLearnerId(input: string): string | null {
  const raw = input.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const body = raw.startsWith("GT") && raw.length === 8 ? raw.slice(2) : raw;
  return /^[A-Z0-9]{6}$/.test(body) ? `GT-${body}` : null;
}

export function learnerEmail(learnerId: string) {
  return `${learnerId.toLowerCase()}@learner.invalid`;
}
