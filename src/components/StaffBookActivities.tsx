import { useRef, useState } from 'react'

const staffLines = [72, 92, 112, 132, 152]
const tracingPath = 'M 160 132 C 148 129 146 116 154 108 C 162 100 175 105 178 116 C 181 128 172 137 160 134 C 148 131 148 119 157 114 C 166 109 172 119 166 126 C 161 132 154 128 157 122 C 163 111 175 99 184 81 C 194 61 199 42 194 29 C 190 17 179 17 172 25 C 165 33 167 44 175 47 C 183 50 188 42 184 36 C 181 31 175 32 172 37 C 168 45 172 60 172 73 C 172 91 163 111 160 130 C 157 148 165 167 158 183 C 154 192 144 191 145 184'
const noteTargets = [
  { name: 'مي', type: 'line', y: 125 },
  { name: 'فا', type: 'space', y: 115 },
  { name: 'صول', type: 'line', y: 105 },
  { name: 'لا', type: 'space', y: 95 },
  { name: 'سي', type: 'line', y: 85 },
]
const cards = ['صول', 'لا', 'مي', 'سي', 'فا']

export default function StaffBookActivities() {
  const [strokes, setStrokes] = useState<string[][]>([[], [], []])
  const [activeStroke, setActiveStroke] = useState<string[]>([])
  const [drawing, setDrawing] = useState(false)
  const [matches, setMatches] = useState<Record<number, string>>({})
  const [selectedCard, setSelectedCard] = useState<string | null>(null)
  const [colored, setColored] = useState<Record<string, boolean>>({})
  const [feedback, setFeedback] = useState('')
  const svgRef = useRef<SVGSVGElement>(null)
  const correctCount = noteTargets.filter((n, i) => matches[i] === n.name).length

  function pointFromEvent(e: React.PointerEvent<SVGSVGElement>) {
    const svg = svgRef.current
    if (!svg) return ''
    const rect = svg.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 320
    const y = ((e.clientY - rect.top) / rect.height) * 220
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }
  function beginDraw(e: React.PointerEvent<SVGSVGElement>) {
    e.currentTarget.setPointerCapture(e.pointerId)
    setDrawing(true)
    setActiveStroke([pointFromEvent(e)])
  }
  function continueDraw(e: React.PointerEvent<SVGSVGElement>) {
    if (!drawing) return
    setActiveStroke(old => [...old, pointFromEvent(e)])
  }
  function endDraw() {
    if (!drawing) return
    setStrokes(old => [...old.slice(0, 2), [...activeStroke]])
    setActiveStroke([])
    setDrawing(false)
  }
  function placeCard(index: number) {
    if (!selectedCard) {
      setFeedback('اختَر اسم النغمة أولًا، ثم اضغط على الدائرة المناسبة.')
      return
    }
    const target = noteTargets[index]
    if (selectedCard === target.name) {
      setMatches(old => ({ ...old, [index]: selectedCard }))
      setFeedback('أحسنت! مكان النغمة صحيح 🎉')
      setSelectedCard(null)
    } else {
      setFeedback('جرّب مرة أخرى، وفكّر في ترتيب النغمات على المدرج 💪')
    }
  }

  return <div className="space-y-5">
    <p className="text-slate-700">تدرّب وارسم وتعرّف على أسماء خطوط ومسافات المدرج الموسيقي ومفتاح صول.</p>
    <div className="mb-6 rounded-2xl border-2 border-violet-200 bg-violet-50 p-4">
      <h4 className="text-xl font-extrabold text-violet-900">✍️ النشاط الأول: تتبّع وارسم مفتاح صول</h4>
      <p className="my-2 text-sm leading-7">اتبع المسار المنقّط من نقطة البداية إلى النهاية، ثم ارسم مفتاح صول في المساحة الفارغة. يمكنك الرسم باللمس أو بالفأرة.</p>
      <div className="overflow-hidden rounded-xl border-2 border-violet-100 bg-white">
        <svg viewBox="0 0 320 220" className="h-auto w-full" role="img" aria-label="نموذج منقط لتتبّع مفتاح صول">
          {staffLines.map(y => <line key={y} x1="18" x2="302" y1={y} y2={y} stroke="#334155" strokeWidth="1.6" />)}
          <defs>
            <marker id="trace-arrow" markerWidth="6" markerHeight="6" refX="4.5" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#f97316" />
            </marker>
          </defs>
          <path d={tracingPath} fill="none" stroke="#8b5cf6" strokeWidth="3.2" strokeDasharray="1 6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 151 117 Q 154 110 162 110" fill="none" stroke="#f97316" strokeWidth="1.8" strokeDasharray="2 2" markerEnd="url(#trace-arrow)" />
          <path d="M 178 96 Q 190 76 194 55" fill="none" stroke="#f97316" strokeWidth="1.8" strokeDasharray="2 2" markerEnd="url(#trace-arrow)" />
          <path d="M 164 91 Q 160 105 158 119" fill="none" stroke="#f97316" strokeWidth="1.8" strokeDasharray="2 2" markerEnd="url(#trace-arrow)" />
          <circle cx="160" cy="132" r="4.5" fill="#16a34a" stroke="white" strokeWidth="1" />
          <text x="168" y="145" fontSize="9" fill="#15803d" fontWeight="bold">ابدأ</text>
        </svg>
      </div>
      <h5 className="my-3 font-extrabold">جرّب رسم مفتاح صول بنفسك</h5>
      <svg ref={svgRef} viewBox="0 0 320 220" className="w-full touch-none rounded-xl border-2 border-dashed border-violet-300 bg-white" role="img" aria-label="مساحة رسم مفتاح صول" onPointerDown={beginDraw} onPointerMove={continueDraw} onPointerUp={endDraw} onPointerCancel={endDraw}>
        {staffLines.map(y => <line key={y} x1="10" x2="310" y1={y} y2={y} stroke="#94a3b8" strokeWidth="1.5" />)}
        {[...strokes, activeStroke].map((stroke, i) => stroke.length > 0 && <polyline key={i} points={stroke.join(' ')} fill="none" stroke="#7c3aed" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />)}
        {strokes.length === 0 && !drawing && <text x="160" y="42" textAnchor="middle" fontSize="11" fill="#94a3b8">ارسم هنا بإصبعك أو بالفأرة</text>}
      </svg>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className="rounded-xl bg-violet-600 px-4 py-2 font-bold text-white" onClick={() => { setStrokes(old => [...old.slice(0, 2), []]); setActiveStroke([]) }}>مسح آخر رسمة</button>
        <button type="button" className="rounded-xl border-2 border-violet-300 bg-white px-4 py-2 font-bold text-violet-800" onClick={() => { setStrokes([[], [], []]); setActiveStroke([]) }}>إعادة من البداية</button>
      </div>
    </div>

    <div className="rounded-2xl border-2 border-rose-200 bg-rose-50 p-4">
      <h4 className="text-xl font-extrabold text-rose-900">🎨 النشاط الثاني: صِل النغمات ولوّنها</h4>
      <p className="my-2 text-sm leading-7">اضغط على بطاقة اسم النغمة، ثم على الدائرة البيضاء في مكانها الصحيح. بعد التوصيل، لوّن أسماء الخطوط بالأحمر وأسماء المسافات بالأصفر.</p>
      <div className="mb-3 flex flex-wrap gap-2">
        {cards.map(name => <button type="button" key={name} onClick={() => { setSelectedCard(name); setFeedback(`اختيرت نغمة ${name}؛ اضغط على دائرتها في المدرج.`) }} className={`rounded-xl border-2 px-4 py-2 font-extrabold ${selectedCard === name ? 'border-violet-700 bg-violet-200 ring-2 ring-violet-300' : 'border-slate-300 bg-white'}`}>{name}</button>)}
      </div>
      <div className="overflow-hidden rounded-xl border-2 border-rose-100 bg-white">
        <svg viewBox="0 0 360 190" className="w-full" role="img" aria-label="مدرج موسيقي لتوصيل النغمات">
          {[45, 65, 85, 105, 125].map(y => <line key={y} x1="18" x2="342" y1={y} y2={y} stroke="#334155" strokeWidth="1.8" />)}
          <text x="26" y="102" fontSize="60" fill="#111827">𝄞</text>
          {noteTargets.map((n, i) => <g key={n.name} onClick={() => placeCard(i)} className="cursor-pointer">
            <circle cx={104 + i * 53} cy={n.y} r="12" fill={matches[i] ? '#bbf7d0' : '#fff'} stroke={matches[i] ? '#16a34a' : '#64748b'} strokeWidth="2.5" />
            {matches[i] && <text x={104 + i * 53} y={n.y + 4} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#166534">✓</text>}
          </g>)}
          <text x="180" y="165" textAnchor="middle" fontSize="11" fill="#64748b">اضغط على الدائرة بعد اختيار البطاقة</text>
        </svg>
      </div>
      <div className="my-3 flex flex-wrap items-center gap-2">
        <span className="font-extrabold">تلوين البطاقات:</span>
        <button type="button" onClick={() => setColored(old => ({ ...old, line: !old.line }))} className={`rounded-xl border-2 border-red-500 px-3 py-2 font-bold ${colored.line ? 'bg-red-500 text-white' : 'bg-red-100 text-red-800'}`}>الخطوط — أحمر</button>
        <button type="button" onClick={() => setColored(old => ({ ...old, space: !old.space }))} className={`rounded-xl border-2 border-yellow-500 px-3 py-2 font-bold ${colored.space ? 'bg-yellow-400 text-slate-900' : 'bg-yellow-100 text-yellow-900'}`}>المسافات — أصفر</button>
        <button type="button" onClick={() => { setMatches({}); setSelectedCard(null); setFeedback(''); setColored({}) }} className="rounded-xl border-2 border-slate-300 bg-white px-3 py-2 font-bold">إعادة النشاط</button>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {noteTargets.map((n, i) => <div key={n.name} className={`rounded-xl border-2 p-2 text-center font-extrabold ${n.type === 'line' ? (colored.line ? 'border-red-500 bg-red-500 text-white' : 'border-red-300 bg-red-50 text-red-800') : (colored.space ? 'border-yellow-500 bg-yellow-400 text-slate-900' : 'border-yellow-300 bg-yellow-50 text-yellow-900')}`}>
          <div className="text-xs">{n.type === 'line' ? 'خط' : 'مسافة'}</div>{n.name}{matches[i] && <div className="text-xs">✓ صحيح</div>}
        </div>)}
      </div>
      <p className="mt-3 font-extrabold text-violet-800" role="status">{feedback || `الإجابات الصحيحة: ${correctCount} من 5`}</p>
      {correctCount === 5 && <p className="mt-2 rounded-xl bg-emerald-100 p-3 font-extrabold text-emerald-800">رائع! وصلت كل النغمات إلى أماكنها الصحيحة 🌟</p>}
    </div>
  </div>
}