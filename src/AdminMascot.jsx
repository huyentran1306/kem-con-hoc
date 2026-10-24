/**
 * 🐻 MASCOT GẤU QUẢN TRỊ (PROMPT 05)
 * Dùng chung phong cách SVG với Bạn Gấu của app.
 * 4 trạng thái theo thiết kế:
 * 1. greeting (chào)      - Màn đăng nhập & Lời chào Tổng quan
 * 2. lock (giữ khoá)      - Màn khoá PIN
 * 3. search (tìm kiếm)    - Trạng thái rỗng / không tìm thấy kết quả
 * 4. happy (vui)          - Lưu thành công / hoàn thành
 */

import React from 'react';

export function BearMascot({ mood = 'greeting', size = 80, className = '' }) {
  if (mood === 'greeting') {
    return (
      <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        {/* Tai */}
        <circle cx="34" cy="34" r="16" fill="#D97706" />
        <circle cx="34" cy="34" r="9" fill="#FDE68A" />
        <circle cx="86" cy="34" r="16" fill="#D97706" />
        <circle cx="86" cy="34" r="9" fill="#FDE68A" />
        {/* Đầu */}
        <circle cx="60" cy="65" r="42" fill="#F59E0B" />
        {/* Mõm */}
        <ellipse cx="60" cy="74" rx="19" ry="14" fill="#FEF3C7" />
        <ellipse cx="60" cy="67" rx="7" ry="5" fill="#78350F" />
        {/* Mắt tròn đen lấp lánh */}
        <circle cx="48" cy="59" r="4.5" fill="#78350F" />
        <circle cx="50" cy="57" r="1.5" fill="#FFFFFF" />
        <circle cx="72" cy="59" r="4.5" fill="#78350F" />
        <circle cx="74" cy="57" r="1.5" fill="#FFFFFF" />
        {/* Miệng cười hiền */}
        <path d="M55 77 Q60 82 65 77" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
        {/* Má hồng pastel */}
        <circle cx="41" cy="71" r="6" fill="#FCA5A5" opacity="0.65" />
        <circle cx="79" cy="71" r="6" fill="#FCA5A5" opacity="0.65" />
        {/* Tay vẫy chào */}
        <path d="M96 70 Q112 55 106 42 Q98 40 92 58" fill="#F59E0B" />
        <circle cx="103" cy="46" r="6" fill="#FDE68A" />
      </svg>
    );
  }

  if (mood === 'lock') {
    return (
      <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        {/* Tai */}
        <circle cx="34" cy="32" r="16" fill="#D97706" />
        <circle cx="34" cy="32" r="9" fill="#FDE68A" />
        <circle cx="86" cy="32" r="16" fill="#D97706" />
        <circle cx="86" cy="32" r="9" fill="#FDE68A" />
        {/* Đầu */}
        <circle cx="60" cy="62" r="40" fill="#F59E0B" />
        {/* Mõm */}
        <ellipse cx="60" cy="71" rx="18" ry="13" fill="#FEF3C7" />
        <ellipse cx="60" cy="64" rx="7" ry="5" fill="#78350F" />
        {/* Mắt chú tâm */}
        <circle cx="48" cy="56" r="4.5" fill="#78350F" />
        <circle cx="50" cy="54" r="1.5" fill="#FFFFFF" />
        <circle cx="72" cy="56" r="4.5" fill="#78350F" />
        <circle cx="74" cy="54" r="1.5" fill="#FFFFFF" />
        {/* Miệng nhỏ kiên nhẫn */}
        <path d="M56 74 Q60 76 64 74" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
        {/* Má hồng */}
        <circle cx="42" cy="68" r="5" fill="#FCA5A5" opacity="0.6" />
        <circle cx="78" cy="68" r="5" fill="#FCA5A5" opacity="0.6" />
        {/* Hai tay ôm ổ khoá vàng phía trước */}
        <circle cx="42" cy="95" r="12" fill="#F59E0B" />
        <circle cx="78" cy="95" r="12" fill="#F59E0B" />
        {/* Còng khoá bạc */}
        <path d="M52 86 V78 C52 73.5 55.5 70 60 70 C64.5 70 68 73.5 68 78 V86" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" />
        {/* Thân ổ khoá vàng */}
        <rect x="46" y="86" width="28" height="22" rx="6" fill="#FBBF24" stroke="#D97706" strokeWidth="2" />
        <circle cx="60" cy="95" r="2.5" fill="#78350F" />
        <path d="M60 97.5 V102" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (mood === 'search') {
    return (
      <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        {/* Tai */}
        <circle cx="34" cy="34" r="16" fill="#D97706" />
        <circle cx="34" cy="34" r="9" fill="#FDE68A" />
        <circle cx="86" cy="34" r="16" fill="#D97706" />
        <circle cx="86" cy="34" r="9" fill="#FDE68A" />
        {/* Đầu */}
        <circle cx="60" cy="65" r="42" fill="#F59E0B" />
        {/* Mõm */}
        <ellipse cx="60" cy="74" rx="19" ry="14" fill="#FEF3C7" />
        <ellipse cx="60" cy="67" rx="7" ry="5" fill="#78350F" />
        {/* Mắt tò mò (nhìn về phía kính lúp) */}
        <circle cx="46" cy="59" r="4" fill="#78350F" />
        <circle cx="70" cy="59" r="5" fill="#78350F" />
        <circle cx="72" cy="57" r="2" fill="#FFFFFF" />
        {/* Miệng chữ O ngạc nhiên */}
        <ellipse cx="60" cy="78" rx="3.5" ry="4.5" fill="#78350F" />
        {/* Má hồng */}
        <circle cx="41" cy="71" r="6" fill="#FCA5A5" opacity="0.6" />
        <circle cx="79" cy="71" r="6" fill="#FCA5A5" opacity="0.6" />
        {/* Kính lúp cầm tay */}
        <circle cx="86" cy="72" r="16" fill="rgba(224, 242, 254, 0.6)" stroke="#0284C7" strokeWidth="4" />
        <path d="M97 83 L110 96" stroke="#0369A1" strokeWidth="6" strokeLinecap="round" />
        <path d="M80 66 Q88 64 92 70" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  // Mood: happy (vui / lưu thành công)
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Tia sáng ngôi sao vui mừng */}
      <path d="M22 25 L25 18 L28 25 L35 28 L28 31 L25 38 L22 31 L15 28 Z" fill="#FBBF24" opacity="0.8" />
      <path d="M95 20 L97 15 L99 20 L104 22 L99 24 L97 29 L95 24 L90 22 Z" fill="#FBBF24" opacity="0.8" />
      {/* Tai */}
      <circle cx="34" cy="34" r="16" fill="#D97706" />
      <circle cx="34" cy="34" r="9" fill="#FDE68A" />
      <circle cx="86" cy="34" r="16" fill="#D97706" />
      <circle cx="86" cy="34" r="9" fill="#FDE68A" />
      {/* Đầu */}
      <circle cx="60" cy="65" r="42" fill="#F59E0B" />
      {/* Mõm */}
      <ellipse cx="60" cy="74" rx="19" ry="14" fill="#FEF3C7" />
      <ellipse cx="60" cy="67" rx="7" ry="5" fill="#78350F" />
      {/* Mắt cười tít hình cầu vồng */}
      <path d="M44 59 Q49 51 54 59" stroke="#78350F" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M66 59 Q71 51 76 59" stroke="#78350F" strokeWidth="3.5" strokeLinecap="round" />
      {/* Miệng cười rạng rỡ có răng thỏ */}
      <path d="M53 76 Q60 86 67 76 Z" fill="#DC2626" />
      <path d="M57 76 H63 V79 H57 Z" fill="#FFFFFF" />
      {/* Má hồng đậm vui sướng */}
      <circle cx="40" cy="71" r="7" fill="#F43F5E" opacity="0.75" />
      <circle cx="80" cy="71" r="7" fill="#F43F5E" opacity="0.75" />
      {/* Hai tay giơ lên ăn mừng */}
      <circle cx="26" cy="76" r="10" fill="#F59E0B" />
      <circle cx="94" cy="76" r="10" fill="#F59E0B" />
    </svg>
  );
}
