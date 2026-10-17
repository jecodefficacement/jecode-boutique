// Client CinetPay partagé par api/cinetpay/init.js et api/webhooks/cinetpay.js.
// Les identifiants viennent UNIQUEMENT des variables d'environnement Vercel.
const { CinetPayClient } = require("cinetpay-js");

const PAYS = "GN"; // Guinée
const DEVISE = "GNF";

let client = null;
function getClient() {
  if (client) return client;
  const apiKey = process.env.CINETPAY_API_KEY_GN;
  const apiPassword = process.env.CINETPAY_API_PASSWORD_GN;
  if (!apiKey || !apiPassword) {
    throw new Error("Identifiants CinetPay manquants (CINETPAY_API_KEY_GN / CINETPAY_API_PASSWORD_GN)");
  }
  client = new CinetPayClient({ credentials: { [PAYS]: { apiKey, apiPassword } } });
  return client;
}

// "+224 6XX XXX XXX", "6XXXXXXXX", "224 6XX..." -> "+2246XXXXXXXX" (format exigé par CinetPay)
function normaliserTelephone(t) {
  if (!t) return null;
  let s = String(t).replace(/[\s().-]/g, "");
  if (s.startsWith("00")) s = "+" + s.slice(2);
  if (/^\+\d{8,15}$/.test(s)) return s;
  if (/^224\d{9}$/.test(s)) return "+" + s;
  if (/^6\d{8}$/.test(s)) return "+224" + s;
  return null;
}

// "Mamadou Diallo" -> { prenom: "Mamadou", nom: "Diallo" } (2 caractères minimum chacun)
function separerNom(complet) {
  const morceaux = String(complet || "").trim().split(/\s+/).filter(Boolean);
  let prenom = morceaux[0] || "Client";
  let nom = morceaux.slice(1).join(" ") || "JeCode";
  if (prenom.length < 2) prenom = prenom + "x";
  if (nom.length < 2) nom = nom + "x";
  return { prenom, nom };
}

module.exports = { getClient, normaliserTelephone, separerNom, PAYS, DEVISE };
