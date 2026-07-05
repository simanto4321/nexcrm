import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { GlassCard } from './PremiumUI'

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Hero panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/30 via-violet-900/40 to-cyan-900/20" />
        <div className="absolute top-20 -left-20 w-72 h-72 rounded-full bg-indigo-500/30 blur-3xl animate-float" />
        <div className="absolute bottom-20 right-0 w-96 h-96 rounded-full bg-cyan-500/20 blur-3xl animate-float" style={{ animationDelay: '2s' }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-lg font-bold shadow-lg shadow-indigo-500/40">
              N
            </div>
            <span className="text-xl font-bold tracking-tight">NexCRM</span>
          </div>
        </div>

        <div className="relative z-10 space-y-6 max-w-md">
          <h2 className="text-4xl xl:text-5xl font-extrabold leading-tight">
            Close deals faster with{' '}
            <span className="gradient-text">intelligent CRM</span>
          </h2>
          <p className="text-lg text-slate-300/90 leading-relaxed">
            Multi-tenant pipeline, AI support chat, Telegram & email — built for modern sales teams.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            {['AI Chatbot', 'Kanban Pipeline', 'Telegram Bot', 'Email Alerts'].map((f) => (
              <span key={f} className="glass px-3 py-1.5 rounded-full text-xs font-medium text-slate-200">
                {f}
              </span>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-slate-500">© NexCRM Capstone · CSE Project</p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md page-enter">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center font-bold">
              N
            </div>
            <span className="text-lg font-bold">NexCRM</span>
          </div>

          <GlassCard className="p-8 sm:p-10">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-white">{title}</h1>
              <p className="mt-2 text-sm text-slate-400">{subtitle}</p>
            </div>
            {children}
            {footer && <div className="mt-6 pt-6 border-t border-white/10">{footer}</div>}
          </GlassCard>
        </div>
      </div>
    </div>
  )
}

export function AuthFooterLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <p className="text-center text-sm text-slate-400">
      <Link to={to} className="text-indigo-300 hover:text-cyan-300 font-medium transition-colors">
        {children}
      </Link>
    </p>
  )
}
