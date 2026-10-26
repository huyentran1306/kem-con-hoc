/* ============================================================
   ĐỢT 16 · LỚP THEO MÙA Ở MÀN CHÍNH
   1. Thẻ hết mùa: "Tết qua rồi. Quay lại bộ ... như trước Tết nhé?"
   2. Bảng gợi ý đầu mùa trượt từ dưới lên (Thử ngay / Để sau), chỉ hỏi một lần mỗi mùa
   3. Thẻ ngày đặc biệt (24/12, Giao thừa và mùng 1 đến mùng 3, ngày 1/6), đóng được
   Không bao giờ tự đổi giao diện; không hiện ở chế độ Dùng thử.
   ============================================================ */
import React, { useContext, useEffect, useMemo, useState } from 'react'
import { AppCtx } from '../ctx'
import { getTheme } from '../themes'
import {
  SEASON_SHORT,
  decideSeasonPrompt,
  acceptSuggestionPatch,
  laterSuggestionPatch,
  endGoBackPatch,
  endKeepPatch,
  specialDay,
  pickTetWish,
  makePraiseNote,
  isPraiseExpired,
  PRAISE_MAX,
} from './seasonLogic'
import { useSeasonsConfig, getSeasonToday } from './useSeasonsConfig'
import './seasons.css'

const CLOSED_KEY = 'kem-con-hoc:season-cards-closed'

function readClosed() {
  try {
    const v = JSON.parse(localStorage.getItem(CLOSED_KEY) || '[]')
    return Array.isArray(v) ? v : []
  } catch (e) {
    return []
  }
}
function writeClosed(list) {
  try {
    localStorage.setItem(CLOSED_KEY, JSON.stringify(list.slice(-20)))
  } catch (e) {}
}

const SUGGEST_COPY = {
  noel: {
    title: '❄ Noel đến rồi! Cả nhà thử bộ Đêm Tuyết không?',
    desc: 'Màu tuyết, cây thông, mỗi tối học treo thêm một quả châu.',
  },
  tet: {
    title: '🌼 Tết đến rồi! Cả nhà thử bộ Xuân Sum Vầy không?',
    desc: 'Cành mai nở theo từng tối học, xong bài Bé Lân lì xì một sticker.',
  },
  thieunhi: {
    title: '🎈 Sắp tới 1/6 rồi! Cả nhà thử bộ Cầu Vồng 1/6 không?',
    desc: 'Bóng bay, cánh diều, mỗi tối học bơm thêm một quả bóng.',
  },
}


export function getSeasonSuggestCopy(themeId, today) {
  if (themeId === "thieunhi") {
    const isJune1st = today && (today.endsWith("-06-01") || today.slice(5) === "06-01");
    return {
      title: isJune1st
        ? "🎈 Hôm nay là 1/6! Cả nhà thử bộ Cầu Vồng 1/6 không?"
        : "🎈 Sắp tới 1/6 rồi! Cả nhà thử bộ Cầu Vồng 1/6 không?",
      desc: "Bóng bay, cánh diều, mỗi tối học bơm thêm một quả bóng.",
    };
  }
  return SUGGEST_COPY[themeId];
}

const END_ICON = { noel: '❄', tet: '🌼', thieunhi: '🎈' }
const KEEP_LABEL = { noel: 'Giữ bộ Noel', tet: 'Giữ bộ Tết', thieunhi: 'Giữ bộ Cầu Vồng' }

/* Ảnh xem trước nhỏ: bộ mùa (trước) và bộ đang dùng (sau, mờ) */
export function SeasonMiniPreview({ themeId, currentId }) {
  const t = getTheme(themeId)
  const cur = getTheme(currentId || 'bear')
  const heroBg = { noel: '#14304A', tet: '#B00E28', thieunhi: '#2A56C6' }[themeId] || t.vars['--c-accent']
  return (
    <div className="season-pv" aria-hidden="true">
      <div className="season-mini-ph" style={{ background: `linear-gradient(${heroBg} 0 46%, ${t.vars['--c-bg']} 46%)` }}>
        <span>{t.icon}</span>
        <i style={{ background: t.vars['--c-btn'] }} />
      </div>
      {cur.id !== t.id && (
        <div className="season-mini-ph back" style={{ background: `linear-gradient(${cur.vars?.['--c-accent'] || '#F6A623'} 0 46%, ${cur.vars?.['--c-bg'] || '#FFF8EC'} 46%)` }}>
          <span>{cur.icon}</span>
        </div>
      )}
    </div>
  )
}

export function SeasonHomeLayer() {
  const ctx = useContext(AppCtx)
  const { S, patch, session, toast } = ctx || {}
  const { cfg, ready } = useSeasonsConfig()
  const today = getSeasonToday()
  const isTrial = Boolean(session?.isTrial)
  const [closed, setClosed] = useState(readClosed)
  const [handled, setHandled] = useState(null)
  const [praiseDraft, setPraiseDraft] = useState(null)
  const wish = useMemo(() => pickTetWish(), [])

  // Lời khen từ mẹ tự xoá sau 7 ngày
  useEffect(() => {
    if (S?.praiseNote && isPraiseExpired(S.praiseNote, today)) patch({ praiseNote: null })
  }, [today])

  if (!S || !S.onboarded || isTrial) return null

  const child = (S.children || []).find((c) => c.id === S.activeId) || (S.children || [])[0] || { name: 'con' }
  const parentLower = String(S.parent || 'Mẹ').toLowerCase()
  const theme = S.theme || 'bear'

  const decision = ready
    ? decideSeasonPrompt({
        today,
        theme,
        themeBeforeSeason: S.themeBeforeSeason,
        seasonStartedKey: S.seasonStartedKey,
        seasonAsked: S.seasonAsked,
        cfg,
        isTrial,
        onHome: true,
      })
    : null
  const active = decision && decision.key !== handled ? decision : null

  const markUserTheme = () => {
    try {
      localStorage.setItem('kem-con-hoc:user-custom-theme', 'true')
    } catch (e) {}
  }

  const onAccept = () => {
    setHandled(active.key)
    markUserTheme()
    patch(acceptSuggestionPatch(S, active))
    toast?.(`Đã đổi sang bộ ${getTheme(active.themeId).name} cho cả nhà`)
  }
  const onLater = () => {
    setHandled(active.key)
    patch(laterSuggestionPatch(S, active))
  }
  const onGoBack = () => {
    setHandled(active.key)
    markUserTheme()
    patch(endGoBackPatch(S, active))
    toast?.(`Đã quay lại bộ ${getTheme(active.previous).name}`)
  }
  const onKeep = () => {
    setHandled(active.key)
    patch(endKeepPatch(S, active))
  }

  const special = specialDay(theme, today, cfg)
  const showSpecial = special && !closed.includes(special.key)
  const closeSpecial = () => {
    const next = [...closed, special.key]
    setClosed(next)
    writeClosed(next)
  }

  const note = S.praiseNote && S.praiseNote.date === today ? S.praiseNote : null
  const savePraise = () => {
    const text = String(praiseDraft || '').trim()
    if (!text) {
      patch({ praiseNote: null })
    } else {
      patch({ praiseNote: makePraiseNote(text, today) })
      toast?.(`Đã cất lời khen, tối nay ${child.name} mở ra đọc cùng ${parentLower} nhé`)
    }
    setPraiseDraft(null)
  }

  return (
    <>
      {active && active.type === 'end' && (
        <div className="card season-back-card" data-testid="season-end-card" role="region" aria-label="Hết mùa">
          <b className="season-card-h">
            {END_ICON[active.themeId]} {SEASON_SHORT[active.themeId]} qua rồi
          </b>
          <p className="sub">
            Quay lại bộ <b>{getTheme(active.previous).name}</b> như trước {SEASON_SHORT[active.themeId]} nhé? Sticker và bài học của {child.name} vẫn giữ nguyên.
          </p>
          <div className="season-row2">
            <button type="button" className="btn ghost" onClick={onKeep}>
              {KEEP_LABEL[active.themeId]}
            </button>
            <button type="button" className="btn solid" onClick={onGoBack}>
              Quay lại {getTheme(active.previous).name}
            </button>
          </div>
        </div>
      )}

      {showSpecial && special.type === 'noel-eve' && (
        <div className="card season-day-card" data-testid="season-day-noel">
          <button type="button" className="season-x" aria-label="Đóng thẻ" onClick={closeSpecial}>✕</button>
          <b className="season-card-h">🎄 Đêm Noel rồi!</b>
          <p className="sub">Tối nay học xong, cả nhà treo quả châu cuối cùng nhé.</p>
        </div>
      )}

      {showSpecial && special.type === 'tet-wish' && (
        <div className="card season-day-card tet" data-testid="season-day-tet">
          <button type="button" className="season-x" aria-label="Đóng thẻ" onClick={closeSpecial}>✕</button>
          <span className="season-kk">
            {special.dayIndex === -1 ? 'ĐÊM GIAO THỪA' : `MÙNG ${special.dayIndex + 1} TẾT`} · BÉ LÂN CHÚC TẾT
          </span>
          <b className="season-card-h">🧧 {wish}</b>
        </div>
      )}

      {showSpecial && special.type === 'praise' && (
        <div className="card season-day-card praise" data-testid="season-day-praise">
          <button type="button" className="season-x" aria-label="Đóng thẻ" onClick={closeSpecial}>✕</button>
          <b className="season-card-h hand">💌 Lời khen từ {parentLower}</b>
          {praiseDraft === null ? (
            <>
              <p className="sub">
                {note
                  ? `Đã cất lời khen. Tối nay xong bài, ${child.name} mở ra đọc cùng ${parentLower}.`
                  : `${S.parent || 'Mẹ'} viết một lời khen, tối nay ${child.name} mở ra đọc cùng ${parentLower}.`}
              </p>
              <button type="button" className="season-mini-btn" onClick={() => setPraiseDraft(note ? note.text : '')}>
                {note ? 'Sửa lời khen' : 'Viết lời khen'}
              </button>
            </>
          ) : (
            <>
              <textarea
                className="field season-praise-input"
                aria-label="Lời khen cho con"
                maxLength={PRAISE_MAX}
                rows={3}
                value={praiseDraft}
                placeholder={`Ví dụ: ${parentLower} thấy con kiên nhẫn đọc lại đề, giỏi lắm!`}
                onChange={(e) => setPraiseDraft(e.target.value.slice(0, PRAISE_MAX))}
              />
              <div className="season-praise-foot">
                <span className="sub">{String(praiseDraft).length}/{PRAISE_MAX} · chỉ lưu trong máy nhà mình, tự xoá sau 7 ngày</span>
              </div>
              <div className="season-row2">
                <button type="button" className="btn ghost" onClick={() => setPraiseDraft(null)}>Huỷ</button>
                <button type="button" className="btn solid" onClick={savePraise}>Cất lời khen</button>
              </div>
            </>
          )}
        </div>
      )}

      {active && active.type === 'suggest' && (
        <div className="season-sheet-backdrop" data-testid="season-suggest">
          <div className="season-sheet" role="dialog" aria-modal="true" aria-labelledby="season-sheet-title">
            <div className="season-grab" />
            <SeasonMiniPreview themeId={active.themeId} currentId={theme} />
            <h4 id="season-sheet-title">{getSeasonSuggestCopy(active.themeId, today).title}</h4>
            <p className="sub">
              {getSeasonSuggestCopy(active.themeId, today).desc} Đổi lại {getTheme(theme).name} lúc nào cũng được.
            </p>
            <div className="season-row2">
              <button type="button" className="btn ghost" onClick={onLater}>Để sau</button>
              <button type="button" className="btn solid" onClick={onAccept}>Thử ngay</button>
            </div>
            <p className="season-xs">Chỉ hỏi một lần trong mùa này.</p>
          </div>
        </div>
      )}
    </>
  )
}
