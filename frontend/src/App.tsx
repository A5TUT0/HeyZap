import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Chat from "./components/Chat";
import ListOfUserActive from "./components/ListOfUserActive";
import Register from "./components/Register";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div className="h-screen flex items-center justify-center bg-gray-900">
              <div className="flex items-center justify-center h-full"></div>
              <div className="absolute top-4 left-4"></div>
              <div className="flex justify-center items-center h-full m-5">
                <ListOfUserActive />
              </div>
              <Chat />
            </div>
          }
        />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}
