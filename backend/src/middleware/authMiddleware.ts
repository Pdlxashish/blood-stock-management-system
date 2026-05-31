import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma';

// ================= TYPES =================
interface JwtPayload {
  id: string;
  iat?: number;
  exp?: number;
}

// ================= PROTECT MIDDLEWARE =================
export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Check Authorization header
    const authHeader = req.headers.authorization;

    console.log('[protect] Authorization header:', authHeader ? `Bearer ${authHeader.substring(7, 27)}...` : 'MISSING');

    if (!authHeader?.startsWith('Bearer ')) {
      console.log('[protect] ❌ No Bearer token in header');
      res.status(401).json({
        success: false,
        message: 'Unauthorized - No token provided',
      });
      return;
    }

    // 2. Extract token
    const token = authHeader.split(' ')[1];

    if (!token) {
      console.log('[protect] ❌ Token extraction failed');
      res.status(401).json({
        success: false,
        message: 'Unauthorized - Invalid token format',
      });
      return;
    }

    // 3. Verify JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.error('[protect] ❌ JWT_SECRET not defined');
      res.status(500).json({
        success: false,
        message: 'Server error',
      });
      return;
    }

    // 4. Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    ) as JwtPayload;

    console.log('[protect] Token decoded, user ID:', decoded.id);

    if (!decoded || !decoded.id) {
      console.log('[protect] ❌ Invalid token payload');
      res.status(401).json({
        success: false,
        message: 'Unauthorized - Invalid token',
      });
      return;
    }

    // 5. Get user from DB
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
      },
    });

    if (!user) {
      console.log('[protect] ❌ User not found in database:', decoded.id);
      res.status(401).json({
        success: false,
        message: 'Unauthorized - User not found',
      });
      return;
    }

    console.log('[protect] ✅ User authenticated:', user.email, 'Role:', user.role);

    // 6. Attach user to request
    req.user = user;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.log('[protect] ❌ Token expired');
      res.status(401).json({
        success: false,
        message: 'Token expired',
      });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      console.log('[protect] ❌ Invalid JWT:', error.message);
      res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
      return;
    }

    console.error('[protect] ❌ Auth Middleware Error:', error);

    res.status(401).json({
      success: false,
      message: 'Unauthorized',
    });
  }
};

// ================= AUTHORIZE MIDDLEWARE =================
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authenticatedUser = req.user as { id: string; email: string; name: string; phone: string; role: string } | undefined;
    
    // 1. Check authentication
    if (!authenticatedUser) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    // 2. Check role
    if (!roles.includes(authenticatedUser.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden - Requires: ${roles.join(', ')}`,
      });
      return;
    }

    next();
  };
};