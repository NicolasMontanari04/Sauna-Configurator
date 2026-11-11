# Stage 5: Initial Zoom Out Review

- **Documento:** `configuratore-saune-analisi-v6.md` (righe 1..831)
- **Divisione:** FeatureRange 1..434, DetailedRange 435..831
- **Contesto Goldfish:** `docs-iniziali/docs/decisioni/` (README, 0001-0020), `data/prodotti/aladdin.json`. L'URL effe.it è escluso su richiesta.
- **Revisori:** `egm-zoom-out`, `egm-inventive-catalyst`, eseguiti in parallelo e in contesti isolati.

## Sintesi

| # | Severità | Tema | Fonte |
|---|---|---|---|
| A | 🟡 Major | Lo snapshot non basta a rigenerare il PDF: "immutabile" e "rigenerabile" sono in conflitto | zoom-out M2 + catalyst 1 (**trovato da entrambi**) |
| B | 🟡 Major | Il catalogo sta in due posti (file e 6 tabelle) e il modello tabellare non corrisponde al JSON | zoom-out M1 |
| C | 🟡 Major | Il seed "mai cancellazione totale" non ha più motivo; non è detto da dove `valuta` legge le regole sul server | catalyst 4 (si collega a B) |
| D | 🟡 Major | La "posta in uscita" non ha nessun componente che la svuoti: stati `in_attesa` orfani, notifica fallita mai ripresa | catalyst 2 |
| E | 🟡 Major | Lo schema della geometria entra nel contratto prima del censimento e del secondo prodotto | zoom-out M3 |
| F | 🟡 Major | Motore delle regole completo senza nessuna regola reale (YAGNI) | zoom-out M4 |
| G | 🟡 Major | Resa grafica binaria (parametri o foto): manca il livello intermedio "SVG con zone nominate" | catalyst 3 |
| H | 🟡 Major | La sezione 20.3 duplica le schede 0016-0020 e scende nel dettaglio di codice | zoom-out M5 |
| N1-N8 | 🟢 Nit | `request_id` senza JS, ordine di `npm run demo`, filtro scadute, GIN, memoizzazione, colonne di stato, refusi, texture ripetibili | zoom-out N1-N7, catalyst 5 |

I problemi B e C sono collegati: tutti e due dicono che la relazione tra file e database non è definita. Conviene risolverli insieme.

---

## Report 1: egm-zoom-out

**Verdetto: da rivedere.** Non ci sono Blocker. Ci sono 5 problemi Major e 7 Nit. Il contesto basta (sezione 0 superata): obiettivo, vincoli e motivazioni sono chiari (righe 7-38). Il documento risolve il problema giusto, cioè una demo locale con email reale e grafica di qualità. Le scelte di piattaforma sono standard e non reinventano nulla. I punti deboli sono tre: la duplicazione del catalogo, alcune astrazioni fissate prima delle prove, e l'altitudine del documento.

**Riuso:** non c'è codice da riusare. Nel repository l'unico file sorgente è `data/prodotti/aladdin.json`, e il mockup non è nel workspace (riga 610).

### Major

**M1. Il catalogo sta in due posti e il database fa poco**
- **Ambito:** 8.1 (righe 188-196, 205), 8.2 (righe 229-236), 6.5.1 (riga 135), 22.6 (riga 760); scheda 0018.
- **Problema:** i file JSON sono la fonte. L'interfaccia li importa (riga 232) e `valuta` lavora sulle regole dei file. Poi gli stessi dati vengono normalizzati in sei tabelle (`product`, `product_size`, `material`, `option_group`, `option_value`, `option_rule`). Il motivo dichiarato, "seconda linea di difesa... anche per i dati scritti dall'applicazione" (riga 135), regge poco: l'unica tabella che l'applicazione scrive è `configuration`, e per scelta non ha chiave esterna verso il catalogo (riga 205).
- **Il modello tabellare non corrisponde ai file:**
  - `aladdin.json` contiene `photos`, `fixedZones`, `defaultSize`, `default` per gruppo, `source` e `designer`, ma le tabelle non li prevedono.
  - `material` è una tabella globale, mentre i materiali sono dichiarati dentro ogni file prodotto. Con l'upsert per codice, due prodotti con lo stesso `specchio` ma colori diversi si sovrascrivono.
  - `option_rule` non ha la colonna del prodotto (riga 195).
  - P1 cita `size` tra i codici di gruppo (riga 640), ma nel JSON i tagli sono un elenco separato.
- **Conseguenza:** il configuratore leggerà comunque i file, o dovrà ricostruire il file dal database. Sono due strade di lettura che possono divergere.
- **Proposta:** scegliere una sola strada di lettura per l'applicazione. La più semplice: tabella `product` con codice, nome, visualizzatore e una colonna `data` JSONB con il file validato da Zod. Le colonne servono solo per le query delle pagine, cioè l'elenco del catalogo. Le tabelle normalizzate si tengono solo se si dichiara quale query o vincolo le richiede davvero. Se il motivo vero è l'indicazione del tutor (riga 760), va scritto come motivo principale.

**M2. Snapshot immutabile e PDF rigenerato dal catalogo attuale sono in conflitto**
- **Ambito:** 5.3 (riga 88), 6.5.3 (riga 137), 8.1 (righe 205-225), 10.2.7 (riga 305), 11 (riga 353).
- **Problema:** il documento promette che la configurazione salvata "resta identica" anche se il catalogo cambia. Promette anche che "Scarica il PDF" e "Riprova" rigenerano il PDF dalla riga. Però lo snapshot (righe 214-225) contiene solo codici ed etichette. L'immagine richiede `geometry`, materiali, texture e foto del catalogo attuale.
- **Conseguenza:** se un prodotto viene tolto, un caso che il documento prevede esplicitamente (riga 205), la rigenerazione fallisce. Se il prodotto cambia, il PDF rigenerato non coincide con quello inviato.
- **Proposta:** decidere esplicitamente una di queste strade.
  - Il PDF rigenerato usa il catalogo attuale; se il prodotto manca, si produce un PDF con il solo elenco `lines`.
  - Lo snapshot conserva anche ciò che serve a ridisegnare.

  Per una demo basta la prima, purché sia scritta. Oggi è un'incoerenza nascosta.

**M3. Schema della geometria fissato nel contratto prima di avere i dati per farlo**
- **Ambito:** 9.2.1-9.2.3 (righe 252-259), 15.2 (righe 449-455), 15.5 fasi 2-3 (righe 480-481), 15.1 (righe 443-445); `aladdin.json` riga 65 (`"geometry": null`).
- **Problema:** lo schema Zod della geometria ("elenco di parti tipizzate") entra nella PR del contratto della fase 2. Il censimento per famiglie e il secondo prodotto SVG arrivano solo nella fase 3. Si stabilizza un'astrazione prima delle due prove che dovrebbero giustificarla. Oggi il generatore esiste solo come mockup con dati scritti nel codice, e la geometria di Aladdin è `null`.
- **Si aggiungono due complicazioni:**
  - La stessa PR di "circa 3 ore" contiene anche tipi, semantica delle regole, `valuta`, schema Drizzle, schema Zod del catalogo e dipendenze. È una stima poco realistica.
  - La divisione "N scrive i dati della geometria, M scrive le primitive" (riga 445) mette tra due persone l'interfaccia più instabile del progetto. Ogni modifica dello schema richiede una PR condivisa (riga 457).
- **Proposta:**
  - Togliere la geometria dal contratto iniziale. `geometry` è già JSONB e appartiene a `src/lib/viste/`, cioè a M.
  - Anticipare il censimento alla fase 1-2, che è lavoro da tavolino.
  - Fissare lo schema della geometria solo dopo il secondo prodotto.
  - In alternativa, lasciare a M sia schema sia dati di geometria finché lo schema non è stabile.

**M4. Motore delle regole completo senza nessuna regola reale (YAGNI)**
- **Ambito:** RF3 (riga 69), 8.1 `option_rule` (riga 195), P2 (righe 644-655), P3 (righe 657-663), criterio 3 (riga 505), appendice A (righe 810-811); scheda 0020 e `aladdin.json` (`"rules": []`).
- **Problema:** il sito non documenta né optional né regole. Il documento lo riconosce. Si progettano comunque:
  - tre tipi di regola con un ordine di applicazione fisso;
  - una tabella dedicata;
  - il ritorno al predefinito con annuncio `aria-live`;
  - gruppi `multi` con la sintassi a virgole nell'URL (riga 682);
  - un gruppo `extras` nel contratto (riga 640);
  - prove automatiche obbligatorie su un catalogo di prova per tutti e tre i tipi (riga 505).

  L'unico caso reale possibile è un `only_with_size` sulla pedana, ancora da verificare (riga 661).
- **Proposta:** implementare e provare solo `only_with_size` e i gruppi `single`. `valuta` resta l'unico punto di estensione: `requires`, `excludes` e `multi` si aggiungono quando una fonte li documenta. RF3 resta dimostrabile con la regola reale o con un solo prodotto di prova. Così si risparmia lavoro nella fase più carica senza chiudere strade future.

**M5. Il documento duplica le schede e scende troppo nei dettagli**
- **Ambito:** 20.3 (righe 613-716), parti di 8.1, 10.5 e 11; schede 0015-0020.
- **Problema:** le decisioni P1-P15 sono riportate quasi parola per parola sia nell'analisi sia nelle schede 0016-0020. Si creano due fonti di verità da tenere allineate. Lo stesso documento impone che ogni PR aggiorni la documentazione (riga 546) e che le schede non si modifichino ma si sostituiscano (README del registro, riga 3).
- **Dettaglio di codice che non serve a un'analisi:**
  - 16 byte di `crypto.randomBytes` in base64url (riga 666);
  - `patternContentUnits="objectBoundingBox"` (riga 704);
  - `transporter.verify()` (riga 326);
  - ordine di applicazione delle regole (riga 655);
  - `save-exact=true` (riga 694);
  - i tre passi del porting del mockup (righe 711-714).
- **Proposta:** nell'analisi tenere per ogni P una riga con decisione e motivo, cioè la tabella delle righe 617-633, più il link alla scheda. Il dettaglio implementativo deve stare solo nelle schede.

### Nit

**N1. `request_id` e "il modulo funziona senza JavaScript" si contraddicono**
- **Ambito:** riga 201, riga 307, riga 685.
- **Problema:** il `request_id` è generato dal client, quindi senza JavaScript non esiste. Inoltre l'intero configuratore è un componente client con anteprima live, quindi il funzionamento senza JavaScript non è un vantaggio reale.
- **Proposta:** togliere quel motivo da P8 e dalla scheda 0019. In alternativa, generare il `request_id` sul server al render del modulo, come campo nascosto.

**N2. Lo script `npm run demo` è in ordine impossibile**
- **Ambito:** riga 173; scheda 0014.
- **Problema:** `next start` non termina, quindi il controllo preliminare che lo segue nella sequenza non parte mai.
- **Proposta:** eseguire `npm run check` prima di `next start`, oppure in parallelo.

**N3. Filtro sulle righe scadute ridondante**
- **Ambito:** riga 379.
- **Problema:** il filtro "le letture ignorano le righe scadute" va ripetuto in ogni query. Però le letture avvengono solo per token, durante la demo, e la pulizia gira a ogni avvio.
- **Proposta:** si può tenere, ma la pulizia all'avvio basta per la demo. Un filtro dimenticato in una sola query vanifica la garanzia.

**N4. JSONB "indicizzabile" e GIN usati come argomento senza query che li richiedano**
- **Ambito:** righe 127, 136, 143.
- **Problema:** nessuna query prevista filtra dentro JSONB. Il vantaggio è teorico.
- **Proposta:** l'argomento migliore per PostgreSQL resta l'integrità più l'indicazione del tutor. Si può togliere il riferimento agli indici.

**N5. Ottimizzazione non misurata**
- **Ambito:** riga 273 ("memoizzata"), riga 279.
- **Problema:** la memoizzazione della geometria non è giustificata da una misura.
- **Proposta:** rimandarla a quando l'anteprima risulta lenta.

**N6. Molte colonne di stato per due invii**
- **Ambito:** righe 207-208.
- **Problema:** per ciascuno dei due invii ci sono enum, ultimo errore, tentativi e data, cioè 8 colonne. Per la demo bastano stato ed errore.
- **Proposta:** i tentativi e la data sono accettabili, ma sono un candidato da tagliare se lo schema va semplificato.

**N7. Problemi redazionali**
- **Riga 831:** la riga di tabella "Nuove sezioni" della sezione 23 è finita dopo l'appendice B, fuori dalla tabella.
- **Riga 274:** si cita `option_group.zone`, mentre la colonna si chiama "zone interessate" (righe 193 e 227) e nel JSON `zones`. Va uniformato nel contratto.
- **Scheda 0007 riga 7:** usa ancora "valutatore", in contrasto con la decisione "solo tutor" (riga 609).

---

## Report 2: egm-inventive-catalyst

**Contesto (verifica 0).** L'obiettivo è chiaro: una demo locale del configuratore, con invio reale del PDF e una scelta documentata per ogni decisione (righe 9-14, 20). Le contraddizioni principali sono già risolte bene: una funzione pura per anteprima e PDF (9.3, 11), la riga salvata prima degli invii (10.2), `valuta` condivisa (10.1) e il ripiego `flat`. Restano quattro compromessi da rivedere (Major) e un Nit.

### 1. Lo snapshot non basta a rigenerare il PDF
1. **Severity:** Major
2. **Affected Scope:** sezione 5 punto 3 (riga 88), 8.1 (righe 205-206, 212-225), 10.2 punto 7 (riga 305), sezione 11 "Motivi" (riga 353)
3. **False Compromise:** il documento promette che una configurazione salvata "resta identica anche se il catalogo viene modificato" (riga 88). Promette anche che il PDF si rigenera dalla riga salvata (righe 305, 353). Lo snapshot però contiene solo codici e `lines` con le etichette (righe 214-224). L'immagine dipende da `product.geometry`, dai materiali e dalle texture del catalogo *attuale*. Le conseguenze:
   - "Scarica il PDF" e "Riprova" producono un'immagine diversa da quella vista dal cliente se nel frattempo cambia la geometria. Nella fase 6 succede di continuo, mentre esistono già righe salvate nella fase 5.
   - Se il prodotto viene tolto, cosa che la riga 205 consente esplicitamente, la rigenerazione fallisce.

   Si accetta quindi in silenzio che "rigenerabile" e "immutabile" non stiano insieme.
4. **Proposed Resolution:** *Preliminary Action*.
   - **(a), la più semplice:** il PDF prodotto al passo 4 (riga 302) si salva come `bytea` nella riga. "Riprova" e "Scarica il PDF" leggono quei byte. La regola 4 della sezione 13 vieta i file locali, non i dati nel database.
   - **(b):** in alternativa, al salvataggio si scrive nello snapshot l'input già risolto del rendering: copia della geometria e, per ogni zona, codice, colore e percorso della texture.

   In tutti e due i casi va aggiunto un *Beforehand Cushioning*. Se mancano i dati di rendering, il PDF esce con il solo elenco `lines` o in versione `flat`, invece di dare errore.
5. **Secondary Liabilities:**
   - Con (a): da centinaia di KB a circa 1 MB per riga. Una correzione al generatore non si applica ai PDF già salvati. `npm run check` deve comunque usare il percorso di generazione.
   - Con (b): il generatore deve restare compatibile con le geometrie salvate, quindi `schemaVersion` deve coprire anche lo schema della geometria. Lo snapshot diventa più grande.

### 2. "Posta in uscita" senza chi la svuota
1. **Severity:** Major
2. **Affected Scope:** 10.2 (righe 297-307), 10.3 (righe 311-314), criterio 4 (righe 506-509), scheda 0017
3. **False Compromise:** la riga è chiamata "posta in uscita" (riga 297), ma nessun componente la svuota. Tre problemi:
   - Se il processo si interrompe tra il passo 3 e il passo 5 (Ctrl+C, crash, timeout), gli stati restano `in_attesa` per sempre. La pagina `/riepilogo/[token]` non sa se offrire "Riprova".
   - Una notifica `fallita` "resta registrata" (riga 314) e basta: è il caso classico di errore gestito come log passivo, anche se il criterio 4 chiede entrambi gli stati `inviata`.
   - "Il risultato della notifica non blocca la risposta al cliente" (riga 304) non ha un meccanismo. Dentro una Server Action la notifica o si attende, e allora blocca per altri 10 s circa, oppure si lancia senza attenderla, e allora non c'è garanzia che finisca né che lo stato venga aggiornato.
4. **Proposed Resolution:**
   - **Self-Service (reconciliation loop):** una passata di riconciliazione nello stesso punto in cui oggi gira la pulizia all'avvio (`npm run demo`, riga 173), che si può lanciare anche a mano. La passata:
     - rimanda le notifiche al progetto con `stato_progetto` in (`in_attesa`, `fallita`) e tentativi sotto un limite;
     - segna `fallita` le righe con `stato_cliente = in_attesa` più vecchie di qualche minuto, così compare "Riprova".
   - **Inversion:** la notifica si esegue con `after()` di `next/server` dopo la risposta, invece che in coda alla Server Action.
   - **Cosa resta escluso:** nessun reinvio automatico al cliente. Resta lui a decidere, con "Riprova".
5. **Secondary Liabilities:**
   - Consegna "almeno una volta": se il processo cade dopo che l'SMTP ha accettato il messaggio ma prima dell'aggiornamento dello stato, la notifica può arrivare due volte. Per il progetto è accettabile.
   - Servono un limite di tentativi e una soglia di tempo.
   - È un comando in più da documentare in `docs/demo.md`.
   - `after()` richiede una versione di Next.js che lo supporti come API stabile, da fissare in P10.

### 3. Resa grafica binaria (SVG da parametri oppure foto): manca il livello intermedio
1. **Severity:** Major
2. **Affected Scope:** 9.2 punti 4-5 e "Alternativa da valutare" (righe 260-266), rischio "generatore" (riga 596), scheda 0016
3. **False Compromise:** la regola di decisione (riga 263) mette solo due esiti: o generatore da parametri, o foto con campioni. Il conflitto "qualità grafica contro costo per prodotto" è segnato come rischio Alto (riga 596). Il modello SVG disegnato a mano con zone nominate (riga 266) resta un'"alternativa da valutare", fuori dalla regola. Eppure la 9.3 separa già le due cose: cambiare materiale cambia solo il `<pattern>` di ogni zona (riga 274). La resa dei materiali non dipende quindi da come nasce la forma.
4. **Proposed Resolution:** *Segmentation / Intermediary*.
   - Il contratto esplicito tra le due fasi è "SVG con zone nominate":
     - fase 1, sorgente della forma: generatore da parametri **oppure** modello disegnato, uno per taglio e per vista;
     - fase 2, applicazione dei materiali: una funzione pura comune che inserisce i `<defs>` con prefisso e collega le zone ai pattern.
   - La regola della riga 263 diventa a tre livelli: famiglia supportata → parametri; modello disegnabile in circa 2 ore → modello a zone; altrimenti → foto.
   - `flat`, gli `id` con prefisso, le texture come data URI e il PDF funzionano uguali per i primi due livelli.
5. **Secondary Liabilities:**
   - Un modello disegnato non si adatta da solo ai tagli: serve un file per ogni taglio e vista.
   - Gli SVG esportati da Inkscape o Figma vanno ripuliti per resvg (niente CSS, filtri, `id` instabili).
   - Serve una prova automatica che controlli che ogni zona di `option_group.zone` esista nel modello.
   - Ci sono due tipi di sorgente grafica da mantenere e da censire in `catalogo-inventario.md`.

### 4. Seed "mai cancellazione totale": il vincolo non c'è più
1. **Severity:** Major
2. **Affected Scope:** 8.2 (riga 234), 8.1 (riga 205), 10.1 (riga 293), scheda 0018
3. **False Compromise:** il seed è un upsert e non cancella mai, "così le configurazioni salvate non si perdono" (riga 234). Ma `configuration` non ha chiavi esterne verso il catalogo (riga 205) ed è uno snapshot (riga 206): cancellare le tabelle del catalogo non può toccare le configurazioni. Il motivo non regge più, mentre il costo resta:
   - valori, tagli e regole tolti dai file restano nel database;
   - il database si allontana dalla fonte, che secondo la scheda 0018 sono i file.

   Il documento non dice da dove il server legge le regole per `valuta` (riga 293). Se le legge dal database, il server può accettare un valore che nei file non esiste più, o rifiutare combinazioni per una regola già tolta. Interfaccia e server darebbero allora risultati diversi, cioè proprio quello che la 0020 vuole impedire (RF3).
4. **Proposed Resolution:** sincronizzazione completa delle sole tabelle del catalogo in **una transazione**: o sostituzione completa, o upsert più cancellazione dei codici assenti dai file. `configuration` non si tocca. In più va fissato nel contratto (15.2) da quale sorgente il server carica le regole.
5. **Secondary Liabilities:**
   - Gli `id` interni del catalogo possono cambiare a ogni seed: nessun riferimento esterno deve usarli, le relazioni restano tra codici o dentro il catalogo.
   - Il seed tiene un lock breve sulle tabelle del catalogo.
   - Un errore di validazione annulla l'intero seed. È coerente con la riga 233, ma va detto.

### 5. Texture: "ripetibile" non richiede ritocco manuale
1. **Severity:** Nit
2. **Affected Scope:** P13 (righe 703-707), scheda 0016 "Texture"
3. **False Compromise:** si sceglie tra due strade. Con A la foto si allarga all'intera zona: è fedele, ma la grana viene fuori scala su pareti di 200 cm. Con B le venature sono procedurali: si ripetono, ma sono meno fedeli. La terza strada, rendere le foto ripetibili, è scartata perché "richiede lavoro manuale per ogni materiale". La premessa è falsa: la ripetibilità si può ottenere in automatico.
4. **Proposed Resolution:** *Preliminary Action* nel generatore:
   - un `<pattern>` 2×2 che riusa la stessa `<image>` con `<use>` specchiati (`scale(-1,1)`, `scale(1,-1)`), senza giunture e senza ritocchi;
   - dimensioni in `userSpaceOnUse` pari alla misura reale stimata del campione, così la grana è in scala con le quote.

   La prova della fase 2 (riga 366) la può confrontare subito con A.
5. **Secondary Liabilities:**
   - La simmetria a specchio si nota su legni con nodi o figure marcate. Rischio basso per il rigatino a righe e il gres uniforme.
   - Va verificato come resvg gestisce `<use>` dentro `<pattern>`.
   - La misura reale dei campioni non è nota e va stimata.
   - In ogni vista l'immagine incorporata come data URI deve comparire una volta sola nei `<defs>`.
