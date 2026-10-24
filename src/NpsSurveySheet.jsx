import { useState } from 'react'
import { GATEWAY } from './api'
import { toast } from './utils'

const NPS_TAGS = [
  'Con tự giác hơn',
  'Bớt cáu khi dạy con',
  'AI giảng dễ hiểu',
  'Còn chậm',
  'Còn sai',
]

export function NpsSurveyCard({ familyId, memberId, sessionCount = 10, onDismiss }) {
  const [score, setScore] = useState(null)
  const [selectedTags, setSelectedTags] = useState([])
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleToggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const handleSnooze = () => {
    try {
      localStorage.setItem('kem-con-hoc:nps-snooze-until', String(sessionCount + 5))
    } catch (e) {}
    if (onDismiss) onDismiss()
  }

  const handleNeverAsk = () => {
    try {
      localStorage.setItem('kem-con-hoc:nps-opt-out', 'never')
    } catch (e) {}
    toast('Đã ghi nhận, hệ thống sẽ không hỏi lại khảo sát này.')
    if (onDismiss) onDismiss()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (score === null) {
      toast('Vui lòng chọn mức điểm từ 0 đến 10')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`${GATEWAY}/api/v1/nps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          family_id: familyId || 'fam_guest',
          member_id: memberId || 'parent',
          score,
          tags: selectedTags.join(', '),
          comment: comment.trim(),
        }),
      })

      if (res.ok) {
        setSubmitted(true)
        try {
          localStorage.setItem('kem-con-hoc:nps-opt-out', 'done')
        } catch (e) {}
        toast('Cảm ơn phụ huynh đã đóng góp ý kiến quý báu! ❤️')
      } else {
        toast('Không gửi được khảo sát, vui lòng thử lại sau.')
      }
    } catch (e) {
      toast('Lỗi kết nối khi gửi khảo sát')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div
        className="card mint pop"
        style={{
          border: '2px solid #10B981',
          background: '#ECFDF5',
          textAlign: 'center',
          padding: '16px',
          margin: '12px 0',
        }}
      >
        <span style={{ fontSize: '32px' }}>🥰</span>
        <h4 style={{ margin: '8px 0 4px 0', color: '#065F46', fontSize: '15px' }}>
          Cảm ơn bạn đã đồng hành cùng Kèm Con Học!
        </h4>
        <p style={{ margin: 0, fontSize: '12px', color: '#047857' }}>
          Đóng góp của bạn giúp đội ngũ phát triển AI hoàn thiện mỗi ngày.
        </p>
      </div>
    )
  }

  return (
    <div
      className="card pop"
      style={{
        border: '2px solid #3B82F6',
        background: '#EFF6FF',
        padding: '16px',
        margin: '14px 0',
        borderRadius: '16px',
        boxShadow: '0 4px 14px rgba(59, 130, 246, 0.12)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <span className="pill" style={{ background: '#DBEAFE', color: '#1E40AF', fontWeight: 700 }}>
          📊 Khảo sát 1 phút
        </span>
        <button
          type="button"
          onClick={handleSnooze}
          style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '12px', cursor: 'pointer' }}
        >
          Để sau
        </button>
      </div>

      <div style={{ fontSize: '14px', fontWeight: 700, color: '#1E3A8A', margin: '4px 0 10px 0', lineHeight: 1.4 }}>
        Bạn sẵn lòng giới thiệu Kèm Con Học cho bạn bè hoặc người thân đến mức nào?
      </div>

      {/* 0 to 10 rating scale */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '4px', margin: '12px 0' }}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => setScore(num)}
            style={{
              flex: 1,
              height: '36px',
              borderRadius: '50%',
              border: score === num ? '2px solid #2563EB' : '1px solid #BFDBFE',
              background: score === num ? '#2563EB' : '#FFFFFF',
              color: score === num ? '#FFFFFF' : '#1E40AF',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: score === num ? '0 2px 6px rgba(37,99,235,0.35)' : 'none',
            }}
          >
            {num}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748B', marginBottom: '12px' }}>
        <span>0: Không bao giờ</span>
        <span>10: Rất sẵn lòng</span>
      </div>

      {/* Chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
        {NPS_TAGS.map((tag) => {
          const isSelected = selectedTags.includes(tag)
          return (
            <button
              key={tag}
              type="button"
              onClick={() => handleToggleTag(tag)}
              style={{
                padding: '4px 10px',
                borderRadius: '99px',
                fontSize: '12px',
                border: isSelected ? '1.5px solid #2563EB' : '1px solid #CBD5E1',
                background: isSelected ? '#DBEAFE' : '#FFFFFF',
                color: isSelected ? '#1E40AF' : '#475569',
                cursor: 'pointer',
                fontWeight: isSelected ? 700 : 500,
              }}
            >
              {tag}
            </button>
          )
        })}
      </div>

      {/* Optional feedback textarea */}
      <textarea
        rows="2"
        className="stitch-input"
        style={{
          width: '100%',
          boxSizing: 'border-box',
          fontSize: '13px',
          borderRadius: '8px',
          border: '1px solid #BFDBFE',
          padding: '8px 10px',
          background: '#FFFFFF',
          marginBottom: '10px',
          resize: 'none',
        }}
        placeholder="Chia sẻ thêm điều bạn thích hoặc mong muốn cải thiện..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          type="button"
          onClick={handleNeverAsk}
          style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '11px', cursor: 'pointer', textDecoration: 'underline' }}
        >
          Không hỏi lại
        </button>
        <button
          type="button"
          disabled={submitting || score === null}
          onClick={handleSubmit}
          className="stitch-btn-primary"
          style={{
            padding: '8px 16px',
            fontSize: '13px',
            opacity: score === null ? 0.6 : 1,
          }}
        >
          {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
        </button>
      </div>
    </div>
  )
}
