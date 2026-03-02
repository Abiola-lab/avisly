'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, Circle, ArrowRight, Store, Gift, QrCode as QrIcon, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import Link from 'next/link'

interface WizardProps {
    restaurant: any
    campaign: any
    rewardCount: number
}

export default function InstallationWizard({ restaurant, campaign, rewardCount }: WizardProps) {
    // Steps logic
    const steps = [
        {
            id: 'profile',
            title: 'Profil Restaurant',
            description: 'Complétez vos informations de base et lien Google Business.',
            isCompleted: !!(restaurant?.name && restaurant?.google_link),
            icon: Store,
            href: '/dashboard/settings'
        },
        {
            id: 'rewards',
            title: 'Configuration de la Roue',
            description: 'Ajoutez les cadeaux que vos clients pourront gagner.',
            isCompleted: rewardCount >= 1,
            icon: Gift,
            href: '/dashboard/campaigns'
        },
        {
            id: 'print',
            title: 'Génération QR Code',
            description: 'Générez votre affiche ou vos stickers QR Code.',
            isCompleted: !!campaign,
            icon: QrIcon,
            href: '/dashboard/qr-code'
        }
    ]

    const completedCount = steps.filter(s => s.isCompleted).length
    const progress = Math.round((completedCount / steps.length) * 100)
    const isFinished = progress === 100

    useEffect(() => {
        if (isFinished) {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#1d1dd7', '#ffcc00', '#ffffff']
            })
        }
    }, [isFinished])

    // On Dashboard, we hide it IF finished, but maybe keep a "Ready" state?
    // User requested to hide it if everything is good, or at least that's common.
    if (isFinished) return null

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 mb-8 overflow-hidden relative"
        >
            <div className="absolute top-0 right-0 p-8 opacity-5">
                <Sparkles className="w-24 h-24 text-[#1d1dd7]" />
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
                        🚀 Finalisez votre installation
                        <span className="text-xs font-bold bg-[#1d1dd7] text-white px-3 py-1 rounded-full uppercase tracking-wider">
                            {progress}%
                        </span>
                    </h2>
                    <p className="text-gray-500 mt-1 font-medium italic">Plus que quelques étapes pour commencer à récolter des avis !</p>
                </div>
                <div className="w-full md:w-64 h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-100">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-gradient-to-r from-[#1d1dd7] to-[#4f46e5]"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {steps.map((step, i) => (
                    <div
                        key={step.id}
                        className={`p-6 rounded-[2rem] border-2 transition-all relative ${step.isCompleted
                                ? 'bg-green-50/50 border-green-100'
                                : 'bg-white border-gray-100 hover:border-[#1d1dd7]/30 shadow-sm'
                            }`}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-2xl ${step.isCompleted ? 'bg-green-500 text-white shadow-lg shadow-green-200' : 'bg-gray-100 text-gray-400'}`}>
                                <step.icon className="w-6 h-6" />
                            </div>
                            {step.isCompleted ? (
                                <div className="bg-green-500 rounded-full p-1">
                                    <CheckCircle2 className="w-5 h-5 text-white" />
                                </div>
                            ) : (
                                <Circle className="w-7 h-7 text-gray-200" />
                            )}
                        </div>
                        <h3 className={`font-black uppercase tracking-tight text-sm ${step.isCompleted ? 'text-green-900' : 'text-gray-900'}`}>
                            {step.title}
                        </h3>
                        <p className={`text-xs mt-2 leading-relaxed font-medium ${step.isCompleted ? 'text-green-700/70' : 'text-gray-500'}`}>
                            {step.description}
                        </p>
                        {!step.isCompleted && (
                            <Link
                                href={step.href}
                                className="mt-4 text-[#1d1dd7] text-xs font-black uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all p-2 bg-[#1d1dd7]/5 rounded-xl w-fit"
                            >
                                Configurer <ArrowRight className="w-4 h-4" />
                            </Link>
                        )}
                    </div>
                ))}
            </div>
        </motion.div>
    )
}
