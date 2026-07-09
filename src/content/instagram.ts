/**
 * Configuration du fil Instagram affiché sur la page d'accueil.
 *
 * ┌────────────────────────────────────────────────────────────────┐
 * │  AFFICHAGE AUTOMATIQUE DU COMPTE + DES POSTS (recommandé)             │
 * └────────────────────────────────────────────────────────────────┘
 * Le site se « connecte » à Instagram via un service connecteur gratuit qui
 * se met à jour tout seul. Étapes (une seule fois, ~3 min) :
 *
 *   1. Allez sur un de ces services gratuits et créez un compte :
 *        • SnapWidget  → https://snapwidget.com   (le plus simple)
 *        • Behold      → https://behold.so
 *        • LightWidget → https://lightwidget.com
 *   2. Connectez le compte Instagram du club (@triathlonsdulauragais) et
 *      choisissez un affichage en grille.
 *   3. Le service vous donne un « code d'intégration » (embed). Deux cas :
 *
 *      • Si c'est une balise <iframe ...>  → copiez UNIQUEMENT l'adresse
 *        qui suit src="..."  et collez-la dans `widgetIframeSrc` ci-dessous.
 *        (ex. SnapWidget : "https://snapwidget.com/embed/1234567")
 *
 *      • Si c'est un bloc avec <script ...> → copiez TOUT le code et
 *        collez-le (entre guillemets inversés `) dans `widgetEmbedHtml`.
 *
 *   4. Enregistrez, redéployez : le fil s'affiche et se met à jour seul.
 *
 * Tant que rien n'est configuré ci-dessous, le site affiche un bouton
 * « Suivez-nous » + 3 vignettes de secours (voir plus bas).
 */
export const INSTAGRAM = {
  // Compte affiché (sans @).
  handle: "toactriathlon",

  get profileUrl() {
    return `https://www.instagram.com/${this.handle}/`;
  },

  // ── Connecteur automatique (remplissez L'UN des deux) ──────────────────
  // Adresse src="..." d'un widget iframe (SnapWidget, LightWidget…).
  widgetIframeSrc: "",
  // OU code d'intégration complet d'un widget à base de <script> (Behold, Elfsight…).
  widgetEmbedHtml: `<!-- Elfsight Instagram Feed | Untitled Instagram Feed -->
<script src="https://elfsightcdn.com/platform.js" async></script>
<div class="elfsight-app-3165caf2-9928-43b0-a36a-a55a94d71964" data-elfsight-app-lazy></div>`,

  // ── Repli manuel (utilisé seulement si aucun connecteur ci-dessus) ─────
  // Liens de posts précis à afficher (bouton « … » → « Copier le lien »).
  posts: [] as string[],
  // Vignettes de secours (fichiers public/images/insta-1, insta-2, insta-3).
  fallbackTiles: ["insta-1", "insta-2", "insta-3"],
};
