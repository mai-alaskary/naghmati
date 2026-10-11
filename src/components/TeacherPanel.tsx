import { useEffect, useState } from 'react'
import type { Lesson } from '@/content/curriculum'
import { toEmbedUrl, providerName } from '@/lib/embed'
import { canSpeak, speak, stopSpeaking } from '@/lib/speech'
import { img } from '@/lib/images'

/**
 * مساحة المعلم الافتراضي:
 * - إن وُجد رابط فيديو (YouTube / Genially / ذكاء اصطناعي) يُعرض داخل iFrame.
 * - وإلا تظهر الشخصية الكرتونية مع فقاعات الشرح وزر الاستماع.
 */
export default function TeacherPanel({ lesson }: { lesson: Lesson }) {
  const embed = toEmbedUrl(lesson.teacher.url)
  const anthemVideo = lesson.anthem?.explanationVideoUrl ? toEmbedUrl(lesson.anthem.explanationVideoUrl) : ''
  const [step, setStep] = useState(0)
  const [talking, setTalking] = useState(false)
  const [speechOk, setSpeechOk] = useState(false)

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
              {lines[step]}
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
      <div className="rounded-[2rem] bg-white p-4 md:p-5 shadow-chunky">
        <div className="font-extrabold text-lg mb-3">🎬 فيديو شرح الدرس</div>
        {embed || anthemVideo ? (
          <>
            <div className="rounded-[1.5rem] overflow-hidden bg-black">
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
    </div>
  )
}
