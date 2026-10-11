// "Material für heute und morgen" on Heute (#16): pure helpers, testable without a browser.

const WEEKDAY = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']

/** "2026-10-12" → "Mo 12.10." */
export function dayLabel(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  const wd = WEEKDAY[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]
  return `${wd} ${d}.${m}.`
}

/** Heading of a group: "Heute (So 11.10.)", "Morgen (Mo 12.10.)", "Nächster Lerntag: Mo 19.10." */
export function groupTitle(group) {
  if (group.kind === 'today') return `Heute (${dayLabel(group.date)})`
  if (group.kind === 'tomorrow') return `Morgen (${dayLabel(group.date)})`
  return `Nächster Lerntag: ${dayLabel(group.date)}`
}

/**
 * The microphone works only in a secure context (HTTPS, or localhost). Items that need it
 * (Sprechen, Probeprüfung) become "zu tun" over plain http, with the HTTPS address as the fix.
 */
export function withSecureCheck(item, secure, httpsUrl) {
  if (item.check !== 'secure') return item
  if (secure) return { ...item, detail: `${item.detail} · Mikrofon geht hier ✓` }
  return { ...item, status: 'todo', detail: `${item.detail} — Aufnahmen gehen nur über ${httpsUrl}`, fix: { href: httpsUrl, label: 'Über HTTPS öffnen' } }
}

export const STATUS_LABEL = { ready: '✓ bereit', todo: '→ zu tun' }

/** "Kaufen bis Mo, 19.10." / "Einrichten bis Mi, 21.10." */
export function noticeTitle(n) {
  const [y, m, d] = n.by.split('-').map(Number)
  const wd = WEEKDAY[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]
  return `${n.type === 'book' ? 'Kaufen' : 'Einrichten'} bis ${wd}, ${d}.${m}.`
}

/** One line of what an item is: "Tatort: Schweigen · 0:00–30:14 · 30 min" */
export function itemLine(item) {
  return [item.title, item.part, item.minutes ? `${item.minutes} min` : null].filter(Boolean).join(' · ')
}
