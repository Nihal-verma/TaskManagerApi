# Task Manager API

A feature-rich Task Management API built with **Node.js**, **TypeScript**, **Express**, and **PostgreSQL**.  
Includes authentication, task organization, collaboration, and productivity statistics.

---

##  Features

### 1. Users
- User registration and secure login with JWT + refresh token
- Profile management with avatars
- Password reset functionality (with email support)
- User activity logging

### 2. Tasks
- CRUD operations for tasks
- Assign tasks to categories/projects
- Set due dates, priorities, and estimated time
- Track status: Not Started / In Progress / Done
- Attachments (file path references)
- Recurring tasks (daily, weekly, monthly)

### 3. Organization
- Manage categories and projects
- Filter tasks by status, priority, due date, category
- Search with multiple parameters
- Sort tasks by various fields
- Task dependencies (e.g., Task B depends on Task A)

### 4. Collaboration
- Assign tasks to users
- Share projects with team members
- Add comments to tasks
- Notification system for assigned/overdue tasks

### 5. Simple Stats
- Count finished vs. pending tasks
- Tasks grouped by category
- Overdue task notifications
- Productivity metrics (e.g., tasks completed daily/weekly)
- Project progress tracking

---

## Tech Stack

- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Auth**: JWT with refresh tokens
- **File Upload**: Multer
- **Validation**: Zod
- **Email**: Nodemailer

---

##  Security

- JWT-based authentication (access and refresh tokens)
- Secure password hashing with bcrypt
- Role-based access control (RBAC)
- Input validation and sanitization
- Basic protection against common attacks

---

##  Installation

```bash
git clone https://github.com/your-username/task-manager-api.git
cd task-manager-api
npm install
npm start
