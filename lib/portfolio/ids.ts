// Supabase Auth needs an email per user, so each learner ID maps to a placeholder
// address on the reserved .invalid TLD (never emailed).
export function learnerEmail(learnerId: string) {
  return `${learnerId.toLowerCase()}@learner.invalid`;
}

/** How names are matched at sign-in: "  Aarav   MEHTA " → "aarav mehta". */
export function nameKey(name: string) {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}
