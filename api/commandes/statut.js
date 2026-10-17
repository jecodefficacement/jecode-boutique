const { supabaseAdmin } = require("../_lib/supabaseAdmin");

module.exports = async function handler(req, res) {
  const { ref } = req.query;
  if (!ref) {
    return res.status(400).json({ error: "Référence manquante" });
  }

  const { data: commande, error } = await supabaseAdmin
    .from("commandes")
    .select("reference, statut, produit_nom, telechargements(token, expire_at, utilisations_restantes)")
    .eq("reference", ref)
    .single();

  if (error || !commande) {
    return res.status(404).json({ error: "Commande introuvable" });
  }

  const lienTelechargement = commande.telechargements?.[0]
    ? `${process.env.SITE_URL}/api/download/${commande.telechargements[0].token}`
    : null;

  return res.status(200).json({
    statut: commande.statut,
    produit_nom: commande.produit_nom,
    lienTelechargement,
  });
};
