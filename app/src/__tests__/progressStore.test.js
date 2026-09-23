import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useProgressStore } from '../stores/progressStore.js'

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

describe('progressStore exercises integration', () => {
  let storage

  beforeEach(() => {
    storage = installFakeLocalStorage()
    setActivePinia(createPinia())
  })

  it('counts exercises toward total interactions', () => {
    const store = useProgressStore()
    expect(store.totalInteractions).toBe(0)
    store.incrementExercisesAnswered()
    store.incrementExercisesAnswered()
    expect(store.exercisesAnswered).toBe(2)
    expect(store.totalInteractions).toBe(2)
  })

  it('starts a study streak when an exercise is answered', () => {
    const store = useProgressStore()
    store.incrementExercisesAnswered()
    expect(store.currentStreak).toBe(1)
    expect(store.lastStudyDate).toBe(new Date().toDateString())
  })

  it('persists and reloads the exercise counter', () => {
    const store = useProgressStore()
    store.incrementExercisesAnswered()
    const saved = JSON.parse(storage.get('german-declension-progress'))
    expect(saved.exercisesAnswered).toBe(1)

    setActivePinia(createPinia())
    expect(useProgressStore().exercisesAnswered).toBe(1)
  })

  it('reset clears the exercise counter', () => {
    const store = useProgressStore()
    store.incrementExercisesAnswered()
    store.resetProgress()
    expect(store.exercisesAnswered).toBe(0)
  })
})
