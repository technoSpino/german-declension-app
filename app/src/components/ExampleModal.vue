<script setup>
import { onMounted, onUnmounted, watch } from 'vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  formText: {
    type: String,
    required: true
  },
  caseType: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    required: true
  },
  examples: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['close']);

// Close modal on ESC key
const handleEscape = (e) => {
  if (e.key === 'Escape' && props.isOpen) {
    emit('close');
  }
};

// Close modal on outside click
const handleOutsideClick = (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    emit('close');
  }
};

// Map case type to color class
const getCaseColorClass = (caseType) => {
  const colorMap = {
    'Nom': 'text-case-nom border-case-nom',
    'Akk': 'text-case-akk border-case-akk',
    'Dat': 'text-case-dat border-case-dat',
    'Gen': 'text-case-gen border-case-gen'
  };
  return colorMap[caseType] || '';
};

// Map case type to background class
const getCaseBgClass = (caseType) => {
  const bgMap = {
    'Nom': 'bg-case-nom-light',
    'Akk': 'bg-case-akk-light',
    'Dat': 'bg-case-dat-light',
    'Gen': 'bg-case-gen-light'
  };
  return bgMap[caseType] || '';
};

// Get full case name
const getFullCaseName = (caseType) => {
  const caseNames = {
    'Nom': 'Nominativ',
    'Akk': 'Akkusativ',
    'Dat': 'Dativ',
    'Gen': 'Genitiv'
  };
  return caseNames[caseType] || caseType;
};

// Get full gender name
const getFullGenderName = (gender) => {
  const genderNames = {
    'M': 'Masculine',
    'F': 'Feminine',
    'N': 'Neuter',
    'Pl': 'Plural'
  };
  return genderNames[gender] || gender;
};

// Add/remove event listeners
onMounted(() => {
  document.addEventListener('keydown', handleEscape);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape);
});

// Prevent body scroll when modal is open
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="modal-overlay"
        @click="handleOutsideClick"
      >
        <div class="modal-content">
          <!-- Header -->
          <div class="flex items-start justify-between mb-6">
            <div class="flex-1">
              <div
                :class="[
                  'inline-block px-4 py-2 rounded-lg border-l-4 mb-2',
                  getCaseColorClass(caseType),
                  getCaseBgClass(caseType)
                ]"
              >
                <span class="text-3xl font-bold">{{ formText }}</span>
              </div>
              <div class="text-sm text-text-secondary">
                {{ getFullCaseName(caseType) }}, {{ getFullGenderName(gender) }}
              </div>
            </div>
            <button
              @click="emit('close')"
              class="ml-4 text-text-secondary hover:text-text-primary transition-colors p-2 hover:bg-gray-100 rounded-lg"
              aria-label="Close modal"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <!-- Examples -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-text-primary mb-4">
              Examples:
            </h3>
            <div class="space-y-4">
              <div
                v-for="(example, index) in examples"
                :key="index"
                class="p-4 bg-gray-50 rounded-lg border-l-4"
                :class="getCaseColorClass(caseType).split(' ')[1]"
              >
                <p class="text-text-primary font-medium mb-1">
                  {{ example.split('(')[0].trim() }}
                </p>
                <p class="text-text-secondary text-sm italic">
                  {{ example.match(/\((.*?)\)/)?.[1] || '' }}
                </p>
              </div>
            </div>
          </div>

          <!-- Close Button -->
          <div class="flex justify-end">
            <button
              @click="emit('close')"
              class="btn-primary"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Modal transition animations */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.95);
  opacity: 0;
}

.modal-enter-to .modal-content,
.modal-leave-from .modal-content {
  transform: scale(1);
  opacity: 1;
}
</style>
