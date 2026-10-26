(function () {
  if (window.__guideOn) return; window.__guideOn = true;
  const C = window.GUIDE_CFG; if (!C) return;
  const KEY = 'guideOff:' + C.id, TK = 'guideTour:' + C.id;
  let tour = 0; try { tour = +(localStorage.getItem(TK) || 0); } catch (e) {}
  let off = false; try { off = !!localStorage.getItem(KEY); } catch (e) {}
  const css = document.createElement('style');
  css.textContent = '@keyframes gTap{0%,55%,100%{transform:scale(1)}70%{transform:translate(-2px,-2px) scale(.88)}}@keyframes gRip{0%,55%{transform:translate(-50%,-50%) scale(.2);opacity:0}65%{opacity:.55}100%{transform:translate(-50%,-50%) scale(1.6);opacity:0}}';
  document.head.appendChild(css);
  const pos = C.pos === 'left' ? 'left:20px;top:50%;transform:translateY(-50%);width:clamp(220px,calc(50vw - 240px),340px);max-height:calc(100vh - 40px)' : C.pos === 'right' ? 'right:20px;top:20px;bottom:20px;width:360px' : 'left:50%;bottom:20px;transform:translateX(-50%);width:620px;max-width:calc(100% - 40px)';
  const card = document.createElement('div'); card.setAttribute('data-guide', '1');
  card.style.cssText = 'position:fixed;z-index:300;' + pos + ';box-sizing:border-box;display:flex;flex-direction:column;border-radius:14px;background:#16150F;color:#FFFFFF;box-shadow:0 18px 40px -12px rgba(16,15,12,0.45);font-family:inherit;overflow:hidden';
  const pill = document.createElement('button'); pill.setAttribute('data-guide', '1'); pill.textContent = 'Show guide';
  pill.style.cssText = 'position:fixed;z-index:300;' + (C.pos === 'left' ? 'left:24px;bottom:24px' : C.pos === 'right' ? 'right:20px;top:20px' : 'left:50%;bottom:20px;transform:translateX(-50%)') + ';height:34px;padding:0 14px;border:none;border-radius:17px;background:#16150F;color:#FFFFFF;font-size:12.5px;font-weight:600;cursor:pointer;font-family:inherit;box-shadow:0 10px 24px -8px rgba(16,15,12,0.4)';
  const cur = document.createElement('div'); cur.setAttribute('data-guide', '1');
  cur.style.cssText = 'position:fixed;pointer-events:none;z-index:310;display:none;width:0;height:0;transition:top .7s cubic-bezier(.22,1,.36,1),left .7s cubic-bezier(.22,1,.36,1)';
  cur.innerHTML = '<span style="position:absolute;left:0;top:0;width:34px;height:34px;border-radius:50%;background:rgba(215,68,47,0.35);animation:gRip 1.6s ease-out infinite"></span><svg width="26" height="30" viewBox="0 0 26 30" style="position:absolute;left:-3px;top:-2px;filter:drop-shadow(0 3px 5px rgba(16,15,12,0.35));animation:gTap 1.6s ease-in-out infinite;transform-origin:3px 2px"><path d="M3 2 L3 23 L8.5 18 L12.5 27 L16.5 25.2 L12.6 16.5 L20 16.2 Z" fill="#16150F" stroke="#FFFFFF" stroke-width="2" stroke-linejoin="round"/></svg>';
  const mount = () => { if (!document.body) return setTimeout(mount, 50);
    if (C.pos === 'right') { const sl = document.querySelector('[data-guide-slot]'); if (!sl) return setTimeout(mount, 100);
      card.style.position = 'static'; card.style.width = '100%'; card.style.height = '100%'; card.style.boxShadow = 'none';
      pill.style.position = 'static'; pill.style.alignSelf = 'flex-start'; sl.append(card, pill); document.body.append(cur);
      setInterval(() => { if (!card.isConnected) { const s2 = document.querySelector('[data-guide-slot]'); if (s2) s2.append(card, pill); } }, 500); }
    else document.body.append(card, pill, cur);
    render(); setInterval(tick, 250); if (tour) setTimeout(() => window.dispatchEvent(new CustomEvent('guide:tour', { detail: tour })), 700); };
  const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth; };
  const txt = e => (e.getAttribute('aria-label') || e.textContent || '').replace(/\s+/g, ' ').trim();
  const cands = () => [...document.querySelectorAll('button,[role=button],a,span,div')].filter(e => !e.closest('[data-guide]') && (e.tagName === 'BUTTON' || e.children.length === 0 || e.getAttribute('aria-label')));
  const sized = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const find = (names, mode, any) => { const all = cands(); for (const n of [].concat(names)) { const hit = all.filter(e => { const t = txt(e).replace(/^✦ /, ''); return mode === 'prefix' ? t.startsWith(n) : t === n; }).map(e => e.closest('button') || e).filter(any ? sized : vis); if (hit.length) return hit[0]; } return null; };
  const btnHas = t => [...document.querySelectorAll('button,[role=button]')].some(e => !e.closest('[data-guide]') && sized(e) && txt(e).replace(/^✦ /, '').startsWith(t));
  const has = t => t[0] !== '~' ? btnHas(t) : (t = t.slice(1), false) || [...document.querySelectorAll('span,div')].some(e => e.children.length === 0 && !e.closest('[data-guide]') && txt(e).startsWith(t) && sized(e));
  let lastKey = '', lastScr = '', lastScrolled = '';
  function scr() { const L = C.screens || []; for (let i = L.length - 1; i >= 0; i--) { const s = L[i]; if (!s.when || [].concat(s.when).some(has)) return s; } return null; }
  function step(ti) { const T = C.tours[ti == null ? tour : ti], S = T.steps; for (let i = S.length - 1; i >= 0; i--) { const s = S[i]; if (!s.when || [].concat(s.when).some(has)) return [i, s]; } return [0, S[0]]; }
  const SEP = 'border-top:1px solid rgba(255,255,255,0.12)';
  function render() {
    card.style.display = off ? 'none' : 'flex'; pill.style.display = off ? 'block' : 'none';
    if (off) { cur.style.display = 'none'; return; }
    const [i, s] = step(), T = C.tours[tour], sc = scr() || { name: s.title, info: '', why: s.why };
    const miss = i === 0 && s.target && !find(s.target, s.mode, true), body = miss ? (T.off || 'This walkthrough starts on another screen. Go back to the first screen to begin.') : s.body;
    const why = sc.why || s.why;
    const list = C.tours.length > 1 ? '<div style="border-top:1px solid rgba(255,255,255,0.1);padding:12px 22px 14px;display:flex;flex-direction:column;gap:0;flex-shrink:0"><span style="font-size:11.5px;font-weight:600;letter-spacing:0.02em;color:#A19E96;padding-bottom:4px">Walkthroughs</span>' + (() => { let no = 0; return C.tours.map((t, k) => { if (!t.sub) no++; return '<button data-t="' + k + '" style="text-align:left;min-height:32px;padding:6px 10px 6px ' + (t.sub ? 26 : 10) + 'px;margin:0 -10px;border:none;border-radius:8px;background:' + (k === tour ? 'rgba(255,255,255,0.1)' : 'transparent') + ';color:' + (k === tour ? '#FFFFFF' : '#A19E96') + ';font-size:12.5px;font-weight:' + (k === tour ? 700 : 500) + ';cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:6px">' + (t.sub ? '<span style="color:#E8A25A">↳</span>' + t.label + (t.tag ? '<span style="font-size:10.5px;font-weight:700;padding:2px 6px;border-radius:999px;background:rgba(232,162,90,0.18);color:#E8A25A">' + t.tag + '</span>' : '') : no + '. ' + t.label) + '</button>'; }).join(''); })() + '</div>' : '';
    let whyOpen = false; try { whyOpen = localStorage.getItem('guideWhy') === '1'; } catch (er) {}
    const LBL = 'font-size:11.5px;font-weight:600;letter-spacing:0.02em';
    card.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;padding:14px 22px;border-bottom:1px solid rgba(255,255,255,0.1);flex-shrink:0"><span style="' + LBL + ';color:#A19E96">Prototype guide</span><button data-off="1" style="height:28px;padding:0 10px;border:none;border-radius:8px;background:rgba(255,255,255,0.1);color:#FFFFFF;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit">Hide</button></div>' +
      '<div style="flex:1;min-height:0;overflow-y:auto;display:flex;flex-direction:column;gap:18px;padding:18px 22px">' +
      '<div style="display:flex;flex-direction:column;gap:6px;padding:14px 16px;border-radius:12px;background:rgba(255,255,255,0.07)"><span style="' + LBL + ';color:#A19E96">Step ' + (i + 1) + ' of ' + T.steps.length + '</span><span style="font-size:14px;line-height:1.5;color:#FFFFFF;text-wrap:pretty">' + body + '</span></div>' +
      '<div style="display:flex;flex-direction:column;gap:4px"><span style="font-size:16px;font-weight:700;line-height:1.3">' + sc.name + '</span>' + (sc.info ? '<span style="font-size:13px;line-height:1.5;color:#D6D3CC;text-wrap:pretty">' + sc.info + '</span>' : '') + '</div>' +
      (why ? '<div style="display:flex;flex-direction:column;gap:6px;padding-top:14px;border-top:1px solid rgba(255,255,255,0.1)"><span style="' + LBL + ';color:#E8A25A">Design decision</span><span style="font-size:13px;line-height:1.55;color:#D6D3CC;text-wrap:pretty">' + why + '</span></div>' : '') +
      '</div>' + list;
    card.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { tour = +b.dataset.t; try { localStorage.setItem(TK, tour); } catch (e) {} window.dispatchEvent(new CustomEvent('guide:tour', { detail: tour })); scrollTo(0, 0); lastKey = ''; render(); });
    card.querySelector('[data-off]').onclick = () => { off = true; try { localStorage.setItem(KEY, '1'); } catch (e) {} render(); };
  }
  pill.onclick = () => { off = false; try { localStorage.removeItem(KEY); } catch (e) {} render(); };
  function tick() {
    const sc = scr(), sn = sc ? sc.name : ''; if (sn !== lastScr) { lastScr = sn; lastKey = ''; }
    if (off) return;
    { const T0 = C.tours[tour]; if (sc && T0.screens && !T0.screens.includes(sc.name)) { const alt = C.tours.findIndex(t => t.screens && t.screens.includes(sc.name)); if (alt >= 0 && alt !== tour) { tour = alt; try { localStorage.setItem(TK, tour); } catch (e) {} lastKey = ''; } } }
    { const [i0, s0] = step(); if (i0 === 0 && s0.target && !find(s0.target, s0.mode, true)) { const alt = C.tours.findIndex((t, ti) => ti !== tour && step(ti)[0] > 0); if (alt >= 0) { tour = alt; try { localStorage.setItem(TK, tour); } catch (e) {} lastKey = ''; } } }
    const [i, s] = step(), e = s.target ? find(s.target, s.mode) : null, k = tour + ':' + i + ':' + (i === 0 && s.target && !find(s.target, s.mode, true) ? 0 : 1); if (k !== lastKey) { lastKey = k; render(); }
    if (!e && s.target && lastScrolled !== k) { const h = find(s.target, s.mode, true); if (h) { lastScrolled = k; let p = h.parentElement; const hr = h.getBoundingClientRect();
        while (p && p !== document.body) { const cs = getComputedStyle(p); if (/(auto|scroll)/.test(cs.overflowY) && p.scrollHeight > p.clientHeight) { const pr = p.getBoundingClientRect(); p.scrollTop += (hr.top - pr.top) - (p.clientHeight / 2 - hr.height / 2); break; } p = p.parentElement; }
        const hr2 = h.getBoundingClientRect(); if (hr2.bottom > innerHeight || hr2.top < 0) window.scrollBy({ top: hr2.top - innerHeight / 2, behavior: 'smooth' }); } }
    if (!e) { cur.style.display = 'none'; return; }
    const r = e.getBoundingClientRect(), x = r.left + Math.min(r.width * 0.6, r.width - 8), y = r.top + r.height * 0.62;
    if (cur.style.display === 'none') { cur.style.transition = 'none'; cur.style.left = x + 60 + 'px'; cur.style.top = y + 60 + 'px'; cur.style.display = 'block'; cur.getBoundingClientRect(); cur.style.transition = 'top .7s cubic-bezier(.22,1,.36,1),left .7s cubic-bezier(.22,1,.36,1)'; }
    cur.style.left = x + 'px'; cur.style.top = y + 'px';
    if (!C.pos) { const low = (r.top + r.bottom) / 2 > innerHeight / 2; card.style.bottom = low ? 'auto' : '20px'; card.style.top = low ? '20px' : ''; }
  }
  mount();
})();
