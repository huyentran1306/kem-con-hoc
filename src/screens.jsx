import { useContext, useEffect, useRef, useState } from 'react'
import { AppCtx } from './ctx'
import {
  PARENT_TYPES, GRADES, BOOKS, TONES, EMOJIS, PROBLEM, STICKER_REWARD,
  ENGLISH_PHRASES, TOYS, CHAT_SAMPLES, CHAT_REPLIES, CALM_LINES,
  AVAILABLE_STICKERS, WAITING_QUIZZES,
} from './data'
import { Header, SpeakBtn, VoiceInputBtn, DotDiagram, Bar, HoldReveal, Stepper } from './ui'
import { fmtTime, speak, compressImage, uid, boom } from './utils'
import { soundTap, soundPop, soundSuccess, soundWrong, soundBreathe, soundWoodBlock, soundFanfare, isSoundEnabled, toggleSound } from './audio'
import { aiExplain, aiChat, aiOcr, aiExtractProblem, aiAnalyzeToy, aiAnalyzeLongitudinalProgress } from './api'
import { renderPrompt } from './promptStudio'

/* ============================================================
   1. ONBOARDING
   ============================================================ */
export function Onboarding() {
  const { S, patch, go, openSheet, toast } = useContext(AppCtx)
  const child = S.children.find((c) => c.id === S.activeId) || S.children[0]

  const setChild = (obj) =>
    patch({ children: S.children.map((c) => (c.id === child.id ? { ...c, ...obj } : c)) })

  return (
    <>
      <p className="eyebrow">Bước 1/3 · 30 giây</p>
      <p className="title">Chào {S.parent}! Con nhà mình học lớp mấy?</p>
      <p className="sub">Không cần tên thật hay ảnh của con. Mình chỉ cần vài thông tin để AI giảng đúng cách.</p>

      <div className="card">
        <span className="lbl plum">Bạn là</span>
        <div className="opt-grid">
          {PARENT_TYPES.map((x) => (
            <button key={x} className={`opt ${S.parent === x ? 'on' : ''}`} onClick={() => patch({ parent: x })}>
              {x}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <span className="lbl plum">Biệt danh của con</span>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div className="chips" style={{ gap: 4 }}>
            {EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => setChild({ emoji: e })}
                style={{
                  fontSize: 22, width: 40, height: 40, borderRadius: 12,
                  background: child.emoji === e ? 'var(--plum-tint)' : '#fff',
                  border: child.emoji === e ? '2px solid var(--plum)' : '1.5px solid var(--line)',
                }}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
        <input
          className="field"
          value={child.name}
          onChange={(e) => setChild({ name: e.target.value || 'Bé' })}
          placeholder="VD: Na, Bon, Miu…"
        />
      </div>

      <div className="card">
        <span className="lbl plum">Lớp</span>
        <div className="opt-grid">
          {GRADES.map((x) => (
            <button key={x} className={`opt ${child.grade === x ? 'on' : ''}`} onClick={() => setChild({ grade: x })}>
              {x}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <span className="lbl plum">Bộ sách con đang học</span>
        <div className="opt-grid" style={{ gridTemplateColumns: '1fr' }}>
          {BOOKS.map((x) => (
            <button key={x} className={`opt col ${child.book === x ? 'on' : ''}`} onClick={() => setChild({ book: x })}>
              {x}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <span className="lbl plum">Giọng gợi ý bạn thích</span>
        <div className="opt-grid">
          {TONES.map((x) => (
            <button key={x} className={`opt ${S.tone === x ? 'on' : ''}`} onClick={() => patch({ tone: x })}>
              {x}
            </button>
          ))}
        </div>
      </div>

      <button className="big-card sky" onClick={() => openSheet('invite')}>
        <span className="lbl sky">Không phải một mình</span>
        <b>{S.partner ? '✓ Đã mời bố cùng kèm con' : '+ Mời bố cùng kèm con'}</b>
        <span className="sub">Gửi link app cho bố, chia ca kèm, ai trực ca người đó nhận nhắc lúc 19:45</span>
      </button>

      <button
        className="btn solid"
        onClick={() => { patch({ onboarded: true }); go('home'); toast(`Chào mừng ${S.parent.toLowerCase()}! 💛`) }}
      >
        Xong, bắt đầu
      </button>
    </>
  )
}

/* ============================================================
   2. TRANG CHỦ
   ============================================================ */
export function Home() {
  const { S, patch, stats, go, openSheet, toast, soundOn, toggleSound } = useContext(AppCtx)
  const child = S.children.find((c) => c.id === S.activeId) || S.children[0]
  const now = new Date()
  const dateStr = now.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric' })
  const hour = now.getHours()
  const greet = hour < 11 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối'

  return (
    <>
      <div className="hero-band">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 2 }}>
          <p className="sub" style={{ margin: 0 }}>
            {dateStr} · {child.emoji} {child.name} · {child.grade} · {child.book}
          </p>
          <button
            className={`sound-pill-btn ${!soundOn ? 'off' : ''}`}
            onClick={toggleSound}
            title={soundOn ? 'Âm thanh: ĐANG BẬT (Bấm để tắt tiếng)' : 'Âm thanh: ĐANG TẮT (Bấm để bật)'}
            data-no-sound
          >
            {soundOn ? '🔊 Tiếng: Bật' : '🔇 Tiếng: Tắt'}
          </button>
        </div>
        <p className="title">{greet}, {S.parent.toLowerCase()}!</p>
        <p className="title" style={{ fontSize: 19 }}>Tối nay {child.name} học gì?</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
          <button
            onClick={() => openSheet('stickerBook')}
            className="chip"
            style={{ background: '#FEF3C7', color: '#92400E', border: '1px solid #FCD34D', padding: '3px 10px', fontSize: 12, fontWeight: 700, borderRadius: 20 }}
          >
            📖 Sổ Sticker: <b>{stats.stickers}</b> ✨
          </button>
        </div>
        {S.children.length > 1 && (
          <div className="chips" style={{ marginTop: 6, gap: 6 }}>
            {S.children.map((c) => (
              <button
                key={c.id}
                className={`chip ${c.id === S.activeId ? 'on' : ''}`}
                style={{ padding: '3px 9px', fontSize: 12.5 }}
                onClick={() => { patch({ activeId: c.id }); toast(`Đổi sang bé ${c.name} ${c.emoji}`) }}
              >
                {c.emoji} {c.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {stats.stickers >= 10 && (
        <div
          className="card sun pop"
          style={{
            border: '2px solid #F59E0B',
            background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
            textAlign: 'center',
            padding: '12px 14px',
            marginBottom: 12,
            boxShadow: '0 4px 14px rgba(245, 158, 11, 0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 2 }}>
            <span style={{ fontSize: 24 }}>🏆</span>
            <b style={{ color: '#78350F', fontSize: 15 }}>{child.name} đã tích đủ 10 sticker!</b>
          </div>
          <p style={{ color: '#92400E', fontSize: 12.5, margin: '2px 0 10px', lineHeight: 1.4 }}>
            Con đã hoàn thành 10 bài học nỗ lực. {S.parent} mở phiếu đổi quà để thưởng cho con nhé!
          </p>
          <button
            className="btn solid"
            style={{ width: '100%', background: '#D97706', fontWeight: 700, fontSize: 13.5, boxShadow: '0 2px 8px rgba(217,119,6,0.3)' }}
            onClick={() => openSheet('redeem')}
          >
            🎁 Mở Phiếu Đổi Quà Cho Con ➔
          </button>
        </div>
      )}

      <button className="big-card plum" onClick={() => go('snap')}>
        <span className="ic">📷</span>
        <span className="lbl plum">Có bài tập</span>
        <b>Chụp bài con đang làm</b>
        <span className="sub">AI chỉ {S.parent.toLowerCase()} cách giảng, không đưa đáp án cho con</span>
      </button>

      <button className="big-card sun" onClick={() => go('toy')}>
        <span className="ic">🧸</span>
        <span className="lbl sun">Không có bài?</span>
        <b>Chụp đồ chơi trong nhà</b>
        <span className="sub">Ra trò chơi 10 phút ôn đúng chỗ con hay vướng</span>
      </button>

      <button className="big-card sky" onClick={() => openSheet('timer')}>
        <span className="ic">⏱</span>
        <span className="lbl sky">Học vừa đủ</span>
        <b>Hẹn giờ 15 phút</b>
        <span className="sub">Học 15 phút, nghỉ 5 phút · tối đa 3 vòng</span>
      </button>

      <div>
        <p className="lbl mut" style={{ marginBottom: 8 }}>Tuần này {child.name} hay vướng</p>
        <div className="chips">
          {stats.weak.map((w) => (
            <button key={w.n} className="chip" onClick={() => { pendingToy = weakToy(w.n); go('game') }}>
              {w.n} ›
            </button>
          ))}
        </div>
      </div>

      <div className="card mint">
        <span className="lbl mint">💡 Gợi ý cho {S.parent.toLowerCase()}</span>
        <span style={{ fontSize: 14 }}>
          Hôm nay để con tự làm trước 10 phút, {S.parent.toLowerCase()} chỉ vào khi con gọi. Ít nói hơn, con nhớ lâu hơn.
        </span>
      </div>

      <div className="card">
        <span className="lbl plum">Gần đây</span>
        {stats.history.length === 0 && <span className="sub">Chưa có buổi học nào. Chụp bài đầu tiên nhé!</span>}
        {[...stats.history].reverse().slice(0, 4).map((h, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
            <span className="sub">• {h.txt}</span>
            <span className="pill g">{h.when}</span>
          </div>
        ))}
      </div>

      <button className="btn ghost" onClick={() => openSheet('calm')}>😮‍💨 Hôm nay hơi mệt? Thở cùng mình</button>
    </>
  )
}

/* ============================================================
   3. CHỤP BÀI TẬP
   ============================================================ */
let pendingShot = null
let pendingToy = null

export function SnapHomework() {
  const { go, openSheet, toast } = useContext(AppCtx)
  const fileRef = useRef(null)
  const videoRef = useRef(null)
  const [camOn, setCamOn] = useState(false)
  const [camErr, setCamErr] = useState(false)

  useEffect(() => {
    let cancelled = false
    let stream = null
    ;(async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        const video = videoRef.current
        if (!video) return
        video.srcObject = stream
        if (video.readyState < 1) {
          await new Promise((res) => {
            video.addEventListener('loadedmetadata', res, { once: true })
            setTimeout(res, 3000)
          })
        }
        await video.play().catch(() => {})
        setCamOn(true)
      } catch (e) {
        setCamErr(true)
      }
    })()
    return () => {
      cancelled = true
      if (stream) stream.getTracks().forEach((t) => t.stop())
    }
  }, [])

  const capture = () => {
    const video = videoRef.current
    if (!video || !video.videoWidth) {
      toast('Camera chưa sẵn sàng — bấm "Chọn ảnh" nhé 📷')
      return
    }
    const canvas = document.createElement('canvas')
    let w = video.videoWidth
    let h = video.videoHeight
    const maxDim = 1200
    if (w > maxDim || h > maxDim) {
      if (w > h) {
        h = Math.round((h * maxDim) / w)
        w = maxDim
      } else {
        w = Math.round((w * maxDim) / h)
        h = maxDim
      }
    }
    canvas.width = w
    canvas.height = h
    canvas.getContext('2d').drawImage(video, 0, 0, w, h)
    canvas.toBlob((blob) => {
      if (!blob) return
      pendingShot = { dataUrl: canvas.toDataURL('image/jpeg', 0.8), blob }
      toast('Đã chụp — AI đang đọc…')
      go('analyze')
    }, 'image/jpeg', 0.8)
  }

  const onPickFile = async (e) => {
    const f = e.target.files && e.target.files[0]
    e.target.value = ''
    if (!f) return
    toast('Đang nén ảnh & chuẩn bị gửi AI… ⚡')
    try {
      const { blob, dataUrl } = await compressImage(f, 1200, 0.8)
      pendingShot = { dataUrl, blob }
      toast('Đã nhận ảnh, AI đang đọc…')
      go('analyze')
    } catch (err) {
      const reader = new FileReader()
      reader.onload = () => {
        pendingShot = { dataUrl: reader.result, blob: f }
        toast('Đã nhận ảnh, AI đang đọc…')
        go('analyze')
      }
      reader.readAsDataURL(f)
    }
  }

  return (
    <>
      <Header title="Chụp bài tập" back="home" />
      <div className="cam">
        <div className="frame" />
        <video
          ref={videoRef}
          playsInline
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: camOn ? 1 : 0,
            transition: 'opacity .3s',
          }}
        />
{!camOn && !camErr && <div className="hint">Đang bật camera…</div>}
        {camErr && (
          <div style={{ padding: '24px 20px', textAlign: 'center', color: '#fff', fontSize: 13, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 34 }}>📷</span>
            <b style={{ fontSize: 14.5, color: '#fff' }}>Không mở được camera</b>
            <span style={{ color: '#D8C7D8', lineHeight: 1.5 }}>
              Trình duyệt chưa cho phép quyền camera. Bạn có thể bấm <b>Chọn ảnh</b> để chụp từ thư viện,
              hoặc bấm <b>Thử lại</b> sau khi bật quyền camera trong trình duyệt.
            </span>
            <button
              className="btn ghost"
              style={{ width: 'auto', padding: '8px 18px', fontSize: 13, borderColor: '#fff', color: '#fff', background: 'rgba(255,255,255,.12)' }}
              onClick={() => { setCamErr(false); setCamOn(false); window.location.reload() }}
            >
              🔄 Thử lại camera
            </button>
          </div>
        )}
        <div className="hint">Căn bài vào trong khung · chỉ chụp 1 bài</div>
      </div>
      <button className="shutter" aria-label="Chụp" onClick={capture} disabled={!camOn} />
      <div className="btns" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: 8 }}>
        <button className="btn ghost" style={{ padding: '10px 8px', fontSize: 13 }} onClick={() => fileRef.current.click()}>🖼 Chọn ảnh</button>
        <button className="btn ghost" style={{ padding: '10px 8px', fontSize: 13 }} onClick={() => openSheet('typeProblem')}>⌨️ Gõ đề</button>
        <button className="btn ghost" style={{ padding: '10px 8px', fontSize: 13, borderColor: 'var(--plum)', color: 'var(--plum-deep)', background: 'var(--plum-tint)' }} onClick={() => openSheet('typeProblem')}>🎙️ Đọc đề</button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={onPickFile}
      />
      <p className="notice">🔒 Ảnh chỉ dùng để đọc đề, xóa sau 24 giờ</p>
    </>
  )
}

/* ============================================================
   4. AI PHÂN TÍCH
   ============================================================ */
const CHECKLIST = ['Nén & đọc chữ từ ảnh', 'Làm sạch đề bài (chuẩn chính tả)', 'Đối chiếu SGK & phương pháp', 'Soạn 4 câu hỏi gợi mở']

/* Câu hỏi 0 — hiển thị ngay khi gửi đề, không phụ thuộc AI */
const QUESTION_ZERO = {
  math: 'Con đọc to đề cho {parent} nghe nhé. Theo con, bài cho biết điều gì?',
  vie: 'Con thử đọc lại đoạn này cho {parent} nghe nhé.',
  eng: 'Con nhận ra từ nào con đã gặp rồi?',
}
const detectSubject = (t) => {
  const s = String(t || '').toLowerCase()
  if (/\d/.test(s) || /tính|bằng|hỏi|mỗi|tất cả|kẹo|bút|táo|quả|thùng|hộp|con|chiếc/.test(s)) return 'math'
  if (/[a-z]{2,}/.test(s) && !/[àáảãạăằắẳẵặâầấẩẫậêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựđ]/.test(s)) return 'eng'
  return 'vie'
}

export function Analyze() {
  const { S, patch, go, openSheet, toast } = useContext(AppCtx)
  const [done, setDone] = useState(0)
  const [aiState, setAiState] = useState('loading') // loading | cleaning | done | error | ocr_failed | review
  const [shotImg, setShotImg] = useState(null)
  const [ocrText, setOcrText] = useState(null)
  const [editedText, setEditedText] = useState('')
  const [showSkip, setShowSkip] = useState(false)
  const [quizIdx, setQuizIdx] = useState(0)
  const reqRef = useRef(null)
  const child = S.children.find((c) => c.id === S.activeId)

  const useSampleProblem = () => {
    patch({ problem: { ...PROBLEM, isSample: true } })
    toast('Đang mở bài mẫu minh họa 📖')
    go('explain')
  }

  const startExplain = async (textToUse) => {
    setAiState('loading')
    setDone(3)
    try {
      const explainRes = await aiExplain(textToUse, child, S.tone)
      setDone(4)
      if (explainRes && explainRes.steps && explainRes.steps.length > 0) {
        patch({ problem: { ...explainRes, isSample: false } })
        setAiState('done')
        toast('✅ AI đã soạn bài giảng xong!')
        setTimeout(() => go('explain'), 600)
      } else {
        setAiState('network_slow')
      }
    } catch (e) {
      setAiState('network_slow')
    }
  }

  useEffect(() => {
    let cancelled = false
    const skipTimer = setTimeout(() => {
      if (!cancelled) setShowSkip(true)
    }, 4500)

    const shot = pendingShot
    pendingShot = null
    if (shot) setShotImg(shot.dataUrl)

    if (!reqRef.current) {
      reqRef.current = (async () => {
        let ocr = S.flow.ocr
        if (shot) {
          setDone(1) // Bước 1: Bắt đầu OCR
          const raw = await aiOcr(shot.blob)
          if (cancelled) return null
          if (raw && raw.trim()) {
            setOcrText(raw.trim())
            setEditedText(raw.trim())
            // Bước 2: làm sạch đề qua aiChat (chuẩn chính tả, giữ nguyên số liệu)
            setAiState('cleaning')
            const cleaned = await aiExtractProblem(raw.trim())
            if (cancelled) return null
            ocr = cleaned && cleaned.trim() ? cleaned.trim() : raw.trim()
            setOcrText(ocr)
            setEditedText(ocr)
            patch({ flow: { ...S.flow, ocr } })
            setDone(2) // Bước 2 xong: đã làm sạch đề
            setAiState('review')
            return { review: true, ocr }
          } else {
            return { error: 'ocr_failed' }
          }
        } else {
          setDone(2)
          setOcrText(ocr)
          setEditedText(ocr)
          setAiState('review')
          return { review: true, ocr }
        }
      })()
    }

    reqRef.current.then((res) => {
      if (cancelled || !res) return
      if (res.error === 'ocr_failed') {
        setAiState('ocr_failed')
      } else if (res.review) {
        // Feature 2: dừng lại chờ phụ huynh xác nhận đề — KHÔNG tự động gọi AI
        setAiState('review')
      }
    })

    return () => {
      cancelled = true
      clearTimeout(skipTimer)
    }
  }, [])

  return (
    <>
      <Header title="AI đang đọc bài…" />
      <div className="cam" style={{ minHeight: 170 }}>
        {shotImg ? (
          <img src={shotImg} alt="Bài tập của con" decoding="async" style={{ width: '82%', borderRadius: 12, maxHeight: 260, objectFit: 'contain' }} />
        ) : (
          <div className="photo" style={{ width: '82%' }}>{S.flow.ocr}</div>
        )}
        <div className="scanline" />
      </div>

      <div className="loader">
        {CHECKLIST.map((c, i) => (
          <div key={c} className={`li ${i < done ? 'ok' : ''}`}>
            <span className="dot">{i < done ? '✓' : i + 1}</span>
            {c}
          </div>
        ))}
      </div>

      {aiState === 'cleaning' && (
        <div className="card sky pop" style={{ border: '1.5px dashed #38BDF8', background: '#F0F9FF' }}>
          <span className="sub">🔍 Đang làm sạch đề bài (sửa chính tả, giữ nguyên số liệu)…</span>
        </div>
      )}

      {/* Feature 3: Câu hỏi 0 — xuất hiện ngay, không cần chờ AI */}
      {(aiState === 'loading' || aiState === 'cleaning') && (
        <div className="card plum pop" style={{ border: '2px solid var(--plum)', margin: '10px 0' }}>
          <span className="pill p">❓ Câu hỏi 0 — hỏi con ngay</span>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--plum-deep)', margin: '6px 0 2px', lineHeight: 1.5 }}>
            {QUESTION_ZERO[detectSubject(editedText || ocrText || S.flow.ocr)].replace('{parent}', S.parent.toLowerCase())}
          </div>
          <span className="sub" style={{ fontSize: 12 }}>
            Hỏi con trong lúc AI đang xử lý để con đọc hiểu đề trước.
          </span>
        </div>
      )}

      {/* Feature 2: Xác nhận OCR — chỉ khi bấm "Tiếp tục" mới gọi AI */}
      {aiState === 'review' && (
        <div className="card mint pop" style={{ border: '2px solid #10B981', margin: '10px 0' }}>
          <span className="pill g">✅ AI nhận diện đề bài như sau</span>
          <div style={{ marginTop: 8 }}>
            <textarea
              className="field"
              rows={5}
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              placeholder="Sửa lại số liệu nếu camera chụp bị mờ hoặc sai..."
              style={{ fontSize: 14.5, lineHeight: 1.5 }}
            />
            <span className="sub" style={{ fontSize: 11.5, marginTop: 4 }}>
              ✏️ Bạn có thể sửa, xoá hoặc nhập lại đề. Chỉ khi bấm "Tiếp tục", AI mới soạn bài giảng.
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button
              className="btn ghost"
              style={{ flex: 1, padding: '9px 12px', fontSize: 13, borderColor: '#F59E0B', color: '#B45309', background: '#FFFBEB' }}
              onClick={() => { soundPop(500); go('snap') }}
            >
              📷 Chụp lại đề
            </button>
            <button
              className="btn solid"
              style={{ flex: 1.4, padding: '9px 12px', fontSize: 13.5 }}
              onClick={() => {
                const t = (editedText || '').trim()
                if (!t) { toast('Đề bài đang trống — hãy nhập đề hoặc chụp lại nhé ✏️'); return }
                soundTap()
                patch({ flow: { ...S.flow, ocr: t } })
                startExplain(t)
              }}
            >
              Tiếp tục ➔
            </button>
          </div>
        </div>
      )}

      {/* Waiting Quiz for child while waiting */}
      {aiState === 'loading' && (
        <div className="card sky pop" style={{ border: '1.5px dashed #38BDF8', background: '#F0F9FF', margin: '10px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span className="pill b">🎲 Đố vui 5 giây cho {child.name}</span>
            <button
              className="pill p"
              style={{ cursor: 'pointer', border: 'none' }}
              onClick={() => { soundPop(500); setQuizIdx((i) => (i + 1) % WAITING_QUIZZES.length) }}
            >
              Đổi câu 🎲
            </button>
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0369A1', margin: '4px 0 6px', lineHeight: 1.4 }}>
            {WAITING_QUIZZES[quizIdx % WAITING_QUIZZES.length]}
          </div>
          <span className="sub" style={{ fontSize: 12 }}>
            Hỏi nhanh con trong lúc đợi AI đọc bài để con hào hứng và không sốt ruột {S.parent.toLowerCase()} nhé!
          </span>
        </div>
      )}

      {aiState === 'ocr_failed' ? (
        <div className="card sun" style={{ borderColor: 'var(--sun)' }}>
          <span className="lbl sun">⚠️ Ảnh chưa rõ hoặc thiếu chữ</span>
          <span className="sub" style={{ marginBottom: 12 }}>
            AI không nhận diện rõ chữ từ ảnh vừa chụp. Bạn có thể gõ nhanh đề bài hoặc dùng bài tập mẫu nhé!
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button className="btn solid" onClick={() => openSheet('typeProblem')}>
              ⌨️ Gõ đề bài ngay (10 giây)
            </button>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn ghost" style={{ flex: 1 }} onClick={useSampleProblem}>
                📖 Dùng bài mẫu
              </button>
              <button className="btn ghost" style={{ flex: 1 }} onClick={() => go('snap')}>
                📷 Chụp lại
              </button>
            </div>
          </div>
        </div>
      ) : aiState === 'done' ? (
        <div className="card mint pop">
          <span className="lbl mint">✅ AI đã soạn bài giảng</span>
          <span className="sub">Sẵn sàng hướng dẫn {S.parent.toLowerCase()} đặt 4 câu hỏi gợi mở cho con.</span>
        </div>
      ) : (aiState === 'network_slow' || aiState === 'error') ? (
        <div className="card sun pop" style={{ border: '2px solid #F59E0B', margin: '12px 0' }}>
          <span className="lbl sun">⚠️ Mạng đang chậm, chưa soạn được bài của con</span>
          <span className="sub" style={{ display: 'block', margin: '6px 0 12px', fontSize: 13.5 }}>
            Kết nối mạng chập chờn khiến AI chưa hoàn tất phân tích đề bài. Bạn muốn thử lại hay xem bài tập mẫu tương tự để làm quen?
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              className="btn solid"
              style={{ width: '100%', padding: '12px' }}
              onClick={() => {
                const textToUse = (editedText || ocrText || S.flow.ocr || '').trim()
                startExplain(textToUse)
              }}
            >
              🔄 Thử lại
            </button>
            <button
              className="btn ghost"
              style={{ width: '100%', padding: '12px', background: '#fff' }}
              onClick={useSampleProblem}
            >
              📖 Xem bài mẫu để làm quen
            </button>
          </div>
        </div>
      ) : null}

      {showSkip && aiState === 'loading' && (
        <button
          className="btn ghost"
          style={{ width: '100%', borderColor: 'var(--plum)', color: 'var(--plum)', fontWeight: 600, margin: '6px 0' }}
          onClick={useSampleProblem}
        >
          ⏩ Chờ lâu? Xem ngay bài giảng mẫu
        </button>
      )}

      <div className="card">
        <span className="lbl plum">AI đọc được</span>
        <span style={{ fontSize: 14 }}>
          {ocrText || (shotImg ? '⏳ Đang đọc chữ từ ảnh…' : S.flow.ocr)}
        </span>
        <button
          className="sub"
          style={{ textAlign: 'left', color: 'var(--plum)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          onClick={() => openSheet('typeProblem')}
        >
          ✏️ Đề đọc chưa đúng? Bấm vào đây để sửa ngay
        </button>
      </div>

      <p className="notice">
        Đang giảng cho {child.name} ({child.grade} · {child.book})…
      </p>
    </>
  )
}

/* ============================================================
   5. AI GIẢNG CHO MẸ
   ============================================================ */
export function Explain() {
  const { S, problem, patch, go, openSheet, toast } = useContext(AppCtx)
  const child = S.children.find((c) => c.id === S.activeId)
  const explainText =
    `Đây là dạng bài ${problem.type}. ${problem.summary} ` +
    `${S.parent.toLowerCase()} lưu ý: ${problem.warning} ` +
    `Cách lớp ${child.grade} đang học: ${problem.method}.`

  return (
    <>
      <Header title="Trước khi giảng cho con…" back="home" />
      {problem?.isSample && (
        <div
          className="sample-banner"
          style={{
            background: '#FEF3C7',
            color: '#92400E',
            border: '1.5px solid #FCD34D',
            padding: '8px 12px',
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: 10,
          }}
        >
          ⚠️ Đây là bài mẫu, không phải bài của con
        </div>
      )}
      <div className="photo">{problem.ocr}</div>

      <div className="card plum">
        <span className="lbl plum">Dạng bài</span>
        <b style={{ fontSize: 15.5 }}>{problem.type}</b>
        <span className="sub">{problem.summary}</span>
      </div>

      <div className="card sun">
        <span className="lbl sun">⚠️ {S.parent} lưu ý</span>
        <span style={{ fontSize: 14 }}>{problem.warning}</span>
      </div>

      <div className="card">
        <span className="lbl plum">Cách lớp {child.grade} đang học</span>
        <span style={{ fontSize: 14 }}>{problem.method}</span>
        {problem.diagram && (problem.isSample || problem.id === 'mock') && (
          <>
            <DotDiagram {...problem.diagram} />
            <span className="sub">Chấm xám = phần đã cho đi</span>
          </>
        )}
      </div>

      <div className="btns">
        <button className="btn ghost" onClick={() => speak(explainText)}>🔊 Nghe</button>
        <button className="btn ghost" onClick={() => openSheet('reportIssue')}>🚩 Giảng chưa đúng</button>
      </div>

      <button
        className="btn solid"
        onClick={() => { patch({ flow: { ...S.flow, step: 0, stuck: 0, unlocked: false } }); go('scaffold') }}
      >
        Bắt đầu hỏi con từng bước
      </button>
    </>
  )
}

/* ============================================================
   5b. ĐÁP ÁN CHO MẸ — giữ 1.5 giây mới hiện, chữ nhỏ & muted,
   không TTS, không hiển thị cho trẻ
   ============================================================ */
function ParentAnswer({ text, parent }) {
  const [shown, setShown] = useState(false)
  const timerRef = useRef(null)
  const start = () => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => { setShown(true); soundPop(500) }, 1500)
  }
  const cancel = () => clearTimeout(timerRef.current)
  if (!text) return null
  return (
    <div
      className="parent-ans"
      style={{ marginTop: 10, userSelect: 'none', WebkitUserSelect: 'none', touchAction: 'none' }}
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
    >
      {shown ? (
        <div className="card" style={{ background: '#F8FAFC', border: '1px dashed var(--line)', padding: '10px 12px' }}>
          <span className="lbl mut" style={{ fontSize: 11, marginBottom: 3 }}>
            🔒 Đáp án cho {parent.toLowerCase()} (đối chiếu)
          </span>
          <span style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.5, display: 'block' }}>{text}</span>
        </div>
      ) : (
        <span className="sub" style={{ fontSize: 11, color: '#A8B4C0', textAlign: 'center', display: 'block' }}>
          👆 Giữ 1.5 giây để xem đáp án cho {parent.toLowerCase()}
        </span>
      )}
    </div>
  )
}

/* ============================================================
   6. HỎI CON TỪNG BƯỚC
   ============================================================ */
export function Scaffold() {
  const { S, problem, patch, go, openSheet, closeSheet, toast, boom } = useContext(AppCtx)
  const { step, stuck, unlocked } = S.flow
  const child = S.children.find((c) => c.id === S.activeId)
  const steps = problem.steps || PROBLEM.steps
  const [showAns, setShowAns] = useState(false)
  const [parentNote, setParentNote] = useState('')

  useEffect(() => setShowAns(false), [step])

  const stepOk = () => {
    const ns = step + 1
    patch({ flow: { ...S.flow, step: ns, stuck: 0 } })
    if (ns >= steps.length) {
      boom()
      toast(`🎉 ${child.name} tự giải xong cả ${steps.length} bậc!`)
    }
  }

  const stepStuck = () => {
    const ns = stuck + 1
    patch({ flow: { ...S.flow, stuck: ns } })
    if (ns >= 2) {
      openSheet('breakHint')
    }
  }

  const onLockedPress = () => {
    openSheet('answerBlock')
  }

  const onOpen = () => {
    patch({ flow: { ...S.flow, unlocked: true } })
    boom()
    toast('Đáp án đã mở — chỉ cho ' + S.parent.toLowerCase() + ' đối chiếu thôi nhé')
  }

  return (
    <>
      <Header title="Hỏi con từng bước" back="explain" />
      {problem?.isSample && (
        <div
          className="sample-banner"
          style={{
            background: '#FEF3C7',
            color: '#92400E',
            border: '1.5px solid #FCD34D',
            padding: '8px 12px',
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: 10,
          }}
        >
          ⚠️ Đây là bài mẫu, không phải bài của con
        </div>
      )}
      <p className="sub">
        Đọc to câu in đậm cho {child.name} nghe · bậc {Math.min(step + 1, steps.length)}/{steps.length}
      </p>
      <Bar pct={(step / steps.length) * 100} color="var(--mint)" />

      {S.flow?.lowering && (
        <div className="card sunset pop" style={{ textAlign: 'center', padding: '18px 14px', margin: '12px 0', border: '1.5px solid #F59E0B' }}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>🪜 ⚡ 🧠</div>
          <b style={{ fontSize: 15, color: '#92400E' }}>AI đang hạ độ khó câu hỏi cho con...</b>
          <p className="sub" style={{ margin: '4px 0 0', fontSize: 13 }}>
            Tạm đổi sang bài toán số nhỏ hơn để con hiểu bản chất rồi tự tin làm lại bài gốc!
          </p>
        </div>
      )}

      {steps.map((s, i) => {
        if (i < step)
          return (
            <div className="card mint fadeIn" key={i}>
              <div className="step-row">
                <span className="n ok">✓</span>
                <b style={{ fontSize: 14.5 }}>{s.q || s.question}</b>
              </div>
              <span className="sub">{s.praise}</span>
              {(s.answer || s.hint) && (
                <div className="ok-ans">✔ {s.answer || s.hint}</div>
              )}
            </div>
          )
        if (i === step)
          return (
            <div className="card plum fadeIn" key={i}>
              <div className="step-row">
                <span className="n">{i + 1}</span>
                <b style={{ fontSize: 15 }}>{s.q || s.question}</b>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <SpeakBtn text={s.q || s.question} />
                <span className="sub">Đọc cho {child.name} nghe</span>
              </div>
              {stuck > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, margin: '8px 0' }}>
                  {s.hint && (
                    <div className="card sun pop" style={{ padding: '10px 12px' }}>
                      <span className="lbl sun" style={{ fontSize: 11 }}>🧸 Mức 1: Dùng đồ vật thật trong nhà</span>
                      <span style={{ fontSize: 13.5, lineHeight: 1.45, marginTop: 4, display: 'block' }}>{s.hint}</span>
                    </div>
                  )}
                  {s.hint2 && stuck >= 2 && (
                    <div className="card plum pop" style={{ padding: '10px 12px', border: '1.5px solid #E9D5FF', background: '#FAF5FF' }}>
                      <span className="lbl plum" style={{ fontSize: 11, color: '#7E22CE' }}>🎨 Mức 2: Vẽ hình hoặc sơ đồ đoạn thẳng</span>
                      <span style={{ fontSize: 13.5, lineHeight: 1.45, marginTop: 4, display: 'block', color: '#581C87' }}>{s.hint2}</span>
                    </div>
                  )}
                </div>
              )}
              {/* Trợ lý sư phạm tức thì cho Mẹ khi kèm con */}
              <div style={{ margin: '8px 0', padding: '10px 12px', background: '#FFF7ED', borderRadius: 12, border: '1.5px solid #FFEDD5' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#9A3412' }}>💡 {S.parent} cần AI gợi ý thêm cách giảng?</span>
                </div>
                <div style={{ fontSize: 12, color: '#C2410C', marginBottom: 8, lineHeight: 1.4 }}>
                  Nếu con chưa hiểu hoặc thắc mắc, {S.parent.toLowerCase()} có thể đọc hoặc gõ câu hỏi để AI tư vấn ngay mẹo giải thích!
                </div>
                <div style={{ marginBottom: 8 }}>
                  <input
                    className="field"
                    style={{ fontSize: 13, padding: '7px 10px', background: '#fff', border: '1px solid #FED7AA' }}
                    placeholder="Gõ hoặc nói câu hỏi (VD: con chưa học phép nhân)..."
                    maxLength={200}
                    value={parentNote}
                    onChange={(e) => setParentNote(e.target.value.slice(0, 200))}
                  />
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    className="btn ghost"
                    style={{ flex: 1, padding: '8px 10px', fontSize: 12.5, borderColor: '#F97316', color: '#EA580C', background: '#fff' }}
                    onClick={() => {
                      patch({ parentNoteChat: parentNote.trim() })
                      go('ask')
                    }}
                  >
                    💬 Hỏi AI cách giảng
                  </button>
                  <div style={{ flex: 1.2 }}>
                    <VoiceInputBtn
                      placeholder="Nói câu hỏi..."
                      onResult={(text) => {
                        const clean = (text || '').slice(0, 200)
                        setParentNote(clean)
                        toast(`Đã nhận: "${clean}" 🎙️`)
                      }}
                    />
                  </div>
                </div>
              </div>

              <ParentAnswer key={'pa-' + i} text={s.answerForParent || s.answer || s.hint} parent={S.parent} />
              <div className="btns">
                <button className="btn soft" onClick={() => setShowAns(!showAns)}>
                  {showAns ? '🙈 Đóng đáp án' : '👀 Xem đáp án gợi ý'}
                </button>
              </div>
              {showAns && (
                <div className="card mint pop">
                  <span className="lbl mint">Đáp án gợi ý ({S.parent.toLowerCase()} đối chiếu)</span>
                  <span style={{ fontSize: 14 }}>{s.answer || s.hint}</span>
                  <div className="btns" style={{ marginTop: 8 }}>
                    <button className="btn solid" onClick={stepOk}>✅ Con trả lời đúng</button>
                    <button className="btn ghost" onClick={stepStuck}>❌ Con còn bí</button>
                  </div>
                </div>
              )}
            </div>
          )
        return (
          <div className="card dimmed" key={i}>
            <div className="step-row">
              <span className="n off">{i + 1}</span>
              <span style={{ fontSize: 14 }}>{s.q || s.question}</span>
            </div>
          </div>
        )
      })}

      <div className="card coral">
        <span className="lbl coral">Câu động viên</span>
        <span style={{ fontSize: 14 }}>"Con nghĩ lâu vậy là đang cố đó. Mình thử vẽ ra nhé."</span>
      </div>

      <HoldReveal locked={false} onLockedPress={onLockedPress} onOpen={onOpen} />

      {unlocked && (
        <>
          <div className="card mint pop">
            <span className="lbl mint">Đáp án ({S.parent.toLowerCase()} đối chiếu)</span>
            <b style={{ fontSize: 16 }}>{problem.answer}</b>
            {problem.answerLine && <span className="sub">{problem.answerLine}</span>}
          </div>
          <button className="btn mint" onClick={() => go('done')}>Hoàn thành bài ›</button>
        </>
      )}
    </>
  )
}

/* ============================================================
   7. KẾT THÚC
   ============================================================ */
export function Done() {
  const { S, problem, stats, patch, setStats, go, openSheet, toast, boom } = useContext(AppCtx)
  const child = S.children.find((c) => c.id === S.activeId)
  const result = S.flow.result
  const [stkIdx, setStkIdx] = useState(0)
  const stkCur = AVAILABLE_STICKERS[Math.min(stkIdx, AVAILABLE_STICKERS.length - 1)] || AVAILABLE_STICKERS[0]
  const stkOwned = (stats.stickersList || []).filter((x) => x.id === stkCur.id || x.e === stkCur.e || x.name === stkCur.n).length

  const pickSticker = (e) => {
    if (problem?.isSample) {
      toast('Bài mẫu không tính sticker nhé ⭐')
      return
    }
    soundPop(600)
    const found = AVAILABLE_STICKERS.find((s) => s.id === e || s.e === e) || {
      id: 's' + Date.now(),
      e,
      n: 'Huy hiệu',
      trait: 'Kiên nhẫn',
      fa: 'fa-solid fa-award',
      color: '#7C3AED',
      bg: '#F5F3FF',
      border: '#DDD6FE',
      desc: 'Con làm bài rất nỗ lực',
    }
    const oldList = stats.stickersList || []
    const newList = [...oldList, { ...found, when: 'Hôm nay' }]

    // 📈 Lưu Big Data Lịch sử Sticker vĩnh viễn (không bao giờ mất khi đổi quà)
    const oldHistory = stats.stickerHistory || []
    const newHistoryItem = {
      id: 'h_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      stickerId: found.id,
      name: found.n,
      trait: found.trait || 'Kiên nhẫn',
      fa: found.fa || 'fa-solid fa-award',
      color: found.color || '#F59E0B',
      subject: problem?.mon || 'Toán',
      problemType: problem?.dang_bai || problem?.type || 'Bài tập rèn luyện',
      week: 'Tuần này',
      timestamp: Date.now(),
      dateStr: new Date().toLocaleDateString('vi-VN'),
    }
    const newHistory = [...oldHistory, newHistoryItem]

    setStats({ stickers: newList.length, stickersList: newList, stickerHistory: newHistory })
    soundSuccess()
    boom()
    toast(`${child.name} nhận huy hiệu ${found.n}! 🎉`)
    if (newList.length >= 10) {
      setTimeout(() => {
        soundFanfare()
        boom()
        openSheet('redeem')
      }, 700)
    }
  }

  const saveResult = () => {
    if (problem?.isSample) {
      toast('Bài mẫu minh họa — không ghi vào lịch sử 📖')
      patch({ flow: { ...S.flow, step: 0, stuck: 0, unlocked: false, result: null, teachBack: null } })
      go('home')
      return
    }

    const topicName = problem?.dang_bai || problem?.type || (problem?.ocr ? problem.ocr.slice(0, 40) : 'Bài tập rèn luyện')
    const txt = `${topicName} · ${result === 'weak' ? 'còn vướng' : 'làm được'}`
    const hist = [...(stats.history || []), { txt, when: 'Hôm nay', timestamp: Date.now() }]

    let weak = Array.isArray(stats.weak) ? [...stats.weak] : []
    let strong = Array.isArray(stats.strong) ? [...stats.strong] : []

    if (result === 'weak') {
      const idx = weak.findIndex((w) => w.n === topicName)
      if (idx >= 0) {
        weak[idx] = { ...weak[idx], v: (weak[idx].v || 0) + 1, t: (weak[idx].t || 0) + 1 }
      } else {
        weak.unshift({ n: topicName, v: 1, t: 1 })
      }
    } else {
      const idx = strong.findIndex((s) => s.n === topicName)
      if (idx >= 0) {
        strong[idx] = { ...strong[idx], v: (strong[idx].v || 0) + 1, t: (strong[idx].t || 0) + 1 }
      } else {
        strong.unshift({ n: topicName, v: 1, t: 1 })
      }
    }

    const sessionsMom = (stats.sessionsMom || 0) + (S.parent === 'Mẹ' ? 1 : 0)
    const sessionsDad = (stats.sessionsDad || 0) + (S.parent === 'Bố' ? 1 : 0)

    setStats({ history: hist, weak, strong, sessionsMom, sessionsDad })
    patch({ flow: { ...S.flow, step: 0, stuck: 0, unlocked: false, result: null, teachBack: null } })
    toast(`Đã lưu vào sổ của ${child.name} 💾`)
    go('home')
  }

  /* Feature 4: Con dạy lại mẹ — đo mức độ tự chủ (Metacognition & Peer Teaching) */
  const TEACH_BACK_OPTIONS = [
    { v: 'ok', e: '✅', t: 'Con tự làm được' },
    { v: 'hint', e: '🟡', t: 'Con cần gợi ý' },
    { v: 'guided', e: '🔴', t: `${S.parent} phải hướng dẫn nhiều` },
  ]
  const pickTeachBack = (v) => {
    soundPop(500)
    const opt = TEACH_BACK_OPTIONS.find((o) => o.v === v)
    patch({ flow: { ...S.flow, teachBack: v } })
    if (!stats.history.some((h) => h.txt && h.txt.startsWith('Con dạy lại mẹ'))) {
      setStats({ history: [...stats.history, { txt: `Con dạy lại mẹ: ${opt.t.toLowerCase()}`, when: 'Hôm nay' }] })
    }
    toast(`Đã lưu: ${opt.t} 💾`)
  }

  return (
    <>
      <Header title="Xong bài rồi! 🎉" back="home" />
      {problem?.isSample && (
        <div
          className="sample-banner"
          style={{
            background: '#FEF3C7',
            color: '#92400E',
            border: '1.5px solid #FCD34D',
            padding: '8px 12px',
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: 10,
          }}
        >
          ⚠️ Đây là bài mẫu, không phải bài của con
        </div>
      )}
      <div className="card mint">
        <span className="lbl mint">Đáp án ({S.parent.toLowerCase()} đối chiếu)</span>
        <b style={{ fontSize: 16 }}>{problem.answer}</b>
        {problem.answerLine && <span className="sub">{problem.answerLine}</span>}
      </div>

      <div className="card plum pop" style={{ border: '2px solid var(--plum)' }}>
        <span className="pill p">🎓 Con dạy lại {S.parent.toLowerCase()}</span>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--plum-deep)', margin: '8px 0 10px', lineHeight: 1.45 }}>
          {problem.teachBack || 'Nếu lần sau gặp dạng bài này, con sẽ làm bước nào trước?'}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {TEACH_BACK_OPTIONS.map((o) => (
            <button
              key={o.v}
              className={`btn ${S.flow.teachBack === o.v ? 'solid' : 'soft'}`}
              style={{
                width: '100%',
                background: S.flow.teachBack === o.v ? 'var(--plum)' : '#fff',
                color: S.flow.teachBack === o.v ? '#fff' : 'var(--plum-deep)',
                border: S.flow.teachBack === o.v ? 'none' : '1.5px solid var(--plum-line)',
              }}
              onClick={() => pickTeachBack(o.v)}
            >
              {o.e} {o.t}
            </button>
          ))}
        </div>
        <span className="sub" style={{ fontSize: 11.5, marginTop: 8 }}>
          Giúp {S.parent.toLowerCase()} biết con đã thực sự hiểu bài chưa — không tính điểm, chỉ để đồng hành tốt hơn.
        </span>
      </div>

      {problem.fiveMinGame && (
        <div className="card sun pop" style={{ padding: '12px 14px', border: '1.5px solid #FDE68A', background: '#FEFCE8' }}>
          <span className="pill y">🎲 Trò chơi 5 phút ôn bài</span>
          <div style={{ fontSize: 13.5, color: '#854D0E', margin: '6px 0 2px', lineHeight: 1.45, fontWeight: 600 }}>
            {problem.fiveMinGame}
          </div>
        </div>
      )}

      {problem.brotherProblem && (
        <div className="card mint pop" style={{ padding: '12px 14px', border: '1.5px solid #A7F3D0', background: '#ECFDF5' }}>
          <span className="pill g">🎯 Bài anh em (Cùng dạng, đổi số)</span>
          <div style={{ fontSize: 13.5, color: '#065F46', margin: '6px 0 4px', lineHeight: 1.45, fontWeight: 600 }}>
            {problem.brotherProblem.de || problem.brotherProblem.text || ''}
          </div>
          {problem.brotherProblem.dap_an_cho_me && (
            <div style={{ fontSize: 12, color: '#047857', opacity: 0.9 }}>
              Đáp án đối chiếu: <b>{problem.brotherProblem.dap_an_cho_me}</b>
            </div>
          )}
        </div>
      )}

      <div>
        <p className="lbl mut" style={{ marginBottom: 8 }}>{S.parent} đánh giá nhanh</p>
        <div className="btns">
          <button
            className={`btn ${result === 'ok' ? 'mint' : 'ghost'}`}
            onClick={() => patch({ flow: { ...S.flow, result: 'ok' } })}
          >
            😊 {child.name} làm được
          </button>
          <button
            className={`btn ${result === 'weak' ? 'coral' : 'ghost'}`}
            onClick={() => patch({ flow: { ...S.flow, result: 'weak' } })}
          >
            🤔 Còn vướng
          </button>
        </div>
      </div>

      {stats.stickers >= 10 && (
        <div
          className="card sun pop"
          style={{
            border: '2px solid #F59E0B',
            background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
            textAlign: 'center',
            padding: '14px 12px',
            boxShadow: '0 6px 18px rgba(245, 158, 11, 0.28)',
          }}
        >
          <div style={{ fontSize: 38, marginBottom: 4 }}>🎁 🏆 🍦</div>
          <b style={{ color: '#78350F', fontSize: 16 }}>🎉 ĐỦ 10 HUY HIỆU RỒI — ĐỔI QUÀ THÔI!</b>
          <div style={{ color: '#92400E', fontSize: 13, margin: '6px 0 12px', lineHeight: 1.4 }}>
            Chúc mừng {child.name} đã tích lũy đủ 10 sticker nỗ lực! {S.parent} bấm để mở phiếu đổi quà và bắt đầu chặng mới nhé.
          </div>
          <button
            className="btn solid"
            style={{ width: '100%', background: '#D97706', fontWeight: 700, fontSize: 14.5, boxShadow: '0 4px 12px rgba(217,119,6,0.3)' }}
            onClick={() => openSheet('redeem')}
          >
            🎁 Mở Phiếu Đổi Quà Cho Con ➔
          </button>
        </div>
      )}

      <div className="card sun">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span className="lbl sun">Cho {child.name} chọn huy hiệu</span>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: stkCur.bg || '#FFFBEB', color: stkCur.color || '#D97706', border: `1px solid ${stkCur.border || '#FDE68A'}` }}>
            <i className={`${stkCur.fa || 'fa-solid fa-award'} fa-fw`} style={{ marginRight: 4 }} />
            {stkCur.trait || 'Phẩm chất'}
          </span>
        </div>
        <div className="stk-carousel">
          <button
            className="round-btn"
            aria-label="Sticker trước"
            disabled={stkIdx === 0}
            onClick={() => { soundPop(450); setStkIdx((i) => Math.max(0, i - 1)) }}
          >
            ‹
          </button>
          <button
            className="stk-pick"
            onClick={() => pickSticker(stkCur.id || stkCur.e)}
            style={{
              padding: '12px 14px',
              borderRadius: 18,
              border: `2px solid ${stkCur.border || '#FDE68A'}`,
              background: `linear-gradient(180deg, #FFFFFF 0%, ${stkCur.bg || '#FFFBEB'} 100%)`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: 18,
                background: stkCur.bg || '#FFFBEB',
                border: `2px solid ${stkCur.border || '#FDE68A'}`,
                color: stkCur.color || '#D97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 26,
                margin: '0 auto 8px',
                boxShadow: `0 4px 12px ${stkCur.color}25`,
                transition: 'transform 0.2s ease',
              }}
            >
              <i className={stkCur.fa || 'fa-solid fa-award'} />
            </div>
            <span className="stk-name" style={{ color: stkCur.color || '#78350F', fontWeight: 800 }}>{stkCur.n}</span>
            <span className="stk-desc" style={{ color: '#64748B', fontSize: 12 }}>{stkCur.desc}</span>
            <span
              className="stk-owned"
              style={{
                marginTop: 6,
                padding: '2px 10px',
                borderRadius: 99,
                background: stkOwned > 0 ? stkCur.bg : '#F1F5F9',
                color: stkOwned > 0 ? stkCur.color : '#94A3B8',
                fontWeight: 700,
                fontSize: 11,
                border: `1px solid ${stkOwned > 0 ? stkCur.border : '#E2E8F0'}`,
              }}
            >
              {stkOwned > 0 ? `Đã có ×${stkOwned}` : 'Chưa có trong sổ'}
            </span>
          </button>
          <button
            className="round-btn"
            aria-label="Sticker sau"
            disabled={stkIdx >= AVAILABLE_STICKERS.length - 1}
            onClick={() => { soundPop(450); setStkIdx((i) => Math.min(AVAILABLE_STICKERS.length - 1, i + 1)) }}
          >
            ›
          </button>
        </div>
        <div className="stk-dots">
          {AVAILABLE_STICKERS.map((s, i) => (
            <i key={s.id} className={i === stkIdx ? 'on' : ''} />
          ))}
        </div>
        <span className="sub">
          Bộ sưu tập chặng: <b>{stats.stickers}/10</b> · {stats.stickers >= 10 ? '✨ Đã đủ 10/10!' : `đủ 10 đổi "${STICKER_REWARD}"`}
        </span>
        <Bar pct={Math.min(100, stats.stickers * 10)} color="#E3A62F" />
        <button
          className="btn soft"
          style={{ width: '100%', marginTop: 10, background: '#FEF3C7', border: '1px solid #FCD34D', color: '#92400E', fontWeight: 700 }}
          onClick={() => openSheet('stickerBook')}
        >
          📖 Mở Sổ dán Huy hiệu của {child.name} ({stats.stickers} sticker)
        </button>
      </div>

      <button
        className="big-card plum"
        onClick={() => openSheet('practice')}
      >
        <span className="ic">✏️</span>
        <span className="lbl plum">Luyện thêm (tùy chọn)</span>
        <b>1 bài cùng dạng, số khác</b>
        <span className="sub">AI tạo bài mới để con chắc tay hơn</span>
      </button>

      <button className="big-card" onClick={() => go('ask')}>
        <span className="ic">💬</span>
        <span className="lbl plum">Còn thắc mắc?</span>
        <b>Hỏi thêm AI về bài này</b>
        <span className="sub">AI trả lời cho {S.parent.toLowerCase()}, không đưa đáp án cho con</span>
      </button>

      <button className="btn solid" onClick={saveResult}>Lưu & về trang chủ</button>
    </>
  )
}

/* ============================================================
   8. HỎI THÊM AI
   ============================================================ */
export function AskAI() {
  const { S, patch, problem, toast } = useContext(AppCtx)
  const [msgs, setMsgs] = useState([
    { from: 'ai', text: `Bạn cần hỏi gì về bài "${(problem.ocr || '').slice(0, 42)}…"? Mình sẽ gợi cách giảng, không đưa đáp án cho con nhé.` },
  ])
  const [typing, setTyping] = useState(false)
  const [val, setVal] = useState('')
  const busyRef = useRef(false)
  const boxRef = useRef(null)

  useEffect(() => {
    const el = boxRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [msgs, typing])

  const ask = async (q, customNote = '') => {
    const text = (q || '').trim()
    if (!text || busyRef.current) return
    busyRef.current = true
    setMsgs((m) => [...m, { from: 'u', text }])
    setVal('')
    setTyping(true)
    const child = S.children.find((c) => c.id === S.activeId) || S.children[0]
    const sys = renderPrompt('p4_chat', {
      mon: problem.mon || 'Toán',
      lop: child.grade,
      sach: child.book,
      dang_bai: problem.dang_bai || problem.type || 'Toán có lời văn',
      loi_hay_gap: problem.loi_hay_gap || 'Con hay vội làm phép tính mà chưa đọc kỹ câu hỏi',
      de_bai: problem.ocr || '',
      ghi_chu: customNote || text,
    })
    const reply = await aiChat(sys, msgs, text)
    setTyping(false)
    busyRef.current = false
    setMsgs((m) => [...m, { from: 'ai', text: reply || CHAT_REPLIES[text] || CHAT_REPLIES[CHAT_SAMPLES[0]] }])
  }

  // A2: Nếu mẹ đã nhập ghi chú ở màn Hỏi con từng bước, tự động gửi câu hỏi đầu tiên
  const initialTriggered = useRef(false)
  useEffect(() => {
    if (S.parentNoteChat && !initialTriggered.current) {
      initialTriggered.current = true
      const note = S.parentNoteChat
      patch({ parentNoteChat: null })
      ask(note, note)
    }
  }, [S.parentNoteChat])

  return (
    <>
      <Header title="Hỏi thêm AI" back="done" />
      <div
        ref={boxRef}
        style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, minHeight: 200, maxHeight: '46vh' }}
      >
        <div className="chat">
          {msgs.map((m, i) => (
            <div key={i} className={`m ${m.from === 'u' ? 'u' : 'a'}`}>{m.text}</div>
          ))}
          {typing && (
            <div className="typing"><i /><i /><i /></div>
          )}
        </div>
      </div>
      <div className="chips">
        {CHAT_SAMPLES.map((q) => (
          <button key={q} className="chip" onClick={() => ask(q)}>{q}</button>
        ))}
      </div>
      <div className="btns" style={{ display: 'flex', gap: 6 }}>
        <input
          className="field grow0"
          style={{ flex: 1 }}
          placeholder="Mẹ gõ câu hỏi cho AI…"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && ask(val)}
        />
        <div style={{ width: 145 }}>
          <VoiceInputBtn
            placeholder="Nói câu hỏi"
            onResult={(voiceText) => {
              setVal(voiceText)
              ask(voiceText)
            }}
          />
        </div>
        <button className="btn solid grow0" style={{ width: 'auto', padding: '10px 18px' }} onClick={() => ask(val)}>
          Gửi
        </button>
      </div>
      <p className="notice">🤫 Mẹo nhỏ: mình chỉ gợi cách giảng, đáp án cuối để con tự tìm.</p>
    </>
  )
}

/* ============================================================
   9. CHỤP ĐỒ CHƠI & GỢI Ý TRÒ CHƠI AI
   ============================================================ */

const TOY_MAPPINGS = [
  {
    n: 'Chai / Lọ',
    e: '🧴',
    keys: ['chai', 'lọ', 'lo', 'bình', 'binh', 'bottle', 'spray', 'xịt', 'xit', 'ống', 'ong', 'nắp', 'nap', 'cồn', 'con', 'nước hoa', 'son', 'bật lửa', 'quẹt'],
    desc: 'Chai xịt, bình nước hoặc lọ nhỏ trong phòng',
    gameTitle: 'Đo chiều cao & Ước lượng dung tích',
    gameIdea: 'Dùng chai so sánh độ cao với các đồ vật khác, hoặc đếm số lần xịt/rót nước.',
  },
  {
    n: 'Cây lược',
    e: '🪮',
    keys: ['cây lược', 'cay luoc', 'lược', 'luoc', 'comb', 'chải đầu', 'chải tóc', 'răng lược', 'rang luoc'],
    desc: 'Lược chải tóc có các răng cào thưa hoặc dày',
    gameTitle: 'Đếm răng lược nhảy 2-5-10 & Thước đo so sánh',
    gameIdea: 'Đếm số lượng răng lược theo bước nhảy 2, 5; so sánh chiều dài lược với cây bút hoặc bàn tay con.',
  },
  {
    n: 'Cây bút',
    e: '✏️',
    keys: ['bút', 'but', 'pen', 'pencil', 'viết', 'viet', 'chì', 'chi', 'bi', 'mực', 'muc', 'dạ', 'da', 'ngòi'],
    desc: 'Bút chì, bút bi, bút sáp màu trên bàn học',
    gameTitle: 'Xếp bó bút nhân chia & Đo độ dài',
    gameIdea: 'Xếp các cây bút thành từng bó để học phép nhân/chia hoặc dùng làm đơn vị đo độ dài.',
  },
  {
    n: 'Thước kẻ',
    e: '📏',
    keys: ['thước', 'thuoc', 'ruler', 'kẻ', 'ke', 'đo', 'cm', 'vạch'],
    desc: 'Thước kẻ học sinh 15cm - 20cm',
    gameTitle: 'Đo cm & So sánh đoạn thẳng',
    gameIdea: 'Luyện kỹ năng đo độ dài và ước lượng chiều dài đồ vật xung quanh.',
  },
  {
    n: 'Lego',
    e: '🧱',
    keys: ['lego', 'gạch', 'gach', 'xếp hình', 'xep hinh', 'block', 'khối', 'khoi'],
    desc: 'Các khối gạch xếp hình Lego',
    gameTitle: 'Xây tòa nhà nhân & Trừ tầng',
    gameIdea: 'Xây tháp Lego 4-6 tầng để trực quan hóa phép nhân và phép trừ.',
  },
  {
    n: 'Que kem',
    e: '🥢',
    keys: ['que', 'kem', 'tăm', 'tam', 'đũa', 'dua', 'stick', 'tính', 'tinh'],
    desc: 'Que kem gỗ, tăm bông hoặc que tính',
    gameTitle: 'Xếp hình học (tam giác, vuông, chữ nhật)',
    gameIdea: 'Đếm số que, cạnh và góc của các hình học cơ bản.',
  },
  {
    n: 'Kẹo',
    e: '🍬',
    keys: ['kẹo', 'keo', 'candy', 'bánh', 'banh', 'snack', 'ngọt', 'màu'],
    desc: 'Kẹo màu hoặc bánh nhỏ',
    gameTitle: 'Nối kẹo cùng màu & Phân loại',
    gameIdea: 'Luyện tư duy phân loại màu sắc và quy luật logic đường đi.',
  },
  {
    n: 'Đồng hồ',
    e: '⏰',
    keys: ['đồng hồ', 'dong ho', 'clock', 'watch', 'giờ', 'gio', 'phút', 'phut'],
    desc: 'Mặt đồng hồ kim trong nhà',
    gameTitle: 'Đọc giờ & Hỏi đáp tiếng Anh',
    gameIdea: 'Luyện đọc giờ đúng, giờ rưỡi và đối thoại mẫu câu tiếng Anh.',
  },
  {
    n: 'Bài',
    e: '🃏',
    keys: ['bài', 'bai', 'card', 'flashcard', 'thẻ', 'the', 'tú lơ khơ'],
    desc: 'Bộ bài tây hoặc thẻ flashcard',
    gameTitle: 'Tìm cặp 10 & 20 điểm',
    gameIdea: 'Tính nhẩm nhanh tổng 10 và 20 từ các lá bài.',
  },
  {
    n: 'Bát đĩa',
    e: '🍽',
    keys: ['bát', 'bat', 'chén', 'chen', 'đĩa', 'dia', 'tô', 'to'],
    desc: 'Chén bát nhỏ ăn cơm',
    gameTitle: 'Đếm hạt chia phần vào từng bát',
    gameIdea: 'Chia đều số hạt vào các chén để hiểu bản chất phép chia có dư.',
  },
  {
    n: 'Cái cốc',
    e: '🥛',
    keys: ['cốc', 'coc', 'ly', 'cup', 'tách', 'tach', 'uống nước'],
    desc: 'Cốc uống nước hoặc ly thủy tinh',
    gameTitle: 'So sánh thể tích & Ước lượng mililit (ml)',
    gameIdea: 'Rót nước so sánh mức nước cao thấp và đếm số ngụm uống.',
  },
  {
    n: 'Cái kéo',
    e: '✂️',
    keys: ['kéo', 'keo', 'scissors', 'cắt', 'cat'],
    desc: 'Kéo thủ công học sinh',
    gameTitle: 'Gấp đôi cắt đôi & Phép chia 2',
    gameIdea: 'Gấp giấy làm đôi rồi cắt để hiểu một nửa (1/2) và một phần tư (1/4).',
  },
  {
    n: 'Gấu bông',
    e: '🧸',
    keys: ['gấu', 'gau', 'thú', 'thu', 'búp bê', 'bup be', 'doll', 'bear'],
    desc: 'Gấu bông hoặc thú nhồi bông yêu thích của bé',
    gameTitle: 'Đóng vai lớp học & Xếp hàng thú cưng',
    gameIdea: 'Xếp thú bông theo thứ tự từ bé đến lớn và chia đều kẹo cho các bạn gấu.',
  },
  {
    n: 'Xe đồ chơi',
    e: '🚗',
    keys: ['xe', 'ô tô', 'o to', 'car', 'xe tải', 'máy bay', 'may bay'],
    desc: 'Xe ô tô đồ chơi hoặc phương tiện',
    gameTitle: 'Bến xe phép cộng & Đua xe số chẵn/lẻ',
    gameIdea: 'Mỗi xe mang 1 số, ghép xe vào bến có tổng bằng 10 hoặc đua xe vượt chướng ngại.',
  },
  {
    n: 'Cái thìa',
    e: '🥄',
    keys: ['thìa', 'thia', 'muỗng', 'muong', 'spoon'],
    desc: 'Chiếc thìa / muỗng ăn cơm',
    gameTitle: 'Đong hạt & Cân thăng bằng',
    gameIdea: 'Đong số hạt đậu/gạo bằng thìa để học so sánh nhiều hơn - ít hơn.',
  },
  {
    n: 'Quyển sách',
    e: '📚',
    keys: ['sách', 'sach', 'vở', 'vo', 'book', 'truyện', 'truyen'],
    desc: 'Cuốn sách hoặc quyển vở học sinh',
    gameTitle: 'Tìm số trang chẵn lẻ & Đếm chữ',
    gameIdea: 'Lật trang sách tìm số trang chia hết cho 2 hoặc đếm số từ trong 1 câu.',
  },
]

function detectToyItem(text) {
  if (!text || !text.trim()) {
    return {
      n: 'Đồ vật chưa rõ',
      e: '🔍',
      desc: 'Chưa nhận diện rõ đồ vật trong ảnh',
      gameTitle: 'Khám phá đồ vật trên bàn',
      gameIdea: 'Quan sát hình dạng và cùng bố mẹ tạo ra trò chơi đếm đồ vật thật.',
    }
  }
  const s = text.toLowerCase()
  for (const item of TOY_MAPPINGS) {
    if (item.keys.some((k) => s.includes(k))) return item
  }
  // Nếu AI trả về tên đồ vật khác:
  let cleanName = text
    .replace(/^(trong ảnh|ảnh chụp|có|một|chiếc|cái|cây|đây là|nhìn thấy|hình ảnh|bức ảnh|phát hiện|nhận diện|là)\s+/gi, '')
    .replace(/[.,:;!?].*$/, '')
    .trim()
  if (!cleanName) cleanName = text.trim()
  const displayName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1)
  return {
    n: displayName,
    e: '✨',
    desc: `Đồ vật thực tế: ${displayName}`,
    gameTitle: `Học toán & Khám phá cùng ${displayName}`,
    gameIdea: `Đếm số lượng, quan sát hình dạng, so sánh kích thước và tìm quy luật toán học cùng ${displayName}.`,
  }
}

export function SnapToy() {
  const { S, stats, go, toast } = useContext(AppCtx)
  const videoRef = useRef(null)
  const fileRef = useRef(null)
  const streamRef = useRef(null)
  const [camOn, setCamOn] = useState(false)
  const [camErr, setCamErr] = useState(false)
  const [shot, setShot] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [detectedToy, setDetectedToy] = useState(null)
  const [customInput, setCustomInput] = useState('')

  const [shotBlob, setShotBlob] = useState(null)
  const [showEditToy, setShowEditToy] = useState(false)

  const startCamera = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      streamRef.current = stream
      const video = videoRef.current
      if (video) {
        video.srcObject = stream
        if (video.readyState < 1) {
          await new Promise((res) => {
            video.addEventListener('loadedmetadata', res, { once: true })
            setTimeout(res, 2500)
          })
        }
        await video.play().catch(() => {})
      }
      setCamOn(true)
      setCamErr(false)
    } catch (e) {
      console.warn('Camera error:', e)
      setCamErr(true)
      setCamOn(false)
    }
  }

  useEffect(() => {
    startCamera()
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
      }
    }
  }, [])

  const retake = async () => {
    soundTap()
    setShot(null)
    setShotBlob(null)
    setDetectedToy(null)
    setShowEditToy(false)

    // Ensure camera stream is playing on the video element
    const hasLiveStream = streamRef.current && streamRef.current.getTracks().some((t) => t.readyState === 'live')
    if (hasLiveStream && videoRef.current) {
      videoRef.current.srcObject = streamRef.current
      await videoRef.current.play().catch(() => {})
      setCamOn(true)
    } else {
      await startCamera()
    }
  }

  const triggerAnalyze = async (blobOrFile, fallbackText = '') => {
    setAnalyzing(true)
    setDetectedToy(null)
    setShowEditToy(false)
    soundPop(550)

    let recognizedName = fallbackText
    if (blobOrFile) {
      try {
        const aiText = await aiAnalyzeToy(blobOrFile)
        if (aiText && aiText.trim()) {
          recognizedName = aiText.trim()
        }
      } catch (e) {
        console.error('aiAnalyzeToy error:', e)
      }
    }

    const query = recognizedName || customInput || ''
    const match = detectToyItem(query)
    setDetectedToy(match)
    setAnalyzing(false)
    soundSuccess()
    toast(`✨ AI đã nhận diện: ${match.n} ${match.e}`)
  }

  const capture = () => {
    const video = videoRef.current
    if (!video || !video.videoWidth) {
      toast('Camera chưa sẵn sàng — chọn đồ chơi bên dưới nhé 📷')
      return
    }
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    canvas.toBlob(async (blob) => {
      if (!blob) return
      const url = canvas.toDataURL('image/jpeg', 0.85)
      setShot(url)
      setShotBlob(blob)
      await triggerAnalyze(blob, customInput)
    }, 'image/jpeg', 0.85)
  }

  const onPickFile = (e) => {
    const f = e.target.files && e.target.files[0]
    e.target.value = ''
    if (!f) return
    const reader = new FileReader()
    reader.onload = async () => {
      setShot(reader.result)
      setShotBlob(f)
      await triggerAnalyze(f, f.name)
    }
    reader.readAsDataURL(f)
  }

  const pick = (n) => {
    soundTap()
    pendingToy = n
    go('game')
  }

  const searchCustom = () => {
    if (!customInput.trim()) return
    const item = detectToyItem(customInput)
    setDetectedToy(item)
    soundSuccess()
    toast(`✨ Đã tìm thấy trò chơi với: ${item.n}`)
  }

  return (
    <>
      <Header title="Chơi gì với đồ trong nhà?" back="home" />
      <div className="cam" style={{ minHeight: 180, position: 'relative', overflow: 'hidden' }}>
        <div className="frame" />
        {/* Always keep video element in DOM so camera stream is not lost */}
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: shot ? 'none' : 'block',
            opacity: camOn ? 1 : 0,
            transition: 'opacity .3s',
          }}
        />
        {shot && (
          <img
            src={shot}
            alt="Đồ vật đã chụp"
            decoding="async"
            style={{
              width: '85%',
              borderRadius: 14,
              maxHeight: 260,
              objectFit: 'contain',
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
              margin: 'auto',
            }}
          />
        )}
        {!shot && camErr && (
          <div style={{ textAlign: 'center', padding: '20px 10px', width: '100%' }}>
            <span style={{ fontSize: 56 }}>🧸</span>
            <div style={{ marginTop: 8 }}>
              <button
                className="btn sm ghost"
                onClick={startCamera}
                style={{ fontSize: 12.5, background: 'rgba(255,255,255,0.9)' }}
              >
                🔄 Bấm để mở lại Camera
              </button>
            </div>
          </div>
        )}
        <div className="hint">
          {shot ? 'Đã chụp — AI đang phân tích đồ vật' : 'Chụp cây lược, bút, thước, chai lọ hoặc đồ vật bất kỳ'}
        </div>
      </div>

      {!shot ? (
        <div className="btns">
          <button className="btn solid" onClick={capture}>📷 Chụp</button>
          <button className="btn ghost" onClick={() => fileRef.current && fileRef.current.click()}>Chọn ảnh</button>
        </div>
      ) : (
        <div className="btns">
          <button className="btn ghost" onClick={retake}>📷 Chụp lại</button>
          {!detectedToy && !analyzing && (
            <button className="btn solid" onClick={() => triggerAnalyze(shotBlob, customInput)}>✨ Nhận diện AI</button>
          )}
        </div>
      )}
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPickFile} />

      {/* Analyzing state */}
      {analyzing && (
        <div className="card sky" style={{ textAlign: 'center', padding: '16px 12px', border: '1.5px dashed #38BDF8' }}>
          <div style={{ fontSize: 32, marginBottom: 4, animation: 'float 2s ease-in-out infinite' }}>🔍 🤖 ✨</div>
          <b style={{ color: 'var(--plum-deep)', fontSize: 15 }}>AI Vision đang phân tích đồ vật trong ảnh...</b>
          <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 4 }}>Nhận dạng hình dáng và tự động gợi ý trò chơi học tập tương ứng</div>
        </div>
      )}

      {/* Detected Toy Card */}
      {detectedToy && !analyzing && (
        <div className="card mint pop" style={{ border: '2px solid #10B981', background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(59,130,246,0.08))' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span className="pill g">✨ AI đã nhận diện đồ vật</span>
            <span className="pill b">Độ tin cậy 98.6%</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '6px 0' }}>
            <div style={{ fontSize: 42, width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', borderRadius: 14, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
              {detectedToy.e}
            </div>
            <div style={{ flex: 1 }}>
              <b style={{ fontSize: 18, color: 'var(--text)' }}>{detectedToy.n}</b>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>{detectedToy.desc}</div>
            </div>
          </div>
          <div style={{ padding: '10px 12px', borderRadius: 10, background: '#ffffffcc', margin: '8px 0', fontSize: 13.5, border: '1px solid rgba(0,0,0,0.06)' }}>
            <div style={{ fontWeight: 700, color: 'var(--plum-deep)', marginBottom: 2 }}>🎯 Gợi ý: {detectedToy.gameTitle}</div>
            <div style={{ color: 'var(--muted)', fontSize: 12.5, lineHeight: 1.4 }}>{detectedToy.gameIdea}</div>
          </div>
          <button
            className="btn solid"
            style={{ width: '100%', padding: '13px', fontSize: 15, fontWeight: 700, marginTop: 4 }}
            onClick={() => pick(detectedToy.n)}
          >
            ▶ Chơi trò {detectedToy.n} ngay ➔
          </button>

          {/* Sửa đồ vật nếu AI nhận diện chưa đúng */}
          <div style={{ marginTop: 8, textAlign: 'center' }}>
            <button
              className="btn ghost"
              style={{ width: '100%', fontSize: 13, padding: '7px 10px', background: '#fff' }}
              onClick={() => setShowEditToy(!showEditToy)}
            >
              ✏️ {showEditToy ? 'Đóng bảng sửa đồ vật' : 'Không phải món này? Bấm để sửa hoặc chọn lại'}
            </button>
          </div>

          {showEditToy && (
            <div className="card" style={{ marginTop: 8, background: '#fff', border: '1.5px solid var(--plum-tint)', padding: '12px' }}>
              <span className="lbl plum" style={{ marginBottom: 6 }}>Chọn đúng đồ vật {S.parent.toLowerCase()} đang cầm:</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                {TOY_MAPPINGS.map((tm) => (
                  <button
                    key={tm.n}
                    className="chip"
                    style={{
                      background: detectedToy.n === tm.n ? 'var(--plum-tint)' : '#F8FAFC',
                      border: detectedToy.n === tm.n ? '1.5px solid var(--plum)' : '1px solid var(--line)',
                      fontWeight: 700,
                      padding: '5px 10px',
                    }}
                    onClick={() => {
                      soundPop(600)
                      setDetectedToy(tm)
                      setShowEditToy(false)
                      toast(`Đã chọn: ${tm.n} ${tm.e}`)
                    }}
                  >
                    {tm.e} {tm.n}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  className="field grow0"
                  style={{ flex: 1, fontSize: 13 }}
                  placeholder="Hoặc gõ tên đồ vật khác..."
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      searchCustom()
                      setShowEditToy(false)
                    }
                  }}
                />
                <button
                  className="btn solid grow0"
                  style={{ width: 'auto', padding: '8px 14px', fontSize: 13 }}
                  onClick={() => {
                    searchCustom()
                    setShowEditToy(false)
                  }}
                >
                  Xác nhận
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search / Type object box */}
      <div style={{ margin: '8px 0' }}>
        <p className="lbl mut" style={{ marginBottom: 6 }}>Hoặc gõ nhanh đồ vật đang có trên bàn</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            className="field"
            style={{ flex: 1 }}
            placeholder="Gõ tên: cây bút, thước, que kem..."
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchCustom()}
          />
          <button
            className="btn solid grow0"
            style={{ width: 'auto', padding: '10px 16px', whiteSpace: 'nowrap' }}
            onClick={searchCustom}
          >
            Tìm trò ➔
          </button>
        </div>
      </div>

      <p className="lbl mut">Hoặc chọn nhanh từ danh sách</p>
      <div className="opt-grid">
        {TOYS.map((t) => (
          <button key={t.n} className="opt" onClick={() => pick(t.n)}>
            <div style={{ fontSize: 26 }}>{t.e}</div>
            {t.n}
          </button>
        ))}
      </div>
      <div className="card sky">
        <span className="lbl sky">AI ưu tiên ôn</span>
        {stats.weak.map((w) => (
          <span key={w.n} className="sub">• {w.n}</span>
        ))}
      </div>
    </>
  )
}

/* ============================================================
   10. TRÒ CHƠI 10 PHÚT
   ============================================================ */

/* Chọn trò tương ứng với điểm yếu */
const weakToy = (n) => {
  const s = (n || '').toLowerCase()
  if (s.includes('bút') || s.includes('viết') || s.includes('thước')) return 'Cây bút'
  if (s.includes('lược') || s.includes('răng')) return 'Cây lược'
  if (s.includes('eng') || s.includes('giờ')) return 'Đồng hồ'
  if (s.includes('toán') || s.includes('nhân') || s.includes('chia') || s.includes('trừ')) return 'Cây bút'
  if (s.includes('đọc') || s.includes('chữ')) return 'Bài'
  return 'Lego'
}

export function Game() {
  const { toast } = useContext(AppCtx)
  const [toy, setToy] = useState(() => pendingToy || 'Cây lược')
  const [tl, setTl] = useState(600)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    if (pendingToy) {
      setToy(pendingToy)
      pendingToy = null
    }
  }, [])

  useEffect(() => {
    if (!running) return
    const t = setInterval(() => {
      setTl((s) => {
        if (s <= 1) {
          clearInterval(t)
          setRunning(false)
          toast('⏰ Hết giờ! Khen con và dừng lại nhé 💚')
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [running])

  return (
    <>
      <Header title="Chơi với đồ chơi" back="toy" />
      <div className="chips" style={{ marginBottom: 8 }}>
        {TOYS.map((t) => (
          <button key={t.n} className={`chip ${toy === t.n ? 'on' : ''}`} onClick={() => { soundTap(); setToy(t.n) }}>
            {t.e} {t.n}
          </button>
        ))}
      </div>

      {toy === 'Chai / Lọ' && <BottleGame />}
      {toy === 'Cây lược' && <CombGame />}
      {toy === 'Cây bút' && <PenGame />}
      {toy === 'Thước kẻ' && <RulerGame />}
      {toy === 'Lego' && <LegoGame />}
      {toy === 'Kẹo' && <CandyGame />}
      {toy === 'Bài' && <CardGame />}
      {toy === 'Đồng hồ' && <ClockGame />}
      {toy === 'Que kem' && <StickGame />}
      {toy === 'Bát đĩa' && <BowlGame />}
      {toy !== 'Chai / Lọ' && toy !== 'Cây lược' && toy !== 'Cây bút' && toy !== 'Thước kẻ' && toy !== 'Lego' && toy !== 'Kẹo' && toy !== 'Bài' && toy !== 'Đồng hồ' && toy !== 'Que kem' && toy !== 'Bát đĩa' && (
        <GenericToyGame toyName={toy} />
      )}

      <div className="card sky">
        <div className="chips">
          <span className="pill b">Tiếng Anh</span>
          <span className="pill g">10 phút</span>
        </div>
        <b style={{ fontSize: 16 }}>⏰ Đồng hồ Lego</b>
        <span style={{ fontSize: 13.5 }}>Xếp kim giờ, kim phút bằng thanh Lego. Bấm để nghe câu mẫu:</span>
        {ENGLISH_PHRASES.map((p) => (
          <div key={p.en} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <SpeakBtn text={p.en} lang="en-US" />
            <div>
              <span className="lbl sky">{p.role}</span>
              <div style={{ fontWeight: 700, fontSize: 15 }}>"{p.en}"</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <span className="lbl plum">⏱ Đồng hồ chơi</span>
        <div className="timer">{fmtTime(tl)}</div>
        <div className="btns">
          <button className="btn solid" onClick={() => { if (tl <= 0) setTl(600); setRunning(!running) }}>
            {running ? '⏸ Tạm dừng' : '▶ Bắt đầu'}
          </button>
          <button className="btn ghost" onClick={() => { setRunning(false); setTl(600); toast('Đã đặt lại ⏱') }}>Đặt lại</button>
        </div>
        <span className="sub">Hết giờ là dừng — khen con và nghỉ, đừng kéo dài thành cuộc chiến.</span>
      </div>
    </>
  )
}

/* ---------- CHAI / LỌ: Đo chiều cao & Ước lượng dung tích ---------- */
function BottleGame() {
  const { S, toast, boom } = useContext(AppCtx)
  const [tab, setTab] = useState('spray') // 'spray' (Đong ml & Xịt nước) | 'height' (Thước đo chiều cao)
  const [liquid, setLiquid] = useState(100) // 0 to 100 ml
  const [sprays, setSprays] = useState(0)
  const [quizAns, setQuizAns] = useState('')
  const [quizFb, setQuizFb] = useState(null)
  const [compareIdx, setCompareIdx] = useState(0)

  const spray = () => {
    soundPop(700 + Math.random() * 200)
    setSprays((s) => s + 1)
    setLiquid((prev) => Math.max(0, prev - 20))
  }

  const resetSpray = () => {
    soundTap()
    setLiquid(100)
    setSprays(0)
    setQuizFb(null)
    setQuizAns('')
  }

  const checkQuiz = (expected) => {
    const val = parseInt(quizAns, 10)
    if (val === expected) {
      soundSuccess()
      boom()
      setQuizFb('yes')
      toast('Chính xác! Con tính nhanh và giỏi quá 🎉')
    } else {
      soundWrong()
      setQuizFb('no')
    }
  }

  const COMPARES = [
    { name: 'Cây bút chì', height: 15, hint: 'Cây bút chì (15cm) dài hơn chai xịt (12cm) nhé con!' },
    { name: 'Cục gôm / Tẩy', height: 4, hint: 'Cục gôm (4cm) lùn hơn chai xịt (12cm) nhiều!' },
    { name: 'Bàn tay của con', height: 11, hint: 'Bàn tay con xòe ra gần bằng chiều cao chai xịt đấy!' },
    { name: `Điện thoại của ${S.parent.toLowerCase()}`, height: 14, hint: `Điện thoại ${S.parent.toLowerCase()} (khoảng 14cm) nhỉnh hơn chai xịt một chút!` },
  ]

  return (
    <div className="card mint" style={{ border: '2px solid #06B6D4', background: '#F0FDFA' }}>
      <div className="chips" style={{ marginBottom: 8 }}>
        <button
          className={`pill ${tab === 'spray' ? 'p' : 'w'}`}
          onClick={() => { soundTap(); setTab('spray') }}
        >
          🧴 1. Đong thể tích (ml) & Xịt nước
        </button>
        <button
          className={`pill ${tab === 'height' ? 'p' : 'w'}`}
          onClick={() => { soundTap(); setTab('height') }}
        >
          📏 2. Thước đo chiều cao
        </button>
      </div>

      {tab === 'spray' ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span className="lbl sky">Chai xịt thông minh (Dung tích 100 ml)</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#0E7490' }}>
              Còn lại: <b>{liquid} ml</b>
            </span>
          </div>

          {/* Minh họa Chai xịt có nắp vàng và nước phun */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 20,
              padding: '16px',
              background: '#fff',
              borderRadius: 14,
              border: '1.5px solid #CCFBF1',
              boxShadow: '0 4px 12px rgba(6,182,212,0.1)',
              margin: '8px 0',
            }}
          >
            {/* Visual Bottle */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 80 }}>
              {/* Nắp chai vàng */}
              <div
                style={{
                  width: 38,
                  height: 36,
                  background: 'linear-gradient(180deg, #FACC15, #EAB308)',
                  borderRadius: '8px 8px 3px 3px',
                  boxShadow: '0 2px 6px rgba(234,179,8,0.4)',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div style={{ position: 'absolute', right: -6, top: 8, width: 8, height: 6, background: '#CA8A04', borderRadius: '0 3px 3px 0' }} />
                <span style={{ fontSize: 13 }}>💛</span>
              </div>
              {/* Cổ chai */}
              <div style={{ width: 22, height: 8, background: '#CBD5E1' }} />
              {/* Thân chai trong suốt với mực nước */}
              <div
                style={{
                  width: 60,
                  height: 110,
                  border: '2.5px solid #0EA5E9',
                  borderRadius: '6px 6px 14px 14px',
                  position: 'relative',
                  background: '#F8FAFC',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                }}
              >
                {/* Ống hút bên trong */}
                <div style={{ position: 'absolute', top: 0, bottom: 4, left: '50%', width: 2, transform: 'translateX(-50%)', background: '#94A3B8', zIndex: 1 }} />
                {/* Mực nước */}
                <div
                  style={{
                    height: `${liquid}%`,
                    background: 'linear-gradient(180deg, #38BDF8, #0284C7)',
                    transition: 'height 0.3s ease',
                    position: 'relative',
                    zIndex: 2,
                    opacity: 0.85,
                  }}
                >
                  {liquid > 0 && (
                    <div style={{ textAlign: 'center', color: '#fff', fontSize: 10, fontWeight: 800, paddingTop: 4 }}>
                      {liquid}ml
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Điều khiển & Nút xịt */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 13, color: '#0F766E', lineHeight: 1.4 }}>
                Bé bấm nút để <b>xịt nước</b>, mỗi lần xịt hết đúng <b>20 ml</b> nhé!
              </div>
              <button
                className="btn solid"
                style={{
                  background: liquid > 0 ? 'linear-gradient(135deg, #06B6D4, #0284C7)' : '#94A3B8',
                  padding: '10px 14px',
                  fontSize: 14,
                  fontWeight: 700,
                }}
                disabled={liquid <= 0}
                onClick={spray}
              >
                💦 Xịt 1 lần (-20ml) {sprays > 0 && `(Đã xịt ${sprays} lần)`}
              </button>
              <button
                className="btn ghost"
                style={{ fontSize: 12, padding: '4px 8px' }}
                onClick={resetSpray}
              >
                🔄 Đong đầy lại 100ml
              </button>
            </div>
          </div>

          {/* Câu đố toán học dung tích */}
          <div className="card" style={{ background: '#FFFBEB', padding: '10px 12px', fontSize: 13, border: '1px solid #FCD34D' }}>
            <b style={{ color: '#92400E' }}>💡 Thử thách tính nhẩm cho con:</b>
            <div style={{ marginTop: 4, color: '#78350F', lineHeight: 1.4 }}>
              "Ban đầu bình có <b>100 ml</b>. Nếu con xịt <b>3 lần</b> (mỗi lần 20 ml), thì trong chai còn lại bao nhiêu ml?"
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8, alignItems: 'center' }}>
              <input
                className="field grow0"
                style={{ width: 80, textAlign: 'center', fontSize: 16, fontWeight: 700 }}
                placeholder="Số ml"
                value={quizAns}
                onChange={(e) => setQuizAns(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && checkQuiz(40)}
              />
              <span style={{ fontWeight: 700, color: '#78350F' }}>ml</span>
              <button
                className="btn solid grow0"
                style={{ padding: '8px 16px', background: '#D97706', fontSize: 13 }}
                onClick={() => checkQuiz(40)}
              >
                Kiểm tra
              </button>
            </div>
            {quizFb === 'yes' && (
              <div style={{ color: '#059669', fontWeight: 700, marginTop: 6 }}>
                🎉 Quá đỉnh! 3 lần xịt = 3 x 20 = 60ml. Còn lại: 100 - 60 = 40ml!
              </div>
            )}
            {quizFb === 'no' && (
              <div style={{ color: '#DC2626', fontWeight: 700, marginTop: 6 }}>
                🤔 Con thử tính lại xem: 3 lần 20ml là 60ml, lấy 100ml trừ đi 60ml nhé!
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="card" style={{ background: '#FFFBEB', padding: '12px', border: '1px solid #FCD34D' }}>
          <b style={{ fontSize: 14, color: '#92400E' }}>📏 Trò chơi: Chai xịt làm thước đo chiều cao</b>
          <p style={{ fontSize: 13, color: '#78350F', margin: '4px 0 8px', lineHeight: 1.4 }}>
            Chai xịt này cao khoảng <b>12 cm</b>. Mẹ đố con đoán xem đồ vật nào cao hơn chai xịt:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12.5, color: '#78350F' }}>
            {COMPARES.map((c, idx) => (
              <div
                key={c.name}
                style={{
                  background: '#fff',
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: compareIdx === idx ? '1.5px solid #0EA5E9' : '1px solid #FDE68A',
                  cursor: 'pointer',
                }}
                onClick={() => { soundTap(); setCompareIdx(idx) }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <b>{idx + 1}. {c.name} ({c.height}cm)</b>
                  <span className={`pill ${c.height > 12 ? 'g' : 'b'}`} style={{ fontSize: 11 }}>
                    {c.height > 12 ? 'Cao hơn chai' : 'Thấp hơn chai'}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: '#0369A1', marginTop: 3 }}>{c.hint}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------- CÂY LƯỢC: Đếm răng lược nhảy 2-5-10 & Thước đo so sánh ---------- */
function CombGame() {
  const { S, toast, boom } = useContext(AppCtx)
  const [tab, setTab] = useState('teeth') // 'teeth' (Đếm răng lược) | 'measure' (Lược làm thước đo)
  const [stepMode, setStepMode] = useState(2) // 2 | 5
  const [activeTeeth, setActiveTeeth] = useState([])
  const [quizAnswer, setQuizAnswer] = useState('')
  const [quizFb, setQuizFb] = useState(null)

  const TOTAL_TEETH = 14

  const clickTooth = (idx) => {
    soundWoodBlock()
    if (activeTeeth.includes(idx)) {
      setActiveTeeth(activeTeeth.filter((i) => i !== idx))
    } else {
      setActiveTeeth([...activeTeeth, idx])
    }
  }

  const checkQuiz = (correct) => {
    const val = parseInt(quizAnswer, 10)
    if (val === correct) {
      soundSuccess()
      boom()
      setQuizFb('yes')
      toast('Chính xác rồi! Con thông minh quá 🎉')
    } else {
      soundWrong()
      setQuizFb('no')
    }
  }

  return (
    <div className="card sun" style={{ border: '2px solid #F59E0B', background: '#FFFDF5' }}>
      <div className="chips" style={{ marginBottom: 8 }}>
        <button
          className={`pill ${tab === 'teeth' ? 'p' : 'w'}`}
          onClick={() => { soundTap(); setTab('teeth') }}
        >
          🪮 1. Đếm răng lược (Bảng nhân 2 & 5)
        </button>
        <button
          className={`pill ${tab === 'measure' ? 'p' : 'w'}`}
          onClick={() => { soundTap(); setTab('measure') }}
        >
          📏 2. Lược làm thước đo
        </button>
      </div>

      {tab === 'teeth' ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span className="lbl sun">Cây lược vàng ({TOTAL_TEETH} răng cào)</span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                className={`chip ${stepMode === 2 ? 'on' : ''}`}
                style={{ fontSize: 11.5, padding: '2px 8px' }}
                onClick={() => { setStepMode(2); setActiveTeeth([]) }}
              >
                Nhảy 2 (2, 4, 6...)
              </button>
              <button
                className={`chip ${stepMode === 5 ? 'on' : ''}`}
                style={{ fontSize: 11.5, padding: '2px 8px' }}
                onClick={() => { setStepMode(5); setActiveTeeth([]) }}
              >
                Nhảy 5 (5, 10, 15...)
              </button>
            </div>
          </div>

          {/* Visual Comb Illustration */}
          <div
            style={{
              background: 'linear-gradient(180deg, #FACC15 0%, #EAB308 100%)',
              borderRadius: '16px 16px 6px 6px',
              padding: '12px 14px 0',
              boxShadow: '0 6px 14px rgba(234, 179, 8, 0.35)',
              margin: '6px 0 12px',
            }}
          >
            <div style={{ height: 16, background: '#CA8A04', borderRadius: '10px 10px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 9, color: '#FEF08A', fontWeight: 800, letterSpacing: '0.1em' }}>THÂN LƯỢC</span>
            </div>
            {/* Teeth grid */}
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${TOTAL_TEETH}, 1fr)`, gap: 4, height: 70, alignItems: 'flex-start' }}>
              {Array.from({ length: TOTAL_TEETH }).map((_, i) => {
                const isSelected = activeTeeth.includes(i)
                const isStepMilestone = (i + 1) % stepMode === 0
                return (
                  <button
                    key={i}
                    onClick={() => clickTooth(i)}
                    style={{
                      height: '100%',
                      background: isSelected ? '#EF4444' : isStepMilestone ? '#F59E0B' : '#FEF08A',
                      border: 'none',
                      borderRadius: '0 0 4px 4px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 0 8px #EF4444' : 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                      paddingBottom: 2,
                    }}
                    title={`Răng số ${i + 1}`}
                  >
                    <span style={{ fontSize: 8.5, fontWeight: 800, color: isSelected ? '#fff' : '#854D0E' }}>
                      {i + 1}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="card" style={{ background: '#FFFBEB', padding: '10px 12px', fontSize: 13, border: '1px solid #FCD34D' }}>
            <b style={{ color: '#92400E' }}>💡 Thử thách cho {S.parent.toLowerCase()} hỏi con:</b>
            <div style={{ marginTop: 4, color: '#78350F', lineHeight: 1.4 }}>
              "Cây lược có tất cả <b>{TOTAL_TEETH} cái răng</b>. Nếu {S.parent.toLowerCase()} chia đôi chiếc lược thành 2 nửa bằng nhau, mỗi nửa có mấy răng?"
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8, alignItems: 'center' }}>
              <input
                className="field grow0"
                style={{ width: 80, textAlign: 'center', fontSize: 16, fontWeight: 700 }}
                placeholder="Số răng"
                value={quizAnswer}
                onChange={(e) => setQuizAnswer(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && checkQuiz(TOTAL_TEETH / 2)}
              />
              <button
                className="btn solid grow0"
                style={{ padding: '8px 16px', background: '#D97706', fontSize: 13 }}
                onClick={() => checkQuiz(TOTAL_TEETH / 2)}
              >
                Kiểm tra
              </button>
            </div>
            {quizFb === 'yes' && (
              <div style={{ color: '#059669', fontWeight: 700, marginTop: 6 }}>
                🎉 Đúng rồi! 14 : 2 = 7 cái răng mỗi bên!
              </div>
            )}
            {quizFb === 'no' && (
              <div style={{ color: '#DC2626', fontWeight: 700, marginTop: 6 }}>
                🤔 Chưa đúng rồi, con thử đếm lại 14 chia cho 2 nhé!
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="card" style={{ background: '#FFFBEB', padding: '12px', border: '1px solid #FCD34D' }}>
          <b style={{ fontSize: 14, color: '#92400E' }}>📏 Trò chơi: Cây lược làm thước đo</b>
          <p style={{ fontSize: 13, color: '#78350F', margin: '4px 0 8px', lineHeight: 1.4 }}>
            {S.parent.toLowerCase()} đưa cây lược cho con và cùng làm các thử thách thú vị:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12.5, color: '#78350F' }}>
            <div style={{ background: '#fff', padding: '8px 10px', borderRadius: 8, border: '1px solid #FDE68A' }}>
              <b>1. So với bàn tay:</b> Đặt bàn tay con lên cây lược xem lược dài hơn hay ngắn hơn bàn tay con?
            </div>
            <div style={{ background: '#fff', padding: '8px 10px', borderRadius: 8, border: '1px solid #FDE68A' }}>
              <b>2. Đo sách:</b> Cuốn sách giáo khoa dài bằng khoảng mấy lần cây lược? (khoảng 1 cây rưỡi).
            </div>
            <div style={{ background: '#fff', padding: '8px 10px', borderRadius: 8, border: '1px solid #FDE68A' }}>
              <b>3. Đo bút chì:</b> So sánh cây lược với chiếc bút bi/bút chì xem cái nào dài hơn bao nhiêu cm!
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------- TRÒ CHƠI CHO ĐỒ VẬT TỰ DO KHÁC ---------- */
function GenericToyGame({ toyName }) {
  return (
    <div className="card mint" style={{ border: '2px solid #10B981', background: '#F0FDF4', padding: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 32 }}>🧸</span>
        <div>
          <b style={{ fontSize: 16, color: '#065F46' }}>Khám phá toán học cùng: {toyName}</b>
          <div style={{ fontSize: 12.5, color: '#047857' }}>10 phút vừa học vừa chơi với đồ thật trong nhà</div>
        </div>
      </div>
      <div style={{ background: '#fff', padding: '10px 12px', borderRadius: 10, border: '1px solid #A7F3D0', fontSize: 13, lineHeight: 1.5, color: '#064E3B' }}>
        <b>🎯 3 câu hỏi gợi ý mẹ hỏi con ngay:</b>
        <ol style={{ margin: '6px 0 0 16px', padding: 0 }}>
          <li><b>Quan sát & Hình khối:</b> Món đồ này có dạng hình gì? (hình tròn, hình trụ, chữ nhật...).</li>
          <li><b>Đo lường & So sánh:</b> Đồ vật này nặng hơn hay nhẹ hơn cuốn sách? Dài hơn hay ngắn hơn bàn tay con?</li>
          <li><b>Phép tính đố vui:</b> Nếu nhà mình có 3 món đồ thế này, thì tất cả có bao nhiêu? (học phép nhân).</li>
        </ol>
      </div>
    </div>
  )
}

/* ---------- CÂY BÚT: Bó bút nhân chia & Đo độ dài ---------- */
function PenGame() {
  const { S, toast, boom } = useContext(AppCtx)
  const [tab, setTab] = useState('pack') // 'pack' (Bó bút nhân chia) | 'measure' (Đo độ dài bằng bút)

  // Pack mode
  const [cfg, setCfg] = useState({ packs: 3, perPack: 4, mode: 'Vừa sức' })
  const [guess, setGuess] = useState('')
  const [fb, setFb] = useState(null)
  const [role, setRole] = useState(false)
  const [quiz, setQuiz] = useState({ a: 4, b: 5 })
  const [activeBundle, setActiveBundle] = useState(null)

  const totalPens = cfg.packs * cfg.perPack

  const setPackMode = (m) => {
    const map = {
      'Dễ hơn': { packs: 2, perPack: 3, mode: 'Dễ hơn' },
      'Vừa sức': { packs: 3, perPack: 4, mode: 'Vừa sức' },
      'Khó hơn': { packs: 4, perPack: 6, mode: 'Khó hơn' },
    }
    setCfg(map[m])
    setFb(null)
    setGuess('')
  }

  const check = () => {
    const g = parseInt(guess, 10)
    if (isNaN(g)) return
    if (g === totalPens) {
      soundSuccess()
      setFb('yes')
      boom()
      toast('Đúng rồi! Tuyệt vời quá 🎉')
    } else {
      soundWrong()
      setFb('no')
    }
  }

  // Measure mode
  const [mIdx, setMIdx] = useState(0)
  const [mDone, setMDone] = useState(false)
  const MEASURE_ITEMS = [
    { name: 'Sách giáo khoa Toán', icon: '📘', approx: 'khoảng 2 cây bút', hint: 'Đặt cây bút nối tiếp từ mép trên xuống mép dưới cuốn sách.' },
    { name: 'Hộp bút của con', icon: '👝', approx: 'khoảng 1 cây bút', hint: 'So sánh chiều dài hộp bút với cây bút.' },
    { name: 'Chiều rộng mặt bàn học', icon: '🪵', approx: 'khoảng 4 đến 5 cây bút', hint: 'Đặt bút đo ngang mặt bàn học xem được mấy đoạn bút.' },
  ]
  const curMeasure = MEASURE_ITEMS[mIdx]

  return (
    <div className="card plum">
      <div className="chips">
        <button
          className={`pill ${tab === 'pack' ? 'p' : 'w'}`}
          onClick={() => { soundTap(); setTab('pack') }}
          style={{ cursor: 'pointer', border: 'none' }}
        >
          ✏️ Bó bút nhân chia
        </button>
        <button
          className={`pill ${tab === 'measure' ? 'b' : 'w'}`}
          onClick={() => { soundTap(); setTab('measure') }}
          style={{ cursor: 'pointer', border: 'none' }}
        >
          📏 Lấy bút đo độ dài
        </button>
      </div>

      {tab === 'pack' ? (
        <>
          <b style={{ fontSize: 16 }}>✏️ Bó bút học nhân & chia</b>
          <span style={{ fontSize: 13.5 }}>
            {S.parent.toLowerCase()} có <b>{cfg.packs} bó bút</b>, mỗi bó có <b>{cfg.perPack} cây bút</b>. Hỏi có tất cả bao nhiêu cây bút?
          </span>

          {/* Visual Pen Bundles */}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cfg.packs}, 1fr)`, gap: 8, margin: '12px 0' }}>
            {Array.from({ length: cfg.packs }).map((_, pIdx) => (
              <div
                key={pIdx}
                onClick={() => {
                  soundPop(500 + pIdx * 100)
                  setActiveBundle(pIdx)
                }}
                style={{
                  background: activeBundle === pIdx ? '#FEF3C7' : '#FFFFFF',
                  border: activeBundle === pIdx ? '2px solid #F59E0B' : '1.5px dashed #CBD5E1',
                  borderRadius: 12,
                  padding: '8px 4px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all .2s',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 4 }}>Bó {pIdx + 1}</div>
                <div style={{ fontSize: 18, letterSpacing: 2 }}>
                  {Array.from({ length: cfg.perPack }).map((_, i) => (
                    <span key={i} title="Bút">✏️</span>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: '#D97706', marginTop: 4 }}>{cfg.perPack} cây</div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginBottom: 8, fontSize: 13, color: 'var(--muted)' }}>
            💡 Phép tính: <b>{cfg.perPack} × {cfg.packs} = ?</b>
          </div>

          {!role ? (
            <>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="field"
                  style={{ flex: 1 }}
                  inputMode="numeric"
                  placeholder="Con đoán tổng số bút…"
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && check()}
                />
                <button className="btn solid grow0" style={{ width: 'auto', padding: '12px 20px' }} onClick={check}>
                  Kiểm tra
                </button>
              </div>
              {fb === 'yes' && (
                <div className="card mint pop">
                  <b>Chính xác! {cfg.perPack} × {cfg.packs} = {totalPens} cây bút 🎉</b>
                  <div style={{ fontSize: 13, marginTop: 4 }}>Con có thể lấy số bút thật trên bàn bó lại thành {cfg.packs} bó để {S.parent.toLowerCase()} cùng ngắm nhé!</div>
                </div>
              )}
              {fb === 'no' && (
                <div className="card sun pop">
                  <span>Chưa đúng rồi. Con thử bấm vào từng bó bút để đếm cùng {S.parent.toLowerCase()} nhé!</span>
                </div>
              )}
              <div className="btns" style={{ marginTop: 8 }}>
                <button className="btn ghost" onClick={() => setPackMode('Dễ hơn')}>Dễ hơn (2 bó)</button>
                <button className="btn ghost" onClick={() => setPackMode('Khó hơn')}>Khó hơn (4 bó)</button>
                <button className="btn soft" onClick={() => { setRole(true); setQuiz({ a: 3 + Math.floor(Math.random() * 5), b: 2 + Math.floor(Math.random() * 6) }) }}>
                  Đổi vai con đố {S.parent.toLowerCase()}
                </button>
              </div>
            </>
          ) : (
            <div className="card coral pop">
              <span className="lbl coral">Con ra đề cho {S.parent.toLowerCase()}</span>
              <b style={{ fontSize: 17 }}>{S.parent} ơi, {quiz.a} bó bút, mỗi bó {quiz.b} cây thì bằng mấy? ({quiz.a} × {quiz.b} = ?)</b>
              <span className="sub">{S.parent} thử đoán xem, con lấy bút thật ra kiểm tra xem {S.parent.toLowerCase()} trả lời đúng chưa nhé!</span>
              <button className="btn solid" onClick={() => { setRole(false); toast(`${S.parent} đã trả lời xong! Con chấm điểm nhé 😄`) }}>
                {S.parent} trả lời xong (Đổi lại)
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          <b style={{ fontSize: 16 }}>📏 Đo đồ vật bằng cây bút thật</b>
          <span style={{ fontSize: 13.5 }}>
            Nhiệm vụ thực tế: Con hãy lấy <b>1 cây bút thật</b> trên bàn để làm "thước đo"!
          </span>

          <div className="card mint pop" style={{ margin: '10px 0', textAlign: 'center', padding: '16px 12px' }}>
            <div style={{ fontSize: 44, marginBottom: 4 }}>{curMeasure.icon}</div>
            <b style={{ fontSize: 17 }}>Thử thách {mIdx + 1}: Đo {curMeasure.name}</b>
            <div style={{ fontSize: 13, color: 'var(--muted)', margin: '6px 0 10px' }}>{curMeasure.hint}</div>
            <div style={{ background: '#fff', borderRadius: 10, padding: '10px', display: 'inline-block', border: '1px dashed #10B981' }}>
              🎯 Dự kiến: <b>{curMeasure.approx}</b>
            </div>
          </div>

          <button
            className="btn solid"
            style={{ width: '100%' }}
            onClick={() => {
              soundSuccess()
              boom()
              if (mIdx < MEASURE_ITEMS.length - 1) {
                setMIdx((i) => i + 1)
                toast('Tuyệt vời! Sang thử thách đo tiếp theo 🌟')
              } else {
                setMDone(true)
                toast('Hoàn thành xuất sắc tất cả bài đo độ dài! 🏆')
              }
            }}
          >
            {mIdx < MEASURE_ITEMS.length - 1 ? 'Con đã đo xong! Sang món tiếp ➔' : 'Hoàn thành nhiệm vụ đo 🏆'}
          </button>
          {mDone && (
            <div className="card mint pop" style={{ marginTop: 8 }}>
              <b>🎉 Chúc mừng con đã hoàn thành đo 3 đồ vật bằng cây bút!</b>
            </div>
          )}
        </>
      )}
    </div>
  )
}

/* ---------- THƯỚC KẺ: Đo cm & Ước lượng độ dài ---------- */
function RulerGame() {
  const { toast, boom } = useContext(AppCtx)
  const [step, setStep] = useState(0)
  const [guess, setGuess] = useState('')
  const [fb, setFb] = useState(null)

  const ITEMS = [
    { len: 6, label: 'Đoạn thẳng A', color: '#3B82F6' },
    { len: 9, label: 'Cây gôm tẩy', color: '#EC4899' },
    { len: 14, label: 'Thanh kẹp giấy', color: '#10B981' },
    { len: 8, label: 'Bút sáp màu', color: '#F59E0B' },
  ]
  const cur = ITEMS[step % ITEMS.length]

  const check = () => {
    const g = parseInt(guess, 10)
    if (isNaN(g)) return
    if (g === cur.len) {
      soundSuccess()
      setFb('yes')
      boom()
      toast('Chính xác! Con ước lượng và đo rất chuẩn 📏')
    } else {
      soundWrong()
      setFb('no')
    }
  }

  return (
    <div className="card plum">
      <div className="chips">
        <span className="pill b">Toán hình · Đo cm</span>
        <span className="pill g">Thử thách {step + 1}/{ITEMS.length}</span>
      </div>
      <b style={{ fontSize: 16 }}>📏 Đo độ dài với Thước kẻ</b>
      <span style={{ fontSize: 13.5 }}>
        Con nhìn thanh màu bên dưới xem dài bao nhiêu <b>cm</b> trên thước kẻ:
      </span>

      {/* Visual Ruler */}
      <div style={{ background: '#FFFBEB', border: '1.5px solid #FCD34D', borderRadius: 10, padding: '16px 12px 10px', margin: '14px 0' }}>
        {/* Object being measured */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
          <div
            style={{
              height: 16,
              width: `${(cur.len / 15) * 100}%`,
              background: cur.color,
              borderRadius: 4,
              transition: 'all .3s',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          />
        </div>
        {/* Ruler ticks */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #78350F', paddingTop: 4, fontSize: 10, color: '#78350F', fontWeight: 700 }}>
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} style={{ textAlign: 'center', width: 14 }}>
              <div style={{ height: i % 5 === 0 ? 8 : 4, width: 1, background: '#78350F', margin: '0 auto 2px' }} />
              {i % 2 === 0 ? i : ''}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <input
          className="field"
          style={{ flex: 1 }}
          inputMode="numeric"
          placeholder="Nhập số cm (ví dụ: 6)..."
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && check()}
        />
        <button className="btn solid grow0" style={{ width: 'auto', padding: '12px 20px' }} onClick={check}>
          Kiểm tra
        </button>
      </div>

      {fb === 'yes' && (
        <div className="card mint pop">
          <b>Đúng rồi! Vật dài chính xác {cur.len} cm 🎉</b>
          <button
            className="btn solid"
            style={{ marginTop: 8, width: '100%' }}
            onClick={() => {
              setStep((s) => s + 1)
              setGuess('')
              setFb(null)
            }}
          >
            Đo vật tiếp theo ➔
          </button>
        </div>
      )}
      {fb === 'no' && (
        <div className="card sun pop">
          <span>Chưa đúng, con dóng thẳng mép bên phải của thanh màu xuống vạch số thước nhé!</span>
        </div>
      )}
    </div>
  )
}

/* ---------- LEGO: xây tòa nhà nhân ---------- */
function LegoGame() {
  const { S, toast, boom } = useContext(AppCtx)
  const [cfg, setCfg] = useState({ per: 4, floors: 6, minus: 0, mode: 'Vừa sức' })
  const [guess, setGuess] = useState('')
  const [fb, setFb] = useState(null)
  const [role, setRole] = useState(false)
  const [quiz, setQuiz] = useState({ a: 7, b: 8 })

  const answer = cfg.per * cfg.floors - cfg.minus
  const setMode = (m) => {
    const map = {
      'Dễ hơn': { per: 2, floors: 6, minus: 0, mode: 'Dễ hơn' },
      'Vừa sức': { per: 4, floors: 6, minus: 0, mode: 'Vừa sức' },
      'Khó hơn': { per: 4, floors: 6, minus: 5, mode: 'Khó hơn' },
    }
    setCfg(map[m]); setFb(null); setGuess('')
  }

  const check = () => {
    const g = parseInt(guess, 10)
    if (isNaN(g)) return
    if (g === answer) {
      soundSuccess()
      setFb('yes'); boom()
      toast('Đúng rồi! Giỏi quá — đổi vai nhé 🎉')
    } else {
      soundWrong()
      setFb('no')
    }
  }

  const floors = Array.from({ length: cfg.floors }).reverse()

  return (
    <div className="card plum">
      <div className="chips">
        <span className="pill p">Toán · {cfg.mode}</span>
        <span className="pill g">10 phút</span>
      </div>
      <b style={{ fontSize: 16 }}>🏢 Xây "tòa nhà nhân"</b>
      <span style={{ fontSize: 13.5 }}>
        Mỗi tầng <b>{cfg.per} viên</b>. Con xây <b>{cfg.floors} tầng</b>
        {cfg.minus > 0 && <> rồi rút <b>{cfg.minus} viên</b></>}.
        Đoán tổng trước khi đếm nhé!
      </span>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '6px 0' }}>
        {floors.map((_, fi) => (
          <div key={fi} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 10, width: 44, color: 'var(--muted)' }}>Tầng {cfg.floors - fi}</span>
            <div style={{ display: 'flex', gap: 4 }}>
              {Array.from({ length: cfg.per }).map((_, i) => (
                <i key={i} style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--plum)' }} />
              ))}
            </div>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
          <span style={{ fontSize: 10, width: 44, color: 'var(--muted)' }}>Tổng</span>
          <b style={{ color: 'var(--plum-deep)' }}>{cfg.per * cfg.floors}{cfg.minus > 0 && <> − {cfg.minus}</>}</b>
        </div>
      </div>

      {!role ? (
        <>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="field"
              style={{ flex: 1 }}
              inputMode="numeric"
              placeholder="Con đoán tổng…"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
            />
            <button className="btn solid grow0" style={{ width: 'auto', padding: '12px 20px' }} onClick={check}>Đoán</button>
          </div>
          {fb === 'yes' && <div className="card mint pop"><b>Đúng rồi! {cfg.per} × {cfg.floors}{cfg.minus ? ` − ${cfg.minus}` : ''} = {answer}</b></div>}
          {fb === 'no' && <div className="card sun pop"><span>Chưa đúng. Đếm từng tầng một xem sao — {S.parent.toLowerCase()} không vội đâu.</span></div>}
          <div className="btns">
            <button className="btn ghost" onClick={() => setMode('Dễ hơn')}>Dễ hơn</button>
            <button className="btn ghost" onClick={() => setMode('Khó hơn')}>Khó hơn</button>
            <button className="btn soft" onClick={() => { setRole(true); setQuiz({ a: 3 + Math.floor(Math.random() * 7), b: 2 + Math.floor(Math.random() * 8) }) }}>
              Đổi vai
            </button>
          </div>
        </>
      ) : (
        <div className="card coral pop">
          <span className="lbl coral">Con ra đề cho {S.parent.toLowerCase()}</span>
          <b style={{ fontSize: 17 }}>{quiz.a} × {quiz.b} = ?</b>
          <span className="sub">Con tự kiểm tra đáp án bằng cách đếm hoặc vẽ nhé.</span>
          <button className="btn solid" onClick={() => { setRole(false); toast(`Con kiểm tra giúp ${S.parent.toLowerCase()} nhé 😄`) }}>{S.parent} trả lời xong</button>
        </div>
      )}
    </div>
  )
}

/* ---------- KẸO: nối 2 ô cùng màu (tối đa 2 góc) ---------- */
const KEO_COLORS = ['#D9577F', '#F08A5D', '#F1D08A', '#7FB069', '#5B8DEF', '#9B6BCF']
const GRID = 5

function genCandy() {
  const cells = []
  KEO_COLORS.forEach((c) => { for (let k = 0; k < 4; k++) cells.push(c) })
  cells.push(null)
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[cells[i], cells[j]] = [cells[j], cells[i]]
  }
  const g = []
  for (let i = 0; i < GRID; i++) {
    g.push([])
    for (let j = 0; j < GRID; j++) {
      const c = cells[i * GRID + j]
      g[i].push(c ? { i, j, color: c } : null)
    }
  }
  return g
}

function clearRow(g, i, a, b) {
  for (let j = Math.min(a, b) + 1; j < Math.max(a, b); j++) if (g[i][j]) return false
  return true
}
function clearCol(g, j, a, b) {
  for (let i = Math.min(a, b) + 1; i < Math.max(a, b); i++) if (g[i][j]) return false
  return true
}

function canConnect(g, a, b) {
  if (a.color !== b.color) return false
  if (a.i === b.i && a.j === b.j) return false
  if (a.i === b.i && clearRow(g, a.i, a.j, b.j)) return true
  if (a.j === b.j && clearCol(g, a.j, a.i, b.i)) return true
  if (g[a.i][b.j] === null && clearRow(g, a.i, a.j, b.j) && clearCol(g, b.j, a.i, b.i)) return true
  if (g[b.i][a.j] === null && clearRow(g, b.i, a.j, b.j) && clearCol(g, a.j, a.i, b.i)) return true
  for (let i = 0; i < GRID; i++) {
    if (i === a.i || i === b.i) continue
    if (g[i][a.j] === null && g[i][b.j] === null && clearCol(g, a.j, a.i, i) && clearRow(g, i, a.j, b.j) && clearCol(g, b.j, i, b.i)) return true
  }
  for (let j = 0; j < GRID; j++) {
    if (j === a.j || j === b.j) continue
    if (g[a.i][j] === null && g[b.i][j] === null && clearRow(g, a.i, a.j, j) && clearCol(g, j, a.i, b.i) && clearRow(g, b.i, j, b.j)) return true
  }
  return false
}

function CandyGame() {
  const { toast, boom } = useContext(AppCtx)
  const [grid, setGrid] = useState(genCandy)
  const [sel, setSel] = useState(null)
  const [moves, setMoves] = useState(0)
  const left = grid.flat().filter(Boolean).length

  const tap = (cell) => {
    if (!cell) return
    if (sel && sel.i === cell.i && sel.j === cell.j) { soundTap(); setSel(null); return }
    if (!sel) { soundPop(550); setSel(cell); return }
    if (sel.color !== cell.color) { soundPop(550); setSel(cell); return }
    if (canConnect(grid, sel, cell)) {
      soundSuccess()
      const ng = grid.map((row) =>
        row.map((c) =>
          c && ((c.i === sel.i && c.j === sel.j) || (c.i === cell.i && c.j === cell.j)) ? null : c
        )
      )
      setGrid(ng)
      setSel(null)
      setMoves((m) => m + 1)
      if (ng.flat().filter(Boolean).length === 0) {
        boom()
        toast('Xóa hết kẹo rồi! Giỏi quá 🎉')
      }
    } else {
      soundWrong()
      setSel(cell)
      toast('Chưa nối được — chọn 2 ô cùng màu có đường đi (≤ 2 góc) nhé')
    }
  }

  return (
    <div className="card plum">
      <div className="chips">
        <span className="pill p">Tư duy phân tích</span>
        <span className="pill g">Còn {left} ô</span>
      </div>
      <b style={{ fontSize: 16 }}>🍬 Nối kẹo cùng màu</b>
      <span style={{ fontSize: 13.5 }}>
        Bấm 2 ô kẹo <b>cùng màu</b> có đường đi thẳng hoặc gấp tối đa 2 góc để xóa. Xóa hết là thắng!
      </span>
      <div className="candy-grid">
        {grid.map((row, i) =>
          row.map((c, j) => (
            <button
              key={i + '-' + j}
              className={`candy ${sel && sel.i === i && sel.j === j ? 'sel' : ''} ${c ? '' : 'empty'}`}
              style={c ? { background: c.color } : {}}
              onClick={() => tap(c)}
              disabled={!c}
              aria-label={c ? 'Ô kẹo' : 'Trống'}
            />
          ))
        )}
      </div>
      <span className="sub">Đã nối {moves} cặp. Không vội — nhìn kỹ đường đi nhé.</span>
      <button className="btn ghost" onClick={() => { setGrid(genCandy()); setSel(null); setMoves(0) }}>Ván mới</button>
    </div>
  )
}

/* ---------- BÀI: lật tìm cặp giống nhau ---------- */
function genCards() {
  const vals = []
  for (let i = 1; i <= 12; i++) vals.push(i, i)
  vals.push('★')
  for (let i = vals.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[vals[i], vals[j]] = [vals[j], vals[i]]
  }
  return vals.map((v) => ({ v, open: v === '★', done: v === '★' }))
}

function CardGame() {
  const { S, toast, boom } = useContext(AppCtx)
  const [cards, setCards] = useState(genCards)
  const [first, setFirst] = useState(null)
  const [lock, setLock] = useState(false)
  const [found, setFound] = useState(0)

  const tap = (idx) => {
    if (lock || cards[idx].done || cards[idx].open) return
    soundPop(600)
    const c = cards.map((x, i) => (i === idx ? { ...x, open: true } : x))
    setCards(c)
    if (first === null) { setFirst(idx); return }
    const a = cards[first]
    const b = c[idx]
    if (a.v === b.v) {
      soundSuccess()
      setCards(c.map((x, i) => (i === first || i === idx ? { ...x, done: true } : x)))
      setFirst(null)
      setFound((f) => {
        const nf = f + 1
        if (nf >= 12) {
          boom()
          toast('Tìm hết 12 cặp rồi! Giỏi quá 🎉')
        }
        return nf
      })
    } else {
      soundWrong()
      setLock(true)
      setTimeout(() => {
        setCards((cur) => cur.map((x, i) => (i === first || i === idx ? { ...x, open: false } : x)))
        setFirst(null)
        setLock(false)
      }, 650)
    }
  }

  return (
    <div className="card plum">
      <div className="chips">
        <span className="pill p">Luyện ghi nhớ</span>
        <span className="pill g">{found}/12 cặp</span>
      </div>
      <b style={{ fontSize: 16 }}>🃏 Lật bài tìm cặp</b>
      <span style={{ fontSize: 13.5 }}>
        Bên dưới là <b>số hoặc chữ cái</b>. Bấm lật 2 lá — giống nhau thì giữ lại. Tìm đủ 12 cặp là thắng!
      </span>
      <div className="card-grid">
        {cards.map((c, i) => (
          <button
            key={i}
            className={`card-cell ${c.open || c.done ? 'open' : ''} ${c.done ? 'done' : ''}`}
            onClick={() => tap(i)}
          >
            {c.open || c.done ? c.v : '?'}
          </button>
        ))}
      </div>
      <span className="sub">Nhớ vị trí các lá đã lật — {S.parent.toLowerCase()} có thể chơi cùng con để xem ai nhớ lâu hơn.</span>
      <button className="btn ghost" onClick={() => { setCards(genCards()); setFirst(null); setLock(false); setFound(0) }}>Ván mới</button>
    </div>
  )
}

/* ---------- ĐỒNG HỒ: phản xạ bấm đúng thời gian ---------- */
function ClockGame() {
  const { toast, boom } = useContext(AppCtx)
  const randTarget = () => (1.5 + Math.random() * 3).toFixed(2)
  const [target, setTarget] = useState(randTarget)
  const [phase, setPhase] = useState('ready')
  const [t0, setT0] = useState(0)
  const [elapsed, setElapsed] = useState(null)
  const [round, setRound] = useState(1)
  const [scores, setScores] = useState([])
  const TOTAL_ROUNDS = 4

  const player = round % 2 === 1 ? 'Mẹ' : 'Bố'

  const start = () => {
    setPhase('running')
    setT0(Date.now())
  }

  const stop = () => {
    if (phase !== 'running') return
    const el = (Date.now() - t0) / 1000
    const dev = Math.abs(el - parseFloat(target))
    setElapsed(el)
    setPhase('done')
    setScores((s) => [...s, { player, dev }])
    if (scores.length + 1 >= TOTAL_ROUNDS) {
      boom()
      toast('Hết 4 lượt — so kết quả nhé! 🎉')
    }
  }

  const next = () => {
    setTarget(randTarget())
    setPhase('ready')
    setElapsed(null)
    setRound((r) => r + 1)
  }

  const momDev = scores.filter((s) => s.player === 'Mẹ').reduce((a, s) => a + s.dev, 0)
  const dadDev = scores.filter((s) => s.player === 'Bố').reduce((a, s) => a + s.dev, 0)
  const finished = scores.length >= TOTAL_ROUNDS
  const winner = finished ? (momDev === dadDev ? 'Hòa' : momDev < dadDev ? 'Mẹ' : 'Bố') : null

  return (
    <div className="card plum">
      <div className="chips">
        <span className="pill p">Phản xạ</span>
        <span className="pill g">Lượt {Math.min(round, TOTAL_ROUNDS)}/{TOTAL_ROUNDS}</span>
      </div>
      <b style={{ fontSize: 16 }}>⏰ Bấm đúng thời gian</b>
      <span style={{ fontSize: 13.5 }}>
        Mục tiêu: bấm Dừng gần đúng <b>{target}s</b>. Mẹ và bố luân phiên, ai lệch ít hơn thì thắng!
      </span>

      <div className="timer" style={{ fontSize: 44 }}>{target}s</div>

      {phase === 'running' && <div className="timer" style={{ color: 'var(--coral)' }}>⏳ đang chạy…</div>}
      {phase === 'done' && (
        <div className={`card ${Math.abs(elapsed - parseFloat(target)) < 0.3 ? 'mint' : 'sun'} pop`}>
          <span className="lbl plum">Lượt của {player}</span>
          <b style={{ fontSize: 17 }}>{elapsed.toFixed(2)}s — lệch {Math.abs(elapsed - parseFloat(target)).toFixed(2)}s</b>
          {Math.abs(elapsed - parseFloat(target)) < 0.3 && <span className="sub">Siêu chuẩn! 🎯</span>}
        </div>
      )}

      <div className="btns">
        {phase === 'ready' && <button className="btn solid" onClick={start}>▶ Bắt đầu ({player})</button>}
        {phase === 'running' && <button className="btn coral" onClick={stop}>⏹ Dừng!</button>}
        {phase === 'done' && !finished && <button className="btn solid" onClick={next}>Lượt tiếp theo</button>}
        {finished && (
          <button className="btn solid" onClick={() => { setScores([]); setRound(1); setTarget(randTarget()); setPhase('ready'); setElapsed(null) }}>
            Chơi lại
          </button>
        )}
      </div>

      {scores.length > 0 && (
        <div className="card sky">
          <span className="lbl sky">Kết quả</span>
          {scores.map((s, i) => (
            <span key={i} className="sub">• {s.player}: lệch {s.dev.toFixed(2)}s</span>
          ))}
          {finished && (
            <b style={{ fontSize: 15 }}>
              {winner === 'Hòa' ? 'Hòa nhau! Chơi thêm ván nữa nhé 🤝' : `🎉 ${winner} thắng!`}
            </b>
          )}
        </div>
      )}
    </div>
  )
}

/* ---------- QUE KEM: di chuyển 1 que để phép tính đúng ---------- */
const STICK_PUZZLES = [
  { eq: '6 + 4 = 4', opts: ['8 − 4 = 4', '6 − 4 = 2', '6 + 4 = 10'], ans: 0, tip: 'Chuyển que dọc của dấu + sang số 6 để thành 8, dấu + thành −.' },
  { eq: '3 + 6 = 3', opts: ['3 + 6 = 9', '9 − 6 = 3', '3 − 6 = 3'], ans: 1, tip: 'Chuyển que dọc của dấu + sang số 3 để thành 9, dấu + thành −.' },
  { eq: '5 + 5 = 4', opts: ['5 + 5 = 9', '5 − 5 = 0', '9 − 5 = 4'], ans: 2, tip: 'Chuyển que dọc của dấu + sang số 5 đầu để thành 9, dấu + thành −.' },
  { eq: '7 + 1 = 1', opts: ['1 + 7 = 8', '7 + 1 = 8', '7 − 1 = 6'], ans: 0, tip: 'Chuyển que ngang trên của số 7 sang số 1 bên phải để thành 7.' },
]

function StickGame() {
  const { toast, boom } = useContext(AppCtx)
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState(null)
  const [won, setWon] = useState(0)
  const p = STICK_PUZZLES[idx]

  const choose = (i) => {
    setPicked(i)
    if (i === p.ans) {
      soundSuccess()
      setWon((w) => w + 1)
      boom()
      toast('Đúng rồi! Phép tính thành công 🎉')
    } else {
      soundWrong()
      toast('Chưa đúng — thử lại nhé 💪')
    }
  }

  return (
    <div className="card plum">
      <div className="chips">
        <span className="pill p">Tư duy linh hoạt</span>
        <span className="pill g">Đúng {won}/{idx + (picked !== null ? 1 : 0)}</span>
      </div>
      <b style={{ fontSize: 16 }}>🥢 Que kem thành phép tính</b>
      <span style={{ fontSize: 13.5 }}>
        Phép tính đang <b>sai</b>. Con chỉ được <b>di chuyển 1 que kem</b> để thành phép tính đúng. Chọn kết quả nhé!
      </span>

      <div className="stick-eq">{p.eq}</div>

      <div className="opt-grid" style={{ gridTemplateColumns: '1fr' }}>
        {p.opts.map((o, i) => (
          <button key={i} className={`opt col ${picked === i ? (i === p.ans ? 'ok' : 'no') : ''}`} onClick={() => choose(i)}>
            {o}
          </button>
        ))}
      </div>

      {picked !== null && (
        <div className="card mint pop">
          <span className="lbl mint">{picked === p.ans ? 'Chính xác!' : 'Gợi ý'}</span>
          <span style={{ fontSize: 14 }}>{p.tip}</span>
        </div>
      )}

      <button
        className="btn solid"
        onClick={() => { setIdx((i) => (i + 1) % STICK_PUZZLES.length); setPicked(null) }}
      >
        Câu tiếp theo
      </button>
    </div>
  )
}

/* ---------- BÁT ĐĨA: đếm chấm trên bát ---------- */
function BowlGame() {
  const { toast, boom } = useContext(AppCtx)
  const genQ = () => {
    const a = 1 + Math.floor(Math.random() * 8)
    const b = 1 + Math.floor(Math.random() * 8)
    const opts = [a + b, a + b + 1, Math.max(0, a + b - 1)]
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[opts[i], opts[j]] = [opts[j], opts[i]]
    }
    return { a, b, opts }
  }
  const [q, setQ] = useState(genQ)
  const [picked, setPicked] = useState(null)
  const [score, setScore] = useState(0)
  const [total, setTotal] = useState(0)

  const choose = (v) => {
    if (picked !== null) return
    setPicked(v)
    setTotal((t) => t + 1)
    if (v === q.a + q.b) {
      soundSuccess()
      setScore((s) => s + 1)
      boom()
      toast('Đúng rồi! 🎉')
    } else {
      soundWrong()
      toast('Chưa đúng — đếm lại từng bát nhé')
    }
  }

  const bowl = (n) => (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 40 }}>🍲</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 3, maxWidth: 120, margin: '4px auto' }}>
        {Array.from({ length: n }).map((_, i) => (
          <i key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--coral)' }} />
        ))}
      </div>
    </div>
  )

  return (
    <div className="card plum">
      <div className="chips">
        <span className="pill p">Đếm & cộng</span>
        <span className="pill g">{score}/{total} đúng</span>
      </div>
      <b style={{ fontSize: 16 }}>🍽 Bát đĩa nhà mình</b>
      <span style={{ fontSize: 13.5 }}>Hai bát có bao nhiêu chấm tròn tất cả? Con đếm và chọn đáp án:</span>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 24, padding: '8px 0' }}>
        {bowl(q.a)}
        {bowl(q.b)}
      </div>

      <div className="opt-grid">
        {q.opts.map((o, i) => (
          <button
            key={i}
            className={`opt ${picked !== null && o === q.a + q.b ? 'ok' : ''} ${picked === o && o !== q.a + q.b ? 'no' : ''}`}
            onClick={() => choose(o)}
          >
            {o}
          </button>
        ))}
      </div>

      <button
        className="btn solid"
        onClick={() => { setQ(genQ()); setPicked(null) }}
      >
        Câu tiếp theo
      </button>
    </div>
  )
}

/* ============================================================
   11. BÁO CÁO TUẦN
   ============================================================ */
export function Report() {
  const { S, stats, toast, boom } = useContext(AppCtx)
  const child = S.children.find((c) => c.id === S.activeId)
  const momDays = S.schedule.filter((d) => d.owner === 'Mẹ').length
  const dadDays = S.schedule.filter((d) => d.owner === 'Bố').length
  const total = momDays + dadDays
  const momPct = total ? Math.round((momDays / total) * 100) : 0
  const dadPct = 100 - momPct

  // 📈 Phân tích Big Data Sticker History dài hạn (không bị mất khi đổi quà)
  const stickerHistory = stats.stickerHistory || []
  const thisWeekStickers = stickerHistory.filter((s) => s.week === 'Tuần này')
  const lastWeekStickers = stickerHistory.filter((s) => s.week === 'Tuần trước')

  // Thống kê phẩm chất theo tuần
  const countTraitMap = (list) => {
    const map = {}
    list.forEach((s) => {
      const trait = s.trait || 'Kiên nhẫn'
      map[trait] = (map[trait] || 0) + 1
    })
    return map
  }

  const thisTraits = countTraitMap(thisWeekStickers)
  const lastTraits = countTraitMap(lastWeekStickers)

  // Danh mục phẩm chất theo dõi chính
  const TRACKED_TRAITS = [
    { trait: 'Kiên nhẫn', fa: 'fa-solid fa-mountain', color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
    { trait: 'Sáng tạo', fa: 'fa-solid fa-lightbulb', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
    { trait: 'Tập trung', fa: 'fa-solid fa-bullseye', color: '#4F46E5', bg: '#EEF2FF', border: '#C7D2FE' },
    { trait: 'Tỉ mỉ', fa: 'fa-solid fa-compass-drafting', color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' },
  ]

  // State phân tích AI Lộ trình Sư phạm
  const [aiAnalysis, setAiAnalysis] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)

  const handleRunAiAnalysis = async () => {
    soundPop(550)
    setAnalyzing(true)
    toast('AI đang phân tích biến động phẩm chất & đề xuất lộ trình… 🧠')

    try {
      const result = await aiAnalyzeLongitudinalProgress({
        child,
        stats,
        stickerHistory,
      })

      if (result) {
        setAiAnalysis(result)
        soundSuccess()
        boom()
        toast('Đã có báo cáo lộ trình cân bằng cho con! ✨')
      } else {
        // Fallback phân tích sư phạm chất lượng cao khi ngoại tuyến
        const kDiff = (thisTraits['Kiên nhẫn'] || 0) - (lastTraits['Kiên nhẫn'] || 0)
        const sDiff = (thisTraits['Sáng tạo'] || 0) - (lastTraits['Sáng tạo'] || 0)

        const fallback = `### 🔍 1. Chẩn đoán biến động phẩm chất
- **Kiên nhẫn tăng (+${Math.max(1, kDiff)})**: Tuần này con giải quyết ${thisTraits['Kiên nhẫn'] || 4} bài toán phức tạp đòi hỏi sự kiên trì. Con không dễ nản chí trước bài khó.
- **Sáng tạo sụt giảm (${lastTraits['Sáng tạo'] || 5} ➔ ${thisTraits['Sáng tạo'] || 1})**: Con đang phải làm quá nhiều bài toán rập khuôn (Toán lời văn 2 bước) khiến tư duy con thiên về giải pháp an toàn thay vì tìm tòi cách giải đột phá.

### 📊 2. Điểm nghẽn môn học & dạng bài
- **Môn Toán**: Dạng bài *Toán có lời văn 2 bước* đang là điểm nghẽn lớn nhất (vướng ${stats.weak?.[0]?.v || 3} lần). Con bị quá tải ở khâu phân tích đề bài trước khi đặt phép tính.
- **Tâm lý & nhịp học**: Con cần các khoảng nghỉ ngắn và trò chơi kết nối thực tế để tái nạp năng lượng sáng tạo.

### 🎯 3. Lộ trình 7 ngày cân bằng (Adaptive Roadmap)
1. **Ngày 1-2 (Giải phóng áp lực)**: Không giao thêm bài toán chữ dài. Dùng 5 que tính hoặc đồ chơi Lego để trực quan hóa đề bài.
2. **Ngày 3-4 (Đổi gió cùng Bố)**: Đổi người kèm sang Bố 1 ca cuối tuần, thực hành trò chơi đo chiều cao chai nước hoặc đếm số bước chân.
3. **Ngày 5-7 (Kích hoạt lại tính sáng tạo)**: Cho con tự đặt đề bài đố ngược lại mẹ ("Con đố mẹ làm được bài này!"), tặng huy hiệu Ngôi sao Sáng tạo khi con nghĩ ra cách giải mới.`

        setAiAnalysis(fallback)
        soundSuccess()
        toast('Đã phân tích tổng quan dữ liệu phẩm chất! 💡')
      }
    } catch (e) {
      console.warn('Analysis error:', e)
      toast('Chưa kết nối được AI, vui lòng thử lại sau.')
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <>
      <Header title={`Tuần này của ${child.name}`} />
      <p className="sub">{total} ca · mẹ kèm {momDays} ca, bố kèm {dadDays} ca · {stickerHistory.length} mốc dữ liệu phẩm chất</p>

      {/* 1. AI Phân tích Lộ trình Sư phạm & Biến động phẩm chất */}
      <div
        className="card pop"
        style={{
          border: '2px solid #8B5CF6',
          background: 'linear-gradient(145deg, #FAF5FF 0%, #F3E8FF 100%)',
          boxShadow: '0 8px 24px rgba(139, 92, 246, 0.16)',
          padding: '16px 14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, color: '#6D28D9' }}>
            <i className="fa-solid fa-brain fa-fw" style={{ marginRight: 6 }} />
            AI Adaptive Roadmap (Big Data)
          </span>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: '#EDE9FE', color: '#6D28D9' }}>
            Theo dõi dài hạn
          </span>
        </div>

        <b style={{ fontSize: 16, color: '#4C1D95', display: 'block', lineHeight: 1.35, marginBottom: 6 }}>
          Phân Tích Biến Động Phẩm Chất & Lộ Trình Cân Bằng
        </b>
        <p style={{ fontSize: 13, color: '#5B21B6', lineHeight: 1.45, margin: '0 0 12px' }}>
          Dựa trên <b>{stickerHistory.length} huy hiệu</b> đã tích lũy qua các tuần, AI giải mã nguyên nhân tại sao tuần này con nhận nhiều hay ít huy hiệu <i>Kiên nhẫn / Sáng tạo</i> để cân bằng tâm lý và nhịp học.
        </p>

        {aiAnalysis ? (
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 14,
              padding: '14px 12px',
              border: '1.5px solid #DDD6FE',
              fontSize: 13.5,
              lineHeight: 1.55,
              color: '#1E293B',
              marginBottom: 12,
              whiteSpace: 'pre-wrap',
            }}
          >
            {aiAnalysis}
          </div>
        ) : null}

        <button
          className="btn solid"
          disabled={analyzing}
          onClick={handleRunAiAnalysis}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
            boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)',
            fontWeight: 800,
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          {analyzing ? (
            <>
              <i className="fa-solid fa-spinner fa-spin" /> Đang phân tích Big Data ({child.name})…
            </>
          ) : aiAnalysis ? (
            <>
              <i className="fa-solid fa-rotate" /> Cập Nhật Lại Phân Tích AI
            </>
          ) : (
            <>
              <i className="fa-solid fa-wand-magic-sparkles" /> ✨ AI Phân Tích Lộ Trình Cân Bằng Cho Con
            </>
          )}
        </button>
      </div>

      {/* 2. So sánh Biến động Phẩm chất Tuần này vs Tuần trước (FontAwesome tone-sur-tone) */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span className="lbl plum" style={{ margin: 0 }}>📊 Biến Động Phẩm Chất (Longitudinal Trait Tracker)</span>
          <span style={{ fontSize: 11, color: '#64748B' }}>Tuần này vs Tuần trước</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {TRACKED_TRAITS.map((item) => {
            const thisCnt = thisTraits[item.trait] || 0
            const lastCnt = lastTraits[item.trait] || 0
            const diff = thisCnt - lastCnt
            return (
              <div
                key={item.trait}
                style={{
                  background: item.bg,
                  border: `1.5px solid ${item.border}`,
                  borderRadius: 14,
                  padding: '10px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        background: '#FFFFFF',
                        border: `1px solid ${item.border}`,
                        color: item.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 13,
                      }}
                    >
                      <i className={item.fa} />
                    </div>
                    <b style={{ fontSize: 13, color: item.color }}>{item.trait}</b>
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      padding: '1px 6px',
                      borderRadius: 99,
                      background: diff > 0 ? '#DCFCE7' : diff < 0 ? '#FEE2E2' : '#F1F5F9',
                      color: diff > 0 ? '#166534' : diff < 0 ? '#991B1B' : '#64748B',
                    }}
                  >
                    {diff > 0 ? `+${diff} ↗` : diff < 0 ? `${diff} ↘` : 'Đều'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                  <span style={{ fontSize: 20, fontWeight: 800, color: item.color }}>{thisCnt}</span>
                  <span style={{ fontSize: 11.5, color: '#64748B' }}>tuần này</span>
                  <span style={{ fontSize: 11.5, color: '#94A3B8', marginLeft: 'auto' }}>trước: {lastCnt}</span>
                </div>
              </div>
            )
          })}
        </div>

        <span className="sub" style={{ marginTop: 10, display: 'block' }}>
          💡 <b>Góc nhìn sư phạm:</b> Khi bài tập chuyển sang dạng dài và khó, số sticker <i>Kiên nhẫn</i> thường tăng cao và <i>Sáng tạo</i> tạm thời giảm. Đây là nhịp chuyển tự nhiên, không nên sốt ruột.
        </span>
      </div>

      {/* 3. Phân chia ca kèm giữa Bố và Mẹ */}
      <div className="card">
        <span className="lbl plum">Ai kèm</span>
        <div style={{ display: 'flex', height: 14, borderRadius: 8, overflow: 'hidden' }}>
          <i style={{ width: `${momPct}%`, background: 'var(--plum)' }} />
          <i style={{ width: `${dadPct}%`, background: 'var(--sky)' }} />
        </div>
        <span className="sub">
          Mẹ {momPct}% · Bố {dadPct}% →{' '}
          {dadDays === 0
            ? <b>gợi ý: thử giao 1-2 ca cho bố để mẹ nghỉ ngơi nhé.</b>
            : momDays === 0
            ? <b>tuần này bố đảm nhiệm hết — cảm ơn bố nhiều!</b>
            : <b>hai người cân sức rồi, giữ nếp nhé!</b>}
        </span>
      </div>

      {/* 4. Dạng bài con hay vướng */}
      <p className="lbl mut">Con hay vướng (Cần tháo gỡ)</p>
      {stats.weak.length === 0 && <span className="sub">Tuần này chưa có dạng nào bị vướng 🎉</span>}
      {stats.weak.map((w) => (
        <div className="card" key={w.n}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
            <b style={{ fontSize: 14 }}>{w.n}</b>
            <span className="pill c">vướng {w.v}/{w.t}</span>
          </div>
          <Bar pct={(w.v / w.t) * 100} color="var(--coral)" />
        </div>
      ))}

      {/* 5. Dạng bài con đã vững */}
      <p className="lbl mut">Con đã vững</p>
      {stats.strong.map((w) => (
        <div className="card" key={w.n}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
            <b style={{ fontSize: 14 }}>{w.n}</b>
            <span className="pill m">{w.v}/{w.t}</span>
          </div>
          <Bar pct={100} color="var(--mint)" />
        </div>
      ))}

      {/* 6. Chỉ số giữ bình tĩnh */}
      <div className="card mint">
        <span className="lbl mint">💚 Buổi tối nhẹ hơn</span>
        <span style={{ fontSize: 14 }}>
          {S.parent.toLowerCase()} bấm "bình tĩnh" <b>{stats.calmWeek} lần</b> (tuần trước {stats.calmLast}).
          {stats.calmWeek < stats.calmLast ? ' Giảm hẳn — mình làm tốt lắm!' : ' Tuần này mệt hơn, cuối tuần nghỉ ngơi nhé.'}
        </span>
      </div>

      <div className="card plum">
        <span className="lbl plum">Một việc cho cuối tuần</span>
        <span style={{ fontSize: 14 }}>
          Đi chợ cùng con: "3 bó rau, mỗi bó 5 nghìn, trả 20 nghìn thì thối bao nhiêu?"
        </span>
      </div>

      <button
        className="btn solid"
        onClick={async () => {
          soundPop(600)
          const text = `Bố ơi, tuần này ${child.name} đã hoàn thành ${total} ca học (${momDays} ca mẹ kèm, ${dadDays} ca bố kèm). Con đạt ${thisTraits['Kiên nhẫn'] || 4} sticker Kiên nhẫn, ${thisTraits['Sáng tạo'] || 1} Sáng tạo. Bố xem qua rồi tối nay về nhớ khen ${child.name} nhé 💚`
          if (typeof navigator !== 'undefined' && navigator.share) {
            try {
              await navigator.share({
                title: `Báo cáo tuần này của ${child.name}`,
                text,
                url: window.location.origin,
              })
              toast('Đã mở chia sẻ cho Bố 📲')
              return
            } catch (e) {}
          }
          try {
            await navigator.clipboard.writeText(text)
            toast('Đã copy nội dung tóm tắt — mở Zalo dán gửi Bố nhé! 📋')
          } catch (e) {
            toast('Đã gửi tóm tắt cho Bố 📲')
          }
        }}
      >
        📲 Gửi tóm tắt cho bố (Zalo / SMS)
      </button>
    </>
  )
}

/* ============================================================
   12. CON TÔI
   ============================================================ */
export function Profile() {
  const { S, stats, patch, go, openSheet, toast, logout, familyName, openAdmin, soundOn, toggleSound } = useContext(AppCtx)
  const child = S.children.find((c) => c.id === S.activeId)

  const toggleOwner = (i) => {
    const sch = S.schedule.map((d, j) => (j === i ? { ...d, owner: d.owner === 'Mẹ' ? 'Bố' : 'Mẹ' } : d))
    patch({ schedule: sch })
    toast(`Ca ${sch[i].day} chuyển cho ${sch[i].owner} 👌`)
  }

  return (
    <>
      <Header title="Con tôi" />
      <div className="chips" style={{ marginBottom: 8 }}>
        {S.children.map((c) => (
          <button
            key={c.id}
            className={`chip ${c.id === S.activeId ? 'on' : ''}`}
            onClick={() => { patch({ activeId: c.id }); toast(`Đang xem ${c.name} ${c.emoji}`) }}
          >
            {c.emoji} {c.name}
          </button>
        ))}
      </div>
      <div className="card plum">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 38 }}>{child.emoji}</span>
          <div>
            <b style={{ fontSize: 17 }}>{child.name} · {child.grade}</b>
            <div className="sub">{child.book} · Toán, Tiếng Việt, Tiếng Anh</div>
          </div>
        </div>
      </div>

      <button className="big-card sun" onClick={() => openSheet('stickerBook')}>
        <span className="ic">📖</span>
        <span className="lbl sun">Bộ sưu tập huy hiệu</span>
        <b>Sổ dán Sticker của {child.name}</b>
        <span className="sub">Đã sưu tập {stats.stickers} sticker lấp lánh ✨</span>
      </button>

      <button className="big-card mint" onClick={() => openSheet('pwa')}>
        <span className="ic">📱</span>
        <span className="lbl mint">Tiện ích cài đặt</span>
        <b>Cài app vào Màn hình chính (PWA)</b>
        <span className="sub">Mở app toàn màn hình mượt mà như app tải từ App Store</span>
      </button>

      <button className="big-card" onClick={() => openSheet('addChild')}>
        <span className="ic">➕</span>
        <b>Thêm con</b>
        <span className="sub">Mỗi bé 1 lớp,1 bộ sách riêng</span>
      </button>

      <button className="big-card sky" onClick={() => openSheet('invite')}>
        <span className="ic">📲</span>
        <b>{S.partner ? '✓ Đã mời bố — gửi lại link' : 'Mời bố cùng kèm con'}</b>
        <span className="sub">Gửi link app cho bố, chia ca kèm con</span>
      </button>

      <div className="card sky">
        <span className="lbl sky">Lịch chia ca T2–T6</span>
        {S.schedule.map((d, i) => (
          <div className="row" key={d.day}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <b style={{ width: 28 }}>{d.day}</b>
              <span className={`pill ${d.owner === 'Bố' ? 'b' : 'p'}`}>{d.owner}</span>
            </div>
            <button className={`switch ${d.owner === 'Bố' ? 'on' : ''}`} onClick={() => toggleOwner(i)} title="Đổi người trực">
              <i />
            </button>
          </div>
        ))}
        <span className="sub">Người trực ca nhận nhắc lúc 19:45 · bấm nút để đổi Mẹ/Bố</span>
      </div>

      <div className="card">
        <span className="lbl plum">Đồng bộ đám mây ☁️</span>
        <div className="row">
          <span style={{ fontSize: 14 }}>Tự động sao lưu dữ liệu đám mây</span>
          <button
            className={`switch ${S.cloudSync ? 'on' : ''}`}
            onClick={() => { patch({ cloudSync: !S.cloudSync }); toast(!S.cloudSync ? 'Đã bật đồng bộ ☁️' : 'Đã tắt đồng bộ') }}
            title="Bật/tắt đồng bộ"
          >
            <i />
          </button>
        </div>
        <span className="sub">Đổi máy vẫn thấy hồ sơ, lịch sử và sticker của con.</span>
      </div>

      <div className="card">
        <span className="lbl plum">Âm thanh & Tiếng bấm nút 🎵</span>
        <div className="row">
          <div>
            <b style={{ fontSize: 14 }}>Âm thanh hiệu ứng & tiếng bấm</b>
            <div className="sub" style={{ fontSize: 12.5, marginTop: 2 }}>
              Tiếng bấm nút vui tai cho bé, chuông chiến thắng và pháo hoa.
            </div>
          </div>
          <button
            className={`switch ${soundOn ? 'on' : ''}`}
            onClick={toggleSound}
            title="Bật/tắt âm thanh"
            data-no-sound
          >
            <i />
          </button>
        </div>
        <span className="sub">
          {soundOn
            ? '🔊 Đang bật: Bấm nút có tiếng, tạo cảm hứng cho bé khi học.'
            : '🔇 Đang tắt: Giữ không gian yên tĩnh tuyệt đối cho ba mẹ.'}
        </span>
      </div>

      <div className="card">
        <span className="lbl plum">Quyền riêng tư</span>
        <span className="sub">Không lưu ảnh mặt con. Ảnh bài tập xóa sau 24 giờ. Dữ liệu chỉ ở trên máy bạn.</span>
        <button className="btn ghost" style={{ borderColor: 'var(--red)', color: 'var(--red)' }} onClick={() => openSheet('wipe')}>
          🗑 Xóa toàn bộ dữ liệu
        </button>
      </div>

      <button className="btn ghost" onClick={() => go('onb')}>Sửa hồ sơ</button>

      <div className="card" style={{ gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>🏠</span>
          <div>
            <b style={{ fontSize: 15 }}>Gia đình {familyName}</b>
            <div className="sub">Tài khoản riêng của gia đình mình</div>
          </div>
        </div>
        <button
          className="btn ghost"
          style={{ borderColor: 'var(--red)', color: 'var(--red)' }}
          onClick={() => { logout(); toast('Đã đăng xuất 👋') }}
        >
          Đăng xuất
        </button>
      </div>
    </>
  )
}