'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Settings,
    QrCode,
    TicketCheck,
    Trophy,
    LogOut,
    Printer,
    Star
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

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

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    return (
        <div className="flex flex-col w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0">
            <div className="p-6 flex items-center gap-2">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center relative shadow-sm border border-gray-100 group">
                    <img src="/logo_avisly.svg" alt="Avisly" className="w-[80%] h-[80%] object-contain group-hover:scale-110 group-hover:rotate-3 transition-all duration-500" />
                </div>
                <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Avisly</h1>
            </div>

            <nav className="flex-1 px-4 space-y-1 mt-4">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
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
        </div>
    )
}
