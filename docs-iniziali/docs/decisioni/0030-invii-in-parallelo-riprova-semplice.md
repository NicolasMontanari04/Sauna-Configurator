# 0030. Le due email partono in parallelo; "Riprova" senza attese

- **Stato:** Accettata
- **Sostituisce:** la [0023](./0023-notifica-attesa.md); in parte la [0017](./0017-email-nodemailer-gmail.md), solo per l'attesa di 30 secondi tra due tentativi e per il nuovo invio delle notifiche all'avvio

## Contesto
La 0023 inviava la notifica al progetto dopo l'email al cliente e la attendeva: nel caso peggiore il cliente aspettava circa 30 secondi più la generazione del PDF. Le due email però sono indipendenti. La 0023 voleva evitare un lavoro lasciato a metà dopo la risposta: questo si ottiene attendendo entrambe le email, non inviandole una dopo l'altra.

Il flusso prevedeva inoltre un'attesa di 30 secondi tra due tentativi, un ramo di "Riprova" per le righe `pending` più vecchie di 2 minuti e il nuovo invio automatico delle notifiche fallite all'avvio. Contro i doppi invii basta l'aggiornamento condizionale, e nessuno di questi rami compare nel percorso della demo.

## Decisione
- **Invio.** L'email al cliente e la notifica al progetto partono **insieme** e il server attende entrambe prima di rispondere. Ogni invio usa un proprio transporter, così la chiusura alla scadenza di un invio non interrompe l'altro. Ogni invio scade dopo 15 secondi complessivi.
- **"Riprova"** rimanda solo l'email al cliente, se lo stato è `failed` e restano tentativi (al massimo 3 compreso il primo invio), senza attese minime. Se non si può rimandare, il motivo è uno di quattro:
  - `inviata`: l'email è già partita;
  - `in-corso`: un altro invio per la stessa riga è in corso;
  - `esauriti`: i tentativi sono finiti;
  - `inesistente`: il token non esiste o la riga è scaduta.
- **Richiesta doppia.** Se lo stesso `request_id` arriva mentre il primo invio è ancora `pending`, l'esito è `in-corso`, senza una seconda riga.
- **Notifica fallita.** Resta registrata in `project_status` con l'errore e non si rimanda, né da "Riprova" né all'avvio. Le colonne dei tentativi della notifica escono dallo schema.
- **Avvio.** `npm run demo`, prima di avviare l'applicazione, segna `failed` tutti gli stati rimasti `pending`: in quel momento nessun invio può essere in corso.

## Motivi
- Nel caso peggiore il cliente aspetta circa 15 secondi più il PDF, invece di 30.
- Le due email sono attese: nessun lavoro resta a metà dopo la risposta, come voleva la 0023.
- Meno rami vuol dire meno codice e meno prove, in un calendario senza margine.

## Conseguenze
- Se la notifica fallisce, il progetto non la riceve mai per quella configurazione: la riga nel database resta l'unica traccia. È un rischio accettato.
- Due connessioni SMTP contemporanee verso Gmail per ogni invio: per i volumi di una demo non è un problema.
- Il criterio di successo 5 non chiede più di aspettare 30 secondi prima di "Riprova".

## Come è stato verificato
Da completare: prova verso un server SMTP di prova che accetta la connessione e non risponde, misurando il tempo di risposta (circa 15 secondi più il PDF, entrambi gli stati `failed` con causa "tempo scaduto"); prova con due "Riprova" in parallelo (uno parte, l'altro riceve `in-corso`).

## Ripiego
Se due connessioni contemporanee danno problemi con Gmail nella prova generale, si torna all'invio in serie della 0023.

## Alternative considerate
- Invio in serie con attesa della notifica (0023): attesa doppia nel caso peggiore.
- Notifica dopo la risposta, senza attesa (0017): la notifica si può perdere se il processo si ferma.
- Nuovo invio automatico delle notifiche all'avvio: un ramo in più, invisibile nella demo.
