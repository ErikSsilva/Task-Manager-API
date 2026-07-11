import { Router } from "express"
import { TasksController } from "@/controllers/tasks-controllers"
import { ensureAuthenticated } from "@/middlewares/ensureAutheticated"
import {ensureRole} from "@/middlewares/ensureRole"

const tasksRouter = Router()
const tasksController = new TasksController()

tasksRouter.use(ensureAuthenticated)

tasksRouter.post("/", tasksController.create)
tasksRouter.get("/", tasksController.index)
tasksRouter.patch("/:id", tasksController.update)
tasksRouter.delete("/:id", tasksController.delete)
tasksRouter.get("/:id/history", tasksController.history)

tasksRouter.use(ensureRole("ADMIN"))

tasksRouter.patch("/:id/assign", tasksController.assignTask)


export { tasksRouter }

