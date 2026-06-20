import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { validateRemark } from "@/lib/aiValidator"

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id: rawId } = await params
  const id = parseInt(rawId)

  const formData         = await req.formData()
  const submissionStatus = formData.get("submissionStatus")
  const remark           = formData.get("remark")
  const file             = formData.get("file")

  if (!submissionStatus || !remark)
    return NextResponse.json({ error: "Status and remark required" }, { status: 400 })

  if (remark.trim().length < 10)
    return NextResponse.json({
      warning: true,
      message: "Remark is too short. Please describe your work in at least 10 characters."
    }, { status: 400 })

  // AI validation
  const hasAttachment = file && file.size > 0
  const aiResult = await validateRemark(remark, hasAttachment)

  if (!aiResult.valid) {
    return NextResponse.json({
      warning: true,
      message: `⚠️ AI Review: ${aiResult.reason}`
    }, { status: 400 })
  }

  // Handle file upload
  let attachmentPath = null
  if (hasAttachment) {
    const bytes     = await file.arrayBuffer()
    const buffer    = Buffer.from(bytes)
    const uploadDir = join(process.cwd(), "public", "uploads")
    await mkdir(uploadDir, { recursive: true })
    const filename  = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`
    await writeFile(join(uploadDir, filename), buffer)
    attachmentPath  = `/uploads/${filename}`
  }

  const subTask = await prisma.subTask.findUnique({ where: { id } })
  if (!subTask) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const updated = await prisma.subTask.update({
    where: { id },
    data:  { status: "COMPLETED", submissionStatus, remark, attachmentPath }
  })

  await prisma.subTaskHistory.create({
    data: {
      subTaskId:   id,
      changedById: session.user.id,
      oldStatus:   subTask.status,
      newStatus:   "COMPLETED",
      note:        `Submitted as ${submissionStatus}`,
    }
  })

  return NextResponse.json(updated)
}