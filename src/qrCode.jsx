/**
 * Lightweight SVG QR Code Generator React wrapper
 * Imports pure JS generator from ./qrCode.js and exposes React component QrCodeModal
 */

import React from 'react';
import { generateQrSvgString } from './qrCode.js';

export { generateQrSvgString };

export function QrCodeModal({ url, title, sub, onClose }) {
  const svgMarkup = generateQrSvgString(url, { size: 240, margin: 2, fgColor: '#4B3621' });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(75, 54, 33, 0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 24,
          padding: 24,
          maxWidth: 380,
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(75, 54, 33, 0.25)',
          border: '2px solid #F0DDC2',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: 32, marginBottom: 4 }}>🏫</div>
        <h3 style={{ fontFamily: 'Mitr, sans-serif', fontSize: 20, color: '#4B3621', margin: '0 0 6px 0' }}>
          {title || 'Mã QR Vào Lớp'}
        </h3>
        <p style={{ fontSize: 13, color: '#8A6A4A', margin: '0 0 16px 0' }}>
          {sub || 'In hoặc chiếu mã QR trong buổi họp để phụ huynh quét vào lớp'}
        </p>

        <div
          style={{
            backgroundColor: '#FFF8EC',
            padding: 16,
            borderRadius: 18,
            display: 'inline-block',
            border: '1px solid #F0DDC2',
            marginBottom: 16,
          }}
          dangerouslySetInnerHTML={{ __html: svgMarkup }}
        />

        <div
          style={{
            backgroundColor: '#FFF1D6',
            color: '#9A5B00',
            fontSize: 12,
            padding: '8px 12px',
            borderRadius: 12,
            wordBreak: 'break-all',
            marginBottom: 16,
            fontFamily: 'monospace',
          }}
        >
          {url}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(url);
              alert('Đã sao chép liên kết vào lớp!');
            }}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: 999,
              background: '#FFF1D6',
              color: '#9A5B00',
              border: 'none',
              fontWeight: 800,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            ⧉ Sao chép link
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: 999,
              background: '#F6A623',
              color: '#4B3621',
              border: 'none',
              fontWeight: 800,
              fontSize: 13,
              cursor: 'pointer',
              boxShadow: '0 3px 0 #C47F0E',
            }}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
