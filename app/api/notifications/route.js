import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = parseInt(session.user.id)
  const role   = session.user.role
  const today  = new Date()
  const in2    = new Date()
  in2.setDate(today.getDate() + 2)

  const notifications = []

  if (role === "EXECUTOR") {
    // Due soon
    const dueSoon = await prisma.subTask.findMany({
      where: {
        executorId: userId,
        status:     { in: ["ALLOTTED", "ONGOING"] },
        dueDate:    { lte: in2, gte: today },
      },
      select: { id: true, name: true, dueDate: true }
    })
    dueSoon.forEach(s => notifications.push({
      id:      `due-${s.id}`,
      type:    "warning",
      message: `"${s.name}" is due on ${new Date(s.dueDate).toLocaleDateString("en-IN")}`,
    }))

    // Newly allotted
    const allotted = await prisma.subTask.findMany({
      where:   { executorId: userId, status: "ALLOTTED" },
      select:  { id: true, name: true },
      take:    5,
      orderBy: { createdAt: "desc" },
    })
    allotted.forEach(s => notifications.push({
      id:      `allotted-${s.id}`,
      type:    "info",
      message: `New task assigned: "${s.name}"`,
    }))

    // Delayed
    const delayed = await prisma.subTask.findMany({
      where:  { executorId: userId, status: "DELAYED" },
      select: { id: true, name: true },
    })
    delayed.forEach(s => notifications.push({
      id:      `delayed-${s.id}`,
      type:    "error",
      message: `"${s.name}" is overdue!`,
    }))
  }

  if (role === "MANAGER") {
    const activities = await prisma.activity.findMany({
      where:   { managerId: userId },
      include: { subTasks: { select: { id: true, name: true, status: true, rating: true } } }
    })
    const allSubs = activities.flatMap(a => a.subTasks)

    // Completed needing rating
    const unrated = allSubs.filter(s => s.status === "COMPLETED" && !s.rating)
    unrated.forEach(s => notifications.push({
      id:      `rate-${s.id}`,
      type:    "info",
      message: `"${s.name}" is completed — please rate it`,
    }))

    // Delayed in team
    const delayed = allSubs.filter(s => s.status === "DELAYED")
    delayed.forEach(s => notifications.push({
      id:      `delayed-${s.id}`,
      type:    "error",
      message: `Team task "${s.name}" is delayed`,
    }))
  }

  if (role === "SUPERVISOR") {
    const delayedCount = await prisma.subTask.count({ where: { status: "DELAYED" } })
    if (delayedCount > 0) {
      notifications.push({
        id:      "sup-delayed",
        type:    "error",
        message: `${delayedCount} subtask${delayedCount > 1 ? "s are" : " is"} delayed across all projects`,
      })
    }
    const completedToday = await prisma.subTask.count({
      where: {
        status:    "COMPLETED",
        updatedAt: { gte: new Date(new Date().setHours(0,0,0,0)) }
      }
    })
    if (completedToday > 0) {
      notifications.push({
        id:      "sup-completed",
        type:    "success",
        message: `${completedToday} subtask${completedToday > 1 ? "s" : ""} completed today`,
      })
    }
  }

  return NextResponse.json(notifications.slice(0, 10))
}