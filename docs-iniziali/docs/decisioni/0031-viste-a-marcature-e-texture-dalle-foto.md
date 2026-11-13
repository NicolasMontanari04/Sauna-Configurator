# 0031. Viste a marcature dai pacchetti prodotti in chat, texture dalle foto, primi prodotti Air, Air Corner, Aladdin e Cabanon

- **Stato:** Accettata
- **Sostituisce:** in parte la [0029](./0029-viste-prodotte-in-chat.md) (formato delle viste, zone, nomi delle viste, `docs/viste.md` come unica traccia, nessuno script nel repository) e in parte la [0025](./0025-viste-pronte-da-modello-3d.md) (la vista Frontale diventa Interno, la vista Interno 3D di Cabanon, le viste del PDF). Restano validi: viste SVG pronte per taglio, prodotte in chat dai file dell'Area Pro; composizione con una funzione pura usata da browser e server; livello di resa per prodotto; foto ufficiale come ripiego; autorizzazione del tutor a caricare i file in chat.

## Contesto
La 0029 prevedeva viste in un formato di soli `<path>` con `data-zone` e `data-shade`, colorate da `componiVista` con i colori del catalogo e la texture fusa in moltiplicazione, e Yoku S come prodotto che mostra le combinazioni senza foto.

Il 2026-11-13 le viste sono state prodotte davvero, in chat, dai DWG dell'Area Pro: Air (Air 80), Air Corner (Air 80 Corner), Aladdin 45 e 60, Cabanon Garden con e senza deck. La chat ha consegnato per ogni prodotto un pacchetto con un SVG per ogni combinazione (114 file, 31,7 MB). Gli SVG hanno già ombre, bordi e pattern in prospettiva, cioè la resa voluta, ma non il formato della 0029: tradurli a zone e livelli d'ombra avrebbe voluto dire rifarli. Yoku S è stato messo da parte dall'autore: si inserisce solo se avanza tempo.

## Decisione
- **Prodotti di partenza:** Air, Air Corner, Aladdin e Cabanon, tutti al livello A. Yoku S è lavoro futuro.
- **Viste:** Esterno (`ext`, isometrico), Interno (`int`, la parete frontale vista di fronte, con l'interno visibile dal vetro: è la vecchia Frontale), Pianta (`plan`), più il pannello Materiali. Solo Cabanon ha anche **Interno 3D** (`int3d`): l'esterno senza le pareti frontali, la porta e il tetto della sauna, come lo schema dei materiali di effe.it. Gli altri prodotti restano come sono.
- **Formato a marcature.** Un SVG base per taglio e vista, già con forme, colori e ombre. Ciò che cambia con le scelte è marcato, un elemento per riga: `data-se` (presenza), `data-per-<attributo>` (valore che dipende dalla scelta), `data-materiale` su `<pattern>` (texture dell'opzione scelta) o su `<linearGradient>` (colori dell'opzione), `data-texture` (texture fissa). Il formato è descritto in `data/viste/README.md`, che diventa `docs/viste.md`.
- **Manifest per prodotto** (`manifest.json`, `schemaVersion: 2`): gruppi di scelte con le opzioni e la loro `texture` o i loro `gradienti`, tagli con la cartella delle viste (`viste`, `riusaDa`), viste e file con le misure del `viewBox`.
- **Codici uguali.** I codici dei gruppi e dei valori nel catalogo (`data/prodotti/`) sono gli `id` del manifest. Il manifest è la fonte di texture e gradienti; il catalogo tiene etichette, misure, testi e foto. Escono dal catalogo `zones`, `fixedZones`, colore e texture dei materiali, e la funzione `materialiPerZona`.
- **Texture dalle foto di effe.it.** Le foto dei campioni sono in `texture/originali/`; `scripts/viste/texture-dalle-foto.ps1` ne ricava texture quadrate di 512 px ripetibili senza giunte, `scripts/viste/materiali.mjs` scrive texture e gradienti nei manifest.
- **Script nel repository.** In `scripts/viste/`: conversione dei pacchetti, correzioni note, Interno 3D di Cabanon, materiali, texture, verifica. Gli script non generano le viste: le convertono e le correggono, sempre nello stesso ordine, a partire dai pacchetti.
- **Cartella.** Viste e texture stanno in `public/viste/<prodotto>/` e `public/viste/texture/`; gli script puntano lì.
- **Livello B e regola delle 4 ore:** restano come ripiego per i prodotti futuri. Oggi nessun prodotto è al livello B.

## Motivi
- I pacchetti contengono già la resa voluta; il formato a marcature li conserva senza perdite (verificato su 114 combinazioni).
- Un file per taglio e vista invece che per combinazione: 4 MB invece di 31,7 MB, e un materiale nuovo non chiede di rigenerare gli SVG.
- Le texture prese dalle foto del sito rendono i materiali riconoscibili; quelle sintetiche dei pacchetti no.
- Codici uguali evitano una tabella di corrispondenza tra catalogo e viste.
- Togliere Yoku S toglie il prodotto con più incognite (12 versioni, varianti che cambiano la forma, file di formato ignoto).

## Conseguenze
- Il problema della sezione 2 dell'analisi cambia: tre dei quattro prodotti hanno una foto per ogni combinazione di taglio e legno, il valore del configuratore sta nelle viste coerenti, nell'Interno, nella Pianta, nella pedana di Aladdin e nel riepilogo. Il criterio di successo che chiedeva le combinazioni senza foto (Yoku S) si toglie.
- Cabanon ha i deck nel taglio (`garden`, `gardenM`, `gardenL`); Terrace e deck Small non ci sono, perché manca il modello.
- I codici possono avere maiuscole (`aspenT`, `gardenM`): la regola dei codici del catalogo le ammette.
- Le correzioni note ai pacchetti (`scripts/viste/correzioni.mjs`) si applicano sia alle viste sia agli originali prima del confronto, così la verifica resta esatta.
- La prova del PDF con resvg va rifatta sulle nuove viste: pattern con immagini JPG in prospettiva, gradienti; non ci sono più fusioni né sfocature.
- `scripts/converti-mockup.ts`, `leggiVista`, `costanti.ts` e la prova sul formato a `<path>` escono dal progetto.

## Come è stato verificato
`node scripts/viste/verifica.mjs` ricompone dai file nuovi ognuna delle 114 combinazioni dei pacchetti e la confronta, elemento per elemento, con l'originale corretto: 114 identiche su 114 il 2026-11-13 (non confronta l'immagine dei pattern e i colori dei gradienti, che vengono dalle foto). Le viste sono state confrontate a vista con le foto e la brochure di effe.it nella demo `configuratore.html`. Da fare nella fase 2: la prova con resvg.

## Ripiego
Per un prodotto futuro senza file utilizzabili, o che supera le 4 ore per taglio: foto ufficiale con il pannello dei campioni (livello B). Per il PDF, se resvg non rende i pattern: colore medio della foto del campione al posto della texture (`flat`).

## Alternative considerate
- Tradurre i pacchetti nel formato a zone della 0029: lavoro lungo e perdita della resa (pattern in prospettiva, ombre dei pacchetti).
- Un SVG per combinazione, come nei pacchetti: 31,7 MB e un file nuovo per ogni materiale.
- Tabella di corrispondenza tra i codici del catalogo e quelli del manifest: un file in più da tenere allineato.
- Interno 3D per tutti i prodotti: per ora solo Cabanon, scelta dell'autore.
