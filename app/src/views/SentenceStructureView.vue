<script setup>
import { ref } from 'vue'
import MultipleChoiceExercise from '../components/MultipleChoiceExercise.vue'
import EmbeddedFlashcards from '../components/EmbeddedFlashcards.vue'
import sentenceData from '../data/sentenceStructure.json'

const showExercises = ref(false)
const showFlashcards = ref(false)
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <header class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">Sentence Structure</h1>
        <p class="text-lg text-gray-600">Hauptsatz (Main Clause) & Nebensatz (Subordinate Clause)</p>
      </header>

      <!-- Hauptsatz Section -->
      <div class="card mb-8">
        <h2 class="text-3xl font-bold text-blue-600 mb-4">{{ sentenceData.hauptsatz.name }}</h2>
        <p class="text-lg mb-6">{{ sentenceData.hauptsatz.description }}</p>

        <div class="space-y-6">
          <div v-for="(rule, index) in sentenceData.hauptsatz.rules" :key="index" class="bg-blue-50 p-4 rounded-lg">
            <p class="font-semibold text-gray-900 mb-2">{{ rule.rule }}</p>
            <div class="space-y-1">
              <p v-for="(ex, i) in rule.examples" :key="i" class="text-sm text-gray-700 italic">✓ {{ ex }}</p>
            </div>
          </div>
        </div>

        <div class="mt-6">
          <h3 class="text-xl font-bold mb-4">Word Order Patterns</h3>
          <div class="grid md:grid-cols-2 gap-4">
            <div v-for="pattern in sentenceData.hauptsatz.wordOrderPatterns" :key="pattern.name" class="border-2 border-blue-200 p-4 rounded-lg">
              <h4 class="font-bold text-blue-600">{{ pattern.name }}</h4>
              <p class="text-sm text-gray-600 my-2">{{ pattern.pattern }}</p>
              <p class="text-sm italic">{{ pattern.example }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Nebensatz Section -->
      <div class="card mb-8">
        <h2 class="text-3xl font-bold text-red-600 mb-4">{{ sentenceData.nebensatz.name }}</h2>
        <p class="text-lg mb-6">{{ sentenceData.nebensatz.description }}</p>

        <div class="mb-6">
          <h3 class="text-xl font-bold mb-4">Common Conjunctions</h3>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <div v-for="conj in sentenceData.nebensatz.conjunctions" :key="conj.word" class="bg-red-50 border border-red-200 p-3 rounded-lg text-center">
              <p class="font-bold text-red-600">{{ conj.word }}</p>
              <p class="text-xs text-gray-600">{{ conj.meaning }}</p>
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <div v-for="(rule, index) in sentenceData.nebensatz.rules" :key="index" class="bg-red-50 p-4 rounded-lg">
            <p class="font-semibold text-gray-900 mb-2">{{ rule.rule }}</p>
            <div class="space-y-1">
              <p v-for="(ex, i) in rule.examples" :key="i" class="text-sm text-gray-700 italic">✓ {{ ex }}</p>
            </div>
          </div>
        </div>

        <div class="mt-6 bg-yellow-50 border-2 border-yellow-300 p-4 rounded-lg">
          <p class="font-bold text-gray-900">Pattern: {{ sentenceData.nebensatz.wordOrderPattern.pattern }}</p>
          <div class="mt-2 space-y-1">
            <p v-for="(ex, i) in sentenceData.nebensatz.wordOrderPattern.examples" :key="i" class="text-sm text-gray-700 italic">{{ ex }}</p>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-4 justify-center mb-8">
        <button @click="showFlashcards = !showFlashcards" class="btn-primary">
          {{ showFlashcards ? 'Hide' : 'Show' }} Flashcards
        </button>
        <button @click="showExercises = !showExercises" class="btn-secondary">
          {{ showExercises ? 'Hide' : 'Show' }} Exercises
        </button>
      </div>

      <!-- Embedded Flashcards -->
      <div v-if="showFlashcards" class="card mb-8">
        <EmbeddedFlashcards :flashcards="sentenceData.flashcards" title="Sentence Structure Practice" />
      </div>

      <!-- Exercises -->
      <div v-if="showExercises" class="card">
        <MultipleChoiceExercise :exercises="sentenceData.exercises" title="Sentence Structure Exercises" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.btn-primary {
  padding: 12px 24px;
  background: #7c3aed;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: #6d28d9;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgb(124 58 237 / 0.3);
}

.btn-secondary {
  padding: 12px 24px;
  background: white;
  color: #7c3aed;
  border: 2px solid #7c3aed;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #f5f3ff;
  transform: translateY(-2px);
}
</style>
