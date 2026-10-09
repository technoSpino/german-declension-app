import { describe, expect, it } from 'vitest'
import { markGlossary, paragraphs } from '../../lib/reader'

const G = [
  { term: 'Heizung', gloss: 'heating' },
  { term: 'Heizungsrohr', gloss: 'heating pipe' },
  { term: 'Miete', gloss: 'rent' }
]

describe('markGlossary', () => {
  it('marks whole-word glossary terms and keeps the text intact', () => {
    const p = 'Die Heizung ist kalt, und die Miete ist hoch.'
    const segs = markGlossary(p, G)
    expect(segs.map((s) => s.text).join('')).toBe(p)
    expect(segs.filter((s) => s.entry).map((s) => s.text)).toEqual(['Heizung', 'Miete'])
  })

  it('prefers the longest term and ignores parts of other words', () => {
    const segs = markGlossary('Das Heizungsrohr ist alt. Mieter zahlen.', G)
    expect(segs.filter((s) => s.entry).map((s) => s.entry.gloss)).toEqual(['heating pipe'])
  })

  it('marks every occurrence', () => {
    expect(markGlossary('Miete, Miete, Miete!', G).filter((s) => s.entry)).toHaveLength(3)
  })

  it('handles an empty glossary', () => {
    expect(markGlossary('Hallo.', [])).toEqual([{ text: 'Hallo.' }])
  })
})

describe('paragraphs', () => {
  it('splits on blank lines', () => {
    expect(paragraphs('Eins.\n\nZwei.\n \nDrei.')).toEqual(['Eins.', 'Zwei.', 'Drei.'])
  })
})
