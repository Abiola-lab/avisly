'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Plus,
    Trash2,
    Trophy,
    Loader2,
    AlertCircle,
    CheckCircle2,
    GripVertical
} from 'lucide-react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'

interface Campaign {
    id: string
    name: string
    is_active: boolean
    created_at: string
    restaurant_id: string
    win_probability: number
    color_primary: string
    color_secondary: string
    color_accent: string
}

interface Reward {
    id: string
    campaign_id: string
    label: string
    is_prize: boolean
    color: string
    created_at: string
    order_index: number
}

export default function CampaignsPage() {
    const [campaign, setCampaign] = useState<Campaign | null>(null)
    const [allCampaigns, setAllCampaigns] = useState<Campaign[]>([])
    const [rewards, setRewards] = useState<Reward[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [newRewardLabel, setNewRewardLabel] = useState('')
    const [isPrize, setIsPrize] = useState(true)
    const [newRewardColor, setNewRewardColor] = useState('#1d1dd7')
    const [newCampaignName, setNewCampaignName] = useState('')
    const [showNewModel, setShowNewModel] = useState(false)
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)
    const supabase = createClient()

    const fetchData = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: restaurant } = await supabase
            .from('restaurants')
            .select('id')
            .eq('user_id', user.id)
            .single()

        if (restaurant) {
            const { data: campaigns } = await supabase
                .from('campaigns')
                .select('*')
                .eq('restaurant_id', restaurant.id)
                .order('created_at', { ascending: false })

            if (campaigns) {
                setAllCampaigns(campaigns)
                const active = campaigns.find(c => c.is_active) || campaigns[0]
                setCampaign(active)

                const { data: rewardsData } = await supabase
                    .from('rewards')
                    .select('*')
                    .eq('campaign_id', active.id)
                    .order('order_index', { ascending: true })
                    .order('created_at', { ascending: true }) // Fallback sorting

                setRewards(rewardsData || [])
            }
        }
        setLoading(false)
    }, [supabase])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleAddReward = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!campaign) return

        setSaving(true)
        try {
            const { data, error } = await supabase
                .from('rewards')
                .insert([{
                    campaign_id: campaign.id,
                    label: newRewardLabel,
                    is_prize: isPrize,
                    color: newRewardColor,
                    order_index: rewards.length
                }])
                .select()
                .single()

            if (error) throw error

            await fetchData()
            setNewRewardLabel('')
            setIsPrize(true)
            setStatus({ type: 'success', message: 'Récompense ajoutée !' })
        } catch (err: unknown) {
            console.error('Error adding reward:', err)
            const message = err instanceof Error ? err.message : 'Une erreur est survenue'
            const details = (err as any)?.details || (err as any)?.message || ''
            setStatus({ type: 'error', message: `${message} ${details}`.trim() })
        } finally {
            setSaving(false)
            setTimeout(() => setStatus(null), 3000)
        }
    }

    const handleDeleteReward = async (id: string) => {
        if (!confirm('Supprimer cette récompense ?')) return

        try {
            const { error } = await supabase.from('rewards').delete().eq('id', id)
            if (error) throw error
            setRewards(rewards.filter(r => r.id !== id))
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Une erreur est survenue'
            alert(message)
        }
    }

    const switchCampaign = async (id: string) => {
        setSaving(true)
        try {
            // 1. Deactivate current active
            await supabase
                .from('campaigns')
                .update({ is_active: false })
                .eq('restaurant_id', campaign?.restaurant_id)

            // 2. Activate new one
            await supabase
                .from('campaigns')
                .update({ is_active: true })
                .eq('id', id)

            await fetchData()
            setStatus({ type: 'success', message: 'Modèle activé !' })
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Une erreur est survenue'
            alert(message)
        } finally {
            setSaving(false)
            setTimeout(() => setStatus(null), 3000)
        }
    }

    const createModel = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newCampaignName) return
        setSaving(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            const { data: rest } = await supabase.from('restaurants').select('id').eq('user_id', user!.id).single()

            const { data, error } = await supabase
                .from('campaigns')
                .insert([{
                    restaurant_id: rest!.id,
                    name: newCampaignName,
                    is_active: false,
                    win_probability: 50
                }])
                .select()
                .single()

            if (error) throw error
            setNewCampaignName('')
            setShowNewModel(false)
            await fetchData()
            setCampaign(data) // Focus on the new model
            setStatus({ type: 'success', message: 'Modèle créé !' })
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Une erreur est survenue'
            alert(message)
        } finally {
            setSaving(false)
        }
    }

    const toggleCampaignStatus = async () => {
        if (!campaign) return
        const newStatus = !campaign.is_active

        try {
            const { error } = await supabase
                .from('campaigns')
                .update({ is_active: newStatus })
                .eq('id', campaign.id)

            if (error) throw error
            setCampaign({ ...campaign, is_active: newStatus })
            await fetchData()
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Une erreur est survenue'
            alert(message)
        }
    }

    const updateCampaignProbability = async (prob: number) => {
        if (!campaign) return
        try {
            const { error } = await supabase
                .from('campaigns')
                .update({ win_probability: prob })
                .eq('id', campaign.id)

            if (error) throw error
            setCampaign({ ...campaign, win_probability: prob })
            setAllCampaigns(allCampaigns.map(c => c.id === campaign.id ? { ...c, win_probability: prob } : c))
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Une erreur est survenue'
            alert(message)
        }
    }

    const deactivateAllCampaigns = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: restaurant } = await supabase
            .from('restaurants')
            .select('id')
            .eq('user_id', user.id)
            .single()

        if (!restaurant) return

        setSaving(true)
        try {
            const { error } = await supabase
                .from('campaigns')
                .update({ is_active: false })
                .eq('restaurant_id', restaurant.id)

            if (error) throw error
            await fetchData()
            setStatus({ type: 'success', message: 'Toutes les campagnes sont désactivées' })
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Une erreur est survenue'
            alert(message)
        } finally {
            setSaving(false)
            setTimeout(() => setStatus(null), 3000)
        }
    }

    const onDragEnd = async (result: any) => {
        if (!result.destination) return

        const items = Array.from(rewards)
        const [reorderedItem] = items.splice(result.source.index, 1)
        items.splice(result.destination.index, 0, reorderedItem)

        // Optimistic UI update
        const updatedItems = items.map((item, index) => ({
            ...item,
            order_index: index
        }))
        setRewards(updatedItems)

        // Persist to DB
        try {
            const updates = updatedItems.map((item, index) =>
                supabase
                    .from('rewards')
                    .update({ order_index: index })
                    .eq('id', item.id)
            )
            await Promise.all(updates)
        } catch (err: unknown) {
            console.error('Error updating order:', err)
            await fetchData() // Rollback on error
        }
    }

    if (loading) return <div className="p-8 text-center text-gray-500 font-medium">Récupération de votre campagne...</div>

    return (
        <div className="space-y-8 max-w-4xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Vos Modèles de Roue</h1>
                    <p className="text-gray-500 font-medium">Créez des configurations de lots et basculez en un clic.</p>
                </div>
                <button
                    onClick={() => setShowNewModel(!showNewModel)}
                    className="flex items-center gap-2 bg-[#f0f0ff] text-[#1d1dd7] px-6 py-2.5 rounded-xl font-bold hover:bg-[#e0e0ff] transition-all"
                >
                    <Plus className="w-5 h-5" /> Nouveau modèle
                </button>
                <button
                    onClick={deactivateAllCampaigns}
                    disabled={saving}
                    className="flex items-center gap-2 bg-red-50 text-red-600 px-6 py-2.5 rounded-xl font-bold hover:bg-red-100 transition-all disabled:opacity-50"
                >
                    Tout désactiver
                </button>
            </div>

            {showNewModel && (
                <div className="bg-white p-6 rounded-3xl border-2 border-dashed border-[#1d1dd7]/20 animate-in fade-in slide-in-from-top-4">
                    <form onSubmit={createModel} className="flex gap-4">
                        <input
                            required
                            type="text"
                            placeholder="Nom du modèle (ex: Happy Hour, Noël...)"
                            className="flex-1 px-5 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1d1dd7] outline-none font-bold placeholder-gray-500 text-gray-900"
                            value={newCampaignName}
                            onChange={(e) => setNewCampaignName(e.target.value)}
                        />
                        <button
                            type="submit"
                            className="bg-[#1d1dd7] text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-[#1d1dd7]/20"
                        >
                            Créer et configurer
                        </button>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allCampaigns.map((c) => (
                    <div
                        key={c.id}
                        onClick={async () => {
                            setCampaign(c)
                            const { data: fetchRewards } = await supabase
                                .from('rewards')
                                .select('*')
                                .eq('campaign_id', c.id)
                            setRewards(fetchRewards || [])
                        }}
                        className={`p-6 rounded-[2rem] border-2 transition-all cursor-pointer ${campaign?.id === c.id
                            ? 'bg-white border-[#1d1dd7] shadow-xl'
                            : 'bg-white border-transparent shadow-sm grayscale hover:grayscale-0'
                            }`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-bold text-gray-900">{c.name}</h3>
                            {c.is_active && (
                                <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest">Actif</span>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 font-medium lowercase mb-4">Créé le {new Date(c.created_at).toLocaleDateString()}</p>

                        {!c.is_active && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    switchCampaign(c.id)
                                }}
                                className="w-full py-2 bg-gray-50 hover:bg-[#1d1dd7] hover:text-white rounded-xl text-xs font-bold text-gray-600 transition-all"
                            >
                                Activer sur le QR Code
                            </button>
                        )}
                        {c.is_active && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    toggleCampaignStatus()
                                }}
                                className="w-full py-2 bg-red-50 hover:bg-red-100 rounded-xl text-xs font-bold text-red-600 transition-all"
                            >
                                Désactiver
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <hr className="border-gray-100" />

            {campaign && (
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Modification : {campaign.name}</h2>
                        <p className="text-gray-500 text-sm font-medium">Éditez les lots de ce modèle spécifique.</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left column: Add/Manage */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-[#1d1dd7]" /> Liste des récompenses
                        </h3>

                        <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable droppableId="rewards">
                                {(provided) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className="space-y-3"
                                    >
                                        {rewards.length === 0 ? (
                                            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                                <p className="text-gray-400 font-medium italic">Aucune récompense pour le moment.</p>
                                            </div>
                                        ) : (
                                            rewards.map((reward, index) => (
                                                <Draggable key={reward.id} draggableId={reward.id} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            className={`group flex items-center justify-between p-4 bg-gray-50 hover:bg-white hover:shadow-md hover:border-gray-200 border border-transparent rounded-2xl transition-all ${snapshot.isDragging ? 'bg-white shadow-xl scale-[1.02] border-[#1d1dd7]/30 z-50' : ''
                                                                }`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div
                                                                    {...provided.dragHandleProps}
                                                                    className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500"
                                                                >
                                                                    <GripVertical className="w-5 h-5" />
                                                                </div>
                                                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: reward.color }} />
                                                                <span className="font-bold text-gray-700">{reward.label || <span className="text-gray-300 font-normal italic">Sans texte</span>}</span>
                                                                {reward.is_prize ? (
                                                                    <span className="bg-green-100 text-green-700 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">Prix</span>
                                                                ) : (
                                                                    <span className="bg-gray-200 text-gray-500 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">Filler</span>
                                                                )}
                                                            </div>
                                                            <button
                                                                onClick={() => handleDeleteReward(reward.id)}
                                                                className="p-2 text-gray-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                                                            >
                                                                <Trash2 className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))
                                        )}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>

                        <form onSubmit={handleAddReward} className="mt-8 space-y-6">
                            <div className="flex flex-wrap gap-4 items-end">
                                <div className="flex-1 min-w-[200px]">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Libellé du lot (facultatif)</label>
                                    <input
                                        type="text"
                                        placeholder="ex: Un café offert"
                                        className="w-full px-5 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1d1dd7] focus:border-transparent outline-none transition-all font-bold placeholder-gray-500 text-gray-900"
                                        value={newRewardLabel}
                                        onChange={(e) => setNewRewardLabel(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Couleur</label>
                                    <input
                                        type="color"
                                        className="w-16 h-12 p-1 bg-white border border-gray-300 rounded-xl cursor-pointer"
                                        value={newRewardColor}
                                        onChange={(e) => setNewRewardColor(e.target.value)}
                                    />
                                </div>
                                <button
                                    disabled={saving}
                                    type="submit"
                                    className="bg-[#1d1dd7] text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#1515a3] transition-all disabled:opacity-50 shadow-lg shadow-[#1d1dd7]/20 h-12"
                                >
                                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                                    Ajouter
                                </button>
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer group w-fit">
                                <input
                                    type="checkbox"
                                    checked={isPrize}
                                    onChange={(e) => setIsPrize(e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-[#1d1dd7] focus:ring-[#1d1dd7]"
                                />
                                <span className="text-sm font-bold text-gray-500 group-hover:text-gray-700 transition-colors">
                                    C&apos;est un cadeau à gagner (Génère un coupon)
                                </span>
                            </label>
                        </form>

                        {status && (
                            <div className={`mt-4 flex items-center gap-2 text-sm font-bold ${status.type === 'success' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {status.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                {status.message}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right column: Info/Rules */}
                <div className="space-y-6">
                    <div className="bg-gray-900 p-8 rounded-[2.5rem] shadow-xl text-white space-y-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h4 className="text-xl font-black uppercase tracking-tight">Probabilité Globale</h4>
                                <span className="text-2xl font-black text-[#1d1dd7]">{campaign?.win_probability || 50}%</span>
                            </div>
                            <input
                                type="range"
                                min="50"
                                max="100"
                                step="1"
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#1d1dd7]"
                                value={campaign?.win_probability || 50}
                                onChange={(e) => updateCampaignProbability(parseInt(e.target.value))}
                            />
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                Chances totales de tomber sur un lot gagnant (Min 50%)
                            </p>
                        </div>
                    </div>

                    <div className="bg-[#1d1dd7] p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden">
                        <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                        <h4 className="text-xl font-black mb-4 uppercase tracking-tight">Règles du jeu</h4>
                        <ul className="space-y-4 text-white/80 text-sm font-medium">
                            <li className="flex gap-3">
                                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                                La probabilité globale définit si le client gagne un lot ou non.
                            </li>
                            <li className="flex gap-3">
                                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                                Les lots gagnants et perdants sont ensuite répartis équitablement.
                            </li>
                            <li className="flex gap-3">
                                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                                Modifier la roue n&apos;affecte pas les coupons déjà émis.
                            </li>
                        </ul>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                            <Trophy className="w-6 h-6 text-[#1d1dd7]" />
                        </div>
                        <div>
                            <h5 className="font-bold text-gray-900 leading-tight">Campagne active</h5>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-0.5">{campaign?.name || '...'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
