'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function CampaignLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { campaignId } = useParams()
    const [primaryColor, setPrimaryColor] = useState('#1d1dd7')
    const supabase = createClient()

    useEffect(() => {
        async function fetchColors() {
            if (!campaignId) return
            const { data } = await supabase
                .from('campaigns')
                .select('color_primary, restaurants(primary_color)')
                .eq('id', campaignId)
                .single()

            const resData = data as any
            const color = resData?.restaurants?.primary_color || resData?.color_primary || '#1d1dd7'
            setPrimaryColor(color)
        }
        fetchColors()
    }, [campaignId])

    return (
        <div
            className="min-h-[100dvh] text-white selection:bg-white/20 transition-colors duration-500 overflow-x-hidden"
            style={{
                backgroundColor: '#0a0a0a',
                backgroundImage: `radial-gradient(circle at 0% 0%, ${primaryColor}15 0%, transparent 50%), radial-gradient(circle at 100% 100%, ${primaryColor}10 0%, transparent 50%)`
            }}
        >
            <div className="flex-1 w-full max-w-md mx-auto relative flex flex-col p-6 min-h-[100dvh]">
                {children}
            </div>
            <style jsx global>{`
                :root {
                    --primary-color: ${primaryColor};
                }
                body {
                    background-color: #0a0a0a;
                }
            `}</style>
        </div>
    )
}
