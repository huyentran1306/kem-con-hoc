/* ============================================================
   ĐỢT 16 · BỘ ICON THANH TAB CỦA 3 BỘ THEO MÙA
   Vẽ theo bản vẽ bo-theo-mua.html, chuyển thành <symbol> trong một sprite SVG.
   Màu đọc từ biến --if --io --is --iw --ip --ia --ic (đặt trong themes.css, phạm vi .kch-si)
   Đêm Tuyết: cây thông, hộp quà, bông tuyết, người tuyết
   Xuân Sum Vầy: bánh chưng, lồng đèn, hoa mai, bao lì xì
   Cầu Vồng 1/6: cánh diều, chong chóng, cầu vồng, bóng bay
   ============================================================ */

export const SEASON_ICON_BODIES = {
  "noel": {
    "home": "<path d=\"M16 3.5 23 13h-3.6l5.4 7.4h-4.6L26.4 28H5.6l6.2-7.6H7.2L12.6 13H9z\" stroke-linejoin=\"round\" style=\"fill:var(--if,#2E8B57);fill-opacity:var(--io,1);stroke:var(--is,#17324A);stroke-width:var(--iw,1.6)\"/><rect x=\"13.6\" y=\"27.6\" width=\"4.8\" height=\"2.8\" rx=\"1\" fill=\"#8A5A2B\" stroke-width=\"1.4\" style=\"stroke:var(--is,#17324A)\"/><circle cx=\"13\" cy=\"17\" r=\"1.6\" style=\"fill:var(--ia,#C8283F)\"/><circle cx=\"19.4\" cy=\"22.6\" r=\"1.6\" style=\"fill:var(--ip,#F2C14E)\"/><circle cx=\"17.4\" cy=\"11.6\" r=\"1.3\" style=\"fill:var(--ip,#F2C14E)\"/>",
    "game": "<rect x=\"5\" y=\"13\" width=\"22\" height=\"15\" rx=\"3\" style=\"fill:var(--ia,#C8283F);stroke:var(--is,#17324A);stroke-width:var(--iw,1.6)\"/><rect x=\"3.6\" y=\"9.4\" width=\"24.8\" height=\"5.6\" rx=\"2\" style=\"fill:var(--ic,#E04A5F);stroke:var(--is,#17324A);stroke-width:var(--iw,1.6)\"/><rect x=\"14\" y=\"9.4\" width=\"4\" height=\"18.6\" style=\"fill:var(--ip,#F2C14E)\"/><path d=\"M16 9.4c-3-5-8-4.6-7-1.6S16 9.4 16 9.4zm0 0c3-5 8-4.6 7-1.6S16 9.4 16 9.4z\" stroke-width=\"1.4\" style=\"fill:var(--ip,#F2C14E);stroke:var(--is,#17324A)\"/>",
    "report": "<g stroke=\"#2B7BB9\" stroke-width=\"2.2\" stroke-linecap=\"round\"><path d=\"M16 3v26M4.7 9.5l22.6 13M4.7 22.5l22.6-13\"/><path d=\"M12.6 5.6 16 8.6l3.4-3M12.6 26.4l3.4-3 3.4 3M5.3 14.3l4.4-.4.9-4.4M26.7 17.7l-4.4.4-.9 4.4M5.3 17.7l4.4.4.9 4.4M26.7 14.3l-4.4-.4-.9-4.4\"/></g>",
    "child": "<circle cx=\"16\" cy=\"22\" r=\"8\" fill=\"#fff\" style=\"stroke:var(--is,#17324A);stroke-width:var(--iw,1.6)\"/><circle cx=\"16\" cy=\"11.4\" r=\"5.6\" fill=\"#fff\" style=\"stroke:var(--is,#17324A);stroke-width:var(--iw,1.6)\"/><rect x=\"11\" y=\"3\" width=\"10\" height=\"4.6\" rx=\"1\" style=\"fill:var(--is,#17324A)\"/><rect x=\"9\" y=\"7\" width=\"14\" height=\"1.8\" rx=\".9\" style=\"fill:var(--is,#17324A)\"/><path d=\"M10.6 15.6h10.8l-1.2 2.4h-8.4z\" style=\"fill:var(--ia,#C8283F)\"/><circle cx=\"14\" cy=\"10.6\" r=\".9\" style=\"fill:var(--is,#17324A)\"/><circle cx=\"18\" cy=\"10.6\" r=\".9\" style=\"fill:var(--is,#17324A)\"/><path d=\"M16 12.2l3 .9-3 .7z\" fill=\"#F08A24\"/><circle cx=\"16\" cy=\"21\" r=\"1\" style=\"fill:var(--is,#17324A)\"/><circle cx=\"16\" cy=\"24.6\" r=\"1\" style=\"fill:var(--is,#17324A)\"/>"
  },
  "tet": {
    "home": "<rect x=\"5\" y=\"5\" width=\"22\" height=\"22\" rx=\"3\" style=\"fill:var(--if,#3E9A55);fill-opacity:var(--io,1);stroke:var(--is,#4A1A0C);stroke-width:var(--iw,1.6)\"/><rect x=\"8.5\" y=\"8.5\" width=\"15\" height=\"15\" rx=\"2\" fill=\"#5DB36F\"/><path d=\"M12 5v22M20 5v22M5 12h22M5 20h22\" stroke=\"#F3D3A3\" style=\"stroke-width:var(--iw,1.6)\"/>",
    "game": "<path d=\"M16 1.5v3\" style=\"stroke:var(--is,#4A1A0C);stroke-width:var(--iw,1.6)\"/><rect x=\"11\" y=\"4.4\" width=\"10\" height=\"3\" rx=\"1\" stroke-width=\"1.3\" style=\"fill:var(--ic,#E9A800);stroke:var(--is,#4A1A0C)\"/><ellipse cx=\"16\" cy=\"15.6\" rx=\"10\" ry=\"8.4\" style=\"fill:var(--ia,#C8102E);stroke:var(--is,#4A1A0C);stroke-width:var(--iw,1.6)\"/><path d=\"M16 7.2v16.8M10.4 9q-2.6 6.6 0 13.2M21.6 9q2.6 6.6 0 13.2\" stroke-width=\"1.2\" fill=\"none\" style=\"stroke:var(--ip,#F6C344)\"/><rect x=\"11\" y=\"23.6\" width=\"10\" height=\"3\" rx=\"1\" stroke-width=\"1.3\" style=\"fill:var(--ic,#E9A800);stroke:var(--is,#4A1A0C)\"/><path d=\"M14 26.6l-.6 4M16 26.6v4.4M18 26.6l.6 4\" stroke-width=\"1.4\" stroke-linecap=\"round\" style=\"stroke:var(--ia,#C8102E)\"/>",
    "report": "<g stroke-width=\"1.4\" style=\"fill:var(--ip,#F6C344);stroke:var(--is,#4A1A0C)\"><circle cx=\"16\" cy=\"8.4\" r=\"5.4\"/><circle cx=\"23.4\" cy=\"13.8\" r=\"5.4\"/><circle cx=\"20.6\" cy=\"22.4\" r=\"5.4\"/><circle cx=\"11.4\" cy=\"22.4\" r=\"5.4\"/><circle cx=\"8.6\" cy=\"13.8\" r=\"5.4\"/></g><circle cx=\"16\" cy=\"16.2\" r=\"3.6\" stroke-width=\"1.3\" style=\"fill:var(--ic,#E9A800);stroke:var(--is,#4A1A0C)\"/><g style=\"fill:var(--ia,#C8102E)\"><circle cx=\"16\" cy=\"12.4\" r=\".9\"/><circle cx=\"19.4\" cy=\"15\" r=\".9\"/><circle cx=\"18.2\" cy=\"19\" r=\".9\"/><circle cx=\"13.8\" cy=\"19\" r=\".9\"/><circle cx=\"12.6\" cy=\"15\" r=\".9\"/></g>",
    "child": "<rect x=\"6\" y=\"3.5\" width=\"20\" height=\"25\" rx=\"3\" style=\"fill:var(--ia,#C8102E);stroke:var(--is,#4A1A0C);stroke-width:var(--iw,1.6)\"/><path d=\"M6 9.5q10 7 20 0\" fill=\"none\" style=\"stroke:var(--ip,#F6C344);stroke-width:var(--iw,1.6)\"/><circle cx=\"16\" cy=\"18\" r=\"5.2\" stroke-width=\"1.3\" style=\"fill:var(--ip,#F6C344);stroke:var(--is,#4A1A0C)\"/><path d=\"M16 14.6l1 2.2 2.4.2-1.8 1.6.6 2.4-2.2-1.3-2.2 1.3.6-2.4-1.8-1.6 2.4-.2z\" style=\"fill:var(--ia,#C8102E)\"/>"
  },
  "thieunhi": {
    "home": "<path d=\"M16 2 26 13 16 24 6 13z\" stroke-linejoin=\"round\" style=\"fill:var(--ip,#FFD23F);stroke:var(--is,#1D2340);stroke-width:var(--iw,1.6)\"/><path d=\"M16 2 26 13H16zM6 13h10v11z\" style=\"fill:var(--ia,#FF5A5F)\"/><path d=\"M16 13h10L16 24z\" style=\"fill:var(--if,#3A86FF);fill-opacity:var(--io,1)\"/><path d=\"M6 13 16 2v11z\" style=\"fill:var(--ic,#2EC4B6)\"/><path d=\"M16 2 26 13 16 24 6 13z\" fill=\"none\" stroke-linejoin=\"round\" style=\"stroke:var(--is,#1D2340);stroke-width:var(--iw,1.6)\"/><path d=\"M16 24c-2 3 2 4 0 7\" fill=\"none\" stroke-width=\"1.4\" style=\"stroke:var(--is,#1D2340)\"/><path d=\"M14.4 27.4l3.2-1M14.6 30.4l3-1\" stroke=\"#8338EC\" stroke-width=\"2\" stroke-linecap=\"round\"/>",
    "game": "<path d=\"M16 15V30\" stroke-width=\"1.8\" stroke-linecap=\"round\" style=\"stroke:var(--is,#1D2340)\"/><path d=\"M16 15 16 3a6 6 0 0 1 6 6z\" stroke-width=\"1.4\" style=\"fill:var(--ia,#FF5A5F);stroke:var(--is,#1D2340)\"/><path d=\"M16 15h12a6 6 0 0 1-6 6z\" stroke-width=\"1.4\" style=\"fill:var(--if,#3A86FF);fill-opacity:var(--io,1);stroke:var(--is,#1D2340)\"/><path d=\"M16 15v12a6 6 0 0 1-6-6z\" stroke-width=\"1.4\" style=\"fill:var(--ip,#FFD23F);stroke:var(--is,#1D2340)\"/><path d=\"M16 15H4a6 6 0 0 1 6-6z\" stroke-width=\"1.4\" style=\"fill:var(--ic,#2EC4B6);stroke:var(--is,#1D2340)\"/><circle cx=\"16\" cy=\"15\" r=\"1.8\" fill=\"#fff\" stroke-width=\"1.2\" style=\"stroke:var(--is,#1D2340)\"/>",
    "report": "<g fill=\"none\" stroke-width=\"3\" stroke-linecap=\"round\"><path d=\"M3.5 24a12.5 12.5 0 0 1 25 0\" style=\"stroke:var(--ia,#FF5A5F)\"/><path d=\"M7 24a9 9 0 0 1 18 0\" stroke=\"#FFC93C\"/><path d=\"M10.5 24a5.5 5.5 0 0 1 11 0\" style=\"stroke:var(--ic,#2EC4B6)\"/></g><ellipse cx=\"6\" cy=\"25.4\" rx=\"4.6\" ry=\"2.8\" fill=\"#fff\" stroke-width=\"1.3\" style=\"stroke:var(--is,#1D2340)\"/><ellipse cx=\"26\" cy=\"25.4\" rx=\"4.6\" ry=\"2.8\" fill=\"#fff\" stroke-width=\"1.3\" style=\"stroke:var(--is,#1D2340)\"/>",
    "child": "<ellipse cx=\"16\" cy=\"12\" rx=\"8.6\" ry=\"10\" style=\"fill:var(--ia,#FF5A5F);stroke:var(--is,#1D2340);stroke-width:var(--iw,1.6)\"/><path d=\"M14.6 21.6h2.8l-1.4 2z\" stroke-width=\"1.2\" style=\"fill:var(--ia,#FF5A5F);stroke:var(--is,#1D2340)\"/><path d=\"M16 23.6c-3 2.4 3 3.6 0 7\" fill=\"none\" stroke-width=\"1.3\" style=\"stroke:var(--is,#1D2340)\"/><path d=\"M11.4 8q1.4-3 4-3.6\" stroke=\"#fff\" stroke-width=\"1.8\" fill=\"none\" stroke-linecap=\"round\"/>"
  }
}

export const SEASON_ICON_LABELS = {
  noel: { home: 'Cây thông', game: 'Hộp quà', report: 'Bông tuyết', child: 'Người tuyết' },
  tet: { home: 'Bánh chưng', game: 'Lồng đèn', report: 'Hoa mai', child: 'Bao lì xì' },
  thieunhi: { home: 'Cánh diều', game: 'Chong chóng', report: 'Cầu vồng', child: 'Bóng bay' },
}

export const SEASON_SPRITE_ID = 'kch-season-sprite'

export function seasonSymbolId(themeId, tab) {
  return `kch-si-${themeId}-${tab}`
}

/* Chuỗi SVG sprite chứa 12 <symbol> */
export function seasonSpriteMarkup() {
  let symbols = ''
  for (const [themeId, tabs] of Object.entries(SEASON_ICON_BODIES)) {
    for (const [tab, body] of Object.entries(tabs)) {
      symbols += `<symbol id="${seasonSymbolId(themeId, tab)}" viewBox="0 0 32 32">${body}</symbol>`
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" id="${SEASON_SPRITE_ID}" aria-hidden="true" style="position:absolute;width:0;height:0;overflow:hidden">${symbols}</svg>`
}

/* Gắn sprite vào trang một lần (chỉ khi cần vẽ icon theo mùa) */
export function ensureSeasonSprite() {
  if (typeof document === 'undefined') return
  if (document.getElementById(SEASON_SPRITE_ID)) return
  const holder = document.createElement('div')
  holder.innerHTML = seasonSpriteMarkup()
  const svg = holder.firstChild
  if (svg) document.body.appendChild(svg)
}
