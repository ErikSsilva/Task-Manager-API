import { Request, Response } from 'express'
import { AppError } from '@/utils/appError';
import { prisma } from '@/database/prisma'
import { z } from 'zod';

class TeamMembersController {
  async add(request: Request, response: Response){
    const paramsSchema = z.object({
      id: z.uuid()
    })

    const bodySchema = z.object({
      usersIds: z.array(z.uuid().min(1, "At least one userId is required"))
    })

    const { id } = paramsSchema.parse(request.params)
    const { usersIds } = bodySchema.parse(request.body)

    const team = await prisma.team.findFirst({
      where:{
        id
      }
    })

    const users = await prisma.user.findMany({
      where: {
        id: {
          in: usersIds
        }
      },
      select: { id: true }
    })

    const foundIds = users.map(user => user.id)

    const missingUsers = usersIds.filter(id => !foundIds.includes(id))

    if (missingUsers.length > 0) {
      throw new AppError(`Users not found: ${missingUsers.join(", ")}`, 404)
    }

    if(!team){
      throw new AppError("There isn't a team with that ID", 404)
    }

    const existingMembers = await prisma.teamMember.findMany({
      where: {
        teamId: id,
        userId: {
          in: usersIds
        }
      },
      select: { userId: true }
    })

    const existingIds = existingMembers.map(m => m.userId)

    const newUsers = usersIds.filter(id => !existingIds.includes(id))
    const alreadyInTeam = usersIds.filter(id => existingIds.includes(id))

    await prisma.teamMember.createMany({
      data: newUsers.map(userId => ({
        teamId: id,
      userId
      })),
      skipDuplicates: true
    })

    return response.status(201).json({
      message: "Processed members",
      added: newUsers,
      alreadyInTeam
    })
  }

  async remove(request: Request, response: Response){
    const paramsSchema = z.object({
      id: z.uuid()
    })

    const bodySchema = z.object({
      usersIds: z.array(z.uuid().min(1, "At least one userId is required"))
    })

    const { id } = paramsSchema.parse(request.params)
    const { usersIds } = bodySchema.parse(request.body)

    const team = await prisma.teamMember.findMany({
      where:{
        teamId: id
      }
    })

    const usersInThisTeam = team.map(member => member.userId)

    const validUsersToRemove = usersIds.filter(id =>
      usersInThisTeam.includes(id)
    )

    const usersNotInTeam = usersIds.filter(id =>
      !usersInThisTeam.includes(id)
    )

    if (team.length === 0) {
      throw new AppError("Team not found or has no members", 404)
    }

    await prisma.teamMember.deleteMany({
      where: {
        teamId: id,
        userId: {
          in: validUsersToRemove
        }
      }   
    })

    return response.json({
      removed: validUsersToRemove,
      notInTeam: usersNotInTeam
    })
  }

  async index(request: Request, response: Response){
    const paramsSchema = z.object({
      id: z.uuid()
    })

    const { id } = paramsSchema.parse(request.params) 

    const teamExists = await prisma.team.findUnique({
      where: { id },
      select: { id: true }
    })

    if (!teamExists) {
      throw new AppError("Team not found", 404)
    }

    const teamMembers = await prisma.teamMember.findMany({
      where: {
        teamId: id
      }
    })

    const teamUsers = teamMembers.map(member => member.userId)

    const users = await prisma.user.findMany({
      where: {
        id: {
          in: teamUsers
        }
      },
      select: { name: true, id: true }
    })

    return response.json(users) 
  }
}

export { TeamMembersController }