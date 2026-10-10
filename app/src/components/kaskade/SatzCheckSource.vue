<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { api } from '../../lib/api'
import { cuesInWindow } from '../../lib/satzcheck'
import { clipStatus } from '../../lib/watch'
import { formatClock } from '../../lib/format'
import FilePicker from './FilePicker.vue'

// Step 1 of a Satz-Check: pick or add a clip, the content type and a 3-minute window.
const props = defineProps({ defaultType: { type: String, default: 'adult' } })
const emit = defineEmits(['start'])

const library = ref([])
const selected = ref(null)
const contentType = ref(props.defaultType)
const windowStart = ref(0)
const error = ref(null)
const busy = ref(false)
const youtubeUrl = ref('')
const title = ref('')
const mediaInput = ref(null)
const subsInput = ref(null)
const stepTwo = ref(null)
const startBtn = ref(null)
const preview = ref(null)

async function loadLibrary() {
  try {
    library.value = await api.get('/media')
  } catch (e) {
    error.value = e.message
  }
}
onMounted(loadLibrary)

async function choose(id) {
  error.value = null
  try {
    selected.value = await api.get(`/media/${id}`)
    windowStart.value = 0
  } catch (e) {
    error.value = e.message
    return
  }
  // Step 2 is next: bring it into view (on phones it's below the list) and focus "starten".
  await nextTick()
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  stepTwo.value?.scrollIntoView?.({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  startBtn.value?.focus({ preventScroll: true })
}

// The preview player follows the chosen start point.
function seekPreview() {
  if (preview.value && preview.value.readyState >= 1) preview.value.currentTime = windowStart.value
}
watch(windowStart, seekPreview)

async function uploadClip() {
  const subs = subsInput.value?.files?.[0]
  if (!subs) {
    error.value = 'Bitte eine Untertiteldatei (.srt oder .vtt) auswählen.'
    return
  }
  const form = new FormData()
  form.append('subtitles', subs)
  const media = mediaInput.value?.files?.[0]
  if (media) form.append('media', media)
  form.append('title', title.value)
  busy.value = true
  error.value = null
  try {
    const m = await api.post('/media/upload', form)
    await loadLibrary()
    await choose(m.id)
  } catch (e) {
    error.value = e.message
  } finally {
    busy.value = false
  }
}

async function fetchYoutube() {
  busy.value = true
  error.value = null
  try {
    const m = await api.post('/media/youtube', { url: youtubeUrl.value })
    await loadLibrary()
    await choose(m.id)
  } catch (e) {
    error.value = e.message
  } finally {
    busy.value = false
  }
}

const duration = computed(() => selected.value?.duration ?? 0)
const maxStart = computed(() => Math.max(0, Math.floor(duration.value - 180)))
const inWindow = computed(() => (selected.value ? cuesInWindow(selected.value.cues, windowStart.value) : []))

function start() {
  preview.value?.pause()
  emit('start', { media: selected.value, contentType: contentType.value, windowStart: windowStart.value })
}
</script>

<template>
  <div class="flex flex-wrap gap-6 items-start">
    <section class="k-card flex flex-col gap-4" style="flex: 999 1 520px" aria-labelledby="src-h">
      <h2 id="src-h" class="k-h2">1 · Clip wählen</h2>
      <p v-if="error" class="k-error m-0" role="alert">{{ error }}</p>

      <div v-if="library.length" class="flex flex-col gap-2">
        <p class="k-eyebrow" id="clips-label">Deine Clips · einen auswählen</p>
        <div role="radiogroup" aria-labelledby="clips-label" class="flex flex-col gap-2">
        <button
          v-for="m in library"
          :key="m.id"
          type="button"
          class="k-option"
          :aria-checked="selected?.id === m.id ? 'true' : 'false'"
          role="radio"
          :data-testid="`media-${m.id}`"
          @click="choose(m.id)"
        >
          <span class="sc-radio" aria-hidden="true"></span>
          <span class="flex-1 min-w-0" style="font-family: var(--font-ui); font-size: 16px">
            {{ m.title }}
            <span class="k-hint block">{{ m.hasMedia ? (m.isAudio ? 'Audio' : 'Video') : 'nur Text' }} · {{ m.cueCount }} Sätze · {{ formatClock(m.duration) }}<template v-if="clipStatus(m)"> · {{ clipStatus(m) }}</template></span>
          </span>
          <span class="sc-pick" aria-hidden="true">{{ selected?.id === m.id ? '✓ Ausgewählt' : 'Auswählen' }}</span>
        </button>
        </div>
      </div>

      <details :open="!library.length" class="flex flex-col gap-3">
        <summary class="k-btn k-btn-ghost k-btn-sm" style="width: fit-content">Neuen Clip hochladen</summary>
        <div class="flex flex-col gap-3 mt-3">
          <FilePicker ref="mediaInput" label="Video oder Audio (optional: .mp4, .webm, .mp3 …)" accept="video/*,audio/*" testid="upload-media" />
          <FilePicker ref="subsInput" label="Deutsche Untertitel (.srt oder .vtt)" accept=".srt,.vtt" testid="upload-subs" />
          <label class="flex flex-col gap-1 k-small">Titel
            <input v-model="title" type="text" class="k-input" placeholder="z. B. Serie, Folge 3" data-testid="upload-title" />
          </label>
          <button class="k-btn" :disabled="busy" data-testid="upload-submit" @click="uploadClip">{{ busy ? 'Lädt …' : 'Hochladen' }}</button>
        </div>
      </details>

      <details class="flex flex-col gap-3">
        <summary class="k-btn k-btn-ghost k-btn-sm" style="width: fit-content">Von YouTube holen</summary>
        <div class="flex flex-col gap-3 mt-3">
          <p class="k-hint m-0">Holt deutsche Untertitel und das Video in niedriger Qualität. YouTube blockiert Server oft — dann bitte hochladen.</p>
          <input v-model="youtubeUrl" type="url" class="k-input" placeholder="https://www.youtube.com/watch?v=…" />
          <button class="k-btn" :disabled="busy || !youtubeUrl" @click="fetchYoutube">{{ busy ? 'Lädt … (bis 1 min)' : 'Holen' }}</button>
        </div>
      </details>
    </section>

    <section ref="stepTwo" class="k-card flex flex-col gap-4 sc-step2" style="flex: 1 1 320px" aria-labelledby="win-h" data-testid="sc-step2">
      <h2 id="win-h" class="k-h2">2 · Einstellen</h2>
      <fieldset class="flex flex-col gap-2 border-0 p-0 m-0">
        <legend class="k-small mb-2">Was für Inhalt ist das?</legend>
        <label class="flex items-center gap-3 k-small" style="min-height: 40px">
          <input v-model="contentType" type="radio" value="adult" /> Für Erwachsene (Serie, Film, Talk) · Tor 80 %
        </label>
        <label class="flex items-center gap-3 k-small" style="min-height: 40px">
          <input v-model="contentType" type="radio" value="simple" /> Einfach (Lernsendung, langsam gesprochen) · Tor 75 %
        </label>
      </fieldset>
      <template v-if="selected">
        <p class="m-0" style="font-weight: 700">{{ selected.title }}</p>
        <video
          v-if="selected.hasMedia && !selected.isAudio"
          ref="preview"
          class="sc-preview"
          :src="`/api/media/${selected.id}/file`"
          preload="metadata"
          controls
          playsinline
          data-testid="sc-preview"
          @loadedmetadata="seekPreview"
        ></video>
        <label class="flex flex-col gap-2 k-small">
          <span>Startpunkt: <strong>{{ formatClock(windowStart) }}</strong> – {{ formatClock(Math.min(windowStart + 180, duration)) }}</span>
          <input v-model.number="windowStart" type="range" min="0" :max="maxStart" step="5" :disabled="maxStart === 0" />
        </label>
        <p class="k-small m-0"><strong>{{ inWindow.length }}</strong> Sätze in diesen 3 Minuten.</p>
        <button ref="startBtn" class="k-btn" :disabled="!inWindow.length" data-testid="sc-start" @click="start">Satz-Check starten</button>
      </template>
      <p v-else class="k-hint m-0">Erst links einen Clip wählen oder hochladen.</p>
      <p class="k-callout m-0"><strong>Ehrlich bewerten:</strong> „Verstanden“ heißt, du könntest den Satz grob übersetzen. Ein bekanntes Wort im Satz reicht nicht.</p>
    </section>
  </div>
</template>

<style scoped>
.sc-radio {
  flex: none;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid var(--border-strong);
  background: var(--surface);
}
.k-option[aria-checked='true'] .sc-radio { border: 7px solid var(--primary); }
.sc-pick { flex: none; font-family: var(--font-ui); font-size: 14px; font-weight: 700; color: var(--text-2); }
.k-option[aria-checked='true'] .sc-pick { color: var(--text); }
.sc-step2 { scroll-margin-top: 16px; }
.sc-preview { display: block; width: 100%; aspect-ratio: 16 / 9; border-radius: var(--radius-sm); background: var(--stage-bg); }
</style>
