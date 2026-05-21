'use client'

import { useState } from 'react'
import { Search, CheckCircle2, XCircle, Loader2 } from 'lucide-react'

export default function ValidationPage() {
    const [code, setCode] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<{ success: boolean; label?: string; error?: string } | null>(null)

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!code || code.length < 4) return
        setLoading(true)
        setResult(null)
        try {
            const res = await fetch('/api/coupons/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
            })
            const data = await res.json()
            if (data.error) {
                setResult({ success: false, error: data.error })
            } else {
                setResult({ success: true, label: data.rewardLabel })
                setCode('')
            }
        } catch {
            setResult({ success: false, error: 'Une erreur est survenue' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col items-center justify-start pt-12 min-h-[60vh]">
            <div className="w-full max-w-xl space-y-5">
                <div className="text-center mb-8">
                    <h1 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>Validation de coupon</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                        Saisissez le code présenté par le client.
                    </p>
                </div>

                <div className="rounded-xl border p-6 space-y-4"
                    style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                    <form onSubmit={handleVerify} className="space-y-4">
                        <input
                            type="text"
                            placeholder="A1B2C3"
                            className="w-full px-5 py-5 rounded-lg border text-2xl font-mono tracking-[0.3em] uppercase text-center outline-none transition-all"
                            style={{
                                background: 'var(--bg-subtle)',
                                borderColor: 'var(--border)',
                                color: 'var(--text)',
                            }}
                            onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                            onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                            value={code}
                            onChange={e => { setCode(e.target.value.toUpperCase()); setResult(null) }}
                            maxLength={10}
                            required
                            autoFocus
                        />

                        <button
                            type="submit"
                            disabled={loading || code.length < 4}
                            className="w-full py-3.5 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                            style={{ background: 'var(--accent)' }}
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                            Vérifier le code
                        </button>
                    </form>

                    {result && (
                        <div className={`rounded-lg p-4 flex items-start gap-3 border ${
                            result.success
                                ? 'border-green-500/20 bg-green-500/5'
                                : 'border-red-500/20 bg-red-500/5'
                        }`}>
                            {result.success ? (
                                <>
                                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-green-500">Coupon valide</p>
                                        <p className="text-sm mt-0.5" style={{ color: 'var(--text)' }}>{result.label}</p>
                                        <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>Statut mis à jour : utilisé</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-red-500">Coupon invalide</p>
                                        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{result.error}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex gap-6 px-1">
                    <p className="text-xs" style={{ color: 'var(--text-faint)' }}>· Valable 48h après obtention</p>
                    <p className="text-xs" style={{ color: 'var(--text-faint)' }}>· Usage unique</p>
                </div>
            </div>
        </div>
    )
}
