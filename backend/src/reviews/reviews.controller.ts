import { Response } from 'express';
import { AuthRequest } from '../auth/auth.middleware';
import {
  createReview,
  getDriverReviews,
  getDriverAverageRating,
  getAllReviews
} from './reviews.service';

export const addReview = async (req: AuthRequest, res: Response) => {
  try {
    const { tripId, driverId, rating, comment } = req.body;
    if (!tripId || !driverId || !rating) {
      return res.status(400).json({ message: 'tripId, driverId and rating are required' });
    }
    const review = await createReview(tripId, req.user!.id, driverId, rating, comment || '');
    return res.status(201).json({ message: 'Review added successfully', review });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const getReviewsByDriver = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const driverReviews = await getDriverReviews(id);
    const average = await getDriverAverageRating(id);
    return res.status(200).json({ reviews: driverReviews, averageRating: average });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const getReviews = async (req: AuthRequest, res: Response) => {
  try {
    const allReviews = await getAllReviews();
    return res.status(200).json(allReviews);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};