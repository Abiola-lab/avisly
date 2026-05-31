'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Printer, Star, CheckCircle2, Loader2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const DESIGNS = [
    { id: 'impact', name: 'Impact' },
    { id: 'minimal', name: 'Épuré' },
    { id: 'neon', name: 'Néon' },
];

interface Palette {
    primary: string;
    secondary: string;
    accent: string;
}

const PALETTES = {
    electric: { id: 'electric', name: 'Électrique', primary: '#1d1dd7', secondary: '#ffffff', accent: '#ff0080' },
    luxury:   { id: 'luxury',   name: 'Luxe',        primary: '#000000', secondary: '#ffffff', accent: '#fbbf24' },
    fresh:    { id: 'fresh',    name: 'Fresh',       primary: '#059669', secondary: '#ffffff', accent: '#fef08a' },
};

export default function StudioPrintPage() {
    const [selectedDesign, setSelectedDesign] = useState('impact');
    const [palette, setPalette] = useState<Palette>(PALETTES.electric);
    const [loading, setLoading] = useState(true);
    const [restaurantId, setRestaurantId] = useState('');
    const [restaurantName, setRestaurantName] = useState('Votre Restaurant');
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [campaignId, setCampaignId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const supabase = createClient();

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data: restData } = await supabase
                .from('restaurants')
                .select('id, name, logo_url, campaigns (id, color_primary, color_secondary, color_accent)')
                .eq('user_id', user.id)
                .single();
            if (restData) {
                setRestaurantName(restData.name);
                setRestaurantId(restData.id);
                setLogoUrl(restData.logo_url);
                const activeCampaign = (restData.campaigns as any[])?.find(c => c.id) || restData.campaigns?.[0];
                if (activeCampaign) {
                    setCampaignId(activeCampaign.id);
                    if (activeCampaign.color_primary) {
                        setPalette({
                            primary: activeCampaign.color_primary,
                            secondary: activeCampaign.color_secondary || '#ffffff',
                            accent: activeCampaign.color_accent || '#ff0080',
                        });
                    }
                }
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    const updateCampaignPalette = async (newPalette: Palette) => {
        setPalette(newPalette);
        if (!campaignId) return;
        setSaving(true);
        try {
            await supabase.from('campaigns').update({
                color_primary: newPalette.primary,
                color_secondary: newPalette.secondary,
                color_accent: newPalette.accent,
            }).eq('id', campaignId);
        } finally {
            setSaving(false);
        }
    };

    const gameUrl = restaurantId ? `${window.location.origin}/play/r/${restaurantId}` : '';

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--text-faint)' }} />
        </div>
    );

    return (
        <div className="space-y-6 max-w-6xl">
            {/* Header */}
            <div className="flex items-center justify-between no-print">
                <div>
                    <h1 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>Studio Print</h1>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        Créez votre affiche personnalisée pour récolter des avis.
                    </p>
                </div>
                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all no-print"
                    style={{ background: 'var(--text)', color: 'var(--bg)' }}
                >
                    <Printer className="w-4 h-4" />
                    Imprimer
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

                {/* Config panel */}
                <div className="lg:col-span-1 space-y-4 no-print">
                    <div className="rounded-xl border p-5 space-y-6"
                        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>

                        {/* Design */}
                        <div>
                            <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Modèle</p>
                            <div className="grid grid-cols-3 gap-2">
                                {DESIGNS.map(design => (
                                    <button
                                        key={design.id}
                                        onClick={() => setSelectedDesign(design.id)}
                                        className="py-2 rounded-lg text-xs font-medium transition-all border"
                                        style={{
                                            borderColor: selectedDesign === design.id ? 'var(--accent)' : 'var(--border)',
                                            color: selectedDesign === design.id ? 'var(--accent)' : 'var(--text-muted)',
                                            background: selectedDesign === design.id ? 'var(--accent-light)' : 'transparent',
                                        }}
                                    >
                                        {design.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Palette presets */}
                        <div>
                            <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Palette</p>
                            <div className="space-y-2">
                                {Object.values(PALETTES).map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => updateCampaignPalette({ primary: p.primary, secondary: p.secondary, accent: p.accent })}
                                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all"
                                        style={{
                                            borderColor: palette.primary === p.primary ? 'var(--accent)' : 'var(--border)',
                                            background: palette.primary === p.primary ? 'var(--accent-light)' : 'transparent',
                                        }}
                                    >
                                        <span className="text-xs font-medium" style={{ color: 'var(--text)' }}>{p.name}</span>
                                        <div className="flex gap-1">
                                            {[p.primary, p.secondary, p.accent].map((c, i) => (
                                                <div key={i} className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: c }} />
                                            ))}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Custom colors */}
                        <div>
                            <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Personnalisation</p>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { label: 'Fond', key: 'primary' },
                                    { label: 'Texte', key: 'secondary' },
                                    { label: 'Accent', key: 'accent' },
                                ].map(({ label, key }) => (
                                    <div key={key} className="space-y-1.5">
                                        <input
                                            type="color"
                                            className="w-full h-10 p-1 rounded-lg border cursor-pointer"
                                            style={{ borderColor: 'var(--border)', background: 'var(--bg-subtle)' }}
                                            value={(palette as any)[key]}
                                            onChange={e => updateCampaignPalette({ ...palette, [key]: e.target.value })}
                                        />
                                        <p className="text-[10px] text-center" style={{ color: 'var(--text-faint)' }}>{label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {saving && (
                            <p className="text-xs text-center" style={{ color: 'var(--text-faint)' }}>Enregistrement...</p>
                        )}
                    </div>

                    <p className="text-xs px-1" style={{ color: 'var(--text-faint)' }}>
                        Format d'impression au choix dans la boîte de dialogue (A4, A5, DL).
                    </p>
                </div>

                {/* Preview */}
                <div className="lg:col-span-2">
                    <div className="rounded-xl border overflow-hidden no-print"
                        style={{ background: '#111', borderColor: 'var(--border)', minHeight: '600px' }}>
                        <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                            <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                            <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Aperçu</p>
                        </div>
                        <div className="flex items-center justify-center p-8" style={{ minHeight: '560px' }}>
                            <div
                                className="w-[480px] h-[850px] bg-white overflow-hidden relative shadow-2xl"
                                style={{ transform: 'scale(0.62)', transformOrigin: 'center center' }}
                            >
                                <FlyerContent
                                    design={selectedDesign}
                                    palette={palette}
                                    logoUrl={logoUrl}
                                    restaurantName={restaurantName}
                                    gameUrl={gameUrl}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="print-only hidden">
                        <FlyerContent
                            design={selectedDesign}
                            palette={palette}
                            logoUrl={logoUrl}
                            restaurantName={restaurantName}
                            gameUrl={gameUrl}
                        />
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    .no-print { display: none !important; }
                    .print-only { display: block !important; }
                    body { background: white !important; margin: 0; padding: 0; }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
            `}</style>
        </div>
    );
}

function FlyerContent({ design, palette, logoUrl, restaurantName, gameUrl }: {
    design: string; palette: Palette; logoUrl: string | null; restaurantName: string; gameUrl: string;
}) {
    return (
        <div className="w-full h-full flex flex-col relative" style={{ backgroundColor: palette.primary }}>
            {design === 'minimal' && (
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(${palette.secondary} 1px, transparent 1px)`, backgroundSize: '16px 16px' }} />
            )}
            {design === 'impact' && (
                <>
                    <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rotate-45 opacity-20" style={{ backgroundColor: palette.accent }} />
                    <div className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[40%] rounded-full opacity-10" style={{ backgroundColor: palette.secondary }} />
                </>
            )}
            {design === 'neon' && (
                <div className="absolute inset-0 bg-gradient-to-br from-black/0 via-black/40 to-black/80" />
            )}

            <div className="w-full flex-1 flex flex-col items-center justify-between relative z-10 py-10 px-10">
                <div className="h-20 w-full flex items-center justify-center shrink-0 mb-4 px-6">
                    {logoUrl ? (
                        <img src={logoUrl} alt={restaurantName} className="max-h-full max-w-[260px] object-contain" />
                    ) : (
                        <p className="font-black text-3xl tracking-[0.2em] uppercase" style={{ color: palette.secondary }}>
                            {restaurantName}
                        </p>
                    )}
                </div>

                <div className="space-y-4 shrink-0 mt-4 text-center">
                    <h2 className="font-black tracking-tighter leading-[0.9] uppercase text-6xl" style={{ color: palette.secondary }}>
                        SCANNEZ <br />
                        <span className="bg-white px-4 py-2 inline-block" style={{ color: palette.primary }}>& GAGNEZ</span>
                    </h2>
                    <div className="h-1.5 mx-auto rounded-full w-24 mt-4" style={{ backgroundColor: palette.accent }} />
                </div>

                <div className="relative isolate flex items-center justify-center py-6">
                    <div className="relative p-6 bg-white rounded-2xl shadow-2xl">
                        <QRCodeSVG value={gameUrl} size={180} level="H" includeMargin={false} fgColor="#000000" />
                    </div>
                </div>

                <div className="space-y-4 w-full shrink-0">
                    <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2">
                            {[1,2,3,4,5].map(i => (
                                <Star key={i} className="w-7 h-7 fill-yellow-400 text-yellow-400" />
                            ))}
                        </div>
                        <p className="text-2xl font-black uppercase tracking-tight max-w-[340px] mx-auto leading-tight text-center" style={{ color: palette.secondary }}>
                            Votre avis compte !
                        </p>
                    </div>
                    <div className="flex items-center justify-center">
                        <div className="px-7 py-3 rounded-full bg-black/10 border border-white/20 flex items-center gap-3 text-xs font-black uppercase tracking-[0.35em]" style={{ color: palette.secondary }}>
                            <CheckCircle2 className="w-5 h-5" style={{ color: palette.accent }} /> 30 secondes chrono
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
