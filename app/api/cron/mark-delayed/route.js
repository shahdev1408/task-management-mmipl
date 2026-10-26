import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req) {
  const session = await getServerSession(authOptions)
  const isSupervisor = session && ["SUPERVISOR", "MANAGER"].includes(session.user?.role)
  const authHeader = req.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET || "cron-secret-2024-xyz"
  const isCronAuth = authHeader === `Bearer ${cronSecret}`

  if (!isSupervisor && !isCronAuth)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const now = new Date()

  const overdue = await prisma.subTask.findMany({
    where: {
      status:  { in: ["ALLOTTED", "ONGOING"] },
      dueDate: { lt: now },
    }
  })

  if (overdue.length === 0)
    return NextResponse.json({ message: "No overdue tasks", updated: 0 })

  await prisma.subTask.updateMany({
    where: {
      id:      { in: overdue.map(s => s.id) },
      status:  { in: ["ALLOTTED", "ONGOING"] },
      dueDate: { lt: now },
    },
    data: { status: "DELAYED" }
  })

  await Promise.all(overdue.map(s =>
    prisma.subTaskHistory.create({
      data: {
        subTaskId:   s.id,
        changedById: 1,
        oldStatus:   s.status,
        newStatus:   "DELAYED",
        note:        "Auto-marked delayed by system",
      }
    })
  ))

  return NextResponse.json({ message: "Done", updated: overdue.length })
}