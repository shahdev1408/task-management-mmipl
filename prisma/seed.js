const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding...')

  const hash = (p) => bcrypt.hashSync(p, 10)

  // Delete existing users first to avoid duplicates
  await prisma.user.deleteMany({})
  await prisma.project.deleteMany({})

  const users = await prisma.user.createMany({
    data: [
      { name: 'Alice Supervisor', email: 'alice@test.com', password: hash('password123'), role: 'SUPERVISOR' },
      { name: 'Bob Manager',      email: 'bob@test.com',   password: hash('password123'), role: 'MANAGER'    },
      { name: 'Carol Manager',    email: 'carol@test.com', password: hash('password123'), role: 'MANAGER'    },
      { name: 'Dave Executor',    email: 'dave@test.com',  password: hash('password123'), role: 'EXECUTOR'   },
      { name: 'Eve Executor',     email: 'eve@test.com',   password: hash('password123'), role: 'EXECUTOR'   },
    ],
  })

  await prisma.project.createMany({
    data: [
      { code: 'P001', name: 'Website Relaunch', day0: new Date('2024-06-01') },
      { code: 'P002', name: 'ERP Setup',        day0: new Date('2024-06-10') },
      { code: 'P003', name: 'Mobile App',       day0: new Date('2024-06-15') },
    ],
  })

  console.log('✅ Users created:', users.count)
  console.log('✅ Seed complete')
}

main()
  .catch((e) => { console.error('❌ Seed error:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())