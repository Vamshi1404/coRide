import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import ChatWindow from '../components/chat/ChatWindow'
import { getInitials } from '@/lib/rideDisplay'
import { cn } from '@/lib/utils'
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
    <div className={`flex h-[calc(100vh-4rem)] overflow-hidden ${selectedId ? 'chat-mobile-detail' : ''}`}>
      {/* Conversations sidebar */}
      <aside
        className={cn(
          'w-full md:w-[340px] shrink-0 flex-col border-r border-[var(--nc-300)] bg-[var(--nc-100)]',
          selectedId ? 'hidden md:flex' : 'flex'
        )}
      >
        <div className="p-4 pb-3">
          <h1 className="text-lg font-bold text-[var(--nc-900)] mb-3">Chats</h1>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--nc-500)]" />
            <input
              type="search"
              placeholder="Search conversations"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search conversations"
              className="w-full h-10 pl-9 pr-3 rounded-full bg-[var(--nc-200)] border border-[var(--nc-300)] text-sm text-[var(--nc-800)] placeholder:text-[var(--nc-500)] outline-none focus:border-[var(--nc-accent)] transition-colors"
            />
          </div>
        </div>

        <div
          className="flex-1 overflow-y-auto px-2 pb-4"
          data-lenis-prevent
        >
          {conversationsQuery.isLoading ? (
            <div className="p-5 space-y-4" aria-busy="true">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex gap-3 items-center animate-pulse">
                  <div className="size-11 rounded-full bg-[var(--nc-300)]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-2/3 rounded bg-[var(--nc-300)]" />
                    <div className="h-2.5 w-1/2 rounded bg-[var(--nc-200)]" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConvs.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <MessageCircle size={26} className="mx-auto text-[var(--nc-500)]" />
              <p className="mt-3 text-sm font-medium text-[var(--nc-700)]">
                {searchQuery ? 'No matches' : 'No conversations yet'}
              </p>
              {!searchQuery && (
                <p className="mt-1 text-xs text-[var(--nc-500)] leading-relaxed">
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
                  onClick={() => {
                    setSelectedId(convId)
                    navigate(`/chat/${convId}`, { replace: true })
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-[12px] text-left transition-colors cursor-pointer',
                    isActive
                      ? 'bg-[var(--nc-accent-dim)]'
                      : 'hover:bg-[var(--nc-200)]'
                  )}
                >
                  <div className="relative shrink-0">
                    <div
                      className={cn(
                        'size-11 rounded-full flex items-center justify-center text-sm font-bold',
                        isOnline
                          ? 'bg-[var(--nc-900)] text-white'
                          : 'bg-[var(--nc-300)] text-[var(--nc-600)]'
                      )}
                    >
                      {getInitials(convName)}
                    </div>
                    {isOnline && (
                      <span className="absolute bottom-0 right-0 size-3 rounded-full bg-[var(--nc-accent)] ring-2 ring-[var(--nc-100)]" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn('text-sm font-semibold truncate', isActive ? 'text-[var(--nc-900)]' : 'text-[var(--nc-800)]')}>
                        {convName}
                      </p>
                      <span className="text-[10px] text-[var(--nc-500)] shrink-0 tabular-nums">
                        {formatRelativeTime(conv.last_message_time)}
                      </span>
                    </div>
                    {conv.status_text && (
                      <p className="text-[11px] italic font-medium text-[var(--nc-accent)] truncate mt-0.5">{conv.status_text}</p>
                    )}
                    <p className="text-xs text-[var(--nc-500)] truncate mt-0.5">{conv.last_message || ''}</p>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </aside>

      {/* Chat window — desktop pane + mobile full view when selected */}
      <section
        className={cn(
          'flex-1 flex-col min-w-0 bg-[var(--nc-50)]',
          selectedId ? 'flex' : 'hidden md:flex'
        )}
      >
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
    <div className="h-full flex flex-col items-center justify-center text-center px-6">
      <div className="size-16 rounded-[18px] bg-[var(--nc-900)] flex items-center justify-center">
        <MessageCircle size={26} className="text-[var(--nc-accent)]" />
      </div>
      <h2 className="mt-6 text-xl font-bold tracking-tight text-[var(--nc-900)]">Your ride conversations</h2>
      <p className="mt-2 text-sm text-[var(--nc-500)] max-w-xs leading-relaxed">
        Coordinate pickups, share your live location, and stay in sync with your driver or passengers.
      </p>
      <Link
        to="/search"
        className="mt-6 px-5 py-2.5 rounded-full bg-[var(--nc-900)] text-white text-sm font-medium hover:bg-[var(--nc-800)] transition-colors"
      >
        Find a ride
      </Link>
    </div>
  )
}
