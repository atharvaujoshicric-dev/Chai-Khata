let counter = 0;

/** Simple unique id generator that works in any browser context (no crypto dependency). */
export function uid(prefix: string): string {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}${counter.toString(36)}${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}
