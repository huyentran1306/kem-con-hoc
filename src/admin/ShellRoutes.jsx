/**
 * Bảng đường dẫn và cấu trúc điều hướng khung admin
 * Phương án A (Đợt 23T / 23R): 9 mục chia 3 nhóm, tab ở đầu trang
 */

export const ADMIN_BASE = '/admin'

export const ADMIN_GROUPS = [
  { id: 'people', label: 'Người dùng' },
  { id: 'ai', label: 'AI' },
  { id: 'system', label: 'Hệ thống' },
]

export const ADMIN_SECTIONS = [
  { id: 'overview', label: 'Tổng quan', icon: 'home', group: null, pages: ['overview'] },
  { id: 'families', label: 'Gia đình', icon: 'users', group: 'people', pages: ['families', 'reports'] },
  { id: 'teachers', label: 'Giáo viên & lớp', icon: 'cap', group: 'people', pages: ['teachers'] },
  { id: 'learning', label: 'Học tập', icon: 'book', group: 'people', pages: ['sessions', 'analytics'] },
  { id: 'ai-studio', label: 'AI Studio', icon: 'spark', group: 'ai', pages: ['prompts', 'router', 'model', 'team-prompts'] },
  { id: 'ai-safety', label: 'An toàn AI', icon: 'shield', group: 'ai', pages: ['safety', 'scope', 'scoreboard'] },
  { id: 'themes', label: 'Giao diện app', icon: 'palette', group: 'system', pages: ['themes'] },
  { id: 'ops', label: 'Vận hành', icon: 'server', group: 'system', pages: ['infra', 'token-ai', 'pre-demo', 'zalo'] },
  { id: 'admin-mgnt', label: 'Quản trị', icon: 'key', group: 'system', pages: ['admins', 'audit', 'sql'] },
]

// kind: 'tab' (trang riêng) | 'config' (AdminConfigTab, sub) | 'tools' (AdminToolsTab, sub)
export const ADMIN_PAGES = [
  { id: 'overview', slug: '', label: 'Tổng quan', tabLabel: 'Tổng quan', icon: 'home', group: null, kind: 'tab', keywords: ['tong quan', 'bang dieu khien'] },
  { id: 'families', slug: 'gia-dinh', label: 'Gia đình & học sinh', tabLabel: 'Gia đình & học sinh', icon: 'users', group: 'people', kind: 'tab', keywords: ['gia dinh', 'hoc sinh', 'phu huynh'] },
  { id: 'reports', slug: 'bao-cao', label: 'Báo cáo & NPS', tabLabel: 'Báo cáo & NPS', icon: 'users', group: 'people', kind: 'tab', keywords: ['bao cao', 'nps', 'danh gia'] },
  { id: 'teachers', slug: 'giao-vien', label: 'Giáo viên & lớp', tabLabel: 'Giáo viên & lớp', icon: 'cap', group: 'people', kind: 'tab', keywords: ['giao vien', 'lop', 'co giao'] },
  { id: 'sessions', slug: 'buoi-hoc', label: 'Buổi học & AI', tabLabel: 'Buổi học', icon: 'book', group: 'people', kind: 'tab', keywords: ['buoi hoc', 'nhat ky hoc', 'phien hoc'] },
  { id: 'analytics', slug: 'phan-tich', label: 'Phân tích học tập', tabLabel: 'Phân tích học tập', icon: 'book', group: 'people', kind: 'tab', keywords: ['phan tich', 'hoc tap', 'thong ke'] },

  { id: 'prompts', slug: 'prompt-studio', label: 'Prompt Studio', tabLabel: 'Prompt', icon: 'spark', group: 'ai', kind: 'config', sub: 'prompts', restricted: true, keywords: ['prompt', 'studio'] },
  { id: 'router', slug: 'router', label: 'Router sư phạm', tabLabel: 'Router sư phạm', icon: 'spark', group: 'ai', kind: 'config', sub: 'router', restricted: true, keywords: ['router', 'su pham', 'luat'] },
  { id: 'model', slug: 'mo-hinh', label: 'Mô hình & tham số', tabLabel: 'Mô hình & tham số', icon: 'spark', group: 'ai', kind: 'config', sub: 'model', restricted: true, keywords: ['mo hinh', 'tham so', 'model'] },
  { id: 'team-prompts', slug: 'team-prompts', label: 'Danh sách prompt (Team AI)', tabLabel: 'Kho prompt team', icon: 'spark', group: 'ai', kind: 'tools', sub: 'team_prompts', devOnly: true, keywords: ['team prompts', 'danh sach prompt', 'prompts', 'kho prompt team'] },

  { id: 'safety', slug: 'an-toan', label: 'An toàn AI', tabLabel: 'An toàn AI', icon: 'shield', group: 'ai', kind: 'tab', keywords: ['an toan', 'phan hoi', 'feedback'] },
  { id: 'scope', slug: 'pham-vi', label: 'Phạm vi đề & ảnh', tabLabel: 'Phạm vi đề & ảnh', icon: 'shield', group: 'ai', kind: 'config', sub: 'scope', restricted: true, keywords: ['pham vi', 'de bai', 'pham vi de'] },
  { id: 'scoreboard', slug: 'bang-diem', label: 'Bảng điểm AI', tabLabel: 'Bảng điểm AI', icon: 'shield', group: 'ai', kind: 'tab', keywords: ['bang diem', 'bang diem ai', 'eval'] },

  { id: 'themes', slug: 'giao-dien', label: 'Giao diện app', tabLabel: 'Giao diện app', icon: 'palette', group: 'system', kind: 'config', sub: 'themes', restricted: true, keywords: ['giao dien', 'theme', 'bo mau'] },

  { id: 'infra', slug: 'ha-tang', label: 'Hạ tầng & lỗi', tabLabel: 'Hạ tầng & lỗi', icon: 'server', group: 'system', kind: 'config', sub: 'infra', restricted: true, keywords: ['ha tang', 'loi he thong', 'cloudflare'] },
  { id: 'token-ai', slug: 'token-ai', label: 'Token AI', tabLabel: 'Token AI', icon: 'server', group: 'system', kind: 'tab', keywords: ['token', 'token ai', 'chi phi'] },
  { id: 'pre-demo', slug: 'truoc-demo', label: 'Kiểm tra trước demo', tabLabel: 'Kiểm tra trước demo', icon: 'server', group: 'system', kind: 'tab', keywords: ['demo', 'truoc demo', 'kiem tra demo'] },
  { id: 'zalo', slug: 'zalo', label: 'Thông báo & Zalo', tabLabel: 'Thông báo & Zalo', icon: 'server', group: 'system', kind: 'config', sub: 'zalo', restricted: true, keywords: ['thong bao', 'zalo'] },

  { id: 'admins', slug: 'quan-tri-vien', label: 'Quản trị viên', tabLabel: 'Quản trị viên', icon: 'key', group: 'system', kind: 'config', sub: 'admins', restricted: true, keywords: ['quan tri vien', 'pin', 'tai khoan'] },
  { id: 'audit', slug: 'nhat-ky', label: 'Nhật ký thao tác', tabLabel: 'Nhật ký thao tác', icon: 'key', group: 'system', kind: 'config', sub: 'audit', restricted: true, keywords: ['nhat ky thao tac', 'audit'] },
  { id: 'sql', slug: 'sql', label: 'D1 SQL Studio', tabLabel: 'D1 SQL Studio', icon: 'key', group: 'system', kind: 'tools', sub: 'sql', superadminOnly: true, keywords: ['sql', 'd1'] },
]

/** Bảng slug → id trang (dùng cho kiểm thử tĩnh và điều hướng) */
export const ADMIN_ROUTE_TABLE = {
  '/admin': 'overview',
  '/admin/gia-dinh': 'families',
  '/admin/buoi-hoc': 'sessions',
  '/admin/bao-cao': 'reports',
  '/admin/giao-vien': 'teachers',
  '/admin/phan-tich': 'analytics',
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
  '/admin/danh-sach-prompt': 'team-prompts',
  '/admin/token-ai': 'token-ai',
  '/admin/truoc-demo': 'pre-demo',
  '/admin/bang-diem': 'scoreboard',
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

export function pageTabLabel(p) {
  if (typeof p === 'string') p = pageById(p)
  return p?.tabLabel || p?.label || ''
}

export function sectionOf(pageId) {
  return ADMIN_SECTIONS.find((s) => s.pages.includes(pageId)) || null
}

export function visibleSections(role) {
  return ADMIN_SECTIONS.filter((sec) => {
    return sec.pages.some((pid) => canSeePage(pageById(pid), role))
  })
}

export function visiblePagesForSection(section, role) {
  if (!section) return []
  return section.pages.map(pageById).filter((p) => canSeePage(p, role))
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

/** Quyền xem trang theo vai trò: support chỉ xem trang không có restricted/superadminOnly. */
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

const SECTION_SEARCH_MAP = [
  { sectionId: 'overview', keys: ['tong quan', 'overview'] },
  { sectionId: 'families', keys: ['gia dinh', 'families'] },
  { sectionId: 'teachers', keys: ['giao vien', 'giao vien va lop', 'teachers'] },
  { sectionId: 'learning', keys: ['hoc tap', 'learning'] },
  { sectionId: 'ai-studio', keys: ['ai studio', 'studio'] },
  { sectionId: 'ai-safety', keys: ['an toan ai', 'an toan', 'safety'] },
  { sectionId: 'themes', keys: ['giao dien app', 'giao dien', 'themes'] },
  { sectionId: 'ops', keys: ['van hanh', 'ops', 'ha tang'] },
  { sectionId: 'admin-mgnt', keys: ['quan tri', 'admin', 'quan tri vien'] },
]

/** Ô tìm chung: chữ khớp tên mục/trang thì mở trang đầu tiên của mục/trang đó; không thì tìm trong Gia đình (?q=) */
export function resolveSearch(query, role) {
  const q = foldVi(query)
  if (!q) return null

  // 1. Kiểm tra từ khoá tên mục
  for (const sMap of SECTION_SEARCH_MAP) {
    if (sMap.keys.some((k) => k === q || q.startsWith(k))) {
      const sec = ADMIN_SECTIONS.find((s) => s.id === sMap.sectionId)
      if (sec) {
        const vis = visiblePagesForSection(sec, role)
        if (vis.length > 0) return { pageId: vis[0].id, search: '' }
      }
    }
  }

  // 2. Kiểm tra tên trang hoặc từ khoá trang
  const pages = visiblePages(role)
  const hit =
    pages.find((p) => foldVi(p.label) === q || foldVi(p.tabLabel) === q) ||
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
