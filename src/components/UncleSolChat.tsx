import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ArrowUp, Music2, Sparkles, X, ChevronLeft, RotateCcw, MessageCircle } from 'lucide-react'
import { grades } from '@/content/curriculum'

type ChatMessage = {
  id: number
  role: 'assistant' | 'student'
  text: string
}

function UncleSolAvatar({ small = false }: { small?: boolean }) {
  return (
    <span className={`sol-avatar ${small ? 'sol-avatar--small' : ''}`} aria-label="العم صول">
      <svg viewBox="0 0 64 64" role="img" aria-hidden="true">
        <circle cx="32" cy="32" r="32" fill="#FFE6A6" />
        <path d="M13 28c-1-13 7-21 19-21s20 8 19 21l-4 10H17z" fill="#68452E" />
        <path d="M20 29c0-10 5-16 12-16s12 6 12 16v11c0 10-6 16-12 16s-12-6-12-16z" fill="#F4C18C" />
        <path d="M20 34c3 3 7 4 12 4s9-1 12-4v10c-2 8-7 12-12 12s-10-4-12-12z" fill="#D9D9D1" />
        <path d="M23 28h6m6 0h6" stroke="#68452E" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="26" cy="31" r="4" fill="none" stroke="#3E4C54" strokeWidth="1.8" />
        <circle cx="38" cy="31" r="4" fill="none" stroke="#3E4C54" strokeWidth="1.8" />
        <path d="M30 31h4" stroke="#3E4C54" strokeWidth="1.5" />
        <path d="M28 41q4 4 8 0" fill="none" stroke="#874A38" strokeWidth="2" strokeLinecap="round" />
        <path d="M16 19q16-16 32 0l-2 4H18z" fill="#159C9A" />
        <path d="M14 23h36" stroke="#F7C95C" strokeWidth="3" strokeLinecap="round" />
        <circle cx="48" cy="13" r="5" fill="#F6C75D" />
      </svg>
    </span>
  )
}


const TEACHER_WHATSAPP = '96898778983'
const initialMessage: ChatMessage = {
  id: 1,
  role: 'assistant',
  text: 'مرحبًا بك! أنا العم صول. اختر صفك، ثم الوحدة والدرس، وسأعرض لك الأسئلة التي تتوفر لها إجابات مؤكدة في محتوى نغماتي.',
}

export default function UncleSolChat() {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage])
  const [notice, setNotice] = useState('')
  const [selectedGradeId, setSelectedGradeId] = useState('')
  const [selectedUnitId, setSelectedUnitId] = useState('')
  const [selectedLessonId, setSelectedLessonId] = useState('')
  const nextId = useRef(2)
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selectedGrade = grades.find((grade) => grade.id === selectedGradeId)
  const selectedUnit = selectedGrade?.units.find((unit) => unit.id === selectedUnitId)
  const selectedLesson = selectedUnit?.lessons.find((lesson) => lesson.id === selectedLessonId)
  const availableQuestions = (selectedLesson?.quiz ?? []).filter(
    (question) => !/أي عنوان يطابق الدرس الحالي/.test(question.question),
  )
  const teacherMessage = [
    'السلام عليكم ورحمة الله وبركاته،',
    'لدي سؤال عن منهج نغماتي لم أجد إجابته في مساعد العم صول.',
    selectedGrade ? `الصف: ${selectedGrade.title}` : '',
    selectedUnit ? `الوحدة: ${selectedUnit.title}` : '',
    selectedLesson ? `الدرس: ${selectedLesson.title}` : '',
    draft.trim() ? `السؤال: ${draft.trim()}` : '',
    'أرجو المساعدة، وشكرًا لكم.',
  ].filter(Boolean).join('\n')
  const teacherWhatsAppUrl = `https://wa.me/${TEACHER_WHATSAPP}?text=${encodeURIComponent(teacherMessage)}`

  useEffect(() => {
    if (!open) return
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [open, messages, sending, selectedGradeId, selectedUnitId, selectedLessonId])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open])

  function chooseGrade(gradeId: string) {
    setSelectedGradeId(gradeId)
    setSelectedUnitId('')
    setSelectedLessonId('')
    setDraft('')
    setNotice('')
  }

  function chooseUnit(unitId: string) {
    setSelectedUnitId(unitId)
    setSelectedLessonId('')
    setDraft('')
    setNotice('')
  }

  function chooseLesson(lessonId: string) {
    setSelectedLessonId(lessonId)
    setDraft('')
    setNotice('')
  }

  function resetChoices() {
    setSelectedGradeId('')
    setSelectedUnitId('')
    setSelectedLessonId('')
    setDraft('')
    setNotice('')
  }

  function answerQuestion(questionIndex: number) {
    if (!selectedLesson) return
    const question = availableQuestions[questionIndex]
    if (!question) return
    const correctAnswer = question.options[question.answer]
    const answer = question.hint
      ? `الإجابة الصحيحة: ${correctAnswer}\n\nتلميح من محتوى الدرس: ${question.hint}`
      : `الإجابة الصحيحة: ${correctAnswer}`
    setMessages((current) => [
      ...current,
      { id: nextId.current++, role: 'student', text: question.question },
      {
        id: nextId.current++,
        role: 'assistant',
        text: `${answer}\n\nالمصدر: ${selectedGrade?.title} — ${selectedUnit?.title} — ${selectedLesson.title}.`,
      },
    ])
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const question = draft.trim()
    if (!question || sending) return
    setMessages((current) => [
      ...current,
      { id: nextId.current++, role: 'student', text: question },
      {
        id: nextId.current++,
        role: 'assistant',
        text: 'لضمان صحة الإجابة، أعرض هنا الأسئلة المعتمدة في المنهج فقط. إذا لم تجد سؤالك ضمن القائمة، يمكنك إرساله إلى المعلمة عبر واتساب باستخدام خيار «سؤالي غير موجود».',
      },
    ])
    setNotice('')
  }

  return (
    <>
      {!open && (
        <button type="button" className="sol-floating-trigger" onClick={() => setOpen(true)} aria-label="اسأل العم صول إذا واجهك أي تساؤل" aria-haspopup="dialog">
          <span className="sol-trigger-icon"><span>𝄞</span><Sparkles className="sol-trigger-spark" size={18} /></span>
          <span className="sol-trigger-copy"><strong>اسأل العم صول</strong><span>إذا واجهك أي تساؤل!</span></span>
        </button>
      )}

      {open && (
        <div className="sol-chat-layer">
          <button className="sol-chat-backdrop" aria-label="إغلاق دردشة العم صول" onClick={() => setOpen(false)} />
          <aside className="sol-chat-drawer" role="dialog" aria-modal="true" aria-labelledby="sol-chat-title" dir="rtl">
            <header className="sol-chat-header">
              <button className="sol-close-button" type="button" onClick={() => setOpen(false)} aria-label="إغلاق الدردشة"><X size={22} /></button>
              <div className="sol-header-identity">
                <UncleSolAvatar />
                <div><h2 id="sol-chat-title">دردشة مع العم صول</h2><p>مساعدك في منهج نغماتي</p></div>
              </div>
              <div className="sol-header-note"><Music2 size={16} /> إجابات مستندة إلى محتوى المنهج</div>
            </header>

            <div className="sol-chat-messages" aria-live="polite" aria-relevant="additions text">
              <div className="sol-chat-day-label"><span>بداية الدردشة</span></div>
              {messages.map((message) => (
                <div key={message.id} className={`sol-message-row ${message.role === 'student' ? 'sol-message-row--student' : ''}`}>
                  {message.role === 'assistant' && <UncleSolAvatar small />}
                  <div className={`sol-message-bubble ${message.role === 'student' ? 'sol-message-bubble--student' : 'sol-message-bubble--assistant'}`}>
                    <span className="sol-message-author">{message.role === 'student' ? 'الطالب' : 'العم صول'}</span>
                    <p>{message.text}</p>
                  </div>
                </div>
              ))}

              <section className="sol-picker" aria-label="اختيار موضوع السؤال">
                <div className="sol-picker-heading">
                  <div><strong>اختر موضوع سؤالك</strong><span>انتقل خطوة بخطوة للوصول إلى الإجابات المتاحة.</span></div>
                  <button type="button" onClick={resetChoices} className="sol-reset-button" aria-label="البدء من جديد" title="البدء من جديد"><RotateCcw size={16} /></button>
                </div>

                {!selectedGrade && <>
                  <div className="sol-picker-step">
                    <span className="sol-step-number">١</span><strong>اختر الصف</strong>
                  </div>
                  <div className="sol-option-list">
                    {grades.map((grade) => (
                      <button key={grade.id} type="button" className="sol-option-button" onClick={() => chooseGrade(grade.id)}>
                        <span>{grade.emoji} {grade.title}</span><ChevronLeft size={17} />
                      </button>
                    ))}
                  </div>
                </>}

                {selectedGrade && !selectedUnit && <>
                  <div className="sol-picker-step">
                    <span className="sol-step-number">٢</span><strong>اختر الوحدة</strong>
                    <button type="button" className="sol-change-step" onClick={() => resetChoices()}>تغيير الصف</button>
                  </div>
                  <div className="sol-option-list">
                    {selectedGrade.units.map((unit) => (
                      <button key={unit.id} type="button" className="sol-option-button" onClick={() => chooseUnit(unit.id)}>
                        <span>{unit.emoji} {unit.title}</span><ChevronLeft size={17} />
                      </button>
                    ))}
                  </div>
                </>}

                {selectedGrade && selectedUnit && !selectedLesson && <>
                  <div className="sol-picker-step">
                    <span className="sol-step-number">٣</span><strong>اختر الدرس</strong>
                    <button type="button" className="sol-change-step" onClick={() => { setSelectedUnitId(''); setSelectedLessonId('') }}>تغيير الوحدة</button>
                  </div>
                  <div className="sol-option-list">
                    {selectedUnit.lessons.map((lesson) => (
                      <button key={lesson.id} type="button" className="sol-option-button" onClick={() => chooseLesson(lesson.id)}>
                        <span>{lesson.emoji} {lesson.title}</span><ChevronLeft size={17} />
                      </button>
                    ))}
                  </div>
                </>}

                {selectedLesson && <>
                  <div className="sol-picker-step">
                    <span className="sol-step-number">٤</span><strong>الأسئلة المتاحة للإجابة</strong>
                    <button type="button" className="sol-change-step" onClick={() => setSelectedLessonId('')}>تغيير الدرس</button>
                  </div>
                  {availableQuestions.length > 0 && (
                    <div className="sol-question-list">
                      {availableQuestions.map((question, index) => (
                        <button key={`${question.question}-${index}`} type="button" onClick={() => answerQuestion(index)}>
                          <span>{question.question}</span><ChevronLeft size={17} />
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="sol-no-questions">
                    <p>يمكنك إرسال سؤالك إلى المعلمة</p>
                    <textarea
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      placeholder="اكتب سؤالك هنا..."
                      aria-label="اكتب السؤال الذي تريد إرساله إلى المعلمة"
                      maxLength={500}
                      rows={3}
                    />
                  </div>
                  <a className="sol-teacher-link" href={teacherWhatsAppUrl} target="_blank" rel="noopener noreferrer">
                    <MessageCircle size={18} /><span>سؤالي غير موجود — أرسله إلى المعلمة عبر واتساب</span>
                  </a>
                </>}
              </section>
              <div ref={endRef} />
            </div>

            <form className="sol-chat-composer" onSubmit={handleSubmit}>
              {notice && <p className="sol-chat-notice" role="status">{notice}</p>}
              <div className="sol-input-row">
                <input ref={inputRef} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="اكتب سؤالك (يمكنك إرساله للمعلمة)..." aria-label="اكتب سؤالك للعم صول" maxLength={500} disabled={sending} />
                <button type="submit" className="sol-send-button" disabled={!draft.trim() || sending} aria-label="إرسال السؤال"><ArrowUp size={22} /></button>
              </div>
              <p className="sol-chat-footnote">🔒 لا تُرسل الأسئلة إلى خدمة ذكاء اصطناعي خارجية.</p>
            </form>
          </aside>
        </div>
      )}
    </>
  )
}
