// ⚠️ ENDPOINT DE TEST UNIQUEMENT.
// Simule la confirmation d'un paiement pour tester le pipeline (email + PDF + lien)
// sans attendre Orange Money ou CinetPay. Protégé par un secret partagé.
// À restreindre ou supprimer avant un usage en production réelle à grande échelle.
const { supabaseAdmin } = require("../_lib/supabaseAdmin");
const { traiterCommandeConfirmee } = require("../_lib/traiterCommande");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const secret = req.headers["x-test-secret"];
  if (secret !== process.env.TEST_WEBHOOK_SECRET) {
    return res.status(401).json({ error: "Non autorisé" });
  }

  const { reference } = req.body || {};
  if (!reference) {
    return res.status(400).json({ error: "Référence de commande requise" });
  }

  const { data: commande, error } = await supabaseAdmin
    .from("commandes")
    .update({ statut: "paye", updated_at: new Date().toISOString() })
    .eq("reference", reference)
    .select()
    .single();

  if (error || !commande) {
    return res.status(404).json({ error: "Commande introuvable" });
  }

  try {
    const resultat = await traiterCommandeConfirmee(commande);
    return res.status(200).json({ ok: true, ...resultat });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
};
