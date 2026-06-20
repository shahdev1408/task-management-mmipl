import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "MANAGER")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const managerId = parseInt(session.user.id)

  const activities = await prisma.activity.findMany({
    where: { managerId },
    include: {
      task: { include: { project: { select: { id: true, code: true, name: true } } } },
      subTasks: {
        include: { executor: { select: { id: true, name: true } } }
      }
    }
  })

  const allSubs = activities.flatMap(a =>
    a.subTasks.map(s => ({ ...s, activityName: a.name, project: a.task?.project }))
  )

  const completed = allSubs.filter(s => s.status === "COMPLETED").length
  const ongoing   = allSubs.filter(s => s.status === "ONGOING").length
  const delayed   = allSubs.filter(s => s.status === "DELAYED").length

  const activityStats = activities.map(a => ({
    id:        a.id,
    name:      a.name,
    status:    a.status,
    project:   a.task?.project,
    completed: a.subTasks.filter(s => s.status === "COMPLETED").length,
    ongoing:   a.subTasks.filter(s => s.status === "ONGOING").length,
    delayed:   a.subTasks.filter(s => s.status === "DELAYED").length,
    total:     a.subTasks.length,
  }))

  // Project-wise breakdown scoped to this manager
  const projectMap = {}
  allSubs.forEach(s => {
    const code = s.project?.code || "Unknown"
    if (!projectMap[code]) projectMap[code] = { code, name: s.project?.name || "", completed: 0, ongoing: 0, delayed: 0, total: 0 }
    projectMap[code].total++
    if (s.status === "COMPLETED") projectMap[code].completed++
    if (s.status === "ONGOING")   projectMap[code].ongoing++
    if (s.status === "DELAYED")   projectMap[code].delayed++
  })
  const projectStats = Object.values(projectMap)

  // User-wise breakdown (executors under this manager)
  const executorMap = {}
  allSubs.forEach(s => {
    const exId = s.executor?.id
    if (!exId) return
    if (!executorMap[exId]) executorMap[exId] = { id: exId, name: s.executor?.name, completed: 0, ongoing: 0, delayed: 0, total: 0, totalRating: 0, ratedCount: 0 }
    executorMap[exId].total++
    if (s.status === "COMPLETED") executorMap[exId].completed++
    if (s.status === "ONGOING")   executorMap[exId].ongoing++
    if (s.status === "DELAYED")   executorMap[exId].delayed++
    if (s.rating) { executorMap[exId].totalRating += s.rating; executorMap[exId].ratedCount++ }
  })
  const executorStats = Object.values(executorMap).map(e => ({
    ...e,
    avgRating: e.ratedCount ? (e.totalRating / e.ratedCount).toFixed(1) : null,
  }))

  return NextResponse.json({
    completed, ongoing, delayed,
    activityStats,
    projectStats,
    executorStats,
    allSubTasks: allSubs,
  })
}