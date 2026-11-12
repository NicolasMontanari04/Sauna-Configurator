# Registro delle decisioni

Una scheda per ogni scelta. Se una scelta cambia, non si modifica la vecchia: si aggiunge una nuova scheda che la sostituisce, si indica *Sostituita da* nello stato della vecchia e *Sostituisce* nella nuova. Se la nuova scheda cambia solo una parte della vecchia, la vecchia resta valida per il resto e il suo stato dice *sostituita in parte da*, con la parte cambiata. Le precisazioni che non cambiano la scelta si fanno nella scheda stessa, con una nota datata.

| N. | Decisione | Stato |
|---|---|---|
| [0001](./0001-postgresql.md) | Database relazionale PostgreSQL | Accettata |
| [0002](./0002-docker-al-posto-di-supabase.md) | PostgreSQL in Docker al posto di Supabase | Sostituita da 0014 |
| [0003](./0003-drizzle.md) | ORM Drizzle | Accettata |
| [0004](./0004-prezzi-fuori-dal-progetto.md) | Prezzi fuori dal progetto | Accettata |
| [0005](./0005-ia-fuori-dal-progetto.md) | Funzioni di intelligenza artificiale fuori dal progetto | Accettata |
| [0006](./0006-salvataggio-ed-email.md) | Un solo pulsante: salva, invia al cliente, notifica il progetto | Accettata |
| [0007](./0007-privacy.md) | Privacy: finalità, conservazione e cancellazione | Accettata |
| [0008](./0008-nessun-cookie.md) | Nessun cookie e nessuna risorsa esterna caricata nel browser | Accettata |
| [0009](./0009-accessibilita.md) | Accessibilità WCAG 2.1 livello AA | Accettata |
| [0010](./0010-grafica-svg-da-parametri.md) | Grafica: viste SVG da parametri e immagini del sito come ripiego | Sostituita da 0025 |
| [0011](./0011-lingua-italiana.md) | Solo italiano | Accettata |
| [0012](./0012-migrabilita.md) | Regole di migrabilità | Accettata |
| [0013](./0013-git.md) | Organizzazione di Git | Accettata |
| [0014](./0014-docker-solo-database.md) | Solo PostgreSQL in Docker, applicazione fuori dal container | Accettata |
| [0015](./0015-pdf-pdfkit-resvg.md) | PDF: impaginazione con PDFKit, immagine convertita con resvg | Accettata (da confermare con la prova) |
| [0016](./0016-generatore-famiglie-layout.md) | Generatore delle viste come funzione pura, per famiglie di layout | Sostituita da 0025 (restano validi i font e l'opzione `flat`) |
| [0017](./0017-email-nodemailer-gmail.md) | Email: Nodemailer con Gmail, stati nella riga, Mailpit in sviluppo | Accettata; in parte sostituita da 0023 e 0026 |
| [0018](./0018-catalogo-file-database-derivato.md) | Catalogo come file JSON, database derivato | Accettata; in parte sostituita da 0022 e 0027 |
| [0019](./0019-nextjs-server-action-zod-shadcn.md) | Next.js con Server Action e Route Handler, Zod, shadcn/ui | Accettata; in parte sostituita da 0026 |
| [0020](./0020-regole-compatibilita-condivise.md) | Regole di compatibilità condivise tra interfaccia e server | Sostituita da 0027 |
| [0021](./0021-viste-frontale-diagonale.md) | Viste esterne: frontale e diagonale | Sostituita da 0025 |
| [0022](./0022-seed-sincronizzazione-catalogo.md) | Seed come sincronizzazione completa, catalogo letto dal database | Accettata |
| [0023](./0023-notifica-attesa.md) | La notifica al progetto si attende prima della risposta | Accettata |
| [0024](./0024-request-id-dal-server.md) | Il request_id lo genera il server, nel modulo | Sostituita da 0026 |
| [0025](./0025-viste-pronte-da-modello-3d.md) | Viste SVG pronte, generate da uno script a partire dal modello 3D | Accettata (texture e confronto con le foto da verificare nella fase 2) |
| [0026](./0026-pagina-unica-come-il-mockup.md) | Pagina unica a passaggi, invio in una finestra di dialogo | Accettata |
| [0027](./0027-niente-regole-ne-optional.md) | Niente regole di compatibilità né optional; pedana obbligatoria | Accettata |
