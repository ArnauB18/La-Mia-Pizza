# La Mia Pizza: prototip de venda online (pizzes envasades al buit)

> ⚠️ **Prototip de demostració.** Productes, preus, al·lèrgens, zones i dies d'entrega són **dades de mostra**.
> El pagament és **simulat**: no es cobra res. Context complet a [`CLAUDE.md`](./CLAUDE.md).

## Què fa

| Pàgina | Per a qui | Què hi ha |
|---|---|---|
| `/` | Client | Catàleg: pizzes i massa (sola o amb tomàquet) |
| `/producte/[slug]` | Client | Fitxa: al·lèrgens, ingredients, vida útil, preparació |
| `/cistella` | Client | Cistella (es desa al navegador) |
| `/comanda` | Client | Codi postal → dia d'entrega → dades i adreça → pagament |
| `/comanda/LMP-XXXXX?t=…` | Client | Confirmació (enllaç privat amb token) |
| `/admin` | Personal | Comandes per dia, província i estat; llista de producció; canvi d'estat |
| `/admin/productes` | Personal | Crear, editar i desactivar productes; pujar fotos |
| `/admin/estoc` | Personal | Capacitat de l'obrador per producte i dia |
| `/admin/zones` | Personal | Cost d'enviament, mínim, dies de repartiment i hora límit per província |
| `/admin/repartiment?date=…` | Personal | Full imprimible per al repartidor |
| `/legal/*` | Tothom | Condicions, enviaments, devolucions, privacitat (esborranys) |

### Targetes de prova

- `4242 4242 4242 4242`: pagament acceptat
- `4000 0000 0000 0002`: pagament denegat (la comanda es cancel·la i l'estoc s'allibera)

## Provar en local

Cal Node.js 20 o superior. No cal instal·lar cap base de dades.

```bash
npm install
npm run dev
```

- Web: http://localhost:3000
- Admin: http://localhost:3000/admin (contrasenya en local: `lamia`)
- Les comandes es desen a `./.data/pglite`. Per començar de zero, esborra aquesta carpeta.

Altres ordres:

```bash
npm test          # proves (dates, preus, validació i procés de comanda complet)
npm run typecheck # tipus de TypeScript
npm run lint
```

## Desplegar a Vercel

1. A https://vercel.com/new, importa el repositori i fes **Deploy**.
2. **Base de dades (Neon, gratuïta):** al projecte de Vercel → **Storage → Create → Neon** → connecta-la al projecte.
   Es crea sola la variable `DATABASE_URL`. Les taules es creen soles el primer cop.
3. **Admin:** a **Settings → Environment Variables** afegeix `ADMIN_PASSWORD` amb la contrasenya que vulguis.
4. Torna a desplegar (**Deployments → Redeploy**).

Sense el pas 2 la web funciona igualment, però les comandes es guarden en memòria i es perden quan Vercel
reinicia el servidor (l'admin ho avisa). Sense el pas 3 l'admin queda desactivada.

## On canviar les dades

Productes, preus, al·lèrgens, fotos, estoc i zones es canvien **des de l'admin**. Els fitxers
`src/data/sample-data.ts` i `src/config/delivery.ts` només són les dades inicials del primer arrencament.

| Què | On |
|---|---|
| Productes, preus, al·lèrgens, vida útil, fotos | `/admin/productes` |
| Capacitat per dia | `/admin/estoc` |
| Zones: enviament, mínim, dies, hora límit | `/admin/zones` |
| Decisions obertes (facturació, IVA, repartiment) | `src/config/business.ts` |
| Textos de la web | `src/messages/ca.ts` |
| Textos legals (esborranys) | `src/app/legal/[slug]/page.tsx` |
| Colors i tipografia | `src/app/globals.css` (bloc `@theme`) |

## Arquitectura (resum)

- **Next.js 15 (App Router) + TypeScript + Tailwind 4**. Les accions de servidor (`"use server"`) són l'única porta d'entrada.
- **Drizzle ORM + Postgres.** Amb `DATABASE_URL` es connecta a Neon/Postgres. Sense, fa servir PGlite (Postgres en WebAssembly).
- **El servidor ho valida tot**: preus des del catàleg, zona, dia/hora límit (en hora de Catalunya),
  mínim de comanda i estoc. L'estoc es reserva en una transacció amb bloqueig per dia, perquè dues comandes
  alhora no puguin vendre la mateixa última unitat.
- **Pagament** a `src/lib/payments.ts`: simulat, preparat per substituir-lo per Stripe en mode test.
