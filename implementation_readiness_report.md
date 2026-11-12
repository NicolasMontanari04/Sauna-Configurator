# Stage 9: Implementation Readiness Test, round 1

- **Documento:** `configuratore-saune-analisi-v7.md`. Copia salvata in `archivio/revisione-v7/configuratore-saune-analisi-v7-prima-dello-stage9.md`.
- **Intervallo:** DetailedRange 547..1157 (sezioni 15–26)
- **Standard:** `implementation-readiness-standard`, applicato da implementation-readiness e codebase-details. Style ha usato le regole della propria persona.
- **Contesto Goldfish:**
  - `docs-iniziali/docs/decisioni/` (0001–0030);
  - `data/prodotti/aladdin.json`;
  - `docs/mockup/`;
  - `archivio/script-viste/`;
  - `contesto-web/`.
- **Revisori, in contesti isolati:** `egm-implementation-readiness`: completed; `egm-codebase-details`: completed; `egm-style`: completed.
- **Revisione della v6:** `archivio/revisione-v6/implementation_readiness_report.md`

**Esito:** il piano non è ancora pronto per partire. Dopo aver unito i doppioni restano **2 Blocker, 20 Major e 22 Nit**.

I revisori riconoscono come concreti:
- il calendario e i ruoli;
- le firme delle Server Action;
- l'SQL dell'appendice C.

Le lacune si concentrano in due punti:
- **il contratto delle viste.** È la prima PR, e dopo si cambia solo con una PR discussa;
- **l'ambiente delle prove.** Qui c'è il rischio di mandare email vere dall'unico account Gmail.

Il revisore codebase-details ha verificato sul mockup diversi punti e li ha trovati corretti:
- i `viewBox` non quadrati;
- `fill-rule: evenodd`;
- l'ordine di `glass` e dell'ombra;
- la fusione `multiply` delle texture;
- la rotazione di `roof` e `bench`;
- il colore di `metal`;
- i comandi di Drizzle, Next.js, Vitest e Mailpit citati.

Alcune affermazioni sul comportamento delle librerie i revisori le segnano "da verificare", perché non si potevano controllare sui file locali. Le riporto con la stessa etichetta.

**Il mio controllo sui risultati.** Prima di scrivere il report ho controllato a mano tre cose:
- IR18 è fondato: l'appendice B (r. 1138) dice che le viste di Aladdin 60 sono state "prodotte in chat dal modello 3D".
- IR12 è fondato: P1 (r. 879) dice "il file si usa così com'è sia dal seed sia dall'interfaccia".
- IR16 è fondato: la tabella 20.1 (r. 816, 819) scrive ancora "prova nella fase 1" come se fosse da fare, e la 20.5 (r. 973) chiede ancora di annotarne l'esito.

**Correzioni del mio round 1 che hanno lasciato tracce.** Due risultati vengono da correzioni che ho applicato io nello Stage 7:
- **IR5:** con D10 le cause sono diventate cinque, ma P8 dice ancora "una delle quattro".
- **IR8 e IR17:** con D4 ho aggiunto la prova "vista malformata", e il ripiego non è definito in un modo che si possa provare.

---

## 🔴 Blocker

### IR-B1. Il contratto delle viste non dice come si legge un SVG né cosa può contenere
- **Fonte:** readiness B1, codebase M4.
- **Dove:** 15.2 (r. 594–612), prova sul formato in sez. 18 (r. 727), `componiVista` (r. 604–612), appendice C (r. 1157).
- **Problema:** tre parti del contratto devono leggere un SVG: la prova sul formato, il controllo delle proporzioni e `componiVista`, che gira sia nel browser sia in Node. Però:
  - in Node non c'è `DOMParser`, e nella lista delle dipendenze non c'è un parser XML;
  - non è definita la radice `<svg>`: quali attributi sono ammessi (`xmlns`, `viewBox`, `width`, `height`) e se è ammesso `<g>`. resvg potrebbe rifiutare un SVG senza `xmlns` (da verificare);
  - non è detto quali comandi può usare `d`. Il mockup usa solo `M`, `L` e `Z` assoluti, ma una vista prodotta in chat può contenere curve o comandi relativi, e allora il riquadro non si calcola leggendo le coordinate una per una;
  - non è detto cosa fa `componiVista` con un file fuori formato.
- **Perché blocca:** è una scelta di dipendenza che lo standard non lascia a chi scrive il codice, e dopo la prima PR cambierebbe tutte le viste e la prova.
- **Proposta:** aggiungere al formato in 15.2:
  - radice `<svg xmlns="http://www.w3.org/2000/svg" viewBox="…">`, senza altri attributi;
  - figli `<path …/>` diretti, senza `<g>`;
  - `d` solo con `M`, `L`, `Z` assoluti, regola da scrivere anche nel testo della richiesta in `docs/viste.md`;
  - lettura con un'espressione regolare in `src/lib/viste/leggiVista.ts`, senza dipendenze nuove;
  - `componiVista` che lancia `VistaNonValida` se il file non rispetta il formato.

### IR-B2. Le prove possono mandare email vere dall'unico account Gmail
- **Fonte:** readiness B2, codebase M9 e M10.
- **Dove:** 15.3 (r. 636–640), ambiente delle prove in sez. 18 (r. 744–748).
- **Problema:**
  - "Una prova non manda mai email vere" vale solo per Playwright. Per Vitest il documento non dice cosa contiene `.env.test`, né come lo si carica: `vitest run` non lo legge da solo, e `loadEnv` di Vite legge anche `.env`, dove ci sono le credenziali Gmail.
  - Le prove "Vitest + database" che chiamano `inviaRiepilogo` non hanno un server SMTP: Mailpit lo avvia solo Playwright.
  - Anche per Playwright `next start` carica `.env`. L'`env` esplicito non azzera `SMTP_USER` e `SMTP_PASSWORD` e non imposta `ENABLE_GALLERY`, quindi `/galleria` non c'è durante le prove.
  - Per le migrazioni di prova, `drizzle.config.ts` chiama `process.loadEnvFile()`, e non è chiaro quale `DATABASE_URL` prevalga. Inoltre `configuratore_test` va creato collegandosi a un altro database, e `CREATE DATABASE` non ha `IF NOT EXISTS`.
- **Perché blocca:** una scelta sbagliata manda email vere da un Gmail nuovo. Il blocco di quell'account è un rischio "Alto" della 20.1, senza un secondo account.
- **Proposta:**
  - scrivere il contenuto completo di `.env.test`: `DATABASE_URL` di prova, `SMTP_HOST=127.0.0.1`, `SMTP_PORT=1025`, `SMTP_SECURE=false`, utente e password vuoti, `MAIL_FROM` e `PROJECT_EMAIL` di prova;
  - `vitest.config.ts` legge solo `.env.test`, per esempio con `process.loadEnvFile('.env.test')` in `setupFiles`, e si ferma se `SMTP_HOST` è diverso da `127.0.0.1`;
  - scegliere una sola strada per l'SMTP delle prove Vitest: un server avviato dalla prova stessa, oppure Mailpit avviato a mano;
  - `scripts/prepara-test.ts` controlla `pg_database` e crea il database se manca, poi esegue `migrate()` di `drizzle-orm/postgres-js/migrator` senza `drizzle-kit`. Stessa cosa in `avvio-demo.ts`;
  - nell'`env` di Playwright aggiungere `SMTP_USER=''`, `SMTP_PASSWORD=''`, `ENABLE_GALLERY=true` e `PROJECT_EMAIL` di prova. Va verificato che Next non sovrascriva le variabili vuote.

---

## 🟡 Major

### Contratto e codice

**IR1. L'elenco dei file non basta come elenco dei file ammessi** (readiness M1, codebase M1)
- **Dove:** 15.1, r. 561–585.
- **Problema:**
  - Al posto dei file ci sono cartelle intere: `src/components/`, `src/lib/viste/`, `test/unit/`, `test/e2e/`, `docs/`.
  - Manca una colonna che dica se il file si crea, si modifica o si cancella.
  - Mancano alcuni file:
    - `layout.tsx`, `globals.css`, `postcss.config.mjs`, la configurazione di ESLint e `.gitignore` con `.env`;
    - il file di `componiVista` e quello delle costanti;
    - la funzione che normalizza un URL sbagliato;
    - le funzioni di avvio e di pulizia richiamabili dalle prove.
  - Manca anche lo spostamento di `docs-iniziali/docs/decisioni/` in `docs/decisioni/`.
  - Il pannello dei materiali è un componente React, ma sta in `src/lib/viste/`.
- **Proposta:** percorsi esatti e una colonna "Azione". Le cartelle restano ammesse solo per `public/viste/<prodotto>/<taglio>/`.

**IR2. Scaffold: comando e dipendenze non sono fissati** (readiness M2 e N6, codebase M12)
- **Dove:** 15.2, r. 614; fase 2, r. 656.
- **Problema:**
  - `create-next-app` rifiuta probabilmente una cartella con file già presenti (da verificare).
  - Le risposte che chiede durante l'installazione non sono decise: linter, Turbopack, alias, gestore dei pacchetti.
  - Anche le scelte di `shadcn init` non sono decise.
  - La lista "esatta" delle dipendenze è probabilmente superata, per esempio `tw-animate-css`, il pacchetto unico `radix-ui` ed ESLint (da verificare).
  - Non è detto quali componenti shadcn si aggiungono.
- **Proposta:**
  - scrivere il comando completo, eseguito in una cartella temporanea da cui poi si copiano i file;
  - fissare le opzioni di `shadcn init`;
  - elencare i componenti: `dialog`, `button`, `radio-group`, `checkbox`, `input`, `label`;
  - dichiarare che la lista definitiva delle dipendenze è il `package.json` prodotto nella PR del contratto.

**IR3. Lo schema Drizzle e lo schema Zod non hanno tipi né campi obbligatori** (readiness M3)
- **Dove:** 15.2, r. 590–593.
- **Problema:** mancano:
  - i nomi delle colonne di `configuration` per email, data e versione dell'informativa, data di creazione;
  - il tipo di `zones`;
  - il collegamento tra valore e materiale, e cosa succede alle righe collegate quando se ne cancella una (`onDelete`);
  - quali colonne sono `NOT NULL`;
  - quali campi di `ProdottoFile` sono obbligatori e quali facoltativi;
  - quali tipi di materiale richiedono una `texture`.
- **Proposta:** una tabella con colonna, tipo, nullabile e vincolo, in 15.2 o in un nuovo 8.3. Aggiungere una riga per ogni campo di `ProdottoFile`, con obbligatorio o facoltativo e il valore predefinito.

**IR4. `valida` non può segnalare un prodotto inesistente, e manca la funzione per gli URL sbagliati** (readiness M4)
- **Dove:** P8, r. 915–921; sez. 18, r. 725; P7, r. 903.
- **Problema:**
  - `valida(config, prodotto)` riceve già il prodotto, quindi non può dire che il prodotto non esiste.
  - `valida` restituisce solo errori, e da questi non si può ottenere una configurazione corretta.
  - Non ci sono i testi degli avvisi.
- **Proposta:**
  - `valida(config, catalogo)`;
  - una nuova funzione `normalizza(query, catalogo) → { config, avvisi }`;
  - testi fissati, per esempio "Il valore «x» non esiste: è stato scelto «y»".

**IR5. Le cause dell'invio non sono definite fino in fondo** (readiness M5; nasce in parte dalla mia correzione D10)
- **Dove:** P8, r. 909–913; appendice C, r. 1150.
- **Problema:**
  - P8 dice "una delle quattro di RF6", ma dopo D10 le cause sono cinque.
  - Le cause non hanno un codice da usare nel tipo.
  - Non è detto cosa contiene `customer_error`.
  - Mancano i testi degli errori di validazione e la chiave sotto cui finisce un errore della configurazione.
  - I nomi dei gruppi possono coincidere con i campi del modulo.
  - Manca la formula di `puoRiprovare`.
- **Proposta:**
  - `causa: 'non-raggiungibile' | 'accesso-rifiutato' | 'tempo-scaduto' | 'indirizzo-rifiutato' | 'imprevisto'`;
  - `customer_error` uguale a `"<causa>:<codice>"`;
  - una tabella dei messaggi di validazione, con la chiave `config` per gli errori della configurazione;
  - lo schema Zod rifiuta i gruppi chiamati come i campi del modulo;
  - `puoRiprovare = customer_status === 'failed' && customer_attempts < 3`.

**IR6. `componiVista`: costanti senza valori, e l'opzione `dataUri` non si può realizzare** (readiness M6, codebase M5, M6 e N5)
- **Dove:** 15.2, r. 603–612; P13, r. 938–944.
- **Problema:**
  - I valori ci sono già nel mockup (r. 618), ma il documento non li riporta: scurimento `color-mix` al 0, 6, 13, 21, 30 e 40%; bordo 1.2 con giunzioni `round`; `glass` #e4eef0 con opacità .1; `stove` #3a3a3c; ombra #000 .28 con sfocatura 24; pattern 900×582; `floor` senza materiale #cfcdc8.
  - Questi numeri valgono per un `viewBox` largo 2000, mentre il contratto lascia il `viewBox` libero.
  - Nel mockup la stufa ha sei livelli d'ombra, ma la 9.3 dice "colore pieno".
  - Una funzione pura che gira anche nel browser non può leggere i file JPG per farne data URI.
  - Non è detto che cosa restituisce la funzione.
- **Proposta:**
  - scrivere i valori in 15.2, con la nota "presi dal mockup";
  - imporre una larghezza di 2000 nel contratto, oppure scalare i valori in proporzione;
  - il chiamante sul server passa già i data URI, e l'opzione si toglie;
  - `stove` usa `data-shade`;
  - riusare `SH` e `mix()` da `archivio/script-viste/prova-genera.mjs` (r. 68, 135), ma non i suoi colori del vetro.

**IR7. La conversione delle viste del mockup non dice con quale strumento si fa** (readiness M7, codebase M11)
- **Dove:** appendice C, r. 1157; r. 571; fase 2.
- **Problema:**
  - Le viste stanno nell'oggetto `AVIEW` alla riga 618 dell'HTML: si possono estrarre con `JSON.parse`.
  - Non è detto se la conversione si fa a mano, in chat o con uno script.
  - La Pianta non ha il poligono dell'ombra, quindi la regola deve dire "se c'è".
  - Non è detto se anche `glass` riceve `fill-rule="evenodd"`, come nel mockup.
- **Proposta:** uno script usa e getta `scripts/converti-mockup.ts`, eseguito una volta e poi archiviato. Correggere i due dettagli.

**IR8. Il codice degli script non si può provare così com'è descritto** (readiness M8, codebase M7)
- **Dove:** sez. 18, r. 729 e 732–735; 15.3.
- **Problema:**
  - Il seed, l'avvio e la pulizia sono script, ma le prove devono importare funzioni.
  - Il seed di prova deve poter usare un'altra cartella e poi ripristinare il catalogo.
  - Il server SMTP "muto" non è descritto.
  - Con quel server scatta prima `greetingTimeout` (circa 10 s), quindi la scadenza di 15 s non viene mai provata.
  - La prova dura più del `testTimeout` predefinito di Vitest, che è 5 s.
- **Proposta:**
  - le funzioni da esportare: `seed(db, cartella)`, `segnaPendingFailed(db)`, `pulisci(db, {email})`;
  - i file di prova in `test/fixtures/`;
  - il server muto come `net.createServer`;
  - le scadenze come parametri del modulo di invio, con valori brevi nelle prove;
  - `testTimeout` fissato in `vitest.config.ts`.

**IR11. Lo schema Zod condiviso con il browser controlla file su disco** (codebase M3)
- **Dove:** r. 593 e 602.
- **Problema:** i controlli "i tre file esistono" e "le zone delle viste hanno un materiale" leggono il disco. Lo schema però lo usa anche l'interfaccia, dove `fs` non c'è.
- **Proposta:** una funzione solo server, `src/server/controllaViste.ts`, chiamata dal seed e dalla prova.

**IR12. P1 contraddice la fase 3** (codebase M2)
- **Dove:** r. 879.
- **Problema:** P1 dice "il file si usa così com'è sia dal seed sia dall'interfaccia". La scheda 0022 e la sez. 8.2 dicono invece che dalla fine della fase 3 l'interfaccia legge solo dal database.
- **Proposta:** "l'interfaccia importa i file solo fino alla fase 3".

**IR13. `transporter.close()` probabilmente non interrompe un invio già partito (da verificare)** (codebase M8)
- **Dove:** appendice C, r. 1147–1148.
- **Problema:** senza pool, `close()` non chiude la connessione aperta da `send()`. L'email può quindi partire dopo che la riga è già `failed`, e "Riprova" manderebbe un doppione.
- **Proposta:** verificarlo sulla versione fissata di Nodemailer. Poi due strade: dichiararlo come rischio accettato in 10.3, oppure usare `pool: true` con `maxConnections: 1`.

### Calendario e criteri

**IR9. La fase 2 non ha un ordine interno né un criterio di fine** (readiness M9)
- **Dove:** 15.5, r. 653–664.
- **Problema:** la prova del PDF di N dipende da `componiVista` e dalle viste convertite, che fa M nella stessa fase. Nessuna fase dice quando è conclusa.
- **Proposta:** un ordine per mezze giornate nella fase 2, e per ogni fase una riga "fatta quando: `npm run build` e `npm test` passano, più…".

**IR10. Il terzo prodotto e la variante di Yoku S non sono scelti** (readiness M10; Stage 6 S5)
- **Dove:** 15.5, r. 666; criterio 2.
- **Proposta:** nominare il terzo prodotto, oppure dare una regola per sceglierlo entro la fase 5. Per Yoku S, "taglio 60, variante del suo file FBX".

**IR14. La regola del ritardo si contraddice** (style M1)
- **Dove:** 15.5, r. 651.
- **Problema:** la riga dice "non c'è margine" e subito dopo "il margine sono i tagli". Il quarto taglio poi non riguarda la fase 6.
- **Proposta:** il ritardo si toglie dalla fase 6 con i tagli 1–3; il taglio 4 vale se le fasi 3–5 superano il loro tetto.

**IR15. Gli ordinali dei tagli sono ambigui** (style M2)
- **Dove:** r. 670–671.
- **Problema:** non è chiaro chi siano "il secondo prodotto" e "i prodotti dopo il primo". Se il primo è Aladdin, il taglio 3 toglie la Pianta a Yoku S.
- **Proposta:** usare i nomi dei prodotti.

**IR16. La fase 1 risulta "fatta" senza esiti scritti** (style M3)
- **Dove:** r. 655, 816, 819, 973.
- **Problema:** i rischi della 20.1 citano ancora "prova nella fase 1" come una cosa da fare, e la 20.5 chiede ancora di annotarne l'esito.
- **Proposta:** date ed esiti nella riga della fase 1, oppure "fatta, esiti da registrare in `docs/prove.md`". Nei rischi, "provato nella fase 1".

**IR17. La soglia della prova sulla scadenza non si può misurare** (style M4; collegato a IR8)
- **Dove:** r. 732.
- **Problema:** "circa 15 secondi più il PDF" non dà un numero da verificare.
- **Proposta:** un numero preciso, misurato con le scadenze brevi di IR8.

**IR18. Il criterio 2 non dice da dove vengono le viste di Aladdin** (style M5)
- **Dove:** r. 686.
- **Problema:** non si capisce se Aladdin 60 convertito dal mockup basta per il criterio.
- **Proposta:** "Aladdin (60 convertito dal mockup, prodotto in chat dal modello 3D come dice l'appendice B; 45 prodotto in chat) e Yoku S …".

### Storico

**IR19. La colonna v6 della 23.2 rimanda a sezioni che ora dicono altro** (style M6)
- **Dove:** r. 1061, 1069, 1081, 1086.
- **Proposta:** una nota sopra la tabella, oppure togliere i numeri di sezione dalla colonna v6. Il blocco si può anche spostare in `archivio/`, come propongono Stage 5 N1 e Stage 8 Z8-1.

**IR20. La prima tabella della 23.1 descrive le viste in uno stato intermedio** (style M7)
- **Dove:** r. 1021.
- **Problema:** dice "generate da uno script", e la correzione sta nella tabella successiva.
- **Proposta:** nella prima tabella lo stato finale: viste prodotte in chat.

---

## 🟢 Nit

| Voce | Fonte | Dove | In breve |
|---|---|---|---|
| IN1 | readiness N1 | r. 633 | Scrivere `db:reset` per intero. Dopo `down -v` serve di nuovo `npm run test:setup` (codebase N7). |
| IN2 | readiness N2 | r. 634, 638 | Codici di uscita di `check`; `spawn` con `shell: true` su Windows in `avvio-demo.ts`. |
| IN3 | readiness N3 | r. 602 | `viewsFrom` deve puntare a un taglio che ha i propri tre file: niente catene. |
| IN4 | readiness N4 | sez. 18 | Prove mancanti: Route Handler del PDF (404 e 200) e `npm run check` con il database spento. |
| IN5 | readiness N5 | r. 1147 | `.catch` vuoto sulla promessa che perde `Promise.race`; il risultato in ritardo non aggiorna la riga. |
| IN6 | readiness N6, codebase N2 | r. 747–748 | Versione di Mailpit; nel `webServer` di Playwright `url`, `timeout` (180 s) e le opzioni `--smtp` e `--listen`. |
| IN7 | codebase N1 | r. 1147 | I timeout predefiniti di Nodemailer non sono tutti "di minuti" (da verificare). |
| IN8 | codebase N3 | r. 913 | Da Next 15 `params` è una Promise; per il PDF usare `new Uint8Array(buffer)` (da verificare). |
| IN9 | codebase N4 | r. 1154 | `check` può confrontare gli hash delle migrazioni con `readMigrationFiles`. |
| IN10 | codebase N6 | r. 879 | Chiavi `_` solo al primo livello; con Zod 4 si usa `z.strictObject` (da verificare). |
| IN11 | codebase N8 | scheda 0015 | "Come è stato verificato" cita ancora `feTurbulence`. |
| IN12 | style N1 | r. 602 | Frase con tre controlli: dividerla in sotto-punti. |
| IN13 | style N2 | r. 616 | Mailpit e `next.config.ts` non sono dipendenze di sviluppo: punti separati. |
| IN14 | style N3 | r. 555 | Intestazione della colonna: "Cartelle e file". |
| IN15 | style N4 | r. 674 | "Davvero" è superfluo. |
| IN16 | style N5 | r. 715 | "Messaggio onesto" è un giudizio. |
| IN17 | style N6 | r. 728 | "SVG atteso" non dice come si confronta il risultato. |
| IN18 | style N7 | r. 887 | "Unico punto in cui si discosta dal sito" non è vero (vedi anche Stage 5 N-b). |
| IN19 | style N8 | r. 1001–1010 | Tono persuasivo nella sez. 22; "fedeltà al prodotto" non è ancora misurata. |
| IN20 | style N9 | r. 1134, 1138 | "Molto più povero" è un giudizio; la nota storica va nella sez. 23. |
| IN21 | style N10 | r. 959–965 | La 20.4 "Domande per il tutor" ripete la 20.2, e le domande sono tutte chiuse. |
| IN22 | style N10 | r. 1147 | "Circa 10 secondi": scrivere 10 000 ms. |

---

## Da chiudere prima della PR del contratto (fase 2)

Secondo il revisore readiness:
- **prima della PR del contratto:** IR-B1, IR3, IR4, IR5, IR6 e IR11, che riguardano la PR unica della 15.2;
- **prima della prima prova "Vitest + database":** IR-B2 e IR8;
- **durante la fase 2:** gli altri.

Lo Stage 8 (Z8-1) suggeriva di congelare il documento e chiudere le correzioni dentro la PR del contratto. È coerente con questa divisione: i Blocker riguardano proprio quella PR.

---

## Matrice di tracciabilità

| Voce | readiness | codebase | style |
|---|---|---|---|
| IR-B1 | B1 | M4 | — |
| IR-B2 | B2 | M9, M10 | — |
| IR1 | M1 | M1 | — |
| IR2 | M2, N6 | M12 | — |
| IR3 | M3 | — | — |
| IR4 | M4 | — | — |
| IR5 | M5 | — | — |
| IR6 | M6 | M5, M6, N5 | — |
| IR7 | M7 | M11 | — |
| IR8 | M8 | M7 | — |
| IR9 | M9 | — | — |
| IR10 | M10 | — | — |
| IR11 | — | M3 | — |
| IR12 | — | M2 | — |
| IR13 | — | M8 | — |
| IR14–IR20 | — | — | M1–M7 |
| IN1–IN6 | N1–N6 | N2, N7 | — |
| IN7–IN11 | — | N1, N3, N4, N6, N8 | — |
| IN12–IN22 | — | — | N1–N10 |
