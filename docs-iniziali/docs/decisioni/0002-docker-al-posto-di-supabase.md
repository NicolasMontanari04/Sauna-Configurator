# 0002. PostgreSQL in Docker al posto di Supabase

- **Stato:** Sostituita da [0014](./0014-docker-solo-database.md)
- **Note:** Sostituisce la scelta iniziale (database su Supabase)

## Contesto
Il tutor ha indicato Postgres in un container Docker e chiesto di abbandonare Supabase. Docker è stato installato e verificato su entrambi i portatili.

## Decisione
Il database gira in Docker. In sviluppo l'applicazione gira sul computer e solo il database in Docker; per la demo un solo comando avvia tutto.

## Motivi
Indicazione del tutor; nessun account o limite; ogni sviluppatore ha il proprio database con stesso schema e stessi dati iniziali.

## Alternative considerate
Supabase (abbandonato: richiede un account e va in pausa dopo circa una settimana di inattività).
