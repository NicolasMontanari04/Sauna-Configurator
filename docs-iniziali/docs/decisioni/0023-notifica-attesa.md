# 0023. La notifica al progetto si attende prima della risposta

- **Stato:** Accettata
- **Sostituisce:** in parte la [0017](./0017-email-nodemailer-gmail.md), solo per il momento in cui si invia la notifica

## Contesto
La 0017 prevedeva che la notifica al progetto partisse dopo l'email al cliente senza bloccare la risposta. In Next.js un lavoro lasciato in sospeso dopo la risposta di una Server Action non ha garanzia di finire: se il processo si ferma, la notifica si perde e la riga resta `pending`.

## Decisione
- Dopo l'email al cliente, il server invia la notifica al progetto e **ne attende il risultato** prima di rispondere.
- La notifica ha gli stessi timeout dell'email al cliente: i tre timeout di Nodemailer a circa 10 secondi e una scadenza complessiva di 15 secondi.
- Nel caso peggiore la risposta arriva dopo circa 30 secondi più la generazione del PDF, entro il limite di 60 secondi di RNF4.
- Un fallimento della notifica non cambia la risposta al cliente: resta in `project_status` con l'errore, e `npm run demo` rimanda all'avvio le notifiche `failed` che hanno ancora tentativi.

## Motivi
- Lo stato della notifica è sempre aggiornato quando il cliente riceve la risposta: niente righe `pending` lasciate da un lavoro interrotto.
- Non serve una coda né un processo separato.
- Il tempo in più si vede solo se Gmail è lento, ed è limitato dalle scadenze.

## Conseguenze
- Il pulsante resta in attesa più a lungo nel caso peggiore: l'interfaccia deve mostrare che l'invio è in corso.
- Nella demo una rete lenta allunga l'attesa visibile al tutor.

## Come è stato verificato
Da completare: prova con Mailpit lento o fermo, misurando il tempo di risposta.

## Ripiego
Se l'attesa risulta troppo lunga nella prova generale, si abbassa la scadenza della notifica.

## Alternative considerate
- Notifica dopo la risposta, senza attesa (scelta precedente): risposta più rapida, ma la notifica si può perdere.
- `after()` di Next.js per eseguire il lavoro dopo la risposta: più rapida, ma da verificare nella versione usata e senza garanzia se il processo si ferma.
- Notifica in copia nascosta all'email del cliente: un solo invio, ma il progetto riceverebbe l'email del cliente; già scartata nella 0017.
