/**
 * 🐻 BỘ ICON GẤU CHIBI ĐỘC QUYỀN CHO ADMIN STITCH (KÈM CON HỌC)
 * Thiết kế tỉ mỉ, đồng bộ 100% với phong cách Mascot Gấu:
 * Tone màu mật ong (#F59E0B, #D97706, #FEF3C7), nét vẽ bo tròn kawaii.
 */

import React from 'react'

// 1. Tổng quan: Gấu chibi ôm bảng biểu đồ cột và ngôi sao vàng
export function BearOverviewIcon({ size = 24, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Tai gấu */}
      <circle cx="9" cy="9" r="4.5" fill="#D97706" />
      <circle cx="9" cy="9" r="2.5" fill="#FDE68A" />
      <circle cx="27" cy="9" r="4.5" fill="#D97706" />
      <circle cx="27" cy="9" r="2.5" fill="#FDE68A" />
      {/* Đầu gấu */}
      <circle cx="18" cy="18" r="12" fill="#F59E0B" />
      {/* Mõm gấu */}
      <ellipse cx="18" cy="21" rx="5.5" ry="4" fill="#FEF3C7" />
      <ellipse cx="18" cy="19" rx="2" ry="1.4" fill="#78350F" />
      {/* Mắt lấp lánh */}
      <circle cx="14" cy="16" r="1.5" fill="#78350F" />
      <circle cx="14.5" cy="15.5" r="0.5" fill="#FFF" />
      <circle cx="22" cy="16" r="1.5" fill="#78350F" />
      <circle cx="22.5" cy="15.5" r="0.5" fill="#FFF" />
      {/* Má hồng */}
      <circle cx="12" cy="20" r="1.8" fill="#FCA5A5" opacity="0.8" />
      <circle cx="24" cy="20" r="1.8" fill="#FCA5A5" opacity="0.8" />
      {/* Bảng biểu đồ mini ôm trước ngực */}
      <rect x="11" y="23" width="14" height="11" rx="2.5" fill="#FFF" stroke="#D97706" strokeWidth="1.2" />
      <rect x="13.5" y="28.5" width="2" height="3.5" rx="0.8" fill="#10B981" />
      <rect x="17" y="26.5" width="2" height="5.5" rx="0.8" fill="#3B82F6" />
      <rect x="20.5" y="25" width="2" height="7" rx="0.8" fill="#F59E0B" />
      {/* Hai bàn tay ôm bảng */}
      <circle cx="10" cy="26" r="2.2" fill="#F59E0B" />
      <circle cx="26" cy="26" r="2.2" fill="#F59E0B" />
    </svg>
  )
}

// 2. Gia đình & Học sinh: Gấu mẹ chibi ôm bé gấu con cực kỳ ấm áp
export function BearFamiliesIcon({ size = 24, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Tai gấu mẹ */}
      <circle cx="8" cy="10" r="4" fill="#D97706" />
      <circle cx="8" cy="10" r="2.2" fill="#FDE68A" />
      <circle cx="24" cy="10" r="4" fill="#D97706" />
      <circle cx="24" cy="10" r="2.2" fill="#FDE68A" />
      {/* Đầu gấu mẹ */}
      <circle cx="16" cy="17" r="10.5" fill="#F59E0B" />
      {/* Mõm gấu mẹ */}
      <ellipse cx="15" cy="19.5" rx="4.5" ry="3.2" fill="#FEF3C7" />
      <ellipse cx="15" cy="18" rx="1.6" ry="1.1" fill="#78350F" />
      {/* Mắt gấu mẹ cười hiền */}
      <path d="M11 15 Q13 13 14.5 15" stroke="#78350F" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M17.5 15 Q19 13 20.5 15" stroke="#78350F" strokeWidth="1.2" strokeLinecap="round" />
      {/* Má hồng */}
      <circle cx="10.5" cy="18.5" r="1.5" fill="#FCA5A5" opacity="0.8" />
      {/* Gấu con ở góc phải nép vào mẹ */}
      <circle cx="25" cy="23" r="3" fill="#D97706" />
      <circle cx="31" cy="23" r="2.5" fill="#D97706" />
      <circle cx="26.5" cy="27" r="6.5" fill="#FBBF24" stroke="#D97706" strokeWidth="1" />
      <ellipse cx="26" cy="28.5" rx="3" ry="2.2" fill="#FFFBEB" />
      <circle cx="26" cy="27.8" r="0.9" fill="#78350F" />
      <circle cx="24.5" cy="26" r="0.9" fill="#78350F" />
      <circle cx="27.5" cy="26" r="0.9" fill="#78350F" />
      <circle cx="23.5" cy="28" r="1" fill="#F43F5E" opacity="0.7" />
      {/* Trái tim yêu thương nhỏ trên đầu */}
      <path d="M22 6.5 C22 4.5 24 4 25 5.5 C26 4 28 4.5 28 6.5 C28 8.5 25 10 25 10 C25 10 22 8.5 22 6.5 Z" fill="#EF4444" />
    </svg>
  )
}

// 3. Nhật ký & AI: Gấu chibi đeo kính tròn trí thức, cầm bút & cuốn sổ nhật ký
export function BearSessionsIcon({ size = 24, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Tai gấu */}
      <circle cx="9" cy="9" r="4.5" fill="#D97706" />
      <circle cx="9" cy="9" r="2.5" fill="#FDE68A" />
      <circle cx="27" cy="9" r="4.5" fill="#D97706" />
      <circle cx="27" cy="9" r="2.5" fill="#FDE68A" />
      {/* Đầu gấu */}
      <circle cx="18" cy="18" r="12" fill="#F59E0B" />
      {/* Kính tròn trí thức */}
      <circle cx="13.5" cy="16" r="3.2" fill="rgba(255,255,255,0.6)" stroke="#475569" strokeWidth="1.2" />
      <circle cx="22.5" cy="16" r="3.2" fill="rgba(255,255,255,0.6)" stroke="#475569" strokeWidth="1.2" />
      <line x1="16.7" y1="16" x2="19.3" y2="16" stroke="#475569" strokeWidth="1.2" />
      {/* Mắt sau kính */}
      <circle cx="13.5" cy="16" r="1.3" fill="#78350F" />
      <circle cx="22.5" cy="16" r="1.3" fill="#78350F" />
      {/* Mõm gấu */}
      <ellipse cx="18" cy="21.5" rx="4.8" ry="3.5" fill="#FEF3C7" />
      <ellipse cx="18" cy="20" rx="1.8" ry="1.2" fill="#78350F" />
      <path d="M16.5 22.5 Q18 24 19.5 22.5" stroke="#78350F" strokeWidth="0.9" strokeLinecap="round" />
      {/* Sổ nhật ký mini & Bút */}
      <rect x="12" y="24" width="12" height="10" rx="2" fill="#6366F1" />
      <rect x="14" y="25" width="8" height="8" rx="1" fill="#EEF2FF" />
      <line x1="15.5" y1="27.5" x2="20.5" y2="27.5" stroke="#6366F1" strokeWidth="0.9" strokeLinecap="round" />
      <line x1="15.5" y1="29.5" x2="19" y2="29.5" stroke="#6366F1" strokeWidth="0.9" strokeLinecap="round" />
      {/* Bút chì mini */}
      <path d="M25 24 L27 22 L29 24 L27 26 Z" fill="#F59E0B" />
      <line x1="24.5" y1="25.5" x2="27" y2="28" stroke="#D97706" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

// 4. Báo cáo & NPS: Gấu chibi ôm cúp vàng sao lấp lánh
export function BearReportsIcon({ size = 24, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Tai gấu */}
      <circle cx="9" cy="9" r="4.5" fill="#D97706" />
      <circle cx="9" cy="9" r="2.5" fill="#FDE68A" />
      <circle cx="27" cy="9" r="4.5" fill="#D97706" />
      <circle cx="27" cy="9" r="2.5" fill="#FDE68A" />
      {/* Đầu gấu */}
      <circle cx="18" cy="18" r="12" fill="#F59E0B" />
      {/* Mõm gấu */}
      <ellipse cx="18" cy="20" rx="5.5" ry="3.8" fill="#FEF3C7" />
      <ellipse cx="18" cy="18.5" rx="1.8" ry="1.2" fill="#78350F" />
      {/* Mắt cười tít hạnh phúc */}
      <path d="M12 15 Q14 13 16 15" stroke="#78350F" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M20 15 Q22 13 24 15" stroke="#78350F" strokeWidth="1.4" strokeLinecap="round" />
      {/* Má hồng */}
      <circle cx="11" cy="19" r="1.8" fill="#F43F5E" opacity="0.8" />
      <circle cx="25" cy="19" r="1.8" fill="#F43F5E" opacity="0.8" />
      {/* Cúp vàng mini giơ lên cao */}
      <path d="M13 22 H23 V26 C23 28.5 20.8 30.5 18 30.5 C15.2 30.5 13 28.5 13 26 V22 Z" fill="#FBBF24" stroke="#D97706" strokeWidth="1" />
      <path d="M11.5 23 C10 23 10 26 13 26" stroke="#D97706" strokeWidth="1" strokeLinecap="round" />
      <path d="M24.5 23 C26 23 26 26 23 26" stroke="#D97706" strokeWidth="1" strokeLinecap="round" />
      <rect x="16.5" y="30.5" width="3" height="2" fill="#D97706" />
      <rect x="14" y="32.5" width="8" height="2" rx="1" fill="#78350F" />
      {/* Ngôi sao nhỏ trên cúp */}
      <path d="M18 23.5 L18.8 25 L20.5 25 L19.2 26 L19.7 27.5 L18 26.6 L16.3 27.5 L16.8 26 L15.5 25 L17.2 25 Z" fill="#FFF" />
    </svg>
  )
}

// 5. Giáo viên & Lớp: Gấu chibi đội mũ cử nhân tốt nghiệp trang trọng mà cute
export function BearTeachersIcon({ size = 24, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Tai gấu */}
      <circle cx="8" cy="12" r="4.2" fill="#D97706" />
      <circle cx="8" cy="12" r="2.3" fill="#FDE68A" />
      <circle cx="28" cy="12" r="4.2" fill="#D97706" />
      <circle cx="28" cy="12" r="2.3" fill="#FDE68A" />
      {/* Đầu gấu */}
      <circle cx="18" cy="20" r="11.5" fill="#F59E0B" />
      {/* Mõm gấu */}
      <ellipse cx="18" cy="23" rx="5" ry="3.5" fill="#FEF3C7" />
      <ellipse cx="18" cy="21.5" rx="1.8" ry="1.2" fill="#78350F" />
      {/* Mắt thông thái */}
      <circle cx="14" cy="18.5" r="1.5" fill="#78350F" />
      <circle cx="14.5" cy="18" r="0.5" fill="#FFF" />
      <circle cx="22" cy="18.5" r="1.5" fill="#78350F" />
      <circle cx="22.5" cy="18" r="0.5" fill="#FFF" />
      {/* Má hồng */}
      <circle cx="11.5" cy="22" r="1.6" fill="#FCA5A5" opacity="0.8" />
      <circle cx="24.5" cy="22" r="1.6" fill="#FCA5A5" opacity="0.8" />
      {/* Mũ cử nhân trên đầu gấu */}
      <path d="M18 4 L31 9.5 L18 15 L5 9.5 Z" fill="#1E293B" stroke="#0F172A" strokeWidth="0.8" />
      <rect x="12" y="13.5" width="12" height="4" rx="2" fill="#334155" />
      {/* Dây tua rua vàng rủ xuống */}
      <circle cx="18" cy="9.5" r="1.2" fill="#FBBF24" />
      <path d="M18 9.5 Q26 10 27 15" stroke="#FBBF24" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <circle cx="27.5" cy="16" r="1.2" fill="#F59E0B" />
      {/* Cà vạt con gấu nhỏ */}
      <path d="M17 27 L19 27 L20 33 L18 35 L16 33 Z" fill="#DC2626" />
    </svg>
  )
}

// 6. Cấu hình AI & Hệ thống: Gấu chibi công nghệ có tai bánh răng và anten sao
export function BearConfigIcon({ size = 24, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Bánh răng tai trái */}
      <circle cx="8" cy="10" r="4.5" fill="#D97706" />
      <circle cx="8" cy="10" r="2" fill="#FEF3C7" />
      {/* Bánh răng tai phải */}
      <circle cx="28" cy="10" r="4.5" fill="#D97706" />
      <circle cx="28" cy="10" r="2" fill="#FEF3C7" />
      {/* Đầu gấu */}
      <circle cx="18" cy="19" r="11.5" fill="#F59E0B" />
      {/* Mõm gấu */}
      <ellipse cx="18" cy="22" rx="5" ry="3.5" fill="#FEF3C7" />
      <ellipse cx="18" cy="20.5" rx="1.8" ry="1.2" fill="#78350F" />
      {/* Mắt thông minh */}
      <circle cx="14" cy="17.5" r="1.5" fill="#78350F" />
      <circle cx="14.5" cy="17" r="0.5" fill="#FFF" />
      <circle cx="22" cy="17.5" r="1.5" fill="#78350F" />
      <circle cx="22.5" cy="17" r="0.5" fill="#FFF" />
      {/* Má hồng */}
      <circle cx="11.5" cy="21" r="1.6" fill="#FCA5A5" opacity="0.8" />
      <circle cx="24.5" cy="21" r="1.6" fill="#FCA5A5" opacity="0.8" />
      {/* Bánh răng xoay ôm trước ngực */}
      <g transform="translate(18, 28)">
        <circle cx="0" cy="0" r="5.5" fill="#475569" stroke="#94A3B8" strokeWidth="1" />
        <circle cx="0" cy="0" r="2.2" fill="#FFF" />
        {/* Răng cưa */}
        <rect x="-1" y="-7" width="2" height="2" rx="0.5" fill="#94A3B8" />
        <rect x="-1" y="5" width="2" height="2" rx="0.5" fill="#94A3B8" />
        <rect x="-7" y="-1" width="2" height="2" rx="0.5" fill="#94A3B8" />
        <rect x="5" y="-1" width="2" height="2" rx="0.5" fill="#94A3B8" />
      </g>
    </svg>
  )
}

// 7. Công cụ nội bộ: Gấu chibi cầm chiếc cờ lê đồ nghề thợ máy siêu ngộ
export function BearToolsIcon({ size = 24, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Tai gấu */}
      <circle cx="9" cy="9" r="4.5" fill="#D97706" />
      <circle cx="9" cy="9" r="2.5" fill="#FDE68A" />
      <circle cx="27" cy="9" r="4.5" fill="#D97706" />
      <circle cx="27" cy="9" r="2.5" fill="#FDE68A" />
      {/* Đầu gấu */}
      <circle cx="18" cy="18" r="12" fill="#F59E0B" />
      {/* Mõm gấu */}
      <ellipse cx="18" cy="21" rx="5" ry="3.5" fill="#FEF3C7" />
      <ellipse cx="18" cy="19.5" rx="1.8" ry="1.2" fill="#78350F" />
      {/* Mắt nháy tinh nghịch */}
      <path d="M12.5 16 Q14.5 14 15.5 16" stroke="#78350F" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="22" cy="16" r="1.5" fill="#78350F" />
      <circle cx="22.5" cy="15.5" r="0.5" fill="#FFF" />
      {/* Má hồng */}
      <circle cx="11" cy="20" r="1.6" fill="#FCA5A5" opacity="0.8" />
      <circle cx="25" cy="20" r="1.6" fill="#FCA5A5" opacity="0.8" />
      {/* Chiếc cờ lê chéo sau tay */}
      <path d="M22 23 L28 29 M27 23 L23 27" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" />
      {/* Hộp đồ nghề mini màu đỏ */}
      <rect x="11" y="25" width="12" height="8" rx="2" fill="#EF4444" stroke="#B91C1C" strokeWidth="1" />
      <rect x="14" y="23" width="6" height="2" rx="0.5" fill="#991B1B" />
      <circle cx="17" cy="29" r="1" fill="#FEF08A" />
    </svg>
  )
}

// -------------------------------------------------------------
// SUB-MENU ICONS CHO CẤU HÌNH AI & HỆ THỐNG
// -------------------------------------------------------------

// Sub 1: Mô hình & Tham số (Chip AI gấu)
export function BearSubModelIcon({ size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="4" y="4" width="16" height="16" rx="4" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.5" />
      {/* 2 tai gấu nhỏ trên chip */}
      <circle cx="6" cy="3" r="2" fill="#D97706" />
      <circle cx="18" cy="3" r="2" fill="#D97706" />
      {/* Chân chip */}
      <line x1="8" y1="1" x2="8" y2="4" stroke="#D97706" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="16" y1="1" x2="16" y2="4" stroke="#D97706" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="8" y1="20" x2="8" y2="23" stroke="#D97706" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="16" y1="20" x2="16" y2="23" stroke="#D97706" strokeWidth="1.2" strokeLinecap="round" />
      {/* Mặt gấu chibi nhỏ xíu trong chip */}
      <circle cx="12" cy="12" r="4.5" fill="#F59E0B" />
      <ellipse cx="12" cy="13.2" rx="2" ry="1.4" fill="#FFF" />
      <circle cx="10.5" cy="11.2" r="0.6" fill="#78350F" />
      <circle cx="13.5" cy="11.2" r="0.6" fill="#78350F" />
    </svg>
  )
}

// Sub 2: Prompt Studio (Ống nghiệm phép thuật & ngôi sao)
export function BearSubPromptIcon({ size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M9 3 H15 M10 3 V7 L5.5 17 C4.8 18.5 5.8 20.5 7.5 20.5 H16.5 C18.2 20.5 19.2 18.5 18.5 17 L14 7 V3" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="rgba(237, 233, 254, 0.4)" />
      {/* Dung dịch phép thuật màu mật ong */}
      <path d="M7 16 C8.5 15 10 16.5 12 15 C14 13.5 15.5 15 17 16 L16.5 20 H7.5 L7 16 Z" fill="#F59E0B" />
      <circle cx="10" cy="18" r="0.8" fill="#FFF" />
      <circle cx="14" cy="17" r="0.6" fill="#FFF" />
      {/* Ngôi sao ý tưởng bay ra */}
      <path d="M17 5 L17.5 6 L18.5 6.5 L17.5 7 L17 8 L16.5 7 L15.5 6.5 L16.5 6 Z" fill="#FBBF24" />
    </svg>
  )
}

// Sub 3: Router Sư phạm (La bàn gấu & Mũi tên dẫn lối)
export function BearSubRouterIcon({ size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="12" cy="12" r="8.5" fill="#FEF3C7" stroke="#0284C7" strokeWidth="1.5" />
      {/* Tai gấu trên la bàn */}
      <circle cx="6" cy="5" r="2.2" fill="#0284C7" />
      <circle cx="18" cy="5" r="2.2" fill="#0284C7" />
      {/* Kim la bàn */}
      <polygon points="12,6 14.5,12 12,11 9.5,12" fill="#EF4444" />
      <polygon points="12,18 14.5,12 12,13 9.5,12" fill="#0284C7" />
      <circle cx="12" cy="12" r="1.5" fill="#FFF" stroke="#78350F" strokeWidth="0.8" />
    </svg>
  )
}

// Sub 4: Phạm vi Đề & Ảnh (Khiên bảo vệ tai gấu)
export function BearSubScopeIcon({ size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M12 2.5 L19 5.5 V11 C19 16 16 19.5 12 21.5 C8 19.5 5 16 5 11 V5.5 L12 2.5 Z" fill="#DCFCE7" stroke="#16A34A" strokeWidth="1.5" />
      {/* Dấu chân gấu bảo an ở giữa khiên */}
      <ellipse cx="12" cy="13" rx="3" ry="2.2" fill="#16A34A" />
      <circle cx="9" cy="9.5" r="1" fill="#16A34A" />
      <circle cx="11" cy="8.5" r="1" fill="#16A34A" />
      <circle cx="13" cy="8.5" r="1" fill="#16A34A" />
      <circle cx="15" cy="9.5" r="1" fill="#16A34A" />
    </svg>
  )
}

// Sub 5: Giao diện App (Bảng màu tai gấu & cọ vẽ)
export function BearSubThemesIcon({ size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M12 3 C6.5 3 2 7 2 12 C2 16.5 6 20 10.5 20 C11.5 20 12 19.5 12 18.5 C12 18 12.5 17.5 13 17.5 H14.5 C18.5 17.5 22 14.5 22 10.5 C22 6 17.5 3 12 3 Z" fill="#FEF3C7" stroke="#EA580C" strokeWidth="1.4" />
      {/* Các giọt màu sắc */}
      <circle cx="6.5" cy="9" r="1.5" fill="#EF4444" />
      <circle cx="10" cy="6.5" r="1.5" fill="#F59E0B" />
      <circle cx="14.5" cy="6.5" r="1.5" fill="#10B981" />
      <circle cx="18" cy="9" r="1.5" fill="#3B82F6" />
      {/* Lỗ xỏ ngón tay cái hình đầu gấu */}
      <ellipse cx="16" cy="14" rx="2" ry="1.5" fill="#EA580C" />
    </svg>
  )
}

// Sub 6: Quản trị viên & PIN (Huy hiệu gấu đeo thẻ)
export function BearSubAdminsIcon({ size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="4" y="6" width="16" height="15" rx="3" fill="#EFF6FF" stroke="#2563EB" strokeWidth="1.4" />
      {/* Dây đeo thẻ */}
      <path d="M9 2 L12 6 L15 2" stroke="#2563EB" strokeWidth="1.2" strokeLinecap="round" />
      {/* Ảnh gấu admin trong thẻ */}
      <circle cx="12" cy="11" r="3" fill="#F59E0B" />
      <line x1="8" y1="16.5" x2="16" y2="16.5" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="9" y1="18.5" x2="14" y2="18.5" stroke="#93C5FD" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

// Sub 7: Nhật ký thao tác (Cuộn thư vết chân gấu)
export function BearSubAuditIcon({ size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M6 3 H18 C19.1 3 20 3.9 20 5 V17 C20 18.1 19.1 19 18 19 H6 C4.9 19 4 18.1 4 17 V5 C4 3.9 4.9 3 6 3 Z" fill="#FFFBEB" stroke="#B45309" strokeWidth="1.4" />
      <line x1="7" y1="7" x2="14" y2="7" stroke="#D97706" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="7" y1="10" x2="16" y2="10" stroke="#D97706" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="7" y1="13" x2="12" y2="13" stroke="#D97706" strokeWidth="1.2" strokeLinecap="round" />
      {/* Dấu chân gấu nhỏ đóng dấu đỏ dưới góc */}
      <ellipse cx="16" cy="15.5" rx="1.8" ry="1.3" fill="#DC2626" />
      <circle cx="14.8" cy="13.8" r="0.5" fill="#DC2626" />
      <circle cx="16" cy="13.3" r="0.5" fill="#DC2626" />
      <circle cx="17.2" cy="13.8" r="0.5" fill="#DC2626" />
    </svg>
  )
}

// Sub 8: Hạ tầng Cloudflare (Đám mây tai gấu kết nối)
export function BearSubInfraIcon({ size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* 2 tai gấu trên đám mây */}
      <circle cx="7" cy="7" r="2.5" fill="#F59E0B" />
      <circle cx="17" cy="7" r="2.5" fill="#F59E0B" />
      {/* Đám mây bồng bềnh */}
      <path d="M6.5 18 H17.5 C19.5 18 21 16.5 21 14.5 C21 12.6 19.6 11.2 17.8 11 C17.3 8.2 14.9 6 12 6 C9.4 6 7.2 7.8 6.5 10.2 C4.5 10.6 3 12.4 3 14.5 C3 16.5 4.6 18 6.5 18 Z" fill="#F8FAFC" stroke="#F59E0B" strokeWidth="1.4" />
      {/* Tia sét cam nhỏ ở giữa */}
      <polygon points="12,10 10.5,13.5 12,13.5 11.5,16.5 14,12.5 12.5,12.5" fill="#F59E0B" />
    </svg>
  )
}

// Sub 9: Thông báo & Zalo (Bong bóng lời thoại tai gấu)
export function BearSubZaloIcon({ size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Tai gấu trên bóng chat */}
      <circle cx="6" cy="5" r="2.2" fill="#0EA5E9" />
      <circle cx="16" cy="5" r="2.2" fill="#0EA5E9" />
      <path d="M4 8 C4 5.8 5.8 4 8 4 H14 C16.2 4 18 5.8 18 8 V13 C18 15.2 16.2 17 14 17 H8 L4 20 V8 Z" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1.4" />
      {/* 3 chấm chat vui vẻ */}
      <circle cx="8" cy="11" r="1.2" fill="#0284C7" />
      <circle cx="11" cy="11" r="1.2" fill="#0284C7" />
      <circle cx="14" cy="11" r="1.2" fill="#0284C7" />
    </svg>
  )
}

// Sub 10: D1 SQL Studio (Terminal D1 tai gấu)
export function BearSubSqlIcon({ size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="6" cy="4" r="2.2" fill="#D97706" />
      <circle cx="18" cy="4" r="2.2" fill="#D97706" />
      <rect x="3" y="6" width="18" height="15" rx="3" fill="#0F172A" stroke="#F59E0B" strokeWidth="1.4" />
      <path d="M7 11L10 13.5L7 16" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="12" y1="16" x2="16" y2="16" stroke="#4ADE80" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

// Sub 11: Team Prompts Sync (Vòng tròn đồng bộ 2 mũi tên tai gấu)
export function BearSubSyncIcon({ size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="6" cy="4" r="2" fill="#8B5CF6" />
      <circle cx="18" cy="4" r="2" fill="#8B5CF6" />
      <path d="M19 12A7 7 0 0 1 7.5 17.5L5 15M5 12A7 7 0 0 1 16.5 6.5L19 9" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 5V9H15" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M5 19V15H9" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="12" cy="12" r="1.5" fill="#F59E0B" />
    </svg>
  )
}
