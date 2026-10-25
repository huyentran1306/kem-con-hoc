/**
 * Đợt 15 · Chặng 0 — kiểm thử các lỗi P0/P1 luồng phụ huynh
 * Chạy: node scripts/test-dot15-chang-0.mjs
 * Phần kiểm worker tự tìm thư mục worker (WORKER_DIR, ../study-en/ai-gateway-worker), không có thì bỏ qua.
 */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
let pass = 0
const ok = (name, fn) => {
  fn()
  pass++
  console.log('  ✓', name)
}

// localStorage giả cho trialData
const store = {}
globalThis.localStorage = {
  getItem: (k) => (k in store ? store[k] : null),
  setItem: (k, v) => (store[k] = String(v)),
  removeItem: (k) => delete store[k],
}

const trial = await import(pathToFileURL(path.join(root, 'src/trialData.js')))
const { missingCheckWorkFields } = await import(pathToFileURL(path.join(root, 'src/checkWorkFields.js')))

console.log('P0.B · màn kết quả chấm vở')
ok('grade chỉ có {check_id, self_fixed} bị coi là thiếu trường', () => {
  assert.ok(missingCheckWorkFields({ check_id: 'x', self_fixed: 0 }).length >= 4)
})
ok('co_buoc_sai thiếu dòng sai → thiếu dong_sai_dau_tien', () => {
  const g = { ket_qua: 'co_buoc_sai', giai_thich_cho_me: 'a', loi_khen_cu_the: 'b', cau_hoi_cho_con: { muc_1: 'c' }, loai_loi: 'tinh_nham', gia_tri_dung_dong_sai: '9' }
  assert.deepEqual(missingCheckWorkFields(g), ['dong_sai_dau_tien'])
})
ok('dung_het đủ trường → không thiếu', () => {
  assert.deepEqual(missingCheckWorkFields({ ket_qua: 'dung_het', giai_thich_cho_me: 'a', loi_khen_cu_the: 'b', cau_hoi_cho_con: { muc_1: 'c' } }), [])
})

console.log('P0.B · prompt p14a/p14b không còn ví dụ cũ')
const ps = fs.readFileSync(path.join(root, 'src/promptStudio.js'), 'utf8')
ok('p14a không còn "29","20" và "3 hộp"', () => {
  const p14a = ps.slice(ps.indexOf('p14a_read_work: {'), ps.indexOf('p14b_check_work: {'))
  assert.ok(!p14a.includes('"29", "20"') && !p14a.includes('24 + 5'))
})
ok('p14b dùng ví dụ chia kẹo, có câu cấm chép ví dụ', () => {
  const p14b = ps.slice(ps.indexOf('p14b_check_work: {'), ps.indexOf('p14d_teach_back: {'))
  assert.ok(p14b.includes('36 : 4 = 9') && p14b.includes('TUYỆT ĐỐI KHÔNG chép số liệu') && !p14b.includes('24 - 5 = 19'))
})

console.log('P0.C · dữ liệu mẫu chỉ nằm trong trialData')
ok('"Cô Hạnh", "Bé Na", "Bác Ba" chỉ có trong src/trialData.js', () => {
  const bad = []
  const walk = (d) => {
    for (const f of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, f.name)
      if (f.isDirectory()) walk(p)
      else if (/\.(jsx?|mjs)$/.test(f.name) && !p.endsWith('trialData.js')) {
        const t = fs.readFileSync(p, 'utf8')
        for (const k of ['Cô Hạnh', 'Bé Na', 'Bác Ba', "teacher_name: 'Hạnh'"]) if (t.includes(k)) bad.push(`${path.relative(root, p)}: ${k}`)
      }
    }
  }
  walk(path.join(root, 'src'))
  assert.deepEqual(bad, [])
})
ok('Thẻ Cô nhắc chỉ dùng lời nhắc mẫu khi isTrialActive()', () => {
  const t = fs.readFileSync(path.join(root, 'src/TeacherReminderBanner.jsx'), 'utf8')
  assert.ok(t.includes('if (isTrialActive())') && t.includes('getTrialTeacherReminders') && !t.includes('rem_demo_1'))
})

console.log('P0.D · màn khai báo chờ state máy chủ')
const app = fs.readFileSync(path.join(root, 'src/App.jsx'), 'utf8')
ok('Có cổng chờ tải state, lỗi thì Thử lại, không hiện khai báo', () => {
  assert.ok(app.includes('waitingServerState') && app.includes("cloudStatus === 'error'") && app.includes('server-state-loading'))
})
ok('Chưa khai báo xong thì không ghi đè state máy chủ', () => {
  assert.ok(app.includes('if (!S.onboarded) return'))
})
ok('Máy chủ đã khai báo / có con → luôn lấy state máy chủ', () => {
  assert.ok(app.includes('!localOnboarded && (cloudOnboarded || cloudHasChildren)'))
})

console.log('P1 · Dùng thử 3 đề mẫu')
ok('Đề lạ → không trả bài vịt', () => {
  assert.equal(trial.matchTrialLesson('Lan có 36 cái kẹo chia đều cho 4 bạn'), null)
})
ok('3 đề mẫu khớp đúng', () => {
  for (const l of trial.PRELOADED_TRIAL_LESSONS) assert.equal(trial.matchTrialLesson(l.de_bai).id, l.id)
})
ok('Mỗi đề mẫu đủ trường: giảng, chấm vở (sai/đúng), giảng lại', () => {
  for (const l of trial.PRELOADED_TRIAL_LESSONS) {
    const p = trial.trialLessonToProblem(l)
    for (const k of ['type', 'summary', 'warning', 'method', 'answer', 'answerLine']) assert.ok(String(p[k] || '').trim(), `${l.id}.${k}`)
    assert.ok(p.steps.length >= 3 && p.steps.every((s) => s.q && s.answer))
    const x = trial.TRIAL_LESSON_EXTRAS[l.id]
    assert.equal(missingCheckWorkFields(x.cham_vo.cham_sai).length, 0, `${l.id} cham_sai`)
    assert.equal(missingCheckWorkFields(x.cham_vo.cham_dung).length, 0, `${l.id} cham_dung`)
    assert.ok(x.cham_vo.dong_sai.length && x.cham_vo.dong_dung.length && x.giang_lai.transcript && x.giang_lai.tieu_chi.length === 4)
  }
})
ok('Bài trong state Dùng thử ban đầu có đủ thẻ giảng', () => {
  const st = trial.getTrialInitialState()
  assert.ok(st.problem.summary && st.problem.warning && st.problem.method)
})

// ---------- Worker ----------
const candidates = [process.env.WORKER_DIR, path.resolve(root, '../study-en/ai-gateway-worker'), path.resolve(root, '../ai-gateway-worker')].filter(Boolean)
const wdir = candidates.find((d) => fs.existsSync(path.join(d, 'src/check_work.js')))
if (!wdir) {
  console.log('(bỏ qua phần worker: không tìm thấy thư mục ai-gateway-worker)')
} else {
  console.log('P0.B · worker phát hiện chép ví dụ')
  const cw = await import(pathToFileURL(path.join(wdir, 'src/check_work.js')))
  ok('Kết quả y hệt ví dụ cũ (0.62, ["29","20"]) → đọc lỗi', () => {
    assert.ok(cw.looksLikeReadEcho({ de_bai: 'Hỏi còn mấy bút?', cac_dong: [{ so: 2, noi_dung: '24 + 5 = 29 (cây)', chac_chan: 0.62, lua_chon: ['29', '20'] }] }))
  })
  ok('Chép khuôn <...> → đọc lỗi', () => {
    assert.ok(cw.looksLikeReadEcho({ de_bai: '', cac_dong: [{ so: 1, noi_dung: '<dòng thứ nhất đúng như con viết>' }] }))
  })
  ok('Ảnh thật bài 3 hộp bút 5 dòng → không bị coi là chép', () => {
    assert.ok(!cw.looksLikeReadEcho({ de_bai: 'Có 3 hộp bút', cac_dong: [
      { so: 1, noi_dung: 'Số bút có tất cả là:', chac_chan: 0.9 },
      { so: 2, noi_dung: '8 + 8 + 8 = 24 (cây)', chac_chan: 0.9 },
      { so: 3, noi_dung: 'Số bút còn lại là:', chac_chan: 0.8 },
      { so: 4, noi_dung: '24 + 5 = 29 (cây)', chac_chan: 0.7 },
      { so: 5, noi_dung: 'Đáp số: 29 cây bút', chac_chan: 0.9 },
    ] }))
  })
  ok('Chấm chép ví dụ chia kẹo cho bài khác → chấm lỗi', () => {
    assert.ok(cw.looksLikeGradeEcho({ loi_giai_chuan: ['36 : 4 = 9'], dap_an_dung_cho_me: '9 cái kẹo' }, 'Có 3 hộp bút', [{ noi_dung: '8 + 8 + 8 = 24' }]))
  })
  ok('Worker kiểm đủ trường giống app', () => {
    const g = { ket_qua: 'co_buoc_sai', giai_thich_cho_me: 'a', loi_khen_cu_the: 'b', cau_hoi_cho_con: { muc_1: 'c' } }
    assert.deepEqual(cw.missingGradeFields(g), missingCheckWorkFields(g))
  })
  ok('Không còn dữ liệu mẫu "3 hộp bút" khi AI lỗi', () => {
    const src = fs.readFileSync(path.join(wdir, 'src/check_work.js'), 'utf8')
    const body = src.slice(src.indexOf('export async function handleCheckWorkRead'))
    assert.ok(!body.includes('Mẹ cho bạn Na 5 bút') && !body.includes('24 + 5 = 29'))
  })
  ok('validateAndGuard gọi đúng thứ tự tham số', () => {
    const src = fs.readFileSync(path.join(wdir, 'src/check_work.js'), 'utf8')
    assert.ok(src.includes('validateAndGuard("p14b_check_work", JSON.stringify(reconciled)'))
  })
}

console.log(`\n✅ test-dot15-chang-0: ${pass} kiểm thử đạt`)
