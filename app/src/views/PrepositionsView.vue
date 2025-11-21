<script setup>
import { ref } from 'vue'
import MultipleChoiceExercise from '../components/MultipleChoiceExercise.vue'
import EmbeddedFlashcards from '../components/EmbeddedFlashcards.vue'
import prepData from '../data/prepositions.json'

const showExercises = ref(false)
const showFlashcards = ref(false)
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <header class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">German Prepositions</h1>
        <p class="text-lg text-gray-600">Akkusativ, Dativ, Two-Way, and Genitiv</p>
      </header>

      <!-- Akkusativ Prepositions -->
      <div class="card mb-8">
        <h2 class="text-2xl font-bold text-red-600 mb-4">{{ prepData.akkusativ.name }}</h2>
        <p class="mb-4">{{ prepData.akkusativ.description }}</p>
        <div class="bg-red-50 border-2 border-red-300 p-4 rounded-lg mb-6">
          <p class="font-bold">💡 Mnemonic: {{ prepData.akkusativ.mnemonic }}</p>
        </div>
        <div class="grid md:grid-cols-3 gap-4">
          <div v-for="prep in prepData.akkusativ.prepositions" :key="prep.word" class="border-2 border-red-200 p-4 rounded-lg">
            <h3 class="text-xl font-bold text-red-600">{{ prep.word }}</h3>
            <p class="text-sm text-gray-600 mb-2">{{ prep.meaning }}</p>
            <div class="space-y-1">
              <p v-for="(ex, i) in prep.examples" :key="i" class="text-xs italic">→ {{ ex }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Dativ Prepositions -->
      <div class="card mb-8">
        <h2 class="text-2xl font-bold text-green-600 mb-4">{{ prepData.dativ.name }}</h2>
        <p class="mb-4">{{ prepData.dativ.description }}</p>
        <div class="bg-green-50 border-2 border-green-300 p-4 rounded-lg mb-6">
          <p class="font-bold">💡 Mnemonic: {{ prepData.dativ.mnemonic }}</p>
        </div>
        <div class="grid md:grid-cols-3 gap-4">
          <div v-for="prep in prepData.dativ.prepositions" :key="prep.word" class="border-2 border-green-200 p-4 rounded-lg">
            <h3 class="text-xl font-bold text-green-600">{{ prep.word }}</h3>
            <p class="text-sm text-gray-600 mb-2">{{ prep.meaning }}</p>
            <div class="space-y-1">
              <p v-for="(ex, i) in prep.examples" :key="i" class="text-xs italic">→ {{ ex }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Two-Way Prepositions -->
      <div class="card mb-8">
        <h2 class="text-2xl font-bold text-purple-600 mb-4">{{ prepData.wechselprapositionen.name }}</h2>
        <p class="mb-4">{{ prepData.wechselprapositionen.description }}</p>
        <div class="bg-purple-50 border-2 border-purple-300 p-4 rounded-lg mb-6">
          <p class="font-bold text-center text-lg">{{ prepData.wechselprapositionen.rule }}</p>
        </div>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="prep in prepData.wechselprapositionen.prepositions" :key="prep.word" class="border-2 border-purple-200 p-4 rounded-lg">
            <h3 class="text-xl font-bold text-purple-600 mb-2">{{ prep.word }}</h3>
            <p class="text-sm text-gray-600 mb-3">{{ prep.meaning }}</p>
            <div class="space-y-2">
              <div class="bg-red-50 p-2 rounded">
                <p class="text-xs font-semibold text-red-600">Akkusativ (motion):</p>
                <p class="text-xs italic">{{ prep.akkusativExample }}</p>
              </div>
              <div class="bg-green-50 p-2 rounded">
                <p class="text-xs font-semibold text-green-600">Dativ (location):</p>
                <p class="text-xs italic">{{ prep.dativExample }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Genitiv Prepositions -->
      <div class="card mb-8">
        <h2 class="text-2xl font-bold text-orange-600 mb-4">{{ prepData.genitiv.name }}</h2>
        <p class="mb-4">{{ prepData.genitiv.description }}</p>
        <div class="grid md:grid-cols-3 gap-4">
          <div v-for="prep in prepData.genitiv.prepositions" :key="prep.word" class="border-2 border-orange-200 p-4 rounded-lg">
            <h3 class="text-xl font-bold text-orange-600">{{ prep.word }}</h3>
            <p class="text-sm text-gray-600 mb-2">{{ prep.meaning }}</p>
            <div class="space-y-1">
              <p v-for="(ex, i) in prep.examples" :key="i" class="text-xs italic">→ {{ ex }}</p>
            </div>
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
        <EmbeddedFlashcards :flashcards="prepData.flashcards" title="Prepositions Practice" />
      </div>

      <!-- Exercises -->
      <div v-if="showExercises" class="card">
        <MultipleChoiceExercise :exercises="prepData.exercises" title="Prepositions Exercises" />
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
