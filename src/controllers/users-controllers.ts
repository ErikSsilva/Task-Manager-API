import { Request, Response } from "express"
import { AppError } from "@/utils/appError"

export class UserControllers {

  async create(request: Request, response: Response) {
    return response.status(201).json({ message: "User created successfully" })
  }
}