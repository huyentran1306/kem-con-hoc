import React, { useState, useEffect, useRef } from 'react'
import { shareWeeklyReport } from './api'
import { soundPop, soundSuccess } from './audio'

export function ZaloReportModal({ child, stats, weekLabel, onClose, toast, boom, currentTheme = 'candy' }) {
  const [expiresDays, setExpiresDays] = useState(7)
  const [hideCoParents, setHideCoParents] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [shareResult, setShareResult] = useState(null)
  const [imgBlob, setImgBlob] = useState(null)
  const [imgUrl, setImgUrl] = useState('')
  const canvasRef = useRef(null)

  const isZaloInApp = typeof navigator !== 'undefined' && /Zalo/i.test(navigator.userAgent)

  // Lọc sticker thật (loại bỏ sample: true từ Prompt 06)
  const realStickers = (stats?.stickerHistory || []).filter((s) => !s.sample && s.week === 'Tuần này')
  const totalSessions = stats?.history?.filter((h) => h.week === 'Tuần này')?.length || (stats?.sessionsMom || 0) + (stats?.sessionsDad || 0)
  const totalMinutes = Math.round(totalSessions * 18) // ước lượng ~18p/ca
  const independentCount = stats?.history?.filter((h) => h.teachBackRating === 'independent' || h.teach_back_rating === 'tu_lam')?.length || totalSessions
  const independentRatio = totalSessions > 0 ? Math.round((independentCount / totalSessions) * 100) + '%' : '100%'

  const weakList = (stats?.weak || []).map((w) => w.n).join(', ') || 'Chưa có dạng bài vướng'
  const strongList = (stats?.strong || []).map((s) => s.n).join(', ') || 'Làm quen dạng bài tốt'

  const coParents = hideCoParents
    ? []
    : [
        { name: 'Mẹ', sessions: stats?.sessionsMom || 0 },
        { name: 'Bố', sessions: stats?.sessionsDad || 0 },
      ].filter((p) => p.sessions > 0)

  // Vẽ thẻ ảnh báo cáo 1080 x 1350 px trên Canvas
  const generateCanvasImage = async (shareUrl) => {
    const canvas = document.createElement('canvas')
    canvas.width = 1080
    canvas.height = 1350
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    // Background gradient theo theme
    const grad = ctx.createLinearGradient(0, 0, 0, 1350)
    if (currentTheme === 'bear') {
      grad.addColorStop(0, '#FFFBEB')
      grad.addColorStop(1, '#FEF3C7')
    } else if (currentTheme === 'garden') {
      grad.addColorStop(0, '#F0FDF4')
      grad.addColorStop(1, '#DCFCE7')
    } else if (currentTheme === 'aurora') {
      grad.addColorStop(0, '#0F172A')
      grad.addColorStop(1, '#1E293B')
    } else {
      // Default candy
      grad.addColorStop(0, '#FDF4FF')
      grad.addColorStop(0.5, '#FAF5FF')
      grad.addColorStop(1, '#F3E8FF')
    }
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 1080, 1350)

    // Khung viền bo tròn trắng bên trong
    ctx.fillStyle = currentTheme === 'aurora' ? '#1E293B' : '#FFFFFF'
    ctx.shadowColor = 'rgba(0, 0, 0, 0.08)'
    ctx.shadowBlur = 40
    ctx.shadowOffsetY = 15
    ctx.beginPath()
    ctx.roundRect(60, 60, 960, 1230, 48)
    ctx.fill()
    ctx.shadowColor = 'transparent'

    const textColor = currentTheme === 'aurora' ? '#F8FAFC' : '#1E1B4B'
    const subColor = currentTheme === 'aurora' ? '#94A3B8' : '#64748B'
    const brandColor = '#7C3AED'

    // Badge đỉnh
    ctx.fillStyle = '#EDE9FE'
    ctx.beginPath()
    ctx.roundRect(360, 110, 360, 48, 24)
    ctx.fill()
    ctx.fillStyle = '#6D28D9'
    ctx.font = 'bold 22px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('KÈM CON HỌC · BÁO CÁO TUẦN', 540, 142)

    // Tiêu đề
    ctx.fillStyle = textColor
    ctx.font = '900 64px sans-serif'
    ctx.fillText(`Tuần này của ${child?.name || 'Bé'}`, 540, 240)

    ctx.fillStyle = subColor
    ctx.font = '500 28px sans-serif'
    ctx.fillText(`${weekLabel || 'Tuần này'} · Đồng hành từng bước nhỏ cùng con`, 540, 290)

    // 3 Ô số liệu lớn
    const drawStatBox = (x, y, w, h, num, lbl, color, bg) => {
      ctx.fillStyle = bg
      ctx.beginPath()
      ctx.roundRect(x, y, w, h, 28)
      ctx.fill()
      ctx.fillStyle = color
      ctx.font = '900 68px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(String(num), x + w / 2, y + 85)
      ctx.fillStyle = subColor
      ctx.font = '600 24px sans-serif'
      ctx.fillText(lbl, x + w / 2, y + 130)
    }

    drawStatBox(110, 350, 260, 160, totalSessions, 'Buổi học', '#7C3AED', '#FAF5FF')
    drawStatBox(410, 350, 260, 160, totalMinutes + 'p', 'Phút kèm', '#D97706', '#FFFBEB')
    drawStatBox(710, 350, 260, 160, independentRatio, 'Tự làm được', '#059669', '#ECFDF5')

    // Thẻ Con đã vững & Con hay vướng
    const drawCard = (x, y, w, h, title, content, strokeColor, bgColor, textColorInner) => {
      ctx.fillStyle = bgColor
      ctx.strokeStyle = strokeColor
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.roundRect(x, y, w, h, 28)
      ctx.fill()
      ctx.stroke()
      ctx.textAlign = 'left'
      ctx.fillStyle = strokeColor
      ctx.font = 'bold 30px sans-serif'
      ctx.fillText(title, x + 35, y + 55)
      ctx.fillStyle = textColorInner
      ctx.font = '500 26px sans-serif'
      ctx.fillText(content.length > 50 ? content.slice(0, 48) + '…' : content, x + 35, y + 105)
    }

    drawCard(110, 550, 860, 150, '✨ Con đã vững:', strongList, '#10B981', '#F0FDF4', '#15803D')
    drawCard(110, 730, 860, 150, '💡 Điểm vướng cần lưu tâm:', weakList, '#F59E0B', '#FFFBEB', '#92400E')

    // Nhịp kèm của gia đình
    if (coParents.length > 0) {
      ctx.fillStyle = '#F1F5F9'
      ctx.beginPath()
      ctx.roundRect(110, 910, 860, 100, 24)
      ctx.fill()
      ctx.fillStyle = '#334155'
      ctx.font = '600 26px sans-serif'
      ctx.textAlign = 'left'
      const coText = '👨‍👩‍👧 Ai kèm: ' + coParents.map((p) => `${p.name} (${p.sessions} buổi)`).join(' · ')
      ctx.fillText(coText, 140, 970)
    }

    // Lời khuyên cuối tuần
    ctx.fillStyle = textColor
    ctx.font = 'italic 500 26px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('🌱 Lời khuyên cuối tuần: Ôn bài 5 phút nhẹ nhàng bằng que tính hoặc xếp hình!', 540, 1070)

    // Khung QR code & Brand footer
    ctx.fillStyle = '#EDE9FE'
    ctx.beginPath()
    ctx.roundRect(110, 1120, 860, 130, 24)
    ctx.fill()
    ctx.fillStyle = brandColor
    ctx.font = 'bold 30px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('📲 Quét mã hoặc bấm link để xem báo cáo chi tiết', 140, 1180)
    ctx.fillStyle = subColor
    ctx.font = '500 22px sans-serif'
    ctx.fillText(shareUrl ? shareUrl.replace(/^https?:\/\//, '') : 'kem-con-hoc-5xf.pages.dev', 140, 1220)

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/png')
    })
  }

  // Khởi tạo link chia sẻ & vẽ ảnh sẵn ngay khi mở
  useEffect(() => {
    let active = true
    async function init() {
      try {
        const snapshot = {
          childName: child?.name || 'Bé',
          totalSessions,
          totalMinutes,
          independentRatio,
          strongPoints: strongList,
          weakPoints: weakList,
          coParents,
          weekendAdvice: 'Cuối tuần cùng con đi chợ hoặc giải đố que tính 5 phút để kích hoạt sáng tạo nhé!',
        }

        const res = await shareWeeklyReport({
          childId: child?.id || 'c1',
          week: weekLabel || 'Tuần này',
          snapshot,
          expiresDays,
        })

        if (!active) return

        if (res.ok && res.shareUrl) {
          const origin = typeof window !== 'undefined' ? window.location.origin : ''
          const fullUrl = `${origin}${res.shareUrl}`
          setShareResult({ ...res, fullUrl })

          // Tạo ảnh canvas sẵn để khi bấm là share ngay
          const blob = await generateCanvasImage(fullUrl)
          if (active && blob) {
            setImgBlob(blob)
            setImgUrl(URL.createObjectURL(blob))
          }
        }
      } catch (err) {
        console.warn('Init share failed:', err)
      }
    }

    init()
    return () => {
      active = false
    }
  }, [expiresDays, hideCoParents])

  // Xử lý gửi báo cáo vào nhóm Zalo
  const handleShareToZalo = async () => {
    soundPop(600)
    setSharing(true)
    const shareUrl = shareResult?.fullUrl || window.location.origin
    const shareText = `Báo cáo tuần của ${child?.name || 'con'} trên Kèm Con Học (${totalSessions} buổi học, ${independentRatio} tự làm). Cả nhà xem chi tiết tại:`

    // Thử chia sẻ kèm file ảnh qua navigator.share
    if (imgBlob && typeof navigator !== 'undefined' && navigator.canShare) {
      const file = new File([imgBlob], `Bao_cao_tuan_${child?.name || 'con'}.png`, { type: 'image/png' })
      if (navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: `Báo cáo tuần của ${child?.name || 'Bé'}`,
            text: shareText,
            url: shareUrl,
          })
          soundSuccess()
          boom?.()
          toast('Đã gửi báo cáo vào Zalo thành công! 🎉')
          onClose()
          return
        } catch (e) {
          if (e.name !== 'AbortError') console.warn('Share file failed:', e)
        }
      }
    }

    // Fallback nếu không chia sẻ file được: Chia sẻ text + url
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Báo cáo tuần của ${child?.name || 'Bé'}`,
          text: shareText,
          url: shareUrl,
        })
        soundSuccess()
        toast('Đã mở chia sẻ Zalo! 📲')
        onClose()
        return
      } catch (e) {
        if (e.name !== 'AbortError') console.warn('Share text failed:', e)
      }
    }

    // Fallback cuối cùng: Mở Zalo Web và copy link
    window.open(`https://zalo.me/share?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`, '_blank')
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`)
      toast('Đã copy nội dung báo cáo & mở Zalo! 📋')
    } catch {
      toast('Đã mở Zalo 📲')
    }
    setSharing(false)
  }

  const handleDownloadImage = () => {
    if (!imgUrl) return
    const a = document.createElement('a')
    a.href = imgUrl
    a.download = `Bao_cao_tuan_${child?.name || 'con'}.png`
    a.click()
    toast('Đang tải ảnh báo cáo về máy… 📥')
  }

  const handleCopyLink = async () => {
    if (!shareResult?.fullUrl) return
    try {
      await navigator.clipboard.writeText(shareResult.fullUrl)
      toast('Đã copy link xem báo cáo tuần! 📋')
    } catch {
      toast('Không copy được, bạn copy thủ công nhé')
    }
  }

  return (
    <div className="sheet" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sheet-content" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <p className="title" style={{ margin: 0 }}>📲 Gửi báo cáo vào nhóm Zalo</p>
          <button className="round-btn" onClick={onClose} aria-label="Đóng">✕</button>
        </div>

        {/* Cảnh báo Zalo in-app */}
        {isZaloInApp && (
          <div
            style={{
              padding: '10px 12px',
              background: '#FEF3C7',
              border: '1px solid #FCD34D',
              borderRadius: 12,
              color: '#92400E',
              fontSize: 12.5,
              marginBottom: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>⚠️ Bạn đang mở app trong Zalo. Hãy bấm nút góc trên chọn <b>"Mở bằng trình duyệt"</b> để gửi được kèm file ảnh nét nhất nhé!</span>
          </div>
        )}

        {/* Xem trước ảnh báo cáo */}
        <div
          style={{
            background: '#F8FAFC',
            borderRadius: 16,
            padding: 12,
            border: '1.5px solid #E2E8F0',
            textAlign: 'center',
            marginBottom: 16,
          }}
        >
          {imgUrl ? (
            <img
              src={imgUrl}
              alt="Xem trước báo cáo"
              style={{
                width: '100%',
                maxHeight: 280,
                objectFit: 'contain',
                borderRadius: 12,
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              }}
            />
          ) : (
            <div style={{ padding: 40, color: '#64748B', fontSize: 13 }}>
              Đang tạo ảnh báo cáo tuần sắc nét… 🎨
            </div>
          )}
        </div>

        {/* Tuỳ chọn trước khi gửi */}
        <div className="card" style={{ padding: 14, marginBottom: 16 }}>
          <b style={{ fontSize: 13, color: '#334155', display: 'block', marginBottom: 10 }}>
            Tuỳ chỉnh báo cáo gửi đi:
          </b>

          {/* Chọn hạn link */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: '#475569' }}>Thời hạn link xem:</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {[7, 14].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setExpiresDays(d)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 8,
                    border: expiresDays === d ? '1.5px solid #7C3AED' : '1px solid #CBD5E1',
                    background: expiresDays === d ? '#F5F3FF' : '#FFFFFF',
                    color: expiresDays === d ? '#7C3AED' : '#64748B',
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  {d} ngày
                </button>
              ))}
            </div>
          </div>

          {/* Ẩn hiện người kèm */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: '#475569', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={hideCoParents}
              onChange={(e) => setHideCoParents(e.target.checked)}
            />
            <span>Không hiện dòng "Ai kèm" (chỉ gửi tiến độ của con)</span>
          </label>
        </div>

        {/* Nút gửi chính */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            className="btn solid"
            disabled={sharing || !shareResult}
            onClick={handleShareToZalo}
            style={{
              width: '100%',
              fontWeight: 800,
              fontSize: 15,
              background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
            }}
          >
            {sharing ? 'Đang mở chia sẻ…' : '💬 Gửi báo cáo vào nhóm Zalo'}
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button
              className="btn soft"
              onClick={handleDownloadImage}
              disabled={!imgUrl}
              style={{ fontSize: 13 }}
            >
              📥 Tải ảnh về máy
            </button>
            <button
              className="btn soft"
              onClick={handleCopyLink}
              disabled={!shareResult}
              style={{ fontSize: 13 }}
            >
              📋 Sao chép link
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
