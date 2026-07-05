import { Link } from 'react-router-dom'
import { PublicFooter, PublicNav } from '../components/layout/PublicNav'

const logos = ['Globex', 'Acme Corp', 'TechFlow', 'NovaSales', 'BrightCo', 'DataPeak']

const features = [
  { title: 'Supercharge sales with AI', desc: 'Ollama-powered assistant with voice input on every page.', tag: 'AI Assistant' },
  { title: 'Teams that work together, win together', desc: 'Tenant workspaces for admins and sales reps with role-based access.', tag: 'Multi-tenant' },
  { title: 'Engage on every channel', desc: 'Telegram bot and email alerts when deals move or contacts are added.', tag: 'Integrations' },
  { title: 'Pipeline that scales', desc: 'Drag-and-drop Kanban from New to Won/Lost with automatic notifications.', tag: 'Deals' },
]

const integrations = [
  {
    name: 'Telegram',
    icon: '✈️',
    desc: 'Link a team group chat. The bot replies to messages and sends alerts when deals are won/lost or contacts are added.',
    demo: 'Globex chat ID: -100999888777 · Demo group link in Settings after login.',
  },
  {
    name: 'Email',
    icon: '✉️',
    desc: 'Team inbox receives notifications for new contacts, deal outcomes, and task assignments. Test from Settings → Email.',
    demo: 'Globex team email: team@globex.com · Acme: team@acme.com',
  },
]

const platformTenants = [
  { name: 'Globex Industries', code: 'globex', users: '2 users · 3 contacts · 3 deals' },
  { name: 'Acme Corp', code: 'acme', users: '2 users · 3 contacts · 3 deals' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen deep-bg text-white">
      <PublicNav />

      <section className="landing-hero-bg pt-16 pb-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto text-center relative">
          <span className="stat-pill mb-6">Visionary CRM for modern sales teams</span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight max-w-4xl mx-auto">
            The easiest <span className="text-[#e42527]">AI CRM</span> for growth.
          </h1>
          <p className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Intelligent automation meets intuitive design. Built with AI at its core, NexCRM supercharges your business to get ahead without the overhead.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/signup" className="btn-zoho text-base px-8 py-3">GET STARTED</Link>
            <Link to="/login" className="btn-zoho-outline text-base px-8 py-3">Sign In</Link>
          </div>
          <p className="mt-6 text-sm text-slate-500">Get started with your flexible free trial</p>
        </div>
      </section>

      <section className="py-12 landing-section-deep">
        <p className="text-center text-sm font-semibold text-slate-500 mb-8 uppercase tracking-wider">Trusted by demo tenants worldwide</p>
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-x-12 gap-y-4 px-4">
          {logos.map((name) => (
            <span key={name} className="text-lg font-bold text-slate-600">{name}</span>
          ))}
        </div>
      </section>

      <section id="features" className="py-20 px-4 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white">Everything your business needs</h2>
            <p className="mt-4 text-slate-400">Contacts, pipeline, tasks — with a neat 360° view.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((f) => (
              <div key={f.title} className="zoho-card p-8 hover:shadow-xl transition-shadow text-[#313949]">
                <span className="text-xs font-bold uppercase text-[#e42527]">{f.tag}</span>
                <h3 className="text-xl font-bold mt-3 mb-2">{f.title}</h3>
                <p className="text-[#616e88]">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="ai" className="py-20 px-4 landing-section-deep scroll-mt-20">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold">AI is here to assist.</h2>
            <p className="mt-4 text-slate-400">
              A floating chat bubble stays pinned in the <strong className="text-white">bottom-right corner</strong> on every page — with mic input and voice replies.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-slate-400">
              <li>→ Look for the red chat button bottom-right on this page</li>
              <li>→ Sign in to start asking about contacts, deals & tasks</li>
            </ul>
          </div>
          <div className="relative rounded-xl border border-white/10 bg-[#0a0e1a] overflow-hidden shadow-2xl aspect-[4/3] max-h-[320px]">
            <div className="h-8 bg-[#151b2e] border-b border-white/10 flex items-center px-3 gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              <span className="ml-2 text-[10px] text-slate-500">NexCRM — Dashboard</span>
            </div>
            <div className="p-4 space-y-2 opacity-40">
              <div className="h-3 w-1/3 bg-white/10 rounded" />
              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="h-16 bg-white/5 rounded" />
                <div className="h-16 bg-white/5 rounded" />
                <div className="h-16 bg-white/5 rounded" />
              </div>
            </div>
            <div className="absolute bottom-4 right-4 flex flex-col items-end gap-2 pointer-events-none">
              <div className="w-48 h-28 bg-white rounded-lg shadow-xl border border-[#e4e7ec] p-2 hidden sm:block">
                <div className="h-4 bg-[#e42527] rounded-t-sm -mx-2 -mt-2 mb-2 px-2 flex items-center">
                  <span className="text-[8px] text-white font-bold">Zia — AI</span>
                </div>
                <div className="h-2 w-3/4 bg-[#338cf0] rounded ml-auto mb-1" />
                <div className="h-2 w-full bg-gray-100 rounded" />
              </div>
              <div className="w-12 h-12 rounded-full bg-[#e42527] shadow-lg flex items-center justify-center text-white chat-launcher">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C7.03 3 3 6.58 3 11c0 2.02.93 3.86 2.5 5.24V20l3.9-2.14c1.02.31 2.1.48 3.23.48 4.97 0 9-3.58 9-8.03S16.97 3 12 3z"/></svg>
              </div>
            </div>
            <p className="absolute bottom-1 left-0 right-0 text-center text-[10px] text-slate-500 pb-1">
              ↑ Real bubble is on this page — bottom right
            </p>
          </div>
        </div>
      </section>

      <section id="integrations" className="py-20 px-4 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Connect Telegram & Email</h2>
            <p className="mt-4 text-slate-400">Configure in Settings — stored per tenant in your database.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 mb-10">
            {integrations.map((item) => (
              <div key={item.name} className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{item.name}</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">{item.desc}</p>
                <p className="text-xs text-slate-500 bg-black/20 rounded-lg px-3 py-2 font-mono">{item.demo}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <p className="text-sm text-slate-500 mb-6">Login as tenant admin → Settings → test Email & Telegram</p>
            <Link to="/signup" className="btn-zoho inline-flex px-8 py-3">GET STARTED</Link>
          </div>
        </div>
      </section>

      <section id="platform" className="py-20 px-4 landing-section-deep scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Multi-tenant platform</h2>
            <p className="mt-4 text-slate-400">Each company gets an isolated workspace. Super-admins manage all tenants.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {platformTenants.map((t) => (
              <div key={t.code} className="zoho-card p-6 text-[#313949]">
                <h3 className="font-bold text-lg">{t.name}</h3>
                <p className="text-xs font-mono text-[#e42527] mt-1">company_code: {t.code}</p>
                <p className="text-sm text-[#616e88] mt-2">{t.users}</p>
              </div>
            ))}
          </div>
          <div className="text-center space-y-3">
            <p className="text-sm text-slate-500">Platform admin: admin@nexcrm.com / admin123</p>
            <Link to="/platform-admin" className="btn-zoho-outline inline-flex px-6 py-2">Open Platform Console →</Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 text-center">
        <h2 className="text-3xl font-bold">Take us for a spin!</h2>
        <p className="mt-4 text-slate-400">Demo: sara@globex.com / secret123 / globex</p>
        <Link to="/login" className="btn-zoho mt-6 inline-flex px-8 py-3">Quick Tour → Login</Link>
      </section>

      <PublicFooter />
    </div>
  )
}
