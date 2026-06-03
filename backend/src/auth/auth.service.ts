import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'customer' | 'driver' | 'admin';
}

export const users: User[] = [];

export const registerUser = async (name: string, email: string, password: string, role: 'customer' | 'driver' = 'customer') => {
  const existing = users.find(u => u.email === email);
  if (existing) throw new Error('Email already registered');

  const hashedPassword = await bcrypt.hash(password, 10);

  const user: User = {
    id: Math.random().toString(36).substr(2, 9),
    name,
    email,
    password: hashedPassword,
    role
  };

  users.push(user);

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  return { user: { id: user.id, name: user.name, email: user.email, role: user.role }, token };
};

export const loginUser = async (email: string, password: string) => {
  const user = users.find(u => u.email === email);
  if (!user) throw new Error('Invalid email or password');

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error('Invalid email or password');

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  return { user: { id: user.id, name: user.name, email: user.email, role: user.role }, token };
};