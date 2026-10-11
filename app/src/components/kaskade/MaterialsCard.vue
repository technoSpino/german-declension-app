<script setup>
import { computed, onMounted, ref } from 'vue'
import { api } from '../../lib/api'
import { groupTitle, itemLine, noticeTitle, STATUS_LABEL, withSecureCheck } from '../../lib/materials'
import OriginBadge from './OriginBadge.vue'

// "Material für heute und morgen" (#16): what each block needs today and on the next plan day,
// "✓ bereit" or "→ zu tun" — plus books to buy and setup to do, with notice.
const props = defineProps({ blocks: { type: Array, default: () => [] } })
const data = ref(null)
const error = ref(null)
const secure = typeof window !== 'undefined' && window.isSecureContext

async function load() {
  try {
    data.value = await api.get('/materials')
    error.value = null
  } catch (e) {
    error.value = e.message
  }
}
onMounted(load)
defineExpose({ load })

const blockLabel = (id) => {
  const b = props.blocks.find((x) => x.id === id)
  return b?.label ?? b?.title ?? id
}
const groups = computed(() =>
  data.value
    ? [data.value.today, data.value.next].map((g) => ({ ...g, items: g.items.map((it) => withSecureCheck(it, secure, data.value.httpsUrl)) }))
    : []
)

async function tick(n) {
  try {
    if (n.type === 'book') await api.post(`/books/${n.id}/bought`, { done: true })
    else await api.post(`/setup/${n.id}`, { done: true })
    await load()
  } catch (e) {
    error.value = e.message
  }
}
</script>

<template>
  <section class="k-card" aria-labelledby="mat-h" data-testid="materials">
    <h2 id="mat-h" class="k-h2">Material für heute und morgen</h2>
    <p v-if="error" class="k-error m-0 mt-2" role="alert">{{ error }}</p>

    <ul v-if="data?.notices?.length" class="list-none m-0 mt-3 p-0 flex flex-col gap-2" data-testid="mat-notices">
      <li v-for="n in data.notices" :key="n.id" class="mt-notice" :data-testid="`notice-${n.id}`">
        <div class="min-w-0">
          <p class="m-0" style="font-weight: 800">{{ noticeTitle(n) }}: {{ n.title }}</p>
          <p v-if="n.type === 'book'" class="k-small m-0 mt-0.5">
            {{ n.book.format === 'paper' ? 'Taschenbuch' : n.book.format === 'ebook' ? 'E-Book' : 'Hörbuch' }}<template v-if="n.book.isbn"> · ISBN {{ n.book.isbn }}</template><template v-if="n.book.price"> · {{ n.book.price }}</template> · ab {{ n.firstDay.slice(8, 10) }}.{{ Number(n.firstDay.slice(5, 7)) }}. im Plan
            <template v-for="s in n.book.shops ?? []" :key="s.url"> · <a :href="s.url" target="_blank" rel="noopener">{{ s.name }}</a></template>
          </p>
          <p v-else class="k-small m-0 mt-0.5">{{ n.text }} <a v-if="n.url" :href="n.url" target="_blank" rel="noopener">Zur Seite</a></p>
        </div>
        <button class="k-btn k-btn-ghost k-btn-sm" :data-testid="`notice-done-${n.id}`" @click="tick(n)">{{ n.type === 'book' ? '✓ gekauft' : '✓ erledigt' }}</button>
      </li>
    </ul>

    <div v-for="g in groups" :key="g.kind" class="mt-group" :data-testid="`mat-${g.kind}`">
      <h3 class="mt-day">{{ groupTitle(g) }}</h3>
      <p v-if="!g.planDay" class="k-small m-0">Kein Lernblock.</p>
      <ul v-else class="list-none m-0 p-0">
        <li v-for="it in g.items" :key="it.block" class="mt-row" :data-testid="`mat-${g.kind}-${it.block}`" :data-status="it.status">
          <div class="min-w-0">
            <p class="mt-block">{{ blockLabel(it.block) }}</p>
            <p class="m-0" style="font-weight: 700">{{ itemLine(it) }}</p>
            <p class="k-small m-0 mt-0.5">
              <OriginBadge :origin="it.origin" :source="it.source" />
              <span v-if="it.detail"> {{ it.detail }}</span>
            </p>
          </div>
          <div class="flex flex-col items-end gap-1">
            <span :class="['k-chip', it.status === 'ready' ? 'k-chip-success' : 'mt-todo']">{{ STATUS_LABEL[it.status] }}</span>
            <a v-if="it.fix" :href="it.fix.href" class="k-small" style="font-weight: 600">{{ it.fix.label }} →</a>
          </div>
        </li>
      </ul>
    </div>
    <p v-if="data?.check?.gaps?.length" class="k-hint m-0 mt-3" data-testid="mat-gaps">
      Materialcheck: {{ data.check.gaps.length }} {{ data.check.gaps.length === 1 ? 'Lücke' : 'Lücken' }} in den nächsten 7 Tagen — Kaskade füllt sie beim nächsten Abgleich.
    </p>
  </section>
</template>

<style scoped>
.mt-notice {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 16px;
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  background: var(--callout);
}
.mt-group { margin-top: 18px; }
.mt-day { margin: 0 0 4px; font-size: 15px; font-weight: 800; color: var(--text); }
.mt-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  align-items: start;
  padding: 10px 0;
  border-top: 1px solid var(--surface-2);
}
.mt-block { margin: 0; font-size: 12px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--muted); }
.mt-todo { background: var(--surface-2); color: var(--text); border: 1px solid var(--border-strong); }
</style>
