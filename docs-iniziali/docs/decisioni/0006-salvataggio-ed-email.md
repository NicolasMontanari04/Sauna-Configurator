# 0006. Un solo pulsante: salva, invia al cliente, notifica il progetto

- **Stato:** Accettata
- **Note:** Rivista il 2026-11-11 (analisi v6): precisati stati, "Riprova" e differenza tra URL e configurazione salvata

## Contesto
Il cliente finale può ricevere il riepilogo per email; il progetto deve tenere traccia della richiesta.

## Decisione
Il pulsante "Ricevi il riepilogo" salva nel database, invia il PDF al cliente e una notifica all'email del progetto. La configurazione si salva solo insieme alla richiesta del riepilogo.

- La riga si salva prima di ogni invio, con gli stati `in_attesa`. L'invio avviene fuori da ogni transazione, poi gli stati diventano `inviata` o `fallita`, con l'errore.
- Se l'invio al cliente fallisce, il cliente vede un messaggio, può scaricare il PDF e può riprovare: "Riprova" agisce sulla stessa riga, senza crearne una nuova.
- Il fallimento della notifica al progetto resta registrato nella riga e non è mostrato al cliente.
- L'URL del configuratore contiene solo lo stato delle scelte e non è legato a una configurazione salvata.
- Nessun ricontatto dei clienti.

## Motivi
Flusso semplice e verificabile; dati minimi; la riga registra cosa è stato chiesto e cosa è stato consegnato.

## Alternative considerate
Due azioni separate (salva e invia); link per riaprire una configurazione salvata (non previsto).

## Nota del 2026-11-11

Precisazione dopo la revisione dell'analisi v6; la scelta non cambia.

- Gli stati si chiamano `customer_status` e `project_status`, con valori `pending`, `sent`, `failed` (analisi, sezione 8.1).
