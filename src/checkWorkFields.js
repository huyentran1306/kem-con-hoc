/* Đợt 15 P0.B — dùng chung cho màn Chấm vở và bộ kiểm thử */
// Kết quả chấm đủ trường (prompt 14 mục 2.4) chưa — trả danh sách trường thiếu
export function missingCheckWorkFields(g) {
  const miss = []
  if (!g || typeof g !== 'object') return ['ket_qua']
  if (!['dung_het', 'co_buoc_sai', 'chua_xong', 'khong_ro'].includes(g.ket_qua)) miss.push('ket_qua')
  if (!String(g.giai_thich_cho_me || '').trim()) miss.push('giai_thich_cho_me')
  if (!String(g.loi_khen_cu_the || '').trim()) miss.push('loi_khen_cu_the')
  if (!g.cau_hoi_cho_con || !String(g.cau_hoi_cho_con.muc_1 || '').trim()) miss.push('cau_hoi_cho_con')
  if (g.ket_qua === 'co_buoc_sai') {
    const n = Number(g.dong_sai_dau_tien)
    if (!Number.isInteger(n) || n < 1) miss.push('dong_sai_dau_tien')
    if (!String(g.loai_loi || '').trim()) miss.push('loai_loi')
    if (g.gia_tri_dung_dong_sai == null || String(g.gia_tri_dung_dong_sai).trim() === '') miss.push('gia_tri_dung_dong_sai')
  }
  return miss
}

