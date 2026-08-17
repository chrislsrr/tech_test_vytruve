# Vytruve Technical Test - Orthoprosthetist Management System

A full-stack application for orthoprosthetists to manage patients, upload 3D files, and request socket printing through the Vytruve API.

## Features

- **Authentication**: User registration and login with JWT token management
- **Patient Management**: Create, view, and manage patient records
- **3D File Management**: Upload and download 3D files (.ply) associated with patients
- **Print Job Management**: Request printing of 3D files and track job status through the Vytruve API
- **Secure Access**: Protected routes requiring authentication

## Project Structure

```
.
├── backend/           # NestJS application
│   ├── src/
│   │   ├── auth/         # Authentication module (JWT, Passport)
│   │   ├── users/        # User management
│   │   ├── patients/     # Patient CRUD operations
│   │   ├── files/        # 3D file upload/download
│   │   ├── printing/     # Vytruve API integration
│   │   ├── common/       # Shared exceptions and utilities
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── database.sqlite  # SQLite database
│   ├── uploads/         # Uploaded 3D files
│   └── .env            # Environment configuration
│
└── frontend/          # React application
    ├── src/
    │   ├── components/    # Reusable UI components
    │   ├── pages/         # Application pages
    │   ├── services/      # API service layer
    │   ├── hooks/         # Custom React hooks
    │   ├── types/         # TypeScript definitions
    │   ├── App.tsx
    │   └── main.tsx
    └── .env.example      # Frontend environment template
```

## Prerequisites

- Node.js >= 20.x
- npm >= 10.x or yarn >= 1.x
- Git

## Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd tech_test_vytruve
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

### 3. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

### 4. Configure Environment Variables

#### Backend Configuration (`.env`)

The backend uses SQLite by default. Create backend/.env`:

```env
# Database Configuration (SQLite)
DB_PATH=./database.sqlite

# JWT Configuration
JWT_SECRET=your_secure_jwt_secret_here
JWT_EXPIRES_IN=1h

# API Configuration
PORT=3000

# Vytruve API Configuration
VYTRUVE_API_URL=https://cl.techtest.vytruve.com
VYTRUVE_API_KEY=**********
```

**Note**: The provided API key and URL are for the Vytruve test environment.

#### Frontend Configuration (`.env`)

Copy the example file and update as needed:

```bash
cd frontend
cp .env.example .env
```

Update `VITE_API_URL` if your backend runs on a different port:

```env
VITE_API_URL=http://localhost:3000
```

## Running the Project

### Development Mode

Open two separate terminal windows:

**Terminal 1 - Backend:**

```bash
cd backend
npm run start:dev
```

The backend will be available at:

- API: `http://localhost:3000`
- Swagger Docs: `http://localhost:3000/api`

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

The frontend will be available at: `http://localhost:5173`

## Configuration

### Database

The application uses SQLite for simplicity in development. The database file (`database.sqlite`) is created automatically in the `backend` directory on first run.

For production, consider switching to PostgreSQL or MySQL by updating the TypeORM configuration in `app.module.ts`.

### CORS

The backend is configured to accept requests from `http://localhost:5173` (Vite default). Update the CORS origin in `main.ts` if using a different frontend URL:

```typescript
app.enableCors({
  origin: "http://your-frontend-url:port",
  credentials: true,
});
```

## API Documentation

The backend includes Swagger UI for API documentation. Once running, access it at:

```
http://localhost:3000/api
```

Swagger provides interactive documentation for all available endpoints, including:

- Authentication endpoints (`/auth/register`, `/auth/login`)
- User management endpoints
- Patient management endpoints
- File upload/download endpoints
- Print job endpoints

## Technical Choices & Trade-offs

_Development approach: Backend was implemented first, then frontend._

### Backend

- **Auth JWT**: Tokens in localStorage, simple but vulnerable to XSS → HttpOnly cookies in production
- **Route protection**: JwtAuthGuard + @CurrentUser decorator, no RBAC → add role-based access control
- **Resource ownership**: Manual checks in each service → generic interceptor
- **File storage**: Local disk with Multer → S3/MinIO
- **Database**: SQLite + TypeORM → PostgreSQL with migrations
- **Vytruve API**: Direct Axios calls → retry + circuit breaker
- **CORS**: Hardcoded → environment variables
- **Error handling**: Custom exceptions → global filter
- **Pagination**: Missing on some endpoints (patients, files) → to be added

### Frontend

- **Routing**: ProtectedRoute with token in localStorage → HttpOnly cookies
- **State**: Local state → Redux/Zustand
- **File upload**: Standard FormData → progress bar
- **Error handling**: Basic try/catch → toast
- **Styling**: Minimal → TailwindCSS/Material-UI
- **Pagination**: Missing on lists (patients, files) → to be added

## AI Assistance

This project was developed with the assistance of Mistral Vibe.

**How AI was used:**

- Definition of technical requirements from INSTRUCTION.md to produce a structured task list
- Task list enrichment with technical options to prioritize and define a project MVP
- Code generation and prompt/iteration/correction cycles to achieve expected results
- Debugging and error resolution
