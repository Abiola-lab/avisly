'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, TrendingUp } from 'lucide-react'

export default function SocialProof({ campaignId }: { campaignId: string }) {
    const [winnersToday, setWinnersToday] = useState(0)
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        // En prod, on pourrait faire un vrai fetch.
        // On va simuler un nombre réaliste basé sur une logique déterministe par restaurant
        // pour que ça ne change pas à chaque refresh (pour la crédibilité)
        const deterministicValue = (parseInt(campaignId.substring(0, 4), 16) % 15) + 3
        setWinnersToday(deterministicValue)

        const timer = setTimeout(() => setVisible(true), 2000)
        return () => clearTimeout(timer)
    }, [campaignId])

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 50, opacity: 0 }}
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm pointer-events-none"
                >
                    <div className="bg-white/10 backdrop-blur-2xl border border-white/20 p-4 rounded-[2rem] shadow-2xl flex items-center gap-4">
                        <div className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(250,204,21,0.5)]">
                            <Sparkles className="w-6 h-6 text-yellow-900 fill-yellow-900" />
                        </div>
                        <div className="flex-1">
                            <p className="text-white text-sm font-black italic tracking-tight leading-tight">
                                {winnersToday} cadeaux déjà gagnés aujourd'hui !
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">
                                    Dernière victoire il y a 8 min
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
