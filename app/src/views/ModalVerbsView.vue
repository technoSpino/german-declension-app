<script setup>
import { ref } from 'vue'
import MultipleChoiceExercise from '../components/MultipleChoiceExercise.vue'
import EmbeddedFlashcards from '../components/EmbeddedFlashcards.vue'
import modalVerbsData from '../data/modalVerbs.json'

const showExercises = ref(false)
const showFlashcards = ref(false)
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <header class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">Modal Verbs (Modalverben)</h1>
        <p class="text-lg text-gray-600">können, müssen, wollen, möchten, dürfen, sollen</p>
      </header>

      <!-- Grammar Rule -->
      <div class="card mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Word Order Rule</h2>
        <p class="text-lg mb-4"><strong>{{ modalVerbsData.wordOrder.rule }}</strong></p>
        <div class="space-y-3">
          <div v-for="(example, index) in modalVerbsData.wordOrder.examples" :key="index" class="bg-violet-50 p-4 rounded-lg">
            <p class="font-semibold text-gray-900">{{ example.sentence }}</p>
            <p class="text-sm text-gray-600 mt-2">{{ example.breakdown.join(' → ') }}</p>
          </div>
        </div>
      </div>

      <!-- Conjugation Tables -->
      <div class="card mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Conjugation Tables</h2>
        <div class="grid md:grid-cols-2 gap-6">
          <div v-for="verb in modalVerbsData.verbs" :key="verb.infinitive" class="bg-white border-2 border-gray-200 rounded-lg p-6">
            <h3 class="text-xl font-bold text-violet-600 mb-2">{{ verb.infinitive }}</h3>
            <p class="text-sm text-gray-600 mb-4">{{ verb.meaning }} - {{ verb.usage }}</p>
            <table class="w-full text-sm">
              <tbody>
                <tr v-for="(conjugation, pronoun) in verb.conjugations" :key="pronoun" class="border-b last:border-0">
                  <td class="py-2 pr-4 font-semibold text-gray-700">{{ pronoun }}</td>
                  <td class="py-2 text-violet-600 font-bold">{{ conjugation }}</td>
                </tr>
              </tbody>
            </table>
            <div class="mt-4 space-y-1">
              <p v-for="(ex, i) in verb.examples" :key="i" class="text-sm text-gray-600 italic">→ {{ ex }}</p>
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
        <EmbeddedFlashcards :flashcards="modalVerbsData.flashcards" title="Modal Verbs Practice" />
      </div>

      <!-- Exercises -->
      <div v-if="showExercises" class="card">
        <MultipleChoiceExercise :exercises="modalVerbsData.exercises" title="Modal Verbs Exercises" />
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
