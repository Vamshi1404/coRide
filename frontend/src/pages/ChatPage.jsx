import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import ChatWindow from '../components/chat/ChatWindow'
import { getInitials } from '@/lib/rideDisplay'
import { Search, MessageCircle } from 'lucide-react'

function formatRelativeTime(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diffSec = Math.floor((now - date) / 1000)
  if (diffSec < 60) return 'Just now'
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
}

export default function ChatPage() {
  const { rideId } = useParams()
  const navigate = useNavigate()
  const [selectedId, setSelectedId] = useState(rideId || null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (rideId) setSelectedId(rideId)
  }, [rideId])

  const conversationsQuery = useQuery({
    queryKey: ['conversations'],
    queryFn: () => api.get('/api/chat/conversations/list'),
    refetchInterval: 15_000,
  })

  const conversations = conversationsQuery.data ?? []

  const handleBack = () => {
    setSelectedId(null)
    navigate('/chats', { replace: true })
  }

  const filteredConvs = conversations.filter((conv) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (conv.name || conv.driver_name || '').toLowerCase().includes(q)
  })

  const selectedConv = conversations.find((c) => (c.ride_id || c.id) === selectedId)

  return (
    <div className="chat-shell" data-pane={selectedId ? 'thread' : 'list'}>
      {/* Conversations sidebar */}
      <aside className="conv-sidebar" aria-label="Conversations">
        <div className="conv-search">
          <h1 className="card__title" style={{ marginBottom: 'var(--p-space-md)' }}>Chats</h1>
          <div className="input-wrap">
            <span className="input-wrap__icon"><Search size={14} aria-hidden="true" /></span>
            <input
              type="search"
              placeholder="Search conversations"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search conversations"
              className="input"
              style={{ height: 40, borderRadius: 'var(--radius-chip)' }}
            />
          </div>
        </div>

        <div
          className="conv-scroll"
          data-lenis-prevent
        >
          {conversationsQuery.isLoading ? (
            <div className="stack stack--gap-lg" style={{ padding: 'var(--p-space-xl)' }} aria-busy="true">
              {[0, 1, 2].map((i) => (
                <div key={i} className="skel-row" aria-hidden="true">
                  <span className="skel skel--circle avatar avatar--md" style={{ width: 44, height: 44 }} />
                  <div className="stack stack--gap-sm" style={{ flex: 1 }}>
                    <div className="skel skel--line" style={{ width: '66%' }} />
                    <div className="skel skel--line sm" style={{ width: '50%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConvs.length === 0 ? (
            <div className="state state--compact">
              <MessageCircle size={26} aria-hidden="true" style={{ color: 'var(--text-muted)' }} />
              <p className="card__title" style={{ fontSize: 'var(--fs-small)' }}>
                {searchQuery ? 'No matches' : 'No conversations yet'}
              </p>
              {!searchQuery && (
                <p className="state__body" style={{ fontSize: 'var(--p-text-xs)' }}>
                  Chats open automatically when you request or offer a ride.
                </p>
              )}
            </div>
          ) : (
            filteredConvs.map((conv) => {
              const convId = conv.ride_id || conv.id
              const isActive = convId === selectedId
              const convName = conv.name || conv.driver_name || 'Unknown'
              const isOnline = conv.status === 'active' || conv.status === 'driving'

              return (
                <button
                  key={convId}
                  type="button"
                  onClick={() => {
                    setSelectedId(convId)
                    navigate(`/chat/${convId}`, { replace: true })
                  }}
                  className={`conv-item${isActive ? ' is-active' : ''}`}
                >
                  <span className="avatar avatar--md" style={{ position: 'relative', flexShrink: 0 }}>
                    {getInitials(convName)}
                    {isOnline && <span className="avatar__dot" aria-hidden="true" />}
                  </span>

                  <span className="conv-item__body">
                    <span className="conv-item__top">
                      <span className="conv-item__name">{convName}</span>
                      <span className="conv-item__time tabular">{formatRelativeTime(conv.last_message_time)}</span>
                    </span>
                    {conv.status_text && (
                      <span className="conv-item__status">{conv.status_text}</span>
                    )}
                    <span className="conv-item__preview">{conv.last_message || ''}</span>
                  </span>
                </button>
              )
            })
          )}
        </div>
      </aside>

      {/* Chat window — desktop pane + mobile full view when selected */}
      <section className="chat-main">
        {selectedId ? (
          <ChatWindow key={selectedId} rideId={selectedId} conversation={selectedConv} onBack={handleBack} />
        ) : (
          <EmptyPane />
        )}
      </section>
    </div>
  )
}

function EmptyPane() {
  return (
    <div className="chat-empty">
      <span className="chat-empty__mark"><MessageCircle size={26} aria-hidden="true" /></span>
      <h2 className="page-title" style={{ fontSize: 'var(--p-text-xl)' }}>Your ride conversations</h2>
      <p className="page-sub" style={{ maxWidth: '34ch', fontSize: 'var(--fs-small)' }}>
        Coordinate pickups, share your live location, and stay in sync with your driver or passengers.
      </p>
      <Link to="/search" className="btn btn--primary btn--md" style={{ marginTop: 'var(--p-space-lg)' }}>
        Find a ride
      </Link>
    </div>
  )
}
