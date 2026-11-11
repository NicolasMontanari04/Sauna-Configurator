# 0016. Generatore delle viste come funzione pura, per famiglie di layout

- **Stato:** Accettata (estensione ad altre famiglie da verificare nella fase 3); sostituita in parte da [0021](./0021-viste-frontale-diagonale.md) (viste e immagini nel PDF)
- **Note:** Precisa la [0010](./0010-grafica-svg-da-parametri.md); raccoglie le decisioni P12, P13, P14 e P15 dell'analisi v6

## Contesto
La 0010 sceglie viste SVG generate da parametri. Il generatore esiste solo nel mockup, provato su Aladdin 60. Il mockup scrive le definizioni SVG nel DOM, usa un contatore globale per gli `id`, ha i dati scritti nel codice e carica i font da Google Fonts. Le stesse viste servono all'anteprima nel browser e al PDF sul server. Le disposizioni interne dei prodotti cambiano molto: panche, stufa, sequenza del fronte.

## Decisione
- **Funzione pura** `(geometria, scelte, vista, opzioni) → stringa SVG`, senza DOM, in `src/lib/viste/`. La usano il browser per l'anteprima e il server per il PDF.
- **Ogni SVG è autosufficiente:** contiene le proprie definizioni (`<defs>`), e gli `id` dei pattern hanno un prefisso passato come parametro, così più viste nella stessa pagina non si sovrappongono.
- **Geometria come elenco di parti tipizzate:** involucro, pannelli del fronte {tipo, larghezza}, panche {forma, profondità, livelli}, stufa {tipo, parete, scostamento}. Il generatore è una libreria di primitive; un nuovo prodotto della stessa famiglia è un file di dati. Lo schema Zod della geometria fa parte del contratto.
- **Viste:** esterna e frontale (nel mockup "Interno"); la pianta solo se avanza tempo prima del blocco delle funzioni.
- **Prestazioni:** la geometria si calcola una volta per prodotto e taglio; cambiare materiale cambia solo il riferimento del `<pattern>` della zona.
- **Texture (P13):** la foto del campione del sito si adatta all'intera zona (`patternContentUnits="objectBoundingBox"`). Per un materiale su cui la foto allargata non regge, si usano le venature procedurali del mockup con il colore preso dalla foto.
- **Font (P14):** Jost e IBM Plex Sans, file TTF in `src/fonts/`, gli stessi per pagine, viste e PDF.
- **Opzione `flat: true`:** pattern sostituiti dai colori pieni dei materiali, per il ripiego del PDF (scheda [0015](./0015-pdf-pdfkit-resvg.md)).
- **Porting (P15):** il mockup si salva in `docs/mockup/` come riferimento e le sue funzioni diventano la funzione pura descritta sopra, con i dati presi da `data/prodotti/`.
- **Regola di decisione:** un prodotto che richiede più di circa 2 ore di lavoro sul generatore (mezza giornata per una famiglia nuova) usa la foto ufficiale con il pannello dei campioni dei materiali.

## Motivi
- Una sola funzione per anteprima e PDF: il PDF mostra ciò che il cliente ha visto e si può rigenerare dalla riga salvata.
- Una funzione senza DOM si prova con test automatici e gira anche sul server.
- La geometria a parti trasforma "un generatore per tutti" in "un generatore per le famiglie supportate", che si può verificare.
- La regola di decisione impedisce che l'inserimento dei prodotti diventi sviluppo dopo il blocco delle funzioni.

## Conseguenze
- Il generatore va scritto in modo che resvg lo disegni come il browser: niente CSS esterno, niente font di sistema, texture come data URI quando si converte sul server.
- Serve un censimento del catalogo per famiglie di layout (`docs/catalogo-inventario.md`).
- Le viste nel PDF sono esterna e frontale (P12), con le stesse primitive.

## Come è stato verificato
Mockup su Aladdin 60 con Rovere, Wengé e gres. Da completare: secondo prodotto SVG nella fase 3, tempo misurato per prodotto, confronto browser/resvg nella prova della fase 2.

## Ripiego
Foto ufficiale della versione con il pannello dei campioni dei materiali, etichettata "anteprima fotografica, materiali indicati a lato".

## Alternative considerate
- Riscrivere il generatore da zero sul contratto: più pulito, ma più tempo; scartata a favore del porting.
- SVG disegnato a mano (Inkscape o Figma) con zone texture nominate: da usare se una famiglia è molto diversa e più rapida da disegnare che da parametrizzare.
- Foto ritoccate per renderle ripetibili: risultato migliore, ma lavoro manuale per ogni materiale; scartata.
- Viste preparate in anticipo in `public/`: il numero di combinazioni esplode; scartata.

## Nota del 2026-11-11

Precisazioni dopo la revisione dell'analisi v6.

- Cambio di scelta: le viste sono frontale e diagonale, entrambe esterne, e nel PDF va la diagonale in grande. Le righe "Viste" della Decisione e "Le viste nel PDF" delle Conseguenze sono superate dalla scheda [0021](./0021-viste-frontale-diagonale.md).
- La firma della funzione è `(geometria, scelte, vista, opzioni) → stringa SVG`.
- Le parti della geometria e i loro campi sono quelli dello schema della sezione 15.2 dell'analisi (fronte, fascia di specchio, frame, panche, stufa facoltativa).
