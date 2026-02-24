
# QR Review Engine

## Product Requirements Document (PRD)

---

# 1. Overview

## 1.1 Product Name

QR Review Engine (nom temporaire)

## 1.2 Product Type

SaaS B2B destiné aux restaurants (France)

## 1.3 Objective

Permettre aux restaurants d’augmenter le volume d’avis Google via une expérience ludique en point de vente (QR code + roue de récompense), intégrant un micro-engagement obligatoire (notation par étoiles) et une redirection optimisée vers Google.

---

# 2. Problem Statement

Les restaurants :

* Ont peu d’avis Google malgré une clientèle satisfaite.
* N’ont pas de système structuré pour inciter les clients à laisser un avis.
* Ne disposent pas d’un mécanisme d’engagement client en point de vente simple et mesurable.

---

# 3. Solution Summary

Le produit propose :

* Un QR code unique par campagne.
* Une roue de récompense immersive mobile-first.
* Un micro-engagement obligatoire (notation 1–5 étoiles).
* Une révélation de gain sécurisée avec code unique.
* Une redirection optimisée vers Google Business Profile.
* Un dashboard de suivi côté restaurateur.
* Historique détaillé des coupons (utilisés, expirés, en attente).
* Personnalisation visuelle (Logo + Couleur de marque).
* Limite anti-fraude (une participation par 24h par IP/Device).
* Gestion de modèles de roue (templates).
* Alertes Anti-Bad Buzz (Filtrage des notes négatives sur le Dashboard).
* Analytics visuels (Graphiques d'activité et de satisfaction).

---

# 4. Target Users

## 4.1 Primary User (B2B)

* Restaurateur
* Gérant
* Responsable marketing

## 4.2 Secondary User (B2C)

* Client du restaurant
* Utilisateur mobile
* Interaction courte (1–2 minutes maximum)

---

# 5. User Flows

## 5.1 Client Flow (QR)

1. Scan du QR code.
2. Page d’accueil du jeu.
3. Roulette.
4. Gain affiché flouté.
5. Notation obligatoire (1–5 étoiles).
6. Gain révélé avec code unique + timer.
7. Proposition de laisser un avis Google (conditionnelle selon note).

---

## 5.2 Restaurateur Flow

1. Inscription / Connexion.
2. Onboarding restaurant.
3. Création et configuration campagne.
4. Téléchargement QR code.
5. Suivi des statistiques.
6. Validation des coupons.

---

# 6. Functional Requirements

---

# 6.1 Public Website

## Landing Page

* Présentation claire du produit.
* Section “Comment ça marche”.
* Section bénéfices.
* Section pricing (plan unique).
* FAQ.
* CTA vers inscription.

## Authentication

* Inscription email + mot de passe.
* Connexion.
* Mot de passe oublié.

---

# 6.2 Back-Office

## Onboarding Restaurant

Champs obligatoires :

* Nom du restaurant.
* Adresse.
* Lien Google Business Profile.
* Logo (optionnel MVP).
* Couleur principale (optionnelle MVP).

---

## Dashboard

Affichage des KPI :

* Nombre de scans.
* Nombre de spins.
* Nombre de notes.
* Moyenne des notes.
* Nombre de clics Google.
* Nombre de coupons utilisés.
* Liste des 10 derniers coupons générés avec statut.

Graphiques d'activité (Volume de scans sur 7j).
Graphique de satisfaction (Moyenne des notes sur 7j).
Section **Focus Anti-Bad Buzz** (Affichage prioritaire des notes < 3 si l'option est activée).

---

## Gestion Campagne

* Créer campagne.
* Modifier nom campagne.
* Activer / désactiver.
* Supprimer campagne (optionnel MVP).
* **Modèles de roue** : Sauvegarder des configurations de lots pour basculer rapidement sans changer de QR code.

---

## Paramétrage Roue

* Ajouter segment.
* Modifier texte segment.
* Supprimer segment.
* Aperçu visuel.

Contraintes :

* Probabilités égales (MVP).
* Résultat généré côté serveur uniquement.

---

## QR Code

* Génération QR unique par campagne.
* Téléchargement PNG.
* Copie lien direct.

---

## Validation Coupons

* Saisie manuelle du code.
* Vérification validité.
* Passage en statut “used”.
* **Historique complet** : Vue filtrable par statut (utilisé, expiré, non utilisé) et date.

---

## Paramètres

* Modifier informations restaurant.
* **Alertes Anti-Bad Buzz** : Activer/Désactiver la surveillance des notes négatives sur le Dashboard.
* Modifier mot de passe.
* Supprimer compte.

---

# 6.3 Client Interface (Mobile Fullscreen Web-App)

## Session

* Création session unique à chaque scan.
* session_id généré côté serveur.
* Stockage timestamp.
* IP hash simple + Cookie persistant.
* **Anti-fraude strict** : Une seule participation autorisée toutes les 24h par utilisateur (ID unique basé sur device/IP).

---

## Roulette

* Résultat déterminé côté serveur.
* Animation front alignée sur résultat serveur.
* Reward stocké immédiatement en base.

---

## Gain Flouté

* Affichage carte floutée.
* Bouton “Continuer”.

---

## Notation Obligatoire

* Sélection 1 à 5 étoiles.
* Impossible de continuer sans sélection.
* Stockage rating + session_id.
* Aucun champ texte.

---

## Gain Révélé

* Gain révélé avec nom du restaurant + Logo.
* Thème visuel accordé à la couleur du restaurant (Background & Boutons).
* Code unique généré.
* Timer expiration (default 10 minutes).
* Message “Présentez ce code au comptoir”.

---

## Redirection Google

Si rating ≥ 4 :

* Message incitatif.
* Bouton “Laisser un avis sur Google”.

Si rating ≤ 3 :

* Message neutre.
* Bouton plus discret.

Tracking événement “google_clicked”.

---

# 7. Technical Architecture

## 7.1 Stack

Frontend:

* Next.js (App Router)
* React
* Tailwind CSS

Backend:

* API routes Next.js

Database:

* Supabase (PostgreSQL)
* Supabase Auth
* Supabase Storage (si logo)

Hosting:

* Vercel (frontend + API)
* Supabase (DB + Auth)

---

## 7.2 System Architecture

Client (QR Page)
↕ API
Next.js Server
↕
Supabase (Database + Auth)

---

# 8. Database Schema

## users

* id (uuid)
* email
* created_at

## restaurants

* id
* user_id (fk)
* name
* address
* google_link
* logo_url (Supabase Storage)
* created_at

## campaigns

* id
* restaurant_id (fk)
* name
* active (boolean)
* created_at

## rewards

* id
* campaign_id (fk)
* label
* created_at

## sessions

* id
* campaign_id
* created_at
* ip_hash

## ratings

* id
* session_id
* rating_value (1-5)
* created_at

## coupons

* id
* session_id
* reward_id
* code
* status (unused / used / expired)
* expires_at

## events

* id
* session_id
* event_type
* ip_address (pour anti-fraude)
* created_at

---

# 9. Business Rules

1. Attribution récompense uniquement côté serveur.
2. Code coupon généré côté serveur.
3. Validation coupon uniquement côté serveur.
4. Notation obligatoire avant révélation gain.
5. Aucune vérification automatique des avis Google.
6. Pas de collecte email client (MVP).

---

# 10. Non-Functional Requirements

* Mobile-first.
* Temps de chargement < 2 secondes.
* Interface simple et claire.
* Sécurité minimale contre double participation.
* Conforme RGPD (pas de données personnelles clients en MVP).

---

# 11. Out of Scope (MVP)

* Tirage au sort.
* Collecte email client.
* SMS marketing.
* Probabilités personnalisées.
* Multi-établissements.
* API Google avancée.
* Automatisation marketing.

---

# 12. Success Metrics

* Augmentation nombre avis Google.
* Taux conversion scan → clic Google.
* Taux engagement spin.
* Utilisation coupons.
* Activation restaurateurs.

---

# 13. Design Reference

Les maquettes réalisées via Stitch constituent la référence UI officielle.

L’implémentation doit respecter :

* Layout sidebar back-office.
* Structure dashboard.
* Mobile full-screen immersive côté client.
* Hiérarchie visuelle définie.

Toute divergence doit être validée.

---

PRD Version: 1.1 (Post-MVP Refinements)
