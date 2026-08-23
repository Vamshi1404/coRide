import { useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useReducedMotion } from '@/lib/motion/MotionProvider'
import { gsap, useGSAP, ScrollTrigger } from '@/lib/gsapSetup'
import { ScrollReveal, CountUp } from '@/components/ui/ScrollReveal'
import {
  Navigation, Clock, MapPin, ArrowRight, ChevronDown, Search,
  Users, Star, ShieldCheck, Leaf, Globe, TrendingUp, Heart,
  Route as RouteIcon, MessageCircle,
} from 'lucide-react'

/* ═══════════════════════════════════════════════════════════════════
   VERIFIED MEDIA — Real Hyderabad imagery
   ═══════════════════════════════════════════════════════════════════ */
const MEDIA = {
  heroVideo: 'https://videos.pexels.com/video-files/2103099/2103099-hd_1920_1080_30fps.mp4',
  heroPoster: 'https://commons.wikimedia.org/wiki/Special:FilePath/CHARMINAR,_Hyderabad_01.jpg?width=1600',
  golconda: 'https://commons.wikimedia.org/wiki/Special:FilePath/Golconda_Fort,_Hyderabad.jpg?width=1200',
  birla: 'https://commons.wikimedia.org/wiki/Special:FilePath/Birla_Mandir_in_Hyderabad,_2015.JPG?width=1200',
  hussainsagar: 'https://commons.wikimedia.org/wiki/Special:FilePath/Hussain_sagar_sunset.jpg?width=1200',
  buddha: 'https://commons.wikimedia.org/wiki/Special:FilePath/Buddha_statue_11102016.jpg?width=1200',
  meccamasjid: 'https://commons.wikimedia.org/wiki/Special:FilePath/Mecca_Masjid_Hyderabad.JPG?width=1200',
  charminarNight: 'https://images.pexels.com/photos/9025814/pexels-photo-9025814.jpeg?w=1200&fit=crop&auto=compress',
  highway: 'https://images.pexels.com/photos/1173777/pexels-photo-1173777.jpeg?w=1200',
  commuters: 'https://images.pexels.com/photos/3727464/pexels-photo-3727464.jpeg?w=800',
  carInterior: 'https://images.pexels.com/photos/3593922/pexels-photo-3593922.jpeg?w=800',
  sunsetHero: 'https://commons.wikimedia.org/wiki/Special:FilePath/Hussain_sagar_sunset.jpg?width=1600',
  skyline: 'https://commons.wikimedia.org/wiki/Special:FilePath/Hyderabad_skyline.jpg?width=1600',
}

const ROUTE_CARDS = [
  { from: 'Golconda', to: 'HITEC City', dist: 22, img: MEDIA.golconda },
  { from: 'Birla Mandir', to: 'Financial District', dist: 14, img: MEDIA.birla },
  { from: 'Hussain Sagar', to: 'Gachibowli', dist: 11, img: MEDIA.hussainsagar },
  { from: 'Buddha Statue', to: 'Secunderabad', dist: 18, img: MEDIA.buddha },
  { from: 'Laad Bazaar', to: 'Madhapur', dist: 13, img: MEDIA.meccamasjid },
  { from: 'Charminar', to: 'Kondapur', dist: 15, img: MEDIA.charminarNight },
]

const TESTIMONIALS = [
  { name: 'Priya M.', role: 'Software Engineer', text: 'I save ₹4,200 monthly on my Gachibowli commute. The community ratings make it feel safe.', rating: 5 },
  { name: 'Arjun K.', role: 'Product Manager', text: "Met my regular carpool伙伴 through CoRide. The live GPS tracking means I'm never waiting in the dark.", rating: 5 },
  { name: 'Sneha R.', role: 'Data Analyst', text: "Offering rides on my daily route is effortless. I cover my fuel cost and help reduce Hyderabad's traffic.", rating: 5 },
]

const STORY_STEPS = [
  { label: 'Find someone going your way.', accent: 'Search open seats by route.' },
  { label: 'Share the journey.', accent: 'Coordinate pickups in real time.' },
  { label: 'Split the cost.', accent: 'Pay less. Earn more. Drive smarter.' },
  { label: 'Get there together.', accent: 'Community-rated, GPS-tracked rides.' },
]

/* ═══════════════════════════════════════════════════════════════════
   SCROLL PROGRESS — Thin orange route line on viewport edge
   ═══════════════════════════════════════════════════════════════════ */
function ScrollProgress() {
  const ref = useRef(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return
    const el = ref.current
    if (!el) return
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight
      const pct = h > 0 ? (window.scrollY / h) * 100 : 0
      el.style.height = `${pct}%`
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [reduced])

  return (
    <div className="scroll-progress" aria-hidden="true">
      <div ref={ref} className="scroll-progress__fill" />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   ROUTE SVG — Animated route line drawing
   ═══════════════════════════════════════════════════════════════════ */
function RouteLineSVG({ from, to, className = '' }) {
  const pathRef = useRef(null)

  useEffect(() => {
    const path = pathRef.current
    if (!path) return
    const length = path.getTotalLength()
    path.style.strokeDasharray = length
    path.style.strokeDashoffset = length

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          gsap.to(path, {
            strokeDashoffset: 0,
            duration: 1.8,
            ease: 'power2.inOut',
          })
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(path)
    return () => observer.disconnect()
  }, [])

  return (
    <svg className={`route-svg ${className}`} viewBox="0 0 200 120" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="routeGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--accent-solid)" />
          <stop offset="100%" stopColor="var(--accent-solid)" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      <circle cx="20" cy="60" r="6" fill="var(--accent-solid)" />
      <circle cx="180" cy="60" r="6" fill="var(--text-muted)" />
      <path
        ref={pathRef}
        d="M26 60 C 60 20, 100 100, 174 60"
        stroke="url(#routeGrad)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <text x="20" y="90" fill="var(--text-secondary)" fontSize="9" fontFamily="inherit">{from}</text>
      <text x="180" y="90" fill="var(--text-secondary)" fontSize="9" fontFamily="inherit" textAnchor="end">{to}</text>
    </svg>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
export default function NocturneHome() {
  const heroRef = useRef(null)
  const storyRef = useRef(null)
  const hScrollRef = useRef(null)
  const ctaRef = useRef(null)
  const reduced = useReducedMotion()

  /* ── Hero entrance + scroll-driven video ─────────────────────────── */
  useGSAP(() => {
    if (reduced) return

    // Hero entrance timeline
    const heroTl = gsap.timeline()
    heroTl
      .from('.hero-badge', { autoAlpha: 0, y: 20, duration: 0.6 })
      .from('.hero-line', { autoAlpha: 0, y: 40, stagger: 0.15, duration: 0.7 }, '-=0.3')
      .from('.hero-sub', { autoAlpha: 0, y: 20, duration: 0.5 }, '-=0.3')
      .from('.hero-route', { autoAlpha: 0, y: 20, duration: 0.5 }, '-=0.2')
      .from('.hero-cta-row', { autoAlpha: 0, y: 16, duration: 0.5 }, '-=0.2')
      .from('.hero-scroll', { autoAlpha: 0, duration: 0.4 }, '-=0.1')

    // Hero scroll-driven: video scales, text fades, parallax
    ScrollTrigger.create({
      trigger: '.home-hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 0.5,
      onUpdate: (self) => {
        const p = self.progress
        // Video scale
        const video = document.querySelector('.hero-video')
        if (video) {
          video.style.transform = `scale(${1 + p * 0.15}) translateY(${p * -30}px)`
        }
        // Hero core fade + rise
        const core = document.querySelector('.hero-core')
        if (core) {
          core.style.opacity = 1 - p * 1.8
          core.style.transform = `translateY(${p * -60}px)`
        }
        // Overlay darkens
        const overlay = document.querySelector('.hero-video-overlay')
        if (overlay) {
          overlay.style.opacity = 0.45 + p * 0.35
        }
      },
    })

    // Stats marquee entrance
    ScrollTrigger.create({
      trigger: '.stats-marquee',
      start: 'top 85%',
      once: true,
      onEnter: () => gsap.from('.stat-item', { autoAlpha: 0, y: 20, stagger: 0.08, duration: 0.5 }),
    })

    // Section reveals — all major sections
    gsap.utils.toArray('.gsap-reveal').forEach((el) => {
      gsap.from(el, {
        y: 50,
        autoAlpha: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 82%', once: true },
      })
    })

    // Clip reveals for images
    gsap.utils.toArray('.clip-reveal').forEach((el) => {
      gsap.fromTo(el,
        { clipPath: 'inset(0 0 100% 0)' },
        {
          clipPath: 'inset(0 0 0% 0)',
          duration: 1.2,
          ease: 'power4.out',
          scrollTrigger: { trigger: el, start: 'top 80%', once: true },
        }
      )
    })

    // Parallax images
    gsap.utils.toArray('.parallax-img').forEach((img) => {
      gsap.fromTo(img,
        { yPercent: -15 },
        { yPercent: 15, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }
      )
    })

    // Pinned storytelling section
    const storyEl = storyRef.current
    if (storyEl) {
      const steps = storyEl.querySelectorAll('.story-step')
      const visual = storyEl.querySelector('.story-visual')

      // Pin the entire story section
      ScrollTrigger.create({
        trigger: storyEl,
        start: 'top top',
        end: `+=${steps.length * 100}%`,
        pin: true,
        scrub: 0.3,
        onUpdate: (self) => {
          const p = self.progress
          const idx = Math.min(Math.floor(p * steps.length), steps.length - 1)

          steps.forEach((step, i) => {
            if (i === idx) {
              step.style.opacity = '1'
              step.style.transform = 'translateY(0)'
            } else {
              step.style.opacity = '0'
              step.style.transform = i < idx ? 'translateY(-30px)' : 'translateY(30px)'
            }
          })

          // Visual subtle shift
          if (visual) {
            visual.style.transform = `scale(${1 + p * 0.05})`
          }
        },
      })
    }

    // Horizontal scroll section
    const hScroll = hScrollRef.current
    if (hScroll) {
      const track = hScroll.querySelector('.hscroll-track')
      if (track) {
        const totalScroll = track.scrollWidth - hScroll.offsetWidth
        gsap.to(track, {
          x: -totalScroll,
          ease: 'none',
          scrollTrigger: {
            trigger: hScroll,
            start: 'top top',
            end: `+=${totalScroll}`,
            pin: true,
            scrub: 1,
            anticipatePin: 1,
          },
        })
      }
    }

    // CTA section reveal
    if (ctaRef.current) {
      gsap.from(ctaRef.current.querySelectorAll('.cta-reveal'), {
        y: 40,
        autoAlpha: 0,
        stagger: 0.12,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: { trigger: ctaRef.current, start: 'top 75%', once: true },
      })
    }

    // Route card images — staggered reveal
    gsap.utils.toArray('.route-gallery__card').forEach((card, i) => {
      gsap.from(card, {
        autoAlpha: 0,
        y: 30,
        duration: 0.5,
        delay: i * 0.08,
        ease: 'power2.out',
        scrollTrigger: { trigger: card, start: 'top 88%', once: true },
      })
    })

    // Feature bento cards
    gsap.utils.toArray('.feature-bento').forEach((card, i) => {
      gsap.from(card, {
        autoAlpha: 0,
        y: 40,
        scale: 0.97,
        duration: 0.6,
        delay: i * 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: card, start: 'top 85%', once: true },
      })
    })

    // Testimonial cards
    gsap.utils.toArray('.testimonial-card').forEach((card, i) => {
      gsap.from(card, {
        autoAlpha: 0,
        y: 30,
        duration: 0.5,
        delay: i * 0.1,
        ease: 'power2.out',
        scrollTrigger: { trigger: card, start: 'top 85%', once: true },
      })
    })

  }, { scope: heroRef })

  return (
    <div ref={heroRef}>
      <ScrollProgress />

      {/* ═══ SECTION 1 · Hero — Cinematic opening ═══ */}
      <section className="home-hero">
        <div className="hero-video-bg" aria-hidden="true">
          <video
            autoPlay
            muted
            loop
            playsInline
            poster={MEDIA.heroPoster}
            className="hero-video"
          >
            <source src={MEDIA.heroVideo} type="video/mp4" />
          </video>
          <div className="hero-video-overlay" />
        </div>

        <div className="hero-core">
          <p className="hero-badge">
            <span className="hero-badge__dot" aria-hidden="true" />
            Live now in Hyderabad
          </p>

          <h1 className="hero-title">
            <span className="hero-line">Ride</span>
            <span className="hero-line hero-line--accent">together.</span>
          </h1>

          <p className="hero-sub">
            Carpooling for professionals. Community-rated drivers, real-time GPS
            tracking, and a commute that costs less — for you and the planet.
          </p>

          <div className="hero-route">
            <div className="hero-route__card">
              <div className="hero-route__input">
                <MapPin size={16} className="hero-route__icon" />
                <span>From where?</span>
              </div>
              <div className="hero-route__divider" />
              <div className="hero-route__input">
                <Navigation size={16} className="hero-route__icon hero-route__icon--dest" />
                <span>To where?</span>
              </div>
              <Link to="/search" className="hero-route__btn">
                <Search size={18} />
              </Link>
            </div>
          </div>

          <div className="hero-cta-row">
            <MagneticButton>
              <Link to="/search" className="btn btn--accent btn--xl hero-cta">
                <MapPin size={19} aria-hidden="true" />
                Find a Ride
              </Link>
            </MagneticButton>
            <MagneticButton>
              <Link to="/offer-ride" className="btn btn--outline btn--xl hero-cta">
                <Navigation size={19} aria-hidden="true" />
                Offer a Ride
              </Link>
            </MagneticButton>
          </div>

          <div className="hero-scroll" aria-hidden="true">
            <span>Scroll to explore</span>
            <ChevronDown size={16} className="hero-scroll__chevron" />
          </div>
        </div>
      </section>

      {/* ═══ SECTION 2 · Stats marquee ═══ */}
      <section className="stats-marquee">
        <div className="stats-marquee__track">
          <StatItem icon={<Users size={20} />} value="2,400+" label="Active riders" />
          <StatItem icon={<TrendingUp size={20} />} value="12,000+" label="Rides completed" />
          <StatItem icon={<Star size={20} />} value="4.8" label="Avg. rating" />
          <StatItem icon={<Leaf size={20} />} value="85 tons" label="CO₂ saved" />
          <StatItem icon={<Heart size={20} />} value="15,000+" label="Trees equivalent" />
          <StatItem icon={<Globe size={20} />} value="50+" label="Routes daily" />
          <StatItem icon={<Users size={20} />} value="2,400+" label="Active riders" />
          <StatItem icon={<TrendingUp size={20} />} value="12,000+" label="Rides completed" />
          <StatItem icon={<Star size={20} />} value="4.8" label="Avg. rating" />
          <StatItem icon={<Leaf size={20} />} value="85 tons" label="CO₂ saved" />
        </div>
      </section>

      {/* ═══ SECTION 3 · Route reveal — Animated SVG route ═══ */}
      <section className="route-reveal-section">
        <div className="container">
          <div className="gsap-reveal" style={{ textAlign: 'center', marginBottom: 'var(--p-space-3xl)' }}>
            <p className="overline">Your route. Your people. One ride.</p>
            <h2 className="section-heading">Every corridor, connected</h2>
            <p className="section-sub">
              From Golconda to Gachibowli, every major Hyderabad route is covered.
            </p>
          </div>

          <div className="route-reveal-grid">
            <RouteLineSVG from="LB Nagar" to="HITEC City" className="route-reveal-grid__item" />
            <RouteLineSVG from="Secunderabad" to="Gachibowli" className="route-reveal-grid__item" />
            <RouteLineSVG from="Kondapur" to="Financial District" className="route-reveal-grid__item" />
            <RouteLineSVG from="Madhapur" to="HITEC City" className="route-reveal-grid__item" />
          </div>
        </div>
      </section>

      {/* ═══ SECTION 4 · Split — Why share ═══ */}
      <section className="split-section">
        <div className="container">
          <div className="split-grid">
            <div className="split-content gsap-reveal">
              <p className="overline">Share the journey</p>
              <h2 className="section-heading" style={{ marginBottom: 'var(--p-space-lg)' }}>
                The city is already moving.
              </h2>
              <p className="section-sub">
                Hyderabad's corridors are full of single-occupancy cars. Every empty seat is an
                opportunity — to save money, reduce congestion, and connect with fellow commuters.
              </p>
              <div className="split-stats">
                <div className="split-stat">
                  <span className="split-stat__value">73%</span>
                  <span className="split-stat__label">of daily commuters drive alone</span>
                </div>
                <div className="split-stat">
                  <span className="split-stat__value">₹4,200</span>
                  <span className="split-stat__label">average monthly savings</span>
                </div>
              </div>
            </div>
            <div className="split-image clip-reveal">
              <img src={MEDIA.highway} alt="Hyderabad highway traffic at dusk" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 5 · Pinned storytelling — The journey ═══ */}
      <section className="story-section" ref={storyRef}>
        <div className="story-visual" aria-hidden="true">
          <img src={MEDIA.sunsetHero} alt="" loading="lazy" />
          <div className="story-visual__overlay" />
          <RouteLineSVG from="" to="" className="story-route-overlay" />
        </div>
        <div className="story-text">
          {STORY_STEPS.map((step, i) => (
            <div key={i} className="story-step">
              <span className="story-step__number">0{i + 1}</span>
              <h3 className="story-step__label">{step.label}</h3>
              <p className="story-step__accent">{step.accent}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ SECTION 6 · Popular routes gallery ═══ */}
      <section className="routes-section">
        <div className="container">
          <div className="gsap-reveal" style={{ marginBottom: 'var(--p-space-xl)' }}>
            <p className="overline">Popular Routes</p>
            <h2 className="section-heading">Tap a route to search</h2>
          </div>
        </div>
        <div className="route-gallery">
          <div className="route-gallery__track scrollbar-none">
            {ROUTE_CARDS.map((route) => {
              const handleTilt = (e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const x = (e.clientX - rect.left) / rect.width - 0.5
                const y = (e.clientY - rect.top) / rect.height - 0.5
                e.currentTarget.style.transform = `perspective(600px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) scale(1.02)`
              }
              const resetTilt = (e) => {
                e.currentTarget.style.transform = 'perspective(600px) rotateY(0) rotateX(0) scale(1)'
              }
              return (
                <Link
                  key={`${route.from}-${route.to}`}
                  to={`/search?from=${encodeURIComponent(route.from)}&to=${encodeURIComponent(route.to)}`}
                  className="route-gallery__card"
                  onMouseMove={handleTilt}
                  onMouseLeave={resetTilt}
                  style={{ transition: 'transform 300ms var(--ease-soft)', transformStyle: 'preserve-3d' }}
                >
                  <div className="route-gallery__card-img">
                    <img src={route.img} alt={`${route.from} to ${route.to}`} loading="lazy" />
                  </div>
                  <div className="route-gallery__card-body">
                    <span className="route-gallery__card-route">{route.from} → {route.to}</span>
                    <span className="route-gallery__card-dist">{route.dist} km</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══ SECTION 7 · Features bento ═══ */}
      <section className="features-section">
        <div className="container">
          <div className="gsap-reveal" style={{ textAlign: 'center', marginBottom: 'var(--p-space-3xl)' }}>
            <p className="overline">Why CoRide</p>
            <h2 className="section-heading">Built for Hyderabad commuters</h2>
          </div>
          <div className="features-bento">
            <FeatureBento
              icon={<ShieldCheck size={20} />}
              title="Community Rated"
              desc="Every driver and passenger is rated. You always know who you're riding with."
              img={MEDIA.commuters}
              wide
            />
            <FeatureBento
              icon={<Navigation size={20} />}
              title="Live GPS Tracking"
              desc="Watch your driver approach in real time. Share your location with trusted contacts."
              img={MEDIA.carInterior}
            />
            <FeatureBento
              icon={<MessageCircle size={20} />}
              title="In-App Chat"
              desc="Coordinate pickups, share landmarks, and stay connected without sharing personal numbers."
              img={MEDIA.charminarNight}
            />
          </div>
        </div>
      </section>

      {/* ═══ SECTION 8 · Horizontal scroll moment ═══ */}
      <section className="hscroll-section" ref={hScrollRef}>
        <div className="hscroll-track">
          {[
            { word: 'RIDE', desc: 'Find open seats on routes you travel daily.' },
            { word: 'CONNECT', desc: 'Match with verified commuters heading your way.' },
            { word: 'SHARE', desc: 'Split fuel costs. Reduce emissions. Ease congestion.' },
            { word: 'ARRIVE', desc: 'Reach your destination with money and time saved.' },
          ].map((item, i) => (
            <div key={i} className="hscroll-card">
              <span className="hscroll-card__number">0{i + 1}</span>
              <h3 className="hscroll-card__word">{item.word}</h3>
              <p className="hscroll-card__desc">{item.desc}</p>
              <div className="hscroll-card__line" />
            </div>
          ))}
        </div>
      </section>

      {/* ═══ SECTION 9 · How it works ═══ */}
      <section className="steps-section">
        <div className="container">
          <div className="gsap-reveal" style={{ textAlign: 'center', marginBottom: 'var(--p-space-3xl)' }}>
            <p className="overline">How it works</p>
            <h2 className="section-heading">Four steps to your next ride</h2>
          </div>
          <div className="steps-grid">
            <StepVisual number="01" title="Search your route" description="Enter your pickup and destination. See open rides from drivers heading your way." image={MEDIA.highway} delay={0} />
            <StepVisual number="02" title="Request your seat" description="Pick a ride and send a request. The driver accepts, and your spot is confirmed." image={MEDIA.commuters} delay={150} />
            <StepVisual number="03" title="Track live" description="On ride day, watch the driver's approach in real time. Chat directly, call if needed." image={MEDIA.carInterior} delay={300} />
            <StepVisual number="04" title="Rate & repeat" description="Pay the driver directly, rate the ride, and keep your daily commute partners." image={MEDIA.charminarNight} delay={450} />
          </div>
        </div>
      </section>

      {/* ═══ SECTION 10 · Testimonials ═══ */}
      <section className="testimonials-section">
        <div className="container">
          <div className="gsap-reveal" style={{ textAlign: 'center', marginBottom: 'var(--p-space-3xl)' }}>
            <p className="overline">Testimonials</p>
            <h2 className="section-heading">Loved by Hyderabad's commuters</h2>
          </div>
          <div className="testimonials-grid">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="testimonial-card">
                <div className="testimonial-card__stars">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" aria-hidden="true" />
                  ))}
                </div>
                <p className="testimonial-card__text">{t.text}</p>
                <div className="testimonial-card__author">
                  <span className="avatar avatar--sm">{t.name[0]}</span>
                  <div>
                    <p className="testimonial-card__name">{t.name}</p>
                    <p className="testimonial-card__role">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECTION 11 · Final CTA ═══ */}
      <section className="cta-section parallax-section" ref={ctaRef}>
        <div className="parallax-img" style={{ backgroundImage: `url(${MEDIA.sunsetHero})` }} />
        <div className="parallax-section__overlay" />
        <div className="parallax-section__content">
          <h2 className="cta-reveal" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 'var(--p-weight-bold)', letterSpacing: 'var(--p-tracking-tighter)', color: 'var(--text-strong)', marginBottom: 'var(--p-space-md)' }}>
            Ready to ride together?
          </h2>
          <p className="cta-reveal" style={{ color: 'var(--text-secondary)', maxWidth: '45ch', margin: '0 auto var(--p-space-2xl)' }}>
            Join thousands of Hyderabad commuters who save money, reduce their carbon footprint, and enjoy a better daily commute.
          </p>
          <div className="cta-reveal" style={{ display: 'flex', gap: 'var(--p-space-md)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <MagneticButton>
              <Link to="/search" className="btn btn--accent btn--xl">
                <MapPin size={19} aria-hidden="true" />
                Find a Ride
              </Link>
            </MagneticButton>
            <MagneticButton>
              <Link to="/offer-ride" className="btn btn--outline btn--xl">
                <Navigation size={19} aria-hidden="true" />
                Offer a Ride
              </Link>
            </MagneticButton>
          </div>
        </div>
      </section>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════════ */

function MagneticButton({ children, strength = 0.3 }) {
  const ref = useRef(null)
  const handleMove = (e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left - rect.width / 2) * strength
    const y = (e.clientY - rect.top - rect.height / 2) * strength
    el.style.transform = `translate(${x}px, ${y}px)`
  }
  const handleLeave = () => { if (ref.current) ref.current.style.transform = 'translate(0, 0)' }
  return (
    <span ref={ref} className="magnetic-wrap" onMouseMove={handleMove} onMouseLeave={handleLeave}>
      {children}
    </span>
  )
}

function StatItem({ icon, value, label }) {
  return (
    <div className="stat-item">
      <span className="stat-item__icon">{icon}</span>
      <span className="stat-item__value">{value}</span>
      <span className="stat-item__label">{label}</span>
    </div>
  )
}

function FeatureBento({ icon, title, desc, img, wide }) {
  return (
    <div className={`feature-bento${wide ? ' feature-bento--wide' : ''}`}>
      {img && (
        <div className="feature-bento__img">
          <img src={img} alt="" loading="lazy" />
        </div>
      )}
      <div className="feature-bento__body">
        <span className="feature-bento__icon">{icon}</span>
        <h3 className="feature-bento__title">{title}</h3>
        <p className="feature-bento__desc">{desc}</p>
      </div>
    </div>
  )
}

function StepVisual({ number, title, description, image, delay }) {
  return (
    <div className="step-visual" style={{ transitionDelay: `${delay}ms` }}>
      <div className="step-visual__img clip-reveal">
        <img src={image} alt="" loading="lazy" />
      </div>
      <div className="step-visual__body">
        <span className="step-visual__number">{number}</span>
        <h3 className="step-visual__title">{title}</h3>
        <p className="step-visual__desc">{description}</p>
      </div>
    </div>
  )
}
