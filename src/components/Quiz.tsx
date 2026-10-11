import { useEffect, useState } from 'react'
import type { Question } from '@/content/curriculum'
import { playCorrect, playWrong } from '@/lib/audio'
import { saveStars } from '@/lib/progress'
import { canSpeak, speak } from '@/lib/speech'
import StarRow from './StarRow'

const cardColors = [
  'bg-pink-100 border-pink-300 hover:bg-pink-200',
  'bg-sky-100 border-sky-300 hover:bg-sky-200',
  'bg-amber-100 border-amber-300 hover:bg-amber-200',
  'bg-emerald-100 border-emerald-300 hover:bg-emerald-200',
]

const praise = ['إجابة صحيحة! 🎉', 'رائع! أحسنت 🌟', 'ممتاز! 👏', 'بطل الموسيقى! 🏆']

type Props = { questions: Question[]; progressKey: string; onFinish?: () => void }

export default function Quiz({ questions, progressKey, onFinish }: Props) {
  const [index, setIndex] = useState(0)
  const [wrong, setWrong] = useState<number[]>([])
  const [solved, setSolved] = useState(false)
  const [firstTry, setFirstTry] = useState(0)
  const [finished, setFinished] = useState(false)
  const [shake, setShake] = useState<number | null>(null)
  const [speechOk, setSpeechOk] = useState(false)

  useEffect(() => setSpeechOk(canSpeak()), [])

  const q = questions[index]
  const total = questions.length

  const choose = (i: number) => {
    if (solved || wrong.includes(i)) return
    if (i === q.answer) {
      setSolved(true)
      if (wrong.length === 0) setFirstTry((n) => n + 1)
      playCorrect()
    } else {
      setWrong((w) => [...w, i])
      setShake(i)
      setTimeout(() => setShake(null), 450)
      playWrong()
    }
  }

  const next = () => {
    if (index + 1 < total) {
      setIndex(index + 1)
      setWrong([])
      setSolved(false)
    } else {
      const ratio = firstTry / total
      saveStars(progressKey, ratio === 1 ? 3 : ratio >= 0.6 ? 2 : 1)
      setFinished(true)
      onFinish?.()
    }
  }

  const restart = () => {
    setIndex(0)
    setWrong([])
    setSolved(false)
    setFirstTry(0)
    setFinished(false)
  }

  if (finished) {
    const ratio = firstTry / total
    const s = ratio === 1 ? 3 : ratio >= 0.6 ? 2 : 1
    return (
      <div className="relative overflow-hidden rounded-[2rem] bg-white p-8 text-center shadow-chunky">
        <Confetti />
        <div className="text-7xl mb-3 animate-bounce-in">{s === 3 ? '🏆' : s === 2 ? '🎉' : '💪'}</div>
        <h3 className="text-3xl font-extrabold mb-2">
          {s === 3 ? 'مذهل! أجبت عن كل الأسئلة' : s === 2 ? 'عمل رائع!' : 'أحسنت المحاولة!'}
        </h3>
        <p className="text-lg text-ink/65 mb-4">
          أجبت من المحاولة الأولى عن {firstTry} من {total} أسئلة
        </p>
        <StarRow value={s} size="text-5xl" />
        <div className="mt-6">
          <button onClick={restart} className="rounded-full bg-violet-500 text-white px-8 py-3 font-extrabold shadow-chunky">
            ↺ أعد المحاولة
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-[2rem] bg-white p-5 md:p-8 shadow-chunky">
      <div className="flex items-center justify-between gap-3 mb-5">
        <span className="rounded-full bg-violet-100 text-violet-700 font-bold px-4 py-1">
          السؤال {index + 1} من {total}
        </span>
        <div className="flex gap-1.5">
          {questions.map((_, i) => (
            <span
              key={i}
              className={`w-3 h-3 rounded-full ${i < index || (i === index && solved) ? 'bg-emerald-400' : i === index ? 'bg-violet-400' : 'bg-ink/10'}`}
            />
          ))}
        </div>
      </div>

      <div className="flex items-start gap-4 mb-6">
        {q.emoji && <span className="text-5xl md:text-6xl shrink-0">{q.emoji}</span>}
        <h3 className="text-2xl md:text-3xl font-extrabold leading-snug flex-1">{q.question}</h3>
        {speechOk && (
          <button
            onClick={() => speak(`${q.question}. ${q.options.join('، ')}`)}
            className="shrink-0 w-12 h-12 rounded-full bg-amber-300 hover:bg-amber-400 text-xl shadow-chunky"
            aria-label="اقرأ السؤال بصوت عالٍ"
          >
            🔊
          </button>
        )}
      </div>

      <div className={`grid gap-3 md:gap-4 ${q.options.length <= 2 ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}>
        {q.options.map((opt, i) => {
          const isWrong = wrong.includes(i)
          const isRight = solved && i === q.answer
          return (
            <button
              key={i}
              onClick={() => choose(i)}
              disabled={solved || isWrong}
              className={[
                'relative rounded-3xl border-[3px] p-5 text-xl md:text-2xl font-bold text-center transition min-h-20',
                'shadow-chunky',
                isRight
                  ? 'bg-emerald-400 border-emerald-500 text-white animate-pop'
                  : isWrong
                    ? 'bg-red-100 border-red-300 text-red-400 line-through opacity-70'
                    : solved
                      ? 'bg-ink/5 border-transparent opacity-50'
                      : cardColors[i % cardColors.length],
                shake === i ? 'animate-wiggle' : '',
              ].join(' ')}
            >
              {q.visualOptions?.[i] ? <NotationOption kind={q.visualOptions[i]} label={opt} /> : opt}
              {isRight && <span className="absolute -top-3 -left-3 text-3xl">✅</span>}
              {isWrong && <span className="absolute -top-3 -left-3 text-3xl">❌</span>}
            </button>
          )
        })}
      </div>

      <div aria-live="polite" className="min-h-20 mt-6">
        {solved ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-emerald-50 border-2 border-emerald-200 p-4 animate-bounce-in">
            <p className="text-2xl font-extrabold text-emerald-600">{praise[index % praise.length]}</p>
            <button onClick={next} className="rounded-full bg-emerald-500 text-white px-8 py-3 text-lg font-extrabold shadow-chunky">
              {index + 1 < total ? 'السؤال التالي ←' : 'النتيجة 🏁'}
            </button>
          </div>
        ) : wrong.length > 0 ? (
          <div className="rounded-3xl bg-orange-50 border-2 border-orange-200 p-4 animate-bounce-in">
            <p className="text-2xl font-extrabold text-orange-600">حاول مرة أخرى 💪</p>
            {q.hint && <p className="text-lg text-ink/70 mt-1">💡 {q.hint}</p>}
          </div>
        ) : null}
      </div>
    </div>
  )
}

function Confetti() {
  const bits = ['🎵', '⭐', '🎶', '✨', '🎉', '♪', '🌟', '♫']
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {Array.from({ length: 16 }).map((_, i) => (
        <span
          key={i}
          className="absolute top-0 text-2xl"
          style={{
            left: `${(i * 37) % 100}%`,
            animation: `confetti-fall ${1.6 + (i % 4) * 0.4}s ease-in ${(i % 5) * 0.15}s forwards`,
          }}
        >
          {bits[i % bits.length]}
        </span>
      ))}
    </div>
  )
}


function NotationOption({ kind, label }: { kind: 'legato' | 'staccato' | 'piano' | 'forte' | 'crescendo' | 'diminuendo'; label: string }) {
  const aria = ({ legato: 'نغمات متصلة بقوس', staccato: 'نغمات عليها نقاط الاستكاتو', piano: 'الرمز p للبيانو الهادئ', forte: 'الرمز f للفورتي القوي', crescendo: 'تدرج من الضعيف إلى القوي', diminuendo: 'تدرج من القوي إلى الضعيف' } as const)[kind]
  return (
    <div className="flex flex-col items-center gap-2" aria-label={label}>
      <svg viewBox="0 0 220 78" role="img" aria-label={aria} className="w-full max-w-[260px] h-auto">
        {(kind === 'legato' || kind === 'staccato') && <>
          {[35, 82, 129, 176].map((x) => <g key={x}><line x1={x+5} y1="12" x2={x+5} y2="47" stroke="currentColor" strokeWidth="1.8"/><ellipse cx={x} cy="47" rx="7" ry="4.5" transform={`rotate(-25 ${x} 47)`} fill="currentColor"/>{kind === 'staccato' && <circle cx={x} cy="59" r="2.7" fill="currentColor"/>}</g>)}
          {kind === 'legato' && <path d="M 28 57 Q 105 88 184 57" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/>}
        </>}
        {(kind === 'piano' || kind === 'forte') && <text x="110" y="59" textAnchor="middle" fontFamily="serif" fontStyle="italic" fontWeight="bold" fontSize="64" fill="currentColor">{kind === 'piano' ? 'p' : 'f'}</text>}
        {kind === 'crescendo' && <path d="M 30 40 L 190 20 M 30 40 L 190 60" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/>}
        {kind === 'diminuendo' && <path d="M 30 20 L 190 40 M 30 60 L 190 40" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/>}
      </svg>
      <span className="text-base font-extrabold">{label}</span>
    </div>
  )
}
