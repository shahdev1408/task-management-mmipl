// app/page.js
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function Home() {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) redirect('/login')
  const role = session.user.role ? session.user.role.toLowerCase() : 'executor'
  redirect(`/dashboard/${role}`)
}