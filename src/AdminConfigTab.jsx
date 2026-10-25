import { useState } from 'react'
import PromptStudioTab from './PromptStudioTab'
import { AdminScopeSection } from './AdminScopeSection'
import RouterPage from './admin/RouterPage'
import { AdminThemesSection } from './AdminThemesSection'
import ModelParamsPage from './admin/ModelParamsPage'
import AdminsPinPage from './admin/AdminsPinPage'
import AuditLogPage from './admin/AuditLogPage'
import InfraErrorsPage from './admin/InfraErrorsPage'
import ZaloPage from './admin/ZaloPage'
import './admin/pages-system.css'

/**
 * Cấu hình AI & hệ thống của admin (Đợt 15 · Chặng 3)
 * Trang con do khung admin chọn qua activeSubTab. hideSubNav: khung mới tự điều hướng bằng thanh bên,
 * tệp này không vẽ thanh tab con riêng (giữ prop để tương thích).
 */
export function AdminConfigTab({ token, adminProfile, activeSubTab: propSubTab, onSubTabChange, hideSubNav = false }) {
  const [localSubTab, setLocalSubTab] = useState('model')
  const activeSubTab = propSubTab || localSubTab
  const setActiveSubTab = onSubTabChange || setLocalSubTab

  return (
    <div className="stitch-config-container">

      {/* Subtab 1: Model & Params */}
      {activeSubTab === 'model' && (
        <div className="stitch-subtab-content">
          <ModelParamsPage adminProfile={adminProfile} />
        </div>
      )}

      {/* Subtab 2: Prompt Studio */}
      {activeSubTab === 'prompts' && (
        <div className="stitch-subtab-content">
          <PromptStudioTab />
        </div>
      )}

      {/* Subtab 3: Pedagogical Router (Đợt 15: tách ra src/admin/RouterPage.jsx) */}
      {activeSubTab === 'router' && (
        <div className="stitch-subtab-content">
          <RouterPage />
        </div>
      )}

      {/* Subtab 4: Scope Rules */}
      {activeSubTab === 'scope' && (
        <div className="stitch-subtab-content">
          <AdminScopeSection adminKey={token} />
        </div>
      )}

      {/* Subtab 5: Themes */}
      {activeSubTab === 'themes' && (
        <div className="stitch-subtab-content">
          <AdminThemesSection token={token} adminProfile={adminProfile} />
        </div>
      )}

      {/* Subtab 6: Admin Users & PIN */}
      {activeSubTab === 'admins' && (
        <div className="stitch-subtab-content">
          <AdminsPinPage adminProfile={adminProfile} />
        </div>
      )}

      {/* Subtab 7: Audit Logs */}
      {activeSubTab === 'audit' && (
        <div className="stitch-subtab-content">
          <AuditLogPage />
        </div>
      )}

      {/* Subtab 8: Hạ tầng & lỗi */}
      {activeSubTab === 'infra' && (
        <div className="stitch-subtab-content">
          <InfraErrorsPage />
        </div>
      )}

      {/* Subtab 9: Thông báo & Zalo */}
      {activeSubTab === 'zalo' && (
        <div className="stitch-subtab-content">
          <ZaloPage />
        </div>
      )}
    </div>
  )
}

export default AdminConfigTab
