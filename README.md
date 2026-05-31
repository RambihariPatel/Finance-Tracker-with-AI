# 🤖 AI-Powered Personal Finance Tracker 💰

Welcome to the **AI-Powered Personal Finance Tracker** – a modern, premium, and feature-rich full-stack application built using the **MERN Stack** (MongoDB, Express, React, Node.js) integrated with **OpenAI** (and a fallback heuristic intelligence engine). 

It is designed to help users take complete control of their financial life—from daily tracking and category budgeting to split group bills, automated subscription monitoring, and getting deep, personalized AI financial advice.

---

## ✨ Features at a Glance

### 1. 📊 Interactive Dashboard & Financial Summaries
* **Real-time Stats Cards**: View your total income, total expenses, savings, and remaining budget instantly.
* **Rich Data Visualizations**: Beautiful, interactive charts powered by **Recharts**:
  * 📈 **Line Chart**: Monthly spending trends.
  * 🍩 **Pie Chart**: Category-wise expense distribution.
  * 📊 **Bar Chart**: Direct comparison of Income vs. Expense.
* **Recent Activity**: Quickly view the 5 most recent transactions at a glance.

### 2. 🧠 AI Insights & Predictions (With Smart Fallback)
* **OpenAI Integration**: Automatically analyzes your income, remaining budget, and category spending using `gpt-4o-mini` to deliver encouraging, actionable, and jargon-free financial recommendations.
* **Deterministic Fallback Engine**: If no OpenAI API Key is configured, the application seamlessly switches to a highly optimized local heuristic analyzer (`financeAnalyzer.js`) so the feature always works flawlessly.
* **Smart Spending Forecast**: Predicts future monthly expenses based on historical trends, complete with a confidence rating and an overspend/budget-risk flag.

### 3. 🎯 Advanced Budgeting & Real-time Alerts
* Set a global monthly budget limit.
* Establish individual limits for specific categories (e.g., Food, Travel, Rent, Entertainment).
* Dynamic progress bars show your budget usage in real-time, changing colors as you approach or exceed your limits.

### 4. 👥 Collaborative Group Expenses (Split Bills)
* Create financial groups (e.g., Roommates, Trips, Family).
* Add members to your groups and record shared expenses.
* Multiple split patterns supported: **Equal Splitting** or **Custom Amounts**.
* Integrated settlement engine showing exactly who owes what, plus a one-click settlement logging mechanism.

### 5. 📅 Automated Subscription Tracker
* Monitor recurring subscriptions (e.g., Netflix, Spotify, Gym).
* Set billing frequencies (Weekly, Monthly, Yearly) and track next payment due dates.
* Automatic alerts for upcoming subscription renewals.

### 6. 📄 Professional Reports & PDF Export
* Pick any year and month to generate a localized financial statement.
* Stream and download pixel-perfect **PDF Reports** generated directly on the server via **PDFKit**.

### 7. 🔒 Hardened Security & Isolation
* **JWT Authentication**: Secure stateless token-based authorization (with password hashing using `bcrypt`).
* **Complete Isolation**: User-scoped queries (`req.userId`) prevent unauthorized data leakage.
* **Network & DB Hardening**: Hardened HTTP headers via `helmet`, rate limiting, NoSQL query sanitization, and XSS protection.

---

## 🛠️ Tech Stack

### Backend (Server)
* **Node.js** & **Express.js** (ES Modules configuration)
* **MongoDB** & **Mongoose** (Data schemas, indexes, and aggregation)
* **OpenAI SDK** (Personalized financial advice generation)
* **PDFKit** (On-the-fly server-side PDF creation)
* **Nodemailer** & **Node-Cron** (Scheduled reminders and mailer utilities)
* **Helmet, Express-Rate-Limit, Mongo-Sanitize, XSS-Clean** (Production-grade security middlewares)

### Frontend (Client)
* **React 18** (Vite-powered environment for lightning-fast HMR)
* **Redux Toolkit** (Global state management via slices for Auth, Transactions, Budget, and Insights)
* **Tailwind CSS** & **PostCSS** (Sleek, modern UI design system)
* **Recharts** (Interactive, fluid SVG-based charting)
* **Axios** (With custom request/response interceptors for token auto-inject & auth-expiry redirection)
* **React Hot Toast** (Micro-interaction notification framework)

---

## 📁 Codebase Directory Structure

```text
Finance-Tracker-with-AI/
├── server/                              # BACKEND ENGINE
│   ├── config/                          # Configurations (database, etc.)
│   ├── controllers/                     # Request handling & business logic
│   │   ├── aiController.js              # AI insights & predictive analytics
│   │   ├── authController.js            # SignUp, Login, profile, & account stats
│   │   ├── budgetController.js          # Monthly & category-wise budget management
│   │   ├── dashboardController.js       # Core dashboard metrics aggregator
│   │   ├── goalController.js            # Saving goals controller
│   │   ├── groupController.js           # Collaborative splitting and groups
│   │   ├── reportController.js          # JSON analytics and PDF generation
│   │   ├── subscriptionController.js    # Subscription cycles management
│   │   └── transactionController.js     # Paginated & filtered transaction CRUD
│   ├── middleware/
│   │   └── authMiddleware.js            # JWT Validation and routing guard
│   ├── models/                          # Mongoose Schemas (User, Transaction, Budget, Group, Goal, etc.)
│   ├── routes/                          # REST API Endpoints routing maps
│   ├── services/
│   │   ├── aiService.js                 # OpenAI orchestrator & fallback logic
│   │   └── financeAnalyzer.js           # Core math, statistics, and heuristic advisor
│   ├── utils/                           # Shared server utility helper scripts
│   ├── app.js                           # Server config & middleware pipelines
│   └── server.js                        # Node server bootstrapping script
│
├── client/                              # FRONTEND ENGINE
│   ├── src/
│   │   ├── components/                  # Shared layouts, sidebars, forms, and cards
│   │   ├── hooks/                       # Custom reusable React hooks
│   │   ├── pages/                       # Screen views (Dashboard, Insights, Groups, etc.)
│   │   ├── redux/                       # Store initialization and async slices
│   │   ├── services/                    # Axios-bound API connection services
│   │   ├── utils/                       # Shared formatters and categories mapping
│   │   ├── App.jsx                      # App router mapping & Protected Routes
│   │   └── index.css                    # Tailwind configurations & custom styles
│   ├── tailwind.config.js               # Visual system definitions & palette overrides
│   └── vite.config.js                   # Vite config with API server reverse-proxy
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js** (v18.x or later recommended)
* **MongoDB** (Local instance or MongoDB Atlas Cloud URI)
* **OpenAI API Key** *(Optional - for advanced GPT-powered insights)*

---

### Step 1: Clone & Root Installation
Clone the repository and install root-level dependencies:
```bash
# Install root/server dependencies
npm install
```

---

### Step 2: Configure Backend Environment Variables
Navigate to the `server/` directory and look at `.env.example`. Create a `.env` file in the root of the project (or inside `server/`) containing:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/ai-finance-tracker

# JWT Credentials
JWT_SECRET=your_custom_long_jwt_secret_key_here
JWT_EXPIRE=7d

# OpenAI Integration (Optional - Fallback is Heuristic)
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini

# Client Connection
FRONTEND_URL=http://localhost:5173
NODE_ENV=development

# Optional Mail Notification configurations
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
```

---

### Step 3: Configure Frontend Environment Variables
Navigate to the `client/` directory. By default, the frontend relies on `http://localhost:5000/api` using Vite's reverse-proxy or native endpoint. You can optionally create a `client/.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

---

### Step 4: Run the Application

You will need two terminal windows to run both services simultaneously during development.

#### Terminal 1: Start the Backend Server
```bash
# In the root folder (or server/ folder)
npm run dev
```
*The server will boot and run on `http://localhost:5000`. You will see `MongoDB connected` once the DB handshake is complete.*

#### Terminal 2: Start the Frontend App
```bash
cd client
npm install
npm run dev
```
*The Vite development server will spin up, typically hosting the app on `http://localhost:5173`.*

---

## 📡 REST API Endpoint Specifications

### Authentication
* `POST /api/auth/signup` - Register a new account
* `POST /api/auth/login` - Authenticate and receive a JWT
* `GET /api/auth/me` - Fetch profile details (Protected)
* `PUT /api/auth/profile` - Update name and email (Protected)
* `PUT /api/auth/password` - Modify account password (Protected)
* `GET /api/auth/stats` - Fetch account-wide meta counters (Protected)

### Transaction Management
* `POST /api/transactions` - Add a new income/expense entry
* `GET /api/transactions` - Paginate, search, sort, and filter transactions
* `PUT /api/transactions/:id` - Edit a transaction
* `DELETE /api/transactions/:id` - Remove a transaction

### Budget & Alerting
* `GET /api/budget` - Fetch current budget boundaries
* `POST /api/budget` - Create or upsert monthly and category limits

### Collaborative Groups & Splits
* `POST /api/groups` - Create a spending group
* `GET /api/groups` - Retrieve user's joined groups
* `GET /api/groups/:id` - Fetch detailed expenses, balances, and settlements for a group
* `POST /api/groups/:id/expenses` - Record a shared split expense inside a group
* `POST /api/groups/:id/settlements` - Log a direct settlement between two members

### AI Insights & Forecasting
* `POST /api/ai/insights` - Request OpenAI or Heuristic financial reviews
* `POST /api/ai/predict` - Get spending forecasts and risk projections

### Reports & Document Export
* `GET /api/reports/monthly` - Retrieve monthly JSON summary
* `GET /api/reports/monthly?format=pdf` - Generates and streams a downloadable PDF report

---

## 🧪 Verification & Testing

The backend includes a comprehensive test suite using **Jest** and **Supertest** to verify routing, auth logic, and heuristic calculations.
To run the automated tests, simply run:
```bash
npm run test
```

---

## 🛡️ Security Hardening Details
1. **Payload Limits**: Payload limits set at `10kb` to prevent Denial of Service (DoS) attacks.
2. **Rate Limiting**: Rolling rate limiter allowing max `100` requests per `15 minutes` per IP address.
3. **NoSQL Protection**: Integrates `express-mongo-sanitize` to strip prohibited characters from request payloads, preventing SQL/NoSQL injections.
4. **Data Sanitization**: Integrates XSS filtering using `xss-clean` to convert HTML entities, preventing Cross-Site Scripting.
5. **Secure Headers**: Hardened using `helmet` to mask server details and set robust HTTP responses.

---

Made with ❤️ for smart personal financial management.
