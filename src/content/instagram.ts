/**
 * Configuration du fil Instagram affiché sur la page d'accueil.
 *
 * ── Pour connecter VOTRE compte ────────────────────────────────────────
 * 1. Remplacez `handle` par le nom exact du compte du club (sans le @).
 * 2. Pour afficher de VRAIS posts en direct : collez leurs liens dans
 *    `posts` (bouton "..." → "Copier le lien" sur chaque publication).
 *    Exemple : "https://www.instagram.com/p/Cxxxxxxxxxx/"
 *    Les posts s'affichent alors directement depuis Instagram.
 * 3. Tant que `posts` est vide, le site montre 3 vignettes de secours
 *    (images public/images/insta-1, insta-2, insta-3) qui renvoient vers
 *    le compte Instagram — pratique en attendant.
 */
export const INSTAGRAM = {
  // Compte affiché (sans @). Le club a confirmé @triathlonsdulauragais ;
  // remplacez-le si vous avez un compte "TOAC Tri" distinct.
  handle: "triathlonsdulauragais",

  get profileUrl() {
    return `https://www.instagram.com/${this.handle}/`;
  },

  // Liens des posts à afficher en direct (laisser vide pour les vignettes).
  posts: [] as string[],

  // Vignettes de secours (fichiers dans public/images/) affichées si `posts`
  // est vide. Déposez insta-1.jpg/.png, insta-2…, insta-3… pour les remplir.
  fallbackTiles: ["insta-1", "insta-2", "insta-3"],
};
