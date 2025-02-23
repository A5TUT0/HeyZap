# Bonuspunkte

- **AIChatBot**

## **Prerequisites**

- **Docker** and **Docker Compose**
- Updated web browser

## **Installation and Execution**

1. Clone the repository:
   ```sh
   git clone https://github.com/A5TUT0/HeyZap.git
   cd HeyZap
   ```
2. Start the application with Docker:
   ```sh
   docker compose up
   ```
3. Access:
   - **Frontend:** `http://localhost:5173`
   - **Backend:** `http://localhost:3000`
   - **Adminer (DB Manager):** `http://localhost:8080`

## **Features**

✅ User registration and login  
✅ Real-time chat with Socket.io  
✅ Active users list  
✅ Change username feature  
✅ Messages stored in PostgreSQL  
✅ JWT authentication and protection

## **Technologies Used**

- **Frontend:** Vite, Tailwind CSS, Socket.io, Clerk.dev, Framer Motion
- **Backend:** Node.js, Express.js, PostgreSQL, JWT, Socket.io
- **Infrastructure:** Docker, Docker Compose
