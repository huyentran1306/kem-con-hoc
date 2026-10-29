/* ============================================================
   Gói 38 · THÊM CON (form 3 bước) và SỬA HỒ SƠ CON
   - Báo lỗi ngay tại ô đang nhập (không đợi bấm cuối mới báo)
   - Đang nhập dở mà đóng thì hỏi lại; thêm xong có nút Hoàn tác
   - Vùng chạm ≥ 48px, màu theo bộ giao diện
   ============================================================ */
import { useContext, useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { AppCtx } from './ctx'
import { EMOJIS, GRADES, BOOKS } from './data'
import { appConfirm } from './dialog'
import { buzz } from './utils'
import { DEFAULT_SUBJECTS, MAX_CHILDREN, PfSwitch, childSubjects } from './ProfileScreen'

export const NAME_MAX = 20

/** Kiểm tên bé: trả về câu báo lỗi, hoặc '' khi hợp lệ. */
export function checkChildName(raw, children = [], selfId = null) {
  const v = String(raw || '').trim()
  if (!v) return 'Vui lòng nhập tên hoặc biệt danh của bé.'
  if (v.length < 2) return 'Tên cần ít nhất 2 ký tự.'
  if (v.length > NAME_MAX) return `Tên tối đa ${NAME_MAX} ký tự.`
  if (children.some((c) => c.id !== selfId && String(c.name || '').trim().toLowerCase() === v.toLowerCase())) {
    return 'Tên này đã có trong danh sách. Hãy thêm số hoặc chữ để phân biệt.'
  }
  return ''
}

function SheetFrame({ title, onRequestClose, children, footer, testId, labelId }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onRequestClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })
  return (
    <div className="sheet" onClick={(e) => e.target === e.currentTarget && onRequestClose()}>
      <div className="pn cf-pn" role="dialog" aria-modal="true" aria-labelledby={labelId} data-testid={testId}>
        <div className="grabber" />
        <div className="cf-head">
          <h2 id={labelId}>{title}</h2>
          <button type="button" className="cf-x" aria-label="Đóng" onClick={onRequestClose}><X aria-hidden="true" /></button>
        </div>
        <div className="cf-body">{children}</div>
        <div className="cf-foot">{footer}</div>
      </div>
    </div>
  )
}

function Field({ label, id, error, hint, children }) {
  return (
    <div className="cf-field">
      {label && (id ? <label className="cf-label" htmlFor={id}>{label}</label> : <span className="cf-label">{label}</span>)}
      {children}
      {(hint || error) && (
        <div className="cf-hint">
          {error ? <span className="cf-err" role="alert" id={id ? `${id}-err` : undefined}>⚠ {error}</span> : <span />}
          {hint && <span>{hint}</span>}
        </div>
      )}
    </div>
  )
}

function Choice({ options, value, onPick, multi = false, label, cols, testId }) {
  const on = (x) => (multi ? value.includes(x) : value === x)
  return (
    <div className="cf-opts" role={multi ? 'group' : 'radiogroup'} aria-label={label} style={cols ? { gridTemplateColumns: `repeat(${cols}, 1fr)` } : undefined} data-testid={testId}>
      {options.map((x) => (
        <button
          key={x}
          type="button"
          className="cf-opt"
          role={multi ? 'checkbox' : 'radio'}
          aria-checked={on(x)}
          onClick={() => { buzz(8); onPick(x) }}
        >
          {x}
        </button>
      ))}
    </div>
  )
}

function Avatars({ value, onPick }) {
  return (
    <div className="cf-avs" role="radiogroup" aria-label="Hình đại diện">
      {EMOJIS.map((e) => (
        <button key={e} type="button" className="cf-av" role="radio" aria-checked={value === e} aria-label={`Hình ${e}`} onClick={() => { buzz(8); onPick(e) }}>
          {e}
        </button>
      ))}
    </div>
  )
}

const STEP_TITLES = ['Thông tin của bé', 'Lớp học', 'Môn cần kèm']

export function AddChildSheet({ makeStats }) {
  const { S, patch, closeSheet, toast } = useContext(AppCtx)
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [touched, setTouched] = useState(false)
  const [emoji, setEmoji] = useState('🐰')
  const [grade, setGrade] = useState(null)
  const [book, setBook] = useState(null)
  const [subjects, setSubjects] = useState(DEFAULT_SUBJECTS)
  const [errs, setErrs] = useState({})
  const [busy, setBusy] = useState(false)
  const busyRef = useRef(false)
  const nameRef = useRef(null)

  const nameErr = touched || name ? checkChildName(name, S.children) : ''
  const dirty = Boolean(name.trim() || grade || book)

  useEffect(() => {
    if (step === 1) setTimeout(() => nameRef.current?.focus({ preventScroll: true }), 250)
  }, [step])

  const requestClose = async () => {
    if (busyRef.current) return
    if (dirty) {
      const ok = await appConfirm('Thông tin của bé chưa được lưu.', { title: 'Bỏ thông tin đang nhập?', okText: 'Bỏ thông tin', cancelText: 'Tiếp tục nhập', danger: true })
      if (!ok) return
    }
    closeSheet()
  }

  const validate = (n) => {
    if (n === 1) {
      setTouched(true)
      const m = checkChildName(name, S.children)
      if (m) nameRef.current?.focus({ preventScroll: true })
      return !m
    }
    if (n === 2) {
      const e = { grade: grade ? '' : 'Chọn lớp của bé để app gợi ý đúng bài.', book: book ? '' : 'Chọn bộ sách bé đang học.' }
      setErrs(e)
      return !e.grade && !e.book
    }
    if (n === 3) {
      const e = { subjects: subjects.length ? '' : 'Chọn ít nhất 1 môn.' }
      setErrs(e)
      return !e.subjects
    }
    return true
  }

  const next = () => {
    if (busyRef.current) return
    if (!validate(step)) { buzz([20, 40, 20]); return }
    if (step < 3) { buzz(8); setErrs({}); setStep(step + 1); return }
    if (S.children.length >= MAX_CHILDREN) { toast(`Mỗi gia đình thêm được tối đa ${MAX_CHILDREN} bé`); return }
    // Chặn bấm lặp và cho thấy app đang xử lý
    busyRef.current = true
    setBusy(true)
    const id = 'c' + Date.now().toString(36)
    const kid = { id, name: name.trim(), emoji, grade, book, subjects }
    const prevActive = S.activeId
    patch((prev) => ({
      ...prev,
      children: [...prev.children, kid],
      activeId: id,
      stats: { ...(prev.stats || {}), [id]: makeStats ? makeStats(id) : {} },
    }))
    buzz(25)
    setTimeout(() => {
      closeSheet()
      toast(`✓ Đã thêm bé ${kid.name}`, {
        undo: () => {
          patch((prev) => {
            const st = { ...(prev.stats || {}) }
            delete st[id]
            const kids = prev.children.filter((c) => c.id !== id)
            return { ...prev, children: kids, activeId: kids.some((c) => c.id === prevActive) ? prevActive : kids[0]?.id, stats: st }
          })
          toast(`Đã bỏ thêm bé ${kid.name}`)
        },
      })
    }, 350)
  }

  const back = () => { if (busyRef.current) return; if (step === 1) requestClose(); else { setErrs({}); setStep(step - 1) } }

  return (
    <SheetFrame
      title="Thêm con"
      labelId="add-child-title"
      testId="sheet-add-child"
      onRequestClose={requestClose}
      footer={
        <>
          <button type="button" className="cf-btn cf-btn-2" onClick={back} disabled={busy}>{step === 1 ? 'Hủy' : 'Quay lại'}</button>
          <button type="button" className="cf-btn cf-btn-1" onClick={next} disabled={busy} aria-busy={busy} data-testid="add-child-next">
            {busy && <span className="cf-spin" aria-hidden="true" />}
            {busy ? 'Đang thêm…' : step === 3 ? 'Thêm bé' : 'Tiếp tục'}
          </button>
        </>
      }
    >
      <div className="cf-stepper" aria-hidden="true">{[1, 2, 3].map((i) => <i key={i} className={i <= step ? 'on' : ''} />)}</div>
      <p className="cf-step-txt" aria-live="polite"><b>Bước {step}/3</b> · {STEP_TITLES[step - 1]}</p>

      {step === 1 && (
        <>
          <Field label="Tên hoặc biệt danh của bé" id="add-child-name" error={nameErr} hint={`${name.length}/${NAME_MAX}`}>
            <input
              id="add-child-name"
              ref={nameRef}
              className="cf-input"
              placeholder="VD: Bon, Miu…"
              value={name}
              maxLength={NAME_MAX}
              autoComplete="off"
              aria-invalid={Boolean(nameErr)}
              aria-describedby={nameErr ? 'add-child-name-err' : undefined}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => { if (name) setTouched(true) }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); next() } }}
            />
          </Field>
          <p className="cf-note">Bé sẽ thấy tên này trong app.</p>
          <Field label="Hình đại diện"><Avatars value={emoji} onPick={setEmoji} /></Field>
        </>
      )}

      {step === 2 && (
        <>
          <Field label="Bé học lớp mấy?" error={errs.grade}>
            <Choice label="Lớp" options={GRADES} value={grade} onPick={(x) => { setGrade(x); setErrs((e) => ({ ...e, grade: '' })) }} cols={5} testId="add-child-grade" />
          </Field>
          <Field label="Bộ sách đang học" error={errs.book}>
            <Choice label="Bộ sách" options={BOOKS} value={book} onPick={(x) => { setBook(x); setErrs((e) => ({ ...e, book: '' })) }} cols={1} testId="add-child-book" />
          </Field>
        </>
      )}

      {step === 3 && (
        <>
          <Field label="Môn cần kèm" error={errs.subjects}>
            <Choice
              multi
              label="Môn cần kèm"
              options={DEFAULT_SUBJECTS}
              value={subjects}
              cols={3}
              onPick={(x) => {
                const nx = subjects.includes(x) ? subjects.filter((y) => y !== x) : DEFAULT_SUBJECTS.filter((y) => y === x || subjects.includes(y))
                setSubjects(nx)
                setErrs({ subjects: nx.length ? '' : 'Chọn ít nhất 1 môn.' })
              }}
            />
          </Field>
          <div className="cf-sum" aria-label="Xem lại">
            <span className="cf-sum-av" aria-hidden="true">{emoji}</span>
            <div><b>{name.trim()}</b><small>{grade} · {book}</small></div>
          </div>
        </>
      )}
    </SheetFrame>
  )
}

export function EditChildSheet() {
  const { S, patch, closeSheet, toast } = useContext(AppCtx)
  const child = S.children.find((c) => c.id === S.activeId) || S.children[0]
  const [name, setName] = useState(child?.name || '')
  const [emoji, setEmoji] = useState(child?.emoji || '🐰')
  const [grade, setGrade] = useState(child?.grade || GRADES[0])
  // Dữ liệu cũ có thể ghi khác hoa thường (vd. "Cánh diều"): khớp về đúng tên trong danh sách
  const [book, setBook] = useState(BOOKS.find((b) => b.toLowerCase() === String(child?.book || '').toLowerCase()) || child?.book || BOOKS[0])
  const [subjects, setSubjects] = useState(childSubjects(child))
  const [bearMemory, setBearMemory] = useState(child?.bearMemory !== false)
  const nameErr = checkChildName(name, S.children, child?.id)
  const subjErr = subjects.length ? '' : 'Chọn ít nhất 1 môn.'
  const dirty = child && (name !== child.name || emoji !== child.emoji || grade !== child.grade || book.toLowerCase() !== String(child.book || '').toLowerCase() || bearMemory !== (child.bearMemory !== false) || subjects.join() !== childSubjects(child).join())

  const requestClose = async () => {
    if (dirty) {
      const ok = await appConfirm('Những thay đổi vừa rồi chưa được lưu.', { title: 'Bỏ thay đổi?', okText: 'Bỏ thay đổi', cancelText: 'Tiếp tục sửa', danger: true })
      if (!ok) return
    }
    closeSheet()
  }

  const save = () => {
    if (!child) { closeSheet(); return }
    if (nameErr || subjErr) { buzz([20, 40, 20]); return }
    const before = { name: child.name, emoji: child.emoji, grade: child.grade, book: child.book, subjects: child.subjects, bearMemory: child.bearMemory }
    const after = { name: name.trim(), emoji, grade, book, subjects, bearMemory }
    patch((prev) => ({ ...prev, children: prev.children.map((c) => (c.id === child.id ? { ...c, ...after } : c)) }))
    buzz(15)
    closeSheet()
    toast(`✓ Đã lưu hồ sơ của ${after.name}`, {
      undo: () => patch((prev) => ({ ...prev, children: prev.children.map((c) => (c.id === child.id ? { ...c, ...before } : c)) })),
    })
  }

  return (
    <SheetFrame
      title={`Sửa hồ sơ của ${child?.name || 'con'}`}
      labelId="edit-child-title"
      testId="sheet-edit-child"
      onRequestClose={requestClose}
      footer={
        <>
          <button type="button" className="cf-btn cf-btn-2" onClick={requestClose}>Hủy</button>
          <button type="button" className="cf-btn cf-btn-1" onClick={save} disabled={!dirty || Boolean(nameErr || subjErr)} data-testid="edit-child-save">Lưu thay đổi</button>
        </>
      }
    >
      <p className="cf-note">Lịch sử học và sticker của bé giữ nguyên.</p>
      <Field label="Tên hoặc biệt danh" id="edit-child-name" error={nameErr} hint={`${name.length}/${NAME_MAX}`}>
        <input
          id="edit-child-name"
          className="cf-input"
          value={name}
          maxLength={NAME_MAX}
          autoComplete="off"
          aria-invalid={Boolean(nameErr)}
          aria-describedby={nameErr ? 'edit-child-name-err' : undefined}
          onChange={(e) => setName(e.target.value)}
        />
      </Field>
      <Field label="Hình đại diện"><Avatars value={emoji} onPick={setEmoji} /></Field>
      <Field label="Lớp"><Choice label="Lớp" options={GRADES} value={grade} onPick={setGrade} cols={5} /></Field>
      <Field label="Bộ sách"><Choice label="Bộ sách" options={BOOKS} value={book} onPick={setBook} cols={1} /></Field>
      <Field label="Môn cần kèm" error={subjErr}>
        <Choice
          multi
          label="Môn cần kèm"
          options={DEFAULT_SUBJECTS}
          value={subjects}
          cols={3}
          onPick={(x) => setSubjects(subjects.includes(x) ? subjects.filter((y) => y !== x) : DEFAULT_SUBJECTS.filter((y) => y === x || subjects.includes(y)))}
        />
      </Field>
      <div className="cf-switch-row" id="toggle-bear-memory">
        <div><b>App ghi nhớ về con</b><small>Nhớ chỗ hay kẹt và đã vững để hỏi sát hơn</small></div>
        <PfSwitch on={bearMemory} onChange={setBearMemory} label="App ghi nhớ về con" />
      </div>
    </SheetFrame>
  )
}
