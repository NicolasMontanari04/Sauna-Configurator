# 0025. Viste SVG pronte, generate da uno script a partire dal modello 3D

- **Stato:** Accettata (texture e confronto con le foto ufficiali da verificare nella fase 2)
- **Sostituisce:** la [0010](./0010-grafica-svg-da-parametri.md), la [0016](./0016-generatore-famiglie-layout.md) e la [0021](./0021-viste-frontale-diagonale.md), tranne che per i font (P14) e per l'opzione `flat`, che restano validi

## Contesto
La 0010 e la 0016 prevedevano un generatore che disegna le viste a partire da pochi parametri (pannelli del fronte, panche, stufa), provato su un solo prodotto nel mockup. Rileggendo il mockup il 2026-11-12 è emerso che le viste curate di quel prodotto non escono da quel generatore: sono tre disegni SVG già pronti, ricavati una sola volta dal modello 3D dell'Area Pro con una procedura non conservata, e il codice ne cambia solo colori e texture. Il generatore a parametri produce invece un disegno schematico, molto più povero. Analisi e mockup descrivevano quindi due architetture diverse.

## Decisione
- Le viste sono **file SVG pronti**, uno per prodotto, taglio e vista, in `public/viste/<prodotto>/<taglio>/`.
- Li produce **uno script nel repository** (`scripts/viste/`) che legge il modello 3D in formato FBX, assegna ogni faccia a una zona, disegna il modello da una camera fissa e ricalca le regioni in poligoni. Ogni poligono porta la zona (`data-zone`) e il livello d'ombra (`data-shade`).
- Le regole che assegnano le facce alle zone sono **specifiche del modello** e stanno in un file per prodotto accanto allo script.
- Le viste sono quattro: **Esterno** (prospettiva a tre quarti), **Frontale**, **Pianta** e **Materiali** (pannello dei campioni). La vista interna è scartata.
- Nel PDF vanno l'esterno in grande e la frontale più piccola.
- A runtime una funzione pura, `componiVista`, applica colori e texture dei materiali scelti alle zone. La usano il browser per l'anteprima e il server per il PDF.
- I file nativi dell'Area Pro restano sul computer locale e non entrano nel repository; le viste derivate sì (autorizzazione del tutor).
- Un prodotto senza modello FBX usa la foto ufficiale con il pannello dei campioni.

## Motivi
- È ciò che il mockup fa davvero per le viste che si vogliono mostrare, e la qualità è molto superiore al disegno a parametri.
- La geometria viene dal modello del produttore: forma e proporzioni sono corrette senza trascriverle a mano.
- Uno script nel repository rende la procedura ripetibile; prima dipendeva da una conversazione non conservata.
- L'applicazione si semplifica: non contiene più un generatore, solo la sostituzione di colori e texture.

## Conseguenze
- Lo schema `Geometria` esce dal contratto condiviso, con le primitive e le famiglie di layout.
- L'unità di lavoro è il taglio, non il prodotto: ogni file FBX descrive un taglio e una sola variante.
- Un taglio senza modello può riusare le viste di un altro taglio dello stesso prodotto, con una nota visibile, solo se la forma è la stessa.
- I colori si calcolano in JavaScript e si scrivono nell'SVG: variabili CSS e `color-mix()`, usate dal mockup, non sono supportate da resvg.
- La pianta, prima facoltativa, è un requisito.

## Come è stato verificato
Il 2026-11-12 lo script di prova (`scripts/viste/prova-genera.mjs`) ha prodotto esterno, frontale e pianta di un secondo modello a partire dal suo FBX: 6 secondi in tutto, 18 KB la vista esterna (contro i 312 KB della vista equivalente del mockup), tutte convertite in PNG con `@resvg/resvg-js`. Da completare nella fase 2: texture, pavimento (nella prova non viene disegnato), confronto di ogni vista con la foto ufficiale, tempo misurato per scrivere le regole di un modello.

## Ripiego
Foto ufficiale della versione con il pannello dei campioni dei materiali, etichettata "anteprima fotografica, materiali indicati a lato".

## Alternative considerate
- Generatore a parametri (scelta precedente): ripetibile senza file 3D, ma la resa è schematica.
- Ricalco di un'immagine renderizzata altrove (procedura del mockup): non ripetibile e file dieci volte più pesanti.
- Modelli con il solo DWG: lo script non li legge; servirebbe una conversione con un programma CAD. Scartata per questa versione.
- 3D in tempo reale nel browser: escluso, i modelli non possono entrare nel repository.
