# Stage 9: Implementation Readiness Test, round 2 (ri-audit)

- **Documento:** `configuratore-saune-analisi-v6.md`, DetailedRange 497..958, dopo le correzioni del round 1.
- **Revisori, in contesti isolati:**
  - `egm-implementation-readiness`: completed;
  - `egm-codebase-details`: completed;
  - `egm-style`: completed.
- **Limite:** questo è l'unico ri-audit ammesso per lo Stage 9. Non ci saranno altri round di revisione.

**Verdetto: non pronto, ma vicino.**
- **Il Blocker B1 è risolto**, insieme a 12 dei 16 Major del round 1.
- **Dopo aver tolto i doppioni restano** 0 Blocker, 25 Major e circa 25 Nit.
- **Quasi tutti i Major** riguardano il contratto condiviso. Vanno chiusi prima della PR del contratto della fase 2, altrimenti le scelte le farà chi scrive il codice.

## Errori miei nelle correzioni del round 1

Tre revisori su tre segnalano errori che ho introdotto io con le correzioni:
- **Foto adattata alla zona (P13):** con `patternContentUnits="objectBoundingBox"` il contenuto del pattern vive in un quadrato 1 × 1, che poi viene scalato in modo non uniforme. `slice` ritaglia quindi a un quadrato, e il risultato viene stirato. La frase "non si deforma" è falsa.
- **Chiavi `_`:** lo strip di Zod toglie **tutte** le chiavi sconosciute, non solo quelle che iniziano con `_`. Un errore di battitura come `defualt` sparirebbe senza dare errore.
- **`redirect` lato client:** "con `ok` la pagina reindirizza" non funziona senza JavaScript.
- **`photoGroup`:** l'ho aggiunto al file ma non alla tabella `product`.
- **Diagonale in resvg:** la sua verifica è rimasta "nella fase 2", ma la diagonale ora nasce nella fase 3.
- **Terzo tentativo:** la tabella delle prove dice "terzo tentativo rifiutato", ma la sezione 10.3 ammette 3 tentativi compreso il primo invio. Quello da rifiutare è il quarto.

## Stato dei finding del round 1

| Round 1 | Stato |
|---|---|
| B1 | Risolto. Lo schema della geometria però non basta (R1) |
| M1 formato `aladdin.json` | In parte: R11, R12 |
| M2 elenco dei file | In parte: R10 |
| M3 script | Risolto, ma gli script non leggono `.env` (R9) |
| M4 dipendenze | In parte: R13 |
| M5 prove | In parte: R7, R8, R19, R20, R24 |
| M6 zone interne (opzione B) | Risolto |
| M7 interfacce | In parte: R5, R6 |
| M8, M10, M12-M16 | Risolti |
| M9 fasi | Quasi: le fasi 6-8 non hanno un responsabile (Nit) |
| M11 resa della foto | Tecnica sbagliata: R2 |
| Nit 30-34 (DECLINE) | Ancora presenti, accettati come trade-off |

---

## 🟡 Major

| # | Tema | Fonti | Righe | Proposta in breve |
|---|---|---|---|---|
| R1 | **Lo schema della geometria non descrive Aladdin.** Mancano: le misure per taglio (180 e 200 cm), la fascia dello specchio e il frame, i valori di `shape` e `side`. La 9.2 e la 0016 usano campi diversi (profondità, tipo di stufa). La 0021 dice che la stufa serve solo per la pianta | IR N1, CD M3, ST M2 | 528, 297-300; 0016, 0021 | Un solo tipo completo in 15.2. Le misure che cambiano con il taglio vanno in `sizes[].attributes`. Aggiungere `mirrorBandCm` e `frameCm`, ed elencare i valori ammessi. La 9.2 rimanda alla 15.2; nota nella 0016 e nella 0021 |
| R2 | **La foto si deforma comunque** (errore mio) | IR N2, CD M9, ST M17 | 829-832, 316-318 | Un pattern per forma con `patternUnits="userSpaceOnUse"` e le misure del riquadro. Dentro, `<image>` con le stesse misure e `slice`. Gli `id` diventano `<prefisso>-<zona>-<indice>`. Va aggiornata anche la frase della 9.3 sul "cambio del riferimento" |
| R3 | **Nessuna fase prova la diagonale in resvg**, ma la diagonale è l'immagine grande del PDF | IR N3, CD M11, ST M4 | 568-569; 0021 righe 24 e 29 | Fase 3: conversione della diagonale con i 4 controlli della sezione 11; se fallisce, si usa il ripiego della 0021. Correggere la 0021 |
| R4 | **Il formato delle regole non è definito né nel file né nel database.** I codici sono unici solo dentro il gruppo | IR N4 | 231, 762-774 | `{type, from:{group,value}, to:{group,value}, message}`. Per `only_with_size`: `{type, from, sizes[], message}`. Nel database: chiave esterna verso `option_value`, `sizes` come `text[]`, `CHECK` sul tipo |
| R5 | **`valuta` non restituisce i messaggi delle scelte disattivate.** In `errori` il campo `code` è ambiguo e l'ingresso non ha un tipo | IR N5, CD Nit 10 | 811 | `disattivati: Record<group, Record<value, messaggio>>`; `errori: {tipo, group?, value?, messaggio}[]`; tipo di `config` |
| R6 | **Server Action senza JavaScript e "Riprova".** Mancano: `redirect` sul server, una form action per `riprova`, i nomi dei campi, la risposta quando l'`UPDATE` non trova righe. Se all'`INSERT` `customer_last_attempt_at` resta `NULL`, "Riprova" non parte mai | IR N6, CD M4, ST M14, Nit 13 | 804-812, 351, 364 | L'action chiama `redirect('/riepilogo/'+token)` fuori da ogni `try`, anche quando l'invio fallisce. `riprova(statoPrecedente, formData)` con il token in un campo nascosto; risposte `attendi`, `inviata`, `esauriti`. Elenco dei campi. Passo 3 della 10.2: tentativi a 1 e data dell'ultimo tentativo a `now()` |
| R7 | **La mappa degli errori di RF6 è incompleta.** Con la rete staccata arrivano `EDNS` e `ESOCKET`. La scadenza di 15 s non ha un codice. Manca il caso "altro" | IR N7, CD M8, ST M11 | 636, 97, 353 | Tabella di 5 righe con il testo di ogni messaggio. `sendMail` non accetta `AbortSignal`: si usa `Promise.race` e poi `transporter.close()` |
| R8 | **L'ambiente delle prove non è definito.** Le prove con il database scrivono sul database di sviluppo. Playwright con il `.env` della demo manda email vere con Gmail. Manca `next build`. Manca dove sta Mailpit | IR N8, CD M7, ST Nit 9 | 626-641 | Database `configuratore_test` con `test:setup`. Vitest in serie con `TRUNCATE` tra un file e l'altro. `webServer.env` verso Mailpit e il database di prova. `next build && next start`. Mailpit nel PATH oppure in `MAILPIT_BIN` |
| R9 | **Gli script non leggono `.env`.** `tsx` e `drizzle-kit` non lo caricano | IR N9, CD M6 | 546-552 | `tsx --env-file=.env` negli script e `process.loadEnvFile()` in `drizzle.config.ts` |
| R10 | **L'elenco dei file è incompleto e i proprietari si contraddicono.** Mancano le pagine P6, il file `'use server'`, il route handler, `vitest.config.ts`, `playwright.config.ts`, `docker-compose.yml`, `components.json`, `public/texture/`, il mockup. `public/` e `src/app/` sono di M, ma ci lavora anche N | IR N10, CD M10, ST M1, IR Nit 4 | 503-523 | Righe aggiuntive con percorso completo, responsabile e fase (ad esempio `src/app/azioni.ts`, N). Eccezioni scritte nella tabella dei ruoli |
| R11 | **Schede e `aladdin.json` non sono allineati.** La 0018 e la riga 88 del JSON dicono "togliere le chiavi `_` prima del seed". La 0015 e la 0019 dicono ancora `runtime = 'nodejs'` e "variabile dedicata". La 0014 non cita le texture tra gli avvisi. La 0007 parla di "persona fisica" e di una sola base giuridica | IR N11, CD M1, Nit 7-8, ST M5, M16 | P1 759; schede | Strip con `z.preprocess` per le chiavi `_`, poi `.strict()`. Note datate nelle schede 0007, 0014, 0015, 0016, 0018, 0019 e 0021. Correggere la nota del JSON |
| R12 | **`photoGroup` non ha una colonna** (errore mio). `caricaProdotto` non restituisce "lo stesso tipo" | CD M2, IR Nit 3 | 226, 516 | Colonna `photo_group` (nullabile); tipo `Omit<ProdottoFile,'schemaVersion'>` |
| R13 | **Dipendenze incomplete**: `react-dom`, i `@types/*`, i pacchetti reali di Tailwind e di shadcn. `shadcn init` crea anche dei file | CD M5, IR Nit 5, ST Nit 3 | 533 | Lista completa. Scaffold con `create-next-app` e `shadcn init` nella fase 2; quello che installano fa parte della lista iniziale |
| R14 | **Font nel browser.** `next/font/local` genera un nome di famiglia offuscato, quindi `font-family="Jost"` nell'SVG funziona in resvg ma non nel browser. Non è detto se l'anteprima è un SVG inline | CD M11, ST Nit 15 | 836, 316 | `@font-face` con `font-family: 'Jost'` sugli stessi TTF, oppure la famiglia passata in `opzioni`. Anteprima come SVG inline |
| R15 | **RNF3 dice "un solo comando"**, il criterio 1 dice `npm ci` + `npm run demo` | ST M6, IR Nit 1 | 103, 586 | Allineare RNF3 |
| R16 | **Criteri 1 e 4: dove e quando si verificano.** Nella fase 8 il tutor non c'è. Il computer della demo è indicato come uno dei portatili alla riga 14 e come un terzo computer alla riga 442 | ST M7, IR Nit 12 | 584-594, 574 | Fase 8 sul portatile che non ospita la demo, con un indirizzo di prova. Fase 9 sul computer della demo. Allineare le righe 14 e 442 |
| R17 | **Criterio 2: non è detto quando il ripiego è ammesso.** Il terzo prodotto non è in nessuna fase prima della 6 | ST M8 | 589, 308 | Ripiego ammesso solo se il secondo prodotto supera la soglia della 9.2, punto 5. "Aladdin con la frontale e, se pronta, la diagonale" |
| R18 | **Criterio 5 non eseguibile.** Con Mailpit una password sbagliata non dà errore. Non si sa quale stato controllare. Manca la pausa di 30 s prima di "Riprova" | ST M9 | 598 | Con Gmail, due prove separate. Si controlla `customer_status`. Si ripristina la causa, si attendono 30 s, poi "Riprova" |
| R19 | **Terzo o quarto tentativo** (errore mio) | ST M10 | 633, 364 | "Il quarto tentativo (terzo "Riprova") è rifiutato" |
| R20 | **Il rifiuto del server non è provato.** L'interfaccia riporta l'URL ai valori predefiniti, quindi Playwright non arriva mai a una combinazione non valida | ST M12 | 637, 593, 801 | Due righe di prova. Una Server Action chiamata con una combinazione non valida risponde `ok: false` e non crea righe. In P7: una combinazione incompatibile nell'URL torna ai valori predefiniti |
| R21 | **"Predefinito non disattivabile" non dice cosa controlla il seed.** Un `excludes` sul predefinito crea un ciclo | ST M13, CD Nit 9, IR Nit 9 | 773 | Il seed rifiuta un predefinito che compare come bersaglio di una regola. In alternativa, si torna al primo valore attivo |
| R22 | **"Identificatori in inglese"** contro `caricaProdotto`, `inviaRiepilogo`, `errori`, e `{group, code, messaggio}` che mescola le due lingue | ST M15 | 265, 516, 807-811 | Regola ristretta: inglese per database e file del catalogo, italiano per funzioni e file del progetto. Riga 811 in una sola lingua |
| R23 | **`/galleria` mostra solo i materiali predefiniti**, quindi il criterio della 9.1 ("ogni materiale si riconosce") non si può controllare lì | ST M18 | 282, 642 | La galleria mostra anche una riga per ogni gruppo, con tutti i suoi valori |
| R24 | **Criterio 7: "funzionano" non è verificabile**, e manca la prova di `--email` | ST M19 | 600, 634 | Prova di `npm run clean -- --email` (anche con le maiuscole). Il criterio 7 rimanda alla sezione 18 |
| R25 | **"Vista frontale del mockup" è ambigua.** Il mockup ha "Esterno" e "Interno (frontale interna)" | ST M3 | 568, 292 | "La vista 'Esterno' del mockup diventa la frontale; 'Interno' si toglie; la diagonale è nuova" |

## 🟢 Nit

- **Script npm:**
  - per l'email si scrive `npm run clean -- --email <indirizzo>`;
  - mancano gli script `db:generate` e `dev`;
  - va detto come si avvia Mailpit in sviluppo;
  - va detto cosa confronta il controllo "migrazioni applicate";
  - il titolo della 15.3 va cambiato in "Migrazioni e script npm".
- **Docker:**
  - va dato un nome al servizio Docker (`db`) e scritto il comando `psql` completo, legato alla `DATABASE_URL`;
  - va detto dove sta `docker-compose.yml` nella fase 1, prima che esista il repository.
- **SMTP:** con Mailpit l'opzione `auth` va omessa; `SMTP_SECURE` va convertito in booleano.
- **Prove:**
  - la prova del `request_id` è in Vitest nella tabella e in Playwright nella 0024;
  - la prova del seed non tocca una regola, come chiede la 0022;
  - nella tabella 18 la colonna "Tipo" diventa "Strumento";
  - "come descritto" va sostituito con l'esito;
  - la prova del PDF va dentro la tabella;
  - in axe i livelli sono `serious` e `critical`.
- **Fasi:**
  - va detto chi passa `viewer` da `image` a `svg`;
  - le fasi 6-8 non hanno un responsabile;
  - nella fase 2 va scritto l'ordine: prima il porting, poi la prova del PDF;
  - "scrive la scheda" va sostituito con "aggiorna la 0015".
- **Contenuti da aggiungere:**
  - va indicata la fonte dei TTF statici (cartella `static/` di Google Fonts);
  - va scritto il formato di `Content-Disposition`;
  - per un prodotto inesistente `/configura/[prodotto]` risponde `notFound()`;
  - con `texture: null` per l'alluminio il generatore usa `color`.
- **Riformulazioni:**
  - la frase della riga 728 è circolare ("prese … sono prese") e "l'autore" non è definito;
  - in P1 le voci sui codici vanno unite e le zone vanno chiamate "zone dei gruppi";
  - in P2 la voce della riga 773 va divisa in più voci;
  - "gestiscono male" (P14) va precisato;
  - "regge" (P13) va precisato;
  - "leggibile" (9.1) va precisato;
  - le panche nella vista dal vetro sono "semplificate".
- **Sezione 23:** mancano le righe per i cambi delle schede 0021-0024; il nome del file del mockup va scritto in P15 e nell'appendice B.
- **Fasi nel testo:** "fase di inserimento" va scritto "fase 6", e nella riga 505 la parte "Dalla fase 2" va spostata in una colonna propria.
- **Blocchi:** il "blocco delle funzioni" (fase 7) e il blocco dello schema (fase 4) vanno distinti nel glossario.

## Sintesi per decidere

- **Correzioni tecniche, molte sono errori miei:** R2, R6, R9, R11, R12, R13, R14, R19. Non richiedono decisioni nuove.
- **Precisazioni senza vere scelte:** R3, R5, R7, R8, R10, R15, R16, R18, R20, R22-R25 e i Nit.
- **Piccole decisioni di contratto, da prendere con Marko:**
  - R1: i campi della geometria;
  - R4: il formato delle regole;
  - R17: la soglia del ripiego;
  - R21: il comportamento con un predefinito bersaglio di una regola.

  Per ciascuna ho una proposta concreta.

---

# Stage 9: Implementation Readiness Test, round 1

- **Documento:** `configuratore-saune-analisi-v6.md`, DetailedRange righe 491..892 (dalla sezione "## 15. Organizzazione del lavoro" alla fine)
- **Contesto Goldfish:** `docs-iniziali/docs/decisioni/` (README, 0001-0020), `data/prodotti/aladdin.json`
- **Revisori, in contesti isolati:**
  - `egm-implementation-readiness`: completed;
  - `egm-codebase-details`: completed;
  - `egm-style`: completed.

**Verdetto: non pronto per l'implementazione.**

Dopo aver tolto i doppioni restano:
- 1 Blocker;
- 16 Major;
- 18 Nit.

Un Major è già risolto in parte. Due revisori su tre danno lo stesso verdetto, "non pronto". Il terzo è lo style, che non dà un verdetto.

Non c'è codice applicativo. Il piano è stato confrontato con `aladdin.json`, con le schede e con il comportamento noto delle librerie citate.

## Controlli superati (codebase-details)

- I link alle schede puntano a file esistenti. Titoli e stati coincidono con il README: l'ho riverificato per 0007, 0015 e 0016, quindi il Nit dello style su questo punto non è confermato.
- La corrispondenza tra P1-P15 e le schede (riga 676) è corretta.
- L'appendice A coincide con `aladdin.json` su designer, tagli 45 e 60 con le misure, materiali e pedana con predefinito `none`.
- Sono corretti `drizzle-kit generate`, `push` e `studio`, `save-exact=true`, `randomBytes(...).toString('base64url')` e `@axe-core/playwright`.
- resvg supporta `feTurbulence` e `objectBoundingBox`.

---

## 🔴 Blocker

### B1. Le cose da cui dipende la prova del PDF della fase 2 non hanno responsabile né fase
- **Fonti:** implementation-readiness B1; codebase-details M2 e N5.
- **Righe:** 499, 536-537, 772-777, 884.
- **Problema:** la prova del PDF con l'immagine, poi lo scheletro della fase 3, richiedono quattro cose:
  1. il generatore delle viste portato dal mockup P15 a funzione pura;
  2. il mockup salvato in `docs/mockup/`, che oggi è solo un artifact su claude.ai;
  3. lo schema Zod della geometria;
  4. la `geometry` di Aladdin, che in `aladdin.json` vale `null`.

  La tabella 15.5 non assegna nessuna di queste cose prima della fase 2. La riga 499 dà a N la trascrizione della geometria solo nella fase di inserimento dei prodotti (fase 6). Inoltre non è deciso se Zod accetta `viewer: "svg"` con `geometry: null`: se lo rifiuta, il seed fallisce sulla bozza attuale.
- **Proposta:**
  - un compito di porting del mockup per M nella fase 2, con il nome del file in `docs/mockup/`;
  - la geometria di Aladdin a N nella fase 2 e quella del secondo prodotto nella fase 3;
  - i campi minimi dello schema della geometria;
  - la regola Zod "viewer = svg ⇒ geometry obbligatoria", con la bozza attuale marcata `viewer: "photo"` finché la geometria manca.
- **Collegamento con lo Stage 8:** è lo stesso nodo di M-E, la geometria nel contratto prima del censimento. Se si sceglie di togliere la geometria dal contratto iniziale, il Blocker cambia forma ma resta: qualcuno deve comunque produrre la geometria di Aladdin prima della prova del PDF.

---

## 🟡 Major

### M1. Il formato di `aladdin.json` non coincide con quello che il documento descrive
- **Fonti:** codebase-details M1, N1 e N2; style M5; implementation-readiness Nit sulle chiavi `_`, `.strict()`, `size` e `material.type`.
- **Righe:** 259, 261, 700-702, 222, 506, 762.
- **Problema:** la frase "la bozza di Aladdin segue già questo formato" (riga 702) non regge per sette motivi:
  - il campo `_assetSources`, con gli URL `static.effe.it`, non è mai nominato. Non è deciso chi scarica texture e foto in `public/` né se vanno nel commit;
  - non è deciso se Zod rifiuta (`.strict()`) o ignora le chiavi `_*`. "Va tolto prima del seed" vuol dire a mano, ma Marko importa il file già dalla fase 2;
  - `schemaVersion: 1` sta al primo livello del file. La tabella `product` non ha una colonna corrispondente e non è detto cosa ne fa il seed;
  - `material.type` ha valori in italiano (`legno`, `specchio`, `alluminio`, `gres`), contro la regola della riga 261 sugli identificatori in inglese;
  - il formato delle chiavi di `photos` (`"45/rovere"`) non è documentato e non si sa come si estende ai prodotti di livello B;
  - `size` è citato tra i gruppi e `mirror`/`frame` tra le zone fisse, ma nel file i tagli sono l'array `sizes`. P7 usa `size=60` come se fosse un gruppo;
  - manca la regex dei codici. Nel file ci sono codici con trattino (`rovere-rigatino`) e codici numerici (`45`).
- **Proposta:** una tabella di 6-8 righe "file attuale → contratto" che decida ogni punto. Per i codici, `^[a-z0-9-]+$`. Togliere la frase della riga 702 oppure renderla vera.

### M2. Manca l'elenco dei file, con responsabile e fase
- **Fonti:** implementation-readiness M2; codebase-details M12.
- **Righe:** 497, 505-511.
- **Problema:** la sezione 15.1 elenca solo cartelle. Non sono nominati:
  - i file di configurazione: `drizzle.config.ts`, `next.config.ts`, `.npmrc`, `.gitattributes` (con il contenuto), `.env.example`, `vitest.config.ts`, `playwright.config.ts`;
  - i file in `src/contratti/`, `src/db/` e `src/server/`;
  - gli script e i file di prova.

  Le cartelle `src/contratti/`, `data/prodotti/`, `src/fonts/`, `docs/` e quella delle prove non hanno un proprietario.
- **Proposta:** una tabella "percorso, contenuto, responsabile, fase". Non serve un elenco completo: bastano i file del contratto e della fase 3.

### M3. Gli script npm non sono definiti e "senza passaggi manuali" non regge
- **Fonti:** implementation-readiness M3; codebase-details M13.
- **Righe:** 520, 538, 554, 568, 436.
- **Problema:**
  - da un clone pulito serve `npm ci` prima di `npm run demo`: è un passaggio manuale, oppure va dentro lo script;
  - non è definito cosa fa `db:reset` (`down -v` più migrate e seed, oppure `DROP SCHEMA`);
  - non è definito come si applicano le migrazioni: con `drizzle-kit migrate` o con il migrator di `drizzle-orm`;
  - non è detto cosa confronta il controllo "migrazioni applicate", ad esempio `__drizzle_migrations` con `_journal.json`;
  - mancano nome e argomenti degli script di seed, pulizia, cancellazione per email, test e orchestrazione di demo.
- **Proposta:** una tabella "nome in `package.json`, file, argomenti, cosa fa".

### M4. Le dipendenze non sono elencate e il driver del database non è scelto
- **Fonti:** implementation-readiness M4; codebase-details M5 e M6.
- **Righe:** 174, 469, 511, 525, 748; scheda 0015.
- **Problema:**
  - la riga 511 cita "la lista fissa delle dipendenze", che non esiste, e la riga 525 la contraddice;
  - il driver resta "`postgres.js` o `pg`";
  - mancano `tsx` o un equivalente per gli script, `@types/nodemailer`, `@types/pdfkit`, `@playwright/test`, Tailwind con la CLI di shadcn, e Mailpit con il modo di installarlo su Windows;
  - `serverExternalPackages` cita solo PDFKit. `@resvg/resvg-js` è un modulo nativo e di solito va esternalizzato anche lui.
- **Proposta:**
  - una lista con i nomi dei pacchetti;
  - scegliere `postgres.js`, già usato nell'esempio della riga 469;
  - `serverExternalPackages: ['pdfkit', '@resvg/resvg-js']` già nella PR del contratto.

### M5. La sezione 18 non ha casi di prova concreti
- **Fonti:** implementation-readiness M5; codebase-details, lacuna del piano di prova; style M7 e Nit "poche prove" (riga 592).
- **Righe:** 566, 592-596; casi citati alle righe 403, 449, 723.
- **Problema:**
  - "poche prove automatiche", senza un elenco;
  - non sono prove i casi limite che il documento cita: `valuta` sui tre tipi di regola, `request_id` duplicato, due "Riprova" in contemporanea, terzo tentativo rifiutato, pulizia con una riga retrodatata, snapshot con un codice rimosso, seed, URL non validi;
  - non c'è la mappa degli errori di RF6: `ECONNECTION`, `EAUTH`, `ETIMEDOUT`, `EENVELOPE`;
  - non è detto se la prova "un PDF per prodotto" legge dai file o dal database;
  - non è detto come Playwright avvia Mailpit né quale API legge (ad esempio `GET /api/v1/messages`);
  - manca `npx playwright install`;
  - il criterio 5 dice "messaggio chiaro" senza il testo atteso né il modo di rendere sbagliata la password.
- **Proposta:** una tabella "caso, livello (unità/flusso), file, esito atteso", di 10-15 righe.

### M6. Le zone interne non si vedono nelle due viste esterne
- **Fonti:** implementation-readiness M6.
- **Righe:** decisione C28 (viste frontale e diagonale, solo esterne); zone `int`, `furn`, `floor`.
- **Problema:** con viste solo esterne, essenza interna, arredi e pedana in gres non compaiono nell'immagine. Scegliere il gres non cambia l'anteprima né il PDF.
- **Proposta, da decidere:** una delle tre strade:
  - dichiarare che quelle scelte compaiono solo nell'elenco;
  - aggiungere un riquadro o una vista dell'interno;
  - mostrare l'interno attraverso il vetro della porta nella vista frontale.

  È una decisione di design, non una correzione.

### M7. Le interfacce del server non sono specificate
- **Fonti:** implementation-readiness M7; codebase-details M4.
- **Righe:** 743, 748.
- **Problema:**
  - mancano le firme della Server Action e del Route Handler, con gli errori restituiti;
  - non è definito il comportamento con un token sconosciuto;
  - non è definita la serializzazione di `multi` nell'URL;
  - manca il tipo di ritorno di `valuta`;
  - "entrambi con `runtime = 'nodejs'`" non funziona: in un file `'use server'` si possono esportare solo funzioni async, quindi l'export lì rompe la build. Va nei file `page.tsx` e `route.ts`, e `nodejs` è già il predefinito.
- **Proposta:**
  - le firme in TypeScript, 4-6 righe;
  - una riga per ogni caso d'errore;
  - indicare i file in cui va l'export di `runtime`, oppure toglierlo.

### M8. Variabili d'ambiente senza nome; `/galleria` è spenta proprio nella demo
- **Fonti:** implementation-readiness M8; codebase-details M7 e M8; style Nit riga 741.
- **Righe:** 463, 594, 741, 753, 787.
- **Problema:**
  - `.env.example` non è elencato; l'unica variabile nominata è `DATABASE_URL`;
  - mancano i nomi della variabile dell'email del progetto e di quella di `/galleria`, e le variabili SMTP (host, porta, secure, utente, password);
  - manca il passaggio da Mailpit (`127.0.0.1:1025`, senza TLS e senza autenticazione) a Gmail (465 o 587);
  - la demo gira con `next start`, quindi `NODE_ENV=production`. Se `/galleria` è legata allo sviluppo, è spenta proprio quando la riga 594 la usa come materiale di riserva.
- **Proposta:** l'elenco di `.env.example` e una variabile esplicita per `/galleria`, attiva nella demo.

### M9. Fasi senza scaffold e responsabili mancanti
- **Fonti:** implementation-readiness M9.
- **Righe:** tabella 15.5.
- **Problema:**
  - nessuna fase crea lo scaffold del progetto;
  - il passaggio dell'interfaccia dal file al database non è assegnato;
  - il modulo dello scheletro non ha un responsabile;
  - le fasi 5, 9 e 10 non hanno responsabile;
  - lo spostamento delle schede in `docs/` non è in nessuna fase.
- **Proposta:** completare la tabella 15.5 con una riga per lo scaffold e un responsabile per ogni fase.

### M10. Lo snapshot non contiene il nome del prodotto
- **Fonti:** codebase-details M9.
- **Righe:** 250, 403, 759.
- **Problema:** l'oggetto dell'email e l'intestazione del PDF usano il nome ("sauna Aladdin"), ma lo snapshot ha solo `product: "aladdin"`. Se il prodotto esce dal catalogo, "Riprova" e "Scarica il PDF" non hanno il nome.
- **Proposta:** aggiungere `productName` allo snapshot con `schemaVersion: 1`, prima del blocco dello schema JSONB nella fase 4.

### M11. Non è specificato come la foto riempie una zona
- **Fonti:** codebase-details M10.
- **Righe:** 765, 768 (P13).
- **Problema:**
  - con `objectBoundingBox` va scelto `preserveAspectRatio`: con `none` la venatura si deforma (le foto sono 1394 × 902), con `xMidYMid slice` la foto viene ritagliata;
  - non è deciso se una zona fatta di più forme usa un riquadro per forma oppure uno per tutta la zona.
- **Proposta:** due righe che fissano le due scelte.

### M12. I file dei font non sono indicati
- **Fonti:** codebase-details M11; implementation-readiness Nit sui pesi in P14.
- **Righe:** 554, 770.
- **Problema:**
  - Jost e IBM Plex Sans si distribuiscono anche come font variabili;
  - PDFKit incorpora solo l'istanza predefinita di un font variabile, e resvg supporta poco gli assi di variazione;
  - mancano i nomi dei TTF statici, i pesi usati e il modo di trovarne il percorso a runtime.
- **Proposta:**
  - elencare i file, ad esempio `Jost-Regular.ttf`, `Jost-Medium.ttf`, `IBMPlexSans-Regular.ttf`, `IBMPlexSans-SemiBold.ttf`;
  - trovare il percorso con `path.join(process.cwd(), 'src/fonts', …)`.

### M13. P1-P15 sono dette "definitive", ma alcune sono condizionate
- **Fonti:** style M3; collegato a M-F dello Stage 8.
- **Righe:** 676 e le righe di P3 e di P12-P15.
- **Problema:** P3, P13 e P12-P15 dipendono da prove o da fonti non ancora disponibili. "Definitive" rende più difficile cambiarle e contraddice gli stati delle schede ("da verificare nella fase 3").
- **Proposta:** "decise; quelle con una condizione sono indicate", con la condizione scritta accanto a ciascuna.

### M14. Contraddizione sul tempo avanzato: rifinitura o pianta
- **Fonti:** style M6.
- **Righe:** 546, 800, 833.
- **Problema:** le righe 546 e 833 destinano il tempo avanzato alla rifinitura, la riga 800 alla vista in pianta.
- **Proposta:** scegliere una sola destinazione.

### M15. Il criterio 2 non si può verificare
- **Fonti:** style M8.
- **Righe:** 557.
- **Problema:** "possibilmente con un interno diverso" non dice quando il criterio è soddisfatto.
- **Proposta:** renderlo obbligatorio oppure toglierlo.

### M16. Parole sbagliate o vecchie
- **Fonti:** style M2.
- **Righe:** 670; scheda 0007.
- **Problema:** alla riga 670 c'è "Tutor e tutor", e la scheda 0007 dice ancora "valutatore".
- **Proposta:** correzione meccanica.

### Già risolto in parte: generazione del `request_id`
- **Fonti:** implementation-readiness M1; style M4; codebase-details M3.
- **Stato:** le righe 683 e 728 sono corrette dopo lo Stage 8 e la nota della scheda 0017 lo precisa.
- **Resta:**
  - il corpo della 0017, alla riga 16, dice ancora "generato dal client". È il problema M-H dello Stage 8: il corpo e la nota della scheda si contraddicono;
  - non è detto quando il server rigenera il `request_id`, ad esempio dopo un invio riuscito o quando il modulo si ricarica.

---

## 🟢 Nit

1. **Riga 892:** c'è una riga orfana in fondo all'appendice B, che appartiene alla tabella della sezione 23. La segnalano tutti e tre i revisori; lo style la classifica Major. È una correzione meccanica.
2. **Riga 580:** dice timeout di 10 s, mentre la nota della 0017 dice 15 s. Lo stesso errore è alla riga 11 del corpo della 0017.
3. **Riga 586:** "messaggio onesto" va sostituito con il testo del messaggio.
4. **Riga 703:** "errori chiari" va sostituito con un esempio di messaggio.
5. **Riga 812:** l'aforisma sulla slide va tolto.
6. **Riga 596:** frase da riformulare (style).
7. **Righe 764 e 768:** dicono "due strade", poi compare una terza.
8. **Riga 685:** la formulazione di P6 è da allineare al dettaglio.
9. **Riga 845:** "Motivi veri" va sostituito con "Motivi".
10. **Riga 887:** "più curata" non dice in che modo.
11. **Riga 730 (P5):**
    - `number` usa l'`id`, quindi non riparte da 1 ogni anno: va detto esplicitamente;
    - manca il fuso orario dell'anno, UTC o Europe/Rome.
12. **Riga 743 (P7):**
    - non è definito cosa succede con una chiave `multi` assente;
    - non è definito `default_value` per un gruppo `multi`;
    - non è definito cosa succede con un valore predefinito disattivato da una regola;
    - "Nessuna pedana" compare nelle `lines`.
13. **Secondo prodotto:** Aladdin 45 è un taglio dello stesso prodotto e non vale come secondo prodotto.
14. **Fase 8:** contraddizione con il computer della demo.
15. **`drizzle-kit studio`** apre un sito esterno (`local.drizzle.studio`): va detto, oppure va indicata un'alternativa.
16. **Prove di accessibilità:** axe esclude `/informativa` senza motivo.
17. **Riga 607:** quando l'analisi si sposta in `docs/analisi.md`, i link relativi alle schede e a `data/` si rompono.
18. **Fuori range, errore mio dello Stage 7:**
    - la riga 377 dice "le prime tre voci sono bloccanti, le ultime tre sono avvisi", ma le voci sono cinque;
    - alla riga 203 la voce sulle texture non è classificata.

**Non confermato:** lo style segnalava che gli stati di 0007, 0015 e 0016 nella tabella dell'analisi sono diversi dal README. Li ho confrontati: coincidono. Il finding è scartato.

---

## Tabella di tracciabilità

| Voce consolidata | implementation-readiness | codebase-details | style |
|---|---|---|---|
| B1 | B1 | M2, N5 | — |
| M1 | Nit (`_`, strict, `size`, `material.type`) | M1, N1, N2 | M5 |
| M2 | M2 | M12 | — |
| M3 | M3 | M13 | — |
| M4 | M4 | M5, M6 | — |
| M5 | M5 | lacuna sulle prove | M7, Nit 592 |
| M6 | M6 | — | — |
| M7 | M7 | M4 | — |
| M8 | M8 | M7, M8 | Nit 741 |
| M9 | M9 | — | — |
| M10 | — | M9 | — |
| M11 | — | M10 | — |
| M12 | Nit sui font | M11 | — |
| M13 | — | — | M3 |
| M14 | — | — | M6 |
| M15 | — | — | M8 |
| M16 | — | — | M2 |
| `request_id` (in parte risolto) | M1 | M3 | M4 |
| Nit 1 | Nit 892 | N7 | M1 |
| Nit 2 | Nit 10 s/15 s | — | Nit 580 |
| Nit 3-10 | — | — | Nit |
| Nit 11 | Nit sul fuso orario | N4 | Nit 730 |
| Nit 12 | Nit sul predefinito e su `multi` | N3 | — |
| Nit 13-16 | Nit | — | — |
| Nit 17 | — | N6 | — |
| Nit 18 | — | fuori range | — |
| Scartato | — | stati confermati | Nit sulla tabella delle schede |

## Sintesi per decidere

- **Correzioni meccaniche:**
  - Nit 1, 2, 18;
  - M16;
  - il corpo della 0017 alla riga 16.
- **Contenuto da aggiungere senza nuove decisioni**, cioè elenchi e tabelle che fissano cose già implicite: M2, M3, M5, M7, M8, M9, M10, M12.
- **Decisioni che spettano a te e a Marko:**
  - B1: chi produce la geometria di Aladdin e quando; si lega a M-E dello Stage 8;
  - M1: chiavi `_`, lingua di `material.type`, `schemaVersion`;
  - M4: il driver;
  - M6: le zone interne nelle viste esterne;
  - M11: la resa della foto;
  - M13 e M14.
