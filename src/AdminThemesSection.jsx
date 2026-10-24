/* ============================================================
   🎨 ADMIN: QUẢN LÝ GIAO DIỆN APP (THEMES CONFIG)
   Quản lý 8 bộ giao diện, bật/tắt hiển thị, chọn bộ mặc định
   Đồng bộ Cloudflare D1 KV key: app_config:themes
   ============================================================ */
import React, { useState, useEffect } from 'react'
import { THEMES, DEFAULT_THEME, getTheme, applyTheme } from './themes'
import { dbKvGet, dbKvSet } from './api'
import { toast } from './utils'
import { Check, ShieldAlert, Sparkles, RefreshCw, Star } from 'lucide-react'

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
      let val = await dbKvGet(THEMES_CONFIG_KEY)
      if (!val) {
        val = await dbKvGet('app_config%3Athemes')
      }
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

  // 2. Bật / Tắt một bộ giao diện (tự động lưu lên Cloudflare)
  const toggleTheme = async (themeId) => {
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

    const nextConfig = { default: newDefault, enabled: newEnabled }
    setConfig(nextConfig)

    try {
      await Promise.all([
        dbKvSet('app_config:themes', nextConfig),
        dbKvSet('app_config%3Athemes', nextConfig),
      ])
      const themeObj = getTheme(themeId)
      toast(isCurrentlyEnabled ? `Đã tắt bộ "${themeObj?.name || themeId}"` : `Đã bật bộ "${themeObj?.name || themeId}"`)
    } catch (e) {
      console.warn('Auto-save theme toggle error:', e)
    }
  }

  // 3. Đặt bộ mặc định (cờ mặc định - bấm là đổi và auto-save ngay lập tức)
  const setDefaultTheme = async (themeId) => {
    if (config.default === themeId) {
      const themeObj = getTheme(themeId)
      toast(`Bộ "${themeObj?.name || themeId}" hiện đã là mặc định toàn app rồi ⭐`)
      return
    }

    // Nếu bộ đang tắt mà được chọn làm mặc định -> tự động bật bộ này lên
    let newEnabled = [...config.enabled]
    if (!newEnabled.includes(themeId)) {
      newEnabled.push(themeId)
    }

    const nextConfig = { default: themeId, enabled: newEnabled }
    setConfig(nextConfig)

    // Áp dụng thử preview cho theme này
    try {
      applyTheme(themeId, 'full')
    } catch (e) { }

    // Auto-save lên Cloudflare KV cả 2 dạng key (literal & encoded)
    try {
      await Promise.all([
        dbKvSet('app_config:themes', nextConfig),
        dbKvSet('app_config%3Athemes', nextConfig),
      ])
      const themeObj = getTheme(themeId)
      toast(`Đã đặt "${themeObj?.name || themeId}" làm mặc định toàn app ⭐`)
    } catch (e) {
      console.warn('Auto-save default theme error:', e)
      toast('Đã đổi tạm thời, vui lòng bấm "Lưu lên Cloudflare" để chốt!')
    }
  }

  // 4. Lưu thủ công lên Cloudflare KV
  const saveToCloud = async () => {
    setSaving(true)
    try {
      const [ok1, ok2] = await Promise.all([
        dbKvSet('app_config:themes', config),
        dbKvSet('app_config%3Athemes', config),
      ])
      if (ok1 || ok2) {
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h3 style={{ fontSize: 20, fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            🎨 Quản lý 8 Bộ Giao Diện Ứng Dụng
          </h3>
          <p style={{ margin: '4px 0 0', color: 'var(--adm-sub)', fontSize: 13.5 }}>
            Bật/tắt các bộ hiển thị cho phụ huynh, chỉ định cờ giao diện mặc định (bấm nút là đổi và tự động lưu đám mây).
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            className="admin-btn sm"
            onClick={loadConfig}
            disabled={loading}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Tải lại
          </button>
          <button
            type="button"
            className="admin-btn sm solid"
            onClick={saveToCloud}
            disabled={saving}
            style={{ background: '#4F46E5', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Check size={15} /> {saving ? 'Đang lưu...' : '☁️ Đã tự lưu'}
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
                opacity: isEnabled ? 1 : 0.75,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                boxShadow: isDefault ? '0 4px 16px rgba(79, 70, 229, 0.12)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              {/* Header card */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 24 }}>{theme.icon}</span>
                  <div>
                    <b style={{ fontSize: 15, color: '#0F172A' }}>{theme.name}</b>
                    <div style={{ fontSize: 11, color: '#64748B' }}>id: `{theme.id}`</div>
                  </div>
                </div>

                {/* Switch bật/tắt */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: isEnabled ? '#16A34A' : '#94A3B8' }}>
                    {isEnabled ? 'Bật' : 'Tắt'}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleTheme(theme.id)}
                    title={isEnabled ? 'Bấm để tắt bộ này' : 'Bấm để bật bộ này'}
                    style={{
                      width: 40,
                      height: 22,
                      borderRadius: 999,
                      background: isEnabled ? '#10B981' : '#CBD5E1',
                      border: 'none',
                      position: 'relative',
                      cursor: 'pointer',
                      padding: 2,
                      transition: 'background 0.2s ease',
                      display: 'inline-flex',
                      alignItems: 'center',
                    }}
                  >
                    <span
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        background: '#FFFFFF',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        transform: isEnabled ? 'translateX(18px)' : 'translateX(0px)',
                        transition: 'transform 0.2s ease',
                        display: 'block',
                      }}
                    />
                  </button>
                </div>
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

              {/* CỜ / NÚT ĐẶT LÀM MẶC ĐỊNH */}
              <div
                style={{
                  marginTop: 'auto',
                  paddingTop: 10,
                  borderTop: '1px solid #F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                }}
              >
                <button
                  type="button"
                  onClick={() => setDefaultTheme(theme.id)}
                  style={{
                    flex: 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '8px 12px',
                    borderRadius: 8,
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: isDefault ? '2px solid #4F46E5' : '1px solid #CBD5E1',
                    background: isDefault ? '#EEF2FF' : '#FFFFFF',
                    color: isDefault ? '#4338CA' : '#334155',
                    boxShadow: isDefault ? '0 2px 6px rgba(79, 70, 229, 0.15)' : 'none',
                    transition: 'all 0.18s ease',
                  }}
                  title={isDefault ? 'Bộ này đang là mặc định toàn app' : 'Bấm để đặt bộ này làm mặc định'}
                >
                  <Star
                    size={15}
                    fill={isDefault ? '#4F46E5' : 'none'}
                    color={isDefault ? '#4F46E5' : '#64748B'}
                  />
                  <span>{isDefault ? '⭐ Mặc định toàn app' : 'Đặt làm mặc định'}</span>
                </button>

                {isDefault && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: '#4F46E5',
                      background: '#E0E7FF',
                      padding: '4px 8px',
                      borderRadius: 6,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    ✓ Đang chọn
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
