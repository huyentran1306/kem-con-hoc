import { formatTeacherName, normalizeLesson } from './teacher/format.js'
import { TopBarT3, TopBarT4, Progress4, HoldBtn, BtnKm, CardKm } from './ui/KhuonMoi'
import { computeCoachAdvice, isCoachAdviceEnabled } from "./coachRules.js"
import { Fragment, useContext, useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { AppCtx } from './ctx'
import {
  PARENT_TYPES, GRADES, BOOKS, TONES, EMOJIS, PROBLEM, STICKER_REWARD,
  ENGLISH_PHRASES, TOYS, CHAT_SAMPLES, CHAT_REPLIES, CALM_LINES,
  AVAILABLE_STICKERS, WAITING_QUIZZES, SCHEDULE_DEFAULT,
} from './data'
import { TraitStackedChart, SubjectAndSkillHeatmap, TraitAiAnalysisCard } from './ReportComponents'
import { computeSuggestedBadge, TRAIT_COLORS, TRAIT_ICONS, TRAIT_BADGE_INFO } from './badgeRules'
import { Header, SpeakBtn, WhyChip, VoiceInputBtn, DotDiagram, Bar, HoldReveal, Stepper, Switch, useWide } from './ui'
import { fmtTime, speak, compressImage, uid, boom, getWeekLabel } from './utils'
import { captureVideoFrame, fileToCanvas, prepareHomeworkShot } from './imageOcr'
import { soundTap, soundPop, soundSuccess, soundWrong, soundBreathe, soundWoodBlock, soundFanfare, isSoundEnabled, toggleSound } from './audio'
import { aiExplain, aiChat, aiOcr, startSession, updateSession, recordLearningEvent, recordBadgeEvent, fetchLearnerProfile, fetchAiProgressReport, fetchAiMicroStep, fetchAiJudgeAnswer, fetchAiAdaptiveBrother, aiExtractProblem, aiAnalyzeToy, aiAnalyzeLongitudinalProgress, logScopeEvent, getAuthToken, checkWorkRead, checkWorkGrade, teachBackTranscribe, teachBackGrade, teachBackConfirm , GATEWAY, getSafetySummary } from './api'
import { missingCheckWorkFields } from './checkWorkFields.js'
import { isTrialActive, PRELOADED_TRIAL_LESSONS, getActiveTrialLesson, TRIAL_LESSON_EXTRAS, setActiveTrialLesson } from './trialData.js'
import { renderPrompt } from './promptStudio'
import { THEMES, getTheme } from './themes'
import { evaluateTextScope, formatScopeMessage, getActiveScopeRules, parseGradeNum, parseOcrV2Result } from './scopeRules'
import { ZaloReportModal } from './ZaloReportModal'
import { NpsSurveyCard } from './NpsSurveySheet'
import { getSlot } from './themes/slots/registry'
import { SeasonHomeLayer, SeasonStepProgress, SeasonDoneArt, seasonLevelEmoji, isSeasonalTheme } from './seasons'
import { DefaultScaffoldActions } from './themes/slots/defaultSlots'
import { CalmNudgeCard } from './CalmNudgeCard'
import { emitMotion } from './MotionLayer'
import TeacherReminderBanner from './TeacherReminderBanner.jsx'
import GocChoiChung from './games/GocChoiChung'
import { getDailyLimitMinutes, setDailyLimitMinutes } from './games/gameStorage'

// Module-scoped pending shot buffer (Prompt 23D)
let pendingShot = null
let pendingToy = null

const formatChildGrade = (g) => {
  if (!g) return 'Lớp 3'
  const str = String(g).trim()
  return /^lớp\s*/i.test(str) ? str : `Lớp ${str}`
}

import { getStudyDateKey } from './useStudyTracker'
import { validateAllLessonMath } from './arithmetic.js'
import { ThemeBuddy, BuddyGreeter, buddyReact, useThemeBuddyId, BUDDY_NAMES } from './themes/buddies/buddySvgs'
import FamilyAnnouncements from './FamilyAnnouncements.jsx'


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

      <div className="card">
        <span className="lbl plum">🎨 Giao diện con thích (tuỳ chọn)</span>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ fontSize: 13.5 }}>
            Đang chọn: <b>{getTheme(S.theme || 'candy').name}</b>
          </span>
          <button className="btn ghost" style={{ padding: '6px 12px', fontSize: 13 }} onClick={() => openSheet('themePicker')}>
            Đổi giao diện
          </button>
        </div>
      </div>

      <button className="big-card sky" onClick={() => openSheet('invite')}>
        <span className="lbl sky">Không phải một mình</span>
        <b>{S.partner ? '✓ Đã mời bố cùng kèm con' : '+ Mời bố cùng kèm con'}</b>
        <span className="sub">Gửi link app cho bố, chia ca kèm, người trực ca sẽ thấy lời nhắc khi mở app buổi tối</span>
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
   2. TRANG CHỦ & THẺ BÀI TẬP CÔ GIÁO GIAO (PROMPT 04)
   ============================================================ */
function TeacherAssignmentBanner({ child, S, patch, go }) {
  const [assignment, setAssignment] = useState(null)
  const [items, setItems] = useState([])
  const [showItemsModal, setShowItemsModal] = useState(false)

  const loadAssignments = useCallback(() => {
    const token = getAuthToken()
    if (!token) return
    fetch(`${GATEWAY}/api/v1/family/assignments`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.ok && Array.isArray(data.assignments) && data.assignments.length > 0) {
          const first = data.assignments[0]
          setAssignment(first)
          fetch(`${GATEWAY}/api/v1/family/assignments/${first.assignment_id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
            .then(r => r.json())
            .then(d => {
              if (d.ok && d.items) setItems(d.items)
            })
            .catch(() => {})
        }
      })
      .catch(() => {})
  }, [child?.id])

  useEffect(() => {
    loadAssignments()
    const handleUpdate = () => {
      loadAssignments()
      // Tải lại lần 2 sau 400ms để đảm bảo D1 đã ghi xong
      setTimeout(loadAssignments, 400)
    }
    window.addEventListener('kem_assignment_updated', handleUpdate)
    window.addEventListener('focus', handleUpdate)
    return () => {
      window.removeEventListener('kem_assignment_updated', handleUpdate)
      window.removeEventListener('focus', handleUpdate)
    }
  }, [loadAssignments])

  if (!assignment) return null

  const startProblem = (item) => {
    let preLesson = null
    try {
      preLesson = JSON.parse(item.ai_lesson_json)
    } catch {}

    const rawSteps = preLesson?.steps || [
      {
        stepNumber: 1,
        guidanceForParent: item.teacher_method_note || "Hỏi con đọc kỹ đề bài.",
        questionForChild: "Con hãy đọc to đề bài nhé!",
        hintLevel1: "Nhìn vào các con số trong đề.",
        hintLevel2: "Thử giải từng bước một con nhé."
      }
    ]
    const problemObj = normalizeLesson({
      ocr: item.problem_text,
      grade: child?.grade || 'Lớp 3',
      subject: assignment.subject,
      category: 'teacher_assignment',
      isTeacherAssigned: true,
      teacherName: assignment.teacher_name,
      teacherMethodNote: item.teacher_method_note,
      teacherAnswer: item.teacher_answer,
      steps: rawSteps
    })

    const sessId = 'ses_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
    patch({
      problem: problemObj,
      studySource: 'teacher',
      assignmentId: assignment.assignment_id,
      assignmentItemId: item.id,
      currentSessionId: sessId,
      flow: { step: 0, stuck: 0, peeks: 0, sessionId: sessId }
    })

    startSession({
      id: sessId,
      childId: child?.id,
      startedAt: new Date().toISOString(),
      source: 'teacher',
      assignmentId: assignment.assignment_id,
      assignmentItemId: item.id,
      subject: assignment.subject,
      grade: child?.grade || 'Lớp 3',
      problemText: item.problem_text,
      stepsTotal: (problemObj.steps || []).length
    }).catch(() => {})

    setShowItemsModal(false)
    go('explain')
  }

  const dueDayName = assignment.due_at ? new Date(assignment.due_at).toLocaleDateString('vi-VN', { weekday: 'long' }) : 'sớm'

  return (
    <>
      <div
        className="card mint pop"
        style={{
          border: '2px solid #10B981',
          background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
          padding: '13px 15px',
          marginBottom: 12,
          boxShadow: '0 4px 14px rgba(16, 185, 129, 0.18)',
          cursor: 'pointer',
        }}
        onClick={() => setShowItemsModal(true)}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: '#047857', backgroundColor: '#A7F3D0', padding: '2px 8px', borderRadius: 6 }}>
            🏫 Lớp học của con
          </span>
          <span style={{ fontSize: 11.5, color: '#065F46', fontWeight: 600 }}>
            Hạn {dueDayName}
          </span>
        </div>
        <b style={{ color: '#064E3B', fontSize: 15.5, display: 'block', margin: '3px 0' }}>
          📚 {formatTeacherName(assignment.teacher_name)} giao {assignment.item_count} bài ({assignment.title})
        </b>
        <p style={{ color: '#047857', fontSize: 12.5, margin: '2px 0 10px 0', lineHeight: 1.4 }}>
          Đã kèm con xong: {assignment.completed_count || 0}/{assignment.item_count} câu · Bấm để kèm đúng cách cô dạy
        </p>
        <button
          className="btn solid"
          style={{ width: '100%', background: '#059669', borderColor: '#047857', fontWeight: 700, fontSize: 13.5 }}
          onClick={(e) => { e.stopPropagation(); setShowItemsModal(true) }}
        >
          ✍️ Kèm con làm bài cô giao ➔
        </button>
      </div>

      {showItemsModal && (
        <div className="sheet" onClick={(e) => e.target === e.currentTarget && setShowItemsModal(false)}>
          <div className="pn" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
            <div className="grabber" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <p className="title" style={{ fontSize: 18, margin: 0 }}>📚 {assignment.title}</p>
                <p className="sub" style={{ margin: '2px 0 0 0' }}>{formatTeacherName(assignment.teacher_name)} · Môn {assignment.subject}</p>
              </div>
              <button className="round-btn" onClick={() => setShowItemsModal(false)}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
              {items.map((it, idx) => (
                <div
                  key={it.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 12,
                    padding: 14,
                    border: '1.5px solid #E2E8F0',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <b style={{ fontSize: 14, color: '#2563EB' }}>Câu {it.position || (idx + 1)}</b>
                    {it.teacher_method_note && (
                      <span style={{ fontSize: 11, backgroundColor: '#F0FDF4', color: '#047857', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>
                        Theo cách cô dạy
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 13.5, color: '#1E293B', margin: '4px 0 10px 0', lineHeight: 1.45 }}>
                    {it.problem_text}
                  </p>
                  <button
                    className="btn solid"
                    style={{ width: '100%', background: '#2563EB', borderColor: '#1D4ED8', fontSize: 13, padding: '8px 12px' }}
                    onClick={() => startProblem(it)}
                  >
                    🚀 Kèm con làm câu này
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export function Home() {
  const { S, patch, stats, go, openSheet, toast, soundOn, toggleSound, tracker } = useContext(AppCtx)
  const wide = useWide()
  const child = S.children.find((c) => c.id === S.activeId) || S.children[0]
  const theme = S.theme || 'bear'
  const StudyTrackerSlot = getSlot(theme, 'StudyTracker')
  const StartActionSlot = getSlot(theme, 'StartAction')
  const CheckWorkEntrySlot = getSlot(theme, 'CheckWorkEntry')
  const now = new Date()
  const hour = now.getHours()
  const minute = now.getMinutes()
  const greet = hour < 11 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối'
  const parentLower = S.parent.toLowerCase()

  const dayCodeMap = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
  const todayCode = dayCodeMap[now.getDay()]
  const shortDate = `${todayCode} ${now.getDate()}/${now.getMonth() + 1} · ${formatChildGrade(child.grade)}`

  const hero = (
    <div className="home-hero-km" style={{ marginBottom: 12 }}>
      <TopBarT3
        dateText={shortDate}
        soundOn={soundOn}
        onToggleSound={toggleSound}
        onOpenCalm={() => openSheet('calm')}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 8, padding: '0 4px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--c-sub, var(--c-text-2))' }}>{greet}, {parentLower}!</p>
          <h2 style={{ margin: '2px 0 0', fontSize: 18, fontWeight: 800, color: 'var(--c-text)', fontFamily: 'var(--font-head)' }}>
            {(hour < 17 ? 'Hôm nay' : 'Tối nay')} {child.name} học gì?
          </h2>
        </div>
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <BuddyGreeter size={60} />
          <button
            type="button"
            onClick={() => openSheet('stickerBook')}
            className="sticker-badge-mascot"
            style={{
              position: 'absolute',
              bottom: -4,
              right: -4,
              background: 'var(--c-accent, #F6A623)',
              color: 'var(--c-on-accent, #fff)',
              fontSize: 11,
              fontWeight: 900,
              padding: '2px 6px',
              borderRadius: 999,
              border: '2px solid var(--c-surface, #fff)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
            title="Mở sổ dán sticker"
          >
            <span>⭐</span>
            <span>{stats.stickers || 0}</span>
          </button>
        </div>
      </div>

      {S.children.length > 1 && (
        <div className="seg-km" style={{ marginTop: 10, width: '100%', height: 36, background: 'var(--c-surface, rgba(0,0,0,0.1))' }}>
          {S.children.map((c) => {
            const active = c.id === S.activeId
            return (
              <button
                key={c.id}
                type="button"
                className={`seg-km-btn ${active ? 'active' : ''}`}
                aria-pressed={active ? "true" : "false"}
                style={{
                  height: 32,
                  flex: 1,
                  background: active ? 'var(--c-surface-2, #FFFFFF)' : 'transparent',
                  color: active ? 'var(--c-text)' : 'var(--c-text-2)',
                  fontWeight: active ? 800 : 600,
                  boxShadow: active ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
                  borderRadius: 9,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
                onClick={() => {
                  patch({ activeId: c.id })
                  toast(`Đổi sang ${/^bé\s/i.test(c.name) ? c.name : "bé " + c.name} ${c.emoji}`)
                }}
              >
                <span>{c.emoji}</span>
                <span>{c.name}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )

  const blocks = []
  const add = (key, side, node) => { if (node) blocks.push({ key, side, node }) }

  add('season', false, <SeasonHomeLayer />)

  // 1. Nút chính Bắt đầu bài tối nay (Lớn 56px) + Gõ đề, Đọc đề (Phụ 44px)
  add(
    'start',
    false,
    StartActionSlot ? (
      <div>
        <StartActionSlot
          onStart={(mode) => {
            if (mode === 'photo' || mode === 'snap') {
              go('snap')
            } else if (mode === 'type') {
              openSheet('typeProblem')
            } else if (mode === 'voice') {
              openSheet('typeProblem', { mode: 'voice', autoMic: true })
            } else {
              go('snap')
            }
          }}
        />
      </div>
    ) : null
  )

  // Làm tiếp bài hôm qua
  add(
    'resume',
    false,
    S.pendingProblemResume && (
      <div
        className="card-km card-km-action"
        style={{
          padding: '14px 16px',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <b style={{ color: 'var(--c-text)', fontSize: 14.5, display: 'block' }}>📖 Làm tiếp bài hôm qua</b>
          <span style={{ color: 'var(--c-sub, var(--c-text-2))', fontSize: 12.5 }}>
            Đang ở bậc {(S.pendingProblemResume.step || 0) + 1} · {S.pendingProblemResume.problem?.dang_bai || S.pendingProblemResume.problem?.type || 'Bài tập'}
          </span>
        </div>
        <button
          className="btn-km btn-km-s btn-km-primary"
          style={{ minHeight: 34, padding: '0 12px' }}
          onClick={() => {
            patch({
              problem: S.pendingProblemResume.problem,
              flow: {
                ...S.flow,
                step: S.pendingProblemResume.step || 0,
                unlocked: S.pendingProblemResume.unlocked || false,
                stuck: 0,
              },
              pendingProblemResume: null,
            })
            go('scaffold')
          }}
        >
          Làm tiếp
        </button>
      </div>
    )
  )

  // Cô nhắc
  add(
    'teacher',
    true,
    <>
      <TeacherReminderBanner child={child} S={S} patch={patch} go={go} openSheet={openSheet} toast={toast} />
      <FamilyAnnouncements childId={child?.id} toast={toast} />
      <TeacherAssignmentBanner child={child} S={S} patch={patch} go={go} />
    </>
  )

  // Thẻ Chấm vở con đã làm (Thẻ hành động T2)
  add(
    'check',
    false,
    CheckWorkEntrySlot && (
      <div>
        <CheckWorkEntrySlot childName={child.name} onStart={() => go('check')} />
      </div>
    )
  )

  // Thẻ "Tối nay" gộp ca trực và 7 dấu chân/ngày thẳng hàng, hiển thị 1 con số duy nhất 3/7 tối
  add(
    'tracker',
    true,
    StudyTrackerSlot && (
      <div>
        <StudyTrackerSlot tracker={tracker} onOpenReport={() => go('report')} />
      </div>
    )
  )

  // Ôn đồ chơi & Hẹn giờ
  add(
    'extras',
    false,
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      <button
        type="button"
        className="card-km"
        style={{ margin: 0, padding: '12px', textAlign: 'left', cursor: 'pointer', background: 'var(--c-surface)' }}
        onClick={() => go('toy')}
      >
        <span style={{ fontSize: 20, display: 'block', marginBottom: 2 }} aria-hidden="true">🧸</span>
        <b style={{ fontSize: 13.5, display: 'block', color: 'var(--c-text)' }}>Chụp đồ chơi</b>
        <span style={{ fontSize: 11.5, color: 'var(--c-sub)' }}>Ôn vui 10 phút</span>
      </button>

      <button
        type="button"
        className="card-km"
        style={{ margin: 0, padding: '12px', textAlign: 'left', cursor: 'pointer', background: 'var(--c-surface)' }}
        onClick={() => openSheet('timer')}
      >
        <span style={{ fontSize: 20, display: 'block', marginBottom: 2 }} aria-hidden="true">⏱</span>
        <b style={{ fontSize: 13.5, display: 'block', color: 'var(--c-text)' }}>Hẹn giờ học</b>
        <span style={{ fontSize: 11.5, color: 'var(--c-sub)' }}>15 phút vừa đủ</span>
      </button>
    </div>
  )

  // Gợi ý cho mẹ
  add(
    'tip',
    false,
    <div className="card-km card-km-note" style={{ padding: '12px 14px' }}>
      <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--c-primary)', letterSpacing: '.04em', marginBottom: 2 }}>
        💡 GỢI Ý CHO {parentLower.toUpperCase()}
      </div>
      <span style={{ fontSize: 13, color: 'var(--c-text)', lineHeight: 1.4 }}>
        Hôm nay để con tự làm trước 10 phút, {parentLower} chỉ vào khi con gọi. Ít nói hơn, con nhớ lâu hơn.
      </span>
    </div>
  )

  const renderBlocks = (list) => list.map((b) => <Fragment key={b.key}>{b.node}</Fragment>)

  return (
    <div className="home-container-km" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {hero}
      {wide ? (
        <div className="pg-cols">
          <div className="pg-col" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {renderBlocks(blocks.filter((b) => !b.side))}
          </div>
          <div className="pg-col" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {renderBlocks(blocks.filter((b) => b.side))}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {renderBlocks(blocks)}
        </div>
      )}
    </div>
  )
}

/* ============================================================
   3. CHỤP BÀI TẬP
   ============================================================ */
export function SnapHomework() {
  const { patch, go, openSheet, toast } = useContext(AppCtx)
  const fileRef = useRef(null)
  const nativeCamRef = useRef(null)
  const videoRef = useRef(null)
  const frameRef = useRef(null)
  const [camOn, setCamOn] = useState(false)
  const [camErr, setCamErr] = useState(false)
  const [busy, setBusy] = useState(false)
  const [qualityWarn, setQualityWarn] = useState(null) // ảnh tối/mờ → hỏi chụp lại hay vẫn gửi
  const [flashKey, setFlashKey] = useState(0)
  const [peekState, setPeekState] = useState('idle')

  useEffect(() => {
    let cancelled = false
    let stream = null
    ;(async () => {
      try {
        // Xin độ phân giải cao: mặc định nhiều máy chỉ trả 640×480 → chữ viết tay nhỏ không đọc nổi
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 2560 },
            height: { ideal: 1440 },
          },
        })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        // Bật lấy nét liên tục nếu máy hỗ trợ (Android Chrome)
        try {
          const track = stream.getVideoTracks()[0]
          const caps = (track && track.getCapabilities && track.getCapabilities()) || {}
          if (Array.isArray(caps.focusMode) && caps.focusMode.includes('continuous')) {
            await track.applyConstraints({ advanced: [{ focusMode: 'continuous' }] })
          }
        } catch (e) {}
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

  const sendShot = (shot) => {
    pendingShot = { dataUrl: shot.dataUrl, blob: shot.blob }
    patch({ studySource: 'parent', assignmentId: null, assignmentItemId: null })
    toast('Đã nhận ảnh, AI đang đọc…')
    go('analyze')
  }

  const handleShot = (shot) => {
    if (shot.quality && (shot.quality.isDark || shot.quality.isBlurry)) {
      setQualityWarn(shot)
      setPeekState('oops')
      return
    }
    setPeekState('cheer')
    sendShot(shot)
  }

  const capture = async () => {
    const video = videoRef.current
    if (!video || !video.videoWidth) {
      toast('Camera chưa sẵn sàng, bấm "Chọn ảnh" nhé 📷')
      return
    }
    if (busy) return
    setBusy(true)
    setQualityWarn(null)
    setFlashKey((k) => k + 1)
    setPeekState('surprised')
    try {
      // Chỉ lấy vùng trong khung nét đứt (bỏ bàn, mép vở, bài bên cạnh)
      const canvas = captureVideoFrame(video, frameRef.current)
      const shot = await prepareHomeworkShot(canvas)
      handleShot(shot)
    } catch (e) {
      toast('Chụp chưa được, thử lại nhé 📷')
    } finally {
      setBusy(false)
    }
  }

  const onPickFile = async (e) => {
    const f = e.target.files && e.target.files[0]
    e.target.value = ''
    if (!f) return
    setBusy(true)
    setQualityWarn(null)
    toast('Đang xử lý ảnh cho AI đọc… ⚡')
    try {
      const canvas = await fileToCanvas(f)
      const shot = await prepareHomeworkShot(canvas)
      handleShot(shot)
    } catch (err) {
      // Trình duyệt cũ không xử lý được canvas → gửi nguyên file
      const reader = new FileReader()
      reader.onload = () => sendShot({ dataUrl: reader.result, blob: f })
      reader.readAsDataURL(f)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Header title="Chụp bài tập" back="home" />
      <div className="cam">
        <div className="frame" ref={frameRef} />
        {camOn && (
          <div className="kb-peek">
            <ThemeBuddy state={peekState} size={50} />
          </div>
        )}
        <div key={flashKey} className={`kb-flash ${flashKey ? 'go' : ''}`} />
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
        <div className="hint">{busy ? 'Đang xử lý ảnh…' : 'Căn đúng 1 bài vào khung · giữ máy song song trang vở'}</div>
      </div>

      {qualityWarn && (
        <div className="card sun pop" style={{ border: '2px solid #F59E0B', background: '#FFFBEB', margin: '10px 0' }}>
          <b style={{ color: '#92400E', fontSize: 15 }}>
            📷 {qualityWarn.quality.isDark ? 'Ảnh hơi tối' : 'Ảnh hơi mờ'}
          </b>
          <p style={{ fontSize: 13.5, color: '#78350F', lineHeight: 1.5, margin: '6px 0 10px' }}>
            {qualityWarn.quality.isDark
              ? 'Bật thêm đèn hoặc ra chỗ sáng hơn, tránh để bóng tay che trang vở.'
              : 'Giữ máy thật yên, song song với trang vở, cách khoảng 20–30cm.'}{' '}
            Chữ viết tay cần ảnh rõ thì AI mới đọc đúng.
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn ghost"
              style={{ flex: 1, padding: '9px 10px', fontSize: 13, background: '#fff' }}
              onClick={() => { setQualityWarn(null); setPeekState('idle') }}
            >
              📷 Chụp lại
            </button>
            <button
              className="btn solid"
              style={{ flex: 1.2, padding: '9px 10px', fontSize: 13 }}
              onClick={() => {
                const s = qualityWarn
                setQualityWarn(null)
                sendShot(s)
              }}
            >
              Vẫn gửi ➔
            </button>
          </div>
        </div>
      )}

      <button className="shutter" aria-label="Chụp" onClick={capture} disabled={!camOn || busy} />
      <div className="btns" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: 8 }}>
        <button className="btn ghost" style={{ padding: '10px 8px', fontSize: 13 }} onClick={() => fileRef.current.click()}>🖼 Chọn ảnh</button>
        <button className="btn ghost" style={{ padding: '10px 8px', fontSize: 13 }} onClick={() => openSheet('typeProblem')}>⌨️ Gõ đề</button>
        <button className="btn ghost" style={{ padding: '10px 8px', fontSize: 13, borderColor: 'var(--plum)', color: 'var(--plum-deep)', background: 'var(--plum-tint)' }} onClick={() => openSheet('typeProblem')}>🎙️ Đọc đề</button>
      </div>
      <button
        className="btn ghost"
        style={{ width: '100%', marginTop: 8, padding: '9px 10px', fontSize: 12.5 }}
        onClick={() => nativeCamRef.current && nativeCamRef.current.click()}
      >
        📸 Chữ viết tay nhỏ? Chụp bằng camera của máy (nét hơn)
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={onPickFile}
      />
      <input
        ref={nativeCamRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={onPickFile}
      />
      <p className="notice">🔒 Ảnh chỉ dùng để đọc đề, app không lưu ảnh</p>
    </>
  )
}

/* ============================================================
   4. AI PHÂN TÍCH
   ============================================================ */
const CHECKLIST = ['Xử lý ảnh & đọc chữ', 'Kiểm tra đề bài', 'Đối chiếu SGK & phương pháp', 'Soạn 4 câu hỏi gợi mở']

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

/* Linh vật trong khung ảnh lúc AI đọc đề / soạn bài / gặp trục trặc */
const READ_LINES = ['Đang soi từng chữ…', 'Đang đọc nét viết tay của con…', 'Đang tách đề và bài làm…']
const THINK_LINES = ['Đang nghĩ câu hỏi gợi mở…', 'Đang đối chiếu SGK…', 'Sắp xong rồi…']
function AnalyzeBuddy({ aiState, done }) {
  const [i, setI] = useState(0)
  const loading = aiState === 'loading' || aiState === 'cleaning'
  useEffect(() => {
    if (!loading) return undefined
    const t = setInterval(() => setI((n) => n + 1), 2400)
    return () => clearInterval(t)
  }, [loading])
  const state =
    aiState === 'ocr_failed' || aiState === 'scope_blocked' || aiState === 'scope_warn' || aiState === 'ai_error'
      ? 'oops'
      : aiState === 'ai_slow'
        ? 'thinking'
      : aiState === 'network_slow' || aiState === 'error'
        ? 'sleepy'
        : aiState === 'done'
          ? 'cheer'
          : aiState === 'review' || aiState === 'scope_pick_one'
            ? 'idle'
            : done >= 3
              ? 'thinking'
              : 'reading'
  const lines = state === 'thinking' ? THINK_LINES : aiState === 'cleaning' ? ['Đang kiểm tra lại đề…'] : READ_LINES
  return (
    <div className="kb-cam-buddy">
      {loading && (
        <div className="kb-say" key={`${state}-${i % lines.length}`}>
          {lines[i % lines.length]}
        </div>
      )}
      <ThemeBuddy state={state} size={58} />
    </div>
  )
}

export function Analyze() {
  const { S, patch, go, openSheet, toast } = useContext(AppCtx)
  const [done, setDone] = useState(0)
  const [aiState, setAiState] = useState('loading') // loading | cleaning | done | error | ocr_failed | review | scope_blocked | scope_warn | scope_pick_one
  const [shotImg, setShotImg] = useState(null)
  const [ocrText, setOcrText] = useState(null)
  const [editedText, setEditedText] = useState('')
  const [showSkip, setShowSkip] = useState(false)
  const [quizIdx, setQuizIdx] = useState(0)
  const [scopeResult, setScopeResult] = useState(null)
  const [redirectNote, setRedirectNote] = useState('')
  const [reAskReason, setReAskReason] = useState(null)
  const [childWork, setChildWork] = useState('') // phần con đã viết tay, AI tách khỏi đề
  const [uncertain, setUncertain] = useState([]) // chữ/số AI đọc chưa chắc
  const [zoomOpen, setZoomOpen] = useState(false)
  const [explainStartedAt, setExplainStartedAt] = useState(0)
  const [explainSecs, setExplainSecs] = useState(0)
  useEffect(() => {
    if (aiState !== 'loading' || !explainStartedAt) return undefined
    const t = setInterval(() => setExplainSecs(Math.round((Date.now() - explainStartedAt) / 1000)), 1000)
    return () => clearInterval(t)
  }, [aiState, explainStartedAt])
  const hasCamBuddy = Boolean(BUDDY_NAMES[useThemeBuddyId()])
  const [zoom, setZoom] = useState(1)
  const reqRef = useRef(null)
  const child = S.children.find((c) => c.id === S.activeId)

  const useSampleProblem = () => {
    patch({
      problem: {
        ...PROBLEM,
        isSample: true,
        isTeacherAssigned: false,
        teacherName: null,
        teacherMethodNote: null,
        teacherAnswer: null,
        assignmentId: null
      },
      studySource: 'sample',
      assignmentId: null,
      assignmentItemId: null
    })
    toast('Đang mở bài mẫu minh họa 📖')
    go('explain')
  }

  const startExplain = async (textToUse, customParentNote = '') => {
    setAiState('loading')
    setDone(3)
    setExplainStartedAt(Date.now())
    try {
      const combinedNote = [customParentNote, redirectNote].filter(Boolean).join('. ')
      const explainRes = await aiExplain(textToUse, child, S.tone, combinedNote)
      setDone(4)

      // Nếu AI phản hồi can_hoi_lai (đề không rõ hoặc thiếu dữ kiện)
      if (explainRes && explainRes.needReAsk && String(explainRes.needReAsk).trim()) {
        setReAskReason(String(explainRes.needReAsk).trim())
        setAiState('review')
        toast('⚠️ Đề có chỗ chưa rõ, vui lòng kiểm tra lại ✏️')
        return
      }

      if (explainRes && explainRes.steps && explainRes.steps.length > 0) {
        const cleanLesson = normalizeLesson(explainRes, {
          isSample: false,
          isTeacherAssigned: false,
          teacherName: null,
          teacherMethodNote: null,
          teacherAnswer: null,
          assignmentId: null
        })
        patch({
          problem: cleanLesson,
          studySource: 'parent',
          assignmentId: null,
          assignmentItemId: null
        })
        setAiState('done')
        toast('✅ AI đã soạn bài giảng xong!')
        setTimeout(() => go('explain'), 600)
      } else if (explainRes && explainRes.error === 'trial_limit') {
        setAiState('trial_limit')
      } else if (explainRes && explainRes.error === 'format_error') {
        setAiState('format_error')
      } else if (explainRes && explainRes.error === 'timeout') {
        setAiState('ai_slow')
      } else if (explainRes && explainRes.error === 'server') {
        setAiState('ai_error')
      } else {
        setAiState('network_slow')
      }
    } catch (e) {
      if (e?.formatError || e?.message?.includes('format_error')) {
        setAiState('format_error')
      } else {
        setAiState('network_slow')
      }
    }
  }

  // Xử lý khi mẹ chọn 1 bài trong ảnh nhiều bài (pick_one)
  const handleSelectExercise = (chosenText) => {
    soundTap()
    // Chạy lại luật phạm vi cho bài được chọn (có thể phát hiện lệch lớp)
    const subScope = evaluateTextScope(chosenText, {
      childGrade: child?.grade,
      childName: child?.name,
      parentRole: S.parent,
    })
    if (subScope.action === 'warn') {
      setScopeResult(subScope)
      setOcrText(chosenText)
      setEditedText(chosenText)
      setAiState('scope_warn')
      return
    }
    setOcrText(chosenText)
    setEditedText(chosenText)
    patch({ flow: { ...S.flow, ocr: chosenText } })
    setDone(2)
    setAiState('review')
  }

  // Xử lý khi mẹ bấm "Vẫn tiếp tục" ở thẻ cảnh báo phạm vi
  const handleContinueWarn = () => {
    soundTap()
    if (scopeResult) {
      logScopeEvent({
        familyId: S.user?.family_id || 'default_family',
        source: shotImg ? 'camera' : 'text',
        category: scopeResult.category,
        action: scopeResult.action,
        confidence: scopeResult.confidence,
        reason: scopeResult.reason,
        gradeGuess: scopeResult.lop_doan,
        childGrade: parseGradeNum(child?.grade),
        overridden: 1,
      })
    }
    setDone(2)
    setAiState('review')
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
          const ocrRes = await aiOcr(shot.blob, 25000, {
            childGrade: child?.grade,
            childName: child?.name,
            parentRole: S.parent,
          })
          if (cancelled) return null

          let raw = ''
          let scope = null

          if (ocrRes) {
            if (typeof ocrRes === 'object' && ocrRes.text !== undefined) {
              raw = ocrRes.text
              scope = ocrRes.scopeResult
            } else if (typeof ocrRes === 'string') {
              raw = ocrRes.trim()
              scope = parseOcrV2Result(raw, {
                childGrade: child?.grade,
                childName: child?.name,
                parentRole: S.parent,
              })
            }
          }

          if (!raw && !scope) {
            return { error: 'ocr_failed' }
          }

          // Đề đọc từ JSON (p1_ocr_v3/v2) = model đã nhìn ảnh và chép nguyên văn
          const structured = !!(scope && scope.fromJson)
          setChildWork((scope && scope.bai_lam_cua_con) || '')
          setUncertain((scope && scope.cho_khong_chac) || [])

          // 1. KIỂM TRA PHẠM VI ẢNH
          if (scope) {
            // Ảnh nhạy cảm: lập tức xoá ảnh khỏi bộ nhớ và state trình duyệt
            if (scope.category === 'nhay_cam') {
              setShotImg(null)
              try {
                if (shot?.dataUrl && shot.dataUrl.startsWith('blob:')) {
                  URL.revokeObjectURL(shot.dataUrl)
                }
              } catch (e) {}
              logScopeEvent({
                familyId: S.user?.family_id || 'default_family',
                source: 'camera',
                category: 'nhay_cam',
                action: 'block',
                confidence: scope.confidence || 0.95,
                reason: scope.reason || 'Ảnh nhạy cảm / giấy tờ riêng tư',
                childGrade: parseGradeNum(child?.grade),
              })
              setScopeResult(scope)
              setAiState('scope_blocked')
              return { blocked: true, scope }
            }

            // Chặn hoặc yêu cầu chụp lại (ảnh mờ, không phải bài tập)
            if (scope.action === 'block' || scope.action === 'retake') {
              logScopeEvent({
                familyId: S.user?.family_id || 'default_family',
                source: 'camera',
                category: scope.category,
                action: scope.action,
                confidence: scope.confidence || 0.9,
                reason: scope.reason,
                gradeGuess: scope.lop_doan,
                childGrade: parseGradeNum(child?.grade),
              })
              setScopeResult(scope)
              setAiState('scope_blocked')
              return { blocked: true, scope }
            }

            // Có nhiều bài tập trong ảnh: yêu cầu mẹ chọn 1 bài
            if (scope.category === 'nhieu_bai' || scope.action === 'pick_one') {
              setScopeResult(scope)
              setAiState('scope_pick_one')
              return { pick_one: true, scope }
            }

            // Cảnh báo (lệch lớp, ngoài chương trình, môn chưa hỗ trợ)
            if (scope.action === 'warn') {
              setScopeResult(scope)
              setOcrText(raw)
              setEditedText(raw)
              setAiState('scope_warn')
              return { warn: true, scope, raw }
            }

            // Làm hộ / viết hộ bài văn
            if (scope.category === 'lam_ho' || scope.action === 'redirect') {
              setRedirectNote(scope.redirectNote || 'Phụ huynh muốn làm hộ: chỉ gợi ý dàn ý và câu hỏi, không viết sẵn bài')
            }
          }

          if (raw && raw.trim()) {
            setOcrText(raw.trim())
            setEditedText(raw.trim())
            // Bước 2: làm sạch đề qua aiExtractProblem
            if (structured) {
              // KHÔNG cho LLM chữ (không nhìn ảnh) "sửa" lại đề: dễ đổi số, tự điền chỗ trống
              ocr = raw.trim()
            } else {
              // Chỉ làm sạch khi rơi xuống OCR thô (/vision/ocr)
              setAiState('cleaning')
              const cleaned = await aiExtractProblem(raw.trim())
              if (cancelled) return null
              ocr = cleaned && cleaned.trim() ? cleaned.trim() : raw.trim()
            }
            setOcrText(ocr)
            setEditedText(ocr)
            patch({ flow: { ...S.flow, ocr } })
            setDone(2)
            setAiState('review')
            return { review: true, ocr }
          } else {
            return { error: 'ocr_failed' }
          }
        } else {
          // Luồng gõ đề hoặc bài có sẵn
          const textScope = evaluateTextScope(ocr, {
            childGrade: child?.grade,
            childName: child?.name,
            parentRole: S.parent,
          })
          if (textScope.action === 'block') {
            setScopeResult(textScope)
            setAiState('scope_blocked')
            return { blocked: true, scope: textScope }
          }
          if (textScope.action === 'warn') {
            setScopeResult(textScope)
            setOcrText(ocr)
            setEditedText(ocr)
            setAiState('scope_warn')
            return { warn: true, scope: textScope }
          }
          if (textScope.category === 'lam_ho') {
            setRedirectNote(textScope.redirectNote || 'Phụ huynh muốn làm hộ: chỉ gợi ý dàn ý và câu hỏi, không viết sẵn bài')
          }
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
        setAiState('review')
      }
    })

    return () => {
      cancelled = true
      clearTimeout(skipTimer)
    }
  }, [])

  const subjectDetected = detectSubject(editedText || ocrText || S.flow.ocr || '')
  const subjectLabel = subjectDetected === 'tieng_viet' ? 'Tiếng Việt' : 'Toán'

  return (
    <div className="analyze-container-km" style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 80px)', position: 'relative', paddingBottom: 80 }}>
      {/* 1. TRẠNG THÁI ĐANG ĐỌC (T7 Chờ AI - A8: giữ màn chờ cho tới khi explain sẵn sàng) */}
      {(aiState === 'loading' || aiState === 'cleaning' || aiState === 'done') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card-km card-km-ai" style={{ textAlign: 'center', padding: '24px 16px' }}>
            <div style={{ marginBottom: 12, display: 'inline-block' }} className="mascot-bounce-km">
              <BuddyGreeter size={76} />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 6px', color: 'var(--c-text)', fontFamily: 'var(--font-head)' }}>
              Gấu đang đọc đề bài…
            </h2>
            <p style={{ fontSize: 13, color: 'var(--c-sub, var(--c-text-2))', margin: 0 }}>
              Đang làm sạch và phân tích cấu trúc bài tập của {child?.name || 'con'}
            </p>

            <div className="loader" style={{ marginTop: 16 }}>
              {CHECKLIST.map((c, i) => (
                <div key={c} className={`li ${i < done ? 'ok' : ''}`}>
                  <span className="dot">{i < done ? '✓' : i + 1}</span>
                  {c}
                </div>
              ))}
            </div>

            {explainSecs >= 3 && (
              <div style={{ fontSize: 12, color: 'var(--c-sub)', marginTop: 8 }}>
                ⏳ Đã phân tích {explainSecs} giây
              </div>
            )}
          </div>

          {/* Câu hỏi 0: hỏi con ngay */}
          <div className="card-km card-km-note" style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--c-primary)', letterSpacing: '.05em', marginBottom: 4 }}>
              ❓ CÂU HỎI 0 · HỎI CON NGAY
            </div>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--c-text)', lineHeight: 1.45, marginBottom: 4 }}>
              {QUESTION_ZERO[subjectDetected].replace('{parent}', S.parent.toLowerCase())}
            </div>
            <span style={{ fontSize: 12, color: 'var(--c-sub)' }}>
              Hỏi con trong lúc AI đang đọc đề để con rèn thói quen quan sát đề bài trước.
            </span>
          </div>

          {/* Đố vui 5 giây */}
          <div className="card-km" style={{ padding: '12px 14px', background: 'var(--c-surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--c-primary)' }}>🎲 Đố vui 5 giây</span>
              <button
                type="button"
                className="btn-km-ghost"
                style={{ fontSize: 12, fontWeight: 800, color: 'var(--c-primary)', background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => { soundPop(500); setQuizIdx((i) => (i + 1) % WAITING_QUIZZES.length) }}
              >
                Đổi câu 🎲
              </button>
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--c-text)' }}>
              {WAITING_QUIZZES[quizIdx % WAITING_QUIZZES.length]}
            </div>
          </div>
        </div>
      )}

      {/* 2. TRẠNG THÁI ĐỌC XONG (Review - Đề chỉ hiện 1 lần trong ô sửa được) */}
      {aiState === 'review' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 2px' }}>
            <BuddyGreeter size={48} />
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, color: 'var(--c-text)', fontFamily: 'var(--font-head)' }}>
                Gấu đọc được đề này!
              </h2>
              <span style={{ fontSize: 12.5, color: 'var(--c-sub)' }}>
                Mẹ xem lại xem số liệu có cần sửa không nhé
              </span>
            </div>
          </div>

          {/* Chip môn học, lớp, dạng bài */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <span className="btn-km-chip" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-line)', padding: '3px 10px', borderRadius: 999, fontSize: 11.5, fontWeight: 800 }}>
              📖 {subjectLabel}
            </span>
            <span className="btn-km-chip" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-line)', padding: '3px 10px', borderRadius: 999, fontSize: 11.5, fontWeight: 800 }}>
              🎒 {child?.grade || 'Lớp 3'}
            </span>
            <span className="btn-km-chip" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-line)', padding: '3px 10px', borderRadius: 999, fontSize: 11.5, fontWeight: 800 }}>
              📐 Bài tập
            </span>
          </div>

          {reAskReason && (
            <div className="card-km card-km-note" style={{ background: '#FFF1F2', borderColor: '#FECDD3' }}>
              <span style={{ fontSize: 13, color: '#991B1B', fontWeight: 700 }}>
                ⚠️ Đề có chỗ chưa rõ: {reAskReason}. {S.parent} sửa lại giúp con nhé.
              </span>
            </div>
          )}

          {/* Ô sửa đề bài duy nhất */}
          <div className="card-km" style={{ padding: '12px 14px', background: 'var(--c-surface)' }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: 'var(--c-sub)', marginBottom: 6 }}>
              NỘI DUNG ĐỀ BÀI (CHẠM ĐỂ CHỈNH SỬA)
            </label>
            <textarea
              className="field"
              rows={5}
              value={editedText}
              onChange={(e) => {
                setEditedText(e.target.value)
                setReAskReason(null)
              }}
              placeholder="Nhập hoặc sửa lại nội dung đề bài..."
              style={{
                width: '100%',
                fontSize: 14.5,
                lineHeight: 1.5,
                fontFamily: 'var(--font-body)',
                border: '1.5px solid var(--c-line, #EADFCF)',
                borderRadius: 12,
                padding: '10px 12px',
                background: 'var(--c-bg)',
                color: 'var(--c-text)',
                boxSizing: 'border-box',
              }}
            />
            {shotImg && (
              <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setZoomOpen(true)}
                  className="btn-km-ghost"
                  style={{ fontSize: 12, fontWeight: 800, color: 'var(--c-primary)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  🔍 Xem lại ảnh gốc chụp
                </button>
              </div>
            )}
          </div>

          {/* Nút dính đáy */}
          <div
            className="bottom-action-bar-km"
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '10px 16px',
              background: 'var(--c-surface, #fff)',
              borderTop: '1px solid var(--c-line, #EADFCF)',
              display: 'grid',
              gridTemplateColumns: '1fr 1.6fr',
              gap: 10,
              zIndex: 90,
              boxShadow: '0 -4px 12px rgba(0,0,0,0.06)',
            }}
          >
            <button
              type="button"
              className="btn-km btn-km-m btn-km-secondary"
              onClick={() => { soundPop(500); go('snap') }}
            >
              Chụp lại
            </button>
            <button
              type="button"
              className="btn-km btn-km-m btn-km-primary"
              onClick={() => {
                const t = (editedText || '').trim()
                if (!t) { toast('Đề bài đang trống, hãy nhập đề nhé ✏️'); return }
                soundTap()
                patch({ flow: { ...S.flow, ocr: t } })
                startExplain(t, redirectNote)
              }}
            >
              <span>Đúng rồi, soạn bài</span>
              <span>›</span>
            </button>
          </div>
        </div>
      )}

      {/* Cảnh báo phạm vi ngoài luồng (nếu có) */}
      {aiState === 'scope_blocked' && scopeResult && (
        <div className="card-km" style={{ border: '2px solid #EF4444', background: '#FEF2F2' }}>
          <b style={{ fontSize: 15, color: '#991B1B' }}>Ngoài phạm vi bài tập</b>
          <p style={{ fontSize: 13.5, color: '#7F1D1D', margin: '4px 0 12px' }}>{scopeResult.message}</p>
          <button type="button" className="btn-km btn-km-m btn-km-secondary" onClick={() => go('snap')}>
            Chụp lại ảnh khác
          </button>
        </div>
      )}

      {aiState === 'scope_warn' && scopeResult && (
        <div className="card-km" style={{ border: '2px solid #F59E0B', background: '#FFFBEB' }}>
          <b style={{ fontSize: 15, color: '#92400E' }}>Lưu ý về bài tập</b>
          <p style={{ fontSize: 13.5, color: '#78350F', margin: '4px 0 12px' }}>{scopeResult.message}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button type="button" className="btn-km btn-km-m btn-km-secondary" onClick={() => go('snap')}>
              Chụp lại
            </button>
            <button type="button" className="btn-km btn-km-m btn-km-primary" onClick={handleContinueWarn}>
              Vẫn tiếp tục ›
            </button>
          </div>
        </div>
      )}

      {/* Modal phóng to ảnh gốc */}
      {zoomOpen && shotImg && (
        <div
          onClick={() => setZoomOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,10,20,.94)', display: 'flex', flexDirection: 'column' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ display: 'flex', gap: 8, padding: '12px 16px', alignItems: 'center', justifyContent: 'flex-end' }}
          >
            {[1, 2, 3].map((z) => (
              <button
                key={z}
                type="button"
                onClick={() => setZoom(z)}
                style={{ border: '1.5px solid #fff', borderRadius: 999, padding: '6px 12px', fontSize: 13, fontWeight: 700, color: '#fff', background: zoom === z ? 'rgba(255,255,255,.28)' : 'transparent' }}
              >
                {z}×
              </button>
            ))}
            <button
              type="button"
              onClick={() => setZoomOpen(false)}
              style={{ border: 'none', borderRadius: 999, padding: '6px 14px', fontSize: 13, fontWeight: 700, color: '#3B2A45', background: '#fff' }}
            >
              ✕ Đóng
            </button>
          </div>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ flex: 1, overflow: 'auto', WebkitOverflowScrolling: 'touch', padding: '0 8px 16px' }}
          >
            <img
              src={shotImg}
              alt="Ảnh bài tập phóng to"
              style={{ width: `${zoom * 100}%`, maxWidth: 'none', display: 'block', margin: zoom === 1 ? '0 auto' : 0, borderRadius: 8 }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

/* ============================================================
   5. AI GIẢNG CHO MẸ
   ============================================================ */

export const SKILL_LABELS = {
  doc_hieu_de: "Đọc hiểu đề",
  don_vi: "Đổi đơn vị",
  chon_phep_tinh: "Chọn phép tính",
  tinh_toan: "Tính toán",
  viet_loi_giai: "Lời giải",
  kiem_tra_lai: "Kiểm tra lại",
  doc_hieu: "Đọc hiểu",
  tu_vung: "Từ vựng",
  chinh_ta: "Chính tả",
  dat_cau: "Đặt câu",
  tu_vung_en: "Từ vựng Tiếng Anh",
  nghe: "Nghe",
  ngu_phap: "Ngữ pháp",
  phat_am: "Phát âm",
}

// "Lớp 3" → "lớp 3" (tránh "CÁCH LỚP LỚP 3")
function gradeLabel(g) {
  const t = String(g || '').trim()
  if (!t) return 'lớp con'
  return /^lớp/i.test(t) ? t.replace(/^lớp/i, 'lớp') : `lớp ${t}`
}

export function Explain() {
  const { S, problem, patch, go, openSheet, toast } = useContext(AppCtx)
  const [showMathList, setShowMathList] = useState(false)
  const [showFullOcr, setShowFullOcr] = useState(false)
  const child = S.children.find((c) => c.id === S.activeId)
  const mathInfo = useMemo(() => problem?.mathVerified || problem?.math_verified || validateAllLessonMath(problem), [problem])
  const stepsCount = Array.isArray(problem.steps) ? problem.steps.length : 4

  const explainText =
    `Đây là dạng bài ${problem.type}. ${problem.summary || ''} ` +
    `${S.parent.toLowerCase()} lưu ý: ${problem.warning || ''} ` +
    `Cách ${gradeLabel(child.grade)} đang học: ${problem.method || ''}.`

  return (
    <div className="explain-container-km" style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 88 }}>
      {/* TopBar T4 */}
      <TopBarT4
        title={`Gấu đã soạn ${stepsCount} bậc`}
        stepText={formatChildGrade(child?.grade || '3')}
        onBack={() => go('home')}
        onOpenCalm={() => openSheet('calm')}
      />

      {/* Thẻ Theo cách cô dạy */}
      {Boolean(problem.isTeacherAssigned && S.studySource === 'teacher') && (
        <div
          className="card-km"
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            padding: '10px 14px',
            background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
            border: '1.5px solid #10B981',
            borderRadius: 14,
          }}
          data-testid="badge-teacher-method"
        >
          <span style={{ fontSize: 18, flexShrink: 0 }}>👩‍🏫</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <span style={{ fontSize: 11, fontWeight: 900, backgroundColor: '#047857', color: '#fff', padding: '1px 7px', borderRadius: 6, textTransform: 'uppercase' }}>
                Theo cách cô dạy
              </span>
              <b style={{ fontSize: 12.5, color: '#065F46' }}>
                {formatTeacherName(problem.teacherName || '')}
              </b>
            </div>
            <p style={{ fontSize: 13, color: '#064E3B', margin: '2px 0 0', lineHeight: 1.4, fontWeight: 600 }}>
              {problem.teacherMethodNote || 'Hỏi con đọc kỹ đề bài và làm từng bước theo phương pháp của cô.'}
            </p>
          </div>
        </div>
      )}

      {/* Dải đề rút gọn 1 dòng */}
      <div
        className="card-km"
        data-testid="compact-problem-strip-explain"
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          background: 'var(--c-surface)',
          borderRadius: 14,
          width: '100%',
          boxSizing: 'border-box',
          minWidth: 0,
        }}
      >
        <span style={{ fontSize: 13, flexShrink: 0, lineHeight: 1 }}>📝</span>
        <span
          style={{
            flex: 1,
            minWidth: 0,
            whiteSpace: showFullOcr ? 'normal' : 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontSize: 12.5,
            color: 'var(--c-sub, var(--c-text-2))',
            lineHeight: 1.4,
          }}
        >
          {problem.ocr}
        </span>
        <button
          type="button"
          onClick={() => setShowFullOcr(!showFullOcr)}
          className="btn-km-ghost"
          style={{
            fontSize: 12,
            fontWeight: 800,
            color: 'var(--c-primary)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            padding: 0,
          }}
        >
          {showFullOcr ? 'Thu gọn' : 'Xem đề ›'}
        </button>
      </div>

      {/* Kiểm toán độc lập (nếu có) */}
      {mathInfo && mathInfo.verifiedCount > 0 && (
        <div
          className="card-km card-km-good"
          onClick={() => setShowMathList(!showMathList)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5 }}>
            <span style={{ color: 'var(--c-good, #2F7D4F)', fontWeight: 900 }}>✓</span>
            <span style={{ color: 'var(--c-text)', fontWeight: 700 }}>
              Đã kiểm lại {mathInfo.verifiedCount} phép tính
            </span>
          </div>
          <span style={{ fontSize: 11.5, color: 'var(--c-primary)', fontWeight: 800 }}>
            {showMathList ? 'Đóng' : 'Xem'}
          </span>
        </div>
      )}

      {showMathList && mathInfo?.calculations && (
        <div className="card-km" style={{ padding: '10px 12px', background: 'var(--c-surface)' }}>
          {mathInfo.calculations.map((c, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, padding: '4px 0' }}>
              <b>{c.expr}</b>
              <span style={{ color: 'var(--c-good)', fontWeight: 800 }}>✓ Đúng</span>
            </div>
          ))}
        </div>
      )}

      {/* 4 bậc là danh sách dòng */}
      {Array.isArray(problem.steps) && problem.steps.length > 0 && (
        <div className="card-km" style={{ padding: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <b style={{ fontSize: 14, color: 'var(--c-text)', fontFamily: 'var(--font-head)' }}>
              {problem.steps.length} BẬC CÂU HỎI
            </b>
            <button
              type="button"
              className="btn-km-chip"
              style={{
                fontSize: 11.5,
                fontWeight: 800,
                padding: '3px 10px',
                borderRadius: 999,
                background: 'var(--c-bg)',
                border: '1px solid var(--c-line)',
                cursor: 'pointer',
              }}
              onClick={() => speak(explainText)}
            >
              🔊 Nghe
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {problem.steps.map((st, i) => {
              const skillName = SKILL_LABELS[st.ky_nang] || st.ky_nang || ''
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 10px',
                    borderRadius: 12,
                    background: 'var(--c-bg)',
                    border: '1px solid var(--c-line)',
                  }}
                >
                  <span
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: 'var(--c-surface-2, #EADFCF)',
                      color: 'var(--c-text, #2D2319)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12.5,
                      fontWeight: 800,
                      flexShrink: 0,
                      lineHeight: 1,
                    }}
                  >
                    {i + 1}
                  </span>
                  <span style={{ flex: 1, fontSize: 13.5, color: 'var(--c-text)', fontWeight: 600, lineHeight: 1.35 }}>
                    {st.question || st.q}
                  </span>
                  {skillName && (
                    <span
                      style={{
                        fontSize: 11,
                        color: 'var(--c-sub)',
                        background: 'var(--c-surface)',
                        padding: '2px 7px',
                        borderRadius: 999,
                        border: '1px solid var(--c-line)',
                        flexShrink: 0,
                      }}
                    >
                      {skillName}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Mẹ lưu ý (1 dòng) */}
      {problem.warning && (
        <div className="card-km card-km-note" style={{ padding: '10px 14px' }}>
          <span style={{ fontSize: 13, color: 'var(--c-text)', lineHeight: 1.4 }}>
            <b>⚠️ {S.parent} lưu ý:</b> {problem.warning}
          </span>
        </div>
      )}

      {/* Báo Gấu soạn chưa đúng */}
      <div style={{ textAlign: 'center', marginTop: 2 }}>
        <button
          type="button"
          onClick={() => openSheet('reportIssue')}
          className="btn-km-ghost"
          style={{ fontSize: 12, color: 'var(--c-sub)', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          Báo Gấu soạn chưa đúng
        </button>
      </div>

      {/* Nút Lớn 56px dính đáy */}
      <div
        className="bottom-action-bar-km"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '10px 16px',
          background: 'var(--c-surface, #fff)',
          borderTop: '1px solid var(--c-line, #EADFCF)',
          zIndex: 90,
          boxShadow: '0 -4px 12px rgba(0,0,0,0.06)',
        }}
      >
        <button
          type="button"
          className="btn-km btn-km-l btn-km-primary"
          style={{ width: '100%' }}
          onClick={() => {
            patch({ flow: { ...S.flow, step: 0, stuck: 0, unlocked: false } })
            go('scaffold')
          }}
        >
          <span>Bắt đầu hỏi con</span>
          <span className="btn-km-arrow">›</span>
        </button>
      </div>
    </div>
  )
}

/* ============================================================
   5b. ĐÁP ÁN CHO MẸ, giữ 1.5 giây mới hiện, chữ nhỏ & muted,
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
  const [isCardShaking, setIsCardShaking] = useState(false)
  const [parentNote, setParentNote] = useState('')
  const [stepSeconds, setStepSeconds] = useState(0)
  const [nudgeProblemCount, setNudgeProblemCount] = useState(0)
  const [snoozeUntil, setSnoozeUntil] = useState(0)
  const [showNudge, setShowNudge] = useState(false)
  const [nudgeReason, setNudgeReason] = useState('')

  // State câu hỏi nhỏ hơn (Đợt 18 · Chặng 4)
  const [microStep, setMicroStep] = useState(null)
  const [loadingMicro, setLoadingMicro] = useState(false)
  const [microCount, setMicroCount] = useState(0)
  const [showMicroWhy, setShowMicroWhy] = useState(false)

  // State Gấu nghe con trả lời (Đợt 18 · Chặng 5)
  const [voiceState, setVoiceState] = useState({
    listening: false,
    transcript: '',
    verdict: null,
    loading: false,
  })
  const [hasMicSupport, setHasMicSupport] = useState(true)
  const voiceRecoRef = useRef(null)
  const voiceTimeoutRef = useRef(null)
  // State Linh vật phản ứng (Đợt 18 · Chặng 7)
  const [buddyState, setBuddyState] = useState('idle')

  useEffect(() => {
    setShowAns(false)
    setStepSeconds(0)
    setMicroStep(null)
    setLoadingMicro(false)
    setMicroCount(0)
    setShowMicroWhy(false)
    setVoiceState({ listening: false, transcript: '', verdict: null, loading: false })
    setBuddyState('idle')
  }, [step])

  useEffect(() => {
    const supported = typeof window !== 'undefined' && (
      Boolean(window.SpeechRecognition || window.webkitSpeechRecognition) ||
      Boolean(navigator?.mediaDevices?.getUserMedia)
    )
    setHasMicSupport(supported)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        setStepSeconds((s) => s + 1)
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (S.calmNudgeEnabled === false) return
    if (Date.now() < snoozeUntil) return
    if (nudgeProblemCount >= 1) return

    let reason = ''
    // Prompt 22 - 0.3: Chỉ gợi ý nghỉ khi đã hiện đủ 2 câu nhỏ mà con vẫn kẹt, hoặc khi mẹ bấm Mẹ bình tĩnh
    if (microCount >= 2 && stuck >= 2) {
      reason = `${child?.name || 'Con'} bí 2 lần ở câu nhỏ rồi`
    } else if (stepSeconds >= 300 && microCount >= 2) {
      reason = 'Bậc này đã 5 phút rồi'
    }

    if (reason && !showNudge) {
      setNudgeReason(reason)
      setShowNudge(true)
      setNudgeProblemCount((c) => c + 1)
    }
  }, [stuck, microCount, stepSeconds, S.calmNudgeEnabled, snoozeUntil, nudgeProblemCount, showNudge])

  const ScaffoldActionsSlot = getSlot(S.theme, 'ScaffoldActions') || DefaultScaffoldActions

  const stepOk = () => {
    setBuddyState('cheer')
    const curStep = steps[step]
    const praiseText = curStep?.loi_khen || curStep?.praise || `Giỏi quá! Lên bậc ${step + 2} nào`
    const ns = step + 1

    // Đợt 18 · Chặng 2: Ghi nhận sự kiện học từng bước cho Gấu nhớ con
    recordLearningEvent({
      child_id: child?.id,
      session_id: S.flow?.sessionId || (`sess_${Date.now()}`),
      subject: problem?.subject || "Toán",
      problem_type: problem?.type || "",
      step_no: step + 1,
      skill: curStep?.ky_nang || "tinh_toan",
      result: stuck === 0 ? "tu_lam" : (stuck === 1 ? "can_goi_y" : "me_dan"),
      hints_used: stuck,
      micro_steps: 0,
    }).catch(() => {})

    emitMotion('step_done', { step: ns, total: steps.length })
    patch({ flow: { ...S.flow, step: ns, stuck: 0 } })
    if (ns >= steps.length) {
      boom()
      toast(`🎉 ${child.name} tự giải xong cả ${steps.length} bậc!`)
      buddyReact('cheer', praiseText, 2500)
    } else {
      buddyReact('cheer', praiseText, 2000)
    }
  }

  const startVoiceListen = () => {
    if (voiceState.listening) {
      if (voiceRecoRef.current) {
        try { voiceRecoRef.current.stop() } catch (_) {}
      }
      setVoiceState(prev => ({ ...prev, listening: false }))
      return
    }

    const SpeechRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)
    if (SpeechRecognition) {
      try {
        const reco = new SpeechRecognition()
        reco.lang = 'vi-VN'
        reco.continuous = false
        reco.interimResults = false

        reco.onstart = () => {
          emitMotion('listen_start')
          setVoiceState(prev => ({ ...prev, listening: true, verdict: null }))
          toast('🎙 Đang lắng nghe con… (nói tối đa 15s)')
        }
        reco.onresult = (evt) => {
          const transcript = evt.results?.[0]?.[0]?.transcript || ''
          if (transcript.trim()) {
            handleVoiceResult(transcript.trim())
          }
        }
        reco.onerror = (err) => {
          console.warn('SpeechRecognition error:', err)
          setVoiceState(prev => ({ ...prev, listening: false }))
          toast('Chưa nghe rõ lời con, thử bấm nói lại nhé!')
        }
        reco.onend = () => {
          setVoiceState(prev => ({ ...prev, listening: false }))
        }

        voiceRecoRef.current = reco
        reco.start()

        if (voiceTimeoutRef.current) clearTimeout(voiceTimeoutRef.current)
        voiceTimeoutRef.current = setTimeout(() => {
          try { reco.stop() } catch (_) {}
        }, 15000)
        return
      } catch (err) {
        console.warn('Web Speech error, using fallback:', err)
      }
    }

    toast('Trình duyệt chưa hỗ trợ ghi âm trực tiếp')
  }

  const handleVoiceResult = async (rawTranscript) => {
    const curStep = steps[step]
    setVoiceState({
      listening: false,
      transcript: rawTranscript,
      verdict: null,
      loading: true,
    })
    toast('Gấu đang lắng nghe và suy nghĩ… 🧠')

    try {
      const res = await fetchAiJudgeAnswer({
        stepQuestion: curStep?.q || curStep?.question || '',
        stepAnswer: curStep?.answerForParent || curStep?.answer || curStep?.dap_an_cho_me || '',
        childSpeech: rawTranscript,
        problemText: problem.text || problem.problem_text || '',
        childName: child.name,
      })

      if (res && res.ok && res.verdict) {
        const v = res.verdict
        setVoiceState({
          listening: false,
          transcript: rawTranscript,
          verdict: v,
          loading: false,
        })

        recordLearningEvent({
          child_id: child?.id,
          session_id: S.flow?.sessionId || (`sess_${Date.now()}`),
          subject: problem?.subject || "Toán",
          problem_type: problem?.type || "",
          step_no: step + 1,
          skill: curStep?.ky_nang || "tinh_toan",
          result: v.danh_gia === 'dung' ? 'tu_lam' : (v.danh_gia === 'gan_dung' ? 'can_goi_y' : 'me_dan'),
          hints_used: stuck,
          micro_steps: microCount,
          voice_verdict: v.danh_gia,
        }).catch(() => {})

        emitMotion('listen_result', { verdict: v })
        if (v.danh_gia === 'dung') {
          buddyReact('cheer', v.khen_cu_the || 'Con trả lời đúng rồi!', 2500)
          soundSuccess()
        } else if (v.danh_gia === 'gan_dung') {
          setBuddyState('thinking')
          buddyReact('thinking', v.khen_cu_the || 'Gần đúng rồi con ơi!', 2500)
        } else if (v.danh_gia === 'sai_huong') {
          setBuddyState('surprised')
          buddyReact('surprised', 'Chưa đúng hướng rồi, để mẹ hướng dẫn thêm nhé!', 2500)
        } else {
          setBuddyState('idle')
          buddyReact('idle', 'Gấu nghe chưa rõ, con nói to lại nha!', 2500)
        }
      } else {
        setVoiceState(prev => ({ ...prev, loading: false }))
      }
    } catch (err) {
      console.warn('Judge answer error:', err)
      setVoiceState(prev => ({ ...prev, loading: false }))
    }
  }

  const triggerMicroStep = async (idx = 1) => {
    const curStep = steps[step]
    emitMotion('micro_step', {
      index: idx,
      question: curStep?.question || curStep?.q || '',
      hint: curStep?.hintLevel1 || (curStep?.hints && curStep.hints[0]) || curStep?.hint || '',
      hint2: curStep?.hintLevel2 || (curStep?.hints && curStep.hints[1]) || curStep?.hint2 || ''
    })
    setLoadingMicro(true)
    buddyReact('thinking', 'Để Gấu chẻ nhỏ câu hỏi cho con nhé…', 2500)
    try {
      const res = await fetchAiMicroStep({
        problemText: problem.text || problem.problem_text || '',
        stepQuestion: curStep?.q || curStep?.question || '',
        stepAnswer: curStep?.answerForParent || curStep?.answer || curStep?.dap_an_cho_me || '',
        hintsUsed: [curStep?.hint].filter(Boolean),
        skill: curStep?.ky_nang || 'tinh_toan',
        childProfile: S.learnerProfile || '',
        childSpeech: '',
        microIndex: idx,
        childName: child.name,
        sessionId: S.flow?.sessionId,
        familyId: S.familyId,
      })

      if (res && res.ok && res.micro_step) {
        setMicroStep(res.micro_step)
        setMicroCount(idx)
        setBuddyState('reading')
        buddyReact('reading', 'Mẹ thử hỏi con câu nhỏ này xem sao nha!', 2500)
      } else {
        toast('Gấu tạm chuyển sang gợi ý hình vẽ cho mẹ nhé')
        buddyReact('oops', 'Mình xem gợi ý vẽ hình nhé!', 2000)
      }
    } catch (e) {
      console.warn('Micro-step error:', e)
    } finally {
      setLoadingMicro(false)
    }
  }

  const handleMicroSolved = () => {
    setBuddyState('cheer')
    const curStep = steps[step]
    const praiseText = curStep?.loi_khen || curStep?.praise || `Giỏi quá! Lên bậc ${step + 2} nào`
    const ns = step + 1

    recordLearningEvent({
      child_id: child?.id,
      session_id: S.flow?.sessionId || (`sess_${Date.now()}`),
      subject: problem?.subject || "Toán",
      problem_type: problem?.type || "",
      step_no: step + 1,
      skill: curStep?.ky_nang || "tinh_toan",
      result: "can_goi_y",
      hints_used: stuck,
      micro_steps: microCount || 1,
    }).catch(() => {})

    setMicroStep(null)
    setMicroCount(0)
    patch({ flow: { ...S.flow, step: ns, stuck: 0 } })
    if (ns >= steps.length) {
      boom()
      toast(`🎉 ${child.name} đã tìm ra đáp án rồi!`)
      buddyReact('cheer', praiseText, 2500)
    } else {
      buddyReact('cheer', praiseText, 2000)
    }
  }

  const handleMicroStillStuck = () => {
    if (microCount < 2) {
      triggerMicroStep(2)
    } else {
      const curStep = steps[step]
      recordLearningEvent({
        child_id: child?.id,
        session_id: S.flow?.sessionId || (`sess_${Date.now()}`),
        subject: problem?.subject || "Toán",
        problem_type: problem?.type || "",
        step_no: step + 1,
        skill: curStep?.ky_nang || "tinh_toan",
        result: "me_dan",
        hints_used: 2,
        micro_steps: 2,
      }).catch(() => {})

      setMicroStep(null)
      setShowAns(true)
      toast(`Mẹ hãy chỉ dẫn từng bước cho ${child.name} nhé 💚`)
      buddyReact('idle', 'Mẹ hướng dẫn từng bước cho con nhé', 2500)
    }
  }

  const stepStuck = () => {
    setBuddyState('thinking')
    setIsCardShaking(true)
    setTimeout(() => setIsCardShaking(false), 600)
    const ns = stuck + 1
    const curStep = steps[step]
    emitMotion('stuck', {
      stuck: ns,
      question: curStep?.question || curStep?.q || '',
      hint: (curStep?.hints && curStep.hints[ns - 1]) || curStep?.hintLevel1 || curStep?.hint || ''
    })
    patch({ flow: { ...S.flow, stuck: ns } })

    // Đợt 18 · Chặng 4: Lần 2 ở cùng bậc -> gọi AI chẻ nhỏ câu hỏi
    if (ns === 2 && !microStep) {
      triggerMicroStep(1)
    } else {
      buddyReact('oops', 'Không sao đâu, mình xem gợi ý tiếp nhé', 2200)
    }
  }

  const onOpen = () => {
    const curStep = steps[step]
    recordLearningEvent({
      child_id: child?.id,
      session_id: S.flow?.sessionId || (`sess_${Date.now()}`),
      subject: problem?.subject || "Toán",
      problem_type: problem?.type || "",
      step_no: step + 1,
      skill: curStep?.ky_nang || "tinh_toan",
      result: "me_dan",
      hints_used: Math.max(stuck, 2),
      micro_steps: 0,
    }).catch(() => {})

    patch({ flow: { ...S.flow, unlocked: true } })
    boom()
    toast('Đáp án đã mở, chỉ cho ' + S.parent.toLowerCase() + ' đối chiếu thôi nhé')
  }

  const [showMomDrawer, setShowMomDrawer] = useState(false)
  const [showFullOcr, setShowFullOcr] = useState(false)
  const [showWhyModal, setShowWhyModal] = useState(false)
  const curStep = steps[step] || {}

  useEffect(() => {
    if (!showMomDrawer) return
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setShowMomDrawer(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showMomDrawer])

  // Kiểm tra hoàn thành bài
  if (step >= steps.length) {
    return (
      <div className="card-km" style={{ textAlign: 'center', padding: '32px 16px', margin: '20px 0' }}>
        <div style={{ fontSize: 44, marginBottom: 8 }}>🎉 🐻 🏆</div>
        <h2 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 8px', color: 'var(--c-text)', fontFamily: 'var(--font-head)' }}>
          {child.name} đã hoàn thành cả {steps.length} bậc!
        </h2>
        <p style={{ fontSize: 14, color: 'var(--c-sub)', margin: '0 0 20px' }}>
          Tuyệt vời lắm! Mẹ cùng con nhận huy hiệu và tổng kết bài học nhé.
        </p>
        <button
          type="button"
          data-testid="btn-finish-lesson"
          className="btn-km btn-km-l btn-km-primary"
          style={{ width: '100%' }}
          onClick={() => go('done')}
        >
          Hoàn thành bài ›
        </button>
      </div>
    )
  }

  return (
    <div className="scaffold-container-km" style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 110 }}>
      {/* 1. TOP BAR T4 & TIẾN ĐỘ 4 KHÚC */}
      <TopBarT4
        title="Hỏi con từng bước"
        stepText={`Bước ${step + 1}/${steps.length}`}
        onBack={() => go('explain')}
        onOpenCalm={() => openSheet('calm')}
      />

      <Progress4 total={steps.length} current={step} />

      {/* 2. DẢI ĐỀ RÚT GỌN 1 DÒNG */}
      <div
        className="card-km"
        data-testid="compact-problem-strip-scaffold"
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          padding: '6px 12px',
          background: 'var(--c-surface)',
          borderRadius: 12,
          width: '100%',
          boxSizing: 'border-box',
          minWidth: 0,
        }}
      >
        <span style={{ fontSize: 13, flexShrink: 0, lineHeight: 1 }}>📝</span>
        <span
          style={{
            flex: 1,
            minWidth: 0,
            whiteSpace: showFullOcr ? 'normal' : 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontSize: 12,
            color: 'var(--c-sub, var(--c-text-2))',
          }}
        >
          {problem.ocr}
        </span>
        <button
          type="button"
          onClick={() => setShowFullOcr(!showFullOcr)}
          className="btn-km-ghost"
          style={{
            fontSize: 11.5,
            fontWeight: 800,
            color: 'var(--c-primary)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            padding: 0,
          }}
        >
          {showFullOcr ? 'Thu gọn' : 'Xem đề ›'}
        </button>
      </div>

      {/* 3. THẺ CÂU HỎI CHÍNH (HERO CARD theo hoi-con-gon-gang.html) */}
      <div
        className={`card-km hero-question-km ${isCardShaking ? 'card-shaking' : ''}`}
        style={{
          padding: '16px 14px',
          background: 'var(--c-surface)',
          borderRadius: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
          animation: isCardShaking ? 'wob 0.6s ease-in-out' : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BuddyGreeter size={38} />
            <span style={{ fontSize: 11.5, fontWeight: 900, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--c-sub)' }}>
              BẬC {step + 1}
            </span>
          </div>
          {curStep?.ky_nang && (
            <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--c-sub)', background: 'var(--c-bg)', padding: '2px 8px', borderRadius: 999 }}>
              {SKILL_LABELS[curStep.ky_nang] || curStep.ky_nang}
            </span>
          )}
        </div>

        {/* CÂU HỎI CHỮ TO 22-23px */}
        <h2
          style={{
            fontSize: 22,
            lineHeight: 1.35,
            fontWeight: 800,
            color: 'var(--c-text)',
            fontFamily: 'var(--font-head)',
            margin: 0,
          }}
        >
          {microStep?.cau_hoi_nho || curStep.q || curStep.question}
        </h2>

        {/* 2 CHIP: ĐỌC TO & VÌ SAO HỎI */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            type="button"
            className="btn-km-chip"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 12,
              fontWeight: 800,
              padding: '4px 10px',
              borderRadius: 999,
              background: 'var(--c-bg)',
              border: '1px solid var(--c-line)',
              cursor: 'pointer',
            }}
            onClick={() => speak(microStep?.cau_hoi_nho || curStep.q || curStep.question)}
          >
            <span>🔊</span>
            <span>Đọc to</span>
          </button>

          <button
            type="button"
            className="btn-km-chip"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 12,
              fontWeight: 800,
              padding: '4px 10px',
              borderRadius: 999,
              background: 'var(--c-bg)',
              border: '1px solid var(--c-line)',
              cursor: 'pointer',
            }}
            onClick={() => setShowWhyModal(!showWhyModal)}
          >
            <span>💡</span>
            <span>Vì sao hỏi?</span>
          </button>
        </div>

        {showWhyModal && (curStep.ly_do_cho_me || microStep?.ly_do_cho_me) && (
          <div style={{ background: 'var(--c-bg)', padding: '8px 12px', borderRadius: 10, fontSize: 12.5, color: 'var(--c-sub)', lineHeight: 1.4 }}>
            💡 <b>Mục tiêu sư phạm:</b> {microStep?.ly_do_cho_me || curStep.ly_do_cho_me}
          </div>
        )}

        {/* MIC TRÒN TO: CÁCH TRẢ LỜI CHÍNH */}
        {hasMicSupport && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, marginTop: 4 }}>
            <button
              type="button"
              className={`mic-round-btn ${voiceState.listening ? 'on' : ''}`}
              onClick={startVoiceListen}
              data-testid="btn-voice-listen"
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: voiceState.listening ? 'var(--c-text)' : 'var(--c-accent, #F6A623)',
                color: voiceState.listening ? 'var(--c-surface)' : 'var(--c-on-accent, #fff)',
                border: 'none',
                display: 'grid',
                placeItems: 'center',
                fontSize: 22,
                cursor: 'pointer',
                boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
              }}
            >
              <i className="fa-solid fa-microphone" />
            </button>
            <span style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--c-sub)' }}>
              {voiceState.listening ? 'Đang nghe con nói…' : 'Chạm để con trả lời'}
            </span>
          </div>
        )}

        {/* Lời con nói & AI nhận xét */}
        {voiceState.transcript && (
          <div style={{ background: 'var(--c-bg)', padding: '8px 12px', borderRadius: 12, fontSize: 13 }}>
            <span style={{ fontSize: 11, fontWeight: 900, color: 'var(--c-sub)' }}>CON NÓI:</span>
            <div style={{ fontWeight: 700, color: 'var(--c-text)', marginTop: 2 }}>"{voiceState.transcript}"</div>
          </div>
        )}

        {voiceState.verdict && !voiceState.loading && (
          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '8px 12px', borderRadius: 12, fontSize: 13 }}>
            <b style={{ color: '#166534' }}>{voiceState.verdict.danh_gia === 'dung' ? '✓ Đúng rồi' : '⚡ Gợi ý tiếp:'}</b>
            <p style={{ margin: '2px 0 0', color: '#14532D' }}>{voiceState.verdict.nhan_xet_cho_me}</p>
          </div>
        )}

        {/* GỢI Ý NHỎ HIỆN TỪNG CÁI MỘT (gợi ý đã dùng thu gọn 1 dòng) */}
        {stuck >= 1 && (
          <div style={{ borderTop: '1.5px dashed var(--c-line)', paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {stuck >= 2 && curStep.hint && (
              <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--c-text-2)', borderTop: '1.5px dashed var(--c-line)', paddingTop: 6, marginBottom: 4 }}>
                ✓ Gợi ý 1: {curStep.hint}
              </div>
            )}
            <div style={{ fontSize: 10.5, letterSpacing: '0.04em', color: 'var(--c-text-2)', fontWeight: 800 }}>
              <b style={{ color: 'var(--c-accent-2, var(--c-accent))', fontWeight: 900 }}>GỢI Ý NHỎ {stuck >= 2 ? '2/2' : '1/2'}</b> · {stuck >= 2 ? 'Vẽ ra giấy' : 'Dùng đồ vật thật'}
            </div>
            <p style={{ fontSize: 15, fontWeight: 800, color: 'var(--c-text)', margin: '2px 0 0', lineHeight: 1.35 }}>
              {stuck >= 2 ? (curStep.hint2 || curStep.hint) : curStep.hint}
            </p>
          </div>
        )}
      </div>

      {/* 4. CHỈ MỜI NGHỈ KHI ĐÃ HẾT 2 GỢI Ý MÀ VẪN KẸT (Nằm trong luồng, không đè nút) */}
      {stuck >= 2 && showNudge && (
        <div
          className="card-km"
          style={{
            background: '#FEF3C7',
            border: '1.5px solid #FCD34D',
            padding: '12px 14px',
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span style={{ fontSize: 24 }}>😮‍💨</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <b style={{ fontSize: 13.5, color: '#92400E', display: 'block' }}>Nghỉ 1 phút cùng con nhé?</b>
            <span style={{ fontSize: 11.5, color: '#78350F' }}>Con đang cố hết sức rồi, hít thở một chút sẽ sáng dạ hơn!</span>
          </div>
          <button
            type="button"
            className="btn-km btn-km-s btn-km-primary"
            style={{ minHeight: 32, padding: '0 10px', fontSize: 11.5 }}
            onClick={() => { setShowNudge(false); openSheet('calm') }}
          >
            Thở 1p
          </button>
        </div>
      )}

      {/* 5. NGĂN DÀNH CHO MẸ (KÉO LÊN TỪ ĐÁY) */}
      {showMomDrawer && (
        <div
          data-testid="mom-drawer-backdrop"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 98,
            display: 'flex',
            alignItems: 'flex-end',
          }}
          onClick={() => setShowMomDrawer(false)}
        >
          <div
            className="sheet-t5-card"
            style={{
              width: '100%',
              background: 'var(--c-surface, #fff)',
              borderRadius: '24px 24px 0 0',
              padding: '16px 18px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              maxHeight: '75vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ width: 36, height: 4, borderRadius: 99, background: 'var(--c-line)', alignSelf: 'center', marginBottom: 4 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <b style={{ fontSize: 16, color: 'var(--c-text)', fontFamily: 'var(--font-head)' }}>🔒 Dành riêng cho mẹ</b>
              <button
                type="button"
                className="sheet-t5-close"
                onClick={() => setShowMomDrawer(false)}
                style={{ width: 30, height: 30, borderRadius: '50%', border: 'none', background: 'var(--c-bg)', fontSize: 14, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Đáp án đối chiếu: Nút Giữ có vòng chạy */}
            <div style={{ marginTop: 4 }}>
              <label style={{ fontSize: 12, fontWeight: 800, color: 'var(--c-sub)', display: 'block', marginBottom: 6 }}>
                ĐÁP ÁN ĐỐI CHIẾU
              </label>
              <HoldBtn
                label={`Giữ 1.5s xem đáp án cho ${S.parent.toLowerCase()}`}
                onHoldComplete={onOpen}
              />
              {unlocked && (
                <div style={{ background: 'var(--c-bg)', padding: '10px 12px', borderRadius: 12, marginTop: 8, fontSize: 14, fontWeight: 700, color: 'var(--c-text)' }}>
                  ✓ {curStep.answerForParent || curStep.answer || curStep.hint || 'Hoàn thành bước'}
                </div>
              )}
            </div>

            {/* Hỏi Gấu cách giảng */}
            <div style={{ marginTop: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 800, color: 'var(--c-sub)', display: 'block', marginBottom: 6 }}>
                HỎI GẤU CÁCH GIẢNG NHANH
              </label>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  className="field"
                  style={{ flex: 1, fontSize: 13, padding: '8px 12px', borderRadius: 10, border: '1px solid var(--c-line)', background: 'var(--c-bg)' }}
                  placeholder="VD: con chưa học chia hết..."
                  value={parentNote}
                  onChange={(e) => setParentNote(e.target.value)}
                />
                <button
                  type="button"
                  className="btn-km btn-km-s btn-km-primary"
                  onClick={() => {
                    patch({ parentNoteChat: parentNote.trim() })
                    setShowMomDrawer(false)
                    go('ask')
                  }}
                >
                  Hỏi Gấu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. THANH ĐÁY CỐ ĐỊNH: TAY KÉO MẸ + 2 NÚT 48px */}
      <div
        className="bottom-action-bar-km"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'var(--c-surface, #fff)',
          borderTop: '1px solid var(--c-line, #EADFCF)',
          borderRadius: '20px 20px 0 0',
          boxShadow: '0 -4px 14px rgba(0,0,0,0.06)',
          zIndex: 90,
          padding: '6px 14px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        {/* Tay kéo: 🔒 Dành cho mẹ ▲ */}
        <button
          type="button"
          onClick={() => setShowMomDrawer(true)}
          style={{
            alignSelf: 'center',
            background: 'none',
            border: 'none',
            padding: '2px 10px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <span style={{ width: 28, height: 3, borderRadius: 99, background: 'var(--c-line)' }} />
          <span style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--c-sub)' }}>
            🔒 Dành cho mẹ ▲
          </span>
        </button>

        {/* 2 Nút: Phụ 'Chưa nghĩ ra' & Thành công 'Con làm được!' cùng 48px */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr', gap: 8 }}>
          <button
            type="button"
            className="btn-km btn-km-m btn-km-secondary"
            style={{ minHeight: 48, fontSize: 13 }}
            onClick={stepStuck}
          >
            Chưa nghĩ ra
          </button>

          <button
            type="button"
            className="btn-km btn-km-m btn-km-ok"
            style={{ minHeight: 48, fontSize: 13.5 }}
            onClick={stepOk}
          >
            <span>Con làm được!</span>
            <span>✓</span>
          </button>
        </div>
      </div>
    </div>
  )
}

/* ============================================================
   🎓 TEACH-BACK CARD: NGHE CON GIẢNG LẠI (Prompt 14 Phần B)
   ============================================================ */
export function TeachBackCard({ problem, child, parent, currentChoice, sessionId, toast, onPickChoice }) {
  const [tbState, setTbState] = useState('idle') // idle | recording | transcribing | review | grading | result
  const [recordSec, setRecordSec] = useState(0)
  const [transcript, setTranscript] = useState('')
  const [tbResult, setTbResult] = useState(null)
  const [round, setRound] = useState(1)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const timerRef = useRef(null)

  const TEACH_BACK_OPTIONS = [
    { v: 'ok', e: seasonLevelEmoji('ok', '🌟'), t: 'Con tự làm được (Tự chủ)' },
    { v: 'hint', e: seasonLevelEmoji('hint', '🟡'), t: 'Con cần gợi ý' },
    { v: 'guided', e: seasonLevelEmoji('guided', '🔴'), t: `${parent} phải hướng dẫn nhiều` },
  ]

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioChunksRef.current = []
      const mr = new MediaRecorder(stream)
      mediaRecorderRef.current = mr
      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data)
      }
      mr.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        stream.getTracks().forEach((t) => t.stop())
        setTbState('transcribing')
        try {
          const res = await teachBackTranscribe({ audioBlob })
          setTranscript(res.transcript || '')
          setTbState('review')
        } catch (err) {
          toast('Không bóc băng được âm thanh, dùng lời giảng mẫu nhé!')
          applySample()
        }
      }
      mr.start(250)
      setRecordSec(0)
      setTbState('recording')
      timerRef.current = setInterval(() => {
        setRecordSec((s) => {
          if (s >= 59) {
            stopRecording()
            return 60
          }
          return s + 1
        })
      }, 1000)
    } catch (err) {
      toast('Không kết nối được micro, đang dùng lời giảng mẫu!')
      applySample()
    }
  }

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
  }

  // Lời giảng mẫu chỉ có ở Dùng thử hoặc bài mẫu, và luôn khớp với bài đang học (đợt 15 P1)
  const canUseSample = isTrialActive() || Boolean(problem?.isSample)
  const applySample = async () => {
    if (isTrialActive()) {
      const r = await teachBackTranscribe({}).catch(() => null)
      setTranscript(r?.transcript || '')
    } else {
      setTranscript('Con lấy ba hộp, mỗi hộp tám cây bút là hai mươi tư cây. Xong mẹ cho bạn Na năm cây thì con lấy hai mươi tư trừ đi năm còn mười chín cây bút ạ.')
    }
    setTbState('review')
  }

  const submitGrade = async () => {
    if (!transcript.trim()) {
      toast('Lời giảng đang trống, con thử kể lại nhé!')
      return
    }
    setTbState('grading')
    try {
      const res = await teachBackGrade({
        sessionId: sessionId || `sess_${Date.now()}`,
        childId: child?.id || 'child_1',
        problemText: problem?.ocr || problem?.text || problem?.de_bai || '',
        standardSteps: problem?.answer || '',
        transcript,
        round,
        finalAnswer: problem?.answer || problem?.dap_an_cuoi_cho_me || '',
        lop: child?.grade || 'Lớp 3',
        tenCon: child?.name || 'Mít',
      })
      setTbResult(res)
      setTbState('result')
      const mapped = res.muc_de_xuat === 'self' ? 'ok' : res.muc_de_xuat
      onPickChoice(mapped, res.teach_back_id)
    } catch (err) {
      toast('Lỗi chấm: ' + (err.message || 'Thử lại'))
      setTbState('review')
    }
  }

  const CRITERIA_MAP = {
    du_kien: 'Nêu đủ dữ kiện đề bài',
    phep_tinh: 'Chọn đúng phép tính',
    ket_qua: 'Tính đúng kết quả từng bước',
    vi_sao: 'Giải thích được vì sao làm như vậy',
  }

  return (
    <div className={`card plum pop teach-back-box ${tbState === 'recording' ? 'teach-back-recording' : ''}`} style={{ border: '2px solid var(--plum)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span className="pill p">🎓 Con dạy lại {parent.toLowerCase()}</span>
        {round > 1 && <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--plum)' }}>Vòng {round}</span>}
      </div>

      <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--plum-deep)', margin: '4px 0 10px', lineHeight: 1.45 }}>
        {problem?.teachBack || 'Nếu lần sau gặp dạng bài này, con sẽ làm bước nào trước?'}
      </div>

      {tbState === 'idle' && (
        <div>
          <p style={{ fontSize: 13, color: 'var(--c-text-2)', margin: '0 0 12px', lineHeight: 1.45 }}>
            Khuyến khích con nói tự nhiên trong 30-60 giây. AI sẽ lắng nghe và đối chiếu 4 tiêu chí sư phạm để mẹ đánh giá!
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              className="btn solid"
              data-testid="tb-record-btn"
              style={{
                width: '100%',
                background: 'var(--c-primary, #7C3AED)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '12px',
                fontWeight: 800,
                fontSize: 14,
              }}
              onClick={startRecording}
            >
              <span style={{ fontSize: 18 }}>🎙️</span> Bấm để {child?.name || 'con'} giảng lại
            </button>
            {canUseSample && (
              <button
                className="btn soft"
                data-testid="tb-sample-btn"
                style={{ width: '100%', fontSize: 12.5, padding: '8px', color: 'var(--c-text-2)' }}
                onClick={applySample}
              >
                🎧 Dùng lời giảng mẫu (bài đang học)
              </button>
            )}
          </div>
        </div>
      )}

      {tbState === 'recording' && (
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div className="recording-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="recording-dot" />
              <span style={{ fontSize: 13, fontWeight: 800, color: '#DC2626' }}>
                Đang nghe {child?.name || 'con'} nói...
              </span>
            </div>
            <div className="audio-waves">
              <div className="audio-wave-bar" style={{ animationDelay: '0.1s' }} />
              <div className="audio-wave-bar" style={{ animationDelay: '0.3s' }} />
              <div className="audio-wave-bar" style={{ animationDelay: '0.2s' }} />
              <div className="audio-wave-bar" style={{ animationDelay: '0.4s' }} />
              <div className="audio-wave-bar" style={{ animationDelay: '0.15s' }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#DC2626', fontVariantNumeric: 'tabular-nums' }}>
              00:{recordSec < 10 ? `0${recordSec}` : recordSec} / 01:00
            </span>
          </div>
          <button
            className="btn solid"
            style={{ width: '100%', background: '#DC2626', color: '#fff', fontWeight: 800, padding: '12px' }}
            onClick={stopRecording}
          >
            ⏹️ Dừng ghi âm & AI chấm lời giảng
          </button>
        </div>
      )}

      {tbState === 'transcribing' && (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>🎧</div>
          <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--c-text)', margin: 0 }}>
            AI đang lắng nghe và bóc băng lời con nói...
          </p>
        </div>
      )}

      {tbState === 'review' && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--plum)', textTransform: 'uppercase', marginBottom: 6 }}>
            Lời con kể lại (mẹ có thể sửa nhanh nếu mic nghe nhầm):
          </div>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={3}
            style={{
              width: '100%',
              padding: 10,
              borderRadius: 10,
              border: '1.5px solid var(--c-line)',
              fontSize: 13.5,
              lineHeight: 1.45,
              marginBottom: 10,
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn soft"
              style={{ flex: 1, fontSize: 12.5 }}
              onClick={() => setTbState('idle')}
            >
              🔄 Kể lại
            </button>
            <button
              className="btn solid"
              data-testid="tb-submit-btn"
              style={{ flex: 2, background: 'var(--c-primary, #7C3AED)', color: '#fff', fontWeight: 800 }}
              onClick={submitGrade}
            >
              Chấm bài giảng này ›
            </button>
          </div>
        </div>
      )}

      {tbState === 'grading' && (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>🔍</div>
          <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--c-text)', margin: 0 }}>
            AI đang so khớp 4 tiêu chí rubric & kiểm tra trích dẫn thật...
          </p>
        </div>
      )}

      {tbState === 'result' && tbResult && (
        <div>
          {/* 4 tiêu chí rubric */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--plum)', textTransform: 'uppercase', marginBottom: 6 }}>
              Rubric 4 tiêu chí đối chiếu:
            </div>
            {(tbResult.tieu_chi || []).map((tc) => (
              <div key={tc.ma} className={`criterion-row ${tc.dat ? 'pass' : 'fail'}`}>
                <span style={{ fontSize: 16 }}>{tc.dat ? '✅' : '🟡'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-text)' }}>
                    {CRITERIA_MAP[tc.ma] || tc.ma}
                  </div>
                  {tc.trich && (
                    <span className="criterion-quote">
                      “{tc.trich}”
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Lời khen cho con */}
          {tbResult.loi_khen_cho_con && (
            <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '10px 12px', borderRadius: 10, marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#047857', textTransform: 'uppercase' }}>
                🌟 Lời khen con:
              </div>
              <div style={{ fontSize: 13, color: '#065F46', fontWeight: 600, marginTop: 2 }}>
                {tbResult.loi_khen_cho_con}
              </div>
            </div>
          )}

          {/* Đề xuất mức hiểu bài của AI */}
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '10px 12px', borderRadius: 10, marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--c-text-2)', textTransform: 'uppercase' }}>
              AI đề xuất mức hiểu bài:
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--c-text)', marginTop: 2 }}>
              {tbResult.muc_de_xuat === 'self' && '🌟 Tự chủ (Đạt cả 4 tiêu chí)'}
              {tbResult.muc_de_xuat === 'hint' && '🟡 Cần gợi ý (Đạt 2-3 tiêu chí)'}
              {tbResult.muc_de_xuat === 'guided' && '🔴 Cần hướng dẫn (Đạt 0-1 tiêu chí)'}
            </div>
          </div>

          {/* Gợi ý hỏi thêm vòng 2 nếu chưa đạt vi_sao */}
          {tbResult.cau_hoi_them && round === 1 && (
            <div style={{ background: '#FEF3C7', border: '1.5px solid #FCD34D', padding: '10px 12px', borderRadius: 10, marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#92400E', textTransform: 'uppercase' }}>
                💡 Gợi ý để {parent.toLowerCase()} hỏi thêm con:
              </div>
              <div style={{ fontSize: 13, color: '#78350F', fontWeight: 700, margin: '4px 0 8px' }}>
                "{tbResult.cau_hoi_them}"
              </div>
              <button
                className="btn soft"
                style={{ width: '100%', fontSize: 12, padding: '6px', background: '#FFF' }}
                onClick={() => {
                  setRound(2)
                  setTbState('idle')
                }}
              >
                🎙️ Hỏi thêm và ghi âm tiếp (Vòng 2)
              </button>
            </div>
          )}

          {/* Mẹ luôn là người chốt mức cuối cùng */}
          <div style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--plum)', textTransform: 'uppercase', marginBottom: 6 }}>
            {parent} chốt mức hiểu bài hôm nay:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {TEACH_BACK_OPTIONS.map((o) => (
              <button
                key={o.v}
                className={`btn ${currentChoice === o.v ? 'solid' : 'soft'}`}
                style={{
                  width: '100%',
                  background: currentChoice === o.v ? 'var(--plum)' : '#fff',
                  color: currentChoice === o.v ? '#fff' : 'var(--plum-deep)',
                  border: currentChoice === o.v ? 'none' : '1.5px solid var(--plum-line)',
                  fontSize: 13,
                  fontWeight: currentChoice === o.v ? 800 : 600,
                  padding: '8px 12px',
                  textAlign: 'left',
                }}
                onClick={() => onPickChoice(o.v, tbResult?.teach_back_id)}
              >
                {o.e} {o.t}
              </button>
            ))}
          </div>
        </div>
      )}

      {tbState === 'idle' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--c-text-2)', textTransform: 'uppercase' }}>
            Hoặc {parent.toLowerCase()} tự chấm nhanh không cần ghi âm:
          </div>
          {TEACH_BACK_OPTIONS.map((o) => (
            <button
              key={o.v}
              className={`btn ${currentChoice === o.v ? 'solid' : 'soft'}`}
              style={{
                width: '100%',
                background: currentChoice === o.v ? 'var(--plum)' : '#fff',
                color: currentChoice === o.v ? '#fff' : 'var(--plum-deep)',
                border: currentChoice === o.v ? 'none' : '1.5px solid var(--plum-line)',
                fontSize: 13,
                fontWeight: currentChoice === o.v ? 800 : 600,
                padding: '8px 12px',
                textAlign: 'left',
              }}
              onClick={() => onPickChoice(o.v)}
            >
              {o.e} {o.t}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ============================================================
   7. KẾT THÚC
   ============================================================ */
export function Done() {
  const { S, problem, stats, patch, setStats, go, openSheet, toast, boom, tracker } = useContext(AppCtx)
  const child = S.children.find((c) => c.id === S.activeId)
  // Đợt 15 P1: chỉ còn 1 bộ đánh giá (mẹ chốt mức hiểu bài trong thẻ Con dạy lại)
  const result = S.flow.result || (S.flow.teachBack === 'guided' ? 'weak' : S.flow.teachBack ? 'ok' : null)

  // Khởi tạo các State trước useMemo để tránh lỗi Temporal Dead Zone (Cannot access 'adaptiveBrother' before initialization)
  const [stkIdx, setStkIdx] = useState(0)
  const [pickedTrait, setPickedTrait] = useState(null)
  const [isCoachOpen, setIsCoachOpen] = useState(true)
  const [adaptiveBrother, setAdaptiveBrother] = useState(null)
  const [loadingBrother, setLoadingBrother] = useState(false)

  // Đợt 19 Chặng 2: Tính huy hiệu Gấu gợi ý theo hành động của con
  const recentBadges2Weeks = useMemo(() => {
    const twoWeeksAgo = Date.now() - 14 * 86400000
    return (stats?.stickerHistory || [])
      .filter((s) => !s.sample && (Number(s.timestamp) || 0) >= twoWeeksAgo)
      .map((s) => s.trait)
  }, [stats?.stickerHistory])

  const sessionData = useMemo(() => {
    const steps = (problem?.steps || []).map((st, idx) => ({
      stepNo: idx + 1,
      skill: st.skill || (idx === 0 ? 'doc_hieu_de' : idx === (problem.steps.length - 1) ? 'kiem_tra_lai' : 'tinh_toan'),
      stuckCount: S?.flow?.step === idx ? (S?.flow?.stuck || 0) : 0,
      usedStuck: S?.flow?.step === idx && Boolean(S?.flow?.stuck),
      usedMicroStep: Boolean(st.usedMicroStep),
      selfSolved: Boolean(st.selfSolved !== false),
      revealedAnswer: Boolean(S?.flow?.unlocked),
    }))

    return {
      steps,
      durationMinutes: 15,
      maxInactivityMinutes: 0,
      stepsSeamless: true,
      teachBackOwnWay: S?.flow?.teachBack === 'ok',
      didBrotherProblem: Boolean(adaptiveBrother || problem?.brotherProblem || problem?.bai_anh_em),
      playedMiniGame: Boolean(problem?.fiveMinGame),
      aiRecognizedAlternativeWay: Boolean(problem?.alternativeWayRecognized),
      isCheckWork: Boolean(problem?.ocr && !problem?.steps),
      presentationClean: true,
    }
  }, [problem, S?.flow, adaptiveBrother])

  const suggestedBadge = useMemo(() => {
    return computeSuggestedBadge({
      childName: child?.name || 'Con',
      sessionData,
      recentBadges2Weeks,
    })
  }, [child?.name, sessionData, recentBadges2Weeks])

  const coachAdviceEnabled = isCoachAdviceEnabled(child)
  const coachAdviceList = useMemo(() => {
    return computeCoachAdvice({
      sessionData,
      child,
      extra: {
        stepRevealTimes: S?.flow?.stepRevealTimes || [],
        calmClickCount: S?.flow?.calmCount || S?.flow?.calmClickCount || 0,
        durationMinutes: S?.flow?.durationMinutes || 12,
        teachBackLevel: S?.flow?.teachBack === "ok" ? "self" : (S?.flow?.teachBack === "guided" ? "guided" : "hint"),
      }
    })
  }, [sessionData, child, S?.flow])

  const currentTrait = pickedTrait || suggestedBadge.trait
  const currentBadgeInfo = TRAIT_BADGE_INFO[currentTrait] || TRAIT_BADGE_INFO['Kiên nhẫn']
  const isSuggested = currentTrait === suggestedBadge.trait
  const currentReason = isSuggested ? suggestedBadge.reason : `${child?.name || 'Con'} được chọn huy hiệu ${currentTrait}.`
  const stkCur = AVAILABLE_STICKERS[Math.min(stkIdx, AVAILABLE_STICKERS.length - 1)] || AVAILABLE_STICKERS[0]
  const stkOwned = (stats?.stickersList || []).filter((x) => x.id === stkCur.id || x.e === stkCur.e || x.name === stkCur.n).length
  const hadStuckStep = Boolean(S.flow?.stuck > 0 || S.flow?.teachBack === 'hint' || S.flow?.teachBack === 'guided')
  const stuckSkill = S.flow?.lastStuckSkill || 'tinh_toan'

  useEffect(() => {
    let cancelled = false
    if (hadStuckStep) {
      setLoadingBrother(true)
      fetchAiAdaptiveBrother({
        problemText: problem.text || problem.problem_text || '',
        stuckSkill,
        grade: child?.grade || 3,
        childName: child?.name || 'Con',
      })
        .then((res) => {
          if (!cancelled && res && res.ok && res.brother) {
            setAdaptiveBrother(res.brother)
          }
        })
        .catch(() => {})
        .finally(() => {
          if (!cancelled) setLoadingBrother(false)
        })
    }
    return () => {
      cancelled = true
    }
  }, [hadStuckStep, stuckSkill, child?.name, child?.grade, problem.text, problem.problem_text])

  const pickSticker = (e) => {
    let found
    let customSource = 'chon_khac'
    let customReason = 'Con làm bài rất nỗ lực'

    if (e && typeof e === 'object') {
      found = { ...e }
      if (e.source) customSource = e.source
      if (e.reason) customReason = e.reason
    } else {
      found = AVAILABLE_STICKERS.find((s) => s.id === e || s.e === e) || {
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
    }

    soundPop(600)
    emitMotion('badge_given', { sticker: found })
    soundSuccess()
    boom()
    buddyReact('cheer', `Tuyệt vời! ${child.name} nhận huy hiệu ${found.n}! 🎉`, 3000)

    if (problem?.isSample) {
      toast('Đang dùng thử: đã tặng huy hiệu động viên con! ⭐')
      return
    }

    const oldList = stats.stickersList || []
    const newList = [...oldList, { ...found, when: 'Hôm nay' }]

    // 📈 Lưu Big Data Lịch sử Sticker vĩnh viễn (không bao giờ mất khi đổi quà)
    const oldHistory = stats.stickerHistory || []
    const newHistoryItem = {
      id: 'h_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      stickerId: found.id || found.stickerId || 's1',
      name: found.n || found.name || 'Huy hiệu',
      trait: found.trait || 'Kiên nhẫn',
      fa: found.fa || 'fa-solid fa-award',
      color: found.color || '#2a78d6',
      subject: problem?.mon || 'Toán',
      problemType: problem?.dang_bai || problem?.type || 'Bài tập rèn luyện',
      source: customSource,
      reason: customReason,
      timestamp: Date.now(),
      dateStr: new Date().toLocaleDateString('vi-VN'),
    }
    const newHistory = [...oldHistory, newHistoryItem]

    setStats({ stickers: newList.length, stickersList: newList, stickerHistory: newHistory })

    // Đợt 19 Chặng 1 & 2: Lưu bảng badge_events với source (goi_y / chon_khac) và reason có số thật
    recordBadgeEvent({
      id: newHistoryItem.id,
      child_id: child.id,
      session_id: S?.currentSessionId || null,
      trait: newHistoryItem.trait,
      sticker_id: newHistoryItem.stickerId,
      subject: newHistoryItem.subject,
      problem_type: newHistoryItem.problemType,
      source: customSource,
      reason: customReason,
      created_at: new Date(newHistoryItem.timestamp).toISOString(),
      timestamp: newHistoryItem.timestamp,
    }).catch(() => {})
    soundSuccess()
    boom()
    buddyReact('cheer', `Tuyệt vời! ${child.name} nhận huy hiệu ${found.n}! 🎉`, 3000)
    if (newList.length >= 10) {
      setTimeout(() => {
        soundFanfare()
        boom()
        openSheet('redeem')
      }, 700)
    }
  }

  const saveResult = () => {
    soundPop(600)
    emitMotion('day_logged')
    const topicName = problem?.dang_bai || problem?.type || (problem?.ocr ? problem.ocr.slice(0, 40) : 'Bài tập rèn luyện')
    const isSample = Boolean(problem?.isSample)

    patch((prev) => {
      const activeId = prev.activeId
      const prevStats = { ...(prev.stats || {}) }
      const cStats = { ...(prevStats[activeId] || {}) }

      const oldHist = Array.isArray(cStats.history) ? [...cStats.history] : []
      const txt = `${topicName} · ${result === 'weak' ? 'còn vướng' : 'làm được'}${isSample ? ' [Bài mẫu]' : ''}`
      const hist = [{ txt, when: 'Hôm nay', timestamp: Date.now() }, ...oldHist]

      let weak = Array.isArray(cStats.weak) ? [...cStats.weak] : []
      let strong = Array.isArray(cStats.strong) ? [...cStats.strong] : []

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

      const sessionsMom = (cStats.sessionsMom || 0) + (prev.parent === 'Mẹ' ? 1 : 0)
      const sessionsDad = (cStats.sessionsDad || 0) + (prev.parent === 'Bố' ? 1 : 0)

      let studyLog = Array.isArray(cStats.studyLog) ? [...cStats.studyLog] : []
      // Chỉ tính bài thật vào lọ kẹo/dấu chân, bài mẫu không tính
      if (!isSample) {
        const now = Date.now()
        const newEntry = {
          id: 'sess_' + now + '_' + Math.random().toString(36).slice(2, 6),
          ts: now,
          dateKey: getStudyDateKey(now),
          problemType: topicName,
          totalSteps: problem?.steps?.length || 4,
          selfSteps: problem?.steps?.length || 4,
          teachBack: prev.flow?.teachBack || null,
          minutes: 15,
          partial: false,
        }
        studyLog = [newEntry, ...studyLog]
      }

      return {
        ...prev,
        stats: {
          ...prevStats,
          [activeId]: {
            ...cStats,
            history: hist,
            weak,
            strong,
            sessionsMom,
            sessionsDad,
            studyLog,
          },
        },
        flow: {
          ...prev.flow,
          step: 0,
          stuck: 0,
          unlocked: false,
          result: null,
          teachBack: null,
        },
      }
    })

    if (S.assignmentItemId || problem?.isTeacherAssigned) {
      const sessId = S.currentSessionId || S.flow?.sessionId || S.flow?.id
      if (sessId) {
        updateSession(sessId, {
          completed: 1,
          endedAt: new Date().toISOString(),
          stuckCount: S.flow?.stuck || 0,
          teachBackRating: S.flow?.teachBack || 'self'
        }).then(() => {
          try {
            window.dispatchEvent(new CustomEvent('kem_assignment_updated'))
          } catch {}
        }).catch(() => {})
      }
      try {
        window.dispatchEvent(new CustomEvent('kem_assignment_updated'))
      } catch {}
    }

    if (isSample) {
      toast(`Đã lưu bài mẫu vào sổ của ${child.name} (bài mẫu không tính vào lọ kẹo) 📖`)
    } else {
      toast(`Đã lưu và cộng 1 tối học vào lọ kẹo của ${child.name}! 🎉`)
    }
    go('home')
  }

  /* Feature 4: Con dạy lại mẹ — đo mức độ tự chủ (Metacognition & Peer Teaching) */
  const TEACH_BACK_OPTIONS = [
    { v: 'ok', e: seasonLevelEmoji('ok', '✅'), t: 'Con tự làm được' },
    { v: 'hint', e: seasonLevelEmoji('hint', '🟡'), t: 'Con cần gợi ý' },
    { v: 'guided', e: seasonLevelEmoji('guided', '🔴'), t: `${S.parent} phải hướng dẫn nhiều` },
  ]
  const pickTeachBack = (v) => {
    soundPop(500)
    const opt = TEACH_BACK_OPTIONS.find((o) => o.v === v)
    patch((prev) => {
      const activeId = prev.activeId
      const prevStats = { ...(prev.stats || {}) }
      const cStats = { ...(prevStats[activeId] || {}) }
      const oldHist = Array.isArray(cStats.history) ? [...cStats.history] : []
      const hasTeachBack = oldHist.some((h) => h.txt && h.txt.startsWith('Con dạy lại mẹ'))
      const updatedHist = hasTeachBack
        ? oldHist
        : [{ txt: `Con dạy lại mẹ: ${opt.t.toLowerCase()}`, when: 'Hôm nay', timestamp: Date.now() }, ...oldHist]

      return {
        ...prev,
        flow: { ...prev.flow, teachBack: v },
        stats: {
          ...prevStats,
          [activeId]: {
            ...cStats,
            history: updatedHist,
          },
        },
      }
    })
    toast(`Đã lưu: ${opt.t} 💾`)
  }

  return (
    <div className="done-container-km" style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: 80 }}>
      {/* TopBar T4 */}
      <TopBarT4
        title="Xong bài rồi! 🎉"
        stepText="Hoàn thành"
        onBack={() => go('home')}
        onOpenCalm={() => openSheet('calm')}
      />

      {/* 1. PHẦN CHO CON */}
      <div
        className="card-km"
        style={{
          padding: '18px 16px',
          background: 'var(--c-surface)',
          borderRadius: 22,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
        }}
        data-testid="done-section-kid"
      >
        <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: '.06em', color: 'var(--c-sub)', textTransform: 'uppercase' }}>
          PHẦN CHO CON
        </span>

        <div className="mascot-bounce-km">
          <ThemeBuddy state={S.flow?.teachBack ? 'love' : 'cheer'} size={80} />
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 800, margin: '2px 0 0', color: 'var(--c-text)', fontFamily: 'var(--font-head)' }}>
          {S.flow?.teachBack ? `Thương ${child.name} ghê! 💕` : `Hoan hô ${child.name}! 🎉`}
        </h2>
        <p style={{ fontSize: 13.5, color: 'var(--c-sub)', margin: 0 }}>
          Con đã xuất sắc vượt qua các bậc bài tập tối nay!
        </p>

        {/* CHỌN VÀ TẶNG HUY HIỆU Ở MỘT CHỖ DUY NHẤT */}
        <div
          style={{
            width: '100%',
            background: 'var(--c-bg)',
            border: '1px solid var(--c-line)',
            borderRadius: 16,
            padding: '12px 14px',
            marginTop: 4,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
          data-testid="card-suggested-badge"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 900, color: 'var(--c-primary)' }}>
              HUY HIỆU NỖ LỰC
            </span>
            <span style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--c-sub)' }}>
              Đã có {stats.stickers}/10 ⭐
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left' }}>
            <span
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: currentBadgeInfo.color,
                color: '#fff',
                display: 'grid',
                placeItems: 'center',
                fontSize: 22,
                flexShrink: 0,
              }}
            >
              {currentBadgeInfo.icon}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <b style={{ fontSize: 14.5, color: 'var(--c-text)', display: 'block' }}>
                {currentBadgeInfo.name} ({currentBadgeInfo.trait})
              </b>
              <p style={{ fontSize: 12, color: 'var(--c-sub)', margin: '2px 0 0', lineHeight: 1.35 }}>
                {currentReason}
              </p>
            </div>
          </div>

          {/* 4 Chip chọn nhanh phẩm chất khác */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
            {['Kiên nhẫn', 'Sáng tạo', 'Tập trung', 'Tỉ mỉ'].map((tr) => {
              const active = currentTrait === tr
              const info = TRAIT_BADGE_INFO[tr]
              return (
                <button
                  key={tr}
                  type="button"
                  className={`btn-km btn-km-s ${active ? 'btn-km-primary' : 'btn-km-secondary'}`}
                  style={{ minHeight: 30, padding: '0 4px', fontSize: 11, fontWeight: 800 }}
                  onClick={() => {
                    soundPop(450)
                    setPickedTrait(tr)
                  }}
                  data-testid={`btn-pick-trait-${tr}`}
                >
                  {info.icon} {tr}
                </button>
              )
            })}
          </div>

          <button
            type="button"
            className="btn-km btn-km-m btn-km-ok"
            style={{ width: '100%', minHeight: 46, fontSize: 14 }}
            onClick={() => {
              const found = AVAILABLE_STICKERS.find((s) => s.id === currentBadgeInfo.stickerId || s.trait === currentTrait) || currentBadgeInfo
              pickSticker({
                ...found,
                id: currentBadgeInfo.stickerId,
                n: currentBadgeInfo.name,
                trait: currentBadgeInfo.trait,
                color: currentBadgeInfo.color,
                source: isSuggested ? 'goi_y' : 'chon_khac',
                reason: currentReason,
              })
            }}
            data-testid="btn-grant-suggested-badge"
          >
            <span>Tặng huy hiệu {currentBadgeInfo.name}</span>
            <span>⭐</span>
          </button>
        </div>
      </div>

      {/* 2. PHẦN CHO MẸ */}
      <div
        className="card-km"
        style={{
          padding: '16px',
          background: 'var(--c-surface)',
          borderRadius: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
        data-testid="done-section-parent"
      >
        <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: '.06em', color: 'var(--c-sub)', textTransform: 'uppercase' }}>
          DÀNH CHO {S.parent.toUpperCase()}
        </span>

        {/* Tự chấm nhanh: nút gạt 3 mục */}
        <div>
          <label style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--c-text)', display: 'block', marginBottom: 6 }}>
            Mức độ tự chủ của con hôm nay:
          </label>
          <div className="seg-km" style={{ width: '100%', height: 36 }}>
            {[
              { v: 'ok', label: 'Tự làm được' },
              { v: 'hint', label: 'Cần gợi ý' },
              { v: 'guided', label: 'Cần hướng dẫn' },
            ].map((opt) => {
              const active = (S.flow.teachBack || result) === opt.v
              return (
                <button
                  key={opt.v}
                  type="button"
                  className={`seg-km-btn ${active ? 'active' : ''}`} aria-pressed={active ? "true" : "false"}
                  style={{ height: 32, fontSize: 12 }}
                  onClick={() => pickTeachBack(opt.v)}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Góp ý của Gấu: 1 dòng mở được */}
        {coachAdviceEnabled && coachAdviceList.length > 0 && (
          <div
            style={{
              background: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: 12,
              padding: '10px 12px',
            }}
          >
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => setIsCoachOpen(!isCoachOpen)}
            >
              <span style={{ fontSize: 13, fontWeight: 800, color: '#92400E' }}>
                🐻 Gấu góp ý cách kèm ({coachAdviceList.length} ý)
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#B45309' }}>
                {isCoachOpen ? 'Thu gọn ▲' : 'Xem ngay ▼'}
              </span>
            </div>
            {isCoachOpen && (
              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {coachAdviceList.map((adv, idx) => (
                  <div key={idx} style={{ fontSize: 12.5, color: '#78350F', lineHeight: 1.35 }}>
                    <b>{adv.icon} {adv.action}:</b> {adv.message}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. PHẦN LÀM TIẾP */}
      <div
        className="card-km"
        style={{
          padding: '16px',
          background: 'var(--c-surface)',
          borderRadius: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
        data-testid="done-section-next"
      >
        <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: '.06em', color: 'var(--c-sub)', textTransform: 'uppercase' }}>
          LÀM TIẾP
        </span>

        {/* Bài anh em */}
        {(() => {
          const bro = adaptiveBrother || problem.brotherProblem || problem.bai_anh_em
          if (!bro) return null
          const deText = bro.de || bro.text || ''
          return (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
                padding: '10px 12px',
                borderRadius: 12,
                background: 'var(--c-bg)',
                border: '1px solid var(--c-line)',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <b style={{ fontSize: 13.5, color: 'var(--c-text)', display: 'block' }}>🎯 Bài anh em (5 phút)</b>
                <span style={{ fontSize: 12, color: 'var(--c-sub)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                  {deText}
                </span>
              </div>
              <button
                type="button"
                className="btn-km btn-km-s btn-km-primary"
                onClick={() => {
                  patch({
                    problem: {
                      text: deText,
                      steps: [
                        { question: 'Con đọc kỹ đề bài mới nhé?', answer: 'Đọc kỹ đề', praise: 'Giỏi lắm!' },
                        { question: 'Bài này mình cần làm phép tính gì con nhỉ?', answer: bro.dap_an_cho_me || 'Phép tính', praise: 'Đúng hướng rồi!' },
                        { question: 'Con tính ra kết quả là bao nhiêu?', answer: bro.dap_an_cho_me || 'Đáp số', praise: 'Xuất sắc!' },
                      ],
                      brotherProblem: null,
                    },
                    flow: { step: 0, stuck: 0, unlocked: false },
                  })
                  go('explain')
                }}
              >
                Làm thử ›
              </button>
            </div>
          )
        })()}

        {/* Chấm vở */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            padding: '10px 12px',
            borderRadius: 12,
            background: 'var(--c-bg)',
            border: '1px solid var(--c-line)',
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <b style={{ fontSize: 13.5, color: 'var(--c-text)', display: 'block' }}>📝 Chấm vở con đã viết</b>
            <span style={{ fontSize: 12, color: 'var(--c-sub)' }}>Chụp vở để AI tìm bước sai cho con tự sửa</span>
          </div>
          <button
            type="button"
            className="btn-km btn-km-s btn-km-secondary"
            onClick={() => {
              patch({
                checkWorkInit: {
                  sessionId: S.sessionId || `sess_${Date.now()}`,
                  problemText: problem?.ocr || problem?.text || '',
                },
              })
              go('check')
            }}
          >
            Chấm vở ›
          </button>
        </div>

        {/* Con giảng lại */}
        {!S.flow?.teachBack && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
              padding: '10px 12px',
              borderRadius: 12,
              background: 'var(--c-bg)',
              border: '1px solid var(--c-line)',
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <b style={{ fontSize: 13.5, color: 'var(--c-text)', display: 'block' }}>🎓 Con dạy lại mẹ</b>
              <span style={{ fontSize: 12, color: 'var(--c-sub)' }}>Lắng nghe con giảng lại bài vừa giải</span>
            </div>
            <button
              type="button"
              className="btn-km btn-km-s btn-km-secondary"
              onClick={() => openSheet('teachBack')}
            >
              Nghe con ›
            </button>
          </div>
        )}
      </div>

      {/* Nút dính đáy: Lưu & về trang chủ */}
      <div
        className="bottom-action-bar-km"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '10px 16px',
          background: 'var(--c-surface, #fff)',
          borderTop: '1px solid var(--c-line, #EADFCF)',
          zIndex: 90,
          boxShadow: '0 -4px 12px rgba(0,0,0,0.06)',
        }}
      >
        <button
          type="button"
          className="btn-km btn-km-l btn-km-primary"
          style={{ width: '100%' }}
          onClick={saveResult}
        >
          Lưu & về trang chủ
        </button>
      </div>
    </div>
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

function SnapToyCameraSection() {
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
    // Prompt 22 - 0.6: Tab Trò chơi KHÔNG tự bật camera khi mở. Chỉ bật khi mẹ bấm Chụp / Mở máy ảnh
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
      toast('Camera chưa sẵn sàng, chọn đồ chơi bên dưới nhé 📷')
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
        {!shot && !camOn && !camErr && (
          <div style={{ textAlign: 'center', padding: '24px 16px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }} data-testid="snap-toy-static-invite">
            <span style={{ fontSize: 52, marginBottom: 8 }}>🧸 📸 🧴</span>
            <b style={{ fontSize: 16, color: 'var(--c-text)', marginBottom: 4 }}>Chụp đồ vật quanh nhà</b>
            <p className="xs" style={{ color: 'var(--c-text-2)', maxWidth: 280, margin: '0 0 14px', lineHeight: 1.45 }}>
              Chụp cây lược, bút, chai lọ hoặc đồ chơi để AI gợi ý trò chơi học toán cùng con!
            </p>
            <button
              type="button"
              className="btn solid"
              onClick={startCamera}
              style={{ padding: '10px 22px', fontSize: 14, fontWeight: 800 }}
              data-testid="btn-start-camera"
            >
              📷 Bật máy ảnh chụp
            </button>
          </div>
        )}
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: (shot || !camOn) ? 'none' : 'block',
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
        {(camOn || shot) && (
          <div className="hint">
            {shot ? 'Đã chụp, AI đang phân tích đồ vật' : 'Chụp cây lược, bút, thước, chai lọ hoặc đồ vật bất kỳ'}
          </div>
        )}
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
          <div style={{ marginBottom: 8, fontSize: 14.5, color: 'var(--text)' }}>
            AI đoán đây là: <b style={{ color: 'var(--plum-deep)' }}>{detectedToy.n}</b>. Đúng chưa {S.parent.toLowerCase()}?
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
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <button
              className="btn solid"
              style={{ flex: 1, padding: '12px', fontSize: 14.5, fontWeight: 700 }}
              onClick={() => pick(detectedToy.n)}
            >
              ✅ Đúng rồi
            </button>
            <button
              className="btn ghost"
              style={{ flex: 1, padding: '12px', fontSize: 14, background: '#fff' }}
              onClick={() => setShowEditToy(!showEditToy)}
            >
              Chọn đồ khác
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
        {(stats.weak || []).map((w) => (
          <span key={w.n} className="sub">• {w.n}</span>
        ))}
      </div>
    </>
  )
}


export function SnapToy() {
  const { S, stats, go, openSheet, patch, session } = useContext(AppCtx)
  const child = S.children.find((c) => c.id === S.activeId) || S.children[0]
  const isTrial = Boolean(session?.isTrial)

  return (
    <GocChoiChung
      child={child}
      stats={stats}
      S={S}
      patch={patch}
      go={go}
      openSheet={openSheet}
      isTrial={isTrial}
      SnapToyLegacyComponent={SnapToyCameraSection}
    />
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
        <span className="sub">Hết giờ là dừng, khen con và nghỉ, đừng kéo dài thành cuộc chiến.</span>
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
          <span style={{ fontSize: 14 }}>
            {S.parent} có <b>{cfg.packs} bó bút</b>, mỗi bó có <b>{cfg.perPack} cây bút</b>. Hỏi có tất cả bao nhiêu cây bút?
          </span>

          {/* Visual Pen Bundles · Đợt 15 · 6.5: lưới tự xuống dòng trong khung */}
          <div className="pen-bundles">
            {Array.from({ length: cfg.packs }).map((_, pIdx) => (
              <button
                type="button"
                key={pIdx}
                className={`pen-bundle ${activeBundle === pIdx ? 'on' : ''}`}
                aria-pressed={activeBundle === pIdx}
                aria-label={`Bó ${pIdx + 1}: ${cfg.perPack} cây bút`}
                onClick={() => {
                  soundPop(500 + pIdx * 100)
                  setActiveBundle(pIdx)
                }}
              >
                <div className="pen-lbl" style={{ marginBottom: 4 }}>Bó {pIdx + 1}</div>
                <div className="pens" aria-hidden="true">
                  {Array.from({ length: cfg.perPack }).map((_, i) => (
                    <span key={i}>✏️</span>
                  ))}
                </div>
                <div className="pen-lbl" style={{ marginTop: 4 }}>{cfg.perPack} cây</div>
              </button>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginBottom: 8, fontSize: 14, color: 'var(--c-text-2, var(--muted))' }}>
            💡 Phép tính: <b>{cfg.perPack} × {cfg.packs} = ?</b>
          </div>

          {!role ? (
            <>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="field"
                  style={{ flex: 1, minWidth: 0 }}
                  inputMode="numeric"
                  aria-label="Con đoán tổng số bút"
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
              <div className="pill-row" style={{ marginTop: 8 }}>
                <button type="button" className={`pill-btn ${cfg.mode === 'Dễ hơn' ? 'on' : ''}`} aria-pressed={cfg.mode === 'Dễ hơn'} onClick={() => setPackMode('Dễ hơn')}>Dễ hơn · 2 bó</button>
                <button type="button" className={`pill-btn ${cfg.mode === 'Khó hơn' ? 'on' : ''}`} aria-pressed={cfg.mode === 'Khó hơn'} onClick={() => setPackMode('Khó hơn')}>Khó hơn · 4 bó</button>
                <button type="button" className="pill-btn" onClick={() => { setRole(true); setQuiz({ a: 3 + Math.floor(Math.random() * 5), b: 2 + Math.floor(Math.random() * 6) }) }}>
                  🔄 Đổi vai: con đố {S.parent.toLowerCase()}
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
      toast('Đúng rồi! Giỏi quá, đổi vai nhé 🎉')
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
          {fb === 'no' && <div className="card sun pop"><span>Chưa đúng. Đếm từng tầng một xem sao, {S.parent.toLowerCase()} không vội đâu.</span></div>}
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
      toast('Chưa nối được, chọn 2 ô cùng màu có đường đi (≤ 2 góc) nhé')
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
      <span className="sub">Đã nối {moves} cặp. Không vội, nhìn kỹ đường đi nhé.</span>
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
        Bên dưới là <b>số hoặc chữ cái</b>. Bấm lật 2 lá, giống nhau thì giữ lại. Tìm đủ 12 cặp là thắng!
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
      <span className="sub">Nhớ vị trí các lá đã lật, {S.parent.toLowerCase()} có thể chơi cùng con để xem ai nhớ lâu hơn.</span>
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
      toast('Hết 4 lượt, so kết quả nhé! 🎉')
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
          <b style={{ fontSize: 17 }}>{elapsed.toFixed(2)}s, lệch {Math.abs(elapsed - parseFloat(target)).toFixed(2)}s</b>
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
      toast('Chưa đúng, thử lại nhé 💪')
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
      toast('Chưa đúng, đếm lại từng bát nhé')
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
const LOI_LABEL = {
  doc_de: 'đọc đề',
  chon_phep_tinh: 'chọn phép tính',
  tinh_nham: 'tính nhầm',
  thieu_don_vi: 'thiếu đơn vị',
  trinh_bay: 'trình bày',
  chua_lam_xong: 'chưa làm xong',
}

function WeeklyAiCards({ stats, childName }) {
  const [safety, setSafety] = useState(null)
  useEffect(() => {
    let off = false
    getSafetySummary('7d')
      .then((r) => {
        if (!off && r && r.ok !== false) setSafety(r)
      })
      .catch(() => {})
    return () => {
      off = true
    }
  }, [])
  const week = (stats?.studyLog || []).filter((e) => e && e.ts && getWeekLabel(e.ts) === 'Tuần này')
  const teachBacks = week.filter((e) => e.kind !== 'check' && e.teachBack).length
  const selfFixedLocal = week.filter((e) => e.kind === 'check')
  const selfFixed = Math.max(selfFixedLocal.length, Number(safety?.work_checks?.self_fixed || 0))
  const errCount = {}
  selfFixedLocal.forEach((e) => {
    if (e.errorType) errCount[e.errorType] = (errCount[e.errorType] || 0) + 1
  })
  const topErr = Object.entries(errCount).sort((a, b) => b[1] - a[1])[0]?.[0]
  const blocked = Number(safety?.total_guard_interventions || 0)
  const leaked = Number(safety?.guard_events?.leaked || 0)
  const reported = Number(safety?.feedback?.total || 0)
  const tile = { flex: 1, minWidth: 0, background: 'var(--c-surface-2)', borderRadius: 14, padding: '10px 10px' }
  const num = { fontSize: 22, fontWeight: 900, color: 'var(--c-text)', lineHeight: 1.1 }
  const cap = { fontSize: 13, color: 'var(--c-text)', marginTop: 2, lineHeight: 1.35 }
  return (
    <div className="card" data-testid="weekly-ai-cards">
      <span className="lbl plum">Tuần này cùng AI</span>
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={tile} data-testid="weekly-teachback">
          <div style={num}>{teachBacks}</div>
          <div style={cap}>lần {childName} giảng lại cho {'bố mẹ'}</div>
        </div>
        <div style={tile} data-testid="weekly-selffixed">
          <div style={num}>{selfFixed}</div>
          <div style={cap}>lỗi tự sửa được{topErr ? ` · hay gặp: ${LOI_LABEL[topErr] || topErr}` : ''}</div>
        </div>
      </div>
      <div style={{ ...tile, marginTop: 8 }} data-testid="weekly-safety">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 20 }}>🛡️</span>
            <b style={{ fontSize: 14, color: 'var(--c-text)' }}>An toàn AI 7 ngày</b>
          </div>
          <span style={{ fontSize: 12, color: 'var(--c-text-2)' }}>{isTrialActive() ? 'Số mẫu' : 'Số thật từ hệ thống'}</span>
        </div>
        <div className="facts-grid two-cols">
          <div>
            <span>Phép tính sai đã bắt</span>
            <b>{isTrialActive() ? 3 : (safety?.dot18_safety?.phep_tinh_sai_da_bat ?? 0)}</b>
            <em>trước khi tới mẹ</em>
          </div>
          <div>
            <span>Bậc bộ chặn sửa lại</span>
            <b>{isTrialActive() ? 2 : (safety?.dot18_safety?.bac_bo_chan_sua_lai ?? blocked)}</b>
            <em>sửa đúng bậc học</em>
          </div>
          <div>
            <span>Câu nhỏ hơn đã tạo</span>
            <b>{isTrialActive() ? 5 : (safety?.dot18_safety?.cau_nho_hon_da_tao ?? 0)}</b>
            <em>chia nhỏ khi con kẹt</em>
          </div>
          <div>
            <span>Lần Gấu nghe con</span>
            <b>{isTrialActive() ? 8 : (safety?.dot18_safety?.so_lan_gau_nghe_con ?? 0)}</b>
            <em>lắng nghe con trả lời</em>
          </div>
        </div>
        <div style={{ background: 'var(--c-surface)', borderRadius: 10, padding: '8px 10px', marginTop: 8, fontSize: 13, color: 'var(--c-text)' }}>
          <b>MẸ THẤY GÌ:</b> Không câu nào lộ đáp án tới con. Mọi phép tính trong bài đã được Gấu tính lại.
        </div>
      </div>
    </div>
  )
}

export function Report() {
  const { S, stats, toast, boom, tracker, patch, session } = useContext(AppCtx)
  const child = S?.children?.find((c) => c.id === S?.activeId) || S?.children?.[0] || { name: 'Con', id: 'c1' }
  const momSessions = stats?.sessionsMom || 0
  const dadSessions = stats?.sessionsDad || 0
  const totalSessions = momSessions + dadSessions
  const momPct = totalSessions ? Math.round((momSessions / totalSessions) * 100) : 0
  const dadPct = totalSessions ? 100 - momPct : 0

  // 📈 Phân tích Big Data Sticker History dài hạn (bỏ qua bản ghi mẫu sample: true)
  const stickerHistory = (stats?.stickerHistory || []).filter((s) => !s?.sample)
  const thisWeekStickers = stickerHistory.filter((s) => getWeekLabel(s.timestamp) === 'Tuần này')
  const lastWeekStickers = stickerHistory.filter((s) => getWeekLabel(s.timestamp) === 'Tuần trước')

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
  // Đợt 15 · 6.1: phân biệt phẩm chất bằng biểu tượng + nhãn, màu lấy từ bộ giao diện
  const TRACKED_TRAITS = [
    { trait: 'Kiên nhẫn', fa: 'fa-solid fa-mountain' },
    { trait: 'Sáng tạo', fa: 'fa-solid fa-lightbulb' },
    { trait: 'Tập trung', fa: 'fa-solid fa-bullseye' },
    { trait: 'Tỉ mỉ', fa: 'fa-solid fa-compass-drafting' },
  ]

  // State phân tích tiến bộ trung thực (Đợt 18 Chặng 3)
  const [progressState, setProgressState] = useState({
    loading: false,
    data: null,
    factBasis: null,
    error: null,
    notEnough: false,
    sessionsCount: 0,
    required: 3,
    createdAt: null,
  })
  const [showFactModal, setShowFactModal] = useState(false)
  const [showZaloReport, setShowZaloReport] = useState(false)

  const loadProgress = useCallback(async () => {
    setProgressState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const res = await fetchAiProgressReport(child.id, child.name, { sessionsCount: totalSessions })
      if (res && res.ok) {
        setProgressState({
          loading: false,
          data: res.report,
          factBasis: res.fact_basis,
          error: null,
          notEnough: false,
          sessionsCount: res.report?.nguon_du_lieu?.so_buoi || res.fact_basis?.so_buoi || totalSessions,
          required: 3,
          createdAt: res.created_at ? new Date(res.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        })
      } else if (res?.error?.code === 'NOT_ENOUGH_DATA') {
        setProgressState({
          loading: false,
          data: null,
          factBasis: null,
          error: null,
          notEnough: true,
          sessionsCount: res.sessions_count ?? totalSessions,
          required: res.required || 3,
          createdAt: null,
        })
      } else {
        setProgressState({
          loading: false,
          data: null,
          factBasis: null,
          error: res?.error?.message || 'Gấu chưa phân tích được lúc này',
          notEnough: false,
          sessionsCount: totalSessions,
          required: 3,
          createdAt: null,
        })
      }
    } catch (err) {
      setProgressState({
        loading: false,
        data: null,
        factBasis: null,
        error: err.message || 'Lỗi kết nối',
        notEnough: false,
        sessionsCount: totalSessions,
        required: 3,
        createdAt: null,
      })
    }
  }, [child.id, child.name, totalSessions])

  useEffect(() => {
    loadProgress()
  }, [loadProgress])

  // Đợt 15 · 6.3: hiện đủ "vướng 2/3 lần" (dữ liệu cũ có thể chỉ có count)
  const weakText = (w) => {
    const v = Number(w?.v ?? w?.count ?? 0)
    const t = Number(w?.t ?? 0)
    return t > 0 ? `vướng ${v}/${t} lần` : `vướng ${v} lần`
  }
  const weakPct = (w) => {
    const v = Number(w?.v ?? w?.count ?? 0)
    const t = Number(w?.t ?? 0)
    return t > 0 ? (v / t) * 100 : v > 0 ? 100 : 0
  }
  const parentLower = S?.parent ? S.parent.toLowerCase() : 'bố mẹ'

  // ---- Các khối báo cáo (thứ tự 6.3: tóm tắt, hay vướng, đã vững, phẩm chất, phân tích, lịch học, riêng người lớn, gửi Zalo) ----
  const aiKemCard = (
    <div className="card">
      <span className="lbl plum">Ai kèm</span>
      <div style={{ display: 'flex', height: 14, borderRadius: 8, overflow: 'hidden', background: 'var(--c-surface-2)' }}>
        <i style={{ width: `${momPct}%`, background: 'var(--c-accent)' }} />
        <i style={{ width: `${dadPct}%`, background: 'var(--c-accent-2, var(--sky))' }} />
      </div>
      <span className="sub">
        Mẹ {momSessions} ca ({momPct}%) · Bố {dadSessions} ca ({dadPct}%) →{' '}
        {totalSessions === 0
          ? <b>tuần này chưa ghi nhận ca học nào.</b>
          : dadSessions === 0
          ? <b>gợi ý: thử giao 1-2 ca cho bố để mẹ nghỉ ngơi nhé.</b>
          : momSessions === 0
          ? <b>tuần này bố đảm nhiệm hết, cảm ơn bố nhiều!</b>
          : <b>hai người cân sức rồi, giữ nếp nhé!</b>}
      </span>
    </div>
  )

  const weakSection = (
    <div className="pg-section">
      <p className="lbl mut">Con hay vướng (cần tháo gỡ)</p>
      {(stats?.weak || []).length === 0 && <span className="sub">Tuần này chưa có dạng nào bị vướng 🎉</span>}
      {(stats?.weak || []).map((w) => (
        <div className="card" key={w.n}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
            <b style={{ fontSize: 14 }}>{w.n}</b>
            <span className="pill c" style={{ flexShrink: 0 }}>{weakText(w)}</span>
          </div>
          <Bar pct={weakPct(w)} color="var(--coral)" />
        </div>
      ))}
    </div>
  )

  const strongSection = (
    <div className="pg-section">
      <p className="lbl mut">Con đã vững</p>
      {(stats?.strong || []).length === 0 && <span className="sub">Chưa có dạng bài nào đủ vững, cứ từ từ nhé.</span>}
      {(stats?.strong || []).map((w) => (
        <div className="card" key={w.n}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
            <b style={{ fontSize: 14 }}>{w.n}</b>
            <span className="pill m" style={{ flexShrink: 0 }}>{w.v}/{w.t}</span>
          </div>
          <Bar pct={100} color="var(--mint)" />
        </div>
      ))}
    </div>
  )

  const emptyWeekCard = (
    <div className="card dimmed" style={{ textAlign: 'center', padding: '24px 16px' }}>
      <div style={{ fontSize: 32, marginBottom: 6 }} aria-hidden="true">🌱 📚</div>
      <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--c-text)' }}>Chưa có buổi học nào tuần này</p>
      <span style={{ fontSize: 14, color: 'var(--c-text-2)', display: 'block', marginTop: 4 }}>
        Bắt đầu buổi học đầu tiên để AI ghi nhận phẩm chất và theo dõi tiến bộ của {child.name} nhé!
      </span>
    </div>
  )

  // Phẩm chất tuần này so với tuần trước: phân biệt bằng biểu tượng + nhãn, màu theo bộ giao diện
  const traitsCard = (
    <div className="card rpt-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
        <span className="lbl plum" style={{ margin: 0 }}>📊 Phẩm chất tuần này so với tuần trước</span>
      </div>
      <div className="trait-grid">
        {TRACKED_TRAITS.map((item) => {
          const thisCnt = thisTraits[item.trait] || 0
          const lastCnt = lastTraits[item.trait] || 0
          const diff = thisCnt - lastCnt
          return (
            <div key={item.trait} className="trait-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  <span className="trait-ic" aria-hidden="true">
                    <i className={item.fa} />
                  </span>
                  <span className="trait-name">{item.trait}</span>
                </div>
                <span className="trait-diff" aria-label={diff > 0 ? `Tăng ${diff}` : diff < 0 ? `Giảm ${-diff}` : 'Giữ đều'}>
                  {diff > 0 ? `+${diff} ↗` : diff < 0 ? `${diff} ↘` : 'Đều'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                <span className="trait-num">{thisCnt}</span>
                <span className="trait-meta">tuần này</span>
                <span className="trait-meta" style={{ marginLeft: 'auto' }}>trước: {lastCnt}</span>
              </div>
            </div>
          )
        })}
      </div>
      <span className="sub" style={{ marginTop: 10, display: 'block' }}>
        💡 <b>Góc nhìn sư phạm:</b> Khi bài tập chuyển sang dạng dài và khó, số sticker <i>Kiên nhẫn</i> thường tăng cao và <i>Sáng tạo</i> tạm thời giảm. Đây là nhịp chuyển tự nhiên, không nên sốt ruột.
      </span>
    </div>
  )

  // Thẻ "Con tiến bộ thế nào" (Đợt 18 · Chặng 3)
  const progressCard = (() => {
    if (progressState.notEnough) {
      return (
        <div className="card st-card" data-testid="progress-not-enough">
          <span className="e2" aria-hidden="true">🌱</span>
          <div>
            <b style={{ fontSize: 15, color: 'var(--c-text)' }}>Cần ít nhất 3 buổi học</b>
            <p className="sm" style={{ color: 'var(--c-text-2)', margin: '4px 0 0' }}>
              {child.name} mới học {progressState.sessionsCount} buổi. Học thêm {Math.max(1, (progressState.required || 3) - progressState.sessionsCount)} buổi nữa, Gấu sẽ phân tích cho mẹ.
            </p>
          </div>
        </div>
      )
    }

    if (progressState.loading) {
      return (
        <div className="card st-card" data-testid="progress-analyzing" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ThemeBuddy state="reading" size={52} />
          <div>
            <b style={{ fontSize: 15, color: 'var(--c-text)' }}>Gấu đang phân tích dữ liệu của {child.name}…</b>
            <p className="sm" style={{ color: 'var(--c-text-2)', margin: '4px 0 0' }}>
              Đang đối chiếu dữ liệu các buổi học để tìm gợi ý cho tuần tới.
            </p>
          </div>
        </div>
      )
    }

    if (progressState.error) {
      return (
        <div className="card st-card warn" data-testid="progress-error" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ThemeBuddy state="oops" size={52} />
          <div style={{ flex: 1 }}>
            <b style={{ fontSize: 15, color: 'var(--c-text)' }}>Gấu chưa phân tích được lúc này</b>
            <p className="sm" style={{ color: 'var(--c-text-2)', margin: '4px 0 0' }}>
              Không có bài viết sẵn nào thay thế. Mẹ thử lại sau ít phút nhé.
            </p>
            <button className="mini-btn" onClick={loadProgress}>Thử lại</button>
          </div>
        </div>
      )
    }

    if (progressState.data) {
      const pData = progressState.data
      const soBuoi = pData.nguon_du_lieu?.so_buoi || progressState.factBasis?.so_buoi || totalSessions
      const tuNgay = pData.nguon_du_lieu?.tu_ngay || progressState.factBasis?.tu_ngay
      const denNgay = pData.nguon_du_lieu?.den_ngay || progressState.factBasis?.den_ngay
      return (
        <div className="card ana" data-testid="progress-ready">
          <div className="lbl plum" style={{ margin: 0 }}>CON TIẾN BỘ THẾ NÀO</div>
          <p className="src-badge">
            🐻 Gấu đã đọc <b>{soBuoi} buổi học</b>{tuNgay ? `, từ ${tuNgay} đến ${denNgay}` : ''}
          </p>
          <p style={{ fontSize: 14, color: 'var(--c-text)', margin: '4px 0', lineHeight: 1.5 }}>
            {pData.tom_tat}
          </p>
          <div className="facts-grid">
            <div>
              <span>Hay kẹt</span>
              <b>{pData.hay_ket?.[0] || 'Chưa có'}</b>
              <em>{progressState.factBasis?.hay_ket?.[0] ? 'cần kiên nhẫn' : 'bước nâng cao'}</em>
            </div>
            <div>
              <span>Đã vững</span>
              <b>{pData.da_vung?.[0] || 'Phép tính'}</b>
              <em>làm chắc chắn</em>
            </div>
            <div>
              <span>Tự làm</span>
              <b>{pData.tu_lam_count ?? progressState.factBasis?.tu_lam_count ?? soBuoi} bài</b>
              <em>con tự tin</em>
            </div>
          </div>

          <div className="lbl plum" style={{ margin: '8px 0 0' }}>GỢI Ý TUẦN TỚI</div>
          <ol style={{ paddingLeft: 20, margin: '4px 0', fontSize: 14, color: 'var(--c-text)', lineHeight: 1.5 }}>
            {(pData.goi_y_cho_me || []).map((item, idx) => (
              <li key={idx} style={{ marginBottom: 4 }}>{item}</li>
            ))}
          </ol>

          <div className="ana-f">
            <button className="lnk-btn" onClick={() => setShowFactModal(true)}>
              Xem dữ liệu Gấu đã đọc ›
            </button>
            <span style={{ fontSize: 12, color: 'var(--c-text-2)' }}>
              {progressState.createdAt ? `Phân tích lúc ${progressState.createdAt}` : ''}
            </span>
          </div>

          {showFactModal && (
            <div className="card st-card" style={{ marginTop: 8 }} data-testid="fact-modal">
              <span className="e2" aria-hidden="true">🔎</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <b style={{ fontSize: 14, color: 'var(--c-text)' }}>Dữ liệu Gấu đã đọc</b>
                  <button className="lnk-btn" onClick={() => setShowFactModal(false)}>Đóng ✕</button>
                </div>
                <ul style={{ paddingLeft: 18, margin: '6px 0', fontSize: 13, color: 'var(--c-text-2)', lineHeight: 1.5 }}>
                  <li>{soBuoi} buổi học · {tuNgay || '28 ngày qua'} đến {denNgay || 'nay'}</li>
                  <li>Kỹ năng hay kẹt: {progressState.factBasis?.hay_ket?.join(', ') || 'Chưa có bước kẹt thường xuyên'}</li>
                  <li>Kỹ năng đã vững: {progressState.factBasis?.da_vung?.join(', ') || 'Đang rèn luyện'}</li>
                  <li>Con tự làm hết: {progressState.factBasis?.tu_lam_count ?? soBuoi} bài</li>
                  <li>Mẹ kèm {momSessions} buổi, bố kèm {dadSessions} buổi</li>
                </ul>
                <p style={{ fontSize: 12, color: 'var(--c-text-2)', margin: '4px 0 0', fontStyle: 'italic' }}>
                  Gấu chỉ được dùng các con số trong danh sách này để phân tích.
                </p>
              </div>
            </div>
          )}
        </div>
      )
    }

    return null
  })()

  // Lưới học 30 ngày trong tháng (Prompt 07 Phần B)
  const calendarCard = (
    <div className="card" style={{ padding: '14px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 16 }} aria-hidden="true">🗓️</span>
          <b style={{ fontSize: 15, color: 'var(--c-text)' }}>Lịch học đều tháng {new Date().getMonth() + 1}</b>
        </div>
        <span style={{ fontSize: 13, color: 'var(--c-text-2)' }}>
          Chuỗi: <b style={{ color: 'var(--c-text)' }}>{tracker?.streak || 0} tối</b>
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, textAlign: 'center' }}>
        {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((h) => (
          <span key={h} style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-text-2)', marginBottom: 2 }}>{h}</span>
        ))}
        {(() => {
          const now = new Date()
          const firstDayIndex = (new Date(now.getFullYear(), now.getMonth(), 1).getDay() + 6) % 7
          const emptyPads = Array.from({ length: firstDayIndex })
          return (
            <>
              {emptyPads.map((_, i) => <div key={'pad_' + i} />)}
              {(tracker?.month || []).map((m) => (
                <div
                  key={m.dateKey}
                  title={`${m.day}/${now.getMonth() + 1}: ${m.isStudied ? 'Đã học' : 'Chưa học'}`}
                  aria-label={`Ngày ${m.day}: ${m.isStudied ? 'đã học' : 'chưa học'}`}
                  style={{
                    height: 34,
                    borderRadius: 8,
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 13,
                    fontWeight: m.isToday ? 800 : 600,
                    background: m.isStudied ? 'var(--c-good)' : 'var(--c-bg)',
                    color: m.isStudied ? 'var(--c-on-good)' : m.isToday ? 'var(--c-accent-ink, var(--c-text))' : 'var(--c-text-2)',
                    border: m.isToday ? '2px dashed var(--c-accent)' : '1px solid var(--c-line)',
                  }}
                >
                  {m.isStudied ? '✓' : m.day}
                </div>
              ))}
            </>
          )
        })()}
      </div>

      <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px dashed var(--c-line)', fontSize: 13, textAlign: 'center', color: 'var(--c-text-2)' }}>
        Tháng này: <b style={{ color: 'var(--c-text)' }}>{(tracker?.month || []).filter((m) => m.isStudied).length} tối</b> · chuỗi dài nhất <b style={{ color: 'var(--c-text)' }}>{tracker?.bestStreak || 0} tối</b>
      </div>
    </div>
  )

  // Ghi nhận riêng cho bố mẹ (Prompt 08 Mục 7)
  const adultsCard = (() => {
    if (session && session.role === 'viewer') return null
    const calmHistory = stats?.calmHistory || S?.stats?.[S?.activeId]?.calmHistory || []
    const thisWeekCalm = calmHistory.filter((item) => {
      const ts = typeof item === 'number' ? item : item?.ts
      return ts && getWeekLabel(ts) === 'Tuần này'
    })
    const count = thisWeekCalm.length
    if (count === 0) return null

    const daysSet = new Set()
    thisWeekCalm.forEach((item) => {
      const ts = typeof item === 'number' ? item : item?.ts
      if (ts) daysSet.add(new Date(ts).toLocaleDateString('vi-VN', { weekday: 'short' }))
    })

    return (
      <div className="card rpt-card" style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
          <span className="rpt-kicker">🔒 Riêng cho người lớn trong nhà</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-text-2)' }}>{Array.from(daysSet).join(', ')}</span>
        </div>

        <h4 className="rpt-title" style={{ margin: '0 0 6px' }}>
          Tuần này {parentLower} đã dừng lại {count} lần trước khi nổi nóng 💚
        </h4>
        <p style={{ fontSize: 14, color: 'var(--c-text)', margin: '0 0 10px', lineHeight: 1.45 }}>
          {count} lần nghỉ xong, {child?.name || 'con'} đã có năng lượng làm tiếp các bậc thang. Đó là nỗ lực tuyệt vời của {parentLower}!
        </p>

        <div className="switch-row" style={{ borderTop: '1px dashed var(--c-line)', paddingTop: 8 }}>
          <span id="rpt-calm-zalo-lbl" style={{ fontSize: 14, color: 'var(--c-text)' }}>Gửi kèm báo cáo Zalo</span>
          <Switch
            on={Boolean(S?.shareCalmWithZalo)}
            onChange={(v) => patch && patch({ shareCalmWithZalo: v })}
            label="Gửi kèm báo cáo Zalo"
            aria-describedby="rpt-calm-zalo-lbl"
          />
        </div>
      </div>
    )
  })()

  const weekendCard = (
    <div className="card plum">
      <span className="lbl plum">Một việc cho cuối tuần</span>
      <span style={{ fontSize: 14 }}>
        Đi chợ cùng con: "3 bó rau, mỗi bó 5 nghìn, trả 20 nghìn thì thối bao nhiêu?"
      </span>
    </div>
  )

  return (
    <>
      <Header title={`Tuần này của ${child.name}`} />
      <p className="sub">{totalSessions} ca · mẹ kèm {momSessions} ca, bố kèm {dadSessions} ca · {stickerHistory.length} mốc dữ liệu phẩm chất</p>

      {/* Dải tab dính trên Báo cáo (Prompt 23 Chặng 3.8 & Prompt 23D) */}
      <div
        className="report-sticky-tabs"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 80,
          background: 'var(--c-bg, #FFFBF5)',
          padding: '8px 0',
          marginBottom: 12,
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 6,
          borderBottom: '1px solid var(--c-line, #EADFCF)',
        }}
      >
        {[
          { id: 'sec-week', label: 'Tuần này' },
          { id: 'sec-traits', label: 'Phẩm chất' },
          { id: 'sec-subjects', label: 'Môn học' },
          { id: 'sec-ai', label: 'Phân tích' }
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            className="btn-km btn-km-s btn-km-chip"
            style={{
              padding: '6px 14px',
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 700,
              whiteSpace: 'nowrap',
              background: 'var(--c-surface, #fff)',
              border: '1px solid var(--c-line, #EADFCF)',
              color: 'var(--c-text, #2D241E)',
              cursor: 'pointer',
            }}
            onClick={() => {
              const el = document.getElementById(t.id);
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          >
            {t.label}
          </button>
        ))}
      </div>


      <div className="pg-grid2">
        {/* 1. Tóm tắt tuần */}
        <div id="sec-week" style={{ gridColumn: "1 / -1" }}>{aiKemCard}</div>
        {/* Đợt 15 P1: An toàn AI · con giảng lại · tự sửa lỗi (prompt 14 mục 2.7, 3.7, 4.3) */}
        <WeeklyAiCards stats={stats} childName={child.name} />

        {/* 2-3. Con hay vướng, con đã vững */}
        {weakSection}
        {strongSection}

        {/* 4. ĐỢT 19 CHẶNG 3: BIỂU ĐỒ CỘT CHỒNG PHẨM CHẤT & AI PHÂN TÍCH */}
        <div id="sec-traits" className="pg-span">
          <TraitStackedChart
            badges={stats?.stickerHistory || []}
            rewards={stats?.rewardHistory || []}
            childName={child.name}
          />
        </div>

        <div id="sec-ai" className="pg-span">
          <TraitAiAnalysisCard
            child={child}
            stats={stats}
          />
        </div>

        <div id="sec-subjects" className="pg-span">
          <SubjectAndSkillHeatmap
            stats={stats}
            childName={child.name}
          />
        </div>

        {/* 5. Lịch học */}
        {calendarCard}

        {/* 6. Riêng cho người lớn */}
        {adultsCard}
        {weekendCard}

        {/* 7. Gửi Zalo */}
        <button
          type="button"
          className="btn-km btn-km-primary pg-span"
          onClick={() => {
            soundPop(600)
            setShowZaloReport(true)
          }}
          style={{ width: '100%', height: 48, borderRadius: 16, fontSize: 15, fontWeight: 700 }}
        >
          💬 Gửi báo cáo vào nhóm Zalo gia đình
        </button>
      </div>

      {showZaloReport && (
        <ZaloReportModal
          child={child}
          stats={stats}
          weekLabel={getWeekLabel?.() || 'Tuần này'}
          onClose={() => setShowZaloReport(false)}
          toast={toast}
          boom={boom}
          currentTheme={S.theme || 'candy'}
        />
      )}
    </>
  )
}

/* ============================================================
   12. CON TÔI
   ============================================================ */

/* ============================================================
   NHỮNG GÌ GẤU NHỚ VỀ CON (Prompt 18 Chặng 2 & Prompt 22 - 0.5)
   ============================================================ */
function BearMemorySection({ child, S, stats, patch, toast }) {
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const memoryEnabled = child.bearMemory !== false

  // 1. Dạng hay kẹt
  const weakList = (stats?.weak || []).map((w, idx) => ({
    id: `weak_${idx}`,
    type: 'weak',
    label: `${w.n} (vướng ${w.v || 1}/${w.t || 1} lần)`,
    icon: '🧩',
    tag: 'Dạng hay kẹt',
    color: '#DC2626',
  }))

  // 2. Dạng đã vững
  const strongList = (stats?.strong || []).map((s, idx) => ({
    id: `strong_${idx}`,
    type: 'strong',
    label: `${s.n} (làm chắc chắn ${s.v || 1}/${s.t || 1})`,
    icon: '✨',
    tag: 'Dạng đã vững',
    color: '#16A34A',
  }))

  // 3. Cách giảng con hợp
  const defaultStyles = [
    { id: 'style_1', type: 'style', label: 'Dùng đồ vật thật trong nhà khi con kẹt', icon: '🧸', tag: 'Cách giảng hợp', color: '#7C3AED' },
    { id: 'style_2', type: 'style', label: 'Vẽ sơ đồ đoạn thẳng cho toán lời văn', icon: '🎨', tag: 'Cách giảng hợp', color: '#7C3AED' },
    { id: 'style_3', type: 'style', label: 'Giữ buổi học dưới 15 phút, giải lao 5 phút', icon: '⏰', tag: 'Cách giảng hợp', color: '#7C3AED' },
  ]
  const customStyles = child.customTeachingStyles || defaultStyles

  const deletedIds = new Set(child.deletedMemoryIds || [])
  const allItems = [...weakList, ...strongList, ...customStyles].filter((item) => !deletedIds.has(item.id))

  const handleDeleteItem = (id, label) => {
    const next = new Set(deletedIds)
    next.add(id)
    const updatedChildren = S.children.map((c) => (c.id === child.id ? { ...c, deletedMemoryIds: Array.from(next) } : c))
    patch({ children: updatedChildren })
    toast(`Gấu đã quên: "${label}" 🗑️`)
  }

  const handleClearAll = () => {
    const allIds = [...weakList, ...strongList, ...customStyles].map((i) => i.id)
    const next = new Set(allIds)
    const updatedChildren = S.children.map((c) => (c.id === child.id ? { ...c, deletedMemoryIds: Array.from(next) } : c))
    patch({
      children: updatedChildren,
      stats: {
        ...(S.stats || {}),
        [child.id]: {
          ...(S.stats?.[child.id] || {}),
          weak: [],
          strong: [],
        },
      },
    })
    setShowClearConfirm(false)
    toast(`Đã xoá hết những gì Gấu nhớ về ${child.name}. Gấu sẽ quan sát lại từ đầu! 🧹`)
  }

  return (
    <div className="card" style={{ padding: '16px', marginBottom: 12, border: '1.5px solid var(--c-line)' }} data-testid="card-bear-memory">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 22 }}>🧠 🐻</span>
          <b style={{ fontSize: 15, color: 'var(--c-text)' }}>Những gì Gấu nhớ về {child.name}</b>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
          <span>{memoryEnabled ? 'Đang bật' : 'Tắt'}</span>
          <input
            type="checkbox"
            checked={memoryEnabled}
            onChange={(e) => {
              const updated = S.children.map((c) => (c.id === child.id ? { ...c, bearMemory: e.target.checked } : c))
              patch({ children: updated })
              toast(e.target.checked ? `Đã bật ghi nhớ cho ${child.name}` : `Đã tắt ghi nhớ cho ${child.name}`)
            }}
            style={{ width: 18, height: 18, accentColor: 'var(--c-accent)' }}
          />
        </label>
      </div>

      <p className="xs" style={{ color: 'var(--c-text-2)', margin: '0 0 10px', lineHeight: 1.45 }}>
        Gấu quan sát qua các buổi học để nhớ dạng bài {child.name} hay kẹt, dạng đã vững và cách giảng con hợp nhất.
      </p>

      {allItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '16px', background: 'var(--c-surface-2)', borderRadius: 12, color: 'var(--c-text-2)', fontSize: 13 }}>
          🐻 Gấu chưa lưu điều nào về {child.name}. Sau các bài học, Gấu sẽ tự động ghi nhớ tại đây!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {allItems.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                background: 'var(--c-surface-2)',
                borderRadius: 10,
                fontSize: 13,
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
                <span>{item.icon}</span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: item.color, display: 'block' }}>
                    {item.tag}
                  </span>
                  <span style={{ color: 'var(--c-text)', fontWeight: 600 }}>{item.label}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteItem(item.id, item.label)}
                title="Xoá mục này"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  fontSize: 14,
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: 6,
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {allItems.length > 0 && (
        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn ghost btn-sm danger"
            onClick={() => setShowClearConfirm(true)}
            data-testid="btn-clear-bear-memory"
          >
            🗑 Xoá hết
          </button>
        </div>
      )}

      {showClearConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 9999,
            display: 'grid',
            placeItems: 'center',
            padding: 16,
          }}
          onClick={() => setShowClearConfirm(false)}
        >
          <div
            className="card"
            style={{ maxWidth: 360, width: '100%', background: '#fff', padding: 20, borderRadius: 16 }}
            onClick={(e) => e.stopPropagation()}
          >
            <b style={{ fontSize: 16, color: '#991B1B', display: 'block', marginBottom: 8 }}>
              Xoá toàn bộ những gì Gấu nhớ?
            </b>
            <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.5, margin: '0 0 16px' }}>
              Gấu sẽ quên toàn bộ dạng bài hay kẹt, dạng đã vững và cách giảng của {child.name}. Mẹ có chắc chắn không?
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn ghost btn-sm"
                onClick={() => setShowClearConfirm(false)}
              >
                Hủy
              </button>
              <button
                type="button"
                className="btn solid btn-sm"
                style={{ background: '#DC2626', color: '#fff' }}
                onClick={handleClearAll}
              >
                Xác nhận xoá
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function Profile() {
  const { S, stats, patch, go, openSheet, toast, logout, familyName, openAdmin, soundOn, toggleSound } = useContext(AppCtx)
  const child = S.children.find((c) => c.id === S.activeId) || S.children[0]
  const familyLabel = /^gia đình\b/i.test(String(familyName || '').trim()) ? String(familyName).trim() : `Gia đình ${familyName || ''}`.trim()

  // Gia đình chưa có lịch (vd. Dùng thử) thì dùng lịch mặc định, tránh lỗi trang
  const schedule = Array.isArray(S.schedule) ? S.schedule : SCHEDULE_DEFAULT || []

  const toggleOwner = (i) => {
    const sch = schedule.map((d, j) => (j === i ? { ...d, owner: d.owner === 'Mẹ' ? 'Bố' : 'Mẹ' } : d))
    patch({ schedule: sch })
    toast(`Ca ${sch[i].day} chuyển cho ${sch[i].owner} 👌`)
  }

  return (
    <>
      <Header title="Con tôi" />
      {S.children.length > 1 && (
        <div className="chips">
          {S.children.map((c) => (
            <button
              key={c.id}
              className={`chip ${c.id === S.activeId ? 'on' : ''}`}
              aria-pressed={c.id === S.activeId}
              onClick={() => { patch({ activeId: c.id }); toast(`Đang xem ${c.name} ${c.emoji}`) }}
            >
              {c.emoji} {c.name}
            </button>
          ))}
        </div>
      )}

      {/* ===== Nhóm 1 · Con ===== */}
      <h2 className="pg-section-title">Con</h2>
      {/* Nhận lời khuyên cách kèm (công tắc switch 40x24 bên phải cùng hàng - F7) */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "12px 16px",
          marginBottom: 12,
          background: "var(--c-surface)",
          border: "1px solid var(--c-line)",
          borderRadius: 20,
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1 }}>
          <span style={{ fontSize: 22, flexShrink: 0 }}>🐻</span>
          <div style={{ minWidth: 0 }}>
            <b style={{ fontSize: 14, color: "var(--c-text)", display: "block" }}>Nhận lời khuyên cách kèm</b>
            <div style={{ fontSize: 12, color: "var(--c-sub, var(--c-text-2))", marginTop: 1 }}>Gấu góp ý sư phạm sau mỗi bài học</div>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={child.receiveCoachAdvice !== false}
          aria-label="Nhận lời khuyên cách kèm"
          style={{
            width: 40,
            height: 24,
            borderRadius: 999,
            background: (child.receiveCoachAdvice !== false) ? "var(--c-good, #2EA043)" : "var(--c-line)",
            position: "relative",
            border: "none",
            padding: 0,
            cursor: "pointer",
            flexShrink: 0,
            transition: "background 0.15s ease",
          }}
          onClick={() => {
            const val = child.receiveCoachAdvice === false;
            const updatedChildren = S.children.map(c => c.id === child.id ? { ...c, receiveCoachAdvice: val } : c);
            patch({ children: updatedChildren });
            toast(val ? "Đã bật lời khuyên cách kèm 🐻" : "Đã tắt lời khuyên cách kèm");
          }}
        >
          <span
            style={{
              position: "absolute",
              top: 3,
              left: (child.receiveCoachAdvice !== false) ? 19 : 3,
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: "#FFFFFF",
              boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
              transition: "left 0.15s ease",
              display: "block",
            }}
          />
        </button>
      </div>
      <div className="pg-grid2">
        <div className="card plum">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 38 }} aria-hidden="true">{child.emoji}</span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <b style={{ fontSize: 17 }}>{child.name} · {child.grade}</b>
              <div className="sub">{child.book} · Toán, Tiếng Việt, Tiếng Anh</div>
            </div>
          </div>
          <button type="button" className="btn ghost btn-sm" style={{ alignSelf: 'flex-start', marginTop: 4 }} onClick={() => openSheet('editChild')}>
            ✏️ Sửa hồ sơ của {child.name}
          </button>
        </div>

        <button className="big-card sun" onClick={() => openSheet('stickerBook')}>
          <span className="ic" aria-hidden="true">📖</span>
          <span className="lbl sun">Bộ sưu tập huy hiệu</span>
          <b>Sổ dán sticker của {child.name}</b>
          <span className="sub">Đã sưu tập {stats.stickers} sticker lấp lánh ✨</span>
        </button>

        <button className="big-card mint" onClick={() => openSheet('familyClasses')}>
          <span className="ic" aria-hidden="true">🏫</span>
          <b>Lớp học của con</b>
          <span className="sub">Kết nối với cô giáo ở trường, nhận bài tập về nhà theo cách cô dạy</span>
        </button>

        <button className="big-card" onClick={() => openSheet('addChild')}>
          <span className="ic" aria-hidden="true">➕</span>
          <b>Thêm con</b>
          <span className="sub">Mỗi bé 1 lớp, 1 bộ sách riêng</span>
        </button>
      </div>

      {/* ===== Nhóm 2 · Cả nhà ===== */}
      <h2 className="pg-section-title">Cả nhà</h2>
      <div className="pg-grid2">
        <button className="big-card sky" onClick={() => openSheet('members')}>
          <span className="ic" aria-hidden="true">👨‍👩‍👧</span>
          <b>Thành viên gia đình</b>
          <span className="sub">Mời người thân (bố, ông bà, gia sư) cùng kèm con, chia sẻ buổi học</span>
        </button>

        <button className="big-card" style={{ borderColor: 'var(--c-accent)' }} onClick={() => openSheet('themePicker')}>
          <span className="ic" aria-hidden="true">🎨</span>
          <b>Giao diện cả nhà</b>
          <span className="sub">
            Đang dùng: <b>{getTheme(S.theme || 'candy').name}</b> · 8 bộ phong cách đổi 1 chạm
          </span>
        </button>

        <div className="card-km pg-span" style={{ padding: '14px 16px', background: 'var(--c-surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <b style={{ fontSize: 14, color: 'var(--c-text)' }}>Lịch chia ca T2 đến T6</b>
            <span style={{ fontSize: 12, color: 'var(--c-sub)' }}>Chạm vào ô để đổi Bố hoặc Mẹ</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, textAlign: 'center' }}>
            {schedule.slice(0, 5).map((d, i) => {
              const isDad = d.owner === 'Bố'
              return (
                <button
                  key={d.day}
                  type="button"
                  onClick={() => toggleOwner(i)}
                  style={{
                    padding: '8px 4px',
                    borderRadius: 12,
                    background: isDad ? 'var(--c-primary-light, #EFF6FF)' : 'var(--c-surface-2, #FDF2F8)',
                    border: isDad ? '1.5px solid var(--c-primary, #3B82F6)' : '1.5px solid #F472B6',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                  }}
                  title={`Ca ${d.day}: ${d.owner} (Chạm để đổi)`}
                >
                  <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--c-sub)' }}>{d.day}</span>
                  <span style={{ fontSize: 13, fontWeight: 900, color: isDad ? '#1D4ED8' : '#BE185D' }}>{d.owner}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ===== Nhóm 3 · Cài đặt ===== */}
      <h2 className="pg-section-title">Cài đặt</h2>
      <div className="pg-grid2">

        {/* Cài đặt thời gian chơi chung mỗi ngày (Prompt 24 Chặng 1) */}
        <div className="card" data-testid="card-game-time-limit">
          <span className="lbl plum">⏱ Thời gian chơi chung mỗi ngày</span>
          <b style={{ fontSize: 14, color: 'var(--c-text)', display: 'block', margin: '4px 0 2px' }}>
            Tự động dừng khi hết giờ chơi
          </b>
          <span className="sub" style={{ display: 'block', marginBottom: 10 }}>
            Mỗi ngày mẹ và {child.name} chơi cùng tối đa bao nhiêu phút?
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            {[3, 5, 10, 15].map((mins) => {
              const active = getDailyLimitMinutes(child.id) === mins
              return (
                <button
                  key={mins}
                  type="button"
                  className={`btn-km btn-km-s btn-km-chip ${active ? 'active' : ''}`}
                  style={{
                    flex: 1,
                    height: 36,
                    borderRadius: 10,
                    fontWeight: active ? 800 : 600,
                    background: active ? 'var(--c-accent, #F6A623)' : 'var(--c-surface-2)',
                    color: active ? 'var(--c-on-accent, #fff)' : 'var(--c-text)',
                    border: active ? 'none' : '1px solid var(--c-line)',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    setDailyLimitMinutes(child.id, mins)
                    toast(`Đã đặt thời gian chơi chung: ${mins} phút/ngày ⏱`)
                  }}
                >
                  {mins} phút
                </button>
              )
            })}
          </div>
        </div>

        <div className="card">
          <span className="lbl plum">Âm thanh và tiếng bấm nút 🎵</span>
          <div className="switch-row">
            <div>
              <b style={{ fontSize: 14 }}>Âm thanh hiệu ứng và tiếng bấm</b>
              <div className="sub" style={{ marginTop: 2 }}>
                Tiếng bấm nút vui tai cho bé, chuông chiến thắng và pháo hoa.
              </div>
            </div>
            <Switch on={soundOn} onChange={() => toggleSound()} label="Âm thanh hiệu ứng và tiếng bấm" data-no-sound />
          </div>
          <span className="sub">
            {soundOn
              ? '🔊 Đang bật: bấm nút có tiếng, tạo cảm hứng cho bé khi học.'
              : '🔇 Đang tắt: giữ không gian yên tĩnh cho cả nhà.'}
          </span>
        </div>

        {/* Công tắc Nhắc nghỉ khi căng thẳng (Prompt 08 Mục 1) */}
        <div className="card">
          <span className="lbl plum">Nhắc nghỉ</span>
          <div className="switch-row">
            <div>
              <b style={{ fontSize: 14, color: 'var(--c-text)', display: 'block' }}>Nhắc nghỉ khi căng thẳng</b>
              <span className="sub">Tự động nhắc {S.parent.toLowerCase()} con nghỉ 1 phút khi bí hoặc làm lâu</span>
            </div>
            <Switch
              on={S.calmNudgeEnabled !== false}
              onChange={(v) => patch({ calmNudgeEnabled: v })}
              label="Nhắc nghỉ khi căng thẳng"
            />
          </div>
        </div>

        <div className="card">
          <span className="lbl plum">Đồng bộ đám mây ☁️</span>
          <div className="switch-row">
            <span style={{ fontSize: 14 }}>Tự động sao lưu dữ liệu lên đám mây</span>
            <Switch
              on={Boolean(S.cloudSync)}
              onChange={() => { patch({ cloudSync: !S.cloudSync }); toast(!S.cloudSync ? 'Đã bật đồng bộ ☁️' : 'Đã tắt đồng bộ') }}
              label="Tự động sao lưu dữ liệu lên đám mây"
            />
          </div>
          <span className="sub">Đổi máy vẫn thấy hồ sơ, lịch sử và sticker của con.</span>
        </div>

        <button className="big-card mint" onClick={() => openSheet('pwa')}>
          <span className="ic" aria-hidden="true">📱</span>
          <span className="lbl mint">Tiện ích</span>
          <b>Cài app ra màn hình chính</b>
          <span className="sub">Mở app toàn màn hình, nhanh như app tải từ cửa hàng</span>
        </button>
      </div>

      {/* ===== Nhóm 4 · Những gì Gấu nhớ & Riêng tư ===== */}
      <h2 className="pg-section-title">Những gì Gấu nhớ & Riêng tư</h2>
      <BearMemorySection child={child} S={S} stats={stats} patch={patch} toast={toast} />
      <div className="pg-grid2">
        <button className="big-card" onClick={() => openSheet('safetyPortal')}>
          <span className="ic" aria-hidden="true">🛡️</span>
          <span className="lbl mint">Minh bạch và an toàn</span>
          <b>AI an toàn thế nào?</b>
          <span className="sub">Cam kết 4 lớp: không giải hộ, không lộ đáp án, {S.parent.toLowerCase()} luôn làm chủ</span>
        </button>

        <div className="card">
          <span className="lbl plum">Quyền riêng tư</span>
          <span className="sub">
            Ảnh chỉ dùng để đọc đề, app không lưu ảnh. Hồ sơ, sticker, lịch sử học được lưu trên máy chủ để dùng được trên nhiều máy; {S.parent.toLowerCase()} có thể xoá toàn bộ bất cứ lúc nào.
          </span>
        </div>

        <div className="card" style={{ gap: 10 }}>
          <b style={{ fontSize: 15 }}>Xoá dữ liệu</b>
          <span className="sub">Xoá vĩnh viễn hồ sơ con, lịch sử, sticker và báo cáo. Không khôi phục được.</span>
          <button className="btn danger" onClick={() => openSheet('wipe')}>
            🗑 Xoá toàn bộ dữ liệu
          </button>
        </div>

        <div className="card" style={{ gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22 }} aria-hidden="true">🏠</span>
            <div style={{ minWidth: 0 }}>
              <b style={{ fontSize: 15 }}>{familyLabel}</b>
              <div className="sub">Tài khoản riêng của gia đình mình</div>
            </div>
          </div>
          <button
            className="btn ghost"
            onClick={() => { logout(); toast('Đã đăng xuất 👋') }}
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </>
  )
}

/* ============================================================
   📝 13. CHẤM VỞ, KHÔNG SỬA HỘ (Prompt 14 Phần A)
   ============================================================ */
export function CheckWork() {
  const { S, patch, go, openSheet, toast, boom, stats, setStats } = useContext(AppCtx)
  const child = S.children.find((c) => c.id === S.activeId) || S.children[0]
  const childName = child?.name || 'Mít'

  const initData = S.checkWorkInit || {}
  const [step, setStep] = useState('capture') // capture | scanning | review | grading | result_parent | result_child | retake | celebration | blur | invalid_scope
  const [problemText, setProblemText] = useState(initData.problemText || '')
  const [sessionId, setSessionId] = useState(initData.sessionId || null)
  const [recheckOf, setRecheckOf] = useState(null)
  const [checkId, setCheckId] = useState(null)
  const [lines, setLines] = useState([])
  const [linesEdited, setLinesEdited] = useState(0)
  const [gradeResult, setGradeResult] = useState(null)
  const [isHoldingAnswer, setIsHoldingAnswer] = useState(false)
  const [expandHint2, setExpandHint2] = useState(false)
  const [editingLineIdx, setEditingLineIdx] = useState(null)
  const [editingText, setEditingText] = useState('')
  const [candiesAdded, setCandiesAdded] = useState(false)
  const [alreadyHadCandyTonight, setAlreadyHadCandyTonight] = useState(false)
  const [blurReason, setBlurReason] = useState('')
  const [gradeError, setGradeError] = useState(null) // { message, retryArgs }

  const fileInputRef = useRef(null)
  const retakeInputRef = useRef(null)

  // Khởi tạo trạng thái ban đầu nếu có bài từ Xong bài
  useEffect(() => {
    if (initData.problemText) {
      setProblemText(initData.problemText)
    }
    if (initData.sessionId) {
      setSessionId(initData.sessionId)
    }
  }, [initData])

  // Xử lý nén ảnh (tối đa 1280px, jpeg 0.8) và gửi đọc
  const processAndReadImage = async (file, isRetake = false, isSelfie = false) => {
    try {
      setStep('scanning')
      soundTap()

      let compressedBlob = file
      if (file instanceof File || file instanceof Blob) {
        try {
          const compRes = await compressImage(file, 1600, 0.85)
          compressedBlob = compRes.blob
        } catch (e) {
          console.warn('Compress image fallback to original:', e)
        }
      }

      const res = await checkWorkRead({
        image: compressedBlob,
        childId: child?.id || 'child_default',
        sessionId,
        problemText,
        recheckOf: isRetake ? checkId : undefined,
        isSelfie,
      })

      if (res.doc_duoc === false) {
        if (res.ly_do?.includes('không phải bài làm')) {
          setStep('invalid_scope')
          return
        }
        setBlurReason(res.ly_do || '')
        setStep('blur')
        return
      }

      setCheckId(res.check_id)
      if (res.de_bai) setProblemText(res.de_bai)
      setLines(res.cac_dong || [])
      setLinesEdited(0)

      if (isRetake) {
        // Tự động chấm lại sau khi con chụp bài đã sửa
        await doGrade(res.check_id, res.de_bai || problemText, res.cac_dong || [], 0, true)
      } else {
        setStep('review')
      }
    } catch (err) {
      console.error('Lỗi đọc ảnh:', err)
      if (err.status === 429) {
        toast('Hôm nay đã dùng hết 50 lượt đọc ảnh. Mẹ và bé quay lại vào ngày mai nhé! 🌙')
      } else {
        toast('Không thể đọc ảnh, mẹ thử chụp lại hoặc gõ bài làm nhé')
      }
      setStep('capture')
    }
  }

  // Gọi API chấm bài
  // Prompt 23L: khi bước chấm quá thời gian / lỗi, tự gọi lại một lần (cùng check_id) trước khi hiện màn "Chưa chấm xong"; trong lúc chờ vẫn giữ màn "AI đang chấm và kiểm tra phép tính..."
  const doGrade = async (idToGrade, probTxt, linesToGrade, editedFlag = linesEdited, isRetake = false, attempt = 1) => {
    try {
      if (attempt === 1) {
        soundPop()
      }
      setStep('grading')

      const res = await checkWorkGrade({
        checkId: idToGrade,
        deBai: probTxt,
        cacDong: linesToGrade,
        linesEdited: editedFlag,
        lop: child?.grade || 'Lớp 3',
        xungHo: S.parent || 'mẹ',
        tenCon: childName,
        recheckOf: isRetake ? checkId : undefined,
      })

      // Đợt 15 P0.B & Prompt 23L: kết quả thiếu trường → tự gọi lại lần 2 trước khi báo lỗi
      const missing = missingCheckWorkFields(res)
      if (missing.length) {
        if (attempt === 1) {
          console.warn('Kết quả chấm thiếu trường ở lần 1, tự gọi lại lần 2...', missing)
          await new Promise((r) => setTimeout(r, 400))
          return await doGrade(idToGrade, probTxt, linesToGrade, editedFlag, isRetake, 2)
        }
        setGradeError({ message: 'AI chấm chưa xong, mẹ bấm Thử lại giúp mình nhé.', retryArgs: [idToGrade, probTxt, linesToGrade, editedFlag, isRetake] })
        setStep('grade_error')
        return
      }

      setGradeResult(res)

      if (isRetake && res.self_fixed === 1) {
        // Con tự sửa đúng thành công!
        handleSelfFixedSuccess(res)
        setStep('celebration')
      } else if (res.ket_qua === 'dung_het') {
        // Bài làm ban đầu đã đúng hết
        handleAllCorrectSuccess(res)
        setStep('result_parent')
      } else {
        setStep('result_parent')
      }
    } catch (err) {
      console.error('Lỗi chấm bài (lần ' + attempt + '):', err)
      // Prompt 23L: khi bước chấm quá thời gian / lỗi mạng, tự gọi lại một lần (cùng check_id) trước khi hiện màn "Chưa chấm xong"
      if (attempt === 1 && err?.status !== 429) {
        console.warn('Lần 1 chấm gặp lỗi/quá thời gian, tự động gọi lại lần 2...')
        await new Promise((r) => setTimeout(r, 400))
        return await doGrade(idToGrade, probTxt, linesToGrade, editedFlag, isRetake, 2)
      }
      const msg =
        err?.status === 429
          ? 'Hôm nay đã dùng hết lượt chấm. Mẹ và bé quay lại vào ngày mai nhé!'
          : err?.data?.message || 'AI chấm chưa xong, mẹ bấm Thử lại giúp mình nhé.'
      setGradeError({ message: msg, retryArgs: err?.status === 429 ? null : [idToGrade, probTxt, linesToGrade, editedFlag, isRetake] })
      setStep('grade_error')
    }
  }

  // Xử lý cộng kẹo và ghi nhận khi con tự sửa thành công
  const handleSelfFixedSuccess = (res) => {
    soundFanfare()
    boom()

    const now = Date.now()
    const activeId = S.activeId
    const cStats = S.stats[activeId] || {}
    const curStudyLog = cStats.studyLog || []
    const todayKey = getStudyDateKey(now)
    const alreadyEarned = curStudyLog.some((e) => e.dateKey === todayKey)

    setAlreadyHadCandyTonight(alreadyEarned)

    if (!alreadyEarned) {
      setCandiesAdded(true)
      const newEntry = {
        id: 'sess_' + now + '_' + Math.random().toString(36).slice(2, 6),
        ts: now,
        dateKey: todayKey,
        problemType: `Chấm vở: Tự sửa được lỗi ${LOI_LABEL[res.loai_loi] || res.loai_loi || 'trong bài'}`,
        kind: 'check',
        errorType: res.loai_loi || (gradeResult && gradeResult.loai_loi) || null,
        minutes: 10,
        partial: false,
      }
      const updatedLog = [newEntry, ...curStudyLog]
      patch({
        stats: {
          ...S.stats,
          [activeId]: {
            ...cStats,
            studyLog: updatedLog,
          },
        },
      })
    }
  }

  const handleAllCorrectSuccess = (res) => {
    soundSuccess()
    boom()
  }

  // Chọn từ phương án thay thế
  const applyChoice = (lineIdx, choiceVal) => {
    const updated = lines.map((l, idx) => {
      if (idx !== lineIdx) return l
      // Thay số hoặc từ trong nội dung
      const oldNum = l.lua_chon?.[0] || ''
      const newContent = oldNum ? l.noi_dung.replace(oldNum, choiceVal) : choiceVal
      return { ...l, noi_dung: newContent, chac_chan: 0.95 }
    })
    setLines(updated)
    setLinesEdited(1)
    toast(`Đã đổi dòng ${lines[lineIdx].so} thành "${choiceVal}"`)
  }

  // Sửa thủ công dòng
  const saveManualEdit = (idx) => {
    if (!editingText.trim()) return
    const updated = lines.map((l, i) => (i === idx ? { ...l, noi_dung: editingText.trim(), chac_chan: 1.0 } : l))
    setLines(updated)
    setLinesEdited(1)
    setEditingLineIdx(null)
    setEditingText('')
    toast(`Đã cập nhật dòng ${lines[idx].so}`)
  }

  // Bài mẫu (chỉ trong Dùng thử): khớp với bài đang học trong Dùng thử
  const trialMode = isTrialActive()
  const handleUseSample = () => {
    const lesson = getActiveTrialLesson(problemText)
    const cv = TRIAL_LESSON_EXTRAS[lesson.id].cham_vo
    setProblemText(lesson.de_bai)
    setLines(cv.dong_sai.map((d) => ({ ...d })))
    setCheckId(`chk_sample_${lesson.id}_${Date.now()}`)
    setLinesEdited(0)
    setStep('review')
    toast('Đã nạp bài làm mẫu của đề đang học 📝')
  }

  // Thử chụp lại với bài đã sửa mẫu
  const handleUseSampleRetake = async () => {
    const lesson = getActiveTrialLesson(problemText)
    const fixedLines = TRIAL_LESSON_EXTRAS[lesson.id].cham_vo.dong_dung.map((d) => ({ ...d }))
    setLines(fixedLines)
    await doGrade(checkId, problemText, fixedLines, 0, true)
  }

  return (
    <div className="check-work-flow" data-testid="check-work-screen" style={{ paddingBottom: 24 }}>
      {/* 1. MÀN HÌNH CHỤP ẢNH VỞ */}
      {step === 'capture' && (
        <>
          <Header title={`Chụp vở của ${childName}`} back="home" />

          <div
            className="card"
            style={{
              padding: 16,
              background: 'var(--c-surface, #fff)',
              border: '2px solid var(--c-line, #E2E8F0)',
              borderRadius: 'var(--radius-card, 18px)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: '100%',
                height: 180,
                border: '2px dashed var(--c-line, #CBD5E1)',
                borderRadius: 14,
                background: 'var(--c-surface-2, #F8FAFC)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: 16,
                boxSizing: 'border-box',
              }}
            >
              <span style={{ fontSize: 44 }}>📸</span>
              <b style={{ fontSize: 15, color: 'var(--c-text)' }}>Đặt trang vở vào giữa khung chụp</b>
              <span style={{ fontSize: 12.5, color: 'var(--c-text-2)' }}>AI sẽ đọc từng dòng phép tính của con</span>
            </div>

            <div
              className="card"
              style={{
                width: '100%',
                padding: '12px 14px',
                background: 'var(--c-surface-2, #F1F5F9)',
                border: '1px solid var(--c-line)',
                textAlign: 'left',
                fontSize: 13,
                lineHeight: 1.5,
              }}
            >
              <b style={{ color: 'var(--c-text)', display: 'block', marginBottom: 4 }}>Để AI đọc đúng:</b>
              <div>• Chụp cả <b>đề và bài làm</b></div>
              <div>• Một bài mỗi lần, đủ sáng</div>
              <div>• Giữ máy thẳng, không che chữ</div>
            </div>

            <span style={{ fontSize: 12, color: 'var(--c-text-2)', display: 'flex', alignItems: 'center', gap: 4 }}>
              🔒 Ảnh chỉ dùng để đọc rồi xoá, không lưu trên máy chủ.
            </span>

            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) processAndReadImage(f)
              }}
            />

            <button
              data-testid="btn-capture-camera"
              className="btn-km btn-km-l btn-km-primary"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={() => fileInputRef.current?.click()}
            >
              <span className="btn-km-icon">📷</span>
              <span className="btn-km-text" style={{ textAlign: "center", flex: "none" }}>Chụp ảnh vở</span>
            </button>

            <button
              data-testid="btn-choose-photo"
              className="btn-km btn-km-m btn-km-secondary"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={() => fileInputRef.current?.click()}
            >
              <span>🖼️ Chọn ảnh có sẵn</span>
            </button>

            {trialMode && (
              <button
                type="button"
                data-testid="btn-sample-photo"
                className="btn-km-ghost"
                style={{
                  padding: "8px 12px",
                  fontSize: 13.5,
                  fontWeight: 700,
                  color: "var(--c-accent-ink, var(--c-accent))",
                  textDecoration: "underline",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  margin: "0 auto",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
                onClick={handleUseSample}
              >
                <span>⭐ Dùng bài làm mẫu (Dùng thử)</span>
              </button>
            )}
          </div>
        </>
      )}

      {/* 2. MÀN HÌNH ĐANG QUÉT ẢNH */}
      {step === 'scanning' && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 48, marginBottom: 16, animation: 'pulse-dot 1.2s infinite' }}>🔍</div>
          <h3 style={{ fontSize: 19, fontWeight: 800, color: 'var(--c-text)' }}>AI đang đọc chữ viết tay...</h3>
          <p style={{ fontSize: 14, color: 'var(--c-text-2)', marginTop: 6 }}>
            Đọc từng dòng bài giải của {childName}, giữ nguyên bài làm của con
          </p>
        </div>
      )}

      {/* 3. MÀN HÌNH AI ĐỌC, MẸ SOÁT */}
      {step === 'review' && (
        <>
          <Header title="AI đọc được thế này" back="home" rightAction={{ label: 'Chụp lại', onClick: () => setStep('capture') }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: 'var(--c-accent, #F6A623)',
                background: 'var(--c-surface-2, #F1F5F9)',
                padding: '4px 10px',
                borderRadius: 999,
              }}
            >
              ✨ Đọc chữ viết tay · {lines.length} dòng
            </span>
            <span style={{ fontSize: 12, color: 'var(--c-text-2)' }}>Mẹ chạm để sửa chỗ AI đọc nhầm</span>
          </div>

          {problemText && (
            <div className="check-work-line2" style={{ background: 'var(--c-surface-2)', borderStyle: 'dashed' }}>
              <span className="num-badge">Đề</span>
              <span className="content" style={{ fontSize: 13, fontWeight: 600 }}>{problemText}</span>
            </div>
          )}

          {lines.map((ln, idx) => {
            const isWarn = ln.chac_chan < 0.7
            const isEditing = editingLineIdx === idx

            return (
              <div key={idx} style={{ marginBottom: 10 }}>
                <div className={`check-work-line2 ${isWarn ? 'warn' : ''}`}>
                  <span className="num-badge">{ln.so || idx + 1}</span>
                  {isEditing ? (
                    <div style={{ display: 'flex', gap: 6, flex: 1 }}>
                      <input
                        type="text"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '6px 8px',
                          borderRadius: 8,
                          border: '1.5px solid var(--c-primary)',
                          fontSize: 14,
                          fontWeight: 700,
                        }}
                        autoFocus
                      />
                      <button className="btn primary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => saveManualEdit(idx)}>
                        Lưu
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="content">{ln.noi_dung}</span>
                      <button
                        className="edit-btn"
                        title="Sửa dòng này"
                        onClick={() => {
                          setEditingLineIdx(idx)
                          setEditingText(ln.noi_dung)
                        }}
                      >
                        ✎
                      </button>
                    </>
                  )}
                </div>

                {isWarn && !isEditing && ln.lua_chon && ln.lua_chon.length > 0 && (
                  <div
                    className="card"
                    style={{
                      padding: '8px 12px',
                      background: '#FFFBEB',
                      border: '1px solid #FCD34D',
                      borderRadius: 12,
                      marginTop: -4,
                      marginBottom: 8,
                      fontSize: 12.5,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                    }}
                  >
                    <span>
                      ⚠️ <b>AI chưa chắc một chữ ở dòng {ln.so}</b>: {childName} viết{' '}
                      <b>{ln.lua_chon.join(' hay ')}</b>?
                    </span>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {ln.lua_chon.map((opt) => (
                        <button
                          key={opt}
                          className="chip"
                          style={{
                            padding: '3px 10px',
                            fontWeight: 800,
                            fontSize: 12,
                            background: '#FDE68A',
                            color: '#78350F',
                            border: '1px solid #F59E0B',
                          }}
                          onClick={() => applyChoice(idx, opt)}
                        >
                          {opt}
                        </button>
                      ))}
                      <button
                        className="chip"
                        style={{ padding: '3px 10px', fontSize: 12, background: '#fff', border: '1px solid #CBD5E1' }}
                        onClick={() => {
                          setEditingLineIdx(idx)
                          setEditingText(ln.noi_dung)
                        }}
                      >
                        Mẹ sửa
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          <button
            data-testid="btn-confirm-grade"
            className="btn primary"
            style={{ width: '100%', padding: '14px', fontSize: 15, fontWeight: 800, marginTop: 12 }}
            onClick={() => doGrade(checkId, problemText, lines, linesEdited)}
          >
            Đúng rồi, chấm giúp mình
          </button>
        </>
      )}

      {/* 4. MÀN HÌNH ĐANG CHẤM */}
      {step === 'grading' && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 48, marginBottom: 16, animation: 'pulse-dot 1.2s infinite' }}>⚙️</div>
          <h3 style={{ fontSize: 19, fontWeight: 800, color: 'var(--c-text)' }}>AI đang chấm và kiểm tra phép tính...</h3>
          <p style={{ fontSize: 14, color: 'var(--c-text-2)', marginTop: 6 }}>
            Giải lại độc lập, kiểm tra từng phép tính và tìm bước sai đầu tiên
          </p>
        </div>
      )}

      {/* 4b. CHẤM LỖI / THIẾU TRƯỜNG */}
      {step === 'grade_error' && (
        <div data-testid="check-work-grade-error" style={{ textAlign: 'center', padding: '40px 14px' }}>
          <div style={{ fontSize: 46, marginBottom: 12 }}>🧐</div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--c-text)' }}>Chưa chấm xong</h3>
          <p style={{ fontSize: 14, color: 'var(--c-text-2)', margin: '8px 0 18px', lineHeight: 1.5 }}>{gradeError?.message}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {gradeError?.retryArgs && (
              <button className="btn primary solid" style={{ padding: 12 }} data-testid="btn-grade-retry" onClick={() => doGrade(...gradeError.retryArgs)}>
                🔄 Thử lại
              </button>
            )}
            <button className="btn ghost" style={{ padding: 12 }} onClick={() => setStep(lines.length ? 'review' : 'capture')}>
              ✏️ Xem lại các dòng bài làm
            </button>
          </div>
        </div>
      )}

      {/* 5. MÀN HÌNH KẾT QUẢ CHO MẸ (CHỈ MẸ THẤY) */}
      {step === 'result_parent' && gradeResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 88 }}>
          <TopBarT4
            title="Kết quả chấm vở"
            stepText="Chỉ mẹ thấy"
            onBack={() => setStep('capture')}
            onOpenCalm={() => openSheet('calm')}
          />

          {/* T6: Tóm tắt 1 dòng trên cùng */}
          <div
            className="card-km"
            style={{
              padding: '10px 14px',
              background: 'var(--c-surface)',
              borderRadius: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
            }}
          >
            <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--c-text)' }}>
              {gradeResult.ket_qua === 'dung_het' ? (
                <span style={{ color: 'var(--c-good, #2F7D4F)' }}>✓ Bài làm đúng hoàn toàn</span>
              ) : (
                <span>
                  Sai ở dòng {gradeResult.dong_sai_dau_tien || 1} ·{' '}
                  <span style={{ color: '#B4462F' }}>
                    {gradeResult.loai_loi === 'chon_phep_tinh' ? 'chọn phép tính' : gradeResult.loai_loi === 'tinh_nham' ? 'tính nhẩm' : gradeResult.loai_loi || 'cần sửa'}
                  </span>
                </span>
              )}
            </div>
            <span style={{ fontSize: 12, color: 'var(--c-sub)' }}>{lines.length} dòng</span>
          </div>

          {/* Vở bài làm có đánh dấu theo T6 */}
          <div
            className="card-km"
            style={{
              padding: '12px 14px',
              background: 'var(--c-surface)',
              borderRadius: 18,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {lines.map((ln, idx) => {
              const lineNum = ln.so || idx + 1
              const isWrongLine = lineNum === gradeResult.dong_sai_dau_tien
              const isCorrectLine = gradeResult.ket_qua === 'dung_het' || (gradeResult.dong_sai_dau_tien && lineNum < gradeResult.dong_sai_dau_tien)

              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    padding: '8px 12px',
                    borderRadius: 10,
                    background: isWrongLine ? '#FEF3C7' : isCorrectLine ? '#F0FDF4' : 'var(--c-bg)',
                    border: isWrongLine ? '1px solid #FCD34D' : isCorrectLine ? '1px solid #BBF7D0' : '1px solid var(--c-line)',
                    fontSize: 13.5,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--c-sub)', width: 16 }}>
                      {lineNum}
                    </span>
                    <span style={{ color: 'var(--c-text)', fontWeight: isWrongLine ? 700 : 500 }}>
                      {ln.noi_dung}
                    </span>
                  </div>

                  {isCorrectLine && (
                    <span style={{ color: '#16A34A', fontWeight: 900, fontSize: 14 }}>✓</span>
                  )}
                  {isWrongLine && (
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#92400E', background: '#FDE68A', padding: '2px 8px', borderRadius: 999 }}>
                      {gradeResult.loai_loi === 'chon_phep_tinh' ? 'Chọn phép tính' : 'Tính nhẩm'}
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          {/* Điểm sáng nền xanh nhạt */}
          {gradeResult.loi_khen_cu_the && (
            <div
              className="card-km card-km-good"
              style={{
                padding: '12px 14px',
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                borderRadius: 16,
              }}
            >
              <b style={{ color: '#065F46', fontSize: 13, display: 'block', marginBottom: 2 }}>
                🌟 Điểm sáng để khen {childName}
              </b>
              <div style={{ fontSize: 13, color: '#047857', lineHeight: 1.4 }}>
                {gradeResult.loi_khen_cu_the}
              </div>
            </div>
          )}

          {/* Đáp án đối chiếu cho mẹ: Nút Giữ có vòng chạy */}
          <div className="card-km" style={{ padding: '12px 14px', background: 'var(--c-surface)' }}>
            <label style={{ fontSize: 12, fontWeight: 800, color: 'var(--c-sub)', display: 'block', marginBottom: 6 }}>
              ĐÁP ÁN ĐỐI CHIẾU (CHỈ MẸ)
            </label>
            <HoldBtn
              label="Giữ 1.5s xem đáp án chuẩn"
              onHoldComplete={() => setIsHoldingAnswer(true)}
            />
            {isHoldingAnswer && (
              <div style={{ background: '#FFFBEB', border: '1px solid #FCD34D', padding: '10px 12px', borderRadius: 12, marginTop: 8, fontSize: 14, fontWeight: 800, color: '#92400E' }}>
                ✓ {gradeResult.dap_an_dung_cho_me || '19 cây bút'}
              </div>
            )}
          </div>

          {/* Nút Lớn dính đáy: Hỏi Na tự sửa (56px) */}
          <div
            className="bottom-action-bar-km"
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '10px 16px',
              background: 'var(--c-surface, #fff)',
              borderTop: '1px solid var(--c-line, #EADFCF)',
              zIndex: 90,
              boxShadow: '0 -4px 12px rgba(0,0,0,0.06)',
            }}
          >
            {gradeResult.ket_qua === 'dung_het' ? (
              <button
                type="button"
                className="btn-km btn-km-l btn-km-primary"
                style={{ width: '100%' }}
                onClick={() => go('home')}
              >
                Hoàn thành · Về trang chủ
              </button>
            ) : (
              <button
                type="button"
                data-testid="btn-view-child-question"
                className="btn-km btn-km-l btn-km-primary"
                style={{ width: '100%' }}
                onClick={() => setStep('result_child')}
              >
                <span>Hỏi {childName} tự sửa</span>
                <span className="btn-km-arrow">›</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 6. MÀN HÌNH CÂU HỎI ĐỂ CON TỰ SỬA (THEO KHUÔN MỚI) */}
      {step === 'result_child' && gradeResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 88 }}>
          <TopBarT4
            title={`Để ${childName} tự phát hiện`}
            stepText="Tự sửa lỗi"
            onBack={() => setStep('result_parent')}
            onOpenCalm={() => openSheet('calm')}
          />

          {/* Câu hỏi gợi mở mức 1 */}
          <div
            className="card-km card-km-ai"
            style={{
              padding: '16px 14px',
              background: 'var(--c-surface)',
              borderRadius: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <BuddyGreeter size={38} />
                <span style={{ fontSize: 11.5, fontWeight: 900, color: 'var(--c-primary)' }}>
                  GẤU GỢI Ý CÂU HỎI
                </span>
              </div>
              <button
                type="button"
                className="btn-km-chip"
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: 999,
                  background: 'var(--c-bg)',
                  border: '1px solid var(--c-line)',
                  cursor: 'pointer',
                }}
                onClick={() => speak(gradeResult.cau_hoi_cho_con?.muc_1)}
              >
                🔊 Đọc to
              </button>
            </div>

            <p
              style={{
                fontSize: 18,
                lineHeight: 1.4,
                fontWeight: 800,
                color: 'var(--c-text)',
                fontFamily: 'var(--font-head)',
                margin: '2px 0 0',
              }}
            >
              "{gradeResult.cau_hoi_cho_con?.muc_1 || 'Con đọc lại đề bài nhé. Phép tính này mình làm thế nào nhỉ?'}"
            </p>
            <span style={{ fontSize: 12, color: 'var(--c-sub)' }}>
              Mẹ đọc to câu trên để con tự nhìn lại bài của mình nhé.
            </span>
          </div>

          {/* Gợi ý mức 2 bằng đồ vật/hình vẽ */}
          {gradeResult.cau_hoi_cho_con?.muc_2 && (
            <div
              className="card-km"
              style={{
                padding: '12px 14px',
                background: 'var(--c-surface)',
                borderRadius: 16,
                cursor: 'pointer',
              }}
              onClick={() => setExpandHint2(!expandHint2)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <b style={{ fontSize: 13, color: 'var(--c-text)' }}>
                  💡 Gợi ý mức 2 (chỉ mở khi con vẫn chưa nhận ra)
                </b>
                <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--c-primary)' }}>
                  {expandHint2 ? 'Thu gọn ▲' : 'Mở xem ▼'}
                </span>
              </div>
              {expandHint2 && (
                <div style={{ marginTop: 8, fontSize: 13, color: 'var(--c-sub)', lineHeight: 1.4, borderTop: '1px dashed var(--c-line)', paddingTop: 8 }}>
                  {gradeResult.cau_hoi_cho_con.muc_2}
                </div>
              )}
            </div>
          )}

          {/* Triết lý sư phạm nhẹ nhàng */}
          <div
            className="card-km card-km-note"
            style={{
              padding: '10px 14px',
              borderRadius: 14,
            }}
          >
            <span style={{ fontSize: 12.5, color: 'var(--c-text)', lineHeight: 1.4 }}>
              ✨ <b>Gấu không chấm sẵn đáp án:</b> Để con tự tìm ra và tự sửa thì mới hiểu sâu và nhớ lâu!
            </span>
          </div>

          {/* Nút Lớn dính đáy */}
          <div
            className="bottom-action-bar-km"
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '10px 16px',
              background: 'var(--c-surface, #fff)',
              borderTop: '1px solid var(--c-line, #EADFCF)',
              zIndex: 90,
              boxShadow: '0 -4px 12px rgba(0,0,0,0.06)',
            }}
          >
            <button
              type="button"
              data-testid="btn-retake-fixed"
              className="btn-km btn-km-l btn-km-primary"
              style={{ width: '100%' }}
              onClick={() => setStep('retake')}
            >
              <span>{childName} sửa xong, chụp lại</span>
              <span className="btn-km-arrow">📷</span>
            </button>
          </div>
        </div>
      )}

      {/* 7. MÀN HÌNH CHỤP LẠI (RETAKE) */}
      {step === 'retake' && (
        <>
          <Header title={`Chụp lại vở của ${childName}`} back={() => setStep('result_child')} />

          <div
            className="card"
            style={{
              padding: 20,
              background: 'var(--c-surface)',
              border: '2px solid var(--c-line)',
              borderRadius: 18,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div style={{ fontSize: 44 }}>📷</div>
            <h3 style={{ fontSize: 17, fontWeight: 800, margin: 0, color: 'var(--c-text)' }}>
              Chụp lại bài sau khi {childName} đã sửa
            </h3>
            <p style={{ fontSize: 13, color: 'var(--c-text-2)', margin: 0 }}>
              AI sẽ chấm lại để ghi nhận <b>"con tự sửa được"</b> và cộng kẹo vào lọ!
            </p>

            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={retakeInputRef}
              style={{ display: 'none' }}
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) processAndReadImage(f, true)
              }}
            />

            <button
              data-testid="btn-take-retake-photo"
              className="btn primary"
              style={{ width: '100%', padding: '14px', fontSize: 15, fontWeight: 800, marginTop: 8 }}
              onClick={() => retakeInputRef.current?.click()}
            >
              📷 Chụp lại bài đã sửa
            </button>

            {(trialMode || String(checkId || '').startsWith('chk_sample')) && (
              <button
                data-testid="btn-sample-retake"
                className="chip"
                style={{ padding: '8px 14px', fontSize: 13, fontWeight: 700, background: '#FEF3C7', color: '#92400E', border: '1px solid #FCD34D' }}
                onClick={handleUseSampleRetake}
              >
                ✨ Dùng bài đã sửa mẫu
              </button>
            )}
          </div>
        </>
      )}

      {/* 8. MÀN HÌNH CHÚC MỪNG CON TỰ SỬA ĐÚNG (CELEBRATION) */}
      {step === 'celebration' && (
        <div style={{ textAlign: 'center', padding: '20px 8px' }}>
          <div style={{ fontSize: 60, marginBottom: 8 }}>🎉</div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: 'var(--c-text)', margin: '0 0 6px' }}>
            {childName} tự tìm ra lỗi sau 1 câu hỏi!
          </h2>
          <p style={{ fontSize: 14, color: 'var(--c-text-2)', marginBottom: 16 }}>
            Bé không cần chữa hộ mà tự tìm ra cách làm đúng!
          </p>

          {/* Vở bài làm đúng hết */}
          <div className="check-work-paper" style={{ textAlign: 'left', marginBottom: 14 }}>
            {lines.map((ln, idx) => (
              <div key={idx} className="ln ok">
                {ln.noi_dung}
              </div>
            ))}
          </div>

          <div
            className="card"
            style={{
              padding: '14px 16px',
              background: '#ECFDF5',
              border: '2px solid #10B981',
              borderRadius: 16,
              marginBottom: 12,
              textAlign: 'left',
            }}
          >
            <b style={{ color: '#065F46', fontSize: 15, display: 'block', marginBottom: 2 }}>
              {candiesAdded ? '🍬 +1 viên kẹo vào lọ!' : '🍬 Đã tính vào lọ kẹo tối nay'}
            </b>
            <div style={{ fontSize: 13, color: '#047857' }}>
              Ghi vào báo cáo tuần: <b>tự sửa được lỗi {gradeResult?.loai_loi === 'chon_phep_tinh' ? 'chọn phép tính' : gradeResult?.loai_loi || 'toán'}</b>.
            </div>
          </div>

          <div
            className="card"
            style={{
              padding: '12px 14px',
              background: 'var(--c-surface-2)',
              border: '1.5px solid var(--c-line)',
              borderRadius: 16,
              marginBottom: 20,
              textAlign: 'left',
              fontSize: 13,
              color: 'var(--c-text-2)',
            }}
          >
            <b style={{ color: 'var(--c-text)', display: 'block', marginBottom: 2 }}>🧠 AI theo dõi tiếp:</b>
            Lần sau gặp dạng bài này, AI sẽ nhắc {childName} chú ý từ khoá trước khi thực hiện phép tính.
          </div>

          <button
            data-testid="btn-done-check-work"
            className="btn primary"
            style={{ width: '100%', padding: '14px', fontSize: 16, fontWeight: 800 }}
            onClick={() => go('home')}
          >
            Xong, về trang chủ
          </button>
        </div>
      )}

      {/* 9. TRẠNG THÁI PHỤ: ẢNH MỜ / TỐI */}
      {step === 'blur' && (
        <div style={{ textAlign: 'center', padding: '30px 10px' }}>
          <div style={{ fontSize: 50, marginBottom: 12 }}>🌫️</div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--c-text)' }}>Mình chưa đọc rõ ảnh, mẹ chụp lại giúp nhé</h3>
          <p style={{ fontSize: 13.5, color: 'var(--c-text-2)', margin: '8px 0 16px' }}>
            {blurReason && !/chưa đọc rõ ảnh/i.test(blurReason) ? `(${blurReason}) ` : ''}
            Mẹ bật đèn, giữ chắc tay, chụp thẳng và gần trang vở của {childName} hơn nhé.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button className="btn primary" style={{ padding: '12px' }} onClick={() => setStep('capture')}>
              📷 Chụp lại ảnh khác
            </button>
            {trialMode && (
              <button className="btn ghost" style={{ padding: '12px' }} onClick={handleUseSample}>
                ✨ Dùng bài mẫu để thử tính năng
              </button>
            )}
          </div>
        </div>
      )}

      {/* 10. TRẠNG THÁI PHỤ: KHÔNG PHẢI BÀI LÀM */}
      {step === 'invalid_scope' && (
        <div style={{ textAlign: 'center', padding: '30px 10px' }}>
          <div style={{ fontSize: 50, marginBottom: 12 }}>🖼️</div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--c-text)' }}>Đây không phải bài làm của con</h3>
          <p style={{ fontSize: 13.5, color: 'var(--c-text-2)', margin: '8px 0 16px' }}>
            AI chỉ nhận diện trang vở bài tập, không nhận diện ảnh selfie, đồ chơi hay phong cảnh gia đình.
          </p>
          <button className="btn primary" style={{ width: '100%', padding: '12px' }} onClick={() => setStep('capture')}>
            📷 Chụp trang vở bài tập
          </button>
        </div>
      )}
    </div>
  )
}