<script setup>
import { computed } from 'vue'
import { useProgressStore } from '../stores/progressStore'

const progressStore = useProgressStore()

const hasProgress = computed(() => progressStore.totalInteractions > 0)
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <div class="relative overflow-hidden bg-gradient-to-br from-violet-600 to-violet-700 text-white">
      <div class="absolute inset-0 opacity-5">
        <div class="absolute inset-0" style="background-image: radial-gradient(circle, white 1px, transparent 1px); background-size: 24px 24px;"></div>
      </div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div class="text-center">
          <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Master German Grammar
          </h1>
          <p class="text-lg sm:text-xl text-violet-100 mb-8 max-w-2xl mx-auto">
            Complete A2-level platform with interactive exercises and smart flashcards
          </p>

          <!-- Primary CTAs -->
          <div class="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <router-link
              to="/tables"
              class="w-full sm:w-auto px-6 py-3 bg-white text-violet-700 rounded-lg font-semibold shadow-lg hover:shadow-xl hover:bg-violet-50 transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-violet-600"
            >
              Study Tables
            </router-link>
            <router-link
              to="/flashcards"
              class="w-full sm:w-auto px-6 py-3 bg-violet-800 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl hover:bg-violet-900 transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-violet-600"
            >
              Practice Flashcards
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Progress Summary Widget -->
    <div v-if="hasProgress" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
      <div class="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-gray-100">
        <h2 class="text-xl font-bold text-gray-900 mb-6 text-center">
          Your Progress
        </h2>

        <div class="space-y-6">
          <!-- Main stats grid -->
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Cards Studied -->
            <div class="bg-violet-50 rounded-lg p-4 text-center border border-violet-100">
              <div class="text-3xl font-bold text-violet-700 mb-1">
                {{ progressStore.cardsStudied }}
              </div>
              <div class="text-xs font-medium text-violet-600">Cards Studied</div>
            </div>

            <!-- Cards Mastered -->
            <div class="bg-green-50 rounded-lg p-4 text-center border border-green-100">
              <div class="text-3xl font-bold text-green-700 mb-1">
                {{ progressStore.cardsMastered }}
              </div>
              <div class="text-xs font-medium text-green-600">Mastered</div>
            </div>

            <!-- Table Interactions -->
            <div class="bg-blue-50 rounded-lg p-4 text-center border border-blue-100">
              <div class="text-3xl font-bold text-blue-700 mb-1">
                {{ progressStore.tableInteractions }}
              </div>
              <div class="text-xs font-medium text-blue-600">Table Clicks</div>
            </div>

            <!-- Streak -->
            <div class="bg-orange-50 rounded-lg p-4 text-center border border-orange-100">
              <div class="text-3xl font-bold text-orange-700 mb-1">
                {{ progressStore.currentStreak }}
              </div>
              <div class="text-xs font-medium text-orange-600">{{ progressStore.streakText }}</div>
            </div>
          </div>

          <!-- Mastery Progress Bar -->
          <div v-if="progressStore.cardsStudied > 0" class="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-semibold text-gray-700">Overall Mastery</span>
              <span class="text-lg font-bold text-violet-700">{{ progressStore.masteryPercentage }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div
                class="bg-violet-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                :style="{ width: `${progressStore.masteryPercentage}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Topics Grid Section -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <h2 class="text-2xl font-bold text-gray-900 text-center mb-8">Explore Topics</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- Declensions -->
        <router-link to="/tables" class="group bg-white rounded-lg shadow-sm hover:shadow-md p-5 border border-gray-200 hover:border-violet-300 transition-all">
          <div class="flex items-start gap-3">
            <div class="text-3xl">📊</div>
            <div class="flex-1">
              <h3 class="text-lg font-bold text-gray-900 mb-1 group-hover:text-violet-700 transition-colors">Declensions</h3>
              <p class="text-gray-600 text-sm mb-2">Master articles and adjective endings</p>
              <span class="text-violet-600 font-semibold text-xs">Learn more →</span>
            </div>
          </div>
        </router-link>

        <!-- Modal Verbs -->
        <router-link to="/modal-verbs" class="group bg-white rounded-lg shadow-sm hover:shadow-md p-5 border border-gray-200 hover:border-blue-300 transition-all">
          <div class="flex items-start gap-3">
            <div class="text-3xl">🔧</div>
            <div class="flex-1">
              <h3 class="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-700 transition-colors">Modal Verbs</h3>
              <p class="text-gray-600 text-sm mb-2">können, müssen, wollen, and more</p>
              <span class="text-blue-600 font-semibold text-xs">Learn more →</span>
            </div>
          </div>
        </router-link>

        <!-- Sentence Structure -->
        <router-link to="/sentence-structure" class="group bg-white rounded-lg shadow-sm hover:shadow-md p-5 border border-gray-200 hover:border-red-300 transition-all">
          <div class="flex items-start gap-3">
            <div class="text-3xl">🏗️</div>
            <div class="flex-1">
              <h3 class="text-lg font-bold text-gray-900 mb-1 group-hover:text-red-700 transition-colors">Sentence Structure</h3>
              <p class="text-gray-600 text-sm mb-2">Hauptsatz and Nebensatz word order</p>
              <span class="text-red-600 font-semibold text-xs">Learn more →</span>
            </div>
          </div>
        </router-link>

        <!-- Verb Conjugation -->
        <router-link to="/verb-conjugation" class="group bg-white rounded-lg shadow-sm hover:shadow-md p-5 border border-gray-200 hover:border-green-300 transition-all">
          <div class="flex items-start gap-3">
            <div class="text-3xl">🔄</div>
            <div class="flex-1">
              <h3 class="text-lg font-bold text-gray-900 mb-1 group-hover:text-green-700 transition-colors">Verb Conjugation</h3>
              <p class="text-gray-600 text-sm mb-2">Regular, irregular, and separable verbs</p>
              <span class="text-green-600 font-semibold text-xs">Learn more →</span>
            </div>
          </div>
        </router-link>

        <!-- Past Tense -->
        <router-link to="/past-tense" class="group bg-white rounded-lg shadow-sm hover:shadow-md p-5 border border-gray-200 hover:border-purple-300 transition-all">
          <div class="flex items-start gap-3">
            <div class="text-3xl">⏮️</div>
            <div class="flex-1">
              <h3 class="text-lg font-bold text-gray-900 mb-1 group-hover:text-purple-700 transition-colors">Past Tense</h3>
              <p class="text-gray-600 text-sm mb-2">Perfekt tense with haben/sein</p>
              <span class="text-purple-600 font-semibold text-xs">Learn more →</span>
            </div>
          </div>
        </router-link>

        <!-- Prepositions -->
        <router-link to="/prepositions" class="group bg-white rounded-lg shadow-sm hover:shadow-md p-5 border border-gray-200 hover:border-orange-300 transition-all">
          <div class="flex items-start gap-3">
            <div class="text-3xl">📍</div>
            <div class="flex-1">
              <h3 class="text-lg font-bold text-gray-900 mb-1 group-hover:text-orange-700 transition-colors">Prepositions</h3>
              <p class="text-gray-600 text-sm mb-2">Akkusativ, Dativ, and Two-Way cases</p>
              <span class="text-orange-600 font-semibold text-xs">Learn more →</span>
            </div>
          </div>
        </router-link>

        <!-- Werden -->
        <router-link to="/werden" class="group bg-white rounded-lg shadow-sm hover:shadow-md p-5 border border-gray-200 hover:border-pink-300 transition-all">
          <div class="flex items-start gap-3">
            <div class="text-3xl">🔮</div>
            <div class="flex-1">
              <h3 class="text-lg font-bold text-gray-900 mb-1 group-hover:text-pink-700 transition-colors">Werden</h3>
              <p class="text-gray-600 text-sm mb-2">Future tense and passive voice</p>
              <span class="text-pink-600 font-semibold text-xs">Learn more →</span>
            </div>
          </div>
        </router-link>

        <!-- W-Fragen -->
        <router-link to="/w-fragen" class="group bg-white rounded-lg shadow-sm hover:shadow-md p-5 border border-gray-200 hover:border-cyan-300 transition-all">
          <div class="flex items-start gap-3">
            <div class="text-3xl">❓</div>
            <div class="flex-1">
              <h3 class="text-lg font-bold text-gray-900 mb-1 group-hover:text-cyan-700 transition-colors">W-Fragen</h3>
              <p class="text-gray-600 text-sm mb-2">Question words: wo, wohin, woher, wann, warum</p>
              <span class="text-cyan-600 font-semibold text-xs">Learn more →</span>
            </div>
          </div>
        </router-link>

        <!-- Flashcards -->
        <router-link to="/flashcards" class="group bg-gradient-to-br from-violet-50 to-violet-100 rounded-lg shadow-sm hover:shadow-md p-5 border border-violet-200 hover:border-violet-400 transition-all md:col-span-2 lg:col-span-3">
          <div class="text-center">
            <div class="text-3xl mb-2">🎴</div>
            <h3 class="text-lg font-bold text-gray-900 mb-1 group-hover:text-violet-700 transition-colors">Practice Flashcards</h3>
            <p class="text-gray-700 text-sm mb-2">Spaced repetition system with 55+ cards covering all topics</p>
            <span class="text-violet-700 font-semibold text-xs">Start practicing →</span>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>
