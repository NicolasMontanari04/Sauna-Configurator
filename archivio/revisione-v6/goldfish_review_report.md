Status: resolved (Stage 9, round 2)

# Goldfish Annotated Review Report: Stage 9, round 2

## Esito della risoluzione (2026-11-11)

L'autore ha risposto "auto accept". Per R16 ha indicato che la demo gira **su uno dei due portatili degli sviluppatori**.

**Applicate:** tutte le PROPOSE FIX (R1-R25 e i Nit tecnici). Per R16:
- **riga 14:** "entrambi preparati allo stesso modo";
- **sezione 12:** tolto il riferimento al terzo computer;
- **fase 8 e criteri:** le prove finali si fanno sul portatile che non ospiterà la demo, con un indirizzo di prova; il criterio 1 si ripete sul portatile della demo nella fase 9.

**Altri file aggiornati:**
- note datate nelle schede 0007, 0014, 0015, 0016, 0018, 0019 e 0021;
- nella 0021, "fase 2" diventa "fase 3" per la prova della diagonale;
- in `aladdin.json`, la nota sulle chiavi `_`.

**Documento:** ora ha 1023 righe; la DetailedRange va da 511 a 1023.

**Non applicate:** i Nit di stile 30-34 (DECLINE). Il ri-audit dello Stage 9 è esaurito.

**Target:** `configuratore-saune-analisi-v6.md` (righe 497-958)
**Fonte:** `implementation_readiness_report.md`, sezione "round 2" (R1-R25 e Nit)

Dopo questa risoluzione non ci sarà un altro ri-audit: il limite di uno è già stato usato.

**Riepilogo:**
- PROPOSE FIX: 25 Major, più un gruppo di Nit;
- ESCALATE: 1 (R16, quale computer userete per la demo);
- CONTEST: 0;
- DECLINE: i Nit di sola forma, elencati in fondo.

---

## Prioritized Findings & AI Suggestions

### [R1] [IR, CD, ST] - Severity: Major — schema della geometria
*   **Affected Scope:** righe 528 (15.2) e 297-300 (9.2); schede 0016 e 0021
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** con lo schema attuale non si può descrivere Aladdin. Mancano lo specchio, il frame e le misure per taglio, e la 9.2 usa campi diversi.
*   ***Proposed Edit:***
    *   15.2: sostituire la frase sullo schema minimo con questo testo.
        ```ts
        type Geometria = {
          front: { type: 'glass' | 'wood' | 'door'; widthCm: number }[]; // da sinistra
          mirrorBandCm: number;        // altezza della fascia di specchio in basso (0 se assente)
          frameCm: number;             // spessore del frame esterno (0 se assente)
          benches: { shape: 'linear' | 'l'; depthCm: number; levels: 1 | 2 }[]; // parte visibile dal vetro
          stove?: { side: 'left' | 'right'; offsetCm: number };              // solo pianta
        };
        ```
        Le misure che cambiano con il taglio stanno in `sizes[].attributes`, che sovrascrive `geometry` chiave per chiave. La somma dei `widthCm` di `front` deve essere uguale alla larghezza del taglio: lo controlla Zod.
    *   9.2, punto 2: scrivere "Le parti e i loro campi sono quelli dello schema della sezione 15.2" al posto dell'elenco con i nomi in italiano.
    *   Schede 0016 e 0021: aggiungere una nota datata che rimanda alla 15.2. Nella 0021 la stufa resta facoltativa e serve solo alla pianta.

### [R2] [IR, CD, ST] - Severity: Major — la foto si deforma (errore mio)
*   **Affected Scope:** P13 (righe 829-834), 9.3 (riga 318)
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:***
    *   Sostituire il paragrafo "*Resa della foto (A)*" con questo testo:
        > Il generatore conosce il riquadro di ogni forma. Per ogni forma crea un pattern con `patternUnits="userSpaceOnUse"` e `x`, `y`, `width`, `height` uguali al riquadro. Dentro mette `<image>` con le stesse misure e `preserveAspectRatio="xMidYMid slice"`. La foto si ritaglia ma non si deforma, e su un fronte a pannelli si ripete per pannello. La prova della fase 2 lo verifica anche in resvg.
    *   9.3: "Il cambio di materiale cambia solo il riferimento del `<pattern>` di ogni zona" diventa "Il cambio di materiale cambia solo l'immagine dei pattern di ogni zona, che hanno `id` nella forma `<prefisso>-<zona>-<indice>`".

### [R3] [IR, CD, ST] - Severity: Major — la diagonale in resvg
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:***
    *   Fase 3, compiti di N: aggiungere "conversione resvg della diagonale di Aladdin, con i quattro controlli della sezione 11, aggiunta alla 0015; se fallisce, nel PDF va la frontale in grande (ripiego della 0021)".
    *   Scheda 0021, righe 24 e 29: "prova della fase 2" diventa "fase 3".

### [R4] [IR] - Severity: Major — formato delle regole
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:***
    *   P2: dopo la tabella aggiungere questo testo.
        > Nel file:
        > - `{ "type": "requires" | "excludes", "from": { "group", "value" }, "to": { "group", "value" }, "message" }`
        > - `{ "type": "only_with_size", "from": { "group", "value" }, "sizes": ["60"], "message" }`
        >
        > `message` è obbligatorio. Nel database `option_rule` ha:
        > - `from_value_id`, con una chiave esterna verso `option_value`;
        > - `to_value_id`, nullabile;
        > - `sizes` di tipo `text[]`, nullabile;
        > - un `CHECK` che rende obbligatorio `to_value_id` per `requires` ed `excludes`, e `sizes` per `only_with_size`.
    *   8.1, riga 231: allineare la descrizione di `option_rule`.

### [R5] [IR, CD] - Severity: Major — tipi di `valuta`
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:***
    *   P8: sostituire la riga di `valuta` con questo testo.
        ```ts
        valuta(config: { product: string; size: string; selections: Record<string, string | string[]> }, prodotto: Prodotto)
          → { valida: boolean;
              errori: { tipo: 'struttura' | 'regola'; group?: string; value?: string; messaggio: string }[];
              disattivati: Record<string /*group*/, Record<string /*value*/, string /*messaggio*/>> }
        ```

### [R6] [IR, CD, ST] - Severity: Major — Server Action e "Riprova"
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:***
    *   P8: sostituire le firme con questo testo.
        > - `inviaRiepilogo(statoPrecedente, formData)`. I campi sono `email`, `emailConferma`, `informativa` (checkbox), `requestId` (nascosto) e un campo nascosto per ogni chiave dello stato dell'URL (`size`, `wood`, …). Con errori di validazione restituisce `{ ok: false, errori: Record<campo, messaggio> }`. Altrimenti salva la riga, prova gli invii e chiama `redirect('/riepilogo/' + token)` fuori da ogni `try/catch`, anche se l'invio è fallito: lo stato si vede nella pagina di conferma.
        > - `riprova(statoPrecedente, formData)`, con `token` in un campo nascosto. Se l'`UPDATE` della sezione 10.3 non restituisce righe, risponde `{ ok: false, motivo: 'attendi' | 'inviata' | 'esauriti' }`. I testi sono "Attendi qualche secondo e riprova", "L'email è già stata inviata" e "Tentativi esauriti: scarica il PDF". Se l'invio parte, chiama `redirect` sulla stessa pagina.
    *   10.2, passo 3: dopo "entrambi gli stati `pending`" aggiungere "con `customer_attempts = 1`, `customer_last_attempt_at = now()` e gli stessi valori per `project_…`".

### [R7] [IR, CD, ST] - Severity: Major — mappa degli errori
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:*** aggiungere in 10.3 questa tabella.

    | Codice | Causa (RF6) | Messaggio |
    |---|---|---|
    | `ECONNECTION`, `EDNS`, `ESOCKET`, `ETLS` | server di posta non raggiungibile | "Il server di posta non è raggiungibile. Controlla la connessione." |
    | `EAUTH` | accesso all'account rifiutato | "Il server di posta ha rifiutato l'accesso." |
    | `ETIMEDOUT` e la scadenza di 15 s | tempo scaduto | "Il server di posta non ha risposto in tempo." |
    | `EENVELOPE` | indirizzo rifiutato | "L'indirizzo email è stato rifiutato." |
    | altro | server di posta non raggiungibile | come sopra; il codice si salva in `customer_error` |

    La scadenza si ottiene con `Promise.race`, perché `sendMail` non accetta un `AbortSignal`. Dopo la scadenza si chiama `transporter.close()`. Nella 10.2, passo 5, "(`AbortSignal` o `Promise.race`)" diventa "(`Promise.race`, poi `transporter.close()`)". Nella tabella 18 la riga degli errori aggiunge `EDNS` ed `ESOCKET`.

### [R8] [IR, CD, ST] - Severity: Major — ambiente delle prove
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:*** sostituire il testo dopo la tabella 18 con questo.
    > **Ambiente delle prove.**
    > - Le prove usano il database `configuratore_test`, nello stesso container, indicato da `.env.test`.
    > - `npm run test:setup` lo crea, poi esegue migrate e seed.
    > - Vitest gira in serie (`fileParallelism: false`) e svuota `configuration` prima di ogni file.
    > - `playwright.config.ts` avvia due `webServer`:
    >   - Mailpit;
    >   - `next build && next start -H 127.0.0.1`, con `env` esplicito: `SMTP_HOST=127.0.0.1`, `SMTP_PORT=1025`, `SMTP_SECURE=false` e `DATABASE_URL` di prova.
    >
    >   Così una prova non manda mai email vere.
    > - Mailpit deve essere nel `PATH`, nella versione indicata in `README.md`.
    > - Su ogni computer, una volta sola: `npx playwright install chromium`.

    In 15.3 aggiungere lo script `test:setup` e il file `.env.test` alla tabella dei file.

### [R9] [IR, CD] - Severity: Major — `.env` negli script
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:***
    *   Tabella 15.3: ogni comando `tsx` diventa `tsx --env-file=.env`; per le prove si usa `--env-file=.env.test`.
    *   Sotto la tabella aggiungere: "`drizzle.config.ts` chiama `process.loadEnvFile()` (Node 24). Next.js carica `.env` da solo; `tsx` e `drizzle-kit` no".

### [R10] [IR, CD, ST] - Severity: Major — file e proprietari
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:***
    *   Tabella dei ruoli: `src/app/` diventa "`src/app/` (tranne `src/app/azioni.ts` e `src/app/riepilogo/[token]/pdf/route.ts`, di N)"; `public/` diventa "`public/` (texture e foto le scarica N)". La riga 505 diventa "N trascrive i prodotti che gli sono assegnati (sezione 15.4)".
    *   Tabella "File iniziali":
        *   aggiungere queste righe:
            *   `docker-compose.yml`, servizio `db` (N, fase 1);
            *   `vitest.config.ts`, `playwright.config.ts`, `.env.test` (N, fase 2);
            *   `components.json`, `src/lib/utils.ts`, creati da `shadcn init` (M, fase 2);
            *   le pagine di P6 con il percorso completo (M, fase 3);
            *   `src/app/azioni.ts` (`'use server'`: `inviaRiepilogo`, `riprova`; N, fase 3-4);
            *   `src/app/riepilogo/[token]/pdf/route.ts` (N, fase 3);
            *   `public/texture/` e `public/foto/<prodotto>/` (N, fase 2);
            *   `docs/mockup/configuratore-saune.html` (M, fase 2);
        *   usare i percorsi completi (`src/contratti/configurazione.ts`, `scripts/check.ts`, …).

### [R11] [IR, CD, ST] - Severity: Major — chiavi `_` e schede non allineate
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:***
    *   P1, voce sulle chiavi `_`: "un `z.preprocess` toglie le chiavi che iniziano con `_`; poi lo schema è `.strict()`, quindi ogni altra chiave sconosciuta fa fallire la validazione."
    *   `aladdin.json`, ultima voce di `_daVerificare`: "I campi che iniziano con '_' sono annotazioni: lo schema Zod li scarta, non vanno tolti a mano."
    *   Note datate del 2026-11-11:
        *   **0018:** le chiavi `_` le scarta lo schema;
        *   **0015 e 0019:** nessun file esporta `runtime`; `/galleria` si attiva con `ENABLE_GALLERY`;
        *   **0014:** anche le texture sono un avviso;
        *   **0007:** titolari i due sviluppatori come contitolari, basi giuridiche 6(1)(b) e 6(1)(f), rimando alla sezione 12;
        *   **0016 e 0021:** vedi R1 e R3.

### [R12] [CD, IR] - Severity: Major — `photoGroup` (errore mio)
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:***
    *   8.1, tabella `product`: dopo `photos` aggiungere "`photo_group` (codice del gruppo che cambia la foto, nullabile)".
    *   Riga 516: "con lo stesso tipo del file validato da Zod" diventa "con il tipo `Omit<ProdottoFile, 'schemaVersion'>`".

### [R13] [CD, IR, ST] - Severity: Major — dipendenze
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:*** riscrivere la voce della 15.2 così.
    > La lista iniziale delle dipendenze:
    > - **lo scaffold:** `create-next-app` (TypeScript, Tailwind, App Router, `src/`) e `shadcn init` nella fase 2. I pacchetti che questi strumenti installano fanno parte della lista: `react`, `react-dom`, `tailwindcss`, `@tailwindcss/postcss`, `clsx`, `tailwind-merge`, `class-variance-authority`, `lucide-react`, i pacchetti `@radix-ui/*` dei componenti aggiunti, `@types/react`, `@types/react-dom`, `@types/node`, `typescript`;
    > - **in più:** `drizzle-orm`, `postgres`, `zod`, `nodemailer`, `pdfkit`, `@resvg/resvg-js`;
    > - **in sviluppo:** `drizzle-kit`, `tsx`, `@types/nodemailer`, `@types/pdfkit`, `vitest`, `@playwright/test`, `@axe-core/playwright`.
    >
    > Tutti con la versione esatta (P10).

    "Lista fissa" diventa "lista iniziale".

### [R14] [CD, ST] - Severity: Major — font nel browser
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:***
    *   P14: aggiungere questo testo.
        > `next/font/local` genera un nome di famiglia proprio. Per questo i font si dichiarano anche con un `@font-face` scritto a mano, con `font-family: 'Jost'` e `'IBM Plex Sans'`, sugli stessi file. Così l'SVG usa lo stesso nome nel browser e in resvg. I TTF statici vengono dalla cartella `static/` dei pacchetti di Google Fonts. Pesi: Jost Medium per i titoli e le quote, IBM Plex Sans Regular per il testo e SemiBold per le etichette.
    *   9.3: aggiungere "L'anteprima è un SVG inline nella pagina, non un `<img>`".

### [R15] [ST, IR] - Severity: Major — RNF3
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:*** "con un solo comando (`npm run demo`)" diventa "con `npm ci` e `npm run demo`".

### [R16] [ST, IR] - Severity: Major — quale computer usate per la demo
*   ***AI Suggestion:*** ESCALATE
*   ***Justification:*** la riga 14 dice "uno dei due portatili", la riga 442 ammette "un terzo computer". Non posso ricavare dai file quale delle due è vera. La correzione dei criteri dipende da questa risposta.
*   ***Proposed Edit:*** se la demo gira su uno dei due portatili:
    *   riga 442: togliere "e quello del computer della demo, se è un terzo computer";
    *   fase 8: "sul portatile che non ospita la demo, con un indirizzo di prova";
    *   criterio 1: "verificato sul portatile che non ospita la demo (fase 8) e su quello della demo (fase 9)";
    *   criterio 4: "nella fase 8 con un indirizzo di prova; nella demo con quello del tutor".

    Se invece è un terzo computer, si cambia la riga 14 e i criteri restano come sopra, con "computer della demo".

### [R17] [ST] - Severity: Major — criterio 2
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:***
    *   Criterio 2: "Aladdin con viste SVG" diventa "Aladdin con la vista frontale e, se pronta, la diagonale".
    *   "Se la prova del generatore fallisce" diventa "se il secondo prodotto supera la soglia della regola di decisione (sezione 9.2, punto 5)".
    *   9.2, punto 6: "Dopo il secondo prodotto (fase 3) si stima il tempo per prodotto; all'inizio della fase 6 si fissa l'obiettivo."

### [R18] [ST] - Severity: Major — criterio 5
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:*** sostituire il criterio 5 con questo testo.
    > Con l'account Gmail si fanno due prove separate: (a) `SMTP_PASSWORD` sbagliata; (b) rete staccata. In entrambe devono valere `customer_status = failed`, il messaggio di RF6 per quella causa e "Scarica il PDF" funzionante. Poi si ripristina la causa (password corretta e riavvio, oppure rete ricollegata). Dopo almeno 30 secondi, "Riprova" invia senza creare una seconda riga.

### [R19] [ST] - Severity: Major — tentativi (errore mio)
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:*** tabella 18, "terzo tentativo" diventa "quarto tentativo (terzo "Riprova")".

### [R20] [ST] - Severity: Major — prova del rifiuto del server
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:***
    *   Tabella 18: dividere la riga dell'URL in due prove.
        *   "URL con un valore sconosciuto | Playwright | valore predefinito e avviso".
        *   "`inviaRiepilogo` chiamata con una combinazione che viola una regola | Vitest + database | `ok: false`, nessuna riga".
    *   P7: aggiungere "Una combinazione incompatibile nell'URL si tratta come un cambio: le scelte non valide tornano al predefinito (P2)".

### [R21] [ST, CD, IR] - Severity: Major — predefinito e regole
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:*** in P2, sostituire la frase sul predefinito con "Il seed rifiuta un file in cui il valore predefinito di un gruppo `single` è il bersaglio di una regola (`to` di `excludes`/`requires`, `from` di `only_with_size` che non copre tutti i tagli). Così il ritorno al predefinito ha sempre un valore valido". Dividere la voce in punti separati e spostare la frase su "Nessuna pedana" in 8.1.

### [R22] [ST] - Severity: Major — lingua degli identificatori
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:***
    *   Riga 265: "Gli identificatori nel codice e nel database sono in inglese" diventa "Le colonne del database e i campi dei file del catalogo sono in inglese; i nomi di funzioni, file e cartelle del progetto sono in italiano".
    *   Tipi di R5 e R6: le chiavi dei dati del catalogo (`group`, `value`) restano in inglese, il resto è in italiano. Lo scrivo nella stessa nota.

### [R23] [ST] - Severity: Major — `/galleria`
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:*** sezione 18: "mostra ogni prodotto × taglio con i materiali predefiniti" diventa "mostra ogni prodotto × taglio con i materiali predefiniti e, per ogni gruppo, una riga con la vista frontale per ciascun valore".

### [R24] [ST] - Severity: Major — criterio 7
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:***
    *   Tabella 18: aggiungere "`npm run clean -- --email <indirizzo>` | Vitest + database | cancellate tutte e sole le righe di quell'indirizzo, anche scritto con maiuscole".
    *   Criterio 7: "Le prove automatiche della sezione 18 passano, comprese quelle di `npm run clean` con e senza `--email`."

### [R25] [ST] - Severity: Major — "vista frontale del mockup"
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:***
    *   Fase 2: "porta la vista frontale del mockup" diventa "porta la vista "Esterno" del mockup, che diventa la frontale".
    *   9.1, riga 292: "la vista "Esterno" diventa la frontale, "Interno" si toglie, la diagonale è nuova".

### [Nit] - PROPOSE FIX (correzioni tecniche, costano poco)
*   **Script npm (15.3):**
    *   titolo "Migrazioni e script npm";
    *   aggiungere `dev` (`next dev -H 127.0.0.1`, con Mailpit avviato a parte) e `db:generate`;
    *   per l'email il comando è `npm run clean -- --email <indirizzo>`;
    *   "migrazioni applicate" vuol dire: numero di righe di `__drizzle_migrations` uguale al numero di voci del journal.
*   **Database e posta:**
    *   criterio 4: `docker compose exec db psql -U postgres -d configuratore`;
    *   con `SMTP_USER` vuoto si omette `auth`, e `SMTP_SECURE` si converte in booleano;
    *   con `texture: null` il generatore usa `color` e il controllo delle texture lo salta.
*   **Fasi:**
    *   fase 1: `docker-compose.yml` è un file provvisorio, che poi entra nel repository nella fase 2;
    *   fase 2: N cambia `viewer` di Aladdin in `svg` dopo aver scritto la geometria; la prova del PDF viene dopo il porting di M; "scrive la scheda" diventa "aggiorna la 0015";
    *   fasi 6-8: "Entrambi";
    *   fase 3: "Prima verifica tastiera e axe" la fa M.
*   **Prove (tabella 18):**
    *   prova del `request_id` con Playwright e doppio invio, come nella 0024;
    *   prova del seed anche su una regola;
    *   la colonna "Tipo" diventa "Strumento";
    *   "come descritto" diventa "gli altri due falliscono con l'errore Zod sul campo";
    *   `geometry: null`;
    *   la prova del PDF per prodotto entra nella tabella;
    *   per axe, `serious` e `critical`.
*   **Route:**
    *   `Content-Disposition: attachment; filename="riepilogo-<numero>.pdf"`;
    *   `/configura/[prodotto]` con un prodotto inesistente risponde `notFound()`.
*   **Testo:**
    *   P1: unire le voci sui codici e scrivere "zone dei gruppi";
    *   riga 728: "Le decisioni P1-P15 sono state prese il 2026-11-11. Alcune hanno una condizione: …";
    *   riga 505: "fase 6" al posto di "fase di inserimento dei prodotti";
    *   glossario: distinguere il blocco dello schema (fine della fase 4) dal blocco delle funzioni (fase 7);
    *   sezione 23: una riga per ciascuna delle schede 0021-0024;
    *   P15 e appendice B: aggiungere il nome del file del mockup.
*   **Precisazioni:**
    *   P13: "non regge" diventa "la venatura non si riconosce (criterio della sezione 9.1)";
    *   P14: "gestiscono male" diventa "PDFKit incorpora solo l'istanza predefinita di un font variabile e resvg supporta poco gli assi";
    *   9.1: "leggibile" diventa "se M e N, confrontandola con la foto ufficiale, riconoscono essenza e pedana"; le panche dietro il vetro sono "semplificate".

### [Nit] - DECLINE
*   I Nit di stile 30-34 del round 1, già rifiutati.

---

Status: resolved (Stage 9, round 1)

# Goldfish Annotated Review Report: Stage 9, round 1

## Esito della risoluzione (2026-11-11)

L'autore ha risposto "auto accept" e per l'Issue 7 ha scelto l'opzione **B**: la vista frontale mostra l'interno dietro il vetro, come nel mockup di Aladdin.

**Applicate:** 26 PROPOSE FIX più l'Issue 7.
- **Documento:** ora ha 958 righe; la DetailedRange va da 497 a 958.
- **Schede:** 0007 (tutor), 0017 (timeout) e 0021 (interno visibile dal vetro, panche nella geometria).
- **`data/prodotti/aladdin.json`:**
  - `viewer: "image"` finché manca la geometria;
  - `type` in inglese;
  - `photoGroup` aggiunto;
  - nota di `geometry` aggiornata.
- **Scostamento dalla proposta:** per il gres ho usato `ceramic` invece di `stone`, perché il gres porcellanato è una ceramica e non una pietra.
- **Effetto dell'opzione B:** lo schema minimo della geometria (sezione 15.2) comprende anche `benches`.

**Non applicate:**
- CONTEST: 18, 19;
- DECLINE: 30-34.

**Target:** `configuratore-saune-analisi-v6.md` (righe 491-896, DetailedRange)
**Fonte dei finding:** `implementation_readiness_report.md`

**Avviso sulle righe.** I revisori hanno letto il documento prima delle modifiche delle 16:34-16:36: le schede 0021-0024, la tabella 19 e la nota in 20.3. Le righe che indico qui sono quelle **attuali**, cioè quelle dei revisori più 4 da riga 617 in poi. Ho ricontrollato ogni finding sul testo di adesso. Due finding sono già superati e li segno come CONTEST.

Riepilogo: 26 PROPOSE FIX, 2 CONTEST, 1 ESCALATE, 5 DECLINE.

---

## Prioritized Findings & AI Suggestions

### [Issue 1] [`implementation-readiness`, `codebase-details`] - Severity: Blocker
*   **Affected Scope:** [righe 499-501, 536-537, 776-781](configuratore-saune-analisi-v6.md#L499-L781) (15.1, 15.5, P15)
*   **Discrepancy Description:** il porting del mockup, il suo salvataggio in `docs/mockup/`, lo schema Zod della geometria e la `geometry` di Aladdin non hanno né un responsabile né una fase, ma servono già alla prova del PDF della fase 2. `aladdin.json` ha `viewer: "svg"` e `geometry: null`.
*   **Rationale:** la fase 2 non si può eseguire così com'è scritta.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** la prova del PDF della riga 416 usa "Aladdin 60 con Wengé, gres e specchio", che richiede la vista SVG. In più, secondo la 0021 la vista diagonale è "lavoro nuovo, non porting": per la fase 2 basta quindi la frontale.
*   ***Proposed Edit:***
    *   Location: tabella 15.5, riga della fase 2 (riga 536).
    *   Change: dopo "PR del contratto (sezione 15.2)." inserire "Prima della PR, M salva il mockup in `docs/mockup/configuratore-saune.html`. Dopo la PR: N scrive la `geometry` di Aladdin secondo lo schema; M porta nel generatore la vista frontale del mockup come funzione pura (P15). La prova del PDF (N) usa la vista frontale."
    *   Location: riga della fase 3 (riga 537).
    *   Change: aggiungere "M: vista diagonale di Aladdin (scheda 0021). N: `geometry` del secondo prodotto."
    *   Location: 15.2, voce "geometria" (riga 506).
    *   Change: "geometria: schema Zod minimo, cioè involucro (`widthCm`, `depthCm`, `heightCm` presi dal taglio), `front` come elenco di pannelli `{type: 'glass'|'wood'|'door', widthCm}`, `stove {side, offsetCm}`; panche e altre parti si aggiungono con una PR quando serve il secondo prodotto. Regola: `viewer = "svg"` richiede `geometry` non nulla."
    *   Location: `data/prodotti/aladdin.json`.
    *   Change: `"viewer": "image"` finché N non scrive la geometria nella fase 2, così il file passa lo schema già dalla PR del contratto.
    *   Location: riga 499.
    *   Change: "Nella fase di inserimento dei prodotti" → "Dalla fase 2 (Aladdin) e nella fase 6 (altri prodotti)".

### [Issue 2] [`codebase-details`, `style`, `implementation-readiness`] - Severity: Major
*   **Affected Scope:** [righe 702-707](configuratore-saune-analisi-v6.md#L702-L707) (P1), riga 224, `aladdin.json`
*   **Discrepancy Description:** la frase "La bozza di Aladdin segue già questo formato" non è vera, per sette motivi:
    *   `_assetSources` non viene mai citato;
    *   non è deciso se le chiavi `_` passano con strict o con strip;
    *   `schemaVersion` sta al primo livello del file;
    *   `material.type` è in italiano;
    *   il formato delle chiavi di `photos` non è documentato;
    *   `size` è elencato tra i gruppi;
    *   manca la regex dei codici.
*   **Rationale:** chi scrive lo schema Zod deve indovinare sette punti.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** ho verificato sul file. Le righe 2, 26-29, 59-64 e 66-77 di `aladdin.json` confermano tutti i punti. Alla riga 705 `size` compare tra "i codici dei gruppi", ma la riga 259 dice che il taglio non è un gruppo.
*   ***Proposed Edit:***
    *   Location: P1, sostituire le righe 705-706.
    *   Change:
        ```
        - Codici: `^[a-z0-9-]+$` (minuscole, cifre, trattino; niente virgola, usata da P7).
        - Chiavi dell'URL: `size` per il taglio, poi i codici dei gruppi del prodotto (per Aladdin `wood`, `floor`). Zone del generatore: `ext`, `int`, `furn`, `floor`; zone fisse in `fixedZones`: `mirror`, `frame`.
        - `schemaVersion` al primo livello del file è la versione del formato del file; il seed la controlla e non la salva.
        - `material.type`: `wood`, `mirror`, `aluminium`, `stone` (identificatori in inglese, riga 261); la bozza va aggiornata.
        - `photos`: chiave `<taglio>/<valore del gruppo che cambia la foto>`; il gruppo è indicato da `photoGroup` (per Aladdin `wood`).
        - Le chiavi che iniziano con `_` sono note della bozza: lo schema Zod le **toglie** (strip) prima della validazione, quindi il file si usa così com'è sia dal seed sia dall'interfaccia.
        - `_assetSources` elenca da dove scaricare texture e foto: N le scarica una volta nella fase 2, le ottimizza e le mette nel commit in `public/` (sezione 9.4).
        ```
    *   Location: riga 224, `type (legno, alluminio, gres, specchio)`.
    *   Change: `type` (`wood`, `aluminium`, `stone`, `mirror`).
    *   Location: `aladdin.json`.
    *   Change: tradurre i valori di `type` e aggiungere `"photoGroup": "wood"`.

### [Issue 3] [`implementation-readiness`, `codebase-details`] - Severity: Major
*   **Affected Scope:** [righe 495-501](configuratore-saune-analisi-v6.md#L495-L501) (15.1)
*   **Discrepancy Description:** il documento non elenca i file e alcune cartelle non hanno un proprietario.
*   **Rationale:** non si può dire chi crea `next.config.ts`, i file in `src/contratti/` e le prove.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** le cartelle `src/contratti/`, `data/prodotti/`, `src/fonts/`, `docs/` e le cartelle delle prove non compaiono nella tabella della riga 497.
*   ***Proposed Edit:***
    *   Location: dopo la tabella 15.1 (riga 499), nuovo blocco "**File iniziali**".
    *   Change:
        ```
        | Percorso | Contenuto | Chi | Fase |
        |---|---|---|---|
        | `package.json`, `.npmrc`, `.gitattributes` (`* text=auto eol=lf`), `.env.example`, `next.config.ts`, `tsconfig.json` | scaffold | Insieme | 2 |
        | `drizzle.config.ts`, `src/db/schema.ts`, `src/db/client.ts` | schema e connessione | N | 2 |
        | `src/contratti/catalogo.ts`, `configurazione.ts`, `geometria.ts`, `valuta.ts` | contratto | Insieme | 2 |
        | `src/db/catalogo.ts` | `caricaProdotto(code)`: ricompone `prodotto` dal database, stesso tipo del file Zod | N | 3 |
        | `src/lib/viste/` | generatore | M | 2-3 |
        | `src/server/pdf.ts`, `src/server/email.ts`, `src/server/invio.ts` | PDF, email, flusso | N | 2-4 |
        | `scripts/seed.ts`, `check.ts`, `pulizia.ts`, `avvio-demo.ts` | script (sezione 15.3) | N | 3-5 |
        | `src/fonts/` | TTF (P14) | M | 2 |
        | `test/unit/`, `test/e2e/` | prove (sezione 18) | chi scrive il codice provato | dalla 2 |
        | `docs/` | documentazione | Entrambi | dalla 2 |
        ```

### [Issue 4] [`implementation-readiness`, `codebase-details`] - Severity: Major
*   **Affected Scope:** [righe 515-520](configuratore-saune-analisi-v6.md#L515-L520) (15.3), 554 (criterio 1), 568
*   **Discrepancy Description:** gli script npm non sono definiti. Il criterio "senza passaggi manuali" non si può rispettare, perché da un clone pulito serve prima `npm ci`.
*   **Rationale:** non si sa che cosa fanno `db:reset`, le migrazioni, la pulizia e la cancellazione per email.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** il problema è confermato. Il criterio 1 della riga 554 non cita l'installazione.
*   ***Proposed Edit:***
    *   Location: nuovo paragrafo in 15.3, dopo la riga 520.
    *   Change:
        ```
        | Script | Cosa fa |
        |---|---|
        | `db:migrate` | `drizzle-kit migrate` |
        | `db:seed` | `tsx scripts/seed.ts` (sezione 8.2) |
        | `db:reset` | `docker compose down -v`, `up -d --wait`, `db:migrate`, `db:seed` |
        | `check` | `tsx scripts/check.ts` (sezione 10.5); "migrazioni applicate" confronta `drizzle.__drizzle_migrations` con `drizzle/meta/_journal.json` |
        | `clean` | `tsx scripts/pulizia.ts` cancella le righe scadute; `tsx scripts/pulizia.ts --email <indirizzo>` cancella quelle di un indirizzo |
        | `test` / `test:e2e` | `vitest run` / `playwright test` |
        | `demo` | `tsx scripts/avvio-demo.ts`, i passi della sezione 7 |
        ```
    *   Location: criterio 1 (riga 554).
    *   Change: "`npm run demo`" → "`npm ci` e `npm run demo`"; "senza passaggi manuali" → "senza altri passaggi manuali".

### [Issue 5] [`implementation-readiness`, `codebase-details`] - Severity: Major
*   **Affected Scope:** [righe 511, 525](configuratore-saune-analisi-v6.md#L511-L525), 752, 469
*   **Discrepancy Description:**
    *   la "lista fissa delle dipendenze" manca;
    *   il driver del database non è scelto;
    *   resvg non compare in `serverExternalPackages`.
*   **Rationale:** la scelta delle dipendenze resta all'implementatore.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** sulla riga 525 non c'è una vera contraddizione. La regola "una persona alla volta aggiunge dipendenze" vale per quelle aggiunte dopo la lista iniziale, ma va detto. `@resvg/resvg-js` è un modulo nativo: non metterlo in `serverExternalPackages` è un rischio noto di errore di build.
*   ***Proposed Edit:***
    *   Location: riga 511.
    *   Change: "la lista fissa delle dipendenze: `next`, `react`, `drizzle-orm`, `postgres` (driver `postgres.js`), `zod`, `nodemailer`, `pdfkit`, `@resvg/resvg-js`, Tailwind e i componenti shadcn/ui; in sviluppo `drizzle-kit`, `tsx`, `typescript`, `@types/nodemailer`, `@types/pdfkit`, `vitest`, `@playwright/test`, `@axe-core/playwright`. Mailpit è un eseguibile a parte, scaricato da GitHub (sezione 10.5). In `next.config.ts`: `serverExternalPackages: ['pdfkit', '@resvg/resvg-js']`."
    *   Location: riga 525.
    *   Change: "Dopo la lista iniziale, una persona alla volta aggiunge dipendenze…".

### [Issue 6] [`implementation-readiness`, `codebase-details`, `style`] - Severity: Major
*   **Affected Scope:** [righe 590-596](configuratore-saune-analisi-v6.md#L590-L596) (18), 566 (criterio 5)
*   **Discrepancy Description:**
    *   la sezione 18 non elenca casi di prova concreti;
    *   il criterio 5 parla di "messaggio chiaro" senza dire quale;
    *   non è indicato come Playwright usa Mailpit.
*   **Rationale:** i casi limite citati nel documento non hanno una prova.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** i casi da provare sono quelli delle righe 351, 358, 403 e 449, e la regola P3 della riga 727.
*   ***Proposed Edit:***
    *   Location: sostituire il primo punto della sezione 18 (riga 592).
    *   Change:
        ```
        | Caso | Tipo | Esito atteso |
        |---|---|---|
        | `valuta` su un catalogo di prova con una regola per tipo | Vitest | scelte disattivate e configurazione rifiutata come da P2 |
        | `valuta` con taglio, gruppo o valore inesistente, `single` vuoto | Vitest | errore strutturale |
        | Schema Zod: `aladdin.json` passa; un file con codice non valido o `viewer: svg` senza `geometry` fallisce | Vitest | — |
        | Seed: aggiunge, modifica e toglie un valore; le configurazioni restano | Vitest + database | — |
        | Stesso `request_id` inviato due volte | Vitest + database | una riga |
        | Due "Riprova" in parallelo; terzo tentativo | Vitest + database | un invio; il terzo è rifiutato |
        | Riga retrodatata | Vitest + database | cancellata da `clean` |
        | Snapshot con un codice rimosso | Vitest | PDF con il solo elenco |
        | Mappa degli errori di Nodemailer (`EAUTH`, `ECONNECTION`, `ETIMEDOUT`, `EENVELOPE`) verso i messaggi di RF6 | Vitest | — |
        | URL con valore sconosciuto o combinazione non valida | Playwright | valore predefinito e avviso; invio rifiutato |
        | Flusso completo da tastiera, con controllo axe | Playwright + Mailpit | email con allegato letta da `GET /api/v1/messages` |
        ```
        Playwright avvia Mailpit e `next start` con `webServer` in `playwright.config.ts`. Una volta per ogni computer serve `npx playwright install chromium`.
    *   Location: criterio 5 (riga 566).
    *   Change: "messaggio chiaro" → "il messaggio di RF6 per quella causa"; "Con la password SMTP sbagliata" → "Con `SMTP_PASSWORD` sbagliata in `.env`".

### [Issue 7] [`implementation-readiness`] - Severity: Major
*   **Affected Scope:** [righe 280-284](configuratore-saune-analisi-v6.md#L280-L284) (9.1); `aladdin.json` `zones`; scheda 0021
*   **Discrepancy Description:** con due viste esterne, le zone `int`, `furn` e `floor` non si vedono. Scegliere il gres non cambia l'immagine.
*   **Rationale:** la grafica non mostra la scelta fatta.
*   ***AI Suggestion:*** ESCALATE
*   ***Justification:*** il finding è valido. La soluzione però è una scelta di design che spetta a te e a Marko. Non si ricava dai file. Le opzioni sono tre:
    *   **(a) pannello dei campioni:** le scelte non visibili compaiono come campioni accanto alle viste e nel PDF. Riusa il pannello del livello B ed è l'opzione che costa meno;
    *   **(b) interno attraverso il vetro:** la vista frontale mostra l'interno e la pedana dietro il vetro del fronte. È più fedele, ma richiede geometria interna;
    *   **(c) solo nell'elenco:** si dichiara che queste scelte compaiono solo nell'elenco.

    Il mio consiglio è (a), perché il pannello esiste già per il livello B.
*   ***Proposed Edit:*** (se scegli a)
    *   Location: 9.1, dopo la riga 284.
    *   Change: "Le scelte che le viste esterne non mostrano (essenza interna, arredi, pedana) compaiono in un pannello di campioni accanto alle viste e nel PDF, come per il livello B."
    *   Location: 0021, Conseguenze.
    *   Change: stessa frase.

### [Issue 8] [`implementation-readiness`, `codebase-details`] - Severity: Major
*   **Affected Scope:** [righe 749-752](configuratore-saune-analisi-v6.md#L749-L752) (P8), 331, 747
*   **Discrepancy Description:**
    *   le firme della Server Action e del Route Handler non sono indicate;
    *   non è detto cosa succede con un token sconosciuto;
    *   l'export `runtime = 'nodejs'` messo in un file `'use server'` rompe la build.
*   **Rationale:** l'implementatore deve decidere le interfacce da solo.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** in un file `'use server'` si possono esportare solo funzioni async. `nodejs` è già il runtime predefinito.
*   ***Proposed Edit:***
    *   Location: sostituire la riga 752.
    *   Change:
        ```
        - Firme:
          - `inviaRiepilogo(stato, formData) → { ok: true, token } | { ok: false, errori: Record<campo, messaggio> }`; con `ok` la pagina reindirizza a `/riepilogo/<token>`;
          - `riprova(token) → { ok, stato, tentativiRimasti }`;
          - `GET /riepilogo/[token]/pdf` → 200 con il PDF, 404 se il token non esiste o la riga è scaduta;
          - `/riepilogo/[token]` con token sconosciuto o scaduto → pagina 404 (`notFound()`).
        - `valuta` restituisce `{ valida: boolean, errori: { group?, code, messaggio }[], disattivati: Record<group, string[]> }`.
        - Runtime: `nodejs` è il predefinito; PDFKit e resvg non girano nel runtime Edge, quindi nessun file dichiara `runtime = 'edge'`. Se serve dichiararlo, si mette in `page.tsx` e `route.ts`, mai nei file `'use server'`.
        ```

### [Issue 9] [`implementation-readiness`, `codebase-details`, `style`] - Severity: Major
*   **Affected Scope:** [riga 745](configuratore-saune-analisi-v6.md#L745) (`/galleria`), 594, 791, 208
*   **Discrepancy Description:**
    *   le variabili d'ambiente non hanno un nome;
    *   `/galleria` è spenta proprio nella demo;
    *   non è detto come si passa da Mailpit a Gmail.
*   **Rationale:** `.env.example` non si può scrivere.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** `next start` imposta `NODE_ENV=production`, mentre la riga 594 usa la galleria come riserva nella demo.
*   ***Proposed Edit:***
    *   Location: sezione 7, dopo la riga 208.
    *   Change:
        ```
        `.env.example`:
        - `DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5433/configuratore`
        - `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`: in sviluppo `127.0.0.1`, `1025`, `false`, vuoti (Mailpit); per la demo `smtp.gmail.com`, `465`, `true`, l'account e la password per le app
        - `MAIL_FROM`, `PROJECT_EMAIL` (email del progetto, sezione 20.5)
        - `ENABLE_GALLERY=true` per la demo
        ```
    *   Location: riga 745.
    *   Change: "con una variabile dedicata" → "con `ENABLE_GALLERY=true`, impostata nella demo".
    *   Location: riga 791.
    *   Change: "usa una variabile" → "usa `PROJECT_EMAIL`".

### [Issue 10] [`implementation-readiness`] - Severity: Major
*   **Affected Scope:** [righe 533-544](configuratore-saune-analisi-v6.md#L533-L544) (15.5)
*   **Discrepancy Description:**
    *   lo scaffold non è previsto in nessuna fase;
    *   il passaggio dell'interfaccia dal file al database non ha un responsabile;
    *   il modulo dello scheletro non ha un responsabile;
    *   le fasi 5, 9 e 10 non hanno un responsabile;
    *   lo spostamento delle schede in `docs/` non è previsto.
*   **Rationale:** sono compiti senza proprietario.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** confermato sulla tabella.
*   ***Proposed Edit:***
    *   Fase 2: aggiungere all'inizio "Insieme: creazione del repository, scaffold Next.js e file iniziali (sezione 15.1), spostamento di analisi e schede in `docs/`".
    *   Fase 3: aggiungere "M: il configuratore riceve il prodotto dal server (sezione 8.2); modulo email minimo dello scheletro".
    *   Fase 5: aggiungere "N: pulizia e cancellazione; M: verifica axe; entrambi: flusso sui due portatili".
    *   Fase 9: aggiungere "Entrambi".
    *   Fase 10: aggiungere "N: database e invio di prova; M: documentazione finale e registrazione".

### [Issue 11] [`codebase-details`] - Severity: Major
*   **Affected Scope:** [righe 244-259](configuratore-saune-analisi-v6.md#L244-L259) (esempio di `config`), 763
*   **Discrepancy Description:** nello snapshot manca il nome del prodotto. Oggetto e intestazione non si possono comporre se il prodotto viene tolto dal catalogo.
*   **Rationale:** la riga 403 promette un PDF con il solo elenco anche in quel caso.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** confermato: l'esempio ha soltanto `"product": "aladdin"`.
*   ***Proposed Edit:***
    *   Location: riga 249.
    *   Change: `"product": "aladdin", "productName": "Aladdin", "size": "60",`
    *   Location: riga 259.
    *   Change: aggiungere "`productName` serve all'oggetto dell'email e all'intestazione del PDF anche se il prodotto esce dal catalogo."

### [Issue 12] [`codebase-details`] - Severity: Major
*   **Affected Scope:** [righe 768-772](configuratore-saune-analisi-v6.md#L768-L772) (P13)
*   **Discrepancy Description:** per la foto che si adatta alla zona non sono scelti `preserveAspectRatio` e il riquadro per le zone fatte di più forme.
*   **Rationale:** sono scelte grafiche lasciate all'implementatore.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** con `none` la venatura si deforma, con `slice` la foto si ritaglia. Per un legno è meglio il ritaglio.
*   ***Proposed Edit:***
    *   Location: dopo la riga 769.
    *   Change: "Dentro il pattern, `<image width="1" height="1" preserveAspectRatio="xMidYMid slice">`: la foto si ritaglia e non si deforma. Ogni forma della zona ha il proprio riquadro, quindi su un fronte a pannelli la foto si ripete per pannello, come i pannelli veri."

### [Issue 13] [`codebase-details`, `implementation-readiness`] - Severity: Major
*   **Affected Scope:** [riga 774](configuratore-saune-analisi-v6.md#L774) (P14)
*   **Discrepancy Description:** i file e i pesi dei font non sono indicati. Con un font variabile, PDFKit e resvg non funzionano bene.
*   **Rationale:** P14 non si può applicare così com'è.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** sia fontkit sia resvg gestiscono male gli assi variabili.
*   ***Proposed Edit:***
    *   Location: P14, dopo "(`src/fonts/`)".
    *   Change: "come file **statici**, non variabili: `Jost-Regular.ttf`, `Jost-Medium.ttf`, `IBMPlexSans-Regular.ttf`, `IBMPlexSans-SemiBold.ttf`. Sul server il percorso è `path.join(process.cwd(), 'src/fonts', nome)`."

### [Issue 14] [`style`] - Severity: Major
*   **Affected Scope:** [riga 680](configuratore-saune-analisi-v6.md#L680) (20.3)
*   **Discrepancy Description:** le decisioni P1-P15 sono dette "definitive", ma P3 e P13 dipendono da prove o da fonti, e 0015, 0016 e 0021 sono ancora "da verificare".
*   **Rationale:** la parola contraddice gli stati delle schede.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** confermato. Dopo le schede 0021-0024 la parola "definitive" è ancora meno vera.
*   ***Proposed Edit:***
    *   Location: riga 680.
    *   Change: "sono **definitive**. Fanno eccezione i testi che riguardano la privacy" → "sono **prese**; alcune hanno una condizione scritta accanto: P3 (fonte per optional e regole), P13 (prova della fase 2), P12 (diagonale pronta in tempo, scheda 0021) e i testi che riguardano la privacy".

### [Issue 15] [`style`] - Severity: Major
*   **Affected Scope:** [riga 546](configuratore-saune-analisi-v6.md#L546), 284, 804, 837
*   **Discrepancy Description:** non è chiaro a cosa va il tempo che avanza. La riga 546 dice rifinitura grafica, le righe 284 e 804 dicono pianta.
*   **Rationale:** le due indicazioni si contraddicono.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** confermato.
*   ***Proposed Edit:***
    *   Location: riga 546.
    *   Change: "Il tempo che avanza va, in quest'ordine, a rifinire le viste SVG e poi alla pianta (sezione 9.1), non a funzioni nuove."

### [Issue 16] [`style`] - Severity: Major
*   **Affected Scope:** [riga 557](configuratore-saune-analisi-v6.md#L557) (criterio 2), 297
*   **Discrepancy Description:** il criterio 2 dice "possibilmente con un interno diverso", che non si può verificare.
*   **Rationale:** un criterio di successo deve avere un esito sì o no.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** con le viste solo esterne (0021) l'interno conta meno: il criterio dovrebbe parlare del fronte.
*   ***Proposed Edit:***
    *   Location: riga 557.
    *   Change: "un secondo prodotto SVG con un fronte diverso da Aladdin; se la prova del generatore fallisce, un secondo taglio della stessa famiglia vale come ripiego, e va scritto nella consegna."
    *   Location: riga 297.
    *   Change: "possibilmente con un interno diverso" → "con un fronte diverso".

### [Issue 17] [`style`] - Severity: Major
*   **Affected Scope:** [riga 674](configuratore-saune-analisi-v6.md#L674); scheda 0007
*   **Discrepancy Description:** alla riga 674 c'è "Tutor e tutor"; la scheda 0007 dice ancora "valutatore".
*   **Rationale:** sono residui di una sostituzione di parole.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** confermato. Il testo giusto è alla riga 858 ("Tutor e valutatore").
*   ***Proposed Edit:***
    *   Location: riga 674.
    *   Change: "Tutor e tutor" → "Tutor e valutatore".
    *   Location: 0007.
    *   Change: "valutatore" → "tutor".

### [Issue 18] [`implementation-readiness`, `style`, `codebase-details`] - Severity: Major
*   **Affected Scope:** [riga 732](configuratore-saune-analisi-v6.md#L732) (P4); scheda 0017, riga 16
*   **Discrepancy Description:** nella tabella e nel dettaglio di P4 il `request_id` era descritto come "generato dal client".
*   **Rationale:** era una contraddizione con le sezioni 8.1 e 10.2.
*   ***AI Suggestion:*** CONTEST
*   ***Justification:*** è già risolto. Le righe 687 e 732 dicono "generato dal server". La scheda 0024 sostituisce la 0017 su questo punto, e l'intestazione della 0017 lo dichiara. Il corpo della 0017 resta come scelta superata, cosa che il README ammette.
    *   **Resta aperto un punto:** quando il server rigenera l'identificativo. La 0024, alle righe 26-27, risponde: "ogni volta che il modulo viene mostrato". Non serve un'altra modifica.
*   ***Proposed Edit:*** nessuna.

### [Issue 19] [`style`] - Severity: Nit
*   **Affected Scope:** tabella delle schede (righe 619-644)
*   **Discrepancy Description:** gli stati delle schede 0007, 0015 e 0016 sarebbero diversi da quelli del README.
*   ***AI Suggestion:*** CONTEST
*   ***Justification:*** gli stati coincidono con il README, che ho riletto alle righe 13, 21 e 22. Lo conferma anche codebase-details.
*   ***Proposed Edit:*** nessuna.

### [Issue 20] [tutti] - Severity: Nit
*   **Affected Scope:** [riga 896](configuratore-saune-analisi-v6.md#L896)
*   **Discrepancy Description:** la riga di tabella "| Nuove sezioni | — | …" è rimasta in fondo all'appendice B.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:*** spostarla in fondo alla tabella della sezione 23, dopo la riga 860, e toglierla dalla riga 896.

### [Issue 21] [`implementation-readiness`, `style`] - Severity: Nit
*   **Affected Scope:** [riga 580](configuratore-saune-analisi-v6.md#L580)
*   **Discrepancy Description:** la riga 580 dice "Timeout di 10 s", ma la scadenza complessiva è di 15 s.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:*** "Timeout di 10 s" → "Scadenza di 15 s per invio (sezione 10.2)". Nella 0017 la riga 11 diventa "circa 10 secondi per ciascuno dei tre timeout di Nodemailer, più una scadenza complessiva di 15 secondi".

### [Issue 22] [errore mio, fuori range] - Severity: Nit
*   **Affected Scope:** [riga 377](configuratore-saune-analisi-v6.md#L377), 203
*   **Discrepancy Description:** la riga 377 parla di "le prime tre ... le ultime tre", ma le voci sono cinque. La voce sulle texture non è classificata.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:***
    *   Location: riga 377.
    *   Change: "Le prime due voci (database e migrazioni, prodotti caricati) sono bloccanti; le altre tre (Gmail, conversione di prova, texture) sono avvisi (sezione 7)."
    *   Location: riga 203.
    *   Change: "Gmail e la conversione di prova sono **avvisi**" → "Gmail, la conversione di prova e la presenza delle texture sono **avvisi**".

### [Issue 23] [`implementation-readiness`, `codebase-details`, `style`] - Severity: Nit
*   **Affected Scope:** [riga 734](configuratore-saune-analisi-v6.md#L734) (P5)
*   **Discrepancy Description:** non è indicato il fuso orario dell'anno. Non è detto che `NNNNNN` non riparte da capo ogni anno.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:*** in fondo a P5 aggiungere "L'anno è quello di `created_at` nel fuso `Europe/Rome`. `NNNNNN` non riparte da 1 ogni anno: dopo `2026-000042` può venire `2027-000043`."

### [Issue 24] [`implementation-readiness`, `codebase-details`] - Severity: Nit
*   **Affected Scope:** [righe 719, 747](configuratore-saune-analisi-v6.md#L719-L747) (P2, P7)
*   **Discrepancy Description:** per i gruppi `multi` non è definito cosa succede con una chiave assente né quale sia il valore predefinito. Non è detto cosa succede se il valore predefinito è disattivato. Non è detto se "Nessuna pedana" va nelle `lines`.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:*** dopo la riga 719 aggiungere:
    > Per un gruppo `multi`, la chiave assente nell'URL vuol dire nessun valore, e `default_value` è un elenco, anche vuoto. Il valore predefinito di un gruppo `single` non può essere disattivato da una regola: il seed lo rifiuta. Un valore senza materiale, come "Nessuna pedana", compare comunque nelle `lines`.

### [Issue 25] [`implementation-readiness`] - Severity: Nit
*   **Affected Scope:** [righe 542-543](configuratore-saune-analisi-v6.md#L542-L543) (fasi 8 e 9), 552
*   **Discrepancy Description:** il criterio 1 si verifica nella fase 8 "sul computer della demo", ma la fase 8 usa il portatile dell'altro sviluppatore.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:*** riga 552: "verificati nelle prove finali (fase 8); il criterio 1 si ripete sul computer della demo nella prova generale (fase 9)."

### [Issue 26] [`implementation-readiness`] - Severity: Nit
*   **Affected Scope:** [riga 563](configuratore-saune-analisi-v6.md#L563) (criterio 4)
*   **Discrepancy Description:** `drizzle-kit studio` apre `local.drizzle.studio`, un sito esterno, anche se i dati restano in locale.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:*** "mostrata con `drizzle-kit studio`" → "mostrata con `psql` dentro il container (`docker compose exec db psql …`)". Lo studio richiede un sito esterno e la scheda 0008 riguarda il browser del cliente, ma è meglio non dipendere dalla rete durante la demo.

### [Issue 27] [`codebase-details`] - Severity: Nit
*   **Affected Scope:** [riga 607](configuratore-saune-analisi-v6.md#L607)
*   **Discrepancy Description:** spostando il file in `docs/analisi.md`, i link relativi si rompono.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:*** riga 607: "Questo documento; allo spostamento i link `docs-iniziali/docs/decisioni/…` diventano `decisioni/…` e `data/…` diventa `../data/…`".

### [Issue 28] [`implementation-readiness`] - Severity: Nit
*   **Affected Scope:** [riga 567](configuratore-saune-analisi-v6.md#L567) (criterio 6)
*   **Discrepancy Description:** il controllo axe esclude `/informativa`, che invece la sezione 14 include.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:*** "su catalogo, configuratore e conferma" → "su catalogo, configuratore, conferma e informativa".

### [Issue 29] [`implementation-readiness`] - Severity: Nit
*   **Affected Scope:** criterio 2 (righe 555-558)
*   **Discrepancy Description:** il taglio 45 di Aladdin non vale come secondo prodotto.
*   ***AI Suggestion:*** PROPOSE FIX, assorbito dall'Issue 16: il ripiego "secondo taglio" viene dichiarato come ripiego e non come prodotto.

### Issue 30-34 [`style`] - Severity: Nit
*   **Problema:**
    *   riga 586: "messaggio onesto";
    *   riga 703: "errori chiari";
    *   riga 816: aforisma "Un ripiego che funziona convince più di una slide";
    *   riga 596;
    *   righe 768 e 772: "due strade / terza";
    *   riga 689 (P6);
    *   riga 849: "Motivi veri";
    *   riga 891: "più curata".
*   ***AI Suggestion:*** DECLINE. Sono questioni di stile che non bloccano l'implementazione. Le correggo se vuoi; correggerle costa poco.

---

## Riepilogo

| Categoria | Issue |
|---|---|
| PROPOSE FIX | 1-6, 8-17, 20-29 |
| ESCALATE | 7 (zone interne non visibili: scelta a, b oppure c) |
| CONTEST | 18 (già risolto con la 0024), 19 (gli stati coincidono) |
| DECLINE | 30-34 (Nit di stile) |

Le correzioni toccano anche questi file:
- `data/prodotti/aladdin.json`: Issue 1 e 2;
- schede 0007, 0017 e 0021: Issue 7, 17 e 21.

---

Status: resolved (round 2)

# Goldfish Annotated Review Report: Stage 7, round 2

## Esito della risoluzione (2026-11-11)

Su indicazione dell'autore ho applicato **tutte le correzioni proposte (auto accept)**. Per le due escalation:
- **R8:** i titolari sono i due sviluppatori, come contitolari. Ho separato le due finalità: 6(1)(b) per l'invio, 6(1)(f) per la conservazione. Ho tenuto i 12 mesi, con il motivo scritto. La domanda 1 per il tutor ora comprende la contitolarità.
- **R7:** il rischio è accettato (10.5 e prima riga di 20.1). Non ci sarà un secondo account SMTP.

Ho aggiunto le note datate 2026-11-11 alle schede 0001, 0006, 0010, 0012, 0014, 0016, 0017, 0018, 0019 e 0020.

Dopo le modifiche: FeatureRange 1..490, DetailedRange 491..892.

**Limite del ri-audit:** lo Stage 7 non ammette altri giri di revisori. I Nit con DECLINE e lo style M2 restano come trade-off accettati.

**Target:** `configuratore-saune-analisi-v6.md` (FeatureRange 1..462) più le schede del registro collegate
**Fonte:** `critic_report.md`, sezione "round 2" (id `R<n>`)

## Riepilogo

| Categoria | Findings |
|---|---|
| ESCALATE | R8 (privacy: titolare e durata), R7 (serve un secondo account SMTP) |
| PROPOSE FIX | R1, R2, R3, R4, R5, R6, R9, R10, R11, R12, R13, R14, R15; Nit n1, n2, n3, n4, n5, n6, n7, n8, n9 |
| DECLINE | Altri Nit (struttura: H2 per Problema e Non-obiettivi, pseudo-titoli, DBMS e ORM nella stessa sezione, link nella colonna "Scheda"; `material.type` in italiano; driver PostgreSQL; registro colloquiale; definizioni da manuale); style M2 (già chiuso come C29) |
| CONTEST | nessuno |

Ho verificato le affermazioni tecniche dei revisori, e sono corrette:
- `socketTimeout` di Nodemailer è un timeout di inattività, quindi non limita la durata totale di un invio;
- `UPDATE … WHERE customer_status <> 'sent'` lascia passare due "Riprova" contemporanei;
- la scheda 0019 scarta "solo Route Handler" perché il modulo richiederebbe JavaScript, il che presuppone che il modulo funzioni senza JavaScript, ma il `request_id` nasce nel client.

---

## ESCALATE

### [R8] [`egm-design`] - Major: base giuridica, durata e titolare
*   **Scope:** sezione 12, righe 400-405, e domanda 1 in 20.4.
*   **Problema:** l'art. 6(1)(b) copre l'invio del riepilogo, non la conservazione "per la dimostrazione". I 12 mesi non sono motivati. Non è indicato chi è il titolare: Nicolas, Marko o entrambi.
*   ***Justification:*** sono scelte legali tue e del tutor; non le posso decidere io.
*   ***Proposta, se mi rispondi:***
    *   **Titolare:** dimmi chi.
    *   **Finalità:** le separo in "(a) invio del riepilogo richiesto: art. 6(1)(b)" e "(b) conservazione per dimostrare e verificare il funzionamento: legittimo interesse, art. 6(1)(f), da confermare".
    *   **Durata:** o tieni i 12 mesi, con il motivo "copre il tirocinio e l'eventuale verifica successiva", oppure la riduci alla fine del tirocinio più un margine, per esempio 3 mesi.
    *   **Domanda 1 per il tutor:** la estendo a "base giuridica delle due finalità e durata della conservazione".

### [R7] [`egm-design`] - Major: un solo account SMTP
*   **Scope:** 10.5 e la prima riga della tabella 20.1.
*   **Problema:** se Google blocca l'account del progetto, l'invio reale non si può fare. "Scarica il PDF" non sostituisce un invio.
*   ***Justification:*** la correzione richiede un secondo account, un altro Gmail o un altro fornitore, che solo tu puoi creare.
*   ***Proposta:***
    *   in 10.5 aggiungo: "**Secondo trasporto.** Il `.env` contiene un secondo account SMTP (un altro Gmail o un altro fornitore), provato nella fase 1. Se il primo account viene bloccato, si passa al secondo cambiando solo la configurazione.";
    *   aggiungo "secondo account SMTP" alla mitigazione della prima riga di 20.1;
    *   nella fase 1 aggiungo "prova anche del secondo account".

    Se non vuoi un secondo account, scrivo invece il rischio come accettato.

---

## PROPOSE FIX: Major

**[R1] Avvio della demo** (design M1, N3; structural M5; style M8). Riga 186 sostituita da un elenco unico:
```
- **Per la demo:** `npm run demo` esegue, in quest'ordine:
  1. `docker compose up -d --wait`, migrazioni e seed;
  2. cancellazione delle righe scadute;
  3. le righe rimaste `pending` da più di 2 minuti diventano `failed` (sezione 10.3);
  4. `next build`;
  5. controllo preliminare (sezione 10.5). Database, migrazioni e prodotti caricati sono **bloccanti**: un FAIL ferma l'avvio. Gmail e la conversione di prova sono **avvisi**: il FAIL si stampa ma l'avvio continua, così in caso di guasto resta il ripiego "Scarica il PDF";
  6. se il controllo di Gmail è OK, un nuovo tentativo per ogni notifica `failed` che ha ancora tentativi disponibili;
  7. `next start -H 127.0.0.1`.
```
*   In 10.5 aggiungo dopo l'elenco del controllo: "Le prime tre voci sono bloccanti, le ultime tre sono avvisi (sezione 7). «Numero di prodotti caricati» dà FAIL se è diverso dal numero di file in `data/prodotti/`."
*   In 10.3 le frasi "All'avvio, `npm run demo` segna…" e "…rimanda una volta le notifiche…" diventano rimandi alla sezione 7.

**[R2] "Riprova" atomico** (design M2; style N5). Al posto del primo punto aggiunto in 10.3:
```
- "Riprova" prende la riga con una sola istruzione: `UPDATE … SET customer_status = 'pending', customer_attempts = customer_attempts + 1, customer_last_attempt_at = now() WHERE token = $1 AND customer_attempts < 3 AND customer_last_attempt_at < now() - interval '30 seconds' AND (customer_status = 'failed' OR (customer_status = 'pending' AND customer_last_attempt_at < now() - interval '2 minutes')) RETURNING id`. Si invia solo se l'istruzione restituisce una riga: due clic contemporanei non producono due invii e una riga già inviata non si rimanda. Il primo invio è il primo tentativo, quindi "Riprova" si usa al massimo due volte; quando i tentativi sono finiti il pulsante non compare e resta "Scarica il PDF".
- Una riga `pending` da più di 2 minuti (processo interrotto) la pagina di conferma la mostra come fallita e offre "Riprova"; all'avvio `npm run demo` la segna `failed`.
```
*   In 8.1, al punto "per ciascuno dei due invii": aggiungo i nomi (`customer_error`, `customer_attempts`, `customer_last_attempt_at` e i corrispondenti `project_…`).

**[R3] Scadenza dell'invio** (design M3; style M1).
*   Punto 5 della 10.2: dopo i timeout aggiungo "In più ogni invio ha una scadenza complessiva di 15 secondi (`AbortSignal` o `Promise.race`), perché `socketTimeout` misura solo l'inattività e non limita la durata totale."
*   Punto 6: "nel caso peggiore la risposta arriva dopo circa 20 secondi" → "nel caso peggiore la risposta arriva dopo circa 30 secondi più la generazione del PDF (due invii da 15 secondi), entro il limite di RNF4".
*   Nota datata nella 0017 (vedi R10).

**[R4] Validazione strutturale** (design M4). Riga 312: `valuta(config, regole) → {valida, errori, disattivati}` → `valuta(config, prodotto) → {valida, errori, disattivati}`, dove `prodotto` contiene tagli, gruppi, valori e regole. Aggiungo: "Prima delle regole `valuta` controlla la struttura: il taglio esiste, ogni gruppo appartiene al prodotto, ogni valore appartiene al suo gruppo, ogni gruppo `single` ha un valore." Aggiorno la stessa firma in 15.2 (riga 480), P2 (riga 688) e scheda 0020 (nota datata).

**[R5] Semantica del seed** (design M5; structural M2; style M7). In 8.2 riscrivo i punti 2 e 3:
```
- il seed di Nicolas valida tutti i file con Zod **prima** di scrivere: un file sbagliato fa fallire il seed e il database non cambia;
- poi **sincronizza** le tabelle del catalogo in una sola transazione: inserisce, aggiorna e cancella, così il database coincide con i file. Le chiavi esterne del catalogo sono `RESTRICT`: si cancellano prima le regole, poi i valori, i gruppi, i tagli e i prodotti; un materiale si cancella solo se nessun file lo dichiara più. Se un passo fallisce, la transazione si annulla. La tabella `configuration` non si tocca e non ha chiavi esterne verso il catalogo (sezione 8.1), quindi le configurazioni salvate non si perdono.
```
*   Riga 246: "a runtime l'applicazione legge **solo dal database**" → "dalla fase 3 l'applicazione legge **solo dal database**" (Nit style N6).

**[R6] Ripiego del PDF più ampio** (design M6). Sezione 11, "Motivi": "Se il prodotto non c'è più o la sua geometria non è valida, il PDF esce con il solo elenco delle scelte." → "Se le scelte salvate non si risolvono più nel catalogo attuale (prodotto, taglio, valore o materiale rimosso o cambiato, geometria non valida), il PDF esce con il solo elenco delle scelte. Una prova automatica lo verifica con uno snapshot che cita un codice rimosso." Aggiorno anche la riga corrispondente in 20.1.

**[R9] Cancellazione in tutti i database** (design M9). Sezione 12, cancellazione su richiesta: aggiungo "Lo script si esegue su ogni database in cui l'indirizzo può trovarsi: i database dei due portatili e quello del computer della demo, se è un terzo computer."

**[R10] Schede del registro** (tutti e tre). Come prevede il README ("le precisazioni che non cambiano la scelta si fanno nella scheda stessa, con una nota datata"), aggiungo in fondo alle schede una sezione `## Nota del 2026-11-11`:
*   **0001:** SQLite ha JSON/JSONB; le differenze reali sono l'assenza di indici GIN e le chiavi esterne da attivare con `PRAGMA`. I motivi principali restano l'indicazione del tutor e lo stesso motore online.
*   **0006:** gli stati si chiamano `customer_status` e `project_status`, con valori `pending`, `sent`, `failed`.
*   **0010, 0016:** le viste sono **frontale** e **diagonale**, entrambe esterne; le viste dall'interno sono scartate. Nel PDF va la diagonale in grande e la frontale più piccola (P12).
*   **0012:** le regole richiedono poco lavoro in più. Il passaggio online può richiedere anche opzioni del driver; non è stato provato.
*   **0014:** la sequenza di `npm run demo` è quella della sezione 7 dell'analisi: il controllo preliminare viene prima di `next start`, con voci bloccanti e voci di avviso.
*   **0017:**
    *   nomi degli stati inglesi;
    *   scadenza complessiva di 15 secondi per invio;
    *   la notifica si attende;
    *   "Riprova" con istruzione atomica e al massimo 3 tentativi;
    *   ascolto solo su `127.0.0.1`.
*   **0018:** il seed sincronizza in transazione (con cancellazione) invece di fare solo upsert. Le configurazioni restano intatte perché non hanno chiavi esterne verso il catalogo.

    Questo cambia il modo di fare il seed, non la scelta "file come fonte, database derivato", quindi basta una nota e non serve una scheda nuova.
*   **0019:** il `request_id` si genera sul server, in un campo nascosto del modulo (vedi n4).
*   **0020:** la firma è `valuta(config, prodotto)`, con il controllo strutturale.

**[R11] Alternative scartate nel documento** (structural M1). Dopo la tabella della sezione 2 aggiungo:
```
**Alternative scartate, in sintesi** (motivi nelle schede):
- Database, ORM ed esecuzione: MySQL, SQLite, MongoDB, SQL puro, Prisma, applicazione in Docker, Supabase (sezioni 6 e 7).
- Applicazione: Vite con un backend separato; solo Route Handler (API REST); stato nei segmenti del percorso (0019).
- Catalogo: solo nel database con un'interfaccia di amministrazione; solo nei file, senza database; file TypeScript o YAML (0018).
- Regole: nascondere le scelte incompatibili; lasciarle selezionabili con un errore; vincoli solo nel database (0020).
- Email: servizi transazionali (Resend, SendGrid, Mailgun); notifica in copia nascosta (0017).
- PDF: `@react-pdf/renderer`, jsPDF, Playwright o Puppeteer, conversione dell'immagine nel browser (0015, sezione 11).
```

**[R12] Ascolto solo su `127.0.0.1` anche in sviluppo** (style M9; design N6).
*   Riga 185: `npm run dev` → `npm run dev` (`next dev -H 127.0.0.1`).
*   In 10.5, punto Mailpit: aggiungo "Mailpit è un eseguibile locale, avviato con `--smtp 127.0.0.1:1025 --listen 127.0.0.1:8025`, così non è raggiungibile dalla rete."
*   Riga 368: resta "applicazione e database ascoltano solo su `127.0.0.1`", che con queste due modifiche diventa vera.

**[R13] RF6 verificabile** (style M3). RF6 → "Se l'invio fallisce, il cliente vede un messaggio che dice che l'email non è partita e indica una di queste cause: server di posta non raggiungibile, accesso all'account rifiutato, tempo scaduto, indirizzo rifiutato. Il messaggio offre "Scarica il PDF" e, se restano tentativi, "Riprova", che non crea una seconda configurazione."

**[R14] Criterio di qualità dell'anteprima** (style M4). In 9.1, dopo "Obiettivo": "Un'anteprima è accettabile se ogni materiale scelto si riconosce dalla sua texture, le quote si leggono, e forma e proporzioni corrispondono alla foto ufficiale della versione. Il controllo si fa a vista nella pagina `/galleria` (sezione 18)."

**[R15] Scadenza della conferma privacy** (style). Riga 429: "prima di qualsiasi uso" → "prima del flusso completo (fase 5), cioè prima che il tutor inserisca un indirizzo vero".

---

## PROPOSE FIX: Nit

*   **n1 (esempio di `config`):** tolgo `"extras": []` dall'esempio e aggiungo: "Lo snapshot contiene solo i gruppi del prodotto. Il taglio sta fuori da `selections` perché ha una tabella propria; nell'URL usa comunque la chiave `size` come i gruppi (P7)."
*   **n2 (nomi delle colonne):** in 8.1 aggiungo "I nomi passano dal camelCase del JSON allo snake_case delle colonne; `default` diventa `default_value` perché `default` è una parola riservata in SQL."
*   **n3 (contenuto del PDF):** 10.4 "e l'elenco di prodotto, taglio…" → "il numero e la data della configurazione e l'elenco di prodotto, taglio…".
*   **n4 (`request_id`):** riga 214 "UUID generato dal client per ogni invio del modulo" → "UUID generato dal server quando mostra il modulo e inviato in un campo nascosto, così funziona anche senza JavaScript"; stessa modifica alla riga 332. Se la stessa richiesta arriva due volte, l'inserimento usa `ON CONFLICT (request_id) DO NOTHING` e poi legge la riga esistente.
*   **n5 (attesa accessibile):** in 14 aggiungo "Durante l'invio, che può durare decine di secondi, un messaggio di stato (`role="status"`) annuncia l'attesa. Le scelte disattivate usano `aria-disabled` e restano raggiungibili da tastiera, perché `disabled` le salterebbe."
*   **n6 (resvg e font):** riga 374 "senza font caricati il testo delle quote scompare" → "senza font caricati il testo delle quote può scomparire o cambiare font".
*   **n7 (criteri della prova):** riga 384, criteri della prova: aggiungo il quarto punto "pattern e fusioni resi come nel browser", e lo stesso alla riga 394.
*   **n8 (Gmail fuori dall'UE):** in 12, Destinatari: "L'invio passa da Gmail, che va dichiarato nell'informativa" → "L'invio passa da Gmail, che va dichiarato nell'informativa, anche come possibile trasferimento di dati fuori dall'UE."
*   **n9 (glossario):** aggiungo le voci
    *   **Seed:** lo script che carica i file del catalogo nel database (sezione 8.2);
    *   **Scheletro:** la prima versione che funziona dall'inizio alla fine con Aladdin (fase 3);
    *   **Blocco delle funzioni:** fase 7, da cui non si aggiungono funzioni né modifiche allo schema;
    *   **Vista frontale e vista diagonale:** le due viste esterne del generatore (sezione 9.1).

---

Status: resolved (round 1)

# Goldfish Annotated Review Report: Stage 7, round 1

## Esito della risoluzione (2026-11-11)

Su indicazione dell'autore ho applicato tutte le correzioni proposte. Escalation chiuse:
- **C9:** bozza del paragrafo "Problema" accettata e inserita in testa alla sezione 2.
- **C14:** l'autorizzazione e le indicazioni del tutor sono state date a voce. Lo dicono la voce "Tutor" del glossario e la 9.4. Ho corretto anche i motivi vaghi alle righe 244 e 360.
- **C28:** due viste esterne, frontale e diagonale (prospettiva da un angolo). Le viste dall'interno sono scartate. Ho aggiornato la 9.1 e P12.

DECLINE: C29, C30, C32, C33, C34, C35, C37, C41, C42, C43 (nessuna modifica).

Dopo le modifiche: FeatureRange 1..462, DetailedRange 463..864.

**Target:** `configuratore-saune-analisi-v6.md` (righe 1-434, FeatureRange; alcune correzioni toccano anche le righe collegate fuori intervallo, segnalate caso per caso)
**Fonte dei findings:** `critic_report.md` (Stage 7, round 1). Gli id `C<n>` sono quelli del report.

## Riepilogo

| Categoria | Findings |
|---|---|
| ESCALATE (serve una tua informazione) | C9, C14, C28 |
| PROPOSE FIX | C1, C1b, C2, C3, C4, C5, C6, C7, C8, C10, C11, C12, C13, C15, C16, C17, C18, C19, C20, C21, C22, C23, C24, C25, C26, C27, C31, C38, C39, C40 |
| DECLINE (Nit annotati, nessuna modifica) | C29, C30, C32, C33, C34, C35, C37, C41, C42, C43 |
| CONTEST | nessuno |

Non ho contestato nulla. Ho controllato le affermazioni tecniche dei revisori:
- Nodemailer non ha un timeout complessivo, solo `connectionTimeout`, `greetingTimeout` e `socketTimeout`, con valori predefiniti di minuti.
- `next start` e le porte pubblicate da Docker ascoltano su tutte le interfacce, se non si specifica altro.
- Gmail salva nella "Posta inviata" i messaggi mandati via SMTP.
- SQLite ha JSONB dalla versione 3.45.

Sono tutte corrette.

---

## ESCALATE

### [C9] [`egm-structural`] - Severity: Major
*   **Affected Scope:** [righe 7-20](configuratore-saune-analisi-v6.md#L7-L20) (sezioni 1 e 2)
*   **Discrepancy Description:** manca un Problem Statement. Il documento dice cosa si costruisce, non perché: a chi serve il configuratore, cosa manca oggi su effe.it, cosa deve dimostrare la demo.
*   **Rationale:** lo standard feature-spec chiede il problema prima della soluzione.
*   ***AI Suggestion:*** ESCALATE
*   ***Justification:*** la critica è valida, ma il motivo vero del progetto (perché l'azienda o il tutor hanno proposto un configuratore, che cosa deve dimostrare) non è scritto in nessun file. Non posso inventarlo.
*   ***Proposed Edit:*** se mi dai il motivo, aggiungo all'inizio della sezione 2 un paragrafo **Problema** di 2-3 frasi. Bozza da confermare o correggere: *"Sul sito effe.it il cliente vede ogni sauna solo nelle versioni fotografate e non può vedere insieme le combinazioni di taglio, essenza e pedana. Il tirocinio deve dimostrare che un configuratore web può mostrare queste combinazioni e mandare al cliente un riepilogo, con scelte tecniche motivate."*

### [C14] [`egm-structural`, `egm-design`, `egm-style`] - Severity: Major
*   **Affected Scope:** [righe 117](configuratore-saune-analisi-v6.md#L117), [144](configuratore-saune-analisi-v6.md#L144), [164](configuratore-saune-analisi-v6.md#L164), [244](configuratore-saune-analisi-v6.md#L244), [283](configuratore-saune-analisi-v6.md#L283), [360](configuratore-saune-analisi-v6.md#L360)
*   **Discrepancy Description:** alcuni motivi di scarto sono vaghi ("pesante", "qualità inferiore"). L'"indicazione del tutor" e l'"autorizzazione del tutor" non hanno una fonte verificabile.
*   **Rationale:** lo standard vieta di attribuire una scelta a una persona senza collegare la fonte. Per Docker l'indicazione è l'unico motivo dato.
*   ***AI Suggestion:*** ESCALATE (fonte del tutor) + PROPOSE FIX (testo vago)
*   ***Justification:*** solo tu sai dove e quando il tutor ha dato queste indicazioni (email, incontro, data). Il testo vago invece si può correggere subito.
*   ***Proposed Edit:***
    *   Fonte: dimmi data e mezzo (per esempio "email del 2026-10-XX"). Aggiungo una riga nel glossario alla voce **Tutor**: "Le indicazioni del tutor citate nel documento sono state date il … (…)". Se l'autorizzazione all'uso delle immagini è scritta, la cito alla riga 283.
    *   Riga 360: `massima fedeltà, ma pesante. Scartato.` → `massima fedeltà, ma richiede un browser headless sul server (Chromium, centinaia di MB) e un processo in più da gestire. Scartato.`
    *   Riga 244: `non 3D in tempo reale, che sarebbe pesante e di qualità inferiore ai configuratori online` → `non 3D in tempo reale: i modelli 3D dell'Area Pro non possono entrare nel repository e i tempi del tirocinio non bastano per produrne altri`

### [C28] [`egm-style`; Stage 6 #4] - Severity: Nit
*   **Affected Scope:** [righe 246-248](configuratore-saune-analisi-v6.md#L246-L248)
*   **Discrepancy Description:** non è chiaro che cosa mostri la vista "frontale" (la parete frontale vista da fuori o da dentro). Non è chiaro nemmeno quale "vista interna" venga scartata, visto che la vista "Interno" del mockup è chiamata "frontale".
*   **Rationale:** il lettore senza contesto non riesce a distinguere le due viste.
*   ***AI Suggestion:*** ESCALATE
*   ***Justification:*** dipende da come è disegnato il mockup, che non è nel workspace.
*   ***Proposed Edit:*** dimmi che cosa mostra la frontale e che cosa si intende per vista interna scartata (per esempio "prospettiva dall'interno"). Riscrivo così le due frasi: "La **frontale** mostra … La vista interna in … è scartata perché …".

---

## PROPOSE FIX: Major

### [C1] [`egm-design`, `egm-structural`, `egm-style`] - Severity: Major
*   **Affected Scope:** [righe 186-208](configuratore-saune-analisi-v6.md#L186-L208), [227](configuratore-saune-analisi-v6.md#L227), [273-274](configuratore-saune-analisi-v6.md#L273-L274), [362](configuratore-saune-analisi-v6.md#L362), e la riga 608 fuori intervallo
*   **Discrepancy Description:** la tabella 8.1 non corrisponde ad `aladdin.json`:
    *   mancano predefiniti, etichetta del gruppo, `defaultSize`, `photos` e `fixedZones`;
    *   `material` è globale e rischia sovrascritture;
    *   `option_rule` non ha il prodotto e ha una sola destinazione;
    *   non è detto dove sta la geometria per taglio;
    *   i nomi sono incoerenti.
*   **Rationale:** lo schema si blocca alla fine della fase 4. La PR del contratto partirebbe da un modello che non corrisponde ai dati.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** i codici dei materiali nel JSON (`rovere-rigatino`, `gres-moka`, `specchio`) non contengono il prodotto, quindi sono pensati per essere condivisi. Per questo propongo materiali globali, con un controllo nel seed invece della colonna prodotto.
*   ***Proposed Edit:***
    *   Righe 190-195, nuova tabella:
        ```
        | `product` | `code`, `name`, `designer`, `description`, `viewer` (`svg` o `image`), `default_size`, `fixed_zones` JSONB (zona → materiale), `photos` JSONB (versione → percorso), `geometry` JSONB (parametri delle viste, se presenti), `source` JSONB |
        | `product_size` | prodotto, `code`, `label`, `width_cm`, `depth_cm`, `height_cm`, `attributes` JSONB (parametri della geometria che cambiano con il taglio); unico per (prodotto, `code`) |
        | `material` | `code` unico in tutto il catalogo, `name`, `type` (legno, alluminio, gres, specchio), `color`, `texture` |
        | `option_group` | prodotto, `code`, `label`, `type` (`single` o `multi`), `step`, `zones`, `default_value`; unico per (prodotto, `code`) |
        | `option_value` | gruppo, `code`, `label`, materiale collegato (facoltativo), `attributes` JSONB; unico per (gruppo, `code`) |
        | `option_rule` | prodotto, `type` (`requires`, `excludes`, `only_with_size`), valore di origine, destinazione (un valore, oppure l'elenco dei tagli per `only_with_size`), `message` |
        ```
    *   Riga 227 sostituita da: "I nomi delle colonne seguono i campi dei file JSON (P1): `step` è il numero del passaggio del configuratore in cui compare il gruppo, `zones` sono le zone dell'SVG a cui il gruppo applica il materiale, `default_value` è il valore predefinito (P2). Più file possono dichiarare lo stesso materiale: il seed fallisce se due file usano lo stesso `code` con dati diversi. Tipi, chiavi e vincoli definitivi si fissano nel contratto condiviso (sezione 15.2) e poi si documentano in `docs/modello-dati.md`."
    *   Riga 273: `La geometria è fissa per prodotto e taglio e si calcola una volta (memoizzata).` → `La geometria dipende da prodotto e taglio (`product.geometry` e `product_size.attributes`) e si calcola una volta (memoizzata).`
    *   Riga 274: `option_group.zone` → `option_group.zones`
    *   Riga 362: `material.colore` → `material.color`
    *   Riga 608 (20.2): `passo` → `step`, `zone interessate` → `zones`.

### [C1b] [`egm-style`, `egm-structural`] - Severity: Major
*   **Affected Scope:** [righe 199-208](configuratore-saune-analisi-v6.md#L199-L208) e tutte le occorrenze nel documento
*   **Discrepancy Description:** la tabella `configuration` mescola identificatori italiani (`numero`, `stato_cliente`, `stato_progetto`, `in_attesa`, `inviata`, `fallita`) e inglesi (`token`, `expires_at`, `request_id`). Il glossario stabilisce invece nomi inglesi nel codice.
*   **Rationale:** nel contratto serve una sola convenzione.
*   ***AI Suggestion:*** PROPOSE FIX (separato da C1, perché tocca molte righe anche fuori intervallo)
*   ***Proposed Edit:***
    *   Dopo la riga 227 aggiungo: "Gli identificatori nel codice e nel database sono in inglese; le etichette mostrate al cliente sono in italiano."
    *   Sostituzione in tutto il documento:
        *   `stato_cliente` → `customer_status`;
        *   `stato_progetto` → `project_status`;
        *   `in_attesa` → `pending`;
        *   `inviata` → `sent`;
        *   `fallita` → `failed`, solo dove è in code font;
        *   `numero` → `number`, solo dove è in code font.
    *   Le parole italiane fuori dal code font restano.

### [C2] [`egm-design`; Stage 5 A; Stage 6 #1] - Severity: Major
*   **Affected Scope:** [riga 88](configuratore-saune-analisi-v6.md#L88), [137](configuratore-saune-analisi-v6.md#L137), [353](configuratore-saune-analisi-v6.md#L353)
*   **Discrepancy Description:** lo snapshot contiene solo codici ed etichette, ma il PDF rigenerato ("Scarica il PDF", "Riprova") ridisegna l'immagine dal catalogo attuale. Questo contraddice "resta identica" e fallisce se il prodotto viene tolto.
*   **Rationale:** due garanzie dichiarate non stanno insieme.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** propongo la strada più leggera: dichiarare il limite e aggiungere un ripiego solo testo. Non cambia lo schema. L'alternativa è salvare i byte del PDF in una colonna `bytea`: rende "Scarica il PDF" identico all'originale, ma aggiunge una colonna di circa 1 MB per riga. Se preferisci questa, dimmelo.
*   ***Proposed Edit:***
    *   Riga 88: `Una configurazione salvata resta identica anche se il catalogo viene modificato.` → `Le scelte salvate e le loro etichette restano identiche anche se il catalogo viene modificato. L'immagine del PDF, invece, si ridisegna con il catalogo attuale (sezione 11).`
    *   Riga 137: `Un cambio successivo del catalogo non altera le configurazioni già salvate.` → `Un cambio successivo del catalogo non altera le scelte e le etichette già salvate.`
    *   Riga 353, aggiungo dopo il primo punto: `L'elenco delle scelte viene dallo snapshot; l'immagine si ridisegna con il catalogo attuale. Se il prodotto non c'è più o la sua geometria non è valida, il PDF esce con il solo elenco delle scelte.`

### [C3] [`egm-design`; Stage 5 B, C; Stage 6 #2] - Severity: Major
*   **Affected Scope:** [righe 231-236](configuratore-saune-analisi-v6.md#L231-L236), [293](configuratore-saune-analisi-v6.md#L293)
*   **Discrepancy Description:**
    *   Non è detto da dove legge il catalogo l'applicazione a runtime, se dai file o dal database.
    *   L'upsert non cancella mai i dati tolti dai file.
    *   Il motivo dato ("le configurazioni non si perdono") non regge, perché `configuration` non ha chiavi esterne verso il catalogo.
*   **Rationale:** interfaccia e server possono applicare regole diverse, cioè proprio quello che la scheda 0020 vuole evitare.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:***
    *   Righe 231-236 sostituite da:
        ```
        Ogni prodotto è un file in `data/prodotti/` con tagli, opzioni, regole e parametri delle viste. I file sono la **fonte** del catalogo; a runtime l'applicazione legge **solo dal database**:
        - fino allo scheletro (fase 3) Marko importa i file direttamente nell'interfaccia, come "catalogo finto"; dalla fase 3 il configuratore riceve il prodotto dal server, letto dal database, e il server applica `valuta` con le stesse regole;
        - il seed di Nicolas carica i file nel database dopo averli validati con Zod: un file sbagliato fa fallire il seed;
        - il seed **sincronizza** le tabelle del catalogo in una sola transazione: inserisce, aggiorna e cancella, così il database coincide con i file. La tabella `configuration` non si tocca e non ha chiavi esterne verso il catalogo (sezione 8.1), quindi le configurazioni salvate non si perdono. Se la validazione fallisce, la transazione si annulla e il database resta com'era.

        Dopo ogni modifica a un file si rilancia il seed (lo fa anche `npm run demo`). Il database serve per i vincoli, per le query delle pagine del catalogo e per le configurazioni salvate. Il lavoro di inserimento si divide per file, senza conflitti.
        ```
    *   Riga 293: `la usa il server, insieme a Zod,` → `la usa il server, con le regole lette dal database e insieme a Zod,`

### [C4] [`egm-design`; Stage 5 D] - Severity: Major
*   **Affected Scope:** [riga 303](configuratore-saune-analisi-v6.md#L303), [righe 309-314](configuratore-saune-analisi-v6.md#L309-L314)
*   **Discrepancy Description:**
    *   Il "timeout di circa 10 secondi" non esiste in Nodemailer come limite complessivo.
    *   Le righe possono restare ferme in `in_attesa`.
    *   Due "Riprova" contemporanei non sono bloccati e i tentativi non hanno un limite.
*   **Rationale:** sono possibili doppi invii e righe senza via d'uscita, e chi conosce il token può far partire un numero illimitato di email.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** i valori numerici (3 tentativi, 30 s, 2 min) sono una mia proposta, da cambiare se vuoi.
*   ***Proposed Edit:***
    *   Riga 303: `con un timeout di circa 10 secondi.` → `I tre timeout di Nodemailer (`connectionTimeout`, `greetingTimeout`, `socketTimeout`) si impostano a circa 10 secondi, perché quelli predefiniti sono di minuti.`
    *   Aggiungo alla 10.3, dopo la riga 313:
        ```
        - "Riprova" aggiorna la riga in modo condizionale (`UPDATE … WHERE stato_cliente <> 'inviata'`): due clic contemporanei non producono due invii e una riga già inviata non si rimanda. Sono ammessi al massimo 3 tentativi, con almeno 30 secondi tra l'uno e l'altro.
        - Una riga ferma in `in_attesa` da più di 2 minuti (processo interrotto tra il salvataggio e l'invio) si considera `fallita`, e la pagina di conferma offre "Riprova". All'avvio, `npm run demo` segna `fallita` queste righe.
        - Dopo un timeout non si può escludere che l'email sia partita comunque: in quel caso "Riprova" può produrre un doppione. Per la demo è accettato.
        ```

### [C5] [`egm-design`; Stage 5 D; Stage 6 #6] - Severity: Major
*   **Affected Scope:** [riga 304](configuratore-saune-analisi-v6.md#L304), [314](configuratore-saune-analisi-v6.md#L314)
*   **Discrepancy Description:** non è spiegato il meccanismo per cui la notifica "non blocca la risposta". Una notifica fallita non viene mai ripresa.
*   **Rationale:** in una Server Action la notifica o si attende o si perde.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** propongo di attendere la notifica: nel caso peggiore sono 10 + 10 secondi, entro i 60 di RNF4. È più semplice di `after()` e lo stato resta sempre aggiornato.
*   ***Proposed Edit:***
    *   Riga 304: → `6. Solo dopo, il server invia la notifica all'email del progetto, con gli stessi timeout, e aggiorna `stato_progetto` allo stesso modo. La notifica si attende: nel caso peggiore la risposta arriva dopo circa 20 secondi, entro il limite di RNF4. Un fallimento della notifica non cambia la risposta al cliente.`
    *   Riga 314, aggiungo: `All'avvio, `npm run demo` rimanda una volta le notifiche `fallita`.`

### [C6] [`egm-design`, `egm-structural`; Stage 5 N2; Stage 6 #13] - Severity: Major
*   **Affected Scope:** [riga 173](configuratore-saune-analisi-v6.md#L173)
*   **Discrepancy Description:** `next start` non termina, quindi il controllo preliminare che lo segue non parte mai.
*   ***AI Suggestion:*** PROPOSE FIX (unito a C4, C5 e C7 sulla stessa riga)
*   ***Proposed Edit:*** riga 173 → `- **Per la demo:** `npm run demo` esegue in ordine `docker compose up -d --wait`, migrazioni, seed, pulizia delle righe scadute, sistemazione degli invii rimasti a metà (sezione 10.3), `next build` e il controllo preliminare (sezione 10.5). Se il controllo stampa un FAIL l'avvio si ferma; altrimenti parte `next start -H 127.0.0.1`.`

### [C7] [`egm-design`] - Severity: Major
*   **Affected Scope:** [riga 171](configuratore-saune-analisi-v6.md#L171), [340](configuratore-saune-analisi-v6.md#L340), [399](configuratore-saune-analisi-v6.md#L399)
*   **Discrepancy Description:** `next start` e la porta Docker ascoltano su tutte le interfacce. Sulla rete dell'università o della sede chiunque può usare il pulsante o raggiungere il database.
*   **Rationale:** il rischio accettato ("utenti noti") si basa su un'ipotesi falsa.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:***
    *   Riga 171 → `- porta 5433 sul computer, pubblicata solo su `127.0.0.1` (`127.0.0.1:5433:5432`): non entra in conflitto con un PostgreSQL già installato e il database non è raggiungibile dalla rete.`
    *   Riga 173: `next start -H 127.0.0.1` (vedi C6).
    *   Riga 340, aggiungo: `Il rischio è limitato perché applicazione e database ascoltano solo su `127.0.0.1` (sezione 7): dalla rete della sede nessuno raggiunge il pulsante.`

### [C8] [`egm-design`] - Severity: Major
*   **Affected Scope:** [righe 382-383](configuratore-saune-analisi-v6.md#L382-L383), e la riga 699 (P11) fuori intervallo
*   **Discrepancy Description:** Gmail salva nella "Posta inviata" ogni email mandata al cliente, con indirizzo e PDF. La cancellazione su richiesta tocca solo il database.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:***
    *   Riga 382 → `- **Cancellazione su richiesta:** il cliente scrive all'email del progetto; lo stesso script di pulizia, con un parametro email, cancella dal database i dati di quell'indirizzo. Gmail conserva nella "Posta inviata" una copia di ogni email mandata al cliente, con il PDF: la procedura manuale comprende quindi anche la ricerca `to:<indirizzo>` nella casella del progetto e l'eliminazione dei messaggi trovati.`
    *   Riga 699: `Così nella casella Gmail ci sono meno copie di dati personali da cancellare dopo 12 mesi.` → `Così le notifiche non contengono dati personali; le copie delle email al cliente in "Posta inviata" si cancellano con la procedura della sezione 12.`

### [C10] [`egm-structural`] + [C16] [`egm-structural`, `egm-design`] - Severity: Major
*   **Affected Scope:** [righe 18-38](configuratore-saune-analisi-v6.md#L18-L38); tabella 20.1 (righe 592-601)
*   **Discrepancy Description:**
    *   Le esclusioni e i rischi sono sparsi e la specifica non rimanda alle sezioni 21 e 20.1.
    *   L'esclusione dell'IA non compare nelle righe 1-434.
    *   I rischi nuovi (C2, C3, C4, C7, C8) non sono nella tabella 20.1.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:***
    *   In fondo alla sezione 2, dopo la tabella: `Le esclusioni (prezzi, intelligenza artificiale, 3D, applicazione in Docker e le altre) sono raccolte nella sezione 21; i rischi e le mitigazioni nella tabella della sezione 20.1.`
    *   Nuove righe in 20.1:
        ```
        | Il database non coincide con i file del catalogo | Medio: interfaccia e server applicano regole diverse | Seed come sincronizzazione completa in transazione, rilanciato da `npm run demo` (sezione 8.2) | N |
        | Il PDF rigenerato differisce da quello inviato, o non si genera, dopo una modifica del catalogo | Basso | Elenco delle scelte dallo snapshot; PDF con il solo elenco se il prodotto manca (sezioni 5 e 11) | N |
        | Invii rimasti a metà o doppi per "Riprova" | Medio | Timeout espliciti, aggiornamento condizionale, limite ai tentativi, righe `in_attesa` vecchie segnate `fallita` (sezione 10.3) | N |
        | Applicazione o database raggiungibili dalla rete della sede | Alto: estranei possono inviare email e leggere dati personali | Ascolto solo su `127.0.0.1` (sezione 7) | N |
        | Copie dei dati del cliente nella "Posta inviata" di Gmail | Medio | Procedura manuale anche per le cancellazioni su richiesta (sezione 12) | N |
        ```

### [C11] [`egm-structural`] + [C13] [`egm-structural`] + [C36] - Severity: Major
*   **Affected Scope:** [righe 22-38](configuratore-saune-analisi-v6.md#L22-L38), [riga 164](configuratore-saune-analisi-v6.md#L164)
*   **Discrepancy Description:**
    *   La tabella delle decisioni non ha né il numero della scheda né lo stato.
    *   Mancano 0004, 0005, 0013, 0016, 0017, 0019 e 0020.
    *   Molte scelte non dicono dove trovare le alternative; per Docker manca Supabase.
    *   Il percorso `docs/decisioni/` alla riga 22 non è quello attuale.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** con una colonna "Scheda" ogni decisione punta alla scheda che contiene le alternative. Così si risolve C13 senza ripetere le alternative nel documento, che è anche ciò che chiede lo Stage 5 (M5).
*   ***Proposed Edit:***
    *   Riga 22 → `Ogni decisione ha la sua scheda nel [registro delle decisioni](docs-iniziali/docs/decisioni/README.md), con le alternative scartate e i motivi. Finché il repository non esiste le schede stanno in `docs-iniziali/docs/decisioni/`, poi in `docs/decisioni/` (sezione 19).`
    *   Tabella righe 24-38 con una terza colonna `Scheda` e le righe aggiunte:
        ```
        | Tema | Decisione | Scheda |
        |---|---|---|
        | Database | PostgreSQL con colonne JSONB per gli attributi particolari | 0001 |
        | Esecuzione | Solo PostgreSQL in Docker; l'applicazione gira direttamente sul computer | 0014 (sostituisce 0002) |
        | ORM | Drizzle, non SQL puro e non Prisma | 0003 |
        | Applicazione | Next.js con Server Action e Route Handler, Zod, shadcn/ui | 0019 |
        | Catalogo | File JSON nel repository, caricati nel database dal seed | 0018 |
        | Regole | Una sola funzione `valuta` usata da interfaccia e server | 0020 |
        | Salvataggio | (testo attuale) | 0006 |
        | Email | Nodemailer con un Gmail dedicato; Mailpit in sviluppo | 0017 |
        | PDF | (testo attuale) | 0015 (da confermare con la prova) |
        | Ricontatto | (testo attuale) | 0007 |
        | Privacy | (testo attuale) | 0007 (proposta, da verificare con il tutor) |
        | Cookie | (testo attuale) | 0008 |
        | Accessibilità | (testo attuale) | 0009 |
        | Grafica | (testo attuale) | 0010, 0016 (da verificare nella fase 3) |
        | Lingua | Solo italiano | 0011 |
        | Migrabilità | (testo attuale) | 0012 |
        | Git | Organizzazione del repository | 0013 |
        | Esclusioni | Prezzi e intelligenza artificiale fuori dal progetto (sezione 21) | 0004, 0005 |
        ```
    *   Riga 164, aggiungo alla fine: `L'ipotesi iniziale, Supabase, è stata sostituita da PostgreSQL in Docker (schede 0002 e 0014).`

### [C12] [`egm-structural`; Stage 6 #10] - Severity: Major
*   **Affected Scope:** glossario ([righe 44-60](configuratore-saune-analisi-v6.md#L44-L60)), [riga 199](configuratore-saune-analisi-v6.md#L199)
*   **Discrepancy Description:** sigle e termini usati prima di essere definiti: P1-P15, fasi, contratto, livello A/B.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:***
    *   Nuove righe nel glossario:
        ```
        | **Livello A / livello B** | I due modi di mostrare un prodotto: A con viste SVG generate, B con la foto ufficiale e i campioni dei materiali (sezione 9.2) |
        | **Contratto condiviso** | Tipi, schemi e funzioni comuni fissati all'inizio dai due sviluppatori in una sola pull request (sezione 15.2) |
        | **Fase** | Una delle dieci tappe del lavoro, numerate da 1 a 10 (sezione 15.5) |
        | **P1–P15** | Le decisioni sui punti aperti prese il 2026-11-11 (sezione 20.3) |
        ```
    *   Riga 199: `(formato `AAAA-NNNNNN`, P5);` → `(formato `AAAA-NNNNNN`, P5 nella sezione 20.3);`

### [C15] [`egm-structural`] - Severity: Major
*   **Affected Scope:** [righe 289-293](configuratore-saune-analisi-v6.md#L289-L293)
*   **Discrepancy Description:** l'architettura è troppo ridotta: non ci sono componenti, flusso dei dati né route.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:*** aggiungo in fondo alla 10.1:
    ```
    - **Componenti e flusso dei dati:**
      - nel browser: pagine del catalogo e configuratore (`src/app/`, `src/components/`) e generatore delle viste (`src/lib/viste/`);
      - nel server Next.js: Server Action per l'invio e "Riprova", Route Handler per il PDF (P8). Usano Zod e `valuta` (`src/contratti/`), Drizzle verso PostgreSQL (`src/db/`), il generatore con resvg per l'immagine, PDFKit per il PDF e Nodemailer per le email (`src/server/`);
      - in Docker: PostgreSQL, con il catalogo caricato dai file e le configurazioni salvate.

      Le route sono elencate in P6 (sezione 20.3); il dettaglio va in `docs/architettura.md`.
    ```

### [C17] [`egm-style`, `egm-design`] - Severity: Major
*   **Affected Scope:** [riga 91](configuratore-saune-analisi-v6.md#L91), [138](configuratore-saune-analisi-v6.md#L138), [415](configuratore-saune-analisi-v6.md#L415)
*   **Discrepancy Description:** la frase "solo cambio di configurazione, senza modifiche a schema o codice" è ripetuta più volte, non è mai stata verificata ed è troppo forte (con un pooler di connessioni servono opzioni del driver).
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:***
    *   Riga 91 → `6. **Migrabilità.** Lo stesso schema deve poter passare da un container Docker a un database online (sezione 13).`
    *   Riga 138 → `4. **Non c'è dipendenza da un fornitore.** PostgreSQL è uno standard offerto da molti servizi online; le regole della sezione 13 servono a non precludere il passaggio.`
    *   Riga 415 → `Il progetto è pensato perché il passaggio a un database online richieda solo di cambiare la configurazione (connessione, SSL) e, se il servizio usa un pooler di connessioni, le opzioni del driver (ad esempio `prepare: false` per `postgres.js`). Il passaggio non è stato provato.`

### [C18] [`egm-style`] - Severity: Major
*   **Affected Scope:** [riga 158](configuratore-saune-analisi-v6.md#L158)
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:*** → `La scelta non è vincolante: le migrazioni generate sono file SQL e restano utilizzabili anche senza Drizzle; le query andrebbero invece riscritte.`

### [C19] [`egm-style`, `egm-design`] - Severity: Major
*   **Affected Scope:** [righe 135-136](configuratore-saune-analisi-v6.md#L135-L136)
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:***
    *   Riga 135: `i vincoli del database sono la seconda linea di difesa e garantiscono l'integrità anche per i dati scritti dall'applicazione.` → `i vincoli del database sono la seconda linea di difesa sulle colonne relazionali.`
    *   Riga 136: `che PostgreSQL può indicizzare e interrogare. Si ottiene la flessibilità di un database a documenti mantenendo l'integrità.` → `che PostgreSQL può interrogare e, se servisse, indicizzare. Il contenuto delle colonne JSONB non è controllato dai vincoli del database: lo valida Zod prima della scrittura.`

### [C20] [`egm-style`] - Severity: Major
*   **Affected Scope:** [riga 144](configuratore-saune-analisi-v6.md#L144), e la riga 784 fuori intervallo
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:***
    *   Riga 144: `perché il tutor ha indicato un database in Docker, perché non ha JSONB né lo stesso supporto ai vincoli, e perché il database usato in sviluppo` → `perché il tutor ha indicato un database in Docker e perché il database usato in sviluppo` … (resto invariato), poi aggiungo: `Le differenze tecniche sono minori: SQLite non ha indici GIN per i dati JSON e le chiavi esterne vanno attivate a ogni connessione (`PRAGMA foreign_keys`).`
    *   Riga 784, colonna v6 → `Motivi veri: indicazione del tutor, stesso motore online; differenze minori su JSON e chiavi esterne (6.6)`

### [C21] [`egm-style`] - Severity: Major
*   **Affected Scope:** [righe 124-131](configuratore-saune-analisi-v6.md#L124-L131)
*   **Discrepancy Description:** la scala Ottimo/Buono/… non è definita. MySQL ha "Ottimo" sui vincoli ma viene penalizzato alla riga 143.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:*** tabella con i fatti al posto degli aggettivi:
    ```
    | Criterio | PostgreSQL | MySQL | SQLite | MongoDB |
    |---|---|---|---|---|
    | Dati relazionali e vincoli | Chiavi esterne, `UNIQUE`, `CHECK` | Chiavi esterne, `UNIQUE`; `CHECK` solo dalla 8.0.16 | Chiavi esterne da attivare con `PRAGMA`, `CHECK` | Nessuna chiave esterna tra collezioni |
    | Dati variabili per prodotto | JSONB con indici GIN | JSON, indici solo su colonne generate o multi-valore | JSON/JSONB, senza indici GIN | Documenti nativi |
    | Esecuzione in Docker | Immagine ufficiale | Immagine ufficiale | Non serve: è un file | Immagine ufficiale |
    | Parità con un servizio online | Stesso motore offerto da molti fornitori | Offerto da molti fornitori | Un file locale, non un servizio | Servizio gestito dal produttore |
    | Lavoro in due, migrazioni | Drizzle Kit | Drizzle Kit | Drizzle Kit | Migrazioni dichiarative poco supportate |
    | Giudizio | **Scelto** | Alternativa valida | Adatto a un prototipo locale; escluso dall'indicazione del tutor | Sconsigliato |
    ```

### [C22] [`egm-style`, `egm-structural`; Stage 6 #14] - Severity: Major
*   **Affected Scope:** [riga 78](configuratore-saune-analisi-v6.md#L78)
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:*** → `- **RNF3.** Avvio della demo da clone pulito con un solo comando (`npm run demo`), una volta copiato il file `.env` e soddisfatti i prerequisiti della sezione 7.`

### [C23] [`egm-style`] - Severity: Major
*   **Affected Scope:** [riga 72](configuratore-saune-analisi-v6.md#L72), [312](configuratore-saune-analisi-v6.md#L312)
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:***
    *   Riga 72 → `- **RF6.** Se l'invio fallisce, il cliente vede un messaggio che dice che l'email non è partita, ne indica la causa in termini comprensibili ed elenca le azioni disponibili; può scaricare il PDF e può riprovare senza creare una seconda configurazione.`
    *   Riga 312 → `- Il cliente vede il messaggio descritto in RF6 e può comunque scaricare il PDF.`

### [C24] [`egm-style`] - Severity: Major
*   **Affected Scope:** [righe 356, 359, 366](configuratore-saune-analisi-v6.md#L356-L366)
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:***
    *   Riga 356 → `- Le differenze attese rispetto allo schermo riguardano `<pattern>`, fusioni e filtri (`feTurbulence`); la prova le verifica.`
    *   Riga 359: `se la prova mostra differenze evidenti.` → `se la prova mostra che manca una texture, che le quote non sono leggibili o che mancano gli accenti.`
    *   Riga 366: `confrontato a vista con il browser` → `confrontato con il browser sugli stessi tre punti (texture presenti, quote leggibili, accenti corretti)`

### [C25] [`egm-style`, `egm-structural`] - Severity: Major
*   **Affected Scope:** [riga 48](configuratore-saune-analisi-v6.md#L48), [righe 220-222](configuratore-saune-analisi-v6.md#L220-L222)
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:***
    *   Riga 48: `ad esempio Aladdin 60 (200 × 160 × 210 cm)` → `ad esempio Aladdin 60 (200 × 160 × 210 cm; l'ordine delle misure è da verificare, appendice A)`
    *   Riga 222 → `{ "group": "Pedana a pavimento in gres (120 × 120 × 5 cm)", "label": "Gres Masterpiece Moka" }`
    *   Dopo l'esempio: `Le etichette sono quelle del catalogo; per il taglio si aggiungono le misure.`

---

## PROPOSE FIX: Nit (correzioni piccole che conviene fare)

### [C26] [`egm-style`; Stage 6 #5] - Severity: Nit
*   **Affected Scope:** [riga 272](configuratore-saune-analisi-v6.md#L272)
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:*** → `- Una **funzione pura** `(geometria, scelte, vista, opzioni) → stringa SVG`, senza DOM, è usata sia dal browser sia dal server (sezione 11). `opzioni` contiene il prefisso degli `id`, `flat` e il modo di includere le texture: percorsi di `public/` nel browser, data URI sul server.`

### [C27] [`egm-style`, `egm-design`] - Severity: Nit
*   **Affected Scope:** [riga 385](configuratore-saune-analisi-v6.md#L385)
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:*** `(`next/font` scarica il font alla build)` → `(file TTF nel repository letti da `next/font/local`, P14)`

### [C31] [`egm-style`] - Severity: Nit
*   **Affected Scope:** [riga 407](configuratore-saune-analisi-v6.md#L407)
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:*** `Queste regole non richiedono lavoro in più, perché coincidono con le impostazioni predefinite, e servono a non precluderla.` → `Queste regole richiedono poco lavoro in più e servono a non precluderla.`

### [C38] [`egm-design`] - Severity: Nit
*   **Affected Scope:** [riga 340](configuratore-saune-analisi-v6.md#L340)
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:*** aggiungo dopo la prima frase: `Il campo di conferma accetta l'incolla (sezione 14), quindi un indirizzo copiato con un errore passa lo stesso.`

### [C39] [`egm-design`; Stage 6 #20] - Severity: Nit
*   **Affected Scope:** [riga 199](configuratore-saune-analisi-v6.md#L199)
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:*** → `- `id`; il `numero` della configurazione (formato `AAAA-NNNNNN`, P5 nella sezione 20.3) non è una colonna, ma si calcola in lettura dall'anno di creazione e dall'`id`;`

### [C40] [`egm-design`] - Severity: Nit
*   **Affected Scope:** [riga 203](configuratore-saune-analisi-v6.md#L203)
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:*** `- email del cliente;` → `- email del cliente, salvata in minuscolo, così la cancellazione per indirizzo la trova sempre;`

---

## DECLINE (Nit annotati)

| Id | Tema | Motivo |
|---|---|---|
| C29 | Registro colloquiale e prima persona (righe 143-156, 266, 391-399, 426-427) | Stile; non cambia il significato. Si può rivedere in una passata di stile finale |
| C30 | Indicazioni vaghe o riempitivi (righe 99, 180, 259, 279, 336, 362, 387) | Come C29 |
| C32 | L'avvertenza su `down -v` è lontana da `db:reset` | Posizione accettabile: sta nei prerequisiti di Docker |
| C33 | Pseudo-titoli in grassetto invece di H3 | Ristrutturazione ampia con poco beneficio |
| C34 | La 6.7 Drizzle sta sotto "Scelta del DBMS" | La 6.2 decide insieme DBMS e ORM; rinominare non aggiunge informazione |
| C35 | La sezione 5 non ha ID | La 5 è il motivo della scelta del DBMS, non un elenco di requisiti |
| C37 | Manca un indice | I visualizzatori Markdown generano l'indice dai titoli |
| C41 | `DELETE` delle righe scadute nella Server Action | La pulizia all'avvio basta per la demo (decisione esplicita, riga 381) |
| C42 | Criterio per l'SVG disegnato a mano | Rimandato: è una scelta di design emersa nello Stage 5 (G), da decidere con il censimento |
| C43 | "Il tutor inserisce un'email vera" ripetuto | La ripetizione è voluta: motiva le misure in tre sezioni diverse |
