export function safeNextPath(raw: unknown, fallback = "/profile"): string {
  const path = typeof raw === "string" ? raw.trim() : "";
  if (path.startsWith("/") && !path.startsWith("//")) {
    return path;
  }
  return fallback;
}
