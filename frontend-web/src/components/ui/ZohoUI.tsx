import type { ReactNode } from 'react'

export function PageTitle({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function ZohoCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`zoho-card ${className}`}>{children}</div>
}

export function ZohoInput({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <label className="block">
      {label && <span className="block text-xs font-semibold text-[#616e88] mb-1.5">{label}</span>}
      <input className="zoho-input" {...props} />
    </label>
  )
}

export function ZohoSelect({
  label,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  return (
    <label className="block">
      {label && <span className="block text-xs font-semibold text-[#616e88] mb-1.5">{label}</span>}
      <select className="zoho-input" {...props}>{children}</select>
    </label>
  )
}

export function Badge({
  children,
  tone = 'gray',
}: {
  children: ReactNode
  tone?: 'gray' | 'green' | 'blue' | 'red' | 'amber'
}) {
  const tones = {
    gray: 'bg-gray-100 text-gray-700',
    green: 'bg-green-100 text-green-700',
    blue: 'bg-blue-100 text-blue-700',
    red: 'bg-red-100 text-red-700',
    amber: 'bg-amber-100 text-amber-700',
  }
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${tones[tone]}`}>{children}</span>
  )
}

export function LoadingBlock({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center py-16 text-[#616e88] text-sm gap-3">
      <div className="w-5 h-5 border-2 border-[#e42527] border-t-transparent rounded-full animate-spin" />
      {label}
    </div>
  )
}

export function Alert({ message, tone = 'success' }: { message: string; tone?: 'success' | 'error' }) {
  return (
    <div className={`rounded-md px-4 py-3 text-sm mb-4 border ${
      tone === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
    }`}>
      {message}
    </div>
  )
}
