<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  exercises: {
    type: Array,
    required: true
  },
  title: {
    type: String,
    default: 'Practice Exercises'
  }
})

const currentIndex = ref(0)
const selectedAnswer = ref(null)
const showExplanation = ref(false)
const score = ref(0)
const attemptedQuestions = ref(new Set())

const currentExercise = computed(() => props.exercises[currentIndex.value])
const totalQuestions = computed(() => props.exercises.length)
const progress = computed(() => ((currentIndex.value + 1) / totalQuestions.value) * 100)
const isCorrect = computed(() => selectedAnswer.value === currentExercise.value.correct)
const canProceed = computed(() => selectedAnswer.value !== null)
const isLastQuestion = computed(() => currentIndex.value === props.exercises.length - 1)

const selectAnswer = (index) => {
  if (showExplanation.value) return // Don't allow changing answer after submission
  selectedAnswer.value = index
}

const submitAnswer = () => {
  if (selectedAnswer.value === null) return

  showExplanation.value = true

  // Only count score if this question hasn't been attempted before
  if (!attemptedQuestions.value.has(currentIndex.value)) {
    if (isCorrect.value) {
      score.value++
    }
    attemptedQuestions.value.add(currentIndex.value)
  }
}

const nextQuestion = () => {
  if (currentIndex.value < props.exercises.length - 1) {
    currentIndex.value++
    selectedAnswer.value = null
    showExplanation.value = false
  }
}

const previousQuestion = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
    selectedAnswer.value = null
    showExplanation.value = false
  }
}

const restartQuiz = () => {
  currentIndex.value = 0
  selectedAnswer.value = null
  showExplanation.value = false
  score.value = 0
  attemptedQuestions.value.clear()
}

const getOptionClass = (index) => {
  if (!showExplanation.value) {
    return selectedAnswer.value === index ? 'selected' : ''
  }

  // After submission, show correct/incorrect
  if (index === currentExercise.value.correct) {
    return 'correct'
  }
  if (selectedAnswer.value === index && !isCorrect.value) {
    return 'incorrect'
  }
  return ''
}
</script>

<template>
  <div class="exercise-container">
    <!-- Header -->
    <div class="exercise-header">
      <h2 class="exercise-title">{{ title }}</h2>
      <div class="exercise-meta">
        <span class="question-counter">
          Question {{ currentIndex + 1 }} of {{ totalQuestions }}
        </span>
        <span class="score-display">
          Score: {{ score }} / {{ attemptedQuestions.size }}
        </span>
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: progress + '%' }"></div>
    </div>

    <!-- Question Card -->
    <div class="question-card">
      <p class="question-text" v-html="currentExercise.question"></p>

      <!-- Options -->
      <div class="options-grid">
        <button
          v-for="(option, index) in currentExercise.options"
          :key="index"
          class="option-button"
          :class="getOptionClass(index)"
          @click="selectAnswer(index)"
          :disabled="showExplanation"
        >
          <span class="option-letter">{{ String.fromCharCode(65 + index) }}</span>
          <span class="option-text" v-html="option"></span>

          <!-- Checkmark or X icon -->
          <span v-if="showExplanation && index === currentExercise.correct" class="icon correct-icon">✓</span>
          <span v-if="showExplanation && selectedAnswer === index && !isCorrect" class="icon incorrect-icon">✗</span>
        </button>
      </div>

      <!-- Explanation -->
      <transition name="fade">
        <div v-if="showExplanation" class="explanation-box" :class="isCorrect ? 'correct-explanation' : 'incorrect-explanation'">
          <div class="explanation-header">
            <span v-if="isCorrect" class="explanation-icon">🎉</span>
            <span v-else class="explanation-icon">💡</span>
            <strong>{{ isCorrect ? 'Correct!' : 'Not quite!' }}</strong>
          </div>
          <p class="explanation-text">{{ currentExercise.explanation }}</p>
        </div>
      </transition>
    </div>

    <!-- Navigation -->
    <div class="navigation-buttons">
      <button
        @click="previousQuestion"
        class="nav-button secondary"
        :disabled="currentIndex === 0"
      >
        ← Previous
      </button>

      <button
        v-if="!showExplanation"
        @click="submitAnswer"
        class="nav-button primary"
        :disabled="!canProceed"
      >
        Submit Answer
      </button>

      <button
        v-else-if="!isLastQuestion"
        @click="nextQuestion"
        class="nav-button primary"
      >
        Next Question →
      </button>

      <button
        v-else
        @click="restartQuiz"
        class="nav-button success"
      >
        🔄 Restart Quiz
      </button>
    </div>

    <!-- Final Score (shown on last question after submission) -->
    <transition name="fade">
      <div v-if="showExplanation && isLastQuestion" class="final-score-card">
        <h3>Quiz Complete!</h3>
        <div class="final-score">
          {{ score }} / {{ totalQuestions }}
        </div>
        <div class="score-percentage">
          {{ Math.round((score / totalQuestions) * 100) }}%
        </div>
        <p v-if="score === totalQuestions" class="encouragement">Perfect score! 🎉</p>
        <p v-else-if="score >= totalQuestions * 0.7" class="encouragement">Great job! 👏</p>
        <p v-else class="encouragement">Keep practicing! 💪</p>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.exercise-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.exercise-header {
  margin-bottom: 20px;
}

.exercise-title {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 12px 0;
}

.exercise-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.question-counter, .score-display {
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  padding: 6px 12px;
  background: #f3f4f6;
  border-radius: 8px;
}

.score-display {
  color: #7c3aed;
  background: #f5f3ff;
}

.progress-bar {
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 24px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #7c3aed 0%, #8b5cf6 100%);
  transition: width 0.3s ease;
}

.question-card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  margin-bottom: 24px;
}

.question-text {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 24px 0;
  line-height: 1.6;
}

.options-grid {
  display: grid;
  gap: 12px;
  margin-bottom: 24px;
}

.option-button {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  font-size: 16px;
}

.option-button:hover:not(:disabled) {
  border-color: #7c3aed;
  background: #f5f3ff;
  transform: translateX(4px);
}

.option-button:disabled {
  cursor: not-allowed;
}

.option-button.selected {
  border-color: #7c3aed;
  background: #f5f3ff;
  box-shadow: 0 2px 8px rgb(124 58 237 / 0.2);
}

.option-button.correct {
  border-color: #16a34a;
  background: #f0fdf4;
}

.option-button.incorrect {
  border-color: #dc2626;
  background: #fef2f2;
}

.option-letter {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: white;
  border-radius: 8px;
  font-weight: 700;
  color: #6b7280;
  flex-shrink: 0;
}

.option-button.selected .option-letter {
  background: #7c3aed;
  color: white;
}

.option-button.correct .option-letter {
  background: #16a34a;
  color: white;
}

.option-button.incorrect .option-letter {
  background: #dc2626;
  color: white;
}

.option-text {
  flex: 1;
  color: #374151;
}

.icon {
  font-size: 20px;
  font-weight: 700;
  margin-left: auto;
}

.correct-icon {
  color: #16a34a;
}

.incorrect-icon {
  color: #dc2626;
}

.explanation-box {
  padding: 16px;
  border-radius: 12px;
  border: 2px solid;
  margin-top: 16px;
}

.correct-explanation {
  background: #f0fdf4;
  border-color: #86efac;
}

.incorrect-explanation {
  background: #fef3c7;
  border-color: #fde047;
}

.explanation-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 16px;
  color: #1f2937;
}

.explanation-icon {
  font-size: 20px;
}

.explanation-text {
  margin: 0;
  font-size: 15px;
  color: #374151;
  line-height: 1.6;
}

.navigation-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.nav-button {
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 140px;
}

.nav-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.15);
}

.nav-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.nav-button.primary {
  background: #7c3aed;
  color: white;
}

.nav-button.primary:hover:not(:disabled) {
  background: #6d28d9;
}

.nav-button.secondary {
  background: #f3f4f6;
  color: #374151;
}

.nav-button.secondary:hover:not(:disabled) {
  background: #e5e7eb;
}

.nav-button.success {
  background: #10b981;
  color: white;
}

.nav-button.success:hover:not(:disabled) {
  background: #059669;
}

.final-score-card {
  background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%);
  color: white;
  padding: 32px;
  border-radius: 16px;
  text-align: center;
  margin-top: 24px;
  box-shadow: 0 10px 25px -5px rgb(124 58 237 / 0.4);
}

.final-score-card h3 {
  margin: 0 0 16px 0;
  font-size: 24px;
}

.final-score {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 8px;
}

.score-percentage {
  font-size: 24px;
  opacity: 0.9;
  margin-bottom: 16px;
}

.encouragement {
  font-size: 18px;
  margin: 0;
  font-weight: 500;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Mobile Responsiveness */
@media (max-width: 640px) {
  .exercise-container {
    padding: 12px;
  }

  .question-card {
    padding: 20px;
  }

  .question-text {
    font-size: 18px;
  }

  .option-button {
    padding: 12px;
  }

  .exercise-title {
    font-size: 24px;
  }

  .nav-button {
    min-width: 120px;
    padding: 10px 16px;
  }
}
</style>
