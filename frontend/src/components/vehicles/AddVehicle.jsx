import { useState } from 'react'
import { motion } from 'motion/react'
import toast from 'react-hot-toast'
import { Loader2, CarFront } from 'lucide-react'
import { api } from '../../lib/api'

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

  const fields = [
    { field: 'brand', label: 'Brand', placeholder: 'e.g. Maruti Suzuki', type: 'text' },
    { field: 'model', label: 'Model', placeholder: 'e.g. Swift', type: 'text' },
    { field: 'reg_no', label: 'Registration number', placeholder: 'e.g. TS 01 AB 1234', type: 'text' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-lg mx-auto"
    >
      <div className="text-center mb-6">
        <div className="mx-auto size-11 rounded-[12px] bg-[var(--nc-900)] flex items-center justify-center">
          <CarFront size={20} className="text-[var(--nc-accent)]" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-[var(--nc-900)]">Add a vehicle</h2>
        <p className="mt-1 text-sm text-[var(--nc-500)]">You need a vehicle to offer rides</p>
      </div>

      {error && (
        <div role="alert" className="mb-4 px-3.5 py-2.5 rounded-[10px] bg-[var(--nc-accent-dim)] border border-[var(--nc-accent)]/50 text-sm text-[var(--nc-accent)]">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        noValidate
        className="p-6 rounded-[16px] bg-[var(--nc-200)] border border-[var(--nc-300)] space-y-4"
      >
        {fields.map(({ field, label, placeholder, type }) => (
          <div key={field}>
            <label htmlFor={`veh-${field}`} className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--nc-500)] mb-1.5">
              {label}
            </label>
            <input
              id={`veh-${field}`}
              type={type}
              value={form[field]}
              onChange={update(field)}
              placeholder={placeholder}
              className={inputCls()}
            />
          </div>
        ))}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="veh-type" className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--nc-500)] mb-1.5">
              Type
            </label>
            <select id="veh-type" value={form.type} onChange={update('type')} className={`${inputCls()} cursor-pointer`}>
              <option value="car">Car</option>
              <option value="suv">SUV</option>
              <option value="bike">Bike</option>
            </select>
          </div>
          <div>
            <label htmlFor="veh-seats" className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--nc-500)] mb-1.5">
              Seats
            </label>
            <select id="veh-seats" value={form.seat_capacity} onChange={updateNum('seat_capacity')} className={`${inputCls()} cursor-pointer`}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 h-11 rounded-full bg-[var(--nc-accent)] text-white font-semibold text-sm hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={15} className="animate-spin" />}
            Add vehicle
          </button>
          {onSkip && (
            <button
              type="button"
              onClick={onSkip}
              className="px-5 h-11 rounded-full border border-[var(--nc-400)] text-[var(--nc-600)] text-sm font-medium hover:bg-[var(--nc-300)] transition-colors cursor-pointer"
            >
              Back
            </button>
          )}
        </div>
      </form>
    </motion.div>
  )
}

function inputCls() {
  return 'w-full h-11 px-4 rounded-[12px] bg-[var(--nc-100)] border border-[var(--nc-300)] text-sm text-[var(--nc-800)] placeholder:text-[var(--nc-500)] outline-none focus:border-[var(--nc-accent)] transition-colors'
}
