# 0024. Il request_id lo genera il server, nel modulo

- **Stato:** Sostituita da [0026](./0026-pagina-unica-come-il-mockup.md)
- **Sostituisce:** in parte la [0017](./0017-email-nodemailer-gmail.md) e la [0019](./0019-nextjs-server-action-zod-shadcn.md), solo per chi genera il `request_id` (decisione P4 dell'analisi v6)

## Contesto
Il `request_id` evita che un doppio clic su "Ricevi il riepilogo" crei due righe. La decisione P4 prevedeva un UUID generato dal client. La 0019 vuole però che il modulo funzioni anche senza JavaScript, e senza JavaScript il client non può generare nulla.

## Decisione
- Il server genera il `request_id` (UUID) quando mostra il modulo e lo inserisce in un **campo nascosto**.
- Alla ricezione, l'inserimento usa `ON CONFLICT (request_id) DO NOTHING`; se la riga esiste già, il server la legge e la restituisce invece di crearne una nuova.
- La colonna `request_id` ha un vincolo `UNIQUE`.

## Motivi
- Funziona anche senza JavaScript, come richiede la 0019.
- Un solo punto genera gli identificativi, quindi il formato è sempre valido.

## Conseguenze
- Ogni volta che il modulo viene mostrato serve un nuovo `request_id`; dopo un invio riuscito, un nuovo invio richiede di riaprire il modulo.
- Due schede aperte sullo stesso modulo hanno `request_id` diversi, quindi possono creare due righe: è accettato.

## Come è stato verificato
Da completare: prova Playwright con doppio invio dello stesso modulo, che deve produrre una sola riga.

## Ripiego
Il pulsante si disattiva comunque mentre l'invio è in corso.

## Alternative considerate
- UUID generato dal client (scelta precedente): non funziona senza JavaScript.
- Nessun identificativo, solo il pulsante disattivato: non protegge da un reinvio del modulo, per esempio ricaricando la pagina.
