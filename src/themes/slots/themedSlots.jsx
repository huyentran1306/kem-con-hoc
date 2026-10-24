/* ============================================================
   KÈM CON HỌC — THEMED SLOTS FOR 8 THEMES
   Prompt 07 Phần B (Bố cục & thành phần riêng cho từng bộ)
   Tham khảo chính xác từ tham-khao/8-bo-giao-dien-rieng.html
   ============================================================ */
import React, { useState, useRef } from 'react'
import { InputModeIcon } from '../themeIcons'

/* ============================================================
   1. BẠN GẤU (BEAR)
   ============================================================ */
export function BearStudyTracker({ tracker, onOpenReport }) {
  if (!tracker) return null
  const { week, weekCount, weekGoal, streak, encouragement } = tracker

  return (
    <div
      className="card bear-tracker"
      style={{
        padding: '16px',
        background: '#FFF8EC',
        border: '2px solid #F0DDC2',
        borderRadius: 22,
        boxShadow: '0 5px 0 #F0DDC2',
        cursor: onOpenReport ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
      onClick={onOpenReport}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 18 }}>🐾</span>
          <b style={{ fontSize: 14, color: '#4B3621' }}>7 Dấu chân Gấu tuần này</b>
          {streak >= 2 && (
            <span style={{ fontSize: 11, fontWeight: 800, color: '#9B6916', background: '#FFEBD1', padding: '2px 8px', borderRadius: 999 }}>
              🔥 {streak} tối
            </span>
          )}
        </div>
        <span style={{ fontSize: 13, fontWeight: 800, color: '#9B6916' }}>
          {weekCount}/{weekGoal} tối
        </span>
      </div>

      {/* 7 Dấu chân gấu so le */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 4px', position: 'relative' }}>
        {week.map((d, i) => {
          const isDone = d.status === 'done' || d.status === 'todayDone'
          const isToday = d.isToday
          const offsetY = i % 2 === 1 ? 8 : -2
          return (
            <div
              key={d.dateKey}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                transform: `translateY(${offsetY}px)`,
                transition: 'transform 0.2s',
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: isDone ? '#F6A623' : isToday ? '#FFEBD1' : '#FFFFFF',
                  border: isToday ? '2px solid #F6A623' : '1.5px solid #F0DDC2',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 16,
                  color: isDone ? '#4B3621' : '#9C7B5A',
                  boxShadow: isDone ? '0 3px 0 #C47F0E' : 'none',
                }}
              >
                {isDone ? '🐾' : d.dayNum}
              </div>
              <span style={{ fontSize: 11, fontWeight: isToday ? 800 : 600, color: '#8B6D50' }}>{d.label}</span>
            </div>
          )
        })}
      </div>

      <div style={{ fontSize: 12, color: '#8B6D50', textAlign: 'center', borderTop: '1px dashed #F0DDC2', paddingTop: 8 }}>
        🧸 Gấu nhớ: {encouragement}
      </div>
    </div>
  )
}

export function BearStartAction({ onStart }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <button
        data-testid="start-photo"
        className="btn"
        style={{
          background: '#F6A623',
          color: '#4B3621',
          padding: '16px 20px',
          fontSize: 17,
          fontWeight: 800,
          borderRadius: 999,
          boxShadow: '0 6px 0 #C47F0E',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
        }}
        onClick={() => onStart?.('photo')}
      >
        <span style={{ fontSize: 24 }}>🍯</span>
        <span>BẮT ĐẦU BÀI TỐI NAY VỚI GẤU</span>
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <button
          data-testid="start-type"
          className="btn ghost"
          style={{ padding: '12px', fontSize: 13, fontWeight: 700, borderColor: '#F0DDC2' }}
          onClick={() => onStart?.('type')}
        >
          <InputModeIcon mode="type" size={18} /> Gõ đề bài
        </button>
        <button
          data-testid="start-voice"
          className="btn ghost"
          style={{ padding: '12px', fontSize: 13, fontWeight: 700, borderColor: '#F0DDC2' }}
          onClick={() => onStart?.('voice')}
        >
          <InputModeIcon mode="voice" size={18} /> Đọc đề cho Gấu
        </button>
      </div>
    </div>
  )
}

/* ============================================================
   2. KẸO BÔNG (CANDY)
   ============================================================ */
export function CandyStudyTracker({ tracker, onOpenReport }) {
  if (!tracker) return null
  const { week, weekCount, weekGoal, streak, encouragement } = tracker

  return (
    <div
      className="card candy-tracker"
      style={{
        padding: '16px',
        background: '#FFF4F8',
        border: '2px solid #F3D9E6',
        borderRadius: 24,
        boxShadow: '0 6px 0 #F3D9E6',
        cursor: onOpenReport ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
      onClick={onOpenReport}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 20 }}>🍬</span>
          <b style={{ fontSize: 14, color: '#4A3B5C' }}>Lọ kẹo của bé</b>
          {streak >= 2 && (
            <span style={{ fontSize: 11, fontWeight: 800, color: '#A35C76', background: '#EDE4FF', padding: '2px 8px', borderRadius: 999 }}>
              ✨ {streak} tối
            </span>
          )}
        </div>
        <span style={{ fontSize: 13, fontWeight: 800, color: '#A35C76' }}>
          {weekCount}/{weekGoal} viên kẹo
        </span>
      </div>

      {/* 7 hạt kẹo Thứ Hai -> Chủ Nhật */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, textAlign: 'center' }}>
        {week.map((d) => {
          const isDone = d.status === 'done' || d.status === 'todayDone'
          const isToday = d.isToday
          return (
            <div key={d.dateKey} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 14,
                  background: isDone ? 'linear-gradient(135deg, #FFC9DD, #FFA9CA)' : isToday ? '#EDE4FF' : '#FFFFFF',
                  border: isToday ? '2px solid #FF8FB8' : '1.5px solid #F3D9E6',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 16,
                  color: '#4A3B5C',
                  boxShadow: isDone ? '0 3px 0 #E0598E' : 'none',
                  transform: isDone ? 'scale(1.05)' : 'none',
                  transition: 'transform 0.2s',
                }}
              >
                {isDone ? '🍬' : d.dayNum}
              </div>
              <span style={{ fontSize: 11, fontWeight: isToday ? 800 : 600, color: '#786C83' }}>{d.label}</span>
            </div>
          )
        })}
      </div>

      <div style={{ fontSize: 12, color: '#786C83', textAlign: 'center', borderTop: '1px dashed #F3D9E6', paddingTop: 8 }}>
        ☁️ Bạn Mây cổ vũ: {encouragement}
      </div>
    </div>
  )
}

/* ============================================================
   3. KHU VƯỜN ĐÊM (GARDEN)
   ============================================================ */
export function GardenStudyTracker({ tracker, onOpenReport }) {
  if (!tracker) return null
  const { week, weekCount, weekGoal, streak, encouragement } = tracker

  return (
    <div
      className="card garden-tracker"
      style={{
        padding: '16px',
        background: '#163B33',
        border: '1.5px solid #2A5248',
        borderRadius: '24px 24px 24px 8px',
        boxShadow: '0 14px 30px -22px rgba(0,0,0,0.8)',
        cursor: onOpenReport ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        color: '#F2F7EE',
      }}
      onClick={onOpenReport}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 18 }}>🌿</span>
          <b style={{ fontSize: 14, color: '#F2F7EE' }}>Cây vườn đêm</b>
          {weekCount >= weekGoal && <span style={{ fontSize: 16 }}>🌸 (Nở hoa)</span>}
        </div>
        <span style={{ fontSize: 13, fontWeight: 800, color: '#FFD166' }}>
          {weekCount}/{weekGoal} lá xanh
        </span>
      </div>

      {/* 7 chậu cây T2 -> CN */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, textAlign: 'center' }}>
        {week.map((d) => {
          const isDone = d.status === 'done' || d.status === 'todayDone'
          const isToday = d.isToday
          return (
            <div key={d.dateKey} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '12px 12px 12px 4px',
                  background: isDone ? '#6EE7B7' : isToday ? '#1C4A3F' : '#0F2A24',
                  border: isToday ? '1.5px solid #FFD166' : '1.5px solid #2A5248',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 16,
                  color: isDone ? '#0F2A24' : '#A9C4B5',
                  boxShadow: isDone ? '0 0 12px rgba(110,231,183,0.5)' : 'none',
                }}
              >
                {isDone ? '🌱' : d.dayNum}
              </div>
              <span style={{ fontSize: 11, fontWeight: isToday ? 800 : 600, color: '#A9C4B5' }}>{d.label}</span>
            </div>
          )
        })}
      </div>

      <div style={{ fontSize: 12, color: '#A9C4B5', textAlign: 'center', borderTop: '1px dashed #2A5248', paddingTop: 8 }}>
        💡 Đom đóm thắp sáng: {encouragement}
      </div>
    </div>
  )
}

export function GardenStartAction({ onStart }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <button
        data-testid="start-photo"
        className="btn"
        style={{
          background: '#FFD166',
          color: '#0F2A24',
          padding: '16px 20px',
          fontSize: 17,
          fontWeight: 800,
          borderRadius: 999,
          boxShadow: '0 0 34px -8px rgba(255,209,102,0.8)',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
        }}
        onClick={() => onStart?.('photo')}
      >
        <span style={{ fontSize: 22 }}>🏮</span>
        <span>THẮP ĐÈN LỒNG BẮT ĐẦU HỌC</span>
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <button
          data-testid="start-type"
          className="btn ghost"
          style={{ padding: '12px', fontSize: 13, fontWeight: 700, borderColor: '#2A5248', color: '#F2F7EE' }}
          onClick={() => onStart?.('type')}
        >
          <InputModeIcon mode="type" size={18} /> Gõ đề bài
        </button>
        <button
          data-testid="start-voice"
          className="btn ghost"
          style={{ padding: '12px', fontSize: 13, fontWeight: 700, borderColor: '#2A5248', color: '#F2F7EE' }}
          onClick={() => onStart?.('voice')}
        >
          <InputModeIcon mode="voice" size={18} /> Đọc đề
        </button>
      </div>
    </div>
  )
}

/* ============================================================
   4. BẢNG PHẤN (CHALK)
   ============================================================ */
export function ChalkStudyTracker({ tracker, onOpenReport }) {
  if (!tracker) return null
  const { week, weekCount, weekGoal, streak, encouragement } = tracker

  return (
    <div
      className="card chalk-tracker"
      style={{
        padding: '16px',
        background: 'rgba(246, 241, 230, 0.07)',
        border: '2px solid rgba(246, 241, 230, 0.75)',
        borderRadius: '18px 6px 16px 8px',
        cursor: onOpenReport ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        color: '#F6F1E6',
        fontFamily: "'Coiny', cursive, sans-serif",
      }}
      onClick={onOpenReport}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 18 }}>🖍️</span>
          <span style={{ fontSize: 15, color: '#F9E07F' }}>Đếm que phấn tuần này</span>
        </div>
        <span style={{ fontSize: 14, color: '#B5E8A8' }}>
          {weekCount}/{weekGoal} que
        </span>
      </div>

      {/* Vòng phấn khoanh ngày đã học */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, textAlign: 'center' }}>
        {week.map((d) => {
          const isDone = d.status === 'done' || d.status === 'todayDone'
          const isToday = d.isToday
          return (
            <div key={d.dateKey} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50% 45% 55% 48%',
                  background: isDone ? '#B5E8A8' : 'transparent',
                  border: isDone
                    ? '2px solid #F6F1E6'
                    : isToday
                    ? '2px dashed #F9E07F'
                    : '1.5px solid rgba(246,241,230,0.3)',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 16,
                  color: isDone ? '#2F4A41' : '#F6F1E6',
                }}
              >
                {isDone ? '⭐' : d.dayNum}
              </div>
              <span style={{ fontSize: 11, color: '#CFC8B8' }}>{d.label}</span>
            </div>
          )
        })}
      </div>

      <div style={{ fontSize: 12, color: '#CFC8B8', textAlign: 'center', borderTop: '1px dashed rgba(246,241,230,0.35)', paddingTop: 8 }}>
        Gờ phấn nhắn: {encouragement}
      </div>
    </div>
  )
}

/* ============================================================
   5. BENTO MỀM (BENTO)
   ============================================================ */
export function BentoStudyTracker({ tracker, onOpenReport }) {
  if (!tracker) return null
  const { week, weekCount, weekGoal, streak, encouragement } = tracker

  return (
    <div
      className="card bento-tracker"
      style={{
        padding: '16px 18px',
        background: '#FFFFFF',
        border: '1px solid #E9EAF1',
        borderRadius: 22,
        boxShadow: '0 10px 24px -20px rgba(21, 22, 30, 0.4)',
        cursor: onOpenReport ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
      onClick={onOpenReport}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#EEEBFF',
              color: '#2E2A5E',
              display: 'grid',
              placeItems: 'center',
              fontSize: 13,
              fontWeight: 800,
            }}
          >
            {weekCount}/{weekGoal}
          </div>
          <div>
            <b style={{ fontSize: 14, color: '#1E1B3A', display: 'block' }}>Mục tiêu tuần</b>
            <span style={{ fontSize: 11.5, color: '#6B6E80' }}>Bento học đều đặn</span>
          </div>
        </div>
        {streak >= 2 && (
          <span style={{ fontSize: 11.5, fontWeight: 800, color: '#BD4F40', background: '#FFF1EE', padding: '3px 8px', borderRadius: 999 }}>
            🔥 {streak} ngày liền
          </span>
        )}
      </div>

      {/* 7 cột dạng widget Apple */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, textAlign: 'center' }}>
        {week.map((d) => {
          const isDone = d.status === 'done' || d.status === 'todayDone'
          const isToday = d.isToday
          return (
            <div key={d.dateKey} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              <div
                style={{
                  width: '100%',
                  height: 38,
                  borderRadius: 10,
                  background: isDone ? '#22B07D' : isToday ? '#EEEBFF' : '#F7F7FA',
                  border: isToday ? '1.5px dashed #8A7CFF' : '1px solid #E9EAF1',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 14,
                  fontWeight: 800,
                  color: isDone ? '#FFFFFF' : '#1E1B3A',
                }}
              >
                {isDone ? '✓' : d.dayNum}
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#6B6E80' }}>{d.label}</span>
            </div>
          )
        })}
      </div>

      <div style={{ fontSize: 12, color: '#6B6E80', textAlign: 'center', borderTop: '1px solid #E9EAF1', paddingTop: 8 }}>
        {encouragement}
      </div>
    </div>
  )
}

/* ============================================================
   6. CỰC QUANG (AURORA)
   ============================================================ */
export function AuroraStudyTracker({ tracker, onOpenReport }) {
  if (!tracker) return null
  const { week, weekCount, weekGoal, streak, encouragement } = tracker

  return (
    <div
      className="card aurora-tracker"
      style={{
        padding: '16px',
        background: 'rgba(255, 255, 255, 0.08)',
        border: '1px solid rgba(255, 255, 255, 0.16)',
        borderRadius: 24,
        backdropFilter: 'blur(18px)',
        boxShadow: '0 20px 50px -30px rgba(0,0,0,0.8)',
        cursor: onOpenReport ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        color: '#F3F4FF',
      }}
      onClick={onOpenReport}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 18 }}>🌌</span>
          <b style={{ fontSize: 14, color: '#F3F4FF' }}>Chòm sao học tối</b>
          {streak >= 2 && (
            <span style={{ fontSize: 11, fontWeight: 800, color: '#0B1026', background: '#22D3EE', padding: '2px 8px', borderRadius: 999 }}>
              🔥 {streak} tối
            </span>
          )}
        </div>
        <span style={{ fontSize: 13, fontWeight: 800, color: '#22D3EE' }}>
          {weekCount}/{weekGoal} sao
        </span>
      </div>

      {/* 7 Chấm phát sáng Cực quang */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, textAlign: 'center' }}>
        {week.map((d) => {
          const isDone = d.status === 'done' || d.status === 'todayDone'
          const isToday = d.isToday
          return (
            <div key={d.dateKey} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: isDone
                    ? 'linear-gradient(135deg, #22D3EE, #A78BFA)'
                    : isToday
                    ? 'rgba(167, 139, 250, 0.2)'
                    : 'rgba(255, 255, 255, 0.06)',
                  border: isToday ? '1.5px solid #22D3EE' : '1px solid rgba(255, 255, 255, 0.14)',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 14,
                  fontWeight: 800,
                  color: isDone ? '#0B1026' : '#F3F4FF',
                  boxShadow: isDone ? '0 0 16px -4px #22D3EE' : 'none',
                }}
              >
                {isDone ? '✓' : d.dayNum}
              </div>
              <span style={{ fontSize: 11, color: '#B2B5C3' }}>{d.label}</span>
            </div>
          )
        })}
      </div>

      <div style={{ fontSize: 12, color: '#B2B5C3', textAlign: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: 8 }}>
        ✨ Ánh sáng dẫn đường: {encouragement}
      </div>
    </div>
  )
}

export function AuroraStartAction({ onStart }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Vòng tròn xoay màu cực quang (Orb) từ 8-bo-giao-dien-rieng.html */}
      <div style={{ display: 'grid', placeItems: 'center', padding: '10px 0' }}>
        <button
          data-testid="start-photo"
          onClick={() => onStart?.('snap')}
          style={{
            width: 196,
            height: 196,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            position: 'relative',
            background: 'conic-gradient(from 200deg, #22D3EE, #A78BFA, #F472B6, #34D399, #22D3EE)',
            cursor: 'pointer',
            border: 'none',
            boxShadow: '0 0 40px rgba(34, 211, 238, 0.55)',
            animation: 'spinOrb 12s linear infinite',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 6,
              borderRadius: '50%',
              background: '#0B1026',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <b
              style={{
                fontFamily: "'Unbounded', sans-serif",
                fontSize: 20,
                textAlign: 'center',
                lineHeight: 1.2,
                color: '#F3F4FF',
                animation: 'unspinOrb 12s linear infinite',
              }}
            >
              Bắt đầu<br />
              <small style={{ display: 'block', fontSize: 10, letterSpacing: 2, color: '#22D3EE', marginTop: 4, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                BÀI TỐI NAY
              </small>
            </b>
          </div>
        </button>
      </div>

      {/* 3 Phương thức vào bài chuẩn Glassmorphism */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        <button
          className="mode-btn"
          style={{
            textAlign: 'center',
            padding: '12px 6px',
            borderRadius: 18,
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            color: '#F3F4FF',
            cursor: 'pointer',
            backdropFilter: 'blur(12px)',
          }}
          onClick={() => onStart?.('snap')}
        >
          <span style={{ fontSize: 22, display: 'block', marginBottom: 4 }}>📷</span>
          <b style={{ fontSize: 12.5, display: 'block' }}>Chụp vở</b>
        </button>
        <button
          className="mode-btn"
          style={{
            textAlign: 'center',
            padding: '12px 6px',
            borderRadius: 18,
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            color: '#F3F4FF',
            cursor: 'pointer',
            backdropFilter: 'blur(12px)',
          }}
          onClick={() => onStart?.('prep')}
        >
          <span style={{ fontSize: 22, display: 'block', marginBottom: 4 }}>⌨️</span>
          <b style={{ fontSize: 12.5, display: 'block' }}>Gõ đề</b>
        </button>
        <button
          className="mode-btn"
          style={{
            textAlign: 'center',
            padding: '12px 6px',
            borderRadius: 18,
            background: 'rgba(34, 211, 238, 0.14)',
            border: '1.5px solid #22D3EE',
            color: '#22D3EE',
            cursor: 'pointer',
            boxShadow: '0 0 16px -4px #22D3EE',
            backdropFilter: 'blur(12px)',
          }}
          onClick={() => onStart?.('voice')}
        >
          <span style={{ fontSize: 22, display: 'block', marginBottom: 4 }}>🎙️</span>
          <b style={{ fontSize: 12.5, display: 'block' }}>Đọc đề</b>
        </button>
      </div>
    </div>
  )
}

/* ============================================================
   7. STICKER STUDIO (STICKER)
   ============================================================ */
export function StickerStudyTracker({ tracker, onOpenReport }) {
  if (!tracker) return null
  const { week, weekCount, weekGoal, streak, encouragement } = tracker

  return (
    <div
      className="card sticker-tracker"
      style={{
        padding: '16px',
        background: '#FFFFFF',
        border: '3px solid #1B1B2F',
        borderRadius: 20,
        boxShadow: '5px 5px 0 #1B1B2F',
        cursor: onOpenReport ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        color: '#1B1B2F',
      }}
      onClick={onOpenReport}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 18 }}>🎟️</span>
          <b style={{ fontSize: 14, fontFamily: "'Paytone One', sans-serif" }}>Phiếu bấm lỗ 7 tối</b>
          {streak >= 2 && (
            <span style={{ fontSize: 11, fontWeight: 900, color: '#1B1B2F', background: '#FFC928', border: '2px solid #1B1B2F', padding: '1px 8px', borderRadius: 999, transform: 'rotate(-3deg)' }}>
              🔥 {streak} tối
            </span>
          )}
        </div>
        <span style={{ fontSize: 13, fontWeight: 900, color: '#FF4F8B' }}>
          {weekCount}/{weekGoal} lỗ
        </span>
      </div>

      {/* 7 Ô bấm lỗ phong cách Comic Sticker */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, textAlign: 'center' }}>
        {week.map((d) => {
          const isDone = d.status === 'done' || d.status === 'todayDone'
          const isToday = d.isToday
          return (
            <div key={d.dateKey} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: isDone ? '#FFC928' : isToday ? '#FFE599' : '#FFFFFF',
                  border: isDone ? '2.5px solid #1B1B2F' : isToday ? '2.5px solid #FF4F8B' : '2.5px dashed #1B1B2F',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 15,
                  fontWeight: 900,
                  boxShadow: isDone ? '2px 2px 0 #1B1B2F' : 'none',
                  transform: isDone ? 'rotate(-6deg)' : 'none',
                }}
              >
                {isDone ? '★' : d.dayNum}
              </div>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#1B1B2F' }}>{d.label}</span>
            </div>
          )
        })}
      </div>

      <div style={{ fontSize: 12, fontWeight: 700, color: '#5C5A70', textAlign: 'center', borderTop: '2px dashed #1B1B2F', paddingTop: 8 }}>
        ⚡ Lời khen dán sticker: {encouragement}
      </div>
    </div>
  )
}

export function StickerStartAction({ onStart }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <button
        data-testid="start-photo"
        onClick={() => onStart?.('snap')}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          fontFamily: "'Paytone One', sans-serif",
          fontSize: 22,
          color: '#FFFFFF',
          background: '#FF4F8B',
          border: '3px solid #1B1B2F',
          borderRadius: 22,
          padding: '18px',
          boxShadow: '0 6px 0 #1B1B2F',
          cursor: 'pointer',
        }}
      >
        <span>📷 BẮT ĐẦU CHỤP BÀI</span>
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        <button
          style={{
            background: '#FFFFFF',
            border: '3px solid #1B1B2F',
            borderRadius: 18,
            textAlign: 'center',
            padding: '12px 6px',
            fontWeight: 900,
            fontSize: 13,
            boxShadow: '4px 4px 0 #1B1B2F',
            cursor: 'pointer',
          }}
          onClick={() => onStart?.('snap')}
        >
          <span style={{ fontSize: 24, display: 'block', marginBottom: 2 }}>📸</span>
          Chụp vở
        </button>
        <button
          style={{
            background: '#FFFFFF',
            border: '3px solid #1B1B2F',
            borderRadius: 18,
            textAlign: 'center',
            padding: '12px 6px',
            fontWeight: 900,
            fontSize: 13,
            boxShadow: '4px 4px 0 #1B1B2F',
            cursor: 'pointer',
          }}
          onClick={() => onStart?.('prep')}
        >
          <span style={{ fontSize: 24, display: 'block', marginBottom: 2 }}>⌨️</span>
          Gõ đề
        </button>
        <button
          style={{
            background: '#39C6A5',
            color: '#1B1B2F',
            border: '3px solid #1B1B2F',
            borderRadius: 18,
            textAlign: 'center',
            padding: '12px 6px',
            fontWeight: 900,
            fontSize: 13,
            boxShadow: '4px 4px 0 #1B1B2F',
            cursor: 'pointer',
          }}
          onClick={() => onStart?.('voice')}
        >
          <span style={{ fontSize: 24, display: 'block', marginBottom: 2 }}>🎙️</span>
          Đọc đề
        </button>
      </div>
    </div>
  )
}

/* ============================================================
   8. SỔ TAY BUỔI TỐI (NOTEBOOK)
   ============================================================ */
export function NotebookStudyTracker({ tracker, onOpenReport }) {
  if (!tracker) return null
  const { week, weekCount, weekGoal, streak, encouragement } = tracker

  return (
    <div
      className="card notebook-tracker"
      style={{
        padding: '16px',
        background: '#FFFFFF',
        border: '1px solid #D9D0BE',
        borderRadius: 3,
        boxShadow: '0 14px 30px -22px rgba(42, 38, 34, 0.5)',
        cursor: onOpenReport ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        color: '#2A2622',
        position: 'relative',
      }}
      onClick={onOpenReport}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', borderBottom: '1.5px solid #2A2622', paddingBottom: 6 }}>
        <b style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 17, color: '#2A2622' }}>
          Nhật ký tuần này
        </b>
        <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, fontWeight: 800, color: '#AE532F', letterSpacing: 1 }}>
          {weekCount}/{weekGoal} TỐI {streak >= 2 ? `· 🔥 ${streak} TỐI` : ''}
        </span>
      </div>

      {/* Dòng kẻ sổ tay 7 ngày */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderTop: '1px solid #2A2622', borderBottom: '1px solid #2A2622' }}>
        {week.map((d) => {
          const isDone = d.status === 'done' || d.status === 'todayDone'
          const isToday = d.isToday
          return (
            <div
              key={d.dateKey}
              style={{
                textAlign: 'center',
                padding: '6px 0',
                borderRight: '1px dashed #D9D0BE',
                fontSize: 11,
                fontWeight: 800,
                color: isToday ? '#AE532F' : '#6B6354',
              }}
            >
              <span style={{ display: 'block', fontSize: 10 }}>{d.label}</span>
              <span style={{ fontFamily: "'Mali', cursive", fontSize: 17, color: '#AE532F', display: 'block', height: 24, lineHeight: '24px' }}>
                {isDone ? '✓' : isToday ? '○' : '·'}
              </span>
            </div>
          )
        })}
      </div>

      <div style={{ fontFamily: "'Mali', cursive", fontSize: 13, color: '#5C554B', textAlign: 'center', paddingTop: 4 }}>
        ✍️ Lời ghi nhớ: {encouragement}
      </div>
    </div>
  )
}

export function NotebookStartAction({ onStart }) {
  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #D9D0BE',
        borderRadius: 3,
        padding: '18px 16px',
        position: 'relative',
        boxShadow: '0 14px 30px -22px rgba(42, 38, 34, 0.5)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <h4 style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 20, margin: 0 }}>
          Học tối nay
        </h4>
        <span style={{ fontFamily: "'Mali', cursive", fontSize: 13, color: '#AE532F' }}>
          Đã sẵn sàng
        </span>
      </div>

      <button
        data-testid="start-photo"
        onClick={() => onStart?.('snap')}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 8,
          padding: '14px',
          background: '#2A2622',
          color: '#F6F1E7',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 800,
          fontSize: 15,
          borderRadius: 4,
          border: 'none',
          cursor: 'pointer',
          marginBottom: 10,
        }}
      >
        📷 Mở máy chụp trang vở
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <button
          style={{
            padding: '10px',
            background: 'transparent',
            color: '#2A2622',
            border: '1.5px solid #2A2622',
            borderRadius: 4,
            fontWeight: 800,
            fontSize: 13,
            cursor: 'pointer',
          }}
          onClick={() => onStart?.('prep')}
        >
          ⌨️ Gõ tay đề bài
        </button>
        <button
          style={{
            padding: '10px',
            background: 'transparent',
            color: '#AE532F',
            border: '1.5px solid #AE532F',
            borderRadius: 4,
            fontWeight: 800,
            fontSize: 13,
            cursor: 'pointer',
          }}
          onClick={() => onStart?.('voice')}
        >
          🎙️ Đọc to đề bài
        </button>
      </div>
    </div>
  )
}

/* ============================================================
   BENTO, CHALK, CANDY START ACTIONS
   ============================================================ */
export function BentoStartAction({ onStart }) {
  return (
    <div
      style={{
        borderRadius: 24,
        background: 'linear-gradient(135deg, #FF6B57, #FF8A7A 45%, #8A7CFF)',
        color: '#FFFFFF',
        padding: '18px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'relative', zIndex: 1 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', opacity: 0.85 }}>
          BẮT ĐẦU BUỔI HỌC
        </span>
        <h4 style={{ fontFamily: "'Lexend', sans-serif", fontSize: 22, margin: '4px 0 8px 0' }}>
          Tối nay con học gì?
        </h4>
        <p style={{ fontSize: 13, opacity: 0.95, margin: '0 0 14px 0' }}>
          Chụp đề hoặc đọc to, AI hỗ trợ bố mẹ hỏi gợi mở từng bước.
        </p>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            data-testid="start-photo"
            onClick={() => onStart?.('snap')}
            style={{
              flex: 1,
              padding: '10px 6px',
              borderRadius: 16,
              background: '#FFFFFF',
              color: '#1E1B3A',
              fontWeight: 800,
              fontSize: 12.5,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            📷 Chụp vở
          </button>
          <button
            onClick={() => onStart?.('prep')}
            style={{
              flex: 1,
              padding: '10px 6px',
              borderRadius: 16,
              background: 'rgba(255, 255, 255, 0.28)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: 12.5,
              cursor: 'pointer',
            }}
          >
            ⌨️ Gõ đề
          </button>
          <button
            onClick={() => onStart?.('voice')}
            style={{
              flex: 1,
              padding: '10px 6px',
              borderRadius: 16,
              background: 'rgba(255, 255, 255, 0.28)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: 12.5,
              cursor: 'pointer',
            }}
          >
            🎙️ Đọc đề
          </button>
        </div>
      </div>
    </div>
  )
}

export function ChalkStartAction({ onStart }) {
  return (
    <div
      style={{
        border: '2px solid rgba(246, 241, 230, 0.75)',
        borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
        padding: '16px',
        background: 'rgba(246, 241, 230, 0.07)',
        textAlign: 'center',
      }}
    >
      <b style={{ fontFamily: "'Coiny', cursive", fontSize: 20, color: '#F9E07F', display: 'block', marginBottom: 10 }}>
        BẢNG HỌC TỐI NAY
      </b>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        <button
          data-testid="start-photo"
          onClick={() => onStart?.('snap')}
          style={{
            flex: 1,
            padding: '10px',
            border: '2.5px solid #F9E07F',
            borderRadius: '15px 225px 15px 255px / 255px 15px 225px 15px',
            background: 'transparent',
            color: '#F9E07F',
            fontFamily: "'Coiny', cursive",
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          📷 Chụp đề
        </button>
        <button
          onClick={() => onStart?.('prep')}
          style={{
            flex: 1,
            padding: '10px',
            border: '2px solid rgba(246, 241, 230, 0.7)',
            borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
            background: 'transparent',
            color: '#F6F1E6',
            fontFamily: "'Coiny', cursive",
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          ⌨️ Gõ đề
        </button>
        <button
          onClick={() => onStart?.('voice')}
          style={{
            flex: 1,
            padding: '10px',
            border: '2px solid #B5E8A8',
            borderRadius: '15px 225px 15px 255px / 255px 15px 225px 15px',
            background: 'transparent',
            color: '#B5E8A8',
            fontFamily: "'Coiny', cursive",
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          🎙️ Đọc đề
        </button>
      </div>
    </div>
  )
}

export function CandyStartAction({ onStart }) {
  return (
    <div
      style={{
        background: 'linear-gradient(#FFA3C6, #FF7FAE)',
        color: '#FFFFFF',
        borderRadius: 30,
        padding: '16px 18px',
        boxShadow: '0 7px 0 #E0598E',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
      }}
    >
      <div
        style={{
          fontFamily: "'Baloo 2', cursive",
          fontSize: 22,
          background: '#FFFFFF',
          color: '#4A3B5C',
          borderRadius: '50%',
          width: 52,
          height: 52,
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
        }}
      >
        (◕‿◕)
      </div>
      <div style={{ flex: 1 }}>
        <h4 style={{ fontFamily: "'Baloo 2', cursive", fontSize: 20, margin: 0, lineHeight: 1.1 }}>
          Kẹo học tối nay!
        </h4>
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          <button
            data-testid="start-photo"
            onClick={() => onStart?.('snap')}
            style={{
              padding: '6px 12px',
              borderRadius: 999,
              background: '#FFFFFF',
              color: '#4A2B45',
              fontFamily: "'Baloo 2', cursive",
              fontSize: 12.5,
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            📷 Chụp vở
          </button>
          <button
            onClick={() => onStart?.('prep')}
            style={{
              padding: '6px 10px',
              borderRadius: 999,
              background: 'rgba(255, 255, 255, 0.4)',
              color: '#FFFFFF',
              fontFamily: "'Baloo 2', cursive",
              fontSize: 12.5,
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            ⌨️ Gõ đề
          </button>
          <button
            onClick={() => onStart?.('voice')}
            style={{
              padding: '6px 10px',
              borderRadius: 999,
              background: 'rgba(255, 255, 255, 0.4)',
              color: '#FFFFFF',
              fontFamily: "'Baloo 2', cursive",
              fontSize: 12.5,
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            🎙️ Đọc đề
          </button>
        </div>
      </div>
    </div>
  )
}

