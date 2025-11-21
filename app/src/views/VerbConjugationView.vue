<script setup>
import { ref } from 'vue'
import MultipleChoiceExercise from '../components/MultipleChoiceExercise.vue'
import EmbeddedFlashcards from '../components/EmbeddedFlashcards.vue'
import verbData from '../data/verbConjugations.json'

const showExercises = ref(false)
const showFlashcards = ref(false)
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <header class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">Verb Conjugation (Present Tense)</h1>
        <p class="text-lg text-gray-600">Regular, Irregular, Stem-Changing, and Separable Verbs</p>
      </header>

      <!-- Regular Verbs -->
      <div class="card mb-8">
        <h2 class="text-2xl font-bold text-green-600 mb-6">Regular Verbs</h2>
        <div class="grid md:grid-cols-2 gap-6">
          <div v-for="verb in verbData.regularVerbs" :key="verb.infinitive" class="border-2 border-green-200 rounded-lg p-4">
            <h3 class="text-xl font-bold text-green-600">{{ verb.infinitive }}</h3>
            <p class="text-sm text-gray-600 mb-3">{{ verb.meaning }}</p>
            <table class="w-full text-sm">
              <tbody>
                <tr v-for="(conjugation, pronoun) in verb.conjugations" :key="pronoun" class="border-b last:border-0">
                  <td class="py-1 pr-4 font-semibold">{{ pronoun }}</td>
                  <td class="py-1 text-green-600 font-bold">{{ conjugation }}</td>
                </tr>
              </tbody>
            </table>
            <p v-if="verb.note" class="text-xs text-orange-600 mt-2">📌 {{ verb.note }}</p>
          </div>
        </div>
      </div>

      <!-- Irregular Verbs -->
      <div class="card mb-8">
        <h2 class="text-2xl font-bold text-red-600 mb-6">Irregular Verbs (sein, haben, werden)</h2>
        <div class="grid md:grid-cols-3 gap-6">
          <div v-for="verb in verbData.irregularVerbs" :key="verb.infinitive" class="border-2 border-red-200 rounded-lg p-4">
            <h3 class="text-xl font-bold text-red-600">{{ verb.infinitive }}</h3>
            <p class="text-sm text-gray-600 mb-3">{{ verb.meaning }}</p>
            <table class="w-full text-sm">
              <tbody>
                <tr v-for="(conjugation, pronoun) in verb.conjugations" :key="pronoun" class="border-b last:border-0">
                  <td class="py-1 pr-4 font-semibold">{{ pronoun }}</td>
                  <td class="py-1 text-red-600 font-bold">{{ conjugation }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Stem-Changing Verbs -->
      <div class="card mb-8">
        <h2 class="text-2xl font-bold text-purple-600 mb-6">Stem-Changing Verbs</h2>
        <div class="grid md:grid-cols-2 gap-6">
          <div v-for="verb in verbData.stemChangingVerbs" :key="verb.infinitive" class="border-2 border-purple-200 rounded-lg p-4">
            <h3 class="text-xl font-bold text-purple-600">{{ verb.infinitive }}</h3>
            <p class="text-sm text-gray-600">{{ verb.meaning }}</p>
            <p class="text-xs text-purple-600 font-semibold mb-3">Change: {{ verb.stemChange }}</p>
            <table class="w-full text-sm">
              <tbody>
                <tr v-for="(conjugation, pronoun) in verb.conjugations" :key="pronoun" class="border-b last:border-0">
                  <td class="py-1 pr-4 font-semibold">{{ pronoun }}</td>
                  <td class="py-1 text-purple-600 font-bold">{{ conjugation }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Separable Verbs -->
      <div class="card mb-8">
        <h2 class="text-2xl font-bold text-blue-600 mb-6">Separable Verbs</h2>
        <div class="bg-blue-50 border-2 border-blue-300 p-4 rounded-lg mb-6">
          <p class="font-semibold">The prefix separates and goes to the END in main clauses!</p>
        </div>
        <div class="grid md:grid-cols-3 gap-6">
          <div v-for="verb in verbData.separableVerbs" :key="verb.infinitive" class="border-2 border-blue-200 rounded-lg p-4">
            <h3 class="text-xl font-bold text-blue-600">{{ verb.infinitive }}</h3>
            <p class="text-sm text-gray-600 mb-3">{{ verb.meaning }}</p>
            <p class="text-xs text-blue-600 font-semibold mb-2">Prefix: {{ verb.prefix }}</p>
            <div class="text-sm space-y-1">
              <p v-for="(conjugation, pronoun) in verb.conjugations" :key="pronoun">
                <span class="font-semibold">{{ pronoun }}:</span> <span class="text-blue-600 font-bold">{{ conjugation }}</span>
              </p>
            </div>
            <p class="text-xs text-gray-500 mt-2 italic">{{ verb.note }}</p>
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
        <EmbeddedFlashcards :flashcards="verbData.flashcards" title="Verb Conjugation Practice" />
      </div>

      <!-- Exercises -->
      <div v-if="showExercises" class="card">
        <MultipleChoiceExercise :exercises="verbData.exercises" title="Verb Conjugation Exercises" />
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
