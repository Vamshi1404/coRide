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
    <div ref={rootRef} className="field" style={{ position: 'relative' }}>
      <label htmlFor={id} className="field__label">{label}</label>
      <div className="input-wrap">
        <span className="input-wrap__icon"><MapPin size={15} aria-hidden="true" /></span>
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => items.length > 0 && setOpen(true)}
          onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
          placeholder={placeholder}
          autoComplete="off"
          role="combobox"
          aria-expanded={open && items.length > 0}
          aria-controls={`${id}-listbox`}
          className="input"
        />
        {loading && <Loader2 size={14} className="input-wrap__spinner spinner" aria-hidden="true" style={{ border: '2px solid var(--border-default)', borderTopColor: 'var(--text-muted)' }} />}
      </div>

      {open && items.length > 0 && (
        <ul
          id={`${id}-listbox`}
          role="listbox"
          aria-label={`${label} suggestions`}
          className="autocomplete"
        >
          {items.map((item) => (
            <li key={`${item.lat}-${item.lon}-${item.label}`} role="option" aria-selected="false">
              <button type="button" onClick={() => choose(item)} className="autocomplete__option">
                <MapPin size={13} aria-hidden="true" />
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
