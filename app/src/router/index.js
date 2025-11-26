import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import TablesView from '../views/TablesView.vue'
import FlashcardsView from '../views/FlashcardsView.vue'
import ModalVerbsView from '../views/ModalVerbsView.vue'
import SentenceStructureView from '../views/SentenceStructureView.vue'
import VerbConjugationView from '../views/VerbConjugationView.vue'
import PastTenseView from '../views/PastTenseView.vue'
import PrepositionsView from '../views/PrepositionsView.vue'
import WerdenView from '../views/WerdenView.vue'
import WFragenView from '../views/WFragenView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: { title: 'German A2 Grammar Learning App' }
  },
  {
    path: '/tables',
    name: 'Tables',
    component: TablesView,
    meta: { title: 'Declension Tables' }
  },
  {
    path: '/modal-verbs',
    name: 'ModalVerbs',
    component: ModalVerbsView,
    meta: { title: 'Modal Verbs' }
  },
  {
    path: '/sentence-structure',
    name: 'SentenceStructure',
    component: SentenceStructureView,
    meta: { title: 'Sentence Structure' }
  },
  {
    path: '/verb-conjugation',
    name: 'VerbConjugation',
    component: VerbConjugationView,
    meta: { title: 'Verb Conjugation' }
  },
  {
    path: '/past-tense',
    name: 'PastTense',
    component: PastTenseView,
    meta: { title: 'Past Tense (Perfekt)' }
  },
  {
    path: '/prepositions',
    name: 'Prepositions',
    component: PrepositionsView,
    meta: { title: 'Prepositions' }
  },
  {
    path: '/werden',
    name: 'Werden',
    component: WerdenView,
    meta: { title: 'Werden - Future Tense & Passive Voice' }
  },
  {
    path: '/w-fragen',
    name: 'WFragen',
    component: WFragenView,
    meta: { title: 'W-Fragen (Question Words)' }
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
