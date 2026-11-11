# 0021. Viste esterne: frontale e diagonale

- **Stato:** Accettata
- **Sostituisce:** in parte la [0010](./0010-grafica-svg-da-parametri.md) e la [0016](./0016-generatore-famiglie-layout.md), solo per le viste e per le immagini nel PDF (decisione P12 dell'analisi v6)

## Contesto
La 0010 e la 0016 prevedevano una vista esterna e una vista frontale interna (nel mockup "Esterno" e "Interno"), con la pianta solo se avanza tempo. La vista interna mostra panche e stufa, che cambiano molto da prodotto a prodotto: è la parte più difficile da generare con le stesse primitive per famiglie diverse. Dopo la revisione dell'analisi v6 l'autore ha deciso di cambiare le viste.

## Decisione
- Il generatore produce due viste, **entrambe dall'esterno**:
  - **frontale:** la parete frontale vista di fronte, con la sequenza del fronte (vetro, legno, porta);
  - **diagonale:** la sauna in prospettiva da un angolo, con il fronte e un fianco.
- Le viste dall'interno sono scartate.
- La pianta resta facoltativa, solo se avanza tempo prima del blocco delle funzioni.
- **PDF:** la vista diagonale in grande e la frontale più piccola. Per i prodotti con la foto resta la foto della versione con i campioni dei materiali.

## Motivi
- Le viste esterne dipendono soprattutto da dimensioni, fronte e materiali, che il sito documenta; l'interno dipende da panche e stufa, che cambiano per ogni famiglia.
- La diagonale mostra insieme fronte e fianco, quindi dà un'idea del volume più vicina alle foto ufficiali.
- Meno parti da generare per famiglia rende più realistico applicare la regola di decisione SVG/foto della 0016.

## Conseguenze
- **La vista diagonale va scritta da zero.** Il mockup ha solo viste ortogonali (esterno di fronte, interno, pianta): la sua vista "Esterno" corrisponde alla nuova frontale, mentre per la diagonale servono una proiezione e la deformazione delle texture sul fianco. È lavoro nuovo, non porting, e va stimato nella fase 3.
- Le texture sul fianco in prospettiva vanno verificate anche in resvg, nella fase 3.
- La vista frontale mostra l'interno attraverso il vetro del fronte, come il mockup di Aladdin: essenza interna, panche e pedana si vedono dietro il vetro, così ogni scelta cambia l'immagine. Per questo la geometria comprende le panche (parte visibile dal vetro); la stufa serve per la pianta, se si fa. Nella diagonale l'interno si vede dal vetro se nella fase 3 risulta leggibile.
- Il testo alternativo descrive le due viste esterne.

## Come è stato verificato
Da completare: vista diagonale di Aladdin 60 nella fase 3, confrontata con la foto ufficiale; conversione con resvg nella fase 3.

## Ripiego
Se la diagonale non è pronta in tempo: solo la vista frontale, e nel PDF la frontale in grande.

## Alternative considerate
- Vista esterna e frontale interna (scelta precedente): l'interno è difficile da replicare tra famiglie diverse.
- Solo la vista frontale: meno lavoro, ma non rende il volume della sauna.
- Assonometria al posto della prospettiva: più semplice da calcolare e con le misure leggibili, meno simile alle foto. Si può usare come ripiego per la diagonale.

## Nota del 2026-11-11

Precisazione dopo la revisione dell'analisi v6; la scelta non cambia.

- La conversione con resvg della diagonale si fa nella fase 3, non nella 2, perché la diagonale nasce nella fase 3.
- Lo schema della geometria (analisi, sezione 15.2) comprende le panche per la parte visibile dal vetro; la stufa è facoltativa e serve solo alla pianta.
