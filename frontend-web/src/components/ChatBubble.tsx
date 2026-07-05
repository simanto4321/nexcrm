import { useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { api, type ChatMessage } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function ChatBubble() {
  const { token } = useAuth()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [tts, setTts] = useState(true)
  const listRef = useRef<HTMLDivElement>(null)

  async function sendMessage(text: string) {
    if (!token) return
    if (!text.trim() || loading) return
    const userMsg: ChatMessage = { role: 'user', content: text.trim() }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput('')
    setLoading(true)
    try {
      const history = messages.map((m) => ({ role: m.role, text: m.content }))
      const { data } = await api.post<{ reply: string }>('/chatbot/message', {
        message: text.trim(),
        conversation_history: history,
      })
      setMessages([...next, { role: 'assistant', content: data.reply }])
      if (tts && 'speechSynthesis' in window) {
        window.speechSynthesis.speak(new SpeechSynthesisUtterance(data.reply))
      }
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
    } catch {
      setMessages([...next, { role: 'assistant', content: 'Assistant unavailable. Is the backend running?' }])
    } finally {
      setLoading(false)
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    sendMessage(input)
  }

  function startVoice() {
    if (!token) return
    type SR = new () => {
      lang: string
      onresult: (ev: { results: { [i: number]: { [i: number]: { transcript: string } } } }) => void
      start: () => void
    }
    const Ctor =
      (window as unknown as { SpeechRecognition?: SR; webkitSpeechRecognition?: SR }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: SR }).webkitSpeechRecognition
    if (!Ctor) {
      alert('Voice not supported')
      return
    }
    const rec = new Ctor()
    rec.lang = 'en-US'
    rec.onresult = (ev) => sendMessage(ev.results[0][0].transcript)
    rec.start()
  }

  const widget = (
    <div className="chat-fab-root flex flex-col items-end gap-3">
      {open && (
        <div
          className="chat-panel-enter w-[min(380px,calc(100vw-2.5rem))] h-[min(460px,calc(100vh-8rem))] bg-white rounded-xl shadow-2xl border border-[#e4e7ec] flex flex-col overflow-hidden"
          style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.08)' }}
        >
          <div className="bg-[#e42527] text-white px-4 py-3 flex items-center justify-between shrink-0">
            <div>
              <p className="font-bold text-sm">Zia — AI Assistant</p>
              <p className="text-[10px] opacity-80">Powered by Ollama</p>
            </div>
            <div className="flex items-center gap-2">
              {token && (
                <label className="text-[10px] flex items-center gap-1 cursor-pointer">
                  <input type="checkbox" checked={tts} onChange={(e) => setTts(e.target.checked)} />
                  Voice
                </label>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-sm"
                aria-label="Close chat"
              >
                ×
              </button>
            </div>
          </div>

          {!token ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-[#f6f7fb]">
              <p className="text-4xl mb-3">💬</p>
              <p className="font-semibold text-[#313949]">Sign in to use AI chat</p>
              <p className="text-sm text-[#616e88] mt-2 mb-6">The assistant floats on every page after you log in.</p>
              <Link to="/login" className="btn-zoho px-6 py-2.5" onClick={() => setOpen(false)}>
                Sign In
              </Link>
            </div>
          ) : (
            <>
              <div ref={listRef} className="flex-1 overflow-y-auto p-3 space-y-2 bg-[#f6f7fb] min-h-0">
                {messages.length === 0 && (
                  <p className="text-sm text-[#616e88] text-center py-8">Ask about contacts, deals, or tasks</p>
                )}
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                      m.role === 'user'
                        ? 'ml-auto bg-[#338cf0] text-white'
                        : 'bg-white border border-[#e4e7ec] text-[#313949]'
                    }`}
                  >
                    {m.content}
                  </div>
                ))}
                {loading && <p className="text-xs text-[#616e88] animate-pulse">Typing...</p>}
              </div>
              <form onSubmit={onSubmit} className="p-3 border-t flex gap-2 bg-white shrink-0">
                <button type="button" onClick={startVoice} className="btn-zoho-secondary px-2 shrink-0" title="Voice input">
                  🎤
                </button>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="zoho-input flex-1 py-2 min-w-0"
                />
                <button type="submit" className="btn-zoho px-3 py-2 shrink-0">
                  Send
                </button>
              </form>
            </>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`chat-launcher w-14 h-14 rounded-full bg-[#e42527] text-white flex items-center justify-center transition-transform duration-200 ${
          open ? 'scale-95' : ''
        }`}
        aria-label={open ? 'Close AI assistant' : 'Open AI assistant'}
        aria-expanded={open}
      >
        {open ? (
          <span className="text-2xl leading-none">×</span>
        ) : (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 3C7.03 3 3 6.58 3 11c0 2.02.93 3.86 2.5 5.24V20l3.9-2.14c1.02.31 2.1.48 3.23.48 4.97 0 9-3.58 9-8.03S16.97 3 12 3z"
              fill="currentColor"
            />
          </svg>
        )}
      </button>
    </div>
  )

  return createPortal(widget, document.body)
}
