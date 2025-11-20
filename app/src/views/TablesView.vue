<script setup>
import { ref } from 'vue';
import { tables, getCaseClass, getGenderLabel } from '../data/declensionTables.js';
import examples from '../data/examples.js';
import ExampleModal from '../components/ExampleModal.vue';

// Selected table
const selectedTable = ref('definiteArticle');

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
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-5xl mx-auto">
      <!-- Header -->
      <header class="text-center mb-8">
        <h1 class="text-4xl font-bold text-text-primary mb-2">
          German Declension Tables
        </h1>
        <p class="text-text-secondary">
          Color-coded reference for A2 learners
        </p>
      </header>

      <!-- Table Selection -->
      <div class="card mb-8">
        <h2 class="text-lg font-semibold text-text-primary mb-4">
          Select a table:
        </h2>
        <div class="space-y-3">
          <label
            v-for="[key, table] in tableEntries"
            :key="key"
            class="flex items-start p-4 rounded-lg border-2 transition-all cursor-pointer hover:bg-gray-50"
            :class="[
              selectedTable === key
                ? 'border-katyella-violet bg-purple-50'
                : 'border-gray-200'
            ]"
          >
            <input
              type="radio"
              :value="key"
              v-model="selectedTable"
              class="mt-1 w-5 h-5 text-katyella-violet focus:ring-katyella-violet"
            />
            <div class="ml-3 flex-1">
              <div class="font-semibold text-text-primary">
                {{ table.name }}
              </div>
              <div class="text-sm text-text-secondary mt-1">
                {{ table.description }}
              </div>
            </div>
          </label>
        </div>
      </div>

      <!-- Tables Display -->
      <Transition name="fade" mode="out-in">
        <div :key="selectedTable" class="card">
          <div class="mb-6">
            <h2 class="text-2xl font-bold text-text-primary mb-2">
              {{ tables[selectedTable].name }}
            </h2>
            <p class="text-text-secondary">
              {{ tables[selectedTable].description }}
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
                  v-for="(row, rowIndex) in tables[selectedTable].grid"
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
                    @click="handleCellClick(cell, row[0], cellIndex)"
                  >
                    {{ cell }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Click hint -->
          <div class="mt-6 text-center text-sm text-text-muted">
            Click any cell to see example sentences
          </div>
        </div>
      </Transition>

      <!-- Legend -->
      <div class="card mt-8">
        <h3 class="text-lg font-semibold text-text-primary mb-4">
          Case Colors:
        </h3>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div class="flex items-center">
            <div class="w-4 h-4 rounded border-2 border-case-nom bg-case-nom-light mr-2"></div>
            <span class="text-sm text-text-secondary">Nominativ</span>
          </div>
          <div class="flex items-center">
            <div class="w-4 h-4 rounded border-2 border-case-akk bg-case-akk-light mr-2"></div>
            <span class="text-sm text-text-secondary">Akkusativ</span>
          </div>
          <div class="flex items-center">
            <div class="w-4 h-4 rounded border-2 border-case-dat bg-case-dat-light mr-2"></div>
            <span class="text-sm text-text-secondary">Dativ</span>
          </div>
          <div class="flex items-center">
            <div class="w-4 h-4 rounded border-2 border-case-gen bg-case-gen-light mr-2"></div>
            <span class="text-sm text-text-secondary">Genitiv</span>
          </div>
        </div>
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
/* Fade transition for table switching */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Ensure table cells are properly styled */
table {
  border-spacing: 0;
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
</style>
