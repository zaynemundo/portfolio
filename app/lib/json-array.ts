/** SQLite (D1) stores array fields as JSON, so read them back as string[]. */
export function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}
