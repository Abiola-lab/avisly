'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2, Lock } from 'lucide-react';
import { usePlan } from '@/lib/contexts/PlanContext';
import { planHasFeature } from '@/lib/plans';
import type { PlanFeature } from '@/lib/plans';

const ROUTE_FEATURE_MAP: Partial<Record<string, PlanFeature>> = {
    '/dashboard/campaigns':    'wheel',
    '/dashboard/studio-print': 'print',
    '/dashboard/validation':   'coupons',
    '/dashboard/loyalty':      'loyalty',
}

const EXEMPT_PATHS = ['/dashboard', '/dashboard/settings', '/dashboard/onboarding', '/dashboard/qr-code']

export default function SubscriptionGuard({ children }: { children: React.ReactNode }) {
    const [status, setStatus] = useState<'loading' | 'valid' | 'invalid' | 'forbidden'>('loading');
    const supabase = createClient();
    const router = useRouter();
    const pathname = usePathname();
    const plan = usePlan();

    useEffect(() => {
        if (EXEMPT_PATHS.includes(pathname)) {
            setStatus('valid');
            return;
        }

        async function checkSubscription() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push('/login'); return; }

            const { data: restaurant } = await supabase
                .from('restaurants')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (!restaurant) { router.push('/onboarding'); return; }

            const { data: sub } = await supabase
                .from('subscriptions')
                .select('status')
                .eq('restaurant_id', restaurant.id)
                .single();

            const isSubscribed = sub && (sub.status === 'active' || sub.status === 'trialing');
            if (!isSubscribed) { setStatus('invalid'); return; }

            const requiredFeature = ROUTE_FEATURE_MAP[pathname];
            if (requiredFeature && !planHasFeature(plan, requiredFeature)) {
                setStatus('forbidden');
                return;
            }

            setStatus('valid');
        }

        checkSubscription();
    }, [pathname, plan]);

    if (status === 'loading') {
        return (
            <div className="flex-1 flex flex-col items-center justify-center py-20 font-medium" style={{ color: 'var(--text-faint)' }}>
                <Loader2 className="w-6 h-6 animate-spin mb-2" />
                <span className="text-sm italic">Vérification de vos accès...</span>
            </div>
        );
    }

    if (status === 'invalid') {
        return (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-6">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'var(--accent-light)' }}>
                    <Lock className="w-7 h-7" style={{ color: 'var(--accent)' }} />
                </div>
                <div className="max-w-md space-y-2">
                    <h2 className="text-xl font-black uppercase tracking-tight" style={{ color: 'var(--text)' }}>Abonnement requis</h2>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        Votre essai est peut-être terminé ou votre paiement a échoué.
                    </p>
                </div>
                <button
                    onClick={() => router.push('/dashboard/settings')}
                    className="px-6 py-3 text-white font-bold rounded-xl text-sm transition-all hover:opacity-90"
                    style={{ background: 'var(--accent)' }}
                >
                    Voir les offres
                </button>
            </div>
        );
    }

    if (status === 'forbidden') {
        return (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-6">
                <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950/30 rounded-2xl flex items-center justify-center">
                    <Lock className="w-7 h-7 text-amber-500" />
                </div>
                <div className="max-w-md space-y-2">
                    <h2 className="text-xl font-black uppercase tracking-tight" style={{ color: 'var(--text)' }}>Non inclus dans votre offre</h2>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        Cette fonctionnalité n'est pas disponible dans votre abonnement actuel.
                    </p>
                </div>
                <button
                    onClick={() => router.push('/dashboard/settings')}
                    className="px-6 py-3 bg-amber-500 text-white font-bold rounded-xl text-sm hover:bg-amber-600 transition-all"
                >
                    Changer d'offre
                </button>
            </div>
        );
    }

    return <>{children}</>;
}
