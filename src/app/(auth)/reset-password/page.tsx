'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Lock, Loader2, CheckCircle2 } from 'lucide-react'

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas")
            return
        }

        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            })

            if (error) throw error

            setMessage("Votre mot de passe a été mis à jour avec succès !")
            setTimeout(() => {
                router.push('/login')
            }, 2000)
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
                        <Lock className="w-8 h-8 text-[#1d1dd7]" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                        Nouveau mot de passe
                    </h2>
                    <p className="mt-2 text-sm text-gray-500 font-medium">
                        Choisissez un mot de passe sécurisé pour votre compte.
                    </p>
                </div>

                {message ? (
                    <div className="bg-green-50 border border-green-100 p-6 rounded-2xl flex flex-col items-center text-center space-y-4 animate-in fade-in zoom-in">
                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                        <p className="text-sm font-bold text-green-800">{message}</p>
                        <p className="text-xs text-gray-400">Redirection vers la page de connexion...</p>
                    </div>
                ) : (
                    <form className="mt-8 space-y-6" onSubmit={handleUpdate}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">
                                    Nouveau mot de passe
                                </label>
                                <input
                                    required
                                    type="password"
                                    className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#1d1dd7] focus:border-[#1d1dd7] transition-all font-bold"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">
                                    Confirmer le mot de passe
                                </label>
                                <input
                                    required
                                    type="password"
                                    className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#1d1dd7] focus:border-[#1d1dd7] transition-all font-bold"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                            disabled={loading || !password}
                            className={`w-full flex justify-center py-4 px-4 border border-transparent text-sm font-black rounded-xl text-white bg-[#1d1dd7] hover:bg-[#1515a3] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1d1dd7] transition-all shadow-lg shadow-blue-500/20 ${loading ? 'opacity-50' : ''}`}
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'METTRE À JOUR'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}
