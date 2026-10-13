import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ArrowUp, Mic, Music2, Sparkles, X } from 'lucide-react'

type ChatMessage = {
  id: number
  role: 'assistant' | 'student'
  text: string
}

const welcomeMessage: ChatMessage = {
  id: 1,
  role: 'assistant',
  text: 'مرحباً! أنا جاهز للإجابة على أسئلتك من المنهج فقط. 🎵 اسألني عن أي درس في نغماتي!',
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

export default function UncleSolChat() {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage])
  const [notice, setNotice] = useState('')
  const nextId = useRef(2)
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    inputRef.current?.focus()
  }, [open, messages, sending])

  useEffect(() => {
    if (!open) return
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const question = draft.trim()
    if (!question || sending) return

    const studentMessage: ChatMessage = { id: nextId.current++, role: 'student', text: question }
    setMessages((current) => [...current, studentMessage])
    setDraft('')
    setNotice('')
    setSending(true)

    const apiUrl = import.meta.env.VITE_SOL_API_URL as string | undefined
    if (!apiUrl) {
      setMessages((current) => [
        ...current,
        {
          id: nextId.current++,
          role: 'assistant',
          text: 'وصلني سؤالك! 🎼 واجهة العم صول جاهزة، لكن لم يتم ربطها بعد بمحرك الإجابات المعتمد على المنهج. عندما يتم ربط الخدمة، سأجيبك من دروس نغماتي فقط.',
        },
      ])
      setSending(false)
      return
    }

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, messages: messages.map(({ role, text }) => ({ role, content: text })) }),
      })
      if (!response.ok) throw new Error('تعذر الحصول على الإجابة')
      const data = (await response.json()) as { answer?: string }
      if (!data.answer?.trim()) throw new Error('لم تصل إجابة صالحة')
      setMessages((current) => [...current, { id: nextId.current++, role: 'assistant', text: data.answer!.trim() }])
    } catch {
      setNotice('لم أستطع الاتصال الآن. حاول مرة أخرى بعد قليل.')
    } finally {
      setSending(false)
    }
  }

  function startVoiceInput() {
    type SpeechRecognitionLike = {
      lang: string
      interimResults: boolean
      onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
      onerror: (() => void) | null
      start: () => void
    }
    type SpeechWindow = Window & {
      SpeechRecognition?: new () => SpeechRecognitionLike
      webkitSpeechRecognition?: new () => SpeechRecognitionLike
    }
    const speechWindow = window as SpeechWindow
    const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition
    if (!Recognition) {
      setNotice('الإملاء الصوتي غير متاح في هذا المتصفح. يمكنك كتابة سؤالك هنا.')
      return
    }
    const recognition = new Recognition()
    recognition.lang = 'ar'
    recognition.interimResults = false
    recognition.onresult = (event) => setDraft((event.results[0]?.[0]?.transcript ?? '').trim())
    recognition.onerror = () => setNotice('لم أتمكن من سماعك بوضوح. حاول مرة أخرى.')
    recognition.start()
    setNotice('تحدث الآن، وسيظهر سؤالك في خانة الكتابة.')
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          className="sol-floating-trigger"
          onClick={() => setOpen(true)}
          aria-label="اسأل العم صول إذا واجهك أي تساؤل"
          aria-haspopup="dialog"
        >
          <span className="sol-trigger-icon"><span>𝄞</span><Sparkles className="sol-trigger-spark" size={18} /></span>
          <span className="sol-trigger-copy">
            <strong>اسأل العم صول</strong>
            <span>إذا واجهك أي تساؤل!</span>
          </span>
        </button>
      )}

      {open && (
        <div className="sol-chat-layer">
          <button className="sol-chat-backdrop" aria-label="إغلاق دردشة العم صول" onClick={() => setOpen(false)} />
          <aside className="sol-chat-drawer" role="dialog" aria-modal="true" aria-labelledby="sol-chat-title" dir="rtl">
            <header className="sol-chat-header">
              <button className="sol-close-button" type="button" onClick={() => setOpen(false)} aria-label="إغلاق الدردشة">
                <X size={22} />
              </button>
              <div className="sol-header-identity">
                <UncleSolAvatar />
                <div>
                  <h2 id="sol-chat-title">دردشة مع العم صول</h2>
                  <p>يسعدني مساعدتك في المنهج!</p>
                </div>
              </div>
              <div className="sol-header-note"><Music2 size={16} /> رفيقك في رحلة الموسيقى</div>
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
              {sending && (
                <div className="sol-message-row">
                  <UncleSolAvatar small />
                  <div className="sol-message-bubble sol-message-bubble--assistant sol-typing" aria-label="العم صول يكتب">
                    <span /><span /><span />
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            <form className="sol-chat-composer" onSubmit={handleSubmit}>
              {notice && <p className="sol-chat-notice" role="status">{notice}</p>}
              <div className="sol-input-row">
                <button type="button" className="sol-tool-button" onClick={startVoiceInput} aria-label="إملاء السؤال صوتياً" title="إملاء صوتي">
                  <Mic size={20} />
                </button>
                <input
                  ref={inputRef}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="اكتب سؤالك هنا..."
                  aria-label="اكتب سؤالك للعم صول"
                  maxLength={700}
                  disabled={sending}
                />
                <button type="submit" className="sol-send-button" disabled={!draft.trim() || sending} aria-label="إرسال السؤال">
                  <ArrowUp size={22} />
                </button>
              </div>
              <p className="sol-chat-footnote">🎵 اسأل عن دروس الموسيقى في منهج نغماتي</p>
            </form>
          </aside>
        </div>
      )}
    </>
  )
}
