<script setup>
import { ref } from 'vue'
import MultipleChoiceExercise from '../components/MultipleChoiceExercise.vue'
import EmbeddedFlashcards from '../components/EmbeddedFlashcards.vue'
import wFragenData from '../data/wFragen.json'

const showExercises = ref(false)
const showFlashcards = ref(false)
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <header class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">{{ wFragenData.introduction.title }}</h1>
        <p class="text-lg text-gray-600">{{ wFragenData.introduction.description }}</p>
      </header>

      <!-- Location Questions (Wo/Wohin/Woher) -->
      <div class="card mb-8">
        <h2 class="text-2xl font-bold text-cyan-600 mb-4">{{ wFragenData.locationQuestions.name }}</h2>
        <p class="mb-4">{{ wFragenData.locationQuestions.description }}</p>
        <div class="bg-cyan-50 border-2 border-cyan-300 p-4 rounded-lg mb-6">
          <p class="font-bold text-center text-lg">{{ wFragenData.locationQuestions.rule }}</p>
        </div>
        <div class="grid md:grid-cols-3 gap-4">
          <div v-for="q in wFragenData.locationQuestions.questions" :key="q.word" class="border-2 border-cyan-200 p-4 rounded-lg">
            <h3 class="text-2xl font-bold text-cyan-600 mb-1">{{ q.word }}</h3>
            <p class="text-sm text-gray-600 mb-1">{{ q.meaning }}</p>
            <p class="text-xs font-semibold mb-3" :class="q.case === 'Akkusativ' ? 'text-red-600' : 'text-green-600'">
              → {{ q.case }}
            </p>
            <p class="text-xs text-gray-500 mb-3">{{ q.usage }}</p>
            <div class="space-y-2">
              <div v-for="(ex, i) in q.examples" :key="i" class="bg-gray-50 p-2 rounded text-xs">
                <p class="font-semibold text-cyan-700">{{ ex.question }}</p>
                <p class="italic text-gray-600">{{ ex.answer }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Basic W-Questions -->
      <div class="card mb-8">
        <h2 class="text-2xl font-bold text-blue-600 mb-4">{{ wFragenData.basicQuestions.name }}</h2>
        <p class="mb-6">{{ wFragenData.basicQuestions.description }}</p>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="q in wFragenData.basicQuestions.questions" :key="q.word" class="border-2 border-blue-200 p-4 rounded-lg">
            <h3 class="text-xl font-bold text-blue-600 mb-1">{{ q.word }}</h3>
            <p class="text-sm text-gray-600 mb-1">{{ q.meaning }}</p>
            <p v-if="q.case" class="text-xs font-semibold mb-2" :class="{
              'text-blue-600': q.case === 'Nominativ',
              'text-red-600': q.case === 'Akkusativ',
              'text-green-600': q.case === 'Dativ',
              'text-orange-600': q.case === 'Genitiv'
            }">
              → {{ q.case }}
            </p>
            <p class="text-xs text-gray-500 mb-3">{{ q.usage }}</p>
            <div class="space-y-2">
              <div v-for="(ex, i) in q.examples" :key="i" class="bg-gray-50 p-2 rounded text-xs">
                <p class="font-semibold text-blue-700">{{ ex.question }}</p>
                <p class="italic text-gray-600">{{ ex.answer }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Time and Manner Questions -->
      <div class="card mb-8">
        <h2 class="text-2xl font-bold text-purple-600 mb-4">{{ wFragenData.timeQuestions.name }}</h2>
        <p class="mb-6">{{ wFragenData.timeQuestions.description }}</p>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="q in wFragenData.timeQuestions.questions" :key="q.word" class="border-2 border-purple-200 p-4 rounded-lg">
            <h3 class="text-xl font-bold text-purple-600 mb-1">{{ q.word }}</h3>
            <p class="text-sm text-gray-600 mb-1">{{ q.meaning }}</p>
            <p class="text-xs text-gray-500 mb-3">{{ q.usage }}</p>
            <div class="space-y-2">
              <div v-for="(ex, i) in q.examples" :key="i" class="bg-gray-50 p-2 rounded text-xs">
                <p class="font-semibold text-purple-700">{{ ex.question }}</p>
                <p class="italic text-gray-600">{{ ex.answer }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Wo-Compounds -->
      <div class="card mb-8">
        <h2 class="text-2xl font-bold text-teal-600 mb-4">{{ wFragenData.woCompounds.name }}</h2>
        <p class="mb-4">{{ wFragenData.woCompounds.description }}</p>
        <div class="bg-teal-50 border-2 border-teal-300 p-4 rounded-lg mb-6">
          <p class="font-bold text-center">{{ wFragenData.woCompounds.rule }}</p>
        </div>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="q in wFragenData.woCompounds.questions" :key="q.word" class="border-2 border-teal-200 p-4 rounded-lg">
            <h3 class="text-xl font-bold text-teal-600 mb-1">{{ q.word }}</h3>
            <p class="text-sm text-gray-600 mb-1">{{ q.meaning }}</p>
            <p class="text-xs text-teal-500 mb-3">wo(r) + {{ q.preposition }}</p>
            <div class="space-y-2">
              <div v-for="(ex, i) in q.examples" :key="i" class="bg-gray-50 p-2 rounded text-xs">
                <p class="font-semibold text-teal-700">{{ ex.question }}</p>
                <p class="italic text-gray-600">{{ ex.answer }}</p>
              </div>
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
        <EmbeddedFlashcards :flashcards="wFragenData.flashcards" title="W-Fragen Practice" />
      </div>

      <!-- Exercises -->
      <div v-if="showExercises" class="card">
        <MultipleChoiceExercise :exercises="wFragenData.exercises" title="W-Fragen Exercises" />
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
