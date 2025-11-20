import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useProgressStore = defineStore('progress', () => {
  // State
  const cardsStudied = ref(0)
  const cardsMastered = ref(0)
  const tableInteractions = ref(0)
  const currentStreak = ref(0)
  const lastStudyDate = ref(null)
  const studyHistory = ref([]) // Array of { date: string, count: number }

  // Computed
  const totalInteractions = computed(() => cardsStudied.value + tableInteractions.value)
  const masteryPercentage = computed(() => {
    if (cardsStudied.value === 0) return 0
    return Math.round((cardsMastered.value / cardsStudied.value) * 100)
  })

  const streakText = computed(() => {
    if (currentStreak.value === 0) return 'Start your streak!'
    if (currentStreak.value === 1) return '1 day streak'
    return `${currentStreak.value} day streak`
  })

  // Actions
  function loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem('german-declension-progress')
      if (saved) {
        const data = JSON.parse(saved)
        cardsStudied.value = data.cardsStudied || 0
        cardsMastered.value = data.cardsMastered || 0
        tableInteractions.value = data.tableInteractions || 0
        currentStreak.value = data.currentStreak || 0
        lastStudyDate.value = data.lastStudyDate || null
        studyHistory.value = data.studyHistory || []

        // Update streak based on last study date
        updateStreak()
      }
    } catch (error) {
      console.error('Error loading progress from localStorage:', error)
    }
  }

  function saveToLocalStorage() {
    try {
      const data = {
        cardsStudied: cardsStudied.value,
        cardsMastered: cardsMastered.value,
        tableInteractions: tableInteractions.value,
        currentStreak: currentStreak.value,
        lastStudyDate: lastStudyDate.value,
        studyHistory: studyHistory.value
      }
      localStorage.setItem('german-declension-progress', JSON.stringify(data))
    } catch (error) {
      console.error('Error saving progress to localStorage:', error)
    }
  }

  function updateStreak() {
    const today = new Date().toDateString()

    if (!lastStudyDate.value) {
      // First time studying
      currentStreak.value = 1
      lastStudyDate.value = today
      return
    }

    const lastDate = new Date(lastStudyDate.value)
    const todayDate = new Date(today)
    const diffTime = todayDate - lastDate
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      // Already studied today, don't change streak
      return
    } else if (diffDays === 1) {
      // Studied yesterday, increment streak
      currentStreak.value++
      lastStudyDate.value = today
    } else {
      // Missed a day, reset streak
      currentStreak.value = 1
      lastStudyDate.value = today
    }
  }

  function recordStudySession() {
    const today = new Date().toDateString()
    updateStreak()

    // Update study history
    const todayEntry = studyHistory.value.find(entry => entry.date === today)
    if (todayEntry) {
      todayEntry.count++
    } else {
      studyHistory.value.push({ date: today, count: 1 })
    }

    // Keep only last 30 days
    if (studyHistory.value.length > 30) {
      studyHistory.value = studyHistory.value.slice(-30)
    }

    saveToLocalStorage()
  }

  function incrementCardsStudied() {
    cardsStudied.value++
    recordStudySession()
  }

  function incrementCardsMastered() {
    cardsMastered.value++
    saveToLocalStorage()
  }

  function decrementCardsMastered() {
    if (cardsMastered.value > 0) {
      cardsMastered.value--
      saveToLocalStorage()
    }
  }

  function incrementTableInteractions() {
    tableInteractions.value++
    recordStudySession()
  }

  function resetProgress() {
    cardsStudied.value = 0
    cardsMastered.value = 0
    tableInteractions.value = 0
    currentStreak.value = 0
    lastStudyDate.value = null
    studyHistory.value = []
    saveToLocalStorage()
  }

  // Initialize from localStorage
  loadFromLocalStorage()

  return {
    // State
    cardsStudied,
    cardsMastered,
    tableInteractions,
    currentStreak,
    lastStudyDate,
    studyHistory,

    // Computed
    totalInteractions,
    masteryPercentage,
    streakText,

    // Actions
    incrementCardsStudied,
    incrementCardsMastered,
    decrementCardsMastered,
    incrementTableInteractions,
    recordStudySession,
    resetProgress,
    loadFromLocalStorage,
    saveToLocalStorage
  }
})
