// Gói 33 · A1: DANH SÁCH HEADER DÙNG CHUNG giữa frontend và Worker (ai-gateway-worker).
// Worker phải trả đúng chuỗi WORKER_ALLOW_HEADERS_VALUE trong Access-Control-Allow-Headers.
// Thêm header mới: thêm vào đây, deploy WORKER TRƯỚC, rồi mới deploy frontend.
// Test scripts/test-33-worker-headers.mjs quét src/ và fail nếu có header X- chưa khai báo ở đây.
export const WORKER_ALLOWED_HEADERS = Object.freeze([
  'Content-Type',
  'Authorization',
  'X-Prompt-Id',
  'X-Session-Id',
  'X-Problem-Text',
  'X-Family-Id',
  'X-Grade',
  'X-Book-Series',
  'X-Subject',
  'X-Child-Id',
  'X-Bypass-Cache',
  'X-Prefetch',
  'X-Hint-Question',
  'X-Xung-Ho',
  'X-Fix-Count',
  'X-Fix-Reason',
])

export const WORKER_ALLOW_HEADERS_VALUE = WORKER_ALLOWED_HEADERS.join(', ')

const ALLOWED_LOWER = new Set(WORKER_ALLOWED_HEADERS.map((h) => h.toLowerCase()))

export function isAllowedWorkerHeader(name) {
  return ALLOWED_LOWER.has(String(name || '').toLowerCase())
}
