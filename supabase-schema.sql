-- QR Review Engine - Supabase Schema MVP 1.0
-- Ref: PRD & Product Breakdown Structure

-- 1) Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2) RESTAURANTS
-- Profil restaurateur lié à auth.users
CREATE TABLE IF NOT EXISTS public.restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    address TEXT,
    google_link TEXT,
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3) CAMPAIGNS
-- Une campagne par restaurant (MVP : peut être étendu à plusieurs)
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4) REWARDS
-- Segments de la roue liés à une campagne (probabilités égales gérées par le code)
CREATE TABLE IF NOT EXISTS public.rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
    label TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5) SESSIONS (Flow client)
-- Créé au scan du QR code. Stocke l'avancement du flow.
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
    ip_hash TEXT,
    reward_id UUID REFERENCES public.rewards(id) ON DELETE SET NULL, -- On garde la session si la reward est supprimée
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6) COUPONS
-- Un coupon est associé à une session unique (1 gain par scan).
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE UNIQUE NOT NULL, -- Unicité par session
    code TEXT UNIQUE NOT NULL, -- Unicité globale du code coupon
    status TEXT DEFAULT 'unused' CHECK (status IN ('unused', 'used', 'expired')),
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ, -- Traçabilité pour le dashboard
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7) ANALYTICS EVENTS
-- Suivi granulaire pour le dashboard KPI
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE NOT NULL,
    event_type TEXT NOT NULL CHECK (
        event_type IN (
            'scan', 
            'spin_started', 
            'spin_completed', 
            'rating_submitted', 
            'reward_revealed', 
            'google_clicked', 
            'coupon_validated'
        )
    ),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8) INDEXES
-- Optimisation pour les requêtes dashboard et validation
CREATE INDEX IF NOT EXISTS idx_sessions_campaign_id ON public.sessions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);
CREATE INDEX IF NOT EXISTS idx_analytics_session_id ON public.analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_user_id ON public.restaurants(user_id);
