alter table public.commandes
  add column if not exists cinetpay_notify_token text,
  add column if not exists cinetpay_transaction_id text;