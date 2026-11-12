# Stage 5: Initial Zoom Out Review, round 2 (riesame)

- **Documento:** `configuratore-saune-analisi-v7.md` (righe 1..1130), dopo le modifiche dell'autore
- **Divisione:** FeatureRange 1..522 (sezioni 1–14), DetailedRange 523..1130 (sezioni 15–26)
- **Contesto Goldfish:**
  - `docs-iniziali/docs/decisioni/` (README e schede 0001–0030);
  - `data/prodotti/aladdin.json`;
  - `contesto-web/effe-it-home.html`, `effe-it-prodotto-aladdin.html` e `effe-it-prodotto-yoku-s.html`, cioè le pagine grezze di effe.it.
- **Revisori, in contesti isolati:** `egm-zoom-out` e `egm-inventive-catalyst`.
- **Round 1:** `archivio/revisione-v7/zoom_out_report-round1.md`. La v7 prima delle modifiche è in `archivio/revisione-v7/configuratore-saune-analisi-v7-prima-dello-stage5.md`.
- **Limite dei riesami:** questo è l'unico riesame ammesso per lo Stage 5. Se ci sono altre modifiche, i risultati rimasti si registrano come compromessi accettati e si passa allo Stage 6.

**Esito:** il contesto basta. Non ci sono Blocker. Restano 3 Major, uno dei quali risolto solo in parte, e 9 Nit, di cui 4 aperti dal round 1.

Le modifiche hanno semplificato il progetto: lo seed svuota e ricarica, gli invii partono in parallelo, "Riprova" è più semplice e lo script delle viste è uscito dal repository.

Entrambi i revisori questa volta hanno controllato le pagine di effe.it. Confermano misure, essenze e file di Aladdin e di Yoku S, e confermano che sul sito la pedana di Aladdin è facoltativa ("può essere completata"). Le differenze trovate sono in R2 e N-c.

---

## Stato dei risultati del round 1

I due revisori concordano su tutte le voci tranne N8: zoom-out lo considera chiuso, catalyst lo lascia aperto. In entrambi i casi la scelta è dichiarata nel documento e coerente.

| Voce | Stato | Nota |
|---|---|---|
| Z1 Problema e Aladdin | risolto | Il problema è riformulato in sez. 2. Yoku S porta le combinazioni senza foto e il livello B è dichiarato un ripiego. Il problema si sposta però sul calendario, vedi R1. |
| Z2 Livello per prodotto | risolto | 9.2 punto 2 e sez. 21 ora dicono la stessa cosa. |
| Z3 Formato e script | risolto | Il formato è ricavato dalle viste del mockup (15.2). |
| Z4 Zone `ext`/`int`/`furn` | risolto | Si usano le zone del mockup, con rotazione costante per zona. |
| Z5 Invio e "Riprova" | risolto | Scheda 0030. Lo storico ha ancora una riga in contrasto, vedi N-a. |
| Z6 Seed | risolto | Scheda 0028. |
| Z7 Calendario | parzialmente | La fase 2 ora dura 2 giorni e la dipendenza dal via libera è dichiarata. Restano R1 e R3. |
| Z8 Dettagli di codice | risolto | Spostati nell'appendice C. Resta un `DELETE … WHERE` in sez. 12, trascurabile. |
| N1 Contenuti ripetuti | aperto | Sono ancora nel documento: sez. 19, 20.3 e 23.2. |
| N2 `ENABLE_GALLERY` | aperto | r. 216, 874. |
| N3 Pedana obbligatoria | aperto, ora con motivazione più debole | Vedi N-b. |
| N4 `attributes` JSONB come motivo | aperto | 6.5 punto 2 invariato. |
| N5 Vettorializzazione a mano | superato | Lo script è uscito dal progetto. |
| N6 Venatura | risolto, in altro modo | Rotazione costante per zona. |
| N7 Viste nella pagina iniziale | risolto | Si caricano solo le viste del prodotto aperto. |
| N8 `Message-ID` fisso | chiuso, non adottato | Il doppione resta un rischio accettato. |

---

## 🟡 Major

### R1. Il prodotto che risponde al problema viene per ultimo in calendario ed è il primo a saltare
- **Fonte:** zoom-out R1 e catalyst R1, che sono d'accordo.
- **Dove:** sez. 2 (r. 25), 9.2 punto 6 (r. 322), 9.2 punto 4 (r. 318), 15.5 (r. 627, 632, 636, 642–648), criterio 2 (r. 662–665), A.2 (r. 1101–1103).
- **Problema:**
  - Yoku S è l'unico prodotto che mostra combinazioni senza foto, ma si fa nella fase 6.
  - La fase 6 è anche quella che assorbe il ritardo del via libera, che oggi non c'è ancora. Due giorni di ritardo la azzerano.
  - Nella fase 2, invece, M produce le viste di Aladdin 45, una versione che ha già la foto ufficiale.
  - Per Yoku S la chat deve fare una cosa che con Aladdin non è mai stata provata: separare `ext` dalle zone in Aspen (`int` e `bench`). Nelle viste del mockup le pareti interne sono `ext`. Se la separazione riesce male, cambiare il legno esterno ricolora anche l'interno, e il contributo di Yoku S scompare.
- **Perché conta:** il calendario protegge il lavoro meno utile ed espone quello che giustifica il progetto. È lo stesso difetto di Z1, spostato dal "cosa" al "quando".
- **Proposta:**
  - Nella fase 2 produrre in chat le viste di Yoku S 60, che ha DWG, FBX e SKP, con `ext` separato da `int` e `bench`, e misurare quanto tempo serve. Zoom-out chiede almeno la sola vista esterna, come prova a tempo; catalyst propone il prodotto intero.
  - Aladdin 45 va nella fase 6, come primo taglio sacrificabile, oppure si copre con `viewsFrom: "60"` se la forma è la stessa.
  - La regola di r. 318 ("dove esistono i file di entrambi i tagli, si producono le viste di entrambi") diventa una preferenza, non un obbligo.
  - Se Aladdin 45 resta in fase 2, va spiegato perché viene prima di Yoku S.
- **Costi:**
  - più carico su M nei primi giorni, che contengono già scaffold, contratto e prova del PDF;
  - `componiVista` si prova su due prodotti diversi, quindi con due possibili fonti di errore insieme;
  - Aladdin resta con `viewer: "image"` più a lungo.

### R2. I dati di Yoku S su cui poggia il problema non sono verificati sul sito
- **Fonte:** zoom-out R2. La citazione l'ho ricontrollata io con una ricerca: "tre diverse essenze" compare nella pagina di Yoku S, alle righe 23, 29, 41 e 565.
- **Dove:** sez. 2 (r. 20), P1 (r. 848), A.2 (r. 1098, 1100, 1103), 22 punto 5 (r. 983).
- **Problema:**
  - Il sito dice "Tre diverse soluzioni estetiche declinabili in tre diverse essenze di legno". La pagina mette ASPEN, SCURO e NOCE sotto tre titoli separati, la stessa struttura che su Aladdin indica essenze alternative.
  - Il documento invece considera l'Aspen fisso su `int` e `bench`, con la scelta tra due soli legni esterni. Nessuna delle due letture è dimostrata. Catalyst ha accettato la lettura del documento, che quindi resta da decidere.
  - Oltre alle 12 foto delle versioni, la pagina ha una galleria di 10 foto e uno slider di 3. Il documento non dice se qualcuna mostra il Noce o lo Scuro.
- **Perché conta:** il numero di combinazioni senza foto è il dato che giustifica il progetto. La scelta tra "Aspen fisso" e "gruppo a tre valori" cambia il file di Yoku S e il modo di chiedere le viste in chat. Al tutor basta aprire la pagina per porre la domanda.
- **Proposta:**
  - Citare la frase in A.2 e aggiungerla a `_daVerificare`.
  - Guardare le 13 foto della galleria e dello slider e annotare quali legni compaiono.
  - Correggere la sez. 2 prima della fase 6.
  - Costa pochi minuti.

### R3. Calendario senza margine (resto di Z7)
- **Fonte:** zoom-out R3.
- **Dove:** 15.5 (r. 627–648).
- **Problema:**
  - Le fasi sommano ancora a 11 giorni su 11.
  - La fase 3 ha 1,5 giorni e la fase 4 ne ha 1, dopo un accorciamento che il documento non motiva.
  - L'elenco dei tagli non contiene niente delle fasi 3–5.
- **Proposta:** due strade possibili.
  - Indicare cosa delle fasi 3–5 si taglia per primo, per esempio la Pianta di Aladdin 45 o le prove Playwright oltre il percorso minimo.
  - Oppure scrivere che uno sforamento delle fasi 3–5 toglie tempo alla fase 6, con le stesse regole del ritardo del via libera. Insieme a R1, la fase 6 non conterrebbe più Yoku S.

---

## 🟢 Nit

- **N-a. Lo storico contraddice la 0030.** Zoom-out e catalyst R6.
  - 23.1, r. 1008: "limite di 3 tentativi anche per la notifica", mentre la 0030 toglie quelle colonne.
  - 23.1, r. 994: la colonna v7 parla ancora di "script a partire dal modello FBX".
  - Proposta: correggere le righe, oppure spostare lo storico in `archivio/`, come già proposto in N1.
- **N-b. Il motivo della pedana obbligatoria non c'è più.** Zoom-out N-b e catalyst R3, che riprendono N3.
  - La 0027 giustifica l'obbligo dicendo che "non serve un caso senza materiale". Ma la v7 introduce proprio quel caso per Yoku S: `floor` senza materiale prende un colore neutro (9.3, r. 332).
  - "Nessuna pedana" può quindi essere un valore normale del gruppo, senza `material`. Il valore predefinito può restare Moka.
  - P3 (r. 860) dice inoltre che questo è "l'unico punto in cui il progetto si discosta dal sito", ma non è vero: la pedana colora tutto il pavimento e per Yoku S c'è anche l'ipotesi sui legni di R2.
  - Proposta: rendere la pedana facoltativa, oppure correggere il motivo nella 0027 e togliere "unico".
- **N-c. Le schede di preinstallazione non sono solo nell'Area Pro.** Zoom-out.
  - Appendice A (r. 1081), 9.4 (r. 341), 20.2 (r. 817), 20.4 punto 3.
  - Nelle pagine salvate, le schede di Aladdin 45/60 e di Yoku S 45/60/80/105 puntano a cartelle Google Drive pubbliche, senza lucchetto.
  - Va corretta l'appendice e rivista la regola "solo sul computer locale".
- **N-d. Per Aladdin, zone del gruppo e zone delle viste non coincidono, e il testo non lo dice.** Zoom-out.
  - In `aladdin.json`, `wood.zones` contiene `int`, ma le viste del mockup non hanno `int`.
  - Chi produce in chat le viste di Aladdin 45 non sa se deve creare quella zona.
  - Proposta: scrivere in P1 o in `docs/viste.md` che per Aladdin le pareti interne sono `ext`, mentre per Yoku S `int` è obbligatoria.
- **N-e. Con il seed tutto-o-niente, cosa fa `npm run demo` se il seed fallisce non è scritto.** Catalyst R2.
  - Dove: sez. 7 passo 1 (r. 204), 8.2 (r. 276–277), 15.2 (r. 578), 10.5 (r. 408–409), 18 (r. 726).
  - Il seed fallisce anche per una sola vista mancante, mentre il controllo preliminare la tratta come un avviso.
  - Proposta: se il seed fallisce, stampare FAIL e avviare con il catalogo precedente, che la transazione ha conservato. L'avvio si blocca solo se il database è vuoto. In alternativa, rendere bloccante anche il controllo preliminare.
- **N-f. Scala sugli assi per le viste riusate tra tagli.** Catalyst R4.
  - Dove: 9.2 punto 4, 9.3, 15.2.
  - Per Frontale e Pianta, che sono proiezioni ortogonali, `componiVista` potrebbe scalare le due direzioni con il rapporto tra le misure dei tagli. La vista Esterno resta con la nota.
  - È facoltativo. Va deciso prima di fissare la firma di `componiVista`.
- **N-g. Per Yoku S si guadagna una sola combinazione per taglio inserito.** Catalyst R5.
  - Dove: 9.2 punto 3, A.2.
  - Un file descrive una sola variante (Door, Glass o Shelf), quindi il guadagno è piccolo.
  - Proposta: controllare nell'inventario se le varianti cambiano solo il fronte. Se non è così, scrivere in sez. 2 che il guadagno vale "per taglio e variante inseriti".
- **N1, N2, N4 del round 1:** ancora aperti, valgono le proposte del round 1.

---

## Da decidere prima della PR del contratto (fase 2)

- **R1:** l'ordine dei lavori, cioè Yoku S nella fase 2.
- **N-d:** la regola sulla zona `int` nella richiesta in chat.
- **N-b:** se `material` può essere nullo su un valore di opzione.
- **N-f:** se `componiVista` riceve un parametro di scala.

Inoltre **R2** va chiuso prima della fase 6 e della presentazione.

---

## Matrice di tracciabilità

| Voce | zoom-out (round 2) | inventive-catalyst (round 2) |
|---|---|---|
| R1 | R1 | R1 |
| R2 | R2 | — (ha accettato la lettura del documento) |
| R3 | R3 | — |
| N-a | N-a | R6 |
| N-b | N-b, N3 | R3 |
| N-c | N-c | — |
| N-d | N-d | — |
| N-e | — | R2 |
| N-f | — | R4 |
| N-g | — | R5 |
| N1, N2, N4 | aperti | aperti |
