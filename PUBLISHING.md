# Publier le SDK sur npm

C'est simple. Une fois le compte npm créé :

```bash
# 1. Se connecter (une seule fois)
npm login

# 2. Depuis ce dossier — le prépublish lance le build automatiquement
npm publish --access public
```

Le paquet est scopé `@chorus-pay/*`. Deux options pour le scope :

- **Créer l'organisation npm `chorus-pay`** (https://www.npmjs.com/org/create,
  gratuit pour les paquets publics) — recommandé.
- Ou publier sans scope en renommant le paquet `chorus-pay-connector-sdk`
  dans `package.json` (retirer le `@chorus-pay/`).

## Versionnage

Le SDK suit semver. `SDK_VERSION` (dans `src/define.ts`) et le champ
`version` du `package.json` doivent rester alignés — c'est cette version que
les connecteurs déclarent dans `minSdkVersion` et que le host vérifie au
chargement.

Après publication, les repos de connecteurs (template, pennylane…) remplacent
leur dossier `sdk/` embarqué par la dépendance :

```json
"devDependencies": { "@chorus-pay/connector-sdk": "^1.0.0" }
```

et leurs imports `@/lib/connector-sdk` deviennent `@chorus-pay/connector-sdk`
(le tsconfig `paths` disparaît). Le host, lui, continue d'utiliser
`lib/connector-sdk/` en interne — les deux restent synchronisés par le numéro
de version.
