import { describe, expect, it } from 'vitest'
import { formatTime, inside, isNonSpeech, lineAt, resumeAt, shouldPause, speechCues, stepLine } from '../../lib/watch'

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

  it('steps to the previous and next line, clamped', () => {
    expect(stepLine(CUES, 3.5, 1)).toBe(2)
    expect(stepLine(CUES, 3.5, -1)).toBe(0)
    expect(stepLine(CUES, 0, -1)).toBe(0)
    expect(stepLine(CUES, 0, 1)).toBe(0) // before the first line → the first line
    expect(stepLine(CUES, 7, 1)).toBe(2)
    expect(stepLine([], 1, 1)).toBe(-1)
  })

  it('auto-pauses once at the end of each line', () => {
    expect(shouldPause(CUES, 2.0, null)).toBe(-1) // still speaking
    expect(shouldPause(CUES, 2.6, null)).toBe(0) // line 0 over → pause
    expect(shouldPause(CUES, 2.7, 0)).toBe(-1) // already paused for line 0 → play on
    expect(shouldPause(CUES, 4.1, 0)).toBe(1)
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
