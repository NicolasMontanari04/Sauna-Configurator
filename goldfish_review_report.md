Status: resolved (auto accept; IR10: il terzo prodotto resta da scegliere durante lo sviluppo, nessuna regola inserita; IN11 applicato alla scheda 0015; `valida(config, catalogo)` allineato anche nella scheda 0027)

# Goldfish Annotated Review Report (Stage 9, round 1)

**Target:** `configuratore-saune-analisi-v7.md` (DetailedRange 547..1157)
**Risultati:** `implementation_readiness_report.md`
**Copia del documento prima delle modifiche:** `archivio/revisione-v7/configuratore-saune-analisi-v7-prima-dello-stage9.md`

**Riepilogo delle classificazioni:**
- PROPOSE FIX: 2 Blocker, 18 Major, 10 Nit;
- CONTEST: 1 Major (IR13);
- ESCALATE: 1 Major (IR10, solo il terzo prodotto);
- DECLINE: 12 Nit.

**Criterio usato.** L'utente ha chiesto che le correzioni non creino problemi nuovi. Per questo:
- ogni correzione riprende un valore già presente nel mockup o nel documento, oppure fissa una scelta che lo standard chiede di fissare;
- non introduco meccanismi nuovi. Le funzioni nuove (`leggiVista`, `normalizza`, `controllaViste`) sono parti del codice già previsto, a cui do un nome e un file;
- dopo le modifiche controllo con grep tutti i rimandi alle frasi toccate: glossario, 10.1, P2, P8, sez. 18.

**Controlli fatti sul mockup** (`docs/mockup/configuratore-saune-mockup.html`, r. 618, oggetto `AVIEW`):
- i tre `viewBox` sono `0 0 2000 1982`, `0 0 2000 2091` e `0 0 2000 1632`: la larghezza è sempre 2000;
- nei path compaiono solo i comandi `M`, `L` e `Z` (4005 `M`, 30382 `L`, 4005 `Z`);
- lo scurimento è `color-mix(… #000 0%/6%/13%/21%/30%/40%)`, anche per `stove`;
- il bordo è `stroke-width:1.2`, con `linejoin:round`;
- i colori fissi sono `--stove:#3a3a3c`, `--glass:#e4eef0`, `#cfcdc8` per il pavimento senza materiale, e i pattern sono 900 × 582;
- l'ombra è `<polygon … fill="#000" opacity=".28" filter="url(#bl)">`, con `feGaussianBlur stdDeviation="24"`. C'è in due viste su tre: la Pianta non ce l'ha.

---

## Da decidere: ESCALATE

### [IR10] [`egm-implementation-readiness`]: Severity: Major
*   **Affected Scope:** [Lines 666](configuratore-saune-analisi-v7.md#L666) (15.5, Ordine nella fase 6) e [Line 687](configuratore-saune-analisi-v7.md#L687) (criterio 2)
*   **Discrepancy Description:** il terzo prodotto e la variante di Yoku S non sono scelti.
*   **Rationale:** senza un nome, nella fase 6 non si sa quale file scrivere.
*   ***AI Suggestion:*** ESCALATE (solo il terzo prodotto)
*   ***Justification:***
    *   **Variante di Yoku S.** Si ricava dal documento: l'appendice A.2 dice che entra la variante del file disponibile, e il solo taglio con un FBX è il 60. Questa parte la correggo senza chiedere.
    *   **Terzo prodotto.** Non c'è nei file letti dal revisore: dipende dal catalogo e da cosa preferisci mostrare. Se non indichi un nome, inserisco una regola di scelta.
*   ***Proposed Edit:***
    *   Location: r. 666.
    *   Change: "Prima Yoku S 60, nella variante del suo file FBX, con le viste prodotte in chat (il prodotto che risponde al problema, sezione 2). Poi il terzo prodotto, con la foto ufficiale: **[nome, se lo indichi]**. Altrimenti lo sceglie N entro la fine della fase 5, tra i prodotti che sul sito hanno una foto per ogni versione, preferendo quello con meno gruppi, e lo registra in `docs/catalogo-inventario.md`. Solo dopo si aggiungono altri tagli o prodotti."

---

## 🔴 Blocker

### [IR-B1] [`egm-implementation-readiness`, `egm-codebase-details`]: Severity: Blocker
*   **Affected Scope:** [Lines 594-612](configuratore-saune-analisi-v7.md#L594-L612) (15.2, formato delle viste), [Line 727](configuratore-saune-analisi-v7.md#L727) (prova sul formato)
*   **Discrepancy Description:** il contratto non dice come si legge un SVG, cosa può contenere la radice e quali comandi può usare `d`.
*   **Rationale:** dopo la PR del contratto, una scelta diversa cambierebbe tutte le viste e la prova.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** la critica è fondata. Il mockup usa già soltanto `M`/`L`/`Z` assoluti, quindi la regola non obbliga a modificare le viste di Aladdin 60. Con questi comandi un'espressione regolare basta, e non serve un parser XML.
*   ***Proposed Edit:***
    *   Location: 15.2, elenco del formato, dopo la riga del `viewBox` (r. 596).
    *   Change: aggiungo tre sotto-punti:
        *   "radice `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2000 H">`, senza altri attributi; la larghezza è sempre 2000, come nel mockup, e cambia solo l'altezza `H`;"
        *   "figli `<path …/>` diretti, senza `<g>`; in `d` solo i comandi assoluti `M`, `L` e `Z`, come nel mockup. La regola sta anche nel testo della richiesta in `docs/viste.md`;"
        *   "lettura con un'espressione regolare in `src/lib/viste/leggiVista.ts`, senza parser XML né dipendenze nuove. La usano la prova sul formato, il controllo delle proporzioni e `componiVista`; un file fuori formato fa lanciare `VistaNonValida`."
    *   Location: r. 596.
    *   Change: "`viewBox` libero" diventa "altezza del `viewBox` libera".
    *   Location: prova sul formato (r. 727).
    *   Change: aggiungo "radice e comandi di `d` ammessi".

### [IR-B2] [`egm-implementation-readiness`, `egm-codebase-details`]: Severity: Blocker
*   **Affected Scope:** [Lines 636-640](configuratore-saune-analisi-v7.md#L636-L640) (15.3), [Lines 744-748](configuratore-saune-analisi-v7.md#L744-L748) (ambiente delle prove)
*   **Discrepancy Description:** le prove Vitest possono leggere `.env`, che contiene le credenziali Gmail. Nessun server SMTP di prova è definito per Vitest. Il database di prova si crea in un modo non definito.
*   **Rationale:** un errore di configurazione manda email vere dall'unico account Gmail.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** la critica è fondata. Il report chiedeva di scegliere tra due strade. Scelgo Mailpit, avviato dalla `globalSetup` di Vitest: è lo stesso eseguibile che Playwright già usa e ha la stessa API per leggere i messaggi, quindi non aggiunge dipendenze. Il server muto di IR8 resta solo per la prova sulla scadenza.
*   ***Proposed Edit:***
    *   Location: "Ambiente delle prove" (r. 744).
    *   Change: sostituisco il primo punto e aggiungo un punto nuovo.
        *   `.env.test` contiene solo valori di prova:
            *   `DATABASE_URL` verso `configuratore_test`;
            *   `SMTP_HOST=127.0.0.1`, `SMTP_PORT=1025`, `SMTP_SECURE=false`;
            *   `SMTP_USER` e `SMTP_PASSWORD` vuoti;
            *   `MAIL_FROM` e `PROJECT_EMAIL` con indirizzi `@example.com`.
        *   `vitest.config.ts`:
            *   carica solo `.env.test`, con `process.loadEnvFile('.env.test')` in `setupFiles`;
            *   si ferma se `SMTP_HOST` non è `127.0.0.1`;
            *   avvia Mailpit in `globalSetup` e lo chiude alla fine.
        *   `npm run test:setup` (`scripts/prepara-test.ts`):
            *   si collega al database `postgres`;
            *   crea `configuratore_test` solo se manca in `pg_database`, perché `CREATE DATABASE` non ha `IF NOT EXISTS`;
            *   applica le migrazioni con `migrate()` di `drizzle-orm/postgres-js/migrator`, senza `drizzle-kit`;
            *   esegue il seed.
    *   Location: punto di Playwright (r. 747).
    *   Change: aggiungo all'`env` esplicito `SMTP_USER=''`, `SMTP_PASSWORD=''`, `PROJECT_EMAIL` di prova e `ENABLE_GALLERY=true`. Mailpit parte con `--smtp-auth-accept-any`, così l'invio funziona anche se resta un utente. Le variabili passate a `next start` hanno la precedenza su `.env`.
    *   Location: tabella della 15.3, riga `test:setup` (r. 636).
    *   Change: "crea il database `configuratore_test` se manca, poi applica le migrazioni con `migrate()` e fa il seed".

---

## 🟡 Major

### [IR1] [`egm-implementation-readiness`, `egm-codebase-details`]: Severity: Major
*   **Affected Scope:** [Lines 561-585](configuratore-saune-analisi-v7.md#L561-L585) (15.1, File iniziali)
*   **Discrepancy Description:** al posto dei file ci sono cartelle; mancano file dello scaffold e di funzioni già previste; il pannello dei materiali sta in `src/lib/`.
*   **Rationale:** la tabella deve dire quali file si toccano.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:***
    *   La critica è fondata.
    *   Non aggiungo la colonna "Azione": il repository del codice è nuovo e si creano tutti i file. Lo scrivo una volta sola, sopra la tabella.
    *   Le eccezioni sono due: il mockup, già presente, e lo spostamento delle schede.
*   ***Proposed Edit:***
    *   Sopra la tabella: "Tutti i file si creano, tranne il mockup, già presente, e le schede, che si spostano da `docs-iniziali/docs/decisioni/` a `docs/decisioni/`. Le sole cartelle senza un elenco di file sono `public/viste/<prodotto>/<taglio>/`, `public/texture/`, `public/foto/`, `src/components/`, che segue i componenti del mockup, e `test/`."
    *   Riga dello scaffold: aggiungo `.gitignore` (con `.env`), `postcss.config.mjs`, `eslint.config.mjs`, `src/app/layout.tsx` e `src/app/globals.css`.
    *   Riga del contratto: aggiungo `src/contratti/normalizza.ts` (IR4).
    *   Riga `src/lib/viste/`: diventa `src/lib/viste/componiVista.ts`, `src/lib/viste/leggiVista.ts` e `src/lib/viste/costanti.ts`.
    *   Il pannello dei materiali passa nella riga di `src/components/`.
    *   Riga di `src/server/`: aggiungo `src/server/seed.ts`, `src/server/avvio.ts`, `src/server/pulizia.ts` (IR8) e `src/server/controllaViste.ts` (IR11).
    *   Riga delle prove: diventa `test/unit/<modulo>.test.ts`, `test/e2e/flusso.spec.ts` e `test/fixtures/` (IR8).

### [IR2] [`egm-implementation-readiness`, `egm-codebase-details`]: Severity: Major
*   **Affected Scope:** [Line 614](configuratore-saune-analisi-v7.md#L614) (15.2, dipendenze)
*   **Discrepancy Description:** non sono fissate le risposte di `create-next-app` e di `shadcn init`, né i componenti da aggiungere. La lista delle dipendenze potrebbe essere superata.
*   **Rationale:** due persone che fanno lo scaffold ottengono progetti diversi.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:***
    *   La critica è fondata.
    *   Non scrivo i flag del comando: cambiano da una versione all'altra di `create-next-app`, e un flag sbagliato sarebbe un problema nuovo. Fisso invece le risposte alle domande.
*   ***Proposed Edit:***
    *   r. 614: sostituisco la prima parte con questo testo:
        *   "lo scaffold si fa nella fase 2 con `create-next-app` nella versione fissata, in una cartella temporanea, perché il repository contiene già dei file. Dalla cartella temporanea si copiano i file.
        *   Risposte: TypeScript sì, ESLint sì, Tailwind sì, cartella `src/` sì, App Router sì, alias `@/*`, npm. Una domanda non elencata prende la risposta predefinita.
        *   Poi `shadcn init` con le risposte predefinite e `shadcn add dialog button radio-group checkbox input label`.
        *   La lista definitiva delle dipendenze è il `package.json` della PR del contratto. I pacchetti qui sotto sono quelli attesi."

### [IR3] [`egm-implementation-readiness`]: Severity: Major
*   **Affected Scope:** [Lines 590-593](configuratore-saune-analisi-v7.md#L590-L593) (15.2); collegato alla sez. 8.1, r. 236–256
*   **Discrepancy Description:** mancano:
    *   i nomi di alcune colonne di `configuration`;
    *   il tipo di `zones`;
    *   il collegamento tra valore e materiale;
    *   quali colonne sono `NOT NULL`;
    *   quali campi di `ProdottoFile` sono obbligatori.
*   **Rationale:** due persone scriverebbero due schemi diversi.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:***
    *   La critica è in parte fondata. La 8.1 ha già quasi tutte le colonne, ma per tre righe dà solo una descrizione, senza il nome.
    *   Completo la 8.1, che è il posto in cui il documento descrive il modello dei dati, invece di scrivere una tabella nuova che la ripeterebbe.
*   ***Proposed Edit:***
    *   8.1, r. 250–252: aggiungo i nomi `created_at`, `email`, `privacy_accepted_at` e `privacy_version`.
    *   r. 240: "`zones` (`text[]`)".
    *   r. 241: "materiale collegato (`material_code`, chiave esterna verso `material.code`, `ON DELETE RESTRICT`)".
    *   Frase nuova dopo la r. 256:
        *   "Tutte le colonne sono `NOT NULL`, tranne quelle indicate come nullabili e `customer_error`, `project_error` e `customer_last_attempt_at`.
        *   Le tabelle figlie del catalogo usano `ON DELETE CASCADE` verso il prodotto e il gruppo. Il seed le svuota comunque tutte insieme (scheda 0028).
        *   Nello schema Zod un campo è facoltativo solo se qui è nullabile. `texture` può essere `null` (P13)."

### [IR4] [`egm-implementation-readiness`]: Severity: Major
*   **Affected Scope:** [Lines 915-921](configuratore-saune-analisi-v7.md#L915-L921) (P8), [Line 725](configuratore-saune-analisi-v7.md#L725), [Line 903](configuratore-saune-analisi-v7.md#L903) (P7); collegati 10.1 r. 372, P2 r. 882, 15.2 r. 590–591
*   **Discrepancy Description:** `valida(config, prodotto)` non può segnalare un prodotto che non esiste, e dagli errori non si ricava una configurazione corretta.
*   **Rationale:** la prova della r. 725 chiede proprio il caso del prodotto inesistente.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:***
    *   La critica è fondata: è una contraddizione tra la firma e la prova.
    *   Oggi la 10.1 usa `valida` anche per correggere l'URL, ma `valida` restituisce solo errori. La correzione dell'URL va quindi a una funzione con un nome suo.
*   ***Proposed Edit:***
    *   `valida(config, prodotto)` diventa `valida(config, catalogo)`, con `catalogo: Prodotto[]`, in:
        *   10.1 r. 372;
        *   15.2 r. 590–591 ("che `valida` riceve" diventa "un elenco dei quali `valida` riceve");
        *   P2 r. 882;
        *   la firma di P8 r. 918.
    *   10.1 r. 372: "l'interfaccia la usa per riportare ai predefiniti un URL sbagliato" diventa "un URL sbagliato lo corregge `normalizza(query, catalogo) → { config, avvisi }`, in `src/contratti/normalizza.ts`, che sostituisce ogni codice sconosciuto con il predefinito".
    *   P7 r. 903: aggiungo il testo dell'avviso: "«x» non esiste nel catalogo: è stato scelto «y»".
    *   Sez. 18, riga dell'URL (r. 741): resta com'è. Aggiungo una riga Vitest: "`normalizza` con codici sconosciuti → configurazione predefinita e un avviso per codice".

### [IR5] [`egm-implementation-readiness`]: Severity: Major
*   **Affected Scope:** [Lines 909-913](configuratore-saune-analisi-v7.md#L909-L913) (P8); 10.3 r. 403–409
*   **Discrepancy Description:** P8 dice "una delle quattro" cause, ma sono cinque. Inoltre:
    *   le cause non hanno un codice;
    *   non è detto cosa contiene `customer_error`;
    *   non è detta la chiave degli errori della configurazione;
    *   i gruppi possono chiamarsi come i campi del modulo;
    *   manca la formula di `puoRiprovare`.
*   **Rationale:** il tipo dell'esito non si può scrivere.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:***
    *   La critica è fondata.
    *   "Quattro" è un errore lasciato dalla mia correzione D10.
    *   Non scrivo una tabella di messaggi di validazione per i campi del modulo: i testi degli errori del modulo li prende già dal mockup P15, che il documento indica come riferimento.
*   ***Proposed Edit:***
    *   P8 r. 911: "`causa` è una delle quattro di RF6" diventa "`causa` è una delle cinque di RF6: `'non-raggiungibile' | 'accesso-rifiutato' | 'tempo-scaduto' | 'indirizzo-rifiutato' | 'imprevisto'`. `puoRiprovare` vale `cliente === 'failed' && customer_attempts < 3`."
    *   P8 r. 910: aggiungo "gli errori della configurazione stanno sotto la chiave `config`; i testi degli errori del modulo vengono dal mockup (P15)".
    *   10.3 r. 409: "il codice si salva in `customer_error`" diventa "in ogni caso `customer_error` contiene `<causa>:<codice di Nodemailer>`".
    *   P1 r. 874: "Un gruppo non può chiamarsi `product` né `size`" diventa "Un gruppo non può chiamarsi `product`, `size`, `email`, `emailConferma`, `informativa`, `requestId` né `token`".

### [IR6] [`egm-implementation-readiness`, `egm-codebase-details`]: Severity: Major
*   **Affected Scope:** [Lines 603-612](configuratore-saune-analisi-v7.md#L603-L612) (15.2); 9.3 r. 350
*   **Discrepancy Description:** il documento non riporta i valori delle costanti, e l'opzione `dataUri` non si può realizzare in una funzione pura che gira anche nel browser. Inoltre `stove` è descritta come colore pieno, ma nel mockup ha sei livelli.
*   **Rationale:** M e N scriverebbero valori diversi per la pagina e per il PDF.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:***
    *   Ho verificato i valori sul mockup (vedi in alto).
    *   Con la larghezza del `viewBox` fissata a 2000 (IR-B1), i valori valgono così come sono, senza calcolare proporzioni.
    *   `stove` ha già `data-shade` secondo la regola della r. 599. Va corretta solo la 9.3.
*   ***Proposed Edit:***
    *   r. 603: il punto diventa "le costanti in `src/lib/viste/costanti.ts`, prese dal mockup e valide per la larghezza 2000:
        *   scurimento dei livelli 0–5 con il nero al 0, 6, 13, 21, 30 e 40%;
        *   bordo 1,2 con giunzioni `round`, dello stesso colore del riempimento;
        *   `stove` `#3a3a3c`, scurita come le altre zone;
        *   `glass` `#e4eef0` con opacità 0,1;
        *   `shadow` `#000` con opacità 0,28 e sfocatura gaussiana 24;
        *   `floor` senza materiale `#cfcdc8`;
        *   `metal` senza materiale con il colore del mockup;
        *   pattern della texture 900 × 582, ruotato di 90 gradi per `roof` e `bench`".
    *   Firma (r. 610): `opzioni: { prefisso: string; flat?: boolean }`. Sotto la firma aggiungo: "`texture` è già l'URL da usare: un percorso di `public/` nella pagina, un data URI preparato dal server nel PDF. Restituisce l'SVG completo, pronto per la pagina o per resvg."
    *   9.3 r. 350: "`stove` ha un colore pieno" diventa "`stove` ha un colore fisso, scurito per livello d'ombra come le altre zone".
    *   Per `metal` non scrivo il valore: il mockup lo dà come `--metal:#8a8d91` nell'`AVIEW`, ma la tabella dell'appendice A lo usa già come materiale. Scrivo quindi solo "come nel mockup", per non creare un valore doppio.

### [IR7] [`egm-implementation-readiness`, `egm-codebase-details`]: Severity: Major
*   **Affected Scope:** [Line 1157](configuratore-saune-analisi-v7.md#L1157) (appendice C), [Line 571](configuratore-saune-analisi-v7.md#L571)
*   **Discrepancy Description:** il documento non dice con quale strumento si fa la conversione. Inoltre la regola presume un'ombra che la Pianta non ha, e non dice se `glass` riceve `fill-rule`.
*   **Rationale:** la regola, applicata così com'è, fallisce sulla Pianta.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:***
    *   Ho verificato che la Pianta non ha il poligono dell'ombra.
    *   La conversione è meccanica: uno script usa e getta è più ripetibile della chat. Non è lo "script delle viste" tolto con la scheda 0029, che generava le viste dai modelli 3D.
*   ***Proposed Edit:***
    *   r. 1157: inizio la frase con "Si fa con lo script usa e getta `scripts/converti-mockup.ts`, eseguito una volta nella fase 2: legge l'oggetto `AVIEW` del mockup con `JSON.parse` e scrive i tre file."
    *   Stessa riga: "`class="glass"` diventa `data-zone="glass"` con `fill-rule="evenodd"`, senza `data-shade`" e "il `<polygon>` dell'ombra, dove c'è (non nella Pianta), diventa …". La radice diventa `<svg xmlns=… viewBox=…>` (IR-B1).
    *   r. 571 e tabella dei file: aggiungo `scripts/converti-mockup.ts` (M, fase 2).

### [IR8] [`egm-implementation-readiness`, `egm-codebase-details`]: Severity: Major
*   **Affected Scope:** [Lines 729-735](configuratore-saune-analisi-v7.md#L729-L735) (sez. 18), 15.3
*   **Discrepancy Description:**
    *   le prove dovrebbero chiamare degli script, ma possono importare solo funzioni;
    *   il server muto non è descritto;
    *   con quel server scatta prima `greetingTimeout`;
    *   la prova dura più di 5 s.
*   **Rationale:** le prove non si possono scrivere così.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** la critica è fondata. Le funzioni esistono già nel piano come script: le metto in `src/server/` e gli script le chiamano.
*   ***Proposed Edit:***
    *   "Ambiente delle prove": aggiungo un punto.
        *   "Gli script sono involucri: le funzioni stanno in `src/server/` e le prove le importano. Sono `seed(db, cartella)`, `segnaPendingFailed(db)` e `pulisci(db, { email? })`.
        *   Le prove del seed usano file in `test/fixtures/` e alla fine rifanno il seed di `data/prodotti/`.
        *   Il server SMTP muto è un `net.createServer` che accetta la connessione e non scrive niente.
        *   Il modulo di invio riceve le scadenze come parametro: 15 000 ms nell'applicazione, 1000 ms nelle prove, con i timeout di Nodemailer più lunghi della scadenza, così scatta la scadenza complessiva.
        *   `testTimeout` è 30 000 ms in `vitest.config.ts`."

### [IR9] [`egm-implementation-readiness`]: Severity: Major
*   **Affected Scope:** [Lines 653-664](configuratore-saune-analisi-v7.md#L653-L664) (15.5)
*   **Discrepancy Description:** la prova del PDF di N dipende dal lavoro di M nella stessa fase, e nessuna fase dice quando è conclusa.
*   **Rationale:** in 2 giorni l'ordine interno conta.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** la critica è fondata. L'ordine che propongo segue le dipendenze già scritte e non cambia i giorni.
*   ***Proposed Edit:***
    *   Riga della fase 2: aggiungo l'ordine.
        *   "Primo giorno, mattina: scaffold e PR del contratto (entrambi).
        *   Primo giorno, pomeriggio: M converte Aladdin 60 e scrive `componiVista`; N copia texture e foto.
        *   Secondo giorno: N fa la prova del PDF con le viste convertite; M produce Aladdin 45 in chat e fa la prova sul formato."
    *   Sotto la tabella: "Una fase è finita quando il suo lavoro è nel ramo principale e `npm run build` e `npm test` passano sui due portatili."

### [IR11] [`egm-codebase-details`]: Severity: Major
*   **Affected Scope:** [Line 593](configuratore-saune-analisi-v7.md#L593), [Line 602](configuratore-saune-analisi-v7.md#L602)
*   **Discrepancy Description:** lo schema Zod condiviso con il browser legge file su disco.
*   **Rationale:** nel browser `fs` non c'è.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** la critica è fondata. Con la correzione, il seed e la prova usano la stessa funzione. Così si riduce anche il problema dei tre controlli (Z8-6).
*   ***Proposed Edit:***
    *   r. 602: "il controllo, nello schema Zod e nel seed, che" diventa "il controllo `controllaViste(prodotto)`, in `src/server/controllaViste.ts`, solo server, chiamato dal seed e dalla prova sul formato, che". Aggiungo in fondo: "`viewsFrom` punta a un taglio con i propri tre file, senza catene" (IN3).
    *   Lo schema Zod tiene solo il controllo sulle zone tra gruppi e `fixedZones`, che non legge file.

### [IR12] [`egm-codebase-details`]: Severity: Major
*   **Affected Scope:** [Line 879](configuratore-saune-analisi-v7.md#L879) (P1)
*   **Discrepancy Description:** P1 dice che l'interfaccia usa il file così com'è. La 8.2 (r. 287) dice invece che, dalla fine della fase 3, l'interfaccia legge dal database.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** la contraddizione c'è.
*   ***Proposed Edit:*** r. 879: "Il file si usa così com'è sia dal seed sia dall'interfaccia" diventa "Il file si usa così com'è dal seed e, fino alla fine della fase 3, dall'interfaccia (sezione 8.2)".

### [IR14] [`egm-style`]: Severity: Major
*   **Affected Scope:** [Line 651](configuratore-saune-analisi-v7.md#L651)
*   **Discrepancy Description:** la r. 651 dice "non c'è margine" e subito dopo "il margine sono i tagli". Inoltre il taglio 4 non riguarda la fase 6.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** la critica è fondata ed è lo stesso punto di S2 dello Stage 6.
*   ***Proposed Edit:*** r. 651: "Il margine sono i tagli elencati sotto: ogni giorno di ritardo del via libera si toglie dalla fase 6, applicando i tagli nel loro ordine." diventa "Ogni giorno di ritardo del via libera si toglie dalla fase 6, applicando i tagli 1–3 elencati sotto nel loro ordine. Il taglio 4 si applica se le fasi 3–5 superano il loro tetto."

### [IR15] [`egm-style`]: Severity: Major
*   **Affected Scope:** [Lines 670-671](configuratore-saune-analisi-v7.md#L670-L671)
*   **Discrepancy Description:** "il secondo prodotto" e "i prodotti dopo il primo" sono ambigui.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:***
    *   Con l'ordine della 15.5, il secondo prodotto è Yoku S.
    *   Il terzo prodotto è al livello B e non ha la Pianta.
    *   Quindi il taglio 3 riguarda solo Yoku S, e la nota sul criterio 2 è già scritta.
*   ***Proposed Edit:***
    *   2: "i tagli di Yoku S oltre il primo";
    *   3: "la vista Pianta di Yoku S (la consegna diventa parziale rispetto al criterio 2)".

### [IR16] [`egm-style`]: Severity: Major
*   **Affected Scope:** [Line 655](configuratore-saune-analisi-v7.md#L655), [Line 816](configuratore-saune-analisi-v7.md#L816), [Line 819](configuratore-saune-analisi-v7.md#L819), [Line 973](configuratore-saune-analisi-v7.md#L973)
*   **Discrepancy Description:** la fase 1 è "fatta", ma i rischi parlano ancora di una prova da fare.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** le date e gli esiti non li conosco, quindi non li invento. Correggo i tempi dei verbi e rimando alla 20.5, che chiede già di registrarli.
*   ***Proposed Edit:***
    *   r. 816 e 819: "Prova nella fase 1" diventa "Provato nella fase 1".
    *   r. 655: aggiungo in fondo "; esiti e date da registrare in `docs/prove.md` (sezione 20.5)".

### [IR17] [`egm-style`]: Severity: Major
*   **Affected Scope:** [Line 732](configuratore-saune-analisi-v7.md#L732)
*   **Discrepancy Description:** "circa 15 secondi più il PDF" non si può misurare.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** con la scadenza di prova di IR8, la soglia diventa un numero.
*   ***Proposed Edit:*** l'esito atteso diventa "con la scadenza di prova di 1000 ms, la risposta arriva meno di 1500 ms dopo l'inizio degli invii, quindi le due scadenze corrono insieme; entrambi gli stati `failed` con causa `tempo-scaduto`".

### [IR18] [`egm-style`]: Severity: Major
*   **Affected Scope:** [Line 686](configuratore-saune-analisi-v7.md#L686) (criterio 2)
*   **Discrepancy Description:** il criterio non dice se Aladdin 60, convertito dal mockup, conta.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** l'appendice B (r. 1138) dice che quelle viste sono state prodotte in chat dal modello 3D, quindi contano.
*   ***Proposed Edit:*** r. 686: "Aladdin e Yoku S con le viste prodotte dai file dell'Area Pro" diventa "Aladdin e Yoku S con le viste prodotte dai file dell'Area Pro (per Aladdin 60 valgono quelle del mockup, prodotte in chat dal modello 3D e convertite)".

### [IR19] [`egm-style`]: Severity: Major
*   **Affected Scope:** [Lines 1054-1090](configuratore-saune-analisi-v7.md#L1054-L1090) (23.2)
*   **Discrepancy Description:** i numeri di sezione della 23.2 rimandano a sezioni che oggi trattano altro.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** una sola frase evita di riscrivere la tabella. Lo spostamento in `archivio/` resta per il passaggio in `docs/` (Z8-1).
*   ***Proposed Edit:*** sotto il titolo 23.2: "La tabella è storica: i numeri di sezione sono quelli della v6, e alcune di quelle sezioni oggi trattano altro."

### [IR20] [`egm-style`]: Severity: Major
*   **Affected Scope:** [Line 1021](configuratore-saune-analisi-v7.md#L1021)
*   **Discrepancy Description:** la prima tabella della 23.1 descrive le viste in uno stato intermedio.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** la critica è fondata. La seconda tabella resta a documentare il passaggio dallo script alla chat.
*   ***Proposed Edit:*** r. 1021, colonna v7: "Viste SVG pronte per taglio, prodotte in chat dai file dell'Area Pro; il mockup non conteneva un generatore per le viste curate (9, schede 0025 e 0029)".

### [IR13] [`egm-codebase-details`]: Severity: Major
*   **Affected Scope:** [Lines 1147-1148](configuratore-saune-analisi-v7.md#L1147-L1148) (appendice C)
*   **Discrepancy Description:** senza pool, `transporter.close()` forse non interrompe un invio già partito: l'email può partire dopo che la riga è `failed`, e "Riprova" manderebbe un doppione.
*   ***AI Suggestion:*** CONTEST
*   ***Justification:***
    *   Il documento dichiara già questo caso come rischio accettato. La 10.3, r. 415, dice: "Dopo un timeout non si può escludere che l'email sia partita comunque: in quel caso "Riprova" può produrre un doppione. Per la demo è accettato."
    *   Le conseguenze descritte dal revisore sono proprio queste.
    *   Passare a `pool: true` aggiungerebbe un comportamento da verificare, senza togliere il rischio: un'email già consegnata al server non si ritira.
    *   L'unica parte da correggere è IN5: il risultato in ritardo non deve aggiornare la riga.
*   ***Proposed Edit:*** nessuna (vedi IN5).

---

## 🟢 Nit

| Voce | Suggerimento | Modifica o motivo |
|---|---|---|
| IN1 | PROPOSE FIX | r. 633: "`docker compose down -v` (cancella anche `configuratore_test`: dopo serve `npm run test:setup`), `docker compose up -d --wait`, `npm run db:migrate`, `npm run db:seed`" |
| IN3 | PROPOSE FIX | Dentro IR11 |
| IN5 | PROPOSE FIX | Appendice C r. 1147, aggiungo: "la promessa che perde `Promise.race` ha un `.catch` vuoto, e il suo esito non aggiorna la riga" |
| IN14 | PROPOSE FIX | r. 555: "Cartelle" diventa "Cartelle e file" |
| IN15 | PROPOSE FIX | r. 674: tolgo "davvero" |
| IN16 | PROPOSE FIX | r. 715: "un messaggio onesto sullo stato" diventa "un messaggio che dice lo stato dell'invio" |
| IN18 | PROPOSE FIX | r. 887: "È l'unico punto in cui il progetto si discosta dal sito, per scelta dell'autore" diventa "Qui il progetto si discosta dal sito per scelta dell'autore; le altre differenze sono nella sezione 22, punto 5" |
| IN22 | PROPOSE FIX | r. 1147: "a circa 10 secondi" diventa "a 10 000 ms" |
| IN11 | PROPOSE FIX | Scheda 0015, "Come è stato verificato": tolgo il riferimento a `feTurbulence`, che non si usa più. La frase da cambiare la cerco al momento di applicare |
| IN12 | PROPOSE FIX | r. 602 diventa un elenco con IR11, quindi si risolve lì |
| IN2 | DECLINE | Codici di uscita e `shell: true` si decidono nel codice della fase 3; nessun rimando del documento ne dipende |
| IN4 | DECLINE | Altre due prove aggiungono lavoro senza margine (Z8-3) |
| IN6 | DECLINE | La versione di Mailpit sta nel `README.md` (r. 748); le opzioni di `webServer` si scrivono nella PR |
| IN7 | DECLINE | Da verificare; la scadenza complessiva rende irrilevanti i valori predefiniti |
| IN8 | DECLINE | Da verificare sulla versione fissata; è un dettaglio del codice |
| IN9 | DECLINE | Il confronto del numero di righe basta per la demo |
| IN10 | DECLINE | Da verificare sulla versione di Zod fissata; il comportamento richiesto, cioè `.strict()`, è già scritto |
| IN13 | DECLINE | Solo una questione di forma |
| IN17 | DECLINE | Il confronto lo decide chi scrive la prova; la lista dei casi c'è |
| IN19 | DECLINE | La sez. 22 è una guida per la presentazione: il tono persuasivo è voluto |
| IN20 | DECLINE | La nota storica è utile a chi apre il mockup |
| IN21 | DECLINE | Togliere la 20.4 sposterebbe i rimandi alla 20.5: è un rischio di incoerenza per un guadagno piccolo |

---

## Cosa resta aperto dopo questo round
- IR10, terzo prodotto: serve la tua risposta, oppure resta la regola di scelta.
- Gli altri Major dello Stage 7 (A1–A6) e dello Stage 8 (Z8-1–Z8-4) restano registrati come compromessi accettati.
- Le voci "da verificare" (IN7, IN8, IN10) si controllano sulla versione fissata nella PR del contratto.
