/**
 * Bảng đường dẫn của khung admin (Đợt 15 · Chặng 2)
 * Mỗi trang một đường dẫn `/admin/<slug>`; slug lạ thì về Tổng quan.
 */

export const ADMIN_BASE = '/admin'

export const ADMIN_GROUPS = [
  { id: 'monitor', label: 'Theo dõi' },
  { id: 'ai', label: 'AI & nội dung' },
  { id: 'system', label: 'Hệ thống' },
]

// kind: 'tab' (trang riêng) | 'config' (AdminConfigTab, sub) | 'tools' (AdminToolsTab, sub)
export const ADMIN_PAGES = [
  { id: 'overview', slug: '', label: 'Tổng quan', icon: '📊', group: 'monitor', kind: 'tab', keywords: ['tong quan', 'bang dieu khien'] },
  { id: 'families', slug: 'gia-dinh', label: 'Gia đình & học sinh', icon: '👪', group: 'monitor', kind: 'tab', keywords: ['gia dinh', 'hoc sinh', 'phu huynh'] },
  { id: 'sessions', slug: 'buoi-hoc', label: 'Buổi học & AI', icon: '📚', group: 'monitor', kind: 'tab', keywords: ['buoi hoc', 'nhat ky hoc', 'phien hoc'] },
  { id: 'reports', slug: 'bao-cao', label: 'Báo cáo & NPS', icon: '💛', group: 'monitor', kind: 'tab', keywords: ['bao cao', 'nps', 'danh gia'] },
  { id: 'teachers', slug: 'giao-vien', label: 'Giáo viên & lớp', icon: '🍎', group: 'monitor', kind: 'tab', keywords: ['giao vien', 'lop', 'co giao'] },

  { id: 'model', slug: 'mo-hinh', label: 'Mô hình & tham số', icon: '🧠', group: 'ai', kind: 'config', sub: 'model', restricted: true, keywords: ['mo hinh', 'tham so', 'model'] },
  { id: 'prompts', slug: 'prompt-studio', label: 'Prompt Studio', icon: '✍️', group: 'ai', kind: 'config', sub: 'prompts', restricted: true, keywords: ['prompt', 'studio'] },
  { id: 'router', slug: 'router', label: 'Router sư phạm', icon: '🧭', group: 'ai', kind: 'config', sub: 'router', restricted: true, keywords: ['router', 'su pham', 'luat'] },
  { id: 'scope', slug: 'pham-vi', label: 'Phạm vi đề & ảnh', icon: '🛡️', group: 'ai', kind: 'config', sub: 'scope', restricted: true, keywords: ['pham vi', 'de bai', 'pham vi de'] },
  { id: 'safety', slug: 'an-toan', label: 'An toàn AI', icon: '🐻', group: 'ai', kind: 'tab', keywords: ['an toan', 'phan hoi', 'feedback'] },
  { id: 'themes', slug: 'giao-dien', label: 'Giao diện app', icon: '🎨', group: 'ai', kind: 'config', sub: 'themes', restricted: true, keywords: ['giao dien', 'theme', 'bo mau'] },

  { id: 'admins', slug: 'quan-tri-vien', label: 'Quản trị viên', icon: '🔑', group: 'system', kind: 'config', sub: 'admins', restricted: true, keywords: ['quan tri vien', 'pin', 'tai khoan'] },
  { id: 'audit', slug: 'nhat-ky', label: 'Nhật ký thao tác', icon: '🧾', group: 'system', kind: 'config', sub: 'audit', restricted: true, keywords: ['nhat ky thao tac', 'audit'] },
  { id: 'infra', slug: 'ha-tang', label: 'Hạ tầng & lỗi', icon: '☁️', group: 'system', kind: 'config', sub: 'infra', restricted: true, keywords: ['ha tang', 'loi he thong', 'cloudflare'] },
  { id: 'zalo', slug: 'zalo', label: 'Thông báo & Zalo', icon: '💬', group: 'system', kind: 'config', sub: 'zalo', restricted: true, keywords: ['thong bao', 'zalo'] },
  { id: 'sql', slug: 'sql', label: 'D1 SQL Studio', icon: '🗄️', group: 'system', kind: 'tools', sub: 'sql', superadminOnly: true, keywords: ['sql', 'd1'] },
  { id: 'team-prompts', slug: 'team-prompts', label: 'Team Prompts Sync', icon: '🔄', group: 'system', kind: 'tools', sub: 'team_prompts', devOnly: true, keywords: ['team prompts'] },
]

/** Bảng slug → id trang (dùng cho kiểm thử tĩnh và điều hướng) */
export const ADMIN_ROUTE_TABLE = {
  '/admin': 'overview',
  '/admin/gia-dinh': 'families',
  '/admin/buoi-hoc': 'sessions',
  '/admin/bao-cao': 'reports',
  '/admin/giao-vien': 'teachers',
  '/admin/mo-hinh': 'model',
  '/admin/prompt-studio': 'prompts',
  '/admin/router': 'router',
  '/admin/pham-vi': 'scope',
  '/admin/an-toan': 'safety',
  '/admin/giao-dien': 'themes',
  '/admin/quan-tri-vien': 'admins',
  '/admin/nhat-ky': 'audit',
  '/admin/ha-tang': 'infra',
  '/admin/zalo': 'zalo',
  '/admin/sql': 'sql',
  '/admin/team-prompts': 'team-prompts',
}

export const DEV_TOOLS_ON = (() => {
  try {
    return import.meta.env.VITE_DEV_TOOLS === '1'
  } catch (e) {
    return false
  }
})()

export function pageById(id) {
  return ADMIN_PAGES.find((p) => p.id === id) || ADMIN_PAGES[0]
}

export function pagePath(id) {
  const p = pageById(id)
  return p.slug ? `${ADMIN_BASE}/${p.slug}` : ADMIN_BASE
}

/** Đọc trang hiện tại từ URL. `/admingraph`, `#admin` và slug lạ đều về Tổng quan. */
export function pageIdFromLocation(loc = typeof window !== 'undefined' ? window.location : null) {
  if (!loc) return 'overview'
  let path = (loc.pathname || '').toLowerCase().replace(/\/+$/, '')
  if (!path.startsWith('/admin/') && path !== '/admin') {
    // Hỗ trợ dạng #admin/gia-dinh
    const h = (loc.hash || '').toLowerCase()
    if (h.startsWith('#admin/')) path = '/admin/' + h.slice('#admin/'.length).replace(/\/+$/, '')
    else return 'overview'
  }
  return ADMIN_ROUTE_TABLE[path] || 'overview'
}

/** Quyền xem trang theo vai trò: support chỉ xem nhóm Theo dõi và An toàn AI; SQL chỉ superadmin. */
export function canSeePage(page, role) {
  if (!page) return false
  if (page.devOnly && !DEV_TOOLS_ON) return false
  if (page.superadminOnly && role !== 'superadmin') return false
  if (page.restricted && role === 'support') return false
  return true
}

export function visiblePages(role) {
  return ADMIN_PAGES.filter((p) => canSeePage(p, role))
}

export function groupLabel(groupId) {
  return ADMIN_GROUPS.find((g) => g.id === groupId)?.label || ''
}

/** Bỏ dấu tiếng Việt để so khớp ô tìm chung */
export function foldVi(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
}

/** Ô tìm chung: chữ khớp tên trang thì mở trang đó; không thì tìm trong Gia đình (?q=) */
export function resolveSearch(query, role) {
  const q = foldVi(query)
  if (!q) return null
  const pages = visiblePages(role)
  const hit =
    pages.find((p) => foldVi(p.label) === q) ||
    pages.find((p) => p.keywords.includes(q)) ||
    (q.length >= 4 && pages.find((p) => foldVi(p.label).startsWith(q) || p.keywords.some((k) => k.startsWith(q))))
  if (hit) return { pageId: hit.id, search: '' }
  return { pageId: 'families', search: `?q=${encodeURIComponent(String(query).trim())}` }
}

/** URL hiện tại có thuộc admin không (/admin, /admingraph, #admin) */
export function isAdminLocation(loc = typeof window !== 'undefined' ? window.location : null) {
  if (!loc) return false
  const p = (loc.pathname || '').toLowerCase()
  const h = (loc.hash || '').toLowerCase()
  return p === '/admin' || p.startsWith('/admin/') || p === '/admingraph' || p.startsWith('/admingraph/') || h.startsWith('#admin')
}
