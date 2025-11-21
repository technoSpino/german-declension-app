<script setup>
import { ref } from 'vue'
import MultipleChoiceExercise from '../components/MultipleChoiceExercise.vue'
import EmbeddedFlashcards from '../components/EmbeddedFlashcards.vue'
import pastTenseData from '../data/pastTense.json'

const showExercises = ref(false)
const showFlashcards = ref(false)
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <header class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">{{ pastTenseData.name }}</h1>
        <p class="text-lg text-gray-600">{{ pastTenseData.description }}</p>
      </header>

      <!-- Formation Rules -->
      <div class="card mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">How to Form the Perfekt</h2>
        <div class="bg-violet-50 border-2 border-violet-300 p-6 rounded-lg mb-6">
          <p class="text-xl font-bold text-center">{{ pastTenseData.formation.formula }}</p>
          <div class="mt-4 space-y-1">
            <p v-for="(ex, i) in pastTenseData.formation.examples" :key="i" class="text-center italic">{{ ex }}</p>
          </div>
        </div>

        <!-- Auxiliary Verbs -->
        <div class="grid md:grid-cols-2 gap-6">
          <!-- haben -->
          <div class="bg-blue-50 border-2 border-blue-300 p-6 rounded-lg">
            <h3 class="text-xl font-bold text-blue-600 mb-2">Using "haben"</h3>
            <p class="mb-3">{{ pastTenseData.auxiliaryVerbs.haben.usage }}</p>
            <ul class="space-y-1 mb-4">
              <li v-for="(rule, i) in pastTenseData.auxiliaryVerbs.haben.rules" :key="i" class="text-sm">• {{ rule }}</li>
            </ul>
            <div class="space-y-1">
              <p v-for="(ex, i) in pastTenseData.auxiliaryVerbs.haben.examples" :key="i" class="text-sm italic">✓ {{ ex }}</p>
            </div>
          </div>

          <!-- sein -->
          <div class="bg-green-50 border-2 border-green-300 p-6 rounded-lg">
            <h3 class="text-xl font-bold text-green-600 mb-2">Using "sein"</h3>
            <p class="mb-3">{{ pastTenseData.auxiliaryVerbs.sein.usage }}</p>
            <ul class="space-y-1 mb-4">
              <li v-for="(rule, i) in pastTenseData.auxiliaryVerbs.sein.rules" :key="i" class="text-sm">• {{ rule }}</li>
            </ul>
            <div class="space-y-1">
              <p v-for="(ex, i) in pastTenseData.auxiliaryVerbs.sein.examples" :key="i" class="text-sm italic">✓ {{ ex }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Past Participle Patterns -->
      <div class="card mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Past Participle Patterns</h2>

        <!-- Regular -->
        <div class="mb-6">
          <h3 class="text-xl font-bold text-green-600 mb-3">Regular Verbs: {{ pastTenseData.pastParticiples.regular.pattern }}</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div v-for="verb in pastTenseData.pastParticiples.regular.examples" :key="verb.infinitive" class="bg-green-50 border border-green-200 p-3 rounded-lg">
              <p class="text-sm">{{ verb.infinitive }}</p>
              <p class="font-bold text-green-600">{{ verb.participle }}</p>
              <p class="text-xs text-gray-600">{{ verb.meaning }}</p>
            </div>
          </div>
        </div>

        <!-- Irregular -->
        <div class="mb-6">
          <h3 class="text-xl font-bold text-red-600 mb-3">Irregular Verbs: {{ pastTenseData.pastParticiples.irregular.pattern }}</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div v-for="verb in pastTenseData.pastParticiples.irregular.examples.slice(0, 8)" :key="verb.infinitive" class="bg-red-50 border border-red-200 p-3 rounded-lg">
              <p class="text-sm">{{ verb.infinitive }}</p>
              <p class="font-bold text-red-600">{{ verb.participle }}</p>
              <p class="text-xs text-gray-600">{{ verb.meaning }} ({{ verb.auxiliary }})</p>
            </div>
          </div>
        </div>

        <!-- Separable -->
        <div class="mb-6">
          <h3 class="text-xl font-bold text-blue-600 mb-3">Separable Verbs: {{ pastTenseData.pastParticiples.separable.pattern }}</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div v-for="verb in pastTenseData.pastParticiples.separable.examples" :key="verb.infinitive" class="bg-blue-50 border border-blue-200 p-3 rounded-lg">
              <p class="text-sm">{{ verb.infinitive }}</p>
              <p class="font-bold text-blue-600">{{ verb.participle }}</p>
              <p class="text-xs text-gray-600">{{ verb.meaning }} ({{ verb.auxiliary }})</p>
            </div>
          </div>
        </div>

        <!-- Inseparable -->
        <div>
          <h3 class="text-xl font-bold text-orange-600 mb-3">Inseparable Verbs: {{ pastTenseData.pastParticiples.inseparable.pattern }}</h3>
          <p class="text-sm mb-3">Prefixes: {{ pastTenseData.pastParticiples.inseparable.prefixes.join(', ') }}</p>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div v-for="verb in pastTenseData.pastParticiples.inseparable.examples" :key="verb.infinitive" class="bg-orange-50 border border-orange-200 p-3 rounded-lg">
              <p class="text-sm">{{ verb.infinitive }}</p>
              <p class="font-bold text-orange-600">{{ verb.participle }}</p>
              <p class="text-xs text-gray-600">{{ verb.meaning }} ({{ verb.auxiliary }})</p>
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
        <EmbeddedFlashcards :flashcards="pastTenseData.flashcards" title="Past Tense Practice" />
      </div>

      <!-- Exercises -->
      <div v-if="showExercises" class="card">
        <MultipleChoiceExercise :exercises="pastTenseData.exercises" title="Past Tense Exercises" />
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
