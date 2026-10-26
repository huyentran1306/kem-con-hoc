import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { DialogHost } from './dialog'
import './styles.css'
import './themes.css'
import './themes/motion.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <DialogHost />
  </React.StrictMode>
)