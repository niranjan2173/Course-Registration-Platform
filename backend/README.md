# Course Registration Backend API

## Project Information
- Version: 1.0.0
- Stack: Node.js, Express.js, SQLite, JWT
- Database file: `backend/course_registration.db`
- Default base URL: `http://localhost:4000`

## Features
- JWT-based authentication
- Student and admin roles
- Course listing and registration
- Progress and attendance tracking
- Admin APIs for users, courses, and registrations
- SQLite persistence with auto-seeding

## Quick Start

### Prerequisites
- Node.js 16+
- npm

### Setup
1. Install dependencies
   ```bash
   npm install
   ```
2. Create environment file
   ```bash
   copy .env.example .env
   ```
3. Update `JWT_SECRET` in `.env`
4. Start backend
   ```bash
   npm run dev
   ```
   or
   ```bash
   npm start
   ```

## Default Accounts
- Student: `student@college.edu` / `student123`
- Admin: `admin@college.edu` / `admin123`

## API Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### Courses
- `GET /api/courses`

### Registrations (Auth)
- `POST /api/registrations`
- `GET /api/registrations/me`
- `PATCH /api/registrations/:courseId/progress`
- `POST /api/registrations/:courseId/attendance`

### Admin (Admin Auth)
- `GET /api/registrations`
- `GET /api/admin/users`
- `GET /api/admin/courses`
- `GET /api/admin/registrations`

### Debug
- `GET /api/debug/latest-users`

## Authentication Header
For protected routes:
```http
Authorization: Bearer <token>
```

## Project Structure

```text
backend/
+-- src/
¦   +-- db.js              # SQLite schema + seed + mappers
¦   +-- server.js          # App bootstrap
¦   +-- middleware/        # Auth middlewares
¦   +-- routes/            # API routes
¦   +-- services/          # Business/data services
+-- course_registration.db # SQLite database file
+-- package.json
+-- .env.example
+-- README.md
```

---

## Database Schema

### ER Diagram (Text)

```text
USERS (1) --------------------< REGISTRATIONS >-------------------- (1) COURSES

USERS
- id (PK)
- name
- email (UNIQUE)
- password
- role
- department
- roll_number

COURSES
- id (PK)
- name
- code (UNIQUE)
- instructor
- description
- credits
- price
- duration
- schedule
- max_students
- enrolled_students
- category

REGISTRATIONS
- id (PK)
- student_id (FK -> users.id)
- course_id (FK -> courses.id)
- registration_date
- payment_completed
- amount_paid
- progress
- current_streak
- longest_streak
- last_access_date
- UNIQUE(student_id, course_id)
```

### Table: `users`

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique user ID |
| name | TEXT | NOT NULL | Full name |
| email | TEXT | UNIQUE, NOT NULL | Login email |
| password | TEXT | NOT NULL | Hashed password |
| role | TEXT | NOT NULL, DEFAULT 'student' | `student` or `admin` |
| department | TEXT | NULL | Department name |
| roll_number | TEXT | NULL | Roll number / admin code |

### Table: `courses`

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique course ID |
| name | TEXT | NOT NULL | Course title |
| code | TEXT | UNIQUE, NOT NULL | Course code (e.g. `CS301`) |
| instructor | TEXT | NOT NULL | Instructor name |
| description | TEXT | NOT NULL | Course summary |
| credits | INTEGER | NOT NULL | Credit value |
| price | INTEGER | NOT NULL | Course fee |
| duration | TEXT | NOT NULL | Course duration |
| schedule | TEXT | NOT NULL | Combined day/time schedule |
| max_students | INTEGER | NOT NULL | Maximum seats |
| enrolled_students | INTEGER | NOT NULL, DEFAULT 0 | Current enrolled count |
| category | TEXT | NOT NULL | Course category |

### Table: `registrations`

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique registration ID |
| student_id | INTEGER | NOT NULL, FK -> users.id | Student reference |
| course_id | INTEGER | NOT NULL, FK -> courses.id | Course reference |
| registration_date | TEXT | NOT NULL | ISO timestamp |
| payment_completed | INTEGER | NOT NULL, DEFAULT 1 | 1 = true, 0 = false |
| amount_paid | INTEGER | NOT NULL | Paid amount |
| progress | INTEGER | NOT NULL, DEFAULT 0 | Progress percentage |
| current_streak | INTEGER | NOT NULL, DEFAULT 0 | Current attendance streak |
| longest_streak | INTEGER | NOT NULL, DEFAULT 0 | Best streak |
| last_access_date | TEXT | NULL | Last attendance/progress update |

### Key Constraints
- `users.email` is unique
- `courses.code` is unique
- `registrations` has unique pair: `(student_id, course_id)`
- Foreign keys:
  - `registrations.student_id -> users.id`
  - `registrations.course_id -> courses.id`

## Seed Data
On first run, backend seeds:
- 2 users (1 student, 1 admin)
- 6 courses
- 1 sample registration for the student

## Notes
- Passwords are hashed with `bcryptjs`.
- JWT is used for auth and role-based access.
- SQLite DB is initialized automatically via `initDb()`.
