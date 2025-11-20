import { defineStore } from 'pinia';
import { flashcards as initialFlashcards } from '../data/flashcards.js';

// Leitner Box System Intervals (in days)
const LEITNER_INTERVALS = {
  1: 0,   // Review immediately
  2: 1,   // Review after 1 day
  3: 3,   // Review after 3 days
  4: 7,   // Review after 7 days
  5: 14   // Review after 14 days (mastered)
};

const STORAGE_KEY = 'german-declension-flashcards';
const DATA_VERSION = 3; // Increment this when flashcard content changes

export const useFlashcardStore = defineStore('flashcard', {
  state: () => ({
    cards: [],
    currentCardIndex: 0,
    sessionStats: {
      cardsReviewed: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      startTime: null
    },
    filters: {
      difficulty: 'all',
      case: 'all',
      box: 'all',
      tags: []
    }
  }),

  getters: {
    // Get all due cards (cards that need review today)
    dueCards: (state) => {
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Start of today

      return state.cards.filter(card => {
        if (!card.nextReview) return true; // Never reviewed
        const nextReview = new Date(card.nextReview);
        return nextReview <= now;
      });
    },

    // Get mastered cards (box 5)
    masteredCards: (state) => {
      return state.cards.filter(card => card.box === 5);
    },

    // Get cards currently being learned (box 1-4)
    learningCards: (state) => {
      return state.cards.filter(card => card.box < 5);
    },

    // Get current card
    currentCard: (state) => {
      const due = state.cards.filter(card => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        if (!card.nextReview) return true;
        const nextReview = new Date(card.nextReview);
        return nextReview <= now;
      });
      return due[state.currentCardIndex] || null;
    },

    // Overall accuracy
    overallAccuracy: (state) => {
      const totalAttempts = state.cards.reduce((sum, card) =>
        sum + card.correctCount + card.incorrectCount, 0
      );
      if (totalAttempts === 0) return 0;

      const totalCorrect = state.cards.reduce((sum, card) =>
        sum + card.correctCount, 0
      );
      return Math.round((totalCorrect / totalAttempts) * 100);
    },

    // Session accuracy
    sessionAccuracy: (state) => {
      const total = state.sessionStats.correctAnswers + state.sessionStats.incorrectAnswers;
      if (total === 0) return 0;
      return Math.round((state.sessionStats.correctAnswers / total) * 100);
    },

    // Accuracy by case
    accuracyByCase: (state) => {
      const cases = ['nominativ', 'akkusativ', 'dativ', 'genitiv'];
      const result = {};

      cases.forEach(caseName => {
        const caseCards = state.cards.filter(card =>
          card.tags.includes(caseName)
        );

        const totalAttempts = caseCards.reduce((sum, card) =>
          sum + card.correctCount + card.incorrectCount, 0
        );

        if (totalAttempts === 0) {
          result[caseName] = 0;
        } else {
          const correctAttempts = caseCards.reduce((sum, card) =>
            sum + card.correctCount, 0
          );
          result[caseName] = Math.round((correctAttempts / totalAttempts) * 100);
        }
      });

      return result;
    },

    // Accuracy by difficulty
    accuracyByDifficulty: (state) => {
      const difficulties = ['easy', 'medium', 'hard'];
      const result = {};

      difficulties.forEach(difficulty => {
        const difficultyCards = state.cards.filter(card =>
          card.difficulty === difficulty
        );

        const totalAttempts = difficultyCards.reduce((sum, card) =>
          sum + card.correctCount + card.incorrectCount, 0
        );

        if (totalAttempts === 0) {
          result[difficulty] = 0;
        } else {
          const correctAttempts = difficultyCards.reduce((sum, card) =>
            sum + card.correctCount, 0
          );
          result[difficulty] = Math.round((correctAttempts / totalAttempts) * 100);
        }
      });

      return result;
    },

    // Cards by box distribution
    cardsByBox: (state) => {
      const result = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      state.cards.forEach(card => {
        result[card.box]++;
      });
      return result;
    },

    // Filtered cards based on current filters
    filteredCards: (state) => {
      return state.cards.filter(card => {
        // Difficulty filter
        if (state.filters.difficulty !== 'all' && card.difficulty !== state.filters.difficulty) {
          return false;
        }

        // Case filter
        if (state.filters.case !== 'all' && !card.tags.includes(state.filters.case)) {
          return false;
        }

        // Box filter
        if (state.filters.box !== 'all' && card.box !== parseInt(state.filters.box)) {
          return false;
        }

        // Tags filter
        if (state.filters.tags.length > 0) {
          const hasTag = state.filters.tags.some(tag => card.tags.includes(tag));
          if (!hasTag) return false;
        }

        return true;
      });
    },

    // Progress metrics
    progressMetrics: (state) => {
      const total = state.cards.length;
      const mastered = state.cards.filter(card => card.box === 5).length;
      const learning = state.cards.filter(card => card.box > 1 && card.box < 5).length;
      const new_cards = state.cards.filter(card => card.box === 1 && !card.lastReviewed).length;
      const reviewing = state.cards.filter(card => card.box === 1 && card.lastReviewed).length;

      return {
        total,
        mastered,
        learning,
        new: new_cards,
        reviewing,
        masteredPercentage: Math.round((mastered / total) * 100),
        learningPercentage: Math.round((learning / total) * 100)
      };
    }
  },

  actions: {
    // Initialize store - load from localStorage or use initial data
    initialize() {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (stored) {
        try {
          const data = JSON.parse(stored);

          // Check if data version matches - if not, refresh with new card content
          if (data.version !== DATA_VERSION) {
            console.log(`Flashcard data updated (v${data.version || 1} → v${DATA_VERSION}) - refreshing from source`);
            // Keep user progress (box, counts, dates) but update card content
            this.refreshCardContent(data.cards || []);
          } else {
            this.cards = data.cards || [];

            // If stored cards don't match initial cards (new cards added), merge them
            if (this.cards.length !== initialFlashcards.length) {
              this.mergeNewCards();
            }
          }
        } catch (e) {
          console.error('Error loading flashcards from localStorage - clearing and using fresh data:', e);
          // Clear corrupted localStorage data
          localStorage.removeItem(STORAGE_KEY);
          // Use fresh flashcard data
          this.cards = JSON.parse(JSON.stringify(initialFlashcards));
        }
      } else {
        // First time - use initial flashcards
        this.cards = JSON.parse(JSON.stringify(initialFlashcards));
      }

      this.startSession();
      this.saveToLocalStorage();
    },

    // Refresh card content while preserving user progress
    refreshCardContent(oldCards) {
      // Create a map of old cards by ID to preserve progress
      const progressMap = new Map();
      oldCards.forEach(card => {
        progressMap.set(card.id, {
          box: card.box,
          lastReviewed: card.lastReviewed,
          nextReview: card.nextReview,
          correctCount: card.correctCount,
          incorrectCount: card.incorrectCount
        });
      });

      // Use fresh card data but restore progress
      this.cards = initialFlashcards.map(freshCard => {
        const progress = progressMap.get(freshCard.id);
        if (progress) {
          return {
            ...freshCard,
            ...progress
          };
        }
        return { ...freshCard };
      });
    },

    // Merge new cards from initial data if they don't exist
    mergeNewCards() {
      const existingIds = new Set(this.cards.map(c => c.id));
      const newCards = initialFlashcards.filter(c => !existingIds.has(c.id));

      if (newCards.length > 0) {
        this.cards = [...this.cards, ...JSON.parse(JSON.stringify(newCards))];
      }
    },

    // Save to localStorage
    saveToLocalStorage() {
      try {
        const data = {
          version: DATA_VERSION,
          cards: this.cards,
          lastUpdated: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (e) {
        console.error('Error saving to localStorage:', e);
      }
    },

    // Force refresh card content from source (button action)
    forceRefreshCards() {
      const oldCards = this.cards;
      this.refreshCardContent(oldCards);
      this.saveToLocalStorage();
    },

    // Calculate next review date based on Leitner box
    calculateNextReview(box) {
      const days = LEITNER_INTERVALS[box];
      const nextReview = new Date();
      nextReview.setDate(nextReview.getDate() + days);
      nextReview.setHours(0, 0, 0, 0); // Start of day
      return nextReview.toISOString();
    },

    // Answer card correctly - move to next box
    answerCorrect(cardId) {
      const card = this.cards.find(c => c.id === cardId);
      if (!card) return;

      // Update card stats
      card.correctCount++;
      card.lastReviewed = new Date().toISOString();

      // Move to next box (max box 5)
      if (card.box < 5) {
        card.box++;
      }

      // Calculate next review date
      card.nextReview = this.calculateNextReview(card.box);

      // Update session stats
      this.sessionStats.correctAnswers++;
      this.sessionStats.cardsReviewed++;

      // Move to next card
      this.nextCard();

      // Save to localStorage
      this.saveToLocalStorage();
    },

    // Answer card incorrectly - move back to box 1
    answerIncorrect(cardId) {
      const card = this.cards.find(c => c.id === cardId);
      if (!card) return;

      // Update card stats
      card.incorrectCount++;
      card.lastReviewed = new Date().toISOString();

      // Move back to box 1
      card.box = 1;

      // Calculate next review date (immediate)
      card.nextReview = this.calculateNextReview(1);

      // Update session stats
      this.sessionStats.incorrectAnswers++;
      this.sessionStats.cardsReviewed++;

      // Move to next card
      this.nextCard();

      // Save to localStorage
      this.saveToLocalStorage();
    },

    // Move to next card
    nextCard() {
      const dueCardsCount = this.dueCards.length;

      if (dueCardsCount === 0) {
        this.currentCardIndex = 0;
        return;
      }

      this.currentCardIndex++;

      // Loop back to start if we've gone through all due cards
      if (this.currentCardIndex >= dueCardsCount) {
        this.currentCardIndex = 0;
      }
    },

    // Start a new study session
    startSession() {
      this.sessionStats = {
        cardsReviewed: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        startTime: new Date().toISOString()
      };
      this.currentCardIndex = 0;
    },

    // Reset all progress (for testing)
    resetProgress() {
      this.cards = JSON.parse(JSON.stringify(initialFlashcards));
      this.currentCardIndex = 0;
      this.startSession();
      this.saveToLocalStorage();
    },

    // Reset a specific card
    resetCard(cardId) {
      const card = this.cards.find(c => c.id === cardId);
      if (!card) return;

      card.box = 1;
      card.lastReviewed = null;
      card.nextReview = null;
      card.correctCount = 0;
      card.incorrectCount = 0;

      this.saveToLocalStorage();
    },

    // Set filters
    setFilter(filterType, value) {
      this.filters[filterType] = value;
    },

    // Clear all filters
    clearFilters() {
      this.filters = {
        difficulty: 'all',
        case: 'all',
        box: 'all',
        tags: []
      };
    },

    // Get due cards count
    getDueCardsCount() {
      return this.dueCards.length;
    }
  }
});
