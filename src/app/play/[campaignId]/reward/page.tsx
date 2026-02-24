'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import { Trophy, Clock, Check, ExternalLink } from 'lucide-react'
import confetti from 'canvas-confetti'

export default function RewardPage() {
    const { campaignId } = useParams()
    const [data, setData] = useState<any>(null)
    const [timeLeft, setTimeLeft] = useState<number | null>(null)
    const [googleClicked, setGoogleClicked] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        async function fetchReward() {
            if (!campaignId) return
            const sessionId = localStorage.getItem(`rv_sess_${campaignId}`)
            if (!sessionId) return

            const { data: sessData } = await supabase
                .from('sessions')
                .select('*, coupons(*), rewards(label, is_prize), campaigns(restaurants(google_link))')
                .eq('id', sessionId)
                .single()

            if (sessData) {
                setData(sessData)

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

        await supabase.from('analytics_events').insert([{
            session_id: sessionId,
            event_type: 'google_clicked'
        }])

        setGoogleClicked(true)
        window.open(data?.campaigns?.restaurants?.google_link, '_blank')
    }

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m}:${s < 10 ? '0' : ''}${s}`
    }

    if (!data) return <div className="text-white/70 text-center py-20">Récupération de votre gain...</div>

    const isPositive = data.rating >= 4

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
                {/* 
                    Logic:
                    1. If user won a prize: Always show Google link, but adapt message if rating is low.
                    2. If user lost: Show Google link ONLY if rating is high (>=4).
                */}
                {data.rewards?.is_prize ? (
                    <div className="space-y-4">
                        <div className="text-center px-4">
                            <p className="text-white font-bold mb-4">
                                {isPositive
                                    ? "Merci pour votre super note ! Un petit avis Google nous aiderait énormément 🙏"
                                    : "Félicitations pour votre gain ! Votre avis compte pour nous aider à nous améliorer. 🙏"}
                            </p>
                        </div>
                        <button
                            onClick={handleGoogleClick}
                            className="w-full bg-[#facc15] py-5 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 shadow-2xl hover:scale-105 transition-all"
                            style={{ color: 'var(--primary-color)' }}
                        >
                            LAISSER UN AVIS GOOGLE <ExternalLink className="w-6 h-6" />
                        </button>
                    </div>
                ) : isPositive ? (
                    <div className="space-y-4">
                        <div className="text-center px-4">
                            <p className="text-white/80 font-bold mb-4">
                                Dommage pour cette fois ! On espère vous revoir très vite. Un petit avis Google ? 🙏
                            </p>
                        </div>
                        <button
                            onClick={handleGoogleClick}
                            className="w-full bg-[#facc15] py-5 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 shadow-2xl hover:scale-105 transition-all"
                            style={{ color: 'var(--primary-color)' }}
                        >
                            LAISSER UN AVIS GOOGLE <ExternalLink className="w-6 h-6" />
                        </button>
                    </div>
                ) : (
                    <div className="text-center py-6 px-4 bg-white/5 rounded-3xl border border-white/10">
                        <p className="text-white/70 text-sm italic">
                            Merci pour votre retour, nous nous efforçons de nous améliorer chaque jour !
                        </p>
                    </div>
                )}

                <button
                    onClick={() => window.location.href = data?.campaigns?.restaurants?.google_link || '#'}
                    className="w-full bg-white/10 text-white/70 py-4 rounded-[2rem] font-bold text-sm hover:bg-white/20 transition-all"
                >
                    FERMER
                </button>
            </div>
        </div>
    )
}
