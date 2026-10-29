import React from 'react'
import { isChunkLoadError, reloadForNewVersion } from './lazyReload.js'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo)
    // Gói 35: lỗi tải file của bản cũ (vừa deploy bản mới) → tự tải lại trang một lần
    if (isChunkLoadError(error)) reloadForNewVersion()
    try {
      if (typeof window !== 'undefined' && typeof window.__reportClientError === 'function') {
        window.__reportClientError(error, errorInfo)
      }
    } catch (e) {}
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div
          className="card coral pop"
          style={{
            margin: '16px auto',
            maxWidth: 420,
            border: '2px solid #EF4444',
            background: 'var(--c-surface, #fff)',
            padding: 16,
            borderRadius: 16,
          }}
        >
          <span className="lbl coral" style={{ display: 'inline-block', marginBottom: 6 }}>
            ⚠️ Có lỗi nhỏ, thử lại nhé
          </span>
          <p style={{ margin: '6px 0 12px', fontSize: 13.5, color: 'var(--c-text, #333)' }}>
            {isChunkLoadError(this.state.error)
              ? 'App vừa có bản mới. Bấm Thử lại để tải bản mới nhé!'
              : (this.props.message || 'Ứng dụng gặp một lỗi nhỏ khi hiển thị. Bấm thử lại nhé!')}
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn solid"
              style={{ padding: '8px 14px', fontSize: 13 }}
              onClick={() => {
                // Lỗi tải file bản cũ: thử lại trong trang không khỏi (React giữ lỗi cũ), phải tải lại trang
                if (isChunkLoadError(this.state.error)) {
                  window.location.reload()
                  return
                }
                this.setState({ hasError: false, error: null })
                if (this.props.onReset) this.props.onReset()
              }}
            >
              🔄 Thử lại
            </button>
            {this.props.onClose && (
              <button
                className="btn ghost"
                style={{ padding: '8px 14px', fontSize: 13 }}
                onClick={this.props.onClose}
              >
                Đóng
              </button>
            )}
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
