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

Le système SHALL créer une tâche à faire avec son seul titre et sans classement obligatoire. Il SHALL supprimer les espaces en début et fin de titre et refuser un titre ainsi vidé, y compris lors d'un appel direct au serveur. Deux tâches distinctes SHALL pouvoir porter le même titre.

#### Scenario: Ajout rapide
- **WHEN** l'utilisateur soumet le titre « Acheter du pain » et que l'enregistrement réussit
- **THEN** une seule nouvelle tâche apparaît dans les tâches à faire et le champ d'ajout est vidé

#### Scenario: Titre vide
- **WHEN** un titre vide ou composé uniquement d'espaces est soumis
- **THEN** le système refuse l'ajout avec une erreur compréhensible et ne crée aucune tâche

#### Scenario: Titres identiques
- **WHEN** l'utilisateur soumet volontairement le titre d'une tâche déjà existante
- **THEN** le système crée une nouvelle tâche indépendante

### Requirement: Consultation persistante

Le système SHALL conserver les tâches et leurs modifications confirmées après actualisation du navigateur et redémarrage du serveur. Les tâches à faire SHALL avoir un ordre de consultation déterministe, sans réordonnancement manuel dans ce changement.

#### Scenario: Relecture après redémarrage
- **WHEN** l'utilisateur recharge la liste après le redémarrage du serveur qui a confirmé un enregistrement
- **THEN** il retrouve le titre et l'état enregistrés de la tâche

### Requirement: Ouverture et modification du détail

Le système SHALL ouvrir le détail en cliquant sur le titre : panneau latéral sur ordinateur, écran dédié avec retour sur téléphone. Il SHALL permettre d'enregistrer ou d'annuler une modification du titre, sans changer l'état de réalisation. Un titre vide SHALL être refusé.

#### Scenario: Modification enregistrée
- **WHEN** l'utilisateur ouvre le détail, modifie le titre puis enregistre avec succès
- **THEN** la liste et le détail présentent le nouveau titre tout en conservant l'état de réalisation

#### Scenario: Annulation ou fermeture du détail
- **WHEN** l'utilisateur annule ou ferme le détail avant d'enregistrer son changement de titre
- **THEN** le titre enregistré est conservé et le brouillon est abandonné

#### Scenario: Retour sur téléphone
- **WHEN** l'utilisateur revient du détail à la boîte de réception sur téléphone
- **THEN** il retrouve la liste et l'état ouvert ou replié de la section Terminées de cette navigation

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

L'interface SHALL signaler les enregistrements en cours et empêcher la double soumission de la même action pendant l'attente. Elle SHALL afficher les échecs sans présenter les changements comme enregistrés, conserver la saisie d'ajout ou de modification en cas d'erreur et permettre une reprise explicite sans répétition automatique d'écritures.

#### Scenario: Échec certain d'une écriture
- **WHEN** le serveur refuse ou ne peut pas enregistrer un ajout, un titre, un changement d'état ou une suppression
- **THEN** l'erreur est visible, la saisie éventuelle reste disponible et la tâche n'est pas présentée comme modifiée ou supprimée

#### Scenario: Réponse perdue après une écriture
- **WHEN** une interruption réseau empêche de connaître le résultat d'une écriture
- **THEN** l'interface signale que le résultat est à vérifier et propose une relecture avant toute nouvelle soumission

### Requirement: Interactions accessibles sur ordinateur et téléphone

L'interface SHALL permettre la capture, la consultation et les actions de gestion au clavier et au toucher, sans survol obligatoire ni glisser-déposer. Les contrôles SHALL posséder des libellés accessibles et les erreurs SHALL être compréhensibles sans dépendre de la seule couleur.

#### Scenario: Utilisation au clavier
- **WHEN** l'utilisateur navigue au clavier dans l'ajout, la liste, le détail et la confirmation de suppression
- **THEN** il peut effectuer les actions avec un focus visible et retrouver un focus utilisable après fermeture d'un panneau ou d'une confirmation

#### Scenario: Utilisation tactile
- **WHEN** l'utilisateur consulte la liste et ajoute une tâche depuis un écran de téléphone
- **THEN** les contrôles restent utilisables au toucher et le contenu ne nécessite pas de défilement horizontal
