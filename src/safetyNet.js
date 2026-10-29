// Gói 33 · B3: lưới an toàn ngoài cùng. Nếu sau một lỗi #root bị gỡ trống (React sập cả cây),
// vẽ một màn HTML tĩnh (không React) "Có lỗi nhỏ, bấm để tải lại" và gửi lỗi về log.
const STATIC_ID = 'kch-static-crash'

export function rootIsEmpty(doc = document) {
  const root = doc.getElementById('root')
  return !root || root.childElementCount === 0
}

export function showStaticCrash(doc = document) {
  if (doc.getElementById(STATIC_ID)) return false
  const box = doc.createElement('div')
  box.id = STATIC_ID
  box.setAttribute('role', 'alert')
  box.style.cssText = 'position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:16px;background:#FFF8EC;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;'
  const card = doc.createElement('div')
  card.style.cssText = 'max-width:320px;width:100%;text-align:center;background:#fff;border-radius:16px;padding:28px 20px;box-shadow:0 6px 24px rgba(59,42,69,.12);color:#3B2A45;'
  const title = doc.createElement('p')
  title.textContent = 'Có lỗi nhỏ, bấm để tải lại'
  title.style.cssText = 'font-size:17px;font-weight:800;margin:0 0 8px;'
  const sub = doc.createElement('p')
  sub.textContent = 'Bài và dữ liệu của gia đình vẫn được giữ nguyên.'
  sub.style.cssText = 'font-size:13px;margin:0 0 18px;color:#6B5B73;'
  const btn = doc.createElement('button')
  btn.type = 'button'
  btn.textContent = 'Tải lại'
  btn.style.cssText = 'min-height:44px;padding:0 28px;border:none;border-radius:999px;background:#E8833A;color:#fff;font-size:15px;font-weight:800;cursor:pointer;'
  btn.addEventListener('click', () => { try { doc.defaultView.location.reload() } catch { /* ignore */ } })
  card.append(title, sub, btn)
  box.append(card)
  doc.body.append(box)
  return true
}

/** Theo dõi lỗi toàn cục; vẽ màn tĩnh khi #root trống. report(error, extra) gửi log. */
export function installSafetyNet(report = () => {}, { delayMs = 300 } = {}) {
  if (typeof window === 'undefined' || window.__kchSafetyNet) return
  window.__kchSafetyNet = true
  const check = (error) => {
    setTimeout(() => {
      if (rootIsEmpty() && showStaticCrash()) {
        try { report(error instanceof Error ? error : new Error(String(error || 'root_empty')), { kind: 'root_empty' }) } catch { /* ignore */ }
      }
    }, delayMs)
  }
  window.addEventListener('error', (e) => check(e.error || e.message))
  window.addEventListener('unhandledrejection', (e) => check(e.reason))
  window.__kchCheckRoot = check
}
