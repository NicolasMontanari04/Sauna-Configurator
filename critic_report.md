# Stage 7: Critic Review, round 2 (riesame)

- **Documento:** `configuratore-saune-analisi-v7.md`, dopo le correzioni del round 1. Copia salvata in `archivio/revisione-v7/configuratore-saune-analisi-v7-dopo-stage7-round1.md`.
- **Intervallo:** FeatureRange 1..546 (sezioni 1–14)
- **Standard:** `feature-spec-standard`, applicato da design e structural. Style ha seguito le regole della propria persona.
- **Revisori, in contesti isolati:** `egm-design`: completed; `egm-structural`: completed; `egm-style`: completed.
- **Round 1:** `archivio/revisione-v7/critic_report-round1.md`. La sua risoluzione è in `archivio/revisione-v7/goldfish_review_report-stage7-round1.md`.
- **Limite dei riesami:** questo è l'unico riesame ammesso per lo Stage 7, quindi non ci sarà un terzo giro.

**Esito:** non ci sono Blocker. Restano 6 Major e 17 Nit, dopo aver unito i doppioni.

**Il round non è pulito, e il motivo riguarda me.** I 6 Major vengono quasi tutti dal testo che ho scritto io nel round 1, quando ho applicato le correzioni. Le correzioni che hanno creato il problema sono D4, D2, SR3, D1, D6 e, in parte, D3. Secondo le regole della revisione questo si chiama *churn*: un risultato nuovo che nasce nel punto di una correzione appena fatta. Avevi chiesto di non far nascere nuovi problemi con le correzioni, e non ci sono riuscito. Ogni voce indica la correzione da cui nasce.

**Cosa ha retto.** I revisori confermano risolti questi risultati del round 1:
- **Design:** D5, D6 nella sostanza, D7, D10, D12, D13 e D14. D1 resta chiuso come rischio accettato.
- **Struttura:** SR1, SR2, SR3, SR4, SR5, SR8 e SR12.
- **Stile:** tutti i Major (ST1, ST2, ST4, ST5, ST6, ST7) e quasi tutti i Nit.

Nessun revisore ha riaperto le voci contestate o lasciate senza modifiche.

---

## 🟡 Major

### A1. Un guasto del PDF sovrascrive stati già corretti e mostra la causa sbagliata
- **Fonte:** design M1. Nasce dalla correzione D4.
- **Dove:** 10.3, "Se il PDF non si genera" (r. 416). Collegati: la tabella delle cause (r. 403–409) e RF6 (r. 110).
- **Problema:**
  - La regola vale anche per "Scarica il PDF". Se lo scaricamento fallisce su una riga già `sent`, la riga passa a `failed` anche se l'email è arrivata. Con "Riprova" o con un errore nel passo 5 succede lo stesso a uno stato che era già `sent`.
  - Il guasto del PDF finisce nella riga "altro" della tabella, e il cliente legge "errore del server di posta".
  - "Riprova" rifà la stessa generazione, che fallisce di nuovo, e consuma i tentativi.
- **Perché conta:** lo stato nella riga è l'unica traccia della consegna. Il criterio 4 lo mostra in demo con `psql`.
- **Proposta:**
  - Limitare la regola ai flussi che inviano: un guasto di "Scarica il PDF" restituisce un errore e non tocca gli stati.
  - Nel passo 5, aggiornare solo lo stato dell'invio che non è ancora concluso.
  - Aggiungere a RF6 e alla tabella una causa "riepilogo non generato", con un messaggio proprio e senza "Riprova".
  - Aggiungere alla sez. 18 la prova "'Scarica il PDF' che fallisce su una riga `sent` non cambia gli stati".

### A2. Il motivo per scartare il "ricalco" vale anche per la scelta fatta
- **Fonte:** style N1 e design M4. Nasce dalla correzione SR3, collegata a D2.
- **Dove:** 9.1, "Alternative" (r. 323). Da leggere insieme alle r. 317 e 326, e alla r. 56.
- **Problema:**
  - Il ricalco è scartato perché "non ripetibile". Ma la r. 317, scritta con D2, dice la stessa cosa della chat.
  - "File dieci volte più pesanti" non dice rispetto a cosa. Nella 0025 il confronto è 312 KB contro 18 KB, e i file pesanti sono proprio quelli del mockup, cioè il riferimento di qualità.
  - La 0025, a cui la voce rimanda, chiama il ricalco "procedura del mockup".
- **Perché conta:** lo standard chiede motivi di scarto che distinguano la scelta dall'alternativa. Questo motivo non lo fa.
- **Proposta:** riscrivere la voce con la differenza reale. Per esempio: "*Ricalco da un render o da uno screenshot:* la geometria non viene dal file del taglio, quindi forma e proporzioni non si possono controllare con le misure (punto 7)". Il peso va tolto, oppure va dato con il termine di confronto.

### A3. Il controllo automatico delle proporzioni non dice quale lato è il fronte
- **Fonte:** design M2. Nasce dalla correzione D2.
- **Dove:** 9.2 punto 7 (r. 342) e r. 299. Fuori dall'intervallo: sez. 18 (r. 727) e appendice A (r. 1124).
- **Problema:**
  - Il documento non dice che `width_cm` è il lato della parete con la porta. L'appendice inoltre dichiara ancora da verificare l'ordine delle misure di Yoku S.
  - `shadow` è esclusa solo dal riquadro della Pianta, ma l'ombra a terra allarga anche il riquadro della Frontale.
- **Perché conta:** con l'ordine sbagliato, la prova scarta una vista giusta oppure fa passare il confronto sul lato sbagliato. Il prodotto in gioco è Yoku S, quello del criterio 2.
- **Proposta:**
  - Nel glossario (voce "Taglio") e nel punto 7 scrivere che `width_cm` è la larghezza della parete frontale, quella con la porta.
  - Escludere `shadow` da entrambi i riquadri, e chiamarli "il rettangolo minimo che contiene i poligoni".
  - Verificare l'ordine delle misure nell'inventario prima della fase 6.

### A4. L'inventario del punto 1 è incompleto e non distingue i file 2D da quelli 3D
- **Fonte:** design M3. Correzione D3 applicata solo in parte.
- **Dove:** 9.2 punti 1 e 3 (r. 334, 336).
- **Problema:**
  - Manca Yoku S 80, che sul sito ha solo il "File 2D". L'appendice, r. 1128, lo riporta.
  - Un DWG solo 2D non basta per la vista Esterno, che è in prospettiva e va in grande nel PDF.
  - Il punto 1 dice che nessun file indica la sua variante, ma il punto 3 chiede di inserire "quella del file disponibile" senza dire come riconoscerla.
- **Proposta:**
  - Aggiungere Yoku S 80 ("solo File 2D").
  - Scrivere che il livello A richiede un file **3D** del taglio. Un taglio che ha solo il 2D usa `viewsFrom` oppure resta fuori.
  - Nel punto 3: "la variante si riconosce dal modello (porta piena, vetro, mensola) confrontato con le foto, e si annota nell'inventario".

### A5. "FBX e DWG" contro "FBX, DWG o SKP"
- **Fonte:** style N2 (Major); structural N4 e design N3 (Nit). Nasce dalla correzione D1.
- **Dove:** 9.1 "Stato" (r. 326), da confrontare con le r. 46, 80, 312 e 334.
- **Problema:** la frase nuova toglie SKP. Chi compila l'inventario non sa se un taglio con il solo SKP può arrivare al livello A.
- **Proposta:** usare "FBX, DWG o SKP" anche alla r. 326. Hai detto di generare le viste da FBX e DWG, ma non hai detto di escludere SKP. Se vuoi escluderlo, va scritto una volta e tolto anche dalle altre quattro righe.

### A6. "La possibilità di riprovare" contraddice le regole di "Riprova"
- **Fonte:** style N3 (Major); structural N2 e design N1 (Nit). Nasce dalla correzione D6.
- **Dove:** 10.2 (r. 396), da confrontare con 10.3 (r. 412–413).
- **Problema:** la frase promette "Riprova" anche per una riga `sent` o senza tentativi rimasti.
- **Proposta:** "…si restituisce il suo esito con il token; 'Riprova' compare solo se la riga è `failed` e restano tentativi (sezione 10.3)."

---

## 🟢 Nit

| Voce | Fonte | Dove | Problema e proposta | Correzione da cui nasce |
|---|---|---|---|---|
| B1 | style N8, structural N1 | 8.2, r. 288 e 291 | La regola sui materiali duplicati è scritta due volte. Proposta: alla r. 291 tenere solo "senza conflitti di Git". | ST7 + ST-N15 |
| B2 | style N6, structural N3 | 10.3, r. 416 | "Un passo tra il 4 e il 5" non dice che i passi sono della 10.2, né se sono compresi. Proposta: "il passo 4 o il passo 5 della sezione 10.2". "Prova tre volte" diventa "prova tre rese". | D4 |
| B3 | style N4, structural N4 | 9.1 "Stato", r. 326 | Dopo la frase sul rischio, "però" non si lega più a niente. Proposta: spostare la frase sul rischio alla fine del paragrafo. | D1 |
| B4 | style N5 | 9.1, r. 317 | "Modello" nel glossario vuol dire prodotto. Proposta: "il modello linguistico usato". | D2 |
| B5 | style N7 | 14, r. 536 | "Tre controlli fissi": i controlli sono due voci, il tre si riferisce ai momenti. Proposta: "con axe e con la verifica formale nei tre momenti fissi elencati sotto". | ST4 |
| B6 | style N9, structural SR11 | r. 3 | Due frasi rimandano alla 23.1 con elenchi che si sovrappongono. Proposta: unirle in una frase sola. | ST-N1 |
| B7 | style N10, structural N5 | Glossario, r. 87 e 90–93 | La parentesi apre la definizione, e i nomi del codice non sono in backtick. Proposta: "**Revisione EGM** (Elephant-Goldfish Model)" nel termine, e **`valida`**, **`componiVista`**, **`token`**, **`request_id`**. | ST-N5, SR1 |
| B8 | style N11 | 14, r. 531 | L'ambito della verifica è ripetuto due volte nella stessa riga. Proposta: togliere la ripetizione. | ST-N17 |
| B9 | style N12 | 9.1, r. 299 | "Il controllo si fa a vista" non è più vero per intero. Proposta: "la forma si controlla a vista; le proporzioni anche con la prova automatica (9.2, punto 7)". | D2 |
| B10 | style N13 | 9.2 p. 7, r. 342 | "Riquadro dei poligoni" non è definito. Va unito ad A3. | D2 |
| B11 | style N14 | 10.4, r. 421 | Le forme dell'immagine nel PDF non comprendono il nuovo caso "solo elenco". | D4 |
| B12 | style N15 | 9.2 p. 6, r. 341 | "Con la foto ufficiale" è già nella definizione del livello B. Proposta: togliere la frase. | ST5 |
| B13 | structural N6 | 10.1, r. 379 | Le route sono rientrate come continuazione del punto precedente. Proposta: farne un punto "- **Route** (P6): …". | SR2 |
| B14 | structural N7 | 2, r. 56 | La sintesi elenca 4 alternative per le viste, il blocco della 9.1 ne elenca 5. Proposta: aggiungere "formato del mockup così com'è (0029)". | SR3 |
| B15 | structural N8 | 11, r. 468 | La sez. 11 non rimanda ai ripieghi automatici della 10.3. Proposta: una frase di rimando. | D4 |
| B16 | design N2 | 10.2 r. 393, 10.3 r. 416 | I tre tentativi di resa non hanno un tempo massimo, e una resa bloccata lascia la riga `pending`. Proposta: misurare il caso peggiore, oppure dare una scadenza per ogni tentativo. | D4 |
| B17 | design N4 | 9.2 p. 4 e 6, r. 337 e 341 | "Si producono le viste di entrambi" e la regola delle 4 ore insieme fanno sì che un secondo taglio lento mandi al livello B un prodotto che ha già un taglio buono. La regola delle 4 ore è tua e non la riapro. Proposta: nel punto 4 scrivere "si possono produrre", oppure dichiarare questa conseguenza nel punto 6. | ST5 |

---

## Fuori dal documento

La scheda 0025 chiama ancora "ricalco" la procedura del mockup, mentre la 0029 dice che le viste sono state prodotte in chat. Lo segnalano structural e design. È collegato ad A2.

---

## Matrice di tracciabilità

| Voce | design | structural | style | Correzione del round 1 |
|---|---|---|---|---|
| A1 | M1 | — | — | D4 |
| A2 | M4 | — | N1 | SR3, D2 |
| A3 | M2 | — | (N13) | D2 |
| A4 | M3 | — | — | D3 |
| A5 | N3 | N4 | N2 | D1 |
| A6 | N1 | N2 | N3 | D6 |
| B1 | — | N1 | N8 | ST7, ST-N15 |
| B2 | — | N3 | N6 | D4 |
| B3 | — | N4 | N4 | D1 |
| B4–B5 | — | — | N5, N7 | D2, ST4 |
| B6 | — | SR11 | N9 | ST-N1 |
| B7 | — | N5 | N10 | ST-N5, SR1 |
| B8–B12 | — | — | N11–N15 | vari |
| B13–B15 | — | N6–N8 | — | SR2, SR3, D4 |
| B16–B17 | N2, N4 | — | — | D4, ST5 |

---

## Esito dello stadio

L'autore ha scelto di passare allo Stage 8 senza altre correzioni. Il limite dei riesami era già stato raggiunto. I 6 Major e i 17 Nit di questo round restano aperti e sono registrati come compromessi accettati per lo Stage 7.
