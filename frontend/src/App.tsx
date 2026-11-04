import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Building2 } from 'lucide-react'
import { MessageBubble } from './components/MessageBubble'
import { TypingIndicator } from './components/TypingIndicator'
import { Disclaimer } from './components/Disclaimer'
import { SuggestionChip, SUGGESTIONS } from './components/SuggestionChip'
import { handleMessage, type Message } from './lib/messageHandler'

const WELCOME: Message = {
  id: 'welcome',
  role: 'assistant',
  content:
    'Olá! Sou o seu **Assistente Financeiro** 🏦\n\n' +
    'Posso responder perguntas sobre suas contas, cartão de crédito, gastos e transações.\n\n' +
    'Use as sugestões abaixo ou escreva sua pergunta. Diga **"ajuda"** para ver tudo que sei responder.\n\n' +
    '> ⚠️ *Todos os dados são fictícios e usados apenas para demonstração.*',
  timestamp: new Date(),
  source: 'Sistema',
}

let nextId = 1

export default function App() {
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const submit = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const userMsg: Message = {
      id: String(nextId++),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const { content, source } = await handleMessage(trimmed)
      const botMsg: Message = {
        id: String(nextId++),
        role: 'assistant',
        content,
        timestamp: new Date(),
        source,
      }
      setMessages(prev => [...prev, botMsg])
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: String(nextId++),
          role: 'assistant',
          content: 'Ocorreu um erro ao processar sua pergunta. Tente novamente.',
          timestamp: new Date(),
          source: 'Sistema',
        },
      ])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }, [loading])

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit(input)
    }
  }

  // Show suggestions only if there's just the welcome message
  const showSuggestions = messages.length === 1

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto">
      {/* Header */}
      <header className="flex-shrink-0 bg-brand-700 text-white px-4 py-3 flex items-center gap-3 shadow-md">
        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
          <Building2 size={20} />
        </div>
        <div>
          <h1 className="font-semibold text-base leading-tight">Assistente Financeiro</h1>
          <p className="text-xs text-brand-200">Banco Demo · Dados fictícios</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-xs text-brand-200">Online</span>
        </div>
      </header>

      {/* Disclaimer */}
      <div className="flex-shrink-0 px-4 pt-3">
        <Disclaimer />
      </div>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-hide">
        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {loading && <TypingIndicator />}

        <div ref={bottomRef} />
      </main>

      {/* Suggestion chips */}
      {showSuggestions && (
        <div className="flex-shrink-0 px-4 pb-2">
          <p className="text-xs text-slate-400 mb-2">Sugestões:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map(s => (
              <SuggestionChip key={s} label={s} onClick={submit} />
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <footer className="flex-shrink-0 px-4 pb-4 pt-2 border-t border-slate-200 bg-slate-50">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Pergunte sobre seu saldo, gastos ou transações…"
            disabled={loading}
            className="flex-1 bg-white border border-slate-300 rounded-full px-4 py-2.5 text-sm
              focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={() => submit(input)}
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center
              hover:bg-brand-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed
              focus:outline-none focus:ring-2 focus:ring-brand-500 flex-shrink-0"
            aria-label="Enviar"
          >
            <Send size={16} />
          </button>
        </div>
      </footer>
    </div>
  )
}
