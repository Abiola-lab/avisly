'use client'

import { createContext, useContext, useEffect, useState } from 'react'

const SidebarContext = createContext<{
    isCollapsed: boolean
    toggle: () => void
}>({ isCollapsed: false, toggle: () => {} })

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false)

    useEffect(() => {
        const saved = localStorage.getItem('avisly-sidebar-collapsed')
        if (saved === 'true') setIsCollapsed(true)
    }, [])

    const toggle = () => {
        setIsCollapsed(prev => {
            const next = !prev
            localStorage.setItem('avisly-sidebar-collapsed', String(next))
            return next
        })
    }

    return (
        <SidebarContext.Provider value={{ isCollapsed, toggle }}>
            {children}
        </SidebarContext.Provider>
    )
}

export const useSidebar = () => useContext(SidebarContext)
