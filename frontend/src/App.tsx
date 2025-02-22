import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Chat from "./components/Chat";
import ListOfUserActive from "./components/ListOfUserActive";
import Register from "./components/Register";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import UpdateUsername from "./components/UpdateUsername";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <div className="h-screen flex items-center justify-center bg-gray-900">

                <div className="absolute top-4 left-4">
                  <UpdateUsername />
                </div>
                <div className="absolute top-4 left-4"></div>
                <div className="flex justify-center items-center h-full m-5">
                  <ListOfUserActive />
                </div>
                <Chat />
              </div>
            </ProtectedRoute>
          }
        />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}
