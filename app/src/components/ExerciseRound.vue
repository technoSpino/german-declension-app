<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { isCorrect, isOrderCorrect, shuffle } from '../data/exercises.js'

const props = defineProps({
  exercises: { type: Array, required: true },
  title: { type: String, default: 'Practice' }
})

const emit = defineEmits(['answered', 'finished', 'exit'])

const index = ref(0)
const typed = ref('')
const chips = ref([]) // order type: [{ text, key, used }]
const picked = ref([]) // order type: keys in chosen order
const answered = ref(false)
const wasCorrect = ref(false)
const results = ref([])
const inputEl = ref(null)

const current = computed(() => props.exercises[index.value] || null)
const total = computed(() => props.exercises.length)
const correctSoFar = computed(() => results.value.filter(r => r.correct).length)
const progressPercent = computed(() => (total.value ? Math.round((index.value / total.value) * 100) : 0))

const pickedText = computed(() =>
  picked.value.map(key => chips.value.find(c => c.key === key)?.text || '').join(' ')
)
const allChipsUsed = computed(() => chips.value.length > 0 && picked.value.length === chips.value.length)

const canSubmit = computed(() => {
  if (!current.value || answered.value) return false
  if (current.value.type === 'fill') return typed.value.trim().length > 0
  if (current.value.type === 'order') return allChipsUsed.value
  return false
})

const caseLabel = {
  nominativ: 'Nominativ',
  akkusativ: 'Akkusativ',
  dativ: 'Dativ',
  genitiv: 'Genitiv'
}

/** Split a fill prompt around the blank so the blank can be rendered as its own element. */
const promptParts = computed(() => {
  if (!current.value) return ['', '']
  const parts = current.value.prompt.split('___')
  return parts.length === 2 ? parts : [current.value.prompt, null]
})

function shuffleChips(tokens) {
  const base = tokens.map((text, i) => ({ text, key: i }))
  let shuffled = shuffle(base)
  // Avoid handing the learner the sentence already in order.
  let attempts = 0
  while (tokens.length > 1 && shuffled.every((c, i) => c.key === i) && attempts < 5) {
    shuffled = shuffle(base)
    attempts++
  }
  return shuffled
}

function setupCurrent() {
  typed.value = ''
  picked.value = []
  answered.value = false
  wasCorrect.value = false
  chips.value = current.value?.type === 'order' ? shuffleChips(current.value.tokens) : []
  if (current.value?.type === 'fill') {
    requestAnimationFrame(() => inputEl.value?.focus())
  }
}

function finish(given, correct) {
  answered.value = true
  wasCorrect.value = correct
  results.value.push({ exercise: current.value, given, correct })
  emit('answered', { exercise: current.value, correct })
}

function submitFill() {
  if (!canSubmit.value) return
  finish(typed.value.trim(), isCorrect(current.value, typed.value))
}

function chooseOption(option) {
  if (answered.value) return
  finish(option, isCorrect(current.value, option))
}

function submitOrder() {
  if (!canSubmit.value) return
  finish(pickedText.value, isOrderCorrect(current.value, pickedText.value))
}

function pickChip(key) {
  if (answered.value || picked.value.includes(key)) return
  picked.value.push(key)
}

function unpickChip(key) {
  if (answered.value) return
  picked.value = picked.value.filter(k => k !== key)
}

function clearPicked() {
  if (!answered.value) picked.value = []
}

function next() {
  if (!answered.value) return
  if (index.value + 1 >= total.value) {
    emit('finished', results.value)
    return
  }
  index.value++
  setupCurrent()
}

function insertChar(char) {
  const el = inputEl.value
  if (!el) {
    typed.value += char
    return
  }
  const start = el.selectionStart ?? typed.value.length
  const end = el.selectionEnd ?? typed.value.length
  typed.value = typed.value.slice(0, start) + char + typed.value.slice(end)
  requestAnimationFrame(() => {
    el.focus()
    el.setSelectionRange(start + char.length, start + char.length)
  })
}

function onKeydown(event) {
  if (!current.value) return
  if (event.key === 'Enter') {
    if (answered.value) {
      event.preventDefault()
      next()
    } else if (current.value.type === 'order' && canSubmit.value) {
      event.preventDefault()
      submitOrder()
    }
    return
  }
  // Number keys pick choice options when nothing is being typed.
  if (current.value.type === 'choice' && !answered.value && /^[1-9]$/.test(event.key)) {
    const option = current.value.options[Number(event.key) - 1]
    if (option) chooseOption(option)
  }
}

onMounted(() => {
  setupCurrent()
  window.addEventListener('keydown', onKeydown)
})
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
watch(() => props.exercises, () => {
  index.value = 0
  results.value = []
  setupCurrent()
})
</script>

<template>
  <section class="round" v-if="current">
    <!-- Progress -->
    <div class="round-header">
      <button class="link-button" @click="emit('exit')">← Drills</button>
      <div class="round-title">{{ title }}</div>
      <div class="round-count">{{ index + 1 }} / {{ total }}</div>
    </div>
    <div class="progress-bar" role="progressbar" :aria-valuenow="progressPercent" aria-valuemin="0" aria-valuemax="100">
      <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
    </div>
    <div class="score-line">
      <span class="score-ok">✓ {{ correctSoFar }}</span>
      <span class="score-bad">✗ {{ results.length - correctSoFar }}</span>
    </div>

    <!-- Question card -->
    <div
      class="question-card"
      :class="{
        'is-correct': answered && wasCorrect,
        'is-wrong': answered && !wasCorrect,
        ['case-' + current.case]: answered && current.case
      }"
    >
      <div class="question-type">
        <span v-if="current.type === 'choice'">Choose</span>
        <span v-else-if="current.type === 'fill'">Fill in</span>
        <span v-else>Sentence builder</span>
      </div>

      <!-- Prompt -->
      <p class="prompt" v-if="current.type === 'fill'">
        <span>{{ promptParts[0] }}</span>
        <span class="blank" v-if="promptParts[1] !== null">
          <template v-if="answered">{{ current.answers[0] }}</template>
          <template v-else>{{ typed || '___' }}</template>
        </span>
        <span v-if="promptParts[1] !== null">{{ promptParts[1] }}</span>
      </p>
      <p class="prompt" v-else-if="current.type === 'choice'">{{ current.prompt }}</p>
      <p class="prompt prompt-small" v-else>{{ current.prompt }}</p>

      <p class="hint">{{ current.hint }}</p>

      <!-- Fill -->
      <form v-if="current.type === 'fill'" class="fill-form" @submit.prevent="submitFill">
        <input
          ref="inputEl"
          v-model="typed"
          type="text"
          class="fill-input"
          :disabled="answered"
          autocomplete="off"
          autocapitalize="off"
          spellcheck="false"
          aria-label="Your answer"
          placeholder="Type the missing word(s)"
        />
        <div class="umlaut-row">
          <button
            v-for="ch in ['ä', 'ö', 'ü', 'ß']"
            :key="ch"
            type="button"
            class="umlaut-button"
            :disabled="answered"
            @click="insertChar(ch)"
          >
            {{ ch }}
          </button>
          <button type="submit" class="check-button" :disabled="!canSubmit">Check ↵</button>
        </div>
      </form>

      <!-- Choice -->
      <div v-else-if="current.type === 'choice'" class="options">
        <button
          v-for="(option, i) in current.options"
          :key="option"
          type="button"
          class="option-button"
          :class="{
            'option-correct': answered && isCorrect(current, option),
            'option-wrong': answered && !isCorrect(current, option) && results[results.length - 1]?.given === option
          }"
          :disabled="answered"
          @click="chooseOption(option)"
        >
          <span class="option-key">{{ i + 1 }}</span>
          <span>{{ option }}</span>
        </button>
      </div>

      <!-- Order -->
      <div v-else class="order">
        <div class="order-target" :class="{ 'order-empty': picked.length === 0 }" aria-live="polite">
          <template v-if="picked.length === 0">
            <span class="order-placeholder">Tap the words below…</span>
          </template>
          <button
            v-for="key in picked"
            :key="'p' + key"
            type="button"
            class="chip chip-picked"
            :disabled="answered"
            @click="unpickChip(key)"
          >
            {{ chips.find(c => c.key === key)?.text }}
          </button>
        </div>
        <div class="order-pool">
          <button
            v-for="chip in chips"
            :key="'c' + chip.key"
            type="button"
            class="chip"
            :class="{ 'chip-used': picked.includes(chip.key) }"
            :disabled="answered || picked.includes(chip.key)"
            @click="pickChip(chip.key)"
          >
            {{ chip.text }}
          </button>
        </div>
        <div class="order-actions">
          <button type="button" class="ghost-button" :disabled="answered || picked.length === 0" @click="clearPicked">
            Clear
          </button>
          <button type="button" class="check-button" :disabled="!canSubmit" @click="submitOrder">Check ↵</button>
        </div>
      </div>

      <!-- Feedback -->
      <transition name="feedback">
        <div v-if="answered" class="feedback" :class="wasCorrect ? 'feedback-ok' : 'feedback-bad'">
          <div class="feedback-head">
            <span class="feedback-verdict">{{ wasCorrect ? 'Richtig!' : 'Nicht ganz.' }}</span>
            <span v-if="current.case" class="case-badge" :class="'badge-' + current.case">
              {{ caseLabel[current.case] }}
            </span>
          </div>
          <div v-if="!wasCorrect" class="feedback-answer">
            <span class="feedback-label">Correct:</span>
            <strong>{{ current.answers[0] }}</strong>
            <span v-if="current.answers.length > 1" class="feedback-alt">
              (also: {{ current.answers.slice(1).join(', ') }})
            </span>
          </div>
          <div v-else-if="current.type === 'order'" class="feedback-answer">
            <strong>{{ current.answers[0] }}</strong>
          </div>
          <p class="feedback-explanation">{{ current.explanation }}</p>
          <button type="button" class="next-button" @click="next">
            {{ index + 1 >= total ? 'See results' : 'Next' }} ↵
          </button>
        </div>
      </transition>
    </div>
  </section>
</template>

<style scoped>
.round {
  max-width: 720px;
  margin: 0 auto;
}

.round-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.round-title {
  font-weight: 700;
  color: #0f172a;
  text-align: center;
  flex: 1;
}

.round-count {
  font-variant-numeric: tabular-nums;
  color: #475569;
  font-weight: 600;
}

.link-button {
  background: none;
  border: none;
  color: #7c3aed;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 0;
}

.link-button:hover { text-decoration: underline; }

.progress-bar {
  height: 8px;
  background: #e5e7eb;
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #7c3aed, #2563eb);
  transition: width 0.3s ease;
}

.score-line {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  font-size: 13px;
  font-weight: 600;
  margin: 6px 0 16px;
}

.score-ok { color: #16a34a; }
.score-bad { color: #dc2626; }

.question-card {
  background: white;
  border-radius: 16px;
  padding: 28px 24px;
  box-shadow: 0 10px 25px -5px rgb(0 0 0 / 0.1);
  border: 2px solid #e5e7eb;
  border-left-width: 6px;
  transition: border-color 0.2s;
}

.question-card.case-dativ { border-left-color: #4CAF50; }
.question-card.case-akkusativ { border-left-color: #F44336; }
.question-card.case-nominativ { border-left-color: #2196F3; }
.question-card.case-genitiv { border-left-color: #FF9800; }
.question-card.is-correct { border-color: #86efac; border-left-color: #16a34a; }
.question-card.is-wrong { border-color: #fca5a5; border-left-color: #dc2626; }
.question-card.is-correct.case-dativ { border-left-color: #4CAF50; }
.question-card.is-correct.case-akkusativ { border-left-color: #F44336; }

.question-type {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 700;
  color: #7c3aed;
  margin-bottom: 12px;
}

.prompt {
  font-size: 24px;
  font-weight: 600;
  line-height: 1.4;
  color: #0f172a;
}

.prompt-small { font-size: 18px; color: #475569; }

.blank {
  display: inline-block;
  min-width: 3ch;
  padding: 0 6px;
  margin: 0 2px;
  border-bottom: 3px solid #7c3aed;
  color: #7c3aed;
  text-align: center;
}

.hint {
  margin-top: 8px;
  color: #6b7280;
  font-style: italic;
  font-size: 15px;
}

.fill-form { margin-top: 20px; }

.fill-input {
  width: 100%;
  font-size: 20px;
  padding: 12px 14px;
  border: 2px solid #d1d5db;
  border-radius: 10px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.fill-input:focus {
  border-color: #7c3aed;
  box-shadow: 0 0 0 3px rgb(124 58 237 / 0.2);
}

.umlaut-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
  align-items: center;
}

.umlaut-button {
  min-width: 44px;
  height: 44px;
  font-size: 18px;
  font-weight: 600;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  background: #f8fafc;
  cursor: pointer;
}

.umlaut-button:hover:not(:disabled) { background: #ede9fe; border-color: #7c3aed; }

.check-button,
.next-button {
  margin-left: auto;
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  background: #7c3aed;
  color: white;
  font-weight: 700;
  cursor: pointer;
  min-height: 44px;
  transition: background 0.2s;
}

.check-button:hover:not(:disabled),
.next-button:hover { background: #6d28d9; }

.check-button:disabled { background: #c4b5fd; cursor: not-allowed; }

.ghost-button {
  padding: 10px 16px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  background: white;
  color: #475569;
  font-weight: 600;
  cursor: pointer;
  min-height: 44px;
}

.ghost-button:disabled { opacity: 0.5; cursor: not-allowed; }

.options {
  display: grid;
  gap: 10px;
  margin-top: 20px;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
}

.option-button {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-radius: 10px;
  border: 2px solid #e5e7eb;
  background: #f8fafc;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s;
  min-height: 48px;
}

.option-button:hover:not(:disabled) { border-color: #7c3aed; background: #f5f3ff; }
.option-button:focus-visible { outline: 3px solid #7c3aed; outline-offset: 2px; }
.option-button:disabled { cursor: default; }
.option-correct { border-color: #16a34a !important; background: #dcfce7 !important; }
.option-wrong { border-color: #dc2626 !important; background: #fee2e2 !important; }

.option-key {
  font-size: 12px;
  font-weight: 700;
  color: #6b7280;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.order { margin-top: 20px; }

.order-target {
  min-height: 64px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  padding: 12px;
  border: 2px dashed #c4b5fd;
  border-radius: 12px;
  background: #faf5ff;
}

.order-placeholder { color: #9ca3af; font-style: italic; }

.order-pool {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.chip {
  padding: 10px 14px;
  border-radius: 999px;
  border: 2px solid #d1d5db;
  background: white;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  min-height: 44px;
  transition: all 0.15s;
}

.chip:hover:not(:disabled) { border-color: #7c3aed; background: #f5f3ff; transform: translateY(-1px); }
.chip:focus-visible { outline: 3px solid #7c3aed; outline-offset: 2px; }
.chip-picked { background: #7c3aed; color: white; border-color: #7c3aed; }
.chip-picked:hover:not(:disabled) { background: #6d28d9; }
.chip-used { opacity: 0.25; cursor: default; }

.order-actions {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: 14px;
}

.feedback {
  margin-top: 20px;
  padding: 16px;
  border-radius: 12px;
  border-left: 4px solid;
}

.feedback-ok { background: #f0fdf4; border-color: #16a34a; }
.feedback-bad { background: #fef2f2; border-color: #dc2626; }

.feedback-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}

.feedback-verdict { font-weight: 800; font-size: 18px; }
.feedback-ok .feedback-verdict { color: #15803d; }
.feedback-bad .feedback-verdict { color: #b91c1c; }

.feedback-answer { margin-top: 8px; font-size: 18px; color: #0f172a; }
.feedback-label { color: #6b7280; margin-right: 6px; font-size: 14px; }
.feedback-alt { color: #6b7280; font-size: 14px; margin-left: 6px; }
.feedback-explanation { margin-top: 8px; color: #334155; line-height: 1.5; }

.next-button { display: block; margin-top: 14px; margin-left: auto; }

.case-badge {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-nominativ { background: #E3F2FD; color: #1565C0; }
.badge-akkusativ { background: #FFEBEE; color: #C62828; }
.badge-dativ { background: #E8F5E9; color: #2E7D32; }
.badge-genitiv { background: #FFF3E0; color: #E65100; }

.feedback-enter-active { transition: all 0.25s ease; }
.feedback-enter-from { opacity: 0; transform: translateY(6px); }

@media (max-width: 480px) {
  .question-card { padding: 20px 16px; }
  .prompt { font-size: 20px; }
  .fill-input { font-size: 18px; }
  .chip { font-size: 15px; padding: 8px 12px; }
}
</style>
