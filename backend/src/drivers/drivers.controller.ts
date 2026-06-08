import { Response } from 'express';
import { AuthRequest } from '../auth/auth.middleware';
import {
  registerDriver,
  getAllDrivers,
  getDriverById,
  getDriverByUserId,
  getDriverStats,
  approveDriver,
  rejectDriver,
  toggleDriverOnline
} from './drivers.service';
import { getUserById } from '../auth/auth.service';

export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { phone, licenseNumber, vehicleModel, vehiclePlate } = req.body;
    if (!phone || !licenseNumber || !vehicleModel || !vehiclePlate) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const user = await getUserById(req.user!.id);
    const driver = await registerDriver({
      userId: req.user!.id,
      name: user.name,
      email: req.user!.email,
      phone,
      licenseNumber,
      vehicleModel,
      vehiclePlate
    });
    return res.status(201).json({ message: 'Driver registered, pending approval', driver });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const driver = await getDriverByUserId(req.user!.id);
    if (!driver) {
      return res.status(404).json({ message: 'Driver profile not found' });
    }
    return res.status(200).json(driver);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const getMyStats = async (req: AuthRequest, res: Response) => {
  try {
    const stats = await getDriverStats(req.user!.id);
    return res.status(200).json(stats);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const getDrivers = async (req: AuthRequest, res: Response) => {
  try {
    const driverList = await getAllDrivers();
    return res.status(200).json(driverList);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const getDriver = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const driver = await getDriverById(id);
    return res.status(200).json(driver);
  } catch (error: any) {
    return res.status(404).json({ message: error.message });
  }
};

export const approve = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const driver = await approveDriver(id);
    return res.status(200).json({ message: 'Driver approved', driver });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const reject = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const driver = await rejectDriver(id);
    return res.status(200).json({ message: 'Driver rejected', driver });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const toggleOnline = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const driver = await toggleDriverOnline(id);
    return res.status(200).json({ message: `Driver is now ${driver.is_online ? 'online' : 'offline'}`, driver });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};
