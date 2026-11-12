# 0022. Seed come sincronizzazione completa, catalogo letto dal database

- **Stato:** Accettata; sostituita in parte da [0028](./0028-seed-svuota-e-ricarica.md) (funzionamento del seed)
- **Sostituisce:** in parte la [0018](./0018-catalogo-file-database-derivato.md), solo per il funzionamento del seed e per la lettura del catalogo

## Contesto
La 0018 prevedeva un seed con upsert per codice, senza mai cancellare, e l'interfaccia che importa i file del catalogo. Con il solo upsert, un valore o una regola tolti da un file restano nel database: interfaccia e server potrebbero allora usare regole diverse, e il database non coinciderebbe più con i file, che sono la fonte.

## Decisione
- Il seed valida **tutti** i file con Zod prima di scrivere: un file sbagliato fa fallire il seed e il database non cambia.
- Poi **sincronizza** le tabelle del catalogo in una sola transazione: inserisce, aggiorna e cancella, così il database coincide con i file.
- Le chiavi esterne del catalogo sono `RESTRICT`. L'ordine di cancellazione è: regole, valori, gruppi, tagli, prodotti; un materiale si cancella solo se nessun file lo dichiara più. Se un passo fallisce, la transazione si annulla.
- La tabella `configuration` non si tocca e non ha chiavi esterne verso il catalogo, quindi le configurazioni salvate non si perdono.
- **Lettura del catalogo:** fino allo scheletro (fase 3) l'interfaccia importa i file come catalogo finto; dalla fase 3 l'applicazione legge il catalogo **solo dal database**, e il configuratore riceve il prodotto dal server.
- Dopo ogni modifica a un file si rilancia il seed; lo fa anche `npm run demo`.

## Motivi
- Il database coincide sempre con i file: nessuna regola o valore "fantasma".
- Una sola fonte di lettura dalla fase 3 garantisce che interfaccia e server applichino le stesse regole.
- La transazione rende il seed tutto-o-niente.
- Le configurazioni salvate restano protette perché sono snapshot senza chiavi esterne.

## Conseguenze
- Il seed è più complesso di un upsert: va scritto con l'ordine di cancellazione giusto e provato.
- Rinominare un codice in un file equivale a cancellare un elemento e crearne un altro.
- Dalla fase 3 un file modificato non ha effetto finché non si rilancia il seed.

## Come è stato verificato
Da completare: prova automatica del seed che aggiunge, modifica e toglie un valore e una regola, e controlla che le configurazioni salvate restino invariate.

## Ripiego
`npm run db:reset` ricrea il database da zero dai file.

## Alternative considerate
- Upsert senza cancellazioni (scelta precedente): più semplice, ma lascia nel database dati tolti dai file.
- Svuotare e ricaricare tutto il catalogo a ogni seed: semplice, ma con chiavi esterne `RESTRICT` richiede di cancellare tutto in ordine e non dà vantaggi rispetto alla sincronizzazione.
- Interfaccia che legge sempre i file: niente seed da rilanciare, ma interfaccia e server potrebbero leggere fonti diverse.
