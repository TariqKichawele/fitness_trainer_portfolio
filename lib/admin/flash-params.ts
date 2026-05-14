export function flashErrorFromParam(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}
