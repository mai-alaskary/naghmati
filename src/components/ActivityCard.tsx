import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ExternalLink } from 'lucide-react'
import type { Activity, LabTool } from '@/content/curriculum'
import { toEmbedUrl, providerName } from '@/lib/embed'

export const labToolMeta: Record<LabTool, { name: string; emoji: string; color: string }> = {
  piano: { name: 'البيانو', emoji: '🎹', color: 'from-violet-400 to-fuchsia-400' },
  xylophone: { name: 'الإكسيليفون', emoji: '🌈', color: 'from-pink-400 to-orange-300' },
  drums: { name: 'الطبول العمانية', emoji: '🪘', color: 'from-amber-400 to-orange-400' },
  rhythm: { name: 'صانع الإيقاع', emoji: '🥁', color: 'from-sky-400 to-emerald-400' },
}

const providerStyle: Record<string, { emoji: string; color: string }> = {
  musiclab: { emoji: '🧪', color: 'from-sky-400 to-indigo-400' },
  wordwall: { emoji: '🎯', color: 'from-pink-400 to-rose-400' },
  genially: { emoji: '✨', color: 'from-violet-400 to-purple-500' },
  embed: { emoji: '🧩', color: 'from-emerald-400 to-teal-400' },
}

/** هل يظهر النشاط للطلاب؟ (الأنشطة الخارجية بدون رابط تُخفى) */
export function isActivityReady(a: Activity) {
  return a.type === 'lab' || toEmbedUrl(a.url) !== ''
}

export default function ActivityCard({ activity, onStart }: { activity: Activity; onStart?: () => void }) {
  const [open, setOpen] = useState(false)

  if (activity.type === 'lab') {
    const m = labToolMeta[activity.tool]
    return (
      <div className="rounded-[2rem] bg-white p-5 shadow-chunky flex flex-col sm:flex-row gap-4 items-center">
        <span className={`grid place-items-center w-20 h-20 shrink-0 rounded-3xl bg-gradient-to-br ${m.color} text-5xl`}>
          {m.emoji}
        </span>
        <div className="flex-1 text-center sm:text-start">
          <span className="text-sm font-bold text-ink/50">المختبر الموسيقي · {m.name}</span>
          <h4 className="text-xl font-extrabold">{activity.title}</h4>
          <p className="text-ink/65">{activity.description}</p>
        </div>
        <Link
          to="/lab"
          search={{ tool: activity.tool }}
          className="rounded-full bg-amber-400 hover:bg-amber-500 px-6 py-3 font-extrabold shadow-chunky shrink-0"
        >
          افتح الأداة 🎵
        </Link>
      </div>
    )
  }

  const url = toEmbedUrl(activity.url)
  const style = providerStyle[activity.type]
  return (
    <div className="rounded-[2rem] bg-white p-5 shadow-chunky">
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <span className={`grid place-items-center w-20 h-20 shrink-0 rounded-3xl bg-gradient-to-br ${style.color} text-5xl`}>
          {style.emoji}
        </span>
        <div className="flex-1 text-center sm:text-start">
          <span className="text-sm font-bold text-ink/50">{providerName(url)}</span>
          <h4 className="text-xl font-extrabold">{activity.title}</h4>
          <p className="text-ink/65">{activity.description}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => { setOpen((o) => !o); onStart?.() }}
            className="rounded-full bg-violet-500 hover:bg-violet-600 text-white px-6 py-3 font-extrabold shadow-chunky"
          >
            {open ? 'إغلاق ✖' : 'ابدأ النشاط ▶'}
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="grid place-items-center w-12 h-12 rounded-full bg-ink/5 hover:bg-ink/10"
            aria-label="افتح في نافذة جديدة"
            title="افتح في نافذة جديدة"
          >
            <ExternalLink size={20} />
          </a>
        </div>
      </div>
      {open && (
        <div className="mt-5 animate-bounce-in">
          {url.includes('share.google/') ? (
            <div className="rounded-3xl bg-violet-50 border-2 border-violet-100 p-6 text-center">
              <p className="text-lg font-bold mb-3">النشاط بيفتح على موقع Wordwall الخارجي.</p>
              <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-violet-500 hover:bg-violet-600 text-white px-6 py-3 font-extrabold shadow-chunky">
                افتح نشاط Wordwall <ExternalLink size={18} />
              </a>
            </div>
          ) : (
            <>
              <div className="relative w-full aspect-[4/3] md:aspect-video rounded-3xl overflow-hidden bg-ink/5 border-2 border-ink/10">
                <iframe
                  src={url}
                  title={activity.title}
                  className="absolute inset-0 w-full h-full"
                  allow="autoplay; microphone; fullscreen; midi"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
              <p className="text-sm text-ink/55 text-center mt-2">
                إذا لم يظهر النشاط، اضغط زر <ExternalLink size={14} className="inline" /> لفتحه في نافذة جديدة.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
