/* ============================================================
   Gói 38 · MÀN "CON TÔI" theo bản vẽ v3
   - Nút "Thêm con" nổi bật, dính đáy trong vùng ngón cái
   - Danh sách gọn theo nhóm, nhóm ít dùng (Ứng dụng, Riêng tư) thu gọn sẵn
   - Sửa hồ sơ bằng nút bút chì; xoá "điều app nhớ" luôn hỏi lại vì không khôi phục được
   - Vùng chạm ≥ 48px, màu đọc từ biến --c-* của bộ giao diện
   ============================================================ */
import { useContext, useState } from 'react'
import { ChevronRight, Pencil, Plus, X } from 'lucide-react'
import { AppCtx } from './ctx'
import { SCHEDULE_DEFAULT } from './data'
import { getTheme } from './themes'
import { getDailyLimitMinutes, setDailyLimitMinutes } from './games/gameStorage'
import { appConfirm } from './dialog'
import { buzz } from './utils'
import './profile.css'

export const MAX_CHILDREN = 4
export const DEFAULT_SUBJECTS = ['Toán', 'Tiếng Việt', 'Tiếng Anh']
export const childSubjects = (c) => (Array.isArray(c?.subjects) && c.subjects.length ? c.subjects : DEFAULT_SUBJECTS)

/* Công tắc: vùng chạm 56×48, thanh hiển thị 52×30 */
export function PfSwitch({ on, onChange, label, testId }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={Boolean(on)}
      aria-label={label}
      className="pf-switch"
      data-testid={testId}
      onClick={() => { buzz(8); onChange(!on) }}
    >
      <span className="pf-track" aria-hidden="true" />
    </button>
  )
}

function Row({ icon, title, sub, onClick, testId, expanded, controls }) {
  return (
    <button
      type="button"
      className="pf-row"
      onClick={() => { buzz(8); onClick() }}
      data-testid={testId}
      aria-expanded={expanded}
      aria-controls={controls}
    >
      {icon && <span className="pf-ico" aria-hidden="true">{icon}</span>}
      <span className="pf-tx">
        <b>{title}</b>
        {sub && <small>{sub}</small>}
      </span>
      <ChevronRight className="pf-chev" aria-hidden="true" />
    </button>
  )
}

function SwitchRow({ title, sub, on, onChange, testId }) {
  return (
    <div className="pf-row pf-row-static">
      <span className="pf-tx">
        <b>{title}</b>
        {sub && <small>{sub}</small>}
      </span>
      <PfSwitch on={on} onChange={onChange} label={title} testId={testId} />
    </div>
  )
}

/* ---------- Những gì app nhớ về con ---------- */
function MemoryBlock({ child, S, stats, patch, toast }) {
  const { Ho = 'Bố mẹ' } = useContext(AppCtx) || {}
  const memoryEnabled = child.bearMemory !== false

  const weakList = (stats?.weak || []).map((w, idx) => ({ id: `weak_${idx}`, label: `${w.n} (vướng ${w.v || 1}/${w.t || 1} lần)`, tag: 'Dạng hay kẹt' }))
  const strongList = (stats?.strong || []).map((s, idx) => ({ id: `strong_${idx}`, label: `${s.n} (làm chắc chắn ${s.v || 1}/${s.t || 1})`, tag: 'Dạng đã vững' }))
  const defaultStyles = [
    { id: 'style_1', label: 'Dùng đồ vật thật trong nhà khi con kẹt', tag: 'Cách giảng hợp' },
    { id: 'style_2', label: 'Vẽ sơ đồ đoạn thẳng cho toán lời văn', tag: 'Cách giảng hợp' },
    { id: 'style_3', label: 'Giữ buổi học dưới 15 phút, giải lao 5 phút', tag: 'Cách giảng hợp' },
  ]
  const customStyles = (child.customTeachingStyles || defaultStyles).map((x) => ({ ...x, tag: x.tag || 'Cách giảng hợp' }))
  const deletedIds = new Set(child.deletedMemoryIds || [])
  const all = [...weakList, ...strongList, ...customStyles]
  const items = all.filter((item) => !deletedIds.has(item.id))

  const setChild = (fields) => patch((prev) => ({ ...prev, children: prev.children.map((c) => (c.id === child.id ? { ...c, ...fields } : c)) }))

  // Xoá là vĩnh viễn nên luôn hỏi lại trước khi xoá
  const removeItem = async (item) => {
    buzz(10)
    const ok = await appConfirm(`App sẽ quên: “${item.label}”.\nSau khi xoá không thể khôi phục.`, {
      title: 'Xoá ghi nhớ này?', okText: 'Xoá ghi nhớ', cancelText: 'Giữ lại', danger: true,
    })
    if (!ok) return
    setChild({ deletedMemoryIds: [...deletedIds, item.id] })
    buzz(25)
    toast('Đã xoá ghi nhớ')
  }
  const clearAll = async () => {
    buzz(10)
    const ok = await appConfirm(`App sẽ quên toàn bộ dạng bài hay kẹt, dạng đã vững và cách giảng hợp với ${child.name}.\nSau khi xoá không thể khôi phục.`, {
      title: `Xoá hết điều app nhớ về ${child.name}?`, okText: 'Xoá hết', cancelText: 'Giữ lại', danger: true,
    })
    if (!ok) return
    patch((prev) => ({
      ...prev,
      children: prev.children.map((c) => (c.id === child.id ? { ...c, deletedMemoryIds: all.map((i) => i.id) } : c)),
      stats: { ...(prev.stats || {}), [child.id]: { ...(prev.stats?.[child.id] || {}), weak: [], strong: [] } },
    }))
    buzz(25)
    toast(`Đã xoá hết điều app nhớ về ${child.name}`)
  }

  return (
    <div className="pf-block" data-testid="card-bear-memory">
      <div className="pf-block-head">
        <span className="pf-tx">
          <b>Những gì app nhớ về {child.name}</b>
          <small>Dạng bài hay kẹt, dạng đã vững, cách giảng hợp</small>
        </span>
        <PfSwitch
          on={memoryEnabled}
          label={`Ghi nhớ về ${child.name}`}
          testId="sw-memory"
          onChange={(v) => { setChild({ bearMemory: v }); toast(v ? `Đã bật ghi nhớ cho ${child.name}` : `Đã tắt ghi nhớ cho ${child.name}`) }}
        />
      </div>
      {!memoryEnabled ? (
        <p className="pf-note pf-empty">Đã tắt. App không ghi nhớ thêm gì về {child.name}.</p>
      ) : items.length === 0 ? (
        <p className="pf-note pf-empty">App chưa ghi nhớ gì về {child.name}. Sau vài buổi học, những điều app nhận ra sẽ hiện ở đây để {Ho.toLowerCase()} xem và xoá được.</p>
      ) : (
        <ul className="pf-mem">
          {items.map((item) => (
            <li key={item.id} className="pf-mem-item">
              <div><small>{item.tag}</small>{item.label}</div>
              <button type="button" aria-label={`Xoá ghi nhớ: ${item.label}`} onClick={() => removeItem(item)} data-testid="btn-mem-del">
                <X aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {memoryEnabled && items.length > 1 && (
        <button type="button" className="pf-text-danger" onClick={clearAll} data-testid="btn-clear-bear-memory">Xoá hết điều app nhớ</button>
      )}
    </div>
  )
}

export function Profile() {
  const ctx = useContext(AppCtx)
  const { S, stats, patch, openSheet, toast, logout, familyName, soundOn, toggleSound, ho = 'bố mẹ', session } = ctx
  const child = S.children.find((c) => c.id === S.activeId) || S.children[0]
  const familyLabel = /^gia đình\b/i.test(String(familyName || '').trim()) ? String(familyName).trim() : `Gia đình ${familyName || ''}`.trim()
  const schedule = Array.isArray(S.schedule) ? S.schedule : SCHEDULE_DEFAULT || []
  const [playMin, setPlayMin] = useState(() => getDailyLimitMinutes(child.id))
  const [playFor, setPlayFor] = useState(child.id)
  const [openApp, setOpenApp] = useState(false)
  const [openPrivacy, setOpenPrivacy] = useState(false)
  if (playFor !== child.id) { setPlayFor(child.id); setPlayMin(getDailyLimitMinutes(child.id)) }

  const full = S.children.length >= MAX_CHILDREN
  const setChild = (fields) => patch((prev) => ({ ...prev, children: prev.children.map((c) => (c.id === child.id ? { ...c, ...fields } : c)) }))

  const toggleOwner = (i) => {
    buzz(8)
    const sch = schedule.map((d, j) => (j === i ? { ...d, owner: d.owner === 'Mẹ' ? 'Bố' : 'Mẹ' } : d))
    patch({ schedule: sch })
  }

  const askLogout = async () => {
    const ok = await appConfirm('Bạn có thể đăng nhập lại bất cứ lúc nào. Dữ liệu của con vẫn được giữ.', {
      title: `Đăng xuất khỏi ${familyLabel}?`, okText: 'Đăng xuất', cancelText: 'Ở lại',
    })
    if (!ok) return
    logout()
    toast('Đã đăng xuất')
  }

  return (
    <div className="pf" data-testid="profile-v3">
      <header className="pf-head"><h1>Con tôi</h1></header>

      {/* Chọn bé */}
      <div className="pf-kids" role="radiogroup" aria-label="Chọn con">
        {S.children.map((c) => (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={c.id === child.id}
            className="pf-kid"
            onClick={() => { if (c.id === child.id) return; buzz(8); patch({ activeId: c.id }) }}
          >
            <span aria-hidden="true">{c.emoji}</span>
            {c.name}
          </button>
        ))}
      </div>

      {/* Hồ sơ bé đang chọn */}
      <section className="pf-profile">
        <span className="pf-avatar" aria-hidden="true">{child.emoji}</span>
        <div className="pf-tx">
          <h2>{child.name} · {child.grade}</h2>
          <p>{child.book} · {childSubjects(child).join(', ')}</p>
        </div>
        <button type="button" className="pf-edit" aria-label={`Sửa hồ sơ của ${child.name}`} title={`Sửa hồ sơ của ${child.name}`} data-testid="btn-edit-child" onClick={() => { buzz(8); openSheet('editChild') }}>
          <Pencil aria-hidden="true" />
        </button>
      </section>

      <div className="pf-list">
        <Row icon="⭐" title={`Sổ dán sticker của ${child.name}`} sub={`Đã sưu tập ${stats?.stickers || 0} sticker`} onClick={() => openSheet('stickerBook')} />
        <Row icon="🏫" title="Lớp học của con" sub="Kết nối với cô giáo, nhận bài tập về nhà theo cách cô dạy" onClick={() => openSheet('familyClasses')} />
      </div>

      {/* Kèm con */}
      <h3 className="pf-gtitle">Kèm con</h3>
      <div className="pf-list">
        <SwitchRow
          title="Nhận lời khuyên cách kèm"
          sub="Góp ý sư phạm sau mỗi bài học"
          on={child.receiveCoachAdvice !== false}
          testId="sw-coach"
          onChange={(v) => { setChild({ receiveCoachAdvice: v }); toast(v ? 'Đã bật lời khuyên cách kèm' : 'Đã tắt lời khuyên cách kèm') }}
        />
        <SwitchRow
          title="Nhắc nghỉ khi căng thẳng"
          sub={`Tự động nhắc ${ho} con nghỉ 1 phút khi bí hoặc làm lâu`}
          on={S.calmNudgeEnabled !== false}
          testId="sw-calm"
          onChange={(v) => { patch({ calmNudgeEnabled: v }); toast(v ? 'Đã bật nhắc nghỉ' : 'Đã tắt nhắc nghỉ') }}
        />
        <div className="pf-block">
          <div className="pf-bh"><b>Lịch chia ca T2 đến T6</b><small>Chạm để đổi Bố / Mẹ</small></div>
          <div className="pf-days">
            {schedule.slice(0, 5).map((d, i) => (
              <button
                key={d.day}
                type="button"
                className={`pf-day ${d.owner === 'Bố' ? 'dad' : ''}`}
                aria-label={`${d.day}: ${d.owner}. Chạm để đổi`}
                onClick={() => toggleOwner(i)}
              >
                <span>{d.day}</span>
                <b>{d.owner}</b>
              </button>
            ))}
          </div>
        </div>
        <div className="pf-block" data-testid="card-game-time-limit">
          <div className="pf-bh"><b>Thời gian chơi chung mỗi ngày</b><small>Tự dừng khi hết giờ</small></div>
          <div className="pf-seg" role="radiogroup" aria-label="Thời gian chơi chung mỗi ngày">
            {[3, 5, 10, 15].map((m) => (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={playMin === m}
                onClick={() => { buzz(8); setDailyLimitMinutes(child.id, m); setPlayMin(m) }}
              >
                {m} phút
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cả nhà */}
      <h3 className="pf-gtitle">Cả nhà</h3>
      <div className="pf-list">
        <Row icon="👨‍👩‍👧" title="Thành viên gia đình" sub="Mời bố mẹ, ông bà, gia sư cùng kèm con" onClick={() => openSheet('members')} />
        <Row icon="🎨" title="Giao diện cả nhà" sub={`Đang dùng: ${getTheme(S.theme || 'candy').name}`} onClick={() => openSheet('themePicker')} />
      </div>

      {/* Khác: thu gọn sẵn để màn hình đỡ rối */}
      <h3 className="pf-gtitle">Khác</h3>
      <div className="pf-list">
        <Row icon="⚙️" title="Ứng dụng" sub="Âm thanh, sao lưu, cài app ra màn hình chính" expanded={openApp} controls="pf-app" testId="row-app" onClick={() => setOpenApp(!openApp)} />
        {openApp && (
          <div id="pf-app" className="pf-sub">
            <SwitchRow title="Âm thanh và tiếng bấm nút" sub="Tiếng bấm nút, chuông chiến thắng và pháo hoa" on={soundOn} onChange={() => toggleSound()} testId="sw-sound" />
            <SwitchRow
              title="Tự động sao lưu lên đám mây"
              sub="Đổi máy vẫn thấy hồ sơ, lịch sử và sticker của con"
              on={Boolean(S.cloudSync)}
              testId="sw-cloud"
              onChange={(v) => { patch({ cloudSync: v }); toast(v ? 'Đã bật sao lưu đám mây' : 'Đã tắt sao lưu đám mây') }}
            />
            <Row title="Cài app ra màn hình chính" sub="Mở toàn màn hình, nhanh như app tải từ cửa hàng" onClick={() => openSheet('pwa')} />
          </div>
        )}
        <Row icon="🔒" title="Riêng tư và an toàn" sub="Điều app nhớ về con, AI an toàn, xoá dữ liệu" expanded={openPrivacy} controls="pf-privacy" testId="row-privacy" onClick={() => setOpenPrivacy(!openPrivacy)} />
        {openPrivacy && (
          <div id="pf-privacy" className="pf-sub">
            <MemoryBlock child={child} S={S} stats={stats} patch={patch} toast={toast} />
            <Row title="AI an toàn thế nào?" sub={`Không giải hộ, không lộ đáp án, ${ho} luôn làm chủ`} onClick={() => openSheet('safetyPortal')} />
            <div className="pf-block">
              <p className="pf-note">Ảnh chỉ dùng để đọc đề, app không lưu ảnh. Hồ sơ, sticker và lịch sử học được lưu để dùng trên nhiều máy, {ho} có thể xoá bất cứ lúc nào.</p>
            </div>
            <div className="pf-block">
              <button type="button" className="pf-btn-danger" onClick={() => { buzz(10); openSheet('wipe') }}>Xoá toàn bộ dữ liệu</button>
              <p className="pf-note" style={{ marginTop: 8 }}>Xoá vĩnh viễn hồ sơ con, lịch sử, sticker và báo cáo. Không khôi phục được.</p>
            </div>
          </div>
        )}
      </div>

      {/* Tài khoản */}
      <div className="pf-list pf-account">
        <div className="pf-row pf-row-static">
          <span className="pf-ico" aria-hidden="true">🏠</span>
          <span className="pf-tx"><b>{familyLabel}</b><small>{session?.isTrial ? 'Đang dùng thử' : 'Tài khoản riêng của gia đình mình'}</small></span>
          <button type="button" className="pf-btn-secondary" onClick={askLogout}>Đăng xuất</button>
        </div>
      </div>

      {/* Nút chính: Thêm con, dính đáy trong vùng ngón cái */}
      <div className="pf-cta-bar">
        <button
          type="button"
          className="pf-cta"
          data-testid="btn-add-child"
          aria-disabled={full}
          onClick={() => {
            buzz(10)
            if (full) { toast(`Mỗi gia đình thêm được tối đa ${MAX_CHILDREN} bé`); return }
            openSheet('addChild')
          }}
        >
          <span className="pf-plus" aria-hidden="true"><Plus /></span>
          <span className="pf-cta-t">
            <b>Thêm con</b>
            <small>{full ? `Đã đủ ${MAX_CHILDREN} bé` : 'Mỗi bé 1 lớp, 1 bộ sách riêng'}</small>
          </span>
        </button>
      </div>
    </div>
  )
}
