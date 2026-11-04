# La Mia Pizza — prototip de venda online (pizzes envasades al buit)

> ⚠️ **Prototip de demostració.** Productes, preus, al·lèrgens i vida útil són **dades de mostra**.
> No es fan comandes ni pagaments reals. Context complet a [`CLAUDE.md`](./CLAUDE.md).

## Provar en local

Cal Node.js 20 o superior.

```bash
npm install
npm run dev
```

Obre http://localhost:3000 (al mòbil, des de la mateixa xarxa: `http://<IP-de-l'ordinador>:3000`).

## Desplegar a Vercel

1. Puja el repositori a GitHub.
2. A https://vercel.com/new → *Import* el repositori → *Deploy* (no cal configurar res a la fase 1).
3. Cada `git push` a la branca principal torna a desplegar automàticament.

O bé des de la terminal: `npx vercel` (prova) i `npx vercel --prod`.

## On canviar les dades

| Què | Fitxer |
|---|---|
| Productes, preus, al·lèrgens, vida útil | `src/data/sample-data.ts` |
| Decisions obertes (facturació, IVA, repartiment) | `src/config/business.ts` |
| Textos de la web | `src/messages/ca.ts` |
| Colors | `src/app/globals.css` (bloc `@theme`) |
