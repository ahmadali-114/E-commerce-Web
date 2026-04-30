# 🛒 EaseShop - Full Stack E-Commerce Website

A complete **Full Stack E-Commerce Platform** that allows users to browse products, add items to a shopping cart, place orders, and manage their account.  
The system also includes an **Admin Panel** where administrators can manage products, users, and orders.

This project was developed as a **Final Year Project (FYP)**.

---

# 🚀 Features

### 👤 User Features
- User Registration & Login (JWT Authentication)
- Browse Products
- Product Details Page
- Add to Cart
- Update Cart Quantity
- Remove Items from Cart
- Checkout System
- Order Placement
- Order History

### 🛠 Admin Features
- Admin Authentication
- Add Products
- Update Products
- Delete Products
- Manage Orders
- Manage Users

---

# 🛠 Tech Stack

## Frontend
- HTML5
- CSS3
- JavaScript
- Vite

## Backend
- Node.js
- Express.js
- REST API

## Database
- MySQL

## Tools
- Git
- GitHub
- XAMPP
- Postman

---

# 📁 Project Structure

```
EaseShop
│
├── frontend
│   ├── public
│   │   └── images
│   │
│   ├── src
│   │   ├── pages
│   │   ├── components
│   │   ├── services
│   │   └── styles
│   │
│   └── package.json
│
├── backend
│   ├── controllers
│   ├── routes
│   ├── middleware
│   ├── database
│   │   └── schema.sql
│   ├── config
│   └── server.js
│
└── README.md
```

---

# 📋 Prerequisites

Install the following software before running the project.

### Node.js
https://nodejs.org/

### XAMPP
https://www.apachefriends.org/

### Git
https://git-scm.com/

---

# 📥 Installation Guide

## 1️⃣ Clone the Frontend Repository

Open terminal and run:

```bash
git clone https://github.com/binishfaq/E-commerce-Website-Frontend.git
cd E-commerce-Website-Frontend
```

---

## 2️⃣ Clone the Backend Repository

Open a **new terminal** and run:

```bash
git clone https://github.com/binishfaq/E-commerce-Website-Backend.git
cd E-commerce-Website-Backend
```

---

# 🗄 Database Setup

### Step 1

Start **XAMPP**

Start **MySQL**

---

### Step 2

Open phpMyAdmin

```
http://localhost/phpmyadmin
```

---

### Step 3

Create a database named:

```
easeshop
```

---

### Step 4

Select the **easeshop database**

Go to **Import**

Upload:

```
backend/database/schema.sql
```

Click **Go**

---

# ⚙ Backend Setup

Navigate to backend folder and run:

```bash
npm install
```

Create a `.env` file in the backend folder.

```
backend/.env
```

Add the following configuration:

```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=easeshop
JWT_SECRET=easeshop_super_secret_key_2026
ADMIN_SECRET_KEY=admin123
```

---

# 💻 Frontend Setup

Navigate to frontend folder and run:

```bash
npm install
```

---

# 👨‍💼 Create Admin User (One Time Only)

After starting backend server run:

```bash
curl -X POST http://localhost:5000/api/auth/create-admin \
-H "Content-Type: application/json" \
-d '{
"firstName":"Admin",
"lastName":"User",
"email":"admin@gmail.com",
"password":"123456",
"phone":"1234567890",
"secretKey":"admin123"
}'
```

---

# ▶ Run the Application

## Start Backend

```bash
cd E-commerce-Website-Backend
npm run dev
```

Backend runs on:

```
http://localhost:5000
```

---

## Start Frontend

```bash
cd E-commerce-Website-Frontend
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

# 🌐 Access the Website

| Page | URL |
|-----|-----|
User Website | http://localhost:5173 |
Admin Panel | http://localhost:5173/admin |

---

# 🔑 Default Login Credentials

### Admin

```
Email: admin@gmail.com
Password: 123456
```

---

### Test User

```
Email: john@example.com
Password: password123
```

---

# 🐛 Common Issues

### MySQL Connection Error
Make sure **XAMPP MySQL is running**.

Check `.env` database credentials.

---

### Port Already in Use

Change port in `.env`

Example:

```
PORT=5001
```

---

### Frontend Cannot Connect to Backend

Verify backend server is running:

```
http://localhost:5000
```

Check API URL inside:

```
src/services/api.js
```

---

### Images Not Loading

Place images in:

```
frontend/public/images/
```

Use paths like:

```
/images/product.jpg
```

---

# 🎓 Project Information

**Final Year Project**

MNS University of Agriculture Multan  
Year: **2026**

---

# 👨‍💻 Developer

**Zain Bin Ishfaq**

Frontend Developer  
Full Stack Learner

GitHub:  
https://github.com/binishfaq

---

# 📄 License

This project is developed for **educational purposes** as part of a **Final Year Project**.