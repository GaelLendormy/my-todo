# Consignes de développement du projet

Bloc à intégrer au `AGENTS.md` du projet, en conservant ses autres consignes et en adaptant les commandes de validation à son outillage.

## Références et périmètre

- Avant de planifier ou d’implémenter, consulte les documents existants pertinents : `documentation/PROJECT_BRIEF.md`, `documentation/PROJECT_FOUNDATION.md`, `documentation/UI_DIRECTION.md` et les specs et artefacts OpenSpec du changement. N’exige pas les documents des phases qui n’ont pas encore eu lieu.
- Le brief décrit le produit et le MVP ; Foundation fixe les décisions techniques globales ; OpenSpec précise le changement courant. Signale les contradictions nécessitant un arbitrage sans choisir silencieusement une interprétation.
- Un changement couvre une fonctionnalité ou un ensemble étroitement lié à un parcours utilisable. Ne transforme pas automatiquement le MVP entier en un seul changement.
- Fais valider le scope, les décisions importantes et le découpage en milestones avant Apply. Chaque milestone doit fournir un résultat limité et vérifiable, avec ses validations prévues.

## Implémentation et reprise

- Par défaut, implémente uniquement le milestone autorisé. Exécute ses checks pertinents, mets à jour les tâches OpenSpec selon le travail réellement terminé, puis donne un bilan court : résultat, checks et résultats, limites et suite proposée. Attends le feu vert avant le milestone suivant.
- L’enchaînement de plusieurs milestones exige une autorisation explicite précisant lesquels. Conserve les checks entre milestones ; arrête-toi en cas de blocage, d’échec non résolu, d’arbitrage ou d’élargissement important du scope.
- Une pause par milestone ne constitue pas un plafond de tokens. Si le travail s’avère trop large, propose un redécoupage plutôt que d’étendre silencieusement le milestone.
- Lorsque cela aide la reprise, tiens `runs/current.md` à jour : milestone et statut, travail effectué, fichiers utiles, checks et résultats, décisions ou écarts, problèmes connus et prochaine action. En cas d’interruption, indique précisément ce qui reste incomplet. Le checkpoint ne remplace ni les tâches ni Git.
- Applique la stratégie de tests et le minimum de validation définis dans Foundation. Ne présente pas un check non exécuté ou seulement rapporté comme un résultat vérifié.

## Reviews et clôture

- Suggère une review indépendante lorsqu’elle apporte une valeur concrète. Lance `product_challenger`, `code_reviewer` ou `behavior_validator` uniquement sur demande ou accord explicite, avec leur contrat de contexte et de permissions. Pas de review systématique après chaque tâche.
- Fournis un contexte neuf sans historique aux reviewers ; si ce lancement est indisponible, explicite la limite d’indépendance. Vérifie et déduplique leurs constats avant de corriger les défauts justifiés dans le périmètre autorisé. L’utilisateur arbitre le produit, le scope et les risques significatifs.
- À la fin du changement, effectue OpenSpec Verify dans un contexte frais : changement identifié, cible stable, chemins des artefacts, décisions validées et résultats de checks distingués des vérifications à réaliser. Si nécessaire, prépare un handoff pour un nouveau chat ; ne crée pas de chat automatiquement.
- Ordre de clôture : Verify → review finale éventuelle autorisée → corrections et vérifications utiles, dont Verify si la cohérence est affectée → Archive. Ne clôture pas avec des constats importants sans arbitrage et n’archive pas automatiquement à la fin d’Apply.
