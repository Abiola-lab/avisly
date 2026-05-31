'use client'

import { createContext, useContext } from 'react'
import type { PlanType, PlanFeature } from '@/lib/plans'
import { planHasFeature } from '@/lib/plans'

interface PlanContextValue {
    plan: PlanType | null
    trialEndsAt: Date | null
}

const PlanContext = createContext<PlanContextValue>({ plan: null, trialEndsAt: null })

export function PlanProvider({
    plan,
    trialEndsAt,
    children,
}: {
    plan: PlanType | null
    trialEndsAt: Date | null
    children: React.ReactNode
}) {
    return <PlanContext.Provider value={{ plan, trialEndsAt }}>{children}</PlanContext.Provider>
}

export function usePlan(): PlanType | null {
    return useContext(PlanContext).plan
}

export function useTrialEndsAt(): Date | null {
    return useContext(PlanContext).trialEndsAt
}

export function usePlanFeature(feature: PlanFeature): boolean {
    const plan = usePlan()
    return planHasFeature(plan, feature)
}
