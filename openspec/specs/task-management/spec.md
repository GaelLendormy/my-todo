# task-management Specification

## Purpose

Permettre de capturer rapidement des tâches personnelles, de les retrouver durablement et de gérer leur réalisation depuis une boîte de réception simple.

## Requirements

### Requirement: Accueil dans la boîte de réception

L'application SHALL ouvrir sur la Boîte de réception et garder l'ajout rapide accessible. Elle SHALL distinguer une liste vide, un chargement et un échec de chargement. La liste SHALL présenter les tâches à faire avant la section Terminées.

#### Scenario: Première ouverture sans tâche
- **WHEN** l'utilisateur ouvre l'application et que la liste chargée ne contient aucune tâche
- **THEN** la Boîte de réception affiche un état vide et un ajout rapide utilisable

#### Scenario: Chargement impossible
- **WHEN** la lecture des tâches échoue
- **THEN** l'application affiche l'échec avec une possibilité de réessayer et ne le présente pas comme une liste vide

### Requirement: Capture à partir du titre

Le système SHALL créer une tâche à faire avec son seul titre, sans catégorie, sans priorité et sans date limite, depuis toutes les vues. Il SHALL supprimer les espaces en début et fin de titre et refuser un titre ainsi vidé, y compris lors d'un appel direct au serveur. Deux tâches distinctes SHALL pouvoir porter le même titre. L'ajout rapide SHALL ne pas hériter de la catégorie ni des filtres consultés.

#### Scenario: Ajout rapide
- **WHEN** l'utilisateur soumet le titre « Acheter du pain » et que l'enregistrement réussit
- **THEN** une seule nouvelle tâche non classée est enregistrée, visible dans la Boîte de réception, et le champ d'ajout est vidé

#### Scenario: Titre vide
- **WHEN** un titre vide ou composé uniquement d'espaces est soumis
- **THEN** le système refuse l'ajout avec une erreur compréhensible et ne crée aucune tâche

#### Scenario: Titres identiques
- **WHEN** l'utilisateur soumet volontairement le titre d'une tâche déjà existante
- **THEN** le système crée une nouvelle tâche indépendante

#### Scenario: Ajout depuis une catégorie ou une vue filtrée
- **WHEN** une tâche est ajoutée depuis une catégorie ou des filtres auxquels elle ne correspond pas
- **THEN** la vue reste inchangée, un message confirme son ajout dans la Boîte de réception et un accès à celle-ci est proposé

### Requirement: Consultation persistante

Le système SHALL conserver les tâches, les catégories, leurs associations et les modifications confirmées après actualisation du navigateur et redémarrage du serveur. Les listes SHALL conserver un ordre déterministe de création décroissante puis d'identifiant décroissant, sans réordonnancement manuel ni classement automatique par priorité ou échéance. La migration SHALL préserver les tâches existantes avec les nouvelles informations facultatives absentes.

#### Scenario: Relecture après redémarrage
- **WHEN** l'utilisateur recharge la liste après le redémarrage du serveur qui a confirmé un enregistrement
- **THEN** il retrouve le titre, l'état, la catégorie, la priorité et la date limite enregistrés

#### Scenario: Migration des tâches existantes
- **WHEN** une base contenant des tâches actives et terminées reçoit les migrations du changement
- **THEN** tous leurs identifiants, titres, états et dates de création sont conservés ; elles restent sans catégorie, sans priorité et sans échéance jusqu'à modification explicite

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
- **WHEN** l'utilisateur enregistre simultanément un titre, une catégorie et, au second milestone, une priorité et une échéance
- **THEN** tous les changements valides sont appliqués ensemble, ou aucun ne l'est si l'un des champs est invalide

### Requirement: Réalisation et réouverture

Le système SHALL permettre de cocher une tâche pour la terminer et de la décocher pour la rouvrir. La section Terminées SHALL être repliée à l'ouverture de la boîte de réception et placée après les tâches à faire. Ouvrir le titre SHALL rester distinct du changement d'état.

#### Scenario: Terminer une tâche
- **WHEN** l'utilisateur coche une tâche à faire et que l'enregistrement réussit
- **THEN** la tâche quitte les tâches à faire et devient consultable dans Terminées

#### Scenario: Rouvrir une tâche
- **WHEN** l'utilisateur ouvre Terminées et décoche une tâche avec un enregistrement réussi
- **THEN** la tâche revient dans les tâches à faire sans changement de titre

#### Scenario: Consulter une tâche terminée
- **WHEN** l'utilisateur clique sur le titre d'une tâche dans Terminées
- **THEN** son détail s'ouvre sans la rouvrir

### Requirement: Suppression confirmée et définitive

Le système SHALL permettre de supprimer une tâche à faire ou terminée après une confirmation affichant son titre avec Annuler et Supprimer. Une suppression confirmée et enregistrée SHALL retirer définitivement la tâche, sans corbeille.

#### Scenario: Annuler la suppression
- **WHEN** l'utilisateur demande une suppression puis choisit Annuler
- **THEN** la tâche et son état restent inchangés

#### Scenario: Confirmer la suppression
- **WHEN** l'utilisateur confirme Supprimer et que le serveur confirme la suppression
- **THEN** la tâche disparaît et ne revient pas après rechargement ou redémarrage

### Requirement: Enregistrement explicite et reprise après erreur

L'interface SHALL signaler les enregistrements en cours et empêcher les doubles soumissions. Elle SHALL conserver les brouillons après erreur, sans succès fictif ni répétition automatique d'écriture. Une écriture incertaine SHALL imposer une relecture des tâches et catégories avant une nouvelle mutation. Ces protections SHALL couvrir aussi la création, le renommage et la suppression de catégories.

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

### Requirement: Interactions accessibles sur ordinateur et téléphone

L'interface SHALL permettre la capture, la navigation entre vues, le classement, les filtres et la gestion des tâches et catégories au clavier et au toucher, sans survol obligatoire ni glisser-déposer. Les contrôles SHALL posséder des libellés accessibles et les erreurs SHALL être compréhensibles sans dépendre de la seule couleur.

#### Scenario: Utilisation au clavier
- **WHEN** l'utilisateur navigue au clavier dans l'ajout, les vues, les filtres, le sélecteur de catégorie, le détail et les confirmations
- **THEN** il peut effectuer les actions avec un focus visible et retrouver un focus utilisable après fermeture d'un panneau ou d'une confirmation

#### Scenario: Utilisation tactile
- **WHEN** l'utilisateur consulte les vues, classe une tâche, gère une catégorie ou modifie ses informations depuis un téléphone
- **THEN** les contrôles restent utilisables au toucher, l'ajout rapide reste accessible et le contenu ne nécessite pas de défilement horizontal

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
