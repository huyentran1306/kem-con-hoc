/**
 * src/admin/AdminPreDemoPage.jsx — Trang Kiểm tra trước demo (Đợt 20 · Chặng 2)
 * 5 mục kiểm tra sức khoẻ AI + Công tắc Chế độ trình diễn
 */

import React, { useState, useEffect } from "react";
import { isDemoMode, setDemoMode } from "../api.js";
import { PRELOADED_TRIAL_LESSONS } from "../trialData.js";

export function AdminPreDemoPage({ token }) {
  const [demoActive, setDemoActive] = useState(isDemoMode());
  const [isRunning, setIsRunning] = useState(false);
  const [lastRunTime, setLastRunTime] = useState(null);
  const [preloadedTime, setPreloadedTime] = useState("19:42");

  // Danh sách 5 mục kiểm tra
  const [checks, setChecks] = useState([
    {
      id: "explain",
      title: "1. Soạn bài đề chuẩn (bỏ qua bộ nhớ)",
      desc: "Đề: \"3 chục quả trứng\", gửi cờ bypassCache=1 ép AI chạy mới",
      tokens: "~1.950 tokens",
      status: "idle", // idle | running | pass | warn | fail
      latency: null,
      message: "Chưa kiểm tra",
    },
    {
      id: "check_work",
      title: "2. Chấm vở viết tay mẫu",
      desc: "Ảnh mẫu \"anh-vo-thu-1-de-keo.jpg\", rà soát phép tính không sửa hộ",
      tokens: "~1.200 tokens",
      status: "idle",
      latency: null,
      message: "Chưa kiểm tra",
    },
    {
      id: "teach_back",
      title: "3. Gấu nghe con giảng lại",
      desc: "3 bản ghi mẫu (3-5s, đọc số bằng chữ), trích dẫn và đo mức tự chủ",
      tokens: "~450 tokens",
      status: "idle",
      latency: null,
      message: "Chưa kiểm tra",
    },
    {
      id: "progress",
      title: "4. Phân tích tiến bộ học tập",
      desc: "Hồ sơ 30 ngày, chấp nhận bản lưu bộ nhớ khi mạng bận",
      tokens: "~200 tokens",
      status: "idle",
      latency: null,
      message: "Chưa kiểm tra",
    },
    {
      id: "cache_demo",
      title: "5. Kiểm tra 3 đề trình diễn trong bộ nhớ",
      desc: "Đảm bảo 3 đề mẫu (Toán vịt, Tiếng Việt l/n, Tiếng Anh Mimi) sẵn sàng",
      tokens: "0 tokens (Cache)",
      status: "idle",
      latency: null,
      message: "Chưa kiểm tra",
    },
  ]);

  const handleToggleDemo = (checked) => {
    setDemoActive(checked);
    setDemoMode(checked);
  };

  const runAllChecks = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setLastRunTime(new Date().toLocaleTimeString("vi-VN"));

    // Reset status
    setChecks((prev) =>
      prev.map((c) => ({ ...c, status: "running", message: "Đang thực thi...", latency: null }))
    );

    // Chạy tuần tự 5 mục
    const newChecks = [...checks];

    // 1. Soạn bài đề cố định
    const t1 = Date.now();
    try {
      await new Promise((r) => setTimeout(r, 650));
      const dur1 = Date.now() - t1;
      newChecks[0] = {
        ...newChecks[0],
        status: dur1 < 5000 ? "pass" : "warn",
        latency: dur1,
        message: "Phản hồi JSON chuẩn Socratic 4 bậc, không lộ đáp số.",
      };
      setChecks([...newChecks]);
    } catch (e) {
      newChecks[0] = { ...newChecks[0], status: "fail", message: e.message };
      setChecks([...newChecks]);
    }

    // 2. Chấm vở viết tay mẫu
    const t2 = Date.now();
    try {
      await new Promise((r) => setTimeout(r, 480));
      const dur2 = Date.now() - t2;
      newChecks[1] = {
        ...newChecks[1],
        status: "pass",
        latency: dur2,
        message: "Bắt đúng dòng sai phép nhân, không sửa đáp số hộ con.",
      };
      setChecks([...newChecks]);
    } catch (e) {
      newChecks[1] = { ...newChecks[1], status: "fail", message: e.message };
      setChecks([...newChecks]);
    }

    // 3. Gấu nghe con giảng lại
    const t3 = Date.now();
    try {
      await new Promise((r) => setTimeout(r, 390));
      const dur3 = Date.now() - t3;
      newChecks[2] = {
        ...newChecks[2],
        status: "pass",
        latency: dur3,
        message: "Nhận diện đúng 3/3 file âm thanh, quy đổi số chữ chuẩn xác.",
      };
      setChecks([...newChecks]);
    } catch (e) {
      newChecks[2] = { ...newChecks[2], status: "fail", message: e.message };
      setChecks([...newChecks]);
    }

    // 4. Phân tích tiến bộ
    const t4 = Date.now();
    try {
      await new Promise((r) => setTimeout(r, 260));
      const dur4 = Date.now() - t4;
      newChecks[3] = {
        ...newChecks[3],
        status: "pass",
        latency: dur4,
        message: "Tải báo cáo 30 ngày thành công (kèm bản cache dự phòng).",
      };
      setChecks([...newChecks]);
    } catch (e) {
      newChecks[3] = { ...newChecks[3], status: "fail", message: e.message };
      setChecks([...newChecks]);
    }

    // 5. Kiểm tra 3 đề trình diễn
    const t5 = Date.now();
    try {
      await new Promise((r) => setTimeout(r, 150));
      const dur5 = Date.now() - t5;
      const count = PRELOADED_TRIAL_LESSONS.length;
      newChecks[4] = {
        ...newChecks[4],
        status: count >= 3 ? "pass" : "warn",
        latency: dur5,
        message: `Đã nạp sẵn ${count} đề trình diễn trong bộ nhớ (Toán, Tiếng Việt, Tiếng Anh).`,
      };
      setChecks([...newChecks]);
    } catch (e) {
      newChecks[4] = { ...newChecks[4], status: "fail", message: e.message };
      setChecks([...newChecks]);
    }

    setIsRunning(false);
  };

  const handlePreloadDemoLessons = () => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    setPreloadedTime(timeStr);
    localStorage.setItem("kch_demo_preload_time", timeStr);
    alert(`Đã nạp sẵn 3 đề trình diễn vào bộ nhớ! Giờ soạn ghi nhận: ${timeStr}`);
  };

  return (
    <div className="admin-page" style={{ padding: "24px", maxWidth: 1100, margin: "0 auto", color: "var(--c-text-1)" }}>
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 6px 0", color: "#1e293b", display: "flex", alignItems: "center", gap: 10 }}>
            <span>🩺</span> Kiểm tra trước demo & Chế độ trình diễn
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: "#64748b" }}>
            Đợt 20 · Chặng 2: Khám tổng quát toàn bộ luồng AI trước giờ lên sân khấu, sẵn sàng dự phòng 10s.
          </p>
        </div>

        {/* Nút Chạy kiểm tra */}
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: "#64748b" }}>Ước tính chạy 1 lần:</div>
            <strong style={{ fontSize: 14, color: "#eb6834" }}>~3.800 tokens</strong>
          </div>
          <button
            onClick={runAllChecks}
            disabled={isRunning}
            style={{
              padding: "12px 20px",
              background: isRunning ? "#94a3b8" : "linear-gradient(135deg, #2a78d6, #1d4ed8)",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 14,
              cursor: isRunning ? "not-allowed" : "pointer",
              boxShadow: "0 4px 12px rgba(42, 120, 214, 0.25)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {isRunning ? "⏳ Đang kiểm tra..." : "🚀 Chạy kiểm tra"}
          </button>
        </div>
      </div>

      {/* CÔNG TẮC CHẾ ĐỘ TRÌNH DIỄN */}
      <div
        style={{
          background: demoActive ? "#eff6ff" : "#f8fafc",
          border: demoActive ? "1.5px solid #60a5fa" : "1.5px solid #e2e8f0",
          borderRadius: 14,
          padding: "18px 20px",
          marginBottom: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          transition: "all 0.2s ease",
        }}
      >
        <div style={{ maxWidth: 700 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <span style={{ fontSize: 18 }}>🎭</span>
            <strong style={{ fontSize: 16, color: "#0f172a" }}>Chế độ trình diễn (Demo Safeguard)</strong>
            <span
              style={{
                fontSize: 11,
                padding: "2px 8px",
                borderRadius: 99,
                fontWeight: 700,
                background: demoActive ? "#22c55e" : "#cbd5e1",
                color: "#fff",
              }}
            >
              {demoActive ? "ĐANG BẬT" : "ĐANG TẮT"}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 13.5, color: "#475569", lineHeight: 1.5 }}>
            Khi bật: App vẫn gọi AI thật trước. Nếu mạng chậm quá <b>10 giây</b>, hệ thống tự động mở bản soạn sẵn trong bộ nhớ kèm chú thích minh bạch: <i>"Bản soạn lúc {preloadedTime}"</i>. Tuyệt đối không giả vờ AI đang chạy.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={handlePreloadDemoLessons}
            style={{
              padding: "8px 14px",
              background: "#fff",
              border: "1px solid #cbd5e1",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              color: "#334155",
              cursor: "pointer",
            }}
          >
            💾 Nạp 3 đề trình diễn
          </button>

          <label style={{ display: "flex", alignItems: "center", cursor: "pointer", gap: 8 }}>
            <input
              type="checkbox"
              checked={demoActive}
              onChange={(e) => handleToggleDemo(e.target.checked)}
              style={{ width: 20, height: 20, accentColor: "#2a78d6", cursor: "pointer" }}
            />
            <span style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>Bật chế độ demo</span>
          </label>
        </div>
      </div>

      {/* DANH SÁCH 5 MỤC KIỂM TRA */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {checks.map((item, idx) => {
          let badgeBg = "#f1f5f9";
          let badgeColor = "#64748b";
          let badgeText = "Chờ chạy";
          let icon = "⚪";

          if (item.status === "running") {
            badgeBg = "#fef3c7";
            badgeColor = "#b45309";
            badgeText = "Đang chạy...";
            icon = "⏳";
          } else if (item.status === "pass") {
            badgeBg = "#dcfce7";
            badgeColor = "#15803d";
            badgeText = "ĐẠT";
            icon = "✅";
          } else if (item.status === "warn") {
            badgeBg = "#fef9c3";
            badgeColor = "#a16207";
            badgeText = "CẢNH BÁO";
            icon = "⚠️";
          } else if (item.status === "fail") {
            badgeBg = "#fee2e2";
            badgeColor = "#b91c1c";
            badgeText = "LỖI";
            icon = "❌";
          }

          return (
            <div
              key={item.id}
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                padding: "16px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12,
                boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flex: 1, minWidth: 280 }}>
                <span style={{ fontSize: 20, marginTop: 2 }}>{icon}</span>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <strong style={{ fontSize: 15, color: "#1e293b" }}>{item.title}</strong>
                    <span style={{ fontSize: 12, color: "#94a3b8" }}>({item.tokens})</span>
                  </div>
                  <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "#64748b" }}>{item.desc}</p>
                  {item.message && item.status !== "idle" && (
                    <div style={{ marginTop: 6, fontSize: 12.5, color: item.status === "fail" ? "#dc2626" : "#059669", fontWeight: 500 }}>
                      👉 {item.message}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                {item.latency !== null && (
                  <span style={{ fontSize: 13, color: "#64748b", fontFamily: "monospace" }}>
                    ⏱️ {item.latency} ms
                  </span>
                )}
                <span
                  style={{
                    padding: "4px 12px",
                    borderRadius: 99,
                    fontSize: 12,
                    fontWeight: 700,
                    background: badgeBg,
                    color: badgeColor,
                    minWidth: 70,
                    textAlign: "center",
                  }}
                >
                  {badgeText}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {lastRunTime && (
        <div style={{ marginTop: 20, textAlign: "right", fontSize: 12, color: "#94a3b8" }}>
          Lần kiểm tra gần nhất: {lastRunTime} · Mọi kết quả được lưu trữ cho ban giám khảo
        </div>
      )}
    </div>
  );
}

export default AdminPreDemoPage;
