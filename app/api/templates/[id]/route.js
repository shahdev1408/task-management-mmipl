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

  if (!name || !activities?.length)
    return NextResponse.json({ error: "Name and activities required" }, { status: 400 })

  try {
    const result = await prisma.$transaction(async (tx) => {
      await tx.subTaskTemplate.deleteMany({
        where: { activity: { templateId: id } }
      })
      await tx.activityTemplate.deleteMany({
        where: { templateId: id }
      })

      const updated = await tx.taskTemplate.update({
        where: { id },
        data: {
          name,
          description: description || null,
          activities: {
            create: activities.map((a, ai) => ({
              name:          a.name,
              description:   a.description   || null,
              estimatedDays: parseInt(a.estimatedDays) || 1,
              sortOrder:     ai,
              prePerson:     a.prePerson     || null,
              postPerson:    a.postPerson    || null,
              subTasks: {
                create: (a.subTasks || []).map((s, si) => ({
                  name:               s.name,
                  description:        s.description        || null,
                  defaultDays:        parseInt(s.defaultDays) || 1,
                  precedenceType:     s.precedenceType     || "NONE",
                  attachmentRequired: s.attachmentRequired || null,
                  sortOrder:          si,
                }))
              }
            }))
          }
        },
        include: {
          activities: {
            include: { subTasks: true },
            orderBy: { sortOrder: "asc" }
          }
        }
      })

      return updated
    })

    return NextResponse.json(result)
  } catch (err) {
    console.error("Template update error:", err)
    return NextResponse.json({ error: "Failed to update template" }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id: rawId } = await params
  const id = parseInt(rawId)

  try {
    await prisma.$transaction(async (tx) => {
      await tx.subTaskTemplate.deleteMany({
        where: { activity: { templateId: id } }
      })
      await tx.activityTemplate.deleteMany({
        where: { templateId: id }
      })
      await tx.taskTemplate.delete({
        where: { id }
      })
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Template delete error:", err)
    return NextResponse.json({ error: "Failed to delete template" }, { status: 500 })
  }
}