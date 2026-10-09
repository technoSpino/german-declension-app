// Audio for sentences. Prefers server TTS files (Piper, M6) and falls back to
// the browser's German speech synthesis.

export function canSpeak() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

let current = null

export function speak(text, { url } = {}) {
  if (current) {
    current.pause()
    current = null
  }
  if (url) {
    current = new Audio(url)
    current.play().catch(() => speakBrowser(text))
    return
  }
  speakBrowser(text)
}

function speakBrowser(text) {
  if (!canSpeak()) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'de-DE'
  u.rate = 0.95
  const voice = window.speechSynthesis.getVoices().find((v) => v.lang?.startsWith('de'))
  if (voice) u.voice = voice
  window.speechSynthesis.speak(u)
}
