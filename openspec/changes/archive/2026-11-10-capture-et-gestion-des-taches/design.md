# Design

## Context

Voir [proposal.md](proposal.md) pour le problème et le périmètre. Le dépôt ne contient que des documents et l'initialisation OpenSpec ; aucun code, schéma ou test applicatif n'est à migrer. Le runtime observé pendant la proposition est Node.js 24.14.0 avec pnpm 10.33.0 : leur présence ne prouve pas encore la compatibilité des dépendances à installer.

Le design est nécessaire car ce changement crée l'interface, les API, la persistance et l'outillage. Il suit les [fondations](../../../../documentation/PROJECT_FOUNDATION.md) et la [direction UI](../../../../documentation/UI_DIRECTION.md), avec les précisions de scope validées dans la proposition.

## Goals / Non-Goals

**Goals:**

- Livrer un premier parcours vertical dès M1, puis étendre son cycle de vie en M2 et vérifier son exploitation au domicile en M3.
- Rendre la persistance et les erreurs vérifiables à travers une API commune à tous les navigateurs.
- Garder des frontières simples entre interface, règles de tâches et accès SQLite.

**Non-Goals:**

- Préparer les tables ou modules des fonctions reportées, construire une couche générique pour plusieurs bases, ou installer un moteur IA.
- Mettre en place WebSocket, synchronisation automatique, API publique pour des clients tiers ou déploiement cloud.

## Decisions

### 1. Une application Nuxt avec serveur intégré

Utiliser Nuxt/Vue, TypeScript strict et pnpm, avec les sources d'interface dans `app/`, les API dans `server/api/` et les règles et dépôts dans des modules serveur distincts. Le navigateur utilise des URL relatives vers les API de son origine ; SQLite reste exclusivement côté serveur.

Les versions exactes de Nuxt, Vue, Drizzle et du pilote SQLite local seront vérifiées contre leurs documentations officielles et le runtime disponible au début de M1, puis figées dans le manifeste et le lockfile. Cette vérification ciblée concerne les prérequis Node, le support du pilote par Drizzle et sa compilation Linux ; elle ne rouvre pas le choix d'architecture. Ne pas installer silencieusement une autre stack si une incompatibilité apparaît.

Alternative écartée : une application frontend et un service API séparés ajouteraient une configuration et des déploiements sans besoin établi. Un stockage métier dans le navigateur empêcherait de partager directement les tâches du PC.

### 2. Modèle minimal de tâche et migrations explicites

Créer une table de tâches avec identifiant stable généré côté serveur, titre non vide après normalisation, état terminé/non terminé et horodatage de création. L'identifiant départage les égalités pour un ordre stable. Les tâches sont affichées par création décroissante dans chaque section ; rouvrir une tâche conserve sa date de création. Aucun champ des fonctionnalités reportées n'est ajouté.

Le serveur et la base imposent les contraintes applicables. Le schéma Drizzle et les migrations sont versionnés ; une commande explicite applique les migrations à une base choisie. L'application ne doit pas effacer ou réinitialiser une base à son démarrage.

Un chemin de base configurable côté serveur distingue développement, tests et données personnelles. Le défaut de développement reste dans un répertoire ignoré par Git et hors des fichiers publics ; une base de test temporaire ne réutilise jamais la base personnelle. Les fichiers annexes SQLite éventuels sont également ignorés.

Alternative écartée : créer d'emblée les catégories, étapes et plans couplerait le premier changement aux décisions reportées. Les migrations permettront de les ajouter plus tard.

### 3. API de tâches et validation aux frontières

Contrat prévu :

| Opération | Route | Résultat |
| --- | --- | --- |
| Lire les tâches | `GET /api/tasks` | Liste complète des tâches à faire et terminées, triées de manière stable. |
| Créer | `POST /api/tasks` | Accepte un titre et retourne la tâche créée après écriture réussie. |
| Modifier | `PATCH /api/tasks/:id` | Accepte seulement le titre et/ou l'état terminé explicitement soumis ; retourne la tâche enregistrée. |
| Supprimer | `DELETE /api/tasks/:id` | Supprime une tâche existante après confirmation dans l'interface. |

Valider le corps, le type des champs, le titre normalisé et l'identifiant côté serveur, et refuser les propriétés inconnues. Une erreur de validation retourne une réponse 400 ; une cible absente retourne 404 ; une erreur interne retourne une erreur maîtrisée sans contenu de tâche, détail SQL ou chemin local. Un titre identique n'est pas un conflit : les identifiants distinguent les tâches.

Les mises à jour expriment un état cible, pas une opération de bascule ; réémettre « terminé = vrai » ne rouvre pas une tâche. Une modification de titre ne réécrit pas l'état depuis une copie ancienne, et inversement. Aucune stratégie élaborée de résolution de conflits n'est ajoutée : pour le même champ, la dernière écriture acceptée prévaut ; une cible supprimée est signalée comme absente et n'est jamais recréée implicitement.

Alternative écartée : envoyer tout un objet de tâche à chaque modification augmenterait les écrasements involontaires entre les deux appareils. Les écritures unitaires ne nécessitent pas de transaction multi-opérations dans ce changement.

### 4. Boîte de réception et détail limités aux besoins présents

La racine ouvre la Boîte de réception. L'ajout reste accessible dans la liste et le détail. Les tâches actives sont suivies d'une section Terminées repliée à chaque nouvelle entrée dans la boîte ; son état est conservé lors d'un simple aller-retour au détail. Cliquer sur le titre ouvre le détail ; la case gère uniquement la réalisation.

Sur ordinateur, le détail est un panneau latéral ; sur téléphone, il occupe une vue dédiée avec retour. Le formulaire comporte le titre, Enregistrer, Annuler et l'accès à Supprimer. La confirmation de suppression affiche le titre et deux actions explicites. Le titre est rendu comme texte. Les contrôles sont utilisables au clavier et au toucher, avec libellés accessibles et gestion du focus. Le style applique les principes de la direction UI sans ajouter de bibliothèque d'interface par défaut.

Hypothèses mineures proposées pour cette première version : ordre par création décroissante ; annuler, fermer le détail ou revenir abandonne une modification non enregistrée. En revanche, un échec d'enregistrement conserve le brouillon. Aucun brouillon n'est conservé après fermeture ou rechargement du navigateur.

Alternative écartée : afficher la navigation de tout le MVP créerait des destinations sans parcours utilisable. L'accueil Ma journée reste la cible d'un futur changement de planification.

### 5. Mise à jour confirmée par le serveur et gestion des échecs

Utiliser une interface qui attend la confirmation serveur avant de considérer une modification comme acquise. Signaler les lectures et écritures en cours, bloquer les soumissions identiques pendant l'attente et préserver la saisie en cas de rejet certain. Un échec de chargement est distinct d'une liste vide. Réessayer reste une action explicite.

Une réponse réseau perdue peut survenir après une écriture réussie. Dans ce cas, conserver la saisie, signaler que le résultat est inconnu et demander une relecture de la liste avant une nouvelle soumission. Ne pas répéter automatiquement un POST : la présence de titres identiques ne permet pas de déduire si une tâche constitue un doublon accidentel. La première version ne promet pas une création exactement une fois à travers une coupure réseau.

Alternative écartée : des mises à jour optimistes exigeraient des retours arrière et une réconciliation supplémentaires, sans bénéfice nécessaire pour ce parcours local.

### 6. Réseau domestique et contrôle d'origine dès les premières écritures

Servir l'interface et les API à la même origine. La configuration serveur contient une liste explicite des origines autorisées, incluant les adresses et ports nécessaires pour le PC et le téléphone. Pour les mutations, refuser avant l'écriture une origine absente ou non autorisée ; ne pas construire cette liste depuis le seul en-tête Host fourni par la requête. Refuser les corps incompatibles avec le contrat JSON des créations et modifications. Aucun CORS permissif n'est activé. Les réponses métier ne sont pas mises en cache durablement.

Ces contrôles existent dès M1, avant tout usage réseau ; M3 valide l'adresse LAN du serveur compilé et la configuration du pare-feu. Le fichier SQLite et ses sauvegardes restent hors des ressources publiques. L'accès sans compte est un choix du réseau domestique de confiance : le contrôle d'origine ne sert pas d'authentification et ne protège pas d'un appareil malveillant déjà autorisé sur ce réseau.

Alternative écartée : ajouter des comptes ou exposer le service sur Internet changerait le périmètre validé. Aucune règle système n'est modifiée automatiquement pour valider le LAN.

### 7. Vérifications adaptées à chaque milestone

M1 installe les commandes de typecheck, lint, build, tests Vitest et parcours Playwright. Les tests d'intégration utilisent des bases SQLite temporaires et vérifient les migrations, les entrées invalides et la relecture après réouverture de la base. Un parcours navigateur couvre ajout et rechargement ; un contrôle d'un serveur compilé relancé vérifie la persistance réelle.

M2 complète les tests sur les changements d'état, la modification du titre, les deux issues de la confirmation de suppression et les erreurs maîtrisées. Des réponses réseau contrôlées couvrent les refus et l'incertitude sans utiliser de données personnelles. Les tests API vérifient aussi les origines refusées et les mises à jour partielles.

Chaque milestone exécute les tests pertinents, typecheck, lint, build et un contrôle manuel de ses interactions. Un navigateur à taille mobile aide à vérifier le rendu ; il ne remplace pas le contrôle tactile sur téléphone exigé avant de déclarer la compatibilité téléphone validée. M1 et M2 restent des incréments vérifiés sur ordinateur tant que ce contrôle n'a pas eu lieu ; M3 clôt la validation réseau et tactile du parcours entier.

## Risks / Trade-offs

- Compatibilité du pilote local et de l'outillage encore non éprouvée : vérifier les prérequis ciblés avant l'installation en M1 et consigner les versions retenues.
- Base partagée sans actualisation automatique : rendre la relecture accessible ; la réception immédiate des changements d'un autre appareil n'est pas promise.
- Réponse perdue après une création : informer de l'incertitude et relire avant une nouvelle tentative ; aucune déduplication par titre.
- Accès sans compte : limiter au réseau domestique et documenter les appareils qui y ont accès, sans exposition Internet.
- Téléphone, pare-feu ou destination de sauvegarde non accessibles pendant Apply : rapporter les vérifications manquantes ; ne pas cocher les tâches concernées comme terminées.

## Migration Plan

1. Pendant M1, créer et migrer uniquement une base de développement, puis tester avec des bases isolées. Mettre en place les contrôles serveur avant les mutations.
2. Pendant M2, étendre les API et l'interface sans réinitialiser la base de M1.
3. Pendant M3, lancer l'application compilée et vérifier le parcours depuis le PC et un vrai téléphone sur le LAN. Documenter démarrage, arrêt, chemins et origines autorisées.
4. Avant l'usage quotidien avec de vraies tâches, choisir une destination distincte et une fréquence de sauvegarde avec l'utilisateur. Vérifier une procédure simple de copie cohérente service arrêté puis de restauration dans un emplacement isolé. Une planification automatique des sauvegardes n'est pas comprise dans ce changement.
5. En cas d'échec de mise en service, arrêter le service et conserver la base. Revenir à une version compatible ou restaurer une copie vérifiée vers un chemin distinct ; ne pas supprimer la seule base ni prétendre qu'une migration inverse existe.

## Open Questions

- Les versions exactes et le pilote SQLite local sont à fixer par la vérification de compatibilité ciblée en début de M1, dans les choix d'architecture déjà validés.
- L'adresse LAN, le port et les règles du pare-feu dépendent de l'environnement de mise en service ; ils seront relevés pour M3.
- La destination et la fréquence des sauvegardes restent à fixer avant l'usage quotidien. Leur absence n'empêche pas les tests avec des données jetables mais empêche de déclarer la mise en service personnelle prête.
