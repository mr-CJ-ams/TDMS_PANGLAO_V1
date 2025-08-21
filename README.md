# Tourism Data Management System (TDMS) with AI-Powered Forecasting Tourist Accommodation Demand for Panglao, Bohol

### System Tutorial Video:👇Click here
[![System Tutorial Video](https://img.youtube.com/vi/tESZX530Av4/0.jpg)](https://youtu.be/tESZX530Av4)  
https://youtu.be/tESZX530Av4?si=NS_2cmn0w3i9ei4P
*Click the thumbnail above to watch the system tutorial on YouTube.*

## Introduction

In today's era of digital transformation and artificial intelligence, many local government offices still rely on manual systems that slow down service delivery.  

Panglao, Bohol—a leading tourist destination—manages its tourist accommodation data using paper forms and spreadsheets, leading to delays, inefficiencies, human error, and difficulty complying with the monthly reporting required by Municipal Ordinance No. 04, Series of 2020 also known as “Tourist Arrival Monitoring Ordinance of Panglao, Bohol.”  

The **Integrated Tourist Data Management System (ITDMS)** is a web-based platform that automates data collection, consolidation, and reporting. What once took over 10 days of manual work by tourism personnel can now be done in minutes, resulting in a **92.6% improvement in processing time**.  

The system features two main roles:  
1. **Establishments** submit guest data.  
2. The **Municipal Tourism Office** manages submissions and generates reports.  

To support future planning, the system includes an **AI-powered forecasting feature** that analyzes past tourist data and predicts accommodation demand. The most accurate model achieved a **94.79% forecast accuracy**.  

The ITDMS not only accelerates data handling but also enables smarter decisions, offering a model for other municipalities to modernize tourism data management in the Philippines.  

---

## System Process Flowchart

<p align="center">
  <img src="img\System-Flowchart.png" alt="System Process Flowchart" width="480"/>
</p>

## Summary of Architecture Used

| Layer/Scope      | Architecture Used            |
|------------------|-----------------------------|
| Whole System     | Client-Server               |
| Frontend (client)| Component-based (React)     |
| Backend (server) | Model-View-Controller (MVC) |

### Client-Server Architecture used for the Whole System
<p align="center">
  <img src="img\Client-server.png" alt="Client-Server Arch" width="480"/>
</p>

### Component-based (React) Architecture in the Frontend(client) Side
<p align="center">
  <img src="img\Component-based.png" alt="Component-based arch" width="480"/>
</p>

### Model-View-Controller (MVC) Architecture in Backend(server) Side
<p align="center">
  <img src="img\MVC.jpg" alt="MVC Arch" width="480"/>
</p>

## Forecasting Model

The Forecasting Model is a key component that predicts future accommodation demand based on historical data. The system utilized multiple machine learning models such as the XGBoost, Random Forest, Long short-term memory, and Facebook Prophet, combined with carefully engineered features to capture trends, seasonality, and external influences such as holidays.

(https://colab.research.google.com/drive/1bu_JoysTvJXpopbX-EA9LscEXdfCl921#scrollTo=bk8J7IJiVnGG)
*Click here to learn more about the Factors that can affect the prediction.*

### Machine learning evaluation results

<p align="center">
  <img src="img\results1.png" alt="Results" width="480"/>
</p>

<p align="center">
  <img src="img\results2.png" alt="Results" width="480"/>
</p>

### Graph Comparison of Best Performing Version of Each Machine Learning

<p align="center">
  <img src="img\results3.png" alt="Results" width="480"/>
</p>

Based on the results from different trained machine learning models namely XGBoost, Random Forest, Long Short-Term Memory, and Facebook Prophet, across three versions of features, XGBoost Version 3 demonstrated the highest accuracy of 94.92%. Compared to other models, XGBoost Version 3 was the most reliable in forecasting tourist accommodation demand as it consistently captured the upward and downward trends of actual tourist arrivals. 



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
git clone https://github.com/mr-CJ-ams/TDMS_PANGLAO_V1.git
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

# 🛠️ Developer & Engineer Guide

This section provides a **comprehensive technical reference** for software engineers, developers, and programmers working on the Panglao TDMS.  
It covers architecture, workflow, setup, deployment, code structure, conventions, and troubleshooting for both production and local development.

---

## 📦 System Architecture

- **Client-Server Model:**  
  - **Frontend:** React (Vite), TypeScript/JavaScript, modular components.
  - **Backend:** Node.js, Express, PostgreSQL, MVC pattern.
  - **Authentication:** JWT, email verification, role-based access (admin/user).
  - **Automated Tasks:** node-cron for scheduled backups and email reminders.
  - **AI Forecasting:** Python ML models (XGBoost, Random Forest, LSTM, Prophet) for demand prediction.

---

## 🗂️ Folder Structure & Key Files

```
TDMS_PANGLAO_V1/
├── server/
│   ├── controllers/        # Express route handlers (business logic)
│   ├── models/             # Database queries & business rules
│   ├── routes/             # API route definitions
│   ├── middleware/         # Auth & other Express middleware
│   ├── utils/              # Email, auto-approval, verification utilities
│   ├── driveBackup/        # Google Drive backup scripts
│   ├── config/             # OAuth credentials
│   ├── db.js               # PostgreSQL connection pool
│   ├── index.js            # Main server entry point
│   ├── .env                # Environment variables
│   └── database.sql        # Database schema
├── client/
│   ├── src/
│   │   ├── admin/          # Admin dashboard pages, components, utils
│   │   ├── user/           # User dashboard pages, components, utils
│   │   ├── components/     # Shared components
│   │   ├── services/       # API service layer
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Main page components
│   ├── public/             # Static assets
│   ├── .env                # Frontend environment variables
│   └── ...                 # Build, config, etc.
└── README.md               # System documentation
```

---

## 🚀 Local Development Workflow

### 1. **Clone & Install**

```sh
git clone https://github.com/mr-CJ-ams/TDMS_PANGLAO_V1.git
cd TDMS_PANGLAO_V1
```

#### Backend

```sh
cd server
npm install
```

#### Frontend

```sh
cd ../client
npm install
```

---

### 2. **Configure Environment Variables**

- **Backend:**  
  Edit `server/.env`:
  ```
  DATABASE_URL=postgresql://username:password@localhost:5432/rbac
  JWT_SECRET=your-secret-key
  EMAIL_USER=your-email@gmail.com
  EMAIL_PASSWORD=your-email-password
  GOOGLE_OAUTH_CREDENTIALS_PATH=./config/client_secret_....json
  PORT=5000
  ```
- **Frontend:**  
  Edit `client/.env`:
  ```
  VITE_API_BASE_URL=http://localhost:5000
  ```

---

### 3. **Database Setup**

- Install PostgreSQL and create the database:
  ```sql
  CREATE DATABASE rbac;
  ```
- Run schema:
  - Copy contents of `server/database.sql` and execute in your database.

---

### 4. **Run Backend & Frontend**

- **Backend:**  
  ```sh
  cd server
  node index.js
  ```
- **Frontend:**  
  ```sh
  cd client
  npm run dev
  ```
- Access at [http://localhost:3000](http://localhost:3000)

---

### 5. **Google Drive Backup Setup**

- Enable Google Drive API, create OAuth credentials, and download JSON to `server/config/`.
- Run `node driveBackup/oauthDriveUpload.js` once to authenticate and generate `token.json`.
- Backups will run automatically via cron jobs.

---

## 🏗️ Production Deployment

- **Backend:** Deploy to a Node.js server/VM. Set environment variables securely.
- **Frontend:** Build with `npm run build` and deploy static files to Netlify, Vercel, or similar.
- **Database:** Use managed PostgreSQL (AWS RDS, Heroku, etc.).
- **Email:** Use secure app password for Gmail or SMTP provider.
- **Backups:** Ensure Google Drive credentials and token.json are present.

---

## 🧩 Code Conventions & Best Practices

- **Documentation:**  
  - Each major file (controllers, models, routes, utils, components) starts with a detailed docblock explaining its purpose, responsibilities, usage, and related files.
- **Modularity:**  
  - Keep business logic in controllers/models, not in routes.
  - Use utility files for shared logic (email, verification, etc.).
- **Security:**  
  - Never commit secrets or passwords to source control.
  - Use environment variables for sensitive config.
- **Testing:**  
  - Add unit/integration tests for critical logic.
- **Error Handling:**  
  - Use centralized error middleware in Express.
  - Provide clear error messages for frontend users.

---

## 🛡️ Troubleshooting

- **CORS errors:**  
  - Ensure backend uses `cors` middleware and allows frontend origin.
- **Database connection issues:**  
  - Check `DATABASE_URL` and PostgreSQL status.
- **Email issues:**  
  - Verify credentials and SMTP settings.
- **Google Drive backup issues:**  
  - Re-run authentication if `token.json` is missing or invalid.
- **Frontend/Backend communication:**  
  - Confirm API base URL in frontend `.env`.

---

## 👥 Contributing

- Fork, branch, and submit pull requests.
- Follow code style and documentation conventions.
- Update documentation for new features.

---

## 📚 Additional References

- See file-level documentation in each major source file for deeper technical details.
- For AI forecasting model details, see the referenced Colab notebook and tutorial video.

---

*This guide is designed to help you work efficiently, understand the system architecture, and maintain high code quality in both production and development environments. For any issues or suggestions, please contact the repository maintainer.*





