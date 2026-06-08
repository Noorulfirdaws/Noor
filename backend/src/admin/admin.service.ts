import { getAllUsers } from '../auth/auth.service';
import { getAllDrivers } from '../drivers/drivers.service';
import { getTrips } from '../trips/trips.service';
import { getAllComplaints } from '../complaints/complaints.service';
import { getAllReviews } from '../reviews/reviews.service';

export const getStats = async () => {
  const [users, drivers, allTrips, allComplaints, allReviews] = await Promise.all([
    getAllUsers(),
    getAllDrivers(),
    getTrips(),
    getAllComplaints(),
    getAllReviews(),
  ]);

  const approvedDrivers = drivers.filter((d: any) => d.status === 'approved').length;
  const pendingDrivers = drivers.filter((d: any) => d.status === 'pending').length;
  const completedTrips = allTrips.filter((t: any) => t.status === 'completed').length;
  const totalRevenue = allTrips
    .filter((t: any) => t.status === 'completed' && t.fare)
    .reduce((sum: number, t: any) => sum + parseFloat(t.fare || '0'), 0);
  const openComplaints = allComplaints.filter((c: any) => c.status === 'open').length;

  return {
    users: { total: users.length },
    drivers: { total: drivers.length, approved: approvedDrivers, pending: pendingDrivers },
    trips: { total: allTrips.length, completed: completedTrips },
    revenue: { total: totalRevenue },
    complaints: { open: openComplaints, total: allComplaints.length },
    reviews: { total: allReviews.length },
  };
};

export const getPendingDrivers = async () => {
  const drivers = await getAllDrivers();
  return drivers.filter((d: any) => d.status === 'pending');
};

export const getOpenComplaints = async () => {
  const allComplaints = await getAllComplaints();
  return allComplaints.filter((c: any) => c.status === 'open');
};
