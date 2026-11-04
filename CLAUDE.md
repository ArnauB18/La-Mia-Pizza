# La Mia Pizza — Web de comandes de pizzes envasades al buit (prototip)

Aquest document dona context a Claude Code per començar a construir un **prototip** de web. Llegeix-lo sencer abans de crear res.

## 1. Context del negoci

- **La Mia Pizza** és una marca de pizzeries de take-away i domicili al Vallès Oriental, molt coneguda a la zona. El seu propietari i gestor és en Lutty.
- Les pizzeries estan a: **Sant Feliu de Codines, Centelles, L'Ametlla del Vallès, La Garriga, Parets del Vallès, Bigues i Riells i Santa Eulàlia de Ronçana**.
- En Lutty té un **obrador** central que prepara el gènere i el porta a cada pizzeria. Ara mateix està valorant una nau industrial per muntar-hi un obrador nou.
- Ven pizzes **envasades al buit**, que no promociona gaire. Ja té demanda: li'n demanen bastantes pel seu compte.
- El canal de botigues externes **s'ha descartat**: en Lutty ja té gent interessada per la seva banda. L'objectiu és una **web pròpia** que capti aquesta demanda.

## 2. Objectiu del prototip

Una web on el client pugui **comprar pizzes envasades al buit i rebre-les a casa** (enviament a domicili).

> **Canvi de criteri (nov. 2026):** inicialment es plantejava recollida a les pizzeries. S'ha descartat perquè obligar a recollir fa perdre clients potencials. Ara el model és **enviament a domicili**. La cadena de fred i qui fa el repartiment queden com a decisió oberta (secció 8).

**El prototip és només per ensenyar-lo a en Lutty.** Encara no hi ha cap acord tancat (percentatge, titularitat del domini i xarxes) i en Lutty ha dit que en parlaran quan tingui l'obrador llest. No és una web en producció.

## 3. Flux d'usuari previst

1. El client veu el catàleg de pizzes envasades (foto, descripció, ingredients, al·lèrgens, pes, vida útil).
2. Afegeix productes a la cistella.
3. Introdueix el **codi postal** i es comprova si és dins d'una zona d'entrega.
4. Posa l'adreça i **tria el dia (i franja) d'entrega** entre els disponibles per a la seva zona. És un model de **pre-comanda**: es pot demanar fins a una hora límit i s'entrega un o dos dies després.
5. Paga i rep una confirmació amb número de comanda.
6. L'obrador prepara la llista de repartiment del dia i es lliuren les comandes.

## 4. Requisits del prototip (MVP)

**Imprescindible**
- Catàleg amb 3-4 productes d'exemple (dades de mostra, editables)
- Cistella, comprovació de codi postal, adreça i selecció de dia/franja d'entrega
- **Estoc / capacitat per dia d'entrega** (tot surt de l'obrador)
- **Zones d'entrega** configurables: codis postals, cost d'enviament, comanda mínima, dies, hora límit i franges
- Confirmació de comanda amb número
- Vista d'administració simple (per a en Lutty/el personal): llista de comandes per dia i zona, llista de repartiment, edició d'estoc i de zones
- Disseny **mòbil primer**, ràpid i senzill

**Fora de l'abast del prototip**
- Pagaments reals: fer servir **mode de proves** (p. ex. Stripe en test) o simular el pagament
- Integració amb transportistes o optimització de rutes
- Comptes d'usuari (n'hi ha prou amb nom, telèfon i email a la comanda)
- Integracions amb l'obrador o la comptabilitat

## 5. Stack i desplegament

- **Hosting**: Vercel (pla gratuït, domini `*.vercel.app` per a proves)
- Preferència per un stack senzill i mantenible: **Next.js (App Router) + TypeScript**, estils amb Tailwind CSS
- Persistència per al prototip: una base de dades gestionada i gratuïta (per exemple Neon/Vercel Postgres o Supabase) o, si cal anar ràpid, dades locals en JSON. Decideix-ho tu i explica la tria
- Model de dades pensat per a: `Product`, `DeliveryZone`, `DailyStock` (producte × dia), `Order` (amb adreça i franja), `OrderItem`

## 6. Dades i marca

- **No facis servir logotips ni imatges reals de la marca** sense que se't donin. Usa el nom de treball "La Mia Pizza" en text i imatges de mostra o marcadors de posició
- **Actualització (nov. 2026):** el client ha facilitat el logo (`public/img/marca/logo.png`) i fotos de la Turó i la Pernil (`public/img/pizzes/`). Estil de referència: fons beix (#f4e3c7), tinta negra, lletra manuscrita (Caveat Brush). Ús condicionat a l'acord amb en Lutty sobre la marca
- **Preus, pesos, ingredients i vida útil són de mostra.** Marca-ho al codi (fitxer de dades clarament etiquetat). Preu de referència per a proves: ~8€ per pizza amb IVA
- Idioma de la web: **català**, amb l'estructura preparada per afegir castellà després
- Totes les dades visibles que s'hagin de confirmar amb en Lutty (preus, al·lèrgens, vida útil) han de poder-se canviar des d'un únic fitxer o des de l'admin

## 7. Aspectes legals i de producte a deixar previstos (no resoldre ara)

- Etiquetatge d'aliments: **al·lèrgens**, ingredients, data de caducitat i lot han de poder mostrar-se a cada producte
- Venda online d'aliments: política de devolucions (els peribles poden quedar exempts del desistiment), política d'enviaments, privacitat (RGPD) i condicions de compra
- Informació d'al·lèrgens disponible **abans** de la compra (venda a distància)
- IVA d'alimentació: confirmar amb el gestor abans de mostrar preus finals
- Les pizzeries tenen socis diferents; qui factura la venda **encara no està decidit**. No assumeixis cap model al codi: deixa-ho configurable

## 8. Decisions obertes (no inventis respostes)

- Percentatge o model de remuneració, i titularitat del domini, la web i les xarxes: **pendent d'acordar amb en Lutty**
- Cost real de la pizza envasada i capacitat de l'obrador: pendent que en Lutty ho confirmi
- **Qui fa el repartiment** (propi des de l'obrador, repartidors de les pizzeries, transportista amb fred) i com es garanteix la cadena de fred
- **Refrigerada o congelada**: afecta vida útil i logística
- Zones d'entrega del pilot, cost d'enviament, comanda mínima, dies i franges d'entrega

## 9. Com vull treballar

1. Abans d'escriure codi, **proposa un pla curt** (pàgines, model de dades, passos) i espera la meva confirmació
2. Construeix per fases petites i demostrables: primer catàleg i cistella, després zones i dies d'entrega, després estoc i admin
3. Mantén el codi simple i ben comentat. Explica les decisions tècniques importants en poques línies
4. Si falta alguna dada del negoci, **pregunta-la** o usa un marcador de posició clarament etiquetat; no t'ho inventis
5. Quan una fase estigui feta, indica com provar-la en local i com desplegar-la a Vercel

## 10. Estat i estructura del codi

- **Fase 1 (feta):** catàleg, fitxa de producte i cistella (localStorage).
- **Fase 2 (feta):** zones per codi postal, dies i franges d'entrega (hora límit en hora de Catalunya), dades del client i adreça, pagament simulat, confirmació amb enllaç privat, pàgines legals (esborranys).
- **Fase 3 (part feta):** admin amb contrasenya (comandes per dia/zona/estat, llista de producció, canvi d'estat, full de repartiment). Estoc per producte i dia amb capacitat per defecte i taula `daily_stock`.
- **Pendent:** edició d'estoc, zones i productes des de l'admin; correu de confirmació; Stripe en mode test; castellà.

Fitxers clau:
- `src/data/sample-data.ts`: ⚠️ dades de mostra dels productes. Dues categories: `pizza` (feta) i `base` (massa estirada sola o amb tomàquet)
- `src/config/delivery.ts`: ⚠️ zones, codis postals, enviament, mínim, dies, hora límit, franges i estoc per defecte (tot PENDENT)
- `src/config/business.ts`: decisions obertes (`PENDENT`): facturació, IVA, repartiment
- `src/messages/ca.ts`: tots els textos de client (afegir `es.ts` per al castellà)
- `src/lib/orders.ts`: lògica de comandes al servidor (validació, estoc, transacció, pagament)
- `src/lib/dates.ts`: càlcul de dies d'entrega i hora límit (Europe/Madrid)
- `src/db/`: esquema Drizzle, SQL de creació (`bootstrap.ts`, mantenir-lo sincronitzat) i connexió (Neon o PGlite)
- `src/lib/cart.tsx`: cistella; només guarda id + quantitat, mai preus
- `tests/`: proves amb Vitest (`npm test`), incloent-hi el procés de comanda contra Postgres en memòria
