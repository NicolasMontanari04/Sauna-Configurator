# Stage 7: Critic Review, round 1

- **Documento:** `configuratore-saune-analisi-v7.md`, copia salvata in `archivio/revisione-v7/configuratore-saune-analisi-v7-prima-dello-stage7.md`
- **Intervallo:** FeatureRange 1..526 (sezioni 1–14)
- **Standard:** `feature-spec-standard`, applicato da design e structural. Style ha usato le regole della propria persona.
- **Contesto Goldfish:**
  - `docs-iniziali/docs/decisioni/` (README e schede 0001–0030);
  - `data/prodotti/aladdin.json`;
  - `contesto-web/`, con le pagine di effe.it: home, Aladdin, Yoku S.
- **Revisori, in contesti isolati:**
  - `egm-design`: completed;
  - `egm-structural`: completed;
  - `egm-style`: completed.
- **Revisione della v6:** `archivio/revisione-v6/critic_report.md`

**Esito del round:** 1 Blocker, 16 Major e 33 Nit. Il round non è pulito.

Prima di scrivere il report ho controllato a mano tre risultati:
- **D1 (Blocker), confermato.** La scheda 0025 (r. 7) dice che le viste di Aladdin 60 sono state "ricavate una sola volta dal modello 3D dell'Area Pro con una procedura non conservata". La r. 22 parla di "una conversazione non conservata". Non esiste quindi una prova documentata che la chat sappia leggere un file nativo.
- **ST3, da contestare.** Il glossario (r. 84) e il calendario (r. 635) dicono che la fase 1 è già fatta e che il via libera riguarda solo il codice. "Provati nella fase 1" (r. 415) quindi è corretto.
- **ST4, confermato.** "Sono verificati" (r. 516) si riferisce a un'interfaccia che non esiste ancora.

---

## 🔴 Blocker

### D1. Non è dimostrato che le viste si possano produrre in chat dai file dell'Area Pro
- **Fonte:** design 1.
- **Dove:** 9.1 (r. 293–315), 9.2 punti 1 e 6 (r. 319, 326), 2 (r. 56).
- **Problema:** tutta la risposta al problema, cioè Yoku S e il criterio 2, dipende dal fatto che una chat legga un FBX, un DWG o un SKP e ne ricavi tre viste corrette. L'unico esempio sono le viste di Aladdin 60, ottenute "con una procedura non conservata" (0025).
  - La r. 56 scarta il "ricalco di immagini renderizzate altrove". Non si sa però se il metodo scelto abbia mai letto davvero un file nativo, o se in pratica fosse proprio un ricalco.
  - DWG e SKP sono formati binari proprietari. "Con i DWG e gli SKP utilizzabili" (0029) non ha prove.
  - La prima prova su Yoku S è prevista nella fase 6, quando il calendario non ha più margine.
- **Perché conta:** se il metodo non funziona, lo si scopre a metà calendario. Yoku S passa al livello B, e la consegna resta parziale proprio sul punto che giustifica il progetto.
- **Proposta:**
  - In 9.1 scrivere cosa riceve davvero la chat: il file nativo, un render o uno screenshot.
  - Anticipare alla fase 2, o a prima del via libera, una prova su Yoku S 60 da un file indicato per nome. Va misurato il tempo e annotato l'esito nella 0029.
  - Aggiungere un ripiego che dà sempre lo stesso risultato, da usare prima di passare al livello B. Per esempio Blender che importa l'FBX ed esporta un SVG, oppure l'esportazione 2D vettoriale di SketchUp. Va spiegato perché viene dopo la chat.
- **Collegamenti:** Stage 5 R1, Stage 6 S1 (la chat non è definita) e S3.

---

## 🟡 Major

### Design

**D2. La procedura non è ripetibile e il controllo di qualità guarda solo il formato**
- **Dove:** 9.1 (r. 291, 307, 309), 9.2 punto 7 (r. 327).
- **Problema:** una chat non dà lo stesso risultato due volte, quindi conservare il testo della richiesta non basta a ripetere la procedura. La prova automatica controlla solo la sintassi. Forma, proporzioni e verso si controllano solo a occhio in `/galleria`. Una vista plausibile ma sbagliata, per esempio con la porta dal lato opposto, finisce nel PDF.
- **Proposta:**
  - dichiarare che la fonte è il file SVG nel repository;
  - annotare in `docs/viste.md` il modello e la data della chat;
  - aggiungere un controllo automatico sul rapporto tra i lati: pianta contro `widthCm/depthCm`, frontale contro `widthCm/heightCm`, con una tolleranza di ±5%;
  - per ogni taglio, annotare un elemento asimmetrico da confrontare con la foto.

**D3. Manca l'inventario dei file dell'Area Pro**
- **Dove:** 9.2 punti 1–3 (r. 319–321).
- **Problema:** dalla pagina salvata risulta questo:
  - Yoku S 60 ha "3D Dwg", "3D Fbx" e "Sketchup";
  - il 45 ha solo "File 3D" e "File 2D", senza formato;
  - nessun file dice a quale variante (Door, Glass, Shelf) si riferisce.

  `docs/catalogo-inventario.md` non esiste ancora. Il criterio 2 e il riuso tra tagli con `viewsFrom` dipendono da questi dati.
- **Proposta:** fare l'inventario di Aladdin e Yoku S (formato, variante, taglio) nella fase 1 o 2. In 9.2 scrivere quale variante e quali tagli di Yoku S vanno al livello A.

**D4. Non è previsto cosa succede se la generazione del PDF fallisce**
- **Dove:** 10.2 passo 4 (r. 373), 10.3 (r. 381–397), 11 (r. 448).
- **Problema:** se resvg o PDFKit lanciano un'eccezione, la riga resta `pending` fino al riavvio. Intanto "Riprova" risponde `in-corso` e anche "Scarica il PDF" fallisce. Il ripiego `flat` è una scelta fissa, non un ripiego che scatta mentre l'applicazione gira.
- **Proposta:**
  - una catena di ripieghi a runtime: resa completa, poi `flat`, poi solo elenco. La usano sia l'invio sia la Route Handler;
  - qualunque eccezione nei passi 4–5 porta entrambi gli stati a `failed`;
  - aggiungere il caso alla tabella delle cause e alle prove.

**D5. Lo stato nell'URL rischia di far ridisegnare la pagina sul server a ogni scelta**
- **Dove:** 10.1 (r. 355–356), 9.3 (r. 339), 9.2 punto 8 (r. 328).
- **Problema:** con l'App Router, `router.push` o `router.replace` insieme a `searchParams` letti sul server ridisegnano la pagina a ogni clic. Le viste, fino a circa 305 KB l'una, verrebbero trasmesse di nuovo, e due volte (HTML e payload RSC). Questo smentisce "non richiede altre richieste". Il peso delle viste inoltre è "senza un tetto fisso".
- **Proposta:**
  - aggiornare l'URL con `window.history.replaceState`, in modo che il server legga `searchParams` solo al primo caricamento;
  - un tetto per vista, per esempio 100–150 KB;
  - valutare di caricare solo le viste del taglio scelto.

### Structural

**SR1. L'architettura arriva tardi e i componenti si usano prima di essere definiti**
- **Dove:** 10.1 (r. 353–364). Prime citazioni alle r. 36, 38, 279, 293, 312.
- **Problema:** `valida`, `componiVista`, le Server Action e il "contratto" compaiono prima della 10.1, e i primi due non sono nel glossario.
- **Proposta:** due strade.
  - Anticipare dopo la sez. 4 una vista d'insieme in 4 punti (r. 358–362).
  - Oppure aggiungere al glossario `valida`, `componiVista`, `token` e `request_id`.

**SR2. L'architettura rimanda a P6/P8 invece di dichiarare le route e gli esiti**
- **Dove:** r. 364, 377, 394. Circa 15 rimandi a P1–P15 nel range.
- **Problema:** le route (`/`, `/riepilogo/[token]/pdf`, `/galleria`) e i quattro motivi di "Riprova" stanno solo nella 20.3, 300 righe più avanti.
- **Proposta:** una tabella di 3 righe con le route in 10.1 e i quattro motivi in 10.3. Le sigle P restano solo come etichetta.

**SR3. Le alternative sono trattate in modo asimmetrico**
- **Dove:** sez. 9 (r. 287–348). Confronto con 6.3–6.7 e con 11 (r. 444–446).
- **Problema:** la grafica ha rischio "Alto", eppure non ha un blocco di alternative con i motivi. C'è solo la r. 56, senza motivazioni. Lo stesso vale per Docker (r. 198) e per l'email (r. 58).
- **Proposta:** in 9.1 un blocco "Alternative" con lo schema della sez. 11, con un motivo ciascuno per:
  - generatore a parametri;
  - script FBX;
  - 3D in tempo reale;
  - formato del mockup così com'è.

  Se si accoglie D1, va aggiunto anche il ripiego Blender o SketchUp.

**SR4. Due rischi accettati mancano dalla tabella 20.1**
- **Dove:** r. 61, 347, 397.
- **Problema:** mancano due rischi:
  - la notifica fallita, che non si rimanda (r. 397, 0030);
  - il caricamento dei file dell'Area Pro su un servizio esterno (r. 347).

  Nel range i rischi hanno etichette diverse: "rischio accettato" e "si accetta il rischio".
- **Proposta:** aggiungere le due righe alla 20.1 e usare un marcatore uniforme, "Rischio accettato:".

**SR5. La definizione dei livelli A e B è sepolta in un elenco di limiti**
- **Dove:** 9.2 punto 5 (r. 323–325). Richiamata alle r. 25, 88, 102, 320, 326.
- **Proposta:** creare una sottosezione "9.2 Livelli di resa" con i punti 5–6. La 9.3 "Limiti" tiene gli altri punti. Vanno aggiornati i rimandi.

### Style

**ST1. "Conferma" ha due significati in due passi vicini**
- **Dove:** 10.2 (r. 370, 372).
- **Problema:** al passo 1 è il cliente che conferma l'email. Al passo 3 è la riga che viene scritta nel database.
- **Proposta:** al passo 3 scrivere "e la scrive subito nel database (commit), prima di qualsiasi invio". È lo stesso punto di S6 dello Stage 6.

**ST2. Contraddizione sul contenuto del repository**
- **Dove:** 9.1 (r. 309).
- **Problema:** "Nel repository non c'è uno script delle viste", ma `archivio/` fa parte del repository. Nella stessa frase c'è anche "script di prova provato".
- **Proposta:** "L'applicazione non contiene uno script delle viste. Lo script provato il 2026-11-12 è archiviato in `archivio/script-viste/` e non fa parte della procedura."

**ST3. Prove dichiarate come già fatte (r. 414–415): da contestare**
- **Problema secondo il revisore:** il revisore pensa che la fase 1 non sia ancora avvenuta.
- **Perché va contestato:** il glossario (r. 84) e il calendario (r. 635) dicono che è già fatta. La frase è corretta.

**ST4. Verifica dichiarata come già fatta**
- **Dove:** 14 (r. 516).
- **Problema:** "sono verificati" si riferisce a un'interfaccia che non esiste.
- **Proposta:** "si verificano nei tre controlli fissi elencati sotto".

**ST5. La soglia "mezza giornata" non è definita**
- **Dove:** 9.2 punto 6 (r. 326).
- **Proposta:** "più di 4 ore di lavoro di una persona, misurate come indicato in 9.1". È collegato a S3 dello Stage 6, che chiede se il limite vale per taglio o per prodotto.

**ST6. Il limite di RNF4 è dato come già rispettato, e le stime del tempo sono tre**
- **Dove:** 10.2 passo 5 (r. 374) e 14 (r. 517).
- **Problema:** il tempo di generazione del PDF non è ancora misurato. Il documento dà tre stime diverse: "15 s più PDF", "entro RNF4" e "una ventina di secondi".
- **Proposta:** "RNF4 è rispettato se la generazione resta sotto i 45 secondi (da misurare nella prova della sez. 11)". La r. 517 deve rimandare a questa stima. Il passo 5 va diviso in sotto-punti. È lo stesso punto di S8 dello Stage 6.

**ST7. Un paragrafo con sei argomenti diversi**
- **Dove:** 8.1 (r. 274).
- **Proposta:** spostare la regola dei materiali duplicati nel seed in 8.2. Il resto diventa un elenco con tre voci: nomi delle colonne, significato dei campi, lingua dei nomi.

---

## 🟢 Nit

### Design
- **D6.** Una richiesta con un `request_id` ripetuto per una riga già `sent` o `failed` non ha un esito descritto (r. 377). Va anche detto che `in-corso` arriva solo da chiamate concorrenti fuori dall'interfaccia, perché Next.js esegue in serie le Server Action dello stesso client. È lo stesso punto di S7 dello Stage 6.
- **D7.** Le righe `pending` rimangono bloccate se si riparte con `npm run dev` o `next start` invece che con `npm run demo` (r. 210, 395).
- **D8.** I due portatili possono avere lo stesso `number` di configurazione, e le notifiche arrivano alla stessa casella (r. 244). Proposta: dichiarare il limite, oppure un prefisso per portatile in `.env`.
- **D9.** La 0027 non è allineata con le zone senza materiale introdotte in 9.3 (r. 336). È lo stesso punto di N-b dello Stage 5.
- **D10.** Per gli errori sconosciuti il messaggio dice "server non raggiungibile" (r. 390), e porta a cercare la causa nel posto sbagliato. Anche style lo segnala.
- **D11.** Le indicazioni del tutor su Docker e sull'uso delle immagini non hanno una traccia scritta, con data e contesto, nelle schede (6.3–6.6, 7, 9.4).
- **D12.** Non è detto come si fa il testo alternativo dell'anteprima SVG (r. 514). Proposta: `role="img"` con `aria-label` sul contenitore, e contenuto interno ignorato dai lettori di schermo.
- **D13.** I campi `_` dei file del catalogo vanno in conflitto con la prova "una chiave sconosciuta fa fallire lo schema" (r. 280, §18). Proposta: schema rigido, con le chiavi `_*` tolte prima del controllo.
- **D14.** Il log può contenere l'email del cliente, per esempio negli errori `EENVELOPE` (r. 397, §12). Proposta: stampare solo codice e `id`.

### Structural
- **SR6.** Le sezioni 7, 11 e 12 usano titoletti in grassetto invece degli H3, con punteggiatura incoerente.
- **SR7.** La sezione 2 mette quattro contenuti sotto un solo H2. Proposta: dividerla in 2.1–2.4 (Problema, Obiettivi e non obiettivi, Soluzione, Alternative).
- **SR8.** La tabella delle decisioni usa una notazione incoerente per le sostituzioni parziali (0017, 0019, 0025/0029) e i link alle schede sono mancanti. Il titolo della 0025 contraddice "prodotte in chat": è lo stesso punto di S4 dello Stage 6.
- **SR9.** In 9.1 c'è una lista di cose da fare ("Stato", r. 311–315). Andrebbe spostata nella 20.5.
- **SR10.** La sezione 5 ripete RF5–RF7 senza identificativi.
- **SR11.** Lo storico delle versioni sta nel preambolo (r. 3). È lo stesso punto di ST-N1.
- **SR12.** "Server Actions" (r. 440) e "Server Action" nel resto del documento.

### Style
- **ST-N1.** La r. 3 è un elenco senza verbo. Proposta: "La revisione del 2026-11-12 ha cambiato viste, seed, invio e calendario (sezione 23.1)."
- **ST-N2.** La r. 27 non ha verbo né etichetta. Proposta: "**Soluzione.** Il progetto realizza…".
- **ST-N3.** La frase "il livello B è un ripiego" è ripetuta tre volte (r. 25, 325, 326).
- **ST-N4.** La definizione di "Autore" nel glossario è circolare (r. 85).
- **ST-N5.** "(Elephant Goldfish)" è tra parentesi senza spiegazione (r. 87).
- **ST-N6.** "Sempre valorizzata" (RF1, r. 101). In RNF4 (r. 113) manca da quando si contano i 60 secondi: dal clic su "Ricevi il riepilogo".
- **ST-N7.** "Non regge" è colloquiale (r. 120).
- **ST-N8.** Giudizi soggettivi: "andrebbe benissimo", "Ottimo", "tentante", "Sconsigliato" (r. 165, 177–179).
- **ST-N9.** "Migrazioni dichiarative poco supportate" non si può verificare (r. 164, 179). Va citato il fatto concreto.
- **ST-N10.** Drizzle e Prisma (r. 188, 190): "pesa poco" non è misurato, e "motore separato" va verificato sulle versioni recenti di Prisma.
- **ST-N11.** "Conosciamo" usa la prima persona plurale, mentre il resto del testo è impersonale (r. 183, 190).
- **ST-N12.** Cinque costi di Docker stanno dentro una parentesi (r. 198). Meglio un elenco.
- **ST-N13.** L'avviso su `docker compose down -v` è tra i prerequisiti di Windows (r. 222). Va spostato accanto a `db:reset`.
- **ST-N14.** "In formato ottimizzato" non è verificabile (r. 224). Va indicato il formato e il lato massimo in px.
- **ST-N15.** Problemi in 8.2:
  - ripetizione tra le r. 278 e 279;
  - "il catalogo non si modifica mai a mano" va riferito alle tabelle (r. 281);
  - "senza conflitti" promette troppo (r. 283).
- **ST-N16.** "Senza un tetto fisso" sul peso delle viste (r. 328) non dà un criterio. È collegato a D5.
- **ST-N17.** Altre formulazioni da precisare:
  - r. 390: un messaggio generico per il codice "altro";
  - r. 422: i limiti di Gmail non sono misurati;
  - r. 446: "massima fedeltà";
  - r. 450: i font per "Wengé". Le WinAnsi di PDFKit contengono "é": va verificato o motivato in un altro modo;
  - r. 481–482: "non costa nulla", "si mostra bene";
  - r. 511: "questi flussi";
  - r. 519: "una buona base".

---

## Matrice di tracciabilità

| Voce | Revisore e id originale | Collegata a |
|---|---|---|
| D1 | design-1-1 | Stage 5 R1; Stage 6 S1, S3 |
| D2 | design-1-2 | — |
| D3 | design-1-3 | Stage 5 N-g; Stage 6 S9 |
| D4 | design-1-4 | — |
| D5 | design-1-5 | ST-N16 |
| D6–D14 | design-1-6 … design-1-14 | D6 = Stage 6 S7; D9 = Stage 5 N-b; D10 = ST-N17 |
| SR1–SR5 | structural-1-1 … structural-1-5 | SR3 ↔ D1 |
| SR6–SR12 | structural-1-6 … structural-1-12 | SR8 = Stage 6 S4; SR11 = ST-N1 |
| ST1–ST7 | style-1-M1 … style-1-M7 | ST1 = Stage 6 S6; ST5 ↔ Stage 6 S3; ST6 = Stage 6 S8 |
| ST3 | style-1-M3 | **da contestare** (fase 1 già fatta, r. 84 e 635) |
| ST-N1–ST-N17 | style-1-N1 … style-1-N17 | — |
