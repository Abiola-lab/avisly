'use client'
import { createContext, useContext, useState, ReactNode } from 'react'

interface NavigationGuardContextType {
    isDirty: boolean
    setIsDirty: (dirty: boolean) => void
}

const NavigationGuardContext = createContext<NavigationGuardContextType | undefined>(undefined)

export function NavigationGuardProvider({ children }: { children: ReactNode }) {
    const [isDirty, setIsDirty] = useState(false)
    return (
        <NavigationGuardContext.Provider value={{ isDirty, setIsDirty }}>
            {children}
        </NavigationGuardContext.Provider>
    )
}

export function useNavigationGuard() {
    const context = useContext(NavigationGuardContext)
    if (context === undefined) {
        // Return a dummy version if provider is missing to avoid crashing
        return { isDirty: false, setIsDirty: () => { } }
    }
    return context
}
