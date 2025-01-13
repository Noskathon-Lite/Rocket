import React, { useState, useEffect, createContext, useContext } from "react";
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
import LogIn from "./pages/Login";
import SignUp from "./pages/SignUp";
import UserPage from "./pages/UserPage";
import HistoryPage from "./pages/HistoryPage";
import ParkingLotPage from "./pages/ParkingLotPage";
import ImmeExit from "./pages/ImmeExit";
import apiClient from "./api/apiClient";

// Create AuthContext
const AuthContext = createContext(null);

// Custom hook for using AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};

// Placeholder component for Admin page
const AdminPage = () => <div>Admin Page</div>;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("access_token")
  );

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      setIsAuthenticated(true); // Token exists, so user is authenticated
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      setIsAuthenticated(false); // No token, user is not authenticated
      delete apiClient.defaults.headers.common["Authorization"];
    }
  }, []);

  const login = (token, refreshToken, fullName) => {
    localStorage.setItem("access_token", token);
    localStorage.setItem("refresh_token", refreshToken);
    localStorage.setItem("fullName", fullName);
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      await apiClient.post(
        "/auth/logout",
        { refresh_token: refreshToken },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("fullName");
      delete apiClient.defaults.headers.common["Authorization"];
      document.cookie = "auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isAuthenticated) {
        logout();
      }
    };

    const handleLogout = () => {
      logout();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("logout", handleLogout);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("logout", handleLogout);
    };
  }, [isAuthenticated]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      <Router>
        <div className="min-h-screen bg-gray-100">
          {!isAuthenticated && <Navbar />}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<LogIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route
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
            />
          </Routes>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
