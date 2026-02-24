'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2, Lock } from 'lucide-react';

export default function SubscriptionGuard({ children }: { children: React.ReactNode }) {
    const [status, setStatus] = useState<'loading' | 'valid' | 'invalid'>('loading');
    const supabase = createClient();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Exempt settings and onboarding from gating
        if (pathname === '/dashboard/settings' || pathname === '/dashboard/onboarding' || pathname === '/dashboard') {
            setStatus('valid');
            return;
        }

        async function checkSubscription() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            const { data: restaurant } = await supabase
                .from('restaurants')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (!restaurant) {
                router.push('/onboarding');
                return;
            }

            const { data: sub } = await supabase
                .from('subscriptions')
                .select('status, trial_end, current_period_end')
                .eq('restaurant_id', restaurant.id)
                .single();

            // Logic: 
            // - Active or Trialing is valid
            // - If status is trialing but trial_end is past -> Check if they have a real current_period_end
            // Actually Stripe status 'trialing' means it's still in trial. 
            // If the trial ends and they don't have a card, it becomes 'canceled' or 'past_due'.

            const isValid = sub && (sub.status === 'active' || sub.status === 'trialing');

            if (!isValid) {
                setStatus('invalid');
            } else {
                setStatus('valid');
            }
        }

        checkSubscription();
    }, [pathname]);

    if (status === 'loading') {
        return (
            <div className="flex-1 flex flex-col items-center justify-center py-20 italic text-gray-400 font-medium">
                <Loader2 className="w-8 h-8 animate-spin mb-2" /> Vérification de vos accès...
            </div>
        );
    }

    if (status === 'invalid') {
        return (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-6">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center">
                    <Lock className="w-10 h-10 text-indigo-600" />
                </div>
                <div className="max-w-md space-y-2">
                    <h2 className="text-2xl font-black text-gray-900 uppercase italic">Espace Premium</h2>
                    <p className="text-gray-500 font-medium">
                        Cette fonctionnalité nécessite un abonnement Pro actif. Votre essai est peut-être terminé ou votre paiement a échoué.
                    </p>
                </div>
                <button
                    onClick={() => router.push('/dashboard/settings')}
                    className="px-8 py-4 bg-[#1d1dd7] text-white font-black rounded-2xl hover:bg-[#1515a3] transition-all shadow-xl uppercase tracking-widest text-sm"
                >
                    VOIR LES OFFRES
                </button>
            </div>
        );
    }

    return <>{children}</>;
}
