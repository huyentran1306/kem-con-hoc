/**
 * Công cụ nội bộ của admin (Đợt 15 · Chặng 3)
 * - sql: D1 SQL Studio, chỉ superadmin, chạy qua POST /api/v1/admin/sql
 * - team_prompts: chỉ có trong bản build có VITE_DEV_TOOLS=1 (bản production không kèm mã công cụ này)
 * hideSubNav: khung admin mới tự điều hướng bằng thanh bên, trang này không vẽ thanh tab con riêng.
 */
import { Suspense, lazy, useState } from 'react'
import { EmptyState, PageHeader } from './ui/staff'
import SqlStudioPage from './admin/SqlStudioPage'

const DEV_TOOLS = import.meta.env?.VITE_DEV_TOOLS === '1'
const TeamPromptSyncTab = import.meta.env?.VITE_DEV_TOOLS === '1' ? lazy(() => import('./TeamPromptSyncTab')) : null

export function AdminToolsTab({ token, adminProfile, activeSubTab: propSubTab, onSubTabChange, hideSubNav = false }) {
  const [localSubTool] = useState('sql')
  const subTool = propSubTab || localSubTool

  if (subTool === 'team_prompts') {
    if (!DEV_TOOLS || !TeamPromptSyncTab) {
      return (
        <div className="sys-page">
          <PageHeader title="Team Prompts Sync" description="Công cụ của đội phát triển." />
          <EmptyState
            title="Công cụ này không có trong bản chính thức"
            description="Chỉ bật khi chạy bản dành cho đội phát triển (VITE_DEV_TOOLS=1)."
          />
        </div>
      )
    }
    return (
      <Suspense fallback={<div className="sk-table-empty">Đang tải…</div>}>
        <TeamPromptSyncTab />
      </Suspense>
    )
  }

  return <SqlStudioPage adminProfile={adminProfile} />
}

export default AdminToolsTab
