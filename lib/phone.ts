/** Normalise a Zimbabwe number to +263XXXXXXXXX. Returns null if it doesn't look valid. */
export function normalizeZimPhone(input: string): string | null {
  let d = input.replace(/[^\d+]/g, "");
  if (d.startsWith("+")) d = d.slice(1);
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("263")) d = d.slice(3);
  if (d.startsWith("0")) d = d.slice(1);
  if (!/^\d{9}$/.test(d)) return null;
  return `+263${d}`;
}

/** +263783397863 → 078 339 7863 */
export function displayPhone(p: string | null | undefined) {
  if (!p) return "";
  const m = p.match(/^\+263(\d{2})(\d{3})(\d{4})$/);
  return m ? `0${m[1]} ${m[2]} ${m[3]}` : p;
}

/** Digits only, for wa.me links. */
export function waDigits(p: string) {
  return p.replace(/\D/g, "");
}
