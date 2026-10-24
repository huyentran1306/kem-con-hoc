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
