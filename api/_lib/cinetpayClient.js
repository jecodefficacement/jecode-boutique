// Client CinetPay partagé par api/cinetpay/init.js et api/webhooks/cinetpay.js (fichier: api/_lib/cinetpayClient.js).
// Identifiants UNIQUEMENT via variables Vercel : CINETPAY_API_KEY_<PAYS> / CINETPAY_API_PASSWORD_<PAYS>
// (ex. _GN, _CI, _SN). Seuls les pays dont les deux variables existent sont activés.
const { CinetPayClient } = require("cinetpay-js");
const { PAYS_CINETPAY } = require("./devises");

let client = null;
let paysActifs = [];

function getClient() {
  if (client) return client;
  const credentials = {};
  for (const code of Object.keys(PAYS_CINETPAY)) {
    const apiKey = process.env[`CINETPAY_API_KEY_${code}`];
    const apiPassword = process.env[`CINETPAY_API_PASSWORD_${code}`];
    if (apiKey && apiPassword) credentials[code] = { apiKey, apiPassword };
  }
  paysActifs = Object.keys(credentials);
  if (!paysActifs.length) throw new Error("Aucun identifiant CinetPay configuré (CINETPAY_API_KEY_GN ...)");
  client = new CinetPayClient({ credentials, forceIPv4: true });
  return client;
}

function paysDisponibles() {
  getClient();
  return paysActifs;
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

module.exports = { getClient, paysDisponibles, normaliserTelephone, separerNom };
