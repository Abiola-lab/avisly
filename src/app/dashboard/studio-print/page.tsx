'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
    Printer,
    Smartphone,
    LayoutTemplate,
    ChevronRight,
    QrCode,
    CheckCircle2,
    Info,
    Star,
    Palette,
    Layers
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

// Universal high-quality layout
const FLYER_LAYOUT = {
    previewClass: 'w-[480px] h-[850px]',
    scale: 0.7
};

const DESIGNS = [
    { id: 'impact', name: 'Ultra Impact' },
    { id: 'minimal', name: 'Épuré' },
    { id: 'neon', name: 'Néon Dark' }
];

interface Palette {
    primary: string;
    secondary: string;
    accent: string;
}

const PALETTES = {
    electric: { id: 'electric', name: 'Electrique', primary: '#1d1dd7', secondary: '#ffffff', accent: '#ff0080' },
    luxury: { id: 'luxury', name: 'Luxe', primary: '#000000', secondary: '#ffffff', accent: '#fbbf24' },
    fresh: { id: 'fresh', name: 'Fresh', primary: '#059669', secondary: '#ffffff', accent: '#fef08a' }
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
                .select(`
                    id, 
                    name, 
                    logo_url,
                    campaigns (
                        id,
                        color_primary,
                        color_secondary,
                        color_accent
                    )
                `)
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
                            accent: activeCampaign.color_accent || '#ff0080'
                        });
                    }
                }
            }

            setLoading(false);
        };

        fetchData();
    }, []);

    const updateCampaignPalette = async (newPalette: Palette) => {
        if (!campaignId) return;
        setPalette(newPalette);
        setSaving(true);
        try {
            await supabase
                .from('campaigns')
                .update({
                    color_primary: newPalette.primary,
                    color_secondary: newPalette.secondary,
                    color_accent: newPalette.accent
                })
                .eq('id', campaignId);
        } catch (err) {
            console.error('Error saving palette:', err);
        } finally {
            setSaving(false);
        }
    };

    const gameUrl = restaurantId ? `${window.location.origin}/play/r/${restaurantId}` : '';

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1d1dd7]"></div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 no-print">
                <div className="space-y-4">
                    <h1 className="text-5xl font-black tracking-tight text-gray-900 uppercase italic underline decoration-[#1d1dd7] decoration-[12px] underline-offset-8">Studio Print</h1>
                    <p className="text-gray-500 font-medium text-lg pt-2">Créez vos supports physiques personnalisés pour récolter des avis.</p>
                </div>

                <div className="flex flex-col items-end gap-3">
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-4 px-10 py-5 bg-gray-900 text-white font-black rounded-3xl hover:bg-black transition-all shadow-2xl active:scale-95 group"
                    >
                        <Printer className="w-6 h-6 group-hover:rotate-12 transition-transform" /> PRÊT À IMPRIMER ?
                    </button>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest no-print">
                        (Vous pourrez choisir le format d'impression dans la boîte de dialogue)
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                {/* Configuration Panel */}
                <div className="lg:col-span-1 space-y-6 no-print">
                    <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
                        {/* Design Selection */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Layers className="w-4 h-4" /> 1. Modèle (Template)
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {DESIGNS.map(design => (
                                    <button
                                        key={design.id}
                                        onClick={() => setSelectedDesign(design.id)}
                                        className={`p-3 rounded-xl text-center border-2 transition-all text-[9px] font-black uppercase tracking-tight ${selectedDesign === design.id
                                            ? 'border-[#1d1dd7] bg-blue-50/30 text-[#1d1dd7]'
                                            : 'border-gray-50 bg-gray-50/50 hover:bg-white hover:border-gray-200 text-gray-400'
                                            }`}
                                    >
                                        {design.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Color Selection */}
                        <div className="space-y-6">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Palette className="w-4 h-4" /> 2. Palette de l'affiche
                            </label>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 gap-2">
                                    {Object.values(PALETTES).map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => updateCampaignPalette({ primary: p.primary, secondary: p.secondary, accent: p.accent })}
                                            className={`flex items-center justify-between p-3 rounded-2xl border-2 transition-all ${palette.primary === p.primary && palette.accent === p.accent
                                                ? 'border-gray-900 bg-gray-50'
                                                : 'border-transparent bg-gray-100/50 hover:bg-white hover:border-gray-200 opacity-60 hover:opacity-100'
                                                }`}
                                        >
                                            <span className="text-[10px] font-black uppercase tracking-tight ml-2">{p.name}</span>
                                            <div className="flex gap-1 pr-2">
                                                <div className="w-6 h-6 rounded-full border border-white/20" style={{ backgroundColor: p.primary }} />
                                                <div className="w-6 h-6 rounded-full border border-white/20" style={{ backgroundColor: p.secondary }} />
                                                <div className="w-6 h-6 rounded-full border border-white/20" style={{ backgroundColor: p.accent }} />
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                <div className="pt-4 border-t border-gray-100 space-y-4">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Ou personnalisation fine</p>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="space-y-2">
                                            <input
                                                type="color"
                                                className="w-full h-12 p-1 bg-white border border-gray-100 rounded-xl cursor-pointer"
                                                value={palette.primary}
                                                onChange={(e) => updateCampaignPalette({ ...palette, primary: e.target.value })}
                                            />
                                            <p className="text-[8px] text-center font-bold uppercase text-gray-400">Fond</p>
                                        </div>
                                        <div className="space-y-2">
                                            <input
                                                type="color"
                                                className="w-full h-12 p-1 bg-white border border-gray-100 rounded-xl cursor-pointer"
                                                value={palette.secondary}
                                                onChange={(e) => updateCampaignPalette({ ...palette, secondary: e.target.value })}
                                            />
                                            <p className="text-[8px] text-center font-bold uppercase text-gray-400">Texte</p>
                                        </div>
                                        <div className="space-y-2">
                                            <input
                                                type="color"
                                                className="w-full h-12 p-1 bg-white border border-gray-100 rounded-xl cursor-pointer"
                                                value={palette.accent}
                                                onChange={(e) => updateCampaignPalette({ ...palette, accent: e.target.value })}
                                            />
                                            <p className="text-[8px] text-center font-bold uppercase text-gray-400">Accent</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tips */}
                        <div className="p-6 bg-blue-50/50 rounded-[2rem] border-2 border-blue-100/50 flex gap-4">
                            <Info className="w-5 h-5 text-[#1d1dd7] shrink-0" />
                            <p className="text-[10px] font-bold text-gray-600 leading-relaxed uppercase tracking-tighter">
                                <span className="block mb-1 font-black text-[#1d1dd7] tracking-widest text-[9px]">Conseil Avisly</span>
                                L'affiche est optimisée pour tous les formats (A4, A5, DL).
                            </p>
                        </div>
                    </div>
                </div>

                {/* Preview Panel */}
                <div className="lg:col-span-2">
                    <div className="bg-[#111] p-4 md:p-8 rounded-[3rem] border border-gray-100 min-h-[950px] flex items-center justify-center relative overflow-hidden group shadow-2xl no-print">
                        <div className="absolute top-6 left-6 flex items-center gap-3 text-[10px] font-black text-gray-500 uppercase tracking-widest border border-white/10 px-6 py-2.5 rounded-full bg-black/40 backdrop-blur-xl shadow-sm z-20">
                            <Smartphone className="w-3 h-3" /> Visualisation avant impression
                        </div>

                        <div
                            className={`${FLYER_LAYOUT.previewClass} bg-white shadow-2xl overflow-hidden relative transition-all duration-700`}
                            style={{ transform: `scale(${FLYER_LAYOUT.scale})` }}
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

                    {/* Hidden printable area */}
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

                <style jsx global>{`
                    @media print {
                        .no-print { display: none !important; }
                        .print-only { display: block !important; }
                        body { background: white !important; margin: 0; padding: 0; }
                        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    }
                `}</style>
            </div>
        </div>
    );
}

function FlyerContent({ design, palette, logoUrl, restaurantName, gameUrl }: { design: string, palette: Palette, logoUrl: string | null, restaurantName: string, gameUrl: string }) {
    return (
        <div
            className="w-full h-full flex flex-col relative"
            style={{ backgroundColor: palette.primary }}
        >
            {/* Design Patterns */}
            {design === 'minimal' && (
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(${palette.secondary} 1px, transparent 1px)`, backgroundSize: '16px 16px' }} />
            )}

            {design === 'impact' && (
                <>
                    <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rotate-45 opacity-20" style={{ backgroundColor: palette.accent }} />
                    <div className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[40%] rounded-full opacity-10" style={{ backgroundColor: palette.secondary }} />
                    <div className="absolute top-[20%] left-[-10%] w-full h-[2px] rotate-12 opacity-30" style={{ backgroundColor: palette.accent }} />
                    <div className="absolute bottom-[30%] right-[-5%] w-[30%] h-[30%] border-[20px] border-white/5 rounded-full" />
                    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `radial-gradient(${palette.secondary} 2px, transparent 2px)`, backgroundSize: '24px 24px' }} />
                </>
            )}

            {design === 'neon' && (
                <>
                    <div className="absolute inset-0 bg-gradient-to-br from-black/0 via-black/40 to-black/80" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] blur-[120px] opacity-20 -z-10" style={{ backgroundColor: palette.accent }} />
                </>
            )}

            <div className="w-full flex-1 flex flex-col items-center justify-between relative z-10 py-10 px-10">
                {/* Brand Logo */}
                <div className="h-20 w-full flex items-center justify-center shrink-0 mb-4 px-6">
                    {logoUrl ? (
                        <img
                            src={logoUrl}
                            alt={restaurantName}
                            className="max-h-full max-w-[260px] object-contain drop-shadow-sm filter brightness-0 invert"
                            style={{ filter: palette.secondary === '#ffffff' ? 'brightness(0) invert(1)' : 'none' }}
                        />
                    ) : (
                        <p className="font-black text-3xl italic tracking-[0.2em] uppercase leading-none" style={{ color: palette.secondary }}>
                            {restaurantName}
                        </p>
                    )}
                </div>

                {/* Main Message */}
                <div className="space-y-4 shrink-0 mt-4 md:mt-6">
                    <h2 className="font-black tracking-tighter leading-[0.9] uppercase italic text-6xl" style={{ color: palette.secondary }}>
                        SCANNEZ <br />
                        <span className="bg-white px-4 py-2 -rotate-2 inline-block shadow-sm" style={{ color: palette.primary }}>& GAGNEZ</span>
                    </h2>
                    <div className="h-1.5 mx-auto rounded-full w-24 mt-4" style={{ backgroundColor: palette.accent }} />
                    <p className="font-bold text-[14px] uppercase tracking-[0.5em] opacity-80 mt-2">Tentez votre chance !</p>
                </div>

                {/* QR Code */}
                <div className="relative isolate flex items-center justify-center py-6">
                    <div
                        className="absolute inset-0 blur-[40px] rounded-full scale-110 opacity-30 -z-10"
                        style={{ backgroundColor: palette.accent }}
                    />

                    <div className="relative p-6 bg-white rounded-[3rem] shadow-2xl border-[12px] border-black/5">
                        <QRCodeSVG
                            value={gameUrl}
                            size={180}
                            level="H"
                            includeMargin={false}
                            fgColor="#000000"
                        />
                    </div>
                </div>

                {/* Footer Message */}
                <div className="space-y-4 w-full shrink-0">
                    <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2">
                            {[1, 2, 3, 4, 5].map(i => (
                                <Star key={i} className="w-7 h-7 fill-yellow-400 text-yellow-400 drop-shadow-sm" />
                            ))}
                        </div>
                        <p className="text-2xl font-black uppercase tracking-tight max-w-[340px] mx-auto leading-tight text-center" style={{ color: palette.secondary }}>
                            Votre avis compte !
                        </p>
                    </div>

                    <div className="flex items-center justify-center">
                        <div className="px-7 py-3 rounded-full bg-black/10 backdrop-blur-md border border-white/20 flex items-center gap-3 text-xs font-black uppercase tracking-[0.35em]" style={{ color: palette.secondary }}>
                            <CheckCircle2 className="w-5 h-5" style={{ color: palette.accent }} /> 30 SECONDES CHRONO
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
