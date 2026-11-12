# 0020. Regole di compatibilità condivise tra interfaccia e server

- **Stato:** Sostituita da [0027](./0027-niente-regole-ne-optional.md)
- **Note:** Raccoglie la decisione P2 dell'analisi v6

## Contesto
Alcune scelte possono dipendere da altre o dal taglio. L'interfaccia deve impedire le combinazioni non valide e spiegarne il motivo, anche a chi usa la tastiera o un lettore di schermo. Il server deve rifiutare una combinazione non valida anche se arriva da un URL modificato a mano. Se le due parti applicassero le regole con codice diverso, potrebbero dare risultati diversi.

## Decisione
- **Una sola funzione pura** `valuta(config, regole) → {valida, errori, disattivati}` in `src/contratti/`, usata dall'interfaccia per disattivare le scelte e dal server, insieme a Zod, per rifiutare la configurazione.
- **Tipi di regola:**

| Tipo | Significato | Effetto nell'interfaccia |
|---|---|---|
| `requires` (A → B) | A si può scegliere solo se è scelto B | A disattivato, con il messaggio della regola |
| `excludes` (A ↔ B) | A e B non possono stare insieme; vale nei due sensi | Scelto uno, l'altro è disattivato con il messaggio |
| `only_with_size` (A → tagli) | A esiste solo per i tagli elencati | A disattivato negli altri tagli, con il messaggio |

- **Ordine di applicazione:** `only_with_size`, poi `excludes`, poi `requires`.
- **Scelte incompatibili:** restano visibili ma **disattivate** (`aria-disabled`), con il messaggio collegato all'opzione.
- **Scelta resa non valida da un cambio** (ad esempio di taglio): torna al valore predefinito del gruppo e un messaggio in una regione `aria-live` lo annuncia.
- **Gruppi:** ogni gruppo `single` è obbligatorio e ha un valore predefinito; un gruppo `multi` accetta da zero a tutti i valori.

## Motivi
- Una sola implementazione garantisce che interfaccia e server diano lo stesso risultato, ed è facile da provare.
- Disattivare invece di nascondere fa capire che l'opzione esiste e perché non è disponibile, anche con tecnologie assistive.
- Tornare al predefinito tiene la configurazione sempre valida, senza bloccare il cambio di taglio.
- L'ordine fisso rende il risultato prevedibile quando più regole valgono insieme.

## Conseguenze
- Le regole sono dati nei file del catalogo (scheda [0018](./0018-catalogo-file-database-derivato.md)); il loro significato è fissato in questa scheda.
- Il catalogo reale potrebbe non avere regole: le prove automatiche coprono i tre tipi su un catalogo di prova.
- La prima regola reale candidata è un `only_with_size` sulla pedana di Aladdin, se la scheda di preinstallazione mostra che non entra nel taglio 45.

## Come è stato verificato
Da completare: prove Vitest su `valuta` nella PR del contratto.

## Ripiego
Nessuno necessario: se una regola dà problemi nell'interfaccia, il server continua a rifiutare la combinazione.

## Alternative considerate
- Nascondere le scelte incompatibili: interfaccia più pulita, ma l'utente non sa che esistono.
- Lasciarle selezionabili e mostrare un errore: più passaggi per l'utente e configurazioni temporaneamente non valide.
- Bloccare il cambio di taglio finché non si toglie la scelta incompatibile: più rigido e meno chiaro.
- Regole controllate da vincoli del database: non bastano per l'interfaccia, che deve sapere prima cosa disattivare.

## Nota del 2026-11-11

Precisazione dopo la revisione dell'analisi v6; la scelta non cambia.

- La firma è `valuta(config, prodotto)`: prima delle regole controlla la struttura (taglio esistente, gruppi del prodotto, valori del gruppo, gruppi `single` con un valore) (analisi, sezione 10.1).
