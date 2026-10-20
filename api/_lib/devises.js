// Pays acceptés pour le paiement automatique CinetPay (fichier: api/_lib/devises.js).
// Le prix de référence est en GNF (catalogue). Pour les autres pays, il est converti avec "taux"
// (1 GNF = taux × devise locale). ⚠ Taux INDICATIFS : ajustez-les ici quand vous voulez.
// Un pays n'est utilisable que si CINETPAY_API_KEY_<CODE> et CINETPAY_API_PASSWORD_<CODE>
// existent dans Vercel (une paire d'identifiants par pays, à demander à CinetPay).
const PAYS_CINETPAY = {
  GN: { nom: "Guinée",         devise: "GNF", taux: 1,     arrondi: 1 },
  CI: { nom: "Côte d'Ivoire",  devise: "XOF", taux: 0.065, arrondi: 5 },
  SN: { nom: "Sénégal",        devise: "XOF", taux: 0.065, arrondi: 5 },
  ML: { nom: "Mali",           devise: "XOF", taux: 0.065, arrondi: 5 },
  BF: { nom: "Burkina Faso",   devise: "XOF", taux: 0.065, arrondi: 5 },
  BJ: { nom: "Bénin",          devise: "XOF", taux: 0.065, arrondi: 5 },
  TG: { nom: "Togo",           devise: "XOF", taux: 0.065, arrondi: 5 },
  CM: { nom: "Cameroun",       devise: "XAF", taux: 0.065, arrondi: 5 },
  CD: { nom: "RD Congo",       devise: "CDF", taux: 0.27,  arrondi: 50 },
};

function prixPour(prixGNF, codePays) {
  const p = PAYS_CINETPAY[codePays];
  if (!p) return null;
  return Math.max(p.arrondi, Math.ceil((prixGNF * p.taux) / p.arrondi) * p.arrondi);
}

module.exports = { PAYS_CINETPAY, prixPour };
