'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
    LayoutDashboard,
    Settings,
    QrCode,
    TicketCheck,
    Trophy,
    LogOut,
    Printer,
    Menu,
    X,
    Star
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

const menuItems = [
    { name: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Campagnes & Roue', href: '/dashboard/campaigns', icon: Trophy },
    { name: 'QR Code', href: '/dashboard/qr-code', icon: QrCode },
    { name: 'Studio Print', href: '/dashboard/studio-print', icon: Printer },
    { name: 'Validation Coupons', href: '/dashboard/validation', icon: TicketCheck },
    { name: 'Paramètres', href: '/dashboard/settings', icon: Settings },
]

export default function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()
    const [isOpen, setIsOpen] = useState(false)

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    const navigation = (
        <>
            <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center relative shadow-sm border border-gray-100 group">
                        <img src="/logo_avisly.svg" alt="Avisly" className="w-[80%] h-[80%] object-contain group-hover:scale-110 group-hover:rotate-3 transition-all duration-500" />
                    </div>
                    <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Avisly</h1>
                </div>
                <button onClick={() => setIsOpen(false)} className="lg:hidden p-2 text-gray-500">
                    <X className="w-6 h-6" />
                </button>
            </div>

            <nav className="flex-1 px-4 space-y-1 mt-4">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${isActive
                                ? 'bg-[#f0f0ff] text-[#1d1dd7]'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 ${isActive ? 'text-[#1d1dd7]' : 'text-gray-400'}`} />
                            {item.name}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-gray-100">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-gray-600 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all group"
                >
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-100 group-hover:border-red-100 transition-colors">
                        <img src="/logo_avisly.svg" alt="Avisly" className="w-5 h-5 object-contain transition-all" />
                    </div>
                    Déconnexion
                </button>
            </div>
        </>
    )

    return (
        <>
            {/* Header Mobile */}
            <header className="lg:hidden fixed top-0 w-full z-40 bg-white border-b border-gray-100 h-20 flex items-center justify-between px-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center relative shadow-sm border border-gray-100">
                        <img src="/logo_avisly.svg" alt="Avisly" className="w-[80%] h-[80%] object-contain" />
                    </div>
                    <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Avisly</h1>
                </div>
                <button onClick={() => setIsOpen(true)} className="p-2 text-gray-500">
                    <Menu className="w-6 h-6" />
                </button>
            </header>

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 z-50">
                {navigation}
            </aside>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-72 bg-white z-50 lg:hidden flex flex-col"
                        >
                            {navigation}
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}
