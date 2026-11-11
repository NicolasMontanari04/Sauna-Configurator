# 0008. Nessun cookie e nessuna risorsa esterna caricata nel browser

- **Stato:** Accettata
- **Note:** Rivista il 2026-11-11 (analisi v6): titolo corretto, perché l'invio delle email passa da Gmail

## Contesto
Un sito che non carica risorse di terze parti nel browser non richiede un banner per i cookie.

## Decisione
Nessun cookie e nessun analytics. Nessun font, libreria o immagine caricati nel browser da servizi esterni: i font sono serviti dal progetto e le foto ufficiali sono copiate in `public/`. Si usa shadcn/ui, che non carica risorse esterne. L'invio delle email lato server passa da Gmail ed è dichiarato nell'informativa (vedi [0006](./0006-salvataggio-ed-email.md) e [0007](./0007-privacy.md)).

## Motivi
Semplifica la privacy; se si aggiungono servizi esterni nel browser si dichiarano e si aggiunge la gestione dei cookie.

## Alternative considerate
Google Fonts e analytics (esclusi).
