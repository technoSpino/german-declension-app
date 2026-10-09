import { defineStore } from 'pinia'
import { api } from '../lib/api'

// Global learner status shown in the header (phase etc.).
export const useStatusStore = defineStore('kaskadeStatus', {
  state: () => ({ phase: null, loaded: false, error: null }),
  actions: {
    async load() {
      try {
        const s = await api.get('/status')
        this.phase = s.phase
        this.error = null
      } catch (e) {
        this.error = e.message
      }
      this.loaded = true
    }
  }
})
