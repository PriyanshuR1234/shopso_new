import React, { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Text, Center } from '@react-three/drei'
import * as THREE from 'three'

function LogoText({ letters, position, delay = 0 }) {
    // Using a group for each letter to handle the jump animation
    return (
        <group position={position}>
            {letters.map((letter, index) => (
                <JumpingLetter key={index} letter={letter} index={index} total={letters.length} delay={delay} />
            ))}
        </group>
    )
}

function JumpingLetter({ letter, index, total, delay }) {
    const meshRef = useRef()
    const [startAnim, setStartAnim] = useState(false)

    // Calculate specific delay for this letter for the "word by word" (or letter by letter) effect
    const letterDelay = delay + index * 0.1

    useFrame((state) => {
        const time = state.clock.getElapsedTime()

        // Start animation logic
        if (time > letterDelay && !startAnim) {
            setStartAnim(true)
        }

        if (meshRef.current) {
            // Jumping animation: simple sine wave that dampens over time
            if (time > letterDelay) {
                const t = time - letterDelay
                // Jump 3 times then settle
                if (t < 1.5) {
                    meshRef.current.position.y = Math.abs(Math.sin(t * 10)) * (1.5 - t) * 0.5
                } else {
                    meshRef.current.position.y = 0
                }
            }
        }
    })

    // Width estimation (rudimentary spacing)
    const xOffset = (index - (total - 1) / 2) * 0.65

    return (
        <group position={[xOffset, 0, 0]}>
            <Text
                ref={meshRef}
                font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
                fontSize={1}
                color="black"
                anchorX="center"
                anchorY="middle"
            >
                {letter}
            </Text>
        </group>
    )
}

function Arc({ delay }) {
    const meshRef = useRef()
    const [entered, setEntered] = useState(false)
    const [shake, setShake] = useState(false)
    const { mouse, viewport } = useThree()

    useFrame((state) => {
        const time = state.clock.getElapsedTime()
        if (!meshRef.current) return

        // Entrance Animation: Rotate and Fit
        if (time > delay) {
            const t = time - delay

            // Phase 1: Rotate in from bottom
            if (t < 1.5) {
                // Rotate from -90deg (flat) to 0 (smile)
                // Move from y: -2 to y: -0.8
                const progress = Math.min(t / 1.5, 1)
                const ease = 1 - Math.pow(1 - progress, 3) // cubic out

                meshRef.current.rotation.z = THREE.MathUtils.lerp(Math.PI, 0, ease)
                meshRef.current.scale.setScalar(THREE.MathUtils.lerp(0, 1, ease))
                meshRef.current.position.y = THREE.MathUtils.lerp(-3, -0.6, ease)
            }
            // Phase 2: Shake/Snap
            else if (t < 2.0) {
                if (!shake) setShake(true)
                const shakeTime = t - 1.5
                // Small oscillation
                meshRef.current.rotation.z = Math.sin(shakeTime * 20) * 0.1 * (0.5 - shakeTime)
            }
            // Phase 3: Interactive (Follow Cursor)
            else {
                setEntered(true)
                // Smooth lerp to mouse position (subtle movement)
                // mouse.x is -1 to 1. We want a small tilt.

                const targetRotation = -mouse.x * 0.2
                const targetX = mouse.x * 0.2
                const targetY = -0.6 + (mouse.y * 0.1)

                meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, targetRotation, 0.1)
                meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetX, 0.1)
                meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, 0.1)
            }
        } else {
            // Initial State
            meshRef.current.scale.setScalar(0)
        }
    })

    return (
        <mesh ref={meshRef} position={[0, -3, 0]}>
            {/* Torus for a thick arc/smile line */}
            {/* radius, tube, radialSegments, tubularSegments, arc */}
            <torusGeometry args={[1.2, 0.15, 16, 50, Math.PI]} />
            <meshStandardMaterial color="#0ea5e9" metalness={0.1} roughness={0.5} />
        </mesh>
    )
}

function ShopsLogo() {
    return (
        <group>
            <LogoText letters={['S', 'h', 'o', 'p', 's']} position={[0, 0.2, 0]} delay={0.5} />
            <Arc delay={2.0} />
        </group>
    )
}

export default function Logo3D() {
    // Use a transparent canvas
    return (
        <div className="h-full w-full">
            <Canvas camera={{ position: [0, 0, 5], fov: 50 }} style={{ background: 'transparent' }}>
                <ambientLight intensity={1} />
                <pointLight position={[10, 10, 10]} />
                <Center>
                    <ShopsLogo />
                </Center>
            </Canvas>
        </div>
    )
}
