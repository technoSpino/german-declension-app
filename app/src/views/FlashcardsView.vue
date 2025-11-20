<template>
  <div class="flashcards-view">
    <!-- Header -->
    <header class="header">
      <div class="header-content">
        <h1 class="title">German Declension Flashcards</h1>
        <p class="subtitle">Master German articles and adjective declensions with spaced repetition</p>
      </div>
    </header>

    <!-- Mode Tabs -->
    <div class="mode-tabs">
      <button
        v-for="mode in modes"
        :key="mode.id"
        class="mode-tab"
        :class="{ active: currentMode === mode.id }"
        @click="currentMode = mode.id"
      >
        <span class="mode-icon">{{ mode.icon }}</span>
        <span class="mode-label">{{ mode.label }}</span>
        <span v-if="mode.badge" class="mode-badge">{{ mode.badge }}</span>
      </button>
    </div>

    <!-- Study Mode -->
    <div v-if="currentMode === 'study'" class="mode-content study-mode">
      <div v-if="dueCards.length === 0" class="empty-state">
        <div class="empty-icon">🎉</div>
        <h2 class="empty-title">No cards due for review!</h2>
        <p class="empty-description">
          Come back later or review already mastered cards in Browse mode.
        </p>
        <button @click="store.resetProgress" class="reset-button">
          Reset All Progress
        </button>
      </div>

      <div v-else class="study-container">
        <!-- Progress Bar -->
        <div class="study-progress">
          <div class="progress-info">
            <span class="progress-label">Session Progress</span>
            <span class="progress-count">
              {{ store.sessionStats.cardsReviewed }} / {{ dueCards.length }} reviewed
            </span>
          </div>
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: progressPercentage + '%' }"
            ></div>
          </div>
          <div class="session-stats">
            <span class="session-stat correct">
              ✓ {{ store.sessionStats.correctAnswers }}
            </span>
            <span class="session-stat incorrect">
              ✗ {{ store.sessionStats.incorrectAnswers }}
            </span>
            <span class="session-stat accuracy">
              {{ store.sessionAccuracy }}% accuracy
            </span>
          </div>
        </div>

        <!-- Flashcard -->
        <div class="flashcard-wrapper">
          <FlashcardCard
            v-if="currentCard"
            :card="currentCard"
            :is-flipped="isFlipped"
            @flip="toggleFlip"
          />
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons" v-if="currentCard">
          <button
            v-if="!isFlipped"
            class="action-button show-answer"
            @click="toggleFlip"
          >
            Show Answer
          </button>

          <template v-else>
            <button
              class="action-button again-button"
              @click="answerIncorrect"
            >
              <span class="button-icon">🔄</span>
              <span class="button-label">Again</span>
              <span class="button-hint">Back to Box 1</span>
            </button>

            <button
              class="action-button good-button"
              @click="answerCorrect"
            >
              <span class="button-icon">✓</span>
              <span class="button-label">Good</span>
              <span class="button-hint">Move to Box {{ Math.min(currentCard.box + 1, 5) }}</span>
            </button>
          </template>
        </div>

        <!-- Keyboard Shortcuts Hint -->
        <div class="keyboard-hints">
          <span class="keyboard-hint">Space: Flip card</span>
          <span class="keyboard-hint" v-if="isFlipped">1: Again</span>
          <span class="keyboard-hint" v-if="isFlipped">2: Good</span>
        </div>
      </div>
    </div>

    <!-- Browse Mode -->
    <div v-if="currentMode === 'browse'" class="mode-content browse-mode">
      <!-- Filters -->
      <div class="filters">
        <div class="filter-group">
          <label class="filter-label">Difficulty:</label>
          <select v-model="filters.difficulty" class="filter-select">
            <option value="all">All</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">Case:</label>
          <select v-model="filters.case" class="filter-select">
            <option value="all">All</option>
            <option value="nominativ">Nominativ</option>
            <option value="akkusativ">Akkusativ</option>
            <option value="dativ">Dativ</option>
            <option value="genitiv">Genitiv</option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">Box:</label>
          <select v-model="filters.box" class="filter-select">
            <option value="all">All</option>
            <option value="1">Box 1</option>
            <option value="2">Box 2</option>
            <option value="3">Box 3</option>
            <option value="4">Box 4</option>
            <option value="5">Box 5 (Mastered)</option>
          </select>
        </div>

        <button @click="clearFilters" class="clear-filters-button">
          Clear Filters
        </button>
      </div>

      <!-- Cards Grid -->
      <div class="cards-grid">
        <div
          v-for="card in filteredCards"
          :key="card.id"
          class="browse-card"
          @click="selectBrowseCard(card)"
        >
          <div class="browse-card-header">
            <span class="difficulty-badge" :class="`difficulty-${card.difficulty}`">
              {{ card.difficulty }}
            </span>
            <span class="box-badge">Box {{ card.box }}</span>
          </div>

          <div class="browse-card-content">
            <div class="card-question">{{ card.front }}</div>
            <div class="card-answer">{{ card.back }}</div>
          </div>

          <div class="browse-card-footer">
            <div class="card-stats">
              <span class="stat">✓ {{ card.correctCount }}</span>
              <span class="stat">✗ {{ card.incorrectCount }}</span>
            </div>
            <button
              @click.stop="store.resetCard(card.id)"
              class="reset-card-button"
              title="Reset this card"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <!-- No results -->
      <div v-if="filteredCards.length === 0" class="empty-state">
        <div class="empty-icon">🔍</div>
        <h2 class="empty-title">No cards found</h2>
        <p class="empty-description">Try adjusting your filters</p>
      </div>
    </div>

    <!-- Stats Mode -->
    <div v-if="currentMode === 'stats'" class="mode-content stats-mode">
      <!-- Overall Progress -->
      <div class="stats-section">
        <h2 class="stats-section-title">Overall Progress</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ progressMetrics.total }}</div>
            <div class="stat-label">Total Cards</div>
          </div>
          <div class="stat-card highlight">
            <div class="stat-value">{{ progressMetrics.mastered }}</div>
            <div class="stat-label">Mastered (Box 5)</div>
            <div class="stat-percentage">{{ progressMetrics.masteredPercentage }}%</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ progressMetrics.learning }}</div>
            <div class="stat-label">Learning (Box 2-4)</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ dueCards.length }}</div>
            <div class="stat-label">Due Today</div>
          </div>
        </div>
      </div>

      <!-- Box Distribution -->
      <div class="stats-section">
        <h2 class="stats-section-title">Leitner Box Distribution</h2>
        <div class="box-distribution">
          <div
            v-for="(count, box) in cardsByBox"
            :key="box"
            class="box-stat"
          >
            <div class="box-label">Box {{ box }}</div>
            <div class="box-bar-container">
              <div
                class="box-bar"
                :style="{
                  width: (count / progressMetrics.total * 100) + '%',
                  backgroundColor: getBoxColor(parseInt(box))
                }"
              ></div>
            </div>
            <div class="box-count">{{ count }} cards</div>
          </div>
        </div>
      </div>

      <!-- Accuracy Stats -->
      <div class="stats-section">
        <h2 class="stats-section-title">Performance</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ overallAccuracy }}%</div>
            <div class="stat-label">Overall Accuracy</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ sessionAccuracy }}%</div>
            <div class="stat-label">Session Accuracy</div>
          </div>
        </div>
      </div>

      <!-- Accuracy by Case -->
      <div class="stats-section">
        <h2 class="stats-section-title">Accuracy by Case</h2>
        <div class="case-accuracy">
          <div
            v-for="(accuracy, caseName) in accuracyByCase"
            :key="caseName"
            class="case-stat"
          >
            <div class="case-label" :class="`case-${caseName}`">
              {{ caseName }}
            </div>
            <div class="case-bar-container">
              <div
                class="case-bar"
                :class="`case-bar-${caseName}`"
                :style="{ width: accuracy + '%' }"
              ></div>
            </div>
            <div class="case-percentage">{{ accuracy }}%</div>
          </div>
        </div>
      </div>

      <!-- Accuracy by Difficulty -->
      <div class="stats-section">
        <h2 class="stats-section-title">Accuracy by Difficulty</h2>
        <div class="difficulty-accuracy">
          <div
            v-for="(accuracy, difficulty) in accuracyByDifficulty"
            :key="difficulty"
            class="difficulty-stat"
          >
            <div class="difficulty-label" :class="`difficulty-${difficulty}`">
              {{ difficulty }}
            </div>
            <div class="difficulty-bar-container">
              <div
                class="difficulty-bar"
                :class="`difficulty-bar-${difficulty}`"
                :style="{ width: accuracy + '%' }"
              ></div>
            </div>
            <div class="difficulty-percentage">{{ accuracy }}%</div>
          </div>
        </div>
      </div>

      <!-- Reset Button -->
      <div class="stats-section">
        <button @click="confirmReset" class="reset-all-button">
          Reset All Progress
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useFlashcardStore } from '../stores/flashcardStore.js';
import FlashcardCard from '../components/FlashcardCard.vue';

const store = useFlashcardStore();
const currentMode = ref('study');
const isFlipped = ref(false);

// Initialize store
onMounted(() => {
  store.initialize();
  window.addEventListener('keydown', handleKeyboard);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyboard);
});

// Modes configuration
const modes = computed(() => [
  {
    id: 'study',
    label: 'Study',
    icon: '📚',
    badge: dueCards.value.length > 0 ? dueCards.value.length : null
  },
  {
    id: 'browse',
    label: 'Browse',
    icon: '🔍',
    badge: null
  },
  {
    id: 'stats',
    label: 'Stats',
    icon: '📊',
    badge: null
  }
]);

// Study mode
const currentCard = computed(() => store.currentCard);
const dueCards = computed(() => store.dueCards);

const progressPercentage = computed(() => {
  if (dueCards.value.length === 0) return 0;
  return Math.round((store.sessionStats.cardsReviewed / dueCards.value.length) * 100);
});

const toggleFlip = () => {
  isFlipped.value = !isFlipped.value;
};

const answerCorrect = () => {
  if (!currentCard.value) return;
  store.answerCorrect(currentCard.value.id);
  isFlipped.value = false;
};

const answerIncorrect = () => {
  if (!currentCard.value) return;
  store.answerIncorrect(currentCard.value.id);
  isFlipped.value = false;
};

// Keyboard shortcuts
const handleKeyboard = (event) => {
  if (currentMode.value !== 'study') return;

  if (event.code === 'Space') {
    event.preventDefault();
    toggleFlip();
  } else if (event.code === 'Digit1' && isFlipped.value) {
    event.preventDefault();
    answerIncorrect();
  } else if (event.code === 'Digit2' && isFlipped.value) {
    event.preventDefault();
    answerCorrect();
  }
};

// Browse mode
const filters = ref({
  difficulty: 'all',
  case: 'all',
  box: 'all'
});

const filteredCards = computed(() => {
  return store.cards.filter(card => {
    if (filters.value.difficulty !== 'all' && card.difficulty !== filters.value.difficulty) {
      return false;
    }
    if (filters.value.case !== 'all' && !card.tags.includes(filters.value.case)) {
      return false;
    }
    if (filters.value.box !== 'all' && card.box !== parseInt(filters.value.box)) {
      return false;
    }
    return true;
  });
});

const clearFilters = () => {
  filters.value = {
    difficulty: 'all',
    case: 'all',
    box: 'all'
  };
};

const selectBrowseCard = (card) => {
  // Could implement a modal or detail view here
  console.log('Selected card:', card);
};

// Stats mode
const progressMetrics = computed(() => store.progressMetrics);
const cardsByBox = computed(() => store.cardsByBox);
const overallAccuracy = computed(() => store.overallAccuracy);
const sessionAccuracy = computed(() => store.sessionAccuracy);
const accuracyByCase = computed(() => store.accuracyByCase);
const accuracyByDifficulty = computed(() => store.accuracyByDifficulty);

const getBoxColor = (box) => {
  const colors = {
    1: '#ef4444',
    2: '#f97316',
    3: '#eab308',
    4: '#84cc16',
    5: '#22c55e'
  };
  return colors[box] || '#6b7280';
};

const confirmReset = () => {
  if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
    store.resetProgress();
    alert('All progress has been reset!');
  }
};
</script>

<style scoped>
.flashcards-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  padding-bottom: 60px;
}

/* Header */
.header {
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  color: white;
  padding: 32px 20px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
}

.title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.subtitle {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
}

/* Mode Tabs */
.mode-tabs {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  gap: 8px;
  padding: 20px;
  overflow-x: auto;
}

.mode-tab {
  flex: 1;
  min-width: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 16px;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.mode-tab:hover {
  border-color: #7c3aed;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.mode-tab.active {
  background: #7c3aed;
  border-color: #7c3aed;
  color: white;
  box-shadow: 0 4px 6px -1px rgb(124 58 237 / 0.3);
}

.mode-icon {
  font-size: 24px;
}

.mode-label {
  font-size: 14px;
  font-weight: 600;
}

.mode-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #ef4444;
  color: white;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 12px;
  min-width: 20px;
  text-align: center;
}

.mode-tab.active .mode-badge {
  background: white;
  color: #7c3aed;
}

/* Mode Content */
.mode-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* Study Mode */
.study-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;
}

.study-progress {
  width: 100%;
  max-width: 600px;
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgb(0 0 0 / 0.1);
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.progress-label {
  font-size: 14px;
  font-weight: 600;
  color: #475569;
}

.progress-count {
  font-size: 14px;
  color: #7c3aed;
  font-weight: 600;
}

.progress-bar {
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #7c3aed 0%, #8b5cf6 100%);
  transition: width 0.3s ease;
}

.session-stats {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.session-stat {
  font-size: 13px;
  font-weight: 600;
}

.session-stat.correct {
  color: #16a34a;
}

.session-stat.incorrect {
  color: #dc2626;
}

.session-stat.accuracy {
  color: #7c3aed;
}

.flashcard-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
}

.action-buttons {
  display: flex;
  gap: 16px;
  width: 100%;
  max-width: 600px;
}

.action-button {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 20px;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgb(0 0 0 / 0.1);
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgb(0 0 0 / 0.15);
}

.action-button:active {
  transform: translateY(0);
}

.show-answer {
  background: #7c3aed;
  color: white;
  font-size: 18px;
}

.again-button {
  background: #fef2f2;
  color: #dc2626;
  border: 2px solid #fecaca;
}

.again-button:hover {
  background: #fee2e2;
  border-color: #fca5a5;
}

.good-button {
  background: #f0fdf4;
  color: #16a34a;
  border: 2px solid #bbf7d0;
}

.good-button:hover {
  background: #dcfce7;
  border-color: #86efac;
}

.button-icon {
  font-size: 24px;
}

.button-label {
  font-size: 16px;
}

.button-hint {
  font-size: 11px;
  opacity: 0.7;
}

.keyboard-hints {
  display: flex;
  gap: 16px;
  justify-content: center;
  font-size: 12px;
  color: #9ca3af;
}

.keyboard-hint {
  padding: 4px 8px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

/* Browse Mode */
.filters {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  background: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgb(0 0 0 / 0.1);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  font-size: 14px;
  font-weight: 600;
  color: #475569;
}

.filter-select {
  padding: 8px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;
}

.filter-select:hover,
.filter-select:focus {
  border-color: #7c3aed;
  outline: none;
}

.clear-filters-button {
  padding: 8px 16px;
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
  margin-left: auto;
}

.clear-filters-button:hover {
  background: #e5e7eb;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.browse-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgb(0 0 0 / 0.1);
  border: 2px solid transparent;
}

.browse-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgb(0 0 0 / 0.15);
  border-color: #7c3aed;
}

.browse-card-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.browse-card-content {
  margin-bottom: 12px;
}

.card-question {
  font-size: 14px;
  color: #475569;
  margin-bottom: 8px;
}

.card-answer {
  font-size: 16px;
  font-weight: 600;
  color: #16a34a;
}

.browse-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
}

.card-stats {
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: #6b7280;
}

.reset-card-button {
  padding: 4px 12px;
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.reset-card-button:hover {
  background: #fee2e2;
}

/* Stats Mode */
.stats-section {
  background: white;
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgb(0 0 0 / 0.1);
}

.stats-section-title {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 20px 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-card {
  background: #f9fafb;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  border: 2px solid #e5e7eb;
}

.stat-card.highlight {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-color: #86efac;
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
  color: #7c3aed;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #475569;
  font-weight: 600;
}

.stat-percentage {
  font-size: 12px;
  color: #16a34a;
  font-weight: 600;
  margin-top: 4px;
}

.box-distribution,
.case-accuracy,
.difficulty-accuracy {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.box-stat,
.case-stat,
.difficulty-stat {
  display: flex;
  align-items: center;
  gap: 12px;
}

.box-label,
.case-label,
.difficulty-label {
  min-width: 100px;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
}

.case-label {
  padding: 6px 12px;
  border-radius: 8px;
  text-align: center;
}

.case-nominativ {
  background: #E3F2FD;
  color: #1565C0;
}

.case-akkusativ {
  background: #FFEBEE;
  color: #C62828;
}

.case-dativ {
  background: #E8F5E9;
  color: #2E7D32;
}

.case-genitiv {
  background: #FFF3E0;
  color: #E65100;
}

.box-bar-container,
.case-bar-container,
.difficulty-bar-container {
  flex: 1;
  height: 24px;
  background: #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}

.box-bar,
.case-bar,
.difficulty-bar {
  height: 100%;
  transition: width 0.3s ease;
  border-radius: 12px;
}

.case-bar-nominativ {
  background: #2196F3;
}

.case-bar-akkusativ {
  background: #F44336;
}

.case-bar-dativ {
  background: #4CAF50;
}

.case-bar-genitiv {
  background: #FF9800;
}

.difficulty-bar-easy {
  background: #22c55e;
}

.difficulty-bar-medium {
  background: #eab308;
}

.difficulty-bar-hard {
  background: #ef4444;
}

.box-count,
.case-percentage,
.difficulty-percentage {
  min-width: 80px;
  text-align: right;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
}

.reset-all-button {
  width: 100%;
  padding: 16px;
  background: #fef2f2;
  color: #dc2626;
  border: 2px solid #fecaca;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.reset-all-button:hover {
  background: #fee2e2;
  border-color: #fca5a5;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-title {
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px 0;
}

.empty-description {
  font-size: 16px;
  color: #64748b;
  margin: 0 0 24px 0;
}

.reset-button {
  padding: 12px 24px;
  background: #7c3aed;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.reset-button:hover {
  background: #6d28d9;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgb(124 58 237 / 0.3);
}

/* Difficulty badges (used in browse) */
.difficulty-badge {
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
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
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  background: #7c3aed;
  color: white;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .header {
    padding: 24px 16px;
  }

  .title {
    font-size: 24px;
  }

  .subtitle {
    font-size: 14px;
  }

  .mode-tabs {
    padding: 16px;
    gap: 6px;
  }

  .mode-tab {
    min-width: 100px;
    padding: 12px;
  }

  .mode-content {
    padding: 16px;
  }

  .filters {
    flex-direction: column;
  }

  .filter-group {
    width: 100%;
    justify-content: space-between;
  }

  .filter-select {
    flex: 1;
  }

  .clear-filters-button {
    margin-left: 0;
    width: 100%;
  }

  .cards-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
  }
}
</style>
