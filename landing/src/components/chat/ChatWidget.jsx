import { useCallback, useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { WhatsAppIcon } from '../Icons.jsx'
import ChatMessage, { BotAvatar } from './ChatMessage.jsx'
import { STARTER_PROMPTS, getStaticAiReply } from './knowledge.js'

const WHATSAPP_URL = 'https://wa.me/919867941103?text=Hi%2C%20I%27d%20like%20to%20know%20more%20about%20OceanLedger%20IHMM'

const isDesktop = () => window.innerWidth > 768
const getTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

// Answers from the static knowledge base after a short "typing" delay.
// api/chat.js can answer via Gemini instead: POST { history: [{ role: 'user' | 'model', parts: [{ text }] }] }.
async function getBotReply(userText) {
  const delay = Math.floor(Math.random() * 250) + 350
  await new Promise((resolve) => setTimeout(resolve, delay))
  return getStaticAiReply(userText)
}

export default function ChatWidget() {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [quickActionsOpen, setQuickActionsOpen] = useState(false)
  const [badgeSeen, setBadgeSeen] = useState(false)
  const [messages, setMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const [input, setInput] = useState('')
  const [showScrollBtn, setShowScrollBtn] = useState(false)

  const panelRef = useRef(null)
  const fabRef = useRef(null)
  const messagesRef = useRef(null)
  const inputRef = useRef(null)
  const nextId = useRef(0)
  const conversation = useRef(0) // bumped on reset so a reply to the cleared chat is dropped
  const touchStartY = useRef(0)

  const scrollToBottom = useCallback((smooth = true) => {
    requestAnimationFrame(() => {
      const el = messagesRef.current
      if (!el) return
      el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' })
      setShowScrollBtn(false)
    })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping, scrollToBottom])

  useEffect(() => {
    if (!isOpen) return
    scrollToBottom(false)

    // Keep the newest message visible when the mobile keyboard resizes the viewport.
    const onResize = () => scrollToBottom(false)
    window.visualViewport?.addEventListener('resize', onResize)
    window.addEventListener('resize', onResize)

    // Desktop: clicking anywhere outside the panel closes it.
    const onDocumentClick = (e) => {
      const path = e.composedPath()
      if (isDesktop() && !path.includes(panelRef.current) && !path.includes(fabRef.current)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('click', onDocumentClick)

    // Mobile: the panel is a full-screen sheet, so lock the page behind it.
    let focusTimer
    if (isDesktop()) {
      focusTimer = setTimeout(() => inputRef.current?.focus(), 250)
    } else {
      document.body.style.overflow = 'hidden'
      document.body.style.touchAction = 'none'
    }

    return () => {
      clearTimeout(focusTimer)
      window.visualViewport?.removeEventListener('resize', onResize)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('click', onDocumentClick)
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
    }
  }, [isOpen, scrollToBottom])

  const openPanel = () => {
    setIsOpen(true)
    setQuickActionsOpen(false)
    setBadgeSeen(true)
  }

  const closePanel = () => {
    setIsOpen(false)
    setQuickActionsOpen(false)
  }

  // The launcher first reveals the quick actions (AI chat / WhatsApp); it closes the panel when open.
  const toggleLauncher = () => {
    if (isOpen) closePanel()
    else setQuickActionsOpen((open) => !open)
  }

  const addMessage = (message) => {
    const entry = { id: nextId.current++, time: getTime(), chips: [], chipsUsed: false, ...message }
    setMessages((list) => [...list, entry])
  }

  const sendMessage = async (text) => {
    const trimmed = (text || '').trim()
    if (!trimmed || isTyping) return

    const convo = conversation.current
    addMessage({ type: 'user', text: trimmed })
    setInput('')
    setIsTyping(true)

    let result
    try {
      result = await getBotReply(trimmed)
    } catch {
      result = getStaticAiReply(trimmed)
    }
    if (convo !== conversation.current) return

    // Render synchronously so the input is enabled again before we focus it.
    flushSync(() => {
      setIsTyping(false)
      addMessage({ type: 'bot', text: result.reply, chips: result.chips })
    })
    if (isDesktop()) inputRef.current?.focus()
  }

  const handleChip = (messageId, label) => {
    if (isTyping) return
    setMessages((list) => list.map((m) => (m.id === messageId ? { ...m, chipsUsed: true } : m)))
    sendMessage(label)
  }

  const resetConversation = () => {
    conversation.current += 1
    setMessages([])
    setIsTyping(false)
  }

  // Bot replies link to /book-demo; route those through the router instead of reloading the page.
  const handleMessagesClick = (e) => {
    const href = e.target.closest('a')?.getAttribute('href')
    if (href?.startsWith('/')) {
      e.preventDefault()
      navigate(href)
    }
  }

  const handleMessagesScroll = (e) => {
    const el = e.currentTarget
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 150)
  }

  return (
    <>
      {/* Mobile backdrop */}
      <div className={`chat-backdrop${isOpen ? ' visible' : ''}`} id="chatBackdrop" aria-hidden="true" onClick={closePanel}></div>

      <div
        ref={panelRef}
        className={`chat-panel${isOpen ? ' visible' : ''}`}
        id="chatPanel"
        role="dialog"
        aria-label="OceanLedger IHMM Virtual Assistant"
        aria-modal="true"
      >
        {/* Mobile: swipe down on the handle to close */}
        <div
          className="chat-drag-handle"
          id="chatDragHandle"
          aria-label="Drag down to close"
          onTouchStart={(e) => {
            touchStartY.current = e.touches[0].clientY
          }}
          onTouchMove={(e) => {
            if (e.touches[0].clientY - touchStartY.current > 60) closePanel()
          }}
        ></div>

        <div className="chat-panel-header">
          <div className="chat-header-row">
            <div className="chat-avatar">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" fill="rgba(255,255,255,0.9)" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" fill="rgba(255,255,255,0.9)" />
              </svg>
            </div>
            <div className="chat-header-info">
              <div className="chat-header-name">OceanLedger IHMM AI Assistant</div>
              <div className="chat-header-status">
                <span className="chat-status-dot"></span>
                Online · Typically replies instantly
              </div>
            </div>
            <div className="chat-header-actions">
              <button className="chat-panel-btn" id="chatReset" aria-label="Restart chat" title="Restart conversation" onClick={resetConversation}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
              </button>
              <button className="chat-panel-btn" id="chatClose" aria-label="Close chat" title="Close chat" onClick={closePanel}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div
          ref={messagesRef}
          className="chat-messages"
          id="chatMessages"
          role="log"
          aria-live="polite"
          onScroll={handleMessagesScroll}
          onClick={handleMessagesClick}
        >
          <div className="chat-welcome-card">
            <div className="chat-welcome-title">
              <span>👋</span> Welcome to OceanLedger IHMM Assistant
            </div>
            <div className="chat-welcome-desc">
              I can help you navigate IHM Part I compliance, automate supplier MD/SDoC collection, check
              regulations, and provide customized fleet pricing.
            </div>
            <div className="chat-starter-grid">
              {STARTER_PROMPTS.map((prompt) => (
                <button type="button" className="chat-starter-btn" key={prompt.title} onClick={() => sendMessage(prompt.query)}>
                  <span className="chat-starter-icon">{prompt.icon}</span>
                  <span>{prompt.title}</span>
                </button>
              ))}
            </div>
          </div>

          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} onChip={handleChip} />
          ))}

          {isTyping && (
            <div className="chat-msg bot" id="chatTyping">
              <div className="chat-msg-avatar"><BotAvatar /></div>
              <div className="chat-typing"><span></span><span></span><span></span></div>
            </div>
          )}
        </div>

        <button
          className={`chat-scroll-btn${showScrollBtn ? ' visible' : ''}`}
          id="chatScrollBtn"
          aria-label="Scroll to newest messages"
          onClick={() => scrollToBottom(true)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
          <span>Latest</span>
        </button>

        <div className="chat-whatsapp-bar">
          <a href={WHATSAPP_URL} target="_blank" rel="noopener" className="chat-wa-link" id="chatWaLink">
            <WhatsAppIcon size={17} />
            Continue on WhatsApp
          </a>
        </div>

        <form
          className="chat-input-area"
          id="chatForm"
          autoComplete="off"
          onSubmit={(e) => {
            e.preventDefault()
            sendMessage(input)
          }}
        >
          <div className="chat-input-wrap">
            <input
              ref={inputRef}
              type="text"
              className="chat-input"
              id="chatInput"
              placeholder="Ask anything about IHM compliance…"
              autoComplete="off"
              maxLength={300}
              enterKeyHint="send"
              value={input}
              disabled={isTyping}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setTimeout(() => scrollToBottom(false), 150)}
            />
            <button
              type="button"
              className={`chat-input-clear${input.trim() ? ' visible' : ''}`}
              id="chatClear"
              aria-label="Clear input"
              onClick={() => {
                setInput('')
                inputRef.current?.focus()
              }}
            >
              &times;
            </button>
          </div>
          <button type="submit" className="chat-send-btn" id="chatSend" aria-label="Send message" disabled={isTyping}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>
      </div>

      {/* Floating launcher */}
      <div ref={fabRef} className={`chat-fab${isOpen ? ' chat-fab-hidden' : ''}`} id="chatFab">
        <div className={`chat-quick-actions${quickActionsOpen ? ' visible' : ''}`} id="chatQuickActions">
          <div className="chat-quick-item" id="quickContact" onClick={openPanel}>
            <span className="chat-quick-label">Chat with AI</span>
            <span className="chat-quick-icon contact">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
            </span>
          </div>
          <a href={WHATSAPP_URL} target="_blank" rel="noopener" className="chat-quick-item">
            <span className="chat-quick-label">Chat on WhatsApp</span>
            <span className="chat-quick-icon whatsapp">
              <WhatsAppIcon size={20} fill="#fff" />
            </span>
          </a>
        </div>
        <button
          className={`chat-fab-btn${isOpen ? ' is-open' : ''}`}
          id="chatToggle"
          aria-label="Open support chat"
          aria-expanded={isOpen}
          onClick={toggleLauncher}
        >
          <span className={`chat-badge${badgeSeen ? ' hidden' : ''}`} id="chatBadge">1</span>
          <svg className="icon-chat" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
          <svg className="icon-close" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </>
  )
}
