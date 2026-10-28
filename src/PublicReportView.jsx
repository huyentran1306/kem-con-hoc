import React, { useState, useEffect } from 'react'
import { getPublicReport } from './api'

export function PublicReportView({ reportToken, onHome }) {
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await getPublicReport(reportToken)
        if (res.ok && res.report) {
          setReportData(res)
        } else {
          setErrorMsg(res.error?.message || 'Link báo cáo đã hết hạn hoặc bị thu hồi')
        }
      } catch {
        setErrorMsg('Không thể tải báo cáo. Vui lòng thử lại sau.')
      } finally {
        setLoading(false)
      }
    }
    if (reportToken) {
      load()
    }
  }, [reportToken])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
        <div style={{ textAlign: 'center', color: '#64748B' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
          <b>Đang tải báo cáo tuần của con…</b>
        </div>
      </div>
    )
  }

  if (errorMsg || !reportData) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: '#F8FAFC' }}>
        <div className="card" style={{ maxWidth: 400, textAlign: 'center', padding: 24, borderRadius: 20 }}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>⌛</div>
          <h3 style={{ fontSize: 18, color: '#1E293B', marginBottom: 8 }}>Báo cáo không khả dụng</h3>
          <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5, marginBottom: 18 }}>
            {errorMsg || 'Link báo cáo đã hết thời hạn chia sẻ (7 ngày) hoặc đã được phụ huynh thu hồi bảo mật.'}
          </p>
          <button className="btn solid" onClick={onHome} style={{ width: '100%' }}>
            Mở trang chủ Kèm Con Học 🏠
          </button>
        </div>
      </div>
    )
  }

  const { report, week } = reportData
  const rep = report || {}

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #FDF4FF 0%, #FAF5FF 50%, #F8FAFC 100%)', padding: '24px 16px' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 99, background: '#F3E8FF', color: '#7E22CE', textTransform: 'uppercase', letterSpacing: 1 }}>
            Kèm Con Học · Báo cáo tuần
          </span>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#4C1D95', margin: '8px 0 2px' }}>
            Tuần của {rep.childName || 'Bé'}
          </h1>
          <p style={{ fontSize: 12.5, color: '#64748B', margin: 0 }}>
            {week || 'Tuần này'} · Báo cáo được chụp tự động từ ứng dụng
          </p>
        </div>

        {/* 3 con số lớn */}
        <div className="card" style={{ padding: '16px 14px', borderRadius: 18, border: '2px solid #E9D5FF', marginBottom: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, textAlign: 'center' }}>
            <div style={{ background: '#FAF5FF', padding: '10px 6px', borderRadius: 14 }}>
              <span style={{ fontSize: 24, fontWeight: 900, color: '#7C3AED', display: 'block' }}>
                {rep.totalSessions || 0}
              </span>
              <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>Buổi học</span>
            </div>
            <div style={{ background: '#FFFBEB', padding: '10px 6px', borderRadius: 14 }}>
              <span style={{ fontSize: 24, fontWeight: 900, color: '#D97706', display: 'block' }}>
                {rep.totalMinutes || 0}
              </span>
              <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>Phút học</span>
            </div>
            <div style={{ background: '#ECFDF5', padding: '10px 6px', borderRadius: 14 }}>
              <span style={{ fontSize: 24, fontWeight: 900, color: '#059669', display: 'block' }}>
                {rep.independentRatio || '100%'}
              </span>
              <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>Tự làm được</span>
            </div>
          </div>
        </div>

        {/* Điểm vững & Điểm vướng */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          <div className="card" style={{ padding: '12px 14px', borderRadius: 16, border: '1px solid #BBF7D0', background: '#F0FDF4' }}>
            <b style={{ fontSize: 12.5, color: '#166534', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
              ✨ Con đã vững
            </b>
            <div style={{ fontSize: 12, color: '#15803D', lineHeight: 1.4 }}>
              {rep.strongPoints || 'Tính toán cơ bản, làm quen dạng bài'}
            </div>
          </div>
          <div className="card" style={{ padding: '12px 14px', borderRadius: 16, border: '1px solid #FED7AA', background: '#FFF7ED' }}>
            <b style={{ fontSize: 12.5, color: '#C2410C', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
              💡 Con đang rèn thêm
            </b>
            <div style={{ fontSize: 12, color: '#9A3412', lineHeight: 1.4 }}>
              {rep.weakPoints || 'Toán lời văn nhiều bước'}
            </div>
          </div>
        </div>

        {/* Ai kèm tuần này (nếu không bị tắt) */}
        {Array.isArray(rep.coParents) && rep.coParents.length > 0 && (
          <div className="card" style={{ padding: '12px 14px', borderRadius: 16, marginBottom: 14 }}>
            <b style={{ fontSize: 13, color: '#334155', display: 'block', marginBottom: 8 }}>
              👨‍👩‍👧 Nhịp kèm của gia đình:
            </b>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {rep.coParents.map((p, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 99,
                    background: '#F1F5F9',
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#475569',
                  }}
                >
                  {p.name}: <b>{p.sessions} buổi</b>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lời khuyên cuối tuần */}
        {rep.weekendAdvice && (
          <div
            className="card"
            style={{
              padding: '14px',
              borderRadius: 16,
              background: 'linear-gradient(135deg, #EFF6FF 0%, #EEF2FF 100%)',
              border: '1.5px solid #C7D2FE',
              marginBottom: 20,
            }}
          >
            <b style={{ fontSize: 13, color: '#312E81', display: 'block', marginBottom: 4 }}>
              🌱 Lời khuyên sư phạm cho con:
            </b>
            <div style={{ fontSize: 12.5, color: '#3730A3', lineHeight: 1.5 }}>
              {rep.weekendAdvice}
            </div>
          </div>
        )}

        <div style={{ textAlign: 'center' }}>
          <button
            className="btn solid"
            onClick={onHome}
            style={{
              width: '100%',
              fontWeight: 800,
              fontSize: 14,
              background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
            }}
          >
            Đăng nhập cùng Kèm Con Học 🦄
          </button>
        </div>
      </div>
    </div>
  )
}
