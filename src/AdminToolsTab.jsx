/**
 * Công cụ nội bộ của admin (Đợt 15 · Chặng 3, cập nhật Prompt 21)
 * - sql: D1 SQL Studio, chỉ superadmin, chạy qua POST /api/v1/admin/sql
 * - team_prompts: Danh sách prompt cho Team AI xem, copy và chạy
 * hideSubNav: khung admin mới tự điều hướng bằng thanh bên, trang này không vẽ thanh tab con riêng.
 */
import { Suspense, lazy, useState } from 'react'
import SqlStudioPage from './admin/SqlStudioPage'

const TeamPromptSyncTab = lazy(() => import('./TeamPromptSyncTab'))

export function AdminToolsTab({ token, adminProfile, activeSubTab: propSubTab, onSubTabChange, hideSubNav = false }) {
  const [localSubTool] = useState('sql')
  const subTool = propSubTab || localSubTool

  if (subTool === 'team_prompts') {
    return (
      <Suspense fallback={<div className="sk-table-empty">Đang tải danh sách prompt…</div>}>
        <TeamPromptSyncTab />
      </Suspense>
    )
  }

  return <SqlStudioPage adminProfile={adminProfile} />
}

export default AdminToolsTab
