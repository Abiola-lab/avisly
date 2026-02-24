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
    BellOff
} from 'lucide-react'

export default function DashboardPage() {
    const [stats, setStats] = useState<any[]>([])
    const [recentCoupons, setRecentCoupons] = useState<any[]>([])
    const [badBuzzSessions, setBadBuzzSessions] = useState<any[]>([])
    const [dailyStats, setDailyStats] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [restaurant, setRestaurant] = useState<any>(null)

    const supabase = createClient()

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

            // Fetch Campaign for its IDs
            const { data: campaign } = await supabase
                .from('campaigns')
                .select('id')
                .eq('restaurant_id', restData.id)
                .eq('is_active', true)
                .single()

            if (campaign) {
                // Fetch real counts
                const { count: scans } = await supabase
                    .from('analytics_events')
                    .select('*', { count: 'exact', head: true })
                    .eq('event_type', 'scan')
                    .filter('session_id', 'in', `(select id from sessions where campaign_id = ${campaign.id})`)

                const { count: spins } = await supabase
                    .from('analytics_events')
                    .select('*', { count: 'exact', head: true })
                    .eq('event_type', 'spin_completed')
                    .filter('session_id', 'in', `(select id from sessions where campaign_id = ${campaign.id})`)

                const { data: ratingsData } = await supabase
                    .from('sessions')
                    .select('rating')
                    .eq('campaign_id', campaign.id)
                    .not('rating', 'is', null)

                const { count: googleClicks } = await supabase
                    .from('analytics_events')
                    .select('*', { count: 'exact', head: true })
                    .eq('event_type', 'google_clicked')
                    .filter('session_id', 'in', `(select id from sessions where campaign_id = ${campaign.id})`)

                const { count: usedCoupons } = await supabase
                    .from('coupons')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'used')
                    .filter('session_id', 'in', `(select id from sessions where campaign_id = ${campaign.id})`)

                const ratingsCount = ratingsData?.length || 0
                const ratingsAvg = ratingsCount > 0
                    ? (ratingsData!.reduce((acc, curr) => acc + (curr.rating || 0), 0) / ratingsCount).toFixed(1)
                    : '0.0'

                setStats([
                    { label: 'Scans QR', value: (scans || 0).toString(), icon: QrCode, color: 'blue' },
                    { label: 'Participations', value: (spins || 0).toString(), icon: HandMetal, color: 'purple' },
                    { label: 'Notes client', value: ratingsCount.toString(), icon: Star, color: 'yellow' },
                    { label: 'Moyenne', value: ratingsAvg, icon: BarChart3, color: 'green' },
                    { label: 'Clics Google', value: (googleClicks || 0).toString(), icon: MousePointer2, color: 'indigo' },
                    { label: 'Coupons validés', value: (usedCoupons || 0).toString(), icon: TicketCheck, color: 'orange' },
                ])

                // Fetch Recent Coupons (Validated and Active)
                const { data: coupons } = await supabase
                    .from('coupons')
                    .select('*, sessions!inner(rewards(label), campaign_id)')
                    .eq('sessions.campaign_id', campaign.id)
                    .order('created_at', { ascending: false })
                    .limit(5)

                setRecentCoupons(coupons || [])

                // Fetch Daily Stats (Last 7 days)
                const sevenDaysAgo = new Date()
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

                const { data: dailySessions } = await supabase
                    .from('sessions')
                    .select('created_at, rating')
                    .eq('campaign_id', campaign.id)
                    .gt('created_at', sevenDaysAgo.toISOString())

                const { data: dailyEvents } = await supabase
                    .from('analytics_events')
                    .select('created_at, event_type')
                    .eq('event_type', 'scan')
                    .filter('session_id', 'in', `(select id from sessions where campaign_id = ${campaign.id})`)
                    .gt('created_at', sevenDaysAgo.toISOString())

                // Process data for charts
                const days = [...Array(7)].map((_, i) => {
                    const d = new Date()
                    d.setDate(d.getDate() - (6 - i))
                    const dateStr = d.toISOString().split('T')[0]

                    const scans = dailyEvents?.filter(e => e.created_at.startsWith(dateStr)).length || 0
                    const daySessions = dailySessions?.filter(s => s.created_at.startsWith(dateStr)) || []
                    const ratings = daySessions.filter(s => s.rating !== null)
                    const avg = ratings.length > 0
                        ? ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length
                        : 0

                    return {
                        label: d.toLocaleDateString('fr-FR', { weekday: 'short' }),
                        scans,
                        avg: avg.toFixed(1)
                    }
                })
                setDailyStats(days)

                // Fetch Bad Buzz Alerts (Ratings < 3)
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
                // Default empty stats if no active campaign
                setStats([
                    { label: 'Scans QR', value: '0', icon: QrCode, color: 'blue' },
                    { label: 'Spins (Jeux)', value: '0', icon: HandMetal, color: 'purple' },
                    { label: 'Notes client', value: '0', icon: Star, color: 'yellow' },
                    { label: 'Moyenne', value: '0.0', icon: BarChart3, color: 'green' },
                    { label: 'Clics Google', value: '0', icon: MousePointer2, color: 'indigo' },
                    { label: 'Coupons validés', value: '0', icon: TicketCheck, color: 'orange' },
                ])
            }
            setLoading(false)
        }

        fetchStats()
    }, [])

    if (loading) return (
        <div className="flex-1 flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 italic text-gray-400 font-medium">
            <Loader2 className="w-8 h-8 animate-spin mb-2" /> Analyse des données...
        </div>
    )

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Bonjour, {restaurant?.name || 'Restaurateur'} 👋</h1>
                    <p className="text-gray-500 font-medium">Voici les performances de votre établissement en temps réel.</p>
                </div>
                <div className="bg-[#f0f0ff] text-[#1d1dd7] px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> LIVE
                </div>
            </div>

            {/* Empty State / Call to Action if no stats yet */}
            {stats[0]?.value === '0' && stats[1]?.value === '0' && (
                <div className="bg-gradient-to-br from-indigo-600 to-[#1d1dd7] p-12 rounded-[3.5rem] text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-48 -mt-48 group-hover:scale-110 transition-transform duration-700" />
                    <div className="relative z-10 space-y-6 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">✨ Premiers pas</div>
                        <h2 className="text-4xl font-black tracking-tight leading-tight italic">Prêt à faire décoller <br /> vos avis Google ?</h2>
                        <p className="text-white/70 font-medium text-lg italic">
                            Lancez votre première campagne "Roue de la Fortune" et commencez à récolter des avis 5 étoiles en un clin d'œil.
                        </p>
                        <div className="pt-4">
                            <button
                                onClick={() => window.location.href = '/dashboard/campaigns'}
                                className="px-10 py-5 bg-white text-[#1d1dd7] font-black rounded-2xl hover:bg-gray-100 transition-all shadow-xl active:scale-95 uppercase tracking-widest text-sm"
                            >
                                CRÉER MA CAMPAGNE
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <div
                        key={stat.label}
                        className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-start justify-between hover:shadow-xl hover:shadow-[#1d1dd7]/5 transition-all duration-300 group"
                    >
                        <div>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2 group-hover:text-gray-500 transition-colors">{stat.label}</p>
                            <p className="text-4xl font-black text-gray-900">{stat.value}</p>
                        </div>
                        <div className={`p-4 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                    </div>
                ))}
            </div>

            {restaurant?.bad_buzz_alerts && badBuzzSessions.length > 0 && (
                <div className="bg-red-50 border-2 border-red-100 p-8 rounded-[3rem] animate-pulse">
                    <div className="flex items-center gap-3 mb-6 text-red-600">
                        <AlertTriangle className="w-6 h-6" />
                        <h2 className="text-xl font-bold uppercase tracking-tight">Focus : Retours Clients à Analyser 🛡️</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {badBuzzSessions.map((s) => (
                            <div key={s.id} className="bg-white p-6 rounded-2xl shadow-sm border border-red-100 flex flex-col items-center text-center">
                                <div className="flex gap-1 mb-2">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-4 h-4 ${i < s.rating ? 'text-red-500 fill-red-500' : 'text-gray-200'}`} />
                                    ))}
                                </div>
                                <p className="text-sm font-bold text-gray-900 mb-1">Note de {s.rating}/5</p>
                                {s.feedback && (
                                    <p className="text-xs text-gray-600 italic mb-2 line-clamp-2">"{s.feedback}"</p>
                                )}
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-auto">Reçue à {new Date(s.created_at).toLocaleTimeString()}</p>
                            </div>
                        ))}
                    </div>
                    <p className="mt-6 text-xs text-red-500 font-bold text-center uppercase tracking-widest">
                        Utilisez ces retours constructifs pour perfectionner votre expérience client.
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                        <TrendingUp className="w-5 h-5 text-[#1d1dd7]" /> Volume de Scans (7j)
                    </h2>
                    <div className="flex items-end justify-between h-48 gap-2">
                        {dailyStats.map((day, i) => {
                            const maxScans = Math.max(...dailyStats.map(d => d.scans), 1)
                            const height = (day.scans / maxScans) * 100
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                                    <div className="relative w-full flex justify-center">
                                        <div
                                            className="w-full max-w-[24px] bg-[#f0f0ff] group-hover:bg-[#1d1dd7] transition-all rounded-t-lg relative"
                                            style={{ height: `${height}%`, minHeight: '4px' }}
                                        >
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                {day.scans}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{day.label}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                        <Star className="w-5 h-5 text-yellow-400" /> Satisfaction Moyenne (7j)
                    </h2>
                    <div className="flex items-end justify-between h-48 gap-2">
                        {dailyStats.map((day, i) => {
                            const height = (parseFloat(day.avg) / 5) * 100
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                                    <div className="relative w-full flex justify-center">
                                        <div
                                            className="w-full max-w-[24px] bg-yellow-50 group-hover:bg-yellow-400 transition-all rounded-t-lg relative"
                                            style={{ height: `${height}%`, minHeight: '4px' }}
                                        >
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                ★ {day.avg}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{day.label}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#f0f0ff]/50 rounded-full blur-3xl -mr-32 -mt-32" />
                <h2 className="text-xl font-bold text-gray-900 mb-6 relative">Analyse de conversion</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                    <div className="text-center p-6 border-r border-gray-100">
                        <p className="text-3xl font-black text-[#1d1dd7]">
                            {stats[0]?.value !== '0' ? Math.round((parseInt(stats[1]?.value) / parseInt(stats[0]?.value)) * 100) : 0}%
                        </p>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">Engagement (Scan → Spin)</p>
                    </div>
                    <div className="text-center p-6 border-r border-gray-100">
                        <p className="text-3xl font-black text-[#1d1dd7]">
                            {stats[1]?.value !== '0' ? Math.round((parseInt(stats[2]?.value) / parseInt(stats[1]?.value)) * 100) : 0}%
                        </p>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">Rétention (Spin → Note)</p>
                    </div>
                    <div className="text-center p-6">
                        <p className="text-3xl font-black text-[#1d1dd7]">
                            {stats[2]?.value !== '0' ? Math.round((parseInt(stats[4]?.value) / parseInt(stats[2]?.value)) * 100) : 0}%
                        </p>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">Impact Google (Note → Clic)</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6 font-black uppercase tracking-tight">Derniers Coupons</h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">
                                <th className="pb-4">Code</th>
                                <th className="pb-4">Gain</th>
                                <th className="pb-4">Date</th>
                                <th className="pb-4 text-right">Statut</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {recentCoupons.map((coupon) => (
                                <tr key={coupon.id} className="group hover:bg-gray-50/50 transition-colors">
                                    <td className="py-4 font-black text-[#1d1dd7]">{coupon.code}</td>
                                    <td className="py-4 font-bold text-gray-700">{coupon.sessions?.rewards?.label}</td>
                                    <td className="py-4 text-sm text-gray-500">{new Date(coupon.created_at).toLocaleDateString()}</td>
                                    <td className="py-4 text-right">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${coupon.status === 'used'
                                            ? 'bg-green-50 text-green-600'
                                            : coupon.status === 'expired'
                                                ? 'bg-red-50 text-red-600'
                                                : 'bg-blue-50 text-[#1d1dd7]'
                                            }`}>
                                            {coupon.status === 'used' ? 'Validé' : coupon.status === 'expired' ? 'Expiré' : 'Actif'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {recentCoupons.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="py-10 text-center text-gray-400 italic">Aucun coupon généré pour le moment.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
