'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Store, MapPin, Link as LinkIcon, Save, Loader2, AlertCircle, CheckCircle2, Upload, Image as ImageIcon, Palette, CreditCard, Coins, Undo2, Trophy, Star, Zap, ChevronDown, ChevronUp, ExternalLink, Info } from 'lucide-react'
import { useNavigationGuard } from '@/lib/contexts/NavigationGuardContext'
import { motion, AnimatePresence } from 'framer-motion'
import { PLAN_PRICES, PLAN_LABELS } from '@/lib/plans'
import type { PlanType } from '@/lib/plans'

const PLAN_CONFIG: { plan: PlanType; label: string; icon: React.ElementType; features: string[] }[] = [
    {
        plan: 'roue',
        label: 'Roue',
        icon: Trophy,
        features: ['Roue de la fortune', 'Coupons récompenses', 'Studio Print A5', 'Validation coupons', 'QR Code campagne'],
    },
    {
        plan: 'fidelite',
        label: 'Fidélité',
        icon: Star,
        features: ['Carte de fidélité', 'Collecte contacts (email / SMS)', 'Parcours avis Google', 'QR Code campagne'],
    },
    {
        plan: 'full_pro',
        label: 'Full Pro',
        icon: Zap,
        features: ['Tout de Roue', 'Tout de Fidélité', 'Dashboard unifié', 'Accès prioritaire aux nouvelles fonctionnalités'],
    },
]

function SubscriptionSection({
    subscription, subLoading, canDebug,
    onSubscribe, onSwitchPlan, onPortal, onReset, onFullReset, onTrialEndDebug
}: {
    subscription: any
    subLoading: boolean
    canDebug: boolean
    onSubscribe: (plan: PlanType, billing: 'monthly' | 'annual') => void
    onSwitchPlan: (plan: PlanType, billing: 'monthly' | 'annual') => void
    onPortal: () => void
    onReset: () => void
    onFullReset: () => void
    onTrialEndDebug: () => void
}) {
    const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')
    const [showChangePlan, setShowChangePlan] = useState(false)

    const isActive = subscription && (subscription.status === 'active' || subscription.status === 'trialing')
    const isEnded = subscription && (subscription.status === 'canceled' || subscription.status === 'unpaid')
    const isIssue = subscription && (subscription.status === 'past_due' || subscription.status === 'unpaid' || subscription.status === 'incomplete')
    const isTrial = subscription?.status === 'trialing'
    const isScheduledToCancel = subscription?.cancel_at_period_end || !!subscription?.cancel_at

    const endDate = isTrial ? subscription?.trial_end : (subscription?.cancel_at || subscription?.current_period_end)
    const dateFormatted = endDate ? new Date(endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : null

    const currentPlan = subscription?.plan as PlanType | undefined
    const currentPlanLabel = currentPlan ? (PLAN_LABELS[currentPlan] || currentPlan) : null

    return (
        <div className="rounded-xl border p-5 space-y-5"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>

            <div className="flex items-start justify-between gap-3">
                <div>
                    <h2 className="text-base font-semibold" style={{ color: 'var(--text)' }}>Mon Abonnement</h2>
                    {isActive && currentPlanLabel && (
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Plan {currentPlanLabel}</p>
                    )}
                    {!isActive && (
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Choisissez votre offre</p>
                    )}
                </div>
                {isActive && (
                    <button
                        disabled={subLoading}
                        onClick={onPortal}
                        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all disabled:opacity-50 flex-shrink-0"
                        style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', background: 'var(--bg-subtle)' }}
                    >
                        {subLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ExternalLink className="w-3 h-3" />}
                        Gérer (Stripe)
                    </button>
                )}
            </div>

            {/* Active status card */}
            {isActive && (
                <div className="p-4 rounded-lg border space-y-1"
                    style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border)' }}>
                    <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            isScheduledToCancel ? 'bg-orange-400' : isTrial ? 'bg-blue-400 animate-pulse' : 'bg-green-500 animate-pulse'
                        }`} />
                        <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                            {isTrial ? 'Essai gratuit en cours' : isScheduledToCancel ? 'Résiliation programmée' : 'Abonnement actif'}
                        </span>
                    </div>
                    {dateFormatted && (
                        <p className="text-xs pl-4" style={{ color: 'var(--text-muted)' }}>
                            {isTrial
                                ? `Essai jusqu'au ${dateFormatted}`
                                : isScheduledToCancel
                                    ? `Accès jusqu'au ${dateFormatted}`
                                    : `Renouvellement le ${dateFormatted}`
                            }
                        </p>
                    )}
                </div>
            )}

            {/* Payment issue */}
            {isIssue && (
                <div className="p-4 rounded-lg border border-red-500/20 bg-red-500/5">
                    <p className="text-sm font-semibold text-red-600">Défaut de paiement</p>
                    <p className="text-xs mt-0.5 text-red-500">Mettez à jour vos informations pour conserver l'accès.</p>
                </div>
            )}

            {/* Changer d'offre toggle when active */}
            {isActive && (
                <button
                    onClick={() => setShowChangePlan(!showChangePlan)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm font-medium transition-all"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', background: 'transparent' }}
                >
                    <span>Changer d'offre</span>
                    {showChangePlan ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
            )}

            {/* Plan cards */}
            {(!isActive || showChangePlan) && (
                <div className="space-y-3">
                    {isActive && showChangePlan && (
                        <div className="flex gap-2.5 p-3 rounded-lg border"
                            style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border)' }}>
                            <Info className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
                            <div className="space-y-1">
                                <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>Comment fonctionne le changement de plan ?</p>
                                <ul className="space-y-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                                    <li>· Le changement est immédiat — votre accès bascule de suite.</li>
                                    <li>· La différence de prix est calculée au prorata sur votre prochaine facture.</li>
                                    <li>· Aucune interruption de service, aucun frais caché.</li>
                                </ul>
                            </div>
                        </div>
                    )}
                    <div className="flex items-center gap-1 p-1 rounded-lg w-fit"
                        style={{ background: 'var(--bg-subtle)' }}>
                        {(['monthly', 'annual'] as const).map(b => (
                            <button key={b} onClick={() => setBilling(b)}
                                className="px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2"
                                style={{
                                    background: billing === b ? 'var(--bg-surface)' : 'transparent',
                                    color: billing === b ? 'var(--text)' : 'var(--text-muted)',
                                    boxShadow: billing === b ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                }}
                            >
                                {b === 'monthly' ? 'Mensuel' : 'Annuel'}
                                {b === 'annual' && (
                                    <span className="text-[10px] font-semibold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">-20%</span>
                                )}
                            </button>
                        ))}
                    </div>

                    {(isActive ? PLAN_CONFIG.filter(p => p.plan !== currentPlan) : PLAN_CONFIG).map(({ plan, label, icon: Icon, features }) => {
                        const price = PLAN_PRICES[plan][billing]
                        const monthlyEquiv = billing === 'annual' ? Math.round(price / 12) : price

                        return (
                            <div key={plan} className="relative rounded-xl border p-4 transition-all"
                                style={{
                                    borderColor: plan === 'full_pro' ? 'var(--accent)' : 'var(--border)',
                                    background: plan === 'full_pro' ? 'var(--accent-light)' : 'var(--bg-subtle)',
                                }}
                            >
                                {plan === 'full_pro' && (
                                    <div className="absolute -top-2.5 left-4 text-[10px] font-semibold px-2.5 py-0.5 rounded-full"
                                        style={{ background: 'var(--accent)', color: '#fff' }}>
                                        Recommandé
                                    </div>
                                )}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Icon className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                                        <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{label}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-semibold" style={{ color: 'var(--text)' }}>{monthlyEquiv}€</p>
                                        <p className="text-[10px]" style={{ color: 'var(--text-faint)' }}>/ mois</p>
                                    </div>
                                </div>

                                <div className="space-y-1 mb-3">
                                    {features.map((f, i) => (
                                        <div key={i} className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                                            <CheckCircle2 className="w-3 h-3 shrink-0" style={{ color: 'var(--text-faint)' }} />
                                            {f}
                                        </div>
                                    ))}
                                </div>

                                <button
                                    disabled={subLoading}
                                    onClick={() => isActive ? onSwitchPlan(plan, billing) : onSubscribe(plan, billing)}
                                    className="w-full py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50 cursor-pointer"
                                    style={{ background: 'var(--text)', color: 'var(--bg)' }}
                                >
                                    {subLoading
                                        ? <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                                        : isActive ? 'Passer à ce plan' : 'Commencer'
                                    }
                                </button>
                            </div>
                        )
                    })}
                </div>
            )}

            {isActive && (
                <p className="text-center text-xs" style={{ color: 'var(--text-faint)' }}>
                    Factures, carte bancaire et annulation via le portail Stripe.
                </p>
            )}

            {isEnded && !isIssue && (
                <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                    Votre abonnement a expiré. Choisissez une offre ci-dessus pour reprendre l'accès.
                </p>
            )}

            {canDebug && (
                <div className="pt-4 border-t flex flex-col gap-3" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex justify-between items-center gap-4 flex-wrap">
                        <p className="text-[10px] font-medium" style={{ color: 'var(--text-faint)' }}>
                            {subscription?.stripe_customer_id ? `ID Client : ${subscription.stripe_customer_id}` : 'Aucun abonnement actif'}
                        </p>
                        <div className="flex gap-4 flex-wrap">
                            {subscription && (
                                <>
                                    <button onClick={onTrialEndDebug} className="text-[10px] text-orange-400 hover:text-orange-500 transition-colors">
                                        [ SIMULATE EXPIRED ]
                                    </button>
                                    <button onClick={onReset} className="text-[10px] text-red-400 hover:text-red-500 transition-colors">
                                        [ RESET SUB ]
                                    </button>
                                </>
                            )}
                            <button onClick={onFullReset} className="text-[10px] text-red-600 hover:text-red-700 font-bold transition-colors">
                                [ FULL RESET → ONBOARDING ]
                            </button>
                        </div>
                    </div>
                    <p className="text-[9px] text-right leading-none" style={{ color: 'var(--text-faint)' }}>
                        RESET SUB : supprime la subscription en base. FULL RESET : supprime tout le compte (restaurant + données) → onboarding.
                    </p>
                </div>
            )}
        </div>
    )
}

export default function SettingsPage() {
    const [name, setName] = useState('')
    const [address, setAddress] = useState('')
    const [googleLink, setGoogleLink] = useState('')
    const [logoUrl, setLogoUrl] = useState('')
    const [primaryColor, setPrimaryColor] = useState('#1d1dd7')
    const [averageTicket, setAverageTicket] = useState('15')
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [subLoading, setSubLoading] = useState(false)
    const [subscription, setSubscription] = useState<any>(null)
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)
    const [canDebug, setCanDebug] = useState(false)
    const { setIsDirty, isDirty } = useNavigationGuard()
    const router = useRouter()

    const supabase = createClient()

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search)

        async function fetchSettings() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data } = await supabase
                .from('restaurants')
                .select('*')
                .eq('user_id', user.id)
                .single()

            if (data) {
                setName(data.name)
                setAddress(data.address || '')
                setGoogleLink(data.google_link || '')
                setLogoUrl(data.logo_url || '')
                setPrimaryColor(data.primary_color || '#1d1dd7')
                setAverageTicket(data.average_ticket?.toString() || '15')

                const { data: sub } = await supabase
                    .from('subscriptions')
                    .select('*')
                    .eq('restaurant_id', data.id)
                    .single()

                // Merge plan from restaurants.subscription_plan into subscription object
                setSubscription(sub ? { ...sub, plan: data.subscription_plan } : sub)
            }

            try {
                const debugRes = await fetch('/api/admin/check-debug')
                const { canDebug } = await debugRes.json()
                setCanDebug(canDebug)
            } catch {
                setCanDebug(false)
            }

            setLoading(false)
        }

        async function init() {
            const sessionId = searchParams.get('session_id')
            if (sessionId) {
                // Verify with Stripe and save plan before reading settings
                await fetch('/api/stripe/verify-checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sessionId }),
                }).catch(() => {})
                setStatus({ type: 'success', message: 'Félicitations ! Votre abonnement est actif.' })
                // Refresh server components so PlanContext picks up the new plan
                router.refresh()
            }
            if (searchParams.get('stripe') === 'return') {
                setStatus({ type: 'success', message: 'Vos modifications ont été prises en compte (Stripe).' })
            }
            await fetchSettings()
        }

        init()
    }, [])

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) { e.preventDefault(); e.returnValue = '' }
        }
        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }, [isDirty])

    const handleSubscription = async (plan: PlanType, billing: 'monthly' | 'annual') => {
        setSubLoading(true)
        try {
            const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan, billing })
            })
            const { url, error } = await res.json()
            if (error) throw new Error(error)
            window.location.href = url
        } catch (err: any) {
            setStatus({ type: 'error', message: err.message })
        } finally {
            setSubLoading(false)
        }
    }

    const handleSwitchPlan = async (plan: PlanType, billing: 'monthly' | 'annual') => {
        if (!confirm(`Confirmer le passage au plan ${plan === 'roue' ? 'Roue' : plan === 'fidelite' ? 'Fidélité' : 'Full Pro'} ? Le changement est immédiat avec prorata sur votre prochaine facture.`)) return
        setSubLoading(true)
        try {
            const res = await fetch('/api/stripe/switch-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan, billing })
            })
            const { success, error } = await res.json()
            if (error) throw new Error(error)
            if (success) {
                setStatus({ type: 'success', message: 'Plan mis à jour ! La page va se recharger.' })
                setTimeout(() => window.location.reload(), 1500)
            }
        } catch (err: any) {
            setStatus({ type: 'error', message: err.message })
        } finally {
            setSubLoading(false)
        }
    }

    const handlePortal = async () => {
        setSubLoading(true)
        try {
            const res = await fetch('/api/stripe/portal', { method: 'POST' })
            const { url, error } = await res.json()
            if (error) throw new Error(error)
            window.location.href = url
        } catch (err: any) {
            setStatus({ type: 'error', message: err.message })
        } finally {
            setSubLoading(false)
        }
    }

    const handleReset = async () => {
        if (!confirm('ATTENTION : Cette action supprime UNIQUEMENT l\'affichage de l\'abonnement dans Avisly (Supabase). \n\nVotre abonnement Stripe RESTERA ACTIF et vous continuerez d\'être prélevé. \n\nUtilisez ceci uniquement pour tester l\'interface d\'achat. Confirmer ?')) return
        setSubLoading(true)
        try {
            const res = await fetch('/api/stripe/reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullReset: false }),
            })
            const { success, error } = await res.json()
            if (error) throw new Error(error)
            if (success) { setStatus({ type: 'success', message: 'Abonnement réinitialisé ! Rechargez la page.' }); window.location.reload() }
        } catch (err: any) {
            setStatus({ type: 'error', message: err.message })
        } finally {
            setSubLoading(false)
        }
    }

    const handleFullReset = async () => {
        if (!confirm('FULL RESET : Cette action supprime le restaurant, toutes les campagnes, rewards, sessions, coupons et la subscription.\n\nTu seras redirigé vers l\'onboarding pour repartir de zéro.\n\nL\'abonnement Stripe REST ACTIF côté Stripe (annule-le manuellement si besoin).\n\nConfirmer ?')) return
        setSubLoading(true)
        try {
            const res = await fetch('/api/stripe/reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullReset: true }),
            })
            const { success, error } = await res.json()
            if (error) throw new Error(error)
            if (success) window.location.href = '/onboarding'
        } catch (err: any) {
            setStatus({ type: 'error', message: err.message })
        } finally {
            setSubLoading(false)
        }
    }

    const handleTrialEndDebug = async () => {
        if (!confirm('DEBUG : Voulez-vous simuler la FIN de votre essai ? L\'accès aux pages premium sera bloqué.')) return
        setSubLoading(true)
        try {
            const res = await fetch('/api/stripe/trial-end-debug', { method: 'POST' })
            const { success, error } = await res.json()
            if (error) throw new Error(error)
            if (success) { setStatus({ type: 'success', message: 'Essai expiré (simulé) !' }); window.location.reload() }
        } catch (err: any) {
            setStatus({ type: 'error', message: err.message })
        } finally {
            setSubLoading(false)
        }
    }

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setUploading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Non authentifié')
            const fileExt = file.name.split('.').pop()
            const fileName = `${user.id}-${Math.random()}.${fileExt}`
            const filePath = `logos/${fileName}`
            const { error: uploadError } = await supabase.storage.from('logos').upload(filePath, file)
            if (uploadError) throw uploadError
            const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(filePath)
            setLogoUrl(publicUrl)
            setIsDirty(true)
            setStatus({ type: 'success', message: 'Logo téléchargé ! N\'oubliez pas de sauvegarder.' })
        } catch (err: any) {
            setStatus({ type: 'error', message: "Erreur d'upload : assurez-vous que le bucket 'logos' est créé en mode public." })
        } finally {
            setUploading(false)
            setTimeout(() => setStatus(null), 3000)
        }
    }

    const handleSave = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        setSaving(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            const { error } = await supabase
                .from('restaurants')
                .update({ name, address, google_link: googleLink, logo_url: logoUrl, primary_color: primaryColor, average_ticket: parseFloat(averageTicket) || 15 })
                .eq('user_id', user?.id)
            if (error) throw error
            setIsDirty(false)
            setStatus({ type: 'success', message: 'Paramètres mis à jour !' })
        } catch (err: any) {
            setStatus({ type: 'error', message: err.message })
        } finally {
            setSaving(false)
            setTimeout(() => setStatus(null), 3000)
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center min-h-[300px]">
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--text-faint)' }} />
        </div>
    )

    const inputClass = "w-full pl-10 pr-4 py-3 rounded-lg border text-sm outline-none transition-all"
    const inputStyle = { background: 'var(--bg-subtle)', borderColor: 'var(--border)', color: 'var(--text)' }

    return (
        <div className="space-y-6 max-w-2xl mx-auto pb-24">
            <div>
                <h1 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>Paramètres de l'établissement</h1>
                <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Modifiez les informations de votre restaurant et votre lien Google.</p>
            </div>

            <div className="rounded-xl border p-5" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Nom du restaurant</label>
                            <div className="relative">
                                <Store className="absolute left-3 top-3 w-4 h-4" style={{ color: 'var(--text-faint)' }} />
                                <input required type="text" className={inputClass} style={inputStyle}
                                    value={name} placeholder="ex: Le Petit Bistro"
                                    onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                                    onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                                    onChange={e => { setName(e.target.value); setIsDirty(true) }} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Adresse</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 w-4 h-4" style={{ color: 'var(--text-faint)' }} />
                                <input required type="text" className={inputClass} style={inputStyle}
                                    value={address} placeholder="8 rue de la Paix, Paris"
                                    onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                                    onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                                    onChange={e => { setAddress(e.target.value); setIsDirty(true) }} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Lien Google Business</label>
                            <div className="relative">
                                <LinkIcon className="absolute left-3 top-3 w-4 h-4" style={{ color: 'var(--text-faint)' }} />
                                <input required type="url" className={inputClass} style={inputStyle}
                                    value={googleLink} placeholder="https://g.page/r/your-id"
                                    onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                                    onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                                    onChange={e => { setGoogleLink(e.target.value); setIsDirty(true) }} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Couleur primaire</label>
                            <div className="flex items-center gap-3 p-3 rounded-lg border"
                                style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border)' }}>
                                <Palette className="w-4 h-4 shrink-0" style={{ color: 'var(--text-faint)' }} />
                                <input type="color" className="w-10 h-10 rounded-lg border-0 cursor-pointer bg-transparent"
                                    value={primaryColor}
                                    onChange={e => { setPrimaryColor(e.target.value); setIsDirty(true) }} />
                                <div className="flex-1">
                                    <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{primaryColor.toUpperCase()}</p>
                                    <p className="text-xs" style={{ color: 'var(--text-faint)' }}>Utilisée pour les boutons et la roue.</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Panier moyen (€)</label>
                            <div className="flex items-center gap-3 p-3 rounded-lg border"
                                style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border)' }}>
                                <Coins className="w-4 h-4 shrink-0" style={{ color: 'var(--text-faint)' }} />
                                <div className="flex-1">
                                    <input type="number" className="w-full bg-transparent border-0 focus:ring-0 outline-none text-sm"
                                        style={{ color: 'var(--text)' }}
                                        value={averageTicket} placeholder="15"
                                        onChange={e => { setAverageTicket(e.target.value); setIsDirty(true) }} />
                                    <p className="text-xs" style={{ color: 'var(--text-faint)' }}>Utilisé pour estimer l'impact sur votre chiffre d'affaires.</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Logo de l'établissement</label>
                            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-lg border"
                                style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border)' }}>
                                <div className="w-16 h-16 rounded-xl border flex items-center justify-center overflow-hidden shrink-0"
                                    style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                                    {logoUrl
                                        ? <img src={logoUrl} alt="Logo preview" className="w-full h-full object-contain p-1" />
                                        : <ImageIcon className="w-6 h-6" style={{ color: 'var(--text-faint)' }} />
                                    }
                                </div>
                                <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                                    <label className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium cursor-pointer transition-all w-full sm:w-auto"
                                        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                                        <Upload className="w-4 h-4" />
                                        {uploading ? 'Chargement...' : 'Choisir un fichier'}
                                        <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={uploading} />
                                    </label>
                                    <p className="text-xs" style={{ color: 'var(--text-faint)' }}>JPG, PNG ou SVG. Max 2 Mo.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 pt-2">
                        <button disabled={saving} type="submit"
                            className="w-full py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
                            style={{ background: 'var(--text)', color: 'var(--bg)' }}>
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Enregistrer les modifications
                        </button>

                        {status && (
                            <div className={`flex items-center justify-center gap-2 text-sm font-medium ${status.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                {status.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                {status.message}
                            </div>
                        )}
                    </div>
                </form>
            </div>

            <div id="plans" style={{ scrollMarginTop: '2rem' }}>
            <SubscriptionSection
                subscription={subscription}
                subLoading={subLoading}
                canDebug={canDebug}
                onSubscribe={handleSubscription}
                onSwitchPlan={handleSwitchPlan}
                onPortal={handlePortal}
                onReset={handleReset}
                onFullReset={handleFullReset}
                onTrialEndDebug={handleTrialEndDebug}
            />
            </div>

            <AnimatePresence>
                {isDirty && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] w-[90%] max-w-lg"
                    >
                        <div className="p-4 rounded-xl shadow-2xl flex items-center justify-between gap-4"
                            style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div className="flex items-center gap-3 px-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                                <p className="text-white text-sm font-medium">Modifications non enregistrées</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => window.location.reload()}
                                    className="px-3 py-1.5 text-xs font-medium text-white/50 hover:text-white transition-colors flex items-center gap-1.5">
                                    <Undo2 className="w-3 h-3" />
                                    Réinitialiser
                                </button>
                                <button onClick={handleSave} disabled={saving}
                                    className="px-5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 disabled:opacity-50"
                                    style={{ background: 'var(--accent)', color: '#fff' }}>
                                    {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                    Enregistrer
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
