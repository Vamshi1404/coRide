import { useEffect, useRef, useState } from 'react'
import { searchAddress } from '../../lib/tomtom'
import { MapPin, Loader2 } from 'lucide-react'

export function AddressInput({
  label,
  value,
  onChange,
  onSelect,
  placeholder,
  id,
}) {
  const [items, setItems] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const rootRef = useRef(null)
  const seqRef = useRef(0)

  useEffect(() => {
    const handler = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (!value || value.length < 2) {
      setItems([])
      setLoading(false)
      return undefined
    }

    setLoading(true)
    const seq = ++seqRef.current
    const t = setTimeout(async () => {
      try {
        const results = await searchAddress(value)
        if (seq === seqRef.current) {
          setItems(results)
          setOpen(results.length > 0)
        }
      } catch {
        if (seq === seqRef.current) setItems([])
      } finally {
        if (seq === seqRef.current) setLoading(false)
      }
    }, 250)

    return () => clearTimeout(t)
  }, [value])

  const choose = (item) => {
    onChange(item.label)
    onSelect?.(item)
    setOpen(false)
  }

  return (
    <div ref={rootRef} className="relative flex-1 min-w-0">
      <label
        htmlFor={id}
        className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--nc-500)] mb-1.5"
      >
        {label}
      </label>
      <div className="relative">
        <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--nc-accent)] pointer-events-none" />
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => items.length > 0 && setOpen(true)}
          onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full h-11 pl-9 pr-8 rounded-[12px] bg-[var(--nc-200)] border border-[var(--nc-300)] text-sm text-[var(--nc-800)] placeholder:text-[var(--nc-500)] outline-none focus:border-[var(--nc-accent)] transition-colors"
        />
        {loading && (
          <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--nc-500)] animate-spin" />
        )}
      </div>

      {open && items.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-30 left-0 right-0 mt-1.5 rounded-[12px] bg-[var(--nc-100)] border border-[var(--nc-300)] shadow-[0_16px_40px_rgba(0,0,0,0.45)] overflow-hidden"
        >
          {items.map((item) => (
            <li key={`${item.lat}-${item.lon}-${item.label}`}>
              <button
                type="button"
                onClick={() => choose(item)}
                className="w-full text-left px-3.5 py-2.5 text-sm text-[var(--nc-700)] hover:bg-[var(--nc-200)] hover:text-[var(--nc-900)] transition-colors cursor-pointer"
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
