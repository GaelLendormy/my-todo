# My To Do

## 1. Vision / problème

My To Do est un outil personnel pour vider sa tête sans perdre les choses importantes et savoir quoi faire au bon moment. Les tâches sont actuellement dispersées entre papiers et listes Excel ; les noter ne suffit pas toujours à passer à l’action.

Le MVP rassemble ces tâches, permet de les transformer en actions concrètes et aide à préparer une journée réaliste. À plus long terme, le produit pourrait devenir un hub personnel intégrant obligations et calendrier. Cette perspective reste à réévaluer à l’usage et ne constitue pas un engagement de réalisation.

## 2. Utilisateurs ou contexte

Le produit est destiné à son créateur, pour un usage personnel principalement à la maison. L’ordinateur sert à la saisie, à l’organisation et aux demandes d’assistance ; le téléphone permet de consulter les listes et de faire de petits ajouts.

L’utilisateur peut organiser sa journée manuellement. Il sollicite ponctuellement une IA locale lorsqu’il souhaite une aide à la décomposition ou à la préparation de sa journée.

## 3. Objectifs

- Capturer rapidement une tâche sans devoir immédiatement la classer ou la planifier.
- Centraliser les tâches et rendre leurs priorités et échéances visibles.
- Décomposer une tâche en étapes concrètes pour faciliter son exécution.
- Choisir et ordonner les actions d’une journée en tenant compte du temps disponible.
- Garder visibles les tâches inachevées sans les accumuler automatiquement dans la journée suivante.
- Conserver un plan consultable et modifiable après la demande d’assistance, sans nouvelle sollicitation de l’IA.

## 4. Non-objectifs

Le MVP ne comprend pas de calendrier, de gestion d’événements ou de déplacements, ni de planification sur des créneaux horaires. Les obligations telles que les tournois pourront être étudiées ultérieurement ; les actions associées, comme envoyer une inscription avant une date limite, peuvent déjà être des tâches.

Les bilans automatiques du matin ou du midi et l’accès à distance hors du domicile sont exclus du MVP. Leur intérêt sera réévalué à l’usage. L’assistance ne modifie pas automatiquement les tâches ou le plan existant.

## 5. Principaux parcours

- **Capturer et organiser** : noter un titre, conserver la tâche dans une boîte de réception ou la classer, puis compléter au besoin sa priorité, sa date limite et son jour prévu.
- **Préparer une tâche** : ajouter des étapes manuellement ou demander une décomposition à l’IA, puis ajuster et confirmer les propositions retenues.
- **Préparer sa journée** : choisir des tâches ou des étapes et les ordonner manuellement ; éventuellement indiquer un temps disponible et demander à l’IA une proposition à partir du jour prévu, des échéances, des priorités et des tâches encore en attente.
- **Adopter un plan assisté** : examiner les ajouts et modifications suggérés, les ajuster et confirmer ceux à appliquer. Le plan adopté est enregistré.
- **Suivre et replanifier** : consulter le plan sur ordinateur ou téléphone, terminer les actions réalisées et modifier leur ordre ou leur jour prévu. Les tâches inachevées des jours passés restent visibles dans « À replanifier » et peuvent être réexaminées lors d’une nouvelle demande à l’IA.

## 6. Fonctionnalités MVP

- Ajout rapide à partir d’un titre et boîte de réception pour les tâches non classées.
- Catégories, priorité et date limite facultative.
- Modification, suppression, passage à l’état terminé et réouverture d’une tâche.
- Étapes d’une tâche, créées manuellement ou proposées par l’IA.
- Vues de toutes les tâches, par catégorie et par échéance, avec visibilité des retards.
- Affectation à un jour et vue « Ma journée » sous forme de liste ordonnée d’actions avec des durées estimées.
- Glisser-déposer pour ordonner les tâches et les déplacer entre catégories ou jours.
- Vue « À replanifier » pour les tâches prévues un jour passé et non terminées.
- Assistance locale à la demande pour décomposer une tâche et proposer un plan selon le temps disponible indiqué par l’utilisateur.
- Enregistrement du plan adopté, consultation et modification manuelle sans dépendre d’une nouvelle génération.
- Consultation et petits ajouts sur téléphone à la maison, en complément de l’usage principal sur ordinateur.

## 7. Principales règles métier

- Une tâche peut être saisie sans catégorie, sans date limite et sans jour prévu.
- Le jour où l’utilisateur prévoit d’agir est distinct de la date limite. Déplacer une tâche vers un autre jour ne modifie pas son échéance et ne masque pas un éventuel retard.
- Une tâche prévue un jour passé et non terminée apparaît dans « À replanifier » ; elle n’est pas automatiquement ajoutée à la journée suivante.
- Le plan quotidien est une liste ordonnée avec des durées estimées, sans horaires imposés. L’utilisateur place lui-même les actions dans sa journée.
- Pour organiser la journée, l’IA part des tâches déjà prévues et examine aussi les tâches en attente et à replanifier afin de suggérer des ajouts ou changements pertinents.
- Les décompositions, ajouts et modifications proposés par l’IA nécessitent une confirmation avant application. Une demande ne remplace pas silencieusement le plan existant.
- Le plan adopté persiste après la demande. Une nouvelle proposition nécessite une nouvelle sollicitation de l’utilisateur ; aucune régénération automatique n’est prévue.

## 8. Contraintes produit importantes

L’IA doit fonctionner localement, pour répondre aux attentes de confidentialité et de maîtrise du coût. Elle est sollicitée ponctuellement ; son indisponibilité ne doit pas empêcher la gestion manuelle des tâches ni la consultation du plan enregistré, dès lors que les données sont accessibles.

L’usage sur ordinateur et téléphone au domicile fait partie du MVP. La disponibilité des données sur téléphone lorsque l’ordinateur est éteint reste à préciser ; aucun fonctionnement permanent ou hors connexion n’est encore établi.

La saisie doit rester légère. Le temps disponible peut être indiqué lors d’une demande de préparation assistée, sans imposer une planification détaillée pour utiliser la liste de tâches.

## 9. Questions encore ouvertes

- Quels niveaux de priorité proposer et quelle valeur utiliser par défaut ?
- Comment renseigner, estimer et corriger les durées des tâches et de leurs étapes ?
- Quel accès aux données garantir sur téléphone lorsque l’ordinateur est éteint, et quel besoin de fonctionnement hors connexion retenir ?
