import { Router } from "express"
import { TeamsController } from "@/controllers/teams-controllers"
import { TeamMembersController } from "@/controllers/teamMembers-controllers"
import { ensureAuthenticated } from "@/middlewares/ensureAutheticated"
import { ensureRole } from "@/middlewares/ensureRole"

const teamsRouter = Router()
const teamsController = new TeamsController()
const teamMembersController = new TeamMembersController()

teamsRouter.use(ensureAuthenticated)
teamsRouter.use(ensureRole("ADMIN"))

teamsRouter.post("/", teamsController.create)
teamsRouter.get("/", teamsController.index)
teamsRouter.patch("/:id", teamsController.update)
teamsRouter.delete("/:id", teamsController.remove)

teamsRouter.post("/:id/members", teamMembersController.add)
teamsRouter.delete("/:id/members", teamMembersController.remove)
teamsRouter.get("/:id/members", teamMembersController.index)

export { teamsRouter }