# Spec Delta

## MODIFIED Requirements

### Requirement: Consultation persistante

Le système SHALL conserver tâches, catégories, associations et étapes confirmées après actualisation et redémarrage. Les listes de tâches SHALL garder l'ordre de création décroissante puis d'identifiant décroissant, sans tri par importance ni réordonnancement manuel des parents. L'ordre enregistré des étapes SHALL être conservé. La migration SHALL préserver tous les champs existants et laisser les tâches existantes sans étapes.

#### Scenario: Relecture après redémarrage
- **WHEN** l'utilisateur recharge la liste après le redémarrage du serveur qui a confirmé un enregistrement
- **THEN** il retrouve le titre, l'état, la catégorie, la priorité et la date limite enregistrés

#### Scenario: Migration des tâches existantes
- **WHEN** une base au schéma initial 0000 contenant des tâches actives et terminées reçoit les migrations jusqu'au schéma des étapes
- **THEN** tous leurs identifiants, titres, états et dates de création sont conservés ; elles restent sans catégorie, sans priorité et sans échéance jusqu'à modification explicite

#### Scenario: Étapes persistantes
- **WHEN** l'utilisateur recharge après un redémarrage ayant suivi des ajouts, renommages, réalisations et suppressions d'étapes confirmés
- **THEN** il retrouve les étapes, leurs identifiants, titres, états, ordre et la réalisation cohérente du parent

#### Scenario: Migration depuis l'organisation des tâches
- **WHEN** une base contenant des catégories, priorités, échéances et tâches actives ou terminées reçoit la migration des étapes
- **THEN** toutes ces données sont conservées et chaque tâche démarre sans étapes, avec son état antérieur

### Requirement: Ouverture et modification du détail

Le système SHALL ouvrir le détail en cliquant sur le titre : panneau latéral sur ordinateur, écran dédié avec retour sur téléphone. Il SHALL permettre d'enregistrer ou d'annuler les modifications du titre, de la catégorie, de la priorité et de la date limite sans changer l'état de réalisation. Un titre vide SHALL être refusé. Une modification invalide SHALL être refusée dans son ensemble.

#### Scenario: Modification enregistrée
- **WHEN** l'utilisateur ouvre le détail, modifie le titre puis enregistre avec succès
- **THEN** la liste présente le nouveau titre et l'état conservé, le détail se ferme et un message confirme l'enregistrement

#### Scenario: Annulation ou fermeture du détail
- **WHEN** l'utilisateur annule ou ferme le détail avant d'enregistrer ses changements
- **THEN** les informations enregistrées sont conservées et le brouillon de tâche est abandonné

#### Scenario: Retour sur téléphone
- **WHEN** l'utilisateur revient du détail à la liste d'origine sur téléphone
- **THEN** il retrouve la vue, ses filtres et l'état ouvert ou replié de sa section Terminées ; si la tâche n'y figure plus, le focus revient à un contrôle utilisable

#### Scenario: Plusieurs champs dans un enregistrement
- **WHEN** l'utilisateur enregistre simultanément un titre, une catégorie, une priorité et une échéance
- **THEN** tous les changements valides sont appliqués ensemble, ou aucun ne l'est si l'un des champs est invalide

#### Scenario: Opération d'étape indépendante du formulaire parent
- **WHEN** l'utilisateur confirme une opération d'étape pendant qu'un titre, classement, priorité ou date limite du parent est en cours de saisie
- **THEN** seule l'opération d'étape est enregistrée, le détail reste ouvert et le brouillon du parent est conservé

#### Scenario: Fermer après une opération d'étape confirmée
- **WHEN** l'utilisateur choisit Annuler ou Retour après un ajout ou renommage d'étape confirmé et avec un brouillon du parent non enregistré
- **THEN** le brouillon du parent est abandonné mais l'étape confirmée est conservée ; cette distinction est expliquée dans le détail

### Requirement: Réalisation et réouverture

Le système SHALL permettre de cocher une tâche sans étapes pour la terminer et de la décocher pour la rouvrir. Avec des étapes, il SHALL afficher une progression calculée sans commande globale et refuser toute modification directe de réalisation du parent. Terminées SHALL rester repliée à l'ouverture de la boîte et placée après les tâches à faire. Ouvrir le titre SHALL rester distinct du changement d'état.

#### Scenario: Terminer une tâche
- **WHEN** l'utilisateur coche une tâche sans étapes à faire et que l'enregistrement réussit
- **THEN** la tâche quitte les tâches à faire et devient consultable dans Terminées

#### Scenario: Rouvrir une tâche
- **WHEN** l'utilisateur ouvre Terminées et décoche une tâche sans étapes avec un enregistrement réussi
- **THEN** la tâche revient dans les tâches à faire sans changement de titre

#### Scenario: Consulter une tâche terminée
- **WHEN** l'utilisateur clique sur le titre d'une tâche dans Terminées
- **THEN** son détail s'ouvre sans la rouvrir

#### Scenario: Modification directe d'un parent décomposé
- **WHEN** un client demande un changement direct de réalisation d'une tâche possédant des étapes, même avec d'autres champs valides
- **THEN** la demande entière est refusée explicitement sans modification du parent ni des étapes

#### Scenario: Transition de réalisation dans le détail
- **WHEN** une opération d'étape termine ou rouvre le parent et le retire de la section ou du filtre consulté
- **THEN** la liste reflète le nouvel état sans changer son ordre relatif, le détail reste ouvert et un message explique la transition

### Requirement: Suppression confirmée et définitive

Le système SHALL permettre de supprimer une tâche à faire ou terminée après confirmation affichant son titre avec Annuler et Supprimer. Si elle possède des étapes, la confirmation SHALL annoncer leur suppression. Une suppression confirmée SHALL retirer définitivement le parent et toutes ses étapes en une seule opération, sans corbeille.

#### Scenario: Annuler la suppression
- **WHEN** l'utilisateur demande une suppression puis choisit Annuler
- **THEN** la tâche et son état restent inchangés

#### Scenario: Confirmer la suppression
- **WHEN** l'utilisateur confirme Supprimer et que le serveur confirme la suppression
- **THEN** la tâche disparaît et ne revient pas après rechargement ou redémarrage

#### Scenario: Suppression d'une tâche décomposée
- **WHEN** l'utilisateur confirme la suppression d'une tâche contenant des étapes actives et terminées
- **THEN** la tâche et toutes ses étapes disparaissent ensemble et restent absentes après rechargement et redémarrage

### Requirement: Enregistrement explicite et reprise après erreur

L'interface SHALL signaler les enregistrements en cours et empêcher les doubles soumissions. Elle SHALL conserver les brouillons après erreur, sans succès fictif ni répétition automatique. Une écriture incertaine SHALL imposer une relecture des tâches avec leurs étapes et des catégories avant toute nouvelle mutation. Ces protections SHALL couvrir aussi les catégories et toutes les opérations d'étapes, y compris le réordonnancement.

#### Scenario: Échec certain d'une écriture
- **WHEN** le serveur refuse ou ne peut pas enregistrer un ajout, un changement de détail ou d'état, une suppression de tâche ou une modification de catégorie
- **THEN** l'erreur est visible, la saisie éventuelle reste disponible et aucune modification non confirmée n'est présentée comme enregistrée

#### Scenario: Réponse perdue après une écriture
- **WHEN** une interruption réseau empêche de connaître le résultat d'une écriture
- **THEN** l'interface signale que le résultat est à vérifier et propose une relecture des tâches et catégories avant toute nouvelle soumission

#### Scenario: Lecture incomplète des tâches et catégories
- **WHEN** la relecture échoue pour l'une des deux listes
- **THEN** l'erreur reste visible, y compris dans le détail sur téléphone, les brouillons sont conservés et le blocage lié à l'incertitude n'est pas levé

#### Scenario: Lecture ancienne pendant une mutation
- **WHEN** une lecture et une écriture sont demandées pendant le même intervalle
- **THEN** elles sont coordonnées pour qu'une réponse de lecture ancienne n'efface pas une modification confirmée ; aucune mutation n'est soumise automatiquement à la fin de l'attente

#### Scenario: Réponse perdue après une opération d'étape
- **WHEN** une réponse d'ajout, renommage, réalisation, suppression ou déplacement d'étape est perdue après une écriture possible
- **THEN** le résultat est annoncé à vérifier, les brouillons sont conservés et toute mutation attend une relecture réussie sans répétition automatique

#### Scenario: Brouillon d'étape après relecture
- **WHEN** une relecture réussit pendant qu'un ajout ou renommage d'étape est en brouillon
- **THEN** le brouillon est conservé séparément des valeurs confirmées et aucune soumission n'est déclenchée ; si la cible a disparu, sa modification est empêchée avec une information explicite

### Requirement: Interactions accessibles sur ordinateur et téléphone

L'interface SHALL permettre capture, navigation, classement, filtres et gestion des tâches, catégories et étapes au clavier et au toucher, sans survol obligatoire ni glisser-déposer. Les contrôles SHALL posséder des libellés accessibles, notamment pour identifier chaque étape ; les erreurs SHALL être compréhensibles sans dépendre de la seule couleur.

#### Scenario: Utilisation au clavier
- **WHEN** l'utilisateur navigue au clavier dans l'ajout, les vues, les filtres, le sélecteur de catégorie, le détail et les confirmations
- **THEN** il peut effectuer les actions avec un focus visible et retrouver un focus utilisable après fermeture d'un panneau ou d'une confirmation

#### Scenario: Utilisation tactile
- **WHEN** l'utilisateur consulte les vues, classe une tâche, gère une catégorie ou modifie ses informations depuis un téléphone
- **THEN** les contrôles restent utilisables au toucher, l'ajout rapide reste accessible et le contenu ne nécessite pas de défilement horizontal

#### Scenario: Gérer les étapes au clavier et au toucher
- **WHEN** l'utilisateur ajoute, renomme, termine, rouvre ou supprime une étape sur ordinateur ou téléphone
- **THEN** les contrôles sont utilisables, les confirmations permettent Annuler et le focus revient sur un contrôle disponible après suppression

### Requirement: Retour à la liste après enregistrement du détail

Sur ordinateur et téléphone, Enregistrer SHALL fermer le détail après confirmation du serveur et afficher le succès dans la liste d'origine, en conservant sa vue, ses filtres et Terminées. Le focus SHALL rejoindre la ligne si elle reste visible, sinon un contrôle disponible. Sans changement, le détail SHALL se fermer sans écriture. Pendant l'attente, après refus ou résultat incertain, il SHALL rester ouvert avec le brouillon.

#### Scenario: Confirmation attendue avant fermeture
- **WHEN** l'utilisateur enregistre un changement de titre ou de classement et que la réponse du serveur est retardée
- **THEN** le détail reste ouvert pendant l'attente puis revient à la liste uniquement après confirmation, avec le message de succès

#### Scenario: Enregistrement sans changement
- **WHEN** l'utilisateur choisit Enregistrer sans avoir modifié le titre ni le classement
- **THEN** le détail revient à la liste avec une information d'absence de modification, sans nouvelle écriture

#### Scenario: Enregistrement non confirmé
- **WHEN** le serveur refuse l'enregistrement ou que sa réponse est perdue
- **THEN** le détail reste ouvert avec l'erreur et le brouillon conservé ; une relecture ne ferme pas implicitement ce détail si la tâche existe encore

#### Scenario: Commandes d'étapes distinctes d'Enregistrer
- **WHEN** l'utilisateur confirme un ajout, renommage, changement d'état, suppression ou déplacement d'étape
- **THEN** cette opération conserve le détail ouvert ; seul Enregistrer du formulaire parent conserve le retour à la liste après succès ou sans changement
