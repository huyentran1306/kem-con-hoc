/**
 * LỚP HỌC CỦA CON & PHỤ HUYNH VÀO LỚP BẰNG LINK (PROMPT 11 - PHẦN C)
 * Hỗ trợ:
 * - 7 màn chuẩn theo mockup cong-giao-vien-ban-gau.html
 * - Vào lớp bằng link /vao-lop/{join_code} và /vao-lop/m/{claim_code}
 * - Chọn đúng con, hợp khối, cảnh báo lệch khối
 * - Thêm con nhanh ngay tại màn không rời luồng
 * - Chặn trùng (Bố & Mẹ cùng vào lớp, 1 con tối đa 5 lớp)
 * - Đổi con trong 24 giờ khi chưa có kết quả bài làm
 * - Nhóm lớp theo từng con trong gia đình
 * - Tuân thủ Điều 20 Nghị định 13/2023/NĐ-CP về dữ liệu trẻ em
 */

import { appConfirm } from './dialog'
import React, { useState, useEffect } from 'react';
import { BookOpen, Users, Check, X, ShieldAlert, LogOut, ArrowRight, Bell, AlertTriangle, RefreshCw, Plus, CheckCircle, Clock } from 'lucide-react';
import { toast } from './utils';
import { fetchClassPreview, joinFamilyClass, changeClassChild, leaveFamilyClass, normalizeClassInfo, teacherLabel, GATEWAY } from './api';

const API_BASE = GATEWAY;

export function FamilyClassSheet({
  token,
  activeChild,
  children: familyKids = [],
  onAddChild,
  initialCode = '',
  initialType = 'class', // 'class' | 'claim'
  onClose,
  onOpenAssignment,
}) {
  const kidsList = Array.isArray(familyKids) && familyKids.length > 0
    ? familyKids
    : activeChild ? [activeChild] : [{ id: 'na', name: 'Bé', grade: 'Lớp 3' }];

  const [mode, setMode] = useState(initialCode ? 'join' : 'classes'); // 'classes' | 'join'
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Join flow state
  const [code, setCode] = useState(initialCode ? initialCode.toUpperCase() : '');
  const [classPreview, setClassPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');

  // Child selection
  const [selectedChildId, setSelectedChildId] = useState(
    kidsList.length === 1 ? kidsList[0].id : (activeChild?.id || kidsList[0].id)
  );
  const [gradeWarningDismissed, setGradeWarningDismissed] = useState(false);
  const [showInlineAddChild, setShowInlineAddChild] = useState(false);
  const [newChildName, setNewChildName] = useState('');
  const [newChildGrade, setNewChildGrade] = useState('Lớp 3');

  // Roster Name & Consents
  const [rosterName, setRosterName] = useState('');
  const [parentConsent, setParentConsent] = useState(false);
  const [childConsent, setChildConsent] = useState(false);
  const [joining, setJoining] = useState(false);

  // Result state
  const [joinSuccess, setJoinSuccess] = useState(null); // { status, className, teacherName, childName }
  const [duplicateInfo, setDuplicateInfo] = useState(null); // { linkedBy, linkedAt, childName, status }

  // Change child modal (24h rule)
  const [changingClassStudent, setChangingClassStudent] = useState(null);
  const [targetChildId, setTargetChildId] = useState('');
  const [changingChildLoading, setChangingChildLoading] = useState(false);

  useEffect(() => {
    loadClasses();
  }, [token]);

  useEffect(() => {
    if (initialCode) {
      handleCheckCode(initialCode);
    }
  }, [initialCode]);

  async function loadClasses() {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/v1/family/classes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setClasses((data.classes || []).map(normalizeClassInfo));
      }
    } catch {
      toast('Lỗi tải danh sách lớp học', 'error');
    } finally {
      setLoading(false);
    }
  }

  // Parse numerical grade from "Lớp 3", "Khối 3", "3", etc.
  function parseGrade(g) {
    if (!g) return null;
    const m = String(g).match(/(\d+)/);
    return m ? parseInt(m[1], 10) : null;
  }

  async function handleCheckCode(codeToCheck) {
    const clean = (codeToCheck || code).trim().toUpperCase();
    if (!clean) return;
    setPreviewLoading(true);
    setPreviewError('');
    setClassPreview(null);
    setDuplicateInfo(null);
    setJoinSuccess(null);

    try {
      const data = await fetchClassPreview(clean);
      if (data && data.ok && data.class) {
        setClassPreview(data.class);
        if (data.class.prefillName) {
          setRosterName(data.class.prefillName);
        }
        // Auto-match child with same grade if multiple kids exist
        const classGrade = parseGrade(data.class.grade);
        const matchKid = kidsList.find((k) => parseGrade(k.grade) === classGrade);
        if (matchKid) {
          setSelectedChildId(matchKid.id);
        }
      } else {
        const errMsg = data?.error?.message || (typeof data?.error === 'string' ? data.error : '') || data?.message;
        setPreviewError(errMsg || 'Mã lớp không hợp lệ hoặc đã hết hạn');
      }
    } catch (e) {
      setPreviewError('Lỗi kiểm tra mã lớp, vui lòng thử lại');
    } finally {
      setPreviewLoading(false);
    }
  }

  // Check if selected child is already in this class
  const selectedChild = kidsList.find((k) => k.id === selectedChildId) || kidsList[0];
  const classGradeNum = classPreview ? parseGrade(classPreview.grade) : null;
  const childGradeNum = selectedChild ? parseGrade(selectedChild.grade) : null;
  const isGradeMismatch = Boolean(classGradeNum && childGradeNum && classGradeNum !== childGradeNum);

  // Check duplicate in locally loaded classes
  const existingLink = classPreview
    ? classes.find((c) => c.class_id === classPreview.id && c.child_id === selectedChildId)
    : null;

  async function handleJoinSubmit(e) {
    if (e) e.preventDefault();
    if (!classPreview) return;
    const cleanCode = code.trim().toUpperCase();

    if (!parentConsent || !childConsent) {
      toast('Vui lòng đánh dấu cả 2 ô đồng ý theo quy định bảo vệ trẻ em', 'warn');
      return;
    }

    if (existingLink) {
      setDuplicateInfo({
        childName: selectedChild?.name,
        linkedBy: existingLink.linked_by_name || 'Phụ huynh',
        linkedAt: existingLink.linked_at ? new Date(existingLink.linked_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'hôm nay',
        status: existingLink.status,
      });
      return;
    }

    setJoining(true);
    setDuplicateInfo(null);

    try {
      const payload = {
        token,
        childId: selectedChildId,
        childName: selectedChild?.name,
        childGrade: selectedChild?.grade,
        rosterName: rosterName.trim() || selectedChild?.name || 'Bé',
        consent: parentConsent,
        childConsent: childConsent,
      };

      if (initialType === 'claim' || classPreview.type === 'claim') {
        payload.claimCode = cleanCode;
      } else {
        payload.code = cleanCode;
      }

      const res = await joinFamilyClass(payload);

      if (res.ok && res.httpStatus !== 409) {
        const joinStatus =
          [res.joinStatus, res.classStudent?.status, typeof res.status === 'string' ? res.status : null].find(Boolean) || 'pending';
        setJoinSuccess({
          status: joinStatus,
          className: res.class?.name || classPreview.name,
          teacherName: res.class?.teacher_name || classPreview.teacher_name,
          childName: selectedChild?.name,
        });
        toast(joinStatus === 'active' ? 'Đã kết nối vào lớp!' : 'Đã gửi yêu cầu vào lớp cho cô duyệt', 'success');
        loadClasses();
      } else if (res.httpStatus === 409) {
        // Duplicate detection from server
        setDuplicateInfo({
          childName: selectedChild?.name,
          linkedBy: res.linkedBy || 'Phụ huynh',
          linkedAt: res.linkedAt ? new Date(res.linkedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'hôm nay',
          status: (typeof res.status === 'string' ? res.status : res.statusText) || 'active',
        });
      } else {
        toast(res.error?.message || (typeof res.error === 'string' ? res.error : '') || res.message || 'Không thể vào lớp, vui lòng thử lại', 'error');
      }
    } catch {
      toast('Lỗi kết nối máy chủ', 'error');
    } finally {
      setJoining(false);
    }
  }

  async function handleInlineAddChild(e) {
    e.preventDefault();
    const name = newChildName.trim();
    if (!name) return;

    const newId = `kid_${Date.now()}`;
    const newKid = {
      id: newId,
      name,
      grade: newChildGrade,
      emoji: '👶',
    };

    if (onAddChild) {
      onAddChild(newKid);
    }
    kidsList.push(newKid);
    setSelectedChildId(newId);
    setShowInlineAddChild(false);
    setNewChildName('');
    toast(`Đã thêm bé ${name}!`, 'success');
  }

  async function handleLeave(classStudentId, className) {
    const ok = await appConfirm('Con sẽ không còn nhận bài tập từ lớp này nữa.', { title: `Rời Lớp ${className}?`, okText: 'Rời lớp', danger: true });
    if (!ok) return;

    try {
      const res = await leaveFamilyClass({ token, classStudentId, deleteResults: false });
      if (res.ok) {
        toast(`Đã rời Lớp ${className}`, 'info');
        loadClasses();
      } else {
        toast(res.error?.message || 'Lỗi rời lớp', 'error');
      }
    } catch {
      toast('Lỗi kết nối khi rời lớp', 'error');
    }
  }

  async function handleChangeChildConfirm() {
    if (!changingClassStudent || !targetChildId) return;
    setChangingChildLoading(true);

    try {
      const res = await changeClassChild({
        token,
        classStudentId: changingClassStudent.class_student_id,
        childId: targetChildId,
      });

      if (res.ok) {
        toast('Đã đổi con thành công!', 'success');
        setChangingClassStudent(null);
        setTargetChildId('');
        loadClasses();
      } else {
        toast(res.error?.message || res.error || 'Không thể đổi con', 'error');
      }
    } catch {
      toast('Lỗi khi đổi con', 'error');
    } finally {
      setChangingChildLoading(false);
    }
  }

  // Calculate 24h remaining
  function getHoursRemaining(linkedAt) {
    if (!linkedAt) return null;
    const diffMs = 24 * 3600 * 1000 - (Date.now() - new Date(linkedAt).getTime());
    if (diffMs <= 0) return null;
    return Math.ceil(diffMs / (3600 * 1000));
  }

  return (
    <div style={styles.sheetWrap}>
      {/* Top Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={styles.iconCircle}>🏫</div>
          <div>
            <h3 style={styles.title}>
              {mode === 'join' ? 'Vào lớp của cô' : 'Lớp học của con'}
            </h3>
            <p style={styles.sub}>
              {mode === 'join'
                ? 'Nhập mã do cô giáo cung cấp để kết nối'
                : 'Theo dõi bài tập và thông báo từ cô giáo ở trường'}
            </p>
          </div>
        </div>
        <button style={styles.closeBtn} onClick={onClose}><X size={18} /></button>
      </div>

      {/* Navigation tabs */}
      <div style={styles.navRow}>
        <button
          style={{ ...styles.navTab, ...(mode === 'classes' ? styles.navTabActive : {}) }}
          onClick={() => { setMode('classes'); setJoinSuccess(null); }}
        >
          Lớp đang học ({classes.length})
        </button>
        <button
          style={{ ...styles.navTab, ...(mode === 'join' ? styles.navTabActive : {}) }}
          onClick={() => setMode('join')}
        >
          ＋ Vào lớp mới
        </button>
      </div>

      {/* ========================================================
          MODE 1: LỚP HỌC CỦA CON (Grouped by Child)
          ======================================================== */}
      {mode === 'classes' && (
        <div style={styles.bodyScroll}>
          {loading ? (
            <p style={{ color: '#8A6A4A', textAlign: 'center', padding: 20 }}>Đang tải danh sách lớp...</p>
          ) : classes.length === 0 ? (
            <div style={styles.emptyCard}>
              <div style={{ fontSize: 44, marginBottom: 8 }}>🎒</div>
              <h4 style={{ fontFamily: 'Mitr, sans-serif', fontSize: 18, color: '#4B3621', margin: '0 0 6px 0' }}>
                Bé chưa kết nối vào lớp nào
              </h4>
              <p style={{ fontSize: 13, color: '#8A6A4A', margin: '0 0 16px 0' }}>
                Cô giáo sẽ gửi mã lớp hoặc link vào nhóm Zalo. Mẹ chỉ cần nhập mã hoặc bấm vào link là xong nhé!
              </p>
              <button style={styles.btnPrimary} onClick={() => setMode('join')}>
                ＋ Vào lớp bằng mã hoặc link
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Group classes by child */}
              {kidsList.map((kid) => {
                const kidClasses = classes.filter((c) => c.child_id === kid.id);
                return (
                  <div key={kid.id} style={styles.kidGroup}>
                    {/* Kid Header */}
                    <div style={styles.kidGroupHeader}>
                      <span style={{ fontSize: 22 }}>{kid.emoji || '🧒'}</span>
                      <strong style={{ fontSize: 15, color: '#4B3621' }}>{kid.name}</strong>
                      <span style={styles.kidGradeTag}>{kid.grade || 'Tiểu học'}</span>
                    </div>

                    {kidClasses.length === 0 ? (
                      <div style={styles.kidNoClass}>
                        <span>Chưa có lớp nào kết nối với {kid.name}</span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {kidClasses.map((cls) => {
                          const hoursLeft = getHoursRemaining(cls.linked_at);
                          const canChangeChild = hoursLeft !== null && (cls.completed_items || 0) === 0;

                          return (
                            <div key={cls.class_student_id} style={styles.classCard}>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                  <strong style={{ fontSize: 15, color: '#4B3621' }}>
                                    Lớp {cls.class_name} · {teacherLabel(cls.teacher_name)}
                                  </strong>
                                </div>
                                <div style={{ fontSize: 12, color: '#8A6A4A' }}>
                                  {cls.school_name || 'Trường tiểu học'} · Khối {cls.grade}
                                  {cls.roster_name && ` · Tên: ${cls.roster_name}`}
                                </div>

                                {cls.status === 'rejected' && cls.reject_reason && (
                                  <div style={styles.rejectNotice}>
                                    ⚠️ Lý do cô từ chối: "{cls.reject_reason}"
                                  </div>
                                )}
                              </div>

                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                                {/* Status Pill */}
                                {cls.status === 'active' && (
                                  <span style={{ ...styles.statusPill, ...styles.pillOk }}>Đã kết nối</span>
                                )}
                                {cls.status === 'pending' && (
                                  <span style={{ ...styles.statusPill, ...styles.pillWait }}>Chờ duyệt</span>
                                )}
                                {cls.status === 'rejected' && (
                                  <span style={{ ...styles.statusPill, ...styles.pillNo }}>Bị từ chối</span>
                                )}

                                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 4 }}>
                                  {/* Đổi con trong 24h button */}
                                  {canChangeChild && (
                                    <button
                                      type="button"
                                      style={styles.changeChildBtn}
                                      onClick={() => {
                                        setChangingClassStudent(cls);
                                        const otherKid = kidsList.find((k) => k.id !== cls.child_id);
                                        setTargetChildId(otherKid ? otherKid.id : '');
                                      }}
                                      title="Đổi sang con khác trong gia đình (trong vòng 24 giờ)"
                                    >
                                      <RefreshCw size={11} /> Đổi con · còn {hoursLeft}h
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    style={styles.leaveClassBtn}
                                    onClick={() => handleLeave(cls.class_student_id, cls.class_name)}
                                    title="Rời lớp này"
                                  >
                                    <LogOut size={11} /> Rời lớp
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Bottom action button */}
              <button
                type="button"
                style={styles.btnPrimary}
                onClick={() => setMode('join')}
              >
                ＋ Vào lớp bằng mã hoặc link
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          MODE 2: VÀO LỚP FLOW (7 Màn chuẩn)
          ======================================================== */}
      {mode === 'join' && (
        <div style={styles.bodyScroll}>
          {/* SUCCESS SCREEN */}
          {joinSuccess ? (
            <div style={styles.successBox}>
              <div style={{ fontSize: 52, marginBottom: 8 }}>📨</div>
              <h3 style={{ fontFamily: 'Mitr, sans-serif', fontSize: 20, color: '#4B3621', margin: '0 0 6px 0' }}>
                {joinSuccess.status === 'active' ? 'Đã kết nối thành công!' : `Đã gửi ${teacherLabel(joinSuccess.teacherName)} duyệt`}
              </h3>
              <p style={{ fontSize: 13, color: '#8A6A4A', maxWidth: 320, margin: '0 auto 16px auto' }}>
                Cô duyệt xong, bài cô giao sẽ hiện ở màn chính của <strong>{joinSuccess.childName}</strong>.
              </p>

              {/* Sinh đôi / con khác trong nhà prompt */}
              <div style={styles.siblingPromptCard}>
                <div style={{ fontWeight: 800, color: '#4B3621', fontSize: 13, marginBottom: 4 }}>
                  Nhà còn con khác học Lớp {joinSuccess.className} không?
                </div>
                <div style={{ fontSize: 12, color: '#8A6A4A', marginBottom: 12 }}>
                  Ví dụ anh chị em sinh đôi hoặc học chung lớp
                </div>
                <button
                  type="button"
                  style={styles.btnSecondary}
                  onClick={() => {
                    setJoinSuccess(null);
                    setDuplicateInfo(null);
                    // Select another kid
                    const otherKid = kidsList.find((k) => k.name !== joinSuccess.childName);
                    if (otherKid) setSelectedChildId(otherKid.id);
                  }}
                >
                  ＋ Chọn thêm con
                </button>
              </div>

              <button
                type="button"
                style={{ ...styles.btnPrimary, marginTop: 12 }}
                onClick={() => {
                  setJoinSuccess(null);
                  setMode('classes');
                }}
              >
                Xong
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Form nhập mã lớp nếu chưa có preview */}
              {!classPreview && (
                <div style={styles.card}>
                  <label style={styles.label}>Nhập Mã lớp chung (6 ký tự) hoặc Mã riêng (XXX-XXX)</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      style={styles.input}
                      placeholder="Ví dụ: ND9QR7 hoặc CB8-S7F"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && handleCheckCode()}
                    />
                    <button
                      type="button"
                      style={styles.checkBtn}
                      onClick={() => handleCheckCode()}
                      disabled={previewLoading || !code.trim()}
                    >
                      {previewLoading ? '...' : 'Kiểm tra'}
                    </button>
                  </div>
                  {previewError && (
                    <div style={styles.errorText}>⚠️ {previewError}</div>
                  )}
                </div>
              )}

              {/* PREVIEW CARD: THẺ LỚP */}
              {classPreview && (
                <div style={styles.classPreviewCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={styles.previewTag}>Khối {classPreview.grade} · {classPreview.school_year || '2026-2027'}</span>
                      <h4 style={{ fontFamily: 'Mitr, sans-serif', fontSize: 18, color: '#4B3621', margin: '4px 0 2px 0' }}>
                        Lớp {classPreview.name} · {teacherLabel(classPreview.teacher_name)}
                      </h4>
                      <p style={{ fontSize: 12, color: '#8A6A4A', margin: 0 }}>
                        {classPreview.school_name} · Mã: <strong>{classPreview.join_code || code}</strong>
                      </p>
                    </div>
                    <button
                      type="button"
                      style={styles.changeCodeBtn}
                      onClick={() => { setClassPreview(null); setDuplicateInfo(null); }}
                    >
                      Đổi mã
                    </button>
                  </div>
                </div>
              )}

              {/* DUPLICATE WARNING BANNER (Bố mở cùng link mẹ đã kết nối) */}
              {duplicateInfo && (
                <div style={styles.duplicateBanner}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>ℹ️</div>
                  <strong style={{ fontSize: 13, color: '#1E40AF' }}>
                    {duplicateInfo.linkedBy || 'Phụ huynh'} đã kết nối {duplicateInfo.childName} vào lớp này
                  </strong>
                  <div style={{ fontSize: 12, color: '#3B82F6', marginTop: 2 }}>
                    lúc {duplicateInfo.linkedAt} · không cần kết nối lại
                  </div>
                  <button
                    type="button"
                    style={{ ...styles.btnSecondary, marginTop: 10, padding: '7px 14px' }}
                    onClick={() => { setMode('classes'); setDuplicateInfo(null); }}
                  >
                    Về danh sách lớp
                  </button>
                </div>
              )}

              {/* CHỌN CON */}
              {classPreview && !duplicateInfo && (
                <div style={styles.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <label style={styles.label}>Con nào học lớp này?</label>
                    <button
                      type="button"
                      style={styles.inlineAddBtn}
                      onClick={() => setShowInlineAddChild(!showInlineAddChild)}
                    >
                      ＋ Thêm con
                    </button>
                  </div>

                  {/* Inline Add Child Form */}
                  {showInlineAddChild && (
                    <form onSubmit={handleInlineAddChild} style={styles.inlineAddForm}>
                      <strong style={{ fontSize: 12, color: '#4B3621' }}>Thêm nhanh con vào gia đình:</strong>
                      <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                        <input
                          style={{ ...styles.input, flex: 2 }}
                          placeholder="Tên con (VD: Bon)"
                          value={newChildName}
                          onChange={(e) => setNewChildName(e.target.value)}
                          required
                        />
                        <select
                          style={{ ...styles.input, flex: 1 }}
                          value={newChildGrade}
                          onChange={(e) => setNewChildGrade(e.target.value)}
                        >
                          <option value="Lớp 1">Lớp 1</option>
                          <option value="Lớp 2">Lớp 2</option>
                          <option value="Lớp 3">Lớp 3</option>
                          <option value="Lớp 4">Lớp 4</option>
                          <option value="Lớp 5">Lớp 5</option>
                        </select>
                        <button type="submit" style={styles.checkBtn}>Lưu</button>
                      </div>
                    </form>
                  )}

                  {/* Kids List Cards */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {kidsList.map((kid) => {
                      const isSelected = kid.id === selectedChildId;
                      const isMatch = parseGrade(kid.grade) === classGradeNum;
                      const alreadyInClass = classes.some((c) => c.class_id === classPreview.id && c.child_id === kid.id);

                      return (
                        <div
                          key={kid.id}
                          onClick={() => {
                            if (!alreadyInClass) {
                              setSelectedChildId(kid.id);
                              setGradeWarningDismissed(false);
                            }
                          }}
                          style={{
                            ...styles.kidCard,
                            ...(isSelected ? styles.kidCardActive : {}),
                            ...(alreadyInClass ? styles.kidCardDisabled : {}),
                          }}
                        >
                          <span style={{ fontSize: 24 }}>{kid.emoji || '🧒'}</span>
                          <div style={{ flex: 1 }}>
                            <strong style={{ fontSize: 14, color: '#4B3621' }}>{kid.name}</strong>
                            <div style={{ fontSize: 11.5, color: '#8A6A4A' }}>{kid.grade || 'Lớp 3'}</div>
                          </div>

                          {isMatch && !alreadyInClass && (
                            <span style={styles.matchGradeTag}>Hợp khối {classGradeNum}</span>
                          )}

                          {alreadyInClass && (
                            <span style={styles.alreadyInClassTag}>Đã ở lớp này</span>
                          )}

                          {isSelected && !alreadyInClass && (
                            <div style={styles.selectedCheck}>✓</div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* GRADE MISMATCH WARNING MODAL / CARD */}
                  {isGradeMismatch && !gradeWarningDismissed && (
                    <div style={styles.gradeMismatchWarning}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <AlertTriangle size={20} color="#D97706" style={{ flexShrink: 0 }} />
                        <div style={{ fontSize: 12.5, color: '#92400E', lineHeight: 1.4 }}>
                          <strong>{selectedChild?.name}</strong> đang ghi <strong>{selectedChild?.grade}</strong>, lớp này là <strong>khối {classGradeNum}</strong>.
                          <br />Đúng con chưa mẹ?
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                        {kidsList.find((k) => parseGrade(k.grade) === classGradeNum) && (
                          <button
                            type="button"
                            style={styles.btnSecondary}
                            onClick={() => {
                              const matchKid = kidsList.find((k) => parseGrade(k.grade) === classGradeNum);
                              if (matchKid) setSelectedChildId(matchKid.id);
                            }}
                          >
                            Chọn lại {kidsList.find((k) => parseGrade(k.grade) === classGradeNum)?.name}
                          </button>
                        )}
                        <button
                          type="button"
                          style={styles.confirmMismatchBtn}
                          onClick={() => setGradeWarningDismissed(true)}
                        >
                          Đúng, vẫn chọn {selectedChild?.name}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Tên con trong danh sách lớp */}
                  <div style={{ marginTop: 14 }}>
                    <label style={styles.label}>Tên của con trong danh sách lớp</label>
                    <input
                      style={{
                        ...styles.input,
                        backgroundColor: classPreview.prefillName ? '#FFF8EC' : '#FFFFFF',
                      }}
                      placeholder={`Ví dụ: ${selectedChild?.name || 'Nguyễn Minh Anh'}`}
                      value={rosterName}
                      onChange={(e) => setRosterName(e.target.value)}
                      readOnly={Boolean(classPreview.prefillName)}
                    />
                    {classPreview.prefillName && (
                      <small style={{ fontSize: 11, color: '#8A6A4A', marginTop: 3, display: 'block' }}>
                        🔒 Tên do cô giáo nhập sẵn từ danh sách lớp
                      </small>
                    )}
                  </div>

                  {/* 2 Checkbox đồng ý Điều 20 Nghị định 13/2023/NĐ-CP */}
                  <div style={styles.consentCard}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <ShieldAlert size={15} color="#9A5B00" />
                      <strong style={{ fontSize: 11.5, color: '#9A5B00' }}>
                        Bảo vệ dữ liệu học tập của con
                      </strong>
                    </div>

                    <label style={styles.consentRow}>
                      <input
                        type="checkbox"
                        checked={parentConsent}
                        onChange={(e) => setParentConsent(e.target.checked)}
                      />
                      <span>Tôi là phụ huynh, đồng ý cho cô giáo xem kết quả bài tập của con.</span>
                    </label>

                    <label style={styles.consentRow}>
                      <input
                        type="checkbox"
                        checked={childConsent}
                        onChange={(e) => setChildConsent(e.target.checked)}
                      />
                      <span>Con đã được giải thích và đồng ý tham gia lớp học này.</span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="button"
                    style={{
                      ...styles.btnPrimary,
                      marginTop: 14,
                      opacity: parentConsent && childConsent && !joining ? 1 : 0.6,
                    }}
                    disabled={!parentConsent || !childConsent || joining}
                    onClick={handleJoinSubmit}
                  >
                    {joining
                      ? 'Đang kết nối...'
                      : classPreview.type === 'claim'
                      ? 'Vào lớp ngay'
                      : 'Gửi cô duyệt'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          MODAL: ĐỔI CON TRONG 24 GIỜ (Prompt 11 Phần C)
          ======================================================== */}
      {changingClassStudent && (
        <div style={styles.modalBackdrop} onClick={() => setChangingClassStudent(null)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 32, marginBottom: 4 }}>🔄</div>
            <h4 style={{ fontFamily: 'Mitr, sans-serif', fontSize: 18, color: '#4B3621', margin: '0 0 6px 0' }}>
              Đổi con cho Lớp {changingClassStudent.class_name}
            </h4>
            <p style={{ fontSize: 12.5, color: '#8A6A4A', margin: '0 0 14px 0' }}>
              Mẹ có thể chuyển lớp này sang con khác trong nhà trong 24 giờ đầu khi chưa nộp bài nào.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {kidsList
                .filter((k) => k.id !== changingClassStudent.child_id)
                .map((kid) => (
                  <div
                    key={kid.id}
                    onClick={() => setTargetChildId(kid.id)}
                    style={{
                      ...styles.kidCard,
                      ...(targetChildId === kid.id ? styles.kidCardActive : {}),
                    }}
                  >
                    <span style={{ fontSize: 24 }}>{kid.emoji || '🧒'}</span>
                    <div style={{ flex: 1 }}>
                      <strong style={{ fontSize: 14, color: '#4B3621' }}>{kid.name}</strong>
                      <div style={{ fontSize: 11.5, color: '#8A6A4A' }}>{kid.grade}</div>
                    </div>
                    {targetChildId === kid.id && <div style={styles.selectedCheck}>✓</div>}
                  </div>
                ))}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                style={styles.btnSecondary}
                onClick={() => setChangingClassStudent(null)}
              >
                Huỷ
              </button>
              <button
                type="button"
                style={styles.btnPrimary}
                disabled={!targetChildId || changingChildLoading}
                onClick={handleChangeChildConfirm}
              >
                {changingChildLoading ? 'Đang đổi...' : 'Xác nhận đổi con'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  sheetWrap: {
    padding: '16px 18px 24px 18px',
    fontFamily: '"Nunito", -apple-system, sans-serif',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    color: '#4B3621',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    backgroundColor: '#FFF1D6',
    border: '1.5px solid #F0DDC2',
    display: 'grid',
    placeItems: 'center',
    fontSize: 18,
  },
  title: {
    fontFamily: 'Mitr, sans-serif',
    fontSize: 18,
    fontWeight: 700,
    margin: 0,
    color: '#4B3621',
  },
  sub: {
    fontSize: 12,
    color: '#8A6A4A',
    margin: '2px 0 0 0',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    border: '1px solid #F0DDC2',
    backgroundColor: '#FFFFFF',
    display: 'grid',
    placeItems: 'center',
    cursor: 'pointer',
    color: '#8A6A4A',
  },
  navRow: {
    display: 'flex',
    gap: 8,
    marginBottom: 14,
    borderBottom: '1px solid #F0DDC2',
    paddingBottom: 8,
  },
  navTab: {
    padding: '6px 14px',
    borderRadius: 999,
    fontSize: 12.5,
    fontWeight: 800,
    border: '1px solid #F0DDC2',
    backgroundColor: '#FFFFFF',
    color: '#8A6A4A',
    cursor: 'pointer',
  },
  navTabActive: {
    backgroundColor: '#4B3621',
    color: '#FFF8EC',
    borderColor: '#4B3621',
  },
  bodyScroll: {
    overflowY: 'auto',
    maxHeight: 'calc(80vh - 120px)',
    paddingRight: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    border: '1px solid #F0DDC2',
    boxShadow: '0 4px 0 #F0DDC2',
  },
  label: {
    display: 'block',
    fontSize: 11.5,
    fontWeight: 800,
    color: '#8A6A4A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '9px 12px',
    borderRadius: 12,
    border: '2px solid #F0DDC2',
    fontSize: 13.5,
    outline: 'none',
    color: '#4B3621',
    fontWeight: 600,
  },
  checkBtn: {
    padding: '0 16px',
    borderRadius: 12,
    background: '#F6A623',
    color: '#4B3621',
    fontWeight: 800,
    fontSize: 13,
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 3px 0 #C47F0E',
    whiteSpace: 'nowrap',
  },
  errorText: {
    color: '#BE123C',
    fontSize: 12,
    fontWeight: 700,
    marginTop: 6,
  },
  classPreviewCard: {
    backgroundColor: '#FFF8EC',
    borderRadius: 18,
    padding: 14,
    border: '2px dashed #F6A623',
  },
  previewTag: {
    fontSize: 10.5,
    fontWeight: 800,
    padding: '2px 8px',
    borderRadius: 999,
    backgroundColor: '#FFF1D6',
    color: '#9A5B00',
  },
  changeCodeBtn: {
    background: 'none',
    border: 'none',
    color: '#9A5B00',
    fontSize: 12,
    fontWeight: 800,
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  duplicateBanner: {
    backgroundColor: '#EFF6FF',
    border: '1.5px solid #BFDBFE',
    borderRadius: 16,
    padding: 14,
    textAlign: 'center',
  },
  inlineAddBtn: {
    background: 'none',
    border: 'none',
    color: '#9A5B00',
    fontSize: 12,
    fontWeight: 800,
    cursor: 'pointer',
  },
  inlineAddForm: {
    backgroundColor: '#FFF8EC',
    border: '1px solid #F0DDC2',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  kidCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    borderRadius: 14,
    border: '2px solid #F0DDC2',
    backgroundColor: '#FFFFFF',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  kidCardActive: {
    borderColor: '#F6A623',
    backgroundColor: '#FFF8EC',
    boxShadow: '0 0 0 3px rgba(246, 166, 35, 0.2)',
  },
  kidCardDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
    backgroundColor: '#F8FAFC',
  },
  matchGradeTag: {
    fontSize: 11,
    fontWeight: 800,
    padding: '2px 8px',
    borderRadius: 999,
    backgroundColor: '#ECFDF5',
    color: '#047857',
    border: '1px solid #A7F3D0',
  },
  alreadyInClassTag: {
    fontSize: 11,
    fontWeight: 800,
    padding: '2px 8px',
    borderRadius: 999,
    backgroundColor: '#F1F5F9',
    color: '#64748B',
  },
  selectedCheck: {
    width: 22,
    height: 22,
    borderRadius: '50%',
    backgroundColor: '#F6A623',
    color: '#4B3621',
    display: 'grid',
    placeItems: 'center',
    fontWeight: 900,
    fontSize: 12,
  },
  gradeMismatchWarning: {
    backgroundColor: '#FFFBEB',
    border: '1.5px solid #FDE68A',
    borderRadius: 14,
    padding: 12,
    marginTop: 10,
  },
  confirmMismatchBtn: {
    padding: '6px 12px',
    borderRadius: 999,
    background: '#FFFFFF',
    color: '#92400E',
    border: '2px dashed #FCD34D',
    fontWeight: 800,
    fontSize: 11.5,
    cursor: 'pointer',
  },
  consentCard: {
    backgroundColor: '#FFF8EC',
    borderRadius: 14,
    padding: 12,
    border: '1px solid #F0DDC2',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    marginTop: 12,
  },
  consentRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    fontSize: 12,
    color: '#4B3621',
    lineHeight: 1.4,
    cursor: 'pointer',
  },
  btnPrimary: {
    width: '100%',
    padding: '11px 16px',
    borderRadius: 999,
    backgroundColor: '#F6A623',
    color: '#4B3621',
    border: 'none',
    fontWeight: 900,
    fontSize: 14,
    cursor: 'pointer',
    boxShadow: '0 4px 0 #C47F0E',
    textAlign: 'center',
  },
  btnSecondary: {
    padding: '8px 14px',
    borderRadius: 999,
    backgroundColor: '#FFF1D6',
    color: '#9A5B00',
    border: 'none',
    fontWeight: 800,
    fontSize: 12.5,
    cursor: 'pointer',
  },
  successBox: {
    textAlign: 'center',
    padding: '20px 10px',
  },
  siblingPromptCard: {
    backgroundColor: '#FFF8EC',
    border: '1px solid #F0DDC2',
    borderRadius: 16,
    padding: 14,
    margin: '16px 0',
  },
  emptyCard: {
    textAlign: 'center',
    padding: '30px 16px',
    backgroundColor: '#FFF8EC',
    borderRadius: 20,
    border: '1px solid #F0DDC2',
  },
  kidGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  kidGroupHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '4px 6px',
  },
  kidGradeTag: {
    fontSize: 11,
    fontWeight: 800,
    padding: '2px 8px',
    borderRadius: 999,
    backgroundColor: '#FFF1D6',
    color: '#9A5B00',
  },
  kidNoClass: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    border: '1px dashed #F0DDC2',
    fontSize: 12.5,
    color: '#8A6A4A',
    textAlign: 'center',
  },
  classCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    border: '1px solid #F0DDC2',
    boxShadow: '0 3px 0 #F0DDC2',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  statusPill: {
    fontSize: 10.5,
    fontWeight: 800,
    padding: '2px 8px',
    borderRadius: 999,
    border: '1px solid',
    whiteSpace: 'nowrap',
  },
  pillOk: {
    backgroundColor: '#ECFDF5',
    color: '#047857',
    borderColor: '#A7F3D0',
  },
  pillWait: {
    backgroundColor: '#FFF1D6',
    color: '#9A5B00',
    borderColor: '#F6C56A',
  },
  pillNo: {
    backgroundColor: '#FFF1F2',
    color: '#BE123C',
    borderColor: '#FECDD3',
  },
  changeChildBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    background: '#FFF1D6',
    color: '#9A5B00',
    border: '1px solid #F6C56A',
    borderRadius: 999,
    padding: '4px 8px',
    fontSize: 10.5,
    fontWeight: 800,
    cursor: 'pointer',
  },
  leaveClassBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    background: 'none',
    color: '#BE123C',
    border: '1px solid #FECDD3',
    borderRadius: 999,
    padding: '4px 8px',
    fontSize: 10.5,
    fontWeight: 700,
    cursor: 'pointer',
  },
  rejectNotice: {
    fontSize: 11.5,
    color: '#BE123C',
    marginTop: 4,
  },
  modalBackdrop: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(75, 54, 33, 0.5)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    maxWidth: 380,
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 20px 40px rgba(75, 54, 33, 0.25)',
    border: '2px solid #F0DDC2',
  },
};
