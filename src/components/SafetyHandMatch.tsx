import { useState, type DragEvent } from 'react'

const phrases = [
  { id: 'bus', text: 'في الحافلة سلامتي بالالتزام تكتمل', color: 'amber' },
  { id: 'street', text: 'في الشارع إشارتي تنظم الطريق لي', color: 'sky' },
  { id: 'health', text: 'نظافتي وصحتي تصونني بالاهتمام', color: 'emerald' },
] as const

const fingers = [
  { id: 'teeth', image: '🪥', label: 'تنظيف الأسنان', phrase: 'health', x: 16, y: 43 },
  { id: 'bus', image: '🚌', label: 'الحافلة المدرسية', phrase: 'bus', x: 33, y: 20 },
  { id: 'line', image: '🧒🏻👧🏻', label: 'الاصطفاف بنظام', phrase: 'bus', x: 50, y: 12 },
  { id: 'traffic', image: '🚦', label: 'إشارة المرور', phrase: 'street', x: 67, y: 20 },
  { id: 'hands', image: '🧼🚰', label: 'غسل اليدين', phrase: 'health', x: 84, y: 43 },
] as const

export default function SafetyHandMatch() {
  const [matches, setMatches] = useState<Record<string, string>>({})
  const [selected, setSelected] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ id: string; correct: boolean } | null>(null)
  const completed = fingers.every((finger) => matches[finger.id] === finger.phrase)
  const place = (fingerId: string, phraseId: string) => {
    const finger = fingers.find((item) => item.id === fingerId)
    if (!finger) return
    const correct = finger.phrase === phraseId
    setFeedback({ id: fingerId, correct })
    if (correct) {
      setMatches((current) => ({ ...current, [fingerId]: phraseId }))
      setSelected(null)
    }
  }
  const drop = (event: DragEvent<HTMLButtonElement>, fingerId: string) => {
    event.preventDefault()
    const phraseId = event.dataTransfer.getData('text/plain')
    if (phraseId) place(fingerId, phraseId)
  }
  return (
    <section dir="rtl" className="mt-5 overflow-hidden rounded-[2rem] border-2 border-sky-200 bg-gradient-to-br from-sky-50 via-white to-amber-50 p-4 md:p-6">
      <header className="text-center">
        <div className="text-4xl" aria-hidden>🖐️ 🚦 🚌</div>
        <h4 className="mt-2 text-xl md:text-2xl font-extrabold text-ink">نشاط كفّ السلامة: صِل العبارة بالإصبع المناسب</h4>
        <p className="mt-2 text-sm md:text-base font-semibold text-ink/65">اسحب كل عبارة إلى الصورة المناسبة على كفّ اليد، أو اضغط العبارة ثم اضغط على الصورة. يمكنك استخدام العبارة أكثر من مرة.</p>
      </header>
      <div className="relative mx-auto mt-5 w-full max-w-3xl">
        <svg viewBox="0 0 600 390" className="block h-auto w-full" role="img" aria-label="كف يد كبيرة مفرودة بخمسة أصابع لاستقبال عبارات السلامة">
          <defs><linearGradient id="safetyHandSkin" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#ffd7ad" /><stop offset="100%" stopColor="#e9a879" /></linearGradient></defs>
          <path d="M175 355 Q150 333 151 285 L153 194 Q154 169 176 168 Q198 168 199 193 L202 248 L205 82 Q206 53 230 53 Q254 53 255 82 L257 238 L262 42 Q264 13 289 13 Q314 13 315 42 L317 239 L323 78 Q325 49 349 50 Q373 51 372 80 L367 252 L383 135 Q387 108 410 112 Q433 116 427 144 L406 286 Q400 337 367 355Z" fill="url(#safetyHandSkin)" stroke="#b96f4c" strokeWidth="7" strokeLinejoin="round" />
          <path d="M185 286 Q208 263 231 280 M257 284 Q282 266 306 282 M322 284 Q346 266 369 281" fill="none" stroke="#d18b62" strokeWidth="5" strokeLinecap="round" opacity=".65"/>
          <path d="M206 355 Q268 370 337 355" fill="none" stroke="#b96f4c" strokeWidth="5" strokeLinecap="round" opacity=".5"/>
        </svg>
        {fingers.map((finger) => {
          const matched = matches[finger.id] === finger.phrase
          const isWrong = feedback?.id === finger.id && !feedback.correct
          return (
            <button key={finger.id} type="button" onDragOver={(event) => event.preventDefault()} onDrop={(event) => drop(event, finger.id)} onClick={() => selected && place(finger.id, selected)}
              className={'absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-[3px] p-1 shadow-lg transition sm:p-2 ' + (matched ? 'border-emerald-500 bg-emerald-50 ring-4 ring-emerald-200' : isWrong ? 'border-rose-500 bg-rose-50' : 'border-amber-400 bg-white hover:scale-105') + (selected ? ' cursor-pointer' : '')}
              style={{ left: finger.x + '%', top: finger.y + '%', width: 'clamp(66px, 15%, 108px)', aspectRatio: '1' }} aria-label={'مكان عبارة ' + finger.label}>
              <span className="text-2xl sm:text-4xl" aria-hidden>{finger.image}</span>
              <span className="mt-0.5 text-[9px] sm:text-xs font-extrabold leading-tight text-center">{finger.label}</span>
              {matched && <span className="absolute -right-1 -top-1 rounded-full bg-emerald-500 px-1.5 text-sm text-white">✓</span>}
            </button>
          )
        })}
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
        {phrases.map((phrase) => <button key={phrase.id} type="button" draggable onDragStart={(event) => event.dataTransfer.setData('text/plain', phrase.id)} onClick={() => { setSelected(phrase.id); setFeedback(null) }} aria-pressed={selected === phrase.id}
          className={'min-h-24 rounded-2xl border-2 p-4 text-base md:text-lg font-extrabold leading-relaxed shadow-sm transition ' + (selected === phrase.id ? 'border-violet-600 bg-violet-100 ring-4 ring-violet-200' : phrase.color === 'amber' ? 'border-amber-300 bg-amber-50' : phrase.color === 'sky' ? 'border-sky-300 bg-sky-50' : 'border-emerald-300 bg-emerald-50')}>
          <span className="mb-1 block text-xl" aria-hidden>{phrase.id === 'bus' ? '🚌' : phrase.id === 'street' ? '🚦' : '🪥🧼'}</span>{phrase.text}
        </button>)}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/90 p-3">
        <p className="font-extrabold text-ink">⭐ اكتمل {fingers.filter((finger) => matches[finger.id] === finger.phrase).length} من 5 مطابقات</p>
        <button type="button" onClick={() => { setMatches({}); setSelected(null); setFeedback(null) }} className="rounded-full border-2 border-slate-200 bg-white px-4 py-2 font-bold">إعادة النشاط ↺</button>
      </div>
      {feedback && <p role="status" className={'mt-3 rounded-xl p-3 text-center font-extrabold ' + (feedback.correct ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-700')}>{feedback.correct ? 'أحسنت! هذه العبارة تناسب الصورة 🌟' : 'حاول مرة أخرى، فكّر في الصورة جيدًا 💪'}</p>}
      {completed && <div role="status" className="mt-3 rounded-2xl border-2 border-emerald-300 bg-emerald-100 p-4 text-center text-xl font-extrabold text-emerald-800">🎉 رائع! أكملت جميع المطابقات بنجاح!</div>}
    </section>
  )
}
