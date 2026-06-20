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

  const { rating } = await req.json()

  if (rating < 0 || rating > 5)
    return NextResponse.json({ error: "Rating must be 0-5" }, { status: 400 })

  const updated = await prisma.subTask.update({
    where: { id },
    data:  { rating: parseInt(rating) }
  })

  return NextResponse.json(updated)
}