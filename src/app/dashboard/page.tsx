'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    BarChart3,
    HandMetal,
    Star,
    QrCode,
    MousePointer2,
    TicketCheck,
    TrendingUp,
    Loader2,
    AlertTriangle,
    Coins,
    CheckCircle2,
    ArrowRight,
    CreditCard,
    Circle,
} from 'lucide-react'
import InstallationWizard from '@/components/dashboard/InstallationWizard'
import { usePlanFeature } from '@/lib/contexts/PlanContext'
import Link from 'next/link'

function StatCard({ label, value, icon: Icon, accent = false }: {
    label: string
    value: string
    icon: React.ElementType
    accent?: boolean
}) {
    return (
        <div className="rounded-xl border p-5 flex flex-col gap-4" style={{
            background: 'var(--bg-surface)',
            borderColor: 'var(--border)',
        }}>
            <div className="flex items-start justify-between">
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>
                    {label}
                </p>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: accent ? 'var(--accent-light)' : 'var(--bg-subtle)' }}>
                    <Icon className="w-3.5 h-3.5" style={{ color: accent ? 'var(--accent)' : 'var(--text-muted)' }} />
                </div>
            </div>
            <p className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
                {value}
            </p>
        </div>
    )
}

function ActivityFeed({ coupons }: { coupons: any[] }) {
    if (coupons.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-32 text-center">
                <Circle className="w-6 h-6 mb-2" style={{ color: 'var(--text-faint)' }} />
                <p className="text-xs" style={{ color: 'var(--text-faint)' }}>Aucune activité récente</p>
            </div>
        )
    }

    return (
        <div className="space-y-1">
            {coupons.map((coupon) => {
                const isUsed = coupon.status === 'used'
                const isExpired = coupon.status === 'expired'
                const timeAgo = (() => {
                    const diff = Date.now() - new Date(coupon.created_at).getTime()
                    const hours = Math.floor(diff / 3600000)
                    const days = Math.floor(hours / 24)
                    if (days > 0) return `${days}j`
                    if (hours > 0) return `${hours}h`
                    return 'maintenant'
                })()

                return (
                    <div key={coupon.id} className="flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors"
                        style={{ '--hover-bg': 'var(--bg-subtle)' } as React.CSSProperties}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-subtle)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                            isUsed ? 'bg-green-500' : isExpired ? 'bg-red-400' : 'bg-[var(--accent)]'
                        }`} />
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate" style={{ color: 'var(--text)' }}>
                                {coupon.sessions?.rewards?.label || 'Gain'}
                            </p>
                            <p className="text-[10px] font-mono" style={{ color: 'var(--text-faint)' }}>
                                {coupon.code}
                            </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                                isUsed ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400'
                                : isExpired ? 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'
                                : 'text-[var(--accent)]'
                            }`} style={!isUsed && !isExpired ? { background: 'var(--accent-light)' } : {}}>
                                {isUsed ? 'Validé' : isExpired ? 'Expiré' : 'Actif'}
                            </span>
                            <span className="text-[10px]" style={{ color: 'var(--text-faint)' }}>{timeAgo}</span>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

function HighlightCard({
    activeCampaign,
    badBuzzSessions,
    loyaltyStats,
    hasWheel,
    hasLoyalty,
    stats,
}: {
    activeCampaign: any
    badBuzzSessions: any[]
    loyaltyStats: { totalCards: number; totalPoints: number; rewardsReached: number } | null
    hasWheel: boolean
    hasLoyalty: boolean
    stats: any[]
}) {
    if (badBuzzSessions.length > 0) {
        return (
            <div className="rounded-xl border-l-4 border-red-500 p-4 flex items-center justify-between gap-4"
                style={{ background: 'var(--bg-surface)', borderTopColor: 'var(--border)', borderRightColor: 'var(--border)', borderBottomColor: 'var(--border)' }}>
                <div className="flex items-center gap-3">
                    <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                            {badBuzzSessions.length} avis négatif{badBuzzSessions.length > 1 ? 's' : ''} à analyser
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            Notes inférieures à 3 — prenez contact avec ces clients
                        </p>
                    </div>
                </div>
                <Link href="/dashboard/campaigns" className="text-xs font-semibold flex items-center gap-1 flex-shrink-0"
                    style={{ color: 'var(--text-muted)' }}>
                    Voir <ArrowRight className="w-3.5 h-3.5" />
                </Link>
            </div>
        )
    }

    if (hasLoyalty && loyaltyStats && loyaltyStats.rewardsReached > 0) {
        return (
            <div className="rounded-xl border-l-4 border-green-500 p-4 flex items-center justify-between gap-4"
                style={{ background: 'var(--bg-surface)', borderTopColor: 'var(--border)', borderRightColor: 'var(--border)', borderBottomColor: 'var(--border)' }}>
                <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                            {loyaltyStats.rewardsReached} client{loyaltyStats.rewardsReached > 1 ? 's ont' : ' a'} atteint leur récompense
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            Ils peuvent la récupérer au comptoir
                        </p>
                    </div>
                </div>
                <Link href="/dashboard/loyalty" className="text-xs font-semibold flex items-center gap-1 flex-shrink-0"
                    style={{ color: 'var(--text-muted)' }}>
                    Gérer <ArrowRight className="w-3.5 h-3.5" />
                </Link>
            </div>
        )
    }

    const totalScans = parseInt(stats[0]?.value || '0')
    if (totalScans === 0) {
        return (
            <div className="rounded-xl border-l-4 p-4 flex items-center justify-between gap-4"
                style={{ borderLeftColor: 'var(--accent)', background: 'var(--bg-surface)', borderTopColor: 'var(--border)', borderRightColor: 'var(--border)', borderBottomColor: 'var(--border)' }}>
                <div className="flex items-center gap-3">
                    <QrCode className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                    <div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                            {hasWheel ? 'Aucune campagne active' : 'Programme de fidélité non configuré'}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            Configurez et affichez votre QR code en point de vente
                        </p>
                    </div>
                </div>
                <Link href={hasWheel ? '/dashboard/campaigns' : '/dashboard/loyalty'}
                    className="text-xs font-semibold flex items-center gap-1 flex-shrink-0"
                    style={{ color: 'var(--accent)' }}>
                    Configurer <ArrowRight className="w-3.5 h-3.5" />
                </Link>
            </div>
        )
    }

    return (
        <div className="rounded-xl border-l-4 border-green-500 p-4"
            style={{ background: 'var(--bg-surface)', borderTopColor: 'var(--border)', borderRightColor: 'var(--border)', borderBottomColor: 'var(--border)' }}>
            <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                {totalScans} scan{totalScans > 1 ? 's' : ''} enregistré{totalScans > 1 ? 's' : ''}
            </p>
        </div>
    )
}

export default function DashboardPage() {
    const [stats, setStats] = useState<any[]>([])
    const [recentCoupons, setRecentCoupons] = useState<any[]>([])
    const [badBuzzSessions, setBadBuzzSessions] = useState<any[]>([])
    const [dailyStats, setDailyStats] = useState<any[]>([])
    const [funnelData, setFunnelData] = useState<any[]>([])
    const [roiData, setRoiData] = useState({ revenue: 0, customers: 0 })
    const [loyaltyStats, setLoyaltyStats] = useState<{ totalCards: number; totalPoints: number; rewardsReached: number } | null>(null)
    const [loading, setLoading] = useState(true)
    const [restaurant, setRestaurant] = useState<any>(null)
    const [rewardCount, setRewardCount] = useState(0)
    const [activeCampaign, setActiveCampaign] = useState<any>(null)
    const [hasLoyaltyProgram, setHasLoyaltyProgram] = useState(false)

    const supabase = createClient()
    const hasWheel = usePlanFeature('wheel')
    const hasLoyalty = usePlanFeature('loyalty')

    useEffect(() => {
        async function fetchStats() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: restData } = await supabase
                .from('restaurants')
                .select('*')
                .eq('user_id', user.id)
                .single()

            if (!restData) return
            setRestaurant(restData)

            const { data: campaign } = await supabase
                .from('campaigns')
                .select('id')
                .eq('restaurant_id', restData.id)
                .eq('is_active', true)
                .single()

            if (campaign) {
                setActiveCampaign(campaign)

                const { count: rCount } = await supabase
                    .from('rewards')
                    .select('*', { count: 'exact', head: true })
                    .eq('campaign_id', campaign.id)
                setRewardCount(rCount || 0)

                const { count: scans } = await supabase
                    .from('analytics_events')
                    .select('id, sessions!inner(campaign_id)', { count: 'exact', head: true })
                    .eq('event_type', 'scan')
                    .eq('sessions.campaign_id', campaign.id)

                const { count: spins } = await supabase
                    .from('analytics_events')
                    .select('id, sessions!inner(campaign_id)', { count: 'exact', head: true })
                    .eq('event_type', 'spin_completed')
                    .eq('sessions.campaign_id', campaign.id)

                const { data: ratingsData } = await supabase
                    .from('sessions')
                    .select('rating')
                    .eq('campaign_id', campaign.id)
                    .not('rating', 'is', null)

                const { count: googleClicks } = await supabase
                    .from('analytics_events')
                    .select('id, sessions!inner(campaign_id)', { count: 'exact', head: true })
                    .eq('event_type', 'google_clicked')
                    .eq('sessions.campaign_id', campaign.id)

                const { count: usedCoupons } = await supabase
                    .from('coupons')
                    .select('id, sessions!inner(campaign_id)', { count: 'exact', head: true })
                    .eq('status', 'used')
                    .eq('sessions.campaign_id', campaign.id)

                const ratingsCount = ratingsData?.length || 0
                const ratingsAvg = ratingsCount > 0
                    ? (ratingsData!.reduce((acc, curr) => acc + (curr.rating || 0), 0) / ratingsCount).toFixed(1)
                    : '0.0'

                const avgTicket = restData.average_ticket || 15
                setRoiData({ revenue: (usedCoupons || 0) * avgTicket, customers: usedCoupons || 0 })

                const scansCount = scans || 0
                setFunnelData([
                    { name: 'Scans QR', value: scansCount, percent: 100, color: 'var(--accent)' },
                    { name: 'Jeux lancés', value: spins || 0, percent: scansCount ? Math.round(((spins || 0) / scansCount) * 100) : 0, color: '#4f46e5' },
                    { name: 'Notes reçues', value: ratingsCount, percent: scansCount ? Math.round((ratingsCount / scansCount) * 100) : 0, color: '#6366f1' },
                    { name: 'Clics Google', value: googleClicks || 0, percent: scansCount ? Math.round(((googleClicks || 0) / scansCount) * 100) : 0, color: '#818cf8' },
                ])

                setStats([
                    { label: 'Scans QR', value: (scans || 0).toString(), icon: QrCode },
                    { label: 'Participations', value: (spins || 0).toString(), icon: HandMetal },
                    { label: 'Notes client', value: ratingsCount.toString(), icon: Star },
                    { label: 'Moyenne', value: ratingsAvg, icon: BarChart3, accent: true },
                    { label: 'Clics Google', value: (googleClicks || 0).toString(), icon: MousePointer2 },
                    { label: 'Coupons validés', value: (usedCoupons || 0).toString(), icon: TicketCheck },
                ])

                const { data: coupons } = await supabase
                    .from('coupons')
                    .select('*, sessions!inner(rewards(label), campaign_id)')
                    .eq('sessions.campaign_id', campaign.id)
                    .order('created_at', { ascending: false })
                    .limit(8)
                setRecentCoupons(coupons || [])

                const sevenDaysAgo = new Date()
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

                const { data: dailySessions } = await supabase
                    .from('sessions')
                    .select('created_at, rating')
                    .eq('campaign_id', campaign.id)
                    .gt('created_at', sevenDaysAgo.toISOString())

                const { data: dailyEvents } = await supabase
                    .from('analytics_events')
                    .select('created_at, event_type, sessions!inner(campaign_id)')
                    .eq('event_type', 'scan')
                    .eq('sessions.campaign_id', campaign.id)
                    .gt('created_at', sevenDaysAgo.toISOString())

                const days = [...Array(7)].map((_, i) => {
                    const d = new Date()
                    d.setDate(d.getDate() - (6 - i))
                    const dateStr = d.toISOString().split('T')[0]
                    const scansDay = dailyEvents?.filter(e => e.created_at.startsWith(dateStr)).length || 0
                    const daySessions = dailySessions?.filter(s => s.created_at.startsWith(dateStr)) || []
                    const ratings = daySessions.filter(s => s.rating !== null)
                    const avg = ratings.length > 0
                        ? ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length
                        : 0
                    return {
                        label: d.toLocaleDateString('fr-FR', { weekday: 'short' }),
                        scans: scansDay,
                        avg: avg.toFixed(1)
                    }
                })
                setDailyStats(days)

                if (restData.bad_buzz_alerts) {
                    const { data: badSessions } = await supabase
                        .from('sessions')
                        .select('*')
                        .eq('campaign_id', campaign.id)
                        .lt('rating', 3)
                        .order('created_at', { ascending: false })
                        .limit(3)
                    setBadBuzzSessions(badSessions || [])
                }
            } else {
                setStats([
                    { label: 'Scans QR', value: '0', icon: QrCode },
                    { label: 'Participations', value: '0', icon: HandMetal },
                    { label: 'Notes client', value: '0', icon: Star },
                    { label: 'Moyenne', value: '0.0', icon: BarChart3, accent: true },
                    { label: 'Clics Google', value: '0', icon: MousePointer2 },
                    { label: 'Coupons validés', value: '0', icon: TicketCheck },
                ])
            }

            try {
                const loyaltyRes = await fetch('/api/loyalty/program')
                if (loyaltyRes.ok) {
                    const loyaltyData = await loyaltyRes.json()
                    if (loyaltyData.stats) setLoyaltyStats(loyaltyData.stats)
                    if (loyaltyData.program?.id) setHasLoyaltyProgram(true)
                }
            } catch { /* non-blocking */ }

            setLoading(false)
        }

        fetchStats()
    }, [])

    if (loading) return (
        <div className="flex-1 flex flex-col items-center justify-center py-20 rounded-xl border font-medium"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-faint)' }}>
            <Loader2 className="w-5 h-5 animate-spin mb-2" />
            <span className="text-sm">Chargement...</span>
        </div>
    )

    const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
    const visibleStats = stats.filter(s => hasWheel || !['Participations', 'Coupons validés'].includes(s.label))

    return (
        <div className="space-y-6 max-w-5xl mx-auto">

            {/* Header */}
            <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest mb-1 capitalize" style={{ color: 'var(--text-faint)' }}>
                    {today}
                </p>
                <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
                    Bonjour, {restaurant?.name || 'Restaurateur'}
                </h1>
            </div>

            {/* Installation wizard */}
            <InstallationWizard
                restaurant={restaurant}
                campaign={activeCampaign}
                rewardCount={rewardCount}
                hasLoyaltyProgram={hasLoyaltyProgram}
                hasWheel={hasWheel}
            />

            {/* Highlight */}
            <HighlightCard
                activeCampaign={activeCampaign}
                badBuzzSessions={badBuzzSessions}
                loyaltyStats={loyaltyStats}
                hasWheel={hasWheel}
                hasLoyalty={hasLoyalty}
                stats={stats}
            />

            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {visibleStats.map((stat) => (
                    <StatCard
                        key={stat.label}
                        label={stat.label}
                        value={stat.value}
                        icon={stat.icon}
                        accent={stat.accent}
                    />
                ))}
                {hasLoyalty && loyaltyStats && (
                    <>
                        <StatCard label="Cartes actives" value={loyaltyStats.totalCards.toString()} icon={CreditCard} />
                        <StatCard label="Points distribués" value={loyaltyStats.totalPoints.toString()} icon={Coins} />
                        <StatCard label="Récompenses" value={loyaltyStats.rewardsReached.toString()} icon={CheckCircle2} accent />
                    </>
                )}
            </div>

            {/* Charts + Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

                {/* Bar chart */}
                <div className="lg:col-span-3 rounded-xl border p-5"
                    style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Scans — 7 derniers jours</p>
                        <TrendingUp className="w-4 h-4" style={{ color: 'var(--text-faint)' }} />
                    </div>
                    <div className="flex items-end justify-between h-40 gap-1.5">
                        {dailyStats.map((day, i) => {
                            const maxScans = Math.max(...dailyStats.map(d => d.scans), 1)
                            const height = Math.max((day.scans / maxScans) * 100, 4)
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                    <div className="w-full relative flex justify-center">
                                        <div
                                            className="w-full rounded-t-md transition-all duration-500 relative"
                                            style={{
                                                height: `${(height / 100) * 140}px`,
                                                background: day.scans > 0 ? 'var(--accent)' : 'var(--border)',
                                                opacity: day.scans > 0 ? 1 : 0.4,
                                            }}
                                        >
                                            {day.scans > 0 && (
                                                <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                                                    style={{ background: 'var(--text)', color: 'var(--bg)' }}>
                                                    {day.scans}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-medium uppercase" style={{ color: 'var(--text-faint)' }}>
                                        {day.label}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Activity feed */}
                <div className="lg:col-span-2 rounded-xl border p-5"
                    style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                    <p className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>Activité récente</p>
                    <ActivityFeed coupons={recentCoupons} />
                </div>
            </div>

            {/* Funnel + ROI — wheel only */}
            {hasWheel && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2 rounded-xl border p-5"
                        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Tunnel de conversion</p>
                            <span className="text-xs font-semibold px-2 py-1 rounded-md bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400">
                                {funnelData[3]?.percent ?? 0}% final
                            </span>
                        </div>
                        <div className="space-y-3">
                            {funnelData.map((step, i) => (
                                <div key={step.name}>
                                    <div className="flex justify-between text-xs mb-1.5">
                                        <span style={{ color: 'var(--text-muted)' }}>{step.name}</span>
                                        <span className="font-semibold" style={{ color: 'var(--text)' }}>
                                            {step.value} <span style={{ color: 'var(--text-faint)' }}>· {step.percent}%</span>
                                        </span>
                                    </div>
                                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                                        <div
                                            className="h-full rounded-full transition-all duration-700"
                                            style={{ width: `${step.percent}%`, background: step.color }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-xl border p-5 flex flex-col justify-between"
                        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--text-faint)' }}>
                                Impact CA estimé
                            </p>
                            <p className="text-4xl font-bold tracking-tight mb-1" style={{ color: 'var(--text)' }}>
                                {roiData.revenue}€
                            </p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                {roiData.customers} client{roiData.customers > 1 ? 's' : ''} · panier moy. {restaurant?.average_ticket || 15}€
                            </p>
                        </div>
                        <div className="flex items-center gap-2 pt-4 border-t mt-4" style={{ borderColor: 'var(--border)' }}>
                            <Coins className="w-4 h-4" style={{ color: 'var(--text-faint)' }} />
                            <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
                                Basé sur les coupons validés en caisse
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Conversion ratios — wheel only */}
            {hasWheel && stats.length > 0 && (
                <div className="rounded-xl border p-5" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                    <p className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>Taux de conversion</p>
                    <div className="grid grid-cols-3 gap-0 divide-x" style={{ '--tw-divide-opacity': 1 } as any}>
                        {[
                            {
                                label: 'Scan → Jeu',
                                value: stats[0]?.value !== '0' ? `${Math.round((parseInt(stats[1]?.value) / parseInt(stats[0]?.value)) * 100)}%` : '—'
                            },
                            {
                                label: 'Jeu → Note',
                                value: stats[1]?.value !== '0' ? `${Math.round((parseInt(stats[2]?.value) / parseInt(stats[1]?.value)) * 100)}%` : '—'
                            },
                            {
                                label: 'Note → Google',
                                value: stats[2]?.value !== '0' ? `${Math.round((parseInt(stats[4]?.value) / parseInt(stats[2]?.value)) * 100)}%` : '—'
                            },
                        ].map((item) => (
                            <div key={item.label} className="text-center px-4 first:pl-0 last:pr-0" style={{ borderColor: 'var(--border)' }}>
                                <p className="text-xl font-bold" style={{ color: 'var(--accent)' }}>{item.value}</p>
                                <p className="text-[10px] font-medium mt-1 uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>
                                    {item.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Bad buzz */}
            {restaurant?.bad_buzz_alerts && badBuzzSessions.length > 0 && (
                <div className="rounded-xl border border-red-200 dark:border-red-900/40 p-5"
                    style={{ background: 'var(--bg-surface)' }}>
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <p className="text-sm font-semibold text-red-600 dark:text-red-400">Avis négatifs récents</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {badBuzzSessions.map((s) => (
                            <div key={s.id} className="rounded-lg border p-4"
                                style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border)' }}>
                                <div className="flex gap-0.5 mb-2">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-3.5 h-3.5 ${i < s.rating ? 'text-red-500 fill-red-500' : 'opacity-20'}`}
                                            style={i >= s.rating ? { color: 'var(--text-faint)' } : {}} />
                                    ))}
                                </div>
                                {s.feedback && (
                                    <p className="text-xs italic mb-2 line-clamp-2" style={{ color: 'var(--text-muted)' }}>"{s.feedback}"</p>
                                )}
                                <p className="text-[10px] font-medium" style={{ color: 'var(--text-faint)' }}>
                                    {new Date(s.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
