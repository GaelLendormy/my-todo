# Tasks

Le périmètre et les trois milestones ont été validés dans la conversation. Cette proposition ne vaut pas autorisation d'implémentation : demander Apply sur un milestone identifié. S'arrêter après ses checks et son bilan ; les milestones suivants restent non autorisés par défaut.

Références : [design](design.md), [gestion des tâches](specs/task-management/spec.md), [accès au domicile](specs/home-network-access/spec.md). Toutes les tâches ci-dessous restent à réaliser.

## 1. M1 — Capturer et retrouver

**Résultat attendu :** ouvrir la boîte de réception sur ordinateur, ajouter un titre et retrouver la tâche après rechargement et redémarrage du serveur. Les contrôles serveur, les erreurs d'ajout et l'isolation des données font partie de cet incrément.

- [ ] 1.1 Vérifier dans les documentations officielles les prérequis de Nuxt, Drizzle et d'un pilote SQLite local compatible avec le runtime disponible ; initialiser Nuxt/Vue, TypeScript strict et pnpm en préservant les documents existants. Vérifier l'installation et consigner les versions et le pilote retenus dans la documentation de développement et le lockfile.
- [ ] 1.2 Configurer typecheck, lint, build, Vitest et Playwright avec des commandes reproductibles ; vérifier qu'un premier build et les contrôles statiques s'exécutent, puis documenter ces commandes dans le README. Ne déclarer aucun résultat de test avant l'ajout des cas concernés.
- [ ] 1.3 Créer le schéma minimal des tâches, la migration et la configuration du chemin SQLite, hors ressources publiques et Git ; ajouter les tests d'intégration sur base temporaire. Vérifier migration sur base vierge, absence de perte lors d'une nouvelle application des migrations, contraintes de titre et relecture après fermeture/réouverture ; vérifier la séparation des chemins développement/test/personnel.
- [ ] 1.4 Implémenter lecture et création via les règles métier et l'accès aux données, avec validation serveur et erreurs maîtrisées ; tester titre normalisé, titre vide, mauvais types, propriétés inconnues et deux créations volontaires de même titre avec identifiants distincts.
- [ ] 1.5 Mettre en place le contrôle des origines des mutations et les règles de contenu JSON ; vérifier par tests API qu'une origine autorisée fonctionne et qu'une origine étrangère ou absente est refusée sans écriture. Vérifier que la base n'est pas accessible comme ressource HTTP et que les réponses de tâches ne sont pas mises en cache durablement.
- [ ] 1.6 Construire la boîte de réception, l'ajout rapide et les états vide/chargement/erreur/enregistrement ; vérifier avec Playwright l'ajout puis rechargement, le refus d'un titre vide, la prévention des doubles clics pendant l'attente, la conservation de la saisie après refus et la relecture proposée après résultat réseau incertain.
- [ ] 1.7 Documenter démarrage, migration, chemins de données et origines de développement dans le README ; vérifier les commandes documentées sur des données jetables. Lancer un serveur compilé, ajouter une tâche puis le relancer sur la même base et vérifier sa présence.
- [ ] 1.8 Exécuter les tests M1, typecheck, lint et build ; contrôler manuellement ajout, actualisation, clavier et rendu à taille mobile sur ordinateur. Produire le bilan M1 avec les résultats réels, les limites dont le contrôle tactile encore à faire et un checkpoint si utile ; attendre l'autorisation de M2.

## 2. M2 — Gérer les tâches

**Dépendance :** M1 vérifié et M2 explicitement autorisé.

**Résultat attendu :** modifier, terminer, rouvrir et supprimer une tâche, avec confirmation serveur et affichage cohérent des tâches terminées.

- [ ] 2.1 Ajouter les mises à jour partielles du titre et de l'état cible, et leurs tests métier/API/intégration ; vérifier conservation des autres champs, refus d'un titre vide ou d'un état invalide, répétition d'un même état sans bascule et réponse maîtrisée pour une tâche absente.
- [ ] 2.2 Ajouter la suppression serveur et ses tests d'intégration ; vérifier la suppression des tâches actives et terminées, l'absence persistante après réouverture de la base et l'impossibilité de recréer implicitement une cible supprimée par une mise à jour tardive.
- [ ] 2.3 Ajouter le détail en panneau sur ordinateur et vue dédiée sur téléphone, avec enregistrement et annulation du titre ; vérifier avec Playwright que le clic sur le titre ne termine pas la tâche, que l'enregistrement conserve son état et que l'annulation ou le retour abandonne le brouillon non enregistré. Vérifier le retour à la liste et la gestion du focus.
- [ ] 2.4 Ajouter les cases de réalisation et la section Terminées repliée par défaut ; tester le passage dans chaque sens, l'ordre stable, le maintien de l'état ouvert/replié lors du retour du détail et l'ouverture du détail d'une tâche terminée sans réouverture involontaire.
- [ ] 2.5 Ajouter la confirmation de suppression avec titre, Annuler et Supprimer ; tester les deux issues dans le navigateur, l'accès au clavier, le retour du focus et le maintien de la tâche si le serveur refuse la suppression.
- [ ] 2.6 Étendre les tests d'erreur aux modifications, réalisations et suppressions ; simuler des refus certains et des réponses réseau perdues. Vérifier qu'aucun succès fictif ni répétition automatique n'apparaît, que le titre saisi reste disponible après échec et que la relecture permet de retrouver l'état serveur.
- [ ] 2.7 Documenter les gestes de gestion, l'abandon des brouillons et la reprise après erreur ; vérifier le parcours complet dans Playwright, exécuter les tests pertinents, typecheck, lint et build, puis contrôler manuellement les interactions au clavier et le rendu mobile. Produire le bilan M2 et attendre l'autorisation de M3 ; le contrôle tactile reste à réaliser sur téléphone.

## 3. M3 — Valider l'usage au domicile

**Dépendance :** M2 vérifié et M3 explicitement autorisé. Les vérifications qui nécessitent le téléphone, le réseau ou un choix de sauvegarde restent ouvertes tant que ces éléments manquent.

**Résultat attendu :** vérifier le parcours complet sur le PC et un vrai téléphone, documenter l'exploitation et la récupération, et distinguer toute limite restante avant l'usage quotidien.

- [ ] 3.1 Documenter et vérifier le lancement du serveur compilé, son adresse LAN, les origines autorisées, les chemins de données et la restriction du pare-feu au réseau domestique ; noter les constats réels et les éventuelles actions système nécessitant une autorisation. Vérifier l'accès PC/téléphone et le refus d'une origine web non autorisée sur la configuration retenue.
- [ ] 3.2 Effectuer sur un vrai téléphone les contrôles tactiles : ajout, consultation, détail avec retour, modification, réalisation/réouverture et confirmation de suppression. Vérifier l'absence de défilement horizontal et le maintien de l'ajout rapide ; consigner appareil, navigateur et résultats. Corriger dans le scope les défauts observés et relancer les checks affectés.
- [ ] 3.3 Vérifier avec des tâches jetables les échanges PC vers téléphone puis téléphone vers PC par actualisation, la persistance après redémarrage du service et le message d'échec d'une interface chargée lorsque le service s'arrête ; consigner les résultats et préciser l'absence de mode hors connexion ou de synchronisation instantanée.
- [ ] 3.4 Faire préciser avec l'utilisateur la destination distincte et la fréquence des sauvegardes avant l'usage quotidien ; documenter et exécuter sur données jetables une copie cohérente service arrêté et une restauration dans un emplacement isolé. Vérifier la relecture des titres et états restaurés sans toucher à une base personnelle ; ne pas ajouter de planification automatique des sauvegardes.
- [ ] 3.5 Exécuter les tests pertinents, typecheck, lint et build sur la cible finale ; consolider les résultats réseau/téléphone/restauration et préparer un handoff factuel pour Verify avec changement, état Git stable, artefacts, décisions, commandes réellement exécutées, limites et vérifications encore ouvertes. Ne pas déclarer M3 terminé si un contrôle requis reste manquant.

## Workflow follow-up

- Effectuer OpenSpec Verify dans un contexte neuf à partir du handoff, sans créer de chat automatiquement.
- Envisager une review indépendante seulement avec l'accord de l'utilisateur ; traiter les constats et refaire les vérifications affectées.
- Archiver uniquement après Verify et traitement ou arbitrage des constats. Aucune archive automatique à la fin d'Apply.
