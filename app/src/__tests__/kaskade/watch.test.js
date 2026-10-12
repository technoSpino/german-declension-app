import { describe, expect, it } from 'vitest'
import { clipStatus, clock, formatTime, jobLabel, inside, isNonSpeech, LEAD, lineAt, rangeStart, resumeAt, seekTarget, shouldPause, shownLine, speechCues, stepLine } from '../../lib/watch'

const CUES = [
  { start: 1, end: 2.5, text: 'Wo waren Sie gestern Abend?' },
  { start: 3, end: 4, text: 'Zu Hause.' },
  { start: 6, end: 8, text: 'Das glaube ich Ihnen nicht.' }
]

describe('non-speech cues', () => {
  it('skips music and sound cues like the server', () => {
    expect(isNonSpeech('♪ La la la ♪')).toBe(true)
    expect(isNonSpeech('* Stimmen und Lachen *')).toBe(true)
    expect(isNonSpeech('[Klopfen]')).toBe(true)
    expect(isNonSpeech('(dumpf)')).toBe(true)
    expect(isNonSpeech('(leise) Komm her.')).toBe(false)
    expect(isNonSpeech('Na?')).toBe(false)
    expect(speechCues([...CUES, { start: 9, end: 10, text: '(schreit)' }])).toHaveLength(3)
  })
})

describe('cue navigation', () => {
  it('finds the line at a time (the last one that started)', () => {
    expect(lineAt(CUES, 0.5)).toBe(-1)
    expect(lineAt(CUES, 1)).toBe(0)
    expect(lineAt(CUES, 2.7)).toBe(0) // between lines: still the last line
    expect(lineAt(CUES, 3.5)).toBe(1)
    expect(lineAt(CUES, 100)).toBe(2)
    expect(inside(CUES, 0, 2.7)).toBe(false)
    expect(inside(CUES, 1, 3.5)).toBe(true)
  })

  it('steps to the previous and next line from the shown line, clamped', () => {
    expect(stepLine(CUES, 1, 1)).toBe(2)
    expect(stepLine(CUES, 1, -1)).toBe(0)
    expect(stepLine(CUES, 0, -1)).toBe(0)
    expect(stepLine(CUES, -1, 1)).toBe(0) // before the first line → the first line
    expect(stepLine(CUES, 2, 1)).toBe(2)
    expect(stepLine([], 0, 1)).toBe(-1)
  })

  it('auto-pauses once at the end of each line', () => {
    expect(shouldPause(CUES, 2.0, null)).toBe(-1) // still speaking
    expect(shouldPause(CUES, 2.6, null)).toBe(0) // line 0 over → pause
    expect(shouldPause(CUES, 2.7, 0)).toBe(-1) // already paused for line 0 → play on
    expect(shouldPause(CUES, 4.1, 0)).toBe(1)
  })
})

describe('tight line changes (#18)', () => {
  // Tatort: Schweigen — 29 % of line changes have a 0.12 s gap; some lines are back to back.
  const TIGHT = [
    { start: 140.0, end: 143.56, text: 'Was haben Sie da gesehen?' },
    { start: 143.68, end: 146.0, text: 'Nichts. Ich war gar nicht da.' },
    { start: 146.0, end: 148.5, text: 'Das glaube ich Ihnen nicht.' },
    { start: 150.0, end: 152.0, text: 'Gehen Sie.' }
  ]

  it('never shows the next line before the current one has ended', () => {
    expect(shownLine(TIGHT, 143.45)).toBe(0) // 0.15 s lead would reach 143.60 > 143.56 … still line 0
    expect(shownLine(TIGHT, 143.55)).toBe(0)
    expect(shownLine(TIGHT, 143.56)).toBe(1) // line 0 over, inside the 0.12 s gap: next line may show
    expect(shownLine(TIGHT, 145.99)).toBe(1) // gap 0: line 1 until its very end
    expect(shownLine(TIGHT, 146.0)).toBe(2)
    expect(shownLine(TIGHT, 149.0)).toBe(2) // real gap: the last line stays …
    expect(shownLine(TIGHT, 149.86)).toBe(3) // … the next appears at most LEAD early
    expect(shownLine(TIGHT, 149.8)).toBe(2)
    expect(LEAD).toBe(0.15)
  })

  it('keeps the line auto-pause stopped after, wherever the playhead overshot to', () => {
    expect(shownLine(TIGHT, 143.6, 0)).toBe(0) // paused in the 0.12 s gap
    expect(shownLine(TIGHT, 146.03, 1)).toBe(1) // paused a frame into the back-to-back line
    expect(shownLine(TIGHT, 146.03, -1)).toBe(2) // played on: the new line
  })

  it('pauses for the line just heard, also with gap 0.12 s and gap 0', () => {
    expect(shouldPause(TIGHT, 143.5, null, 143.48)).toBe(-1)
    expect(shouldPause(TIGHT, 143.58, null, 143.54)).toBe(0) // in the gap
    expect(shouldPause(TIGHT, 143.70, null, 143.54)).toBe(0) // tick overshot into line 1
    expect(shouldPause(TIGHT, 143.70, 0, 143.54)).toBe(-1) // once
    expect(shouldPause(TIGHT, 146.02, 0, 145.99)).toBe(1) // back to back: line 1 just ended
    expect(shouldPause(TIGHT, 146.02, 1, 145.99)).toBe(-1)
    expect(shouldPause(TIGHT, 146.5, 0, 140.0)).toBe(-1) // a jump, not playback: no pause for line 1
  })

  it('← / → / R from the held line, and seeking never lands in the previous line', () => {
    expect(stepLine(TIGHT, shownLine(TIGHT, 146.03, 1), 1)).toBe(2) // not 3: line 2 is still unheard
    expect(seekTarget(TIGHT, 0)).toBeCloseTo(139.9)
    expect(seekTarget(TIGHT, 1)).toBeCloseTo(143.58) // 0.1 s lead-in fits in the gap
    expect(seekTarget(TIGHT, 2)).toBe(146.0) // back to back: start exactly at the line
    expect(shownLine(TIGHT, seekTarget(TIGHT, 2))).toBe(2)
    expect(shownLine(TIGHT, seekTarget(TIGHT, 1))).toBe(1)
  })

  it('resumes at the saved position unless it is at the very end', () => {
    expect(resumeAt(754.2, 5360)).toBe(754.2)
    expect(resumeAt(1, 5360)).toBe(0)
    expect(resumeAt(5358, 5360)).toBe(0)
  })

  it('formats clip times', () => {
    expect(formatTime(754)).toBe('12:34')
    expect(formatTime(5361)).toBe('1:29:21')
    expect(formatTime(0)).toBe('0:00')
  })
})

describe('clip conversion status', () => {
  it('explains converting and failed clips, nothing for ready ones', () => {
    expect(clipStatus({ status: 'converting' })).toMatch(/umgewandelt/)
    expect(clipStatus({ status: 'original' })).toMatch(/Originaldatei/)
    expect(clipStatus({ status: 'ready' })).toBe('')
  })
})

describe('Mediathek job progress', () => {
  const MB = 1024 * 1024
  it('describes each phase in German', () => {
    expect(jobLabel({ status: 'running', phase: 'start', downloaded: 0 })).toBe('Verbinde mit der Mediathek …')
    expect(jobLabel({ status: 'running', phase: 'download', downloaded: 38 * MB, total: 145 * MB, speed: 7.9 * MB })).toBe('38 von 145 MB · 7,9 MB/s')
    expect(jobLabel({ status: 'running', phase: 'download', downloaded: 2.5 * MB, total: null })).toBe('2,5 MB')
    expect(jobLabel({ status: 'running', phase: 'convert', downloaded: 1 })).toMatch(/vorbereitet/)
    expect(jobLabel({ status: 'error', message: 'Geo-Sperre' })).toBe('Geo-Sperre')
    expect(jobLabel({ status: 'done' })).toBe('Fertig.')
  })
})

describe('plan ranges (#16)', () => {
  it('formats range times as minutes past an hour', () => {
    expect(clock(1814)).toBe('30:14')
    expect(clock(5361)).toBe('89:21')
    expect(clock(0)).toBe('0:00')
  })

  it('starts at the range, resumes inside it, catches up when behind', () => {
    expect(rangeStart(1814, 3640, 1812)).toMatchObject({ at: 1814, reached: false, note: 'Heute: 30:14–60:40.' })
    expect(rangeStart(1814, 3640, 0)).toMatchObject({ at: 1814 })
    expect(rangeStart(1814, 3640, 1200)).toMatchObject({ at: 1200, note: 'Ab deiner Position (20:00) bis 60:40.' })
    expect(rangeStart(1814, 3640, 2400)).toMatchObject({ at: 2400, note: 'Weiter ab 40:00 bis 60:40.' })
    expect(rangeStart(0, 1814, 1812)).toMatchObject({ reached: true })
    expect(rangeStart(2, 4, 0)).toMatchObject({ at: 2, reached: false }) // a short range: not "reached" before it starts
  })
})
