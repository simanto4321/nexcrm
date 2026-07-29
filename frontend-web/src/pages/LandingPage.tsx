import { Link } from 'react-router-dom'
import { PublicFooter, PublicNav } from '../components/layout/PublicNav'

const logos = ['Globex', 'Acme Corp', 'TechFlow', 'NovaSales', 'BrightCo', 'DataPeak']

const features = [
  {
    emoji: '💬',
    title: 'Supercharge sales with AI',
    desc: 'Floating assistant with voice — ask about contacts, deals, and tasks instantly.',
    tag: 'AI Assistant',
  },
  {
    emoji: '🧑‍🤝‍🧑',
    title: 'Teams that win together',
    desc: 'Invite sales reps, manage roles, and keep every company workspace private.',
    tag: 'Multi-tenant',
  },
  {
    emoji: '✈️',
    title: 'Engage on every channel',
    desc: 'Telegram and email alerts when deals move or contacts are added.',
    tag: 'Integrations',
  },
  {
    emoji: '💼',
    title: 'Pipeline that scales',
    desc: 'Kanban from New to Won with smart in-app notifications.',
    tag: 'Deals',
  },
]

const integrations = [
  {
    name: '✈️ Telegram',
    desc: 'Link a team group chat. Get instant alerts when deals are won or lost and when new contacts arrive.',
    tip: 'Connect from Setup after sign in — paste your group chat ID and run a quick checkup.',
  },
  {
    name: '✉️ Email',
    desc: 'Your team inbox receives alerts for new contacts, deal outcomes, and task assignments.',
    tip: 'Set the team email in Setup and run an email checkup anytime.',
  },
]

const platformTenants = [
  { name: 'Globex Industries', code: 'globex', users: 'Sales workspace with contacts, deals & tasks' },
  { name: 'Acme Corp', code: 'acme', users: 'Sales workspace with contacts, deals & tasks' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen deep-bg text-white">
      <PublicNav />

      <section className="landing-hero-bg pt-20 pb-28 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <p className="font-display text-4xl sm:text-6xl lg:text-7xl text-white tracking-tight hero-reveal">
            NexCRM
          </p>
          <span className="stat-pill mt-6 mb-6 hero-reveal hero-reveal-delay-1">Premium multi-tenant CRM</span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight max-w-3xl mx-auto hero-reveal hero-reveal-delay-1">
            The easiest <span className="text-[#ff6b6d]">AI CRM</span> for growth.
          </h1>
          <p className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed hero-reveal hero-reveal-delay-2">
            Pipeline, contacts, team alerts, and an AI assistant — designed for sales teams that need clarity, not clutter.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4 hero-reveal hero-reveal-delay-3">
            <Link to="/signup" className="btn-zoho text-base px-8 py-3.5">🚀 Get started free</Link>
            <Link to="/login" className="btn-zoho-outline text-base px-8 py-3.5">🔑 Sign in</Link>
            <Link to="/platform-admin" className="btn-zoho-outline text-base px-8 py-3.5">🛡️ Admin console</Link>
          </div>
        </div>
      </section>

      <section className="py-12 landing-section-deep">
        <p className="text-center text-sm font-semibold text-slate-500 mb-8 uppercase tracking-wider">Trusted by growing teams</p>
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-x-12 gap-y-4 px-4">
          {logos.map((name) => (
            <span key={name} className="text-lg font-bold text-slate-600 tracking-wide">{name}</span>
          ))}
        </div>
      </section>

      <section id="features" className="py-24 px-4 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display text-4xl sm:text-5xl text-white">✨ Everything your business needs</h2>
            <p className="mt-4 text-slate-400">Contacts, pipeline, tasks, team, and alerts — one workspace.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((f) => (
              <div key={f.title} className="feature-tile text-[#313949]">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#e42527]">{f.tag}</span>
                  <span className="text-2xl" aria-hidden>{f.emoji}</span>
                </div>
                <h3 className="text-xl font-bold mt-3 mb-2">{f.emoji} {f.title}</h3>
                <p className="text-[#616e88] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="ai" className="py-24 px-4 landing-section-deep scroll-mt-20">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-display text-4xl sm:text-5xl">💬 AI is here to assist.</h2>
            <p className="mt-4 text-slate-400 leading-relaxed">
              A floating chat stays ready in the corner — with voice input and spoken replies.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-400">
              <li className="flex gap-2"><span className="text-[#e42527]">→</span> Tap the red chat button anytime</li>
              <li className="flex gap-2"><span className="text-[#e42527]">→</span> Sign in to ask about contacts, deals &amp; tasks</li>
            </ul>
          </div>
          <div className="glass-card relative overflow-hidden aspect-[4/3] max-h-[340px]">
            <div className="h-9 bg-black/30 border-b border-white/10 flex items-center px-3 gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              <span className="ml-2 text-[10px] text-slate-500">NexCRM — Dashboard</span>
            </div>
            <div className="p-4 space-y-2 opacity-40">
              <div className="h-3 w-1/3 bg-white/10 rounded" />
              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="h-16 bg-white/5 rounded-lg" />
                <div className="h-16 bg-white/5 rounded-lg" />
                <div className="h-16 bg-white/5 rounded-lg" />
              </div>
            </div>
            <div className="absolute bottom-4 right-4 flex flex-col items-end gap-2 pointer-events-none">
              <div className="w-48 h-28 bg-white rounded-xl shadow-xl border border-[#e4e7ec] p-2 hidden sm:block">
                <div className="h-4 bg-[#e42527] rounded-t-sm -mx-2 -mt-2 mb-2 px-2 flex items-center">
                  <span className="text-[8px] text-white font-bold">💬 NexCRM AI</span>
                </div>
                <div className="h-2 w-3/4 bg-[#3b9eff] rounded ml-auto mb-1" />
                <div className="h-2 w-full bg-gray-100 rounded" />
              </div>
              <div className="w-12 h-12 rounded-full bg-[#e42527] shadow-lg flex items-center justify-center text-white chat-launcher text-xl">
                💬
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="integrations" className="py-24 px-4 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl sm:text-5xl">✈️ Connect Telegram &amp; Email</h2>
            <p className="mt-4 text-slate-400">Configure channels in Setup — then run a quick checkup.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 mb-10">
            {integrations.map((item) => (
              <div key={item.name} className="glass-card p-8">
                <h3 className="text-xl font-bold text-white mb-2">{item.name}</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">{item.desc}</p>
                <p className="text-xs text-slate-400 bg-black/25 rounded-lg px-3 py-2">{item.tip}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link to="/signup" className="btn-zoho inline-flex px-8 py-3">🚀 Get started</Link>
          </div>
        </div>
      </section>

      <section id="platform" className="py-24 px-4 landing-section-deep scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl sm:text-5xl">🛡️ Multi-tenant platform</h2>
            <p className="mt-4 text-slate-400">Each company gets an isolated workspace. Administrators oversee every tenant.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {platformTenants.map((t) => (
              <div key={t.code} className="feature-tile text-[#313949]">
                <h3 className="font-bold text-lg">🏢 {t.name}</h3>
                <p className="text-sm text-[#e42527] mt-1 font-semibold">Company code · {t.code}</p>
                <p className="text-sm text-[#616e88] mt-2">{t.users}</p>
              </div>
            ))}
          </div>
          <div className="text-center space-y-3">
            <Link to="/platform-admin" className="btn-zoho-outline inline-flex px-6 py-2">🛡️ Open Platform Console</Link>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 text-center">
        <h2 className="font-display text-4xl sm:text-5xl">Take us for a spin</h2>
        <p className="mt-4 text-slate-400">Try Globex: sara@globex.com · secret123 · company code globex</p>
        <Link to="/login" className="btn-zoho mt-8 inline-flex px-8 py-3.5">🔑 Sign in</Link>
      </section>

      <PublicFooter />
    </div>
  )
}
