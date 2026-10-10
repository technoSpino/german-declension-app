// Pure helpers for "Schauen & minen": subtitle navigation, testable without a browser.

const WRAPPED = /^\s*(?:\*[^*]*\*|\[[^\]]*\]|\([^)]*\))\s*$/

/** Sound/music cues, not speech: fully wrapped in *…*, […] or (…), or starting with ♪ (same rule as the server). */
export function isNonSpeech(text) {
  const t = (text ?? '').trim()
  return !t || /^[♪♫#]/.test(t) || WRAPPED.test(t)
}

/** Only the cues that are speech. */
export const speechCues = (cues) => cues.filter((c) => !isNonSpeech(c.text))

/** Index of the last cue that started at or before `t` (-1 before the first). Cues are sorted by start. */
export function lineAt(cues, t) {
  let lo = 0
  let hi = cues.length - 1
  let found = -1
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    if (cues[mid].start <= t + 0.001) {
      found = mid
      lo = mid + 1
    } else {
      hi = mid - 1
    }
  }
  return found
}

/** Whether `t` is inside cue `i` (its spoken part). */
export const inside = (cues, i, t) => i >= 0 && t >= cues[i].start && t < cues[i].end

/** Target line for ← / → from the line at `t`. */
export function stepLine(cues, t, dir) {
  if (!cues.length) return -1
  const i = lineAt(cues, t)
  if (dir > 0) return Math.min(cues.length - 1, i + 1)
  return Math.max(0, i - 1)
}

/**
 * Auto-pause: once the playhead passes the end of line `i`, pause — but only once per
 * line, so pressing play again continues to the next line.
 */
export function shouldPause(cues, t, pausedFor) {
  const i = lineAt(cues, t)
  if (i < 0 || i === pausedFor) return -1
  return t >= cues[i].end ? i : -1
}

/** Where to resume: the saved position, unless it's (almost) at the very end. */
export function resumeAt(position, duration) {
  if (!position || position < 2) return 0
  if (duration && position > duration - 5) return 0
  return position
}

/** 754 → "12:34", 5361 → "1:29:21". */
export function formatTime(sec) {
  const s = Math.max(0, Math.floor(sec || 0))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const pad = (n) => String(n).padStart(2, '0')
  return h ? `${h}:${pad(m)}:${pad(s % 60)}` : `${m}:${pad(s % 60)}`
}
