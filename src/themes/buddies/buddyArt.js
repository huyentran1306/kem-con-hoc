/* ============================================================
   KÈM CON HỌC — HÌNH VẼ & BIỂU CẢM LINH VẬT (SVG thuần, không thư viện)
   Mỗi linh vật: thân (giữ hình gốc), mắt, miệng, má, mốc đặt đạo cụ.
   buddyInnerSVG(id, state) trả markup bên trong <svg viewBox="-20 -24 140 140">
   CSS chuyển động nằm ở buddy.css (phạm vi .kbuddy)
   ============================================================ */

const B = {
  bear:{
    body:`<g class="acc-earL"><circle cx="28" cy="28" r="16" fill="#F59E0B"/><circle cx="28" cy="28" r="9" fill="#FDE68A"/></g>
<g class="acc-earR"><circle cx="72" cy="28" r="16" fill="#F59E0B"/><circle cx="72" cy="28" r="9" fill="#FDE68A"/></g>
<circle cx="50" cy="54" r="34" fill="#D97706"/><ellipse cx="50" cy="63" rx="16" ry="12" fill="#FEF3C7"/>
<ellipse cx="50" cy="58" rx="6" ry="4" fill="#78350F"/>
<path d="M42 82 Q50 86 58 82 Q54 90 42 82" fill="var(--c-accent,#EF4444)"/>`,
    eyes:[{x:38,y:48,r:4},{x:62,y:48,r:4}], ec:'#78350F', mouth:{x:50,y:63,w:4,style:'animal',c:'#78350F'},
    cheeks:[{x:27,y:59,r:5}], cc:'#F9A8B8', face:{x:50,y:50}, top:12
  },
  unicorn:{
    body:`<g class="acc-mane"><circle cx="24" cy="40" r="11" fill="var(--c-accent,#F9A8D4)"/><circle cx="20" cy="55" r="10" fill="#C4B5FD"/><circle cx="22" cy="69" r="8.5" fill="#93C5FD"/><circle cx="78" cy="48" r="8" fill="#C4B5FD"/><circle cx="79" cy="61" r="7" fill="var(--c-accent,#F9A8D4)"/></g>
<path d="M33 31 L29 12 L44 25 Z" fill="#FFFFFF" stroke="#E9D5FF" stroke-width="2" stroke-linejoin="round"/><path d="M34 27 L32 17 L40 24 Z" fill="#FBCFE8"/>
<path d="M67 31 L71 12 L56 25 Z" fill="#FFFFFF" stroke="#E9D5FF" stroke-width="2" stroke-linejoin="round"/><path d="M66 27 L68 17 L60 24 Z" fill="#FBCFE8"/>
<ellipse cx="50" cy="55" rx="31" ry="29" fill="#FFFFFF" stroke="#E9D5FF" stroke-width="2"/>
<path d="M44.5 28 L50 4 L55.5 28 Z" fill="#FCD34D" stroke="#F59E0B" stroke-width="1.3" stroke-linejoin="round"/>
<path d="M46.2 21 L53.6 19 M47.8 14 L52.4 12.6" stroke="#F59E0B" stroke-width="1.3" stroke-linecap="round"/>
<path d="M50 27 C38 25 30 33 31 45 C36 38 43 35 51 36 C47 33 47 30 50 27 Z" fill="var(--c-accent,#F9A8D4)"/>
<path d="M50 27 C59 27 65 31 67 39 C61 34 55 34 51 36 C51 32 51 29 50 27 Z" fill="#C4B5FD"/>
<ellipse cx="50" cy="67" rx="14" ry="9.5" fill="#FCE7F3"/>
<ellipse cx="45.5" cy="65.5" rx="1.4" ry="1.1" fill="#DB2777" opacity=".45"/><ellipse cx="54.5" cy="65.5" rx="1.4" ry="1.1" fill="#DB2777" opacity=".45"/>`,
    eyes:[{x:39,y:52,r:4.5},{x:61,y:52,r:4.5}], ec:'#3B2F4A', mouth:{x:50,y:70,w:3,style:'simple',c:'#BE185D'},
    cheeks:[{x:30.5,y:61,r:4}], cc:'#F9A8D4', face:{x:50,y:52}, top:8, sparkAt:{x:62,y:6}
  },
  dragon:{
    body:`<path d="M21 50 L7 39 L11 53 L4 62 L21 61 Z" fill="#6EE7B7" stroke="#10B981" stroke-width="1.6" stroke-linejoin="round"/>
<path d="M79 50 L93 39 L89 53 L96 62 L79 61 Z" fill="#6EE7B7" stroke="#10B981" stroke-width="1.6" stroke-linejoin="round"/>
<g class="acc-horns"><path d="M34 31 Q28 17 36 13 Q38 22 41 28 Z" fill="#FDE68A" stroke="#F59E0B" stroke-width="1.3" stroke-linejoin="round"/>
<path d="M66 31 Q72 17 64 13 Q62 22 59 28 Z" fill="#FDE68A" stroke="#F59E0B" stroke-width="1.3" stroke-linejoin="round"/></g>
<path d="M42 27 Q45 16 48 25 Q50 14 52 25 Q55 16 58 27 Z" fill="var(--c-accent,#60A5FA)"/>
<ellipse cx="50" cy="55" rx="32" ry="29" fill="#34D399"/>
<circle cx="64" cy="37" r="3" fill="#6EE7B7"/><circle cx="70" cy="44" r="2" fill="#6EE7B7"/><circle cx="33" cy="38" r="2" fill="#6EE7B7"/>
<ellipse cx="50" cy="67" rx="17" ry="11.5" fill="#D1FAE5"/>
<ellipse cx="45" cy="63.5" rx="1.7" ry="1.2" fill="#047857"/><ellipse cx="55" cy="63.5" rx="1.7" ry="1.2" fill="#047857"/>`,
    eyes:[{x:38,y:51,r:5},{x:62,y:51,r:5}], ec:'#064E3B', mouth:{x:50,y:69,w:3.6,style:'simple',c:'#065F46'},
    cheeks:[{x:29,y:61,r:4.5}], cc:'#FFB8C6', co:.95, face:{x:50,y:52}, top:14, puff:{x:45,y:62}
  },
  cat:{
    body:`<g class="acc-earL"><polygon points="26,35 22,12 42,28" fill="#F97316"/><polygon points="26,32 25,18 38,28" fill="#FED7AA"/></g>
<g class="acc-earR"><polygon points="74,35 78,12 58,28" fill="#F97316"/><polygon points="74,32 75,18 62,28" fill="#FED7AA"/></g>
<circle cx="50" cy="54" r="32" fill="#EA580C"/><ellipse cx="50" cy="62" rx="14" ry="10" fill="#FFEDD5"/>
<polygon points="47,56 53,56 50,60" fill="#BE185D"/>
<g class="acc-whisk"><line x1="24" y1="58" x2="36" y2="60" stroke="#7C2D12" stroke-width="1.5"/><line x1="24" y1="64" x2="36" y2="64" stroke="#7C2D12" stroke-width="1.5"/><line x1="76" y1="58" x2="64" y2="60" stroke="#7C2D12" stroke-width="1.5"/><line x1="76" y1="64" x2="64" y2="64" stroke="#7C2D12" stroke-width="1.5"/></g>`,
    eyes:[{x:38,y:48,r:4},{x:62,y:48,r:4}], ec:'#1E293B', mouth:{x:50,y:60,w:3.5,style:'animal',c:'#7C2D12'},
    cheeks:[{x:31,y:53,r:3.5}], cc:'#FDA4AF', face:{x:50,y:50}, top:12
  },
  star:{
    body:`<polygon points="50,12 61,38 88,38 66,54 74,80 50,64 26,80 34,54 12,38 39,38" fill="#FACC15" stroke="#CA8A04" stroke-width="2" stroke-linejoin="round"/>`,
    eyes:[{x:43,y:44,r:3},{x:57,y:44,r:3}], ec:'#713F12', mouth:{x:50,y:52,w:4.5,style:'simple',c:'#713F12'},
    cheeks:[{x:38.5,y:49,r:3}], cc:'#F87171', face:{x:50,y:46}, top:12, sparkAt:{x:84,y:20}
  },
  cloud:{
    body:`<path d="M25 65 A16 16 0 0 1 35 38 A22 22 0 0 1 72 40 A18 18 0 0 1 78 65 Z" fill="#E0F2FE" stroke="#38BDF8" stroke-width="2.5" stroke-linejoin="round"/>`,
    eyes:[{x:44,y:52,r:3},{x:60,y:52,r:3}], ec:'#0369A1', mouth:{x:52,y:58,w:4,style:'simple',c:'#0369A1'},
    cheeks:[{x:38,y:57,r:3}], cc:'#F472B6', face:{x:52,y:52}, top:26
  },
  sprout:{
    body:`<g class="acc-leaves"><path d="M50 49 Q48.5 39 50 30" fill="none" stroke="#22C55E" stroke-width="3.6" stroke-linecap="round"/>
<path d="M50 31 C41 17 25 18 21 29 C29 38 43 38 50 31 Z" fill="#4ADE80" stroke="#16A34A" stroke-width="1.6" stroke-linejoin="round"/>
<path d="M50 31 C57 14 75 13 80 23 C74 34 58 37 50 31 Z" fill="#86EFAC" stroke="#16A34A" stroke-width="1.6" stroke-linejoin="round"/>
<path d="M48 31 Q38 26 28 28.5 M52 30.5 Q62 23 73 22" fill="none" stroke="#16A34A" stroke-width="1" stroke-linecap="round" opacity=".55"/></g>
<ellipse cx="50" cy="50" rx="21" ry="4.5" fill="#8B5A3C"/>
<path d="M30 57 L70 57 L65.5 85 Q64.5 90 59.5 90 L40.5 90 Q35.5 90 34.5 85 Z" fill="#F4A576"/>
<rect x="26" y="49" width="48" height="11" rx="5.5" fill="#F8BC93"/>
<path d="M29 54.5 H71" stroke="#FDE3CF" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>`,
    eyes:[{x:41.5,y:69,r:3.8},{x:58.5,y:69,r:3.8}], ec:'#5B3A29', mouth:{x:50,y:75,w:3.2,style:'simple',c:'#5B3A29'},
    cheeks:[{x:36,y:75,r:3.8}], cc:'#FF7A9A', co:.75, face:{x:50,y:70}, top:14, bloom:true
  }
};
const ORDER = ['bear','unicorn','dragon','cat','star','cloud','sprout'];

const STATES = [
  {id:'idle',name:'Nghỉ',use:'Trang chủ, thẻ chào. Thở và chớp mắt.'},
  {id:'hello',name:'Chào',use:'Lần đầu mở app, chọn bộ giao diện mới.'},
  {id:'reading',name:'Đọc ảnh',use:'Trong lúc AI đọc đề từ ảnh chụp.'},
  {id:'thinking',name:'Suy nghĩ',use:'Trong lúc AI soạn bài giảng.'},
  {id:'cheer',name:'Reo vui',use:'Con làm đúng, xong bài, nhận sticker.'},
  {id:'love',name:'Thương',use:'Góc hạ hoả, lời khen của bố mẹ.'},
  {id:'surprised',name:'Ngạc nhiên',use:'Khoảnh khắc bấm chụp.'},
  {id:'oops',name:'Bối rối',use:'Ảnh mờ, con trả lời chưa đúng.'},
  {id:'sleepy',name:'Ngủ gật',use:'Mạng chậm, chờ lâu, hết lượt AI.'}
];

const EYE_MODE = {idle:'open',hello:'open',reading:'look',thinking:'up',cheer:'happy',love:'happy',surprised:'wide',oops:'squint',sleepy:'closed'};
const MOUTH_MODE = {idle:'smile',hello:'smile',reading:'o',thinking:'flat',cheer:'open',love:'smile',surprised:'o',oops:'wavy',sleepy:'o'};

const heart = (x,y,s,fill,cls='') => `<path class="${cls}" transform="translate(${x} ${y}) scale(${s})" d="M0 3C0-1 5-1 5 2.5C5-1 10-1 10 3C10 6 5 9 5 10.5C5 9 0 6 0 3Z" fill="${fill}"/>`;
const spark = (x,y,s,fill,cls='pr-spark',delay=0) => `<path class="${cls}" style="animation-delay:${delay}s" transform="translate(${x} ${y}) scale(${s})" d="M0-6Q1-1 6 0Q1 1 0 6Q-1 1-6 0Q-1-1 0-6Z" fill="${fill}"/>`;

function eyesSVG(b, mode){
  return b.eyes.map((e,i) => {
    const c = b.ec, r = e.r, sw = Math.max(1.5, r*.6);
    if (mode==='happy') return `<path d="M${e.x-r*1.15} ${e.y+r*.45}Q${e.x} ${e.y-r*1.35} ${e.x+r*1.15} ${e.y+r*.45}" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>`;
    if (mode==='closed') return `<path d="M${e.x-r*1.1} ${e.y}Q${e.x} ${e.y+r} ${e.x+r*1.1} ${e.y}" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>`;
    if (mode==='squint'){
      const left = b.eyes.length===1 ? true : i===0;
      const d = left ? `M${e.x-r} ${e.y-r*.9}L${e.x+r*.7} ${e.y}L${e.x-r} ${e.y+r*.9}` : `M${e.x+r} ${e.y-r*.9}L${e.x-r*.7} ${e.y}L${e.x+r} ${e.y+r*.9}`;
      return `<path d="${d}" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
    const k = mode==='wide' ? 1.3 : 1;
    const ry = (e.ry || r) * k, rx = r * k;
    const px = (e.px || 0) + (mode==='up' ? 1 : 0), py = mode==='up' ? -1.2 : 0;
    const white = e.white ? `<circle cx="${e.x}" cy="${e.y}" r="${e.white*k}" fill="#FFFFFF"/>` : '';
    const hi = e.light ? '' : `<circle cx="${e.x+px-rx*.35}" cy="${e.y+py-ry*.4}" r="${Math.max(.8, rx*.32)}" fill="#FFFFFF"/>`;
    const pupil = `<g class="${mode==='look'?'pupil-look':''}"><ellipse cx="${e.x+px}" cy="${e.y+py}" rx="${rx}" ry="${ry}" fill="${c}"/>${hi}</g>`;
    return `<g class="eye blink">${white}${pupil}</g>`;
  }).join('');
}

function mouthSVG(b, mode){
  const {x,y,w,style,c} = b.mouth;
  const sw = Math.max(1.4, w*.42);
  if (mode==='open') return `<path d="M${x-w*1.2} ${y}Q${x} ${y+w*2.1} ${x+w*1.2} ${y}Z" fill="${c}"/><ellipse cx="${x}" cy="${y+w*.95}" rx="${w*.55}" ry="${w*.32}" fill="#F87171"/>`;
  if (mode==='o') return `<ellipse cx="${x}" cy="${y+w*.5}" rx="${w*.45}" ry="${w*.55}" fill="${c}"/>`;
  if (mode==='flat') return `<path d="M${x-w*.7} ${y+w*.4}Q${x} ${y+w*.7} ${x+w*.7} ${y+w*.3}" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>`;
  if (mode==='wavy') return `<path d="M${x-w} ${y+w*.5}q${w*.5} ${-w*.5} ${w} 0t${w} 0" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>`;
  if (style==='animal') return `<path d="M${x} ${y}V${y+w*.5}M${x-w} ${y+w*.5}Q${x-w*.5} ${y+w*1.3} ${x} ${y+w*.5}Q${x+w*.5} ${y+w*1.3} ${x+w} ${y+w*.5}" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`;
  return `<path d="M${x-w} ${y}Q${x} ${y+w*1.2} ${x+w} ${y}" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>`;
}

function cheeksSVG(b, state){
  const glow = (state==='cheer'||state==='love') ? 'cheek-glow' : '';
  const op = (state==='sleepy') ? .35 : (b.co || .65);
  const cx = b.face.x;
  return b.cheeks.flatMap(ch => {
    const mirror = {x: 2*cx - ch.x, y: ch.y, r: ch.r};
    return b.eyes.length===1 ? [ch] : [ch, mirror];
  }).map(ch => `<circle class="${glow}" cx="${ch.x}" cy="${ch.y}" r="${ch.r}" fill="${b.cc}" opacity="${op}"/>`).join('');
}

function propsSVG(b, id, state){
  const f = b.face, t = b.top;
  let inside = '', outside = '';
  if ((state==='idle'||state==='hello') && b.sparkAt) inside += spark(b.sparkAt.x, b.sparkAt.y, .9, '#FDE68A');
  if (state==='idle' && b.puff) inside += `<circle class="pr-puff" cx="${b.puff.x}" cy="${b.puff.y}" r="3" fill="#E5E7EB"/><circle class="pr-puff" style="animation-delay:.25s" cx="${b.puff.x-2}" cy="${b.puff.y-2}" r="2.2" fill="#F3F4F6"/>`;
  if (b.bloom && (state==='cheer'||state==='love')) inside += `<g class="pr-pop"><g transform="translate(50 26)">${[0,72,144,216,288].map(a=>`<ellipse cx="0" cy="-4.6" rx="3.2" ry="4.4" fill="var(--c-accent,#F472B6)" transform="rotate(${a})"/>`).join('')}<circle r="3" fill="#FDE047"/></g></g>`;
  if (state==='hello'){
    outside += heart(86, t-6, .9, 'var(--c-accent,#EC4899)', 'pr-float') + spark(12, t, .8, '#FBBF24', 'pr-spark', .4);
  }
  if (state==='reading'){
    const my = f.y + 15;
    inside += `<g class="pr-mag"><g transform="translate(${f.x} ${my})">
      <line x1="7" y1="7" x2="17" y2="17" stroke="#8B5E3C" stroke-width="4.5" stroke-linecap="round"/>
      <circle r="10" fill="rgba(191,227,250,.55)" stroke="#8B5E3C" stroke-width="3"/>
      <path class="pr-glint" d="M-6-2A6 6 0 0 1-1-6.5" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/></g></g>`;
  }
  if (state==='thinking'){
    const bx = 92, by = t - 8;
    outside += `<circle cx="78" cy="${t+10}" r="2.2" fill="var(--c-surface-2, var(--plum-tint, #FDE8EF))" stroke="var(--c-accent-ink, var(--plum, #D9577F))" stroke-width="1"/>
      <circle cx="84" cy="${t+3}" r="3.2" fill="var(--c-surface-2, var(--plum-tint, #FDE8EF))" stroke="var(--c-accent-ink, var(--plum, #D9577F))" stroke-width="1"/>
      <rect x="${bx-15}" y="${by-11}" width="30" height="17" rx="8.5" fill="var(--c-surface-2, var(--plum-tint, #FDE8EF))" stroke="var(--c-accent-ink, var(--plum, #D9577F))" stroke-width="1.2"/>
      <circle class="pr-dot" cx="${bx-7}" cy="${by-2.5}" r="2" fill="var(--c-accent-ink, var(--plum, #D9577F))"/>
      <circle class="pr-dot" style="animation-delay:.2s" cx="${bx}" cy="${by-2.5}" r="2" fill="var(--c-accent-ink, var(--plum, #D9577F))"/>
      <circle class="pr-dot" style="animation-delay:.4s" cx="${bx+7}" cy="${by-2.5}" r="2" fill="var(--c-accent-ink, var(--plum, #D9577F))"/>`;
  }
  if (state==='cheer'){
    outside += heart(4, t+2, 1, 'var(--c-accent,#EC4899)', 'pr-float')
      + `<g style="animation-delay:.8s" class="pr-float">${heart(84, t+4, .8, '#F472B6')}</g>`
      + spark(14, t-8, 1, '#FBBF24', 'pr-spark', .2) + spark(90, t-10, .9, '#FBBF24', 'pr-spark', .9) + spark(50, t-16, .7, '#FDE68A', 'pr-spark', .5);
  }
  if (state==='love'){
    outside += heart(44, t-18, 1.2, 'var(--c-accent,#EC4899)', 'pr-float')
      + `<g class="pr-float" style="animation-delay:1.2s">${heart(70, t-10, .8, '#F472B6')}</g>`;
  }
  if (state==='surprised'){
    outside += `<g stroke="#F59E0B" stroke-width="2.4" stroke-linecap="round" class="pr-pop">
      <line x1="${f.x-30}" y1="${t-2}" x2="${f.x-36}" y2="${t-9}"/><line x1="${f.x}" y1="${t-6}" x2="${f.x}" y2="${t-15}"/><line x1="${f.x+30}" y1="${t-2}" x2="${f.x+36}" y2="${t-9}"/></g>`;
  }
  if (state==='oops'){
    outside += `<text class="pr-q" x="86" y="${t+4}" font-family="Baloo 2, sans-serif" font-weight="800" font-size="22" fill="var(--c-accent-ink, var(--plum, #D9577F))">?</text>
      <path class="pr-sweat" transform="translate(${f.x+22} ${f.y-14})" d="M0 0C2 3 3.5 5 3.5 6.6A3.5 3.5 0 0 1-3.5 6.6C-3.5 5-2 3 0 0Z" fill="#7DD3FC"/>`;
  }
  if (state==='sleepy'){
    outside += [0,1,2].map(i => `<text class="pr-z" style="animation-delay:${i}s" x="${78+i*2}" y="${t+6}" font-family="Baloo 2, sans-serif" font-weight="800" font-size="${10+i*3}" fill="var(--c-text-2, var(--muted, #6B5D6B))">z</text>`).join('');
  }
  return {inside, outside};
}


export const BUDDY_IDS = ORDER
export const BUDDY_NAMES = { bear: 'Gấu', unicorn: 'Kỳ lân', dragon: 'Rồng con', cat: 'Mèo', star: 'Sao', cloud: 'Mây', sprout: 'Mầm' }
export const BUDDY_STATES = STATES
export const BUDDY_VIEWBOX = '-20 -24 140 140'

/* Tên trạng thái cũ (quotes: hello/nudge/cheer, BearAvatar: chao/nhac/vui) → trạng thái mới */
const LEGACY = { nudge: 'love', chao: 'hello', nhac: 'love', vui: 'cheer' }
export function normalizeBuddyState(state) {
  const s = LEGACY[state] || state
  return EYE_MODE[s] ? s : 'idle'
}

export function hasBuddyArt(id) {
  return Boolean(id && B[id])
}

export function buddyInnerSVG(id, state = 'idle') {
  const b = B[id]
  if (!b) return ''
  const st = normalizeBuddyState(state)
  const p = propsSVG(b, id, st)
  return `<g class="bd-root">${b.body}${cheeksSVG(b, st)}${eyesSVG(b, EYE_MODE[st])}${mouthSVG(b, MOUTH_MODE[st])}${p.inside}</g>${p.outside}`
}
