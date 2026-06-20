import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "SUPERVISOR")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const history = await prisma.subTaskHistory.findMany({
    include: {
      changedBy: { select: { name: true, role: true } },
      subTask:   { select: { name: true } },
    },
    orderBy: { changedAt: "desc" },
    take:    50,
  })

  return NextResponse.json(history)
}