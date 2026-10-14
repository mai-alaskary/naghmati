import { useState } from 'react'

type PartId = 'controls' | 'speaker' | 'power' | 'keys'
type Part = { id: PartId; label: string; number: number; hint: string }
const PARTS: Part[] = [
  { id: 'controls', label: 'أزرار تغيير الأصوات والإيقاعات', number: 1, hint: 'الأزرار الصغيرة أعلى المفاتيح' },
  { id: 'speaker', label: 'سماعة آلة الأورج', number: 2, hint: 'مكان خروج الصوت' },
  { id: 'power', label: 'زر تشغيل آلة الأورج', number: 3, hint: 'زر تشغيل الجهاز' },
  { id: 'keys', label: 'أصابع بيضاء وسوداء', number: 4, hint: 'المفاتيح التي نعزف عليها' },
]
const SECOND_ACTIVITY_URL = 'https://ict.moe.gov.om/library/file/Content/4/Music/cls4_TB_Interactive_Aactivity2_p1/index.html'

function playEncouragingTone() {
  const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext
  if (!AudioContextClass) return
  const context = new AudioContextClass()
  const now = context.currentTime
  ;[523.25, 659.25, 783.99].forEach((frequency, index) => {
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    const start = now + index * 0.12
    oscillator.type = 'sine'
    oscillator.frequency.value = frequency
    oscillator.connect(gain)
    gain.connect(context.destination)
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(0.13, start + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.18)
    oscillator.start(start)
    oscillator.stop(start + 0.2)
  })
  window.setTimeout(() => context.close(), 700)
}

export default function OrganBookActivities() {
  const [placed, setPlaced] = useState<Partial<Record<PartId, PartId>>>({})
  const [selected, setSelected] = useState<PartId | null>(null)
  const [wrongSlot, setWrongSlot] = useState<PartId | null>(null)
  const [message, setMessage] = useState('')
  const completed = PARTS.filter(part => placed[part.id] === part.id).length
  const used = Object.values(placed)

  function place(target: PartId, draggedId: string | null) {
    const partId = (draggedId || selected) as PartId | null
    if (!partId || !PARTS.some(part => part.id === partId)) {
      setMessage('اختَر بطاقة من الأعلى، ثم ضعها في المكان المناسب.')
      return
    }
    if (placed[target] === target || used.includes(partId)) return
    if (partId !== target) {
      setWrongSlot(target)
      setMessage('ليست هذه القطعة المناسبة لهذا المكان. حاول مرة أخرى! 💪')
      window.setTimeout(() => setWrongSlot(current => current === target ? null : current), 900)
      return
    }
    setPlaced(current => ({ ...current, [target]: partId }))
    setSelected(null)
    setWrongSlot(null)
    setMessage('أحسنت! توصيل صحيح 🎉 اضغط على الجزء المكتمل لسماع نغمة.')
    playEncouragingTone()
  }

  function reset() {
    setPlaced({})
    setSelected(null)
    setWrongSlot(null)
    setMessage('')
  }

  return <div className="space-y-6">
    <div className="rounded-2xl border-2 border-sky-200 bg-gradient-to-br from-sky-50 via-white to-violet-50 p-4 md:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className="text-xl md:text-2xl font-extrabold text-sky-900">النشاط الأول: اكتشف أجزاء آلة الأورج 🎹</h4>
          <p className="mt-2 text-slate-700">اسحب كل بطاقة إلى المربع الذي يشير إلى الجزء المناسب. على الهاتف، اضغط على البطاقة أولًا ثم اضغط على مربع الإجابة.</p>
        </div>
        <span className="rounded-full bg-white px-4 py-2 font-extrabold text-violet-700 shadow-sm">{completed} / 4 أجزاء</span>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {PARTS.map(part => {
          const isPlaced = placed[part.id] === part.id
          return <button key={part.id} type="button" draggable={!isPlaced}
            onDragStart={event => { event.dataTransfer.setData('text/plain', part.id); event.dataTransfer.effectAllowed = 'move'; setSelected(part.id) }}
            onClick={() => { if (!isPlaced) { setSelected(part.id); setMessage('تم اختيار البطاقة. اضغط الآن على مربع الجزء المناسب.') } else playEncouragingTone() }}
            disabled={isPlaced}
            className={'min-h-14 rounded-xl border-2 p-3 text-right font-bold transition touch-manipulation '+(isPlaced ? 'border-emerald-300 bg-emerald-50 text-emerald-800 opacity-75' : selected === part.id ? 'border-violet-500 bg-violet-100 ring-2 ring-violet-200' : 'border-white bg-white shadow-sm hover:border-sky-300')}>
            <span className="ml-2 inline-block rounded-lg bg-amber-100 px-2 py-1">✂️</span>{part.label}{isPlaced && <span className="mr-2 text-emerald-700">✓</span>}
          </button>
        })}
      </div>

      <div className="overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-2 sm:p-4">
        <svg viewBox="0 0 800 340" role="img" aria-label="رسم توضيحي لآلة أورج مع أسهم مرقمة تشير إلى أجزائها الأربعة" className="mx-auto block w-full max-w-4xl">
          <defs>
            <linearGradient id="organBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#64748b"/><stop offset="100%" stopColor="#334155"/></linearGradient>
            <marker id="organArrow" markerWidth="8" markerHeight="8" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#7c3aed"/></marker>
          </defs>
          <rect x="95" y="64" width="610" height="176" rx="20" fill="url(#organBody)" stroke="#1e293b" strokeWidth="4"/>
          <rect x="120" y="84" width="560" height="52" rx="8" fill="#1e293b"/>
          <rect x="135" y="96" width="100" height="27" rx="4" fill="#0f172a" stroke="#94a3b8"/>
          <text x="185" y="114" fontSize="12" fill="#bae6fd" textAnchor="middle" fontWeight="bold">TONE / RHYTHM</text>
          {Array.from({length:8},(_,i)=><g key={i}><rect x={250+i*48} y="94" width="38" height="30" rx="4" fill={i%2===0?'#fbbf24':'#a5f3fc'} stroke="#e2e8f0"/><circle cx={269+i*48} cy="109" r="3" fill="#334155"/></g>)}
          <rect x="610" y="93" width="46" height="32" rx="5" fill="#475569" stroke="#cbd5e1"/>
          <circle cx="633" cy="109" r="10" fill="#111827" stroke="#f8fafc" strokeWidth="2"/>
          <circle cx="633" cy="109" r="3" fill="#ef4444"/>
          <rect x="130" y="151" width="84" height="70" rx="7" fill="#0f172a" stroke="#94a3b8" strokeWidth="2"/>
          {[0,1,2,3,4].map(i=><g key={i}><circle cx={145+i*14} cy="166" r="3" fill="#cbd5e1"/><circle cx={145+i*14} cy="207" r="3" fill="#cbd5e1"/></g>)}
          <path d="M143 180 Q172 163 201 180 M143 191 Q172 174 201 191 M143 202 Q172 185 201 202" fill="none" stroke="#94a3b8" strokeWidth="2"/>
          <rect x="225" y="151" width="430" height="70" rx="4" fill="#e2e8f0" stroke="#0f172a" strokeWidth="2"/>
          {Array.from({length:21},(_,i)=><rect key={i} x={228+i*20.2} y="154" width="19.8" height="64" rx="1.5" fill="#fff" stroke="#64748b" strokeWidth="1"/>)}
          {Array.from({length:15},(_,i)=>i).filter(i=>![2,6,9,13].includes(i%7)).map(i=><rect key={i} x={241+i*20.2} y="154" width="12" height="39" rx="2" fill="#111827" stroke="#334155" strokeWidth="1"/>)}
          <circle cx="633" cy="109" r="22" fill="none" stroke="#fef08a" strokeWidth="2" opacity=".9"/>
          <circle cx="172" cy="184" r="25" fill="none" stroke="#fef08a" strokeWidth="2" opacity=".9"/>
          <rect x="250" y="80" width="360" height="64" rx="7" fill="none" stroke="#fef08a" strokeWidth="2" strokeDasharray="5 5"/>
          <rect x="225" y="151" width="430" height="70" rx="4" fill="none" stroke="#fef08a" strokeWidth="2" strokeDasharray="5 5"/>
          <g fill="none" stroke="#7c3aed" strokeWidth="3" strokeLinecap="round" markerEnd="url(#organArrow)">
            <path d="M633 109 C720 110 740 145 740 258 L700 280"/>
            <path d="M172 184 C100 200 65 218 65 258 L100 280"/>
            <path d="M420 110 C380 170 310 220 300 258 L300 280"/>
            <path d="M420 205 C480 230 500 250 500 280"/>
          </g>
          <g fontSize="19" fontWeight="bold" textAnchor="middle">
            <circle cx="700" cy="280" r="17" fill="#7c3aed"/><text x="700" y="287" fill="#fff">٣</text>
            <circle cx="100" cy="280" r="17" fill="#7c3aed"/><text x="100" y="287" fill="#fff">٢</text>
            <circle cx="300" cy="280" r="17" fill="#7c3aed"/><text x="300" y="287" fill="#fff">١</text>
            <circle cx="500" cy="280" r="17" fill="#7c3aed"/><text x="500" y="287" fill="#fff">٤</text>
          </g>
          <text x="400" y="28" fontSize="21" fontWeight="bold" textAnchor="middle" fill="#334155">آلة الأورج — تعرّف إلى أجزائها</text>
        </svg>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        {([
          {id:'speaker',number:2,title:'المربع رقم ٢'},
          {id:'controls',number:1,title:'المربع رقم ١'},
          {id:'keys',number:4,title:'المربع رقم ٤'},
          {id:'power',number:3,title:'المربع رقم ٣'},
        ] as {id:PartId;number:number;title:string}[]).map(target => {
          const partId = placed[target.id]
          const correct = partId === target.id
          const wrong = wrongSlot === target.id
          return <button key={target.id} type="button"
            onDragOver={event => { event.preventDefault(); event.dataTransfer.dropEffect = 'move' }}
            onDrop={event => { event.preventDefault(); place(target.id, event.dataTransfer.getData('text/plain')) }}
            onClick={() => place(target.id, null)}
            className={'min-h-24 rounded-xl border-2 border-dashed p-3 text-center font-bold transition touch-manipulation '+(correct?'border-emerald-500 bg-emerald-50 text-emerald-800':wrong?'border-rose-500 bg-rose-50 text-rose-700':'border-slate-300 bg-slate-50 hover:border-violet-400 hover:bg-violet-50')}>
            <span className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-white">{target.number}</span>
            {partId ? <><span className="block">{PARTS.find(part => part.id === partId)?.label}</span><span className="mt-1 block text-sm">{correct?'صحيح ✓ — اضغط لسماع النغمة':'حاول مرة أخرى'}</span></> : <span className="block">ضع البطاقة هنا</span>}
          </button>
        })}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p aria-live="polite" role="status" className="min-h-7 font-extrabold text-slate-700">{message || 'ابحث عن الجزء الذي يشير إليه كل سهم.'}</p>
        <button type="button" onClick={reset} className="rounded-full border-2 border-slate-200 bg-white px-4 py-2 font-bold hover:bg-slate-50">إعادة النشاط ↺</button>
      </div>
      {completed===4 && <div role="status" className="mt-3 rounded-xl border-2 border-emerald-300 bg-emerald-100 p-4 text-center text-lg font-extrabold text-emerald-800">رائع! تعرّفت إلى أجزاء آلة الأورج الأربعة كلها! 🌟</div>}
    </div>

    <div className="rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-4 md:p-6">
      <h4 className="text-xl md:text-2xl font-extrabold text-amber-900">النشاط الثاني: نشاط تفاعلي من الكتاب 🎼</h4>
      <p className="mt-2 text-slate-700">افتح النشاط التفاعلي المرفق من كتاب المهارات الموسيقية للصف الرابع.</p>
      <div className="mt-4 overflow-hidden rounded-xl border-2 border-amber-100 bg-white">
        <iframe src={SECOND_ACTIVITY_URL} title="النشاط التفاعلي الثاني — آلة الأورج، الصف الرابع" className="block w-full border-0" style={{height:'min(72vh, 680px)', minHeight:'420px'}} loading="lazy" allow="fullscreen" />
      </div>
      <a href={SECOND_ACTIVITY_URL} target="_blank" rel="noreferrer" className="mt-3 inline-flex rounded-full bg-amber-500 px-5 py-3 font-extrabold text-white hover:bg-amber-600">فتح النشاط في نافذة مستقلة ↗</a>
    </div>
  </div>
}
