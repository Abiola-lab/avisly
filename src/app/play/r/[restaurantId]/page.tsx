import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function RestaurantRedirectPage({ params }: { params: { restaurantId: string } }) {
    const supabase = await createClient()
    const { restaurantId } = await params

    const { data: campaign } = await supabase
        .from('campaigns')
        .select('id')
        .eq('restaurant_id', restaurantId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

    if (!campaign) {
        return (
            <div className="min-h-screen bg-[#1d1dd7] flex items-center justify-center p-6 text-white text-center">
                <div className="space-y-4">
                    <h1 className="text-2xl font-black">BIENVENUE</h1>
                    <p className="opacity-70">Désolé, aucune offre n'est disponible pour le moment dans cet établissement.</p>
                </div>
            </div>
        )
    }

    redirect(`/play/${campaign.id}`)
}
