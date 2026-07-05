import type { ReactNode } from 'react'

export function GlassCard({
  children,
  className = '',
  hover = false,
}: {
  children: ReactNode
  className?: string
  hover?: boolean
}) {
  return (
    <div
      className={`glass rounded-2xl ${hover ? 'transition-all duration-300 hover:border-white/20 hover:bg-white/[0.06]' : ''} ${className}`}
    >
      {children}
    </div>
  )
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400/80 mb-1">NexCRM</p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">{title}</h1>
        {subtitle && <p className="mt-2 text-slate-400 text-sm max-w-xl">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function PremiumInput({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <label className="block space-y-1.5">
      {label && <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</span>}
      <input className="input-premium" {...props} />
    </label>
  )
}

export function PremiumSelect({
  label,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  return (
    <label className="block space-y-1.5">
      {label && <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</span>}
      <select className="input-premium appearance-none cursor-pointer" {...props}>
        {children}
      </select>
    </label>
  )
}

export function Badge({
  children,
  tone = 'default',
}: {
  children: ReactNode
  tone?: 'default' | 'success' | 'warning' | 'danger' | 'info'
}) {
  const tones = {
    default: 'bg-white/10 text-slate-200 border-white/10',
    success: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
    warning: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
    danger: 'bg-rose-500/15 text-rose-300 border-rose-500/25',
    info: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${tones[tone]}`}>
      {children}
    </span>
  )
}

export function LoadingScreen({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-10 h-10 rounded-full border-2 border-indigo-500/30 border-t-indigo-400 animate-spin" />
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  )
}

export function AlertBanner({ message, tone = 'success' }: { message: string; tone?: 'success' | 'error' }) {
  return (
    <div
      className={`rounded-xl px-4 py-3 text-sm border ${
        tone === 'success'
          ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-200'
          : 'bg-rose-500/10 border-rose-500/25 text-rose-200'
      }`}
    >
      {message}
    </div>
  )
}
