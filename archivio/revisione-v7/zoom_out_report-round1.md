# Stage 5: Initial Zoom Out Review

- **Documento:** `configuratore-saune-analisi-v7.md` (righe 1..1066)
- **Divisione:** FeatureRange 1..516 (sezioni 1–14), DetailedRange 517..1066 (sezioni 15–25)
- **Contesto Goldfish:** `docs-iniziali/docs/decisioni/` (README, 0001–0027), `data/prodotti/aladdin.json`, `contesto-web/effe-it-home.html` e `contesto-web/effe-it-prodotto-aladdin.html` (pagine grezze di https://www.effe.it/ e https://www.effe.it/prodotto/aladdin/)
- **Revisori, in contesti isolati:** `egm-zoom-out` (semplicità e perimetro), `egm-inventive-catalyst` (falsi compromessi, TRIZ)
- **Revisioni precedenti:** archiviate in `archivio/revisione-v6/`

**Limite da sapere:** nessuno dei due revisori ha aperto le pagine di effe.it. Per i dati di Aladdin si sono basati sull'appendice A e su `aladdin.json`. Se l'appendice A non corrisponde al sito, i risultati M1 e N3 vanno ricontrollati.

**Esito:** il contesto basta, cioè il controllo preliminare dello standard è superato. Non ci sono Blocker. Ci sono 9 risultati Major e 8 Nit, dopo aver unito i doppioni (vedi la matrice in fondo).

Il revisore TRIZ giudica equilibrate queste scelte, senza falsi compromessi:
- PostgreSQL con JSONB, Drizzle, Docker solo per il database;
- catalogo nei file e database derivato;
- riga della configurazione usata come posta in uscita;
- PDF rigenerato dalla riga salvata.

Anche il possibile doppione dopo un timeout SMTP è un limite reale, non un compromesso da eliminare.

---

## 🟡 Major

### Z1. Il problema dichiarato e ciò che si costruisce per Aladdin coincidono poco
- **Fonte:** zoom-out M1
- **Dove:** sez. 2 (r. 20), 9.2 punto 5 (r. 320), 9.3 "Pedana" (r. 332), 16 criterio 2 (r. 655–657), appendice A (r. 1042, 1048).
- **Problema:** il problema dichiarato è che il cliente vede ogni sauna solo nelle versioni fotografate. Per Aladdin però tutte e quattro le combinazioni di taglio ed essenza hanno già una foto ufficiale. L'unica scelta senza foto è la pedana, e proprio la pedana è quella resa peggio:
  - nelle viste colora tutto il pavimento, non il riquadro di 120 × 120 cm;
  - al livello B non si vede;
  - nella demo è obbligatoria, mentre sul sito non lo è.

  Il criterio 2 accetta poi un prodotto al livello B, cioè foto più campioni, che è quello che il sito offre già.
- **Perché conta:** alla domanda "cosa vedo qui che sul sito non vedo?" la risposta oggi è debole.
- **Proposta:** due strade possibili.
  - Riformulare il problema sul valore reale: un solo posto interattivo, viste coerenti tra i prodotti, riepilogo salvato e inviato.
  - Oppure scegliere prodotti con più combinazioni che foto.

  In ogni caso un prodotto al livello B non va contato come risposta al problema.

### Z2. Il livello di resa sta sul prodotto, ma il testo lo assegna anche al taglio
- **Fonte:** zoom-out M2
- **Dove:** 8.1 `product.viewer` (r. 228), 9.2 punto 1 (r. 314) e punto 4, 15.2 (r. 571), 21 (r. 944).
- **Problema:** la 9.2 dice che un taglio con solo il DWG usa il livello B. `viewer` però è una colonna del prodotto, e il contratto vuole tre file o un `viewsFrom` per ogni taglio di un prodotto `svg`. Quel caso quindi non si può rappresentare. Il punto 4 e la sez. 21 danno inoltre risposte diverse tra loro.
- **Perché conta:** è un'incoerenza dentro il contratto, che si blocca in una sola PR.
- **Proposta:** un livello per prodotto. Un taglio con solo il DWG riusa le viste di un altro taglio (`viewsFrom`) o resta fuori. Vanno corrette la 9.2 punto 1 e la sez. 21.

### Z3. Il formato delle viste nel contratto non corrisponde allo script di prova
- **Fonte:** zoom-out M3
- **Dove:** 15.2 (r. 565–570), 9.1 (r. 291, 297–302); `scripts/viste/prova-genera.mjs` r. 35, 134–147.
- **Problema:** il contratto chiede solo `<path>` con `data-zone` e `data-shade`, e le zone `furn` e `glass`. Lo script invece:
  - scrive uno sfondo `<rect>`;
  - usa la zona `bench` invece di `furn`;
  - fa il vetro come strato con `fill-opacity=".28"` e senza `data-shade`;
  - scrive già i colori.

  Il contratto non descrive la trasparenza del vetro, che però serve per vedere l'interno nella vista frontale.
- **Perché conta:** è l'unico punto di contatto tra N e M. Se si blocca così, lo script, `componiVista` e la prova sul formato partono già in disaccordo.
- **Proposta:** nella PR del contratto partire dall'output reale dello script e decidere in modo esplicito:
  - il nome della zona delle panche;
  - il vetro come strato trasparente, senza `data-shade`;
  - lo sfondo, vietato oppure ammesso come elemento senza zona.

### Z4. Le zone `ext`/`int`/`furn` costano più di quanto il catalogo usi
- **Fonte:** catalyst 1. Collegati: catalyst 2 e zoom-out N5.
- **Dove:** 9.2 punti 2 e 6 (r. 315, 321), 15.2 (r. 565–571), P13 (r. 902); `aladdin.json`, il gruppo `wood` ha `zones: ["ext","int","furn"]`.
- **Problema:** dividere ogni modello in tre zone con regole scritte a mano è il lavoro più caro per prodotto (una o due ore, stima non misurata). Ma in Aladdin un solo gruppo colora tutte e tre le zone, quindi la divisione non cambia nulla di visibile. Oggi serve solo al verso della venatura (`data-rot`).
- **Perché conta:** il rischio principale del documento è il tempo, e il numero di prodotti al livello A dipende proprio da questo costo.
- **Proposta:** decide il catalogo. Il formato ammette una zona `wood`, e le regole per zona si scrivono solo per i prodotti che hanno essenze diverse fuori e dentro. Prima va contato nell'inventario quanti prodotti sono in questo caso. La decisione va presa nella PR del contratto.
- **Costi:** una zona in più nel contratto, che si sovrappone alle altre, e un controllo Zod tra zone dei gruppi e zone delle viste. Se un prodotto con essenze diverse arriva dopo, le sue viste vanno rigenerate.

### Z5. Invio e "Riprova": più meccanismi di quanti ne servano, e la notifica in serie raddoppia l'attesa
- **Fonte:** zoom-out M5 e catalyst 3, uniti perché toccano lo stesso flusso.
- **Dove:** sez. 7 passi 3 e 6 (r. 202, 205), 10.2 punti 5–6 (r. 364–365), 10.3 (r. 384–387), P8 (r. 873), 16 criterio 5 (r. 665), schede 0023 e 0017.
- **Problema, parte A (zoom-out):** l'aggiornamento condizionale basta da solo contro i doppi invii. In più il documento prevede:
  - un'attesa di 30 secondi tra due tentativi;
  - un ramo per le righe `pending` più vecchie di 2 minuti;
  - la conversione dei `pending` in `failed` all'avvio;
  - il nuovo invio automatico delle notifiche all'avvio;
  - tre motivi di rifiuto.

  Nessuno di questi rami compare nel percorso della demo (sez. 22.2).
- **Problema, parte B (catalyst):** la notifica al progetto aspetta che finisca l'invio al cliente, quindi nel caso peggiore il tutor attende circa 30 secondi più il PDF. Le due email però sono indipendenti. Il guasto che la 0023 vuole evitare, cioè una riga rimasta `pending`, è già coperto dal controllo all'avvio.
- **Attenzione, le due proposte vanno in direzioni opposte:**
  - zoom-out propone di togliere il nuovo invio automatico delle notifiche;
  - catalyst propone di inviare le due email in parallelo (`Promise.allSettled`), affidandosi proprio al controllo all'avvio.

  Va scelto prima l'una o l'altra strada.
- **Proposta comune minima:** "Riprova" = `UPDATE … WHERE token = $1 AND customer_status = 'failed' AND customer_attempts < 3`, senza l'attesa di 30 secondi e senza il ramo `pending`. Restano due motivi di rifiuto, `inviata` ed `esauriti`.

### Z6. Il seed come sincronizzazione completa è più complicato del necessario
- **Fonte:** zoom-out M4
- **Dove:** 8.2 (r. 272–277), 18 (r. 699), scheda 0022.
- **Problema:** `configuration` non ha chiavi esterne verso il catalogo, e il catalogo non si modifica a mano. Basta quindi cancellare e reinserire tutto in una transazione. La 0022 scarta questa strada perché "richiede di cancellare tutto in ordine", ma lo stesso ordine serve anche alla sincronizzazione, che in più deve calcolare le differenze.
- **Proposta:**
  - il seed valida tutto, poi cancella e reinserisce il catalogo;
  - la prova diventa: "dopo il seed il catalogo è uguale ai file e le configurazioni non cambiano";
  - va aggiunta una nuova scheda che sostituisce la 0022.

### Z7. Il calendario non ha margine e la fase 2 è sovraccarica
- **Fonte:** zoom-out M6
- **Dove:** 15.5 (r. 621–644), 20.5 (r. 929).
- **Problema:** le durate massime delle fasi sommano esattamente agli 11 giorni, e la data di partenza (12 novembre) non tiene conto del via libera del tutor, che non c'è ancora. La fase 2 ha un solo giorno per:
  - lo scaffold;
  - lo spostamento dei documenti;
  - la PR del contratto;
  - lo script delle viste;
  - il confronto con le foto;
  - le texture;
  - la prova del PDF.

  L'elenco dei tagli contiene solo prodotti, viste e prove.
- **Proposta:**
  - dividere la fase 2 in due giorni;
  - mettere in testa ai tagli le semplificazioni di Z5, Z6 e N2;
  - dichiarare che la partenza dipende dal via libera.

### Z8. Troppi dettagli di codice nelle sezioni di architettura
- **Fonte:** zoom-out M7
- **Dove:**
  - 10.2 punto 5 (r. 364);
  - 10.3 (r. 384);
  - P8 (r. 883);
  - P14 (r. 907);
  - 15.3 (r. 604);
  - sez. 7 (r. 211–212).
- **Problema:** `Promise.race`, i timeout di Nodemailer, l'SQL completo, `path.join(process.cwd(), …)` e i confronti sulle migrazioni fissano il codice prima che esista. Creano anche copie da tenere allineate, e una deriva c'è già: la 0022 cita ancora le "regole", tolte dalla 0027.
- **Proposta:** nell'analisi tenere comportamenti e garanzie, per esempio "ogni invio scade dopo 15 s". Il modo di ottenerle va in `docs/architettura.md` o nei commenti del codice.

---

## 🟢 Nit

- **N1. Contenuti ripetuti (zoom-out N1).**
  - Sez. 19 (r. 742–770) ricopia il registro delle decisioni: basta un rimando al README.
  - Sez. 20.3 (r. 810–905) ripete le sez. 8–11 in forma P1–P15: tenere solo le decisioni che non compaiono altrove.
  - Sez. 23.2 (r. 995–1031) è lo storico v5→v6: spostarla in `archivio/`.
- **N2. Galleria con due condizioni (zoom-out N2).** P6 (r. 862) e sez. 7 (r. 214): l'applicazione ascolta solo su `127.0.0.1`, quindi la galleria può restare sempre attiva, senza `ENABLE_GALLERY`.
- **N3. Pedana obbligatoria con motivazione debole (zoom-out N3).** P3 (r. 848), scheda 0027: "nessuna pedana" può essere un valore normale del gruppo, con il pavimento in legno come materiale. Da ripensare insieme a Z1.
- **N4. Colonne `attributes` JSONB senza un uso attuale (zoom-out N4).** Sez. 8.1 (r. 229, 232) e 6.5 punto 2: presentarle come valvola di sfogo, non come motivo per scegliere il DBMS.
- **N5. Vettorializzazione scritta a mano e una sola mesh letta (zoom-out N5).** Sez. 9.1:
  - per la semplificazione dei poligoni esistono librerie pronte, per esempio `simplify-js`;
  - lo script legge solo l'ultima mesh del file (r. 12): un FBX con più mesh va provato prima di stimare "una o due ore" per prodotto.
- **N6. Venatura e prospettiva ricavate dalla geometria (catalyst 2).** P13 (r. 901–902), 9.1 (r. 300), 15.2 (r. 569): lo script conosce già l'orientamento di ogni faccia. Potrebbe scrivere la trasformazione del piano, che `componiVista` applica come `patternTransform`, e `data-rot` non servirebbe più. Va verificato con resvg ed è facoltativo, ma va deciso prima di bloccare il formato.
- **N7. Tutte le viste nella pagina iniziale (catalyst 4).** 9.3 (r. 331), 10.1 (r. 345): le viste degli altri prodotti si possono leggere da `public/viste/` quando si cambia prodotto. Non serve farlo subito: basta che nel contratto le viste non siano un campo obbligatorio di `Prodotto`.
- **N8. Doppione di "Riprova" meno visibile (catalyst 5).** 10.3 (r. 386): usare un `Message-ID` fisso ricavato dal `token`. Il risultato non è garantito, quindi il doppione resta un "rischio accettato".

---

## Da decidere prima della PR del contratto (fase 2)

Dopo quella PR, il formato delle viste e il tipo `Prodotto` cambiano solo con una PR discussa. Per questo vanno chiusi prima: **Z2, Z3, Z4, N6, N7**.

---

## Matrice di tracciabilità

| Voce | zoom-out | inventive-catalyst |
|---|---|---|
| Z1 | M1 | — |
| Z2 | M2 | — |
| Z3 | M3 | — |
| Z4 | (N5, collegato) | 1 |
| Z5 | M5 | 3 |
| Z6 | M4 | — |
| Z7 | M6 | — |
| Z8 | M7 | — |
| N1 | N1 | — |
| N2 | N2 | — |
| N3 | N3 | — |
| N4 | N4 | — |
| N5 | N5 | — |
| N6 | — | 2 |
| N7 | — | 4 |
| N8 | — | 5 |
