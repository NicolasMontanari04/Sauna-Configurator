# 0012. Regole di migrabilità

- **Stato:** Accettata
- **Note:** Rivista il 2026-11-11 (analisi v6): contesto e motivi allineati al fatto che non è prevista una pubblicazione

## Contesto
Non è prevista una pubblicazione, ma le scelte non devono precluderla.

## Decisione
Database raggiunto solo con DATABASE_URL; nessuna estensione o funzione specifica di un fornitore; schema e dati solo via migrazioni e seed; nessun dato su file locali; configurazioni solo in .env.

## Motivi
Le regole coincidono con le impostazioni predefinite e non richiedono lavoro in più. Passare a un database online richiede solo di cambiare la configurazione (connessione, SSL), senza modifiche a schema o codice.

## Alternative considerate
Nessuna regola (scartata).

## Nota del 2026-11-11

Precisazione dopo la revisione dell'analisi v6; la scelta non cambia.

- Le regole richiedono poco lavoro in più. Il passaggio a un database online può richiedere, oltre alla configurazione, le opzioni del driver se il servizio usa un pooler di connessioni (ad esempio `prepare: false` per `postgres.js`). Il passaggio non è stato provato (analisi, sezione 13).
