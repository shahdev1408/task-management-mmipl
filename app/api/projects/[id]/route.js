import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "SUPERVISOR")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id: rawId } = await params
  const id = parseInt(rawId)
  const { code, name, day0 } = await req.json()

  const updated = await prisma.project.update({
    where: { id },
    data: { ...(code && { code }), ...(name && { name }), ...(day0 && { day0: new Date(day0) }) }
  })
  return NextResponse.json(updated)
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "SUPERVISOR")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id: rawId } = await params
  const id = parseInt(rawId)
  await prisma.project.delete({ where: { id } })
  return NextResponse.json({ success: true })
}