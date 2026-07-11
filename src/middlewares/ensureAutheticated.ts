import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken'
import { authConfig } from '@/configs/auth';
import { AppError } from '@/utils/appError';
import { UserRole } from '@/types/Role-type';


function ensureAuthenticated(request: Request, response: Response, next: NextFunction) {
  try {
    const authHeader = request.headers.authorization

    if (!authHeader) {
      return response.status(401).json({ message: "Token is missing" })
    }

    const [, token] = authHeader.split(' ')

    const { role, sub: user_id } = verify(token, authConfig.jwt.secret) as { sub: string, role: string }

    request.user = {
      id: user_id,
      role: role as UserRole
    }

    return next()

  } catch (error) {
    throw new AppError("Invalid token", 401)
  }
}

export { ensureAuthenticated }