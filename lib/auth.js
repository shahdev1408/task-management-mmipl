import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

if (!process.env.NEXTAUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = process.env.AUTH_SECRET || "tms-secret-2024-abc123xyz"
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const rawEmail = credentials.email.trim().toLowerCase()
        const password = credentials.password.trim()

        // Match exact or alias
        const aliasMap = {
          "supervisor": "supervisor@mmipl.in",
          "manager": "manager@mmipl.in",
          "executor": "executor@mmipl.in",
        }
        const targetEmail = aliasMap[rawEmail] || rawEmail

        let user = await prisma.user.findFirst({
          where: {
            email: { equals: targetEmail, mode: "insensitive" }
          }
        })

        // Secondary fallback to legacy demo accounts if role user not found
        if (!user) {
          const legacyFallbacks = {
            "supervisor@mmipl.in": "alice@test.com",
            "manager@mmipl.in": "bob@test.com",
            "executor@mmipl.in": "dave@test.com",
            "alice@test.com": "supervisor@mmipl.in",
            "bob@test.com": "manager@mmipl.in",
            "dave@test.com": "executor@mmipl.in",
          }
          const altEmail = legacyFallbacks[targetEmail]
          if (altEmail) {
            user = await prisma.user.findFirst({
              where: {
                email: { equals: altEmail, mode: "insensitive" }
              }
            })
          }
        }

        if (!user) return null
        if (user.isActive === false) return null
        const valid = await bcrypt.compare(password, user.password)
        if (!valid) return null
        return { id: user.id, name: user.name, email: user.email, role: user.role }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) { token.id = user.id; token.role = user.role }
      return token
    },
    async session({ session, token }) {
      session.user.id   = token.id
      session.user.role = token.role
      return session
    },
  },
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET || "tms-secret-2024-abc123xyz",
}