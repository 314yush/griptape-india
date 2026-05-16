export function buildSubmittedMessage(displayName?: string): string {
  const who = displayName?.trim()
    ? `Hi ${displayName.trim()}, `
    : "Hi, ";
  return `${who}we've received your Learning Challenge application. Our team will get back within two weeks. — Griptape India`;
}
