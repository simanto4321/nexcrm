import { Link } from 'react-router-dom'
import { PublicFooter, PublicNav } from './PublicNav'

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <div className="min-h-screen deep-bg text-white">
      <PublicNav />
      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md page-fade">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-lg bg-[#e42527] flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-xl shadow-red-900/50">
              N
            </div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-sm text-slate-400 mt-2">{subtitle}</p>
          </div>
          <div className="zoho-card p-8 text-[#313949]">
            {children}
          </div>
          {footer && <div className="mt-6 text-center text-sm text-slate-400">{footer}</div>}
        </div>
      </div>
      <PublicFooter />
    </div>
  )
}

export function AuthLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} className="text-[#fca5a5] font-semibold hover:text-white transition-colors">{children}</Link>
  )
}
