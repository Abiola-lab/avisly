import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

        // --- PROTECTION ADMIN ---
        const debugEnabled = process.env.DEBUG_TOOLS_ENABLED === 'true';
        const adminEmail = process.env.ADMIN_EMAIL;

        if (!debugEnabled || user.email !== adminEmail) {
            console.warn(`🔒 Tentative d'accès non autorisée au Simulate Expired par ${user.email}`);
            return NextResponse.json({ error: 'Accès interdit' }, { status: 403 });
        }
        // ------------------------

        const { data: restaurant } = await supabase
            .from('restaurants')
            .select('id')
            .eq('user_id', user.id)
            .single();

        if (!restaurant) return NextResponse.json({ error: 'Restaurant non trouvé' }, { status: 404 });

        // Simulate trial end by updating the status to 'canceled' in Supabase
        // (This only affects the UI/Guard, not real Stripe)
        const { error } = await supabase
            .from('subscriptions')
            .update({
                status: 'canceled',
                trial_end: new Date(Date.now() - 86400000).toISOString() // 1 day ago
            })
            .eq('restaurant_id', restaurant.id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
