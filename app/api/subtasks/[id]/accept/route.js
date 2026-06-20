import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { scheduledDate } = await req.json()
  const { id: rawId } = await params
  const id = parseInt(rawId)

  const updated = await prisma.subTask.update({
    where: { id },
    data:  { status: "ONGOING", scheduledDate: new Date(scheduledDate) }
  })

  await prisma.subTaskHistory.create({
    data: {
      subTaskId:   id,
      changedById: session.user.id,
      oldStatus:   "ALLOTTED",
      newStatus:   "ONGOING",
      note:        "Accepted by executor",
    }
  })

  return NextResponse.json(updated)
}