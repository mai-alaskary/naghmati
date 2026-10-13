import { grades } from '@/content/curriculum'

type KnowledgeEntry = {
  question: string
  answer: string
  grade: string
  unit: string
  lesson: string
  keywords: string[]
}

const normalize = (value: string) =>
  value
    .toLocaleLowerCase('ar')
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/[^؀-ۿa-z0-9\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const ignoredWords = new Set([
  'ما', 'ماذا', 'كيف', 'هل', 'هو', 'هي', 'عن', 'في', 'من', 'الى', 'على',
  'اي', 'ايه', 'يعني', 'معني', 'شرح', 'اشرح', 'ممكن', 'لو', 'سمحت',
  'درس', 'الدرس', 'المنهج', 'الموسيقي', 'الموسيقى', 'نغماتي', 'العم', 'صول',
])

const tokens = (value: string) =>
  normalize(value).split(' ').filter((word) => word.length > 1 && !ignoredWords.has(word))

const entries: KnowledgeEntry[] = grades.flatMap((grade) =>
  grade.units.flatMap((unit) =>
    unit.lessons.flatMap((lesson) => {
      const context = { grade: grade.title, unit: unit.title, lesson: lesson.title }
      const lessonEntries: KnowledgeEntry[] = [
        {
          ...context,
          question: lesson.title,
          answer: `عنوان الدرس هو «${lesson.title}» ضمن ${grade.title}، ${unit.title}. ${lesson.objectives.join(' ')}`,
          keywords: [lesson.title, ...lesson.objectives],
        },
        ...lesson.quiz.map((quiz) => {
          const correct = quiz.options[quiz.answer]
          const answer = quiz.hint
            ? `${correct}. ${quiz.hint}`
            : correct
          return {
            ...context,
            question: quiz.question,
            answer,
            keywords: [quiz.question, correct, quiz.hint ?? '', ...lesson.objectives, lesson.title],
          }
        }),
        ...lesson.activities.map((activity) => ({
          ...context,
          question: activity.title,
          answer: `${activity.title}: ${activity.description}`,
          keywords: [activity.title, activity.description, lesson.title],
        })),
      ]
      return lessonEntries
    }),
  ),
)

export const suggestedSolQuestions = [
  'ما دروس الصف الأول؟',
  'ما معنى الفورتي؟',
  'ما درس النوار والسكتة؟',
  'كيف أبدأ الدرس؟',
]

function answerLessonList(question: string): string | undefined {
  const normalized = normalize(question)
  if (!/(دروس|الدروس|وحدات|الوحدات|محتويات|عناوين)/.test(normalized)) return undefined
  const grade = grades.find((item) => normalized.includes(normalize(item.title)) || normalized.includes(normalize(item.shortTitle)))
  if (!grade) return undefined
  return grade.units
    .map((unit) => `${unit.title}: ${unit.lessons.map((lesson) => lesson.title).join('، ')}`)
    .join('\n')
}

export function findUncleSolAnswer(question: string): { answer: string; source: string } | undefined {
  const normalizedQuestion = normalize(question)
  if (!normalizedQuestion || normalizedQuestion.length > 700) return undefined

  const listAnswer = answerLessonList(normalizedQuestion)
  if (listAnswer) return { answer: listAnswer, source: 'فهرس المنهج' }

  if (/(ابدا|ابدأ|بدايه|البدايه|كيف ادرس|طريقة الدراسة)/.test(normalizedQuestion)) {
    return {
      answer: 'بحسب تعليمات الدروس في المنصة: ابدأ بمشاهدة شرح الدرس، ثم أجب عن الأسئلة، وبعدها انتقل إلى التطبيق أو المختبر الموسيقي.',
      source: 'تعليمات الدرس',
    }
  }

  const questionTokens = new Set(tokens(normalizedQuestion))
  if (questionTokens.size === 0) return undefined

  // For a single clear term (for example, "فورتي"), prefer a matching
  // curriculum quiz answer rather than guessing from broad word overlap.
  if (questionTokens.size === 1) {
    const term = [...questionTokens][0]
    const direct = entries.find((entry) =>
      normalize(entry.answer).includes(term) &&
      (normalize(entry.question).includes(term) || normalize(entry.lesson).includes(term)),
    )
    if (direct) {
      return {
        answer: `${direct.answer}\n\n📚 المصدر: ${direct.grade} — ${direct.unit} — ${direct.lesson}`,
        source: direct.lesson,
      }
    }
  }

  let best: { entry: KnowledgeEntry; score: number; overlap: number } | undefined
  for (const entry of entries) {
    const normalizedTitle = normalize(entry.lesson)
    const normalizedPrompt = normalize(entry.question)
    let overlap = 0
    for (const word of questionTokens) {
      if (tokens(entry.keywords.join(' ')).some((candidate) => candidate === word)) overlap += 1
    }
    const coverage = overlap / questionTokens.size
    const titleMatch = normalizedQuestion.includes(normalizedTitle) && normalizedTitle.length > 3
    const exactPrompt = normalizedQuestion === normalizedPrompt
    const score = exactPrompt ? 2 : titleMatch ? 1.2 + coverage : coverage
    if (!best || score > best.score) best = { entry, score, overlap }
  }

  if (!best || best.overlap < 1 || best.score < 0.58) return undefined
  if (best.overlap < 2 && best.score < 1.2) return undefined

  return {
    answer: `${best.entry.answer}\n\n📚 المصدر: ${best.entry.grade} — ${best.entry.unit} — ${best.entry.lesson}`,
    source: best.entry.lesson,
  }
}

export const uncleSolFallback =
  'مش لاقي إجابة مؤكدة لسؤالك في محتوى المنهج الموجود عندي حاليًا. 🎵 جرّب تكتب اسم الدرس أو اختَر أحد الأسئلة المقترحة، ولو المعلومة مش موجودة هسيبها من غير تخمين.'
