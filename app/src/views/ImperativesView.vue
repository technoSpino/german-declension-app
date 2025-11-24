<script setup>
import { ref } from 'vue'
import MultipleChoiceExercise from '../components/MultipleChoiceExercise.vue'
import EmbeddedFlashcards from '../components/EmbeddedFlashcards.vue'
import imperativeData from '../data/imperatives.json'

const showExercises = ref(false)
const showFlashcards = ref(false)
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <header class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">{{ imperativeData.introduction.title }}</h1>
        <p class="text-lg text-gray-600">{{ imperativeData.introduction.description }}</p>
      </header>

      <!-- Key Rules -->
      <div class="card mb-8">
        <h2 class="text-2xl font-bold text-violet-600 mb-4">Key Rules for Forming Imperatives</h2>
        <ul class="space-y-2">
          <li v-for="(rule, index) in imperativeData.introduction.keyRules" :key="index" class="flex items-start gap-2">
            <span class="text-violet-600 font-bold">{{ index + 1 }}.</span>
            <span class="text-gray-700">{{ rule }}</span>
          </li>
        </ul>
        <div class="mt-6 grid md:grid-cols-3 gap-4">
          <div class="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-center">
            <p class="font-bold text-blue-600">du-form</p>
            <p class="text-sm text-gray-600">Informal singular</p>
            <p class="text-blue-700 font-semibold mt-1">Mach!</p>
          </div>
          <div class="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-center">
            <p class="font-bold text-green-600">ihr-form</p>
            <p class="text-sm text-gray-600">Informal plural</p>
            <p class="text-green-700 font-semibold mt-1">Macht!</p>
          </div>
          <div class="bg-orange-50 border-2 border-orange-200 rounded-lg p-4 text-center">
            <p class="font-bold text-orange-600">Sie-form</p>
            <p class="text-sm text-gray-600">Formal (sing. & pl.)</p>
            <p class="text-orange-700 font-semibold mt-1">Machen Sie!</p>
          </div>
        </div>
      </div>

      <!-- Regular Verbs -->
      <div class="card mb-8">
        <h2 class="text-2xl font-bold text-green-600 mb-6">Regular Verbs</h2>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="verb in imperativeData.regularVerbs" :key="verb.infinitive" class="border-2 border-green-200 rounded-lg p-4">
            <h3 class="text-xl font-bold text-green-600">{{ verb.infinitive }}</h3>
            <p class="text-sm text-gray-600 mb-3">{{ verb.meaning }}</p>
            <table class="w-full text-sm mb-3">
              <tbody>
                <tr v-for="(imperative, form) in verb.imperatives" :key="form" class="border-b last:border-0">
                  <td class="py-1 pr-4 font-semibold text-gray-600">{{ form }}</td>
                  <td class="py-1 text-green-600 font-bold">{{ imperative }}</td>
                </tr>
              </tbody>
            </table>
            <div class="text-xs text-gray-500 space-y-1">
              <p v-for="(example, i) in verb.examples" :key="i">{{ example }}</p>
            </div>
            <p v-if="verb.note" class="text-xs text-orange-600 mt-2 font-semibold">📌 {{ verb.note }}</p>
          </div>
        </div>
      </div>

      <!-- Stem-Changing Verbs -->
      <div class="card mb-8">
        <h2 class="text-2xl font-bold text-purple-600 mb-4">Stem-Changing Verbs</h2>
        <div class="bg-purple-50 border-2 border-purple-300 p-4 rounded-lg mb-6">
          <p class="font-semibold text-purple-700">Important: e→i and e→ie changes are KEPT in du-form, but a→ä changes are NOT!</p>
        </div>
        <div class="grid md:grid-cols-2 gap-6">
          <div v-for="verb in imperativeData.stemChangingVerbs" :key="verb.infinitive" class="border-2 border-purple-200 rounded-lg p-4">
            <h3 class="text-xl font-bold text-purple-600">{{ verb.infinitive }}</h3>
            <p class="text-sm text-gray-600">{{ verb.meaning }}</p>
            <p class="text-xs text-purple-600 font-semibold mb-3">Change: {{ verb.stemChange }}</p>
            <table class="w-full text-sm mb-3">
              <tbody>
                <tr v-for="(imperative, form) in verb.imperatives" :key="form" class="border-b last:border-0">
                  <td class="py-1 pr-4 font-semibold text-gray-600">{{ form }}</td>
                  <td class="py-1 text-purple-600 font-bold">{{ imperative }}</td>
                </tr>
              </tbody>
            </table>
            <div class="text-xs text-gray-500 space-y-1">
              <p v-for="(example, i) in verb.examples" :key="i">{{ example }}</p>
            </div>
            <p v-if="verb.note" class="text-xs text-orange-600 mt-2 font-semibold">📌 {{ verb.note }}</p>
          </div>
        </div>
      </div>

      <!-- Irregular Verbs -->
      <div class="card mb-8">
        <h2 class="text-2xl font-bold text-red-600 mb-4">Irregular Verbs</h2>
        <div class="bg-red-50 border-2 border-red-300 p-4 rounded-lg mb-6">
          <p class="font-semibold text-red-700">These verbs have irregular imperative forms that must be memorized!</p>
        </div>
        <div class="grid md:grid-cols-3 gap-6">
          <div v-for="verb in imperativeData.irregularVerbs" :key="verb.infinitive" class="border-2 border-red-200 rounded-lg p-4">
            <h3 class="text-xl font-bold text-red-600">{{ verb.infinitive }}</h3>
            <p class="text-sm text-gray-600 mb-3">{{ verb.meaning }}</p>
            <table class="w-full text-sm mb-3">
              <tbody>
                <tr v-for="(imperative, form) in verb.imperatives" :key="form" class="border-b last:border-0">
                  <td class="py-1 pr-4 font-semibold text-gray-600">{{ form }}</td>
                  <td class="py-1 text-red-600 font-bold">{{ imperative }}</td>
                </tr>
              </tbody>
            </table>
            <div class="text-xs text-gray-500 space-y-1">
              <p v-for="(example, i) in verb.examples" :key="i">{{ example }}</p>
            </div>
            <p v-if="verb.note" class="text-xs text-orange-600 mt-2 font-semibold">📌 {{ verb.note }}</p>
          </div>
        </div>
      </div>

      <!-- Separable Verbs -->
      <div class="card mb-8">
        <h2 class="text-2xl font-bold text-blue-600 mb-4">Separable Verbs</h2>
        <div class="bg-blue-50 border-2 border-blue-300 p-4 rounded-lg mb-6">
          <p class="font-semibold text-blue-700">The prefix separates and goes to the END of the imperative sentence!</p>
        </div>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="verb in imperativeData.separableVerbs" :key="verb.infinitive" class="border-2 border-blue-200 rounded-lg p-4">
            <h3 class="text-xl font-bold text-blue-600">{{ verb.infinitive }}</h3>
            <p class="text-sm text-gray-600 mb-3">{{ verb.meaning }}</p>
            <table class="w-full text-sm mb-3">
              <tbody>
                <tr v-for="(imperative, form) in verb.imperatives" :key="form" class="border-b last:border-0">
                  <td class="py-1 pr-4 font-semibold text-gray-600">{{ form }}</td>
                  <td class="py-1 text-blue-600 font-bold">{{ imperative }}</td>
                </tr>
              </tbody>
            </table>
            <div class="text-xs text-gray-500 space-y-1">
              <p v-for="(example, i) in verb.examples" :key="i">{{ example }}</p>
            </div>
            <p v-if="verb.note" class="text-xs text-orange-600 mt-2 font-semibold">📌 {{ verb.note }}</p>
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
        <EmbeddedFlashcards :flashcards="imperativeData.flashcards" title="Imperative Practice" />
      </div>

      <!-- Exercises -->
      <div v-if="showExercises" class="card">
        <MultipleChoiceExercise :exercises="imperativeData.exercises" title="Imperative Exercises" />
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
