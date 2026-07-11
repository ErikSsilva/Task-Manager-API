import { UserRole } from "@/types/Role-type"

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        role: UserRole
      }
    }
  }
}
