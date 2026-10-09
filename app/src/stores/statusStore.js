import { defineStore } from 'pinia'
import { api } from '../lib/api'

// Global learner status shown in the header (phase, running block timer).
export const useStatusStore = defineStore('kaskadeStatus', {
  state: () => ({ phase: null, running: null, loaded: false, error: null }),
  actions: {
    async load() {
      try {
        const s = await api.get('/status')
        this.phase = s.phase
        this.running = s.running
        this.error = null
      } catch (e) {
        this.error = e.message
      }
      this.loaded = true
    },
    async startTimer(block) {
      const r = await api.post('/activity/start', { block })
      this.running = r
      return r
    },
    async stopTimer() {
      await api.post('/activity/stop')
      this.running = null
    }
  }
})
