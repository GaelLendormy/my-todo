# My To Do — Fondations techniques

Décisions validées le 9 novembre 2026, à partir du [brief produit](PROJECT_BRIEF.md) et de l’existant. Le dépôt ne contient encore ni application, ni dépendances, ni tests : les outils ci-dessous sont des choix à mettre en place. Les [consignes du dépôt](../AGENTS.md) restent applicables.

## Stack

- **TypeScript strict**, **Nuxt avec Vue et serveur intégré**, **pnpm** : une seule application pour l’interface et les API, avec un langage commun entre client et serveur.
- Interface web responsive pour ordinateur et téléphone, avec du CSS simple au départ. Les choix visuels et les bibliothèques propres à une interaction seront traités dans les changements concernés.
- **SQLite avec Drizzle**, via un pilote SQLite local : persistance relationnelle et requêtes typées sans serveur de base de données distinct. Les migrations seront versionnées avec l’application.
- Conservation du moteur **`llama serve`** déjà installé sur le PC ; aucune installation d’Ollama n’est nécessaire.

Les versions et le pilote SQLite précis seront choisis selon les compatibilités stables vérifiées au moment de l’installation. La vérification des pages officielles Nuxt n’a pas abouti pendant Foundation ; ses prérequis exacts restent à confirmer avant installation.

## Données et persistance

La base SQLite réside sur le disque du PC et constitue la source de vérité des tâches, étapes et plans adoptés. Seul le serveur applicatif y accède ; les navigateurs de l’ordinateur et du téléphone utilisent ses API. Aucun stockage métier autonome dans le navigateur ni synchronisation entre bases n’est prévu.

Le plan adopté persiste indépendamment de toute génération IA. Les modifications liées doivent préserver la cohérence métier, avec des transactions lorsque plusieurs écritures constituent une seule opération.

La base personnelle reste hors du dépôt Git et séparée des données de développement et de test. Une sauvegarde cohérente vers un emplacement distinct et une procédure de restauration vérifiée sont nécessaires avant l’usage quotidien. La destination et la fréquence restent à préciser avant cette mise en service.

## Architecture globale

L’application suit trois frontières : interface Vue, API serveur, puis règles métier et accès à la persistance. Les API contrôlent les entrées et les règles métier ; leur validité ne dépend pas des seuls contrôles de l’interface.

L’intégration IA est isolée dans un module serveur dédié. Le serveur appelle le moteur local via son API HTTP compatible OpenAI ; l’adresse et le modèle sont configurables. Le téléphone ne contacte pas directement le moteur.

Les réponses IA sont demandées sous forme structurée et validées techniquement et selon les règles métier. Elles restent des propositions jusqu’à confirmation humaine. Le moteur ne dispose d’aucun accès direct en écriture à la base. Une erreur, une réponse invalide ou une indisponibilité ne doit ni modifier silencieusement le plan, ni bloquer la gestion manuelle ; les appels ont une attente bornée.

Cette séparation permet d’envisager un autre hébergement ou fournisseur d’IA ultérieurement, sans construire plusieurs modes dès le MVP. Une telle évolution exigera ses propres arbitrages de persistance, d’accès, de confidentialité et de coût.

## Stratégie de tests et validation

- **Vitest** pour les règles métier à risque : états des tâches et étapes, distinction entre échéance et jour prévu, actions à replanifier et cohérence des propositions acceptées.
- Tests d’intégration avec une base SQLite isolée pour vérifier la persistance et les opérations impliquant plusieurs écritures. Tests de composants seulement lorsqu’ils couvrent une interaction critique utile.
- Quelques parcours **Playwright** pour vérifier l’enregistrement et la relecture des données, l’adoption explicite d’une proposition et le maintien du fonctionnement manuel lorsque l’IA est indisponible. Les tests automatisés utilisent des réponses IA maîtrisées ; la qualité du modèle réel est évaluée séparément sur le PC.

Le minimum de validation d’un milestone applicatif comprend les tests pertinents, la vérification des types, le lint, le build et un contrôle manuel des interactions modifiées. Les changements concernant le téléphone ou le glisser-déposer nécessitent une vérification tactile sur téléphone. Aucun quota de couverture n’est fixé ; les critères et cas précis appartiennent aux changements OpenSpec.

Ces contrôles applicatifs ne sont pas encore disponibles. Pour le présent document, la validation porte sur la cohérence avec le brief, les liens et le format Markdown.

## Exécution et déploiement

La cible initiale est le PC Linux actuel : Ryzen 7 3700X, environ 32 Go de RAM et carte graphique AMD de famille Navi 22. Ce constat matériel ne garantit ni l’accélération GPU, ni les performances d’un modèle précis.

L’application compilée fonctionne avec un serveur Node.js sur ce PC. Elle est accessible depuis les navigateurs sur le réseau domestique lorsque le PC est allumé et le service démarré. Le fonctionnement hors connexion n’est pas requis. Le moteur IA est un processus distinct ; son arrêt laisse l’application manuelle utilisable.

L’accès est **sans compte sur le réseau domestique de confiance**, limité par le pare-feu, avec contrôle des origines des requêtes. Les appareils autorisés sur ce réseau peuvent accéder aux tâches. Le moteur IA reste lié à l’adresse locale du PC. Aucune exposition à Internet n’est prévue ; tout accès extérieur ou usage sur un réseau non fiable exige de revoir la protection des accès et du transport.

Développement et usage personnel partagent la même stack mais utilisent des données distinctes. Aucun environnement cloud ni pipeline de déploiement n’est nécessaire au MVP.

**Supabase et Vercel ne sont pas retenus pour le MVP.** La plateforme Supabase auto-hébergée ajoute des services à exploiter sans besoin établi ; Vercel demanderait une persistance adaptée à son hébergement et un moyen de joindre l’IA du domicile. Ces pistes restent possibles à réévaluer, avec une migration explicite si nécessaire.

## Conventions et contraintes importantes

- Séparer présentation, règles métier, accès aux données et appels IA ; éviter les abstractions destinées uniquement à des évolutions hypothétiques.
- Valider les données à l’exécution aux frontières serveur, y compris les sorties IA ; le typage statique ne suffit pas.
- Garder les tâches et le plan en local ; ne pas transmettre leur contenu à un service IA externe. Éviter de journaliser leur contenu en fonctionnement normal.
- Conserver les éventuels secrets côté serveur et hors de Git. Aucune donnée personnelle réelle dans les jeux de test.
- Garder le schéma détaillé, les endpoints, les interactions et les règles propres à une fonctionnalité dans les changements OpenSpec concernés.

## Questions techniques ouvertes

| Question | Impact et moment de décision |
| --- | --- |
| Versions compatibles de Nuxt, Node.js, Drizzle et pilote SQLite local | À vérifier avant installation ; peut affecter l’outillage et la compilation, sans changer l’architecture retenue. |
| Modèle local, quantification et accélération disponibles | À tester avant intégration IA : qualité en français, respect des propositions structurées, mémoire et temps de réponse. Aucun niveau de performance n’est encore garanti. |
| Destination et fréquence des sauvegardes | À fixer et restauration à vérifier avant l’usage quotidien ; conditionne la récupération après perte ou corruption de la base. |

Les niveaux de priorité restent une question produit du brief. Le mécanisme précis de glisser-déposer et les autres choix propres aux fonctionnalités seront arbitrés dans leurs changements OpenSpec.

## Références techniques

- [SQLite : usages adaptés](https://sqlite.org/whentouse.html).
- [Drizzle : prise en charge de SQLite](https://orm.drizzle.team/docs/get-started-sqlite).
- [llama.cpp : serveur HTTP, API et sorties structurées](https://github.com/ggml-org/llama.cpp/tree/master/tools/server).
- [Supabase : auto-hébergement](https://supabase.com/docs/guides/self-hosting).
- [Vercel : limites de SQLite local](https://vercel.com/kb/guide/is-sqlite-supported-in-vercel).
