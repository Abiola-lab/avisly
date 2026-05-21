'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  QrCode, ArrowRight, Star, ShieldCheck,
  Trophy, CheckCircle2, ChevronDown, HelpCircle,
  Gift, Clock, Printer, Menu, X, CreditCard
} from 'lucide-react'

const PLANS = [
  {
    id: 'roue',
    name: 'Roue',
    desc: 'Gamification et collecte d\'avis par la roue de la fortune.',
    monthly: 30,
    annual: 288,
    features: [
      'Roue de la fortune',
      'Coupons récompenses',
      'Studio Print (A5, A4)',
      'Validation coupons en caisse',
      'QR Code campagne personnalisé',
    ],
    highlight: false,
  },
  {
    id: 'fidelite',
    name: 'Fidélité',
    desc: 'Carte de fidélité dématérialisée Apple & Google Wallet.',
    monthly: 40,
    annual: 384,
    features: [
      'Carte de fidélité Wallet',
      'Collecte contacts (email / SMS)',
      'Parcours avis Google',
      'Notifications push de proximité',
      'QR Code campagne personnalisé',
    ],
    highlight: false,
  },
  {
    id: 'full_pro',
    name: 'Full Pro',
    desc: 'L\'offre complète pour les restaurants qui veulent tout.',
    monthly: 60,
    annual: 576,
    features: [
      'Tout de l\'offre Roue',
      'Tout de l\'offre Fidélité',
      'Dashboard unifié',
      'Accès prioritaire nouveautés',
    ],
    highlight: true,
  },
]

const FAQS = [
  {
    q: "Comment fonctionne l'essai gratuit de 7 jours ?",
    a: "Créez votre compte, configurez votre première campagne et accédez à toutes les fonctionnalités. Si vous n'êtes pas convaincu avant la fin des 7 jours, annulez en un clic sans être débité.",
  },
  {
    q: "Mes clients doivent-ils télécharger une application ?",
    a: "Non. Tout se passe dans le navigateur de leur smartphone. Ils scannent le QR code, jouent, et sont redirigés vers Google en quelques secondes.",
  },
  {
    q: "Puis-je changer de plan ou annuler à tout moment ?",
    a: "Oui. Tous nos plans sont sans engagement. Vous changez ou annulez directement depuis votre espace facturation Stripe, accessible depuis les paramètres.",
  },
  {
    q: "Combien de temps faut-il pour configurer une campagne ?",
    a: "Moins de 2 minutes. Choisissez vos lots, téléchargez votre logo, et votre QR code est prêt à imprimer.",
  },
  {
    q: "Quelle différence entre Roue et Fidélité ?",
    a: "La Roue mise sur la gamification ponctuelle (un avis = un lot gagné). La Fidélité mise sur le retour régulier (points, Wallet, notifications). Le Full Pro combine les deux.",
  },
]

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans overflow-x-hidden">

      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100 h-16 flex items-center px-6">
        <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
          <Link href="#" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden border border-gray-100 shadow-sm">
              <img src="/logo_avisly.svg" alt="Avisly" className="w-[80%] h-[80%] object-contain" />
            </div>
            <span className="text-base font-bold tracking-tight text-gray-900">Avisly</span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {[['#features', 'Fonctionnalités'], ['#how-it-works', 'Comment ça marche'], ['#pricing', 'Tarifs'], ['#faq', 'FAQ']].map(([href, label]) => (
              <Link key={href} href={href} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">{label}</Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:block text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
              Connexion
            </Link>
            <Link href="/register"
              className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-black transition-all">
              Commencer gratuitement
            </Link>
            <button className="lg:hidden p-1.5" onClick={() => setIsMenuOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-white z-[60] flex flex-col p-6"
          >
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden border border-gray-100">
                  <img src="/logo_avisly.svg" alt="Avisly" className="w-[80%] h-[80%] object-contain" />
                </div>
                <span className="text-base font-bold tracking-tight">Avisly</span>
              </div>
              <button onClick={() => setIsMenuOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex flex-col gap-6 mb-10">
              {[['#features', 'Fonctionnalités'], ['#how-it-works', 'Comment ça marche'], ['#pricing', 'Tarifs'], ['#faq', 'FAQ']].map(([href, label]) => (
                <Link key={href} onClick={() => setIsMenuOpen(false)} href={href}
                  className="text-2xl font-semibold text-gray-900">{label}</Link>
              ))}
            </nav>
            <div className="flex flex-col gap-3 mt-auto">
              <Link onClick={() => setIsMenuOpen(false)} href="/login"
                className="w-full py-3 text-center text-sm font-medium text-gray-900 border border-gray-200 rounded-lg">
                Connexion
              </Link>
              <Link onClick={() => setIsMenuOpen(false)} href="/register"
                className="w-full py-3 text-center text-sm font-medium text-white bg-gray-900 rounded-lg">
                Commencer gratuitement
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-96 h-96 bg-[#1d1dd7]/4 rounded-full blur-[120px]" />
          <div className="absolute top-1/4 right-0 w-80 h-80 bg-indigo-100/60 rounded-full blur-[100px]" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-[0.95] tracking-tighter mb-6">
            Dopez votre<br />
            <span className="text-[#1d1dd7]">réputation locale</span><br />
            par le jeu.
          </h1>

          <p className="text-lg text-gray-500 max-w-xl mx-auto leading-relaxed mb-10">
            Ne demandez plus d'avis — <span className="text-gray-900 font-semibold">offrez une expérience</span>.
            Roue de la fortune, carte de fidélité Wallet, QR code personnalisé.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/register"
              className="w-full sm:w-auto px-8 py-3.5 bg-gray-900 text-white font-semibold rounded-lg text-sm hover:bg-black transition-all flex items-center justify-center gap-2 group">
              Essai gratuit 7 jours <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link href="#how-it-works"
              className="w-full sm:w-auto px-8 py-3.5 border border-gray-200 text-gray-700 font-medium rounded-lg text-sm hover:border-gray-300 transition-all text-center">
              Voir comment ça marche
            </Link>
          </div>

          <div className="flex items-center justify-center gap-2 mt-8">
            {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}
            <span className="text-xs text-gray-400 font-medium ml-1">Conçu pour les restaurateurs français</span>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <div className="border-y border-gray-100 py-5 bg-gray-50/50">
        <div className="max-w-4xl mx-auto px-6 flex flex-wrap justify-center gap-x-12 gap-y-3">
          {[
            [ShieldCheck, 'Données sécurisées'],
            [Clock, 'Setup en 2 minutes'],
            [Trophy, 'Sans application client'],
            [CreditCard, 'Sans engagement'],
          ].map(([Icon, label], i) => (
            <div key={i} className="flex items-center gap-2 text-xs font-medium text-gray-400">
              <Icon className="w-3.5 h-3.5" />
              {label as string}
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
              Trois modules. Un seul outil.
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Choisissez l'offre qui correspond à votre stratégie, ou combinez les deux pour une couverture totale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: Trophy,
                title: 'Roue de la Fortune',
                desc: 'Un moment de suspense à chaque passage. Le client tourne la roue pour gagner un lot, et laisse son avis pour le récupérer.',
                tag: 'Gamification',
              },
              {
                icon: CreditCard,
                title: 'Carte de Fidélité Wallet',
                desc: 'Carte dématérialisée Apple Wallet & Google Pay. Points, seuil de récompense, notifications push de proximité.',
                tag: 'Fidélisation',
              },
              {
                icon: Printer,
                title: 'Studio Print',
                desc: 'Créez vos affiches, chevalets et stickers QR code en quelques secondes, directement depuis le dashboard.',
                tag: 'Communication',
              },
            ].map((f, i) => (
              <div key={i} className="rounded-xl border p-6 space-y-4 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100">
                  <f.icon className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-[#1d1dd7] uppercase tracking-widest">{f.tag}</span>
                  <h3 className="text-base font-semibold text-gray-900 mt-1">{f.title}</h3>
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 bg-gray-50 border-y border-gray-100">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">Le flow client</h2>
            <p className="text-gray-500">Trois étapes, zéro friction, un avis mémorable.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative">
            {[
              { icon: QrCode, title: 'Scan instantané', desc: 'Un QR code sur la table. Scan sans rien installer, ouverture immédiate dans le navigateur.', n: '01' },
              { icon: Gift, title: 'Moment de jeu', desc: 'La roue tourne, le lot s\'affiche. L\'adrénaline garantit l\'engagement.', n: '02' },
              { icon: Star, title: 'Avis & récompense', desc: 'Pour récupérer le lot, le client laisse sa note. Redirection fluide vers Google Maps.', n: '03' },
            ].map((step, i) => (
              <div key={i} className="relative text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl border border-gray-200 bg-white shadow-sm mb-5">
                  <step.icon className="w-6 h-6 text-[#1d1dd7]" />
                </div>
                <p className="absolute top-0 right-0 text-6xl font-black text-gray-100 pointer-events-none leading-none">{step.n}</p>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-600 text-xs font-medium rounded-full border border-green-100 mb-5">
              7 jours d'essai gratuit — sans carte bancaire
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">
              Choisissez votre offre
            </h2>
            <p className="text-gray-500 mb-8">Sans engagement. Changez ou annulez à tout moment.</p>

            {/* Billing toggle */}
            <div className="inline-flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
              {(['monthly', 'annual'] as const).map(b => (
                <button key={b} onClick={() => setBilling(b)}
                  className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${billing === b ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
                  {b === 'monthly' ? 'Mensuel' : 'Annuel'}
                  {b === 'annual' && <span className="ml-2 text-[10px] font-semibold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">-20%</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
            {PLANS.map((plan) => {
              const price = billing === 'monthly' ? plan.monthly : Math.round(plan.annual / 12)
              const totalAnnual = plan.annual

              return (
                <div key={plan.id}
                  className={`relative rounded-xl border p-6 flex flex-col transition-all ${
                    plan.highlight
                      ? 'border-[#1d1dd7] shadow-lg shadow-[#1d1dd7]/10'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#1d1dd7] text-white text-[10px] font-semibold rounded-full whitespace-nowrap">
                      Recommandé
                    </div>
                  )}

                  <div className="mb-5">
                    <h3 className="text-base font-semibold text-gray-900">{plan.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{plan.desc}</p>
                  </div>

                  <div className="mb-5">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-gray-900">{price}€</span>
                      <span className="text-xs text-gray-400">/ mois</span>
                    </div>
                    {billing === 'annual' && (
                      <p className="text-xs text-gray-400 mt-0.5">soit {totalAnnual}€ / an</p>
                    )}
                  </div>

                  <ul className="space-y-2.5 mb-6 flex-1">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link href="/register"
                    className={`block w-full py-2.5 text-center text-sm font-medium rounded-lg transition-all ${
                      plan.highlight
                        ? 'bg-[#1d1dd7] text-white hover:bg-[#1515a3]'
                        : 'bg-gray-900 text-white hover:bg-black'
                    }`}>
                    Démarrer l'essai gratuit
                  </Link>
                </div>
              )
            })}
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            Tous les plans incluent 7 jours d'essai · Aucune carte requise · Annulation en 1 clic
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white text-gray-500 text-xs font-medium rounded-full border border-gray-200 mb-5">
              <HelpCircle className="w-3.5 h-3.5" /> Questions fréquentes
            </div>
            <h2 className="text-3xl font-black tracking-tight">On répond à <span className="text-[#1d1dd7]">tout.</span></h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="text-sm font-semibold text-gray-900 pr-2">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-4 text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-3xl mx-auto bg-gray-900 rounded-2xl p-12 text-center text-white relative overflow-hidden">
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#1d1dd7]/20 rounded-full blur-[80px] translate-x-1/2 translate-y-1/2 pointer-events-none" />
          <div className="relative z-10 space-y-5">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Prêt pour une pluie d'avis 5 étoiles ?
            </h2>
            <p className="text-white/60 text-sm leading-relaxed max-w-md mx-auto">
              Rejoignez les restaurants qui ont choisi la croissance locale par la gamification.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link href="/register"
                className="px-8 py-3 bg-[#1d1dd7] text-white text-sm font-semibold rounded-lg hover:bg-[#1515a3] transition-all">
                Commencer gratuitement
              </Link>
              <Link href="/login"
                className="px-8 py-3 bg-white/10 text-white text-sm font-medium rounded-lg hover:bg-white/20 transition-all border border-white/10">
                Se connecter
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-5 pt-2 text-white/30 text-xs">
              <span>✓ Sans engagement</span>
              <span>✓ 7 jours offerts</span>
              <span>✓ Annulation immédiate</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between gap-10 mb-10">
            <div className="space-y-3 max-w-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg overflow-hidden border border-gray-100">
                  <img src="/logo_avisly.svg" alt="Avisly" className="w-full h-full object-contain" />
                </div>
                <span className="text-sm font-bold text-gray-900">Avisly</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Le moteur de croissance locale pour les restaurateurs ambitieux.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-10 text-sm">
              <div className="space-y-3">
                <p className="font-semibold text-xs text-gray-900 uppercase tracking-widest">Produit</p>
                <ul className="space-y-2 text-gray-500">
                  <li><Link href="#features" className="hover:text-gray-900 transition-colors">Fonctionnalités</Link></li>
                  <li><Link href="#pricing" className="hover:text-gray-900 transition-colors">Tarifs</Link></li>
                  <li><Link href="#faq" className="hover:text-gray-900 transition-colors">FAQ</Link></li>
                </ul>
              </div>
              <div className="space-y-3">
                <p className="font-semibold text-xs text-gray-900 uppercase tracking-widest">Légal</p>
                <ul className="space-y-2 text-gray-500">
                  <li><Link href="#" className="hover:text-gray-900 transition-colors">Confidentialité</Link></li>
                  <li><Link href="#" className="hover:text-gray-900 transition-colors">CGV</Link></li>
                  <li><Link href="#" className="hover:text-gray-900 transition-colors">Mentions légales</Link></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t border-gray-100">
            <span className="text-xs text-gray-300">Avisly © 2026 — Fait avec soin pour les restaurateurs</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
