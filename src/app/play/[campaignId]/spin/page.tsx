'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import Wheel from '@/components/game/Wheel'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Eye } from 'lucide-react'

export default function SpinPage() {
    const { campaignId } = useParams()
    const [rewards, setRewards] = useState<any[]>([])
    const [winnerIndex, setWinnerIndex] = useState<number | null>(null)
    const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined)
    const [loading, setLoading] = useState(true)
    const [spinning, setSpinning] = useState(false)
    const [palette, setPalette] = useState({ primary: '#1d1dd7', secondary: '#ff0080', accent: '#ffcc00' })
    const [showReveal, setShowReveal] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        async function fetchRewards() {
            if (!campaignId) return
            const { data: campaignData } = await supabase
                .from('campaigns')
                .select('*, restaurants(logo_url, primary_color), rewards(label, color)')
                .eq('id', campaignId)
                .single()

            if (campaignData) {
                setRewards(campaignData.rewards.map((r: any) => ({ label: r.label, color: r.color })))
                setLogoUrl(campaignData.restaurants?.logo_url)
                setPalette({
                    primary: campaignData.color_primary || campaignData.restaurants?.primary_color || '#1d1dd7',
                    secondary: campaignData.color_secondary || '#ff0080',
                    accent: campaignData.color_accent || '#ffcc00'
                })
            }
            setLoading(false)
        }

        fetchRewards()
    }, [campaignId])

    const handleSpin = async () => {
        if (spinning) return
        setSpinning(true)

        const sessionId = localStorage.getItem(`rv_sess_${campaignId}`)
        if (!sessionId) {
            router.push(`/play/${campaignId}`)
            return
        }

        try {
            const res = await fetch('/api/game/spin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ campaignId, sessionId })
            })
            const data = await res.json()

            if (data.error) throw new Error(data.error)

            setWinnerIndex(data.winnerIndex)
        } catch (err: any) {
            alert(err.message)
            setSpinning(false)
        }
    }

    const onFinished = () => {
        // Show the blur reveal overlay instead of immediate redirect
        setShowReveal(true)
    }

    const goToRating = () => {
        router.push(`/play/${campaignId}/rate`)
    }

    if (loading) return (
        <div className="flex-1 flex items-center justify-center bg-gray-900">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-white border-t-transparent rounded-full"
            />
        </div>
    )

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-1000">

            {/* Background elements - very subtle nuances */}
            <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full blur-[120px]" style={{ background: palette.primary }} />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-[120px]" style={{ background: palette.secondary }} />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center z-10 mb-12"
            >
                <h2 className="text-4xl font-black mb-4 tracking-tighter text-white drop-shadow-2xl">
                    TOURNEZ LA ROUE !
                </h2>
                <p className="text-white/70 font-bold uppercase tracking-widest text-xs">
                    Tentez de remporter un cadeau exclusif
                </p>
            </motion.div>

            <div className="relative z-10">
                <Wheel
                    segments={rewards}
                    winnerIndex={winnerIndex}
                    onFinished={onFinished}
                    logoUrl={logoUrl}
                    colors={palette}
                />
            </div>

            <div className="mt-12 z-10 w-full px-6 flex justify-center">
                <AnimatePresence mode="wait">
                    {!spinning && (
                        <motion.button
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            onClick={handleSpin}
                            className="relative w-full max-w-sm py-6 rounded-[2.5rem] font-black text-2xl transition-all active:scale-95 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.5)] overflow-hidden"
                        >
                            <div
                                className="absolute inset-0"
                                style={{ background: `linear-gradient(45deg, ${palette.secondary}, ${palette.accent})` }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-white/20" />

                            <span className="relative z-10 flex items-center justify-center gap-3 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                                <Sparkles className="w-7 h-7 animate-pulse" />
                                JE TENTE MA CHANCE
                            </span>

                            {/* Static subtle gloss for mobile */}
                            <div className="absolute top-0 left-[-10%] w-[120%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-35deg]" />
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            {/* Blur Reveal Overlay */}
            <AnimatePresence>
                {showReveal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-3xl bg-black/90 p-10 text-center"
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white/10 p-1.5 rounded-[3.5rem] border border-white/20 shadow-[0_0_100px_rgba(0,0,0,0.8)] max-w-[340px] w-full"
                        >
                            <div className="bg-[#0f1115] rounded-[3rem] p-10 space-y-8">
                                <div className="w-20 h-20 bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-full mx-auto flex items-center justify-center animate-bounce shadow-[0_10px_30px_rgba(245,158,11,0.4)]">
                                    <Sparkles className="w-10 h-10 text-white" />
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-4xl font-black text-white px-2 tracking-tighter">BRAVO !</h3>
                                    <p className="text-white/40 font-bold uppercase tracking-[0.2em] text-[10px]">Votre gain est prêt à être révélé</p>
                                </div>

                                <div className="py-10 px-4 border-2 border-dashed border-white/10 rounded-[2rem] bg-white/[0.02]">
                                    <div className="text-4xl font-black text-white/5 blur-[12px] select-none tracking-widest">
                                        XXXXXXXX
                                    </div>
                                </div>

                                <button
                                    onClick={goToRating}
                                    className="w-full bg-white text-black py-5 rounded-[2rem] font-black text-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl uppercase tracking-tighter"
                                >
                                    Valider ma participation
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
