# À faire plus tard — site TOAC Triathlon

Sujets identifiés en cours de route, qui ne bloquent rien aujourd'hui mais qu'il
faudra traiter. Rien ici n'est urgent ; l'ordre est indicatif.

## Ménage à court terme

- [ ] **Supprimer le dossier de décharge musculation créé pour les tests**
      (ligne dans la table `musculation_decharges` + les deux fichiers
      correspondants dans le store Blob). Il n'existe aucune interface de
      suppression pour l'instant : à faire directement en base, ou en ajoutant
      un bouton « Supprimer » dans Espace Adhérents → Bureau → Décharges
      musculation.
- [ ] **Supprimer la route de dépannage `/api/diagnostic`** une fois le
      formulaire musculation stabilisé, puis retirer `DIAGNOSTIC_KEY` des
      variables Vercel. La page équivalente réservée au bureau
      (`/espace-adherents/bureau/diagnostic`) peut rester.
- [ ] **Passer les dépôts GitHub en privé** : `Site-web-Toac`,
      `Site-web-Les-Acolytes`, `site-web-Devanture`, `Site-web-eklat`,
      `Site-web-D-mo-Noisette` (`Devanture-cms` l'est déjà). Cela se règle sur
      GitHub, pas sur Vercel : dépôt → Settings → tout en bas, Danger Zone →
      Change repository visibility. Ce n'est pas ce qui protège les données
      (voir ci-dessous), mais cela réduit la surface exposée.
      **À faire par le propriétaire du compte `gaspardproacount-hub`** : le
      compte `toactri` y est collaborateur avec les droits d'écriture mais pas
      d'administration, et GitHub réserve la visibilité aux administrateurs.

## RGPD — avant d'ouvrir l'espace adhérents à de vraies données

Le consentement recueilli dans le formulaire est nécessaire mais pas suffisant.
À mettre en place avant de collecter des données d'adhérents pour de bon :

- [ ] **Durée de conservation** définie et appliquée pour chaque type de donnée.
      Cas le plus sensible : les certificats médicaux (données de santé), à
      purger à l'expiration de leur validité de 3 ans. Aujourd'hui rien n'est
      supprimé automatiquement.
- [ ] **Procédure d'effacement** : savoir répondre à un adhérent qui demande la
      suppression de ses données (base + fichiers du store Blob).
- [ ] **Minimisation** : ne conserver que ce qui sert réellement à gérer
      l'adhésion et l'accès à la salle.
- [ ] **Registre des traitements** et mention d'information à jour sur la page
      Confidentialité.

## Architecture

- [ ] **Décider où vivent les données adhérents.** Elles sont aujourd'hui dans
      Postgres/Neon (`DATABASE_URL`), séparées de Supabase qui porte le CMS. Le
      dashboard Devanture ne peut donc pas les afficher en l'état. Deux voies :
      migrer ces tables vers Supabase (recommandé — l'authentification, les
      rôles `site_members` et les RLS y sont déjà, une seule base à sécuriser),
      ou exposer une API protégée côté `site-web-toac`. La migration est
      d'autant plus simple à faire tôt qu'aucune donnée réelle n'est encore
      stockée.
- [ ] **Règle à tenir sur Supabase** : aucune table contenant des données
      personnelles ne doit avoir de policy `public read`, uniquement
      `if member`. C'est la seule chose qui protège réellement ces données — la
      clé `anon` est publique par conception, puisqu'elle est envoyée au
      navigateur par le dashboard CMS.
- [ ] **Rôles dans `site_members`** (par ex. `admin` / `lecteur`) pour ouvrir la
      consultation des dossiers à quelques membres du bureau sans leur donner
      les droits d'écriture.

## Hébergement Vercel

- [ ] **Sortir de la dépendance au compte du HUB.** Les projets vivent
      aujourd'hui sur un compte tiers, ce qui oblige à demander un code d'accès
      temporaire à chaque intervention. Transférer `site-web-toac` (et à terme
      `devanture-cms`) vers un compte propre au club.
      Le même sujet existe côté GitHub : les dépôts appartiennent au compte
      `gaspardproacount-hub`, où `toactri` n'est que collaborateur — d'où
      l'impossibilité de changer la visibilité ou les réglages du dépôt.
      Transférer les dépôts vers `toactri` réglerait les deux d'un coup, mais
      le transfert doit lui aussi être lancé par le propriétaire actuel, et il
      faudra ensuite reconnecter l'intégration GitHub dans Vercel.
- [ ] **Vérifier l'adéquation du plan.** Le plan Hobby n'autorise pas
      d'inviter des collaborateurs et réserve l'usage à un cadre non
      commercial. À confirmer auprès de Vercel pour un usage associatif, sinon
      prévoir un passage en Pro.
