# Stage 8: Intermediate Zoom Out Review

- **Documento:** `configuratore-saune-analisi-v7.md` (righe 1..1157), dopo gli Stage 6 e 7
- **Divisione:** FeatureRange 1..546, DetailedRange 547..1157
- **Riferimenti:** `zoom_out_report.md` (Stage 5), `comprehension_report.md` (Stage 6), `critic_report.md` (Stage 7, round 2) e `archivio/revisione-v7/goldfish_review_report-stage7-round1.md`
- **Contesto Goldfish:** `docs-iniziali/docs/decisioni/` (0001–0030), `data/prodotti/aladdin.json` e `contesto-web/`, con le pagine di effe.it
- **Revisore:** `egm-zoom-out`, in un contesto isolato
- **Revisione della v6:** `archivio/revisione-v6/intermediate_zoom_out_report.md`

**Esito:** il contesto basta. Non ci sono Blocker; ci sono 4 Major e 3 Nit.

Secondo il revisore, le modifiche fatte dopo gli Stage 6 e 7 sono quasi tutte chiarimenti a basso costo, e le schede 0028–0030 hanno semplificato davvero il progetto. Restano però quattro punti:
- due correzioni del round 1 dello Stage 7 hanno aggiunto meccanismi nuovi: le tre rese del PDF (D4) e il controllo automatico delle proporzioni (D2);
- il criterio 7 rende obbligatoria ogni nuova prova;
- il documento continua a crescere;
- il calendario parte solo quando il documento è approvato.

Le due aggiunte che il revisore contesta, D4 e D2, le ho scritte io nel round 1. Lo stesso vale per la frase su `request_id` citata in Z8-4.

---

## Stato dei Major dello Stage 5

| Voce | Stato | Verifica |
|---|---|---|
| R1 Yoku S per ultimo | **aperto, rischio cresciuto** | Aladdin 45 resta nella fase 2 (r. 656) e Yoku S nella fase 6 (r. 666). La r. 337 obbliga ancora a produrre le viste di entrambi i tagli. Con la regola delle 4 ore (r. 341), un Aladdin 45 lento manda al livello B anche Aladdin 60 (B17 dello Stage 7). |
| R2 Dati di Yoku S | **aperto** | L'appendice A.2 (r. 1125) non è cambiata e non cita la frase "tre diverse essenze" del sito. |
| R3 Calendario senza margine | **aperto, ora dichiarato** | La r. 651 dice che non c'è margine, ma la somma resta 11 giorni su 11. L'elenco dei tagli non contiene niente delle fasi 3–5, e la fase 4 (r. 658) ora contiene anche gli invii in parallelo e i ripieghi del PDF aggiunti con D4. |

---

## 🟡 Major

### Z8-1. È il documento a tenere fermo il calendario
- **Dove:** 15.5 (r. 651), 20.5 (r. 969), glossario (r. 84), preambolo (r. 3), 23.1–23.2 (r. 1015–1090), appendice C (r. 1143–1157).
- **Problema:** il lavoro parte solo con il via libera, e il via libera arriva quando il documento è finito. Ogni giorno di ritardo toglie un giorno alla fase 6, cioè a Yoku S. Intanto il documento è passato da 1130 a 1157 righe, e ogni giro di revisione aggiunge testo e nuovi Nit: è il *churn* che lo Stage 7 aveva già segnalato.
- **Perché conta:** in 11 giorni il costo più alto non viene da una scelta tecnica, ma da quanto a lungo il documento resta aperto. Le voci rimaste, cioè A1–A6 e i Nit, si possono chiudere nella fase 2 insieme alla PR del contratto.
- **Proposta:**
  - congelare il documento con i compromessi accettati già registrati, e chiedere subito il via libera;
  - spostare le correzioni rimaste nella PR del contratto della fase 2;
  - quando il documento passa in `docs/`, togliere la 23.2, che è già in `archivio/`, e trasferire l'appendice C in `docs/architettura.md`, come previsto alla r. 1145.

### Z8-2. La sequenza delle tre rese del PDF è un meccanismo che il progetto non chiede
- **Dove:** 10.3 "Se il PDF non si genera" (r. 416). Collegati: sez. 11 (r. 468), sez. 17 (r. 711), sez. 18 (r. 737).
- **Problema:**
  - `flat` è già un ripiego deciso una sola volta con la prova della fase 2 (sez. 11 e 17). Riprovarlo a ogni generazione raddoppia il percorso del codice.
  - Le viste sono file statici che entrano nel repository solo dopo la prova sul formato. Una vista malformata durante l'invio può nascere solo da un errore nel codice.
  - Da questa regola, che ho aggiunto io con D4, nascono A1, B2, B11 e B16 dello Stage 7. Togliendola spariscono.
- **Proposta:**
  - la modalità di resa diventa una costante, completa o `flat`, scelta con la prova della fase 2;
  - il solo elenco resta per il caso già previsto, cioè uno snapshot che non si risolve più nel catalogo (sez. 11, r. 459);
  - qualsiasi altra eccezione porta a `failed` solo l'invio in corso, con la causa "riepilogo non generato";
  - "Scarica il PDF" restituisce un errore e non tocca gli stati;
  - la prova della r. 737 diventa "un'eccezione nella generazione non lascia stati `pending`".

### Z8-3. Ogni prova aggiunta diventa un requisito, e l'elenco dei tagli non le tocca
- **Dove:** criterio 7 (r. 697), tabella della sez. 18 (r. 723–742), quarto taglio della 15.5 (r. 672).
- **Problema:**
  - La tabella ha 18 casi, e molti richiedono il database o un server SMTP finto.
  - Ogni giro di revisione ha aggiunto righe.
  - Il criterio 7 le rende tutte obbligatorie.
  - Il quarto taglio della 15.5 riguarda solo le prove Playwright oltre il flusso completo, e nella tabella le righe Playwright sono due.
- **Perché conta:** senza margine, le prove sono il lavoro che cresce di più, e nessuna regola permette di ridurle.
- **Proposta:**
  - dividere la tabella in un **nucleo obbligatorio**, con le prove dei criteri 3, 4 e 5 e di `npm run clean`, e in prove **se avanza tempo**;
  - riferire il criterio 7 al solo nucleo;
  - riscrivere il quarto taglio come "le prove automatiche fuori dal nucleo".

### Z8-4. `request_id` protegge da un caso che l'interfaccia, secondo il documento stesso, non produce
- **Dove:** 10.2 (r. 385, 396), 8.1 (r. 249), P4 (r. 891), P8 (r. 911), glossario (r. 93), appendice C (r. 1150), prova (r. 730).
- **Problema:**
  - La r. 396, che ho aggiunto io con D6, dice che Next.js esegue in serie le Server Action dello stesso client.
  - La r. 385 dice che il pulsante si disattiva durante la richiesta.
  - Il caso concorrente che conta davvero, due "Riprova" insieme, lo copre già l'`UPDATE` atomico senza `request_id`.
  - Il meccanismo costa intanto una colonna `UNIQUE` nello schema, che si blocca dopo la fase 4, un `ON CONFLICT`, un ramo nell'esito, una prova e una voce del glossario. Da qui nasce anche A6 dello Stage 7.
- **Proposta:** due strade.
  - Togliere `request_id` e il ramo `in-corso` di `inviaRiepilogo`. Contro il doppio clic bastano il pulsante disattivato e le Server Action eseguite in serie. `in-corso` resta solo come motivo di "Riprova".
  - Se lo si tiene, togliere almeno dalla 10.2 la frase che lo dichiara quasi inutile.
- **Nota:** `request_id` è una decisione registrata nelle schede 0024 e 0026. Toglierlo richiede una scheda nuova.

---

## 🟢 Nit

- **Z8-5. Il controllo automatico delle proporzioni costa più di quanto rende.** 9.2 punto 7 (r. 342) e sez. 18 (r. 727).
  - **Problema:** per calcolare il riquadro di una vista bisogna interpretare l'attributo `d` dei path, comprese le curve. Inoltre la tolleranza del 5% risente del bordo e dell'ombra (A3 dello Stage 7).
  - **Proposta:** mostrare in `/galleria` il rapporto atteso accanto alla vista e controllarlo a occhio. Se il controllo resta automatico, usare una libreria per il riquadro dei path, per esempio `svg-path-bbox`, e trattare l'esito come un avviso, non come una prova che blocca.
- **Z8-6. La presenza dei file delle viste si controlla in tre posti.**
  - **Problema:** il controllo c'è nel seed (bloccante, 15.2, r. 602), in `npm run check` (solo un avviso, 10.5, r. 431–433) e in Vitest (sez. 18, r. 727), con tre esiti diversi. È la causa di N-e dello Stage 5.
  - **Proposta:** tenerlo solo nel seed.
- **Z8-7. L'appendice C contiene un algoritmo che si usa una volta sola.** r. 1157.
  - **Problema:** la conversione delle viste del mockup si fa una volta sola, nella fase 2.
  - **Proposta:** spostarla in `docs/viste.md`.

---

## Se si accetta poco

Secondo il revisore, le due modifiche che tolgono più lavoro sono Z8-1 (chiedere subito il via libera) e Z8-2 (una sola modalità di resa del PDF, fissata con la prova). Se nel calendario si cambia una sola cosa, il punto più esposto resta R1.

---

## Collegamenti con gli altri stadi

| Stage 8 | Collegato a |
|---|---|
| Z8-1 | Stage 5 R3, Stage 6 S2, churn dello Stage 7 |
| Z8-2 | Stage 7 D4 (round 1); A1, B2, B11, B16 (round 2) |
| Z8-3 | Stage 5 R3; criterio 7 |
| Z8-4 | Stage 7 D6 (round 1), A6 (round 2); schede 0024 e 0026 |
| Z8-5 | Stage 7 D2 (round 1), A3, B10 (round 2) |
| Z8-6 | Stage 5 N-e |
| R1 (aperto) | Stage 5 R1, Stage 6 S3, Stage 7 B17 |
