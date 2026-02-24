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
    Star
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const TEMPLATES = [
    {
        id: 'table-stand',
        name: 'Chevalet de table',
        description: 'Format idéal pour poser sur les tables (10x15cm)',
        dimensions: '100mm x 150mm',
        previewClass: 'w-[300px] h-[450px]',
        scale: 0.7
    },
    {
        id: 'square-sticker',
        name: 'Sticker Carré',
        description: 'Parfait pour la caisse ou la vitrine',
        dimensions: '120mm x 120mm',
        previewClass: 'w-[400px] h-[400px]',
        scale: 0.7
    },
    {
        id: 'poster-a4',
        name: 'Affiche A4',
        description: 'Pour une visibilité maximale en salle',
        dimensions: '210mm x 297mm',
        previewClass: 'w-[420px] h-[594px]',
        scale: 0.6
    }
];

export default function StudioPrintPage() {
    const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);
    const [loading, setLoading] = useState(true);
    const [restaurantId, setRestaurantId] = useState('');
    const [restaurantName, setRestaurantName] = useState('Votre Restaurant');
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [primaryColor, setPrimaryColor] = useState('#1d1dd7');

    const supabase = createClient();

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: restData } = await supabase
                .from('restaurants')
                .select('id, name, logo_url, primary_color')
                .eq('user_id', user.id)
                .single();

            if (restData) {
                setRestaurantName(restData.name);
                setRestaurantId(restData.id);
                setLogoUrl(restData.logo_url);
                if (restData.primary_color) setPrimaryColor(restData.primary_color);
            }

            setLoading(false);
        };

        fetchData();
    }, []);

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
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4">
                    <h1 className="text-5xl font-black tracking-tight text-gray-900 uppercase italic underline decoration-[#1d1dd7] decoration-[12px] underline-offset-8">Studio Print</h1>
                    <p className="text-gray-500 font-medium text-lg pt-2">Créez vos supports physiques personnalisés pour récolter des avis.</p>
                </div>

                <button
                    onClick={handlePrint}
                    className="flex items-center gap-4 px-10 py-5 bg-gray-900 text-white font-black rounded-3xl hover:bg-black transition-all shadow-2xl active:scale-95 group"
                >
                    <Printer className="w-6 h-6 group-hover:rotate-12 transition-transform" /> IMPRIMER LE SUPPORT
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                {/* Configuration Panel */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-10">
                        {/* Template Selection */}
                        <div className="space-y-6">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <LayoutTemplate className="w-4 h-4" /> 1. Sélectionner le format
                            </label>
                            <div className="grid grid-cols-1 gap-4">
                                {TEMPLATES.map(template => (
                                    <button
                                        key={template.id}
                                        onClick={() => setSelectedTemplate(template)}
                                        className={`w-full p-6 rounded-[2rem] text-left border-4 transition-all flex items-center justify-between group h-24 ${selectedTemplate.id === template.id
                                            ? 'border-[#1d1dd7] bg-blue-50/30'
                                            : 'border-gray-50 bg-gray-50/50 hover:bg-white hover:border-gray-200 hover:shadow-lg'
                                            }`}
                                    >
                                        <div>
                                            <p className={`font-black text-sm uppercase tracking-tight ${selectedTemplate.id === template.id ? 'text-[#1d1dd7]' : 'text-gray-900'}`}>
                                                {template.name}
                                            </p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                                                {template.dimensions}
                                            </p>
                                        </div>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${selectedTemplate.id === template.id ? 'bg-[#1d1dd7] text-white rotate-90' : 'bg-white text-gray-300'
                                            }`}>
                                            <ChevronRight className="w-4 h-4" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 flex items-center gap-2">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center relative shadow-sm border border-gray-100 group">
                                <img src="/logo_avisly.svg" alt="Avisly" className="w-[80%] h-[80%] object-contain group-hover:scale-110 group-hover:rotate-3 transition-all duration-500" />
                            </div>
                            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Avisly</h1>
                        </div>

                        {/* Tips */}
                        <div className="p-8 bg-blue-50/50 rounded-[2rem] border-2 border-blue-100/50 flex gap-5">
                            <Info className="w-6 h-6 text-[#1d1dd7] shrink-0" />
                            <p className="text-xs font-bold text-gray-600 leading-relaxed uppercase tracking-tighter">
                                <span className="block mb-1 font-black text-[#1d1dd7] tracking-widest text-[10px]">Conseil Avisly</span>
                                Utilisez du papier épais pour un rendu pro. Placez le support bien en vue pour maximiser les scans !
                            </p>
                        </div>
                    </div>
                </div>

                {/* Preview Panel */}
                <div className="lg:col-span-2">
                    <div className="bg-[#111] p-6 md:p-12 rounded-[4rem] border border-gray-100 min-h-[850px] flex items-center justify-center relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-8 left-8 flex items-center gap-3 text-[10px] font-black text-gray-500 uppercase tracking-widest border border-white/10 px-6 py-2.5 rounded-full bg-black/40 backdrop-blur-xl shadow-sm z-20">
                            <Smartphone className="w-3 h-3" /> Visualisation avant impression
                        </div>

                        {/* Scaling helper to ensure the flyer is ALWAYS fully visible */}
                        <div
                            className="flex items-center justify-center transition-all duration-500"
                            style={{
                                transform: `scale(${selectedTemplate.scale})`,
                                transformOrigin: 'center'
                            }}
                        >
                            {/* The Printable Area */}
                            <div
                                id="printable-flyer"
                                className={`bg-white shadow-[0_64px_128px_-32px_rgba(0,0,0,0.3)] flex flex-col items-center justify-between text-center p-6 relative overflow-hidden animate-in fade-in zoom-in duration-700 max-h-full ${selectedTemplate.previewClass}`}
                            >
                                {/* Decorative elements based on Brand Identity */}
                                <div className="absolute top-0 left-0 w-full h-3" style={{ backgroundColor: primaryColor }} />
                                <div className="absolute bottom-0 left-0 w-full h-3" style={{ backgroundColor: primaryColor }} />

                                <div className="w-full flex-1 flex flex-col items-center justify-between py-6 relative z-10">
                                    {/* Brand Logo / Name */}
                                    <div className="h-10 flex items-center justify-center shrink-0">
                                        {logoUrl ? (
                                            <img src={logoUrl} alt={restaurantName} className="max-h-full max-w-[160px] object-contain" />
                                        ) : (
                                            <p className="font-black text-xl italic tracking-[0.25em] uppercase" style={{ color: primaryColor }}>
                                                {restaurantName}
                                            </p>
                                        )}
                                    </div>

                                    {/* Titles */}
                                    <div className="space-y-1.5 shrink-0 mt-4">
                                        <h2 className="text-4xl font-black tracking-tighter leading-none text-gray-900 uppercase italic">
                                            SCANNEZ & <span style={{ color: primaryColor }}>GAGNEZ</span>
                                        </h2>
                                        <p className="text-gray-500 font-bold text-[10px] uppercase tracking-[0.4em] mb-4">Tentez votre chance</p>
                                    </div>

                                    {/* QR Code Container */}
                                    <div className="relative isolate flex-1 flex flex-col items-center justify-center py-6">
                                        <div
                                            className="absolute inset-0 blur-3xl rounded-full scale-125 opacity-10 -z-10"
                                            style={{ backgroundColor: primaryColor }}
                                        />

                                        <div className="relative p-4 bg-white border-[6px] border-gray-900 rounded-[2rem] shadow-xl">
                                            <QRCodeSVG
                                                value={gameUrl}
                                                size={selectedTemplate.id === 'poster-a4' ? 220 : 160}
                                                level="H"
                                                includeMargin={false}
                                                fgColor="#111827"
                                            />
                                        </div>
                                    </div>

                                    {/* Footer / Social Proof */}
                                    <div className="space-y-4 w-full shrink-0 mt-6">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-center gap-1.5">
                                                {[1, 2, 3, 4, 5].map(i => (
                                                    <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                ))}
                                            </div>
                                            <p className="text-xs font-black text-gray-900 uppercase tracking-tight max-w-[240px] mx-auto leading-tight">
                                                Laissez votre avis sur Google <br /> & débloquez votre surprise !
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-center gap-5 opacity-50">
                                            <div className="flex items-center gap-2 text-[8px] font-black text-gray-900 uppercase tracking-[0.3em]">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> 30 SECONDES
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Print CSS - Enhanced for full support printing */}
                <style jsx global>{`
                @media print {
                    /* Hide everything except the flyer */
                    nav, aside, header, button, .lg\\:col-span-1, .absolute, h1, p, div[role="alert"] {
                        display: none !important;
                    }
                    
                    body {
                        background: white !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    
                    #__next, main {
                        padding: 0 !important;
                        margin: 0 !important;
                        max-width: 100% !important;
                    }
                    
                    .lg\\:col-span-2 {
                        width: 100% !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        background: white !important;
                        border: none !important;
                        display: block !important;
                    }

                    /* Important: Reset scale for printing */
                    .flex.items-center.justify-center.transition-all {
                        transform: scale(1) !important;
                        width: 100% !important;
                        height: 100vh !important;
                    }
                    
                    div[id="printable-flyer"] {
                        box-shadow: none !important;
                        border: none !important;
                        margin: 0 auto !important;
                        width: 100vw !important;
                        height: 100vh !important;
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        page-break-after: always;
                        padding: 0 !important;
                        transform: scale(1) !important;
                    }
                    
                    /* Force color printing */
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }

                    .animate-in {
                        animation: none !important;
                    }
                }
            `}</style>
            </div>
        </div>
    );
}
