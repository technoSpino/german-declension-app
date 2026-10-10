<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../../lib/api'
import { clipStatus, formatTime, inside, lineAt, resumeAt, shouldPause, speechCues, stepLine } from '../../lib/watch'
import AnalyzedText from '../../components/kaskade/AnalyzedText.vue'
import WordPanel from '../../components/kaskade/WordPanel.vue'

// "Schauen & minen": watch a library clip with the current German subtitle line under
// the video, pause after each line, tap words, mine whole lines (with their audio) as cards.
const route = useRoute()
const router = useRouter()
const clips = ref(null)
const media = ref(null)
const error = ref(null)
const video = ref(null)
const t = ref(0)
const playing = ref(false)
const autoPause = ref(readPref('kaskade-autopause', true))
const loop = ref(false) // repeat the current line (listening practice)
const rate = ref(1)
const analysis = ref(null)
const token = ref(null)
const mined = ref(0)
const LEAD = 0.15
let pausedFor = null
let touched = false // only save a position once the clip was actually played or moved
let loopLine = -1 // the line being looped (fixed when the loop starts or a line is chosen)
let raf = 0
let lastSaved = 0
const analyses = new Map()

function readPref(key, fallback) {
  try {
    const v = localStorage.getItem(key)
    return v === null ? fallback : v === '1'
  } catch {
    return fallback
  }
}
watch(autoPause, (v) => {
  try { localStorage.setItem('kaskade-autopause', v ? '1' : '0') } catch { /* private mode */ }
})

const cues = computed(() => (media.value ? speechCues(media.value.cues) : []))
// Look slightly ahead: seeking lands 0.1 s before a line, which should already show that line.
const index = computed(() => lineAt(cues.value, t.value + LEAD))
const line = computed(() => cues.value[index.value] ?? null)
const speaking = computed(() => inside(cues.value, index.value, t.value))

async function load() {
  touched = false
  error.value = null
  media.value = null
  analysis.value = null
  token.value = null
  try {
    if (!route.params.id) {
      clips.value = (await api.get('/media')).filter((c) => c.hasMedia)
      return
    }
    media.value = await api.get(`/media/${route.params.id}`)
    // ?t=… jumps to a line (e.g. from the Satz-Check result), ?loop=1 repeats it
    const at = Number(route.query.t)
    t.value = Number.isFinite(at) && at > 0 ? at : resumeAt(media.value.position, media.value.duration)
    loop.value = route.query.loop === '1'
  } catch (e) {
    error.value = e.message
  }
}
onMounted(load)
watch(() => route.params.id, load)

function onLoaded() {
  if (video.value && t.value) video.value.currentTime = t.value
}

// Analyse the line once it is on screen (cached per text).
watch(line, async (l) => {
  token.value = null
  if (!l) {
    analysis.value = null
    return
  }
  if (analyses.has(l.text)) {
    analysis.value = analyses.get(l.text)
    return
  }
  analysis.value = null
  try {
    const a = await api.post('/analyze', { text: l.text })
    analyses.set(l.text, a)
    if (line.value?.text === l.text) analysis.value = a
  } catch {
    analysis.value = null // spaCy unavailable: plain text below
  }
})

function tick() {
  const v = video.value
  if (!v) return
  t.value = v.currentTime
  const cur = cues.value[loopLine]
  if (loop.value && !v.paused && cur && v.currentTime >= cur.end + 0.15) {
    v.currentTime = Math.max(0, cur.start - 0.1) // loop: back to the start of the line
  } else if (autoPause.value && !loop.value && !v.paused) {
    const i = shouldPause(cues.value, v.currentTime, pausedFor)
    if (i >= 0) {
      pausedFor = i
      v.pause()
    }
  }
  if (Date.now() - lastSaved > 10000) saveProgress()
  raf = requestAnimationFrame(tick)
}

function onPlay() {
  touched = true
  if (loopLine < 0 || !loop.value) loopLine = lineAt(cues.value, (video.value?.currentTime ?? 0) + LEAD)
  playing.value = true
  cancelAnimationFrame(raf)
  raf = requestAnimationFrame(tick)
}
function onPause() {
  playing.value = false
  cancelAnimationFrame(raf)
  if (video.value) t.value = video.value.currentTime
  saveProgress()
}

const CANT_PLAY = 'Dieser Browser kann das Video nicht abspielen. Wird der Clip gerade umgewandelt, in ein paar Minuten neu laden — sonst den Clip im Satz-Check neu hochladen (er wird dann als H.264/MP4 gespeichert). Untertitel, Wörter und „Satz minen“ gehen trotzdem.'

function onVideoError() {
  error.value = CANT_PLAY
}

function toggle() {
  const v = video.value
  if (!v) return
  if (v.paused) {
    v.play().catch((e) => {
      // AbortError = a seek interrupted play(): harmless. Everything else: explain in German.
      if (e?.name !== 'AbortError') error.value = v.error || e?.name === 'NotSupportedError' ? CANT_PLAY : `Abspielen nicht möglich (${e?.name ?? 'Fehler'}).`
    })
  } else v.pause()
}

function seekLine(i, play = true) {
  const v = video.value
  const c = cues.value[i]
  if (!v || !c) return
  touched = true
  loopLine = i
  pausedFor = i - 1 // the lead-in belongs to the previous line: don't pause for it
  v.currentTime = Math.max(0, c.start - 0.1)
  t.value = c.start
  if (play) v.play().catch(() => {})
}
const prev = () => seekLine(stepLine(cues.value, t.value, -1))
const next = () => seekLine(stepLine(cues.value, t.value, 1))
const replay = () => index.value >= 0 && seekLine(index.value)

function toggleLoop() {
  loop.value = !loop.value
  loopLine = index.value
}

function setRate(r) {
  rate.value = r
  if (video.value) video.value.playbackRate = r
}

function saveProgress() {
  lastSaved = Date.now()
  if (!touched || !media.value || !video.value) return
  const position = video.value.currentTime
  fetch(`/api/media/${media.value.id}/progress`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ position }),
    keepalive: true
  }).catch(() => {})
}

function selectWord(tok) {
  token.value = tok
  video.value?.pause()
}

let spaceHandled = false
function onKey(e) {
  if (!media.value || e.ctrlKey || e.metaKey || e.altKey) return
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target?.tagName)) return
  const k = e.key.toLowerCase()
  if (k === ' ') {
    e.preventDefault()
    spaceHandled = true
    toggle()
  } else if (k === 'arrowleft') {
    e.preventDefault()
    prev()
  } else if (k === 'arrowright') {
    e.preventDefault()
    next()
  } else if (k === 'r') {
    replay()
  } else if (k === 'l') {
    toggleLoop()
  }
}
// Space on a focused button would also "click" it on keyup — swallow that.
function onKeyUp(e) {
  if (e.key === ' ' && spaceHandled) {
    e.preventDefault()
    spaceHandled = false
  }
}
onMounted(() => {
  window.addEventListener('keydown', onKey)
  window.addEventListener('keyup', onKeyUp)
  window.addEventListener('pagehide', saveProgress)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('keyup', onKeyUp)
  window.removeEventListener('pagehide', saveProgress)
  cancelAnimationFrame(raf)
  saveProgress()
})

const extra = computed(() => (line.value ? { mediaId: media.value.id, start: line.value.start, end: line.value.end } : null))
const minutesLeft = (c) => Math.max(0, Math.round((c.duration - c.position) / 60))
</script>

<template>
  <main class="k-main" data-testid="schauen">
    <p v-if="error" class="k-error m-0" role="alert">{{ error }}</p>

    <!-- Clip list -->
    <template v-if="!route.params.id">
      <div>
        <p class="k-eyebrow mb-1.5">Interaktiv schauen</p>
        <h1 class="k-h1">Schauen &amp; minen</h1>
        <p class="k-lead">Ein Clip aus deiner Bibliothek mit deutschen Untertiteln. Nach jeder Zeile pausiert das Video, du tippst unbekannte Wörter an und minest gute Sätze — mit dem Original-Ton als Karte.</p>
      </div>
      <section class="k-card" aria-labelledby="clips-h">
        <h2 id="clips-h" class="k-h2">Deine Clips</h2>
        <p v-if="clips && !clips.length" class="k-small m-0 mt-2">Noch kein Clip mit Video. Lade im <router-link to="/satz-check">Satz-Check</router-link> einen Clip mit Untertiteln hoch.</p>
        <ul class="list-none m-0 mt-3 p-0">
          <li v-for="c in clips ?? []" :key="c.id" class="sw-clip">
            <div class="min-w-0">
              <p class="m-0" style="font-weight: 700">{{ c.title }}</p>
              <p class="k-hint m-0">{{ formatTime(c.duration) }} · {{ c.cueCount }} Zeilen<template v-if="c.position > 2"> · weiter ab {{ formatTime(c.position) }} (noch ≈ {{ minutesLeft(c) }} min)</template><template v-if="clipStatus(c)"> · {{ clipStatus(c) }}</template></p>
            </div>
            <router-link :to="`/schauen/${c.id}`" class="k-btn k-btn-sm" :data-testid="`watch-${c.id}`">{{ c.position > 2 ? 'Weiterschauen' : 'Schauen' }}</router-link>
          </li>
        </ul>
      </section>
    </template>

    <!-- Player -->
    <template v-else-if="media">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div class="min-w-0">
          <p class="k-eyebrow mb-1.5"><router-link to="/schauen">Schauen &amp; minen</router-link> · {{ cues.length }} Zeilen</p>
          <h1 class="k-h1" style="font-size: clamp(24px, 3vw, 32px)">{{ media.title }}</h1>
        </div>
        <router-link v-if="mined" to="/karten" class="k-chip k-chip-success" data-testid="watch-mined">✓ {{ mined }} {{ mined === 1 ? 'Satz' : 'Sätze' }} gemined → Karten</router-link>
      </div>

      <div class="sw-grid">
        <div class="flex flex-col gap-3 min-w-0">
          <div class="sw-stage">
            <video
              ref="video"
              class="sw-video"
              :src="`/api/media/${media.id}/file`"
              preload="metadata"
              playsinline
              data-testid="watch-video"
              @loadedmetadata="onLoaded"
              @error="onVideoError"
              @play="onPlay"
              @pause="onPause"
              @click="toggle"
            ></video>
          </div>

          <div class="k-card sw-line" aria-live="polite" data-testid="watch-line">
            <template v-if="line">
              <AnalyzedText v-if="analysis" :analysis="analysis" :lens="false" :selected="token?.i ?? null" class="sw-text" @select="selectWord" />
              <p v-else class="k-read sw-text m-0">{{ line.text }}</p>
              <p class="k-hint m-0 mt-2">{{ formatTime(line.start) }} · Zeile {{ index + 1 }} von {{ cues.length }}{{ speaking ? '' : ' · Wort antippen zum Nachschlagen' }}</p>
            </template>
            <p v-else class="k-small m-0">Drück Play — die Untertitel erscheinen hier, Zeile für Zeile.</p>
          </div>

          <div class="sw-controls" role="group" aria-label="Wiedergabe">
            <button class="k-btn k-btn-ghost k-btn-sm" aria-label="Vorherige Zeile (Pfeil links)" data-testid="watch-prev" @click="prev">← Zeile</button>
            <button class="k-btn k-btn-sm" data-testid="watch-play" @click="toggle">{{ playing ? '❚❚ Pause' : '▶ Play' }}</button>
            <button class="k-btn k-btn-ghost k-btn-sm" aria-label="Nächste Zeile (Pfeil rechts)" data-testid="watch-next" @click="next">Zeile →</button>
            <button class="k-btn k-btn-ghost k-btn-sm" aria-label="Zeile wiederholen (R)" data-testid="watch-replay" @click="replay">↻ Nochmal</button>
            <button :class="['k-btn k-btn-sm', { 'k-btn-ghost': !loop }]" :aria-pressed="loop" aria-label="Zeile in Schleife (L)" data-testid="watch-loop" @click="toggleLoop">⟲ Schleife</button>
            <label class="k-small inline-flex items-center gap-2 sw-auto"><input v-model="autoPause" type="checkbox" :disabled="loop" data-testid="watch-autopause" /> nach jeder Zeile pausieren</label>
            <span class="k-small inline-flex items-center gap-1.5">
              Tempo
              <button v-for="r in [1, 0.85]" :key="r" :class="['k-btn k-btn-sm sw-rate', { 'k-btn-ghost': rate !== r }]" :aria-pressed="rate === r" @click="setRate(r)">{{ r === 1 ? '1×' : '0,85×' }}</button>
            </span>
          </div>
          <p class="k-hint m-0">Tasten: Leertaste Play/Pause · ← → Zeile zurück/vor · R Zeile wiederholen · L Schleife · {{ formatTime(t) }} / {{ formatTime(media.duration) }}</p>
        </div>

        <div class="flex flex-col gap-4 min-w-0">
          <WordPanel
            v-if="analysis"
            :analysis="analysis"
            :token="token"
            :sentence="line?.text ?? null"
            :extra="extra"
            :source="`Schauen · ${media.title}`"
            @mined="(r) => { if (!r.duplicate) mined++ }"
          />
          <section class="k-card k-small">
            <h2 class="k-h2" style="font-size: 17px">So geht's</h2>
            <ol class="m-0 mt-2 pl-5 flex flex-col gap-1.5" style="list-style: decimal">
              <li>Abspielen. Nach jeder Zeile hält das Video an.</li>
              <li>Nicht verstanden? R oder ↻ — so oft du willst. Langsamer mit 0,85×.</li>
              <li>Unbekanntes Wort antippen: Bedeutung, Artikel, Fall.</li>
              <li>Guter Satz? „Satz minen“ — die ganze Zeile wird zur Karte, mit dem Original-Ton.</li>
            </ol>
          </section>
        </div>
      </div>
    </template>
  </main>
</template>

<style scoped>
.sw-clip {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 0;
  border-top: 1px solid var(--surface-2);
}
.sw-grid { display: grid; gap: 24px; }
@media (min-width: 980px) { .sw-grid { grid-template-columns: minmax(0, 1fr) 340px; align-items: start; } }
.sw-stage { background: var(--stage-bg); border-radius: var(--radius-lg); overflow: hidden; }
.sw-video { display: block; width: 100%; aspect-ratio: 16 / 9; max-height: 62vh; object-fit: contain; background: var(--stage-bg); }
.sw-line { min-height: 96px; }
.sw-text { font-size: clamp(20px, 2.6vw, 26px); line-height: 1.6; }
.sw-controls { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.sw-auto { margin-left: 4px; }
.sw-rate { padding: 0 10px; }
</style>
