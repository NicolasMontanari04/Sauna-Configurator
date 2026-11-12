# 0028. Il seed svuota e ricarica il catalogo in una transazione

- **Stato:** Accettata
- **Sostituisce:** in parte la [0022](./0022-seed-sincronizzazione-catalogo.md), solo per il funzionamento del seed; resta valida la lettura del catalogo solo dal database dalla fase 3

## Contesto
La 0022 prevedeva un seed che sincronizza le tabelle del catalogo con i file: inserisce, aggiorna e cancella, calcolando le differenze, con un ordine di cancellazione fisso. La 0022 aveva scartato lo svuotamento completo perché "richiede di cancellare tutto in ordine". Lo stesso ordine però serve anche alla sincronizzazione, che in più deve calcolare le differenze. La tabella `configuration` non ha chiavi esterne verso il catalogo, e il catalogo non si modifica mai a mano: i file sono l'unica fonte. Per questo non c'è niente nel database da conservare tra un seed e l'altro.

## Decisione
- Il seed valida **tutti** i file con Zod prima di scrivere: un file sbagliato fa fallire il seed e il database non cambia.
- Poi, in **una sola transazione**, svuota le tabelle del catalogo (`product`, `product_size`, `option_group`, `option_value`, `material`) con una sola istruzione `TRUNCATE` e le ricarica dai file. `TRUNCATE` con tutte le tabelle collegate nella stessa istruzione non richiede un ordine di cancellazione.
- La tabella `configuration` non si tocca.

## Motivi
- Il risultato è lo stesso della sincronizzazione (il database coincide con i file), con meno codice e meno casi da provare.
- La transazione rende il seed tutto-o-niente, come prima.
- Le configurazioni salvate restano protette perché sono snapshot senza chiavi esterne.

## Conseguenze
- Gli `id` delle righe del catalogo cambiano a ogni seed. Nessuno li usa fuori dal catalogo: l'URL e lo snapshot usano i codici.
- `TRUNCATE` blocca le tabelle del catalogo per la durata del seed, cioè pochi millisecondi. Una pagina aperta in quel momento aspetta.
- Dalla fase 3 un file modificato non ha effetto finché non si rilancia il seed (come nella 0022).

## Come è stato verificato
Da completare: prova automatica del seed che aggiunge, modifica e toglie un valore, e controlla che dopo il seed il catalogo sia uguale ai file e le configurazioni salvate non siano cambiate.

## Ripiego
`npm run db:reset` ricrea il database da zero dai file.

## Alternative considerate
- Sincronizzazione con calcolo delle differenze (0022): stesso risultato, più codice.
- `DELETE` di ogni tabella nell'ordine delle chiavi esterne: equivalente, quattro istruzioni invece di una.
- Upsert senza cancellazioni (0018): lascia nel database dati tolti dai file.
