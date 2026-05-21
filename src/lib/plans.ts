export type PlanType = 'roue' | 'fidelite' | 'full_pro'
export type PlanFeature = 'wheel' | 'loyalty' | 'coupons' | 'print' | 'qrcode'

export const PLAN_FEATURES: Record<PlanType, PlanFeature[]> = {
    roue:      ['wheel', 'coupons', 'print', 'qrcode'],
    fidelite:  ['loyalty', 'qrcode'],
    full_pro:  ['wheel', 'coupons', 'print', 'qrcode', 'loyalty'],
}

export const PLAN_LABELS: Record<PlanType, string> = {
    roue:     'Roue',
    fidelite: 'Fidélité',
    full_pro: 'Full Pro',
}

export const PLAN_PRICES: Record<PlanType, { monthly: number; annual: number }> = {
    roue:     { monthly: 30, annual: 288 },
    fidelite: { monthly: 40, annual: 384 },
    full_pro: { monthly: 60, annual: 576 },
}

export function planHasFeature(plan: PlanType | null | undefined, feature: PlanFeature): boolean {
    if (!plan) return true // default open during dev / trial
    return PLAN_FEATURES[plan]?.includes(feature) ?? false
}

export function isValidPlan(value: string | null | undefined): value is PlanType {
    return value === 'roue' || value === 'fidelite' || value === 'full_pro'
}
