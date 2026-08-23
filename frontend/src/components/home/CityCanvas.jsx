import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Line, Float } from '@react-three/drei'
import * as THREE from 'three'

/*
 * CoRide City Canvas — Abstract Hyderabad route network
 *
 * Dark field with glowing nodes, animated route lines,
 * and floating particles. Scroll-driven camera movement.
 */

const LOCATIONS = [
  { name: 'LB Nagar', pos: [2.2, -0.8, 0], color: '#f97316' },
  { name: 'Dilsukhnagar', pos: [1.4, -0.4, 0], color: '#f97316' },
  { name: 'Secunderabad', pos: [0.8, 0.9, 0], color: '#f97316' },
  { name: 'Madhapur', pos: [-0.6, 0.3, 0], color: '#f97316' },
  { name: 'HITEC City', pos: [-1.2, 0.7, 0], color: '#f97316' },
  { name: 'Gachibowli', pos: [-1.8, 0.1, 0], color: '#f97316' },
  { name: 'Kondapur', pos: [-0.9, -0.3, 0], color: '#f97316' },
  { name: 'Financial District', pos: [-2.2, -0.5, 0], color: '#f97316' },
  { name: 'Charminar', pos: [1.0, -0.1, 0], color: '#fb923c' },
  { name: 'Hussain Sagar', pos: [0.1, 0.5, 0], color: '#fb923c' },
]

const ROUTES = [
  [0, 1, 6, 4],   // LB Nagar → Dilsukhnagar → Kondapur → HITEC City
  [2, 9, 3, 4],   // Secunderabad → Hussain Sagar → Madhapur → HITEC City
  [3, 6, 7],       // Madhapur → Kondapur → Financial District
  [8, 9, 3, 5],   // Charminar → Hussain Sagar → Madhapur → Gachibowli
  [0, 1, 8],       // LB Nagar → Dilsukhnagar → Charminar
]

function GlowNode({ position, color, name, scrollProgress, index }) {
  const meshRef = useRef()
  const ringRef = useRef()
  const delay = index * 0.1
  const activation = Math.max(0, Math.min(1, (scrollProgress - delay) * 3))

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.elapsedTime
    const scale = 0.08 + activation * 0.12
    meshRef.current.scale.setScalar(scale + Math.sin(t * 2 + index) * 0.02)
    if (ringRef.current) {
      ringRef.current.scale.setScalar(scale * 2.5 + Math.sin(t * 1.5 + index) * 0.05)
      ringRef.current.material.opacity = activation * 0.15 + Math.sin(t + index) * 0.05
    }
  })

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.9} />
      </mesh>
      <mesh ref={ringRef}>
        <ringGeometry args={[0.8, 1.2, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

function RouteLine({ points, scrollProgress, routeIndex }) {
  const lineRef = useRef()
  const delay = routeIndex * 0.15
  const activation = Math.max(0, Math.min(1, (scrollProgress - delay) * 2.5))

  const curve = useMemo(() => {
    if (points.length < 2) return null
    const vectors = points.map((p) => new THREE.Vector3(...p))
    return new THREE.CatmullRomCurve3(vectors)
  }, [points])

  const linePoints = useMemo(() => {
    if (!curve) return []
    return curve.getPoints(50)
  }, [curve])

  useFrame(() => {
    if (!lineRef.current) return
    const mat = lineRef.current.material
    if (mat) {
      mat.opacity = activation * 0.6
    }
  })

  if (linePoints.length === 0) return null

  return (
    <Line
      ref={lineRef}
      points={linePoints}
      color="#f97316"
      lineWidth={1.5}
      transparent
      opacity={0}
    />
  )
}

function FlowParticle({ curve, speed, offset, scrollProgress }) {
  const meshRef = useRef()

  useFrame((state) => {
    if (!meshRef.current || !curve) return
    const t = (state.clock.elapsedTime * speed + offset) % 1
    const pos = curve.getPoint(t)
    meshRef.current.position.copy(pos)
    meshRef.current.material.opacity = 0.4 + Math.sin(state.clock.elapsedTime * 3 + offset * 10) * 0.3
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.04, 8, 8]} />
      <meshBasicMaterial color="#f97316" transparent opacity={0.5} />
    </mesh>
  )
}

function CameraController({ scrollProgress }) {
  const { camera } = useThree()

  useFrame(() => {
    const targetX = -scrollProgress * 1.5
    const targetY = scrollProgress * 0.3
    const targetZ = 4 - scrollProgress * 0.8
    camera.position.x += (targetX - camera.position.x) * 0.05
    camera.position.y += (targetY - camera.position.y) * 0.05
    camera.position.z += (targetZ - camera.position.z) * 0.05
    camera.lookAt(-scrollProgress * 0.5, scrollProgress * 0.1, 0)
  })

  return null
}

function Scene({ scrollProgress }) {
  const curves = useMemo(() => {
    return ROUTES.map((route) => {
      const pts = route.map((idx) => LOCATIONS[idx].pos)
      const vectors = pts.map((p) => new THREE.Vector3(...p))
      return new THREE.CatmullRomCurve3(vectors)
    })
  }, [])

  return (
    <>
      <CameraController scrollProgress={scrollProgress} />
      <ambientLight intensity={0.1} />

      {/* Nodes */}
      {LOCATIONS.map((loc, i) => (
        <GlowNode
          key={loc.name}
          position={loc.pos}
          color={loc.color}
          name={loc.name}
          scrollProgress={scrollProgress}
          index={i}
        />
      ))}

      {/* Route lines */}
      {ROUTES.map((route, i) => (
        <RouteLine
          key={i}
          points={route.map((idx) => LOCATIONS[idx].pos)}
          scrollProgress={scrollProgress}
          routeIndex={i}
        />
      ))}

      {/* Flow particles along routes */}
      {curves.map((curve, i) => (
        <FlowParticle
          key={`particle-${i}`}
          curve={curve}
          speed={0.15 + i * 0.05}
          offset={i * 0.7}
          scrollProgress={scrollProgress}
        />
      ))}
    </>
  )
}

export default function CityCanvas({ scrollProgress = 0 }) {
  return (
    <div className="city-canvas">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 4], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Scene scrollProgress={scrollProgress} />
      </Canvas>

      {/* Location labels — DOM overlay */}
      <div className="city-canvas__labels" aria-hidden="true">
        {LOCATIONS.map((loc, i) => {
          const activation = Math.max(0, Math.min(1, (scrollProgress - i * 0.1) * 3))
          return (
            <span
              key={loc.name}
              className="city-canvas__label"
              style={{
                opacity: activation,
                left: `${50 + loc.pos[0] * 18}%`,
                top: `${50 - loc.pos[1] * 25}%`,
              }}
            >
              {loc.name}
            </span>
          )
        })}
      </div>
    </div>
  )
}
