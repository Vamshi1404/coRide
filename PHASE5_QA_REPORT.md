# CoRide — Phase 5 QA Report

## CSS System

| File | Lines |
|------|-------|
| tokens.css | 424 |
| base.css | 335 |
| layout.css | 447 |
| components.css | 1,926 |
| pages.css | 1,536 |
| states.css | 381 |
| **Total** | **5,049** |

Three-layer token architecture: primitive → semantic → component. Dark-first ("Nocturne") with light-theme overrides via `data-theme="light"`.

## Build Status

- `npm run build` — **PASS** (8.60s)
- `npm run lint` — **PASS** (0 errors, 9 pre-existing warnings)
- CSS output: 149.42 kB (gzip: 24.63 kB)
- JS output: 527.35 kB + 1,177 kB (TomTom maps)

## Route Map

| Route | Component | Auth |
|-------|-----------|------|
| `/` | NocturneHome | Public |
| `/login` | Login | Guest only |
| `/register` | Register | Guest only |
| `/dashboard` | Dashboard | Protected |
| `/search` | SearchRides | Protected |
| `/confirm/:rideId` | ConfirmRide | Protected |
| `/track/:rideId` | TrackRide | Protected |
| `/offer-ride` | OfferRide | Protected |
| `/my-rides` | MyRides | Protected |
| `/rides/:id` | RideDetailPage | Protected |
| `/chats` | ChatPage | Protected |
| `/chat/:rideId` | ChatPage | Protected |
| `/profile` | ProfilePage | Protected |
| `/privacy-policy` | PrivacyPolicy | Public |
| `/terms-of-service` | TermsOfService | Public |
| `*` | NotFound | Public |

**Zero dead links** — all `<Link to>` and `navigate()` targets verified.

## Known Issues Status

| # | Issue | Status |
|---|-------|--------|
| KI#1 | Login "Failed to fetch" on Vercel | **FIXED** — production fallback to `https://coride-backend.onrender.com` in `lib/api.js` |
| KI#2 | Focus ring on whole form blocks | **FIXED** — ring scoped to individual inputs via `box-shadow` |
| KI#3 | Auth pages without split-screen | **FIXED** — split-screen with `AuthVisual` on ≥1024px |
| KI#4 | Hero CTA weak | **FIXED** — prominent `.hero-cta-row` pair with full-width mobile layout |
| KI#5 | Footer uses old classes | **FIXED** — all BEM classes from `layout.css` |
| KI#6 | Whitespace intentional | **CONFIRMED** — deliberate spacing per Apple fluid-interface principles |

## Backend Edits

**None.** All changes are frontend-only per Rule 1 (read-only backend). Narrow presentational-field additions limited to CSS class names in JSX.

## Admin Surface

**Excluded** per Rule 4 — no admin backend exists in the codebase.

## Accessibility

- `prefers-reduced-motion` — all animations disabled, transforms removed
- `prefers-reduced-transparency` — glass surfaces solidified
- `prefers-contrast: more` — borders strengthened, muted text darkened
- `forced-colors` (Windows High Contrast) — system affordances restored
- Keyboard: skip-link, Escape to close modals/bell, focus-visible rings, ARIA attributes
- Form a11y: required markers, error summaries, inline field variant
- Print: ride detail as receipt, chrome hidden

## Responsive Breakpoints

- **480px** — mobile compact
- **640px** — small tablet
- **768px** — tablet
- **900px** — tablet/desktop split (grids collapse)
- **1024px** — desktop (auth split-screen, two-column layouts)
- **1440px** — wide-screen container bump

## Component Integrations

- **AddVehicle** — uses `.seg` / `.seg__opt` segmented control for vehicle type (Car/SUV/Bike)
- **NotificationBell** — uses `.bell-item__icon--{type}` per event kind (request/accepted/rejected/completed/cancelled)
- **ConfirmRide** — uses `.flow-steps` booking stepper
- **All pages** — rewritten onto semantic CSS classes, zero Tailwind/shadcn imports
