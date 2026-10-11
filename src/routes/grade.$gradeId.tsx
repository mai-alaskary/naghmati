import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { getGrade } from '@/content/curriculum'
import { gradeTheme, unitColors } from '@/lib/theme'
import { img } from '@/lib/images'
import { lessonKey, useStars, useLessonSteps } from '@/lib/progress'

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
  const all = grade.units.flatMap((unit) => unit.lessons.map((lesson) => ({ unit, lesson })))
  const done = all.filter(({ unit, lesson }) => (lessonSteps[lessonKey(grade.id, `${unit.id}-${lesson.id}`)]?.length ?? 0) > 0 || (stars[lessonKey(grade.id, `${unit.id}-${lesson.id}`)] ?? 0) > 0).length

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
          return (
            <section key={unit.id} className={`rounded-[2rem] border-2 ${c.card} p-5 md:p-8`}>
              <div className="flex items-center gap-4 mb-6">
                <span className={`grid place-items-center w-16 h-16 rounded-2xl text-4xl ${c.icon} shrink-0`}>
                  {unit.emoji}
                </span>
                <div>
                  <span className={`inline-block rounded-full ${c.badge} text-white text-sm font-bold px-3 py-0.5`}>
                    الوحدة {ui + 1}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-extrabold mt-1">
                    {unit.title.replace(/^الوحدة [^:]+:\s*/, '')}
                  </h2>
                </div>
              </div>

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
                          {lesson.emoji}
                        </span>
                        <span className={`rounded-full ${t.chip} text-sm font-bold px-3 py-1`}>الدرس {li + 1}</span>
                      </div>
                      <h3 className="text-xl font-extrabold mt-3 mb-1">{lesson.title}</h3>
                      <p className="text-ink/60 text-sm flex-1">{lesson.objectives[0]}</p>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex gap-0.5 text-lg" aria-label={`${s} من 5 نجوم`}>{[1,2,3,4,5].map(n=><span key={n} className={n <= s ? 'text-amber-400' : 'text-slate-200'}>★</span>)}</div>
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
