import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { verifyToken, JwtPayload } from '../utils/jwt';

// Extend Express's Request type so req.user is available and typed
// throughout the app after authentication.
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Verifies the Bearer token on the request and attaches the decoded
 * payload to req.user. Rejects with 401 if missing or invalid.
 */
export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = header.split(' ')[1];

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Role-based access control. Usage: authorize(Role.ADMIN, Role.TREASURER)
 * Must run after `authenticate`. Returns 403 if the caller's role isn't
 * in the allowed list.
 */
export function authorize(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Insufficient permissions for this action',
      });
    }

    next();
  };
}

/**
 * Allows a member to act on their own resource (e.g. own profile) OR
 * a privileged role to act on anyone's. Compares req.user.memberId
 * against a memberId resolved from the request (params by default).
 */
export function authorizeSelfOrRoles(...privilegedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const targetId = req.params.id;
    const isSelf = req.user.memberId === targetId;
    const isPrivileged = privilegedRoles.includes(req.user.role);

    if (!isSelf && !isPrivileged) {
      return res.status(403).json({
        error: 'You may only access your own resource',
      });
    }

    next();
  };
}
