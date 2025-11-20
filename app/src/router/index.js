import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import TablesView from '../views/TablesView.vue'
import FlashcardsView from '../views/FlashcardsView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: { title: 'German Declension Learning App' }
  },
  {
    path: '/tables',
    name: 'Tables',
    component: TablesView,
    meta: { title: 'Declension Tables' }
  },
  {
    path: '/flashcards',
    name: 'Flashcards',
    component: FlashcardsView,
    meta: { title: 'Practice Flashcards' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Update document title on route change
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'German Declension Learning App'
  next()
})

export default router
