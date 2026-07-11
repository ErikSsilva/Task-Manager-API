import { Request, Response } from 'express'
import { AppError } from '@/utils/appError';
import { prisma } from '@/database/prisma'
import { z } from 'zod';

class TeamsController {
  async create(request: Request, response: Response) {
    const bodySchema = z.object({
      name: z.string().trim().min(1, 'Name is required'),
      description: z.string().optional(),
    });

    const { name, description } = bodySchema.parse(request.body);

    const teamWithSameName = await prisma.team.findFirst({
      where: {
        name
      }
    })

    if (teamWithSameName) {
      throw new AppError('A team with this name already exists', 409)
    }

    const team = await prisma.team.create({
      data: {
        name,
        description
      }
    })

    return response.status(201).json( team )
  }

  async index(request: Request, response: Response){
    const teams = await prisma.team.findMany({
      include: {
        members: {
          select:{
            user:{
              select:{
                id:true,
                name:true
              }
            },
            id: true 
          },
        }
      }
    })

    return response.json(teams)
  }

  async update(request: Request, response: Response){
    const paramsSchema = z.object({
      id: z.uuid()
    })

    const bodySchema = z.object({
      name: z.string().trim().min(1).optional(),
      description: z.string().optional()
    })

    const { id } = paramsSchema.parse(request.params)
    const data = bodySchema.parse(request.body)

    const team = await prisma.team.findFirst({
      where: {
        id
      }
    })

    if (!team){
      throw new AppError("There isn't a team with that id")
    }

    const updatedTeam = await prisma.team.update({
      where: {id},
      data

    })


    return response.json({updatedTeam})
  }

  async remove(request: Request, response: Response){
    const paramsSchema = z.object({
      id: z.uuid()
    })

    const { id } = paramsSchema.parse(request.params)

    const team = await prisma.team.findFirst({
      where: {
        id
      }
    })

    if (!team){
      throw new AppError("There isn't a team with that id")
    }

    await prisma.team.delete({
      where:{
        id
      }
    })

    return response.json({message:"ok"})
  }
}

export { TeamsController }