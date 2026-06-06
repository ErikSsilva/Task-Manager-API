import express from "express"
import { routes } from "@/routes/index"
import { errorHandling } from "@/middlewares/error-handling"
import cors from "cors"

const app = express()

app.use(express.json())

app.use(cors())

app.use(routes)

app.use(errorHandling)


export {app}
