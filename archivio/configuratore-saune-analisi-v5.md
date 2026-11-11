# Configuratore di saune: analisi e scelte tecniche

## 1. Obiettivo e decisioni prese

Un configuratore web, in **Next.js + React**, per le saune del catalogo effe.it. Il cliente sceglie modello, taglio, materiali e optional, vede un'anteprima che cambia in tempo reale e, se vuole, riceve per email il **riepilogo della configurazione in PDF**. La configurazione viene salvata nel database e una notifica arriva all'email del progetto.

**Altre decisioni** (ognuna ha la sua scheda in `docs/decisioni/`)

| Tema | Decisione |
|---|---|
| ORM | Drizzle, non SQL puro e non Prisma |
| Salvataggio | Un solo pulsante: salva nel database, invia il PDF al cliente, notifica il progetto |
| Ricontatto | Nessun ricontatto dei clienti, nessun consenso commerciale |
| Privacy | Presa visione dell'informativa; conservazione 12 mesi; cancellazione su richiesta e automatica |
| Cookie | Nessun cookie e nessun servizio esterno |
| Accessibilità | WCAG 2.1 livello AA, usabile da tastiera, testo alternativo alle immagini; il PDF per ora non deve essere accessibile |
| Grafica | Viste SVG da parametri con texture del catalogo; per i modelli senza vista, le immagini ufficiali del sito |
| Lingua | Solo italiano |
| Migrabilità | Regole di progetto per passare in futuro a un database online (sezione 9) |

---

## 2. Cosa deve gestire il database

1. **Opzioni eterogenee.** Ogni modello ha tagli, materiali e accessori diversi. Un modello a colonne fisse non regge.
2. **Dati strutturati e legati tra loro.** Modello → tagli → gruppi di opzioni → valori → materiali, con regole di compatibilità tra scelte.
3. **Configurazioni salvate che non cambiano nel tempo.** Una configurazione salvata deve restare identica anche se il catalogo viene modificato.
4. **Conservazione limitata.** Email e configurazione si conservano per 12 mesi e devono poter essere cancellate su richiesta.
5. **Migrabilità.** Lo stesso schema deve poter passare da un container Docker a un database online cambiando solo la connessione.

---

## 3. Scelta del DBMS

### 3.1 Cos'è un DBMS relazionale

Un **DBMS** (Database Management System) è il programma che memorizza i dati e permette di leggerli e modificarli in modo sicuro. In uno **relazionale** i dati stanno in tabelle di righe e colonne, collegate tra loro da relazioni, e si interrogano con **SQL**. Un taglio, ad esempio, contiene il codice del prodotto a cui appartiene (*chiave esterna*), e il collegamento è garantito dal database, non dal codice.

Le garanzie principali sono quattro:
- **Schema con tipi.** Ogni colonna ha un tipo e il database rifiuta valori sbagliati.
- **Integrità.** Chiavi esterne e vincoli (`UNIQUE`, `NOT NULL`, `CHECK`) impediscono dati incoerenti.
- **Transazioni.** Un gruppo di operazioni riesce tutto insieme o non riesce affatto.
- **Join.** Più tabelle si combinano in una sola query.

### 3.2 Decisione

**PostgreSQL**, in un container **Docker**, con **Drizzle** come ORM.

### 3.3 Criteri di valutazione

| Criterio | Perché conta qui |
|---|---|
| Adatto a dati relazionali con regole | Modelli, tagli, opzioni e regole sono entità legate |
| Dati variabili per modello | Le opzioni cambiano da sauna a sauna |
| Esecuzione in Docker | Requisito del tutor |
| Migrazione verso un servizio online | Il progetto potrebbe essere pubblicato in futuro |
| Lavoro in due, migrazioni | Schema condiviso, versionato, riproducibile |
| Costo e gestione | Gratuito, poco da configurare |

### 3.4 Confronto

| Criterio | PostgreSQL | MySQL | SQLite | MongoDB |
|---|---|---|---|---|
| Dati relazionali e vincoli | Ottimo | Ottimo | Buono | Debole (nessuna integrità tra collezioni) |
| Dati variabili per modello | Ottimo (JSONB indicizzabile) | Buono (tipo JSON) | Discreto | Ottimo |
| Esecuzione in Docker | Immagine ufficiale | Immagine ufficiale | Non serve: è un file | Immagine ufficiale |
| Migrazione verso un servizio online | Ottimo (standard, offerto da molti fornitori) | Buono | Debole (file su disco) | Buono |
| Lavoro in due, migrazioni | Ottimo (Drizzle Kit) | Ottimo | Discreto (file locale) | Debole (migrazioni dichiarative poco supportate) |
| Giudizio | **Scelto** | Alternativa valida | Solo per sviluppo locale | Sconsigliato |

### 3.5 Motivazioni della scelta

1. **Il dominio è relazionale.** Il catalogo è un grafo di relazioni: un valore appartiene a un gruppo, un gruppo a un modello, una regola collega due valori. PostgreSQL le fa rispettare con chiavi esterne, vincoli di unicità e `CHECK`: non si può salvare un'opzione per un modello inesistente né due tagli con lo stesso codice.
2. **Le opzioni eterogenee non richiedono di uscire dal modello relazionale.** Gruppi e valori di opzione sono tabelle generiche, uguali per tutti i modelli. Gli attributi davvero particolari di un singolo modello (ad esempio la posizione della stufa o i parametri delle viste) stanno in una colonna **JSONB**, che PostgreSQL può indicizzare e interrogare. Si ottiene la flessibilità di un database a documenti mantenendo l'integrità.
3. **La configurazione salvata è uno snapshot.** Alla richiesta si salva in una colonna JSONB l'elenco delle scelte con le loro etichette. Un cambio successivo del catalogo non altera le configurazioni già salvate. Salvataggio e registrazione dello stato dell'invio avvengono in **una transazione**.
4. **Non c'è dipendenza da un fornitore.** PostgreSQL è uno standard. Passare da Docker a un servizio online è un cambio di stringa di connessione, senza toccare schema né codice.
5. **È adatto al lavoro in due.** Schema, migrazioni e dati iniziali sono file nel repository: chi clona o aggiorna il progetto ricostruisce lo stesso database.

### 3.6 Perché non le alternative

- **MySQL.** Il modello relazionale andrebbe benissimo e la scelta sarebbe difendibile. Non ci sono però vantaggi rispetto a PostgreSQL: meno vantaggio sui dati JSON, e un ecosistema di servizi online meno ampio per la migrazione futura.
- **SQLite.** Ottimo per provare in locale, ma è un file su disco: due sviluppatori non possono condividerlo e la migrazione verso un servizio online non è lineare.
- **MongoDB.** È tentante per le opzioni variabili, ma il catalogo ha molte relazioni e regole che in MongoDB andrebbero controllate dal codice, non dal database. Le migrazioni dichiarative sono poco supportate e la flessibilità che offre si ottiene già con JSONB.

### 3.7 Perché Drizzle e non SQL puro

Un ORM non è obbligatorio se conosciamo SQL. Con l'SQL puro (`postgres.js` o `pg`) il progetto sarebbe fattibile. Il rischio concreto, però, non sono le query: sono **migrazioni** e **tipi**.

- **Migrazioni.** Una migrazione è un file che descrive una modifica alla struttura del database, da applicare in ordine. In due, con due database separati, servono per tenere gli schemi uguali. Lo schema è scritto in TypeScript e Drizzle Kit genera i file di migrazione, versionati in Git; l'altro sviluppatore li applica con un comando. Con SQL puro servirebbero file numerati a mano e uno script che li applichi in ordine, con il rischio di conflitti quando in due si modifica lo schema.
- **Tipi.** I tipi TypeScript derivano dallo schema: un errore su un nome di colonna si vede mentre si scrive. Con SQL puro andrebbero scritti e mantenuti a mano, e gli errori emergerebbero solo a runtime.
- **Resta vicino all'SQL.** Le query somigliano all'SQL e, quando serve, si scrive SQL direttamente dentro lo stesso codice.
- **Leggero.** Pesa poco ed è adatto anche a un'esecuzione in container.

**Alternativa valutata: Prisma.** Più guidato, ma nasconde di più l'SQL. Dato che SQL lo conosciamo, il vantaggio non compensa.

La scelta non è vincolante: schema e query restano SQL e si può cambiare strada con poco lavoro.

### 3.8 Docker e lavoro in due

**Come si usa**
- Un file `docker-compose.yml` nel repository descrive il database (immagine ufficiale di PostgreSQL). Un comando lo avvia.
- **Durante lo sviluppo** il database gira in Docker e l'applicazione direttamente sul computer (`npm run dev`), perché l'applicazione dentro Docker su Windows è più lenta nei ricaricamenti.
- **Per la demo**, anche su un terzo computer, un solo comando avvia database, migrazioni, dati iniziali e applicazione.
- Ogni sviluppatore ha **il proprio database locale**: stessi schema e stessi dati iniziali (migrazioni e seed nel repository), ma non le stesse configurazioni salvate.
- Le credenziali (Gmail, connessione) stanno in un file `.env` mai caricato su GitHub; nel repository c'è `.env.example`. Su un altro computer il file si copia a mano.
- Le modifiche allo schema passano da pull request, con una sola persona alla volta che crea migrazioni.

**Immagini.** Non vanno nel database: stanno nella cartella `public/` del repository, in formato ottimizzato.

---

## 4. Modello dati (sintesi)

| Tabella | Contenuto |
|---|---|
| `product` | nome, collezione, descrizione, tipo di visualizzatore (`svg` o `image`), `geometry` JSONB (parametri per le viste, se presenti) |
| `product_size` | codice, etichetta, larghezza × profondità × altezza, `attributes` JSONB |
| `material` | codice, nome, tipo (legno, alluminio, gres, specchio), colore, texture |
| `option_group` | prodotto, tipo (`single` o `multi`), passo, zone interessate |
| `option_value` | gruppo, etichetta, materiale collegato, `attributes` JSONB |
| `option_rule` | tipo (`requires`, `excludes`, `only_with_size`), origine, destinazione, messaggio |
| `configuration` | numero, data di creazione, data di scadenza (12 mesi), email, data e versione dell'informativa letta, prodotto, `config` JSONB, stato dell'invio al cliente, stato della notifica al progetto |

Non ci sono tabelle per prezzi, promozioni o IVA.

**Dati del catalogo nel repository.** Ogni prodotto è un file in `data/prodotti/` (taglio, opzioni, regole, parametri delle viste). Lo script di seed li carica nel database: il lavoro di inserimento si divide per file, senza conflitti.

Esempio di `config`:

```json
{
  "product": "aladdin", "size": "60",
  "selections": { "wood": "rovere", "floor": "moka", "extras": [] },
  "lines": [
    { "group": "Taglio", "label": "Aladdin 60 (200 × 160 × 210 cm)" },
    { "group": "Essenza", "label": "Rovere rigatino" },
    { "group": "Pedana in gres", "label": "Gres Moka" }
  ]
}
```

---

## 5. Applicazione e flusso

**Architettura.** Pagine del catalogo renderizzate sul server dal database; configuratore come componente client con stato nell'URL (link condivisibile). Le scelte sono sempre validate sul server (Zod) contro le regole di compatibilità.

**Flusso dell'invio.** Un solo pulsante, "Ricevi il riepilogo":

1. il cliente inserisce l'email, la conferma scrivendola due volte e dichiara di aver letto l'informativa;
2. il server valida email e configurazione;
3. salva la configurazione nel database;
4. genera il PDF e lo invia come allegato al cliente (Nodemailer con un Gmail dedicato al progetto, invio reale);
5. invia una notifica all'email del progetto;
6. mostra la conferma a schermo.

**Se l'invio fallisce.** La configurazione resta salvata con lo stato "non inviata", il cliente vede un messaggio chiaro e può riprovare. Il fallimento della notifica al progetto non è visibile al cliente: viene solo registrato in un log.

**Contenuto del PDF.** L'immagine del modello con tutte le scelte e l'elenco di modello, taglio, materiali e optional, con lo stesso contenuto della schermata di riepilogo. Lo stesso elenco compare anche nel corpo dell'email, così il contenuto è leggibile anche se il PDF non è accessibile.

**Verifica prevista.** Mettere un'immagine SVG con texture dentro un PDF richiede di trasformarla prima in PNG. La conversione si fa **sul server** con `@resvg/resvg-js`, partendo dalla configurazione già validata: la stessa funzione che disegna l'anteprima nel browser produce la stringa SVG, le texture vengono incorporate come data URI e i font si caricano in modo esplicito. Così il PDF si può rigenerare in ogni momento (nuovo tentativo di invio, "Scarica il PDF", controllo prima della demo) senza chiedere l'immagine al browser. La prova si fa come primo passo; se un effetto non regge, nel PDF compare la versione semplificata con i colori pieni dei materiali.

**Verifica dell'email.** L'email scritta due volte intercetta gli errori di battitura, ma non un indirizzo valido di un'altra persona. Un link di conferma sarebbe la soluzione completa; per la demo, usata solo dagli sviluppatori, è rimandato a una futura pubblicazione.

---

## 6. Privacy

- **Titolare del trattamento:** persona fisica, nell'ambito di un progetto di tirocinio. Contatto: email del progetto (da creare).
- **Dati:** email e configurazione scelta.
- **Finalità:** inviare il riepilogo richiesto e conservare la richiesta per la dimostrazione e la verifica del funzionamento del progetto di tirocinio. I dati non sono usati per altri scopi né per ricontattare il cliente.
- **Base giuridica:** da definire con il tutor.
- **Consenso:** non c'è un consenso commerciale; il cliente dichiara di aver letto l'informativa.
- **Conservazione:** 12 mesi, poi cancellazione automatica (un comando eseguito all'avvio e a intervalli).
- **Cancellazione su richiesta:** il cliente scrive all'email del progetto; uno script cancella dal database i dati di quell'indirizzo. Anche le email già inviate, nella casella del progetto, seguono il limite dei 12 mesi.
- **Destinatari:** i dati non sono diffusi; l'invio passa da Gmail, che va dichiarato nell'informativa.
- **Cookie:** nessuno; nessun analytics, nessun font o libreria caricati da servizi esterni.

L'informativa e la base giuridica sono una bozza da far verificare al tutor (e a un eventuale referente privacy) prima di qualsiasi uso.

---

## 7. Accessibilità

Obiettivo: **WCAG 2.1 livello AA**.

- Tutto il configuratore è usabile **da tastiera**, con focus sempre visibile e ordine logico.
- Le immagini hanno un **testo alternativo** che descrive la configurazione scelta e si aggiorna a ogni cambio.
- Gli errori dei moduli sono scritti in testo, collegati al campo, e il focus va al primo campo sbagliato; il campo di conferma dell'email permette di incollare.
- Contrasti, etichette dei campi e lingua della pagina (`it`) sono verificati.
- Si usa shadcn/ui (basato su Radix), che dà una buona base ma non garantisce il livello AA: **a ogni passo di sviluppo** si controlla a mano con la tastiera e con un controllo automatico (axe), e si corregge.
- Il PDF per ora non deve essere accessibile.

---

## 8. Grafica

**Obiettivo:** immagini grafiche vere, non 3D in tempo reale (pesante e di qualità inferiore ai configuratori online). Il 3D resta un extra finale, se avanza tempo.

**Scelta: viste SVG generate da parametri, con texture reali.** Ogni sauna è descritta da pochi numeri (dimensioni, sequenza del fronte, panche, stufa). Un unico generatore, uguale per tutti i modelli, li trasforma in tre viste: **esterna, frontale e pianta**. La vista interna è scartata perché difficile da replicare.

- **Soluzione unica.** Non dipende dai file 3D dei singoli modelli, che non abbiamo per tutti: basta inserire i parametri del modello.
- **Texture del catalogo** (legni, specchio, gres) applicate come pattern sopra le sfumature calcolate. Cambiare materiale significa cambiare un file immagine.
- **Leggero.** Ogni vista pesa da pochi KB a circa 200 KB e si genera una sola volta, non a ogni richiesta; i file stanno in `public/`.

**Stato.** Provata su Aladdin 60 con i legni Rovere e Wengé e i gres, ed è nel mockup.

**Ripiego.** Per i prodotti senza viste SVG si usano le immagini ufficiali del sito per ogni versione. Man mano che si aggiunge un prodotto si cerca di preparare anche le sue viste SVG.

**Uso delle immagini.** Il tutor ha autorizzato l'uso di ciò che è visibile sul sito. I file 3D e 2D dell'Area Pro (DWG, FBX, SKP) restano solo sul computer locale e non entrano nel repository.

---

## 9. Migrabilità

Regole di progetto per passare in futuro a un database online e, se serve, pubblicare l'applicazione.

1. Il database si raggiunge solo tramite la variabile `DATABASE_URL`: il codice non sa se è Docker o un servizio online.
2. Nessuna estensione né funzione specifica di Docker o di un fornitore.
3. Schema e dati iniziali solo tramite migrazioni e seed nel repository.
4. Nessun dato scritto su file locali: i PDF si generano in memoria, le immagini stanno nel repository.
5. Configurazioni (database, Gmail) solo in `.env`.

---

## 10. Fuori dal progetto

- **Prezzi, sconti, IVA e preventivi.** Esclusi per indicazione del tutor. Il documento si chiama "riepilogo".
- **Funzioni di intelligenza artificiale.** Escluse per ora; le regole di migrabilità lasciano aperta la possibilità di aggiungerle.
- **Ricontatto dei clienti** e consenso commerciale.
- **PDF accessibile**, verifica via link dell'email, protezioni anti-spam.
- **Più lingue.** Solo italiano.
- **3D in tempo reale**, salvo avanzo di tempo.

---

## 11. Organizzazione del lavoro

| | A: Nicolas, dati e server | B: Marko, interfaccia |
|---|---|---|
| Cartelle | `docker-compose.yml`, `Dockerfile`, `drizzle/`, `src/db/`, `src/server/`, `scripts/` | `src/app/`, `src/components/`, `src/lib/viste/`, `public/`, stili |
| Responsabilità | database, invio email, PDF, conservazione dei dati | configuratore, accessibilità, anteprime |

**Contratto condiviso.** I tipi del catalogo e della configurazione stanno in `src/contratti/` e cambiano solo con una pull request discussa tra i due. Finché il database non è pronto, B lavora con un catalogo finto che rispetta lo stesso contratto.

**Per evitare conflitti**
- I prodotti sono file separati in `data/prodotti/`, divisi tra i due.
- `package.json` e il lockfile: una persona alla volta aggiunge dipendenze, avvisando l'altra.
- Il registro delle decisioni è **un file per decisione**, non un unico file.
- Un file `.gitattributes` evita differenze dovute ai fine riga di Windows.

**Fasi del lavoro**

| Fase | Obiettivo |
|---|---|
| 1. Basi | Progetto, Docker, schema e seed con Aladdin; configuratore con catalogo finto; contratto definito |
| 2. Flusso completo | Salvataggio, email, PDF, pulizia a 12 mesi; modulo email, informativa, accessibilità: **versione funzionante dall'inizio alla fine** |
| 3. Catalogo | Inserimento degli altri prodotti (metà ciascuno); al termine, **blocco delle funzioni** |
| 4. Rifinitura | Prove, correzioni, controllo WCAG, documentazione finale, consegna |

La priorità è avere presto qualcosa di funzionante con pochi modelli; gli altri si aggiungono se c'è tempo, e quelli non inseriti si elencano nella documentazione come lavoro futuro.

**Prove.** Poche prove automatiche sulle regole di compatibilità e sulla validazione della configurazione, un controllo automatico di accessibilità (axe) e il controllo manuale con la tastiera a ogni passo.

---

## 12. Documentazione

La documentazione fa parte della valutazione: deve essere completa e aggiornata. Sta nella cartella `docs/` del repository, in Markdown. **Ogni pull request che cambia il comportamento del codice aggiorna anche la documentazione**, e ogni cambio di scelta si registra.

| File o cartella | Contenuto |
|---|---|
| `README.md` | Avvio e installazione, con i comandi Docker |
| `docs/architettura.md` | Struttura del progetto e del flusso |
| `docs/modello-dati.md` | Tabelle, relazioni, diagramma |
| `docs/decisioni/` | Una scheda per ogni scelta, con motivi e alternative; quando una scelta cambia, si aggiunge una nuova scheda che sostituisce la precedente |
| `docs/privacy-e-accessibilita.md` | Informativa, conservazione, controlli WCAG eseguiti |
| `docs/manuale-uso.md` | Come si usa il configuratore |
| `docs/prove.md` | Prove eseguite e risultati |

---

## 13. Rischi e punti aperti

- **Base giuridica e informativa:** da definire e far verificare dal tutor.
- **Email del progetto:** da creare; finché manca, il codice usa una variabile e l'informativa un segnaposto.
- **Foto nel PDF:** da verificare subito (sezione 5).
- **Tempo:** limitato, per due sviluppatori; dopo l'inserimento del catalogo c'è un blocco delle funzioni.
- **Docker:** nessuna esperienza pregressa; il repository fornirà i file pronti.
- **Limiti di Gmail:** adatti a pochi invii al giorno, quanti ne servono per una demo.
- **Contenuti del sito:** uso autorizzato dal tutor; i file dell'Area Pro non entrano nel repository.
