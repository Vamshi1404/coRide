import PolicyLayout, { PolicyPlaceholder } from '../components/layout/PolicyLayout'

export default function TermsOfService() {
  return (
    <PolicyLayout title="Terms of Service">
      <PolicyPlaceholder>
        We're still writing this one. Our full Terms of Service will be published here shortly.
      </PolicyPlaceholder>
      <PolicyPlaceholder>
        The short version: be kind to the people you share a ride with, pay your driver directly as
        agreed, and remember CoRide connects riders and drivers — it does not own vehicles or employ
        drivers. Ratings keep the community healthy; misuse of the platform can cost you access.
      </PolicyPlaceholder>
    </PolicyLayout>
  )
}
