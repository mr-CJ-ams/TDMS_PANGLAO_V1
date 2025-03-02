# Tourism Data Management System (TDMS) - System Setup Guide

## Introduction
Welcome to the Tourism Data Management System (TDMS). This guide will help you set up and run the system on your local machine or server.

---

## Prerequisites
Ensure you have the following installed on your machine:

- **Node.js (v16 or higher)** - [Download Node.js](https://nodejs.org/)
- **PostgreSQL** - [Download PostgreSQL](https://www.postgresql.org/)
- **Git** - [Download Git](https://git-scm.com/)
- **NPM** (comes with Node.js)
- **A Code Editor** (e.g., Visual Studio Code)

---

## Setup Instructions

### Step 1: Clone the Repository
Open your terminal and run:
```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### Step 2: Set Up the Database
1. **Install PostgreSQL:** Follow the installation guide for your OS.
2. **Create the Database:**
   ```sql
   CREATE DATABASE rbac;
   \c rbac; -- Connect to the database
   ```
3. **Execute the Schema:** Copy the SQL schema from `server/database.sql` and execute it.
4. **Update Database Configuration:**
   Open the `.env` file in `server/routes` and update:
   ```env
   DATABASE_URL=postgresql://your-username:your-password@localhost:5432/rbac
   ```

### Step 3: Set Up the Server
```bash
cd server
npm install
node index.js
```
The server will start on [http://localhost:5000](http://localhost:5000).

### Step 4: Set Up the Client
```bash
cd ../client
npm install
npm start
```
The client will start on [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

### Server
Located in `.env` (inside `server/routes` folder):
```env
DATABASE_URL=postgresql://your-username:your-password@localhost:5432/rbac
JWT_SECRET=your-secret-key
PORT=5000
```

### Client
Located in `.env` (inside `client` folder):
```env
REACT_APP_API_BASE_URL=http://localhost:5000
```

---

## Running the System

1. **Start the Server:**
   ```bash
   cd server
   node index.js
   ```
2. **Start the Client:**
   ```bash
   cd ../client
   npm start
   ```
3. **Access the System:** Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Using the System

### Admin Login
- **Username:** TDMS Admin
- **Password:** admin123 (or the password set in the database)

### User Signup
- Users can sign up via `/signup`.
- Admin approval is required for new users.

### Submissions
- Users submit guest check-in data via `/user/dashboard`.
- Admins manage submissions via `/admin/dashboard`.

---

## Deployment

To deploy to a live server:

### Server
- Push the `server` folder to a hosting provider.
- Set environment variables (DATABASE_URL, JWT_SECRET, etc.) in the provider’s dashboard.

### Client
```bash
cd client
npm run build
```
- Deploy the `build` folder to a static hosting service (e.g., Netlify, Vercel, AWS S3).

### Database
- Use a managed PostgreSQL service (AWS RDS, Heroku Postgres, ElephantSQL).

---

## Troubleshooting

### Database Connection Issues
- Ensure `.env` contains the correct `DATABASE_URL`.
- Verify that PostgreSQL is running and accessible.

### Client-Server Communication Issues
- Ensure `REACT_APP_API_BASE_URL` in the client’s `.env` points to the correct server URL.

### Dependency Issues
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## Contributing
Want to contribute? Follow these steps:

1. Fork the repository.
2. Create a new branch.
3. Submit a pull request with detailed changes.

---

## License
This project is licensed under the MIT License. See the `LICENSE` file for details.

