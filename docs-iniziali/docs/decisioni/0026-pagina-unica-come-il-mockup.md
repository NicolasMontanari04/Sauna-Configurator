# 0026. Pagina unica a passaggi, invio in una finestra di dialogo

- **Stato:** Accettata
- **Sostituisce:** la [0024](./0024-request-id-dal-server.md); in parte la [0019](./0019-nextjs-server-action-zod-shadcn.md), solo per le route (P6), per le firme delle Server Action (P8) e per il funzionamento senza JavaScript

## Contesto
La 0019 prevedeva una pagina di catalogo, una pagina di configurazione per prodotto e una pagina di conferma con il token nell'URL, e chiedeva che il modulo funzionasse anche senza JavaScript. Il mockup, che è il riferimento dell'interfaccia, è una pagina sola. Il configuratore è comunque un componente client: senza JavaScript non si può configurare nulla, quindi la garanzia sul modulo non serviva a nessuno. La 0024 generava il `request_id` sul server per rispettare quella garanzia, e lasciava un difetto: tornando indietro e cambiando le scelte, il modulo rimandava lo stesso `request_id` e il server restituiva la configurazione precedente.

## Decisione
- **Una sola pagina**, `/`, con i passaggi Modello, Misure, Materiali, Riepilogo, l'anteprima a sinistra e la barra in basso, come nel mockup.
- **Invio in una finestra di dialogo:** modulo, attesa, esito, "Riprova" e "Scarica il PDF" stanno nella stessa finestra. L'informativa è una seconda finestra.
- **Route:** `/` (configuratore), `/riepilogo/[token]/pdf` (Route Handler del PDF), `/galleria` (pagina interna di controllo).
- **Stato nell'URL:** prodotto, taglio e scelte nella query string di `/`, ad esempio `/?product=<codice>&size=60&wood=rovere&floor=moka`; il passaggio corrente nel frammento (`#materiali`).
- **Server Action senza `redirect`:** `inviaRiepilogo` e `riprova` restituiscono l'esito, che la finestra mostra.
- **`request_id` generato dal client** con `crypto.randomUUID()` ogni volta che la finestra si apre. Un doppio clic manda due volte lo stesso valore; una nuova apertura, anche dopo aver cambiato le scelte, ne manda uno nuovo.
- **JavaScript è richiesto.** Il requisito "funziona senza JavaScript" è tolto.

## Motivi
- L'interfaccia provata e approvata è quella del mockup.
- Meno pagine e meno stati da tenere allineati nel tempo disponibile.
- Il `request_id` per apertura elimina il difetto della 0024 senza controlli in più sul server.

## Conseguenze
- Chiudendo la finestra o ricaricando la pagina dopo un invio fallito non si può più premere "Riprova" per quella richiesta: si rifà l'invio, che crea una nuova configurazione. Il PDF resta scaricabile dal suo indirizzo.
- Il token non compare più in un URL di pagina, solo in quello del PDF.
- Le verifiche di accessibilità riguardano la pagina e le due finestre di dialogo (gestione del focus, `aria-modal`, ritorno del focus alla chiusura).

## Come è stato verificato
Da completare: prova automatica del doppio invio (una sola riga) e di due aperture successive (due righe) nella fase 4.

## Ripiego
Nessuno previsto.

## Alternative considerate
- Route separate con pagina di conferma (scelta precedente): "Riprova" sopravvive al ricaricamento, ma l'interfaccia si allontana dal mockup e servono più pagine.
- `request_id` generato dal server (0024): serve solo senza JavaScript e ha il difetto descritto nel contesto.
- Confronto del contenuto in caso di `request_id` ripetuto: risolve il difetto, ma aggiunge un caso d'errore da spiegare al cliente.
