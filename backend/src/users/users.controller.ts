import { Response } from 'express';
import { AuthRequest } from '../auth/auth.middleware';
import { getAllUsers, getUserById, updateUser, deleteUser } from './users.service';

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = getAllUsers();
    return res.status(200).json(users);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const getUser = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const user = getUserById(id);
    return res.status(200).json(user);
  } catch (error: any) {
    return res.status(404).json({ message: error.message });
  }
};

export const updateUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const user = updateUser(id, req.body);
    return res.status(200).json({ message: 'User updated successfully', user });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const removeUser = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const result = deleteUser(id);
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(404).json({ message: error.message });
  }
};