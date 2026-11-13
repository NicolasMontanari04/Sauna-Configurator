// Compone una vista: dal file SVG base di un taglio (data/viste/<set>/<taglio>/<vista>.svg)
// e dalle scelte dell'utente ricava l'SVG finale, senza CSS né variabili (adatto anche a resvg).
//
// Marcature nel file base (una per riga, un elemento per riga):
//   data-se="floor:moka,light,siena"          l'elemento c'è solo se floor è uno di quei valori
//   data-per-fill-opacity="wood:aspenN=0.050,aspenT=0.080"
//                                             il valore dell'attributo dipende dalla scelta di wood
//   data-materiale="wood"  su <pattern>        l'<image> prende la texture del materiale scelto;
//                                             se il materiale non ha texture il pattern si toglie
//   data-materiale="ext"   su <linearGradient> gli <stop> vengono dal materiale scelto
//   data-texture="aspenT"  su <pattern>        l'<image> prende sempre quella texture
//   display="none"                            l'elemento è nascosto nel file grezzo (scelte predefinite)
//
// componiVista(svg, scelte, gruppi, href, { prefisso })
//   svg       testo del file base
//   scelte    { wood: "wenge", floor: "moka" }
//   gruppi    optionGroups del manifest (ogni opzione può avere texture e gradienti)
//   href      (idTexture) => stringa da mettere in href (URL o data URI)
//   prefisso  anteposto a ogni id e a ogni url(#…). Senza, se ne genera uno unico a ogni chiamata:
//             più SVG inline nella stessa pagina condividono gli id, e senza prefisso
//             un url(#g) prenderebbe il gradiente di un'altra vista. Con '' gli id restano quelli del file.

// Nome del file di una texture: nel manifest `texture` è l'id ("rovere", file rovere.png)
// oppure il nome con l'estensione ("rovere.jpg"), per le foto ufficiali in JPG.
export const fileTexture = (id) => (/\.(png|jpe?g|webp)$/i.test(id) ? id : `${id}.png`);
export const tipoTexture = (id) => ({ jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp' })[fileTexture(id).split('.').pop().toLowerCase()] ?? 'image/png';

const attrRe = (name) => new RegExp(`\\s${name}="([^"]*)"`);
let contatore = 0;

function prefissaId(svg, p) {
  if (!p) return svg;
  return svg
    .replace(/\sid="([^"]+)"/g, ` id="${p}$1"`)
    .replace(/url\(#([^)]+)\)/g, `url(#${p}$1)`)
    .replace(/(\s(?:xlink:)?href=")#([^"]+)"/g, `$1#${p}$2"`);
}

function opzione(gruppi, gruppo, scelte) {
  const g = gruppi.find((x) => x.id === gruppo);
  if (!g) throw new Error(`Gruppo sconosciuto: ${gruppo}`);
  const v = scelte[gruppo] ?? g.options[0].id;
  const o = g.options.find((x) => x.id === v);
  if (!o) throw new Error(`Valore sconosciuto: ${gruppo}=${v}`);
  return o;
}

export function componiVista(svg, scelte, gruppi, href, { prefisso } = {}) {
  const p = prefisso ?? `v${++contatore}-`;
  return prefissaId(componi(svg, scelte, gruppi, href), p);
}

function componi(svg, scelte, gruppi, href) {
  const valore = (g) => opzione(gruppi, g, scelte).id;
  const righe = [];
  for (let riga of svg.split('\n')) {
    // presenza condizionata
    const se = riga.match(attrRe('data-se'));
    if (se) {
      const [g, lista] = se[1].split(':');
      if (!lista.split(',').includes(valore(g))) continue;
      riga = riga.replace(se[0], '').replace(/\sdisplay="none"/, '');
    }
    // attributi che dipendono da una scelta
    for (const m of [...riga.matchAll(/\sdata-per-([a-z-]+)="([^"]*)"/g)]) {
      const [g, coppie] = m[2].split(':');
      const mappa = Object.fromEntries(coppie.split(',').map((c) => c.split('=')));
      const v = mappa[valore(g)];
      riga = riga.replace(m[0], '');
      riga = v === undefined
        ? riga.replace(attrRe(m[1]), '')
        : riga.replace(attrRe(m[1]), ` ${m[1]}="${v}"`);
    }
    // pattern con una texture fissa (non dipende dalle scelte)
    const fissa = riga.match(attrRe('data-texture'));
    if (fissa) riga = riga.replace(fissa[0], '').replace(/(<image[^>]*\shref=")[^"]*"/, `$1${href(fissa[1])}"`);
    // definizioni che dipendono da un materiale
    const mat = riga.match(attrRe('data-materiale'));
    if (mat) {
      const o = opzione(gruppi, mat[1], scelte);
      riga = riga.replace(mat[0], '');
      if (riga.startsWith('<pattern')) {
        if (!o.texture) continue;
        riga = riga.replace(/(<image[^>]*\shref=")[^"]*"/, `$1${href(o.texture)}"`);
      } else if (riga.startsWith('<linearGradient')) {
        const id = riga.match(attrRe('id'))[1];
        const stop = o.gradienti?.[id];
        if (!stop) throw new Error(`Manca il gradiente ${id} per ${mat[1]}=${o.id}`);
        riga = riga.replace(/>[\s\S]*<\/linearGradient>/, `>${stop}</linearGradient>`);
      }
    }
    righe.push(riga);
  }
  return righe.join('\n');
}
