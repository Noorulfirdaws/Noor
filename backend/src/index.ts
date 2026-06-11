import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './db.init';
import authRoutes from './auth/auth.routes';
import userRoutes from './users/users.routes';
import driverRoutes from './drivers/drivers.routes';
import tripRoutes from './trips/trips.routes';
import reviewRoutes from './reviews/reviews.routes';
import complaintRoutes from './complaints/complaints.routes';
import adminRoutes from './admin/admin.routes';
import paymentRoutes from './payments/payment.routes';
import superAdminRoutes from './super-admin/super-admin.routes';
import { authRateLimit, tripRateLimit } from './middleware/rateLimit';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

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

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'no-referrer');
  next();
});

app.get('/test', (req, res) => {
  res.json({ message: 'test works', headers: req.headers });
});

app.use('/api/auth',       authRateLimit, authRoutes);
app.use('/api/users',      userRoutes);
app.use('/api/drivers',    driverRoutes);
app.use('/api/trips',      tripRateLimit, tripRoutes);
app.use('/api/reviews',    reviewRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin',        adminRoutes);
app.use('/api/payments',     paymentRoutes);
app.use('/api/super-admin',  superAdminRoutes);

const start = async () => {
  await initDatabase();
  app.listen(PORT, () => {
    console.log(`Djib Taxi API running on port ${PORT}`);
  });
};

start();

export default app;