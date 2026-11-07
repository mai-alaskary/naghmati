import { useState } from 'react'
import { speak, stopSpeaking } from '@/lib/speech'

const phrases = [
  { text: 'حَبُّوه مُوه تَدُورِي؟', emoji: '👵🔍', hint: 'الأطفال يسألون الجدة', group: 'children' },
  { text: 'حَوْ عَلَيْش إِنْتِي وَأَوْلَادِش', emoji: '💬😮', hint: 'الجدة تردّ عليهم', group: 'grandma' },
  { text: 'أَدُورُ إِبْرَةً', emoji: '🪡🧵', hint: 'الجدة تبحث عن إبرة', group: 'grandma' },
  { text: 'حَالَ مُوه الْإِبْرَة؟', emoji: '🤔🪡', hint: 'الأطفال يسألون عن الإبرة', group: 'children' },
  { text: 'حَالَ مُوه الْبَيْض؟', emoji: '🥚🧺', hint: 'الأطفال يسألون عن البيض', group: 'children' },
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

  const acceptDrop = (event: React.DragEvent<HTMLDivElement>, group: string) => {
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
          <div className="text-6xl" aria-hidden>👵🏻</div>
          <h4 className="text-2xl font-extrabold text-violet-800">الجدة «حَبّوه»</h4>
          <p className="text-sm font-bold text-ink/60">ملابس عمانية تقليدية • اسحب العبارات التي قالتها الجدة هنا</p>
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
          <div className="text-6xl" aria-hidden>👧🏻👦🏻</div>
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
