# 0029. Viste prodotte in chat a partire dai file dell'Area Pro, nel formato del contratto

- **Stato:** Accettata; sostituita in parte da [0031](./0031-viste-a-marcature-e-texture-dalle-foto.md) (formato, zone, nomi delle viste, script nel repository)
- **Sostituisce:** in parte la [0025](./0025-viste-pronte-da-modello-3d.md), solo per chi produce le viste, per i file di partenza e per le zone; restano validi i file SVG pronti per taglio, le quattro viste, `componiVista`, le viste del PDF e la foto ufficiale come ripiego

## Contesto
La 0025 prevedeva uno script nel repository (`scripts/viste/`) che legge il modello FBX, assegna le facce alle zone con regole scritte per ogni modello e ricalca le viste. Lo script di prova girava su un modello, ma mancavano ancora texture, pavimento, regole per Aladdin e confronto con le foto. Le viste di Aladdin 60 del mockup, che sono il riferimento di qualità approvato dall'autore (texture del legno, pedana che cambia materiale), non sono uscite da uno script: sono state prodotte in chat. L'autore ha deciso che le viste di tutti i prodotti si producono così.

Le viste del mockup usano classi CSS, variabili CSS e `color-mix()`, che resvg non supporta: così come sono non entrano nel PDF.

## Decisione
- **Chi le produce.** Le viste di ogni taglio (Esterno, Frontale, Pianta) si producono in chat a partire dai file dell'Area Pro del taglio: FBX, DWG o SKP. Nel repository non c'è uno script delle viste.
- **Procedura conservata.** `docs/viste.md` conserva il testo della richiesta fatta in chat, il file di partenza usato per ogni taglio, il formato richiesto e i controlli.
- **Formato.** Le viste rispettano il formato del contratto (analisi, sezione 15.2): solo `<path>` con `data-zone` e `data-shade`, senza stili, variabili CSS, testo o colori. Colori, texture, bordi, vetro e ombra a terra li aggiunge `componiVista`, con la resa del mockup.
- **Zone**, con i nomi del mockup:
  - prendono un materiale: `ext`, `roof`, `int`, `bench`, `floor`, `mirror`, `metal`;
  - hanno un colore fisso: `stove`, `glass`, `shadow`.
  Ogni zona a materiale prende il materiale da un gruppo del prodotto o da `fixedZones`, mai da entrambi. `floor` e `metal` possono restare senza materiale, se il sito non lo indica: prendono un colore neutro fisso, senza texture (analisi, sezione 9.3).
  La rotazione della texture è una costante per zona (`roof` e `bench` a 90 gradi): non c'è più un attributo `data-rot`.
- **Viste esistenti.** Le viste di Aladdin 60 del mockup si convertono una sola volta nel formato del contratto (`class="ext2"` diventa `data-zone="ext" data-shade="2"`; si tolgono lo stile e i path della texture, che ricostruisce `componiVista`).
- **File dell'Area Pro.** Caricarli in chat vuol dire inviarli al fornitore del servizio. Il tutor lo ha autorizzato (riferito dall'autore il 2026-11-12). Nel repository entrano solo le viste prodotte, non i file nativi.

## Motivi
- È il procedimento che ha prodotto le viste approvate dall'autore.
- Toglie dal progetto lo script e le regole per modello, cioè il lavoro più caro per prodotto e quello con più incognite.
- Un solo formato, controllato da una prova automatica, protegge l'applicazione e il PDF qualunque sia il modo in cui la vista è stata prodotta.

## Conseguenze
- La qualità di ogni vista dipende dalla conversazione: i controlli (prova sul formato e confronto con la foto ufficiale in `/galleria`) diventano l'unica garanzia.
- Il tempo per taglio si misura sulla chat; la regola "più di 4 ore di lavoro di una persona per un taglio → tutto il prodotto al livello B" (analisi, sezione 9.2) resta.
- Con i DWG e gli SKP utilizzabili, un taglio senza FBX non è più escluso dal livello A.
- Escono dal progetto `scripts/viste/`, lo script npm `viste` e la dipendenza `three`; lo script di prova va in `archivio/`.
- Le viste possono pesare centinaia di KB (305 KB la vista esterna di Aladdin 60): la pagina riceve solo le viste del prodotto aperto.

## Come è stato verificato
Le viste di Aladdin 60 del mockup sono già state prodotte così. Da completare nella fase 2: conversione nel formato del contratto, prova sul formato, resa con resvg (pattern, fusione, sfocatura dell'ombra), viste di Aladdin 45 prodotte in chat.

## Ripiego
Foto ufficiale della versione con il pannello dei campioni dei materiali (livello B).

## Alternative considerate
- Script nel repository (0025): ripetibile, ma richiede regole per ogni modello e la resa non era ancora al livello del mockup.
- Formato del mockup così com'è, con le variabili risolte sul server prima di resvg: due formati da mantenere.
- `data-rot` su ogni poligono: inutile se la rotazione dipende solo dalla zona.
