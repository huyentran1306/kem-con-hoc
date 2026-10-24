import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { AppCtx } from './ctx'
import { PROBLEM, SCHEDULE_DEFAULT, EMOJIS, GRADES, BOOKS, CALM_LINES, AVAILABLE_STICKERS, SAMPLE_STICKER_HISTORY } from './data'
import { toast, onToast, speak, boom, fmtTime, markSampleStickers, getWeekLabel, getVnMondayStart } from './utils'
import { soundTap, soundPop, soundSuccess, soundWrong, soundBreathe, soundWoodBlock, soundFanfare, isSoundEnabled, toggleSound, onSoundChange } from './audio'
import { Stepper, VoiceInputBtn } from './ui'
import { dbKvGet, dbKvSet, aiPractice, aiExplain, saveTeachingFeedback, cloudLoadState, cloudSaveState, cloudDeleteFamily, getAuthToken, setAuthToken, removeAuthToken, loadPublicConfig } from './api'
import LoginScreen from './Login'
import AdminPortal from './Admin'
import * as Scr from './screens'
import { ThemePickerSheet } from './ThemePickerSheet'
import { ThemeDecor } from './ThemeDecor'
import { applyTheme } from './themes'
import { BookOpen, Sparkles, BarChart3, User } from 'lucide-react'
import { FamilyMembersSheet } from './FamilyMembersSheet'
import { JoinFamilyView } from './JoinFamilyView'
import { PublicReportView } from './PublicReportView'
import TeacherPortal from './TeacherPortal'
import { FamilyClassSheet } from './FamilyClassSheet'

const SESSION_KEY = 'kem-con-hoc:session'
const famLsKey = (id) => `kem-con-hoc:fam:${id}`
const famCloudKey = (id) => `fam:${id}:state`

const isAdminRoute = () => {
  if (typeof window === 'undefined') return false
  const p = window.location.pathname.toLowerCase()
  const h = window.location.hash.toLowerCase()
  return p === '/admin' || p.startsWith('/admin/') || p === '/admingraph' || p.startsWith('/admingraph/') || h === '#admin' || h.startsWith('#admin')
}

const isTeacherRoute = () => {
  if (typeof window === 'undefined') return false
  const p = window.location.pathname.toLowerCase()
  const h = window.location.hash.toLowerCase()
  return p === '/teacher' || p.startsWith('/teacher/') || h === '#teacher' || h.startsWith('#teacher')
}

const getJoinCodeFromUrl = () => {
  if (typeof window === 'undefined') return ''
  const p = window.location.pathname
  if (p.startsWith('/join/')) return p.replace('/join/', '').trim().toUpperCase()
  const params = new URLSearchParams(window.location.search)
  return (params.get('join') || params.get('join_code') || '').trim().toUpperCase()
}

const getReportTokenFromUrl = () => {
  if (typeof window === 'undefined') return ''
  const p = window.location.pathname
  if (p.startsWith('/r/')) return p.replace('/r/', '').trim()
  const params = new URLSearchParams(window.location.search)
  return (params.get('report') || params.get('r') || '').trim()
}

const readSession = () => {
  try {
    const s = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null')
    return s && s.id ? s : null
  } catch (e) {
    return null
  }
}

const defaultStats = (id) => ({
  stickers: 0,
  stickersList: [],
  stickerHistory: [],
  aiLongitudinalInsight: null,
  weak: [],
  strong: [],
  history: [],
  calmWeek: 0,
  calmLast: 0,
  calmHistory: [],
  sessionsMom: 0,
  sessionsDad: 0,
})

const initialState = () => ({
  onboarded: false,
  parent: 'Mẹ',
  tone: 'Nhẹ nhàng',
  partner: false,
  children: [{ id: 'na', name: 'Na', emoji: '🦄', grade: 'Lớp 3', book: 'Kết nối tri thức' }],
  activeId: 'na',
  stats: {
    na: {
      stickers: 2,
      stickersList: [
        { id: 's1', e: '🦄', n: 'Kỳ lân Kiên trì', desc: 'Không bỏ cuộc trước bài khó', when: 'T2' },
        { id: 's3', e: '🌟', n: 'Ngôi sao Sáng tạo', desc: 'Nghĩ ra cách giải độc đáo', when: 'T3' },
      ],
      stickerHistory: markSampleStickers(SAMPLE_STICKER_HISTORY),
      aiLongitudinalInsight: null,
      weak: [
        { n: 'Toán có lời văn 2 bước', v: 3, t: 4 },
        { n: 'Giờ hơn / giờ kém (Eng)', v: 2, t: 5 },
      ],
      strong: [{ n: 'Bảng nhân 4', v: 5, t: 5 }],
      history: [
        { txt: 'Bảng nhân 4 · làm được', when: 'T2' },
        { txt: 'Đọc giờ (Eng) · còn vướng', when: 'T3' },
      ],
      calmWeek: 3,
      calmLast: 6,
      calmHistory: [Date.now() - 86400000 * 3, Date.now() - 86400000 * 2, Date.now() - 86400000 * 1],
      sessionsMom: 0,
      sessionsDad: 0,
    },
  },
  schedule: SCHEDULE_DEFAULT,
  flow: { step: 0, stuck: 0, unlocked: false, result: null, ocr: PROBLEM.ocr },
  problem: PROBLEM,
  theme: 'bear',
  motion: 'full',
  cloudSync: true,
  _ts: 0,
})

function loadState(lsKey) {
  try {
    const raw = localStorage.getItem(lsKey)
    if (!raw) return initialState()
    const saved = JSON.parse(raw)
    const base = { ...initialState(), ...saved }
    if (base.stats) {
      Object.keys(base.stats).forEach((k) => {
        if (base.stats[k]?.stickerHistory) {
          base.stats[k].stickerHistory = markSampleStickers(base.stats[k].stickerHistory)
        }
      })
    }
    return base
  } catch (e) {
    return initialState()
  }
}

const TAB_OF = {
  home: 'home', snap: 'home', analyze: 'home', explain: 'home', scaffold: 'home', done: 'home', ask: 'home', chat: 'home',
  toy: 'toy', game: 'toy',
  report: 'report',
  profile: 'profile',
}

export default function App() {
  const [session, setSession] = useState(readSession)
  const [showAdmin, setShowAdmin] = useState(isAdminRoute)
  const [showTeacher, setShowTeacher] = useState(isTeacherRoute)
  const [joinCode, setJoinCode] = useState(getJoinCodeFromUrl)
  const [reportToken, setReportToken] = useState(getReportTokenFromUrl)
  const famId = session ? session.id : null
  const LS_KEY = famId ? famLsKey(famId) : 'kem-con-hoc:v1'
  const CLOUD_KEY = famId ? famCloudKey(famId) : 'kem-con-hoc:state'
  const [S, setS] = useState(() => (famId ? loadState(LS_KEY) : initialState()))
  const [screen, setScreen] = useState(S.onboarded ? 'home' : 'onb')
  const [sheet, setSheet] = useState(null)
  const [msg, setMsg] = useState('')
  const [study, setStudy] = useState(null)
  const scrollRef = useRef(null)
  const toastTimer = useRef(null)
  const cloudTimer = useRef(null)
  const hydratedRef = useRef(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const onHash = () => {
      if (isAdminRoute()) setShowAdmin(true)
      if (isTeacherRoute()) setShowTeacher(true)
    }
    window.addEventListener('hashchange', onHash)
    window.addEventListener('popstate', onHash)
    return () => {
      window.removeEventListener('hashchange', onHash)
      window.removeEventListener('popstate', onHash)
    }
  }, [])

  useEffect(() => {
    const off = onToast((m) => {
      setMsg(m)
      clearTimeout(toastTimer.current)
      toastTimer.current = setTimeout(() => setMsg(''), 2300)
    })
    return off
  }, [])

  /* ---------- áp dụng theme và hiệu ứng chuyển động ---------- */
  useEffect(() => {
    const userCustom = typeof localStorage !== 'undefined' ? localStorage.getItem('kem-con-hoc:user-custom-theme') : null
    const themeToApply = userCustom ? (S.theme || 'bear') : (S.theme || 'bear')
    applyTheme(themeToApply, S.motion || 'full')
  }, [S.theme, S.motion])

  /* ---------- đồng bộ screen theo trạng thái onboarded ---------- */
  useEffect(() => {
    if (!S.onboarded && screen !== 'onb') setScreen('onb')
    else if (S.onboarded && screen === 'onb') setScreen('home')
  }, [S.onboarded])

  /* ---------- tải cấu hình công khai (Prompt, Scope rules, Theme mặc định) ---------- */
  useEffect(() => {
    loadPublicConfig(true)
      .then((cfg) => {
        const defaultTheme = cfg?.themesConfig?.default
        if (defaultTheme) {
          const userCustomized = localStorage.getItem('kem-con-hoc:user-custom-theme')
          if (!userCustomized) {
            applyTheme(defaultTheme, S.motion || 'full')
            setS((prev) => ({ ...prev, theme: defaultTheme }))
          }
        }
      })
      .catch(() => { })
  }, [])

  /* ---------- hydrate từ đám mây (D1) khi mở app ---------- */
  useEffect(() => {
    if (!famId) return
    let cancelled = false
      ; (async () => {
        const cloud = await cloudLoadState(famId)
        if (cancelled) return
        let localRaw = null
        let localTs = 0
        try {
          localRaw = localStorage.getItem(LS_KEY)
          if (localRaw) localTs = JSON.parse(localRaw)._ts || 0
        } catch (e) { }

        // Đồng bộ khi máy này chưa có dữ liệu HOẶC dữ liệu trên cloud mới hơn máy này
        if (cloud && cloud.state && cloud.ts > 0 && (!localRaw || cloud.ts > localTs)) {
          setS({ ...initialState(), ...cloud.state, _ts: cloud.ts })
          toast('Đã đồng bộ dữ liệu mới nhất từ đám mây ☁️')
        }
        hydratedRef.current = true
        setHydrated(true)
      })()
    return () => {
      cancelled = true
    }
  }, [famId])

  /* ---------- lưu localStorage + đồng bộ cloud (debounce) ---------- */
  useEffect(() => {
    if (!famId) return
    const { screen: _s, study: _st, ...rest } = S
    const payload = { ...rest, _ts: Date.now() }
    if (!hydratedRef.current) return
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(payload))
    } catch (e) { }
    if (!S.cloudSync) return
    clearTimeout(cloudTimer.current)
    cloudTimer.current = setTimeout(async () => {
      const saveRes = await cloudSaveState(famId, payload, S._ts)
      if (saveRes && saveRes.conflict) {
        // Gộp state khi có xung đột (Section 3 Prompt 00)
        const serverStickers = saveRes.serverState?.stickerHistory || []
        const localStickers = payload.stickerHistory || []
        const mergedMap = new Map()
        serverStickers.forEach((st) => mergedMap.set(st.id || `${st.name}_${st.earnedAt}`, st))
        localStickers.forEach((st) => mergedMap.set(st.id || `${st.name}_${st.earnedAt}`, st))
        const mergedHistory = Array.from(mergedMap.values())
        setS((prev) => ({
          ...saveRes.serverState,
          ...prev,
          stickerHistory: mergedHistory,
          _ts: saveRes.serverTs,
        }))
        toast('Đã gộp dữ liệu đồng bộ an toàn ⭐️')
      }
    }, 2500)
  }, [S, hydrated, famId])

  /* ---------- study timer ---------- */
  useEffect(() => {
    if (!study || !study.running) return
    const t = setInterval(() => {
      setStudy((s) => {
        if (!s) return s
        const left = s.left - 1
        if (left > 0) return { ...s, left }
        if (s.phase === 'study') {
          if (s.round < s.rounds) {
            toast('⏸ Hết 15 phút! Nghỉ 5 phút nhé 💚')
            return { ...s, phase: 'break', left: 300 }
          }
          toast(`🎉 Xong ${s.rounds} vòng! Khen con thật to rồi nghỉ.`)
          return null
        }
        toast(`💪 Vòng ${s.round + 1} bắt đầu!`)
        return { ...s, phase: 'study', left: 900, round: s.round + 1 }
      })
    }, 1000)
    return () => clearInterval(t)
  }, [study && study.running])

  /* ---------- âm thanh toàn ứng dụng ---------- */
  const [soundOn, setSoundOn] = useState(isSoundEnabled)

  useEffect(() => {
    return onSoundChange((enabled) => setSoundOn(enabled))
  }, [])

  const handleToggleSound = () => {
    const next = toggleSound()
    setSoundOn(next)
    toast(next ? 'Đã bật âm thanh vui nhộn 🔊' : 'Đã tắt âm thanh 🔇')
  }

  /* ---------- actions ---------- */
  const patch = (obj) => setS((prev) => ({ ...prev, ...obj }))
  const go = (id) => {
    setScreen(id)
    requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: 0 }))
  }
  const openSheet = (type, data) => {
    if (type === 'calm') {
      const nowTs = Date.now()
      const curStats = S.stats[S.activeId] || defaultStats(S.activeId)
      const calmHist = [...(curStats.calmHistory || []), nowTs]
      const currentMonday = getVnMondayStart(nowTs)
      const prevMonday = currentMonday - 7 * 86400000
      const cWeek = calmHist.filter((t) => t >= currentMonday).length
      const cLast = calmHist.filter((t) => t >= prevMonday && t < currentMonday).length
      setS((prev) => ({
        ...prev,
        stats: {
          ...prev.stats,
          [prev.activeId]: {
            ...prev.stats[prev.activeId],
            calmHistory: calmHist,
            calmWeek: cWeek,
            calmLast: cLast,
          },
        },
      }))
    }
    setSheet({ type, data })
  }
  const closeSheet = () => setSheet(null)

  const rawStats = S.stats[S.activeId] || defaultStats(S.activeId)
  const stats = useMemo(() => {
    const calmHist = rawStats.calmHistory || []
    if (calmHist.length === 0) return rawStats
    const currentMonday = getVnMondayStart(Date.now())
    const prevMonday = currentMonday - 7 * 86400000
    const cWeek = calmHist.filter((t) => t >= currentMonday).length
    const cLast = calmHist.filter((t) => t >= prevMonday && t < currentMonday).length
    return { ...rawStats, calmWeek: cWeek, calmLast: cLast }
  }, [rawStats])

  const setStats = (obj) =>
    setS((prev) => ({ ...prev, stats: { ...prev.stats, [prev.activeId]: { ...prev.stats[prev.activeId], ...obj } } }))

  /* ---------- đăng nhập / đăng xuất ---------- */
  const handleAuthed = (s) => {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(s))
    } catch (e) { }
    const loaded = loadState(famLsKey(s.id))
    setSession(s)
    setS(loaded)
    hydratedRef.current = false
    setHydrated(false)
    setStudy(null)
    setScreen(loaded.onboarded ? 'home' : 'onb')
  }

  const logout = () => {
    try {
      localStorage.removeItem(SESSION_KEY)
      removeAuthToken()
    } catch (e) { }
    setSession(null)
    setStudy(null)
    setSheet(null)
    setScreen('onb')
  }

  const wipe = async () => {
    const confirmWipe = window.confirm('Bạn có chắc chắn muốn xoá toàn bộ dữ liệu gia đình không? Thao tác này sẽ xoá vĩnh viễn trên máy chủ.')
    if (!confirmWipe) return
    const pass = window.prompt('Nhập mật khẩu gia đình để xác nhận xoá toàn bộ:')
    if (!pass) return
    const delRes = await cloudDeleteFamily(pass)
    if (!delRes.ok) {
      alert(delRes.error || 'Mật khẩu xác nhận không đúng')
      return
    }
    try {
      localStorage.removeItem(LS_KEY)
      localStorage.removeItem(SESSION_KEY)
      removeAuthToken()
    } catch (e) { }
    location.reload()
  }

  const ctx = useMemo(
    () => ({
      S, patch, go, toast, openSheet, closeSheet, speak, boom, stats, setStats, study, setStudy,
      problem: S.problem || PROBLEM,
      logout,
      wipe,
      familyName: session ? session.name : '',
      famId: famId || null,
      openAdmin: () => setShowAdmin(true),
      soundOn,
      toggleSound: handleToggleSound,
    }),
    [S, stats, study, session, soundOn]
  )

  const child = S.children.find((c) => c.id === S.activeId) || S.children[0]
  const calmLabel = S.parent === 'Mẹ' ? 'Mẹ bình tĩnh' : S.parent === 'Bố' ? 'Bố bình tĩnh' : 'Mình bình tĩnh'

  const ScreenComp = Scr[screen === 'onb' ? 'Onboarding' : TAB_CAP[screen]] || Scr.Home

  if (showAdmin) {
    return (
      <AdminPortal
        onExit={() => {
          setShowAdmin(false)
          if (window.location.pathname.startsWith('/admin')) {
            window.history.pushState(null, '', '/')
          } else {
            window.location.hash = ''
          }
        }}
      />
    )
  }

  if (showTeacher) {
    return (
      <>
        <TeacherPortal
          onExit={() => {
            setShowTeacher(false)
            if (window.location.pathname.startsWith('/teacher')) {
              window.history.pushState(null, '', '/')
            } else {
              window.location.hash = ''
            }
          }}
        />
        {msg && (
          <div className="toast" role="status" style={{ zIndex: 99999 }}>
            {msg}
          </div>
        )}
      </>
    )
  }

  if (reportToken) {
    return (
      <PublicReportView
        reportToken={reportToken}
        onHome={() => {
          window.history.pushState(null, '', '/')
          setReportToken('')
        }}
      />
    )
  }

  if (joinCode) {
    return (
      <JoinFamilyView
        inviteCode={joinCode === 'ENTER_CODE' ? '' : joinCode}
        onJoined={(res) => {
          window.history.pushState(null, '', '/')
          setJoinCode('')
          window.location.reload()
        }}
        onCancel={() => {
          window.history.pushState(null, '', '/')
          setJoinCode('')
        }}
        toast={toast}
        boom={boom}
      />
    )
  }

  const hasToken = typeof window !== 'undefined' ? Boolean(getAuthToken()) : true
  if (!session || (session && !hasToken)) {
    return (
      <AppCtx.Provider value={ctx}>
        <ThemeDecor themeId={S.theme || 'bear'} motion={S.motion || 'full'} />
        <LoginScreen
          onAuthed={handleAuthed}
          reauthSession={session && !hasToken ? session : null}
          onOpenJoin={() => setJoinCode('ENTER_CODE')}
        />
      </AppCtx.Provider>
    )
  }

  return (
    <AppCtx.Provider value={ctx}>
      <div className="stage">
        <ThemeDecor themeId={S.theme || 'bear'} motion={S.motion || 'full'} />
        <div className="app">
          <div className="scroll" ref={scrollRef}>
            {study && study.running && (
              <button className="timer-chip" onClick={() => openSheet('timer')}>
                {study.phase === 'study' ? '📚 Học' : '☕ Nghỉ'} · {fmtTime(study.left)}{' '}
                <small>vòng {study.round}/{study.rounds} · bấm để quản lý</small>
              </button>
            )}
            <div key={screen} className="fadeIn" style={{ display: 'contents' }}>
              <ScreenComp />
            </div>
          </div>

          {S.onboarded && (
            <nav className="tabs">
              {[
                ['home', BookOpen, 'Học tối nay'],
                ['toy', Sparkles, 'Trò chơi'],
                ['report', BarChart3, 'Báo cáo'],
                ['profile', User, 'Con tôi'],
              ].map(([k, IconComp, l]) => {
                const isOn = TAB_OF[screen] === k
                return (
                  <button key={k} className={isOn ? 'on' : ''} onClick={() => go(k)}>
                    <span className="ic" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                      <IconComp size={21} strokeWidth={isOn ? 2.4 : 1.8} />
                    </span>
                    <span>{l}</span>
                  </button>
                )
              })}
            </nav>
          )}

          {S.onboarded && (
            <button className="calm-fab" onClick={() => openSheet('calm')}>
              😮‍💨 {calmLabel}
            </button>
          )}

          <div className={`toast ${msg ? 'show' : ''}`}>{msg}</div>

          {sheet && <SheetView type={sheet.type} data={sheet.data} session={session} />}
        </div>
      </div>
    </AppCtx.Provider>
  )
}

const TAB_CAP = {
  home: 'Home', snap: 'SnapHomework', analyze: 'Analyze', explain: 'Explain',
  scaffold: 'Scaffold', done: 'Done', ask: 'AskAI', chat: 'AskAI', toy: 'SnapToy',
  game: 'Game', report: 'Report', profile: 'Profile',
}

/* ============================================================
   CÁC POPUP (BOTTOM SHEET)
   ============================================================ */
function SheetView({ type, session }) {
  const { S, patch, go, closeSheet, toast, stats, setStats, boom } = useContext(AppCtx)
  const child = S.children.find((c) => c.id === S.activeId) || S.children[0]

  if (type === 'calm') return <CalmSheet />
  if (type === 'timer') return <TimerSheet />
  if (type === 'breakHint') {
    const handleLowerDifficulty = async () => {
      closeSheet()
      patch({ flow: { ...S.flow, stuck: 0, lowering: true } })
      toast('AI đang hạ độ khó với số nhỏ hơn 🪜⚡')
      try {
        const textToUse = S.problem?.ocr || S.flow?.ocr || PROBLEM.ocr
        const lowerRes = await aiExplain(textToUse, child, S.tone, '', true)
        if (lowerRes && lowerRes.steps && lowerRes.steps.length > 0) {
          patch({
            problem: { ...lowerRes, isSample: false },
            flow: { ...S.flow, step: 0, stuck: 0, lowering: false },
          })
          toast('✅ Đã hạ độ khó! Con thử làm với số dễ hơn nhé')
        } else {
          patch({ flow: { ...S.flow, stuck: 0, lowering: false } })
          toast('Mạng chậm — thử lại sau nhé')
        }
      } catch (err) {
        patch({ flow: { ...S.flow, stuck: 0, lowering: false } })
        toast('Mạng chậm — thử lại sau nhé')
      }
    }

    return (
      <Sheet>
        <p className="title">Con bí 2 lần rồi 🙈</p>
        <p className="sub">
          Nghỉ <b>3 phút</b> uống nước nhé. Trẻ học tốt hơn sau một quãng nghỉ ngắn.
        </p>
        <div className="card coral">
          <span className="lbl coral">Nói với con</span>
          <span style={{ fontSize: 14 }}>"Bài này khó thật, {S.parent.toLowerCase()} cũng phải nghĩ. Mình uống nước rồi vẽ lại nha."</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
          <button className="btn solid" onClick={handleLowerDifficulty} style={{ background: '#D97706', borderColor: '#B45309' }}>
            🪜 Hạ độ khó (đổi số nhỏ hơn)
          </button>
          <button className="btn ghost" onClick={() => { patch({ flow: { ...S.flow, stuck: 1 } }); closeSheet() }}>
            Nghỉ xong, quay lại bài hiện tại
          </button>
        </div>
      </Sheet>
    )
  }

  if (type === 'practice') return <PracticeSheet />
  if (type === 'addChild') return <AddChildSheet />
  if (type === 'invite' || type === 'members') {
    return (
      <FamilyMembersSheet
        onClose={closeSheet}
        toast={toast}
        currentUser={session?.member || { role: 'owner', displayName: S.parent }}
        familyName={session ? session.name : S.familyName || 'Gia đình'}
      />
    )
  }
  if (type === 'familyClasses') {
    return (
      <Sheet>
        <FamilyClassSheet
          token={getAuthToken()}
          activeChild={child}
          onClose={closeSheet}
        />
      </Sheet>
    )
  }
  if (type === 'reportIssue') return <ReportIssueSheet problem={S.problem || PROBLEM} />
  if (type === 'wipe') return <WipeSheet />
  if (type === 'typeProblem') return <TypeProblemSheet />
  if (type === 'stickerBook') return <StickerBookSheet />
  if (type === 'pwa') return <PwaSheet />
  if (type === 'redeem') return <RedeemRewardSheet />
  if (type === 'themePicker') return <Sheet><ThemePickerSheet onClose={closeSheet} /></Sheet>
  return null
}

function Sheet({ children }) {
  const { closeSheet } = useContext(AppCtx)
  return (
    <div className="sheet" onClick={(e) => e.target === e.currentTarget && closeSheet()}>
      <div className="pn">
        <div className="grabber" />
        {children}
      </div>
    </div>
  )
}

/* ---------- MẸ BÌNH TĨNH ---------- */
function CalmSheet() {
  const { closeSheet, toast, S, soundOn, toggleSound } = useContext(AppCtx)
  const [phase, setPhase] = useState('Hít vào…')

  useEffect(() => {
    soundBreathe('in')
    const t = setInterval(() => {
      setPhase((prev) => {
        const next = prev === 'Hít vào…' ? 'Thở ra…' : 'Hít vào…'
        soundBreathe(next === 'Hít vào…' ? 'in' : 'out')
        return next
      })
    }, 4200)
    return () => clearInterval(t)
  }, [])

  return (
    <Sheet>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <p className="title" style={{ margin: 0, fontSize: 19 }}>Hít thở cùng mình 30 giây</p>
        <button
          className={`sound-pill-btn ${!soundOn ? 'off' : ''}`}
          onClick={toggleSound}
          title={soundOn ? 'Âm thanh đang bật (Bấm để tắt)' : 'Âm thanh đang tắt (Bấm để bật)'}
          data-no-sound
        >
          {soundOn ? '🔊 Bật tiếng' : '🔇 Tắt tiếng'}
        </button>
      </div>
      <div className="breath-wrap">
        <div className="breath">{phase}</div>
        <span className="sub">Hít 4 giây · thở ra 4 giây</span>
      </div>
      <div className="card coral">
        <span className="lbl coral">Thay vì nói</span>
        <span className="strike" style={{ fontSize: 15 }}>"{CALM_LINES.replace}"</span>
      </div>
      <div className="card mint">
        <span className="lbl mint">Thử nói</span>
        <span style={{ fontSize: 15 }}>"{CALM_LINES.trySay}"</span>
      </div>
      <button className="btn solid" onClick={() => { closeSheet(); toast(`${S.parent} làm tốt lắm 💚`) }}>
        Mình ổn rồi
      </button>
    </Sheet>
  )
}

/* ---------- HẸN GIỜ ---------- */
function TimerSheet() {
  const { closeSheet, toast, study, setStudy } = useContext(AppCtx)
  const [rounds, setRounds] = useState(study?.rounds || 1)

  const start = () => {
    setStudy({ phase: 'study', left: 900, rounds, round: 1, running: true })
    closeSheet()
    toast('Đã bắt đầu 15 phút học ⏱')
  }

  const stop = () => {
    setStudy(null)
    toast('Đã hủy hẹn giờ')
  }

  return (
    <Sheet>
      <p className="title">Hẹn giờ học</p>
      <p className="sub">Học <b>15 phút</b>, nghỉ <b>5 phút</b>. Tối đa 3 vòng — đủ để não con nghỉ mà vẫn giữ nếp.</p>

      {study && (
        <div className="card plum">
          <span className="lbl plum">Đang chạy</span>
          <div className="timer">{fmtTime(study.left)}</div>
          <span className="sub" style={{ textAlign: 'center' }}>
            {study.phase === 'study' ? '📚 Học' : '☕ Nghỉ'} · vòng {study.round}/{study.rounds}
          </span>
          <div className="btns">
            <button className="btn solid" onClick={() => setStudy({ ...study, running: !study.running })}>
              {study.running ? '⏸ Tạm dừng' : '▶ Tiếp tục'}
            </button>
            <button className="btn ghost" onClick={stop}>Đặt lại</button>
          </div>
        </div>
      )}

      {!study && (
        <>
          <Stepper value={rounds} onChange={setRounds} min={1} max={3} label="Số vòng" />
          <button className="btn solid" onClick={start}>Bắt đầu</button>
        </>
      )}
    </Sheet>
  )
}

/* ---------- LUYỆN THÊM (AI tạo bài cùng dạng) ---------- */
function PracticeSheet() {
  const { S, closeSheet, toast } = useContext(AppCtx)
  const [item, setItem] = useState(null)
  const problem = S.problem || PROBLEM
  const child = S.children.find((c) => c.id === S.activeId) || S.children[0]

  useEffect(() => {
    let cancelled = false
      ; (async () => {
        const p = await aiPractice(problem, child)
        if (!cancelled) setItem(p || { text: 'Bố mua 4 túi kẹo, mỗi túi 6 viên. Bố cho Na 7 viên. Hỏi bố còn bao nhiêu viên kẹo?', answer: '4 × 6 = 24 · 24 − 7 = 17 viên kẹo' })
      })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <Sheet>
      <p className="title">1 bài cùng dạng ✏️</p>
      {!item ? (
        <div className="card plum">
          <span className="lbl plum">⏳ AI đang tạo bài…</span>
          <span className="sub">Cùng dạng, số liệu khác, đúng sách {child.book}</span>
        </div>
      ) : (
        <>
          <div className="photo">{item.text}</div>
          <div className="card mint">
            <span className="lbl mint">Đáp án ({S.parent.toLowerCase()} đối chiếu)</span>
            <b>{item.answer}</b>
          </div>
          <button className="btn solid" onClick={() => { closeSheet(); toast('Bắt đầu bài luyện thêm nhé! 💪') }}>
            Con làm thử nhé
          </button>
        </>
      )}
    </Sheet>
  )
}

/* ---------- MỜI BỐ CÙNG KÈM CON ---------- */
function InviteSheet() {
  const { S, patch, closeSheet, toast, familyName } = useContext(AppCtx)
  const [copied, setCopied] = useState(false)
  const url = typeof window !== 'undefined' ? window.location.origin : ''
  const shareUrl =
    'https://zalo.me/share?url=' + encodeURIComponent(url) +
    '&title=' + encodeURIComponent(`Kèm Con Học — ${familyName || 'gia đình mình'} mời bạn cùng kèm con mỗi tối`)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast('Đã sao chép link 📋')
    } catch (e) {
      toast('Không copy được — bấm giữ ô link để copy nhé')
    }
  }

  return (
    <Sheet>
      <p className="title">Mời bố cùng kèm con 📲</p>
      <p className="sub">
        App không tự nhắn tin được — bạn hãy <b>sao chép link</b> rồi gửi cho bố, hoặc bấm{' '}
        <b>Chia sẻ qua Zalo</b> để mở sẵn khung nhắn. Bố mở link, tạo tài khoản gia đình riêng là xong.
      </p>
      <div className="card">
        <span className="lbl plum">Link mời</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            className="field"
            readOnly
            value={url}
            onFocus={(e) => e.target.select()}
            style={{ flex: 1, fontSize: 13 }}
          />
          <button className="btn solid grow0" style={{ width: 'auto', padding: '12px 14px' }} onClick={copy}>
            {copied ? '✓ Đã copy' : 'Sao chép'}
          </button>
        </div>
        <span className="sub">Bấm vào ô link để chọn toàn bộ, rồi sao chép.</span>
      </div>
      <button
        className="btn soft"
        onClick={() => {
          patch({ partner: true })
          closeSheet()
          window.open(shareUrl, '_blank')
          toast('Đã mở Zalo — gửi link cho bố nhé 📲')
        }}
      >
        Chia sẻ qua Zalo
      </button>
    </Sheet>
  )
}

/* ---------- GÓP Ý GIẢNG CHƯA ĐÚNG (Feature 5) ---------- */
const FEEDBACK_REASONS = ['OCR sai', 'Sai cách hướng dẫn', 'Quá khó với con', 'Quá dễ', 'Đáp án sai', 'Khác']

function ReportIssueSheet({ problem }) {
  const { closeSheet, toast, famId } = useContext(AppCtx)
  const [reason, setReason] = useState('')
  const [comment, setComment] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    if (!reason) {
      toast('Chọn một lý do nhé 🚩')
      return
    }
    setSaving(true)
    const payload = {
      familyId: famId || '',
      problemType: (problem.type || problem.ocr || '').slice(0, 80),
      reason,
      comment: comment.trim(),
    }
    // Lưu vào D1 (teaching_feedback) — fallback localStorage nếu mạng lỗi
    const ok = await saveTeachingFeedback(payload)
    if (!ok) {
      try {
        const arr = JSON.parse(localStorage.getItem('kem-con-hoc:feedback') || '[]')
        arr.push({ at: Date.now(), reason, comment: comment.trim(), problem: (problem.ocr || '').slice(0, 160) })
        localStorage.setItem('kem-con-hoc:feedback', JSON.stringify(arr.slice(-50)))
      } catch (e) { }
    }
    setSaving(false)
    closeSheet()
    toast(ok ? 'Đã gửi góp ý — cảm ơn bạn, AI sẽ được cải thiện 💛' : 'Đã lưu góp ý trên máy (mạng chậm) 💛')
  }

  return (
    <Sheet>
      <p className="title">Giảng chưa đúng chỗ nào? 🚩</p>
      <p className="sub">Chọn lý do giúp mình cải thiện bài giảng cho đúng hơn.</p>
      <div className="opt-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {FEEDBACK_REASONS.map((r) => (
          <button
            key={r}
            className={`opt ${reason === r ? 'on' : ''}`}
            onClick={() => { soundTap(); setReason(r) }}
          >
            {r}
          </button>
        ))}
      </div>
      <div style={{ marginTop: 10 }}>
        <span className="lbl plum">Ghi chú thêm (tuỳ chọn)</span>
        <textarea
          className="field"
          rows={3}
          placeholder="VD: Hướng dẫn chưa đúng phương pháp SGK, gợi ý chung chung…"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>
      <div className="btns">
        <button className="btn ghost" onClick={closeSheet}>Bỏ qua</button>
        <button className="btn solid" disabled={saving} onClick={submit}>
          {saving ? 'Đang gửi…' : 'Gửi góp ý'}
        </button>
      </div>
    </Sheet>
  )
}

/* ---------- THÊM CON ---------- */
function AddChildSheet() {
  const { S, patch, closeSheet, toast } = useContext(AppCtx)
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('🐰')
  const [grade, setGrade] = useState('Lớp 1')
  const [book, setBook] = useState(BOOKS[0])

  const save = () => {
    if (S.children.length >= 4) {
      toast('Tối đa 4 bé nhé 💛')
      return
    }
    if (!name.trim()) { toast('Đặt biệt danh cho bé nhé 🐣'); return }
    const id = 'c' + Date.now().toString(36)
    const kids = [...S.children, { id, name: name.trim(), emoji, grade, book }]
    patch({
      children: kids,
      activeId: id,
      stats: { ...S.stats, [id]: defaultStats(id) },
    })
    closeSheet()
    toast(`Đã thêm bé ${name.trim()} ${emoji} 🎉`)
  }

  return (
    <Sheet>
      <p className="title">Thêm con</p>
      <div className="card">
        <span className="lbl plum">Biệt danh</span>
        <input className="field" placeholder="VD: Bon, Miu…" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="card">
        <span className="lbl plum">Avatar</span>
        <div className="chips" style={{ gap: 4 }}>
          {EMOJIS.map((e) => (
            <button
              key={e}
              onClick={() => setEmoji(e)}
              style={{
                fontSize: 22, width: 40, height: 40, borderRadius: 12,
                background: emoji === e ? 'var(--plum-tint)' : '#fff',
                border: emoji === e ? '2px solid var(--plum)' : '1.5px solid var(--line)',
              }}
            >
              {e}
            </button>
          ))}
        </div>
      </div>
      <div className="card">
        <span className="lbl plum">Lớp</span>
        <div className="opt-grid">
          {GRADES.map((x) => (
            <button key={x} className={`opt ${grade === x ? 'on' : ''}`} onClick={() => setGrade(x)}>{x}</button>
          ))}
        </div>
      </div>
      <div className="card">
        <span className="lbl plum">Bộ sách</span>
        <div className="opt-grid" style={{ gridTemplateColumns: '1fr' }}>
          {BOOKS.map((x) => (
            <button key={x} className={`opt col ${book === x ? 'on' : ''}`} onClick={() => setBook(x)}>{x}</button>
          ))}
        </div>
      </div>
      <button className="btn solid" onClick={save}>Thêm bé</button>
    </Sheet>
  )
}

/* ---------- XÓA DỮ LIỆU ---------- */
function WipeSheet() {
  const { closeSheet, wipe } = useContext(AppCtx)
  return (
    <Sheet>
      <p className="title">Xóa toàn bộ dữ liệu?</p>
      <p className="sub">
        Hồ sơ con, lịch sử, sticker, báo cáo… <b>tất cả sẽ mất vĩnh viễn</b> (cả bản đám mây). Không thể khôi phục.
      </p>
      <div className="btns">
        <button className="btn ghost" onClick={closeSheet}>Giữ lại</button>
        <button className="btn solid" style={{ background: 'var(--red)', boxShadow: 'none' }} onClick={wipe}>
          Xóa hết
        </button>
      </div>
    </Sheet>
  )
}

/* ---------- GÕ ĐỀ HOẶC ĐỌC ĐỀ BẰNG GIỌNG NÓI ---------- */
function TypeProblemSheet() {
  const { S, patch, go, closeSheet, toast } = useContext(AppCtx)
  const [text, setText] = useState(PROBLEM.ocr)
  const save = () => {
    patch({ flow: { ...S.flow, ocr: text.trim() || PROBLEM.ocr } })
    closeSheet()
    toast('Đã nhận đề, AI đang đọc…')
    go('analyze')
  }

  const handleVoiceInput = (speechText) => {
    soundSuccess()
    setText((prev) => (prev ? prev + ' ' + speechText : speechText))
    toast('🎙️ Đã nhận diện giọng nói: "' + speechText + '"')
  }

  return (
    <Sheet>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p className="title" style={{ margin: 0 }}>Gõ hoặc Đọc đề bài</p>
      </div>
      <p className="sub" style={{ margin: '4px 0 10px' }}>Ba mẹ có thể gõ hoặc bấm nút mic để đọc đề trực tiếp.</p>

      <div style={{ marginBottom: 12 }}>
        <VoiceInputBtn onResult={handleVoiceInput} placeholder="Bấm mic & Đọc đề bài" />
      </div>

      <textarea
        className="field"
        rows={4}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Nội dung đề bài toán..."
      />
      <div className="btns" style={{ marginTop: 8 }}>
        <button className="btn solid" onClick={save}>🚀 AI đọc đề này</button>
      </div>
    </Sheet>
  )
}

/* ---------- SỔ DÁN STICKER CỦA BÉ ---------- */
function StickerBookSheet() {
  const { S, openSheet, closeSheet, boom } = useContext(AppCtx)
  const child = S.children.find((c) => c.id === S.activeId) || S.children[0]
  const curStats = S.stats[child.id] || {}
  const list = (curStats.stickersList || []).filter((x) => !x.sample)
  const distinct = new Set(list.map((x) => x.id || x.e || x.name)).size
  const [selected, setSelected] = useState(null)

  const isUnlocked = (stk) => list.some((x) => x.id === stk.id || x.e === stk.e || x.name === stk.n)
  const getRecord = (stk) => list.find((x) => x.id === stk.id || x.e === stk.e || x.name === stk.n)

  const clickSticker = (stk) => {
    const rec = getRecord(stk)
    if (rec) {
      soundSuccess()
      boom()
      setSelected({ ...stk, ...rec })
    } else {
      soundPop(450)
      setSelected(stk)
    }
  }

  return (
    <Sheet>
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <p className="title" style={{ margin: '0 0 4px' }}>📖 Sổ dán Sticker của {child.name}</p>
        <span className="sub">
          Đã sưu tập <b>{distinct}/{AVAILABLE_STICKERS.length}</b> loại huy hiệu · tổng <b>{list.length}</b> sticker ✨
          {curStats.rewardCount > 0 && (
            <span style={{ color: '#D97706', display: 'block', marginTop: 2, fontWeight: 700 }}>
              🏆 Đã hoàn thành {curStats.rewardCount} chặng đổi quà cùng bố mẹ!
            </span>
          )}
        </span>
      </div>

      {/* 10 Stickers milestone celebration card */}
      {(curStats.stickers >= 10 || list.length >= 10) && (
        <div className="card sun pop" style={{ border: '2px solid #F59E0B', background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)', marginBottom: 12, textAlign: 'center', padding: '14px 12px' }}>
          <div style={{ fontSize: 36, marginBottom: 4 }}>🎁 🏆 🍦</div>
          <b style={{ color: '#78350F', fontSize: 16 }}>ĐỦ 10 HUY HIỆU — ĐỔI QUÀ CHO BÉ!</b>
          <div style={{ color: '#92400E', fontSize: 13, margin: '4px 0 10px', lineHeight: 1.4 }}>
            Chúc mừng {child.name} đã tích đủ 10 sticker nỗ lực! {S.parent} bấm để mở phiếu đổi quà và bắt đầu chặng mới nhé.
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

      {/* Selected sticker detail card */}
      {selected && (
        <div
          className="card pop"
          style={{
            textAlign: 'center',
            padding: '14px 12px',
            marginBottom: 12,
            border: `2px solid ${selected.border || '#DDD6FE'}`,
            background: selected.bg || '#F5F3FF',
          }}
        >
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: 18,
              background: '#FFFFFF',
              border: `2px solid ${selected.border || '#DDD6FE'}`,
              color: selected.color || '#7C3AED',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 26,
              margin: '0 auto 8px',
              boxShadow: `0 4px 12px ${selected.color || '#7C3AED'}25`,
            }}
          >
            <i className={selected.fa || 'fa-solid fa-award'} />
          </div>
          <b style={{ fontSize: 16, color: selected.color || 'var(--plum-deep)' }}>{selected.n}</b>
          <div style={{ margin: '4px 0 6px' }}>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: '#FFFFFF', color: selected.color || '#7C3AED', border: `1px solid ${selected.border || '#DDD6FE'}` }}>
              Phẩm chất: {selected.trait || 'Kiên nhẫn'}
            </span>
          </div>
          <div style={{ fontSize: 13, color: '#475569', margin: '4px 0 8px' }}>{selected.desc}</div>
          {isUnlocked(selected) ? (
            <span className="pill g">✓ Đã dán vào sổ ({selected.when || 'Hôm nay'})</span>
          ) : (
            <span className="pill c">🔒 Chưa mở khóa — hoàn thành thêm bài học để nhận nhé!</span>
          )}
        </div>
      )}

      {/* Grid of 12 stickers with FontAwesome tone-sur-tone */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, padding: '4px 0' }}>
        {AVAILABLE_STICKERS.map((stk) => {
          const unlocked = isUnlocked(stk)
          const isCurrent = selected && selected.id === stk.id
          const cnt = list.filter((x) => x.id === stk.id || x.e === stk.e || x.name === stk.n).length
          return (
            <button
              key={stk.id}
              onClick={() => clickSticker(stk)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '10px 6px',
                borderRadius: 16,
                border: isCurrent
                  ? `2px solid ${stk.color || 'var(--accent)'}`
                  : unlocked
                    ? `1.5px solid ${stk.border || '#FCD34D'}`
                    : '1.5px dashed #CBD5E1',
                background: unlocked
                  ? stk.bg || '#FFFBEB'
                  : '#F8FAFC',
                boxShadow: unlocked ? `0 4px 12px ${stk.color || '#F59E0B'}18` : 'none',
                cursor: 'pointer',
                opacity: unlocked ? 1 : 0.65,
                transition: 'all .2s ease',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  background: unlocked ? '#FFFFFF' : '#E2E8F0',
                  border: `1.5px solid ${unlocked ? stk.border : '#CBD5E1'}`,
                  color: unlocked ? stk.color : '#94A3B8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  transform: isCurrent ? 'scale(1.12)' : 'none',
                  transition: 'transform .2s',
                  boxShadow: unlocked ? `0 2px 8px ${stk.color}20` : 'none',
                }}
              >
                <i className={stk.fa || 'fa-solid fa-award'} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 800, color: unlocked ? stk.color : '#94A3B8', marginTop: 6, textAlign: 'center', lineHeight: 1.2 }}>
                {stk.trait || stk.n.split(' ')[0]}
              </span>
              <span style={{ fontSize: 9.5, color: unlocked ? '#64748B' : '#94A3B8', marginTop: 2 }}>
                {!unlocked ? 'Chưa mở' : cnt > 1 ? `Đã có ×${cnt}` : 'Đã có'}
              </span>
            </button>
          )
        })}
      </div>

      {curStats.rewardHistory && curStats.rewardHistory.length > 0 && (
        <div style={{ marginTop: 14, padding: '10px 12px', background: '#FEF3C7', borderRadius: 12, border: '1px solid #FCD34D' }}>
          <b style={{ fontSize: 13, color: '#92400E', display: 'flex', alignItems: 'center', gap: 6 }}>
            🏆 Nhật ký đổi quà của con ({curStats.rewardHistory.length} chặng):
          </b>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>
            {curStats.rewardHistory.map((rh, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#FFFFFF',
                  padding: '6px 10px',
                  borderRadius: 8,
                  fontSize: 12.5,
                  color: '#78350F',
                  border: '1px solid #FDE68A',
                }}
              >
                <span><b>Chặng {rh.round || idx + 1}:</b> {rh.title}</span>
                <span style={{ fontSize: 11, color: '#B45309', whiteSpace: 'nowrap' }}>{rh.when}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {curStats.stickers < 10 && (
        <div style={{ textAlign: 'center', marginTop: 10 }}>
          <button
            onClick={() => openSheet('redeem')}
            style={{
              background: 'none',
              border: 'none',
              color: '#B45309',
              fontSize: 12,
              textDecoration: 'underline',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            🎁 Hoặc mở phiếu đổi quà sớm cho {child.name} (nếu có thưởng đặc biệt)
          </button>
        </div>
      )}

      <button className="btn solid" style={{ width: '100%', marginTop: 14 }} onClick={closeSheet}>
        Đóng sổ tay
      </button>
    </Sheet>
  )
}

/* ---------- PHIẾU ĐỔI QUÀ 10 STICKER ---------- */
function RedeemRewardSheet() {
  const { S, setStats, closeSheet, toast, boom } = useContext(AppCtx)
  const child = S.children.find((c) => c.id === S.activeId) || S.children[0]
  const curStats = S.stats[child.id] || {}
  const [selectedReward, setSelectedReward] = useState('🍦 Đi ăn que kem yêu thích cùng bố mẹ')
  const [customReward, setCustomReward] = useState('')

  const REWARD_OPTIONS = [
    '🍦 Đi ăn que kem yêu thích cùng bố mẹ',
    '📚 1 cuốn truyện tranh / sách mới ở nhà sách',
    '🎡 1 buổi đi khu vui chơi cuối tuần',
    '🍕 1 bữa pizza / gà rán liên hoan gia đình',
    '🎨 1 bộ màu vẽ / đồ chơi nhỏ con thích',
  ]

  const confirmRedeem = () => {
    const finalReward = customReward.trim() || selectedReward
    const round = (curStats.rewardCount || 0) + 1
    const newHistory = [
      ...(curStats.rewardHistory || []),
      { title: finalReward, when: 'Hôm nay', round },
    ]
    const generalHistory = [
      ...(curStats.history || []),
      { txt: `🎁 Đổi quà Chặng ${round}: ${finalReward}`, when: 'Hôm nay' },
    ]

    setStats({
      stickers: 0, // Reset counter to 0 for next 10 stickers
      stickersList: [], // Reset sổ sticker cho chặng mới
      rewardCount: round,
      rewardHistory: newHistory,
      history: generalHistory,
    })

    soundFanfare()
    boom()
    closeSheet()
    toast(`🎉 Đã đổi quà thành công: ${finalReward}! Bắt đầu chặng ${round + 1} mới 🚀`)
  }

  return (
    <Sheet>
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 52, animation: 'float 2s ease-in-out infinite' }}>🏆 🎁 ✨</div>
        <p className="title" style={{ margin: '4px 0 2px', color: '#B45309' }}>
          ĐỦ 10 HUY HIỆU — ĐỔI QUÀ CHO {child.name.toUpperCase()}!
        </p>
        <span className="sub">
          Chúc mừng {child.name} đã hoàn thành xuất sắc 10 buổi học nỗ lực. {S.parent} và con cùng chọn phần quà nhé:
        </span>
      </div>

      <div className="card sun" style={{ border: '2px solid #F59E0B', background: '#FFFBEB', padding: '12px' }}>
        <span className="lbl sun" style={{ fontWeight: 700 }}>Chọn phần quà thực tế:</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, margin: '8px 0' }}>
          {REWARD_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => { soundPop(550); setSelectedReward(opt); setCustomReward('') }}
              style={{
                display: 'flex',
                alignItems: 'center',
                textAlign: 'left',
                padding: '10px 12px',
                borderRadius: 10,
                border: selectedReward === opt && !customReward ? '2px solid #D97706' : '1px solid #FDE68A',
                background: selectedReward === opt && !customReward ? '#FEF3C7' : '#FFFFFF',
                fontWeight: selectedReward === opt && !customReward ? 700 : 500,
                fontSize: 13.5,
                color: '#78350F',
                cursor: 'pointer',
              }}
            >
              {opt}
            </button>
          ))}
        </div>

        <div style={{ marginTop: 8 }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: '#92400E' }}>Hoặc {S.parent.toLowerCase()} tự nhập phần quà riêng:</span>
          <input
            className="field"
            style={{ marginTop: 4, fontSize: 13.5 }}
            placeholder="Ví dụ: 1 chuyến xem phim rạp, 1 buổi bơi..."
            value={customReward}
            onChange={(e) => setCustomReward(e.target.value)}
          />
        </div>
      </div>

      <button
        className="btn solid"
        style={{ width: '100%', padding: '14px', fontSize: 15, fontWeight: 700, marginTop: 12, background: 'linear-gradient(135deg, #D97706, #B45309)', boxShadow: '0 4px 14px rgba(217,119,6,0.35)' }}
        onClick={confirmRedeem}
      >
        🎁 {S.parent} xác nhận đổi quà & Đặt lại sổ mới ➔
      </button>
    </Sheet>
  )
}

/* ---------- CÀI ĐẶT APP RA MÀN HÌNH CHÍNH (PWA) ---------- */
function PwaSheet() {
  const { closeSheet, toast } = useContext(AppCtx)
  const isIos = typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent)

  return (
    <Sheet>
      <div style={{ textAlign: 'center', marginBottom: 10 }}>
        <div style={{ fontSize: 44, marginBottom: 4 }}>🌸 📲</div>
        <p className="title" style={{ margin: 0 }}>Cài Kèm Con Học vào điện thoại</p>
        <span className="sub">Mở app toàn màn hình mượt mà, không bị vướng thanh địa chỉ web</span>
      </div>

      {isIos ? (
        <div className="card sky" style={{ textAlign: 'left', lineHeight: 1.6 }}>
          <b style={{ color: 'var(--plum-deep)' }}>📱 Dành cho iPhone / iPad (Safari):</b>
          <div style={{ fontSize: 13.5, marginTop: 6 }}>
            1. Bấm nút <b>Chia sẻ</b> <span style={{ fontSize: 16 }}>⎋</span> ở cạnh dưới thanh Safari.<br />
            2. Cuộn xuống và chọn <b>"Thêm vào MH chính"</b> (Add to Home Screen) <span style={{ fontSize: 16 }}>⊞</span>.<br />
            3. Bấm <b>Thêm</b> (Add) ở góc trên bên phải là xong!
          </div>
        </div>
      ) : (
        <div className="card mint" style={{ textAlign: 'left', lineHeight: 1.6 }}>
          <b style={{ color: 'var(--plum-deep)' }}>📱 Dành cho Android (Chrome):</b>
          <div style={{ fontSize: 13.5, marginTop: 6 }}>
            1. Bấm dấu <b>3 chấm ⋮</b> ở góc trên bên phải trình duyệt Chrome.<br />
            2. Chọn <b>"Cài đặt ứng dụng"</b> hoặc <b>"Thêm vào Màn hình chính"</b>.<br />
            3. Xác nhận để app xuất hiện ngay cạnh các ứng dụng thường dùng!
          </div>
        </div>
      )}

      <button className="btn solid" style={{ width: '100%', marginTop: 10 }} onClick={() => { closeSheet(); toast('Chúc gia đình mình có những buổi học vui vẻ 💚') }}>
        Đã hiểu, đóng hướng dẫn
      </button>
    </Sheet>
  )
}