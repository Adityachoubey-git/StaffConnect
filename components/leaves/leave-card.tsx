import { Leave } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { format } from 'date-fns'
import { Calendar, User, FileText } from 'lucide-react'

interface LeaveCardProps {
  leave: Leave & { user?: { name: string | null; email: string } }
  onApprove?: (id: string) => void
  onReject?: (id: string) => void
  onDelete?: (id: string) => void
  showActions?: boolean
  showUser?: boolean
}

export function LeaveCard({ leave, onApprove, onReject, onDelete, showActions = false, showUser = true }: LeaveCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
    }
  }

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            {showUser && leave.user && (
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-gray-500" />
                <span className="font-medium">{leave.user.name || leave.user.email}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>
                {format(new Date(leave.startDate), 'MMM dd, yyyy')} - {format(new Date(leave.endDate), 'MMM dd, yyyy')}
              </span>
            </div>
          </div>
          {getStatusBadge(leave.status)}
        </div>
      </CardHeader>
      {leave.reason && (
        <CardContent className="pb-3">
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p className="line-clamp-2">{leave.reason}</p>
          </div>
        </CardContent>
      )}
      {showActions && leave.status === 'PENDING' && (
        <CardFooter className="pt-3 border-t gap-2">
          {onApprove && (
            <Button
              size="sm"
              onClick={() => onApprove(leave.id)}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Approve
            </Button>
          )}
          {onReject && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onReject(leave.id)}
              className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
            >
              Reject
            </Button>
          )}
        </CardFooter>
      )}
      {onDelete && leave.status === 'PENDING' && !showActions && (
        <CardFooter className="pt-3 border-t">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(leave.id)}
            className="w-full border-red-200 text-red-600 hover:bg-red-50"
          >
            Cancel Request
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
