const { PDFDocument, rgb, degrees, StandardFonts } = require("pdf-lib");
const { supabaseAdmin } = require("./supabaseAdmin");
const { resend } = require("./resend");
const { PRODUITS } = require("./produits");

const SITE_URL = process.env.SITE_URL || "https://jecode-boutique.vercel.app";

/**
 * Ajoute un filigrane discret (référence + email) sur chaque page d'un PDF.
 */
async function filigranerPdf(pdfBytes, texteFiligrane) {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();

  for (const page of pages) {
    const { width, height } = page.getSize();
    // Filigrane diagonal, semi-transparent, répété
    page.drawText(texteFiligrane, {
      x: width / 2 - 140,
      y: height / 2,
      size: 11,
      font,
      color: rgb(0.6, 0.6, 0.6),
      opacity: 0.28,
      rotate: degrees(35),
    });
    // Petite mention discrète en bas de page aussi
    page.drawText(texteFiligrane, {
      x: 20,
      y: 14,
      size: 7,
      font,
      color: rgb(0.5, 0.5, 0.5),
      opacity: 0.5,
    });
  }

  return pdfDoc.save();
}

/**
 * Appelé une seule fois qu'un paiement est confirmé (par un webhook Orange ou CinetPay).
 * Génère le PDF filigrané, crée un lien de téléchargement à usage limité, envoie l'email.
 */
async function traiterCommandeConfirmee(commande) {
  const produit = PRODUITS[commande.produit_id];

  // 1) Créer le lien de téléchargement sécurisé (3 usages, 24h)
  const { data: telechargement, error: errToken } = await supabaseAdmin
    .from("telechargements")
    .insert({ commande_id: commande.id })
    .select()
    .single();

  if (errToken) throw new Error(`Erreur création token: ${errToken.message}`);

  const lienTelechargement = `${SITE_URL}/api/download/${telechargement.token}`;

  // 2) Email de confirmation avec le lien
  const { data: emailData, error: emailError } = await resend.emails.send({
    from: "JeCode <commandes@jecodeboutique.com>",
    to: commande.email_client,
    subject: `Ta commande JeCode est confirmée — ${produit.nom}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Merci pour ta commande 🎉</h2>
        <p>Ton paiement pour <strong>${produit.nom}</strong> a bien été confirmé.</p>
        ${
          produit.fichier
            ? `<p><a href="${lienTelechargement}" style="display:inline-block;background:#7C3AED;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Télécharger mon guide</a></p>
               <p style="color:#888;font-size:13px;">Ce lien est valable 24h et limité à 3 téléchargements.</p>`
            : `<p>On te contacte très vite sur WhatsApp pour organiser la suite.</p>`
        }
        <p style="color:#888;font-size:12px;margin-top:24px;">Référence de commande : ${commande.reference}</p>
      </div>
    `,
  });

  if (emailError) {
    // On ne bloque pas le téléchargement si l'email échoue, mais on trace l'erreur clairement
    console.error("Erreur envoi email Resend:", emailError);
    return { lienTelechargement, emailEnvoye: false, emailError: emailError.message || emailError };
  }

  return { lienTelechargement, emailEnvoye: true };
}

module.exports = { traiterCommandeConfirmee, filigranerPdf };
