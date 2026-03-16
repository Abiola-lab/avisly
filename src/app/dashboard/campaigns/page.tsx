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
    GripVertical,
    Edit,
    X,
    Check
} from 'lucide-react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import Wheel from '@/components/game/Wheel'

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
    const [restaurantSettings, setRestaurantSettings] = useState<{ id: string, logo_url: string | null, primary_color: string | null } | null>(null)
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

    // Edit reward state
    const [editingRewardId, setEditingRewardId] = useState<string | null>(null)
    const [editLabel, setEditLabel] = useState('')
    const [editColor, setEditColor] = useState('')
    const [editIsPrize, setEditIsPrize] = useState(true)

    // Edit campaign state
    const [isEditingCampaignName, setIsEditingCampaignName] = useState(false)
    const [editedCampaignName, setEditedCampaignName] = useState('')

    const supabase = createClient()

    const fetchData = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: restaurant } = await supabase
            .from('restaurants')
            .select('id, logo_url, primary_color')
            .eq('user_id', user.id)
            .single()

        if (restaurant) {
            setRestaurantSettings(restaurant as any)
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

            // Suggest a new color for the next reward (automatic color rotation)
            const wheelPalette = [
                '#1d1dd7', '#ff0080', '#ffcc00', '#00d4ff', '#00ff88',
                '#ff6600', '#9d00ff', '#ff0000', '#0088ff', '#ff00ff'
            ]
            setNewRewardColor(wheelPalette[(rewards.length + 1) % wheelPalette.length])

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

    const handleUpdateReward = async (id: string) => {
        setSaving(true)
        try {
            const { error } = await supabase
                .from('rewards')
                .update({
                    label: editLabel,
                    color: editColor,
                    is_prize: editIsPrize
                })
                .eq('id', id)

            if (error) throw error

            setRewards(rewards.map(r => r.id === id ? { ...r, label: editLabel, color: editColor, is_prize: editIsPrize } : r))
            setEditingRewardId(null)
            setStatus({ type: 'success', message: 'Récompense mise à jour !' })
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Une erreur est survenue'
            alert(message)
        } finally {
            setSaving(false)
            setTimeout(() => setStatus(null), 3000)
        }
    }

    const handleUpdateCampaignName = async () => {
        if (!campaign || !editedCampaignName.trim()) return
        setSaving(true)
        try {
            const { error } = await supabase
                .from('campaigns')
                .update({ name: editedCampaignName })
                .eq('id', campaign.id)

            if (error) throw error

            setCampaign({ ...campaign, name: editedCampaignName })
            setAllCampaigns(allCampaigns.map(c => c.id === campaign.id ? { ...c, name: editedCampaignName } : c))
            setIsEditingCampaignName(false)
            setStatus({ type: 'success', message: 'Nom du modèle mis à jour !' })
        } catch (err: any) {
            alert(err instanceof Error ? err.message : 'Une erreur est survenue')
        } finally {
            setSaving(false)
            setTimeout(() => setStatus(null), 3000)
        }
    }

    const switchCampaign = async (id: string) => {
        setSaving(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            const { data: restaurant } = await supabase
                .from('restaurants')
                .select('id')
                .eq('user_id', user?.id)
                .single()

            if (!restaurant) throw new Error('Restaurant non trouvé')

            // 1. Deactivate all for this restaurant
            await supabase
                .from('campaigns')
                .update({ is_active: false })
                .eq('restaurant_id', restaurant.id)

            // 2. Activate specific one
            const { error } = await supabase
                .from('campaigns')
                .update({ is_active: true })
                .eq('id', id)

            if (error) throw error
            await fetchData()
            setStatus({ type: 'success', message: 'Campagne activée sur le QR Code !' })
        } catch (err: any) {
            alert(err instanceof Error ? err.message : 'Une erreur est survenue')
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

    const handleDeleteCampaign = async (id: string) => {
        if (!confirm('Supprimer définitivement ce modèle de campagne ? Cette action est irréversible.')) return

        setSaving(true)
        try {
            const { error } = await supabase.from('campaigns').delete().eq('id', id)
            if (error) throw error

            const remaining = allCampaigns.filter(c => c.id !== id)
            setAllCampaigns(remaining)

            if (campaign?.id === id) {
                const next = remaining[0]
                setCampaign(next || null)
                if (next) {
                    const { data: fetchRewards } = await supabase
                        .from('rewards')
                        .select('*')
                        .eq('campaign_id', next.id)
                    setRewards(fetchRewards || [])
                } else {
                    setRewards([])
                }
            }
            setStatus({ type: 'success', message: 'Modèle supprimé !' })
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
        <div className="space-y-6 md:space-y-8 max-w-4xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Vos Modèles de Roue</h1>
                    <p className="text-gray-500 font-medium text-sm md:text-base">Créez des configurations de lots et basculez en un clic.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => setShowNewModel(!showNewModel)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#f0f0ff] text-[#1d1dd7] px-6 py-2.5 rounded-xl font-bold hover:bg-[#e0e0ff] transition-all text-sm whitespace-nowrap"
                    >
                        <Plus className="w-5 h-5" /> Nouveau modèle
                    </button>
                    <button
                        onClick={deactivateAllCampaigns}
                        disabled={saving}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-red-50 text-red-600 px-6 py-2.5 rounded-xl font-bold hover:bg-red-100 transition-all disabled:opacity-50 text-sm whitespace-nowrap"
                    >
                        Tout désactiver
                    </button>
                </div>
            </div>

            {showNewModel && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
                    onClick={() => setShowNewModel(false)}
                >
                    <div
                        className="bg-white p-8 rounded-[2.5rem] shadow-2xl w-full max-w-lg animate-in zoom-in-95 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight">Nouveau Modèle</h3>
                        <p className="text-gray-500 font-medium text-sm mb-6 italic">Donnez un nom à votre nouvelle configuration de lot.</p>

                        <form onSubmit={createModel} className="space-y-4">
                            <input
                                required
                                autoFocus
                                type="text"
                                placeholder="ex: Offres Été 2024"
                                className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#1d1dd7] focus:bg-white outline-none font-bold placeholder-gray-400 text-gray-900 transition-all font-sans"
                                value={newCampaignName}
                                onChange={(e) => setNewCampaignName(e.target.value)}
                            />
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowNewModel(false)}
                                    className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all italic text-sm"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-[2] bg-[#1d1dd7] text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-[#1515a3] transition-all disabled:opacity-50 shadow-xl shadow-[#1d1dd7]/30 uppercase tracking-widest text-sm"
                                >
                                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                                    Créer et configurer
                                </button>
                            </div>
                        </form>
                    </div>
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
                            <div className="flex items-center gap-2">
                                {c.is_active && (
                                    <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest">Actif</span>
                                )}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleDeleteCampaign(c.id)
                                    }}
                                    className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
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
                    <div className="flex-1">
                        {isEditingCampaignName ? (
                            <div className="flex items-center gap-2 max-w-md">
                                <input
                                    autoFocus
                                    type="text"
                                    className="flex-1 text-xl font-black text-gray-900 bg-white border-2 border-[#1d1dd7] rounded-xl px-4 py-2 outline-none shadow-lg shadow-[#1d1dd7]/10"
                                    value={editedCampaignName}
                                    onChange={(e) => setEditedCampaignName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleUpdateCampaignName()
                                        if (e.key === 'Escape') setIsEditingCampaignName(false)
                                    }}
                                />
                                <button
                                    onClick={handleUpdateCampaignName}
                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                >
                                    <Check className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setIsEditingCampaignName(false)}
                                    className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-bold text-gray-900 leading-none">Modification : {campaign.name}</h2>
                                <button
                                    onClick={() => {
                                        setIsEditingCampaignName(true)
                                        setEditedCampaignName(campaign.name)
                                    }}
                                    className="p-1.5 text-gray-400 hover:text-[#1d1dd7] hover:bg-gray-50 rounded-lg transition-all group"
                                    title="Renommer le modèle"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                        <p className="text-gray-500 text-sm font-medium mt-1">Éditez les lots de ce modèle spécifique.</p>
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
                                                            {editingRewardId === reward.id ? (
                                                                <div className="flex-1 flex flex-col sm:flex-row items-center gap-4">
                                                                    <div className="flex-1 flex items-center gap-2 w-full">
                                                                        <input
                                                                            autoFocus
                                                                            type="text"
                                                                            className="flex-1 px-4 py-2 bg-white border-2 border-[#1d1dd7] rounded-xl text-sm font-black text-gray-900 outline-none shadow-sm placeholder-gray-400"
                                                                            value={editLabel}
                                                                            onChange={(e) => setEditLabel(e.target.value)}
                                                                            placeholder="Nom du lot..."
                                                                        />
                                                                        <input
                                                                            type="color"
                                                                            className="w-10 h-10 p-1 bg-white border border-gray-300 rounded-lg cursor-pointer"
                                                                            value={editColor}
                                                                            onChange={(e) => setEditColor(e.target.value)}
                                                                        />
                                                                    </div>
                                                                    <div className="flex items-center gap-4 w-full sm:w-auto">
                                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={editIsPrize}
                                                                                onChange={(e) => setEditIsPrize(e.target.checked)}
                                                                                className="rounded border-gray-400 text-[#1d1dd7] focus:ring-[#1d1dd7] w-5 h-5"
                                                                            />
                                                                            <span className="text-xs font-black uppercase text-gray-700">Lot gagnant</span>
                                                                        </label>
                                                                        <div className="flex items-center gap-2 ml-auto">
                                                                            <button
                                                                                onClick={() => handleUpdateReward(reward.id)}
                                                                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                                                            >
                                                                                <Check className="w-5 h-5" />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => setEditingRewardId(null)}
                                                                                className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-all"
                                                                            >
                                                                                <X className="w-5 h-5" />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <>
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
                                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                                        <button
                                                                            onClick={() => {
                                                                                setEditingRewardId(reward.id)
                                                                                setEditLabel(reward.label || '')
                                                                                setEditColor(reward.color || '#1d1dd7')
                                                                                setEditIsPrize(reward.is_prize)
                                                                            }}
                                                                            className="p-2 text-gray-400 hover:text-[#1d1dd7] hover:bg-[#f0f0ff] rounded-lg transition-all"
                                                                        >
                                                                            <Edit className="w-5 h-5" />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeleteReward(reward.id)}
                                                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                                        >
                                                                            <Trash2 className="w-5 h-5" />
                                                                        </button>
                                                                    </div>
                                                                </>
                                                            )}
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
                            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end">
                                <div className="flex-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Libellé du lot (facultatif)</label>
                                    <input
                                        type="text"
                                        placeholder="ex: Un café offert"
                                        className="w-full px-5 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1d1dd7] focus:border-transparent outline-none transition-all font-bold placeholder-gray-500 text-gray-900 h-12"
                                        value={newRewardLabel}
                                        onChange={(e) => setNewRewardLabel(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-1 sm:flex-none">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Couleur</label>
                                        <input
                                            type="color"
                                            className="w-full sm:w-16 h-12 p-1 bg-white border border-gray-300 rounded-xl cursor-pointer"
                                            value={newRewardColor}
                                            onChange={(e) => setNewRewardColor(e.target.value)}
                                        />
                                    </div>
                                    <button
                                        disabled={saving}
                                        type="submit"
                                        className="flex-1 sm:flex-none bg-[#1d1dd7] text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#1515a3] transition-all disabled:opacity-50 shadow-lg shadow-[#1d1dd7]/20 h-12 whitespace-nowrap"
                                    >
                                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                                        Ajouter
                                    </button>
                                </div>
                            </div>
                            <label className="flex items-center gap-3 cursor-pointer group w-fit">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={isPrize}
                                        onChange={(e) => setIsPrize(e.target.checked)}
                                        className="w-5 h-5 rounded border-gray-300 text-[#1d1dd7] focus:ring-[#1d1dd7]"
                                    />
                                </div>
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

                {/* Right column: Info/Rules & Preview */}
                <div className="space-y-6">
                    <div className="bg-[#0f1115] p-6 sm:p-8 rounded-[2.5rem] shadow-xl text-white flex flex-col items-center relative overflow-hidden">
                        {/* Soft Glow effect */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-[80px] opacity-30 z-0" style={{ background: campaign?.color_primary || restaurantSettings?.primary_color || '#1d1dd7' }} />

                        <div className="w-full flex justify-between items-center relative z-10 mb-2">
                            <h4 className="text-[11px] font-black text-white/50 uppercase tracking-[0.2em]">Aperçu en direct</h4>
                            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 relative z-10">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]" />
                                <span className="text-[9px] font-bold text-white/70 uppercase tracking-widest">Live</span>
                            </div>
                        </div>

                        <div className="relative z-10 w-full flex items-center justify-center pt-6 pb-2">
                            <div className="transform-gpu scale-[0.65] sm:scale-[0.75] origin-center -my-14 sm:-my-10 shrink-0">
                                {rewards.length > 0 ? (
                                    <Wheel
                                        segments={rewards.map(r => ({ label: r.label, color: r.color, is_prize: r.is_prize }))}
                                        winnerIndex={null}
                                        onFinished={() => { }}
                                        logoUrl={restaurantSettings?.logo_url || undefined}
                                        colors={{
                                            primary: campaign?.color_primary || restaurantSettings?.primary_color || '#1d1dd7',
                                            secondary: campaign?.color_secondary || '#ff0080',
                                            accent: campaign?.color_accent || '#ffcc00'
                                        }}
                                    />
                                ) : (
                                    <div className="w-80 h-80 rounded-full border-[6px] border-dashed border-white/10 flex flex-col items-center justify-center opacity-70 relative z-10">
                                        <div className="w-14 h-14 bg-white/5 rounded-full mb-4 animate-pulse" />
                                        <span className="text-xs font-bold uppercase tracking-widest text-center px-8 text-white/50">Ajoutez des lots</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900 p-8 rounded-[2.5rem] shadow-xl text-white space-y-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center gap-4">
                                <h4 className="text-lg md:text-xl font-black uppercase tracking-tight">Probabilité Globale</h4>
                                <span className="text-xl md:text-2xl font-black text-[#1d1dd7]">{campaign?.win_probability || 50}%</span>
                            </div>
                            <input
                                type="range"
                                min="50"
                                max="100"
                                step="1"
                                className="w-full h-3 md:h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#1d1dd7]"
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
