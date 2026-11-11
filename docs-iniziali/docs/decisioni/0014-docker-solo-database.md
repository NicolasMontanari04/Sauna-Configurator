# 0014. Solo PostgreSQL in Docker, applicazione fuori dal container

- **Stato:** Accettata
- **Sostituisce:** [0002](./0002-docker-al-posto-di-supabase.md)

## Contesto
Il tutor ha indicato Postgres in un container Docker e chiesto di abbandonare Supabase. La 0002 prevedeva anche l'applicazione in Docker per la demo. Gli sviluppatori non hanno esperienza di Docker e la demo gira sul portatile di uno dei due.

## Decisione
Solo PostgreSQL gira in Docker (`postgres:17`, volume con nome, healthcheck, porta 5433). L'applicazione gira sul computer, sia in sviluppo (`npm run dev`) sia nella demo. `npm run demo` avvia il database, applica migrazioni e seed, cancella le righe scadute, compila e avvia l'applicazione ed esegue il controllo preliminare.

## Motivi
Indicazione del tutor; nessun account o limite; ogni sviluppatore ha il proprio database con lo stesso schema e gli stessi dati iniziali. Mettere Next.js in un container (build standalone, variabili d'ambiente, `drizzle-kit` assente dall'immagine di produzione, moduli nativi per la conversione SVG e i font) costerebbe molto senza un beneficio per una demo locale.

## Conseguenze
Sul computer della demo servono Node.js e Docker Desktop con WSL2. Il Dockerfile dell'applicazione è fuori dal progetto.

## Come è stato verificato
Da annotare: cosa è stato provato di Docker su entrambi i portatili.

## Ripiego
`npm run db:reset` ricrea il database da zero.

## Alternative considerate
- Supabase (abbandonato: richiede un account e va in pausa dopo circa una settimana di inattività).
- Applicazione in Docker anche per la demo (scartata per i motivi sopra).

## Nota del 2026-11-11

Precisazione dopo la revisione dell'analisi v6; la scelta non cambia.

- La sequenza di `npm run demo` è quella della sezione 7 dell'analisi: il controllo preliminare viene prima di `next start`; database, migrazioni e prodotti caricati sono bloccanti, Gmail e la conversione di prova sono avvisi. Le righe `pending` vecchie diventano `failed` e le notifiche `failed` si rimandano prima dell'avvio.
- L'applicazione ascolta solo su `127.0.0.1` (`next start -H 127.0.0.1`, `next dev -H 127.0.0.1`) e la porta del database è pubblicata solo su `127.0.0.1:5433`.
- Tra gli avvisi del controllo preliminare c'è anche la presenza delle texture; solo database e migrazioni e prodotti caricati sono bloccanti (analisi, sezione 10.5).
