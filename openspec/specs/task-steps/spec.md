# task-steps Specification

## Purpose

Permettre de transformer une tâche en étapes concrètes, de suivre leur réalisation indépendante et de conserver une progression et un ordre compréhensibles avant leur future planification.

## Requirements

### Requirement: Étapes manuelles sur un seul niveau

Le système SHALL permettre d'ajouter et de renommer les étapes d'une tâche depuis son détail. Chaque étape SHALL appartenir à une seule tâche et porter un titre non vide, un état et un ordre. Le titre SHALL être nettoyé aux extrémités ; les titres identiques SHALL être autorisés. Les sous-étapes et les propriétés propres de catégorie, priorité, échéance, jour ou durée SHALL être refusées.

#### Scenario: Ajouter une étape
- **WHEN** l'utilisateur confirme l'ajout de «  Rassembler les pièces  » à une tâche existante
- **THEN** une étape « Rassembler les pièces » à faire est enregistrée en fin de liste, sans modifier les informations du parent hors réalisation calculée

#### Scenario: Renommer une étape
- **WHEN** l'utilisateur confirme un nouveau titre pour une étape existante
- **THEN** seul son titre est modifié, son identité, son état, son parent et sa place sont conservés

#### Scenario: Titre invalide ou propriété inconnue
- **WHEN** un titre vide, composé d'espaces ou contenant NUL, une sous-étape ou une propriété non admise est soumis, y compris directement au serveur
- **THEN** la demande est refusée sans modification partielle

#### Scenario: Titres identiques
- **WHEN** deux ajouts volontaires portent le même titre
- **THEN** ils créent deux étapes distinctes et indépendantes

#### Scenario: Étape absente ou autre parent
- **WHEN** une opération cible une étape absente ou une étape rattachée à une autre tâche
- **THEN** elle est refusée sans recréation, déplacement ni modification d'une autre tâche

### Requirement: Réalisation indépendante et progression calculée

Chaque étape SHALL pouvoir être terminée ou rouverte indépendamment. Tant qu'une tâche possède des étapes, elle SHALL être terminée si et seulement si toutes le sont. Les listes et le détail SHALL afficher le nombre d'étapes terminées et le total, sans commande de réalisation globale. Le changement d'état SHALL conserver l'ordre des étapes et les autres informations du parent.

#### Scenario: Réalisation partielle puis complète
- **WHEN** l'utilisateur termine successivement les deux étapes d'une tâche
- **THEN** la progression passe de 0 sur 2 à 1 sur 2 puis 2 sur 2 ; le parent reste à faire jusqu'à la dernière réalisation puis rejoint les tâches terminées

#### Scenario: Rouvrir une étape
- **WHEN** l'utilisateur rouvre une étape d'une tâche terminée
- **THEN** la tâche redevient à faire, la progression diminue et les autres étapes restent inchangées

#### Scenario: État cible répété
- **WHEN** une demande confirme l'état déjà enregistré d'une étape
- **THEN** cet état est conservé sans bascule supplémentaire ni changement d'ordre

### Requirement: Ajout à une tâche terminée

Toute nouvelle étape SHALL être à faire. Son ajout à une tâche terminée, simple ou déjà décomposée, SHALL rouvrir le parent dans la même opération confirmée. L'interface SHALL expliquer cette réouverture et conserver le détail ouvert.

#### Scenario: Première étape d'une tâche terminée
- **WHEN** l'utilisateur ajoute la première étape d'une tâche simple terminée
- **THEN** l'étape est à faire, la progression vaut 0 sur 1 et le parent est rouvert sans étape artificielle représentant son ancien état

#### Scenario: Étape supplémentaire d'une tâche terminée
- **WHEN** l'utilisateur ajoute une étape à une tâche dont toutes les étapes sont terminées
- **THEN** la nouvelle étape est ajoutée à la fin et rouvre le parent ; les étapes existantes restent terminées

### Requirement: Suppression d'étape et retour à une tâche simple

La suppression d'une étape SHALL demander confirmation avec son titre et permettre Annuler. Elle SHALL être définitive après succès. Si des étapes subsistent, la réalisation du parent SHALL être recalculée. Si la dernière étape est supprimée, le parent SHALL devenir une tâche simple en conservant son état juste avant suppression, avec une réalisation manuelle à nouveau disponible.

#### Scenario: Annuler la suppression
- **WHEN** l'utilisateur annule la confirmation de suppression d'une étape
- **THEN** l'étape, l'ordre et la réalisation du parent restent inchangés

#### Scenario: Supprimer la dernière étape à faire
- **WHEN** l'utilisateur supprime l'unique étape à faire d'une tâche
- **THEN** la tâche ne possède plus d'étape et reste à faire, avec sa case de réalisation manuelle

#### Scenario: Supprimer la dernière étape terminée
- **WHEN** l'utilisateur supprime l'unique étape terminée d'une tâche
- **THEN** la tâche ne possède plus d'étape et reste terminée, avec sa réalisation manuelle disponible

#### Scenario: Des étapes subsistent
- **WHEN** l'utilisateur supprime la seule étape non terminée parmi plusieurs étapes
- **THEN** le parent devient terminé à partir des étapes restantes, dont l'ordre relatif est conservé

### Requirement: Ordre enregistré et réordonnancement accessible

Les étapes SHALL être affichées dans un ordre enregistré unique, sans séparation automatique par état. Monter et Descendre SHALL déplacer une étape d'une place, au clavier et au toucher, sans modifier les titres ni les réalisations. Les déplacements hors des bornes SHALL rester sans effet. Le focus SHALL suivre l'étape déplacée vers un contrôle utilisable et sa nouvelle position SHALL être annoncée.

#### Scenario: Déplacer une étape
- **WHEN** l'utilisateur choisit Monter pour la troisième étape parmi quatre
- **THEN** elle devient deuxième, son ancienne voisine devient troisième et les autres positions restent inchangées

#### Scenario: Bornes et liste courte
- **WHEN** la liste est vide ou ne contient qu'une étape, ou que l'utilisateur consulte la première ou la dernière étape
- **THEN** aucune commande ne permet de déplacer une étape au-delà des bornes

#### Scenario: Réalisation sans réordonnancement
- **WHEN** l'utilisateur termine puis rouvre une étape au milieu de la liste
- **THEN** sa position reste la même et les étapes terminées restent visibles à leur place

#### Scenario: Ordre devenu obsolète
- **WHEN** l'utilisateur demande un déplacement depuis un ordre qui a été modifié sur un autre appareil par ajout, suppression ou déplacement
- **THEN** la demande est refusée sans écriture avec une invitation à relire avant de décider d'un nouveau déplacement

### Requirement: Cohérence des étapes et de leur parent

Chaque mutation d'étape SHALL confirmer ensemble les étapes, leur ordre et l'état du parent, ou ne rien modifier. Les lectures SHALL présenter une progression cohérente avec les étapes retournées. Des opérations concurrentes SHALL conserver cette cohérence sans créer d'étapes orphelines ni rétablir une tâche supprimée.

#### Scenario: Échec pendant une mutation
- **WHEN** une opération ne peut pas confirmer à la fois le changement d'étape et le recalcul du parent
- **THEN** aucun de ces changements n'est conservé

#### Scenario: Suppression du parent concurrente
- **WHEN** une étape est modifiée alors qu'un autre appareil supprime son parent
- **THEN** seules des opérations cohérentes sont confirmées ; aucune étape orpheline ni recréation du parent n'est possible

#### Scenario: Lecture pendant une modification
- **WHEN** un appareil charge les tâches pendant qu'un autre modifie une étape
- **THEN** chaque tâche lue présente un état et une progression correspondant à ses étapes dans un même état confirmé

### Requirement: Protection des accès aux étapes

Les opérations d'étapes SHALL respecter les restrictions d'origine web, le contenu JSON des créations et modifications et l'absence de cache durable des tâches. Une demande refusée SHALL ne modifier ni étape ni parent.

#### Scenario: Origine refusée
- **WHEN** une création, modification, suppression ou demande de réordonnancement arrive sans origine autorisée
- **THEN** elle est refusée avant toute écriture

#### Scenario: Contenu non JSON
- **WHEN** un ajout, un renommage, un changement d'état ou un déplacement est soumis avec un contenu non JSON
- **THEN** il est refusé sans modification des étapes ni du parent
