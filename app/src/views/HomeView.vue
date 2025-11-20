<script setup>
import { computed } from 'vue'
import { useProgressStore } from '../stores/progressStore'

const progressStore = useProgressStore()

const hasProgress = computed(() => progressStore.totalInteractions > 0)
</script>

<template>
  <div class="min-h-screen">
    <!-- Hero Section -->
    <div class="relative overflow-hidden bg-gradient-to-br from-violet-600 via-violet-700 to-blue-600 text-white">
      <div class="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]"></div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <div class="text-center">
          <h1 class="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Master German Declensions
          </h1>
          <p class="text-xl sm:text-2xl text-violet-100 mb-4 max-w-3xl mx-auto">
            Learn and practice German noun declensions with color-coded tables and smart flashcards
          </p>
          <p class="text-lg text-violet-200 mb-12 max-w-2xl mx-auto">
            Build confidence in der, die, das and master all cases with our interactive learning tools
          </p>

          <!-- Primary CTAs -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <router-link
              to="/tables"
              class="w-full sm:w-auto px-8 py-4 bg-white text-violet-700 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl hover:bg-violet-50 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-violet-600"
            >
              Study Tables
            </router-link>
            <router-link
              to="/flashcards"
              class="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl hover:bg-blue-700 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-violet-600"
            >
              Practice Flashcards
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Progress Summary Widget -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
      <div class="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">
          {{ hasProgress ? 'Your Progress' : 'Start Your Journey' }}
        </h2>

        <div v-if="hasProgress" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Cards Studied -->
          <div class="bg-gradient-to-br from-violet-50 to-violet-100 rounded-xl p-6 text-center">
            <div class="text-4xl font-bold text-violet-700 mb-2">
              {{ progressStore.cardsStudied }}
            </div>
            <div class="text-sm font-medium text-violet-600">Cards Studied</div>
          </div>

          <!-- Cards Mastered -->
          <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-center">
            <div class="text-4xl font-bold text-blue-700 mb-2">
              {{ progressStore.cardsMastered }}
            </div>
            <div class="text-sm font-medium text-blue-600">Cards Mastered</div>
          </div>

          <!-- Table Interactions -->
          <div class="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6 text-center">
            <div class="text-4xl font-bold text-indigo-700 mb-2">
              {{ progressStore.tableInteractions }}
            </div>
            <div class="text-sm font-medium text-indigo-600">Table Clicks</div>
          </div>

          <!-- Streak -->
          <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 text-center">
            <div class="text-4xl font-bold text-purple-700 mb-2">
              {{ progressStore.currentStreak }}
            </div>
            <div class="text-sm font-medium text-purple-600">{{ progressStore.streakText }}</div>
          </div>

          <!-- Mastery Percentage -->
          <div v-if="progressStore.cardsStudied > 0" class="sm:col-span-2 lg:col-span-4 bg-gradient-to-r from-violet-50 to-blue-50 rounded-xl p-6">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-700">Overall Mastery</span>
              <span class="text-lg font-bold text-violet-700">{{ progressStore.masteryPercentage }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div
                class="bg-gradient-to-r from-violet-600 to-blue-600 h-3 rounded-full transition-all duration-500"
                :style="{ width: `${progressStore.masteryPercentage}%` }"
              ></div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-8">
          <svg class="w-24 h-24 mx-auto text-violet-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <p class="text-gray-600 text-lg mb-6">
            Begin your German declension journey today! Start with tables to learn the patterns, then practice with flashcards.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <router-link
              to="/tables"
              class="px-6 py-3 bg-violet-600 text-white rounded-lg font-semibold hover:bg-violet-700 transition-colors"
            >
              Explore Tables
            </router-link>
            <router-link
              to="/flashcards"
              class="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Try Flashcards
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <h2 class="text-3xl font-bold text-gray-900 text-center mb-12">Why Learn With Us?</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Color-Coded Tables Feature -->
        <div class="bg-white rounded-xl shadow-lg p-8 border-t-4 border-violet-600">
          <div class="flex items-center mb-4">
            <div class="bg-violet-100 rounded-lg p-3 mr-4">
              <svg class="w-8 h-8 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900">Color-Coded Tables</h3>
          </div>
          <p class="text-gray-600">
            Visual learning made easy. Our color-coded declension tables help you recognize patterns and memorize endings faster. Each gender and case has its own color for instant recognition.
          </p>
          <router-link
            to="/tables"
            class="inline-flex items-center mt-4 text-violet-600 font-semibold hover:text-violet-700"
          >
            View Tables
            <svg class="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </router-link>
        </div>

        <!-- Smart Flashcards Feature -->
        <div class="bg-white rounded-xl shadow-lg p-8 border-t-4 border-blue-600">
          <div class="flex items-center mb-4">
            <div class="bg-blue-100 rounded-lg p-3 mr-4">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900">Smart Flashcards</h3>
          </div>
          <p class="text-gray-600">
            Practice makes perfect. Our intelligent flashcard system adapts to your progress, focusing on the cases you need to review most. Track your mastery and build confidence.
          </p>
          <router-link
            to="/flashcards"
            class="inline-flex items-center mt-4 text-blue-600 font-semibold hover:text-blue-700"
          >
            Start Practicing
            <svg class="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bg-grid-white\/\[0\.05\] {
  background-image: linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
}
</style>
