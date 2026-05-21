'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Plus,
    Trash2,
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

    const [editingRewardId, setEditingRewardId] = useState<string | null>(null)
    const [editLabel, setEditLabel] = useState('')
    const [editColor, setEditColor] = useState('')
    const [editIsPrize, setEditIsPrize] = useState(true)

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
                    .order('created_at', { ascending: true })

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
            await supabase
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

            await fetchData()
            setNewRewardLabel('')
            setIsPrize(true)

            const wheelPalette = [
                '#1d1dd7', '#ff0080', '#ffcc00', '#00d4ff', '#00ff88',
                '#ff6600', '#9d00ff', '#ff0000', '#0088ff', '#ff00ff'
            ]
            setNewRewardColor(wheelPalette[(rewards.length + 1) % wheelPalette.length])
            setStatus({ type: 'success', message: 'Récompense ajoutée !' })
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Une erreur est survenue'
            setStatus({ type: 'error', message })
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
                .update({ label: editLabel, color: editColor, is_prize: editIsPrize })
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

            await supabase.from('campaigns').update({ is_active: false }).eq('restaurant_id', restaurant.id)
            const { error } = await supabase.from('campaigns').update({ is_active: true }).eq('id', id)
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
                .insert([{ restaurant_id: rest!.id, name: newCampaignName, is_active: false, win_probability: 50 }])
                .select()
                .single()

            if (error) throw error
            setNewCampaignName('')
            setShowNewModel(false)
            await fetchData()
            setCampaign(data)
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
            const { error } = await supabase.from('campaigns').update({ is_active: newStatus }).eq('id', campaign.id)
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
            const { error } = await supabase.from('campaigns').update({ win_probability: prob }).eq('id', campaign.id)
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
        const { data: restaurant } = await supabase.from('restaurants').select('id').eq('user_id', user.id).single()
        if (!restaurant) return

        setSaving(true)
        try {
            const { error } = await supabase.from('campaigns').update({ is_active: false }).eq('restaurant_id', restaurant.id)
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
                    const { data: fetchRewards } = await supabase.from('rewards').select('*').eq('campaign_id', next.id)
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
        const updatedItems = items.map((item, index) => ({ ...item, order_index: index }))
        setRewards(updatedItems)
        try {
            const updates = updatedItems.map((item, index) =>
                supabase.from('rewards').update({ order_index: index }).eq('id', item.id)
            )
            await Promise.all(updates)
        } catch {
            await fetchData()
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center min-h-[300px]">
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--text-faint)' }} />
        </div>
    )

    const inputStyle = {
        background: 'var(--bg-subtle)',
        borderColor: 'var(--border)',
        color: 'var(--text)',
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>Modèles de Roue</h1>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Créez des configurations de lots et basculez en un clic.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowNewModel(!showNewModel)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all"
                        style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', background: 'var(--bg-surface)' }}
                    >
                        <Plus className="w-4 h-4" /> Nouveau modèle
                    </button>
                    <button
                        onClick={deactivateAllCampaigns}
                        disabled={saving}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 text-red-500 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10"
                    >
                        Tout désactiver
                    </button>
                </div>
            </div>

            {/* New model modal */}
            {showNewModel && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                    onClick={() => setShowNewModel(false)}
                >
                    <div
                        className="rounded-xl border p-6 w-full max-w-md shadow-2xl"
                        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--text)' }}>Nouveau modèle</h3>
                        <p className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>Donnez un nom à votre nouvelle configuration de lot.</p>

                        <form onSubmit={createModel} className="space-y-4">
                            <input
                                required
                                autoFocus
                                type="text"
                                placeholder="ex: Offres Été 2024"
                                className="w-full px-4 py-3 rounded-lg border text-sm outline-none transition-all"
                                style={inputStyle}
                                onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                                onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                                value={newCampaignName}
                                onChange={(e) => setNewCampaignName(e.target.value)}
                            />
                            <div className="flex gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setShowNewModel(false)}
                                    className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all"
                                    style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-[2] py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                    style={{ background: 'var(--text)', color: 'var(--bg)' }}
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                    Créer et configurer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Campaign cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {allCampaigns.map((c) => (
                    <div
                        key={c.id}
                        onClick={async () => {
                            setCampaign(c)
                            const { data: fetchRewards } = await supabase.from('rewards').select('*').eq('campaign_id', c.id)
                            setRewards(fetchRewards || [])
                        }}
                        className="p-4 rounded-xl border transition-all cursor-pointer"
                        style={{
                            background: 'var(--bg-surface)',
                            borderColor: campaign?.id === c.id ? 'var(--accent)' : 'var(--border)',
                            boxShadow: campaign?.id === c.id ? '0 0 0 1px var(--accent)' : 'none',
                        }}
                    >
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="text-sm font-medium" style={{ color: 'var(--text)' }}>{c.name}</h3>
                            <div className="flex items-center gap-1.5">
                                {c.is_active && (
                                    <span className="bg-green-500/10 text-green-600 text-[10px] font-semibold px-2 py-0.5 rounded-md">Actif</span>
                                )}
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDeleteCampaign(c.id) }}
                                    className="p-1 rounded-md transition-all hover:text-red-500"
                                    style={{ color: 'var(--text-faint)' }}
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                        <p className="text-xs mb-3" style={{ color: 'var(--text-faint)' }}>Créé le {new Date(c.created_at).toLocaleDateString()}</p>

                        {!c.is_active && (
                            <button
                                onClick={(e) => { e.stopPropagation(); switchCampaign(c.id) }}
                                className="w-full py-1.5 rounded-lg text-xs font-medium transition-all border"
                                style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', background: 'transparent' }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.borderColor = 'var(--accent)'
                                    e.currentTarget.style.color = 'var(--accent)'
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.borderColor = 'var(--border)'
                                    e.currentTarget.style.color = 'var(--text-muted)'
                                }}
                            >
                                Activer sur le QR Code
                            </button>
                        )}
                        {c.is_active && (
                            <button
                                onClick={(e) => { e.stopPropagation(); toggleCampaignStatus() }}
                                className="w-full py-1.5 rounded-lg text-xs font-medium transition-all text-red-500 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10"
                            >
                                Désactiver
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <div className="border-t" style={{ borderColor: 'var(--border)' }} />

            {campaign && (
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        {isEditingCampaignName ? (
                            <div className="flex items-center gap-2 max-w-md">
                                <input
                                    autoFocus
                                    type="text"
                                    className="flex-1 text-base font-semibold px-3 py-2 rounded-lg border outline-none"
                                    style={{ background: 'var(--bg-subtle)', borderColor: 'var(--accent)', color: 'var(--text)' }}
                                    value={editedCampaignName}
                                    onChange={(e) => setEditedCampaignName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleUpdateCampaignName()
                                        if (e.key === 'Escape') setIsEditingCampaignName(false)
                                    }}
                                />
                                <button onClick={handleUpdateCampaignName} className="p-1.5 text-green-500 hover:bg-green-500/10 rounded-lg transition-all">
                                    <Check className="w-4 h-4" />
                                </button>
                                <button onClick={() => setIsEditingCampaignName(false)} className="p-1.5 rounded-lg transition-all" style={{ color: 'var(--text-faint)' }}>
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <h2 className="text-base font-semibold" style={{ color: 'var(--text)' }}>Modification : {campaign.name}</h2>
                                <button
                                    onClick={() => { setIsEditingCampaignName(true); setEditedCampaignName(campaign.name) }}
                                    className="p-1.5 rounded-lg transition-all"
                                    style={{ color: 'var(--text-faint)' }}
                                >
                                    <Edit className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        )}
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Éditez les lots de ce modèle spécifique.</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Left: manage rewards */}
                <div className="md:col-span-2 space-y-4">
                    <div className="rounded-xl border p-5"
                        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                        <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>Liste des récompenses</h3>

                        <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable droppableId="rewards">
                                {(provided) => (
                                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                                        {rewards.length === 0 ? (
                                            <div className="text-center py-10 rounded-lg border border-dashed"
                                                style={{ borderColor: 'var(--border)' }}>
                                                <p className="text-sm" style={{ color: 'var(--text-faint)' }}>Aucune récompense pour le moment.</p>
                                            </div>
                                        ) : (
                                            rewards.map((reward, index) => (
                                                <Draggable key={reward.id} draggableId={reward.id} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            className={`group flex items-center justify-between p-3 rounded-lg border transition-all ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                                                            style={{
                                                                background: snapshot.isDragging ? 'var(--bg-surface)' : 'var(--bg-subtle)',
                                                                borderColor: snapshot.isDragging ? 'var(--accent)' : 'var(--border)',
                                                            }}
                                                        >
                                                            {editingRewardId === reward.id ? (
                                                                <div className="flex-1 flex flex-col sm:flex-row items-center gap-3">
                                                                    <div className="flex-1 flex items-center gap-2 w-full">
                                                                        <input
                                                                            autoFocus
                                                                            type="text"
                                                                            className="flex-1 px-3 py-1.5 rounded-lg border text-sm outline-none"
                                                                            style={{ background: 'var(--bg-surface)', borderColor: 'var(--accent)', color: 'var(--text)' }}
                                                                            value={editLabel}
                                                                            onChange={(e) => setEditLabel(e.target.value)}
                                                                            placeholder="Nom du lot..."
                                                                        />
                                                                        <input
                                                                            type="color"
                                                                            className="w-9 h-9 p-0.5 rounded-lg border cursor-pointer"
                                                                            style={{ borderColor: 'var(--border)' }}
                                                                            value={editColor}
                                                                            onChange={(e) => setEditColor(e.target.value)}
                                                                        />
                                                                    </div>
                                                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={editIsPrize}
                                                                                onChange={(e) => setEditIsPrize(e.target.checked)}
                                                                                className="rounded w-4 h-4"
                                                                            />
                                                                            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Lot gagnant</span>
                                                                        </label>
                                                                        <div className="flex items-center gap-1 ml-auto">
                                                                            <button onClick={() => handleUpdateReward(reward.id)} className="p-1.5 text-green-500 hover:bg-green-500/10 rounded-lg transition-all">
                                                                                <Check className="w-4 h-4" />
                                                                            </button>
                                                                            <button onClick={() => setEditingRewardId(null)} className="p-1.5 rounded-lg transition-all" style={{ color: 'var(--text-faint)' }}>
                                                                                <X className="w-4 h-4" />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <div className="flex items-center gap-2.5">
                                                                        <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing" style={{ color: 'var(--text-faint)' }}>
                                                                            <GripVertical className="w-4 h-4" />
                                                                        </div>
                                                                        <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: reward.color }} />
                                                                        <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                                                                            {reward.label || <span style={{ color: 'var(--text-faint)' }} className="italic">Sans texte</span>}
                                                                        </span>
                                                                        {reward.is_prize ? (
                                                                            <span className="bg-green-500/10 text-green-600 text-[10px] font-medium px-1.5 py-0.5 rounded">Prix</span>
                                                                        ) : (
                                                                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-subtle)', color: 'var(--text-faint)' }}>Filler</span>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                                        <button
                                                                            onClick={() => { setEditingRewardId(reward.id); setEditLabel(reward.label || ''); setEditColor(reward.color || '#1d1dd7'); setEditIsPrize(reward.is_prize) }}
                                                                            className="p-1.5 rounded-lg transition-all"
                                                                            style={{ color: 'var(--text-faint)' }}
                                                                            onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
                                                                            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-faint)')}
                                                                        >
                                                                            <Edit className="w-4 h-4" />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeleteReward(reward.id)}
                                                                            className="p-1.5 rounded-lg transition-all text-red-400 hover:text-red-500 hover:bg-red-500/10"
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
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

                        <form onSubmit={handleAddReward} className="mt-5 space-y-4">
                            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
                                <div className="flex-1">
                                    <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-muted)' }}>Libellé du lot (facultatif)</label>
                                    <input
                                        type="text"
                                        placeholder="ex: Un café offert"
                                        className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-all h-10"
                                        style={inputStyle}
                                        onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                                        onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                                        value={newRewardLabel}
                                        onChange={(e) => setNewRewardLabel(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <div className="flex-1 sm:flex-none">
                                        <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-muted)' }}>Couleur</label>
                                        <input
                                            type="color"
                                            className="w-full sm:w-14 h-10 p-1 rounded-lg border cursor-pointer"
                                            style={{ borderColor: 'var(--border)' }}
                                            value={newRewardColor}
                                            onChange={(e) => setNewRewardColor(e.target.value)}
                                        />
                                    </div>
                                    <button
                                        disabled={saving}
                                        type="submit"
                                        className="flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 h-10 whitespace-nowrap self-end"
                                        style={{ background: 'var(--text)', color: 'var(--bg)' }}
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                        Ajouter
                                    </button>
                                </div>
                            </div>
                            <label className="flex items-center gap-2.5 cursor-pointer w-fit">
                                <input
                                    type="checkbox"
                                    checked={isPrize}
                                    onChange={(e) => setIsPrize(e.target.checked)}
                                    className="w-4 h-4 rounded"
                                />
                                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                    C&apos;est un cadeau à gagner (génère un coupon)
                                </span>
                            </label>
                        </form>

                        {status && (
                            <div className={`mt-4 flex items-center gap-2 text-sm font-medium ${status.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                {status.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                {status.message}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right column */}
                <div className="space-y-4">
                    {/* Wheel preview */}
                    <div className="rounded-xl overflow-hidden border relative"
                        style={{ background: '#0f1115', borderColor: 'rgba(255,255,255,0.08)' }}>
                        <div className="flex justify-between items-center px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                            <span className="text-[10px] font-medium text-white/40 uppercase tracking-widest">Aperçu</span>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[9px] font-medium text-white/60 uppercase tracking-widest">Live</span>
                            </div>
                        </div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full blur-[70px] opacity-25 pointer-events-none"
                            style={{ background: campaign?.color_primary || restaurantSettings?.primary_color || '#1d1dd7' }} />
                        <div className="flex items-center justify-center px-4 pb-4 pt-2">
                            <div className="transform-gpu scale-[0.65] origin-center -my-14 shrink-0">
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
                                    <div className="w-64 h-64 rounded-full border-2 border-dashed border-white/10 flex flex-col items-center justify-center">
                                        <span className="text-xs font-medium text-white/30 text-center px-6">Ajoutez des lots</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Probability */}
                    <div className="rounded-xl border p-4 space-y-4"
                        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                        <div className="flex justify-between items-center">
                            <h4 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Probabilité globale</h4>
                            <span className="text-lg font-semibold" style={{ color: 'var(--accent)' }}>{campaign?.win_probability || 50}%</span>
                        </div>
                        <input
                            type="range"
                            min="50"
                            max="100"
                            step="1"
                            className="w-full h-1.5 rounded-lg appearance-none cursor-pointer"
                            style={{ accentColor: 'var(--accent)' }}
                            value={campaign?.win_probability || 50}
                            onChange={(e) => updateCampaignProbability(parseInt(e.target.value))}
                        />
                        <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
                            Chances totales de tomber sur un lot gagnant (min 50%)
                        </p>
                    </div>

                    {/* Rules */}
                    <div className="rounded-xl border p-4 space-y-3"
                        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                        <h4 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Règles du jeu</h4>
                        <ul className="space-y-3">
                            {[
                                'La probabilité globale définit si le client gagne un lot ou non.',
                                'Les lots gagnants et perdants sont ensuite répartis équitablement.',
                                'Modifier la roue n\'affecte pas les coupons déjà émis.',
                            ].map((rule, i) => (
                                <li key={i} className="flex gap-2.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0 mt-0.5"
                                        style={{ background: 'var(--bg-subtle)', color: 'var(--text-faint)' }}>
                                        {i + 1}
                                    </span>
                                    {rule}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Active campaign indicator */}
                    <div className="rounded-xl border p-4 flex items-center gap-3"
                        style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border)' }}>
                        <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                        <div>
                            <p className="text-xs font-medium" style={{ color: 'var(--text)' }}>Campagne active</p>
                            <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>{campaign?.name || '...'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
