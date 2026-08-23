/** Join conditional class names; drops falsy values. */
export function cn(...parts) {
  return parts.flat(Infinity).filter(Boolean).join(' ')
}
