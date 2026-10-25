/* ============================================================
   KÈM CON HỌC · ĐỢT 16 · CƠ CHẾ GỢI Ý GIAO DIỆN THEO MÙA
   Hàm thuần (không React, không DOM) để chạy được trong kiểm thử Node.
   Mọi ngày tính theo giờ Việt Nam (UTC+7), biểu diễn dạng 'YYYY-MM-DD'.
   App chỉ GỢI Ý; không bao giờ tự đổi giao diện của gia đình.
   ============================================================ */

export const SEASONAL_THEME_IDS = ['noel', 'tet', 'thieunhi']

export const SEASON_NAMES = {
  noel: 'Đêm Tuyết',
  tet: 'Xuân Sum Vầy',
  thieunhi: 'Cầu Vồng 1/6',
}

/* Tên mùa ngắn dùng trong câu chữ ("Tết qua rồi", "Giữ bộ Tết") */
export const SEASON_SHORT = {
  noel: 'Noel',
  tet: 'Tết',
  thieunhi: 'Tết Thiếu nhi',
}

/* Ngày mùng 1 Tết (âm lịch Việt Nam). Chủ dự án đối chiếu lại trước khi chốt; admin sửa được từng năm. */
export const DEFAULT_TET_DATES = {
  2027: '2027-02-06',
  2028: '2028-01-26',
  2029: '2029-02-13',
  2030: '2030-02-03',
  2031: '2031-01-23',
}

export const DEFAULT_SEASONS = {
  noel: { enabled: true, start: '12-01', end: '12-31' },
  tet: { enabled: true, daysBefore: 8, daysAfter: 9, dates: { ...DEFAULT_TET_DATES } },
  thieunhi: { enabled: true, start: '05-25', end: '06-07' },
}

export function isSeasonalTheme(id) {
  return SEASONAL_THEME_IDS.includes(id)
}

/* ---------- ngày tháng ---------- */
const MD_RE = /^(\d{2})-(\d{2})$/
const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/

function validMD(s) {
  const m = MD_RE.exec(String(s || ''))
  if (!m) return false
  const mo = +m[1]
  const d = +m[2]
  return mo >= 1 && mo <= 12 && d >= 1 && d <= 31
}

export function isIsoDate(s) {
  const m = ISO_RE.exec(String(s || ''))
  if (!m) return false
  const dt = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]))
  return dt.getUTCFullYear() === +m[1] && dt.getUTCMonth() === +m[2] - 1 && dt.getUTCDate() === +m[3]
}

export function dayNum(iso) {
  const m = ISO_RE.exec(iso)
  return Math.round(Date.UTC(+m[1], +m[2] - 1, +m[3]) / 86400000)
}

export function isoFromDayNum(n) {
  const d = new Date(n * 86400000)
  const y = d.getUTCFullYear()
  const mo = String(d.getUTCMonth() + 1).padStart(2, '0')
  const da = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${mo}-${da}`
}

export function addDays(iso, n) {
  return isoFromDayNum(dayNum(iso) + n)
}

/* Hôm nay theo giờ Việt Nam */
export function vnToday(now = new Date()) {
  const t = now instanceof Date ? now.getTime() : Number(now)
  return isoFromDayNum(Math.floor((t + 7 * 3600000) / 86400000))
}

/* '2027-01-29' → '29/1' */
export function shortDate(iso) {
  const m = ISO_RE.exec(iso || '')
  if (!m) return ''
  return `${+m[3]}/${+m[2]}`
}

/* ---------- cấu hình ---------- */
export function normalizeSeasonsConfig(raw) {
  const src = raw && typeof raw === 'object' ? raw : {}
  const out = {}
  for (const id of ['noel', 'thieunhi']) {
    const d = DEFAULT_SEASONS[id]
    const r = src[id] && typeof src[id] === 'object' ? src[id] : {}
    out[id] = {
      enabled: r.enabled === undefined ? d.enabled : Boolean(r.enabled),
      start: validMD(r.start) ? r.start : d.start,
      end: validMD(r.end) ? r.end : d.end,
    }
  }
  const d = DEFAULT_SEASONS.tet
  const r = src.tet && typeof src.tet === 'object' ? src.tet : {}
  const dates = { ...d.dates }
  if (r.dates && typeof r.dates === 'object') {
    for (const [y, v] of Object.entries(r.dates)) {
      if (/^\d{4}$/.test(y) && isIsoDate(v) && v.slice(0, 4) === y) dates[y] = v
      else if (/^\d{4}$/.test(y) && (v === null || v === '')) delete dates[y]
    }
  }
  const clampInt = (v, def, max) => {
    const n = parseInt(v, 10)
    return Number.isFinite(n) && n >= 0 && n <= max ? n : def
  }
  out.tet = {
    enabled: r.enabled === undefined ? d.enabled : Boolean(r.enabled),
    daysBefore: clampInt(r.daysBefore, d.daysBefore, 30),
    daysAfter: clampInt(r.daysAfter, d.daysAfter, 30),
    dates,
  }
  return out
}

/* ---------- khung mùa ---------- */
/* Khung mùa của một bộ, tính theo NĂM BẮT ĐẦU. Trả { themeId, key, start, end } hoặc null */
export function seasonWindow(themeId, year, cfgIn) {
  const cfg = normalizeSeasonsConfig(cfgIn)
  const y = Number(year)
  if (themeId === 'tet') {
    const tet = cfg.tet.dates[String(y)]
    if (!tet) return null
    return {
      themeId,
      key: `tet-${y}`,
      start: addDays(tet, -cfg.tet.daysBefore),
      end: addDays(tet, cfg.tet.daysAfter),
      tet,
    }
  }
  const c = cfg[themeId]
  if (!c) return null
  const start = `${y}-${c.start}`
  let end = `${y}-${c.end}`
  if (!isIsoDate(start)) return null
  if (!isIsoDate(end)) end = addDays(`${y}-${c.end.slice(0, 2)}-01`, 27)
  if (c.end < c.start) end = `${y + 1}-${c.end}`
  return { themeId, key: `${themeId}-${y}`, start, end }
}

export function inWindow(win, today) {
  return Boolean(win) && today >= win.start && today <= win.end
}

/* Khung mùa đang chứa hôm nay (xét năm trước và năm nay để bắt khung vắt qua năm mới) */
export function activeWindow(themeId, today, cfg) {
  const y = +today.slice(0, 4)
  for (const yy of [y - 1, y]) {
    const w = seasonWindow(themeId, yy, cfg)
    if (inWindow(w, today)) return w
  }
  return null
}

/* Khung mùa sắp tới gần nhất (dùng cho nhãn "Từ 29/1") */
export function nextWindow(themeId, today, cfg) {
  const y = +today.slice(0, 4)
  for (const yy of [y, y + 1, y + 2]) {
    const w = seasonWindow(themeId, yy, cfg)
    if (w && w.start > today) return w
  }
  return null
}

export function windowFromKey(key, cfg) {
  const m = /^(noel|tet|thieunhi)-(\d{4})$/.exec(String(key || ''))
  if (!m) return null
  return seasonWindow(m[1], +m[2], cfg)
}

/* Nhãn trên bảng chọn giao diện */
export function seasonTag(themeId, today, cfg) {
  if (activeWindow(themeId, today, cfg)) return 'Đang mùa'
  const n = nextWindow(themeId, today, cfg)
  return n ? `Từ ${shortDate(n.start)}` : ''
}

/* ---------- quyết định khi mẹ mở app ---------- */
/**
 * @returns null | { type: 'end', themeId, key, previous } | { type: 'suggest', themeId, key, window }
 */
export function decideSeasonPrompt({
  today,
  theme,
  themeBeforeSeason = null,
  seasonStartedKey = null,
  seasonAsked = [],
  cfg,
  isTrial = false,
  onHome = true,
}) {
  if (isTrial || !onHome || !today) return null
  const conf = normalizeSeasonsConfig(cfg)
  const asked = new Set(Array.isArray(seasonAsked) ? seasonAsked : [])

  if (isSeasonalTheme(theme)) {
    // Gia đình tự chọn bộ theo mùa ngoài khung mùa: không hỏi gì cả
    if (!seasonStartedKey || !String(seasonStartedKey).startsWith(`${theme}-`)) return null
    const win = windowFromKey(seasonStartedKey, conf)
    if (win && today > win.end) {
      const key = `${seasonStartedKey}-end`
      if (asked.has(key)) return null
      const previous = themeBeforeSeason && !isSeasonalTheme(themeBeforeSeason) ? themeBeforeSeason : 'bear'
      return { type: 'end', themeId: theme, key, previous }
    }
  }

  for (const id of SEASONAL_THEME_IDS) {
    if (!conf[id].enabled) continue
    if (theme === id) continue
    const win = activeWindow(id, today, conf)
    if (!win) continue
    if (asked.has(win.key)) continue
    return { type: 'suggest', themeId: id, key: win.key, window: win }
  }
  return null
}

function withAsked(seasonAsked, key) {
  const list = Array.isArray(seasonAsked) ? seasonAsked.filter((k) => k !== key) : []
  list.push(key)
  return list.slice(-24)
}

/* Mẹ bấm "Thử ngay": lưu bộ đang dùng, đổi sang bộ mùa cho cả nhà, ghi đã hỏi */
export function acceptSuggestionPatch(S, decision) {
  const prev = isSeasonalTheme(S.theme) ? S.themeBeforeSeason || 'bear' : S.theme || 'bear'
  return {
    theme: decision.themeId,
    themeBeforeSeason: prev,
    seasonStartedKey: decision.key,
    seasonAsked: withAsked(S.seasonAsked, decision.key),
  }
}

/* Mẹ bấm "Để sau": ghi đã hỏi, giữ nguyên bộ đang dùng */
export function laterSuggestionPatch(S, decision) {
  return { seasonAsked: withAsked(S.seasonAsked, decision.key) }
}

/* Hết mùa, mẹ bấm "Quay lại [bộ cũ]" */
export function endGoBackPatch(S, decision) {
  return {
    theme: decision.previous || 'bear',
    themeBeforeSeason: null,
    seasonStartedKey: null,
    seasonAsked: withAsked(S.seasonAsked, decision.key),
  }
}

/* Hết mùa, mẹ bấm "Giữ bộ [mùa]" */
export function endKeepPatch(S, decision) {
  return {
    seasonStartedKey: null,
    seasonAsked: withAsked(S.seasonAsked, decision.key),
  }
}

/* Mẹ tự đổi bộ trong bảng chọn giao diện */
export function pickThemePatch(S, newTheme, today, cfg) {
  if (!isSeasonalTheme(newTheme)) {
    return { theme: newTheme, themeBeforeSeason: null, seasonStartedKey: null }
  }
  if (newTheme === S.theme) return { theme: newTheme }
  const win = activeWindow(newTheme, today, cfg)
  if (!win) {
    // Tự chọn ngoài khung mùa: dùng quanh năm, không hỏi gì
    return { theme: newTheme, seasonStartedKey: null }
  }
  const prev = isSeasonalTheme(S.theme) ? S.themeBeforeSeason || null : S.theme || null
  return {
    theme: newTheme,
    themeBeforeSeason: prev,
    seasonStartedKey: win.key,
    seasonAsked: withAsked(S.seasonAsked, win.key),
  }
}

/* ---------- hạt hiệu ứng nền (chỉ CSS) ---------- */
export const MAX_PARTICLES = 24
export const FX_SCREENS = ['home', 'done']

/* Số hạt theo bộ và màn (đã cộng mọi lớp, luôn ≤ 24) */
export function particlePlan(themeId, screen, motion = 'full') {
  if (!isSeasonalTheme(themeId) || motion === 'off' || !FX_SCREENS.includes(screen)) return []
  const half = motion === 'light'
  const n = (k) => (half ? Math.ceil(k / 2) : k)
  const done = screen === 'done'
  if (themeId === 'noel') return [{ kind: 'snow', count: n(16) }]
  if (themeId === 'tet') return done ? [{ kind: 'petal', count: n(12) }, { kind: 'fw', count: n(4) }] : [{ kind: 'petal', count: n(12) }]
  return done ? [{ kind: 'rise', count: n(10) }, { kind: 'conf', count: n(12) }] : [{ kind: 'rise', count: n(10) }]
}

/* ---------- ngày đặc biệt (không gọi AI) ---------- */
export const TET_WISHES = [
  'Bé Lân chúc cả nhà năm mới mạnh khoẻ, cười thật nhiều!',
  'Chúc con một năm học vui, mỗi tối một bông mai nở.',
  'Năm mới, chúc nhà mình bình an và luôn đầy tiếng cười.',
  'Bé Lân chúc con chăm ngoan, tự tin hỏi khi chưa hiểu bài.',
  'Chúc bố mẹ thật nhiều kiên nhẫn và những buổi tối ấm áp bên con.',
  'Xuân sang, chúc con lớn thêm một tuổi và giỏi thêm một chút.',
  'Bé Lân múa một vòng chúc cả nhà vạn sự như ý!',
  'Chúc con năm nay đọc to thật hay, làm toán thật vui.',
  'Năm mới an khang, chúc nhà mình sum vầy và đầm ấm.',
  'Chúc con ăn Tết thật vui, rồi cùng mẹ học tiếp thật hăng say.',
]

/**
 * Thẻ ngày đặc biệt ở màn chính, chỉ khi gia đình đang dùng đúng bộ.
 * @returns null | { type: 'noel-eve'|'tet-wish'|'praise', key }
 */
export function specialDay(themeId, today, cfgIn) {
  if (!today || !isSeasonalTheme(themeId)) return null
  const md = today.slice(5)
  const y = today.slice(0, 4)
  if (themeId === 'noel' && md === '12-24') return { type: 'noel-eve', key: `noel-eve-${y}` }
  if (themeId === 'thieunhi' && md === '06-01') return { type: 'praise', key: `praise-${y}` }
  if (themeId === 'tet') {
    const cfg = normalizeSeasonsConfig(cfgIn)
    const tet = cfg.tet.dates[y]
    if (tet) {
      const diff = dayNum(today) - dayNum(tet)
      if (diff >= -1 && diff <= 2) return { type: 'tet-wish', key: `tet-wish-${today}`, dayIndex: diff }
    }
  }
  return null
}

export function pickTetWish(seed = Math.random()) {
  const i = Math.floor(Math.abs(seed) * TET_WISHES.length) % TET_WISHES.length
  return TET_WISHES[i]
}

/* Lời khen từ mẹ: tối đa 200 ký tự, tự xoá sau 7 ngày */
export const PRAISE_MAX = 200
export const PRAISE_TTL_DAYS = 7

export function makePraiseNote(text, today) {
  return { text: String(text || '').slice(0, PRAISE_MAX), date: today }
}

export function isPraiseExpired(note, today) {
  if (!note || !note.date || !isIsoDate(note.date)) return true
  return dayNum(today) - dayNum(note.date) >= PRAISE_TTL_DAYS
}

/* Nút "Mở lời khen của mẹ" ở màn Xong bài: chỉ tối 1/6, bộ Cầu Vồng 1/6, có lời khen của hôm nay */
export function canOpenPraise(themeId, note, today) {
  return themeId === 'thieunhi' && Boolean(note && note.text) && note.date === today && today.slice(5) === '06-01'
}
