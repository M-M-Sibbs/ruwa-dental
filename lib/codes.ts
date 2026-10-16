const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I to avoid confusion

function randomChars(n: number) {
  const bytes = crypto.getRandomValues(new Uint8Array(n));
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

/** e.g. RDC-EC159C */
export const newTrackingCode = () => `RDC-${randomChars(6)}`;

/** e.g. PT-2610-7D870 (year + month + 5 random) */
export function newPatientNumber(now = new Date()) {
  const yy = String(now.getUTCFullYear()).slice(2);
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `PT-${yy}${mm}-${randomChars(5)}`;
}
