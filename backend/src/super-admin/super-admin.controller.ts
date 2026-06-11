import { Response } from 'express';
import { AuthRequest, auditLog } from '../auth/auth.middleware';
import {
  createStaffAccount, getAllStaff, deactivateStaff, changeStaffRole,
  getAppSettings, updateAppSetting, getAuditLog, getFinancialReport, setupSuperAdmin,
} from './super-admin.service';

export const handleSetupSuperAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, secret } = req.body;
    const account = await setupSuperAdmin({ name, email, password, secret });
    return res.status(201).json({ message: 'Super admin créé.', account });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
};

export const handleCreateStaff = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, role } = req.body;
    if (!['admin', 'agent'].includes(role))
      return res.status(400).json({ error: 'Rôle invalide. Utilisez admin ou agent.' });
    const staff = await createStaffAccount({ name, email, password, role });
    await auditLog(req.user!.id, req.user!.role, `CREATE_${role.toUpperCase()}`,
      'user', staff.id, { email }, String(req.ip || ''));
    return res.status(201).json({ staff });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
};

export const handleGetStaff = async (req: AuthRequest, res: Response) => {
  try {
    return res.json({ staff: await getAllStaff() });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const handleDeactivateStaff = async (req: AuthRequest, res: Response) => {
  try {
    await deactivateStaff(String(req.params.id), req.user!.role);
    await auditLog(req.user!.id, req.user!.role, 'DEACTIVATE_STAFF',
      'user', String(req.params.id), {}, String(req.ip || ''));
    return res.json({ message: 'Compte désactivé.' });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
};

export const handleChangeRole = async (req: AuthRequest, res: Response) => {
  try {
    const { role } = req.body;
    const updated = await changeStaffRole(String(req.params.id), role);
    await auditLog(req.user!.id, req.user!.role, 'CHANGE_ROLE',
      'user', String(req.params.id), { newRole: role }, String(req.ip || ''));
    return res.json({ staff: updated });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
};

export const handleGetSettings = async (req: AuthRequest, res: Response) => {
  try {
    return res.json({ settings: await getAppSettings() });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const handleUpdateSetting = async (req: AuthRequest, res: Response) => {
  try {
    const { value } = req.body;
    const setting = await updateAppSetting(String(req.params.key), value, req.user!.id);
    await auditLog(req.user!.id, req.user!.role, 'UPDATE_SETTING',
      'setting', String(req.params.key), { value }, String(req.ip || ''));
    return res.json({ setting });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
};

export const handleGetAuditLog = async (req: AuthRequest, res: Response) => {
  try {
    const limit  = parseInt(req.query.limit  as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;
    return res.json({ logs: await getAuditLog(limit, offset) });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const handleGetFinancials = async (req: AuthRequest, res: Response) => {
  try {
    return res.json(await getFinancialReport());
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
