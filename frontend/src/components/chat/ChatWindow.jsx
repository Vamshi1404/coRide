import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { api } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { getInitials } from '@/lib/rideDisplay'
import { cn } from '@/lib/utils'
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
      <div className="h-full flex items-center justify-center gap-3 text-[var(--nc-500)]" aria-busy="true">
        <Loader2 size={18} className="animate-spin" />
        <span className="text-sm">Loading messages…</span>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col min-h-0">
      {/* Header */}
      <header className="shrink-0 flex items-center justify-between gap-3 px-4 py-3 border-b border-[var(--nc-300)] bg-[var(--nc-100)]">
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <button
              onClick={onBack}
              aria-label="Back to conversations"
              className="md:hidden size-9 shrink-0 rounded-full flex items-center justify-center text-[var(--nc-700)] hover:bg-[var(--nc-200)] cursor-pointer"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <div className="size-10 shrink-0 rounded-full bg-[var(--nc-900)] flex items-center justify-center text-sm font-bold text-[var(--nc-0)]">
            {getInitials(convName)}
          </div>
          <div className="min-w-0">
            <h2 className="font-semibold text-[var(--nc-900)] truncate">{convName || 'Chat'}</h2>
            <p className="text-[11px] text-[var(--nc-500)] flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-[var(--nc-accent)] animate-pulse" />
              {convStatus || 'Ride chat'}
            </p>
          </div>
        </div>
        <button
          onClick={handleCall}
          title={driverPhone ? `Call ${convName}` : 'Phone number unavailable'}
          aria-label="Call"
          className="size-9 shrink-0 rounded-full border border-[var(--nc-300)] text-[var(--nc-600)] hover:border-[var(--nc-accent)] hover:text-[var(--nc-accent)] transition-colors flex items-center justify-center cursor-pointer"
        >
          <Phone size={16} />
        </button>
      </header>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 space-y-1 min-h-0"
        ref={areaRef}
        onScroll={handleScrollArea}
        data-lenis-prevent
      >
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm text-[var(--nc-500)]">No messages yet — say hello!</p>
          </div>
        )}

        {messages.map((msg, idx) => {
          const isMine = String(msg.sender_id) === String(user?.id)
          return (
            <div key={msg.id}>
              {showTimestamp(msg, idx) && (
                <div className="flex justify-center my-3">
                  <span className="px-3 py-1 rounded-full bg-[var(--nc-200)] text-[11px] text-[var(--nc-500)] tabular-nums">
                    {formatTime(msg.created_at)}
                  </span>
                </div>
              )}
              <div className={cn('flex gap-2 max-w-[85%] items-end', isMine ? 'ml-auto flex-row-reverse' : 'mr-auto')}>
                {!isMine && (
                  <div className="size-7 shrink-0 rounded-full bg-[var(--nc-300)] flex items-center justify-center text-[10px] font-bold text-[var(--nc-600)]">
                    {getInitials(msg.sender_name || convName)}
                  </div>
                )}
                <div className="min-w-0">
                  <div
                    className={cn(
                      'px-3.5 py-2.5 rounded-[14px] shadow-sm',
                      isMine
                        ? 'bg-[var(--nc-accent)] text-white rounded-br-[4px]'
                        : 'bg-[var(--nc-200)] border border-[var(--nc-300)] text-[var(--nc-800)] rounded-bl-[4px]'
                    )}
                  >
                    {isLocationMsg(msg.content) ? (
                      <a
                        href={msg.content}
                        target="_blank"
                        rel="noreferrer"
                        className={cn(
                          'flex items-center gap-2.5 p-2.5 rounded-[10px] min-w-[190px]',
                          isMine ? 'bg-black/15' : 'bg-[var(--nc-accent-dim)]'
                        )}
                      >
                        <span className={cn(
                          'size-8 shrink-0 rounded-[8px] flex items-center justify-center',
                          isMine ? 'bg-white/20' : 'bg-[var(--nc-accent)] text-white'
                        )}>
                          <MapPin size={14} />
                        </span>
                        <span className="min-w-0">
                          <span className={cn('block text-xs font-bold', isMine ? 'text-white' : 'text-[var(--nc-800)]')}>
                            Shared location
                          </span>
                          <span className={cn('block text-[11px]', isMine ? 'text-white/80' : 'text-[var(--nc-500)]')}>
                            Tap to open in Google Maps
                          </span>
                        </span>
                        <ExternalLink size={13} className={cn('shrink-0 ml-auto', isMine ? 'text-white/80' : 'text-[var(--nc-500)]')} />
                      </a>
                    ) : (
                      <p className="text-sm leading-relaxed break-words">{msg.content}</p>
                    )}
                  </div>
                  <div className={cn('flex items-center gap-1 mt-1 px-1', isMine && 'justify-end')}>
                    <span className="text-[10px] text-[var(--nc-500)] tabular-nums flex items-center gap-1">
                      {msg.pending && <Clock size={9} />}
                      {msg.created_at
                        ? new Date(msg.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
                        : ''}
                    </span>
                    {isMine && !msg.pending && <CheckCheck size={12} className="text-[var(--nc-accent)]" />}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <footer className="shrink-0 px-4 pt-2 pb-4 border-t border-[var(--nc-300)] bg-[var(--nc-100)]">
        <div className="flex gap-2 pb-2 overflow-x-auto scrollbar-hide">
          <QuickChip onClick={shareLocation} disabled={sharingLocation} icon={<MapPinned size={13} />}>
            {sharingLocation ? 'Locating…' : 'Share location'}
          </QuickChip>
          <QuickChip onClick={() => setContent('Please wait for 5 mins, I am on my way!')}>
            Wait 5 mins
          </QuickChip>
          <QuickChip onClick={() => setContent('Where are you?')}>
            Where are you?
          </QuickChip>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center bg-[var(--nc-200)] border border-[var(--nc-300)] rounded-full px-4 transition-colors focus-within:border-[var(--nc-accent)]">
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message…"
              maxLength={500}
              aria-label="Message"
              className="flex-1 h-11 bg-transparent text-sm text-[var(--nc-800)] placeholder:text-[var(--nc-500)] outline-none"
            />
          </div>
          <button
            onClick={() => send()}
            disabled={sending || !content.trim()}
            aria-label="Send message"
            className="size-11 shrink-0 rounded-full bg-[var(--nc-900)] text-[var(--nc-0)] hover:bg-[var(--nc-accent)] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center"
          >
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      </footer>
    </div>
  )
}

function QuickChip({ children, icon, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-transparent border border-[var(--nc-accent)]/40 text-[var(--nc-accent)] text-xs font-medium hover:bg-[var(--nc-accent-dim)] transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
    >
      {icon}
      {children}
    </button>
  )
}
