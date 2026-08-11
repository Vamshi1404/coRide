import { useState, useEffect, useRef } from 'react'
import { gsap, useGSAP } from '../../lib/gsapSetup'
import toast from 'react-hot-toast'
import { api } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { Icon } from '../../components/ui/icon'

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

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
  const rootRef = useRef(null)
  const animatedIdsRef = useRef(new Set())
  const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (conversation?.name || conversation?.driver_name) {
      setConvName(conversation.name || conversation.driver_name)
    }
    if (rideId) {
      api.get(`/api/rides/${rideId}`)
        .then((ride) => {
          const name =
            ride?.driver_name ||
            ride?.driver?.name ||
            ride?.passenger_name ||
            ride?.user?.name ||
            ''
          if (name) setConvName(name)
          if (ride?.driver_phone) setDriverPhone(ride.driver_phone)
        })
        .catch(() => {})
    }
  }, [rideId, conversation])

  useGSAP(() => {
    if (reducedMotion) return
    const rows = rootRef.current?.querySelectorAll('.chat-msg-row') || []
    rows.forEach((row) => {
      const id = row.getAttribute('data-msg-id')
      if (id && !animatedIdsRef.current.has(id)) {
        animatedIdsRef.current.add(id)
        gsap.from(row, { autoAlpha: 0, y: 12, scale: 0.95, duration: 0.2, ease: 'power2.out' })
      }
    })
  }, { scope: rootRef, dependencies: [messages] })

  const areaRef = useRef(null)
  const userScrolledUpRef = useRef(false)

  useEffect(() => {
    if (!rideId) return
    setMessages([])
    setLoading(true)
    lastIdRef.current = null
    animatedIdsRef.current = new Set()
    loadMessages(true)
    const interval = setInterval(() => loadMessages(false), 3000)
    return () => clearInterval(interval)
  }, [rideId])

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
            // Replace any temp message if matched
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

    const tempId = `temp-${Date.now()}`
    const tempMsg = {
      id: tempId,
      ride_id: rideId,
      sender_id: user?.id,
      sender_name: user?.name,
      content: payload.slice(0, 500),
      created_at: new Date().toISOString(),
      pending: true,
    }

    // Optimistic UI update
    setMessages((prev) => [...prev, tempMsg])
    if (messageContent === content) setContent('')
    userScrolledUpRef.current = false
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })

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
    return d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }) + `, ${time}`
  }

  const showTimestamp = (msg, idx) => {
    if (idx === 0) return true
    const prev = messages[idx - 1]
    const currDate = new Date(msg.created_at || Date.now())
    const prevDate = new Date(prev.created_at || Date.now())
    return (currDate - prevDate) > 300000
  }

  if (loading && messages.length === 0) return (
    <div className="chat-loading">
      <span className="spinner" />
      <span style={{ marginLeft: 8 }}>Loading messages...</span>
    </div>
  )

  return (
    <div className="chat-window-full" ref={rootRef}>
      <header className="chat-window-header">
        <div className="chat-header-left">
          {onBack && (
            <button className="chat-back-btn" title="Back to conversations" onClick={onBack}>
              <Icon name="arrow_back" />
            </button>
          )}
          <div className="chat-header-avatar">{getInitials(convName)}</div>
          <div>
            <h2 className="chat-header-name">{convName || 'Loading...'}</h2>
            <div className="chat-header-status-row">
              <span className="chat-header-status-dot" />
              <span className="chat-header-status-text">{convStatus || 'Online'}</span>
            </div>
          </div>
        </div>
        <div className="chat-header-actions">
          <button className="chat-header-btn" title="Call Driver" onClick={handleCall}>
            <Icon name="call" />
          </button>
        </div>
      </header>

      <div className="chat-messages-area" ref={areaRef} onScroll={handleScrollArea}>
        {messages.length === 0 && (
          <div className="empty-text" style={{ textAlign: 'center', padding: 40 }}>
            No messages yet. Say hello!
          </div>
        )}

        {messages.map((msg, idx) => {
          const isMine = String(msg.sender_id) === String(user?.id)
          return (
            <div key={msg.id}>
              {showTimestamp(msg, idx) && (
                <div className="chat-timestamp-sep">
                  <span>{formatTime(msg.created_at)}</span>
                </div>
              )}
              <div
                className={`chat-msg-row ${isMine ? 'mine' : 'theirs'}`}
                data-msg-id={msg.id}
              >
                {!isMine && (
                  <div className="chat-msg-avatar-sm">{getInitials(msg.sender_name || convName)}</div>
                )}
                <div className="chat-msg-content">
                  <div className={`chat-msg-bubble ${isMine ? 'mine' : 'theirs'}`}>
                  {isLocationMsg(msg.content) ? (
                    <a href={msg.content} target="_blank" rel="noreferrer" className="chat-location-card">
                      <div className="chat-location-map-preview">
                        <Icon name="location_on" className="chat-location-pin" />
                      </div>
                      <div className="chat-location-info">
                        <span className="chat-location-title">Shared Location</span>
                        <span className="chat-location-sub">Tap to open in Google Maps</span>
                      </div>
                      <Icon name="open_in_new" className="chat-location-arrow" />
                    </a>
                  ) : (
                    <p className="chat-msg-text">{msg.content}</p>
                  )}
                </div>
                <div className="chat-msg-meta">
                  <span className="chat-msg-time">
                    {msg.created_at
                      ? new Date(msg.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
                      : ''}
                  </span>
                  {isMine && (
                    <Icon name={msg.pending ? 'schedule' : 'done_all'} className="chat-msg-read" style={{ opacity: msg.pending ? 0.5 : 1 }} />
                  )}
                </div>
              </div>
            </div>
            </div>
          )
        })}

        <div ref={bottomRef} />
      </div>

      <footer className="chat-input-footer">
        <div className="chat-quick-actions">
          <button
            className="quick-action-chip"
            onClick={shareLocation}
            disabled={sharingLocation}
          >
            <Icon name="location_on" />
            {sharingLocation ? 'Getting location...' : 'Share Location'}
          </button>
          <button
            className="quick-action-chip"
            onClick={() => setContent('Please wait for 5 mins, I am on my way!')}
          >
            ⏱ Wait for 5 mins
          </button>
          <button
            className="quick-action-chip"
            onClick={() => setContent('Where are you?')}
          >
            📍 Where are you?
          </button>
        </div>

        <div className="chat-input-row-full">
          <div className="chat-input-wrap">
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a secure message..."
              maxLength={500}
              className="chat-text-input"
            />
          </div>
          <button
            className="chat-send-btn"
            onClick={send}
            disabled={sending || !content.trim()}
            aria-label="Send message"
          >
            <Icon name="send" filled />
          </button>
        </div>
      </footer>
    </div>
  )
}
