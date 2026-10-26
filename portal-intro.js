(function () {
if (customElements.get('portal-intro')) return;
const CSS = `
portal-intro{display:block;position:absolute;inset:0;z-index:2;overflow:hidden;background:#000;color:#fff;font-family:'Manrope',sans-serif;cursor:default}
portal-intro *{box-sizing:border-box}
portal-intro .pi-bg{position:absolute;inset:0;background:#0A0908 url(assets/oak/01.jpg) center/cover;clip-path:circle(0% at 50% 50%);transform:scale(1.12);transition:clip-path 1.6s cubic-bezier(.7,0,.2,1),transform 2.6s cubic-bezier(.16,1,.3,1)}
portal-intro.is-on .pi-bg{clip-path:circle(75% at 50% 50%);transform:none}
portal-intro .pi-dim{clip-path:circle(0% at 50% 50%);transition:clip-path 1.6s cubic-bezier(.7,0,.2,1)}
portal-intro.is-on .pi-dim{clip-path:circle(75% at 50% 50%)}
portal-intro .pi-dim{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(10,9,8,.62),rgba(10,9,8,.5) 40%,rgba(0,0,0,.92))}
portal-intro canvas{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
portal-intro .pi-logo{position:absolute;z-index:6;left:50%;top:50%;width:64px;height:64px;transform:translate(-50%,-50%);border-radius:18px;background:#fff url(assets/zuper-logo.png) center/72% no-repeat;box-shadow:0 20px 50px -12px rgba(0,0,0,.6);transition:left 1.8s cubic-bezier(.16,1,.3,1),top 1.8s cubic-bezier(.16,1,.3,1),width 1.8s cubic-bezier(.16,1,.3,1),height 1.8s cubic-bezier(.16,1,.3,1),border-radius 1.8s cubic-bezier(.16,1,.3,1),transform 1.8s cubic-bezier(.16,1,.3,1)}
portal-intro.is-on .pi-logo{left:clamp(18px,2.2vw,32px);top:clamp(18px,3.1vh,28px);width:38px;height:38px;border-radius:10px;transform:none}
portal-intro .pi-load{position:absolute;z-index:6;left:50%;top:calc(50% + 64px);transform:translateX(-50%);width:220px;display:flex;flex-direction:column;align-items:center;gap:14px;animation:piIn .8s cubic-bezier(.22,1,.36,1) .2s both}
portal-intro .pi-bar{width:100%;height:2px;border-radius:1px;background:rgba(255,255,255,.14);overflow:hidden}
portal-intro .pi-bar span{display:block;height:100%;width:100%;background:#fff;transform-origin:left;transform:scaleX(0)}
portal-intro .pi-msg{font-size:14px;font-weight:600;color:#fff;white-space:nowrap;transition:opacity .25s,transform .25s}
portal-intro .pi-msg.swap{opacity:0;transform:translateY(6px)}
portal-intro .pi-pct{font-family:'IBM Plex Mono',monospace;font-size:12px;font-weight:500;letter-spacing:.08em;color:rgba(255,255,255,.5);font-variant-numeric:tabular-nums}
portal-intro .pi-load.out{animation:piOut .6s cubic-bezier(.22,1,.36,1) both}
portal-intro .pi-logo.breathe{animation:piBreath 1.8s ease-in-out infinite}
@keyframes piBreath{0%,100%{box-shadow:0 0 0 0 rgba(255,255,255,.18),0 20px 50px -12px rgba(0,0,0,.6)}50%{box-shadow:0 0 0 14px rgba(255,255,255,0),0 20px 50px -12px rgba(0,0,0,.6)}}
@keyframes piIn{from{opacity:0;transform:translate(-50%,10px)}to{opacity:1;transform:translate(-50%,0)}}
@keyframes piOut{to{opacity:0;filter:blur(6px);transform:translate(-50%,-14px)}}
portal-intro .pi-chrome{position:absolute;z-index:4;opacity:0;transition:opacity .45s ease,filter .45s ease}
portal-intro.is-going .pi-chrome{opacity:0!important;filter:blur(8px);animation:none!important}
portal-intro .pi-head{left:calc(clamp(18px,2.2vw,32px) + 52px);right:clamp(18px,2.2vw,32px);top:clamp(18px,3.1vh,28px);height:38px;display:flex;align-items:center;justify-content:space-between;gap:16px}
portal-intro .pi-brand{font-weight:800;font-size:16px;letter-spacing:.06em}
portal-intro .pi-pill{height:38px;padding:0 18px;display:flex;align-items:center;border-radius:999px;border:1px solid rgba(255,255,255,.4);background:rgba(255,255,255,.1);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);font-size:14px;font-weight:600}
portal-intro.ready .pi-head{animation:piDown .9s cubic-bezier(.22,1,.36,1) .1s both}
portal-intro .pi-cap{left:50%;width:var(--pw);white-space:nowrap;display:flex;justify-content:space-between;align-items:center;font-size:14px;color:rgba(255,255,255,.78);transform:translateX(-50%)}
portal-intro .pi-cap strong{color:#fff;font-size:15px}
portal-intro.ready .pi-cap{animation:piCap .85s cubic-bezier(.22,1,.36,1) .5s both}
portal-intro{--pw:min(320px,31vw,calc((100vh - 330px) * .914))}
portal-intro .pi-hole{position:absolute;z-index:5;left:50%;top:50%;width:var(--pw);aspect-ratio:320/350;transform:translate(-50%,-54%);border-radius:90px;cursor:none;border:0;background:transparent;padding:0}
portal-intro .pi-foot{left:clamp(24px,4vw,58px);right:clamp(24px,3vw,44px);bottom:clamp(24px,3.4vh,32px);display:flex;justify-content:space-between;align-items:flex-end;gap:40px}
portal-intro .pi-word{font-weight:800;font-size:min(clamp(96px,17vw,250px),22vh);line-height:.74;letter-spacing:-.055em;margin:0 0 -.03em -.04em;opacity:0}
portal-intro.ready .pi-word{animation:piRise 1.05s cubic-bezier(.16,1,.3,1) .2s both}
portal-intro dl{width:min(420px,34vw);margin:0;font-size:15px}
portal-intro .pi-fact{display:grid;grid-template-columns:120px 1fr;gap:18px;padding:9px 0;border-bottom:1px solid rgba(255,255,255,.4);opacity:0}
portal-intro .pi-fact:last-child{border-bottom:0}
portal-intro .pi-fact dt{font-weight:700} portal-intro .pi-fact dd{margin:0;color:rgba(255,255,255,.85)}
portal-intro.ready .pi-fact{animation:piRise2 .72s cubic-bezier(.22,1,.36,1) both}
portal-intro.ready .pi-fact:nth-child(1){animation-delay:.5s} portal-intro.ready .pi-fact:nth-child(2){animation-delay:.64s} portal-intro.ready .pi-fact:nth-child(3){animation-delay:.78s}
portal-intro.ready .pi-foot,portal-intro.ready .pi-head,portal-intro.ready .pi-cap{opacity:1}
@keyframes piDown{from{opacity:0;filter:blur(8px);transform:translateY(-18px)}to{opacity:1;filter:blur(0);transform:none}}
@keyframes piCap{from{opacity:0;filter:blur(7px);transform:translate(-50%,22px)}to{opacity:1;filter:blur(0);transform:translate(-50%,0)}}
@keyframes piRise{from{opacity:0;filter:blur(12px);transform:translateY(42px)}to{opacity:1;filter:blur(0);transform:none}}
@keyframes piRise2{from{opacity:0;filter:blur(7px);transform:translateY(18px)}to{opacity:1;filter:blur(0);transform:none}}
portal-intro .pi-cur{position:absolute;z-index:9;left:0;top:0;width:1px;height:1px;pointer-events:none;opacity:0;transition:opacity .2s}
portal-intro .pi-cur.vis{opacity:1}
portal-intro .pi-dot,portal-intro .pi-orb{position:absolute;left:0;top:0;border-radius:50%;transform:translate(-50%,-50%)}
portal-intro .pi-dot{width:10px;height:10px;background:#fff}
portal-intro .pi-orb{width:36px;height:36px;border:1px solid #fff;background:rgba(255,255,255,.3);transition:transform .3s cubic-bezier(.22,1,.36,1)}
portal-intro .pi-cur.enter .pi-orb{transform:translate(-50%,-50%) scale(1.5)}
portal-intro .pi-lab{position:absolute;top:30px;left:0;transform:translate(-50%,-4px);font-size:14px;font-weight:600;white-space:nowrap;opacity:0;transition:opacity .2s,transform .3s cubic-bezier(.22,1,.36,1)}
portal-intro .pi-cur.enter .pi-lab{opacity:1;transform:translate(-50%,0)}
@media(max-width:900px){portal-intro{--pw:min(300px,48vw,calc((100vh - 330px) * .914))} portal-intro dl{width:43vw} portal-intro .pi-fact{grid-template-columns:96px 1fr}}
@media(max-width:640px){portal-intro{--pw:min(260px,66vw,calc((100vh - 400px) * .914))} portal-intro .pi-hole{top:44%;border-radius:70px} portal-intro .pi-foot{display:block;left:18px;right:18px;bottom:18px} portal-intro .pi-word{margin-bottom:18px} portal-intro dl{width:100%;font-size:13px} portal-intro .pi-pill{display:none}}
`;
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
class PortalIntro extends HTMLElement {
  connectedCallback() {
    if (!document.getElementById('pi-css')) { const s = document.createElement('style'); s.id = 'pi-css'; s.textContent = CSS; document.head.appendChild(s); }
    this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.innerHTML = `<div class="pi-bg"></div><div class="pi-dim"></div><canvas></canvas>
<div class="pi-logo" aria-hidden="true"></div>
<div class="pi-load" aria-live="polite"><span class="pi-bar"><span></span></span><span class="pi-msg">Loading the assignment</span><span class="pi-pct">0%</span></div>
<header class="pi-chrome pi-head"><span class="pi-brand">ZUPER</span><span class="pi-pill">Design assignment</span></header>
<div class="pi-chrome pi-cap"><span>Enter</span><span><span>[01]</span> <strong>Case study</strong></span></div>
<button class="pi-hole" type="button" aria-label="Enter the case study"></button>
<section class="pi-chrome pi-foot"><h1 class="pi-word">ZUPER</h1><dl>
<div class="pi-fact"><dt>Assignment</dt><dd>Roofing photo documentation</dd></div>
<div class="pi-fact"><dt>Scope</dt><dd>Crew app · Office web</dd></div>
<div class="pi-fact"><dt>Designer</dt><dd>Thageer Ashraf</dd></div></dl></section>
<div class="pi-cur"><span class="pi-orb"></span><span class="pi-dot"></span><span class="pi-lab">Enter</span></div>`;
    this.cv = this.querySelector('canvas'); this.ctx = this.cv.getContext('2d');
    this.hole = this.querySelector('.pi-hole'); this.cur = this.querySelector('.pi-cur');
    this.rot = { x: 0, y: 0, tx: 0, ty: 0 }; this.e = 0; this.mask = 0; this.busy = true;
    this.cp = { x: -100, y: -100 }; this.cc = { x: -100, y: -100 };
    this.img = new Image(); this.img.src = 'assets/cover-crew.jpg';
    this.onMove = ev => { const r = this.getBoundingClientRect(); const x = ev.clientX - r.left, y = ev.clientY - r.top; this.cp = { x, y }; this.cur.classList.add('vis'); if (!this.busy) { this.rot.ty = (x / r.width - .5) * 37.4; this.rot.tx = (y / r.height - .5) * -33; } };
    this.onLeave = () => { this.rot.tx = this.rot.ty = 0; this.cur.classList.remove('vis'); };
    this.addEventListener('pointermove', this.onMove); this.addEventListener('pointerleave', this.onLeave);
    this.hole.addEventListener('pointerenter', () => this.cur.classList.add('enter'));
    this.hole.addEventListener('pointerleave', () => this.cur.classList.remove('enter'));
    this.addEventListener('click', ev => { ev.stopPropagation(); if (ev.target === this.hole || this.ready) this.go(); });
    this.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); ev.stopPropagation(); this.go(); } });
    this.ro = new ResizeObserver(() => this.size()); this.ro.observe(this); this.size();
    this.dispatchEvent(new CustomEvent('glass-ready', { bubbles: true, composed: true }));
    let last = performance.now();
    const loop = now => { if (this.dead) return; this.raf = requestAnimationFrame(loop); const dt = Math.min(40, now - last); last = now; this.draw(dt); };
    this.raf = requestAnimationFrame(loop);
    this.preload();
  }
  disconnectedCallback() { this.dead = true; cancelAnimationFrame(this.raf); this.ro && this.ro.disconnect(); }
  size() { const d = Math.min(devicePixelRatio || 1, 2), W = this.clientWidth, H = this.clientHeight; this.W = W; this.H = H; this.cv.width = W * d; this.cv.height = H * d; this.ctx.setTransform(d, 0, 0, d, 0, 0); }
  anim(set, ms) { return new Promise(res => { const t0 = performance.now(); const f = now => { const p = Math.min(1, (now - t0) / ms); set(ease(p)); p < 1 && !this.dead ? requestAnimationFrame(f) : res(); }; requestAnimationFrame(f); }); }
  async preload() {
    const logo = this.querySelector('.pi-logo'), bar = this.querySelector('.pi-bar span'), msg = this.querySelector('.pi-msg'), pct = this.querySelector('.pi-pct');
    logo.classList.add('breathe');
    const lines = ['Loading the assignment', 'Gathering roof photos', 'Syncing crew uploads', 'Preparing the case study'];
    const dur = this.reduced ? 400 : 3200, t0 = performance.now(); let li = 0;
    const loaded = Promise.all(['assets/oak/01.jpg', 'assets/cover-crew.jpg', 'assets/zuper-logo.png'].map(src => new Promise(r => { const i = new Image(); i.onload = i.onerror = r; i.src = src; })));
    let done = false; loaded.then(() => done = true);
    await new Promise(res => { const f = now => { let p = Math.min(1, (now - t0) / dur); if (!done) p = Math.min(p, .9); const v = ease(p);
      bar.style.transform = 'scaleX(' + v + ')'; pct.textContent = Math.round(v * 100) + '%';
      const want = Math.min(lines.length - 1, Math.floor(p * lines.length));
      if (want !== li) { li = want; msg.classList.add('swap'); setTimeout(() => { msg.textContent = lines[li]; msg.classList.remove('swap'); }, 250); }
      (p < 1) ? requestAnimationFrame(f) : res(); }; requestAnimationFrame(f); });
    await new Promise(r => setTimeout(r, 300));
    this.querySelector('.pi-load').classList.add('out'); logo.classList.remove('breathe');
    logo.style.transition = 'transform .6s cubic-bezier(.22,1,.36,1), opacity .6s ease'; logo.style.transform = 'translate(-50%,-50%) scale(.85)'; logo.style.opacity = '0';
    await new Promise(r => setTimeout(r, 350));
    this.dispatchEvent(new CustomEvent('glass-done', { bubbles: true, composed: true }));
  }
  async go() {
    if (this.busy) return; this.busy = true; this.rot.tx = this.rot.ty = 0;
    this.classList.add('is-going'); this.cur.classList.remove('vis');
    await this.anim(v => this.e = v, 1100);
    this.dispatchEvent(new CustomEvent('glass-done', { bubbles: true, composed: true }));
  }
  path(ctx, cx, cy, w, h, r, rx, ry) {
    r = Math.min(r, w / 2, h / 2);
    const C = [[w / 2 - r, -h / 2 + r, -Math.PI / 2, 0], [w / 2 - r, h / 2 - r, 0, Math.PI / 2], [-w / 2 + r, h / 2 - r, Math.PI / 2, Math.PI], [-w / 2 + r, -h / 2 + r, Math.PI, Math.PI * 1.5]];
    const ax = rx * Math.PI / 180, ay = ry * Math.PI / 180; ctx.beginPath(); let first = true;
    C.forEach(([ox, oy, a0, a1]) => { for (let i = 0; i <= 10; i++) { const a = a0 + (a1 - a0) * i / 10, x = ox + Math.cos(a) * r, y = oy + Math.sin(a) * r; const z = x * Math.sin(ay) - y * Math.sin(ax), p = 850 / (850 + z); const sx = cx + x * Math.cos(ay) * p, sy = cy + y * Math.cos(ax) * p; first ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy); first = false; } });
    ctx.closePath();
  }
  draw(dt) {
    const ctx = this.ctx, W = this.W, H = this.H, R = this.rot, k = Math.min(1, dt * .009);
    R.x += (R.tx - R.x) * k; R.y += (R.ty - R.y) * k;
    this.cc.x += (this.cp.x - this.cc.x) * .2; this.cc.y += (this.cp.y - this.cc.y) * .2;
    this.cur.style.transform = `translate3d(${this.cc.x}px,${this.cc.y}px,0)`;
    ctx.clearRect(0, 0, W, H);
    const me = this.getBoundingClientRect(), r = this.hole.getBoundingClientRect(), e = this.e;
    const rcx = r.left - me.left + r.width / 2, rcy = r.top - me.top + r.height / 2;
    const cx = rcx + (W / 2 - rcx) * e, cy = rcy + (H / 2 - rcy) * e;
    const sc = e ? 1 : this.mask, w = (r.width + (W - r.width) * e) * sc, h = (r.height + (H - r.height) * e) * sc;
    const cap = this.querySelector('.pi-cap'); cap.style.top = (rcy - r.height / 2 - 34) + 'px';
    if (w > 1 && h > 1 && this.img.complete && this.img.naturalWidth) {
      ctx.save(); this.path(ctx, cx, cy, w, h, (W < 640 ? 70 : 90) * (1 - e) * sc, R.x * (1 - e), R.y * (1 - e)); ctx.clip();
      ctx.fillStyle = '#030303'; ctx.fillRect(0, 0, W, H);
      const iw = this.img.naturalWidth, ih = this.img.naturalHeight, s = Math.max(W / iw, H / ih);
      ctx.drawImage(this.img, (W - iw * s) / 2, (H - ih * s) / 2, iw * s, ih * s);
      ctx.restore();
    }
  }
}
customElements.define('portal-intro', PortalIntro);
})();
