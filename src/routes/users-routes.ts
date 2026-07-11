import { UserController } from "@/controllers/users-controllers"
import { Router } from "express"

const usersRoutes = Router()
const usersControllers = new UserController()

usersRoutes.post("/", usersControllers.create)

export { usersRoutes }
