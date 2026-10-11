import { createFileRoute, Link } from '@tanstack/react-router'
import type { LabTool } from '@/content/curriculum'
import { labToolMeta } from '@/components/ActivityCard'
import { img } from '@/lib/images'
import Piano from '@/components/lab/Piano'
import Xylophone from '@/components/lab/Xylophone'
import DrumPad from '@/components/lab/DrumPad'
import RhythmMaker from '@/components/lab/RhythmMaker'

const TOOLS: LabTool[] = ['piano', 'xylophone', 'drums', 'rhythm']

const intro: Record<LabTool, string> = {
  piano: 'اضغط على المفاتيح أو المسها لتعزف. جرّب "اتبع النغمة المضيئة" لتعزف لحناً كاملاً!',
  xylophone: 'اضرب على القطع الملونة. كل لون له نغمة مختلفة من دو إلى دو.',
  drums: 'اعزف على الآلات الإيقاعية العمانية، وغيّر قوة الصوت لتعزف بقوة أو بلطف.',
  rhythm: 'اضغط على المربعات لتصنع إيقاعك، ثم شغّله وغيّر سرعته.',
}

export const Route = createFileRoute('/lab')({
  validateSearch: (search: Record<string, unknown>): { tool?: LabTool } => ({
    tool: TOOLS.includes(search.tool as LabTool) ? (search.tool as LabTool) : undefined,
  }),
  head: () => ({ meta: [{ title: 'المختبر الموسيقي — نغماتي' }] }),
  component: LabPage,
})

function LabPage() {
  const { tool = 'piano' } = Route.useSearch()
  const meta = labToolMeta[tool]

  return (
    <div>
      <section className="bg-gradient-to-br from-amber-300 via-yellow-200 to-lime-200">
        <div className="max-w-6xl mx-auto px-4 py-8 md:py-10 grid md:grid-cols-[1.4fr_1fr] items-center gap-4">
          <div>
            <h1 className="text-4xl md:text-6xl font-extrabold">🧪 المختبر الموسيقي</h1>
            <p className="text-lg md:text-xl text-ink/75 mt-3">
              مكانك لتجرّب وتعزف وتبتكر! اختر آلة وابدأ العزف باللمس أو بالفأرة أو بلوحة المفاتيح.
            </p>
          </div>
          <img
            src={img('/img/lab.png', 600)}
            alt=""
            width={600}
            height={340}
            className="hidden md:block w-full blend-img"
          />
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 -mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {TOOLS.map((t) => {
            const m = labToolMeta[t]
            const on = t === tool
            return (
              <Link
                key={t}
                to="/lab"
                search={{ tool: t }}
                replace
                className={`rounded-3xl p-4 flex items-center gap-3 font-extrabold text-lg shadow-chunky transition ${on ? `bg-gradient-to-br ${m.color} text-white scale-[1.03]` : 'bg-white hover:-translate-y-0.5'}`}
              >
                <span className="text-4xl">{m.emoji}</span>
                {m.name}
              </Link>
            )
          })}
        </div>

        <section className="mt-8 rounded-[2.5rem] bg-white p-4 md:p-8 shadow-chunky">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">{meta.emoji}</span>
            <h2 className="text-3xl font-extrabold">{meta.name}</h2>
          </div>
          <p className="text-lg text-ink/65 mb-6">{intro[tool]}</p>
          {tool === 'piano' && <div data-no-click-sound><Piano /></div>}
          {tool === 'xylophone' && <div data-no-click-sound><Xylophone /></div>}
          {tool === 'drums' && <div data-no-click-sound><DrumPad /></div>}
          {tool === 'rhythm' && <RhythmMaker />}
        </section>
      </div>
    </div>
  )
}
