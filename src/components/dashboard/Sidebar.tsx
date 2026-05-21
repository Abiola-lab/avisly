'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
    LayoutDashboard,
    Settings,
    QrCode,
    TicketCheck,
    LogOut,
    Printer,
    Menu,
    X,
    Star,
    CreditCard,
    Trophy,
    ChevronLeft,
    ChevronRight,
    Sun,
    Moon,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigationGuard } from '@/lib/contexts/NavigationGuardContext'
import { usePlanFeature } from '@/lib/contexts/PlanContext'
import { useSidebar } from '@/lib/contexts/SidebarContext'
import { useTheme } from '@/lib/contexts/ThemeContext'
import type { PlanFeature } from '@/lib/plans'

type MenuItem = {
    name: string
    href: string
    icon: React.ElementType
    feature?: PlanFeature
}

const menuItems: MenuItem[] = [
    { name: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Campagnes & Roue', href: '/dashboard/campaigns', icon: Trophy, feature: 'wheel' },
    { name: 'QR Code', href: '/dashboard/qr-code', icon: QrCode },
    { name: 'Studio Print', href: '/dashboard/studio-print', icon: Printer, feature: 'print' },
    { name: 'Validation Coupons', href: '/dashboard/validation', icon: TicketCheck, feature: 'coupons' },
    { name: 'Carte de Fidélité', href: '/dashboard/loyalty', icon: CreditCard, feature: 'loyalty' },
]

function FilteredMenu({
    items,
    pathname,
    onNav,
    collapsed,
}: {
    items: MenuItem[]
    pathname: string
    onNav: (e: React.MouseEvent, href: string) => void
    collapsed: boolean
}) {
    const hasWheel = usePlanFeature('wheel')
    const hasLoyalty = usePlanFeature('loyalty')
    const hasCoupons = usePlanFeature('coupons')
    const hasPrint = usePlanFeature('print')

    const featureMap: Record<PlanFeature, boolean> = {
        wheel: hasWheel,
        loyalty: hasLoyalty,
        coupons: hasCoupons,
        print: hasPrint,
        qrcode: true,
    }

    const visible = items.filter(item => !item.feature || featureMap[item.feature])

    return (
        <>
            {visible.map((item) => {
                const isActive = pathname === item.href
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={(e) => onNav(e, item.href)}
                        title={collapsed ? item.name : undefined}
                        className={`flex items-center gap-3 rounded-xl transition-all duration-150 group ${
                            collapsed ? 'px-0 py-3 justify-center' : 'px-3 py-2.5'
                        } ${
                            isActive
                                ? 'text-[var(--accent)]'
                                : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                        }`}
                    >
                        <div className={`flex items-center justify-center rounded-lg transition-all flex-shrink-0 ${
                            collapsed ? 'w-9 h-9' : 'w-7 h-7'
                        } ${
                            isActive
                                ? 'bg-[var(--accent-light)]'
                                : 'group-hover:bg-[var(--border-subtle)]'
                        }`}>
                            <item.icon className={`${collapsed ? 'w-4 h-4' : 'w-4 h-4'} ${
                                isActive ? 'text-[var(--accent)]' : ''
                            }`} />
                        </div>
                        {!collapsed && (
                            <span className="text-sm font-medium leading-none">{item.name}</span>
                        )}
                    </Link>
                )
            })}
        </>
    )
}

export default function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()
    const { isDirty, setIsDirty } = useNavigationGuard()
    const { isCollapsed, toggle } = useSidebar()
    const { theme, toggleTheme } = useTheme()
    const [isMobileOpen, setIsMobileOpen] = useState(false)

    const handleNav = (e: React.MouseEvent, href: string) => {
        if (isDirty) {
            e.preventDefault()
            const confirmed = confirm('Vous avez des modifications non enregistrées. Quitter quand même ?')
            if (confirmed) {
                setIsDirty(false)
                router.push(href)
                setIsMobileOpen(false)
            }
            return
        }
        setIsMobileOpen(false)
    }

    const handleLogout = async () => {
        if (isDirty && !confirm('Modifications non enregistrées ! Quitter quand même ?')) return
        setIsDirty(false)
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    const desktopSidebar = (
        <aside
            className={`hidden lg:flex flex-col h-screen fixed left-0 top-0 z-50 border-r transition-[width] duration-300 ease-in-out ${
                isCollapsed ? 'w-16' : 'w-64'
            }`}
            style={{
                background: 'var(--bg-surface)',
                borderColor: 'var(--border)',
            }}
        >
            {/* Header */}
            <div className={`flex items-center h-16 flex-shrink-0 border-b ${
                isCollapsed ? 'justify-center px-0' : 'justify-between px-4'
            }`} style={{ borderColor: 'var(--border)' }}>
                {!isCollapsed && (
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0"
                            style={{ background: 'var(--accent-light)' }}>
                            <img src="/logo_avisly.svg" alt="Avisly" className="w-4 h-4 object-contain" />
                        </div>
                        <span className="text-sm font-bold tracking-tight" style={{ color: 'var(--text)' }}>
                            Avisly
                        </span>
                    </div>
                )}
                <button
                    onClick={toggle}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
                    style={{ color: 'var(--text-faint)' }}
                    title={isCollapsed ? 'Développer' : 'Réduire'}
                >
                    {isCollapsed
                        ? <ChevronRight className="w-4 h-4" />
                        : <ChevronLeft className="w-4 h-4" />
                    }
                </button>
            </div>

            {/* Nav */}
            <nav className={`flex-1 py-4 space-y-0.5 overflow-y-auto ${isCollapsed ? 'px-2' : 'px-3'}`}>
                <FilteredMenu
                    items={menuItems}
                    pathname={pathname}
                    onNav={handleNav}
                    collapsed={isCollapsed}
                />
            </nav>

            {/* Footer */}
            <div className={`py-3 border-t flex flex-col gap-1 ${isCollapsed ? 'px-2' : 'px-3'}`}
                style={{ borderColor: 'var(--border)' }}>
                {/* Theme toggle */}
                <button
                    onClick={toggleTheme}
                    title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
                    className={`flex items-center gap-3 rounded-xl transition-all duration-150 group ${
                        isCollapsed ? 'px-0 py-3 justify-center' : 'px-3 py-2.5'
                    }`}
                    style={{ color: 'var(--text-muted)' }}
                >
                    <div className={`flex items-center justify-center rounded-lg transition-all flex-shrink-0 group-hover:bg-[var(--border-subtle)] ${
                        isCollapsed ? 'w-9 h-9' : 'w-7 h-7'
                    }`}>
                        {theme === 'dark'
                            ? <Sun className="w-4 h-4" />
                            : <Moon className="w-4 h-4" />
                        }
                    </div>
                    {!isCollapsed && (
                        <span className="text-sm font-medium">
                            {theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
                        </span>
                    )}
                </button>

                {/* Settings */}
                <Link
                    href="/dashboard/settings"
                    onClick={(e) => handleNav(e, '/dashboard/settings')}
                    title={isCollapsed ? 'Paramètres' : undefined}
                    className={`flex items-center gap-3 rounded-xl transition-all duration-150 group ${
                        isCollapsed ? 'px-0 py-3 justify-center' : 'px-3 py-2.5'
                    }`}
                    style={{ color: pathname === '/dashboard/settings' ? 'var(--accent)' : 'var(--text-muted)' }}
                >
                    <div className={`flex items-center justify-center rounded-lg transition-all flex-shrink-0 ${
                        isCollapsed ? 'w-9 h-9' : 'w-7 h-7'
                    } ${
                        pathname === '/dashboard/settings'
                            ? 'bg-[var(--accent-light)]'
                            : 'group-hover:bg-[var(--border-subtle)]'
                    }`}>
                        <Settings className="w-4 h-4" />
                    </div>
                    {!isCollapsed && (
                        <span className="text-sm font-medium">Paramètres</span>
                    )}
                </Link>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    title={isCollapsed ? 'Déconnexion' : undefined}
                    className={`flex items-center gap-3 rounded-xl transition-all duration-150 group ${
                        isCollapsed ? 'px-0 py-3 justify-center' : 'px-3 py-2.5'
                    }`}
                    style={{ color: 'var(--text-muted)' }}
                >
                    <div className={`flex items-center justify-center rounded-lg transition-all flex-shrink-0 group-hover:bg-red-50 dark:group-hover:bg-red-950/30 ${
                        isCollapsed ? 'w-9 h-9' : 'w-7 h-7'
                    }`}>
                        <LogOut className="w-4 h-4 group-hover:text-red-500 transition-colors" />
                    </div>
                    {!isCollapsed && (
                        <span className="text-sm font-medium group-hover:text-red-500 transition-colors">
                            Déconnexion
                        </span>
                    )}
                </button>
            </div>
        </aside>
    )

    return (
        <>
            {desktopSidebar}

            {/* Mobile header */}
            <header className="lg:hidden fixed top-0 w-full z-40 h-14 flex items-center justify-between px-4 border-b"
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center overflow-hidden"
                        style={{ background: 'var(--accent-light)' }}>
                        <img src="/logo_avisly.svg" alt="Avisly" className="w-4 h-4 object-contain" />
                    </div>
                    <span className="text-sm font-bold tracking-tight" style={{ color: 'var(--text)' }}>Avisly</span>
                </div>
                <button onClick={() => setIsMobileOpen(true)} style={{ color: 'var(--text-muted)' }}>
                    <Menu className="w-5 h-5" />
                </button>
            </header>

            {/* Mobile overlay */}
            <AnimatePresence>
                {isMobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileOpen(false)}
                            className="fixed inset-0 bg-black/40 z-50 lg:hidden"
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                            className="fixed inset-y-0 left-0 w-72 z-50 lg:hidden flex flex-col border-r"
                            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
                        >
                            <div className="flex items-center justify-between h-14 px-4 border-b flex-shrink-0"
                                style={{ borderColor: 'var(--border)' }}>
                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-lg flex items-center justify-center overflow-hidden"
                                        style={{ background: 'var(--accent-light)' }}>
                                        <img src="/logo_avisly.svg" alt="Avisly" className="w-4 h-4 object-contain" />
                                    </div>
                                    <span className="text-sm font-bold tracking-tight" style={{ color: 'var(--text)' }}>Avisly</span>
                                </div>
                                <button onClick={() => setIsMobileOpen(false)} style={{ color: 'var(--text-muted)' }}>
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
                                <FilteredMenu
                                    items={menuItems}
                                    pathname={pathname}
                                    onNav={handleNav}
                                    collapsed={false}
                                />
                            </nav>
                            <div className="py-3 px-3 border-t flex flex-col gap-1"
                                style={{ borderColor: 'var(--border)' }}>
                                <button
                                    onClick={toggleTheme}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group"
                                    style={{ color: 'var(--text-muted)' }}
                                >
                                    <div className="w-7 h-7 flex items-center justify-center rounded-lg group-hover:bg-[var(--border-subtle)]">
                                        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                                    </div>
                                    <span className="text-sm font-medium">
                                        {theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
                                    </span>
                                </button>
                                <Link
                                    href="/dashboard/settings"
                                    onClick={(e) => { handleNav(e, '/dashboard/settings'); setIsMobileOpen(false) }}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group"
                                    style={{ color: pathname === '/dashboard/settings' ? 'var(--accent)' : 'var(--text-muted)' }}
                                >
                                    <div className={`w-7 h-7 flex items-center justify-center rounded-lg group-hover:bg-[var(--border-subtle)] ${pathname === '/dashboard/settings' ? 'bg-[var(--accent-light)]' : ''}`}>
                                        <Settings className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium">Paramètres</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group"
                                    style={{ color: 'var(--text-muted)' }}
                                >
                                    <div className="w-7 h-7 flex items-center justify-center rounded-lg group-hover:bg-red-50 dark:group-hover:bg-red-950/30">
                                        <LogOut className="w-4 h-4 group-hover:text-red-500 transition-colors" />
                                    </div>
                                    <span className="text-sm font-medium group-hover:text-red-500 transition-colors">
                                        Déconnexion
                                    </span>
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}
