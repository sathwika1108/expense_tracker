# 💰 Expense Tracker (Full Stack)

A full-stack Expense Tracker application that helps users manage daily expenses, set monthly budgets, and visualize spending patterns.

🔗 **Live App**: https://expense-tracker-yn5k.vercel.app/
🔗 **Backend API**: https://expense-tracker-a6m3.onrender.com

---

## 🚀 Features

- User Authentication (JWT)
- Add / Edit / Delete Expenses
- Monthly Budget Tracking
- Budget Alerts (80% warning, 100% exceeded) on dashboard
- Category & Month Filters
- Data Visualization (Pie & Bar Charts)
- CSV / PDF Export
- Dark Mode
- Toast Notifications
- Responsive UI

---

## 🛠 Tech Stack

### Frontend
- React + Vite
- React Router
- Axios
- Chart.js
- Tailwind / Custom CSS
- Deployed on **Vercel**

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- Nodemailer
- Deployed on **Render**

---

## 📂 Project Structure

expense-tracker/
├── frontend/
├── backend/
└── README.md


---

## ⚙️ Local Setup

### Backend
   bash
cd backend
npm install
npm run dev

Create .env:

PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret

Frontend
cd frontend
npm install
npm run dev

🌍 Deployment

Frontend: Deployed on Vercel

Backend: Deployed on Render

SPA routing handled using vercel.json



