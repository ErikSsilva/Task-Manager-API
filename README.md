
# 📝 Task Manager API

This is a REST API developed with **Node.js** for a complete **Task Management** system. The application was designed to enable teams to collaborate efficiently, ensuring that the progress of each activity can be tracked in a simple, organized, and secure manner.

---

## 🛠️ Tech Stack

* **Runtime & Language:** Node.js (>= 18) + TypeScript
* **Framework:** Express
* **Database & ORM:** PostgreSQL + Prisma ORM
* **Validation:** Zod
* **Testing:** Jest + Supertest

---



## 🔑 Key Features

* **Authentication & Security:** Secure user registration and login featuring password hashing and JWT token generation.

* **Access Control (RBAC):** Roles defined as `ADMIN` and `MEMBER`.

  * `ADMIN`: Full access to team CRUDs, members management, and task delegation.
  
  * `MEMBER`: Can only create tasks in their own teams, manage tasks assigned directly to 
  them, and check their own history.
* **Dynamic Task Management:** Complete CRUD flow for tasks with status (`PENDING`, `IN_PROGRESS`, `COMPLETED`) and priority levels (`HIGH`, `MEDIUM`, `LOW`).
* **Activity Log:** Automatically records a history track every time a task changes its status.

---


## ⚙️ Setup & Environment

### 1. Environment Variables
Create a `.env` file at the project root (you can use `.env-example` as a template):

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/task_manager_db?schema=public"
JWT_SECRET="your_jwt_secret"
PORT=3333
```
### 2. Run Database (Docker)
Start the PostgreSQL 17 container:

```
docker-compose up -d
```
### 3. Install & Start

#### Install dependencies
```
npm install
```
#### Run database migrations
```
npx prisma migrate dev
```
#### Start in development mode (with hot-reload)
```
npm run dev
```
The API will start running at http://localhost:3333 (or your custom PORT).

## 🧪 Commands Checklist
Run Tests: ```npm test```

Production Build: ```npm run build```

Start Production Build: ```npm run start```
## 📡 API Reference

Include the token in the header for authenticated requests: 
```Authorization: Bearer <token>.```

### 🔐 Authentication & Users
* **POST /users** - Register a new account.

* **POST /sessions** - Login to receive a JWT token.

### 👥 Teams (*Admin Only*)
* **POST /teams** - Create a team.

* **GET /teams** - List all teams with their members.

* **PATCH /teams/:id** - Edit team details.

* **DELETE /teams/:id** - Delete a team.

* **POST /teams/:id/members** - Add users to a team.

* **DELETE /teams/:id/members** - Remove users from a team.

* **GET /teams/:id/members** - List users belonging to a specific team.

### 📋 Tasks
* **POST /tasks** - Create a task (*Members can only create tasks in teams they belong to*).

* **GET /tasks** - List tasks with optional status and priority query filters (*Members only see tasks assigned to them*).

* **PATCH /tasks/:id** - Update task fields (*Triggers a history log if status changes*).

* **DELETE /tasks/:id** - Delete a task.

* **GET /tasks/:id/history** - Get status change history of a task.

* **PATCH /tasks/:id/assign** (Admin Only) - Assign a task to a user (*The user must belong to the task's team*).




## Author

- [@ErikSilva -](https://github.com/ErikSsilva)

