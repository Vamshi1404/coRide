import { useRef, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useReducedMotion } from '@/lib/motion/MotionProvider'
import { gsap, useGSAP, ScrollTrigger } from '@/lib/gsapSetup'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { ParallaxImage, ScrollRevealImage, ScrollVideo, HoverZoomImage } from '@/components/ui/MediaComponents'
import {
  Navigation, Clock, MapPin, Zap, ArrowRight,
  Leaf, Users, Star, ShieldCheck, ChevronDown, Search,
  TrendingUp, Heart, Globe,
} from 'lucide-react'

/* ── Real Hyderabad images (Wikimedia Commons / Pexels) ─────────── */
const MEDIA = {
  heroVideo: 'https://videos.pexels.com/video-files/3192473/3192473-hd_1920_1080_30fps.mp4',
  heroPoster: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/CHARMINAR%2C_Hyderabad_01.jpg/1200px-CHARMINAR%2C_Hyderabad_01.jpg',
  gachibowli: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Hyderabad_skyline.jpg/1200px-Hyderabad_skyline.jpg',
  hitec: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Hyderabad_skyline.jpg/1200px-Hyderabad_skyline.jpg',
  secunderabad: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Hyderabad_skyline.jpg/1200px-Hyderabad_skyline.jpg',
  highway: 'https://images.pexels.com/photos/1173777/pexels-photo-1173777.jpeg?w=1200',
  commuters: 'https://images.pexels.com/photos/3727464/pexels-photo-3727464.jpeg?w=800',
  carInterior: 'https://images.pexels.com/photos/3593922/pexels-photo-3593922.jpeg?w=800',
  traffic: 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?w=1200',
  sunset: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Hyderabad_Skyline.jpg/1200px-Hyderabad_Skyline.jpg',
}

const POPULAR_ROUTES = [
  { from: 'Gachibowli', to: 'HITEC City', distance: 7.2 },
  { from: 'Madhapur', to: 'Secunderabad', distance: 18.5 },
  { from: 'Jubilee Hills', to: 'Financial District', distance: 14.1 },
  { from: 'Kondapur', to: 'Cyber Towers', distance: 5.8 },
  { from: 'Ameerpet', to: 'Gachibowli', distance: 12.3 },
  { from: 'Banjara Hills', to: 'HITEC City', distance: 9.4 },
]

const TESTIMONIALS = [
  { name: 'Priya M.', role: 'Daily commuter', text: 'I save ₹4,200 every month on my Gachibowli commute. The community ratings make me feel safe.', rating: 5 },
  { name: 'Arjun K.', role: 'Driver', text: 'I was driving alone anyway. Now I cover my fuel costs and meet great people from my neighborhood.', rating: 5 },
  { name: 'Sneha R.', role: 'Weekly rider', text: 'The real-time tracking is a game changer. I can see exactly when my ride is arriving — no more waiting in the sun.', rating: 5 },
]

export default function NocturneHome() {
  const reducedMotion = useReducedMotion()
  const heroRef = useRef(null)
  const [scrollY, setScrollY] = useState(0)

  // Track scroll for parallax
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Hero GSAP animations
  useGSAP(() => {
    if (reducedMotion) return

    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
    tl.from('.hero-badge', { autoAlpha: 0, y: 20, duration: 0.6 })
      .from('.hero-line', { autoAlpha: 0, y: 50, duration: 1, stagger: 0.12, ease: 'power4.out' }, '-=0.3')
      .from('.hero-sub', { autoAlpha: 0, y: 30, duration: 0.7 }, '-=0.5')
      .from('.hero-route', { autoAlpha: 0, scale: 0.95, duration: 0.8 }, '-=0.4')
      .from('.hero-cta', { autoAlpha: 0, y: 20, duration: 0.6, stagger: 0.1 }, '-=0.5')
      .from('.hero-scroll', { autoAlpha: 0, y: 10, duration: 0.5 }, '-=0.3')

    // Hero parallax on scroll
    ScrollTrigger.create({
      trigger: heroRef.current,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      animation: gsap.to('.hero-core', {
        autoAlpha: 0,
        y: -80,
        ease: 'none',
      }),
    })

    // Stats counter animation
    gsap.utils.toArray('.stat-counter').forEach((el) => {
      const target = parseInt(el.dataset.target, 10)
      const obj = { val: 0 }
      gsap.to(obj, {
        val: target,
        duration: 2,
        ease: 'power4.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        onUpdate: () => { el.textContent = Math.round(obj.val).toLocaleString() },
      })
    })

    // Horizontal scroll for route gallery
    const gallery = document.querySelector('.route-gallery-track')
    if (gallery) {
      const scrollWidth = gallery.scrollWidth - gallery.clientWidth
      gsap.to(gallery, {
        scrollLeft: scrollWidth,
        ease: 'none',
        scrollTrigger: {
          trigger: '.route-gallery',
          start: 'top 60%',
          end: () => `+=${scrollWidth}`,
          scrub: 1,
          pin: true,
        },
      })
    }

    // Parallax sections
    gsap.utils.toArray('.parallax-section').forEach((section) => {
      const img = section.querySelector('.parallax-img')
      if (!img) return
      gsap.fromTo(img, { yPercent: -15 }, {
        yPercent: 15,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      })
    })

    // Section reveals
    gsap.utils.toArray('.gsap-reveal').forEach((el) => {
      gsap.from(el, {
        y: 50,
        opacity: 0,
        duration: 0.9,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 82%',
          once: true,
        },
      })
    })

    // Image clip reveals
    gsap.utils.toArray('.clip-reveal').forEach((el) => {
      gsap.fromTo(el, { clipPath: 'inset(0 0 100% 0)' }, {
        clipPath: 'inset(0 0 0% 0)',
        duration: 1.2,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 80%',
          once: true,
        },
      })
    })
  }, { scope: heroRef })

  return (
    <div ref={heroRef}>
      {/* ═══ Chapter 0 · Immersive Video Hero ═══ */}
      <section className="home-hero">
        {/* Video background with parallax */}
        <div className="hero-video-bg" aria-hidden="true">
          <video
            autoPlay
            muted
            loop
            playsInline
            poster={MEDIA.heroPoster}
            className="hero-video"
            style={{ transform: `translateY(${scrollY * 0.3}px)` }}
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
            <span className="hero-line" style={{ fontSize: '0.55em', color: 'var(--text-secondary)', fontWeight: 400 }}>
              Move smarter.
            </span>
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
            <Link to="/search" className="btn btn--accent btn--xl hero-cta">
              <MapPin size={19} aria-hidden="true" />
              Find a Ride
            </Link>
            <Link to="/offer-ride" className="btn btn--outline btn--xl hero-cta">
              <Navigation size={19} aria-hidden="true" />
              Offer a Ride
            </Link>
          </div>

          <div className="hero-scroll" aria-hidden="true">
            <span>Scroll to explore</span>
            <ChevronDown size={16} className="hero-scroll__chevron" />
          </div>
        </div>
      </section>

      {/* ═══ Chapter 1 · Stats marquee ═══ */}
      <section className="stats-marquee">
        <div className="stats-marquee__track">
          <StatItem icon={<Users size={20} />} value="2,400+" label="Active riders" />
          <StatItem icon={<TrendingUp size={20} />} value="12,000+" label="Rides completed" />
          <StatItem icon={<Star size={20} />} value="4.8" label="Avg. rating" />
          <StatItem icon={<Leaf size={20} />} value="85 tons" label="CO₂ saved" />
          <StatItem icon={<Heart size={20} />} value="15,000+" label="Trees equivalent" />
          <StatItem icon={<Globe size={20} />} value="50+" label="Routes daily" />
          {/* Duplicate for infinite scroll */}
          <StatItem icon={<Users size={20} />} value="2,400+" label="Active riders" />
          <StatItem icon={<TrendingUp size={20} />} value="12,000+" label="Rides completed" />
          <StatItem icon={<Star size={20} />} value="4.8" label="Avg. rating" />
          <StatItem icon={<Leaf size={20} />} value="85 tons" label="CO₂ saved" />
        </div>
      </section>

      {/* ═══ Chapter 2 · Split hero — Why share ═══ */}
      <section className="split-section">
        <div className="container">
          <div className="split-grid">
            <ScrollReveal animation="reveal-left" className="split-text">
              <p className="overline">Why CoRide</p>
              <h2>
                Your daily commute,{' '}
                <span className="text-gradient">reimagined</span>
              </h2>
              <p className="split-desc">
                Every shared seat is one fewer car on the road. We built CoRide for Hyderabad's
                professionals who want safer, cheaper, greener commutes — without the hassle.
              </p>
              <div className="split-stats">
                <div className="split-stat">
                  <span className="split-stat__value">60%</span>
                  <span className="split-stat__label">avg. savings</span>
                </div>
                <div className="split-stat">
                  <span className="split-stat__value">4.8★</span>
                  <span className="split-stat__label">community rating</span>
                </div>
                <div className="split-stat">
                  <span className="split-stat__value">100%</span>
                  <span className="split-stat__label">GPS tracked</span>
                </div>
              </div>
            </ScrollReveal>
            <ScrollRevealImage
              src={MEDIA.commuters}
              alt="Professionals sharing a ride together"
              className="split-image clip-reveal"
            />
          </div>
        </div>
      </section>

      {/* ═══ Chapter 3 · Features with parallax images ═══ */}
      <section className="features-section">
        <div className="container">
          <ScrollReveal animation="reveal-up" className="section-header">
            <p className="overline">Features</p>
            <h2>Everything you need to share rides safely</h2>
            <p className="section-sub">Nothing you don't.</p>
          </ScrollReveal>

          <div className="features-bento">
            <FeatureBento
              icon={Star}
              title="Community ratings"
              description="Drivers and passengers carry ratings from real rides. Choose your co-travellers with confidence."
              image={MEDIA.commuters}
              delay={0}
            />
            <FeatureBento
              icon={Clock}
              title="Real-time tracking"
              description="Follow the driver's live GPS position and traffic-aware ETA on the map."
              image={MEDIA.highway}
              delay={100}
              wide
            />
            <FeatureBento
              icon={Users}
              title="In-app chat"
              description="Coordinate pickup points and timing. Share your live location when it matters."
              image={MEDIA.commuters}
              delay={200}
            />
            <FeatureBento
              icon={Zap}
              title="One-tap requests"
              description="Found a ride? Request a seat instantly. The driver accepts, and you're on the manifest."
              image={MEDIA.carInterior}
              delay={300}
            />
          </div>
        </div>
      </section>

      {/* ═══ Chapter 4 · Parallax image break ═══ */}
      <section className="parallax-section parallax-break">
        <div className="parallax-img" style={{ backgroundImage: `url(${MEDIA.traffic})` }} />
        <div className="parallax-break__overlay">
          <div className="container">
            <ScrollReveal animation="reveal-up">
              <h2 className="parallax-break__title">
                Hyderabad's most commuted corridors
              </h2>
              <p className="parallax-break__sub">
                From Gachibowli to Secunderabad — every major route is covered.
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═══ Chapter 5 · Popular routes horizontal scroll ═══ */}
      <section className="routes-section">
        <div className="container">
          <ScrollReveal animation="reveal-up" className="section-header">
            <p className="overline">Popular Routes</p>
            <h2>Tap a route to search</h2>
          </ScrollReveal>
        </div>
        <div className="route-gallery">
          <div className="route-gallery__track scrollbar-none">
            {POPULAR_ROUTES.map((route, i) => (
              <Link
                key={`${route.from}-${route.to}`}
                to={`/search?from=${encodeURIComponent(route.from)}&to=${encodeURIComponent(route.to)}`}
                className="route-gallery__card"
              >
                <div className="route-gallery__card-img">
                  <img src={i % 2 === 0 ? MEDIA.gachibowli : MEDIA.hitec} alt={`${route.from} to ${route.to}`} loading="lazy" />
                </div>
                <div className="route-gallery__card-body">
                  <span className="route-gallery__card-route">
                    {route.from} → {route.to}
                  </span>
                  <span className="route-gallery__card-dist">{route.distance} km</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Chapter 6 · How it works — visual steps ═══ */}
      <section className="steps-section">
        <div className="container">
          <ScrollReveal animation="reveal-up" className="section-header">
            <p className="overline">How it works</p>
            <h2>Four steps to your next ride</h2>
          </ScrollReveal>

          <div className="steps-grid">
            <StepVisual
              number="01"
              title="Search your route"
              description="Enter your pickup and destination. See open rides from drivers heading your way."
              image={MEDIA.highway}
              delay={0}
            />
            <StepVisual
              number="02"
              title="Request your seat"
              description="Pick a ride and send a request. The driver accepts, and your spot is confirmed."
              image={MEDIA.commuters}
              delay={150}
            />
            <StepVisual
              number="03"
              title="Track live"
              description="On ride day, watch the driver's approach in real time. Chat directly, call if needed."
              image={MEDIA.carInterior}
              delay={300}
            />
            <StepVisual
              number="04"
              title="Rate & repeat"
              description="Pay the driver directly, rate the ride, and keep your daily commute partners."
              image={MEDIA.sunset}
              delay={450}
            />
          </div>
        </div>
      </section>

      {/* ═══ Chapter 7 · Testimonials ═══ */}
      <section className="testimonials-section">
        <div className="container">
          <ScrollReveal animation="reveal-up" className="section-header">
            <p className="overline">Testimonials</p>
            <h2>Loved by Hyderabad's commuters</h2>
          </ScrollReveal>

          <div className="testimonials-grid">
            {TESTIMONIALS.map((t, i) => (
              <ScrollReveal key={t.name} animation="reveal-up" delay={i * 120}>
                <div className="testimonial-card">
                  <div className="testimonial-card__stars" aria-label={`${t.rating} stars`}>
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} size={16} fill="var(--accent-solid)" />
                    ))}
                  </div>
                  <p className="testimonial-card__text">"{t.text}"</p>
                  <div className="testimonial-card__author">
                    <div className="testimonial-card__avatar">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="testimonial-card__name">{t.name}</p>
                      <p className="testimonial-card__role">{t.role}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Chapter 8 · CTA with parallax background ═══ */}
      <section className="cta-section parallax-section">
        <div className="parallax-img" style={{ backgroundImage: `url(${MEDIA.sunset})` }} />
        <div className="cta-overlay">
          <div className="container">
            <ScrollReveal animation="reveal-scale" className="cta-content">
              <h2 className="cta-title">
                Your commute, <span className="text-gradient">reimagined</span>
              </h2>
              <p className="cta-sub">
                Create a free account — offer seats on your drive or find one heading your way.
              </p>
              <div className="cta-actions">
                <Link to="/register" className="btn btn--accent btn--xl">
                  Get Started
                  <ArrowRight size={19} aria-hidden="true" />
                </Link>
              </div>
              <p className="cta-trust">
                <ShieldCheck size={14} aria-hidden="true" />
                Free to join · Rated drivers · Cash or UPI at pickup
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </div>
  )
}

/* ── Sub-components ──────────────────────────────────────────────── */

function StatItem({ icon, value, label }) {
  return (
    <div className="stat-item">
      <span className="stat-item__icon">{icon}</span>
      <span className="stat-item__value">{value}</span>
      <span className="stat-item__label">{label}</span>
    </div>
  )
}

function FeatureBento({ icon: Icon, title, description, image, delay = 0, wide = false }) {
  return (
    <ScrollReveal animation="reveal-up" delay={delay} className={`feature-bento${wide ? ' feature-bento--wide' : ''}`}>
      <div className="feature-bento__img media-hover-zoom">
        <img src={image} alt={title} loading="lazy" />
      </div>
      <div className="feature-bento__body">
        <span className="feature-bento__icon"><Icon size={20} /></span>
        <h3 className="feature-bento__title">{title}</h3>
        <p className="feature-bento__desc">{description}</p>
      </div>
    </ScrollReveal>
  )
}

function StepVisual({ number, title, description, image, delay = 0 }) {
  return (
    <ScrollReveal animation="reveal-up" delay={delay} className="step-visual">
      <div className="step-visual__img clip-reveal">
        <img src={image} alt={title} loading="lazy" />
      </div>
      <div className="step-visual__content">
        <span className="step-visual__num">{number}</span>
        <h3 className="step-visual__title">{title}</h3>
        <p className="step-visual__desc">{description}</p>
      </div>
    </ScrollReveal>
  )
}
