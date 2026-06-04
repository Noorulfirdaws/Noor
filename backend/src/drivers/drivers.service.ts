import { v4 as uuidv4 } from 'uuid';

export interface Driver {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  vehicleModel: string;
  vehiclePlate: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  isOnline: boolean;
  createdAt: Date;
}

export const drivers: Driver[] = [];

export const registerDriver = (data: {
  userId: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  vehicleModel: string;
  vehiclePlate: string;
}) => {
  const existing = drivers.find(d => d.email === data.email);
  if (existing) throw new Error('Driver already registered');
  const driver: Driver = {
    id: uuidv4(),
    ...data,
    status: 'pending',
    isOnline: false,
    createdAt: new Date()
  };
  drivers.push(driver);
  return driver;
};

export const getAllDrivers = () => drivers;

export const getDriverById = (id: string) => {
  const driver = drivers.find(d => d.id === id);
  if (!driver) throw new Error('Driver not found');
  return driver;
};

export const approveDriver = (id: string) => {
  const driver = drivers.find(d => d.id === id);
  if (!driver) throw new Error('Driver not found');
  driver.status = 'approved';
  return driver;
};

export const rejectDriver = (id: string) => {
  const driver = drivers.find(d => d.id === id);
  if (!driver) throw new Error('Driver not found');
  driver.status = 'rejected';
  return driver;
};

export const toggleDriverOnline = (id: string) => {
  const driver = drivers.find(d => d.id === id);
  if (!driver) throw new Error('Driver not found');
  if (driver.status !== 'approved') throw new Error('Driver not approved yet');
  driver.isOnline = !driver.isOnline;
  return driver;
};