'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, User } from 'lucide-react'
import { format, isToday, isTomorrow } from 'date-fns'

interface UpcomingLeave {
  id: string
  startDate: string
  endDate: string
  user: {
    name: string | null
    email: string
  }
}

export function UpcomingLeavesWidget() {
  const [leaves, setLeaves] = useState<UpcomingLeave[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUpcomingLeaves()
  }, [])

  const fetchUpcomingLeaves = async () => {
    try {
      const response = await fetch('/api/leaves/upcoming')
      if (response.ok) {
        const data = await response.json()
        setLeaves(data.leaves)
      }
    } catch (error) {
      console.error('Error fetching upcoming leaves:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDateLabel = (date: string) => {
    const d = new Date(date)
    if (isToday(d)) return 'Today'
    if (isTomorrow(d)) return 'Tomorrow'
    return format(d, 'MMM dd')
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Leaves
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">Loading...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Upcoming Leaves
        </CardTitle>
      </CardHeader>
      <CardContent>
        {leaves.length === 0 ? (
          <p className="text-sm text-slate-500">No upcoming leaves</p>
        ) : (
          <div className="space-y-3">
            {leaves.map((leave) => (
              <div key={leave.id} className="flex items-start gap-3 p-3 rounded-md bg-slate-50">
                <User className="h-4 w-4 text-slate-500 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {leave.user.name || leave.user.email}
                  </p>
                  <p className="text-xs text-slate-500">
                    {getDateLabel(leave.startDate)} - {getDateLabel(leave.endDate)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
