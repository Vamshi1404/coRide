import PolicyLayout, { PolicyPlaceholder } from '../components/layout/PolicyLayout'

export default function PrivacyPolicy() {
  return (
    <PolicyLayout title="Privacy Policy">
      <PolicyPlaceholder>
        We're still writing this one. Our full Privacy Policy is being finalized and will be
        published here shortly.
      </PolicyPlaceholder>
      <PolicyPlaceholder>
        In the meantime, the data CoRide stores is limited to what the product needs to work: your
        name, email, phone number, vehicles, rides, messages, and ratings. Location data is used
        only while you're sharing your live trip, and chat content stays between you and the other
        people on your ride.
      </PolicyPlaceholder>
    </PolicyLayout>
  )
}
