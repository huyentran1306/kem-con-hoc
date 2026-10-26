import React, { useState, useMemo, useEffect } from "react";
import { TRAIT_COLORS, TRAIT_ICONS, HEATMAP_COLORS, getHeatmapColor } from "./badgeRules";
import { getVnMondayStart, getWeekLabel } from "./utils";
import { fetchAiTraitAnalysis } from "./api";
import { isTrialActive } from "./trialData.js";



/**
 * 1. BIỂU ĐỒ CỘT CHỒNG PHẨM CHẤT QUA CÁC TUẦN
 */
export function TraitStackedChart({
  badges = [],
  rewards = [],
  childName = "Con",
}) {
  const [filter, setFilter] = useState("8w"); // "8w", "3m", "1y"
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [showTable, setShowTable] = useState(false);
  // Dữ liệu mẫu 8 tuần phẩm chất cho chế độ Dùng thử (Prompt 22 - 0.2)
  const trialWeeksSample = useMemo(() => [
    { label: "7/9", traitCounts: { "Kiên nhẫn": 2, "Sáng tạo": 3, "Tập trung": 1, "Tỉ mỉ": 1 }, total: 7, hasReward: false },
    { label: "14/9", traitCounts: { "Kiên nhẫn": 3, "Sáng tạo": 2, "Tập trung": 2, "Tỉ mỉ": 1 }, total: 8, hasReward: false },
    { label: "21/9", traitCounts: { "Kiên nhẫn": 4, "Sáng tạo": 4, "Tập trung": 1, "Tỉ mỉ": 2 }, total: 11, hasReward: true },
    { label: "28/9", traitCounts: { "Kiên nhẫn": 2, "Sáng tạo": 3, "Tập trung": 3, "Tỉ mỉ": 2 }, total: 10, hasReward: false },
    { label: "5/10", traitCounts: { "Kiên nhẫn": 3, "Sáng tạo": 4, "Tập trung": 2, "Tỉ mỉ": 1 }, total: 10, hasReward: false },
    { label: "12/10", traitCounts: { "Kiên nhẫn": 4, "Sáng tạo": 3, "Tập trung": 3, "Tỉ mỉ": 2 }, total: 12, hasReward: true },
    { label: "19/10", traitCounts: { "Kiên nhẫn": 3, "Sáng tạo": 5, "Tập trung": 2, "Tỉ mỉ": 1 }, total: 11, hasReward: false },
    { label: "26/10", traitCounts: { "Kiên nhẫn": 4, "Sáng tạo": 1, "Tập trung": 3, "Tỉ mỉ": 2 }, total: 10, hasReward: false },
  ], []);

  // Nhóm badges theo tuần / tháng
  const weeksData = useMemo(() => {
    const validBadges = (badges || []).filter((b) => !b.sample);
    const now = Date.now();
    const numBuckets = filter === "8w" ? 8 : filter === "3m" ? 12 : 12;
    const isYear = filter === "1y";

    const buckets = [];
    const oneWeekMs = 7 * 86400000;
    const currentMonday = getVnMondayStart(now);

    for (let i = numBuckets - 1; i >= 0; i--) {
      let startTs = 0;
      let endTs = 0;
      let label = "";

      if (isYear) {
        // Theo tháng
        const d = new Date(now);
        d.setMonth(d.getMonth() - i);
        const m = d.getMonth() + 1;
        const y = d.getFullYear();
        label = `T${m}/${y % 100}`;
        startTs = new Date(y, m - 1, 1).getTime();
        endTs = new Date(y, m, 1).getTime();
      } else {
        // Theo tuần
        startTs = currentMonday - i * oneWeekMs;
        endTs = startTs + oneWeekMs;
        const d = new Date(startTs);
        label = `${d.getDate()}/${d.getMonth() + 1}`;
      }

      const inBucket = validBadges.filter(
        (b) => (b.timestamp || 0) >= startTs && (b.timestamp || 0) < endTs
      );

      const traitCounts = {
        "Kiên nhẫn": 0,
        "Sáng tạo": 0,
        "Tập trung": 0,
        "Tỉ mỉ": 0,
      };

      for (const b of inBucket) {
        if (traitCounts[b.trait] !== undefined) {
          traitCounts[b.trait]++;
        }
      }

      const total =
        traitCounts["Kiên nhẫn"] +
        traitCounts["Sáng tạo"] +
        traitCounts["Tập trung"] +
        traitCounts["Tỉ mỉ"];

      // Kiểm tra có mốc đổi quà không
      const hasReward = (rewards || []).some(
        (rw) => (rw.timestamp || 0) >= startTs && (rw.timestamp || 0) < endTs
      );

      buckets.push({
        label,
        startTs,
        endTs,
        traitCounts,
        total,
        hasReward,
      });
    }

    if (validBadges.length === 0 && isTrialActive() && filter === "8w") {
      return trialWeeksSample;
    }
    return buckets;
  }, [badges, rewards, filter, trialWeeksSample]);

  // Kiểm tra trạng thái trống (dưới 1 tuần dữ liệu)
  const totalBadgesAll = weeksData.reduce((acc, w) => acc + w.total, 0);
  if (totalBadgesAll === 0) {
    return (
      <div
        className="card"
        style={{ textAlign: "center", padding: "24px 16px" }}
        data-testid="trait-chart-empty"
      >
        <div style={{ fontSize: 44, marginBottom: 6 }}>🐻 🎒 ✨</div>
        <b style={{ fontSize: 16, color: "var(--c-text)" }}>
          Chưa có dữ liệu tuần của {childName}
        </b>
        <p className="xs" style={{ margin: "4px 0 0", color: "#64748B" }}>
          Sau khi {childName} hoàn thành bài học và nhận huy hiệu đầu tiên, biểu
          đồ phẩm chất qua các tuần sẽ xuất hiện tại đây!
        </p>
      </div>
    );
  }

  // Tính số tuần này vs tuần trước để làm chú thích
  const thisWeek = weeksData[weeksData.length - 1]?.traitCounts || {};
  const lastWeek = weeksData[weeksData.length - 2]?.traitCounts || {};

  const getDiffSymbol = (t) => {
    const diff = (thisWeek[t] || 0) - (lastWeek[t] || 0);
    if (diff > 0) return { sym: `▲ +${diff}`, color: "#166534" };
    if (diff < 0) return { sym: `▼ ${diff}`, color: "#991B1B" };
    return { sym: "=", color: "#64748B" };
  };

  // Kích thước SVG
  const svgWidth = 340;
  const svgHeight = 160;
  const chartHeight = 110;
  const colWidth = Math.floor((svgWidth - 40) / weeksData.length);
  const maxTotal = Math.max(...weeksData.map((w) => w.total), 8);

  return (
    <div className="card" data-testid="trait-stacked-chart">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <span className="lbl plum">Phẩm chất qua các tuần</span>
        <div className="trait-filters" role="tablist">
          <button
            type="button"
            className={filter === "8w" ? "active" : ""}
            onClick={() => setFilter("8w")}
            data-testid="btn-filter-8w"
          >
            8 tuần
          </button>
          <button
            type="button"
            className={filter === "3m" ? "active" : ""}
            onClick={() => setFilter("3m")}
            data-testid="btn-filter-3m"
          >
            3 tháng
          </button>
          <button
            type="button"
            className={filter === "1y" ? "active" : ""}
            onClick={() => setFilter("1y")}
            data-testid="btn-filter-1y"
          >
            Cả năm
          </button>
        </div>
      </div>

      {/* SVG Stacked Bar Chart */}
      <div style={{ position: "relative", width: "100%", overflowX: "auto" }}>
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          width="100%"
          height={svgHeight}
          role="img"
          aria-label="Biểu đồ cột chồng phẩm chất theo tuần"
        >
          {/* Lưới mờ trục y */}
          <line
            x1="20"
            y1={chartHeight}
            x2={svgWidth - 10}
            y2={chartHeight}
            stroke="#CBD5E1"
            strokeWidth="1"
          />
          <line
            x1="20"
            y1={chartHeight / 2}
            x2={svgWidth - 10}
            y2={chartHeight / 2}
            stroke="#F1F5F9"
            strokeDasharray="3 3"
          />

          {weeksData.map((wk, cIdx) => {
            const x = 25 + cIdx * colWidth;
            const w = Math.max(14, colWidth - 8);

            // 4 phần theo thứ tự: Kiên nhẫn, Sáng tạo, Tập trung, Tỉ mỉ
            const traits = ["Kiên nhẫn", "Sáng tạo", "Tập trung", "Tỉ mỉ"];
            let curY = chartHeight;

            return (
              <g key={wk.label} tabIndex={0} role="graphics-symbol" aria-label={`Tuần ${wk.label}: tổng ${wk.total} huy hiệu`}>
                {/* Mốc đổi quà đường đứt */}
                {wk.hasReward && (
                  <g>
                    <line
                      x1={x + w / 2}
                      y1="10"
                      x2={x + w / 2}
                      y2={chartHeight}
                      stroke="#F59E0B"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={x + w / 2}
                      y="12"
                      textAnchor="middle"
                      fontSize="11"
                    >
                      🎁
                    </text>
                  </g>
                )}

                {/* Các khúc cột chồng */}
                {traits.map((tr, tIdx) => {
                  const count = wk.traitCounts[tr] || 0;
                  if (count === 0) return null;
                  const segH = Math.max(4, Math.round((count / maxTotal) * (chartHeight - 25)));
                  curY -= segH;

                  // Bo góc 4px ở đỉnh cột
                  const isTopSeg = tIdx === traits.length - 1 || curY <= (chartHeight - Math.round((wk.total / maxTotal) * (chartHeight - 25)) + 4);
                  const rx = isTopSeg ? 4 : 0;

                  return (
                    <rect
                      key={tr}
                      x={x}
                      y={curY}
                      width={w}
                      height={Math.max(2, segH - 2)} // khe 2px giữa các phần
                      rx={rx}
                      fill={TRAIT_COLORS[tr]}
                      style={{ cursor: "pointer", transition: "opacity 0.15s" }}
                      tabIndex={0}
                      aria-label={`Tuần ${wk.label}: ${tr} ${count}`}
                      onMouseEnter={() =>
                        setActiveTooltip({
                          text: `Tuần ${wk.label}: ${tr} ${count}`,
                          x: x + w / 2,
                          y: curY,
                        })
                      }
                      onMouseLeave={() => setActiveTooltip(null)}
                      onFocus={() =>
                        setActiveTooltip({
                          text: `Tuần ${wk.label}: ${tr} ${count}`,
                          x: x + w / 2,
                          y: curY,
                        })
                      }
                      onBlur={() => setActiveTooltip(null)}
                      onClick={() =>
                        setActiveTooltip({
                          text: `Tuần ${wk.label}: ${tr} ${count}`,
                          x: x + w / 2,
                          y: curY,
                        })
                      }
                    />
                  );
                })}

                {/* Tổng số ghi trên đỉnh cột */}
                {wk.total > 0 && (
                  <text
                    x={x + w / 2}
                    y={curY - 4}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="800"
                    fill="#475569"
                  >
                    {wk.total}
                  </text>
                )}

                {/* Nhãn trục x */}
                <text
                  x={x + w / 2}
                  y={chartHeight + 14}
                  textAnchor="middle"
                  fontSize="9.5"
                  fontWeight="700"
                  fill="#64748B"
                >
                  {wk.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Tooltip khi chạm hoặc hover */}
        {activeTooltip && (
          <div
            style={{
              position: "absolute",
              top: Math.max(0, activeTooltip.y - 32),
              left: Math.min(220, Math.max(10, activeTooltip.x - 50)),
              background: "#1E293B",
              color: "#fff",
              padding: "4px 8px",
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 700,
              pointerEvents: "none",
              zIndex: 10,
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              whiteSpace: "nowrap",
            }}
          >
            {activeTooltip.text}
          </div>
        )}
      </div>

      {/* Dòng chú thích mốc đổi quà */}
      <p className="xs" style={{ color: "#92400E", margin: "4px 0 8px" }}>
        🎁 Mốc đổi quà. Đổi quà chỉ đặt lại sổ sticker, lịch sử vẫn giữ nguyên.
      </p>

      {/* Chú thích 4 phẩm chất: biểu tượng, tên, số tuần này, biến động */}
      <div className="trait-legend">
        {["Kiên nhẫn", "Sáng tạo", "Tập trung", "Tỉ mỉ"].map((tr) => {
          const diff = getDiffSymbol(tr);
          return (
            <div key={tr} className="trait-legend-item">
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 16 }}>{TRAIT_ICONS[tr]}</span>
                <div>
                  <b style={{ color: TRAIT_COLORS[tr] }}>{tr}</b>
                  <div style={{ fontSize: 11, color: "#64748B" }}>
                    Tuần này: <b>{thisWeek[tr] || 0}</b>
                  </div>
                </div>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: diff.color,
                  padding: "2px 6px",
                  borderRadius: 99,
                  background: "#F8FAFC",
                }}
              >
                {diff.sym}
              </span>
            </div>
          );
        })}
      </div>

      {/* Nút xem dạng bảng */}
      <div style={{ marginTop: 10 }}>
        <button
          type="button"
          onClick={() => setShowTable((v) => !v)}
          style={{
            background: "none",
            border: "none",
            color: "#2563EB",
            fontSize: 13,
            fontWeight: 800,
            cursor: "pointer",
            padding: 0,
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
          }}
          data-testid="btn-toggle-trait-table"
        >
          {showTable ? "Ẩn dạng bảng ▲" : "Xem dạng bảng ▼"}
        </button>

        {showTable && (
          <div style={{ overflowX: "auto", marginTop: 8 }}>
            <table
              className="heatmap-table"
              style={{ border: "1px solid #E2E8F0" }}
              data-testid="table-trait-details"
            >
              <thead>
                <tr style={{ background: "#F8FAFC" }}>
                  <th>Phẩm chất</th>
                  {weeksData.map((w) => (
                    <th key={w.label} style={{ textAlign: "center" }}>
                      {w.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {["Kiên nhẫn", "Sáng tạo", "Tập trung", "Tỉ mỉ"].map((tr) => (
                  <tr key={tr}>
                    <td style={{ fontWeight: 700, color: TRAIT_COLORS[tr] }}>
                      {TRAIT_ICONS[tr]} {tr}
                    </td>
                    {weeksData.map((w) => (
                      <td key={w.label} style={{ textAlign: "center" }}>
                        {w.traitCounts[tr] || 0}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 2. MÔN HỌC & BẢN ĐỒ NHIỆT KỸ NĂNG (HEATMAP 8 TUẦN)
 */
/**
 * 2. DÒNG XU HƯỚNG KỸ NĂNG HAY KẸT (PROMPT 23 - PHƯƠNG ÁN 1)
 */
export function SubjectAndSkillHeatmap({
  stats = {},
  childName = "Con",
}) {
  const [selectedSubject, setSelectedSubject] = useState("Toán");
  const [activeTip, setActiveTip] = useState(null);
  const [showTable, setShowTable] = useState(false);

  const WEEKS = ["7/9", "14/9", "21/9", "28/9", "5/10", "12/10", "19/10", "26/10"];

  const MATH_DATA = [
    { name: "Đọc hiểu đề", values: [40, 45, 50, 45, 55, 60, 65, 70] },
    { name: "Chọn phép tính", values: [null, 35, 40, 35, null, null, null, null] },
    { name: "Tính toán", values: [null, null, null, null, null, null, null, null] },
    { name: "Đơn vị", values: [null, null, null, null, null, null, null, null] },
    { name: "Viết lời giải", values: [35, 40, 45, 40, 35, 35, 40, 38] },
    { name: "Kiểm tra lại", values: [50, 55, 45, 50, 45, 50, 55, 52] },
  ];

  const VIETNAMESE_DATA = [
    { name: "Đọc hiểu", values: [30, 35, 40, 35, 40, 45, 40, 42] },
    { name: "Từ vựng", values: [20, 15, 20, 25, 20, 15, 20, 18] },
    { name: "Chính tả", values: [25, 30, 25, 20, 25, 20, 25, 22] },
    { name: "Đặt câu", values: [null, null, null, null, null, null, null, null] },
  ];

  const rawData = selectedSubject === "Tiếng Việt" ? VIETNAMESE_DATA : MATH_DATA;

  const totalRealSessions =
    (stats?.sessionsMom || 0) +
    (stats?.sessionsDad || 0) +
    (Array.isArray(stats?.studyLog) ? stats.studyLog.length : 0);

  const isTrial = isTrialActive();

  // Dưới 3 buổi: hiện 'Gấu cần thêm buổi', không vẽ
  if (!isTrial && totalRealSessions < 3) {
    return (
      <div className="card-km" style={{ textAlign: "center", padding: "20px 16px" }} data-testid="subject-skill-heatmap-empty">
        <div style={{ fontSize: 32, marginBottom: 6 }}>📊 🐻</div>
        <b style={{ fontSize: 15, color: "var(--c-text)" }}>Gấu cần thêm {Math.max(1, 3 - totalRealSessions)} buổi học</b>
        <p className="xs" style={{ margin: "6px 0 0", color: "var(--c-sub, #6E5D4E)" }}>
          Sau khi {childName} hoàn thành ít nhất 3 buổi học, Gấu sẽ vẽ dòng xu hướng kỹ năng hay kẹt 8 tuần tại đây.
        </p>
      </div>
    );
  }

  // Tìm tuần gần nhất có bài
  const getLatestIdx = (arr) => {
    for (let i = arr.length - 1; i >= 0; i--) {
      if (arr[i] != null) return i;
    }
    return -1;
  };

  const processedRows = rawData.map((row) => {
    const li = getLatestIdx(row.values);
    return { ...row, li };
  });

  const hasDataRows = processedRows
    .filter((r) => r.li >= 0)
    .sort((a, b) => b.values[b.li] - a.values[a.li]);

  const noDataRows = processedRows.filter((r) => r.li < 0);

  // Kỹ năng đầu tiên kẹt nhiều nhất
  const topSkill = hasDataRows[0];
  const insightText = topSkill
    ? `${topSkill.name} tuần này kẹt ${topSkill.values[topSkill.li]}%, cao nhất trong 8 tuần, trùng tuần làm nhiều bài dạng mới.`
    : "Hiện tại các kỹ năng đều ổn định.";

  // Hàm vẽ sparkline SVG
  const renderSparkline = (values, li) => {
    const w = 112;
    const h = 34;
    const x = (i) => 4 + (i * (w - 8)) / (values.length - 1);
    const y = (v) => h - 4 - ((Math.max(20, Math.min(80, v)) - 20) / 60) * (h - 8);

    const segs = [];
    let cur = [];
    const gaps = [];
    let prev = null;

    values.forEach((v, i) => {
      if (v == null) {
        if (cur.length) segs.push(cur);
        cur = [];
        return;
      }
      if (prev != null && prev.i !== i - 1) {
        gaps.push([prev, { i, v }]);
      }
      cur.push({ i, v });
      prev = { i, v };
    });
    if (cur.length) segs.push(cur);

    return (
      <svg className="sp-svg" viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Xu hướng 8 tuần">
        <line className="base" x1="0" x2={w} y1={y(50)} y2={y(50)} />
        {gaps.map(([p, q], gi) => (
          <path key={`g-${gi}`} className="gap" d={`M${x(p.i)} ${y(p.v)} L${x(q.i)} ${y(q.v)}`} />
        ))}
        {segs.map((s, si) =>
          s.length > 1 ? (
            <path
              key={`s-${si}`}
              className="l"
              d={`M${s.map((p) => `${x(p.i)} ${y(p.v)}`).join(' L')}`}
            />
          ) : null
        )}
        {values.map((v, i) =>
          v == null ? null : (
            <circle
              key={`c-${i}`}
              className={i === li ? 'last' : 'pt'}
              cx={x(i)}
              cy={y(v)}
              r={i === li ? 3.5 : 2.2}
            />
          )
        )}
        {values.map((v, i) => (
          <rect
            key={`h-${i}`}
            className="hit"
            x={x(i) - 7}
            y="0"
            width="14"
            height={h}
            onMouseEnter={() =>
              setActiveTip(`${WEEKS[i]}: ${v == null ? 'chưa có bài' : v + '% buổi kẹt'}`)
            }
            onMouseLeave={() => setActiveTip(null)}
            onClick={() =>
              setActiveTip(`${WEEKS[i]}: ${v == null ? 'chưa có bài' : v + '% buổi kẹt'}`)
            }
          />
        ))}
      </svg>
    );
  };

  return (
    <div className="rc-trend" data-testid="subject-skill-heatmap">
      <div className="rc-h">
        <b>Kỹ năng hay kẹt · {selectedSubject}</b>
        <div style={{ display: "inline-flex", gap: 4 }}>
          {["Toán", "Tiếng Việt"].map((subj) => (
            <button
              key={subj}
              type="button"
              className={`btn-km btn-km-s ${selectedSubject === subj ? 'btn-km-primary' : 'btn-km-secondary'}`}
              style={{ minHeight: 28, padding: "0 10px", fontSize: 11.5 }}
              onClick={() => setSelectedSubject(subj)}
            >
              {subj}
            </button>
          ))}
        </div>
      </div>
      <div className="rc-sub">
        Tỉ lệ buổi có bậc kẹt theo kỹ năng. Càng cao càng hay kẹt. Vạch chấm giữa là mức 50%.
      </div>

      {activeTip && (
        <div
          style={{
            background: "var(--c-text, #1E293B)",
            color: "#fff",
            padding: "4px 8px",
            borderRadius: 8,
            fontSize: 11,
            fontWeight: 800,
            marginBottom: 6,
            display: "inline-block",
          }}
        >
          {activeTip}
        </div>
      )}

      {hasDataRows.map((r, k) => {
        const v = r.values[r.li];
        const prevValues = r.values.slice(0, r.li).filter((x) => x != null);
        const pv = prevValues.length ? prevValues[prevValues.length - 1] : null;
        const recent = r.li === WEEKS.length - 1;
        const delta = pv == null ? null : v - pv;

        return (
          <div key={r.name} className={`sk-row ${k === 0 && recent ? 'top' : ''}`}>
            <div className="sk-nm">
              {r.name}
              {!recent && <small>{prevValues.length + 1} tuần có bài</small>}
            </div>
            {renderSparkline(r.values, r.li)}
            <div className="sk-v">
              <b>{v}%</b>
              {!recent ? (
                <span className="ch-delta eq">tuần {WEEKS[r.li]}</span>
              ) : delta == null ? null : delta > 0 ? (
                <span className="ch-delta up">▲ {delta} điểm</span>
              ) : delta < 0 ? (
                <span className="ch-delta down">▼ {-delta} điểm</span>
              ) : (
                <span className="ch-delta eq">giữ nguyên</span>
              )}
            </div>
          </div>
        );
      })}

      {noDataRows.length > 0 && (
        <div className="sk-nod">
          Chưa có bài luyện: <b>{noDataRows.map((r) => r.name).join(', ')}</b>
        </div>
      )}

      <div className="sk-foot">
        <span>Chạm vào đường để xem tuần</span>
        <button
          type="button"
          className="btn-km-ghost"
          style={{ fontSize: 11.5, fontWeight: 800, color: "var(--c-primary)", background: "none", border: "none", cursor: "pointer" }}
          onClick={() => setShowTable(!showTable)}
        >
          {showTable ? "Ẩn bảng số liệu ▴" : "Xem dạng bảng ▾"}
        </button>
      </div>

      {showTable && (
        <div style={{ overflowX: "auto", marginTop: 6 }}>
          <table className="tv-table">
            <thead>
              <tr>
                <th>Kỹ năng</th>
                {WEEKS.map((w) => (
                  <th key={w}>{w}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rawData.map((r) => (
                <tr key={r.name}>
                  <td>{r.name}</td>
                  {r.values.map((v, idx) => (
                    <td key={idx}>{v == null ? '·' : `${v}%`}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Thẻ GẤU THẤY (do code tạo, đồng bộ với dòng đầu tiên) */}
      <div className="card-km card-km-note" style={{ marginTop: 12 }} data-testid="card-bear-insight">
        <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: '.05em', color: 'var(--c-primary)', marginBottom: 2 }}>
          GẤU THẤY
        </div>
        <p style={{ fontSize: 13, color: 'var(--c-text)', fontWeight: 700, margin: 0 }}>
          {insightText}
        </p>
      </div>
    </div>
  );
}

export function TraitAiAnalysisCard({
  child = { name: "Con", id: "c1" },
  stats = {},
}) {
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [notEnough, setNotEnough] = useState(null);
  const [showDataModal, setShowDataModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const momSessions = stats?.sessionsMom || 0;
  const dadSessions = stats?.sessionsDad || 0;
  const totalSessions = (stats?.sessionsMom != null || stats?.sessionsDad != null)
    ? (momSessions + dadSessions)
    : (Array.isArray(stats?.studyLog) ? stats.studyLog.length : 0);

  // Hàm sinh câu tóm tắt bằng code logic, không bao giờ nhầm chiều (Prompt 22 - 0.1)
  const computeTomTat = (w1, w2) => {
    const list = ["Kiên nhẫn", "Sáng tạo", "Tập trung", "Tỉ mỉ"];
    const diffs = [];
    for (const t of list) {
      const v1 = w1?.[t] || 0;
      const v2 = w2?.[t] || 0;
      if (v1 !== v2) {
        if (v2 > v1) {
          diffs.push(`${t} tăng từ ${v1} lên ${v2}`);
        } else {
          diffs.push(`${t} giảm từ ${v1} xuống ${v2}`);
        }
      }
    }
    if (diffs.length === 0) return "Các phẩm chất giữ mức ổn định qua 2 tuần.";
    return diffs.slice(0, 2).join(", ") + ".";
  };

  const runAnalysis = async () => {
    setLoading(true);
    setErrorMsg(null);
    setNotEnough(null);

    const isTrial = isTrialActive();

    // Tài khoản thật dưới 3 buổi: KHÔNG gọi AI, hiện thẻ cần thêm buổi (Prompt 22 - 0.1)
    if (!isTrial && totalSessions < 3) {
      setNotEnough(`Gấu cần thêm ${Math.max(1, 3 - totalSessions)} buổi học của ${child.name} để phân tích nguyên nhân.`);
      setLoading(false);
      return;
    }

    try {
      const res = await fetchAiTraitAnalysis({
        childId: child.id,
        childName: child.name,
        options: isTrial ? {
          week1_sessions: 4,
          week2_sessions: 5,
        } : {
          week1_sessions: Math.floor(totalSessions / 2),
          week2_sessions: Math.ceil(totalSessions / 2),
          total_sessions: totalSessions,
        },
      });

      if (!res || res.ok === false) {
        if (res?.error?.code === "NOT_ENOUGH_DATA") {
          setNotEnough(res.error.message);
        } else {
          setErrorMsg(res?.error?.message || "Lỗi kiểm định dữ kiện, vui lòng thử lại.");
        }
      } else {
        setAnalysisResult(res);
      }
    } catch (e) {
      setErrorMsg("Không thể kết nối dịch vụ phân tích AI.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runAnalysis();
  }, [child.id, totalSessions]);

  if (notEnough) {
    return (
      <div className="card" style={{ border: "1.5px dashed #CBD5E1", background: "#F8FAFC" }} data-testid="trait-ai-not-enough">
        <span className="lbl plum">AI tìm nguyên nhân</span>
        <p className="xs" style={{ color: "#64748B", margin: "6px 0" }}>
          {notEnough}
        </p>
      </div>
    );
  }

  const ana = analysisResult?.analysis;

  return (
    <div className="card ana" data-testid="card-trait-ai-analysis">
      <div className="kk ink">GẤU PHÂN TÍCH 2 TUẦN GẦN NHẤT</div>
      <p className="src">
        🐻 Gấu đã đọc {analysisResult?.sessions_read || totalSessions} buổi{analysisResult?.from_date ? `, từ ${analysisResult.from_date} đến ${analysisResult.to_date}` : ""}
      </p>

      {/* Tóm tắt biến động bằng code logic */}
      <p className="sm" style={{ color: "var(--c-text)", margin: "4px 0" }}>
        <b>{computeTomTat(analysisResult?.facts?.traits_w1, analysisResult?.facts?.traits_w2) || ana?.tom_tat || "Các phẩm chất giữ mức ổn định."}</b>
      </p>

      {/* Căn cứ */}
      <div className="kk ink" style={{ marginTop: 6 }}>CĂN CỨ</div>
      <ul className="ev">
        {(ana?.nhan_dinh || []).map((nd, idx) => (
          <li key={idx}>
            <b>{nd.can_cu?.[0] || nd.y}</b>
          </li>
        ))}
      </ul>

      {/* Lộ trình 7 ngày cân bằng */}
      <div className="kk ink" style={{ marginTop: 6 }}>LỘ TRÌNH 7 NGÀY CÂN BẰNG</div>
      <ol className="sm" style={{ color: "var(--c-text)", paddingLeft: 18, margin: "4px 0" }}>
        {(ana?.lo_trinh_7_ngay || []).map((step, idx) => (
          <li key={idx} style={{ marginBottom: 4 }}>
            {step}
          </li>
        ))}
      </ol>

      {/* Footer link và khuyến cáo */}
      <div className="ana-f">
        <span
          className="lnk"
          onClick={() => setShowDataModal(true)}
          data-testid="link-view-ai-facts"
        >
          Xem dữ liệu Gấu đã đọc ›
        </span>
        <span className="xs">Đây là gợi ý, mẹ quyết định</span>
      </div>

      {/* Modal dữ liệu Gấu đã đọc */}
      {showDataModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 99,
            display: "grid",
            placeItems: "center",
            padding: 16,
          }}
          onClick={() => setShowDataModal(false)}
        >
          <div
            className="card"
            style={{ maxWidth: 400, width: "100%", background: "#fff", maxHeight: "80vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <b style={{ fontSize: 16 }}>Dữ liệu 2 tuần Gấu đã đọc</b>
              <button
                type="button"
                onClick={() => setShowDataModal(false)}
                style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer" }}
              >
                ✕
              </button>
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.6 }}>
              <p style={{ marginBottom: 8 }}>
                Tổng số buổi học: <b>{analysisResult?.facts?.total_sessions || analysisResult?.sessions_read || totalSessions} buổi</b>
                {analysisResult?.from_date ? ` (từ ${analysisResult.from_date} đến ${analysisResult.to_date})` : ""}
              </p>
              
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, marginBottom: 10 }}>
                <thead>
                  <tr style={{ borderBottom: "1.5px solid var(--c-line, #EADFCF)", textAlign: "left" }}>
                    <th style={{ padding: "6px 4px" }}>Chỉ số</th>
                    <th style={{ padding: "6px 4px", textAlign: "right" }}>Tuần trước</th>
                    <th style={{ padding: "6px 4px", textAlign: "right" }}>Tuần này</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Kiên nhẫn", analysisResult?.facts?.traits_w1?.["Kiên nhẫn"] ?? 0, analysisResult?.facts?.traits_w2?.["Kiên nhẫn"] ?? 0],
                    ["Sáng tạo", analysisResult?.facts?.traits_w1?.["Sáng tạo"] ?? 0, analysisResult?.facts?.traits_w2?.["Sáng tạo"] ?? 0],
                    ["Tập trung", analysisResult?.facts?.traits_w1?.["Tập trung"] ?? 0, analysisResult?.facts?.traits_w2?.["Tập trung"] ?? 0],
                    ["Tỉ mỉ", analysisResult?.facts?.traits_w1?.["Tỉ mỉ"] ?? 0, analysisResult?.facts?.traits_w2?.["Tỉ mỉ"] ?? 0],
                    ["Trò chơi 5p", analysisResult?.facts?.games_w1 ?? 0, analysisResult?.facts?.games_w2 ?? 0],
                    ["Thời lượng TB", `${analysisResult?.facts?.avg_mins_w1 ?? 0}p`, `${analysisResult?.facts?.avg_mins_w2 ?? 0}p`],
                  ].map(([label, w1, w2]) => (
                    <tr key={label} style={{ borderBottom: "1px solid var(--c-line, #EADFCF)" }}>
                      <td style={{ padding: "5px 4px", fontWeight: 700 }}>{label}</td>
                      <td style={{ padding: "5px 4px", textAlign: "right", color: "var(--c-sub, #6E5D4E)" }}>{w1}</td>
                      <td style={{ padding: "5px 4px", textAlign: "right", fontWeight: 800 }}>{w2}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {analysisResult?.facts?.top_problem_type && (
                <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--c-sub, #6E5D4E)" }}>
                  • Bài lặp dạng: {analysisResult.facts.top_problem_type_w2_count}/{analysisResult.facts.total_sessions} bài là {analysisResult.facts.top_problem_type}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
