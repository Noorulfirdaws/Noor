import { User, users } from '../auth/auth.service';

export { User, users };

export const getAllUsers = () => {
  return users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role }));
};

export const getUserById = (id: string) => {
  const user = users.find(u => u.id === id);
  if (!user) throw new Error('User not found');
  return { id: user.id, name: user.name, email: user.email, role: user.role };
};

export const updateUser = (id: string, data: { name?: string; email?: string }) => {
  const user = users.find(u => u.id === id);
  if (!user) throw new Error('User not found');
  if (data.name) user.name = data.name;
  if (data.email) user.email = data.email;
  return { id: user.id, name: user.name, email: user.email, role: user.role };
};

export const deleteUser = (id: string) => {
  const index = users.findIndex(u => u.id === id);
  if (index === -1) throw new Error('User not found');
  users.splice(index, 1);
  return { message: 'User deleted successfully' };
};