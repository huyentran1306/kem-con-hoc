import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { installSafetyNet } from './safetyNet.js'
import { installPreloadErrorReload } from './lazyReload.js'
import { reportClientError } from './clientErrors'
import { DialogHost } from './dialog'
import './styles.css'
import './themes.css'
import './themes/motion.css'
import './themes/khuon-moi.css'
import './themes/fix-33.css'
import './themes/fix-41.css'

installSafetyNet(reportClientError)
// Gói 35: chunk của bản cũ đã bị xoá sau deploy → tự tải lại trang lấy bản mới
installPreloadErrorReload()

createRoot(document.getElementById('root'), {
  // Gói 33 · B3: React 19 gỡ cả cây khi có lỗi không ai bắt; gửi log và để lưới an toàn vẽ màn tĩnh
  onUncaughtError: (error, info) => {
    console.error('[KCH] lỗi không bắt được, React đã gỡ cây:', error)
    reportClientError(error, { componentStack: info?.componentStack, kind: 'uncaught' })
    window.__kchCheckRoot?.(error)
  },
}).render(
  <React.StrictMode>
    <App />
    <DialogHost />
  </React.StrictMode>
)