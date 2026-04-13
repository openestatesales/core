/** Max length aligned with the waitlist Edge Function. */
export const WAITLIST_EMAIL_MAX_LENGTH = 320;

/**
 * Pragmatic check for a single RFC-ish email (local@domain.tld).
 * Trims whitespace; does not normalize case (callers may lower-case before save).
 */
export function isValidWaitlistEmail(raw: string): boolean {
  const email = raw.trim();
  if (!email || email.length > WAITLIST_EMAIL_MAX_LENGTH) {
    return false;
  }
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
