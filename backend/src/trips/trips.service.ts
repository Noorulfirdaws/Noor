export type TripStatus = 'requested' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';

export interface Trip {
  id: string;
  customerId: string;
  driverId?: string;
  pickupLocation: string;
  dropoffLocation: string;
  status: TripStatus;
  fare?: number;
  createdAt: Date;
  updatedAt: Date;
}

export const trips: Trip[] = [];

export const requestTrip = (customerId: string, pickupLocation: string, dropoffLocation: string) => {
  const trip: Trip = {
    id: Math.random().toString(36).substr(2, 9),
    customerId,
    pickupLocation,
    dropoffLocation,
    status: 'requested',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  trips.push(trip);
  return trip;
};

export const acceptTrip = (tripId: string, driverId: string) => {
  const trip = trips.find(t => t.id === tripId);
  if (!trip) throw new Error('Trip not found');
  if (trip.status !== 'requested') throw new Error('Trip is no longer available');
  trip.driverId = driverId;
  trip.status = 'accepted';
  trip.updatedAt = new Date();
  return trip;
};

export const startTrip = (tripId: string, driverId: string) => {
  const trip = trips.find(t => t.id === tripId);
  if (!trip) throw new Error('Trip not found');
  if (trip.driverId !== driverId) throw new Error('Not authorized');
  if (trip.status !== 'accepted') throw new Error('Trip not accepted yet');
  trip.status = 'in_progress';
  trip.updatedAt = new Date();
  return trip;
};

export const completeTrip = (tripId: string, driverId: string) => {
  const trip = trips.find(t => t.id === tripId);
  if (!trip) throw new Error('Trip not found');
  if (trip.driverId !== driverId) throw new Error('Not authorized');
  if (trip.status !== 'in_progress') throw new Error('Trip not in progress');
  trip.status = 'completed';
  trip.fare = Math.floor(Math.random() * 20) + 5;
  trip.updatedAt = new Date();
  return trip;
};

export const cancelTrip = (tripId: string, userId: string) => {
  const trip = trips.find(t => t.id === tripId);
  if (!trip) throw new Error('Trip not found');
  if (trip.customerId !== userId && trip.driverId !== userId) throw new Error('Not authorized');
  const done = trip.status === 'completed' || trip.status === 'cancelled';
  if (done) throw new Error('Cannot cancel this trip');
  trip.status = 'cancelled';
  trip.updatedAt = new Date();
  return trip;
};

export const getTrips = () => trips;

export const getTripById = (tripId: string) => {
  const trip = trips.find(t => t.id === tripId);
  if (!trip) throw new Error('Trip not found');
  return trip;
};

export const getTripsByCustomer = (customerId: string) => {
  return trips.filter(t => t.customerId === customerId);
};

export const getTripsByDriver = (driverId: string) => {
  return trips.filter(t => t.driverId === driverId);
};