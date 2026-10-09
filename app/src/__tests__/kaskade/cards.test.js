import { describe, expect, it } from 'vitest'
import { splitTarget } from '../../lib/cards'

describe('splitTarget', () => {
  it('splits around the first occurrence', () => {
    expect(splitTarget('Ich habe heute keine Zeit.', 'Zeit')).toEqual({ pre: 'Ich habe heute keine ', target: 'Zeit', post: '.' })
  })

  it('keeps the whole sentence when the target is missing', () => {
    expect(splitTarget('Hallo!', 'Tschüss')).toEqual({ pre: 'Hallo!', target: '', post: '' })
  })

  it('highlights only the first occurrence', () => {
    const p = splitTarget('Das ist das Haus.', 'das')
    expect(p.pre).toBe('Das ist ')
    expect(p.post).toBe(' Haus.')
  })
})
