import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "EXECUTOR")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const executorId = parseInt(session.user.id)
  const today      = new Date()
  const in2days    = new Date()
  in2days.setDate(today.getDate() + 2)

  const subTasks = await prisma.subTask.findMany({
    where: { executorId },
    include: {
      activity: {
        include: {
          task: {
            include: {
              project: { select: { code: true, name: true } }
            }
          }
        }
      }
    },
    orderBy: { dueDate: "asc" }
  })

  const allotted   = subTasks.filter(s => s.status === "ALLOTTED")
  const onHand     = subTasks.filter(s => s.status === "ONGOING")
  const completed  = subTasks.filter(s => s.status === "COMPLETED")
  const delayed    = subTasks.filter(s => s.status === "DELAYED")
  const dueSoon    = subTasks.filter(s =>
    s.dueDate &&
    new Date(s.dueDate) <= in2days &&
    new Date(s.dueDate) >= today &&
    s.status !== "COMPLETED"
  )

  return NextResponse.json({
    counts: {
      allotted:  allotted.length,
      onHand:    onHand.length,
      completed: completed.length,
      delayed:   delayed.length,
    },
    allotted,
    onHand,
    completed,
    delayed,
    dueSoon,
  })
}