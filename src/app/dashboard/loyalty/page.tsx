'use client'

import { useEffect, useState, useCallback } from 'react'
import {
    Search, CheckCircle2, XCircle, Loader2,
    Plus, Minus, Save, AlertCircle, User, CreditCard
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface CardResult {
    cardCode: string
    pointsBalance: number
    rewardThreshold: number
    rewardDescription: string
    progress: number
    rewardReached: boolean
    restaurant: { name: string; primaryColor: string }
    customerFirstName?: string | null
    customerLastName?: string | null
    customerEmail?: string | null
}

interface SearchResult {
    cardCode: string
    firstName: string | null
    lastName: string | null
    email: string | null
    pointsBalance: number
    rewardThreshold: number
    rewardDescription: string
    progress: number
    rewardReached: boolean
}

interface ProgramStats {
    totalCards: number
    totalPoints: number
    rewardsReached: number
}

interface LoyaltyProgram {
    id: string | null
    reward_threshold: number
    reward_description: string
    isNew?: boolean
}

function PageSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-xl border p-5 space-y-5"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
            <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{title}</p>
            {children}
        </div>
    )
}

function FormLabel({ children }: { children: React.ReactNode }) {
    return (
        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
            {children}
        </label>
    )
}

function TextInput({ value, onChange, placeholder, type = 'text', className = '' }: {
    value: string | number
    onChange: (v: string) => void
    placeholder?: string
    type?: string
    className?: string
}) {
    return (
        <input
            type={type}
            placeholder={placeholder}
            className={`w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-all ${className}`}
            style={{
                background: 'var(--bg-subtle)',
                borderColor: 'var(--border)',
                color: 'var(--text)',
            }}
            value={value}
            onChange={e => onChange(e.target.value)}
            onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
        />
    )
}

export default function LoyaltyPage() {
    const [searchMode, setSearchMode] = useState<'code' | 'name'>('code')
    const [code, setCode] = useState('')
    const [searching, setSearching] = useState(false)
    const [cardResult, setCardResult] = useState<CardResult | null>(null)
    const [searchError, setSearchError] = useState<string | null>(null)
    const [nameQuery, setNameQuery] = useState('')
    const [nameResults, setNameResults] = useState<SearchResult[]>([])
    const [searchingByName, setSearchingByName] = useState(false)
    const [nameSearchError, setNameSearchError] = useState<string | null>(null)

    const [pointsToAdd, setPointsToAdd] = useState(1)
    const [note, setNote] = useState('')
    const [adding, setAdding] = useState(false)
    const [addResult, setAddResult] = useState<{ success: boolean; message: string } | null>(null)

    const [program, setProgram] = useState<LoyaltyProgram | null>(null)
    const [stats, setStats] = useState<ProgramStats | null>(null)
    const [savingProgram, setSavingProgram] = useState(false)
    const [programStatus, setProgramStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
    const [loyaltyCardEnabled, setLoyaltyCardEnabled] = useState(true)
    const [togglingCard, setTogglingCard] = useState(false)

    const supabase = createClient()

    const fetchProgramAndStats = useCallback(async () => {
        const res = await fetch('/api/loyalty/program')
        if (!res.ok) return
        const data = await res.json()
        if (data.program) setProgram(data.program)
        if (data.stats) setStats(data.stats)

        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { data: rest } = await supabase
                .from('restaurants')
                .select('loyalty_card_enabled')
                .eq('user_id', user.id)
                .single()
            if (rest) setLoyaltyCardEnabled(rest.loyalty_card_enabled !== false)
        }
    }, [])

    useEffect(() => { fetchProgramAndStats() }, [fetchProgramAndStats])

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!code) return
        setSearching(true)
        setCardResult(null)
        setSearchError(null)
        setAddResult(null)
        try {
            const res = await fetch(`/api/loyalty/${code.toUpperCase()}`)
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Carte introuvable')
            setCardResult(data)
        } catch (err: any) {
            setSearchError(err.message)
        } finally {
            setSearching(false)
        }
    }

    const performNameSearch = useCallback(async (q: string) => {
        if (q.length < 2) return
        setSearchingByName(true)
        setNameResults([])
        setNameSearchError(null)
        setCardResult(null)
        try {
            const res = await fetch(`/api/loyalty/search?q=${encodeURIComponent(q)}`)
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setNameResults(data.results)
            if (data.results.length === 0) setNameSearchError('Aucun client trouvé')
        } catch (err: any) {
            setNameSearchError(err.message)
        } finally {
            setSearchingByName(false)
        }
    }, [])

    useEffect(() => {
        if (searchMode !== 'name') return
        if (nameQuery.length < 2) { setNameResults([]); setNameSearchError(null); return }
        const timer = setTimeout(() => performNameSearch(nameQuery), 400)
        return () => clearTimeout(timer)
    }, [nameQuery, searchMode, performNameSearch])

    const handleSelectResult = async (cardCode: string) => {
        setSearching(true)
        setCardResult(null)
        setAddResult(null)
        setNameResults([])
        try {
            const res = await fetch(`/api/loyalty/${cardCode}`)
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setCardResult(data)
        } catch (err: any) {
            setNameSearchError(err.message)
        } finally {
            setSearching(false)
        }
    }

    const handleAddPoints = async () => {
        if (!cardResult) return
        setAdding(true)
        setAddResult(null)
        try {
            const res = await fetch('/api/loyalty/add-points', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cardCode: cardResult.cardCode, points: pointsToAdd, note })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setAddResult({
                success: true,
                message: data.rewardReached
                    ? `${pointsToAdd} point${pointsToAdd > 1 ? 's' : ''} ajouté${pointsToAdd > 1 ? 's' : ''} — récompense atteinte`
                    : `${pointsToAdd} point${pointsToAdd > 1 ? 's' : ''} ajouté${pointsToAdd > 1 ? 's' : ''} — solde : ${data.newBalance}/${cardResult.rewardThreshold}`
            })
            const refreshed = await fetch(`/api/loyalty/${cardResult.cardCode}`)
            if (refreshed.ok) setCardResult(await refreshed.json())
            setNote('')
            setPointsToAdd(1)
            fetchProgramAndStats()
        } catch (err: any) {
            setAddResult({ success: false, message: err.message })
        } finally {
            setAdding(false)
        }
    }

    const handleToggleLoyaltyCard = async () => {
        setTogglingCard(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return
            const newValue = !loyaltyCardEnabled
            await supabase
                .from('restaurants')
                .update({ loyalty_card_enabled: newValue })
                .eq('user_id', user.id)
            setLoyaltyCardEnabled(newValue)
        } finally {
            setTogglingCard(false)
        }
    }

    const handleSaveProgram = async () => {
        if (!program) return
        setSavingProgram(true)
        try {
            const res = await fetch('/api/loyalty/program', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reward_threshold: program.reward_threshold, reward_description: program.reward_description })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setProgramStatus({ type: 'success', message: program?.isNew ? 'Programme créé' : 'Enregistré' })
            fetchProgramAndStats()
        } catch (err: any) {
            setProgramStatus({ type: 'error', message: err.message })
        } finally {
            setSavingProgram(false)
            setTimeout(() => setProgramStatus(null), 3000)
        }
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">

            {/* Header */}
            <div>
                <h1 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>Carte de fidélité</h1>
                <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    Attribuez des points à vos clients et gérez votre programme.
                </p>
            </div>

            {/* Toggle carte de fidélité */}
            <div className="rounded-xl border p-4 flex items-center justify-between gap-4"
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                        Afficher la carte de fidélité aux clients
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        Si désactivé, la carte ne sera pas proposée à la fin du parcours client.
                    </p>
                </div>
                <button
                    onClick={handleToggleLoyaltyCard}
                    disabled={togglingCard}
                    className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 focus:outline-none disabled:opacity-50 ${
                        loyaltyCardEnabled ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'
                    }`}
                    style={loyaltyCardEnabled ? {} : { background: 'var(--text-faint)' }}
                >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        loyaltyCardEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                </button>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: 'Cartes actives', value: stats.totalCards },
                        { label: 'Points distribués', value: stats.totalPoints },
                        { label: 'Récompenses atteintes', value: stats.rewardsReached },
                    ].map((s) => (
                        <div key={s.label} className="rounded-xl border p-4"
                            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                            <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-faint)' }}>{s.label}</p>
                            <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{s.value}</p>
                        </div>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* Attribution de points */}
                <div className="space-y-4">
                    <PageSection title="Attribution de points">

                        {/* Mode toggle */}
                        <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--bg-subtle)' }}>
                            {(['code', 'name'] as const).map(mode => (
                                <button key={mode}
                                    onClick={() => {
                                        setSearchMode(mode)
                                        setCardResult(null)
                                        setSearchError(null)
                                        setNameResults([])
                                        setNameSearchError(null)
                                    }}
                                    className="flex-1 py-1.5 rounded-md text-xs font-medium transition-all"
                                    style={{
                                        background: searchMode === mode ? 'var(--bg-surface)' : 'transparent',
                                        color: searchMode === mode ? 'var(--text)' : 'var(--text-muted)',
                                        boxShadow: searchMode === mode ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                    }}
                                >
                                    {mode === 'code' ? 'Par code' : 'Par nom'}
                                </button>
                            ))}
                        </div>

                        {/* Search by code */}
                        {searchMode === 'code' && (
                            <form onSubmit={handleSearch} className="space-y-3">
                                <div>
                                    <FormLabel>Code carte</FormLabel>
                                    <TextInput
                                        value={code}
                                        onChange={v => { setCode(v.toUpperCase()); setCardResult(null); setSearchError(null) }}
                                        placeholder="FID-ABCD1234"
                                        className="font-mono tracking-wider uppercase"
                                    />
                                </div>
                                <button type="submit" disabled={searching || !code}
                                    className="w-full py-2.5 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                    style={{ background: 'var(--accent)' }}>
                                    {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                    Rechercher
                                </button>
                                {searchError && (
                                    <div className="flex items-center gap-2 text-sm text-red-500">
                                        <XCircle className="w-4 h-4 shrink-0" />
                                        {searchError}
                                    </div>
                                )}
                            </form>
                        )}

                        {/* Search by name */}
                        {searchMode === 'name' && (
                            <form onSubmit={e => { e.preventDefault(); performNameSearch(nameQuery) }} className="space-y-3">
                                <div>
                                    <FormLabel>Nom ou prénom du client</FormLabel>
                                    <TextInput
                                        value={nameQuery}
                                        onChange={v => {
                                            setNameQuery(v)
                                            if (v.length < 2) { setNameResults([]); setNameSearchError(null) }
                                        }}
                                        placeholder="ex: Marie Dupont"
                                    />
                                </div>
                                <button type="submit" disabled={searchingByName || nameQuery.length < 2}
                                    className="w-full py-2.5 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                    style={{ background: 'var(--accent)' }}>
                                    {searchingByName ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                    Rechercher
                                </button>

                                {nameSearchError && (
                                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{nameSearchError}</p>
                                )}

                                {nameResults.length > 0 && (
                                    <div className="space-y-1.5 pt-1">
                                        {nameResults.map(r => (
                                            <button key={r.cardCode} onClick={() => handleSelectResult(r.cardCode)}
                                                className="w-full text-left px-3 py-3 rounded-lg border flex items-center justify-between gap-3 transition-all"
                                                style={{ borderColor: 'var(--border)', background: 'var(--bg-subtle)' }}
                                                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                                                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                                            >
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>
                                                        {r.firstName} {r.lastName}
                                                    </p>
                                                    <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-faint)' }}>
                                                        {r.cardCode} · {r.pointsBalance}/{r.rewardThreshold} pts
                                                    </p>
                                                </div>
                                                <div className="w-16 h-1 rounded-full overflow-hidden flex-shrink-0" style={{ background: 'var(--border)' }}>
                                                    <div className="h-full rounded-full" style={{
                                                        width: `${r.progress}%`,
                                                        background: r.rewardReached ? '#22c55e' : 'var(--accent)'
                                                    }} />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </form>
                        )}
                    </PageSection>

                    {/* Card found */}
                    {cardResult && (
                        <div className="rounded-xl border p-5 space-y-5"
                            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>

                            {/* Client info */}
                            {cardResult.customerFirstName && (
                                <div className="flex items-center gap-3 pb-4 border-b"
                                    style={{ borderColor: 'var(--border)' }}>
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                                        style={{ background: 'var(--accent-light)' }}>
                                        <User className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                                            {cardResult.customerFirstName} {cardResult.customerLastName}
                                        </p>
                                        {cardResult.customerEmail && (
                                            <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{cardResult.customerEmail}</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Progress */}
                            <div>
                                <div className="flex justify-between items-baseline mb-3">
                                    <p className="text-xs font-mono" style={{ color: 'var(--text-faint)' }}>{cardResult.cardCode}</p>
                                    <p className="text-lg font-bold" style={{ color: 'var(--text)' }}>
                                        {cardResult.pointsBalance}
                                        <span className="text-sm font-normal" style={{ color: 'var(--text-faint)' }}>
                                            /{cardResult.rewardThreshold}
                                        </span>
                                    </p>
                                </div>
                                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                                    <div className="h-full rounded-full transition-all duration-700"
                                        style={{
                                            width: `${cardResult.progress}%`,
                                            background: cardResult.rewardReached ? '#22c55e' : 'var(--accent)'
                                        }} />
                                </div>
                                {cardResult.rewardReached && (
                                    <p className="text-xs text-green-500 font-medium mt-2">
                                        Récompense atteinte : {cardResult.rewardDescription}
                                    </p>
                                )}
                            </div>

                            {/* Points input */}
                            <div className="space-y-4">
                                <div>
                                    <FormLabel>Points à attribuer</FormLabel>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => setPointsToAdd(Math.max(1, pointsToAdd - 1))}
                                            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
                                            style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}>
                                            <Minus className="w-3.5 h-3.5" />
                                        </button>
                                        <p className="flex-1 text-center text-xl font-bold" style={{ color: 'var(--text)' }}>
                                            {pointsToAdd}
                                        </p>
                                        <button onClick={() => setPointsToAdd(pointsToAdd + 1)}
                                            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
                                            style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}>
                                            <Plus className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <FormLabel>Note interne (optionnel)</FormLabel>
                                    <TextInput value={note} onChange={setNote} placeholder="ex: commande du 20/05" />
                                </div>

                                <button onClick={handleAddPoints} disabled={adding}
                                    className="w-full py-2.5 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                    style={{ background: 'var(--accent)' }}>
                                    {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                    Attribuer {pointsToAdd} point{pointsToAdd > 1 ? 's' : ''}
                                </button>

                                {addResult && (
                                    <div className={`flex items-center gap-2 text-sm ${addResult.success ? 'text-green-500' : 'text-red-500'}`}>
                                        {addResult.success
                                            ? <CheckCircle2 className="w-4 h-4 shrink-0" />
                                            : <AlertCircle className="w-4 h-4 shrink-0" />
                                        }
                                        {addResult.message}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Règles du programme */}
                <div>
                    <PageSection title="Règles du programme">
                        {program?.isNew && (
                            <div className="flex items-start gap-2 text-sm text-amber-500">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                <p>Configurez votre programme avant que vos clients ne scannent.</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <FormLabel>Seuil de récompense (nombre de visites)</FormLabel>
                                <TextInput
                                    type="number"
                                    value={program?.reward_threshold ?? 10}
                                    onChange={v => setProgram(p => p ? { ...p, reward_threshold: parseInt(v) || 10 } : p)}
                                />
                                <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>
                                    La récompense est déclenchée après ce nombre de visites
                                </p>
                            </div>

                            <div>
                                <FormLabel>Description de la récompense</FormLabel>
                                <TextInput
                                    value={program?.reward_description ?? ''}
                                    onChange={v => setProgram(p => p ? { ...p, reward_description: v } : p)}
                                    placeholder="ex: 1 dessert offert"
                                />
                            </div>

                            <button onClick={handleSaveProgram} disabled={savingProgram || !program}
                                className="w-full py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                style={{ background: 'var(--text)', color: 'var(--bg)' }}>
                                {savingProgram ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {program?.isNew ? 'Créer le programme' : 'Enregistrer'}
                            </button>

                            {programStatus && (
                                <div className={`flex items-center gap-2 text-sm ${programStatus.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                                    {programStatus.type === 'success'
                                        ? <CheckCircle2 className="w-4 h-4" />
                                        : <AlertCircle className="w-4 h-4" />
                                    }
                                    {programStatus.message}
                                </div>
                            )}
                        </div>

                        {program && !program.isNew && (
                            <div className="rounded-lg p-4 border-t pt-5 mt-1" style={{ borderColor: 'var(--border)' }}>
                                <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-faint)' }}>Résumé actif</p>
                                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                    1 visite = 1 point · après{' '}
                                    <span style={{ color: 'var(--text)' }}>{program.reward_threshold} visites</span>
                                    {' '}→{' '}
                                    <span style={{ color: 'var(--text)' }}>{program.reward_description || '—'}</span>
                                </p>
                            </div>
                        )}
                    </PageSection>
                </div>
            </div>
        </div>
    )
}
