<script setup>
import { ref, computed } from 'vue';
import { tables, getCaseClass, getGenderLabel } from '../data/declensionTables.js';
import examples from '../data/examples.js';
import ExampleModal from '../components/ExampleModal.vue';

// Filter state (optional - show/hide groups)
const showArticles = ref(true);
const showAdjectives = ref(true);

// Modal state
const isModalOpen = ref(false);
const modalData = ref({
  formText: '',
  caseType: '',
  gender: '',
  examples: []
});

// Handle cell click
const handleCellClick = (form, caseType, genderIndex) => {
  const gender = getGenderLabel(genderIndex);
  const exampleKey = `${form}-${caseType}-${gender}`;

  modalData.value = {
    formText: form,
    caseType: caseType,
    gender: gender,
    examples: examples[exampleKey] || ['No examples available']
  };

  isModalOpen.value = true;
};

// Close modal
const closeModal = () => {
  isModalOpen.value = false;
};

// Get all table entries as array
const tableEntries = Object.entries(tables);

// Filtered tables based on checkbox filters
const filteredTables = computed(() => {
  return tableEntries.filter(([key]) => {
    if (key.includes('Article')) return showArticles.value;
    if (key.includes('adjective')) return showAdjectives.value;
    return true;
  });
});
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-5xl mx-auto">
      <!-- Header -->
      <header class="text-center mb-8">
        <h1 class="text-4xl font-bold text-text-primary mb-2">
          German Declension with Adjectives
        </h1>
        <p class="text-text-secondary mb-4">
          <strong>Bold</strong> shows articles and adjective endings to highlight patterns
        </p>
      </header>

      <!-- All Tables - Vertical Stack -->
      <div class="space-y-8">
        <TransitionGroup name="fade">
          <div
            v-for="([key, table], index) in filteredTables"
            :key="key"
            class="card table-section"
          >
            <!-- Table Header -->
            <div class="mb-6">
              <h2 class="text-2xl font-bold text-text-primary text-center">
                {{ table.name }}
              </h2>
              <p class="text-text-secondary text-center mt-2">
                {{ table.description }}
              </p>
            </div>

            <!-- Responsive table container -->
            <div class="overflow-x-auto -mx-6 px-6">
              <table class="w-full min-w-[500px] border-collapse">
                <thead>
                  <tr>
                    <th class="p-3 text-left font-bold text-text-primary bg-gray-100 border border-gray-300">
                      Case
                    </th>
                    <th class="p-3 text-center font-bold text-text-primary bg-gray-100 border border-gray-300">
                      M
                    </th>
                    <th class="p-3 text-center font-bold text-text-primary bg-gray-100 border border-gray-300">
                      F
                    </th>
                    <th class="p-3 text-center font-bold text-text-primary bg-gray-100 border border-gray-300">
                      N
                    </th>
                    <th class="p-3 text-center font-bold text-text-primary bg-gray-100 border border-gray-300">
                      Pl
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(row, rowIndex) in table.grid"
                    :key="rowIndex"
                  >
                    <!-- Case label -->
                    <td
                      class="p-3 font-bold border border-gray-300"
                      :class="'text-case-' + getCaseClass(row[0])"
                    >
                      {{ row[0] }}
                    </td>
                    <!-- Gender cells -->
                    <td
                      v-for="(cell, cellIndex) in row.slice(1)"
                      :key="cellIndex"
                      class="table-cell"
                      :class="'cell-' + getCaseClass(row[0])"
                    >
                      <div v-if="cell.includes('\n')" class="multi-line-cell">
                        <div v-for="(line, lineIndex) in cell.split('\n')" :key="lineIndex" class="cell-line" v-html="line"></div>
                      </div>
                      <span v-else v-html="cell"></span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </TransitionGroup>
      </div>
    </div>

    <!-- Example Modal -->
    <ExampleModal
      :is-open="isModalOpen"
      :form-text="modalData.formText"
      :case-type="modalData.caseType"
      :gender="modalData.gender"
      :examples="modalData.examples"
      @close="closeModal"
    />
  </div>
</template>

<style scoped>
/* Table section spacing and transitions */
.table-section {
  scroll-margin-top: 5rem;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.space-y-8 > * + * {
  margin-top: 2rem;
}

/* Fade transition for filtered tables */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Ensure table cells are properly styled */
table {
  border-spacing: 0;
}

/* Multi-line cell styling */
.multi-line-cell {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.cell-line {
  padding: 0.25rem 0;
}

.cell-line:first-child {
  font-weight: 500;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding-bottom: 0.5rem;
  margin-bottom: 0.25rem;
}

.cell-line:last-child {
  font-weight: 400;
  opacity: 0.8;
  font-size: 0.9em;
}

/* Highlighted text (articles and endings) */
.table-cell :deep(b) {
  font-weight: 700;
  color: inherit;
  background: rgba(0, 0, 0, 0.08);
  padding: 0.1em 0.2em;
  border-radius: 2px;
}

/* Color-coded adjective endings */
.table-cell :deep(.ending-e) {
  font-weight: 700;
  color: #7c3aed;
  background: rgba(124, 58, 237, 0.15);
  padding: 0.1em 0.3em;
  border-radius: 3px;
}

.table-cell :deep(.ending-en) {
  font-weight: 700;
  color: #dc2626;
  background: rgba(220, 38, 38, 0.15);
  padding: 0.1em 0.3em;
  border-radius: 3px;
}

.table-cell :deep(.ending-er) {
  font-weight: 700;
  color: #2563eb;
  background: rgba(37, 99, 235, 0.15);
  padding: 0.1em 0.3em;
  border-radius: 3px;
}

.table-cell :deep(.ending-es) {
  font-weight: 700;
  color: #16a34a;
  background: rgba(22, 163, 74, 0.15);
  padding: 0.1em 0.3em;
  border-radius: 3px;
}

/* Mobile touch targets */
@media (max-width: 480px) {
  .table-cell {
    min-height: 44px;
    min-width: 44px;
  }
}

/* Smooth hover effect */
.table-cell:active {
  transform: scale(0.98);
}

/* Add subtle shadow on hover for tables */
.table-section:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
}
</style>
