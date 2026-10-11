import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { playClick } from '@/lib/audio'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'

import '../styles.css'

const siteName = 'نغماتي — منصة المهارات الموسيقية'
const siteDescription =
  'منصة تعليمية تفاعلية لمادة المهارات الموسيقية وفق منهج سلطنة عمان للصفين الأول والرابع: دروس، أسئلة تفاعلية، ومختبر موسيقي — بدون تسجيل دخول.'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: siteName },
      { name: 'description', content: siteDescription },
      { name: 'theme-color', content: '#fff8ec' },
      { property: 'og:title', content: siteName },
      { property: 'og:description', content: siteDescription },
      { property: 'og:type', content: 'website' },
      { property: 'og:image', content: '/img/mascot.png' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
    links: [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Baloo+Bhaijaan+2:wght@400;500;600;700;800&display=swap',
      },
    ],
  }),
  shellComponent: RootDocument,
  notFoundComponent: NotFound,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return
      if (target.closest('[data-no-click-sound]')) return
      if (target.closest('button, a, input, select, textarea, [role="button"], summary, label')) playClick()
    }
    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [])
  return (
    <html lang="ar" dir="rtl">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <Scripts />
      </body>
    </html>
  )
}

function NotFound() {
  return (
    <div className="max-w-xl mx-auto text-center py-24 px-6">
      <div className="text-7xl mb-4">🎻❓</div>
      <h1 className="text-3xl font-extrabold mb-2">أوه! هذه النغمة ضائعة</h1>
      <p className="text-lg text-ink/70 mb-8">لم نجد الصفحة التي تبحث عنها.</p>
      <a href="/" className="inline-block rounded-full bg-violet-500 text-white font-bold px-8 py-3 shadow-chunky">
        العودة إلى الرئيسية 🏠
      </a>
    </div>
  )
}
