// Shared helpers for the patient/contact linkage flow.
// Used by generateLinkCode, linkContact, getMyRole, getLinkedPatientData.

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function randomCode() {
  let out = "";
  for (let i = 0; i < 6; i++) out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return out;
}

export function normalizeCode(raw) {
  if (!raw) return "";
  return String(raw).toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function formatCode(code) {
  const c = normalizeCode(code);
  if (c.length !== 6) return c;
  return c.slice(0, 3) + "-" + c.slice(3);
}