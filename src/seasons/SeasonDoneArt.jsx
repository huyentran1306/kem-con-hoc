/* ============================================================
   ĐỢT 16 · MÀN XONG BÀI THEO MÙA
   Đêm Tuyết: quả châu rơi treo lên cây thông, ngôi sao đỉnh cây lấp lánh
   Xuân Sum Vầy: Bé Lân trao bao lì xì "Sticker Chăm chỉ" (không có tiền)
   Cầu Vồng 1/6: huy hiệu "Ngày của con" viền cầu vồng
   Tối 1/6: nút "Mở lời khen của mẹ" để mẹ đọc cho con nghe.
   ============================================================ */
import React, { useContext, useState } from 'react'
import { AppCtx } from '../ctx'
import { BuddyMascot } from '../themes/buddies/buddySvgs'
import { SEASON_ICON_BODIES } from '../themes/seasonIcons'
import { NOEL_TREE_SVG } from './seasonArt'
import { isSeasonalTheme, canOpenPraise } from './seasonLogic'
import { getSeasonToday } from './useSeasonsConfig'
import './seasons.css'

/* 3 mức hiểu bài theo bộ: tự làm được · cần gợi ý · mẹ dẫn nhiều */
const LEVEL_EMOJI = {
  noel: { ok: '⭐', self: '⭐', hint: '🔴', guided: '🍭' },
  tet: { ok: '🌼', self: '🌼', hint: '🌸', guided: '🌱' },
  thieunhi: { ok: '🎈', self: '🎈', hint: '🪁', guided: '🎡' },
}

export function seasonLevelEmoji(level, fallback) {
  try {
    const t = typeof document !== 'undefined' ? document.documentElement.dataset.theme : null
    return (LEVEL_EMOJI[t] && LEVEL_EMOJI[t][level]) || fallback
  } catch (e) {
    return fallback
  }
}

export function SeasonDoneArt() {
  const { ho = 'bố mẹ', Ho = 'Bố mẹ' } = useContext(AppCtx) || {}
  const ctx = useContext(AppCtx)
  const S = ctx?.S
  const [openPraise, setOpenPraise] = useState(false)
  const theme = S?.theme || 'bear'
  if (!S || !isSeasonalTheme(theme)) return null
  const child = (S.children || []).find((c) => c.id === S.activeId) || (S.children || [])[0] || { name: 'con' }
  const parentLower = ho
  const today = getSeasonToday()
  const praiseOk = canOpenPraise(theme, S.praiseNote, today)

  return (
    <div className={`season-done season-done-${theme}`} data-testid="season-done-art">
      {theme === 'noel' && (
        <>
          <div className="season-tree-wrap" dangerouslySetInnerHTML={{ __html: NOEL_TREE_SVG }} />
          <h3 className="season-big">Thêm 1 quả châu lên cây!</h3>
          <p className="sub">Ngôi sao trên đỉnh cây đang lấp lánh mừng {child.name}.</p>
        </>
      )}
      {theme === 'tet' && (
        <>
          <div className="season-lixi-big">
            <BuddyMascot buddyId="lion" state="cheer" size={86} />
            <div className="env">
              <svg viewBox="0 0 32 32" aria-hidden="true" className="kch-si" dangerouslySetInnerHTML={{ __html: SEASON_ICON_BODIES.tet.child }} />
              <span>
                Sticker
                <br />
                <b>Chăm chỉ</b>
              </span>
            </div>
          </div>
          <h3 className="season-big">Bé Lân lì xì {child.name} một sticker!</h3>
          <p className="sub">Cành mai nở thêm một bông.</p>
        </>
      )}
      {theme === 'thieunhi' && (
        <>
          <div className="season-badge">
            <div className="ring">
              <BuddyMascot buddyId="kite" state="cheer" size={74} />
            </div>
            <span>
              Huy hiệu <b>Ngày của con</b>
            </span>
          </div>
          <h3 className="season-big">Chùm bóng bay lên rồi!</h3>
        </>
      )}

      {praiseOk && (
        <div className="season-praise-open">
          {!openPraise ? (
            <button type="button" className="btn solid" data-testid="open-praise" onClick={() => setOpenPraise(true)}>
              💌 Mở lời khen của {parentLower}
            </button>
          ) : (
            <div className="card season-praise-card" role="region" aria-label="Lời khen">
              <span className="season-kk">{Ho.toUpperCase()} ĐỌC CHO {String(child.name).toUpperCase()} NGHE NHÉ</span>
              <p className="season-praise-text">{S.praiseNote.text}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
