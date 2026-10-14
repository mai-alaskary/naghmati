import { useState } from 'react'

type NoteName = 'دو' | 'ري' | 'مي' | 'فا' | 'صول' | 'لا' | 'سي'
type BalloonNote = { id: string; name: NoteName; color: string; colorName: string; y: number; x: number }
type QuizNote = { id: number; name: NoteName; y: number; options: [NoteName, NoteName] }

const balloons: BalloonNote[] = [
  { id: 'mi', name: 'مي', color: '#ef4444', colorName: 'الأحمر', y: 128, x: 70 },
  { id: 'sol', name: 'صول', color: '#3b82f6', colorName: 'الأزرق', y: 116, x: 180 },
  { id: 'fa', name: 'فا', color: '#eab308', colorName: 'الأصفر', y: 122, x: 290 },
  { id: 'la', name: 'لا', color: '#22c55e', colorName: 'الأخضر', y: 110, x: 400 },
]

const quizNotes: QuizNote[] = [
  { id: 1, name: 'مي', y: 140, options: ['مي', 'صول'] },
  { id: 2, name: 'صول', y: 125, options: ['لا', 'صول'] },
  { id: 3, name: 'فا', y: 132.5, options: ['فا', 'مي'] },
  { id: 4, name: 'لا', y: 117.5, options: ['صول', 'لا'] },
  { id: 5, name: 'سي', y: 110, options: ['دو', 'سي'] },
  { id: 6, name: 'ري', y: 95, options: ['ري', 'فا'] },
  { id: 7, name: 'دو', y: 102.5, options: ['سي', 'دو'] },
]

const palette = [
  { name: 'الأحمر', value: '#ef4444', note: 'مي' as NoteName },
  { name: 'الأزرق', value: '#3b82f6', note: 'صول' as NoteName },
  { name: 'الأصفر', value: '#eab308', note: 'فا' as NoteName },
  { name: 'الأخضر', value: '#22c55e', note: 'لا' as NoteName },
]

function playNote(index: number) {
  try {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return
    const context = new AudioContextClass()
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.type = 'sine'
    oscillator.frequency.value = [261.63, 293.66, 329.63, 349.23, 392, 440, 493.88][index % 7]
    gain.gain.setValueAtTime(0.0001, context.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.18, context.currentTime + 0.025)
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.45)
    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start()
    oscillator.stop(context.currentTime + 0.46)
    oscillator.onended = () => { void context.close() }
  } catch {
    // Audio feedback is optional when the browser blocks audio playback.
  }
}

function Staff({ noteY, balloon = false }: { noteY: number; balloon?: boolean }) {
  const lines = balloon ? [80, 95, 110, 125, 140] : [80, 95, 110, 125, 140]
  return <svg viewBox="0 0 180 160" className="mx-auto block w-full max-w-[180px]" role="img" aria-label="نغمة مرسومة على مدرج موسيقي بمفتاح صول">
    {lines.map(y => <line key={y} x1="12" x2="168" y1={y} y2={y} stroke="#334155" strokeWidth="1.6" />)}
    <text x="17" y="126" fontSize="57" fill="#1e293b">𝄞</text>
    <ellipse cx="112" cy={noteY} rx="8" ry="5.5" transform={`rotate(-20 112 ${noteY})`} fill="#111827" />
    {noteY === 140 && <line x1="100" x2="124" y1="140" y2="140" stroke="#334155" strokeWidth="1.6" />}
    {noteY === 102.5 && <line x1="100" x2="124" y1="102.5" y2="102.5" stroke="#334155" strokeWidth="1.6" />}
  </svg>
}

export default function StaffBookActivities() {
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [colored, setColored] = useState<Record<string, string>>({})
  const [balloonFeedback, setBalloonFeedback] = useState('')
  const [answers, setAnswers] = useState<Record<number, NoteName>>({})
  const [quizFeedback, setQuizFeedback] = useState<Record<number, string>>({})
  const [retry, setRetry] = useState<Record<number, boolean>>({})
  const correctCount = quizNotes.filter(q => answers[q.id] === q.name).length

  function colorBalloon(balloon: BalloonNote) {
    if (!selectedColor) {
      setBalloonFeedback('اختَر فرشاة لون من لوحة الألوان أولًا، ثم اضغط على البالون.')
      return
    }
    const color = palette.find(p => p.value === selectedColor)
    if (color?.note === balloon.name) {
      setColored(old => ({ ...old, [balloon.id]: selectedColor }))
      setBalloonFeedback(`أحسنت! نغمة ${balloon.name} لونها ${color.name} ⭐🎉`)
      setSelectedColor(null)
    } else {
      setBalloonFeedback(`جرّب مرة أخرى! نغمة ${balloon.name} تحتاج اللون المطابق لها في دليل الألوان.`)
    }
  }

  function answerQuestion(q: QuizNote, option: NoteName) {
    if (answers[q.id] === q.name) return
    if (option === q.name) {
      setAnswers(old => ({ ...old, [q.id]: option }))
      setQuizFeedback(old => ({ ...old, [q.id]: 'إجابة صحيحة! استمع إلى النغمة 🎵' }))
      setRetry(old => ({ ...old, [q.id]: false }))
      playNote(['دو', 'ري', 'مي', 'فا', 'صول', 'لا', 'سي'].indexOf(q.name))
    } else {
      setQuizFeedback(old => ({ ...old, [q.id]: 'ليست هذه النغمة؛ تأمّل موضعها على المدرج وحاول مرة أخرى.' }))
      setRetry(old => ({ ...old, [q.id]: true }))
    }
  }

  return <div className="space-y-6">
    <p className="text-slate-700">أنشطة تفاعلية من الكتاب: لوّن البالونات حسب دليل الألوان، ثم تعرّف على أسماء النغمات من مواضعها على المدرج الموسيقي.</p>

    <section className="rounded-2xl border-2 border-sky-200 bg-sky-50 p-4 sm:p-5">
      <h4 className="text-xl font-extrabold text-sky-950">🎈 النشاط الأول: تلوين النغمات داخل البالونات</h4>
      <p className="my-2 text-sm leading-7 text-slate-700">اختر اللون من الفرش أسفل اللوحة، اقرأ النغمة المرسومة داخل البالون، ثم اضغط على البالون لتلوينه. إذا أخطأت، ستظهر لك رسالة تساعدك على التصحيح.</p>
      <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl border border-sky-200 bg-white p-3 sm:grid-cols-4">
        {palette.map(p => <div key={p.note} className="flex items-center gap-2 rounded-lg bg-slate-50 p-2">
          <span className="h-5 w-5 shrink-0 rounded-full border border-black/10" style={{ backgroundColor: p.value }} />
          <span className="font-bold text-slate-800">{p.note} = {p.name}</span>
        </div>)}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {balloons.map(b => <button key={b.id} type="button" onClick={() => colorBalloon(b)} className="group rounded-xl border-2 border-transparent bg-white p-2 text-center transition hover:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-500" aria-label={`تلوين بالون نغمة ${b.name}`}>
          <svg viewBox="0 0 180 230" className="mx-auto w-full max-w-[190px]">
            <path d="M90 151 C88 168 100 179 89 194 C81 204 97 212 88 224" fill="none" stroke="#64748b" strokeWidth="1.7" />
            <path d="M90 28 C57 28 37 53 40 84 C43 112 64 139 84 151 L90 159 L97 151 C118 137 138 110 140 83 C143 52 122 28 90 28Z" fill={colored[b.id] || '#ffffff'} stroke={colored[b.id] ? colored[b.id] : '#64748b'} strokeWidth="2.5" />
            <path d="M84 151 L90 162 L97 151Z" fill={colored[b.id] || '#ffffff'} stroke={colored[b.id] || '#64748b'} strokeWidth="1.5" />
            <path d="M58 58 Q62 47 73 44" fill="none" stroke={colored[b.id] ? '#ffffff' : '#cbd5e1'} strokeWidth="4" strokeLinecap="round" />
            <g transform="translate(0 8)"><rect x="42" y="64" width="96" height="67" rx="7" fill="#ffffff" stroke="#e2e8f0" />
              {[80, 92, 104, 116, 128].map(y => <line key={y} x1="49" x2="131" y1={y-8} y2={y-8} stroke="#64748b" strokeWidth="1" />)}
              <text x="49" y="111" fontSize="31" fill="#1e293b">𝄞</text>
              <ellipse cx="103" cy={b.y-8} rx="6.5" ry="4.5" transform={`rotate(-20 103 ${b.y-8})`} fill="#111827" />
              {b.y === 139 && <line x1="94" x2="113" y1="131" y2="131" stroke="#64748b" strokeWidth="1" />}
            </g>
            {colored[b.id] && <text x="90" y="25" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#16a34a">★</text>}
          </svg>
          <span className="mt-1 block font-extrabold text-slate-800">{colored[b.id] ? 'أحسنت! ⭐' : 'اضغط لتلوين البالون'}</span>
        </button>)}
      </div>
      <div className="mt-4">
        <p className="mb-2 font-extrabold text-slate-800">لوحة الألوان — اختر فرشاة:</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {palette.map(p => <button key={p.note} type="button" onClick={() => { setSelectedColor(p.value); setBalloonFeedback(`اخترت اللون ${p.name}. اضغط على البالون الذي يحمل نغمة ${p.note}.`) }} className={`flex items-center justify-center gap-2 rounded-xl border-2 px-3 py-3 font-extrabold transition ${selectedColor === p.value ? 'border-slate-900 ring-2 ring-slate-400' : 'border-white'}`} style={{ backgroundColor: p.value, color: p.note === 'فا' ? '#422006' : '#ffffff' }}>
            <span className="text-xl">🖌️</span>{p.name}
          </button>)}
        </div>
      </div>
      <p className="mt-3 min-h-7 font-bold text-sky-950" role="status">{balloonFeedback || `لوّنت ${Object.keys(colored).length} من 4 بالونات.`}</p>
      {Object.keys(colored).length === 4 && <p className="rounded-xl bg-emerald-100 p-3 text-center font-extrabold text-emerald-800">رائع! أكملت تلوين كل البالونات بالألوان الصحيحة! 🌟👏</p>}
      <button type="button" onClick={() => { setColored({}); setSelectedColor(null); setBalloonFeedback('') }} className="mt-2 rounded-xl border border-slate-300 bg-white px-4 py-2 font-bold text-slate-700">إعادة نشاط التلوين</button>
    </section>

    <section className="rounded-2xl border-2 border-rose-200 bg-rose-50 p-4 sm:p-5">
      <h4 className="text-xl font-extrabold text-rose-950">💗 النشاط الثاني: اختر اسم النغمة الصحيح</h4>
      <p className="my-2 text-sm leading-7 text-slate-700">تأمّل النغمة على المدرج الموسيقي بمفتاح صول، ثم اضغط على اسمها الصحيح من الخيارين. الإجابة الصحيحة تضيء بالأخضر ويُسمع صوت النغمة، ويمكنك المحاولة مجددًا عند الخطأ.</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {quizNotes.map(q => <article key={q.id} className="rounded-2xl border-2 border-rose-100 bg-white p-3 shadow-sm">
          <div className="mb-1 flex items-center justify-between">
            <span className="rounded-full bg-rose-100 px-3 py-1 text-sm font-extrabold text-rose-900">السؤال {q.id}</span>
            {answers[q.id] === q.name && <span className="font-extrabold text-emerald-700">✓ صحيح</span>}
          </div>
          <Staff noteY={q.y} />
          <div className="mt-2 grid grid-cols-2 gap-2">
            {q.options.map((option, i) => {
              const isCorrect = answers[q.id] === q.name && option === q.name
              const isWrong = retry[q.id] && quizFeedback[q.id] && option !== q.name
              return <button key={option} type="button" onClick={() => answerQuestion(q, option)} disabled={answers[q.id] === q.name} className={`rounded-full border-2 px-3 py-2 font-extrabold transition ${isCorrect ? 'border-emerald-600 bg-emerald-100 text-emerald-900 ring-2 ring-emerald-300' : isWrong ? 'border-rose-500 bg-rose-100 text-rose-900' : 'border-rose-200 bg-rose-50 text-rose-900 hover:border-rose-400 hover:bg-rose-100'} disabled:cursor-default`}>
                {option}
              </button>
            })}
          </div>
          <p className={`mt-2 min-h-10 text-sm font-bold ${answers[q.id] === q.name ? 'text-emerald-700' : retry[q.id] ? 'text-rose-700' : 'text-slate-500'}`} role="status">{quizFeedback[q.id] || 'اختر الإجابة الصحيحة.'}</p>
        </article>)}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-3">
        <p className="font-extrabold text-rose-950">النتيجة: {correctCount} من 7 أسئلة صحيحة</p>
        <button type="button" onClick={() => { setAnswers({}); setQuizFeedback({}); setRetry({}) }} className="rounded-xl border-2 border-rose-200 bg-rose-50 px-4 py-2 font-bold text-rose-900">إعادة الأسئلة</button>
      </div>
      {correctCount === 7 && <p className="mt-3 rounded-xl bg-emerald-100 p-3 text-center font-extrabold text-emerald-800">ممتاز! تعرّفت على النغمات السبع بنجاح! 🎉🎶</p>}
    </section>
  </div>
}
