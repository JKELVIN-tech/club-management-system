import jwt, { JwtPayload as JsonWebTokenPayload } from 'jsonwebtoken';
import { env } from '../config/env';
import { Role } from '@prisma/client';

export interface JwtPayload {
  memberId: string;
  role: Role;
  email: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions);
}

export function verifyToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET);

  if (!isJwtPayload(decoded)) {
    throw new Error('Invalid token payload');
  }

  return decoded;
}

function isJwtPayload(decoded: string | JsonWebTokenPayload): decoded is JsonWebTokenPayload & JwtPayload {
  if (typeof decoded === 'string' || !decoded) return false;

  return (
    typeof decoded.memberId === 'string' &&
    typeof decoded.email === 'string' &&
    typeof decoded.role === 'string' &&
    Object.values(Role).includes(decoded.role as Role)
  );
}
