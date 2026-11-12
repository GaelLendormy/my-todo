# Proposal

## Why

Le parcours de capture et de gestion fonctionne, mais toutes les tâches restent dans une liste sans classement ni indication de priorité ou d'échéance. Ce changement permet de les organiser et de retrouver ce qui compte, avant d'aborder la préparation de journée prévue au MVP.

## What Changes

- **M1 — Classer et retrouver** : catégories libres, une seule catégorie facultative par tâche ; autocomplétion sur les catégories enregistrées et création explicite d'une nouvelle catégorie. Les différences de casse et les espaces superflus ne créent pas de doublons.
- Permettre de renommer une catégorie en conservant ses associations et de la supprimer en conservant toutes ses tâches, qui deviennent non classées.
- Ajouter la navigation directe entre Boîte de réception (tâches sans catégorie), Toutes les tâches et chaque catégorie, sur ordinateur et téléphone.
- **M2 — Repérer ce qui compte** : priorités Sans priorité (défaut), Basse, Normale et Haute ; date limite facultative ; échéances et retards visibles ; filtres par catégorie, priorité et échéance dans Toutes les tâches.
- Étendre le détail existant pour modifier ces informations tout en conservant l'ajout rapide avec le titre seul, le cycle de vie des tâches et les protections d'enregistrement. Après confirmation d'Enregistrer, fermer le détail et revenir à la liste sur ordinateur et téléphone ; conserver le brouillon ouvert en cas d'échec ou de résultat incertain, conformément au retour utilisateur après les essais A37.
- Préserver les tâches existantes par migrations versionnées : elles démarrent sans catégorie, sans priorité et sans date limite. Chaque milestone fournit un résultat utilisable et vérifié ; Apply nécessite une autorisation distincte pour chacun.

### Exclusions

Étapes, durées, jour prévu, Ma journée, À replanifier, IA et glisser-déposer restent pour des changements ultérieurs. Aucun classement hiérarchique, étiquettes multiples, fusion de catégories, tri manuel ou automatique par importance, compte, service cloud ou changement de déploiement. L'accueil provisoire reste la Boîte de réception ; la cible Ma journée de la direction UI est différée jusqu'à sa réalisation.

## Capabilities

### New Capabilities

- `task-organization` : cycle de vie et unicité des catégories, classement facultatif, navigation et filtres, priorités et dates limites avec visibilité des retards.

### Modified Capabilities

- `task-management` : capture sans catégorie dans toutes les vues, consultation persistante des nouvelles informations et édition du détail depuis les vues de classement, avec reprise après erreur étendue aux catégories.

## Impact

Évolutions de `app/app.vue` et `app/components/TaskList.vue`, extraction de composants et d'état partagés selon les responsabilités ; types partagés, règles métier et schéma SQLite ; API de catégories et mises à jour partielles des tâches. Le middleware actuel ne protège que `/api/tasks` : ses contrôles devront couvrir les nouvelles API de catégories. Deux migrations incrémentales et tests sur données jetables sont prévus, sans nouvelle dépendance requise ni modification des données personnelles pendant les checks.

Références : [brief](../../../../documentation/PROJECT_BRIEF.md), [Foundation](../../../../documentation/PROJECT_FOUNDATION.md), [direction UI](../../../../documentation/UI_DIRECTION.md), [gestion existante](../../../specs/task-management/spec.md). Les décisions de catégories, priorités et découpage ont été validées dans la conversation ; les détails proposés dans le design restent relisibles avant Apply. Aucun code applicatif n'est modifié par cette proposition.
