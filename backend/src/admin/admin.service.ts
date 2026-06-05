import { getAllUsers } from '../auth/auth.service';
import { getAllDrivers } from '../drivers/drivers.service';
import { trips } from '../trips/trips.service';
import { getAllComplaints } from '../complaints/complaints.service';
import { getAllReviews } from '../reviews/reviews.service';

export const getStats = async () => {
  const users = await getAllUsers();
  const drivers = await getAllDrivers();
  const allComplaints = await getAllComplaints();
  const allReviews = await getAllReviews();

  const totalUsers = users.length;
  const totalDrivers = drivers.length;
  const approvedDrivers = drivers.filter((d: any) => d.status === 'approved').length;
  const pendingDrivers = drivers.filter((d: any) => d.status === 'pending').length;
  const totalTrips = trips.length;
  const completedTrips = trips.filter(t => t.status === 'completed').length;
  const totalRevenue = trips
    .filter(t => t.status === 'completed' && t.fare)
    .reduce((sum, t) => sum + (t.fare || 0), 0);
  const openComplaints = allComplaints.filter((c: any) => c.status === 'open').length;
  const totalReviews = allReviews.length;

  return {
    users: { total: totalUsers },
    drivers: { total: totalDrivers, approved: approvedDrivers, pending: pendingDrivers },
    trips: { total: totalTrips, completed: completedTrips },
    revenue: { total: totalRevenue },
    complaints: { open: openComplaints, total: allComplaints.length },
    reviews: { total: totalReviews }
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