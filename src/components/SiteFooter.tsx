import { Link } from '@tanstack/react-router'

export default function SiteFooter() {
  return (
    <footer className="mt-20 border-t-2 border-ink/5 bg-white/60">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-ink/70">
        <p className="font-semibold text-center md:text-start">
          🎶 نغماتي — منصة مفتوحة لطلاب المهارات الموسيقية في سلطنة عُمان، بدون تسجيل دخول - إعداد أ/مي العسكري.
        </p>
        <Link to="/teacher" className="rounded-full bg-ink text-white px-5 py-2 font-bold hover:bg-ink/85 transition">
          📘 دليل المنصة
        </Link>
      </div>
    </footer>
  )
}
