# Configuratore di saune: analisi e scelte tecniche (v7)

Questa versione sostituisce la v6, conservata come storico in `archivio/` insieme alla v5 e al brainstorm EGM (`concepts_brief.md`). Dove i testi sono in contrasto vale quanto scritto qui. Le modifiche rispetto alla v6 sono nella sezione 23.1: riguardano le viste, la forma dell'interfaccia, le regole di compatibilità e il calendario.

---

## 1. Contesto e vincoli

- Il progetto è una **demo di tirocinio**: non è prevista una pubblicazione e l'azienda non lo userà.
- **Non c'è un voto.** Alla consegna contano il funzionamento e la motivazione delle scelte. La qualità grafica è una priorità degli sviluppatori.
- **L'invio reale del PDF per email è un requisito** e non si può togliere.
- Il numero di prodotti è "il più possibile" nel tempo disponibile; il minimo è fissato nei criteri di successo (sezione 16).
- La consegna è il **26 novembre 2026**. Gli sviluppatori sono due, Nicolas (N) e Marko (M), a 8 ore al giorno dal lunedì al venerdì, a partire dal via libera del tutor.
- La demo gira su uno dei due portatili degli sviluppatori, entrambi preparati allo stesso modo. Durante la demo il tutor inserisce un indirizzo email vero.

---

## 2. Obiettivo e decisioni prese

**Problema.** Sul sito effe.it il cliente vede ogni sauna solo nelle versioni fotografate e non può vedere insieme le combinazioni di taglio, essenza e pedana. Il tirocinio deve dimostrare che un configuratore web può mostrare queste combinazioni e mandare al cliente un riepilogo, con scelte tecniche motivate.

Un configuratore web, in **Next.js + React**, per le saune del catalogo effe.it. Il cliente sceglie modello, taglio e materiali e vede un'anteprima che cambia in tempo reale. Con il pulsante "Ricevi il riepilogo" la configurazione viene salvata nel database, il cliente riceve per email il **riepilogo in PDF** e l'email del progetto riceve una notifica. **La configurazione si salva solo insieme alla richiesta del riepilogo**: non esiste un salvataggio senza email.

Ogni decisione ha la sua scheda nel [registro delle decisioni](docs-iniziali/docs/decisioni/README.md), con le alternative scartate e i motivi. Fino allo scaffold dell'applicazione (fase 2) le schede stanno in `docs-iniziali/docs/decisioni/`, poi in `docs/decisioni/` (sezione 19).

| Tema | Decisione | Scheda |
|---|---|---|
| Database | PostgreSQL con colonne JSONB per gli attributi particolari | 0001 |
| Esecuzione | Solo PostgreSQL in Docker; l'applicazione gira direttamente sul computer | 0014 (sostituisce 0002) |
| ORM | Drizzle, non SQL puro e non Prisma | 0003 |
| Applicazione | Next.js con Server Action e Route Handler, Zod, shadcn/ui; pagina unica a passaggi, con l'invio in una finestra di dialogo | 0019, 0026 |
| Catalogo | File JSON nel repository, caricati nel database dal seed | 0018 |
| Validazione | Nessuna regola di compatibilità e nessun optional; il server valida ogni configurazione con la funzione `valida` | 0027 (sostituisce 0020) |
| Salvataggio | Un solo pulsante: salva nel database, invia il PDF al cliente, notifica il progetto; la riga salvata registra lo stato di ogni invio | 0006 |
| Email | Nodemailer con un Gmail dedicato; Mailpit in sviluppo | 0017 |
| PDF | Impaginato sul server con PDFKit; l'SVG si converte in PNG con `@resvg/resvg-js`; ripiego a colori pieni | 0015 (da confermare con la prova) |
| Ricontatto | Nessun ricontatto dei clienti, nessun consenso commerciale | 0007 |
| Privacy | Presa visione dell'informativa; conservazione 12 mesi con scadenza in una colonna; cancellazione su richiesta | 0007 |
| Cookie | Nessun cookie e nessuna risorsa esterna caricata nel browser | 0008 |
| Accessibilità | WCAG 2.1 livello AA sul configuratore e sulle sue finestre di dialogo, usabile da tastiera; il PDF per ora non deve essere accessibile | 0009 |
| Grafica | Viste SVG pronte per prodotto e taglio, generate da uno script a partire dal modello 3D, con le texture del catalogo; foto ufficiale con i campioni dei materiali dove il modello 3D manca | 0025 (sostituisce 0010, 0016, 0021) |
| Lingua | Solo italiano | 0011 |
| Migrabilità | Regole di progetto che non precludono un database online (sezione 13) | 0012 |
| Git | Organizzazione del repository | 0013 |
| Esclusioni | Prezzi e intelligenza artificiale fuori dal progetto (sezione 21) | 0004, 0005 |

**Alternative scartate, in sintesi** (motivi nelle schede):
- Database, ORM ed esecuzione: MySQL, SQLite, MongoDB, SQL puro, Prisma, applicazione in Docker, Supabase (sezioni 6 e 7).
- Applicazione: Vite con un backend separato; solo Route Handler (API REST); stato nei segmenti del percorso (0019); route separate con una pagina di conferma (0026).
- Catalogo: solo nel database con un'interfaccia di amministrazione; solo nei file, senza database; file TypeScript o YAML (0018).
- Viste: generatore a parametri; ricalco di immagini renderizzate altrove; 3D in tempo reale (0025).
- Regole di compatibilità e optional: motore delle regole provato su un catalogo finto (0027).
- Email: servizi transazionali (Resend, SendGrid, Mailgun); notifica in copia nascosta (0017).
- PDF: `@react-pdf/renderer`, jsPDF, Playwright o Puppeteer, conversione dell'immagine nel browser (0015, sezione 11).

Le esclusioni (prezzi, intelligenza artificiale, 3D, applicazione in Docker e le altre) sono raccolte nella sezione 21; i rischi e le mitigazioni nella tabella della sezione 20.1.

---

## 3. Glossario

| Termine | Significato |
|---|---|
| **Effe / effe.it** | L'azienda produttrice e il suo sito, da cui provengono catalogo, immagini e texture |
| **Prodotto** (o modello) | Una sauna del catalogo, ad esempio Aladdin. Nel codice si usa sempre `product` |
| **Taglio** | Una misura del prodotto, con codice ed etichetta, ad esempio Aladdin 60 (200 × 160 × 210 cm, larghezza × profondità × altezza). Nel codice `size` |
| **Versione** | Una combinazione di taglio ed essenza con una propria foto ufficiale sul sito, ad esempio "Aladdin Rovere 60" |
| **Gruppo di opzioni** | Una scelta da fare, ad esempio Essenza o Pedana in gres. Ogni gruppo ha una sola scelta, obbligatoria |
| **Valore di opzione** | Una delle alternative di un gruppo, ad esempio Rovere rigatino |
| **Essenza** | Il legno della sauna. Nel codice il gruppo si chiama `wood` |
| **Pedana** | Il piano a pavimento in gres che il catalogo propone per alcuni prodotti. Dove c'è, una finitura è sempre selezionata |
| **Materiale** | Legno, alluminio, gres o specchio, con colore e texture |
| **Zona** | Una parte della vista che prende colore e texture da un materiale (`ext`, `int`, `furn`, `floor`, `mirror`, `frame`) o che ha un colore fisso (`stove`, `metal`, `glass`) |
| **Vista** | Uno dei quattro modi di guardare la configurazione: Esterno (prospettiva a tre quarti), Frontale, Pianta, Materiali (pannello dei campioni) |
| **Script delle viste** | Il programma in `scripts/viste/` che legge il modello 3D di un taglio e ne scrive le viste SVG (sezione 9) |
| **Regole del modello** | Il file, uno per prodotto, che dice allo script a quale zona appartiene ogni parte del modello 3D |
| **Snapshot** | La copia delle scelte, con le loro etichette, salvata nella riga della configurazione |
| **Area Pro** | L'area riservata di effe.it con i file 3D e 2D (DWG, FBX, SKP) |
| **Tutor** | Il referente del tirocinio: ha dato le indicazioni sul progetto e valuta la demo. Le indicazioni citate nel documento sono state date a voce, non per iscritto |
| **Livello A / livello B** | I due modi di mostrare un prodotto: A con le viste SVG generate dal modello 3D, B con la foto ufficiale e i campioni dei materiali (sezione 9.2) |
| **Contratto condiviso** | Tipi, schemi, funzioni comuni e formato delle viste, fissati all'inizio in una sola pull request (sezione 15.2) |
| **Fase** | Una delle dieci tappe del lavoro, numerate da 1 a 10 (sezione 15.5) |
| **P1–P15** | Le decisioni sui punti aperti prese il 2026-11-11 e riviste il 2026-11-12 (sezione 20.3) |
| **Seed** | Lo script che carica i file del catalogo nel database (sezione 8.2) |
| **Scheletro** | La prima versione che funziona dall'inizio alla fine con un prodotto (fase 3) |
| **Blocco delle funzioni** | La fase 7, da cui non si aggiungono funzioni nuove; lo schema del database è già bloccato dalla fine della fase 4 |

---

## 4. Requisiti

**Funzionali**
- **RF1.** Il cliente sceglie prodotto, taglio e materiali. Ogni gruppo ha una scelta sola, sempre valorizzata.
- **RF2.** L'anteprima si aggiorna a ogni scelta e offre quattro viste: Esterno, Frontale, Pianta, Materiali.
- **RF3.** Il server rifiuta una configurazione non valida (prodotto, taglio o valore inesistente), anche se arriva da un URL modificato a mano.
- **RF4.** Lo stato delle scelte sta nell'URL, che si può copiare e condividere.
- **RF5.** "Ricevi il riepilogo" salva la configurazione, invia al cliente il PDF e notifica l'email del progetto.
- **RF6.** Se l'invio fallisce, il cliente vede un messaggio che dice che l'email non è partita e indica una di queste cause: server di posta non raggiungibile, accesso all'account rifiutato, tempo scaduto, indirizzo rifiutato. Il messaggio offre "Scarica il PDF" e, se restano tentativi, "Riprova", che non crea una seconda configurazione.
- **RF7.** Le configurazioni scadono dopo 12 mesi e si possono cancellare su richiesta.

**Non funzionali**
- **RNF1.** WCAG 2.1 AA sul configuratore e sulle sue finestre di dialogo, uso completo da tastiera.
- **RNF2.** Nessun cookie e nessuna risorsa esterna caricata nel browser.
- **RNF3.** Avvio della demo da clone pulito con `npm ci` e `npm run demo`, una volta copiato il file `.env` e soddisfatti i prerequisiti della sezione 7.
- **RNF4.** Il risultato dell'invio è visibile entro 60 secondi.
- **RNF5.** Solo italiano.

---

## 5. Cosa deve gestire il database

1. **Opzioni eterogenee.** Ogni prodotto ha tagli, gruppi di scelte e materiali diversi. Un modello a colonne fisse non regge.
2. **Dati strutturati e legati tra loro.** Prodotto → tagli → gruppi di opzioni → valori → materiali.
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
| Adatto a dati relazionali | Prodotti, tagli, opzioni e materiali sono entità legate |
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

1. **Il dominio è relazionale.** Il catalogo è un insieme di entità legate: un valore appartiene a un gruppo, un gruppo a un prodotto, un valore rimanda a un materiale. PostgreSQL le fa rispettare con chiavi esterne, vincoli di unicità e `CHECK`: non si può salvare un'opzione per un prodotto inesistente né due tagli con lo stesso codice. I file del catalogo sono già validati con Zod prima del seed (sezione 8.2); i vincoli del database sono la seconda linea di difesa sulle colonne relazionali.
2. **Le opzioni eterogenee non richiedono di uscire dal modello relazionale.** Gruppi e valori di opzione sono tabelle generiche, uguali per tutti i prodotti. Gli attributi davvero particolari di un singolo prodotto (ad esempio un dato tecnico che vale per un solo taglio) stanno in una colonna **JSONB**, che PostgreSQL può interrogare e, se servisse, indicizzare. Il contenuto delle colonne JSONB non è controllato dai vincoli del database: lo valida Zod prima della scrittura.
3. **La configurazione salvata è uno snapshot.** Alla richiesta si salva in una colonna JSONB l'elenco delle scelte con le loro etichette. Un cambio successivo del catalogo non altera le scelte e le etichette già salvate. L'invio delle email avviene **fuori** da qualsiasi transazione, perché un invio SMTP non si può annullare: la riga si salva prima, e lo stato di ogni invio si aggiorna dopo (sezione 10.2).
4. **Non c'è dipendenza da un fornitore.** PostgreSQL è uno standard offerto da molti servizi online; le regole della sezione 13 servono a non precludere il passaggio.
5. **È adatto al lavoro in due.** Schema, migrazioni e dati iniziali sono file nel repository: chi clona o aggiorna il progetto ricostruisce lo stesso database.

### 6.6 Perché non le alternative

- **MySQL.** Il modello relazionale andrebbe benissimo e la scelta sarebbe difendibile. Non offre però vantaggi rispetto a PostgreSQL per questo progetto: il supporto ai dati JSON è meno completo (il tipo JSON non ha un equivalente diretto degli indici GIN di JSONB) e i vincoli `CHECK` sono applicati solo dalla versione 8.0.16.
- **SQLite.** Ottimo per un prototipo locale. Non è stato scelto perché il tutor ha indicato un database in Docker e perché il database usato in sviluppo deve essere lo stesso motore di un eventuale database online. Le differenze tecniche sono minori: SQLite non ha indici GIN per i dati JSON e le chiavi esterne vanno attivate a ogni connessione (`PRAGMA foreign_keys`). Non conta invece la condivisione: anche con PostgreSQL ogni sviluppatore ha il proprio database locale.
- **MongoDB.** È tentante per le opzioni variabili, ma il catalogo ha molte relazioni che in MongoDB andrebbero controllate dal codice, non dal database. Le migrazioni dichiarative sono poco supportate e la flessibilità che offre si ottiene già con JSONB.

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
  3. gli stati di invio rimasti `pending` da più di 2 minuti diventano `failed` (sezione 10.3);
  4. `next build`;
  5. controllo preliminare (sezione 10.5). Database, migrazioni e prodotti caricati sono **bloccanti**: un FAIL ferma l'avvio. Gmail, la conversione di prova e la presenza di texture e viste sono **avvisi**: il FAIL si stampa ma l'avvio continua, così in caso di guasto resta il ripiego "Scarica il PDF";
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
| `product` | `code`, `name`, `designer`, `description`, `viewer` (`svg` o `image`), `default_size`, `fixed_zones` JSONB (zona → materiale), `photos` JSONB (versione → percorso), `photo_group` (codice del gruppo che cambia la foto, nullabile), `source` JSONB |
| `product_size` | prodotto, `code`, `label`, `width_cm`, `depth_cm`, `height_cm`, `views_from` (codice del taglio di cui riusa le viste, nullabile; sezione 9.2), `attributes` JSONB; unico per (prodotto, `code`) |
| `material` | `code` unico in tutto il catalogo, `name`, `type` (`wood`, `aluminium`, `ceramic`, `mirror`), `color`, `texture` |
| `option_group` | prodotto, `code`, `label`, `step`, `zones`, `default_value`; unico per (prodotto, `code`) |
| `option_value` | gruppo, `code`, `label`, materiale collegato, `attributes` JSONB; unico per (gruppo, `code`) |
| `configuration` | vedi sotto |

Non c'è una tabella delle regole e i gruppi non hanno un tipo: ogni gruppo è a scelta singola e obbligatoria (scheda 0027). I file delle viste non stanno nel database: si trovano per convenzione in `public/viste/<prodotto>/<taglio>/` (sezione 9).

La tabella `configuration` contiene:
- `id`; il `number` della configurazione (formato `AAAA-NNNNNN`, P5 nella sezione 20.3) non è una colonna, ma si calcola in lettura dall'anno di creazione e dall'`id`;
- `token`, casuale e unico, usato da "Riprova" e nell'URL di "Scarica il PDF" (P4);
- `request_id`, UUID generato dal client a ogni apertura della finestra di invio, unico, contro i doppioni da doppio clic (P4, scheda 0026);
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

Le etichette sono quelle del catalogo; per il taglio si aggiungono le misure. Lo snapshot contiene solo i gruppi del prodotto. Il taglio sta fuori da `selections` perché ha una tabella propria; nell'URL usa comunque la chiave `size` come i gruppi (P7). `productName` serve all'oggetto dell'email e all'intestazione del PDF anche se il prodotto esce dal catalogo.

I nomi delle colonne seguono i campi dei file JSON (P1), passando dal camelCase del JSON allo snake_case delle colonne; `default` diventa `default_value` perché `default` è una parola riservata in SQL. `step` è il passaggio in cui compare il gruppo (1 = Misure, 2 = Materiali; il taglio sta sempre in Misure), `zones` sono le zone della vista a cui il gruppo applica il materiale, `default_value` è il valore predefinito. Più file possono dichiarare lo stesso materiale: il seed fallisce se due file usano lo stesso `code` con dati diversi. Le colonne del database e i campi dei file del catalogo sono in inglese, e così le chiavi che li riprendono nei tipi (`group`, `value`); i nomi di funzioni, file e cartelle del progetto sono in italiano; le etichette mostrate al cliente sono in italiano. Tipi, chiavi e vincoli definitivi si fissano nel contratto condiviso (sezione 15.2) e poi si documentano in `docs/modello-dati.md`.

### 8.2 Catalogo come file, database derivato

Ogni prodotto è un file in `data/prodotti/` con tagli, opzioni e materiali. I file sono la **fonte** del catalogo; dalla fase 3 l'applicazione legge **solo dal database**:
- fino allo scheletro (fase 3) l'interfaccia importa i file direttamente, come "catalogo finto"; dalla fase 3 il configuratore riceve i prodotti dal server, letti dal database, e il server applica `valida` sugli stessi dati;
- il seed valida tutti i file con Zod **prima** di scrivere: un file sbagliato fa fallire il seed e il database non cambia;
- poi **sincronizza** le tabelle del catalogo in una sola transazione: inserisce, aggiorna e cancella, così il database coincide con i file. Le chiavi esterne del catalogo sono `RESTRICT`: si cancellano prima i valori, poi i gruppi, i tagli e i prodotti; un materiale si cancella solo se nessun file lo dichiara più. Se un passo fallisce, la transazione si annulla. La tabella `configuration` non si tocca e non ha chiavi esterne verso il catalogo (sezione 8.1), quindi le configurazioni salvate non si perdono.

Dopo ogni modifica a un file si rilancia il seed (lo fa anche `npm run demo`). Il database serve per i vincoli, per la lettura del catalogo da parte della pagina e per le configurazioni salvate. Il lavoro di inserimento si divide per file, senza conflitti.

---

## 9. Grafica

### 9.1 Obiettivo e scelta

**Obiettivo:** immagini grafiche di qualità, non 3D in tempo reale: i modelli 3D dell'Area Pro non possono entrare nel repository. Un'anteprima è accettabile se ogni materiale scelto si riconosce dalla sua texture e se forma e proporzioni corrispondono alla foto ufficiale della versione. Il controllo si fa a vista nella pagina `/galleria` (sezione 18).

**Scelta: viste SVG pronte, generate da uno script a partire dal modello 3D** (scheda 0025). Le viste non si disegnano nell'applicazione: si producono prima, una volta per taglio, e l'applicazione ne cambia solo colori e texture.

Il configuratore mostra quattro viste, come il mockup:
- **Esterno:** la sauna in prospettiva a tre quarti, con il fronte, un fianco e il tetto;
- **Frontale:** la parete frontale vista di fronte, con l'interno visibile attraverso il vetro;
- **Pianta:** la sauna vista dall'alto, senza il tetto;
- **Materiali:** un pannello con i campioni dei materiali scelti e la zona a cui si applicano.

La vista dall'interno è scartata. Nel PDF vanno l'esterno in grande e la frontale più piccola (P12).

**Come lavora lo script.** Per ogni taglio di cui esiste il modello FBX:
1. legge il modello e lo porta in centimetri;
2. assegna ogni faccia a una zona, con le regole del modello;
3. disegna il modello da tre camere fisse (esterno, frontale, pianta), tenendo per ogni punto la faccia più vicina e un livello d'ombra da 0 a 5 secondo l'orientamento della faccia;
4. ricalca le regioni con la stessa zona e la stessa ombra in poligoni semplificati;
5. scrive un file SVG per vista in `public/viste/<prodotto>/<taglio>/`, con `data-zone` e `data-shade` su ogni poligono.

I file nativi restano sul computer di chi lancia lo script; nel repository entrano lo script, le regole dei modelli e le viste prodotte.

**Stato.** Le viste di Aladdin 60 presenti nel mockup sono state ricavate una sola volta dal modello 3D con una procedura non conservata: pesano fino a 312 KB l'una e usano variabili CSS e `color-mix()`, che resvg non supporta. Vanno rigenerate con lo script. Il 2026-11-12 lo script di prova è stato eseguito sul modello FBX di un secondo prodotto: tre viste in 6 secondi, 18 KB la vista esterna, tutte convertite in PNG con resvg. Restano da fare:
- le texture (nella prova i colori sono pieni);
- il pavimento, che nella prova non viene disegnato;
- il confronto di ogni vista con la foto ufficiale, anche per escludere che sia specchiata;
- la misura del tempo che serve per scrivere le regole di un modello: la stima è di una o due ore, ma non è un dato misurato.

### 9.2 Limiti e come si riduce il rischio

1. **Serve un modello FBX.** Lo script non legge i DWG: un taglio che ha solo il DWG usa il livello B. L'inventario dei file disponibili per ogni prodotto e taglio va in `docs/catalogo-inventario.md`.
2. **Le zone non sono nel file.** Il modello provato distingue solo stufa, vetro, metallo, pavimento e "tutto il legno": esterno, interno e panche si separano con regole geometriche (posizione, dimensioni e parte connessa di ogni faccia), scritte per quel modello in `scripts/viste/regole/<prodotto>.ts`.
3. **Un file descrive un taglio e una sola variante.** Se il catalogo propone varianti che cambiano la forma (ad esempio più layout del fronte), si inserisce quella di cui esiste il modello e le altre restano fuori.
4. **Riuso delle viste tra tagli.** Un taglio senza modello può usare le viste di un altro taglio dello stesso prodotto (`viewsFrom` nel file, `views_from` nel database), con la nota visibile "illustrazione del taglio …". È ammesso solo se la forma è la stessa; le misure mostrate restano quelle del taglio scelto. Dove esiste il modello di entrambi i tagli, si generano entrambi. Un taglio senza modello e di forma diversa non si inserisce.
5. **Due livelli di resa:**
   - **Livello A:** viste SVG generate dal modello;
   - **Livello B:** foto ufficiale della versione, con accanto il pannello dei campioni e l'etichetta "anteprima fotografica, materiali indicati a lato". Le viste sono due, Foto e Materiali: Esterno, Frontale e Pianta non ci sono. Nel PDF vanno la foto e i campioni.
6. **Regola di decisione.** Se le regole di un modello richiedono più di mezza giornata, quel prodotto passa al livello B.
7. **Controllo.** Ogni vista si confronta con la foto ufficiale nella pagina `/galleria` prima di entrare nel repository.

### 9.3 Anteprima in tempo reale

- Una **funzione pura** `componiVista(svg, materiali, opzioni) → stringa SVG`, senza DOM, è usata sia dal browser sia dal server (sezione 11). Riceve il testo di una vista e, per ogni zona, il materiale scelto.
- Per ogni poligono calcola il colore dal `color` del materiale, scurito secondo `data-shade` (0, 6, 13, 21, 30, 40 per cento di nero), e lo scrive in `fill`. I colori si calcolano in JavaScript: nell'SVG non ci sono fogli di stile né variabili CSS.
- Sopra il colore stende la texture del materiale, fusa con l'ombreggiatura (P13). Le zone a colore fisso (`stove`, `metal`, `glass`) non hanno texture.
- `opzioni` contiene il prefisso degli `id` dei pattern, `flat` (solo colori, senza texture) e il modo di includere le texture: percorsi di `public/` nel browser, data URI sul server.
- L'anteprima è un SVG inline nella pagina, non un `<img>`, così le texture si caricano da `public/`. Più viste nella stessa pagina non si sovrappongono perché ogni vista ha il suo prefisso.
- Il server legge i file delle viste e li passa al configuratore insieme al prodotto: cambiare materiale non richiede altre richieste.
- **Pedana.** Nelle viste la finitura della pedana colora tutto il pavimento interno, non un riquadro di 120 × 120 cm. È una semplificazione accettata.
- **Quote.** Larghezza, profondità e altezza del taglio si mostrano come testo accanto alla vista, non dentro l'SVG: così restano corrette anche quando un taglio riusa le viste di un altro.

### 9.4 Uso delle immagini

Il tutor ha autorizzato a voce l'uso di ciò che è visibile sul sito; non c'è un'autorizzazione scritta. Le foto si copiano in `public/` e non si richiamano dal sito, per rispettare la regola sulle risorse esterne. I file dell'Area Pro (DWG, FBX, SKP, schede di preinstallazione) si leggono solo in locale e non entrano nel repository. Il tutor ha autorizzato a mettere nel repository le viste ricavate da quei file, purché i file nativi restino in locale.

---

## 10. Applicazione e flusso

### 10.1 Architettura

- **Una sola pagina**, `/`, renderizzata sul server: legge dal database tutti i prodotti, con tagli, gruppi, valori e materiali, e i file delle loro viste, e li passa al configuratore (scheda 0026).
- Il configuratore è un componente client a passaggi (Modello, Misure, Materiali, Riepilogo), con l'anteprima e la barra in basso come nel mockup. Lo stato sta nell'URL e **contiene solo lo stato del client**: non è legato a una configurazione salvata. Un valore che non esiste nel catalogo si sostituisce con quello predefinito, con un avviso.
- Una **funzione pura** `valida(config, prodotto) → {valida, errori}` controlla la struttura: il taglio esiste, ogni gruppo appartiene al prodotto, ogni valore appartiene al suo gruppo, ogni gruppo ha un valore. La usa il server, insieme a Zod, per rifiutare una configurazione non valida; l'interfaccia la usa per riportare ai predefiniti un URL sbagliato.
- **Componenti e flusso dei dati:**
  - nel browser: pagina e configuratore (`src/app/`, `src/components/`) e composizione delle viste (`src/lib/viste/`);
  - nel server Next.js: Server Action per l'invio e "Riprova", Route Handler per il PDF (P8). Usano Zod e `valida` (`src/contratti/`), Drizzle verso PostgreSQL (`src/db/`), `componiVista` con resvg per l'immagine, PDFKit per il PDF e Nodemailer per le email (`src/server/`);
  - in Docker: PostgreSQL, con il catalogo caricato dai file e le configurazioni salvate;
  - fuori dall'applicazione: lo script delle viste (`scripts/viste/`), che si lancia a mano quando si aggiunge un taglio.

  Le route sono elencate in P6 (sezione 20.3); il dettaglio va in `docs/architettura.md`.

### 10.2 Flusso dell'invio

Un solo pulsante, "Ricevi il riepilogo". La riga della configurazione funziona come una **posta in uscita**: si salva prima di qualsiasi invio e registra cosa è stato consegnato.

1. Il cliente inserisce l'email, la conferma scrivendola due volte e dichiara di aver letto l'informativa. Il pulsante si disattiva mentre la richiesta è in corso.
2. Il server valida email e configurazione (Zod e `valida`).
3. Il server inserisce la riga con entrambi gli stati `pending`, `customer_attempts = 1`, `customer_last_attempt_at = now()` e gli stessi valori per `project_…`, e la conferma subito. Riceve `id` e `number`.
4. Il server genera il PDF in memoria (sezione 11).
5. Il server invia il PDF come allegato al cliente, con Nodemailer e un Gmail dedicato al progetto. I tre timeout di Nodemailer (`connectionTimeout`, `greetingTimeout`, `socketTimeout`) si impostano a circa 10 secondi, perché quelli predefiniti sono di minuti. In più ogni invio ha una scadenza complessiva di 15 secondi (`Promise.race`, perché `sendMail` non accetta un `AbortSignal`; alla scadenza si chiama `transporter.close()`), perché `socketTimeout` misura solo l'inattività e non limita la durata totale. Poi aggiorna `customer_status` a `sent` o `failed`, con l'errore, i tentativi e la data.
6. Solo dopo, il server invia la notifica all'email del progetto, con gli stessi timeout e la stessa scadenza, e aggiorna `project_status` allo stesso modo. La notifica si attende: nel caso peggiore la risposta arriva dopo circa 30 secondi più la generazione del PDF (due invii da 15 secondi), entro il limite di RNF4. Un fallimento della notifica non cambia la risposta al cliente.
7. La finestra di dialogo mostra il risultato e offre sempre **"Scarica il PDF"**, rigenerato dalla riga salvata.

Il `request_id`, generato dal client a ogni apertura della finestra (scheda 0026), evita righe doppie in caso di doppio clic: se la stessa richiesta arriva due volte, l'inserimento usa `ON CONFLICT (request_id) DO NOTHING` e poi il server legge e restituisce la riga esistente (P4).

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

- **"Riprova"** rimanda l'email per la **stessa riga**, identificata dal `token`, senza crearne una nuova. È disponibile finché la finestra resta aperta: dopo averla chiusa si rifà l'invio, che crea una nuova configurazione (scheda 0026).
- "Riprova" prende la riga con una sola istruzione: `UPDATE … SET customer_status = 'pending', customer_attempts = customer_attempts + 1, customer_last_attempt_at = now() WHERE token = $1 AND customer_attempts < 3 AND customer_last_attempt_at < now() - interval '30 seconds' AND (customer_status = 'failed' OR (customer_status = 'pending' AND customer_last_attempt_at < now() - interval '2 minutes')) RETURNING id`. Si invia solo se l'istruzione restituisce una riga: due clic contemporanei non producono due invii e una riga già inviata non si rimanda. Il primo invio è il primo tentativo, quindi "Riprova" si usa al massimo due volte; quando i tentativi sono finiti il pulsante non compare e resta "Scarica il PDF".
- Uno stato (`customer_status` o `project_status`) rimasto `pending` da più di 2 minuti, perché il processo si è interrotto tra il salvataggio e l'invio, vale come fallito; all'avvio `npm run demo` lo segna `failed` (sezione 7).
- Dopo un timeout non si può escludere che l'email sia partita comunque: in quel caso "Riprova" può produrre un doppione. Per la demo è accettato.
- Il fallimento della notifica al progetto non è visibile al cliente: resta registrato nella colonna `project_status` con l'errore. All'avvio, `npm run demo` rimanda le notifiche `failed` che hanno ancora tentativi disponibili (al massimo 3, come per il cliente; sezione 7). I messaggi di log vanno solo sull'output del server, non su file.

### 10.4 Contenuto del PDF e dell'email

Il PDF contiene l'immagine del prodotto con le scelte fatte (viste esterna e frontale convertite, oppure foto con i campioni dei materiali, oppure versione a colori pieni), il numero e la data della configurazione e l'elenco di prodotto, taglio e materiali, con lo stesso contenuto della schermata di riepilogo. Lo stesso elenco compare anche nel corpo dell'email, così il contenuto è leggibile anche se il PDF non è accessibile.

### 10.5 Affidabilità dell'invio

- **Durante lo sviluppo** si usa **Mailpit** in locale al posto di Gmail, così non si consuma la reputazione dell'account. Mailpit è un eseguibile locale, avviato con `--smtp 127.0.0.1:1025 --listen 127.0.0.1:8025`, così non è raggiungibile dalla rete.
- **Controllo preliminare** `npm run check`, che stampa OK o FAIL in italiano per ogni voce:
  - connessione al database e migrazioni applicate;
  - numero di prodotti caricati;
  - `transporter.verify()` verso Gmail;
  - una conversione di prova di Aladdin;
  - presenza delle texture e dei file delle viste.

  Le prime due voci (database e migrazioni, prodotti caricati) sono bloccanti; le altre tre (Gmail, conversione di prova, texture e viste) sono avvisi (sezione 7). "Presenza dei file delle viste" vuol dire che ogni taglio di un prodotto con `viewer: "svg"` ha i suoi tre file, oppure quelli del taglio indicato da `viewsFrom`. "Numero di prodotti caricati" dà FAIL se è diverso dal numero di file in `data/prodotti/`.
- **Un solo account SMTP.** Il progetto usa un solo account Gmail. Se Google lo blocca, l'invio reale non si può fare e resta solo "Scarica il PDF": è un **rischio accettato**, perché un secondo account andrebbe creato, provato e mantenuto per un caso che la prova della fase 1 rende meno probabile.
- I guasti realistici, provati nella fase 1 e da riprovare nella prova generale (fase 9):
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

**Problema.** Per mettere nel PDF un'immagine SVG con texture bisogna prima trasformarla in PNG. I convertitori lato server si comportano diversamente dal browser su `<pattern>`, `<image href>`, fusioni e filtri. I percorsi relativi delle texture (`/texture/rovere.jpg`) sul server non si risolvono.

**Decisione: conversione sul server con `@resvg/resvg-js`**, partendo dalla configurazione già validata.
- La stessa funzione che compone l'anteprima, `componiVista`, produce la stringa SVG a partire dai file delle viste (sezione 9.3).
- Le texture si incorporano come data URI. Le viste non contengono testo: misure ed etichette le scrive PDFKit, con i font del progetto.

**Motivi**
- Il PDF si rigenera dalla riga salvata, quindi "Riprova", "Scarica il PDF" e `npm run check` usano lo stesso codice senza chiedere l'immagine al browser. L'elenco delle scelte viene dallo snapshot; l'immagine si ridisegna con il catalogo attuale. Se le scelte salvate non si risolvono più nel catalogo attuale (prodotto, taglio, valore o materiale rimosso o cambiato, vista mancante), il PDF esce con il solo elenco delle scelte. Una prova automatica lo verifica con uno snapshot che cita un codice rimosso.
- Il server non accetta immagini dal client, quindi non servono controlli su tipo e dimensione e non si incontra il limite di 1 MB del corpo delle Server Actions.
- `@resvg/resvg-js` ha binari già pronti per Windows, senza dipendenze di sistema.
- Le differenze attese rispetto allo schermo riguardano `<pattern>` e fusioni (`mix-blend-mode`); la prova le verifica.

**Alternative**
- *Conversione nel browser:* il client disegna l'SVG in un canvas ed esporta un PNG. Il PDF coincide con lo schermo, ma il server dovrebbe fidarsi di un'immagine del client e il PDF non si potrebbe rigenerare. Resta la seconda opzione se la prova mostra che manca una texture o che pattern e fusioni non sono resi come nel browser.
- *Playwright o Puppeteer* con `page.pdf()`: massima fedeltà, ma richiede un browser headless sul server (Chromium, centinaia di MB) e un processo in più da gestire. Scartato.

**Ripiego, deciso fin d'ora:** la stessa funzione con l'opzione `flat: true` sostituisce i pattern con il colore pieno di `material.color` e toglie le fusioni.

**Impaginazione: PDFKit** (scheda [0015](docs-iniziali/docs/decisioni/0015-pdf-pdfkit-resvg.md)). Il PDF è una pagina A4 con l'immagine PNG prodotta da resvg e l'elenco delle scelte. PDFKit scrive il PDF in memoria, incorpora i font del progetto (necessari per "Wengé" e per gli altri accenti) e va a capo da solo nei testi lunghi. Ripiego se PDFKit non funziona dentro Next.js: `pdf-lib`.

**Prova** (mezza giornata, fase 2): Aladdin 60 con Wengé, gres e specchio, confrontato con il browser su tre punti (texture presenti, pattern e fusioni resi come nel browser, accenti corretti nel testo del PDF), con PDFKit e resvg insieme. Il risultato si aggiunge alla scheda 0015, nella sezione "Come è stato verificato".

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
| Informativa breve in bozza, con versione salvata nella riga | Si implementa insieme alla finestra di invio (fase 4) | Il tutor inserisce un dato reale |
| `expires_at` e pulizia all'avvio | Si implementa | Pochi minuti; si dimostra con una riga retrodatata in una prova |
| Script di cancellazione per email | Si implementa | Una query; si mostra dal vivo |
| Processo di pulizia periodico | Non si implementa | Nessuno scheduler; non osservabile nei tempi del tirocinio |
| Conservazione nella casella Gmail | Procedura manuale documentata | Gmail non la automatizza |
| Link di conferma dell'email, anti-spam | Lavoro futuro | Gli utenti sono noti; rischio accettato per la demo |

Il tutor ha confermato il 2026-11-11 contitolarità, basi giuridiche, durata di 12 mesi e bozza dell'informativa. L'informativa entra con la finestra di invio (fase 4), prima che il tutor inserisca un indirizzo vero.

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

Obiettivo: **WCAG 2.1 livello AA** sulla pagina del configuratore e sulle due finestre di dialogo (invio e informativa). Si dichiara "progettato per AA, verificato su questi flussi"; la conformità certificata completa, compresa l'anteprima SVG, non è un obiettivo.

- Tutto il configuratore è usabile **da tastiera**, con focus sempre visibile e ordine logico.
- Le immagini hanno un **testo alternativo** che descrive la configurazione scelta e si aggiorna a ogni cambio.
- Gli errori dei moduli sono scritti in testo, collegati al campo, e il focus va al primo campo sbagliato; il campo di conferma dell'email permette di incollare.
- Contrasti, etichette dei campi e lingua della pagina (`it`) sono verificati.
- Durante l'invio, che può durare decine di secondi, un messaggio di stato (`role="status"`) annuncia l'attesa.
- Le finestre di dialogo tengono il focus al loro interno, si chiudono con Esc e alla chiusura riportano il focus al pulsante che le ha aperte.
- Si usa shadcn/ui (basato su Radix), che dà una buona base ma non garantisce il livello AA.
- **Controlli:**
  - prova con la tastiera a ogni modifica dell'interfaccia;
  - controllo automatico con axe e verifica formale in tre momenti fissi: fine dello scheletro, flusso completo, prove finali. I risultati vanno in `docs/prove.md`.
- Il PDF per ora non deve essere accessibile; il testo del riepilogo è ripetuto nel corpo dell'email.

---

## 15. Organizzazione del lavoro

### 15.1 Ruoli

Ogni area ha un responsabile: verifica il lavoro di quell'area su entrambi i portatili, lo documenta e lo sa spiegare alla consegna.

| | Nicolas (N): dati e server | Marko (M): interfaccia e viste |
|---|---|---|
| Cartelle | `docker-compose.yml`, `drizzle/`, `src/db/`, `src/server/`, `scripts/` (tranne `scripts/viste/`), `src/app/azioni.ts`, `src/app/riepilogo/[token]/pdf/route.ts`, `public/texture/`, `public/foto/` | `src/app/` (tranne i due file di N), `src/components/`, `src/lib/viste/`, `scripts/viste/`, `public/viste/`, stili |
| Responsabilità | database, seed, invio email, PDF e sua impaginazione, conservazione dei dati, controllo preliminare | configuratore, accessibilità, script delle viste e regole dei modelli, composizione delle viste |
| Prodotti | file dei prodotti in `data/prodotti/`, texture e foto | viste di ogni taglio e confronto con le foto ufficiali |

Il formato delle viste (sezione 15.2) è il punto di contatto tra i due: lo script lo produce, `componiVista` lo consuma nel browser e nel PDF.

**File iniziali.**

| Percorso | Contenuto | Responsabile | Fase |
|---|---|---|---|
| `package.json`, `.npmrc`, `.gitattributes` (`* text=auto eol=lf`), `.env.example`, `next.config.ts`, `tsconfig.json` | Scaffold del progetto | Entrambi | 2 |
| `docker-compose.yml` (servizio `db`) | Database | N | 1 (file provvisorio, nel repository dalla fase 2) |
| `drizzle.config.ts`, `src/db/schema.ts`, `src/db/client.ts` | Schema e connessione | N | 2 |
| `vitest.config.ts`, `playwright.config.ts`, `.env.test` | Configurazione delle prove (sezione 18) | N | 2 |
| `components.json`, `src/lib/utils.ts` | Creati da `shadcn init` | M | 2 |
| `src/contratti/catalogo.ts`, `src/contratti/configurazione.ts`, `src/contratti/valida.ts`, `src/contratti/viste.ts` | Contratto (sezione 15.2) | Entrambi | 2 |
| `scripts/viste/genera.ts`, `scripts/viste/regole/<prodotto>.ts` | Script delle viste e regole dei modelli (sezione 9) | M | 2, poi a ogni prodotto |
| `public/viste/<prodotto>/<taglio>/ext.svg`, `front.svg`, `plan.svg` | Viste prodotte dallo script | M | dalla 2 |
| `src/lib/viste/` | `componiVista` e pannello dei materiali | M | 2-3 |
| `src/db/catalogo.ts` | `caricaCatalogo()`: ricompone i prodotti dal database, con il tipo `Omit<ProdottoFile, 'schemaVersion'>` | N | 3 |
| `src/app/page.tsx`, `src/components/` | Pagina unica, passaggi, viste, finestre di invio e dell'informativa (P6) | M | 3-4 |
| `src/app/galleria/page.tsx` | Pagina interna di controllo | M | 3 |
| `src/app/azioni.ts` (`'use server'`) | `inviaRiepilogo`, `riprova` (P8) | N | 3-4 |
| `src/app/riepilogo/[token]/pdf/route.ts` | Route Handler del PDF | N | 3 |
| `public/texture/`, `public/foto/<prodotto>/` | Texture e foto copiate dal sito (sezione 9.4) | N | 2 |
| `docs/mockup/configuratore-saune-mockup.html` | Mockup di riferimento (P15) | M | già presente |
| `src/server/pdf.ts`, `src/server/email.ts`, `src/server/invio.ts` | PDF, email, flusso dell'invio | N | 2-4 |
| `scripts/seed.ts`, `scripts/check.ts`, `scripts/pulizia.ts`, `scripts/avvio-demo.ts`, `scripts/prepara-test.ts` | Script (sezione 15.3) | N | 3-5 |
| `src/fonts/` | File TTF (P14) | M | 2 |
| `data/prodotti/` | File dei prodotti | N | dalla 2 |
| `test/unit/`, `test/e2e/` | Prove (sezione 18) | Il responsabile del codice provato | dalla 2 |
| `docs/` | Documentazione (sezione 19) | Entrambi | dalla 2 |

### 15.2 Contratto condiviso

All'inizio si prepara **una sola pull request** con:
- i tipi in `src/contratti/`: catalogo e configurazione con `schemaVersion: 1`;
- la funzione `valida(config, prodotto)`, con i controlli strutturali (sezione 10.1);
- lo schema Drizzle con i vincoli di unicità;
- lo schema Zod dei file in `data/prodotti/` (formato JSON, P1), a partire dal file di Aladdin;
- il **formato delle viste**:
  - un file per vista in `public/viste/<prodotto>/<taglio>/`, con i nomi `ext.svg`, `front.svg`, `plan.svg`;
  - `viewBox` quadrato; solo elementi `<path>`, ognuno con `data-zone` e `data-shade`;
  - zone ammesse: `ext`, `int`, `furn`, `floor`, `mirror`, `frame` (prendono un materiale) e `stove`, `metal`, `glass` (colore fisso);
  - `data-shade` da 0 a 5; `data-rot` facoltativo, `0` o `90`, per il verso della venatura (P13);
  - nessun `<style>`, nessuna variabile CSS, nessun testo, nessun riferimento esterno;
- il controllo, nello schema Zod e nel seed, che ogni taglio di un prodotto con `viewer: "svg"` abbia i suoi tre file o un `viewsFrom` valido;
- i colori delle zone fisse (`stove`, `metal`, `glass`), costanti in `src/lib/viste/`;
- la firma della composizione:

  ```ts
  componiVista(
    svg: string,
    materiali: Record<string /* zona */, { color: string; texture: string | null }>,
    opzioni: { prefisso: string; flat?: boolean; texture: 'percorso' | 'dataUri' }
  ): string
  ```
- la lista iniziale delle dipendenze, tutte con versione esatta (P10):
  - lo scaffold si fa con `create-next-app` (TypeScript, Tailwind, App Router, `src/`) e `shadcn init` nella fase 2; i pacchetti che installano fanno parte della lista: `next`, `react`, `react-dom`, `tailwindcss`, `@tailwindcss/postcss`, `clsx`, `tailwind-merge`, `class-variance-authority`, `lucide-react`, i pacchetti `@radix-ui/*` dei componenti aggiunti, `typescript`, `@types/react`, `@types/react-dom`, `@types/node`;
  - in più: `drizzle-orm`, `postgres` (driver `postgres.js`), `zod`, `nodemailer`, `pdfkit`, `@resvg/resvg-js`;
  - in sviluppo: `drizzle-kit`, `tsx`, `@types/nodemailer`, `@types/pdfkit`, `vitest`, `@playwright/test`, `@axe-core/playwright`, e `three` (lettura dei file FBX, usata solo dallo script delle viste). Mailpit è un eseguibile a parte, scaricato dalla pagina delle release su GitHub (sezione 10.5). In `next.config.ts`: `serverExternalPackages: ['pdfkit', '@resvg/resvg-js']`, perché resvg è un modulo nativo.

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
| `viste` | `tsx scripts/viste/genera.ts <file.fbx> <prodotto> <taglio>`: scrive le tre viste in `public/viste/<prodotto>/<taglio>/` (sezione 9.1). Il file FBX sta fuori dal repository |
| `check` | `tsx --env-file=.env scripts/check.ts` (sezione 10.5); "migrazioni applicate" vuol dire che il numero di righe di `drizzle.__drizzle_migrations` è uguale al numero di voci di `drizzle/meta/_journal.json` |
| `clean` | `tsx --env-file=.env scripts/pulizia.ts` cancella le righe scadute; `npm run clean -- --email <indirizzo>` cancella quelle di un indirizzo (sezione 12) |
| `test:setup` | `tsx --env-file=.env.test scripts/prepara-test.ts`: crea il database `configuratore_test`, poi migrate e seed (sezione 18) |
| `test` / `test:e2e` | `vitest run` / `playwright test`, entrambi con `.env.test` |
| `demo` | `tsx --env-file=.env scripts/avvio-demo.ts`, che esegue i passi della sezione 7 |

Next.js carica `.env` da solo; `tsx` e `drizzle-kit` no: per questo gli script usano `--env-file` e `drizzle.config.ts` chiama `process.loadEnvFile()` (Node 24).

### 15.4 Per evitare conflitti

- I prodotti sono file separati in `data/prodotti/` e le viste sono file separati per taglio.
- `package.json` e il lockfile: dopo la lista iniziale (sezione 15.2), una persona alla volta aggiunge dipendenze, avvisando l'altra.
- Il registro delle decisioni è **un file per decisione**, non un unico file.
- Un file `.gitattributes` evita differenze dovute ai fine riga di Windows.

### 15.5 Fasi del lavoro e calendario

La consegna è il 26 novembre 2026. Contando dal 12 novembre restano al massimo **11 giorni lavorativi**, compresi il primo e l'ultimo; ogni giorno di ritardo del via libera ne toglie uno. I giorni della tabella sono un tetto per fase, non una stima: la somma è 11.

| Fase | Giorni | Lavoro |
|---|---|---|
| 1. Prove delle parti incerte | fatta | Account Gmail, password per le app e invii di prova; Docker con il solo database su entrambi i portatili; script delle viste provato su un modello FBX (2026-11-12) |
| 2. Contratto, viste e prova del PDF | 1 | Repository, scaffold Next.js e file iniziali (sezione 15.1), spostamento di analisi e schede in `docs/`. PR del contratto (sezione 15.2). Script delle viste nel repository, con texture e pavimento; viste del primo prodotto confrontate con le foto. Texture e foto in `public/`. Prova PDF e conversione (sezione 11) con esterno e frontale; esito nella scheda 0015 |
| 3. Scheletro completo | 2 | Pagina unica con i quattro passaggi e le quattro viste, catalogo letto dal database, seed con validazione, scheletro dall'inizio alla fine con un prodotto (pulsante → riga → email con PDF in Mailpit). Prima verifica con tastiera e axe |
| 4. Invio reale e finestre | 1,5 | Invio reale con stati e "Riprova", notifica, timeout, `npm run check`. Finestra di invio, informativa, errori e focus. **Schema bloccato alla fine della fase** |
| 5. Flusso completo | 1 | Flusso completo su entrambi i portatili. Pulizia e cancellazione. Verifica axe |
| 6. Inserimento dei prodotti | 2 | Un taglio alla volta, nell'ordine fissato qui sotto, con la regola di decisione della sezione 9.2 |
| 7. Blocco delle funzioni | 0,5 | Da qui niente funzioni nuove. Restano ammessi dati dei prodotti, viste, rifinitura grafica e correzioni fino alla prova generale. Tag `demo-rc1` |
| 8. Prove finali | 1 | Prove della lista di accettazione (sezione 16) sul portatile che non ospiterà la demo, con un indirizzo di prova; avvio da clone pulito |
| 9. Prova generale | 1 | Criterio 1 ripetuto sul portatile della demo; prova sulla rete della sede, se possibile, con l'invio vero |
| 10. Preparazione della demo | 1 | Documentazione finale e registrazione del flusso. Database pulito, invio di prova la mattina stessa, un'email già ricevuta conservata da mostrare. Tag `demo-final`. Il giorno della demo non si sviluppa |

**Ordine nella fase 6.** Prima si completano i tagli del primo prodotto, poi un secondo prodotto con le viste generate, poi un prodotto con la foto ufficiale. Solo dopo si aggiungono altri tagli o prodotti.

**Se il tempo non basta**, si taglia in quest'ordine, e ogni taglio si dichiara nella consegna:
1. i prodotti oltre i tre minimi;
2. i tagli oltre il primo del secondo prodotto;
3. la vista Pianta dei prodotti dopo il primo (la consegna diventa parziale rispetto al criterio 2);
4. le prove Playwright oltre il flusso completo.

Le fasi 8, 9 e 10 non si accorciano: sono le uniche che dicono se la demo funziona davvero.

Il tempo che avanza va alla rifinitura delle viste, non a funzioni nuove. I prodotti non inseriti si elencano nella documentazione come lavoro futuro, con il tempo misurato per taglio.

---

## 16. Criteri di successo

Tutti obbligatori, verificati nelle prove finali (fase 8) sul portatile che non ospiterà la demo; il criterio 1 si ripete sul portatile della demo nella prova generale (fase 9). Una consegna che non li soddisfa tutti è parziale.

1. Su ciascuno dei due portatili, partendo da un clone pulito con `.env` copiato, `npm ci` e `npm run demo` portano l'applicazione in funzione in meno di 10 minuti, senza altri passaggi manuali.
2. Almeno **3 prodotti**:
   - almeno due con le viste generate dal modello 3D (Esterno, Frontale e Pianta per almeno un taglio ciascuno), e almeno uno di questi con più di un taglio;
   - il terzo può usare la foto ufficiale con il pannello dei materiali.

   Ogni taglio che riusa le viste di un altro lo dichiara nell'interfaccia (sezione 9.2).
3. Ogni prodotto ha almeno un taglio e un'essenza; gli altri gruppi ci sono dove il catalogo li documenta. Ogni scelta cambia l'anteprima nelle viste in cui la zona è visibile. Un URL modificato a mano con un prodotto, un taglio o un valore inesistente torna ai predefiniti con un avviso, e una richiesta di invio con una configurazione non valida è rifiutata dal server.
4. Si inserisce un indirizzo (nella fase 8 uno di prova, nella demo quello del tutor) e si preme il pulsante. Entro 60 secondi:
   - c'è la riga nel database con entrambi gli stati `sent`, mostrata con `docker compose exec db psql -U postgres -d configuratore`, senza dipendere dalla rete;
   - l'email arriva con il PDF (vista esterna e frontale, oppure foto, oppure versione a colori pieni, ed elenco delle scelte) e con lo stesso elenco nel corpo;
   - la notifica arriva nella casella del progetto.
5. Con l'account Gmail, in due prove separate: (a) `SMTP_PASSWORD` sbagliata in `.env`; (b) rete staccata. In entrambe: `customer_status = failed`, uno dei messaggi di RF6 (sezione 10.3) e "Scarica il PDF" funzionante. Nella prova (b), senza chiudere la finestra, si ricollega la rete e, dopo almeno 30 secondi, "Riprova" invia senza creare una seconda riga.
6. Il flusso intero funziona solo con la tastiera, comprese le due finestre di dialogo; axe riporta 0 violazioni `serious` o `critical` sulla pagina, in ogni passaggio e con ciascuna finestra aperta.
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
  | `valida` con prodotto, taglio, gruppo o valore inesistente, o con un gruppo senza valore | Vitest | errore strutturale |
  | Schema Zod: il file di Aladdin passa; un file con un codice non valido, uno con un predefinito che non è tra i valori, uno con una chiave sconosciuta | Vitest | il primo passa; gli altri falliscono con l'errore Zod sul campo |
  | Formato delle viste: ogni file in `public/viste/` ha solo `<path>` con `data-zone` ammessa, `data-shade` da 0 a 5 e `data-rot` assente, `0` o `90`; ogni taglio ha i suoi file o un `viewsFrom` valido | Vitest | nessun file fuori formato |
  | `componiVista`: colori per zona e ombra, `flat`, prefisso degli `id`, materiale senza texture | Vitest | SVG atteso |
  | Seed che aggiunge, modifica e toglie un valore | Vitest + database | catalogo uguale ai file, configurazioni salvate invariate |
  | Doppio invio con lo stesso `request_id`; due invii con `request_id` diversi | Vitest + database | una sola riga nel primo caso, due nel secondo (scheda 0026) |
  | Due "Riprova" in parallelo; quarto tentativo | Vitest + database | un solo invio; il quarto tentativo (terzo "Riprova") è rifiutato con `esauriti` |
  | Riga retrodatata | Vitest + database | cancellata da `npm run clean` |
  | `npm run clean -- --email <indirizzo>` | Vitest + database | cancellate tutte e sole le righe di quell'indirizzo, anche scritto con maiuscole |
  | Snapshot con un codice rimosso | Vitest | PDF con il solo elenco |
  | Errori di Nodemailer (`EAUTH`, `ECONNECTION`, `EDNS`, `ESOCKET`, `ETIMEDOUT`, `EENVELOPE`, un codice sconosciuto) e scadenza di 15 secondi | Vitest | causa e messaggio della tabella della sezione 10.3 |
  | `inviaRiepilogo` chiamata con una configurazione non valida | Vitest + database | `ok: false`, nessuna riga |
  | Un PDF per ogni prodotto e taglio, con il catalogo letto dal database dopo il seed | Vitest + database | PDF generato senza errori |
  | URL con un valore sconosciuto | Playwright | valori predefiniti e avviso |
  | Flusso completo da tastiera, con controllo axe a ogni passaggio e con le finestre aperte | Playwright + Mailpit | email con allegato, letta da `GET /api/v1/messages` |

  **Ambiente delle prove.**
  - Le prove usano il database `configuratore_test`, nello stesso container, indicato da `.env.test`; `npm run test:setup` lo crea, poi esegue migrate e seed.
  - Vitest gira in serie (`fileParallelism: false`) e svuota `configuration` prima di ogni file.
  - `playwright.config.ts` avvia due `webServer`: Mailpit, e `next build && next start -H 127.0.0.1` con `env` esplicito (`SMTP_HOST=127.0.0.1`, `SMTP_PORT=1025`, `SMTP_SECURE=false`, la `DATABASE_URL` di prova). Così una prova non manda mai email vere.
  - Mailpit deve essere nel `PATH`, nella versione indicata in `README.md`. Su ogni computer serve una volta `npx playwright install chromium`.
- Pagina interna `/galleria` che mostra ogni prodotto × taglio con i materiali predefiniti nelle tre viste disegnate, con la foto ufficiale accanto per il confronto e, per ogni gruppo, una riga con la vista esterna per ciascun valore. Serve come controllo visivo, come bersaglio per axe e come materiale di riserva per la demo.
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
| `docs/catalogo-inventario.md` | Prodotti e tagli con i file disponibili (FBX, solo DWG, nessuno), livello di resa, tempo misurato per taglio |
| `docs/viste.md` | Come si genera una vista: dove tenere i file nativi, come lanciare lo script, come si scrivono le regole di un modello |
| `docs/decisioni/` | Una scheda per ogni scelta; quando una scelta cambia si aggiunge una nuova scheda che sostituisce la precedente |
| `docs/privacy-e-accessibilita.md` | Informativa, conservazione, controlli WCAG eseguiti |
| `docs/manuale-uso.md` | Come si usa il configuratore |
| `docs/prove.md` | Prove eseguite e risultati |
| `docs/demo.md` | Percorso della demo, controlli della mattina, ripieghi |

**Registro delle decisioni.** Le schede 0001–0027 sono nel [registro](docs-iniziali/docs/decisioni/README.md); fino alla fase 2 stanno in `docs-iniziali/docs/decisioni/`, poi si spostano in `docs/decisioni/`. Le schede 0016–0020 registrano le decisioni P1–P15 della sezione 20.3; le schede 0021–0024 registrano i cambi di scelta decisi dopo la revisione della v6; le schede 0025–0027 registrano i cambi del 2026-11-12 (sezione 23.1).

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
| 0010 | [Grafica: viste SVG da parametri e immagini del sito come ripiego](docs-iniziali/docs/decisioni/0010-grafica-svg-da-parametri.md) | Sostituita da 0025 |
| 0011 | [Solo italiano](docs-iniziali/docs/decisioni/0011-lingua-italiana.md) | Accettata |
| 0012 | [Regole di migrabilità](docs-iniziali/docs/decisioni/0012-migrabilita.md) | Accettata |
| 0013 | [Organizzazione di Git](docs-iniziali/docs/decisioni/0013-git.md) | Accettata |
| 0014 | [Solo PostgreSQL in Docker, applicazione fuori dal container](docs-iniziali/docs/decisioni/0014-docker-solo-database.md) | Accettata |
| 0015 | [PDF: impaginazione con PDFKit, immagine convertita con resvg](docs-iniziali/docs/decisioni/0015-pdf-pdfkit-resvg.md) | Accettata (da confermare con la prova) |
| 0016 | [Generatore delle viste come funzione pura, per famiglie di layout](docs-iniziali/docs/decisioni/0016-generatore-famiglie-layout.md) | Sostituita da 0025 (restano validi i font e l'opzione `flat`) |
| 0017 | [Email: Nodemailer con Gmail, stati nella riga, Mailpit in sviluppo](docs-iniziali/docs/decisioni/0017-email-nodemailer-gmail.md) | Accettata; in parte sostituita da 0023 e 0026 |
| 0018 | [Catalogo come file JSON, database derivato](docs-iniziali/docs/decisioni/0018-catalogo-file-database-derivato.md) | Accettata; in parte sostituita da 0022 e 0027 |
| 0019 | [Next.js con Server Action e Route Handler, Zod, shadcn/ui](docs-iniziali/docs/decisioni/0019-nextjs-server-action-zod-shadcn.md) | Accettata; in parte sostituita da 0026 |
| 0020 | [Regole di compatibilità condivise tra interfaccia e server](docs-iniziali/docs/decisioni/0020-regole-compatibilita-condivise.md) | Sostituita da 0027 |
| 0021 | [Viste esterne: frontale e diagonale](docs-iniziali/docs/decisioni/0021-viste-frontale-diagonale.md) | Sostituita da 0025 |
| 0022 | [Seed come sincronizzazione completa, catalogo letto dal database](docs-iniziali/docs/decisioni/0022-seed-sincronizzazione-catalogo.md) | Accettata |
| 0023 | [La notifica al progetto si attende prima della risposta](docs-iniziali/docs/decisioni/0023-notifica-attesa.md) | Accettata |
| 0024 | [Il request_id lo genera il server, nel modulo](docs-iniziali/docs/decisioni/0024-request-id-dal-server.md) | Sostituita da 0026 |
| 0025 | [Viste SVG pronte, generate da uno script a partire dal modello 3D](docs-iniziali/docs/decisioni/0025-viste-pronte-da-modello-3d.md) | Accettata (texture e confronto con le foto da verificare nella fase 2) |
| 0026 | [Pagina unica a passaggi, invio in una finestra di dialogo](docs-iniziali/docs/decisioni/0026-pagina-unica-come-il-mockup.md) | Accettata |
| 0027 | [Niente regole di compatibilità né optional; pedana obbligatoria](docs-iniziali/docs/decisioni/0027-niente-regole-ne-optional.md) | Accettata |

---

## 20. Rischi e punti aperti

### 20.1 Rischi

| Rischio | Impatto | Mitigazione | Responsabile |
|---|---|---|---|
| L'invio Gmail non funziona dalla rete della demo o l'account viene bloccato | Alto: requisito obbligatorio | Prova nella fase 1, timeout, "Scarica il PDF", hotspot, prova generale (sezioni 10.5 e 17). Il blocco dell'unico account Gmail è un rischio accettato: non c'è un secondo account SMTP | N |
| La conversione SVG → PNG non rende le texture | Medio | Prova nella fase 2, ripiego a colori pieni (sezione 11) | N |
| Lo script delle viste non regge un modello nuovo: zone non separabili, file solo DWG, modello di una sola variante | Alto per la qualità grafica | Prova già fatta su un secondo modello, regole per modello, riuso delle viste tra tagli, foto ufficiale come ripiego (sezione 9.2) | M |
| Docker non parte su uno dei portatili | Medio | Solo database in Docker, prova nella fase 1, prerequisiti documentati (sezione 7) | Entrambi |
| Il contratto cambia spesso e blocca il lavoro in parallelo | Medio | PR unica iniziale, modifiche solo con PR discussa, schema bloccato dopo la fase 4 (sezione 15) | Entrambi |
| Tempo insufficiente: al massimo 11 giorni lavorativi, meno se il via libera tarda | Alto | Minimo di 3 prodotti, regole e optional tolti (scheda 0027), ordine dei tagli e dei lavori da tagliare già fissato (sezione 15.5) | Entrambi |
| "Riprova" e "Scarica il PDF" accessibili conoscendo solo l'`id` della riga | Medio: chi prova un `id` scarica il PDF con l'email di un'altra persona | Token casuale non indovinabile per queste azioni (P4, sezione 20.3) | N |
| Il pulsante permette di inviare email a qualsiasi indirizzo | Basso in demo locale | Rischio accettato e dichiarato; anti-spam come lavoro futuro | N |
| Il database non coincide con i file del catalogo | Medio: interfaccia e server vedono cataloghi diversi | Seed come sincronizzazione completa in transazione, rilanciato da `npm run demo` (sezione 8.2) | N |
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
| Dove sta il mockup | Nel repository, in `docs/mockup/configuratore-saune-mockup.html`. Il contenuto è descritto nell'appendice B |
| Dati di Aladdin | Raccolti dal sito il 2026-11-11: bozza in [`data/prodotti/aladdin.json`](data/prodotti/aladdin.json), fonti e lacune nell'appendice A |
| Contratto condiviso | Confermato da Marko l'11 novembre; superato il 12 per le parti su `Geometria` e sulle regole (sezione 23.1, schede 0025 e 0027) |
| Privacy | Confermata dal tutor: contitolarità dei due sviluppatori, art. 6(1)(b) per l'invio e 6(1)(f) per la conservazione, 12 mesi, bozza dell'informativa (sezione 12, scheda 0007) |
| Fonte per optional e regole | Il tutor conferma che non esiste: nessun optional e nessuna regola nel catalogo (P3) |
| Schede di preinstallazione dell'Area Pro | Il tutor ne autorizza l'uso per ricavare dimensioni e vincoli, solo sul computer locale e fuori dal repository (sezione 9.4) |

### 20.3 Decisioni sui punti aperti

Le decisioni P1–P15 sono state prese il 2026-11-11. Alcune hanno una condizione: P13 dipende dalla prova della fase 2. P3 e i testi della privacy (P11) sono stati chiusi con il tutor (sezione 20.2). Le decisioni entrano nel contratto condiviso (sezione 15.2) e sono registrate nelle schede: P1 e P3 nella 0018, P2 nella 0020, P4, P5 e P11 nella 0017, P6–P10 nella 0019, P12–P15 nella 0016. Dopo la revisione sono cambiate quattro scelte, registrate in schede nuove: le viste e P12 nella 0021, il seed nella 0022, l'attesa della notifica nella 0023, il `request_id` di P4 nella 0024. Il 2026-11-12 sono cambiate P2, P3, P4 (solo il `request_id`), P6, P7, P8, P12, P13 e P15: il testo qui sotto è già quello nuovo, registrato nelle schede 0025, 0026 e 0027.

| # | Tema | Decisione |
|---|---|---|
| P1 | Formato del catalogo | JSON, un file per prodotto, validato da Zod |
| P2 | Validazione | Nessuna regola di compatibilità; `valida` controlla la struttura sul server |
| P3 | Optional e regole | Nessun optional e nessuna regola; pedana obbligatoria dove il catalogo la propone |
| P4 | Azioni sulla configurazione | Token casuale per "Riprova" e per il PDF; `request_id` generato dal client a ogni apertura della finestra |
| P5 | Numero | `AAAA-NNNNNN` |
| P6 | Route | `/`, `/riepilogo/[token]/pdf`, `/galleria` |
| P7 | Stato nell'URL | Query string di `/` con prodotto, taglio e codici di gruppi e valori |
| P8 | Comunicazione con il server | Server Action per invio e "Riprova", senza `redirect`; Route Handler per il PDF |
| P9 | Prove | Vitest, Playwright con `@axe-core/playwright`, Mailpit |
| P10 | Versioni | Node.js 24 LTS, Next.js stabile fissato, PostgreSQL 17, versioni esatte |
| P11 | Testi | Informativa dalla bozza del mockup; email al cliente come descritta; notifica senza l'email del cliente |
| P12 | Immagini nel PDF | Vista esterna grande e vista frontale; foto e campioni per i prodotti senza viste |
| P13 | Texture | Foto del campione stesa sulla zona e fusa con l'ombreggiatura; colore pieno come ripiego |
| P14 | Font | Jost e IBM Plex Sans, file TTF nel repository |
| P15 | Mockup | Si riprendono l'interfaccia e la resa delle viste; le viste si rigenerano con lo script |

Il dettaglio di ogni decisione segue.

**P1. Formato dei file del catalogo.**
- Un file JSON per prodotto in `data/prodotti/<codice>.json`, validato da uno schema Zod in `src/contratti/`.
- Codici: `^[a-z0-9-]+$`, cioè minuscole, cifre e trattino, senza spazi né accenti (`rovere`, `wenge`, `45`); etichette in italiano con gli accenti (`Wengé rigatino`).
- Chiavi dell'URL: `product` per il prodotto, `size` per il taglio, poi i codici dei gruppi del prodotto (per Aladdin `wood` e `floor`). Un gruppo non può chiamarsi `product` né `size`. Il taglio non è un gruppo: nel file sta nell'array `sizes`.
- Zone dei gruppi: `ext`, `int`, `furn`, `floor`; zone fisse, in `fixedZones`: `mirror`, `frame`. Le viste contengono anche tre zone a colore fisso, senza materiale: `stove`, `metal`, `glass`.
- `schemaVersion` al primo livello del file è la versione del formato del file: il seed la controlla e non la salva.
- `material.type`: `wood`, `mirror`, `aluminium`, `ceramic` (identificatori in inglese, sezione 8.1).
- `photos`: chiave `<taglio>/<valore>`, dove il valore è quello del gruppo indicato da `photoGroup` (per Aladdin `wood`).
- Le chiavi che iniziano con `_` sono note della bozza: un `z.preprocess` le toglie, poi lo schema è `.strict()`, quindi ogni altra chiave sconosciuta (ad esempio un errore di battitura) fa fallire la validazione. Il file si usa così com'è sia dal seed sia dall'interfaccia. `_daVerificare` elenca i dati incerti; `_assetSources` dice da dove scaricare texture e foto, che N scarica una volta nella fase 2, ottimizza e mette nel commit in `public/` (sezione 9.4).
- *Perché JSON e non TypeScript o YAML:* lo legge sia il seed sia l'interfaccia senza compilazione, e Zod dà errori chiari; YAML aggiungerebbe una dipendenza e ambiguità sui tipi.

**P2. Validazione.** Non ci sono regole di compatibilità (scheda 0027). Ogni gruppo è a scelta singola, obbligatoria, con un valore predefinito che deve essere uno dei suoi valori: il seed rifiuta un file in cui non lo è. `valida(config, prodotto)` controlla solo la struttura (sezione 10.1). Nell'interfaccia non esistono scelte disattivate.

**P3. Optional e regole.**
- Le pagine dei prodotti su effe.it **non riportano né optional né regole di compatibilità**: elencano solo versioni, dimensioni e materiali. Gli optional del mockup (cromoterapia, audio, mensole) e la sua regola sul taglio più piccolo di un modello sono dati di esempio, non del catalogo. Il tutor ha confermato il 2026-11-11 che non esiste un'altra fonte.
- *Decisione:* non si inventano dati, e non si costruisce ciò che il catalogo non usa: nessun optional, nessuna regola, nessun gruppo a scelta multipla.
- *Pedana:* dove il catalogo la propone, una finitura è sempre selezionata; non esiste il valore "Nessuna pedana". È l'unico punto in cui il progetto si discosta dal sito, per scelta dell'autore.

**P4. Identificativo per "Riprova" e "Scarica il PDF".**
- Colonna `token`: 16 byte casuali (`crypto.randomBytes`) in base64url, con vincolo `UNIQUE`. Le azioni sulla configurazione usano solo il token, mai l'`id`.
- Colonna `request_id`: un UUID generato dal client con `crypto.randomUUID()` a ogni apertura della finestra di invio, con vincolo `UNIQUE`. Se la stessa richiesta arriva due volte (doppio clic), il server restituisce la riga esistente invece di crearne una nuova (sezione 10.2, scheda 0026).

**P5. Formato di `number`.** `AAAA-NNNNNN`: l'anno di creazione e l'`id` con zeri davanti, ad esempio `2026-000042`. Non serve un contatore annuale e il numero è unico perché lo è l'`id`. L'anno è quello di `created_at` nel fuso `Europe/Rome`. `NNNNNN` non riparte da 1 ogni anno: dopo `2026-000042` può venire `2027-000043`.

**P6. Route dell'applicazione.**

| Route | Contenuto |
|---|---|
| `/` | Il configuratore: passaggi, viste, finestra di invio e finestra dell'informativa |
| `/riepilogo/[token]/pdf` | Route Handler che restituisce il PDF |
| `/galleria` | Pagina interna di controllo (sezione 18), disponibile con `NODE_ENV` diverso da `production` o con `ENABLE_GALLERY=true`, impostata nella demo |

**P7. Stato nell'URL.** Tutto nella query string di `/`: `/?product=aladdin&size=60&wood=rovere&floor=moka`. Il passaggio corrente sta nel frammento (`#materiali`), come nel mockup. Senza `product` si apre il passaggio Modello con il primo prodotto del catalogo. Un prodotto, un taglio o un valore sconosciuto torna al predefinito e l'interfaccia lo segnala. Cambiando prodotto, le chiavi dei gruppi tornano ai predefiniti del nuovo prodotto. Al momento dell'invio il server valida comunque tutto.

**P8. Server Action o Route Handler.**
- **Server Action** per "Ricevi il riepilogo" e per "Riprova": la validazione Zod è condivisa e non serve un'API a parte. JavaScript è richiesto (scheda 0026).
- **Route Handler** per il PDF, perché deve restituire un file con `Content-Type: application/pdf` e `Content-Disposition: attachment; filename="riepilogo-<numero>.pdf"`.
- Firme, in `src/app/azioni.ts`:
  - `inviaRiepilogo(statoPrecedente, formData)`. Campi: `email`, `emailConferma`, `informativa` (checkbox), `requestId` e un campo per ogni chiave dello stato dell'URL (`product`, `size`, `wood`, …). Restituisce:
    - `{ ok: false, errori: Record<campo, messaggio> }` con errori di validazione, senza salvare nulla;
    - `{ ok: true, token, numero, cliente: 'sent' | 'failed', causa?, puoRiprovare }` dopo aver salvato la riga e provato gli invii. `causa` è una delle quattro di RF6;
  - `riprova(statoPrecedente, formData)`, con `token`. Restituisce lo stesso esito di `inviaRiepilogo` se l'invio è partito, altrimenti `{ ok: false, motivo: 'attendi' | 'inviata' | 'esauriti' }`, con i testi "Attendi qualche secondo e riprova", "L'email è già stata inviata", "Tentativi esauriti: scarica il PDF". Per scegliere il motivo, quando l'`UPDATE` della sezione 10.3 non restituisce righe il server rilegge la riga;
  - `GET /riepilogo/[token]/pdf` → 200 con il PDF, 404 se il token non esiste o la riga è scaduta.
- Nessuna azione chiama `redirect`: l'esito si mostra nella finestra di dialogo.
- Tipi di `valida`:

  ```ts
  valida(config: { product: string; size: string; selections: Record<string, string> }, prodotto: Prodotto)
    → { valida: boolean;
        errori: { group?: string; value?: string; messaggio: string }[] }
  ```
- Runtime: PDFKit e resvg non girano nel runtime Edge. `nodejs` è già il predefinito: nessun file esporta `runtime`, e un file `'use server'` non potrebbe farlo, perché può esportare solo funzioni async.

**P9. Strumenti di prova.**
- **Vitest:** `valida`, schemi Zod, validazione dei file del catalogo, formato delle viste, `componiVista`, generazione di un PDF per prodotto e taglio.
- **Playwright** con **`@axe-core/playwright`:** flusso completo da tastiera e controllo axe sul configuratore e sulle sue finestre di dialogo.
- **Mailpit** nelle prove del flusso: la prova legge dall'API di Mailpit che l'email sia arrivata con l'allegato.

**P10. Versioni.** Node.js 24 LTS; Next.js all'ultima versione stabile al momento della PR del contratto; PostgreSQL 17. Le dipendenze si installano con versioni esatte (`save-exact=true` in `.npmrc`), così i due portatili hanno lo stesso codice.

**P11. Testi.**
- *Informativa:* si parte dalla bozza già presente nel mockup (titolare, dati, finalità, conservazione, destinatari, diritti, cookie), con la base giuridica proposta nella sezione 12 e il reclamo al Garante. La versione si salva come stringa costante (ad esempio `2026-11-v1`).
- *Email al cliente:* oggetto "Il riepilogo della tua sauna Aladdin, n. 2026-000042"; corpo con saluto, elenco delle scelte, PDF in allegato, nota "messaggio automatico, non rispondere" e indirizzo per chiedere la cancellazione.
- *Notifica al progetto:* oggetto "Nuova richiesta di riepilogo n. 2026-000042"; corpo con prodotto, scelte e data, **senza l'email del cliente**, che resta solo nel database. Così le notifiche non contengono dati personali; le copie delle email al cliente in "Posta inviata" si cancellano con la procedura della sezione 12.

**P12. Viste nel PDF.** Una pagina A4 verticale con la vista esterna in grande, la vista frontale più piccola e sotto l'elenco delle scelte. Per i prodotti con la foto: la foto della versione e i campioni dei materiali. Se un taglio riusa le viste di un altro, la nota "illustrazione del taglio …" compare anche nel PDF.

**P13. Texture.** Le texture del sito sono foto di campioni (ad esempio 1394 × 902 px), non immagini ripetibili senza giunture.

- *Resa:* per ogni zona con un materiale `componiVista` crea un pattern con `patternUnits="userSpaceOnUse"` che contiene la foto del campione, e disegna ogni poligono due volte: prima con il colore del materiale scurito secondo l'ombra, poi con il pattern e `mix-blend-mode: multiply`. È la tecnica del mockup. La foto non segue la prospettiva della faccia: sul fianco della vista esterna resta piatta, e l'effetto di volume viene dall'ombra.
- *Orientamento:* il pattern si ruota di 90 gradi sui poligoni in cui la venatura corre nell'altro senso (nel mockup tetto e panche). L'angolo lo decidono le regole del modello e lo script lo scrive su ogni poligono in `data-rot`.
- *Senza texture:* con `texture: null` (ad esempio l'alluminio) si usa solo il colore, e il controllo "presenza delle texture" salta quel materiale.
- *Verifica:* la prova della fase 2 controlla che resvg renda pattern e fusione come il browser.
- *Ripiego:* `flat: true`, cioè solo i colori con le ombre. Se il materiale non si riconosce nemmeno così, la frase "texture del catalogo" nelle sezioni 2 e 9 va corretta per quel materiale.

**P14. Font.** Jost e IBM Plex Sans, gli stessi del mockup, entrambi con licenza SIL Open Font License, salvati nel repository (`src/fonts/`) come file TTF **statici**, presi dalla cartella `static/` dei pacchetti di Google Fonts, non variabili, perché PDFKit incorpora solo l'istanza predefinita di un font variabile e resvg supporta poco gli assi di variazione: `Jost-Regular.ttf`, `Jost-Medium.ttf`, `IBMPlexSans-Regular.ttf`, `IBMPlexSans-SemiBold.ttf`. Sul server il percorso è `path.join(process.cwd(), 'src/fonts', nome)`. Pesi: Jost Medium per titoli e misure, IBM Plex Sans Regular per il testo e SemiBold per le etichette. Gli stessi file li usano `next/font/local` nella pagina e PDFKit nel PDF. Le viste non contengono testo, quindi resvg non ha bisogno dei font. Il mockup oggi li carica da Google Fonts: nel progetto non si fa (scheda 0008).

**P15. Dal mockup al codice.** Il mockup (`docs/mockup/configuratore-saune-mockup.html`) è il riferimento per due cose:
- **l'interfaccia:** passaggi, anteprima con le quattro viste, barra in basso, finestra di invio, testi dei messaggi d'errore e bozza dell'informativa;
- **la resa delle viste:** sei livelli d'ombra per zona e texture fusa in moltiplicazione.

Non si riprendono:
- i dati di esempio scritti nel codice, compresi optional e regole;
- le viste incorporate del prodotto curato, che si rigenerano con lo script (sezione 9.1);
- il disegno schematico a parametri usato per gli altri prodotti e tagli;
- la vista "Interno";
- i font caricati da Google Fonts (scheda 0008), le definizioni SVG scritte nel DOM e le variabili CSS dentro l'SVG.

### 20.4 Domande per il tutor

Le tre domande hanno avuto risposta il 2026-11-11 (sezione 20.2):
1. privacy (base giuridica, durata, contitolarità, informativa): proposta confermata (sezione 12);
2. fonte per optional e incompatibilità: non esiste (P3);
3. schede di preinstallazione dell'Area Pro: si possono usare, solo sul computer locale (sezione 9.4).

### 20.5 Ancora da fare

- Ottenere il **via libera del tutor**: ogni giorno di attesa toglie un giorno al calendario della sezione 15.5.
- Creare l'**email del progetto**: finché manca, il codice usa la variabile `PROJECT_EMAIL` e l'informativa un segnaposto.
- Raccogliere in una cartella locale, fuori dal repository, i **modelli FBX** dei tagli da inserire, e compilare `docs/catalogo-inventario.md` con ciò che esiste per ogni taglio.
- Portare **Node.js alla versione 24** su entrambi i portatili: su uno è installata la 22 (P10).
- Annotare cosa è stato verificato di Docker e di Gmail nella fase 1, con le date, in `docs/prove.md`.

---

## 21. Fuori dal progetto

- **Prezzi, sconti, IVA e preventivi.** Esclusi per indicazione del tutor; il listino reale non è disponibile. Il documento si chiama "riepilogo".
- **Funzioni di intelligenza artificiale.** Escluse per indicazione del tutor; le regole di migrabilità lasciano aperta la possibilità di aggiungerle.
- **Regole di compatibilità, optional e gruppi a scelta multipla.** Il catalogo non ne ha (scheda 0027).
- **3D in tempo reale.** Escluso da questa versione.
- **Generatore delle viste a parametri** e **vista dall'interno** (scheda 0025).
- **Viste generate per i tagli che hanno solo il DWG:** usano la foto ufficiale o le viste di un altro taglio.
- **Varianti che cambiano la forma** oltre quella di cui esiste il modello 3D.
- **Funzionamento senza JavaScript** e pagina di conferma con un proprio indirizzo (scheda 0026).
- **Applicazione dentro Docker** e Dockerfile dell'applicazione.
- **Pulizia periodica con uno scheduler** e cancellazione automatica nella casella Gmail.
- **Ricontatto dei clienti** e consenso commerciale.
- **PDF accessibile**, link di conferma dell'email, protezioni anti-spam.
- **Più lingue.** Solo italiano.
- **Conformità AA completa certificata**, compresa l'anteprima SVG.
- **Uso reale da parte dell'azienda** o pubblicazione.

---

## 22. Come presentare le scelte

1. Aprire con i vincoli: tempo limitato, due persone, demo locale, email reale obbligatoria, grafica importante. Ogni scheda diventa così una conseguenza dei vincoli.
2. Mostrare la demo come una storia unica: scegli → vedi → ricevi. Poi provare un URL modificato a mano, che torna ai predefiniti, e, con la rete staccata, il percorso di errore con "Riprova". Un ripiego che funziona convince più di una slide.
3. Una sola slide con 5 scelte e un motivo ciascuna:
   - PostgreSQL + JSONB (il dominio è relazionale);
   - Docker solo per il database (indicazione del tutor, riproducibilità);
   - Drizzle (migrazioni e tipi in due);
   - viste SVG generate dal modello 3D invece del 3D in tempo reale (peso, fedeltà al prodotto, procedura ripetibile);
   - dati minimi e nessun cookie.
4. Per ogni scelta dire l'alternativa scartata e cosa farebbe cambiare idea, ad esempio "Puppeteer se la fedeltà del PDF non bastasse" o "Postgres online cambiando solo `.env` se si pubblicasse".
5. Presentare le esclusioni (prezzi, IA, 3D, applicazione in Docker, scheduler, regole e optional) come decisioni motivate. Mostrare l'inventario dei file disponibili per prodotto e il tempo misurato per taglio: trasformano "il più possibile" in un dato difendibile. Dire apertamente che la pedana obbligatoria si discosta dal sito.
6. Avere pronta la risposta a "perché il catalogo sta anche nel database, se la fonte sono i file?": vincoli come seconda difesa, lettura del catalogo dalla pagina, coerenza con le configurazioni salvate, indicazione del tutor.

---

## 23. Modifiche

### 23.1 Rispetto alla v6 (2026-11-12)

| Punto | v6 | v7 |
|---|---|---|
| Viste | Generatore a parametri (`Geometria`, primitive, famiglie di layout), "provato" su un prodotto | Viste SVG pronte per taglio, generate da uno script a partire dal modello FBX; il mockup non conteneva un generatore per le viste curate (9, scheda 0025) |
| Viste mostrate | Frontale e diagonale; pianta solo se avanza tempo | Esterno, Frontale, Pianta, Materiali; nel PDF esterno e frontale (9.1, P12) |
| Vista diagonale | Da scrivere da zero | È la vista Esterno, già presente nel mockup e rigenerata dallo script (9.1) |
| Conversione con resvg | Stessa funzione dell'anteprima | Colori calcolati in JavaScript: le variabili CSS e `color-mix()` del mockup non sono supportate (9.3) |
| Interfaccia | Catalogo, pagina di configurazione, pagina di conferma | Pagina unica a passaggi, invio in una finestra di dialogo (10.1, P6, scheda 0026) |
| Senza JavaScript | Il modulo doveva funzionare | Requisito tolto (scheda 0026) |
| `request_id` | Generato dal server; rimandato uguale tornando indietro | Generato dal client a ogni apertura della finestra (10.2, P4) |
| Regole di compatibilità | Tre tipi di regola, `valuta`, scelte disattivate | Tolte; resta `valida` sul server (P2, scheda 0027) |
| Optional e scelta multipla | Previsti nel modello, assenti nel catalogo | Tolti (P3, scheda 0027) |
| Pedana | Facoltativa, "Nessuna pedana" predefinita | Obbligatoria dove il catalogo la propone (P3, appendice A) |
| Misure di Aladdin | Ordine da verificare | Verificate (appendice A) |
| Calendario | Dieci fasi senza date | Consegna il 26 novembre 2026, tetto di giorni per fase, ordine dei tagli (15.5) |
| Numero di prodotti | Minimo 3, obiettivo 6–8 | Minimo 3; il resto secondo il tempo misurato (16) |
| Ruoli | Chi scrive ogni cartella | Chi è responsabile di ogni area (15.1) |
| Stati `pending` all'avvio | Non era detto a quale stato si applicava | A ciascuno dei due stati; limite di 3 tentativi anche per la notifica (10.3) |

### 23.2 Rispetto alla v5

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
- *Ordine delle dimensioni.* Il sito scrive le misure di Aladdin come larghezza × altezza × profondità ("200 x 210 x 160"). Verificato dall'autore il 2026-11-12: Aladdin 60 è 200 × 160 × 210 cm e Aladdin 45 è 180 × 140 × 210 cm (larghezza × profondità × altezza), come nel file.
- *Pedana nel taglio 45.* Nessuna regola: la pedana è disponibile per entrambi i tagli, e nelle viste colora tutto il pavimento (sezione 9.3).
- *Pedana obbligatoria.* Il sito la presenta come completamento ("può essere completata"). Per scelta dell'autore una finitura è sempre selezionata, con Moka predefinita (scheda 0027).
- *Colori dei materiali.* I valori esadecimali sono quelli approssimati del mockup e servono solo per il ripiego a colori pieni.

## 25. Appendice B: il mockup esistente

Il mockup è un file HTML/JS, generato a partire dai file forniti dall'autore e salvato in `docs/mockup/configuratore-saune-mockup.html` (P15). Si apre nel browser senza server.

- **Interfaccia:** una pagina con i passaggi Modello, Misure, Materiali, Optional, Riepilogo, l'anteprima con le viste, una barra in basso, una finestra di dialogo per l'invio e una per l'informativa. È il riferimento per l'interfaccia, tolto il passaggio Optional.
- **Viste:** Esterno, Interno, Pianta e un pannello Materiali.
- **Due modi di disegnare.** Per un solo prodotto e un solo taglio (Aladdin 60) le viste Esterno, Frontale e Pianta sono disegni SVG già pronti, incorporati nel file come dati e ricavati una volta dal modello 3D: il codice ne cambia solo colori e texture. Per ogni altro prodotto e taglio il mockup usa un disegno schematico calcolato da pochi parametri, molto più povero. La v6 descriveva il secondo modo come se avesse prodotto le viste del primo.
- **Materiali:** per le viste pronte, piccole foto dei campioni incorporate nel file; per il disegno schematico, colori approssimati e venature generate dal codice (`feTurbulence`).
- **Dati inventati da non riportare nel catalogo:** gli optional (cromoterapia, audio, mensole, pedana aggiuntiva), la regola che disattiva un optional per un taglio e il valore "Nessuna pedana".
- **Da non riprendere:** l'elenco è in P15 (sezione 20.3). In più, la nota "nel prototipo reale qui compaiono render o un modello 3D" contrasta con l'esclusione del 3D (sezione 21).
