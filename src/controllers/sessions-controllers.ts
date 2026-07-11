import { Request, Response } from 'express';
import { AppError } from '@/utils/appError';
import { prisma } from '@/database/prisma'
import { compare } from 'bcrypt'
import { authConfig } from '@/configs/auth';
import {sign} from 'jsonwebtoken'
import { z } from 'zod';


class SessionsController {
  async create(request: Request, response: Response) {
    const bodySchema = z.object({
      email: z.email(),
      password: z.string().min(6)
    })

    const { email, password } = bodySchema.parse(request.body)

    const user = await prisma.user.findFirst({where: {email}})

    if(!user){
      throw new AppError("Invalid credentials", 401)
    }

    const passwordMatched = await compare(password, user.password)

    if (!passwordMatched){
      throw new AppError("Invalid credentials", 401)
    }

    const { secret, expiresIn } = authConfig.jwt

    const token = sign({role: user.role ?? "MEMBER"}, secret, {
      subject: user.id,
      expiresIn: expiresIn as any,
    })

    const { password: _, ...userWithoutPassword } = user

    return response.status(201).json({token, ...userWithoutPassword});
  }
}

export { SessionsController }