/* ============================================================
   📷 IMAGE PIPELINE CHO OCR BÀI TẬP (chữ in + chữ viết tay)
   1. Cắt đúng vùng khung ngắm, giữ độ phân giải cao (chữ nhỏ không bị mất)
   2. Đo nhanh độ sáng / độ nét ngay trên máy → nhắc chụp lại trước khi gửi AI
   3. Làm phẳng nền (khử bóng tay, bóng đèn) + kéo giãn tương phản cho nét bút chì
   Toàn bộ chạy trên trình duyệt, không cần thư viện ngoài.
   ============================================================ */

export const OCR_MAX_DIM = 2000 // cạnh dài ảnh gửi AI
export const OCR_JPEG_QUALITY = 0.88
export const PREVIEW_MAX_DIM = 1600 // ảnh hiển thị / phóng to cho bố mẹ so đề
export const PREVIEW_JPEG_QUALITY = 0.82
export const ENHANCE_FOR_OCR = true // tắt để A/B test ảnh gốc vs ảnh đã xử lý

const makeCanvas = (w, h) => {
  const c = document.createElement('canvas')
  c.width = Math.max(1, Math.round(w))
  c.height = Math.max(1, Math.round(h))
  return c
}

function scaleToFit(w, h, maxDim) {
  const s = Math.min(1, maxDim / Math.max(w, h))
  return { w: Math.max(1, Math.round(w * s)), h: Math.max(1, Math.round(h * s)) }
}

export function resizeCanvas(src, maxDim) {
  const { w, h } = scaleToFit(src.width, src.height, maxDim)
  if (w === src.width && h === src.height) return src
  const c = makeCanvas(w, h)
  const ctx = c.getContext('2d')
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(src, 0, 0, w, h)
  return c
}

/* Vùng ảnh gốc (toạ độ video) ứng với khung nét đứt đang hiển thị.
   Video hiển thị kiểu objectFit: cover nên phải quy đổi tỉ lệ + phần bị cắt. */
export function getFrameCropRect(video, frameEl, pad = 0.06) {
  const vw = video.videoWidth
  const vh = video.videoHeight
  const full = { x: 0, y: 0, w: vw, h: vh }
  if (!frameEl || !vw || !vh) return full
  const vb = video.getBoundingClientRect()
  const fb = frameEl.getBoundingClientRect()
  if (!vb.width || !vb.height || !fb.width || !fb.height) return full

  const scale = Math.max(vb.width / vw, vb.height / vh)
  const offX = (vb.width - vw * scale) / 2
  const offY = (vb.height - vh * scale) / 2
  let x = (fb.left - vb.left - offX) / scale
  let y = (fb.top - vb.top - offY) / scale
  let w = fb.width / scale
  let h = fb.height / scale

  // Nới thêm viền để không cắt mất chữ nằm sát mép khung
  x -= w * pad
  y -= h * pad
  w *= 1 + 2 * pad
  h *= 1 + 2 * pad

  const x0 = Math.max(0, x)
  const y0 = Math.max(0, y)
  const x1 = Math.min(vw, x + w)
  const y1 = Math.min(vh, y + h)
  if (x1 - x0 < vw * 0.2 || y1 - y0 < vh * 0.2) return full
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }
}

export function captureVideoFrame(video, frameEl, maxDim = OCR_MAX_DIM) {
  const r = getFrameCropRect(video, frameEl)
  const { w, h } = scaleToFit(r.w, r.h, maxDim)
  const c = makeCanvas(w, h)
  const ctx = c.getContext('2d')
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(video, r.x, r.y, r.w, r.h, 0, 0, w, h)
  return c
}

/* Đọc file ảnh (thư viện hoặc camera gốc) → canvas, xoay đúng theo EXIF */
export async function fileToCanvas(file, maxDim = OCR_MAX_DIM) {
  let source = null
  try {
    if (typeof createImageBitmap === 'function') {
      source = await createImageBitmap(file, { imageOrientation: 'from-image' })
    }
  } catch (e) {
    source = null
  }
  if (!source) {
    source = await new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file)
      const img = new Image()
      img.onload = () => {
        URL.revokeObjectURL(url)
        resolve(img)
      }
      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('load failed'))
      }
      img.src = url
    })
  }
  const sw = source.width || source.naturalWidth
  const sh = source.height || source.naturalHeight
  const { w, h } = scaleToFit(sw, sh, maxDim)
  const c = makeCanvas(w, h)
  const ctx = c.getContext('2d')
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(source, 0, 0, w, h)
  if (typeof source.close === 'function') source.close()
  return c
}

/* Đo nhanh độ sáng & độ nét (Laplacian) trên bản thu nhỏ ~480px.
   Dùng phân vị 99.5% của |Laplacian| để trang ít chữ (nhiều nền trắng) không bị báo mờ oan. */
export function assessImageQuality(canvas) {
  try {
    const small = resizeCanvas(canvas, 480)
    const w = small.width
    const h = small.height
    const data = small.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, w, h).data
    const g = new Float32Array(w * h)
    let sum = 0
    for (let i = 0, p = 0; i < g.length; i++, p += 4) {
      const v = 0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2]
      g[i] = v
      sum += v
    }
    const brightness = sum / g.length

    const hist = new Uint32Array(256)
    let lsum = 0
    let lsq = 0
    let n = 0
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const i = y * w + x
        const lap = 4 * g[i] - g[i - 1] - g[i + 1] - g[i - w] - g[i + w]
        lsum += lap
        lsq += lap * lap
        n++
        hist[Math.min(255, Math.abs(lap) | 0)]++
      }
    }
    const mean = n ? lsum / n : 0
    const variance = n ? lsq / n - mean * mean : 0
    let edge = 0
    let acc = 0
    for (let i = 255; i >= 0; i--) {
      acc += hist[i]
      if (acc >= n * 0.002) {
        edge = i
        break
      }
    }
    return {
      brightness,
      sharpness: variance,
      edge,
      isDark: brightness < 70,
      isBlurry: edge < 20 && variance < 25,
    }
  } catch (e) {
    return { brightness: 128, sharpness: 999, edge: 255, isDark: false, isBlurry: false }
  }
}

/* Làm phẳng nền + kéo giãn tương phản (giữ màu để bút đỏ cô chấm vẫn phân biệt được) */
export function enhanceForOcr(src) {
  const w = src.width
  const h = src.height

  // 1. Ước lượng nền giấy: thu nhỏ mạnh rồi phóng to lại (= làm mờ rất rẻ)
  const tiny = makeCanvas(Math.max(4, w / 32), Math.max(4, h / 32))
  const tctx = tiny.getContext('2d')
  tctx.imageSmoothingEnabled = true
  tctx.imageSmoothingQuality = 'high'
  tctx.drawImage(src, 0, 0, tiny.width, tiny.height)
  // Lấy max lân cận (bỏ ảnh hưởng của nét chữ) rồi làm mịn → nền không bị "quầng" quanh dòng chữ
  try {
    const tw = tiny.width
    const th = tiny.height
    const tImg = tctx.getImageData(0, 0, tw, th)
    const td = tImg.data
    const lum = (i) => 0.299 * td[i] + 0.587 * td[i + 1] + 0.114 * td[i + 2]
    const dil = new Uint8ClampedArray(td.length)
    for (let y = 0; y < th; y++) {
      for (let x = 0; x < tw; x++) {
        let best = (y * tw + x) * 4
        let bestL = lum(best)
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            const yy = y + dy
            const xx = x + dx
            if (yy < 0 || yy >= th || xx < 0 || xx >= tw) continue
            const j = (yy * tw + xx) * 4
            const l = lum(j)
            if (l > bestL) {
              bestL = l
              best = j
            }
          }
        }
        const o = (y * tw + x) * 4
        dil[o] = td[best]
        dil[o + 1] = td[best + 1]
        dil[o + 2] = td[best + 2]
        dil[o + 3] = 255
      }
    }
    for (let y = 0; y < th; y++) {
      for (let x = 0; x < tw; x++) {
        let r = 0
        let g = 0
        let b = 0
        let n = 0
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const yy = y + dy
            const xx = x + dx
            if (yy < 0 || yy >= th || xx < 0 || xx >= tw) continue
            const j = (yy * tw + xx) * 4
            r += dil[j]
            g += dil[j + 1]
            b += dil[j + 2]
            n++
          }
        }
        const o = (y * tw + x) * 4
        td[o] = r / n
        td[o + 1] = g / n
        td[o + 2] = b / n
        td[o + 3] = 255
      }
    }
    tctx.putImageData(tImg, 0, 0)
  } catch (e) {}

  const bg = makeCanvas(w, h)
  const bctx = bg.getContext('2d', { willReadFrequently: true })
  bctx.imageSmoothingEnabled = true
  bctx.imageSmoothingQuality = 'high'
  bctx.drawImage(tiny, 0, 0, w, h)
  const bgd = bctx.getImageData(0, 0, w, h).data

  const out = makeCanvas(w, h)
  const octx = out.getContext('2d', { willReadFrequently: true })
  octx.drawImage(src, 0, 0)
  const img = octx.getImageData(0, 0, w, h)
  const d = img.data

  // 2. Chia cho nền → vùng bị bóng tay/bóng đèn sáng lên như giấy trắng
  const hist = new Uint32Array(256)
  for (let p = 0; p < d.length; p += 4) {
    const bl = 0.299 * bgd[p] + 0.587 * bgd[p + 1] + 0.114 * bgd[p + 2]
    const gain = Math.min(2.2, Math.max(1, 235 / Math.max(bl, 1)))
    const r = Math.min(255, d[p] * gain)
    const gg = Math.min(255, d[p + 1] * gain)
    const b = Math.min(255, d[p + 2] * gain)
    d[p] = r
    d[p + 1] = gg
    d[p + 2] = b
    hist[(0.299 * r + 0.587 * gg + 0.114 * b) | 0]++
  }

  // 3. Kéo giãn tương phản theo phân vị 1%–99% (giới hạn để không làm nổi dòng kẻ ô ly)
  const total = w * h
  let lo = 0
  let hi = 255
  let acc = 0
  for (let i = 0; i < 256; i++) {
    acc += hist[i]
    if (acc >= total * 0.01) {
      lo = i
      break
    }
  }
  acc = 0
  for (let i = 255; i >= 0; i--) {
    acc += hist[i]
    if (acc >= total * 0.01) {
      hi = i
      break
    }
  }
  lo = Math.min(lo, 90)
  hi = Math.max(hi, 200)
  if (hi - lo > 40) {
    const lut = new Uint8ClampedArray(256)
    for (let i = 0; i < 256; i++) lut[i] = ((i - lo) * 255) / (hi - lo)
    for (let p = 0; p < d.length; p += 4) {
      d[p] = lut[d[p]]
      d[p + 1] = lut[d[p + 1]]
      d[p + 2] = lut[d[p + 2]]
    }
  }
  octx.putImageData(img, 0, 0)
  return out
}

export function canvasToJpeg(canvas, quality = OCR_JPEG_QUALITY) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('toBlob failed'))), 'image/jpeg', quality)
  })
}

/* Chuẩn bị ảnh bài tập: { blob gửi AI, dataUrl để hiển thị/phóng to, quality } */
export async function prepareHomeworkShot(canvas) {
  const quality = assessImageQuality(canvas)
  let ocrCanvas = canvas
  if (ENHANCE_FOR_OCR) {
    try {
      ocrCanvas = enhanceForOcr(canvas)
    } catch (e) {
      ocrCanvas = canvas
    }
  }
  const blob = await canvasToJpeg(ocrCanvas, OCR_JPEG_QUALITY)
  const preview = resizeCanvas(ocrCanvas, PREVIEW_MAX_DIM)
  const dataUrl = preview.toDataURL('image/jpeg', PREVIEW_JPEG_QUALITY)
  return { blob, dataUrl, quality }
}
