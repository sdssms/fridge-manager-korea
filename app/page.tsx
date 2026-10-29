import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/auth'
import Dashboard from '@/components/dashboard'
export default async function HomePage() {
  const user = await requireUser()
  if (!user) redirect('/login')
  if (!user.householdId) redirect('/onboarding')
  return <Dashboard />
}
