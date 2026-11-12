# Stage 7: Critic Review, round 1

- **Documento:** `configuratore-saune-analisi-v6.md`
- **Intervallo:** FeatureRange 1..434 (sezioni 1-14)
- **Standard:** `feature-spec-standard`, applicato da design e structural. Style ha usato le regole della propria persona.
- **Contesto Goldfish:** `docs-iniziali/docs/decisioni/` (README, 0001-0020), `data/prodotti/aladdin.json`.

## Stato dei revisori

| Revisore | Stato | Blocker | Major | Nit |
|---|---|---|---|---|
| egm-design | completed | 0 | 8 | 9 |
| egm-structural | completed | 0 | 9 | 7 |
| egm-style | completed | 0 | 10 | 15 |

**Esito del round:** non pulito. Ci sono Major aperti e non ancora risolti, quindi il loop non è convergente.

---

## Findings consolidati (deduplicati)

Gli id hanno la forma `C<n>`. La colonna "Fonti" usa gli id grezzi `<revisore>-1-<n>`: `design-1-M1` indica design, round 1, Major 1. "Stage 5/6" indica un problema già segnalato negli stage precedenti.

### 🟡 Major

| Id | Tema | Righe | Fonti | Proposta sintetica |
|---|---|---|---|---|
| C1 | La tabella 8.1 non corrisponde al formato JSON del catalogo. Mancano predefiniti, etichetta del gruppo, `defaultSize`, `photos`, `fixedZones`. `material` è globale e c'è rischio di sovrascrittura. `option_rule` non ha prodotto e ha una sola destinazione. Non è detta la geometria per taglio. Nomi incoerenti (`passo`/`step`, "zone interessate"/`zone`/`zones`, `colore`/`color`) e lingue mescolate nelle colonne | 186-208, 227, 274, 292 | design-1-M1, structural-1-M5, style-1-M9; Stage 5 B; Stage 6 #3, #11, #12 | Allineare la 8.1 al formato P1 campo per campo prima della PR del contratto. Decidere tra materiali globali e materiali per prodotto. Fissare la convenzione di lingua degli identificatori |
| C2 | Lo snapshot non basta a rigenerare il PDF, in contrasto con "resta identica" | 88, 137, 205, 305, 353 | design-1-M2; Stage 5 A; Stage 6 #1 | Scegliere tra (a) PDF in `bytea`, (b) dati di rendering nello snapshot, (c) limite dichiarato con un ripiego solo testo |
| C3 | Due fonti del catalogo a runtime. Il seed con upsert non cancella mai e il motivo dato non regge | 135, 232-236, 293 | design-1-M3; Stage 5 B, C; Stage 6 #2 | Una sola fonte a runtime. Seed come sincronizzazione completa del solo catalogo, in transazione. Correggere la riga 234 |
| C4 | Invii: il timeout di Nodemailer non è un limite totale. Righe ferme in `in_attesa`. Nessun blocco tra due "Riprova" contemporanei, nessun limite ai tentativi, possibile abuso del token | 200-201, 299-313 | design-1-M4; Stage 5 D | Impostare i tre timeout in modo esplicito. `UPDATE` condizionale. Limite di tentativi e intervallo minimo. Regola per le righe `in_attesa` vecchie |
| C5 | Non è spiegato il meccanismo per cui la notifica "non blocca la risposta" | 304, 79 | design-1-M5; Stage 5 D; Stage 6 #6 | Nominare `after()` oppure attendere la notifica entro RNF4 e togliere la frase |
| C6 | `npm run demo`: il controllo viene dopo `next start`, quindi non parte mai | 173 | design-1-M6, structural-1-N16; Stage 5 N2; Stage 6 #13 | Eseguire `check` prima di `next start`, con FAIL che blocca l'avvio |
| C7 | **Nuovo.** App e database sono esposti sulla rete locale (`next start` su `0.0.0.0`, porta Docker su `0.0.0.0`). Il rischio "utenti noti" non regge sulla rete dell'università o della sede | 14, 171, 340, 399 | design-1-M7 | Usare `-H 127.0.0.1` e `127.0.0.1:5433:5432`. Aggiungere la regola alle sezioni 7 e 13 e il rischio alla 20.1 |
| C8 | **Nuovo.** La cancellazione su richiesta non copre la "Posta inviata" di Gmail. Il motivo di P11 si indebolisce | 382-384 | design-1-M8 | Estendere la procedura a `to:<indirizzo>` nella casella. Dichiararlo nell'informativa |
| C9 | Manca un Problem Statement: non è detto perché serve il configuratore né cosa deve dimostrare la demo | 7-20 | structural-1-M1 | Aggiungere un paragrafo "Problema" in testa alla sezione 2 |
| C10 | Non-Goals sparsi e senza rimando alla sezione 21. L'esclusione dell'IA non compare | 18-38, 210, 244 | structural-1-M2 | Aggiungere una sottosezione "Cosa non fa" o un rimando alla 21 |
| C11 | La tabella delle decisioni non ha link alle schede né lo stato. Mancano 0004, 0005, 0013, 0016, 0017, 0019, 0020 | 22-38 | structural-1-M3 | Aggiungere le colonne "Scheda" e "Stato" e completare le righe |
| C12 | Sigle usate prima della definizione (P4, P5, fasi, contratto). Il glossario è incompleto | 199-201, 246, 252, 258, 307, 366 | structural-1-M4; Stage 6 #10 | Aggiungere voci al glossario e i rimandi alle sezioni 20.3 e 15.5 |
| C13 | Alternative assenti per molte scelte (Next.js, catalogo come file, Nodemailer, regole, Docker contro Supabase, PDF) | varie | structural-1-M6 (design: accettabile per il rimando alla riga 22) | Aggiungere una riga "Alternative" o un link alla scheda in ogni sezione |
| C14 | Motivi di scarto vaghi ("pesante", "qualità inferiore"). L'"indicazione del tutor" non ha una fonte verificabile | 117, 144, 164, 244, 283, 360 | structural-1-M7, design-1-N1, style-1-N3 | Dare trade-off concreti e citare la fonte dell'indicazione o dell'autorizzazione |
| C15 | L'architettura (10.1) è troppo ridotta: non ci sono componenti, flusso dei dati né route | 287-293 | structural-1-M8 | Aggiungere un elenco o diagramma dei componenti, oppure un rimando alla 0019 |
| C16 | Rischi sparsi e senza rimando alla 20.1. Mancano le mitigazioni per token e abuso | 250-266, 329-340 | structural-1-M9, design (nota) | Aggiungere rimandi alla 20.1 e inserire in tabella C2, C3, C4, C7, C8 |
| C17 | La frase sulla migrabilità è ripetuta 4 volte e mai verificata. "Senza modifiche al codice" è troppo forte (pooler, `prepare: false`) | 38, 91, 138, 415 | style-1-M1, design-1-N8 | Tenerla una volta sola (sezione 13), scritta come intento, con "salvo le opzioni del driver" |
| C18 | La riga 158, "schema e query restano SQL", contraddice la riga 151 | 151, 158 | style-1-M2 | Dire che cosa resta portabile: le migrazioni SQL |
| C19 | L'integrità con JSONB è dichiarata troppo forte | 135-136 | style-1-M3, design-1-N2 | Limitare la frase alle colonne relazionali e dire che il JSONB è validato da Zod |
| C20 | SQLite: "niente JSONB né vincoli" è impreciso (JSONB c'è dalla 3.45; le FK vanno attivate con `PRAGMA`) | 144 | style-1-M4 | Riscrivere con la differenza reale o togliere il motivo |
| C21 | La scala Ottimo/Buono/… non è definita. Incoerenza su MySQL "Ottimo" | 124-131, 143 | style-1-M5 | Mettere i fatti concreti nelle celle |
| C22 | RNF3 "un solo comando" contro `.env` copiato a mano e i prerequisiti | 78, 176-178 | style-1-M6, structural-1-N16; Stage 6 #14 | Precisare le precondizioni in RNF3 |
| C23 | RF6 "messaggio chiaro" non è verificabile | 72, 312 | style-1-M7 | Elencare il contenuto del messaggio |
| C24 | Ripiego del PDF: soglia non misurabile e risultato della prova dato per scontato | 356, 359, 366 | style-1-M8 | Elencare le differenze attese e le condizioni che fanno scattare il ripiego |
| C25 | Le etichette dell'esempio di snapshot non sono quelle del catalogo. L'ordine L×P×H è dato per certo | 48, 50, 217-222 | style-1-M10, structural-1-N14 | Allineare l'esempio o dichiarare l'etichetta composta. Segnare l'ordine come ipotesi |

### 🟢 Nit

| Id | Tema | Righe | Fonti |
|---|---|---|---|
| C26 | Firma della funzione di disegno senza `opzioni` | 272 | style-1-N1; Stage 6 #5 |
| C27 | `next/font` "scarica" contro `next/font/local` (P14) | 385 | style-1-N2, design-1-N3 |
| C28 | Pagina vista "interna" e "frontale" ambigua | 246, 248 | style-1-N3; Stage 6 #4 |
| C29 | Registro colloquiale o soggettivo, uso della prima persona | 143-156, 154, 266, 391-399, 426-427 | style-1-N4, N5, N6, N11, N13 |
| C30 | Indicazioni vaghe o riempitivi ("interno diverso", peso della vista, limiti Gmail, "fin d'ora", "davvero", "ottimizzato", "in modo sicuro") | 99, 180, 259, 279, 336, 362, 387 | style-1-N7, N8, N9, N10, N15 |
| C31 | "Coincidono con le impostazioni predefinite" non vale per le regole 2 e 4 | 407 | style-1-N12 |
| C32 | L'avvertenza su `down -v` è lontana da `db:reset` | 178 | style-1-N14 |
| C33 | Pseudo-titoli in grassetto invece di H3 (sezioni 4, 7, 11) | 66, 75, 166-180, 346-366 | structural-1-N10 |
| C34 | La 6.7 Drizzle sta sotto "Scelta del DBMS" | 95-158 | structural-1-N11 |
| C35 | La sezione 5 non ha ID e duplica la 4; mancano rimandi ai requisiti | 84-91 | structural-1-N12 |
| C36 | Stile dei link alle schede incoerente; il percorso `docs/decisioni/` è diverso da quello attuale | 22, 364, 366 | structural-1-N13, style-1-N15 |
| C37 | Manca un indice | 1 | structural-1-N15 |
| C38 | Il campo di conferma email permette di incollare: va dichiarato nel rischio | 340, 425 | design-1-N4 |
| C39 | `numero`: non è detto se è una colonna generata o calcolata | 199 | design-1-N5; Stage 6 #20 |
| C40 | Email da normalizzare in minuscolo per la cancellazione (senza `citext`) | 382 | design-1-N6 |
| C41 | La conservazione dipende da quante volte si avvia la demo; si può aggiungere un `DELETE` nella Server Action | 380-381 | design-1-N7 |
| C42 | L'alternativa "SVG disegnato a mano" non ha un criterio per sceglierla | 266 | design-1-N9; Stage 5 G |
| C43 | "Il tutor inserisce un'email vera" è ripetuto 3 volte | 14, 387, 394 | style-1-N15 |

**Nota del revisore style:** le imprecisioni C17 (migrabilità) e C20 (SQLite) compaiono anche nelle schede 0012 e 0001. Se si corregge il documento, conviene aggiungere una nota datata anche alle schede.

---

## Matrice di tracciabilità (grezzo → consolidato)

| Revisore | Findings → Id |
|---|---|
| design | M1→C1, M2→C2, M3→C3, M4→C4, M5→C5, M6→C6, M7→C7, M8→C8; N1→C14, N2→C19, N3→C27, N4→C38, N5→C39, N6→C40, N7→C41, N8→C17, N9→C42 |
| structural | M1→C9, M2→C10, M3→C11, M4→C12, M5→C1, M6→C13, M7→C14, M8→C15, M9→C16; N10→C33, N11→C34, N12→C35, N13→C36, N14→C25, N15→C37, N16→C6/C22 |
| style | M1→C17, M2→C18, M3→C19, M4→C20, M5→C21, M6→C22, M7→C23, M8→C24, M9→C1, M10→C25; N1→C26, N2→C27, N3→C14/C28, N4–N6→C29, N7–N10→C30, N11→C29, N12→C31, N13→C29, N14→C32, N15→C30/C36/C43 |

---

## Priorità suggerita

I problemi più confermati sono **C1, C2, C3, C5 e C6**. Ognuno è stato trovato in modo indipendente da almeno tre revisori, negli Stage 5, 6 e 7. C1, C2 e C3 toccano lo schema, che si blocca alla fine della fase 4, quindi vanno chiusi prima della PR del contratto (15.2).

**C7 e C8** sono nuovi e riguardano la sicurezza e la privacy della demo dal vivo.

---

## Report grezzi

I report completi dei tre revisori sono riportati qui sotto senza modifiche, come restituiti dai revisori.

### egm-design

Nessun Blocker, 8 Major, 9 Nit. Il documento rispetta quasi tutto lo standard: problema, obiettivi ed esclusioni, architettura e alternative per DBMS, ORM, Docker e PDF ci sono. La sezione rischi (20.1) è fuori dall'ambito ma esiste. Le lacune vere sono di coerenza interna e di rischi non dichiarati. Le correggerei prima del contratto condiviso (15.2): diversi Major toccano lo schema che si blocca alla fine della fase 4.

**M1. Il modello dati non contiene campi che il resto del documento e la bozza di Aladdin danno per scontati (righe 186–208, 227, 274, 292).**
- **Valori predefiniti.** `option_group` non ha una colonna per il valore predefinito, eppure P2 e la riga 292 ("si sostituisce con quello predefinito") ne hanno bisogno. Mancano anche l'etichetta del gruppo, usata in `lines` alle righe 220–222, e il taglio predefinito per prodotto (`defaultSize` nel JSON).
- **Materiali.** `material` non ha un prodotto, ma nel JSON i materiali sono definiti dentro ogni file. Con l'upsert per codice (riga 234), due file con lo stesso codice (ad esempio `specchio`) e colore o texture diversi si sovrascrivono a vicenda in silenzio, a seconda dell'ordine del seed.
- **Livello B.** Le foto per versione (`photos` nel JSON) non hanno una tabella, e la "Versione" del glossario (riga 49) non è nel modello.
- **Zone fisse.** `fixedZones` (`mirror`, `frame`) non ha una colonna.
- **Regole.** `option_rule` non dice a quale prodotto appartiene. Ha una sola "destinazione", mentre `only_with_size` punta a un elenco di tagli. Origine e destinazione sono codici unici solo dentro gruppo e prodotto, quindi servono chiavi composte.
- **Geometria.** La riga 273 dice che la geometria è "fissa per prodotto e taglio", ma `geometry` sta solo su `product` (riga 190). Non è detto se i parametri per taglio vanno in `product_size.attributes`.
- **Nomi.** La riga 274 dice `option_group.zone`, la riga 227 "zone interessate", il JSON `zones`.

*Raccomandazione:* prima della PR del contratto, allineare la tabella 8.1 al formato P1 campo per campo. Decidere se i materiali sono globali (codice unico nel catalogo, con un controllo Zod sui duplicati tra file) o per prodotto.

**M2. "Scarica il PDF" e "Riprova" non danno lo stesso PDF del momento della richiesta (righe 88, 137, 205, 305, 353 contro 5.3).** Lo snapshot salva solo codici ed etichette (righe 212–225). Per ridisegnare la vista servono però geometria, texture e `material.colore` presi dal catalogo attuale. Il documento stesso prevede che un prodotto possa sparire dal catalogo (riga 205) e che il seed aggiorni i dati (riga 234). Dopo una modifica, il PDF rigenerato cambia; se il prodotto non c'è più, non si genera affatto. Questo contraddice la riga 88 ("resta identica") e la riga 137.

*Raccomandazione:* scegliere una strada e scriverla.
- (a) Salvare i byte del PDF in una colonna `bytea`: non viola la regola 4 della sezione 13, che vieta solo i file su disco.
- (b) Mettere nello snapshot geometria e colori o percorsi dei materiali.
- (c) Dichiarare il limite e definire cosa succede se il prodotto manca (ad esempio un PDF solo testo).

**M3. Il catalogo ha due fonti che possono divergere, e l'upsert non toglie mai i dati cancellati dai file (righe 135, 232–236, 293).**
- Non è detto da dove legge il catalogo il configuratore dopo la fase 3: dai file importati o dal database. Il server valida con `valuta` usando le regole del database. Se un file cambia e il seed non viene rifatto, l'interfaccia permette scelte che il server rifiuta, o il contrario.
- L'upsert "mai una cancellazione totale" lascia per sempre nel database i valori e le regole tolti da un file. Così il database contiene opzioni che la fonte non ha più. L'unico rimedio è `db:reset`, che cancella anche le configurazioni salvate.
- Il motivo dato alla riga 234 ("così le configurazioni salvate non si perdono") non regge: `configuration` non ha chiavi esterne verso il catalogo (riga 205). Cancellare e ricaricare le tabelle del catalogo in una transazione è quindi sicuro.

*Raccomandazione:* fissare una sola fonte a runtime, cioè il database, passato al client come props. Rendere il seed una sincronizzazione completa delle sole tabelle del catalogo, in transazione. Correggere il motivo alla riga 234.

**M4. Doppi invii, righe ferme in `in_attesa` e "Riprova" senza limiti (righe 200–201, 299–313).**
- **Timeout.** Il "timeout di circa 10 secondi" (riga 303) non esiste in Nodemailer come limite totale: ci sono `connectionTimeout`, `greetingTimeout` e `socketTimeout`, quest'ultimo sull'inattività. Se il limite si ottiene con un `Promise.race`, Gmail può consegnare l'email dopo che la riga è già stata segnata `fallita`. A quel punto "Riprova" manda un doppione.
- **Righe ferme.** Se il processo si interrompe tra il passo 3 e il passo 5, la riga resta `in_attesa` per sempre. Non è detto se "Riprova" vale per `in_attesa`, né cosa mostra la conferma.
- **Clic contemporanei.** Non c'è un blocco tra due "Riprova" contemporanei, né tra "Riprova" e una riga già `inviata`.
- **Notifica.** Non è detto se "Riprova" rimanda anche la notifica al progetto quando è `fallita`.
- **Abuso.** Chi conosce il token può far partire un numero illimitato di email verso quell'indirizzo, consumando la reputazione Gmail che la riga 322 vuole proteggere.

*Raccomandazione:*
- impostare i tre timeout di Nodemailer in modo esplicito;
- fare l'aggiornamento di stato in modo condizionale (`UPDATE … WHERE stato_cliente <> 'inviata'`), così un solo "Riprova" alla volta ottiene la riga;
- fissare un numero massimo di tentativi e un intervallo minimo tra l'uno e l'altro;
- definire il comportamento per `in_attesa` vecchie di più di N secondi.

**M5. Non è detto come la notifica "non blocca la risposta al cliente" (righe 304, 79).** In una Server Action, o la promessa si attende, e allora blocca, o non si attende. Nel secondo caso errori e aggiornamento di `stato_progetto` possono perdersi senza traccia, e il criterio di successo 4 richiede proprio entrambi gli stati `inviata`. Il documento non nomina il meccanismo (ad esempio `after()` di Next.js) né la gestione degli errori.

*Raccomandazione:* nominare il meccanismo. In alternativa, dato che una notifica dura pochi secondi, attenderla comunque entro il limite dei 60 secondi di RNF4 e togliere la frase.

**M6. Il controllo preliminare, così com'è scritto, non parte mai (riga 173).** `npm run demo` esegue "in ordine" `next start` e poi `npm run check`. Ma `next start` è un processo che non termina, quindi il controllo che dovrebbe proteggere la demo non viene eseguito. Non è detto neanche se un FAIL ferma l'avvio.

*Raccomandazione:* eseguire `check` prima di `next start` e interrompere l'avvio se fallisce. La conversione di prova e `verify()` non richiedono il server avviato. In alternativa, lanciarli in parallelo dichiarandolo.

**M7. Il rischio "utenti noti" si basa su un'ipotesi falsa: app e database sono raggiungibili dalla rete locale (righe 14, 171, 340, 399).**
- `next start` ascolta su tutte le interfacce per impostazione predefinita.
- Una porta pubblicata da Docker (`5433:5432`) è aperta su `0.0.0.0` se non si specifica altro.

Sulla rete dell'università o della sede, dove la riga 330 prevede la demo, chiunque può usare il pulsante per inviare email dal Gmail del progetto. Può anche raggiungere il database, che contiene email reali, con le credenziali del `.env.example`. L'accettazione del rischio (righe 340 e 399) vale solo con l'accesso limitato al portatile.

*Raccomandazione:* usare `next start -H 127.0.0.1` e `127.0.0.1:5433:5432` nel compose, e aggiungerli alla sezione 7 e alla sezione 13 come regole. Inserire il rischio nella tabella 20.1.

**M8. La cancellazione su richiesta non copre la cartella "Posta inviata" di Gmail (righe 382–384, contro P11).** Gmail salva in automatico nella "Posta inviata" ogni messaggio spedito via SMTP. Quindi la casella del progetto conserva, per ogni cliente, l'indirizzo e il PDF. Lo script per email cancella solo dal database. Questo indebolisce anche il motivo di P11 ("meno copie di dati personali"), perché la copia completa esiste comunque. La procedura `older_than:12m` copre la conservazione ma non le richieste di cancellazione (art. 17).

*Raccomandazione:* estendere la procedura di cancellazione alla ricerca `to:<indirizzo>` nella casella del progetto. Dichiararlo nell'informativa e correggere il motivo di P11.

**Nit**
- **N1 (righe 117, 144, 164, 283).** Lo standard vieta di attribuire un rifiuto a un responsabile senza un riferimento. "Il tutor ha indicato" (Docker, SQLite) e "il tutor ha autorizzato" (immagini del sito) non rimandano a nessuna traccia (email o verbale). Il rifiuto di SQLite regge anche sugli altri motivi; conviene comunque citare la fonte dell'indicazione, soprattutto per l'autorizzazione a usare le immagini.
- **N2 (riga 135).** "I vincoli del database … garantiscono l'integrità anche per i dati scritti dall'applicazione". L'unica tabella scritta dall'applicazione è `configuration`, che di proposito non ha chiavi esterne e tiene i dati in JSONB. Restano solo `UNIQUE`, `NOT NULL` ed enum: ridimensionare la frase.
- **N3 (riga 385).** "`next/font` scarica il font alla build" contraddice P14 (`next/font/local` con TTF nel repository). Implicherebbe anche una build che richiede la rete, contro RNF3.
- **N4 (righe 340 e 425).** Permettere di incollare nel campo di conferma è corretto per l'accessibilità, ma annulla in parte l'effetto dichiarato alla riga 340 (chi incolla copia anche il refuso). Dichiararlo nel rischio accettato.
- **N5 (righe 199 e P5).** `numero` si ricava da `id` e dall'anno: conviene una colonna generata o un calcolo in lettura invece di una seconda scrittura dopo l'inserimento, e va detto quale.
- **N6 (riga 382).** Cancellazione per email: normalizzare l'indirizzo in minuscolo al salvataggio e confrontare con `lower()`. Non `citext`, che è un'estensione e violerebbe la regola 2 della sezione 13.
- **N7 (righe 380–381).** Senza scheduler, la conservazione dipende da quante volte si lancia `npm run demo`. Un `DELETE` delle righe scadute dentro la Server Action di invio costa una riga di codice e non viola la sezione 13.
- **N8 (righe 91, 138, 415).** "Senza modifiche al codice" è troppo forte: con un servizio online dietro un pooler in modalità transaction (PgBouncer, Supavisor), `postgres.js` richiede `prepare: false`. Basta scrivere "salvo le opzioni del driver".
- **N9 (riga 266).** L'"alternativa da valutare" (SVG disegnato a mano) non ha un criterio di attivazione legato alla regola di decisione del punto 5. Basta una frase su quando si sceglie.

**Nota sullo standard.** Nell'ambito 1–434 mancano le alternative per il fornitore email e per il catalogo come file. Ci sono nelle schede 0017 e 0018 e in P1, quindi va bene, perché la riga 22 rimanda alle schede. I rischi delle sezioni M2, M3, M4, M7 e M8 non compaiono invece nella tabella 20.1: vanno aggiunti lì quando si correggono.

### egm-structural

Nessun Blocker, 9 Major, 7 Nit. Le gerarchie dei titoli sono corrette, ma lo standard non è rispettato in tre punti: Problem Statement, Non-Goals e Risks non compaiono nell'intervallo; molte decisioni non hanno qui le alternative; il modello dati non corrisponde al formato reale del catalogo. Il revisore ha scritto le severità in testo e non con le emoji, per le proprie regole di output.

**Mappa della struttura (righe 1-434).**
- H1 (riga 1), poi le H2 numerate da 1 a 14, separate da `---`. Le H3 compaiono solo nelle sezioni 6, 8, 9 e 10.
- Non ci sono livelli saltati e la numerazione è sequenziale e coerente con le H3.
- Confronto con lo standard:
  - **Problem Statement:** assente. Si avvicinano le sezioni 1 e 2.
  - **Goals & Non-Goals:** i Goals ci sono in parte (sezioni 2 e 4). I Non-Goals non hanno una sezione: sono sparsi, e la sezione 21 è fuori intervallo.
  - **Proposed Architecture:** solo 10.1, molto ridotta.
  - **Alternatives Considered:** complete in 6, parziali in 9 e 11, assenti altrove.
  - **Risks & Mitigations:** non c'è una sezione nell'intervallo (la 20.1 è fuori). Sono distribuiti in 9.2, 10.5 e 10.6.

**1. [Major] Manca il Problem Statement (righe 7-20).** Lo standard chiede di spiegare quale problema di business o dell'utente si risolve. La sezione 1 elenca vincoli di progetto (tirocinio, due sviluppatori, email obbligatoria). La sezione 2 descrive *cosa* si costruisce, non *perché*: a chi serve un configuratore, cosa manca oggi su effe.it, cosa deve dimostrare la demo. Chi arriva da zero non trova la motivazione.
Proposta: aggiungere un breve paragrafo "Problema" in testa alla sezione 2, oppure una H2 dedicata prima di "Obiettivo".

**2. [Major] Non-Goals assenti come sezione e senza rimando (righe 18-38, 210, 244).** Le esclusioni sono sparse:
- prezzi alla riga 210, senza riferimento alla scheda 0004;
- 3D alla riga 244;
- ricontatto alla riga 33;
- link di conferma alla riga 340.

L'esclusione dell'IA (scheda 0005) non compare in nessuna riga tra 1 e 434. Le esclusioni sono raccolte solo nella sezione 21, fuori intervallo, e nessuna sezione dell'intervallo vi rimanda. Lo standard vuole Goals e Non-Goals affiancati.
Proposta: una sottosezione "Cosa non fa" nella sezione 2, oppure un rimando esplicito alla sezione 21.

**3. [Major] La tabella delle decisioni non si può ricondurre alle schede ed è incompleta (righe 22-38).**
- La riga 22 dice "Ogni decisione ha la sua scheda", ma la tabella non ha né un link né il numero della scheda.
- Mancano decisioni registrate nel README: Prezzi (0004), IA (0005), Git (0013), Generatore per famiglie (0016), Email Nodemailer/Gmail (0017), Next.js/Server Action/Zod/shadcn (0019), Regole condivise (0020).
- Non c'è una colonna Stato. "Privacy" è presentata come "decisione presa", ma la 0007 è "Proposta". Anche 0015 e 0016 sono "da confermare/verificare".
- Una sola riga ("Migrabilità", riga 38) rimanda a una sezione; le altre no. Lo stile è incoerente.

Proposta: aggiungere le colonne "Scheda" (con link) e "Stato", e completare le righe mancanti.

**4. [Major] Identificativi usati prima di essere definiti, glossario incompleto (righe 199-201, 246, 252, 258, 307, 366).**
- "P4" e "P5" compaiono alle righe 199-201 e 307 senza rimando. Sono definiti solo alla riga 615 (sezione 20.3).
- Le "fasi" sono citate senza rimando alla 15.5: fase 7 (riga 246), fase 3 (righe 252 e 259), fase 2 (riga 366), fase 1 (riga 329).
- "contratto" alla riga 258 non ha rimando; la riga 227 invece lo ha.

Il glossario (sezione 3) non definisce "Contratto condiviso", "Fase", "P1-P15", "Livello A/B" né "posta in uscita". Chi legge da zero incontra sigle opache.
Proposta: aggiungere le voci al glossario e i rimandi "(sezione 20.3)" e "(sezione 15.5)".

**5. [Major] Il modello dati non corrisponde al formato reale del catalogo (righe 186-208, 227, 274, 362).** Il confronto con `aladdin.json` mostra tre problemi.

*Nomi incoerenti per la stessa colonna:*
- `passo` (righe 193 e 227) contro `step` nel JSON;
- "zone interessate" (righe 193 e 227, un nome con uno spazio, quindi non un identificatore) contro `option_group.zone` (riga 274) contro `zones` nel JSON;
- "colore" (riga 192) e `material.colore` (riga 362) contro `color` nel JSON.

*Lingue mescolate nei nomi delle colonne:* `numero`, `stato_cliente`, `in_attesa` accanto a `product_code`, `expires_at`, `request_id`.

*Campi del JSON senza una colonna:* `designer`, `source`, `defaultSize`, `fixedZones`, `photos`, il `default` di ogni gruppo e la `label` del gruppo. Due assenze sono necessarie a funzioni descritte nel documento stesso:
- `photos` serve al livello B (riga 262);
- `default` serve alla regola della riga 292 e alla scheda 0020.

*Ambito di regole e materiali non definito:*
- `option_rule` (riga 195) non ha la colonna prodotto;
- `material` è globale, mentre nel JSON i materiali sono dichiarati per prodotto.

La riga 227 rimanda tutto al contratto, ma la tabella dovrebbe almeno elencare i campi già fissati dalla bozza.

**6. [Major] Le alternative mancano in molte sezioni dell'intervallo (Alternatives Rule).** Solo la sezione 6 segue lo schema completo (criteri, confronto, motivi, alternative). Altre scelte non hanno alternative nel testo e non rimandano alla scheda che le contiene:
- Next.js + React (riga 20): le alternative sono nella 0019 (Vite più backend separato).
- Catalogo come file (8.2): le alternative sono nella 0018 (solo database, TypeScript, YAML).
- Stato nell'URL e Server Action (10.1): sono nella 0019.
- Nodemailer/Gmail (10.2 e 10.5): le alternative (Resend, SendGrid, CC nascosta) sono nella 0017.
- Regole condivise (10.1): sono nella 0020.
- Docker (sezione 7): Supabase, cioè l'alternativa davvero scartata, non compare.
- Migrabilità (13) e Accessibilità (14): nessuna alternativa.
- Impaginazione PDF (riga 364): mancano `@react-pdf/renderer` e jsPDF, presenti nella 0015.

Proposta: in ogni sezione, una riga "Alternative" con le opzioni scartate e il motivo, oppure almeno un link alla scheda.

**7. [Major] Motivazioni di scarto non concrete o non documentate (righe 144, 164, 360, 244).**
- **Riga 360:** Playwright/Puppeteer è scartato con "pesante". Lo standard chiede un trade-off concreto: la 0015 lo dà ("richiedono un browser sul server"), il testo no.
- **Riga 244:** il 3D è scartato perché "pesante e di qualità inferiore", senza un dato o un criterio.
- **Righe 117, 131, 144 e 164:** la motivazione principale ("indicazione del tutor") è attribuita a una persona senza un riferimento verificabile (email, verbale, nota datata). Lo standard vieta di attribuire uno scarto a un referente senza collegare la fonte. Per SQLite ci sono anche motivi tecnici, quindi lì il danno è minore. Per Docker (riga 164) l'indicazione è l'unico motivo dato per la scelta di Docker.

**8. [Major] Proposed Architecture troppo ridotta (righe 287-293).** La 10.1 è fatta di tre punti. Non c'è uno schema dei componenti né del flusso dei dati: browser, Server Action, `valuta`, Drizzle/PostgreSQL, generatore, resvg, PDFKit, Nodemailer. Mancano anche le route e le cartelle (`src/contratti/`, `src/lib/viste/`), che sono nella 0019 e nella 15.1. Lo standard chiede "component layout, data flows, ecosystem integration".
Proposta: un elenco o un diagramma dei componenti con le loro dipendenze e la tabella delle route, o almeno un rimando alla 0019.

**9. [Major] Rischi e mitigazioni sparsi, senza rimando alla 20.1 (righe 250-266, 329-336, 340).** Nell'intervallo i rischi stanno in tre punti con forme diverse:
- un elenco numerato in 9.2;
- un elenco di guasti in 10.5;
- un paragrafo di rischio accettato in 10.6.

Due rischi di sicurezza non hanno mitigazione nel testo dell'intervallo:
- il token non indovinabile è nominato (riga 200), ma il motivo (riga 600 e scheda 0017) non è dato;
- l'abuso del pulsante per mandare email a indirizzi qualsiasi è solo accennato in 10.6.

Nessuna sezione rimanda alla tabella 20.1.
Proposta: chiudere ogni sezione che contiene rischi con un rimando a 20.1, oppure portare la tabella dei rischi nell'intervallo della specifica.

**10. [Nit] Pseudo-titoli in grassetto invece di H3 (righe 66, 75, 166, 178, 180, 346-366).** La sezione 11 usa etichette in grassetto ("Problema.", "Decisione:", "Motivi", "Alternative", "Ripiego…:", "Impaginazione:", "Prova") per gli stessi blocchi che nella sezione 6 sono H3 (6.2 Decisione, 6.5 Motivazioni, 6.6 Alternative). Così non compaiono nell'indice. Anche la punteggiatura cambia da un'etichetta all'altra (punto, due punti, niente). Vale lo stesso per "Funzionali"/"Non funzionali" (4) e "Come si usa"/"Prerequisiti"/"Immagini" (7).
Proposta: usare H3 numerate (11.1 Problema, 11.2 Decisione, …) e uno stile unico per le etichette.

**11. [Nit] 6.7 Drizzle sta sotto "Scelta del DBMS" (righe 95, 107-109, 147-158).** L'ORM non è un DBMS. Anche la 6.2 mette insieme tre decisioni con schede diverse (0001, 0014, 0003).
Proposta: rinominare la sezione 6 in "Database e ORM", oppure spostare Drizzle in una H2 o H3 propria.

**12. [Nit] I requisiti della sezione 5 non hanno identificativi e duplicano la sezione 4 (righe 84-91).** La sezione 5 è un elenco numerato senza ID, mentre la 4 usa RF e RNF. Il punto 5.5 duplica RF7 e il 5.6 duplica la sezione 13. Le sezioni di progetto non citano mai gli ID (ad esempio RF3 per 10.1, RNF4 per 10.2), quindi non si può ricostruire quale sezione copre quale requisito.
Proposta: prefissi del tipo RD1… e rimandi agli ID nelle sezioni di progetto.

**13. [Nit] Link e riferimenti alle schede con stili diversi (righe 22, 364, 366).**
- Alla riga 364 c'è un link Markdown valido alla 0015. Alla riga 366 la stessa scheda è citata solo come testo ("scheda 0015").
- Alla riga 22 il percorso `docs/decisioni/` non corrisponde a quello attuale (`docs-iniziali/docs/decisioni/`). Il motivo è spiegato solo alla riga 561.
- Il link della riga 364 si romperà quando le schede saranno spostate.

Proposta: un unico stile di link e una nota sul percorso alla riga 22.

**14. [Nit] L'esempio `config` non corrisponde alle etichette del catalogo (righe 217-222).**
- `"group": "Pedana in gres"` contro la `label` di aladdin.json "Pedana a pavimento in gres (120 × 120 × 5 cm)".
- `"label": "Aladdin 60 (200 × 160 × 210 cm)"` contro la `label` del taglio "Aladdin 60". La regola che compone l'etichetta salvata non è indicata.

Anche il glossario (riga 50) usa "Pedana in gres".

**15. [Nit] Manca un indice (riga 1).** Il documento ha 25 sezioni H2 e molti rimandi interni, ma non ha un indice dopo l'introduzione.

**16. [Nit] Contraddizioni di contenuto emerse durante la mappatura (fuori dall'ambito strutturale, segnalate per il Root).**
- **Riga 173:** `npm run demo` esegue il controllo preliminare *dopo* `next start`. Ma `next start` resta in esecuzione e non termina, quindi in una sequenza il controllo non partirebbe mai.
- **RNF3 (riga 78):** chiede "un solo comando", ma la riga 176 prevede di copiare `.env` a mano. È coerente con la riga 498, ma conviene dichiararlo anche in RNF3.

### egm-style

Nessun Blocker, 10 Major, 15 Nit. Il registro del documento è in gran parte asciutto e fattuale. I problemi principali sono quattro: affermazioni non verificate scritte come fatti, criteri di decisione che non si possono misurare, nomi tecnici incoerenti e frasi ripetute.

**Major**

**M1. Righe 38, 91, 138, 415: migrabilità ripetuta quattro volte e mai verificata (CALIBRATE).** La frase "richiede solo un cambio di configurazione (connessione, SSL), senza modifiche a schema o codice" compare quattro volte quasi uguale. In più descrive come certo un comportamento che nessuno ha provato: anche le schede 0012 e 0014 non riportano una verifica. Proposta: tenerla una volta sola (sezione 13) e scriverla come intento di progetto ("progettato per richiedere solo…"). Nelle righe 91 e 138 basta un rimando alla sezione 13.

**M2. Riga 158 in contrasto con la riga 151.** "Schema e query restano SQL" contraddice la riga 151 ("Lo schema è scritto in TypeScript"). Anche "si può cambiare strada con poco lavoro" non ha una stima. Proposta: dire con precisione che cosa resta portabile (le migrazioni SQL generate) e togliere "con poco lavoro" o dargli una misura.

**M3. Riga 136: "Si ottiene la flessibilità di un database a documenti mantenendo l'integrità" (CALIBRATE).** L'integrità garantita dal database (chiavi esterne, `CHECK`) non copre il contenuto delle colonne JSONB: lì la struttura la controlla solo Zod. Lo stesso vale per la riga 135, "garantiscono l'integrità anche per i dati scritti dall'applicazione", mentre `product_code` (riga 205) è senza chiave esterna e `config` è JSONB libero. Proposta: limitare l'affermazione alle colonne relazionali e dire che JSONB è validato da Zod.

**M4. Riga 144 (e scheda 0001): "SQLite… non ha JSONB né lo stesso supporto ai vincoli".** È impreciso. SQLite ha un formato JSONB dalla versione 3.45. Supporta anche `CHECK` e chiavi esterne, queste ultime disattivate di default e da attivare con `PRAGMA foreign_keys`. La differenza reale è un'altra: niente indici GIN e chiavi esterne non attive per default. Proposta: riscrivere con questa differenza precisa, oppure togliere il motivo, che non serve: gli altri due motivi (indicazione del tutor, stesso motore online) bastano.

**M5. Righe 124–131: scala di giudizio non definita nella tabella di confronto.** "Ottimo / Buono / Discreto / Debole / Sconsigliato" sono giudizi soggettivi senza un criterio. C'è anche un'incoerenza interna: MySQL ha "Ottimo" su "Dati relazionali e vincoli", ma la riga 143 lo penalizza perché i `CHECK` sono applicati solo dalla 8.0.16. Proposta: mettere in ogni cella il fatto concreto (per esempio "JSONB + GIN", "JSON senza GIN", "nessuna chiave esterna tra collezioni"), come già fanno alcune celle tra parentesi, e togliere gli aggettivi.

**M6. Riga 78 (RNF3) in contrasto con la riga 176.** "Avvio della demo da clone pulito con un solo comando" non regge: la riga 176 dice che `.env` "si copia a mano", e la riga 178 elenca prerequisiti (WSL2, Docker Desktop avviato, porta 5433 libera). Proposta: "da clone pulito, con `.env` presente e i prerequisiti della sezione 7, con un solo comando (`npm run demo`)".

**M7. Righe 72, 312: "un messaggio chiaro" in un requisito (RF6).** "Chiaro" non si può verificare. Proposta: dire che cosa contiene il messaggio (esito, causa in termini comprensibili, azioni disponibili "Riprova" e "Scarica il PDF").

**M8. Righe 356, 359, 366: criterio di ripiego del PDF non misurabile e risultato dato per scontato (CALIBRATE).**
- La riga 356, "Le differenze rispetto allo schermo riguardano solo pochi effetti, che la prova individua", anticipa l'esito di una prova non ancora fatta (la scheda 0015 dice "Da completare").
- La riga 359, "se la prova mostra differenze evidenti", e la riga 366, "confrontato a vista", non danno una soglia per decidere.

Proposta: alla riga 356 scrivere "Le differenze attese riguardano `<pattern>`, fusioni e filtri (`feTurbulence`); la prova le verifica". Alla riga 359 elencare che cosa fa scattare il ripiego (per esempio texture assenti, quote illeggibili, accenti mancanti).

**M9. Righe 193, 227, 274, `aladdin.json`: nomi dei campi incoerenti.** Lo stesso concetto ha quattro nomi: "zone interessate" (tabella e riga 227, anche in code font), `option_group.zone` (riga 274), `zones` nel JSON. Allo stesso modo `passo` (riga 227) corrisponde a `step` nel JSON. Inoltre la tabella `configuration` mescola identificatori italiani (`numero`, `stato_cliente`, `in_attesa`) e inglesi (`token`, `expires_at`, `request_id`), mentre il glossario (righe 47–53) fissa nomi inglesi nel codice. Proposta: usare un solo identificatore per campo, quello reale del codice, e dichiarare la convenzione di lingua degli identificatori.

**M10. Righe 218–222 e 48, 50: le etichette dell'esempio di snapshot non sono quelle del catalogo.** Lo snapshot è definito come "copia delle scelte, con le loro etichette" (riga 58). L'esempio però usa etichette diverse da quelle di `aladdin.json`:
- "Aladdin 60 (200 × 160 × 210 cm)" contro `"Aladdin 60"`;
- "Pedana in gres" contro "Pedana a pavimento in gres (120 × 120 × 5 cm)";
- "Gres Moka" contro "Gres Masterpiece Moka".

Le chiavi (`"rovere"`, `"moka"`) invece coincidono con i codici dei valori nel JSON. Proposta: allineare l'esempio alle etichette reali, oppure dire che le etichette dello snapshot sono composte. In più, alla riga 48 l'ordine larghezza × profondità × altezza è un'ipotesi (vedi `_daVerificare` nel JSON), ma il glossario lo presenta come fatto.

**Nit**

**N1. Riga 272: firma della funzione incompleta.** `(geometria, scelte, vista) → stringa SVG` omette il parametro `opzioni`, che serve per `flat: true` (riga 362) e per il prefisso degli `id` (riga 277). La scheda 0016 lo include. Proposta: allineare la firma.

**N2. Riga 385: "`next/font` scarica il font alla build".** Suggerisce un download da Google. La scheda 0016 prevede invece file TTF locali in `src/fonts/` (quindi `next/font/local`, senza rete). Proposta: precisare.

**N3. Righe 244, 246: affermazioni soggettive sulla grafica.**
- "immagini grafiche di qualità" e "di qualità inferiore ai configuratori online" sono giudizi senza evidenza. Proposta: scrivere il motivo verificabile (tempi, assenza dei modelli 3D per tutti i prodotti, come nella scheda 0010).
- "La vista interna è scartata perché difficile da replicare" (riga 246) è vaga. Si confonde poi con la riga 248, dove il mockup chiama "Interno" la vista frontale. Proposta: dire quale vista interna è esclusa (per esempio la prospettiva interna) e perché.

**N4. Righe 143–145, 149, 156: registro colloquiale o soggettivo.** "andrebbe benissimo e la scelta sarebbe difendibile", "Ottimo per un prototipo locale", "È tentante", "è più guidato". Alle righe 149 e 156 la prima persona ("conosciamo") è l'unica del documento, che altrove usa forme impersonali. Proposta: togliere o rendere impersonale.

**N5. Riga 154: "Leggero. Pesa poco".** È ridondante e senza misura. Proposta: togliere il punto o indicare il dato concreto (nessun motore o processo separato).

**N6. Riga 266: "più veloce e più bello".** "Più bello" è soggettivo. Proposta: lasciare solo il criterio di tempo, come nella scheda 0016.

**N7. Riga 259: "possibilmente con un interno diverso".** È un'indicazione vaga. Proposta: un criterio di scelta, per esempio "di una famiglia di layout diversa da Aladdin".

**N8. Riga 279 (DROP o CALIBRATE).** "Il peso di una vista va misurato…" non dice a quale decisione porta la misura (soglia, scelta tra data URI e riferimento). Proposta: aggiungere soglia e decisione, oppure togliere la frase.

**N9. Riga 336 (CALIBRATE).** "I limiti di volume di Gmail… per una demo bastano" non ha numeri. Proposta: indicare il limite giornaliero e il numero di invii previsti.

**N10. Righe 362, 387: riempitivi.** "deciso fin d'ora" e "si implementano davvero": "fin d'ora" e "davvero" non aggiungono significato.

**N11. Righe 391–399: motivazioni soggettive nella colonna "Motivo".** "Non costa nulla", "si mostra bene", "Pratica standard". Proposta: dare motivi verificabili o togliere la colonna per queste voci.

**N12. Riga 407 (CALIBRATE).** "coincidono con le impostazioni predefinite" non vale per tutte le regole. Le regole 2 e 4 (niente estensioni, PDF in memoria, log sull'output del server) sono vincoli di progetto, non impostazioni predefinite. Proposta: "richiedono poco lavoro in più".

**N13. Riga 426: tempo verbale.** "Contrasti, etichette… sono verificati" è scritto al presente e sembra una verifica già fatta, mentre i risultati andranno in `docs/prove.md` (riga 430). Proposta: "si verificano". Alla riga 427, "dà una buona base" è un giudizio: basta "gestisce focus, ruoli ARIA e tastiera" (come nella scheda 0019).

**N14. Riga 178 (RELOCATE).** L'avvertenza su `docker compose down -v` sta nei prerequisiti, lontana dal punto in cui si decide. Proposta: spostarla accanto a `npm run db:reset` (riga 175) o all'elenco dei comandi.

**N15. Varie.**
- Riga 180: "in formato ottimizzato" è vago. Proposta: indicare formato e risoluzione massima.
- Riga 364: il link `docs-iniziali/docs/decisioni/0015-…` non coincide con il percorso dichiarato alla riga 22 (`docs/decisioni/`).
- Righe 14, 387, 394: "il tutor inserisce un'email vera" è ripetuto tre volte.
- Riga 99: "in modo sicuro" è generico.

**Note per il chiamante.** Le imprecisioni di M4 (SQLite) e di M1 (migrabilità non verificata) compaiono anche nelle schede 0012 e 0001. Se si corregge il documento, conviene aggiungere una nota datata anche alle schede.

---
---

# Stage 7: Critic Review, round 2 (ri-audit)

- **Intervallo:** FeatureRange 1..462, dopo le correzioni del round 1
- **Revisori:** egm-design (completed: 0 Blocker, 10 Major, 10 Nit), egm-structural (completed: 0 Blocker, 5 Major, 7 Nit), egm-style (completed: 0 Blocker, 9 Major, 13 Nit)
- **Esito del round:** non pulito. Il loop non converge. Questo era l'**unico ri-audit ammesso** per lo Stage 7: non si fanno altri giri di revisori su questo stage.

## Come leggere i risultati

Molti Major nascono dalle correzioni del round 1, per due motivi:
- alcune correzioni sono **incomplete** (R1, R2, R3, R6, R12, R13);
- le correzioni hanno reso le **schede del registro** non più allineate al documento (R10).

Non c'è **churn**: annullare le correzioni non risolverebbe questi problemi, li riporterebbe allo stato del round 1.

## Findings consolidati del round 2

### 🟡 Major

| Id | Tema | Righe | Fonti | Proposta sintetica |
|---|---|---|---|---|
| R1 | `npm run demo` si ferma a ogni FAIL, quindi anche se Gmail non risponde. Proprio nel guasto più probabile la demo non parte e salta il ripiego "Scarica il PDF". La sequenza di avvio è diversa nella riga 186, nella riga 342 e nella scheda 0014. Il rinvio delle notifiche avviene prima di `verify()` | 186, 340-342, 351-356 | design M1, N3; structural M5; style M8 | Un solo elenco ordinato con verbi concreti. FAIL bloccanti solo per database, migrazioni e prodotti; SMTP e conversione solo come avviso. Notifiche rimandate dopo l'avvio, con un tetto ai tentativi |
| R2 | La condizione `WHERE customer_status <> 'sent'` non impedisce due "Riprova" contemporanei. Il limite di 3 tentativi e l'attesa di 30 s non sono nella condizione. Non è detto se il primo invio conta tra i tentativi | 339-340 | design M2; style N5 | Una sola UPDATE atomica (`failed` o `pending` vecchio, `attempts<3`, intervallo) con `RETURNING`: si invia solo se torna una riga. Definire il conteggio dei tentativi e cosa vede il cliente quando sono finiti |
| R3 | "Circa 20 s" nel caso peggiore è falso. I timeout di connessione e di saluto si sommano; `socketTimeout` misura l'inattività e non mette un tetto all'invio. La scheda 0017 dice che la notifica "non blocca", il documento che "si attende" | 92, 328-329 | design M3; style M1 | Scadenza complessiva per ogni invio (circa 15 s, con `AbortSignal` o `Promise.race`). Ricalcolare il caso peggiore e allineare la 0017 |
| R4 | `valuta(config, regole)` non controlla i codici rispetto al catalogo: valore inesistente, valore di un altro gruppo, gruppo `single` mancante, taglio inesistente, gruppo estraneo al prodotto | 82, 312, 325 | design M4 | `valuta` o `validaConfig(config, prodotto)` ricevono il prodotto completo. Elencare nel contratto i controlli strutturali |
| R5 | La sincronizzazione del seed non specifica cosa succede alle chiavi esterne quando si cancella (`option_rule` verso un `option_value` cancellato) né quando si cancellano materiali condivisi. Non è chiaro se Zod valida prima o dentro la transazione. Contraddice la scheda 0018 | 242, 248-251 | design M5; structural M2; style M7 | Chiavi esterne RESTRICT, ordine di cancellazione, un materiale si cancella solo se non compare in nessun file. Zod prima, scrittura in transazione. Nota datata nella 0018 |
| R6 | Il ripiego "solo elenco" del PDF copre solo prodotto mancante e geometria non valida. Non copre un valore o un taglio rimosso, un materiale cambiato o una regola nuova | 101, 330, 381 | design M6 | Qualsiasi errore nel risolvere lo snapshot contro il catalogo porta al PDF con il solo elenco. Prova automatica con uno snapshot che cita un codice rimosso |
| R7 | **Nuovo.** C'è un solo trasporto SMTP per il rischio più alto: se Google blocca l'account, non c'è mitigazione | 11, 35, 328, 357-364 | design M7 | Secondo trasporto SMTP nel `.env`, provato nella fase 1. Con Nodemailer non serve codice nuovo |
| R8 | **Nuovo.** L'art. 6(1)(b) non copre la seconda finalità (conservazione per la dimostrazione). I 12 mesi non sono motivati (art. 5(1)(e)). Il titolare non è identificato | 400-405 | design M8 | Separare le finalità con la base di ciascuna, motivare o ridurre la durata, indicare il titolare. Aggiungere alla domanda 1 per il tutor |
| R9 | **Nuovo.** La cancellazione su richiesta copre un solo database, mentre l'indirizzo del tutor può stare su due portatili e in Mailpit | 187, 410 | design M9 | Elencare tutti i luoghi da ripulire, oppure ammettere indirizzi reali solo sul computer della demo |
| R10 | Le schede del registro non sono allineate alle correzioni: 0006 e 0017 (nomi degli stati, notifica attesa), 0010 e 0016 (viste frontale e diagonale), 0014 (`npm run demo`), 0018 (seed), 0001 (SQLite), 0012 (migrabilità), 0002 (Docker verificato) | 34, 41, 140, 186, 220, 249, 261-267, 435-443 | design M10, N1; structural M3, M4; style M5, M6, N1, N13 | Aggiungere a ogni scheda una nota datata 2026-11-11, come prevede il README del registro |
| R11 | Regola delle alternative: per Next.js, Server Action, email, impaginazione PDF, catalogo come file e regole il documento non nomina le alternative scartate, nemmeno in sintesi | 22-45, 244-251, 308-332, 386-392 | structural M1 (riapre C13: il rimando alla colonna "Scheda" non è bastato) | Una riga "Alternative scartate" per ogni decisione, con il link alla scheda |
| R12 | "Applicazione e database ascoltano solo su `127.0.0.1`" vale solo per `npm run demo`, non per `npm run dev` né per Mailpit | 185, 368 | style M9; design N6 | Riformulare: "nella demo…". Indicare dove gira Mailpit e su quale indirizzo ascolta |
| R13 | RF6 "in termini comprensibili" non si può verificare | 85 | style M3 (riapre C23) | Elencare le categorie di errore (rete, autenticazione, timeout, indirizzo rifiutato) e il messaggio e le azioni di ciascuna |
| R14 | "Immagini grafiche di qualità" non ha un criterio verificabile | 10, 259 | style M4 | Criteri: texture riconoscibile per materiale, quote leggibili, confronto con la foto ufficiale |
| R15 | "Prima di qualsiasi uso" (privacy): la demo stessa è un uso | 429 | style (nota a M9) | Fissare la fase entro cui ottenere la conferma del tutor (prima del flusso completo, fase 5) |

**Già chiuso, non riaperto:** style M2 (riga 454, "sono verificati" al presente). Nel round 1 era il Nit C29, chiuso con DECLINE, quindi resta chiuso. La correzione costa una parola, quindi si può applicare comunque se vuoi.

### 🟢 Nit (sintesi)

- **Esempio di `config`:** `"extras": []` su Aladdin, che non ha optional; `size` fuori da `selections` mentre P1 lo tratta come gruppo (design N4; structural N6; style N4).
- **Nomi delle colonne:** corrispondenza tra camelCase del JSON e snake_case delle colonne non dichiarata (`default` → `default_value`); `material.type` ha valori in italiano (design N5; structural N6).
- **`request_id`:** è generato dal client, quindi non esiste senza JavaScript; non è detto come si gestisce il conflitto in inserimento (design N2).
- **Accessibilità:** manca lo stato di caricamento accessibile durante l'attesa; i componenti Radix con `disabled` contro `aria-disabled` (design N7).
- **PDF:** numero e data mancano dall'elenco della 10.4 (design N8).
- **Driver PostgreSQL:** non scelto, mentre la sezione 13 ne cita le opzioni (design N9).
- **Indicazioni a voce:** annotare data e contenuto; Gmail comporta un trasferimento di dati fuori dall'UE da dichiarare nell'informativa (design N10).
- **Struttura:** Problema e Non-obiettivi senza H2 propri; pseudo-titoli in grassetto; DBMS e ORM nella stessa sezione; numeri delle schede senza link; guasti della 10.5 senza rimando alle mitigazioni; glossario senza seed, scheletro, blocco delle funzioni, posta in uscita, viste (structural N1-N7).
- **Stile:**
  - resvg "il testo scompare", affermazione troppo assoluta;
  - criteri della prova contro `feTurbulence`;
  - "a runtime solo dal database" contro le fasi 1-2;
  - giudizi colloquiali e prima persona;
  - definizioni da manuale;
  - "in tempo reale", "interno diverso", peso della vista, limiti di Gmail;
  - "poco lavoro in più" contro la 0012;
  - guasti 3 e 5 della 10.5 che non sono guasti

  (style N2-N13).
