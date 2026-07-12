const { supabaseAdmin } = require("../_lib/supabaseAdmin");
const { filigranerPdf } = require("../_lib/traiterCommande");
const { PRODUITS } = require("../_lib/produits");

module.exports = async function handler(req, res) {
  const { token } = req.query;

  const { data: telechargement, error } = await supabaseAdmin
    .from("telechargements")
    .select("*, commandes(*)")
    .eq("token", token)
    .single();

  if (error || !telechargement) {
    return res.status(404).send("Lien invalide ou introuvable.");
  }
  if (new Date(telechargement.expire_at) < new Date()) {
    return res.status(410).send("Ce lien a expiré (validité 24h). Contacte-nous sur WhatsApp pour un nouveau lien.");
  }
  if (telechargement.utilisations_restantes <= 0) {
    return res.status(410).send("Ce lien a atteint son nombre maximal de téléchargements. Contacte-nous sur WhatsApp.");
  }

  const commande = telechargement.commandes;
  const produit = PRODUITS[commande.produit_id];
  if (!produit || !produit.fichier) {
    return res.status(404).send("Aucun fichier associé à cette commande.");
  }

  // Récupère le PDF original depuis le stockage privé Supabase
  const { data: fichierOriginal, error: errStorage } = await supabaseAdmin
    .storage
    .from("guides-prives")
    .download(produit.fichier);

  if (errStorage) {
    console.error(errStorage);
    return res.status(500).send("Erreur lors de la récupération du fichier.");
  }

  const pdfBytes = Buffer.from(await fichierOriginal.arrayBuffer());
  const texteFiligrane = `${commande.email_client || commande.telephone_client} · Réf. ${commande.reference}`;
  const pdfFiligrane = await filigranerPdf(pdfBytes, texteFiligrane);

  // Décrémente le compteur d'usages
  await supabaseAdmin
    .from("telechargements")
    .update({ utilisations_restantes: telechargement.utilisations_restantes - 1 })
    .eq("token", token);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${produit.fichier}"`);
  return res.status(200).send(Buffer.from(pdfFiligrane));
};
