import { useEffect, useState } from 'react'
import type { Lesson } from '@/content/curriculum'
import { playCorrect, playWrong } from '@/lib/audio'
import { canSpeak, speak } from '@/lib/speech'
import RhythmFigure from '@/components/RhythmFigure'

type Warmup = { question: string; options: string[]; answer: number; clue?: string }
const warmups: Record<string, Warmup> = {
  'النشيد الوطني': { question: 'أيّ علم هو علم سلطنة عُمان؟', options: ['سلطنة عُمان', 'اليابان', 'فرنسا'], answer: 0, clue: 'لاحظ الألوان الثلاثة والشريط الأحمر بجانب السارية.' },
  'العلامة الإيقاعية النوار (♩) والسكتة المقابلة لها': { question: 'صفّق نبضة واحدة ثم توقّف: أي رمز يعبّر عن صوت النوار؟', options: ['♩ صوت مدته نبضة', '𝄽 سكتة', '🎹 آلة موسيقية', '🎼 مدرج'], answer: 0 },
  'اللعبة الشعبية (حبّوه موه تدوري)': { question: 'ما الذي يجعل اللعبة الشعبية الجماعية ممتعة؟', options: ['حركة وغناء بتناسق', 'كل شخص يتحرك وحده بلا إيقاع', 'الجلوس طوال الوقت', 'تجاهل المجموعة'], answer: 0 },
  'المدرج الموسيقي ومفتاح صول': { question: 'كم خطًا يتكوّن منه المدرج الموسيقي المعتاد؟', options: ['خمسة خطوط', 'خط واحد', 'ثلاثة خطوط', 'عشرة خطوط'], answer: 0 },
  'تطبيقات على المدرج الموسيقي': { question: 'أين نضع النغمات لقراءتها موسيقيًا؟', options: ['على الخطوط والفراغات', 'حول إطار الصفحة', 'داخل عنوان الدرس', 'على لوحة المفاتيح فقط'], answer: 0 },
  'نشيد (أرقامي)': { question: 'لنبدأ النشيد: أي ترتيب للأرقام تصاعدي؟', options: ['١، ٢، ٣، ٤', '٣، ١، ٤، ٢', '٤، ٣، ٢، ١', '٢، ٤، ١، ٣'], answer: 0 },
  'العلامة الإيقاعية الكروش (♫) والسكتة المقابلة لها': { question: 'أي رمز يعبّر عن الكروش؟', options: ['♫', '♩', '🎺', '📖'], answer: 0 },
  'إيقاع حركي (♩♫)': { question: 'كيف نؤدي نمطًا إيقاعيًا حركيًا؟', options: ['نصفّق ونتحرك وفق النبض', 'نتحرك بلا استماع', 'نغني جميعًا بسرعات مختلفة', 'نبقى بلا نبض'], answer: 0 },
  'نشيد (أسرتي)': { question: 'أيّ مشهد يناسب موضوع نشيد أسرتي؟', options: ['أسرة تتعاون معًا', 'إشارة مرور', 'ملعب فارغ', 'آلة موسيقية وحدها'], answer: 0 },
  'آلات الباند': { question: 'أيّ مجموعة تضم آلات موسيقية؟', options: ['طبول وصنوج وآلات نفخ', 'أقلام ودفاتر', 'أطباق وملاعق فقط', 'كرات وألعاب'], answer: 0 },
  'عزف مقطوعة موسيقية على آلات الباند': { question: 'ما أهم شيء عند عزف مقطوعة ضمن مجموعة؟', options: ['الاستماع والتزام الإيقاع', 'العزف بأعلى صوت دائمًا', 'تجاهل قائد المجموعة', 'تغيير الإيقاع باستمرار'], answer: 0 },
  'تدريبات صوتية بالتظليلات': { question: 'ماذا تعني التظليلات في الغناء؟', options: ['تغيير قوة الصوت تدريجيًا', 'تغيير كلمات الأغنية فقط', 'التوقف عن التنفس', 'تغيير لون الصفحة'], answer: 0 },
  'نشيد (عَلَم بلادي)': { question: 'ما الشيء الذي تُعرَف به الدولة من بين الدول؟', options: ['العَلَم', 'اللغة', 'العملة', 'الطعام الشعبي'], answer: 0, clue: 'إجابة صحيحة! العَلَم هو الشيء الذي تُعرَف به الدول.' },
  'الشكل الإيقاعي (♫)': { question: 'أي رمز أمامك شكل إيقاعي؟', options: ['♫', '📐', '🍎', '🚲'], answer: 0 },
  'نشيد (سلامتي)': { question: 'أيّ تصرف يساعد على السلامة؟', options: ['الانتباه واتباع التعليمات', 'الجري في الطريق', 'دفع الآخرين', 'تجاهل التحذيرات'], answer: 0 },
  'آلة الأورج': { question: 'اكتشف عنوان الدرس', options: ['آلة الأورج 🎹', 'آلة العود 🪕', 'الطبل 🥁', 'الناي 🎶'], answer: 0, clue: 'أحسنت! عنوان الدرس هو آلة الأورج.' },
  'عزف مقطوعة موسيقية على آلة الأورج': { question: 'اسم الآلة التي يعزف عليها العازف أمامك هي:', options: ['الأورج', 'العود', 'الناي', 'الطبلة'], answer: 0 },
  'اللعبة الشعبية (تراني بقطع السناسل)': { question: 'ما الذي نحتاجه لنجاح لعبة شعبية مع المجموعة؟', options: ['تعاون وتوقيت مشترك', 'العمل دون الاستماع', 'تغيير القواعد كل لحظة', 'عدم المشاركة'], answer: 0 },
  'الميزان الثلاثي': { question: 'كم نبضة أساسية نتوقع في الميزان الثلاثي؟', options: ['ثلاث نبضات', 'نبضة واحدة', 'خمس نبضات', 'لا توجد نبضات'], answer: 0 },
  'إيقاع حركي (♫)': { question: 'ما أفضل طريقة لتكرار الإيقاع بدقة؟', options: ['الاستماع ثم التصفيق بانتظام', 'التصفيق عشوائيًا', 'تجاهل النبض', 'التوقف بعد كل صوت'], answer: 0 },
  'نشيد (حرف الأجداد)': { question: 'أيّ موضوع يرتبط بعنوان «حرف الأجداد»؟', options: ['الحرف والمهن التراثية', 'الكواكب فقط', 'وسائل النقل الحديثة فقط', 'أشكال هندسية فقط'], answer: 0 },
  'أربيج سلم (دو الكبير)': { question: 'ما الذي نسمعه في أربيج دو الكبير؟', options: ['نغمات سلم دو الكبير بالتتابع', 'أصوات حيوانات فقط', 'إيقاع بلا نغمات', 'أصوات عشوائية'], answer: 0 },
  'قراءة إيقاعية وغناء صولفائي': { question: 'ما الذي يساعدنا على قراءة الإيقاع والغناء الصولفائي؟', options: ['متابعة الرموز والنبض والنغمات', 'تجاهل الرموز', 'الغناء دون استماع', 'البدء من أي مكان عشوائيًا'], answer: 0 },
}

function playPitch(frequency: number) {
  const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioContextClass) return
  const context = new AudioContextClass()
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.type = 'triangle'
  oscillator.frequency.setValueAtTime(frequency, context.currentTime)
  void context.resume().then(() => {
    const startAt = context.currentTime
    gain.gain.setValueAtTime(0.0001, startAt)
    gain.gain.exponentialRampToValueAtTime(0.7, startAt + 0.04)
    gain.gain.setValueAtTime(0.7, startAt + 0.45)
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.75)
    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start(startAt)
    oscillator.stop(startAt + 0.8)
    oscillator.onended = () => { void context.close() }
  }).catch(() => { void context.close() })
}

export function PitchWarmup() {
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const sounds = [{ label: 'الصوت الأول', frequency: 880, answer: 0 }, { label: 'الصوت الثاني', frequency: 55, answer: 1 }]
  return (
    <div className="space-y-4">
      <p className="text-lg font-bold">اضغط على زر الاستماع لكل صوت، وبعدها اختار الصورة المناسبة: الطائر للصوت الحاد 🐦 والأسد للصوت الغليظ 🦁.</p>
      {sounds.map((sound, index) => (
        <div key={sound.label} className="rounded-2xl border-2 border-amber-100 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <span className="font-extrabold text-lg">{sound.label}</span>
            <button type="button" onClick={() => playPitch(sound.frequency)} className="rounded-full bg-sky-100 px-5 py-3 font-extrabold hover:bg-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500">🔊 اسمع الصوت</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[{ label: 'صوت حاد', emoji: '🐦' }, { label: 'صوت غليظ', emoji: '🦁' }].map((option, optionIndex) => (
              <button type="button" key={option.label} onClick={() => { setAnswers((current) => ({ ...current, [index]: optionIndex })); optionIndex === sound.answer ? playCorrect() : playWrong() }} aria-pressed={answers[index] === optionIndex} className={`rounded-2xl border-2 p-4 transition ${answers[index] === optionIndex ? (optionIndex === sound.answer ? 'border-emerald-500 bg-emerald-100' : 'border-rose-400 bg-rose-100') : 'border-slate-100 bg-amber-50 hover:bg-amber-100'}`}>
                <span className="block text-5xl mb-2" role="img" aria-label={option.label}>{option.emoji}</span>
                <span className="font-extrabold">{option.label}</span>
              </button>
            ))}
          </div>
          {answers[index] !== undefined && <p className="mt-3 font-extrabold" aria-live="polite">{answers[index] === sound.answer ? 'أحسنت! اختيار صحيح ⭐' : 'محاولة جميلة، اسمع الصوت مرة أخرى وجرب تاني.'}</p>}
        </div>
      ))}
    </div>
  )
}

export function DifferentSoundQuiz() {
  const [selected, setSelected] = useState<number | null>(null)
  const [round, setRound] = useState(0)
  const patterns = [
    { frequencies: [440, 440, 880], odd: 2 },
    { frequencies: [660, 330, 660], odd: 1 },
    { frequencies: [220, 440, 440], odd: 0 },
  ]
  const pattern = patterns[round % patterns.length]
  const play = (frequency: number) => playPitch(frequency)
  return (
    <div className="mt-5 rounded-[2rem] border-2 border-violet-100 bg-violet-50 p-5">
      <h3 className="text-xl md:text-2xl font-extrabold mb-2">🎧 اختَر الصوت المختلف</h3>
      <p className="mb-4 text-ink/70">استمع إلى الأصوات الثلاثة واحدًا تلو الآخر، ثم حدّد الصوت الذي تختلف طبقته عن الصوتين الآخرين.</p>
      <div className="grid grid-cols-3 gap-3">
        {pattern.frequencies.map((frequency, i) => (
          <div key={i} className="rounded-2xl bg-white p-3 text-center">
            <p className="font-extrabold mb-2">الصوت {['الأول','الثاني','الثالث'][i]}</p>
            <button type="button" onClick={() => play(frequency)} className="w-full rounded-xl bg-sky-100 p-3 font-extrabold hover:bg-sky-200" aria-label={`استمع إلى الصوت ${i+1}`}>🔊 استمع</button>
            <button type="button" onClick={() => { setSelected(i); i === pattern.odd ? playCorrect() : playWrong() }} className={`mt-2 w-full rounded-xl border-2 p-3 font-extrabold ${selected === i ? (i === pattern.odd ? 'border-emerald-500 bg-emerald-100' : 'border-rose-400 bg-rose-100') : 'border-slate-100 bg-amber-50 hover:bg-amber-100'}`}>هذا هو المختلف</button>
          </div>
        ))}
      </div>
      {selected !== null && <p className="mt-4 font-extrabold" aria-live="polite">{selected === pattern.odd ? 'أحسنت! هذا هو الصوت المختلف ⭐' : 'استمع مرة أخرى؛ يوجد صوت واحد تختلف طبقته عن الصوتين الآخرين.'}</p>}
      <button type="button" onClick={() => { setRound((r) => (r + 1) % patterns.length); setSelected(null) }} className="mt-4 rounded-full bg-violet-500 px-5 py-3 font-extrabold text-white hover:bg-violet-600">جولة جديدة ↻</button>
    </div>
  )
}

function ClockWarmup() {
  const [running, setRunning] = useState(false)
  const [beat, setBeat] = useState(0)
  useEffect(() => {
    if (!running) return
    const timer = window.setInterval(() => {
      setBeat((b) => (b + 1) % 12)
      playPitch(880)
    }, 1000)
    return () => window.clearInterval(timer)
  }, [running])
  return (
    <div className="rounded-3xl bg-white p-4 md:p-6 text-center">
      <p className="text-lg font-bold mb-4">شاهد العسكري وهو يسير مع عقرب الساعة بخطوات منتظمة، واستمع إلى صوت النوار مع كل خطوة.</p>
      <div className="relative mx-auto mb-5 h-64 w-64 max-w-full">
        <svg viewBox="0 0 240 240" className="h-full w-full" role="img" aria-label="ساعة بعقرب يتحرك مع خطوات العسكري">
          <circle cx="120" cy="120" r="103" fill="#fffdf5" stroke="#334155" strokeWidth="7" />
          {Array.from({length:12},(_,i) => <g key={i} transform={`rotate(${i*30} 120 120)`}><line x1="120" y1="25" x2="120" y2="38" stroke="#475569" strokeWidth="4" strokeLinecap="round"/><text x="120" y="55" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#334155" transform={`rotate(${-i*30} 120 55)`}>{i===0?12:i}</text></g>)}
          <g transform={`rotate(${beat*30} 120 120)`} style={{transition:'transform 900ms linear'}}>
            <line x1="120" y1="120" x2="120" y2="35" stroke="#e11d48" strokeWidth="5" strokeLinecap="round"/>
            <circle cx="120" cy="35" r="5" fill="#e11d48"/>
            <text x="120" y="24" textAnchor="middle" fontSize="25" transform="rotate(0 120 24)">👮</text>
          </g>
          <circle cx="120" cy="120" r="8" fill="#334155"/>
        </svg>
      </div>
      <p className="font-extrabold mb-4">كل خطوة منتظمة تمثّل نبضة واحدة ♩</p>
      <button type="button" onClick={() => setRunning((v) => !v)} className="rounded-full bg-amber-400 px-7 py-3 font-extrabold shadow-chunky hover:bg-amber-500">{running ? 'إيقاف الساعة ⏸' : 'ابدأ حركة الساعة والصوت ▶'}</button>
      <p className="text-sm text-ink/60 mt-3">يتحرك العقرب والعسكري بانتظام، ويُسمع صوت قصير مع كل نبضة.</p>
    </div>
  )
}

function HabouhIllustration() {
  return (
    <svg viewBox="0 0 240 220" role="img" aria-label="شخصية حبوه الكرتونية بملابس عمانية تراثية" className="mx-auto w-full max-w-[220px]">
      <ellipse cx="120" cy="202" rx="72" ry="10" fill="#e5e7eb" />
      <path d="M48 199 Q50 145 80 132 L160 132 Q190 145 192 199Z" fill="#9b4d2e" stroke="#71351f" strokeWidth="3" />
      <path d="M72 151 Q120 170 168 151 L181 199 L59 199Z" fill="#c47b45" />
      <path d="M73 83 Q64 39 120 31 Q176 39 167 83 L159 127 L81 127Z" fill="#272b32" />
      <ellipse cx="120" cy="91" rx="47" ry="53" fill="#c98b60" stroke="#8a573c" strokeWidth="3" />
      <path d="M75 82 Q72 35 120 35 Q168 35 165 82 Q147 59 120 62 Q93 59 75 82Z" fill="#272b32" />
      <path d="M83 103 Q92 96 101 103 M139 103 Q148 96 157 103" fill="none" stroke="#43291f" strokeWidth="4" strokeLinecap="round" />
      <circle cx="96" cy="111" r="4" fill="#272b32" /><circle cx="144" cy="111" r="4" fill="#272b32" />
      <path d="M108 130 Q120 140 132 130" fill="none" stroke="#7a302d" strokeWidth="4" strokeLinecap="round" />
      <path d="M81 92 Q96 84 106 91 M134 91 Q145 84 159 92" fill="none" stroke="#272b32" strokeWidth="4" strokeLinecap="round" />
      <path d="M76 75 Q51 88 66 120 L81 131 L88 119Z M164 75 Q189 88 174 120 L159 131 L152 119Z" fill="#272b32" />
      <path d="M90 151 L101 161 L111 151 L120 162 L130 151 L140 161 L151 151" fill="none" stroke="#f7d9a2" strokeWidth="4" />
      <circle cx="120" cy="175" r="5" fill="#f7d9a2" />
    </svg>
  )
}

function HabouhWarmup() {
  const [choice, setChoice] = useState<number | null>(null)
  const options = ['حبّوه', 'الأسد', 'الطائر']
  const question = 'انظروا إلى هذه الشخصية الكرتونية، ما اسمها؟'
  return (
    <div className="text-center">
      <div className="rounded-3xl bg-white p-4 mb-4"><HabouhIllustration /></div>
      <div className="flex items-center justify-center gap-3 mb-4"><p className="text-xl font-extrabold">{question}</p>{canSpeak() && <button type="button" onClick={() => speak(question)} className="shrink-0 rounded-full bg-amber-300 p-3 font-bold" aria-label="تشغيل صوت السؤال">🔊</button>}</div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {options.map((option, index) => <button type="button" key={option} onClick={() => { setChoice(index); index === 0 ? playCorrect() : playWrong() }} className={`rounded-2xl border-2 p-4 text-lg font-extrabold transition ${choice === index ? (index === 0 ? 'border-emerald-500 bg-emerald-100' : 'border-rose-400 bg-rose-100') : 'border-white bg-white hover:bg-amber-50'}`}>{option}</button>)}
      </div>
      {choice !== null && <p className="font-extrabold text-lg mt-4" aria-live="polite">{choice === 0 ? 'برافو! دي حبّوه 🎉 يلا نتعرف على اللعبة الشعبية.' : 'قريب! جرّب تاني، اسم الشخصية حبّوه.'}</p>}
    </div>
  )
}

function FlagIllustration({ country }: { country: 'oman' | 'japan' | 'france' }) {
  const common = { width: '100%', viewBox: '0 0 180 108', role: 'img' as const, className: 'mx-auto w-full max-w-[180px] rounded-lg border border-ink/10 shadow-sm' }
  if (country === 'oman') {
    return (
      <img
        src="https://raw.githubusercontent.com/arnoha98-hash/naghmati/main/oman-flag.jpg"
        alt="علم سلطنة عُمان"
        className="mx-auto w-full max-w-[180px] aspect-[5/3] object-contain rounded-lg border border-ink/10 shadow-sm"
      />
    )
  }
  if (country === 'japan') {
    return (
      <svg {...common} aria-label="علم اليابان">
        <rect width="180" height="108" fill="#fff" />
        <circle cx="90" cy="54" r="27" fill="#bc002d" />
      </svg>
    )
  }
  return (
    <svg {...common} aria-label="علم فرنسا">
      <rect width="60" height="108" fill="#0055a4" />
      <rect x="60" width="60" height="108" fill="#fff" />
      <rect x="120" width="60" height="108" fill="#ef4135" />
    </svg>
  )
}


function RhythmBlocksWarmup() {
  const [pieces, setPieces] = useState<{ id: number; kind: string; x: number; y: number }[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [message, setMessage] = useState('اسحب قطعة إلى مساحة العمل، ثم فكّكها أو ادمج القطع المتساوية.')
  const [nextId, setNextId] = useState(2)
  const [dragId, setDragId] = useState<number | null>(null)
  const [workspace, setWorkspace] = useState<number[]>([1])
  const names: Record<string, string> = { whole: 'النوار', half: 'الكروش', quarter: 'الدوبل كروش' }
  const colors: Record<string, string> = { whole: '#8fc96c', half: '#e84b32', quarter: '#4c8ed9', result: '#c5a6d7' }
  const makePiece = (kind: string, x: number, y: number, id: number) => ({ id, kind, x, y })
  const splitPiece = (id: number) => {
    const piece = pieces.find(p => p.id === id)
    if (!piece) return
    if (piece.kind === 'whole') {
      const a = makePiece('half', piece.x - 55, piece.y + 58, nextId)
      const b = makePiece('half', piece.x + 55, piece.y + 58, nextId + 1)
      setPieces(prev => [...prev.filter(p => p.id !== id), a, b]); setWorkspace(prev => [...prev.filter(n => n !== id), a.id, b.id]); setNextId(v => v + 2); setSelected(null); setMessage('أحسنت! الوحدة الكاملة انقسمت إلى نصفين متساويين. يمكنك تقسيم كل نصف إلى جزأين أصغر.'); playCorrect()
    } else if (piece.kind === 'half') {
      const a = makePiece('quarter', piece.x - 38, piece.y + 58, nextId)
      const b = makePiece('quarter', piece.x + 38, piece.y + 58, nextId + 1)
      setPieces(prev => [...prev.filter(p => p.id !== id), a, b]); setWorkspace(prev => [...prev.filter(n => n !== id), a.id, b.id]); setNextId(v => v + 2); setSelected(null); setMessage('رائع! كل نصف أصبح جزأين متساويين. أربعة أجزاء صغيرة تساوي وحدة كاملة.'); playCorrect()
    } else setMessage('هذه أصغر قطعة في النشاط؛ جرّب دمج أربع قطع زرقاء أو قطعتين حمراوين.')
  }
  const mergePieces = () => {
    const selectedPieces = pieces.filter(p => workspace.includes(p.id) && (selected === null || p.id === selected))
    const ids = selectedPieces.map(p => p.id)
    const quarters = pieces.filter(p => workspace.includes(p.id) && p.kind === 'quarter')
    const halves = pieces.filter(p => workspace.includes(p.id) && p.kind === 'half')
    let kind = ''
    let chosen: typeof pieces = []
    if (halves.length >= 2) { kind = 'whole'; chosen = halves.slice(0, 2) }
    else if (quarters.length >= 2) { kind = 'half'; chosen = quarters.slice(0, 2) }
    if (!kind || chosen.length < 2) { setMessage('لدمج القطع: ضع قطعتين حمراوين لتكوين وحدة خضراء، أو قطعتين زرقاوين لتكوين قطعة حمراء.'); playWrong(); return }
    const id = nextId
    const x = chosen.reduce((sum,p)=>sum+p.x,0)/chosen.length
    const y = chosen.reduce((sum,p)=>sum+p.y,0)/chosen.length
    const merged = makePiece(kind,x,y,id)
    setPieces(prev => [...prev.filter(p => !chosen.some(q => q.id === p.id)), merged])
    setWorkspace(prev => [...prev.filter(n => !chosen.some(q => q.id === n)), id])
    setNextId(v => v + 1); setSelected(id); setMessage(kind === 'whole' ? 'ممتاز! رأيتَ قطعتَي كروش جنبًا إلى جنب، ثم اندمجتا لتكوّنا نوارًا واحدًا.' : 'أحسنت! رأيتَ قطعتَي دوبل كروش جنبًا إلى جنب، ثم اندمجتا لتكوّنا كروشًا واحدًا.'); playCorrect()
  }
  const reset = () => { setPieces([]); setWorkspace([]); setSelected(null); setMessage('بدأنا من جديد! اختر قطعة من القطع المتاحة لإضافتها إلى مساحة العمل.'); }
  const dragStart = (id: number) => setDragId(id)
  const dropAt = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    if (dragId === null) return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = Math.max(-125, Math.min(125, event.clientX - rect.left - rect.width / 2))
    const y = Math.max(-55, Math.min(65, event.clientY - rect.top - 65))
    setPieces(prev => prev.map(p => p.id === dragId ? {...p,x,y} : p))
    setWorkspace(prev => prev.includes(dragId) ? prev : [...prev, dragId])
    setSelected(dragId); setDragId(null)
  }
  const displayPieces = pieces.filter(p => workspace.includes(p.id))
  return (
    <div className="rounded-3xl bg-white p-4 md:p-6">
      <p className="text-lg font-extrabold mb-2">ورشة المكعبات الإيقاعية</p>
      <p className="text-ink/75 mb-4">اسحب القطع إلى اللوحة. اختر قطعة ثم فكّكها، أو ادمج القطع الصغيرة لتكوين قطعة أكبر.</p>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {(['whole','half','quarter'] as const).map(kind => <button key={kind} type="button" draggable onDragStart={() => dragStart(nextId)} onClick={() => { const id=nextId; setPieces(prev=>[...prev,makePiece(kind, Math.min(112, (prev.filter(p=>workspace.includes(p.id)).length % 3) * 100 - 100), Math.floor(prev.filter(p=>workspace.includes(p.id)).length / 3) * 58,id)]); setWorkspace(prev=>[...prev,id]); setSelected(id); setNextId(v=>v+1); setMessage('تمت إضافة قطعة إلى مساحة العمل. اخترها لتفكيكها أو ادمج القطع.'); }} className="rounded-2xl border-2 border-slate-100 bg-slate-50 p-2 text-center font-extrabold hover:border-amber-300">
          <svg viewBox="0 0 100 58" className="mx-auto w-full max-w-[100px]" aria-hidden="true"><rect x={kind==='whole'?8:kind==='half'?20:31} y="20" width={kind==='whole'?84:kind==='half'?60:38} height="29" rx="2" fill={colors[kind]} stroke="#374151" strokeWidth="1.5"/>{Array.from({length:kind==='whole'?4:kind==='half'?2:1},(_,i)=><rect key={i} x={(kind==='whole'?10:kind==='half'?22:33)+i*(kind==='whole'?20:kind==='half'?28:34)} y="12" width={kind==='whole'?18:kind==='half'?24:34} height="9" rx="2" fill={colors[kind]} stroke="#374151" strokeWidth="1"/>)}</svg>
          <span className="block text-sm">{names[kind]}</span>
          <span className="block text-xs text-ink/60">اضغط للإضافة</span>
        </button>)}
      </div>
      <div onDragOver={e=>e.preventDefault()} onDrop={dropAt} className="relative min-h-[250px] overflow-hidden rounded-2xl border-2 border-dashed border-violet-300 bg-[#f1eefb] p-3">
        <p className="text-sm font-extrabold text-violet-900">مساحة العمل — اسحب القطع ورتّبها هنا</p>
        <div className="relative mt-3 min-h-[185px]">
          {displayPieces.map(piece => <button key={piece.id} type="button" draggable onDragStart={()=>dragStart(piece.id)} onClick={()=>setSelected(piece.id)} style={{left:`calc(50% + ${piece.x}px)`,top:`${piece.y}px`,transform:'translateX(-50%)',backgroundColor:colors[piece.kind],zIndex:selected===piece.id?3:1}} className={`absolute w-24 rounded-lg border-2 p-2 shadow-md transition ring-offset-2 ${selected===piece.id?'ring-4 ring-amber-400':'border-slate-600'}`} aria-label={names[piece.kind]}>
            <svg viewBox="0 0 100 60" className="w-full" aria-hidden="true">
              <path d="M5 25 L18 15 H94 L82 25Z" fill="#ffffff" fillOpacity=".3" stroke="#374151" strokeWidth="1.2"/>
              <rect x="5" y="25" width="77" height="28" fill={colors[piece.kind]} stroke="#374151" strokeWidth="1.2"/>
              <path d="M82 25 L94 15 V43 L82 53Z" fill="#000" fillOpacity=".08" stroke="#374151" strokeWidth="1.2"/>
              {Array.from({length:piece.kind==='whole'?4:piece.kind==='half'?2:1},(_,i)=><rect key={i} x={10+i*(piece.kind==='whole'?18:piece.kind==='half'?35:0)} y="19" width={piece.kind==='whole'?16:piece.kind==='half'?30:60} height="7" rx="1" fill={colors[piece.kind]} stroke="#374151" strokeWidth=".8"/>)}
              {piece.kind === 'whole' ? <g stroke="#111827" strokeWidth="2.5" fill="none"><ellipse cx="50" cy="12" rx="7" ry="4" fill="#111827" transform="rotate(-20 50 12)"/><path d="M56 12 V0"/></g> : piece.kind === 'half' ? <g stroke="#111827" strokeWidth="2.5" fill="none"><ellipse cx="50" cy="12" rx="7" ry="4" fill="#111827" transform="rotate(-20 50 12)"/><path d="M56 12 V0 M56 2 Q68 5 56 8"/></g> : <g stroke="#111827" strokeWidth="2.5" fill="none"><ellipse cx="50" cy="12" rx="7" ry="4" fill="#111827" transform="rotate(-20 50 12)"/><path d="M56 12 V0 M56 2 Q68 5 56 8 M56 6 Q68 9 56 12"/></g>}
            </svg>
            <span className="block text-xs font-extrabold text-slate-900">{names[piece.kind]}</span>
          </button>)}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" disabled={selected===null} onClick={()=>selected!==null&&splitPiece(selected)} className="rounded-full bg-amber-400 px-4 py-3 font-extrabold disabled:opacity-40">فكّك القطعة المحددة</button>
        <button type="button" onClick={mergePieces} className="rounded-full bg-emerald-500 px-4 py-3 font-extrabold text-white">ادمج القطع المتساوية</button>
        <button type="button" onClick={reset} className="rounded-full border-2 border-slate-200 px-4 py-3 font-extrabold">إعادة النشاط ↻</button>
      </div>
      <p className="mt-4 rounded-2xl bg-emerald-50 p-3 font-extrabold text-emerald-900" aria-live="polite">{message}</p>
      <p className="mt-2 text-xs text-ink/60">تعمل اللوحة باللمس أو الفأرة؛ ويمكن استخدام أزرار الإضافة والتفكيك والدمج عند الأجهزة التي لا تدعم السحب.</p>
    </div>
  )
}

type WarmupVisualKind = 'clef-treble' | 'clef-bass' | 'clef-alto' | 'clef-percussion' | 'staff-3-lines' | 'staff-4-lines' | 'staff-5-lines' | 'staff-6-lines' | 'line-names-correct' | 'line-names-reversed' | 'line-names-spaces' | 'line-names-random' | 'space-names-correct' | 'space-names-reversed' | 'space-names-lines' | 'space-names-random'

function WarmupNotationOption({ kind, label }: { kind: WarmupVisualKind; label: string }) {
  const clefs: Record<string, string> = { 'clef-treble': '𝄞', 'clef-bass': '𝄢', 'clef-alto': '𝄡', 'clef-percussion': '𝄥' }
  const names: Record<string, string[]> = {
    'line-names-correct': ['مي','صول','سي','ري','فا'], 'line-names-reversed': ['فا','ري','سي','صول','مي'],
    'line-names-spaces': ['فا','لا','دو','مي','فا'], 'line-names-random': ['مي','سي','صول','فا','ري'],
    'space-names-correct': ['فا','لا','دو','مي'], 'space-names-reversed': ['مي','دو','لا','فا'],
    'space-names-lines': ['مي','صول','سي','ري'], 'space-names-random': ['لا','فا','مي','دو'],
  }
  if (kind.startsWith('clef-')) return <div className="flex flex-col items-center gap-2"><svg viewBox="0 0 220 100" role="img" aria-label={label} className="w-full max-w-[260px] h-auto"><rect x="8" y="8" width="204" height="84" rx="10" fill="#fffdf5"/>{[28,39,50,61,72].map(y => <line key={y} x1="20" y1={y} x2="200" y2={y} stroke="#334155" strokeWidth="1.8"/>)}<text x="72" y="78" fontSize="76" fontFamily="serif" fill="#7c3aed">{clefs[kind]}</text></svg><span className="text-base font-extrabold">{label}</span></div>
  if (kind.startsWith('staff-')) { const count = Number(kind.split('-')[1]); return <div className="flex flex-col items-center gap-2"><svg viewBox="0 0 240 104" role="img" aria-label={label} className="w-full max-w-[260px] h-auto"><rect x="4" y="5" width="232" height="94" rx="10" fill="#fffdf5"/>{Array.from({length:count},(_,i)=>28+i*(44/(count-1))).map(y=><line key={y} x1="12" y1={y} x2="228" y2={y} stroke="#334155" strokeWidth="2.2"/>)}</svg><span className="text-base font-extrabold">{label}</span></div> }
  const isSpaces = kind.startsWith('space-')
  const lineYs = isSpaces ? [34,45,56,67] : [28,39,50,61,72]
  const noteNames = names[kind]
  return <div className="flex flex-col items-center gap-2"><svg viewBox="0 0 240 104" role="img" aria-label={label} className="w-full max-w-[260px] h-auto"><rect x="4" y="5" width="232" height="94" rx="10" fill="#fffdf5"/>{lineYs.map(y=><line key={y} x1="12" y1={y} x2="228" y2={y} stroke="#334155" strokeWidth="1.8"/>)}{noteNames.map((name,i)=>{const x=36+i*42;const y=isSpaces?lineYs[lineYs.length-1-i]+5.5:lineYs[lineYs.length-1-i];return <g key={i}><ellipse cx={x} cy={y} rx="9" ry="5.5" transform={'rotate(-22 '+x+' '+y+')'} fill="#7c3aed"/><text x={x} y={y-8} textAnchor="middle" fontSize="11" fontWeight="700" fill="#334155">{name}</text></g>})}</svg><span className="text-base font-extrabold">{label}</span></div>
}

export default function PreLessonActivity({ lesson, onComplete }: { lesson: Lesson; onComplete?: () => void }) {
  const [choice, setChoice] = useState<number | null>(null)
  const [staffAnswers, setStaffAnswers] = useState<Record<number, number>>({})
  const [staffQuestionIndex, setStaffQuestionIndex] = useState(0)
  const [staffWrong, setStaffWrong] = useState<number[]>([])
  const [staffSolved, setStaffSolved] = useState(false)
  const [applicationsQuestionIndex, setApplicationsQuestionIndex] = useState(0)
  const [applicationsAnswers, setApplicationsAnswers] = useState<Record<number, number>>({})
  const [applicationsWrong, setApplicationsWrong] = useState<number[]>([])
  const [applicationsSolved, setApplicationsSolved] = useState(false)
  const activity = warmups[lesson.title] ?? {
    question: `ما المعلومة التي تساعدك على فهم درس «${lesson.title}»؟`,
    options: ['ألاحظ عنوان الدرس وأستمع جيدًا', 'أتجاهل الأمثلة', 'أجيب دون قراءة', 'أتوقف عن المشاركة'],
    answer: 0,
  }
  const isNationalAnthem = lesson.title === 'النشيد الوطني'
  const isStaffLesson = lesson.title === 'المُدَرَّج الموسيقي ومفتاح صول' || lesson.title === 'المدرج الموسيقي ومفتاح صول'
  const isStaffApplicationsLesson = lesson.title === 'تطبيقات على المُدَرَّج الموسيقي' || lesson.title === 'تطبيقات على المدرج الموسيقي'
  const isShadingLesson = lesson.title === 'تدريبات صوتية بالتظليلات'
  const isRhythmFigure = lesson.title === 'الشكل الإيقاعي (♫)'
  return (
    <section className="rounded-[2rem] bg-gradient-to-br from-amber-100 via-white to-sky-100 border-2 border-white p-5 md:p-7 shadow-chunky">
      <div className="flex items-center gap-3 mb-4"><span className="grid place-items-center w-12 h-12 rounded-2xl bg-ink text-white text-xl font-extrabold shrink-0">1</span><span className="grid place-items-center w-14 h-14 rounded-2xl bg-amber-300 text-3xl shrink-0">{lesson.title === 'الشكل الإيقاعي (♫)' ? <RhythmFigure className="w-12 h-12 text-ink" /> : '💡'}</span><div><h2 className="text-2xl md:text-3xl font-extrabold">تهيّأ قبل أن تتعلّم</h2>{!isShadingLesson && <p className="text-ink/65">نشاط قصير مرتبط بموضوع الدرس.</p>}</div></div>
      {lesson.title === 'آلة الأورج' && <div className="mb-6 rounded-2xl bg-white p-3 md:p-4 shadow-chunky"><iframe src="https://www.jigsawplanet.com/?rc=play&amp;pid=116b3160a8c0&amp;view=iframe" style={{ width: '100%', height: '600px' }} frameBorder="0" allowFullScreen title="نشاط تركيب صورة آلة الأورج" className="w-full rounded-xl" /></div>}
      {!isShadingLesson && !isStaffLesson && !isStaffApplicationsLesson && lesson.title !== 'الحِدّة والغلظة – السرعة والبطء' && lesson.title !== 'العلامة الإيقاعية النوار (♩) والسكتة المقابلة لها' && !isRhythmFigure && <p className="text-xl font-extrabold mb-4">{activity.question}</p>}
      {isStaffApplicationsLesson ? (() => {
        const questions: { question: string; options: string[]; answer: number; visualOptions: WarmupVisualKind[] }[] = [
          { question: 'أيّ مما يلي يمثّل الرسم الصحيح لمفتاح صول؟', options: ['مفتاح صول', 'مفتاح فا', 'مفتاح دو', 'علامة إيقاعية'], answer: 0, visualOptions: ['clef-treble', 'clef-bass', 'clef-alto', 'clef-percussion'] },
          { question: 'كم عدد خطوط المدرج الموسيقي؟', options: ['ثلاثة خطوط', 'أربعة خطوط', 'خمسة خطوط', 'ستة خطوط'], answer: 2, visualOptions: ['staff-3-lines', 'staff-4-lines', 'staff-5-lines', 'staff-6-lines'] },
          { question: 'اختر أسماء خطوط المدرج الموسيقي الصحيحة من اليسار إلى اليمين، صعودًا من أسفل إلى أعلى.', options: ['مي – صول – سي – ري – فا', 'فا – ري – سي – صول – مي', 'فا – لا – دو – مي', 'دو – ري – مي – فا – صول'], answer: 0, visualOptions: ['line-names-correct', 'line-names-reversed', 'line-names-spaces', 'line-names-random'] },
          { question: 'اختر أسماء مسافات المدرج الموسيقي الصحيحة من اليسار إلى اليمين، صعودًا من أسفل إلى أعلى.', options: ['فا – لا – دو – مي', 'مي – صول – سي – ري – فا', 'مي – دو – لا – فا', 'فا – سي – ري – صول'], answer: 0, visualOptions: ['space-names-correct', 'space-names-reversed', 'space-names-lines', 'space-names-random'] },
        ]
        const item = questions[applicationsQuestionIndex]
        const colors = ['bg-pink-100 border-pink-300 hover:bg-pink-200', 'bg-sky-100 border-sky-300 hover:bg-sky-200', 'bg-amber-100 border-amber-300 hover:bg-amber-200', 'bg-emerald-100 border-emerald-300 hover:bg-emerald-200']
        return <div className="rounded-[2rem] bg-white p-5 md:p-8 shadow-chunky">
          <p className="text-ink/70 mb-4">راجع ما تعرفه عن مفتاح صول وخطوط المدرج ومسافاته، ثم اختر الإجابة الصحيحة.</p>
          <div className="flex items-center justify-between gap-3 mb-5"><span className="rounded-full bg-violet-100 text-violet-700 font-bold px-4 py-1">السؤال {applicationsQuestionIndex + 1} من {questions.length}</span><div className="flex gap-1.5">{questions.map((_, i) => <span key={i} className={`w-3 h-3 rounded-full ${i < applicationsQuestionIndex || (i === applicationsQuestionIndex && applicationsSolved) ? 'bg-emerald-400' : i === applicationsQuestionIndex ? 'bg-violet-400' : 'bg-ink/10'}`} />)}</div></div>
          <h3 className="text-xl md:text-2xl font-extrabold leading-snug mb-6">{item.question}</h3>
          <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2">{item.options.map((option, optionIndex) => {
            const isWrong = applicationsWrong.includes(optionIndex)
            const isRight = applicationsSolved && optionIndex === item.answer
            return <button key={option} type="button" disabled={applicationsSolved || isWrong} onClick={() => { setApplicationsAnswers(current => ({ ...current, [applicationsQuestionIndex]: optionIndex })); if (optionIndex === item.answer) { setApplicationsSolved(true); playCorrect() } else { setApplicationsWrong(current => [...current, optionIndex]); playWrong() } }} aria-pressed={applicationsAnswers[applicationsQuestionIndex] === optionIndex} className={['relative rounded-3xl border-[3px] p-4 md:p-5 text-lg md:text-xl font-bold text-center transition min-h-20 shadow-chunky', isRight ? 'bg-emerald-400 border-emerald-500 text-white' : isWrong ? 'bg-red-100 border-red-300 text-red-400 line-through opacity-70' : applicationsSolved ? 'bg-ink/5 border-transparent opacity-50' : colors[optionIndex]].join(' ')}>{item.visualOptions?.[optionIndex] ? <WarmupNotationOption kind={item.visualOptions[optionIndex]} label={option} /> : option}{isRight && <span className="absolute -top-3 -left-3 text-3xl">✅</span>}{isWrong && <span className="absolute -top-3 -left-3 text-3xl">❌</span>}</button>
          })}</div>
          <div aria-live="polite" className="min-h-20 mt-6">{applicationsSolved ? <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-emerald-50 border-2 border-emerald-200 p-4"><p className="text-xl font-extrabold text-emerald-600">أحسنت! إجابة صحيحة ⭐</p><button type="button" onClick={() => { if (applicationsQuestionIndex + 1 < questions.length) { setApplicationsQuestionIndex(i => i + 1); setApplicationsWrong([]); setApplicationsSolved(false) } else { setApplicationsQuestionIndex(0); setApplicationsWrong([]); setApplicationsSolved(false); setApplicationsAnswers({}) } }} className="rounded-full bg-emerald-500 text-white px-6 py-3 text-lg font-extrabold shadow-chunky">{applicationsQuestionIndex + 1 < questions.length ? 'السؤال التالي ←' : 'أعد المحاولة ↺'}</button></div> : applicationsWrong.length > 0 ? <div className="rounded-3xl bg-orange-50 border-2 border-orange-200 p-4"><p className="text-xl font-extrabold text-orange-600">حاول مرة أخرى 💪</p><p className="text-lg text-ink/70 mt-1">💡 راجع ترتيب مفتاح صول وخطوط المدرج ومسافاته ثم حاول مرة أخرى.</p></div> : null}</div>
        </div>
      })() : null}
      {isStaffApplicationsLesson ? null : isStaffLesson ? (
        <div className="space-y-5">
          <div className="rounded-3xl border-2 border-sky-100 bg-white p-4 md:p-6">
            <h3 className="mb-3 text-center text-xl font-extrabold text-sky-800">تأمّل المدرج الموسيقي ومفتاح صول</h3>
            <svg viewBox="0 0 360 190" role="img" aria-label="مدرج موسيقي مكوّن من خمسة خطوط أفقية وعليه مفتاح صول" className="mx-auto w-full max-w-xl">
              <rect x="8" y="8" width="344" height="174" rx="16" fill="#fffdf5" />
              {[55, 75, 95, 115, 135].map((y) => <line key={y} x1="35" y1={y} x2="325" y2={y} stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />)}
              <text x="42" y="132" fontSize="100" fontFamily="serif" fill="#7c3aed">𝄞</text>
              <text x="180" y="165" textAnchor="middle" fontSize="13" fontWeight="700" fill="#475569">المدرج الموسيقي</text>
            </svg>
          </div>
          {(() => {
            const questions = [
              { question: 'هل تستطيع عدّ الخطوط الموجودة في الصورة؟', options: ['ثلاثة خطوط', 'أربعة خطوط', 'خمسة خطوط', 'ستة خطوط'], answer: 2 },
              { question: 'كم مسافة موجودة بين خطوط المدرج في الصورة؟', options: ['مسافتان', 'ثلاث مسافات', 'أربع مسافات', 'خمس مسافات'], answer: 2 },
            ]
            const item = questions[staffQuestionIndex]
            const colors = ['bg-pink-100 border-pink-300 hover:bg-pink-200', 'bg-sky-100 border-sky-300 hover:bg-sky-200', 'bg-amber-100 border-amber-300 hover:bg-amber-200', 'bg-emerald-100 border-emerald-300 hover:bg-emerald-200']
            return (
              <div className="rounded-[2rem] bg-white p-5 md:p-8 shadow-chunky">
                <div className="flex items-center justify-between gap-3 mb-5">
                  <span className="rounded-full bg-violet-100 text-violet-700 font-bold px-4 py-1">السؤال {staffQuestionIndex + 1} من {questions.length}</span>
                  <div className="flex gap-1.5" aria-hidden="true">
                    {questions.map((_, i) => <span key={i} className={`w-3 h-3 rounded-full ${i < staffQuestionIndex || (i === staffQuestionIndex && staffSolved) ? 'bg-emerald-400' : i === staffQuestionIndex ? 'bg-violet-400' : 'bg-ink/10'}`} />)}
                  </div>
                </div>
                <h4 className="text-xl md:text-2xl font-extrabold leading-snug mb-6">{item.question}</h4>
                <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2">
                  {item.options.map((option, optionIndex) => {
                    const isWrong = staffWrong.includes(optionIndex)
                    const isRight = staffSolved && optionIndex === item.answer
                    return (
                      <button key={option} type="button" disabled={staffSolved || isWrong}
                        onClick={() => {
                          setStaffAnswers((current) => ({ ...current, [staffQuestionIndex]: optionIndex }))
                          if (optionIndex === item.answer) { setStaffSolved(true); playCorrect() }
                          else { setStaffWrong((current) => [...current, optionIndex]); playWrong() }
                        }}
                        aria-pressed={staffAnswers[staffQuestionIndex] === optionIndex}
                        className={['relative rounded-3xl border-[3px] p-5 text-xl font-bold text-center transition min-h-20 shadow-chunky',
                          isRight ? 'bg-emerald-400 border-emerald-500 text-white' : isWrong ? 'bg-red-100 border-red-300 text-red-400 line-through opacity-70' : staffSolved ? 'bg-ink/5 border-transparent opacity-50' : colors[optionIndex]
                        ].join(' ')}>
                        {option}
                        {isRight && <span className="absolute -top-3 -left-3 text-3xl">✅</span>}
                        {isWrong && <span className="absolute -top-3 -left-3 text-3xl">❌</span>}
                      </button>
                    )
                  })}
                </div>
                <div aria-live="polite" className="min-h-20 mt-6">
                  {staffSolved ? (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-emerald-50 border-2 border-emerald-200 p-4">
                      <p className="text-xl font-extrabold text-emerald-600">أحسنت! إجابة صحيحة ⭐</p>
                      {staffQuestionIndex + 1 < questions.length ? (
                        <button type="button" onClick={() => { setStaffQuestionIndex((i) => i + 1); setStaffWrong([]); setStaffSolved(false) }} className="rounded-full bg-emerald-500 text-white px-6 py-3 text-lg font-extrabold shadow-chunky">السؤال التالي ←</button>
                      ) : (
                        <button type="button" onClick={() => { setStaffQuestionIndex(0); setStaffWrong([]); setStaffSolved(false); setStaffAnswers({}) }} className="rounded-full bg-violet-500 text-white px-6 py-3 text-lg font-extrabold shadow-chunky">أعد المحاولة ↺</button>
                      )}
                    </div>
                  ) : staffWrong.length > 0 ? (
                    <div className="rounded-3xl bg-orange-50 border-2 border-orange-200 p-4">
                      <p className="text-xl font-extrabold text-orange-600">حاول مرة أخرى 💪</p>
                      <p className="text-lg text-ink/70 mt-1">💡 أعد العدّ من الصورة، ثم اختَر الإجابة الصحيحة.</p>
                    </div>
                  ) : null}
                </div>
              </div>
            )
          })()}
        </div>
      ) : isRhythmFigure ? (
        <RhythmBlocksWarmup />
      ) : lesson.title === 'الحِدّة والغلظة – السرعة والبطء' ? null : lesson.title === 'العلامة الإيقاعية النوار (♩) والسكتة المقابلة لها' ? (
        <ClockWarmup />
      ) : lesson.title === 'اللعبة الشعبية (حبّوه موه تدوري)' ? (
        <HabouhWarmup />
      ) : isNationalAnthem ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(['oman', 'japan', 'france'] as const).map((country, i) => <button key={country} onClick={() => { setChoice(i); i === activity.answer ? playCorrect() : playWrong() }} className={`rounded-2xl border-2 p-4 font-bold transition ${choice === i ? (i === activity.answer ? 'border-emerald-500 bg-emerald-100' : 'border-rose-400 bg-rose-100') : 'border-white bg-white hover:bg-amber-50'}`}><FlagIllustration country={country}/><span className="block mt-3">{['سلطنة عُمان', 'اليابان', 'فرنسا'][i]}</span></button>)}
        </div>
      ) : isShadingLesson ? null : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {activity.options.map((option, i) => <button key={option} onClick={() => { setChoice(i); if (i === activity.answer) { playCorrect(); onComplete?.() } else playWrong() }} className={`rounded-2xl border-2 p-4 text-lg font-bold transition ${choice === i ? (i === activity.answer ? 'border-emerald-500 bg-emerald-100' : 'border-rose-400 bg-rose-100') : 'border-white bg-white hover:bg-amber-50'}`}>{option}</button>)}
        </div>
      )}
      {choice !== null && !isShadingLesson && !isStaffLesson && !isStaffApplicationsLesson && lesson.title !== 'اللعبة الشعبية (حبّوه موه تدوري)' && lesson.title !== 'الحِدّة والغلظة – السرعة والبطء' && !isRhythmFigure && <p className="font-extrabold text-lg mt-4" aria-live="polite">{choice === activity.answer ? (activity.clue ?? 'أحسنت! إجابة رائعة 🌟') : 'محاولة جميلة! جرّب اختيارًا آخر.'}</p>}
      {lesson.warmupVideoUrl && (
        <div className="rounded-2xl bg-ink p-2 md:p-3 shadow-chunky mt-4">
          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
            {lesson.warmupVideoUrl.toLowerCase().split('?')[0].endsWith('.mp4') ? (
              <video controls playsInline preload="metadata" onPlay={() => onComplete?.()} className="absolute inset-0 w-full h-full" title={`تمهيد درس ${lesson.title}`}>
                <source src={lesson.warmupVideoUrl} type="video/mp4" />
                المتصفح لا يدعم تشغيل الفيديو.
              </video>
            ) : (
              <iframe src={lesson.warmupVideoUrl} title={`تمهيد درس ${lesson.title}`} className="absolute inset-0 w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen loading="lazy" />
            )}
          </div>
          <p className="text-sm text-center text-ink/65 mt-3">شاهد الفيديو التمهيدي، ثم انتقل إلى فيديو الشرح والنشاط التفاعلي.</p>
        </div>
      )}
    </section>
  )
}
