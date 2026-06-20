import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const templates = await prisma.taskTemplate.findMany({
    include: {
      activities: {
        include: { subTasks: true },
        orderBy: { sortOrder: "asc" }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  return NextResponse.json(templates)
}

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { name, description, activities } = await req.json()

  if (!name || !activities?.length)
    return NextResponse.json({ error: "Name and activities required" }, { status: 400 })

  const template = await prisma.taskTemplate.create({
    data: {
      name,
      description,
      activities: {
        create: activities.map((a, ai) => ({
          name:          a.name,
          description:   a.description,
          estimatedDays: parseInt(a.estimatedDays) || 1,
          sortOrder:     ai,
          subTasks: {
            create: (a.subTasks || []).map((s, si) => ({
              name:          s.name,
              description:   s.description,
              defaultDays:   parseInt(s.defaultDays) || 1,
              precedenceType: s.precedenceType || "NONE",
              sortOrder:     si,
            }))
          }
        }))
      }
    },
    include: { activities: { include: { subTasks: true } } }
  })

  return NextResponse.json(template, { status: 201 })
}