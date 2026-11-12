# Stage 8: Intermediate Zoom Out Review

- **Documento:** `configuratore-saune-analisi-v6.md` (righe 1..892, dopo le correzioni degli Stage 6 e 7)
- **Riferimento:** `zoom_out_report.md` (Stage 5)
- **Contesto Goldfish:** `docs-iniziali/docs/decisioni/` (README, 0001-0020), `data/prodotti/aladdin.json`
- **Revisore:** `egm-zoom-out`, contesto isolato. Stato: completed.

**Verdetto: da rivedere.** Nessun Blocker. Restano 4 problemi Major:
- 2 sono ancora aperti dallo Stage 5;
- 1 è peggiorato dopo le correzioni;
- 1 è nuovo e nasce dalle correzioni.

Ci sono poi 7 Nit.

## Errori miei nelle correzioni dello Stage 7

Due errori che il revisore ha trovato sono miei, introdotti quando ho applicato le correzioni:
- **`request_id`:** ho cambiato "generato dal client" in "generato dal server" nelle sezioni 8.1 e 10.2. Non l'ho cambiato nella tabella di P4 (riga 683), nel dettaglio di P4 (riga 728) né nel corpo della scheda 0017.
- **Controllo preliminare:** ho scritto "le prime tre voci sono bloccanti, le ultime tre sono avvisi", ma le voci sono cinque. Inoltre la voce "presenza delle texture" non è classificata alla riga 203.

## Stato dei finding dello Stage 5

| # | Tema | Stato |
|---|---|---|
| A | Snapshot e PDF rigenerato | **Risolto** (righe 113, 403, 659) |
| B | Catalogo in due posti, tabelle diverse dal JSON | **Risolto in parte**. Resta un Nit (N-B) |
| C | Seed "mai cancellare", sorgente delle regole | **Risolto** (righe 265-268, 331), ma il seed è più complesso del necessario (N-C) |
| D | Posta in uscita senza nessuno che la svuoti | **Risolto**, ma con mitigazioni sovradimensionate e scritte come codice (M-D) |
| E | Schema della geometria nel contratto prima del censimento | **Aperto** |
| F | Motore delle regole completo senza nessuna regola reale | **Aperto** |
| G | Livello intermedio "SVG con zone nominate" | **Aperto**. Va dichiarato escluso o indicato come ripiego, non lasciato in sospeso |
| H | La 20.3 duplica le schede e scende nel dettaglio | **Peggiorato** |
| N1 | `request_id` e funzionamento senza JavaScript | Risolto nel testo principale, **ma ora incoerente** (M-H) |
| N2 | Ordine di `npm run demo` | **Risolto** (righe 198-205) |
| N3 | Filtro sulle righe scadute | Aperto (riga 433) |
| N4 | GIN e "indicizzabile" usati come argomento | Aperto (righe 152, 161, 168-169; scheda 0001) |
| N5 | Memoizzazione non misurata | Aperto (riga 311) |
| N6 | Troppe colonne di stato | **Superato**: tentativi e data ora servono al limite di "Riprova" |
| N7 | Problemi redazionali | In parte aperto: la riga 892 è ancora fuori dalla tabella; la scheda 0007 dice ancora "valutatore" |
| N8 | Texture ripetibili con specchiatura | Aperto (riga 768) |

---

## Major

### M-E. Lo schema della geometria è fissato nel contratto prima delle prove (Stage 5 M3, aperto)
- **Righe:** 296, 501, 505-506, 536-537; scheda 0016.
- **Problema:** non è cambiato nulla. L'astrazione più instabile del progetto viene fissata una fase prima del censimento e del secondo prodotto, e l'unico dato reale è `geometry: null`. In più la PR "di circa 3 ore" ora deve contenere anche i controlli strutturali di `valuta`.
- **Proposta:** togliere la geometria dal contratto iniziale. È già JSONB, quindi non tocca lo schema del database né il blocco della fase 4. La geometria resta a M fino al secondo prodotto, e lo schema Zod della geometria si fissa alla fine della fase 3.

### M-F. Motore delle regole completo senza regole reali (Stage 5 M4, aperto)
- **Righe:** 72, 227, 561, 701, 705-716, 723, 743; schede 0018 e 0020.
- **Problema:** il sito non indica né optional né regole (righe 871-872). Ciononostante il motore è diventato un criterio di successo obbligatorio: "le prove automatiche coprono i tre tipi di regola", alla riga 561. P1-P15 sono "definitive" (riga 676), quindi è più difficile tornare indietro.
- **Proposta:**
  - il criterio 3 e le prove si limitano a `only_with_size` e ai gruppi `single`;
  - `requires`, `excludes` e `multi` restano nella semantica della 0020 come estensioni future, senza implementazione né prove finché una fonte non li documenta;
  - `valuta(config, prodotto)` resta il punto di estensione.

### M-H. Le decisioni sono scritte in tre posti e ora si contraddicono (Stage 5 M5, peggiorato)
- **Righe:** sezione 20.3 (674-777); schede 0016, 0017 e 0018 con le note datate; README del registro, riga 3.
- **Contraddizioni concrete:**
  - **`request_id`:** "server" alle righe 233 e 351 e nella nota della 0019; "client" alle righe 683 e 728 e nel corpo della 0017.
  - **0017:** il corpo usa ancora `in_attesa` e dice che la notifica "non blocca"; la nota dice `pending` e "si attende".
  - **0016:** il corpo dice "esterna e frontale (nel mockup 'Interno')"; la nota lo smentisce.
  - **0018:** il corpo dice "upsert, mai cancellazione totale" e "l'interfaccia importa gli stessi file". La nota cambia il comportamento del seed e la sorgente di lettura, ma dichiara che "la scelta non cambia". Il README chiede una nuova scheda quando la scelta cambia.
- **Proposta:**
  - ridurre la 20.3 alla tabella riassuntiva (righe 678-694) con i link alle schede, e spostare il dettaglio di P1-P15 solo nelle schede;
  - per 0016 e 0017, riscrivere il corpo invece di aggiungere note che lo contraddicono;
  - per 0018, una nuova scheda che la sostituisce;
  - correggere subito le righe 683 e 728.

### M-D (nuovo). Le mitigazioni dell'invio sono ridondanti e scritte come codice
- **Righe:** 201, 204, 347, 351, 358-359; nota della 0017.
- **Ridondanza:** la riga `pending` con più di 2 minuti è gestita in tre punti: la pagina di conferma, la condizione nell'`UPDATE` di "Riprova" e il passo 3 di `npm run demo`. Ne basta uno.
- **Pausa di 30 secondi:** il passaggio atomico da `failed` a `pending` impedisce già il doppio invio. La pausa aggiunge un caso, "pulsante visibile ma inattivo", che l'interfaccia non descrive.
- **Altitudine:** l'SQL completo, i nomi dei timeout di Nodemailer e `ON CONFLICT` sono dettagli di implementazione. Nell'analisi basta la regola: aggiornamento atomico, massimo 3 tentativi, scadenza totale di 15 secondi per invio. Il resto va in `docs/architettura.md` o nel codice.
- **Proposta:**
  - una sola regola per le righe `pending` scadute;
  - togliere la pausa di 30 secondi;
  - descrivere il comportamento a parole, in 3-4 righe.

---

## Nit

- **N-B. Il caricatore che ricostruisce `prodotto` dal database non compare da nessuna parte** (righe 265-270, 331, 505-511, 821).
  - Il server deve ricomporre `prodotto` da sei tabelle più materiali, zone fisse e foto, ma questo componente non è né nel contratto né tra le responsabilità.
  - Alla riga 821, "coerenza con le configurazioni salvate" non è un motivo valido, perché non ci sono chiavi esterne.
  - Manca tra le alternative una colonna `data` JSONB con il file già validato.
  - **Proposta:** aggiungere il caricatore al contratto, con il tipo di ritorno uguale al tipo del file Zod, e correggere la riga 821.
- **N-C. Il seed sincronizzato è più complesso del necessario** (righe 268, 377).
  - Cancellare tutto il catalogo e reinserirlo in una transazione dà lo stesso risultato, senza un ordine di cancellazione da documentare.
  - Il controllo "numero di prodotti uguale al numero di file" verifica una cosa che il seed in transazione garantisce già.
  - **Proposta:** sostituzione completa in transazione; il controllo diventa "almeno un prodotto".
- **N-1. Il conteggio delle voci del controllo è sbagliato** (righe 203, 377): le voci sono cinque e la voce sulle texture non è classificata. È un errore mio, vedi sopra.
- **N-2. "Cambiato" non si può rilevare** (riga 403). **Proposta:** scrivere "rimosso o non più valido".
- **N-3. `/galleria` nella demo** (riga 741): la demo gira in `production`. Va detto se la galleria si attiva con una variabile, altrimenti non può fare da "materiale di riserva" come dice la riga 594.
- **N-4. Finding dello Stage 5 ancora aperti senza cambiamenti:**
  - N3: riga 433;
  - N4: righe 152, 161, 168-169;
  - N5: riga 311;
  - N8: riga 768;
  - N7: riga 892 e scheda 0007.
- **N-5. "Funziona senza JavaScript" come motivo** (righe 233, 746; scheda 0019). Il configuratore richiede comunque JavaScript. **Proposta:** motivare la Server Action con la validazione condivisa.

---

## Da non toccare

Il revisore conferma come corrette queste scelte:
- l'immagine si ridisegna dal catalogo attuale e, se le scelte non si risolvono, il PDF contiene solo l'elenco, con una prova automatica (righe 113, 403);
- la notifica si attende entro il limite di RNF4, che è più semplice di `after()`;
- il blocco dell'unico account Gmail è un rischio accettato;
- applicazione e database ascoltano su `127.0.0.1`;
- la sequenza di `npm run demo` separa i passi bloccanti dagli avvisi.

## Sintesi per decidere

Lo Stage 8 non prevede una risoluzione automatica. Le opzioni sono due:
- **correggere prima di passare allo Stage 9:** "Aggiorno io il doc";
- **procedere:** i Major restano trade-off dichiarati.

Correzioni consigliate prima dello Stage 9, in ordine di costo:
1. Righe 683 e 728 (`request_id`) e conteggio del controllo preliminare: correzioni meccaniche, errori miei.
2. M-D: semplificare le mitigazioni dell'invio, che riguardano la sezione 10.3 e la scheda 0017.
3. M-H: riscrivere il corpo delle schede 0016 e 0017 e creare una nuova scheda al posto della 0018.
4. M-E e M-F: decisioni di perimetro (geometria fuori dal contratto, motore delle regole ridotto). Spettano a te e a Marko.
