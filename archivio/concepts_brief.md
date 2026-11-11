# Configuratore di saune per il catalogo effe.it
* **Author:** Nicolas Montanari

## Overview

Configuratore web (Next.js + React, PostgreSQL in Docker, Drizzle) per le saune del catalogo effe.it.

Il cliente sceglie modello, taglio, materiali e optional e vede un'anteprima SVG generata da parametri, con le texture del catalogo. Con il pulsante "Ricevi il riepilogo" la configurazione viene salvata nel database e il cliente riceve per email il PDF del riepilogo (Nodemailer + Gmail dedicato). Anche l'email del progetto riceve una notifica.

Contesto fornito dall'autore, che i documenti non riportano:
- non c'è una pubblicazione e il progetto resta una demo che l'azienda non userà;
- non c'è voto: contano il funzionamento e la motivazione delle scelte, e all'autore importa molto la qualità grafica;
- l'invio reale del PDF per email è un requisito e non si può togliere;
- il numero di prodotti da inserire è "il più possibile" e la dimensione del catalogo non è nota;
- il generatore SVG è stato provato solo su Aladdin 60;

Materiale esaminato:
- `configuratore-saune-analisi-v5.md`;
- `docs-iniziali/docs/decisioni/` (README, `_modello.md`, schede 0001–0013);
- `docs-iniziali/docs/README.md`.

Stato dei revisori (modalità BRAINSTORM):

| Revisore | Stato |
|---|---|
| `egm-design` | completato |
| `egm-codebase-details` | completato |
| `egm-zoom-out` | completato |
| `egm-comprehension` | completato |
| `egm-implementation-readiness` | completato |
| `egm-structural` | completato |
| `egm-inventive-catalyst` | completato |

Giudizio complessivo. Le scelte di architettura sono adeguate alla dimensione del progetto e motivate bene: PostgreSQL con JSONB, Drizzle, snapshot della configurazione, nessun prezzo, nessuna IA, un solo pulsante. Il rischio non è lo strumento scelto, ma tre cose:
1. Le parti mai provate (Gmail, SVG nel PDF, generatore su altri modelli, Docker) sono tutte concentrate nella stessa fase del lavoro, senza margine.
2. L'unico requisito che non si può togliere, l'email reale, dipende da un solo canale e non ha un ripiego.
3. Manca la definizione di "fatto".

## Analysis

### 1. Punti deboli e rischi (in ordine di gravità)

**🔴 R1. Nessun criterio di successo e nessun copione della demo.**
- *Revisori:* tutti e sette.
- *Dove:* §11 ("pochi modelli", "se c'è tempo"), §13; nessuna scheda.
- *Problema:* alla consegna non si può distinguere un successo da una consegna parziale. Il blocco delle funzioni non ha un significato di "va / non va".
- *Proposta:* il criterio minimo concreto è nella sezione "Key Decisions". Va accompagnato da un file `docs/demo.md` con:
  - il percorso della demo;
  - la lista di controlli da fare la mattina;
  - i ripieghi.

**🔴 R2. Le parti incerte vengono provate troppo tardi e il calendario non ha margine.**
- *Revisori:* zoom-out, design, codebase-details, implementation-readiness, inventive-catalyst.
- *Dove:* §11 Calendario, §5 "Verifica prevista" ("la prova si fa all'inizio", senza una data), §13.
- *Problema:* nella stessa fase ci sono salvataggio, invio Gmail, PDF, conversione SVG→PNG con texture, pulizia a 12 mesi, modulo, informativa e accessibilità. Nessuna di queste parti è stata provata. Il giorno della demo non è un giorno di lavoro. Mancano una prova generale e un margine per la rifinitura grafica, che per l'autore è la priorità.
- *Proposta:*
  - fare per prime le prove di Gmail e del PDF;
  - avere presto uno scheletro completo dall'inizio alla fine (con Aladdin fisso nel codice);
  - fissare una prova generale.
  - L'ordine delle fasi rivisto è in "Key Decisions".

**🔴 R3. Un solo generatore per tutti i modelli è un'ipotesi, non un fatto.**
- *Revisori:* tutti tranne structural, che lo segnala come debito tecnico.
- *Dove:* §8 ("Un unico generatore, uguale per tutti i modelli… basta inserire i parametri"), scheda 0010 ("replicabile per ogni sauna").
- *Problema:*
  - la prova è stata fatta su un solo modello;
  - le disposizioni interne cambiano molto: panche lineari, a L o a gradoni, posizione e tipo della stufa, sequenza del fronte con vetro, legno e porta;
  - la pianta disegna proprio l'interno;
  - le 1–2 ore di Aladdin comprendono la scrittura del generatore, quindi il costo per ogni modello in più non è noto.
  - Se un nuovo layout richiede codice, la fase di inserimento dei prodotti diventa sviluppo, e va contro il blocco delle funzioni.
- *Proposta:* vedi C1 più sotto:
  - censire il catalogo per famiglie di layout;
  - descrivere la geometria come un elenco di parti;
  - provare un secondo modello nella prima fase;
  - fissare un limite di tempo per decidere tra SVG e foto.
  - Riformulare 0010 come "replicabile per le famiglie di layout supportate".

**🔴 R4. Il PDF con l'immagine è obbligatorio, ma strumento e prova non ci sono.**
- *Revisori:* design, codebase-details, implementation-readiness, structural, inventive-catalyst.
- *Dove:* §5 "Verifica prevista" e "Contenuto del PDF", §13 "Foto nel PDF"; nessuna scheda sulla libreria PDF.
- *Problema:* non sono indicati né la libreria PDF né lo strumento di conversione. I limiti concreti, da verificare nella prova:
  - i convertitori lato server (resvg, librsvg tramite sharp) si comportano diversamente dal browser su `<pattern>`, `<image href>`, fusioni e filtri;
  - i percorsi relativi delle texture (`/texture/rovere.jpg`) sul server non si risolvono se non si trasformano in percorsi di file o in data URI;
  - in un ambiente senza font il testo delle quote scompare;
  - `@react-pdf/renderer` supporta solo una parte di SVG;
  - più viste nella stessa pagina con lo stesso `id` di pattern si sovrappongono.
  - Il ripiego "versione semplificata" non è definito.
- *Proposta:* prova di mezza giornata, come primo passo, su Aladdin 60 (Wengé, gres, specchio), confrontata a vista con il browser. Il ripiego si decide subito (vedi C2) e il risultato va nella scheda 0014.

**🔴 R5. L'email reale non ha un ripiego per la demo.**
- *Revisori:* tutti.
- *Dove:* §5 Flusso dell'invio, §13 "Limiti di Gmail", 0006.
- *Problema:* l'unico rischio che i documenti citano è il volume degli invii, cioè il meno probabile. I guasti realistici sono questi:
  1. La rete dell'università o della sede blocca SMTP in uscita (porte 465/587).
  2. Google blocca o chiede la verifica telefonica a un account appena creato, o a un accesso da una rete nuova.
  3. La password per le app richiede la verifica in due passaggi e va controllata subito.
  4. La casella istituzionale del professore mette in spam un PDF arrivato da un Gmail nuovo.
  5. Con i timeout predefiniti di Nodemailer (minuti) il pulsante resta bloccato davanti al professore.
  - L'account Gmail non esiste ancora.
- *Proposta:* vedi C3 e il piano dei ripieghi in "Key Decisions".

**🟡 R6. "Anteprima in tempo reale" e "file generati una sola volta in `public/`" sono due architetture diverse.**
- *Revisori:* tutti.
- *Dove:* §1, §5 Architettura, §8 "Leggero".
- *Problema:*
  - generare in anticipo un file per ogni combinazione di modello, taglio, legno, pedana e optional per 3 viste porta a un numero di file che esplode;
  - `next start` serve solo i file presenti in `public/` al momento della build, e scrivere file a runtime va contro la regola 4 della §9;
  - il dato "da pochi KB a circa 200 KB" non dice se le texture sono incorporate o richiamate.
- *Proposta:* vedi C4.

**🟡 R7. "In una transazione" non è corretto per l'invio, e il "riprova" crea doppioni.**
- *Revisori:* zoom-out, design, codebase-details, implementation-readiness, structural, inventive-catalyst.
- *Dove:* §3.5 punto 3 ("Salvataggio e registrazione dello stato dell'invio avvengono in una transazione") contro §5 ("resta salvata con lo stato non inviata"), 0006.
- *Problema:*
  - un invio SMTP non può stare dentro una transazione del database;
  - se si conferma la transazione solo dopo l'invio, quando l'invio fallisce la riga si perde;
  - non è detto se riprovare inserisce una riga nuova o rimanda quella esistente, e un doppio clic produce due email.
  - È una domanda probabile del valutatore.
- *Proposta:* vedi C5.

**🟡 R8. Il Dockerfile dell'applicazione e "un solo comando su un terzo computer" servono a poco.**
- *Revisori:* zoom-out, design, codebase-details, implementation-readiness, inventive-catalyst.
- *Dove:* §3.8 "Per la demo, anche su un terzo computer…", §11 (cartella `Dockerfile`), §13 "Docker".
- *Problema:* la demo gira sul computer degli sviluppatori. Mettere Next.js in un container costa molto a chi non conosce Docker:
  - build standalone;
  - variabili d'ambiente;
  - `drizzle-kit` è una devDependency, quindi non è nell'immagine di produzione;
  - attesa del database con healthcheck;
  - moduli nativi per la conversione SVG e i font.
  - A questo si aggiungono i prerequisiti di Windows: WSL2, virtualizzazione, porta 5432 in conflitto con un Postgres locale, `down -v` che cancella il volume, immagine da fissare a una versione maggiore.
- *Proposta:* vedi C6.

**🟡 R9. Contratto condiviso, formato dei dati e regole esistono solo come nomi.**
- *Revisori:* implementation-readiness, structural, design, zoom-out, comprehension.
- *Dove:* §4, §11 "Contratto condiviso".
- *Problema:*
  - colonne, tipi, chiavi e vincoli non sono definiti;
  - `passo` e `zone interessate` non sono spiegati;
  - `geometry` non ha uno schema;
  - il formato dei file in `data/prodotti/` non è deciso;
  - di `requires`/`excludes`/`only_with_size` non sono definiti direzione ed effetto nell'interfaccia (disattivare, nascondere o segnalare);
  - non è detto cosa succede alle scelte quando cambia il taglio;
  - le regole si controllano sia nel client sia nel server senza una sola implementazione.
  - Marko inizia con un "catalogo finto che rispetta lo stesso contratto", ma il contratto non c'è ancora.
- *Proposta:* vedi C7.

**🟡 R10. Carico di lavoro sbilanciato.**
- *Revisori:* design, implementation-readiness.
- *Dove:* §11 tabella A/B.
- *Problema:*
  - Marko ha interfaccia, accessibilità, generatore e la sua generalizzazione, cioè il lavoro grafico più rischioso;
  - Nicolas ha tutto il server in una sola fase e poi lavoro più leggero.
- *Proposta:* nella fase di inserimento dei prodotti Nicolas trascrive i dati dei prodotti e i parametri di geometria e si occupa dell'impaginazione del PDF. Marko tiene le primitive del generatore e l'interfaccia. Lo schema Zod della geometria è il punto di contatto tra i due.

**🟡 R11. Alcune motivazioni sono deboli proprio dove il valutatore guarda.**
- *Revisori:* comprehension, structural, codebase-details, design.
- *Problema:*
  - SQLite è scartato perché "due sviluppatori non possono condividerlo", ma la §3.8 dà a ciascuno il proprio database locale, quindi l'argomento si smonta da solo;
  - per MySQL, "ecosistema meno ampio" è discutibile;
  - le schede 0002, 0004, 0005 e 0009 si reggono solo su "requisito del tutor";
  - non chiarire se tutor e professore siano la stessa persona;
  - mancano le schede sulle scelte che il professore probabilmente chiederà: Next.js, Nodemailer + Gmail, libreria PDF e conversione, shadcn/ui, Zod, catalogo in file, Docker solo per il database;
  - il modello di scheda non ha una sezione "Conseguenze";
  - le decisioni sostituite (Supabase, Prisma, prezzi, IA) non hanno una scheda "Sostituita da", anche se la regola del registro lo chiede;
  - la §12 dice che "la documentazione fa parte della valutazione", ma non c'è un voto.

**🟢 R12. Problemi di lettura.**
- *Revisori:* comprehension, structural.
- *Problema:*
  - mancano un glossario e un esempio completo della gerarchia;
  - lo stesso concetto ha più nomi: modello/prodotto/versione, optional/accessori/extras, essenza/legno;
  - non sono spiegati Effe, Area Pro, sequenza del fronte;
  - "Foto nel PDF" (§13) e "SVG convertito in PNG" (§5) indicano la stessa cosa con nomi diversi;
  - il formato di `numero` non è definito;
  - molti titoli in grassetto non sono veri titoli e non si possono collegare;
  - l'analisi non dice dove starà nel repository.

### 2. Contraddizioni nei documenti

| # | Contraddizione | Dove | Soluzione |
|---|---|---|---|
| K1 | La scheda 0008 dice "Nessun servizio esterno", ma l'invio passa da Gmail | 0008 contro §6 "Destinatari" | Titolo nuovo: "Nessun cookie e nessuna risorsa esterna caricata nel browser"; rimando alla scheda sull'email |
| K2 | Lo stato è nell'URL ("link condivisibile"), mentre il "link per riaprire la configurazione" è indicato come non previsto | §5 contro 0006 | Scrivere che l'URL contiene solo lo stato del client e non è legato a una configurazione salvata; un valore non più presente nel catalogo si sostituisce con quello predefinito |
| K3 | "Se vuole, riceve per email", ma senza email non c'è salvataggio | §1 contro §5 / 0006 | "Si salva solo insieme alla richiesta del riepilogo" |
| K4 | Il fallimento della notifica va "in un log", ma c'è anche la colonna di stato e la regola "nessun dato su file locali" | §5 contro §4 e §9.4 | Stato nella colonna del database (con l'errore), log solo su stdout |
| K5 | La prova del PDF si fa "all'inizio" / "subito", ma nel calendario il PDF compare solo nella seconda fase | §5, §13 contro §11 | Prova come primo passo |
| K6 | Il 3D è previsto "se avanza tempo", ma dopo il blocco delle funzioni non si aggiungono funzioni | §8, §10 contro §11 | Togliere il 3D; il tempo che avanza va alla rifinitura degli SVG |
| K7 | La demo è "usata solo dagli sviluppatori", ma il professore scriverà un'email vera | §5 "Verifica dell'email" | "Usata dagli sviluppatori e dal valutatore"; informativa in bozza pronta insieme al flusso completo |
| K8 | La scheda 0007 è "Accettata", ma la base giuridica è "da definire" | 0007 | Stato "Proposta" finché il tutor non conferma |
| K9 | Le email nella casella del progetto "seguono il limite dei 12 mesi", ma Gmail non cancella in automatico per età | §6 | Procedura manuale (ricerca `older_than:12m`), dichiarata come tale |
| K10 | "Cambiando solo la connessione" | §2.5, §3.5.4, 0012 | "Solo configurazione (connessione, SSL), nessuna modifica a schema o codice" |
| K11 | Prisma è "ipotesi iniziale" nella 0003 e "alternativa valutata" nella §3.7 | 0003 contro §3.7 | Allineare i due testi |
| K12 | "Docker installato e verificato" e "nessuna esperienza pregressa" | 0002 contro §13 | Non si contraddicono; aggiungere cosa è stato verificato (ad esempio `docker run hello-world` con WSL2) |

### 3. Contraddizioni tecniche e soluzioni inventive

**C1. Molti modelli diversi contro un solo generatore.**
- *Soluzione (separazione per condizione e per dati):*
  1. *Censimento nella prima fase* (circa 2 ore): elenco dei modelli di effe.it, raggruppati per famiglia di layout (forma × panche × tipo di fronte), con priorità. Va in `docs/catalogo-inventario.md`.
  2. *Geometria come elenco di parti:* `geometry` JSONB descrive l'involucro più un elenco ordinato di parti tipizzate (pannelli del fronte {tipo, larghezza}, panche {forma, profondità, livelli}, stufa {tipo, parete, scostamento}). Il generatore è una piccola libreria di primitive. Un nuovo layout della stessa famiglia diventa un file di dati e non codice nuovo.
  3. *Due livelli di resa:*
     - Livello A: viste SVG, cominciando da esterna e frontale; la pianta solo se avanza tempo.
     - Livello B: immagini ufficiali.
  4. *Regola di decisione:* se un modello richiede più di circa 2 ore (o mezza giornata per una famiglia nuova) di lavoro sul generatore, usa il livello B in questa versione.
  5. *Misura:* registrare il tempo per modello dopo il secondo e il terzo prodotto, e decidere da quel dato quanti prodotti sono realistici.
- *Alternativa da valutare:* un modello SVG disegnato a mano per ogni modello (Inkscape o Figma) con zone texture nominate. Per un layout molto diverso può essere più veloce e più bello che parametrizzarlo. Il cambio di materiale funziona comunque, perché cambia solo la sorgente del pattern.

**C2. Anteprima ricca contro PDF convertito sul server.**
- *Soluzione:* una sola funzione `(geometria, scelte, vista) → stringa SVG`, senza DOM, usata dal client e dal server. Poi due strade da provare subito:
  1. *Conversione nel browser:* il client disegna l'SVG in un canvas, esporta un PNG a 2× e lo manda con la richiesta. Il PDF coincide con lo schermo e non servono moduli nativi. Le texture vanno incorporate come data URI. Il server deve controllare tipo e dimensione, perché il limite predefinito del corpo delle Server Actions è 1 MB.
  2. *Conversione sul server* con `@resvg/resvg-js` dalla configurazione già validata, con texture incorporate e font caricati in modo esplicito. Il server non si fida di un'immagine fornita dal client.
- *Disaccordo tra revisori:* design e inventive-catalyst preferivano la strada 1, codebase-details la 2.
- *Decisione dell'autore: strada 2, conversione sul server con `@resvg/resvg-js`.* Motivi:
  - il PDF si rigenera dalla riga salvata, quindi "Riprova", "Scarica il PDF" e `npm run check` usano lo stesso codice senza chiedere l'immagine al browser;
  - il server non accetta immagini dal client, quindi non servono controlli su tipo e dimensione né il limite di 1 MB delle Server Actions;
  - `@resvg/resvg-js` ha binari già pronti per Windows, senza dipendenze di sistema;
  - la funzione che produce l'SVG è la stessa dell'anteprima, quindi le differenze possibili riguardano solo pochi effetti, che la prova individua.
- La strada 1 resta la seconda opzione se la prova mostra differenze evidenti rispetto allo schermo.
- *Ripiego deciso subito:* la stessa funzione con l'opzione `flat: true`, che sostituisce i pattern con il colore di `material.colore` e toglie le fusioni.
- *Terza via:* Playwright/Puppeteer `page.pdf()` dà la massima fedeltà, ma è pesante. Ha senso solo con l'applicazione fuori da Docker.

**C3. Email reale obbligatoria contro una demo che non deve fallire.**
- *Soluzione:*
  - *Ammortizzare prima:* la schermata di conferma offre sempre "Scarica il PDF", rigenerato dalla configurazione salvata e in memoria, coerente con la §9.4.
  - *Controllo preliminare self-service:* `npm run check` verifica:
    - la connessione al database e le migrazioni;
    - il numero di prodotti caricati;
    - `transporter.verify()`;
    - una conversione di Aladdin;
    - la presenza delle texture.
    - Il risultato è un OK/FAIL in italiano per ogni voce.
  - *Meno punti di guasto:*
    - timeout SMTP di circa 10 s;
    - la notifica si manda dopo l'email al cliente e non la blocca (oppure in copia nascosta);
    - durante lo sviluppo si usa Mailpit in locale, così non si consuma la reputazione dell'account Gmail.
- Il risultato: o l'email arriva, o lo stesso PDF è già sullo schermo con un messaggio onesto sullo stato.

**C4. Tempo reale contro file statici.**
- *Soluzione (separazione nello spazio):* la geometria è fissa per modello e taglio e si calcola una volta (memoizzata). I materiali si legano al momento cambiando il riferimento del `<pattern>` per zona (`option_group.zone`, nomi fissati nel contratto). Gli optional sono parti che si accendono e si spengono. In `public/` stanno solo le texture. Gli `id` dei pattern hanno un prefisso per vista.

**C5. Atomicità contro effetto esterno.**
- *Soluzione (la riga è la "posta in uscita"):*
  1. `INSERT` con `stato_cliente` e `stato_progetto` = `in_attesa`, confermato subito, che restituisce `id` e `numero`.
  2. Generazione del PDF in memoria.
  3. Invio al cliente, poi `UPDATE` a `inviata`/`fallita` con errore, tentativi e data.
  4. Notifica con lo stesso schema.
- "Riprova invio" agisce sullo stesso `id`.
- Il pulsante si disattiva mentre l'invio è in corso.
- Stati come `pgEnum`.
- Un eventuale identificativo generato dal client evita doppioni da doppio clic.

**C6. "Un solo comando" contro l'inesperienza con Docker.**
- *Soluzione (separazione nel tempo):*
  - Docker solo per Postgres, come chiesto dal tutor: `postgres:17` fissato, volume con nome, healthcheck, porta 5433.
  - Il "comando unico" diventa `npm run demo` = `docker compose up -d --wait` → migrazioni → seed → pulizia → `next build` → `next start` → controllo preliminare.
  - Il Dockerfile dell'applicazione è un extra dopo il blocco, con una scheda che ne motiva l'esclusione.

**C7. Due sviluppatori in parallelo contro un contratto che non esiste.**
- *Soluzione (azione preliminare):* all'inizio del lavoro, circa 3 ore insieme, una sola PR con:
  - i tipi in `src/contratti/` (catalogo, configurazione con `schemaVersion: 1`, geometria);
  - le semantiche delle regole;
  - la funzione pura `valuta(config, regole) → {valida, errori, disattivati}`, usata sia dall'interfaccia sia dal server;
  - lo schema Drizzle con i vincoli unici;
  - la lista fissa delle dipendenze.
- *Riuso:* i file di `data/prodotti/` sono il "catalogo finto". Marko li importa subito e il seed di Nicolas carica gli stessi file, validati con Zod: un file sbagliato fa fallire il seed. I file sono la fonte; il database ne deriva e serve per vincoli, query e configurazioni salvate.
- *Regole per le migrazioni:*
  - il seed è un upsert per codice, mai una cancellazione totale;
  - solo Nicolas esegue `drizzle-kit generate`;
  - `push` è vietato;
  - schema bloccato prima del flusso completo, e ciò che emerge dopo va nei JSONB;
  - `configuration` contiene `product_code` più lo snapshot, senza una chiave esterna rigida verso il catalogo;
  - `npm run db:reset` serve da ripristino.

**C8. Privacy rigorosa contro una demo che nessun cliente userà.**
- *Soluzione (inversione: scadenza "pigra"):*
  - colonna `expires_at`;
  - un `DELETE … WHERE expires_at < now()` all'avvio di `npm run demo`;
  - le letture filtrano le righe scadute;
  - nessun processo "a intervalli": Next.js non ha uno scheduler e pg_cron violerebbe la regola 2 della §9;
  - la cancellazione su richiesta è lo stesso script con un parametro email.
- La conservazione si riduce a una colonna e una query.

**C9. "Il più possibile" contro il controllo di qualità.**
- *Soluzione:*
  - pagina interna `/galleria` che mostra ogni prodotto × taglio con i materiali predefiniti; serve come controllo visivo, come bersaglio per axe e come materiale di riserva per la demo;
  - una prova automatica che esegue il PDF una volta per prodotto.

**C10. Prodotti con foto contro qualità grafica uniforme.**
- *Soluzione (separazione per condizione nell'interfaccia):* per i prodotti con foto si mostrano la foto della versione più un pannello di campioni delle texture scelte, con l'etichetta "anteprima fotografica, materiali indicati a lato". Gli stessi campioni vanno nel PDF. Le foto stanno in `public/` e non si richiamano dal sito, per restare dentro la scheda 0008.

### 4. Misure di privacy, conservazione e migrabilità: cosa è giustificato

Il professore inserirà un'email vera, quindi alcune misure reali sono giustificate. Il resto è un obiettivo di apprendimento da dichiarare come tale ("progettato come se fosse pubblico; in demo i dati sono degli sviluppatori e del valutatore").

| Misura | Decisione | Motivo |
|---|---|---|
| Solo email e configurazione | Si implementa | Non costa nulla |
| Nessun cookie, font serviti dal progetto (`next/font` scarica il font alla build) | Si implementa | Non costa nulla e si mostra bene |
| Segreti solo in `.env`, `.env.example` | Si implementa | È una pratica standard |
| Informativa breve in bozza, con versione costante salvata nella riga | Si implementa insieme al flusso completo | Il professore inserisce un dato reale |
| `expires_at` e pulizia all'avvio | Si implementa | Pochi minuti; si dimostra con una riga retrodatata in una prova |
| Script di cancellazione per email | Si implementa | Una query; si mostra dal vivo in 30 s cancellando i dati della demo |
| Processo di pulizia periodico | Obiettivo di apprendimento | Nessuno scheduler; non è osservabile in due settimane |
| Conservazione nella casella Gmail | Procedura manuale documentata | Gmail non la automatizza |
| Base giuridica | Proposta da far confermare al tutor: art. 6(1)(b) GDPR (risposta a una richiesta dell'interessato) | Non lasciarla vuota |
| Link di conferma dell'email, anti-spam | Lavoro futuro | Gli utenti sono noti; si accetta il rischio per la demo |
| Regole di migrabilità 1, 3, 4, 5 | Si tengono come proprietà del progetto, non come lavoro | Sono già le impostazioni predefinite |
| WCAG 2.1 AA | Obiettivo mantenuto; verifiche a punti fissi (fine dello scheletro, flusso completo, prove finali) sulle 3–4 pagine del flusso, risultati in `prove.md` | Dichiarare "progettato per AA, verificato su questi flussi" |

### 5. Ideal Final Result

- Aggiungere una sauna significa scrivere un file di dati, senza toccare il codice.
- Il prodotto si controlla da solo: o il seed fallisce o il prodotto compare nella galleria.
- L'immagine del PDF è quella che il cliente ha visto.
- La riga `configuration` è la fonte di verità su cosa è stato chiesto e cosa è stato consegnato.
- Il comando della demo è anche il controllo di salute.
- La scadenza è una colonna.
- La demo non può fallire in modo visibile: l'email arriva, oppure lo stesso PDF è già sullo schermo con lo stato onesto.
- Il tempo dei due sviluppatori va nei contenuti (modelli, texture) e nella qualità grafica, non nell'infrastruttura.

## Goals vs. Non-Goals

**Obiettivi (alla consegna)**
- Un flusso completo dimostrato dal vivo e ripetuto dal professore sul computer degli sviluppatori: scelta, anteprima, pulsante, riga nel database, email reale con PDF, notifica.
- Anteprima SVG di buona qualità per almeno due modelli, con cambio di materiale immediato.
- Regole di compatibilità applicate con lo stesso codice nell'interfaccia e nel server.
- Percorso di errore dell'invio gestito e mostrabile.
- Uso completo da tastiera e axe senza violazioni gravi sulle pagine del flusso.
- Ogni scelta mostrata nella demo ha una scheda con motivi, alternative e conseguenze.
- Minimo di privacy reale: dati minimi, informativa in bozza, scadenza, cancellazione.

**Non obiettivi**
- Prezzi, sconti, IVA, preventivi (indicazione del tutor).
- Funzioni di intelligenza artificiale (indicazione del tutor).
- 3D in tempo reale: va tolto, non lasciato "se avanza tempo".
- Applicazione dentro Docker e avvio su un terzo computer.
- Pulizia periodica con scheduler; conservazione automatica nella casella Gmail.
- PDF accessibile, link di conferma dell'email, anti-spam, più lingue.
- Ricontatto dei clienti e consenso commerciale.
- Viste SVG per tutto il catalogo e la vista interna. La pianta solo se avanza tempo.
- Conformità AA completa certificata, compresa l'anteprima SVG.
- Uso reale da parte dell'azienda o pubblicazione.

## Alternatives Weighed

Alternative scartate nei documenti, con il motivo e l'attribuzione indicati nei documenti stessi.

| Alternativa | Esito | Motivo | Chi | Fonte |
|---|---|---|---|---|
| Supabase (scelta iniziale) | Abbandonato | Postgres in un container Docker; richiede un account e va in pausa dopo circa una settimana di inattività | Tutor (indicazione); motivi aggiuntivi dell'autore | §1, §3.8, 0002 |
| MySQL | Scartato | Valido, ma senza vantaggi: JSON meno sviluppato, meno servizi online per la migrazione | Autore | §3.6, 0001 |
| SQLite | Scartato | File su disco: non condivisibile in due, migrazione online non lineare | Autore | §3.6, 0001 |
| MongoDB | Sconsigliato | Relazioni e regole controllate dal codice; migrazioni poco supportate; la flessibilità si ottiene già con JSONB | Autore | §3.6, 0001 |
| SQL puro (`pg`, `postgres.js`) | Scartato | Migrazioni e tipi da gestire a mano, errori solo a runtime | Autore | §3.7, 0003 |
| Prisma (ipotesi iniziale) | Scartato | Nasconde di più l'SQL; con l'SQL già noto il vantaggio non compensa | Autore | §3.7, 0003 |
| Applicazione in Docker durante lo sviluppo | Scartata | Su Windows i ricaricamenti sono più lenti | Autore | §3.8 |
| Prezzi di esempio solo nel PDF | Scartati | I prezzi sono fuori dal progetto; il listino reale non è disponibile | Tutor | §1, 0004 |
| Assistente di configurazione, ricerca semantica, pgvector | Rinviati | L'IA è fuori dal progetto; meno complessità nei tempi del tirocinio | Tutor (motivo dei tempi: autore) | §1, 0005 |
| Due azioni separate (salva e invia) | Scartate | Un solo pulsante è più semplice e verificabile, con dati minimi | Autore | 0006 |
| Link per riaprire la configurazione | Non previsto | Non motivato nella scheda | Autore | 0006 |
| Consenso al ricontatto / commerciale | Escluso | Raccolta minima dei dati | Autore | §1, §6, 0007 |
| Link di conferma dell'email | Rimandato | La demo è usata solo dagli sviluppatori; rinviato a una futura pubblicazione | Autore | §5, §10 |
| Google Fonts e analytics | Esclusi | Nessun banner cookie, privacy più semplice | Autore | 0008 |
| PDF accessibile | Rinviato | Lavoro realistico nei tempi; il testo è ripetuto nel corpo dell'email | Autore | §7, 0009 |
| 3D in tempo reale | Extra finale | Pesante e di qualità inferiore ai configuratori online | Autore | §8, 0010 |
| Immagini a livelli da file FBX | Scartate | Non replicabili per tutti i modelli | Autore | 0010 |
| Vista interna | Scartata | Difficile da replicare | Autore | §8 |
| File 3D e 2D dell'Area Pro nel repository | Esclusi | Restano solo sul computer locale (uso autorizzato dal tutor solo per ciò che è visibile sul sito) | Autore, su autorizzazione del tutor | §8, 0010 |
| Più lingue | Rinviate | Meno lavoro, rispetto di WCAG sulla lingua | Autore | 0011 |
| Nessuna regola di migrabilità | Scartata | Il progetto potrebbe essere pubblicato | Autore | 0012 |
| Fork separati | Scartati | Più complicati senza vantaggi | Autore | 0013 |

Nota per la presentazione: l'argomento contro SQLite va riscritto, perché anche con PostgreSQL ognuno ha il proprio database. I motivi veri sono:
- l'indicazione del tutor;
- JSONB;
- i vincoli `CHECK` e le chiavi esterne;
- la parità con un Postgres online.

## Key Decisions & Staging for Next Steps

### Criterio minimo di successo per la consegna (tutti obbligatori, verificati nelle prove finali)

1. Sul computer della demo, partendo da un clone pulito con `.env` copiato, `npm run demo` porta l'applicazione in funzione in meno di 10 minuti, senza passaggi manuali.
2. Almeno **3 prodotti**:
   - Aladdin con viste SVG complete;
   - un secondo modello SVG, possibilmente con interno diverso; se la prova del generatore fallisce, della stessa famiglia ma con un altro taglio;
   - un prodotto con immagine ufficiale e pannello dei materiali.
   - **Obiettivo: 6–8 prodotti**, deciso all'inizio della fase di inserimento in base al tempo misurato per prodotto. Quelli non inseriti vanno nella documentazione con la stima.
3. Ogni prodotto ha almeno: un taglio, un'essenza, un secondo gruppo di materiali e un optional. Almeno una regola reale è bloccata nell'interfaccia con il suo messaggio. Un URL modificato a mano con una combinazione non valida è rifiutato dal server.
4. Il professore inserisce il proprio indirizzo e preme il pulsante. Entro 60 s:
   - riga nel database con entrambi gli stati `inviata`, mostrata con `drizzle-kit studio`;
   - email ricevuta con il PDF (immagine, o versione `flat`, ed elenco delle scelte) e lo stesso elenco nel corpo;
   - notifica nella casella del progetto.
5. Con la password SMTP sbagliata o la rete staccata: riga `fallita`, messaggio chiaro, "Scarica il PDF" funzionante, e "Riprova" che invia senza creare una seconda riga.
6. Il flusso intero funziona solo con la tastiera; axe riporta 0 violazioni gravi o critiche su catalogo, configuratore e conferma.
7. Le prove automatiche sulle regole e sulla validazione passano. Lo script di pulizia e quello di cancellazione funzionano.
8. Ogni scelta mostrata nella demo ha la sua scheda.

### Ordine delle fasi (N = Nicolas, M = Marko)

| Fase | Lavoro |
|---|---|
| 1. Prove delle parti incerte | N: account Gmail, verifica in due passaggi, password per le app; invio di prova con PDF fittizio a un Gmail, un Outlook e un indirizzo dell'università; `docker-compose.yml` solo database su entrambi i portatili |
| 2. Contratto e prova del PDF | Insieme (circa 3 h): PR del contratto (tipi, Zod, geometria, semantica delle regole, `valuta`), schema Drizzle, lista delle dipendenze. Poi N prova PDF/conversione (C2) e decide la scheda 0014; M prende Aladdin dai file di `data/prodotti/` attraverso il contratto |
| 3. Scheletro completo | Insieme: censimento del catalogo per famiglie e tempo di trascrizione di Aladdin. M: secondo modello SVG (prova del generatore). N: seed con validazione, scheletro completo con Aladdin fisso nel codice (pulsante → riga → email con PDF). Prima verifica tastiera/axe |
| 4. Invio reale e modulo | N: invio reale con stati e "Riprova", notifica, timeout, `npm run check`. M: modulo email, informativa, errori e focus. **Schema bloccato alla fine della fase** |
| 5. Flusso completo | Flusso completo su Aladdin su entrambi i portatili; pulizia e cancellazione; verifica axe |
| 6. Inserimento dei prodotti | Prodotti per famiglia di layout: N trascrive dati e geometria, M primitive e viste. Applicare la regola di decisione SVG/foto |
| 7. Blocco delle funzioni | Dopo, niente funzioni nuove né modifiche allo schema. Dati dei prodotti, rifinitura grafica e correzioni restano ammessi fino alla prova generale. Tag `demo-rc1` |
| 8. Prove finali | Prove della lista di accettazione; avvio da clone pulito sul portatile dell'altro sviluppatore |
| 9. Prova generale | Sul computer della demo e, se possibile, sulla rete della sede, con l'invio vero; rifinitura grafica |
| 10. Preparazione della demo | Documentazione finale, stato della demo (database pulito, invio di prova la mattina stessa, email già ricevuta conservata), tag `demo-final`. Il giorno della demo non si lavora |

### Piano dei ripieghi per la demo

| Guasto | Ripiego |
|---|---|
| SMTP bloccato dalla rete | Hotspot del telefono, provato in anticipo |
| Gmail rifiuta o rallenta l'invio | Timeout di 10 s → stato `fallita` → "Scarica il PDF" sullo schermo; email ricevuta il giorno prima da mostrare |
| L'email finisce in spam | Indirizzo del professore provato prima; chiedergli di controllare lo spam |
| La conversione SVG→PNG non regge | Versione `flat` decisa con la prova del PDF |
| Il database o l'avvio non partono | `npm run db:reset`; `.env` su chiavetta; checkout del tag |
| Guasto completo | Registrazione di 60–90 s del flusso intero |

### Schede da aggiungere o correggere

- **Nuove:**
  - 0014 PDF e conversione SVG;
  - 0015 Docker solo per il database (modifica la 0002);
  - 0016 Generatore come funzione pura e famiglie di layout;
  - 0017 Email: Nodemailer + Gmail, timeout, ripieghi;
  - 0018 Catalogo come file, database derivato;
  - 0019 Next.js / Server Action o Route Handler, Zod, shadcn/ui;
  - 0020 Regole di compatibilità condivise.
- **Da correggere:**
  - 0007 in stato "Proposta" con la base giuridica proposta;
  - 0008 con il titolo nuovo;
  - 0006 con la distinzione tra URL e configurazione salvata e il riprova sulla stessa riga;
  - 0010 con "famiglie supportate";
  - 0001 con l'argomento su SQLite riscritto.
- **Modello delle schede:** aggiungere "Conseguenze", "Come è stato verificato" e "Ripiego". Inserire il campo "Sostituisce" nel modello oppure aggiungere schede storiche per Supabase, Prisma, prezzi e IA.
- **Analisi:**
  - sezioni nuove: glossario, requisiti numerati, criteri di successo, piano della demo, tabella dei rischi (rischio, impatto, mitigazione, responsabile);
  - §3.5.3 corretta;
  - §8 corretta (tempo reale);
  - 3D tolto;
  - "tutor" e "professore" definiti;
  - nella §12 il riferimento alla valutazione allineato al contesto reale.

### Come presentare le scelte

1. Aprire con i vincoli: tempo limitato, due persone, demo locale, email reale obbligatoria, grafica importante. Ogni scheda diventa così una conseguenza dei vincoli.
2. Mostrare la demo come una storia unica: scegli → vedi → ricevi. Poi provare apposta una scelta incompatibile e, con la rete staccata, il percorso di errore con il riprova. Un ripiego che funziona convince più di una slide.
3. Una sola slide con 5 scelte e un motivo ciascuna:
   - PostgreSQL + JSONB (il dominio è relazionale);
   - Docker solo per il database (indicazione del tutor, riproducibilità);
   - Drizzle (migrazioni e tipi in due);
   - SVG parametrico invece del 3D (peso, qualità, replicabilità per le famiglie supportate);
   - dati minimi e nessun cookie.
4. Per ogni scelta dire l'alternativa scartata e cosa farebbe cambiare idea. Per esempio:
   - "Puppeteer se la fedeltà del PDF non bastasse";
   - "Postgres online cambiando solo `.env` se si pubblicasse".
5. Presentare le esclusioni (prezzi, IA, 3D, applicazione in Docker, scheduler) come decisioni motivate. Mostrare la tabella delle famiglie di layout e il tempo misurato per prodotto: trasformano "il più possibile" in un dato difendibile.
