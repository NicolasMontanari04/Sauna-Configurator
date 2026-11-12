# 0027. Niente regole di compatibilità né optional; pedana obbligatoria

- **Stato:** Accettata
- **Sostituisce:** la [0020](./0020-regole-compatibilita-condivise.md); in parte la [0018](./0018-catalogo-file-database-derivato.md), solo per le regole e gli optional nei file del catalogo (P3)

## Contesto
La 0020 prevedeva tre tipi di regola di compatibilità, una funzione `valuta` condivisa tra interfaccia e server e scelte disattivate con un messaggio. La decisione P3 aveva però già stabilito che il catalogo non contiene né optional né regole e che non si inventano dati: il motore delle regole sarebbe stato provato solo su un catalogo finto e in demo non si sarebbe visto. La consegna è il 26 novembre 2026.

## Decisione
- **Nessuna regola di compatibilità:** escono dal progetto la tabella `option_rule`, il campo `rules` dei file, i tre tipi di regola e le scelte disattivate.
- **Nessun optional e nessun gruppo a scelta multipla:** ogni gruppo ha una sola scelta, obbligatoria, con un valore predefinito.
- **Resta la validazione sul server:** la funzione `valida(config, catalogo)`, che riceve l'elenco dei prodotti, controlla che il prodotto e il taglio esistano, che ogni gruppo appartenga al prodotto, che ogni valore appartenga al suo gruppo e che ogni gruppo abbia un valore. Una configurazione non valida, ad esempio da un URL modificato a mano, è rifiutata.
- **Pedana obbligatoria:** dove il catalogo propone una pedana, una delle finiture proposte è sempre selezionata. Il valore "Nessuna pedana" non esiste.

## Motivi
- Si costruisce solo ciò che il catalogo reale richiede e che la demo può mostrare.
- Il tempo risparmiato va alle viste e alle prove sui due portatili.
- Con la pedana sempre presente ogni vista ha un materiale per il pavimento e non serve un caso "senza materiale".

## Conseguenze
- La pedana obbligatoria si discosta dal sito, che la presenta come un completamento facoltativo: va detto nella presentazione.
- Se in futuro emergesse una regola reale, andrebbe aggiunta con una nuova scheda: lo schema del database non la prevede più.
- Nella demo non si mostra una scelta incompatibile; si mostra il rifiuto di un URL modificato a mano.

## Come è stato verificato
Da completare: prove automatiche di `valida` e dell'invio con una configurazione non valida (fase 3).

## Ripiego
Nessuno previsto.

## Alternative considerate
- Motore delle regole provato su un catalogo finto (scelta precedente): codice e prove senza un uso reale.
- Un prodotto di prova con regole inventate per la demo: contraddice la decisione di non inventare dati.
- Pedana facoltativa con "Nessuna pedana" predefinita (scelta precedente): fedele al sito, ma scartata dall'autore.
