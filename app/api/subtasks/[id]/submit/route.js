import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloudinary_url: process.env.CLOUDINARY_URL,
})

async function uploadToCloudinary(file) {
  const bytes  = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: "taskflow", resource_type: "auto" },
      (error, result) => {
        if (error) reject(error)
        else resolve(result.secure_url)
      }
    ).end(buffer)
  })
}

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

  let attachmentPath = null

  if (file && file.size > 0) {
    const isVercel = !!process.env.VERCEL

    if (isVercel) {
      attachmentPath = await uploadToCloudinary(file)
    } else {
      const { writeFile, mkdir } = await import("fs/promises")
      const { join } = await import("path")
      const bytes     = await file.arrayBuffer()
      const buffer    = Buffer.from(bytes)
      const uploadDir = join(process.cwd(), "public", "uploads")
      await mkdir(uploadDir, { recursive: true })
      const filename  = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`
      await writeFile(join(uploadDir, filename), buffer)
      attachmentPath  = `/uploads/${filename}`
    }
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