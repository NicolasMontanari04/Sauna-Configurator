# 0003. ORM Drizzle

- **Stato:** Accettata
- **Note:** Sostituisce l'ipotesi iniziale di Prisma

## Contesto
Serve gestire migrazioni e tipi in due sviluppatori; SQL è già noto.

## Decisione
Si usa Drizzle con lo schema scritto in TypeScript.

## Motivi
Genera le migrazioni, deriva i tipi dallo schema, resta vicino all'SQL ed è leggero.

## Alternative considerate
SQL puro (migrazioni e tipi da gestire a mano), Prisma (nasconde di più l'SQL).
