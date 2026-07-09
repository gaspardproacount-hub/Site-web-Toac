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
| `DATABASE_URL` | `.env` (Vercel ou local) | Voir § 5bis. |
| `RESEND_API_KEY` | `.env` | Voir § 6. |
| Champs du formulaire d'adhésion | `src/components/AdhesionForm.tsx` | Les champs proposés (état civil, contact d'urgence, certificat médical…) sont ceux d'un bulletin d'adhésion classique de club de triathlon. Le Google Form externe n'étant pas accessible publiquement pour être recopié à l'identique, ajustez les champs ici si le bureau utilise des intitulés différents. |

## 4. Importer les adhérents (CSV) et gérer les comptes

Les dossiers adhérents vivent dans la base de données du site (table `members`, voir § 5bis) — jamais
dans le dépôt git. `src/data/accounts.sample.json` ne contient que des données factices (comptes de
démo), utilisées tant que `src/data/accounts.json` n'existe pas.

### Importer le Google Sheets "Dossiers-2025-2026" (en local, jamais via git)

Cette commande écrit directement dans la base de données de production : les données personnelles
réelles ne transitent jamais par le dépôt.

1. Sur votre ordinateur, clonez le dépôt, `npm install`, puis copiez dans `.env.local` la **même**
   valeur de `DATABASE_URL` que celle configurée sur Vercel (Settings → Environment Variables).
2. Dans Google Sheets : `Fichier → Télécharger → Valeurs séparées par des virgules (.csv)`.
3. Lancez :
   ```bash
   npm run import-csv -- chemin/vers/export.csv
   ```
   Chaque ligne est identifiée par le nom + prénom (l'export du club n'a pas de colonne email) :
   relancer la commande après une mise à jour du Sheets met à jour les dossiers existants au lieu de
   les dupliquer. Les lignes de total/pourcentage en haut de l'export sont ignorées automatiquement.

Colonnes attendues (l'ordre n'importe pas, en-têtes insensibles à la casse/accents) : `Nom`, `Prénom`,
`statut`, `Pay asso` (paiement cotisation), `Formulaire adhésion`, `justif` (justificatif tarif réduit),
`Chèque` (→ caution), `GG Group`, `Whatsapp`, `Licence demandée`, `Licence payée` (valeurs `Oui`/`Non`).
`Email` est optionnel.

Une fois importés, les dossiers apparaissent dans **Espace Adhérents → Bureau → Dossiers adhérents**, où
chaque case (paiement, caution, groupe Google, WhatsApp, licence, justificatif…) peut être cochée/décochée
directement sur le site — les nouvelles demandes d'adhésion en ligne (page **Nous rejoindre**) y
apparaissent aussi automatiquement, sans réimport, et sont rapprochées du bon dossier par le nom.

### Gérer les comptes de connexion

```bash
npm run accounts -- list
npm run accounts -- add jean.dupont motdepasse "Jean Dupont" member 1
npm run accounts -- passwd jean.dupont nouveaumotdepasse
npm run accounts -- remove jean.dupont

# Génère automatiquement un compte (identifiant + mot de passe aléatoire)
# pour chaque adhérent de la base qui n'en a pas encore :
npm run accounts -- bulk-from-members
```

Le `[memberId]` passé à `add`/généré par `bulk-from-members` est l'identifiant numérique du dossier dans
la base (visible dans **Bureau → Dossiers adhérents**). `bulk-from-members` a aussi besoin de
`DATABASE_URL` dans `.env.local` (voir ci-dessus). Il affiche en clair, une seule fois dans le terminal,
les identifiants générés à transmettre aux adhérents (rien n'est jamais stocké en clair : seul le hash
bcrypt est écrit dans `accounts.json`).

## 5. Paiement en ligne Monetico

Le parcours d'adhésion (page **Nous rejoindre**) construit un formulaire de paiement scellé (HMAC-SHA1) côté
serveur (`src/lib/monetico.ts`), sans jamais exposer la clé secrète au navigateur.

Le formulaire d'adhésion est **unique** : informations, choix du tarif (plein ou réduit, avec justificatif
si besoin) et paiement (cotisation + caution de 100€ obligatoire, prélevés ensemble) en une seule étape.
L'inscription (table `inscriptions`/`members`) est enregistrée dès l'envoi, mais le dossier n'est marqué
**payé** (`paiement` + `caution` cochés automatiquement) qu'à réception de la confirmation Monetico — c'est
la notification serveur-à-serveur qui valide réellement l'adhésion, pas le simple envoi du formulaire.

1. Récupérez dans l'espace commerçant Monetico du club : `TPE`, code société, clé HMAC.
2. Renseignez `MONETICO_TPE`, `MONETICO_CODE_SOCIETE`, `MONETICO_CLE_HMAC`, `MONETICO_URL_RETOUR` (URL de
   base de votre site) dans vos variables d'environnement.
3. Laissez `MONETICO_TEST_MODE=true` pour valider le parcours sur la plateforme de test Monetico.
4. Dans l'espace commerçant Monetico, configurez l'**URL de notification serveur-à-serveur (IPN)** vers :
   `https://votre-domaine/api/monetico/retour`.
5. Une fois validé en test, passez `MONETICO_TEST_MODE=false` (ou supprimez la variable) pour la production.

Les montants (plein tarif, tarif réduit, caution, stages) sont dans `src/content/tarifs.ts` — à ajuster
une fois confirmés par le bureau.

⚠️ L'ordre exact des champs du retour Monetico (fonction `verifyReturnSeal`) doit être confirmé avec la
documentation fournie par Monetico avant la mise en production réelle (voir le commentaire dans
`src/lib/monetico.ts`).

### Justificatif tarif réduit (Vercel Blob)

Le fichier uploadé (carte étudiant, attestation Pôle emploi, badge Airbus…) est stocké sur Vercel Blob et
lié au dossier adhérent.

1. Dans votre projet Vercel → onglet **Storage** → **Create Database** → **Blob** (offre gratuite).
2. Vercel ajoute automatiquement `BLOB_READ_WRITE_TOKEN` à votre projet.

Sans cette variable, le formulaire fonctionne quand même : le justificatif n'est simplement pas conservé
(seule la case "tarif réduit demandé" est enregistrée).

## 5bis. Base de données — commandes, adhésions & dossiers

Le site enregistre automatiquement, dans une vraie base de données, ce qui demandait auparavant une
manipulation manuelle :

- **Les commandes Monetico** : à chaque paiement, Monetico notifie le site en arrière-plan
  (`/api/monetico/retour`) ; cette notification est désormais enregistrée dans une table `commandes`
  au lieu de simplement être journalisée. Fini le fichier Excel à ouvrir/copier-coller depuis l'email
  Monetico : tout est consultable dans **Espace Adhérents → Bureau → Commandes Monetico**.
- **Les demandes d'adhésion** : la page **Nous rejoindre** propose désormais un formulaire d'adhésion
  directement sur le site (à la place du Google Form externe). Chaque envoi est enregistré dans une
  table `inscriptions`, consultable dans **Espace Adhérents → Bureau → Demandes d'adhésion**.
- **Les dossiers adhérents** : table `members`, alimentée par l'import CSV (§ 4) et automatiquement
  complétée par chaque nouvelle demande d'adhésion en ligne. Consultable et **modifiable** (cases à
  cocher) dans **Espace Adhérents → Bureau → Dossiers adhérents**.

### Mise en place (5 minutes, gratuit)

1. Sur [vercel.com](https://vercel.com), dans votre projet → onglet **Storage** → **Create Database** →
   choisissez un Postgres (Neon, offre gratuite). Vercel y ajoute automatiquement une variable
   `DATABASE_URL` (ou `POSTGRES_URL`) à votre projet.
   - Alternative sans Vercel : créez un projet gratuit sur [neon.tech](https://neon.tech) ou
     [supabase.com](https://supabase.com) et copiez la chaîne de connexion Postgres fournie.
2. Renseignez `DATABASE_URL` dans vos variables d'environnement (Vercel : **Settings → Environment
   Variables** ; en local : `.env.local`).
3. C'est tout : les tables (`commandes`, `inscriptions`, `members`) sont créées automatiquement au
   premier appel, aucune migration à lancer à la main.

Tant que `DATABASE_URL` n'est pas configurée, le site continue de fonctionner normalement (paiement,
formulaire d'adhésion), mais les pages **Bureau → Commandes** / **Bureau → Demandes d'adhésion** /
**Bureau → Dossiers adhérents** affichent un message d'installation au lieu du tableau, et rien n'est
conservé.

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

### Rendre tout le site privé (avant mise en ligne publique)

Sans passer par un plan payant Vercel : renseignez `SITE_PASSWORD` dans les variables d'environnement.
Une fois définie, le navigateur demande un identifiant (n'importe lequel) et ce mot de passe avant
d'afficher quoi que ce soit sur le site. Laissez la variable vide (ou supprimez-la) pour repasser le site
en public. La notification de paiement Monetico (`/api/monetico/retour`) reste volontairement accessible
sans mot de passe, sinon les paiements en cours échoueraient.

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
