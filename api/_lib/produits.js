// Catalogue produits côté serveur.
// Le prix ne doit JAMAIS venir du frontend : sinon un client pourrait
// modifier la requête réseau et payer 100 GNF pour un produit à 150 000 GNF.
// Cette liste doit rester synchronisée avec les produits affichés sur le site.
const PRODUITS = {
  "g1": { nom: "Parler a l'IA pour obtenir des resultats", prix: 0, type: "guide", fichier: "g1.pdf" }, // Gratuit (promo lancement — prix normal 25 000 GNF)
  "g2": { nom: "50 Instructions IA qui changent la vie", prix: 50000, type: "guide", fichier: "g2.pdf" },
  "g3": { nom: "Étudier avec l'IA", prix: 75000, type: "guide", fichier: "g3.pdf" },
  "g4": { nom: "Fais ta demande avec un site web", prix: 200000, type: "guide", fichier: "g4.pdf" },
  "f1": { nom: "Formation intensive — Création de boutique en ligne", prix: 1000000, type: "formation", fichier: null },
  "pack-complet": { nom: "Pack complet (4 guides)", prix: 270000, type: "pack", fichier: null },
};
module.exports = { PRODUITS };
