import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { projectId, templateId, activities } = await req.json()

  if (!projectId || !templateId || !activities?.length)
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })

  const project = await prisma.project.findUnique({ where: { id: parseInt(projectId) } })
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 })

  const task = await prisma.task.create({
    data: {
      projectId:   parseInt(projectId),
      templateId:  parseInt(templateId),
      createdById: session.user.id,
      status:      "ONGOING",
      activities: {
        create: activities.map(a => ({
          name:          a.name,
          managerId:     parseInt(a.managerId),
          estimatedDays: parseInt(a.estimatedDays) || 1,
          status:        "ONGOING",
          subTasks: {
            create: (a.subTasks || []).map(s => {
              const dueDate = new Date(project.day0)
              dueDate.setDate(dueDate.getDate() + (parseInt(s.days) || 1))
              return {
                name:          s.name,
                executorId:    parseInt(s.executorId),
                days:          parseInt(s.days) || 1,
                dueDate,
                precedenceType: s.precedenceType || "NONE",
                status:        "ALLOTTED",
              }
            })
          }
        }))
      }
    }
  })

  return NextResponse.json(task, { status: 201 })
}