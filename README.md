# Smart Fuel Optimization and Resource Management System

This project contains a Node.js/Express backend and a React/Vite frontend.

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) (Ensure it's running locally if required by the `.env` configuration)

## Getting Started

Follow these steps to run the project locally after unzipping the code:

### 1. Unzip the Code

Extract the `FYP_Code.zip` file (if you haven't already) and open the extracted folder in your terminal or command prompt.

### 2. Configure Environment Variables

Make sure the `.env` file in the root directory contains the correct configurations (like your database connection string and any API keys).

### 3. Start the Backend

Open a new terminal window, navigate to the root directory, and then into the `backend` folder:

```bash
cd backend
npm install
npm start
```

_This will install the backend dependencies and start the Node.js server using nodemon._

### 4. Start the Frontend

Open another terminal window, navigate to the root directory, and then into the `frontend` folder:

```bash
cd frontend
npm install
npm run dev
```

_This will install the React frontend dependencies and start the Vite development server._

### 5. View the Application

Once both servers are running, the frontend will typically be accessible at [http://localhost:5173](http://localhost:5173), and the backend will be running on the port specified in your `.env` file.
