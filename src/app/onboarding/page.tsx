'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { MapPin, Store, Link as LinkIcon, ArrowRight } from 'lucide-react'

export default function OnboardingPage() {
    const [name, setName] = useState('')
    const [address, setAddress] = useState('')
    const [googleLink, setGoogleLink] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Utilisateur non trouvé')

            // 1. Créer le restaurant
            const { data: restaurant, error: restError } = await supabase
                .from('restaurants')
                .insert([{ user_id: user.id, name, address, google_link: googleLink }])
                .select()
                .single()

            if (restError) throw restError

            // 2. Créer la campagne par défaut
            const { error: campError } = await supabase
                .from('campaigns')
                .insert([{
                    restaurant_id: restaurant.id,
                    name: 'Campagne par défaut',
                    is_active: true
                }])

            if (campError) throw campError

            router.push('/dashboard')
            router.refresh()
        } catch (err: any) {
            alert(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row">
                <div className="w-full p-8 md:p-12">
                    <div className="mb-8">
                        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Configurons votre restaurant</h1>
                        <p className="text-gray-500 font-medium">Quelques informations pour commencer à booster vos avis.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Nom du restaurant</label>
                                <div className="relative">
                                    <Store className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                                    <input
                                        required
                                        type="text"
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1d1dd7] focus:border-transparent outline-none transition-all font-medium placeholder-gray-500"
                                        placeholder="ex: Le Petit Bistro"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Adresse</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                                    <input
                                        required
                                        type="text"
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1d1dd7] focus:border-transparent outline-none transition-all font-medium placeholder-gray-500"
                                        placeholder="8 rue de la Paix, 75001 Paris"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Lien Google Business Profile</label>
                                <div className="relative">
                                    <LinkIcon className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                                    <input
                                        required
                                        type="url"
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1d1dd7] focus:border-transparent outline-none transition-all font-medium placeholder-gray-500"
                                        placeholder="https://g.page/r/your-id/review"
                                        value={googleLink}
                                        onChange={(e) => setGoogleLink(e.target.value)}
                                    />
                                </div>
                                <p className="mt-2 text-xs text-gray-400">Le lien direct vers votre page d'avis Google.</p>
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full bg-[#1d1dd7] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#1515a3] transition-all disabled:opacity-50"
                        >
                            C'est parti <ArrowRight className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
