// PUBLIC_INTERFACE
export function clamp(v, min, max) {
  /** Clamp number between min and max. */
  return Math.max(min, Math.min(max, v));
}
