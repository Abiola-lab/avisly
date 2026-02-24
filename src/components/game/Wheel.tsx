'use client'

import React, { useRef, useEffect, useState } from 'react'
import { motion, useAnimation } from 'framer-motion'

interface WheelProps {
    segments: string[]
    winnerIndex: number | null
    onFinished: () => void
    logoUrl?: string
}

export default function Wheel({ segments, winnerIndex, onFinished, logoUrl }: WheelProps) {
    const [mustSpin, setMustSpin] = useState(false)
    const controls = useAnimation()

    const numSegments = segments.length
    const segmentAngle = 360 / numSegments

    useEffect(() => {
        if (winnerIndex !== null && !mustSpin) {
            setMustSpin(true)
            startSpinning()
        }
    }, [winnerIndex])

    const startSpinning = async () => {
        const rotation = 360 * 5 + (360 - winnerIndex! * segmentAngle) - segmentAngle / 2

        await controls.start({
            rotate: rotation,
            transition: {
                duration: 5,
                ease: [0.15, 0, 0.15, 1],
            },
        })

        onFinished()
    }

    return (
        <div className="relative w-80 h-80 flex items-center justify-center">
            {/* Pointer */}
            <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 z-20">
                <div className="w-8 h-8 bg-white rounded-full shadow-xl flex items-center justify-center">
                    <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[15px] border-t-red-500 mt-1" />
                </div>
            </div>

            {/* The Wheel */}
            <motion.div
                animate={controls}
                className="w-full h-full rounded-full border-8 border-white shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
                style={{ backgroundColor: 'var(--primary-color)' }}
            >
                {segments.map((label, i) => (
                    <div
                        key={i}
                        className="absolute top-0 right-0 w-1/2 h-1/2 origin-bottom-left"
                        style={{
                            transform: `rotate(${i * segmentAngle}deg) skewY(${90 - segmentAngle}deg)`,
                            backgroundColor: i % 2 === 0 ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)',
                            borderLeft: '1px solid rgba(255,255,255,0.1)'
                        }}
                    >
                        <div
                            className="absolute bottom-0 left-0 w-[160px] h-10 origin-bottom-left flex items-center justify-end pr-4"
                            style={{
                                transform: `skewY(-${90 - segmentAngle}deg) rotate(${segmentAngle / 2}deg)`,
                            }}
                        >
                            <span
                                className="text-white font-black uppercase tracking-tighter text-right leading-none"
                                style={{
                                    fontSize: numSegments > 8 ? '8px' : '11px',
                                    maxWidth: '100px',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    transform: 'rotate(0deg)',
                                }}
                            >
                                {label}
                            </span>
                        </div>
                    </div>
                ))}

                {/* Center hub */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full z-10 shadow-xl flex items-center justify-center p-1">
                    {logoUrl ? (
                        <div className="w-full h-full rounded-full overflow-hidden bg-white">
                            <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
                        </div>
                    ) : (
                        <div className="w-12 h-12 rounded-full" style={{ backgroundColor: 'var(--primary-color)' }} />
                    )}
                </div>
            </motion.div>
        </div>
    )
}
