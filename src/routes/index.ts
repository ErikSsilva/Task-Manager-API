import { sessionsRoutes } from "@/routes/sessions-routes"
import { teamsRouter } from "@/routes/teams-routes"
import { tasksRouter } from "@/routes/tasks-routes"
import { usersRoutes } from "@/routes/users-routes"
import { Router } from "express"


const routes = Router()

routes.use("/teams", teamsRouter)

routes.use("/tasks", tasksRouter)

routes.use("/users", usersRoutes)
routes.use("/sessions", sessionsRoutes)

export { routes }
