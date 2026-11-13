// Verifica che ogni combinazione dei vecchi pacchetti si ricomponga identica dai nuovi file.
//   node scripts/viste/verifica.mjs <pacchetti estratti> data/viste
// Confronta, elemento per elemento, corpo, definizioni e attributi di <svg>
// (titolo, aria-label e attributi data-* esclusi).
// Agli originali si applicano prima le correzioni note di correzioni.mjs.
// Non si confrontano i materiali, che ora vengono dalle foto di effe.it (materiali.mjs): l'immagine dei
// pattern e i colori degli stop dei gradienti. Si confronta invece in quali pattern c'è un'immagine.
import fs from 'node:fs';
import path from 'node:path';
import { componiVista, fileTexture, tipoTexture } from './componi.mjs';
import { applica } from './correzioni.mjs';

const [src, dst] = process.argv.slice(2);
const b64 = {};
const href = (id) => `data:${tipoTexture(id)};base64,` + (b64[id] ??= fs.readFileSync(path.join(dst, 'texture', fileTexture(id))).toString('base64'));

function norma(testo) {
  const t = testo.replace(/href="data:[^"]*"/g, 'href="texture"').replace(/stop-color="[^"]*"/g, 'stop-color="colore"').replace(/<title>[^<]*<\/title>/, '').replace(/\saria-label="[^"]*"/, '').replace(/\sdata-[a-z-]+="[^"]*"/g, '');
  const open = t.match(/<svg[^>]*>/)[0];
  const defs = (t.match(/<defs>([\s\S]*?)<\/defs>/) || [, ''])[1];
  const lista = (s) => (s.match(/<(pattern|linearGradient|radialGradient)[\s\S]*?<\/\1>|<[a-zA-Z]+[^>]*\/>/g) || []).map((x) => x.replace(/\s+/g, ' '));
  const corpo = t.slice(t.includes('</defs>') ? t.indexOf('</defs>') + 7 : t.indexOf(open) + open.length);
  return { open: open.replace(/\s+/g, ' '), defs: lista(defs).sort(), corpo: lista(corpo) };
}

let ok = 0, ko = 0;
for (const set of fs.readdirSync(src).filter((f) => fs.existsSync(path.join(src, f, 'manifest.json')))) {
  const vecchio = JSON.parse(fs.readFileSync(path.join(src, set, 'manifest.json'), 'utf8'));
  const nuovo = JSON.parse(fs.readFileSync(path.join(dst, set, 'manifest.json'), 'utf8'));
  const gruppi = nuovo.optionGroups.map((g) => g.id);
  for (const a of vecchio.assets) {
    const taglio = 'size' in a ? a.size : 'deck' in a ? nuovo.sizes.find((t) => t.deck === a.deck).viste : nuovo.sizes.find((t) => !t.riusaDa).viste;
    const base = fs.readFileSync(path.join(dst, set, taglio, a.view + '.svg'), 'utf8');
    const scelte = Object.fromEntries(gruppi.map((g) => [g, a[g]]));
    const mio = norma(componiVista(base, scelte, nuovo.optionGroups, href, { prefisso: '' }));
    // gli originali con le correzioni note (correzioni.mjs), le stesse applicate ai file nuovi
    const orig = norma(applica(set, a.view, fs.readFileSync(path.join(src, set, a.path), 'utf8')));
    const uguale = JSON.stringify(mio) === JSON.stringify(orig);
    uguale ? ok++ : ko++;
    if (!uguale) {
      const i = mio.corpo.findIndex((x, k) => x !== orig.corpo[k]);
      console.log('DIVERSA', set, a.path, mio.open === orig.open ? '' : '[svg]', JSON.stringify(mio.defs) === JSON.stringify(orig.defs) ? '' : '[defs]', i >= 0 ? `[corpo, elemento ${i}]` : '');
    }
  }
}
console.log(`identiche: ${ok}, diverse: ${ko}`);
process.exit(ko ? 1 : 0);
