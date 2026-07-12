// Catalogue produits côté serveur.
// Le prix ne doit JAMAIS venir du frontend : sinon un client pourrait
// modifier la requête réseau et payer 100 GNF pour un produit à 150 000 GNF.
// Cette liste doit rester synchronisée avec les produits affichés sur le site.
const PRODUITS = {
  "g1": { nom: "50 Instructions IA qui changent la vie", prix: 50000, type: "guide", fichier: "g1.pdf" },
  "g2": { nom: "Étudier avec l'IA", prix: 75000, type: "guide", fichier: "g2.pdf" },
  "g3": { nom: "Créer ton site web avec l'IA en 1 jour", prix: 150000, type: "guide", fichier: "g3.pdf" },
  "f1": { nom: "Formation intensive — Algo · C · C++", prix: 500000, type: "formation", fichier: null },
  "pack-complet": { nom: "Pack complet (3 guides)", prix: 620000, type: "pack", fichier: null },
};

module.exports = { PRODUITS };
