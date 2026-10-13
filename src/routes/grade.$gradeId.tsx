import { useEffect, useState } from 'react'
import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { Trophy, Star, Share2 } from 'lucide-react'
import { getGrade } from '@/content/curriculum'
import { gradeTheme, unitColors } from '@/lib/theme'
import { img } from '@/lib/images'
import { lessonKey, useStars, useLessonSteps } from '@/lib/progress'
import RhythmFigure from '@/components/RhythmFigure'

const TEACHER_WHATSAPP = '96898778983'
const STUDENT_NAME_KEY = 'naghmati-achievement-name-v1'
const STUDENT_GRADE_KEY = 'naghmati-achievement-grade-v1'
const LESSON_STARS = 5

export const Route = createFileRoute('/grade/$gradeId')({
  loader: ({ params }) => {
    const grade = getGrade(params.gradeId)
    if (!grade) throw notFound()
    return { gradeId: grade.id }
  },
  head: ({ params }) => ({
    meta: [{ title: `${getGrade(params.gradeId)?.title ?? ''} — نغماتي` }],
  }),
  component: GradePage,
})

function GradePage() {
  const { gradeId } = Route.useLoaderData()
  const grade = getGrade(gradeId)!
  const t = gradeTheme[grade.theme]
  const stars = useStars()
  const lessonSteps = useLessonSteps()
  const [studentName, setStudentName] = useState('')
  const [studentClass, setStudentClass] = useState('')
  const [detailsLoaded, setDetailsLoaded] = useState(false)
  const [shareAttempted, setShareAttempted] = useState(false)
  const [achievementOpen, setAchievementOpen] = useState<Record<string, boolean>>({})
  const all = grade.units.flatMap((unit) => unit.lessons.map((lesson) => ({ unit, lesson })))
  const done = all.filter(({ unit, lesson }) => (lessonSteps[lessonKey(grade.id, `${unit.id}-${lesson.id}`)]?.length ?? 0) > 0 || (stars[lessonKey(grade.id, `${unit.id}-${lesson.id}`)] ?? 0) > 0).length

  useEffect(() => {
    try {
      setStudentName(localStorage.getItem(STUDENT_NAME_KEY) ?? '')
      setStudentClass(localStorage.getItem(STUDENT_GRADE_KEY) ?? '')
    } catch {
      // Keep the form usable when local storage is unavailable.
    }
    setDetailsLoaded(true)
  }, [])

  useEffect(() => {
    if (!detailsLoaded) return
    try {
      localStorage.setItem(STUDENT_NAME_KEY, studentName)
      localStorage.setItem(STUDENT_GRADE_KEY, studentClass)
    } catch {
      // Sharing still works if the browser blocks local storage.
    }
  }, [detailsLoaded, studentName, studentClass])

  const fullName = studentName.trim().split(/\\s+/).filter(Boolean).length >= 4
  const canShare = fullName && studentClass.trim().length > 0

  function shareAchievement(unitTitle: string, percentage: number) {
    setShareAttempted(true)
    if (!canShare) return
    const message = [
      'مرحبًا معلمتي،',
      '',
      `لقد أتممت جميع دروس ${unitTitle} على منصة نغماتي.`,
      `نسبة النجوم التي جمعتها: ${percentage}%.`,
      '',
      `الاسم الرباعي: ${studentName.trim()}`,
      `الصف الدراسي: ${studentClass.trim()}`,
      '',
      'شكرًا لكِ على دعمك وتشجيعك.',
      'رابط منصة نغماتي: https://mai-alaskary.github.io/naghmati/',
    ].join('\n')
    const url = `https://wa.me/${TEACHER_WHATSAPP}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div>
      <section className={`bg-gradient-to-br ${t.hero} text-white`}>
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-14 grid md:grid-cols-[1.3fr_1fr] gap-6 items-center">
          <div>
            <Link to="/" className="inline-block rounded-full bg-white/25 px-4 py-1 font-bold mb-4 hover:bg-white/35">
              → الرئيسية
            </Link>
            <h1 className="text-5xl md:text-6xl font-extrabold drop-shadow-sm">
              {grade.emoji} {grade.title}
            </h1>
            <p className="text-xl font-semibold text-white/90 mt-3">{grade.tagline}</p>
            <div className="mt-6 max-w-md">
              <div className="flex justify-between font-bold mb-2">
                <span>تقدّمي</span>
                <span>
                  {done} / {all.length} دروس
                </span>
              </div>
              <div className="h-4 rounded-full bg-white/30 overflow-hidden">
                <div
                  className="h-full rounded-full bg-white transition-all duration-700"
                  style={{ width: `${(done / all.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
          <div className="bg-white/90 rounded-[2rem] overflow-hidden hidden md:block">
            <img src={img(grade.image, 600)} alt="" width={600} height={340} className="w-full blend-img" />
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">
        {grade.units.map((unit, ui) => {
          const c = unitColors[ui % unitColors.length]
          const unitLessonProgress = unit.lessons.map((lesson) => {
            const key = lessonKey(grade.id, `${unit.id}-${lesson.id}`)
            return { lesson, key, count: Math.min(LESSON_STARS, lessonSteps[key]?.length ?? 0) }
          })
          const collectedStars = unitLessonProgress.reduce((sum, item) => sum + item.count, 0)
          const possibleStars = unit.lessons.length * LESSON_STARS
          const percentage = possibleStars > 0 ? Math.round((collectedStars / possibleStars) * 100) : 0
          const unitCompleted = unitLessonProgress.length > 0 && unitLessonProgress.every(({ key }) =>
            (lessonSteps[key]?.length ?? 0) > 0 || (stars[key] ?? 0) > 0,
          )

          return (
            <section key={unit.id} className={`rounded-[2rem] border-2 ${c.card} p-5 md:p-8`}>
              <div className="flex items-center gap-4 mb-6">
                <span className={`grid place-items-center w-16 h-16 rounded-2xl text-4xl ${c.icon} shrink-0`}>
                  {unit.emoji}
                </span>
                <div className="flex-1">
                  <span className={`inline-block rounded-full ${c.badge} text-white text-sm font-bold px-3 py-0.5`}>
                    الوحدة {ui + 1}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-extrabold mt-1">
                    {unit.title.replace(/^الوحدة [^:]+:\\s*/, '')}
                  </h2>
                </div>
                {unitCompleted && (
                  <div className="grid place-items-center w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 shrink-0" aria-label="وحدة مكتملة">
                    <Trophy size={32} aria-hidden="true" />
                  </div>
                )}
              </div>

              <div className="mb-6 rounded-2xl border border-amber-200 bg-white/90 p-4 md:p-5">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className="font-extrabold text-lg">⭐ نسبة جمع النجوم</span>
                  <span className="text-xl font-extrabold text-emerald-700">{percentage}%</span>
                </div>
                <div
                  className="h-3 rounded-full bg-slate-100 overflow-hidden"
                  role="progressbar"
                  aria-label={`نسبة جمع النجوم في ${unit.title}`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={percentage}
                >
                  <div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-emerald-400 transition-all duration-500" style={{ width: `${percentage}%` }} />
                </div>
                <div className="flex items-center justify-between gap-2 mt-2 text-sm font-bold text-ink/60">
                  <span>{collectedStars} من {possibleStars} نجمة</span>
                  <span>{unitCompleted ? 'أتممت دروس الوحدة! 🎉' : 'واصل التقدم واجمع المزيد من النجوم'}</span>
                </div>
                {unitCompleted && (
                  <button
                    type="button"
                    onClick={() => setAchievementOpen((previous) => ({ ...previous, [unit.id]: !previous[unit.id] }))}
                    aria-expanded={Boolean(achievementOpen[unit.id])}
                    aria-controls={`achievement-panel-${unit.id}`}
                    className="mt-4 flex w-full items-center justify-center gap-3 rounded-full bg-emerald-600 px-5 py-3 font-extrabold text-white shadow-chunky transition hover:bg-emerald-700"
                  >
                    <Share2 size={21} aria-hidden="true" />
                    {achievementOpen[unit.id] ? 'إخفاء مشاركة الإنجاز' : 'شارك إنجازي مع معلمتي'}
                  </button>
                )}
              </div>

              {unitCompleted && achievementOpen[unit.id] && (
                <div id={`achievement-panel-${unit.id}`} className="mb-6 overflow-hidden rounded-[2rem] border-2 border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-5 md:p-7 shadow-chunky">
                  <div className="text-center">
                    <div className="mx-auto mb-3 grid h-20 w-20 place-items-center rounded-3xl bg-amber-100 text-amber-600 animate-bounce-in">
                      <Trophy size={48} aria-hidden="true" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-extrabold text-ink">🎉 أحسنت! لقد أتممت دروس الوحدة</h3>
                    <p className="mt-2 text-lg font-bold text-ink/70">{unit.title}</p>
                    <p className="mt-2 text-ink/70">يمكنك العودة إلى الدروس لجمع المزيد من النجوم، ثم مشاركة أحدث إنجازاتك مع معلمتك.</p>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor={`student-name-${unit.id}`} className="mb-2 block font-extrabold text-ink">الاسم الرباعي</label>
                      <input
                        id={`student-name-${unit.id}`}
                        type="text"
                        autoComplete="name"
                        value={studentName}
                        onChange={(event) => setStudentName(event.target.value)}
                        placeholder="اكتب اسمك الرباعي"
                        aria-invalid={shareAttempted && !fullName}
                        className="w-full rounded-2xl border-2 border-amber-200 bg-white px-4 py-3 font-semibold text-ink outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                      />
                      {shareAttempted && !fullName && <p className="mt-1 text-sm font-bold text-rose-600">يرجى كتابة الاسم الرباعي كاملًا.</p>}
                    </div>
                    <div>
                      <label htmlFor={`student-class-${unit.id}`} className="mb-2 block font-extrabold text-ink">الصف الدراسي</label>
                      <input
                        id={`student-class-${unit.id}`}
                        type="text"
                        autoComplete="off"
                        value={studentClass}
                        onChange={(event) => setStudentClass(event.target.value)}
                        placeholder="مثال: الصف الرابع"
                        aria-invalid={shareAttempted && !studentClass.trim()}
                        className="w-full rounded-2xl border-2 border-amber-200 bg-white px-4 py-3 font-semibold text-ink outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                      />
                      {shareAttempted && !studentClass.trim() && <p className="mt-1 text-sm font-bold text-rose-600">يرجى كتابة الصف الدراسي.</p>}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => shareAchievement(unit.title, percentage)}
                    disabled={!canShare}
                    className="mt-5 flex w-full items-center justify-center gap-3 rounded-full bg-emerald-600 px-5 py-4 text-lg font-extrabold text-white shadow-chunky transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                  >
                    <Share2 size={22} aria-hidden="true" />
                    مشاركة إنجازي مع معلمتي عبر واتساب
                  </button>
                  {!canShare && (
                    <p className="mt-3 text-center text-sm font-bold text-ink/60">
                      اكتب اسمك الرباعي والصف الدراسي لتفعيل المشاركة.
                    </p>
                  )}
                  <p className="mt-3 text-center text-xs text-ink/55">ستُفتح رسالة جاهزة في واتساب؛ اضغط إرسال لإيصالها إلى المعلمة.</p>
                </div>
              )}

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {unit.lessons.map((lesson, li) => {
                  const key = lessonKey(grade.id, `${unit.id}-${lesson.id}`)
                  const s = Math.min(5, lessonSteps[key]?.length ?? 0)
                  return (
                    <Link
                      key={lesson.id}
                      to="/lesson/$gradeId/$lessonId"
                      params={{ gradeId: grade.id, lessonId: `${unit.id}-${lesson.id}` }}
                      className="group rounded-3xl bg-white p-5 shadow-chunky transition hover:-translate-y-1 flex flex-col"
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-5xl transition group-hover:scale-110 group-hover:rotate-[-8deg]">
                          {grade.id === 'grade-4' && unit.id === 'u1' && lesson.id === 'lesson3' ? <RhythmFigure className="w-14 h-14 text-ink" /> : lesson.emoji}
                        </span>
                        <span className={`rounded-full ${t.chip} text-sm font-bold px-3 py-1`}>الدرس {li + 1}</span>
                      </div>
                      <h3 className="text-xl font-extrabold mt-3 mb-1">{lesson.title}</h3>
                      <p className="text-ink/60 text-sm flex-1">{lesson.objectives[0]}</p>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex gap-0.5 text-lg" aria-label={`${s} من 5 نجوم`}>{[1,2,3,4,5].map(n=><span key={n} className={n <= s ? 'text-amber-400' : 'text-slate-200'}><Star size={18} fill={n <= s ? 'currentColor' : 'none'} strokeWidth={1.5} /></span>)}</div>
                        <span className={`font-bold ${t.text}`}>{s > 0 ? 'راجع ↺' : 'ابدأ ←'}</span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
