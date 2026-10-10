<script setup>
import { computed, ref, watch } from 'vue'
import { api } from '../../lib/api'
import { sentenceOf } from '../../lib/reader'

// Details for a tapped word + "Satz minen" (creates a sentence card).
const props = defineProps({
  analysis: { type: Object, required: true },
  token: { type: Object, default: null },
  glossary: { type: Array, default: () => [] },
  source: { type: String, default: 'Lesen' },
  // A subtitle line is mined as a whole (not just the spaCy sentence around the word).
  sentence: { type: String, default: null },
  // Extra fields for the mine request (e.g. the clip and time range for an audio snippet).
  extra: { type: Object, default: null }
})
const emit = defineEmits(['mined'])

const mined = ref(null)
const error = ref(null)
watch(() => props.token, () => { mined.value = null; error.value = null })

const chunk = computed(() => (props.token?.chunk != null ? props.analysis.chunks[props.token.chunk] : null))
const authorGloss = computed(() => props.glossary.find((g) => g.term === props.token?.text))
const gloss = computed(() => authorGloss.value?.gloss ?? props.token?.entry?.gloss ?? null)
const display = computed(() => props.token?.entry?.display ?? props.token?.lemma)
const sentence = computed(() => props.sentence ?? (props.token ? sentenceOf(props.analysis, props.token.i) : ''))
const STATE = { neu: 'neu', lernend: 'am Lernen', bekannt: 'bekannt' }

async function mine() {
  error.value = null
  try {
    const r = await api.post('/mined', {
      sentence: sentence.value,
      target: props.token.text,
      lemma: props.token.lemma,
      display: display.value,
      gloss: gloss.value ?? '',
      note: chunk.value?.explain ?? authorGloss.value?.note ?? null,
      case: chunk.value?.case ?? null,
      source: props.source,
      ...(props.extra ?? {})
    })
    mined.value = r.duplicate ? 'Schon gemined.' : 'Gemined — kommt als neue Karte.'
    emit('mined', r)
  } catch (e) {
    error.value = e.message
  }
}
</script>

<template>
  <section class="k-card flex flex-col gap-2" aria-live="polite" data-testid="word-panel">
    <h2 class="k-h2" style="font-size: 17px">Wort</h2>
    <p v-if="!token" class="k-small m-0">Tippe ein Wort an: Bedeutung, Artikel und Plural, und bei Kasus-Linse, warum dieser Fall.</p>
    <template v-else>
      <p class="m-0 k-read" style="font-size: 24px; font-weight: 600">{{ display }}</p>
      <p v-if="gloss" class="m-0" style="font-size: 17px">„{{ gloss }}“</p>
      <p v-else class="k-small m-0">Keine Übersetzung gefunden.</p>
      <p v-if="token.state" class="k-hint m-0">Status: {{ STATE[token.state] }}<template v-if="token.entry?.cardId"> · im Kernwortschatz</template></p>
      <div v-if="chunk" class="flex gap-2.5 items-start mt-1">
        <span :class="['k-case', `k-case-${chunk.case}`]" :aria-label="`Kasus ${chunk.case}`">{{ chunk.case }}</span>
        <p class="m-0 k-small" style="color: var(--text)">{{ chunk.explain }}</p>
      </div>
      <p class="k-small m-0 mt-1 k-read" style="font-size: 15px">„{{ sentence }}“</p>
      <button class="k-btn k-btn-sm mt-1" data-testid="mine" @click="mine">Satz minen</button>
      <p v-if="mined" class="k-chip k-chip-success m-0" style="width: fit-content">{{ mined }}</p>
      <p v-if="error" class="k-error m-0">{{ error }}</p>
    </template>
  </section>
</template>
