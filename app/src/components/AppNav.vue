<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const mobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}
</script>

<template>
  <nav class="sticky top-0 z-50 bg-white shadow-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo / Title -->
        <router-link
          to="/"
          class="flex items-center space-x-2 text-xl font-bold text-violet-600 hover:text-violet-700 transition-colors"
          @click="closeMobileMenu"
        >
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span>German A2 Grammar</span>
        </router-link>

        <!-- Desktop Navigation -->
        <div class="hidden md:flex items-center space-x-1 overflow-x-auto">
          <router-link
            to="/"
            :class="[
              'px-3 py-2 rounded-lg font-medium transition-colors whitespace-nowrap text-sm',
              route.path === '/'
                ? 'bg-violet-600 text-white'
                : 'text-gray-700 hover:bg-violet-50 hover:text-violet-600'
            ]"
          >
            Home
          </router-link>
          <router-link
            to="/tables"
            :class="[
              'px-3 py-2 rounded-lg font-medium transition-colors whitespace-nowrap text-sm',
              route.path === '/tables'
                ? 'bg-violet-600 text-white'
                : 'text-gray-700 hover:bg-violet-50 hover:text-violet-600'
            ]"
          >
            Declensions
          </router-link>
          <router-link
            to="/modal-verbs"
            :class="[
              'px-3 py-2 rounded-lg font-medium transition-colors whitespace-nowrap text-sm',
              route.path === '/modal-verbs'
                ? 'bg-violet-600 text-white'
                : 'text-gray-700 hover:bg-violet-50 hover:text-violet-600'
            ]"
          >
            Modal Verbs
          </router-link>
          <router-link
            to="/sentence-structure"
            :class="[
              'px-3 py-2 rounded-lg font-medium transition-colors whitespace-nowrap text-sm',
              route.path === '/sentence-structure'
                ? 'bg-violet-600 text-white'
                : 'text-gray-700 hover:bg-violet-50 hover:text-violet-600'
            ]"
          >
            Sentences
          </router-link>
          <router-link
            to="/verb-conjugation"
            :class="[
              'px-3 py-2 rounded-lg font-medium transition-colors whitespace-nowrap text-sm',
              route.path === '/verb-conjugation'
                ? 'bg-violet-600 text-white'
                : 'text-gray-700 hover:bg-violet-50 hover:text-violet-600'
            ]"
          >
            Verbs
          </router-link>
          <router-link
            to="/past-tense"
            :class="[
              'px-3 py-2 rounded-lg font-medium transition-colors whitespace-nowrap text-sm',
              route.path === '/past-tense'
                ? 'bg-violet-600 text-white'
                : 'text-gray-700 hover:bg-violet-50 hover:text-violet-600'
            ]"
          >
            Past Tense
          </router-link>
          <router-link
            to="/prepositions"
            :class="[
              'px-3 py-2 rounded-lg font-medium transition-colors whitespace-nowrap text-sm',
              route.path === '/prepositions'
                ? 'bg-violet-600 text-white'
                : 'text-gray-700 hover:bg-violet-50 hover:text-violet-600'
            ]"
          >
            Prepositions
          </router-link>
          <router-link
            to="/werden"
            :class="[
              'px-3 py-2 rounded-lg font-medium transition-colors whitespace-nowrap text-sm',
              route.path === '/werden'
                ? 'bg-violet-600 text-white'
                : 'text-gray-700 hover:bg-violet-50 hover:text-violet-600'
            ]"
          >
            Werden
          </router-link>
          <router-link
            to="/flashcards"
            :class="[
              'px-3 py-2 rounded-lg font-medium transition-colors whitespace-nowrap text-sm',
              route.path === '/flashcards'
                ? 'bg-violet-600 text-white'
                : 'text-gray-700 hover:bg-violet-50 hover:text-violet-600'
            ]"
          >
            Flashcards
          </router-link>
        </div>

        <!-- Mobile Hamburger Button -->
        <button
          @click="toggleMobileMenu"
          class="md:hidden p-2 rounded-lg text-gray-700 hover:bg-violet-50 hover:text-violet-600 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-600"
          aria-label="Toggle mobile menu"
        >
          <svg
            v-if="!mobileMenuOpen"
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg
            v-else
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Mobile Menu -->
      <transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0 -translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-1"
      >
        <div v-if="mobileMenuOpen" class="md:hidden pb-4">
          <div class="flex flex-col space-y-2">
            <router-link
              to="/"
              @click="closeMobileMenu"
              :class="[
                'px-4 py-2 rounded-lg font-medium transition-colors',
                route.path === '/'
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-700 hover:bg-violet-50 hover:text-violet-600'
              ]"
            >
              Home
            </router-link>
            <router-link
              to="/tables"
              @click="closeMobileMenu"
              :class="[
                'px-4 py-2 rounded-lg font-medium transition-colors',
                route.path === '/tables'
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-700 hover:bg-violet-50 hover:text-violet-600'
              ]"
            >
              Declensions
            </router-link>
            <router-link
              to="/modal-verbs"
              @click="closeMobileMenu"
              :class="[
                'px-4 py-2 rounded-lg font-medium transition-colors',
                route.path === '/modal-verbs'
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-700 hover:bg-violet-50 hover:text-violet-600'
              ]"
            >
              Modal Verbs
            </router-link>
            <router-link
              to="/sentence-structure"
              @click="closeMobileMenu"
              :class="[
                'px-4 py-2 rounded-lg font-medium transition-colors',
                route.path === '/sentence-structure'
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-700 hover:bg-violet-50 hover:text-violet-600'
              ]"
            >
              Sentence Structure
            </router-link>
            <router-link
              to="/verb-conjugation"
              @click="closeMobileMenu"
              :class="[
                'px-4 py-2 rounded-lg font-medium transition-colors',
                route.path === '/verb-conjugation'
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-700 hover:bg-violet-50 hover:text-violet-600'
              ]"
            >
              Verb Conjugation
            </router-link>
            <router-link
              to="/past-tense"
              @click="closeMobileMenu"
              :class="[
                'px-4 py-2 rounded-lg font-medium transition-colors',
                route.path === '/past-tense'
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-700 hover:bg-violet-50 hover:text-violet-600'
              ]"
            >
              Past Tense (Perfekt)
            </router-link>
            <router-link
              to="/prepositions"
              @click="closeMobileMenu"
              :class="[
                'px-4 py-2 rounded-lg font-medium transition-colors',
                route.path === '/prepositions'
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-700 hover:bg-violet-50 hover:text-violet-600'
              ]"
            >
              Prepositions
            </router-link>
            <router-link
              to="/werden"
              @click="closeMobileMenu"
              :class="[
                'px-4 py-2 rounded-lg font-medium transition-colors',
                route.path === '/werden'
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-700 hover:bg-violet-50 hover:text-violet-600'
              ]"
            >
              Werden (Future & Passive)
            </router-link>
            <router-link
              to="/flashcards"
              @click="closeMobileMenu"
              :class="[
                'px-4 py-2 rounded-lg font-medium transition-colors',
                route.path === '/flashcards'
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-700 hover:bg-violet-50 hover:text-violet-600'
              ]"
            >
              Flashcards
            </router-link>
          </div>
        </div>
      </transition>
    </div>
  </nav>
</template>

<style scoped>
/* Additional styles if needed */
</style>
