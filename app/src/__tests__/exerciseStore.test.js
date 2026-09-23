import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useExerciseStore, EXERCISE_STORAGE_KEY } from '../stores/exerciseStore.js'

/** Minimal in-memory localStorage so the store can be tested in Node. */
function installFakeLocalStorage() {
  const data = new Map()
  globalThis.localStorage = {
    getItem: key => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: key => data.delete(key),
    clear: () => data.clear()
  }
  return data
}

describe('exerciseStore', () => {
  let storage

  beforeEach(() => {
    storage = installFakeLocalStorage()
    setActivePinia(createPinia())
  })

  it('starts empty', () => {
    const store = useExerciseStore()
    expect(store.totalAnswered).toBe(0)
    expect(store.accuracy).toBe(0)
    expect(store.weakExerciseIds).toEqual([])
    expect(store.bestScoreFor('wechsel')).toBeNull()
  })

  it('records answers and computes accuracy', () => {
    const store = useExerciseStore()
    store.recordAnswer('wp-01', true)
    store.recordAnswer('wp-01', true)
    store.recordAnswer('wp-02', false)
    expect(store.totalAnswered).toBe(3)
    expect(store.totalCorrect).toBe(2)
    expect(store.accuracy).toBe(67)
    expect(store.exerciseStats['wp-01']).toMatchObject({ correct: 2, incorrect: 0 })
    expect(store.exerciseStats['wp-02']).toMatchObject({ correct: 0, incorrect: 1 })
  })

  it('flags weak spots when wrong at least as often as right, sorted by misses', () => {
    const store = useExerciseStore()
    store.recordAnswer('a', false)
    store.recordAnswer('b', false)
    store.recordAnswer('b', false)
    store.recordAnswer('c', false)
    store.recordAnswer('c', true) // 1:1 → still weak
    store.recordAnswer('d', false)
    store.recordAnswer('d', true)
    store.recordAnswer('d', true) // more right than wrong → no longer weak
    expect(store.weakExerciseIds).toEqual(['b', 'a', 'c'])
  })

  it('keeps the best round score per drill by ratio', () => {
    const store = useExerciseStore()
    store.recordRound('fixed', 6, 10)
    expect(store.bestScoreFor('fixed')).toEqual({ correct: 6, total: 10, rounds: 1 })
    store.recordRound('fixed', 4, 10) // worse
    expect(store.bestScoreFor('fixed')).toMatchObject({ correct: 6, total: 10, rounds: 2 })
    store.recordRound('fixed', 5, 5) // 100 % beats 60 %
    expect(store.bestScoreFor('fixed')).toMatchObject({ correct: 5, total: 5, rounds: 3 })
  })

  it('tracks Blitz high score and best streak independently', () => {
    const store = useExerciseStore()
    store.recordBlitz(120, 4)
    store.recordBlitz(90, 9)
    expect(store.blitz).toEqual({ highScore: 120, bestStreak: 9, rounds: 2 })
  })

  it('persists to localStorage and reloads', () => {
    const store = useExerciseStore()
    store.recordAnswer('wp-01', false)
    store.recordRound('wechsel', 7, 10)
    store.recordBlitz(50, 3)

    const saved = JSON.parse(storage.get(EXERCISE_STORAGE_KEY))
    expect(saved.totalAnswered).toBe(1)
    expect(saved.drillStats.wechsel.bestCorrect).toBe(7)

    // Fresh pinia instance reads the same storage back.
    setActivePinia(createPinia())
    const reloaded = useExerciseStore()
    expect(reloaded.totalAnswered).toBe(1)
    expect(reloaded.weakExerciseIds).toEqual(['wp-01'])
    expect(reloaded.bestScoreFor('wechsel')).toMatchObject({ correct: 7, total: 10 })
    expect(reloaded.blitz.highScore).toBe(50)
  })

  it('survives corrupted localStorage', () => {
    storage.set(EXERCISE_STORAGE_KEY, '{not json')
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const store = useExerciseStore()
    expect(store.totalAnswered).toBe(0)
    expect(errorSpy).toHaveBeenCalled()
    errorSpy.mockRestore()
  })

  it('survives a throwing localStorage (private mode)', () => {
    globalThis.localStorage = {
      getItem: () => { throw new Error('blocked') },
      setItem: () => { throw new Error('blocked') }
    }
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const store = useExerciseStore()
    store.recordAnswer('x', true)
    expect(store.totalAnswered).toBe(1)
    errorSpy.mockRestore()
  })

  it('resets everything', () => {
    const store = useExerciseStore()
    store.recordAnswer('x', false)
    store.recordRound('mixed', 1, 2)
    store.recordBlitz(10, 1)
    store.resetProgress()
    expect(store.totalAnswered).toBe(0)
    expect(store.weakExerciseIds).toEqual([])
    expect(store.bestScoreFor('mixed')).toBeNull()
    expect(store.blitz.highScore).toBe(0)
  })
})
