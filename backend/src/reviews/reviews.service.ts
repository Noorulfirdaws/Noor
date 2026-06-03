export interface Review {
  id: string;
  tripId: string;
  customerId: string;
  driverId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export const reviews: Review[] = [];

export const createReview = (
  tripId: string,
  customerId: string,
  driverId: string,
  rating: number,
  comment: string
) => {
  if (rating < 1 || rating > 5) throw new Error('Rating must be between 1 and 5');
  const existing = reviews.find(r => r.tripId === tripId && r.customerId === customerId);
  if (existing) throw new Error('You already reviewed this trip');

  const review: Review = {
    id: Math.random().toString(36).substr(2, 9),
    tripId,
    customerId,
    driverId,
    rating,
    comment,
    createdAt: new Date()
  };
  reviews.push(review);
  return review;
};

export const getDriverReviews = (driverId: string) => {
  return reviews.filter(r => r.driverId === driverId);
};

export const getDriverAverageRating = (driverId: string) => {
  const driverReviews = reviews.filter(r => r.driverId === driverId);
  if (driverReviews.length === 0) return 0;
  const total = driverReviews.reduce((sum, r) => sum + r.rating, 0);
  return (total / driverReviews.length).toFixed(1);
};

export const getAllReviews = () => reviews;