import { Request, Response } from 'express';
import { registerUser, loginUser, updateUserProfile, generateResetCode, resetPassword } from './auth.service';
import { AuthRequest } from './auth.middleware';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, fatherName, grandfatherName, email, password, role } = req.body;

    if (!name || !fatherName || !grandfatherName || !email || !password) {
      return res.status(400).json({ message: 'Name, father name, grandfather name, email and password are required' });
    }

    const safeRole: 'customer' | 'driver' =
      role === 'driver' ? 'driver' : 'customer';
    const result = await registerUser(name, fatherName, grandfatherName, email, password, safeRole);
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

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  // Always return the same generic response — never reveal whether the
  // account exists, and NEVER return the reset code to the caller
  // (returning it enables trivial account takeover).
  const generic = {
    message: 'Si un compte existe pour cet email, un code de réinitialisation a été envoyé.',
  };

  try {
    const code = await generateResetCode(email);
    // TODO: deliver via SMS/email provider. Until then, the code is only
    // visible in server logs so the platform owner can relay it manually.
    console.log(`[PasswordReset] code for ${email}: ${code}`);
  } catch {
    // Swallow "no account" errors so attackers can't enumerate emails.
  }

  return res.status(200).json(generic);
};

export const resetPasswordHandler = async (req: Request, res: Response) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: 'Email, code and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    await resetPassword(email, code, newPassword);
    return res.status(200).json({ message: 'Password reset successfully. You can now log in.' });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { name, fatherName, grandfatherName } = req.body;
    const user = await updateUserProfile(req.user!.id, { name, fatherName, grandfatherName });
    return res.status(200).json({ message: 'Profile updated', user });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};