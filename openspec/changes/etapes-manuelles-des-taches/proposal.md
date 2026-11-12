# Proposal

## Why

La capture et l'organisation des tâches sont livrées, mais une tâche complexe ne peut pas encore être transformée en actions concrètes. Les étapes manuelles apportent ce parcours du MVP et clarifient le cycle de vie des actions avant leur future planification quotidienne.

## What Changes

- Ajouter dans le détail des étapes sur un seul niveau : titre, état de réalisation et ordre enregistré ; création, renommage et suppression explicites.
- Calculer la progression du parent à partir de ses étapes. Tant qu'il en possède, seul le changement d'état des étapes pilote sa réalisation ; aucune commande ne termine ou ne rouvre toutes les étapes d'un coup.
- Ajouter toute nouvelle étape à faire en fin de liste, y compris sur une tâche terminée, qui est alors rouverte. Supprimer la dernière étape conserve l'état du parent juste avant suppression et lui rend sa réalisation manuelle.
- Afficher la progression dans les listes et le détail, préserver l'ordre des étapes lorsqu'elles sont terminées ou rouvertes et permettre de les réordonner avec Monter et Descendre, au clavier et au toucher.
- Préserver tâches, catégories, priorités et échéances existantes par migration incrémentale, ainsi que les confirmations serveur, brouillons et reprises après erreur.
- Proposer deux milestones utilisables : **M1 — Décomposer et suivre**, puis **M2 — Réordonner les étapes**. Le périmètre et les règles métier sont validés ; ce découpage et les détails du design sont proposés à la relecture avant Apply. Aucun milestone d'implémentation n'est autorisé par cette préparation.

### Exclusions

Jour prévu, durées, Ma journée, À replanifier, IA et glisser-déposer restent pour les changements suivants. Pas de sous-étapes, de déplacement d'étapes entre parents, de catégories/priorités/échéances propres aux étapes, ni de modification du déploiement. L'accueil reste la Boîte de réception et l'ordre des listes de tâches reste inchangé.

## Capabilities

### New Capabilities

- `task-steps` : étapes manuelles d'une tâche, progression calculée, transitions entre tâche simple et tâche décomposée, ordre persistant et commandes accessibles de réordonnancement.

### Modified Capabilities

- `task-management` : réalisation directe réservée aux tâches simples, persistance des étapes, suppression du parent avec ses étapes, reprise après erreur et accessibilité étendues aux étapes ; distinction entre enregistrement du formulaire parent et opérations d'étapes.

## Impact

Migration SQLite additive, schéma et types partagés ; règles métier transactionnelles et routes imbriquées sous `/api/tasks/:id/steps`. Adaptation de `app/app.vue`, `TaskDetail.vue`, `TaskList.vue` et de l'état de ressources ; composant d'étapes dédié selon les responsabilités. Tests métier/SQLite, API et Playwright, contrôles de persistance/restauration et documentation d'utilisation à étendre. Aucune dépendance supplémentaire attendue.

Références : [brief](../../../documentation/PROJECT_BRIEF.md), [Foundation](../../../documentation/PROJECT_FOUNDATION.md), [direction UI](../../../documentation/UI_DIRECTION.md), [gestion existante](../../specs/task-management/spec.md). Cette préparation crée uniquement les artefacts du changement, sans code applicatif ni modification des specs principales.
