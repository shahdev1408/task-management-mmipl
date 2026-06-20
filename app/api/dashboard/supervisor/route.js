import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "SUPERVISOR")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const [completed, ongoing, delayed] = await Promise.all([
    prisma.subTask.count({ where: { status: "COMPLETED" } }),
    prisma.subTask.count({ where: { status: "ONGOING"   } }),
    prisma.subTask.count({ where: { status: "DELAYED"   } }),
  ])

  // Project-wise stats
  const projects = await prisma.project.findMany({
    include: {
      tasks: {
        include: {
          activities: { include: { subTasks: true } }
        }
      }
    }
  })

  const projectStats = projects.map(p => {
    const allSubs = p.tasks.flatMap(t => t.activities.flatMap(a => a.subTasks))
    return {
      id:        p.id,
      code:      p.code,
      name:      p.name,
      completed: allSubs.filter(s => s.status === "COMPLETED").length,
      ongoing:   allSubs.filter(s => s.status === "ONGOING").length,
      delayed:   allSubs.filter(s => s.status === "DELAYED").length,
      total:     allSubs.length,
    }
  })

  // User-wise stats — managers
  const managers = await prisma.user.findMany({
    where: { role: "MANAGER" },
    include: {
      managedActivities: {
        include: { subTasks: true }
      }
    }
  })

  const managerStats = managers.map(m => {
    const subs = m.managedActivities.flatMap(a => a.subTasks)
    return {
      id:        m.id,
      name:      m.name,
      role:      "MANAGER",
      completed: subs.filter(s => s.status === "COMPLETED").length,
      ongoing:   subs.filter(s => s.status === "ONGOING").length,
      delayed:   subs.filter(s => s.status === "DELAYED").length,
      total:     subs.length,
    }
  })

  // User-wise stats — executors
  const executors = await prisma.user.findMany({
    where: { role: "EXECUTOR" },
    include: {
      executedSubTasks: true
    }
  })

  const executorStats = executors.map(e => {
    const subs = e.executedSubTasks
    const totalRating = subs.filter(s => s.rating).reduce((acc, s) => acc + s.rating, 0)
    const ratedCount  = subs.filter(s => s.rating).length
    return {
      id:        e.id,
      name:      e.name,
      role:      "EXECUTOR",
      completed: subs.filter(s => s.status === "COMPLETED").length,
      ongoing:   subs.filter(s => s.status === "ONGOING").length,
      delayed:   subs.filter(s => s.status === "DELAYED").length,
      total:     subs.length,
      avgRating: ratedCount ? (totalRating / ratedCount).toFixed(1) : null,
    }
  })

  // Delayed subtasks drill-down
  const delayedSubTasks = await prisma.subTask.findMany({
    where: { status: "DELAYED" },
    include: {
      executor: { select: { name: true } },
      activity: {
        include: {
          task: { include: { project: { select: { code: true } } } }
        }
      },
    },
    take:    10,
    orderBy: { dueDate: "asc" },
  })

  return NextResponse.json({
    completed,
    ongoing,
    delayed,
    projectStats,
    managerStats,
    executorStats,
    delayedSubTasks,
  })
}