'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import { ArrowRight, Trophy } from 'lucide-react'

export default function PlayLandingPage() {
    const { campaignId } = useParams()
    const [campaign, setCampaign] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()
    const router = useRouter()
    const [primaryColor, setPrimaryColor] = useState('#1d1dd7')

    useEffect(() => {
        async function initSession() {
            try {
                if (!campaignId) return

                // 1. Get campaign and restaurant info
                const { data: campaignData, error: campError } = await supabase
                    .from('campaigns')
                    .select('*, restaurants(*)')
                    .eq('id', campaignId)
                    .single()

                if (campError || !campaignData) throw new Error('Campagne introuvable')
                if (!campaignData.is_active) throw new Error('Cette campagne est terminée')

                setCampaign(campaignData)
                if (campaignData.restaurants?.primary_color) {
                    setPrimaryColor(campaignData.restaurants.primary_color)
                }

                // 2. Init session via API (Server-side IP tracking)
                const res = await fetch('/api/game/init', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ campaignId })
                })

                const data = await res.json()

                if (data.error === 'FRAUD_LIMIT') {
                    throw new Error(data.message)
                }

                if (data.error) throw new Error('Erreur lors de l\'initialisation')

                // Store session ID for the rest of the flow
                localStorage.setItem(`rv_sess_${campaignId}`, data.sessionId)

            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        initSession()
    }, [campaignId])

    if (loading) return (
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            <p className="text-white/70 font-medium">Préparation de votre cadeau...</p>
        </div>
    )

    if (error) return (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-white">
            <div className="bg-red-500/20 p-4 rounded-full mb-4 text-red-100">
                <Trophy className="w-8 h-8 opacity-50" />
            </div>
            <h2 className="text-xl font-bold mb-2">Oups !</h2>
            <p className="text-white/70 mb-8">{error}</p>
        </div>
    )

    return (
        <div className="flex-1 flex flex-col items-center justify-between py-12 text-white">
            <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-white rounded-3xl mx-auto flex items-center justify-center shadow-2xl overflow-hidden">
                    {campaign?.restaurants?.logo_url ? (
                        <img
                            src={campaign.restaurants.logo_url}
                            alt={campaign.restaurants.name}
                            className="w-full h-full object-contain p-1"
                        />
                    ) : (
                        <span
                            className="text-3xl font-black"
                            style={{ color: primaryColor }}
                        >
                            {campaign?.restaurants?.name?.charAt(0)}
                        </span>
                    )}
                </div>
                <div>
                    <h2 className="text-white/60 font-medium uppercase tracking-[0.2em] text-xs">Bienvenue chez</h2>
                    <h1 className="text-2xl font-black">{campaign?.restaurants?.name}</h1>
                </div>
            </div>

            <div className="w-full space-y-8 text-center px-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-white/10 blur-3xl rounded-full" />
                    <div className="relative bg-white/5 border border-white/10 p-10 rounded-[3rem] backdrop-blur-sm">
                        <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-bounce" />
                        <h3 className="text-2xl font-bold mb-2">Tentez votre chance !</h3>
                        <p className="text-white/60 text-sm leading-relaxed">
                            Tournez la roue et gagnez une récompense exclusive offerte par l'établissement.
                        </p>
                    </div>
                </div>
            </div>

            <button
                onClick={() => router.push(`/play/${campaignId}/spin`)}
                className="w-full bg-white py-5 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 shadow-[0_10px_40px_rgba(0,0,0,0.3)] hover:scale-[1.02] transition-all active:scale-95"
                style={{ color: primaryColor }}
            >
                LANCER LA ROUE <ArrowRight className="w-6 h-6" />
            </button>
        </div>
    )
}
