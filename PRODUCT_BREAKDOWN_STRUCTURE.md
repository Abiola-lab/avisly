# 📦 PRODUCT BREAKDOWN STRUCTURE

## Version MVP 1.0 – Alignée PRD – Build 7 Jours

---

# 1️⃣ VISION PRODUIT (RÉSUMÉ OFFICIEL)

Application SaaS permettant aux restaurants d’augmenter le volume d’avis Google via une expérience ludique en point de vente (QR code + roue de récompense), intégrant un micro-engagement obligatoire (notation par étoiles) et une redirection optimisée vers Google, le tout mesurable et sécurisé.

---

# 2️⃣ ARCHITECTURE GLOBALE DU PRODUIT

Le produit est composé de 4 modules principaux :

1. Interface Client (mobile via QR + Theming dynamique)
2. Back-office Restaurateur (Gestion & Analytics visuels)
3. Moteur de jeu & gestion des récompenses
4. Tracking & analytics (Système anti-fraude & Anti-Bad Buzz)

---

# 3️⃣ MODULE A — INTERFACE CLIENT (FLOW MOBILE)

---

## A1. Scan & Création de session

* QR code unique généré par campagne
* Création d’une session unique à chaque scan
* Génération d’un `session_id` côté serveur
* Enregistrement timestamp
* Enregistrement IP hash (anti-abus léger)

---

## A2. Page d’accueil jeu

Contenu :

* Logo restaurant (Upload local)
* Thème visuel dynamique (Couleur primaire)
* Message principal
* Bouton “Tourner la roue” (Style accordé à la marque)

---

## A3. Roulette

* Animation visuelle front-end
* Résultat déterminé uniquement côté serveur
* Sélection aléatoire parmi les récompenses actives
* Enregistrement immédiat du reward attribué en base
* Affichage du gain en version floutée

---

## A4. Micro-engagement obligatoire (notation)

* Sélection 1 à 5 étoiles
* Impossible de continuer sans sélection
* Enregistrement en base :

  * session_id
  * rating_value
  * timestamp

Aucun champ texte (MVP).

---

## A5. Révélation du gain

* Affichage clair de la récompense
* Génération d’un code unique côté serveur
* Association :

  * session_id
  * reward_id
* Création d’un coupon avec :

  * status = unused
  * expires_at = now + 10 minutes (configurable)
* Affichage timer visible côté client

---

## A6. Redirection Google

Conditionnelle selon note :

Si rating ≥ 4 :

* Message incitatif (Ciblage avis positifs)
* Bouton “Laisser un avis sur Google” (Primary Color)

Si rating ≤ 3 :

* Message neutre (Désamorçage)
* Alerte générée pour le Dashboard (Optionnel selon réglages)

Tracking événement :

* google_clicked

---

# 4️⃣ MODULE B — MOTEUR DE RÉCOMPENSES

---

## B1. Structure récompense (MVP simplifiée)

Chaque récompense contient :

* id
* campaign_id
* label
* created_at

(MVP : pas de type avancé, pas de probabilité personnalisée)

---

## B2. Attribution récompense

Au moment du spin :

* Appel API serveur
* Sélection aléatoire parmi récompenses de la campagne
* Probabilités égales
* Enregistrement immédiat dans session

---

## B3. Coupon sécurisé

À la révélation :

* Génération code unique (string aléatoire)
* Création entrée table coupons :

  * session_id
  * reward_id
  * code
  * status (unused)
  * expires_at

---

## B4. Validation coupon (back-office)

* Saisie manuelle du code
* Vérification :

  * existe
  * status = unused
  * not expired
* Passage en status = used
* Enregistrement événement coupon_validated

---

# 5️⃣ MODULE C — BACK-OFFICE RESTAURATEUR

---

## C1. Authentification

* Inscription email + password
* Connexion
* Déconnexion
* Mot de passe oublié

Gestion via Supabase Auth.

---

## C2. Onboarding

Champs :

* Nom restaurant
* Adresse
* Lien Google Business
* (Logo optionnel MVP)

Création automatique première campagne.

---

## C3. Gestion campagne

* Modifier nom campagne
* Activer / désactiver
* Supprimer campagne (optionnel MVP)

---

## C4. Paramétrage roue

* Ajouter récompense
* Modifier label
* Supprimer récompense

Contraintes :

* Probabilités égales
* Minimum 1 récompense requise

---

## C5. QR Code

* Génération QR unique par campagne
* Téléchargement PNG
* Copie lien direct

(MVP : pas de génération PDF A4)

---

## C6. Dashboard (MVP simplifié)

* Graphiques d'activité (Scans/jour)
* Graphiques de satisfaction (Notes/jour)
* Focus Anti-Bad Buzz (Alertes visuelles immédiates pour notes < 3)
* Tunnel de conversion (Scan → Spin → Note → Google)

---

## C7. Paramètres

* Modifier informations restaurant
* Modifier mot de passe
* Supprimer compte

---

# 6️⃣ MODULE D — TRACKING & DATA

---

## D1. Événements trackés

* scan
* spin_started
* spin_completed
* rating_submitted
* reward_revealed
* google_clicked
* coupon_validated

---

## D2. Indicateurs calculés

* Taux conversion scan → spin
* Taux conversion spin → rating
* Taux conversion rating → google_clicked
* Taux utilisation coupons

---

# 7️⃣ BASE DE DONNÉES — STRUCTURE LOGIQUE

Tables principales :

* users
* restaurants
* campaigns
* rewards
* sessions
* ratings
* coupons
* events

Relations :

* Restaurant → Campaign
* Campaign → Rewards
* Session → Rating
* Session → Coupon
* Session → Events

Index recommandés :

* sessions.campaign_id
* ratings.session_id
* coupons.code
* events.session_id

---

# 🎯 ALIGNEMENT AVEC PRD

Ce document est aligné avec :

* PRD MVP 1.0
* Stack Next.js + Supabase
* Scope build 7 jours
* Interface Stitch validée

---

Version : 1.1 (Post-MVP Refinements)
