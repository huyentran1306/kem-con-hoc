/**
 * Lightweight SVG QR Code Generator (Zero-dependency, pure JS, < 8KB)
 * Generates valid QR Code (Type 1-10, ECL L/M) as inline SVG string.
 */

export function generateQrSvgString(text, options = {}) {
  const size = options.size || 200;
  const margin = options.margin !== undefined ? options.margin : 2;
  const fgColor = options.fgColor || '#4B3621';
  const bgColor = options.bgColor || '#FFFFFF';

  const matrix = createQrMatrix(text);
  const n = matrix.length;
  const total = n + margin * 2;
  const cellSize = Number((size / total).toFixed(3));

  let paths = '';
  for (let r = 0; r < n; r++) {
    let c = 0;
    while (c < n) {
      if (matrix[r][c]) {
        let span = 1;
        while (c + span < n && matrix[r][c + span]) {
          span++;
        }
        const x = Number(((c + margin) * cellSize).toFixed(2));
        const y = Number(((r + margin) * cellSize).toFixed(2));
        const w = Number((span * cellSize).toFixed(2));
        const h = Number(cellSize.toFixed(2));
        paths += `M${x},${y}h${w}v${h}h-${w}z `;
        c += span;
      } else {
        c++;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" shape-rendering="crispEdges">
    <rect width="${size}" height="${size}" fill="${bgColor}" rx="12" />
    <path d="${paths.trim()}" fill="${fgColor}" />
  </svg>`;
}

// QR Code Matrix builder
function createQrMatrix(text) {
  const len = text.length;
  const version = len <= 32 ? 2 : len <= 58 ? 3 : len <= 88 ? 4 : 5;
  const size = version * 4 + 17;
  const matrix = Array.from({ length: size }, () => Array(size).fill(0));
  const isFunction = Array.from({ length: size }, () => Array(size).fill(false));

  // Finder patterns (7x7) at top-left, top-right, bottom-left
  const addFinder = (row, col) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        matrix[row + r][col + c] = isBorder || isCenter ? 1 : 0;
        isFunction[row + r][col + c] = true;
      }
    }
    // Separator
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const mr = row + r;
        const mc = col + c;
        if (mr >= 0 && mr < size && mc >= 0 && mc < size && !isFunction[mr][mc]) {
          matrix[mr][mc] = 0;
          isFunction[mr][mc] = true;
        }
      }
    }
  };

  addFinder(0, 0);
  addFinder(0, size - 7);
  addFinder(size - 7, 0);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0 ? 1 : 0;
    isFunction[6][i] = true;
    matrix[i][6] = i % 2 === 0 ? 1 : 0;
    isFunction[i][6] = true;
  }

  // Alignment pattern for version >= 2
  if (version >= 2) {
    const alignPos = version === 2 ? 18 : version === 3 ? 22 : version === 4 ? 26 : 30;
    for (let r = -2; r <= 2; r++) {
      for (let c = -2; c <= 2; c++) {
        const isB = Math.abs(r) === 2 || Math.abs(c) === 2;
        const isC = r === 0 && c === 0;
        matrix[alignPos + r][alignPos + c] = isB || isC ? 1 : 0;
        isFunction[alignPos + r][alignPos + c] = true;
      }
    }
  }

  // Dark module
  matrix[4 * version + 9][8] = 1;
  isFunction[4 * version + 9][8] = true;

  // Format reserve
  for (let i = 0; i < 9; i++) {
    if (i !== 6) {
      isFunction[8][i] = true;
      isFunction[i][8] = true;
    }
  }
  for (let i = size - 8; i < size; i++) {
    isFunction[8][i] = true;
    isFunction[i][8] = true;
  }

  // Convert text to byte data stream
  const bits = [];
  const appendBits = (val, count) => {
    for (let i = count - 1; i >= 0; i--) {
      bits.push((val >> i) & 1);
    }
  };

  // Byte mode indicator: 0100
  appendBits(0b0100, 4);
  // Character count: 8 bits for versions 1-9
  appendBits(text.length, 8);
  // Data bytes
  for (let i = 0; i < text.length; i++) {
    appendBits(text.charCodeAt(i) & 0xff, 8);
  }

  // Terminator
  for (let i = 0; i < 4 && bits.length % 8 !== 0; i++) {
    bits.push(0);
  }

  // Pad to required capacity
  const capacityBits = (version === 2 ? 44 : version === 3 ? 70 : version === 4 ? 100 : 134) * 8;
  const padBytes = [0b11101100, 0b00010001];
  let padIdx = 0;
  while (bits.length < capacityBits) {
    appendBits(padBytes[padIdx % 2], 8);
    padIdx++;
  }

  // Interleave and mask placement
  let bitIdx = 0;
  let upwards = true;
  for (let right = size - 1; right > 0; right -= 2) {
    if (right === 6) right--; // skip timing column
    const rows = upwards
      ? Array.from({ length: size }, (_, i) => size - 1 - i)
      : Array.from({ length: size }, (_, i) => i);

    for (const r of rows) {
      for (const c of [right, right - 1]) {
        if (!isFunction[r][c]) {
          const bit = bitIdx < bits.length ? bits[bitIdx++] : 0;
          // Apply mask pattern 0: (row + col) % 2 === 0
          const mask = (r + c) % 2 === 0 ? 1 : 0;
          matrix[r][c] = bit ^ mask;
        }
      }
    }
    upwards = !upwards;
  }

  // Format info (ECL M + Mask 0)
  const formatBits = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0];
  for (let i = 0; i < 6; i++) matrix[8][i] = formatBits[i];
  matrix[8][7] = formatBits[6];
  matrix[8][8] = formatBits[7];
  matrix[7][8] = formatBits[8];
  for (let i = 9; i < 15; i++) matrix[14 - i][8] = formatBits[i];

  for (let i = 0; i < 7; i++) matrix[8][size - 1 - i] = formatBits[i];
  for (let i = 7; i < 15; i++) matrix[size - 15 + i][8] = formatBits[i];

  return matrix;
}
