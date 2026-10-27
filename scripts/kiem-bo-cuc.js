// kiem-bo-cuc.js : đo bố cục một màn của Kèm Con Học, dùng trong Playwright.
// Cách dùng:
//   await page.addScriptTag({ path: 'kiem-bo-cuc.js' });
//   const loi = await page.evaluate(() => window.kiemBoCuc());
// Mỗi lỗi có: t ('overlap' đè nhau, 'tight' dính sát dưới 6px, 'frame' nút chạm khung nét đứt,
// 'contrast' chữ chìm, 'clip' chữ bị cắt hoặc placeholder dài hơn ô, 'hscroll' trang cuộn ngang),
// sev (0 nặng nhất đến 6), nhãn phần tử a và b, khoảng cách gap hoặc tỉ lệ tương phản ratio.
// Đạt khi không còn sev 0 đến 3, trừ mục có chủ đích (nhóm nút liền khối, đề rút gọn có "Xem đề").
// Hàm gán window.__iss là các cặp phần tử theo đúng thứ tự kết quả, để khoanh ảnh khi cần.
window.kiemBoCuc = () => {
  const W = innerWidth, out = [], E = [];
  const vis = e => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 2 && r.height > 2 && s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > 0.05; };
  const rgba = c => { const m = (c || '').match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; };
  const lum = c => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(c[0]) + .7152 * f(c[1]) + .0722 * f(c[2]); };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
  const blend = (top, bot) => { const a = top[3]; return [top[0] * a + bot[0] * (1 - a), top[1] * a + bot[1] * (1 - a), top[2] * a + bot[2] * (1 - a), 1]; };
  const label = e => ((e.innerText || e.getAttribute('aria-label') || e.placeholder || e.tagName) + '').trim().replace(/\s+/g, ' ').slice(0, 40);
  const R = e => { const r = e.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top + scrollY), w: Math.round(r.width), h: Math.round(r.height) }; };
  const inNav = e => !!(e.closest && e.closest('nav'));
  const isFixed = e => { for (let n = e; n && n !== document.body; n = n.parentElement) { const p = getComputedStyle(n).position; if (p === 'fixed' || p === 'sticky') return true; } return false; };
  // nền thực tế dưới một phần tử: lớp màu đầu tiên đủ đặc, gradient lấy màu đầu
  const bgOf = e => {
    const stack = [];
    for (let n = e; n; n = n.parentElement) {
      const s = getComputedStyle(n);
      const g = s.backgroundImage && s.backgroundImage !== 'none' ? rgba(s.backgroundImage) : null;
      const c = rgba(s.backgroundColor);
      if (g && g[3] > .5) { stack.push(g); break; }
      if (c && c[3] > 0) { stack.push(c); if (c[3] > .9) break; }
    }
    let base = [255, 255, 255, 1];
    for (let i = stack.length - 1; i >= 0; i--) base = blend(stack[i], base);
    return base;
  };
  const opacityChain = e => { let o = 1; for (let n = e; n; n = n.parentElement) o *= +getComputedStyle(n).opacity; return o; };
  const all = [...document.querySelectorAll('body *')].filter(vis);
  // 1. chữ chìm nền
  const seen = new Set();
  for (const e of all) {
    const own = [...e.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim().replace(/[\p{Extended_Pictographic}\uFE0F\u200D\s]/gu, '').length > 1);
    if (!own.length || e.closest('[disabled],[aria-disabled=true]')) continue;
    const s = getComputedStyle(e), fg = rgba(s.color); if (!fg) continue;
    const bg = bgOf(e), op = opacityChain(e);
    const col = blend([fg[0], fg[1], fg[2], fg[3] * op], bg);
    const r = ratio(col, bg), fs = parseFloat(s.fontSize), bold = +s.fontWeight >= 700;
    const need = (fs >= 24 || (fs >= 18.5 && bold)) ? 3 : 4.5;
    if (r < need - 0.05) {
      const k = own[0].textContent.trim().slice(0, 40); if (seen.has(k)) continue; seen.add(k);
      out.push({ t: 'contrast', txt: k, ratio: +r.toFixed(2), need, fs, rect: R(e), fixed: isFixed(e) }); E.push([e, null]);
    }
  }
  // 2. hộp dính sát / đè nhau
  const boxes = all.filter(e => {
    if (['HTML', 'BODY', 'svg', 'path', 'IMG', 'SPAN', 'B', 'I', 'SMALL', 'STRONG', 'BR'].includes(e.tagName)) return false;
    const s = getComputedStyle(e), r = e.getBoundingClientRect();
    if (r.width < 40 || r.height < 24 || r.width * r.height < 1500 || r.width > W - 4 && r.height > 300) return false;
    const bgc = rgba(s.backgroundColor), hasBg = (bgc && bgc[3] > .15) || (s.backgroundImage !== 'none' && !/url\(/.test(s.backgroundImage));
    const hasBorder = parseFloat(s.borderTopWidth) > 0 && s.borderTopStyle !== 'none' && (rgba(s.borderTopColor) || [0, 0, 0, 0])[3] > .15;
    return hasBg || hasBorder || e.tagName === 'BUTTON' || e.tagName === 'INPUT' || e.tagName === 'TEXTAREA';
  }).filter(e => !isFixed(e) && !inNav(e));
  const rects = boxes.map(e => [e, e.getBoundingClientRect()]);
  const seenPair = new Set();
  for (let i = 0; i < rects.length; i++) for (let j = 0; j < rects.length; j++) {
    if (i === j) continue;
    const [a, ra] = rects[i], [b, rb] = rects[j];
    if (a.contains(b) || b.contains(a)) continue;
    const hov = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left), vov = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
    let kind = null, gap = null;
    if (hov > Math.min(ra.width, rb.width) * .3 && rb.top >= ra.top + 4) { gap = rb.top - ra.bottom; if (gap > -40 && gap < 6) kind = gap < -1 ? 'overlap' : 'tight'; }
    else if (vov > Math.min(ra.height, rb.height) * .5 && rb.left >= ra.left + 4) { gap = rb.left - ra.right; if (gap > -40 && gap < 6) kind = gap < -1 ? 'overlap' : 'tight'; }
    if (!kind) continue;
    // bỏ qua cặp nằm chung một nhóm nút dính liền có chủ đích (cùng cha, cùng cỡ, khoảng cách 0) như tab phân đoạn
    if (a.parentElement === b.parentElement && Math.abs(ra.height - rb.height) < 2 && gap >= -1 && gap < 1.5) continue;   // nhóm nút liền khối có chủ đích (tab, thanh dưới)
    if (/Học tối nay/.test(a.parentElement?.innerText || '') && /Con tôi/.test(a.parentElement?.innerText || '') && /Báo cáo/.test(a.parentElement?.innerText || '') && (a.parentElement.innerText || '').length < 60) continue;
    const key = [label(a), label(b), kind].join('|'); if (seenPair.has(key)) continue; seenPair.add(key);
    out.push({ t: kind, a: label(a), b: label(b), gap: Math.round(gap), rect: R(a), rect2: R(b), tagA: a.tagName, tagB: b.tagName }); E.push([a, b]);
  }
  // 3. nút đè lên khung nét đứt (kể cả khung vẽ bằng ::before / ::after)
  const frames = [];
  for (const e of all) for (const pse of [null, '::before', '::after']) {
    const s = getComputedStyle(e, pse);
    if (pse && s.content === 'none') continue;
    if (!/dashed|dotted/.test(s.borderTopStyle + s.borderBottomStyle + s.borderLeftStyle) || parseFloat(s.borderTopWidth + 0) === 0) continue;
    const r = e.getBoundingClientRect();
    if (isFixed(e) || inNav(e) || e.querySelector('nav') || r.height > 1400) continue;   // khung trang lớn bao cả màn, không phải khung nội dung
    const ins = pse ? ['top', 'right', 'bottom', 'left'].map(k => parseFloat(s[k]) || 0) : [0, 0, 0, 0];
    frames.push([e, { left: r.left + ins[3], top: r.top + ins[0], right: r.right - ins[1], bottom: r.bottom - ins[2] }]);
  }
  for (const [f, fr] of frames) for (const btn of all.filter(x => (/^(BUTTON|A|INPUT)$/.test(x.tagName) || x.getAttribute('role') === 'button') && !isFixed(x) && !inNav(x) && !x.contains(f) && x.getBoundingClientRect().height >= 28)) {
    const r = btn.getBoundingClientRect();
    if (r.right < fr.left || r.left > fr.right || r.bottom < fr.top || r.top > fr.bottom) continue;
    const pad = 6, crosses = r.left < fr.left + pad || r.right > fr.right - pad || r.top < fr.top + pad || r.bottom > fr.bottom - pad;
    if (crosses) { out.push({ t: 'frame', a: label(btn), b: 'khung nét đứt', rect: R(btn) }); E.push([btn, f]); }
  }
  // 4. chữ bị cắt, placeholder dài hơn ô
  const cv = document.createElement('canvas').getContext('2d');
  for (const e of all) {
    const s = getComputedStyle(e);
    if ((e.tagName === 'INPUT' || e.tagName === 'TEXTAREA') && e.placeholder && !e.value) {
      cv.font = `${s.fontWeight} ${s.fontSize} ${s.fontFamily}`;
      const w = cv.measureText(e.placeholder).width, room = e.clientWidth - parseFloat(s.paddingLeft) - parseFloat(s.paddingRight);
      if (e.tagName === 'INPUT' && w > room + 2) { out.push({ t: 'clip', a: e.placeholder.slice(0, 50), why: 'placeholder dài hơn ô', rect: R(e) }); E.push([e, null]); }
      continue;
    }
    const clipX = /hidden|clip/.test(s.overflowX) || s.textOverflow === 'ellipsis', clipY = /hidden|clip/.test(s.overflowY) && s.webkitLineClamp === 'none';
    if (e.children.length < 3 && (e.innerText || '').trim().length > 3) {
      if (clipX && e.scrollWidth > e.clientWidth + 2) { out.push({ t: 'clip', a: label(e), why: 'chữ bị cắt ngang', rect: R(e) }); E.push([e, null]); }
      else if (clipY && e.scrollHeight > e.clientHeight + 3 && e.clientHeight > 10) { out.push({ t: 'clip', a: label(e), why: 'chữ bị cắt dọc', rect: R(e) }); E.push([e, null]); }
    }
    const r = e.getBoundingClientRect();
    if ((r.right > W + 1 || r.left < -1) && !isFixed(e) && !e.closest('[style*=overflow],[class*=scroll],[class*=carousel],[class*=strip]') && /hidden|clip/.test(getComputedStyle(document.body).overflowX) === false && e.children.length === 0 && (e.innerText || '').trim().length > 1)
      { out.push({ t: 'offscreen', a: label(e), rect: R(e) }); E.push([e, null]); }
  }
  if (document.documentElement.scrollWidth > W + 1) { out.push({ t: 'hscroll', a: 'Trang cuộn ngang', w: document.documentElement.scrollWidth }); E.push([null, null]); }
  const sev = it => it.t === 'overlap' ? 0 : it.t === 'frame' || it.t === 'hscroll' ? 1 : it.t === 'tight' && it.gap <= 2 ? 2 : it.t === 'offscreen' ? 2 : it.t === 'contrast' && it.ratio < 3 ? 3 : it.t === 'clip' ? 4 : it.t === 'tight' ? 5 : 6;
  const idx = out.map((it, i) => i).sort((i, j) => sev(out[i]) - sev(out[j]));
  window.__iss = idx.map(i => E[i]);
  return idx.map(i => Object.assign(out[i], { sev: sev(out[i]) }));
};
