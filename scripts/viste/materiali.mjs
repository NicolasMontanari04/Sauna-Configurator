// Mette nei manifest di data/viste i materiali presi dalle foto dei campioni di effe.it:
//   - texture: i JPG ripetibili fatti da texture-dalle-foto.ps1;
//   - ondulino di Cabanon: i gradienti tengono la forma dell'onda disegnata nei pacchetti, ma ogni
//     canale si scala perché il colore medio sia quello della foto (texture/originali/medie.json).
//   node scripts/viste/materiali.mjs
// Da rilanciare per ultimo, dopo vista-interna-cabanon.mjs. Rilanciarlo non cambia nulla.
import fs from 'node:fs';
import path from 'node:path';

const dir = 'data/viste';
const medie = JSON.parse(fs.readFileSync(path.join(dir, 'texture/originali/medie.json'), 'utf8'));
const colore = (foto) => medie[foto].match(/\d+/g).map(Number);

// set -> gruppo -> opzione -> texture
const TEXTURE = {
  air: { wood: { aspenN: 'aspenN.jpg', aspenT: 'aspenT.jpg' } },
  'air-corner': { wood: { aspenN: 'aspenN.jpg', aspenT: 'aspenT.jpg' } },
  aladdin: {
    wood: { rovere: 'rovere.jpg', wenge: 'wenge.jpg' },
    floor: { moka: 'moka.jpg', light: 'light.jpg', siena: 'siena.jpg' },
  },
  // boiserie di Cabanon: è a doghe (effe.it, "Boiserie a doghe")
  cabanon: { int: { aspenT: 'doghe-aspenT.jpg', termoScuro: 'doghe-scuro.jpg' } },
};
// set -> gruppo -> opzione -> foto da cui prendere il colore dei gradienti
const GRADIENTI = { cabanon: { ext: { mattone: 'mattone.jpg', muschio: 'muschio.jpg', cemento: 'cemento.jpg' } } };

// media di un gradiente lungo l'offset (trapezi tra gli stop)
function stop(testo) {
  return [...testo.matchAll(/<stop offset="([\d.]+)" stop-color="rgb\((\d+),(\d+),(\d+)\)"\/>/g)]
    .map((m) => ({ o: +m[1], c: [+m[2], +m[3], +m[4]] }));
}
function media(st) {
  const m = [0, 0, 0];
  for (let i = 1; i < st.length; i++) {
    const d = st[i].o - st[i - 1].o;
    for (let k = 0; k < 3; k++) m[k] += (d * (st[i].c[k] + st[i - 1].c[k])) / 2;
  }
  return m;
}
function ricolora(testo, obiettivo) {
  const st = stop(testo);
  const m = media(st);
  if (m.every((v, k) => Math.abs(v - obiettivo[k]) < 0.5)) return testo;
  return st.map(({ o, c }) => `<stop offset="${o.toFixed(3)}" stop-color="rgb(${c.map((v, k) => Math.min(255, Math.round((v * obiettivo[k]) / m[k]))).join(',')})"/>`).join('');
}

for (const set of fs.readdirSync(dir).filter((f) => fs.existsSync(path.join(dir, f, 'manifest.json')))) {
  const file = path.join(dir, set, 'manifest.json');
  const man = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const g of man.optionGroups) for (const o of g.options) {
    const tex = TEXTURE[set]?.[g.id]?.[o.id];
    if (tex) {
      if (!fs.existsSync(path.join(dir, 'texture', tex))) throw new Error(`manca texture/${tex}`);
      o.texture = tex;
    }
    const foto = GRADIENTI[set]?.[g.id]?.[o.id];
    if (foto) for (const id of Object.keys(o.gradienti)) o.gradienti[id] = ricolora(o.gradienti[id], colore(foto));
  }
  fs.writeFileSync(file, JSON.stringify(man, null, 2) + '\n');
  console.log(set, man.optionGroups.flatMap((g) => g.options.map((o) => `${g.id}:${o.id}=${o.texture ?? (o.gradienti ? 'gradiente' : '-')}`)).join(' '));
}
