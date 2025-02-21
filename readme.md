# 📌 Task Management API  

A backend API for a Task Management application, built with **Node.js, Express, MongoDB, and JWT authentication**. The API supports user authentication and CRUD operations for task management, ensuring **real-time updates** using WebSockets.

## 🚀 Live API  
🔗 [Live API](https://task-manager-bd1a7.web.app) 

---

## 📖 Table of Contents  

- [Features](#features)  
- [Tech Stack](#tech-stack)  
- [Installation](#installation)  
- [Environment Variables](#environment-variables)  
- [API Endpoints](#api-endpoints)  
- [Usage](#usage)  
- [Contributing](#contributing)  
- [License](#license)  

---

## 🎯 Features  

✅ **User Authentication:** Secure user authentication using JWT.  
✅ **Task Management:** Users can create, edit, delete, and retrieve tasks.  
✅ **Drag-and-Drop Support:** Tasks are sorted by status and order.  
✅ **Role-Based Access:** Users can only access their own tasks.  
✅ **Real-time Sync:** Tasks update in real-time using **WebSockets**.  
✅ **Secure API:** Protected routes using JWT authentication.  

---

## 🛠 Tech Stack  

- **Node.js** – JavaScript runtime for the backend  
- **Express.js** – Web framework for building RESTful APIs  
- **MongoDB** – NoSQL database for storing task data  
- **JWT (jsonwebtoken)** – Secure authentication and token handling  
- **Socket.io** – Real-time communication between clients  
- **dotenv** – Load environment variables  
- **CORS** – Enable cross-origin requests  

---

## 📥 Installation  

### **Prerequisites**  
Ensure that you have installed the following:  
- **Node.js** (version 16 or higher)  
- **MongoDB** (local or cloud - MongoDB Atlas)  

### **Steps to Install**  

1️⃣ Clone the repository:  
```bash
git clone https://github.com/your-username/task-manager-server.git
cd task-manager-server
2️⃣ Install dependencies:
npm install

3️⃣ Set up environment variables:
Create a .env file in the root directory.
Add necessary configurations as mentioned in the Environment Variables section.

4️⃣ Start the server:
npm start

5️⃣ API is now running on:
🔗 http://localhost:5000
```

## 🔧 Environment Variables
- Create a .env file in the root directory and add:

```bash
PORT=5000
DB_USER=your_mongodb_username
DB_PASS=your_mongodb_password
ACCESS_TOKEN_SECRET=your_jwt_secret
```


## 📌 API Endpoints
## Authentication

```bash
| Method  | Endpoint  | Description           |
|---------|----------|-----------------------|
| `POST`  | `/jwt`   | Generate a JWT token  |
```

### Request Body (Example for /jwt)
```bash
{
  "email": "user@example.com"
}
```

### User API
```bash
| Method  | Endpoint  | Description           |
|---------|----------|-----------------------|
| `POST`  | `/users` | Register a new user   |
```
### Request Body (Example for /users)
```bash
{
  "email": "user@example.com",
  "name": "John Doe"
}
```


## Task API
```bash
### **Task API**  

| Method  | Endpoint       | Description                          |
|---------|--------------|--------------------------------------|
| `POST`  | `/tasks`      | Create a new task (🔒 Requires JWT) |
| `GET`   | `/tasks/:email` | Get tasks for a user (🔒 Requires JWT) |
| `PATCH` | `/tasks/:id`  | Update a task (🔒 Requires JWT)     |
| `DELETE` | `/tasks/:id`  | Delete a task (🔒 Requires JWT)     |
```

### Request Headers (for protected routes)
```bash
{
  "Authorization": "Bearer your_jwt_token"
}
```
### Example Request Body for /tasks (Create Task)
```bash
{
  "title": "Complete project report",
  "status": "To-Do",
  "createdBy": "user@example.com"
}
```

## 📌 Usage
- 1️⃣ Register a user via /users.
- 2️⃣ Obtain a JWT token via /jwt.
- 3️⃣ Use the token in the Authorization header for task-related endpoints.
- 4️⃣ Create, update, delete, and fetch tasks securely.

## 🤝 Contributing
Contributions are welcome! To contribute:

```bash
Fork the repository.
Create a new branch:
git checkout -b feature/your-feature

Make your changes and commit:
git commit -m "Add new feature"

Push to your branch:
git push origin feature/your-feature

Open a pull request. 🎉
```




This README includes everything you need:  
✅ **API setup**  
✅ **Installation instructions**  
✅ **Usage and endpoints**  
✅ **JWT authentication process**  

Let me know if you need any modifications! 🚀