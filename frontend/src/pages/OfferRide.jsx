import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { api } from '../lib/api'
import AddVehicle from '../components/vehicles/AddVehicle'
import { AddressInput } from '@/components/nocturne/AddressInput'
import { geocodeAddress, calculateRoute } from '../lib/tomtom'
import { Loader2, Route as RouteIcon, CircleAlert } from 'lucide-react'

const todayISO = () => new Date().toISOString().slice(0, 10)

const schema = z.object({
  from_city: z.string().min(2, 'Enter a pickup point'),
  to_city: z.string().min(2, 'Enter a destination'),
  departure_date: z.string().min(1, 'Pick a date'),
  departure_time: z.string().min(1, 'Pick a time'),
  total_seats: z.coerce.number().int().min(1).max(6),
  final_cost: z.coerce.number({ invalid_type_error: 'Enter a fare' }).positive('Fare must be greater than 0'),
  vehicle_id: z.string().min(1, 'Select or add a vehicle'),
})

export default function OfferRide() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showAddVehicle, setShowAddVehicle] = useState(false)
  const [fromCoords, setFromCoords] = useState(null)
  const [toCoords, setToCoords] = useState(null)
  const [distanceKm, setDistanceKm] = useState(null)

  const vehiclesQuery = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => api.get('/api/vehicles'),
  })
  const vehicles = useMemo(() => vehiclesQuery.data ?? [], [vehiclesQuery.data])

  const {
    control,
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      from_city: '',
      to_city: '',
      departure_date: '',
      departure_time: '',
      total_seats: 3,
      final_cost: '',
      vehicle_id: '',
    },
  })

  useEffect(() => {
    if (vehicles.length > 0) {
      setValue('vehicle_id', vehicles[0].id, { shouldValidate: false })
    }
  }, [vehicles, setValue])

  // Live distance preview once both endpoints are known
  useEffect(() => {
    if (!fromCoords || !toCoords) return
    let cancelled = false
    calculateRoute(fromCoords.lat, fromCoords.lon, toCoords.lat, toCoords.lon)
      .then((route) => !cancelled && setDistanceKm(route.distanceMeters / 1000))
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [fromCoords, toCoords])

  const onSubmit = async (values) => {
    try {
      const [fromCoord, toCoord] = await Promise.all([
        fromCoords || geocodeAddress(values.from_city.trim()),
        toCoords || geocodeAddress(values.to_city.trim()),
      ])

      let km = distanceKm
      if (km == null) {
        try {
          const route = await calculateRoute(fromCoord.lat, fromCoord.lon, toCoord.lat, toCoord.lon)
          km = route.distanceMeters / 1000
        } catch {
          km = null
        }
      }

      const departureTime = new Date(`${values.departure_date}T${values.departure_time}:00`).toISOString()

      await api.post('/api/rides', {
        from_city: values.from_city.trim(),
        to_city: values.to_city.trim(),
        from_lat: fromCoord.lat,
        from_lng: fromCoord.lon,
        to_lat: toCoord.lat,
        to_lng: toCoord.lon,
        departure_time: departureTime,
        total_seats: parseInt(values.total_seats),
        final_cost: parseFloat(values.final_cost),
        vehicle_id: values.vehicle_id,
        distance_km: km ? Number(km.toFixed(1)) : null,
      })

      queryClient.invalidateQueries({ queryKey: ['offered-rides'] })
      toast.success('Ride published!')
      navigate('/my-rides')
    } catch (err) {
      setError('root', { message: err?.message || 'Could not publish ride.' })
    }
  }

  const onVehicleSaved = () => {
    setShowAddVehicle(false)
    vehiclesQuery.refetch()
  }

  if (showAddVehicle) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 md:pt-28 pb-16">
        <AddVehicle onSaved={onVehicleSaved} onSkip={() => setShowAddVehicle(false)} />
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 pt-24 md:pt-28 pb-16">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--nc-900)]">Offer a ride</h1>
        <p className="mt-2 text-[var(--nc-500)]">Share your commute and split the costs.</p>
      </div>

      {vehiclesQuery.isLoading ? (
        <div className="py-20 flex flex-col items-center gap-3 text-[var(--nc-500)]" aria-busy="true">
          <Loader2 size={22} className="animate-spin" />
          <span className="text-sm">Loading your garage…</span>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="p-5 sm:p-6 rounded-[16px] bg-[var(--nc-200)] border border-[var(--nc-300)] shadow-[0_12px_40px_rgba(0,0,0,0.3)] space-y-4"
        >
          {errors.root && (
            <div role="alert" className="px-3.5 py-2.5 rounded-[10px] bg-[var(--nc-accent-dim)] border border-[var(--nc-accent)]/50 text-sm text-[var(--nc-accent)] flex items-center gap-2">
              <CircleAlert size={15} /> {errors.root.message}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <Controller
              name="from_city"
              control={control}
              render={({ field }) => (
                <div>
                  <AddressInput
                    id="offer-from"
                    label="From"
                    value={field.value}
                    onChange={(v) => {
                      field.onChange(v)
                      setFromCoords(null)
                      setDistanceKm(null)
                    }}
                    onSelect={(item) => setFromCoords({ lat: item.lat, lon: item.lon })}
                    placeholder="e.g. Hitech City"
                  />
                  {errors.from_city && <FieldError msg={errors.from_city.message} />}
                </div>
              )}
            />
            <Controller
              name="to_city"
              control={control}
              render={({ field }) => (
                <div>
                  <AddressInput
                    id="offer-to"
                    label="To"
                    value={field.value}
                    onChange={(v) => {
                      field.onChange(v)
                      setToCoords(null)
                      setDistanceKm(null)
                    }}
                    onSelect={(item) => setToCoords({ lat: item.lat, lon: item.lon })}
                    placeholder="e.g. Gachibowli"
                  />
                  {errors.to_city && <FieldError msg={errors.to_city.message} />}
                </div>
              )}
            />
          </div>

          {distanceKm != null && (
            <p className="flex items-center justify-center gap-1.5 text-xs font-medium text-[var(--nc-accent)] tabular-nums" aria-live="polite">
              <RouteIcon size={13} />
              ≈ {distanceKm.toFixed(1)} km via fastest route
            </p>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Field label="Departure date" error={errors.departure_date}>
              <input type="date" min={todayISO()} {...register('departure_date')} className={inputCls(errors.departure_date)} />
            </Field>
            <Field label="Departure time" error={errors.departure_time}>
              <input type="time" {...register('departure_time')} className={inputCls(errors.departure_time)} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Seats offered" error={errors.total_seats}>
              <select {...register('total_seats')} className={`${inputCls()} cursor-pointer`}>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </Field>
            <Field label="Fare per seat (₹)" error={errors.final_cost}>
              <input type="number" min="0" step="10" placeholder="e.g. 150" {...register('final_cost')} className={inputCls(errors.final_cost)} />
            </Field>
          </div>

          <Field label="Vehicle" error={errors.vehicle_id}>
            <div className="flex gap-2">
              <select
                disabled={vehicles.length === 0}
                {...register('vehicle_id')}
                className={`${inputCls()} cursor-pointer flex-1`}
              >
                {vehicles.length === 0 ? (
                  <option value="">No vehicles yet</option>
                ) : (
                  vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.brand} {v.model} ({v.registration_number})
                    </option>
                  ))
                )}
              </select>
              <button
                type="button"
                onClick={() => setShowAddVehicle(true)}
                className="shrink-0 px-4 h-11 rounded-[12px] border border-[var(--nc-400)] text-sm font-semibold text-[var(--nc-700)] hover:bg-[var(--nc-300)] transition-colors cursor-pointer whitespace-nowrap"
              >
                + Add vehicle
              </button>
            </div>
          </Field>

          <button
            type="submit"
            disabled={isSubmitting}
            className="!mt-6 w-full h-12 rounded-full bg-[var(--nc-accent)] text-white font-semibold text-sm hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
            Publish ride
          </button>

          <p className="text-center text-xs text-[var(--nc-500)]">
            Passengers request seats — you accept or decline. They pay you directly.
          </p>
        </form>
      )}
    </div>
  )
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--nc-500)] mb-1.5">
        {label}
      </label>
      {children}
      {error && <FieldError msg={error.message} />}
    </div>
  )
}

function FieldError({ msg }) {
  return (
    <p className="mt-1.5 text-xs text-[var(--nc-accent)]" role="alert">
      {msg}
    </p>
  )
}

function inputCls(error) {
  return `w-full h-11 px-4 rounded-[12px] bg-[var(--nc-100)] border ${
    error ? 'border-[var(--nc-accent)]' : 'border-[var(--nc-300)]'
  } text-sm text-[var(--nc-800)] placeholder:text-[var(--nc-500)] outline-none focus:border-[var(--nc-accent)] transition-colors`
}
