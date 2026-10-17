const { supabaseAdmin } = require("../_lib/supabaseAdmin");
const { verifierTransactionCinetPay } = require("../_lib/cinetpay");
const { traiterCommandeConfirmee } = require("../_lib/traiterCommande");

module.exports = async function handler(req, res) {
  // CinetPay ping parfois l'URL en GET juste pour vérifier qu'elle répond — on répond 200 sans rien faire
  if (req.method === "GET") {
    return res.status(200).send("OK");
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const transaction_id = req.body?.cpm_trans_id || req.body?.transaction_id;
  if (!transaction_id) {
    return res.status(400).json({ error: "transaction_id manquant" });
  }

  // Récupère la commande correspondante
  const { data: commande, error } = await supabaseAdmin
    .from("commandes")
    .select("*")
    .eq("reference", transaction_id)
    .single();

  if (error || !commande) {
    return res.status(404).json({ error: "Commande introuvable" });
  }

  // Évite un double traitement si le webhook est appelé plusieurs fois (CinetPay peut réessayer)
  if (commande.statut === "paye") {
    return res.status(200).json({ ok: true, message: "Déjà traité" });
  }

  // ⚠️ Sécurité anti-fraude : on ne fait JAMAIS confiance au contenu du webhook seul.
  // On revérifie le vrai statut directement auprès de CinetPay avec nos propres identifiants.
  let verification;
  try {
    verification = await verifierTransactionCinetPay(transaction_id);
  } catch (e) {
    console.error("Erreur vérification CinetPay:", e);
    return res.status(500).json({ error: "Erreur de vérification" });
  }

  const statutReel = verification?.data?.status; // "ACCEPTED" | "REFUSED" | "PENDING" | ...

  if (statutReel === "ACCEPTED") {
    await supabaseAdmin
      .from("commandes")
      .update({ statut: "paye", provider_ref: transaction_id, updated_at: new Date().toISOString() })
      .eq("id", commande.id);

    try {
      await traiterCommandeConfirmee({ ...commande, statut: "paye" });
    } catch (e) {
      console.error("Erreur traitement commande confirmée:", e);
    }
    return res.status(200).json({ ok: true });
  }

  if (statutReel === "REFUSED") {
    await supabaseAdmin
      .from("commandes")
      .update({ statut: "echoue", updated_at: new Date().toISOString() })
      .eq("id", commande.id);
    return res.status(200).json({ ok: true, statut: "echoue" });
  }

  // PENDING ou autre : on ne change rien, CinetPay renverra une notification plus tard
  return res.status(200).json({ ok: true, statut: "en_attente" });
};
