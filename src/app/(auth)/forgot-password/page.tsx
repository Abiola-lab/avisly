'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setMessage(null)

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/reset-password`,
            })

            if (error) throw error

            setMessage("Un lien de réinitialisation a été envoyé à votre adresse email.")
        } catch (err: any) {
            setError(err.message || "Une erreur est survenue")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl">
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                        <Mail className="w-8 h-8 text-[#1d1dd7]" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                        Mot de passe oublié ?
                    </h2>
                    <p className="mt-2 text-sm text-gray-500 font-medium">
                        Pas de panique ! Entrez votre email pour recevoir un lien de réinitialisation.
                    </p>
                </div>

                {message ? (
                    <div className="bg-green-50 border border-green-100 p-6 rounded-2xl flex flex-col items-center text-center space-y-4 animate-in fade-in zoom-in">
                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                        <p className="text-sm font-bold text-green-800">{message}</p>
                        <Link href="/login" className="text-[#1d1dd7] font-bold text-sm hover:underline flex items-center gap-2">
                            <ArrowLeft className="w-4 h-4" /> Retour à la connexion
                        </Link>
                    </div>
                ) : (
                    <form className="mt-8 space-y-6" onSubmit={handleReset}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="email-address" className="block text-sm font-bold text-gray-700 mb-1">
                                    Adresse email
                                </label>
                                <input
                                    id="email-address"
                                    name="email"
                                    type="email"
                                    required
                                    className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#1d1dd7] focus:border-[#1d1dd7] transition-all font-bold"
                                    placeholder="votre@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-500 text-xs text-center font-bold bg-red-50 p-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !email}
                            className={`w-full flex justify-center py-4 px-4 border border-transparent text-sm font-black rounded-xl text-white bg-[#1d1dd7] hover:bg-[#1515a3] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1d1dd7] transition-all shadow-lg shadow-blue-500/20 ${loading ? 'opacity-50' : ''}`}
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'ENVOYER LE LIEN'}
                        </button>

                        <div className="text-center">
                            <Link href="/login" className="text-sm font-bold text-gray-400 hover:text-[#1d1dd7] transition-colors flex items-center justify-center gap-2">
                                <ArrowLeft className="w-4 h-4" /> Retour à la connexion
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}
