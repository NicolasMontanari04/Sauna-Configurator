// Applica a data/viste le correzioni note di correzioni.mjs.
//   node scripts/viste/correggi-viste.mjs
// Da rilanciare dopo converti-pacchetti.mjs e prima di vista-interna-cabanon.mjs.
import fs from 'node:fs';
import path from 'node:path';
import { applica } from './correzioni.mjs';

const dir = 'data/viste';
for (const set of fs.readdirSync(dir).filter((f) => fs.existsSync(path.join(dir, f, 'manifest.json')))) {
  const man = JSON.parse(fs.readFileSync(path.join(dir, set, 'manifest.json'), 'utf8'));
  for (const f of man.files) {
    const file = path.join(dir, set, f.path);
    const prima = fs.readFileSync(file, 'utf8');
    const dopo = applica(set, f.vista, prima);
    if (dopo !== prima) { fs.writeFileSync(file, dopo); console.log('corretto', path.join(set, f.path)); }
  }
}
