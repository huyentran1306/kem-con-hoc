/* Gói 39 · Hình vẽ đồ vật và thẻ trò chơi theo bản vẽ "Trò chơi v5" / "Chơi với đồ vật v1".
   Màu chính đọc từ biến của bộ giao diện (--ti-ink, --ti-soft, --ti-hi đặt trong games.css);
   màu "vật liệu" (gỗ, da cam, giấy) giữ cố định cho dễ nhận ra đồ vật. */

const INK = 'var(--ti-ink)'
const SOFT = 'var(--ti-soft)'
const HI = 'var(--ti-hi)'
const PAPER = 'var(--ti-paper)'

const ICONS = {
  'Chai / Lọ': (
    <>
      <rect x="12" y="4" width="8" height="5" rx="1.5" fill={INK} />
      <rect x="8" y="9" width="16" height="20" rx="5" fill={SOFT} />
      <rect x="11" y="15" width="10" height="8" rx="2" fill={PAPER} />
    </>
  ),
  'Cây lược': (
    <>
      <rect x="4" y="9" width="24" height="7" rx="3" fill={INK} />
      {[6, 10, 14, 18, 22, 26].map((x) => <rect key={x} x={x} y="15" width="2.2" height="11" rx="1.1" fill={INK} />)}
    </>
  ),
  'Cây bút': (
    <g transform="rotate(-40 16 16)">
      <rect x="12" y="3" width="8" height="20" rx="1.5" fill={HI} />
      <rect x="12" y="3" width="8" height="4" rx="1.5" fill="#FFB59E" />
      <path d="M12 23h8l-4 7z" fill="#F6D7B0" />
      <path d="M14.6 27.5h2.8L16 30z" fill={INK} />
    </g>
  ),
  Lego: (
    <>
      <rect x="4" y="12" width="24" height="15" rx="3" fill="#FFB59E" />
      <rect x="7" y="7" width="6" height="6" rx="2" fill="#FFB59E" />
      <rect x="19" y="7" width="6" height="6" rx="2" fill="#FF9C80" />
      <rect x="4" y="21" width="24" height="6" rx="3" fill="#FF9C80" />
    </>
  ),
  'Thước kẻ': (
    <g transform="rotate(-30 16 16)">
      <rect x="2" y="11" width="28" height="10" rx="2" fill={HI} />
      {[5, 9, 13, 17, 21, 25].map((x, i) => <rect key={x} x={x} y="11" width="1.6" height={i % 2 ? 3.5 : 5} fill={INK} />)}
    </g>
  ),
  'Que kem': (
    <>
      <rect x="7" y="5" width="5" height="22" rx="2.5" fill="#F6D7B0" transform="rotate(-14 9.5 16)" />
      <rect x="13.5" y="4" width="5" height="23" rx="2.5" fill="#EBC28F" />
      <rect x="20" y="5" width="5" height="22" rx="2.5" fill="#F6D7B0" transform="rotate(14 22.5 16)" />
      <rect x="6" y="17" width="20" height="4" rx="2" fill={SOFT} />
    </>
  ),
  'Kẹo': (
    <>
      <path d="M3 10l6 6-6 6z" fill={SOFT} />
      <path d="M29 10l-6 6 6 6z" fill={SOFT} />
      <circle cx="16" cy="16" r="8" fill="#FFB59E" />
      <path d="M11 12q5 4 10 8M11 19q4-5 9-7" stroke="#FFFFFF" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </>
  ),
  'Đồng hồ': (
    <>
      <circle cx="16" cy="17" r="11" fill={PAPER} stroke={INK} strokeWidth="3" />
      <path d="M16 11v6.5l4 2.5" stroke={INK} strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="16" cy="17" r="1.6" fill={HI} />
      <rect x="13" y="2.5" width="6" height="3" rx="1.5" fill={HI} />
    </>
  ),
  'Bài': (
    <>
      <rect x="5" y="7" width="14" height="20" rx="3" fill={SOFT} transform="rotate(-12 12 17)" />
      <rect x="12" y="5" width="15" height="21" rx="3" fill={PAPER} stroke={INK} strokeWidth="2.2" />
      <path d="M19.5 11.5c-1.5-2-4.5-.8-4 1.6.4 2 4 4.4 4 4.4s3.6-2.4 4-4.4c.5-2.4-2.5-3.6-4-1.6z" fill="#FFB59E" />
      <circle cx="15.5" cy="22.5" r="1.4" fill={INK} />
    </>
  ),
  'Bát đĩa': (
    <>
      <ellipse cx="16" cy="24" rx="13" ry="3.5" fill={SOFT} />
      <path d="M6 15h20a10 9 0 0 1-20 0z" fill={PAPER} stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M12 9q1.5-2 0-4M16 9q1.5-2 0-4M20 9q1.5-2 0-4" stroke={HI} strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </>
  ),
}

/** Hình đồ vật; đồ vật lạ (AI nhận diện) thì dùng emoji sẵn có. */
export function ToyIcon({ name, emoji, size = 30 }) {
  const art = ICONS[name]
  if (!art) return <span aria-hidden="true" style={{ fontSize: size * 0.85, lineHeight: 1 }}>{emoji || '✨'}</span>
  return <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">{art}</svg>
}

/* Tranh cho 3 thẻ trò chơi ở Góc chơi chung */
export function GameArt({ id }) {
  if (id === 'duel') {
    return (
      <svg viewBox="0 0 62 62" aria-hidden="true">
        <rect x="8" y="14" width="46" height="34" rx="6" fill={PAPER} stroke={INK} strokeWidth="2.5" />
        <path d="M31 14v34" stroke={INK} strokeWidth="2" strokeDasharray="3 3" />
        <circle cx="19.5" cy="31" r="6" fill={HI} /><circle cx="42.5" cy="31" r="6" fill={SOFT} />
        <circle cx="17.5" cy="30" r="1.2" fill="#261D33" /><circle cx="21.5" cy="30" r="1.2" fill="#261D33" />
        <circle cx="40.5" cy="30" r="1.2" fill="#261D33" /><circle cx="44.5" cy="30" r="1.2" fill="#261D33" />
        <path d="M29 6l-3 6h5l-3 6" stroke={INK} strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  if (id === 'tree') {
    return (
      <svg viewBox="0 0 62 62" aria-hidden="true">
        <rect x="27" y="30" width="8" height="24" rx="3" fill="#B07A45" />
        <circle cx="31" cy="24" r="16" fill="#7CC67E" /><circle cx="21" cy="30" r="9" fill="#6BB86E" /><circle cx="41" cy="30" r="9" fill="#6BB86E" />
        <path d="M24 9h14v4a7 7 0 0 1-14 0z" fill="#F2A31B" stroke="#C9850E" strokeWidth="1.5" />
        <ellipse cx="50" cy="12" rx="5" ry="4" fill="#F2A31B" /><path d="M48 9.5v5M51 9.5v5" stroke="#261D33" strokeWidth="1.4" />
        <ellipse cx="50" cy="8" rx="3" ry="2" fill="#FFFFFF" opacity=".9" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 62 62" aria-hidden="true">
      <rect x="10" y="38" width="22" height="7" rx="3.5" fill="#FF8A65" transform="rotate(-20 21 41)" />
      <path d="M33 34l-4 2 1-4z" fill="#261D33" />
      <circle cx="40" cy="44" r="5" fill={SOFT} /><circle cx="16" cy="20" r="4" fill={HI} />
      <circle cx="30" cy="24" r="12" fill="#FFFFFF" fillOpacity=".6" stroke={INK} strokeWidth="3.5" />
      <path d="M39 33l10 10" stroke={INK} strokeWidth="5" strokeLinecap="round" />
      <path d="M24 20a7 7 0 0 1 5-3" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

export function SpeakerIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 5L6 9H2v6h4l5 4V5z" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M19 5a10 10 0 0 1 0 14" />
    </svg>
  )
}
