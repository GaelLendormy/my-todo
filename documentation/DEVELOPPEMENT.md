# Développement — M1

## Compatibilité vérifiée le 9 novembre 2026

Runtime local : Node 24.14.0 et pnpm 10.33.0. Nuxt 4.6.4 exige Node `^22.22.3 || ^24.15.0 || >=26.0.0` : il n'est donc pas retenu sur ce runtime. Nuxt **4.4.2** accepte `^20.19.0 || >=22.12.0` (métadonnées du paquet et [source officielle versionnée](https://github.com/nuxt/nuxt/blob/v4.4.2/packages/nuxt/package.json)). Vue **3.5.45**, TypeScript **5.9.3**, Drizzle **0.45.4** et better-sqlite3 **12.8.0** sont figés dans le manifeste et le lockfile.

Le [guide officiel Drizzle](https://orm.drizzle.team/docs/get-started-sqlite) prend en charge le pilote local better-sqlite3. Le [manifeste officiel du pilote 12.8.0](https://github.com/WiseLibs/better-sqlite3/blob/v12.8.0/package.json) prend en charge Node 24. L'installation utilise son binaire Linux précompilé lorsqu'il existe, sinon `node-gyp rebuild --release` nécessite Python, make et un compilateur C++. Le script natif du pilote est explicitement autorisé par `pnpm-workspace.yaml`. Node:sqlite n'est pas retenu : pas de changement de pilote nécessaire.

La page d'installation Nuxt a renvoyé un contenu Markdown non exploitable par le navigateur de recherche ; les prérequis ont été recoupés sur le manifeste officiel versionné et avec `pnpm view nuxt@4.4.2 engines`.

L'installation initiale a fait remonter des dépendances transitives récentes incompatibles entre elles. L'alignement utilise `@nuxt/eslint` 1.15.2, et des overrides pnpm pour `@nuxt/kit` 4.4.2, `@nuxt/cli` 3.34.0 et `@nuxt/devtools` 3.2.3. L'installation finale n'a plus signalé de conflit de peer dependencies. Le pilote s'est installé sans compilation de secours visible et a retourné SQLite **3.51.3** à l'ouverture d'une base en mémoire.

Les résultats d'installation et de validation seront consignés dans le [checkpoint](../runs/current.md). Les commandes d'utilisation sont dans le [README](../README.md).
