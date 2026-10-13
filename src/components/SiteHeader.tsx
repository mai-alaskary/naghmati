import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

const links = [
  { to: '/', label: 'الرئيسية', emoji: '🏠' },
  { to: '/grade/$gradeId', params: { gradeId: 'grade-1' }, label: 'الصف الأول', emoji: '🥁' },
  { to: '/grade/$gradeId', params: { gradeId: 'grade-4' }, label: 'الصف الرابع', emoji: '🎼' },
  { to: '/lab', label: 'المختبر الموسيقي', emoji: '🎹' },
] as const

export default function SiteHeader() {
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-40 bg-cream/85 backdrop-blur border-b-2 border-ink/5">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0" onClick={() => setOpen(false)}>
          <span className="grid place-items-center w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 text-white text-2xl shadow-chunky rotate-[-6deg]">
            ♫
          </span>
          <span className="leading-none">
            <span className="block text-2xl font-extrabold text-ink">نغماتي</span>
            <span className="block text-xs font-semibold text-ink/60">المهارات الموسيقية - إعداد أ/مي العسكري</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map(({ label, emoji, ...l }) => (
            <Link
              key={label}
              {...(l as any)}
              activeOptions={{ exact: true }}
              className="px-4 py-2 rounded-full font-bold text-ink/75 hover:bg-white hover:text-ink transition"
              activeProps={{ className: 'bg-white text-ink shadow-sm' }}
            >
              <span className="me-1">{emoji}</span>
              {label}
            </Link>
          ))}
        </nav>

        <button
          className="md:hidden w-11 h-11 grid place-items-center rounded-2xl bg-white shadow-chunky"
          aria-label={open ? 'إغلاق القائمة' : 'فتح القائمة'}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <nav className="md:hidden px-4 pb-4 grid grid-cols-2 gap-3 animate-bounce-in">
          {links.map(({ label, emoji, ...l }) => (
            <Link
              key={label}
              {...(l as any)}
              onClick={() => setOpen(false)}
              className="flex flex-col items-center gap-1 rounded-3xl bg-white p-4 font-bold shadow-chunky"
            >
              <span className="text-3xl">{emoji}</span>
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}
