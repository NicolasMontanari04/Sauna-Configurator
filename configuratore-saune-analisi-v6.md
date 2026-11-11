# Configuratore di saune: analisi e scelte tecniche (v6)

Questa versione unisce l'analisi v5 e la revisione del brainstorm EGM (`concepts_brief.md`) in un solo documento di riferimento; entrambi i file sono superati e conservati solo come storico in `archivio/`. Dove i testi erano in contrasto vale quanto scritto qui. Le modifiche rispetto alla v5 sono elencate nella sezione 23.

---

## 1. Contesto e vincoli

- Il progetto è una **demo di tirocinio**: non è prevista una pubblicazione e l'azienda non lo userà.
- **Non c'è un voto.** Alla consegna contano il funzionamento e la motivazione delle scelte. La qualità grafica è una priorità degli sviluppatori.
- **L'invio reale del PDF per email è un requisito** e non si può togliere.
- Il numero di prodotti è "il più possibile", ma la dimensione del catalogo non è ancora nota (censimento, sezione 9.2).
- Il tempo è limitato e gli sviluppatori sono due: Nicolas (N) e Marko (M).
- La demo gira su uno dei due portatili degli sviluppatori, entrambi preparati allo stesso modo. Durante la demo il tutor inserisce un indirizzo email vero.

---

## 2. Obiettivo e decisioni prese

**Problema.** Sul sito effe.it il cliente vede ogni sauna solo nelle versioni fotografate e non può vedere insieme le combinazioni di taglio, essenza e pedana. Il tirocinio deve dimostrare che un configuratore web può mostrare queste combinazioni e mandare al cliente un riepilogo, con scelte tecniche motivate.

Un configuratore web, in **Next.js + React**, per le saune del catalogo effe.it. Il cliente sceglie modello, taglio, materiali e optional e vede un'anteprima che cambia in tempo reale. Con il pulsante "Ricevi il riepilogo" la configurazione viene salvata nel database, il cliente riceve per email il **riepilogo in PDF** e l'email del progetto riceve una notifica. **La configurazione si salva solo insieme alla richiesta del riepilogo**: non esiste un salvataggio senza email.

Ogni decisione ha la sua scheda nel [registro delle decisioni](docs-iniziali/docs/decisioni/README.md), con le alternative scartate e i motivi. Finché il repository non esiste le schede stanno in `docs-iniziali/docs/decisioni/`, poi in `docs/decisioni/` (sezione 19).

| Tema | Decisione | Scheda |
|---|---|---|
| Database | PostgreSQL con colonne JSONB per gli attributi particolari | 0001 |
| Esecuzione | Solo PostgreSQL in Docker; l'applicazione gira direttamente sul computer | 0014 (sostituisce 0002) |
| ORM | Drizzle, non SQL puro e non Prisma | 0003 |
| Applicazione | Next.js con Server Action e Route Handler, Zod, shadcn/ui | 0019 |
| Catalogo | File JSON nel repository, caricati nel database dal seed | 0018 |
| Regole | Una sola funzione `valuta` usata da interfaccia e server | 0020 |
| Salvataggio | Un solo pulsante: salva nel database, invia il PDF al cliente, notifica il progetto; la riga salvata registra lo stato di ogni invio | 0006 |
| Email | Nodemailer con un Gmail dedicato; Mailpit in sviluppo | 0017 |
| PDF | Impaginato sul server con PDFKit; l'SVG si converte in PNG con `@resvg/resvg-js`; ripiego a colori pieni | 0015 (da confermare con la prova) |
| Ricontatto | Nessun ricontatto dei clienti, nessun consenso commerciale | 0007 |
| Privacy | Presa visione dell'informativa; conservazione 12 mesi con scadenza in una colonna; cancellazione su richiesta | 0007 |
| Cookie | Nessun cookie e nessuna risorsa esterna caricata nel browser | 0008 |
| Accessibilità | WCAG 2.1 livello AA sulle pagine del flusso, usabile da tastiera; il PDF per ora non deve essere accessibile | 0009 |
| Grafica | Viste SVG da parametri con texture del catalogo per le famiglie di layout supportate; per gli altri prodotti le immagini ufficiali del sito con i campioni dei materiali | 0010, 0016 (da verificare nella fase 3) |
| Lingua | Solo italiano | 0011 |
| Migrabilità | Regole di progetto che non precludono un database online (sezione 13) | 0012 |
| Git | Organizzazione del repository | 0013 |
| Esclusioni | Prezzi e intelligenza artificiale fuori dal progetto (sezione 21) | 0004, 0005 |

**Alternative scartate, in sintesi** (motivi nelle schede):
- Database, ORM ed esecuzione: MySQL, SQLite, MongoDB, SQL puro, Prisma, applicazione in Docker, Supabase (sezioni 6 e 7).
- Applicazione: Vite con un backend separato; solo Route Handler (API REST); stato nei segmenti del percorso (0019).
- Catalogo: solo nel database con un'interfaccia di amministrazione; solo nei file, senza database; file TypeScript o YAML (0018).
- Regole: nascondere le scelte incompatibili; lasciarle selezionabili con un errore; vincoli solo nel database (0020).
- Email: servizi transazionali (Resend, SendGrid, Mailgun); notifica in copia nascosta (0017).
- PDF: `@react-pdf/renderer`, jsPDF, Playwright o Puppeteer, conversione dell'immagine nel browser (0015, sezione 11).

Le esclusioni (prezzi, intelligenza artificiale, 3D, applicazione in Docker e le altre) sono raccolte nella sezione 21; i rischi e le mitigazioni nella tabella della sezione 20.1.

---

## 3. Glossario

| Termine | Significato |
|---|---|
| **Effe / effe.it** | L'azienda produttrice e il suo sito, da cui provengono catalogo, immagini e texture |
| **Prodotto** (o modello) | Una sauna del catalogo, ad esempio Aladdin. Nel codice si usa sempre `product` |
| **Taglio** | Una misura del prodotto, con codice ed etichetta, ad esempio Aladdin 60 (200 × 160 × 210 cm; l'ordine delle misure è da verificare, appendice A). Nel codice `size` |
| **Versione** | Una combinazione di taglio ed essenza con una propria foto ufficiale sul sito, ad esempio "Aladdin Rovere 60" |
| **Gruppo di opzioni** | Una scelta da fare, ad esempio Essenza o Pedana in gres. Può essere a scelta singola (`single`) o multipla (`multi`) |
| **Valore di opzione** | Una delle alternative di un gruppo, ad esempio Rovere rigatino |
| **Essenza** | Il legno della sauna. Nel codice il gruppo si chiama `wood` |
| **Optional** | Accessori aggiuntivi a scelta multipla. Nel codice `extras` |
| **Materiale** | Legno, alluminio, gres o specchio, con colore e texture |
| **Regola** | Un vincolo di compatibilità tra scelte (`requires`, `excludes`, `only_with_size`) |
| **Sequenza del fronte** | L'ordine dei pannelli della parete frontale (vetro, legno, porta) |
| **Famiglia di layout** | Un gruppo di prodotti con la stessa forma, le stesse panche e lo stesso tipo di fronte, che il generatore disegna con le stesse primitive |
| **Snapshot** | La copia delle scelte, con le loro etichette, salvata nella riga della configurazione |
| **Area Pro** | L'area riservata di effe.it con i file 3D e 2D (DWG, FBX, SKP) |
| **Tutor** | Il referente del tirocinio: ha dato le indicazioni sul progetto e valuta la demo. Le indicazioni citate nel documento (Docker, prezzi e IA fuori dal progetto, uso delle immagini del sito) sono state date a voce, non per iscritto |
| **Livello A / livello B** | I due modi di mostrare un prodotto: A con viste SVG generate, B con la foto ufficiale e i campioni dei materiali (sezione 9.2) |
| **Contratto condiviso** | Tipi, schemi e funzioni comuni fissati all'inizio dai due sviluppatori in una sola pull request (sezione 15.2) |
| **Fase** | Una delle dieci tappe del lavoro, numerate da 1 a 10 (sezione 15.5) |
| **P1–P15** | Le decisioni sui punti aperti prese il 2026-11-11 (sezione 20.3) |
| **Seed** | Lo script che carica i file del catalogo nel database (sezione 8.2) |
| **Scheletro** | La prima versione che funziona dall'inizio alla fine con Aladdin (fase 3) |
| **Blocco delle funzioni** | La fase 7, da cui non si aggiungono funzioni nuove; lo schema del database è già bloccato dalla fine della fase 4 |
| **Vista frontale, vista diagonale** | Le due viste esterne del generatore (sezione 9.1) |

---

## 4. Requisiti

**Funzionali**
- **RF1.** Il cliente sceglie prodotto, taglio, materiali e, dove il catalogo li prevede, optional.
- **RF2.** L'anteprima si aggiorna a ogni scelta.
- **RF3.** Le scelte incompatibili sono bloccate nell'interfaccia con un messaggio. Il server rifiuta una combinazione non valida anche se arriva da un URL modificato a mano.
- **RF4.** Lo stato delle scelte sta nell'URL, che si può copiare e condividere.
- **RF5.** "Ricevi il riepilogo" salva la configurazione, invia al cliente il PDF e notifica l'email del progetto.
- **RF6.** Se l'invio fallisce, il cliente vede un messaggio che dice che l'email non è partita e indica una di queste cause: server di posta non raggiungibile, accesso all'account rifiutato, tempo scaduto, indirizzo rifiutato. Il messaggio offre "Scarica il PDF" e, se restano tentativi, "Riprova", che non crea una seconda configurazione.
- **RF7.** Le configurazioni scadono dopo 12 mesi e si possono cancellare su richiesta.

**Non funzionali**
- **RNF1.** WCAG 2.1 AA sulle pagine del flusso, uso completo da tastiera.
- **RNF2.** Nessun cookie e nessuna risorsa esterna caricata nel browser.
- **RNF3.** Avvio della demo da clone pulito con `npm ci` e `npm run demo`, una volta copiato il file `.env` e soddisfatti i prerequisiti della sezione 7.
- **RNF4.** Il risultato dell'invio è visibile entro 60 secondi.
- **RNF5.** Solo italiano.

---

## 5. Cosa deve gestire il database

1. **Opzioni eterogenee.** Ogni prodotto ha tagli, materiali e accessori diversi. Un modello a colonne fisse non regge.
2. **Dati strutturati e legati tra loro.** Prodotto → tagli → gruppi di opzioni → valori → materiali, con regole di compatibilità tra scelte.
3. **Configurazioni salvate che non cambiano nel tempo.** Le scelte salvate e le loro etichette restano identiche anche se il catalogo viene modificato. L'immagine del PDF, invece, si ridisegna con il catalogo attuale (sezione 11).
4. **Stato degli invii.** Per ogni configurazione si registra se l'invio al cliente e la notifica al progetto sono riusciti.
5. **Conservazione limitata.** Email e configurazione si conservano per 12 mesi e si possono cancellare su richiesta.
6. **Migrabilità.** Lo stesso schema deve poter passare da un container Docker a un database online (sezione 13).

---

## 6. Scelta del DBMS

### 6.1 Cos'è un DBMS relazionale

Un **DBMS** (Database Management System) è il programma che memorizza i dati e permette di leggerli e modificarli in modo sicuro. In uno **relazionale** i dati stanno in tabelle di righe e colonne, collegate tra loro da relazioni, e si interrogano con **SQL**. Un taglio, ad esempio, contiene il codice del prodotto a cui appartiene (*chiave esterna*), e il collegamento è garantito dal database, non dal codice.

Le garanzie principali sono quattro:
- **Schema con tipi.** Ogni colonna ha un tipo e il database rifiuta valori sbagliati.
- **Integrità.** Chiavi esterne e vincoli (`UNIQUE`, `NOT NULL`, `CHECK`) impediscono dati incoerenti.
- **Transazioni.** Un gruppo di operazioni sul database riesce tutto insieme o non riesce affatto.
- **Join.** Più tabelle si combinano in una sola query.

### 6.2 Decisione

**PostgreSQL**, in un container **Docker**, con **Drizzle** come ORM.

### 6.3 Criteri di valutazione

| Criterio | Perché conta qui |
|---|---|
| Adatto a dati relazionali con regole | Prodotti, tagli, opzioni e regole sono entità legate |
| Dati variabili per prodotto | Le opzioni cambiano da sauna a sauna |
| Esecuzione in Docker | Indicazione del tutor |
| Parità con un servizio online | Non è prevista una pubblicazione, ma la scelta non deve precluderla |
| Lavoro in due, migrazioni | Schema condiviso, versionato, riproducibile |
| Costo e gestione | Gratuito, poco da configurare |

### 6.4 Confronto

| Criterio | PostgreSQL | MySQL | SQLite | MongoDB |
|---|---|---|---|---|
| Dati relazionali e vincoli | Chiavi esterne, `UNIQUE`, `CHECK` | Chiavi esterne, `UNIQUE`; `CHECK` solo dalla 8.0.16 | Chiavi esterne da attivare con `PRAGMA`, `CHECK` | Nessuna chiave esterna tra collezioni |
| Dati variabili per prodotto | JSONB con indici GIN | JSON, indici solo su colonne generate o multi-valore | JSON/JSONB, senza indici GIN | Documenti nativi |
| Esecuzione in Docker | Immagine ufficiale | Immagine ufficiale | Non serve: è un file | Immagine ufficiale |
| Parità con un servizio online | Stesso motore offerto da molti fornitori | Offerto da molti fornitori | Un file locale, non un servizio | Servizio gestito dal produttore |
| Lavoro in due, migrazioni | Drizzle Kit | Drizzle Kit | Drizzle Kit | Migrazioni dichiarative poco supportate |
| Giudizio | **Scelto** | Alternativa valida | Adatto a un prototipo locale; escluso dall'indicazione del tutor | Sconsigliato |

### 6.5 Motivazioni della scelta

1. **Il dominio è relazionale.** Il catalogo è un insieme di entità legate: un valore appartiene a un gruppo, un gruppo a un prodotto, una regola collega due scelte. PostgreSQL le fa rispettare con chiavi esterne, vincoli di unicità e `CHECK`: non si può salvare un'opzione per un prodotto inesistente né due tagli con lo stesso codice. I file del catalogo sono già validati con Zod prima del seed (sezione 8.2); i vincoli del database sono la seconda linea di difesa sulle colonne relazionali.
2. **Le opzioni eterogenee non richiedono di uscire dal modello relazionale.** Gruppi e valori di opzione sono tabelle generiche, uguali per tutti i prodotti. Gli attributi davvero particolari di un singolo prodotto (ad esempio la posizione della stufa o i parametri delle viste) stanno in una colonna **JSONB**, che PostgreSQL può interrogare e, se servisse, indicizzare. Il contenuto delle colonne JSONB non è controllato dai vincoli del database: lo valida Zod prima della scrittura.
3. **La configurazione salvata è uno snapshot.** Alla richiesta si salva in una colonna JSONB l'elenco delle scelte con le loro etichette. Un cambio successivo del catalogo non altera le scelte e le etichette già salvate. L'invio delle email avviene **fuori** da qualsiasi transazione, perché un invio SMTP non si può annullare: la riga si salva prima, e lo stato di ogni invio si aggiorna dopo (sezione 10.2).
4. **Non c'è dipendenza da un fornitore.** PostgreSQL è uno standard offerto da molti servizi online; le regole della sezione 13 servono a non precludere il passaggio.
5. **È adatto al lavoro in due.** Schema, migrazioni e dati iniziali sono file nel repository: chi clona o aggiorna il progetto ricostruisce lo stesso database.

### 6.6 Perché non le alternative

- **MySQL.** Il modello relazionale andrebbe benissimo e la scelta sarebbe difendibile. Non offre però vantaggi rispetto a PostgreSQL per questo progetto: il supporto ai dati JSON è meno completo (il tipo JSON non ha un equivalente diretto degli indici GIN di JSONB) e i vincoli `CHECK` sono applicati solo dalla versione 8.0.16.
- **SQLite.** Ottimo per un prototipo locale. Non è stato scelto perché il tutor ha indicato un database in Docker e perché il database usato in sviluppo deve essere lo stesso motore di un eventuale database online. Le differenze tecniche sono minori: SQLite non ha indici GIN per i dati JSON e le chiavi esterne vanno attivate a ogni connessione (`PRAGMA foreign_keys`). Non conta invece la condivisione: anche con PostgreSQL ogni sviluppatore ha il proprio database locale.
- **MongoDB.** È tentante per le opzioni variabili, ma il catalogo ha molte relazioni e regole che in MongoDB andrebbero controllate dal codice, non dal database. Le migrazioni dichiarative sono poco supportate e la flessibilità che offre si ottiene già con JSONB.

### 6.7 Perché Drizzle e non SQL puro

Un ORM non è obbligatorio se conosciamo SQL. Con l'SQL puro (`postgres.js` o `pg`) il progetto sarebbe fattibile. Il rischio concreto, però, non sono le query: sono **migrazioni** e **tipi**.

- **Migrazioni.** Una migrazione è un file che descrive una modifica alla struttura del database, da applicare in ordine. In due, con due database separati, servono per tenere gli schemi uguali. Lo schema è scritto in TypeScript e Drizzle Kit genera i file di migrazione, versionati in Git; l'altro sviluppatore li applica con un comando. Con SQL puro servirebbero file numerati a mano e uno script che li applichi in ordine, con il rischio di conflitti quando in due si modifica lo schema.
- **Tipi.** I tipi TypeScript derivano dallo schema: un errore su un nome di colonna si vede mentre si scrive. Con SQL puro andrebbero scritti e mantenuti a mano, e gli errori emergerebbero solo a runtime.
- **Resta vicino all'SQL.** Le query somigliano all'SQL e, quando serve, si scrive SQL direttamente dentro lo stesso codice.
- **Leggero.** Pesa poco e non richiede un motore separato.

**Prisma** era l'ipotesi iniziale. È stato rivalutato e scartato: è più guidato, ma nasconde di più l'SQL, e dato che SQL lo conosciamo il vantaggio non compensa.

La scelta non è vincolante: le migrazioni generate sono file SQL e restano utilizzabili anche senza Drizzle; le query andrebbero invece riscritte.

---

## 7. Docker e lavoro in due

**Decisione:** solo PostgreSQL gira in Docker, come indicato dal tutor. L'applicazione gira direttamente sul computer, sia in sviluppo sia nella demo. Mettere anche Next.js in un container (build standalone, variabili d'ambiente, `drizzle-kit` che è una devDependency e manca nell'immagine di produzione, attesa del database, moduli nativi per la conversione SVG e i font) costerebbe molto a chi non ha esperienza di Docker, senza un beneficio per una demo sul proprio portatile. L'ipotesi iniziale, Supabase, è stata sostituita da PostgreSQL in Docker (schede 0002 e 0014).

**Come si usa**
- Il file `docker-compose.yml` nel repository descrive solo il database:
  - immagine `postgres:17`, con la versione maggiore fissata;
  - volume con nome, così i dati sopravvivono al riavvio del container;
  - healthcheck, così i comandi successivi aspettano che il database sia pronto;
  - porta 5433 sul computer, pubblicata solo su `127.0.0.1` (`127.0.0.1:5433:5432`): non entra in conflitto con un PostgreSQL già installato e il database non è raggiungibile dalla rete.
- **Durante lo sviluppo:** `docker compose up -d`, poi `npm run dev` (`next dev -H 127.0.0.1`).
- **Per la demo:** `npm run demo` esegue, in quest'ordine:
  1. `docker compose up -d --wait`, migrazioni e seed;
  2. cancellazione delle righe scadute;
  3. le righe rimaste `pending` da più di 2 minuti diventano `failed` (sezione 10.3);
  4. `next build`;
  5. controllo preliminare (sezione 10.5). Database, migrazioni e prodotti caricati sono **bloccanti**: un FAIL ferma l'avvio. Gmail, la conversione di prova e la presenza delle texture sono **avvisi**: il FAIL si stampa ma l'avvio continua, così in caso di guasto resta il ripiego "Scarica il PDF";
  6. se il controllo di Gmail è OK, un nuovo tentativo per ogni notifica `failed` che ha ancora tentativi disponibili;
  7. `next start -H 127.0.0.1`.
- Ogni sviluppatore ha **il proprio database locale**: stessi schema e stessi dati iniziali (migrazioni e seed nel repository), ma non le stesse configurazioni salvate.
- `npm run db:reset` ricrea il database da zero: è il ripristino in caso di problemi.
- Le credenziali (Gmail, connessione) stanno in un file `.env` mai caricato su GitHub; nel repository c'è `.env.example`. Su un altro computer il file si copia a mano. `.env.example` contiene:
  - `DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5433/configuratore`;
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`: in sviluppo `127.0.0.1`, `1025`, `false` e utente e password vuoti (Mailpit, senza TLS né autenticazione); per la demo `smtp.gmail.com`, `465`, `true`, l'account e la password per le app;
  - con `SMTP_USER` vuoto il codice omette `auth`; `SMTP_SECURE` si converte da stringa a booleano;
  - `MAIL_FROM` e `PROJECT_EMAIL` (email del progetto, sezione 20.5);
  - `ENABLE_GALLERY`, impostata a `true` nella demo (P6).

**Prerequisiti su Windows, da verificare su entrambi i portatili:** WSL2 e virtualizzazione attivi, Docker Desktop avviato, porta 5433 libera. Attenzione: `docker compose down -v` cancella il volume e quindi tutti i dati.

**Immagini.** Non vanno nel database: texture e foto ufficiali stanno nella cartella `public/` del repository, in formato ottimizzato.

---

## 8. Modello dati

### 8.1 Tabelle

| Tabella | Contenuto |
|---|---|
| `product` | `code`, `name`, `designer`, `description`, `viewer` (`svg` o `image`), `default_size`, `fixed_zones` JSONB (zona → materiale), `photos` JSONB (versione → percorso), `photo_group` (codice del gruppo che cambia la foto, nullabile), `geometry` JSONB (parametri delle viste, se presenti), `source` JSONB |
| `product_size` | prodotto, `code`, `label`, `width_cm`, `depth_cm`, `height_cm`, `attributes` JSONB (parametri della geometria che cambiano con il taglio); unico per (prodotto, `code`) |
| `material` | `code` unico in tutto il catalogo, `name`, `type` (`wood`, `aluminium`, `ceramic`, `mirror`), `color`, `texture` |
| `option_group` | prodotto, `code`, `label`, `type` (`single` o `multi`), `step`, `zones`, `default_value`; unico per (prodotto, `code`) |
| `option_value` | gruppo, `code`, `label`, materiale collegato (facoltativo), `attributes` JSONB; unico per (gruppo, `code`) |
| `option_rule` | prodotto, `type` (`requires`, `excludes`, `only_with_size`), `from_value_id` (chiave esterna verso `option_value`), `to_value_id` (nullabile, chiave esterna verso `option_value`), `sizes` (`text[]`, nullabile), `message` obbligatorio; un `CHECK` richiede `to_value_id` per `requires` ed `excludes` e `sizes` per `only_with_size` (P2) |
| `configuration` | vedi sotto |

La tabella `configuration` contiene:
- `id`; il `number` della configurazione (formato `AAAA-NNNNNN`, P5 nella sezione 20.3) non è una colonna, ma si calcola in lettura dall'anno di creazione e dall'`id`;
- `token`, casuale e unico, usato negli URL di conferma, "Riprova" e "Scarica il PDF" (P4);
- `request_id`, UUID generato dal server quando mostra il modulo e inviato in un campo nascosto (così funziona anche senza JavaScript), unico, contro i doppioni da doppio clic (P4);
- data di creazione e `expires_at` (creazione + 12 mesi);
- email del cliente, salvata in minuscolo, così la cancellazione per indirizzo la trova sempre;
- data e versione dell'informativa letta;
- `product_code`, **senza chiave esterna verso il catalogo**, così un prodotto tolto dal catalogo non blocca né cancella le configurazioni già salvate;
- `config` JSONB, lo snapshot con `schemaVersion: 1`;
- `customer_status` e `project_status`, di tipo `pgEnum` con valori `pending`, `sent`, `failed`;
- per ciascuno dei due invii: ultimo errore, numero di tentativi, data dell'ultimo tentativo (`customer_error`, `customer_attempts`, `customer_last_attempt_at` e i corrispondenti `project_…`).

Non ci sono tabelle per prezzi, promozioni o IVA.

Esempio di `config`:

```json
{
  "schemaVersion": 1,
  "product": "aladdin", "productName": "Aladdin", "size": "60",
  "selections": { "wood": "rovere", "floor": "moka" },
  "lines": [
    { "group": "Taglio", "label": "Aladdin 60 (200 × 160 × 210 cm)" },
    { "group": "Essenza", "label": "Rovere rigatino" },
    { "group": "Pedana a pavimento in gres (120 × 120 × 5 cm)", "label": "Gres Masterpiece Moka" }
  ]
}
```

Le etichette sono quelle del catalogo; per il taglio si aggiungono le misure. Lo snapshot contiene solo i gruppi del prodotto. Un valore senza materiale, come "Nessuna pedana", compare comunque nelle `lines`. Il taglio sta fuori da `selections` perché ha una tabella propria; nell'URL usa comunque la chiave `size` come i gruppi (P7). `productName` serve all'oggetto dell'email e all'intestazione del PDF anche se il prodotto esce dal catalogo.

I nomi delle colonne seguono i campi dei file JSON (P1), passando dal camelCase del JSON allo snake_case delle colonne; `default` diventa `default_value` perché `default` è una parola riservata in SQL. `step` è il numero del passaggio del configuratore in cui compare il gruppo, `zones` sono le zone dell'SVG a cui il gruppo applica il materiale, `default_value` è il valore predefinito (P2). Più file possono dichiarare lo stesso materiale: il seed fallisce se due file usano lo stesso `code` con dati diversi. Le colonne del database e i campi dei file del catalogo sono in inglese, e così le chiavi che li riprendono nei tipi (`group`, `value`); i nomi di funzioni, file e cartelle del progetto sono in italiano; le etichette mostrate al cliente sono in italiano. Tipi, chiavi e vincoli definitivi si fissano nel contratto condiviso (sezione 15.2) e poi si documentano in `docs/modello-dati.md`.

### 8.2 Catalogo come file, database derivato

Ogni prodotto è un file in `data/prodotti/` con tagli, opzioni, regole e parametri delle viste. I file sono la **fonte** del catalogo; dalla fase 3 l'applicazione legge **solo dal database**:
- fino allo scheletro (fase 3) Marko importa i file direttamente nell'interfaccia, come "catalogo finto"; dalla fase 3 il configuratore riceve il prodotto dal server, letto dal database, e il server applica `valuta` con le stesse regole;
- il seed di Nicolas valida tutti i file con Zod **prima** di scrivere: un file sbagliato fa fallire il seed e il database non cambia;
- poi **sincronizza** le tabelle del catalogo in una sola transazione: inserisce, aggiorna e cancella, così il database coincide con i file. Le chiavi esterne del catalogo sono `RESTRICT`: si cancellano prima le regole, poi i valori, i gruppi, i tagli e i prodotti; un materiale si cancella solo se nessun file lo dichiara più. Se un passo fallisce, la transazione si annulla. La tabella `configuration` non si tocca e non ha chiavi esterne verso il catalogo (sezione 8.1), quindi le configurazioni salvate non si perdono.

Dopo ogni modifica a un file si rilancia il seed (lo fa anche `npm run demo`). Il database serve per i vincoli, per le query delle pagine del catalogo e per le configurazioni salvate. Il lavoro di inserimento si divide per file, senza conflitti.

---

## 9. Grafica

### 9.1 Obiettivo e scelta

**Obiettivo:** immagini grafiche di qualità, non 3D in tempo reale: i modelli 3D dell'Area Pro non possono entrare nel repository e i tempi del tirocinio non bastano per produrne altri. Il 3D è escluso da questa versione. Un'anteprima è accettabile se ogni materiale scelto si riconosce dalla sua texture, le quote si leggono, e forma e proporzioni corrispondono alla foto ufficiale della versione. Il controllo si fa a vista nella pagina `/galleria` (sezione 18).

**Scelta: viste SVG generate da parametri, con texture reali, per le famiglie di layout supportate.** Ogni sauna è descritta da pochi dati e un generatore unico li trasforma in due viste, entrambe dall'esterno:
- **frontale:** la parete frontale vista di fronte, con la sequenza del fronte (vetro, legno, porta);
- **diagonale:** la sauna vista dall'esterno in prospettiva, da un angolo, così si vedono insieme il fronte e un fianco.

La **pianta** si aggiunge solo se avanza tempo prima del blocco delle funzioni (fase 7), perché è una vista nuova e non una rifinitura. Le viste dall'interno (panche e stufa viste da dentro) sono scartate: cambiano molto da prodotto a prodotto e sono difficili da replicare con il generatore. Dal vetro del fronte le panche si vedono solo in forma semplificata.

**Scelte interne nelle viste esterne.** La vista frontale mostra l'interno attraverso il vetro del fronte, come già fa il mockup di Aladdin: dietro il vetro si vedono l'essenza interna (zona `int`), le panche (`furn`) e la pedana (`floor`), così ogni scelta cambia l'immagine. Nella diagonale l'interno si vede dal vetro del fronte se nella fase 3 M e N, confrontandola con la foto ufficiale, vi riconoscono essenza e pedana; altrimenti il vetro resta opaco e le scelte interne si vedono solo nella frontale.

**Stato.** Il generatore è stato provato solo su Aladdin 60, con i legni Rovere e Wengé e i gres, ed è nel mockup (appendice B). Nel mockup le viste si chiamano "Esterno" e "Interno" (frontale interna): la vista "Esterno" diventa la frontale, "Interno" si toglie, la diagonale è nuova. Che lo stesso generatore funzioni per tutti i prodotti è un'**ipotesi da verificare**: le disposizioni interne cambiano molto (panche lineari, a L o a gradoni, posizione e tipo della stufa, sequenza del fronte). Il costo di un prodotto in più non è noto, perché le 1–2 ore spese su Aladdin comprendono la scrittura del generatore.

### 9.2 Come si riduce il rischio

1. **Censimento del catalogo** (circa 2 ore, nella fase 3): elenco dei prodotti di effe.it raggruppati per famiglia di layout (forma × panche × tipo di fronte), con priorità. Va in `docs/catalogo-inventario.md`.
2. **Geometria come elenco di parti.** `geometry` descrive l'involucro e un elenco ordinato di parti tipizzate:
   - pannelli del fronte;
   - fascia di specchio e frame;
   - panche (la parte visibile dal vetro);
   - stufa (solo per la pianta).

   Campi e valori ammessi sono quelli dello schema della sezione 15.2.

   Il generatore è una piccola libreria di primitive. Un nuovo prodotto della stessa famiglia diventa un file di dati, non codice nuovo. Lo schema Zod della geometria fa parte del contratto.
3. **Secondo prodotto subito.** Nella fase 3 si prova un secondo prodotto con un fronte diverso da Aladdin.
4. **Due livelli di resa:**
   - **Livello A:** viste SVG;
   - **Livello B:** foto ufficiale della versione, con accanto un pannello di campioni delle texture scelte e l'etichetta "anteprima fotografica, materiali indicati a lato". Gli stessi campioni vanno nel PDF.
5. **Regola di decisione.** Se un prodotto richiede più di circa 2 ore di lavoro sul generatore (o mezza giornata per una famiglia nuova), in questa versione usa il livello B.
6. **Misura.** Dopo il secondo prodotto (fase 3) si stima il tempo per prodotto; all'inizio della fase 6 si fissa da quel dato l'obiettivo.

**Alternativa da valutare:** un modello SVG disegnato a mano (Inkscape o Figma) con zone texture nominate. Per un layout molto diverso può essere più veloce e più bello che parametrizzarlo, e il cambio di materiale funziona comunque, perché cambia solo la sorgente del pattern.

### 9.3 Anteprima in tempo reale

Le viste non sono file preparati in anticipo: il numero di combinazioni di prodotto, taglio, materiali e optional esploderebbe, e `next start` serve solo i file presenti in `public/` al momento della build.

- Una **funzione pura** `(geometria, scelte, vista, opzioni) → stringa SVG`, senza DOM, è usata sia dal browser sia dal server (sezione 11). `opzioni` contiene il prefisso degli `id`, `flat` e il modo di includere le texture: percorsi di `public/` nel browser, data URI sul server.
- La geometria dipende da prodotto e taglio (`product.geometry` e `product_size.attributes`) e si calcola una volta (memoizzata).
- Il cambio di materiale cambia solo l'immagine dei pattern di ogni zona (P13), che hanno `id` nella forma `<prefisso>-<zona>-<indice>`. Le zone coincidono con `option_group.zones`, con nomi fissati nel contratto.
- L'anteprima è un SVG inline nella pagina, non un `<img>`, così le texture si caricano da `public/` e i font della pagina valgono anche nell'SVG (P14).
- Gli optional sono parti che si accendono e si spengono.
- In `public/` stanno solo texture e foto ufficiali.
- Gli `id` dei pattern hanno un prefisso per vista, così più viste nella stessa pagina non si sovrappongono.

Il peso di una vista va misurato distinguendo le texture incorporate da quelle richiamate.

### 9.4 Uso delle immagini

Il tutor ha autorizzato a voce l'uso di ciò che è visibile sul sito; non c'è un'autorizzazione scritta. Le foto si copiano in `public/` e non si richiamano dal sito, per rispettare la regola sulle risorse esterne. I file 3D e 2D dell'Area Pro (DWG, FBX, SKP) restano solo sul computer locale e non entrano nel repository. Il tutor ha autorizzato (2026-11-11) l'uso delle schede di preinstallazione per ricavare dimensioni e vincoli, con la stessa regola: si leggono in locale e non entrano nel repository.

---

## 10. Applicazione e flusso

### 10.1 Architettura

- Le pagine del catalogo sono renderizzate sul server dal database.
- Il configuratore è un componente client con lo stato nell'URL. L'URL contiene **solo lo stato del client**: non è legato a una configurazione salvata. Un valore che non esiste più nel catalogo si sostituisce con quello predefinito.
- Una sola **funzione pura** `valuta(config, prodotto) → {valida, errori, disattivati}` applica le regole di compatibilità; `prodotto` contiene tagli, gruppi, valori e regole. Prima delle regole `valuta` controlla la struttura: il taglio esiste, ogni gruppo appartiene al prodotto, ogni valore appartiene al suo gruppo, ogni gruppo `single` ha un valore. La usa l'interfaccia per disattivare le scelte incompatibili e la usa il server, con le regole lette dal database e insieme a Zod, per rifiutare una combinazione non valida.
- **Componenti e flusso dei dati:**
  - nel browser: pagine del catalogo e configuratore (`src/app/`, `src/components/`) e generatore delle viste (`src/lib/viste/`);
  - nel server Next.js: Server Action per l'invio e "Riprova", Route Handler per il PDF (P8). Usano Zod e `valuta` (`src/contratti/`), Drizzle verso PostgreSQL (`src/db/`), il generatore con resvg per l'immagine, PDFKit per il PDF e Nodemailer per le email (`src/server/`);
  - in Docker: PostgreSQL, con il catalogo caricato dai file e le configurazioni salvate.

  Le route sono elencate in P6 (sezione 20.3); il dettaglio va in `docs/architettura.md`.

### 10.2 Flusso dell'invio

Un solo pulsante, "Ricevi il riepilogo". La riga della configurazione funziona come una **posta in uscita**: si salva prima di qualsiasi invio e registra cosa è stato consegnato.

1. Il cliente inserisce l'email, la conferma scrivendola due volte e dichiara di aver letto l'informativa. Il pulsante si disattiva mentre la richiesta è in corso.
2. Il server valida email e configurazione (Zod e `valuta`).
3. Il server inserisce la riga con entrambi gli stati `pending`, `customer_attempts = 1`, `customer_last_attempt_at = now()` e gli stessi valori per `project_…`, e la conferma subito. Riceve `id` e `number`.
4. Il server genera il PDF in memoria (sezione 11).
5. Il server invia il PDF come allegato al cliente, con Nodemailer e un Gmail dedicato al progetto. I tre timeout di Nodemailer (`connectionTimeout`, `greetingTimeout`, `socketTimeout`) si impostano a circa 10 secondi, perché quelli predefiniti sono di minuti. In più ogni invio ha una scadenza complessiva di 15 secondi (`Promise.race`, perché `sendMail` non accetta un `AbortSignal`; alla scadenza si chiama `transporter.close()`), perché `socketTimeout` misura solo l'inattività e non limita la durata totale. Poi aggiorna `customer_status` a `sent` o `failed`, con l'errore, i tentativi e la data.
6. Solo dopo, il server invia la notifica all'email del progetto, con gli stessi timeout e la stessa scadenza, e aggiorna `project_status` allo stesso modo. La notifica si attende: nel caso peggiore la risposta arriva dopo circa 30 secondi più la generazione del PDF (due invii da 15 secondi), entro il limite di RNF4. Un fallimento della notifica non cambia la risposta al cliente.
7. La schermata di conferma mostra il risultato e offre sempre **"Scarica il PDF"**, rigenerato dalla riga salvata.

Il `request_id`, generato dal server quando mostra il modulo e inviato in un campo nascosto, evita righe doppie in caso di doppio clic: se la stessa richiesta arriva due volte, l'inserimento usa `ON CONFLICT (request_id) DO NOTHING` e poi il server legge e restituisce la riga esistente (P4).

### 10.3 Se l'invio fallisce

- La riga resta salvata con `customer_status = failed`.
- Il cliente vede il messaggio descritto in RF6 e può comunque scaricare il PDF. Il codice d'errore di Nodemailer decide la causa:

  | Codice | Causa (RF6) | Messaggio |
  |---|---|---|
  | `ECONNECTION`, `EDNS`, `ESOCKET`, `ETLS` | server di posta non raggiungibile | "Il server di posta non è raggiungibile. Controlla la connessione." |
  | `EAUTH` | accesso all'account rifiutato | "Il server di posta ha rifiutato l'accesso." |
  | `ETIMEDOUT` e la scadenza di 15 secondi | tempo scaduto | "Il server di posta non ha risposto in tempo." |
  | `EENVELOPE` | indirizzo rifiutato | "L'indirizzo email è stato rifiutato." |
  | altro | server di posta non raggiungibile | come sopra; il codice si salva in `customer_error` |

- **"Riprova"** rimanda l'email per la **stessa riga**, identificata dal `token`, senza crearne una nuova.
- "Riprova" prende la riga con una sola istruzione: `UPDATE … SET customer_status = 'pending', customer_attempts = customer_attempts + 1, customer_last_attempt_at = now() WHERE token = $1 AND customer_attempts < 3 AND customer_last_attempt_at < now() - interval '30 seconds' AND (customer_status = 'failed' OR (customer_status = 'pending' AND customer_last_attempt_at < now() - interval '2 minutes')) RETURNING id`. Si invia solo se l'istruzione restituisce una riga: due clic contemporanei non producono due invii e una riga già inviata non si rimanda. Il primo invio è il primo tentativo, quindi "Riprova" si usa al massimo due volte; quando i tentativi sono finiti il pulsante non compare e resta "Scarica il PDF".
- Una riga `pending` da più di 2 minuti (processo interrotto tra il salvataggio e l'invio) la pagina di conferma la mostra come fallita e offre "Riprova"; all'avvio `npm run demo` la segna `failed` (sezione 7).
- Dopo un timeout non si può escludere che l'email sia partita comunque: in quel caso "Riprova" può produrre un doppione. Per la demo è accettato.
- Il fallimento della notifica al progetto non è visibile al cliente: resta registrato nella colonna `project_status` con l'errore. All'avvio, `npm run demo` rimanda le notifiche `failed` che hanno ancora tentativi disponibili (sezione 7). I messaggi di log vanno solo sull'output del server, non su file.

### 10.4 Contenuto del PDF e dell'email

Il PDF contiene l'immagine del prodotto con le scelte fatte (vista SVG convertita, foto con campioni dei materiali, o versione a colori pieni), il numero e la data della configurazione e l'elenco di prodotto, taglio, materiali e optional, con lo stesso contenuto della schermata di riepilogo. Lo stesso elenco compare anche nel corpo dell'email, così il contenuto è leggibile anche se il PDF non è accessibile.

### 10.5 Affidabilità dell'invio

- **Durante lo sviluppo** si usa **Mailpit** in locale al posto di Gmail, così non si consuma la reputazione dell'account. Mailpit è un eseguibile locale, avviato con `--smtp 127.0.0.1:1025 --listen 127.0.0.1:8025`, così non è raggiungibile dalla rete.
- **Controllo preliminare** `npm run check`, che stampa OK o FAIL in italiano per ogni voce:
  - connessione al database e migrazioni applicate;
  - numero di prodotti caricati;
  - `transporter.verify()` verso Gmail;
  - una conversione di prova di Aladdin;
  - presenza delle texture.

  Le prime due voci (database e migrazioni, prodotti caricati) sono bloccanti; le altre tre (Gmail, conversione di prova, texture) sono avvisi (sezione 7). "Numero di prodotti caricati" dà FAIL se è diverso dal numero di file in `data/prodotti/`.
- **Un solo account SMTP.** Il progetto usa un solo account Gmail. Se Google lo blocca, l'invio reale non si può fare e resta solo "Scarica il PDF": è un **rischio accettato**, perché un secondo account andrebbe creato, provato e mantenuto per un caso che la prova della fase 1 rende meno probabile.
- I guasti realistici, da provare nella fase 1:
  1. la rete dell'università o della sede blocca SMTP in uscita (porte 465/587);
  2. Google blocca o chiede la verifica telefonica a un account appena creato o a un accesso da una rete nuova;
  3. la password per le app richiede la verifica in due passaggi;
  4. la casella istituzionale del tutor mette in spam un PDF arrivato da un Gmail nuovo;
  5. i timeout predefiniti di Nodemailer sono di minuti, e il pulsante resterebbe bloccato.

  I limiti di volume di Gmail sono il rischio meno probabile: per una demo bastano.

### 10.6 Verifica dell'email

L'email scritta due volte intercetta gli errori di battitura, ma non un indirizzo valido di un'altra persona. Il campo di conferma accetta l'incolla (sezione 14), quindi un indirizzo copiato con un errore passa lo stesso. Un link di conferma sarebbe la soluzione completa. Per la demo, usata dagli sviluppatori e dal tutor, si accetta il rischio e il link è rimandato a una futura pubblicazione. Il rischio è limitato perché applicazione e database ascoltano solo su `127.0.0.1` (sezione 7): dalla rete della sede nessuno raggiunge il pulsante.

---

## 11. PDF e conversione dell'immagine

**Problema.** Per mettere nel PDF un'immagine SVG con texture bisogna prima trasformarla in PNG. I convertitori lato server si comportano diversamente dal browser su `<pattern>`, `<image href>`, fusioni e filtri. I percorsi relativi delle texture (`/texture/rovere.jpg`) sul server non si risolvono, e senza font caricati il testo delle quote può scomparire o cambiare font.

**Decisione: conversione sul server con `@resvg/resvg-js`**, partendo dalla configurazione già validata.
- La stessa funzione che disegna l'anteprima produce la stringa SVG.
- Le texture si incorporano come data URI e i font si caricano in modo esplicito.

**Motivi**
- Il PDF si rigenera dalla riga salvata, quindi "Riprova", "Scarica il PDF" e `npm run check` usano lo stesso codice senza chiedere l'immagine al browser. L'elenco delle scelte viene dallo snapshot; l'immagine si ridisegna con il catalogo attuale. Se le scelte salvate non si risolvono più nel catalogo attuale (prodotto, taglio, valore o materiale rimosso o cambiato, geometria non valida), il PDF esce con il solo elenco delle scelte. Una prova automatica lo verifica con uno snapshot che cita un codice rimosso.
- Il server non accetta immagini dal client, quindi non servono controlli su tipo e dimensione e non si incontra il limite di 1 MB del corpo delle Server Actions.
- `@resvg/resvg-js` ha binari già pronti per Windows, senza dipendenze di sistema.
- Le differenze attese rispetto allo schermo riguardano `<pattern>`, fusioni e filtri (`feTurbulence`); la prova le verifica.

**Alternative**
- *Conversione nel browser:* il client disegna l'SVG in un canvas ed esporta un PNG. Il PDF coincide con lo schermo, ma il server dovrebbe fidarsi di un'immagine del client e il PDF non si potrebbe rigenerare. Resta la seconda opzione se la prova mostra che manca una texture, che le quote non sono leggibili, che mancano gli accenti o che pattern e fusioni non sono resi come nel browser.
- *Playwright o Puppeteer* con `page.pdf()`: massima fedeltà, ma richiede un browser headless sul server (Chromium, centinaia di MB) e un processo in più da gestire. Scartato.

**Ripiego, deciso fin d'ora:** la stessa funzione con l'opzione `flat: true` sostituisce i pattern con il colore pieno di `material.color` e toglie le fusioni.

**Impaginazione: PDFKit** (scheda [0015](docs-iniziali/docs/decisioni/0015-pdf-pdfkit-resvg.md)). Il PDF è una pagina A4 con l'immagine PNG prodotta da resvg e l'elenco delle scelte. PDFKit scrive il PDF in memoria, incorpora i font del progetto (necessari per "Wengé" e per gli altri accenti) e va a capo da solo nei testi lunghi. Ripiego se PDFKit non funziona dentro Next.js: `pdf-lib`.

**Prova** (mezza giornata, fase 2): Aladdin 60 con Wengé, gres e specchio, confrontato con il browser sugli stessi quattro punti (texture presenti, quote leggibili, accenti corretti, pattern e fusioni resi come nel browser), con PDFKit e resvg insieme. Il risultato si aggiunge alla scheda 0015, nella sezione "Come è stato verificato".

---

## 12. Privacy

- **Titolari del trattamento:** i due sviluppatori, Nicolas e Marko, come contitolari, nell'ambito di un progetto di tirocinio. Contatto: email del progetto (da creare).
- **Dati:** email e configurazione scelta. Nient'altro.
- **Finalità e base giuridica proposta:**
  - (a) inviare il riepilogo richiesto: art. 6(1)(b) GDPR, cioè una risposta a una richiesta dell'interessato;
  - (b) conservare la richiesta per dimostrare e verificare il funzionamento del progetto: legittimo interesse, art. 6(1)(f).

  Entrambe confermate dal tutor il 2026-11-11. I dati non sono usati per altri scopi né per ricontattare il cliente.
- **Durata:** 12 mesi, perché coprono il tirocinio e l'eventuale verifica successiva del progetto.
- **Consenso:** non c'è un consenso commerciale; il cliente dichiara di aver letto l'informativa. Nella riga si salvano data e versione dell'informativa.
- **Conservazione (scadenza "pigra"):**
  - ogni riga ha `expires_at` = creazione + 12 mesi;
  - le letture ignorano le righe scadute;
  - `DELETE … WHERE expires_at < now()` viene eseguito all'avvio di `npm run demo` e si può lanciare a mano;
  - non c'è un processo periodico: Next.js non ha uno scheduler, e un'estensione come `pg_cron` violerebbe la regola 2 della sezione 13.
- **Cancellazione su richiesta:** il cliente scrive all'email del progetto; lo stesso script di pulizia, con un parametro email, cancella dal database i dati di quell'indirizzo. Gmail conserva nella "Posta inviata" una copia di ogni email mandata al cliente, con il PDF: la procedura manuale comprende quindi anche la ricerca `to:<indirizzo>` nella casella del progetto e l'eliminazione dei messaggi trovati. Lo script si esegue su ogni database in cui l'indirizzo può trovarsi: quelli dei due portatili.
- **Email nella casella del progetto:** Gmail non cancella in automatico per età. La conservazione a 12 mesi è una **procedura manuale documentata** (ricerca `older_than:12m` ed eliminazione).
- **Destinatari:** i dati non sono diffusi. L'invio passa da Gmail, che va dichiarato nell'informativa, anche come possibile trasferimento di dati fuori dall'UE.
- **Cookie:** nessuno; nessun analytics; font serviti dal progetto (file TTF nel repository letti da `next/font/local`, P14); nessuna libreria caricata da servizi esterni.

Il tutor inserisce un'email vera, quindi le misure qui sopra si implementano davvero. La parte che non si dimostra in demo, cioè il funzionamento nel tempo, si dichiara come tale: "progettato come se fosse pubblico; in demo i dati sono degli sviluppatori e del tutor".

| Misura | Stato | Motivo |
|---|---|---|
| Solo email e configurazione | Si implementa | Non costa nulla |
| Nessun cookie, font serviti dal progetto | Si implementa | Non costa nulla e si mostra bene |
| Segreti solo in `.env`, `.env.example` | Si implementa | Pratica standard |
| Informativa breve in bozza, con versione salvata nella riga | Si implementa insieme al flusso completo | Il tutor inserisce un dato reale |
| `expires_at` e pulizia all'avvio | Si implementa | Pochi minuti; si dimostra con una riga retrodatata in una prova |
| Script di cancellazione per email | Si implementa | Una query; si mostra dal vivo |
| Processo di pulizia periodico | Non si implementa | Nessuno scheduler; non osservabile nei tempi del tirocinio |
| Conservazione nella casella Gmail | Procedura manuale documentata | Gmail non la automatizza |
| Link di conferma dell'email, anti-spam | Lavoro futuro | Gli utenti sono noti; rischio accettato per la demo |

Il tutor ha confermato il 2026-11-11 contitolarità, basi giuridiche, durata di 12 mesi e bozza dell'informativa. L'informativa entra nel flusso completo (fase 5), prima che il tutor inserisca un indirizzo vero.

---

## 13. Migrabilità

Non è prevista una pubblicazione. Queste regole richiedono poco lavoro in più e servono a non precluderla.

1. Il database si raggiunge solo tramite la variabile `DATABASE_URL`: il codice non sa se è Docker o un servizio online.
2. Nessuna estensione né funzione specifica di Docker o di un fornitore.
3. Schema e dati iniziali solo tramite migrazioni e seed nel repository.
4. Nessun dato scritto su file locali: i PDF si generano in memoria, le immagini stanno nel repository, i log vanno sull'output del server.
5. Configurazioni (database, Gmail) solo in `.env`.

Il progetto è pensato perché il passaggio a un database online richieda solo di cambiare la configurazione (connessione, SSL) e, se il servizio usa un pooler di connessioni, le opzioni del driver (ad esempio `prepare: false` per `postgres.js`). Il passaggio non è stato provato.

---

## 14. Accessibilità

Obiettivo: **WCAG 2.1 livello AA** sulle pagine del flusso (catalogo, configuratore, conferma, informativa). Si dichiara "progettato per AA, verificato su questi flussi"; la conformità certificata completa, compresa l'anteprima SVG, non è un obiettivo.

- Tutto il configuratore è usabile **da tastiera**, con focus sempre visibile e ordine logico.
- Le immagini hanno un **testo alternativo** che descrive la configurazione scelta e si aggiorna a ogni cambio.
- Gli errori dei moduli sono scritti in testo, collegati al campo, e il focus va al primo campo sbagliato; il campo di conferma dell'email permette di incollare.
- Contrasti, etichette dei campi e lingua della pagina (`it`) sono verificati.
- Durante l'invio, che può durare decine di secondi, un messaggio di stato (`role="status"`) annuncia l'attesa.
- Le scelte disattivate usano `aria-disabled` e restano raggiungibili da tastiera, perché `disabled` le salterebbe.
- Si usa shadcn/ui (basato su Radix), che dà una buona base ma non garantisce il livello AA.
- **Controlli:**
  - prova con la tastiera a ogni modifica dell'interfaccia;
  - controllo automatico con axe e verifica formale in tre momenti fissi: fine dello scheletro, flusso completo, prove finali. I risultati vanno in `docs/prove.md`.
- Il PDF per ora non deve essere accessibile; il testo del riepilogo è ripetuto nel corpo dell'email.

---

## 15. Organizzazione del lavoro

### 15.1 Ruoli

| | Nicolas (N): dati e server | Marko (M): interfaccia |
|---|---|---|
| Cartelle | `docker-compose.yml`, `drizzle/`, `src/db/`, `src/server/`, `scripts/`, `src/app/azioni.ts`, `src/app/riepilogo/[token]/pdf/route.ts`, i file di `public/texture/` e `public/foto/` | `src/app/` (tranne i due file di N), `src/components/`, `src/lib/viste/`, `public/` (tranne texture e foto, che scarica N), stili |
| Responsabilità | database, seed, invio email, PDF e sua impaginazione, conservazione dei dati, controllo preliminare | configuratore, accessibilità, primitive del generatore e viste |
| Prodotti (Aladdin dalla fase 2, gli altri nella fase 6) | trascrive i prodotti che gli sono assegnati (sezione 15.4) e i parametri di geometria | aggiunge le primitive necessarie e rifinisce le viste |

Lo schema Zod della geometria è il punto di contatto tra i due: N scrive i dati che lo rispettano, M scrive il codice che li disegna. Così il lavoro grafico più rischioso non resta tutto su una persona.

**File iniziali.**

| Percorso | Contenuto | Chi | Fase |
|---|---|---|---|
| `package.json`, `.npmrc`, `.gitattributes` (`* text=auto eol=lf`), `.env.example`, `next.config.ts`, `tsconfig.json` | Scaffold del progetto | Insieme | 2 |
| `docker-compose.yml` (servizio `db`) | Database | N | 1 (file provvisorio, nel repository dalla fase 2) |
| `drizzle.config.ts`, `src/db/schema.ts`, `src/db/client.ts` | Schema e connessione | N | 2 |
| `vitest.config.ts`, `playwright.config.ts`, `.env.test` | Configurazione delle prove (sezione 18) | N | 2 |
| `components.json`, `src/lib/utils.ts` | Creati da `shadcn init` | M | 2 |
| `src/contratti/catalogo.ts`, `src/contratti/configurazione.ts`, `src/contratti/geometria.ts`, `src/contratti/valuta.ts` | Contratto (sezione 15.2) | Insieme | 2 |
| `src/db/catalogo.ts` | `caricaProdotto(code)`: ricompone `prodotto` dal database, con il tipo `Omit<ProdottoFile, 'schemaVersion'>` | N | 3 |
| `src/app/page.tsx`, `src/app/configura/[prodotto]/page.tsx`, `src/app/riepilogo/[token]/page.tsx`, `src/app/informativa/page.tsx`, `src/app/galleria/page.tsx` | Pagine di P6 | M | 3 |
| `src/app/azioni.ts` (`'use server'`) | `inviaRiepilogo`, `riprova` (P8) | N | 3-4 |
| `src/app/riepilogo/[token]/pdf/route.ts` | Route Handler del PDF | N | 3 |
| `public/texture/`, `public/foto/<prodotto>/` | Texture e foto copiate dal sito (sezione 9.4) | N | 2 |
| `docs/mockup/configuratore-saune.html` | Mockup di riferimento (P15) | M | 2 |
| `src/lib/viste/` | Generatore delle viste | M | 2-3 |
| `src/server/pdf.ts`, `src/server/email.ts`, `src/server/invio.ts` | PDF, email, flusso dell'invio | N | 2-4 |
| `scripts/seed.ts`, `scripts/check.ts`, `scripts/pulizia.ts`, `scripts/avvio-demo.ts`, `scripts/prepara-test.ts` | Script (sezione 15.3) | N | 3-5 |
| `src/fonts/` | File TTF (P14) | M | 2 |
| `data/prodotti/` | File dei prodotti | Divisi tra i due (sezione 15.4) | dalla 2 |
| `test/unit/`, `test/e2e/` | Prove (sezione 18) | Chi scrive il codice provato | dalla 2 |
| `docs/` | Documentazione (sezione 19) | Entrambi | dalla 2 |

### 15.2 Contratto condiviso

All'inizio, in circa 3 ore insieme, si prepara **una sola pull request** con:
- i tipi in `src/contratti/`: catalogo, configurazione con `schemaVersion: 1`, geometria. Lo schema della geometria è questo; altre parti si aggiungono con una PR quando servono al secondo prodotto:

  ```ts
  type Geometria = {
    front: { type: 'glass' | 'wood' | 'door'; widthCm: number }[]; // da sinistra
    mirrorBandCm: number;   // altezza della fascia di specchio in basso (0 se assente)
    frameCm: number;        // spessore del frame esterno (0 se assente)
    benches: { shape: 'linear' | 'l'; depthCm: number; levels: 1 | 2 }[]; // parte visibile dal vetro
    stove?: { side: 'left' | 'right'; offsetCm: number };              // solo per la pianta
  };
  ```

  L'involucro prende le misure dal taglio. Le misure che cambiano con il taglio (ad esempio i `widthCm` del fronte) stanno in `sizes[].attributes`, che sovrascrive `geometry` chiave per chiave. Zod controlla che la somma dei `widthCm` del fronte sia la larghezza del taglio e che `viewer = "svg"` abbia `geometry` non nulla;
- la semantica delle regole decisa in P2 (sezione 20.3), tradotta in tipi e prove;
- la funzione `valuta(config, prodotto)`, con i controlli strutturali e le regole (sezione 10.1);
- lo schema Drizzle con i vincoli di unicità;
- lo schema Zod dei file in `data/prodotti/` (formato JSON, P1), a partire dalla bozza di Aladdin;
- la lista iniziale delle dipendenze, tutte con versione esatta (P10):
  - lo scaffold si fa con `create-next-app` (TypeScript, Tailwind, App Router, `src/`) e `shadcn init` nella fase 2; i pacchetti che installano fanno parte della lista: `next`, `react`, `react-dom`, `tailwindcss`, `@tailwindcss/postcss`, `clsx`, `tailwind-merge`, `class-variance-authority`, `lucide-react`, i pacchetti `@radix-ui/*` dei componenti aggiunti, `typescript`, `@types/react`, `@types/react-dom`, `@types/node`;
  - in più: `drizzle-orm`, `postgres` (driver `postgres.js`), `zod`, `nodemailer`, `pdfkit`, `@resvg/resvg-js`;
  - in sviluppo: `drizzle-kit`, `tsx`, `@types/nodemailer`, `@types/pdfkit`, `vitest`, `@playwright/test`, `@axe-core/playwright`. Mailpit è un eseguibile a parte, scaricato dalla pagina delle release su GitHub (sezione 10.5). In `next.config.ts`: `serverExternalPackages: ['pdfkit', '@resvg/resvg-js']`, perché resvg è un modulo nativo.

Dopo, il contratto cambia solo con una pull request discussa tra i due.

### 15.3 Migrazioni e script npm

- Solo Nicolas esegue `drizzle-kit generate`.
- `drizzle-kit push` è vietato: ogni modifica passa da un file di migrazione.
- Lo schema si blocca alla fine della fase 4. Ciò che emerge dopo va nelle colonne JSONB.
- `npm run db:reset` serve da ripristino.

| Script | Cosa fa |
|---|---|
| `dev` | `next dev -H 127.0.0.1`; Mailpit si avvia a parte (sezione 10.5) |
| `db:generate` | `drizzle-kit generate` (solo Nicolas) |
| `db:migrate` | `drizzle-kit migrate` |
| `db:seed` | `tsx --env-file=.env scripts/seed.ts` (sezione 8.2) |
| `db:reset` | `docker compose down -v`, `docker compose up -d --wait`, `db:migrate`, `db:seed` |
| `check` | `tsx --env-file=.env scripts/check.ts` (sezione 10.5); "migrazioni applicate" vuol dire che il numero di righe di `drizzle.__drizzle_migrations` è uguale al numero di voci di `drizzle/meta/_journal.json` |
| `clean` | `tsx --env-file=.env scripts/pulizia.ts` cancella le righe scadute; `npm run clean -- --email <indirizzo>` cancella quelle di un indirizzo (sezione 12) |
| `test:setup` | `tsx --env-file=.env.test scripts/prepara-test.ts`: crea il database `configuratore_test`, poi migrate e seed (sezione 18) |
| `test` / `test:e2e` | `vitest run` / `playwright test`, entrambi con `.env.test` |
| `demo` | `tsx --env-file=.env scripts/avvio-demo.ts`, che esegue i passi della sezione 7 |

Next.js carica `.env` da solo; `tsx` e `drizzle-kit` no: per questo gli script usano `--env-file` e `drizzle.config.ts` chiama `process.loadEnvFile()` (Node 24).

### 15.4 Per evitare conflitti

- I prodotti sono file separati in `data/prodotti/`, divisi tra i due.
- `package.json` e il lockfile: dopo la lista iniziale (sezione 15.2), una persona alla volta aggiunge dipendenze, avvisando l'altra.
- Il registro delle decisioni è **un file per decisione**, non un unico file.
- Un file `.gitattributes` evita differenze dovute ai fine riga di Windows.

### 15.5 Fasi del lavoro

Le parti mai provate (Gmail, PDF, Docker, generatore su un secondo prodotto) si provano **per prime**, prima di costruirci sopra.

| Fase | Lavoro |
|---|---|
| 1. Prove delle parti incerte | N: account Gmail, verifica in due passaggi, password per le app; invio di prova con un PDF fittizio a un Gmail, un Outlook e un indirizzo dell'università. Entrambi: `docker-compose.yml` solo database su tutti e due i portatili (file provvisorio, che entra nel repository nella fase 2) |
| 2. Contratto e prova del PDF | Insieme: repository, scaffold Next.js e file iniziali (sezione 15.1), spostamento di analisi e schede in `docs/`. M salva il mockup in `docs/mockup/configuratore-saune.html`. Insieme (circa 3 h): PR del contratto (sezione 15.2). Poi M porta nel generatore, come funzione pura (P15), la vista "Esterno" del mockup, che diventa la frontale, e carica Aladdin dai file di `data/prodotti/` attraverso il contratto. N scrive la `geometry` di Aladdin e cambia `viewer` in `svg`, scarica texture e foto in `public/` e, dopo il porting di M, fa la prova PDF e conversione (sezione 11) con la vista frontale e aggiorna la scheda 0015 |
| 3. Scheletro completo | Insieme: censimento del catalogo per famiglie e misura del tempo speso per trascrivere Aladdin. M: vista diagonale di Aladdin (scheda 0021), secondo prodotto SVG (prova del generatore), configuratore che riceve il prodotto dal server (sezione 8.2), modulo email minimo dello scheletro. N: `geometry` del secondo prodotto, conversione resvg della diagonale di Aladdin con i quattro controlli della sezione 11 (aggiunta alla 0015; se fallisce, nel PDF va la frontale in grande, ripiego della 0021), seed con validazione e scheletro dall'inizio alla fine con Aladdin (pulsante → riga → email con PDF). M: prima verifica tastiera e axe |
| 4. Invio reale e modulo | N: invio reale con stati e "Riprova", notifica, timeout, `npm run check`. M: modulo email, informativa, errori e focus. **Schema bloccato alla fine della fase** |
| 5. Flusso completo | Entrambi: flusso completo su Aladdin su entrambi i portatili. N: pulizia e cancellazione. M: verifica axe |
| 6. Inserimento dei prodotti | Entrambi: prodotti per famiglia di layout, con la regola di decisione SVG/foto (sezione 9.2). All'inizio della fase si fissa il numero obiettivo in base al tempo misurato per prodotto |
| 7. Blocco delle funzioni | Entrambi. Da qui niente funzioni nuove (lo schema è bloccato dalla fase 4). Restano ammessi dati dei prodotti, rifinitura grafica e correzioni fino alla prova generale. Tag `demo-rc1` |
| 8. Prove finali | Entrambi: prove della lista di accettazione (sezione 16) sul portatile che non ospiterà la demo, con un indirizzo di prova; avvio da clone pulito |
| 9. Prova generale | Entrambi: criterio 1 ripetuto sul portatile della demo; prova sul portatile della demo e, se possibile, sulla rete della sede, con l'invio vero; rifinitura grafica |
| 10. Preparazione della demo | M: documentazione finale e registrazione del flusso. N: database pulito, invio di prova la mattina stessa, un'email già ricevuta conservata da mostrare. Tag `demo-final`. Il giorno della demo non si sviluppa |

Il tempo che avanza va, in quest'ordine, alla rifinitura delle viste SVG e poi alla pianta (sezione 9.1), non a funzioni nuove. I prodotti non inseriti si elencano nella documentazione come lavoro futuro, con la stima del tempo.

---

## 16. Criteri di successo

Tutti obbligatori, verificati nelle prove finali (fase 8) sul portatile che non ospiterà la demo; il criterio 1 si ripete sul portatile della demo nella prova generale (fase 9). Una consegna che non li soddisfa tutti è parziale.

1. Su ciascuno dei due portatili, partendo da un clone pulito con `.env` copiato, `npm ci` e `npm run demo` portano l'applicazione in funzione in meno di 10 minuti, senza altri passaggi manuali.
2. Almeno **3 prodotti**:
   - Aladdin con la vista frontale e, se pronta, la diagonale;
   - un secondo prodotto SVG con un fronte diverso da Aladdin; se questo supera la soglia della regola di decisione (sezione 9.2, punto 5), si ripiega su un prodotto della stessa famiglia, e il ripiego si dichiara nella consegna (un secondo taglio di Aladdin non vale come prodotto);
   - un prodotto con foto ufficiale e pannello dei materiali.

   **Obiettivo: 6–8 prodotti**, confermato all'inizio della fase 6 in base al tempo misurato.
3. Ogni prodotto ha almeno un taglio e un'essenza; gli altri gruppi (materiali, optional) ci sono dove il catalogo li documenta. Se una fonte documenta almeno una regola di compatibilità (P3 nella sezione 20.3), quella regola è bloccata nell'interfaccia con il suo messaggio; in ogni caso le prove automatiche coprono i tre tipi di regola. Un URL modificato a mano con una combinazione non valida è rifiutato dal server.
4. Si inserisce un indirizzo (nella fase 8 uno di prova, nella demo quello del tutor) e si preme il pulsante. Entro 60 secondi:
   - c'è la riga nel database con entrambi gli stati `sent`, mostrata con `docker compose exec db psql -U postgres -d configuratore`, senza dipendere dalla rete;
   - l'email arriva con il PDF (immagine o versione a colori pieni, ed elenco delle scelte) e con lo stesso elenco nel corpo;
   - la notifica arriva nella casella del progetto.
5. Con l'account Gmail, in due prove separate: (a) `SMTP_PASSWORD` sbagliata in `.env`; (b) rete staccata. In entrambe: `customer_status = failed`, il messaggio di RF6 per quella causa (sezione 10.3) e "Scarica il PDF" funzionante. Poi si ripristina la causa (password corretta e riavvio, oppure rete ricollegata) e, dopo almeno 30 secondi, "Riprova" invia senza creare una seconda riga.
6. Il flusso intero funziona solo con la tastiera; axe riporta 0 violazioni `serious` o `critical` su catalogo, configuratore, conferma e informativa.
7. Le prove automatiche della sezione 18 passano, comprese quelle di `npm run clean` con e senza `--email`.
8. Ogni scelta mostrata nella demo ha la sua scheda nel registro delle decisioni.

---

## 17. Piano della demo e ripieghi

Il percorso della demo, la lista dei controlli da fare la mattina e i ripieghi stanno in `docs/demo.md`.

| Guasto | Ripiego |
|---|---|
| SMTP bloccato dalla rete | Hotspot del telefono, provato in anticipo |
| Gmail rifiuta o rallenta l'invio | Scadenza di 15 s per invio (sezione 10.2) → stato `failed` → "Scarica il PDF" sullo schermo; email ricevuta il giorno prima da mostrare |
| L'email finisce in spam | Indirizzo del tutor provato prima; chiedergli di controllare lo spam |
| La conversione SVG → PNG non regge | Versione a colori pieni (`flat`), decisa con la prova del PDF |
| Il database o l'avvio non partono | `npm run db:reset`; `.env` su chiavetta; checkout del tag `demo-final` |
| Guasto completo | Registrazione di 60–90 secondi del flusso intero |

Il risultato atteso: o l'email arriva, o lo stesso PDF è già sullo schermo con un messaggio onesto sullo stato.

---

## 18. Prove

- Prove automatiche:

  | Caso | Strumento | Esito atteso |
  |---|---|---|
  | `valuta` su un catalogo di prova con una regola per tipo | Vitest | scelte disattivate e configurazione rifiutata come da P2 |
  | `valuta` con taglio, gruppo o valore inesistente, o gruppo `single` vuoto | Vitest | errore strutturale |
  | Schema Zod: `aladdin.json` passa; un file con un codice non valido, uno con `viewer: "svg"` e `geometry: null`, uno con una chiave sconosciuta | Vitest | `aladdin.json` passa; gli altri falliscono con l'errore Zod sul campo |
  | Seed che aggiunge, modifica e toglie un valore e una regola; seed con un predefinito bersaglio di una regola | Vitest + database | catalogo uguale ai file, configurazioni salvate invariate; il secondo seed fallisce |
  | Doppio invio dello stesso modulo (stesso `request_id`) | Playwright | una sola riga (scheda 0024) |
  | Due "Riprova" in parallelo; quarto tentativo | Vitest + database | un solo invio; il quarto tentativo (terzo "Riprova") è rifiutato con `esauriti` |
  | Riga retrodatata | Vitest + database | cancellata da `npm run clean` |
  | `npm run clean -- --email <indirizzo>` | Vitest + database | cancellate tutte e sole le righe di quell'indirizzo, anche scritto con maiuscole |
  | Snapshot con un codice rimosso | Vitest | PDF con il solo elenco |
  | Errori di Nodemailer (`EAUTH`, `ECONNECTION`, `EDNS`, `ESOCKET`, `ETIMEDOUT`, `EENVELOPE`, un codice sconosciuto) e scadenza di 15 secondi | Vitest | causa e messaggio della tabella della sezione 10.3 |
  | URL con un valore sconosciuto o una combinazione incompatibile | Playwright | valori predefiniti e avviso |
  | `inviaRiepilogo` chiamata con una combinazione che viola una regola | Vitest + database | `ok: false`, nessuna riga |
  | Un PDF per ogni prodotto, con il catalogo letto dal database dopo il seed | Vitest + database | PDF generato senza errori |
  | Flusso completo da tastiera, con controllo axe | Playwright + Mailpit | email con allegato, letta da `GET /api/v1/messages` |

  **Ambiente delle prove.**
  - Le prove usano il database `configuratore_test`, nello stesso container, indicato da `.env.test`; `npm run test:setup` lo crea, poi esegue migrate e seed.
  - Vitest gira in serie (`fileParallelism: false`) e svuota `configuration` prima di ogni file.
  - `playwright.config.ts` avvia due `webServer`: Mailpit, e `next build && next start -H 127.0.0.1` con `env` esplicito (`SMTP_HOST=127.0.0.1`, `SMTP_PORT=1025`, `SMTP_SECURE=false`, la `DATABASE_URL` di prova). Così una prova non manda mai email vere.
  - Mailpit deve essere nel `PATH`, nella versione indicata in `README.md`. Su ogni computer serve una volta `npx playwright install chromium`.
- Pagina interna `/galleria` che mostra ogni prodotto × taglio con i materiali predefiniti e, per ogni gruppo, una riga con la vista frontale per ciascun valore. Serve come controllo visivo, come bersaglio per axe e come materiale di riserva per la demo.
- Controllo di accessibilità come descritto nella sezione 14.
- Ogni prodotto si controlla da solo: o il seed fallisce, o il prodotto compare nella galleria.

---

## 19. Documentazione

La documentazione sta nella cartella `docs/` del repository, in Markdown, e fa parte di ciò che si consegna. **Ogni pull request che cambia il comportamento del codice aggiorna anche la documentazione**, e ogni cambio di scelta si registra.

| File o cartella | Contenuto |
|---|---|
| `README.md` | Avvio e installazione, con i comandi Docker e `npm run demo` |
| `docs/analisi.md` | Questo documento; allo spostamento i link `docs-iniziali/docs/decisioni/…` diventano `decisioni/…` e `data/…` diventa `../data/…` |
| `docs/architettura.md` | Struttura del progetto e del flusso |
| `docs/modello-dati.md` | Tabelle, relazioni, diagramma |
| `docs/catalogo-inventario.md` | Prodotti per famiglia di layout, priorità, tempo misurato, livello di resa |
| `docs/decisioni/` | Una scheda per ogni scelta; quando una scelta cambia si aggiunge una nuova scheda che sostituisce la precedente |
| `docs/privacy-e-accessibilita.md` | Informativa, conservazione, controlli WCAG eseguiti |
| `docs/manuale-uso.md` | Come si usa il configuratore |
| `docs/prove.md` | Prove eseguite e risultati |
| `docs/demo.md` | Percorso della demo, controlli della mattina, ripieghi |

**Registro delle decisioni.** Le schede 0001–0024 sono nel [registro](docs-iniziali/docs/decisioni/README.md); finché il repository non esiste stanno in `docs-iniziali/docs/decisioni/`, poi si spostano in `docs/decisioni/`. Le schede 0016–0020 registrano le decisioni P1–P15 della sezione 20.3; le schede 0021–0024 registrano i cambi di scelta decisi dopo la revisione della v6.

| N. | Scheda | Stato |
|---|---|---|
| 0001 | [Database relazionale PostgreSQL](docs-iniziali/docs/decisioni/0001-postgresql.md) | Accettata |
| 0002 | [PostgreSQL in Docker al posto di Supabase](docs-iniziali/docs/decisioni/0002-docker-al-posto-di-supabase.md) | Sostituita da 0014 |
| 0003 | [ORM Drizzle](docs-iniziali/docs/decisioni/0003-drizzle.md) | Accettata |
| 0004 | [Prezzi fuori dal progetto](docs-iniziali/docs/decisioni/0004-prezzi-fuori-dal-progetto.md) | Accettata |
| 0005 | [Funzioni di intelligenza artificiale fuori dal progetto](docs-iniziali/docs/decisioni/0005-ia-fuori-dal-progetto.md) | Accettata |
| 0006 | [Un solo pulsante: salva, invia al cliente, notifica il progetto](docs-iniziali/docs/decisioni/0006-salvataggio-ed-email.md) | Accettata |
| 0007 | [Privacy: finalità, conservazione e cancellazione](docs-iniziali/docs/decisioni/0007-privacy.md) | Accettata |
| 0008 | [Nessun cookie e nessuna risorsa esterna caricata nel browser](docs-iniziali/docs/decisioni/0008-nessun-cookie.md) | Accettata |
| 0009 | [Accessibilità WCAG 2.1 livello AA](docs-iniziali/docs/decisioni/0009-accessibilita.md) | Accettata |
| 0010 | [Grafica: viste SVG da parametri e immagini del sito come ripiego](docs-iniziali/docs/decisioni/0010-grafica-svg-da-parametri.md) | Accettata; in parte sostituita da 0021 |
| 0011 | [Solo italiano](docs-iniziali/docs/decisioni/0011-lingua-italiana.md) | Accettata |
| 0012 | [Regole di migrabilità](docs-iniziali/docs/decisioni/0012-migrabilita.md) | Accettata |
| 0013 | [Organizzazione di Git](docs-iniziali/docs/decisioni/0013-git.md) | Accettata |
| 0014 | [Solo PostgreSQL in Docker, applicazione fuori dal container](docs-iniziali/docs/decisioni/0014-docker-solo-database.md) | Accettata |
| 0015 | [PDF: impaginazione con PDFKit, immagine convertita con resvg](docs-iniziali/docs/decisioni/0015-pdf-pdfkit-resvg.md) | Accettata (da confermare con la prova) |
| 0016 | [Generatore delle viste come funzione pura, per famiglie di layout](docs-iniziali/docs/decisioni/0016-generatore-famiglie-layout.md) | Accettata (da verificare nella fase 3); in parte sostituita da 0021 |
| 0017 | [Email: Nodemailer con Gmail, stati nella riga, Mailpit in sviluppo](docs-iniziali/docs/decisioni/0017-email-nodemailer-gmail.md) | Accettata; in parte sostituita da 0023 e 0024 |
| 0018 | [Catalogo come file JSON, database derivato](docs-iniziali/docs/decisioni/0018-catalogo-file-database-derivato.md) | Accettata; in parte sostituita da 0022 |
| 0019 | [Next.js con Server Action e Route Handler, Zod, shadcn/ui](docs-iniziali/docs/decisioni/0019-nextjs-server-action-zod-shadcn.md) | Accettata; in parte sostituita da 0024 |
| 0020 | [Regole di compatibilità condivise tra interfaccia e server](docs-iniziali/docs/decisioni/0020-regole-compatibilita-condivise.md) | Accettata |
| 0021 | [Viste esterne: frontale e diagonale](docs-iniziali/docs/decisioni/0021-viste-frontale-diagonale.md) | Accettata |
| 0022 | [Seed come sincronizzazione completa, catalogo letto dal database](docs-iniziali/docs/decisioni/0022-seed-sincronizzazione-catalogo.md) | Accettata |
| 0023 | [La notifica al progetto si attende prima della risposta](docs-iniziali/docs/decisioni/0023-notifica-attesa.md) | Accettata |
| 0024 | [Il request_id lo genera il server, nel modulo](docs-iniziali/docs/decisioni/0024-request-id-dal-server.md) | Accettata |

---

## 20. Rischi e punti aperti

### 20.1 Rischi

| Rischio | Impatto | Mitigazione | Responsabile |
|---|---|---|---|
| L'invio Gmail non funziona dalla rete della demo o l'account viene bloccato | Alto: requisito obbligatorio | Prova nella fase 1, timeout, "Scarica il PDF", hotspot, prova generale (sezioni 10.5 e 17). Il blocco dell'unico account Gmail è un rischio accettato: non c'è un secondo account SMTP | N |
| La conversione SVG → PNG non rende le texture | Medio | Prova nella fase 2, ripiego a colori pieni (sezione 11) | N |
| Il generatore non si estende ad altri layout | Alto per la qualità grafica | Censimento, geometria a parti, secondo prodotto nella fase 3, regola di decisione SVG/foto (sezione 9.2) | M |
| Docker non parte su uno dei portatili | Medio | Solo database in Docker, prova nella fase 1, prerequisiti documentati (sezione 7) | Entrambi |
| Il contratto cambia spesso e blocca il lavoro in parallelo | Medio | PR unica iniziale, modifiche solo con PR discussa, schema bloccato dopo la fase 4 (sezione 15) | Entrambi |
| Tempo insufficiente per il catalogo | Medio | Minimo di 3 prodotti, obiettivo deciso sul tempo misurato, blocco delle funzioni (sezioni 15.5 e 16) | Entrambi |
| "Riprova" e "Scarica il PDF" accessibili conoscendo solo l'`id` della riga | Medio: chi prova un `id` scarica il PDF con l'email di un'altra persona | Token casuale non indovinabile per queste azioni (P4, sezione 20.3) | N |
| Il pulsante permette di inviare email a qualsiasi indirizzo | Basso in demo locale | Rischio accettato e dichiarato; anti-spam come lavoro futuro | N |
| Il database non coincide con i file del catalogo | Medio: interfaccia e server applicano regole diverse | Seed come sincronizzazione completa in transazione, rilanciato da `npm run demo` (sezione 8.2) | N |
| Il PDF rigenerato differisce da quello inviato, o non si genera, dopo una modifica del catalogo | Basso | Elenco delle scelte dallo snapshot; PDF con il solo elenco se le scelte non si risolvono più nel catalogo (sezioni 5 e 11) | N |
| Invii rimasti a metà o doppi per "Riprova" | Medio | Timeout espliciti, aggiornamento condizionale, limite ai tentativi, righe `pending` vecchie segnate `failed` (sezione 10.3) | N |
| Applicazione o database raggiungibili dalla rete della sede | Alto: estranei possono inviare email e leggere dati personali | Ascolto solo su `127.0.0.1` (sezione 7) | N |
| Copie dei dati del cliente nella "Posta inviata" di Gmail | Medio | Procedura manuale anche per le cancellazioni su richiesta (sezione 12) | N |

### 20.2 Punti chiusi il 2026-11-11

| Punto | Esito |
|---|---|
| Libreria che impagina il PDF | **PDFKit**, scheda [0015](docs-iniziali/docs/decisioni/0015-pdf-pdfkit-resvg.md) |
| Significato di `step` e `zones` | Confermato dall'autore: `step` è il numero del passaggio del configuratore in cui compare il gruppo; `zones` sono le zone dell'SVG a cui il gruppo applica il materiale |
| Tutor e valutatore | Sono la stessa persona: nei documenti si usa solo "tutor" |
| Dove sta il mockup | È un artifact HTML/JS su claude.ai, generato a partire dai file forniti dall'autore. Il contenuto è descritto nell'appendice B |
| Dati di Aladdin | Raccolti dal sito il 2026-11-11: bozza in [`data/prodotti/aladdin.json`](data/prodotti/aladdin.json), fonti e lacune nell'appendice A |
| Contratto condiviso | Confermato da Marko: tipo `Geometria` della sezione 15.2; formato delle regole di P2, nel file e nella tabella `option_rule`; nel criterio 2 il ripiego su un prodotto della stessa famiglia è ammesso solo oltre la soglia della sezione 9.2, punto 5; il seed rifiuta un predefinito bersaglio di una regola (P2) |
| Privacy | Confermata dal tutor: contitolarità dei due sviluppatori, art. 6(1)(b) per l'invio e 6(1)(f) per la conservazione, 12 mesi, bozza dell'informativa (sezione 12, scheda 0007) |
| Fonte per optional e regole | Il tutor conferma che non esiste: nessun optional nel catalogo, regole solo da dati verificabili (P3) |
| Schede di preinstallazione dell'Area Pro | Il tutor ne autorizza l'uso per ricavare dimensioni e vincoli, solo sul computer locale e fuori dal repository (sezione 9.4) |

### 20.3 Decisioni sui punti aperti

Le decisioni P1–P15 sono state prese il 2026-11-11. Alcune hanno una condizione: P13 dipende dalla prova della fase 2, P12 dalla vista diagonale pronta in tempo (scheda 0021). P3 e i testi della privacy (P11) sono stati chiusi con il tutor (sezione 20.2). Le decisioni entrano nel contratto condiviso (sezione 15.2) e sono registrate nelle schede: P1 e P3 nella 0018, P2 nella 0020, P4, P5 e P11 nella 0017, P6–P10 nella 0019, P12–P15 nella 0016. Dopo la revisione sono cambiate quattro scelte, registrate in schede nuove: le viste e P12 nella 0021, il seed nella 0022, l'attesa della notifica nella 0023, il `request_id` di P4 nella 0024.

| # | Tema | Decisione |
|---|---|---|
| P1 | Formato del catalogo | JSON, un file per prodotto, validato da Zod |
| P2 | Scelte incompatibili | Disattivate con il messaggio; una scelta resa non valida torna al predefinito con annuncio `aria-live` |
| P3 | Optional e regole | Solo dati con una fonte; nessun dato inventato |
| P4 | Azioni sulla configurazione | Token casuale nell'URL e `request_id` generato dal server nel modulo |
| P5 | Numero | `AAAA-NNNNNN` |
| P6 | Route | Elenco della tabella in P6 |
| P7 | Stato nell'URL | Query string con i codici di gruppi e valori |
| P8 | Comunicazione con il server | Server Action per invio e "Riprova", Route Handler per il PDF |
| P9 | Prove | Vitest, Playwright con `@axe-core/playwright`, Mailpit |
| P10 | Versioni | Node.js 24 LTS, Next.js stabile fissato, PostgreSQL 17, versioni esatte |
| P11 | Testi | Informativa dalla bozza del mockup; email al cliente come descritta; notifica senza l'email del cliente |
| P12 | Immagini nel PDF | Vista diagonale grande e vista frontale; foto e campioni per i prodotti senza SVG |
| P13 | Texture | Foto del campione adattata alla zona; venature procedurali come ripiego |
| P14 | Font | Jost e IBM Plex Sans, file TTF nel repository |
| P15 | Mockup | Porting delle funzioni del mockup in funzioni pure |

Il dettaglio di ogni decisione segue.

**P1. Formato dei file del catalogo.**
- Un file JSON per prodotto in `data/prodotti/<codice>.json`, validato da uno schema Zod in `src/contratti/`.
- Codici: `^[a-z0-9-]+$`, cioè minuscole, cifre e trattino, senza spazi né accenti né virgole, che P7 usa come separatore (`rovere`, `wenge`, `45`); etichette in italiano con gli accenti (`Wengé rigatino`).
- Chiavi dell'URL: `size` per il taglio, poi i codici dei gruppi del prodotto (per Aladdin `wood` e `floor`). Il taglio non è un gruppo: nel file sta nell'array `sizes`.
- Zone dei gruppi: `ext`, `int`, `furn`, `floor`; zone fisse, in `fixedZones`: `mirror`, `frame`.
- `schemaVersion` al primo livello del file è la versione del formato del file: il seed la controlla e non la salva.
- `material.type`: `wood`, `mirror`, `aluminium`, `ceramic` (identificatori in inglese, sezione 8.1).
- `photos`: chiave `<taglio>/<valore>`, dove il valore è quello del gruppo indicato da `photoGroup` (per Aladdin `wood`).
- Le chiavi che iniziano con `_` sono note della bozza: un `z.preprocess` le toglie, poi lo schema è `.strict()`, quindi ogni altra chiave sconosciuta (ad esempio un errore di battitura) fa fallire la validazione. Il file si usa così com'è sia dal seed sia dall'interfaccia. `_daVerificare` elenca i dati incerti; `_assetSources` dice da dove scaricare texture e foto, che N scarica una volta nella fase 2, ottimizza e mette nel commit in `public/` (sezione 9.4).
- *Perché JSON e non TypeScript o YAML:* lo legge sia il seed sia l'interfaccia senza compilazione, e Zod dà errori chiari; YAML aggiungerebbe una dipendenza e ambiguità sui tipi.

**P2. Semantica delle regole.**

| Tipo | Significato | Effetto nell'interfaccia |
|---|---|---|
| `requires` (A → B) | Il valore A si può scegliere solo se è scelto B | A è disattivato, con il messaggio della regola accanto |
| `excludes` (A ↔ B) | A e B non possono stare insieme; vale nei due sensi | Scelto uno, l'altro è disattivato con il messaggio |
| `only_with_size` (A → tagli) | Il valore A esiste solo per i tagli elencati | A è disattivato negli altri tagli, con il messaggio |

Nel file una regola si scrive così; `message` è obbligatorio:
- `{ "type": "requires" | "excludes", "from": { "group", "value" }, "to": { "group", "value" }, "message" }`;
- `{ "type": "only_with_size", "from": { "group", "value" }, "sizes": ["60"], "message" }`.

Nel database diventa una riga di `option_rule` (sezione 8.1).

- Le scelte incompatibili si **disattivano** e non si nascondono: chi usa la tastiera o un lettore di schermo capisce perché non sono disponibili (`aria-disabled` e messaggio collegato).
- Se un cambio (ad esempio di taglio) rende non valida una scelta già fatta, quella scelta torna al valore predefinito del gruppo e un messaggio in una regione `aria-live` lo annuncia.
- Ogni gruppo `single` è obbligatorio e ha un valore predefinito. Un gruppo `multi` accetta da zero a tutti i valori.
- Per un gruppo `multi` la chiave assente nell'URL vuol dire nessun valore, e `default_value` è un elenco, anche vuoto.
- Il seed rifiuta un file in cui il valore predefinito di un gruppo `single` è il bersaglio di una regola: il `to` di un `excludes` o di un `requires`, oppure il `from` di un `only_with_size` che non copre tutti i tagli. Così il ritorno al predefinito ha sempre un valore valido.
- `valuta(config, prodotto)`, dopo i controlli strutturali, applica le regole in quest'ordine: `only_with_size`, `excludes`, `requires`.

**P3. Optional e regole reali (lacuna emersa dalla raccolta dei dati).**
- Le pagine di Aladdin e Sky su effe.it **non riportano né optional né regole di compatibilità**: elencano solo versioni, dimensioni e materiali. Gli optional del mockup (cromoterapia, audio, mensole) e la sua regola su Sky 30 sono dati di esempio, non del catalogo.
- *Decisione:* non si inventano dati. Il tutor ha confermato il 2026-11-11 che non esiste una fonte (listino, brochure) per optional e incompatibilità. Quindi:
  - nessun prodotto ha optional;
  - le regole si ricavano solo da dati verificabili, comprese le schede di preinstallazione dell'Area Pro (sezione 9.4). Il primo candidato è un `only_with_size` sulla pedana 120 × 120 cm di Aladdin, se la scheda di preinstallazione mostra che non entra nel taglio 45;
  - il motore delle regole è comunque provato con prove automatiche su un catalogo di prova.
- Il criterio di successo 3 è stato riscritto di conseguenza (sezione 16).

**P4. Identificativo per "Riprova" e "Scarica il PDF".**
- Colonna `token`: 16 byte casuali (`crypto.randomBytes`) in base64url, con vincolo `UNIQUE`. Le azioni sulla configurazione usano solo il token, mai l'`id`.
- Colonna `request_id`: un UUID generato dal server quando mostra il modulo e inviato in un campo nascosto, con vincolo `UNIQUE`. Se la stessa richiesta arriva due volte (doppio clic), il server restituisce la riga esistente invece di crearne una nuova (sezione 10.2).

**P5. Formato di `number`.** `AAAA-NNNNNN`: l'anno di creazione e l'`id` con zeri davanti, ad esempio `2026-000042`. Non serve un contatore annuale e il numero è unico perché lo è l'`id`. L'anno è quello di `created_at` nel fuso `Europe/Rome`. `NNNNNN` non riparte da 1 ogni anno: dopo `2026-000042` può venire `2027-000043`.

**P6. Route dell'applicazione.**

| Route | Contenuto |
|---|---|
| `/` | Catalogo dei prodotti |
| `/configura/[prodotto]` | Configuratore, con lo stato nella query string; un prodotto inesistente risponde `notFound()` |
| `/riepilogo/[token]` | Conferma: stato dell'invio, "Scarica il PDF", "Riprova" |
| `/riepilogo/[token]/pdf` | Route Handler che restituisce il PDF |
| `/informativa` | Informativa sulla privacy |
| `/galleria` | Pagina interna di controllo (sezione 18), disponibile con `NODE_ENV` diverso da `production` o con `ENABLE_GALLERY=true`, impostata nella demo |

**P7. Stato nell'URL.** Una chiave per gruppo, con il codice del gruppo e del valore: `/configura/aladdin?size=60&wood=rovere&floor=moka`. I gruppi `multi` usano valori separati da virgola (`extras=a,b`). Un valore sconosciuto torna al predefinito e l'interfaccia lo segnala. Una combinazione incompatibile nell'URL si tratta come un cambio: le scelte non valide tornano al predefinito (P2). Al momento dell'invio il server valida comunque tutto.

**P8. Server Action o Route Handler.**
- **Server Action** per "Ricevi il riepilogo" e per "Riprova": il modulo funziona anche senza JavaScript e la validazione Zod è condivisa.
- **Route Handler** per il PDF, perché deve restituire un file con `Content-Type: application/pdf` e `Content-Disposition: attachment; filename="riepilogo-<numero>.pdf"`.
- Firme:
  - `inviaRiepilogo(statoPrecedente, formData)`, in `src/app/azioni.ts`. Campi: `email`, `emailConferma`, `informativa` (checkbox), `requestId` (nascosto) e un campo nascosto per ogni chiave dello stato dell'URL (`size`, `wood`, …). Con errori di validazione restituisce `{ ok: false, errori: Record<campo, messaggio> }`. Altrimenti salva la riga, prova gli invii e chiama `redirect('/riepilogo/' + token)` fuori da ogni `try/catch`, anche se l'invio è fallito: lo stato si vede nella pagina di conferma;
  - `riprova(statoPrecedente, formData)`, con `token` in un campo nascosto. Se l'`UPDATE` della sezione 10.3 non restituisce righe risponde `{ ok: false, motivo: 'attendi' | 'inviata' | 'esauriti' }`, con i testi "Attendi qualche secondo e riprova", "L'email è già stata inviata", "Tentativi esauriti: scarica il PDF"; se l'invio parte, chiama `redirect` sulla stessa pagina;
  - `GET /riepilogo/[token]/pdf` → 200 con il PDF, 404 se il token non esiste o la riga è scaduta;
  - `/riepilogo/[token]` con un token sconosciuto o scaduto → pagina 404 (`notFound()`).
- Tipi di `valuta`:

  ```ts
  valuta(config: { product: string; size: string; selections: Record<string, string | string[]> }, prodotto: Prodotto)
    → { valida: boolean;
        errori: { tipo: 'struttura' | 'regola'; group?: string; value?: string; messaggio: string }[];
        disattivati: Record<string /* group */, Record<string /* value */, string /* messaggio */>> }
  ```
- Runtime: PDFKit e resvg non girano nel runtime Edge. `nodejs` è già il predefinito: nessun file esporta `runtime`, e un file `'use server'` non potrebbe farlo, perché può esportare solo funzioni async.

**P9. Strumenti di prova.**
- **Vitest:** `valuta`, schemi Zod, validazione dei file del catalogo, generazione di un PDF per prodotto.
- **Playwright** con **`@axe-core/playwright`:** flusso completo da tastiera e controllo axe sulle pagine del flusso.
- **Mailpit** nelle prove del flusso: la prova legge dall'API di Mailpit che l'email sia arrivata con l'allegato.

**P10. Versioni.** Node.js 24 LTS; Next.js all'ultima versione stabile al momento della PR del contratto; PostgreSQL 17. Le dipendenze si installano con versioni esatte (`save-exact=true` in `.npmrc`), così i due portatili hanno lo stesso codice.

**P11. Testi.**
- *Informativa:* si parte dalla bozza già presente nel mockup (titolare, dati, finalità, conservazione, destinatari, diritti, cookie), con la base giuridica proposta nella sezione 12 e il reclamo al Garante. La versione si salva come stringa costante (ad esempio `2026-11-v1`).
- *Email al cliente:* oggetto "Il riepilogo della tua sauna Aladdin, n. 2026-000042"; corpo con saluto, elenco delle scelte, PDF in allegato, nota "messaggio automatico, non rispondere" e indirizzo per chiedere la cancellazione.
- *Notifica al progetto:* oggetto "Nuova richiesta di riepilogo n. 2026-000042"; corpo con prodotto, scelte e data, **senza l'email del cliente**, che resta solo nel database. Così le notifiche non contengono dati personali; le copie delle email al cliente in "Posta inviata" si cancellano con la procedura della sezione 12.

**P12. Viste nel PDF.** Una pagina A4 verticale con la vista diagonale in grande, la vista frontale più piccola e sotto l'elenco delle scelte. Per i prodotti con la foto: la foto della versione e i campioni dei materiali.

**P13. Texture.** Le texture del sito sono foto di campioni (ad esempio 1394 × 902 px), non immagini ripetibili senza giunture. Il mockup, invece, usa venature generate dal codice e colori approssimati. Le due strade considerate:
- *A:* la foto del campione si adatta all'intera zona (`patternContentUnits="objectBoundingBox"`), senza ripetizione. È più fedele al catalogo, ma su zone grandi l'immagine si allarga;
- *B:* venature procedurali come nel mockup, con il colore preso dalla foto. Sono leggere e ripetibili, ma meno fedeli.

  *Resa della foto (A):* il generatore conosce il riquadro di ogni forma. Per ogni forma crea un pattern con `patternUnits="userSpaceOnUse"` e `x`, `y`, `width`, `height` uguali al riquadro; dentro, un `<image>` con le stesse misure e `preserveAspectRatio="xMidYMid slice"`. La foto si ritaglia ma non si deforma, e su un fronte a pannelli si ripete per pannello, come i pannelli veri. La prova della fase 2 lo verifica anche in resvg. Con `texture: null` (ad esempio l'alluminio) il generatore usa `color`, e il controllo "presenza delle texture" salta quel materiale.

  *Decisione:* A per legni e gres. Se nella prova della fase 2 la venatura di un materiale non si riconosce su una zona (criterio della sezione 9.1), per quel materiale si passa a B; in quel caso la frase "texture del catalogo" nelle sezioni 2 e 9 va corretta per quel materiale. Una terza strada, ritoccare le foto per renderle ripetibili, è stata scartata perché richiede lavoro manuale per ogni materiale.

**P14. Font.** Jost e IBM Plex Sans, gli stessi del mockup, entrambi con licenza SIL Open Font License, salvati nel repository (`src/fonts/`) come file TTF **statici**, presi dalla cartella `static/` dei pacchetti di Google Fonts, non variabili, perché PDFKit incorpora solo l'istanza predefinita di un font variabile e resvg supporta poco gli assi di variazione: `Jost-Regular.ttf`, `Jost-Medium.ttf`, `IBMPlexSans-Regular.ttf`, `IBMPlexSans-SemiBold.ttf`. Sul server il percorso è `path.join(process.cwd(), 'src/fonts', nome)`. Pesi: Jost Medium per titoli e quote, IBM Plex Sans Regular per il testo e SemiBold per le etichette. Gli stessi file li usano `next/font/local` nelle pagine, resvg per le quote nelle viste e PDFKit nel PDF. `next/font/local` genera un nome di famiglia proprio: per questo i font si dichiarano anche con un `@font-face` scritto a mano, con `font-family: 'Jost'` e `'IBM Plex Sans'` sugli stessi file, così l'SVG usa lo stesso nome nel browser e in resvg. Il mockup oggi li carica da Google Fonts: nel progetto non si fa (scheda 0008).

**P15. Dal mockup al codice.** Il mockup scrive le definizioni SVG direttamente nel DOM (`innerHTML`) e usa un contatore globale per gli `id`. Per diventare la funzione pura della sezione 9.3 servono tre cambiamenti:
- le definizioni (`<defs>`) entrano nella stringa SVG di ogni vista;
- il prefisso degli `id` diventa un parametro;
- il catalogo di esempio scritto nel codice si sostituisce con i file di `data/prodotti/`.

  Il file HTML del mockup si salva in `docs/mockup/configuratore-saune.html` come riferimento.

### 20.4 Domande per il tutor

Le tre domande hanno avuto risposta il 2026-11-11 (sezione 20.2):
1. privacy (base giuridica, durata, contitolarità, informativa): proposta confermata (sezione 12);
2. fonte per optional e incompatibilità: non esiste (P3);
3. schede di preinstallazione dell'Area Pro: si possono usare, solo sul computer locale (sezione 9.4).

### 20.5 Ancora da fare

- Creare l'**email del progetto**: finché manca, il codice usa la variabile `PROJECT_EMAIL` e l'informativa un segnaposto.
- Annotare cosa è stato verificato di Docker su entrambi i portatili (ad esempio `docker run hello-world` con WSL2).
- Verificare sulla scheda di preinstallazione dell'Area Pro l'ordine delle dimensioni di Aladdin e se la pedana 120 × 120 cm entra nel taglio 45 (appendice A), prima di scrivere la `geometry` di Aladdin (fase 2).

---

## 21. Fuori dal progetto

- **Prezzi, sconti, IVA e preventivi.** Esclusi per indicazione del tutor; il listino reale non è disponibile. Il documento si chiama "riepilogo".
- **Funzioni di intelligenza artificiale.** Escluse per indicazione del tutor; le regole di migrabilità lasciano aperta la possibilità di aggiungerle.
- **3D in tempo reale.** Escluso da questa versione.
- **Applicazione dentro Docker** e Dockerfile dell'applicazione.
- **Pulizia periodica con uno scheduler** e cancellazione automatica nella casella Gmail.
- **Viste SVG per tutto il catalogo** e vista interna. La pianta solo se avanza tempo prima del blocco delle funzioni.
- **Ricontatto dei clienti** e consenso commerciale.
- **PDF accessibile**, link di conferma dell'email, protezioni anti-spam.
- **Più lingue.** Solo italiano.
- **Conformità AA completa certificata**, compresa l'anteprima SVG.
- **Uso reale da parte dell'azienda** o pubblicazione.

---

## 22. Come presentare le scelte

1. Aprire con i vincoli: tempo limitato, due persone, demo locale, email reale obbligatoria, grafica importante. Ogni scheda diventa così una conseguenza dei vincoli.
2. Mostrare la demo come una storia unica: scegli → vedi → ricevi. Poi provare apposta una scelta incompatibile e, con la rete staccata, il percorso di errore con "Riprova". Un ripiego che funziona convince più di una slide.
3. Una sola slide con 5 scelte e un motivo ciascuna:
   - PostgreSQL + JSONB (il dominio è relazionale);
   - Docker solo per il database (indicazione del tutor, riproducibilità);
   - Drizzle (migrazioni e tipi in due);
   - SVG parametrico invece del 3D (peso, qualità, replicabile per le famiglie supportate);
   - dati minimi e nessun cookie.
4. Per ogni scelta dire l'alternativa scartata e cosa farebbe cambiare idea, ad esempio "Puppeteer se la fedeltà del PDF non bastasse" o "Postgres online cambiando solo `.env` se si pubblicasse".
5. Presentare le esclusioni (prezzi, IA, 3D, applicazione in Docker, scheduler) come decisioni motivate. Mostrare la tabella delle famiglie di layout e il tempo misurato per prodotto: trasformano "il più possibile" in un dato difendibile.
6. Avere pronta la risposta a "perché il catalogo sta anche nel database, se la fonte sono i file?": vincoli come seconda difesa, query delle pagine, coerenza con le configurazioni salvate, indicazione del tutor.

---

## 23. Modifiche rispetto alla v5

| Punto | v5 | v6 |
|---|---|---|
| Transazione e invio | Salvataggio e stato dell'invio "in una transazione" | La riga si salva prima, l'invio è fuori da ogni transazione, gli stati si aggiornano dopo (6.5, 10.2) |
| "Riprova" | Non era detto se creava una riga nuova | Agisce sulla stessa riga; pulsante disattivato durante l'invio (10.3) |
| Docker | Un solo comando avviava anche l'applicazione in Docker; `Dockerfile` tra le cartelle | Solo il database in Docker; `npm run demo`; Dockerfile fuori dal progetto (7, 21) |
| Anteprima | Viste "generate una sola volta" in `public/` | Funzione pura a runtime, in `public/` solo texture e foto (9.3) |
| 3D | "Se avanza tempo" | Escluso; il tempo che avanza va alla rifinitura SVG (9.1, 21) |
| Pulizia a 12 mesi | "All'avvio e a intervalli" | Scadenza in una colonna, letture filtrate, pulizia all'avvio e a mano (12) |
| Casella Gmail | "Segue il limite dei 12 mesi" | Procedura manuale documentata (12) |
| Notifica fallita | "Registrata in un log" | Stato nella colonna con l'errore; log solo sull'output (10.3) |
| URL e configurazione salvata | Non distinti | L'URL contiene solo lo stato del client (10.1) |
| "Se vuole, riceve per email" | Sembrava esistere un salvataggio senza email | Si salva solo insieme alla richiesta del riepilogo (2) |
| Utenti della demo | "Usata solo dagli sviluppatori" | Sviluppatori e tutor (10.6, 12) |
| Generatore | "Uguale per tutti i modelli" | Per le famiglie di layout supportate, con verifica e regola di decisione (9) |
| Prova del PDF | "All'inizio", ma nel calendario solo nella seconda fase | Fase 2, dopo le prove di Gmail e Docker (15.5) |
| Libreria PDF e ripiego | Non indicati | `@resvg/resvg-js` per l'immagine, PDFKit per l'impaginazione, ripieghi `flat` e `pdf-lib` (11, scheda 0015) |
| Migrazione del database | "Cambiando solo la connessione" | Solo configurazione (connessione, SSL) (5, 13) |
| Motivo della migrabilità | "Il progetto potrebbe essere pubblicato" | Non è prevista pubblicazione; le regole non costano e non la precludono (13) |
| SQLite | "Due sviluppatori non possono condividerlo" | Motivi veri: indicazione del tutor, stesso motore online; differenze minori su JSON e chiavi esterne (6.6) |
| MySQL | "Ecosistema meno ampio" | Supporto JSON meno completo, vincoli `CHECK` solo dalla 8.0.16 (6.6) |
| Prisma | "Alternativa valutata" | Ipotesi iniziale, rivalutata e scartata, come nella scheda 0003 (6.7) |
| Cookie | "Nessun servizio esterno" | Nessuna risorsa esterna caricata nel browser; Gmail è dichiarato (2, 12) |
| Base giuridica | "Da definire" | Art. 6(1)(b) per l'invio e 6(1)(f) per la conservazione, confermati dal tutor (12) |
| Accessibilità | axe "a ogni passo" | Tastiera a ogni modifica, axe e verifica formale in tre momenti fissi (14) |
| Valutazione | "La documentazione fa parte della valutazione" | Non c'è voto; la documentazione fa parte della consegna (1, 19) |
| Carico di lavoro | Tutto il generatore su M | N trascrive dati e geometria; contatto sullo schema Zod (15.1) |
| Libreria PDF | Non scelta | PDFKit, scheda 0015 (11) |
| Tutor e valutatore | Non distinti | Stessa persona: solo "tutor" (3) |
| Optional e regole | Dati come presenti nel catalogo | Il sito non li riporta e il tutor conferma che non c'è altra fonte: nessun optional, criterio 3 riscritto (16, 20.3 P3) |
| Punti aperti | Elenco senza soluzioni | Decisioni P1–P15, domande al tutor chiuse (20.2, 20.3, 20.4) |
| Viste | Esterna e frontale interna | Frontale e diagonale, entrambe esterne; interno visibile dal vetro (9.1, scheda 0021) |
| Seed | Upsert senza cancellazioni | Sincronizzazione completa in transazione; catalogo letto dal database dalla fase 3 (8.2, scheda 0022) |
| Notifica al progetto | Non bloccava la risposta | Si attende entro RNF4 (10.2, scheda 0023) |
| `request_id` | Generato dal client | Generato dal server nel modulo (8.1, scheda 0024) |
| Nuove sezioni | — | Contesto, glossario, requisiti, criteri di successo, piano della demo, tabella dei rischi, punti aperti |

---

## 24. Appendice A: dati di Aladdin raccolti dal sito

Fonte: [effe.it/prodotto/aladdin](https://www.effe.it/prodotto/aladdin/), consultata il 2026-11-11. La bozza nel formato P1 è [`data/prodotti/aladdin.json`](data/prodotti/aladdin.json).

| Dato | Valore sul sito |
|---|---|
| Design | Rodolfo Dordoni, con Michele Angelini |
| Versioni | Rovere 60, Wengé 60, Rovere 45, Wengé 45 |
| Dimensioni | 60: "200 x 210 x 160 cm"; 45: "180 x 210 x 140 cm" |
| Materiali | Rovere rigatino o Wengé rigatino (interno, esterno); specchio (parte bassa, fisso); alluminio anodizzato (frame e cover della stufa, fisso) |
| Pedana | Pedana interna a pavimento 120 × 120 × 5 cm in gres Masterpiece (LEA Ceramiche): Moka, Light, Siena |
| Optional | Nessuno indicato |
| Regole di compatibilità | Nessuna indicata |
| Immagini | Una foto per versione (PNG 1201 × 1001 px), campioni dei materiali (JPG 1394 × 902 e 697 × 451 px), galleria fotografica |
| Documenti tecnici | Schede di preinstallazione, manuali e file 3D per 45 e 60, solo nell'Area Pro |

**Lacune e incertezze**
- *Ordine delle dimensioni.* Per Aladdin il sito scrive "200 x 210 x 160", per Sky "200 x 150 x 201". La lettura più probabile è larghezza × altezza × profondità per Aladdin e larghezza × profondità × altezza per Sky (l'altezza di una sauna è intorno a 2 m). La bozza usa 200 × 160 × 210 (L × P × H), come il mockup; va verificato sulla scheda di preinstallazione.
- *Pedana nel taglio 45.* Il sito non dice se la pedana da 120 × 120 cm entra nel taglio 45 (profondità esterna 140 cm). Si verifica sulla scheda di preinstallazione (sezione 20.5); se non entra, diventa la prima regola reale (`only_with_size`).
- *Pedana facoltativa.* Il sito la presenta come completamento ("può essere completata"): la bozza la tratta come gruppo con il valore "Nessuna pedana" predefinito.
- *Colori dei materiali.* I valori esadecimali sono quelli approssimati del mockup e servono solo per il ripiego a colori pieni.

## 25. Appendice B: il mockup esistente

Il mockup è un artifact HTML/JS di claude.ai ("Configuratore saune"), generato a partire dai file forniti dall'autore. Va salvato in `docs/mockup/configuratore-saune.html` (P15).

- **Viste:** Esterno, Interno (frontale interna), Pianta e un pannello Materiali.
- **Prodotti:** Sky, Air, Aladdin, Yoku S, Cabanon con dati di esempio. Solo Aladdin ha la vista esterna dedicata e più curata; gli altri usano un disegno generico per tipo.
- **Materiali:** colori approssimati e venature generate dal codice (`feTurbulence`), non le foto delle texture del sito (P13).
- **Passaggi:** Modello, Misure, Materiali, Optional, Riepilogo, con modulo email e bozza di informativa.
- **Dati inventati da non riportare nel catalogo:** gli optional (cromoterapia, audio, mensole, pedana aggiuntiva) e la regola "audio non disponibile per Sky 30".
- **Da correggere nel porting:** font caricati da Google Fonts (scheda 0008); definizioni SVG scritte nel DOM e `id` con contatore globale (P15); la nota "nel prototipo reale qui compaiono render o un modello 3D", in contrasto con l'esclusione del 3D (sezione 21).
