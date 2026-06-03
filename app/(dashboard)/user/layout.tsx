import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  if (user.role !== 'USER') {
    redirect(user.role === 'SUPER_ADMIN' ? '/super-admin/dashboard' : '/admin/dashboard')
  }

  return <DashboardShell user={user}>{children}</DashboardShell>
}
