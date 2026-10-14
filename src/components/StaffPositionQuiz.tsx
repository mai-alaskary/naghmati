import { useState } from 'react'
import { playCorrect, playWrong } from '@/lib/audio'

type StaffChoice = { name: string; y: number; position: string }
type StaffQuestion = { id: number; prompt: string; choices: StaffChoice[]; answer: number; explanation: string }

const questions: StaffQuestion[] = [
  {
    id: 1,
    prompt: 'ما اسم الخط الأول للمدرج الموسيقي؟',
    choices: [
      { name: 'مي', y: 72, position: 'على الخط الأول من أسفل' },
      { name: 'صول', y: 61, position: 'على الخط الثاني من أسفل' },
    ],
    answer: 0,
    explanation: 'صحيح! اسم الخط الأول من أسفل المدرج هو مي.',
  },
  {
    id: 2,
    prompt: 'ما اسم المسافة الثالثة للمدرج الموسيقي؟',
    choices: [
      { name: 'لا', y: 55.5, position: 'في المسافة الثانية من أسفل' },
      { name: 'دو', y: 44.5, position: 'في المسافة الثالثة من أسفل' },
    ],
    answer: 1,
    explanation: 'أحسنت! اسم المسافة الثالثة من أسفل المدرج هو دو.',
  },
]

function StaffChoiceImage({ choice, selected, correct }: { choice: StaffChoice; selected: boolean; correct: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <svg viewBox="0 0 240 112" role="img" aria-label={`مفتاح صول ونغمة ${choice.name} ${choice.position}`} className="w-full max-w-[260px] h-auto">
        <rect x="4" y="5" width="232" height="102" rx="12" fill="#fffdf5" />
        {[28, 39, 50, 61, 72].map(y => <line key={y} x1="15" y1={y} x2="225" y2={y} stroke="#334155" strokeWidth="1.8" />)}
        <text x="20" y="80" fontSize="74" fontFamily="serif" fill="#7c3aed">𝄞</text>
        <ellipse cx="157" cy={choice.y} rx="10" ry="6.5" transform={`rotate(-22 157 ${choice.y})`} fill={selected && correct ? '#059669' : '#7c3aed'} stroke={selected && correct ? '#047857' : '#5b21b6'} strokeWidth="1" />
        <line x1="166" y1={choice.y} x2="166" y2={choice.y - 29} stroke={selected && correct ? '#059669' : '#7c3aed'} strokeWidth="2" />
      </svg>
      <span className="text-lg font-extrabold">{choice.name}</span>
      <span className="text-sm text-slate-600">{choice.position}</span>
    </div>
  )
}

export default function StaffPositionQuiz() {
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [wrong, setWrong] = useState<Record<number, number[]>>({})

  function choose(question: StaffQuestion, index: number) {
    if (answers[question.id] !== undefined || (wrong[question.id] || []).includes(index)) return
    if (index === question.answer) {
      setAnswers(old => ({ ...old, [question.id]: index }))
      playCorrect()
    } else {
      setWrong(old => ({ ...old, [question.id]: [...(old[question.id] || []), index] }))
      playWrong()
    }
  }

  return (
    <div className="mt-6 space-y-5">
      <div className="rounded-3xl border-2 border-violet-100 bg-violet-50 p-4 md:p-6">
        <h3 className="mb-2 text-xl font-extrabold md:text-2xl">🎼 تحدّي الخطوط والمسافات</h3>
        <p className="mb-5 text-slate-700">اقرأ السؤال، ثم اختر صورة المدرج التي تظهر النغمة في موضعها الصحيح وتحمل اسمها.</p>
        <div className="space-y-5">
          {questions.map(question => {
            const answered = answers[question.id] !== undefined
            const wrongChoices = wrong[question.id] || []
            return (
              <article key={question.id} className="rounded-3xl border-2 border-violet-100 bg-white p-4 md:p-5">
                <div className="mb-4 flex items-center gap-3">
                  <span className="rounded-full bg-violet-100 px-3 py-1 text-sm font-extrabold text-violet-800">السؤال {question.id} من 2</span>
                  <h4 className="text-lg font-extrabold md:text-xl">{question.prompt}</h4>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {question.choices.map((choice, index) => {
                    const isRight = answered && index === question.answer
                    const isWrong = wrongChoices.includes(index)
                    return (
                      <button
                        key={choice.name}
                        type="button"
                        onClick={() => choose(question, index)}
                        disabled={answered || isWrong}
                        aria-pressed={isRight}
                        className={`relative rounded-3xl border-[3px] p-3 text-center shadow-sm transition ${isRight ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : isWrong ? 'border-rose-300 bg-rose-50 text-rose-400 opacity-80' : 'border-slate-100 bg-amber-50 hover:border-violet-300 hover:bg-violet-50'} disabled:cursor-default`}
                      >
                        <StaffChoiceImage choice={choice} selected={isRight} correct={isRight} />
                        {isRight && <span className="absolute left-2 top-2 text-2xl" aria-label="إجابة صحيحة">✅</span>}
                        {isWrong && <span className="absolute left-2 top-2 text-2xl" aria-label="إجابة غير صحيحة">❌</span>}
                      </button>
                    )
                  })}
                </div>
                <p className={`mt-3 min-h-7 font-extrabold ${answered ? 'text-emerald-700' : wrongChoices.length ? 'text-rose-600' : 'text-slate-500'}`} aria-live="polite">
                  {answered ? question.explanation : wrongChoices.length ? 'محاولة جميلة! تأمّل موضع النغمة على المدرج وحاول بالصورة الأخرى. 💪' : 'اختر الصورة الصحيحة.'}
                </p>
              </article>
            )
          })}
        </div>
        <div className="mt-4 rounded-2xl bg-white p-4 text-center">
          <p className="font-extrabold text-violet-900">النتيجة: {Object.keys(answers).length} من 2</p>
          {Object.keys(answers).length === 2 && <p className="mt-2 text-lg font-extrabold text-emerald-700">رائع! عرفت الخط الأول والمسافة الثالثة! ⭐🎉</p>}
          <button type="button" onClick={() => { setAnswers({}); setWrong({}) }} className="mt-3 rounded-full bg-violet-500 px-5 py-2 font-extrabold text-white hover:bg-violet-600">إعادة السؤالين ↺</button>
        </div>
      </div>
    </div>
  )
}
