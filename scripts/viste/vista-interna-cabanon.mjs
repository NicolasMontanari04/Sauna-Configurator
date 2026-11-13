// Ricava la vista "Interno 3D" di Cabanon dall'esterno isometrico di ogni taglio (garden, gardenM, gardenL),
// sul modello dello schema dei materiali di effe.it (cabanon-schema-materiali.svg):
//   - tolte le due pareti frontali in ondulino, la porta (telaio, vetro, cerniere, maniglia),
//     la soglia e il montante d'angolo;
//   - tolto il tetto della sauna: con il deck resta la pergola sopra il deck ("tetto tagliato a metà");
//   - le pareti di fondo si allungano fino al pavimento; sotto la sauna c'è un basamento unico alla
//     quota del deck, che chiude anche lo spazio delle pareti tolte (niente scalino);
//   - il piano del telaio del deck passa sotto le assi, che così coprono tutto il deck.
//
//   node scripts/viste/vista-interna-cabanon.mjs
//
// Da rilanciare dopo converti-pacchetti.mjs e correggi-viste.mjs (parte dall'esterno già corretto:
// struttura in alluminio, tetto in ondulino) e prima di materiali.mjs.
import fs from 'node:fs';
import path from 'node:path';
import { ALLUMINIO } from './correzioni.mjs';

const dir = 'data/viste/cabanon';
const CARTELLE = ['garden', 'gardenM', 'gardenL'];

// La sauna è identica nei tre tagli (il deck aggiunge solo poligoni nuovi): i poligoni da togliere si
// individuano sul garden per indice (1 = primo <polygon> del file base) e si riconoscono negli altri
// tagli dalle coordinate, che coincidono. Ricavati a vista sui file del 2026-11-13 e rinumerati dopo aver tolto
// i riflessi del legno scuro e dopo aver rifatto il pavimento a listelli (correzioni.mjs).
const DA_TOGLIERE = [
  [406, 407], [410, 410], [416, 416], [418, 419], [428, 429], [456, 459], // bordo posteriore del tetto
  [544, 545],                          // parete destra (ondulino), lato porta
  [552, 585],                          // soglia, tetto, parete sinistra (ondulino), porta e ferramenta
  [586, 618],                          // vetro, bordo frontale del tetto, telaio della porta, montante
];
const TENUTI_NEL_MEZZO = [[546, 551]]; // pezzi di panca disegnati tra le due pareti
const ATTESI = { 544: 'url(#clad-y)', 564: 'url(#clad-x)', 561: 'url(#roof-z)', 584: '#9fc3dc', 89: 'url(#pav-z)' };

// Pareti di fondo: finiscono 12 px sopra il bordo posteriore del pavimento (590.52 contro 602.69);
// nell'esterno lo spazio era coperto dalle pareti frontali. Si abbassa il loro bordo inferiore.
const PARETI = [
  ['501.59,590.52 49.33,804.08 49.33,298.99 501.59,85.43', '501.59,602.69 49.33,816.25 49.33,298.99 501.59,85.43'],
  ['501.59,590.52 963.19,808.49 963.19,303.40 501.59,85.43', '501.59,602.69 963.19,820.66 963.19,303.40 501.59,85.43'],
];
const PAVIMENTO = '501.59,602.69 49.33,816.25 510.93,1034.22 963.19,820.66';
// Piano del telaio del deck (bordo posteriore 990.56,826.81 – 507.74,1054.79). Nell'esterno è disegnato
// dopo le prime tre assi e le copre: qui si sposta sotto le assi, subito dopo il pavimento.
const TELAIO_DECK = '990.56,826.81 507.74,1054.79';

// Basamento unico sotto la sauna, alla quota del deck. Misure ricavate dal deck:
//   - il piano del deck sta 6.77 px sopra la base del pavimento della sauna (PAVIMENTO);
//   - le pareti tolte erano spesse 27.37 px (lato porta, verso il deck) e 30.56 px (lato sinistro);
//   - il deck è alto 26.45 px: il basamento scende fino a terra come il deck.
// Anello in cima tra il pavimento e il filo esterno delle pareti, più le due facce frontali, negli stessi
// colori del deck (alluminio, correzioni.mjs).
const BASAMENTO = (() => {
  const T = 6.77, G = 26.45;
  const L = [49.33, 816.25], F = [510.93, 1034.22], R = [963.19, 820.66];
  const Lt = [L[0], L[1] - T], Ft = [F[0], F[1] - T], Rt = [R[0], R[1] - T];
  const Lo = [18.77, 823.91], Fo = [507.74, 1054.79], Ro = [990.56, 826.81]; // filo esterno, quota del deck
  const giu = ([x, y]) => [x, y + G];
  const s = (pts) => pts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
  const stile = 'stroke="#2b1a10" stroke-opacity=".55" stroke-width=".6" stroke-linejoin="round"';
  return [
    `<polygon points="${s([Lo, Fo, giu(Fo), giu(Lo)])}" fill="${ALLUMINIO['rgb(100,72,52)']}" ${stile}/>`, // faccia sinistra
    `<polygon points="${s([Fo, Ro, giu(Ro), giu(Fo)])}" fill="${ALLUMINIO['rgb(105,76,54)']}" ${stile}/>`, // faccia verso il deck
    `<polygon points="${s([Lo, Fo, Ro, Rt, Ft, Lt])}" fill="${ALLUMINIO['rgb(118,85,61)']}" ${stile}/>`,   // anello in cima
  ];
})();

// Boiserie (effe.it, Materiali): pareti sempre lisce in Aspen termotrattato; la fascia bassa a doghe
// prende il legno scelto (Aspen termotrattato o Legno termotrattato scuro). Le pareti di fondo
// diventano lisce in Aspen (pattern liscio-x/y, foto del campione liscio) e sopra si disegna la fascia
// alta H px con il pattern del legno scelto, che ha già la foto delle doghe (manifest, materiali.mjs).
const H = 300;
const LISCIO = 'aspenT.jpg';
const fascia = (da, a) => { // da 'xA,yA xB,yB …' prende il bordo inferiore e lo alza di H
  const [[xa, ya], [xb, yb]] = a.split(' ').slice(0, 2).map((q) => q.split(',').map(Number));
  return `${xa},${ya} ${xb},${yb} ${xb},${(yb - H).toFixed(2)} ${xa},${(ya - H).toFixed(2)}`;
};

const punti = (riga) => riga.match(/points="([^"]+)"/)?.[1];
const leggi = (cartella) => fs.readFileSync(path.join(dir, cartella, 'ext.svg'), 'utf8').split('\n');

// insieme delle coordinate da togliere, dal garden
const garden = leggi('garden');
const daTogliere = new Set();
{
  let n = 0;
  for (const riga of garden) {
    if (!riga.startsWith('<polygon')) continue; n++;
    const atteso = ATTESI[n];
    if (atteso && !riga.includes(` fill="${atteso}"`)) throw new Error(`garden: il poligono ${n} non è ${atteso}, il file base è cambiato`);
    const dentro = (r) => r.some(([a, b]) => n >= a && n <= b);
    if (dentro(DA_TOGLIERE) && !dentro(TENUTI_NEL_MEZZO)) daTogliere.add(punti(riga));
  }
  if (n !== 618) throw new Error(`Attesi 618 poligoni nel garden, trovati ${n}`);
}

const man = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8'));
man.files = man.files.filter((f) => f.vista !== 'int3d');
const resoconto = [];
for (const cartella of CARTELLE) {
  const trovati = new Set();
  let tolti = 0, allungate = 0, pavimento = 0, inserito = false;
  // piano del telaio del deck: si toglie dalla sua posizione e si rimette sotto le assi
  const telaio = leggi(cartella).filter((r) => r.startsWith('<polygon') && punti(r).startsWith(TELAIO_DECK));
  const conDeck = telaio.length > 0;
  const righe = [];
  for (let riga of leggi(cartella)) {
    if (riga.startsWith('<svg')) { righe.push(riga.replace('data-vista="ext"', 'data-vista="int3d"')); continue; }
    if (riga.startsWith('<title>')) { righe.push(riga.replace(/, [^<]*<\/title>/, ', Interno 3D</title>')); continue; }
    if (riga === '</defs>') {
      // pattern lisci in Aspen, con la stessa trasformazione di quelli del legno scelto
      for (const asse of ['x', 'y']) {
        const def = righe.find((r) => r.includes(`id="wood-${asse}"`));
        righe.push(def.replace(/\sdata-materiale="[^"]*"/, '').replace(`id="wood-${asse}"`, `id="liscio-${asse}" data-texture="${LISCIO}"`));
      }
      righe.push(riga); continue;
    }
    if (!riga.startsWith('<polygon')) { righe.push(riga); continue; }
    const p = punti(riga);
    if (daTogliere.has(p)) { trovati.add(p); tolti++; continue; }
    if (p.startsWith(TELAIO_DECK)) continue;
    const parete = PARETI.find(([da]) => p === da);
    if (parete) {
      const [da, a] = parete; allungate++;
      riga = riga.replace(da, a);
      if (/fill="url\(#wood-[xy]\)"/.test(riga)) { righe.push(riga.replace(/url\(#wood-([xy])\)/, 'url(#liscio-$1)')); continue; }
      if (!riga.includes('fill="#000"')) throw new Error(`${cartella}: parete con un riempimento inatteso`);
      // dopo l'ombra della parete, la fascia a doghe con la sua ombra
      const f = fascia(da, a);
      const asse = PARETI.indexOf(parete) === 0 ? 'y' : 'x';
      righe.push(riga, `<polygon points="${f}" fill="url(#wood-${asse})"/>`, riga.replace(a, f));
      continue;
    }
    righe.push(riga);
    if (p === PAVIMENTO) pavimento++;
    // basamento e telaio del deck subito dopo il pavimento (texture, ombra, eventuale riflesso),
    // prima di panche, listelli e assi del deck
    if (!inserito && pavimento && p !== PAVIMENTO) { righe.splice(righe.length - 1, 0, ...BASAMENTO, ...telaio); inserito = true; }
  }
  if (trovati.size !== daTogliere.size) throw new Error(`${cartella}: trovati ${trovati.size} gruppi da togliere su ${daTogliere.size}`);
  if (allungate !== 4 || !pavimento) throw new Error(`${cartella}: pareti allungate ${allungate} su 4, pavimento ${pavimento}`);
  if (!inserito) throw new Error(`${cartella}: basamento non inserito`);
  const testo = righe.join('\n');
  fs.writeFileSync(path.join(dir, cartella, 'int3d.svg'), testo);
  const vb = testo.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);
  man.files.push({ taglio: cartella, vista: 'int3d', path: `${cartella}/int3d.svg`, width: vb[2], height: vb[3], bytes: Buffer.byteLength(testo) });
  resoconto.push(`${cartella}: tolti ${tolti} poligoni, basamento${conDeck ? ', telaio del deck sotto le assi' : ''}, ${Math.round(Buffer.byteLength(testo) / 1024)} KB`);
}

man.views = man.views.filter((v) => v.id !== 'int3d');
man.views.splice(1, 0, {
  id: 'int3d',
  label: 'Interno 3D',
  description: 'Esterno isometrico senza le pareti frontali, la porta e il tetto della sauna; con il deck resta la pergola',
});
man.files.sort((a, b) => a.path.localeCompare(b.path));
fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(man, null, 2) + '\n');
console.log(resoconto.join('\n'));
