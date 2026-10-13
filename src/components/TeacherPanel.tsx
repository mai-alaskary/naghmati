import { useEffect, useState } from 'react'
import type { Lesson } from '@/content/curriculum'
import { toEmbedUrl, providerName } from '@/lib/embed'
import { canSpeak, speak, stopSpeaking } from '@/lib/speech'
import { img } from '@/lib/images'
import RhythmFigure from '@/components/RhythmFigure'

/**
 * مساحة المعلم الافتراضي:
 * - إن وُجد رابط فيديو (YouTube / Genially / ذكاء اصطناعي) يُعرض داخل iFrame.
 * - وإلا تظهر الشخصية الكرتونية مع فقاعات الشرح وزر الاستماع.
 */
export default function TeacherPanel({ lesson, onVideoStart, onIntroNext }: { lesson: Lesson; onVideoStart?: () => void; onIntroNext?: () => void }) {
  const embed = toEmbedUrl(lesson.teacher.url)
  const anthemVideo = lesson.anthem?.explanationVideoUrl ? toEmbedUrl(lesson.anthem.explanationVideoUrl) : ''
  const [step, setStep] = useState(0)
  const [talking, setTalking] = useState(false)
  const [speechOk, setSpeechOk] = useState(false)
  const [staffVideoStep, setStaffVideoStep] = useState(0)

  useEffect(() => {
    setSpeechOk(canSpeak())
    setStep(0)
    return () => stopSpeaking()
  }, [lesson.id])

  const lines = lesson.intro
  const toggleTalk = () => {
    if (talking) {
      stopSpeaking()
      setTalking(false)
      return
    }
    setTalking(true)
    speak(lines[step], () => setTalking(false))
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[2rem] bg-gradient-to-br from-sky-100 via-white to-amber-100 border-2 border-white p-4 md:p-6 shadow-chunky">
      <div className="grid md:grid-cols-[220px_1fr] gap-4 items-center">
        <div className="relative mx-auto w-48 md:w-full">
          <img
            src={img('/img/mascot.png', 500)}
            alt="المعلم الافتراضي"
            width={500}
            height={280}
            className={`w-full blend-img scale-150 origin-center ${talking ? 'animate-pulse' : ''}`}
          />
        </div>

        <div>
          <div className="relative rounded-3xl bg-white p-5 md:p-6 shadow-sm min-h-36">
            <span className="hidden md:block absolute top-10 -right-3 w-6 h-6 rotate-45 bg-white" />
            <p key={step} className="text-xl md:text-2xl font-semibold leading-relaxed animate-bounce-in">
              {lesson.title === 'الشكل الإيقاعي (♫)' && step === 0 ? (
                <>
                  مرحباً! أنت الآن في درس «الشكل الإيقاعي»{' '}
                  <RhythmFigure className="inline-block w-10 h-8 align-middle text-ink" />
                  .
                </>
              ) : lines[step]}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
            <div className="flex gap-1.5" aria-hidden>
              {lines.map((_, i) => (
                <span
                  key={i}
                  className={`h-3 rounded-full transition-all ${i === step ? 'w-8 bg-violet-500' : 'w-3 bg-ink/15'}`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              {speechOk && (
                <button
                  onClick={toggleTalk}
                  className="rounded-full bg-amber-400 hover:bg-amber-500 px-5 py-2.5 font-extrabold shadow-chunky"
                >
                  {talking ? '⏹️ إيقاف' : '🔊 استمع'}
                </button>
              )}
              <button
                disabled={step === 0}
                onClick={() => {
                  stopSpeaking()
                  setTalking(false)
                  setStep((s) => s - 1)
                }}
                className="rounded-full bg-white px-5 py-2.5 font-extrabold shadow-chunky disabled:opacity-40"
              >
                → السابق
              </button>
              <button
                disabled={step === lines.length - 1}
                onClick={() => {
                  stopSpeaking()
                  setTalking(false)
                  setStep((s) => s + 1)
                  onIntroNext?.()
                }}
                className="rounded-full bg-violet-500 text-white px-5 py-2.5 font-extrabold shadow-chunky disabled:opacity-40"
              >
                التالي ←
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
      {lesson.title === 'المُدَرَّج الموسيقي ومفتاح صول' ? (
        <div className="space-y-5">
          <section className="rounded-[2rem] border-2 border-sky-100 bg-white p-4 md:p-6 shadow-chunky">
            <div className="mb-4">
              <h3 className="text-xl md:text-2xl font-extrabold text-sky-800">🎼 أولًا: المُدَرَّج الموسيقي</h3>
              <p className="mt-1 font-semibold text-ink/60">تصفّح صفحات الشرح بالترتيب، صفحة بعد صفحة.</p>
            </div>

            <div>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-lg font-extrabold">
                  {staffVideoStep === 0 ? '١. فيديو شرح المُدَرَّج الموسيقي' : staffVideoStep === 1 ? '٢. فيديو أسماء الخطوط' : '٣. فيديو أسماء المسافات'}
                </h4>
                <span className="rounded-full bg-sky-50 px-3 py-1 text-sm font-bold text-sky-800">الفيديو {staffVideoStep + 1} من 3</span>
              </div>

              {staffVideoStep === 0 ? (
                <div className="relative w-full aspect-video overflow-hidden rounded-2xl bg-black" onClick={() => onVideoStart?.()}>
                  <iframe src="https://www.youtube.com/embed/hSceyr0Ckho?si=tco66deZ-fUWfWfn" title="فيديو شرح المدرج الموسيقي" className="absolute inset-0 h-full w-full border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen loading="lazy" />
                </div>
              ) : staffVideoStep === 1 ? (
                <div className="relative w-full overflow-hidden rounded-2xl bg-black" style={{ aspectRatio: '4 / 3' }} onClick={() => onVideoStart?.()}>
                  <iframe src="https://drive.google.com/file/d/1uI5qMRYsezAzkRMrKpVb51P1gLWHCfyq/preview" title="فيديو أسماء الخطوط الموسيقية" className="absolute inset-0 h-full w-full border-0" allow="autoplay" allowFullScreen loading="lazy" />
                </div>
              ) : (
                <div className="relative w-full overflow-hidden rounded-2xl bg-black" style={{ aspectRatio: '4 / 3' }} onClick={() => onVideoStart?.()}>
                  <iframe src="https://drive.google.com/file/d/1EQ8I96-zNalBStqh3LG2svmSL8nEKtUY/preview" title="فيديو أسماء المسافات الموسيقية" className="absolute inset-0 h-full w-full border-0" allow="autoplay" allowFullScreen loading="lazy" />
                </div>
              )}

              <div className="mt-4 flex flex-row items-center justify-between gap-3">
                <button type="button" disabled={staffVideoStep === 0} onClick={() => setStaffVideoStep((step) => Math.max(0, step - 1))} className="rounded-full bg-white px-5 py-2.5 font-extrabold shadow-chunky disabled:cursor-not-allowed disabled:opacity-40">→ السابق</button>
                <div className="flex items-center gap-1.5" aria-label={`الفيديو ${staffVideoStep + 1} من 3`}>
                  {[0, 1, 2].map((step) => <span key={step} className={`h-2.5 rounded-full transition-all ${step === staffVideoStep ? 'w-7 bg-sky-500' : 'w-2.5 bg-ink/20'}`} />)}
                </div>
                <button type="button" disabled={staffVideoStep === 2} onClick={() => setStaffVideoStep((step) => Math.min(2, step + 1))} className="rounded-full bg-sky-600 px-5 py-2.5 font-extrabold text-white shadow-chunky disabled:cursor-not-allowed disabled:opacity-40">التالي ←</button>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border-2 border-violet-100 bg-white p-4 md:p-6 shadow-chunky">
            <h3 className="mb-4 text-xl md:text-2xl font-extrabold text-violet-800">🎵 ثانيًا: مفتاح صول</h3>
            <h4 className="mb-3 text-lg font-extrabold">فيديو شرح مفتاح صول</h4>
            <div className="relative w-full aspect-video overflow-hidden rounded-2xl bg-black" onClick={() => onVideoStart?.()}>
              <iframe src="https://www.youtube.com/embed/cCX_E7-6hxE?si=6emzS2tDNHAIVb0f" title="فيديو شرح مفتاح صول" className="absolute inset-0 h-full w-full border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen loading="lazy" />
            </div>
          </section>
        </div>
      ) : (
        <div className="rounded-[2rem] bg-white p-4 md:p-5 shadow-chunky">
          <div className="font-extrabold text-lg mb-3">🎬 فيديو شرح الدرس</div>
          {embed || anthemVideo ? (
            <>
              <div className="rounded-[1.5rem] overflow-hidden bg-black" onClick={() => onVideoStart?.()}>
                <div className="relative w-full aspect-video">
                  <iframe
                    src={embed || anthemVideo}
                    title={lesson.teacher.title || `شرح ${lesson.title}`}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              </div>
              <p className="text-ink/60 text-sm text-center pt-2">🎬 {providerName(embed || anthemVideo)}</p>
            </>
          ) : (
            <div className="rounded-2xl bg-cream p-5 text-ink/65">
              مكان مخصص لفيديو شرح «{lesson.title}». سيظهر الفيديو هنا عند إضافة رابط YouTube من لوحة المعلمة.
            </div>
          )}
        </div>
      )}    </div>
  )
}
