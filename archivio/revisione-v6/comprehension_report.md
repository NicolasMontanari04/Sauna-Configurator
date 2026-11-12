## Cosa propone il documento

Il documento propone una demo di tirocinio: un configuratore web per le saune del catalogo effe.it, scritto in Next.js e React. L'applicazione gira sul portatile, mentre solo PostgreSQL gira in Docker; l'ORM è Drizzle. Il cliente sceglie prodotto, taglio, essenza, pedana e optional. Vede un'anteprima SVG generata da parametri da una funzione pura. Per i prodotti che il generatore non copre vede la foto ufficiale con i campioni dei materiali (livello B).

Un unico pulsante, "Ricevi il riepilogo", fa tre cose in sequenza. Prima salva una riga `configuration`, che contiene uno snapshot JSONB e gli stati di invio. Poi invia al cliente un PDF, impaginato con PDFKit con l'immagine convertita da resvg, tramite Nodemailer e Gmail. Infine notifica la casella del progetto. In caso di errore il cliente ha "Riprova" e "Scarica il PDF", entrambi legati a un token casuale.

Il documento fissa anche:
- privacy minima: scadenza a 12 mesi, pulizia all'avvio, cancellazione su richiesta;
- nessun cookie;
- WCAG 2.1 AA sul flusso;
- un piano in 10 fasi per due sviluppatori, che prova per prime le parti incerte;
- i criteri di successo: almeno 3 prodotti, con un obiettivo di 6–8.

## Come funziona il sistema esistente, secondo il documento

Il codice di produzione non esiste ancora. Esistono:
- un mockup HTML/JS, generato come artifact su claude.ai, con 5 prodotti di esempio, venature generate dal codice e dati inventati (appendice B);
- un generatore SVG provato solo su Aladdin 60;
- una bozza dei dati di Aladdin in `data/prodotti/aladdin.json`, con lacune note: ordine delle dimensioni, pedana nel taglio 45, nessun optional e nessuna regola sul sito;
- un registro di decisioni 0001–0020 in `docs-iniziali/`.

Le decisioni P1–P15 sono state chiuse il 2026-11-11. Restano aperte tre domande per il tutor (base giuridica, fonte per optional e regole, uso delle schede dell'Area Pro) e la creazione dell'email del progetto.

Ho potuto parafrasare tutte le sezioni, quindi non ci sono Blocker. Restano però alcuni punti dove le parti del documento non si collegano.

---

# Stage 6, Comprehension Test: configuratore-saune-analisi-v6.md

- **Revisore:** `egm-comprehension`, contesto isolato, ha letto **solo** il documento target (righe 1–832), senza contesto Goldfish.
- **Divisione:** FeatureRange 1..434, DetailedRange 435..831.

> **Nota dell'orchestratore:** tre problemi Major coincidono con quelli dello Stage 5, trovati qui in modo indipendente da un lettore senza contesto:
> - #1 corrisponde ad A in `zoom_out_report.md`;
> - #2 corrisponde a B e C;
> - #6 corrisponde a D.
>
> Lo stesso vale per i Nit #7, #13 e #15. Sono i punti più confermati della revisione finora.

## Findings

### Major

**1. La rigenerazione del PDF dallo snapshot non è coerente con l'immutabilità dichiarata**
- **Righe:** 88, 137, 205, 305, 353 e 206/212–225.
- **Problema:** il documento dice che una configurazione salvata "resta identica anche se il catalogo viene modificato" e che un prodotto tolto dal catalogo non blocca le configurazioni (riga 205). Dice anche che "Scarica il PDF" e "Riprova" rigenerano il PDF "dalla riga salvata".
- Però lo snapshot (righe 212–225) contiene solo codici ed etichette. La geometria, le texture e `material.colore`, che servono a disegnare la vista SVG o la foto con i campioni, vengono dal catalogo corrente.
- Un lettore non sa quindi cosa succede al PDF se il prodotto viene rimosso o la geometria cambia: fallisce, cambia, oppure c'è un ripiego? Le garanzie dichiarate e il meccanismo descritto non si combinano.

**2. Non è chiaro da dove legge il catalogo il configuratore a regime: file o database**
- **Righe:** 231–236, 291–293, 760.
- **Problema:** i file in `data/prodotti/` sono "la fonte". Marko li importa nell'interfaccia "finché il database non è pronto". Le pagine del catalogo vengono dal database.
- Non è detto se, dopo la fase 3, il configuratore e la `valuta` lato server leggono regole e geometria dai file o dal database. Se usano fonti diverse, interfaccia e server potrebbero valutare regole diverse.
- La parola "finché" fa pensare a una sostituzione, ma la sostituzione non viene mai descritta.

**3. Il taglio è modellato in due modi**
- **Righe:** 48, 191, 218, 640, 682.
- **Problema:** il taglio ha una tabella propria, `product_size`, e nello snapshot `size` sta fuori da `selections`. Però P1 (riga 640) elenca `size` tra "i codici dei gruppi", come `wood` e `floor`, e P7 lo tratta come una chiave di gruppo nell'URL.
- Un lettore non capisce se il taglio è anche un `option_group` (con `passo`, default e regole) oppure un'entità separata. La differenza conta per `only_with_size` e per la regola "ogni gruppo `single` è obbligatorio" (riga 654).

**4. Le viste "frontale" e "interna" si confondono**
- **Righe:** 246, 248, 56, 825.
- **Problema:** le viste previste sono esterna, frontale ed eventualmente pianta. La "vista interna" è scartata perché difficile da replicare. Subito dopo, però, si legge che la vista "Interno" del mockup è "la vista frontale interna" ed è la "frontale" di questo documento.
- Il lettore non riesce a dire cosa mostra la frontale: la parete frontale vista da fuori, cioè la sequenza del fronte, o vista da dentro, con panche e stufa? E quindi non capisce cosa sia la vista interna scartata.

**5. La firma della funzione pura di disegno cambia da sezione a sezione**
- **Righe:** 272, 350, 362, 711–713.
- **Problema:** in 9.3 la firma è `(geometria, scelte, vista) → stringa SVG`. In altre sezioni la stessa funzione:
  - incorpora le texture come data URI sul server, mentre nel browser usa i percorsi di `public/`;
  - accetta `flat: true`;
  - riceve il prefisso degli `id` come parametro (P15).
- Non viene mai data un'unica firma, né spiegato come la funzione passa da riferimenti relativi a data URI. Chi scrive il contratto (15.2) dovrebbe ricostruirla da quattro punti diversi.

**6. Non è spiegato come la notifica "non blocca la risposta al cliente"**
- **Righe:** 304, 685.
- **Problema:** il passo 6 dice che il risultato della notifica non blocca la risposta, ma non spiega il meccanismo. In una Server Action la risposta parte di norma dopo che la funzione è terminata.
- Il lettore non sa se la notifica viene eseguita dopo la risposta, e con quale meccanismo, oppure in sequenza con il suo timeout. È proprio il caso di "il sistema lo gestisce" senza dire come.
- Non è detto nemmeno se esiste un modo per ritentare una notifica `fallita`.

### Nit

**7. Riga di tabella fuori posto**
- **Riga:** 831.
- **Problema:** la riga "Nuove sezioni | — | Contesto, glossario, …" appartiene alla tabella della sezione 23, ma sta dopo l'elenco dell'appendice B. È rimasta staccata dalla tabella, che così è incompleta.

**8. "Tutor e tutor"**
- **Riga:** 609.
- **Problema:** la voce non ha senso così com'è scritta. Dalla riga 793 si capisce che era "Tutor e valutatore".

**9. Termini specifici del processo non definiti**
- **Riga:** 3.
- **Problema:** "brainstorm EGM" e `concepts_brief.md` non sono definiti. Sono marginali, ma un lettore nuovo non sa cosa sia EGM.

**10. Il codice P5 compare prima di essere spiegato**
- **Righe:** 199–201 e successive.
- **Problema:** i codici P4 e P5 compaiono dalla riga 199, ma sono spiegati solo in 20.3 (riga 615). Solo la riga 451 indica dove trovarli. Basterebbe un rinvio alla prima occorrenza.

**11. Nome della colonna delle zone e significato di `furn`**
- **Righe:** 193, 227, 274, 640.
- **Problema:** la colonna si chiama "zone interessate" in 8.1 e `option_group.zone` in 9.3.
- Delle zone elencate in P1 (`ext`, `int`, `furn`, `floor`, più `mirror` e `frame`) non si spiega `furn`. Non si spiega neanche come le zone fisse ricevono il materiale, visto che non appartengono a nessun gruppo.

**12. `option_rule` lascia aperte origine, destinazione e prodotto**
- **Riga:** 195.
- **Problema:** non è detto a quali entità puntano "origine" e "destinazione": valori di opzione, gruppi o tagli. La tabella non ha nemmeno una colonna prodotto.
- P2 chiarisce la semantica, ma non lo schema. Non si spiega neppure perché `valuta` applica le regole proprio nell'ordine `only_with_size`, `excludes`, `requires` (riga 655).

**13. `npm run demo` esegue `next start` prima del controllo**
- **Riga:** 173.
- **Problema:** `next start` è un processo che non termina, quindi un controllo eseguito "in ordine" dopo di lui non partirebbe. Non è chiaro come sono composti i comandi.

**14. Criterio 1 "senza passaggi manuali"**
- **Righe:** 498, 178.
- **Problema:** il criterio richiede comunque di copiare `.env` a mano e di avviare Docker Desktop. Va precisato cosa conta come passaggio manuale.

**15. "Il modulo funziona anche senza JavaScript"**
- **Righe:** 685, 201, 307.
- **Problema:** il `request_id`, che protegge dai doppi invii, è generato dal client. Senza JavaScript non esiste, e non è detto cosa succede in quel caso.

**16. Variabile di `/galleria` senza nome**
- **Righe:** 538, 680.
- **Problema:** la demo gira con `next build` e `next start`, cioè in produzione, ma la galleria è "materiale di riserva per la demo". Si attiva solo con "una variabile dedicata", che non viene nominata.

**17. Rinvio errato su "Riprova"**
- **Riga:** 769.
- **Problema:** la sezione 23 dice "pulsante disattivato durante l'invio (10.3)", ma la 10.3 non lo dice. La disattivazione è descritta solo per il pulsante principale, al passo 1 della 10.2 (riga 299).

**18. Prodotti citati senza presentazione**
- **Righe:** 658, 816.
- **Problema:** "Sky" e "Sky 30" compaiono in P3 e nell'appendice A. Si capisce solo dall'appendice B (riga 826) che sono prodotti del mockup e del sito.

**19. Il tutor "valuta la demo", ma "non c'è un voto"**
- **Righe:** 10, 60.
- **Problema:** la tensione è lieve, ma un lettore si chiede cosa valuti il tutor e con quale esito.

**20. `numero` è salvato o calcolato?**
- **Righe:** 199, 669.
- **Problema:** il valore deriva dall'`id` ed è elencato tra i campi della riga. Non è detto se è una colonna generata, viene scritto con un update dopo l'insert o si calcola solo in lettura.

## Esito

Comprensione sufficiente, ma con lacune Major. I termini sono quasi tutti definiti e il glossario è efficace. I problemi stanno nei collegamenti tra le parti:
- lo snapshot e la rigenerazione del PDF;
- file e database come fonte del catalogo;
- il taglio come gruppo o come tabella;
- frontale e interna;
- la firma della funzione di disegno;
- l'invio non bloccante della notifica.

Va chiarito tutto questo prima che il contratto condiviso (15.2) venga fissato.
