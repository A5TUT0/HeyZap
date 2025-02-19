## **Prerequisites**

Before running the application, make sure you have installed:

- **Docker** and **Docker Compose**
- An updated and compatible web browser

## **Installation and Execution**

1. Clone the repository:

   ```sh
   git clone https://github.com/A5TUT0/HeyZap.git
   cd HeyZap
   ```

2. Start the application with Docker Compose:

   ```sh
   docker compose up
   ```

3. Access the application:
   - **Frontend:** `http://localhost:5173`
   - **Backend:** `http://localhost:3000`
   - **MongoDB Compass:** Connect using `mongodb://localhost:27017/chatdb`

## **User Registration**

To use the application, an email is required. If you prefer not to use personal information, you can generate a temporary email through [Temp Mail](https://temp-mail.org/en/).  
You can also use your real email, but it is not mandatory.

## **Technologies Used**

### **Frontend**

- Vite
- Tailwind CSS
- Clerk.dev for authentication
- Socket.io for real-time communication
- Framer Motion for animations

### **Backend**

- Node.js
- Socket.io for real-time communication
- Express.js for API management
- MongoDB as the database
- Mongoose for data management

### **Infrastructure**

- Docker and Docker Compose for container orchestration
