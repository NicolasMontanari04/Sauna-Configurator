## Cosa propone il documento

Due sviluppatori devono costruire entro il 26 novembre 2026 una demo di tirocinio: un configuratore web per le saune del catalogo effe.it. È fatto in Next.js e React, su una sola pagina a passaggi.

Il cliente sceglie prodotto, taglio e materiali e vede un'anteprima SVG in quattro viste: Esterno, Frontale, Pianta e Materiali. Le viste sono disegni già pronti per ogni taglio, e l'applicazione cambia solo colori e texture. Se le viste mancano, si usa la foto ufficiale con i campioni dei materiali. Questo ripiego è il livello B.

Un solo pulsante salva la configurazione in PostgreSQL, che gira in Docker e si usa con Drizzle. Poi manda in parallelo, via Nodemailer e Gmail, due email:
- il PDF di riepilogo al cliente;
- una notifica al progetto.

Ogni invio ha una scadenza di 15 secondi. Il cliente può usare "Riprova" fino a 3 volte, e "Scarica il PDF" è sempre disponibile.

Le viste si producono "in chat" partendo dai file 3D e 2D dell'Area Pro del produttore. Il formato SVG è fissato da un contratto condiviso. Il catalogo sta in file JSON che un seed carica nel database. Non ci sono regole di compatibilità né optional.

## Come funziona il sistema esistente, secondo il documento

Oggi il sito effe.it mostra una foto per ogni versione. Le scelte che non cambiano versione, come i due legni esterni di Yoku S, non hanno una foto, e il cliente non ha un riepilogo da conservare.

Esistono già:
- un mockup in HTML e JS con l'interfaccia di riferimento e le viste SVG di Aladdin 60. Le viste però usano classi CSS e `color-mix()`, che resvg non supporta;
- una bozza del file `aladdin.json`;
- un registro di 30 schede di decisione.

La fase 1, cioè le prove di Gmail e Docker, risulta fatta. Manca ancora il via libera del tutor, da cui parte il calendario.

---

# Stage 6: Comprehension Test

- **Documento:** `configuratore-saune-analisi-v7.md` (righe 1..1130). Il revisore ha letto solo il documento, senza file collegati e senza standard.
- **Intervalli:** FeatureRange 1..522, DetailedRange 523..1130
- **Revisore:** `egm-comprehension`, in un contesto isolato
- **Revisione della v6:** `archivio/revisione-v6/comprehension_report.md`

**Esito:** il documento si capisce quasi tutto da solo. Non ci sono Blocker; ci sono 4 Major e 10 Nit.

Il revisore trova definiti, nel glossario o nel testo:
- i termini di progetto: zona, vista, snapshot, seed, contratto, scheletro, fasi;
- il flusso di invio con gli stati;
- "Riprova", `request_id` e `token`;
- il formato delle viste e le prove.

## 🟡 Major

### C1. Non si dice cos'è la "chat"
- **Dove:** sez. 3 (r. 80), 9.1 (r. 289–305), 9.4 (r. 343), 21 (r. 953), 25 (r. 1111).
- **Cosa manca:** "produzione delle viste in chat" è la tecnica centrale della grafica. Il documento però non dice mai quale servizio sia, chi lo usa né che tipo di strumento è. La 9.4 dice solo "un servizio esterno".
- **Perché il lettore si blocca:**
  - Il lettore intuisce che sia un assistente di intelligenza artificiale, ma la sez. 2 e la sez. 21 escludono le "funzioni di intelligenza artificiale". Non può quindi capire se c'è una contraddizione.
  - Non può valutare la regola della "mezza giornata per taglio" né la ripetibilità della procedura, perché la stessa richiesta può dare risultati diversi.
  - Non sa se la chat legge file DWG, SKP e FBX.
  - Non sa da quale file sono nate le viste di Aladdin 60.
- **Suggerimento:**
  - Definire "chat" nel glossario, con il nome del servizio e il tipo di strumento.
  - Nella sez. 21 precisare che l'esclusione riguarda le funzioni dell'applicazione, non gli strumenti usati per produrre i file.
  - Nella 9.1 indicare il file di origine delle viste di Aladdin 60.

### C2. Quali viste ci sono già nel mockup
- **Dove:** appendice B (r. 1110–1111), 9.1 (r. 291 e "Stato", r. 307), 23.1 (r. 996).
- **Cosa non torna:**
  - la r. 1110 dice "Esterno, Interno, Pianta e un pannello Materiali";
  - la r. 1111 dice che per Aladdin 60 sono pronte "Esterno, Frontale e Pianta";
  - la 9.1 parla di "quattro viste, come il mockup", con la Frontale.
- **Perché il lettore si blocca:** non si capisce se la Frontale di Aladdin 60 esiste già o va prodotta. Conta per la fase 2 e per la prova del PDF, che usa Esterno e Frontale.
- **Suggerimento:** elencare con precisione le viste del mockup e i prodotti a cui si riferiscono. Se la Frontale manca, aggiungerla ai "Restano da fare" della 9.1.

### C3. Proporzioni delle viste riusate tra tagli
- **Dove:** 9.1 (r. 287) e 9.2 punto 4 (r. 318).
- **Cosa non torna:** il criterio di accettazione chiede che forma e proporzioni corrispondano alla foto ufficiale. Il riuso tra tagli ammette invece che "le proporzioni del disegno possono cambiare".
- **Perché il lettore si blocca:** non sa se una vista riusata supera il controllo in `/galleria`, né se la nota "illustrazione del taglio …" basta come deroga.
- **Suggerimento:** scrivere in 9.1 che per i tagli con `viewsFrom` si confronta solo la forma, e che la nota visibile sostituisce il controllo delle proporzioni. È collegato alla proposta N-f dello Stage 5, la scala sugli assi.

### C4. Lo storico dice che la notifica ha 3 tentativi
- **Dove:** 23.1, prima tabella, riga "Stati pending all'avvio" (r. 1008).
- **Cosa non torna:** la riga dice "limite di 3 tentativi anche per la notifica", mentre le sez. 10.3 e 21 dicono che la notifica non si rimanda. La seconda tabella lo corregge solo in modo indiretto.
- **Perché il lettore si blocca:** chi legge le modifiche per capire lo stato attuale trova due regole opposte.
- **Suggerimento:** correggere la riga, oppure segnarla come "(superato: vedi sotto)". È lo stesso punto di N-a dello Stage 5.

## 🟢 Nit

- **C5. Sigle non spiegate (r. 3).** "EGM", "zoom-out e catalyst" e "revisione EGM" non sono spiegati. Basta una mezza frase sul metodo di revisione.
- **C6. "L'autore" non è definito.** Compare nelle sez. 9.4, 20.2, 22, A.1 e A.2. Il documento è scritto da due persone, e "l'autore" prende decisioni. Va detto chi è, nel glossario o nella sez. 1.
- **C7. "Via libera del tutor".** Compare nelle sez. 1, 15.5 e 20.5. Non si dice su cosa il tutor debba dare il via libera, per esempio sull'approvazione di questo documento.
- **C8. "Rete della sede".** Compare nelle sez. 10.5, 10.6, 15.5 e 20.1. Non si sa se la sede sia l'azienda, l'università o il luogo della demo. Va definita nel glossario.
- **C9. Conteggio dei giorni (15.5, r. 627, 640).** Non è chiaro se il 26 novembre, giorno della consegna e della demo, rientri negli 11 giorni. Con un giorno in meno, il tetto della fase 6 cambia.
- **C10. La variante di Yoku S (sez. 3, r. 72, e A.2).** La variante (Door, Glass, Shelf) non è un gruppo, e ne entra una sola. Non si dice dove il cliente vede quale variante sta configurando, né nell'interfaccia né nel PDF.
- **C11. Livelli A/B e `viewer` (8.1, 9.2).** La corrispondenza va scritta nel glossario: livello A = `viewer: "svg"`, livello B = `viewer: "image"`.
- **C12. Fase 3 citata due volte (8.2, r. 275).** "Fino allo scheletro (fase 3) … dalla fase 3 …" mette la fase 3 sia prima sia dopo il cambio. Meglio scrivere "fino a metà della fase 3" e "dalla fine della fase 3".
- **C13. Nomi storici e tipi non definiti.** Compaiono in 20.2 (r. 814), 23.1 (r. 1016), 15.1 (r. 549) e P8 (r. 891).
  - `Geometria`, le zone `furn` e `frame` e `data-rot` vengono dalla versione precedente e non sono spiegati.
  - `ProdottoFile` e `Prodotto` sono usati senza dire cosa contengono.

  Suggerimento: una nota tra parentesi per i nomi storici e una riga nella 15.2 sui due tipi.
- **C14. Dove stanno oggi P1–P15 (20.3, r. 822).** Il paragrafo sulla storia delle decisioni è difficile da seguire. Per esempio, P12–P15 risultano nella scheda 0016, che però è sostituita dalla 0025. Meglio una colonna "Scheda attuale" nella tabella al posto della storia in prosa.

## Collegamenti con lo Stage 5

| Comprehension | Stage 5 (round 2) |
|---|---|
| C3 | N-f (scala sugli assi) |
| C4 | N-a (storico in contrasto con la 0030) |
| C14 | N1 (contenuti ripetuti in 20.3) |
| C10 | N-g (una sola variante per Yoku S) |
