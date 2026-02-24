'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { QRCodeSVG } from 'qrcode.react'
import { Download, Copy, ExternalLink, QrCode as QrIcon } from 'lucide-react'

export default function QRCodePage() {
    const [campaign, setCampaign] = useState<any>(null)
    const [restaurant, setRestaurant] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [copied, setCopied] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        async function fetchCampaign() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: restaurantData } = await supabase
                .from('restaurants')
                .select('id')
                .eq('user_id', user.id)
                .single()

            if (restaurantData) {
                setRestaurant(restaurantData)
                const { data: campaigns } = await supabase
                    .from('campaigns')
                    .select('*')
                    .eq('restaurant_id', restaurantData.id)
                    .eq('is_active', true)
                    .order('created_at', { ascending: false })
                    .limit(1)

                if (campaigns && campaigns.length > 0) {
                    setCampaign(campaigns[0])
                }
            }
            setLoading(false)
        }

        fetchCampaign()
    }, [])

    const playUrl = restaurant
        ? `${window.location.origin}/play/r/${restaurant.id}`
        : ''

    const copyToClipboard = () => {
        navigator.clipboard.writeText(playUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const downloadQRCode = () => {
        const svg = document.getElementById('campaign-qr')
        if (!svg) return
        const svgData = new XMLSerializer().serializeToString(svg)
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const img = new Image()
        img.onload = () => {
            canvas.width = img.width
            canvas.height = img.height
            ctx?.drawImage(img, 0, 0)
            const pngFile = canvas.toDataURL('image/png')
            const downloadLink = document.createElement('a')
            downloadLink.download = `qr-code-${campaign.name}.png`
            downloadLink.href = pngFile
            downloadLink.click()
        }
        img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
    }

    if (loading) return <div className="p-8 text-center text-gray-500">Chargement...</div>

    if (!campaign) {
        return (
            <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-gray-300">
                <QrIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Aucune campagne active</h2>
                <p className="text-gray-500">Créez une campagne pour générer votre QR code.</p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Votre QR Code</h1>
                <p className="text-gray-500">Téléchargez et imprimez ce code pour vos tables.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                    <div className="p-4 bg-gray-50 rounded-2xl mb-8">
                        <QRCodeSVG
                            id="campaign-qr"
                            value={playUrl}
                            size={256}
                            level="H"
                            includeMargin={true}
                        />
                    </div>
                    <button
                        onClick={downloadQRCode}
                        className="flex items-center gap-2 bg-[#1d1dd7] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#1515a3] transition-all"
                    >
                        <Download className="w-5 h-5" /> Télécharger en PNG
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-4">Lien direct de la campagne</h3>
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200 mb-4">
                            <input
                                type="text"
                                readOnly
                                value={playUrl}
                                className="bg-transparent text-sm text-gray-600 flex-1 outline-none"
                            />
                            <button
                                onClick={copyToClipboard}
                                className="p-2 hover:bg-gray-200 rounded-lg transition-all text-[#1d1dd7]"
                                title="Copier le lien"
                            >
                                {copied ? <span className="text-xs font-bold uppercase">Copié !</span> : <Copy className="w-5 h-5" />}
                            </button>
                        </div>
                        <a
                            href={playUrl}
                            target="_blank"
                            className="flex items-center justify-center gap-2 w-full py-3 border-2 border-gray-100 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all"
                        >
                            Tester le flow <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>

                    <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                        <h4 className="font-bold text-blue-900 mb-2">📝 Comment ça marche ?</h4>
                        <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
                            <li>Placez ce QR code sur vos tables ou au comptoir.</li>
                            <li>Le client scanne avec son smartphone.</li>
                            <li><strong>Le lien est permanent</strong> : Même si vous changez vos récompenses, le QR code reste le même !</li>
                            <li>Vous pouvez activer ou désactiver vos offres à tout moment.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
