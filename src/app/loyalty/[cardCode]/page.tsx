'use client'

import { useEffect, useState, Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import { Star, Trophy, Loader2, RefreshCw, ThumbsUp, Mail, Phone, Shield, CheckCircle2 } from 'lucide-react'

function ReviewBanner({ primaryColor }: { primaryColor: string }) {
    const searchParams = useSearchParams()
    if (searchParams.get('review') !== 'done') return null
    return (
        <div
            className="mx-6 mt-2 py-3 px-5 rounded-2xl flex items-center justify-center gap-2"
            style={{ backgroundColor: `${primaryColor}25`, border: `1px solid ${primaryColor}50` }}
        >
            <ThumbsUp className="w-4 h-4 shrink-0" style={{ color: primaryColor }} />
            <p className="text-white font-bold text-sm">Merci pour votre avis Google !</p>
        </div>
    )
}

interface CardData {
    cardCode: string
    pointsBalance: number
    rewardThreshold: number
    rewardDescription: string
    progress: number
    rewardReached: boolean
    restaurant: {
        name: string
        logoUrl: string | null
        primaryColor: string
        googleLink: string | null
    }
    createdAt: string
    hasContact: boolean
    customerEmail: string | null
    customerFirstName: string | null
    customerLastName: string | null
}

export default function LoyaltyCardPage() {
    const { cardCode } = useParams()
    const [card, setCard] = useState<CardData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [refreshing, setRefreshing] = useState(false)

    const [contactSaved, setContactSaved] = useState(false)
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [smsOptIn, setSmsOptIn] = useState(false)
    const [savingContact, setSavingContact] = useState(false)
    const [contactError, setContactError] = useState<string | null>(null)

    const fetchCard = async (silent = false) => {
        if (!silent) setLoading(true)
        else setRefreshing(true)

        try {
            const res = await fetch(`/api/loyalty/${cardCode}`)
            const data = await res.json()

            if (!res.ok) throw new Error(data.error || 'Carte introuvable')
            setCard(data)
            if (data.hasContact) setContactSaved(true)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    const handleSaveContact = async () => {
        if (!card || !email) return
        setSavingContact(true)
        setContactError(null)
        try {
            const res = await fetch('/api/loyalty/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cardCode: card.cardCode, firstName, lastName, email, phone, smsOptIn })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setContactSaved(true)
        } catch (err: any) {
            setContactError(err.message)
        } finally {
            setSavingContact(false)
        }
    }

    useEffect(() => {
        if (cardCode) fetchCard()
    }, [cardCode])

    // Auto-refresh every 30s to reflect point updates
    useEffect(() => {
        const interval = setInterval(() => fetchCard(true), 30000)
        return () => clearInterval(interval)
    }, [cardCode])

    if (loading) return (
        <div className="flex-1 flex items-center justify-center min-h-screen bg-gray-950">
            <div className="flex flex-col items-center gap-4 text-white">
                <Loader2 className="w-8 h-8 animate-spin opacity-50" />
                <p className="text-sm font-medium opacity-50">Chargement de votre carte...</p>
            </div>
        </div>
    )

    if (error || !card) return (
        <div className="flex-1 flex items-center justify-center min-h-screen bg-gray-950 p-6">
            <div className="text-center text-white">
                <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-8 h-8 opacity-40" />
                </div>
                <h2 className="text-xl font-bold mb-2">Carte introuvable</h2>
                <p className="text-white/50 text-sm">{error || 'Ce lien n\'est plus valide.'}</p>
            </div>
        </div>
    )

    const { restaurant, pointsBalance, rewardThreshold, rewardDescription, progress, rewardReached } = card
    const primaryColor = restaurant.primaryColor || '#1d1dd7'

    // Dot indicators for points
    const dots = Array.from({ length: rewardThreshold }, (_, i) => i < pointsBalance)

    return (
        <div
            className="min-h-screen flex flex-col"
            style={{ background: `linear-gradient(160deg, ${primaryColor}22 0%, #0a0a0f 50%)` }}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-12 pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center overflow-hidden shadow-lg">
                        {restaurant.logoUrl ? (
                            <img src={restaurant.logoUrl} alt={restaurant.name} className="w-full h-full object-contain p-1" />
                        ) : (
                            <span className="text-base font-black" style={{ color: primaryColor }}>
                                {restaurant.name.charAt(0)}
                            </span>
                        )}
                    </div>
                    <div>
                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Carte de fidélité</p>
                        <p className="text-white font-black text-sm leading-tight">{restaurant.name}</p>
                    </div>
                </div>
                <button
                    onClick={() => fetchCard(true)}
                    className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all active:scale-95"
                >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Thank you banner (shown when arriving from Google review) */}
            <Suspense fallback={null}>
                <ReviewBanner primaryColor={primaryColor} />
            </Suspense>

            {/* Main card */}
            <div className="flex-1 flex flex-col items-center justify-between px-6 pb-10 gap-8">

                {/* Points display */}
                <div className="w-full text-center pt-4">
                    <div className="relative inline-flex flex-col items-center">
                        <div
                            className="text-8xl font-black tracking-tighter leading-none"
                            style={{ color: primaryColor }}
                        >
                            {pointsBalance}
                        </div>
                        <div className="text-white/40 text-xs font-bold uppercase tracking-[0.3em] mt-1">
                            point{pointsBalance > 1 ? 's' : ''} sur {rewardThreshold}
                        </div>
                    </div>
                </div>

                {/* Progress dots (max 10 shown, then bar) */}
                {rewardThreshold <= 12 ? (
                    <div className="flex flex-wrap justify-center gap-2 px-4">
                        {dots.map((filled, i) => (
                            <div
                                key={i}
                                className="w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500"
                                style={{
                                    backgroundColor: filled ? primaryColor : 'transparent',
                                    borderColor: filled ? primaryColor : 'rgba(255,255,255,0.15)',
                                    boxShadow: filled ? `0 0 12px ${primaryColor}88` : 'none'
                                }}
                            >
                                {filled && <Star className="w-3 h-3 fill-white text-white" />}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="w-full space-y-3">
                        <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{
                                    width: `${progress}%`,
                                    background: `linear-gradient(90deg, ${primaryColor}, ${primaryColor}cc)`,
                                    boxShadow: `0 0 12px ${primaryColor}66`
                                }}
                            />
                        </div>
                        <div className="flex justify-between text-[10px] font-bold text-white/30 uppercase tracking-widest px-1">
                            <span>0</span>
                            <span>{rewardThreshold} pts</span>
                        </div>
                    </div>
                )}

                {/* Reward info */}
                {rewardReached ? (
                    <div
                        className="w-full p-6 rounded-[2rem] text-center border-2 relative overflow-hidden"
                        style={{ borderColor: primaryColor, backgroundColor: `${primaryColor}22` }}
                    >
                        <div className="absolute inset-0 blur-2xl opacity-20" style={{ backgroundColor: primaryColor }} />
                        <div className="relative">
                            <Trophy className="w-10 h-10 mx-auto mb-3" style={{ color: primaryColor }} />
                            <p className="text-white font-black text-xl mb-1">Félicitations !</p>
                            <p className="text-white/70 text-sm font-medium">Vous avez gagné :</p>
                            <p className="text-white font-black text-lg mt-1">{rewardDescription}</p>
                            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-4">
                                Présentez cette carte au comptoir
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="w-full p-5 rounded-[2rem] bg-white/5 border border-white/10 text-center">
                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Votre récompense</p>
                        <p className="text-white font-bold text-base">{rewardDescription}</p>
                        <p className="text-white/30 text-xs mt-2">
                            encore {rewardThreshold - pointsBalance} visite{rewardThreshold - pointsBalance > 1 ? 's' : ''} pour en bénéficier
                        </p>
                    </div>
                )}

                {/* QR Code */}
                <div className="flex flex-col items-center gap-4">
                    <div className="bg-white p-4 rounded-3xl shadow-2xl">
                        <QRCodeSVG
                            value={card.cardCode}
                            size={180}
                            bgColor="#ffffff"
                            fgColor="#0a0a0f"
                            level="M"
                        />
                    </div>
                    <div className="text-center">
                        <p className="text-white font-black text-xl tracking-[0.15em]">{card.cardCode}</p>
                        <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mt-1">
                            Montrez ce code au comptoir
                        </p>
                    </div>
                </div>

                {/* Contact section */}
                {contactSaved ? (
                    <div className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-white/5 border border-white/10">
                        <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                        <p className="text-white/50 text-xs font-bold">
                            {card.customerFirstName
                                ? `${card.customerFirstName} ${card.customerLastName} · ${card.customerEmail}`
                                : `${firstName} ${lastName} · ${email}`
                            }
                        </p>
                    </div>
                ) : (
                    <div className="w-full space-y-4 p-5 rounded-[2rem] bg-white/5 border border-white/10">
                        <div>
                            <p className="text-white font-black text-sm mb-1">Sécurisez vos points</p>
                            <p className="text-white/40 text-xs leading-relaxed">
                                Ne perdez jamais vos points en cas de changement d'appareil.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="text"
                                    placeholder="Prénom *"
                                    className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white text-sm font-medium placeholder-white/30 outline-none focus:border-white/30 transition-all"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                />
                                <input
                                    type="text"
                                    placeholder="Nom *"
                                    className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white text-sm font-medium placeholder-white/30 outline-none focus:border-white/30 transition-all"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                />
                            </div>

                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                <input
                                    type="email"
                                    placeholder="Email *"
                                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white text-sm font-medium placeholder-white/30 outline-none focus:border-white/30 transition-all"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                <input
                                    type="tel"
                                    placeholder="+33 6 12 34 56 78 (optionnel)"
                                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white text-sm font-medium placeholder-white/30 outline-none focus:border-white/30 transition-all"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>

                            {phone && (
                                <label className="flex items-start gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={smsOptIn}
                                        onChange={(e) => setSmsOptIn(e.target.checked)}
                                        className="mt-0.5 shrink-0 accent-white"
                                    />
                                    <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                                        J'accepte de recevoir les offres de {restaurant.name} par SMS
                                    </span>
                                </label>
                            )}

                            {contactError && (
                                <p className="text-red-400 text-xs font-bold">{contactError}</p>
                            )}

                            <button
                                onClick={handleSaveContact}
                                disabled={savingContact || !firstName || !lastName || !email}
                                className="w-full py-3 rounded-xl font-black text-white text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 active:scale-95"
                                style={{ backgroundColor: primaryColor }}
                            >
                                {savingContact
                                    ? <Loader2 className="w-4 h-4 animate-spin" />
                                    : <Shield className="w-4 h-4" />
                                }
                                ENREGISTRER MON PROFIL
                            </button>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="text-center space-y-2">
                    <p className="text-white/20 text-[9px] font-medium">
                        Carte créée le {new Date(card.createdAt).toLocaleDateString('fr-FR')} · Propulsé par Avisly
                    </p>
                    <a
                        href="/loyalty/recover"
                        className="text-white/30 text-[9px] font-bold uppercase tracking-widest hover:text-white/50 transition-colors"
                    >
                        Vous avez changé d'appareil ? Retrouvez votre carte →
                    </a>
                </div>
            </div>
        </div>
    )
}
