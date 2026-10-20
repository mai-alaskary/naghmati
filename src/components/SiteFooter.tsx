import { Link } from '@tanstack/react-router'

const WHATSAPP_URL = 'https://wa.me/96898778983?text=' + encodeURIComponent('مرحبًا، أريد التواصل معكِ بخصوص منصة نغماتي.')

export default function SiteFooter() {
  return (
    <footer className="mt-20 border-t-2 border-ink/5 bg-white/60">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-ink/70">
        <p className="font-semibold text-center md:text-start">
          🎶 نغماتي — منصة مفتوحة لطلاب المهارات الموسيقية في سلطنة عُمان، بدون تسجيل دخول - إعداد أ/مي العسكري.
          {' '}
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="التواصل عبر واتساب بخصوص منصة نغماتي"
            title="تواصل معنا عبر واتساب"
            className="inline-flex align-middle items-center justify-center rounded-full bg-green-600 p-2 text-white transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
              <path d="M12.04 2a9.85 9.85 0 0 0-8.49 14.85L2.2 22l5.28-1.38A9.9 9.9 0 1 0 12.04 2Zm0 17.98a8.1 8.1 0 0 1-4.13-1.13l-.3-.18-3.13.82.84-3.05-.2-.31a8.08 8.08 0 1 1 6.92 3.85Zm4.44-6.06c-.24-.12-1.43-.7-1.65-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.02-.37.1-.49.11-.1.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.46-.4-.4-.54-.41h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.69 2.58 4.1 3.62.57.25 1.02.4 1.37.51.58.18 1.1.16 1.52.1.46-.07 1.43-.58 1.63-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28Z" />
            </svg>
          </a>
        </p>
        <Link to="/teacher" className="rounded-full bg-ink text-white px-5 py-2 font-bold hover:bg-ink/85 transition">
          📘 دليل المنصة
        </Link>
      </div>
    </footer>
  )
}
