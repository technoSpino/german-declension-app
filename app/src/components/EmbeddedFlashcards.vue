<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  flashcards: {
    type: Array,
    required: true
  },
  title: {
    type: String,
    default: 'Quick Practice'
  }
})

const currentIndex = ref(0)
const isFlipped = ref(false)

const currentCard = computed(() => props.flashcards[currentIndex.value])
const progress = computed(() => ((currentIndex.value + 1) / props.flashcards.length) * 100)

const flipCard = () => {
  isFlipped.value = !isFlipped.value
}

const nextCard = () => {
  if (currentIndex.value < props.flashcards.length - 1) {
    currentIndex.value++
    isFlipped.value = false
  } else {
    // Loop back to start
    currentIndex.value = 0
    isFlipped.value = false
  }
}

const previousCard = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
    isFlipped.value = false
  } else {
    // Go to last card
    currentIndex.value = props.flashcards.length - 1
    isFlipped.value = false
  }
}

const handleKeyboard = (event) => {
  if (event.code === 'Space' || event.code === 'Enter') {
    event.preventDefault()
    flipCard()
  } else if (event.code === 'ArrowLeft') {
    event.preventDefault()
    previousCard()
  } else if (event.code === 'ArrowRight') {
    event.preventDefault()
    nextCard()
  }
}

// Keyboard support
import { onMounted, onUnmounted } from 'vue'
onMounted(() => {
  window.addEventListener('keydown', handleKeyboard)
})
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyboard)
})
</script>

<template>
  <div class="flashcards-container">
    <!-- Header -->
    <div class="flashcards-header">
      <h3 class="flashcards-title">{{ title }}</h3>
      <div class="card-counter">
        {{ currentIndex + 1 }} / {{ flashcards.length }}
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: progress + '%' }"></div>
    </div>

    <!-- Flashcard -->
    <div class="flashcard-wrapper" @click="flipCard">
      <div class="flashcard" :class="{ flipped: isFlipped }">
        <!-- Front Side -->
        <div class="flashcard-face flashcard-front">
          <div class="card-content">
            <span class="card-label">Question</span>
            <div class="card-text" v-html="currentCard.front"></div>
          </div>
          <div class="flip-hint">Click to reveal answer</div>
        </div>

        <!-- Back Side -->
        <div class="flashcard-face flashcard-back">
          <div class="card-content">
            <span class="card-label">Answer</span>
            <div class="card-text answer-text" v-html="currentCard.back"></div>
          </div>
          <div v-if="currentCard.explanation" class="card-explanation">
            {{ currentCard.explanation }}
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <div class="navigation-controls">
      <button @click.stop="previousCard" class="nav-btn prev-btn" title="Previous card (←)">
        ←
      </button>

      <button @click.stop="flipCard" class="nav-btn flip-btn" title="Flip card (Space)">
        {{ isFlipped ? '🔄 Flip Back' : '🔄 Show Answer' }}
      </button>

      <button @click.stop="nextCard" class="nav-btn next-btn" title="Next card (→)">
        →
      </button>
    </div>

    <!-- Keyboard Hints -->
    <div class="keyboard-hints">
      <span class="hint">Space: Flip</span>
      <span class="hint">←/→: Navigate</span>
    </div>
  </div>
</template>

<style scoped>
.flashcards-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.flashcards-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.flashcards-title {
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.card-counter {
  font-size: 14px;
  font-weight: 600;
  color: #7c3aed;
  padding: 6px 12px;
  background: #f5f3ff;
  border-radius: 8px;
}

.progress-bar {
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 24px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #7c3aed 0%, #8b5cf6 100%);
  transition: width 0.3s ease;
}

.flashcard-wrapper {
  perspective: 1000px;
  margin-bottom: 24px;
  cursor: pointer;
}

.flashcard {
  position: relative;
  width: 100%;
  min-height: 300px;
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.flashcard.flipped {
  transform: rotateY(180deg);
}

.flashcard-face {
  position: absolute;
  width: 100%;
  min-height: 300px;
  backface-visibility: hidden;
  border-radius: 16px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: 0 10px 25px -5px rgb(0 0 0 / 0.1);
}

.flashcard-front {
  background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
  border: 2px solid #e5e7eb;
}

.flashcard-back {
  background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%);
  color: white;
  transform: rotateY(180deg);
}

.card-content {
  text-align: center;
  width: 100%;
}

.card-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 16px;
  opacity: 0.7;
}

.flashcard-front .card-label {
  color: #7c3aed;
}

.flashcard-back .card-label {
  color: white;
  opacity: 0.9;
}

.card-text {
  font-size: 24px;
  font-weight: 600;
  line-height: 1.4;
  margin-bottom: 16px;
}

.flashcard-front .card-text {
  color: #1f2937;
}

.flashcard-back .card-text {
  color: white;
}

.answer-text {
  font-size: 28px;
  font-weight: 700;
}

.flip-hint {
  font-size: 13px;
  color: #9ca3af;
  margin-top: auto;
  padding-top: 16px;
  font-weight: 500;
}

.card-explanation {
  font-size: 14px;
  line-height: 1.6;
  padding: 16px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  margin-top: 16px;
  opacity: 0.95;
  text-align: center;
}

.navigation-controls {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 16px;
}

.nav-btn {
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
  color: #374151;
  border: 2px solid #e5e7eb;
}

.nav-btn:hover {
  border-color: #7c3aed;
  color: #7c3aed;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.1);
}

.flip-btn {
  flex: 1;
  max-width: 200px;
  background: #7c3aed;
  color: white;
  border-color: #7c3aed;
}

.flip-btn:hover {
  background: #6d28d9;
  border-color: #6d28d9;
  color: white;
}

.prev-btn, .next-btn {
  width: 50px;
  font-size: 20px;
  padding: 12px;
}

.keyboard-hints {
  display: flex;
  gap: 16px;
  justify-content: center;
  font-size: 12px;
  color: #9ca3af;
}

.hint {
  padding: 4px 8px;
  background: #f3f4f6;
  border-radius: 6px;
}

/* Mobile Responsiveness */
@media (max-width: 640px) {
  .flashcards-container {
    padding: 12px;
  }

  .flashcard-face {
    min-height: 250px;
    padding: 24px;
  }

  .card-text {
    font-size: 20px;
  }

  .answer-text {
    font-size: 24px;
  }

  .flashcards-title {
    font-size: 18px;
  }

  .nav-btn {
    padding: 10px 16px;
  }

  .flip-btn {
    font-size: 14px;
  }
}

/* Prevent text selection during flips */
.flashcard {
  user-select: none;
  -webkit-user-select: none;
}
</style>
