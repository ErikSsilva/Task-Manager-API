import { NextFunction, Request, Response } from "express"
import { UserRole } from "@/types/Role-type"

function ensureRole(...roles: UserRole[]) {
  return function (request: Request, response: Response, next: NextFunction) {
    const userRole = request.user?.role

    if (!userRole || !roles.includes(userRole)) {
      return response.status(403).json({ message: "Access denied" })
    }

    return next()
  }
}

export { ensureRole }