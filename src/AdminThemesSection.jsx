/* ============================================================
   🎨 ADMIN: QUẢN LÝ GIAO DIỆN APP (THEMES CONFIG)
   Quản lý 8 bộ giao diện, bật/tắt hiển thị, chọn bộ mặc định
   Đồng bộ Cloudflare D1 KV key: app_config:themes
   ============================================================ */
import React, { useState, useEffect } from 'react'
import { THEMES, DEFAULT_THEME } from './themes'
import { dbKvGet, dbKvSet } from './api'
import { toast } from './utils'
import { Check, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react'

const THEMES_CONFIG_KEY = 'app_config:themes'

export function AdminThemesSection() {
  const [config, setConfig] = useState({
    default: DEFAULT_THEME,
    enabled: THEMES.map((t) => t.id),
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // 1. Tải cấu hình từ Cloudflare D1 KV
  const loadConfig = async () => {
    setLoading(true)
    try {
      const val = await dbKvGet(THEMES_CONFIG_KEY)
      if (val && typeof val === 'object' && Array.isArray(val.enabled)) {
        setConfig({
          default: val.default || DEFAULT_THEME,
          enabled: val.enabled,
        })
      }
    } catch (e) {
      console.warn('Load themes config failed:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadConfig()
  }, [])

  // 2. Bật / Tắt một bộ giao diện
  const toggleTheme = (themeId) => {
    const isCurrentlyEnabled = config.enabled.includes(themeId)
    if (isCurrentlyEnabled && config.enabled.length <= 1) {
      toast('Phải giữ lại ít nhất 1 bộ giao diện đang bật!')
      return
    }
    const newEnabled = isCurrentlyEnabled
      ? config.enabled.filter((id) => id !== themeId)
      : [...config.enabled, themeId]

    // Nếu tắt đúng bộ đang làm mặc định thì chọn bộ đầu tiên còn lại làm mặc định
    let newDefault = config.default
    if (isCurrentlyEnabled && config.default === themeId) {
      newDefault = newEnabled[0]
    }

    setConfig({ default: newDefault, enabled: newEnabled })
  }

  // 3. Đặt bộ mặc định
  const setDefaultTheme = (themeId) => {
    if (!config.enabled.includes(themeId)) {
      toast('Bộ này đang bị tắt, hãy bật trước khi đặt làm mặc định!')
      return
    }
    setConfig((prev) => ({ ...prev, default: themeId }))
  }

  // 4. Lưu lên Cloudflare KV
  const saveToCloud = async () => {
    setSaving(true)
    try {
      const ok = await dbKvSet(THEMES_CONFIG_KEY, config)
      if (ok) {
        toast('Đã lưu cấu hình 8 bộ giao diện lên Cloudflare KV ☁️')
      } else {
        toast('Lỗi khi lưu lên Cloudflare!')
      }
    } catch (e) {
      toast('Lỗi kết nối Cloudflare!')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-card" style={{ padding: 24, marginTop: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: 20, fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            🎨 Quản lý 8 Bộ Giao Diện Ứng Dụng
          </h3>
          <p style={{ margin: '4px 0 0', color: 'var(--adm-sub)', fontSize: 13.5 }}>
            Bật/tắt các bộ hiển thị cho phụ huynh, chỉ định bộ giao diện mặc định khi gia đình mới mở app.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="admin-btn sm"
            onClick={loadConfig}
            disabled={loading}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Tải lại
          </button>
          <button
            className="admin-btn sm solid"
            onClick={saveToCloud}
            disabled={saving}
            style={{ background: '#4F46E5', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Check size={15} /> {saving ? 'Đang lưu...' : '☁️ Lưu lên Cloudflare'}
          </button>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
        }}
      >
        {THEMES.map((theme) => {
          const isEnabled = config.enabled.includes(theme.id)
          const isDefault = config.default === theme.id

          return (
            <div
              key={theme.id}
              style={{
                border: isDefault ? '2px solid #4F46E5' : '1px solid var(--adm-border)',
                borderRadius: 14,
                padding: 16,
                background: isEnabled ? '#FFFFFF' : '#F8FAFC',
                opacity: isEnabled ? 1 : 0.65,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              {/* Header card */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 22 }}>{theme.icon}</span>
                  <div>
                    <b style={{ fontSize: 15, color: '#0F172A' }}>{theme.name}</b>
                    <div style={{ fontSize: 11, color: '#64748B' }}>id: `{theme.id}`</div>
                  </div>
                </div>
                <label className="switch" style={{ cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={() => toggleTheme(theme.id)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span className="slider round" />
                </label>
              </div>

              {/* Swatches màu */}
              <div style={{ display: 'flex', gap: 4 }}>
                {theme.swatches.map((color, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: 18,
                      borderRadius: 4,
                      background: color,
                      border: '1px solid rgba(0,0,0,0.08)',
                    }}
                    title={color}
                  />
                ))}
              </div>

              {/* Mô tả */}
              <p style={{ fontSize: 12.5, color: '#475569', margin: 0, lineHeight: 1.4 }}>
                {theme.desc}
              </p>

              {/* Font info */}
              <div style={{ fontSize: 11.5, color: '#64748B' }}>
                Font: <b>{theme.fontHead.split(',')[0]}</b> / {theme.fontBody.split(',')[0]}
              </div>

              {/* Nút đặt mặc định */}
              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {isDefault ? (
                  <span
                    style={{
                      fontSize: 11.5,
                      fontWeight: 800,
                      color: '#4F46E5',
                      background: '#EEF2FF',
                      padding: '3px 8px',
                      borderRadius: 6,
                    }}
                  >
                    ⭐ Mặc định toàn app
                  </span>
                ) : (
                  <button
                    onClick={() => setDefaultTheme(theme.id)}
                    disabled={!isEnabled}
                    style={{
                      fontSize: 11.5,
                      fontWeight: 600,
                      color: isEnabled ? '#475569' : '#94A3B8',
                      background: 'none',
                      border: 'none',
                      cursor: isEnabled ? 'pointer' : 'not-allowed',
                      padding: 0,
                      textDecoration: 'underline',
                    }}
                  >
                    Đặt làm mặc định
                  </button>
                )}
                <span style={{ fontSize: 11, color: isEnabled ? '#16A34A' : '#DC2626', fontWeight: 700 }}>
                  {isEnabled ? '✓ Đang bật' : '✕ Đã tắt'}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
