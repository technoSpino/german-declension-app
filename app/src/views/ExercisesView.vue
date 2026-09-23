<script setup>
import { ref, computed } from 'vue'
import { DRILLS, exercises, cheatSheet, buildRound, shuffle } from '../data/exercises.js'
import { useExerciseStore } from '../stores/exerciseStore'
import { useProgressStore } from '../stores/progressStore'
import ExerciseRound from '../components/ExerciseRound.vue'
import BlitzMode from '../components/BlitzMode.vue'

const exerciseStore = useExerciseStore()
const progressStore = useProgressStore()

const mode = ref('menu') // menu | round | results | blitz
const activeDrill = ref(null)
const roundExercises = ref([])
const roundResults = ref([])
const showCheatSheet = ref(false)
const cheatTab = ref('cases')

const WEAK_DRILL = {
  id: 'weak',
  name: 'Weak spots',
  icon: '🩹',
  description: 'The items you have got wrong more often than right. Clears itself as you get them right.',
  roundSize: 10
}

const weakCount = computed(() => exerciseStore.weakExerciseIds.length)

const drillCards = computed(() => {
  const cards = DRILLS.map(d => ({ ...d, count: d.id === 'mixed' ? exercises.length : exercises.filter(e => e.drill === d.id).length }))
  if (weakCount.value > 0) cards.unshift({ ...WEAK_DRILL, count: weakCount.value })
  return cards
})

const roundScore = computed(() => roundResults.value.filter(r => r.correct).length)
const misses = computed(() => roundResults.value.filter(r => !r.correct))

function buildWeakRound() {
  const ids = new Set(exerciseStore.weakExerciseIds)
  return shuffle(exercises.filter(e => ids.has(e.id))).slice(0, WEAK_DRILL.roundSize)
}

function startDrill(drill) {
  activeDrill.value = drill
  roundExercises.value = drill.id === 'weak' ? buildWeakRound() : buildRound(drill.id, drill.roundSize)
  roundResults.value = []
  mode.value = 'round'
  window.scrollTo({ top: 0 })
}

function onAnswered({ exercise, correct }) {
  exerciseStore.recordAnswer(exercise.id, correct)
  progressStore.incrementExercisesAnswered()
}

function onFinished(results) {
  roundResults.value = results
  exerciseStore.recordRound(activeDrill.value.id, results.filter(r => r.correct).length, results.length)
  mode.value = 'results'
  window.scrollTo({ top: 0 })
}

function onBlitzAnswer({ exerciseId, correct }) {
  exerciseStore.recordAnswer(exerciseId, correct)
  progressStore.incrementExercisesAnswered()
}

function onBlitzFinished({ score, bestStreak }) {
  exerciseStore.recordBlitz(score, bestStreak)
}

function backToMenu() {
  mode.value = 'menu'
  activeDrill.value = null
}

function bestLabel(drillId) {
  const best = exerciseStore.bestScoreFor(drillId)
  if (!best) return null
  return `${best.correct}/${best.total}`
}

function confirmReset() {
  if (window.confirm('Reset all exercise progress, best scores and the Blitz high score?')) {
    exerciseStore.resetProgress()
  }
}

const caseLabel = { dativ: 'Dativ', akkusativ: 'Akkusativ', nominativ: 'Nominativ', genitiv: 'Genitiv' }
</script>

<template>
  <div class="exercises-view">
    <header class="view-header">
      <h1 class="view-title">Skill Builder</h1>
      <p class="view-subtitle">
        Wo? Wohin? · Prepositions · Adjective endings · Nebensätze · zu + Infinitiv
      </p>
    </header>

    <!-- Menu -->
    <div v-if="mode === 'menu'" class="menu">
      <!-- Stats strip -->
      <div class="stats-strip" v-if="exerciseStore.totalAnswered > 0">
        <div class="stat"><div class="stat-value">{{ exerciseStore.totalAnswered }}</div><div class="stat-label">Answered</div></div>
        <div class="stat"><div class="stat-value">{{ exerciseStore.accuracy }}%</div><div class="stat-label">Accuracy</div></div>
        <div class="stat"><div class="stat-value">{{ exerciseStore.blitz.highScore }}</div><div class="stat-label">Blitz best</div></div>
        <div class="stat"><div class="stat-value">{{ weakCount }}</div><div class="stat-label">Weak spots</div></div>
      </div>

      <!-- Cheat sheet -->
      <div class="cheat">
        <button class="cheat-toggle" :aria-expanded="showCheatSheet" @click="showCheatSheet = !showCheatSheet">
          📖 Cheat sheet <span class="cheat-caret">{{ showCheatSheet ? '▲' : '▼' }}</span>
        </button>
        <div v-if="showCheatSheet" class="cheat-body">
          <div class="cheat-tabs" role="tablist">
            <button
              v-for="tab in [['cases', 'Wo / Wohin'], ['preps', 'Prepositions'], ['nebensatz', 'Nebensatz'], ['zu', 'zu + Infinitiv']]"
              :key="tab[0]"
              role="tab"
              class="cheat-tab"
              :class="{ active: cheatTab === tab[0] }"
              :aria-selected="cheatTab === tab[0]"
              @click="cheatTab = tab[0]"
            >
              {{ tab[1] }}
            </button>
          </div>

          <div v-if="cheatTab === 'cases'" class="cheat-grid">
            <div v-for="q in cheatSheet.questions" :key="q.word" class="cheat-card" :class="'edge-' + q.kase">
              <div class="cheat-card-title">{{ q.word }} <span class="case-pill" :class="'pill-' + q.kase">{{ caseLabel[q.kase] }}</span></div>
              <div class="cheat-card-sub">{{ q.meaning }}</div>
              <div class="cheat-card-example">{{ q.example }}</div>
            </div>
            <div class="cheat-card cheat-wide">
              <div class="cheat-card-title">Position verbs vs movement verbs</div>
              <table class="verb-table">
                <thead><tr><th class="th-dativ">Wo? → Dativ</th><th class="th-akk">Wohin? → Akkusativ</th></tr></thead>
                <tbody>
                  <tr v-for="pair in cheatSheet.verbPairs" :key="pair.position">
                    <td>{{ pair.position }}</td><td>{{ pair.movement }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-else-if="cheatTab === 'preps'" class="cheat-grid">
            <div class="cheat-card edge-mixed">
              <div class="cheat-card-title">Two-way (Wechselpräpositionen)</div>
              <div class="word-row"><span v-for="w in cheatSheet.twoWay" :key="w" class="word">{{ w }}</span></div>
              <div class="cheat-card-sub">Wo? → Dativ · Wohin? → Akkusativ</div>
            </div>
            <div class="cheat-card edge-dativ">
              <div class="cheat-card-title">Always Dativ</div>
              <div class="word-row"><span v-for="w in cheatSheet.dativOnly" :key="w" class="word">{{ w }}</span></div>
            </div>
            <div class="cheat-card edge-akkusativ">
              <div class="cheat-card-title">Always Akkusativ</div>
              <div class="word-row"><span v-for="w in cheatSheet.akkusativOnly" :key="w" class="word">{{ w }}</span></div>
            </div>
            <div class="cheat-card cheat-wide">
              <div class="cheat-card-title">Contractions</div>
              <div class="word-row">
                <span v-for="c in cheatSheet.contractions" :key="c.short" class="word" :class="'word-' + c.kase">
                  <strong>{{ c.short }}</strong> = {{ c.long }}
                </span>
              </div>
            </div>
          </div>

          <div v-else-if="cheatTab === 'nebensatz'" class="cheat-grid">
            <div class="cheat-card">
              <div class="cheat-card-title">Conjunctions</div>
              <div class="word-row">
                <span v-for="c in cheatSheet.nebensatz.conjunctions" :key="c.word" class="word"><strong>{{ c.word }}</strong> {{ c.meaning }}</span>
              </div>
            </div>
            <div class="cheat-card cheat-wide">
              <div class="cheat-card-title">Rules</div>
              <ul class="rule-list"><li v-for="r in cheatSheet.nebensatz.rules" :key="r">{{ r }}</li></ul>
            </div>
          </div>

          <div v-else class="cheat-grid">
            <div class="cheat-card edge-dativ">
              <div class="cheat-card-title">With zu</div>
              <ul class="rule-list"><li v-for="r in cheatSheet.zuInfinitiv.withZu" :key="r">{{ r }}</li></ul>
            </div>
            <div class="cheat-card edge-akkusativ">
              <div class="cheat-card-title">Without zu</div>
              <ul class="rule-list"><li v-for="r in cheatSheet.zuInfinitiv.withoutZu" :key="r">{{ r }}</li></ul>
            </div>
            <div class="cheat-card cheat-wide">
              <div class="cheat-card-title">Separable verbs</div>
              <div class="cheat-card-sub">{{ cheatSheet.zuInfinitiv.separable }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Blitz card -->
      <button class="blitz-card" @click="mode = 'blitz'">
        <div class="blitz-icon">⚡</div>
        <div class="blitz-text">
          <div class="blitz-title">Blitz mode</div>
          <div class="blitz-desc">60 seconds. Dativ or Akkusativ? Build a streak for a score multiplier.</div>
        </div>
        <div class="blitz-best" v-if="exerciseStore.blitz.highScore > 0">Best {{ exerciseStore.blitz.highScore }}</div>
      </button>

      <!-- Drill cards -->
      <h2 class="section-title">Drills</h2>
      <div class="drill-grid">
        <button
          v-for="drill in drillCards"
          :key="drill.id"
          class="drill-card"
          :class="{ 'drill-weak': drill.id === 'weak' }"
          @click="startDrill(drill)"
        >
          <div class="drill-top">
            <span class="drill-icon">{{ drill.icon }}</span>
            <span class="drill-best" v-if="bestLabel(drill.id)">Best {{ bestLabel(drill.id) }}</span>
          </div>
          <div class="drill-name">{{ drill.name }}</div>
          <p class="drill-desc">{{ drill.description }}</p>
          <div class="drill-meta">{{ drill.roundSize }} per round · {{ drill.count }} items</div>
        </button>
      </div>

      <div class="menu-footer" v-if="exerciseStore.totalAnswered > 0">
        <button class="reset-button" @click="confirmReset">Reset exercise progress</button>
      </div>
    </div>

    <!-- Round -->
    <ExerciseRound
      v-else-if="mode === 'round'"
      :exercises="roundExercises"
      :title="activeDrill.icon + ' ' + activeDrill.name"
      @answered="onAnswered"
      @finished="onFinished"
      @exit="backToMenu"
    />

    <!-- Results -->
    <div v-else-if="mode === 'results'" class="results">
      <div class="results-card">
        <div class="results-icon">{{ roundScore === roundResults.length ? '🏆' : roundScore >= roundResults.length * 0.7 ? '👍' : '💪' }}</div>
        <h2 class="results-title">{{ roundScore }} / {{ roundResults.length }}</h2>
        <p class="results-sub">
          {{ activeDrill.name }} ·
          <span v-if="bestLabel(activeDrill.id)">best {{ bestLabel(activeDrill.id) }}</span>
        </p>
        <div class="button-row">
          <button class="primary-button" @click="startDrill(activeDrill)">Another round</button>
          <button class="ghost-button" @click="backToMenu">Back to drills</button>
        </div>
      </div>

      <div v-if="misses.length" class="misses">
        <h3 class="misses-title">Review your misses</h3>
        <div v-for="miss in misses" :key="miss.exercise.id" class="miss" :class="miss.exercise.case ? 'edge-' + miss.exercise.case : ''">
          <div class="miss-prompt">{{ miss.exercise.type === 'order' ? miss.exercise.answers[0] : miss.exercise.prompt }}</div>
          <div class="miss-answers">
            <span class="miss-bad">You: {{ miss.given || '—' }}</span>
            <span class="miss-good">Correct: {{ miss.exercise.answers[0] }}</span>
          </div>
          <div class="miss-explanation">{{ miss.exercise.explanation }}</div>
        </div>
      </div>
      <div v-else class="perfect">Perfect round. No misses to review.</div>
    </div>

    <!-- Blitz -->
    <BlitzMode
      v-else
      :high-score="exerciseStore.blitz.highScore"
      @answer="onBlitzAnswer"
      @finished="onBlitzFinished"
      @exit="backToMenu"
    />
  </div>
</template>

<style scoped>
.exercises-view {
  min-height: 100vh;
  padding: 32px 16px 64px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.view-header { text-align: center; max-width: 720px; margin: 0 auto 24px; }
.view-title { font-size: 34px; font-weight: 800; color: #0f172a; letter-spacing: -0.02em; }
.view-subtitle { color: #64748b; margin-top: 6px; }

.menu { max-width: 900px; margin: 0 auto; }

.stats-strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  background: white;
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.08);
  margin-bottom: 16px;
}

.stat { text-align: center; }
.stat-value { font-size: 24px; font-weight: 800; color: #7c3aed; }
.stat-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; color: #6b7280; font-weight: 600; }

.cheat { background: white; border-radius: 14px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.08); margin-bottom: 16px; }

.cheat-toggle {
  width: 100%;
  text-align: left;
  padding: 16px 20px;
  font-weight: 700;
  font-size: 16px;
  background: none;
  border: none;
  cursor: pointer;
  color: #0f172a;
  display: flex;
  justify-content: space-between;
  min-height: 44px;
}

.cheat-caret { color: #9ca3af; font-size: 12px; }
.cheat-body { padding: 0 20px 20px; }

.cheat-tabs { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px; }

.cheat-tab {
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid #d1d5db;
  background: white;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  color: #475569;
}

.cheat-tab.active { background: #7c3aed; color: white; border-color: #7c3aed; }

.cheat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
.cheat-wide { grid-column: 1 / -1; }

.cheat-card {
  background: #f8fafc;
  border-radius: 10px;
  padding: 14px;
  border-left: 4px solid #cbd5e1;
}

.edge-dativ { border-left-color: #4CAF50; }
.edge-akkusativ { border-left-color: #F44336; }
.edge-mixed { border-left-color: #7c3aed; }
.edge-nominativ { border-left-color: #2196F3; }
.edge-genitiv { border-left-color: #FF9800; }

.cheat-card-title { font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.cheat-card-sub { color: #64748b; font-size: 14px; margin-top: 4px; }
.cheat-card-example { margin-top: 8px; font-style: italic; color: #334155; }

.case-pill { font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 999px; text-transform: uppercase; }
.pill-dativ { background: #E8F5E9; color: #2E7D32; }
.pill-akkusativ { background: #FFEBEE; color: #C62828; }

.word-row { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.word { background: white; border: 1px solid #e5e7eb; border-radius: 6px; padding: 4px 8px; font-size: 14px; }
.word-dativ { border-color: #4CAF50; }
.word-akkusativ { border-color: #F44336; }

.verb-table { width: 100%; margin-top: 8px; border-collapse: collapse; font-size: 14px; }
.verb-table th { text-align: left; padding: 6px 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
.th-dativ { background: #E8F5E9; color: #2E7D32; }
.th-akk { background: #FFEBEE; color: #C62828; }
.verb-table td { padding: 6px 8px; border-bottom: 1px solid #e5e7eb; }

.rule-list { margin-top: 8px; padding-left: 18px; color: #334155; font-size: 14px; line-height: 1.6; }

.blitz-card {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 16px;
  text-align: left;
  padding: 18px 20px;
  border-radius: 14px;
  border: none;
  background: linear-gradient(135deg, #7c3aed, #2563eb);
  color: white;
  cursor: pointer;
  box-shadow: 0 10px 20px -8px rgb(124 58 237 / 0.6);
  transition: transform 0.15s, box-shadow 0.15s;
  margin-bottom: 24px;
}

.blitz-card:hover { transform: translateY(-2px); box-shadow: 0 14px 24px -8px rgb(124 58 237 / 0.7); }
.blitz-card:focus-visible { outline: 3px solid #0f172a; outline-offset: 2px; }
.blitz-icon { font-size: 32px; }
.blitz-text { flex: 1; }
.blitz-title { font-weight: 800; font-size: 18px; }
.blitz-desc { font-size: 14px; opacity: 0.9; margin-top: 2px; }
.blitz-best { font-weight: 700; background: rgb(255 255 255 / 0.2); padding: 6px 12px; border-radius: 999px; white-space: nowrap; }

.section-title { font-size: 20px; font-weight: 800; color: #0f172a; margin-bottom: 12px; }

.drill-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; }

.drill-card {
  text-align: left;
  background: white;
  border-radius: 14px;
  padding: 18px;
  border: 2px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.drill-card:hover { border-color: #7c3aed; transform: translateY(-2px); box-shadow: 0 10px 20px -10px rgb(0 0 0 / 0.2); }
.drill-card:focus-visible { outline: 3px solid #7c3aed; outline-offset: 2px; }
.drill-weak { border-color: #fbbf24; background: #fffbeb; }
.drill-top { display: flex; justify-content: space-between; align-items: center; }
.drill-icon { font-size: 26px; }
.drill-best { font-size: 12px; font-weight: 700; color: #7c3aed; background: #f5f3ff; padding: 3px 8px; border-radius: 999px; }
.drill-name { font-weight: 800; font-size: 17px; color: #0f172a; }
.drill-desc { color: #64748b; font-size: 14px; line-height: 1.5; flex: 1; }
.drill-meta { font-size: 12px; color: #9ca3af; font-weight: 600; }

.menu-footer { text-align: center; margin-top: 28px; }
.reset-button { background: none; border: none; color: #9ca3af; font-size: 13px; cursor: pointer; text-decoration: underline; }
.reset-button:hover { color: #dc2626; }

.results { max-width: 720px; margin: 0 auto; }

.results-card {
  background: white;
  border-radius: 16px;
  padding: 32px 24px;
  text-align: center;
  box-shadow: 0 10px 25px -5px rgb(0 0 0 / 0.1);
}

.results-icon { font-size: 48px; }
.results-title { font-size: 40px; font-weight: 800; color: #0f172a; margin-top: 8px; }
.results-sub { color: #64748b; margin-top: 4px; }
.button-row { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-top: 20px; }

.primary-button,
.ghost-button {
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  min-height: 44px;
  border: 2px solid #7c3aed;
}

.primary-button { background: #7c3aed; color: white; }
.primary-button:hover { background: #6d28d9; }
.ghost-button { background: white; color: #7c3aed; }
.ghost-button:hover { background: #f5f3ff; }

.misses { margin-top: 24px; }
.misses-title { font-weight: 800; font-size: 18px; color: #0f172a; margin-bottom: 10px; }

.miss {
  background: white;
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 10px;
  border-left: 4px solid #cbd5e1;
  box-shadow: 0 2px 4px rgb(0 0 0 / 0.05);
}

.miss-prompt { font-weight: 600; color: #0f172a; }
.miss-answers { display: flex; gap: 16px; flex-wrap: wrap; margin-top: 6px; font-size: 14px; }
.miss-bad { color: #b91c1c; }
.miss-good { color: #15803d; font-weight: 700; }
.miss-explanation { margin-top: 6px; color: #475569; font-size: 14px; line-height: 1.5; }

.perfect { text-align: center; margin-top: 24px; color: #15803d; font-weight: 700; }

@media (max-width: 480px) {
  .view-title { font-size: 28px; }
  .stats-strip { grid-template-columns: repeat(2, 1fr); }
  .stat-value { font-size: 20px; }
  .blitz-card { flex-wrap: wrap; }
}
</style>
