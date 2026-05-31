import Sidebar from '@/components/dashboard/Sidebar'
import SidebarAwareMain from '@/components/dashboard/SidebarAwareMain'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SubscriptionGuard from '@/components/dashboard/SubscriptionGuard'
import { NavigationGuardProvider } from '@/lib/contexts/NavigationGuardContext'
import { PlanProvider } from '@/lib/contexts/PlanContext'
import { SidebarProvider } from '@/lib/contexts/SidebarContext'
import { isValidPlan } from '@/lib/plans'
import { ThemeProvider } from '@/lib/contexts/ThemeContext'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: restaurant } = await supabase
        .from('restaurants')
        .select('id, subscription_plan')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

    if (!restaurant) {
        redirect('/onboarding')
    }

    const plan = isValidPlan(restaurant.subscription_plan) ? restaurant.subscription_plan : null

    // Fetch trial_ends_at separately so a missing/uncached column never blocks the layout
    const { data: trialData } = await supabase
        .from('restaurants')
        .select('trial_ends_at')
        .eq('user_id', user.id)
        .single()

    const trialEndsAt = trialData?.trial_ends_at ? new Date(trialData.trial_ends_at) : null

    return (
        <ThemeProvider>
            <PlanProvider plan={plan} trialEndsAt={trialEndsAt}>
                <NavigationGuardProvider>
                    <SidebarProvider>
                        <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
                            <Sidebar />
                            <SidebarAwareMain>
                                <SubscriptionGuard>
                                    {children}
                                </SubscriptionGuard>
                            </SidebarAwareMain>
                        </div>
                    </SidebarProvider>
                </NavigationGuardProvider>
            </PlanProvider>
        </ThemeProvider>
    )
}
