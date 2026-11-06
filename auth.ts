import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'grand_hotel_jwt_secret_key_2026';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: 'customer' | 'admin';
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ success: false, message: 'Access denied: Authentication token required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ success: false, message: 'Invalid or expired authentication token' });
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  authenticateToken(req, res, () => {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Forbidden: Admin privilege required' });
      return;
    }
    next();
  });
}
