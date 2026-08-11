import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(useGSAP, ScrollTrigger)

gsap.defaults({ ease: 'expo.out', duration: 0.7 })

export { gsap, useGSAP, ScrollTrigger }
