# Spec Delta

## Purpose

Permettre l'utilisation de My To Do sur ordinateur et téléphone au domicile, en partageant les mêmes tâches sans base autonome dans les navigateurs.

## ADDED Requirements

### Requirement: Source de données commune au domicile

L'application SHALL permettre l'accès depuis le navigateur du PC et celui d'un téléphone sur le réseau domestique lorsque le PC et le service sont démarrés. Les deux appareils SHALL utiliser les mêmes données côté serveur, sans synchronisation en temps réel exigée.

#### Scenario: Ajout sur ordinateur et consultation sur téléphone
- **WHEN** une tâche est enregistrée sur ordinateur puis que le téléphone charge ou actualise la boîte de réception
- **THEN** le téléphone retrouve la tâche avec son titre et son état enregistrés

#### Scenario: Ajout sur téléphone et consultation sur ordinateur
- **WHEN** une tâche est enregistrée depuis le téléphone puis que l'ordinateur actualise la boîte de réception
- **THEN** l'ordinateur retrouve cette tâche dans les mêmes données

### Requirement: Accès limité au réseau domestique de confiance

L'installation SHALL fonctionner sans compte sur le réseau domestique de confiance, avec un accès limité par le pare-feu. Elle SHALL documenter que les appareils autorisés sur ce réseau peuvent consulter et modifier les tâches. L'application SHALL refuser les requêtes de modification provenant d'une origine web non autorisée.

#### Scenario: Origine autorisée
- **WHEN** le navigateur ouvre l'application à une adresse locale explicitement autorisée et soumet une tâche
- **THEN** la requête peut être traitée sans compte utilisateur

#### Scenario: Origine étrangère ou absente
- **WHEN** une requête de modification arrive avec une origine web étrangère ou sans l'origine exigée par l'application
- **THEN** elle est rejetée avant toute modification des tâches

### Requirement: Données accessibles uniquement via le serveur applicatif

Le système SHALL conserver les données métier sur le PC et ne pas exposer le fichier de base en téléchargement. Le navigateur SHALL accéder aux tâches via le serveur applicatif, sans stockage métier autonome ni appel à un moteur IA ou à un service cloud pour ce parcours.

#### Scenario: Chargement depuis un second navigateur
- **WHEN** un navigateur sans données locales ouvre l'application
- **THEN** il peut consulter les tâches conservées sur le PC lorsque le service est joignable

#### Scenario: Demande du fichier de base
- **WHEN** un client tente d'accéder au fichier de base par une URL de l'application
- **THEN** le serveur ne retourne pas le fichier

### Requirement: Absence de fonctionnement hors connexion

L'application SHALL documenter sa dépendance au PC et au réseau domestique. Une interface déjà chargée SHALL rendre visibles les échecs d'accès au serveur et ne pas enregistrer de modifications dans une file locale prétendument synchronisée.

#### Scenario: Service arrêté après ouverture
- **WHEN** le service est arrêté alors que le téléphone possède encore une interface ouverte et tente une opération
- **THEN** l'interface signale l'échec ou l'incertitude de l'opération sans annoncer un enregistrement réussi

#### Scenario: Application inaccessible à l'ouverture
- **WHEN** le téléphone ouvre l'adresse de l'application alors que le PC est éteint ou inaccessible
- **THEN** aucun fonctionnement hors connexion n'est promis et l'échec peut être celui du navigateur
