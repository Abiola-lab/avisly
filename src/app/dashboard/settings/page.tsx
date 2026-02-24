'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Store, MapPin, Link as LinkIcon, Save, Loader2, AlertCircle, CheckCircle2, Upload, Image as ImageIcon, Palette, Bell, CreditCard, Zap } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'

export default function SettingsPage() {
    const [name, setName] = useState('')
    const [address, setAddress] = useState('')
    const [googleLink, setGoogleLink] = useState('')
    const [logoUrl, setLogoUrl] = useState('')
    const [primaryColor, setPrimaryColor] = useState('#1d1dd7')
    const [badBuzzAlerts, setBadBuzzAlerts] = useState(true)
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [subLoading, setSubLoading] = useState(false)
    const [subscription, setSubscription] = useState<any>(null)
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)

    const supabase = createClient()

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search)
        if (searchParams.get('session_id')) {
            setStatus({ type: 'success', message: 'Félicitations ! Votre abonnement est actif.' })
        }
        if (searchParams.get('stripe') === 'return') {
            setStatus({ type: 'success', message: 'Vos modifications ont été prises en compte (Stripe).' })
        }

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
                setBadBuzzAlerts(data.bad_buzz_alerts !== false)

                // Fetch subscription
                const { data: sub } = await supabase
                    .from('subscriptions')
                    .select('*')
                    .eq('restaurant_id', data.id)
                    .single()

                setSubscription(sub)
            }
            setLoading(false)
        }

        fetchSettings()
    }, [])

    const handleSubscription = async (planType: 'monthly' | 'annual') => {
        setSubLoading(true)
        try {
            const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planType })
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
        if (!confirm('DEBUG : Voulez-vous vraiment supprimer votre abonnement en base Supabase ? Cela ne l\'annulera pas dans Stripe.')) return
        setSubLoading(true)
        try {
            const res = await fetch('/api/stripe/reset', { method: 'POST' })
            const { success, error } = await res.json()
            if (error) throw new Error(error)
            if (success) {
                setStatus({ type: 'success', message: 'Abonnement réinitialisé ! Rechargez la page.' })
                window.location.reload()
            }
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

            const { error: uploadError } = await supabase.storage
                .from('logos') // Assurez-vous que ce bucket existe dans Supabase
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('logos')
                .getPublicUrl(filePath)

            setLogoUrl(publicUrl)
            setStatus({ type: 'success', message: 'Logo téléchargé ! N\'oubliez pas de sauvegarder.' })
        } catch (err: any) {
            setStatus({ type: 'error', message: "Erreur d'upload : assurez-vous que le bucket 'logos' est créé en mode public." })
            console.error(err)
        } finally {
            setUploading(false)
            setTimeout(() => setStatus(null), 3000)
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            const { error } = await supabase
                .from('restaurants')
                .update({
                    name,
                    address,
                    google_link: googleLink,
                    logo_url: logoUrl,
                    primary_color: primaryColor,
                    bad_buzz_alerts: badBuzzAlerts
                })
                .eq('user_id', user?.id)

            if (error) throw error
            setStatus({ type: 'success', message: 'Paramètres mis à jour !' })
        } catch (err: any) {
            setStatus({ type: 'error', message: err.message })
        } finally {
            setSaving(false)
            setTimeout(() => setStatus(null), 3000)
        }
    }

    if (loading) return <div className="p-8 text-center text-gray-500 font-medium">Chargement des paramètres...</div>

    return (
        <div className="space-y-8 max-w-2xl">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Paramètres de l'établissement</h1>
                <p className="text-gray-500 font-medium">Modifiez les informations de votre restaurant et votre lien Google.</p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <form onSubmit={handleSave} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Nom du restaurant</label>
                            <div className="relative">
                                <Store className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                                <input
                                    required
                                    type="text"
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1d1dd7] focus:border-transparent transition-all outline-none placeholder-gray-500 text-gray-900 font-bold"
                                    value={name}
                                    placeholder="ex: Le Petit Bistro"
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Adresse</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                                <input
                                    required
                                    type="text"
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1d1dd7] focus:border-transparent transition-all outline-none placeholder-gray-500 text-gray-900 font-bold"
                                    value={address}
                                    placeholder="8 rue de la Paix, Paris"
                                    onChange={(e) => setAddress(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Thème : Couleur Primaire</label>
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                <Palette className="w-5 h-5 text-gray-400" />
                                <input
                                    type="color"
                                    className="w-12 h-12 rounded-lg border-0 cursor-pointer bg-transparent"
                                    value={primaryColor}
                                    onChange={(e) => setPrimaryColor(e.target.value)}
                                />
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-gray-700">{primaryColor.toUpperCase()}</p>
                                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">Utilisée pour les boutons et la roue.</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Notifications</label>
                            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer group">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${badBuzzAlerts ? 'bg-red-50 text-red-600' : 'bg-gray-200 text-gray-400'} transition-colors`}>
                                        <Bell className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-700">Section Feedback Anonyme</p>
                                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">Afficher les commentaires des clients mécontents sur le tableau de bord.</p>
                                    </div>
                                </div>
                                <div className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={badBuzzAlerts}
                                        onChange={(e) => setBadBuzzAlerts(e.target.checked)}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1d1dd7]"></div>
                                </div>
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Logo de l'établissement</label>
                            <div className="flex items-center gap-6 p-6 bg-gray-50 rounded-2xl border border-gray-200">
                                <div className="w-20 h-20 bg-white rounded-2xl border border-gray-200 flex items-center justify-center overflow-hidden shadow-sm shrink-0">
                                    {logoUrl ? (
                                        <img src={logoUrl} alt="Logo preview" className="w-full h-full object-contain p-2" />
                                    ) : (
                                        <ImageIcon className="w-8 h-8 text-gray-300" />
                                    )}
                                </div>
                                <div className="flex-1 space-y-2">
                                    <label className="inline-flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 cursor-pointer shadow-sm transition-all">
                                        <Upload className="w-4 h-4" />
                                        {uploading ? 'Chargement...' : 'Choisir un fichier'}
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleLogoUpload}
                                            disabled={uploading}
                                        />
                                    </label>
                                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">JPG, PNG ou SVG. Max 2Mo.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <button
                            disabled={saving}
                            type="submit"
                            className="w-full bg-[#1d1dd7] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#1515a3] transition-all disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            ENREGISTRER LES MODIFICATIONS
                        </button>

                        {status && (
                            <div className={`flex items-center justify-center gap-2 text-sm font-bold animate-in fade-in slide-in-from-top-2 ${status.type === 'success' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {status.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                {status.message}
                            </div>
                        )}
                    </div>
                </form>
            </div>

            {/* Section Abonnement */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                        <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Mon Abonnement</h2>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Gérez votre offre et vos paiements</p>
                    </div>
                </div>

                {subscription ? (() => {
                    const { status, cancel_at_period_end, trial_end, current_period_end, cancel_at } = subscription;
                    const isTrial = status === 'trialing';
                    const isActive = status === 'active';
                    const isCanceled = cancel_at_period_end;
                    const isEnded = status === 'canceled' || status === 'ended';
                    const isIssue = status === 'past_due' || status === 'unpaid' || status === 'incomplete';

                    const endDate = isTrial ? trial_end : (cancel_at || current_period_end);
                    const dateFormatted = endDate ? new Date(endDate).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    }) : '—';

                    let statusText = "Statut Inconnu";
                    let statusColor = "bg-gray-500";
                    let description = "";

                    if (isTrial) {
                        statusText = isCanceled ? "Essai (Annulation Planifiée)" : "Essai Gratuit";
                        statusColor = isCanceled ? "bg-orange-500" : "bg-green-500";
                        description = isCanceled ? `S'arrête définitivement le ${dateFormatted}` : `Offre Pro active jusqu'au ${dateFormatted}`;
                    } else if (isActive) {
                        statusText = isCanceled ? "Pro (Ne se renouvellera pas)" : "Abonnement Pro Actif";
                        statusColor = isCanceled ? "bg-orange-500" : "bg-green-500";
                        description = isCanceled ? `Fin de l'accès le ${dateFormatted}` : `Prochain renouvellement : ${dateFormatted}`;
                    } else if (isIssue) {
                        statusText = "Défaut de Paiement";
                        statusColor = "bg-red-500";
                        description = "Veuillez mettre à jour vos informations de paiement pour conserver l'accès.";
                    } else if (isEnded) {
                        statusText = "Abonnement Terminé";
                        statusColor = "bg-gray-400";
                        description = "Votre accès Pro a expiré.";
                    }

                    return (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-200">
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Votre Offre</p>
                                    <div className="flex items-center gap-2">
                                        <span className={`w-3 h-3 rounded-full ${statusColor} ${!isEnded ? 'animate-pulse' : ''}`}></span>
                                        <span className="text-xl font-black uppercase tracking-tight text-gray-900">
                                            {statusText}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 font-medium">
                                        {description}
                                    </p>
                                </div>
                                <Zap className={`w-10 h-10 ${isActive || isTrial ? 'text-yellow-400' : 'text-gray-300'}`} />
                            </div>

                            <div className="flex flex-col gap-4">
                                {isEnded ? (
                                    <button
                                        disabled={subLoading}
                                        onClick={() => handleSubscription('monthly')}
                                        className="w-full bg-[#1d1dd7] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#1515a3] transition-all"
                                    >
                                        <Zap className="w-5 h-5 fill-current" />
                                        REPRENDRE L'ABONNEMENT PRO
                                    </button>
                                ) : (
                                    <button
                                        disabled={subLoading}
                                        className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all disabled:opacity-50"
                                        onClick={handlePortal}
                                    >
                                        {subLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
                                        {isIssue ? "RÉGULARISER MA SITUATION" : "GÉRER MON ABONNEMENT (STRIPE)"}
                                    </button>
                                )}

                                <p className="text-center text-[11px] text-gray-400 font-medium leading-relaxed italic px-4">
                                    {isEnded
                                        ? "En cliquant, vous ouvrirez une nouvelle session de paiement sécurisée."
                                        : "Gérez vos factures, votre carte ou annulez en toute sécurité via le portail Stripe."}
                                </p>
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                    ID Client : {subscription.stripe_customer_id}
                                </p>
                                <button
                                    onClick={handleReset}
                                    className="text-[10px] text-red-200 font-bold uppercase tracking-widest hover:text-red-600 transition-colors"
                                >
                                    [ DEBUG RESET DB ONLY - NO STRIPE IMPACT ]
                                </button>
                            </div>
                        </div>
                    );
                })() : (
                    <div className="space-y-8">
                        <div className="bg-gradient-to-br from-[#1d1dd7] to-[#4f46e5] p-8 rounded-2xl text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                            <h3 className="text-2xl font-black mb-2 italic">7 JOURS OFFERTS ✨</h3>
                            <p className="text-white/80 text-sm font-medium leading-relaxed mb-6">
                                Profitez de toutes les fonctionnalités Pro gratuitement pendant une semaine. Sans engagement, annulez quand vous voulez.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    disabled={subLoading}
                                    onClick={() => handleSubscription('monthly')}
                                    className="bg-white text-[#1d1dd7] p-6 rounded-2xl text-center hover:scale-[1.02] transition-all shadow-xl disabled:opacity-50"
                                >
                                    <p className="text-xs font-black uppercase tracking-widest mb-1">Mensuel</p>
                                    <p className="text-2xl font-black">29,99€</p>
                                    <p className="text-[10px] opacity-70">/ mois</p>
                                </button>
                                <button
                                    disabled={subLoading}
                                    onClick={() => handleSubscription('annual')}
                                    className="bg-yellow-400 text-gray-900 p-6 rounded-2xl text-center hover:scale-[1.02] transition-all shadow-xl relative disabled:opacity-50"
                                >
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg">-15% OFF</div>
                                    <p className="text-xs font-black uppercase tracking-widest mb-1">Annuel</p>
                                    <p className="text-2xl font-black">299,99€</p>
                                    <p className="text-[10px] opacity-70">/ an (25€/mois)</p>
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            {[
                                'Campagnes illimitées',
                                'Analyses avancées & Graphiques',
                                'Alerte Bad Buzz par email (Bientôt)',
                                'Assistance Prioritaire 24/7'
                            ].map((feature, i) => (
                                <div key={i} className="flex items-center gap-3 text-sm font-medium text-gray-600">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    {feature}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
