Status: resolved (Stage 7, round 1)

# Goldfish Annotated Review Report: Stage 7, round 1

## Esito della risoluzione (2026-11-12)

L'autore ha scelto "auto accept" e ha risposto alle due voci ESCALATE:

- **D1:** le viste si producono in chat a partire dai file FBX e DWG, e gli altri rischi sono accettati. Applicato in forma ridotta. Non ho spostato una prova nella fase 2 e non ho aggiunto il ripiego Blender o SketchUp. In 9.1 ("Stato") e nella riga dei rischi della 20.1 ora c'è scritto che il metodo non è ancora misurato su un taglio completo da FBX o DWG, che è un rischio accettato e che il ripiego è il livello B. La frase "già state prodotte così" è diventata "prodotte in chat (scheda 0029)": è il fatto registrato nella 0029.
- **ST5:** oltre le 4 ore di lavoro di una persona, tutto il prodotto passa al livello B, con la foto ufficiale. Applicato in 9.2 punto 6, nella riga dei rischi della 20.1 ("regola delle 4 ore") e nella scheda 0029, riga 30, che citava ancora la mezza giornata.

Ho applicato tutte le 35 correzioni PROPOSE FIX. Non ho modificato il documento per ST3 (contestato) né per gli 11 DECLINE.

Per evitare nuove incoerenze ho fatto anche questi allineamenti:
- **D2:** il controllo delle proporzioni è aggiunto anche alla prova sul formato della sez. 18, e si fa sulle misure del taglio da cui la vista è prodotta, coerente con la regola su `viewsFrom` della 9.1.
- **D4:** la prova "vista malformata durante l'invio" è aggiunta alla sez. 18.
- **D10:** la nuova causa "errore imprevisto" è aggiunta anche a RF6.
- **D12:** la foto del livello B ha lo stesso testo alternativo dell'anteprima.
- **D13:** la regola sulle chiavi `_` in 8.2 rimanda a P1, che dice la stessa cosa (`z.preprocess`, poi `.strict()`).
- **D3:** l'inventario si compila "prima della fase 6", in linea con la 20.5, senza fissare una fase nuova nel calendario.
- **ST-N15:** la frase sulla lettura dal database dalla fine della fase 3 è rimasta nel punto subito sotto.

Resta un'incoerenza fuori dal documento: la scheda 0025, tra le alternative, chiama ancora "ricalco di un'immagine renderizzata altrove" la procedura del mockup, mentre la 0029 dice che le viste sono state prodotte in chat. Non l'ho corretta perché è una scheda storica, già sostituita in parte dalla 0029.

**Righe:** il documento passa da 1134 a 1157 righe, e la sezione 15 inizia ora alla riga 547. FeatureRange: 1..546, DetailedRange: 547..1157. I numeri di riga qui sotto si riferiscono alla versione prima delle correzioni, salvata in `archivio/revisione-v7/configuratore-saune-analisi-v7-prima-dello-stage7.md`.

**Target:** `configuratore-saune-analisi-v7.md` (`1..526`, FeatureRange)
**Fonte dei risultati:** `critic_report.md`, revisori `egm-design`, `egm-structural` ed `egm-style`.
**Copia del documento prima delle correzioni:** `archivio/revisione-v7/configuratore-saune-analisi-v7-prima-dello-stage7.md`

## Riepilogo

| Categoria | Numero | Voci |
|---|---|---|
| ESCALATE (serve una tua informazione) | 2 | D1, ST5 |
| CONTEST | 1 | ST3 |
| PROPOSE FIX | 35 | 14 Major e 21 Nit (Issue 2–12, 14, 16–19, 22, 24–26, 29, 32–34, 36–39, 41–43, 45, 47–49) |
| DECLINE (Nit registrati, senza modifiche) | 11 | D8, D9, D11, SR6, SR7, SR9, SR10, ST-N3, ST-N8, ST-N12, ST-N14 |

**Prima le due voci ESCALATE.** Per decidere servono fatti che i revisori non potevano leggere. Le correzioni proposte per queste voci le applico solo dopo la tua risposta.

**Modifiche fuori dall'intervallo.** Tre correzioni toccano anche righe dopo la 526:
- SR4: due righe in più nella tabella 20.1;
- D4: una prova in più nella sez. 18;
- D1: un ripiego da aggiungere alla tabella dei rischi.

Le indico in modo esplicito nelle voci.

---

## Prioritized Findings & AI Suggestions

### [Issue 1] [`egm-design`] D1: non è dimostrato che le viste si possano produrre in chat. Severity: Blocker
*   **Affected Scope:** [Lines 293-328](configuratore-saune-analisi-v7.md#L293-L328) (9.1 Obiettivo e scelta, 9.2 Limiti), riga 56.
*   **Discrepancy Description:** tutta la risposta al problema (Yoku S, criterio 2) dipende da una chat che legga un file FBX, DWG o SKP e ne ricavi tre viste corrette. L'unico esempio, Aladdin 60, viene da "una procedura non conservata" (scheda 0025). DWG e SKP sono formati binari proprietari, e la prima prova su Yoku S cade nella fase 6.
*   **Rationale:** se il metodo non funziona lo si scopre a metà calendario, e Yoku S passa al livello B.
*   ***AI Suggestion:*** ESCALATE
*   ***Justification:** ho controllato la scheda 0025 e il documento si contraddice su un fatto che solo tu conosci:
    *   La riga 311 dice: "Le viste di Aladdin 60 del mockup sono già state prodotte così", cioè in chat dai file dell'Area Pro.
    *   La scheda 0025, tra le alternative, chiama la stessa procedura "Ricalco di un'immagine renderizzata altrove (procedura del mockup): non ripetibile".
    *   La riga 56 del documento elenca il "ricalco di immagini renderizzate altrove" tra le alternative **scartate**.

    Quindi, secondo i testi, il metodo scelto potrebbe coincidere con quello scartato. Mi servono tre risposte:
    1. Per Aladdin 60, cosa è stato caricato in chat: il file FBX, DWG o SKP, oppure un render o uno screenshot?
    2. Hai mai provato la chat su un file DWG o SKP?
    3. Accetti di anticipare alla fase 2 una prova a tempo su Yoku S 60? È la stessa proposta di R1 dello Stage 5, ancora aperta.

    Il Blocker non lo declasso. Se il metodo è già provato su un file nativo, basta scriverlo, e il Blocker si chiude con la prima delle modifiche qui sotto.
*   ***Proposed Edit*** (da applicare dopo la tua risposta; il testo tra parentesi quadre dipende da cosa mi dici):
    *   Location: riga 311, frase "Le viste di Aladdin 60 del mockup sono già state prodotte così."
    *   Change: "Le viste di Aladdin 60 del mockup sono state prodotte in chat a partire da [file nativo / render del modello]; [il metodo non è ancora stato provato su un DWG o un SKP]."
    *   Location: 9.2, nuovo punto dopo il 6.
    *   Change: "**Prova del metodo.** Il metodo si prova su Yoku S 60 nella fase 2, partendo da un file indicato per nome. Si misura il tempo e si annota l'esito nella scheda 0029. Se la chat non ricava viste corrette da un file nativo, prima di passare al livello B si prova un ripiego che dà sempre lo stesso risultato: Blender importa l'FBX ed esporta un SVG in vista ortografica, oppure si usa l'esportazione 2D vettoriale di SketchUp. Il ripiego viene dopo la chat perché richiede di dividere a mano le zone."
    *   Fuori dall'intervallo: il calendario (15.5), per spostare la prova nella fase 2, e la riga della tabella 20.1 sulle viste, per aggiungere il ripiego.

### [Issue 2] [`egm-design`] D2: la procedura non è ripetibile e il controllo di qualità guarda solo il formato. Severity: Major
*   **Affected Scope:** [Lines 309-327](configuratore-saune-analisi-v7.md#L309-L327) (9.1, 9.2 punto 7)
*   **Discrepancy Description:** una chat non dà lo stesso risultato due volte. La prova automatica controlla solo la sintassi, mentre proporzioni e verso della vista si controllano solo a occhio.
*   **Rationale:** una vista plausibile ma sbagliata finisce nel PDF inviato al tutor.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** il risultato è corretto. "Così la procedura si può ripetere" promette più di quanto una chat possa dare. Il controllo del rapporto tra i lati costa poco: le misure dei tagli sono già nel catalogo (`width_cm`, `depth_cm`, `height_cm`).
*   ***Proposed Edit:***
    *   Location: riga 309, frase "così la procedura si può ripetere."
    *   Change: "insieme al servizio, al modello e alla data della chat. La fonte delle viste è il file SVG nel repository: la chat non dà lo stesso risultato due volte, quindi `docs/viste.md` serve a rifare il lavoro, non a riottenere lo stesso file."
    *   Location: riga 327, punto 7.
    *   Change: "7. **Controllo.** Ogni vista passa la prova sul formato e si confronta con la foto ufficiale nella pagina `/galleria` prima di entrare nel repository. La prova controlla anche le proporzioni: il riquadro della Pianta deve avere il rapporto `width_cm / depth_cm` del taglio di origine, e quello della Frontale il rapporto `width_cm / height_cm`, con una tolleranza del 5%. Per ogni taglio `docs/viste.md` annota un elemento asimmetrico, come il lato della porta o della stufa, da controllare sulla foto per escludere una vista specchiata."

### [Issue 3] [`egm-design`] D3: manca l'inventario dei file dell'Area Pro. Severity: Major
*   **Affected Scope:** [Lines 319-321](configuratore-saune-analisi-v7.md#L319-L321) (9.2 punti 1–3)
*   **Discrepancy Description:** sul sito, Yoku S 45 ha solo "File 3D" e "File 2D", senza formato. Nessun file indica la variante (Door, Glass, Shelf). L'inventario non esiste ancora.
*   **Rationale:** da questi dati dipendono il criterio 2 e il riuso delle viste con `viewsFrom`.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** il revisore l'ha verificato sulla pagina salvata. La correzione dichiara cosa si sa e fissa quando va fatto l'inventario.
*   ***Proposed Edit:***
    *   Location: riga 319, punto 1.
    *   Change: "1. **Serve un file dell'Area Pro del taglio** (FBX, DWG o SKP). L'inventario dei file disponibili per ogni prodotto e taglio, con formato e variante, va in `docs/catalogo-inventario.md` e si fa nella fase 2, prima di fissare l'ordine della fase 6. Dal sito risulta che Yoku S 60 ha DWG, FBX e SKP, mentre il 45 e il 105 hanno solo "File 3D" e "File 2D" senza formato; nessun file dice a quale variante si riferisce."

### [Issue 4] [`egm-design`] D4: non è previsto cosa succede se la generazione del PDF fallisce. Severity: Major
*   **Affected Scope:** [Lines 372-397](configuratore-saune-analisi-v7.md#L372-L397) (10.2 passo 4, 10.3), riga 448.
*   **Discrepancy Description:** se resvg o PDFKit lanciano un'eccezione, la riga resta `pending`. "Riprova" risponde `in-corso` per sempre e "Scarica il PDF" fallisce.
*   **Rationale:** è il requisito che non si può togliere, ed è proprio il caso in cui il cliente resta senza niente.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** il caso non è coperto. Il ripiego `flat` è una scelta fissa decisa con la prova, e il ripiego "solo elenco" scatta solo per i codici tolti dal catalogo.
*   ***Proposed Edit:***
    *   Location: 10.3, nuovo punto dopo la riga 396.
    *   Change: "- **Se il PDF non si genera.** La generazione prova tre volte, in ordine: resa completa, poi `flat: true`, poi il solo elenco delle scelte. La stessa sequenza vale per l'invio, per "Riprova" e per "Scarica il PDF". Se anche l'ultimo tentativo fallisce, o se un passo tra il 4 e il 5 lancia un'eccezione, entrambi gli stati diventano `failed` con l'errore: la riga non resta mai `pending` mentre l'applicazione gira."
    *   Fuori dall'intervallo, sez. 18: aggiungere la prova "una vista malformata produce un PDF `flat` o con il solo elenco, e gli stati non restano `pending`".

### [Issue 5] [`egm-design`] D5: lo stato nell'URL rischia di far ridisegnare la pagina sul server a ogni scelta. Severity: Major
*   **Affected Scope:** [Lines 355-356](configuratore-saune-analisi-v7.md#L355-L356) (10.1), righe 328 e 339.
*   **Discrepancy Description:** se l'URL si aggiorna con `router.push` o `router.replace` e il server legge `searchParams`, ogni clic ridisegna la pagina sul server e trasmette di nuovo le viste. Le viste pesano fino a circa 305 KB e non hanno un tetto.
*   **Rationale:** l'anteprima diventerebbe lenta e la frase "non richiede altre richieste" sarebbe falsa.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** il comportamento descritto è quello reale dell'App Router di Next.js. Il documento non dice come si aggiorna l'URL, ed è proprio questa scelta a decidere se la promessa regge. Per il peso propongo un obiettivo indicativo, non un criterio di accettazione: tieni comunque la scelta "senza un tetto fisso" del punto 8.
*   ***Proposed Edit:***
    *   Location: riga 356, dopo "non è legato a una configurazione salvata."
    *   Change: aggiungere "L'URL si aggiorna con `window.history.replaceState`, che Next.js tiene allineato con `useSearchParams` senza richieste al server: il server legge lo stato dall'URL solo al primo caricamento."
    *   Location: riga 328, fine del punto 8.
    *   Change: "In chat si chiede di semplificare i poligoni, con un obiettivo indicativo di 150 KB per vista; il peso non è un criterio di accettazione."

### [Issue 6] [`egm-structural`] SR1: i componenti si usano prima di essere definiti. Severity: Major
*   **Affected Scope:** [Lines 65-94](configuratore-saune-analisi-v7.md#L65-L94) (Glossario)
*   **Discrepancy Description:** `valida`, `componiVista`, le Server Action e il contratto compaiono prima della 10.1, e non sono nel glossario.
*   **Rationale:** chi legge incontra nomi senza sapere dove stanno.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** la soluzione più economica è aggiungere quattro righe al glossario, senza spostare sezioni.
*   ***Proposed Edit:***
    *   Location: glossario, dopo la riga "Contratto condiviso".
    *   Change: aggiungere quattro righe:
        - `| **valida** | La funzione pura che controlla che una configurazione esista nel catalogo: taglio, gruppi e valori (sezione 10.1) |`
        - `| **componiVista** | La funzione pura che applica colori e texture dei materiali a una vista; la usano il browser e il server (sezione 9.3) |`
        - `| **token** | Il codice casuale di una configurazione salvata, usato da "Riprova" e da "Scarica il PDF" (sezione 8.1) |`
        - `| **request_id** | Il codice generato dal client a ogni apertura della finestra di invio, contro le righe doppie (sezione 10.2) |`

### [Issue 7] [`egm-structural`] SR2: l'architettura rimanda a P6/P8 invece di dichiarare le route. Severity: Major
*   **Affected Scope:** [Line 364](configuratore-saune-analisi-v7.md#L364) (10.1)
*   **Discrepancy Description:** le tre route stanno solo nella 20.3, e i quattro motivi di "Riprova" in P8.
*   **Rationale:** l'architettura non si legge da sola.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** la parte sulle route è giusta e si risolve con tre righe. I quattro motivi di "Riprova" invece sono già elencati alla riga 394, ciascuno con il suo significato: quella parte non richiede modifiche.
*   ***Proposed Edit:***
    *   Location: riga 364.
    *   Change: "  Le route sono tre (P6): `/`, il configuratore; `/riepilogo/[token]/pdf`, il PDF rigenerato dalla riga salvata; `/galleria`, il controllo visivo delle viste, attivo nella demo. Il dettaglio va in `docs/architettura.md`."

### [Issue 8] [`egm-structural`] SR3: le alternative sono trattate in modo asimmetrico. Severity: Major
*   **Affected Scope:** [Lines 293-309](configuratore-saune-analisi-v7.md#L293-L309) (9.1)
*   **Discrepancy Description:** la grafica ha rischio Alto ma non ha un blocco di alternative con i motivi.
*   **Rationale:** il documento non mostra i motivi proprio dove la scelta è più discutibile.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** i motivi esistono già nelle schede 0025 e 0029. Li riporto qui senza aggiungere decisioni nuove. Per il ricalco riprendo il motivo della 0025, che va riletto alla luce di D1.
*   ***Proposed Edit:***
    *   Location: dopo la riga 309.
    *   Change: aggiungere questo blocco:
        ```
        **Alternative** (motivi nelle schede 0025 e 0029)
        - *Generatore a parametri:* ripetibile senza file 3D, ma la resa è schematica.
        - *Script nel repository che legge l'FBX:* ripetibile, ma richiede regole per ogni modello, non legge i DWG e la resa non era al livello del mockup.
        - *Formato del mockup così com'è:* due formati da mantenere, perché resvg non supporta classi CSS e `color-mix()`.
        - *Ricalco di un'immagine renderizzata altrove:* non ripetibile e file dieci volte più pesanti.
        - *3D in tempo reale nel browser:* escluso, perché i modelli non possono entrare nel repository.
        ```

### [Issue 9] [`egm-structural`] SR4: due rischi accettati mancano dalla tabella 20.1. Severity: Major
*   **Affected Scope:** righe 347 e 397. La correzione è alla tabella 20.1, fuori dall'intervallo.
*   **Discrepancy Description:** mancano la notifica fallita, che non si rimanda, e il caricamento dei file dell'Area Pro su un servizio esterno.
*   **Rationale:** la riga 61 promette che i rischi stanno nella 20.1.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** ho controllato la tabella 20.1: le due righe mancano davvero.
*   ***Proposed Edit:***
    *   Location: tabella 20.1, prima della riga "Copie dei dati del cliente…".
    *   Change: aggiungere due righe:
        - `| La notifica al progetto fallisce e non si rimanda | Basso: il cliente riceve comunque il PDF | Rischio accettato: l'errore resta in project_status, che è l'unica traccia (sezione 10.3, scheda 0030) | N |`
        - `| I file dell'Area Pro caricati in chat restano su un servizio esterno | Medio: file riservati del produttore fuori dal progetto | Autorizzazione del tutor (sezione 9.4); nel repository entrano solo le viste prodotte | M |`

### [Issue 10] [`egm-structural`] SR5: la definizione dei livelli A e B è sepolta in un elenco di limiti. Severity: Major
*   **Affected Scope:** [Lines 317-325](configuratore-saune-analisi-v7.md#L317-L325) (9.2)
*   **Discrepancy Description:** la definizione normativa dei livelli è il punto 5 di un elenco intitolato "Limiti e come si riduce il rischio".
*   **Rationale:** chi segue il rimando "sezione 9.2" cerca una definizione.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** il problema è reale. Spostare i punti però rinumererebbe "9.2 punto 4" e "9.2 punto 8", citati in altre sezioni e nei report. Propongo quindi di cambiare solo il titolo: chi cerca la definizione la trova nel titolo, e i numeri dei punti restano uguali.
*   ***Proposed Edit:***
    *   Location: riga 317.
    *   Change: "### 9.2 Livelli di resa, limiti e come si riduce il rischio"

### [Issue 11] [`egm-style`] ST1: "conferma" ha due significati in due passi vicini. Severity: Major
*   **Affected Scope:** [Line 372](configuratore-saune-analisi-v7.md#L372) (10.2 passo 3)
*   **Discrepancy Description:** al passo 1 è il cliente che conferma l'email; al passo 3 è la scrittura nel database.
*   **Rationale:** il passo 3 è il cuore del meccanismo della posta in uscita.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** l'ambiguità c'è, e l'ha trovata anche lo Stage 6 (S6).
*   ***Proposed Edit:***
    *   Location: riga 372, "e la conferma subito. Riceve `id` e `number`."
    *   Change: "e la scrive subito nel database (commit), prima di qualsiasi invio. Riceve `id` e `number`."

### [Issue 12] [`egm-style`] ST2: contraddizione sul contenuto del repository. Severity: Major
*   **Affected Scope:** [Line 309](configuratore-saune-analisi-v7.md#L309)
*   **Discrepancy Description:** "Nel repository non c'è uno script delle viste", eppure `archivio/` fa parte del repository.
*   **Rationale:** la frase si smentisce da sola.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** la contraddizione è reale, e nella stessa frase c'è anche la ripetizione "script di prova provato".
*   ***Proposed Edit:***
    *   Location: riga 309, "Nel repository non c'è uno script delle viste: lo script di prova provato il 2026-11-12 su un secondo prodotto è in `archivio/script-viste/`."
    *   Change: "L'applicazione non contiene uno script delle viste: lo script provato il 2026-11-12 su un secondo prodotto è archiviato in `archivio/script-viste/` e non fa parte della procedura."

### [Issue 13] [`egm-style`] ST3: prove della fase 1 dichiarate come già fatte. Severity: Major
*   **Affected Scope:** [Lines 414-415](configuratore-saune-analisi-v7.md#L414-L415) (10.5)
*   **Discrepancy Description:** secondo il revisore la fase 1 non è ancora avvenuta, quindi "provati nella fase 1" sarebbe falso.
*   **Rationale:** un'affermazione non vera su una verifica.
*   ***AI Suggestion:*** CONTEST
*   ***Justification:*** il revisore aveva le prove a disposizione nel documento stesso:
    *   il glossario alla riga 84 dice che il via libera "permette di iniziare il codice";
    *   la tabella del calendario alla riga 635 riporta "1. Prove delle parti incerte | fatta | Account Gmail, password per le app e invii di prova; Docker…".

    La fase 1 quindi è già fatta e il passato è corretto. Il revisore ha legato il via libera alla fase 1, ma il via libera riguarda solo il codice. Il Major resta tale nella forma, ma è infondato.
*   ***Proposed Edit:*** nessuna.

### [Issue 14] [`egm-style`] ST4: verifica dichiarata come già fatta. Severity: Major
*   **Affected Scope:** [Line 516](configuratore-saune-analisi-v7.md#L516) (14)
*   **Discrepancy Description:** "sono verificati" si riferisce a un'interfaccia che non esiste ancora.
*   **Rationale:** dichiara come fatto un controllo che non è stato fatto.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** a differenza di ST3, qui il codice non esiste ancora, quindi il risultato è corretto.
*   ***Proposed Edit:***
    *   Location: riga 516.
    *   Change: "- Contrasti, etichette dei campi e lingua della pagina (`it`) si verificano nei tre controlli fissi elencati sotto."

### [Issue 15] [`egm-style`] ST5: la soglia "mezza giornata" non è definita. Severity: Major
*   **Affected Scope:** [Line 326](configuratore-saune-analisi-v7.md#L326) (9.2 punto 6)
*   **Discrepancy Description:** non è detto se la mezza giornata vale per una persona o per due, né se le sessioni si sommano. Lo Stage 6 (S3) aggiunge un'altra ambiguità: non è chiaro se un taglio lento fa passare al livello B l'intero prodotto o se basta escludere quel taglio.
*   **Rationale:** è la soglia che fa passare un prodotto al livello B.
*   ***AI Suggestion:*** ESCALATE
*   ***Justification:*** la parte sulla misura si corregge con "4 ore di lavoro di una persona". La seconda parte invece è una tua decisione di progetto, e il testo non permette di dedurla. Oggi la frase dice "quel prodotto passa al livello B", ma i punti 2 e 4 lasciano intendere che si possa escludere solo il taglio. Mi serve sapere quale delle due regole vuoi.
*   ***Proposed Edit*** (la parte tra parentesi quadre dipende dalla tua scelta):
    *   Location: riga 326.
    *   Change: "6. **Regola di decisione.** Se produrre e controllare le viste di un taglio richiede più di 4 ore di lavoro di una persona, anche in più sessioni, [quel taglio resta fuori o riusa le viste di un altro (punto 4), e il prodotto passa al livello B solo se non gli resta nessun taglio con viste] / [tutto il prodotto passa al livello B]. Per Yoku S, che è il prodotto che risponde al problema (sezione 2), il passaggio al livello B rende la consegna parziale e si dichiara."

### [Issue 16] [`egm-style`] ST6: il limite di RNF4 è dato come già rispettato, e le stime del tempo sono tre. Severity: Major
*   **Affected Scope:** [Line 374](configuratore-saune-analisi-v7.md#L374), [Line 517](configuratore-saune-analisi-v7.md#L517)
*   **Discrepancy Description:** il tempo di generazione del PDF non è stato misurato, e il documento dà tre stime diverse.
*   **Rationale:** il documento dichiara rispettato un requisito che non è ancora stato misurato.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** l'ha trovato anche lo Stage 6 (S8). Divido il passo 5 in sotto-punti, come chiede il revisore.
*   ***Proposed Edit:***
    *   Location: riga 374, l'intero passo 5.
    *   Change:
        ```
        5. Il server invia **insieme** il PDF al cliente, come allegato, e la notifica all'email del progetto, con Nodemailer e un Gmail dedicato al progetto (scheda 0030):
           - ogni invio scade dopo **15 secondi complessivi**, perché i timeout predefiniti di Nodemailer sono di minuti; la scadenza di un invio non interrompe l'altro (come si ottiene: appendice C);
           - il server attende entrambi gli invii, poi aggiorna `customer_status` e `project_status` a `sent` o `failed`, con l'errore;
           - un fallimento della notifica non cambia la risposta al cliente;
           - nel caso peggiore la risposta arriva dopo circa 15 secondi più la generazione del PDF. RNF4 (60 secondi) è rispettato se la generazione resta sotto i 45 secondi: si misura nella prova della sezione 11.
        ```
    *   Location: riga 517, "che può durare una ventina di secondi".
    *   Change: "che può durare fino a circa 15 secondi più la generazione del PDF (sezione 10.2)".

### [Issue 17] [`egm-style`] ST7: un paragrafo con sei argomenti diversi. Severity: Major
*   **Affected Scope:** [Line 274](configuratore-saune-analisi-v7.md#L274) (8.1), righe 280–281 (8.2)
*   **Discrepancy Description:** la regola del seed sui materiali duplicati si perde in mezzo alle convenzioni sui nomi.
*   **Rationale:** è un comportamento da realizzare, e il suo posto è la 8.2.
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** sposto la regola e trasformo il resto in un elenco. Il contenuto non cambia.
*   ***Proposed Edit:***
    *   Location: riga 274.
    *   Change:
        ```
        Convenzioni:
        - **Nomi delle colonne.** Seguono i campi dei file JSON (P1), passando dal camelCase del JSON allo snake_case; `default` diventa `default_value` perché è una parola riservata in SQL.
        - **Significato dei campi.** `step` è il passaggio in cui compare il gruppo (1 = Misure, 2 = Materiali; il taglio sta sempre in Misure), `zones` sono le zone della vista a cui il gruppo applica il materiale, `default_value` è il valore predefinito.
        - **Lingua dei nomi.** Colonne del database, campi dei file del catalogo e chiavi che li riprendono nei tipi (`group`, `value`) sono in inglese; funzioni, file e cartelle del progetto sono in italiano; le etichette mostrate al cliente sono in italiano.

        Tipi, chiavi e vincoli definitivi si fissano nel contratto condiviso (sezione 15.2) e poi si documentano in `docs/modello-dati.md`.
        ```
    *   Location: riga 280, alla fine del punto.
    *   Change: aggiungere " Più file possono dichiarare lo stesso materiale: il seed fallisce se due file usano lo stesso `code` con dati diversi."

### [Issue 18] [`egm-design`] D6: una richiesta ripetuta su una riga già conclusa non ha un esito descritto. Severity: Nit
*   **Affected Scope:** [Line 377](configuratore-saune-analisi-v7.md#L377)
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** è lo stesso punto di S7 dello Stage 6, e basta una frase.
*   ***Proposed Edit:*** alla fine della riga 377 aggiungere: "Se la riga è già `sent` o `failed`, si restituisce il suo esito, con token e la possibilità di riprovare. Next.js esegue in serie le Server Action dello stesso client, quindi `in-corso` arriva soprattutto da chiamate concorrenti fuori dall'interfaccia, come nelle prove."

### [Issue 19] [`egm-design`] D7: righe `pending` bloccate fuori da `npm run demo`. Severity: Nit
*   **Affected Scope:** [Line 395](configuratore-saune-analisi-v7.md#L395)
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:*** alla fine della riga 395 aggiungere: "Dopo un'interruzione si riparte sempre con `npm run demo`: con `npm run dev` o `next start` lanciati a mano le righe restano `pending`."

### [Issue 20] [`egm-design`] D8: lo stesso numero di configurazione su due portatili. Severity: Nit
*   **Affected Scope:** riga 244
*   ***AI Suggestion:*** DECLINE
*   ***Justification:*** la demo gira su un solo portatile (sez. 1). Il doppione nasce solo dalle prove fatte in sviluppo, e queste usano Mailpit, non la casella del progetto.

### [Issue 21] [`egm-design`] D9: la scheda 0027 non è allineata con le zone senza materiale. Severity: Nit
*   **Affected Scope:** riga 336, scheda 0027
*   ***AI Suggestion:*** DECLINE
*   ***Justification:*** la correzione sta nella scheda, fuori dal documento. Dipende inoltre da N-b dello Stage 5 (pedana facoltativa sì o no), che è una tua scelta ancora aperta.

### [Issue 22] [`egm-design`] D10: gli errori sconosciuti diventano "server non raggiungibile". Severity: Nit
*   **Affected Scope:** [Line 390](configuratore-saune-analisi-v7.md#L390), riga 106 (RF6)
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** il messaggio attuale porta a cercare la causa nel posto sbagliato. Anche style lo segnala (ST-N17).
*   ***Proposed Edit:***
    *   Location: riga 390.
    *   Change: `| altro | errore imprevisto | "L'email non è partita per un errore del server di posta."; il codice si salva in customer_error |`
    *   Location: riga 106, "tempo scaduto, indirizzo rifiutato."
    *   Change: "tempo scaduto, indirizzo rifiutato, errore imprevisto."

### [Issue 23] [`egm-design`] D11: le indicazioni del tutor non hanno una traccia scritta. Severity: Nit
*   ***AI Suggestion:*** DECLINE
*   ***Justification:*** il glossario (r. 83) dichiara già che le indicazioni del tutor sono state date a voce. Annotare data e contesto riguarda le schede, fuori dal documento.

### [Issue 24] [`egm-design`] D12: non è detto come si fa il testo alternativo dell'anteprima. Severity: Nit
*   **Affected Scope:** [Line 514](configuratore-saune-analisi-v7.md#L514)
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:*** "- L'anteprima ha un **testo alternativo** che descrive la configurazione scelta: `role="img"` con `aria-label` sul contenitore dell'SVG, il cui contenuto interno è ignorato dai lettori di schermo. Il testo si aggiorna a ogni cambio ma non si annuncia: le scelte le annunciano i controlli."

### [Issue 25] [`egm-design`] D13: i campi `_` dei file del catalogo e la prova sulla chiave sconosciuta. Severity: Nit
*   **Affected Scope:** [Line 280](configuratore-saune-analisi-v7.md#L280)
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** `aladdin.json` contiene campi `_` (per esempio `_daVerificare`), mentre la sez. 18 vuole che una chiave sconosciuta faccia fallire lo schema. La regola va scritta.
*   ***Proposed Edit:*** dopo "un file sbagliato fa fallire il seed e il database non cambia" aggiungere: "Lo schema è rigido: una chiave sconosciuta lo fa fallire. Le chiavi che iniziano con `_`, cioè le note di lavoro come `_daVerificare`, si tolgono prima del controllo."

### [Issue 26] [`egm-design`] D14: il log può contenere l'email del cliente. Severity: Nit
*   **Affected Scope:** [Line 397](configuratore-saune-analisi-v7.md#L397)
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:*** sostituire "I messaggi di log vanno solo sull'output del server, non su file." con "I messaggi di log vanno solo sull'output del server, non su file, e riportano solo il codice d'errore e l'`id` della riga: gli errori di Nodemailer possono contenere l'indirizzo del cliente."

### [Issue 27] [`egm-structural`] SR6: titoletti in grassetto invece degli H3. Severity: Nit
*   ***AI Suggestion:*** DECLINE
*   ***Justification:*** è solo un problema di forma. Rinumerare le sezioni 7, 11 e 12 cambierebbe molti rimandi senza far guadagnare niente al lettore.

### [Issue 28] [`egm-structural`] SR7: la sezione 2 mette quattro contenuti sotto un solo H2. Severity: Nit
*   ***AI Suggestion:*** DECLINE
*   ***Justification:*** l'etichetta che manca alla soluzione la aggiunge ST-N2. Una divisione in 2.1–2.4 cambierebbe la struttura senza un vero guadagno.

### [Issue 29] [`egm-structural`] SR8: notazione incoerente nella tabella delle decisioni. Severity: Nit
*   **Affected Scope:** [Lines 40, 46](configuratore-saune-analisi-v7.md#L40-L46)
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** correggo le due righe in cui l'informazione manca, e uso la notazione del README.
*   ***Proposed Edit:***
    *   riga 40: "| 0017 (in parte sostituita da 0023, 0026, 0030) |"
    *   riga 46: "| 0025 (sostituisce 0010, 0016, 0021), 0029 (sostituisce in parte 0025) |"

### [Issue 30] [`egm-structural`] SR9: lista di cose da fare dentro la specifica. Severity: Nit
*   ***AI Suggestion:*** DECLINE
*   ***Justification:*** la lista "Stato" dice cosa manca per le viste proprio dove si spiega la scelta. Spostarla nella 20.5 la allontana dal contesto.

### [Issue 31] [`egm-structural`] SR10: la sezione 5 ripete RF5–RF7 senza identificativi. Severity: Nit
*   ***AI Suggestion:*** DECLINE
*   ***Justification:*** la sezione 5 descrive cosa deve gestire il database, non i requisiti, e la ripetizione è breve.

### [Issue 32] [`egm-structural`/`egm-style`] SR11 / ST-N1: lo storico delle versioni nel preambolo. Severity: Nit
*   **Affected Scope:** [Line 3](configuratore-saune-analisi-v7.md#L3)
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:*** sostituire l'ultima frase della riga 3 ("La v7 è stata rivista … schede 0028–0030).") con "La revisione del 2026-11-12 ha cambiato viste, seed, invio e calendario (sezione 23.1, schede 0028–0030)."

### [Issue 33] [`egm-structural`] SR12: "Server Actions". Severity: Nit
*   **Affected Scope:** [Line 440](configuratore-saune-analisi-v7.md#L440)
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:*** "corpo delle Server Actions" diventa "corpo delle Server Action".

### [Issue 34] [`egm-style`] ST-N2: la frase della soluzione è senza verbo e senza etichetta. Severity: Nit
*   **Affected Scope:** [Line 27](configuratore-saune-analisi-v7.md#L27)
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:*** "Un configuratore web, in **Next.js + React**, per le saune del catalogo effe.it." diventa "**Soluzione.** Il progetto realizza un configuratore web, in **Next.js + React**, per le saune del catalogo effe.it."

### [Issue 35] [`egm-style`] ST-N3: la frase sul livello B ripetuta tre volte. Severity: Nit
*   ***AI Suggestion:*** DECLINE
*   ***Justification:*** la ripetizione alla riga 25 è voluta: lì serve a chiudere l'argomento del problema, in risposta a Z1 dello Stage 5.

### [Issue 36] [`egm-style`] ST-N4: la definizione di "Autore" è circolare. Severity: Nit
*   **Affected Scope:** [Line 85](configuratore-saune-analisi-v7.md#L85)
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:*** `| **Autore** | Nicolas (N), che scrive questo documento. "Scelta dell'autore" indica una decisione presa da lui, non dal tutor né dal sito |`

### [Issue 37] [`egm-style`] ST-N5: "(Elephant Goldfish)" non è spiegato. Severity: Nit
*   **Affected Scope:** [Line 87](configuratore-saune-analisi-v7.md#L87)
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:*** "| **Revisione EGM** | (Elephant Goldfish)" diventa "| **Revisione EGM** | (Elephant-Goldfish Model, cioè revisori senza memoria della stesura che leggono solo il documento)".

### [Issue 38] [`egm-style`] ST-N6: "sempre valorizzata" e il tempo di RNF4. Severity: Nit
*   **Affected Scope:** [Lines 101, 113](configuratore-saune-analisi-v7.md#L101-L113)
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:***
    *   riga 101: "Ogni gruppo ha una scelta sola, sempre valorizzata." diventa "Ogni gruppo ha esattamente un valore scelto."
    *   riga 113: "visibile entro 60 secondi." diventa "visibile entro 60 secondi dal clic su "Ricevi il riepilogo"."

### [Issue 39] [`egm-style`] ST-N7: "non regge" è colloquiale. Severity: Nit
*   **Affected Scope:** [Line 120](configuratore-saune-analisi-v7.md#L120)
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:*** "Un modello a colonne fisse non regge." diventa "Un modello a colonne fisse richiederebbe una colonna per ogni opzione di ogni prodotto."

### [Issue 40] [`egm-style`] ST-N8: giudizi soggettivi nel confronto tra DBMS. Severity: Nit
*   ***AI Suggestion:*** DECLINE
*   ***Justification:*** la riga "Giudizio" della tabella è un riassunto dichiarato come tale, e i motivi seguono nella 6.6. La correzione utile è quella di ST-N9.

### [Issue 41] [`egm-style`] ST-N9: "migrazioni dichiarative poco supportate" non si può verificare. Severity: Nit
*   **Affected Scope:** [Lines 164, 179](configuratore-saune-analisi-v7.md#L164-L179)
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** Drizzle supporta solo database SQL, quindi c'è un fatto concreto da citare.
*   ***Proposed Edit:***
    *   riga 164, ultima cella: "Drizzle non lo supporta; servirebbe un altro strumento"
    *   riga 179: "Le migrazioni dichiarative sono poco supportate" diventa "Drizzle non supporta MongoDB, quindi le migrazioni andrebbero gestite con un altro strumento"

### [Issue 42] [`egm-style`] ST-N10: Drizzle contro Prisma, affermazioni vaghe o superate. Severity: Nit
*   **Affected Scope:** [Lines 188, 190](configuratore-saune-analisi-v7.md#L188-L190)
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** dalla versione 7 (fine 2025) Prisma non usa più di default il motore separato in Rust, quindi il contrasto "non richiede un motore separato" non è più sicuro. Tolgo l'affermazione invece di verificarla.
*   ***Proposed Edit:***
    *   riga 188: eliminare il punto "**Leggero.** Pesa poco e non richiede un motore separato."
    *   riga 190: "è più guidato, ma nasconde di più l'SQL, e dato che SQL lo conosciamo il vantaggio non compensa." diventa "ha uno schema in un linguaggio proprio e query costruite da un client generato, quindi nasconde di più l'SQL; gli sviluppatori conoscono SQL e il vantaggio non compensa."

### [Issue 43] [`egm-style`] ST-N11: prima persona plurale. Severity: Nit
*   **Affected Scope:** [Line 183](configuratore-saune-analisi-v7.md#L183)
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:*** "Un ORM non è obbligatorio se conosciamo SQL." diventa "Gli sviluppatori conoscono SQL, quindi un ORM non è obbligatorio." La riga 190 è già coperta da ST-N10.

### [Issue 44] [`egm-style`] ST-N12: cinque costi di Docker dentro una parentesi. Severity: Nit
*   ***AI Suggestion:*** DECLINE
*   ***Justification:*** la frase si legge, e trasformarla in un elenco allunga la sezione per un argomento secondario.

### [Issue 45] [`egm-style`] ST-N13: l'avviso su `docker compose down -v` sta nel posto sbagliato. Severity: Nit
*   **Affected Scope:** [Lines 215, 222](configuratore-saune-analisi-v7.md#L215-L222)
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:***
    *   riga 222: togliere " Attenzione: `docker compose down -v` cancella il volume e quindi tutti i dati."
    *   riga 215: aggiungere alla fine " Attenzione: `docker compose down -v` cancella il volume e quindi tutti i dati, comprese le configurazioni salvate."

### [Issue 46] [`egm-style`] ST-N14: "in formato ottimizzato". Severity: Nit
*   ***AI Suggestion:*** DECLINE
*   ***Justification:*** formato e dimensioni delle immagini non sono ancora decisi, e sceglierli qui vorrebbe dire inventare un numero.

### [Issue 47] [`egm-style`] ST-N15: ripetizioni e affermazioni da precisare in 8.2. Severity: Nit
*   **Affected Scope:** [Lines 278-283](configuratore-saune-analisi-v7.md#L278-L283)
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Proposed Edit:***
    *   riga 278: "I file sono la **fonte** del catalogo; dalla fine della fase 3 l'applicazione legge **solo dal database**:" diventa "I file sono la **fonte** del catalogo:" (il punto subito sotto dice già la stessa cosa).
    *   riga 281: "Il catalogo non si modifica mai a mano" diventa "Le tabelle del catalogo nel database non si modificano mai a mano".
    *   riga 283: "Il lavoro di inserimento si divide per file, senza conflitti." diventa "Il lavoro di inserimento si divide per file, senza conflitti di Git; un materiale dichiarato in modo diverso in due file fa fallire il seed."

### [Issue 48] [`egm-style`] ST-N16: peso delle viste senza criterio. Severity: Nit
*   ***AI Suggestion:*** PROPOSE FIX
*   ***Justification:*** coperto dalla seconda modifica di D5.

### [Issue 49] [`egm-style`] ST-N17: altre formulazioni da precisare. Severity: Nit
*   **Affected Scope:** righe 390, 422, 446, 450, 481–482, 511, 519
*   ***AI Suggestion:*** PROPOSE FIX, tranne la r. 422 (DECLINE: per ora il volume di invii è di poche decine al giorno, e scrivere un limite di Gmail aggiungerebbe un numero da tenere aggiornato).
*   ***Justification:*** sulla r. 450: i font standard di PDFKit usano la codifica WinAnsi, che contiene "é". Il motivo "necessari per Wengé" quindi è debole. Il motivo vero è usare gli stessi font dell'interfaccia, e la prova PDF controlla comunque gli accenti.
*   ***Proposed Edit:***
    *   r. 390: coperta da D10.
    *   r. 446: "massima fedeltà" diventa "il PDF coincide con la resa di Chromium".
    *   r. 450: "incorpora i font del progetto (necessari per "Wengé" e per gli altri accenti)" diventa "incorpora i font del progetto, gli stessi dell'interfaccia (la prova controlla gli accenti, ad esempio in "Wengé")".
    *   r. 481: "Non costa nulla" diventa "Nessun campo in più da gestire".
    *   r. 482: "Non costa nulla e si mostra bene" diventa "Nessun lavoro in più; verificabile con gli strumenti per sviluppatori del browser".
    *   r. 511: "verificato su questi flussi" diventa "verificato sulla pagina del configuratore e sulle due finestre di dialogo".
    *   r. 519: "che dà una buona base ma non garantisce il livello AA" diventa "che gestisce focus, tasto Esc e attributi ARIA delle finestre di dialogo, ma non garantisce il livello AA".
