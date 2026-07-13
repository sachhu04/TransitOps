import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';

export const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key_transitops_hackathon_2026';

export interface DecodedToken {
  id: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export function generateToken(payload: { id: string; email: string; role: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
}

export function verifyToken(token: string): DecodedToken | null {
  try {
    return jwt.verify(token, JWT_SECRET) as DecodedToken;
  } catch (error) {
    return null;
  }
}

export function requireAuth(handler: (req: NextApiRequest, res: NextApiResponse, user: DecodedToken) => void | Promise<void>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    let token = req.cookies.token;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }

    return handler(req, res, decoded);
  };
}

export function requireRoles(roles: string[], handler: (req: NextApiRequest, res: NextApiResponse, user: DecodedToken) => void | Promise<void>) {
  return requireAuth(async (req, res, user) => {
    if (!roles.includes(user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }
    return handler(req, res, user);
  });
}
