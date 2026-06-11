import { Router } from 'express';
import { protect, requireSuperAdmin, requireAdmin } from '../auth/auth.middleware';
import {
  handleSetupSuperAdmin, handleCreateStaff, handleGetStaff,
  handleDeactivateStaff, handleChangeRole, handleGetSettings,
  handleUpdateSetting, handleGetAuditLog, handleGetFinancials,
} from './super-admin.controller';

const router = Router();

// One-time super admin bootstrap — no auth, protected by SUPER_ADMIN_SECRET
router.post('/setup', handleSetupSuperAdmin);

// Staff management — super_admin only
router.post  ('/staff',          protect, requireSuperAdmin, handleCreateStaff);
router.get   ('/staff',          protect, requireAdmin,      handleGetStaff);
router.delete('/staff/:id',      protect, requireSuperAdmin, handleDeactivateStaff);
router.put   ('/staff/:id/role', protect, requireSuperAdmin, handleChangeRole);

// App settings — super_admin only
router.get('/settings',          protect, requireSuperAdmin, handleGetSettings);
router.put('/settings/:key',     protect, requireSuperAdmin, handleUpdateSetting);

// Audit log — super_admin only
router.get('/audit',             protect, requireSuperAdmin, handleGetAuditLog);

// Financial report — super_admin + admin
router.get('/financials',        protect, requireAdmin,      handleGetFinancials);

export default router;
