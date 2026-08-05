const { supabaseAdmin } = require("../_lib/supabaseAdmin");
const { PRODUITS } = require("../_lib/produits");
const crypto = require("crypto");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }
  const { produit_id, email_client, telephone_client, moyen_paiement } = req.body || {};
  const produit = PRODUITS[produit_id];
  if (!produit) {
    return res.status(400).json({ error: "Produit inconnu" });
  }
  if (!["orange_money", "cinetpay"].includes(moyen_paiement)) {
    return res.status(400).json({ error: "Moyen de paiement invalide" });
  }
  if (!email_client && !telephone_client) {
    return res.status(400).json({ error: "Email ou téléphone requis" });
  }
  const reference = `JC-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
  const { data: commande, error } = await supabaseAdmin
    .from("commandes")
    .insert({
      reference,
      produit_id,
      produit_nom: produit.nom,
      email_client: email_client || null,
      telephone_client: telephone_client || null,
      montant: produit.prix,
      devise: "GNF",
      statut: "en_attente",
      moyen_paiement,
    })
    .select()
    .single();
  if (error) {
    console.error(error);
    return res.status(500).json({ error: "Erreur création commande" });
  }
  return res.status(200).json({ reference: commande.reference, commande_id: commande.id, montant: commande.montant });
};
