import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req) {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'SUPERVISOR') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const statusFilter = searchParams.get('status')
  const projectId = searchParams.get('projectId')

  // Build dynamic query
  const whereClause = {}
  if (statusFilter) whereClause.status = statusFilter
  if (projectId) whereClause.activity = { task: { projectId: parseInt(projectId) } }

  try {
    const subTasks = await prisma.subTask.findMany({
      where: whereClause,
      include: {
        executor: { select: { id: true, name: true, email: true } },
        activity: {
          include: {
            task: { include: { project: { select: { code: true, name: true } } } },
            manager: { select: { name: true } }
          }
        }
      },
      orderBy: { dueDate: 'asc' }
    })

    return NextResponse.json(subTasks, { status: 200 })
  } catch (error) {
    console.error("Failed to fetch subtasks:", error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}