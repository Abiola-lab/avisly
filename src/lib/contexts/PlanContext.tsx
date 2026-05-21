'use client'

import { createContext, useContext } from 'react'
import type { PlanType, PlanFeature } from '@/lib/plans'
import { planHasFeature } from '@/lib/plans'

const PlanContext = createContext<PlanType | null>(null)

export function PlanProvider({ plan, children }: { plan: PlanType | null; children: React.ReactNode }) {
    return <PlanContext.Provider value={plan}>{children}</PlanContext.Provider>
}

export function usePlan() {
    return useContext(PlanContext)
}

export function usePlanFeature(feature: PlanFeature): boolean {
    const plan = usePlan()
    return planHasFeature(plan, feature)
}
