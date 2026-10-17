// POST /api/webhooks/cinetpay
// CinetPay appelle cette URL quand un paiement est terminé (réussi ou échoué).
// On ne fait JAMAIS confiance au contenu de la notification seule : on redemande le statut
// à CinetPay avec nos identifiants avant de livrer quoi que ce soit.
const { supabaseAdmin } = require("../_lib/supabaseAdmin");
const { PRODUITS } = require("../_lib/produits");
const { traiterCommandeConfirmee } = require("../_lib/traiterCommande");
const { getClient, PAYS } = require("../_lib/cinetpayClient");
const { parseNotification, verifyNotification } = require("cinetpay-js");

async function trouverCommande(notification) {
  if (notification.merchantTransactionId) {
    const { data } = await supabaseAdmin.from("commandes").select("*")
      .eq("reference", notification.merchantTransactionId).maybeSingle();
    if (data) return data;
  }
  const { data } = await supabaseAdmin.from("commandes").select("*")
    .eq("cinetpay_transaction_id", notification.transactionId).maybeSingle();
  return data || null;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Méthode non autorisée");

  // 1. Lire la notification
  let notification;
  try {
    notification = parseNotification(req.body);
  } catch (e) {
    return res.status(400).send("Notification invalide");
  }

  // 2. Retrouver notre commande
  let commande;
  try {
    commande = await trouverCommande(notification);
  } catch (e) {
    console.error("webhook cinetpay : lecture commande", e && e.message);
    return res.status(500).send("Erreur serveur");
  }
  if (!commande) return res.status(404).send("Commande inconnue");
  if (commande.moyen_paiement !== "cinetpay") return res.status(400).send("Commande non CinetPay");

  // 3. Vérifier le jeton de notification (s'il a été enregistré à l'initialisation)
  const attendu = commande.cinetpay_notify_token;
  if (attendu) {
    const recu = String(notification.notifyToken || "");
    if (!verifyNotification(String(attendu), recu)) {
      return res.status(401).send("Jeton invalide");
    }
  }

  // 4. Déjà traitée : on répond OK sans rien refaire (protège contre le rejeu)
  if (commande.statut === "paye") return res.status(200).send("Déjà traitée");

  // 5. Confirmer le statut directement auprès de CinetPay
  let statut;
  try {
    statut = await getClient().payment.getStatus(notification.transactionId, PAYS);
  } catch (e) {
    console.error("webhook cinetpay : getStatus", e && e.message);
    return res.status(500).send("Vérification impossible, réessayez"); // CinetPay réessaiera
  }

  if (statut.status !== "SUCCESS") {
    // Échec, en attente ou expiré : rien à livrer. On acquitte pour ne pas être rappelé inutilement.
    return res.status(200).send("Paiement non abouti");
  }
  if (statut.merchantTransactionId && statut.merchantTransactionId !== commande.reference) {
    console.error("webhook cinetpay : références différentes", statut.merchantTransactionId, commande.reference);
    return res.status(400).send("Référence incohérente");
  }

  const produit = PRODUITS[commande.produit_id];
  if (!produit || !produit.fichier) {
    console.error("webhook cinetpay : produit sans fichier", commande.produit_id);
    return res.status(500).send("Produit non livrable automatiquement");
  }

  // 6. Réserver la commande : une seule notification peut passer de "en_attente" à "paye".
  //    Si deux notifications arrivent en même temps, la seconde ne trouve plus de ligne à modifier.
  const { data: reclamee, error: erreurReserve } = await supabaseAdmin.from("commandes")
    .update({ statut: "paye", updated_at: new Date().toISOString() })
    .eq("id", commande.id)
    .neq("statut", "paye")
    .select()
    .maybeSingle();
  if (erreurReserve) {
    console.error("webhook cinetpay : réservation commande", erreurReserve.message);
    return res.status(500).send("Erreur serveur");
  }
  if (!reclamee) return res.status(200).send("Déjà traitée");

  // 7. Livrer (e-mail + lien de téléchargement), exactement comme marquer-paye.js
  try {
    const resultat = await traiterCommandeConfirmee(reclamee);
    if (!resultat.emailEnvoye) {
      // Payé mais e-mail non parti : à traiter à la main (lien dans les journaux Vercel)
      console.error("webhook cinetpay : PAYÉ MAIS E-MAIL NON ENVOYÉ", reclamee.reference, resultat.lienTelechargement);
    }
  } catch (e) {
    console.error("webhook cinetpay : livraison échouée", reclamee.reference, e && e.message);
    // On remet la commande en attente pour que le nouvel essai de CinetPay puisse la livrer
    await supabaseAdmin.from("commandes")
      .update({ statut: "en_attente", updated_at: new Date().toISOString() })
      .eq("id", commande.id);
    return res.status(500).send("Livraison échouée");
  }

  return res.status(200).send("OK");
};
