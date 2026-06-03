import { users } from '../auth/auth.service';
import { drivers } from '../drivers/drivers.service';
import { trips } from '../trips/trips.service';
import { complaints } from '../complaints/complaints.service';
import { reviews } from '../reviews/reviews.service';

export const getStats = () => {
  const totalUsers = users.length;
  const totalDrivers = drivers.length;
  const approvedDrivers = drivers.filter(d => d.status === 'approved').length;
  const pendingDrivers = drivers.filter(d => d.status === 'pending').length;
  const totalTrips = trips.length;
  const completedTrips = trips.filter(t => t.status === 'completed').length;
  const totalRevenue = trips
    .filter(t => t.status === 'completed' && t.fare)
    .reduce((sum, t) => sum + (t.fare || 0), 0);
  const openComplaints = complaints.filter(c => c.status === 'open').length;
  const totalReviews = reviews.length;

  return {
    users: { total: totalUsers },
    drivers: { total: totalDrivers, approved: approvedDrivers, pending: pendingDrivers },
    trips: { total: totalTrips, completed: completedTrips },
    revenue: { total: totalRevenue },
    complaints: { open: openComplaints, total: complaints.length },
    reviews: { total: totalReviews }
  };
};

export const getPendingDrivers = () => {
  return drivers.filter(d => d.status === 'pending');
};

export const getOpenComplaints = () => {
  return complaints.filter(c => c.status === 'open');
};