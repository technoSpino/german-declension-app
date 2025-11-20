<script setup>
import { tables, getCaseClass } from '../data/declensionTables.js';

// Get all table entries as array
const tableEntries = Object.entries(tables);
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
        <div
          v-for="([key, table], index) in tableEntries"
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
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Table section spacing */
.table-section {
  scroll-margin-top: 5rem;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.space-y-8 > * + * {
  margin-top: 2rem;
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
