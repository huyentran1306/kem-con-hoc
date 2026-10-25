/**
 * 🐻 BỘ ICON GẤU CHO CỔNG GIÁO VIÊN
 * Cùng phong cách với AdminBearIcons (gấu chibi mật ong, viewBox 36×36).
 * Dùng lại các icon admin có sẵn và thêm vài icon riêng cho cô.
 */
import React from 'react'
import { BearTeachersIcon, BearFamiliesIcon, BearConfigIcon, BearReportsIcon } from './AdminBearIcons'

export { BearTeachersIcon as BearClassIcon, BearFamiliesIcon as BearStudentsIcon, BearConfigIcon as BearSettingsIcon, BearReportsIcon, BearReportsIcon as BearResultsIcon }

function BearHead({ y = 0 }) {
  return (
    <g transform={`translate(0 ${y})`}>
      <circle cx="9" cy="9" r="4.5" fill="#D97706" />
      <circle cx="9" cy="9" r="2.5" fill="#FDE68A" />
      <circle cx="27" cy="9" r="4.5" fill="#D97706" />
      <circle cx="27" cy="9" r="2.5" fill="#FDE68A" />
      <circle cx="18" cy="18" r="12" fill="#F59E0B" />
      <ellipse cx="18" cy="21" rx="5.5" ry="4" fill="#FEF3C7" />
      <ellipse cx="18" cy="19" rx="2" ry="1.4" fill="#78350F" />
      <circle cx="14" cy="16" r="1.5" fill="#78350F" />
      <circle cx="14.5" cy="15.5" r="0.5" fill="#FFF" />
      <circle cx="22" cy="16" r="1.5" fill="#78350F" />
      <circle cx="22.5" cy="15.5" r="0.5" fill="#FFF" />
      <circle cx="12" cy="20" r="1.8" fill="#FCA5A5" opacity="0.8" />
      <circle cx="24" cy="20" r="1.8" fill="#FCA5A5" opacity="0.8" />
    </g>
  )
}

// Bài tập & Soạn bài: gấu ôm quyển vở mở có bút chì
export function BearBookIcon({ size = 24, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <BearHead y={-1} />
      <path d="M18 25.5 C14.5 23.5 10.5 23.5 7.5 24.5 V34 C10.5 33 14.5 33 18 35 Z" fill="#FFFFFF" stroke="#D97706" strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M18 25.5 C21.5 23.5 25.5 23.5 28.5 24.5 V34 C25.5 33 21.5 33 18 35 Z" fill="#FFF7E6" stroke="#D97706" strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M10 27.5 H15.5 M10 30 H15 M20.5 27.5 H26 M20.5 30 H25" stroke="#F6C56A" strokeWidth="0.9" strokeLinecap="round" />
      <g transform="rotate(35 30 24)">
        <rect x="28.8" y="17" width="2.4" height="9" rx="0.6" fill="#F472B6" />
        <path d="M28.8 26 L30 28.4 L31.2 26 Z" fill="#FDE68A" />
      </g>
      <circle cx="7.5" cy="26" r="2.1" fill="#F59E0B" />
      <circle cx="28.5" cy="26" r="2.1" fill="#F59E0B" />
    </svg>
  )
}

// Thông báo: gấu lắc chiếc chuông vàng
export function BearBellIcon({ size = 24, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <BearHead y={-1} />
      <path d="M18 23.5 C14 23.5 12.5 26.5 12.5 29.5 V31 H23.5 V29.5 C23.5 26.5 22 23.5 18 23.5 Z" fill="#FBBF24" stroke="#D97706" strokeWidth="1.1" strokeLinejoin="round" />
      <rect x="11" y="31" width="14" height="2" rx="1" fill="#D97706" />
      <circle cx="18" cy="34.2" r="1.5" fill="#D97706" />
      <path d="M8 26 Q6.5 28 8 30 M28 26 Q29.5 28 28 30" stroke="#F472B6" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="11" cy="28" r="2.1" fill="#F59E0B" />
      <circle cx="25" cy="28" r="2.1" fill="#F59E0B" />
    </svg>
  )
}

// Mã QR: gấu cầm tấm thẻ QR
export function BearQrIcon({ size = 24, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <BearHead y={-1} />
      <rect x="10.5" y="23" width="15" height="12" rx="2.2" fill="#FFFFFF" stroke="#D97706" strokeWidth="1.1" />
      <rect x="12.5" y="25" width="3.6" height="3.6" rx="0.6" fill="#4B3621" />
      <rect x="19.9" y="25" width="3.6" height="3.6" rx="0.6" fill="#4B3621" />
      <rect x="12.5" y="29.6" width="3.6" height="3.6" rx="0.6" fill="#4B3621" />
      <rect x="20" y="30" width="1.5" height="1.5" fill="#4B3621" />
      <rect x="22" y="31.8" width="1.5" height="1.5" fill="#4B3621" />
      <circle cx="10" cy="26" r="2.1" fill="#F59E0B" />
      <circle cx="26" cy="26" r="2.1" fill="#F59E0B" />
    </svg>
  )
}
