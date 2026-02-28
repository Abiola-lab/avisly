import React, { useRef, useEffect, useState } from 'react'
import { motion, useAnimation, AnimatePresence } from 'framer-motion'
import {
    Coffee,
    Utensils,
    Gift,
    Star,
    ChevronDown,
    Beer,
    Pizza,
    Ticket,
    Smile
} from 'lucide-react'

interface WheelProps {
    segments: { label: string, color?: string, is_prize?: boolean }[]
    winnerIndex: number | null
    onFinished: () => void
    logoUrl?: string
    colors?: { primary: string, secondary: string, accent: string }
}

export default function Wheel({ segments, winnerIndex, onFinished, logoUrl, colors }: WheelProps) {
    const [mustSpin, setMustSpin] = useState(false)
    const controls = useAnimation()

    const numSegments = segments.length
    const segmentAngle = 360 / numSegments

    const palette = [
        colors?.primary || '#1d1dd7',
        colors?.secondary || '#ff0080',
        colors?.accent || '#ffcc00'
    ]

    useEffect(() => {
        if (winnerIndex !== null && !mustSpin) {
            setMustSpin(true)
            startSpinning()
        }
    }, [winnerIndex])

    const startSpinning = async () => {
        // Multiple full rotations + exact offset to land on winnerIndex
        // The pointer is at the top (0 deg). 
        // Index 0 in the map starts at 0 deg, but rotates clockwise.
        // We want the winnerIndex segment to land at 0 deg.
        const extraRotations = 360 * 8
        const finalRotation = extraRotations + (360 - (winnerIndex! * segmentAngle)) - (segmentAngle / 2)

        await controls.start({
            rotate: finalRotation,
            transition: {
                duration: 6,
                ease: [0.15, 0, 0.1, 1],
            },
        })

        onFinished()
    }

    return (
        <div className="relative w-80 h-80 flex items-center justify-center perspective-1000">
            {/* Outer Case / Lights border */}
            <div className="absolute inset-[-12px] rounded-full bg-gradient-to-b from-yellow-300 via-yellow-600 to-yellow-900 shadow-2xl z-0" />
            <div className="absolute inset-[-6px] rounded-full bg-gray-900 z-1" />

            {/* Decorative lights dots */}
            {[...Array(12)].map((_, i) => (
                <div
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_8px_white] z-2"
                    style={{
                        top: '50%',
                        left: '50%',
                        transform: `rotate(${i * 30}deg) translateY(-164px) translateX(-50%)`
                    }}
                />
            ))}

            {/* Pointer */}
            <div className="absolute top-[-25px] left-1/2 -translate-x-1/2 z-30 drop-shadow-xl">
                <div className="relative">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border-4 border-yellow-600">
                        <ChevronDown className="w-6 h-6 text-red-600 fill-red-600" />
                    </div>
                </div>
            </div>

            {/* The Wheel */}
            <motion.div
                animate={controls}
                className="w-full h-full rounded-full border-[8px] border-yellow-600 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative z-10 overflow-hidden"
                style={{
                    background: `conic-gradient(${segments.map((s, i) => {
                        const color = s.color || palette[i % palette.length];
                        const start = i * segmentAngle;
                        const end = (i + 1) * segmentAngle;
                        return `${color} ${start}deg ${end}deg`;
                    }).join(', ')})`
                }}
            >
                {segments.map((s, i) => {
                    const backgroundColor = s.color || palette[i % palette.length];
                    const isLight = ['#ffffff', '#ffcc00', '#fef08a', '#facc15', '#fff'].includes(backgroundColor.toLowerCase());
                    const textColor = isLight ? '#000000' : '#ffffff';

                    // Aligner avec le conic-gradient (qui commence à 12h, donc -90deg par rapport au rotate standard)
                    const midAngle = (i * segmentAngle) + (segmentAngle / 2) - 90;

                    // Logique de wrapping intelligent : on ne passe à la ligne que si nécessaire (ex: > 10 chars)
                    const wrapText = (text: string, maxLineChars: number) => {
                        const words = text.split(' ');
                        const lines: string[] = [];
                        let currentLine = '';

                        words.forEach(word => {
                            if ((currentLine + (currentLine ? ' ' : '') + word).length <= maxLineChars) {
                                currentLine += (currentLine ? ' ' : '') + word;
                            } else {
                                if (currentLine) lines.push(currentLine);
                                currentLine = word;
                            }
                        });
                        if (currentLine) lines.push(currentLine);
                        return lines;
                    };

                    const labelLines = wrapText(s.label, 10);

                    return (
                        <div
                            key={i}
                            className="absolute top-1/2 left-1/2 w-1/2 h-14 origin-left flex items-center justify-end pr-5"
                            style={{
                                transform: `translate(-0%, -50%) rotate(${midAngle}deg)`,
                            }}
                        >
                            <div className="flex flex-col items-center justify-center w-full max-w-[110px]">
                                <span
                                    className="font-black uppercase tracking-tight text-right leading-[0.9] w-full break-words"
                                    style={{
                                        color: textColor,
                                        fontSize: numSegments > 8 ? '10px' : '14px',
                                        textShadow: textColor === '#ffffff' ? '0 1px 4px rgba(0,0,0,0.4)' : 'none'
                                    }}
                                >
                                    {labelLines.map((line, index) => (
                                        <React.Fragment key={index}>
                                            {line}
                                            {index < labelLines.length - 1 && <br />}
                                        </React.Fragment>
                                    ))}
                                </span>
                            </div>
                        </div>
                    );
                })}

                {/* Glass reflection */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/40 pointer-events-none" />
            </motion.div>

            {/* Center hub */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full z-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-gradient-to-b from-yellow-300 to-yellow-700 shadow-xl border-4 border-gray-900" />
                <div className="relative w-14 h-14 rounded-full overflow-hidden bg-white shadow-inner flex items-center justify-center p-1.5 border-2 border-yellow-800">
                    {logoUrl ? (
                        <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                        <Star className="w-8 h-8 text-yellow-600 fill-yellow-600" />
                    )}
                </div>
            </div>
        </div>
    )
}
