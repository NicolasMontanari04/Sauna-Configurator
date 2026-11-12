## Cosa propone il documento

Due tirocinanti devono costruire entro il 26 novembre 2026 un configuratore web in Next.js per le saune del catalogo effe.it. Serve solo per una demo locale.

Il cliente sceglie prodotto, taglio (cioè la misura) e materiali. Vede un'anteprima SVG in quattro viste: Esterno, Frontale, Pianta e Materiali. Il colore e la texture di ogni zona cambiano in tempo reale.

Le viste sono disegni SVG già pronti, uno per taglio. Si ricavano dai file 3D e 2D dell'"Area Pro" del produttore e seguono un formato fisso: ogni path ha una zona e un livello d'ombra. Dove le viste mancano, si mostra la foto ufficiale con i campioni dei materiali. Questo ripiego è il livello B.

Un solo pulsante, "Ricevi il riepilogo", fa tre cose:
- salva la configurazione in PostgreSQL, che gira in Docker;
- invia al cliente un PDF fatto con PDFKit e resvg;
- manda una notifica al progetto.

Le email partono con Nodemailer e Gmail, in parallelo. Ognuna ha una scadenza di 15 secondi, e "Riprova" permette fino a 3 tentativi.

Il catalogo sta in file JSON validati con Zod, e un seed svuota e ricarica le tabelle del catalogo. Non ci sono regole di compatibilità né optional.

## Come funziona oggi il sistema, secondo il documento

Il codice dell'applicazione non esiste ancora. Il lavoro parte dal via libera del tutor. Oggi esistono quattro cose:
- il sito effe.it, con una foto per versione. Per Yoku S non ci sono foto dei due legni esterni;
- un mockup HTML in `docs/mockup/`, con l'interfaccia di riferimento e viste curate solo per Aladdin 60. Le viste usano classi e variabili CSS che resvg non supporta, quindi vanno convertite;
- una bozza di `data/prodotti/aladdin.json`;
- il registro delle decisioni, con le schede 0001–0030.

La fase 1 è fatta:
- account Gmail e invii di prova;
- Docker con il solo database su entrambi i portatili;
- una prova di uno script delle viste, poi abbandonato.

---

# Stage 6: Comprehension Test, round 2 (riesame)

- **Documento:** `configuratore-saune-analisi-v7.md` (righe 1..1134). Il revisore ha letto solo il documento, senza file collegati e senza standard.
- **Intervalli:** FeatureRange 1..526, DetailedRange 527..1134
- **Revisore:** `egm-comprehension`, in un nuovo contesto isolato. Il report del round 1 non gli è stato passato.
- **Round 1:** `archivio/revisione-v7/comprehension_report-round1.md`
- **Limite dei riesami:** questo è l'unico riesame ammesso per lo Stage 6.

**Esito:** si può riassumere tutto il documento, quindi non ci sono Blocker. Ci sono 3 Major e 9 Nit. Il punto più debole resta la "chat" (S1): chi legge capisce cosa si costruisce, ma non come si ottengono le viste dei prodotti dopo Aladdin 60.

## Stato dei risultati del round 1

Il revisore non ha visto il round 1. Questo confronto l'ho fatto io, cercando nel testo attuale.

| Voce del round 1 | Stato | Verifica |
|---|---|---|
| C1 Cos'è la "chat" | **aperto** | Il glossario (r. 80) e la 9.1 (r. 293, 304) dicono come si usa la chat, non cos'è. La 9.4 (r. 347) dice ancora "un servizio esterno". Il revisore lo segnala di nuovo come S1. |
| C2 Viste del mockup | risolto | L'appendice B (r. 1114) ora spiega che per Aladdin 60 la seconda vista è la Frontale. |
| C3 Proporzioni delle viste riusate | non segnalato di nuovo | Il revisore non lo riporta. Non ho controllato se il testo della 9.1 è cambiato. |
| C4 Storico: 3 tentativi per la notifica | risolto | La frase non è più nel documento. |
| C5–C14 (Nit) | per lo più non segnalati di nuovo | C10, la variante di Yoku S, torna come S9. C14, la corrispondenza P1–P15, torna come S12. |

## 🟡 Major

### S1. "In chat": non si capisce chi o che cosa produce le viste
- **Dove:** glossario r. 80; 9.1 r. 293 e 303–309; 9.4 r. 347; 21 r. 960; appendice B r. 1115.
- **Cosa manca:** tutta la grafica si basa sulle viste "prodotte in chat", ma il documento non dice mai cos'è la chat. Non dice:
  - quale servizio o strumento sia;
  - se sia un assistente di intelligenza artificiale;
  - chi ottiene l'SVG, e come, partendo da un FBX, DWG o SKP.

  La 9.4 parla solo di "un servizio esterno". La sez. 21 esclude le "funzioni di IA nell'applicazione", e così lascia solo intuire che la chat sia un'IA.
- **Perché ci si blocca:** chi legge non sa giudicare se il metodo è fattibile né se si può ripetere.
  - Come si ottiene una prospettiva a tre quarti con 6 livelli d'ombra da un DWG 2D? Yoku S 80 ha solo file 2D.
  - Perché è stato scartato lo script (scheda 0029)?
  - Su cosa poggia la stima della "mezza giornata per taglio"?
- **Proposta:**
  - Una frase nel glossario e nella 9.1, per esempio "chat = [nome dello strumento], un assistente di IA a cui si carica il file e si chiede l'SVG".
  - Indicare quali formati di partenza bastano per ciascuna vista: per esempio, un file 2D basta per la Pianta ma non per l'Esterno?
  - Dire chi controlla il risultato.

### S2. Il calendario non spiega come si assorbe un ritardo
- **Dove:** 15.5 r. 631, 640, 646–654; sez. 16 criterio 2.
- **Cosa non torna:** ogni giorno di ritardo si toglie dalla fase 6 "applicando i tagli nel loro ordine". Però:
  - il primo taglio riguarda i "prodotti oltre i tre minimi", che nella fase 6 non ci sono;
  - il quarto taglio, le prove Playwright, non appartiene alla fase 6;
  - con 2 giorni di ritardo la fase 6 sparisce, e Yoku S, che è obbligatorio, non entra.
- **Perché ci si blocca:** non si capisce cosa si fa davvero con 1 o 2 giorni in meno.
- **Proposta:** una tabella "ritardo di 1 giorno → si fa X, si toglie Y; ritardo di 2 giorni → …", oppure legare ogni taglio al giorno che fa risparmiare.
- **Collegamento:** conferma R1 e R3 dello Stage 5, che restano aperti.

### S3. La regola della mezza giornata è ambigua tra taglio e prodotto
- **Dove:** 9.2 punti 2, 4 e 6 (r. 320, 322, 326).
- **Cosa non torna:**
  - il punto 6 dice che, se un taglio richiede più di mezza giornata, il prodotto passa al livello B;
  - i punti 2 e 4 dicono invece che un taglio senza file riusa le viste di un altro taglio oppure resta fuori.
- **Perché ci si blocca:** se Aladdin 45 è lento, non si sa se tutto Aladdin scende al livello B, compreso il 60 che è già pronto, o se basta escludere il 45. La risposta incide sul criterio 2.
- **Proposta:** scrivere in modo esplicito: "si esclude il taglio; il prodotto passa al livello B solo se non resta nessun taglio con viste". Oppure il contrario, se è quella l'intenzione.

## 🟢 Nit

- **S4. Il titolo della scheda 0025 contraddice il testo.** Compare in sez. 19 (r. 780) e 23.1 (r. 998). Il titolo dice "generate da uno script a partire dal modello 3D", mentre la 9.1 (r. 309) dice che nel repository non c'è nessuno script. Proposta: aggiungere nella colonna Stato "(il metodo dello script è sostituito da 0029)".
- **S5. Il terzo prodotto non ha un nome.** Compare in 15.5 (r. 646) e nel criterio 2. Si parla di "un prodotto con la foto ufficiale" senza dire quale. Proposta: un candidato, oppure il criterio per sceglierlo.
- **S6. "La conferma subito" non è chiaro.** 10.2 passo 3 (r. 372): può voler dire il commit della transazione o un messaggio al cliente. Proposta: "e la salva subito (commit), prima di qualsiasi invio".
- **S7. Manca l'esito di una richiesta doppia già conclusa.** 10.2 r. 377 e P8 r. 888 descrivono solo il caso `pending` → `in-corso`. Se la riga è già `sent` o `failed`, non si dice cosa restituisce `inviaRiepilogo`. Proposta: aggiungere "altrimenti restituisce l'esito già registrato nella riga".
- **S8. Due tempi di attesa diversi.** La sez. 14 (r. 517) dice "una ventina di secondi", la 10.2 (r. 374) dice "circa 15 secondi più il PDF". Proposta: usare la stessa formulazione.
- **S9. "Variante" non è nel glossario.** Il termine compare solo dentro la voce "Versione" (r. 72), mentre la 9.2 punto 3 e l'appendice A.2 lo usano. Proposta: una voce "Variante: forma alternativa dello stesso taglio (Door, Glass, Shelf); se ne inserisce una sola per prodotto".
- **S10. Colonna `source` non spiegata.** 8.1 (r. 234): la colonna JSONB `source` di `product` non è spiegata da nessuna parte. Proposta: mezza riga di spiegazione.
- **S11. Non si sa se il contratto attuale è approvato da entrambi.** 20.2 (r. 818) dice "confermato da Marko l'11, superato il 12". Non si capisce se la versione attuale, con il nuovo formato delle viste, è approvata. Proposta: dichiarare se è confermata o da riconfermare nella PR della fase 2.
- **S12. Troppi rimandi incrociati.** Soprattutto in sez. 2, 19 e 20.3. La sez. 19 dice che le schede 0016–0020 registrano P1–P15, mentre la tabella P le collega alle schede 0017–0030. Proposta: togliere quella frase dalla sez. 19, perché la tabella della 20.3 dà già la corrispondenza giusta.

## Collegamenti con gli altri stadi

| Stage 6 (round 2) | Collegato a |
|---|---|
| S1 | C1 del round 1, ancora aperto |
| S2 | R1 e R3 dello Stage 5 |
| S3 | R1 dello Stage 5 (Aladdin 45 in fase 2) |
| S9 | C10 del round 1 e N-g dello Stage 5 |
| S12 | C14 del round 1 e N1 dello Stage 5 |
