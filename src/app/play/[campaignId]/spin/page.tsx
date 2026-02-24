'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import Wheel from '@/components/game/Wheel'

export default function SpinPage() {
    const { campaignId } = useParams()
    const [rewards, setRewards] = useState<any[]>([])
    const [winnerIndex, setWinnerIndex] = useState<number | null>(null)
    const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined)
    const [loading, setLoading] = useState(true)
    const [spinning, setSpinning] = useState(false)
    const [primaryColor, setPrimaryColor] = useState('#1d1dd7')
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        async function fetchRewards() {
            if (!campaignId) return
            const { data: campaignData } = await supabase
                .from('campaigns')
                .select('*, restaurants(logo_url, primary_color), rewards(label)')
                .eq('id', campaignId)
                .single()

            if (campaignData) {
                setRewards(campaignData.rewards.map((r: any) => r.label))
                setLogoUrl(campaignData.restaurants?.logo_url)
                if (campaignData.restaurants?.primary_color) {
                    setPrimaryColor(campaignData.restaurants.primary_color)
                }
            } else {
                setRewards(['Une surprise', 'Un café offert', 'Réduction', 'Cadeau'])
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
        setTimeout(() => {
            router.push(`/play/${campaignId}/rate`)
        }, 1500)
    }

    if (loading) return <div className="text-white/70 text-center py-20">Chargement de la roue...</div>

    return (
        <div className="flex-1 flex flex-col items-center justify-center space-y-12 text-white">
            <div className="text-center">
                <h2 className="text-3xl font-black mb-2 tracking-tight">BONNE CHANCE !</h2>
                <p className="text-white/60">Touchez le bouton pour lancer.</p>
            </div>

            <div className="relative">
                <Wheel
                    segments={rewards}
                    winnerIndex={winnerIndex}
                    onFinished={onFinished}
                    logoUrl={logoUrl}
                />
            </div>

            {!spinning && (
                <button
                    onClick={handleSpin}
                    className="bg-white px-12 py-5 rounded-[2rem] font-black text-xl shadow-2xl hover:scale-105 transition-all active:scale-95 animate-pulse"
                    style={{ color: primaryColor }}
                >
                    CLIQUEZ ICI
                </button>
            )}

            {spinning && !winnerIndex && (
                <p className="text-white/60 font-medium animate-pulse">Calcul de votre tirage...</p>
            )}
        </div>
    )
}
