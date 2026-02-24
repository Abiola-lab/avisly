'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Star, ArrowRight } from 'lucide-react'

export default function RatePage() {
    const { campaignId } = useParams()
    const [rating, setRating] = useState(0)
    const [hover, setHover] = useState(0)
    const [feedback, setFeedback] = useState('')
    const [tableNumber, setTableNumber] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async () => {
        if (rating === 0) return
        setLoading(true)

        const sessionId = localStorage.getItem(`rv_sess_${campaignId}`)

        try {
            const res = await fetch('/api/game/rate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    campaignId,
                    sessionId,
                    rating,
                    feedback,
                    tableNumber
                })
            })
            const data = await res.json()

            if (data.error) throw new Error(data.error)

            router.push(`/play/${campaignId}/reward`)
        } catch (err: any) {
            alert(err.message)
            setLoading(false)
        }
    }

    return (
        <div className="flex-1 flex flex-col items-center justify-between py-12 text-white">
            <div className="text-center">
                <h2 className="text-3xl font-black mb-4">DERNIÈRE ÉTAPE !</h2>
                <p className="text-white/70 mb-8 max-w-[250px] mx-auto">
                    Pour révéler votre gain, quelle note donneriez-vous à votre expérience aujourd'hui ?
                </p>

                <div className="flex items-center gap-2 justify-center mb-12">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            onMouseEnter={() => setHover(star)}
                            onMouseLeave={() => setHover(0)}
                            onClick={() => setRating(star)}
                            className="p-1 transition-transform active:scale-95"
                        >
                            <Star
                                className={`w-12 h-12 transition-all ${star <= (hover || rating)
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-white/20'
                                    }`}
                            />
                        </button>
                    ))}
                </div>

                {rating > 0 && rating <= 3 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-sm mx-auto">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                            <p className="text-[10px] text-white/60 font-black uppercase tracking-widest mb-2">🛡️ Feedback 100% anonyme</p>
                            <p className="text-[11px] text-white/40 leading-relaxed italic">
                                Vos remarques nous sont envoyées sans aucune information personnelle. Aidez-nous à nous améliorer !
                            </p>
                        </div>
                        <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Que pourrions-nous améliorer lors de votre prochaine visite ?"
                            className="w-full bg-white border-2 border-white/20 rounded-2xl p-4 text-gray-900 placeholder-gray-400 text-sm transition-all outline-none min-h-[120px] shadow-xl focus:border-white focus:ring-4 focus:ring-white/20 font-medium"
                        />
                    </div>
                )}
            </div>

            <div className="w-full space-y-6 px-4">
                <div className="bg-white/5 border-2 border-dashed border-white/20 p-8 rounded-3xl text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-white/5 blur-xl group-hover:bg-white/10 transition-all" />
                    <div className="relative">
                        <p className="text-white/30 text-xs font-bold uppercase tracking-widest mb-2">Récompense bloquée</p>
                        <h3 className="text-2xl font-black text-white/10 blur-[4px] select-none uppercase">VOTRE CADEAU ICI</h3>
                    </div>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={rating === 0 || loading}
                    className={`w-full bg-white py-5 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 transition-all ${rating === 0 ? 'opacity-30' : 'shadow-2xl active:scale-95'
                        }`}
                    style={{ color: 'var(--primary-color)' }}
                >
                    {loading ? 'CONFIRMATION...' : 'RÉVÉLER MON GAIN'} <ArrowRight className="w-6 h-6" />
                </button>
            </div>
        </div>
    )
}
