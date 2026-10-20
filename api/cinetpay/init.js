// POST /api/cinetpay/init
// Crée la commande (prix pris dans le catalogue serveur, jamais depuis le navigateur),
// puis démarre le paiement CinetPay et renvoie l'URL de la page de paiement.
const { supabaseAdmin } = require("../_lib/supabaseAdmin");
const { PRODUITS } = require("../_lib/produits");
const { getClient, paysDisponibles, normaliserTelephone, separerNom } = require("../_lib/cinetpayClient");
const { PAYS_CINETPAY, prixPour } = require("../_lib/devises");
const crypto = require("crypto");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Méthode non autorisée" });

  // Interrupteur de sécurité : tant que CINETPAY_ACTIF n'est pas "oui" dans Vercel,
  // aucun paiement automatique n'est démarré (le client est renvoyé vers Orange Money).
  if (process.env.CINETPAY_ACTIF !== "oui") {
    return res.status(503).json({ error: "Paiement automatique indisponible" });
  }

  const { produit_id, email_client, telephone_client, nom_client, pays: paysDemande } = req.body || {};
  const PAYS = String(paysDemande || "GN").toUpperCase();

  const produit = PRODUITS[produit_id];
  if (!produit) return res.status(400).json({ error: "Produit inconnu" });
  if (produit.type !== "guide") {
    return res.status(400).json({ error: "Ce produit ne se paie pas par CinetPay" });
  }
  if (!email_client || !/^\S+@\S+\.\S+$/.test(String(email_client).trim())) {
    return res.status(400).json({ error: "Email valide requis" });
  }

  const config = PAYS_CINETPAY[PAYS];
  if (!config) return res.status(400).json({ error: "Pays non pris en charge" });
  try {
    if (!paysDisponibles().includes(PAYS)) {
      return res.status(400).json({ error: "Paiement automatique pas encore disponible dans ce pays" });
    }
  } catch (e) {
    console.error("cinetpay/init : configuration", e && e.message);
    return res.status(502).json({ error: "Impossible de démarrer le paiement" });
  }
  const DEVISE = config.devise;
  const montant = prixPour(produit.prix, PAYS); // converti côté serveur, jamais depuis le navigateur

  const email = String(email_client).trim();
  const telephone = normaliserTelephone(telephone_client);
  const { prenom, nom } = separerNom(nom_client);

  // ≤ 27 caractères (CinetPay: 30 max). Le code pays sert au webhook pour interroger le bon compte.
  const reference = `JC-${PAYS}-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

  const { data: commande, error } = await supabaseAdmin.from("commandes").insert({
    reference,
    produit_id,
    produit_nom: produit.nom,
    email_client: email,
    telephone_client: telephone_client ? String(telephone_client).trim() : null,
    montant,
    devise: DEVISE,
    statut: "en_attente",
    moyen_paiement: "cinetpay",
  }).select().single();

  if (error) {
    console.error("cinetpay/init : création commande", error);
    return res.status(500).json({ error: "Erreur création commande" });
  }

  const base = (process.env.APP_URL || "https://jecodeboutique.com").replace(/\/$/, "");

  try {
    const requete = {
      currency: DEVISE,
      merchantTransactionId: reference,
      amount: montant,
      lang: "fr",
      designation: produit.nom.slice(0, 100),
      clientEmail: email,
      clientFirstName: prenom,
      clientLastName: nom,
      successUrl: `${base}/?paiement=reussi&ref=${reference}`,
      failedUrl: `${base}/?paiement=echec`,
      notifyUrl: `${base}/api/webhooks/cinetpay`,
      channel: "PUSH", // obligatoire pour CinetPay (valeur de l'exemple officiel avec redirection)
    };
    if (telephone) requete.clientPhoneNumber = telephone;

    const paiement = await getClient().payment.initialize(requete, PAYS);

    if (!paiement.paymentUrl) {
      console.error("cinetpay/init : pas d'URL de paiement", paiement.details);
      return res.status(502).json({ error: "Paiement indisponible" });
    }

    // On garde le jeton de notification pour vérifier le webhook plus tard.
    // Si les colonnes n'existent pas encore, on continue : le webhook vérifie de toute façon
    // le statut directement auprès de CinetPay.
    const { error: erreurMaj } = await supabaseAdmin.from("commandes").update({
      cinetpay_notify_token: paiement.notifyToken,
      cinetpay_transaction_id: paiement.transactionId,
    }).eq("id", commande.id);
    if (erreurMaj) console.warn("cinetpay/init : jeton non enregistré", erreurMaj.message);

    return res.status(200).json({ paymentUrl: paiement.paymentUrl, reference });
  } catch (e) {
    console.error("cinetpay/init : échec initialize", e && e.message, e && e.apiStatus, e && e.description);
    const reponse = { error: "Impossible de démarrer le paiement" };
    // Mode diagnostic : ajoutez CINETPAY_DEBUG=oui dans Vercel pour voir la vraie cause
    // (jamais de clé ni de mot de passe dans ce message). À retirer une fois le problème réglé.
    if (process.env.CINETPAY_DEBUG === "oui") {
      reponse.detail = String((e && e.message) || e);
      if (e && e.apiStatus) reponse.apiStatus = e.apiStatus;
      if (e && e.description) reponse.description = e.description;
    }
    return res.status(502).json(reponse);
  }
};
