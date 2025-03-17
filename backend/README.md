
# EasyHR Backend

A comprehensive backend for the EasyHR human resources management system.

## Features

- User authentication with JWT
- Email verification
- Company management
- Department management
- Role management
- Employee management
- Input validation
- Error handling

## Prerequisites

- Node.js (v14+)
- MongoDB (v4+)

## Getting Started

1. Clone the repository
2. Navigate to the backend directory
3. Install dependencies:
   ```
   npm install
   ```
4. Copy the example environment file:
   ```
   cp .env.example .env
   ```
5. Update the `.env` file with your configuration
6. Start the development server:
   ```
   npm run dev
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user and company
- `POST /api/auth/login` - Login
- `POST /api/auth/verify-email` - Verify email address
- `POST /api/auth/resend-verification` - Resend verification email
- `POST /api/auth/update-email` - Update email address
- `POST /api/auth/create-password` - Create password

### Departments

- `GET /api/departments` - Get all departments
- `POST /api/departments` - Create a new department
- `GET /api/departments/:id` - Get department by ID
- `PUT /api/departments/:id` - Update department
- `DELETE /api/departments/:id` - Delete department

### Roles

- `GET /api/roles` - Get all roles
- `POST /api/roles` - Create a new role
- `GET /api/roles/:id` - Get role by ID
- `PUT /api/roles/:id` - Update role
- `DELETE /api/roles/:id` - Delete role
- `GET /api/roles/department/:departmentId` - Get roles by department

### Employees

- `GET /api/employees` - Get all employees
- `POST /api/employees` - Create a new employee
- `GET /api/employees/:id` - Get employee by ID
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee
- `GET /api/employees/department/:departmentId` - Get employees by department
- `GET /api/employees/role/:roleId` - Get employees by role

## Testing

Run tests using:
```
npm test
```
