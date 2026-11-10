# My To Do

Application personnelle Nuxt/Vue et SQLite. La capture et la gestion des tâches sont complétées par M1 « Classer et retrouver » : catégories libres et navigation directe. M2 de l’organisation (priorités, échéances et filtres) reste à implémenter sur autorisation. Les documents du [workflow](ai-workflow/GUIDE_NOUVEAU_PROJET.md), du [produit](documentation/PROJECT_BRIEF.md) et des [fondations](documentation/PROJECT_FOUNDATION.md) restent les références.

## Prérequis et installation

Node **24.14.0** et pnpm **10.33.0** ; versions et compatibilités détaillées dans [Développement](documentation/DEVELOPPEMENT.md).

```bash
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
```

## Contrôles

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm test:e2e
pnpm check:persistence
pnpm check:recovery
```

Vitest couvre les règles métier et SQLite temporaire ; Playwright utilise le serveur compilé et une base temporaire. `test:e2e`, `check:persistence` et `check:recovery` exigent un build à jour. Les résultats réellement obtenus sont dans [runs/current.md](runs/current.md).

## Développement

Depuis la racine du dépôt :

```bash
pnpm db:migrate
pnpm dev
```

Ouvrir [http://127.0.0.1:3000](http://127.0.0.1:3000). Le serveur de développement reste lié à `127.0.0.1`. La migration est **explicite**, réapplicable sans effacer les tâches ; le démarrage ne migre ni ne réinitialise la base. Appliquer les migrations avant de lancer l'application, et arrêter le service avant une intervention sur ses fichiers.

Les origines de développement autorisées par défaut sont exactement `http://127.0.0.1:3000` et `http://localhost:3000`. Un autre port exige une liste explicite, par exemple pour un contrôle sur données jetables :

```bash
MYTODO_ALLOWED_ORIGINS=http://127.0.0.1:3102 pnpm dev --port 3102
```

Ce réglage ne modifie pas le chemin de données : utiliser les variables ci-dessous pour l'isoler.

## Données et serveur compilé

| Variable serveur | Rôle |
| --- | --- |
| `MYTODO_DATA_MODE` | `development` par défaut, `test` ou `personal`. |
| `MYTODO_DB_PATH` | Chemin du fichier SQLite. Défaut développement : `.data/development/tasks.sqlite`, relatif à la racine de lancement. Défaut personnel : `~/.local/share/my-todo/tasks.sqlite`, hors dépôt. En mode test, un chemin absolu explicite est obligatoire. |
| `MYTODO_ALLOWED_ORIGINS` | Origines complètes séparées par des virgules, sans barre finale. En production, aucune origine d'écriture n'est autorisée par défaut. La liste ne dépend jamais de l'en-tête Host. |
| `HOST`, `PORT` | Adresse et port du serveur compilé. Utiliser `127.0.0.1` pour les contrôles locaux. |

Les chemins publics (dont ceux atteints via des liens symboliques) sont refusés. La base personnelle doit être hors dépôt. Les fichiers SQLite et leurs annexes sont ignorés par Git ; ne pas y placer de données personnelles pour les tests. Les API ne mettent pas les tâches en cache (`no-store`) et refusent les mutations sans origine autorisée. Les créations et modifications exigent `Content-Type: application/json`. La création accepte le seul champ texte `title` ; `PATCH /api/tasks/:id` accepte `title`, le booléen `completed` et/ou `categoryId` (UUID de catégorie ou `null`). Les propriétés inconnues sont refusées. Une modification ne change que les champs soumis ; répéter un état cible ne le bascule pas. Une cible absente retourne 404 et ne peut pas être recréée par une modification tardive.

Contrôle local reproductible sur données jetables, dans un même terminal :

```bash
export MYTODO_DATA_MODE=test
export MYTODO_DB_PATH="$(mktemp -d /tmp/mytodo-demo-XXXXXX)/tasks.sqlite"
export MYTODO_ALLOWED_ORIGINS=http://127.0.0.1:3102
pnpm db:migrate
pnpm db:migrate
pnpm build
HOST=127.0.0.1 PORT=3102 pnpm start
```

Ouvrir [http://127.0.0.1:3102](http://127.0.0.1:3102), ajouter une tâche, arrêter avec Ctrl+C, relancer la dernière commande dans le même terminal puis actualiser. La tâche doit rester présente. `pnpm check:persistence` automatise ce contrôle sur une base temporaire propre et nettoie seulement ses propres données. Le runner Playwright crée aussi sa propre base temporaire, jamais la base configurée par le terminal ; ports de test fixes : 3100 et 3101, à laisser libres. Pour revenir au défaut développement après l'exemple :

```bash
unset MYTODO_DATA_MODE MYTODO_DB_PATH MYTODO_ALLOWED_ORIGINS
```

Lancer depuis la racine du projet ; conserver `migrations/` avec le code pour la commande de migration. Le pilote natif doit être installé pour la version Node utilisée.

## Capture, gestion et classement des tâches

Saisir un titre puis Ajouter ou Entrée. Pendant le chargement ou l'actualisation de la liste, le titre reste saisissable et conservé ; Ajouter et Entrée attendent la fin de la lecture. Le serveur supprime les espaces aux extrémités ; un titre vide est refusé. Deux ajouts volontaires de même titre créent deux tâches distinctes. La liste présente les créations les plus récentes d'abord, avec un départage stable par identifiant.

L'interface attend la confirmation serveur, bloque les soumissions pendant l'attente et conserve la saisie après erreur. Les requêtes ont un délai maximal de 10 secondes si le serveur ne répond pas. Une lecture affiche alors son échec ; une écriture reste incertaine, car elle peut avoir été enregistrée avant la coupure. En cas de résultat incertain, utiliser **Relire la liste avant de réessayer**, vérifier la présence de la tâche, puis décider explicitement d'un nouvel ajout. Il n'y a ni répétition automatique ni déduplication par titre. **Actualiser** retrouve également les ajouts effectués depuis un autre navigateur.

Cocher une tâche la termine ; décocher dans **Terminées** la rouvre. Cette section se trouve après les tâches à faire, repliée à la première ouverture de chaque vue. Son état reste conservé lors des allers-retours au détail et entre vues dans la session. Chaque section garde l'ordre de création, même après modification ou réouverture.

Cliquer sur le titre ouvre le détail sans changer l'état : panneau à côté de la liste sur ordinateur, vue dédiée avec **Retour à la liste** sur téléphone. L'ajout rapide reste accessible. **Enregistrer** valide les champs modifiés du titre et du classement puis, après confirmation du serveur, ferme le détail et revient à la liste avec un message de succès. Sans modification, ce bouton revient aussi à la liste, sans écriture. **Annuler**, Retour ou Échap dans le détail abandonnent le brouillon. Fermer ou recharger le navigateur l'abandonne aussi. Pendant l'attente ou après un échec, le détail et le brouillon restent ouverts ; une relecture ne remplace pas le brouillon par le titre serveur et ne ferme pas le détail si la tâche existe encore.

**Supprimer la tâche** ouvre une confirmation portant le titre enregistré, avec **Annuler** et **Supprimer**. La suppression est définitive après confirmation du serveur, pour les tâches actives comme terminées. Tab et Maj+Tab restent dans cette confirmation ; Échap l'annule. Le focus revient au titre à la fermeture du détail, ou à un contrôle disponible si la tâche a quitté la liste.

Les lectures et écritures sont coordonnées : aucune mutation ne part pendant une lecture, et aucune lecture pendant une écriture. Les cases et actions d'enregistrement attendent la confirmation serveur. Après un refus, la tâche reste inchangée à l'écran et la saisie est conservée. Après une réponse perdue, toutes les écritures attendent une **relecture explicite réussie** : vérifier le titre, l'état, le classement, les catégories et la présence de la tâche avant une nouvelle tentative. Aucun PATCH ni DELETE n'est répété automatiquement. Si la tâche n'existe plus après relecture, son détail se ferme. Une relecture échouée laisse la reprise obligatoire.

Le PC et le service doivent rester démarrés. Aucun fonctionnement hors connexion ni synchronisation instantanée n'est promis. Le [protocole M3](documentation/EXPLOITATION_M3.md) décrit le lancement LAN, le préalable pare-feu, les essais sur vrai téléphone et la sauvegarde/restauration isolée ; les validations obtenues et encore ouvertes sont dans le [checkpoint](runs/current.md). Aucune exposition Internet n'est prévue. Le contrôle d'origine n'est pas une authentification : les appareils autorisés du réseau domestique auront accès aux tâches. L’utilisateur a choisi une sauvegarde mensuelle sur disque externe ; dans le dossier `todo-backup`. Le point de montage du disque devra être identifié avant la première copie réelle.


## Organisation M1 — catégories

La navigation donne accès à **Boîte de réception** (sans catégorie), **Toutes les tâches** et chaque catégorie, même vide. Sur téléphone, ouvrir **Choisir une vue**. Changer de vue ferme le détail et abandonne son brouillon ; le retour simple conserve la vue et sa section Terminées. Une tâche créée rapidement reçoit seulement un titre : depuis une catégorie, elle rejoint toujours la boîte avec un message et **Voir la Boîte de réception**.

Dans le détail, **Rechercher une catégorie** propose les noms existants par sous-chaîne. Flèche bas puis les flèches parcourent les boutons ; Entrée choisit le bouton focalisé. Le choix **Sans catégorie** retire le classement. La recherche seule ne change aucune sélection. **Créer la catégorie** enregistre explicitement le nom puis le sélectionne dans le brouillon ; **Enregistrer** reste nécessaire pour classer la tâche. Annuler ce brouillon conserve la catégorie créée. Les noms sont normalisés en Unicode NFC, avec espaces réduits et comparaison sans casse ; accents et ponctuation restent significatifs. Un doublon est refusé (409) : actualiser et sélectionner l’existant, sans rattachement automatique.

**Nouvelle catégorie** crée depuis la navigation. Dans une vue de catégorie, **Renommer la catégorie** conserve toutes les associations. **Supprimer la catégorie** demande confirmation et conserve les tâches actives et terminées sans catégorie. La disparition de la catégorie consultée ramène à la boîte avec une explication. Après un classement enregistré, le détail se ferme et le focus rejoint sa ligne ou un contrôle de repli si la tâche a quitté la vue ; le message de succès précise ce déplacement. Un déplacement externe constaté lors d'une relecture conserve le détail et son brouillon.

Les tâches et catégories sont relues ensemble et publiées seulement si les deux lectures réussissent. Cela ne garantit pas un instantané entre appareils. Une catégorie inconnue est affichée **indisponible**, jamais Sans catégorie : actualiser ou remplacer explicitement la référence. Une catégorie disparue au moment du PATCH renvoie 404 avec le code `CATEGORY_MISSING`, distinct d’une tâche absente, sans écriture partielle. Les brouillons sont conservés après erreur et relecture ; les champs non modifiés dans le brouillon ne sont pas envoyés. Après résultat incertain d’une mutation de tâche ou catégorie, les écritures restent bloquées jusqu’à relecture réussie des **deux** ressources, sans répétition automatique. Les erreurs restent visibles dans le détail mobile.

| API catégories | Entrée et résultat |
| --- | --- |
| GET `/api/categories` | Tableau `{ id, name }`, ordre alphabétique français stable |
| POST `/api/categories` | `{ name }`, réponse 201 |
| PATCH `/api/categories/:id` | `{ name }`, réponse 200 |
| DELETE `/api/categories/:id` | Suppression avec déclassement atomique, réponse 204 |

Les deux ressources partagent la connexion et les contrôles d’origine, JSON et cache `no-store`. Entrée invalide : 400 ; ressource absente : 404 ; nom déjà utilisé : 409 ; indisponibilité : 503. POST `/api/tasks` continue d’accepter `{ title }` seul et retourne `categoryId: null`.

La migration incrémentale **0001_categories** conserve `0000_tasks.sql` et toutes les tâches historiques ; leur `category_id` vaut initialement NULL. Les clés étrangères sont activées à chaque ouverture et `ON DELETE SET NULL` assure le déclassement. Avant toute migration personnelle, arrêter le service et sauvegarder une copie cohérente selon le [protocole d’exploitation](documentation/EXPLOITATION_M3.md). Exécuter `pnpm db:migrate` avec le chemin configuré, puis démarrer le binaire compatible. Aucun retour destructif automatique : restaurer une sauvegarde pré-migration avec sa version correspondante abandonne les changements postérieurs à la copie. Les checks du dépôt utilisent seulement des bases jetables.
