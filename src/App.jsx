import { appAlert, appConfirm, appPrompt } from './dialog'
import { useContext, useEffect, useMemo, useRef, useState, Component, lazy, Suspense } from 'react'
import { AppCtx } from './ctx'
import { PROBLEM, SCHEDULE_DEFAULT, EMOJIS, GRADES, BOOKS, CALM_LINES, AVAILABLE_STICKERS, SAMPLE_STICKER_HISTORY } from './data'
import { toast, onToast, speak, boom, fmtTime, markSampleStickers, getWeekLabel, getVnMondayStart } from './utils'
import { soundTap, soundPop, soundSuccess, soundWrong, soundBreathe, soundWoodBlock, soundFanfare, isSoundEnabled, toggleSound, onSoundChange } from './audio'
import { Stepper, VoiceInputBtn } from './ui'
import { dbKvGet, dbKvSet, aiPractice, aiExplain, saveTeachingFeedback, cloudLoadState, cloudSaveState, cloudDeleteFamily, getAuthToken, setAuthToken, removeAuthToken, loadPublicConfig, fetchClassPreview, sendAiFeedback, getSafetySummary } from './api'
import * as Scr from './screens'
import { ThemePickerSheet } from './ThemePickerSheet'
import { ThemeDecor } from './ThemeDecor'
import { applyTheme } from './themes'
import { BookOpen, Sparkles, BarChart3, User } from 'lucide-react'
import { ThemedTabIcon } from './themes/themeIcons'
import { SeasonParticles } from './seasons/SeasonParticles'
import { useStudyTracker } from './useStudyTracker'
import { CalmCornerModal } from './CalmCornerModal'
import { ErrorBoundary } from './ErrorBoundary'
import { initClientErrorLogging } from './clientErrors'
import { getTrialInitialState, TRIAL_SESSION, PRELOADED_TRIAL_LESSONS, setActiveTrialLesson } from './trialData'

initClientErrorLogging()

const LoginScreen = lazy(() => import('./Login'))
const AdminPortal = lazy(() => import('./Admin'))
const TeacherPortal = lazy(() => import('./TeacherPortal'))
const FamilyMembersSheet = lazy(() => import('./FamilyMembersSheet').then(m => ({ default: m.FamilyMembersSheet })))
const JoinFamilyView = lazy(() => import('./JoinFamilyView').then(m => ({ default: m.JoinFamilyView })))
const PublicReportView = lazy(() => import('./PublicReportView').then(m => ({ default: m.PublicReportView })))
const FamilyClassSheet = lazy(() => import('./FamilyClassSheet').then(m => ({ default: m.FamilyClassSheet })))
import { BuddyPopLayer } from './themes/buddies/buddySvgs'

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

const PENDING_JOIN_KEY = 'kem-con-hoc:pending-join'

const getClassJoinFromUrl = () => {
  if (typeof window === 'undefined') return null
  const p = window.location.pathname
  const h = window.location.hash || ''
  if (p.startsWith('/vao-lop/m/')) {
    return { code: p.replace('/vao-lop/m/', '').trim().toUpperCase(), type: 'claim' }
  }
  if (p.startsWith('/vao-lop/')) {
    return { code: p.replace('/vao-lop/', '').trim().toUpperCase(), type: 'class' }
  }
  if (h.startsWith('#vao-lop/m/')) {
    return { code: h.replace('#vao-lop/m/', '').trim().toUpperCase(), type: 'claim' }
  }
  if (h.startsWith('#vao-lop/')) {
    return { code: h.replace('#vao-lop/', '').trim().toUpperCase(), type: 'class' }
  }
  const params = new URLSearchParams(window.location.search)
  const qClass = params.get('class') || params.get('join_class') || params.get('class_code')
  if (qClass) return { code: qClass.trim().toUpperCase(), type: 'class' }
  const qClaim = params.get('claim') || params.get('claim_code')
  if (qClaim) return { code: qClaim.trim().toUpperCase(), type: 'claim' }
  return null
}

const getPendingJoin = () => {
  try {
    const raw = localStorage.getItem(PENDING_JOIN_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (Date.now() - parsed.ts > 30 * 60 * 1000) {
      localStorage.removeItem(PENDING_JOIN_KEY)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

const setPendingJoin = (code, type) => {
  try {
    localStorage.setItem(PENDING_JOIN_KEY, JSON.stringify({ code, type, ts: Date.now() }))
  } catch {}
}

const clearPendingJoin = () => {
  try {
    localStorage.removeItem(PENDING_JOIN_KEY)
  } catch {}
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
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const magicToken = params.get('magic_token') || params.get('auth_token') || (params.get('token') && !params.get('report') && !params.get('r') && !window.location.pathname.startsWith('/r/') ? params.get('token') : null)
      if (magicToken) {
        setAuthToken(magicToken)
        const famId = params.get('family_id') || params.get('fam_id') || 'fam_magic'
        const famName = params.get('family_name') || params.get('name') || 'Gia đình Vui Vẻ'
        const sess = { id: famId, name: famName, token: magicToken }
        localStorage.setItem(SESSION_KEY, JSON.stringify(sess))
        return sess
      }
    }
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
    if (lsKey && lsKey.includes('fam_trial')) {
      return getTrialInitialState()
    }
    const raw = localStorage.getItem(lsKey)
    const savedTheme = typeof localStorage !== 'undefined' ? localStorage.getItem('kem-con-hoc:theme') : null
    const savedMotion = typeof localStorage !== 'undefined' ? localStorage.getItem('kem-con-hoc:motion') : null
    if (!raw) {
      const init = initialState()
      if (savedTheme) init.theme = savedTheme
      if (savedMotion) init.motion = savedMotion
      return init
    }
    const saved = JSON.parse(raw)
    const base = { ...initialState(), ...saved }
    if (savedTheme && !saved.theme) base.theme = savedTheme
    if (savedMotion && !saved.motion) base.motion = savedMotion
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

class ScreenErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, info) {
    console.error('Screen crash caught by ScreenErrorBoundary:', error, info)
  }
  componentDidUpdate(prevProps) {
    if (prevProps.screen !== this.props.screen && this.state.hasError) {
      this.setState({ hasError: false, error: null })
    }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="card" style={{ textAlign: 'center', padding: '36px 20px', margin: '20px 0' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🐻 🍯</div>
          <h3 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 8px', color: 'var(--c-text)' }}>
            Có chút trục trặc nhỏ khi nạp trang này
          </h3>
          <p style={{ fontSize: 13, color: 'var(--c-text-2)', margin: '0 0 16px' }}>
            Bạn đừng lo nhé! Bấm nút bên dưới để quay lại màn hình chính nhé.
          </p>
          <button
            className="btn solid"
            onClick={() => {
              this.setState({ hasError: false, error: null })
              this.props.onReset && this.props.onReset()
            }}
            style={{ margin: '0 auto', maxWidth: 220 }}
          >
            Quay lại trang chính
          </button>
        </div>
      )
    }
    return this.props.children
  }
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
  const [classJoinBanner, setClassJoinBanner] = useState(null)
  const [msg, setMsg] = useState('')
  const [study, setStudy] = useState(null)
  const scrollRef = useRef(null)
  // Đợt 15 chặng 6: dải Dùng thử thu gọn, mở thẳng tab đăng ký, nút nổi thu tròn khi cuộn
  const [trialCollapsed, setTrialCollapsed] = useState(false)
  const [loginMode, setLoginMode] = useState('login')
  const [fabCompact, setFabCompact] = useState(false)
  const lastScrollTopRef = useRef(0)
  const toastTimer = useRef(null)
  const cloudTimer = useRef(null)
  const lastServerTsRef = useRef(null)
  const isMergingRef = useRef(false)
  const hydratedRef = useRef(false)
  const lastSavedHashRef = useRef('')
  const [hydrated, setHydrated] = useState(false)
  // Đợt 15 P0.D: trạng thái tải state từ máy chủ ('loading' | 'ok' | 'error')
  const [cloudStatus, setCloudStatus] = useState(famId && !session?.isTrial ? 'loading' : 'ok')
  const [cloudRetry, setCloudRetry] = useState(0)

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

  /* ---------- kiểm tra link vào lớp học (/vao-lop/:code) ---------- */
  useEffect(() => {
    const classJoin = getClassJoinFromUrl()
    if (classJoin) {
      setPendingJoin(classJoin.code, classJoin.type)
      if (session && getAuthToken()) {
        openSheet('familyClasses', { code: classJoin.code, joinType: classJoin.type })
      } else {
        fetchClassPreview(classJoin.code).then((res) => {
          if (res?.ok && res.class) {
            setClassJoinBanner(res.class)
          }
        }).catch(() => {})
      }
    } else {
      const pending = getPendingJoin()
      if (pending) {
        if (session && getAuthToken()) {
          clearPendingJoin()
          openSheet('familyClasses', { code: pending.code, joinType: pending.type })
        } else {
          fetchClassPreview(pending.code).then((res) => {
            if (res?.ok && res.class) {
              setClassJoinBanner(res.class)
            }
          }).catch(() => {})
        }
      }
    }
  }, [session])

  /* ---------- áp dụng theme và hiệu ứng chuyển động ---------- */
  useEffect(() => {
    applyTheme(S.theme || 'bear', S.motion || 'full')
  }, [S.theme, S.motion])

  /* ---------- đồng bộ screen theo trạng thái onboarded ---------- */
  useEffect(() => {
    // Đợt 18 · Chặng 0.6: Chỉ hiện màn khai báo sau khi đã tải xong dữ liệu đám mây (hydrated)
    if (famId && !session?.isTrial && !hydrated) return
    if (!S.onboarded && screen !== 'onb') setScreen('onb')
    else if (S.onboarded && screen === 'onb') setScreen('home')
  }, [S.onboarded, hydrated, famId, session])

  /* ---------- tải cấu hình công khai (Scope rules, Theme mặc định) ---------- */
  useEffect(() => {
    loadPublicConfig(false)
      .then((cfg) => {
        const themesCfg = cfg?.themesConfig
        const defaultTheme = themesCfg?.default
        const forceAll = Boolean(themesCfg?.forceAll)
        const forceVersion = themesCfg?.forceVersion || 0
        const lastAppliedForce = parseInt(localStorage.getItem('kem-con-hoc:last-applied-force-theme') || '0', 10)

        if (defaultTheme) {
          const userCustomized = localStorage.getItem('kem-con-hoc:user-custom-theme')
          if (forceAll) {
            // Admin ép đổi giao diện cho TẤT CẢ người dùng (kể cả ai đã tự setup)
            if (forceVersion > lastAppliedForce || localStorage.getItem('kem-con-hoc:theme') !== defaultTheme) {
              try {
                localStorage.removeItem('kem-con-hoc:user-custom-theme')
                localStorage.setItem('kem-con-hoc:last-applied-force-theme', String(forceVersion || Date.now()))
              } catch (e) {}
              applyTheme(defaultTheme, S.motion || 'full')
              setS((prev) => ({ ...prev, theme: defaultTheme }))
            }
          } else {
            // Chỉ áp dụng cho người dùng chưa từng tự setup giao diện
            if (!userCustomized) {
              applyTheme(defaultTheme, S.motion || 'full')
              setS((prev) => ({ ...prev, theme: defaultTheme }))
            }
          }
        }
      })
      .catch(() => { })
  }, [])

  /* ---------- hydrate từ đám mây (D1) khi mở app ---------- */
  useEffect(() => {
    if (!famId) return
    let cancelled = false
    if (!session?.isTrial) setCloudStatus('loading')
      ; (async () => {
        const cloud = await cloudLoadState(famId)
        if (cancelled) return
        if (cloud && cloud.error) {
          // Không tải được state: KHÔNG hiện màn khai báo, KHÔNG ghi đè máy chủ
          setCloudStatus('error')
          return
        }
        let localRaw = null
        let localTs = 0
        try {
          localRaw = localStorage.getItem(LS_KEY)
          if (localRaw) localTs = JSON.parse(localRaw)._ts || 0
        } catch (e) { }

        if (cloud && cloud.serverTs) {
          lastServerTsRef.current = cloud.serverTs
        }

        let localOnboarded = false
        try {
          localOnboarded = Boolean(localRaw && JSON.parse(localRaw).onboarded)
        } catch (e) { }
        const cloudOnboarded = Boolean(cloud?.state?.onboarded)
        const cloudHasChildren = Array.isArray(cloud?.state?.children) && cloud.state.children.length > 0
        // Đồng bộ khi máy này chưa có dữ liệu HOẶC cloud mới hơn
        // HOẶC máy này chưa khai báo mà máy chủ đã khai báo / đã có hồ sơ con (P0.D)
        if (
          cloud && cloud.state &&
          ((cloud.ts > 0 && (!localRaw || cloud.ts > localTs)) || (!localOnboarded && (cloudOnboarded || cloudHasChildren)))
        ) {
          let nextState = { ...initialState(), ...cloud.state, _ts: cloud.ts }
          if (cloudOnboarded || cloudHasChildren) {
            nextState.onboarded = true
          }
          const userCustomized = localStorage.getItem('kem-con-hoc:user-custom-theme')
          const lastAppliedForce = parseInt(localStorage.getItem('kem-con-hoc:last-applied-force-theme') || '0', 10)
          if (!userCustomized && lastAppliedForce > 0) {
            const currentTheme = localStorage.getItem('kem-con-hoc:theme')
            if (currentTheme) {
              nextState.theme = currentTheme
            }
          }
          isMergingRef.current = true
          setS(nextState)
          toast('Đã đồng bộ dữ liệu mới nhất từ đám mây ☁️')
        }
        try {
          const { screen: _s, study: _st, _ts: _t, ...initRest } = (cloud?.state || S)
          lastSavedHashRef.current = JSON.stringify(initRest)
        } catch (e) {}
        hydratedRef.current = true
        setHydrated(true)
        setCloudStatus('ok')
      })()
    return () => {
      cancelled = true
    }
  }, [famId, cloudRetry])

  /* ---------- lưu localStorage + đồng bộ cloud (debounce & hash check P2.8) ---------- */
  useEffect(() => {
    if (!famId) return
    const { screen: _s, study: _st, _ts: _t, ...rest } = S
    if (!hydratedRef.current) return

    let serialized = ''
    try {
      serialized = JSON.stringify(rest)
    } catch (e) {
      serialized = ''
    }

    const payload = { ...rest, _ts: Date.now() }
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(payload))
    } catch (e) { }

    if (isMergingRef.current) {
      isMergingRef.current = false
      lastSavedHashRef.current = serialized
      return
    }

    if (!S.cloudSync || session?.isTrial) return
    // P0.D: chưa khai báo xong thì không ghi lên máy chủ (tránh đè hồ sơ con đã có)
    if (!S.onboarded) return
    // Chỉ ghi cloud khi state thực sự thay đổi nội dung (P2.8)
    if (lastSavedHashRef.current === serialized) {
      return
    }

    clearTimeout(cloudTimer.current)
    cloudTimer.current = setTimeout(async () => {
      const saveRes = await cloudSaveState(famId, payload, lastServerTsRef.current)
      if (saveRes && saveRes.saved && saveRes.ts) {
        lastServerTsRef.current = saveRes.ts
        lastSavedHashRef.current = serialized
      } else if (saveRes && saveRes.conflict) {
        lastServerTsRef.current = saveRes.serverTs || null
        // Gộp state khi có xung đột (Section 3 Prompt 00)
        const serverStickers = saveRes.serverState?.stickerHistory || []
        const localStickers = payload.stickerHistory || []
        const mergedMap = new Map()
        serverStickers.forEach((st) => mergedMap.set(st.id || `${st.name}_${st.earnedAt}`, st))
        localStickers.forEach((st) => mergedMap.set(st.id || `${st.name}_${st.earnedAt}`, st))
        const mergedHistory = Array.from(mergedMap.values())
        
        isMergingRef.current = true
        setS((prev) => ({
          ...saveRes.serverState,
          ...prev,
          stickerHistory: mergedHistory,
          _ts: saveRes.serverTsMs || Date.now(),
        }))
        lastSavedHashRef.current = JSON.stringify({ ...saveRes.serverState, stickerHistory: mergedHistory })
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
  const patch = (obj) => setS((prev) => (typeof obj === 'function' ? obj(prev) : { ...prev, ...obj }))
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
    setLoginMode('login')
    setTrialCollapsed(false)
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(s))
      if (s?.isTrial) setAuthToken('trial_token')
    } catch (e) { }
    const loaded = s?.isTrial ? getTrialInitialState() : loadState(famLsKey(s.id))
    setSession(s)
    setS(loaded)
    if (s?.isTrial) {
      hydratedRef.current = true
      setHydrated(true)
      setCloudStatus('ok')
    } else {
      // Chờ tải state từ máy chủ rồi mới quyết định có hiện màn khai báo không (P0.D)
      hydratedRef.current = false
      setHydrated(false)
      setCloudStatus('loading')
    }
    setStudy(null)
    setScreen(loaded.onboarded ? 'home' : 'onb')

    const pending = getPendingJoin()
    if (pending && !s?.isTrial) {
      clearPendingJoin()
      openSheet('familyClasses', { code: pending.code, joinType: pending.type })
    }
  }

  const logout = () => {
    try {
      localStorage.removeItem(SESSION_KEY)
      removeAuthToken()
      localStorage.removeItem('kem-con-hoc:fam:fam_trial')
    } catch (e) { }
    setSession(null)
    setStudy(null)
    setSheet(null)
    setScreen('onb')
  }

  // 6.6: ✕ chỉ thu gọn dải; thoát Dùng thử là nút riêng có xác nhận
  const exitTrial = async () => {
    const ok = await appConfirm('Những gì vừa thử trong chế độ này sẽ không được lưu lại.', { title: 'Thoát chế độ dùng thử?', okText: 'Thoát dùng thử', cancelText: 'Ở lại' })
    if (!ok) return
    setLoginMode('login')
    logout()
  }
  const startRegisterFromTrial = () => {
    setLoginMode('register')
    logout()
  }

  const handleScrollFab = (e) => {
    const top = e.currentTarget.scrollTop
    const last = lastScrollTopRef.current
    lastScrollTopRef.current = top
    if (top < 40) {
      if (fabCompact) setFabCompact(false)
      return
    }
    if (top > last + 4 && !fabCompact) setFabCompact(true)
    else if (top < last - 4 && fabCompact) setFabCompact(false)
  }

  const wipe = async (opts = {}) => {
    const confirmWipe = opts && opts.confirmed ? true : await appConfirm('Toàn bộ dữ liệu gia đình sẽ bị xoá vĩnh viễn trên máy chủ, không khôi phục được.', { title: 'Xoá toàn bộ dữ liệu?', okText: 'Tiếp tục', danger: true })
    if (!confirmWipe) return
    const pass = await appPrompt('Nhập mật khẩu gia đình để xác nhận xoá toàn bộ.', { title: 'Xác nhận bằng mật khẩu', type: 'password', okText: 'Xoá vĩnh viễn', danger: true, required: true })
    if (!pass) return
    const delRes = await cloudDeleteFamily(pass)
    if (!delRes.ok) {
      appAlert(delRes.error || 'Mật khẩu xác nhận không đúng.', { title: 'Chưa xoá được' })
      return
    }
    try {
      localStorage.removeItem(LS_KEY)
      localStorage.removeItem(SESSION_KEY)
      removeAuthToken()
    } catch (e) { }
    location.reload()
  }

  const tracker = useStudyTracker(S.activeId, S, setS)

  const ctx = useMemo(
    () => ({
      S, patch, go, toast, openSheet, closeSheet, speak, boom, stats, setStats, study, setStudy,
      tracker,
      problem: S.problem || PROBLEM,
      logout,
      wipe,
      session,
      familyName: session ? session.name : '',
      famId: famId || null,
      openAdmin: () => setShowAdmin(true),
      soundOn,
      toggleSound: handleToggleSound,
    }),
    [S, stats, study, session, soundOn, tracker]
  )

  const child = S.children.find((c) => c.id === S.activeId) || S.children[0]
  const calmLabel = S.parent === 'Mẹ' ? 'Mẹ bình tĩnh' : S.parent === 'Bố' ? 'Bố bình tĩnh' : 'Mình bình tĩnh'

  const waitingServerState = Boolean(famId && !session?.isTrial && (!hydrated || cloudStatus === 'loading'))
  const ServerStateGate = () =>
    cloudStatus === 'error' ? (
      <div style={{ textAlign: 'center', padding: '80px 20px' }} data-testid="server-state-error">
        <div style={{ fontSize: 44, marginBottom: 10 }}>☁️</div>
        <p className="title" style={{ fontSize: 19 }}>Chưa tải được dữ liệu gia đình</p>
        <p className="sub">Mạng đang chập chờn. Hồ sơ của con vẫn an toàn trên máy chủ.</p>
        <button className="btn primary solid" style={{ marginTop: 14, padding: '12px 22px' }} onClick={() => setCloudRetry((n) => n + 1)}>
          🔄 Thử lại
        </button>
      </div>
    ) : (
      <div style={{ textAlign: 'center', padding: '90px 20px', color: 'var(--c-text-2)' }} data-testid="server-state-loading">
        <div style={{ fontSize: 40, marginBottom: 10 }}>🐻</div>
        Đang tải dữ liệu gia đình…
      </div>
    )
  const ScreenComp = waitingServerState
    ? ServerStateGate
    : Scr[screen === 'onb' ? 'Onboarding' : TAB_CAP[screen]] || Scr.Home

  if (showAdmin) {
    return (
      <Suspense fallback={<div className="stage" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Đang nạp Quản trị...</div>}>
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
      </Suspense>
    )
  }

  if (showTeacher) {
    return (
      <Suspense fallback={<div className="stage" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Đang nạp Cổng Giáo Viên...</div>}>
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
      </Suspense>
    )
  }

  if (reportToken) {
    return (
      <Suspense fallback={<div className="stage" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Đang nạp báo cáo...</div>}>
        <PublicReportView
          reportToken={reportToken}
          onHome={() => {
            window.history.pushState(null, '', '/')
            setReportToken('')
          }}
        />
      </Suspense>
    )
  }

  if (joinCode) {
    return (
      <Suspense fallback={<div className="stage" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Đang nạp lời mời...</div>}>
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
      </Suspense>
    )
  }

  const hasToken = typeof window !== 'undefined' ? Boolean(getAuthToken() || session?.isTrial) : true
  if (!session || (session && !hasToken)) {
    return (
      <AppCtx.Provider value={ctx}>
        <div className="stage">
          <div className="app login-app">
            <ThemeDecor themeId={S.theme || 'bear'} motion={S.motion || 'full'} />
            <Suspense fallback={<div style={{ padding: 24, textAlign: 'center' }}>Đang nạp đăng nhập...</div>}>
              <LoginScreen
                initialMode={loginMode}
                onAuthed={handleAuthed}
                reauthSession={session && !hasToken ? session : null}
                onOpenJoin={() => setJoinCode('ENTER_CODE')}
                classJoinBanner={classJoinBanner}
              />
            </Suspense>
          </div>
        </div>
      </AppCtx.Provider>
    )
  }

  return (
    <AppCtx.Provider value={ctx}>
      <div className="stage">
        <div className="app parent-shell">
          {session?.isTrial && !trialCollapsed && (
            <div className="trial-top-banner" role="region" aria-label="Chế độ dùng thử">
              <div className="trial-txt">
                <span aria-hidden="true">✨</span>
                <span>Đang dùng thử · Tạo gia đình để lưu</span>
              </div>
              <div className="trial-actions">
                <button type="button" className="trial-cta" onClick={startRegisterFromTrial}>
                  Tạo tài khoản
                </button>
                <button type="button" className="trial-exit" onClick={exitTrial}>
                  Thoát
                </button>
                <button
                  type="button"
                  className="trial-x"
                  onClick={() => setTrialCollapsed(true)}
                  title="Thu gọn dải dùng thử"
                  aria-label="Thu gọn dải dùng thử"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
          <ThemeDecor themeId={S.theme || 'bear'} motion={S.motion || 'full'} />
          <SeasonParticles themeId={S.theme || 'bear'} motion={S.motion || 'full'} screen={screen} />
          <div
            className="scroll"
            ref={scrollRef}
            onScroll={handleScrollFab}
            data-wide={['home', 'report', 'profile', 'toy'].includes(screen) ? '1' : undefined}
          >
            {study && study.running && (
              <button className="timer-chip" onClick={() => openSheet('timer')}>
                {study.phase === 'study' ? '📚 Học' : '☕ Nghỉ'} · {fmtTime(study.left)}{' '}
                <small>vòng {study.round}/{study.rounds} · bấm để quản lý</small>
              </button>
            )}
            <div key={screen} className="fadeIn" style={{ display: 'contents' }}>
              <ScreenErrorBoundary screen={screen} onReset={() => setScreen('home')}>
                <ScreenComp />
              </ScreenErrorBoundary>
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
                      <ThemedTabIcon themeId={S.theme || 'bear'} tab={k} active={isOn} size={23} fallbackIcon={IconComp} />
                    </span>
                    <span>{l}</span>
                  </button>
                )
              })}
            </nav>
          )}

          {S.onboarded && <BuddyPopLayer />}

          {S.onboarded && (
            <button
              className={`calm-fab ${['explain', 'scaffold', 'done', 'snap', 'analyze'].includes(screen) ? 'mini' : ''} ${fabCompact ? 'compact' : ''}`}
              onClick={() => openSheet('calm')}
              title={calmLabel}
              aria-label={calmLabel}
            >
              <span className="calm-fab-ic" aria-hidden="true">😮‍💨</span> <span className="calm-fab-label">{calmLabel}</span>
            </button>
          )}

          {S.onboarded && session?.isTrial && trialCollapsed && (
            <button type="button" className="trial-mini" onClick={() => setTrialCollapsed(false)} aria-label="Mở lại dải dùng thử">
              ✨ Dùng thử
            </button>
          )}

          <div className={`toast ${msg ? 'show' : ''}`}>{msg}</div>

          {sheet && (
            <ErrorBoundary onClose={closeSheet} message="Có lỗi nhỏ khi mở cửa sổ này. Mẹ thử lại nhé!">
              <SheetView type={sheet.type} data={sheet.data} session={session} />
            </ErrorBoundary>
          )}
        </div>
      </div>
    </AppCtx.Provider>
  )
}

const TAB_CAP = {
  home: 'Home', snap: 'SnapHomework', analyze: 'Analyze', explain: 'Explain',
  scaffold: 'Scaffold', done: 'Done', ask: 'AskAI', chat: 'AskAI', toy: 'SnapToy',
  game: 'Game', report: 'Report', profile: 'Profile',
  check: 'CheckWork', check_work: 'CheckWork',
}

/* ============================================================
   CÁC POPUP (BOTTOM SHEET)
   ============================================================ */
function SheetView({ type, data, session }) {
  const { S, patch, go, closeSheet, toast, stats, setStats, boom, tracker } = useContext(AppCtx)
  const child = S.children.find((c) => c.id === S.activeId) || S.children[0]

  if (type === 'calm') {
    return (
      <CalmCornerModal
        isOpen={true}
        onClose={closeSheet}
        currentProblem={S.problem}
        currentStepIndex={S.flow?.step || 0}
        child={child}
        parentName={S.parent || 'Mẹ'}
        themeId={S.theme || 'bear'}
        onLowerDifficulty={async () => {
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
              toast('Mạng chậm, thử lại sau nhé')
            }
          } catch (err) {
            patch({ flow: { ...S.flow, stuck: 0, lowering: false } })
            toast('Mạng chậm, thử lại sau nhé')
          }
        }}
        onOpenHint={() => {
          closeSheet()
          patch({ flow: { ...S.flow, unlocked: true } })
          toast('Đã mở gợi ý đồ vật thật cho con 💡')
        }}
        onSaveAndStop={() => {
          closeSheet()
          patch({
            pendingProblemResume: {
              problem: S.problem,
              step: S.flow?.step || 0,
              unlocked: S.flow?.unlocked || false,
              savedAt: Date.now(),
            },
            flow: { ...S.flow, step: 0, stuck: 0 },
          })
          if ((S.flow?.step || 0) >= 1 && tracker?.recordSession) {
            tracker.recordSession({
              problemType: S.problem?.dang_bai || 'Toán',
              totalSteps: (S.problem?.steps || []).length || 4,
              selfSteps: S.flow?.step || 0,
              teachBack: 'partial',
              partial: true,
            })
          }
          toast('Đã lưu bài! Dừng ở đây cũng là một tối học rất tốt 🌙')
          go('home')
        }}
        onRecordCalmEvent={(evt) => {
          const now = Date.now()
          const newEvent = {
            ts: now,
            trigger: evt.trigger || 'manual',
            reason: evt.reason,
            action: evt.action,
            resumed: true,
            stepsAfter: 0,
          }
          const cStats = { ...(stats[S.activeId] || {}) }
          const oldHistory = cStats.calmHistory || []
          const updatedHistory = [newEvent, ...oldHistory]
          const calmWeek = (cStats.calmWeek || 0) + 1
          setStats({
            ...stats,
            [S.activeId]: {
              ...cStats,
              calmHistory: updatedHistory,
              calmWeek,
              calmLast: now,
            },
          })
        }}
      />
    )
  }
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
          toast('Mạng chậm, thử lại sau nhé')
        }
      } catch (err) {
        patch({ flow: { ...S.flow, stuck: 0, lowering: false } })
        toast('Mạng chậm, thử lại sau nhé')
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
  if (type === 'editChild') return <EditChildSheet />
  if (type === 'invite' || type === 'members') {
    return (
      <Suspense fallback={<div className="sheet"><div className="pn" style={{ padding: 24, textAlign: 'center' }}>Đang tải...</div></div>}>
        <FamilyMembersSheet
          onClose={closeSheet}
          toast={toast}
          currentUser={session?.member || { role: 'owner', displayName: S.parent }}
          familyName={session ? session.name : S.familyName || 'Gia đình'}
        />
      </Suspense>
    )
  }
  if (type === 'familyClasses') {
    return (
      <Sheet>
        <Suspense fallback={<div style={{ padding: 24, textAlign: 'center' }}>Đang tải...</div>}>
          <FamilyClassSheet
            token={getAuthToken()}
            activeChild={child}
            children={S.children}
            onAddChild={(newKid) => {
              const updated = [...(S.children || []), newKid]
              patch({ children: updated, activeId: newKid.id })
            }}
            initialCode={data?.code || ''}
            initialType={data?.joinType || 'class'}
            onClose={closeSheet}
          />
        </Suspense>
      </Sheet>
    )
  }
  if (type === 'reportIssue') return <ReportIssueSheet problem={S.problem || PROBLEM} />
  if (type === 'wipe') return <WipeSheet />
  if (type === 'typeProblem') return <TypeProblemSheet initialMode={data?.mode} autoMic={Boolean(data?.autoMic)} />
  if (type === 'stickerBook') return <StickerBookSheet />
  if (type === 'pwa') return <PwaSheet />
  if (type === 'redeem') return <RedeemRewardSheet />
  if (type === 'aiFeedback') return <AiFeedbackSheet data={data} onClose={closeSheet} toast={toast} S={S} />
  if (type === 'safetyPortal') return <SafetyPortalSheet onClose={closeSheet} S={S} />
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
      <p className="sub">Học <b>15 phút</b>, nghỉ <b>5 phút</b>. Tối đa 3 vòng, đủ để não con nghỉ mà vẫn giữ nếp.</p>

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
    '&title=' + encodeURIComponent(`Kèm Con Học, ${familyName || 'gia đình mình'} mời bạn cùng kèm con mỗi tối`)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast('Đã sao chép link 📋')
    } catch (e) {
      toast('Không copy được, bấm giữ ô link để copy nhé')
    }
  }

  return (
    <Sheet>
      <p className="title">Mời bố cùng kèm con 📲</p>
      <p className="sub">
        App không tự nhắn tin được, bạn hãy <b>sao chép link</b> rồi gửi cho bố, hoặc bấm{' '}
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
          toast('Đã mở Zalo, gửi link cho bố nhé 📲')
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
    toast(ok ? 'Đã gửi góp ý, cảm ơn bạn, AI sẽ được cải thiện 💛' : 'Đã lưu góp ý trên máy (mạng chậm) 💛')
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

/* ---------- BÁO CÂU HỎI AI CHƯA HỢP (Prompt 14 Phần C) ---------- */
function AiFeedbackSheet({ data, onClose, toast, S }) {
  const [reason, setReason] = useState('too_hard')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const REASONS = [
    { id: 'too_hard', label: 'Quá khó so với tuổi của con', icon: '🧗' },
    { id: 'leak', label: 'Lộ đáp án / nói trước kết quả', icon: '🚨' },
    { id: 'teacher_way', label: 'Khác cách cô dạy trên lớp', icon: '👩‍🏫' },
    { id: 'wrong', label: 'Sai kiến thức hoặc sai đề bài', icon: '❌' },
  ]

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await sendAiFeedback({
        familyId: S.familyId || 'anonymous',
        sessionId: S.session?.id || 'sess_' + Date.now(),
        promptId: data?.promptId || 'p3_explain',
        step: data?.step || 1,
        reason,
        note,
        questionText: data?.questionText || '',
      })
      setSubmitted(true)
      toast('Đã gửi phản hồi! Cảm ơn mẹ đã giúp AI thông minh và an toàn hơn ❤️')
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (e) {
      toast('Lỗi khi gửi, mẹ thử lại sau nhé!')
      setSubmitting(false)
    }
  }

  return (
    <Sheet>
      <div style={{ padding: '0 4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--c-text)' }}>
            🚩 Báo câu hỏi AI chưa hợp lý
          </h3>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>✅</div>
            <p style={{ fontWeight: 700, fontSize: 14.5, color: '#047857' }}>
              Cảm ơn mẹ! Đóng góp của mẹ đã được ghi nhận vào hệ thống An toàn AI.
            </p>
          </div>
        ) : (
          <div>
            {data?.questionText && (
              <div style={{ background: 'var(--c-surface-sunken)', padding: 10, borderRadius: 10, fontSize: 13, fontStyle: 'italic', color: 'var(--c-text-2)', marginBottom: 14 }}>
                "{data.questionText}"
              </div>
            )}

            <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--c-text-2)', marginBottom: 8 }}>
              Mẹ thấy câu này chưa phù hợp ở điểm nào?
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
              {REASONS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className={`btn ${reason === r.id ? 'solid' : 'soft'}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '9px 12px',
                    textAlign: 'left',
                    fontSize: 13,
                    fontWeight: reason === r.id ? 800 : 600,
                    border: reason === r.id ? 'none' : '1px solid var(--c-line)',
                  }}
                  onClick={() => setReason(r.id)}
                >
                  <span style={{ fontSize: 16 }}>{r.icon}</span>
                  <span>{r.label}</span>
                </button>
              ))}
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--c-text-2)', marginBottom: 4 }}>
                Ghi chú thêm (không bắt buộc):
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ví dụ: Bé nhà mình lớp 3 chưa học phép nhân 2 chữ số..."
                rows={2}
                style={{
                  width: '100%',
                  padding: 10,
                  borderRadius: 10,
                  border: '1.5px solid var(--c-line)',
                  fontSize: 13,
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn soft" style={{ flex: 1 }} onClick={onClose} disabled={submitting}>
                Hủy
              </button>
              <button
                className="btn solid primary"
                style={{ flex: 2, fontWeight: 800 }}
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? 'Đang gửi...' : 'Gửi phản hồi'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Sheet>
  )
}

/* ---------- TRANG MINH BẠCH & AN TOÀN AI ---------- */
function SafetyPortalSheet({ onClose, S }) {
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    getSafetySummary()
      .then((res) => {
        setSummary(res)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <Sheet>
      <div style={{ padding: '0 4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 22 }}>🛡️</span>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: 'var(--c-text)' }}>
              AI An toàn & Minh bạch
            </h3>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 30 }}>⏳ Đang tải số liệu an toàn...</div>
        ) : (
          <div>
            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 16 }}>
              <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 12, padding: '12px' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#047857', textTransform: 'uppercase' }}>
                  Tỷ lệ an toàn
                </div>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#065F46', marginTop: 2 }}>
                  {summary?.safe_rate_percent || 100}%
                </div>
                <div style={{ fontSize: 11, color: '#047857', marginTop: 2 }}>
                  Không bao giờ lộ đáp án
                </div>
              </div>
              <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 12, padding: '12px' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#1D4ED8', textTransform: 'uppercase' }}>
                  Tự sửa bài thành công
                </div>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#1E40AF', marginTop: 2 }}>
                  {summary?.work_checks?.self_fixed || 0} bài
                </div>
                <div style={{ fontSize: 11, color: '#1D4ED8', marginTop: 2 }}>
                  Bé tự tìm ra bước sai
                </div>
              </div>
            </div>

            {/* 4 Lớp Bảo Vệ */}
            <div style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--c-text)', textTransform: 'uppercase', marginBottom: 8 }}>
              4 Lớp Cam Kết Sư Phạm & An Toàn:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
              {(summary?.four_layer_safety || []).map((l) => (
                <div key={l.layer} style={{ display: 'flex', gap: 10, background: 'var(--c-surface-sunken)', padding: '10px 12px', borderRadius: 10 }}>
                  <span style={{ fontSize: 16 }}>✅</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-text)' }}>
                      Lớp {l.layer}: {l.name}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--c-text-2)', marginTop: 2 }}>
                      {l.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className="btn solid primary" style={{ width: '100%', fontWeight: 800 }} onClick={onClose}>
              Đã hiểu & Tiếp tục đồng hành cùng con
            </button>
          </div>
        )}
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

/* ---------- SỬA HỒ SƠ CON ĐANG CHỌN (Đợt 15 · 6.4) ---------- */
function EditChildSheet() {
  const { S, patch, closeSheet, toast } = useContext(AppCtx)
  const child = S.children.find((c) => c.id === S.activeId) || S.children[0]
  const [name, setName] = useState(child?.name || '')
  const [emoji, setEmoji] = useState(child?.emoji || '🐰')
  const [grade, setGrade] = useState(child?.grade || GRADES[0])
  const [book, setBook] = useState(child?.book || BOOKS[0])

  const save = () => {
    if (!child) { closeSheet(); return }
    if (!name.trim()) { toast('Đặt biệt danh cho con nhé 🐣'); return }
    const kids = S.children.map((c) => (c.id === child.id ? { ...c, name: name.trim(), emoji, grade, book } : c))
    patch({ children: kids })
    closeSheet()
    toast(`Đã lưu hồ sơ của ${name.trim()} ${emoji}`)
  }

  return (
    <Sheet>
      <p className="title">Sửa hồ sơ của {child?.name || 'con'}</p>
      <p className="sub">Chỉ sửa hồ sơ của con đang chọn. Lịch sử học và sticker giữ nguyên.</p>
      <div className="card">
        <label className="lbl plum" htmlFor="edit-child-name">Biệt danh</label>
        <input id="edit-child-name" className="field" placeholder="VD: Bon, Miu…" value={name} maxLength={30} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="card">
        <span className="lbl plum" id="edit-child-avatar">Hình đại diện</span>
        <div className="chips" style={{ gap: 4 }} role="radiogroup" aria-labelledby="edit-child-avatar">
          {EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              role="radio"
              aria-checked={emoji === e}
              aria-label={`Hình ${e}`}
              onClick={() => setEmoji(e)}
              style={{
                fontSize: 22, width: 44, height: 44, borderRadius: 12,
                background: emoji === e ? 'var(--c-surface-2)' : 'var(--c-surface)',
                border: emoji === e ? '2px solid var(--c-accent)' : '1.5px solid var(--c-line)',
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
            <button key={x} type="button" className={`opt ${grade === x ? 'on' : ''}`} onClick={() => setGrade(x)}>{x}</button>
          ))}
        </div>
      </div>
      <div className="card">
        <span className="lbl plum">Bộ sách</span>
        <div className="opt-grid" style={{ gridTemplateColumns: '1fr' }}>
          {BOOKS.map((x) => (
            <button key={x} type="button" className={`opt col ${book === x ? 'on' : ''}`} onClick={() => setBook(x)}>{x}</button>
          ))}
        </div>
      </div>
      <div className="btns">
        <button type="button" className="btn ghost" onClick={closeSheet}>Huỷ</button>
        <button type="button" className="btn solid" onClick={save}>Lưu</button>
      </div>
    </Sheet>
  )
}

/* ---------- XÓA DỮ LIỆU (Đợt 15 · 6.4: nút nguy hiểm, gõ tên gia đình để xác nhận) ---------- */
function WipeSheet() {
  const { closeSheet, wipe, familyName } = useContext(AppCtx)
  const expected = String(familyName || '').trim()
  const [typed, setTyped] = useState('')
  const matched = Boolean(expected) && typed.trim().toLowerCase() === expected.toLowerCase()
  return (
    <Sheet>
      <p className="title">Xoá toàn bộ dữ liệu?</p>
      <p className="sub">
        Hồ sơ con, lịch sử, sticker, báo cáo… <b>tất cả sẽ mất vĩnh viễn</b> (cả bản đám mây). Không thể khôi phục.
      </p>
      <label htmlFor="wipe-confirm-name" style={{ fontSize: 14, fontWeight: 700, color: 'var(--c-text)' }}>
        Gõ đúng tên gia đình <b>{expected}</b> để xác nhận
      </label>
      <input
        id="wipe-confirm-name"
        className="field"
        autoComplete="off"
        placeholder={expected}
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
      />
      <div className="btns">
        <button type="button" className="btn ghost" onClick={closeSheet}>Giữ lại</button>
        <button type="button" className="btn danger solid" disabled={!matched} onClick={() => wipe({ confirmed: true })}>
          Xoá vĩnh viễn
        </button>
      </div>
    </Sheet>
  )
}

/* ---------- GÕ ĐỀ HOẶC ĐỌC ĐỀ BẰNG GIỌNG NÓI ---------- */
function TypeProblemSheet({ initialMode, autoMic = false }) {
  const { S, patch, go, closeSheet, toast, session } = useContext(AppCtx)
  const isTrial = Boolean(session?.isTrial)
  const [text, setText] = useState(isTrial ? PRELOADED_TRIAL_LESSONS[0].de_bai : PROBLEM.ocr)
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
        <VoiceInputBtn onResult={handleVoiceInput} placeholder="Bấm mic & Đọc đề bài" autoStart={autoMic} />
      </div>

      {isTrial && (
        <div data-testid="trial-sample-picker" style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
          <span className="lbl mut" style={{ fontSize: 12 }}>Dùng thử có 3 đề mẫu, mẹ chọn một đề:</span>
          {PRELOADED_TRIAL_LESSONS.map((l) => (
            <button
              key={l.id}
              type="button"
              className={`opt ${text === l.de_bai ? 'on' : ''}`}
              style={{ textAlign: 'left', padding: '8px 10px', fontSize: 12.5, lineHeight: 1.4 }}
              onClick={() => {
                setActiveTrialLesson(l.id)
                setText(l.de_bai)
              }}
            >
              <b>{l.subject} · {l.grade}</b> · {l.de_bai}
            </button>
          ))}
        </div>
      )}
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
          <b style={{ color: '#78350F', fontSize: 16 }}>ĐỦ 10 HUY HIỆU: ĐỔI QUÀ CHO BÉ!</b>
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
            <span className="pill c">🔒 Chưa mở khóa, hoàn thành thêm bài học để nhận nhé!</span>
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
          ĐỦ 10 HUY HIỆU: ĐỔI QUÀ CHO {child.name.toUpperCase()}!
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