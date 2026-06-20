import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function POST(req) {
  const { name, email, password } = await req.json()
  if (!name || !email || !password)
    return NextResponse.json({ error: "All fields required" }, { status: 400 })

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing)
    return NextResponse.json({ error: "Email already registered" }, { status: 400 })

  const hashed = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { name, email, password: hashed, role: "EXECUTOR", isActive: true }
  })

  return NextResponse.json({ id: user.id, name: user.name }, { status: 201 })
}