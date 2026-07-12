-- ═══════════════════════════════════════════════════
--  JeCode Boutique — schéma base de données
--  À exécuter dans Supabase → SQL Editor → New query
-- ═══════════════════════════════════════════════════

create extension if not exists "pgcrypto";

-- ── Commandes ──
create table if not exists commandes (
  id                uuid primary key default gen_random_uuid(),
  reference         text unique not null,
  produit_id        text not null,
  produit_nom       text not null,
  email_client      text,
  telephone_client  text,
  montant           integer not null,
  devise            text not null default 'GNF',
  statut            text not null default 'en_attente' check (statut in ('en_attente', 'paye', 'echoue')),
  moyen_paiement    text not null check (moyen_paiement in ('orange_money', 'cinetpay')),
  provider_ref      text,              -- référence renvoyée par Orange/CinetPay
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_commandes_reference on commandes(reference);
create index if not exists idx_commandes_statut on commandes(statut);

-- ── Liens de téléchargement sécurisés ──
create table if not exists telechargements (
  token                   text primary key default encode(gen_random_bytes(24), 'hex'),
  commande_id             uuid not null references commandes(id) on delete cascade,
  utilisations_restantes  integer not null default 3,
  expire_at               timestamptz not null default (now() + interval '24 hours'),
  created_at              timestamptz not null default now()
);

create index if not exists idx_telechargements_commande on telechargements(commande_id);

-- ── Sécurité : RLS activé, aucun accès public direct ──
-- Seul le backend (clé service_role, qui contourne RLS) peut lire/écrire.
-- Le frontend (clé publique) n'a donc aucun accès direct à ces tables.
alter table commandes enable row level security;
alter table telechargements enable row level security;
