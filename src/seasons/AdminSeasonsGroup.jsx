/* ============================================================
   ĐỢT 16 · ADMIN · NHÓM "THEO MÙA" TRONG TRANG GIAO DIỆN APP
   Mỗi bộ một thẻ: xem trước 2 màn, công tắc gợi ý đầu mùa, khung ngày sửa được
   (Tết: bảng ngày mùng 1 theo năm), số gia đình đang dùng.
   Không xoá được 3 bộ này; có nút xem trước toàn màn.
   Ghi qua PUT /api/v1/admin/seasons (máy chủ kiểm vai trò và ghi nhật ký thao tác).
   ============================================================ */
import React, { useEffect, useState } from 'react'
import { adminFetch } from '../adminApi'
import { SEASONAL_THEMES } from '../themes'
import { ThemeTwoScreenPreview } from '../themes/ThemeTwoScreenPreview'
import { normalizeSeasonsConfig, seasonWindow, shortDate, vnToday, isIsoDate } from './seasonLogic'
import { toast } from '../utils'

const S = {
  card: { border: '1px solid var(--adm-border, #E2E8F0)', borderRadius: 14, padding: 16, background: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: 12 },
  label: { fontSize: 12.5, fontWeight: 700, color: '#334155' },
  input: { border: '1px solid #CBD5E1', borderRadius: 8, padding: '7px 10px', fontSize: 13.5, minHeight: 38, color: '#0F172A', background: '#FFFFFF', width: '100%', minWidth: 0, boxSizing: 'border-box' },
  muted: { fontSize: 12.5, color: '#475569', margin: 0, lineHeight: 1.45 },
  btn: { border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#0F172A', borderRadius: 8, padding: '8px 12px', fontSize: 13, fontWeight: 700, cursor: 'pointer', minHeight: 38 },
  btnPrimary: { border: 0, background: '#4338CA', color: '#FFFFFF', borderRadius: 8, padding: '9px 16px', fontSize: 13.5, fontWeight: 800, cursor: 'pointer', minHeight: 40 },
}

/* 'MM-DD' ↔ 'D/M' */
const mdToShort = (md) => {
  const m = /^(\d{2})-(\d{2})$/.exec(md || '')
  return m ? `${+m[2]}/${+m[1]}` : ''
}
const shortToMd = (s) => {
  const m = /^\s*(\d{1,2})\s*\/\s*(\d{1,2})\s*$/.exec(s || '')
  if (!m) return null
  const d = +m[1]
  const mo = +m[2]
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null
  return `${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function Switch({ on, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: 0, background: 'transparent', cursor: 'pointer', padding: 4, minHeight: 40 }}
    >
      <span style={{ width: 42, height: 24, borderRadius: 999, background: on ? '#047857' : '#94A3B8', position: 'relative', display: 'inline-block' }}>
        <span style={{ position: 'absolute', top: 3, left: on ? 21 : 3, width: 18, height: 18, borderRadius: '50%', background: '#FFFFFF', transition: 'left .15s' }} />
      </span>
      <span style={{ fontSize: 13, fontWeight: 800, color: on ? '#065F46' : '#334155' }}>{on ? 'Đang bật gợi ý' : 'Đang tắt gợi ý'}</span>
    </button>
  )
}

export function AdminSeasonsGroup() {
  const [cfg, setCfg] = useState(() => normalizeSeasonsConfig(null))
  const [usage, setUsage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [serverReady, setServerReady] = useState(true)
  const [dirty, setDirty] = useState(false)
  const [preview, setPreview] = useState(null)
  const [drafts, setDrafts] = useState({})
  const [newYear, setNewYear] = useState('')
  const today = vnToday()

  const load = async () => {
    setLoading(true)
    try {
      const res = await adminFetch('/api/v1/admin/seasons')
      if (res.ok) {
        const j = await res.json()
        setCfg(normalizeSeasonsConfig(j.seasons))
        setUsage(j.usage || null)
        setServerReady(true)
      } else {
        setServerReady(false)
      }
    } catch (e) {
      setServerReady(false)
    } finally {
      setLoading(false)
      setDirty(false)
      setDrafts({})
    }
  }

  useEffect(() => {
    load()
  }, [])

  const update = (id, part) => {
    setCfg((c) => normalizeSeasonsConfig({ ...c, [id]: { ...c[id], ...part } }))
    setDirty(true)
  }

  const save = async () => {
    setSaving(true)
    try {
      const res = await adminFetch('/api/v1/admin/seasons', { method: 'PUT', body: JSON.stringify({ seasons: cfg }) })
      if (res.ok) {
        const j = await res.json()
        setCfg(normalizeSeasonsConfig(j.seasons))
        setDirty(false)
        toast('Đã lưu khung mùa. Gia đình sẽ nhận trong vòng 10 phút.')
      } else if (res.status === 403) {
        toast('Vai trò của bạn chưa được sửa bộ theo mùa.')
      } else {
        toast('Chưa lưu được. Máy chủ chưa nhận endpoint bộ theo mùa.')
      }
    } catch (e) {
      toast('Mất kết nối, chưa lưu được.')
    } finally {
      setSaving(false)
    }
  }

  const thisYear = +today.slice(0, 4)
  const tetYears = Object.keys(cfg.tet.dates).sort()

  const windowText = (id) => {
    if (id === 'tet') {
      const ws = [thisYear, thisYear + 1].map((y) => seasonWindow('tet', y, cfg)).filter(Boolean)
      if (!ws.length) return 'Chưa có ngày mùng 1 Tết cho năm nay và năm sau.'
      return ws.map((w) => `Tết ${w.key.slice(4)}: ${shortDate(w.start)} đến ${shortDate(w.end)}`).join(' · ')
    }
    const w = seasonWindow(id, thisYear, cfg)
    return w ? `Năm ${thisYear}: ${shortDate(w.start)} đến ${shortDate(w.end)}` : ''
  }

  return (
    <div className="admin-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h3 style={{ fontSize: 19, fontWeight: 800, margin: 0, color: '#0F172A' }}>Theo mùa</h3>
          <p style={{ ...S.muted, marginTop: 4, maxWidth: 640 }}>
            3 bộ dùng được quanh năm. Đến mùa, app chỉ gợi ý một lần cho mỗi gia đình, không tự đổi giao diện. Tắt gợi ý thì gia đình vẫn tự chọn được bộ đó.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" style={S.btn} onClick={load} disabled={loading}>
            {loading ? 'Đang tải...' : 'Tải lại'}
          </button>
          <button type="button" style={{ ...S.btnPrimary, opacity: dirty && !saving ? 1 : 0.6 }} onClick={save} disabled={!dirty || saving}>
            {saving ? 'Đang lưu...' : dirty ? 'Lưu khung mùa' : 'Đã lưu'}
          </button>
        </div>
      </div>

      {!serverReady && !loading && (
        <div role="status" style={{ background: '#FEF3C7', border: '1px solid #F59E0B', color: '#78350F', borderRadius: 10, padding: '10px 12px', fontSize: 13 }}>
          Máy chủ chưa có endpoint bộ theo mùa. Đang hiện khung mặc định; số gia đình đang dùng chưa đếm được.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {SEASONAL_THEMES.map((t) => {
          const c = cfg[t.id]
          const count = usage && typeof usage[t.id] === 'number' ? usage[t.id] : null
          return (
            <div key={t.id} style={S.card} data-testid={`admin-season-${t.id}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 24 }} aria-hidden="true">{t.icon}</span>
                  <div>
                    <b style={{ fontSize: 15.5, color: '#0F172A' }}>{t.name}</b>
                    <div style={{ fontSize: 12, color: '#475569' }}>Linh vật: {t.buddyName}</div>
                  </div>
                </div>
                <span style={{ fontSize: 11.5, fontWeight: 800, color: '#334155', background: '#F1F5F9', borderRadius: 999, padding: '3px 9px' }} title="Bộ theo mùa không xoá được">
                  🔒 Không xoá
                </span>
              </div>

              <ThemeTwoScreenPreview themeId={t.id} vars={t.vars} icon={t.icon} label={`Xem trước 2 màn của bộ ${t.name}`} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <Switch on={c.enabled} label={`Gợi ý đầu mùa cho bộ ${t.name}`} onChange={(v) => update(t.id, { enabled: v })} />
                <span style={{ fontSize: 12.5, color: '#334155', fontWeight: 700 }}>
                  {count === null ? 'Số gia đình đang dùng: chưa đếm được' : `${count} gia đình đang dùng`}
                </span>
              </div>

              {t.id !== 'tet' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {['start', 'end'].map((k) => {
                    const dk = `${t.id}-${k}`
                    const val = drafts[dk] !== undefined ? drafts[dk] : mdToShort(c[k])
                    const bad = drafts[dk] !== undefined && !shortToMd(drafts[dk])
                    return (
                      <label key={k} style={{ display: 'grid', gap: 4 }}>
                        <span style={S.label}>{k === 'start' ? 'Từ ngày (ngày/tháng)' : 'Đến ngày (ngày/tháng)'}</span>
                        <input
                          style={{ ...S.input, borderColor: bad ? '#B91C1C' : '#CBD5E1' }}
                          value={val}
                          inputMode="numeric"
                          placeholder="1/12"
                          aria-invalid={bad}
                          onChange={(e) => {
                            const v = e.target.value
                            setDrafts((d) => ({ ...d, [dk]: v }))
                            const md = shortToMd(v)
                            if (md) update(t.id, { [k]: md })
                          }}
                        />
                      </label>
                    )
                  })}
                </div>
              ) : (
                <div style={{ display: 'grid', gap: 8 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <label style={{ display: 'grid', gap: 4 }}>
                      <span style={S.label}>Số ngày trước mùng 1</span>
                      <input style={S.input} type="number" min={0} max={30} value={c.daysBefore} onChange={(e) => update('tet', { daysBefore: e.target.value })} />
                    </label>
                    <label style={{ display: 'grid', gap: 4 }}>
                      <span style={S.label}>Số ngày sau mùng 1</span>
                      <input style={S.input} type="number" min={0} max={30} value={c.daysAfter} onChange={(e) => update('tet', { daysAfter: e.target.value })} />
                    </label>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <caption style={{ textAlign: 'left', fontSize: 12.5, fontWeight: 700, color: '#334155', paddingBottom: 4 }}>
                      Ngày mùng 1 Tết theo năm (đối chiếu lịch âm Việt Nam)
                    </caption>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left', padding: '4px 6px', color: '#334155' }}>Năm</th>
                        <th style={{ textAlign: 'left', padding: '4px 6px', color: '#334155' }}>Mùng 1</th>
                        <th style={{ textAlign: 'left', padding: '4px 6px', color: '#334155' }}>Khung gợi ý</th>
                        <th aria-label="Xoá năm" />
                      </tr>
                    </thead>
                    <tbody>
                      {tetYears.map((y) => {
                        const w = seasonWindow('tet', +y, cfg)
                        return (
                          <tr key={y} style={{ borderTop: '1px solid #E2E8F0' }}>
                            <td style={{ padding: '4px 6px', fontWeight: 800 }}>{y}</td>
                            <td style={{ padding: '4px 6px' }}>
                              <input
                                type="date"
                                aria-label={`Mùng 1 Tết năm ${y}`}
                                style={{ ...S.input, minHeight: 34, padding: '4px 6px' }}
                                value={cfg.tet.dates[y]}
                                min={`${y}-01-01`}
                                max={`${y}-02-28`}
                                onChange={(e) => {
                                  if (isIsoDate(e.target.value) && e.target.value.slice(0, 4) === y) update('tet', { dates: { ...cfg.tet.dates, [y]: e.target.value } })
                                }}
                              />
                            </td>
                            <td style={{ padding: '4px 6px', color: '#334155' }}>{w ? `${shortDate(w.start)} đến ${shortDate(w.end)}` : ''}</td>
                            <td>
                              <button
                                type="button"
                                style={{ ...S.btn, padding: '4px 8px', minHeight: 32 }}
                                aria-label={`Bỏ năm ${y}`}
                                onClick={() => update('tet', { dates: { ...cfg.tet.dates, [y]: null } })}
                              >
                                Bỏ
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      type="date"
                      aria-label="Thêm ngày mùng 1 Tết của năm khác"
                      style={{ ...S.input, flex: 1 }}
                      value={newYear}
                      onChange={(e) => setNewYear(e.target.value)}
                    />
                    <button
                      type="button"
                      style={S.btn}
                      onClick={() => {
                        if (!isIsoDate(newYear)) {
                          toast('Chọn ngày mùng 1 Tết trước đã.')
                          return
                        }
                        update('tet', { dates: { ...cfg.tet.dates, [newYear.slice(0, 4)]: newYear } })
                        setNewYear('')
                      }}
                    >
                      Thêm năm
                    </button>
                  </div>
                </div>
              )}

              <p style={S.muted}>{windowText(t.id)}</p>

              <button type="button" style={S.btn} onClick={() => setPreview(t)}>
                Xem trước toàn màn
              </button>
            </div>
          )
        })}
      </div>

      {preview && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Xem trước bộ ${preview.name}`}
          style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15, 23, 42, 0.72)', display: 'grid', placeItems: 'center', padding: 16 }}
          onClick={() => setPreview(null)}
        >
          <div style={{ background: '#FFFFFF', borderRadius: 18, padding: 20, display: 'grid', gap: 14, maxWidth: '96vw' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <b style={{ fontSize: 17, color: '#0F172A' }}>
                {preview.icon} {preview.name}
              </b>
              <button type="button" style={S.btn} onClick={() => setPreview(null)}>
                Đóng
              </button>
            </div>
            <ThemeTwoScreenPreview themeId={preview.id} vars={preview.vars} icon={preview.icon} scale={2.6} label={`Màn chính và Hỏi con của bộ ${preview.name}`} />
            <p style={S.muted}>{preview.desc}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminSeasonsGroup
