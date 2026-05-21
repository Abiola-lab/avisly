# CLAUDE.md — Avisly / QR Review Engine

Fichier de contexte destiné à Claude Code. À lire en priorité avant toute session de travail.

---

## 1. Ce qu'est le projet

Avisly est un SaaS B2B ciblant les restaurants français. Il permet aux restaurants d'augmenter leur volume d'avis Google via une expérience ludique en point de vente (QR code), et de fidéliser leurs clients via des cartes dématérialisées Apple Wallet / Google Wallet.

---

## 2. Stack technique

- **Frontend / Backend** : Next.js 16 (App Router), API Routes
- **Base de données / Auth / Storage** : Supabase (PostgreSQL + RLS)
- **Paiement / Abonnements** : Stripe (webhooks, portail client)
- **Wallet passes** : Service tiers freemium (PassKit ou équivalent) — gère Apple Wallet + Google Wallet simultanément
- **Analytics produit** : PostHog
- **UI** : Tailwind CSS v4, Framer Motion, Lucide React
- **QR Code** : qrcode.react (client-side)

---

## 3. Architecture des offres (Pricing — Vision cible)

Trois niveaux d'abonnement distincts :

| Offre | Contenu |
|---|---|
| **Fidélité** | QR code + Parcours avis Google + Carte de fidélité Wallet |
| **Roue** | QR code + Roue de la fortune + Coupon reward |
| **Full Pro** | QR code + Roue + Coupon + Carte de fidélité Wallet |

> Chaque offre est vendue séparément. La roue et la carte de fidélité sont des modules dissociés.

---

## 4. Flux client selon l'offre

### Offre Fidélité (sans roue)
```
Scan QR → Page d'accueil → Notation Google → Affichage carte Wallet → Ajout au téléphone
```

### Offre Roue (sans fidélité)
```
Scan QR → Page d'accueil → Roue → Notation obligatoire → Coupon révélé → Redirection Google
```

### Offre Full Pro
```
Scan QR → Page d'accueil → Roue → Notation obligatoire → Coupon révélé → Affichage carte Wallet → Ajout au téléphone
```

---

## 5. Logique carte de fidélité

### Côté client (le mangeur)
- À la fin du parcours, il peut ajouter la carte de fidélité à son Apple Wallet ou Google Wallet.
- La carte est présentée au comptoir lors de chaque passage.
- Le restaurateur scanne ou valide manuellement et attribue des points/crédits.
- La carte met à jour son solde en temps réel.
- Notifications push automatiques :
  - Quand le client approche du seuil de gain.
  - Quand le client est dans un périmètre de ~800m du restaurant (géolocalisation).

### Double engagement forcé
La carte de fidélité est créée **uniquement après** que le client ait complété le parcours (notation Google incluse). Pour récupérer ses crédits au comptoir, le client doit montrer la carte — ce qui garantit qu'il a bien effectué l'avis Google au préalable.

### Côté restaurateur (dashboard)
- Voir le nombre de cartes actives.
- Attribuer des points manuellement lors d'un passage comptoir.
- Configurer les règles de fidélité (ex : 10 points = dessert offert).
- Envoyer des notifications push ciblées (offres, promotions).
- Configurer le rayon géolocalisation pour les notifications de proximité.

---

## 6. Intégration technique Wallet

- **Service tiers** : PassKit ou équivalent (freemium, couvre Apple Wallet + Google Wallet).
- Le pass est généré côté serveur (API Route Next.js) via l'API du service tiers.
- L'URL du pass est retournée au client après le parcours.
- Le pass contient : logo restaurant, couleur primaire, nom, solde points, QR code interne.

---

## 7. Impacts sur l'application existante

Ces éléments devront être refactorisés lors des prochaines implémentations :

- **Dashboard** : les KPIs et graphiques doivent s'adapter selon l'offre du restaurateur (pas de stats "Roue" si l'offre ne l'inclut pas).
- **Sidebar / navigation** : certaines sections (Campagnes / Roue) doivent être conditionnelles à l'offre souscrite.
- **SubscriptionGuard** : étendre la logique pour distinguer les 3 offres.
- **Onboarding Wizard** : adapter les étapes selon l'offre choisie.
- **Studio Print / QR Code** : adapter le branding si la roue n'est pas incluse.
- **Flux `/play`** : rendre le passage par la roue conditionnel (si offre sans roue, la roue est skippée).

---

## 8. Ce qui est déjà implémenté (état actuel)

- Auth complète (register, login, forgot/reset password)
- Onboarding restaurant (Wizard 3 étapes)
- Dashboard KPIs, tunnel de conversion, graphiques 7j, ROI estimé, alertes Bad Buzz
- Gestion campagnes : modèles multiples, drag-and-drop lots, probabilité globale, fillers vs prizes
- Moteur de jeu côté serveur : spin, anti-fraude 24h/IP, coupon unique
- QR Code + Studio Print A5
- Validation coupons + historique
- Paramètres restaurant : logo, couleur, panier moyen
- Stripe : abonnement mensuel/annuel, trial 7j, portail client, webhooks
- Social Proof, haptique, sons côté jeu mobile

---

## 9. Ce qui reste à construire (vision)

- [ ] Module carte de fidélité Wallet (Apple + Google) via service tiers
- [ ] Système de points/crédits côté dashboard restaurateur
- [ ] Notifications push Wallet (seuil de gain, proximité géo)
- [ ] Nouveaux plans tarifaires (Fidélité / Roue / Full Pro)
- [ ] Adaptation UI/UX selon plan souscrit (dashboard conditionnel)
- [ ] Refonte partielle du flux `/play` pour rendre la roue optionnelle

---

## 10. Règles de travail pour Claude

- Ne jamais modifier le code sans que ce soit explicitement demandé.
- Toujours proposer une approche avant d'implémenter.
- Aller pas à pas — ne pas tenter de tout implémenter en une session.
- Respecter la stack existante : pas de nouvelle librairie sans discussion préalable.
- Les fichiers PRD.md et PRODUCT_BREAKDOWN_STRUCTURE.md font foi pour la vision produit.
