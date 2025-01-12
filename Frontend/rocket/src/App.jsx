import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
// import LogIn from "./pages/Login";
// import SignUp from "./pages/SignUp";
// import UserPage from "./pages/UserPage";
// import HistoryPage from "./pages/HistoryPage";
// import ParkingLotPage from "./pages/ParkingLotPage";
// import ImmeExit from "./pages/ImmeExit";
// import apiClient from "./api/apiClient";

function App() {
  // If you need authentication logic, define it here (placeholder example)
  const isAuthenticated = false;

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          {/* Uncomment and define the following routes as needed */}
          {/* <Route path="/login" element={<LogIn />} /> */}
          {/* <Route path="/signup" element={<SignUp />} /> */}
          {/* <Route
            path="/admin"
            element={
              isAuthenticated ? <AdminPage /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/user"
            element={
              isAuthenticated ? <UserPage /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/history"
            element={
              isAuthenticated ? <HistoryPage /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/parking-lot"
            element={
              isAuthenticated ? <ParkingLotPage /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/imme-exit"
            element={
              isAuthenticated ? <ImmeExit /> : <Navigate to="/login" />
            }
          /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
