# Employee Management System

A comprehensive employee management system with role-based access control, leave management, and user administration built with Next.js, Supabase, Prisma, and shadcn/ui.

## Features

### Authentication
- Supabase Auth integration
- Role-based access control (User, Admin, Super Admin)
- Secure session management
- Route protection middleware

### User Management (Super Admin Only)
- Create new users with email/password
- Assign roles (User, Admin)
- Soft delete (activate/deactivate users)
- Edit user details
- Search and filter users

### Leave Management
- **Users**: Apply for leave, view quota, track history
- **Admins**: Approve/reject leave requests
- **Super Admins**: Full leave management + quota control
- Automatic quota calculations
- Upcoming leaves dashboard widget

### Leave Quota System
- Base leave quota (default: 20 days)
- Extra leave quota (granted by Super Admin)
- Automatic usage tracking
- Visual quota display with progress bars
- **Restriction**: Only Super Admins can modify quotas

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL (Supabase) with Prisma ORM
- **UI Components**: shadcn/ui + TailwindCSS
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account and project
- npm or yarn

### Installation

1. **Clone the repository** (if applicable)

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Variables**:
   The `.env` file should contain:
   ```
   DATABASE_URL="your-supabase-pooler-url"
   DIRECT_URL="your-supabase-direct-url"
   NEXT_PUBLIC_SUPABASE_URL="your-supabase-project-url"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
   ```

4. **Generate Prisma Client**:
   ```bash
   npm run db:generate
   ```

5. **Push Database Schema**:
   ```bash
   npm run db:push
   ```

6. **Run Development Server**:
   ```bash
   npm run dev
   ```

7. **Open Application**:
   Visit [http://localhost:3000](http://localhost:3000)

## User Roles

### Super Admin
- **Full System Access**
- Create, edit, and deactivate users
- Assign Admin roles
- Approve/reject leave requests
- Set and modify leave quotas
- View all system data

### Admin
- **Limited Management Access**
- Approve/reject leave requests
- View all users (read-only)
- **Cannot**: Apply for leave, modify quotas, add/delete users

### User
- **Employee Access**
- Apply for leave
- View leave quota and history
- View team members
- See upcoming leaves
- **Cannot**: Access admin features
