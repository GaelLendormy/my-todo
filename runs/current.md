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
