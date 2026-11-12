# 0017. Email: Nodemailer con Gmail, stati nella riga, Mailpit in sviluppo

- **Stato:** Accettata; sostituita in parte da [0023](./0023-notifica-attesa.md) (momento della notifica, a sua volta sostituita da [0030](./0030-invii-in-parallelo-riprova-semplice.md)), da [0026](./0026-pagina-unica-come-il-mockup.md) (`request_id`, che sostituisce la 0024) e da [0030](./0030-invii-in-parallelo-riprova-semplice.md) (attesa tra due tentativi)
- **Note:** Precisa la [0006](./0006-salvataggio-ed-email.md); raccoglie le decisioni P4, P5 e P11 dell'analisi v6

## Contesto
L'invio reale del PDF per email è un requisito che non si può togliere. Durante la demo il tutor inserisce un indirizzo vero. Il progetto non ha un dominio né un servizio di posta proprio. I guasti realistici sono: rete che blocca SMTP in uscita, account Gmail nuovo bloccato o da verificare, email nello spam, timeout predefiniti di Nodemailer di minuti, doppio clic sul pulsante.

## Decisione
- **Invio:** Nodemailer con SMTP di un account Gmail dedicato al progetto, con verifica in due passaggi e password per le app. Credenziali solo in `.env`.
- **Timeout** di circa 10 secondi per ciascuno dei tre timeout di Nodemailer (connessione, saluto, inattività), più una scadenza complessiva di 15 secondi per invio.
- **La riga è la posta in uscita:** si salva con `stato_cliente` e `stato_progetto` = `in_attesa` prima di ogni invio, fuori da ogni transazione; dopo ogni invio lo stato diventa `inviata` o `fallita`, con errore, numero di tentativi e data.
- **Ordine:** prima l'email al cliente, poi la notifica al progetto; il risultato della notifica non blocca la risposta al cliente.
- **Identificativi (P4):**
  - `token`: 16 byte casuali in base64url, unico, usato negli URL di conferma, "Riprova" e "Scarica il PDF";
  - `request_id`: UUID generato dal client per ogni invio del modulo, unico; se arriva due volte, il server restituisce la riga esistente.
- **Numero (P5):** `AAAA-NNNNNN`, anno di creazione e `id` con zeri davanti (es. `2026-000042`).
- **Testi (P11):**
  - email al cliente: oggetto "Il riepilogo della tua sauna <prodotto>, n. <numero>"; corpo con saluto, elenco delle scelte, PDF allegato, nota "messaggio automatico, non rispondere" e indirizzo per chiedere la cancellazione;
  - notifica al progetto: oggetto "Nuova richiesta di riepilogo n. <numero>"; corpo con prodotto, scelte e data, **senza l'email del cliente**.
- **Sviluppo:** Mailpit in locale al posto di Gmail; le prove del flusso leggono l'API di Mailpit.
- **Controllo preliminare:** `npm run check` esegue `transporter.verify()` verso Gmail.

## Motivi
- Gmail è gratuito, non richiede un dominio e regge i pochi invii di una demo.
- Salvare la riga prima dell'invio evita di perdere la richiesta se l'invio fallisce e permette "Riprova" sulla stessa riga.
- Il timeout breve trasforma un guasto in un messaggio chiaro invece di un pulsante bloccato.
- Il token impedisce di scaricare il PDF di un'altra persona cambiando un numero nell'URL.
- La notifica senza email del cliente riduce le copie di dati personali nella casella Gmail, che va ripulita a mano dopo 12 mesi.
- Mailpit evita di consumare la reputazione dell'account Gmail durante lo sviluppo.

## Conseguenze
- Gmail va dichiarato nell'informativa come servizio che tratta il contenuto delle email.
- L'account va creato e provato subito (fase 1), da tre reti e verso un Gmail, un Outlook e un indirizzo dell'università.
- La casella del progetto va ripulita a mano (ricerca `older_than:12m`).

## Come è stato verificato
Da completare nella fase 1: invio di prova con un PDF fittizio; verifica della ricezione e della cartella spam.

## Ripiego
- Rete che blocca SMTP: hotspot del telefono.
- Invio fallito: stato `fallita`, messaggio chiaro, "Scarica il PDF" sempre disponibile, "Riprova" sulla stessa riga.
- Guasto completo: email ricevuta il giorno prima e registrazione del flusso.

## Alternative considerate
- Servizi transazionali (Resend, SendGrid, Mailgun): migliore consegna, ma richiedono un account e di solito un dominio verificato; non necessari per una demo.
- Invio dentro una transazione del database: impossibile, un invio SMTP non si annulla.
- Notifica in copia nascosta all'email del cliente: un solo invio, ma il progetto riceverebbe l'email del cliente e il PDF; scartata.
- Identificare le azioni con l'`id` della riga: indovinabile; scartata.

## Nota del 2026-11-11

Precisazioni dopo la revisione dell'analisi v6. Due punti sono cambi di scelta e sono registrati in schede nuove: l'attesa della notifica (0023) e il `request_id` generato dal server (0024).

- Gli stati si chiamano `customer_status` e `project_status`, con valori `pending`, `sent`, `failed`.
- Oltre ai tre timeout di Nodemailer, ogni invio ha una scadenza complessiva di 15 secondi.
- Cambio di scelta: la notifica al progetto **si attende** prima della risposta. Vedi la scheda [0023](./0023-notifica-attesa.md).
- "Riprova" prende la riga con una sola `UPDATE … RETURNING` atomica, al massimo 3 tentativi compreso il primo invio, con almeno 30 secondi tra l'uno e l'altro (analisi, sezione 10.3).
- C'è un solo account Gmail: il suo blocco è un rischio accettato.
- Cambio di scelta: il `request_id` lo genera il server quando mostra il modulo. Vedi la scheda [0024](./0024-request-id-dal-server.md).
