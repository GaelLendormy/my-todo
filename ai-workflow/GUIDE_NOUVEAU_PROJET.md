# Nouveau projet — guide court

## 1. Installer une fois, publier les évolutions explicitement

Ce dépôt conserve les versions de référence des deux skills et des trois agents. L’installation personnelle utilise des copies : modifier ce dépôt ne modifie pas immédiatement les outils actifs.

Depuis la racine de ce dépôt, pour une première installation (emplacements par défaut, sans `CODEX_HOME` personnalisé) :

```bash
mkdir -p "$HOME/.agents/skills" "$HOME/.codex/agents"
cp -R -i skills/project-discovery "$HOME/.agents/skills/"
cp -R -i skills/project-foundation "$HOME/.agents/skills/"
cp -i agents/product_challenger.toml agents/code_reviewer.toml agents/behavior_validator.toml "$HOME/.codex/agents/"
```

`-i` demande confirmation avant d’écraser un fichier existant. Pour publier une évolution, relire le diff dans ce dépôt puis recopier uniquement les fichiers validés. Commencer un nouveau chat pour essayer les nouvelles instructions ; redémarrer Codex si les skills n’apparaissent pas. Vérifier que les deux skills sont visibles et que les agents sont reconnus avant leur première utilisation. Les contrats détaillés sont dans [agents/README.md](agents/README.md).

## 2. Préparer chaque projet

1. Créer ou ouvrir le dépôt du nouveau projet dans Codex.
2. Intégrer le bloc [templates/AGENTS.project.md](templates/AGENTS.project.md) dans son `AGENTS.md`, sans écraser ses consignes existantes.
3. Si OpenSpec n’est pas installé, suivre son [installation officielle](https://openspec.dev/docs/installation). À la racine du projet :

```bash
openspec init --tools codex
openspec config profile
```

Dans le sélecteur de workflows, conserver les workflows core et ajouter **verify**. Cette préférence est globale à la machine. Appliquer la sélection au projet avec `openspec update` si le sélecteur ne l’a pas déjà fait. Vérifier la présence de `openspec-verify-change` avec les autres skills OpenSpec ; relancer Codex si nécessaire. Versionner les fichiers de projet générés.

## 3. Prompts à envoyer dans l’ordre

Les prompts s’adressent au **Codex principal** ; celui-ci lance les agents nommés. Remplacer les éléments entre `<…>`. Les étapes optionnelles peuvent être sautées. Valider le cadrage et les arbitrages avant de poursuivre.

| Étape | Prompt |
| --- | --- |
| Discovery | `Utilise $project-discovery pour cadrer cette idée : <idée>. Discutons du MVP avant de rédiger le brief. Ne code rien.` |
| Challenger, optionnel | `Lance product_challenger sur documentation/PROJECT_BRIEF.md, dans un contexte neuf sans historique, avec uniquement la mission et le brief. Attends sa restitution ; discutons des constats avant de modifier le brief.` |
| Foundation | `Utilise $project-foundation à partir du brief validé et de l’existant. Propose les décisions globales, puis rédige Foundation après notre accord. Ne code rien.` |
| UI/UX, si utile | `Avec $openspec-explore, explorons les écrans, parcours, états et direction visuelle du MVP. Ne code rien. Consigne les décisions retenues dans documentation/UI_DIRECTION.md.` |
| Explore | `Avec $openspec-explore, lis le cadrage et explore le dépôt pour <fonctionnalité>. Délimitons un changement cohérent, ses exclusions et les arbitrages nécessaires. Ne code rien.` |
| Propose | `Avec $openspec-propose, prépare le changement <nom> selon le scope convenu, avec les validations utiles et des milestones limités et vérifiables. Arrête-toi avant Apply pour validation.` |
| Apply | `Avec $openspec-apply-change, implémente uniquement le milestone <nom> du changement <id>. Effectue ses checks, mets à jour les tâches et le checkpoint si utile, puis fais un bilan et attends mon accord.` |
| Milestone suivant | `Poursuis uniquement avec le milestone <nom>, selon les mêmes règles.` |
| Enchaînement exceptionnel | `Tu peux enchaîner les milestones <liste> du changement <id>, avec leurs checks. Arrête-toi si un arbitrage, un blocage ou un élargissement du scope apparaît.` |
| Verify, nouveau chat | `Utilise $openspec-verify-change sur <id>. Projet : <chemin>. Cible stable : <SHA ou état exact>. Sources : <chemins des artefacts et décisions validées>. Checks rapportés : <résultats>. Vérifications autorisées : <checks et environnement>. Vérifie la cohérence specs/design/tasks/code et restitue les écarts sans les corriger ni archiver.` |
| Archive | `Les vérifications et constats ont été traités ou arbitrés. Utilise $openspec-archive-change pour clôturer <id>, en contrôlant la synchronisation des specs.` |

Avant Verify, demander au chat d’implémentation un handoff factuel contenant les informations du prompt, puis ouvrir un nouveau chat dans le même projet. Discuter les constats et corriger dans le contexte d’implémentation ; refaire les vérifications affectées avant la clôture.

**Review technique ou fonctionnelle, à un milestone à risque ou avant Archive :**

```text
Lance <code_reviewer ou behavior_validator> en contexte neuf sans historique.
Projet : <chemin>. Changement et milestone : <id et nom>.
Base Git : <SHA>. Cible stable : <SHA ou état exact>.
Inclure : <commits, fichiers indexés/non indexés/non suivis>.
Attendu, contraintes, exclusions et reports validés : <faits et sources>.
Artefacts : <chemins>. Checks rapportés : <commandes et résultats>.
Vérifications autorisées : <checks ; environnement jetable identifié si écritures>.
Signale toute limite de contexte ou d’outil. Restitue les constats sans corriger.
```

Ne pas lancer les deux agents systématiquement. Si le contexte neuf n’est pas disponible, déclarer cette limite. Après review : vérifier les constats, arbitrer, corriger, puis relancer les vérifications utiles. **Archive vient en dernier.**

## 4. Faire évoluer le workflow après usage

```text
Relis les chats accessibles du projet <nom> sur <période> et confronte-les
au dépôt. Signale les limites de couverture. Identifie les frictions répétées,
les interventions récurrentes et les consignes inefficaces. Distingue les
particularités du projet des améliorations réutilisables. Propose les changements
au workflow, à AGENTS.md, aux skills ou aux agents sans les appliquer.
```

Après arbitrage : modifier les sources ici, conserver l’historique Git, puis publier explicitement les fichiers validés vers l’installation personnelle. Pas de synchronisation automatique ni de rétrospective programmée.

Sources vérifiées le 5 novembre 2026 : [skills Codex](https://learn.chatgpt.com/docs/build-skills), [agents Codex](https://learn.chatgpt.com/docs/agent-configuration/subagents), [initialisation OpenSpec](https://openspec.dev/docs/setup), [profils OpenSpec](https://openspec.dev/docs/profiles).
