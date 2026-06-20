import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id: rawId } = await params
  const id = parseInt(rawId)
  const body = await req.json()
  const isSelf = session.user.id === id
  const isSupervisor = session.user.role === "SUPERVISOR"

  if (!isSelf && !isSupervisor)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const data = {}

  if (body.name)  data.name  = body.name
  if (body.email) data.email = body.email

  if (body.password) {
    if (isSelf && body.currentPassword) {
      const user = await prisma.user.findUnique({ where: { id } })
      const valid = await bcrypt.compare(body.currentPassword, user.password)
      if (!valid) return NextResponse.json({ error: "Current password incorrect" }, { status: 400 })
    }
    data.password = await bcrypt.hash(body.password, 10)
  }

  if (isSupervisor) {
    if (body.role     !== undefined) data.role     = body.role
    if (body.isActive !== undefined) data.isActive = body.isActive
  }

  const updated = await prisma.user.update({ where: { id }, data, select: { id: true, name: true, email: true, role: true, isActive: true } })
  return NextResponse.json(updated)
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "SUPERVISOR")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id: rawId } = await params
  const id = parseInt(rawId)

  await prisma.user.update({ where: { id }, data: { isActive: false } })
  return NextResponse.json({ success: true })
}