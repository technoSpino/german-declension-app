import { describe, it, expect } from 'vitest'
import {
  DRILLS,
  exercises,
  cheatSheet,
  normalizeAnswer,
  isCorrect,
  isOrderCorrect,
  shuffle,
  buildRound,
  buildBlitzPool
} from '../data/exercises.js'

const VALID_TYPES = ['choice', 'fill', 'order']
const VALID_CASES = ['nominativ', 'akkusativ', 'dativ', 'genitiv', null]

describe('exercise data integrity', () => {
  it('has unique ids', () => {
    const ids = exercises.map(e => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('only uses known drills, types and cases', () => {
    const drillIds = DRILLS.map(d => d.id)
    for (const e of exercises) {
      expect(drillIds, `${e.id} drill`).toContain(e.drill)
      expect(VALID_TYPES, `${e.id} type`).toContain(e.type)
      expect(VALID_CASES, `${e.id} case`).toContain(e.case)
      expect(e.answers.length, `${e.id} answers`).toBeGreaterThan(0)
      expect(e.explanation.length, `${e.id} explanation`).toBeGreaterThan(10)
    }
  })

  it('has enough items in every drill for a full round', () => {
    for (const drill of DRILLS) {
      const pool = drill.id === 'mixed' ? exercises : exercises.filter(e => e.drill === drill.id)
      expect(pool.length, drill.id).toBeGreaterThanOrEqual(drill.roundSize)
    }
  })

  it('fill prompts contain exactly one blank', () => {
    for (const e of exercises.filter(x => x.type === 'fill')) {
      expect(e.prompt.split('___').length, e.id).toBe(2)
    }
  })

  it('choice answers are always one of the options', () => {
    for (const e of exercises.filter(x => x.type === 'choice')) {
      expect(e.options, e.id).toContain(e.answers[0])
      expect(new Set(e.options).size, `${e.id} duplicate options`).toBe(e.options.length)
    }
  })

  it('order tokens match the canonical answer once punctuation is stripped', () => {
    for (const e of exercises.filter(x => x.type === 'order')) {
      expect(e.tokens.length, e.id).toBeGreaterThan(2)
      expect(isOrderCorrect(e, e.tokens), e.id).toBe(true)
      // Tokens themselves carry no punctuation
      for (const t of e.tokens) expect(t, e.id).not.toMatch(/[.,!?]/)
    }
  })

  it('never has the same question twice with different answers', () => {
    const byPrompt = new Map()
    for (const e of exercises.filter(x => x.type !== 'order')) {
      const key = `${e.type}:${e.prompt}:${e.hint}`
      if (byPrompt.has(key)) {
        expect(byPrompt.get(key).answers[0], `${e.id} vs ${byPrompt.get(key).id}`).toBe(e.answers[0])
      }
      byPrompt.set(key, e)
    }
  })

  it('two-way and fixed preposition drills only use Dativ/Akkusativ', () => {
    for (const e of exercises.filter(x => ['wechsel', 'fixed', 'adjective'].includes(x.drill))) {
      expect(['dativ', 'akkusativ'], e.id).toContain(e.case)
    }
  })

  it('cheat sheet lists all nine two-way prepositions', () => {
    expect(cheatSheet.twoWay).toEqual(['an', 'auf', 'hinter', 'in', 'neben', 'über', 'unter', 'vor', 'zwischen'])
    expect(cheatSheet.dativOnly).toContain('mit')
    expect(cheatSheet.akkusativOnly).toContain('für')
  })
})

describe('normalizeAnswer', () => {
  it('lowercases, trims and collapses whitespace', () => {
    expect(normalizeAnswer('  Dem   Alten ')).toBe('dem alten')
  })

  it('treats ß and ss as equal', () => {
    expect(normalizeAnswer('großen')).toBe(normalizeAnswer('grossen'))
  })

  it('ignores sentence punctuation', () => {
    expect(normalizeAnswer('Ich bleibe zu Hause, weil es regnet.')).toBe('ich bleibe zu hause weil es regnet')
  })

  it('handles null and undefined', () => {
    expect(normalizeAnswer(null)).toBe('')
    expect(normalizeAnswer(undefined)).toBe('')
  })
})

describe('isCorrect', () => {
  const ex = { answers: ['dem', 'im'] }

  it('accepts any listed answer regardless of case', () => {
    expect(isCorrect(ex, 'dem')).toBe(true)
    expect(isCorrect(ex, 'IM')).toBe(true)
    expect(isCorrect(ex, ' im ')).toBe(true)
  })

  it('rejects wrong answers and empty input', () => {
    expect(isCorrect(ex, 'den')).toBe(false)
    expect(isCorrect(ex, '')).toBe(false)
  })

  it('accepts ss for ß in adjective endings', () => {
    const adj = { answers: ['den großen'] }
    expect(isCorrect(adj, 'den grossen')).toBe(true)
    expect(isCorrect(adj, 'dem großen')).toBe(false)
  })
})

describe('isOrderCorrect', () => {
  const ex = exercises.find(e => e.id === 'ns-25')

  it('accepts chips in the canonical order', () => {
    expect(isOrderCorrect(ex, ['Ich', 'bleibe', 'zu Hause', 'weil', 'es', 'regnet'])).toBe(true)
  })

  it('accepts a listed alternative word order (Nebensatz first)', () => {
    expect(isOrderCorrect(ex, ['Weil', 'es', 'regnet', 'bleibe', 'ich', 'zu Hause'])).toBe(true)
  })

  it('rejects the verb in the wrong position', () => {
    expect(isOrderCorrect(ex, ['Ich', 'bleibe', 'zu Hause', 'weil', 'regnet', 'es'])).toBe(false)
  })

  it('accepts a pre-joined string', () => {
    expect(isOrderCorrect(ex, 'ich bleibe zu hause weil es regnet')).toBe(true)
  })
})

describe('shuffle', () => {
  it('returns a new array with the same elements', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8]
    const out = shuffle(input)
    expect(out).not.toBe(input)
    expect([...out].sort()).toEqual([...input].sort())
    expect(input).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
  })

  it('does not always return the input order', () => {
    const input = Array.from({ length: 20 }, (_, i) => i)
    const changed = Array.from({ length: 10 }, () => shuffle(input)).some(out => out.some((v, i) => v !== i))
    expect(changed).toBe(true)
  })
})

describe('buildRound', () => {
  it('returns the requested number of exercises from one drill', () => {
    const round = buildRound('wechsel', 10)
    expect(round).toHaveLength(10)
    expect(round.every(e => e.drill === 'wechsel')).toBe(true)
    expect(new Set(round.map(e => e.id)).size).toBe(10)
  })

  it('draws from every drill in mixed mode', () => {
    const round = buildRound('mixed', exercises.length)
    expect(new Set(round.map(e => e.drill)).size).toBe(DRILLS.length - 1)
  })

  it('returns an empty round for an unknown drill', () => {
    expect(buildRound('nope', 5)).toEqual([])
  })
})

describe('buildBlitzPool', () => {
  const pool = buildBlitzPool()

  it('only contains Dativ/Akkusativ questions', () => {
    expect(pool.length).toBeGreaterThan(50)
    expect(pool.every(q => q.answer === 'dativ' || q.answer === 'akkusativ')).toBe(true)
  })

  it('fills the blank with the canonical answer', () => {
    for (const q of pool) {
      expect(q.prompt, q.id).not.toContain('___')
    }
    const sample = pool.find(q => q.id === 'wp-01')
    expect(sample.prompt).toBe('Das Buch liegt auf dem Tisch.')
  })

  it('is reasonably balanced between the two cases', () => {
    const dativ = pool.filter(q => q.answer === 'dativ').length
    const ratio = dativ / pool.length
    expect(ratio).toBeGreaterThan(0.35)
    expect(ratio).toBeLessThan(0.65)
  })
})
