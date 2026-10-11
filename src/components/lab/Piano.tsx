import { useCallback, useEffect, useRef, useState } from 'react'
import { startPianoNote } from '@/lib/audio'

const SOLFEGE = ['دو', '', 'ري', '', 'مي', 'فا', '', 'صول', '', 'لا', '', 'سي']
const WHITE_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#a855f7']
const START = 60 // دو الوسطى
const END = 84

// مفاتيح الحاسوب (حسب موقع الزر، يعمل مع لوحة المفاتيح العربية أيضاً)
const KEYMAP: Record<string, number> = {
  KeyA: 60, KeyW: 61, KeyS: 62, KeyE: 63, KeyD: 64, KeyF: 65, KeyT: 66, KeyG: 67,
  KeyY: 68, KeyH: 69, KeyU: 70, KeyJ: 71, KeyK: 72, KeyO: 73, KeyL: 74, KeyP: 75, Semicolon: 76,
}

const SONGS = [
  { name: 'سلم دو صعوداً', notes: [60, 62, 64, 65, 67, 69, 71, 72] },
  { name: 'سلم دو هبوطاً', notes: [72, 71, 69, 67, 65, 64, 62, 60] },
  { name: 'تلألأ يا نجم', notes: [60, 60, 67, 67, 69, 69, 67, 65, 65, 64, 64, 62, 62, 60] },
  { name: 'نغمات دو', notes: [60, 72, 84] },
  { name: 'السلام السلطاني (المقطع الأول)', notes: [
    // فا فا فا فا صول لا فا صول، ثم ثماني نغمات دو في الطبقة الأقل (قبل فا على اللوحة).
    65, 65, 65, 65, 67, 69, 65, 67,
    60, 60, 60, 60, 60, 60, 60, 60,
    // صول صول صول صول لا، ثم المفتاح الأسود بين لا وسي (سي بيمول)، صول لا، ثم خمس فا.
    67, 67, 67, 67, 69, 70, 67, 69, 65, 65, 65, 65, 65,
    // دو دو دو، ثم خمس نغمات صول.
    60, 60, 60, 67, 67, 67, 67, 67,
    // دو دو دو، ثم خمس نغمات لا.
    60, 60, 60, 69, 69, 69, 69, 69,
    // دو دو دو صول لا، المفتاح الأسود، لا صول فا، ثم فا فا فا.
    60, 60, 60, 67, 69, 70, 69, 67, 65, 65, 65, 65,
  ] },
]

const isBlack = (m: number) => [1, 3, 6, 8, 10].includes(m % 12)

export default function Piano() {
  const [active, setActive] = useState<Set<number>>(new Set())
  const [showNames, setShowNames] = useState(true)
  const [rainbow, setRainbow] = useState(true)
  const [song, setSong] = useState<number | null>(null)
  const [pos, setPos] = useState(0)
  const [cheer, setCheer] = useState(false)
  const stops = useRef(new Map<number, () => void>())

  const target = song !== null ? SONGS[song].notes[pos] : null

  const press = useCallback(
    (m: number) => {
      if (stops.current.has(m)) return
      stops.current.set(m, startPianoNote(m))
      setActive((s) => new Set(s).add(m))
      if (song !== null && m === SONGS[song].notes[pos]) {
        if (pos + 1 >= SONGS[song].notes.length) {
          setCheer(true)
          setTimeout(() => setCheer(false), 2200)
          setPos(0)
        } else setPos(pos + 1)
      }
    },
    [song, pos],
  )

  const release = useCallback((m: number) => {
    stops.current.get(m)?.()
    stops.current.delete(m)
    setActive((s) => {
      const n = new Set(s)
      n.delete(m)
      return n
    })
  }, [])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const m = KEYMAP[e.code]
      if (m && !e.repeat) press(m)
    }
    const up = (e: KeyboardEvent) => {
      const m = KEYMAP[e.code]
      if (m) release(m)
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [press, release])

  useEffect(() => () => stops.current.forEach((s) => s()), [])

  const whites: number[] = []
  for (let m = START; m <= END; m++) if (!isBlack(m)) whites.push(m)
  const whiteW = 100 / whites.length

  const handlers = (m: number) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault()
      ;(e.target as HTMLElement).releasePointerCapture?.(e.pointerId)
      press(m)
    },
    onPointerUp: () => release(m),
    onPointerLeave: () => release(m),
    onPointerCancel: () => release(m),
    onPointerEnter: (e: React.PointerEvent) => {
      if (e.buttons === 1) press(m)
    },
  })

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        <Toggle on={showNames} set={setShowNames} label="أسماء النغمات" emoji="🔤" />
        <Toggle on={rainbow} set={setRainbow} label="ألوان قوس قزح" emoji="🌈" />
      </div>

      <div className="rounded-3xl bg-violet-50 p-4 mb-4">
        <p className="font-extrabold mb-2">🎯 اتبع النغمة المضيئة:</p>
        <div className="flex flex-wrap gap-2">
          {SONGS.map((s, i) => (
            <button
              key={s.name}
              onClick={() => {
                setSong(song === i ? null : i)
                setPos(0)
              }}
              className={`rounded-full px-4 py-2 font-bold transition ${song === i ? 'bg-violet-500 text-white' : 'bg-white hover:bg-violet-100'}`}
            >
              {s.name}
            </button>
          ))}
        </div>
        {song !== null && (
          <div className="mt-3 flex flex-wrap gap-1.5" dir="ltr">
            {SONGS[song].notes.map((n, i) => (
              <span
                key={i}
                className={`rounded-xl px-2.5 py-1 font-bold text-sm ${i < pos ? 'bg-emerald-300' : i === pos ? 'bg-amber-300 animate-pulse' : 'bg-white'}`}
              >
                {n % 12 === 10 ? 'سي' : SOLFEGE[n % 12]}
              </span>
            ))}
          </div>
        )}
        {cheer && <p className="mt-3 text-2xl font-extrabold text-emerald-600 animate-bounce-in">أحسنت! عزفت اللحن كاملاً 🎉</p>}
      </div>

      <div className="overflow-x-auto pb-2 -mx-2 px-2">
        <div
          dir="ltr"
          className="relative h-56 md:h-64 min-w-[680px] select-none touch-none rounded-b-3xl bg-ink p-2 pt-4 shadow-chunky"
        >
          <div className="relative w-full h-full">
            {whites.map((m, i) => {
              const on = active.has(m)
              const color = WHITE_COLORS[i % 7]
              return (
                <button
                  key={m}
                  aria-label={SOLFEGE[m % 12]}
                  {...handlers(m)}
                  className="absolute top-0 h-full rounded-b-2xl border-2 border-ink/20 flex flex-col justify-end items-center pb-3 transition-transform"
                  style={{
                    left: `${i * whiteW}%`,
                    width: `calc(${whiteW}% - 3px)`,
                    background: on ? color : rainbow ? `linear-gradient(to bottom, #fff 60%, ${color}55)` : '#fff',
                    transform: on ? 'translateY(3px)' : undefined,
                    boxShadow: target === m ? `0 0 0 4px #fbbf24, 0 0 24px #fbbf24` : undefined,
                  }}
                >
                  {showNames && (
                    <span className={`pointer-events-none font-extrabold text-base ${on ? 'text-white' : 'text-ink'}`}>{target === 70 && m === 70 ? 'سي' : SOLFEGE[m % 12]}</span>
                  )}
                  {target === m && <span className="pointer-events-none absolute top-2 text-xl animate-bounce">⬇️</span>}
                </button>
              )
            })}
            {Array.from({ length: END - START + 1 }, (_, k) => START + k)
              .filter(isBlack)
              .map((m) => {
                const leftWhite = whites.indexOf(m - 1)
                const on = active.has(m)
                return (
                  <button
                    key={m}
                    aria-label="مفتاح أسود"
                    {...handlers(m)}
                    className="absolute top-0 h-[60%] rounded-b-xl z-10 transition-transform"
                    style={{
                      left: `${(leftWhite + 1) * whiteW - whiteW * 0.32}%`,
                      width: `${whiteW * 0.62}%`,
                      background: on ? '#a855f7' : 'linear-gradient(to bottom, #1f1b3a, #3b335f)',
                      transform: on ? 'translateY(2px)' : undefined,
                      boxShadow: target === m || (target === 71 && m === 70) ? '0 0 0 3px #fbbf24' : '0 4px 0 #000a',
                    }}
                  >
                    {target === 71 && m === 70 && <span className="pointer-events-none absolute top-2 left-1/2 -translate-x-1/2 text-lg">⬇️</span>}
                  </button>
                )
              })}
          </div>
        </div>
      </div>
      <p className="text-sm text-ink/55 mt-3 hidden md:block">
        ⌨️ يمكنك العزف بلوحة المفاتيح أيضاً: الأزرار A S D F G H J K للمفاتيح البيضاء، و W E T Y U للسوداء.
      </p>
    </div>
  )
}

export function Toggle({
  on,
  set,
  label,
  emoji,
}: {
  on: boolean
  set: (v: boolean) => void
  label: string
  emoji: string
}) {
  return (
    <button
      onClick={() => set(!on)}
      className={`rounded-full px-4 py-2 font-bold border-2 transition ${on ? 'bg-ink text-white border-ink' : 'bg-white border-ink/15'}`}
      aria-pressed={on}
    >
      {emoji} {label}
    </button>
  )
}
