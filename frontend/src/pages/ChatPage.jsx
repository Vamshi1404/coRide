import { useRef, useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { gsap, useGSAP } from '../lib/gsapSetup'
import { api } from '../lib/api'
import ChatWindow from '../components/chat/ChatWindow'

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

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
  const [conversations, setConversations] = useState([])
  const [selectedId, setSelectedId] = useState(rideId || null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const pageRef = useRef(null)
  const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    if (rideId) setSelectedId(rideId)
  }, [rideId])

  useGSAP(() => {
    if (reducedMotion) return
    gsap.from('.chat-conversations-sidebar', { autoAlpha: 0, x: -16, duration: 0.3, ease: 'power2.out' })
    gsap.from('.conv-item', { autoAlpha: 0, x: -8, duration: 0.3, stagger: 0.03, ease: 'power2.out' })
  }, { scope: pageRef, dependencies: [conversations, loading] })

  const loadConversations = async () => {
    try {
      const data = await api.get('/api/chat/conversations/list')
      setConversations(data || [])
    } catch {
      // silent
    }
    setLoading(false)
  }

  const handleBack = () => {
    setSelectedId(null)
    navigate('/chats', { replace: true })
  }

  const filteredConvs = conversations.filter((conv) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (conv.name || conv.driver_name || '').toLowerCase().includes(q)
  })

  const selectedConv = conversations.find(
    (c) => (c.ride_id || c.id) === selectedId
  )

  return (
    <div className={`chat-page-layout ${selectedId ? 'chat-mobile-detail' : ''}`} ref={pageRef}>
      {/* Conversations Sidebar */}
      <aside className="chat-conversations-sidebar">
        <div className="conv-search-wrap">
          <span className="material-symbols-outlined conv-search-icon">search</span>
          <input
            type="text"
            placeholder="Search conversations"
            className="conv-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="conv-list">
          {loading ? (
            <div className="loading" style={{ padding: 24 }}>
              <div className="spinner" />
            </div>
          ) : filteredConvs.length === 0 ? (
            <div className="empty-text" style={{ padding: 24 }}>
              {searchQuery ? 'No conversations match your search.' : 'No conversations yet.'}
            </div>
          ) : (
            filteredConvs.map((conv) => {
              const convId = conv.ride_id || conv.id
              const isActive = convId === selectedId
              const convName = conv.name || conv.driver_name || 'Unknown'
              const isOnline = conv.status === 'active' || conv.status === 'driving'

              return (
                <div
                  key={convId}
                  className={`conv-item ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedId(convId)
                    navigate(`/chat/${convId}`, { replace: true })
                  }}
                >
                  <div className="conv-avatar-wrap">
                    <div className={`conv-avatar ${isOnline ? 'online' : 'offline'}`}>
                      {getInitials(convName)}
                    </div>
                    {isOnline && <div className="conv-active-dot" />}
                  </div>
                  <div className="conv-content">
                    <div className="conv-top-row">
                      <h3 className="conv-name">{convName}</h3>
                      <span className="conv-time">{formatRelativeTime(conv.last_message_time)}</span>
                    </div>
                    {conv.status_text && (
                      <p className="conv-status">{conv.status_text}</p>
                    )}
                    <p className="conv-preview">{conv.last_message || ''}</p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </aside>

      {/* Chat Window */}
      <section className="chat-main-area">
        {selectedId ? (
          <ChatWindow
            key={selectedId}
            rideId={selectedId}
            conversation={selectedConv}
            onBack={handleBack}
          />
        ) : (
          <div className="chat-empty-state">
            <span className="material-symbols-outlined chat-empty-icon">chat_bubble</span>
            <h2>Secure Messaging</h2>
            <p>Tap a conversation to start chatting with your captain.</p>
          </div>
        )}
      </section>
    </div>
  )
}
