# CoRide Bug Fix & Sync Report

This document explains what was changed in this pass, why each change was made, and how it
affects the app's behavior for end users. It covers a full audit of the frontend/backend
contract, mobile responsiveness, and general bug hunting across the codebase.

## How the audit was done

- Cross-referenced every `api.get/post/patch/put/delete(...)` call in `frontend/src` against
  every `@router.get/post/patch(...)` route in `backend/routers/*.py` to catch drift between
  the two sides.
- Read every backend router fully for auth/authorization gaps, validation gaps, and logic bugs.
- Read every frontend page/component fully to check what's actually wired up vs. what exists
  as dead/orphaned code.
- Verified the fixes end-to-end against a real local PostgreSQL 15 database (schema rebuilt from
  the documented columns), not just by reading code: signup, login, vehicle add, ride publish,
  search, seat request, accept, chat, live location, status transitions, rating, and
  notifications were all exercised with `curl`.
- Ran `npm run build` (added as `check`) and ESLint (newly configured) on the frontend.

## Critical functional bugs fixed

### 1. Drivers had no way to accept/reject ride requests
`RideDetailPage.jsx` never rendered `RequestList`, even though the component and the backend
endpoints (`GET/PATCH /api/requests/...`) existed and worked. A driver opening their own ride
had no accept/reject UI at all — the entire booking approval flow was unreachable from the app.
**Fix:** wired `RequestList` into the driver's view of `RideDetailPage`, with a 5s poll to keep
pending requests current.

### 2. Live GPS tracking never appeared on the ride page
`LiveTracker` (driver GPS broadcast + passenger live map + traffic-aware ETA) was a fully built,
unused component. The "Track Live" button on the ride detail page did nothing — no `onClick`
handler at all. **Fix:** removed the dead button and rendered `LiveTracker` automatically once a
ride is `in_progress`, for both driver and passenger.

### 3. Departure time was wrong by your local UTC offset
`OfferRide.jsx` sent the picked date/time as a naive string (e.g. `2026-07-30T09:00:00`). The
backend treats naive timestamps as UTC. So a driver in Hyderabad (UTC+5:30) picking "9:00 AM"
was actually publishing a ride departing at 9:00 AM UTC = 2:30 PM IST — every published ride's
displayed time was off by 5.5 hours. **Fix:** convert the local date/time to a proper UTC ISO
string (`new Date(...).toISOString()`) before sending it.

### 4. "Cancel Request" button called endpoints that don't exist
`RideDetailPage.jsx`'s cancel flow had a broken fallback path hitting `POST
/api/requests/{id}/cancel` and `PATCH /api/rides/{id}/cancel` — neither exists on the backend, so
these calls always failed silently. The button was also shown to any passenger, even ones with no
active request. **Fix:** the button now only renders when the user actually has a booking, and
it calls the one correct endpoint (`PATCH /api/requests/{booking_id}?status=cancelled`).

### 5. `completed_rides` / `cancelled_rides` were silently dropped from the logged-in user object
`POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/auth/me`, and `PATCH /api/profile` all
excluded these two columns from their response, even though they exist on `users` and are the
values the "Quick Stats" card on the dashboard needs. Only the never-called `GET /api/profile`
included them. **Fix:** all four endpoints now include `completed_rides` and `cancelled_rides`,
and `Dashboard.jsx`'s "Rides Completed" stat (previously hardcoded to `0`) now reads
`user.completed_rides`. Verified end-to-end: after completing a test ride, `/api/auth/login`
correctly returned `completed_rides: 1`.

### 6. Backend crash: viewing chats for a user with a mix of chatted/un-chatted rides
`GET /api/chat/conversations/list` sorted results with `x.get("last_message_time") or ""`. Since
`last_message_time` is a `datetime` for rides with messages and the fallback is a plain string,
Python raises `TypeError: '<' not supported between instances of 'str' and 'datetime.datetime'`
as soon as the list contains both a ride with messages and one without — a very common real-world
case (e.g. a new ride with no chat yet, next to an older one with messages). This was a 500 error
on the Chats page. **Fix:** fallback to `datetime.min` (timezone-aware) instead of `""`, so all
values compare consistently.

### 7. Security: anyone could post into any ride's chat
`POST /api/chat/{ride_id}` (send message) had no participant/owner check — only `GET` did. Any
authenticated user could send messages into a ride they had nothing to do with. **Fix:** added
the same participant/owner check used by the read endpoint before inserting a message.

## Other backend hardening

- **Ride status transitions weren't validated.** An owner could flip a `completed` or `cancelled`
  ride back to `open`/`in_progress` via `PATCH /api/rides/{id}/status`, re-triggering passenger
  notifications incorrectly. Added an explicit transition table (`open → in_progress/cancelled`,
  `in_progress → completed/cancelled`, terminal states go nowhere).
- **No validation on ride creation numbers.** `total_seats` and `final_cost` had no lower bound,
  so a ride could be created with 0/negative seats or a negative fare. Added `Field(gt=0)`.
- **`CORS_ORIGINS` default was `"http://localhost:5173,*"` combined with `allow_credentials=True`.**
  Wildcard + credentials is a footgun (Starlette will reflect any origin back once credentials are
  allowed). Removed the `*` from the code default. Note: `render.yaml` still explicitly sets
  `CORS_ORIGINS=*` for the deployed backend — that's a deployment config value, not something this
  patch changes, since guessing the real production frontend URL risked breaking the live
  deployment. Worth setting explicitly to the actual Vercel URL when convenient.
- **Minor info leak in incremental polling.** `after_id` lookups for chat messages and
  notifications queried `WHERE id = $1` only, without scoping to the ride/user — meaning a
  crafted `after_id` for someone else's message/notification would leak its timestamp (not
  content). Scoped both lookups to the requesting user/ride.

## Frontend cleanup

- **Mobile nav active state was broken.** The mobile drawer's `NavLink`s used a static string
  `className="mobile-nav-item"`. In React Router v6, passing a string (instead of the
  `({isActive}) => ...` function form) disables the automatic active-class behavior, so the
  currently-open page was never highlighted in the mobile menu, even though the desktop nav did
  this correctly. Fixed to use the same function form on both.
- **Dead files removed** (confirmed via repo-wide grep that nothing imports them):
  `components/auth/Login.jsx`, `components/auth/Register.jsx`, `components/rides/RideCard.jsx`,
  `components/rides/PublishRide.jsx` (superseded by `pages/Login.jsx`, `pages/Register.jsx`,
  `pages/OfferRide.jsx`), plus `hooks/useRealtime.js` and `lib/supabase.js` (Supabase Realtime was
  never actually wired up — the DB is accessed directly via `asyncpg`, not the JS client). Removed
  the now-unused `@supabase/supabase-js` dependency from `package.json`.
- **Removed a non-functional typing indicator and emoji button in chat.** `isTyping` in
  `ChatWindow.jsx` was `set` but never actually flipped to `true` by anything (no backend support
  for it exists), so the "is typing..." UI was permanently dead code; same for a mood/emoji button
  with no handler. Removed rather than leaving unreachable UI in place.

## Tooling added (none of this existed before)

- `frontend/eslint.config.js` — flat ESLint config for React (hooks rules + JSX-aware
  `no-unused-vars`, `react/prop-types` and `no-unescaped-entities` intentionally turned off since
  this codebase uses plain JS/JSX with no PropTypes or TypeScript anywhere, and turning those on
  would require annotating every component from scratch rather than fixing an actual bug).
- `package.json` scripts: `"check": "vite build"` (there's no TypeScript, so a production build is
  the meaningful static-correctness check) and `"lint": "eslint ."`.
- Result: `npm run check` builds cleanly; `npm run lint` reports 0 errors, 10 warnings (all
  `react-hooks/exhaustive-deps` on intentionally-limited effect dependency arrays — a common,
  safe pattern here since the omitted values are stable per the effect's own lifecycle, not a bug).

## Mobile / hamburger menu

The responsive hamburger nav (`Navbar.jsx` + CSS in `index.css`) was already correctly
implemented (`.desktop-only` hidden and `.mobile-menu-btn` shown under 768px, drawer
open/close state, closes automatically on route change). The only real defect found here was the
active-link highlighting bug described above. No headless browser was available in this
environment to visually screenshot the app, so this was verified by reading the CSS breakpoints
and component logic, not by rendering it — worth a manual look on a phone/DevTools device
emulator before considering it fully done.

## Explicitly left alone (and why)

- **Seat-count decrement / participant insert / rating aggregation "DB triggers".** The code
  comments (`# DB triggers handle seat management`) and the architecture doc both indicate the
  real Supabase database has triggers for these outside this repo. Adding application-level
  logic for these would risk double-counting if those triggers already exist in production. My
  local end-to-end test created its own equivalent triggers purely to validate the API layer
  (request/accept/rating flows worked correctly against them) — that test schema is not part of
  this patch.
- **JWT dev secret fallback** (`config.py`) — left the default in place for local-dev convenience;
  already flagged in the README as a placeholder to change in production.
