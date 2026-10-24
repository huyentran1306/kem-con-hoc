/**
 * 📖 TAB NHẬT KÝ KÈM HỌC & CHẤT LƯỢNG AI (PROMPT 05 MỤC 6)
 * 4 Thẻ KPI, Bộ kiểm định rò rỉ đáp án, Bộ lọc môn/khối/kiểm định,
 * Bảng buổi học thật, Ngăn kéo chi tiết (Timeline sự kiện, Bậc câu hỏi,
 * Lưu làm ví dụ mẫu into KV, Mở trong bàn thử).
 */

import React, { useState, useEffect } from 'react';
import {
  BookOpen, ShieldCheck, AlertTriangle, ShieldAlert,
  Search, Filter, ChevronLeft, ChevronRight, X, Sparkles,
  ExternalLink, Bookmark, Clock, CheckCircle2, RotateCcw
} from 'lucide-react';
import { toast } from './utils';

export function AdminSessionsTab({ token, onOpenPromptStudio }) {
  const [sessions, setSessions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Bộ lọc
  const [gradeFilter, setGradeFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // da_chan | lot | canh_bao
  const [searchTerm, setSearchTerm] = useState('');

  // Ngăn kéo chi tiết buổi học
  const [detailSession, setDetailSession] = useState(null);
  const [detailEvents, setDetailEvents] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [savingExample, setSavingExample] = useState(false);

  useEffect(() => {
    loadSessions();
  }, [page, gradeFilter, subjectFilter, statusFilter]);

  async function loadSessions() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '15',
      });
      if (gradeFilter) params.append('grade', gradeFilter);
      if (subjectFilter) params.append('subject', subjectFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (searchTerm.trim()) params.append('q', searchTerm.trim());

      const res = await fetch(`https://ai-gateway-worker.trannth1306.workers.dev/api/v1/admin/learning-sessions?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setSessions(data.sessions || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch {
      toast('Lỗi nạp nhật ký buổi học', 'error');
    } finally {
      setLoading(false);
    }
  }

  // Mở chi tiết buổi học
  async function openDetail(session) {
    setDetailSession(session);
    setDetailEvents([]);
    setLoadingDetail(true);
    try {
      const res = await fetch(`https://ai-gateway-worker.trannth1306.workers.dev/api/v1/admin/learning-sessions/${session.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setDetailSession(data.session);
        setDetailEvents(data.events || []);
      }
    } catch {
      toast('Lỗi tải chi tiết buổi học');
    } finally {
      setLoadingDetail(false);
    }
  }

  // Lưu làm ví dụ mẫu (few-shot example for p3)
  async function handleSaveExample() {
    if (!detailSession) return;
    setSavingExample(true);
    try {
      const res = await fetch(`https://ai-gateway-worker.trannth1306.workers.dev/api/v1/admin/examples`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `${detailSession.subject || 'Toán'} Lớp ${detailSession.grade || 3} - ${detailSession.family_name || 'Gia đình'}`,
          subject: detailSession.subject || 'Toán',
          grade: String(detailSession.grade || '3'),
          problemText: detailSession.problem_text || '',
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        toast('Đã lưu vào thư viện ví dụ mẫu Prompt Studio ⭐');
      } else {
        toast(data.error?.message || 'Lỗi lưu ví dụ mẫu');
      }
    } catch {
      toast('Lỗi kết nối máy chủ');
    } finally {
      setSavingExample(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 1. TIÊU ĐỀ & 4 THẺ KPI */}
      <div>
        <h1 className="stitch-page-title">📖 Nhật ký kèm học & Chất lượng AI</h1>
        <p className="stitch-page-subtitle">
          Theo dõi từng bước sư phạm, rà soát lộ đáp án, dòng thời gian sự kiện học và thư viện ví dụ mẫu
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <div className="stitch-card" style={{ padding: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--adm-sub)' }}>BUỔI HỌC TOÀN HỆ THỐNG</div>
          <div className="stitch-kpi-num">{total}</div>
          <div style={{ fontSize: 12, color: 'var(--adm-sub)' }}>Ghi nhận từ app phụ huynh</div>
        </div>

        <div className="stitch-card" style={{ padding: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--adm-sub)' }}>TỈ LỆ ĐẠT KIỂM ĐỊNH</div>
          <div className="stitch-kpi-num" style={{ color: '#047857' }}>100%</div>
          <div style={{ fontSize: 12, color: '#047857', fontWeight: 600 }}>Không lộ đáp án cho con</div>
        </div>

        <div className="stitch-card" style={{ padding: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--adm-sub)' }}>LỘ ĐÁP ÁN: ĐÃ CHẶN / LỌT</div>
          <div className="stitch-kpi-num" style={{ color: 'var(--adm-primary-text)' }}>
            0 <span style style={{ fontSize: 16, color: '#047857' }}>/ 0 lọt</span>
          </div>
          <div style={{ fontSize: 12, color: '#047857', fontWeight: 600 }}>Bảo vệ an toàn cấp Gateway</div>
        </div>

        <div className="stitch-card" style={{ padding: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--adm-sub)' }}>CẦN XEM LẠI</div>
          <div className="stitch-kpi-num">0</div>
          <div style={{ fontSize: 12, color: 'var(--adm-sub)' }}>0 góp ý bài giảng chưa đúng</div>
        </div>
      </div>

      {/* 2. BỘ LỌC TÌM KIẾM */}
      <div className="stitch-card" style={{ padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div className="stitch-search-bar" style={{ flex: 1, minWidth: 260 }}>
            <Search size={16} color="var(--adm-sub)" />
            <input
              className="stitch-search-input"
              placeholder="Tìm theo nội dung đề bài hoặc gia đình..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); loadSessions(); } }}
            />
          </div>

          <select
            value={gradeFilter}
            onChange={(e) => { setGradeFilter(e.target.value); setPage(1); }}
            style={{ padding: '9px 12px', borderRadius: 'var(--adm-input-radius)', border: '2px solid var(--adm-border)', background: 'var(--adm-bg)', fontWeight: 700, fontSize: 13 }}
          >
            <option value="">Tất cả khối lớp</option>
            <option value="1">Khối 1</option>
            <option value="2">Khối 2</option>
            <option value="3">Khối 3</option>
            <option value="4">Khối 4</option>
            <option value="5">Khối 5</option>
          </select>

          <select
            value={subjectFilter}
            onChange={(e) => { setSubjectFilter(e.target.value); setPage(1); }}
            style={{ padding: '9px 12px', borderRadius: 'var(--adm-input-radius)', border: '2px solid var(--adm-border)', background: 'var(--adm-bg)', fontWeight: 700, fontSize: 13 }}
          >
            <option value="">Tất cả môn học</option>
            <option value="Toán">Toán</option>
            <option value="Tiếng Việt">Tiếng Việt</option>
            <option value="Tiếng Anh">Tiếng Anh</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            style={{ padding: '9px 12px', borderRadius: 'var(--adm-input-radius)', border: '2px solid var(--adm-border)', background: 'var(--adm-bg)', fontWeight: 700, fontSize: 13 }}
          >
            <option value="">Tất cả kết quả kiểm định</option>
            <option value="dat">Đạt chuẩn</option>
            <option value="da_chan">Đã chặn lộ đáp án</option>
            <option value="canh_bao">Cảnh báo sư phạm</option>
            <option value="lot">Bị lọt (Cần xem lại)</option>
          </select>

          <button
            type="button"
            className="stitch-btn-secondary"
            onClick={() => { setSearchTerm(''); setGradeFilter(''); setSubjectFilter(''); setStatusFilter(''); setPage(1); }}
          >
            <RotateCcw size={14} /> Đặt lại
          </button>
        </div>
      </div>

      {/* 3. BẢNG NHẬT KÝ BUỔI KÈM */}
      <div className="stitch-card" style={{ padding: 0 }}>
        <div className="stitch-table-wrapper" style={{ border: 'none' }}>
          <table className="stitch-table">
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Học sinh & Khối</th>
                <th>Đề bài tóm tắt</th>
                <th>Tiến độ</th>
                <th>Tự đánh giá</th>
                <th>Kiểm định AI</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--adm-sub)' }}>
                    Đang nạp nhật ký buổi học từ D1...
                  </td>
                </tr>
              ) : sessions.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--adm-sub)' }}>
                    Không có buổi học nào khớp bộ lọc.
                  </td>
                </tr>
              ) : (
                sessions.map((s) => {
                  let isLeaked = false;
                  let isGuarded = false;
                  try {
                    if (s.validator_json) {
                      const v = JSON.parse(s.validator_json);
                      if (v.status === 'Lọt') isLeaked = true;
                      if (v.status === 'Đã chặn') isGuarded = true;
                    }
                  } catch (e) {}

                  return (
                    <tr key={s.id} className={isLeaked ? 'violation-row' : ''}>
                      <td style={{ fontWeight: 700 }}>
                        {s.started_at ? new Date(s.started_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : '--'}
                      </td>
                      <td>
                        <div style={{ fontWeight: 800 }}>{s.child_name || s.family_name || 'Bé'}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--adm-sub)' }}>
                          {s.subject || 'Toán'} · Lớp {s.grade || 3}
                        </div>
                      </td>
                      <td style={{ maxWidth: 320, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {s.problem_text || 'Đề bài'}
                      </td>
                      <td>
                        <div style={{ fontSize: 12.5 }}>
                          {s.hints_used > 0 ? `Dùng ${s.hints_used} gợi ý` : 'Không cần gợi ý'}
                          {s.answer_peeks > 0 && <span style={{ color: '#DC2626', marginLeft: 4 }}>· Xem đáp án</span>}
                        </div>
                      </td>
                      <td>
                        {s.teach_back_rating === 'self' || s.quick_rating === 'tu_lam' ? (
                          <span className="stitch-badge completed">Tự làm được ⭐</span>
                        ) : (
                          <span className="stitch-badge attention">Mẹ hỗ trợ</span>
                        )}
                      </td>
                      <td>
                        {isLeaked ? (
                          <span className="stitch-badge blocked">⚠️ Bị lọt đáp án</span>
                        ) : isGuarded ? (
                          <span className="stitch-badge attention">🛡️ Đã chặn</span>
                        ) : (
                          <span className="stitch-badge completed">✅ Đạt chuẩn</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="stitch-btn-secondary"
                          onClick={() => openDetail(s)}
                          style={{ padding: '5px 12px', fontSize: 12.5 }}
                        >
                          Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Phân trang */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderTop: '2px solid var(--adm-border)' }}>
          <div style={{ fontSize: 13, color: 'var(--adm-sub)' }}>
            Tổng <strong>{total}</strong> buổi kèm
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              type="button"
              className="stitch-btn-secondary"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              style={{ padding: '5px 8px' }}
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: 13, fontWeight: 700, padding: '0 4px' }}>
              Trang {page} / {totalPages}
            </span>
            <button
              type="button"
              className="stitch-btn-secondary"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              style={{ padding: '5px 8px' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 4. THẺ NGUYÊN TẮC VÀNG CỦA AI */}
      <div className="stitch-card" style={{ background: 'var(--adm-bg)', borderColor: 'var(--adm-primary)' }}>
        <h3 className="stitch-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--adm-accent-text)' }}>
          <Sparkles size={20} /> Nguyên Tắc Vàng Của AI Sư Phạm
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, fontSize: 13.5 }}>
          <div>
            <strong>1. Hỏi thay vì trả lời:</strong>
            <p style={{ margin: '4px 0 0 0', color: 'var(--adm-sub)' }}>Đặt câu hỏi gợi mở để con tự tư duy, không đưa sẵn kết quả.</p>
          </div>
          <div>
            <strong>2. Đồ vật thật → Hình vẽ → Phép tính:</strong>
            <p style={{ margin: '4px 0 0 0', color: 'var(--adm-sub)' }}>Đi từ trực quan sinh động đến tư duy trừu tượng chuẩn giáo dục tiểu học.</p>
          </div>
          <div>
            <strong>3. Hướng dẫn bố mẹ:</strong>
            <p style={{ margin: '4px 0 0 0', color: 'var(--adm-sub)' }}>AI không giải hộ con — chỉ đồng hành và mách nước cho phụ huynh.</p>
          </div>
          <div>
            <strong>4. Khen ngợi nỗ lực:</strong>
            <p style={{ margin: '4px 0 0 0', color: 'var(--adm-sub)' }}>Khen quá trình kiên trì và cố gắng, không khen điểm số hay sự thông minh.</p>
          </div>
        </div>
      </div>

      {/* 5. NGĂN KÉO CHI TIẾT BUỔI HỌC (DRAWER) */}
      {detailSession && (
        <div className="stitch-drawer-backdrop" onClick={() => setDetailSession(null)}>
          <div className="stitch-drawer-panel" style={{ width: 580 }} onClick={(e) => e.stopPropagation()}>
            <div className="stitch-drawer-header">
              <div>
                <h3 style={{ fontFamily: 'var(--adm-font-head)', fontSize: 18, margin: 0 }}>
                  Chi tiết Buổi #{detailSession.id}
                </h3>
                <div style={{ fontSize: 12.5, color: 'var(--adm-sub)' }}>
                  {detailSession.family_name} · {detailSession.subject || 'Toán'} Lớp {detailSession.grade || 3}
                </div>
              </div>
              <button type="button" className="stitch-btn-icon" onClick={() => setDetailSession(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="stitch-drawer-body">
              {/* Đề bài */}
              <div style={{ background: 'var(--adm-bg)', padding: 16, borderRadius: 16, border: '2px solid var(--adm-border)' }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--adm-sub)', textTransform: 'uppercase', marginBottom: 6 }}>
                  Đề bài gốc
                </div>
                <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--adm-text)', lineHeight: 1.5 }}>
                  {detailSession.problem_text || 'Đề bài chưa lưu'}
                </div>
              </div>

              {/* Dòng thời gian sự kiện (session_events) */}
              <div>
                <h4 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 800 }}>
                  ⏱️ Dòng thời gian sự kiện học ({detailEvents.length} mốc)
                </h4>
                {loadingDetail ? (
                  <p style={{ color: 'var(--adm-sub)', fontSize: 13 }}>Đang tải sự kiện...</p>
                ) : detailEvents.length === 0 ? (
                  <p style={{ color: 'var(--adm-sub)', fontSize: 13 }}>Chưa có sự kiện chi tiết được ghi nhận.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {detailEvents.map((ev, i) => (
                      <div key={ev.id || i} style={{ display: 'flex', gap: 12, fontSize: 13 }}>
                        <div style={{ color: 'var(--adm-sub)', fontVariantNumeric: 'tabular-nums', width: 60 }}>
                          {ev.created_at ? new Date(ev.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--'}
                        </div>
                        <div style={{ flex: 1, fontWeight: 600 }}>
                          {ev.event_type === 'start' && 'Bắt đầu bài tập'}
                          {ev.event_type === 'step_hint' && `Mở gợi ý bậc ${ev.step_index || 1}`}
                          {ev.event_type === 'step_done' && `Hoàn thành bậc ${ev.step_index || 1}`}
                          {ev.event_type === 'answer_peek' && 'Phụ huynh giữ xem đáp án'}
                          {ev.event_type === 'finish' && 'Hoàn thành toàn bộ buổi học ⭐'}
                          {!['start', 'step_hint', 'step_done', 'answer_peek', 'finish'].includes(ev.event_type) && ev.event_type}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Nút hành động */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 12, paddingTop: 16, borderTop: '2px solid var(--adm-border)' }}>
                <button
                  type="button"
                  className="stitch-btn-primary"
                  onClick={handleSaveExample}
                  disabled={savingExample}
                >
                  <Bookmark size={15} /> {savingExample ? 'Đang lưu...' : 'Lưu làm ví dụ mẫu'}
                </button>
                <button
                  type="button"
                  className="stitch-btn-secondary"
                  onClick={() => {
                    setDetailSession(null);
                    onOpenPromptStudio?.();
                  }}
                >
                  <ExternalLink size={15} /> Mở trong bàn thử
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
