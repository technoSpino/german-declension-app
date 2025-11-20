/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Katyella.com brand colors
        'katyella-violet': {
          DEFAULT: '#7c3aed',
          dark: '#6d28d9',
          light: '#8b5cf6',
        },
        'katyella-blue': {
          DEFAULT: '#2563eb',
          dark: '#1d4ed8',
          light: '#60a5fa',
          bg: '#dbeafe',
        },
        // Educational case colors
        'case-nom': {
          light: '#E3F2FD',
          DEFAULT: '#2196F3',
        },
        'case-akk': {
          light: '#FFEBEE',
          DEFAULT: '#F44336',
        },
        'case-dat': {
          light: '#E8F5E9',
          DEFAULT: '#4CAF50',
        },
        'case-gen': {
          light: '#FFF3E0',
          DEFAULT: '#FF9800',
        },
        // Text colors
        'text-primary': '#0f172a',
        'text-secondary': '#475569',
        'text-light': '#6b7280',
        'text-muted': '#9ca3af',
      },
    },
  },
  plugins: [],
}
