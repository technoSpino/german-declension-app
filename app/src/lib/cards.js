// Helpers for sentence cards.

/** Split a sentence around the first occurrence of `target` (for highlighting). */
export function splitTarget(sentence, target) {
  const i = target ? sentence.indexOf(target) : -1
  if (i === -1) return { pre: sentence, target: '', post: '' }
  return { pre: sentence.slice(0, i), target, post: sentence.slice(i + target.length) }
}
