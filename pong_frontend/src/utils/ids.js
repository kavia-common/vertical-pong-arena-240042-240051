// PUBLIC_INTERFACE
export function makeId(prefix = "") {
  /** Make a small non-crypto id for UI lists/events. */
  return `${prefix}${Math.random().toString(16).slice(2)}${Date.now().toString(16).slice(2)}`;
}
