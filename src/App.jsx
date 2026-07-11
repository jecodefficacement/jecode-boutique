import { useState, useEffect } from "react";
import AOS from "aos";

// ─────────────────────────────────────────
//  CONFIG
// ─────────────────────────────────────────
const WHATSAPP    = "224624144006";
const ORANGE_NUM  = "624 144 006";
const ORANGE_NOM  = "JeCode";
const GA_ID        = "G-V75T1W3PH4";

// ─────────────────────────────────────────
//  COULEURS
// ─────────────────────────────────────────
const C = {
  bg:       "#0D0020",
  bgCard:   "#160030",
  bgCard2:  "#1C003C",
  border:   "#2E0060",
  violet:   "#46008C",
  violet2:  "#7C3AED",
  rose:     "#CC0066",
  roseDark: "#990050",
  yellow:   "#FFD700",
  green:    "#25D366",
  white:    "#FFFFFF",
  text:     "#F0E8FF",
  muted:    "#9B7EC8",
  light:    "#E8D8FF",
};

const gradMain  = `linear-gradient(135deg, ${C.violet} 0%, ${C.rose} 100%)`;
const gradHero  = `linear-gradient(145deg, #1A0040 0%, #0D0020 50%, #2D0050 100%)`;
const gradYellow= `linear-gradient(135deg, #FFD700, #FFA500)`;

// ─────────────────────────────────────────
//  DONNÉES PRODUITS
// ─────────────────────────────────────────
const GUIDES = [
  {
    id: "g1",
    type: "guide",
    emoji: "⚡",
    tag: "BEST-SELLER",
    tagColor: C.yellow,
    tagBg: "#2D2000",
    titre: "50 Instructions IA qui changent la vie",
    sous_titre: "Prompts prêts à copier-coller",
    prix: 50000,
    couleur: C.violet2,
    gradient: `linear-gradient(135deg, #46008C, #7C3AED)`,
    accroche: "Arrête de perdre du temps à formuler tes demandes. 50 instructions testées, prêtes à l'emploi — pour la rédaction, les études, le business et les réseaux.",
    pour_qui: "Étudiants · Professionnels · Entrepreneurs",
    points: [
      "13 prompts Rédaction & Communication",
      "10 prompts Études & Apprentissage",
      "10 prompts Business & Entrepreneuriat",
      "10 prompts Organisation & Productivité",
      "7 prompts Contenu & Réseaux Sociaux",
      "Compatible ChatGPT, Claude, Gemini",
    ],
  },
  {
    id: "g2",
    type: "guide",
    emoji: "🎓",
    tag: "POPULAIRE",
    tagColor: "#34D399",
    tagBg: "#002218",
    titre: "Étudier avec l'IA",
    sous_titre: "Méthodes de révision & apprentissage rapide",
    prix: 75000,
    couleur: "#0D9488",
    gradient: `linear-gradient(135deg, #0D9488, #0891B2)`,
    accroche: "6 méthodes concrètes pour réviser 2x plus vite, mieux retenir et comprendre en profondeur — pour lycéens, étudiants et professionnels.",
    pour_qui: "Lycéens · Étudiants · Autodidactes",
    points: [
      "Méthode 1 : Résumer et simplifier un cours",
      "Méthode 2 : Créer ses fiches automatiquement",
      "Méthode 3 : Quiz personnalisés illimités",
      "Méthode 4 : Comprendre par la méthode Feynman",
      "Méthode 5 : Planifier ses révisions",
      "Méthode 6 : Maîtriser NotebookLM",
    ],
  },
  {
    id: "g3",
    type: "guide",
    emoji: "🌐",
    tag: "PREMIUM",
    tagColor: "#FB923C",
    tagBg: "#2D1000",
    titre: "Créer ton site web avec l'IA en 1 jour",
    sous_titre: "De zéro à un site pro en ligne",
    prix: 150000,
    couleur: C.rose,
    gradient: `linear-gradient(135deg, #CC0066, #9333EA)`,
    accroche: "Sans coder. Sans payer un développeur. En une journée. Un vrai site professionnel, déployé et accessible dans le monde entier.",
    pour_qui: "Entrepreneurs · Freelances · Tout le monde",
    points: [
      "Étape 1 : Installer Claude, VS Code, GitHub, Vercel",
      "Étape 2 : Définir le contenu de ton site",
      "Étape 3 : Générer tout le code avec Claude",
      "Étape 4 : Personnaliser et prévisualiser",
      "Étape 5 : Publier sur GitHub",
      "Étape 6 : Mettre en ligne — lien prêt !",
    ],
  },
];

const FORMATION = {
  id: "f1",
  type: "formation",
  emoji: "💻",
  tag: "PRÉSENTIEL",
  tagColor: C.yellow,
  tagBg: "#2D2000",
  titre: "Formation intensive — Algo · C · C++",
  sous_titre: "Cours de vacances · 1 mois · Conakry",
  prix: 500000,
  couleur: C.violet,
  gradient: gradMain,
  accroche: "De zéro à la programmation orientée objet en 1 mois. Pour bacheliers et étudiants L1/L2 qui veulent maîtriser les vraies bases du code.",
  pour_qui: "Bacheliers · L1 Informatique · L2 Informatique",
  points: [
    "Algorithmique — logique et résolution de problèmes",
    "Langage C — syntaxe, pointeurs, structures, mémoire",
    "C++ — POO, classes, héritage, polymorphisme",
    "Projets pratiques chaque semaine",
    "Évaluation finale + attestation",
    "Kountia OAS · Conakry · 3 Août – 3 Sept 2026",
  ],
};

// ─────────────────────────────────────────
//  COMPOSANTS UI
// ─────────────────────────────────────────
function Tag({ children, color, bg }) {
  return (
    <span style={{
      background: bg, color, borderRadius: 6,
      padding: "3px 9px", fontSize: "0.68rem",
      fontWeight: 800, letterSpacing: 1, textTransform: "uppercase",
    }}>{children}</span>
  );
}

function Divider() {
  return <div style={{ height: 1, background: C.border, margin: "3rem 0" }} />;
}

// ─────────────────────────────────────────
//  FAQ — ACCORDÉON
// ─────────────────────────────────────────
function FaqItem({ question, reponse, index }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      data-aos="fade-up"
      data-aos-delay={Math.min(index, 4) * 60}
      style={{ borderBottom: `1px solid ${C.border}` }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        style={{
          width: "100%", background: "none", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 12, padding: "1.2rem 0", textAlign: "left",
        }}
      >
        <span style={{ fontWeight: 700, color: C.text, fontSize: "0.92rem" }}>{question}</span>
        <span style={{
          flexShrink: 0, color: C.yellow, fontSize: "1.1rem", fontWeight: 700,
          transform: open ? "rotate(45deg)" : "rotate(0deg)",
          transition: "transform .25s ease",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 22, height: 22,
        }}>
          +
        </span>
      </button>
      <div style={{
        display: "grid",
        gridTemplateRows: open ? "1fr" : "0fr",
        transition: "grid-template-rows .3s ease",
      }}>
        <div style={{ overflow: "hidden" }}>
          <div style={{ color: C.muted, fontSize: "0.85rem", lineHeight: 1.65, paddingBottom: "1.2rem" }}>
            {reponse}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
//  MODAL COMMANDE
// ─────────────────────────────────────────
function OrderModal({ produit, onClose }) {
  const [step, setStep]   = useState(1);
  const [form, setForm]   = useState({ nom: "", telephone: "", email: "", niveau: "" });
  const [errors, setErrors] = useState({});
  const isFormation = produit.type === "formation";

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: undefined })); };

  const validate = () => {
    const e = {};
    if (!form.nom.trim())       e.nom       = "Requis";
    if (!form.telephone.trim()) e.telephone = "Requis";
    if (isFormation && !form.niveau) e.niveau = "Requis";
    return e;
  };

  const handleNext = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setStep(2);
  };

  const ref = `JECODE-${produit.id.toUpperCase()}-${form.nom.split(" ")[0].toUpperCase()}`;

  const waMsg = isFormation
    ? encodeURIComponent(`Bonjour JeCode ! Je souhaite m'inscrire à la formation Algo·C·C++ (500 000 GNF).\n\nNom : ${form.nom}\nTéléphone : ${form.telephone}${form.email ? `\nEmail : ${form.email}` : ""}\nNiveau : ${form.niveau}\n\nMerci de confirmer ma place.`)
    : encodeURIComponent(`Bonjour JeCode ! Je viens de payer pour le guide "${produit.titre}" (${produit.prix.toLocaleString()} GNF).\n\nNom : ${form.nom}\nTéléphone : ${form.telephone}${form.email ? `\nEmail : ${form.email}` : ""}\nRéférence : ${ref}\n\nMerci de me confirmer la réception et m'envoyer le guide.`);

  const inputSx = (err) => ({
    width: "100%", padding: "0.75rem 1rem", borderRadius: 10,
    border: `1.5px solid ${err ? C.rose : C.border}`,
    background: "rgba(255,255,255,0.04)", color: C.white,
    fontSize: "0.92rem", outline: "none",
  });

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} className="modal-backdrop"
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div className="modal-pop" style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 22, padding: "2rem", maxWidth: 460, width: "100%", maxHeight: "92vh", overflowY: "auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: "0.72rem", color: C.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>
              {isFormation ? "INSCRIPTION" : "COMMANDER"}
            </div>
            <div style={{ color: C.text, fontWeight: 700, fontSize: "0.95rem", lineHeight: 1.3, maxWidth: 300 }}>{produit.titre}</div>
            <div style={{ color: C.yellow, fontWeight: 900, fontSize: "1.15rem", marginTop: 4, fontFamily: "'Space Grotesk', sans-serif" }}>
              {produit.prix.toLocaleString()} GNF
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: "1.4rem" }}>✕</button>
        </div>

        {/* Steps */}
        <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
          {(isFormation ? ["Tes infos", "Confirmation"] : ["Tes infos", "Paiement", "Confirmation"]).map((lbl, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center" }}>
              <div style={{ height: 3, borderRadius: 3, background: step > i ? produit.gradient : "rgba(255,255,255,0.08)", marginBottom: 4 }} />
              <div style={{ fontSize: "0.65rem", color: step === i+1 ? C.text : C.muted, fontWeight: step === i+1 ? 700 : 400 }}>{lbl}</div>
            </div>
          ))}
        </div>

        {/* STEP 1 — Infos */}
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ display: "block", color: C.muted, fontSize: "0.78rem", fontWeight: 600, marginBottom: 5 }}>Nom complet *</label>
              <input value={form.nom} onChange={e => set("nom", e.target.value)} placeholder="Ex : Mamadou Diallo" style={inputSx(errors.nom)} />
              {errors.nom && <p style={{ color: C.rose, fontSize: "0.74rem", marginTop: 3 }}>⚠ {errors.nom}</p>}
            </div>
            <div>
              <label style={{ display: "block", color: C.muted, fontSize: "0.78rem", fontWeight: 600, marginBottom: 5 }}>Téléphone *</label>
              <input value={form.telephone} onChange={e => set("telephone", e.target.value)} placeholder="+224 6XX XXX XXX" style={inputSx(errors.telephone)} />
              {errors.telephone && <p style={{ color: C.rose, fontSize: "0.74rem", marginTop: 3 }}>⚠ {errors.telephone}</p>}
            </div>
            <div>
              <label style={{ display: "block", color: C.muted, fontSize: "0.78rem", fontWeight: 600, marginBottom: 5 }}>Email (optionnel)</label>
              <input value={form.email} onChange={e => set("email", e.target.value)} placeholder="ton@email.com" style={inputSx(false)} />
            </div>
            {isFormation && (
              <div>
                <label style={{ display: "block", color: C.muted, fontSize: "0.78rem", fontWeight: 600, marginBottom: 5 }}>Niveau d'études *</label>
                <select value={form.niveau} onChange={e => set("niveau", e.target.value)} style={{ ...inputSx(errors.niveau), cursor: "pointer" }}>
                  <option value="">— Choisis ton niveau —</option>
                  <option value="Terminale (Bac)">Terminale (Bac)</option>
                  <option value="L1 Informatique">L1 Informatique</option>
                  <option value="L2 Informatique">L2 Informatique</option>
                  <option value="Autre">Autre</option>
                </select>
                {errors.niveau && <p style={{ color: C.rose, fontSize: "0.74rem", marginTop: 3 }}>⚠ {errors.niveau}</p>}
              </div>
            )}
            <button onClick={handleNext}
              style={{ width: "100%", background: produit.gradient, color: C.white, border: "none", borderRadius: 12, padding: "0.9rem", fontWeight: 800, cursor: "pointer", fontSize: "0.95rem", marginTop: 4 }}>
              Continuer →
            </button>
          </div>
        )}

        {/* STEP 2 — Paiement (guides seulement) */}
        {step === 2 && !isFormation && (
          <div>
            <div style={{ background: "rgba(255,215,0,0.06)", border: "1px solid rgba(255,215,0,0.18)", borderRadius: 14, padding: "1.2rem", marginBottom: 16 }}>
              <div style={{ color: C.yellow, fontWeight: 800, fontSize: "0.82rem", marginBottom: 12, letterSpacing: 0.5 }}>
                📱 PAIEMENT ORANGE MONEY
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  ["Montant", `${produit.prix.toLocaleString()} GNF`],
                  ["Numéro Orange Money", ORANGE_NUM],
                  ["Nom du bénéficiaire", ORANGE_NOM],
                  ["Référence", ref],
                ].map(([lbl, val]) => (
                  <div key={lbl}>
                    <div style={{ color: C.muted, fontSize: "0.75rem" }}>{lbl}</div>
                    <div style={{ color: val === `${produit.prix.toLocaleString()} GNF` ? C.yellow : C.white, fontWeight: 700, fontSize: "0.95rem" }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, borderRadius: 10, padding: "0.9rem", marginBottom: 18, fontSize: "0.82rem", color: C.muted, lineHeight: 1.65 }}>
              💡 Après le paiement, clique sur "J'ai payé" — un message WhatsApp s'ouvrira. Envoie-le pour confirmer et recevoir ton guide.
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setStep(1)}
                style={{ flex: 1, background: "rgba(255,255,255,0.06)", color: C.text, border: `1px solid ${C.border}`, borderRadius: 12, padding: "0.85rem", fontWeight: 700, cursor: "pointer", fontSize: "0.88rem" }}>
                ← Retour
              </button>
              <button onClick={() => setStep(3)}
                style={{ flex: 2, background: produit.gradient, color: C.white, border: "none", borderRadius: 12, padding: "0.85rem", fontWeight: 800, cursor: "pointer", fontSize: "0.88rem" }}>
                ✅ J'ai payé !
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 formation / STEP 3 guide — Confirmation */}
        {((step === 2 && isFormation) || (step === 3 && !isFormation)) && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 50, marginBottom: 14 }}>🎉</div>
            <h3 style={{ color: C.text, fontWeight: 900, fontSize: "1.3rem", marginBottom: 10 }}>
              {isFormation ? "Place réservée !" : `Merci ${form.nom.split(" ")[0]} !`}
            </h3>
            <p style={{ color: C.muted, lineHeight: 1.7, marginBottom: 22, fontSize: "0.88rem" }}>
              {isFormation
                ? "Clique ci-dessous pour envoyer ta demande d'inscription sur WhatsApp. Nous te confirmerons ta place et les modalités de paiement (500 000 GNF en présentiel)."
                : "Clique ci-dessous pour envoyer ta confirmation de paiement. Tu recevras ton guide PDF dès vérification."}
            </p>
            {isFormation && (
              <div style={{ background: "rgba(255,215,0,0.06)", border: "1px solid rgba(255,215,0,0.18)", borderRadius: 12, padding: "0.9rem", marginBottom: 18, fontSize: "0.82rem", color: C.muted, lineHeight: 1.6 }}>
                💡 Le paiement de <strong style={{ color: C.yellow }}>500 000 GNF</strong> se fait en présentiel le jour de l'inscription à Kountia OAS.
              </div>
            )}
            <a href={`https://wa.me/${WHATSAPP}?text=${waMsg}`} target="_blank" rel="noreferrer"
              style={{ display: "block", background: C.green, color: C.white, borderRadius: 14, padding: "1rem", fontWeight: 800, textDecoration: "none", fontSize: "0.95rem", marginBottom: 10 }}>
              💬 Envoyer sur WhatsApp
            </a>
            <button onClick={onClose}
              style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: "0.82rem" }}>
              Fermer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
//  CARTE PRODUIT
// ─────────────────────────────────────────
function ProductCard({ produit, onOrder, index = 0 }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      data-aos="fade-up"
      data-aos-delay={Math.min(index, 4) * 90}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: C.bgCard, border: `1px solid ${hovered ? produit.couleur : C.border}`,
        borderRadius: 20, overflow: "hidden", display: "flex", flexDirection: "column",
        transition: "border-color .2s, transform .2s",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        boxShadow: hovered ? `0 20px 40px rgba(0,0,0,0.4)` : "none",
      }}>
      {/* Bandeau coloré */}
      <div style={{ background: produit.gradient, padding: "1.6rem 1.5rem 1.3rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <span style={{ fontSize: 36 }}>{produit.emoji}</span>
          <Tag color={produit.tagColor} bg={produit.tagBg}>{produit.tag}</Tag>
        </div>
        <div style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.7rem", fontWeight: 600, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 4 }}>
          {produit.sous_titre}
        </div>
        <h3 style={{ color: C.white, fontWeight: 800, fontSize: "1rem", lineHeight: 1.35 }}>
          {produit.titre}
        </h3>
      </div>

      {/* Corps */}
      <div style={{ padding: "1.3rem 1.5rem", flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
        <p style={{ color: C.muted, fontSize: "0.85rem", lineHeight: 1.65 }}>{produit.accroche}</p>

        <div style={{ fontSize: "0.7rem", color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8 }}>
          Au programme
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {produit.points.map((p, i) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <span style={{ color: produit.couleur, fontSize: "0.75rem", marginTop: 2, flexShrink: 0 }}>✓</span>
              <span style={{ color: C.text, fontSize: "0.82rem", lineHeight: 1.5 }}>{p}</span>
            </div>
          ))}
        </div>

        <div style={{ fontSize: "0.72rem", color: C.muted, marginTop: 4 }}>
          👥 {produit.pour_qui}
        </div>

        <div style={{ marginTop: "auto", paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 12 }}>
            <span style={{ color: C.white, fontWeight: 900, fontSize: "1.4rem", fontFamily: "'Space Grotesk', sans-serif" }}>
              {produit.prix.toLocaleString()}
            </span>
            <span style={{ color: C.muted, fontSize: "0.82rem" }}>GNF</span>
            {produit.type === "guide" && (
              <span style={{ color: C.muted, fontSize: "0.72rem", marginLeft: 4 }}>• PDF immédiat</span>
            )}
          </div>
          <button onClick={() => onOrder(produit)} className="lift-hover"
            style={{
              width: "100%", background: produit.gradient, color: C.white,
              border: "none", borderRadius: 12, padding: "0.85rem",
              fontWeight: 800, cursor: "pointer", fontSize: "0.9rem",
              transition: "opacity .15s, transform .2s, box-shadow .2s",
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
            {produit.type === "formation" ? "Réserver ma place →" : "Commander →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
//  APP
// ─────────────────────────────────────────
// ─────────────────────────────────────────
//  ANALYTICS (GA4 — chargé uniquement après consentement)
// ─────────────────────────────────────────
function loadGoogleAnalytics() {
  if (document.getElementById("ga4-script")) return; // déjà chargé
  const s = document.createElement("script");
  s.id = "ga4-script";
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", GA_ID);
}

// ─────────────────────────────────────────
//  BANDEAU COOKIES
// ─────────────────────────────────────────
function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const choice = localStorage.getItem("jecode-cookie-consent");
    if (choice === "accepted") {
      loadGoogleAnalytics();
    } else if (choice !== "refused") {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("jecode-cookie-consent", "accepted");
    loadGoogleAnalytics();
    setVisible(false);
  };

  const refuse = () => {
    localStorage.setItem("jecode-cookie-consent", "refused");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-slide-in" style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 300,
      background: C.bgCard, borderTop: `1px solid ${C.border}`,
      padding: "1.1rem 1.5rem", display: "flex", gap: 16,
      alignItems: "center", justifyContent: "center", flexWrap: "wrap",
      boxShadow: "0 -8px 30px rgba(0,0,0,0.4)",
    }}>
      <p style={{ color: C.text, fontSize: "0.85rem", lineHeight: 1.6, margin: 0, maxWidth: 520 }}>
        🍪 Ce site utilise des cookies de mesure d'audience (Google Analytics) pour comprendre
        comment il est utilisé. Tu peux accepter ou refuser.{" "}
        <a href="/confidentialite.html" style={{ color: C.yellow }}>En savoir plus</a>
      </p>
      <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
        <button onClick={refuse}
          style={{ background: "rgba(255,255,255,0.06)", color: C.text, border: `1px solid ${C.border}`, borderRadius: 10, padding: "0.6rem 1.2rem", fontWeight: 700, cursor: "pointer", fontSize: "0.85rem" }}>
          Refuser
        </button>
        <button onClick={accept}
          style={{ background: gradMain, color: C.white, border: "none", borderRadius: 10, padding: "0.6rem 1.2rem", fontWeight: 800, cursor: "pointer", fontSize: "0.85rem" }}>
          Accepter
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [orderProduit, setOrderProduit] = useState(null);
  const [activeTab, setActiveTab]       = useState("tous");
  const [scrolled, setScrolled]         = useState(false);

  useEffect(() => {
    AOS.init({ duration: 700, easing: "ease-out-cubic", once: true, offset: 60 });
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    AOS.refresh();
  }, [activeTab]);

  const tabs = [
    { id: "tous",      label: "Tout voir" },
    { id: "guides",    label: "Guides PDF" },
    { id: "formation", label: "Formation" },
  ];

  const allProduits = [...GUIDES, FORMATION];
  const filtered = activeTab === "tous" ? allProduits
    : activeTab === "guides" ? GUIDES
    : [FORMATION];

  const packWa = encodeURIComponent("Bonjour JeCode ! Je veux commander le PACK COMPLET (3 guides + formation). Pouvez-vous me donner les détails ?");

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text }}>

      {/* ── NAV ── */}
      <nav style={{
        borderBottom: `1px solid ${C.border}`, padding: "1rem 1.5rem",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(13,0,32,0.95)", backdropFilter: "blur(12px)",
        boxShadow: scrolled ? "0 8px 24px rgba(0,0,0,0.35)" : "none",
        transition: "box-shadow .25s ease",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="logo-pulse" style={{ background: "rgba(255,255,255,0.08)", border: `1px solid ${C.border}`, borderRadius: 9, padding: "4px 10px", fontFamily: "monospace", fontWeight: 800, color: C.yellow, fontSize: "1rem" }}>
            &lt;/&gt;
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: "1rem", color: C.white, fontFamily: "'Space Grotesk', sans-serif" }}>JeCode</div>
            <div style={{ fontSize: "0.65rem", color: C.muted }}>Conakry · Guinée</div>
          </div>
        </div>
        <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer"
          style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(37,211,102,0.1)", border: "1px solid rgba(37,211,102,0.25)", color: C.green, borderRadius: 20, padding: "0.4rem 1rem", textDecoration: "none", fontSize: "0.8rem", fontWeight: 700 }}>
          💬 WhatsApp
        </a>
      </nav>

      {/* ── HERO ── */}
      <div style={{ background: gradHero, padding: "5rem 1.5rem 4rem", textAlign: "center", position: "relative", overflow: "hidden" }}>
        {/* Déco glows */}
        <div className="glow-float" style={{ position: "absolute", top: "10%", left: "10%", width: 300, height: 300, background: "radial-gradient(circle, rgba(70,0,140,0.25) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div className="glow-float-alt" style={{ position: "absolute", bottom: "10%", right: "10%", width: 250, height: 250, background: "radial-gradient(circle, rgba(204,0,102,0.2) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div data-aos="fade-down" data-aos-delay="0" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.2)", color: C.yellow, borderRadius: 20, padding: "0.3rem 1rem", fontSize: "0.72rem", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 24 }}>
          ✦ Formations & Guides IA · Conakry 2026
        </div>

        <h1 data-aos="fade-up" data-aos-delay="100" style={{ fontSize: "clamp(2.2rem, 6vw, 3.6rem)", fontWeight: 900, lineHeight: 1.1, marginBottom: 18, fontFamily: "'Space Grotesk', sans-serif" }}>
          Apprends à coder.<br />
          <span style={{ background: "linear-gradient(135deg, #FFD700, #FF6B00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Maîtrise l'IA.
          </span><br />
          <span style={{ background: gradMain, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Progresse vite.
          </span>
        </h1>

        <p data-aos="fade-up" data-aos-delay="200" style={{ color: C.muted, fontSize: "1rem", lineHeight: 1.75, maxWidth: 540, margin: "0 auto 2.5rem" }}>
          Des formations et guides pratiques créés à Conakry pour la jeunesse africaine —
          pour ceux qui veulent vraiment comprendre, créer et avancer.
        </p>

        {/* Stats */}
        <div data-aos="fade-up" data-aos-delay="300" style={{ display: "flex", gap: 40, justifyContent: "center", flexWrap: "wrap", marginBottom: 32 }}>
          {[["3", "Guides PDF"], ["1", "Formation présentielle"], ["500+", "Étudiants formés"]].map(([v, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontWeight: 900, fontSize: "1.8rem", fontFamily: "'Space Grotesk', sans-serif", color: C.white }}>{v}</div>
              <div style={{ color: C.muted, fontSize: "0.78rem" }}>{l}</div>
            </div>
          ))}
        </div>

        <div data-aos="fade-up" data-aos-delay="400" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="#produits" className="lift-hover"
            style={{ background: gradMain, color: C.white, borderRadius: 14, padding: "0.9rem 2rem", fontWeight: 800, textDecoration: "none", fontSize: "0.95rem" }}>
            Voir les formations →
          </a>
          <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer" className="lift-hover"
            style={{ background: "rgba(255,255,255,0.07)", color: C.text, border: `1px solid ${C.border}`, borderRadius: 14, padding: "0.9rem 2rem", fontWeight: 700, textDecoration: "none", fontSize: "0.95rem" }}>
            Nous contacter
          </a>
        </div>
      </div>

      {/* ── PRODUITS ── */}
      <div id="produits" style={{ maxWidth: 1100, margin: "0 auto", padding: "4rem 1.5rem" }}>
        <h2 data-aos="fade-up" style={{ textAlign: "center", fontWeight: 800, fontSize: "1.5rem", marginBottom: 8, fontFamily: "'Space Grotesk', sans-serif" }}>
          Nos formations & guides
        </h2>
        <p data-aos="fade-up" data-aos-delay="80" style={{ textAlign: "center", color: C.muted, marginBottom: 28, fontSize: "0.9rem" }}>
          Guides PDF · Paiement Orange Money · Livraison par WhatsApp
        </p>

        {/* Tabs */}
        <div data-aos="fade-up" data-aos-delay="140" style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 36 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{
                background: activeTab === t.id ? gradMain : "rgba(255,255,255,0.05)",
                color: activeTab === t.id ? C.white : C.muted,
                border: activeTab === t.id ? "none" : `1px solid ${C.border}`,
                borderRadius: 20, padding: "0.45rem 1.2rem",
                fontWeight: 700, cursor: "pointer", fontSize: "0.85rem",
                transition: "all .15s",
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Grille */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 20 }}>
          {filtered.map((p, i) => (
            <ProductCard key={p.id} produit={p} onOrder={setOrderProduit} index={i} />
          ))}
        </div>

        {/* ── PACK COMPLET ── */}
        <div data-aos="zoom-in" style={{ marginTop: 40, background: "linear-gradient(135deg, rgba(70,0,140,0.35), rgba(204,0,102,0.35))", border: "1px solid rgba(124,58,237,0.35)", borderRadius: 22, padding: "2.2rem", textAlign: "center" }}>
          <Tag color={C.yellow} bg="#2D2000">🔥 OFFRE SPÉCIALE</Tag>
          <h3 style={{ fontWeight: 900, fontSize: "1.4rem", margin: "12px 0 6px", fontFamily: "'Space Grotesk', sans-serif" }}>
            Pack Complet — Tout JeCode
          </h3>
          <p style={{ color: C.muted, fontSize: "0.88rem", marginBottom: 20, lineHeight: 1.65 }}>
            Les 3 guides PDF + la formation présentielle — tout ce qu'il faut pour maîtriser le code et l'IA.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", alignItems: "center", flexWrap: "wrap", marginBottom: 20 }}>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              {["50 000", "75 000", "150 000", "500 000"].map((p, i) => (
                <span key={i} style={{ color: C.muted, fontSize: "0.82rem", textDecoration: "line-through" }}>{p}</span>
              ))}
              <span style={{ color: C.muted, fontSize: "0.82rem" }}>GNF</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, justifyContent: "center", marginBottom: 24 }}>
            <span style={{ color: C.yellow, fontWeight: 900, fontSize: "2rem", fontFamily: "'Space Grotesk', sans-serif" }}>620 000</span>
            <span style={{ color: C.muted }}>GNF</span>
            <span style={{ background: "rgba(255,215,0,0.12)", color: C.yellow, borderRadius: 6, padding: "2px 8px", fontSize: "0.78rem", fontWeight: 700 }}>Économise 155 000 GNF</span>
          </div>
          <a href={`https://wa.me/${WHATSAPP}?text=${packWa}`} target="_blank" rel="noreferrer"
            style={{ display: "inline-block", background: gradMain, color: C.white, borderRadius: 14, padding: "1rem 2.5rem", fontWeight: 800, textDecoration: "none", fontSize: "1rem" }}>
            Commander le pack complet →
          </a>
        </div>
      </div>

      <Divider />

      {/* ── POURQUOI JECODE ── */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 1.5rem 4rem", textAlign: "center" }}>
        <h2 data-aos="fade-up" style={{ fontWeight: 800, fontSize: "1.4rem", marginBottom: 8, fontFamily: "'Space Grotesk', sans-serif" }}>
          Pourquoi JeCode ?
        </h2>
        <p data-aos="fade-up" data-aos-delay="80" style={{ color: C.muted, marginBottom: 36, fontSize: "0.9rem" }}>
          Créé à Conakry, pour la jeunesse guinéenne et africaine.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          {[
            ["🎯", "Contenu concret", "Des guides 100% pratiques — pas de théorie vide. Chaque page est actionnable."],
            ["🇬🇳", "Fait en Guinée", "Créé par quelqu'un qui comprend le contexte africain et ses réalités."],
            ["⚡", "Résultats rapides", "Tu peux appliquer ce que tu apprends le jour même de l'achat."],
            ["💬", "Support WhatsApp", "Des questions après l'achat ? On répond. Tu n'es pas seul."],
          ].map(([e, t, d], i) => (
            <div key={t} data-aos="fade-up" data-aos-delay={i * 90} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: "1.4rem", textAlign: "left" }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{e}</div>
              <div style={{ fontWeight: 700, fontSize: "0.9rem", color: C.white, marginBottom: 6 }}>{t}</div>
              <div style={{ color: C.muted, fontSize: "0.82rem", lineHeight: 1.6 }}>{d}</div>
            </div>
          ))}
        </div>
      </div>

      <Divider />

      {/* ── FAQ ── */}
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 1.5rem 4rem" }}>
        <h2 data-aos="fade-up" style={{ textAlign: "center", fontWeight: 800, fontSize: "1.3rem", marginBottom: 28, fontFamily: "'Space Grotesk', sans-serif" }}>
          Questions fréquentes
        </h2>
        {[
          ["Comment je reçois mon guide PDF ?", "Après le paiement Orange Money, envoie ta confirmation sur WhatsApp avec la référence. Tu reçois ton PDF dans l'heure."],
          ["La formation présentielle, c'est quand ?", "Du 3 Août au 3 Septembre 2026 à Kountia OAS, Conakry. Le paiement de 500 000 GNF se fait en présentiel."],
          ["Les guides fonctionnent avec quelle IA ?", "Tous les guides sont compatibles avec ChatGPT, Claude et Gemini — tous gratuits."],
          ["Est-ce que je peux partager les guides ?", "Non. Chaque guide est pour usage personnel uniquement. La revente est interdite."],
          ["J'ai une question avant d'acheter ?", "Écris-nous sur WhatsApp — on répond rapidement."],
        ].map(([q, a], i) => (
          <FaqItem key={i} question={q} reponse={a} index={i} />
        ))}
      </div>

      {/* ── FOOTER ── */}
      <div data-aos="fade" style={{ borderTop: `1px solid ${C.border}`, padding: "2.5rem 1.5rem" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: 20, justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ background: "rgba(255,255,255,0.08)", border: `1px solid ${C.border}`, borderRadius: 9, padding: "4px 10px", fontFamily: "monospace", fontWeight: 800, color: C.yellow, fontSize: "1rem" }}>
              &lt;/&gt;
            </div>
            <div>
              <div style={{ fontWeight: 800, color: C.white, fontFamily: "'Space Grotesk', sans-serif" }}>JeCode</div>
              <div style={{ color: C.muted, fontSize: "0.7rem" }}>© 2026 · Conakry, Guinée</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer"
              style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(37,211,102,0.1)", border: "1px solid rgba(37,211,102,0.25)", color: C.green, borderRadius: 20, padding: "0.45rem 1rem", textDecoration: "none", fontSize: "0.82rem", fontWeight: 700 }}>
              💬 +224 624 144 006
            </a>
            <a href="https://reservation-azure.vercel.app" target="_blank" rel="noreferrer"
              style={{ color: C.muted, fontSize: "0.82rem", display: "flex", alignItems: "center", textDecoration: "none" }}>
              Site de réservation →
            </a>
          </div>
        </div>
        <div style={{ maxWidth: 900, margin: "1.2rem auto 0", display: "flex", gap: 18, flexWrap: "wrap", fontSize: "0.76rem" }}>
          <a href="/mentions-legales.html" style={{ color: C.muted, textDecoration: "none" }}>Mentions légales</a>
          <a href="/confidentialite.html" style={{ color: C.muted, textDecoration: "none" }}>Confidentialité</a>
        </div>
      </div>

      {/* MODAL */}
      {orderProduit && <OrderModal produit={orderProduit} onClose={() => setOrderProduit(null)} />}

      <CookieBanner />
    </div>
  );
}
