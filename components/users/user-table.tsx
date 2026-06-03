'use client'

import { User } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Pencil } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface UserTableProps {
  users: User[]
  showEditOptions?: boolean
  onEdit?: (user: User) => void
  onToggleStatus?: (userId: string, isActive: boolean) => void
  onToggleRole?: (userId: string, role: string) => void
}

export function UserTable({ users, showEditOptions = false, onEdit, onToggleStatus, onToggleRole }: UserTableProps) {
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Super Admin</Badge>
      case 'ADMIN':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Admin</Badge>
      default:
        return <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100">User</Badge>
    }
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-0">Active</Badge>
    ) : (
      <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100">Inactive</Badge>
    )
  }

  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Leave Quota</TableHead>
            {showEditOptions && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showEditOptions ? 6 : 5} className="text-center text-slate-500">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name || '-'}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {showEditOptions ? (
                    <Select
                      value={user.role}
                      onValueChange={(value) => onToggleRole?.(user.id, value)}
                    >
                      <SelectTrigger className="w-[120px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USER">User</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    getRoleBadge(user.role)
                  )}
                </TableCell>
                <TableCell>
                  {showEditOptions ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-600 min-w-[60px]">
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <Switch
                        checked={user.isActive}
                        onCheckedChange={(checked) => onToggleStatus?.(user.id, checked)}
                      />
                    </div>
                  ) : (
                    getStatusBadge(user.isActive)
                  )}
                </TableCell>
                <TableCell>
                  {user.baseLeaveQuota + user.extraLeaveQuota} days
                  {user.extraLeaveQuota > 0 && (
                    <span className="text-xs text-slate-500 ml-1">
                      (+{user.extraLeaveQuota})
                    </span>
                  )}
                </TableCell>
                {showEditOptions && (
                  <TableCell className="text-right">
                    <button
                      onClick={() => onEdit?.(user)}
                      className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-slate-100 transition-colors"
                      title="Edit user"
                    >
                      <Pencil className="h-4 w-4 text-slate-600" />
                    </button>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
