# Configuratore di saune: analisi e scelte tecniche (v7)

Questa versione sostituisce la v6, conservata come storico in `archivio/` insieme alla v5 e al brainstorm EGM (`concepts_brief.md`). Dove i testi sono in contrasto vale quanto scritto qui. Le modifiche rispetto alla v6 sono nella sezione 23.1: riguardano le viste, la forma dell'interfaccia, le regole di compatibilità e il calendario. La revisione del 2026-11-12 ha cambiato viste, seed, invio e calendario (sezione 23.1, schede 0028–0030). Il 2026-11-13, con le viste prodotte davvero, sono cambiati prodotti di partenza, formato delle viste e texture (sezione 23.1, scheda 0031).

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

**Problema.** Sul sito effe.it ogni sauna ha una foto per versione, cioè un'immagine dall'esterno, e alcune scelte non hanno una foto: la pedana di Aladdin, la boiserie interna di Cabanon. Non si vede com'è la sauna dentro né come occupa lo spazio in pianta. Le scelte di un prodotto stanno inoltre in parti diverse della pagina (versioni, materiali, pedana), e il cliente non ha un riepilogo da conservare. Il tirocinio deve dimostrare che un configuratore web:
- mostra in un solo posto, con viste coerenti tra i prodotti (esterno, interno, pianta), l'effetto di ogni scelta, comprese quelle che sul sito non hanno una foto;
- salva la configurazione e manda al cliente un riepilogo;
- poggia su scelte tecniche motivate.

I prodotti di partenza sono Air, Air Corner, Aladdin e Cabanon (scheda 0031). Per Air e Aladdin ogni combinazione di taglio e legno ha già una foto ufficiale: il loro contributo sono le viste Interno e Pianta, la pedana di Aladdin e il riepilogo. Cabanon mostra in più la boiserie con la vista Interno 3D. Un prodotto al livello B (foto e campioni, sezione 9.2) è un ripiego per i prodotti futuri e non risponde al problema; oggi nessun prodotto è al livello B.

**Soluzione.** Il progetto realizza un configuratore web, in **Next.js + React**, per le saune del catalogo effe.it. Il cliente sceglie modello, taglio e materiali e vede un'anteprima che cambia in tempo reale. Con il pulsante "Ricevi il riepilogo" la configurazione viene salvata nel database, il cliente riceve per email il **riepilogo in PDF** e l'email del progetto riceve una notifica. **La configurazione si salva solo insieme alla richiesta del riepilogo**: non esiste un salvataggio senza email.

Ogni decisione ha la sua scheda nel [registro delle decisioni](docs-iniziali/docs/decisioni/README.md), con le alternative scartate e i motivi. Fino allo scaffold dell'applicazione (fase 2) le schede stanno in `docs-iniziali/docs/decisioni/`, poi in `docs/decisioni/` (sezione 19).

| Tema | Decisione | Scheda |
|---|---|---|
| Database | PostgreSQL con colonne JSONB per gli attributi particolari | 0001 |
| Esecuzione | Solo PostgreSQL in Docker; l'applicazione gira direttamente sul computer | 0014 (sostituisce 0002) |
| ORM | Drizzle, non SQL puro e non Prisma | 0003 |
| Applicazione | Next.js con Server Action e Route Handler, Zod, shadcn/ui; pagina unica a passaggi, con l'invio in una finestra di dialogo | 0019, 0026 |
| Catalogo | File JSON nel repository; il seed svuota e ricarica il catalogo nel database in una transazione | 0018, 0028 (sostituisce in parte 0022) |
| Validazione | Nessuna regola di compatibilità e nessun optional; il server valida ogni configurazione con la funzione `valida` | 0027 (sostituisce 0020) |
| Salvataggio | Un solo pulsante: salva nel database, invia il PDF al cliente e la notifica al progetto in parallelo; la riga salvata registra lo stato di ogni invio | 0006, 0030 (sostituisce 0023) |
| Email | Nodemailer con un Gmail dedicato; Mailpit in sviluppo | 0017 (in parte sostituita da 0023, 0026, 0030) |
| PDF | Impaginato sul server con PDFKit; l'SVG si converte in PNG con `@resvg/resvg-js`; ripiego a colori pieni | 0015 (da confermare con la prova) |
| Ricontatto | Nessun ricontatto dei clienti, nessun consenso commerciale | 0007 |
| Privacy | Presa visione dell'informativa; conservazione 12 mesi con scadenza in una colonna; cancellazione su richiesta | 0007 |
| Cookie | Nessun cookie e nessuna risorsa esterna caricata nel browser | 0008 |
| Accessibilità | WCAG 2.1 livello AA sul configuratore e sulle sue finestre di dialogo, usabile da tastiera; il PDF per ora non deve essere accessibile | 0009 |
| Grafica | Viste SVG pronte per prodotto, taglio e vista, prodotte in chat dai file dell'Area Pro e convertite nel formato a marcature, con le texture ricavate dalle foto dei campioni di effe.it; foto ufficiale con i campioni dei materiali come ripiego per i prodotti futuri | 0025 (sostituisce 0010, 0016, 0021), 0029 e 0031 (sostituiscono in parte 0025 e 0029) |
| Lingua | Solo italiano | 0011 |
| Migrabilità | Regole di progetto che non precludono un database online (sezione 13) | 0012 |
| Git | Organizzazione del repository | 0013 |
| Esclusioni | Prezzi e funzioni di intelligenza artificiale nell'applicazione fuori dal progetto (sezione 21) | 0004, 0005 |

**Alternative scartate, in sintesi** (motivi nelle schede):
- Database, ORM ed esecuzione: MySQL, SQLite, MongoDB, SQL puro, Prisma, applicazione in Docker, Supabase (sezioni 6 e 7).
- Applicazione: Vite con un backend separato; solo Route Handler (API REST); stato nei segmenti del percorso (0019); route separate con una pagina di conferma (0026).
- Catalogo: solo nel database con un'interfaccia di amministrazione; solo nei file, senza database; file TypeScript o YAML (0018).
- Viste: generatore a parametri; ricalco di immagini renderizzate altrove; 3D in tempo reale (0025); script nel repository che legge il modello FBX (0029); traduzione dei pacchetti nel formato a zone, un SVG per combinazione (0031).
- Regole di compatibilità e optional: motore delle regole provato su un catalogo finto (0027).
- Email: servizi transazionali (Resend, SendGrid, Mailgun); notifica in copia nascosta (0017); notifica inviata dopo l'email al cliente (0030).
- PDF: `@react-pdf/renderer`, jsPDF, Playwright o Puppeteer, conversione dell'immagine nel browser (0015, sezione 11).

Le esclusioni (prezzi, intelligenza artificiale nell'applicazione, 3D, applicazione in Docker e le altre) sono raccolte nella sezione 21; i rischi e le mitigazioni nella tabella della sezione 20.1.

---

## 3. Glossario

| Termine | Significato |
|---|---|
| **Effe / effe.it** | L'azienda produttrice e il suo sito, da cui provengono catalogo, immagini e texture |
| **Prodotto** (o modello) | Una sauna del catalogo, ad esempio Aladdin. Nel codice si usa sempre `product` |
| **Taglio** | Una misura del prodotto, con codice ed etichetta, ad esempio Aladdin 60 (200 × 160 × 210 cm, larghezza × profondità × altezza). Nel codice `size` |
| **Versione** | Una combinazione con una propria foto ufficiale sul sito: per Aladdin taglio ed essenza ("Aladdin Rovere 60"), per Cabanon il taglio ("Cabanon Garden") |
| **Gruppo di opzioni** | Una scelta da fare, ad esempio Essenza o Pedana in gres. Ogni gruppo ha una sola scelta, obbligatoria |
| **Valore di opzione** | Una delle alternative di un gruppo, ad esempio Rovere rigatino |
| **Essenza** | Il legno a scelta della sauna, per Air e Aladdin. Nel codice il gruppo si chiama `wood`; per Cabanon i gruppi sono il rivestimento esterno (`ext`) e la boiserie interna (`int`) |
| **Pedana** | Il piano a pavimento in gres che il catalogo propone per alcuni prodotti. Dove c'è, una finitura è sempre selezionata |
| **Materiale** | Legno, alluminio, gres, ondulino o specchio. Nel catalogo ha nome e tipo; texture e colori stanno nel manifest delle viste |
| **Manifest** | Il file `manifest.json` delle viste di un prodotto: gruppi e opzioni con la loro texture o i loro gradienti, tagli con la cartella delle viste, file con le misure (sezione 15.2) |
| **Marcatura** | Un attributo `data-…` nel file base di una vista che dice cosa cambia con le scelte: presenza di un elemento, valore di un attributo, texture di un pattern, colori di un gradiente (sezione 15.2) |
| **Vista** | Uno dei modi di guardare la configurazione: Esterno (isometrico), Interno (la parete frontale vista di fronte, con l'interno visibile dal vetro), Pianta, per Cabanon anche Interno 3D (l'esterno senza pareti frontali, porta e tetto della sauna), più il pannello Materiali (campioni) |
| **Produzione delle viste** | Le viste SVG di un taglio si producono in chat a partire dai suoi file dell'Area Pro; gli script di `scripts/viste/` le convertono nel formato a marcature e applicano le correzioni note (sezione 9) |
| **Snapshot** | La copia delle scelte, con le loro etichette, salvata nella riga della configurazione |
| **Area Pro** | L'area riservata di effe.it con i file 3D e 2D (DWG, FBX, SKP) |
| **Tutor** | Il referente del tirocinio: ha dato le indicazioni sul progetto e valuta la demo. Le indicazioni citate nel documento sono state date a voce, non per iscritto |
| **Via libera del tutor** | L'approvazione di questo documento, che permette di iniziare il codice; da lì parte il calendario (sezione 15.5). È diversa dalle autorizzazioni sull'uso delle immagini e dei file dell'Area Pro (sezione 9.4), che ci sono già |
| **Autore** | Nicolas (N), che scrive questo documento. "Scelta dell'autore" indica una decisione presa da lui, non dal tutor né dal sito |
| **Sede** | L'azienda del tirocinio, dove si tiene la demo |
| **Revisione EGM** | (Elephant-Goldfish Model, cioè revisori senza memoria della stesura che leggono solo il documento) Il metodo con cui è stato rivisto il documento, con revisioni separate per aspetto, ad esempio zoom-out (semplicità e perimetro), catalyst (contraddizioni) e comprensione. I report dell'ultima revisione sono nella cartella principale del repository, quelli delle versioni precedenti in `archivio/` |
| **Livello A / livello B** | I due modi di mostrare un prodotto: A con le viste SVG prodotte dai file dell'Area Pro, B con la foto ufficiale e i campioni dei materiali (sezione 9.2). Nella tabella `product` sono `viewer: "svg"` e `viewer: "image"` |
| **Contratto condiviso** | Tipi, schemi, funzioni comuni e formato delle viste, fissati all'inizio in una sola pull request (sezione 15.2) |
| **valida** | La funzione pura che controlla che una configurazione esista nel catalogo: prodotto, taglio, gruppi e valori (sezione 10.1) |
| **componiVista** | La funzione pura che applica le scelte alle marcature di una vista (texture, gradienti, elementi presenti); la usano il browser e il server (sezione 9.3) |
| **token** | Il codice casuale di una configurazione salvata, usato da "Riprova" e da "Scarica il PDF" (sezione 8.1) |
| **request_id** | Il codice generato dal client a ogni apertura della finestra di invio, contro le righe doppie (sezione 10.2) |
| **Fase** | Una delle dieci tappe del lavoro, numerate da 1 a 10 (sezione 15.5) |
| **P1–P15** | Le decisioni sui punti aperti prese il 2026-11-11 e riviste il 2026-11-12 (sezione 20.3) |
| **Seed** | Lo script che carica i file del catalogo nel database (sezione 8.2) |
| **Scheletro** | La prima versione che funziona dall'inizio alla fine con un prodotto (fase 3) |
| **Blocco delle funzioni** | La fase 7, da cui non si aggiungono funzioni nuove; lo schema del database è già bloccato dalla fine della fase 4 |

---

## 4. Requisiti

**Funzionali**
- **RF1.** Il cliente sceglie prodotto, taglio e materiali. Ogni gruppo ha esattamente un valore scelto.
- **RF2.** L'anteprima si aggiorna a ogni scelta e offre le viste Esterno, Interno, Pianta e Materiali; Cabanon anche Interno 3D. Un prodotto al livello B ne offrirebbe due, Foto e Materiali (sezione 9.2).
- **RF3.** Il server rifiuta una configurazione non valida (prodotto, taglio o valore inesistente), anche se arriva da un URL modificato a mano.
- **RF4.** Lo stato delle scelte sta nell'URL, che si può copiare e condividere.
- **RF5.** "Ricevi il riepilogo" salva la configurazione, invia al cliente il PDF e notifica l'email del progetto.
- **RF6.** Se l'invio fallisce, il cliente vede un messaggio che dice che l'email non è partita e indica una di queste cause: server di posta non raggiungibile, accesso all'account rifiutato, tempo scaduto, indirizzo rifiutato, errore imprevisto. Il messaggio offre "Scarica il PDF" e, se restano tentativi, "Riprova", che non crea una seconda configurazione.
- **RF7.** Le configurazioni scadono dopo 12 mesi e si possono cancellare su richiesta.

**Non funzionali**
- **RNF1.** WCAG 2.1 AA sul configuratore e sulle sue finestre di dialogo, uso completo da tastiera.
- **RNF2.** Nessun cookie e nessuna risorsa esterna caricata nel browser.
- **RNF3.** Avvio della demo da clone pulito con `npm ci` e `npm run demo`, una volta copiato il file `.env` e soddisfatti i prerequisiti della sezione 7.
- **RNF4.** Il risultato dell'invio è visibile entro 60 secondi dal clic su "Ricevi il riepilogo".
- **RNF5.** Solo italiano.

---

## 5. Cosa deve gestire il database

1. **Opzioni eterogenee.** Ogni prodotto ha tagli, gruppi di scelte e materiali diversi. Un modello a colonne fisse richiederebbe una colonna per ogni opzione di ogni prodotto.
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
| Lavoro in due, migrazioni | Drizzle Kit | Drizzle Kit | Drizzle Kit | Drizzle non lo supporta; servirebbe un altro strumento |
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
- **MongoDB.** È tentante per le opzioni variabili, ma il catalogo ha molte relazioni che in MongoDB andrebbero controllate dal codice, non dal database. Drizzle non supporta MongoDB, quindi le migrazioni andrebbero gestite con un altro strumento, e la flessibilità che offre si ottiene già con JSONB.

### 6.7 Perché Drizzle e non SQL puro

Gli sviluppatori conoscono SQL, quindi un ORM non è obbligatorio. Con l'SQL puro (`postgres.js` o `pg`) il progetto sarebbe fattibile. Il rischio concreto, però, non sono le query: sono **migrazioni** e **tipi**.

- **Migrazioni.** Una migrazione è un file che descrive una modifica alla struttura del database, da applicare in ordine. In due, con due database separati, servono per tenere gli schemi uguali. Lo schema è scritto in TypeScript e Drizzle Kit genera i file di migrazione, versionati in Git; l'altro sviluppatore li applica con un comando. Con SQL puro servirebbero file numerati a mano e uno script che li applichi in ordine, con il rischio di conflitti quando in due si modifica lo schema.
- **Tipi.** I tipi TypeScript derivano dallo schema: un errore su un nome di colonna si vede mentre si scrive. Con SQL puro andrebbero scritti e mantenuti a mano, e gli errori emergerebbero solo a runtime.
- **Resta vicino all'SQL.** Le query somigliano all'SQL e, quando serve, si scrive SQL direttamente dentro lo stesso codice.

**Prisma** era l'ipotesi iniziale. È stato rivalutato e scartato: ha uno schema in un linguaggio proprio e query costruite da un client generato, quindi nasconde di più l'SQL; gli sviluppatori conoscono SQL e il vantaggio non compensa.

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
  3. tutti gli stati di invio rimasti `pending` diventano `failed`: l'applicazione non è ancora avviata, quindi nessun invio può essere in corso (sezione 10.3);
  4. `next build`;
  5. controllo preliminare (sezione 10.5). Database, migrazioni e prodotti caricati sono **bloccanti**: un FAIL ferma l'avvio. Gmail, la conversione di prova e la presenza di texture e viste sono **avvisi**: il FAIL si stampa ma l'avvio continua, così in caso di guasto resta il ripiego "Scarica il PDF";
  6. `next start -H 127.0.0.1`.
- Ogni sviluppatore ha **il proprio database locale**: stessi schema e stessi dati iniziali (migrazioni e seed nel repository), ma non le stesse configurazioni salvate.
- `npm run db:reset` ricrea il database da zero: è il ripristino in caso di problemi. Attenzione: `docker compose down -v` cancella il volume e quindi tutti i dati, comprese le configurazioni salvate.
- Le credenziali (Gmail, connessione) stanno in un file `.env` mai caricato su GitHub; nel repository c'è `.env.example`. Su un altro computer il file si copia a mano. `.env.example` contiene:
  - `DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5433/configuratore`;
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`: in sviluppo `127.0.0.1`, `1025`, `false` e utente e password vuoti (Mailpit, senza TLS né autenticazione); per la demo `smtp.gmail.com`, `465`, `true`, l'account e la password per le app (lettura delle variabili nell'appendice C);
  - `MAIL_FROM` e `PROJECT_EMAIL` (email del progetto, sezione 20.5);
  - `ENABLE_GALLERY`, impostata a `true` nella demo (P6).

**Prerequisiti su Windows, da verificare su entrambi i portatili:** WSL2 e virtualizzazione attivi, Docker Desktop avviato, porta 5433 libera.

**Immagini.** Non vanno nel database: texture e foto ufficiali stanno nella cartella `public/` del repository, in formato ottimizzato.

---

## 8. Modello dati

### 8.1 Tabelle

| Tabella | Contenuto |
|---|---|
| `product` | `code`, `name`, `designer`, `description`, `viewer` (`svg` o `image`), `default_size`, `fixed_materials` (`text[]`, i materiali fissi elencati nel pannello Materiali, ad esempio specchio e alluminio di Aladdin), `photos` JSONB (versione → percorso), `photo_group` (codice del gruppo che cambia la foto, nullabile), `source` JSONB |
| `product_size` | prodotto, `code`, `label`, `width_cm`, `depth_cm`, `height_cm`, `attributes` JSONB; unico per (prodotto, `code`). Quale cartella di viste usa un taglio lo dice il manifest (`viste`, `riusaDa`; sezione 9.2) |
| `material` | `code` unico in tutto il catalogo, `name`, `type` (`wood`, `aluminium`, `ceramic`, `mirror`, `cladding`). Texture e colori stanno nel manifest delle viste (scheda 0031) |
| `option_group` | prodotto, `code`, `label`, `step`, `default_value`; unico per (prodotto, `code`) |
| `option_value` | gruppo, `code`, `label`, materiale collegato (`material_code`, chiave esterna verso `material.code`, `ON DELETE RESTRICT`), `attributes` JSONB; unico per (gruppo, `code`) |
| `configuration` | vedi sotto |

Non c'è una tabella delle regole e i gruppi non hanno un tipo: ogni gruppo è a scelta singola e obbligatoria (scheda 0027). I file delle viste e i manifest non stanno nel database: si trovano in `public/viste/<prodotto>/` (sezione 9). I codici dei gruppi, dei valori e dei tagli sono gli stessi `id` del manifest (scheda 0031).

La tabella `configuration` contiene:
- `id`; il `number` della configurazione (formato `AAAA-NNNNNN`, P5 nella sezione 20.3) non è una colonna, ma si calcola in lettura dall'anno di creazione e dall'`id`;
- `token`, casuale e unico, usato da "Riprova" e nell'URL di "Scarica il PDF" (P4);
- `request_id`, UUID generato dal client a ogni apertura della finestra di invio, unico, contro i doppioni da doppio clic (P4, scheda 0026);
- data di creazione (`created_at`) e `expires_at` (creazione + 12 mesi);
- email del cliente (`email`), salvata in minuscolo, così la cancellazione per indirizzo la trova sempre;
- data e versione dell'informativa letta (`privacy_accepted_at`, `privacy_version`);
- `product_code`, **senza chiave esterna verso il catalogo**, così un prodotto tolto dal catalogo non blocca né cancella le configurazioni già salvate;
- `config` JSONB, lo snapshot con `schemaVersion: 1`;
- `customer_status` e `project_status`, di tipo `pgEnum` con valori `pending`, `sent`, `failed`;
- per l'invio al cliente: ultimo errore, numero di tentativi, data dell'ultimo tentativo (`customer_error`, `customer_attempts`, `customer_last_attempt_at`); per la notifica, che non si rimanda (sezione 10.3), solo l'ultimo errore (`project_error`).

Tutte le colonne sono `NOT NULL`, tranne quelle indicate come nullabili e `customer_error`, `project_error` e `customer_last_attempt_at`. Le tabelle figlie del catalogo usano `ON DELETE CASCADE` verso il prodotto e il gruppo; il seed le svuota comunque tutte insieme (scheda 0028). Nello schema Zod un campo è facoltativo solo se qui è nullabile. Fanno eccezione le colonne `attributes`: nel file la chiave si può omettere, lo schema Zod la porta a `{}` (`.default({})`) e la colonna è `NOT NULL DEFAULT '{}'`; il file di Aladdin non la contiene.

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

Convenzioni:
- **Nomi delle colonne.** Seguono i campi dei file JSON (P1), passando dal camelCase del JSON allo snake_case; `default` diventa `default_value` perché è una parola riservata in SQL.
- **Significato dei campi.** `step` è il passaggio in cui compare il gruppo (1 = Misure, 2 = Materiali; il taglio sta sempre in Misure), `default_value` è il valore predefinito. Il legame con le viste è il codice: il gruppo `wood` del catalogo è il gruppo `wood` del manifest.
- **Lingua dei nomi.** Colonne del database, campi dei file del catalogo e chiavi che li riprendono nei tipi (`group`, `value`) sono in inglese; funzioni, file e cartelle del progetto sono in italiano; le etichette mostrate al cliente sono in italiano.

Tipi, chiavi e vincoli definitivi si fissano nel contratto condiviso (sezione 15.2) e poi si documentano in `docs/modello-dati.md`.

### 8.2 Catalogo come file, database derivato

Ogni prodotto è un file in `data/prodotti/` con tagli, opzioni e materiali. I file sono la **fonte** del catalogo:
- finché lo scheletro (fase 3) non legge il catalogo dal database, l'interfaccia importa i file direttamente, come "catalogo finto"; dalla fine della fase 3 il configuratore riceve i prodotti dal server, letti dal database, e il server applica `valida` sugli stessi dati;
- il seed valida tutti i file con Zod **prima** di scrivere: un file sbagliato fa fallire il seed e il database non cambia. Lo schema è rigido: una chiave sconosciuta lo fa fallire, mentre le chiavi che iniziano con `_` (note di lavoro come `_daVerificare`) si tolgono prima del controllo (P1). Più file possono dichiarare lo stesso materiale: il seed fallisce se due file usano lo stesso `code` con dati diversi;
- poi, in una sola transazione, **svuota e ricarica** le tabelle del catalogo, così il database coincide con i file (scheda 0028). Le tabelle del catalogo nel database non si modificano mai a mano, quindi nel database non c'è niente da conservare tra un seed e l'altro. Se un passo fallisce, la transazione si annulla e il catalogo resta quello di prima. La tabella `configuration` non si tocca e non ha chiavi esterne verso il catalogo (sezione 8.1), quindi le configurazioni salvate non si perdono. Gli `id` del catalogo cambiano a ogni seed: nessuno li usa fuori dal catalogo, perché URL e snapshot usano i codici.

Dopo ogni modifica a un file si rilancia il seed (lo fa anche `npm run demo`). Il database serve per i vincoli, per la lettura del catalogo da parte della pagina e per le configurazioni salvate. Il lavoro di inserimento si divide per file, senza conflitti di Git; un materiale dichiarato in modo diverso in due file fa fallire il seed.

---

## 9. Grafica

### 9.1 Obiettivo e scelta

**Obiettivo:** immagini grafiche di qualità, non 3D in tempo reale: i modelli 3D dell'Area Pro non possono entrare nel repository. Un'anteprima è accettabile se ogni materiale scelto si riconosce dalla sua texture e se forma e proporzioni corrispondono alla foto ufficiale della versione. Per un taglio che riusa le viste di un altro (`riusaDa`, sezione 9.2) si confronta con la foto solo la forma: le proporzioni sono quelle del taglio di origine, e lo dichiara la nota "illustrazione del taglio …". Il controllo si fa a vista nella pagina `/galleria` (sezione 18).

**Scelta: viste SVG pronte, prodotte in chat a partire dai file dell'Area Pro e convertite nel formato a marcature** (schede 0025, 0029 e 0031). Le viste non si disegnano nell'applicazione: si producono prima, una volta per taglio, e l'applicazione cambia solo ciò che dipende dalle scelte.

Il configuratore mostra queste viste:
- **Esterno:** la sauna in isometria, con il fronte, un fianco e il tetto;
- **Interno:** la parete frontale vista di fronte, con l'interno visibile attraverso il vetro (nelle versioni precedenti si chiamava Frontale);
- **Pianta:** la sauna vista dall'alto, senza il tetto;
- **Interno 3D**, solo per Cabanon: l'esterno senza le due pareti frontali, la porta, la soglia e il tetto della sauna, come lo schema dei materiali di effe.it; mostra la boiserie, che dall'esterno non si vede. Gli altri prodotti non ce l'hanno (scelta dell'autore, scheda 0031);
- **Materiali:** un pannello con i campioni dei materiali scelti e di quelli fissi.

Nel PDF vanno l'esterno in grande e l'interno più piccolo (P12).

**Prodotti di partenza** (scheda 0031): Air (tagli 60, 80, 120), Air Corner (80 Corner, 105 Corner), Aladdin (45, 60) e Cabanon Garden (senza deck, con deck Medium, con deck Large). Terrace e deck Small di Cabanon mancano, perché non c'è il modello. Yoku S è messo da parte: si inserisce solo se avanza tempo, con la stessa procedura.

**Come si producono.** Per ogni prodotto:
1. si carica in chat un file dell'Area Pro (finora DWG; vanno bene anche FBX o SKP), come autorizzato dal tutor (sezione 9.4), insieme alle foto e ai PDF del sito che servono a ricostruire ciò che il file non contiene (i deck di Cabanon);
2. la chat consegna un pacchetto con un SVG per ogni combinazione di taglio, vista e materiali (114 file in tutto per i quattro prodotti);
3. `scripts/viste/converti-pacchetti.mjs` confronta le combinazioni e scrive **un SVG base per taglio e vista**, con le marcature di ciò che cambia, e il **manifest** del prodotto (formato nella sezione 15.2);
4. `correggi-viste.mjs` applica le correzioni note, `vista-interna-cabanon.mjs` ricava l'Interno 3D di Cabanon dall'esterno, `materiali.mjs` scrive nei manifest le texture e i gradienti presi dalle foto dei campioni;
5. `verifica.mjs` ricompone ogni combinazione dei pacchetti e la confronta con l'originale; il confronto con le foto in `/galleria` decide se la vista resta nel repository.

I pacchetti originali restano fuori dal repository (`data/vecchieViste/`, esclusa da git); nel repository entrano i file base, i manifest, le texture e gli script. La procedura, il formato e le correzioni note sono in `docs/viste.md` (oggi `data/viste/README.md`). La chat non dà lo stesso risultato due volte: la fonte delle viste è il file nel repository, e gli script lo rifanno sempre uguale a partire dai pacchetti.

**Texture dalle foto.** Le foto dei campioni scaricate da effe.it stanno in `public/viste/texture/originali/`. `texture-dalle-foto.ps1` ne ricava texture quadrate di 512 px ripetibili senza giunte: ritaglio centrale, luce uniformata riga per riga, bordi sfumati; per le doghe della boiserie di Cabanon misura il passo delle tavole sulla foto e ne affianca due. Scrive anche il colore medio di ogni foto (`medie.json`), da cui `materiali.mjs` ricava i gradienti dell'ondulino di Cabanon e `correzioni.mjs` il colore alluminio della struttura. Lo specchio di Aladdin resta un gradiente.

**Alternative** (motivi nelle schede 0025, 0029 e 0031)
- *Generatore a parametri:* ripetibile senza file 3D, ma la resa è schematica.
- *Script nel repository che legge l'FBX:* ripetibile, ma richiede regole per ogni modello, non legge i DWG e la resa non era al livello del mockup.
- *Formato a zone della scheda 0029:* tradurre i pacchetti avrebbe voluto dire rifarli e perdere i pattern in prospettiva.
- *Un SVG per combinazione, come nei pacchetti:* 31,7 MB invece di 4 MB, e un file nuovo per ogni materiale aggiunto.
- *3D in tempo reale nel browser:* escluso, perché i modelli non possono entrare nel repository.

**Stato.** Il 2026-11-13 le viste dei quattro prodotti sono prodotte, convertite e verificate: 114 combinazioni su 114 ricomposte uguali agli originali corretti, confronto a vista con le foto e la brochure di effe.it. Restano da fare: lo spostamento da `data/viste/` a `public/viste/` (fase 2), la prova con resvg (sezione 11) e i file del catalogo di Air, Air Corner e Cabanon.

### 9.2 Livelli di resa, limiti e come si riduce il rischio

1. **Serve un file dell'Area Pro del taglio** (FBX, DWG o SKP). L'inventario dei file disponibili per ogni prodotto e taglio, con formato e variante, va in `docs/catalogo-inventario.md`.
2. **Il livello di resa è del prodotto, non del taglio.** `viewer` è una colonna di `product`: in un prodotto al livello A ogni taglio ha le sue viste, direttamente o con `riusaDa`. Un taglio che non ha file dell'Area Pro riusa le viste di un altro taglio (punto 4) o resta fuori.
3. **Un file descrive un taglio e una sola variante.** Se il catalogo propone varianti che cambiano la forma, si inserisce quella del file disponibile e le altre restano fuori; la variante fa parte del nome del prodotto. Oggi riguarda Cabanon, di cui c'è solo Garden: Terrace resta fuori.
4. **Riuso delle viste tra tagli.** Un taglio senza file può usare le viste di un altro taglio dello stesso prodotto (`viste` e `riusaDa` nel manifest), con la nota visibile "illustrazione del taglio …". È ammesso solo se la forma è la stessa; il disegno mantiene le proporzioni del taglio di origine, e le misure mostrate restano quelle del taglio scelto. Oggi Air 60 e Air 120 riusano Air 80, Air 105 Corner riusa Air 80 Corner.
5. **Due livelli di resa:**
   - **Livello A:** viste SVG prodotte dai file dell'Area Pro. Tutti e quattro i prodotti di partenza sono al livello A;
   - **Livello B:** foto ufficiale della versione, con accanto il pannello dei campioni e l'etichetta "anteprima fotografica, materiali indicati a lato". Le viste sono due, Foto e Materiali. Nel PDF vanno la foto e i campioni. È un ripiego per i prodotti futuri: non risponde al problema della sezione 2, e oggi nessun prodotto lo usa.
6. **Regola di decisione**, per i prodotti futuri (ad esempio Yoku S). Se produrre, convertire e controllare le viste di un taglio richiede più di 4 ore di lavoro di una persona, anche in più sessioni, tutto il prodotto passa al livello B, con la foto ufficiale.
7. **Controllo.** Ogni vista passa la prova sul formato (sezione 18) e `verifica.mjs`, e si confronta con la foto ufficiale nella pagina `/galleria`. Per ogni taglio `docs/viste.md` annota le differenze note rispetto al sito, ad esempio Aladdin 45, che nel DWG misura 180 × 160 cm e sul sito 180 × 140 cm.
8. **Peso delle viste.** I file base pesano da 15 a 135 KB; le texture sono JPG di 512 px. La pagina riceve solo le viste del prodotto aperto; quelle di un altro prodotto si leggono da `public/viste/` quando lo si sceglie.

### 9.3 Anteprima in tempo reale

- Una **funzione pura** `componiVista(svg, scelte, gruppi, href, opzioni) → stringa SVG`, senza DOM, è usata sia dal browser sia dal server (sezione 11). Riceve il testo di un file base, le scelte (`{ wood: "wenge", floor: "moka" }`) e i gruppi del manifest (firma nella sezione 15.2). Esiste già in `scripts/viste/componi.mjs` e si porta in `src/lib/viste/`.
- **Cosa fa.** Toglie gli elementi con `data-se` non soddisfatto, scrive gli attributi `data-per-…` con il valore della scelta, mette nei `<pattern>` con `data-materiale` la texture dell'opzione scelta e nei `<linearGradient>` con `data-materiale` i suoi colori, mette nei `<pattern>` con `data-texture` la texture fissa. Forme, ombre e bordi sono già nel file base: la funzione non calcola colori.
- **Texture in prospettiva.** Ogni faccia ha il suo pattern con una `patternTransform`, quindi la foto del campione segue il piano della faccia; un quadrato di 256 unità corrisponde a circa 55 cm sulle pareti.
- **Materiali fissi.** Specchio e alluminio di Aladdin, struttura e deck di Cabanon in colore Alluminio sono già nel file base: non dipendono dalle scelte.
- `href(idTexture)` dice come includere le texture: un percorso di `public/viste/texture/` nel browser, un data URI preparato dal server per il PDF.
- **Id unici.** L'anteprima è un SVG inline nella pagina, non un `<img>`. Più viste nella stessa pagina condividono gli id dei pattern e dei gradienti, quindi `componiVista` mette davanti a ogni id un prefisso diverso a ogni chiamata, oppure quello passato in `opzioni.prefisso`.
- Il server passa al configuratore le viste e il manifest del prodotto aperto insieme al catalogo: cambiare materiale o taglio non richiede altre richieste; cambiare prodotto legge le sue viste da `public/viste/` (sezione 9.2, punto 8).
- **Pedana di Aladdin.** È disegnata come riquadro di 120 × 120 × 5 cm sotto la stufa, con la posizione stimata dalle foto; c'è solo nelle viste in cui si vede.
- **Pavimento di Cabanon.** È a listelli da parete a parete, sempre in Aspen termotrattato qualunque boiserie si scelga, come nella brochure di effe.it: con la boiserie cambiano le doghe delle pareti e le panche.
- **Quote.** Larghezza, profondità e altezza del taglio si mostrano come testo accanto alla vista, non dentro l'SVG: così restano corrette anche quando un taglio riusa le viste di un altro.
- **Proporzioni.** Le viste hanno proporzioni diverse tra loro: il contenitore ha un rapporto fisso con `object-fit: contain`, e `width`/`height` del manifest riservano lo spazio. Il testo alternativo è nell'`alt`, ad esempio «Aladdin 60, Wengé, pedana Moka, vista esterna».

### 9.4 Uso delle immagini

Il tutor ha autorizzato a voce l'uso di ciò che è visibile sul sito; non c'è un'autorizzazione scritta. Le foto, comprese quelle dei campioni da cui si ricavano le texture, si copiano in `public/` e non si richiamano dal sito, per rispettare la regola sulle risorse esterne. I file dell'Area Pro (DWG, FBX, SKP, schede di preinstallazione) non entrano nel repository. Il tutor ha autorizzato a mettere nel repository le viste ricavate da quei file, purché i file nativi restino fuori.

**File dell'Area Pro in chat.** Produrre le viste in chat vuol dire caricare i file dell'Area Pro su un servizio esterno. Il tutor lo ha autorizzato (riferito dall'autore il 2026-11-12); l'autorizzazione è annotata anche nella scheda 0029. Nel repository continuano a entrare solo le viste prodotte, non i file nativi né i pacchetti originali della chat.

---

## 10. Applicazione e flusso

### 10.1 Architettura

- **Una sola pagina**, `/`, renderizzata sul server: legge dal database tutti i prodotti, con tagli, gruppi, valori e materiali, e i file delle viste del prodotto aperto, e li passa al configuratore (scheda 0026). Le viste di un altro prodotto si leggono da `public/viste/` quando lo si sceglie (sezione 9.2).
- Il configuratore è un componente client a passaggi (Modello, Misure, Materiali, Riepilogo), con l'anteprima e la barra in basso come nel mockup. Lo stato sta nell'URL e **contiene solo lo stato del client**: non è legato a una configurazione salvata. L'URL si aggiorna con `window.history.replaceState`, che Next.js tiene allineato con `useSearchParams` senza richieste al server: il server legge lo stato dall'URL solo al primo caricamento. Un valore che non esiste nel catalogo si sostituisce con quello predefinito, con un avviso.
- Una **funzione pura** `valida(config, catalogo) → {valida, errori}` controlla la struttura: il prodotto e il taglio esistono, ogni gruppo appartiene al prodotto, ogni valore appartiene al suo gruppo, ogni gruppo ha un valore. La usa il server, insieme a Zod, per rifiutare una configurazione non valida. Un URL sbagliato lo corregge `normalizza(query, catalogo) → { config, avvisi }`, in `src/contratti/normalizza.ts`, che sostituisce ogni codice sconosciuto con il predefinito.
- **Componenti e flusso dei dati:**
  - nel browser: pagina e configuratore (`src/app/`, `src/components/`) e composizione delle viste (`src/lib/viste/`);
  - nel server Next.js: Server Action per l'invio e "Riprova", Route Handler per il PDF (P8). Usano Zod e `valida` (`src/contratti/`), Drizzle verso PostgreSQL (`src/db/`), `componiVista` con resvg per l'immagine, PDFKit per il PDF e Nodemailer per le email (`src/server/`);
  - in Docker: PostgreSQL, con il catalogo caricato dai file e le configurazioni salvate;
  - fuori dall'applicazione: la produzione delle viste in chat e gli script di `scripts/viste/` che le convertono (sezione 9.1); i file base, i manifest e le texture entrano in `public/viste/`.

  Le route sono tre (P6): `/`, il configuratore; `/riepilogo/[token]/pdf`, il PDF rigenerato dalla riga salvata; `/galleria`, il controllo visivo delle viste, attivo nella demo. Il dettaglio va in `docs/architettura.md`.

### 10.2 Flusso dell'invio

Un solo pulsante, "Ricevi il riepilogo". La riga della configurazione funziona come una **posta in uscita**: si salva prima di qualsiasi invio e registra cosa è stato consegnato.

1. Il cliente inserisce l'email, la conferma scrivendola due volte e dichiara di aver letto l'informativa. Il pulsante si disattiva mentre la richiesta è in corso.
2. Il server valida email e configurazione (Zod e `valida`).
3. Il server inserisce la riga con entrambi gli stati `pending`, il primo tentativo del cliente registrato (numero e data), e la scrive subito nel database (commit), prima di qualsiasi invio. Riceve `id` e `number`.
4. Il server genera il PDF in memoria (sezione 11).
5. Il server invia **insieme** il PDF al cliente, come allegato, e la notifica all'email del progetto, con Nodemailer e un Gmail dedicato al progetto (scheda 0030):
   - ogni invio scade dopo **15 secondi complessivi**, perché i timeout predefiniti di Nodemailer sono di minuti; la scadenza di un invio non interrompe l'altro (come si ottiene: appendice C);
   - il server attende entrambi gli invii, poi aggiorna `customer_status` e `project_status` a `sent` o `failed`, con l'errore;
   - un fallimento della notifica non cambia la risposta al cliente;
   - nel caso peggiore la risposta arriva dopo circa 15 secondi più la generazione del PDF. RNF4 (60 secondi) è rispettato se la generazione resta sotto i 45 secondi: si misura nella prova della sezione 11.
6. La finestra di dialogo mostra il risultato e offre sempre **"Scarica il PDF"**, rigenerato dalla riga salvata.

Il `request_id`, generato dal client a ogni apertura della finestra (scheda 0026), evita righe doppie in caso di doppio clic: se la stessa richiesta arriva due volte, il server non crea una seconda riga ma restituisce quella esistente (P4). Se quella riga ha ancora `customer_status = pending`, perché il primo invio è ancora in corso, l'esito è `in-corso` (P8): la finestra mostra "Invio in corso: controlla la tua casella tra poco" e offre "Scarica il PDF". Se la riga è già `sent` o `failed`, si restituisce il suo esito, con il token e la possibilità di riprovare. Next.js esegue in serie le Server Action dello stesso client, quindi `in-corso` arriva soprattutto da chiamate concorrenti fuori dall'interfaccia, come nelle prove.

### 10.3 Se l'invio fallisce

- La riga resta salvata con `customer_status = failed`.
- Il cliente vede il messaggio descritto in RF6 e può comunque scaricare il PDF. Il codice d'errore di Nodemailer decide la causa:

  | Codice | Causa (RF6) | Messaggio |
  |---|---|---|
  | `ECONNECTION`, `EDNS`, `ESOCKET`, `ETLS` | server di posta non raggiungibile | "Il server di posta non è raggiungibile. Controlla la connessione." |
  | `EAUTH` | accesso all'account rifiutato | "Il server di posta ha rifiutato l'accesso." |
  | `ETIMEDOUT` e la scadenza di 15 secondi | tempo scaduto | "Il server di posta non ha risposto in tempo." |
  | `EENVELOPE` | indirizzo rifiutato | "L'indirizzo email è stato rifiutato." |
  | altro | errore imprevisto | "L'email non è partita per un errore del server di posta." |

  In ogni caso `customer_error` contiene `<causa>:<codice di Nodemailer>`, con la causa scritta come in P8 (ad esempio `imprevisto:EMESSAGE`).

- **"Riprova"** rimanda l'email per la **stessa riga**, identificata dal `token`, senza crearne una nuova. È disponibile finché la finestra resta aperta: dopo averla chiusa si rifà l'invio, che crea una nuova configurazione (scheda 0026).
- "Riprova" rimanda solo l'email al cliente, e solo se `customer_status = failed` e restano tentativi: al massimo 3 compreso il primo invio, quindi "Riprova" si usa al massimo due volte. Non c'è un'attesa minima tra due tentativi. Il controllo e il passaggio a `pending` avvengono in un'unica operazione atomica sul database (appendice C): due clic contemporanei non producono due invii e una riga già inviata non si rimanda. Quando i tentativi sono finiti il pulsante non compare e resta "Scarica il PDF".
- Se "Riprova" non può partire, il motivo è uno di quattro (P8): `inviata` (l'email è già partita), `in-corso` (un altro invio per la stessa riga è in corso), `esauriti` (tentativi finiti), `inesistente` (token sconosciuto o riga scaduta).
- Uno stato rimasto `pending` perché il processo si è interrotto tra il salvataggio e l'invio resta così fino al riavvio: all'avvio `npm run demo` segna `failed` tutti gli stati `pending` (sezione 7). Con il processo interrotto la finestra di dialogo non c'è più, quindi "Riprova" non serve per quella riga. Dopo un'interruzione si riparte sempre con `npm run demo`: con `npm run dev` o `next start` lanciati a mano le righe restano `pending`.
- Dopo un timeout non si può escludere che l'email sia partita comunque: in quel caso "Riprova" può produrre un doppione. Per la demo è accettato.
- **Se il PDF non si genera.** La generazione prova tre volte, in ordine: resa completa, poi `flat: true`, poi il solo elenco delle scelte. La stessa sequenza vale per l'invio, per "Riprova" e per "Scarica il PDF". Se anche l'ultimo tentativo fallisce, o se un passo tra il 4 e il 5 lancia un'eccezione, entrambi gli stati diventano `failed` con l'errore: la riga non resta mai `pending` mentre l'applicazione gira.
- Il fallimento della notifica al progetto non è visibile al cliente e non si rimanda, né da "Riprova" né all'avvio: resta registrato nella colonna `project_status` con l'errore, che è l'unica traccia di quella richiesta per il progetto (rischio accettato, scheda 0030). I messaggi di log vanno solo sull'output del server, non su file, e riportano solo il codice d'errore e l'`id` della riga: gli errori di Nodemailer possono contenere l'indirizzo del cliente.

### 10.4 Contenuto del PDF e dell'email

Il PDF contiene l'immagine del prodotto con le scelte fatte (viste Esterno e Interno convertite, oppure foto con i campioni dei materiali, oppure versione a colori pieni), il numero e la data della configurazione e l'elenco di prodotto, taglio e materiali, con lo stesso contenuto della schermata di riepilogo. Lo stesso elenco compare anche nel corpo dell'email, così il contenuto è leggibile anche se il PDF non è accessibile.

### 10.5 Affidabilità dell'invio

- **Durante lo sviluppo** si usa **Mailpit** in locale al posto di Gmail, così non si consuma la reputazione dell'account. Mailpit è un eseguibile locale, avviato con `--smtp 127.0.0.1:1025 --listen 127.0.0.1:8025`, così non è raggiungibile dalla rete.
- **Controllo preliminare** `npm run check`, che stampa OK o FAIL in italiano per ogni voce:
  - connessione al database e migrazioni applicate;
  - numero di prodotti caricati;
  - `transporter.verify()` verso Gmail;
  - una conversione di prova di Aladdin;
  - presenza delle texture, dei manifest e dei file delle viste.

  Le prime due voci (database e migrazioni, prodotti caricati) sono bloccanti; le altre tre (Gmail, conversione di prova, texture e viste) sono avvisi (sezione 7). "Presenza dei file delle viste" vuol dire che ogni prodotto con `viewer: "svg"` ha il suo manifest, che ogni taglio e ogni gruppo e valore del catalogo vi compaiono con lo stesso codice, che ogni file elencato nel manifest esiste e che ogni texture citata è in `public/viste/texture/`. "Numero di prodotti caricati" dà FAIL se è diverso dal numero di file in `data/prodotti/`.
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

**Problema.** Per mettere nel PDF un'immagine SVG con texture bisogna prima trasformarla in PNG. I convertitori lato server si comportano diversamente dal browser su `<pattern>` con `patternTransform`, `<image href>` e gradienti. I percorsi relativi delle texture (`/viste/texture/rovere.jpg`) sul server non si risolvono.

**Decisione: conversione sul server con `@resvg/resvg-js`**, partendo dalla configurazione già validata.
- La stessa funzione che compone l'anteprima, `componiVista`, produce la stringa SVG a partire dai file delle viste (sezione 9.3).
- Le texture JPG si incorporano come data URI, con `href` di `componiVista`. Il `<title>` delle viste non si disegna: misure ed etichette le scrive PDFKit, con i font del progetto.

**Motivi**
- Il PDF si rigenera dalla riga salvata, quindi "Riprova", "Scarica il PDF" e `npm run check` usano lo stesso codice senza chiedere l'immagine al browser. L'elenco delle scelte viene dallo snapshot; l'immagine si ridisegna con il catalogo attuale. Se le scelte salvate non si risolvono più nel catalogo attuale (prodotto, taglio, valore o materiale rimosso o cambiato, vista mancante), il PDF esce con il solo elenco delle scelte. Una prova automatica lo verifica con uno snapshot che cita un codice rimosso.
- Il server non accetta immagini dal client, quindi non servono controlli su tipo e dimensione e non si incontra il limite di 1 MB del corpo delle Server Action.
- `@resvg/resvg-js` ha binari già pronti per Windows, senza dipendenze di sistema.
- Le viste non usano fusioni, filtri, classi né variabili CSS: le differenze attese rispetto allo schermo riguardano solo i `<pattern>` in prospettiva con le immagini JPG e i gradienti; la prova le verifica.

**Alternative**
- *Conversione nel browser:* il client disegna l'SVG in un canvas ed esporta un PNG. Il PDF coincide con lo schermo, ma il server dovrebbe fidarsi di un'immagine del client e il PDF non si potrebbe rigenerare. Resta la seconda opzione se la prova mostra che manca una texture o che pattern e gradienti non sono resi come nel browser.
- *Playwright o Puppeteer* con `page.pdf()`: il PDF coincide con la resa di Chromium, ma richiede un browser headless sul server (Chromium, centinaia di MB) e un processo in più da gestire. Scartato.

**Ripiego, deciso fin d'ora:** la stessa funzione con l'opzione `flat: true` sostituisce l'immagine di ogni pattern con il colore medio della foto del campione (`texture/originali/medie.json`); ombre e bordi restano quelli del file base.

**Impaginazione: PDFKit** (scheda [0015](docs-iniziali/docs/decisioni/0015-pdf-pdfkit-resvg.md)). Il PDF è una pagina A4 con l'immagine PNG prodotta da resvg e l'elenco delle scelte. PDFKit scrive il PDF in memoria, incorpora i font del progetto, gli stessi dell'interfaccia (la prova controlla gli accenti, ad esempio in "Wengé"), e va a capo da solo nei testi lunghi. Ripiego se PDFKit non funziona dentro Next.js: `pdf-lib`.

**Prova** (mezza giornata, fase 2): Aladdin 60 con Wengé e pedana Moka e Cabanon Garden con deck Large, Muschio e Legno termotrattato scuro, viste Esterno e Interno, confrontati con il browser su quattro punti (texture JPG presenti, pattern in prospettiva resi come nel browser, gradienti dell'ondulino e dello specchio, accenti corretti nel testo del PDF), con PDFKit e resvg insieme. Il risultato si aggiunge alla scheda 0015, nella sezione "Come è stato verificato".

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
| Solo email e configurazione | Si implementa | Nessun campo in più da gestire |
| Nessun cookie, font serviti dal progetto | Si implementa | Nessun lavoro in più; verificabile con gli strumenti per sviluppatori del browser |
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

Obiettivo: **WCAG 2.1 livello AA** sulla pagina del configuratore e sulle due finestre di dialogo (invio e informativa). Si dichiara "progettato per AA, verificato sulla pagina del configuratore e sulle due finestre di dialogo"; la conformità certificata completa, compresa l'anteprima SVG, non è un obiettivo.

- Tutto il configuratore è usabile **da tastiera**, con focus sempre visibile e ordine logico.
- L'anteprima ha un **testo alternativo** che descrive la configurazione scelta: `role="img"` con `aria-label` sul contenitore dell'SVG, il cui contenuto interno è ignorato dai lettori di schermo. Il testo si aggiorna a ogni cambio ma non si annuncia: le scelte le annunciano i controlli. La foto del livello B ha lo stesso testo alternativo.
- Gli errori dei moduli sono scritti in testo, collegati al campo, e il focus va al primo campo sbagliato; il campo di conferma dell'email permette di incollare.
- Contrasti, etichette dei campi e lingua della pagina (`it`) si verificano nei tre controlli fissi elencati sotto.
- Durante l'invio, che può durare fino a circa 15 secondi più la generazione del PDF (sezione 10.2), un messaggio di stato (`role="status"`) annuncia l'attesa.
- Le finestre di dialogo tengono il focus al loro interno, si chiudono con Esc e alla chiusura riportano il focus al pulsante che le ha aperte.
- Si usa shadcn/ui (basato su Radix), che gestisce focus, tasto Esc e attributi ARIA delle finestre di dialogo, ma non garantisce il livello AA.
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
| Cartelle e file | `docker-compose.yml`, `drizzle/`, `src/db/`, `src/server/`, `scripts/`, `src/app/azioni.ts`, `src/app/riepilogo/[token]/pdf/route.ts`, `public/foto/` | `src/app/` (tranne i due file di N), `src/components/`, `src/lib/viste/`, `public/viste/`, `scripts/viste/`, stili |
| Responsabilità | database, seed, invio email, PDF e sua impaginazione, conservazione dei dati, controllo preliminare | configuratore, accessibilità, produzione delle viste in chat, script di conversione, texture, composizione delle viste |
| Prodotti | file dei prodotti in `data/prodotti/` e foto | viste e manifest di ogni prodotto, texture, confronto con le foto ufficiali |

Il formato delle viste e il manifest (sezione 15.2) sono il punto di contatto tra i due: gli script li producono, la prova sul formato li controlla, `componiVista` li consuma nel browser e nel PDF, e i codici del catalogo devono coincidere con quelli del manifest.

**File iniziali.** Tutti i file si creano, tranne il mockup, le viste e gli script delle viste, già presenti, e le schede, che si spostano da `docs-iniziali/docs/decisioni/` a `docs/decisioni/`. Le sole cartelle senza un elenco di file sono `public/viste/<prodotto>/<taglio>/`, `public/viste/texture/`, `public/foto/`, `src/components/`, che segue i componenti del mockup, e `test/`.

| Percorso | Contenuto | Responsabile | Fase |
|---|---|---|---|
| `package.json`, `.npmrc`, `.gitattributes` (`* text=auto eol=lf`), `.gitignore` (con `.env`), `.env.example`, `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `eslint.config.mjs`, `src/app/layout.tsx`, `src/app/globals.css` | Scaffold del progetto | Entrambi | 2 |
| `docker-compose.yml` (servizio `db`) | Database | N | 1 (file provvisorio, nel repository dalla fase 2) |
| `drizzle.config.ts`, `src/db/schema.ts`, `src/db/client.ts` | Schema e connessione | N | 2 |
| `vitest.config.ts`, `playwright.config.ts`, `.env.test` | Configurazione delle prove (sezione 18) | N | 2 |
| `components.json`, `src/lib/utils.ts` | Creati da `shadcn init` | M | 2 |
| `src/contratti/catalogo.ts`, `src/contratti/configurazione.ts`, `src/contratti/valida.ts`, `src/contratti/normalizza.ts`, `src/contratti/viste.ts` | Contratto (sezione 15.2) | Entrambi | 2 |
| `public/viste/<prodotto>/manifest.json`, `public/viste/<prodotto>/<cartella>/ext.svg`, `int.svg`, `plan.svg`, `int3d.svg` (solo Cabanon) | Viste e manifest (sezioni 9.1 e 15.2), oggi in `data/viste/`, da spostare | M | già presenti, spostate nella 2 |
| `public/viste/texture/<id>.jpg`, `public/viste/texture/originali/` | Texture e foto dei campioni con `medie.json` (sezione 9.1) | M | già presenti, spostate nella 2 |
| `scripts/viste/componi.mjs`, `converti-pacchetti.mjs`, `correggi-viste.mjs`, `correzioni.mjs`, `pavimento-cabanon.mjs`, `vista-interna-cabanon.mjs`, `materiali.mjs`, `texture-dalle-foto.ps1`, `verifica.mjs` | Conversione dei pacchetti, correzioni, Interno 3D di Cabanon, materiali, texture, verifica (sezione 9.1, appendice C) | M | già presenti; i percorsi passano a `public/viste/` nella 2 |
| `src/lib/viste/componiVista.ts` | `componiVista` e `fileTexture` portati da `scripts/viste/componi.mjs` in TypeScript (sezione 15.2) | M | 2 |
| `src/db/catalogo.ts` | `caricaCatalogo()`: ricompone i prodotti dal database, con il tipo `Prodotto` (sezione 15.2) | N | 3 |
| `src/app/page.tsx`, `src/components/` | Pagina unica, passaggi, viste, pannello dei materiali, finestre di invio e dell'informativa (P6) | M | 3-4 |
| `src/app/galleria/page.tsx` | Pagina interna di controllo | M | 3 |
| `src/app/azioni.ts` (`'use server'`) | `inviaRiepilogo`, `riprova` (P8) | N | 3-4 |
| `src/app/riepilogo/[token]/pdf/route.ts` | Route Handler del PDF | N | 3 |
| `public/foto/<prodotto>/` | Foto ufficiali copiate dal sito, per la galleria e il livello B (sezione 9.4) | N | 2 |
| `docs/mockup/configuratore-saune-mockup.html` | Mockup di riferimento (P15) | M | già presente |
| `src/server/pdf.ts`, `src/server/email.ts`, `src/server/invio.ts` | PDF, email, flusso dell'invio | N | 2-4 |
| `src/server/seed.ts`, `src/server/avvio.ts`, `src/server/pulizia.ts`, `src/server/controllaViste.ts` | Funzioni chiamate dagli script e dalle prove (sezione 18) | N | 3-5 |
| `scripts/seed.ts`, `scripts/check.ts`, `scripts/pulizia.ts`, `scripts/avvio-demo.ts`, `scripts/prepara-test.ts` | Script (sezione 15.3) | N | 3-5 |
| `src/fonts/` | File TTF (P14) | M | 2 |
| `data/prodotti/` | File dei prodotti | N | dalla 2 |
| `test/unit/<modulo>.test.ts`, `test/e2e/flusso.spec.ts`, `test/fixtures/` | Prove (sezione 18) | Il responsabile del codice provato | dalla 2 |
| `docs/` | Documentazione (sezione 19) | Entrambi | dalla 2 |

### 15.2 Contratto condiviso

All'inizio si prepara **una sola pull request** con:
- i tipi in `src/contratti/`: `ProdottoFile`, il contenuto di un file di `data/prodotti/`, ricavato dallo schema Zod; `Prodotto`, lo stesso senza `schemaVersion` (`Omit<ProdottoFile, 'schemaVersion'>`), che `caricaCatalogo()` ricompone dal database e un elenco dei quali `valida` riceve; la configurazione con `schemaVersion: 1`;
- la funzione `valida(config, catalogo)`, con i controlli strutturali, e la funzione `normalizza(query, catalogo)`, che corregge un URL sbagliato (sezione 10.1);
- lo schema Drizzle con i vincoli di unicità;
- lo schema Zod dei file in `data/prodotti/` (formato JSON, P1), a partire dal file di Aladdin;
- il **formato delle viste**, già usato dai file di `data/viste/` e descritto in `docs/viste.md` (scheda 0031):
  - per ogni prodotto una cartella `public/viste/<prodotto>/` con `manifest.json` e una sottocartella per ogni taglio che ha viste proprie; nella sottocartella un file per vista: `ext.svg`, `int.svg`, `plan.svg`, e per Cabanon `int3d.svg`;
  - radice `<svg xmlns="http://www.w3.org/2000/svg" viewBox="…" width="…" height="…" role="img" data-set data-taglio data-vista>` e un `<title>`; `viewBox` libero;
  - un elemento per riga: le marcature si leggono riga per riga, senza parser XML né dipendenze nuove;
  - elementi ammessi: `<defs>`, `<pattern>` con una `<image>`, `<linearGradient>` con i suoi `<stop>`, `<polygon>`, `<rect>`, `<title>`; nessuno `<style>`, classe, variabile CSS, `color-mix()`, filtro, testo disegnato o riferimento esterno, tranne l'`href` delle immagini, che `componiVista` riscrive;
  - marcature: `data-se="<gruppo>:<valori>"` (l'elemento c'è solo con quei valori), `data-per-<attributo>="<gruppo>:<valore>=<x>,…"` (valore dell'attributo secondo la scelta), `data-materiale="<gruppo>"` su `<pattern>` (texture dell'opzione scelta; senza texture il pattern si toglie) o su `<linearGradient>` (gli `<stop>` dai `gradienti` dell'opzione), `data-texture="<file>"` su `<pattern>` (texture fissa), `display="none"` (elemento nascosto nel file grezzo, che mostra la prima opzione di ogni gruppo);
  - marcature di lavoro degli script, ignorate da `componiVista`: `data-colori="alluminio"` sulla radice e `data-pavimento` su un poligono, che impediscono di applicare due volte una correzione;
- il **manifest** (`schemaVersion: 2`): `views` (id ed etichetta di ogni vista), `optionGroups` (gruppi con `id`, `label` e `options`, ognuna con `id`, `label` e `texture` oppure `gradienti`), `sizes` (`id`, `label`, `viste` cioè la cartella, `riusaDa` se le viste sono di un altro taglio), `files` (percorso, `width` e `height` di ogni vista), `notes`. Le etichette mostrate al cliente sono quelle del catalogo, non quelle del manifest;
- i controlli sui prodotti, in `controllaViste(prodotto, manifest)`, in `src/server/controllaViste.ts`, solo server perché legge i file, chiamato dal seed e dalla prova sul formato: per ogni prodotto con `viewer: "svg"` il manifest esiste; ogni taglio del catalogo è in `sizes` del manifest; ogni gruppo e ogni valore del catalogo sono in `optionGroups` con lo stesso codice, e viceversa, tranne le opzioni del manifest che il catalogo non propone (ad esempio `none` della pedana di Aladdin, scheda 0027); ogni file di `files` esiste; ogni texture citata esiste in `public/viste/texture/`; ogni marcatura nomina un gruppo e valori del manifest;
- la firma della composizione, portata da `scripts/viste/componi.mjs`:

  ```ts
  componiVista(
    svg: string,                                   // testo del file base
    scelte: Record<string /* gruppo */, string /* valore */>,
    gruppi: Manifest['optionGroups'],
    href: (texture: string) => string,             // URL nel browser, data URI nel PDF
    opzioni?: { prefisso?: string; flat?: boolean }
  ): string
  ```

  Restituisce l'SVG completo, pronto per la pagina o per resvg. Senza `prefisso` ne genera uno nuovo a ogni chiamata; con `''` lascia gli id del file. Un gruppo o un valore sconosciuto fa lanciare un errore. `flat` è il ripiego della sezione 11;
- la lista iniziale delle dipendenze, tutte con versione esatta (P10):
  - lo scaffold si fa nella fase 2 con `create-next-app` nella versione fissata, in una cartella temporanea da cui si copiano i file, perché il repository contiene già dei file. Risposte: TypeScript sì, ESLint sì, Tailwind sì, cartella `src/` sì, App Router sì, alias `@/*`, npm; una domanda non elencata prende la risposta predefinita. Poi `shadcn init` con le risposte predefinite e `shadcn add dialog button radio-group checkbox input label`;
  - la lista definitiva è il `package.json` della PR del contratto; questi sono i pacchetti attesi. Quelli installati dallo scaffold: `next`, `react`, `react-dom`, `tailwindcss`, `@tailwindcss/postcss`, `clsx`, `tailwind-merge`, `class-variance-authority`, `lucide-react`, i pacchetti `@radix-ui/*` dei componenti aggiunti, `typescript`, `@types/react`, `@types/react-dom`, `@types/node`;
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
| `db:reset` | `docker compose down -v` (cancella anche `configuratore_test`: dopo serve `npm run test:setup`), `docker compose up -d --wait`, `npm run db:migrate`, `npm run db:seed` |
| `check` | `tsx --env-file=.env scripts/check.ts` (sezione 10.5; come si controllano le migrazioni: appendice C) |
| `clean` | `tsx --env-file=.env scripts/pulizia.ts` cancella le righe scadute; `npm run clean -- --email <indirizzo>` cancella quelle di un indirizzo (sezione 12) |
| `test:setup` | `tsx --env-file=.env.test scripts/prepara-test.ts`: crea il database `configuratore_test` se manca, poi applica le migrazioni con `migrate()` e fa il seed (sezione 18) |
| `test` / `test:e2e` | `vitest run` / `playwright test`, entrambi con `.env.test` |
| `demo` | `tsx --env-file=.env scripts/avvio-demo.ts`, che esegue i passi della sezione 7 |

Next.js carica `.env` da solo; `tsx` e `drizzle-kit` no: per questo gli script usano `--env-file` e `drizzle.config.ts` chiama `process.loadEnvFile()` (Node 24).

### 15.4 Per evitare conflitti

- I prodotti sono file separati in `data/prodotti/` e le viste sono file separati per taglio.
- `package.json` e il lockfile: dopo la lista iniziale (sezione 15.2), una persona alla volta aggiunge dipendenze, avvisando l'altra.
- Il registro delle decisioni è **un file per decisione**, non un unico file.
- Un file `.gitattributes` evita differenze dovute ai fine riga di Windows.

### 15.5 Fasi del lavoro e calendario

La consegna è il 26 novembre 2026. Il lavoro parte dal via libera del tutor, che arriva quando questo documento è finito e il 12 novembre non c'è ancora. Partendo il 12 novembre restano al massimo **11 giorni lavorativi**, dal 12 al 26 compresi; il 26 è il giorno della demo ed è la fase 10; ogni giorno di ritardo del via libera ne toglie uno. I giorni della tabella sono un tetto per fase, non una stima: la somma è 11, quindi **non c'è margine**. Ogni giorno di ritardo del via libera si toglie dalla fase 6, applicando i tagli 1–3 elencati sotto nel loro ordine. Il taglio 4 si applica se le fasi 3–5 superano il loro tetto. Un ritardo superiore ai 2 giorni della fase 6 non si recupera: la consegna diventa parziale e si dichiara.

| Fase | Giorni | Lavoro |
|---|---|---|
| 1. Prove delle parti incerte | fatta | Account Gmail, password per le app e invii di prova; Docker con il solo database su entrambi i portatili; script delle viste provato su un modello FBX il 2026-11-12, poi sostituito dalla produzione in chat (scheda 0029); viste di Air, Air Corner, Aladdin e Cabanon prodotte in chat, convertite e verificate il 2026-11-13 (scheda 0031); esiti e date da registrare in `docs/prove.md` (sezione 20.5) |
| 2. Contratto, viste e prova del PDF | 2 | Entrambi: repository, scaffold Next.js e file iniziali (sezione 15.1), spostamento di analisi e schede in `docs/`, PR del contratto (sezione 15.2). M: spostamento di viste e texture da `data/viste/` a `public/viste/` con i percorsi degli script, `componiVista` in TypeScript con `flat`, prova sul formato. N: foto in `public/`, prova PDF e conversione (sezione 11) con Esterno e Interno; esito nella scheda 0015. Ordine: primo giorno, mattina, scaffold e PR del contratto (entrambi); primo giorno, pomeriggio, M sposta le viste e porta `componiVista`, N copia le foto; secondo giorno, N fa la prova del PDF, M scrive la prova sul formato e `controllaViste` |
| 3. Scheletro completo | 1,5 | Pagina unica con i quattro passaggi e le viste (sezione 9.1), catalogo letto dal database, seed con validazione (svuota e ricarica, scheda 0028), scheletro dall'inizio alla fine con un prodotto (pulsante → riga → email con PDF in Mailpit). Prima verifica con tastiera e axe |
| 4. Invio reale e finestre | 1 | Invio reale con stati, invii in parallelo e "Riprova" (scheda 0030), scadenze, `npm run check`. Finestra di invio, informativa, errori e focus. **Schema bloccato alla fine della fase** |
| 5. Flusso completo | 1 | Flusso completo su entrambi i portatili. Pulizia e cancellazione. Verifica axe |
| 6. Inserimento dei prodotti | 2 | File del catalogo dei prodotti le cui viste sono già pronte, nell'ordine fissato qui sotto; poi, se avanza tempo, prodotti nuovi con la regola di decisione della sezione 9.2 |
| 7. Blocco delle funzioni | 0,5 | Da qui niente funzioni nuove. Restano ammessi dati dei prodotti, viste, rifinitura grafica e correzioni fino alla prova generale. Tag `demo-rc1` |
| 8. Prove finali | 1 | Prove della lista di accettazione (sezione 16) sul portatile che non ospiterà la demo, con un indirizzo di prova; avvio da clone pulito |
| 9. Prova generale | 1 | Criterio 1 ripetuto sul portatile della demo; prova sulla rete della sede, se possibile, con l'invio vero; registrazione del flusso (sezione 17) |
| 10. Preparazione della demo | 1 | Il 26 novembre. Documentazione finale. Database pulito, invio di prova la mattina stessa, un'email già ricevuta conservata da mostrare. Tag `demo-final`. Il giorno della demo non si sviluppa |

Una fase è finita quando il suo lavoro è nel ramo principale e `npm run build` e `npm test` passano sui due portatili.

**Ordine nella fase 6.** Le viste dei quattro prodotti sono già pronte (sezione 9.1): la fase 6 scrive i loro file del catalogo, con i codici del manifest, e li controlla in `/galleria`. Prima Cabanon (l'unico con l'Interno 3D e due gruppi di materiali), poi Air e Air Corner. Aladdin è già nella fase 3. Solo dopo, se avanza tempo, si aggiunge un prodotto nuovo, ad esempio Yoku S (appendice A.2), con la procedura della sezione 9.1.

**Se il tempo non basta**, si taglia in quest'ordine, e ogni taglio si dichiara nella consegna:
1. i prodotti oltre i quattro di partenza;
2. Air Corner;
3. Air (restano Aladdin e Cabanon, sotto il minimo di 3: la consegna diventa parziale rispetto al criterio 2);
4. le prove Playwright oltre il flusso completo.

Le fasi 8, 9 e 10 non si accorciano: sono le uniche che dicono se la demo funziona.

Il tempo che avanza va alla rifinitura delle viste, non a funzioni nuove. I prodotti non inseriti si elencano nella documentazione come lavoro futuro, con il tempo misurato per taglio.

---

## 16. Criteri di successo

Tutti obbligatori, verificati nelle prove finali (fase 8) sul portatile che non ospiterà la demo; il criterio 1 si ripete sul portatile della demo nella prova generale (fase 9). Una consegna che non li soddisfa tutti è parziale.

1. Su ciascuno dei due portatili, partendo da un clone pulito con `.env` copiato, `npm ci` e `npm run demo` portano l'applicazione in funzione in meno di 10 minuti, senza altri passaggi manuali.
2. Almeno **3 prodotti** al livello A, tra Air, Air Corner, Aladdin e Cabanon, con le viste Esterno, Interno e Pianta per ogni taglio (Cabanon anche Interno 3D) e almeno uno con più di un taglio. Ogni taglio che riusa le viste di un altro lo dichiara nell'interfaccia (sezione 9.2).
3. Ogni prodotto ha almeno un taglio e un gruppo di materiali (l'essenza, o rivestimento e boiserie per Cabanon); gli altri gruppi ci sono dove il catalogo li documenta. Ogni scelta cambia l'anteprima nelle viste in cui la zona è visibile. Un URL modificato a mano con un prodotto, un taglio o un valore inesistente torna ai predefiniti con un avviso, e una richiesta di invio con una configurazione non valida è rifiutata dal server.
4. Si inserisce un indirizzo (nella fase 8 uno di prova, nella demo quello del tutor) e si preme il pulsante. Entro 60 secondi:
   - c'è la riga nel database con entrambi gli stati `sent`, mostrata con `docker compose exec db psql -U postgres -d configuratore`, senza dipendere dalla rete;
   - l'email arriva con il PDF (viste Esterno e Interno, oppure versione a colori pieni, ed elenco delle scelte) e con lo stesso elenco nel corpo;
   - la notifica arriva nella casella del progetto.
5. Con l'account Gmail, in due prove separate: (a) `SMTP_PASSWORD` sbagliata in `.env`; (b) rete staccata. In entrambe: `customer_status = failed`, uno dei messaggi di RF6 (sezione 10.3) e "Scarica il PDF" funzionante. Nella prova (b), senza chiudere la finestra, si ricollega la rete e "Riprova" invia senza creare una seconda riga.
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

Il risultato atteso: o l'email arriva, o lo stesso PDF è già sullo schermo con un messaggio che dice lo stato dell'invio.

---

## 18. Prove

- Prove automatiche:

  | Caso | Strumento | Esito atteso |
  |---|---|---|
  | `valida` con prodotto, taglio, gruppo o valore inesistente, o con un gruppo senza valore | Vitest | errore strutturale |
  | `normalizza` con codici sconosciuti | Vitest | configurazione predefinita e un avviso per ogni codice |
  | Schema Zod: il file di Aladdin passa; un file con un codice non valido, uno con un predefinito che non è tra i valori, uno con una chiave sconosciuta | Vitest | il primo passa; gli altri falliscono con l'errore Zod sul campo |
  | Formato delle viste: ogni file in `public/viste/` ha la radice ammessa, solo gli elementi ammessi, un elemento per riga, nessuno stile, classe, filtro o testo; ogni marcatura nomina un gruppo e valori del manifest; `controllaViste` passa per ogni prodotto (codici di catalogo e manifest uguali, file e texture presenti, sezione 15.2) | Vitest | nessun file fuori formato |
  | `componiVista`: `data-se` con e senza il valore, `data-per-…`, texture dell'opzione in un pattern, pattern tolto con un'opzione senza texture, gradienti, `data-texture` fissa, prefisso degli `id` e `url(#…)`, gruppo o valore sconosciuto, `flat` | Vitest | SVG atteso |
  | Ricomposizione delle combinazioni dei pacchetti (`node scripts/viste/verifica.mjs`), da rifare dopo ogni modifica agli script | Node | tutte identiche agli originali corretti (114 su 114 il 2026-11-13) |
  | Seed dopo aver aggiunto, modificato e tolto un valore in un file | Vitest + database | dopo il seed il catalogo è uguale ai file e le configurazioni salvate non cambiano (scheda 0028) |
  | Doppio invio con lo stesso `request_id`; due invii con `request_id` diversi | Vitest + database | una sola riga nel primo caso, con esito `in-corso` se il primo invio è ancora `pending`; due righe nel secondo (schede 0026 e 0030) |
  | Due "Riprova" in parallelo; "Riprova" su una riga `sent`; quarto tentativo; token sconosciuto | Vitest + database | un solo invio e l'altro rifiutato con `in-corso`; `inviata`; `esauriti`; `inesistente` |
  | Invio verso un server SMTP di prova che accetta la connessione e non risponde | Vitest | con la scadenza di prova di 1000 ms, la risposta arriva meno di 1500 ms dopo l'inizio degli invii, quindi le due scadenze corrono insieme; entrambi gli stati `failed` con causa `tempo-scaduto` |
  | Avvio con righe `pending` | Vitest + database | tutte diventano `failed` |
  | Riga retrodatata | Vitest + database | cancellata da `npm run clean` |
  | `npm run clean -- --email <indirizzo>` | Vitest + database | cancellate tutte e sole le righe di quell'indirizzo, anche scritto con maiuscole |
  | Snapshot con un codice rimosso | Vitest | PDF con il solo elenco |
  | Vista malformata durante l'invio | Vitest + database | PDF `flat` o con il solo elenco; nessuno stato resta `pending` (sezione 10.3) |
  | Errori di Nodemailer (`EAUTH`, `ECONNECTION`, `EDNS`, `ESOCKET`, `ETIMEDOUT`, `EENVELOPE`, un codice sconosciuto) e scadenza di 15 secondi | Vitest | causa e messaggio della tabella della sezione 10.3 |
  | `inviaRiepilogo` chiamata con una configurazione non valida | Vitest + database | `ok: false`, nessuna riga |
  | Un PDF per ogni prodotto e taglio, con il catalogo letto dal database dopo il seed | Vitest + database | PDF generato senza errori |
  | URL con un valore sconosciuto | Playwright | valori predefiniti e avviso |
  | Flusso completo da tastiera, con controllo axe a ogni passaggio e con le finestre aperte | Playwright + Mailpit | email con allegato, letta da `GET /api/v1/messages` |

  **Ambiente delle prove.**
  - `.env.test` contiene solo valori di prova: `DATABASE_URL` verso `configuratore_test`, nello stesso container; `SMTP_HOST=127.0.0.1`, `SMTP_PORT=1025`, `SMTP_SECURE=false`; `SMTP_USER` e `SMTP_PASSWORD` vuoti; `MAIL_FROM` e `PROJECT_EMAIL` con indirizzi `@example.com`.
  - `npm run test:setup` (`scripts/prepara-test.ts`) si collega al database `postgres`, crea `configuratore_test` solo se manca in `pg_database` (`CREATE DATABASE` non ha `IF NOT EXISTS`), applica le migrazioni con `migrate()` di `drizzle-orm/postgres-js/migrator`, senza `drizzle-kit`, e fa il seed.
  - `vitest.config.ts` carica solo `.env.test`, con `process.loadEnvFile('.env.test')` in `setupFiles`, e si ferma se `SMTP_HOST` non è `127.0.0.1`; avvia Mailpit in `globalSetup` e lo chiude alla fine; fissa `testTimeout` a 30 000 ms.
  - Vitest gira in serie (`fileParallelism: false`) e svuota `configuration` prima di ogni file.
  - Gli script sono involucri: le funzioni stanno in `src/server/` e le prove le importano: `seed(db, cartella)`, `segnaPendingFailed(db)`, `pulisci(db, { email? })`. Le prove del seed usano file in `test/fixtures/` e alla fine rifanno il seed di `data/prodotti/`.
  - Il server SMTP muto è un `net.createServer` che accetta la connessione e non scrive niente. Il modulo di invio riceve le scadenze come parametro: 15 000 ms nell'applicazione, 1000 ms nelle prove, con i timeout di Nodemailer più lunghi della scadenza, così scatta la scadenza complessiva.
  - `playwright.config.ts` avvia due `webServer`: Mailpit, con `--smtp-auth-accept-any`, e `next build && next start -H 127.0.0.1` con `env` esplicito (`SMTP_HOST=127.0.0.1`, `SMTP_PORT=1025`, `SMTP_SECURE=false`, `SMTP_USER=''`, `SMTP_PASSWORD=''`, la `DATABASE_URL` e `PROJECT_EMAIL` di prova, `ENABLE_GALLERY=true`). Le variabili passate così hanno la precedenza su `.env`. Così una prova non manda mai email vere.
  - Mailpit deve essere nel `PATH`, nella versione indicata in `README.md`. Su ogni computer serve una volta `npx playwright install chromium`.
- Pagina interna `/galleria` che mostra ogni prodotto × taglio con i materiali predefiniti in tutte le sue viste, con la foto ufficiale accanto per il confronto e, per ogni gruppo, una riga con la vista in cui il gruppo si vede meglio (Esterno; Interno 3D per la boiserie di Cabanon) per ciascun valore; per un prodotto al livello B mostrerebbe la foto e i campioni. Serve come controllo visivo, come bersaglio per axe e come materiale di riserva per la demo.
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
| `docs/catalogo-inventario.md` | Prodotti e tagli con i file disponibili (FBX, DWG, SKP, nessuno), livello di resa, tempo misurato per taglio |
| `docs/viste.md` | Oggi `data/viste/README.md`: contenuto delle cartelle, formato a marcature, materiali dalle foto, ordine degli script, correzioni note, verifica, differenze note rispetto al sito; per ogni prodotto il file di partenza usato |
| `docs/decisioni/` | Una scheda per ogni scelta; quando una scelta cambia si aggiunge una nuova scheda che sostituisce la precedente |
| `docs/privacy-e-accessibilita.md` | Informativa, conservazione, controlli WCAG eseguiti |
| `docs/manuale-uso.md` | Come si usa il configuratore |
| `docs/prove.md` | Prove eseguite e risultati |
| `docs/demo.md` | Percorso della demo, controlli della mattina, ripieghi |

**Registro delle decisioni.** Le schede 0001–0031 sono nel [registro](docs-iniziali/docs/decisioni/README.md); fino alla fase 2 stanno in `docs-iniziali/docs/decisioni/`, poi si spostano in `docs/decisioni/`. Le schede 0016–0020 registrano le decisioni P1–P15 della sezione 20.3; le schede 0021–0024 registrano i cambi di scelta decisi dopo la revisione della v6; le schede 0025–0027 registrano i cambi del 2026-11-12 e le schede 0028–0030 quelli decisi dopo la revisione EGM della v7, sempre il 2026-11-12; la scheda 0031 registra i cambi del 2026-11-13, dopo la produzione delle viste (sezione 23.1).

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
| 0017 | [Email: Nodemailer con Gmail, stati nella riga, Mailpit in sviluppo](docs-iniziali/docs/decisioni/0017-email-nodemailer-gmail.md) | Accettata; in parte sostituita da 0023, 0026 e 0030 |
| 0018 | [Catalogo come file JSON, database derivato](docs-iniziali/docs/decisioni/0018-catalogo-file-database-derivato.md) | Accettata; in parte sostituita da 0022 e 0027 |
| 0019 | [Next.js con Server Action e Route Handler, Zod, shadcn/ui](docs-iniziali/docs/decisioni/0019-nextjs-server-action-zod-shadcn.md) | Accettata; in parte sostituita da 0026 |
| 0020 | [Regole di compatibilità condivise tra interfaccia e server](docs-iniziali/docs/decisioni/0020-regole-compatibilita-condivise.md) | Sostituita da 0027 |
| 0021 | [Viste esterne: frontale e diagonale](docs-iniziali/docs/decisioni/0021-viste-frontale-diagonale.md) | Sostituita da 0025 |
| 0022 | [Seed come sincronizzazione completa, catalogo letto dal database](docs-iniziali/docs/decisioni/0022-seed-sincronizzazione-catalogo.md) | Accettata; in parte sostituita da 0028 |
| 0023 | [La notifica al progetto si attende prima della risposta](docs-iniziali/docs/decisioni/0023-notifica-attesa.md) | Sostituita da 0030 |
| 0024 | [Il request_id lo genera il server, nel modulo](docs-iniziali/docs/decisioni/0024-request-id-dal-server.md) | Sostituita da 0026 |
| 0025 | [Viste SVG pronte, generate da uno script a partire dal modello 3D](docs-iniziali/docs/decisioni/0025-viste-pronte-da-modello-3d.md) | Accettata; in parte sostituita da 0029 e 0031 |
| 0026 | [Pagina unica a passaggi, invio in una finestra di dialogo](docs-iniziali/docs/decisioni/0026-pagina-unica-come-il-mockup.md) | Accettata |
| 0027 | [Niente regole di compatibilità né optional; pedana obbligatoria](docs-iniziali/docs/decisioni/0027-niente-regole-ne-optional.md) | Accettata |
| 0028 | [Il seed svuota e ricarica il catalogo in una transazione](docs-iniziali/docs/decisioni/0028-seed-svuota-e-ricarica.md) | Accettata |
| 0029 | [Viste prodotte in chat a partire dai file dell'Area Pro, nel formato del contratto](docs-iniziali/docs/decisioni/0029-viste-prodotte-in-chat.md) | Accettata; in parte sostituita da 0031 |
| 0030 | [Le due email partono in parallelo; "Riprova" senza attese](docs-iniziali/docs/decisioni/0030-invii-in-parallelo-riprova-semplice.md) | Accettata |
| 0031 | [Viste a marcature dai pacchetti prodotti in chat, texture dalle foto, primi prodotti Air, Air Corner, Aladdin e Cabanon](docs-iniziali/docs/decisioni/0031-viste-a-marcature-e-texture-dalle-foto.md) | Accettata |

---

## 20. Rischi e punti aperti

### 20.1 Rischi

| Rischio | Impatto | Mitigazione | Responsabile |
|---|---|---|---|
| L'invio Gmail non funziona dalla rete della demo o l'account viene bloccato | Alto: requisito obbligatorio | Provato nella fase 1, timeout, "Scarica il PDF", hotspot, prova generale (sezioni 10.5 e 17). Il blocco dell'unico account Gmail è un rischio accettato: non c'è un secondo account SMTP | N |
| La conversione SVG → PNG non rende le texture | Medio | Prova nella fase 2, ripiego a colori pieni (sezione 11) | N |
| Le viste di un prodotto nuovo, prodotte in chat, non raggiungono la qualità dei quattro di partenza, o richiedono troppo tempo | Medio: i quattro prodotti di partenza sono pronti | Procedura e script conservati (`docs/viste.md`, `scripts/viste/`), verifica delle combinazioni, prova sul formato, confronto in `/galleria`, regola delle 4 ore, riuso delle viste tra tagli, foto ufficiale come ripiego (sezione 9.2) | M |
| Una modifica agli script cambia le viste senza che ci se ne accorga | Medio | `verifica.mjs` ricompone le 114 combinazioni dei pacchetti; le correzioni sono idempotenti e marcate (sezione 18) | M |
| Docker non parte su uno dei portatili | Medio | Solo database in Docker, provato nella fase 1, prerequisiti documentati (sezione 7) | Entrambi |
| Il contratto cambia spesso e blocca il lavoro in parallelo | Medio | PR unica iniziale, modifiche solo con PR discussa, schema bloccato dopo la fase 4 (sezione 15) | Entrambi |
| Tempo insufficiente: al massimo 11 giorni lavorativi, meno se il via libera tarda | Alto | Minimo di 3 prodotti, regole e optional tolti (scheda 0027), viste dei quattro prodotti già pronte e Yoku S messo da parte (scheda 0031), seed e invio semplificati (schede 0028 e 0030), ordine dei tagli e dei lavori da tagliare già fissato (sezione 15.5) | Entrambi |
| "Riprova" e "Scarica il PDF" accessibili conoscendo solo l'`id` della riga | Medio: chi prova un `id` scarica il PDF con l'email di un'altra persona | Token casuale non indovinabile per queste azioni (P4, sezione 20.3) | N |
| Il pulsante permette di inviare email a qualsiasi indirizzo | Basso in demo locale | Rischio accettato e dichiarato; anti-spam come lavoro futuro | N |
| Il database non coincide con i file del catalogo | Medio: interfaccia e server vedono cataloghi diversi | Seed che svuota e ricarica il catalogo in transazione, rilanciato da `npm run demo` (sezione 8.2) | N |
| Il PDF rigenerato differisce da quello inviato, o non si genera, dopo una modifica del catalogo | Basso | Elenco delle scelte dallo snapshot; PDF con il solo elenco se le scelte non si risolvono più nel catalogo (sezioni 5 e 11) | N |
| Invii rimasti a metà o doppi per "Riprova" | Medio | Scadenza di 15 secondi per invio, aggiornamento condizionale, limite ai tentativi, righe `pending` segnate `failed` all'avvio (sezione 10.3) | N |
| Applicazione o database raggiungibili dalla rete della sede | Alto: estranei possono inviare email e leggere dati personali | Ascolto solo su `127.0.0.1` (sezione 7) | N |
| La notifica al progetto fallisce e non si rimanda | Basso: il cliente riceve comunque il PDF | Rischio accettato: l'errore resta in `project_status`, che è l'unica traccia (sezione 10.3, scheda 0030) | N |
| I file dell'Area Pro caricati in chat restano su un servizio esterno | Medio: file riservati del produttore fuori dal progetto | Rischio accettato, autorizzato dal tutor (sezione 9.4); nel repository entrano solo le viste prodotte | M |
| Copie dei dati del cliente nella "Posta inviata" di Gmail | Medio | Procedura manuale anche per le cancellazioni su richiesta (sezione 12) | N |

### 20.2 Punti chiusi

| Punto | Esito |
|---|---|
| Libreria che impagina il PDF | **PDFKit**, scheda [0015](docs-iniziali/docs/decisioni/0015-pdf-pdfkit-resvg.md) |
| Significato di `step` | Confermato dall'autore: `step` è il numero del passaggio del configuratore in cui compare il gruppo. `zones` non esiste più: il legame con le viste è il codice del gruppo (scheda 0031) |
| Legame tra catalogo e viste | Il 2026-11-13 l'autore sceglie codici uguali: gruppi, valori e tagli del catalogo hanno gli `id` del manifest; il manifest tiene texture e gradienti, il catalogo etichette e misure (scheda 0031) |
| Tutor e valutatore | Sono la stessa persona: nei documenti si usa solo "tutor" |
| Dove sta il mockup | Nel repository, in `docs/mockup/configuratore-saune-mockup.html`. Il contenuto è descritto nell'appendice B |
| Dati di Aladdin | Raccolti dal sito il 2026-11-11: bozza in [`data/prodotti/aladdin.json`](data/prodotti/aladdin.json), fonti e lacune nell'appendice A |
| Contratto condiviso | Confermato da Marko l'11 novembre; superato il 12 per le parti su `Geometria` (il tipo del generatore a parametri della v6) e sulle regole (sezione 23.1, schede 0025 e 0027) |
| Privacy | Confermata dal tutor: contitolarità dei due sviluppatori, art. 6(1)(b) per l'invio e 6(1)(f) per la conservazione, 12 mesi, bozza dell'informativa (sezione 12, scheda 0007) |
| Fonte per optional e regole | Il tutor conferma che non esiste: nessun optional e nessuna regola nel catalogo (P3) |
| Schede di preinstallazione dell'Area Pro | Il tutor ne autorizza l'uso per ricavare dimensioni e vincoli, solo sul computer locale e fuori dal repository (sezione 9.4) |
| File dell'Area Pro in chat | Il 2026-11-12 l'autore riferisce l'autorizzazione del tutor a caricarli in chat per produrre le viste; restano fuori dal repository (sezione 9.4, scheda 0029) |

### 20.3 Decisioni sui punti aperti

Le decisioni P1–P15 sono state prese il 2026-11-11 e alcune sono state riviste il 2026-11-12. Il testo qui sotto è quello attuale; la colonna "Scheda" indica dove ciascuna è registrata oggi, e le schede sostituite restano nel registro come storico (sezione 19). P13 dipende dalla prova della fase 2. P3 e i testi della privacy (P11) sono stati chiusi con il tutor (sezione 20.2). Le decisioni entrano nel contratto condiviso (sezione 15.2).

| # | Tema | Decisione | Scheda |
|---|---|---|---|
| P1 | Formato del catalogo | JSON, un file per prodotto, validato da Zod | 0018 |
| P2 | Validazione | Nessuna regola di compatibilità; `valida` controlla la struttura sul server | 0027 |
| P3 | Optional e regole | Nessun optional e nessuna regola; pedana obbligatoria dove il catalogo la propone | 0027 |
| P4 | Azioni sulla configurazione | Token casuale per "Riprova" e per il PDF; `request_id` generato dal client a ogni apertura della finestra | 0017 (token), 0026 (`request_id`) |
| P5 | Numero | `AAAA-NNNNNN` | 0017 |
| P6 | Route | `/`, `/riepilogo/[token]/pdf`, `/galleria` | 0026 |
| P7 | Stato nell'URL | Query string di `/` con prodotto, taglio e codici di gruppi e valori | 0026 |
| P8 | Comunicazione con il server | Server Action per invio e "Riprova", senza `redirect`; Route Handler per il PDF | 0026, 0030 |
| P9 | Prove | Vitest, Playwright con `@axe-core/playwright`, Mailpit | 0019 |
| P10 | Versioni | Node.js 24 LTS, Next.js stabile fissato, PostgreSQL 17, versioni esatte | 0019 |
| P11 | Testi | Informativa dalla bozza del mockup; email al cliente come descritta; notifica senza l'email del cliente | 0017 |
| P12 | Immagini nel PDF | Vista Esterno grande e vista Interno; foto e campioni per un prodotto al livello B | 0025, 0031 |
| P13 | Texture | Texture ricavate dalle foto dei campioni, in pattern in prospettiva per ogni faccia; colore medio della foto come ripiego | 0031 |
| P14 | Font | Jost e IBM Plex Sans, file TTF nel repository | 0016 (valida per i font, come dice la 0025) |
| P15 | Mockup | Si riprende l'interfaccia; le viste vengono dai pacchetti prodotti in chat, non dal mockup | 0025, 0031 |

Il dettaglio di ogni decisione segue.

**P1. Formato dei file del catalogo.**
- Un file JSON per prodotto in `data/prodotti/<codice>.json`, validato da uno schema Zod in `src/contratti/`.
- Codici: `^[a-zA-Z0-9-]+$`, cioè lettere senza accenti, cifre e trattino, senza spazi (`rovere`, `wenge`, `45`, `aspenT`, `gardenM`); le maiuscole servono perché i codici sono gli `id` del manifest (scheda 0031). Etichette in italiano con gli accenti (`Wengé rigatino`).
- Chiavi dell'URL: `product` per il prodotto, `size` per il taglio, poi i codici dei gruppi del prodotto (per Aladdin `wood` e `floor`, per Cabanon `ext` e `int`). Un gruppo non può chiamarsi `product`, `size`, `email`, `emailConferma`, `informativa`, `requestId` né `token`, che sono già campi del modulo o dell'URL. Il taglio non è un gruppo: nel file sta nell'array `sizes`.
- Legame con le viste: codici di tagli, gruppi e valori uguali agli `id` del manifest del prodotto, controllati da `controllaViste` (sezione 15.2). `fixedMaterials` elenca i materiali fissi da mostrare nel pannello Materiali (per Aladdin specchio e alluminio anodizzato, per Cabanon l'alluminio della struttura e l'Aspen del pavimento).
- `schemaVersion` al primo livello del file è la versione del formato del file: il seed la controlla e non la salva.
- `material.type`: `wood`, `mirror`, `aluminium`, `ceramic`, `cladding` (l'ondulino di Cabanon; identificatori in inglese, sezione 8.1).
- `photos`: chiave `<taglio>/<valore>`, dove il valore è quello del gruppo indicato da `photoGroup` (per Aladdin e Air `wood`); con `photoGroup` nullo la chiave è il solo `<taglio>` (per Cabanon, che ha una foto per taglio).
- Le chiavi che iniziano con `_` sono note della bozza: un `z.preprocess` le toglie, poi lo schema è `.strict()`, quindi ogni altra chiave sconosciuta (ad esempio un errore di battitura) fa fallire la validazione. Il file si usa così com'è dal seed e, fino alla fine della fase 3, dall'interfaccia (sezione 8.2). `_daVerificare` elenca i dati incerti; `_assetSources` dice da dove scaricare le foto, che N scarica una volta nella fase 2, ottimizza e mette nel commit in `public/foto/` (sezione 9.4); le foto dei campioni sono già in `texture/originali/`.
- *Perché JSON e non TypeScript o YAML:* lo legge sia il seed sia l'interfaccia senza compilazione, e Zod dà errori chiari; YAML aggiungerebbe una dipendenza e ambiguità sui tipi.

**P2. Validazione.** Non ci sono regole di compatibilità (scheda 0027). Ogni gruppo è a scelta singola, obbligatoria, con un valore predefinito che deve essere uno dei suoi valori: il seed rifiuta un file in cui non lo è. `valida(config, catalogo)` controlla solo la struttura (sezione 10.1). Nell'interfaccia non esistono scelte disattivate.

**P3. Optional e regole.**
- Le pagine dei prodotti su effe.it **non riportano né optional né regole di compatibilità**: elencano solo versioni, dimensioni e materiali. Gli optional del mockup (cromoterapia, audio, mensole) e la sua regola sul taglio più piccolo di un modello sono dati di esempio, non del catalogo. Il tutor ha confermato il 2026-11-11 che non esiste un'altra fonte.
- *Decisione:* non si inventano dati, e non si costruisce ciò che il catalogo non usa: nessun optional, nessuna regola, nessun gruppo a scelta multipla.
- *Pedana:* dove il catalogo la propone, una finitura è sempre selezionata; non esiste il valore "Nessuna pedana". Qui il progetto si discosta dal sito per scelta dell'autore; le altre differenze sono nella sezione 22, punto 5.

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

**P7. Stato nell'URL.** Tutto nella query string di `/`: `/?product=aladdin&size=60&wood=rovere&floor=moka`. Il passaggio corrente sta nel frammento (`#materiali`), come nel mockup. Senza `product` si apre il passaggio Modello con il primo prodotto del catalogo. Un prodotto, un taglio o un valore sconosciuto torna al predefinito (`normalizza`, sezione 10.1) e l'interfaccia lo segnala con l'avviso "«x» non esiste nel catalogo: è stato scelto «y»". Cambiando prodotto, le chiavi dei gruppi tornano ai predefiniti del nuovo prodotto. Al momento dell'invio il server valida comunque tutto.

**P8. Server Action o Route Handler.**
- **Server Action** per "Ricevi il riepilogo" e per "Riprova": la validazione Zod è condivisa e non serve un'API a parte. JavaScript è richiesto (scheda 0026).
- **Route Handler** per il PDF, perché deve restituire un file con `Content-Type: application/pdf` e `Content-Disposition: attachment; filename="riepilogo-<numero>.pdf"`.
- Firme, in `src/app/azioni.ts`:
  - `inviaRiepilogo(statoPrecedente, formData)`. Campi: `email`, `emailConferma`, `informativa` (checkbox), `requestId` e un campo per ogni chiave dello stato dell'URL (`product`, `size`, `wood`, …). Restituisce:
    - `{ ok: false, errori: Record<campo, messaggio> }` con errori di validazione, senza salvare nulla; gli errori della configurazione stanno sotto la chiave `config`; i testi degli errori del modulo vengono dal mockup (P15);
    - `{ ok: true, token, numero, cliente: 'sent' | 'failed' | 'in-corso', causa?, puoRiprovare }` dopo aver salvato la riga e provato gli invii. `causa` è una delle cinque di RF6: `'non-raggiungibile' | 'accesso-rifiutato' | 'tempo-scaduto' | 'indirizzo-rifiutato' | 'imprevisto'`. `puoRiprovare` vale `true` se `customer_status = 'failed'` e `customer_attempts < 3`; `in-corso` arriva solo con un `request_id` già ricevuto il cui primo invio non è finito (sezione 10.2);
  - `riprova(statoPrecedente, formData)`, con `token`. Restituisce lo stesso esito di `inviaRiepilogo` se l'invio è partito, altrimenti `{ ok: false, motivo: 'inviata' | 'in-corso' | 'esauriti' | 'inesistente' }`, con i testi "L'email è già stata inviata", "Invio già in corso: attendi l'esito", "Tentativi esauriti: scarica il PDF", "Richiesta non trovata: rifai l'invio". Quando la riga non si può prendere (sezione 10.3), il server la rilegge per scegliere il motivo;
  - `GET /riepilogo/[token]/pdf` → 200 con il PDF, 404 se il token non esiste o la riga è scaduta.
- Nessuna azione chiama `redirect`: l'esito si mostra nella finestra di dialogo.
- Tipi di `valida`:

  ```ts
  valida(config: { product: string; size: string; selections: Record<string, string> }, catalogo: Prodotto[])
    → { valida: boolean;
        errori: { group?: string; value?: string; messaggio: string }[] }
  ```
- Runtime: PDFKit e resvg girano solo nel runtime Node.js, che è il predefinito (dettaglio nell'appendice C).

**P9. Strumenti di prova.**
- **Vitest:** `valida`, schemi Zod, validazione dei file del catalogo, formato delle viste, `componiVista`, generazione di un PDF per prodotto e taglio.
- **Playwright** con **`@axe-core/playwright`:** flusso completo da tastiera e controllo axe sul configuratore e sulle sue finestre di dialogo.
- **Mailpit** nelle prove del flusso: la prova legge dall'API di Mailpit che l'email sia arrivata con l'allegato.

**P10. Versioni.** Node.js 24 LTS; Next.js all'ultima versione stabile al momento della PR del contratto; PostgreSQL 17. Le dipendenze si installano con versioni esatte (`save-exact=true` in `.npmrc`), così i due portatili hanno lo stesso codice.

**P11. Testi.**
- *Informativa:* si parte dalla bozza già presente nel mockup (titolare, dati, finalità, conservazione, destinatari, diritti, cookie), con la base giuridica proposta nella sezione 12 e il reclamo al Garante. La versione si salva come stringa costante (ad esempio `2026-11-v1`).
- *Email al cliente:* oggetto "Il riepilogo della tua sauna Aladdin, n. 2026-000042"; corpo con saluto, elenco delle scelte, PDF in allegato, nota "messaggio automatico, non rispondere" e indirizzo per chiedere la cancellazione.
- *Notifica al progetto:* oggetto "Nuova richiesta di riepilogo n. 2026-000042"; corpo con prodotto, scelte e data, **senza l'email del cliente**, che resta solo nel database. Così le notifiche non contengono dati personali; le copie delle email al cliente in "Posta inviata" si cancellano con la procedura della sezione 12.

**P12. Viste nel PDF.** Una pagina A4 verticale con la vista Esterno in grande, la vista Interno più piccola e sotto l'elenco delle scelte. Per un prodotto al livello B: la foto della versione e i campioni dei materiali. Se un taglio riusa le viste di un altro, la nota "illustrazione del taglio …" compare anche nel PDF.

**P13. Texture.** Le foto dei campioni del sito (ad esempio 1394 × 902 px) non si ripetono senza giunture: `texture-dalle-foto.ps1` ne ricava texture quadrate di 512 px che si ripetono senza giunte (sezione 9.1).

- *Resa:* ogni faccia delle viste ha un pattern con `patternUnits="userSpaceOnUse"` e una `patternTransform` che lo porta sul piano della faccia; il pattern contiene la texture dell'opzione scelta. Le ombre sono poligoni neri semitrasparenti sopra il pattern, già nel file base: non ci sono fusioni né filtri.
- *Senza texture:* un'opzione con `texture: null` (ad esempio "Senza pedana" nel manifest di Aladdin, che il catalogo non propone) toglie il pattern; l'ondulino di Cabanon e lo specchio di Aladdin usano gradienti.
- *Verifica:* la prova della fase 2 controlla che resvg renda pattern in prospettiva e gradienti come il browser.
- *Ripiego:* `flat: true`, cioè il colore medio della foto del campione al posto della texture (sezione 11).

**P14. Font.** Jost e IBM Plex Sans, gli stessi del mockup, entrambi con licenza SIL Open Font License, salvati nel repository (`src/fonts/`) come file TTF **statici**, presi dalla cartella `static/` dei pacchetti di Google Fonts, non variabili, perché PDFKit incorpora solo l'istanza predefinita di un font variabile e resvg supporta poco gli assi di variazione: `Jost-Regular.ttf`, `Jost-Medium.ttf`, `IBMPlexSans-Regular.ttf`, `IBMPlexSans-SemiBold.ttf`. Sul server i file si leggono da `src/fonts/` (appendice C). Pesi: Jost Medium per titoli e misure, IBM Plex Sans Regular per il testo e SemiBold per le etichette. Gli stessi file li usano `next/font/local` nella pagina e PDFKit nel PDF. Le viste non disegnano testo (il `<title>` non si vede), quindi resvg non ha bisogno dei font. Il mockup oggi li carica da Google Fonts: nel progetto non si fa (scheda 0008).

**P15. Dal mockup al codice.** Il mockup (`docs/mockup/configuratore-saune-mockup.html`) è il riferimento per l'interfaccia: passaggi, anteprima con le viste, barra in basso, finestra di invio, testi dei messaggi d'errore e bozza dell'informativa. Le viste invece vengono dai pacchetti prodotti in chat (sezione 9.1, scheda 0031).

Non si riprendono:
- i dati di esempio scritti nel codice, compresi optional e regole;
- le viste incorporate di Aladdin 60 e il loro formato (classi, variabili CSS, `color-mix()`), sostituite da quelle di `public/viste/aladdin/60/`;
- il disegno schematico a parametri usato per gli altri prodotti e tagli, e la sua vista "Interno" schematica (la vista Interno del progetto è quella dei pacchetti);
- i font caricati da Google Fonts (scheda 0008), le definizioni SVG scritte nel DOM e le variabili CSS dentro l'SVG.

### 20.4 Domande per il tutor

Le domande hanno avuto risposta il 2026-11-11 e il 2026-11-12 (sezione 20.2):
1. privacy (base giuridica, durata, contitolarità, informativa): proposta confermata (sezione 12);
2. fonte per optional e incompatibilità: non esiste (P3);
3. schede di preinstallazione dell'Area Pro: si possono usare, solo sul computer locale (sezione 9.4);
4. file dell'Area Pro caricati in chat per produrre le viste: autorizzati (sezione 9.4).

### 20.5 Ancora da fare

- Finire il documento e ottenere il **via libera del tutor** per iniziare il codice: ogni giorno di attesa toglie un giorno al calendario della sezione 15.5.
- Creare l'**email del progetto**: finché manca, il codice usa la variabile `PROJECT_EMAIL` e l'informativa un segnaposto.
- Compilare `docs/catalogo-inventario.md` con i file dell'Area Pro usati per i quattro prodotti e, per i prodotti futuri, con ciò che esiste per ogni taglio; i file restano in una cartella locale, fuori dal repository.
- Scrivere i **file del catalogo** di Air, Air Corner e Cabanon in `data/prodotti/`, e passare Aladdin a `viewer: "svg"`, con i codici del manifest (sezione 15.5).
- Portare **Node.js alla versione 24** su entrambi i portatili: su uno è installata la 22 (P10).
- Annotare cosa è stato verificato di Docker e di Gmail nella fase 1, con le date, in `docs/prove.md`.
- Spostare viste e texture da `data/viste/` a `public/viste/` e aggiornare i percorsi degli script (fase 2).

---

## 21. Fuori dal progetto

- **Prezzi, sconti, IVA e preventivi.** Esclusi per indicazione del tutor; il listino reale non è disponibile. Il documento si chiama "riepilogo".
- **Funzioni di intelligenza artificiale nell'applicazione.** Escluse per indicazione del tutor; le regole di migrabilità lasciano aperta la possibilità di aggiungerle.
- **Regole di compatibilità, optional e gruppi a scelta multipla.** Il catalogo non ne ha (scheda 0027).
- **3D in tempo reale.** Escluso da questa versione.
- **Generatore delle viste a parametri** e **script che generano le viste dal modello 3D** (schede 0025 e 0029); gli script di `scripts/viste/` convertono e correggono le viste prodotte in chat, non le generano.
- **Interno 3D per prodotti diversi da Cabanon** (scheda 0031).
- **Yoku S**, solo se avanza tempo (scheda 0031, appendice A.2); **Cabanon Terrace** e **deck Small**, perché manca il modello.
- **Viste per i tagli senza file dell'Area Pro:** riusano le viste di un altro taglio della stessa forma o restano fuori (sezione 9.2).
- **Nuovo invio della notifica al progetto** dopo un fallimento (scheda 0030).
- **Varianti che cambiano la forma** oltre quella del file dell'Area Pro disponibile.
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
   - viste SVG prodotte dai file del produttore, con le texture delle foto di effe.it, invece del 3D in tempo reale (peso, fedeltà al prodotto, procedura conservata e verificata su 114 combinazioni);
   - dati minimi e nessun cookie.
4. Per ogni scelta dire l'alternativa scartata e cosa farebbe cambiare idea, ad esempio "Puppeteer se la fedeltà del PDF non bastasse" o "Postgres online cambiando solo `.env` se si pubblicasse".
5. Presentare le esclusioni (prezzi, IA, 3D, applicazione in Docker, scheduler, regole e optional) come decisioni motivate. Mostrare l'inventario dei file disponibili per prodotto e il tempo misurato per taglio: trasformano "il più possibile" in un dato difendibile. Dire apertamente dove le viste si discostano dal sito: la pedana obbligatoria di Aladdin, Aladdin 45 disegnato con le misure del DWG (180 × 160 invece di 180 × 140 cm), i deck di Cabanon ricostruiti dai PDF e dai render, i tagli di Air che riusano le viste di un altro (`data/viste/README.md`, "Cose da sapere").
6. Avere pronta la risposta a "perché il catalogo sta anche nel database, se la fonte sono i file?": vincoli come seconda difesa, lettura del catalogo dalla pagina, coerenza con le configurazioni salvate, indicazione del tutor.

---

## 23. Modifiche

### 23.1 Rispetto alla v6 (2026-11-12)

| Punto | v6 | v7 |
|---|---|---|
| Viste | Generatore a parametri (`Geometria`, primitive, famiglie di layout), "provato" su un prodotto | Viste SVG pronte per taglio, prodotte in chat dai file dell'Area Pro (schede 0025 e 0029); il mockup non conteneva un generatore per le viste curate (9, scheda 0025) |
| Viste mostrate | Frontale e diagonale; pianta solo se avanza tempo | Esterno, Frontale, Pianta, Materiali; nel PDF esterno e frontale (9.1, P12) |
| Vista diagonale | Da scrivere da zero | È la vista Esterno, già presente nel mockup e convertita nel formato del contratto (9.1) |
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
| Stati `pending` all'avvio | Non era detto a quale stato si applicava | A ciascuno dei due stati; la notifica non si rimanda (10.3; tabella successiva) |

**Dopo la revisione EGM della v7 (2026-11-12).**

| Punto | Prima | Ora |
|---|---|---|
| Problema | Il cliente vede ogni sauna solo nelle versioni fotografate | Combinazioni senza foto (Yoku S), un solo posto con viste coerenti, riepilogo inviato; il livello B è un ripiego (2, 16) |
| Produzione delle viste | Script nel repository con regole per modello | In chat dai file dell'Area Pro (FBX, DWG o SKP), con procedura conservata e prova sul formato; autorizzata dal tutor (9.1, 9.4, scheda 0029) |
| Formato e zone | `ext`, `int`, `furn`, `frame`, `data-rot` (zone e attributo del formato precedente), `viewBox` quadrato | Zone del mockup (`roof`, `bench`, `metal`, `shadow`), rotazione per zona, `viewBox` libero, attributi ammessi elencati (15.2) |
| Livello di resa | In parte per taglio | Solo per prodotto; un taglio senza file riusa le viste di un altro o resta fuori (9.2) |
| Peso delle viste | Tutte nella pagina iniziale | Solo quelle del prodotto aperto (9.2, 10.1) |
| Colori dei materiali | Approssimati | Quelli delle viste di Aladdin 60 del mockup (appendice A) |
| Seed | Sincronizzazione con calcolo delle differenze | Svuota e ricarica in transazione (8.2, scheda 0028) |
| Invio | Notifica dopo l'email al cliente, attesa fino a circa 30 s | Le due email in parallelo, attesa fino a circa 15 s (10.2, scheda 0030) |
| "Riprova" | Attesa di 30 s, ramo per i `pending` vecchi, tre motivi | Nessuna attesa, nessun ramo `pending`, quattro motivi (10.3, P8) |
| Notifica fallita | Rimandata all'avvio | Registrata e non rimandata (10.3) |
| Calendario | Fase 2 di un giorno | Fase 2 di due giorni, fasi 3 e 4 accorciate; nessun margine, dichiarato (15.5) |
| Dettagli di codice | Nelle sezioni di architettura | Nell'appendice C |

**Dopo la produzione delle viste (2026-11-13, scheda 0031).** Le righe "Ora" delle tabelle precedenti sulle viste valgono solo dove questa tabella non le cambia.

| Punto | Prima | Ora |
|---|---|---|
| Prodotti di partenza | Aladdin, Yoku S e un terzo prodotto con la foto | Air, Air Corner, Aladdin e Cabanon, tutti al livello A; Yoku S messo da parte (2, 9.1, 15.5) |
| Problema | Combinazioni senza foto, mostrate da Yoku S | Viste coerenti con interno e pianta, scelte senza foto (pedana, boiserie), riepilogo (2) |
| Viste | Esterno, Frontale, Pianta, Materiali | Esterno, Interno (la vecchia Frontale), Pianta, Materiali; Interno 3D solo per Cabanon (9.1) |
| Formato delle viste | Solo `<path>` con `data-zone` e `data-shade`, colori calcolati da `componiVista` | File base con forme, ombre e pattern in prospettiva, e marcature di ciò che cambia; manifest per prodotto (15.2) |
| Legame con il catalogo | `zones`, `fixedZones`, colore e texture dei materiali, `materialiPerZona` | Codici uguali agli `id` del manifest; il manifest tiene texture e gradienti, il catalogo etichette e misure; codici anche con maiuscole (8.1, P1) |
| Texture | Foto del campione fusa in moltiplicazione | Texture ripetibili ricavate dalle foto dei campioni di effe.it, con uno script (9.1, P13) |
| Script delle viste | Nessuno nel repository | `scripts/viste/`: conversione, correzioni note, Interno 3D, materiali, texture, verifica; non generano le viste (9.1, appendice C) |
| Cartelle | `public/viste/<prodotto>/<taglio>/`, `public/texture/` | `public/viste/<prodotto>/` con il manifest, `public/viste/texture/`; oggi in `data/viste/`, da spostare nella fase 2 (15.1) |
| Pedana di Aladdin | Colora tutto il pavimento | Riquadro di 120 × 120 cm sotto la stufa (9.3) |
| PDF | Esterno e frontale; prova con fusioni e sfocatura | Esterno e Interno; prova con pattern JPG e gradienti; `flat` con il colore medio della foto (11, P12) |
| Livello B e regola delle 4 ore | Per i prodotti senza viste, Yoku S compreso | Ripiego per i prodotti futuri; oggi nessun prodotto al livello B (9.2) |
| Criterio 2 | Aladdin e Yoku S al livello A, Yoku S per le combinazioni senza foto | Almeno 3 prodotti al livello A tra i quattro di partenza; tolta la parte sulle combinazioni senza foto (16) |
| Prove | Formato a `<path>`, `materialiPerZona`, proporzioni | Formato a marcature, `controllaViste` sui codici, `componiVista` sulle marcature, `verifica.mjs` (18) |

### 23.2 Rispetto alla v5

La tabella è storica: i numeri di sezione sono quelli della v6, e alcune di quelle sezioni oggi trattano altro.

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
- *Pedana nel taglio 45.* Nessuna regola: la pedana è disponibile per entrambi i tagli; nelle viste è un riquadro di 120 × 120 cm sotto la stufa, in posizione stimata dalle foto (sezione 9.3).
- *Misure del 45 nelle viste.* Il DWG di Aladdin 45 misura 180 × 160 cm, il sito dice 180 × 140: le viste seguono il DWG, le misure mostrate quelle del sito.
- *Pedana obbligatoria.* Il sito la presenta come completamento ("può essere completata"). Per scelta dell'autore una finitura è sempre selezionata, con Moka predefinita (scheda 0027).
- *Cover della stufa e frame.* Il sito li dice in alluminio anodizzato; nelle viste sono a colore fisso, già nel file base.
- *Colori dei materiali.* Le texture vengono dalle foto dei campioni del sito (sezione 9.1); i valori esadecimali della bozza `aladdin.json`, presi dal mockup, escono dal file con `color`, `texture`, `zones` e `fixedZones` (scheda 0031).

### A.2 Dati di Yoku S

Fonte: [effe.it/prodotto/yoku-s](https://www.effe.it/prodotto/yoku-s/), consultata il 2026-11-12. Il 2026-11-13 Yoku S è stato messo da parte (scheda 0031): si inserisce solo se avanza tempo, con la procedura della sezione 9.1. I dati restano qui per quel caso; le parti su zone e `fixedZones` vanno lette con i codici del manifest al posto delle zone.

| Dato | Valore sul sito |
|---|---|
| Versioni | 12: misure 45, 60, 80 e 105, ciascuna nelle varianti Door, Glass e Shelf |
| Dimensioni | 45: 174 × 132 × 214 cm; 60: 174 × 170 × 214 cm; 80: 202 × 180 × 214 cm; 105: 230 × 200 × 214 cm (ordine da verificare come per Aladdin) |
| Materiali | Esterno a scelta: Legno termotrattato scuro o Noce canaletto; parete posteriore interna e arredi: Aspen termotrattato |
| Optional e pedana | Nessuno indicato |
| Immagini | Una foto per versione (12), nessuna per legno esterno |
| File tecnici | 60: DWG, FBX, SketchUp e altri; 45 e 105: "File 3D" e 2D; 80: solo 2D (Area Pro, contenuto non letto) |

**Ipotesi.** La pagina non dice se i due legni esterni valgono per tutte le versioni: dove il sito non indica limiti, si assume che ogni materiale valga per tutte le versioni (scelta dell'autore, 2026-11-12), e il file del prodotto lo annota in `_daVerificare`. Le varianti Door, Glass e Shelf cambiano la forma: entra quella del file disponibile, una sola per tutti i tagli, e il nome del prodotto la indica (ad esempio "Yoku S Door"); i tagli i cui file sono di un'altra variante restano fuori (sezione 9.2, punto 3). Il sito non indica il materiale delle pareti interne diverse da quella posteriore né del pavimento: le pareti interne visibili vanno nella zona `int` (Aspen, come la parete posteriore, da confrontare con le foto della galleria), il pavimento resta senza materiale e prende il colore neutro (sezione 9.3).

## 25. Appendice B: il mockup esistente

Il mockup è un file HTML/JS, generato a partire dai file forniti dall'autore e salvato in `docs/mockup/configuratore-saune-mockup.html` (P15). Si apre nel browser senza server.

- **Interfaccia:** una pagina con i passaggi Modello, Misure, Materiali, Optional, Riepilogo, l'anteprima con le viste, una barra in basso, una finestra di dialogo per l'invio e una per l'informativa. È il riferimento per l'interfaccia, tolto il passaggio Optional.
- **Viste:** Esterno, Interno, Pianta e un pannello Materiali. Per Aladdin 60 la seconda vista si chiama Frontale ed è la vista frontale pronta; per gli altri prodotti è l'interno schematico, scartato (P15).
- **Due modi di disegnare.** Per un solo prodotto e un solo taglio (Aladdin 60) le viste Esterno, Frontale e Pianta sono disegni SVG già pronti, incorporati nel file come dati e prodotti in chat dal modello 3D: il codice ne cambia solo colori e texture. Le zone sono `ext`, `roof`, `bench`, `floor`, `mirror`, `metal`, `stove`, `glass`, più un'ombra a terra sfumata; ogni zona è disegnata con sei livelli d'ombra e la foto del campione fusa in moltiplicazione, con la texture di tetto e panche ruotata di 90 gradi. Il pavimento occupa tutto l'interno. Pesano fino a 305 KB e usano classi, variabili CSS e `color-mix()`. Per ogni altro prodotto e taglio il mockup usa un disegno schematico calcolato da pochi parametri, molto più povero. La v6 descriveva il secondo modo come se avesse prodotto le viste del primo.
- **Materiali:** per le viste pronte, piccole foto dei campioni incorporate nel file; per il disegno schematico, colori approssimati e venature generate dal codice (`feTurbulence`).
- **Dati inventati da non riportare nel catalogo:** gli optional (cromoterapia, audio, mensole, pedana aggiuntiva), la regola che disattiva un optional per un taglio e il valore "Nessuna pedana".
- **Oggi.** Le viste del mockup non si usano più: tutte le viste, comprese quelle di Aladdin 60, vengono dai pacchetti prodotti in chat il 2026-11-13 (sezione 9.1, scheda 0031).
- **Da non riprendere:** l'elenco è in P15 (sezione 20.3). In più, la nota "nel prototipo reale qui compaiono render o un modello 3D" contrasta con l'esclusione del 3D (sezione 21).

## 26. Appendice C: note di implementazione

Il corpo del documento fissa comportamenti e garanzie; qui c'è il modo di ottenerli, in una sola copia. Nella fase 2 questa appendice diventa `docs/architettura.md` e da lì si aggiorna insieme al codice.

- **Scadenza degli invii (sezione 10.2).** I tre timeout di Nodemailer (`connectionTimeout`, `greetingTimeout`, `socketTimeout`) si impostano a 10 000 ms, perché quelli predefiniti sono di minuti. `socketTimeout` misura solo l'inattività e non limita la durata totale, quindi ogni invio ha anche una scadenza complessiva di 15 secondi con `Promise.race`, perché `sendMail` non accetta un `AbortSignal`. Alla scadenza si chiama `transporter.close()`. La promessa che perde `Promise.race` ha un `.catch` vuoto, e il suo esito non aggiorna la riga.
- **Due invii in parallelo (sezione 10.2, scheda 0030).** `Promise.allSettled` sui due invii; ogni invio crea il proprio transporter, così il `close()` alla scadenza di uno non interrompe l'altro.
- **"Riprova" atomico (sezione 10.3).** Una sola istruzione: `UPDATE configuration SET customer_status = 'pending', customer_attempts = customer_attempts + 1, customer_last_attempt_at = now() WHERE token = $1 AND expires_at > now() AND customer_status = 'failed' AND customer_attempts < 3 RETURNING id`. Si invia solo se restituisce una riga. Se non la restituisce, il server rilegge la riga, ignorando quelle scadute, per il motivo: nessuna riga → `inesistente`; `sent` → `inviata`; `pending` → `in-corso`; `failed` con 3 tentativi → `esauriti`.
- **Richiesta doppia (sezione 10.2).** `INSERT … ON CONFLICT (request_id) DO NOTHING`, poi il server legge la riga esistente.
- **Avvio (sezione 7).** `UPDATE configuration SET customer_status = 'failed' WHERE customer_status = 'pending'`, e lo stesso per `project_status`.
- **Seed (sezione 8.2, scheda 0028).** `TRUNCATE product, product_size, option_group, option_value, material` nella transazione, poi gli inserimenti.
- **Variabili SMTP (sezione 7).** Con `SMTP_USER` vuoto il codice omette `auth`; `SMTP_SECURE` si converte da stringa a booleano.
- **Migrazioni applicate (sezione 15.3).** `npm run check` confronta il numero di righe di `drizzle.__drizzle_migrations` con il numero di voci di `drizzle/meta/_journal.json`.
- **Runtime (P8).** PDFKit e resvg non girano nel runtime Edge. `nodejs` è già il predefinito: nessun file esporta `runtime`, e un file `'use server'` non potrebbe farlo, perché può esportare solo funzioni async.
- **Font sul server (P14).** Il percorso è `path.join(process.cwd(), 'src/fonts', nome)`.
- **Pagine dinamiche (sezione 10.1).** `/` legge `searchParams`, quindi Next.js la genera a ogni richiesta. `/galleria` non li legge e `next build` la genererebbe una volta sola, con il catalogo e `ENABLE_GALLERY` del momento della build: il file esporta `export const dynamic = 'force-dynamic'` e risponde `notFound()` se la galleria non è attiva (P6).
- **Viste di un altro prodotto (sezione 9.3).** Il browser legge prima `fetch('/viste/<prodotto>/manifest.json')`, poi i file elencati in `files` (`/viste/<prodotto>/<cartella>/<vista>.svg`); il server li legge da disco con `path.join(process.cwd(), 'public/viste', …)`. Le texture si chiamano con `href = (t) => '/viste/texture/' + fileTexture(t)` nel browser e con un data URI (`tipoTexture` dà il tipo MIME) nel server.
- **Mailpit già avviato (sezione 18).** Il `globalSetup` di Vitest avvia Mailpit solo se la porta 1025 non risponde già, e chiude solo il processo che ha avviato; in Playwright il `webServer` di Mailpit ha `reuseExistingServer: true`. Così le prove girano anche con il Mailpit dello sviluppo acceso.
- **Alias nelle prove (sezione 18).** `vitest.config.ts` dichiara in `resolve.alias` lo stesso alias `@` → `src` di `tsconfig.json`, che Vitest non legge da solo.
- **Script delle viste (sezione 9.1).** Per rifare tutto dai pacchetti, in quest'ordine: `node scripts/viste/converti-pacchetti.mjs <pacchetti> public/viste`, `node scripts/viste/correggi-viste.mjs`, `node scripts/viste/vista-interna-cabanon.mjs`, `node scripts/viste/materiali.mjs`; poi si tolgono le texture PNG che `converti-pacchetti` riscrive. Le texture si rifanno solo se cambiano le foto, con `powershell -ExecutionPolicy Bypass -File scripts/viste/texture-dalle-foto.ps1` (Windows). Le correzioni sono idempotenti: ognuna lascia una marcatura (`data-colori`, `data-pavimento`) o controlla che il cambiamento manchi. `vista-interna-cabanon.mjs` toglie poligoni per indice e controlla i riempimenti attesi: se cambia una correzione che aggiunge o toglie poligoni, gli indici vanno ricontati. Infine `node scripts/viste/verifica.mjs <pacchetti> public/viste`.
- **`flat` (sezione 11).** Non c'è ancora in `componi.mjs`: si aggiunge portando la funzione in TypeScript, sostituendo ogni `<image>` dei pattern con un `<rect>` del colore medio di `medie.json`.
