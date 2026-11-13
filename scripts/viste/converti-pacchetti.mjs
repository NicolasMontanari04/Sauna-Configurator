// Script usa e getta: converte i pacchetti di viste prodotti in chat (una combinazione per file,
// texture incorporate) nel formato "un SVG base per taglio e vista + texture PNG separate".
//
//   node scripts/viste/converti-pacchetti.mjs <cartella con i pacchetti estratti> data/viste
//
// Ogni pacchetto estratto è <set>/manifest.json + <set>/views/... (vedi data/vecchieViste).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const [src, dst] = process.argv.slice(2);
if (!src || !dst) throw new Error('uso: converti-pacchetti.mjs <pacchetti> <destinazione>');
const md5 = (s) => crypto.createHash('md5').update(s).digest('hex');
const PNG = /data:image\/png;base64,([A-Za-z0-9+/=]+)/;
const VOL = ['fill-opacity', 'stroke-opacity']; // attributi che variano con il materiale

// ---------- lettura degli SVG ----------
function attributi(tagIniziale) {
  return [...tagIniziale.matchAll(/([a-zA-Z:-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]);
}
function primoLivello(str) {
  const out = []; let i = 0;
  while ((i = str.indexOf('<', i)) !== -1) {
    const m = str.slice(i).match(/^<([a-zA-Z]+)[^>]*?(\/?)>/);
    if (!m) { i++; continue; }
    if (m[2] === '/') { out.push(str.slice(i, i + m[0].length)); i += m[0].length; continue; }
    const fine = str.indexOf(`</${m[1]}>`, i);
    if (fine < 0) throw new Error('tag non chiuso: ' + m[1]);
    out.push(str.slice(i, fine + m[1].length + 3)); i = fine + m[1].length + 3;
  }
  return out;
}
function leggi(testo) {
  const open = testo.match(/<svg[^>]*>/)[0];
  const defsTxt = (testo.match(/<defs>([\s\S]*?)<\/defs>/) || [, ''])[1];
  const dopo = testo.includes('</defs>') ? testo.slice(testo.indexOf('</defs>') + 7) : testo.slice(testo.indexOf(open) + open.length);
  const body = primoLivello(dopo.replace(/<title>[^<]*<\/title>/, '').replace(/<\/svg>\s*$/, '')).map((raw) => {
    if (!raw.endsWith('/>')) throw new Error('elemento con figli nel corpo: ' + raw.slice(0, 80));
    return { tag: raw.match(/^<([a-zA-Z]+)/)[1], attrs: attributi(raw) };
  });
  const defs = {};
  for (const d of primoLivello(defsTxt)) defs[d.match(/id="([^"]+)"/)[1]] = d;
  return { svgAttrs: attributi(open).filter(([k]) => k !== 'aria-label'), defs, body };
}
const chiave = (e) => e.tag + '|' + e.attrs.filter(([k]) => !VOL.includes(k)).map((a) => a.join('=')).join(' ');
function conOccorrenze(body) { const c = {}; return body.map((e) => { const k = chiave(e); c[k] = (c[k] || 0) + 1; return k + '#' + c[k]; }); }
function unisci(a, b) { // fusione con LCS: conserva l'ordine di entrambe le sequenze
  const n = a.length, m = b.length, L = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = a[i] === b[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const r = []; let i = 0, j = 0;
  while (i < n && j < m) { if (a[i] === b[j]) { r.push(a[i]); i++; j++; } else if (L[i + 1][j] >= L[i][j + 1]) r.push(a[i++]); else r.push(b[j++]); }
  return r.concat(a.slice(i), b.slice(j));
}
// quale gruppo, da solo, spiega il valore? (null se costante)
function spiega(varianti, valoreDi, gruppi, cosa) {
  const vals = varianti.map(valoreDi);
  if (vals.every((v) => v === vals[0])) return null;
  for (const g of gruppi) {
    const mappa = {}; let ok = true;
    varianti.forEach((v, i) => { const k = v.scelte[g]; if (k in mappa && mappa[k] !== vals[i]) ok = false; mappa[k] = vals[i]; });
    if (ok) return { gruppo: g, mappa };
  }
  throw new Error(`${cosa}: dipende da più scelte insieme`);
}
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

// ---------- conversione ----------
const texDir = path.join(dst, 'texture');
fs.mkdirSync(texDir, { recursive: true });
const textureNote = {}; // nome -> hash
const indice = [];

for (const set of fs.readdirSync(src).filter((f) => fs.existsSync(path.join(src, f, 'manifest.json')))) {
  const man = JSON.parse(fs.readFileSync(path.join(src, set, 'manifest.json'), 'utf8'));
  const a0 = man.assets[0];
  const chiaveTaglio = 'size' in a0 ? 'size' : 'deck' in a0 ? 'deck' : null;
  const gruppiId = Object.keys(a0).filter((k) => !['view', 'path', 'width', 'height', 'bytes', chiaveTaglio].includes(k));

  // gruppi di opzioni normalizzati (Air ha "woods" invece di optionGroups)
  const optionGroups = man.optionGroups ?? [{ id: 'wood', label: 'Legno', options: man.woods }];
  optionGroups.forEach((g) => { g.options = g.options.map((o) => ({ ...o })); });
  const opz = (g, v) => optionGroups.find((x) => x.id === g).options.find((o) => o.id === v);

  // taglio del manifest -> cartella delle viste
  let tagli;
  if (chiaveTaglio === 'size') tagli = man.appliesToSizes.map((s) => ({ id: s.optionId, label: s.label, viste: s.optionId }));
  else if (chiaveTaglio === 'deck') tagli = man.appliesToSizes.map((s) => ({ id: s.optionId, label: s.label, viste: s.optionId, deck: s.deck }));
  else {
    const base = man.appliesToSizes.find((s) => !s.reusedFromSize).optionId;
    tagli = man.appliesToSizes.map((s) => ({ id: s.optionId, label: s.label, viste: s.reusedFromSize ?? s.optionId, ...(s.reusedFromSize ? { riusaDa: s.reusedFromSize } : {}) }));
    for (const a of man.assets) a.__taglio = base;
  }
  const cartellaDi = (a) => chiaveTaglio === 'deck' ? tagli.find((t) => t.deck === a.deck).viste : chiaveTaglio === 'size' ? a.size : a.__taglio;

  const famiglie = {};
  for (const a of man.assets) {
    const testo = fs.readFileSync(path.join(src, set, a.path), 'utf8');
    const scelte = Object.fromEntries(gruppiId.map((g) => [g, a[g]]));
    (famiglie[cartellaDi(a) + '/' + a.view] ??= []).push({ scelte, svg: leggi(testo), path: a.path });
  }
  const predef = Object.fromEntries(optionGroups.map((g) => [g.id, g.options[0].id]));
  const file = [];

  for (const [fam, vs] of Object.entries(famiglie)) {
    const [taglio, vista] = fam.split('/');
    const outDir = path.join(dst, set, taglio);
    fs.mkdirSync(outDir, { recursive: true });
    const relTex = path.relative(outDir, texDir).split(path.sep).join('/');
    const ref = vs.find((v) => gruppiId.every((g) => v.scelte[g] === predef[g])) ?? vs[0];

    // <svg>
    const svgAttrs = ref.svg.svgAttrs.map(([k, v]) => {
      if (spiega(vs, (x) => x.svg.svgAttrs.find((a) => a[0] === k)?.[1], gruppiId, 'svg@' + k)) throw new Error('attributo svg variabile');
      return `${k}="${v}"`;
    });
    const vb = ref.svg.svgAttrs.find(([k]) => k === 'viewBox')[1].split(/\s+/).map(Number);
    const tagLabel = tagli.find((t) => t.viste === taglio)?.label ?? taglio;
    const righe = [`<svg ${svgAttrs.join(' ')} data-set="${set}" data-taglio="${taglio}" data-vista="${vista}">`,
      `<title>${esc(tagLabel)}, ${esc(man.views.find((v) => v.id === vista)?.label ?? vista)}</title>`, '<defs>'];

    // defs
    for (const id of [...new Set(vs.flatMap((v) => Object.keys(v.svg.defs)))]) {
      const s = spiega(vs, (v) => v.svg.defs[id] ?? '', gruppiId, 'def ' + id);
      if (!s) { righe.push(ref.svg.defs[id] ?? vs.find((v) => v.svg.defs[id]).svg.defs[id]); continue; }
      const forme = new Set(Object.values(s.mappa).filter(Boolean).map((d) => d.replace(PNG, 'PNG').replace(/<stop[\s\S]*<\/linearGradient>/, '')));
      if (forme.size !== 1) throw new Error(`def ${id}: cambia più della texture`);
      let modello = Object.values(s.mappa).find(Boolean);
      if (modello.startsWith('<pattern')) {
        if ((modello.match(/<image/g) || []).length !== 1) throw new Error(`pattern ${id} con più immagini`);
        for (const [v, d] of Object.entries(s.mappa)) {
          const o = opz(s.gruppo, v);
          if (!d) { if (o.texture === undefined) o.texture = null; continue; }
          const b64 = d.match(PNG)[1]; const h = md5(b64);
          let nome = o.texture || v;
          if (textureNote[nome] && textureNote[nome] !== h) nome = set + '-' + v;
          if (!textureNote[nome]) { textureNote[nome] = h; fs.writeFileSync(path.join(texDir, nome + '.png'), Buffer.from(b64, 'base64')); }
          if (o.texture && o.texture !== nome) throw new Error(`texture diverse per ${s.gruppo}=${v}`);
          o.texture = nome;
        }
        // nel file grezzo: la texture del predefinito, o la prima disponibile (es. pedana "none")
        const t = opz(s.gruppo, predef[s.gruppo]).texture || opz(s.gruppo, Object.keys(s.mappa).find((k) => s.mappa[k])).texture;
        modello = modello.replace(PNG, `${relTex}/${t}.png`);
      } else if (modello.startsWith('<linearGradient')) {
        for (const [v, d] of Object.entries(s.mappa)) {
          const stop = d.match(/>([\s\S]*)<\/linearGradient>/)[1]; const o = opz(s.gruppo, v);
          o.gradienti ??= {};
          if (o.gradienti[id] && o.gradienti[id] !== stop) throw new Error(`gradiente ${id} diverso tra le viste per ${v}`);
          o.gradienti[id] = stop;
        }
        modello = s.mappa[predef[s.gruppo]] ?? modello;
      } else throw new Error(`def ${id}: tipo non gestito`);
      righe.push(modello.replace(/^(<[a-zA-Z]+)/, `$1 data-materiale="${s.gruppo}"`));
    }
    righe.push('</defs>');

    // corpo
    const indicizzati = vs.map((v) => { const ks = conOccorrenze(v.svg.body); return Object.fromEntries(ks.map((k, i) => [k, v.svg.body[i]])); });
    let ordine = conOccorrenze(ref.svg.body);
    for (const m of indicizzati) ordine = unisci(ordine, Object.keys(m));
    const refIdx = vs.indexOf(ref);
    for (const k of ordine) {
      const presenti = indicizzati.map((m) => m[k]);
      const pres = spiega(vs, (_, i) => String(!!presenti[i]), gruppiId, 'presenza');
      const proto = presenti[refIdx] ?? presenti.find(Boolean);
      const extra = [];
      if (pres) {
        extra.push(`data-se="${pres.gruppo}:${Object.keys(pres.mappa).filter((x) => pres.mappa[x] === 'true').join(',')}"`);
        if (!presenti[refIdx]) extra.push('display="none"');
      }
      const sub = vs.map((v, i) => ({ ...v, i })).filter((x) => presenti[x.i]);
      for (const a of VOL) {
        const s = spiega(sub, (x) => presenti[x.i].attrs.find((p) => p[0] === a)?.[1], gruppiId, 'attributo ' + a);
        if (s) extra.push(`data-per-${a}="${s.gruppo}:${Object.entries(s.mappa).map(([v, x]) => `${v}=${x}`).join(',')}"`);
      }
      righe.push(`<${proto.tag} ${proto.attrs.map(([k, v]) => `${k}="${v}"`).concat(extra).join(' ')}/>`);
    }
    righe.push('</svg>');
    const testo = righe.join('\n') + '\n';
    fs.writeFileSync(path.join(outDir, vista + '.svg'), testo);
    file.push({ taglio, vista, path: `${taglio}/${vista}.svg`, width: vb[2], height: vb[3], bytes: Buffer.byteLength(testo) });
    indice.push({ set, fam, varianti: vs.length, kb: Math.round(Buffer.byteLength(testo) / 1024) });
  }

  const nuovo = {
    schemaVersion: 2,
    setId: set,
    label: man.label,
    sourceModel: man.sourceModel,
    views: man.views,
    optionGroups,
    sizes: tagli,
    ...(man.notAvailable ? { notAvailable: man.notAvailable } : {}),
    ...(man.decks ? { decks: man.decks } : {}),
    notes: man.notes ?? [],
    files: file.sort((a, b) => a.path.localeCompare(b.path)),
  };
  fs.writeFileSync(path.join(dst, set, 'manifest.json'), JSON.stringify(nuovo, null, 2) + '\n');
}
console.table(indice);
console.log('texture:', Object.keys(textureNote).join(', '));
