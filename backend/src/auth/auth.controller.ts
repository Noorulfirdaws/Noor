import { Request, Response } from 'express';
import { registerUser, loginUser } from './auth.service';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, fatherName, grandfatherName, email, password, role } = req.body;

    if (!name || !fatherName || !grandfatherName || !email || !password) {
      return res.status(400).json({ message: 'Name, father name, grandfather name, email and password are required' });
    }

    const result = await registerUser(name, fatherName, grandfatherName, email, password, role);
    return res.status(201).json({ message: 'User registered successfully', ...result });

  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const result = await loginUser(email, password);
    return res.status(200).json({ message: 'Login successful', ...result });

  } catch (error: any) {
    return res.status(401).json({ message: error.message });
  }
};