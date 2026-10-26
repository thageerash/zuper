(function () {
if (customElements.get('glass-intro')) return;
const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js';
const BASE = {
  TL: [0, 0, 'c'], TR: [1, 0, 'c'], BR: [1, 1, 'c'], BL: [0, 1, 'c'],
  tAB: [.22, 0, 't'], tBC: [.515, 0, 't'], tCE: [.84, 0, 't'], bAD: [.34, 1, 'b'], bDE: [.865, 1, 'b'],
  J0: [.385, .72, 'j'], J1: [.48, .62, 'j'], J2: [.716, .49, 'j']
};
const CELLS = [['TL','tAB','J0','bAD','BL'], ['tAB','tBC','J1','J0'], ['tBC','tCE','J2','J1'], ['J0','J1','J2','bDE','bAD'], ['tCE','TR','BR','bDE','J2']];
const PH = {}; Object.keys(BASE).forEach((k, i) => { PH[k] = { px: 10 + (i * 3.7) % 10, py: 12 + (i * 5.3) % 8, ox: i * 1.9, oy: i * 2.7 }; });
const rnd = (a, b) => a + Math.random() * (b - a);
const easeIn = p => p * p * p;
const easeOutBack = p => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); };

class GlassIntro extends HTMLElement {
  connectedCallback() {
    this.style.cssText += ';display:block;position:absolute;inset:0;z-index:2;cursor:pointer;outline:none';
    this.setAttribute('role', 'button'); this.setAttribute('tabindex', '0');
    this.setAttribute('aria-label', 'Zuper design assignment. Open assignment');
    const rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let ok = false; try { ok = !!document.createElement('canvas').getContext('webgl2'); } catch (e) {}
    if (rm || !ok) { this.style.display = 'none'; return; }
    this.style.background = '#0A0908';
    this.init().catch(e => { console.warn('glass-intro', e); this.style.display = 'none'; });
  }
  disconnectedCallback() {
    this.dead = true; cancelAnimationFrame(this.raf);
    this.ro && this.ro.disconnect();
    window.removeEventListener('pointermove', this.onMove);
    document.removeEventListener('pointerleave', this.onLeave);
    this.R && this.R.dispose();
  }
  async init() {
    const T = this.T = await import(THREE_URL);
    await Promise.all(['800 40px Manrope', '700 40px Manrope', '500 16px Manrope', '600 16px Manrope', '600 12px "IBM Plex Mono"'].map(f => document.fonts.load(f))).catch(() => {});
    this.logo = await new Promise(r => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = 'assets/zuper-logo.png'; });
    if (this.dead) return;
    const R = this.R = new T.WebGLRenderer({ antialias: true });
    R.setPixelRatio(Math.min(devicePixelRatio, 2));
    R.toneMapping = T.ACESFilmicToneMapping; R.outputColorSpace = T.SRGBColorSpace; R.setClearColor(0x0A0908, 1);
    R.domElement.style.cssText = 'display:block;width:100%;height:100%';
    this.appendChild(R.domElement);
    const scene = this.scene = new T.Scene();
    const pm = new T.PMREMGenerator(R);
    scene.environment = pm.fromScene(this.room(T), 0.04).texture;
    scene.environmentIntensity = .42;
    const key = new T.DirectionalLight(0xEEF2FF, 1.6); key.position.set(-1, 1.3, 1.6); scene.add(key);
    this.cam = new T.PerspectiveCamera(30, 1, 1, 20000);
    this.slab = new T.Group(); scene.add(this.slab);
    this.U = { uPtr: { value: new T.Vector3(0, 0, 0) }, uGlow: { value: 0 }, uS: { value: 1 } };
    this.ray = new T.Raycaster(); this.ndc = new T.Vector2(); this.ptr = { x: 0, y: 0, in: false };
    this.tilt = { x: 0, y: 0 }; this.time = 0; this.mode = 'in'; this.t = 0; this.pill = false;
    this.onMove = e => { const r = this.getBoundingClientRect(); this.ptr.x = (e.clientX - r.left) / r.width * 2 - 1; this.ptr.y = -((e.clientY - r.top) / r.height * 2 - 1); this.ptr.in = true; };
    this.onLeave = () => { this.ptr.in = false; };
    window.addEventListener('pointermove', this.onMove);
    document.addEventListener('pointerleave', this.onLeave);
    this.addEventListener('click', e => { e.stopPropagation(); this.shatter(); });
    this.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); this.shatter(); } });
    this.ro = new ResizeObserver(() => this.layout()); this.ro.observe(this);
    this.layout();
    this.dispatchEvent(new CustomEvent('glass-ready', { bubbles: true, composed: true }));
    let last = performance.now();
    const loop = now => { if (this.dead) return; this.raf = requestAnimationFrame(loop); const dt = Math.min(.05, (now - last) / 1000); last = now; this.frame(dt, now); };
    this.raf = requestAnimationFrame(loop);
  }
  room(T) {
    const s = new T.Scene();
    s.add(new T.Mesh(new T.BoxGeometry(10, 10, 10), new T.MeshBasicMaterial({ color: 0x1c1c20, side: T.BackSide })));
    const L = (w, h, x, y, z, rx, ry, i, tint) => { const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: new T.Color(i, i * (tint ? .97 : 1), i * (tint ? 1.08 : 1)), side: T.DoubleSide })); m.position.set(x, y, z); m.rotation.set(rx, ry, 0); s.add(m); };
    L(6, 1.4, -1.5, 4.9, 1, Math.PI / 2, 0, 9, 1); L(1.3, 5, -4.9, 1.5, 0.5, 0, Math.PI / 2, 5); L(3.5, 3, 3, 1, -4.9, 0, 0, 2.2, 1); L(5, .7, 1, -2.5, 4.9, 0, Math.PI, 3);
    return s;
  }
  layout() {
    const T = this.T, W = this.clientWidth, H = this.clientHeight; if (!W || !H) return;
    this.W = W; this.H = H;
    this.R.setSize(W, H, false);
    const cam = this.cam; cam.aspect = W / H; cam.position.set(0, 0, (H / 2) / Math.tan(15 * Math.PI / 180)); cam.near = 10; cam.far = cam.position.z * 4; cam.updateProjectionMatrix();
    const phone = W < 700, mx = phone ? 16 : W * .055, my = phone ? 16 : H * .085;
    const bw = W - 2 * mx, bh = H - 2 * my, S = Math.max(bw / 1730, .3);
    this.portrait = H > W;
    Object.assign(this, { bw, bh, S, navH: Math.max(56, bh * .108) });
    this.panel = { x0: -bw / 2, top: bh / 2 - this.navH - 14, w: bw, bottom: -bh / 2 }; this.panel.h = this.panel.top - this.panel.bottom;
    this.U.uS.value = S;
    this.drawCanvas();
    (this.pieces || []).forEach(p => { this.slab.remove(p.g); p.glass.geometry.dispose(); p.print.geometry.dispose(); p.mat.dispose(); });
    this.pieces = [];
    const g = 7 * S;
    const nav = [[-bw / 2, bh / 2], [bw / 2, bh / 2], [bw / 2, bh / 2 - this.navH], [-bw / 2, bh / 2 - this.navH]];
    this.addPiece('nav', nav, g);
    const P = this.points(false);
    CELLS.forEach((c, i) => this.addPiece('cell', c.map(k => P[k]), g, i));
    this.lastBuild = 0;
  }
  points(live) {
    const out = {}, pn = this.panel;
    let pu = 0, pv = 0, act = false;
    if (live && this.hit) { pu = this.hit.u; pv = this.hit.v; if (this.portrait) [pu, pv] = [pv, pu]; act = true; }
    for (const k in BASE) {
      let [x, y, t] = BASE[k];
      if (live) {
        const ph = PH[k], tm = this.time;
        if (t !== 'c') x += .03 * Math.sin(tm * 2 * Math.PI / ph.px + ph.ox);
        if (t === 'j') y += .05 * Math.sin(tm * 2 * Math.PI / ph.py + ph.oy);
        if (act && t !== 'c') { const d = Math.hypot(x - pu, y - pv); if (d < .6 && d > 1e-4) { const f = .05 * (1 - d / .6); x += (x - pu) / d * f; if (t === 'j') y += (y - pv) / d * f; } }
        if (t !== 'c') x = Math.min(.95, Math.max(.05, x));
      }
      if (this.portrait) [x, y] = [y, x];
      out[k] = [pn.x0 + x * pn.w, pn.top - y * pn.h];
    }
    return out;
  }
  inset(pts, d) {
    const n = pts.length; let a = 0;
    for (let i = 0; i < n; i++) { const p = pts[i], q = pts[(i + 1) % n]; a += p[0] * q[1] - q[0] * p[1]; }
    const s = a > 0 ? 1 : -1, L = [];
    for (let i = 0; i < n; i++) { const p = pts[i], q = pts[(i + 1) % n], dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy) || 1; L.push([p[0] - dy / l * s * d, p[1] + dx / l * s * d, dx, dy]); }
    return L.map((l2, i) => { const l1 = L[(i - 1 + n) % n], cr = l1[2] * l2[3] - l1[3] * l2[2]; if (Math.abs(cr) < 1e-6) return [l2[0], l2[1]]; const t = ((l2[0] - l1[0]) * l2[3] - (l2[1] - l1[1]) * l2[2]) / cr; return [l1[0] + t * l1[2], l1[1] + t * l1[3]]; });
  }
  shape(pts, r, cx, cy) {
    const T = this.T, sh = new T.Shape(), n = pts.length;
    for (let i = 0; i < n; i++) {
      const c = pts[i], p = pts[(i - 1 + n) % n], q = pts[(i + 1) % n];
      const lp = Math.hypot(p[0] - c[0], p[1] - c[1]), lq = Math.hypot(q[0] - c[0], q[1] - c[1]), rr = Math.min(r, lp / 2.2, lq / 2.2);
      const ax = c[0] + (p[0] - c[0]) / lp * rr, ay = c[1] + (p[1] - c[1]) / lp * rr, bx = c[0] + (q[0] - c[0]) / lq * rr, by = c[1] + (q[1] - c[1]) / lq * rr;
      if (i === 0) sh.moveTo(ax - cx, ay - cy); else sh.lineTo(ax - cx, ay - cy);
      sh.quadraticCurveTo(c[0] - cx, c[1] - cy, bx - cx, by - cy);
    }
    sh.closePath(); return sh;
  }
  geos(pts, p) {
    const T = this.T, S = this.S, bev = 2.6 * S;
    const sh = this.shape(this.inset(pts, 7 * S + bev), 20 * S, p.cx, p.cy);
    const glass = new T.ExtrudeGeometry(sh, { depth: 13 * S, bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelSegments: 3, curveSegments: 5 });
    const print = new T.ShapeGeometry(sh, 5), pos = print.attributes.position, uv = new Float32Array(pos.count * 2);
    for (let i = 0; i < pos.count; i++) { uv[i * 2] = (pos.getX(i) + p.cx + this.bw / 2) / this.bw; uv[i * 2 + 1] = (pos.getY(i) + p.cy + this.bh / 2) / this.bh; pos.setZ(i, 13 * S + bev + .4); }
    print.setAttribute('uv', new T.BufferAttribute(uv, 2));
    return { glass, print };
  }
  mkMat() {
    const T = this.T, U = this.U;
    const m = new T.MeshPhysicalMaterial({ color: 0x17171b, roughness: .36, clearcoat: .7, clearcoatRoughness: .12, specularIntensity: .7, iridescence: .55, iridescenceIOR: 1.3, iridescenceThicknessRange: [250, 650], envMapIntensity: 1 });
    m.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, U);
      sh.vertexShader = 'varying vec3 vWP;\n' + sh.vertexShader.replace('#include <project_vertex>', '#include <project_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.0)).xyz;');
      sh.fragmentShader = 'uniform vec3 uPtr; uniform float uGlow; uniform float uS; varying vec3 vWP;\n' + sh.fragmentShader.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n{ float gd = distance(vWP.xy, uPtr.xy) / (300.0 * uS); totalEmissiveRadiance += vec3(.42, .37, .62) * .16 * uGlow * exp(-1.6 * gd * gd); }');
    };
    m.customProgramCacheKey = () => 'glass-glow';
    return m;
  }
  addPiece(kind, pts, g, idx) {
    const T = this.T; let cx = 0, cy = 0; pts.forEach(p => { cx += p[0]; cy += p[1]; }); cx /= pts.length; cy /= pts.length;
    const p = { kind, idx, cx, cy, z: 0, vz: 0, rx: 0, vrx: 0, ry: 0, vry: 0, h: 0 };
    const { glass, print } = this.geos(pts, p);
    p.mat = this.mkMat();
    p.glass = new T.Mesh(glass, p.mat);
    p.print = new T.Mesh(print, this.printMat); p.print.renderOrder = 1; p.print.userData.piece = p;
    p.g = new T.Group(); p.g.add(p.glass, p.print); p.g.position.set(cx, cy, 0); this.slab.add(p.g);
    let dx = cx, dy = cy; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
    const S = this.S;
    p.v = new T.Vector3(dx * rnd(260, 520) * S, dy * rnd(200, 420) * S - 160 * S, rnd(420, 800) * S);
    p.axis = new T.Vector3(rnd(-1, 1), rnd(-1, 1), rnd(-.4, .4)).normalize(); p.ang = rnd(2, 3.6);
    p.delay = kind === 'nav' ? 0 : .05 + (idx || 0) * .045;
    p.hs = Math.sqrt(Math.abs(this.area(pts))) / 2;
    this.pieces.push(p);
  }
  area(pts) { let a = 0; for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; a += p[0] * q[1] - q[0] * p[1]; } return a / 2; }
  drawCanvas() {
    const T = this.T, bw = this.bw, bh = this.bh, S = this.S;
    const k = Math.min(Math.max(1.5, devicePixelRatio || 1), 4096 / Math.max(bw, bh));
    const cv = this.cv || (this.cv = document.createElement('canvas'));
    cv.width = Math.round(bw * k); cv.height = Math.round(bh * k);
    const x = cv.getContext('2d'); x.setTransform(k, 0, 0, k, 0, 0); x.clearRect(0, 0, bw, bh);
    const sp = (px) => { try { x.letterSpacing = px + 'px'; } catch (e) {} };
    const nh = this.navH, pad = Math.max(20, 40 * S);
    // nav
    const ls = nh * .46; const ly = (nh - ls) / 2;
    x.fillStyle = '#FFFFFF'; x.beginPath(); x.roundRect(pad, ly, ls, ls, ls * .26); x.fill();
    if (this.logo) { const s = ls * .72; x.drawImage(this.logo, pad + (ls - s) / 2, ly + (ls - s) / 2, s, s); }
    x.textBaseline = 'middle'; x.fillStyle = '#F2EFE9'; x.font = `800 ${nh * .26}px Manrope`; sp(nh * .26 * .06);
    x.fillText('ZUPER', pad + ls + nh * .2, nh / 2 + 1);
    x.textAlign = 'right'; x.font = `600 ${Math.max(13, nh * .19)}px Manrope`; sp(0); x.fillStyle = 'rgba(242,239,233,.62)';
    x.fillText('Thageer Ashraf', bw - pad, nh / 2 + 1); x.textAlign = 'left';
    // panel: brand mark only
    const top = nh + 14, ph = bh - top;
    const L = this.portrait ? Math.min(ph * .1, bw * .24) : Math.min(ph * .26, bw * .12);
    const cx = this.portrait ? bw * .3 : pad * 1.6 + L / 2, cy = this.portrait ? top + ph * .1 + L / 2 : top + ph * .3 + L / 2;
    x.fillStyle = '#FFFFFF'; x.beginPath(); x.roundRect(cx - L / 2, cy - L / 2, L, L, L * .24); x.fill();
    if (this.logo) { const s2 = L * .72; x.drawImage(this.logo, cx - s2 / 2, cy - s2 / 2, s2, s2); }
    const ms = Math.max(12, 15 * S); x.font = `600 ${ms}px "IBM Plex Mono"`; sp(ms * .24); x.textAlign = this.portrait ? 'center' : 'left'; x.textBaseline = 'alphabetic';
    x.fillStyle = '#E8A25A'; x.fillText('DESIGN ASSIGNMENT', this.portrait ? cx : cx - L / 2, cy + L / 2 + ms * 2.6);
    const hs = Math.max(13, 15 * S); x.font = `600 ${hs}px Manrope`; sp(0);
    x.fillStyle = this.pill ? '#FFFFFF' : 'rgba(242,239,233,.5)';
    x.fillText('Click anywhere to open  →', cx, bh - pad * 1.1); x.textAlign = 'left';
    this.pillR = null;
    if (!this.tex) {
      this.tex = new T.CanvasTexture(cv); this.tex.colorSpace = T.SRGBColorSpace; this.tex.anisotropy = this.R.capabilities.getMaxAnisotropy();
      this.printMat = new T.MeshBasicMaterial({ map: this.tex, transparent: true, toneMapped: false, depthWrite: false });
    } else { this.tex.dispose(); this.tex.image = cv; this.tex.needsUpdate = true; }
  }
  wrap(x, text, w) { const out = []; let line = ''; text.split(' ').forEach(wd => { const t = line ? line + ' ' + wd : wd; if (x.measureText(t).width > w && line) { out.push(line); line = wd; } else line = t; }); if (line) out.push(line); return out; }
  shatter() {
    if (this.mode === 'out') return;
    this.mode = 'out'; this.t = 0; this.sent = false; this.hit = null;
    this.pieces.forEach(p => { p.g.updateMatrix(); });
  }
  frame(dt, now) {
    const T = this.T; this.time += dt; this.t += dt;
    const S = this.S, ptr = this.ptr;
    const tx = ptr.in && this.mode !== 'out' ? ptr.x : 0, ty = ptr.in && this.mode !== 'out' ? ptr.y : 0;
    const a = 1 - Math.exp(-dt / .3); this.tilt.x += (tx - this.tilt.x) * a; this.tilt.y += (ty - this.tilt.y) * a;
    const D = Math.PI / 180;
    this.slab.rotation.set(-this.tilt.y * 5.5 * D + .8 * D, this.tilt.x * 7 * D - 1.2 * D, 0);
    this.slab.updateMatrixWorld(true);
    // hit
    let hov = null; this.hit = null;
    if (ptr.in && this.mode === 'idle') {
      this.ndc.set(ptr.x, ptr.y); this.ray.setFromCamera(this.ndc, this.cam);
      const hits = this.ray.intersectObjects(this.pieces.map(p => p.print), false);
      if (hits.length) {
        const h = hits[0]; hov = h.object.userData.piece;
        const bx = h.uv.x * this.bw, byy = (1 - h.uv.y) * this.bh, top = this.navH + 14;
        this.hit = { u: bx / this.bw, v: (byy - top) / (this.bh - top), bx, by: byy, local: h.object.worldToLocal(h.point.clone()) };
      }
      const plane = new T.Plane(new T.Vector3(0, 0, 1), -15 * S), pt = new T.Vector3();
      if (this.ray.ray.intersectPlane(plane, pt)) this.U.uPtr.value.copy(pt);
    }
    this.U.uGlow.value += ((ptr.in && this.mode === 'idle' ? 1 : 0) - this.U.uGlow.value) * (1 - Math.exp(-dt / .25));
    const r = this.pillR, onPill = !!(this.hit && r && this.hit.bx > r.x && this.hit.bx < r.x + r.w && this.hit.by > r.y && this.hit.by < r.y + r.h);
    if (onPill !== this.pill) { this.pill = onPill; this.drawCanvas(); }
    // breathing rebuild
    if (this.mode === 'idle' && now - this.lastBuild > 22) {
      this.lastBuild = now; const P = this.points(true);
      this.pieces.forEach(p => { if (p.kind !== 'cell') return; const g = this.geos(CELLS[p.idx].map(k => P[k]), p); p.glass.geometry.dispose(); p.print.geometry.dispose(); p.glass.geometry = g.glass; p.print.geometry = g.print; });
    }
    // springs + fly
    const q = new T.Quaternion(), e = new T.Euler(); let allIn = true;
    this.pieces.forEach(p => {
      let tz = 0, trx = 0, try_ = 0;
      if (p === hov && this.hit) {
        tz = (p.kind === 'nav' ? 32 : 50) * S;
        const lx = this.hit.local.x, ly = this.hit.local.y, hs = p.kind === 'nav' ? this.bw / 2 : p.hs;
        const cl = v => Math.max(-1, Math.min(1, v));
        trx = -cl(ly / (p.kind === 'nav' ? this.navH / 2 : hs)) * (p.kind === 'nav' ? .12 : .24);
        try_ = cl(lx / hs) * (p.kind === 'nav' ? .04 : .24);
      }
      const st = (val, vel, tg) => { const acc = 170 * (tg - p[val]) - 19 * p[vel]; p[vel] += acc * dt; p[val] += p[vel] * dt; };
      st('z', 'vz', tz); st('rx', 'vrx', trx); st('ry', 'vry', try_);
      const hAmt = Math.max(0, Math.min(1, p.z / (50 * S)));
      p.mat.iridescence = .55 + .45 * hAmt; p.mat.envMapIntensity = 1 + .9 * hAmt;
      let u = 0;
      if (this.mode === 'in') { const pr = Math.max(0, Math.min(1, (this.t - p.delay * .7) / .72)); u = 1 - easeOutBack(pr); if (pr < 1) allIn = false; }
      else if (this.mode === 'out') { const pr = Math.max(0, Math.min(1, (this.t - p.delay) / .72)); u = easeIn(pr); }
      const tt = u * 1.1;
      p.g.position.set(p.cx + p.v.x * tt, p.cy + p.v.y * tt - .5 * 900 * S * tt * tt, p.z + p.v.z * tt);
      e.set(p.rx, p.ry, 0); q.setFromAxisAngle(p.axis, p.ang * u); p.g.quaternion.setFromEuler(e).premultiply(q);
    });
    if (this.mode === 'in' && allIn && this.t > .2) this.mode = 'idle';
    if (this.mode === 'out' && !this.sent && this.t > .3) { this.sent = true; this.dispatchEvent(new CustomEvent('glass-done', { bubbles: true, composed: true })); }
    this.style.cursor = this.mode === 'idle' ? 'pointer' : 'default';
    this.R.render(this.scene, this.cam);
  }
}
customElements.define('glass-intro', GlassIntro);
})();
