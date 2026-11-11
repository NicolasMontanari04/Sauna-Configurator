# 0010. Grafica: viste SVG da parametri e immagini del sito come ripiego

- **Stato:** Accettata; sostituita in parte da [0021](./0021-viste-frontale-diagonale.md) (viste)
- **Note:** Rivista il 2026-11-11 (analisi v6): la replicabilità vale per le famiglie di layout supportate; 3D escluso; pianta solo se avanza tempo

## Contesto
Non si hanno i file 3D di tutti i modelli; serve una soluzione leggera. Il generatore è stato provato solo su Aladdin 60.

## Decisione
- Viste esterna e frontale generate da parametri con le texture del catalogo; la pianta solo se avanza tempo.
- La geometria è un elenco di parti tipizzate (pannelli del fronte, panche, stufa) disegnate da una libreria di primitive.
- Il generatore è una funzione pura usata dal browser per l'anteprima e dal server per il PDF.
- Per i prodotti fuori dalle famiglie supportate, o che richiedono più di circa 2 ore di lavoro sul generatore, si usano la foto ufficiale e un pannello di campioni dei materiali.
- I file 3D e 2D dell'Area Pro restano sul computer locale.

## Motivi
Replicabile, con un file di dati, per i prodotti delle famiglie di layout supportate; leggero; cambio di materiale immediato.

## Alternative considerate
3D in tempo reale (escluso da questa versione); immagini a livelli da file FBX (non replicabili per tutti i modelli); SVG disegnato a mano con zone texture nominate (da valutare per layout molto diversi).

## Nota del 2026-11-11

Dopo la revisione dell'analisi v6 le viste sono cambiate: è un cambio di scelta, registrato nella scheda [0021](./0021-viste-frontale-diagonale.md) (viste frontale e diagonale, entrambe esterne).
