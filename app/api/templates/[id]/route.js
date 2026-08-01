import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id: rawId } = await params
  const id = parseInt(rawId)

  const template = await prisma.taskTemplate.findUnique({
    where: { id },
    include: {
      activities: {
        include: { subTasks: true },
        orderBy: { sortOrder: "asc" }
      }
    }
  })

  if (!template) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(template)
}

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id: rawId } = await params
  const id = parseInt(rawId)
  const { name, description, activities } = await req.json()

  await prisma.subTaskTemplate.deleteMany({
    where: { activity: { templateId: id } }
  })
  await prisma.activityTemplate.deleteMany({ where: { templateId: id } })

  const updated = await prisma.taskTemplate.update({
    where: { id },
    data: {
      name,
      description,
      activities: {
        create: activities.map((a, ai) => ({
          name:          a.name,
          description:   a.description || null,
          estimatedDays: parseInt(a.estimatedDays) || 1,
          sortOrder:     ai,
          prePerson:     a.prePerson  || null,
          postPerson:    a.postPerson || null,
          subTasks: {
            create: (a.subTasks || []).map((s, si) => ({
              name:               s.name,
              description:        s.description  || null,
              defaultDays:        parseInt(s.defaultDays) || 1,
              precedenceType:     s.precedenceType || "NONE",
              attachmentRequired: s.attachmentRequired || null,
              sortOrder:          si,
            }))
          }
        }))
      }
    },
    include: { activities: { include: { subTasks: true } } }
  })

  return NextResponse.json(updated)
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "SUPERVISOR")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id: rawId } = await params
  const id = parseInt(rawId)

  await prisma.subTaskTemplate.deleteMany({
    where: { activity: { templateId: id } }
  })
  await prisma.activityTemplate.deleteMany({ where: { templateId: id } })
  await prisma.taskTemplate.delete({ where: { id } })

  return NextResponse.json({ success: true })
}