// Pavimento della sauna di Cabanon: nei pacchetti è un fondo a doghe scuro con sopra una pedana a
// listelli più piccola, appoggiata su quattro travetti che in parte si vedono. Su effe.it il pavimento
// è tutto a listelli dello stesso legno: si tolgono pedana e travetti e si disegnano listelli da parete
// a parete, alla stessa quota e con le stesse fessure della pedana, paralleli alle panche.
// Come nella brochure di effe.it, il pavimento (listelli e fondo) è sempre in Aspen termotrattato, foto
// del campione liscio, qualunque boiserie si scelga: usa i pattern pav-x/y/z, copie di wood-x/y/z con la
// texture fissa. Pareti a doghe e panche seguono invece la boiserie.
//
// Le misure sono quelle della pianta (plan.svg, uguale nei tre tagli). L'esterno isometrico (ext.svg,
// e da lì l'Interno 3D) si ricava proiettando: u lungo la pianta in verticale, v in orizzontale.
// Nella vista Interno (frontale) il pavimento è coperto dalla porta e dalle pareti: non si tocca.

// pianta: pavimento interno
const X0 = 39.2, X1 = 678.8, Y0 = 34.7, Y1 = 687.5;
// pedana dei pacchetti: 33 listelli larghi 12.01 a passo 16.59, quattro travetti alti 24
const LARGO = 12.01, PASSO = 16.59;
const PEDANA = Array.from({ length: 33 }, (_, k) => ({ x0: 85.54 + PASSO * k, x1: 85.54 + PASSO * k + LARGO, y0: 87.35, y1: 636.35, h0: 6.48, h1: 11.77 }));
const TRAVETTI = [[95.54, 119.54], [254.54, 278.54], [445.04, 469.04], [604.04, 628.04]].map(([y0, y1]) => ({ x0: 85.54, x1: 633.02, y0, y1, h0: 1.19, h1: 6.48 }));
// pavimento nuovo: 39 listelli da parete a parete, fessure quasi uguali (4.51 contro 4.58)
const N = 39;
const PASSO_NUOVO = (X1 - X0 - LARGO) / (N - 1);
const LISTELLI = Array.from({ length: N }, (_, k) => ({ x0: X1 - LARGO - PASSO_NUOVO * k, x1: X1 - PASSO_NUOVO * k, y0: Y0, y1: Y1, h0: 6.48, h1: 11.77 }));

const ASPEN = 'aspenT.jpg';
// ombra del fondo: nei pacchetti dipende dalla boiserie (0.508 con l'Aspen, 0.308 con lo Scuro)
const OMBRA_FONDO = '0.508';
const OMBRA = (o) => `fill="#000" fill-opacity="${o}" stroke="#2a1a0c" stroke-opacity=".5" stroke-width=".6" stroke-linejoin="round"`;
const f2 = (n) => n.toFixed(2);
const pts = (lista) => lista.map(([x, y]) => `${f2(x)},${f2(y)}`).join(' ');
const leggiPunti = (riga) => riga.match(/points="([^"]+)"/)?.[1];
const coppie = (s) => s.split(' ').map((q) => q.split(',').map(Number));
const riempimento = (riga) => riga.match(/ fill="([^"]+)"/)?.[1];

// ---- pianta
const PAV_PIANTA = 'points="678.80,34.70 39.20,34.70 39.20,687.50 678.80,687.50"';
function pianta(testo) {
  const rett = (b) => pts([[b.x1, b.y0], [b.x0, b.y0], [b.x0, b.y1], [b.x1, b.y1]]);
  const chiave = (p) => p.split(' ').sort().join(' ');   // i travetti hanno i vertici in un altro ordine
  const vecchi = new Set([...PEDANA, ...TRAVETTI].map((b) => chiave(rett(b))));
  const nuovi = LISTELLI.flatMap((b) => [`<polygon points="${rett(b)}" fill="url(#pav-z)"/>`, `<polygon points="${rett(b)}" ${OMBRA('0.088')}/>`]);
  return sostituisci(testo, (r) => vecchi.has(chiave(leggiPunti(r))), PAV_PIANTA, nuovi, 4 * 2 + 33 * 2);
}

// ---- isometrico (ext.svg): angoli del pavimento interno
const B = [501.59, 602.69], R = [963.19, 820.66], L = [49.33, 816.25];
const iso = (x, y, h) => {
  const u = (y - Y0) / (Y1 - Y0), v = (X1 - x) / (X1 - X0);
  return [B[0] + u * (R[0] - B[0]) + v * (L[0] - B[0]), B[1] + u * (R[1] - B[1]) + v * (L[1] - B[1]) - h];
};
// facce visibili di un parallelepipedo: sopra (z), fianco verso v crescente cioè x0 (x), testa verso y1 (y)
const facce = (b) => ({
  z: [iso(b.x0, b.y0, b.h1), iso(b.x1, b.y0, b.h1), iso(b.x1, b.y1, b.h1), iso(b.x0, b.y1, b.h1)],
  x: [iso(b.x0, b.y0, b.h1), iso(b.x0, b.y0, b.h0), iso(b.x0, b.y1, b.h0), iso(b.x0, b.y1, b.h1)],
  y: [iso(b.x0, b.y1, b.h1), iso(b.x0, b.y1, b.h0), iso(b.x1, b.y1, b.h0), iso(b.x1, b.y1, b.h1)],
});
// punto dentro un quadrilatero convesso, con tolleranza
function dentro([px, py], q, eps = 0.15) {
  let segno = 0;
  for (let i = 0; i < q.length; i++) {
    const [ax, ay] = q[i], [bx, by] = q[(i + 1) % q.length];
    const lung = Math.hypot(bx - ax, by - ay);
    const d = ((bx - ax) * (py - ay) - (by - ay) * (px - ax)) / lung;
    if (Math.abs(d) <= eps) continue;
    const s = Math.sign(d);
    if (segno && s !== segno) return false;
    segno = s;
  }
  return true;
}
const PAV_ISO = 'points="501.59,602.69 49.33,816.25 510.93,1034.22 963.19,820.66"';
function isometrico(testo) {
  const vecchie = [...PEDANA, ...TRAVETTI].map(facce);
  const parte = (r) => {
    const m = riempimento(r)?.match(/^url\(#wood-([xyz])\)$/);
    if (!m) return false;
    const p = coppie(leggiPunti(r));
    return vecchie.some((f) => p.every((q) => dentro(q, f[m[1]])));
  };
  const nuovi = LISTELLI.flatMap((b) => {
    const f = facce(b);
    return [
      `<polygon points="${pts(f.z)}" fill="url(#pav-z)"/>`, `<polygon points="${pts(f.z)}" ${OMBRA('0.088')}/>`,
      `<polygon points="${pts(f.x)}" fill="url(#pav-x)"/>`, `<polygon points="${pts(f.x)}" ${OMBRA('0.226')}/>`,
      `<polygon points="${pts(f.y)}" fill="url(#pav-y)"/>`, `<polygon points="${pts(f.y)}" ${OMBRA('0.191')}/>`,
    ];
  });
  return sostituisci(testo, parte, PAV_ISO, nuovi);
}

// Toglie le righe riconosciute (e le righe di ombra o riflesso con gli stessi punti), mette il fondo in
// Aspen, aggiunge i pattern pav-* e mette i listelli nuovi subito dopo il fondo e la sua ombra.
function sostituisci(testo, daTogliere, pavimento, nuovi, attese) {
  const righe = testo.split('\n');
  if (righe.some((r) => r.startsWith('<polygon') && r.includes('data-pavimento'))) return testo; // già fatto
  const tolti = new Set();
  for (const r of righe) if (r.startsWith('<polygon') && daTogliere(r)) tolti.add(leggiPunti(r));
  if (!tolti.size) throw new Error('pavimento di Cabanon: pedana non trovata');
  if (attese && tolti.size !== attese / 2) throw new Error(`pavimento di Cabanon: ${tolti.size} pezzi di pedana, attesi ${attese / 2}`);
  const out = [];
  let messi = false, dopoPavimento = false;
  for (const r of righe) {
    if (r.startsWith('<polygon') && tolti.has(leggiPunti(r))) continue;
    if (dopoPavimento && !messi && !(r.startsWith('<polygon') && r.includes(pavimento))) {
      out.push(...nuovi.map((n, i) => (i === 0 ? n.replace('<polygon ', '<polygon data-pavimento="listelli" ') : n)));
      messi = true;
    }
    if (r.includes(pavimento)) {
      dopoPavimento = true;
      out.push(r.replace('fill="url(#wood-z)"', 'fill="url(#pav-z)"')
        .replace(/ fill-opacity="[^"]*"/, ` fill-opacity="${OMBRA_FONDO}"`).replace(/\sdata-per-fill-opacity="[^"]*"/, ''));
      continue;
    }
    const pattern = r.match(/^<pattern [^>]*id="wood-([xyz])"/);
    if (pattern) {
      out.push(r, r.replace(/\sdata-materiale="[^"]*"/, '').replace(`id="wood-${pattern[1]}"`, `id="pav-${pattern[1]}" data-texture="${ASPEN}"`));
      continue;
    }
    out.push(r);
  }
  if (!messi) throw new Error('pavimento di Cabanon: pavimento non trovato');
  return out.join('\n');
}

export const pavimentoCabanon = (vista) => (vista === 'plan' ? pianta : vista === 'ext' ? isometrico : null);
export const pezziPedana = (testo, vista) => {
  // per il controllo: quante righe toglierebbe la correzione
  const prima = testo.split('\n').filter((r) => r.startsWith('<polygon')).length;
  const dopo = pavimentoCabanon(vista)(testo).split('\n').filter((r) => r.startsWith('<polygon')).length;
  return { prima, dopo };
};
