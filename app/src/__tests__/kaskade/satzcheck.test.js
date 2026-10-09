import { describe, expect, it } from 'vitest'
import { cuesInWindow, summarize, verdict } from '../../lib/satzcheck'

describe('summarize', () => {
  it('counts ratings and ignores unrated cues', () => {
    const s = summarize(['v', 'v', 'h', 'v', 'h', 's', 'h', 's', 'v', null])
    expect(s).toEqual({ v: 4, h: 3, s: 2, rated: 9, coverage: 78 })
  })

  it('is 0 % with nothing rated', () => {
    expect(summarize([null, null]).coverage).toBe(0)
  })

  it('counts "mit Hilfe" as covered', () => {
    expect(summarize(['h', 'h', 'h', 's']).coverage).toBe(75)
  })
})

describe('verdict (same gates as the server)', () => {
  it.each([
    [75, 'simple', null, '2A', 'phase1-done'],
    [74, 'simple', null, '1', 'phase1'],
    [80, 'adult', 2000, '2B', 'ready-2b'],
    [95, 'adult', 1500, '2A', '2a-words'],
    [80, 'adult', null, '2A', '2a-words'],
    [79, 'adult', 2500, '2A', '2a'],
    [60, 'adult', 2500, '2A', '2a'],
    [59, 'adult', 2500, '2A', 'too-hard']
  ])('%i %% %s words=%s → %s', (coverage, type, words, phase, key) => {
    const v = verdict(coverage, type, words)
    expect(v.phase).toBe(phase)
    expect(v.key).toBe(key)
  })
})

describe('cuesInWindow', () => {
  const cues = [{ start: 1 }, { start: 100 }, { start: 179.9 }, { start: 180 }, { start: 400 }]
  it('keeps cues starting inside the window and remembers their index', () => {
    expect(cuesInWindow(cues, 0).map((c) => c.index)).toEqual([0, 1, 2])
    expect(cuesInWindow(cues, 150).map((c) => c.index)).toEqual([2, 3])
  })
})
