# Proposal

## Why

My To Do dispose d'un cadrage produit, technique et visuel, mais d'aucune application. Ce premier changement fournit un parcours utilisable pour capturer et gérer des tâches persistantes sur ordinateur et téléphone au domicile, sans englober tout le MVP.

## What Changes

- Mettre en place le socle Nuxt/Vue, TypeScript strict, pnpm et SQLite avec Drizzle nécessaire au parcours.
- Ouvrir provisoirement l'application sur la **Boîte de réception**, avec un ajout rapide à partir d'un titre.
- Permettre de modifier le titre, terminer, rouvrir et supprimer une tâche. Confirmer toute suppression définitive en affichant son titre.
- Regrouper les tâches terminées dans une section **« Terminées »**, repliée par défaut en bas de la liste.
- Enregistrer les modifications côté serveur ; rendre explicites les attentes et les erreurs d'enregistrement.
- Permettre la consultation et les petits ajouts sur téléphone via le réseau domestique, avec la même base que sur ordinateur.
- Découper l'implémentation en trois milestones validés : **M1 Capturer et retrouver**, **M2 Gérer les tâches**, **M3 Valider l'usage au domicile**. Chaque milestone a ses checks et nécessite une autorisation d'Apply distincte.

### Exclusions

Catégories, priorités, échéances, étapes, durées, planification, Ma journée, À replanifier, glisser-déposer et IA sont reportés. Aucun écran factice pour ces fonctions, compte utilisateur, accès Internet, mode hors connexion, corbeille, synchronisation en temps réel ou service cloud n'est ajouté. Les vues ordinateur et téléphone retrouvent les changements au chargement ou à l'actualisation.

## Capabilities

### New Capabilities

- `task-management` : capture, consultation persistante et cycle de vie des tâches dans la boîte de réception, avec détails et états d'enregistrement.
- `home-network-access` : accès ordinateur/téléphone à une source de données commune sur le réseau domestique et limites de cet accès.

### Modified Capabilities

Aucune : l'inventaire OpenSpec actuel est vide.

## Impact

Création future de l'application, des API de tâches, des migrations, de l'outillage et des tests. La base locale devra rester hors Git, avec des données de développement, test et usage personnel distinctes. Les règles du pare-feu et la validation sur un vrai téléphone nécessiteront le contexte du domicile ; aucune modification système n'est réalisée pendant la proposition.

Références : [brief](../../../documentation/PROJECT_BRIEF.md), [Foundation](../../../documentation/PROJECT_FOUNDATION.md), [direction UI](../../../documentation/UI_DIRECTION.md). L'accueil provisoire et les modalités des tâches terminées et de suppression ont été validés dans la conversation ; ils précisent ce changement sans remplacer la direction finale du MVP. La destination et la fréquence des sauvegardes restent à arbitrer avant l'usage quotidien, conformément à Foundation.
