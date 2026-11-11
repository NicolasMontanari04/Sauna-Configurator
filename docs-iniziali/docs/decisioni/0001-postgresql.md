# 0001. Database relazionale PostgreSQL

- **Stato:** Accettata
- **Note:** Rivista il 2026-11-11 (analisi v6): riscritti i motivi contro SQLite e MySQL

## Contesto
Il catalogo ha dati strutturati e legati (prodotto, taglio, opzioni, regole) e attributi variabili per prodotto.

## Decisione
Si usa PostgreSQL. Gli attributi particolari di un prodotto stanno in colonne JSONB.

## Motivi
Vincoli e integrità garantiti dal database; JSONB indicizzabile dà flessibilità; stesso motore offerto dai servizi online.

## Alternative considerate
- MySQL: valida, ma con supporto JSON meno completo e vincoli `CHECK` applicati solo dalla versione 8.0.16.
- SQLite: adatto a un prototipo, ma il tutor ha indicato un database in Docker, non ha JSONB né lo stesso supporto ai vincoli, e non è lo stesso motore di un database online. La condivisione non è un motivo: anche con PostgreSQL ogni sviluppatore ha il proprio database.
- MongoDB: relazioni e regole controllate dal codice, migrazioni poco supportate.

## Nota del 2026-11-11

Precisazione dopo la revisione dell'analisi v6; la scelta non cambia.

- SQLite ha i tipi JSON/JSONB; le differenze reali sono l'assenza di indici GIN e le chiavi esterne da attivare a ogni connessione (`PRAGMA foreign_keys`). I motivi principali del rifiuto restano l'indicazione del tutor e lo stesso motore di un database online (analisi, sezione 6.6).
