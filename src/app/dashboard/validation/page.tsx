'use client'

import { useState } from 'react'
import { TicketCheck, Search, CheckCircle2, XCircle, Loader2 } from 'lucide-react'

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
                setCode('') // Reset on success
            }
        } catch (err) {
            setResult({ success: false, error: 'Une erreur est survenue' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Validation des Coupons</h1>
                <p className="text-gray-500">Saisissez le code présenté par le client pour le valider.</p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <form onSubmit={handleVerify} className="space-y-6">
                    <div className="relative">
                        <TicketCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                        <input
                            type="text"
                            placeholder="CODE (ex: A1B2C3)"
                            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-300 rounded-2xl text-xl font-bold tracking-[0.2em] uppercase focus:ring-4 focus:ring-[#1d1dd7]/10 focus:border-[#1d1dd7] transition-all outline-none placeholder-gray-400 text-gray-900"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            maxLength={10}
                            required
                        />
                    </div>

                    <button
                        disabled={loading || code.length < 4}
                        className="w-full bg-[#1d1dd7] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#1515a3] transition-all disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Search className="w-5 h-5" />}
                        VÉRIFIER LE CODE
                    </button>
                </form>

                {result && (
                    <div className={`mt-8 p-6 rounded-2xl flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-300 ${result.success ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'
                        }`}>
                        {result.success ? (
                            <>
                                <CheckCircle2 className="w-10 h-10 text-green-500 shrink-0" />
                                <div>
                                    <h3 className="text-lg font-bold text-green-900 leading-tight">Coupon Valide !</h3>
                                    <p className="text-green-800 font-medium text-xl mt-1">
                                        Offre : <span className="underline decoration-2">{result.label}</span>
                                    </p>
                                    <p className="text-green-600 text-sm mt-2 font-semibold uppercase tracking-wider">
                                        Statut mis à jour : UTILISÉ
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <XCircle className="w-10 h-10 text-red-500 shrink-0" />
                                <div>
                                    <h3 className="text-lg font-bold text-red-900">Erreur de validation</h3>
                                    <p className="text-red-800 mt-1">{result.error}</p>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Conseils</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 font-medium">
                    <div className="flex gap-2">
                        <span className="text-[#1d1dd7]">●</span>
                        Le code est valable 10 minutes après l'obtention.
                    </div>
                    <div className="flex gap-2">
                        <span className="text-[#1d1dd7]">●</span>
                        Chaque code ne peut être utilisé qu'une seule fois.
                    </div>
                </div>
            </div>
        </div>
    )
}
