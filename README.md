# UptimeRobot Clone

A full-stack uptime monitoring application inspired by [Uptime Robot](https://uptimerobot.com/). This project allows users to monitor website uptime, receive notifications, and view detailed reports. Built with a React frontend and Node.js/Express backend.

---

## 🌐 Live Demo

- **Frontend (Vercel):** [https://uptime-robot-psi.vercel.app/](https://uptime-robot-psi.vercel.app/)
- **Backend (Render):** [https://uptimerobot-gsbs.onrender.com](https://uptimerobot-gsbs.onrender.com)
- **Worker (Railway):** Deployed for scheduled uptime checks

---

## 📸 Demo Video & Screenshots

<!-- Add your demo video and screenshots here -->

- Demo Video:



https://github.com/user-attachments/assets/1cfa043b-9bf8-48d0-b9f9-e837bac3f6b9



- Demo Screenshots:

<img width="1919" height="908" alt="image" src="https://github.com/user-attachments/assets/b1fb3321-af74-41e5-b1ff-35b7c839a922" />

<img width="1919" height="913" alt="image" src="https://github.com/user-attachments/assets/a5a3400b-3ce7-4a47-88d5-ac836c5658d1" />

<img width="1046" height="738" alt="image" src="https://github.com/user-attachments/assets/c2134f12-d2f6-47ec-9f0b-2fbe574d499a" />

---

## 🛠️ Project Structure

```
backend/
  ├── config/
  ├── controllers/
  ├── middlewares/
  ├── models/
  ├── routes/
  ├── utils/
  ├── index.js
  ├── seed.js
  └── worker.js
client/
  └── ...
```

---

## 🚀 Backend API Routes

All backend routes are prefixed with `/api`. Below are the main endpoints. Each route is presented in a separate code block for easy copying.

### Auth Routes

```
POST   /api/auth/register      // Register a new user
POST   /api/auth/login         // Login user
POST   /api/auth/verify-otp    // Verify OTP for login
```

### User Routes

```
GET    /api/users/me           // Get current user profile
PUT    /api/users/me           // Update user profile
```

### Monitor Routes

```
GET    /api/monitors           // List all monitors for user
POST   /api/monitors           // Add a new monitor
GET    /api/monitors/:id       // Get details of a monitor
PUT    /api/monitors/:id       // Update a monitor
DELETE /api/monitors/:id       // Delete a monitor
```

### Notification Channel Routes

```
GET    /api/notifications      // List notification channels
POST   /api/notifications      // Add notification channel
DELETE /api/notifications/:id  // Remove notification channel
```

### Report Routes

```
GET    /api/reports            // Get uptime reports for user
GET    /api/reports/:monitorId // Get report for a specific monitor
```

---

## 🧑‍💻 Technologies Used

- **Frontend:** React, Vite
- **Backend:** Node.js, Express
- **Database:** MongoDB
- **Deployment:** Vercel (frontend), Render (backend), Railway (worker)

---

## 💡 Inspiration

This project is inspired by [Uptime Robot](https://uptimerobot.com/), aiming to provide similar uptime monitoring features with a modern tech stack.

---

## 📦 Setup & Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/shashi162003/UptimeRobot.git
   ```
2. Install dependencies for backend and client:
   ```sh
   cd backend && npm install
   cd ../client && npm install
   ```
3. Configure environment variables as needed.
4. Start backend and frontend servers:
   ```sh
   cd backend && npm start
   cd ../client && npm run dev
   ```

---

## 📬 Contact & Contributions

Feel free to open issues or submit pull requests for improvements!

---

## License

MIT
