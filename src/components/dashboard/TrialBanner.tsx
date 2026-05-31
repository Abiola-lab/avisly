'use client'

import { useState } from 'react'
import { Clock, ArrowRight, X } from 'lucide-react'
import { usePlan, useTrialEndsAt } from '@/lib/contexts/PlanContext'

export default function TrialBanner() {
    const plan = usePlan()
    const trialEndsAt = useTrialEndsAt()
    const [dismissed, setDismissed] = useState(false)

    if (plan !== null || !trialEndsAt || dismissed) return null

    const msLeft = trialEndsAt.getTime() - Date.now()
    const daysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)))

    if (daysLeft === 0) return null // Guard handles the blocked state

    const isUrgent = daysLeft <= 2

    return (
        <div className={`rounded-xl border px-4 py-3 flex items-center justify-between gap-4 mb-6 ${
            isUrgent
                ? 'border-orange-500/30 bg-orange-500/5'
                : ''
        }`} style={!isUrgent ? {
            borderColor: 'var(--border)',
            background: 'var(--bg-surface)',
        } : {}}>
            <div className="flex items-center gap-3 min-w-0">
                <Clock
                    className={`w-4 h-4 flex-shrink-0 ${isUrgent ? 'text-orange-500' : ''}`}
                    style={!isUrgent ? { color: 'var(--accent)' } : {}}
                />
                <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>
                    {isUrgent
                        ? `Votre essai se termine dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''} — passez à un plan pour continuer.`
                        : `Essai gratuit en cours — il vous reste ${daysLeft} jour${daysLeft > 1 ? 's' : ''}.`
                    }
                </p>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
                <a
                    href="/dashboard/settings#plans"
                    className={`text-sm font-semibold flex items-center gap-1 whitespace-nowrap ${
                        isUrgent ? 'text-orange-500 hover:text-orange-600' : ''
                    }`}
                    style={!isUrgent ? { color: 'var(--accent)' } : {}}
                >
                    Choisir un plan <ArrowRight className="w-3.5 h-3.5" />
                </a>
                {!isUrgent && (
                    <button
                        onClick={() => setDismissed(true)}
                        className="p-1 rounded-md transition-colors"
                        style={{ color: 'var(--text-faint)' }}
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>
        </div>
    )
}
