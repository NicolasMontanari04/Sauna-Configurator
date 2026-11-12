# Mockup del configuratore

`configuratore-saune-mockup.html` è il mockup creato con Claude dai file forniti dall'autore, scaricato dall'artifact "Configuratore saune" il 2026-11-11. Si apre con un doppio clic nel browser, senza server.

È il riferimento per l'interfaccia e per la resa delle viste (analisi, P15; scheda [0029](../../docs-iniziali/docs/decisioni/0029-viste-prodotte-in-chat.md)), non codice da usare così com'è:

- le viste Esterno, Frontale e Pianta di Aladdin 60 sono il riferimento di qualità; si convertono nel formato del contratto (analisi, appendice C), perché usano classi, variabili CSS e `color-mix()`, che resvg non supporta;
- per gli altri prodotti e tagli il mockup usa un disegno schematico da parametri, che non si riprende;
- i dati sono scritti nel codice; optional, regole e "Nessuna pedana" sono di esempio, non vengono dal catalogo (scheda 0027);
- carica i font da Google Fonts, che la scheda 0008 esclude;
- ha la vista Interno, che è scartata.
