import { useState } from 'react'

const COLORS = [
  { name: 'أحمر', value: '#d8232a' },
  { name: 'أبيض', value: '#ffffff' },
  { name: 'أخضر', value: '#00843d' },
]

export default function FlagColoring({ onComplete }: { onComplete?: () => void }) {
  const [color, setColor] = useState(COLORS[0].value)
  const [fills, setFills] = useState<Record<string, string>>({})
  const [eraser, setEraser] = useState(false)
  const [checked, setChecked] = useState(false)
  const correct = fills.pole === '#d8232a' && fills.top === '#ffffff' && fills.middle === '#d8232a' && fills.bottom === '#00843d'
  const paint = (part: string) => { setFills((old) => ({ ...old, [part]: eraser ? 'transparent' : color })); setChecked(false) }

  const parts = [
    // Align paintable overlays with the three actual flag bands in the uploaded template.
    // The red vertical hoist also runs behind the emblem; a translucent overlay keeps the original emblem visible.
    { id: 'pole', label: 'الشريط الأحمر خلف الخنجر والسيفين', style: { left: '1.5%', top: '6%', width: '32.2%', height: '88%' } },
    { id: 'top', label: 'الشريط العلوي', style: { left: '33.7%', top: '6%', width: '64.5%', height: '27.5%' } },
    { id: 'middle', label: 'الشريط الأوسط', style: { left: '33.7%', top: '35.5%', width: '64.5%', height: '28%' } },
    { id: 'bottom', label: 'الشريط السفلي', style: { left: '33.7%', top: '65.5%', width: '64.5%', height: '28%' } },
  ]

  return (
    <div className="rounded-3xl bg-white p-4 md:p-5 border-2 border-amber-200">
      <h3 className="text-xl font-extrabold mb-2">🎨 لوّن علم عُمان</h3>
      <p className="text-ink/60 mb-3">اختَر لونًا ثم اضغط على جزء من نموذج العلم الأصلي. شكل الخنجر والسيفين محفوظ كما في الصورة.</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {COLORS.map((c) => <button type="button" key={c.name} onClick={() => { setColor(c.value); setEraser(false) }} className={`rounded-full border-2 px-4 py-2 font-bold ${color === c.value && !eraser ? 'border-violet-500 ring-2 ring-violet-200' : 'border-ink/10'}`}><span className="inline-block w-4 h-4 rounded-full border border-ink/20 align-middle ml-2" style={{ background: c.value }} />{c.name}</button>)}
        <button type="button" onClick={() => setEraser(true)} className={`rounded-full border-2 px-4 py-2 font-bold ${eraser ? 'border-violet-500 bg-violet-100' : 'border-ink/10'}`}>🧽 ممحاة</button>
        <button type="button" onClick={() => { setFills({}); setChecked(false) }} className="rounded-full bg-ink/5 px-4 py-2 font-bold">↺ مسح الكل</button>
      </div>
      <div className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-xl border border-ink/10">
        <img src="https://raw.githubusercontent.com/arnoha98-hash/naghmati/main/oman-flag-coloring.jpg" alt="نموذج تلوين علم سلطنة عُمان الأصلي بالخنجر والسيفين" className="block w-full h-auto" style={{ position: 'relative', zIndex: 0 }} />
        {parts.map((part) => <button type="button" key={part.id} aria-label={part.label} title={part.label} onClick={() => paint(part.id)} className="absolute border-0 p-0" style={{ ...part.style, backgroundColor: fills[part.id] ?? 'transparent', opacity: fills[part.id] ? 0.48 : 1, cursor: 'pointer' }} />)}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => { setChecked(true); if (correct) onComplete?.() }} className="rounded-full bg-violet-600 px-5 py-3 font-extrabold text-white shadow">تأكّد من التلوين ✓</button>
        {checked && <p role="status" aria-live="polite" className={`rounded-xl px-4 py-3 font-extrabold ${correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}`}>{correct ? 'إجابة صحيحة! أحسنت، لوّنت العلم بالترتيب الصحيح 🎉' : 'إجابة غير صحيحة. راجع الألوان وحاول مرة أخرى.'}</p>}
      </div>
      <p className="mt-3 text-sm text-ink/60">لوّن الأجزاء الأربعة ثم اضغط «تأكّد من التلوين». الترتيب الصحيح: الشريط الرأسي أحمر، العلوي أبيض، الأوسط أحمر، والسفلي أخضر. لإعادة البداية، اضغط «مسح الكل».</p>
    </div>
  )
}
