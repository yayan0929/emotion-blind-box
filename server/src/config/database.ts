import { PrismaClient } from '@prisma/client'

declare global {
  var __db: PrismaClient | undefined
}

// 防止在开发环境下创建多个 Prisma 实例
const prisma = globalThis.__db || new PrismaClient()

if (process.env.NODE_ENV === 'development') {
  globalThis.__db = prisma
}

export default prisma