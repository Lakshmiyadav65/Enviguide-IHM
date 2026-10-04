import { useRef, useState } from 'react'
import { formatMarkdown } from './formatMarkdown.js'

export function BotAvatar() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" fill="#fff" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" fill="#fff" />
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

export default function ChatMessage({ message, onChip }) {
  const { id, type, text, time, chips, chipsUsed } = message
  const isBot = type === 'bot'
  const bubbleRef = useRef(null)
  const [copied, setCopied] = useState(false)

  const copyText = () => {
    navigator.clipboard
      .writeText(bubbleRef.current.innerText)
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
      .catch(() => {})
  }

  return (
    <div className={`chat-msg ${type}`}>
      {isBot && <div className="chat-msg-avatar"><BotAvatar /></div>}
      <div style={{ maxWidth: '100%' }}>
        {/* formatMarkdown escapes the text before adding its own tags. */}
        <div ref={bubbleRef} className="chat-msg-bubble" dangerouslySetInnerHTML={{ __html: formatMarkdown(text) }} />
        <div className="chat-msg-footer">
          <span className="chat-msg-time">{time}</span>
          {isBot && (
            <button type="button" className="chat-copy-btn" onClick={copyText}>
              {copied ? '✓ Copied!' : <><CopyIcon /> Copy</>}
            </button>
          )}
        </div>
        {isBot && chips.length > 0 && (
          <div className="chat-chips" style={chipsUsed ? { display: 'none' } : undefined}>
            {chips.map((label) => (
              <button type="button" className="chat-chip" key={label} onClick={() => onChip(id, label)}>
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
