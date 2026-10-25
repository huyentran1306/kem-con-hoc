/**
 * SVG QR Code Generator
 * Dùng bộ mã hoá chuẩn qrcode-generator (Kazuhiko Arase, MIT) — có đủ mã sửa lỗi
 * Reed-Solomon, chọn mask tối ưu và tự chọn phiên bản theo độ dài nội dung.
 * (Bản tự viết trước đây thiếu mã sửa lỗi nên điện thoại không quét được.)
 */
import qrcode from './vendor/qrcode-generator.mjs';

// Mã hoá UTF-8 để link/nội dung có dấu tiếng Việt vẫn đúng
qrcode.stringToBytes = (s) => {
  if (typeof TextEncoder !== 'undefined') return Array.from(new TextEncoder().encode(String(s)));
  const out = [];
  const str = unescape(encodeURIComponent(String(s)));
  for (let i = 0; i < str.length; i++) out.push(str.charCodeAt(i) & 0xff);
  return out;
};

export function createQrMatrix(text, ecl = 'M') {
  const qr = qrcode(0, ecl); // 0 = tự chọn phiên bản
  qr.addData(String(text || ''), 'Byte');
  qr.make();
  const n = qr.getModuleCount();
  const matrix = [];
  for (let r = 0; r < n; r++) {
    const row = [];
    for (let c = 0; c < n; c++) row.push(qr.isDark(r, c) ? 1 : 0);
    matrix.push(row);
  }
  return matrix;
}

export function generateQrSvgString(text, options = {}) {
  const size = options.size || 200;
  // Vùng trắng quanh mã: chuẩn QR cần tối thiểu 4 ô
  const margin = Math.max(4, options.margin !== undefined ? options.margin : 4);
  const fgColor = options.fgColor || '#2B1D12';
  const bgColor = options.bgColor || '#FFFFFF';

  const matrix = createQrMatrix(text, options.ecl || 'M');
  const n = matrix.length;
  const total = n + margin * 2;

  // Vẽ theo đơn vị ô rồi scale đúng kích thước, không lệch nét do làm tròn
  let paths = '';
  for (let r = 0; r < n; r++) {
    let c = 0;
    while (c < n) {
      if (matrix[r][c]) {
        let span = 1;
        while (c + span < n && matrix[r][c + span]) span++;
        paths += `M${c + margin},${r + margin}h${span}v1h-${span}z`;
        c += span;
      } else {
        c++;
      }
    }
  }

  const k = Number((size / total).toFixed(6));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" shape-rendering="crispEdges" role="img" aria-label="Mã QR">
    <rect width="${size}" height="${size}" fill="${bgColor}" />
    <path transform="scale(${k})" d="${paths}" fill="${fgColor}" />
  </svg>`;
}
