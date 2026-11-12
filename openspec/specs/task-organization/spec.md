# task-organization Specification

## Purpose

Permettre d'organiser les tâches par catégories libres et de retrouver les actions utiles grâce aux priorités, aux dates limites et à des vues filtrées, sans alourdir la capture rapide.

## Requirements

### Requirement: Catégories libres et noms uniques

Le système SHALL permettre de créer des catégories libres nommées et refuser les noms vides. Il SHALL considérer comme identiques les noms après normalisation Unicode canonique, suppression des espaces aux extrémités, réduction des espaces internes successifs et comparaison sans distinction de casse. Les accents SHALL rester significatifs.

#### Scenario: Création explicite
- **WHEN** l'utilisateur confirme la création de « Maison »
- **THEN** la catégorie est enregistrée et devient disponible dans la navigation et le classement, même sans tâche associée

#### Scenario: Variantes équivalentes
- **WHEN** « Vie personnelle » existe et que l'utilisateur tente de créer «  VIE   PERSONNELLE  »
- **THEN** aucune seconde catégorie n'est créée et l'interface permet de retrouver la catégorie existante

#### Scenario: Nom vide
- **WHEN** un nom vide ou composé uniquement d'espaces est soumis, y compris directement au serveur
- **THEN** la création est refusée sans modification des catégories

#### Scenario: Deux créations concurrentes
- **WHEN** deux appareils créent simultanément des noms équivalents
- **THEN** une seule catégorie est enregistrée et l'autre demande reçoit un conflit explicite permettant une relecture

### Requirement: Classement facultatif et unique

Une tâche SHALL avoir zéro ou une catégorie. Le système SHALL permettre d'affecter, de remplacer ou de retirer cette catégorie depuis le détail sans modifier les autres informations de la tâche. Une catégorie absente ou un identifiant invalide SHALL être refusé sans modification partielle.

#### Scenario: Classer puis déplacer une tâche
- **WHEN** l'utilisateur enregistre successivement une tâche dans Maison puis Administratif
- **THEN** elle appartient uniquement à Administratif et conserve son titre, son état et les autres informations enregistrées

#### Scenario: Retirer le classement
- **WHEN** l'utilisateur choisit Sans catégorie puis enregistre
- **THEN** la tâche devient visible dans la Boîte de réception et n'appartient plus à une catégorie

#### Scenario: Catégorie supprimée sur un autre appareil
- **WHEN** l'utilisateur enregistre une catégorie disparue depuis l'ouverture du détail
- **THEN** l'enregistrement est refusé sans changement partiel de la tâche, le brouillon est conservé et une relecture est possible

### Requirement: Recherche et création dans le sélecteur de catégorie

Le détail SHALL proposer une recherche parmi les catégories existantes, avec sélection possible au clavier et au toucher, ainsi qu'une option Sans catégorie. Une recherche sans correspondance SHALL proposer une création explicite. Saisir, quitter le champ ou enregistrer la tâche SHALL ne pas créer implicitement une catégorie.

#### Scenario: Retrouver une catégorie
- **WHEN** l'utilisateur saisit « mai » alors que Maison existe
- **THEN** Maison est proposée et peut être sélectionnée sans recréation

#### Scenario: Nouvelle catégorie depuis le détail
- **WHEN** l'utilisateur saisit un nouveau nom puis choisit explicitement Créer la catégorie et que le serveur confirme
- **THEN** la catégorie devient disponible et est sélectionnée dans le brouillon ; l'affectation à la tâche attend l'enregistrement de celle-ci

#### Scenario: Saisie non confirmée
- **WHEN** l'utilisateur saisit un nom sans sélectionner ni créer une catégorie
- **THEN** aucun nouveau classement n'est appliqué et aucune catégorie n'est créée implicitement

### Requirement: Renommage sans perte des associations

Le système SHALL permettre de renommer une catégorie en conservant les associations de toutes ses tâches, actives et terminées. Un nom vide ou équivalent à celui d'une autre catégorie SHALL être refusé sans fusion ni modification des associations.

#### Scenario: Renommer une catégorie utilisée
- **WHEN** l'utilisateur renomme Maison en Logement avec succès
- **THEN** les mêmes tâches restent associées à cette catégorie et son nouveau nom apparaît dans les vues et détails

#### Scenario: Renommage en conflit
- **WHEN** l'utilisateur renomme une catégorie avec un nom équivalent à celui d'une autre catégorie
- **THEN** le renommage est refusé et les deux catégories et leurs associations restent inchangées

### Requirement: Suppression de catégorie sans suppression des tâches

La suppression d'une catégorie SHALL être confirmée en affichant son nom et le fait que ses tâches seront conservées sans catégorie. Après confirmation réussie, toutes ses tâches, actives et terminées, SHALL devenir non classées avec leurs autres informations inchangées. La suppression et le retrait des associations SHALL former une opération indivisible.

#### Scenario: Confirmer la suppression
- **WHEN** l'utilisateur confirme la suppression d'une catégorie contenant des tâches actives et terminées
- **THEN** la catégorie disparaît et toutes ses tâches sont conservées sans catégorie, y compris après rechargement et redémarrage

#### Scenario: Annuler la suppression
- **WHEN** l'utilisateur annule la confirmation
- **THEN** la catégorie et toutes les associations restent inchangées

#### Scenario: Supprimer la catégorie consultée
- **WHEN** la catégorie affichée est supprimée avec succès ou sa disparition est constatée lors d'une relecture
- **THEN** la navigation revient à la Boîte de réception avec une information explicite et un focus utilisable

### Requirement: Navigation directe et listes cohérentes

Le système SHALL proposer un accès direct à Boîte de réception, Toutes les tâches et chaque catégorie sur ordinateur et téléphone. Boîte de réception SHALL ne contenir que les tâches sans catégorie ; Toutes les tâches SHALL inclure les tâches classées et non classées ; une catégorie SHALL ne montrer que ses tâches. Chaque vue SHALL séparer À faire et Terminées.

#### Scenario: Changer de vue
- **WHEN** l'utilisateur choisit Maison puis Toutes les tâches
- **THEN** il consulte d'abord les seules tâches Maison, puis toutes les tâches, sans changer leur classement

#### Scenario: Liste vide ou indisponible
- **WHEN** une catégorie est vide, qu'un filtre ne trouve rien ou que le chargement échoue
- **THEN** l'interface distingue ces trois situations sans annoncer à tort que toutes les tâches sont absentes

#### Scenario: Tâche déplacée hors de la vue
- **WHEN** une modification confirmée retire une tâche de la catégorie ou des filtres consultés
- **THEN** la liste se met à jour, le détail se ferme avec un focus utilisable et un message confirme l'enregistrement en expliquant que la tâche ne correspond plus à la vue

#### Scenario: Classement externe constaté pendant un brouillon
- **WHEN** une relecture constate qu'une tâche ouverte a été déplacée hors de la vue par un autre appareil
- **THEN** son détail et son brouillon restent ouverts avec une information indiquant que la tâche ne correspond plus à la vue

### Requirement: Priorité facultative

Le système SHALL proposer les priorités Sans priorité, Basse, Normale et Haute, avec Sans priorité par défaut pour les tâches existantes et nouvelles. La priorité SHALL pouvoir être changée ou retirée dans le détail sans modifier le titre, l'état, la catégorie ou la date limite. Toute autre valeur SHALL être refusée par le serveur.

#### Scenario: Changer puis retirer la priorité
- **WHEN** l'utilisateur enregistre Haute puis Sans priorité
- **THEN** la tâche reflète chaque choix confirmé et conserve ses autres informations

#### Scenario: Valeur invalide
- **WHEN** une priorité inconnue est envoyée avec d'autres modifications
- **THEN** l'ensemble de la modification est refusé sans écriture partielle

### Requirement: Date limite facultative et indépendante

Le système SHALL permettre de renseigner, modifier ou effacer une date limite civile sans heure. Une date passée SHALL être acceptée ; une date inexistante ou mal formée SHALL être refusée par le serveur sans écriture partielle. La date limite SHALL rester distincte du jour prévu et ne nécessiter ni catégorie ni priorité.

#### Scenario: Ajouter puis retirer une date
- **WHEN** l'utilisateur enregistre une date limite puis l'efface
- **THEN** la tâche conserve ses autres informations et n'a plus d'échéance après le second enregistrement

#### Scenario: Dates civiles valides
- **WHEN** une échéance passée valide ou le 29 février d'une année bissextile est soumise
- **THEN** elle est acceptée sans décalage de jour

#### Scenario: Date impossible
- **WHEN** une date impossible telle que le 31 février est soumise
- **THEN** l'enregistrement est refusé sans écriture partielle

### Requirement: Visibilité de la priorité et des échéances

Les listes et le détail SHALL rendre lisibles la priorité renseignée et la date limite. Une tâche non terminée dont la date limite précède la date civile locale du navigateur SHALL porter un libellé explicite En retard, en complément de la couleur. Une tâche due aujourd'hui ou terminée SHALL ne pas être signalée en retard.

#### Scenario: Retard et réalisation
- **WHEN** une tâche non terminée a une échéance hier puis est terminée
- **THEN** elle est d'abord signalée En retard puis conserve sa date sans signal de retard actif

#### Scenario: Réouverture et changement de jour
- **WHEN** une tâche à échéance passée est rouverte ou que le navigateur passe au lendemain d'une échéance non terminée
- **THEN** le signal de retard est calculé selon la date locale courante, sans modifier l'échéance ni l'état enregistré

### Requirement: Filtres combinables dans Toutes les tâches

Toutes les tâches SHALL proposer des filtres combinables par catégorie, priorité et échéance, avec une action de réinitialisation. Les filtres SHALL s'appliquer par intersection aux tâches À faire et Terminées sans changer leur ordre relatif ni leurs données. Les choix Sans catégorie, Sans priorité et Sans échéance SHALL être distincts de l'absence de filtre.

#### Scenario: Combiner et effacer des filtres
- **WHEN** l'utilisateur choisit Maison et Haute puis réinitialise les filtres
- **THEN** il voit d'abord uniquement les tâches Maison de priorité Haute, puis retrouve l'ensemble des tâches

#### Scenario: Filtrer par échéance
- **WHEN** l'utilisateur choisit Sans échéance, En retard, Aujourd'hui ou une date précise
- **THEN** la vue ne montre respectivement que les tâches sans date, non terminées en retard, dues aujourd'hui ou dues à la date choisie

#### Scenario: Aucun résultat
- **WHEN** aucune tâche ne correspond aux filtres combinés
- **THEN** l'interface indique l'absence de résultat et propose de réinitialiser les filtres sans masquer l'ajout rapide

### Requirement: Protection des modifications de catégories

Les modifications de catégories SHALL respecter les mêmes restrictions d'origine web et de contenu JSON que les modifications de tâches. Leurs réponses SHALL ne pas être mises en cache durablement. Une requête refusée SHALL ne changer aucune catégorie ni association.

#### Scenario: Origine étrangère ou absente
- **WHEN** une création, un renommage ou une suppression de catégorie arrive d'une origine étrangère ou sans origine autorisée
- **THEN** la requête est refusée avant toute écriture

#### Scenario: Corps non JSON
- **WHEN** une création ou un renommage est soumis avec un contenu non JSON
- **THEN** la requête est refusée sans écriture
