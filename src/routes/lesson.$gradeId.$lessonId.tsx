import { useRef, useState, type PointerEvent } from 'react'
import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { getLesson } from '@/content/curriculum'
import { gradeTheme } from '@/lib/theme'
import { lessonKey, completeLessonStep, useLessonSteps, LESSON_STEPS } from '@/lib/progress'
import TeacherPanel from '@/components/TeacherPanel'
import PreLessonActivity, { DifferentSoundQuiz, PitchWarmup } from '@/components/PreLessonActivity'
import FlagColoring from '@/components/FlagColoring'
import Quiz from '@/components/Quiz'
import ActivityCard, { isActivityReady } from '@/components/ActivityCard'
import BookActivities from '@/components/BookActivities'
import RhythmFigure from '@/components/RhythmFigure'
import StaffPositionQuiz from '@/components/StaffPositionQuiz'

export const Route = createFileRoute('/lesson/$gradeId/$lessonId')({
  loader: ({ params }) => {
    if (!getLesson(params.gradeId, params.lessonId)) throw notFound()
    return params
  },
  head: ({ params }) => ({
    meta: [{ title: `${getLesson(params.gradeId, params.lessonId)?.lesson.title ?? 'درس'} — نغماتي` }],
  }),
  component: LessonPage,
})

const steps = [
  { id: 'warmup', n: 1, label: 'تهيّأ', emoji: '💡' },
  { id: 'watch', n: 2, label: 'شاهد وتعلّم', emoji: '🎬' },
  { id: 'quiz', n: 3, label: 'أجب عن الأسئلة', emoji: '🃏' },
  { id: 'book-activities', n: 4, label: 'الأنشطة', emoji: '📚' },
  { id: 'practice', n: 5, label: 'طبّق والعب', emoji: '🎮' },
]

function LessonPage() {
  const [rhythmVideoIndex, setRhythmVideoIndex] = useState(0)
  const { gradeId, lessonId } = Route.useLoaderData()
  const { grade, unit, lesson, prev, prevUnit, next, nextUnit } = getLesson(gradeId, lessonId)!
  const t = gradeTheme[grade.theme]
  const isSixteenthNoteLesson = grade.id === 'grade-4' && unit.id === 'u1' && lesson.id === 'lesson3'
  const progressKey = lessonKey(grade.id, `${unit.id}-${lesson.id}`)
  const progress = useLessonSteps()[progressKey] ?? []
  const finish = (step: 'warmup' | 'watch' | 'quiz' | 'activities' | 'practice') => completeLessonStep(progressKey, step)
  const activities = lesson.activities.filter(isActivityReady).sort((a, b) => (a.type === 'wordwall' ? 0 : 1) - (b.type === 'wordwall' ? 0 : 1))

  return (
    <div>
      <section className={`bg-gradient-to-br ${t.hero} text-white`}>
        <div className="max-w-5xl mx-auto px-4 pt-6 pb-16">
          <nav className="flex flex-wrap items-center gap-2 text-sm font-bold mb-5">
            <Link to="/" className="rounded-full bg-white/25 px-3 py-1 hover:bg-white/35">
              الرئيسية
            </Link>
            <span>←</span>
            <Link
              to="/grade/$gradeId"
              params={{ gradeId: grade.id }}
              className="rounded-full bg-white/25 px-3 py-1 hover:bg-white/35"
            >
              {grade.title}
            </Link>
            <span>←</span>
            <span className="rounded-full bg-white/15 px-3 py-1">{unit.title}</span>
          </nav>
          <div className="flex items-center gap-4">
            <span className="grid place-items-center w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-white/25 text-5xl md:text-6xl shrink-0">
              {isSixteenthNoteLesson ? <RhythmFigure className="w-14 h-14 text-white" /> : lesson.emoji}
            </span>
            <h1 className="flex items-center gap-3 text-4xl md:text-5xl font-extrabold drop-shadow-sm">
              {isSixteenthNoteLesson ? 'الشكل الإيقاعي' : lesson.title}
              {isSixteenthNoteLesson && <RhythmFigure className="w-12 h-12 text-white" />}
            </h1>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {lesson.objectives.map((o) => (
              <span key={o} className="rounded-2xl bg-white/20 px-4 py-2 font-semibold">
                🎯 {o}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* شريط الخطوات */}
      <div className="max-w-5xl mx-auto px-4 -mt-9 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 rounded-[2rem] bg-white p-2 md:p-3 shadow-chunky">
          {steps.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="flex flex-col md:flex-row items-center justify-center gap-1 md:gap-3 rounded-3xl px-2 py-3 hover:bg-cream transition text-center"
            >
              <span className="text-3xl">{s.emoji}</span>
              <span className="font-extrabold text-sm md:text-lg leading-tight">
                <span className="text-ink/40">{s.n}. </span>
                {s.label}
              </span>
            </a>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-14">
        <section className="rounded-3xl bg-white p-4 shadow-chunky"><div className="flex items-center justify-between gap-2 mb-3"><h2 className="font-extrabold text-lg">⭐ تقدّمك في الدرس</h2><span className="font-bold text-violet-600">{progress.length} من 5 نجوم</span></div><div className="grid grid-cols-5 gap-2">{LESSON_STEPS.map((step,i)=><div key={step} className="text-center"><div className={`text-2xl ${progress.includes(step) ? "text-amber-400" : "text-slate-300"}`}>★</div><div className="text-xs font-bold">{["التهيئة","الفيديو","الأسئلة","النشاط","التطبيق"][i]}</div></div>)}</div></section>
        <section id="warmup" className="scroll-mt-24">
          <div onClick={() => finish("warmup")}><PreLessonActivity lesson={lesson} /></div>
          {grade.id === 'grade-4' && lesson.title === 'نشيد (سلامتي)' && <StoryJumperBook />}
        </section>

        <section id="watch" className="scroll-mt-24">
          <SectionTitle n={2} title="شاهد وتعلّم مع المعلم" emoji="🎬" />
          <TeacherPanel lesson={lesson} onVideoStart={() => finish("watch")} onIntroNext={() => finish("watch")} />
        </section>

        <section id="quiz" className="scroll-mt-24">
          <SectionTitle n={3} title="أسئلة تفاعلية" emoji="🃏" sub="اختر البطاقة الصحيحة واجمع النجوم!" />
          {lesson.title === 'الشكل الإيقاعي (♫)' ? (
            <div className="rounded-[2rem] bg-white p-4 md:p-6 shadow-chunky">
              <h3 className="text-xl md:text-2xl font-extrabold mb-4">قم بتأدية التمرين الايقاعي كاملا بالحركات الموضحة أسفل كل مازورة</h3>
              <video controls playsInline preload="metadata" className="w-full rounded-xl bg-black" title="التمرين الإيقاعي الكامل">
                <source src="https://ict.moe.gov.om/video/videos/4/Arts/p1/cls4_TB_Step_14_p1.mp4" type="video/mp4" />
                المتصفح لا يدعم تشغيل الفيديو.
              </video>
            </div>
          ) : lesson.title === 'تطبيقات على المدرج الموسيقي' || lesson.title === 'تطبيقات على المُدَرَّج الموسيقي' ? (
            <StaffPositionQuiz />
          ) : lesson.title === 'اللعبة الشعبية (حبّوه موه تدوري)' ? (
            <div className="rounded-[2rem] bg-white p-4 md:p-6 shadow-chunky">
              <h3 className="text-xl font-extrabold mb-3">🎮 نشاط تفاعلي: حبّوه موه تدوري</h3>
              <div className="relative w-full overflow-hidden rounded-xl" style={{ aspectRatio: '5 / 3.8' }}>
                <iframe src="https://wordwall.net/embed/cd8de31fc2c6471fb356bd654f053838?themeId=65&templateId=30&fontStackId=0" title="سؤال تفاعلي: حبّوه موه تدوري" className="absolute inset-0 h-full w-full border-0" allowFullScreen loading="lazy" />
              </div>
            </div>
          ) : lesson.title !== 'الشكل الإيقاعي (♫)' && lesson.quiz.length > 0 && <Quiz key={`${unit.id}-${lesson.id}`} questions={lesson.quiz} progressKey={progressKey} onFinish={() => finish("quiz")} />}
          {lesson.title === 'تدريبات صوتية بالتظليلات' && (
            <RhythmVideoActivity index={rhythmVideoIndex} onIndexChange={setRhythmVideoIndex} />
          )}
          {lesson.title === 'الحِدّة والغلظة – السرعة والبطء' && (
            <div className="mt-6">
              <PitchWarmup />
              <DifferentSoundQuiz />
            </div>
          )}
          {(lesson.title === 'النشيد الوطني' || lesson.title === 'نشيد (عَلَم بلادي)') && (
            <div className="mt-6">
              <h3 className="text-xl md:text-2xl font-extrabold mb-3">🎨 سؤال تفاعلي: لوّن علم سلطنة عُمان</h3>
              <FlagColoring onComplete={() => finish("activities")} />
            </div>
          )}
        </section>

        <section id="book-activities" className="scroll-mt-24">
          <SectionTitle n={4} title="الأنشطة" emoji="📚" sub="أنشطة الكتاب وتسليم الإجابات للمعلمة" />
          <BookActivities lessonTitle={lesson.title} onSubmit={() => finish("activities")} />

        </section>

        <section id="practice" className="scroll-mt-24">
          <SectionTitle n={5} title="التطبيق والأنشطة الموسيقية" emoji="🎮" />

          {(lesson.title === 'تطبيقات على المدرج الموسيقي' || lesson.title === 'تطبيقات على المُدَرَّج الموسيقي') && (
            <div className="rounded-[2rem] bg-white p-4 md:p-6 shadow-chunky">
              <h3 className="text-xl md:text-2xl font-extrabold mb-4">🎮 نشاط تفاعلي: تطبيقات على المدرج الموسيقي</h3>
              <div className="relative w-full overflow-hidden rounded-xl" style={{ aspectRatio: '500 / 380' }}>
                <iframe
                  src="https://wordwall.net/ar/embed/0d152a77ab4d4f1da95dd8f8dfacdabe?themeId=1&templateId=3&fontStackId=0"
                  title="ورد وول: تطبيقات على المدرج الموسيقي"
                  className="absolute inset-0 h-full w-full border-0"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            </div>
          )}

          {activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((a, i) => (
                <ActivityCard key={i} activity={a} onStart={() => finish("practice")} />
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] bg-white p-8 text-center shadow-chunky">
              <div className="text-6xl mb-3">🎤</div>
              <p className="text-xl font-bold">نشاط هذا الدرس يكون معاً في الفصل مع معلمك!</p>
              <Link onClick={() => finish("practice")} to="/lab" className="inline-block mt-5 rounded-full bg-amber-400 px-6 py-3 font-extrabold shadow-chunky">
                أو جرّب المختبر الموسيقي 🎹
              </Link>
            </div>
          )}
        </section>

        <nav className="grid grid-cols-2 gap-4">
          {prev ? (
            <Link
              to="/lesson/$gradeId/$lessonId"
              params={{ gradeId: grade.id, lessonId: `${prevUnit?.id ?? unit.id}-${prev.id}` }}
              className="rounded-3xl bg-white p-4 md:p-5 shadow-chunky hover:-translate-y-0.5 transition"
            >
              <span className="text-sm font-bold text-ink/50">→ الدرس السابق</span>
              <span className="block text-lg md:text-xl font-extrabold">
                {prev.emoji} {prev.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              to="/lesson/$gradeId/$lessonId"
              params={{ gradeId: grade.id, lessonId: `${nextUnit?.id ?? unit.id}-${next.id}` }}
              className={`rounded-3xl ${t.button} text-white p-4 md:p-5 shadow-chunky hover:-translate-y-0.5 transition text-left`}
            >
              <span className="text-sm font-bold text-white/80">الدرس التالي ←</span>
              <span className="block text-lg md:text-xl font-extrabold">
                {next.emoji} {next.title}
              </span>
            </Link>
          ) : (
            <Link
              to="/grade/$gradeId"
              params={{ gradeId: grade.id }}
              className={`rounded-3xl ${t.button} text-white p-4 md:p-5 shadow-chunky text-left`}
            >
              <span className="text-sm font-bold text-white/80">أنهيت كل الدروس 🎉</span>
              <span className="block text-lg md:text-xl font-extrabold">العودة إلى {grade.title}</span>
            </Link>
          )}
        </nav>
      </div>
    </div>
  )
}



const rhythmVideos = [
  {
    title: 'استمع إلى تمرين الكريشيندو والديمينويندو',
    src: 'https://ict.moe.gov.om/video/videos/4/Arts/p1/cls4_TB_Crescendo_%20domino_p1.mp4',
    type: 'video/mp4',
  },
  {
    title: 'استمع إلى تمرين الفورتي والبيانو',
    src: 'https://ict.moe.gov.om/video/videos/4/Arts/p1/cls4_TB_Forte_piano_p1.mov',
  },
  {
    title: 'استمع إلى تمرين الجاتو والاستكاتو',
    src: 'https://ict.moe.gov.om/video/videos/4/Arts/p1/cls4_TB_gateau_stacato_p1.mp4',
    type: 'video/mp4',
  },
]


const safetyStoryPages = [
  {
    title: 'قبل اللعب',
    dialogue: [
      { speaker: 'سالم', role: 'salem', line: 'يا أمي، سأذهب للعب مع أصدقائي.' },
      { speaker: 'الأم', role: 'mother', line: 'سالم، انتظر! يجب أن تنتبه أثناء اللعب.' },
    ],
  },
  {
    title: 'سالم لا يستمع',
    dialogue: [
      { speaker: 'سالم', role: 'salem', line: 'انتبه؟ ههههه! أنا سألعب فقط يا أمي!' },
      { speaker: 'سالم', role: 'salem', line: 'إلى اللقاء يا أمي!' },
    ],
  },
  {
    title: 'ماذا حدث؟',
    dialogue: [
      { speaker: 'الأم', role: 'mother', line: 'سالم، سالم! ماذا حدث لك يا سالم؟' },
      { speaker: 'سالم', role: 'salem', line: 'كُنْتُ أَلْعَبُ مَعَ صَدِيقِي، ثُمَّ وَقَعْتُ وَأُصِبْتُ بِسَبَبِ اللَّعِبِ.' },
    ],
  },
  {
    title: 'نصيحة الأم',
    dialogue: [
      { speaker: 'الأم', role: 'mother', line: 'أَلَمْ أُخْبِرْكَ أَنْ تَنْتَبِهَ وَتَحْذَرَ أَثْنَاءَ اللَّعِبِ؟ هَلْ رَأَيْتَ مَاذَا قَدْ يَحْدُثُ إِذَا لَمْ تَسْتَمِعْ إِلَى نَصِيحَتِي؟' },
      { speaker: 'سالم', role: 'salem', line: 'لم أتوقع أن أُصاب أثناء اللعب يا أمي.' },
    ],
  },
  {
    title: 'السلامة في كل مكان',
    dialogue: [
      { speaker: 'الأم', role: 'mother', line: 'عليك أن تكون حذراً دائماً، في كل وقت وأي مكان. انتبه عند الصعود إلى الحافلة المدرسية والنزول منها، وعند استخدام المقص والسكين.' },
      { speaker: 'سالم', role: 'salem', line: 'سَأَتَذَكَّرُ نَصِيحَتَكِ يَا أُمِّي، وَسَأَسْتَخْدِمُ الْأَدَوَاتِ بِحَذَرٍ.' },
    ],
  },
]

const safetyStoryAudioUrls: (string | null)[] = [
  'https://resource2.heygen.ai/text_to_speech/3140377079ea44a2a47a746e4b234e53/46daee8d4d0042b184a6ce903014ac18/id=1fe023b5-efab-4c94-8ed8-c2cbdfac0a42.wav',
  'https://resource2.heygen.ai/text_to_speech/3140377079ea44a2a47a746e4b234e53/cfa6efa1cb9b46abb1dc7fb128d5622f/id=b4d40a20-aff4-41ed-87aa-a2c618e8d05f.wav',
  'https://resource2.heygen.ai/text_to_speech/3140377079ea44a2a47a746e4b234e53/46daee8d4d0042b184a6ce903014ac18/id=9215d9d7-7fa6-4f30-9b6a-1df667e4a1bd.wav',
  'https://resource2.heygen.ai/text_to_speech/3140377079ea44a2a47a746e4b234e53/46daee8d4d0042b184a6ce903014ac18/id=baa654bf-ac8b-4db0-816b-8bc327e8ae28.wav',
  'https://resource2.heygen.ai/text_to_speech/3140377079ea44a2a47a746e4b234e53/cfa6efa1cb9b46abb1dc7fb128d5622f/id=a149c8d3-796d-40e8-9586-4c8806076b08.wav',
  'https://resource2.heygen.ai/text_to_speech/3140377079ea44a2a47a746e4b234e53/46daee8d4d0042b184a6ce903014ac18/id=0b80122d-2355-48b1-b734-c6bff93ac698.wav',
  'https://resource2.heygen.ai/text_to_speech/3140377079ea44a2a47a746e4b234e53/cfa6efa1cb9b46abb1dc7fb128d5622f/id=5dff9e0b-6266-4a5a-84ab-0eddf66961c8.wav',
  'https://resource2.heygen.ai/text_to_speech/3140377079ea44a2a47a746e4b234e53/46daee8d4d0042b184a6ce903014ac18/id=84d919d8-f201-4ce4-aae6-87568c70a92b.wav',
  'https://resource2.heygen.ai/text_to_speech/3140377079ea44a2a47a746e4b234e53/cfa6efa1cb9b46abb1dc7fb128d5622f/id=888125ff-85e7-426c-912d-8b7494d2c9b0.wav',
  'https://resource2.heygen.ai/text_to_speech/3140377079ea44a2a47a746e4b234e53/46daee8d4d0042b184a6ce903014ac18/id=bf1a13bb-ce57-413b-8c0b-73fc5b2c0b92.wav',
]

function StoryJumperBook() {
  const [pageIndex, setPageIndex] = useState(0)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const playbackIdRef = useRef(0)
  const page = safetyStoryPages[pageIndex]
  const firstLineIndex = safetyStoryPages.slice(0, pageIndex).reduce((count, item) => count + item.dialogue.length, 0)
  const pageAudioUrls = page.dialogue.map((_, index) => safetyStoryAudioUrls[firstLineIndex + index])
  const pageAudioReady = pageAudioUrls.every((url): url is string => Boolean(url))

  const stopNarration = () => {
    playbackIdRef.current += 1
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
    }
    setIsSpeaking(false)
  }

  const speakPage = async () => {
    if (!pageAudioReady) return
    stopNarration()
    const playbackId = playbackIdRef.current
    setIsSpeaking(true)
    try {
      for (const url of pageAudioUrls) {
        if (playbackId !== playbackIdRef.current) return
        const audio = new Audio(url)
        audioRef.current = audio
        await new Promise<void>((resolve, reject) => {
          audio.onended = () => resolve()
          audio.onerror = () => reject(new Error('تعذّر تشغيل التسجيل الصوتي'))
          audio.play().catch(reject)
        })
      }
    } catch {
      // The status below explains that audio is unavailable for unfinished pages.
    } finally {
      if (playbackId === playbackIdRef.current) {
        audioRef.current = null
        setIsSpeaking(false)
      }
    }
  }

  const changePage = (nextIndex: number) => {
    stopNarration()
    setPageIndex(nextIndex)
  }

  return (
    <div className="mt-6 rounded-3xl bg-white p-4 md:p-6 shadow-chunky">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl md:text-2xl font-extrabold">📖 قصة «سلامتي هي مهمتي»</h3>
        </div>
        <span className="rounded-full bg-violet-100 px-4 py-2 font-extrabold text-violet-700">الصفحة {pageIndex + 1} من {safetyStoryPages.length}</span>
      </div>

      <div className="overflow-hidden rounded-3xl border-2 border-amber-100 bg-gradient-to-br from-amber-50 via-white to-sky-50 p-4 md:p-7">
        <h4 className="mb-5 text-center text-2xl font-extrabold text-violet-800">{page.title}</h4>
        <div className="mb-6 flex items-end justify-center gap-8 md:gap-16" aria-label="شخصيات القصة">
          <div className="flex w-28 flex-col items-center gap-2 md:w-36">
            <div className="grid h-24 w-24 place-items-center rounded-full border-4 border-sky-200 bg-sky-100 text-6xl shadow-md md:h-32 md:w-32 md:text-7xl" role="img" aria-label="شخصية سالم">👦🏻</div>
            <span className="rounded-full bg-sky-100 px-4 py-1 font-extrabold text-sky-800">سالم</span>
          </div>
          <div className="flex w-28 flex-col items-center gap-2 md:w-36">
            <div className="grid h-24 w-24 place-items-center rounded-full border-4 border-pink-200 bg-pink-100 text-6xl shadow-md md:h-32 md:w-32 md:text-7xl" role="img" aria-label="شخصية الأم">👩🏻</div>
            <span className="rounded-full bg-pink-100 px-4 py-1 font-extrabold text-pink-800">الأم</span>
          </div>
        </div>

        <div className="mx-auto max-w-3xl space-y-4" aria-live="polite">
          {page.dialogue.map((line, index) => (
            <div key={page.title + line.role + index} className={'flex items-start gap-3 ' + (line.role === 'salem' ? 'flex-row' : 'flex-row-reverse')}>
              <span className={'grid h-12 w-12 shrink-0 place-items-center rounded-full text-3xl ' + (line.role === 'salem' ? 'bg-sky-100' : 'bg-pink-100')} aria-hidden="true">
                {line.role === 'salem' ? '👦🏻' : '👩🏻'}
              </span>
              <div className={'max-w-[88%] rounded-2xl px-4 py-3 text-lg font-semibold leading-8 shadow-sm ' + (line.role === 'salem' ? 'rounded-tr-sm bg-sky-100 text-sky-950' : 'rounded-tl-sm bg-pink-100 text-pink-950')}>
                <div className="mb-1 text-sm font-extrabold opacity-75">{line.speaker}</div>
                {line.line}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <button type="button" onClick={speakPage} disabled={!pageAudioReady} className="rounded-full bg-violet-600 px-5 py-3 font-extrabold text-white shadow-chunky hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-40">
          {isSpeaking ? '🔊 السرد يعمل...' : '🔊 استمع إلى الحوار'}
        </button>
        <button type="button" onClick={stopNarration} className="rounded-full border-2 border-violet-200 bg-white px-5 py-3 font-extrabold text-violet-700">⏹ إيقاف الصوت</button>
      </div>
      {!pageAudioReady && (
        <p role="status" className="mt-3 text-center text-sm font-bold text-amber-700">
          تسجيلات هذه الصفحة لم تكتمل بعد. زر الاستماع سيتفعّل عند إضافة تسجيلات جميع الجمل.
        </p>
      )}

      <div className="mt-5 flex items-center justify-between gap-3">
        <button type="button" onClick={() => changePage(Math.max(0, pageIndex - 1))} disabled={pageIndex === 0} className="rounded-full border-2 border-violet-200 bg-white px-5 py-3 font-extrabold disabled:cursor-not-allowed disabled:opacity-40">→ الصفحة السابقة</button>
        <div className="flex flex-wrap justify-center gap-2" aria-label="اختيار صفحة القصة">
          {safetyStoryPages.map((item, index) => (
            <button key={item.title} type="button" onClick={() => changePage(index)} aria-label={item.title} aria-current={index === pageIndex ? 'step' : undefined} className={'grid h-9 w-9 place-items-center rounded-full font-extrabold ' + (index === pageIndex ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-violet-100')}>
              {index + 1}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => changePage(Math.min(safetyStoryPages.length - 1, pageIndex + 1))} disabled={pageIndex === safetyStoryPages.length - 1} className="rounded-full bg-violet-600 px-5 py-3 font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-40">الصفحة التالية ←</button>
      </div>

      <p className="mt-4 text-center text-xs leading-6 text-ink/55">
        يمكن فتح النسخة الأصلية من القصة على{' '}
        <a href="https://www.storyjumper.com/book/read/170652271/65f75d977891f" target="_blank" rel="noreferrer" className="font-bold text-violet-700 underline underline-offset-4">StoryJumper</a>.
      </p>
    </div>
  )
}

function RhythmVideoActivity({ index, onIndexChange }: { index: number; onIndexChange: (index: number) => void }) {
  const video = rhythmVideos[index]
  return (
    <div className="mt-6 rounded-[2rem] border-2 border-violet-200 bg-white p-4 md:p-6 shadow-chunky">
      <h3 className="text-xl md:text-2xl font-extrabold mb-2">🎧 نشاط تفاعلي: استمع إلى التمرين الإيقاعي وقم بالترديد معه!</h3>
      <p className="mb-4 text-ink/65">استمع إلى الفيديو، وردّد التمرين معه. استخدم السابق والتالي للتنقّل بين الفيديوهات.</p>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className="rounded-full bg-violet-100 px-4 py-2 font-extrabold text-violet-700">الفيديو {index + 1} من {rhythmVideos.length}</span>
        <span className="font-bold">{video.title}</span>
      </div>
      <video key={video.src} controls playsInline preload="metadata" className="w-full rounded-xl bg-black" title={video.title}>
        <source src={video.src} type={video.type} />
        المتصفح لا يدعم تشغيل الفيديو. افتح الرابط المباشر لتجربته.
      </video>
      <p className="mt-3 text-sm font-semibold text-ink/65">
        <a href={video.src} target="_blank" rel="noreferrer" className="text-violet-700 underline underline-offset-4">افتح الفيديو مباشرة</a>.
      </p>
      <div className="mt-4 flex items-center justify-between gap-3">
        <button type="button" onClick={() => onIndexChange(Math.max(0, index - 1))} disabled={index === 0} className="rounded-full border-2 border-violet-200 bg-white px-5 py-3 font-extrabold disabled:cursor-not-allowed disabled:opacity-40">→ السابق</button>
        <div className="flex gap-2" aria-label="اختيار الفيديو">
          {rhythmVideos.map((item, i) => (
            <button key={item.src} type="button" onClick={() => onIndexChange(i)} aria-label={'الفيديو ' + (i + 1)} aria-current={i === index ? 'step' : undefined} className={'h-3 w-3 rounded-full ' + (i === index ? 'bg-violet-600 ring-4 ring-violet-100' : 'bg-slate-300')} />
          ))}
        </div>
        <button type="button" onClick={() => onIndexChange(Math.min(rhythmVideos.length - 1, index + 1))} disabled={index === rhythmVideos.length - 1} className="rounded-full bg-violet-600 px-5 py-3 font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-40">التالي ←</button>
      </div>
    </div>
  )
}



function SectionTitle({ n, title, emoji, sub }: { n: number; title: string; emoji: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="grid place-items-center w-12 h-12 rounded-2xl bg-ink text-white text-xl font-extrabold shrink-0">
        {n}
      </span>
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold">
          {title} <span>{emoji}</span>
        </h2>
        {sub && <p className="text-ink/60">{sub}</p>}
      </div>
    </div>
  )
}
