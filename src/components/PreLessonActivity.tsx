import { useEffect, useState } from 'react'
import type { Lesson } from '@/content/curriculum'
import { playCorrect, playWrong } from '@/lib/audio'
import { canSpeak, speak } from '@/lib/speech'

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
  'نشيد (عَلَم بلادي)': { question: 'أيّ لون يظهر في علم سلطنة عُمان؟', options: ['الأحمر والأبيض والأخضر', 'الأزرق والأصفر فقط', 'الأسود والبرتقالي فقط', 'البنفسجي والوردي فقط'], answer: 0 },
  'الشكل الإيقاعي (♫)': { question: 'أي رمز أمامك شكل إيقاعي؟', options: ['♫', '📐', '🍎', '🚲'], answer: 0 },
  'نشيد (سلامتي)': { question: 'أيّ تصرف يساعد على السلامة؟', options: ['الانتباه واتباع التعليمات', 'الجري في الطريق', 'دفع الآخرين', 'تجاهل التحذيرات'], answer: 0 },
  'آلة الأورج': { question: 'أي آلة يمكن أن تعزف نغمات بالضغط على المفاتيح؟', options: ['الأورج 🎹', 'كرة ⚽', 'كتاب 📘', 'مقص ✂️'], answer: 0 },
  'عزف مقطوعة موسيقية على آلة الأورج': { question: 'قبل عزف المقطوعة، ماذا نفعل؟', options: ['نتعرف إلى النغمات والإيقاع', 'نضغط كل المفاتيح معًا', 'نتجاهل اللحن', 'نسرع دون استماع'], answer: 0 },
  'اللعبة الشعبية (تراني بقطع السناسل)': { question: 'ما الذي نحتاجه لنجاح لعبة شعبية مع المجموعة؟', options: ['تعاون وتوقيت مشترك', 'العمل دون الاستماع', 'تغيير القواعد كل لحظة', 'عدم المشاركة'], answer: 0 },
  'الميزان الثلاثي': { question: 'كم نبضة أساسية نتوقع في الميزان الثلاثي؟', options: ['ثلاث نبضات', 'نبضة واحدة', 'خمس نبضات', 'لا توجد نبضات'], answer: 0 },
  'إيقاع حركي (♫)': { question: 'ما أفضل طريقة لتكرار الإيقاع بدقة؟', options: ['الاستماع ثم التصفيق بانتظام', 'التصفيق عشوائيًا', 'تجاهل النبض', 'التوقف بعد كل صوت'], answer: 0 },
  'نشيد (حرف الأجداد)': { question: 'أيّ موضوع يرتبط بعنوان «حرف الأجداد»؟', options: ['الحرف والمهن التراثية', 'الكواكب فقط', 'وسائل النقل الحديثة فقط', 'أشكال هندسية فقط'], answer: 0 },
  'أربيج سلم (دو الكبير)': { question: 'ما الذي نسمعه في أربيج دو الكبير؟', options: ['نغمات سلم دو الكبير بالتتابع', 'أصوات حيوانات فقط', 'إيقاع بلا نغمات', 'أصوات عشوائية'], answer: 0 },
  'قراءة إيقاعية وغناء صولفائي': { question: 'ما الذي يساعدنا على قراءة الإيقاع والغناء الصولفائي؟', options: ['متابعة الرموز والنبض والنغمات', 'تجاهل الرموز', 'الغناء دون استماع', 'البدء من أي مكان عشوائيًا'], answer: 0 },
}

function FlagIllustration({ country }: { country: 'oman' | 'japan' | 'france' }) {
  if (country === 'japan') return <svg viewBox="0 0 120 72" className="w-full max-w-[120px] mx-auto rounded-md border border-slate-200" role="img" aria-label="علم اليابان"><rect width="120" height="72" fill="white"/><circle cx="60" cy="36" r="18" fill="#bc002d"/></svg>
  if (country === 'france') return <svg viewBox="0 0 120 72" className="w-full max-w-[120px] mx-auto rounded-md border border-slate-200" role="img" aria-label="علم فرنسا"><rect width="40" height="72" fill="#0055a4"/><rect x="40" width="40" height="72" fill="white"/><rect x="80" width="40" height="72" fill="#ef4135"/></svg>
  return <img src="https://raw.githubusercontent.com/arnoha98-hash/naghmati/main/oman-flag.jpg" className="w-full max-w-[120px] mx-auto rounded-md border border-slate-200" role="img" aria-label="علم سلطنة عُمان الأصلي" />
}

function playPitch(frequency: number) {
  const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioContextClass) return
  const context = new AudioContextClass()
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.type = 'triangle'
  oscillator.frequency.setValueAtTime(frequency, context.currentTime)
  // Resume suspended audio contexts (common on mobile browsers) after the user's tap.
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

export default function PreLessonActivity({ lesson }: { lesson: Lesson }) {
  const [choice, setChoice] = useState<number | null>(null)
  const activity = warmups[lesson.title] ?? {
    question: `ما المعلومة التي تساعدك على فهم درس «${lesson.title}»؟`,
    options: ['ألاحظ عنوان الدرس وأستمع جيدًا', 'أتجاهل الأمثلة', 'أجيب دون قراءة', 'أتوقف عن المشاركة'],
    answer: 0,
  }
  const isNationalAnthem = lesson.title === 'النشيد الوطني'
  return (
    <section className="rounded-[2rem] bg-gradient-to-br from-amber-100 via-white to-sky-100 border-2 border-white p-5 md:p-7 shadow-chunky">
      <div className="flex items-center gap-3 mb-4"><span className="grid place-items-center w-12 h-12 rounded-2xl bg-ink text-white text-xl font-extrabold shrink-0">1</span><span className="grid place-items-center w-14 h-14 rounded-2xl bg-amber-300 text-3xl shrink-0">💡</span><div><h2 className="text-2xl md:text-3xl font-extrabold">تهيّأ قبل أن تتعلّم</h2><p className="text-ink/65">نشاط قصير مرتبط بموضوع الدرس.</p></div></div>
      {lesson.title !== 'الحِدّة والغلظة – السرعة والبطء' && lesson.title !== 'العلامة الإيقاعية النوار (♩) والسكتة المقابلة لها' && <p className="text-xl font-extrabold mb-4">{activity.question}</p>}
      {lesson.title === 'العلامة الإيقاعية النوار (♩) والسكتة المقابلة لها' ? (
        <ClockWarmup />
      ) : lesson.warmupVideoUrl ? (
        <div className="rounded-2xl bg-ink p-2 md:p-3 shadow-chunky">
          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
            <iframe src={lesson.warmupVideoUrl} title={`تمهيد درس ${lesson.title}`} className="absolute inset-0 w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen loading="lazy" />
          </div>
          <p className="text-sm text-center text-ink/65 mt-3">شاهد الفيديو التمهيدي، ثم انتقل إلى فيديو الشرح والنشاط التفاعلي.</p>
        </div>
      ) : lesson.title === 'اللعبة الشعبية (حبّوه موه تدوري)' ? (
        <HabouhWarmup />
      ) : isNationalAnthem ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(['oman', 'japan', 'france'] as const).map((country, i) => <button key={country} onClick={() => { setChoice(i); if (lesson.title !== 'اللعبة الشعبية (حبّوه موه تدوري)') { i === activity.answer ? playCorrect() : playWrong() } }} className={`rounded-2xl border-2 p-4 font-bold transition ${choice === i ? (i === activity.answer ? 'border-emerald-500 bg-emerald-100' : 'border-rose-400 bg-rose-100') : 'border-white bg-white hover:bg-amber-50'}`}><FlagIllustration country={country}/><span className="block mt-3">{['سلطنة عُمان', 'اليابان', 'فرنسا'][i]}</span></button>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {activity.options.map((option, i) => <button key={option} onClick={() => setChoice(i)} className={`rounded-2xl border-2 p-4 text-lg font-bold transition ${choice === i ? (i === activity.answer ? 'border-emerald-500 bg-emerald-100' : 'border-rose-400 bg-rose-100') : 'border-white bg-white hover:bg-amber-50'}`}>{option}</button>)}
        </div>
      )}
      {choice !== null && lesson.title !== 'اللعبة الشعبية (حبّوه موه تدوري)' && <p className="font-extrabold text-lg mt-4" aria-live="polite">{choice === activity.answer ? 'أحسنت! إجابة رائعة 🌟' : 'محاولة جميلة! جرّب اختيارًا آخر.'}</p>}
      {activity.clue && <p className="text-ink/65 mt-3">{activity.clue}</p>}
    </section>
  )
}
