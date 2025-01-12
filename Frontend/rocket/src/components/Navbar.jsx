import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

// useAuth hook
function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication status here
    const checkAuth = async () => {
      const auth = localStorage.getItem("isAuthenticated") === "true";
      setIsAuthenticated(auth);
    };

    checkAuth();
  }, []);

  return { isAuthenticated };
}

// Button component
const Button = React.forwardRef(
  ({ className, variant, asChild, ...props }, ref) => {
    const Comp = asChild ? React.Children.only(props.children).type : "button";
    return (
      <Comp
        className={`px-4 py-2 rounded-md font-medium transition-colors ${
          variant === "ghost"
            ? "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            : "text-white bg-blue-500 hover:bg-blue-400"
        } ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

// NavLink component
function NavLink({ to, children }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 transition duration-300"
    >
      {children}
    </Link>
  );
}

// MobileNavLink component
function MobileNavLink({ to, children }) {
  return (
    <Link
      to={to}
      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition duration-300"
    >
      {children}
    </Link>
  );
}

// Main Navbar component
function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  // If the user is authenticated, hide the navbar
  if (isAuthenticated) {
    return null;
  }

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img
                className="h-12 w-auto transition-transform duration-300 hover:scale-105"
                src={logo}
                alt="Logo"
              />
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <NavLink to="/">Home</NavLink>
              <NavLink to="/about">About Us</NavLink>
              <NavLink to="/contact">Contact</NavLink>
            </div>
          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link to="/login">Log In</Link>
            </Button>
            <Button asChild>
              <Link to="/signup">Sign Up</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              onClick={() => setIsOpen(!isOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Links */}
      <div className={`${isOpen ? "block" : "hidden"} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <MobileNavLink to="/">Home</MobileNavLink>
          <MobileNavLink to="/about">About Us</MobileNavLink>
          <MobileNavLink to="/contact">Contact</MobileNavLink>
          <MobileNavLink to="/login">Log In</MobileNavLink>
          <MobileNavLink to="/signup">Sign Up</MobileNavLink>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
