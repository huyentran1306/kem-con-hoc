/* ============================================================
   🎨 KÈM CON HỌC · 11 BỘ GIAO DIỆN GIA ĐÌNH (8 THƯỜNG NGÀY + 3 THEO MÙA)
   Tự chọn theo sở thích, áp dụng toàn bộ màn hình phụ huynh
   ============================================================ */

export const DEFAULT_THEME = 'bear' // Mặc định Bạn Gấu (ấm áp, dịu dàng)

export const THEMES = [
  {
    id: 'candy',
    name: 'Kẹo Bông',
    desc: 'Hồng tím pastel, bo tròn ngọt ngào, đáy kẹo dẻo',
    icon: '🍬',
    isDark: false,
    fontHead: "'Baloo 2', cursive",
    fontBody: "'Nunito', sans-serif",
    fontHand: "'Baloo 2', cursive",
    googleFont: 'Baloo+2:wght@700;800&family=Nunito:wght@600;700;800;900',
    swatches: ['#FF8FB8', '#B9A3FF', '#7FD8C4', '#FFD36E', '#FFF4F8'],
    vars: {
      '--c-ok-bg': '#4FC4A9',
      '--c-ok-text': '#1F3D36',
      '--c-bg': '#FFF4F8',
      '--c-surface': '#FFFFFF',
      '--c-surface-2': '#EDE4FF',
      '--c-line': '#F3D9E6',
      '--c-text': '#4A3B5C',
      '--c-text-2': '#786C83',
      '--c-accent': '#FF8FB8',
      '--c-accent-ink': '#A35C76',
      '--c-accent-text': '#4A3B5C',
      '--c-accent-2': '#B9A3FF',
      '--c-on-accent': '#4A3B5C',
      '--c-on-accent-2': '#4A3B5C',
      '--c-good': '#7FD8C4',
      '--c-good-bg': '#E3F8F2',
      '--c-good-fg': '#287B6A',
      '--c-on-good': '#4A3B5C',
      '--c-warn': '#FFD36E',
      '--c-warn-bg': '#FFF8D6',
      '--c-warn-line': '#FFE58A',
      '--c-warn-fg': '#916B08',
      '--c-danger': '#C14D7A',
      '--c-danger-ink': '#BA4A76',
      '--c-on-danger': '#FFFFFF',
      '--c-toast-bg': '#1E1B2E',
      '--c-toast-text': '#FFFFFF',
      '--c-read-bg': '#FFFFFF',
      '--c-read-text': '#4A3B5C',
      '--c-hint1-bg': '#FFF8D6',
      '--c-hint1-line': '#FFE58A',
      '--c-btn': 'linear-gradient(#FFC9DD, #FFA9CA)',
      '--c-btn-text': '#4A2B45',
      '--c-nav': '#FFFFFF',
      '--radius-lg': '28px',
      '--radius-md': '20px',
      '--radius-btn': '999px',
      '--border-w': '2px',
      '--shadow-card': '0 7px 0 #F3D9E6',
      '--shadow-btn': '0 6px 0 #E0598E',
    },
    motion: {
      "mascot": "Mây bồng",
      "vessel": {
            "name": "Lọ kẹo bông",
            "icon": "🍭",
            "liquid": "linear-gradient(#FFC2D9,#FF8FB8)",
            "drop": "🍬",
            "spark": "✧"
      },
      "stuck": {
            "particle": "💭"
      },
      "split": {
            "tag": "",
            "cardStyle": "soft"
      },
      "listen": {
            "ring": "dotted",
            "icon": ""
      },
      "fly": {
            "trail": "✧"
      },
      "paw": {
            "stamp": "☁️"
      },
      "sound": "pop kẹo"
},
  },
  {
    id: 'bear',
    name: 'Bạn Gấu',
    desc: 'Mật ong ấm áp, dấu chân gấu, bạn đồng hành dịu dàng',
    icon: '🧸',
    isDark: false,
    fontHead: "'Be Vietnam Pro', sans-serif",
    fontBody: "'Nunito', sans-serif",
    fontHand: "'Be Vietnam Pro', sans-serif",
    googleFont: 'Be+Vietnam+Pro:wght@500;600;700;800&family=Nunito:wght@600;700;800',
    swatches: ['#F6A623', '#7FB7F5', '#8CC98B', '#FFEBD1', '#FFF8EC'],
    vars: {
      '--c-ok-bg': '#7DBB4C',
      '--c-ok-text': '#22360F',
      '--c-bg': '#FFF8EC',
      '--c-surface': '#FFFFFF',
      '--c-surface-2': '#FFEBD1',
      '--c-line': '#F0DDC2',
      '--c-text': '#4B3621',
      '--c-text-2': '#8B6D50',
      '--c-accent': '#F6A623',
      '--c-accent-ink': '#9B6916',
      '--c-accent-text': '#4B3621',
      '--c-accent-2': '#7FB7F5',
      '--c-on-accent': '#4B3621',
      '--c-on-accent-2': '#4B3621',
      '--c-good': '#8CC98B',
      '--c-good-bg': '#E8F6E6',
      '--c-good-fg': '#3F7A3E',
      '--c-on-good': '#4B3621',
      '--c-warn': '#F6C56A',
      '--c-warn-bg': '#FFF1D6',
      '--c-warn-line': '#F6C56A',
      '--c-warn-fg': '#976500',
      '--c-danger': '#A3690C',
      '--c-danger-ink': '#9F670B',
      '--c-on-danger': '#FFFFFF',
      '--c-toast-bg': '#1E1B2E',
      '--c-toast-text': '#FFFFFF',
      '--c-read-bg': '#FFFFFF',
      '--c-read-text': '#4B3621',
      '--c-hint1-bg': '#FFF1D6',
      '--c-hint1-line': '#F6C56A',
      '--c-btn': '#F6A623',
      '--c-btn-text': '#4B3621',
      '--c-nav': '#FFFFFF',
      '--radius-lg': '26px',
      '--radius-md': '18px',
      '--radius-btn': '999px',
      '--border-w': '2px',
      '--shadow-card': '0 6px 0 #F0DDC2',
      '--shadow-btn': '0 6px 0 #C47F0E',
    },
    motion: {
      "mascot": "Gấu mật",
      "vessel": {
            "name": "Hũ mật",
            "icon": "🍯",
            "liquid": "linear-gradient(#F8C04A,#E8A21A)",
            "drop": "💧",
            "spark": "✦"
      },
      "stuck": {
            "particle": "?"
      },
      "split": {
            "tag": "",
            "cardStyle": "soft"
      },
      "listen": {
            "ring": "solid",
            "icon": ""
      },
      "fly": {
            "trail": "•"
      },
      "paw": {
            "stamp": "🐾"
      },
      "sound": "bụp mềm"
},
  },
  {
    id: 'bento',
    name: 'Bento Mềm',
    desc: 'Tối giản, sáng sạch kiểu Apple, dải cam san hô sang tím',
    icon: '🍱',
    isDark: false,
    fontHead: "'Lexend', sans-serif",
    fontBody: "'Inter', sans-serif",
    fontHand: "'Lexend', sans-serif",
    googleFont: 'Lexend:wght@500;700;800&family=Inter:wght@400;500;600;700',
    swatches: ['#FF7A66', '#8A7CFF', '#22B07D', '#1E1B3A', '#F7F7FA'],
    vars: {
      '--c-ok-bg': '#1FA06A',
      '--c-ok-text': '#FFFFFF',
      '--c-bg': '#F7F7FA',
      '--c-surface': '#FFFFFF',
      '--c-surface-2': '#F1EEFF',
      '--c-line': '#E9EAF1',
      '--c-text': '#1E1B3A',
      '--c-text-2': '#6B6E80',
      '--c-accent': '#FF7A66',
      '--c-accent-ink': '#BD4F40',
      '--c-accent-text': '#15161E',
      '--c-accent-2': '#8A7CFF',
      '--c-on-accent': '#15161E',
      '--c-on-accent-2': '#15161E',
      '--c-good': '#22B07D',
      '--c-good-bg': '#E6F7EF',
      '--c-good-fg': '#157E4D',
      '--c-on-good': '#15161E',
      '--c-warn': '#FFC94A',
      '--c-warn-bg': '#FFF6E5',
      '--c-warn-line': '#FFE2B0',
      '--c-warn-fg': '#9A6700',
      '--c-danger': '#B42318',
      '--c-danger-ink': '#B42318',
      '--c-on-danger': '#FFFFFF',
      '--c-toast-bg': '#1E1B2E',
      '--c-toast-text': '#FFFFFF',
      '--c-read-bg': '#EEEBFF',
      '--c-read-text': '#2E2A5E',
      '--c-hint1-bg': '#FFF6E5',
      '--c-hint1-line': '#FFE2B0',
      '--c-btn': 'linear-gradient(135deg, #FF7A66, #9B8CFF)',
      '--c-btn-text': '#1F1A45',
      '--c-nav': '#FFFFFF',
      '--radius-lg': '24px',
      '--radius-md': '18px',
      '--radius-btn': '999px',
      '--border-w': '1px',
      '--shadow-card': '0 10px 26px -20px rgba(21, 22, 30, .35)',
      '--shadow-btn': '0 12px 24px -14px rgba(21, 22, 30, .5)',
    },
    motion: {
      "mascot": "Bé Cơm Nắm",
      "vessel": {
            "name": "Hộp cơm",
            "icon": "🍱",
            "liquid": "linear-gradient(#FFB4A6,#FF7A66)",
            "drop": "🍚",
            "spark": "✦"
      },
      "stuck": {
            "particle": "?"
      },
      "split": {
            "tag": "🍙",
            "cardStyle": "soft"
      },
      "listen": {
            "ring": "solid",
            "icon": ""
      },
      "fly": {
            "trail": "•"
      },
      "paw": {
            "stamp": "🍙"
      },
      "sound": "tách hộp"
},
  },
  {
    id: 'sticker',
    name: 'Sticker Studio',
    desc: 'Viền đen dày, bóng đổ cứng, màu kẹo tươi vui năng động',
    icon: '⚡',
    isDark: false,
    fontHead: "'Paytone One', sans-serif",
    fontBody: "'Nunito', sans-serif",
    fontHand: "'Paytone One', sans-serif",
    googleFont: 'Paytone+One&family=Nunito:wght@600;700;800;900',
    swatches: ['#FF4F8B', '#FFC928', '#39C6A5', '#5667F2', '#1B1B2F'],
    vars: {
      '--c-ok-bg': '#2DBE98',
      '--c-ok-text': '#1B1B2F',
      '--c-bg': '#FFF7E6',
      '--c-surface': '#FFFFFF',
      '--c-surface-2': '#FFF1C9',
      '--c-line': '#1B1B2F',
      '--c-text': '#1B1B2F',
      '--c-text-2': '#5C5A70',
      '--c-accent': '#FF4F8B',
      '--c-accent-ink': '#C73E6C',
      '--c-accent-text': '#1B1B2F',
      '--c-accent-2': '#5667F2',
      '--c-on-accent': '#1B1B2F',
      '--c-on-accent-2': '#FFFFFF',
      '--c-good': '#39C6A5',
      '--c-good-bg': '#D7F5EC',
      '--c-good-fg': '#1B1B2F',
      '--c-on-good': '#1B1B2F',
      '--c-warn': '#FFC928',
      '--c-warn-bg': '#FFF1C9',
      '--c-warn-line': '#1B1B2F',
      '--c-warn-fg': '#1B1B2F',
      '--c-danger': '#FF4F8B',
      '--c-danger-ink': '#C73E6C',
      '--c-on-danger': '#1B1B2F',
      '--c-toast-bg': '#1E1B2E',
      '--c-toast-text': '#FFFFFF',
      '--c-read-bg': '#FFFFFF',
      '--c-read-text': '#1B1B2F',
      '--c-hint1-bg': '#FFC928',
      '--c-hint1-line': '#1B1B2F',
      '--c-btn': '#FF4F8B',
      '--c-btn-text': '#1B1B2F',
      '--c-nav': '#FFFFFF',
      '--radius-lg': '20px',
      '--radius-md': '16px',
      '--radius-btn': '18px',
      '--border-w': '3px',
      '--shadow-card': '5px 5px 0 #1B1B2F',
      '--shadow-btn': '4px 4px 0 #1B1B2F',
    },
    motion: {
      "mascot": "Kỳ lân",
      "vessel": {
            "name": "Thanh năng lượng",
            "icon": "⚡",
            "liquid": "repeating-linear-gradient(45deg,#FF4F8B 0 10px,#FF77A6 10px 20px)",
            "drop": "⚡",
            "spark": "★"
      },
      "stuck": {
            "particle": "⁉"
      },
      "split": {
            "tag": "",
            "cardStyle": "sticker"
      },
      "listen": {
            "ring": "sticker",
            "icon": ""
      },
      "fly": {
            "trail": "⚡"
      },
      "paw": {
            "stamp": "⭐"
      },
      "sound": "bóc sticker"
},
  },
  {
    id: 'notebook',
    name: 'Sổ Tay Buổi Tối',
    desc: 'Giấy kẻ dòng, chữ in sách serif, băng dính mộc mạc',
    icon: '📖',
    isDark: false,
    fontHead: "'Playfair Display', serif",
    fontBody: "'Lora', serif",
    fontHand: "'Mali', cursive",
    googleFont: 'Playfair+Display:ital,wght@0,700;0,900;1,600&family=Lora:ital,wght@0,400;0,600;1,400&family=Mali:wght@500;700',
    swatches: ['#B85B37', '#7D9A6B', '#D8A334', '#2A2622', '#F6F1E7'],
    vars: {
      '--c-ok-bg': '#6A8A57',
      '--c-ok-text': '#FFFFFF',
      '--c-bg': '#F6F1E7',
      '--c-surface': '#FFFFFF',
      '--c-surface-2': '#EFE8DA',
      '--c-line': '#D9D0BE',
      '--c-text': '#2A2622',
      '--c-text-2': '#756D5E',
      '--c-accent': '#B85B37',
      '--c-accent-ink': '#AC5533',
      '--c-accent-text': '#FFFFFF',
      '--c-accent-2': '#5A4B7A',
      '--c-on-accent': '#FFFFFF',
      '--c-on-accent-2': '#FFFFFF',
      '--c-good': '#7D9A6B',
      '--c-good-bg': '#E6EDE0',
      '--c-good-fg': '#4F6B3F',
      '--c-on-good': '#2A2622',
      '--c-warn': '#D8A334',
      '--c-warn-bg': '#FBF3DC',
      '--c-warn-line': '#D8A334',
      '--c-warn-fg': '#956400',
      '--c-danger': '#A32A1A',
      '--c-danger-ink': '#A32A1A',
      '--c-on-danger': '#FFFFFF',
      '--c-toast-bg': '#1E1B2E',
      '--c-toast-text': '#FFFFFF',
      '--c-read-bg': '#FFFFFF',
      '--c-read-text': '#2A2622',
      '--c-hint1-bg': '#FBF3DC',
      '--c-hint1-line': '#D8A334',
      '--c-btn': '#2A2622',
      '--c-btn-text': '#F6F1E7',
      '--c-nav': '#F6F1E7',
      '--radius-lg': '4px',
      '--radius-md': '4px',
      '--radius-btn': '4px',
      '--border-w': '1px',
      '--shadow-card': '0 12px 26px -20px rgba(42, 38, 34, .5)',
      '--shadow-btn': 'none',
    },
    motion: {
      "mascot": "Mèo hạt dẻ",
      "vessel": {
            "name": "Lọ mực",
            "icon": "✒️",
            "liquid": "linear-gradient(#7A6AA0,#5A4B7A)",
            "drop": "💧",
            "spark": "✎"
      },
      "stuck": {
            "particle": "?"
      },
      "split": {
            "tag": "📎",
            "cardStyle": "paper"
      },
      "listen": {
            "ring": "dashed",
            "icon": ""
      },
      "fly": {
            "trail": "✈️"
      },
      "paw": {
            "stamp": "✒️"
      },
      "sound": "lật giấy"
},
  },
  {
    id: 'garden',
    name: 'Khu Vườn Đêm',
    desc: 'Nền tối dịu mắt, đom đóm lập lòe, đèn lồng ấm áp',
    icon: '🌿',
    isDark: true,
    fontHead: "'Comfortaa', sans-serif",
    fontBody: "'Nunito', sans-serif",
    fontHand: "'Comfortaa', sans-serif",
    googleFont: 'Comfortaa:wght@500;700&family=Nunito:wght@600;700;800',
    swatches: ['#0F2A24', '#163B33', '#FFD166', '#6EE7B7', '#F2F7EE'],
    vars: {
      '--c-ok-bg': '#3FD6A0',
      '--c-ok-text': '#0F2A24',
      '--c-bg': '#0F2A24',
      '--c-surface': '#163B33',
      '--c-surface-2': '#1C4A3F',
      '--c-line': '#2A5248',
      '--c-text': '#F2F7EE',
      '--c-text-2': '#A9C4B5',
      '--c-accent': '#FFD166',
      '--c-accent-ink': '#FFD166',
      '--c-accent-text': '#0F2A24',
      '--c-accent-2': '#6EE7B7',
      '--c-on-accent': '#0F2A24',
      '--c-on-accent-2': '#0F2A24',
      '--c-good': '#6EE7B7',
      '--c-good-bg': '#1B4A3B',
      '--c-good-fg': '#6EE7B7',
      '--c-on-good': '#0F2A24',
      '--c-warn': '#FFD166',
      '--c-warn-bg': '#3A3A1F',
      '--c-warn-line': '#7C7A34',
      '--c-warn-fg': '#FFD166',
      '--c-danger': '#FF6B6B',
      '--c-danger-ink': '#FF6E6E',
      '--c-on-danger': '#0F2A24',
      '--c-toast-bg': '#F6F1E6',
      '--c-toast-text': '#0F2A24',
      '--c-read-bg': '#163B33',
      '--c-read-text': '#F2F7EE',
      '--c-hint1-bg': '#3A3A1F',
      '--c-hint1-line': '#FFD166',
      '--c-btn': '#FFD166',
      '--c-btn-text': '#0F2A24',
      '--c-nav': '#0C221D',
      '--radius-lg': '28px 28px 28px 10px',
      '--radius-md': '20px 20px 20px 8px',
      '--radius-btn': '999px',
      '--border-w': '1.5px',
      '--shadow-card': '0 14px 30px -22px rgba(0, 0, 0, .8)',
      '--shadow-btn': '0 0 34px -8px rgba(255, 209, 102, .8)',
    },
    motion: {
      "mascot": "Mầm non",
      "vessel": {
            "name": "Lọ đom đóm",
            "icon": "🫙",
            "liquid": "radial-gradient(circle at 50% 70%,#FFE9A6,#FFD166 45%,#C99A2E)",
            "drop": "✨",
            "spark": "✦"
      },
      "stuck": {
            "particle": "🍃"
      },
      "split": {
            "tag": "🏮",
            "cardStyle": "night"
      },
      "listen": {
            "ring": "glow",
            "icon": ""
      },
      "fly": {
            "trail": "✨"
      },
      "paw": {
            "stamp": "🌱"
      },
      "sound": "chuông gió"
},
  },
  {
    id: 'aurora',
    name: 'Cực Quang',
    desc: 'Kính mờ sang trọng, dải sáng tím ngọc trôi êm đềm',
    icon: '✨',
    isDark: true,
    fontHead: "'Unbounded', sans-serif",
    fontBody: "'Plus Jakarta Sans', sans-serif",
    fontHand: "'Unbounded', sans-serif",
    googleFont: 'Unbounded:wght@500;700;900&family=Plus+Jakarta+Sans:wght@400;600;700;800',
    swatches: ['#0B1026', '#22D3EE', '#A78BFA', '#34D399', '#F3F4FF'],
    vars: {
      '--c-ok-bg': '#22C3A6',
      '--c-ok-text': '#0B1026',
      '--c-bg': '#0B1026',
      '--c-surface': 'rgba(255, 255, 255, .08)',
      '--c-surface-2': 'rgba(167, 139, 250, .2)',
      '--c-line': 'rgba(255, 255, 255, .16)',
      '--c-text': '#F3F4FF',
      '--c-text-2': '#B2B5C3',
      '--c-accent': '#22D3EE',
      '--c-accent-ink': '#22D3EE',
      '--c-accent-text': '#0B1026',
      '--c-accent-2': '#A78BFA',
      '--c-on-accent': '#0B1026',
      '--c-on-accent-2': '#0B1026',
      '--c-good': '#34D399',
      '--c-good-bg': 'rgba(52, 211, 153, .16)',
      '--c-good-fg': '#34D399',
      '--c-on-good': '#0B1026',
      '--c-warn': '#F472B6',
      '--c-warn-bg': 'rgba(244, 114, 182, .14)',
      '--c-warn-line': '#F472B6',
      '--c-warn-fg': '#F9A8D4',
      '--c-danger': '#F43F5E',
      '--c-danger-ink': '#F54C69',
      '--c-on-danger': '#0B1026',
      '--c-toast-bg': '#F6F1E6',
      '--c-toast-text': '#0B1026',
      '--c-read-bg': 'rgba(255, 255, 255, .08)',
      '--c-read-text': '#F3F4FF',
      '--c-hint1-bg': 'rgba(34, 211, 238, .12)',
      '--c-hint1-line': '#22D3EE',
      '--c-btn': 'linear-gradient(90deg, #22D3EE, #34D399)',
      '--c-btn-text': '#0B1026',
      '--c-nav': 'rgba(11, 16, 38, .85)',
      '--radius-lg': '24px',
      '--radius-md': '18px',
      '--radius-btn': '999px',
      '--border-w': '1px',
      '--shadow-card': '0 20px 50px -30px rgba(0, 0, 0, .8)',
      '--shadow-btn': '0 14px 30px -10px rgba(34, 211, 238, .8)',
    },
    motion: {
      "mascot": "Rồng con",
      "vessel": {
            "name": "Ống ánh sáng",
            "icon": "💎",
            "liquid": "linear-gradient(#22D3EE,#A78BFA)",
            "drop": "💫",
            "spark": "✦"
      },
      "stuck": {
            "particle": "✦"
      },
      "split": {
            "tag": "",
            "cardStyle": "glass"
      },
      "listen": {
            "ring": "glow",
            "icon": ""
      },
      "fly": {
            "trail": "💫"
      },
      "paw": {
            "stamp": "✦"
      },
      "sound": "ngân pha lê"
},
  },
  {
    id: 'chalk',
    name: 'Bảng Phấn',
    desc: 'Bảng xanh lớp học, nét vẽ tay ngộ nghĩnh, hoài niệm',
    icon: '🖍️',
    isDark: true,
    fontHead: "'Coiny', cursive",
    fontBody: "'Nunito', sans-serif",
    fontHand: "'Itim', cursive",
    googleFont: 'Coiny&family=Itim&family=Nunito:wght@600;700;800',
    swatches: ['#2F4A41', '#F9E07F', '#F7A1C4', '#9AD0F5', '#F6F1E6'],
    vars: {
      '--c-ok-bg': '#93D985',
      '--c-ok-text': '#22351F',
      '--c-bg': '#2F4A41',
      '--c-surface': 'rgba(246, 241, 230, .07)',
      '--c-surface-2': 'rgba(154, 208, 245, .14)',
      '--c-line': 'rgba(246, 241, 230, .75)',
      '--c-text': '#F6F1E6',
      '--c-text-2': '#CFC8B8',
      '--c-accent': '#F9E07F',
      '--c-accent-ink': '#F9E07F',
      '--c-accent-text': '#2F4A41',
      '--c-accent-2': '#9AD0F5',
      '--c-on-accent': '#2F4A41',
      '--c-on-accent-2': '#2F4A41',
      '--c-good': '#B5E8A8',
      '--c-good-bg': 'rgba(181, 232, 168, .16)',
      '--c-good-fg': '#B5E8A8',
      '--c-on-good': '#2F4A41',
      '--c-warn': '#F7A1C4',
      '--c-warn-bg': 'rgba(247, 161, 196, .14)',
      '--c-warn-line': '#F7A1C4',
      '--c-warn-fg': '#F7A1C4',
      '--c-danger': '#BC5656',
      '--c-danger-ink': '#FBAFAF',
      '--c-on-danger': '#FFFFFF',
      '--c-toast-bg': '#F6F1E6',
      '--c-toast-text': '#2F4A41',
      '--c-read-bg': 'rgba(246, 241, 230, .07)',
      '--c-read-text': '#F6F1E6',
      '--c-hint1-bg': 'rgba(249, 224, 127, .14)',
      '--c-hint1-line': '#F9E07F',
      '--c-btn': '#F9E07F',
      '--c-btn-text': '#2F4A41',
      '--c-nav': '#27403A',
      '--radius-lg': '18px 6px 16px 8px',
      '--radius-md': '12px 5px 14px 6px',
      '--radius-btn': '14px 6px 12px 8px',
      '--border-w': '2px',
      '--shadow-card': 'none',
      '--shadow-btn': '3px 3px 0 rgba(246, 241, 230, .5)',
    },
    motion: {
      "mascot": "Ngôi sao",
      "vessel": {
            "name": "Hộp phấn",
            "icon": "🖍️",
            "liquid": "repeating-linear-gradient(0deg,#F9E07F 0 8px,#FBEAA6 8px 10px)",
            "drop": "▮",
            "spark": "✳"
      },
      "stuck": {
            "particle": "?"
      },
      "split": {
            "tag": "",
            "cardStyle": "chalk"
      },
      "listen": {
            "ring": "chalk",
            "icon": ""
      },
      "fly": {
            "trail": "·"
      },
      "paw": {
            "stamp": "✔"
      },
      "sound": "tiếng phấn"
},
  },
  /* ============ BỘ THEO MÙA (ĐỢT 16) · dùng được quanh năm, đến mùa app chỉ gợi ý ============ */
  {
    id: 'noel',
    name: 'Đêm Tuyết',
    desc: 'Noel · cây thông, quả châu, tuyết rơi nhẹ',
    icon: '🎄',
    isDark: false,
    seasonal: true,
    season: 'noel',
    buddyName: 'Người Tuyết Bông',
    fontHead: "'Nunito', sans-serif",
    fontBody: "'Nunito', sans-serif",
    fontHand: "'Nunito', sans-serif",
    fontGreet: "'Pacifico', cursive",
    googleFont: 'Pacifico&family=Nunito:wght@500;600;700;800;900',
    swatches: ['#F3F8FC', '#C8283F', '#1E6B4C', '#F2C14E', '#14304A'],
    vars: {
      '--c-ok-bg': '#1B7343',
      '--c-ok-text': '#FFFFFF',
      '--c-bg': '#F3F8FC',
      '--c-surface': '#FFFFFF',
      '--c-surface-2': '#E7F1F8',
      '--c-line': '#CFE0EC',
      '--c-text': '#17324A',
      '--c-text-2': '#4F6578',
      '--c-accent': '#C8283F',
      '--c-accent-ink': '#B0233A',
      '--c-accent-text': '#FFFFFF',
      '--c-accent-2': '#1E6B4C',
      '--c-on-accent': '#FFFFFF',
      '--c-on-accent-2': '#FFFFFF',
      '--c-good': '#1F7A47',
      '--c-good-bg': '#E3F4EA',
      '--c-good-fg': '#1D6B40',
      '--c-on-good': '#FFFFFF',
      '--c-warn': '#E3A72F',
      '--c-warn-bg': '#FFF4D9',
      '--c-warn-line': '#F3E2B5',
      '--c-warn-fg': '#8A5A00',
      '--c-danger': '#B8213A',
      '--c-danger-ink': '#A61E33',
      '--c-on-danger': '#FFFFFF',
      '--c-toast-bg': '#17324A',
      '--c-toast-text': '#FFFFFF',
      '--c-read-bg': '#FFF8E6',
      '--c-read-text': '#3A2A10',
      '--c-hint1-bg': '#FFF4D9',
      '--c-hint1-line': '#E3A72F',
      '--c-btn': 'linear-gradient(#CC2C44, #B8213A)',
      '--c-btn-text': '#FFFFFF',
      '--c-nav': '#FFFFFF',
      '--radius-lg': '22px',
      '--radius-md': '16px',
      '--radius-btn': '999px',
      '--border-w': '1.5px',
      '--shadow-card': '0 6px 16px -12px rgba(23, 50, 74, .5)',
      '--shadow-btn': '0 6px 0 #8E1A2D',
    },
    motion: {
      "mascot": "Người Tuyết",
      "vessel": {
            "name": "Tất Noel",
            "icon": "🧦",
            "liquid": "linear-gradient(#E3475E,#C8283F)",
            "drop": "🎁",
            "spark": "❄"
      },
      "stuck": {
            "particle": "❄️"
      },
      "split": {
            "tag": "🎁",
            "cardStyle": "soft"
      },
      "listen": {
            "ring": "solid",
            "icon": "🔔"
      },
      "fly": {
            "trail": "❄"
      },
      "paw": {
            "stamp": "❄️"
      },
      "sound": "leng keng"
},
  },
  {
    id: 'tet',
    name: 'Xuân Sum Vầy',
    desc: 'Tết · cành mai, lồng đèn, lì xì sticker',
    icon: '🧧',
    isDark: false,
    seasonal: true,
    season: 'tet',
    buddyName: 'Bé Lân',
    fontHead: "'Be Vietnam Pro', sans-serif",
    fontBody: "'Be Vietnam Pro', sans-serif",
    fontHand: "'Be Vietnam Pro', sans-serif",
    fontGreet: "'Lobster', cursive",
    googleFont: 'Lobster&family=Be+Vietnam+Pro:wght@400;500;600;700;800',
    swatches: ['#FFF5E6', '#C8102E', '#F6C344', '#23793F', '#4A1A0C'],
    vars: {
      '--c-ok-bg': '#1E7F41',
      '--c-ok-text': '#FFFFFF',
      '--c-bg': '#FFF5E6',
      '--c-surface': '#FFFFFF',
      '--c-surface-2': '#FFE9C7',
      '--c-line': '#F3D3A3',
      '--c-text': '#4A1A0C',
      '--c-text-2': '#7A4A33',
      '--c-accent': '#C8102E',
      '--c-accent-ink': '#B00E28',
      '--c-accent-text': '#FFFFFF',
      '--c-accent-2': '#E9A800',
      '--c-on-accent': '#FFFFFF',
      '--c-on-accent-2': '#4A1A0C',
      '--c-good': '#23793F',
      '--c-good-bg': '#E5F4E7',
      '--c-good-fg': '#1F6B37',
      '--c-on-good': '#FFFFFF',
      '--c-warn': '#E9A800',
      '--c-warn-bg': '#FFF3CC',
      '--c-warn-line': '#F3D9A0',
      '--c-warn-fg': '#845C00',
      '--c-danger': '#B00E28',
      '--c-danger-ink': '#A00D25',
      '--c-on-danger': '#FFFFFF',
      '--c-toast-bg': '#4A1A0C',
      '--c-toast-text': '#FFF5E6',
      '--c-read-bg': '#B00E28',
      '--c-read-text': '#FFE7A3',
      '--c-hint1-bg': '#FFF3CC',
      '--c-hint1-line': '#E9A800',
      '--c-btn': 'linear-gradient(#CE1C36, #B50F2A)',
      '--c-btn-text': '#FFF5D6',
      '--c-nav': '#FFFFFF',
      '--radius-lg': '20px',
      '--radius-md': '14px',
      '--radius-btn': '999px',
      '--border-w': '1.5px',
      '--shadow-card': '0 5px 0 #F3D3A3',
      '--shadow-btn': '0 6px 0 #7E0A1D',
    },
    motion: {
      "mascot": "Bé Lân",
      "vessel": {
            "name": "Bao lì xì",
            "icon": "🧧",
            "liquid": "linear-gradient(#F2C14E,#E9A800)",
            "drop": "🌼",
            "spark": "✿"
      },
      "stuck": {
            "particle": "🏮"
      },
      "split": {
            "tag": "🧧",
            "cardStyle": "soft"
      },
      "listen": {
            "ring": "solid",
            "icon": "🥁"
      },
      "fly": {
            "trail": "🌸"
      },
      "paw": {
            "stamp": "🌼"
      },
      "sound": "trống tùng"
},
  },
  {
    id: 'thieunhi',
    name: 'Cầu Vồng 1/6',
    desc: 'Tết Thiếu nhi · bóng bay, cánh diều, cầu vồng',
    icon: '🪁',
    isDark: false,
    seasonal: true,
    season: 'thieunhi',
    buddyName: 'Diều Cầu Vồng',
    fontHead: "'Baloo 2', sans-serif",
    fontBody: "'Nunito', sans-serif",
    fontHand: "'Itim', cursive",
    fontGreet: "'Baloo 2', sans-serif",
    googleFont: 'Baloo+2:wght@600;700;800&family=Itim&family=Nunito:wght@500;600;700;800;900',
    swatches: ['#F2F8FF', '#2F62E0', '#FF9F1C', '#FFD23F', '#1FA98F'],
    vars: {
      '--c-ok-bg': '#169A80',
      '--c-ok-text': '#FFFFFF',
      '--c-bg': '#F2F8FF',
      '--c-surface': '#FFFFFF',
      '--c-surface-2': '#E6F0FF',
      '--c-line': '#CFE0FA',
      '--c-text': '#1D2340',
      '--c-text-2': '#4E5675',
      '--c-accent': '#2F62E0',
      '--c-accent-ink': '#2A56C6',
      '--c-accent-text': '#FFFFFF',
      '--c-accent-2': '#FF9F1C',
      '--c-on-accent': '#FFFFFF',
      '--c-on-accent-2': '#1D2340',
      '--c-good': '#1FA98F',
      '--c-good-bg': '#DFF7F2',
      '--c-good-fg': '#127663',
      '--c-on-good': '#0B2E28',
      '--c-warn': '#FFC93C',
      '--c-warn-bg': '#FFF6D6',
      '--c-warn-line': '#FFC93C',
      '--c-warn-fg': '#8A6100',
      '--c-danger': '#D23A50',
      '--c-danger-ink': '#C2314A',
      '--c-on-danger': '#FFFFFF',
      '--c-toast-bg': '#1D2340',
      '--c-toast-text': '#FFFFFF',
      '--c-read-bg': '#FFF6D6',
      '--c-read-text': '#1D2340',
      '--c-hint1-bg': '#FFF6D6',
      '--c-hint1-line': '#FFC93C',
      '--c-btn': 'linear-gradient(#3069EA, #2A56C6)',
      '--c-btn-text': '#FFFFFF',
      '--c-nav': '#FFFFFF',
      '--radius-lg': '24px',
      '--radius-md': '18px',
      '--radius-btn': '999px',
      '--border-w': '1.5px',
      '--shadow-card': '0 6px 0 #CFE0FA',
      '--shadow-btn': '0 6px 0 #1D3F99',
    },
    motion: {
      "mascot": "Diều Cầu Vồng",
      "vessel": {
            "name": "Bóng bay",
            "icon": "🎈",
            "liquid": "linear-gradient(#FF9F1C,#FF5E7E 50%,#2F62E0)",
            "drop": "🎈",
            "spark": "✦"
      },
      "stuck": {
            "particle": "🌬️"
      },
      "split": {
            "tag": "🎈",
            "cardStyle": "soft"
      },
      "listen": {
            "ring": "dashed",
            "icon": ""
      },
      "fly": {
            "trail": "🎈"
      },
      "paw": {
            "stamp": "🎈"
      },
      "sound": "tiếng còi giấy"
},
  },
]

/* Mã các bộ theo mùa và 8 bộ thường ngày */
export const SEASONAL_THEMES = THEMES.filter((t) => t.seasonal)
export const REGULAR_THEMES = THEMES.filter((t) => !t.seasonal)

import { deriveCustomThemeVars } from './themes/customPalette.js'

export function getTheme(id) {
  if (id === 'custom') {
    return {
      id: 'custom',
      name: 'Tự thiết kế ✨',
      desc: 'Bộ giao diện độc bản do gia đình tự ghép',
      icon: '✨',
      isDark: false,
      vars: deriveCustomThemeVars(),
    }
  }
  return THEMES.find((t) => t.id === id) || THEMES[0]
}

/* Áp dụng theme vào document element */
export function applyTheme(id, motion = 'full', customConfig = null) {
  if (typeof document === 'undefined') return getTheme(id)
  const root = document.documentElement

  if (id === 'custom') {
    let cfg = customConfig
    if (!cfg && typeof localStorage !== 'undefined') {
      try {
        cfg = JSON.parse(localStorage.getItem('kem-con-hoc:custom-theme') || '{}')
      } catch (e) {}
    }
    const customVars = deriveCustomThemeVars(cfg || {})
    Object.entries(customVars).forEach(([k, v]) => {
      root.style.setProperty(k, v)
    })
    root.dataset.theme = 'custom'
    root.dataset.motion = motion
    root.style.colorScheme = cfg?.mode === 'dark' ? 'dark' : 'light'
    const metaTheme = document.querySelector('meta[name="theme-color"]')
    if (metaTheme) {
      metaTheme.setAttribute('content', customVars['--c-bg'] || (cfg?.mode === 'dark' ? '#0F172A' : '#FFF7ED'))
    }
    try {
      localStorage.setItem('kem-con-hoc:theme', 'custom')
      localStorage.setItem('kem-con-hoc:motion', motion)
      if (cfg) localStorage.setItem('kem-con-hoc:custom-theme', JSON.stringify(cfg))
    } catch (e) {}
    return { id: 'custom', name: 'Tự thiết kế ✨', isDark: cfg?.mode === 'dark', vars: customVars }
  }

  // Khôi phục nếu vừa đổi từ custom
  if (root.dataset.theme === 'custom') {
    root.removeAttribute('style')
  }

  const theme = getTheme(id)
  root.dataset.theme = theme.id
  root.dataset.motion = motion

  // Đổi color-scheme và meta theme-color
  root.style.colorScheme = theme.isDark ? 'dark' : 'light'
  const metaTheme = document.querySelector('meta[name="theme-color"]')
  if (metaTheme) {
    metaTheme.setAttribute('content', theme.vars['--c-bg'] || (theme.isDark ? '#0F172A' : '#FFF7ED'))
  }

  // Nạp font động nếu chưa có
  ensureThemeFont(theme)

  // Lưu vào localStorage để không nháy màu khi tải lại
  try {
    localStorage.setItem('kem-con-hoc:theme', theme.id)
    localStorage.setItem('kem-con-hoc:motion', motion)
    localStorage.setItem('kem-con-hoc:user-custom-theme', 'true')
  } catch (e) {}

  return theme
}

/* Tải thẻ font động cho theme */
const loadedFonts = new Set()

export function ensureThemeFont(theme) {
  if (!theme?.googleFont || loadedFonts.has(theme.id) || typeof document === 'undefined') return
  loadedFonts.add(theme.id)

  const fontId = 'font-theme-' + theme.id
  if (document.getElementById(fontId)) return

  const link = document.createElement('link')
  link.id = fontId
  link.rel = 'stylesheet'
  // Đợt 16: có subset tiếng Việt; font của bộ chỉ tải khi bộ đó được áp dụng
  link.href = `https://fonts.googleapis.com/css2?family=${theme.googleFont}&subset=vietnamese&display=swap`
  document.head.appendChild(link)
}
