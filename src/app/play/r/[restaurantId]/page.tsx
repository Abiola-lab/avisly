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
        // Fetch restaurant info for branding
        const { data: restaurant } = await supabase
            .from('restaurants')
            .select('name, logo_url, google_link, primary_color')
            .eq('id', restaurantId)
            .single();

        const brandColor = restaurant?.primary_color || '#1d1dd7';

        return (
            <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-8 text-white text-center relative overflow-hidden">
                <div className="absolute top-[-100px] left-[-100px] w-80 h-80 rounded-full blur-[120px] opacity-20" style={{ backgroundColor: brandColor }} />
                <div className="absolute bottom-[-100px] right-[-100px] w-80 h-80 rounded-full blur-[120px] opacity-10" style={{ backgroundColor: brandColor }} />

                <div className="relative z-10 space-y-10 max-w-sm">
                    {restaurant?.logo_url ? (
                        <div className="bg-white p-4 rounded-[2rem] shadow-2xl mx-auto w-fit">
                            <img src={restaurant.logo_url} alt={restaurant.name} className="h-16 mx-auto object-contain" />
                        </div>
                    ) : (
                        <h2 className="text-3xl font-black italic tracking-widest uppercase" style={{ color: brandColor }}>{restaurant?.name || 'VOTRE RESTAURANT'}</h2>
                    )}

                    <div className="space-y-4">
                        <h1 className="text-4xl font-black tracking-tighter leading-none mb-4 uppercase italic">À TRÈS BIENTÔT ! ✨</h1>
                        <p className="opacity-70 font-bold uppercase tracking-widest text-[10px] leading-relaxed">
                            Nous préparons une nouvelle expérience de jeu pour vous. Revenez nous voir très vite !
                        </p>
                    </div>

                    {restaurant?.google_link && (
                        <a
                            href={restaurant.google_link}
                            target="_blank"
                            className="block w-full bg-white py-6 rounded-[2.5rem] font-black text-lg shadow-2xl hover:scale-105 transition-all active:scale-95"
                            style={{ color: brandColor }}
                        >
                            LAISSER UN AVIS GOOGLE
                        </a>
                    )}
                </div>

                <div className="absolute bottom-8 text-[10px] font-black tracking-[0.4em] opacity-40 uppercase">
                    Powered by Avisly
                </div>
            </div>
        )
    }

    redirect(`/play/${campaign.id}`)
}
