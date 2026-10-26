(function () {
  const fit = () => {
    const el = document.querySelector('[data-fit]'); if (!el) return;
    document.body.style.margin = '0';
    el.style.zoom = 1; el.style.minHeight = '0px'; el.style.minWidth = '0px';
    const top = Math.max(0, el.getBoundingClientRect().top + scrollY), pad = 24;
    const w = el.scrollWidth + pad, h = el.scrollHeight + pad;
    const z = Math.min(1, innerWidth / w, (innerHeight - top) / h);
    el.style.zoom = z;
    el.style.minHeight = 'calc((100vh - ' + top + 'px) / ' + z + ')'; el.style.minWidth = 'calc(100vw / ' + z + ')';
    document.documentElement.style.overflow = z < 1 ? 'hidden' : '';
  };
  let t; const go = () => { clearTimeout(t); t = setTimeout(fit, 60); };
  addEventListener('resize', go);
  const wait = () => { if (document.querySelector('[data-fit]')) { fit(); setTimeout(fit, 400); setTimeout(fit, 1200); } else setTimeout(wait, 60); };
  wait();
})();
