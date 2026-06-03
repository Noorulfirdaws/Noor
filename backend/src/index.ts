import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { initDatabase } from './db.init';
import authRoutes from './auth/auth.routes';
import userRoutes from './users/users.routes';
import driverRoutes from './drivers/drivers.routes';
import tripRoutes from './trips/trips.routes';
import reviewRoutes from './reviews/reviews.routes';
import complaintRoutes from './complaints/complaints.routes';
import adminRoutes from './admin/admin.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(helmet());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    app: 'Djib Taxi',
    message: 'API is running!',
    status: 'ok',
    version: '1.0.0',
    country: 'Djibouti'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);

const start = async () => {
  await initDatabase();
  app.listen(PORT, () => {
    console.log(`Djib Taxi API running on port ${PORT}`);
  });
};

start();

export default app;