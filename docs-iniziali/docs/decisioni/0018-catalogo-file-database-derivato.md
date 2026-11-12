# 0018. Catalogo come file JSON, database derivato

- **Stato:** Accettata; sostituita in parte da [0022](./0022-seed-sincronizzazione-catalogo.md) (seed e lettura del catalogo) e da [0027](./0027-niente-regole-ne-optional.md) (regole e optional nei file)
- **Note:** Raccoglie le decisioni P1 e P3 dell'analisi v6

## Contesto
Il catalogo è inserito a mano dai due sviluppatori, prodotto per prodotto. Marko deve lavorare sull'interfaccia prima che il database sia pronto. Il database deve contenere il catalogo per i vincoli e per le pagine, e le configurazioni salvate non devono dipendere dal catalogo attuale. Il sito effe.it riporta versioni, dimensioni e materiali, ma non optional né regole di compatibilità.

## Decisione
- **Fonte del catalogo:** un file JSON per prodotto in `data/prodotti/<codice>.json`, versionato in Git.
- **Validazione:** uno schema Zod in `src/contratti/` valida ogni file; un file sbagliato fa fallire il seed.
- **Codici** in minuscolo, senza spazi né accenti (`rovere`, `wenge`); etichette in italiano con gli accenti.
- **Seed:** carica i file nel database con un upsert per codice, mai con una cancellazione totale.
- **Interfaccia:** importa gli stessi file finché il database non è pronto; sono il "catalogo finto" del contratto.
- **Configurazioni salvate:** `product_code` senza chiave esterna verso il catalogo e snapshot delle scelte in JSONB.
- **Dati con fonte (P3):** nessun dato inventato. Optional e regole di compatibilità entrano solo se una fonte li documenta (sito, listino, documenti forniti dal tutor). Ogni file indica la fonte e la data di consultazione.
- La prima bozza è `data/prodotti/aladdin.json`, raccolta dal sito il 2026-11-11; i campi che iniziano con `_` sono annotazioni della bozza e si tolgono prima del seed.

## Motivi
- Un file per prodotto divide il lavoro di inserimento senza conflitti di merge.
- JSON si legge senza compilazione sia dal seed sia dall'interfaccia, e Zod dà errori chiari.
- I vincoli del database sono la seconda difesa dopo Zod e garantiscono l'integrità anche per i dati scritti dall'applicazione.
- L'upsert non perde le configurazioni salvate.
- Senza chiave esterna rigida, un prodotto tolto dal catalogo non blocca né cancella le configurazioni già salvate.
- Inventare optional o regole farebbe passare per catalogo dati che non lo sono.

## Conseguenze
- Il catalogo esiste in due posti, file e database; i file sono la fonte e il database va sempre ricostruito dal seed, mai modificato a mano.
- Il motore delle regole va provato con test automatici su un catalogo di prova, perché il catalogo reale potrebbe non avere regole.
- Ogni prodotto mostra solo i gruppi che la fonte documenta.

## Come è stato verificato
Bozza di Aladdin valida come JSON. Da completare: schema Zod nella PR del contratto e seed della fase 3.

## Ripiego
`npm run db:reset` ricrea il database dai file.

## Alternative considerate
- Catalogo solo nel database, inserito con un'interfaccia di amministrazione: più lavoro e nessun vantaggio per due sviluppatori.
- Catalogo solo nei file, senza database: più semplice, ma senza vincoli né query, e contro l'indicazione del tutor.
- File TypeScript: tipi e commenti nel file, ma il seed deve compilarli.
- File YAML: commenti, ma una dipendenza in più e ambiguità sui tipi.
- Optional e regole del mockup come esempi dichiarati: scartati, sono dati inventati.

## Nota del 2026-11-11

Dopo la revisione dell'analisi v6 il seed e la lettura del catalogo sono cambiati: è un cambio di scelta, registrato nella scheda [0022](./0022-seed-sincronizzazione-catalogo.md). Le righe "Seed" e "Interfaccia" della Decisione sono superate da quella scheda.
- Le chiavi che iniziano con `_` non si tolgono a mano: le scarta lo schema Zod, che per il resto è `.strict()` (analisi, P1).

## Nota del 2026-11-11 (risposte del tutor)

- Non esiste una fonte per optional e regole di compatibilità: nessun prodotto ha optional, e il motore delle regole si prova solo sul catalogo di prova finché un dato verificabile non documenta una regola.
- Le schede di preinstallazione dell'Area Pro si possono usare per ricavare dimensioni e vincoli, solo sul computer locale e fuori dal repository.
