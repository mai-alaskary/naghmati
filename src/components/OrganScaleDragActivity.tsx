import { useState } from 'react'

type NoteId = 'do' | 're' | 'mi' | 'fa' | 'sol' | 'do2'
type Note = { id: NoteId; name: string; latin: string; frequency: number; staffY: number }
const NOTES: Note[] = [
  { id: 'do', name: 'دو', latin: 'C', frequency: 261.63, staffY: 57.5 },
  { id: 're', name: 'ري', latin: 'D', frequency: 293.66, staffY: 50 },
  { id: 'mi', name: 'مي', latin: 'E', frequency: 329.63, staffY: 42.5 },
  { id: 'fa', name: 'فا', latin: 'F', frequency: 349.23, staffY: 35 },
  { id: 'sol', name: 'صول', latin: 'G', frequency: 392, staffY: 27.5 },
  { id: 'do2', name: 'دو′', latin: 'C5', frequency: 523.25, staffY: 12.5 },
]
const SHUFFLED: NoteId[] = ['mi', 'do2', 'do', 'sol', 're', 'fa']

function playNote(note: Note) {
  const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext
  if (!AudioContextClass) return
  const context = new AudioContextClass()
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.type = 'triangle'
  oscillator.frequency.value = note.frequency
  oscillator.connect(gain)
  gain.connect(context.destination)
  const now = context.currentTime
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.16, now + 0.025)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42)
  oscillator.start(now)
  oscillator.stop(now + 0.44)
  oscillator.onended = () => { void context.close() }
}

function NoteStaff({ note }: { note: Note }) {
  return <svg viewBox="0 0 220 125" role="img" aria-label={`نغمة ${note.name} على المدرج الموسيقي بمفتاح صول`} className="mx-auto block w-full max-w-[220px]">
    {[35, 50, 65, 80, 95].map(y => <line key={y} x1="18" x2="202" y1={y} y2={y} stroke="#475569" strokeWidth="1.5" />)}
    <text x="34" y="83" fontSize="57" fill="#7c3aed" fontFamily="serif">𝄞</text>
    {note.staffY < 35 && <line x1="111" x2="145" y1="20" y2="20" stroke="#475569" strokeWidth="1.5" />}
    <ellipse cx="126" cy={note.staffY} rx="9" ry="6.2" transform={`rotate(-22 126 ${note.staffY})`} fill="#0f172a" />
    <line x1="134" x2="134" y1={note.staffY} y2={note.staffY - 31} stroke="#0f172a" strokeWidth="2.5" />
    <text x="126" y="117" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#334155">{note.name}</text>
  </svg>
}

export default function OrganScaleDragActivity() {
  const [placed, setPlaced] = useState<Partial<Record<NoteId, NoteId>>>({})
  const [selected, setSelected] = useState<NoteId | null>(null)
  const [message, setMessage] = useState('')
  const [wrongTarget, setWrongTarget] = useState<NoteId | null>(null)
  const complete = NOTES.every(note => placed[note.id] === note.id)
  const used = Object.values(placed)

  function place(target: NoteId, draggedId: string | null) {
    const noteId = (draggedId || selected) as NoteId | null
    if (!noteId || !NOTES.some(note => note.id === noteId)) {
      setMessage('اختَر قصاصة نغمة من الأسفل، ثم ضعها فوق المفتاح المناسب.')
      return
    }
    if (placed[target] === target || used.includes(noteId)) return
    if (noteId !== target) {
      setWrongTarget(target)
      setMessage('قريبة! تذكّر ترتيب سلم دو الكبير: دو، ري، مي، فا، صول، دو. جرّب مرة أخرى 🌟')
      window.setTimeout(() => setWrongTarget(current => current === target ? null : current), 800)
      return
    }
    setPlaced(current => ({ ...current, [target]: noteId }))
    setSelected(null)
    setWrongTarget(null)
    setMessage('أحسنت! نغمة صحيحة 🎵')
    playNote(NOTES.find(note => note.id === target)!)
    if (NOTES.every(note => note.id === target || placed[note.id] === note.id)) {
      window.setTimeout(() => NOTES.forEach((note, index) => window.setTimeout(() => playNote(note), index * 260)), 480)
      setMessage('رائع! رتّبت نغمات سلم دو الكبير من دو إلى دو العليا! 🎉')
    }
  }

  function reset() {
    setPlaced({})
    setSelected(null)
    setWrongTarget(null)
    setMessage('')
  }

  return <section className="space-y-5 rounded-3xl border-2 border-violet-200 bg-gradient-to-br from-violet-50 via-white to-sky-50 p-4 md:p-6" dir="rtl">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h3 className="text-xl md:text-2xl font-extrabold text-violet-950">🎹 نشاط تفاعلي: رتّب نغمات سلم دو الكبير</h3>
        <p className="mt-2 text-slate-700">اسحب كل قصاصة إلى المفتاح المطابق لها بالترتيب من دو إلى دو العليا. على الهاتف، اضغط على القصاصة ثم على المفتاح.</p>
      </div>
      <span className="rounded-full bg-white px-4 py-2 font-extrabold text-violet-800 shadow-sm">{NOTES.filter(note => placed[note.id] === note.id).length} / 6 نغمات</span>
    </div>

    <div className="rounded-2xl border border-sky-200 bg-white p-3 sm:p-4">
      <h4 className="mb-3 text-center text-lg font-extrabold text-slate-800">١. لوحة مفاتيح الأورج — ضع كل نغمة فوق مفتاحها</h4>
      <div className="relative mx-auto max-w-3xl pt-1" aria-label="مفاتيح سلم دو الكبير">
        <div className="flex min-h-44 gap-0.5 rounded-xl border border-slate-400 bg-slate-800 p-1.5 pb-2 shadow-[0_8px_14px_rgba(15,23,42,0.22)] sm:min-h-56 sm:gap-1 sm:p-2" dir="ltr">
          {NOTES.map((note, index) => {
            const isPlaced = placed[note.id] === note.id
            const isWrong = wrongTarget === note.id
            return <div key={note.id} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); place(note.id, event.dataTransfer.getData('text/plain')) }}
              onClick={() => selected ? place(note.id, null) : playNote(note)}
              role="button" tabIndex={0} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selected ? place(note.id, null) : playNote(note) } }}
              aria-label={selected ? `ضع النغمة المختارة على مفتاح ${note.name}` : `اعزف نغمة ${note.name}`}
              className={'relative flex min-w-0 flex-1 cursor-pointer touch-manipulation flex-col items-center rounded-b-md border-x border-b-2 border-slate-300 px-0.5 pb-3 pt-4 text-center transition-all duration-100 sm:pt-5 ' + (isPlaced ? 'translate-y-1 border-emerald-500 bg-gradient-to-b from-emerald-50 to-emerald-100 shadow-[inset_0_2px_5px_rgba(16,185,129,0.2),0_0_0_2px_rgba(16,185,129,0.35)]' : isWrong ? 'animate-pulse translate-y-1 border-rose-500 bg-rose-50 shadow-[0_0_0_2px_rgba(244,63,94,0.4)]' : 'bg-gradient-to-b from-white via-white to-slate-100 shadow-[0_3px_0_#cbd5e1,0_5px_7px_rgba(15,23,42,0.18)] hover:from-violet-50 hover:to-slate-100 active:translate-y-1 active:shadow-inner')}>
              <span className="text-[10px] font-bold text-slate-500 sm:text-xs">المفتاح {index + 1}</span>
              <span className="mt-2 text-xl font-black text-slate-800 sm:text-3xl">{note.name}</span>
              <span className="text-xs font-bold text-slate-500 sm:text-sm">{note.latin}</span>
              <div className="mt-3 flex flex-1 items-center justify-center">
                {isPlaced ? <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-xl font-black text-white sm:h-10 sm:w-10" aria-label="إجابة صحيحة">✓</span> : <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300/70 bg-slate-100/70 text-xl text-slate-400 sm:h-10 sm:w-10">＋</span>}
              </div>
              <span className={'mt-2 text-[10px] font-extrabold sm:text-xs ' + (isPlaced ? 'text-emerald-700' : 'text-slate-500')}>{isPlaced ? 'صحيح!' : 'أفلت هنا'}</span>
            </div>
          })}
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute left-0 right-0 top-1 z-10 h-[48%]" dir="ltr">
          {[{ left: '8.33%' }, { left: '25%' }, { left: '58.33%' }, { left: '75%' }].map((key, index) => <div key={index} style={{ left: key.left }} className="absolute top-0 h-[82%] w-[8.5%] -translate-x-1/2 rounded-b-md border-x border-b-2 border-slate-950 bg-gradient-to-r from-slate-700 via-slate-900 to-black shadow-[0_4px_5px_rgba(0,0,0,0.4)] sm:w-[8%]">
            <div className="h-2/3 rounded-b-sm border-b border-slate-600/70 bg-gradient-to-b from-slate-700 to-slate-950" />
          </div>)}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {NOTES.map(note => <button key={note.id} type="button" onClick={() => playNote(note)} className="rounded-full border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-bold text-sky-900 hover:bg-sky-100" aria-label={`استمع إلى نغمة ${note.name}`}>🔊 اسمع {note.name}</button>)}
      </div>
    </div>

    <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3 sm:p-4">
      <h4 className="mb-3 text-center text-lg font-extrabold text-amber-950">٢. قصاصات النغمات — اسحبها إلى المفاتيح</h4>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {SHUFFLED.map(id => {
          const note = NOTES.find(item => item.id === id)!
          const isPlaced = placed[id] === id
          return <button key={id} type="button" draggable={!isPlaced}
            onDragStart={event => { event.dataTransfer.setData('text/plain', id); event.dataTransfer.effectAllowed = 'move'; setSelected(id) }}
            onClick={() => { if (!isPlaced) { setSelected(id); setMessage(`تم اختيار قصاصة نغمة ${note.name}. اضغط على المفتاح المناسب بالأعلى.`) } }}
            aria-pressed={selected === id} disabled={isPlaced}
            className={'relative rounded-xl border-2 border-dashed bg-white p-3 text-center shadow-sm transition touch-manipulation ' + (isPlaced ? 'border-emerald-300 opacity-60' : selected === id ? 'border-violet-500 bg-violet-50 ring-2 ring-violet-200' : 'border-amber-300 hover:border-amber-500')}>
            <span className="absolute -top-2 right-3 rounded bg-amber-100 px-1 text-xs" aria-hidden="true">✂️</span>
            <span className="block pt-2 text-sm font-extrabold text-slate-800">قصاصة نغمة {note.name}</span>
            <NoteStaff note={note} />
            <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">{note.latin} — {note.name}</span>
            {isPlaced && <span className="mt-2 block font-extrabold text-emerald-700">تم وضعها ✓</span>}
          </button>
        })}
      </div>
    </div>

    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-3">
      <p className="font-extrabold text-slate-700" role="status" aria-live="polite">{message || 'ابدأ بسحب القصاصات إلى المفاتيح المناسبة. استمع إلى النغمات من أزرار الصوت.'}</p>
      <button type="button" onClick={reset} className="rounded-full bg-violet-600 px-5 py-2.5 font-extrabold text-white hover:bg-violet-700">إعادة النشاط ↻</button>
    </div>
    {complete && <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4 text-center text-lg font-extrabold text-emerald-800">🎉 ممتاز! اكتمل سلم دو الكبير: دو — ري — مي — فا — صول — دو العليا.</div>}
  </section>
}
