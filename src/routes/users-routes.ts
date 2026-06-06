import { UserControllers } from "@/controllers/users-controllers"
import { Router } from "express"

const usersRoutes = Router()
const usersControllers = new UserControllers()

usersRoutes.post("/", usersControllers.create)

export { usersRoutes }
