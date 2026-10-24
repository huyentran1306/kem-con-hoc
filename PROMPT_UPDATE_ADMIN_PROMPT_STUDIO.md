# Yêu cầu cập nhật & sửa lỗi trang Admin (Prompt Studio) cho app Kèm Con Học

Bạn là kỹ sư frontend React. Hãy cập nhật và sửa lỗi giao diện trang Admin (Prompt Studio) trong source code app **Kèm Con Học** (React + Vite) theo các yêu cầu chính xác bên dưới:

---

### VẤN ĐỀ CẦN SỬA
1. **Mất phần gợi ý biến:** Hiện tại ở tab **📝 Prompt Studio** trong trang `/admin`, không hiển thị phần gợi ý chèn biến (`🎯 Các biến có thể chèn vào vị trí con trỏ chuột`). Nguyên nhân do đối tượng `DEFAULT_PROMPTS` trong `src/promptStudio.js` bị thiếu mảng `variables` ở các prompt.
2. **Giao diện bị lệch & tràn ngang (Horizontal Overflow):** Cột soạn thảo bên phải không có ràng buộc `minmax(0, 1fr)` và thiếu `minWidth: 0, maxWidth: 100%`. Khi nội dung prompt dài hoặc trên màn hình laptop thông thường, cả trang web bị đẩy phình to sang phải làm các nút "Soạn thảo", "Xem nổi bật biến", "Bỏ thay đổi", "Về bản mặc định" bị cắt cụt ngoài màn hình.
3. **Mã nguồn bị lặp (Duplicate JSX):** File `src/PromptStudioTab.jsx` bị dính các đoạn code trùng lặp (lặp lại cụm nút điều khiển header và lặp lại khối Test inputs ở cuối card Test Bench).

---

### HƯỚNG DẪN SỬA CHI TIẾT

#### 1. Cập nhật `src/promptStudio.js`
Thêm đầy đủ thuộc tính `variables` và chuẩn hóa `requiredVars` cho 8 prompts trong `DEFAULT_PROMPTS`:
- **`p1_ocr`**:
  - `name: '1. Đọc đề từ ảnh'`
  - `variables: []`
  - `requiredVars: []`
- **`p2_clean`**:
  - `name: '2. Làm sạch đề sau OCR (dự phòng)'`
  - `variables: []`
  - `requiredVars: []`
- **`p3_explain`**:
  - `name: '3. Soạn bài giảng gợi mở (Scaffold Socratic)'`
  - `desc: 'Định tuyến phương pháp sư phạm, gợi ý 4 bậc, mức 1 vật thật, mức 2 hình vẽ, bài anh em & trò chơi 5p'`
  - `variables: ['{{mon}}', '{{lop}}', '{{sach}}', '{{dang_bai}}', '{{loi_hay_gap}}', '{{de_bai}}', '{{doan_phuong_phap}}', '{{khung_ghi_chu}}']`
  - `requiredVars: ['{{de_bai}}']`
- **`p3b_parent_note_explain`**:
  - `name: '3b. Khung ghi chú phụ huynh (soạn bài)'`
  - `desc: 'Mẹ có ghi chú ("Soạn lại theo ý mẹ" hoặc mục Con tôi)'`
  - `variables: ['{{ghi_chu}}']`
  - `requiredVars: ['{{ghi_chu}}']`
- **`p4_chat`**:
  - `name: '4. Hỏi thêm AI'`
  - `desc: 'Mẹ chat hỏi AI về bài đang học'`
  - `variables: ['{{lop}}', '{{sach}}', '{{de_bai}}', '{{khung_ghi_chu}}']`
  - `requiredVars: ['{{de_bai}}', '{{khung_ghi_chu}}']`
- **`p4b_parent_note_chat`**:
  - `name: '4b. Khung ghi chú phụ huynh (chat)'`
  - `desc: 'Như 3b nhưng cho màn chat'`
  - `variables: ['{{ghi_chu}}']`
  - `requiredVars: ['{{ghi_chu}}']`
- **`p5_toy`**:
  - `name: '5. Nhận diện đồ vật'`
  - `desc: 'Trò chơi: chụp đồ vật con cầm, AI đoán tên'`
  - `variables: []`
  - `requiredVars: []`
- **`p6_practice`**:
  - `name: '6. Bài luyện thêm cùng dạng'`
  - `desc: 'Nút "Luyện thêm": AI ra 1 bài cùng dạng, số khác'`
  - `variables: ['{{lop}}', '{{sach}}', '{{de_bai}}']`
  - `requiredVars: ['{{de_bai}}']`
- **`p7_longitudinal_analysis`**:
  - `name: '7. Phân tích Dữ liệu lớn Sticker & Biến động phẩm chất'`
  - `desc: 'Phân tích longitudinal trait history (Kiên nhẫn, Sáng tạo,...), phát hiện bài học nhàm chán/quá khó và đề xuất lộ trình cân bằng'`
  - `variables: ['{{ten_be}}', '{{lop}}', '{{thong_ke_tuan_nay}}', '{{thong_ke_tuan_truoc}}', '{{mon_hoc_va_vuong_mac}}', '{{so_ca_hoc}}']`
  - `requiredVars: ['{{ten_be}}', '{{thong_ke_tuan_nay}}', '{{thong_ke_tuan_truoc}}']`

Trong hàm `renderPrompt(promptId, params = {})`:
Đảm bảo map thay thế biến template `{{...}}` chuẩn xác với các key: `mon`, `lop`, `sach`, `bo_sach`, `dang_bai`, `loi_hay_gap`, `doan_phuong_phap`, `giong`, `mo_ta_giong`, `de_bai`, `khung_ghi_chu`, `ghi_chu`, `ten_be`, `thong_ke_tuan_nay`, `thong_ke_tuan_truoc`, `mon_hoc_va_vuong_mac`, `so_ca_hoc`.

---

#### 2. Cập nhật `src/admin.css`
1. Đảm bảo `.admin-container` có `width: 100%` và `box-sizing: border-box`:
   ```css
   .admin-container {
     max-width: 1360px;
     width: 100%;
     margin: 0 auto;
     padding: 26px 32px 70px;
     position: relative;
     z-index: 1;
     box-sizing: border-box;
   }
   ```
2. Thêm các class responsive cho Prompt Studio:
   ```css
   /* PROMPT STUDIO RESPONSIVE LAYOUT */
   .prompt-studio-root {
     width: 100%;
     max-width: 100%;
     min-width: 0;
     box-sizing: border-box;
     display: flex;
     flex-direction: column;
     gap: 16px;
   }

   .prompt-studio-banner {
     width: 100%;
     max-width: 100%;
     box-sizing: border-box;
     background: linear-gradient(135deg, #1E1B4B 0%, #312E81 100%);
     padding: 16px 20px;
     border-radius: 16px;
     color: #fff;
     display: flex;
     align-items: center;
     justify-content: space-between;
     flex-wrap: wrap;
     gap: 12px;
   }

   .prompt-studio-dual-pane {
     display: grid;
     grid-template-columns: 260px minmax(0, 1fr);
     gap: 16px;
     min-height: 650px;
     width: 100%;
     max-width: 100%;
     min-width: 0;
     box-sizing: border-box;
   }

   .prompt-studio-sidebar {
     background: #fff;
     border-radius: 16px;
     border: 1px solid #E2E8F0;
     padding: 12px;
     display: flex;
     flex-direction: column;
     gap: 6px;
     box-shadow: 0 2px 8px rgba(0,0,0,0.04);
     min-width: 0;
     box-sizing: border-box;
   }

   .prompt-studio-main {
     display: flex;
     flex-direction: column;
     gap: 16px;
     min-width: 0;
     max-width: 100%;
     box-sizing: border-box;
   }

   .prompt-studio-card {
     background: #fff;
     border-radius: 16px;
     border: 1px solid #E2E8F0;
     padding: 18px;
     display: flex;
     flex-direction: column;
     gap: 12px;
     box-shadow: 0 2px 8px rgba(0,0,0,0.04);
     min-width: 0;
     max-width: 100%;
     box-sizing: border-box;
   }

   @media (max-width: 960px) {
     .prompt-studio-dual-pane {
       grid-template-columns: 1fr;
     }
   }
   ```

---

#### 3. Cập nhật `src/PromptStudioTab.jsx`
1. **Áp dụng các class layout:**
   - Root: `className="prompt-studio-root"` kèm `style={{ width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}`
   - Header banner: `className="prompt-studio-banner"`
   - Dual-pane container: `className="prompt-studio-dual-pane"`
   - Sidebar cột trái: `className="prompt-studio-sidebar"`
   - Cột phải: `className="prompt-studio-main"` với `style={{ minWidth: 0, maxWidth: '100%', boxSizing: 'border-box' }}`
2. **Xóa bỏ hoàn toàn các đoạn JSX bị nhân đôi:**
   - Chỉ giữ duy nhất 1 thanh công cụ ở đầu Editor card:
     ```jsx
     <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
       <div style={{ minWidth: 0, flex: 1 }}>
         <b style={{ fontSize: 16, color: '#0F172A', display: 'block', lineHeight: 1.3 }}>{curDef.name}</b>
         <div style={{ fontSize: 12.5, color: '#64748B', marginTop: 2, lineHeight: 1.4 }}>{curDef.desc}</div>
       </div>
       <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', flexShrink: 0 }}>
         {/* Toggle Soạn thảo / Xem nổi bật biến */}
         {/* Nút Bỏ thay đổi, Nút Về bản mặc định */}
       </div>
     </div>
     ```
   - Xóa bỏ đoạn test input/check bị lặp ở cuối card Test Bench.
3. **Đảm bảo co giãn chuẩn:** `<textarea>`, backdrop highlight, và các ô input đều có `width: '100%', maxWidth: '100%', boxSizing: 'border-box'`.
4. **Hàng nút gợi ý biến:**
   ```jsx
   {curDef.variables && curDef.variables.length > 0 && (
     <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 4, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6, width: '100%' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
           <span style={{ fontSize: 12.5, fontWeight: 800, color: '#1E293B' }}>
             🎯 Các biến có thể chèn vào vị trí con trỏ chuột:
           </span>
           <span style={{ fontSize: 11.5, color: '#64748B' }}>
             (Bấm biến để chèn tự động vào đúng chỗ con trỏ đang đứng)
           </span>
         </div>
         <div style={{ fontSize: 11, color: '#64748B' }}>
           <span style={{ color: '#10B981', fontWeight: 800 }}>✓</span> Đã có &nbsp;
           <span style={{ color: '#EF4444', fontWeight: 800 }}>+</span> Chưa chèn
         </div>
       </div>

       <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
         {curDef.variables.map((v) => {
           const isPresent = curDraft.includes(v)
           const isRequired = curDef.requiredVars.includes(v)
           const style = getParamStyle(v)
           return (
             <button
               key={v}
               type="button"
               onMouseDown={(e) => e.preventDefault()}
               onClick={() => handleInsertParam(v)}
               style={{
                 display: 'inline-flex',
                 alignItems: 'center',
                 gap: 5,
                 padding: '5px 10px',
                 borderRadius: 8,
                 fontSize: 12,
                 fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                 fontWeight: 700,
                 border: isPresent
                   ? `1.5px solid ${style.border}`
                   : isRequired
                   ? '1.5px dashed #EF4444'
                   : `1.5px dashed ${style.border}`,
                 background: isPresent ? style.bg : '#FFFFFF',
                 color: style.text,
                 cursor: 'pointer',
                 transition: 'all 0.15s ease',
                 boxShadow: isPresent ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                 boxSizing: 'border-box',
                 maxWidth: '100%',
               }}
               title={`${style.name} — Bấm để chèn tại vị trí con trỏ chuột`}
             >
               <span style={{ fontSize: 13 }}>{style.icon}</span>
               <span>{v}</span>
               <span style={{ fontSize: 10, opacity: 0.85, fontWeight: 600 }}>({style.name})</span>
               <span style={{ fontSize: 11, marginLeft: 3, fontWeight: 800, color: isPresent ? '#059669' : isRequired ? '#DC2626' : '#94A3B8' }}>
                 {isPresent ? '✓' : '+'}
               </span>
             </button>
           )
         })}
       </div>
     </div>
   )}
   ```

---

### KIỂM THỬ BẮT BUỘC SAU KHI SỬA
1. Chạy `npm run build` không phát sinh lỗi.
2. Mở tab **Prompt Studio** trong `/admin`:
   - Danh sách các biến `{{mon}}`, `{{lop}}`, `{{de_bai}}`,... hiển thị đầy đủ, nổi bật với màu sắc và icon riêng biệt.
   - Bấm vào biến sẽ tự động chèn đúng vị trí con trỏ trong ô soạn thảo.
   - Toàn bộ giao diện căn vừa khít trong khung `max-width: 1360px`, không bị lệch sang phải, không xuất hiện thanh cuộn ngang của trang web.
