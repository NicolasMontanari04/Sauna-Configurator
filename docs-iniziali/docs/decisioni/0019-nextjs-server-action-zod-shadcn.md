# 0019. Next.js con Server Action e Route Handler, Zod, shadcn/ui

- **Stato:** Accettata; sostituita in parte da [0026](./0026-pagina-unica-come-il-mockup.md) (route, firme delle Server Action, funzionamento senza JavaScript, `request_id`)
- **Note:** Raccoglie le decisioni P6, P7, P8, P9 e P10 dell'analisi v6

## Contesto
L'applicazione ha pagine del catalogo lette dal database, un configuratore interattivo con anteprima, un modulo di invio, un PDF da scaricare e deve essere accessibile (WCAG 2.1 AA). Due sviluppatori lavorano in TypeScript sullo stesso repository, su Windows.

## Decisione
- **Framework:** Next.js con App Router e React. Pagine del catalogo renderizzate sul server; configuratore come componente client.
- **Route (P6):**

| Route | Contenuto |
|---|---|
| `/` | Catalogo dei prodotti |
| `/configura/[prodotto]` | Configuratore |
| `/riepilogo/[token]` | Conferma: stato dell'invio, "Scarica il PDF", "Riprova" |
| `/riepilogo/[token]/pdf` | Route Handler che restituisce il PDF |
| `/informativa` | Informativa sulla privacy |
| `/galleria` | Pagina interna di controllo, disponibile solo fuori produzione o con una variabile dedicata |

- **Stato nell'URL (P7):** una chiave per gruppo nella query string, ad esempio `/configura/aladdin?size=60&wood=rovere&floor=moka`; i gruppi `multi` hanno valori separati da virgola. Un valore sconosciuto torna al predefinito, con un avviso.
- **Server (P8):** Server Action per "Ricevi il riepilogo" e "Riprova"; Route Handler per il PDF (`Content-Type: application/pdf`, `Content-Disposition`). Entrambi con `runtime = 'nodejs'`.
- **Validazione:** Zod sui dati in ingresso e sui file del catalogo; gli stessi schemi in client e server.
- **Interfaccia:** shadcn/ui (basato su Radix), con controllo a mano e con axe.
- **Prove (P9):** Vitest per regole, schemi, catalogo e un PDF per prodotto; Playwright con `@axe-core/playwright` per il flusso da tastiera e axe; Mailpit per verificare email e allegato.
- **Versioni (P10):** Node.js 24 LTS; Next.js all'ultima versione stabile al momento della PR del contratto; PostgreSQL 17; dipendenze a versione esatta (`save-exact=true` in `.npmrc`).

## Motivi
- Next.js tiene nello stesso progetto pagine renderizzate sul server, componenti interattivi e codice del server, senza un backend separato.
- La Server Action fa funzionare il modulo anche senza JavaScript e condivide la validazione Zod.
- Il PDF è un file binario: serve un Route Handler che restituisca la risposta con gli header giusti.
- PDFKit e resvg richiedono il runtime Node.js, non Edge.
- Lo stato nella query string rende il link condivisibile e l'ordine delle chiavi libero.
- Radix gestisce focus, ruoli ARIA e tastiera dei componenti, una buona base per AA.
- Versioni esatte e la stessa versione di Node danno lo stesso comportamento sui due portatili.

## Conseguenze
- L'URL non è legato a una configurazione salvata (scheda 0006); il server rivalida tutto all'invio.
- Il PDF scaricabile è protetto solo dal token: chi ha il link lo può aprire.
- Le prove Playwright richiedono il database e Mailpit avviati.

## Come è stato verificato
Da completare con lo scheletro della fase 3.

## Ripiego
Se le Server Action danno problemi, lo stesso codice si espone come Route Handler `POST`.

## Alternative considerate
- Solo Route Handler (API REST): più esplicito, ma il modulo richiede JavaScript.
- Stato nei segmenti del percorso (`/configura/aladdin/60/rovere/moka`): URL più pulito, ma ordine fisso e optional multipli scomodi.
- Prove solo con Vitest e controlli manuali: meno strumenti, ma il flusso da tastiera e axe non sarebbero ripetibili.
- Node.js 22 LTS: più vecchio, utile solo se un portatile non si può aggiornare.
- Vite con un backend separato: due progetti da tenere allineati, senza vantaggi qui.

## Nota del 2026-11-11

Dopo la revisione dell'analisi v6 il `request_id` lo genera il server quando mostra il modulo, così il modulo funziona anche senza JavaScript: è un cambio di scelta, registrato nella scheda [0024](./0024-request-id-dal-server.md).
- Nessun file esporta `runtime`: `nodejs` è il predefinito, e un file `'use server'` non può esportarlo (analisi, P8).
- `/galleria` si attiva con `ENABLE_GALLERY=true`, impostata nella demo.
- `inviaRiepilogo` chiama `redirect()` sul server, così il modulo funziona anche senza JavaScript; firme e campi sono in P8 dell'analisi.
