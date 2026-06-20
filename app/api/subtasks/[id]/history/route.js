import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id: rawId } = await params
  const id = parseInt(rawId)

  const history = await prisma.subTaskHistory.findMany({
    where:   { subTaskId: id },
    include: { changedBy: { select: { name: true, role: true } } },
    orderBy: { changedAt: "desc" },
  })

  return NextResponse.json(history)
}