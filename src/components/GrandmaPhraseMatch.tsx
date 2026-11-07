import { useState, type DragEvent } from 'react'
import { speak, stopSpeaking } from '@/lib/speech'

const phrases = [
  { text: 'حُبُّوهْ مُو تْدَوِّرِي،', emoji: '👵🔍', hint: 'الأطفال يسألون الجدة', group: 'children' },
  { text: 'حُو عَلَيْش إِنْتِي وَأَوْلَادِش.', emoji: '💬😮', hint: 'الجدة تردّ عليهم', group: 'grandma' },
  { text: 'أَدَوِّرْ إِبْرَة.', emoji: '🪡🧵', hint: 'الجدة تبحث عن إبرة', group: 'grandma' },
  { text: 'حَالْ مُوه الإِبْرَة.', emoji: '🤔🪡', hint: 'الأطفال يسألون عن الإبرة', group: 'children' },
  { text: 'حَالْ مُوه البِيْض', emoji: '🥚🧺', hint: 'الأطفال يسألون عن البيض', group: 'children' },
] as const

export default function GrandmaPhraseMatch() {
  const [placed, setPlaced] = useState<Record<number, string>>({})
  const [selected, setSelected] = useState<number | null>(null)
  const [wrong, setWrong] = useState<number | null>(null)
  const [celebrate, setCelebrate] = useState(false)
  const completed = phrases.every((_, i) => placed[i] === phrases[i].group)

  const say = (index: number) => speak(phrases[index].text)
  const place = (index: number, group: string) => {
    if (placed[index]) return
    if (phrases[index].group !== group) {
      setWrong(index)
      setTimeout(() => setWrong((current) => current === index ? null : current), 700)
      speak('حاول مرة أخرى')
      return
    }
    setPlaced((current) => ({ ...current, [index]: group }))
    setSelected(null)
    setWrong(null)
    say(index)
    if (phrases.every((phrase, i) => i === index || currentPlaced(i, placed, phrase.group))) {
      setCelebrate(true)
    }
  }

  const currentPlaced = (i: number, state: Record<number, string>, group: string) => state[i] === group

  const acceptDrop = (event: DragEvent<HTMLDivElement>, group: string) => {
    event.preventDefault()
    const value = event.dataTransfer.getData('text/plain')
    if (value !== '') place(Number(value), group)
  }

  return (
    <section className="mt-6 overflow-hidden rounded-[2rem] border-2 border-amber-200 bg-gradient-to-br from-amber-50 via-white to-pink-50 p-4 md:p-6 shadow-chunky" dir="rtl">
      <div className="text-center">
        <div className="text-4xl" aria-hidden>🎭 🗣️ 🎵</div>
        <h3 className="mt-2 text-2xl md:text-3xl font-extrabold text-ink">نشاط مطابقة وتصنيف</h3>
        <p className="mt-1 text-lg font-bold text-ink/65">من قائل هذه العبارة؟</p>
        <p className="mt-2 text-sm md:text-base font-semibold text-ink/60">اسحب البطاقة إلى من قالها، أو اضغط عليها ثم اختر الشخصية. اضغط 🔊 لسماع العبارة.</p>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {phrases.map((phrase, i) => {
          const done = Boolean(placed[i])
          return (
            <button
              key={i}
              type="button"
              draggable={!done}
              onDragStart={(event) => event.dataTransfer.setData('text/plain', String(i))}
              onClick={() => { setSelected(i); say(i) }}
              disabled={done}
              className={`relative min-h-36 rounded-3xl border-[3px] p-3 text-center shadow-sm transition ${['bg-pink-100 border-pink-300','bg-emerald-100 border-emerald-300','bg-amber-100 border-amber-300','bg-sky-100 border-sky-300','bg-orange-100 border-orange-300'][i]} ${selected === i ? 'ring-4 ring-violet-400 scale-[1.02]' : ''} ${wrong === i ? 'animate-wiggle border-red-400' : ''} ${done ? 'opacity-60' : 'hover:-translate-y-1 cursor-grab'}`}
            >
              <span className="absolute left-3 top-2 text-sm font-black text-ink/45">{i + 1}</span>
              <span className="block text-4xl" aria-hidden>{phrase.emoji}</span>
              <span className="mt-2 block text-xl md:text-2xl font-extrabold leading-relaxed">{phrase.text}</span>
              <span className="mt-1 block text-sm font-bold text-ink/60">{phrase.hint}</span>
              {done && <span className="absolute -top-2 -right-2 text-3xl">⭐</span>}
            </button>
          )
        })}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => acceptDrop(event, 'grandma')}
          onClick={() => selected !== null && place(selected, 'grandma')}
          className={`min-h-48 rounded-[2rem] border-4 border-dashed border-violet-300 bg-violet-50 p-4 text-center transition ${selected !== null ? 'cursor-pointer hover:bg-violet-100' : ''}`}
        >
          <div className="mx-auto flex h-52 items-end justify-center" aria-label="رسم كرتوني كامل للجدة حبّوه" role="img">
            <svg viewBox="0 0 180 220" className="h-full w-auto max-w-full" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="90" cy="210" rx="53" ry="7" fill="#312e81" opacity=".12"/>
              <path d="M43 204 Q45 151 60 132 L72 119 H108 L120 132 Q135 151 137 204Z" fill="#8b5cf6" stroke="#5b3a8a" strokeWidth="3"/>
              <path d="M65 133 L90 154 L115 133 L108 204 H72Z" fill="#d97706"/>
              <path d="M73 132 L90 150 L107 132" fill="none" stroke="#fef3c7" strokeWidth="5"/>
              <path d="M65 72 Q48 83 49 120 Q52 151 90 157 Q128 151 131 120 Q132 83 115 72 Q105 50 90 51 Q75 50 65 72Z" fill="#64748b" stroke="#475569" strokeWidth="3"/>
              <path d="M67 86 Q63 62 90 59 Q117 62 113 86 L108 112 Q102 128 90 129 Q78 128 72 112Z" fill="#d99a70" stroke="#9a5b43" strokeWidth="2"/>
              <path d="M65 89 Q58 67 76 56 Q90 43 105 56 Q122 67 115 91 L107 81 Q90 69 73 82Z" fill="#64748b"/>
              <path d="M78 98 Q84 93 89 98 M96 98 Q102 93 107 98" fill="none" stroke="#3f2d2a" strokeWidth="3" strokeLinecap="round"/>
              <circle cx="83" cy="104" r="2.5" fill="#292524"/><circle cx="102" cy="104" r="2.5" fill="#292524"/>
              <path d="M83 115 Q91 123 100 115" fill="none" stroke="#9f4b4b" strokeWidth="3" strokeLinecap="round"/>
              <path d="M72 139 L90 150 L108 139" fill="none" stroke="#fcd34d" strokeWidth="4"/>
              <circle cx="90" cy="164" r="4" fill="#fde68a"/>
              <path d="M48 160 L37 193 M132 160 L143 193" stroke="#d99a70" strokeWidth="10" strokeLinecap="round"/>
              <path d="M36 194 Q43 201 51 194 M129 194 Q137 201 144 194" fill="none" stroke="#d99a70" strokeWidth="8" strokeLinecap="round"/>
            </svg>
          </div>
          <h4 className="text-2xl font-extrabold text-violet-800">الجدة «حَبّوه»</h4>
          <p className="text-sm font-bold text-ink/60">اسحب العبارات التي قالتها الجدة هنا</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {phrases.map((phrase, i) => placed[i] === 'grandma' && <span key={i} className="rounded-xl bg-white px-3 py-2 font-extrabold shadow-sm">{phrase.text} ⭐</span>)}
          </div>
        </div>
        <div
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => acceptDrop(event, 'children')}
          onClick={() => selected !== null && place(selected, 'children')}
          className={`min-h-48 rounded-[2rem] border-4 border-dashed border-sky-300 bg-sky-50 p-4 text-center transition ${selected !== null ? 'cursor-pointer hover:bg-sky-100' : ''}`}
        >
          <div className="mx-auto flex h-52 items-end justify-center" aria-label="رسوم كرتونية كاملة لمجموعة من التلاميذ" role="img">
            <svg viewBox="0 0 260 220" className="h-full w-auto max-w-full" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="130" cy="211" rx="112" ry="7" fill="#0369a1" opacity=".12"/>
              <g stroke="#334155" strokeWidth="2.5" strokeLinejoin="round">
                <path d="M22 205 L27 143 Q30 125 48 125 H68 Q86 125 89 143 L94 205Z" fill="#f97360"/>
                <path d="M33 145 L57 159 L80 145 L84 205 H29Z" fill="#ef6b58"/>
                <path d="M37 204 L36 216 M78 204 L80 216" stroke="#d69a72" strokeWidth="9" strokeLinecap="round"/>
                <circle cx="58" cy="91" r="31" fill="#d99a70"/>
                <path d="M28 89 Q26 55 57 56 Q88 57 88 89 L81 76 Q59 65 37 79Z" fill="#3f302c"/>
                <path d="M44 94 Q51 89 56 94 M64 94 Q70 89 76 94" fill="none" stroke="#3f302c" strokeWidth="3"/>
                <path d="M49 108 Q59 117 69 108" fill="none" stroke="#9f4b4b" strokeWidth="3" strokeLinecap="round"/>
                <path d="M94 205 L99 143 Q102 125 120 125 H143 Q161 125 164 143 L169 205Z" fill="#0ea5a4"/>
                <path d="M105 145 L131 160 L154 145 L159 205 H100Z" fill="#0f766e"/>
                <path d="M108 204 L108 216 M155 204 L157 216" stroke="#d99a70" strokeWidth="9" strokeLinecap="round"/>
                <circle cx="131" cy="91" r="31" fill="#d99a70"/>
                <path d="M101 87 Q102 55 131 56 Q160 57 162 88 L153 76 Q130 65 109 79Z" fill="#49352e"/>
                <path d="M116 94 Q123 89 128 94 M137 94 Q144 89 149 94" fill="none" stroke="#3f302c" strokeWidth="3"/>
                <path d="M121 108 Q131 117 141 108" fill="none" stroke="#9f4b4b" strokeWidth="3" strokeLinecap="round"/>
                <path d="M174 205 L179 143 Q182 125 200 125 H220 Q238 125 241 143 L246 205Z" fill="#fbbf24"/>
                <path d="M185 145 L210 159 L231 145 L236 205 H180Z" fill="#2563eb"/>
                <path d="M188 204 L188 216 M233 204 L235 216" stroke="#d99a70" strokeWidth="9" strokeLinecap="round"/>
                <circle cx="210" cy="91" r="31" fill="#d99a70"/>
                <path d="M180 87 Q181 55 210 56 Q239 57 241 88 L232 76 Q209 65 188 79Z" fill="#3b302b"/>
                <path d="M195 94 Q202 89 207 94 M216 94 Q223 89 228 94" fill="none" stroke="#3f2d2a" strokeWidth="3"/>
                <path d="M200 108 Q210 117 220 108" fill="none" stroke="#9f4b4b" strokeWidth="3" strokeLinecap="round"/>
              </g>
            </svg>
          </div>
          <h4 className="text-2xl font-extrabold text-sky-800">مجموعة الأطفال</h4>
          <p className="text-sm font-bold text-ink/60">التلاميذ • اسحب العبارات التي قالها الأطفال هنا</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {phrases.map((phrase, i) => placed[i] === 'children' && <span key={i} className="rounded-xl bg-white px-3 py-2 font-extrabold shadow-sm">{phrase.text} ⭐</span>)}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/80 p-3">
        <span className="font-extrabold text-ink">⭐ تم تصنيف {Object.keys(placed).length} من 5 عبارات</span>
        <button type="button" onClick={() => { stopSpeaking(); setPlaced({}); setSelected(null); setWrong(null); setCelebrate(false) }} className="rounded-full bg-white px-5 py-2 font-extrabold shadow-chunky">↺ إعادة النشاط</button>
      </div>
      {celebrate && completed && (
        <div className="mt-4 rounded-3xl border-2 border-emerald-300 bg-emerald-100 p-5 text-center animate-bounce-in">
          <div className="text-5xl" aria-hidden>🎉 🌟 🏆</div>
          <p className="mt-2 text-2xl font-extrabold text-emerald-800">أحسنت! صنّفت كل العبارات بشكل صحيح!</p>
          <p className="font-bold text-emerald-700">رائع يا بطل نغمتي!</p>
        </div>
      )}
    </section>
  )
}
