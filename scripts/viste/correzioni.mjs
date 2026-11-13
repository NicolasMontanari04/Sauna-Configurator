import fs from 'node:fs';
import { pavimentoCabanon } from './pavimento-cabanon.mjs';

// Correzioni note ai pacchetti di viste prodotti in chat. Si applicano ai file di data/viste
// (correggi-viste.mjs) e agli originali prima del confronto (verifica.mjs), così la verifica resta esatta.

// Cabanon con deck, vista Esterno: il piano del telaio del deck è disegnato dopo le prime assi e le copre,
// così le assi arrivano solo a metà del deck. Lo si sposta subito prima della prima asse.
const TELAIO_DECK = 'points="990.56,826.81 507.74,1054.79';
const ASSE = 'stroke="#3a2616"';

export function correggiDeckCabanon(testo) {
  const righe = testo.split('\n');
  const primaAsse = righe.findIndex((r) => r.startsWith('<polygon') && r.includes(ASSE));
  if (primaAsse < 0) return testo;
  const telaio = righe.filter((r, i) => i > primaAsse && r.includes(TELAIO_DECK));
  if (!telaio.length) return testo;
  const resto = righe.filter((r, i) => !(i > primaAsse && r.includes(TELAIO_DECK)));
  resto.splice(primaAsse, 0, ...telaio);
  return resto.join('\n');
}

// Cabanon: struttura (telaio, bordi del tetto, pergola, montanti, telaio della porta) e deck sono in
// alluminio verniciato, colore "Alluminio" di effe.it (media della foto del campione, texture/originali/medie.json).
// Nei pacchetti la struttura è dello stesso tono ma più scura (la faccia in luce è rgb(118,85,61)) e le
// assi del deck sono color legno. Ogni colore si riporta al tono dell'alluminio: la struttura si
// schiarisce dello stesso fattore, le assi tengono la loro luminosità relativa (l'asse media diventa
// come la faccia in luce della struttura).
const MEDIE = JSON.parse(fs.readFileSync(new URL('../../data/viste/texture/originali/medie.json', import.meta.url), 'utf8'));
const ALLUMINIO_FOTO = MEDIE['Alluminio.jpg'].match(/\d+/g).map(Number);
const LUCE = [118, 85, 61];
const STRUTTURA = [[118, 85, 61], [105, 76, 54], [100, 72, 52], [80, 58, 42], [124, 90, 65], [121, 88, 63]];
const ASSI = [[156, 120, 90], [150, 116, 87], [159, 122, 92]];
const lum = ([r, g, b]) => 0.3 * r + 0.59 * g + 0.11 * b;
const rgb = (c) => `rgb(${c.join(',')})`;
export const ALLUMINIO = Object.fromEntries([
  ...STRUTTURA.map((c) => [rgb(c), rgb(c.map((v, i) => Math.round((v * ALLUMINIO_FOTO[i]) / LUCE[i])))]),
  ...ASSI.map((c) => [rgb(c), rgb(ALLUMINIO_FOTO.map((v) => Math.round((v * lum(c)) / lum(ASSI[0]))))]),
]);
const MARCA = ' data-colori="alluminio"';  // sul tag <svg>: i colori sono già stati convertiti

export function alluminioCabanon(testo) {
  if (testo.includes(MARCA)) return testo;
  return testo
    .replace(/<svg /, `<svg${MARCA} `)
    .replace(/fill="(rgb\(\d+,\d+,\d+\))"/g, (m, c) => (ALLUMINIO[c] ? `fill="${ALLUMINIO[c]}"` : m));
}

// Cabanon, tetto della sauna: nei pacchetti è un ondulino nel colore della struttura (gradiente gr);
// come nelle foto di effe.it (Cabanon Terrace) ha il colore del rivestimento: prende il gradiente g.
const TETTO = 'fill="url(#gr)"';
export const tettoCabanon = (testo) => testo.split(TETTO).join('fill="url(#g)"');

// Cabanon con boiserie in Legno termotrattato scuro: i pacchetti aggiungono sopra il legno un velo bianco
// (#fff, opacità 0.16) pensato per la vecchia texture sintetica; con la foto del campione ingrigisce il
// legno, quindi si toglie.
const RIFLESSO = /^<polygon [^>]*fill="#fff" fill-opacity="0\.16"/;
export const togliRiflessiCabanon = (testo) => testo.split('\n').filter((r) => !RIFLESSO.test(r)).join('\n');

// set, vista -> correzioni da applicare
export function correzioni(set, vista) {
  if (set !== 'cabanon') return [];
  const tutte = [alluminioCabanon, togliRiflessiCabanon];
  // pavimento tutto a listelli (pavimento-cabanon.mjs); in Interno 3D arriva dall'esterno
  const pavimento = pavimentoCabanon(vista);
  return [...(vista === 'ext' ? [correggiDeckCabanon, tettoCabanon] : []), ...tutte, ...(pavimento ? [pavimento] : [])];
}
export const applica = (set, vista, testo) => correzioni(set, vista).reduce((t, f) => f(t), testo);
