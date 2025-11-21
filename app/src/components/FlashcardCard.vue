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
      <div class="flashcard-face flashcard-front" :class="getCardCaseClass()">
        <div class="card-header">
          <span class="difficulty-badge" :class="`difficulty-${card.difficulty}`">
            {{ card.difficulty }}
          </span>
          <span class="box-badge">
            Box {{ card.box }}
          </span>
        </div>

        <div class="card-content">
          <div class="card-text" v-html="card.front"></div>

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
      <div class="flashcard-face flashcard-back" :class="getCardCaseClass()">
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

const getCardCaseClass = () => {
  // Find the case tag from the card's tags
  const caseTag = props.card.tags.find(tag =>
    ['nominativ', 'akkusativ', 'dativ', 'genitiv'].includes(tag)
  );

  if (caseTag === 'nominativ') return 'card-nom';
  if (caseTag === 'akkusativ') return 'card-akk';
  if (caseTag === 'dativ') return 'card-dat';
  if (caseTag === 'genitiv') return 'card-gen';
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
  transition: transform 0.2s ease;
}

.flashcard-container:hover {
  transform: translateY(-2px);
}

.flashcard-container:active {
  transform: translateY(0);
}

.flashcard {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.5s cubic-bezier(0.4, 0.0, 0.2, 1);
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
  border-radius: 12px;
  background: white;
  box-shadow: 0 2px 8px rgb(0 0 0 / 0.08), 0 1px 2px rgb(0 0 0 / 0.04);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.flashcard-front {
  background: white;
}

.flashcard-back {
  background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
  transform: rotateY(180deg);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

.difficulty-badge {
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
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
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 600;
  background: #7c3aed;
  color: white;
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 28px 20px;
  gap: 20px;
}

.card-text {
  font-size: 22px;
  font-weight: 600;
  color: #1f2937;
  text-align: center;
  line-height: 1.4;
}

.card-text :deep(.verb) {
  font-weight: 700;
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 3px;
}

/* Verb colors based on case */
.card-nom .card-text :deep(.verb) {
  color: #2196F3;
}

.card-akk .card-text :deep(.verb) {
  color: #F44336;
}

.card-dat .card-text :deep(.verb) {
  color: #4CAF50;
}

.card-gen .card-text :deep(.verb) {
  color: #FF9800;
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
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  background: #f5f3ff;
  border-radius: 8px;
  border-left: 3px solid #7c3aed;
}

.hint-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.hint-text {
  font-size: 13px;
  color: #64748b;
  line-height: 1.5;
}

.explanation-section {
  padding: 12px 14px;
  background: #f0fdf4;
  border-radius: 8px;
  border-left: 3px solid #16a34a;
}

.explanation-title {
  font-size: 11px;
  font-weight: 600;
  color: #16a34a;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}

.explanation-text {
  font-size: 13px;
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
  padding: 12px 16px;
  background: #fafafa;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tag {
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 600;
  background: #f1f5f9;
  color: #64748b;
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
