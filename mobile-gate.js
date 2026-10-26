(function () {
  if (window.__mgate) return; window.__mgate = true;
  var MIN = 760, el = null;
  function isPhone() { var coarse = window.matchMedia && matchMedia('(pointer: coarse)').matches; return window.innerWidth < MIN || (coarse && Math.min(screen.width, screen.height) < 600); }
  function url() { return location.href.split('#')[0]; }
  function show() {
    if (el) return;
    el = document.createElement('div');
    el.setAttribute('data-mobile-gate', '1');
    el.style.cssText = 'position:fixed;inset:0;z-index:2147483000;background:#F5F3EE;color:#1B1A17;display:flex;align-items:center;justify-content:center;padding:32px 28px;box-sizing:border-box;font-family:Manrope,"Instrument Sans",system-ui,sans-serif;overflow:auto';
    el.innerHTML =
      '<div style="max-width:360px;display:flex;flex-direction:column;align-items:flex-start;gap:20px">' +
        '<svg width="56" height="44" viewBox="0 0 56 44" fill="none" stroke="#1B1A17" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="1" width="54" height="34" rx="4"></rect><path d="M20 43h16M28 35v8"></path></svg>' +
        '<div style="display:flex;flex-direction:column;gap:10px">' +
          '<span style="font-size:26px;font-weight:800;letter-spacing:-0.02em;line-height:1.2">Best viewed on a laptop</span>' +
          '<span style="font-size:16px;line-height:1.55;color:#5E5A52">This case study includes a web app and a phone app shown side by side, with a guide next to them. Please open it on a laptop or desktop.</span>' +
        '</div>' +
        '<button type="button" style="height:48px;padding:0 20px;border:none;border-radius:24px;background:#1B1A17;color:#FFFFFF;font-family:inherit;font-size:15px;font-weight:700;cursor:pointer">Copy link to open later</button>' +
        '<span data-ok style="font-size:13px;color:#2F6B4F;font-weight:600;min-height:18px"></span>' +
      '</div>';
    var b = el.querySelector('button'), ok = el.querySelector('[data-ok]');
    b.onclick = function () {
      var done = function () { ok.textContent = 'Link copied. Open it on your laptop.'; };
      if (navigator.share) { navigator.share({ title: document.title, url: url() }).catch(function () {}); return; }
      if (navigator.clipboard) navigator.clipboard.writeText(url()).then(done, function () { ok.textContent = url(); }); else ok.textContent = url();
    };
    document.body.appendChild(el);
    document.documentElement.style.overflow = 'hidden';
  }
  function hide() { if (!el) return; el.remove(); el = null; document.documentElement.style.overflow = ''; }
  function check() { (isPhone() ? show : hide)(); }
  if (document.body) check(); else document.addEventListener('DOMContentLoaded', check);
  window.addEventListener('resize', check);
})();
