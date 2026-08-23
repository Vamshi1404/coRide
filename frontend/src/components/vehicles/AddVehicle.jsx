import { useState } from 'react'
import { motion } from 'motion/react'
import toast from 'react-hot-toast'
import { Loader2, CarFront, Car, Truck, Bike } from 'lucide-react'
import { api } from '../../lib/api'

const VEHICLE_TYPES = [
  { value: 'car', label: 'Car', icon: Car },
  { value: 'suv', label: 'SUV', icon: Truck },
  { value: 'bike', label: 'Bike', icon: Bike },
]

export default function AddVehicle({ onSaved, onSkip }) {
  const [form, setForm] = useState({ type: 'car', brand: '', model: '', reg_no: '', seat_capacity: 4 })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="card"
      style={{ maxWidth: 520, marginInline: 'auto' }}
    >
      <div className="auth-card__brand" style={{ justifyContent: 'center', width: '100%' }}>
        <span className="auth-card__mark" aria-hidden="true">
          <CarFront size={20} />
        </span>
      </div>
      <div style={{ textAlign: 'center' }}>
        <h1 className="card__title" style={{ fontSize: 'var(--p-text-xl)' }}>Add a vehicle</h1>
        <p className="row-item__sub">You need a vehicle to offer rides</p>
      </div>

      {error && (
        <div role="alert" className="auth-alert" style={{ marginTop: 'var(--p-space-lg)' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="stack stack--gap-lg" style={{ marginTop: 'var(--p-space-xl)' }}>
        <div className="field">
          <label htmlFor="veh-brand" className="field__label is-required">Brand</label>
          <input id="veh-brand" type="text" value={form.brand} onChange={update('brand')} placeholder="e.g. Maruti Suzuki" className="input" aria-describedby={error ? 'veh-error' : undefined} />
        </div>

        <div className="field">
          <label htmlFor="veh-model" className="field__label is-required">Model</label>
          <input id="veh-model" type="text" value={form.model} onChange={update('model')} placeholder="e.g. Swift" className="input" />
        </div>

        <div className="field">
          <label htmlFor="veh-reg" className="field__label is-required">Registration number</label>
          <input id="veh-reg" type="text" value={form.reg_no} onChange={update('reg_no')} placeholder="e.g. TS 01 AB 1234" className="input" />
        </div>

        <div className="field-grid">
          <div className="field">
            <span className="field__label" id="veh-type-label">Type</span>
            <div className="seg" role="radiogroup" aria-labelledby="veh-type-label">
              {VEHICLE_TYPES.map(({ value, label, icon: Icon }) => (
                <label key={value} className="seg__opt-wrap" style={{ display: 'contents' }}>
                  <input
                    type="radio"
                    name="veh-type"
                    value={value}
                    checked={form.type === value}
                    onChange={update('type')}
                  />
                  <span className="seg__opt">
                    <Icon size={15} aria-hidden="true" />
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div className="field">
            <label htmlFor="veh-seats" className="field__label">Seats</label>
            <select id="veh-seats" value={form.seat_capacity} onChange={updateNum('seat_capacity')} className="input">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="row-item__actions" style={{ gap: 'var(--p-space-md)', paddingTop: 'var(--p-space-xs)' }}>
          <button type="submit" disabled={loading} className="btn btn--accent btn--md" style={{ flex: 1 }}>
            {loading && <Loader2 size={15} className="spinner" aria-hidden="true" />}
            Add vehicle
          </button>
          {onSkip && (
            <button type="button" onClick={onSkip} className="btn btn--outline btn--md">
              Back
            </button>
          )}
        </div>
      </form>
    </motion.div>
  )
}
