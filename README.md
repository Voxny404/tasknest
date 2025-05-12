# 🐦 Task Nest

**Task Nest** is a lightweight and modern task management system designed to help users organize and track project-related tasks. It includes both a backend (Node.js + Express) and a dynamic frontend UI, built for developers and teams that want simple yet powerful task control.

---

## 🚀 Features

- 🧩 **Task Management** – Create, categorize, and monitor tasks with various properties (priority, type, state, etc.).
- 🔐 **JWT Authentication** – Secure access using JSON Web Tokens.
- 👥 **User Roles** – Only registered users can create new accounts; admin setup required.
- 💾 **SQLite** – Lightweight, file-based database powered by `better-sqlite3`.
- 🌐 **API Access** – Full-featured REST API for external integrations or CLI usage.
- 💻 **Modern UI** – Stylish, clean interface with Markdown-powered task reports and syntax highlighting.
- 📦 **No External DB Required** – Quick setup without external dependencies.

---

## 🛠️ Setup Instructions

1. **Clone the repository**  
   ```bash
   git clone https://github.com/Voxny404/tasknest.git
   cd tasknest
   ```

2. **Install dependencies**  
   ```bash
   npm install
   ```

3. **Create environment file**  
   Add a `.env` file in the root directory with your JWT secret key:
   ```env
    # JWT Secret for authentication
    JWT_SECRET=your_super_secret_key

    # Additional task states to be merged with default states
    ADDITIONAL_TASK_STATES=needs-approval,qa-review,internal-review

    # Additional priority levels to be merged with default levels
    ADDITIONAL_PRIORITY_LEVELS=blocker,showstopper

    # Additional categories to be added to the categories list
    ADDITIONAL_CATEGORIES=testFromEnv

    # Additional types to be added to the types list
    ADDITIONAL_TYPES=TypeFromEnv
   ```

4. **Initialize the database and start the server**  
   ```bash
   node index.js
   ```

5. **Create the first admin user**  
   > ⚠️ **Make sure to edit the password inside `createAdminUser.js` before running this.**
   ```bash
   node createAdminUser.js
   ```

   ---

## 🖥️ UI Highlights

   - Tasks can include rich **Markdown-formatted reports**
   - Inline **code syntax highlighting** using [Prism.js](https://prismjs.com/)
   - Mobile-friendly, responsive design
   - 🔐 Role-based UI visibility

   ---

## 📁 Project Structure

   ```
   tasknest/
    ├── public/              # Frontend HTML/CSS/JS
    |   └── dashboard/       # Main dashboard UI
    ├── routes/              # Express routes (e.g., auth, tasks)
    ├── services/            # Logic and database interaction
    ├── createAdminUser.js   # Script to bootstrap an admin
    ├── index.js             # Entry point
    ├── .env                 # (Ignored) Environment secrets
    └── taskNest*.sqlite     # SQLite databases (ignored)
    ```

---

### 📡 All API routes require a valid JWT token in the `Authorization` header.

---

### `GET /api/tasks/filter`

* **Description:** Fetches tasks based on filters and pagination  
* **Authorization:** Required (Bearer Token)  
* **Example:**

```http
GET http://localhost:3000/api/tasks/filter?state=open&priority=High&limit=5&offset=10
Authorization: Bearer <your-token>
```

---

### `GET /api/tasks/getAll`

* **Description:** Returns all tasks in the database  
* **Authorization:** Required (Bearer Token)  
* **Example:**

```http
GET http://localhost:3000/api/tasks/getAll
Authorization: Bearer <your-token>
```

---

### `GET /api/tasks/get`

* **Description:** Returns the task with the given ID  
* **Authorization:** Required (Bearer Token)  
* **Example:**

```http
GET http://localhost:3000/api/tasks/get?id=20240507-abc123
Authorization: Bearer <your-token>
```

---

### `POST /api/tasks/create`

* **Description:** Creates a new task  
* **Authorization:** Required (Bearer Token)  
* **Example:**

```http
POST http://localhost:3000/api/tasks/create
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "title": "Fix login bug",
  "description": "Users can’t log in under certain conditions",
  "report": "Steps to reproduce...",
  "category": "frontend",
  "state": "open",
  "priority": "High",
  "type": "bug",
  "topic": "authentication",
  "userName": "alice"
}
```

---

### `PATCH /api/tasks/update`

* **Description:** Updates an existing task  
* **Authorization:** Required (Bearer Token)  
* **Example:**

```http
PATCH http://localhost:3000/api/tasks/update?id=20240507-abc123
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "priority": "Low",
  "state": "close"
}
```

---

### `DELETE /api/tasks/delete`

* **Description:** Deletes a task by its ID  
* **Authorization:** Required (Bearer Token)  
* **Example:**

```http
DELETE http://localhost:3000/api/tasks/delete?id=20240506-abcd1234
Authorization: Bearer <your-token>
```

---

### `POST /auth/delete/user`

* **Description:** Deletes a user by their username  
* **Authorization:** Required (Bearer Token)  
* **Example:**

```http
POST http://localhost:3000/auth/delete/user?userName=alice
Authorization: Bearer <your-token>
```

---

### `POST /auth/login`

* **Description:** Logs in a user and generates a JWT token  
* **Authorization:** None (no token required)  
* **Example:**

```http
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "name": "alice",
  "password": "your-password"
}
```

---

### `POST /auth/register`

* **Description:** Registers a new user  
* **Authorization:** Required (Bearer Token)  
* **Example:**

```http
POST http://localhost:3000/auth/register
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "name": "alice",
  "password": "your-password"
}
```
---

### `GET /auth/user`
* **Description:** Fetches a user's data by their username
* **Authorization:** Required (Bearer Token)
* **Example:**

```http
GET http://localhost:3000/auth/user?userName=alice
Authorization: Bearer <your-token>
```
---

### `POST /auth/user/roles`
* **Description:** Updates the roles for a given user (admin or `mayEditUserRole` required)
* **Authorization:** Required (Bearer Token)

* **Example:**

```http
POST http://localhost:3000/auth/user/roles
Authorization: Bearer <your-token>
Content-Type: application/json

{
"userName": "alice",
"roles":[
        "admin",
        "mayDeleteUsers",
        "mayCreateUsers",
        "mayCreateTasks",
        "mayEditTasks",
        "mayDeleteTasks",
        "mayEditUserRole"
    ]
}
```

---

### `GET /dashboard/lists`
* **Description:** Fetches available lists like categories, types, state 
* **Authorization:** Required (Bearer Token)
* **Example:**

```http
GET http://localhost:3000/dashboard/lists
Authorization: Bearer <your-token>
```
---

## 🧾 License

This project is licensed under the **ISC License**.

---

## 👤 Author

Made with ❤️ by [Voxny404](https://github.com/Voxny404)


