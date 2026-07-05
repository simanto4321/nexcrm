import { Link } from 'react-router-dom'

export function PublicNav() {
  return (
    <header className="nav-dark">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded bg-[#e42527] flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-red-900/40">N</div>
          <span className="text-xl font-bold text-white">NexCRM</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <a href="/#features" className="hover:text-white transition-colors">Features</a>
          <a href="/#ai" className="hover:text-white transition-colors">AI Assistant</a>
          <a href="/#integrations" className="hover:text-white transition-colors">Integrations</a>
          <Link to="/platform-admin" className="hover:text-white transition-colors">Platform</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-semibold text-slate-300 hover:text-white hidden sm:block">Sign In</Link>
          <Link to="/signup" className="btn-zoho text-sm py-2 px-4">GET STARTED</Link>
        </div>
      </div>
    </header>
  )
}

export function PublicFooter() {
  return (
    <footer className="bg-[#1a1f36] text-slate-300 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid sm:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded bg-[#e42527] flex items-center justify-center text-white font-bold">N</div>
            <span className="font-bold text-white">NexCRM</span>
          </div>
          <p className="text-sm text-slate-400">Multi-tenant CRM — AI, Telegram, email and pipeline.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3 text-sm">Product</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/signup" className="hover:text-white">Sign up</Link></li>
            <li><Link to="/login" className="hover:text-white">Login</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3 text-sm">Integrations</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="/#integrations" className="hover:text-white">Telegram</a></li>
            <li><a href="/#integrations" className="hover:text-white">Email</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3 text-sm">Admin</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/platform-admin" className="hover:text-white">Platform console</Link></li>
          </ul>
        </div>
      </div>
      <p className="text-center text-xs text-slate-500 mt-10">© 2026 NexCRM · CSE Capstone</p>
    </footer>
  )
}
