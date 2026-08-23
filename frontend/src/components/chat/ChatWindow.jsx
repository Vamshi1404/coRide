import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { api } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { getInitials } from '@/lib/rideDisplay'
import {
  ArrowLeft, Phone, MapPin, Send, Loader2, MapPinned, ExternalLink,
  Clock, CheckCheck,
} from 'lucide-react'

const isLocationMsg = (text) => text?.startsWith('https://www.google.com/maps')

export default function ChatWindow({ rideId, conversation, onBack }) {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [sharingLocation, setSharingLocation] = useState(false)
  const [convName, setConvName] = useState(
    conversation?.name || conversation?.driver_name || ''
  )
  const [driverPhone, setDriverPhone] = useState('')
  const bottomRef = useRef(null)
  const lastIdRef = useRef(null)
  const convStatus = conversation?.status_text || ''
  const areaRef = useRef(null)
  const userScrolledUpRef = useRef(false)

  useEffect(() => {
    if (conversation?.name || conversation?.driver_name) {
      setConvName(conversation.name || conversation.driver_name)
    }
    if (rideId) {
      api.get(`/api/rides/${rideId}`)
        .then((ride) => {
          const name =
            ride?.driver_name ||
            ride?.passenger_name ||
            ''
          if (name) setConvName(name)
          if (ride?.driver_phone) setDriverPhone(ride.driver_phone)
        })
        .catch(() => {})
    }
  }, [rideId, conversation])

  useEffect(() => {
    if (!rideId) return
    setMessages([])
    setLoading(true)
    lastIdRef.current = null
    loadMessages(true)
    const interval = setInterval(() => loadMessages(false), 3000)
    return () => clearInterval(interval)
  }, [rideId]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadMessages = async (isInitial = false) => {
    try {
      const params = lastIdRef.current ? { after_id: lastIdRef.current } : {}
      const data = await api.get(`/api/chat/${rideId}`, params)
      if (data && data.length > 0) {
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id))
          const newMsgs = data.filter((m) => !existingIds.has(m.id))
          if (newMsgs.length > 0) {
            lastIdRef.current = data[data.length - 1].id
            const filteredPrev = prev.filter((m) => !String(m.id).startsWith('temp-'))
            return [...filteredPrev, ...newMsgs]
          }
          return prev
        })
      }
    } catch {
      // silent on poll
    }
    if (isInitial) setLoading(false)
  }

  const handleScrollArea = () => {
    if (!areaRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = areaRef.current
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 120
    userScrolledUpRef.current = !isNearBottom
  }

  useEffect(() => {
    if (!userScrolledUpRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const send = async (messageContent = content) => {
    const payload = (messageContent || content).trim()
    if (!payload || sending) return

    // Optimistic bubble — reconciled (or rolled back) when the server replies
    const tempId = `temp-${Date.now()}`
    const tempMsg = {
      id: tempId,
      sender_id: user?.id,
      sender_name: user?.name,
      content: payload.slice(0, 500),
      created_at: new Date().toISOString(),
      pending: true,
    }

    setMessages((prev) => [...prev, tempMsg])
    if (messageContent === content) setContent('')
    userScrolledUpRef.current = false

    setSending(true)
    try {
      const msg = await api.post(`/api/chat/${rideId}`, { content: payload.slice(0, 500) })
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...msg, sender_name: msg.sender_name || user?.name } : m))
      )
      lastIdRef.current = msg.id
    } catch {
      toast.error('Failed to send message.')
      setMessages((prev) => prev.filter((m) => m.id !== tempId))
    } finally {
      setSending(false)
    }
  }

  const shareLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Could not get your location. Please allow location access.')
      return
    }
    setSharingLocation(true)
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
      })
      const { latitude, longitude } = position.coords
      const link = `https://www.google.com/maps?q=${latitude},${longitude}`
      await send(link)
    } catch {
      toast.error('Could not get your location. Please allow location access.')
    } finally {
      setSharingLocation(false)
    }
  }

  const handleCall = () => {
    if (driverPhone) {
      window.location.href = `tel:${driverPhone}`
    } else {
      toast.error('Phone number not available.')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const formatTime = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const today = new Date()
    const isToday = d.toDateString() === today.toDateString()
    const time = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    if (isToday) return `Today, ${time}`
    return `${d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}, ${time}`
  }

  const showTimestamp = (msg, idx) => {
    if (idx === 0) return true
    const prev = messages[idx - 1]
    const currDate = new Date(msg.created_at || Date.now())
    const prevDate = new Date(prev.created_at || Date.now())
    return currDate - prevDate > 300000
  }

  if (loading && messages.length === 0) {
    return (
      <div className="busy-line" aria-busy="true">
        <Loader2 size={18} className="spinner" aria-hidden="true" />
        <span>Loading messages…</span>
      </div>
    )
  }

  return (
    <div className="chat-window">
      {/* Header */}
      <header className="chat-head">
        <div className="chat-head__id">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Back to conversations"
              className="icon-btn chat-back"
              style={{ border: 'none' }}
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <span className="avatar avatar--md avatar--brand">{getInitials(convName)}</span>
          <div style={{ minWidth: 0 }}>
            <h2 className="chat-head__name">{convName || 'Chat'}</h2>
            <p className="chat-head__status">
              <span className="chat-head__live-dot" aria-hidden="true" />
              {convStatus || 'Ride chat'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleCall}
          title={driverPhone ? `Call ${convName}` : 'Phone number unavailable'}
          aria-label="Call"
          className="icon-btn"
        >
          <Phone size={16} />
        </button>
      </header>

      {/* Messages */}
      <div
        className="chat-msgs"
        ref={areaRef}
        onScroll={handleScrollArea}
        data-lenis-prevent
        aria-live="polite"
      >
        {messages.length === 0 && (
          <p className="empty-text" style={{ marginTop: 'auto', marginBottom: 'auto' }}>
            No messages yet — say hello!
          </p>
        )}

        {messages.map((msg, idx) => {
          const isMine = String(msg.sender_id) === String(user?.id)
          return (
            <div key={msg.id} style={{ display: 'flex', flexDirection: 'column' }}>
              {showTimestamp(msg, idx) && (
                <span className="chat-day-chip tabular">{formatTime(msg.created_at)}</span>
              )}
              <div className={`msg-row ${isMine ? 'msg-row--out' : 'msg-row--in'}`}>
                {!isMine && (
                  <span className="avatar avatar--xs" aria-hidden="true">
                    {getInitials(msg.sender_name || convName)}
                  </span>
                )}
                <div style={{ minWidth: 0 }}>
                  <div className={`bubble ${isMine ? 'bubble--out' : 'bubble--in'}${msg.pending ? ' bubble__pending' : ''}`}>
                    {isLocationMsg(msg.content) ? (
                      <a
                        href={msg.content}
                        target="_blank"
                        rel="noreferrer"
                        className={`loc-card ${isMine ? 'loc-card--out' : 'loc-card--in'}`}
                      >
                        <span className="loc-card__pin"><MapPin size={14} /></span>
                        <span style={{ minWidth: 0 }}>
                          <span className="loc-card__title">Shared location</span>
                          <span className="loc-card__sub">Tap to open in Google Maps</span>
                        </span>
                        <ExternalLink size={13} style={{ marginLeft: 'auto', opacity: 0.8 }} />
                      </a>
                    ) : (
                      <p>{msg.content}</p>
                    )}
                  </div>
                  <div className={`msg-row__meta${isMine ? ' msg-row__meta--out' : ''}`}>
                    {msg.pending && <Clock size={9} aria-hidden="true" />}
                    {msg.created_at
                      ? new Date(msg.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
                      : ''}
                    {isMine && !msg.pending && <CheckCheck size={12} className="delivered" aria-hidden="true" />}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <footer style={{ flexShrink: 0, padding: 'var(--p-space-sm) var(--p-space-lg) var(--p-space-lg)', borderTop: '1px solid var(--border-default)', background: 'var(--bg-inset)' }}>
        <div className="quick-chips">
          <QuickChip onClick={shareLocation} disabled={sharingLocation}>
            <MapPinned size={13} aria-hidden="true" />
            {sharingLocation ? 'Locating…' : 'Share location'}
          </QuickChip>
          <QuickChip onClick={() => setContent('Please wait for 5 mins, I am on my way!')}>
            Wait 5 mins
          </QuickChip>
          <QuickChip onClick={() => setContent('Where are you?')}>
            Where are you?
          </QuickChip>
        </div>

        <div className="composer">
          <div className="composer__field">
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message…"
              maxLength={500}
              aria-label="Message"
              className="composer__input"
            />
          </div>
          <button
            type="button"
            onClick={() => send()}
            disabled={sending || !content.trim()}
            aria-label="Send message"
            className="composer__send"
          >
            {sending ? <Loader2 size={16} className="spinner" /> : <Send size={16} />}
          </button>
        </div>
      </footer>
    </div>
  )
}

function QuickChip({ children, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="quick-chip"
    >
      {children}
    </button>
  )
}
