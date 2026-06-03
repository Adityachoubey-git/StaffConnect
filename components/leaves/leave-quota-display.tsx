import { LeaveQuotaInfo } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from 'lucide-react'

interface LeaveQuotaDisplayProps {
  quota: LeaveQuotaInfo
}

export function LeaveQuotaDisplay({ quota }: LeaveQuotaDisplayProps) {
  const percentage = (quota.usedQuota / quota.totalQuota) * 100

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Leave Quota
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-end gap-2">
            <span className="text-3xl font-semibold">{quota.remainingQuota}</span>
            <span className="text-slate-500 mb-1">/ {quota.totalQuota} days</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div
              className="bg-[#3274D5] h-2 rounded-full transition-all"
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t text-sm">
            <div>
              <p className="text-slate-500">Used</p>
              <p className="font-medium">{quota.usedQuota} days</p>
            </div>
            <div>
              <p className="text-slate-500">Remaining</p>
              <p className="font-medium">{quota.remainingQuota} days</p>
            </div>
          </div>

          {quota.extraQuota > 0 && (
            <div className="pt-2 border-t text-xs text-slate-500">
              Base: {quota.baseQuota} days + Extra: {quota.extraQuota} days
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
