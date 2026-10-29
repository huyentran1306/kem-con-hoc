// Gói 33 · B3: dữ liệu đọc từ localStorage/sessionStorage phải được kiểm hình dạng trước khi dùng.
// Sai hoặc thuộc bản cũ thì sửa về mặc định cho khoá đó, không để app sập (S.children.find, S.stats[id]...).
const isObj = (v) => Boolean(v) && typeof v === 'object' && !Array.isArray(v)
const LIST_FIELDS = ['stickersList', 'stickerHistory', 'weak', 'strong', 'history', 'calmHistory']

/** Phiên đăng nhập: phải là object có id dạng chuỗi. */
export function sanitizeSession(s) {
  return isObj(s) && typeof s.id === 'string' && s.id.trim() ? s : null
}

/**
 * Trạng thái app đã lưu. Trả { state, fixes }: fixes liệt kê phần đã phải sửa (để ghi log).
 * init: initialState(); statsFor(id): bộ số liệu rỗng cho một bé.
 */
export function sanitizeAppState(saved, init, statsFor) {
  if (!isObj(saved)) return { state: init, fixes: ['root'] }
  const s = { ...init, ...saved }
  const fixes = []
  const childOk = (c) => isObj(c) && typeof c.id === 'string' && c.id && typeof c.name === 'string'
  if (!Array.isArray(s.children) || s.children.length === 0 || !s.children.every(childOk)) {
    s.children = init.children
    s.activeId = init.activeId
    s.stats = init.stats
    fixes.push('children')
  }
  if (!s.children.some((c) => c.id === s.activeId)) {
    s.activeId = s.children[0].id
    fixes.push('activeId')
  }
  if (!isObj(s.stats)) {
    s.stats = {}
    fixes.push('stats')
  }
  for (const c of s.children) {
    const st = s.stats[c.id]
    if (!isObj(st)) {
      s.stats[c.id] = statsFor(c.id)
      fixes.push(`stats.${c.id}`)
      continue
    }
    for (const f of LIST_FIELDS) {
      if (st[f] !== undefined && st[f] !== null && !Array.isArray(st[f])) {
        st[f] = []
        fixes.push(`stats.${c.id}.${f}`)
      }
    }
  }
  if (!isObj(s.flow)) {
    s.flow = init.flow
    fixes.push('flow')
  }
  if (!isObj(s.problem) || !Array.isArray(s.problem.steps)) {
    s.problem = init.problem
    fixes.push('problem')
  }
  if (!Array.isArray(s.schedule)) {
    s.schedule = init.schedule
    fixes.push('schedule')
  }
  for (const k of ['theme', 'motion', 'parent', 'tone']) {
    if (s[k] !== undefined && typeof s[k] !== 'string') {
      s[k] = init[k]
      fixes.push(k)
    }
  }
  return { state: s, fixes }
}
