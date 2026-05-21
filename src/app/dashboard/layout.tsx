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
        .single()

    if (!restaurant) {
        redirect('/onboarding')
    }

    const plan = isValidPlan(restaurant.subscription_plan) ? restaurant.subscription_plan : null

    return (
        <ThemeProvider>
            <PlanProvider plan={plan}>
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
