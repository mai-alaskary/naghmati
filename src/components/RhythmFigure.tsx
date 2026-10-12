import type { SVGProps } from 'react'

export default function RhythmFigure({ className = '' }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 76" aria-label="الشكل الإيقاعي بثلاث نغمات" role="img" className={className} fill="currentColor">
      <ellipse cx="17" cy="61" rx="12" ry="8" transform="rotate(-25 17 61)" />
      <ellipse cx="47" cy="61" rx="12" ry="8" transform="rotate(-25 47 61)" />
      <ellipse cx="77" cy="61" rx="12" ry="8" transform="rotate(-25 77 61)" />
      <path d="M27 59 V13 H33 V57 Z" />
      <path d="M57 59 V13 H63 V57 Z" />
      <path d="M87 59 V13 H93 V57 Z" />
      <path d="M30 12 H93 V19 H30 Z" />
      <path d="M30 23 H63 V30 H30 Z" />
    </svg>
  )
}
