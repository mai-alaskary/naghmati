// محرك صوت بسيط مبني على Web Audio API — لا يحتاج إلى ملفات صوتية.

let ctx: AudioContext | null = null
let master: GainNode | null = null
let noiseBuffer: AudioBuffer | null = null

export function getAudio() {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC = window.AudioContext || (window as any).webkitAudioContext
    ctx = new AC()
    master = ctx.createGain()
    master.gain.value = 0.8
    master.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return { ctx, out: master! }
}

export function setMasterVolume(v: number) {
  const a = getAudio()
  if (a) a.out.gain.setTargetAtTime(v, a.ctx.currentTime, 0.02)
}

export function midiToFreq(midi: number) {
  return 440 * Math.pow(2, (midi - 69) / 12)
}

/** نغمة بيانو تبقى مستمرة حتى يتم استدعاء الدالة المعادة لإيقافها */
export function startPianoNote(midi: number) {
  const a = getAudio()
  if (!a) return () => {}
  const { ctx, out } = a
  const t = ctx.currentTime
  const f = midiToFreq(midi)
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0, t)
  gain.gain.linearRampToValueAtTime(0.35, t + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.18, t + 0.4)
  gain.gain.exponentialRampToValueAtTime(0.08, t + 3)
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = Math.min(f * 6, 9000)
  filter.connect(gain)
  gain.connect(out)
  const oscs = [
    { type: 'triangle' as OscillatorType, mul: 1, vol: 1 },
    { type: 'sine' as OscillatorType, mul: 2, vol: 0.3 },
    { type: 'sine' as OscillatorType, mul: 3, vol: 0.08 },
  ].map(({ type, mul, vol }) => {
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = type
    o.frequency.value = f * mul
    g.gain.value = vol
    o.connect(g)
    g.connect(filter)
    o.start(t)
    return o
  })
  let stopped = false
  return () => {
    if (stopped) return
    stopped = true
    const now = ctx.currentTime
    gain.gain.cancelScheduledValues(now)
    gain.gain.setValueAtTime(gain.gain.value, now)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35)
    oscs.forEach((o) => o.stop(now + 0.4))
  }
}

/** صوت قطعة إكسيليفون (مطرقة على خشب/معدن) */
export function playMallet(midi: number) {
  const a = getAudio()
  if (!a) return
  const { ctx, out } = a
  const t = ctx.currentTime
  const f = midiToFreq(midi)
  ;[
    [1, 0.5, 1.2],
    [4, 0.12, 0.25],
    [10, 0.04, 0.08],
  ].forEach(([mul, vol, dur]) => {
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'sine'
    o.frequency.value = f * mul
    g.gain.setValueAtTime(vol, t)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    o.connect(g)
    g.connect(out)
    o.start(t)
    o.stop(t + dur + 0.05)
  })
}

function noise(ctx: AudioContext) {
  if (!noiseBuffer) {
    noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
    const d = noiseBuffer.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  }
  const src = ctx.createBufferSource()
  src.buffer = noiseBuffer
  return src
}

function drumTone(ctx: AudioContext, out: AudioNode, t: number, from: number, to: number, dur: number, vol: number) {
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  o.type = 'sine'
  o.frequency.setValueAtTime(from, t)
  o.frequency.exponentialRampToValueAtTime(to, t + dur * 0.8)
  g.gain.setValueAtTime(vol, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g)
  g.connect(out)
  o.start(t)
  o.stop(t + dur + 0.05)
}

function noiseHit(
  ctx: AudioContext,
  out: AudioNode,
  t: number,
  filterType: BiquadFilterType,
  freq: number,
  dur: number,
  vol: number,
) {
  const n = noise(ctx)
  const f = ctx.createBiquadFilter()
  f.type = filterType
  f.frequency.value = freq
  const g = ctx.createGain()
  g.gain.setValueAtTime(vol, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  n.connect(f)
  f.connect(g)
  g.connect(out)
  n.start(t)
  n.stop(t + dur + 0.05)
}

export type DrumKind = 'rahmani' | 'kasir' | 'tar' | 'msondo' | 'clap' | 'tambourine'

export function playDrum(kind: DrumKind, when = 0) {
  const a = getAudio()
  if (!a) return
  const { ctx, out } = a
  const t = when || ctx.currentTime
  switch (kind) {
    case 'rahmani': // طبل كبير بصوت غليظ
      drumTone(ctx, out, t, 140, 48, 0.7, 1)
      noiseHit(ctx, out, t, 'lowpass', 400, 0.08, 0.3)
      break
    case 'kasir': // طبل أصغر بصوت حاد
      drumTone(ctx, out, t, 330, 190, 0.18, 0.5)
      noiseHit(ctx, out, t, 'bandpass', 2200, 0.15, 0.6)
      break
    case 'tar': // دف/طار
      drumTone(ctx, out, t, 260, 140, 0.3, 0.6)
      noiseHit(ctx, out, t, 'highpass', 3000, 0.12, 0.25)
      break
    case 'msondo': // طبل طويل
      drumTone(ctx, out, t, 220, 90, 0.45, 0.8)
      noiseHit(ctx, out, t, 'bandpass', 900, 0.06, 0.3)
      break
    case 'clap': // تصفيق
      ;[0, 0.012, 0.024].forEach((d) => noiseHit(ctx, out, t + d, 'bandpass', 1300, 0.09, 0.6))
      noiseHit(ctx, out, t + 0.03, 'bandpass', 1100, 0.2, 0.3)
      break
    case 'tambourine': // جلاجل
      noiseHit(ctx, out, t, 'highpass', 7000, 0.25, 0.5)
      noiseHit(ctx, out, t + 0.04, 'highpass', 8000, 0.18, 0.3)
      break
  }
}

/** أصوات التغذية الراجعة في الاختبارات */
export function playCorrect() {
  ;[72, 76, 79, 84].forEach((m, i) => setTimeout(() => playMallet(m), i * 90))
}

export function playWrong() {
  ;[60, 56].forEach((m, i) => setTimeout(() => playMallet(m), i * 160))
}


/** نقرة خفيفة عند التفاعل مع عناصر المنصة */
export function playClick() {
  const a = getAudio()
  if (!a) return
  const { ctx, out } = a
  const t = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(1050, t)
  osc.frequency.exponentialRampToValueAtTime(620, t + 0.035)
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(0.12, t + 0.004)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.045)
  osc.connect(gain)
  gain.connect(out)
  osc.start(t)
  osc.stop(t + 0.05)
}
