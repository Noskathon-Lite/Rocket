import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";

const SignUp = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [errorLog, setErrorLog] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setErrorLog([]);

    const userData = {
      full_name: fullName,
      email,
      password,
      role: "user", // Default role set to 'user'
    };

    try {
      const response = await apiClient.post("/auth/register/", userData);
      setMessage("Sign up successful! You can now log in.");
      setErrorLog((prevLog) => [
        ...prevLog,
        `Success: ${JSON.stringify(response.data)}`,
      ]);

      // Clear the form
      setFullName("");
      setEmail("");
      setPassword("");

      // Add a short delay before redirecting to the login page
      setTimeout(() => {
        navigate("/login");
      }, 2000); // 2000ms = 2 seconds
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

      // Log errors to the console
      console.log("Error Log:", [
        ...errorLog,
        `Error: ${errorMessage} (${error.response?.status || "No status"})`,
      ]);

      if (error.response?.status === 400) {
        setMessage("Email already exists.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your information below to create an account
          </p>
        </div>
        <form onSubmit={handleSignUp} className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="full-name" className="sr-only">
                Full Name
              </label>
              <input
                id="full-name"
                name="fullName"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
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
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          {/* Error message directly below password field */}
          {message && (
            <div
              className={`mt-2 p-4 rounded-md ${
                message.includes("successful")
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isLoading ? "Signing up..." : "Sign up"}
            </button>
          </div>
        </form>
        <div className="text-sm text-center">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
