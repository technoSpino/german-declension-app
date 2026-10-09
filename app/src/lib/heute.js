// Pure helpers for the Heute page (testable without a browser).

const LEVELS = { A1: 10, 'A1+': 15, A2: 30, 'A2+': 40, B1: 50, 'B1+': 60, B2: 70, 'B2+': 80, C1: 90 }

/** Position of a CEFR level on a 0–100 bar (A1 … C1). */
export function levelToPct(level) {
  return level && LEVELS[level] != null ? LEVELS[level] : 0
}

/** Refold phase-2 targets per skill (Fahrplan table). */
export const PHASE2_TARGET = { lesen: 'B1', hoeren: 'A2', schreiben: 'A1', sprechen: 'A1' }

export function toMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

/** Block start/end in minutes since midnight plus share of the whole block day. */
export function layoutBlocks(blocks) {
  const start = toMinutes(blocks[0].start)
  const last = blocks[blocks.length - 1]
  const end = toMinutes(last.start) + last.minutes
  return {
    start,
    end,
    items: blocks.map((b) => ({ ...b, from: toMinutes(b.start), to: toMinutes(b.start) + b.minutes, share: b.minutes / (end - start) }))
  }
}

/** Where the "jetzt" marker sits (0–100 %), or null outside the block. */
export function nowMarker(blocks, minutesNow) {
  const { start, end } = layoutBlocks(blocks)
  if (minutesNow < start || minutesNow > end) return null
  return ((minutesNow - start) / (end - start)) * 100
}

/** Current local time in Berlin as minutes since midnight. */
export function berlinMinutes(date = new Date()) {
  const parts = new Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Berlin', hour: '2-digit', minute: '2-digit', hour12: false }).format(date)
  return toMinutes(parts)
}

/** The block to suggest next: the one running now if not done, else the first open one. */
export function nextBlock(blocks, done, minutesNow) {
  const open = blocks.filter((b) => b.kind !== 'pause' && !done.includes(b.id))
  if (!open.length) return null
  const now = layoutBlocks(blocks).items.find((b) => minutesNow >= b.from && minutesNow < b.to)
  if (now && open.some((b) => b.id === now.id)) return now
  return open[0]
}

/** Bar heights (px) for weekly active seconds, scaled to the busiest day or 2.5 h. */
export function weekBars(seconds, maxPx = 110) {
  const top = Math.max(2.5 * 3600, ...seconds)
  return seconds.map((s) => Math.round((s / top) * maxPx))
}

export function greeting(minutesNow) {
  if (minutesNow < 11 * 60) return 'Guten Morgen'
  if (minutesNow < 18 * 60) return 'Hallo'
  return 'Guten Abend'
}
