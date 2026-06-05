import { Response } from 'express';
import { AuthRequest } from '../auth/auth.middleware';
import {
  requestTrip,
  acceptTrip,
  driverArrived,
  startTrip,
  completeTrip,
  customerNoShow,
  driverNoShow,
  cancelTrip,
  getTrips,
  getTripById,
  getTripsByCustomer,
  getTripsByDriver
} from './trips.service';

export const request = async (req: AuthRequest, res: Response) => {
  try {
    const { pickupLocation, dropoffLocation } = req.body;
    if (!pickupLocation || !dropoffLocation) {
      return res.status(400).json({ message: 'Pickup and dropoff locations are required' });
    }
    const trip = await requestTrip(req.user!.id, pickupLocation, dropoffLocation);
    return res.status(201).json({
      message: 'Trip requested successfully',
      trip,
      notice: `A deposit of ${trip.deposit} DJF will be charged`
    });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const accept = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const trip = await acceptTrip(id, req.user!.id);
    return res.status(200).json({ message: 'Trip accepted', trip });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const arrived = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const result = await driverArrived(id, req.user!.id);
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const start = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const result = await startTrip(id, req.user!.id);
    return res.status(200).json({ message: 'Trip started', ...result });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const complete = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { baseFare } = req.body;
    if (!baseFare) {
      return res.status(400).json({ message: 'Base fare is required' });
    }
    const result = await completeTrip(id, req.user!.id, baseFare);
    return res.status(200).json({ message: 'Trip completed', ...result });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const reportCustomerNoShow = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const result = await customerNoShow(id, req.user!.id);
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const reportDriverNoShow = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const result = await driverNoShow(id, req.user!.id);
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const cancel = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const trip = await cancelTrip(id, req.user!.id);
    return res.status(200).json({ message: 'Trip cancelled', trip });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const getAllTrips = async (req: AuthRequest, res: Response) => {
  try {
    const allTrips = await getTrips();
    return res.status(200).json(allTrips);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const getTrip = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const trip = await getTripById(id);
    return res.status(200).json(trip);
  } catch (error: any) {
    return res.status(404).json({ message: error.message });
  }
};

export const myTrips = async (req: AuthRequest, res: Response) => {
  try {
    const role = req.user!.role;
    const id = req.user!.id;
    const result = role === 'driver' ? await getTripsByDriver(id) : await getTripsByCustomer(id);
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};