import { getCurrentUser } from '@/lib/auth'
import { UpcomingLeavesWidget } from '@/components/leaves/upcoming-leaves-widget'
import { LeaveQuotaDisplay } from '@/components/leaves/leave-quota-display'
import { calculateLeaveQuota } from '@/lib/leave-calculations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Users, FileText } from 'lucide-react'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'

export default async function UserDashboard() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  if (user.role !== 'USER') {
    redirect(user.role === 'SUPER_ADMIN' ? '/super-admin/dashboard' : '/admin/dashboard')
  }

  // Fetch user's leave quota
  const quotaInfo = await calculateLeaveQuota(user.id)

  // Fetch user's recent leaves
  const recentLeaves = await prisma.leave.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 3,
  })

  // Fetch total active users count (only USER role, excluding current user)
  const activeUsersCount = await prisma.user.count({
    where: {
      isActive: true,
      role: 'USER',
      id: { not: user.id }
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome back, {user.name || user.email}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Leave Quota</CardTitle>
            <Calendar className="h-5 w-5 text-[#3274D5]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{quotaInfo.remainingQuota} days</div>
            <p className="text-xs text-slate-500 mt-1">
              {quotaInfo.usedQuota} used of {quotaInfo.totalQuota}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Pending Requests</CardTitle>
            <FileText className="h-5 w-5 text-[#F59E0B]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {recentLeaves.filter((l) => l.status === 'PENDING').length}
            </div>
            <p className="text-xs text-slate-500 mt-1">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Team Members</CardTitle>
            <Users className="h-5 w-5 text-[#06B6D4]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{activeUsersCount}</div>
            <p className="text-xs text-slate-500 mt-1">Active employees</p>
          </CardContent>
        </Card>
      </div>

      {/* Widgets */}
      <div className="grid gap-6 md:grid-cols-2">
        <UpcomingLeavesWidget />
        <LeaveQuotaDisplay quota={quotaInfo} />
      </div>
    </div>
  )
}
