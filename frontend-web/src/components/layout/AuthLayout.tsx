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
            <div className="brand-mark w-14 h-14 rounded-xl text-2xl mx-auto mb-4">
              N
            </div>
            <h1 className="font-display text-3xl text-white">{title}</h1>
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
