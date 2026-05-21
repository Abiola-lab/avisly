'use client'

import { useSidebar } from '@/lib/contexts/SidebarContext'

export default function SidebarAwareMain({ children }: { children: React.ReactNode }) {
    const { isCollapsed } = useSidebar()
    return (
        <main className={`flex-1 p-4 md:p-8 pt-24 lg:pt-8 w-full transition-[margin] duration-300 ease-in-out ${
            isCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        }`}>
            <div className="max-w-6xl mx-auto">
                {children}
            </div>
        </main>
    )
}
