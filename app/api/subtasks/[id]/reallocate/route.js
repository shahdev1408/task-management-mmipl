import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "MANAGER")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id: rawId } = await params
  const id = parseInt(rawId)

  const { newExecutorId } = await req.json()
  if (!newExecutorId)
    return NextResponse.json({ error: "newExecutorId required" }, { status: 400 })

  const subTask = await prisma.subTask.findUnique({ where: { id } })
  if (!subTask) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const updated = await prisma.subTask.update({
    where: { id },
    data:  {
      executorId:    parseInt(newExecutorId),
      status:        "ALLOTTED",
      scheduledDate: null,
    }
  })

  await prisma.subTaskHistory.create({
    data: {
      subTaskId:   id,
      changedById: session.user.id,
      oldStatus:   subTask.status,
      newStatus:   "ALLOTTED",
      note:        `Reallocated to executor ID ${newExecutorId}`,
    }
  })

  return NextResponse.json(updated)
}