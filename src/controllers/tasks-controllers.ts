import { Request, Response } from 'express'
import { AppError } from '@/utils/appError';
import { prisma } from '@/database/prisma'
import { z } from 'zod';
import { Prisma } from '../../prisma/generated/prisma/client';

class TasksController{
  async create(request: Request, response: Response) {
    const bodySchema = z.object({
      title: z.string().trim().min(1, "Title is required"),
      description: z.string().optional(),
      status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]).optional().default("PENDING"),
      priority: z.enum(["HIGH", "MEDIUM", "LOW"]).optional().default("MEDIUM"),
      teamId: z.uuid("Invalid team ID"),
    })

    const { title, description, status, priority, teamId } = bodySchema.parse(request.body)

    const { id: userId, role } = request.user!

  // Verifica se o time existe
    const team = await prisma.team.findUnique({
      where: {
        id: teamId
      }
    })

    if (!team) {
      throw new AppError("Team not found", 404)
    }

    // 🔐 Se for MEMBER, precisa pertencer ao time
    if (role === "MEMBER") {
      const isMember = await prisma.teamMember.findFirst({
        where: {
          userId,
          teamId
        }
      })

      if (!isMember) {
        throw new AppError("You don't have access to this team", 403)
      }
    }

  // Cria a task
    const task = await prisma.task.create({
      data: {
        title,
        description,
        status,
        priority,
        teamId
      }
    })

    return response.status(201).json(task)
  }

  async index(request: Request, response: Response){
    const { id: userId, role } = request.user!

    const querySchema = z.object({
      priority: z.enum(["HIGH", "MEDIUM", "LOW"]).optional(),
      status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]).optional()
    })

    const { priority, status } = querySchema.parse(request.query)

    const where: Prisma.TaskWhereInput = {}
    
    if(priority){
      where.priority = priority
    }

    if(status){
      where.status = status
    }
    
    
    if (role === "MEMBER") {
      where.assignedTo = userId
    } 
  
    const tasks = await prisma.task.findMany({
      where,
      include: {
        team:{
          select:{
            id:true,
            name:true
          }
        },
        user: {
          select:{
            id:true,
            name:true
          }
        }
      }
    })

    return response.json(tasks)
  }

  async update(request: Request, response: Response){
    const paramsSchema = z.object({
      id: z.uuid("Invalid task ID")
    })

    const bodySchema = z.object({
      title: z.string().trim().min(1).optional(),
      description: z.string().optional(),
      status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]).optional(),
      priority: z.enum(["HIGH", "MEDIUM", "LOW"]).optional(),

    }).refine(data => Object.keys(data).length > 0, {
      message: "At least one field must be provided",
    })

    const { id } = paramsSchema.parse(request.params)
    const { id: userId, role } = request.user!
    const data = bodySchema.parse(request.body)

    const task = await prisma.task.findUnique({
      where: {
        id
      }
    })

    if(!task){
      throw new AppError("Task not found", 404)
    }

    if(role === "MEMBER" && task.assignedTo !== userId){
      throw new AppError("You don't have permission to update this task", 403)
    }

    const updatedTask = await prisma.$transaction(async (tx) => {
      if(data.status && data.status !== task.status){
        await tx.taskHistory.create({
          data: {
            taskId: id,
            oldStatus: task.status,
            newStatus: data.status,
            changedBy: userId
          }
        })
      }

      return await tx.task.update({
        where: {
          id
        },
        data
      })

    })

    return response.json(updatedTask)
    
  }

  async delete(request: Request, response: Response){
    const paramsSchema = z.object({
      id: z.uuid("Invalid task ID")
    })

    const { id } = paramsSchema.parse(request.params)
    const { id: userId, role } = request.user!

    const task = await prisma.task.findUnique({
      where: {
        id
      }
    })

    if(!task){
      throw new AppError("Task not found", 404)
    }


    if(role === "MEMBER" && task.assignedTo !== userId){
      throw new AppError("You don't have permission to delete this task", 403)
    }

    await prisma.task.delete({
      where: {
        id
      }
    })

    return response.status(204).send()
  }

  async assignTask(request: Request, response: Response) {
    const paramsSchema = z.object({
      id: z.uuid("Invalid task ID")
    })

    const bodySchema = z.object({
      userId: z.string().uuid("Invalid user ID")
    })

    const { id } = paramsSchema.parse(request.params)
    const { userId } = bodySchema.parse(request.body)

    const task = await prisma.task.findUnique({
      where: {
        id
      }
    })

    if (!task) {
      throw new AppError("Task not found", 404)
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId
      }
    })

    if (!user) {
      throw new AppError("User not found", 404)
    }

    const isMember = await prisma.teamMember.findFirst({
      where: {
        userId,
        teamId: task.teamId
      }
    })

    if (!isMember) {
      throw new AppError("User is not a member of the team", 400)
    }

    const updatedTask = await prisma.task.update({
      where: {
        id
      },
      data: {
        assignedTo: userId
      }
    })

    return response.json(updatedTask)
  }

  async history(request: Request, response: Response) {
    const paramsSchema = z.object({
      id: z.uuid("Invalid task ID")
    })

    const { id: userId, role } = request.user!
    const { id } = paramsSchema.parse(request.params)

    const task = await prisma.task.findUnique({
      where: { id }
    })

    if (!task) {
      throw new AppError("Task not found", 404)
    }

    if (role === "MEMBER" && task.assignedTo !== userId) {
      throw new AppError("You don't have permission to view this task history", 403)
    }

    const taskHistory = await prisma.taskHistory.findMany({
      where: {
        taskId: id
      },
      select: {
        id: true,
        oldStatus: true,
        newStatus: true,
        changedAt: true,

        changedByUser: {
          select: {
            name: true,
            id: true
          }
        },
        task: {
          select: {
            title: true,
            id: true
          }
        }
      },
      orderBy: {
        changedAt: 'desc'
      }
    })

    return response.json(taskHistory)

  }
} 

export { TasksController }