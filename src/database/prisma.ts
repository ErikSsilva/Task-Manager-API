// src/lib/prisma.ts
import { PrismaClient } from '../../prisma/generated/prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "production" ? [] : ["query"],
})
