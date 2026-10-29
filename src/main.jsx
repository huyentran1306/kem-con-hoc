import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { installSafetyNet } from './safetyNet.js'
import { reportClientError } from './clientErrors'
import { DialogHost } from './dialog'
import './styles.css'
import './themes.css'
import './themes/motion.css'
import './themes/khuon-moi.css'
import './themes/fix-33.css'

installSafetyNet(reportClientError)

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