import { Response } from 'express';
import { AuthRequest } from '../auth/auth.middleware';
import { users } from '../auth/auth.service';
import {
  registerDriver,
  getAllDrivers,
  getDriverById,
  approveDriver,
  rejectDriver,
  toggleDriverOnline
} from './drivers.service';

export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { phone, licenseNumber, vehicleModel, vehiclePlate } = req.body;
    if (!phone || !licenseNumber || !vehicleModel || !vehiclePlate) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const currentUser = users.find(u => u.id === req.user!.id);
    if (!currentUser) return res.status(404).json({ message: 'User not found' });
    const driver = registerDriver({
      userId: req.user!.id,
      name: currentUser.name,
      email: currentUser.email,
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

export const getDrivers = async (req: AuthRequest, res: Response) => {
  try {
    const driverList = getAllDrivers();
    return res.status(200).json(driverList);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const getDriver = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const driver = getDriverById(id);
    return res.status(200).json(driver);
  } catch (error: any) {
    return res.status(404).json({ message: error.message });
  }
};

export const approve = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const driver = approveDriver(id);
    return res.status(200).json({ message: 'Driver approved', driver });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const reject = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const driver = rejectDriver(id);
    return res.status(200).json({ message: 'Driver rejected', driver });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const toggleOnline = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const driver = toggleDriverOnline(id);
    return res.status(200).json({ message: `Driver is now ${driver.isOnline ? 'online' : 'offline'}`, driver });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};