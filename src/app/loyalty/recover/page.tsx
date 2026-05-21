'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Loader2, ArrowRight, Trophy, Search } from 'lucide-react'

interface CardResult {
    cardCode: string
    pointsBalance: number
    firstName: string | null
    lastName: string | null
    rewardThreshold: number
    restaurantName: string
    primaryColor: string
}

export default function RecoverPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [cards, setCards] = useState<CardResult[] | null>(null)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setCards(null)

        try {
            const res = await fetch('/api/loyalty/recover', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setCards(data.cards)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center p-6"
            style={{ background: 'linear-gradient(160deg, #1d1dd722 0%, #0a0a0f 50%)' }}
        >
            <div className="w-full max-w-sm space-y-8">

                {/* Header */}
                <div className="text-center">
                    <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                        <Search className="w-7 h-7 text-white/60" />
                    </div>
                    <h1 className="text-white font-black text-2xl mb-2">Retrouvez votre carte</h1>
                    <p className="text-white/40 text-sm leading-relaxed">
                        Entrez l'email avec lequel vous avez enregistré votre profil.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSearch} className="space-y-4">
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                        <input
                            type="email"
                            required
                            placeholder="votre@email.com"
                            className="w-full pl-11 pr-4 py-4 bg-white/10 border border-white/10 rounded-2xl text-white text-sm font-medium placeholder-white/30 outline-none focus:border-white/30 transition-all"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !email}
                        className="w-full py-4 bg-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 active:scale-95"
                        style={{ color: '#1d1dd7' }}
                    >
                        {loading
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <><Search className="w-4 h-4" /> RECHERCHER MA CARTE</>
                        }
                    </button>
                </form>

                {/* Error */}
                {error && (
                    <p className="text-red-400 text-sm font-bold text-center">{error}</p>
                )}

                {/* No results */}
                {cards !== null && cards.length === 0 && (
                    <div className="text-center py-6 px-4 bg-white/5 rounded-3xl border border-white/10">
                        <p className="text-white/60 text-sm font-medium">
                            Aucune carte trouvée pour cet email.
                        </p>
                        <p className="text-white/30 text-xs mt-2">
                            Vérifiez l'email utilisé lors de votre enregistrement.
                        </p>
                    </div>
                )}

                {/* Results */}
                {cards && cards.length > 0 && (
                    <div className="space-y-3">
                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest text-center">
                            {cards.length} carte{cards.length > 1 ? 's' : ''} trouvée{cards.length > 1 ? 's' : ''}
                        </p>
                        {cards.map((card) => (
                            <button
                                key={card.cardCode}
                                onClick={() => router.push(`/loyalty/${card.cardCode}`)}
                                className="w-full p-5 rounded-2xl border flex items-center justify-between gap-4 transition-all active:scale-95 hover:opacity-90"
                                style={{
                                    backgroundColor: `${card.primaryColor}15`,
                                    borderColor: `${card.primaryColor}40`
                                }}
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                        style={{ backgroundColor: `${card.primaryColor}30` }}
                                    >
                                        <Trophy className="w-5 h-5" style={{ color: card.primaryColor }} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-white font-black text-sm">{card.restaurantName}</p>
                                        <p className="text-white/40 text-xs font-medium">
                                            {card.pointsBalance} / {card.rewardThreshold} points
                                            {card.firstName ? ` · ${card.firstName}` : ''}
                                        </p>
                                    </div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-white/40 shrink-0" />
                            </button>
                        ))}
                    </div>
                )}

                {/* Back */}
                <p className="text-center text-white/20 text-xs">
                    Propulsé par{' '}
                    <span className="text-white/40 font-bold">Avisly</span>
                </p>
            </div>
        </div>
    )
}
