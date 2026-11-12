# Checkpoint — Organisation des tâches archivé

12 novembre 2026. **Changement clos sur autorisation de l’utilisateur : M1 et M2 validés, 18/18 tâches terminées, Verify en contexte frais réussi.**

- M1 : commit `df9c71f` ; M2 : commit `c285c10` (`Implement task priorities and due dates`). Aucun code applicatif modifié après le Verify. Les mentions de validation tactile ont été actualisées et la suggestion documentaire traitée.
- [Archive](../openspec/changes/archive/2026-11-12-organisation-des-taches/tasks.md), schéma `spec-driven` : tous les artefacts terminés, 18/18 tâches, métadonnées conservées. Les liens relatifs ont été adaptés au déplacement ; les autres contenus archivés sont inchangés.
- Specs principales synchronisées : [gestion des tâches](../openspec/specs/task-management/spec.md), **9 exigences et 26 scénarios**, avec Purpose et exigences non visées conservés ; [organisation des tâches](../openspec/specs/task-organization/spec.md), **11 exigences et 31 scénarios**, avec Purpose repris du delta. Comparaison de toutes les exigences du delta : aucune modification restante à intégrer. La spec d’accès au domicile reste inchangée.
- Checks de clôture : validation OpenSpec stricte du changement avant archivage, validation stricte des **3 specs**, cibles des liens locaux sur **11 documents**, conservation du contenu archivé et `git diff --check` réussis. `openspec list --json` ne retourne plus de changement actif.
- Preuves du Verify conservées ci-dessous : **82/82 Vitest, 60/60 Playwright**, types, lint, build, persistance et récupération réussis dans le chat neuf GPT‑6.1 Sol / High. Ces suites ne sont pas relancées pour les seuls changements documentaires de clôture. Validation tactile rapportée par l’utilisateur sur **A37, Android, Chrome**, versions non précisées.
- Aucun push ni nouveau milestone lancé. Les limites d’exploitation historiques (pare-feu permanent et première sauvegarde externe réelle) restent décrites dans le [protocole d’exploitation](../documentation/EXPLOITATION_M3.md). Prochaine action : choisir avec l’utilisateur le prochain changement.

Les sections suivantes conservent l’historique ; leurs mentions de contrôles ouverts et d’anciens chemins ne décrivent pas le statut courant.

---

# Historique — Organisation des tâches, Verify terminé

12 novembre 2026. Changement `organisation-des-taches`, **M1 et M2 validés, 18/18 tâches terminées**. L’utilisateur autorise l’actualisation documentaire, le commit M2 et l’archivage après restitution du Verify.

- Verify effectué dans un chat neuf **GPT‑6.1 Sol / High**, `01a1cf48-244c-7140-b454-dd2788fcff34`, sur `main` à `df9c71fabe5bed1e2ac3708b06293792403e7e31` avec M2 non commité. M1 déjà commité a aussi été examiné : **17 exigences et 50 scénarios**, aucun CRITICAL ni WARNING, une suggestion documentaire.
- Checks réellement relancés par le chat Verify : **82/82 Vitest, 60/60 Playwright**, typecheck, lint, build, persistance, récupération, validation OpenSpec stricte et `git diff --check` réussis. Les contrôles avec serveur ont réussi après autorisation hors sandbox ; l’avertissement historique de sourcemap Nuxt demeure. Aucune donnée personnelle ni configuration réseau modifiée.
- Le contrôle tactile reste le résultat **rapporté par l’utilisateur** sur **A37, Android, Chrome**, le 12 novembre : « Tout passe ». Versions non précisées ; aucun agent n’a manipulé le téléphone. README et Développement reflètent désormais ce statut ; suggestion Verify traitée.
- Aucun code applicatif modifié après Verify. Pour cette actualisation documentaire, seuls les checks documentaires et OpenSpec sont à repasser. Prochaine action autorisée : commit M2, synchronisation des specs principales puis archivage du changement.

---

# Historique — Organisation des tâches, implémentation validée

12 novembre 2026. Changement `organisation-des-taches`. **M1 et M2 validés, 18/18 tâches terminées.** L'utilisateur confirme les essais tactiles M2 sur **A37, Android, Chrome** : « Tout passe ». La dernière case 2.8 est cochée après vérification de sa ligne et confirmation de la progression CLI. Aucun défaut signalé dans ce retour ; versions Android et Chrome non précisées.

- La validation rapportée couvre la marche à suivre M2 proposée : priorités, sélecteur natif et effacement de date, annulation, filtres combinés et réinitialisation, retards/réalisation/réouverture, retour après Enregistrer, conservation du brouillon et reprise après coupure, contrôles tactiles et absence de débordement. Il s'agit du résultat annoncé par l'utilisateur, sans manipulation directe du téléphone ni nouvelle observation instrumentée par ce chat.
- Les résultats techniques du chat d'implémentation restent ceux documentés ci-dessous : **82/82 Vitest, 60/60 Playwright, types, lint, build, persistance, récupération et migrations isolées réussis**. Ces suites ne sont pas relancées pour cette seule consignation documentaire. La validation OpenSpec stricte et `git diff --check` ont été repassés ; ils ne constituent pas un Verify final.
- Cible de reprise : `main` sur **df9c71f**, avec modifications M2 non commitées, dont ce suivi et la dernière case. M1 est déjà commité. Aucun nouveau code, commit, push, Verify, Sync, Archive, autre chat, sous-agent ou changement réseau réalisé lors de cette consignation.
- **Prochaine étape : OpenSpec Verify dans un contexte frais**, à partir du handoff ci-dessous et en tenant compte de cette validation tactile désormais reçue. Identifier la cible réelle avant vérification, distinguer les checks historiques des nouvelles preuves et traiter les constats avant clôture. Aucun nouveau chat créé automatiquement ni archivage déclenché.

Les bilans et mentions de contrôles ouverts ci-dessous sont historiques ; le contrôle tactile M2 est désormais validé par l'utilisateur.

---

# Historique — M2 implémenté, contrôle tactile ouvert

10 novembre 2026. Changement `organisation-des-taches`, schéma `spec-driven`. M2 « Repérer ce qui compte » explicitement autorisé dans ce chat après M1 validé et commité. **2.1–2.7 terminées ; 2.8 ouverte uniquement pour le contrôle tactile M2 sur vrai téléphone. Progression : 17/18.** Les mentions de M2 non autorisé plus bas sont historiques. Aucun sous-agent, autre chat, review indépendante, Verify, Sync, Archive, commit ou push lancé.

## Cible et résultat

Branche `main`, HEAD de départ **df9c71f** (« Implement task categorization milestone »), arbre propre à l'arrivée. M2 reste non commité dans le checkout partagé. Migration M1 et comportements validés préservés ; aucun schéma futur ni nouvelle dépendance. Seules des données jetables ont été utilisées ; aucune base personnelle, configuration réseau ou règle de pare-feu touchée.

- [Migration 0002](../migrations/0002_task_importance.sql), [journal](../migrations/meta/_journal.json), [schéma](../server/db/schema.ts), [types](../shared/types/task.ts) : priorité nullable low/normal/high et date civile nullable ; SQL contraint les valeurs/formats, serveur valide aussi le calendrier grégorien (0001–9999). Bases vierges, montées depuis 0000 et M1 peuplées, associations, réapplication et réouverture couvertes. Les migrations 0000/0001 restent intactes.
- [Métier](../server/domain/tasks.ts) : champs absents préservés, null retire, dates passées acceptées, refus atomiques ; création titre seul. Réponses API étendues sans modifier les routes/protections.
- [Sélection pure](../shared/task-selection.ts), [jour local](../app/composables/useCivilToday.ts), [filtres](../app/components/TaskFilters.vue), [détail](../app/components/TaskDetail.vue), [lignes](../app/components/TaskList.vue), [assemblage](../app/app.vue) : quatre choix de priorité, date facultative/effaçable, En retard seulement pour les tâches actives, jour recalculé à minuit/retour d'onglet/focus. Aucune conversion UTC d'échéance. Filtres par intersection avant séparation active/terminée, ordre inchangé, réinitialisation et absence de résultat distinctes de liste vide/erreur. Capture toujours non classée et sans priorité/date, avec accès à la boîte si masquée par les filtres.
- Enregistrer attend le serveur puis ferme le détail sur ordinateur/téléphone ; vue/filtres/Terminées conservés, focus sur ligne ou contrôle disponible et message de sortie de filtre. Sans changement : fermeture sans PATCH. Les brouillons enrichis restent ouverts pendant attente, refus, résultat incertain et relecture seule. Les champs inchangés ne sont pas envoyés même après une modification indépendante relue depuis un autre appareil. Sérialisation, délai 10 s et retry 0 de M1 conservés.
- [Tests unitaires](../tests/importance.test.ts), [tests navigateur](../tests/e2e/importance.spec.ts), [persistance](../scripts/check-persistence.ts), [récupération](../scripts/check-recovery.ts), [README](../README.md#organisation-m2--priorités-et-échéances) et [développement](../documentation/DEVELOPPEMENT.md#organisation-des-tâches--m2) complétés.

## Validations réellement exécutées ici

| Commande / contrôle | Résultat sur M2 |
| --- | --- |
| `openspec list --json`, `status`, `instructions apply --change organisation-des-taches --json` | Racine locale, spec-driven et ready confirmés, contextFiles lus, aucun context/operationGuidance additionnel. Cases contrôlées au sourcePath avant modification, progression confirmée (13 puis 14/15/16/17). |
| `node --version`, `pnpm --version` | 24.14.0 / 10.33.0. |
| `pnpm test` final | **82/82**, quatre fichiers. M1 conservé ; 29 nouveaux cas migration, SQL, métier, calendrier, atomicité et sélection. |
| `pnpm typecheck`, `pnpm lint` finaux | Réussis, application/scripts/tests, aucun avertissement lint. |
| `pnpm build` | Réussi sur le code applicatif final ; avertissement historique de sourcemap Nuxt module-preload-polyfill. Log temporaire `/tmp/mytodo-m2-build.log`. Les changements suivants concernent uniquement tests, scripts de check et documentation. |
| `pnpm test:e2e` final | **60/60** sur serveur compilé et base isolée port 3100. Les 52 cas antérieurs passent ; 8 cas M2 couvrent aussi mobile simulé, confirmation différée, champs partiels après relecture externe, maintien des filtres/Terminées, erreur et perte après vraie écriture, catégorie disparue, relecture partielle refusée, date/jour/focus sans écriture et brouillon conservé. |
| `pnpm check:persistence` | Réussi port 3101 : priorités et dates relues après redémarrage, catégories et associations préservées puis déclassement actif/terminé ; pas de recréation tardive. |
| `pnpm check:recovery` | Réussi port 3103 : copie service arrêté et restauration isolée ; titres/états/identifiants/catégories/associations/priorités/dates identiques par HTTP. |
| Exemple README `pnpm db:migrate` deux fois | Deux réussites avec MYTODO_DATA_MODE=test et chemin neuf `/tmp/mytodo-m2-migration-*`. Cette même base jetable sert au contrôle manuel port 3104. |
| Contrôle manuel navigateur intégré | Loopback 127.0.0.1:3104, navigateur intégré sur ordinateur : capture Entrée, ouverture, priorité au clavier Home/End, date civile, Enregistrer par Entrée, succès et focus sur ligne observés ; filtre En retard avec flèches ; changement d'échéance retire la tâche du filtre et revient à la capture avec message. Inspection **1280×900** puis **390×844**, filtres et détail, effacement de priorité/date, retour et relecture confirmés. Aucun débordement horizontal observé (largeur DOM 375, viewport 390). Aucun téléphone physique utilisé. Viewport réinitialisé et onglet fermé. |
| `openspec validate organisation-des-taches --strict`, `git diff --check`, liens locaux | Réussis, liens des documents modifiés contrôlés. Il ne s'agit pas d'un OpenSpec Verify. |
| Arrêt et sockets | Session manuelle arrêtée, scripts de check nettoient et arrêtent leurs serveurs. `ss -ltn` autorisé ne montre aucune écoute 3100/3101/3103/3104 en fin de contrôle. |

Échecs intermédiaires distingués : sandbox IPC `EPERM` lors des premiers lancements Playwright, persistance et récupération ; relances avec autorisation réussies. Deux premières suites Playwright ont échoué sur des assertions nouvelles : valeur DOM de l'option null (« Sans priorité ») puis libellé Priorité ambigu entre filtre et détail ; correction des tests uniquement, parcours ciblés 2/2 puis suite finale 60/60. Lecture netlink initialement refusée, relancée avec autorisation. Warnings de couleurs Playwright sans effet sur les résultats. Aucun échec automatisé restant connu.

## Seul contrôle restant — tâche 2.8

Effectuer les essais **au toucher sur un vrai téléphone**, avec données jetables et accès déjà autorisé, puis consigner appareil, OS, navigateur/version, date et résultats. Les validations A37 de M1 ne couvrent pas M2. Vérifier :

1. Changer et retirer la priorité ; sélectionner, changer et effacer une date avec le sélecteur natif ; enregistrer plusieurs champs et annuler un brouillon.
2. Après Enregistrer confirmé, retour à la liste avec succès, filtres et Terminées conservés ; tâche quittant le filtre, retour utilisable ; sans changement, retour sans écriture.
3. Combiner catégorie/priorité/échéance, Sans valeur, Aujourd'hui, En retard et Date précise ; réinitialiser, distinguer aucun résultat, conserver la capture sans héritage, entrer depuis une autre vue sans filtre caché.
4. Retard actif, retrait après réalisation et réapparition à la réouverture ; brouillons et messages visibles en cas de refus, réponse perdue et relecture ; contrôles accessibles et absence de défilement horizontal.

Il manque l'accès à un appareil physique, pas un contrôle automatisable supplémentaire. Ne pas cocher 2.8 sur la seule base des viewports. Aucune nouvelle exposition réseau demandée ou réalisée. Les serveurs sont arrêtés : préparer une instance jetable avec le code compilé M2 et sa migration, sans modifier de base personnelle ni de pare-feu.

## Handoff pour Verify en contexte frais

- Cible stable : `main` sur df9c71f + modifications M2 non commitées décrites ci-dessus. Relire Git, AGENTS et les instructions avant intervention ; ne pas écraser d'autres modifications. Aucun Verify exécuté ici.
- Artefacts : `openspec/changes/organisation-des-taches/{proposal.md,design.md,tasks.md}`, `specs/task-management/spec.md`, `specs/task-organization/spec.md`. Documents : PROJECT_BRIEF, PROJECT_FOUNDATION, UI_DIRECTION, README, DEVELOPPEMENT et ce checkpoint. Seules les cases 2.1–2.7 ont changé parmi les artefacts.
- Décisions à préserver : priorité null par défaut ; date civile locale sans UTC ; intersections stables ; capture sans héritage ; PATCH seulement des champs changés ; Enregistrer confirmé revient à la liste, aucune relecture seule ne vaut confirmation ; brouillon maintenu après échec/incertitude.
- Suite : achever le contrôle tactile et consigner/cocher 2.8 si conforme, puis demander Verify en contexte frais sur une cible stable. Verify devra vérifier indépendamment cohérence, migrations et interactions, en distinguant les résultats ci-dessus et les preuves qu'il exécute. Pas de Sync/Archive automatique.
- Limites : ergonomie du sélecteur natif de date sur téléphone encore inconnue ; jour de référence dépend du fuseau de l'appareil ; pas d'instantané interappareils ni synchronisation automatique ; restauration perd les changements postérieurs à la copie. Aucun défaut automatisé restant constaté. Bases temporaires et logs non garantis après redémarrage.

---

# Historique — M1 validé avant autorisation M2

# Checkpoint — M1 validé

10 novembre 2026. Changement `organisation-des-taches`. **M1 « Classer et retrouver » entièrement validé : 1.1–1.10 terminées, progression 10/18.** L'utilisateur confirme le test téléphone après la correction du retour à la liste. M2 « Repérer ce qui compte » reste non commencé et non autorisé.

- Les essais tactiles précédemment rapportés sur **A37** sont complétés par la confirmation explicite du nouveau retour à la liste après Enregistrer. Validation rapportée par l'utilisateur ; aucune nouvelle manipulation directe du téléphone par ce chat. OS, navigateur et versions n'ont pas été précisés dans cette confirmation.
- Les résultats applicatifs de la reprise précédente restent la référence : **53/53 Vitest, 52/52 Playwright, typecheck, lint et build réussis**, ainsi que contrôle manuel du retour à la liste sur ordinateur et au viewport mobile. Aucun code applicatif modifié ni nouvelle exécution de ces suites pendant cette consignation. L'avertissement historique de sourcemap Nuxt demeure.
- La limite du premier essai de coupure reste consignée : le redémarrage utilisateur avait visé une nouvelle base temporaire. La persistance sur la même base et la restauration sont couvertes par les checks automatisés antérieurs, sans nouvelle preuve tactile de récupération déclarée.
- La case 1.10 a été vérifiée à sa ligne puis cochée ; progression et état relus par OpenSpec. Validation stricte du changement et `git diff --check` réussis. L'utilisateur a ensuite demandé de committer M1, puis d'attendre. Aucun push, Verify ou Archive demandé.
- **Après le commit M1 autorisé : attendre la demande de suite.** Le commit regroupe le code, les tests, la documentation, les artefacts de planification et le suivi validé. M2 exige toujours une autorisation explicite. Le Verify final du changement reste prévu après les deux milestones.

Les bilans ci-dessous sont historiques et conservent leurs statuts au moment de leur rédaction.

---

# Historique — M1, retour à la liste après Enregistrer

10 novembre 2026. Changement `organisation-des-taches`. Retour utilisateur après essais tactiles sur **A37** : validation globale des parcours, avec demande de fermer le détail après Enregistrer pour rendre le succès plus clair. **Correction implémentée et contrôlée ; 1.1–1.9 terminées, 1.10 ouverte uniquement pour confirmer au toucher ce nouveau retour à la liste. Progression : 9/18.** M2 reste non autorisé et non commencé.

## Validation téléphone rapportée par l'utilisateur

- L'utilisateur valide les essais sur tous les points présentés : navigation, catégories, recherche, classement, renommage, suppression, annulation et ergonomie tactile. Modèle annoncé : **A37** ; OS, navigateur et versions non précisés dans ce retour. Ces résultats sont rapportés par l'utilisateur, sans manipulation directe de ce chat.
- Pour la coupure, l'utilisateur rapporte que le brouillon est conservé. Il a relancé le bloc complet de préparation, qui crée un nouveau chemin avec `mktemp`, puis a retrouvé une base vide. Ce retour ne prouve donc pas une relecture de la même base après redémarrage. Les contrôles automatisés de persistance sur la même base sont documentés dans le bilan M1 historique ci-dessous ; ils ne sont pas remplacés par une nouvelle preuve tactile de récupération.
- La demande explicite qui suit ces essais remplace la règle initiale de maintien du détail après succès. La validation tactile précédente ne couvre pas encore cette nouvelle fermeture ; seul ce geste reste à confirmer, sans recommencer toute la grille déjà validée.

## Correction et cohérence

- [app.vue](../app/app.vue) : Enregistrer attend le retour positif de la mutation, puis ferme le détail et restaure le focus dans la liste d'origine. Si la tâche quitte la vue après classement, le message confirme l'enregistrement et explique son absence. Sans modification, retour sans PATCH avec message explicite. Pendant l'attente, après refus ou réponse perdue, le détail et le brouillon restent ouverts. Une relecture seule ne déclenche pas cette fermeture.
- [Tests du retour](../tests/e2e/detail-save.spec.ts) : huit nouveaux cas couvrent titre et classement à 390/1280 px, confirmation différée, absence de changement sans écriture et erreurs sur mobile avec reprise. Les [parcours de gestion](../tests/e2e/management.spec.ts) et [d'organisation](../tests/e2e/organization.spec.ts) ont été adaptés au retour automatique tout en conservant les assertions de persistance, d'état, de brouillon et de champs partiels.
- [Proposition](../openspec/changes/archive/2026-11-12-organisation-des-taches/proposal.md), [design](../openspec/changes/archive/2026-11-12-organisation-des-taches/design.md), [gestion](../openspec/changes/archive/2026-11-12-organisation-des-taches/specs/task-management/spec.md), [organisation](../openspec/changes/archive/2026-11-12-organisation-des-taches/specs/task-organization/spec.md) et [tâches](../openspec/changes/archive/2026-11-12-organisation-des-taches/tasks.md) reflètent le comportement demandé. La tâche 1.8 a été rouverte pour l'ajustement puis recochée après vérification de sa ligne et confirmation CLI.
- [README](../README.md) actualisé. Le [protocole d'exploitation](../documentation/EXPLOITATION_M3.md) distingue maintenant explicitement la préparation initiale avec `mktemp` de la simple commande de redémarrage conservant la base. Pas de changement de migration, API, schéma ou données personnelles dans cette correction.

## Checks réellement exécutés dans cette reprise

| Contrôle | Résultat |
| --- | --- |
| Reproduction avant correction sur le build M1 précédent | **4 échecs attendus** : titre/catégorie à 390/1280 px, détail encore visible après confirmation. |
| `pnpm test` | **53/53** réussis sur SQLite jetable. |
| `pnpm typecheck`, `pnpm lint` | Réussis, repassés après les dernières adaptations de tests. |
| `pnpm build` | Réussi sur le code corrigé ; avertissement historique de sourcemap Nuxt conservé. |
| `pnpm test:e2e` final | **52/52** réussis sur serveur compilé et base isolée : 44 cas existants adaptés + 8 nouveaux. Refus et réponses perdues conservent le détail ; aucun PATCH implicite ou répété. |
| Contrôle manuel navigateur intégré | Serveur compilé `127.0.0.1:3104`, base jetable `/tmp/mytodo-detail-return-4t2SFW/tasks.sqlite`. Capture, ouverture du détail, renommage puis Enregistrer : retour à la liste, message de succès et focus sur la ligne observés au format ordinateur puis au viewport **390×844**. Preuve temporaire : `/tmp/mytodo-detail-save-mobile.jpg`. Viewport réinitialisé, onglet fermé, serveur arrêté. Aucun téléphone physique manipulé. |
| OpenSpec strict et `git diff --check` | Réussis ; liens locaux des documents concernés contrôlés. |

Les échecs intermédiaires ne sont pas présentés comme des réussites : premier lancement Playwright interdit par IPC sandbox, relancé avec autorisation ; première suite après correction, deux assertions trop restrictives sur le contrôle de focus de repli, adaptées à un contrôle visible de la liste ou de capture ; deuxième suite, sélecteur de statut ambigu pendant la relecture, ciblé sur le message d'enregistrement. La suite finale passe sans changement applicatif supplémentaire. Les tests utilisent uniquement des données jetables et des serveurs en boucle locale. Les scripts `check:persistence` et `check:recovery` n'ont pas été relancés : ni leur logique ni la persistance n'ont changé dans cette reprise ; leurs résultats antérieurs restent historiques.

## Prochaine action

Redémarrer l'instance de test sur son chemin existant, sans nouveau `mktemp`, puis actualiser le téléphone. Vérifier seulement qu'une modification de tâche suivie d'Enregistrer ramène à la liste avec le message de succès. Consigner cette confirmation pour terminer 1.10. Aucun besoin de répéter les autres essais tactiles déjà validés. Ne pas démarrer M2, Verify ou Archive automatiquement. Aucun commit, push, autre chat, sous-agent, changement réseau ou modification de base personnelle réalisé dans cette reprise.

---

# Historique — Implémentation initiale de M1 « Classer et retrouver »

10 novembre 2026. Changement `organisation-des-taches`, schéma `spec-driven`, implémentation limitée à M1 sur autorisation explicite. **1.1 à 1.9 terminées ; 1.10 reste ouverte pour le contrôle tactile sur vrai téléphone. Progression CLI : 9/18.** M2 « Repérer ce qui compte » (2.1–2.8) reste non autorisé et non commencé. Aucun sous-agent, autre chat, review indépendante, Verify, Archive, commit, push, publication, changement réseau ou manipulation de données personnelles dans ce chat.

## Résultat et fichiers utiles

- Migration incrémentale [0001_categories.sql](../migrations/0001_categories.sql), [journal](../migrations/meta/_journal.json), [schéma](../server/db/schema.ts) et [connexion](../server/db/database.ts) : table de catégories, clé unique canonique, référence nullable `category_id ON DELETE SET NULL`, clés étrangères actives à chaque ouverture. `0000_tasks.sql` préservé ; aucune migration personnelle exécutée.
- [Types de catégorie](../shared/types/category.ts) et [tâche](../shared/types/task.ts), [normalisation commune](../shared/category-names.ts) : NFC, espaces Unicode réduits (y compris U+0085), casse affichée conservée, clé Unicode minuscule, accents et ponctuation significatifs ; tri français stable. NUL et noms vides refusés. Unicité garantie par SQLite, renommage gardant l’identifiant et suppression déclassant actives/terminées sans toucher leurs autres champs.
- [Métier catégories](../server/domain/categories.ts), [tâches](../server/domain/tasks.ts), [API catégories](../server/api/categories/index.get.ts), [connexion serveur commune](../server/utils/database.ts), [erreurs](../server/utils/categories.ts) et [middleware](../server/middleware/tasks.ts) : CRUD catégories 201/200/204, validation 400, absences 404, conflit 409, indisponibilité 503 ; origine/JSON/no-store étendus. PATCH tâche accepte `categoryId` nullable ; POST reste titre seul. Référence disparue refusée atomiquement avec code `CATEGORY_MISSING`, distinct d’une tâche absente.
- [État des ressources](../app/composables/useTaskResources.ts), [navigation](../app/components/CategoryNavigation.vue), [sélecteur](../app/components/CategoryPicker.vue), [détail](../app/components/TaskDetail.vue), [assemblage](../app/app.vue), [lignes](../app/components/TaskList.vue) : boîte sans catégorie, toutes, catégories (menu direct mobile), gestion explicite des catégories et confirmation de suppression ; suggestions filtrées utilisables au clavier, création distincte de l’enregistrement du classement, conservation des brouillons. Capture toujours non classée avec accès à la boîte. Détail sélectionné dans le tableau complet et conservé après déplacement hors vue ; focus de repli ; Terminées mémorisées par vue dans la session.
- Toutes les mutations sont sérialisées, `retry: 0`, délai 10 s. Les deux GET sont attendus jusqu’à leur fin et publiés ensemble seulement en cas de réussite des deux ; une lecture partielle ne débloque pas l’incertitude. Messages communs visibles dans le détail mobile. Référence inconnue explicitement indisponible, sans assimilation à Sans catégorie. PATCH ne transmet que les champs modifiés par rapport à l’ouverture/dernière confirmation du brouillon, même si une relecture constate des changements indépendants d’un autre appareil.
- [Tests SQLite](../tests/categories.test.ts) et [processus concurrent](../tests/fixtures/create-category.ts), [API](../tests/e2e/api.spec.ts), [organisation navigateur](../tests/e2e/organization.spec.ts), mocks historiques adaptés. [Persistance](../scripts/check-persistence.ts) et [récupération](../scripts/check-recovery.ts) enrichies. [README](../README.md#organisation-m1--catégories) et [développement](../documentation/DEVELOPPEMENT.md#organisation-des-tâches--m1) actualisés.

## Validations réellement exécutées dans ce chat

| Commande / contrôle | Résultat observé |
| --- | --- |
| `openspec list --json`, `status`, `instructions apply --change organisation-des-taches --json` | Racine locale et état ready confirmés ; tous les artefacts et documents applicables lus. Pas de context/operationGuidance additionnel retourné. Chaque case 1.1–1.9 contrôlée à sa ligne avant modification puis progression relue par CLI. |
| `pnpm test` | **53/53**, 3 fichiers, dernière exécution sur la normalisation finale : migration vierge et depuis vraie base 0000 peuplée, réapplication, contraintes ciblées et FK, réouverture, validation, deux processus réellement concurrents sur deux connexions, conflits, renommage et déclassement atomique persistant. |
| `pnpm typecheck` | Réussi, Nuxt et scripts/tests, dernière exécution après les tests finaux et nettoyage du script. |
| `pnpm lint` | Réussi sans avertissement sur la dernière cible. |
| `pnpm build` | Réussi sur le code M1 final ; avertissement historique de sourcemap Nuxt module-preload-polyfill. Log temporaire `/tmp/mytodo-m1-build.log`. |
| `pnpm test:e2e` | **44/44** sur serveur compilé et base isolée. API/protections, régressions capture/gestion, navigation desktop/mobile, sections, clavier/focus, sélecteur et brouillons, doublon, disparition de catégorie, capture sans héritage, déplacement hors vue, publication commune avec chaque GET différé, refus et pertes après vraies écritures POST/PATCH/DELETE catégorie, relectures échouées séparément pour tâches/catégories, aucune répétition/double soumission, PATCH limités aux champs modifiés après relecture, référence inconnue explicite. Chromium Playwright ; un viewport mobile n’est pas un test tactile. |
| `pnpm check:persistence` | Réussi sur données jetables : catégories créées/renommées, associations et tâches relues après redémarrage ; suppression de catégorie et déclassement actif/terminé relus après nouveau redémarrage ; absence de recréation tardive. |
| `pnpm check:recovery` | Réussi sur données jetables : arrêt avant copie, sauvegarde puis restauration isolée, identifiants/titres/états/catégories/associations identiques par HTTP. La seule modification ultérieure du script enlève un bloc superflu et un espace final, validée par typecheck/lint. |
| Exemple README `pnpm db:migrate` deux fois | Deux réussites en mode test avec chemin neuf `/tmp/mytodo-org-migration-*`, aucune donnée personnelle. |
| Contrôle manuel navigateur intégré | Serveur compilé isolé `127.0.0.1:3102`. Capture par Entrée, création de catégorie, recherche « mai » au clavier/flèches/Entrée, classement et maintien du détail hors boîte, retour et focus, renommage avec association conservée, menu mobile Toutes/catégorie, erreur de doublon avec saisie conservée, confirmation et annulation Échap. Rendus inspectés **1280×900** et **390×844**, sans débordement horizontal observé ; largeur DOM mobile 375 pour viewport 390. Aucun téléphone physique utilisé. Capture de preuve `/tmp/mytodo-organisation-m1-desktop.jpg` (temporaire). Viewport réinitialisé ; serveur arrêté et absence d’écoute 3102 confirmée avec `ss`. |
| Liens Markdown locaux et `git diff --check` | README et Développement : liens locaux résolus ; contrôle d’espaces réussi après correction. Liens du présent checkpoint contrôlés également à la finalisation. |

Échecs intermédiaires corrigés ou relancés, distincts des résultats finaux : premier Playwright interdit par sockets sandbox (`EPERM`), relancé avec autorisation ; premières compilations échouées sur import relatif partagé Nuxt, corrigé avec alias `#shared` côté interface ; un avertissement d’ordre des attributs corrigé ; premier typecheck de tableaux d’en-têtes Playwright corrigé avec typage explicite ; deux mocks historiques sans `categoryId` adaptés après échec de leurs tests ; un espace final détecté par `git diff --check` puis corrigé. Première lecture netlink refusée par sandbox, relancée avec autorisation en lecture seule pour confirmer l’arrêt du serveur. Les warnings de couleurs terminal Playwright n’ont pas causé d’échec. Aucun résultat historique conservé plus bas n’est présenté comme un check exécuté ici.

## Reste à faire et reprise

- **1.10 ouverte** : seul le contrôle sur ordinateur a été exécuté ; il manque une validation tactile réelle sur téléphone, avec modèle, OS, navigateur/version et résultats datés. Sur une instance utilisant des données jetables et un accès déjà autorisé : vérifier menu Boîte/Toutes/catégories, création/renommage/suppression et annulation, recherche/sélection/Sans catégorie, création explicite distincte du classement, ajout sans héritage, déplacement hors vue, retour avec Terminées/focus, conservation des brouillons et erreurs visibles, absence de débordement horizontal. Ne pas cocher 1.10 sur la seule base de Playwright ou d’un viewport. Aucun résultat tactile rapporté par l’utilisateur dans ce chat.
- **M2 non autorisé** : aucun champ priorité/date, filtre avancé, Ma journée, étapes, IA ou glisser-déposer ajouté. Ne pas démarrer M2 ni Verify/Archive lors de cette reprise sans demande appropriée.
- Branche `main`, base **454eae6a07a6f20cea88284b28ed8aefde26de10** ; travail M1 non commité. À l’arrivée, seul `openspec/changes/organisation-des-taches/` était non suivi ; ses proposal/design/specs sont préservés, seules les cases du fichier tasks ont changé. Consulter Git et le suivi avant toute reprise ; ne pas écraser les modifications partagées.
- Les serveurs des checks ont été arrêtés ; aucun pare-feu ni configuration réseau modifié. Les scripts nettoient leurs bases jetables ; les fichiers `/tmp` ne constituent pas des preuves durables. Aucun fichier de base personnelle consulté ou modifié.
- Points à examiner par le chat d’origine : ergonomie réelle du sélecteur/menu sur téléphone et cohérence des retours de focus au toucher. Pas de défaut automatisé restant connu. Le milestone ne peut être déclaré entièrement validé avant le contrôle tactile.

---

# Historique antérieur — capture et gestion

Les statuts et autorisations ci-dessous concernent le changement précédent, désormais historique. Le statut courant est celui de l’organisation M1 ci-dessus.

# Checkpoint — Changement archivé

10 novembre 2026. **`capture-et-gestion-des-taches` est archivé**, après résolution du WARNING Verify et confirmation utilisateur du test téléphone de la correction. Les bilans ci-dessous sont historiques.

- Correction et validation finale enregistrées dans **`c42fa6c`** sur `main` ; code et tests identiques aux empreintes de la cible du recontrôle Verify. Aucun nouveau changement applicatif lors de l’archivage.
- [Archive](../openspec/changes/archive/2026-11-10-capture-et-gestion-des-taches/tasks.md) : **20/20 tâches**, tous les artefacts terminés, métadonnées conservées.
- Specs principales synchronisées : [gestion des tâches](../openspec/specs/task-management/spec.md) (**8 exigences, 18 scénarios**) et [accès au domicile](../openspec/specs/home-network-access/spec.md) (**4 exigences, 8 scénarios**). Purpose et blocs d’exigences repris sans modification des deltas ; seuls le titre et la section Requirements sont normalisés.
- Validation stricte des deux specs principales et du changement réussie avant déplacement ; validation stricte des specs principales repassée après archivage. Les **47 liens locaux** du checkpoint, de l’archive et des specs sont valides, `git diff --check` réussi. Les liens relatifs vers la documentation sont ajustés dans l’archive.
- Recontrôle Verify : **27/27 Playwright, 8/8 reproductions indépendantes**, types, lint et build réussis ; aucun constat restant. Test téléphone validé par l’utilisateur, sans nouvelle manipulation par l’orchestrateur. Aucun push effectué.
- Pour l’usage quotidien, restent la configuration permanente du pare-feu et la première sauvegarde externe réelle vers `todo-backup` ; ces opérations ne sont pas réalisées par l’archivage. Voir le [protocole d’exploitation](../documentation/EXPLOITATION_M3.md).

Aucun changement OpenSpec actif restant. Pour une nouvelle fonctionnalité, définir un nouveau changement ; conserver cette archive comme historique.

---

# Historique — Validation finale avant archivage

10 novembre 2026. Changement `capture-et-gestion-des-taches` : **20/20 tâches terminées, correction validée et clôture autorisée par l’utilisateur**. Les bilans conservés plus bas décrivent leurs états historiques.

## Résultats de clôture

- Le recontrôle indépendant du chat Verify a confirmé la résolution du WARNING sur l’erreur de lecture masquée dans le détail mobile, sans nouveau CRITICAL, WARNING ou SUGGESTION. Sa cible était `c9c03dc` avec les trois modifications de correction non commitées, identifiées par les empreintes du handoff ci-dessous.
- Contrôles exécutés par Verify, puis rapport lus par l’orchestrateur : **27/27 Playwright**, **8/8 reproductions indépendantes** (liste/détail, mobile/ordinateur, HTTP 503/délai dépassé), build, typecheck, lint, validation OpenSpec stricte et `git diff --check` réussis. Brouillon, sélection et saisie conservés ; reprise au clavier et absence de mutations/répétitions automatiques vérifiées. Les **40/40 Vitest** restent un résultat exécuté par le chat d’implémentation, non relancé au recontrôle Verify.
- Après restitution de la réserve sur le tactile de cette correction, l’utilisateur a déclaré « je valide le test telephone », puis autorisé la consignation du résultat, le commit et l’archivage. **Validation téléphone rapportée par l’utilisateur**, sans manipulation directe de l’orchestrateur ni nouveau détail sur l’appareil ou les versions. Cette confirmation lève la dernière réserve de clôture ; elle ne constitue pas une nouvelle observation instrumentée du chat Verify.
- Aucune modification du code depuis la cible du recontrôle. La suite autorisée est de committer la correction et ce bilan, synchroniser les deux specs principales, puis archiver le changement. Aucun push demandé.

## Limites d’exploitation conservées

La configuration permanente du pare-feu et la première sauvegarde réelle mensuelle vers le disque externe (`todo-backup`, point de montage à identifier) restent à effectuer avant l’usage quotidien. Les essais LAN précédents utilisaient une règle temporaire retirée après arrêt du serveur ; les contrôles de récupération utilisaient des données jetables. L’avertissement de sourcemap Nuxt demeure. Ces limites sont décrites dans le [protocole d’exploitation](../documentation/EXPLOITATION_M3.md).

---

# Historique — Correction après Verify : lecture dans le détail mobile

10 novembre 2026. Changement `capture-et-gestion-des-taches`, schéma `spec-driven`. Correction unique autorisée par l’utilisateur après examen du Verify avec l’orchestrateur. **Correction terminée et contrôlée localement ; en attente de l’examen de l’orchestrateur et d’un nouveau Verify indépendant.** Aucun Verify, Archive, sous-agent, autre chat, commit ou push lancé dans cette reprise.

## Cible et constat

- État initial constaté : branche **main**, HEAD **c9c03dc12279532b4c2d3b151df27c3629e04fd4** (`Validate home usage and recovery milestone`), arbre propre. M1/M2 sont dans `3919a75`, M3 dans `c9c03dc` ; le handoff précommit plus bas est historique.
- Résultat du Verify précédent **rapporté par l’orchestrateur** : WARNING « Erreur de lecture masquée dans le détail mobile ». L’alerte `loadFailed` et Réessayer étaient dans `.list-pane`, masqué sous 760 px lorsque le détail était ouvert. Même problème pour Chargement. Le constat concerne les scénarios « Chargement impossible » et « Service arrêté après ouverture ».
- Confirmation propre à cette reprise : tests déterministes sur le build de `c9c03dc`, détail ouvert à **390×844**, GET en **503** puis réponse suspendue jusqu’au délai de 10 s. Les deux cas échouent sur la visibilité de l’alerte. Les mêmes cas à **1280×844** passent sur l’ancien code. Le script temporaire de reproduction `/tmp/mytodo-verify-mobile.mjs` a été lu, pas exécuté ; il ne sert pas de preuve nouvelle.

## Correction et périmètre

- [app/app.vue](../app/app.vue) : chargement, erreur et Réessayer déplacés dans une zone commune entre la capture et l’espace liste/détail, indépendante de `.list-pane`. Une seule occurrence de chaque message ; aucun état vide affiché pendant chargement/échec. Le détail reste ouvert et conserve sélection et brouillon. Aucun changement des handlers de lecture/écriture, du délai de 10 s, de la sérialisation, de `retry: 0`, de la capture ou du traitement des écritures incertaines.
- [network-timeout.spec.ts](../tests/e2e/network-timeout.spec.ts) : quatre cas ajoutés (390/1280 px × 503/timeout). Vérifient chargement visible pour la réponse suspendue, erreur et Réessayer uniques et visibles, absence d’état vide, reprise explicite réussie, détail et brouillon préservés même si le titre relu change, saisie de capture préservée, aucune mutation par Entrée pendant la lecture et aucun retry automatique. Les cas préexistants couvrent toujours la liste et les autres parcours.
- Ce [checkpoint](current.md) est le troisième fichier modifié. Aucun artefact OpenSpec ni case ajouté/modifié : CLI **20/20**, `all_done`, sans context/operationGuidance supplémentaire. Ces cases ne constituent pas la preuve de résolution ; les tests avant/après et le contrôle manuel ci-dessous la documentent.

## Commandes et résultats observés maintenant

| Commande / contrôle | Résultat de cette reprise |
| --- | --- |
| `openspec list --json`, `status --change capture-et-gestion-des-taches --json`, `instructions apply --change capture-et-gestion-des-taches --json` | Racine locale confirmée, spec-driven, 20/20, all_done ; documents requis et contextFiles relus. Aucune clôture déclenchée. |
| `pnpm build` avant correction | Réussi sur les sources applicatives de `c9c03dc` pour la reproduction avant correction. |
| `pnpm test:e2e tests/e2e/network-timeout.spec.ts --grep 'détail'` avant correction | **2 échecs mobile attendus**, 2 réussites ordinateur ; échecs sur `getByRole('alert').toBeVisible()`, pour 503 et timeout. |
| `pnpm test` après correction | **40/40 Vitest**, 2 fichiers. |
| `pnpm typecheck` après correction | Réussi sur interface, scripts et tests. |
| `pnpm lint` après correction | Réussi sans avertissement. |
| `pnpm build` après correction | Réussi ; avertissement de sourcemap Nuxt module-preload-polyfill toujours présent. |
| `pnpm test:e2e` après correction | **27/27 Playwright** sur le serveur compilé final, boucle locale et base temporaire : 23 cas préexistants + 4 nouveaux cas. Les deux nouveaux cas mobile échoués avant correction passent après correction. |
| Contrôle manuel navigateur intégré, serveur compilé `127.0.0.1:3102`, base jetable | Ajout d’une tâche jetable, détail à 390×844 et brouillon non enregistré. Arrêt réel du service puis Actualiser : erreur et Réessayer visibles au-dessus du détail, brouillon intact. Redémarrage sur la même base, Réessayer : chargement visible, puis détail et brouillon conservés. À 1280×900, liste et panneau visibles, titre serveur inchangé et brouillon distinct conservé. Viewport réinitialisé, onglet de contrôle fermé et serveur arrêté. |
| `git diff --check`, liens locaux et blocs Markdown du checkpoint | Contrôlés sans erreur à la finalisation. |

Les commandes à serveur de test et le contrôle manuel ont utilisé des bases jetables et des sockets **loopback uniquement**, avec l’autorisation d’exécution nécessaire hors sandbox. Aucun accès au LAN, aucun changement réseau/pare-feu, aucune donnée personnelle. `check:persistence` et `check:recovery` n’ont pas été relancés dans cette reprise : aucun code de persistance/récupération modifié ; leurs résultats M3 ci-dessous sont historiques. Aucun test tactile réel refait : les résultats Samsung A37/Chrome rapportés en M3 ne valident pas cette nouvelle correction visuelle.

## Handoff pour le nouvel examen

- Cible stable : **main**, HEAD **c9c03dc12279532b4c2d3b151df27c3629e04fd4**, modifications **non commitées** limitées à `app/app.vue`, `tests/e2e/network-timeout.spec.ts` et `runs/current.md`. Pas de migration, schéma, dépendance ou configuration d’exploitation modifiée.
- Empreintes des sources validées : `app/app.vue` SHA-256 **91b4f40ac973917fab6a5404123f43c780cec77ec4d37a67169e3f23950651ca** ; `tests/e2e/network-timeout.spec.ts` SHA-256 **bcd2557c9e42af7ca9db17b342a371f5a0b52305910081bc490d732ad913e019**.
- Artefacts à confronter : `openspec/changes/capture-et-gestion-des-taches/{proposal.md,design.md,tasks.md}`, `specs/task-management/spec.md` et `specs/home-network-access/spec.md`. Points précis : états de lecture dans liste/détail mobile, refus HTTP et délai expiré, reprise et brouillon, comportement ordinateur. Le nouveau Verify reste à organiser par l’orchestrateur ; le Verify précédent sur `c9c03dc` n’est pas un résultat sur ces modifications.
- Preuves temporaires propres à cette reprise : `/tmp/mytodo-mobile-read-fix-error.png` (erreur et détail mobile), `/tmp/mytodo-mobile-read-fix-recovered.png` (reprise et brouillon en panneau ordinateur). Base jetable arrêtée : `/tmp/mytodo-mobile-read-fix-ZHOFlj/tasks.sqlite`. Les traces des tests avant correction peuvent avoir été remplacées par la suite finale ; leurs échecs sont consignés ci-dessus. Les fichiers `/tmp` ne sont pas des artefacts durables.
- Aucun blocage local ni échec de check restant. Limites : nouveau Verify non exécuté, contrôle tactile de cette correction non réalisé, avertissement de sourcemap conservé. Attendre l’examen de l’orchestrateur ; aucune clôture automatique.

---

# Historique M3 — bilan avant commit et avant Verify

Ce bilan a été rédigé avant le commit `c9c03dc` et le Verify précédent ; ses mentions de cible/non-commit décrivent cet état historique. Le statut courant est celui de la correction ci-dessus.

# Checkpoint — M3 Valider l’usage au domicile

9 novembre 2026. Changement `capture-et-gestion-des-taches`, schéma `spec-driven`. M3 (3.1–3.5) **terminé**, progression **20/20** ; CLI final `all_done`, cinq tâches M3 confirmées terminées. Base Git **main**, HEAD **3919a756ffc488cd888f03a888297293d1f8da7a** (`Implement task capture and management milestones`), arbre propre au démarrage. Modifications M3 non commitées. Les bilans M1/M2 conservés plus bas sont historiques : leurs mentions « non commité » ou « M3 non autorisé » ne décrivent plus l’état courant.

## Résultat et fichiers utiles

- [Protocole d’exploitation](../documentation/EXPLOITATION_M3.md) : commandes compilées LAN sur données isolées, relevé réseau, restriction temporaire ciblée et retrait, protocole tactile, arrêt/reprise et copie/restauration. [README](../README.md) lié au protocole et complété.
- [Interface](../app/app.vue) : correction observée en M3, délai maximal **10 secondes** sur GET/POST/PATCH/DELETE. `retry: 0`, sérialisation lecture/écriture et reprise explicite conservés. Une lecture sans réponse affiche l’échec ; une écriture sans réponse reste incertaine, saisie préservée, sans nouvelle écriture avant relecture explicite.
- [Tests de délai réseau](../tests/e2e/network-timeout.spec.ts) : lecture suspendue puis reprise, création réellement écrite mais réponse suspendue, saisie conservée, aucune répétition automatique et tâche retrouvée par relecture. Les deux cas échouent sur l’ancien build puis passent après correction.
- [Contrôle de récupération](../scripts/check-recovery.ts), commande `pnpm check:recovery` dans [package.json](../package.json) : crée deux tâches par HTTP (active et terminée), attend l’arrêt complet du serveur, copie le répertoire fermé vers une sauvegarde puis une restauration neuves, compare tous les champs par HTTP. Ignore la base du terminal et nettoie seulement son répertoire temporaire.
- [Tâches OpenSpec](../openspec/changes/archive/2026-11-10-capture-et-gestion-des-taches/tasks.md) : cases 3.1–3.4 contrôlées à leurs lignes 40–43 avant modification et progrès confirmés à chaque fois par le CLI (17, 18, 19 et 16/20 respectivement, selon l’ordre d’exécution).

## Réseau, téléphone et décisions utilisateur

- Relevé réel : `enp6s0`, **192.168.1.11/24**, passerelle `192.168.1.1`. Firewalld actif, zone `FedoraWorkstation` ouvrant déjà `1025-65535/tcp` sans restriction de source ; pas de simple ouverture supplémentaire.
- Autorisation explicite reçue pour ajouter puis retirer une règle **uniquement en mémoire**, sans rechargement global ni modification permanente : `rule family="ipv4" priority="-10" source not address="192.168.1.0/24" destination address="192.168.1.11" port port="3102" protocol="tcp" reject`. Ajout réussi et confirmé par `--query-rich-rule`/`--list-rich-rules`. Node lié uniquement à l’IPv4 LAN, jamais à l’IPv6 publique ni aux interfaces Docker. GET LAN et interface PC réussis, POST d’origine étrangère puis sans origine en **403**, liste identique avant/après. Créations autorisées PC et téléphone réussies.
- Appareil réel annoncé par l’utilisateur : **Samsung A37, Chrome**, Wi-Fi domestique. Versions Android/Chrome non communiquées. Premier échec de connexion expliqué par l’utilisateur : téléphone pas encore sur le Wi-Fi ; accès réussi après connexion.
- Retour utilisateur **« 1–6 ok »** sur le protocole tactile : présence de la tâche PC ; ajout téléphone ; détail/retour, titre modifié/enregistré et brouillon abandonné ; réalisation, consultation dans Terminées et réouverture ; confirmation avec Annuler puis Supprimer pour tâche active et terminée ; aucun défilement horizontal, ajout rapide accessible en liste/détail avec clavier ouvert/fermé. Observations rapportées par l’utilisateur, pas une manipulation directe de l’agent. Aucun défaut tactile signalé.
- Échange **PC → téléphone** confirmé par l’utilisateur. Échange **téléphone → PC** observé par l’agent après clic Actualiser : `M3 téléphone vers PC` présente. Avant arrêt, cette tâche reste active et `M3 PC vers téléphone` a été terminée depuis le PC.
- Après arrêt puis redémarrage du build corrigé sur la même base : réponses HTTP avant/après identiques (`cmp /tmp/mytodo-m3-before-restart.json /tmp/mytodo-m3-after-restart.json`), deux titres/états retrouvés dans le navigateur PC ; utilisateur confirme les mêmes états après rechargement complet sur téléphone.
- Premier arrêt sur téléphone : chargement persiste plus de 30 secondes, puis l’erreur et Réessayer apparaissent. Délai applicatif absent, corrigé à 10 s. Premier recontrôle téléphone non concluant (>10–15 s) ; cause non prouvée. Après fermeture de l’ancien onglet et chargement d’un **nouvel onglet** `/?controle=m3-2` avec tâches visibles, nouvel arrêt réel : utilisateur confirme **« Erreur et bouton Réessayer affichés »** en réponse au contrôle à 10–15 s. Ne pas transformer l’hypothèse d’une ancienne page en cause prouvée.
- Aucun mode hors connexion ni synchronisation instantanée : service/PC requis, relecture au chargement ou par Actualiser, pas de file locale ni répétition automatique.
- Choix sauvegardes reçus : **disque externe**, dossier **`todo-backup`**, **une fois par mois**. Le point de montage sera à identifier lors de la première copie réelle. Aucune copie personnelle ni planification automatique. Les copies/restaurations exécutées restent jetables, sur des chemins distincts du même disque ; aucun test de panne du disque ni copie sur le disque externe réel non monté/désigné.

## Vérifications propres à ce chat sur la cible finale

| Commande / contrôle | Résultat observé |
| --- | --- |
| `openspec list --json`, `status`, `instructions apply` | Racine locale, schéma spec-driven, artefacts et documents applicables lus. Aucun champ context/operationGuidance supplémentaire. |
| `node --version`, `pnpm --version` | 24.14.0 et 10.33.0. |
| `pnpm test` | **40/40 Vitest**, 2 fichiers ; relancé après correction du délai. |
| `pnpm typecheck` | Réussi sur interface, scripts et tests finaux. |
| `pnpm lint` | Réussi sans avertissement sur sources finales. |
| `pnpm build` | Réussi après correction du délai ; avertissement connu de sourcemap Nuxt module-preload-polyfill. |
| `pnpm test:e2e` | **23/23 Playwright**, serveur compilé et base isolée : 21 cas existants + 2 cas de délai suspendu avec horloge navigateur. |
| `pnpm check:persistence` | Réussi sur build final : création, PATCH titre/état, suppressions active/terminée, redémarrages et absence de recréation tardive. |
| `pnpm check:recovery` | Réussi sur build final : service arrêté avant copie du répertoire, sauvegarde, restauration distincte et relecture HTTP identique des titres/états/identifiants/dates de 2 tâches. |
| Navigateur PC intégré, serveur local isolé puis LAN | Ajout, vraie coupure et erreur visible, reprise et tâche retrouvée ; échange téléphone vers PC après Actualiser, réalisation et relecture après redémarrage. Aucun viewport assimilé à un test tactile. |
| Téléphone réel | Résultats utilisateur détaillés ci-dessus : parcours tactile, échanges et titres/états conservés ; erreur à l’arrêt finalement confirmée dans le nouvel onglet du build corrigé. |
| Pare-feu et fin d’essais | Ajout temporaire autorisé puis **retrait réussi** après arrêt du serveur ; `--list-rich-rules` vide et `ss -ltn 'sport = :3102'` sans écoute. |

Échecs intermédiaires distingués : Playwright initial bloqué par sockets sandbox (`EPERM`), relancé avec autorisation puis réussi ; premier typecheck du script de récupération en TS7022, annotations Response ajoutées puis réussite ; lectures netlink initialement bloquées, relancées avec autorisation en lecture. Deux tests nouveaux volontairement exécutés sur ancien build : échecs attendus faute de délai, puis réussite après correction. Les échecs/limites ne sont pas présentés comme des réussites. Deux avertissements h3 sur `statusMessage` ont été visibles après les refus d’origine, sans échec associé ; aucune correction hors scope. Les résultats M1/M2 rapportés par l’orchestrateur (40 Vitest, 21 Playwright et autres checks) restent distincts de toutes ces relances M3.

Dernière consolidation 3.5 : case vérifiée à la ligne 44 après préparation du handoff et contrôle des fichiers, cochée puis confirmation CLI **20/20**, état `all_done`. Liens locaux des trois documents et blocs Markdown contrôlés, `git diff --check` réussi.

## Handoff pour un futur Verify en contexte neuf

- Cible : **main**, HEAD **3919a756ffc488cd888f03a888297293d1f8da7a**, travail M3 **non commité**, stabilisé à ce bilan. Huit chemins modifiés/ajoutés : `README.md`, `app/app.vue`, `openspec/changes/capture-et-gestion-des-taches/tasks.md`, `package.json`, `runs/current.md`, `documentation/EXPLOITATION_M3.md`, `scripts/check-recovery.ts`, `tests/e2e/network-timeout.spec.ts`. Ni migration, ni schéma, ni dépendance modifiés.
- Artefacts du changement : `openspec/changes/capture-et-gestion-des-taches/proposal.md`, `design.md`, `tasks.md`, `specs/home-network-access/spec.md`, `specs/task-management/spec.md`. Références : `documentation/PROJECT_BRIEF.md`, `PROJECT_FOUNDATION.md`, `UI_DIRECTION.md`, `DEVELOPPEMENT.md`, et protocole M3. Relire AGENTS et le template de consignes. Les artefacts de planification restent inchangés, sauf les cinq cases M3.
- Aucune exigence M3 restante après consolidation finale. Le futur Verify devra contrôler indépendamment la cohérence code/artefacts sur cette cible stable et distinguer les faits observés des retours utilisateur. Aucun Verify ni Archive exécuté ici ; pas de reviewer, sous-agent, autre chat, commit, push ou publication.
- Limites d’exploitation explicites : serveur **arrêté**, règle temporaire **retirée**. Pour une nouvelle session LAN, revérifier l’IPv4 DHCP et appliquer une restriction autorisée avant démarrage. Une configuration permanente du pare-feu ou un service système n’a pas été demandé/autorisé. L’utilisateur ignore la configuration des redirections de sa box ; aucun changement du routeur, tunnel ou exposition Internet réalisé. Lecture des règles nft refusée sans root (`sudo -n` demande un mot de passe) ; ni audit routeur ni test depuis Internet/hors sous-réseau effectué. Le contrôle d’origine ne remplace pas une authentification.
- Données de preuve uniquement jetables : base LAN arrêtée `/tmp/mytodo-m3-lan-Z6woQG/tasks.sqlite`, base PC locale arrêtée `/tmp/mytodo-m3-pc-xm0tGM/tasks.sqlite`, snapshots HTTP `/tmp/mytodo-m3-before-restart.json` et `/tmp/mytodo-m3-after-restart.json`. Captures `/tmp/mytodo-m3-pc.png`, `/tmp/mytodo-m3-lan-pc.png`, `/tmp/mytodo-m3-two-devices.png`, `/tmp/mytodo-m3-after-restart.png`, `/tmp/mytodo-m3-pc-stopped-final.png`. Fichiers temporaires non garantis après redémarrage ; le script check:recovery nettoie ses seules copies automatiques. Aucune base personnelle touchée.

---

# Historique M2 — bilan conservé

Les mentions de travail non commité et de M3 non autorisé ci-dessous décrivent le bilan M2 antérieur au commit 3919a75 et à l’autorisation M3 actuelle.

# Checkpoint — M2 Gérer les tâches

9 novembre 2026. Changement `capture-et-gestion-des-taches`, schéma `spec-driven`. M2 (2.1–2.7) terminé : progression **15/20**, M1 **8/8**, M2 **7/7**, M3 **0/5**. M3 n'est pas commencé et exige une autorisation explicite dans un autre chat vierge. Aucun sous-agent, autre chat, review indépendante, Verify, archive, commit, push ou publication lancé.

## Résultat M2 et fichiers utiles

- [Règles métier](../server/domain/tasks.ts) : validation des identifiants UUID v4 issus de M1 ; PATCH partiel normalisé de `title` et/ou booléen `completed`, propriétés inconnues refusées, état cible idempotent, champs non soumis préservés. Suppression sans upsert, cible absente maîtrisée en 404 ; entrées invalides en 400. Aucun changement du schéma ni de la migration M1, aucune réinitialisation de données.
- Routes [PATCH](../server/api/tasks/[id].patch.ts) et [DELETE](../server/api/tasks/[id].delete.ts), erreurs centralisées dans [utils/tasks.ts](../server/utils/tasks.ts). Les contrôles M1 d'origine, JSON et cache s'appliquent aussi aux mutations M2. Suppression confirmée en 204.
- [Interface](../app/app.vue) et [liste de tâches](../app/components/TaskList.vue) : détail en panneau au-dessus de 760 px, vue dédiée en dessous, ajout rapide conservé ; titre enregistré sans toucher à l'état, Annuler/Retour/Échap abandonnent le brouillon. Cases distinctes des titres ; section Terminées repliée au chargement, conservée lors du retour du détail ; ordre par création inchangé.
- Confirmation de suppression avec titre enregistré et Annuler/Supprimer ; focus initial sur Annuler, boucle Tab/Maj+Tab, Échap annule. Retour du focus au titre ou à un contrôle disponible après déplacement/suppression. Après réponse perdue de suppression, focus sur la relecture, car Supprimer est alors désactivé.
- Toutes les mutations restent confirmées par le serveur et sans répétition automatique (`retry: 0`). Lectures et écritures sérialisées ; la correction de coordination M1 est conservée. Refus certain : affichage inchangé et brouillon conservé. Résultat incertain : nouvelles écritures bloquées jusqu'à une relecture explicite réussie, sans écraser le brouillon du détail. La liste permet de comparer le titre serveur ; si la cible a disparu, le détail se ferme. Pas de brouillon persistant après fermeture du détail ou rechargement.
- [README](../README.md) actualisé : gestes, abandon des brouillons, reprise après erreur et contrat API. [Tests M2 navigateur](../tests/e2e/management.spec.ts), [API](../tests/e2e/api.spec.ts), [métier/SQLite](../tests/tasks.test.ts) et [redémarrages](../scripts/check-persistence.ts).

## Vérifications exécutées dans ce chat M2

Ces résultats sont propres à ce chat. Les résultats M1 rapportés par le chat précédent sont conservés séparément plus bas.

| Commande / contrôle | Résultat M2 |
| --- | --- |
| `openspec list --json`, `openspec status --change capture-et-gestion-des-taches --json`, `openspec instructions apply --change capture-et-gestion-des-taches --json` | Racine locale confirmée, schéma et état ready ; artefacts et documents applicables lus. Aucun champ context/operationGuidance additionnel retourné. Chaque case M2 vérifiée à son sourcePath/line puis progression confirmée par le CLI après modification. |
| `pnpm test` | **40/40 tests Vitest**, 2 fichiers : les 24 cas M1 et 16 cas M2. Validation, PATCH partiel/idempotent, cible absente, titres/états persistants après fermeture/réouverture, suppression active/terminée et mise à jour tardive. |
| `pnpm typecheck` | Réussi sur Nuxt, scripts et tests. |
| `pnpm lint` | Réussi sans avertissement sur les sources finales. |
| `pnpm build` | Réussi ; avertissement de sourcemap Nuxt module-preload-polyfill déjà présent en M1. |
| `pnpm test:e2e` | **21/21 tests**, 3 fichiers, serveur compilé et base temporaire. Les 9 cas M1 passent, dont les GET différés ouverture/actualisation. M2 : API, détail PC/mobile, titre vide, annulation/retour, focus, réalisation/réouverture/ordre, maintien de section, suppression active et terminée au clavier, refus et pertes de réponses après vraies écritures pour titre/état/suppression, brouillons et relecture, sérialisation et double soumission. |
| `pnpm check:persistence` | Réussi : création puis arrêt/redémarrage ; PATCH titre/état, suppression active et terminée, second arrêt/redémarrage ; relecture identique et PATCH tardifs en 404 sans recréation. Base jetable nettoyée par le script. |
| Contrôle manuel navigateur intégré sur serveur compilé isolé, port 3102 | Ajout par Entrée ; modification par Tab/Entrée et focus rétabli ; Échap retourne au titre ; réalisation/réouverture avec Espace ; section Terminées conservée au retour ; brouillon abandonné en quittant ; confirmation avec titre, boucle Maj+Tab/Tab et annulation Échap, focus rétabli. Panneau et liste inspectés à **1280×900**, vue dédiée et confirmation à **390×844** : aucun débordement horizontal observé. Serveur arrêté après contrôle ; viewport réinitialisé. |
| `git diff --check`, vérification des liens locaux des documents modifiés | Réussis. |

Échecs intermédiaires corrigés, non présentés comme réussites : premier typecheck du tableau d'en-têtes Playwright (typage explicite ajouté), type de contenu du cas JSON malformé (corrigé), deux cas de boucle de focus natif et focus vers Supprimer désactivé après réponse perdue (corrigés puis suite repassée). Les commandes à sockets `test:e2e` et `check:persistence` ont d'abord échoué dans le sandbox (`EPERM`), puis ont été relancées avec autorisation. Deux avertissements de lint d'ordre des attributs ont été corrigés ; dernier lint sans avertissement. Avertissements de couleurs du terminal pendant Playwright sans échec associé.

## Limites, état Git et prochaine étape

- Aucun contrôle tactile sur vrai téléphone ni accès LAN, pare-feu, échange PC/téléphone ou sauvegarde/restauration réalisé. Ils restent ouverts en M3, dont la destination distincte et la fréquence des sauvegardes à décider. Le rendu mobile sur ordinateur ne valide pas le tactile.
- Branche **main**, base **cc8af5a**. Travail M1 préexistant préservé et toujours non commité ; M2 ajouté dans le même arbre. `AGENTS.md`, `README.md`, tasks.md modifiés ; fichiers applicatifs, outillage et checkpoint encore non suivis. Aucune donnée personnelle utilisée. Aucun commit/push/publication.
- Prochaine étape : l'orchestrateur récupère ce bilan ; M3 uniquement dans un autre chat vierge sur autorisation. Ne pas lancer Verify ni Archive sur ce changement encore incomplet. Relire les artefacts et ce checkpoint avant toute reprise.

---

# Historique M1 — résultats rapportés du chat précédent

Les paragraphes suivants constituent le checkpoint M1 reçu au début de M2. Leurs mentions « M2 non autorisé » et leurs prochaines actions décrivent cet état historique ; le statut courant est celui de M2 ci-dessus.

# Checkpoint — M1 Capturer et retrouver

9 novembre 2026. Changement : `capture-et-gestion-des-taches`, schéma `spec-driven`. M1 (1.1–1.8) terminé ; M2 et M3 non autorisés. M2 sera confié à un autre chat vierge sur demande de l'utilisateur ; ne pas le poursuivre dans ce chat. Aucun sous-agent, autre chat, reviewer, Verify ni archive lancé.

## Résultat livré

- Nuxt 4.4.2 / Vue 3.5.45, TypeScript strict, pnpm 10.33.0 ; pilote better-sqlite3 12.8.0 avec Drizzle 0.45.4. Versions figées et lockfile installé. Détails et sources officielles : [Développement](../documentation/DEVELOPPEMENT.md).
- [Interface](../app/app.vue) en français : boîte de réception, ajout au clavier, liste triée, états chargement/vide/échec/enregistrement, conservation du titre refusé et relecture explicite après réponse incertaine. Aucun POST automatiquement répété. Aucun contrôle factice de M2.
- [API](../server/api/tasks/index.get.ts) GET et [POST](../server/api/tasks/index.post.ts), règles dans [domain/tasks.ts](../server/domain/tasks.ts), schéma et accès dans [server/db](../server/db/database.ts), [migration](../migrations/0000_tasks.sql) explicite réapplicable.
- [Contrôle d'origine et JSON](../server/middleware/tasks.ts), refus des URL de bases, cache `no-store`, erreurs maîtrisées. SQLite et annexes hors Git et ressources publiques. Données de test temporaires ; aucune base personnelle utilisée.
- [README](../README.md) : installation, commandes, migration, démarrage dev/compilé, chemins et origines, reprise après erreur et limites. Consignes AGENTS actualisées pour refléter le socle applicatif.

## Vérifications réellement exécutées

| Commande / contrôle | Résultat |
| --- | --- |
| `openspec list --json`, `status`, `instructions apply --change capture-et-gestion-des-taches --json` | Racine locale confirmée ; tous les contextFiles lus ; suivi vérifié après chaque case cochée. |
| `node --version`, `pnpm --version`, `pnpm view … engines/version` | Node 24.14.0, pnpm 10.33.0 ; choix compatibles documentés. |
| `pnpm install` | Réussi après autorisation réseau/cache. Dépendances transitives alignées ; dernier install sans conflit peer. |
| Ouverture réelle `better-sqlite3` en mémoire, `select sqlite_version()` | SQLite 3.51.3 ; fermeture réussie. |
| `pnpm typecheck` | Réussi ; inclut désormais Nuxt **et** `tsc --project tsconfig.tools.json` pour scripts et tests. |
| `pnpm lint` | Réussi sur le code final. |
| `pnpm test` | **24 tests Vitest réussis**, 2 fichiers. Migrations vierge/répétée, contraintes SQL, réouverture, ordre stable, chemins, entrées invalides et doublons volontaires. |
| `pnpm build` | Réussi avec Nitro node-server ; code applicatif final compilé. |
| `pnpm exec playwright install chromium` | Réussi après autorisation. Distribution non officiellement prise en charge : binaire Ubuntu 24.04 de repli utilisé, fonctionnel pour ces tests. |
| `pnpm test:e2e` | **9 tests réussis** sur le serveur compilé, dernière exécution après correction de la coordination lecture/création. HTTP origines/JSON/cache/fichier privé, ajout/rechargement/clavier, vide/chargement/échec, double soumission, refus et perte de réponse après écriture réelle, viewport mobile avec titre long, coordination lecture/création à l'ouverture et pendant Actualiser. |
| `pnpm check:persistence` | Réussi, y compris dernière exécution : POST confirmé, arrêt, redémarrage compilé sur la même base temporaire, relecture identique par HTTP. |
| Exemple README : `pnpm db:migrate` deux fois, puis `HOST=127.0.0.1 PORT=3102 pnpm start` | Deux migrations réussies sur une base `mktemp` ; démarrage réussi ; `curl --fail --silent http://127.0.0.1:3102/api/tasks` retourne `[]`. Serveur arrêté par Ctrl+C. |
| Développement : migration puis `pnpm dev --port 3102`, base temporaire et origine explicite | Vite et Nitro démarrés sur 127.0.0.1 ; GET `/api/tasks` retourne `[]`. Serveur arrêté par Ctrl+C. |
| Contrôle manuel via navigateur intégré, serveur compilé temporaire | Ajout « Vérification manuelle M1 » par Entrée confirmé ; champ vidé et refocalisé ; Tab atteint Ajouter avec contour de focus visible ; actualisation retrouve la tâche. Rendus inspectés à 1280×900 et 390×844, sans débordement observé. Serveur de contrôle arrêté. |
| `git check-ignore` | `.data/`, fichiers SQLite, annexes et `.output/` ignorés. |
| `git diff --check`, vérification des liens locaux des documents modifiés | Réussis. Références aux exemples d'installation `skills/` et `agents/` du guide existant non installées par ce milestone. |

Les échecs intermédiaires n'ont pas été comptés comme des réussites : restrictions du sandbox pour réseau/cache/sockets (relancés avec autorisation), premiers conflits peer (alignés), test initial exigeant 404 alors que Nuxt renvoyait l'accueil 200 (refus explicite ajouté, test repassé), et typage d'une liste d'en-têtes de test (annotation corrigée puis typecheck repassé). Avertissement de build restant : sourcemap du plugin Nuxt module-preload-polyfill. Avertissements de couleurs du terminal pendant Playwright sans échec associé.

## Correction M1 — coordination lecture/création

Défaut signalé et reproduit par l'orchestrateur : une lecture démarrée avant un ajout pouvait revenir après sa confirmation et remplacer la liste par une réponse ancienne, faisant disparaître la tâche affichée sans perte en base.

Correction limitée à [app/app.vue](../app/app.vue) : les lectures et créations sont sérialisées. `reload()` était déjà interdit pendant un enregistrement ; `create()` refuse désormais aussi de soumettre pendant `loading`, et le bouton Ajouter est désactivé pendant cette lecture. Le champ reste modifiable et conserve le titre saisi ; l'utilisateur peut soumettre dès la fin de la lecture, y compris après son échec. Aucune soumission différée automatique n'est ajoutée. Le [README](../README.md) décrit cette attente.

Deux cas déterministes ajoutés dans [inbox.spec.ts](../tests/e2e/inbox.spec.ts) retiennent explicitement le GET, à l'ouverture puis pendant Actualiser. Ils vérifient la saisie conservée, Ajouter désactivé, Entrée sans POST pendant l'attente, puis un seul ajout confirmé et visible après libération du GET. `pnpm test:e2e --grep 'coordonne lecture différée'` a été exécuté **avant la correction** : les deux cas échouent sur l'ancien build, car Ajouter reste actif. Après correction et nouveau build, `pnpm test:e2e` passe avec **9/9 cas**, y compris les tests existants de saisie conservée après refus et de relecture explicite après réponse perdue.

Checks exécutés pour cette correction : `pnpm typecheck`, `pnpm lint`, `pnpm test` (**24/24**), `pnpm build`, `pnpm test:e2e` (**9/9**) et `git diff --check`. L'avertissement de sourcemap Nuxt reste présent. Les validations de migration, redémarrage et contrôle manuel consignées plus haut datent du bilan M1 initial ; elles n'ont pas été répétées pour cette correction d'interface. Le contrôle tactile sur vrai téléphone reste à faire. Les cases OpenSpec ne changent pas : **8/20**, M1 **8/8**, M2/M3 ouvertes. Aucun commit, publication, sous-agent, review ou archive.

## Limites et reprise

- Contrôle tactile sur **vrai téléphone non effectué** ; aucun accès LAN, pare-feu, échange PC/téléphone ni sauvegarde/restauration validé. Ces validations appartiennent à M3. La destination distincte et la fréquence des sauvegardes restent à décider avant l'usage quotidien.
- Pas de mode hors connexion, de file locale ou de synchronisation instantanée. Le service et le PC doivent être accessibles. Aucun compte ; l'origine ne remplace pas une authentification.
- Modification du titre, réalisation/réouverture, détail et suppression restent en M2 ; leurs cases sont ouvertes. M1 ne prépare pas d'API pour ces opérations.
- Les ports 3100 et 3101 doivent rester libres pour les scripts de test. Ils attendent le démarrage de leur propre processus, utilisent des bases temporaires et n'utilisent pas les variables de base personnelle du terminal.
- État Git : branche **main**, commit de base **cc8af5a**, modifications M1 non commitées. Le dépôt était propre au départ. Aucun commit/push réalisé. Fichiers nouveaux applicatifs et outillage à ajouter avant un éventuel commit ; le README, AGENTS et tasks.md sont modifiés. Documentation produit/fondations/UI et workflow préservée.
- Prochaine action : l'orchestrateur récupère ce retour de correction M1. Sur demande ultérieure de l'utilisateur, confier M2 à un autre chat vierge ; y relire ce checkpoint et les artefacts, puis relancer `openspec instructions apply --change capture-et-gestion-des-taches --json`. Ne pas archiver ce changement incomplet : progression globale attendue **8/20**, M1 **8/8**, M2/M3 **0/12**.
