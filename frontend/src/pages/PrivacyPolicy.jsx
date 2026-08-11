import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsapSetup'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPolicy() {
  const pageRef = useRef(null)
  const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useGSAP(() => {
    if (reducedMotion) return
    gsap.from('.policy-title', { autoAlpha: 0, y: 20, duration: 0.5, ease: 'power2.out' })
    gsap.from('.policy-content', { autoAlpha: 0, y: 20, duration: 0.5, delay: 0.1, ease: 'power2.out' })
    gsap.from('.policy-footer', { autoAlpha: 0, y: 20, duration: 0.5, delay: 0.2, ease: 'power2.out' })
  }, { scope: pageRef })

  return (
    <main className="policy-page" ref={pageRef}>
      <div className="policy-container">
        <h1 className="policy-title">
          Privacy Policy
        </h1>

        <div className="policy-content">
          <p className="policy-placeholder">We're still writing this one</p>
          <p className="policy-subtext">
            Our full Privacy Policy is being finalized and will be published
            here shortly. In the meantime, your data is handled with the same
            care and security CoRide promises everywhere else in the app.
          </p>
        </div>

        <div className="policy-footer">
          <Link to="/" className="policy-back-link">
            <ArrowLeft size={18} />
            Back to Home
          </Link>
        </div>
      </div>

      <style>{`
        .policy-back-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border-radius: 999px;
          background: transparent;
          border: 1px solid color-mix(in srgb, var(--primary) 30%, transparent);
          color: var(--primary);
          font-weight: 500;
          font-size: 0.95rem;
          text-decoration: none;
          transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
        }

        .policy-back-link:hover {
          background: var(--primary);
          border-color: var(--primary);
          color: #ffffff;
          transform: translateX(-2px);
        }

        .policy-back-link:active {
          transform: translateX(-1px) scale(0.98);
        }

        .policy-back-link svg {
          transition: transform 0.2s ease;
        }

        .policy-back-link:hover svg {
          transform: translateX(-3px);
        }
      `}</style>
    </main>
  )
}
