// Client Supabase côté serveur — utilise la clé service_role (secrète).
// Ne JAMAIS importer ce fichier depuis du code qui tourne dans le navigateur.
const { createClient } = require("@supabase/supabase-js");

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

module.exports = { supabaseAdmin };
