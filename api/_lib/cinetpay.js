const CINETPAY_API = "https://api-checkout.cinetpay.com/v2";

/**
 * Initialise un paiement CinetPay et renvoie l'URL de paiement à laquelle
 * rediriger le client.
 */
async function initierPaiementCinetPay({ transaction_id, montant, devise, description, client }) {
  const payload = {
    apikey: process.env.CINETPAY_API_KEY,
    site_id: process.env.CINETPAY_SITE_ID,
    transaction_id,
    amount: montant,
    currency: devise, // "USD" pour l'international, "GNF" possible aussi
    description,
    customer_name: client.nom || "Client",
    customer_surname: client.prenom || "JeCode",
    customer_email: client.email || "client@jecodeboutique.com",
    customer_phone_number: client.telephone || "000000000",
    notify_url: `${process.env.SITE_URL}/api/cinetpay/notify`,
    return_url: `${process.env.SITE_URL}/paiement-statut.html?ref=${transaction_id}`,
    channels: "ALL", // laisse le client choisir carte / Wave / mobile money sur la page CinetPay
    lang: "fr",
  };

  const res = await fetch(`${CINETPAY_API}/payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();

  if (data.code !== "201") {
    throw new Error(`Erreur init CinetPay: ${data.message || JSON.stringify(data)}`);
  }

  return data.data.payment_url;
}

/**
 * Vérifie le vrai statut d'une transaction directement auprès de CinetPay.
 * ⚠️ Ne JAMAIS faire confiance au contenu du webhook seul — toujours revérifier ici.
 */
async function verifierTransactionCinetPay(transaction_id) {
  const res = await fetch(`${CINETPAY_API}/payment/check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      apikey: process.env.CINETPAY_API_KEY,
      site_id: process.env.CINETPAY_SITE_ID,
      transaction_id,
    }),
  });
  const data = await res.json();
  return data; // data.data.status : "ACCEPTED" | "REFUSED" | "PENDING" | ...
}

module.exports = { initierPaiementCinetPay, verifierTransactionCinetPay };
