import { Link, createFileRoute } from '@tanstack/react-router'
import { grades } from '@/content/curriculum'
import { gradeTheme } from '@/lib/theme'
import { img } from '@/lib/images'
import { useStars } from '@/lib/progress'
import FloatingNotes from '@/components/FloatingNotes'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const stars = useStars()

  return (
    <div>
      {/* الترحيب */}
      <section className="relative overflow-hidden">
        <FloatingNotes />
        <div className="relative max-w-6xl mx-auto px-4 pt-10 pb-6 md:pt-16 grid md:grid-cols-2 items-center gap-6">
          <div className="text-center md:text-start">
            <span className="inline-block rounded-full bg-white px-4 py-1.5 font-bold text-violet-600 shadow-sm mb-5">
              🇴🇲 وفق منهج المهارات الموسيقية في سلطنة عمان
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-4">
              أهلا بك يا صديقي
              <br />
              <span className="bg-gradient-to-l from-pink-500 via-violet-500 to-sky-500 bg-clip-text text-transparent">
                الموسيقي الصغير!
              </span>
            </h1>
            <p className="text-lg font-extrabold text-violet-700 mb-3">🎼 إعداد وتقديم: أ. / ميّ العسكري</p>
            <p className="text-xl text-ink/70 mb-8 max-w-lg mx-auto md:mx-0">
              تعلم، والعب، واعزف! اختر صفك الدراسي لتبدأ رحلتك مع النغمات والإيقاعات. لا تحتاج إلى أي تسجيل 🎉
            </p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <a
                href="#grades"
                className="rounded-full bg-violet-500 hover:bg-violet-600 text-white text-lg font-extrabold px-8 py-3.5 shadow-chunky transition"
              >
                ابدأ الآن 🚀
              </a>
              <Link
                to="/lab"
                className="rounded-full bg-white text-ink text-lg font-extrabold px-8 py-3.5 shadow-chunky transition hover:bg-amber-50"
              >
                جرّب المختبر 🎹
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-10 rounded-full bg-gradient-to-br from-amber-200 via-pink-200 to-sky-200 blur-2xl opacity-70" />
            <img
              src={img('/img/mascot.png', 900)}
              alt="المعلم الموسيقي الافتراضي يعزف على الطبل"
              width={900}
              height={500}
              className="relative w-full blend-img scale-125 md:scale-[1.35]"
            />
          </div>
        </div>
      </section>

      {/* اختيار الصف */}
      <section id="grades" className="max-w-6xl mx-auto px-4 py-10 scroll-mt-20">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-2">في أي صف أنت؟ 🤔</h2>
        <p className="text-center text-lg text-ink/60 mb-10">اضغط على بطاقة صفك للدخول إلى الدروس</p>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {grades.map((grade) => {
            const t = gradeTheme[grade.theme]
            const lessons = grade.units.flatMap((u) => u.lessons)
            const earned = lessons.reduce((n, l) => n + (stars[`${grade.id}/${l.id}`] ?? 0), 0)
            return (
              <Link
                key={grade.id}
                to="/grade/$gradeId"
                params={{ gradeId: grade.id }}
                className={`group relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br ${t.hero} p-1.5 shadow-chunky transition hover:-translate-y-1 hover:rotate-[-0.5deg]`}
              >
                <div className="rounded-[2.2rem] bg-white/15 p-6 md:p-8 text-white h-full flex flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-5xl">{grade.emoji}</span>
                      <h3 className="text-4xl md:text-5xl font-extrabold mt-2 drop-shadow-sm">{grade.title}</h3>
                      <p className="text-lg font-semibold text-white/90 mt-2 max-w-xs">{grade.tagline}</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-3xl mt-6 overflow-hidden">
                    <img
                      src={img(grade.image, 700)}
                      alt=""
                      width={700}
                      height={390}
                      loading="lazy"
                      className="w-full h-48 md:h-56 object-cover blend-img transition group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 font-bold">
                    <span className="rounded-full bg-white/25 px-4 py-1.5">
                      📚 {grade.units.length} وحدات · {lessons.length} درساً
                    </span>
                    {earned > 0 && <span className="rounded-full bg-white/25 px-4 py-1.5">⭐ {earned} نجمة</span>}
                    <span className="rounded-full bg-white text-ink px-6 py-2 group-hover:scale-105 transition">
                      ادخل ←
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* دليل المنصة */}
      <section className="max-w-6xl mx-auto px-4 pb-12">
        <Link to="/teacher" className="group flex flex-col sm:flex-row items-center justify-between gap-5 rounded-[2.5rem] bg-gradient-to-l from-violet-600 via-violet-500 to-sky-500 p-6 md:p-8 text-white shadow-chunky transition hover:-translate-y-1">
          <div className="flex items-center gap-4">
            <span className="grid place-items-center w-16 h-16 rounded-2xl bg-white/20 text-4xl">📘</span>
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold mb-1">دليل المنصة</h2>
              <p className="text-white/90">للطلاب وأولياء الأمور والمعلمين: تعرّفوا على نغماتي وكيفية استخدامها.</p>
            </div>
          </div>
          <span className="rounded-full bg-white text-violet-700 px-6 py-3 font-extrabold group-hover:scale-105 transition">استكشف الدليل ←</span>
        </Link>
      </section>

      {/* المختبر + كيف تعمل */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <Link
          to="/lab"
          className="group grid md:grid-cols-[1.1fr_1fr] items-center gap-6 rounded-[2.5rem] bg-gradient-to-br from-amber-300 via-yellow-200 to-lime-200 p-6 md:p-10 shadow-chunky transition hover:-translate-y-1"
        >
          <div>
            <span className="inline-block rounded-full bg-white/70 px-4 py-1 font-bold mb-3">🧪 جديد</span>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-3">المختبر الموسيقي</h2>
            <p className="text-lg text-ink/75 mb-6">
              بيانو بالأسماء العربية للنغمات، إكسيليفون ملوّن، طبول عمانية، وصانع إيقاع — اعزف باللمس أو بلوحة المفاتيح!
            </p>
            <div className="flex flex-wrap gap-2 text-2xl">
              {['🎹', '🌈', '🪘', '🥁', '👏'].map((e) => (
                <span key={e} className="grid place-items-center w-14 h-14 rounded-2xl bg-white shadow-sm">
                  {e}
                </span>
              ))}
            </div>
          </div>
          <img
            src={img('/img/lab.png', 800)}
            alt="آلات موسيقية ملونة"
            width={800}
            height={450}
            loading="lazy"
            className="w-full blend-img group-hover:scale-105 transition"
          />
        </Link>

        <div className="grid sm:grid-cols-3 gap-4 mt-10">
          {[
            { e: '🎬', t: 'شاهد وتعلّم', d: 'معلم افتراضي يشرح لك كل درس بطريقة ممتعة.' },
            { e: '🃏', t: 'أجب واربح النجوم', d: 'أسئلة ببطاقات ملونة ونتيجة فورية.' },
            { e: '🎮', t: 'طبّق والعب', d: 'أنشطة وألعاب موسيقية لكل درس.' },
          ].map((f) => (
            <div key={f.t} className="rounded-3xl bg-white p-6 text-center shadow-chunky">
              <div className="text-5xl mb-3">{f.e}</div>
              <h3 className="text-xl font-extrabold mb-1">{f.t}</h3>
              <p className="text-ink/65">{f.d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
