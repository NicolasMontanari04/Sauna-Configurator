# 0015. PDF: impaginazione con PDFKit, immagine convertita con resvg

- **Stato:** Accettata (da confermare con la prova della fase 2)

## Contesto
Il riepilogo è un PDF di una pagina, inviato per email e scaricabile, con l'immagine della configurazione e l'elenco delle scelte. Deve essere generato sul server, in memoria, dalla riga salvata, così "Riprova", "Scarica il PDF" e `npm run check` usano lo stesso codice. I testi sono in italiano con gli accenti ("Wengé"). Il font deve essere quello del progetto e incorporato, senza servizi esterni. L'immagine nasce come stringa SVG dalla stessa funzione dell'anteprima, con pattern, sfumature e filtri.

## Decisione
- **`@resvg/resvg-js`** converte la stringa SVG in PNG, a una risoluzione doppia rispetto allo schermo. Le texture si incorporano come data URI e i font si caricano dai file TTF del progetto.
- **PDFKit** impagina il PDF: pagina A4 verticale, immagine PNG, elenco delle scelte, numero e data della configurazione, con gli stessi file TTF incorporati. Il risultato si raccoglie in un `Buffer` in memoria, senza file su disco.
- Il codice gira in una Server Action o in un Route Handler con `runtime = 'nodejs'`.

## Motivi
- PDFKit è una libreria matura e diffusa per Node.js, con un'API semplice per testo, immagini e font.
- Va a capo da solo nei testi lunghi e aggiunge le pagine quando servono, cose che con `pdf-lib` andrebbero scritte a mano.
- Incorpora i font TrueType, quindi gli accenti e l'aspetto sono gli stessi delle pagine.
- Non richiede un browser sul server, a differenza di Playwright o Puppeteer.
- Separare conversione (resvg) e impaginazione (PDFKit) permette di provare le due parti in modo indipendente e di usare il ripiego a colori pieni senza cambiare l'impaginazione.

## Conseguenze
- La disposizione della pagina si scrive con coordinate e misure: va bene per una pagina di riepilogo, non per documenti complessi.
- PDFKit legge da disco i dati dei suoi font standard. Se il bundler di Next.js non li trova, si dichiara PDFKit in `serverExternalPackages` nella configurazione di Next.js; si usano comunque solo i font del progetto.
- Il PDF non è accessibile (scheda 0009): il testo del riepilogo si ripete nel corpo dell'email.

## Come è stato verificato
Da completare con la prova della fase 2: Aladdin 60 con Wengé, gres e specchio; confronto a vista con il browser; controllo degli accenti, delle quote e dei filtri `feTurbulence` usati dal mockup.

## Ripiego
- Se un effetto non regge in resvg: la stessa funzione con `flat: true`, a colori pieni.
- Se PDFKit non funziona dentro Next.js: `pdf-lib`, che è solo JavaScript e non legge file, con il ritorno a capo scritto a mano.

## Alternative considerate
- `@react-pdf/renderer`: impaginazione con componenti React e flexbox, comoda, ma più pesante, con un supporto SVG parziale e problemi di compatibilità con alcune versioni di React e Next.js. L'immagine arriva comunque già come PNG, quindi il vantaggio è solo nell'impaginazione.
- `pdf-lib`: leggera e senza dipendenze dal disco, ma senza ritorno a capo né impaginazione automatica. Tenuta come ripiego.
- jsPDF: pensata soprattutto per il browser; sul server offre meno di PDFKit.
- Playwright o Puppeteer con `page.pdf()`: massima fedeltà, ma richiedono un browser sul server, molto pesante per il progetto.
- Conversione dell'immagine nel browser: scartata nella sezione 11 dell'analisi, perché il server dovrebbe fidarsi di un'immagine del client e il PDF non si potrebbe rigenerare.

## Nota del 2026-11-11

Precisazione dopo la revisione dell'analisi v6; la scelta non cambia.

- Nessun file esporta `runtime`: `nodejs` è il predefinito, e un file `'use server'` non può esportarlo (analisi, P8).
- La conversione della vista diagonale si prova nella fase 3 (analisi, sezione 15.5).
