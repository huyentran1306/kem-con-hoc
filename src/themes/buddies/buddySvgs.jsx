import React from 'react'
import { BUDDY_QUOTES } from './buddyQuotes.js'

export { BUDDY_QUOTES }

export function BuddyMascot({ buddyId = 'unicorn', state = 'hello', size = 56 }) {
  if (buddyId === 'none') return null

  switch (buddyId) {
    case 'bear':
      return (
        <svg viewBox="0 0 100 100" width={size} height={size}>
          <circle cx="28" cy="28" r="16" fill="#F59E0B" />
          <circle cx="28" cy="28" r="9" fill="#FDE68A" />
          <circle cx="72" cy="28" r="16" fill="#F59E0B" />
          <circle cx="72" cy="28" r="9" fill="#FDE68A" />
          <circle cx="50" cy="54" r="34" fill="#D97706" />
          <ellipse cx="50" cy="62" rx="16" ry="12" fill="#FEF3C7" />
          <ellipse cx="50" cy="58" rx="6" ry="4" fill="#78350F" />
          <circle cx="38" cy="48" r="4" fill="#78350F" />
          <circle cx="62" cy="48" r="4" fill="#78350F" />
          {/* Nơ / Phụ kiện đổi màu theo bộ */}
          <path d="M42 82 Q 50 86, 58 82 Q 54 90, 42 82" fill="var(--c-accent, #EF4444)" />
        </svg>
      )

    case 'unicorn':
      return (
        <svg viewBox="0 0 100 100" width={size} height={size}>
          {/* Bờm cầu vồng */}
          <path d="M30 40 C 20 50, 15 70, 35 85" fill="none" stroke="var(--c-accent, #EC4899)" strokeWidth="8" strokeLinecap="round" />
          {/* Đầu kỳ lân */}
          <path d="M40 30 Q 75 32, 65 65 Q 50 82, 35 70 Z" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
          {/* Sừng xoắn */}
          <polygon points="50,30 65,8 58,30" fill="#F59E0B" stroke="#D97706" strokeWidth="1" />
          {/* Tai */}
          <polygon points="40,32 36,18 46,28" fill="#FBCFE8" />
          {/* Mắt lấp lánh */}
          <ellipse cx="56" cy="46" rx="4" ry="5" fill="#4B5563" />
          <circle cx="58" cy="44" r="1.5" fill="#FFFFFF" />
          {/* Má hồng */}
          <circle cx="62" cy="56" r="4" fill="#F472B6" opacity="0.6" />
        </svg>
      )

    case 'dragon':
      return (
        <svg viewBox="0 0 100 100" width={size} height={size}>
          {/* Đầu rồng */}
          <circle cx="50" cy="52" r="32" fill="#10B981" />
          {/* Sừng vàng */}
          <polygon points="34,30 26,12 40,24" fill="#F59E0B" />
          <polygon points="66,30 74,12 60,24" fill="#F59E0B" />
          {/* Mũi & Lỗ mũi */}
          <ellipse cx="50" cy="62" rx="14" ry="10" fill="#6EE7B7" />
          <circle cx="45" cy="60" r="2.5" fill="#065F46" />
          <circle cx="55" cy="60" r="2.5" fill="#065F46" />
          {/* Mắt to */}
          <circle cx="38" cy="44" r="5" fill="#FFFFFF" />
          <circle cx="39" cy="44" r="3" fill="#064E3B" />
          <circle cx="62" cy="44" r="5" fill="#FFFFFF" />
          <circle cx="61" cy="44" r="3" fill="#064E3B" />
          {/* Khăn quàng cổ màu accent */}
          <path d="M30 76 Q 50 88, 70 76 Q 50 94, 30 76" fill="var(--c-accent, #3B82F6)" />
        </svg>
      )

    case 'cat':
      return (
        <svg viewBox="0 0 100 100" width={size} height={size}>
          {/* Tai mèo */}
          <polygon points="26,35 22,12 42,28" fill="#F97316" />
          <polygon points="26,32 25,18 38,28" fill="#FED7AA" />
          <polygon points="74,35 78,12 58,28" fill="#F97316" />
          <polygon points="74,32 75,18 62,28" fill="#FED7AA" />
          {/* Mặt mèo */}
          <circle cx="50" cy="54" r="32" fill="#EA580C" />
          <ellipse cx="50" cy="62" rx="14" ry="10" fill="#FFEDD5" />
          <polygon points="47,56 53,56 50,60" fill="#BE185D" />
          <circle cx="38" cy="48" r="4" fill="#1E293B" />
          <circle cx="62" cy="48" r="4" fill="#1E293B" />
          {/* Râu */}
          <line x1="24" y1="58" x2="36" y2="60" stroke="#7C2D12" strokeWidth="1.5" />
          <line x1="24" y1="64" x2="36" y2="64" stroke="#7C2D12" strokeWidth="1.5" />
          <line x1="76" y1="58" x2="64" y2="60" stroke="#7C2D12" strokeWidth="1.5" />
          <line x1="76" y1="64" x2="64" y2="64" stroke="#7C2D12" strokeWidth="1.5" />
        </svg>
      )

    case 'star':
      return (
        <svg viewBox="0 0 100 100" width={size} height={size}>
          {/* Ngôi sao 5 cánh */}
          <polygon
            points="50,12 61,38 88,38 66,54 74,80 50,64 26,80 34,54 12,38 39,38"
            fill="#FACC15"
            stroke="#CA8A04"
            strokeWidth="2"
          />
          {/* Mặt cười */}
          <circle cx="43" cy="44" r="3" fill="#713F12" />
          <circle cx="57" cy="44" r="3" fill="#713F12" />
          <path d="M45 52 Q 50 58, 55 52" fill="none" stroke="#713F12" strokeWidth="2" strokeLinecap="round" />
          <circle cx="39" cy="48" r="3" fill="#F87171" opacity="0.6" />
          <circle cx="61" cy="48" r="3" fill="#F87171" opacity="0.6" />
        </svg>
      )

    case 'cloud':
      return (
        <svg viewBox="0 0 100 100" width={size} height={size}>
          <path
            d="M25 65 A 16 16 0 0 1 35 38 A 22 22 0 0 1 72 40 A 18 18 0 0 1 78 65 Z"
            fill="#E0F2FE"
            stroke="#38BDF8"
            strokeWidth="2.5"
          />
          {/* Mắt & Miệng */}
          <circle cx="44" cy="52" r="3" fill="#0369A1" />
          <circle cx="60" cy="52" r="3" fill="#0369A1" />
          <path d="M48 58 Q 52 62, 56 58" fill="none" stroke="#0369A1" strokeWidth="2" strokeLinecap="round" />
          <circle cx="38" cy="56" r="3" fill="#F472B6" opacity="0.6" />
          <circle cx="66" cy="56" r="3" fill="#F472B6" opacity="0.6" />
        </svg>
      )

    case 'sprout':
    default:
      return (
        <svg viewBox="0 0 100 100" width={size} height={size}>
          {/* Hạt & Thân */}
          <ellipse cx="50" cy="72" rx="18" ry="12" fill="#78350F" />
          <path d="M50 70 Q 50 42, 46 32" fill="none" stroke="#16A34A" strokeWidth="4" strokeLinecap="round" />
          {/* 2 lá mầm */}
          <path d="M46 34 C 30 20, 18 36, 46 36 Z" fill="#4ADE80" stroke="#15803D" strokeWidth="1.5" />
          <path d="M46 34 C 64 20, 76 36, 46 36 Z" fill="#22C55E" stroke="#15803D" strokeWidth="1.5" />
          {/* Mắt cười trên hạt */}
          <circle cx="44" cy="70" r="2.5" fill="#FEF3C7" />
          <circle cx="56" cy="70" r="2.5" fill="#FEF3C7" />
        </svg>
      )
  }
}
