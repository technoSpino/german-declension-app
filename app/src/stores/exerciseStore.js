import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const EXERCISE_STORAGE_KEY = 'german-declension-exercises'

/**
 * Tracks progress for the skill-building exercises:
 *  - per-exercise correct/incorrect counts (drives the "weak spots" drill)
 *  - per-drill best scores
 *  - Blitz mode high score
 */
export const useExerciseStore = defineStore('exercises', () => {
  // State
  const exerciseStats = ref({}) // { [exerciseId]: { correct, incorrect, lastSeen } }
  const drillStats = ref({}) // { [drillId]: { rounds, bestCorrect, bestTotal, lastPlayed } }
  const blitz = ref({ highScore: 0, bestStreak: 0, rounds: 0 })
  const totalAnswered = ref(0)
  const totalCorrect = ref(0)

  // Computed
  const accuracy = computed(() => {
    if (totalAnswered.value === 0) return 0
    return Math.round((totalCorrect.value / totalAnswered.value) * 100)
  })

  /** Exercise ids the learner has got wrong more often than right, or wrong recently. */
  const weakExerciseIds = computed(() => {
    return Object.entries(exerciseStats.value)
      .filter(([, s]) => s.incorrect > 0 && s.incorrect >= s.correct)
      .sort((a, b) => b[1].incorrect - a[1].incorrect)
      .map(([id]) => id)
  })

  // Persistence
  function loadFromLocalStorage() {
    try {
      const raw = localStorage.getItem(EXERCISE_STORAGE_KEY)
      if (!raw) return
      const data = JSON.parse(raw)
      exerciseStats.value = data.exerciseStats || {}
      drillStats.value = data.drillStats || {}
      blitz.value = { highScore: 0, bestStreak: 0, rounds: 0, ...(data.blitz || {}) }
      totalAnswered.value = data.totalAnswered || 0
      totalCorrect.value = data.totalCorrect || 0
    } catch (error) {
      console.error('Error loading exercise progress from localStorage:', error)
    }
  }

  function saveToLocalStorage() {
    try {
      localStorage.setItem(
        EXERCISE_STORAGE_KEY,
        JSON.stringify({
          exerciseStats: exerciseStats.value,
          drillStats: drillStats.value,
          blitz: blitz.value,
          totalAnswered: totalAnswered.value,
          totalCorrect: totalCorrect.value
        })
      )
    } catch (error) {
      console.error('Error saving exercise progress to localStorage:', error)
    }
  }

  // Actions
  function recordAnswer(exerciseId, correct) {
    const stats = exerciseStats.value[exerciseId] || { correct: 0, incorrect: 0, lastSeen: null }
    if (correct) stats.correct++
    else stats.incorrect++
    stats.lastSeen = Date.now()
    exerciseStats.value[exerciseId] = stats

    totalAnswered.value++
    if (correct) totalCorrect.value++
    saveToLocalStorage()
  }

  function recordRound(drillId, correct, total) {
    const stats = drillStats.value[drillId] || { rounds: 0, bestCorrect: 0, bestTotal: 0, lastPlayed: null }
    stats.rounds++
    stats.lastPlayed = Date.now()

    const previousRatio = stats.bestTotal ? stats.bestCorrect / stats.bestTotal : -1
    const ratio = total ? correct / total : 0
    if (ratio > previousRatio) {
      stats.bestCorrect = correct
      stats.bestTotal = total
    }
    drillStats.value[drillId] = stats
    saveToLocalStorage()
  }

  function recordBlitz(score, streak) {
    blitz.value.rounds++
    if (score > blitz.value.highScore) blitz.value.highScore = score
    if (streak > blitz.value.bestStreak) blitz.value.bestStreak = streak
    saveToLocalStorage()
  }

  function bestScoreFor(drillId) {
    const stats = drillStats.value[drillId]
    if (!stats || !stats.bestTotal) return null
    return { correct: stats.bestCorrect, total: stats.bestTotal, rounds: stats.rounds }
  }

  function resetProgress() {
    exerciseStats.value = {}
    drillStats.value = {}
    blitz.value = { highScore: 0, bestStreak: 0, rounds: 0 }
    totalAnswered.value = 0
    totalCorrect.value = 0
    saveToLocalStorage()
  }

  loadFromLocalStorage()

  return {
    exerciseStats,
    drillStats,
    blitz,
    totalAnswered,
    totalCorrect,
    accuracy,
    weakExerciseIds,
    recordAnswer,
    recordRound,
    recordBlitz,
    bestScoreFor,
    resetProgress,
    loadFromLocalStorage,
    saveToLocalStorage
  }
})
