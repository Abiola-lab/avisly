'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import { Trophy, Clock, Check, Star } from 'lucide-react'
import confetti from 'canvas-confetti'
import { usePostHog } from 'posthog-js/react'

function getOrCreateDeviceFingerprint(): string {
    const key = 'rv_device_fp'
    let fp = localStorage.getItem(key)
    if (!fp) {
        fp = `${Date.now()}-${Math.random().toString(36).slice(2)}`
        localStorage.setItem(key, fp)
    }
    return fp
}

export default function RewardPage() {
    const { campaignId } = useParams()
    const router = useRouter()
    const [data, setData] = useState<any>(null)
    const [timeLeft, setTimeLeft] = useState<number | null>(null)
    const [googleClicked, setGoogleClicked] = useState(false)
    const [finished, setFinished] = useState(false)
    const [loyaltyCard, setLoyaltyCard] = useState<{ cardCode: string, pointsBalance: number, rewardThreshold: number, isNewCard: boolean } | null>(null)
    const supabase = createClient()
    const posthog = usePostHog()

    useEffect(() => {
        async function fetchReward() {
            if (!campaignId) return
            const sessionId = localStorage.getItem(`rv_sess_${campaignId}`)
            if (!sessionId) return

            const { data: sessData } = await supabase
                .from('sessions')
                .select('*, coupons(*), rewards(label, is_prize), campaigns(restaurants(google_link, subscription_plan))')
                .eq('id', sessionId)
                .single()

            if (sessData) {
                setData(sessData)

                // Create loyalty card non-blocking — only if enabled for this restaurant
                const loyaltyEnabled = localStorage.getItem(`rv_loyalty_${campaignId}`) !== 'false'
                if (loyaltyEnabled) {
                    try {
                        const deviceFingerprint = getOrCreateDeviceFingerprint()
                        const res = await fetch('/api/loyalty/create', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ sessionId, deviceFingerprint })
                        })
                        if (res.ok) {
                            const loyaltyData = await res.json()
                            setLoyaltyCard(loyaltyData)
                        }
                    } catch {
                        // Loyalty card creation failure is non-blocking
                    }
                }

                // Timer calculation ONLY if it's a prize and has a coupon
                if (sessData.rewards?.is_prize && sessData.coupons) {
                    const expiry = new Date(sessData.coupons.expires_at).getTime()
                    const now = new Date().getTime()
                    setTimeLeft(Math.max(0, Math.floor((expiry - now) / 1000)))

                    // Confetti ONLY if it's a real prize!
                    confetti({
                        particleCount: 150,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: ['#ffffff', '#facc15', '#1d1dd7']
                    })
                }
            }
        }

        fetchReward()
    }, [campaignId])

    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0) return

        const timer = setInterval(() => {
            setTimeLeft(t => (t && t > 0 ? t - 1 : 0))
        }, 1000)

        return () => clearInterval(timer)
    }, [timeLeft])

    const handleGoogleClick = async () => {
        const sessionId = localStorage.getItem(`rv_sess_${campaignId}`)
        if (!sessionId) return

        // Track Google click in Supabase
        await supabase.from('analytics_events').insert([{
            session_id: sessionId,
            event_type: 'google_clicked'
        }])

        // Track in PostHog
        posthog?.capture('google_clicked', {
            campaignId,
            sessionId,
            reward: data?.rewards?.label,
            rating: data?.rating
        })

        setGoogleClicked(true)
        window.open(data?.campaigns?.restaurants?.google_link, '_blank')

        if (loyaltyCard) {
            router.push(`/loyalty/${loyaltyCard.cardCode}?review=done`)
        } else {
            setFinished(true)
        }
    }

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        const s = seconds % 60
        if (h > 0) {
            return `${h}h ${m < 10 ? '0' : ''}${m}m`
        }
        return `${m}:${s < 10 ? '0' : ''}${s}`
    }

    if (!data) return <div className="text-white/70 text-center py-20">Récupération de votre gain...</div>

    const isPositive = data.rating >= 3
    const isFideliteOnly = !data.rewards

    const googleButton = (
        <button
            onClick={handleGoogleClick}
            className="w-full bg-white py-5 rounded-[2.5rem] font-black text-lg flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(0,0,0,0.3)] active:scale-95 transition-all border border-gray-100"
        >
            <div className="flex items-center gap-1.5">
                <span className="text-[#4285F4]">G</span>
                <span className="text-[#EA4335]">o</span>
                <span className="text-[#FBBC05]">o</span>
                <span className="text-[#4285F4]">g</span>
                <span className="text-[#34A853]">l</span>
                <span className="text-[#EA4335]">e</span>
            </div>
            <span className="text-gray-900 tracking-tighter">PUBLIER MON AVIS</span>
        </button>
    )

    if (isFideliteOnly) {
        return (
            <div className="flex-1 flex flex-col items-center justify-between py-8 text-white">
                <div className="text-center w-full px-4">
                    <Star className="w-16 h-16 text-yellow-400 fill-yellow-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-black mb-1">MERCI POUR VOTRE VISITE !</h2>
                    <p className="text-white/60 mb-6 font-medium">Votre avis nous aide à nous améliorer.</p>

                    {loyaltyCard && (
                        <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] mb-8 text-center">
                            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Votre carte de fidélité</p>
                            <p className="text-white font-black text-2xl tracking-[0.15em] mb-1">{loyaltyCard.cardCode}</p>
                            <p className="text-white/40 text-xs">
                                {loyaltyCard.pointsBalance} / {loyaltyCard.rewardThreshold} points
                                {loyaltyCard.isNewCard && ' · Carte créée !'}
                            </p>
                        </div>
                    )}
                </div>

                <div className="w-full space-y-4 px-4">
                    <div className="text-center px-4">
                        <p className="text-white/80 font-bold mb-4 text-sm leading-relaxed uppercase tracking-tight">
                            Un petit avis Google nous aiderait énormément 🙏
                        </p>
                    </div>
                    {googleButton}
                    <button
                        onClick={() => {
                            if (loyaltyCard) {
                                router.push(`/loyalty/${loyaltyCard.cardCode}`)
                            } else {
                                setFinished(true)
                            }
                        }}
                        className="w-full bg-white/10 text-white/70 py-4 rounded-[2rem] font-bold text-sm hover:bg-white/20 transition-all border border-white/5"
                    >
                        VOIR MA CARTE DE FIDÉLITÉ
                    </button>
                </div>

                {finished && (
                    <div className="fixed inset-0 bg-[#0a0a0a]/95 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                            <Check className="w-8 h-8 text-green-500" />
                        </div>
                        <h2 className="text-3xl font-black mb-2 italic">MERCI !</h2>
                        <p className="text-white/60 mb-8 italic leading-relaxed">
                            À très bientôt et n'oubliez pas votre carte de fidélité !
                        </p>
                        <button
                            onClick={() => {
                                localStorage.removeItem(`rv_sess_${campaignId}`)
                                window.location.href = `/play/${campaignId}`
                            }}
                            className="px-10 py-5 bg-white text-gray-900 rounded-full font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl"
                        >
                            FERMER
                        </button>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="flex-1 flex flex-col items-center justify-between py-8 text-white">
            <div className="text-center w-full px-4">
                <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                {data.rewards?.is_prize ? (
                    <>
                        <h2 className="text-2xl font-black mb-1">BRAVO, C'EST GAGNÉ !</h2>
                        <p className="text-white/60 mb-6 font-medium">Présentez ce code au comptoir</p>

                        <div className="bg-white p-8 rounded-[3rem] shadow-2xl relative overflow-hidden mb-8" style={{ color: 'var(--primary-color)' }}>
                            <div className="absolute top-0 left-0 w-full h-2 bg-yellow-400" />
                            <h1 className="text-4xl font-black mb-2 uppercase tracking-tight leading-tight">
                                {data.rewards?.label}
                            </h1>
                            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 rounded-2xl text-2xl font-black tracking-[0.3em] mb-4">
                                {data.coupons?.code || '---'}
                            </div>
                            <div className="flex items-center justify-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-widest">
                                <Clock className="w-4 h-4" /> Expire dans : <span className="text-red-500">{formatTime(timeLeft || 0)}</span>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <h2 className="text-2xl font-black mb-1">DOMMAGE !</h2>
                        <p className="text-white/60 mb-6 font-medium">Merci pour votre participation.</p>

                        <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] backdrop-blur-sm mb-8">
                            <h1 className="text-2xl font-bold mb-4 opacity-50 uppercase tracking-tight">
                                {data.rewards?.label}
                            </h1>
                            <p className="text-white/60 text-sm leading-relaxed italic">
                                Tentez à nouveau votre chance demain pour gagner l'un de nos super cadeaux !
                            </p>
                        </div>
                    </>
                )}
            </div>

            <div className="w-full space-y-4 px-4">
                {data.rewards?.is_prize ? (
                    <div className="space-y-4">
                        <div className="text-center px-4">
                            <p className="text-white/80 font-bold mb-4 text-sm leading-relaxed uppercase tracking-tight">
                                {isPositive
                                    ? "Merci pour votre super note ! Un petit avis Google nous aiderait énormément 🙏"
                                    : "Félicitations pour votre gain ! Votre avis compte pour nous aider à nous améliorer. 🙏"}
                            </p>
                        </div>
                        {googleButton}
                    </div>
                ) : isPositive ? (
                    <div className="space-y-4">
                        <div className="text-center px-4">
                            <p className="text-white/80 font-bold mb-4 text-sm leading-relaxed uppercase tracking-tight">
                                Dommage pour cette fois... On espère vous revoir très vite ! Un petit avis Google ? 🙏
                            </p>
                        </div>
                        {googleButton}
                    </div>
                ) : (
                    <div className="text-center py-6 px-4 bg-white/5 rounded-3xl border border-white/10">
                        <p className="text-white/70 text-sm italic">
                            Merci pour votre retour, nous nous efforçons de nous améliorer chaque jour !
                        </p>
                    </div>
                )}

                <button
                    onClick={() => {
                        if (isPositive) {
                            handleGoogleClick()
                        } else {
                            if (loyaltyCard) {
                                router.push(`/loyalty/${loyaltyCard.cardCode}`)
                            } else {
                                setFinished(true)
                            }
                        }
                    }}
                    className="w-full bg-white/10 text-white/70 py-4 rounded-[2rem] font-bold text-sm hover:bg-white/20 transition-all border border-white/5"
                >
                    {isPositive ? 'FERMER & LAISSER UN AVIS' : 'QUITTER'}
                </button>
            </div>

            {/* Final Overlay if finished */}
            {finished && (
                <div className="fixed inset-0 bg-[#0a0a0a]/95 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                        <Check className="w-8 h-8 text-green-500" />
                    </div>
                    <h2 className="text-3xl font-black mb-2 italic">TERMINE !</h2>
                    <p className="text-white/60 mb-8 italic leading-relaxed">
                        Merci pour votre temps ! Votre participation a bien été enregistrée.
                        {data?.rewards?.is_prize && (
                            <span className="block mt-2 text-white font-bold">N'oubliez pas d'utiliser votre gain au comptoir ! 🎁</span>
                        )}
                    </p>

                    <button
                        onClick={() => {
                            localStorage.removeItem(`rv_sess_${campaignId}`)
                            window.location.href = `/play/${campaignId}`
                        }}
                        className="px-10 py-5 bg-white text-gray-900 rounded-full font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl"
                    >
                        FERMER
                    </button>
                </div>
            )}
        </div>
    )
}
