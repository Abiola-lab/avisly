'use client'

import { useEffect } from 'react'
import { CheckCircle2, ArrowRight, Store, Gift, QrCode as QrIcon, CreditCard } from 'lucide-react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import Link from 'next/link'

interface WizardProps {
    restaurant: any
    campaign: any
    rewardCount: number
    hasLoyaltyProgram?: boolean
    hasWheel?: boolean
}

export default function InstallationWizard({ restaurant, campaign, rewardCount, hasLoyaltyProgram = false, hasWheel = true }: WizardProps) {
    const steps = [
        {
            id: 'profile',
            title: 'Profil restaurant',
            description: 'Informations de base et lien Google Business',
            isCompleted: !!(restaurant?.name && restaurant?.google_link),
            icon: Store,
            href: '/dashboard/settings'
        },
        hasWheel
            ? {
                id: 'rewards',
                title: 'Configuration de la roue',
                description: 'Ajoutez les gains que vos clients pourront remporter',
                isCompleted: rewardCount >= 1,
                icon: Gift,
                href: '/dashboard/campaigns'
            }
            : {
                id: 'loyalty',
                title: 'Programme de fidélité',
                description: 'Seuil de points et récompense à configurer',
                isCompleted: hasLoyaltyProgram,
                icon: CreditCard,
                href: '/dashboard/loyalty'
            },
        {
            id: 'print',
            title: 'QR Code prêt',
            description: 'Téléchargez et affichez votre QR code en salle',
            isCompleted: hasWheel ? !!campaign : !!(restaurant?.name),
            icon: QrIcon,
            href: '/dashboard/qr-code'
        }
    ]

    const completedCount = steps.filter(s => s.isCompleted).length
    const progress = Math.round((completedCount / steps.length) * 100)
    const isFinished = progress === 100

    useEffect(() => {
        if (isFinished) {
            confetti({ particleCount: 120, spread: 60, origin: { y: 0.6 }, colors: ['#1d1dd7', '#ffcc00', '#ffffff'] })
        }
    }, [isFinished])

    if (isFinished) return null

    return (
        <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border p-5"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
        >
            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Finalisez votre installation</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {completedCount}/{steps.length} étapes complétées
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-28 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className="h-full rounded-full"
                            style={{ background: 'var(--accent)' }}
                        />
                    </div>
                    <span className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>{progress}%</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {steps.map((step) => (
                    <div
                        key={step.id}
                        className="rounded-lg border p-4 flex flex-col gap-3"
                        style={{
                            background: step.isCompleted ? 'transparent' : 'var(--bg-subtle)',
                            borderColor: step.isCompleted ? 'var(--border)' : 'var(--border)',
                            opacity: step.isCompleted ? 0.7 : 1,
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{
                                    background: step.isCompleted ? 'rgba(34,197,94,0.12)' : 'var(--accent-light)',
                                    color: step.isCompleted ? '#22c55e' : 'var(--accent)',
                                }}>
                                <step.icon className="w-4 h-4" />
                            </div>
                            {step.isCompleted && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                        </div>
                        <div>
                            <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{step.title}</p>
                            <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                                {step.description}
                            </p>
                        </div>
                        {!step.isCompleted && (
                            <Link href={step.href}
                                className="text-[11px] font-semibold flex items-center gap-1 mt-auto"
                                style={{ color: 'var(--accent)' }}>
                                Configurer <ArrowRight className="w-3 h-3" />
                            </Link>
                        )}
                    </div>
                ))}
            </div>
        </motion.div>
    )
}
