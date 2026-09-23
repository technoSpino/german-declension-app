<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { buildBlitzPool, shuffle } from '../data/exercises.js'

const props = defineProps({
  duration: { type: Number, default: 60 },
  highScore: { type: Number, default: 0 }
})

const emit = defineEmits(['answer', 'finished', 'exit'])

const WRONG_PAUSE_MS = 1400

const state = ref('ready') // ready | running | paused | done
const timeLeft = ref(props.duration)
const queue = ref([])
const position = ref(0)
const score = ref(0)
const streak = ref(0)
const bestStreak = ref(0)
const answeredCount = ref(0)
const correctCount = ref(0)
const flash = ref(null) // { correct, points, explanation }

let timer = null
let pauseTimer = null

const current = computed(() => queue.value[position.value] || null)
const multiplier = computed(() => 1 + Math.floor(streak.value / 5))
const accuracy = computed(() => (answeredCount.value ? Math.round((correctCount.value / answeredCount.value) * 100) : 0))
const timePercent = computed(() => Math.round((timeLeft.value / props.duration) * 100))

function start() {
  queue.value = shuffle(buildBlitzPool())
  position.value = 0
  score.value = 0
  streak.value = 0
  bestStreak.value = 0
  answeredCount.value = 0
  correctCount.value = 0
  flash.value = null
  timeLeft.value = props.duration
  state.value = 'running'
  timer = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) stop()
  }, 1000)
}

function stop() {
  clearInterval(timer)
  clearTimeout(pauseTimer)
  timer = null
  state.value = 'done'
  emit('finished', {
    score: score.value,
    bestStreak: bestStreak.value,
    correct: correctCount.value,
    total: answeredCount.value
  })
}

function advance() {
  flash.value = null
  position.value++
  if (position.value >= queue.value.length) {
    queue.value = shuffle(queue.value)
    position.value = 0
  }
  if (state.value === 'paused') state.value = 'running'
}

function answer(kase) {
  if (state.value !== 'running' || !current.value) return
  const correct = current.value.answer === kase
  answeredCount.value++
  emit('answer', { exerciseId: current.value.id, correct })

  if (correct) {
    correctCount.value++
    streak.value++
    bestStreak.value = Math.max(bestStreak.value, streak.value)
    const points = 10 * multiplier.value
    score.value += points
    flash.value = { correct: true, points }
    // Keep the pace up: move on almost immediately.
    pauseTimer = setTimeout(advance, 250)
  } else {
    streak.value = 0
    flash.value = { correct: false, answer: current.value.answer, explanation: current.value.explanation }
    state.value = 'paused'
    pauseTimer = setTimeout(advance, WRONG_PAUSE_MS)
  }
}

function onKeydown(event) {
  if (state.value === 'ready' && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault()
    start()
    return
  }
  if (state.value !== 'running') return
  const key = event.key.toLowerCase()
  if (key === 'd' || key === '1') answer('dativ')
  if (key === 'a' || key === '2') answer('akkusativ')
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  clearInterval(timer)
  clearTimeout(pauseTimer)
})
</script>

<template>
  <section class="blitz">
    <div class="blitz-header">
      <button class="link-button" @click="emit('exit')">← Drills</button>
      <div class="blitz-title">⚡ Blitz: Dativ oder Akkusativ?</div>
      <div class="blitz-high">Best: {{ Math.max(highScore, score) }}</div>
    </div>

    <!-- Ready -->
    <div v-if="state === 'ready'" class="panel panel-center">
      <h2 class="panel-title">{{ duration }} seconds. As many as you can.</h2>
      <p class="panel-text">
        A sentence appears with its preposition phrase. Decide whether the highlighted case is
        <span class="inline-badge badge-dativ">Dativ</span> or
        <span class="inline-badge badge-akkusativ">Akkusativ</span>.
        Every 5 in a row raises the multiplier. A wrong answer resets the streak and costs you a second and a half.
      </p>
      <p class="panel-keys"><kbd>D</kbd> Dativ · <kbd>A</kbd> Akkusativ · <kbd>Enter</kbd> start</p>
      <button class="primary-button" @click="start">Start</button>
    </div>

    <!-- Running / paused -->
    <div v-else-if="state !== 'done'" class="panel">
      <div class="status-row">
        <div class="stat">
          <div class="stat-value">{{ score }}</div>
          <div class="stat-label">Score</div>
        </div>
        <div class="stat">
          <div class="stat-value" :class="{ 'stat-hot': streak >= 5 }">×{{ multiplier }}</div>
          <div class="stat-label">Multiplier</div>
        </div>
        <div class="stat">
          <div class="stat-value">{{ streak }}</div>
          <div class="stat-label">Streak</div>
        </div>
        <div class="stat">
          <div class="stat-value" :class="{ 'stat-danger': timeLeft <= 10 }">{{ timeLeft }}s</div>
          <div class="stat-label">Left</div>
        </div>
      </div>
      <div class="time-bar"><div class="time-fill" :class="{ 'time-danger': timeLeft <= 10 }" :style="{ width: timePercent + '%' }"></div></div>

      <div class="blitz-card" :class="{ 'flash-ok': flash?.correct === true, 'flash-bad': flash?.correct === false }">
        <p class="blitz-prompt">{{ current?.prompt }}</p>
        <p class="blitz-hint">{{ current?.hint }}</p>

        <div v-if="flash && !flash.correct" class="blitz-feedback">
          <strong>{{ flash.answer === 'dativ' ? 'Dativ' : 'Akkusativ' }}.</strong> {{ flash.explanation }}
        </div>
        <div v-else-if="flash && flash.correct" class="blitz-points">+{{ flash.points }}</div>
      </div>

      <div class="answer-row">
        <button class="case-button case-dativ" :disabled="state !== 'running'" @click="answer('dativ')">
          <span class="case-key">D</span> Dativ
        </button>
        <button class="case-button case-akkusativ" :disabled="state !== 'running'" @click="answer('akkusativ')">
          <span class="case-key">A</span> Akkusativ
        </button>
      </div>
    </div>

    <!-- Done -->
    <div v-else class="panel panel-center">
      <h2 class="panel-title">Time!</h2>
      <div class="result-grid">
        <div class="stat"><div class="stat-value">{{ score }}</div><div class="stat-label">Score</div></div>
        <div class="stat"><div class="stat-value">{{ bestStreak }}</div><div class="stat-label">Best streak</div></div>
        <div class="stat"><div class="stat-value">{{ correctCount }}/{{ answeredCount }}</div><div class="stat-label">Correct</div></div>
        <div class="stat"><div class="stat-value">{{ accuracy }}%</div><div class="stat-label">Accuracy</div></div>
      </div>
      <p v-if="score > highScore && score > 0" class="new-record">🏆 New high score!</p>
      <div class="button-row">
        <button class="primary-button" @click="start">Play again</button>
        <button class="ghost-button" @click="emit('exit')">Back to drills</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.blitz { max-width: 720px; margin: 0 auto; }

.blitz-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.blitz-title { font-weight: 700; color: #0f172a; text-align: center; flex: 1; }
.blitz-high { font-weight: 600; color: #475569; font-variant-numeric: tabular-nums; }

.link-button {
  background: none;
  border: none;
  color: #7c3aed;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 0;
}

.panel {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 10px 25px -5px rgb(0 0 0 / 0.1);
  border: 2px solid #e5e7eb;
}

.panel-center { text-align: center; }
.panel-title { font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom: 12px; }
.panel-text { color: #475569; line-height: 1.6; max-width: 520px; margin: 0 auto 12px; }
.panel-keys { color: #6b7280; font-size: 14px; margin-bottom: 20px; }

kbd {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-bottom-width: 2px;
  border-radius: 4px;
  padding: 1px 6px;
  font-size: 12px;
  font-family: ui-monospace, monospace;
}

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

.button-row { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-top: 20px; }

.status-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 10px;
}

.stat { text-align: center; }
.stat-value { font-size: 26px; font-weight: 800; color: #0f172a; font-variant-numeric: tabular-nums; }
.stat-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; color: #6b7280; font-weight: 600; }
.stat-hot { color: #ea580c; }
.stat-danger { color: #dc2626; }

.time-bar { height: 6px; background: #e5e7eb; border-radius: 999px; overflow: hidden; margin-bottom: 20px; }
.time-fill { height: 100%; background: #7c3aed; transition: width 1s linear; }
.time-danger { background: #dc2626; }

.blitz-card {
  border-radius: 12px;
  padding: 28px 20px;
  background: #f8fafc;
  border: 2px solid #e5e7eb;
  min-height: 160px;
  text-align: center;
  transition: background 0.15s, border-color 0.15s;
}

.flash-ok { background: #f0fdf4; border-color: #86efac; }
.flash-bad { background: #fef2f2; border-color: #fca5a5; }

.blitz-prompt { font-size: 24px; font-weight: 700; color: #0f172a; line-height: 1.4; }
.blitz-hint { color: #6b7280; font-style: italic; margin-top: 6px; }
.blitz-feedback { margin-top: 12px; color: #991b1b; font-size: 15px; line-height: 1.5; }
.blitz-points { margin-top: 12px; color: #15803d; font-weight: 800; font-size: 22px; }

.answer-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 16px; }

.case-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 18px;
  font-size: 20px;
  font-weight: 800;
  border-radius: 12px;
  border: 3px solid;
  cursor: pointer;
  min-height: 64px;
  transition: transform 0.1s, filter 0.1s;
}

.case-button:active:not(:disabled) { transform: scale(0.97); }
.case-button:disabled { opacity: 0.6; cursor: not-allowed; }
.case-button:focus-visible { outline: 3px solid #0f172a; outline-offset: 2px; }
.case-dativ { background: #E8F5E9; border-color: #4CAF50; color: #1b5e20; }
.case-dativ:hover:not(:disabled) { filter: brightness(0.96); }
.case-akkusativ { background: #FFEBEE; border-color: #F44336; color: #b71c1c; }
.case-akkusativ:hover:not(:disabled) { filter: brightness(0.96); }

.case-key {
  font-size: 12px;
  border: 1px solid currentColor;
  border-radius: 6px;
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
}

.inline-badge { padding: 2px 8px; border-radius: 999px; font-weight: 700; font-size: 13px; }
.badge-dativ { background: #E8F5E9; color: #2E7D32; }
.badge-akkusativ { background: #FFEBEE; color: #C62828; }

.result-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin: 20px 0; }
.new-record { color: #b45309; font-weight: 800; font-size: 18px; }

@media (max-width: 480px) {
  .panel { padding: 18px 14px; }
  .blitz-prompt { font-size: 20px; }
  .status-row { grid-template-columns: repeat(4, 1fr); gap: 4px; }
  .stat-value { font-size: 20px; }
  .case-button { font-size: 17px; padding: 14px 8px; }
}
</style>
