import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { DriverCard } from '@/components/nocturne/driver-card'
import { SafetyChecklist } from '@/components/nocturne/safety-checklist'
import { FareCounter } from '@/components/nocturne/fare-counter'
import { LiveChip } from '@/components/nocturne/live-indicators'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { formatRideDateTime, formatCurrency } from '@/lib/rideDisplay'
import {
  ArrowLeft, MapPin, Navigation, Clock, Users, Wallet,
  CheckCircle2, AlertTriangle, Loader2, Route as RouteIcon,
} from 'lucide-react'

export default function ConfirmRide() {
  const { rideId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [booked, setBooked] = useState(false)

  const rideQuery = useQuery({
    queryKey: ['ride', rideId],
    queryFn: () => api.get(`/api/rides/${rideId}`),
    retry: false,
  })

  const ride = rideQuery.data

  useEffect(() => {
    if (!ride) return undefined
    if (ride.booking_status === 'pending' || ride.booking_status === 'accepted') setBooked(true)
    return undefined
  }, [ride])

  const requestMutation = useMutation({
    mutationFn: () => api.post(`/api/requests/ride/${rideId}`),
    onSuccess: () => {
      setBooked(true)
      queryClient.invalidateQueries({ queryKey: ['ride', rideId] })
      queryClient.invalidateQueries({ queryKey: ['joined-rides'] })
      toast.success('Seat request sent!')
      setTimeout(() => navigate('/my-rides'), 1800)
    },
    onError: (err) => {
      toast.error(err?.message || 'Could not send request.')
    },
  })

  if (rideQuery.isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 pt-24 pb-16 space-y-5" aria-busy="true">
        <div className="h-6 w-40 rounded bg-[var(--nc-200)] animate-pulse" />
        <div className="h-64 rounded-[14px] bg-[var(--nc-200)] border border-[var(--nc-300)] animate-pulse" />
        <div className="h-40 rounded-[14px] bg-[var(--nc-200)] border border-[var(--nc-300)] animate-pulse" />
      </div>
    )
  }

  if (rideQuery.isError || !ride) {
    return (
      <div className="min-h-[60vh] pt-32 pb-16 px-6 flex items-center justify-center text-center">
        <div>
          <AlertTriangle size={28} className="mx-auto text-[var(--nc-accent)]" />
          <h1 className="mt-4 text-xl font-bold text-[var(--nc-900)]">Ride not found</h1>
          <p className="mt-1.5 text-sm text-[var(--nc-500)]">It may have been cancelled or removed.</p>
          <Button render={<Link to="/search" />} variant="outline" className="mt-6 border-[var(--nc-400)] text-[var(--nc-600)] cursor-pointer">
            <ArrowLeft size={16} className="mr-2" />Back to Search
          </Button>
        </div>
      </div>
    )
  }

  if (ride.owner_id === user?.id) {
    return (
      <div className="min-h-[60vh] pt-32 pb-16 px-6 flex items-center justify-center text-center">
        <div>
          <RouteIcon size={28} className="mx-auto text-[var(--nc-accent)]" />
          <h1 className="mt-4 text-xl font-bold text-[var(--nc-900)]">This is your ride</h1>
          <p className="mt-1.5 text-sm text-[var(--nc-500)]">Manage requests and status from the ride page.</p>
          <Button render={<Link to={`/rides/${ride.id}`} />} className="mt-6 bg-[var(--nc-900)] text-[var(--nc-0)] hover:bg-[var(--nc-800)] cursor-pointer">
            Open ride
          </Button>
        </div>
      </div>
    )
  }

  const isFull = (ride.available_seats ?? 0) <= 0
  const seatPrice = Number(ride.final_cost) || 0
  const bookingStatus = ride.booking_status

  return (
    <div className="pt-20 pb-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link to="/search" className="inline-flex items-center gap-2 text-[var(--nc-500)] text-sm hover:text-[var(--nc-800)] transition-colors cursor-pointer">
          <ArrowLeft size={14} />Back to search
        </Link>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-[var(--nc-900)] text-2xl font-bold tracking-tight">
              {bookingStatus === 'accepted' ? 'Ride confirmed' : booked ? 'Request sent' : 'Confirm your ride'}
            </h1>
            <p className="text-[var(--nc-500)] text-sm">
              {bookingStatus === 'accepted'
                ? 'The driver accepted your request'
                : booked
                  ? 'Waiting for the driver to accept'
                  : 'Review details before requesting a seat'}
            </p>
          </div>
          {(booked || bookingStatus === 'accepted') && <LiveChip />}
        </div>

        <div className="grid md:grid-cols-5 gap-6">
          <div className="md:col-span-3 space-y-4">
            {/* Route visual */}
            <Card className="bg-[var(--nc-200)] border-[var(--nc-300)] border overflow-hidden">
              <div className="h-48 relative flex items-center justify-center">
                <svg viewBox="0 0 400 200" className="w-full h-full" fill="none" role="img" aria-label={`Route from ${ride.from_city} to ${ride.to_city}`}>
                  <path d="M 40 160 Q 120 40, 200 100 T 360 60" stroke="var(--nc-400)" strokeWidth="2" strokeDasharray="6 4" opacity="0.5" />
                  <path d="M 40 160 Q 120 40, 200 100 T 360 60" stroke="var(--nc-accent)" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="40" cy="160" r="6" fill="var(--nc-accent)" />
                  <circle cx="360" cy="60" r="6" fill="var(--nc-500)" />
                  <text x="40" y="182" fill="var(--nc-600)" fontSize="11" textAnchor="middle">{truncate(ride.from_city, 16)}</text>
                  <text x="360" y="46" fill="var(--nc-600)" fontSize="11" textAnchor="middle">{truncate(ride.to_city, 16)}</text>
                </svg>
              </div>
            </Card>

            {/* Route details */}
            <Card className="bg-[var(--nc-200)] border-[var(--nc-300)] border">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-start gap-3">
                  <MapPin size={15} className="text-[var(--nc-accent)] mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[var(--nc-800)] text-sm font-medium break-words">{ride.from_city}</p>
                    <p className="text-[var(--nc-500)] text-xs">Pickup point</p>
                  </div>
                </div>
                <div className="ml-[7px] w-px h-5 bg-[var(--nc-300)]" aria-hidden="true" />
                <div className="flex items-start gap-3">
                  <Navigation size={15} className="text-[var(--nc-500)] mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[var(--nc-800)] text-sm font-medium break-words">{ride.to_city}</p>
                    <p className="text-[var(--nc-500)] text-xs">Drop-off point</p>
                  </div>
                </div>

                <Separator className="bg-[var(--nc-300)]" />

                <div className="grid grid-cols-3 gap-4 text-center">
                  <Meta label="Departs" value={formatRideDateTime(ride.departure_time)} />
                  <Meta
                    label="Distance"
                    value={ride.distance_km != null ? `${Number(ride.distance_km).toFixed(0)} km` : '—'}
                  />
                  <Meta label="Seats left" value={String(ride.available_seats ?? '—')} />
                </div>
              </CardContent>
            </Card>

            <SafetyChecklist />
          </div>

          {/* Right column */}
          <div className="md:col-span-2 space-y-4 md:sticky md:top-24 self-start w-full">
            <DriverCard
              driver={{
                name: ride.driver_name,
                rating: Number(ride.driver_avg_rating) || 0,
                totalRides: ride.driver_total_ratings,
                vehicleMake: ride.brand,
                vehicleModel: ride.model,
                vehiclePlate: ride.vehicle_plate,
              }}
            />

            <Card className="bg-[var(--nc-200)] border-[var(--nc-300)] border">
              <CardContent className="space-y-3 p-5">
                <h3 className="text-[var(--nc-800)] text-base font-semibold flex items-center gap-2">
                  <Wallet size={16} className="text-[var(--nc-500)]" />
                  Fare summary
                </h3>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--nc-600)]">Seat price</span>
                  <FareCounter value={seatPrice} className="text-[var(--nc-800)]" />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--nc-600)]">Seats requested</span>
                  <span className="text-[var(--nc-800)] tabular-nums">1</span>
                </div>
                <Separator className="bg-[var(--nc-300)]" />
                <div className="flex justify-between">
                  <span className="text-[var(--nc-800)] font-semibold">Total</span>
                  <FareCounter value={seatPrice} className="text-[var(--nc-900)] font-bold text-xl" />
                </div>
                <p className="text-[var(--nc-500)] text-xs leading-relaxed">
                  Pay the driver directly — no card needed.
                </p>
              </CardContent>
            </Card>

            {booked || bookingStatus === 'accepted' ? (
              <Card className="bg-[var(--nc-accent-dim)] border border-[var(--nc-accent)]">
                <CardContent className="p-4 flex items-center gap-3">
                  <CheckCircle2 size={20} className="text-[var(--nc-accent)] shrink-0" />
                  <div>
                    <p className="text-[var(--nc-800)] text-sm font-medium">
                      {bookingStatus === 'accepted' ? 'Booking confirmed!' : 'Request sent to driver'}
                    </p>
                    <p className="text-[var(--nc-500)] text-xs">
                      Track it under My Rides → Upcoming
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : isFull ? (
              <Button disabled className="w-full h-12 text-base cursor-not-allowed">
                Ride full
              </Button>
            ) : (
              <Button
                onClick={() => requestMutation.mutate()}
                disabled={requestMutation.isPending}
                className="w-full bg-[var(--nc-900)] text-[var(--nc-0)] hover:bg-[var(--nc-800)] cursor-pointer h-12 text-base"
              >
                {requestMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Sending…
                  </span>
                ) : (
                  <>
                    <CheckCircle2 size={18} className="mr-2" />
                    Request seat — {formatCurrency(seatPrice)}
                  </>
                )}
              </Button>
            )}

            {!booked && !isFull && (
              <p className="text-center text-[var(--nc-500)] text-xs flex items-center justify-center gap-1.5">
                <Clock size={12} />
                Free cancellation until the driver departs
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Meta({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-[var(--nc-500)] text-xs mb-1">{label}</p>
      <p className="text-[var(--nc-800)] text-sm font-semibold tabular-nums truncate">{value}</p>
    </div>
  )
}

function truncate(str, n) {
  if (!str) return ''
  return str.length > n ? `${str.slice(0, n - 1)}…` : str
}
