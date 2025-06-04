
# ComPetny Foster Management System Documentation

## Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Features](#features)
4. [Technical Stack](#technical-stack)
5. [API Documentation](#api-documentation)
6. [Database Schema](#database-schema)
7. [Security](#security)
8. [Deployment Guide](#deployment-guide)
9. [Contributing Guidelines](#contributing-guidelines)

## Overview
ComPetny is a web-based foster management system that connects potential foster parents with pets in need of temporary homes. The system streamlines the pet fostering process while ensuring the safety and well-being of both pets and foster families.

## System Architecture
- Frontend: React-based SPA with TypeScript
- Backend: Express.js server
- Database: PostgreSQL with Drizzle ORM
- Authentication: Session-based with Passport.js
- UI Components: Shadcn/ui with Tailwind CSS
- State Management: React Query

## Features

### 1. User Authentication
- Email and password authentication
- Secure session management
- Password recovery functionality
- Role-based access control (Admin/User)

### 2. Pet Management
#### For Users
- Browse available pets with filtering options
- Search by breed, size, age, and other criteria
- View detailed pet profiles
- Real-time pet availability status
- Save favorite pets

#### For Administrators
- Add/Edit pet profiles
- Manage pet availability
- Upload pet photos
- Track foster history

### 3. Foster Application Process
- Online application submission
- Multi-step application workflow
- Document upload capability
- Application status tracking
- Automated notifications
- Admin review interface

### 4. Pet Tracking System
- Real-time location monitoring
- Health status updates
- Activity tracking
- Alert system for emergencies
- Safe zone management

### 5. User Dashboard
#### Foster Parents
- Personal information management
- Current and past foster records
- Upcoming appointments
- Pet care schedules
- Notification center

#### Administrators
- Application review queue
- System analytics
- User management
- Content management
- Security logs

### 6. Pet Care Resources
- Educational articles
- Care guidelines by pet type
- First aid information
- Training resources
- Nutrition guides

## Technical Stack
### Frontend
- React 18
- TypeScript
- Tailwind CSS
- Shadcn/ui components
- React Query for state management
- React Hook Form for form handling

### Backend
- Node.js
- Express.js
- PostgreSQL
- Drizzle ORM
- Passport.js
- Express Session

### Development Tools
- Vite
- ESLint
- TypeScript
- Prettier
- Drizzle Kit

## API Documentation

### Authentication Endpoints
```typescript
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/user
POST /api/auth/reset-password
```

### Pet Management Endpoints
```typescript
GET /api/pets
GET /api/pets/:id
POST /api/pets
PUT /api/pets/:id
DELETE /api/pets/:id
GET /api/pets/search
```

### Application Endpoints
```typescript
POST /api/applications
GET /api/applications
GET /api/applications/:id
PUT /api/applications/:id
GET /api/my-applications
```

### User Management Endpoints
```typescript
GET /api/users
GET /api/users/:id
PUT /api/users/:id
DELETE /api/users/:id
```

## Database Schema
### Users Table
- id (PRIMARY KEY)
- email (UNIQUE)
- password_hash
- role (ENUM: 'admin', 'user')
- created_at
- updated_at

### Pets Table
- id (PRIMARY KEY)
- name
- species
- breed
- age
- size
- status
- description
- created_at
- updated_at

### Applications Table
- id (PRIMARY KEY)
- user_id (FOREIGN KEY)
- pet_id (FOREIGN KEY)
- status
- submitted_at
- updated_at

## Security
- Password hashing with bcrypt
- CSRF protection
- Rate limiting
- Session management
- Input validation
- SQL injection prevention
- XSS protection

## Deployment Guide
1. Set up environment variables
2. Configure PostgreSQL database
3. Build frontend assets
4. Start the application
5. Monitor logs and performance

## Contributing Guidelines
1. Fork the repository
2. Create a feature branch
3. Follow coding standards
4. Write tests
5. Submit pull request

## Local Development Setup

### Prerequisites
- Node.js (v20 or later)
- PostgreSQL (v16 or later)

### Environment Variables
Create a `.env` file in the root directory with the following variables:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/competny
SESSION_SECRET=your_session_secret_here
NODE_ENV=development
```

### Installation Steps

1. Clone the repository
```bash
git clone <repository-url>
cd competny
```

2. Install dependencies
```bash
npm install
```

3. Set up the database
```bash
npm run db:push
```

4. Start the development server
```bash
npm run dev
```

The application will be available at `http://0.0.0.0:5000`

### Development Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Type check with TypeScript
- `npm run db:push` - Push database schema changes

## License
MIT License

