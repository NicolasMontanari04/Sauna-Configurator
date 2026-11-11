# 0007. Privacy: finalità, conservazione e cancellazione

- **Stato:** Proposta (base giuridica e informativa da confermare con il tutor)
- **Note:** Rivista il 2026-11-11 (analisi v6): stato corretto da "Accettata" a "Proposta", base giuridica proposta, conservazione precisata

## Contesto
Il titolare è una persona fisica nell'ambito di un progetto di tirocinio; si raccolgono email e configurazione. Durante la demo il tutor inserisce un indirizzo vero.

## Decisione
- Finalità: inviare il riepilogo richiesto e conservare la richiesta per la dimostrazione e la verifica del funzionamento del progetto.
- Base giuridica proposta: art. 6(1)(b) GDPR (risposta a una richiesta dell'interessato).
- Presa visione dell'informativa, di cui si salvano data e versione; nessun consenso commerciale.
- Conservazione 12 mesi: colonna `expires_at`, letture che ignorano le righe scadute, cancellazione all'avvio della demo e a mano. Nessun processo periodico.
- Cancellazione su richiesta con lo stesso script e un parametro email.
- Email nella casella del progetto: procedura manuale documentata, perché Gmail non cancella per età.

## Motivi
Rispetto della normativa con la minima raccolta di dati.

## Alternative considerate
Consenso al ricontatto (escluso); pulizia periodica con uno scheduler (scartata: Next.js non ha uno scheduler e un'estensione come `pg_cron` violerebbe le regole di migrabilità).

## Nota del 2026-11-11

Precisazione dopo la revisione dell'analisi v6; la scelta non cambia.

- I titolari sono i due sviluppatori, come contitolari; le basi giuridiche proposte sono l'art. 6(1)(b) per l'invio del riepilogo e l'art. 6(1)(f) per la conservazione (analisi, sezione 12).
