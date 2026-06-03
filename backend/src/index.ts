import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './auth/auth.routes';
import userRoutes from './users/users.routes';
import driverRoutes from './drivers/drivers.routes';
import tripRoutes from './trips/trips.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Taxi Platform API is running!', status: 'ok' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/trips', tripRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port 3000`);
});

export default app;