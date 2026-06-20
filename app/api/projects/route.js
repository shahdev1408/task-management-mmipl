import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const projects = await prisma.project.findMany({ orderBy: { code: "asc" } })
  return NextResponse.json(projects)
}

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "SUPERVISOR")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { code, name, day0 } = await req.json()
  if (!code || !name || !day0)
    return NextResponse.json({ error: "All fields required" }, { status: 400 })

  const existing = await prisma.project.findUnique({ where: { code } })
  if (existing) return NextResponse.json({ error: "Project code already exists" }, { status: 400 })

  const project = await prisma.project.create({ data: { code, name, day0: new Date(day0) } })
  return NextResponse.json(project, { status: 201 })
}