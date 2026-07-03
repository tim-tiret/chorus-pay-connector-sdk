# @chorus-pay/connector-sdk

SDK officiel pour créer des **connecteurs Chorus Pay** — des modules qui
relient Chorus Pay à un logiciel externe (ERP de facturation ou boutique en
ligne).

📖 Documentation complète : https://choruspay.fr/doc/connecteurs

## Installation

```bash
npm install @chorus-pay/connector-sdk zod
```

## Utilisation

```ts
import { defineConnector, cf } from "@chorus-pay/connector-sdk";

export default defineConnector({
  manifest: {
    id: "mon-logiciel",
    name: "Mon Logiciel",
    version: "1.0.0",
    category: "erp",
    minSdkVersion: "1.0.0",
    allowedDomains: ["api.mon-logiciel.com"],
    configFields: [cf.secret({ key: "apiKey", label: "Clé API", required: true })],
  },
  async checkConnection(ctx) {
    const { apiKey } = await ctx.config.get();
    if (!apiKey) return { success: false, error: "Clé API requise" };
    const res = await ctx.http.fetch({ url: "https://api.mon-logiciel.com/me" });
    return { success: res.ok };
  },
  capabilities: {
    invoice: {
      async create(ctx, { payLink, payLinkId, invoiceDate }) {
        // … créer la facture, retourner un ErpInvoiceResult
      },
    },
  },
});
```

Le plus simple pour démarrer : le template
[chorus-pay-connector-template](https://github.com/tim-tiret/chorus-pay-connector-template).

## Ce qu'exporte le SDK

- `defineConnector(def)` — valide et fige la définition du connecteur.
- `cf.*` — constructeurs de champs de config (`text`, `secret`, `url`,
  `select`, `boolean`, `group`, `action`) : ils génèrent la page de config.
- Tous les types du contrat (`ConnectorCtx`, `ConnectorDefinition`,
  `ErpInvoiceResult`, `PayLinkDto`, `InvoiceDto`, …).
- `ConnectorError`, `ConnectorHttpError`, `ConnectorPermissionError`,
  `ConnectorConfigError` — erreurs typées (reconnues par `error.code`).
- Utilitaires : `buildConfigSchema`, `validateConfig`, `serializeManifest`,
  `compareSemver`, `SDK_VERSION`.

## Contrat

Le connecteur ne touche jamais la base de données ni le réseau directement :
tout passe par le `ctx` fourni à chaque appel, qui filtre les données par
compte fournisseur et restreint le réseau aux `allowedDomains`. Voir la
[documentation](https://choruspay.fr/doc/connecteurs) pour la référence
complète des capacités, entrées et sorties.

## Licence

MIT.
