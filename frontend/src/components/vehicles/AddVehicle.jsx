import { useRef, useState } from 'react'
import { gsap, useGSAP } from '../../lib/gsapSetup'
import toast from 'react-hot-toast'
import { api } from '../../lib/api'

export default function AddVehicle({ onSaved, onSkip }) {
  const [form, setForm] = useState({ type: 'car', brand: '', model: '', reg_no: '', seat_capacity: 4 })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const containerRef = useRef(null)

  const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useGSAP(() => {
    if (reducedMotion) return
    gsap.from('.vehicle-form-container', { autoAlpha: 0, y: 20, duration: 0.3, ease: 'power2.out' })
    gsap.from('.vehicle-form-container form > *', { autoAlpha: 0, y: 10, duration: 0.3, stagger: 0.05, ease: 'power2.out' })
  }, { scope: containerRef })

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })
  const updateNum = (field) => (e) => setForm({ ...form, [field]: parseInt(e.target.value) || 1 })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const { brand, model, reg_no } = form
    if (!brand.trim() || !model.trim() || !reg_no.trim()) {
      return setError('Brand, model and registration number are required.')
    }

    setLoading(true)
    try {
      await api.post('/api/vehicles', {
        type: form.type,
        brand: brand.trim(),
        model: model.trim(),
        registration_number: reg_no.trim().toUpperCase(),
        seat_capacity: form.seat_capacity,
      })
      toast.success('Vehicle added!')
      onSaved?.()
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  const fields = [
    { field: 'brand', label: 'Brand', placeholder: 'e.g. Maruti Suzuki', type: 'text' },
    { field: 'model', label: 'Model', placeholder: 'e.g. Swift', type: 'text' },
    { field: 'reg_no', label: 'Registration Number', placeholder: 'e.g. TS 01 AB 1234', type: 'text' },
  ]

  return (
    <div className="vehicle-form-container" ref={containerRef}>
      <h2>Add a Vehicle</h2>
      <p className="subtitle">You need a vehicle to offer rides</p>

      {error && (
        <div className="error-box">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {fields.map(({ field, label, placeholder, type }) => (
          <label key={field}>
            {label}
            <input
              type={type}
              value={form[field]}
              onChange={update(field)}
              placeholder={placeholder}
            />
          </label>
        ))}

        <div className="form-row">
          <label>
            Type
            <select value={form.type} onChange={update('type')}>
              <option value="car">Car</option>
              <option value="suv">SUV</option>
              <option value="bike">Bike</option>
            </select>
          </label>
          <label>
            Seats
            <select value={form.seat_capacity} onChange={updateNum('seat_capacity')}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="btn-row">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span className="spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
                Adding...
              </span>
            ) : 'Add Vehicle'}
          </button>
          {onSkip && (
            <button
              type="button"
              className="btn-secondary"
              onClick={onSkip}
            >
              Skip
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
