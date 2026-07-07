# Site web du TOAC Triathlon

Refonte complète du site du TOAC Triathlon (Toulouse), avec Next.js (App Router) + Tailwind CSS,
et un espace adhérents protégé côté serveur.

## 1. Lancer le projet en local

```bash
npm install
cp .env.example .env.local   # puis renseignez au moins SESSION_SECRET (voir plus bas)
npm run dev
```

Le site est disponible sur http://localhost:3000.

Générer un `SESSION_SECRET` aléatoire :

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Compte de démonstration (espace adhérents)

Tant que vous n'avez pas importé vos propres comptes (voir § 4), deux comptes de démo sont disponibles
(définis dans `src/data/accounts.sample.json`, données factices) :

| Identifiant | Mot de passe      | Rôle   |
| ----------- | ----------------- | ------ |
| `demo`      | `toac-demo-2026`  | membre |
| `bureau`    | `toac-admin-2026` | admin (vue bureau, tous les dossiers) |

⚠️ Changez ces mots de passe / remplacez ces comptes avant la mise en production.

## 2. Déployer sur Vercel

1. Poussez ce dépôt sur GitHub.
2. Sur [vercel.com](https://vercel.com), importez le dépôt (le framework Next.js est détecté automatiquement).
3. Dans **Settings → Environment Variables**, renseignez toutes les variables listées dans `.env.example`
   (`SESSION_SECRET`, `MONETICO_TPE`, `MONETICO_CODE_SOCIETE`, `MONETICO_CLE_HMAC`, `MONETICO_URL_RETOUR`,
   `MONETICO_TEST_MODE`, et éventuellement `RESEND_API_KEY` / `RESEND_FROM_EMAIL`).
4. Déployez. Le plan gratuit ("Hobby") de Vercel suffit pour ce site.

Important : `src/data/members.json` et `src/data/accounts.json` (les vraies données adhérents) sont
ignorés par git — ils ne seront donc **pas** présents sur Vercel après un déploiement via git. Deux options :

- **Solution simple (club de cette taille)** : importez le CSV et générez les comptes en local (§ 4), puis
  committez ces fichiers dans un **dépôt privé** uniquement si vous acceptez ce compromis, en connaissance du
  risque RGPD si le dépôt venait à être rendu public un jour.
- **Solution recommandée** : gardez le dépôt public/sans données réelles, et à la place, uploadez
  `members.json` / `accounts.json` directement depuis l'onglet **Deployments → Source** de Vercel, ou migrez
  ces deux fichiers vers un stockage clé-valeur (Vercel KV) le jour où le club voudra automatiser les mises à
  jour sans repasser par un déploiement.

## 3. Remplacer les placeholders

| Placeholder | Emplacement | Action |
| --- | --- | --- |
| ~~`LOGO_TOAC`~~ | `public/logo-toac.png` | ✅ Fait — logo officiel intégré dans la Navbar et le Footer. |
| Photos (📷) | `src/components/ImagePlaceholder.tsx`, utilisé sur toutes les pages | Remplacer chaque `<ImagePlaceholder>` par un `<Image>` `next/image` pointant vers les vraies photos du club. |
| `TARIFS_A_CONFIRMER` | `src/content/tarifs.ts`, `src/content/faq.ts` | Mettre à jour les montants (en centimes) une fois confirmés par le bureau. |
| `URL_INSCRIPTION_TDL` | `src/app/triathlons-du-lauragais/page.tsx` (lien "S'inscrire à la course") | Remplacer le `href="#"` par l'URL d'inscription officielle. |
| `LIEN_COMMANDE_TENUES` | `src/app/le-club/vie-du-club/page.tsx` | Remplacer par le lien réel de commande des tenues. |
| Documents PDF | `src/app/espace-adherents/documents/page.tsx` | Remplacer les `href="#"` par les vrais fichiers (à héberger dans `public/documents/` par ex.). |
| Coordonnées des lieux | `src/content/lieux.ts` | Les latitudes/longitudes sont des approximations ; à vérifier/ajuster précisément si besoin. |
| Variables Monetico | `.env` (Vercel ou local) | Voir § 5. |
| `RESEND_API_KEY` | `.env` | Voir § 6. |

## 4. Importer les adhérents (CSV) et gérer les comptes

Aucune donnée personnelle réelle n'est présente dans le dépôt : `src/data/members.sample.json` et
`src/data/accounts.sample.json` ne contiennent que des données factices, utilisées tant que
`src/data/members.json` / `src/data/accounts.json` n'existent pas.

### Importer le Google Sheets "Dossiers-2025-2026"

1. Dans Google Sheets : `Fichier → Télécharger → Valeurs séparées par des virgules (.csv)`.
2. Lancez :
   ```bash
   npm run import-csv -- chemin/vers/export.csv
   ```
   Cela génère `src/data/members.json` (ignoré par git).

Colonnes attendues (l'ordre n'importe pas, en-têtes insensibles à la casse/accents) : `Prénom`, `Nom`,
`Email`, `Statut`, `Paiement`, `Formulaire d'adhésion`, `Chèque`, `Groupe Google`, `WhatsApp`,
`Licence demandée`, `Licence payée` (valeurs `Oui`/`Non`).

### Gérer les comptes de connexion

```bash
npm run accounts -- list
npm run accounts -- add jean.dupont motdepasse "Jean Dupont" member m-001
npm run accounts -- passwd jean.dupont nouveaumotdepasse
npm run accounts -- remove jean.dupont

# Génère automatiquement un compte (identifiant + mot de passe aléatoire)
# pour chaque adhérent de members.json qui n'en a pas encore :
npm run accounts -- bulk-from-members
```

`bulk-from-members` affiche en clair, une seule fois dans le terminal, les identifiants générés à transmettre
aux adhérents (rien n'est jamais stocké en clair : seul le hash bcrypt est écrit dans `accounts.json`).

## 5. Paiement en ligne Monetico

Le parcours d'adhésion (page **Nous rejoindre**) construit un formulaire de paiement scellé (HMAC-SHA1) côté
serveur (`src/lib/monetico.ts`), sans jamais exposer la clé secrète au navigateur.

1. Récupérez dans l'espace commerçant Monetico du club : `TPE`, code société, clé HMAC.
2. Renseignez `MONETICO_TPE`, `MONETICO_CODE_SOCIETE`, `MONETICO_CLE_HMAC`, `MONETICO_URL_RETOUR` (URL de
   base de votre site) dans vos variables d'environnement.
3. Laissez `MONETICO_TEST_MODE=true` pour valider le parcours sur la plateforme de test Monetico.
4. Dans l'espace commerçant Monetico, configurez l'**URL de notification serveur-à-serveur (IPN)** vers :
   `https://votre-domaine/api/monetico/retour`.
5. Une fois validé en test, passez `MONETICO_TEST_MODE=false` (ou supprimez la variable) pour la production.

⚠️ L'ordre exact des champs du retour Monetico (fonction `verifyReturnSeal`) doit être confirmé avec la
documentation fournie par Monetico avant la mise en production réelle (voir le commentaire dans
`src/lib/monetico.ts`).

## 6. Formulaire de contact (emails)

Sans configuration, les messages du formulaire de contact sont simplement journalisés côté serveur (mode
démo, visible dans les logs Vercel). Pour un envoi réel par email :

1. Créez un compte sur [resend.com](https://resend.com) et une clé API.
2. Renseignez `RESEND_API_KEY` (et `RESEND_FROM_EMAIL`, une adresse vérifiée sur votre domaine Resend).

## 7. Sécurité de l'espace adhérents

- Authentification par identifiant/mot de passe (bcrypt), session signée (HMAC) dans un cookie **httpOnly**
  (jamais lisible en JavaScript côté client).
- Protection au niveau du **proxy** Next.js (`src/proxy.ts`, anciennement "middleware") : toute tentative
  d'accès direct par URL à `/espace-adherents/*` sans session valide redirige vers `/connexion`.
- Double vérification côté serveur dans chaque page protégée (défense en profondeur).
- Les données adhérents (`src/data/members.json`, `src/data/accounts.json`) ne sont jamais servies au
  client : elles sont lues côté serveur (Server Components / Route Handlers) et seul le rendu HTML final
  (ou les champs strictement nécessaires) atteint le navigateur.

## 8. Placeholders restants — récapitulatif

- Toutes les photos (`ImagePlaceholder`)
- `TARIFS_A_CONFIRMER` (montants de cotisation)
- `URL_INSCRIPTION_TDL` (lien d'inscription aux Triathlons du Lauragais)
- `LIEN_COMMANDE_TENUES`
- Documents PDF de l'espace adhérents
- Variables d'environnement Monetico et Resend
- Coordonnées GPS précises des lieux d'entraînement (approximations à vérifier)
- `favicon.ico` (retiré du dépôt initial — vous pouvez en générer un à partir de `public/logo-toac.png`)
- `package-lock.json` (non inclus dans ce commit — régénérez-le avec `npm install`)
