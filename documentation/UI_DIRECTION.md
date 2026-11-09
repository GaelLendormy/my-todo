# My To Do — Direction UI du MVP

Exploration du 9 novembre 2026, sans implémentation. Ce document consigne les décisions d’interface retenues avec l’utilisateur. Les parcours et états reprennent aussi les contraintes du [brief produit](PROJECT_BRIEF.md) et des [fondations techniques](PROJECT_FOUNDATION.md). Les modalités non arbitrées sont regroupées en fin de document.

## Intention

Une interface calme pour capturer rapidement une tâche, retrouver ce qu’on a choisi de faire et préparer une journée réaliste. Les tâches et les actions occupent l’essentiel de l’écran.

L’usage principal se fait sur ordinateur. Le téléphone sert à consulter les listes et à faire de petits ajouts au domicile. L’interface reste en français.

## Décisions retenues

- Ouvrir l’application sur **« Ma journée »**.
- Garder **l’ajout rapide toujours accessible**.
- Prévoir une navigation vers **Ma journée**, **Boîte de réception**, **Toutes les tâches**, **À replanifier**, avec son compteur, et les **catégories**.
- Ouvrir les détails d’une tâche dans un **panneau latéral sur ordinateur**, en conservant la liste visible. Sur téléphone, présenter ce contenu dans un **écran dédié avec un bouton retour**.
- Distinguer les gestes : **cocher pour terminer**, **cliquer sur le titre pour ouvrir les détails**.
- Examiner la préparation de journée par l’IA dans une **vue de révision dédiée**. Les propositions peuvent être ajustées, retenues ou refusées avant application explicite.
- Accompagner la proposition d’une **courte explication de l’IA**, avec une synthèse et une raison courte pour chaque changement.
- Adopter une ambiance **claire, sobre et légèrement chaleureuse**, avec un accent bleu.

## Écrans et surfaces

Les listes par catégorie et par échéance font partie du périmètre du brief ; elles n’impliquent pas un écran entièrement distinct pour chaque filtre.

| Surface | Contenu et rôle |
| --- | --- |
| Ma journée | Liste ordonnée des actions prévues pour le jour consulté. Case à cocher, titre, durée si renseignée, échéance éventuelle et nom de la tâche parente pour une étape. Accès à l’ajout rapide et à « Préparer avec l’IA ». |
| Boîte de réception | Tâches non classées, capturées sans obligation de préciser leur organisation. |
| Toutes les tâches | Consultation et organisation des tâches, avec accès aux vues par catégorie et par échéance, et visibilité des retards. |
| À replanifier | Actions non terminées dont le jour prévu est passé. Le compteur signale leur présence sans les ajouter automatiquement à la journée. |
| Détail d’une tâche | Titre, catégorie, priorité, date limite et étapes. Les actions planifiables portent leur jour prévu et leur durée éventuelle. Accès à la modification et à la préparation des étapes. |
| Révision du plan assisté | Temps disponible indiqué pour la demande, proposition expliquée, modifications ajustables et sélection explicite des changements à appliquer. |

### Ma journée

La liste reste une suite d’actions ordonnées, sans calendrier ni créneaux horaires. Une durée absente n’empêche ni la présence d’une action ni son exécution.

Une tâche sans étapes peut apparaître directement. Une tâche décomposée apparaît à travers ses étapes planifiées, chacune accompagnée du nom de sa tâche parente ; le parent n’est pas planifié en plus.

Le jour prévu et la date limite sont deux informations distinctes. Changer le jour prévu ne change pas l’échéance et ne fait pas disparaître un retard.

### Détail d’une tâche

Sur ordinateur, le panneau conserve le contexte de la liste. Sur téléphone, le bouton retour permet de retrouver cette liste.

Les étapes restent sur un seul niveau. Leur création est possible manuellement ou à partir d’une proposition IA à ajuster et confirmer dans le détail de la tâche. Leur planification et leur réalisation sont indépendantes.

### Révision du plan assisté

Le temps disponible est renseigné lors de la demande ; il n’est pas nécessaire pour organiser sa journée manuellement.

La vue rend identifiables les ajouts, les déplacements de jour, les changements d’ordre et les estimations de durée proposés. L’utilisateur peut ajuster ces éléments et décocher les changements refusés avant d’appliquer sa sélection.

Deux actions explicites concluent la révision : **« Abandonner »** et **« Appliquer la sélection »**. Abandonner conserve le plan enregistré. La génération seule ne modifie aucune tâche ni aucun plan.

L’explication reste courte et liée aux éléments réellement utilisés pour construire la proposition. Elle doit aider à décider, sans promettre une précision que les durées estimées ne permettent pas.

Exemples de formulation, à adapter au contenu réel :

- Synthèse : « J’ai privilégié les échéances proches dans les deux heures disponibles. »
- Motif par changement : « Échéance demain », « Priorité élevée » ou « Report proposé faute de temps ».

## Parcours essentiels

### Capturer et organiser

```text
Ajout rapide --> Titre --> Tache en boite de reception
                                |
                                v
                       Detail de la tache
                                |
                                v
                Classement et informations facultatives
```

Le titre suffit pour capturer. Catégorie, priorité, date limite, jour prévu et durée ne doivent pas devenir des étapes obligatoires de la saisie rapide. Les niveaux de priorité et leur valeur par défaut restent à arbitrer.

### Préparer une tâche

Ouvrir son détail, ajouter des étapes manuellement ou demander une décomposition à l’IA, puis ajuster et confirmer les étapes retenues. Une proposition non confirmée reste un brouillon.

### Préparer sa journée

L’utilisateur peut affecter des actions à un jour et les ordonner manuellement. Il peut aussi demander une aide en indiquant son temps disponible.

```text
Ma journee --> Demande IA --> Proposition expliquee
                                  |
                                  v
                         Ajustement et selection
                                  |
                                  v
                         Confirmation explicite
                                  |
                                  v
                            Plan enregistre
```

L’IA tient compte du plan existant et examine aussi les actions en attente et à replanifier. Après adoption, le plan reste consultable et modifiable sans nouvelle génération. Aucune régénération automatique n’est prévue.

### Suivre et replanifier

Cocher une action réalisée directement dans la liste, ouvrir son titre pour consulter ses détails, ou modifier son ordre et son jour prévu. Les actions inachevées des jours passés restent dans « À replanifier » jusqu’à une décision de l’utilisateur.

Le glisser-déposer prévu par le brief sert à ordonner les actions, les déplacer entre jours et déplacer les tâches entre catégories. Ses modalités sur ordinateur et téléphone restent à préciser.

## États à couvrir

Cette grille traduit les règles du brief et de Foundation en situations à rendre compréhensibles. Les libellés exacts et la présentation détaillée seront précisés dans les changements concernés.

| État | Comportement attendu |
| --- | --- |
| Journée vide | Dire qu’aucune action n’est prévue pour ce jour ; garder un accès à la préparation manuelle et assistée. Ne pas laisser entendre qu’il n’existe aucune tâche ailleurs. |
| Boîte de réception vide | Indiquer qu’aucune tâche n’attend de classement ; l’ajout rapide reste accessible. |
| Aucune action à replanifier | Indiquer qu’aucune action passée n’est à reprendre. |
| Aucune tâche dans une vue | Distinguer une liste vide d’une absence de résultat dans la catégorie ou la vue par échéance consultée. |
| Action sans date ou sans durée | Afficher l’action sans imposer de compléter les informations facultatives. |
| Échéance dépassée | Montrer un libellé explicite de retard, en complément de la couleur, même si l’action a été déplacée vers un autre jour. |
| Jour prévu passé | Rendre l’action non terminée visible dans « À replanifier », sans report automatique. Cet état est distinct d’une échéance dépassée. |
| Action terminée ou rouverte | Permettre la réouverture. Une tâche décomposée est terminée lorsque toutes ses étapes le sont ; rouvrir une étape rouvre le parent. |
| Chargement ou enregistrement | Rendre l’attente perceptible et distinguer une modification en cours d’une modification enregistrée. |
| Échec de chargement ou d’enregistrement | Rendre l’échec visible ; ne pas présenter une modification non enregistrée comme acquise. La reprise détaillée reste à définir. |
| Génération IA en cours | Signaler la génération. Le plan enregistré reste consultable ; la génération ne change pas les données. |
| Proposition IA à examiner | Présenter les changements comme un brouillon, avec leurs explications et une confirmation explicite avant application. |
| IA indisponible, délai dépassé ou réponse invalide | Expliquer que la proposition n’a pas pu aboutir. Préserver le plan enregistré et le fonctionnement manuel lorsque les données sont accessibles. |
| Application inaccessible depuis le téléphone | L’accès dépend du PC allumé et du service accessible sur le réseau domestique. Aucun mode hors connexion n’est prévu ; si l’application ne peut pas se charger, le navigateur peut être seul à signaler l’échec. |

## Direction visuelle

- **Fond blanc cassé**, surfaces blanches et séparations discrètes.
- **Texte sombre**, typographie simple et lisible.
- **Accent bleu** pour les actions et la sélection.
- **Listes aérées**, avec peu d’encadrements et une hiérarchie claire entre titre, tâche parente et informations secondaires.
- **Rouge réservé aux erreurs et aux échéances dépassées**, accompagné d’un libellé explicite : la couleur seule ne porte pas l’information.

La priorité est la lisibilité des actions et des informations utiles à la décision. La palette exacte, la police, les espacements et les dimensions ne sont pas encore fixés. Aucun thème sombre n’a été décidé pour le MVP.

## Points restant à arbitrer

- Niveaux de priorité et valeur par défaut, question déjà ouverte dans le brief.
- Forme de la navigation sur téléphone, en conservant les destinations retenues et l’accès à l’ajout rapide.
- Présentation des jours voisins et moyens de réordonner, déplacer ou classer une action sans dépendre du glisser-déposer, notamment au clavier et sur téléphone.
- Détails de la sélection des actions à ajouter manuellement à une journée et de la modification des propositions IA.
- Présentation et réouverture des actions terminées, confirmation ou annulation d’une suppression.
- Gestion d’un brouillon non enregistré à la fermeture du détail, d’un échec d’enregistrement et d’une proposition IA devenue obsolète après une modification des tâches ou du plan.
- Effet d’une décomposition sur une tâche déjà planifiée : à préciser dans le changement concerné en préservant l’absence de double planification.

Ces questions ne remettent pas en cause les décisions retenues ci-dessus. Ce document ne crée aucun changement OpenSpec et ne constitue pas une autorisation d’implémenter.
