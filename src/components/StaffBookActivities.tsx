import { useRef, useState } from 'react'

const staffLines = [72, 92, 112, 132, 152]
const tracingPath = 'M 170 152 C 142 142 143 112 165 91 C 186 72 215 83 216 109 C 218 135 191 158 166 151 C 143 144 145 119 163 104 C 181 91 198 105 193 122 C 189 137 175 145 163 137 C 154 130 160 117 170 117 C 181 117 183 132 175 143 C 165 157 158 172 163 187 C 167 201 184 203 194 194 C 207 181 204 163 192 151'
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
    if ((e.target as Element).closest('[data-trace]')) return
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
      <p className="my-2 text-sm leading-7">اتبع المسار المنقّط من نقطة البداية إلى النهاية، ثم ارسم مفتاح صول في المدرجات الفارغة. يمكنك الرسم باللمس أو بالفأرة.</p>
      <div className="overflow-hidden rounded-xl border-2 border-violet-100 bg-white">
        <svg viewBox="0 0 320 220" className="h-auto w-full touch-none" role="img" aria-label="مدرج موسيقي ونموذج منقط لمفتاح صول">
          {staffLines.map(y => <line key={y} x1="18" x2="302" y1={y} y2={y} stroke="#334155" strokeWidth="1.6" />)}
          <path d={tracingPath} transform="translate(-35,-30) scale(.92)" fill="none" stroke="#8b5cf6" strokeWidth="3" strokeDasharray="2 6" strokeLinecap="round" data-trace="true" />
          <circle cx="121" cy="110" r="5" fill="#16a34a" /><text x="130" y="105" fontSize="9" fill="#15803d" fontWeight="bold">ابدأ</text>
          <circle cx="142" cy="109" r="5" fill="#f97316" /><text x="151" y="104" fontSize="9" fill="#c2410c" fontWeight="bold">اتبع النقاط ↗</text>
          <text x="24" y="28" fontSize="10" fill="#64748b">نموذج للتتبّع</text>
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
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {[0, 1].map(i => <div key={i}>
          <p className="mb-1 text-sm font-bold text-slate-600">مدرج تدريب {i + 1}</p>
          <svg viewBox="0 0 300 95" className="w-full rounded-lg border border-slate-200 bg-white">
            {[22, 34, 46, 58, 70].map(y => <line key={y} x1="8" x2="292" y1={y} y2={y} stroke="#64748b" strokeWidth="1.3" />)}
            <text x="150" y="53" textAnchor="middle" fontSize="9" fill="#cbd5e1">ارسم مفتاح صول على هذا المدرج</text>
          </svg>
        </div>)}
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