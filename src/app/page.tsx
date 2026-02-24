'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  QrCode,
  HandMetal,
  ArrowRight,
  Star,
  TrendingUp,
  ShieldCheck,
  Scan,
  Trophy,
  CheckCircle2,
  Zap,
  ChevronDown,
  HelpCircle,
  Users,
  MessageSquare,
  Gift,
  Clock,
  Printer
} from 'lucide-react'

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const faqs = [
    {
      q: "Comment fonctionne l'essai gratuit de 7 jours ?",
      a: "C'est simple : vous créez votre compte, vous configurez votre première campagne et vous accédez à toutes les fonctionnalités Pro. Si vous n'êtes pas convaincu avant la fin des 7 jours, vous pouvez annuler en un clic sans être débité."
    },
    {
      q: "Mes clients doivent-ils télécharger une application ?",
      a: "Absolument pas. Tout se passe dans le navigateur de leur smartphone. Ils scannent le QR code, jouent à la roue, et sont redirigés vers Google en quelques secondes."
    },
    {
      q: "Puis-je annuler mon abonnement à tout moment ?",
      a: "Oui, tous nos abonnements sont sans engagement de durée. Vous pouvez arrêter votre abonnement Pro directement depuis votre dashboard Stripe à tout moment."
    },
    {
      q: "Combien de temps faut-il pour configurer une campagne ?",
      a: "Moins de 2 minutes. Vous choisissez vos lots (ex: un café offert), vous téléchargez votre logo, et votre QR code est prêt à être imprimé et posé sur vos tables."
    },
    {
      q: "Quelles récompenses puis-je offrir à mes clients ?",
      a: "C'est vous qui décidez ! Café, dessert, -10% sur l'addition, digestif... Les clients adorent les petites attentions immédiates, c'est le secret pour récolter des avis 5 étoiles."
    }
  ]

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-[#1d1dd7]/10 overflow-x-hidden">
      {/* Header */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 flex items-center justify-center h-20 px-6">
        <div className="max-w-7xl w-full flex items-center justify-between">
          <Link href="#" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg border border-gray-100 group-hover:scale-110 transition-all duration-500 overflow-hidden">
              <img src="/logo_avisly.svg" alt="Avisly Logo" className="w-[85%] h-[85%] object-contain group-hover:rotate-6 transition-transform" />
            </div>
            <span className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">Avisly</span>
          </Link>
          <div className="hidden lg:flex items-center gap-10">
            <Link href="#features" className="text-[10px] font-black text-gray-600 hover:text-[#1d1dd7] transition-colors uppercase tracking-[0.2em]">Fonctionnalités</Link>
            <Link href="#how-it-works" className="text-[10px] font-black text-gray-600 hover:text-[#1d1dd7] transition-colors uppercase tracking-[0.2em]">Comment ça marche</Link>
            <Link href="#pricing" className="text-[10px] font-black text-gray-600 hover:text-[#1d1dd7] transition-colors uppercase tracking-[0.2em]">Tarifs</Link>
            <Link href="#faq" className="text-[10px] font-black text-gray-600 hover:text-[#1d1dd7] transition-colors uppercase tracking-[0.2em]">FAQ</Link>
          </div>
          <div className="flex items-center gap-8">
            <Link href="/login" className="hidden md:block text-sm font-black text-gray-500 hover:text-[#1d1dd7] transition-colors uppercase tracking-widest">
              Connexion
            </Link>
            <Link
              href="/register"
              className="px-8 py-3 bg-[#1d1dd7] text-white text-sm font-black rounded-2xl hover:bg-[#1515a3] transition-all shadow-xl shadow-[#1d1dd7]/20 active:scale-95 uppercase tracking-widest"
            >
              Je commence
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-6 overflow-hidden">
        {/* Background blobs for premium effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] pointer-events-none">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#1d1dd7]/5 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-[#4f46e5]/5 rounded-full blur-[100px] translate-x-1/3" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10 flex flex-col items-center">
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#f0f0ff] rounded-full text-[#1d1dd7] text-xs font-black uppercase tracking-[0.1em] border border-[#1d1dd7]/10 mx-auto">
              <TrendingUp className="w-4 h-4" /> La nouvelle référence pour vos avis Google
            </div>

            <h1 className="text-7xl md:text-9xl font-black leading-[0.9] tracking-tighter sm:whitespace-pre-line">
              Dopez votre {"\n"}
              <span className="text-[#1d1dd7] italic">SEO Local</span> par le jeu.
            </h1>

            <p className="text-xl md:text-2xl text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed">
              Ne demandez plus d'avis, <span className="text-gray-900 font-bold">offrez une expérience</span>.
              Le premier SaaS qui transforme vos clients en ambassadeurs grâce à la gamification.
            </p>

            <div className="flex flex-col items-center gap-8 pt-4">
              <Link
                href="/register"
                className="px-16 py-8 bg-gray-900 text-white font-black rounded-[2.5rem] text-2xl flex items-center justify-center gap-4 hover:bg-black transition-all shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] hover:scale-[1.05] active:scale-95 group"
              >
                C'EST PARTI <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
              </Link>

              <div className="flex flex-col items-center gap-3">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Conçu pour et par des restaurateurs français</p>
              </div>
            </div>

            {/* Trust logos / Small stats */}
            <div className="pt-12 flex flex-wrap justify-center gap-x-16 gap-y-8 grayscale opacity-40 font-black text-xs tracking-widest italic border-t border-gray-100 mt-16">
              <div className="flex items-center gap-3"><Zap className="w-5 h-5 text-[#1d1dd7]" /> EXPÉRIENCE FLUIDE</div>
              <div className="flex items-center gap-3"><ShieldCheck className="w-5 h-5 text-[#1d1dd7]" /> SÉCURISÉ</div>
              <div className="flex items-center gap-3"><Clock className="w-5 h-5 text-[#1d1dd7]" /> SETUP 2 MIN</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pilot Phase / Proof of Concept Section */}
      <section className="bg-white py-24 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 text-center lg:text-left items-start">
            <div className="space-y-4">
              <div className="inline-flex items-center px-3 py-1 bg-blue-50 text-[#1d1dd7] text-[10px] font-black rounded-full uppercase tracking-widest border border-blue-100">Cœur du produit</div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tighter leading-tight italic">Conçu pour les <br /> restaurants ambitieux.</h3>
              <p className="text-sm text-gray-400 font-medium leading-relaxed">Une architecture robuste pensée exclusivement pour les besoins du terrain.</p>
            </div>
            <div className="space-y-4 border-y md:border-y-0 md:border-x border-gray-100 py-12 md:py-0 md:px-16">
              <div className="inline-flex items-center px-3 py-1 bg-green-50 text-green-700 text-[10px] font-black rounded-full uppercase tracking-widest border border-green-100">Efficacité locale</div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tighter leading-tight italic">Optimisé pour la <br /> croissance locale.</h3>
              <p className="text-sm text-gray-400 font-medium leading-relaxed">Chaque ligne de code est dédiée à votre ascension sur Google Maps.</p>
            </div>
            <div className="space-y-4 md:pl-8">
              <div className="inline-flex items-center px-3 py-1 bg-purple-50 text-purple-700 text-[10px] font-black rounded-full uppercase tracking-widest border border-purple-100">Vision 1.0</div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tighter leading-tight italic">Un système pensé pour <br /> dédoubler vos avis.</h3>
              <p className="text-sm text-gray-400 font-medium leading-relaxed">Plus qu'un widget, un véritable accélérateur de réputation digitale.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features / Why Avisly */}
      <section id="features" className="py-40 bg-[#fafafa]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center mb-40">
            <div className="space-y-8">
              <h2 className="text-5xl font-black tracking-tight leading-tight">
                C'est prouvé : <br /> <span className="text-[#1d1dd7]">Le jeu</span> bat la demande directe.
              </h2>
              <p className="text-lg text-gray-500 font-medium leading-relaxed">
                90% des clients oublient de laisser un avis, même s'ils sont satisfaits. Avec Avisly, vous transformez cet oubli en un moment de plaisir. L'adrénaline de la roue garantit un taux de conversion 4x supérieur.
              </p>
              <div className="space-y-4">
                {[
                  { icon: MessageSquare, title: 'Incitations Puissantes', desc: 'Offrez un café ou un dessert pour l\'avis' },
                  { icon: ShieldCheck, title: 'Filtre de Sécurité', desc: 'Séparez les avis constructifs des avis publics' },
                  { icon: Users, title: 'Dashboard Complet', desc: 'Suivez vos stats et la performance de votre staff' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 p-4 hover:bg-white hover:shadow-xl rounded-2xl transition-all border border-transparent hover:border-gray-100 group">
                    <div className="w-12 h-12 bg-white flex items-center justify-center rounded-xl shadow-sm text-[#1d1dd7] group-hover:scale-110 transition-transform">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-500 font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-6 pt-12">
                <div className="bg-[#1d1dd7] p-8 rounded-[2.5rem] shadow-xl text-white transform hover:-translate-y-2 transition-transform">
                  <Star className="w-10 h-10 mb-4 fill-white" />
                  <p className="text-3xl font-black italic">"Incontournable"</p>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] shadow-lg border border-gray-100 transform hover:-translate-y-2 transition-transform">
                  <p className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-widest italic">Le Petit Bistro</p>
                  <p className="text-lg font-bold leading-tight">"+45 avis en seulement une semaine de test."</p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-lg border border-gray-100 transform hover:-translate-y-2 transition-transform">
                  <TrendingUp className="w-8 h-8 text-[#1d1dd7] mb-4" />
                  <p className="text-lg font-bold leading-tight">"Notre position sur Maps a bondi de la 12ème à la 2ème place."</p>
                </div>
                <div className="bg-gray-900 p-8 rounded-[2.5rem] shadow-xl text-white transform hover:-translate-y-2 transition-transform">
                  <Users className="w-8 h-8 text-[#1d1dd7] mb-4" />
                  <p className="text-lg font-black leading-tight">REJOIGNEZ LE MOUVEMENT.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Steps (Refined) */}
      <section id="how-it-works" className="py-40 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-24 space-y-4">
            <h2 className="text-5xl font-black tracking-tight">Le flow client parfait ⚡️</h2>
            <p className="text-gray-500 font-medium text-lg">Trois étapes, zéro friction, un avis mémorable.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {[
              {
                title: 'Scan Immédiat',
                desc: 'Le QR code unique sur la table attire l\'oeil. Le scan est instantané, sans rien installer.',
                icon: QrCode,
                color: 'blue'
              },
              {
                title: 'La Roue de la Fortune',
                desc: 'Un moment de suspense ! Le client lance la roue pour découvrir ce qu\'il a gagné.',
                icon: HandMetal,
                color: 'indigo'
              },
              {
                title: 'Récompense & Avis',
                desc: 'Pour obtenir son lot, le client laisse sa note. Redirection fluide vers Google Maps.',
                icon: Gift,
                color: 'yellow'
              }
            ].map((item, i) => (
              <div key={i} className="relative group">
                <div className="mb-10 relative">
                  <div className={`w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-[#1d1dd7] shadow-sm transform group-hover:rotate-6 group-hover:scale-110 transition-all duration-300 relative z-10`}>
                    <item.icon className="w-10 h-10" />
                  </div>
                  <div className="absolute top-4 left-4 w-20 h-20 bg-[#1d1dd7]/10 rounded-3xl -z-0 group-hover:rotate-12 transition-transform" />
                </div>
                <div className="text-6xl font-black text-gray-50 absolute -top-8 -right-4 pointer-events-none">{i + 1}</div>
                <h3 className="text-2xl font-black mb-4">{item.title}</h3>
                <p className="text-gray-500 font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Studio Print Section (NEW) */}
      <section className="py-40 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gray-900 rounded-[4rem] p-12 md:p-24 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#1d1dd7]/10 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2" />
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full text-white/80 text-xs font-black uppercase tracking-widest border border-white/10">
                  <Printer className="w-4 h-4 text-[#1d1dd7]" /> Studio Print Intégré
                </div>
                <h2 className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tighter italic">
                  Économisez <br /> <span className="text-[#1d1dd7] italic">votre graphisme.</span>
                </h2>
                <p className="text-white/50 text-xl font-medium leading-relaxed max-w-lg">
                  Pourquoi payer un prestataire ou passer des heures sur Canva ? <span className="text-white">Générez vos stickers, chevalets et affiches en 1 clic.</span> Tout est prêt à être imprimé.
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  {['Format Chevalet', 'Stickers Caisses', 'Affiches A4', 'Supports DIY'].map(tag => (
                    <div key={tag} className="px-6 py-3 bg-white/5 rounded-2xl border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-widest group-hover:border-[#1d1dd7]/30 transition-colors">
                      {tag}
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative animate-in fade-in slide-in-from-right-8 duration-1000">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#1d1dd7]/40 to-transparent blur-[80px] rounded-full" />
                <div className="relative bg-white/5 backdrop-blur-3xl border border-white/10 p-4 rounded-[3.5rem] shadow-3xl rotate-2 hover:rotate-0 transition-transform duration-700">
                  <div className="bg-white/10 rounded-[3rem] aspect-[4/3] flex items-center justify-center p-12">
                    <div className="flex flex-col items-center gap-6 text-center">
                      <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-2xl">
                        <Printer className="w-12 h-12 text-gray-900" />
                      </div>
                      <div className="space-y-2">
                        <div className="h-2 w-32 bg-white/20 rounded-full" />
                        <div className="h-2 w-24 bg-white/10 rounded-full mx-auto" />
                      </div>
                      <div className="mt-4 flex gap-2">
                        <div className="w-12 h-16 bg-white/20 rounded-lg border border-white/10" />
                        <div className="w-12 h-16 bg-white/20 rounded-lg border border-white/10" />
                        <div className="w-12 h-16 bg-white/20 rounded-lg border border-white/10" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-40 px-6 bg-[#fafafa]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-100">
              ⚡️ Offre de Lancement
            </div>
            <h2 className="text-5xl md:text-6xl font-black tracking-tight leading-tight">
              Prenez de l'avance, <br /> commencez <span className="text-[#1d1dd7]">gratuitement.</span>
            </h2>
            <p className="text-gray-500 font-medium text-lg">
              Testez toutes les fonctionnalités Pro pendant 7 jours. <br className="hidden md:block" /> Aucune limite pendant votre essai.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto items-stretch">
            {/* Monthly Plan */}
            <div className="p-12 bg-white rounded-[3.5rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all relative group h-full flex flex-col scale-95 hover:scale-[0.98]">
              <div className="mb-10">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Mensuel</h3>
                <p className="text-gray-400 text-sm font-medium italic">Flexibilité totale, pas d'engagement.</p>
              </div>

              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-6xl font-black tracking-tighter">29,99€</span>
                <span className="text-gray-400 font-black tracking-widest uppercase text-[10px]">/ mois</span>
              </div>

              <div className="p-4 bg-indigo-50/50 rounded-2xl mb-10 border border-indigo-100/50">
                <p className="text-xs font-black text-[#1d1dd7] uppercase tracking-widest text-center">✨ 7 jours d'essai offerts</p>
              </div>

              <ul className="space-y-5 mb-12 flex-1">
                {[
                  'Campagnes illimitées',
                  'Fiches QR Personnalisées',
                  'Filtre Bad-Buzz intégré',
                  'Support réactif',
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-4 text-sm font-bold text-gray-500">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className="block w-full py-6 bg-gray-900 text-white text-center font-black rounded-3xl hover:bg-black transition-all hover:shadow-xl shadow-gray-200 active:scale-95 uppercase tracking-widest text-sm"
              >
                DÉMARRER MON ESSAI
              </Link>
            </div>

            {/* Annual Plan */}
            <div className="p-12 bg-white rounded-[3.5rem] border-4 border-[#1d1dd7] shadow-[0_32px_64px_-16px_rgba(29,29,215,0.2)] relative group h-full flex flex-col">
              <div className="absolute top-6 right-8">
                <div className="bg-yellow-400 text-gray-900 text-[10px] font-black py-2.5 px-6 rounded-full uppercase tracking-widest shadow-xl -rotate-2">
                  -15% DE RÉDUCTION
                </div>
              </div>

              <div className="mb-10">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Annuel</h3>
                <p className="text-[#1d1dd7] text-sm font-black uppercase tracking-widest">Le choix des leaders 👑</p>
              </div>

              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-6xl font-black tracking-tighter">299,99€</span>
                <span className="text-gray-400 font-black tracking-widest uppercase text-[10px]">/ an</span>
              </div>

              <div className="p-4 bg-green-50 rounded-2xl mb-10 border border-green-100">
                <p className="text-xs font-black text-green-600 uppercase tracking-widest text-center">🔥 7 jours d'essai + 2 mois offerts</p>
              </div>

              <ul className="space-y-5 mb-12 flex-1">
                {[
                  'Toutes les fonctionnalités Pro',
                  'Économisez 60€ par an',
                  'Accès Premium Dashboard',
                  'Conseil SEO inclus (1 call)'
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-4 text-sm font-black text-gray-800">
                    <Zap className="w-5 h-5 text-yellow-500 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className="block w-full py-6 bg-[#1d1dd7] text-white text-center font-black rounded-3xl hover:bg-[#1515a3] transition-all shadow-2xl shadow-[#1d1dd7]/40 active:scale-95 uppercase tracking-widest text-sm"
              >
                S'ABONNER MAINTENANT
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-40 px-6 bg-white overflow-hidden relative">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-24 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-gray-200">
              <HelpCircle className="w-3 h-3" /> Questions Fréquentes
            </div>
            <h2 className="text-5xl font-black tracking-tighter">On répond à <span className="text-[#1d1dd7]">tout.</span></h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-gray-50 rounded-[2rem] overflow-hidden border border-gray-100 hover:border-[#1d1dd7]/30 transition-colors">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full p-8 text-left flex items-center justify-between group"
                >
                  <span className="text-lg font-black tracking-tight transition-colors group-hover:text-[#1d1dd7]">{faq.q}</span>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm transition-transform duration-300 ${openFaq === i ? 'rotate-180 bg-[#1d1dd7] text-white' : 'group-hover:bg-gray-100'}`}>
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </button>
                <div className={`transition-all duration-300 ease-in-out ${openFaq === i ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                  <div className="px-8 pb-8 text-gray-500 font-medium leading-relaxed">
                    {faq.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-40 px-6">
        <div className="max-w-6xl mx-auto bg-gray-900 rounded-[5rem] p-12 md:p-32 text-center text-white relative overflow-hidden group">
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#1d1dd7]/20 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2" />
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -ml-48 -mt-48 group-hover:scale-125 transition-transform duration-1000" />

          <div className="relative z-10 space-y-12">
            <h2 className="text-5xl md:text-7xl font-black leading-tight tracking-tighter italic">
              Prêt pour une pluie <br className="hidden md:block" /> d'avis 5 étoiles ? ⭐️
            </h2>
            <p className="text-white/60 text-xl font-medium max-w-2xl mx-auto leading-relaxed uppercase tracking-widest text-sm">
              Rejoignez les restaurants les plus influents de votre secteur. <br /> Installation gratuite, résultats garantis.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-6">
              <Link
                href="/register"
                className="px-14 py-7 bg-[#1d1dd7] text-white font-black rounded-3xl text-xl hover:bg-[#1515a3] transition-all shadow-2xl shadow-[#1d1dd7]/20 active:scale-95 uppercase tracking-widest"
              >
                DÉMARRER MON ESSAI
              </Link>
            </div>
            <div className="flex items-center justify-center gap-6 text-white/30 text-xs font-black uppercase tracking-[0.2em]">
              <span>✓ SANS ENGAGEMENT</span>
              <span className="w-1.5 h-1.5 bg-white/20 rounded-full" />
              <span>✓ 7 JOURS OFFERTS</span>
              <span className="w-1.5 h-1.5 bg-white/20 rounded-full" />
              <span>✓ SUPPORT 24/7</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
            <div className="col-span-1 md:col-span-2 space-y-8">
              <div className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg border border-gray-100 group-hover:scale-110 transition-all duration-500 overflow-hidden">
                  <img src="/logo_avisly.svg" alt="Avisly Logo" className="w-[85%] h-[85%] object-contain group-hover:rotate-6 transition-transform" />
                </div>
                <span className="text-2xl font-black tracking-tight">Avisly</span>
              </div>
              <p className="text-gray-400 font-medium max-w-sm leading-relaxed">
                Le moteur de croissance locale pour les restaurateurs ambitieux. Transformez chaque passage en caisse en un levier SEO puissant.
              </p>
            </div>
            <div className="space-y-6">
              <h4 className="font-black uppercase tracking-widest text-xs text-gray-900">Produit</h4>
              <ul className="space-y-4 text-sm font-bold text-gray-600 uppercase tracking-widest">
                <li><Link href="#features" className="hover:text-[#1d1dd7] transition-colors">Fonctionnalités</Link></li>
                <li><Link href="#how-it-works" className="hover:text-[#1d1dd7] transition-colors">Comment ça marche</Link></li>
                <li><Link href="#pricing" className="hover:text-[#1d1dd7] transition-colors">Tarifs</Link></li>
                <li><Link href="#faq" className="hover:text-[#1d1dd7] transition-colors">FAQ</Link></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="font-black uppercase tracking-widest text-xs text-gray-900">Légal</h4>
              <ul className="space-y-4 text-sm font-bold text-gray-600 uppercase tracking-widest">
                <li><Link href="#" className="hover:text-[#1d1dd7] transition-colors">Confidentialité</Link></li>
                <li><Link href="#" className="hover:text-[#1d1dd7] transition-colors">CGV</Link></li>
                <li><Link href="#" className="hover:text-[#1d1dd7] transition-colors">Mentions</Link></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-12 border-t border-gray-50">
            <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Avisly © 2026 — Fait avec passion pour les foodies</span>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-gray-50 rounded-lg border border-gray-100" />
              <div className="w-8 h-8 bg-gray-50 rounded-lg border border-gray-100" />
              <div className="w-8 h-8 bg-gray-50 rounded-lg border border-gray-100" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
