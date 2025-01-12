import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";
import { useAuth } from "../App";

const LogIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [errorLog, setErrorLog] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSecureApiLoading, setIsSecureApiLoading] = useState(false);
  const [secureApiMessage, setSecureApiMessage] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const callSecureApi = async (accessToken) => {
    setIsSecureApiLoading(true);
    try {
      const response = await apiClient.get("/auth/secure/", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setSecureApiMessage(`Welcome, ${response.data.full_name}!`);
      setTimeout(() => navigate("/user"), 2000); // Redirect after 2 seconds
    } catch (error) {
      setSecureApiMessage("Access denied. Please log in again.");
      localStorage.removeItem("access_token");
    } finally {
      setIsSecureApiLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setErrorLog([]);
    setSecureApiMessage("");

    try {
      const response = await apiClient.post("/auth/login/", {
        email,
        password,
      });

      const { access_token, refresh_token, full_name, role } = response.data;

      setMessage("Login successful!");

      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      localStorage.setItem("fullName", full_name);
      localStorage.setItem("role", role);

      login(access_token, refresh_token, full_name, role);

      // Redirect the user based on their role
      if (role === "admin") {
        // Redirect to the admin page if the role is admin
        window.location.href = "http://localhost:8000/admin";
      } else {
        // Call secure API for normal users
        await callSecureApi(access_token);
      }
    } catch (error) {
      const errorMessage =
        apiClient.isAxiosError(error) && error.response?.data?.error
          ? error.response.data.error
          : "An unexpected error occurred.";

      setMessage(errorMessage);
      setErrorLog((prevLog) => [
        ...prevLog,
        `Error: ${errorMessage} (${error.response?.status || "No status"})`,
      ]);

      console.log("Error Log:", [
        ...errorLog,
        `Error: ${errorMessage} (${error.response?.status || "No status"})`,
      ]);

      if (error.response?.status === 400) {
        setMessage("Invalid email or password.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Log in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email below to login to your account
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {message && (
            <div
              className={`mt-2 p-4 rounded-md ${
                message.includes("successful")
                  ? "bg-blue-100 text-blue-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          {secureApiMessage && (
            <div
              className={`mt-2 p-4 rounded-md ${
                secureApiMessage.includes("Welcome")
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {secureApiMessage}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading || isSecureApiLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading
                ? "Logging in..."
                : isSecureApiLoading
                ? "Verifying..."
                : "Log in"}
            </button>
          </div>
        </form>

        <div className="text-sm text-center">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LogIn;
