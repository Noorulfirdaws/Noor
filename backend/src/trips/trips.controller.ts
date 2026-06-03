import { Response } from 'express';
import { AuthRequest } from '../auth/auth.middleware';
import {
  requestTrip,
  acceptTrip,
  startTrip,
  completeTrip,
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
    const trip = requestTrip(req.user!.id, pickupLocation, dropoffLocation);
    return res.status(201).json({ message: 'Trip requested successfully', trip });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const accept = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const trip = acceptTrip(id, req.user!.id);
    return res.status(200).json({ message: 'Trip accepted', trip });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const start = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const trip = startTrip(id, req.user!.id);
    return res.status(200).json({ message: 'Trip started', trip });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const complete = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const trip = completeTrip(id, req.user!.id);
    return res.status(200).json({ message: 'Trip completed', trip });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const cancel = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const trip = cancelTrip(id, req.user!.id);
    return res.status(200).json({ message: 'Trip cancelled', trip });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const getAllTrips = async (req: AuthRequest, res: Response) => {
  try {
    const allTrips = getTrips();
    return res.status(200).json(allTrips);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const getTrip = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const trip = getTripById(id);
    return res.status(200).json(trip);
  } catch (error: any) {
    return res.status(404).json({ message: error.message });
  }
};

export const myTrips = async (req: AuthRequest, res: Response) => {
  try {
    const role = req.user!.role;
    const id = req.user!.id;
    const result = role === 'driver' ? getTripsByDriver(id) : getTripsByCustomer(id);
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};