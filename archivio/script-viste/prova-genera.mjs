// Prova: FBX -> viste SVG a zone (ext, front, plan). I file nativi restano fuori dal repository.
import fs from 'fs';
globalThis.self = globalThis; globalThis.window = globalThis;
globalThis.document = { createElementNS: () => ({ style: {}, addEventListener() {}, removeEventListener() {} }), createElement: () => ({ style: {}, getContext: () => null }) };
const THREE = await import('three');
const { FBXLoader } = await import('three/examples/jsm/loaders/FBXLoader.js');
const { Resvg } = await import('@resvg/resvg-js');
const [, , file, outDir] = process.argv;
const buf = fs.readFileSync(file);
const root = new FBXLoader().parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength), '');
root.updateMatrixWorld(true);
let mesh; root.traverse(o => { if (o.isMesh) mesh = o; });
const g = mesh.geometry, P = g.attributes.position, FT = 30.48, T = P.count / 3;

// vertici in cm
const V = new Float64Array(P.count * 3);
{ const v = new THREE.Vector3(); for (let i = 0; i < P.count; i++) { v.fromBufferAttribute(P, i).applyMatrix4(mesh.matrixWorld); V[3 * i] = v.x * FT; V[3 * i + 1] = v.y * FT; V[3 * i + 2] = v.z * FT; } }
const matOf = new Int8Array(T);
for (const gr of g.groups) for (let i = gr.start / 3; i < (gr.start + gr.count) / 3; i++) matOf[i] = gr.materialIndex;

// componenti connesse
const id = new Map(), vid = new Int32Array(P.count);
for (let i = 0; i < P.count; i++) { const k = Math.round(V[3 * i] * 20) + ',' + Math.round(V[3 * i + 1] * 20) + ',' + Math.round(V[3 * i + 2] * 20); if (!id.has(k)) id.set(k, id.size); vid[i] = id.get(k); }
const par = Int32Array.from({ length: id.size }, (_, i) => i);
const find = x => { while (par[x] !== x) { par[x] = par[par[x]]; x = par[x]; } return x; };
for (let t = 0; t < T; t++) { const a = find(vid[3 * t]); par[find(vid[3 * t + 1])] = a; par[find(vid[3 * t + 2])] = a; }
const bb = () => ({ min: [1e9, 1e9, 1e9], max: [-1e9, -1e9, -1e9] });
const grow = (b, i) => { for (let k = 0; k < 3; k++) { b.min[k] = Math.min(b.min[k], V[3 * i + k]); b.max[k] = Math.max(b.max[k], V[3 * i + k]); } };
const all = bb(); for (let i = 0; i < P.count; i++) grow(all, i);
const comp = new Map(), compOf = new Int32Array(T);
for (let t = 0; t < T; t++) { const r = find(vid[3 * t]); compOf[t] = r; let c = comp.get(r); if (!c) comp.set(r, c = bb()); for (let j = 0; j < 3; j++) grow(c, 3 * t + j); }
const size = b => b.max.map((m, k) => m - b.min[k]);

// classificazione delle zone (regole specifiche del modello: qui Yoku S 60)
const CLS = ['ext', 'int', 'bench', 'floor', 'stove', 'metal', 'glass'];
const cls = new Int8Array(T);
for (let t = 0; t < T; t++) {
  const m = matOf[t], c = comp.get(compOf[t]), s = size(c); let z;
  if (m === 1) z = 'stove'; else if (m === 4) z = 'floor'; else if (m === 0) z = 'metal'; else if (m === 3) z = 'glass';
  else {
    const shell = s[0] > 0.9 * (all.max[0] - all.min[0]) && s[2] > 0.9 * (all.max[2] - all.min[2]);
    if (shell) {
      const cx = [0, 0, 0]; for (let j = 0; j < 3; j++) for (let k = 0; k < 3; k++) cx[k] += V[3 * (3 * t + j) + k] / 3;
      const onOuter = [0, 1, 2].some(k => Math.abs(cx[k] - all.min[k]) < 1.5 || Math.abs(cx[k] - all.max[k]) < 1.5);
      z = onOuter ? 'ext' : 'int';
    } else if (c.max[2] < 110 && s[0] > 15 && c.min[1] > all.min[1] + 25) z = 'bench';
    else if (c.min[1] < all.min[1] + 25) z = 'ext'; else z = 'int';
  }
  cls[t] = CLS.indexOf(z);
}
const stat = {}; for (let t = 0; t < T; t++) stat[CLS[cls[t]]] = (stat[CLS[cls[t]]] || 0) + 1; console.log('zone', stat);

// viste
const ctr = [0, 1, 2].map(k => (all.min[k] + all.max[k]) / 2), dim = size(all), R = Math.hypot(...dim) / 2;
function camera(view) {
  if (view === 'ext') {
    const c = new THREE.PerspectiveCamera(28, 1, 10, 5000); c.up.set(0, 0, 1);
    const d = R / Math.sin(14 * Math.PI / 180) * 1.05; const dir = new THREE.Vector3(0.62, -1, 0.42).normalize();
    c.position.set(ctr[0] + dir.x * d, ctr[1] + dir.y * d, ctr[2] + dir.z * d); c.lookAt(ctr[0], ctr[1], ctr[2]);
    c.updateMatrixWorld(); c.updateProjectionMatrix(); return c;
  }
  const h = view === 'front' ? Math.max(dim[0], dim[2]) * 0.56 : Math.max(dim[0], dim[1]) * 0.56;
  const c = new THREE.OrthographicCamera(-h, h, h, -h, 1, 5000);
  if (view === 'front') { c.up.set(0, 0, 1); c.position.set(ctr[0], ctr[1] - 1000, ctr[2]); } else { c.up.set(0, 1, 0); c.position.set(ctr[0], ctr[1], ctr[2] + 1000); }
  c.lookAt(ctr[0], ctr[1], ctr[2]); c.updateMatrixWorld(); c.updateProjectionMatrix(); return c;
}
const LIGHT = new THREE.Vector3(0.35, -0.55, 0.76).normalize();
const SH = [0, .06, .13, .21, .30, .40];
function render(view, W) {
  const cam = camera(view), H = W, pv = new THREE.Matrix4().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse);
  const lab = new Int16Array(W * H).fill(-1), zb = new Float32Array(W * H).fill(Infinity), glass = new Uint8Array(W * H);
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), n = new THREE.Vector3(), e1 = new THREE.Vector3(), e2 = new THREE.Vector3(), toCam = new THREE.Vector3(), q = new THREE.Vector3();
  const pts = [a, b, c], sp = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (const pass of [0, 1]) for (let t = 0; t < T; t++) {
    const isG = CLS[cls[t]] === 'glass'; if ((pass === 1) !== isG) continue;
    for (let j = 0; j < 3; j++) pts[j].set(V[9 * t + 3 * j], V[9 * t + 3 * j + 1], V[9 * t + 3 * j + 2]);
    if (view === 'plan' && Math.min(a.z, b.z, c.z) > 100) continue;
    e1.subVectors(b, a); e2.subVectors(c, a); n.crossVectors(e1, e2); if (n.lengthSq() < 1e-9) continue; n.normalize();
    if (cam.isPerspectiveCamera) toCam.subVectors(cam.position, a); else toCam.set(0, 0, 1).applyQuaternion(cam.quaternion);
    if (n.dot(toCam) < 0) n.negate();
    const lum = Math.max(0, n.dot(LIGHT)); const sh = Math.min(5, Math.round((1 - lum) * 5));
    const label = cls[t] * 8 + sh;
    for (let j = 0; j < 3; j++) { q.copy(pts[j]).applyMatrix4(pv); sp[j][0] = (q.x * .5 + .5) * W; sp[j][1] = (1 - (q.y * .5 + .5)) * H; sp[j][2] = q.z; }
    const minx = Math.max(0, Math.floor(Math.min(sp[0][0], sp[1][0], sp[2][0]))), maxx = Math.min(W - 1, Math.ceil(Math.max(sp[0][0], sp[1][0], sp[2][0])));
    const miny = Math.max(0, Math.floor(Math.min(sp[0][1], sp[1][1], sp[2][1]))), maxy = Math.min(H - 1, Math.ceil(Math.max(sp[0][1], sp[1][1], sp[2][1])));
    const [x0, y0, z0] = sp[0], [x1, y1, z1] = sp[1], [x2, y2, z2] = sp[2]; const den = (y1 - y2) * (x0 - x2) + (x2 - x1) * (y0 - y2); if (Math.abs(den) < 1e-9) continue;
    for (let y = miny; y <= maxy; y++) for (let x = minx; x <= maxx; x++) {
      const px = x + .5, py = y + .5;
      const w0 = ((y1 - y2) * (px - x2) + (x2 - x1) * (py - y2)) / den, w1 = ((y2 - y0) * (px - x2) + (x0 - x2) * (py - y2)) / den, w2 = 1 - w0 - w1;
      if (w0 < -1e-4 || w1 < -1e-4 || w2 < -1e-4) continue; const z = w0 * z0 + w1 * z1 + w2 * z2, i = y * W + x;
      if (pass === 0) { if (z < zb[i] - 1e-6) { zb[i] = z; lab[i] = label; } } else if (z < zb[i]) glass[i] = 1;
    }
  }
  return { lab, glass, W, H };
}

// contorni: bordi tra pixel -> anelli -> semplificazione
function trace(mask, W, H, eps) {
  const nxt = new Map(); const K = (x, y) => y * (W + 1) + x;
  const add = (x0, y0, x1, y1) => { const k = K(x0, y0); let l = nxt.get(k); if (!l) nxt.set(k, l = []); l.push([x1, y1]); };
  const at = (x, y) => x >= 0 && y >= 0 && x < W && y < H && mask[y * W + x];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (!mask[y * W + x]) continue;
    if (!at(x, y - 1)) add(x, y, x + 1, y); if (!at(x + 1, y)) add(x + 1, y, x + 1, y + 1); if (!at(x, y + 1)) add(x + 1, y + 1, x, y + 1); if (!at(x - 1, y)) add(x, y + 1, x, y);
  }
  const loops = [];
  for (const [k0, l0] of nxt) {
    while (l0.length) {
      let x = k0 % (W + 1), y = (k0 - x) / (W + 1); const sx = x, sy = y; const loop = []; let guard = 0;
      do { loop.push([x, y]); const l = nxt.get(K(x, y)); if (!l || !l.length) break; const p = l.pop(); x = p[0]; y = p[1]; } while ((x !== sx || y !== sy) && ++guard < 4e6);
      if (loop.length >= 4) loops.push(loop);
    }
  }
  const out = [];
  for (const lp of loops) {
    let ar = 0; for (let i = 0; i < lp.length; i++) { const p = lp[i], q = lp[(i + 1) % lp.length]; ar += p[0] * q[1] - q[0] * p[1]; }
    if (Math.abs(ar) / 2 < 8) continue; out.push(dp(lp, eps));
  }
  return out;
}
function dp(pts, eps) { // anello chiuso: si spezza nel punto opposto al primo
  let far = 0, d0 = 0; for (let i = 1; i < pts.length; i++) { const d = (pts[i][0] - pts[0][0]) ** 2 + (pts[i][1] - pts[0][1]) ** 2; if (d > d0) { d0 = d; far = i; } }
  const A = pts.slice(0, far + 1), B = pts.slice(far).concat([pts[0]]); return rdp(A, eps).slice(0, -1).concat(rdp(B, eps).slice(0, -1));
}
function rdp(p, eps) {
  const keep = new Uint8Array(p.length); keep[0] = keep[p.length - 1] = 1; const st = [[0, p.length - 1]];
  while (st.length) {
    const [i, j] = st.pop(); let m = -1, dm = eps; const ax = p[i][0], ay = p[i][1], bx = p[j][0] - ax, by = p[j][1] - ay, L = Math.hypot(bx, by) || 1;
    for (let k = i + 1; k < j; k++) { const d = Math.abs((p[k][0] - ax) * by - (p[k][1] - ay) * bx) / L; if (d > dm) { dm = d; m = k; } }
    if (m > 0) { keep[m] = 1; st.push([i, m], [m, j]); }
  }
  return p.filter((_, i) => keep[i]);
}
const BASE = { ext: '#6b4a36', int: '#a67c52', bench: '#b98c60', floor: '#8f8a84', stove: '#3a3a3c', metal: '#8a8d91' };
const mix = (hex, p) => '#' + [1, 3, 5].map(i => Math.round(parseInt(hex.substr(i, 2), 16) * (1 - p)).toString(16).padStart(2, '0')).join('');
const report = [];
for (const view of ['ext', 'front', 'plan']) {
  const W = 1400, { lab, glass, H } = render(view, W); const labels = [...new Set(lab)].filter(l => l >= 0).sort((a, b) => a - b);
  let body = '', npts = 0;
  for (const l of labels) {
    const m = new Uint8Array(W * H); for (let i = 0; i < m.length; i++) m[i] = lab[i] === l ? 1 : 0; const loops = trace(m, W, H, 1.1); if (!loops.length) continue;
    const z = CLS[l >> 3], sh = l & 7, col = mix(BASE[z], SH[sh]); npts += loops.reduce((s, q) => s + q.length, 0);
    body += `<path data-zone="${z}" data-shade="${sh}" fill="${col}" stroke="${col}" stroke-width="1" stroke-linejoin="round" fill-rule="evenodd" d="${loops.map(q => 'M' + q.map(p => p.join(',')).join('L') + 'Z').join('')}"/>`;
  }
  const gl = trace(glass, W, H, 1.1);
  if (gl.length) body += `<path data-zone="glass" fill="#cfe4ee" fill-opacity=".28" fill-rule="evenodd" d="${gl.map(q => 'M' + q.map(p => p.join(',')).join('L') + 'Z').join('')}"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#efede9"/>${body}</svg>`;
  fs.writeFileSync(`${outDir}/${view}.svg`, svg);
  fs.writeFileSync(`${outDir}/${view}.png`, new Resvg(svg, { fitTo: { mode: 'width', value: 800 } }).render().asPng());
  report.push(`${view}: ${labels.length} zone/ombre, ${npts} punti, ${(svg.length / 1024).toFixed(0)} KB`);
}
console.log(report.join('\n'));
