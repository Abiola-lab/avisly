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
        async function fetchColor() {
            if (!campaignId) return
            const { data } = await supabase
                .from('campaigns')
                .select('restaurants(primary_color)')
                .eq('id', campaignId)
                .single()

            const resData = data as any
            if (resData?.restaurants?.primary_color) {
                setPrimaryColor(resData.restaurants.primary_color)
            }
        }
        fetchColor()
    }, [campaignId])

    return (
        <div
            className="min-h-[100dvh] text-white selection:bg-white/20 transition-colors duration-500"
            style={{ backgroundColor: primaryColor }}
        >
            <div className="flex-1 w-full max-w-md mx-auto relative flex flex-col p-6 min-h-[100dvh]">
                {children}
            </div>
            {/* CSS Variable for children to use */}
            <style jsx global>{`
                :root {
                    --primary-color: ${primaryColor};
                }
            `}</style>
        </div>
    )
}
