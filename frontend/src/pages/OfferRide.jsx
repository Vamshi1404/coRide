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
      <div className="page page--form">
        <AddVehicle onSaved={onVehicleSaved} onSkip={() => setShowAddVehicle(false)} />
      </div>
    )
  }

  return (
    <div className="page page--form">
      <header className="page-head" style={{ textAlign: 'center', alignItems: 'center' }}>
        <h1 className="page-title">Offer a ride</h1>
        <p className="page-sub">Share your commute and split the costs.</p>
      </header>

      {vehiclesQuery.isLoading ? (
        <div className="busy-line" aria-busy="true">
          <Loader2 size={20} className="spinner spinner--page" aria-hidden="true" />
          <span>Loading your garage…</span>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="offer-panel"
        >
          {errors.root && (
            <div role="alert" className="auth-alert">
              <CircleAlert size={15} aria-hidden="true" style={{ flexShrink: 0 }} /> {errors.root.message}
            </div>
          )}

          <div className="field-grid field-grid--wide" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <Controller
              name="from_city"
              control={control}
              render={({ field }) => (
                <div className={`field${errors.from_city ? ' field--invalid' : ''}`}>
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
                <div className={`field${errors.to_city ? ' field--invalid' : ''}`}>
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
            <p className="distance-preview" aria-live="polite">
              <RouteIcon size={13} aria-hidden="true" />
              ≈ {distanceKm.toFixed(1)} km via fastest route
            </p>
          )}

          <div className="field-grid">
            <Field label="Departure date" error={errors.departure_date} htmlFor="offer-date" required>
              <input id="offer-date" type="date" min={todayISO()} {...register('departure_date')} className={`input${errors.departure_date ? ' is-invalid' : ''}`} aria-describedby={errors.departure_date ? 'offer-date-error' : undefined} />
            </Field>
            <Field label="Departure time" error={errors.departure_time} htmlFor="offer-time" required>
              <input id="offer-time" type="time" {...register('departure_time')} className={`input${errors.departure_time ? ' is-invalid' : ''}`} aria-describedby={errors.departure_time ? 'offer-time-error' : undefined} />
            </Field>
          </div>

          <div className="field-grid">
            <Field label="Seats offered" error={errors.total_seats} htmlFor="offer-seats">
              <select id="offer-seats" {...register('total_seats')} className="input">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </Field>
            <Field label="Fare per seat (₹)" error={errors.final_cost} htmlFor="offer-fare" required>
              <input id="offer-fare" type="number" min="0" step="10" placeholder="e.g. 150" {...register('final_cost')} className={`input${errors.final_cost ? ' is-invalid' : ''}`} aria-describedby={errors.final_cost ? 'offer-fare-error' : undefined} />
            </Field>
          </div>

          <Field label="Vehicle" error={errors.vehicle_id} htmlFor="offer-vehicle" required>
            <div className="vehicle-row">
              <select
                id="offer-vehicle"
                disabled={vehicles.length === 0}
                {...register('vehicle_id')}
                className={`input${errors.vehicle_id ? ' is-invalid' : ''}`}
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
                className="btn btn--outline btn--md"
                style={{ whiteSpace: 'nowrap' }}
              >
                + Add vehicle
              </button>
            </div>
          </Field>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn--accent btn--lg btn--block"
            style={{ marginTop: 'var(--p-space-sm)' }}
          >
            {isSubmitting && <Loader2 size={16} className="spinner" aria-hidden="true" />}
            Publish ride
          </button>

          <p className="offer-footnote">
            Passengers request seats — you accept or decline. They pay you directly.
          </p>
        </form>
      )}
    </div>
  )
}

function Field({ label, error, children, htmlFor, required }) {
  const errorId = htmlFor ? `${htmlFor}-error` : undefined
  return (
    <div className={`field${error ? ' field--invalid' : ''}`}>
      <label htmlFor={htmlFor} className={`field__label${required ? ' is-required' : ''}`}>{label}</label>
      {children}
      {error && <p id={errorId} className="field__error" role="alert">{error.message}</p>}
    </div>
  )
}

function FieldError({ msg }) {
  return (
    <p className="field__error" role="alert">
      {msg}
    </p>
  )
}
