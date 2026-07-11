import { Request, Response } from "express"
import { AppError } from "@/utils/appError"
import { hash } from "bcrypt" 
import { prisma } from "@/database/prisma"
import { z } from "zod"

class UserController {

  async create(request: Request, response: Response) {

    const bodySchema = z.object({
      name: z.string({message: "Name is required"}).trim().min(2),
      email: z.email({message: "Invalid email format"}).trim().min(1, {message: "Email is required"}).toLowerCase(),
      password: z.string({message: "Password is required"}).min(6, {message: "password must be at least 6 characters long"}),
      role: z.enum(["ADMIN", "MEMBER"]).optional()
    })

    const { name, email, password, role } = bodySchema.parse(request.body)

    const userWithSameEmail = await prisma.user.findUnique({
      where: {
        email
      }
    })

    if (userWithSameEmail) {
      throw new AppError("Email already in use", 409)
    }

    const hashedPassword = await hash(password, 8)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      }
    })

    const { password: _, ...userWithoutPassword } = user

    return response.status(201).json({ user: userWithoutPassword })
  }

  
}

export { UserController }