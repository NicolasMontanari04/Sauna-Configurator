# Viste SVG dei prodotti

Viste di Air, Air Corner, Aladdin e Cabanon prodotte in chat dai DWG dell'Area Pro, con le texture ricavate dalle foto dei campioni di effe.it. C'è un SVG base per ogni taglio e vista; colori e texture li sceglie il codice ([`scripts/viste/componi.mjs`](../../scripts/viste/componi.mjs)).

I pacchetti originali, con un file per ogni combinazione (114 SVG, 31,7 MB), sono in `data/vecchieViste/`, che è esclusa da git. Questa cartella pesa 4 MB, di cui 1,8 MB di foto originali dei campioni.

## Contenuto

```
viste/
  texture/<id>.jpg                 9 texture 512 × 512 ripetibili: aspenN, aspenT, rovere, wenge, moka, light, siena,
                                   doghe-aspenT, doghe-scuro
  texture/originali/               le foto dei campioni scaricate da effe.it, più medie.json (colore medio di ognuna)
  <set>/manifest.json              gruppi di scelte, tagli, file
  <set>/<cartella>/ext.svg         esterno isometrico
  <set>/<cartella>/int.svg         interno, visto di fronte attraverso il vetro
  <set>/<cartella>/plan.svg        pianta senza tetto
```

| Set | Cartelle | Gruppi |
|---|---|---|
| `air` | `80` (la usano anche Air 60 e Air 120: `riusaDa` nel manifest) | `wood`: aspenN, aspenT |
| `air-corner` | `80c` (la usa anche Air 105 Corner) | `wood`: aspenN, aspenT |
| `aladdin` | `45`, `60` | `wood`: rovere, wenge; `floor`: none, moka, light, siena |
| `cabanon` | `garden`, `gardenM`, `gardenL` (Terrace non disponibile) | `ext`: mattone, muschio, cemento (rivestimento e tetto); `int`: aspenT, termoScuro (boiserie a doghe) |

In `sizes` del manifest ogni taglio indica in `viste` la cartella da usare. Una vista con `cartella` in `views` usa sempre quella cartella, qualunque taglio sia scelto.

**Cabanon, Interno 3D** (`cabanon/<taglio>/int3d.svg`, uno per taglio): l'esterno isometrico senza le due pareti frontali, la porta, la soglia e il tetto della sauna, come nello schema dei materiali di effe.it. Con il deck Medium o Large restano il deck e la pergola. Sotto la sauna c'è un basamento unico alla quota del deck (niente scalino), e il piano del telaio del deck passa sotto le assi, che nell'esterno sono in parte coperte. Le pareti di fondo sono lisce in Aspen termotrattato (foto del campione liscio), con la fascia bassa a doghe nel legno scelto, cioè la foto delle doghe dell'opzione (sul sito: "Interno liscio" più "Boiserie a doghe"). Le altre viste di Cabanon colorano invece tutto l'interno con il legno scelto, come nei pacchetti originali. La vista si ricava con `node scripts/viste/vista-interna-cabanon.mjs` (ordine dei comandi più sotto).

## Materiali dalle foto di effe.it

Le foto dei campioni sono in `texture/originali/` (scaricate da static.effe.it il 2026-11-13). Da lì:

- **Texture** (`scripts/viste/texture-dalle-foto.ps1`, Windows): legno e gres sono un ritaglio quadrato centrale con la luce uniformata riga per riga e i bordi sfumati sul lato opposto, così si ripetono senza giunte. Per le doghe lo script misura il passo delle tavole sulla foto (244 px nell'Aspen, 205 px nello Scuro), ritaglia due tavole intere e le dispone 6 × 2: circa 9 cm a tavola. Scrive anche `originali/medie.json`.
- **Manifest** (`scripts/viste/materiali.mjs`): mette i nomi delle texture nelle opzioni. Per l'ondulino di Cabanon tiene la forma dell'onda dei gradienti e scala ogni canale finché il colore medio è quello della foto (Mattone, Muschio, Cemento). Lo specchio di Aladdin resta un gradiente.
- **Cabanon, struttura e deck** (`correzioni.mjs`): sono in alluminio verniciato, colore Alluminio di effe.it. Nei pacchetti la struttura aveva già quel tono, ma più scuro, e le assi del deck erano color legno. Ora la faccia in luce della struttura ha il colore medio della foto, le altre facce sono schiarite dello stesso fattore e le assi tengono la loro luminosità relativa. Vale per telaio, bordi del tetto, pergola, montanti, deck e telaio della porta, in tutte le viste.
- **Cabanon, tetto della sauna** (`correzioni.mjs`): è in ondulino del colore del rivestimento, come nelle foto di Cabanon Terrace. La pergola sopra il deck resta a listelli, color alluminio.

## Come si compone una vista

```js
import { componiVista, fileTexture } from '../scripts/viste/componi.mjs';
const svg = componiVista(testoBase, { wood: 'wenge', floor: 'moka' }, manifest.optionGroups,
  (id) => `/viste/texture/${fileTexture(id)}`);   // oppure un data URI, per resvg o per un SVG autonomo
```

Il file base marca quello che cambia con le scelte, un elemento per riga:

| Marcatura | Significato |
|---|---|
| `data-se="floor:moka,light,siena"` | l'elemento c'è solo con quei valori (la pedana, i riflessi del legno scuro) |
| `data-per-fill-opacity="wood:aspenN=0.050,aspenT=0.080"` | il valore dell'attributo dipende dalla scelta |
| `data-materiale="wood"` su `<pattern>` | l'`<image>` prende la `texture` dell'opzione scelta; se l'opzione non ha texture il pattern si toglie |
| `data-materiale="ext"` su `<linearGradient>` | gli `<stop>` vengono da `gradienti` dell'opzione (l'ondulino di Cabanon) |
| `data-texture="aspenT.jpg"` su `<pattern>` | l'`<image>` prende sempre quella texture (le pareti lisce di Cabanon in Interno 3D) |
| `display="none"` | elemento nascosto nel file grezzo, che mostra la prima opzione di ogni gruppo |

Il risultato non usa classi, variabili CSS né `color-mix()`.

**Id unici.** Gli SVG inseriti inline nella stessa pagina condividono gli id (`g`, `clad-x`, `wood-x`…), e un `url(#g)` finirebbe sul gradiente di un'altra vista: per esempio sparisce l'ondulino di Cabanon. Per questo `componiVista` mette davanti a ogni id un prefisso diverso a ogni chiamata (`v1-`, `v2-`…). Un prefisso fisso si passa con `{ prefisso: 'cab-ext-' }`; con `{ prefisso: '' }` gli id restano quelli del file, il che va bene con `<img>` o con un file autonomo.

**Texture.** Nel manifest il nome ha l'estensione (`"texture": "rovere.jpg"`). `fileTexture(id)` e `tipoTexture(id)` di `componi.mjs` danno nome del file e tipo MIME; senza estensione vale `.png`. Il pattern disegna l'immagine in un quadrato di 256 × 256 unità ripetuto (circa 55 cm sulle pareti), quindi l'immagine deve essere quadrata e ripetibile senza giunte: è quello che fa `texture-dalle-foto.ps1`. Basta un lato di 256–512 px.

**Per aggiungere un materiale** basta una voce in `optionGroups` con una nuova `texture` (un'immagine in `texture/`, voce in `materiali.mjs`) o nuovi `gradienti`, senza rigenerare gli SVG. Gli attributi `data-per-*` vanno completati con il nuovo valore; dove manca, l'attributo si toglie.

## Verifica

```bash
node scripts/viste/verifica.mjs <pacchetti estratti da data/vecchieViste> data/viste
```

Ricompone dai file nuovi ognuna delle 114 combinazioni dei vecchi pacchetti e la confronta con l'originale, elemento per elemento, dopo aver applicato agli originali le correzioni note di [`correzioni.mjs`](../../scripts/viste/correzioni.mjs). Non confronta i materiali presi dalle foto (l'immagine dei pattern e i colori degli stop), che i pacchetti non hanno: confronta tutto il resto, compreso in quali pattern c'è un'immagine. Esito del 2026-11-13: 114 identiche su 114.

Per rifare tutto, in quest'ordine:

```bash
node scripts/viste/converti-pacchetti.mjs <pacchetti estratti> data/viste
node scripts/viste/correggi-viste.mjs
node scripts/viste/vista-interna-cabanon.mjs
node scripts/viste/materiali.mjs
```

Le texture si rifanno solo se cambiano le foto:

```bash
powershell -ExecutionPolicy Bypass -File scripts/viste/texture-dalle-foto.ps1
```

**Correzioni note** (`correzioni.mjs`), tutte di Cabanon:

1. con deck Medium e Large, vista Esterno, il piano del telaio del deck era disegnato sopra le prime tre assi, che si vedevano solo a metà; ora sta sotto le assi;
2. struttura e deck color alluminio, in tutte le viste (il tag `<svg>` riceve `data-colori="alluminio"`, così la correzione non si applica due volte);
3. tetto della sauna nel colore del rivestimento;
4. tolti i riflessi bianchi (opacità 0.16) che i pacchetti mettevano sopra il Legno termotrattato scuro: servivano alla vecchia texture sintetica e con la foto ingrigivano il legno. Gli indici dei poligoni in `vista-interna-cabanon.mjs` sono contati senza i riflessi;
5. pavimento della sauna tutto a listelli, sempre in Aspen termotrattato (foto del campione liscio) qualunque boiserie si scelga, come nella brochure di effe.it: con la boiserie cambiano solo le doghe delle pareti e le panche. Il fondo e i listelli usano i pattern `pav-x/y/z`, copie di `wood-x/y/z` con `data-texture="aspenT.jpg"` ([`pavimento-cabanon.mjs`](../../scripts/viste/pavimento-cabanon.mjs)). Nei pacchetti c'era un fondo a doghe più scuro con sopra una pedana a listelli più piccola, su quattro travetti che in parte si vedevano. Ora pedana e travetti non ci sono più e 39 listelli vanno da parete a parete, alla quota della pedana (circa 1 cm sopra il deck), con le stesse fessure e paralleli alle panche. Vale per Esterno, Pianta e quindi Interno 3D; nella vista Interno il pavimento è coperto da porta e pareti e non cambia. Anche gli indici di `vista-interna-cabanon.mjs` sono contati dopo questa correzione.

## Cose da sapere (dai pacchetti originali)

1. **Aladdin 45**: il DWG misura 180 × 160 cm, il sito dice 180 × 140. Le viste seguono il DWG.
2. **Riuso**: Air 60 e 120 usano le viste di Air 80, Air 105 Corner quelle di Air 80 Corner. Le proporzioni non sono quelle reali.
3. **Cabanon**: deck ricostruiti dai PDF e dai render (stime); una sola porta; Terrace e deck Small mancano.
4. **Pedana di Aladdin**: 120 × 120 × 5 cm sotto la stufa, posizione stimata dalle foto.
5. **Texture**: nei pacchetti erano sintetiche, ricostruite dai colori dei campioni; ora vengono dalle foto (vedi sopra). Le vecchie sono in `data/vecchieViste/texture/`.
6. **Proporzioni** diverse tra viste: contenitore a rapporto fisso con `object-fit: contain`, e `width`/`height` del manifest per riservare lo spazio.
7. **Testo alternativo** nell'`alt` dell'immagine, ad esempio «Aladdin 60, Wengé, pedana Moka, vista esterna».
