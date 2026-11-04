import { type Message } from '../lib/messageHandler'
import { User, Bot } from 'lucide-react'

interface MessageBubbleProps {
  message: Message
}

// Very lightweight markdown renderer (bold, code blocks, bullet lists)
function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n')
  const nodes: React.ReactNode[] = []
  let inCodeBlock = false
  let codeLines: string[] = []

  const renderInline = (line: string, key: string | number): React.ReactNode => {
    // Bold **text**
    const parts = line.split(/(\*\*[^*]+\*\*)/)
    return (
      <span key={key}>
        {parts.map((part, i) =>
          part.startsWith('**') && part.endsWith('**')
            ? <strong key={i}>{part.slice(2, -2)}</strong>
            : part.startsWith('`') && part.endsWith('`')
              ? <code key={i} className="bg-slate-100 text-slate-800 px-1 rounded text-sm font-mono">{part.slice(1, -1)}</code>
              : part
        )}
      </span>
    )
  }

  lines.forEach((line, idx) => {
    if (line.startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true
        codeLines = []
      } else {
        inCodeBlock = false
        nodes.push(
          <pre key={`code-${idx}`} className="bg-slate-900 text-green-300 rounded-lg p-3 my-2 overflow-x-auto text-xs font-mono whitespace-pre-wrap">
            {codeLines.join('\n')}
          </pre>
        )
      }
      return
    }

    if (inCodeBlock) {
      codeLines.push(line)
      return
    }

    if (line.startsWith('> ')) {
      nodes.push(
        <blockquote key={idx} className="border-l-4 border-brand-500 pl-3 my-1 text-slate-500 text-sm italic">
          {renderInline(line.slice(2), idx)}
        </blockquote>
      )
    } else if (line.startsWith('• ') || line.startsWith('- ')) {
      nodes.push(
        <div key={idx} className="flex gap-2 my-0.5">
          <span className="text-brand-500 mt-0.5">•</span>
          <span>{renderInline(line.slice(2), idx)}</span>
        </div>
      )
    } else if (/^\d+\.\s/.test(line)) {
      nodes.push(
        <div key={idx} className="flex gap-2 my-0.5">
          <span className="text-brand-500 font-medium min-w-[1.2rem]">{line.match(/^\d+/)?.[0]}.</span>
          <span>{renderInline(line.replace(/^\d+\.\s/, ''), idx)}</span>
        </div>
      )
    } else if (line.startsWith('#')) {
      const level = line.match(/^#+/)?.[0].length ?? 1
      const text = line.replace(/^#+\s/, '')
      const cls = level === 1 ? 'text-lg font-bold mt-2 mb-1' : 'text-base font-semibold mt-2 mb-0.5'
      nodes.push(<p key={idx} className={cls}>{renderInline(text, idx)}</p>)
    } else if (line.trim() === '') {
      nodes.push(<div key={idx} className="h-2" />)
    } else {
      nodes.push(<p key={idx} className="my-0.5">{renderInline(line, idx)}</p>)
    }
  })

  return nodes
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
        ${isUser ? 'bg-brand-600 text-white' : 'bg-white border border-slate-200 text-brand-600'}`}>
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed
        ${isUser
          ? 'bg-brand-600 text-white rounded-tr-sm'
          : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'
        }`}>
        {isUser
          ? <p>{message.content}</p>
          : <div className="space-y-0.5">{renderMarkdown(message.content)}</div>
        }

        {/* Source badge */}
        {!isUser && message.source && message.source !== 'Sistema' && (
          <div className="mt-2 pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-400">📡 {message.source}</span>
          </div>
        )}

        {/* Timestamp */}
        <div className={`text-xs mt-1 ${isUser ? 'text-brand-200' : 'text-slate-400'} text-right`}>
          {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  )
}
