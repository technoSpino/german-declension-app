<script setup>
import { ref } from 'vue'
import MultipleChoiceExercise from '../components/MultipleChoiceExercise.vue'
import EmbeddedFlashcards from '../components/EmbeddedFlashcards.vue'
import werdenData from '../data/werden.json'

const showExercises = ref(false)
const showFlashcards = ref(false)
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <header class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">{{ werdenData.introduction.title }}</h1>
        <p class="text-lg text-gray-600">{{ werdenData.introduction.description }}</p>
      </header>

      <!-- Conjugation Table -->
      <div class="card mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Present Tense Conjugation</h2>
        <div class="bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg p-6 max-w-md mx-auto">
          <table class="w-full">
            <tbody>
              <tr v-for="(conjugation, pronoun) in werdenData.conjugation.present" :key="pronoun" class="border-b last:border-0">
                <td class="py-3 pr-6 font-semibold text-gray-700 text-lg">{{ pronoun }}</td>
                <td class="py-3 text-violet-600 font-bold text-lg">{{ conjugation }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Three Uses of Werden -->
      <div class="card mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Three Uses of 'werden'</h2>

        <div class="space-y-8">
          <div v-for="(use, index) in werdenData.uses" :key="index" class="border-l-4 pl-6"
               :class="index === 0 ? 'border-blue-500' : index === 1 ? 'border-green-500' : 'border-orange-500'">
            <h3 class="text-xl font-bold mb-2"
                :class="index === 0 ? 'text-blue-600' : index === 1 ? 'text-green-600' : 'text-orange-600'">
              {{ use.title }}
            </h3>
            <p class="text-gray-700 mb-4">{{ use.description }}</p>

            <!-- Structure (for future tense and passive) -->
            <div v-if="use.structure" class="bg-gray-100 rounded-lg p-4 mb-4">
              <p class="font-semibold text-gray-900">Structure: <span class="text-violet-600">{{ use.structure }}</span></p>
            </div>

            <!-- Examples -->
            <div class="space-y-3">
              <div v-for="(example, exIndex) in use.examples" :key="exIndex"
                   class="rounded-lg p-4"
                   :class="index === 0 ? 'bg-blue-50' : index === 1 ? 'bg-green-50' : 'bg-orange-50'">
                <p class="font-semibold text-gray-900">{{ example.german }}</p>
                <p class="text-sm text-gray-600 mt-1">→ {{ example.english }}</p>
                <p v-if="example.breakdown" class="text-xs text-gray-500 mt-1 italic">{{ example.breakdown }}</p>
                <p v-if="example.note" class="text-xs text-gray-500 mt-1 italic">{{ example.note }}</p>
                <p v-if="example.active" class="text-xs text-gray-500 mt-1">Active: {{ example.active }}</p>
              </div>
            </div>

            <!-- Note -->
            <div v-if="use.note" class="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
              <p class="text-sm text-gray-700"><strong>Note:</strong> {{ use.note }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Comparison Section -->
      <div class="card mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">{{ werdenData.comparison.title }}</h2>
        <div class="space-y-4">
          <div v-for="(example, index) in werdenData.comparison.examples" :key="index"
               class="border rounded-lg p-4"
               :class="example.type.includes('Main') ? 'bg-blue-50 border-blue-200' :
                       example.type.includes('Future') ? 'bg-green-50 border-green-200' :
                       'bg-orange-50 border-orange-200'">
            <p class="font-bold text-lg text-gray-900">{{ example.sentence }}</p>
            <p class="text-sm text-gray-600 mt-1">→ {{ example.english }}</p>
            <div class="mt-2 flex items-center gap-2">
              <span class="inline-block px-3 py-1 rounded-full text-xs font-semibold"
                    :class="example.type.includes('Main') ? 'bg-blue-200 text-blue-800' :
                            example.type.includes('Future') ? 'bg-green-200 text-green-800' :
                            'bg-orange-200 text-orange-800'">
                {{ example.type }}
              </span>
              <span v-if="example.hint" class="text-xs text-gray-500 italic">{{ example.hint }}</span>
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
        <EmbeddedFlashcards :flashcards="werdenData.flashcards" title="Werden Practice" />
      </div>

      <!-- Exercises -->
      <div v-if="showExercises" class="card">
        <MultipleChoiceExercise :exercises="werdenData.exercises" title="Werden Exercises" />
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
