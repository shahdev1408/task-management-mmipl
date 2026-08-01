import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id: rawId } = await params
  const id = parseInt(rawId)
  const { name, description } = await req.json()

  const updated = await prisma.taskTemplate.update({
    where: { id },
    data: {
      ...(name        && { name }),
      ...(description !== undefined && { description })
    }
  })
  return NextResponse.json(updated)
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "SUPERVISOR")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id: rawId } = await params
  const id = parseInt(rawId)

  const subTaskTemplates = await prisma.subTaskTemplate.findMany({
    where: { activity: { templateId: id } }
  })
  await prisma.subTaskTemplate.deleteMany({
    where: { id: { in: subTaskTemplates.map(s => s.id) } }
  })
  await prisma.activityTemplate.deleteMany({ where: { templateId: id } })
  await prisma.taskTemplate.delete({ where: { id } })

  return NextResponse.json({ success: true })
}