# Design

## Context

Voir [proposal.md](proposal.md) pour la motivation et le périmètre. Le changement traverse interface, règles métier, API et persistance ; les migrations et la suppression des associations justifient ce design.

État constaté : `app/app.vue` porte la capture, le détail, les lectures et toutes les mutations ; `TaskList.vue` n'affiche que titre et état. `Task` contient `id`, `title`, `completed`, `createdAt`. Le dépôt expose GET/POST `/api/tasks` et PATCH/DELETE `/api/tasks/:id`. `parseUpdate` n'accepte que titre et état. La connexion better-sqlite3/Drizzle n'active pas explicitement les clés étrangères. La migration `0000_tasks.sql` utilise une table STRICT. Le middleware d'origine, JSON et cache ne couvre actuellement que les routes de tâches.

Les tests existants couvrent la validation, les migrations, la persistance, les erreurs certaines et incertaines, les courses lecture/écriture et les interactions mobile/clavier. Certaines insertions SQL de test utilisent des valeurs positionnelles sans noms de colonnes : elles devront être adaptées à l'extension du schéma, sans retirer les assertions de contraintes.

## Goals / Non-Goals

**Goals:**

- Livrer M1 indépendamment de M2, avec sa migration et son interface réellement utilisable.
- Garder une base serveur commune, des règles contrôlées à l'exécution et des associations cohérentes, y compris entre deux appareils.
- Étendre les interactions existantes en conservant les brouillons, les retours de focus et les erreurs visibles dans le détail mobile.

**Non-Goals:**

- Ajouter un gestionnaire d'état global externe, une bibliothèque d'autocomplétion ou une nouvelle infrastructure.
- Préparer le schéma des étapes, de la planification ou de l'IA avant leurs changements.
- Garantir des instantanés synchronisés entre appareils ou une résolution générale des modifications concurrentes. Les vues se mettent à jour après confirmation locale ou actualisation ; les contraintes serveur protègent les références et les doublons.

## Decisions

### 1. Catégories identifiées et relation facultative — M1

Créer une table `categories` avec `id` UUID, `name` affichable et `name_key` canonique non nuls ; `name_key` porte une contrainte UNIQUE. Ajouter `tasks.category_id`, nullable, avec référence à `categories.id ON DELETE SET NULL`, puis activer `foreign_keys = ON` à chaque ouverture de connexion et enregistrer les deux tables dans le schéma Drizzle.

Une suppression de catégorie provoque ainsi, dans une seule opération SQLite, le déclassement de toutes ses tâches sans changer leurs autres champs. Renommer modifie le nom et sa clé dans une seule écriture, en conservant l'identifiant. Une tâche ne peut référencer une catégorie absente, même si celle-ci disparaît entre validation et écriture. Une erreur de référence est traduite en erreur métier explicite, jamais en affectation silencieuse à Sans catégorie.

Alternative écartée : stocker le nom directement dans chaque tâche imposerait des mises à jour multiples pour renommer et faciliterait les incohérences. Une table de jointure ne répond à aucun besoin puisque le classement est unique.

### 2. Normalisation commune et unicité serveur — M1

Normaliser le nom en NFC, supprimer les espaces Unicode aux extrémités et réduire leurs suites internes à un espace. Conserver cette casse pour l'affichage ; construire `name_key` avec la même normalisation et une minuscule Unicode déterministe. Les accents et la ponctuation restent significatifs ; pas de rapprochement flou ou de fusion automatique. Refuser aussi le caractère NUL.

La recherche utilise la même clé, par sous-chaîne, et propose les catégories dans un ordre alphabétique français stable, départagé par identifiant. Les exemples `ÉTUDES`/`études` et deux écritures Unicode canoniquement équivalentes doivent être couverts. L'index unique reste l'arbitre de deux requêtes concurrentes. Un renommage changeant seulement la casse de sa propre catégorie est autorisé.

Alternative écartée : une comparaison seulement dans le navigateur laisse passer les courses entre appareils ; se limiter à la collation SQLite `NOCASE` ne définit pas la normalisation Unicode souhaitée.

### 3. Contrats HTTP et connexion partagée — M1 puis M2

Conserver la forme tableau et l'ordre de GET `/api/tasks`, et le contrat de capture POST avec `{ title }` seul. Étendre `Task` et les réponses des mutations : `categoryId: string | null` en M1 ; `priority: 'low' | 'normal' | 'high' | null` et `dueDate: string | null` en M2. `null` correspond aux choix Sans catégorie, Sans priorité et Sans échéance ; un champ absent d'un PATCH conserve la valeur actuelle. Ne pas envoyer les champs qui n'ont pas été modifiés afin de préserver les modifications indépendantes d'un autre appareil.

| Route | Contrat proposé |
| --- | --- |
| GET `/api/categories` | Tableau des catégories `{ id, name }` |
| POST `/api/categories` | `{ name }`, réponse 201 avec la catégorie |
| PATCH `/api/categories/:id` | `{ name }`, réponse 200 avec la catégorie renommée |
| DELETE `/api/categories/:id` | Suppression et déclassement atomiques, réponse 204 |
| PATCH `/api/tasks/:id` | Champs partiels existants, plus `categoryId` en M1, `priority` et `dueDate` en M2 |

Séparer validation métier des catégories et tâches, réutiliser une connexion serveur pour leurs repositories, et vérifier toute l'entrée avant l'écriture de tâche unique. Traduire les erreurs en 400 (format/valeur), 404 (ressource ou catégorie référencée absente), 409 (nom déjà pris), 503 (indisponibilité), sans contenu SQL dans les messages. Distinguer la catégorie référencée absente de la tâche absente dans le contrat d'erreur et son affichage : une catégorie disparue ne signifie pas que la tâche a été supprimée. Pour un doublon, proposer une relecture et la sélection de la catégorie existante ; aucun rattachement automatique.

Étendre le middleware existant aux préfixes exacts des deux ressources : contrôle Origin pour les mutations, application/json pour POST/PATCH, `Cache-Control: no-store` pour les réponses. Les routes et fichiers privés existants restent protégés. Alternative écartée : dupliquer les protections et ouvrir une seconde connexion par ressource ferait diverger les contrats et les règles de connexion.

### 4. Navigation, brouillons et gestion de catégories — M1

Conserver des vues dérivées d'un même tableau de tâches et d'un même tableau de catégories, sans base navigateur. Extraire de `app.vue` les responsabilités utiles : navigation/gestion des catégories, sélecteur de catégorie et détail de tâche ; un composable partagé peut porter lectures, mutations et état d'attente. Garder `TaskList` pour les lignes. Les noms finaux des composants restent un choix d'implémentation.

Sur ordinateur, placer la navigation à côté de la liste ; sur téléphone, proposer un menu accessible contenant Boîte de réception, Toutes les tâches et les catégories nommées, sans devoir passer par un filtre. Les actions Créer, Renommer et Supprimer sont accessibles sans survol, dans cette navigation ou la vue de catégorie. La suppression affiche son nom et explique la conservation des tâches.

Le sélecteur de catégorie est un champ de recherche avec suggestions sélectionnables et action Créer distincte, utilisable au clavier et au toucher. Le texte de recherche et la catégorie sélectionnée sont des états distincts : un texte non choisi ne remplace pas le classement. La sélection n'est appliquée à la tâche qu'avec Enregistrer. Créer une catégorie est une mutation explicite séparée : si le brouillon de tâche est ensuite annulé, la catégorie créée reste enregistrée ; l'interface doit distinguer cette confirmation de celle du classement.

L'accueil reste Boîte de réception. La création rapide n'hérite d'aucun contexte : une tâche ajoutée depuis Maison rejoint la boîte, avec message et accès à celle-ci. Les listes sont triées comme aujourd'hui, par création décroissante puis identifiant décroissant ; chaque vue a une section Terminées repliée lors de sa première ouverture. Conserver son état pendant les allers-retours au détail et dans la navigation de la session. Pas de persistance des vues ou filtres entre rechargements pour ce changement.

Après Enregistrer, attendre la confirmation du serveur puis fermer le détail sur ordinateur et téléphone, en conservant la vue et l'état de Terminées. Garder le message de succès visible ; si le classement retire la tâche de la vue, l'expliquer. Restaurer le focus sur sa ligne si elle existe, sinon sur un contrôle de la vue. Sans champ modifié, revenir également à la liste, sans PATCH et en signalant l'absence de modification. Pendant l'attente, après refus ou résultat incertain, conserver détail et brouillon ; une relecture seule ne vaut pas un nouvel enregistrement confirmé. Cette décision utilisateur, prise après les essais A37, remplace le maintien du détail ouvert après enregistrement prévu initialement.

Rechercher toujours la sélection dans le tableau complet, pas dans la seule vue filtrée : si un déplacement externe est constaté lors d'une relecture, conserver le détail et son brouillon jusqu'au retour volontaire. Changer de vue ferme le détail et abandonne son brouillon comme Annuler ; l'interface doit rendre ce comportement compréhensible. Si la catégorie consultée a disparu, revenir à la boîte en l'expliquant. Lorsqu'une catégorie disparaît du sélecteur pendant une relecture, conserver le brouillon et signaler la référence à remplacer plutôt que l'effacer silencieusement.

Alternative écartée : un filtre unique de catégories ne répond pas à l'accès direct validé. Des écrans ou routes distincts dupliquant chargements et états compliqueraient le retour au détail ; des vues Vue en mémoire suffisent au parcours actuel.

### 5. Coordination des lectures et écritures — dès M1

Étendre la sérialisation actuelle à toutes les mutations, y compris de catégories. Conserver le délai borné de 10 secondes et `retry: 0`. Lire tâches et catégories dans une même opération logique, publier les deux tableaux ensemble seulement si les deux lectures réussissent. Ces lectures HTTP peuvent être parallèles ; leur publication commune n'est pas un instantané transactionnel interappareils. Une référence inconnue apparue entre les réponses est signalée comme catégorie indisponible, sans la présenter comme Sans catégorie ni autoriser un enregistrement implicite ; Actualiser permet de la résoudre.

Une relecture conserve les brouillons et ne débloque un résultat incertain qu'après récupération des deux ressources. Les messages de chargement et erreur restent dans une zone commune, visible même quand la liste est cachée par le détail mobile. Une réponse d'écriture perdue ne déclenche ni nouvelle écriture ni rattachement automatique. Après une suppression confirmée, mettre à jour les catégories et déclasser leurs tâches dans l'état local ; la relecture complète reste la voie de réconciliation après incertitude.

La création de catégorie depuis un détail ne doit pas remplacer ni perdre le brouillon de tâche. Les opérations de navigation, de lecture et de date locale ne doivent déclencher aucun enregistrement implicite. Alternative écartée : des requêtes autonomes par composant et des mises à jour optimistes ajouteraient des courses aux protections existantes.

### 6. Priorités, dates et filtres — M2

Ajouter `tasks.priority` nullable avec contrainte sur `low`, `normal`, `high`, et `tasks.due_date` nullable, texte civil `YYYY-MM-DD`. Vérifier le format et la réalité calendaire côté serveur, y compris années bissextiles ; ne pas transformer une date impossible en une autre date. Ajouter des contraintes SQL compatibles avec les contrôles serveur pour les types, valeurs de priorité et format de date.

Pour l'affichage et les filtres, utiliser une fonction pure recevant les tâches et la date civile courante. Construire cette date avec les composantes locales du navigateur, sans conversion UTC ; comparer les dates civiles sans transformer l'échéance en instant. Rafraîchir la date au changement de jour et au retour dans l'onglet, sans écriture ni écrasement de brouillon. Le fuseau de l'appareil consultant sert de référence : un appareil volontairement configuré dans un autre fuseau peut afficher un retard à un autre moment ; l'échéance stockée ne change jamais.

Dans Toutes les tâches, utiliser trois filtres simples par intersection : catégorie (Toutes / Sans catégorie / catégorie choisie), priorité (Toutes / Sans priorité / Basse / Normale / Haute) et échéance (Toutes / Sans échéance / En retard / Aujourd'hui / Date précise). Une date précise est une égalité, sans plage ni nouveaux raccourcis. Appliquer les mêmes filtres avant de séparer À faire et Terminées ; En retard ne contient donc aucune tâche terminée. Réinitialiser remet les trois filtres à Toutes. Conserver les filtres au retour du détail ; entrer depuis une autre destination ouvre Toutes les tâches sans filtre caché.

Les dates et priorités renseignées sont visibles en informations secondaires dans les lignes ; Sans priorité ou Sans échéance ne surcharge pas chaque ligne. Afficher le retard avec un texte, pas seulement du rouge. Alternative écartée : ordonner automatiquement par priorité ou échéance changerait le comportement de consultation sans avoir été demandé. Aucun champ de jour prévu n'est introduit.

### 7. Hypothèses de détail proposées pour relecture

Les choix de casse affichée, réduction des espaces internes, accents significatifs, ordre alphabétique des catégories, absence de filtre mémorisé après rechargement, création rapide toujours non classée et options précises des filtres ci-dessus complètent le cadrage. Ils ne sont pas présentés comme des décisions utilisateur supplémentaires. Ils rendent le plan implémentable et peuvent être ajustés avant Apply sans modifier l'objectif ni les deux milestones.

## Risks / Trade-offs

- [Régression sur une base existante] → Ajouter des migrations, préserver `0000_tasks.sql` et son journal, tester la montée depuis une base réellement au schéma initial et la réapplication de chaque état.
- [Clés étrangères inactives ou suppression partielle] → Activer et vérifier le pragma pour chaque connexion ; tester affectation invalide et déclassement des tâches actives et terminées après suppression.
- [Tests de contraintes faussement verts après ajout de colonnes] → Remplacer les INSERT positionnels des tests par des colonnes explicites et vérifier que les échecs attendus concernent toujours la contrainte visée.
- [Doublons malgré l'autocomplétion] → Normalisation partagée, index unique, tests de concurrence et conflits de renommage, relecture sans répétition automatique.
- [Retour de focus vers une ligne disparue] → Prévoir le contrôle de repli et tester déplacement de catégorie, filtres et suppression de catégorie consultée.
- [Données de deux appareils momentanément décalées] → Associations par identifiant, contraintes en base, références inconnues explicites, actualisation volontaire et PATCH limités aux champs modifiés ; pas de promesse de synchronisation instantanée.
- [Complexité du sélecteur sur téléphone] → Contrôles sémantiques simples, parcours clavier automatisé et validation tactile réelle avant de déclarer le milestone terminé.

## Migration Plan

1. **M1** : ajouter une migration après `0000` pour catégories et `category_id`, ainsi que les métadonnées de migration correspondantes ; ne pas réécrire la migration historique. Toute tâche existante reçoit `category_id = NULL`.
2. Tester une base vierge, une base jetable remplie au schéma initial et une seconde application des migrations. Vérifier conservation intégrale des champs historiques, clés étrangères actives et réouverture. Adapter le contrôle de persistance pour relire catégories et associations après redémarrage.
3. **M2**, après autorisation distincte : ajouter une autre migration pour `priority` et `due_date`, initialisées à NULL. Vérifier la montée depuis M1 avec catégories et associations déjà enregistrées, ainsi que le parcours complet depuis `0000`.
4. Avant application à des données personnelles, arrêter le service et effectuer une sauvegarde cohérente selon le protocole d'exploitation existant ; démarrer uniquement une version compatible après `pnpm db:migrate`. Les checks et la proposition n'utilisent que des données jetables.
5. Vérifier aussi sauvegarde/restauration sur données jetables enrichies. En cas de retour à la version précédente, restaurer une copie pré-migration avec le binaire correspondant ; aucune migration descendante destructive n'est prévue. Une restauration abandonne les modifications postérieures à cette copie et ne doit pas être effectuée implicitement.

Les tâches d'implémentation et leurs validations sont détaillées dans `tasks.md`. Les limites d'exploitation historiques restent décrites dans [EXPLOITATION_M3.md](../../../documentation/EXPLOITATION_M3.md) ; ce changement ne configure pas le pare-feu ni une sauvegarde personnelle.
