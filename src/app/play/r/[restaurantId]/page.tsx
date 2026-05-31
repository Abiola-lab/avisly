'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Star, ArrowRight } from 'lucide-react'

function getOrCreateDeviceFingerprint(): string {
    const key = 'rv_device_fp'
    let fp = localStorage.getItem(key)
    if (!fp) {
        fp = `${Date.now()}-${Math.random().toString(36).slice(2)}`
        localStorage.setItem(key, fp)
    }
    return fp
}

export default function RestaurantRedirectPage() {
    const { restaurantId } = useParams() as { restaurantId: string }
    const router = useRouter()
    const supabase = createClient()

    const [restaurant, setRestaurant] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [step, setStep] = useState<'landing' | 'done'>('landing')
    const [loyaltyCard, setLoyaltyCard] = useState<any>(null)
    const [clicking, setClicking] = useState(false)

    useEffect(() => {
        async function init() {
            // Check for active campaign first — redirect if found
            const { data: campaign } = await supabase
                .from('campaigns')
                .select('id')
                .eq('restaurant_id', restaurantId)
                .eq('is_active', true)
                .order('created_at', { ascending: false })
                .limit(1)
                .single()

            if (campaign) {
                router.replace(`/play/${campaign.id}`)
                return
            }

            // No campaign — fetch restaurant for direct flow
            const { data: rest } = await supabase
                .from('restaurants')
                .select('name, logo_url, google_link, primary_color, loyalty_card_enabled')
                .eq('id', restaurantId)
                .single()

            setRestaurant(rest)
            setLoading(false)
        }
        init()
    }, [restaurantId])

    const handleGoogleClick = async () => {
        if (clicking) return
        setClicking(true)

        // Open Google review
        if (restaurant?.google_link) {
            window.open(restaurant.google_link, '_blank')
        }

        // Create loyalty card if enabled
        if (restaurant?.loyalty_card_enabled !== false) {
            try {
                const deviceFingerprint = getOrCreateDeviceFingerprint()
                const res = await fetch('/api/loyalty/create-direct', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ restaurantId, deviceFingerprint })
                })
                if (res.ok) {
                    const data = await res.json()
                    setLoyaltyCard(data)
                    router.push(`/loyalty/${data.cardCode}?review=done`)
                    return
                }
            } catch { /* non-blocking */ }
        }

        setStep('done')
        setClicking(false)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
        )
    }

    if (!restaurant) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white text-center p-8">
                <p className="text-white/50">Restaurant introuvable.</p>
            </div>
        )
    }

    const brandColor = restaurant.primary_color || '#1d1dd7'
    const loyaltyEnabled = restaurant.loyalty_card_enabled !== false

    if (step === 'done') {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-8 text-white text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                    <Star className="w-8 h-8 text-green-400 fill-green-400" />
                </div>
                <h2 className="text-2xl font-black mb-2">MERCI !</h2>
                <p className="text-white/60 text-sm">Votre avis compte beaucoup pour nous.</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-8 text-white text-center relative overflow-hidden">
            <div className="absolute top-[-100px] left-[-100px] w-80 h-80 rounded-full blur-[120px] opacity-20" style={{ backgroundColor: brandColor }} />
            <div className="absolute bottom-[-100px] right-[-100px] w-80 h-80 rounded-full blur-[120px] opacity-10" style={{ backgroundColor: brandColor }} />

            <div className="relative z-10 space-y-10 max-w-sm w-full">
                {/* Logo / Nom */}
                {restaurant.logo_url ? (
                    <div className="bg-white p-4 rounded-[2rem] shadow-2xl mx-auto w-fit">
                        <img src={restaurant.logo_url} alt={restaurant.name} className="h-16 mx-auto object-contain" />
                    </div>
                ) : (
                    <h2 className="text-3xl font-black italic tracking-widest uppercase" style={{ color: brandColor }}>
                        {restaurant.name || 'VOTRE RESTAURANT'}
                    </h2>
                )}

                {/* Message contextuel */}
                <div className="space-y-3">
                    {loyaltyEnabled ? (
                        <>
                            <Star className="w-14 h-14 text-yellow-400 fill-yellow-400 mx-auto" />
                            <h1 className="text-3xl font-black tracking-tighter leading-tight uppercase">
                                Laissez un avis,<br />gagnez des points !
                            </h1>
                            <p className="text-white/60 text-sm leading-relaxed">
                                Partagez votre expérience sur Google et recevez votre carte de fidélité.
                            </p>
                        </>
                    ) : (
                        <>
                            <h1 className="text-3xl font-black tracking-tighter leading-tight uppercase">
                                Votre avis compte !
                            </h1>
                            <p className="text-white/60 text-sm leading-relaxed">
                                Partagez votre expérience et aidez-nous à nous améliorer.
                            </p>
                        </>
                    )}
                </div>

                {/* CTA principal */}
                {restaurant.google_link && (
                    <button
                        onClick={handleGoogleClick}
                        disabled={clicking}
                        className="w-full bg-white py-6 rounded-[2.5rem] font-black text-lg flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(0,0,0,0.3)] active:scale-95 transition-all disabled:opacity-70"
                        style={{ color: brandColor }}
                    >
                        {clicking ? (
                            <div className="w-6 h-6 border-3 border-current/30 border-t-current rounded-full animate-spin" />
                        ) : (
                            <>
                                {loyaltyEnabled ? 'LAISSER UN AVIS & OBTENIR MA CARTE' : 'LAISSER UN AVIS GOOGLE'}
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                )}
            </div>

            <div className="absolute bottom-8 text-[10px] font-black tracking-[0.4em] opacity-40 uppercase">
                Powered by Avisly
            </div>
        </div>
    )
}
