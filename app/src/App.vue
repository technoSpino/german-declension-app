<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import KaskadeHeader from './components/kaskade/KaskadeHeader.vue'

const route = useRoute()
// The original grammar pages ("Nachschlagen") keep their own light design.
const LEGACY = ['/nachschlagen', '/tables', '/modal-verbs', '/sentence-structure', '/verb-conjugation', '/past-tense', '/prepositions', '/werden', '/flashcards', '/exercises']
const legacy = computed(() => LEGACY.includes(route.path))
</script>

<template>
  <div class="k-app">
    <KaskadeHeader />
    <div :class="{ 'k-legacy': legacy }">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
