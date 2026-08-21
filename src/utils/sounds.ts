let ctx: AudioContext | null = null

function ac(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function tone(
  freq: number,
  dur: number,
  vol = 0.25,
  type: OscillatorType = 'sine',
  delay = 0,
  freqEnd?: number,
) {
  const c = ac()
  const t = c.currentTime + delay
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.connect(gain)
  gain.connect(c.destination)
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  if (freqEnd !== undefined) osc.frequency.exponentialRampToValueAtTime(freqEnd, t + dur)
  gain.gain.setValueAtTime(0, t)
  gain.gain.linearRampToValueAtTime(vol, t + 0.005)
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur)
  osc.start(t)
  osc.stop(t + dur + 0.01)
}

export function playMove() {
  tone(1100, 0.045, 0.10, 'triangle')
}

export function playCapture() {
  // Low impact thud + sharp click
  tone(180, 0.18, 0.42, 'sine', 0, 50)
  tone(900, 0.03, 0.08, 'triangle', 0.01)
}

export function playCheck() {
  // Two urgent high beeps
  tone(1000, 0.07, 0.18, 'square', 0)
  tone(1000, 0.07, 0.18, 'square', 0.13)
}

export function playPower() {
  // Rising sawtooth whoosh
  tone(180, 0.32, 0.18, 'sawtooth', 0, 700)
}

export function playWin() {
  // C4 → E4 → G4 → C5 fanfare, then chord
  const notes = [261.63, 329.63, 392, 523.25]
  notes.forEach((f, i) => tone(f, 0.28, 0.22, 'sine', i * 0.16))
  setTimeout(() => {
    tone(261.63, 0.6, 0.16, 'sine')
    tone(392,    0.6, 0.16, 'sine')
    tone(523.25, 0.6, 0.16, 'sine')
  }, notes.length * 160)
}

export function playLose() {
  // Descending minor phrase
  tone(392,    0.28, 0.20, 'sine', 0)
  tone(311.13, 0.35, 0.17, 'sine', 0.26)
  tone(246.94, 0.50, 0.14, 'sine', 0.56)
}

export function playTimerTick() {
  tone(1600, 0.022, 0.07, 'square')
}
