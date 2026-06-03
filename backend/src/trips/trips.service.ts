export type TripStatus = 
  'requested' | 'accepted' | 'driver_arrived' | 'waiting' | 
  'in_progress' | 'completed' | 'cancelled' | 
  'customer_no_show' | 'driver_no_show';

export interface Trip {
  id: string;
  customerId: string;
  driverId?: string;
  pickupLocation: string;
  dropoffLocation: string;
  status: TripStatus;
  fare?: number;
  deposit: number;
  waitingFee: number;
  arrivedAt?: Date;
  waitingMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}

export const trips: Trip[] = [];

const DEPOSIT_AMOUNT = 200; // 200 DJF booking deposit
const FREE_WAITING_MINUTES = 5; // 5 minutes free waiting
const WAITING_FEE_PER_MINUTE = 50; // 50 DJF per minute after free period

export const requestTrip = (customerId: string, pickupLocation: string, dropoffLocation: string) => {
  const trip: Trip = {
    id: Math.random().toString(36).substr(2, 9),
    customerId,
    pickupLocation,
    dropoffLocation,
    status: 'requested',
    deposit: DEPOSIT_AMOUNT,
    waitingFee: 0,
    waitingMinutes: 0,
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

export const driverArrived = (tripId: string, driverId: string) => {
  const trip = trips.find(t => t.id === tripId);
  if (!trip) throw new Error('Trip not found');
  if (trip.driverId !== driverId) throw new Error('Not authorized');
  if (trip.status !== 'accepted') throw new Error('Trip not accepted');
  trip.status = 'driver_arrived';
  trip.arrivedAt = new Date();
  trip.updatedAt = new Date();
  return {
    trip,
    message: `Driver arrived! Customer has ${FREE_WAITING_MINUTES} minutes free waiting time.`
  };
};

export const calculateWaitingFee = (arrivedAt: Date) => {
  const now = new Date();
  const minutesWaited = Math.floor((now.getTime() - arrivedAt.getTime()) / 60000);
  const chargeableMinutes = Math.max(0, minutesWaited - FREE_WAITING_MINUTES);
  const fee = chargeableMinutes * WAITING_FEE_PER_MINUTE;
  return { minutesWaited, chargeableMinutes, fee };
};

export const startTrip = (tripId: string, driverId: string) => {
  const trip = trips.find(t => t.id === tripId);
  if (!trip) throw new Error('Trip not found');
  if (trip.driverId !== driverId) throw new Error('Not authorized');
  if (trip.status !== 'driver_arrived') throw new Error('Driver must mark arrival first');
  
  let waitingFee = 0;
  let waitingMinutes = 0;
  
  if (trip.arrivedAt) {
    const waiting = calculateWaitingFee(trip.arrivedAt);
    waitingFee = waiting.fee;
    waitingMinutes = waiting.minutesWaited;
  }

  trip.status = 'in_progress';
  trip.waitingFee = waitingFee;
  trip.waitingMinutes = waitingMinutes;
  trip.updatedAt = new Date();
  return { trip, waitingFee, waitingMinutes };
};

export const completeTrip = (tripId: string, driverId: string, baseFare: number) => {
  const trip = trips.find(t => t.id === tripId);
  if (!trip) throw new Error('Trip not found');
  if (trip.driverId !== driverId) throw new Error('Not authorized');
  if (trip.status !== 'in_progress') throw new Error('Trip not in progress');
  
  const totalFare = baseFare + trip.waitingFee;
  const remainingAmount = Math.max(0, totalFare - trip.deposit);
  
  trip.status = 'completed';
  trip.fare = totalFare;
  trip.updatedAt = new Date();
  
  return {
    trip,
    summary: {
      baseFare,
      waitingFee: trip.waitingFee,
      waitingMinutes: trip.waitingMinutes,
      deposit: trip.deposit,
      totalFare,
      remainingAmount,
      message: `Customer pays ${remainingAmount} DJF on arrival (deposit of ${trip.deposit} DJF already paid)`
    }
  };
};

export const customerNoShow = (tripId: string, driverId: string) => {
  const trip = trips.find(t => t.id === tripId);
  if (!trip) throw new Error('Trip not found');
  if (trip.driverId !== driverId) throw new Error('Not authorized');
  if (trip.status !== 'driver_arrived') throw new Error('Driver must have arrived first');
  
  if (trip.arrivedAt) {
    const minutesWaited = Math.floor((new Date().getTime() - trip.arrivedAt.getTime()) / 60000);
    if (minutesWaited < FREE_WAITING_MINUTES) {
      throw new Error(`Please wait ${FREE_WAITING_MINUTES - minutesWaited} more minutes before marking no-show`);
    }
  }

  trip.status = 'customer_no_show';
  trip.updatedAt = new Date();
  return {
    trip,
    message: `Customer no-show confirmed. Deposit of ${trip.deposit} DJF transferred to driver as compensation.`
  };
};

export const driverNoShow = (tripId: string, customerId: string) => {
  const trip = trips.find(t => t.id === tripId);
  if (!trip) throw new Error('Trip not found');
  if (trip.customerId !== customerId) throw new Error('Not authorized');
  if (!['accepted', 'requested'].includes(trip.status)) throw new Error('Cannot report no-show at this stage');
  
  const minutesSinceRequest = Math.floor((new Date().getTime() - trip.createdAt.getTime()) / 60000);
  if (minutesSinceRequest < 10) {
    throw new Error(`Please wait 10 minutes before reporting driver no-show. ${10 - minutesSinceRequest} minutes remaining.`);
  }

  trip.status = 'driver_no_show';
  trip.updatedAt = new Date();
  return {
    trip,
    message: `Driver no-show confirmed. Your deposit of ${trip.deposit} DJF will be fully refunded.`
  };
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