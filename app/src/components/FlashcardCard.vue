<template>
  <div
    class="flashcard-container"
    @click="handleFlip"
  >
    <div
      class="flashcard"
      :class="{ 'is-flipped': isFlipped }"
    >
      <!-- Front of card -->
      <div class="flashcard-face flashcard-front">
        <div class="card-header">
          <span class="difficulty-badge" :class="`difficulty-${card.difficulty}`">
            {{ card.difficulty }}
          </span>
          <span class="box-badge">
            Box {{ card.box }}
          </span>
        </div>

        <div class="card-content">
          <div class="card-text">
            {{ card.front }}
          </div>

          <div class="hint-section" v-if="showHint">
            <div class="hint-icon">💡</div>
            <div class="hint-text">{{ card.hint }}</div>
          </div>
        </div>

        <div class="card-footer">
          <div class="tags">
            <span
              v-for="tag in card.tags.slice(0, 3)"
              :key="tag"
              class="tag"
              :class="getCaseClass(tag)"
            >
              {{ tag }}
            </span>
          </div>
          <div class="flip-instruction">
            Click to reveal answer
          </div>
        </div>
      </div>

      <!-- Back of card -->
      <div class="flashcard-face flashcard-back">
        <div class="card-header">
          <span class="difficulty-badge" :class="`difficulty-${card.difficulty}`">
            {{ card.difficulty }}
          </span>
          <span class="box-badge">
            Box {{ card.box }}
          </span>
        </div>

        <div class="card-content">
          <div class="answer-label">Answer:</div>
          <div class="card-text answer">
            {{ card.back }}
          </div>

          <div class="explanation-section">
            <div class="explanation-title">Explanation:</div>
            <div class="explanation-text">
              {{ card.explanation }}
            </div>
          </div>

          <div class="stats-section" v-if="showStats">
            <div class="stat">
              <span class="stat-icon">✓</span>
              <span class="stat-value">{{ card.correctCount }}</span>
            </div>
            <div class="stat">
              <span class="stat-icon">✗</span>
              <span class="stat-value">{{ card.incorrectCount }}</span>
            </div>
          </div>
        </div>

        <div class="card-footer">
          <div class="tags">
            <span
              v-for="tag in card.tags.slice(0, 3)"
              :key="tag"
              class="tag"
              :class="getCaseClass(tag)"
            >
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  card: {
    type: Object,
    required: true
  },
  isFlipped: {
    type: Boolean,
    default: false
  },
  showHint: {
    type: Boolean,
    default: true
  },
  showStats: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['flip']);

const handleFlip = () => {
  emit('flip');
};

const getCaseClass = (tag) => {
  if (tag === 'nominativ') return 'tag-nom';
  if (tag === 'akkusativ') return 'tag-akk';
  if (tag === 'dativ') return 'tag-dat';
  if (tag === 'genitiv') return 'tag-gen';
  return '';
};
</script>

<style scoped>
.flashcard-container {
  perspective: 1000px;
  width: 100%;
  max-width: 600px;
  height: 400px;
  cursor: pointer;
  user-select: none;
}

.flashcard {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.flashcard.is-flipped {
  transform: rotateY(180deg);
}

.flashcard-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 16px;
  background: white;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 2px solid #e5e7eb;
}

.flashcard-front {
  background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
}

.flashcard-back {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  transform: rotateY(180deg);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: rgba(124, 58, 237, 0.05);
  border-bottom: 1px solid #e5e7eb;
}

.difficulty-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.difficulty-easy {
  background: #dcfce7;
  color: #166534;
}

.difficulty-medium {
  background: #fef3c7;
  color: #92400e;
}

.difficulty-hard {
  background: #fee2e2;
  color: #991b1b;
}

.box-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background: #7c3aed;
  color: white;
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 32px 24px;
  gap: 24px;
}

.card-text {
  font-size: 24px;
  font-weight: 600;
  color: #0f172a;
  text-align: center;
  line-height: 1.4;
}

.answer-label {
  font-size: 14px;
  font-weight: 600;
  color: #16a34a;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-align: center;
  margin-bottom: -16px;
}

.card-text.answer {
  color: #16a34a;
  font-size: 28px;
}

.hint-section {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(124, 58, 237, 0.1);
  border-radius: 12px;
  border-left: 4px solid #7c3aed;
}

.hint-icon {
  font-size: 20px;
}

.hint-text {
  font-size: 14px;
  color: #475569;
  font-style: italic;
}

.explanation-section {
  padding: 16px;
  background: rgba(22, 163, 74, 0.1);
  border-radius: 12px;
  border-left: 4px solid #16a34a;
}

.explanation-title {
  font-size: 12px;
  font-weight: 600;
  color: #16a34a;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 8px;
}

.explanation-text {
  font-size: 14px;
  color: #475569;
  line-height: 1.5;
}

.stats-section {
  display: flex;
  justify-content: center;
  gap: 32px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-icon {
  font-size: 18px;
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: #475569;
}

.card-footer {
  padding: 16px 20px;
  background: rgba(0, 0, 0, 0.02);
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  background: #f1f5f9;
  color: #475569;
  text-transform: lowercase;
}

.tag-nom {
  background: #E3F2FD;
  color: #1565C0;
}

.tag-akk {
  background: #FFEBEE;
  color: #C62828;
}

.tag-dat {
  background: #E8F5E9;
  color: #2E7D32;
}

.tag-gen {
  background: #FFF3E0;
  color: #E65100;
}

.flip-instruction {
  font-size: 11px;
  color: #9ca3af;
  font-style: italic;
}

/* Mobile responsiveness */
@media (max-width: 640px) {
  .flashcard-container {
    height: 350px;
    max-width: 100%;
  }

  .card-text {
    font-size: 20px;
  }

  .card-text.answer {
    font-size: 24px;
  }

  .card-content {
    padding: 24px 20px;
    gap: 16px;
  }

  .hint-section,
  .explanation-section {
    padding: 12px;
  }
}

/* Touch device optimizations */
@media (hover: none) and (pointer: coarse) {
  .flashcard-container {
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .flashcard-container:active {
    transform: scale(0.98);
  }
}
</style>
