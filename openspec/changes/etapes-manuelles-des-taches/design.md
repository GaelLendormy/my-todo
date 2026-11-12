# Design

## Context

Voir [la motivation et le périmètre](proposal.md), les [étapes](specs/task-steps/spec.md) et le [delta de gestion](specs/task-management/spec.md).

L'existant utilise Nuxt/Vue, des types partagés et SQLite/Drizzle avec better-sqlite3. `tasks.completed` est actuellement modifiable directement ; `taskRepository` retourne les lignes de tâches et les trie par création. Le schéma contient seulement tâches et catégories et les migrations vont jusqu'à `0002_task_importance`.

`TaskDetail.vue` porte un formulaire parent dont Enregistrer ferme le détail après succès. `app.vue` conserve ses brouillons et envoie seulement les champs modifiés. `useTaskResources` coordonne les lectures des tâches et catégories ; les mutations attendent une confirmation serveur, avec délai de 10 s, absence de répétition automatique et relecture obligatoire après résultat incertain. Le middleware protège déjà les chemins descendants de `/api/tasks/` : les routes imbriquées d'étapes restent dans cette frontière.

Le périmètre et le cycle de vie ont été validés dans la conversation. Les choix d'interface complémentaires et le découpage ci-dessous sont des propositions de réalisation à relire avant Apply.

## Goals / Non-Goals

**Goals:**

- Garantir ensemble l'état du parent, les étapes et leur ordre, y compris entre connexions concurrentes.
- Réutiliser les protections de l'existant et son détail responsive sans ajouter de source de données navigateur.
- Livrer deux incréments utilisables sans introduire par avance la représentation des journées ou de l'IA.

**Non-Goals:**

- Refaire l'architecture de toutes les mutations ou ajouter un moteur générique de tâches hiérarchiques.
- Fournir une synchronisation instantanée ou une résolution universelle des éditions simultanées.

## Decisions

### 1. Table dédiée et migration additive dès M1

Ajouter `task_steps` dans `0003_task_steps.sql` et le journal Drizzle : UUID `id`, `task_id` obligatoire vers `tasks.id` avec `ON DELETE CASCADE`, `title`, booléen `completed` et entier `position` non négatif. Imposer titre valide comme pour une tâche, état booléen et unicité de `(task_id, position)`. Une étape référence une tâche et ne peut pas être parent d'étapes. Ne créer aucune étape pour les tâches historiques.

L'ordre est dense, à partir de zéro : ajout en fin de liste, suppression avec conservation de l'ordre relatif et compactage. M2 réutilise ces colonnes sans nouvelle migration. Une réattribution de positions utilise une phase temporaire dans une plage positive libre puis les positions finales, dans la même transaction, pour respecter l'unicité pendant les échanges.

**Alternative écartée :** tableau JSON dans la ligne parent. Une table dédiée protège mieux les références et prépare l'identité des actions futures sans implémenter leur planification. Aucune bibliothèque nouvelle n'est nécessaire.

### 2. État parent matérialisé et maintenu dans une transaction

Conserver `tasks.completed` pour les listes et filtres actuels. Pour chaque création, réalisation, réouverture ou suppression d'étape, lire l'état courant du parent et ses étapes, effectuer la mutation, recalculer le parent si des étapes subsistent, puis retourner le résultat confirmé dans une transaction SQLite d'écriture acquise avant lecture métier. Utiliser la connexion partagée existante et des transactions synchrones, sans attente HTTP dans une transaction.

Si la suppression retire la dernière étape, conserver `completed` lu avant cette suppression. Ajouter une étape impose `completed = false` à l'étape et au parent. Renommer ou réordonner conserve les réalisations. Refuser par 409 `TASK_HAS_STEPS` tout PATCH du parent contenant `completed` lorsqu'il possède des étapes, même si la valeur demandée correspond à l'état actuel ; aucun autre champ de ce PATCH n'est alors appliqué. Effectuer contrôle et écriture dans la même transaction pour éviter une course avec l'ajout d'une première étape.

La suppression d'un parent entraîne ses étapes par la clé étrangère ; une mutation tardive retourne une absence, sans upsert. Une suppression de catégorie conserve parent et étapes. Les changements des autres informations du parent ne recalculent pas ou ne réinitialisent pas les étapes.

**Alternative écartée :** recalcul côté navigateur ou mises à jour séparées de l'étape et du parent, qui pourraient confirmer des états incohérents. Les opérations métier passent par le serveur ; les modifications SQL manuelles ne sont pas une interface supportée.

### 3. Retourner une tâche complète avec ses étapes ordonnées

Étendre `Task` avec `steps: TaskStep[]`, vide pour une tâche simple. Chaque étape expose `id`, `taskId`, `title`, `completed` et `position`. Le nombre terminé et le total sont dérivés de ce tableau. GET `/api/tasks` retourne parents et étapes dans une lecture transactionnelle cohérente ; conserver le tri des parents et charger les étapes en lot, sans requête par parent. Les réponses de création et modification de parent utilisent la même forme.

Créer un domaine d'étapes distinct avec des fonctions communes de lecture/recalcul selon les besoins, sans dépendance circulaire. Toutes les mutations d'étapes retournent la tâche complète au moment de leur confirmation, y compris DELETE d'étape, pour mettre à jour la liste et le détail ensemble.

| Milestone | Route | Corps admis | Succès |
| --- | --- | --- | --- |
| M1 | POST `/api/tasks/:id/steps` | `title` seul | 201, tâche complète |
| M1 | PATCH `/api/tasks/:id/steps/:stepId` | `title` et/ou `completed`, au moins un | 200, tâche complète |
| M1 | DELETE `/api/tasks/:id/steps/:stepId` | Aucun | 200, tâche complète |
| M2 | PATCH `/api/tasks/:id/steps/order` | `stepId`, `direction` (`up`/`down`), `expectedOrder` | 200, tâche complète |

Valider UUID, titres, booléens et propriétés inconnues au serveur. Une cible absente ou d'un autre parent retourne 404, une entrée invalide 400, un conflit d'ordre 409 `STEP_ORDER_CHANGED`, une indisponibilité 503. Les nouvelles routes réutilisent le contrôle d'origine/JSON et `no-store`. La suppression du parent garde son 204 existant.

**Alternative écartée :** une lecture d'étapes séparée du GET des tâches. La réponse imbriquée évite d'afficher une progression incompatible avec le parent et conserve la reprise actuelle sur deux ressources : tâches enrichies et catégories. Adapter les fixtures et mocks historiques à `steps: []` en préservant leurs assertions.

### 4. Opérations explicites d'étapes distinctes du formulaire parent

Proposer un composant dédié dans `TaskDetail`, hors du formulaire parent pour éviter les formulaires imbriqués. L'ajout possède Ajouter une étape ; le renommage possède son enregistrement et son annulation ; cocher confirme immédiatement l'état cible auprès du serveur. Une suppression ouvre une confirmation portant le titre, avec Annuler ciblé initialement. Les opérations confirmées gardent le détail ouvert pour poursuivre la décomposition.

Le formulaire parent conserve Enregistrer et son retour à la liste après succès ou absence de changement. Retour, Annuler et Échap abandonnent uniquement les brouillons non confirmés ; les opérations d'étapes déjà confirmées restent enregistrées. Un texte court près des étapes explique cette distinction. Une opération d'étape ne soumet pas le brouillon parent et ne l'écrase pas ; une relecture ne remplace pas non plus les brouillons d'ajout ou de renommage. Fermer le détail abandonne ces brouillons non soumis, comme le brouillon parent actuel.

Les listes montrent une progression textuelle, par exemple « 2 étapes sur 3 terminées », à la place de la case de réalisation globale pour les parents décomposés. Le détail affiche toutes les étapes dans l'ordre enregistré avec leurs cases. Une tâche devenue terminée peut quitter sa section active ou le filtre En retard ; son détail reste sélectionné depuis la source complète, avec information explicite. Le retour restaure un focus utilisable et conserve filtres et Terminées.

Étendre la coordination existante aux mutations d'étapes : une seule mutation ou lecture à la fois, délai borné et `retry: 0`, aucun changement confirmé dans l'interface avant succès. Une erreur certaine garde le brouillon ; une réponse perdue bloque toutes les mutations jusqu'à relecture complète. Si l'étape d'un brouillon a disparu, conserver la saisie comme référence mais empêcher sa soumission à cette cible ; ne jamais la recréer automatiquement. Si le parent a disparu, conserver le comportement existant de fermeture et d'information.

**Alternative écartée :** enregistrer toutes les étapes uniquement avec Enregistrer du parent. Les opérations ciblées suivent le fonctionnement des cases de réalisation et évitent de remplacer toute une décomposition depuis un brouillon ancien.

### 5. Déplacements adjacents avec contrôle de l'ordre observé

En M2, Monter et Descendre échangent une étape avec sa voisine dans l'ordre global, étapes terminées incluses. `expectedOrder` est la liste ordonnée de tous les identifiants observés pour ce parent. Dans la transaction, comparer cette liste à l'ordre courant avant tout échange ; un ajout, une suppression ou un déplacement externe entraîne un 409 explicite et une relecture proposée, sans répétition automatique. Refuser également doublons et types invalides ; les identifiants non applicables ne déplacent aucune autre étape. Un changement externe de titre ou d'état ne bloque pas le déplacement et ses valeurs confirmées sont préservées.

Aux bornes, les commandes impossibles sont désactivées ; un appel valide hors borne retourne l'état courant sans écriture. Après déplacement, annoncer la position et replacer le focus sur une commande disponible de la même étape, ou son titre si aucune commande n'est disponible. Les libellés accessibles identifient l'étape et les commandes restent utilisables au toucher sans survol.

**Alternative écartée :** envoyer seulement une direction depuis une liste potentiellement périmée. La précondition sur l'ordre évite de déplacer une étape par rapport à une voisine différente de celle vue par l'utilisateur, sans imposer une gestion de versions à toutes les ressources.

### 6. Deux milestones avec contrôles à chaque pause

| Milestone proposé | Résultat utilisable | Validation de sortie |
| --- | --- | --- |
| M1 — Décomposer et suivre | Créer, renommer, supprimer, terminer et rouvrir des étapes ; progression du parent, transitions simple/décomposée, ordre de création conservé | Métier/SQLite et migration, API, parcours PC/mobile simulé, types/lint/build, persistance/restauration, contrôle manuel PC et tactile réel |
| M2 — Réordonner les étapes | Monter/Descendre, ordre persistant, conflits entre appareils et focus accessible | Tests ciblés d'ordre/concurrence, non-régression M1, mêmes checks applicatifs et contrôle tactile du déplacement |

M1 ne présente aucune commande de déplacement factice ; M2 réalise toute l'exigence de réordonnancement. Avant Apply, l'utilisateur valide le découpage et autorise le milestone identifié. Le bilan distingue contrôles exécutés, résultats utilisateur et validations manquantes. Verify final reste à effectuer en contexte neuf, puis Archive sur demande.

## Risks / Trade-offs

- État parent matérialisé incohérent → centraliser toutes les mutations concernées dans des transactions et tester les échecs avec rollback ainsi que deux connexions à la même base.
- Brouillon parent confondu avec étapes enregistrées → séparer visuellement les commandes, afficher l'aide et vérifier Annuler/Retour après une mutation d'étape confirmée.
- Déplacement double après réponse perdue → absence de répétition automatique, blocage global et relecture ; contrôle `expectedOrder` côté serveur.
- Réponse ancienne entre lecture et mutation dans le même navigateur → conserver la sérialisation actuelle et tester les GET différés ; aucune garantie de synchronisation instantanée entre appareils.
- Lecture des étapes de toutes les tâches plus volumineuse → acceptable pour le périmètre personnel actuel, avec lecture en lot ; aucune pagination ou optimisation spéculative ajoutée.
- Viewport mobile insuffisant pour garantir le toucher → garder les validations tactiles M1/M2 ouvertes jusqu'au contrôle sur téléphone réel, sans modifier le réseau dans ce changement.

## Migration Plan

1. Tester la migration sur base vierge, depuis une base peuplée au schéma 0000 et depuis 0002 avec catégories, priorités, échéances et états variés ; réapplication et réouverture sans perte.
2. Avant migration personnelle, arrêter le service et effectuer une copie cohérente vers un emplacement distinct selon le [protocole existant](../../../documentation/EXPLOITATION_M3.md). Les checks du changement utilisent exclusivement des données jetables.
3. Appliquer explicitement `pnpm db:migrate`, puis lancer le code compatible ; le démarrage ne migre pas automatiquement. M2 n'ajoute pas de migration.
4. Vérifier après redémarrage et restauration les identités, contenus, états et ordres des étapes ainsi que tous les champs des parents et catégories. La suppression du parent ne laisse aucune étape persistante.
5. Aucun retour destructif automatique ni migration inverse. Restaurer une copie antérieure avec sa version de code compatible abandonne les changements postérieurs ; conserver la base actuelle séparément avant une telle décision.
