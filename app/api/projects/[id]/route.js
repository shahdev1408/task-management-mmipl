import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "SUPERVISOR")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id: rawId } = await params
  const id = parseInt(rawId)
  const { code, name, day0 } = await req.json()

  const updated = await prisma.project.update({
    where: { id },
    data: {
      ...(code && { code }),
      ...(name && { name }),
      ...(day0 && { day0: new Date(day0) })
    }
  })
  return NextResponse.json(updated)
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "SUPERVISOR")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id: rawId } = await params
  const id = parseInt(rawId)

  const tasks = await prisma.task.findMany({
    where: { projectId: id },
    include: {
      activities: {
        include: { subTasks: { include: { history: true } } }
      }
    }
  })

  for (const task of tasks) {
    for (const activity of task.activities) {
      for (const sub of activity.subTasks) {
        await prisma.subTaskHistory.deleteMany({ where: { subTaskId: sub.id } })
        await prisma.subTask.delete({ where: { id: sub.id } })
      }
      await prisma.activity.delete({ where: { id: activity.id } })
    }
    await prisma.task.delete({ where: { id: task.id } })
  }

  await prisma.project.delete({ where: { id } })
  return NextResponse.json({ success: true })
}