import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { AxiosError } from "axios";
import { useAuth } from "../auth/AuthContext";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "./firebase";

const Login: React.FC = () => {
  const { setAuthData } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_APP_API_URL}/api/login`, {
        email,
        password,
      });

      if (response.data.success) {
        setSuccessMessage(response.data.message || "Login successful!");
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        setAuthData({
          userId: response.data.user._id, // <-- এই লাইনটি যোগ করুন
          email,
          password,
          isAuthenticated: true,
          name: response.data.user.name,
          imgUrl: response.data.user.imgUrl,
          token: response.data.token,
          role: response.data.user.role,
        });
        navigate("/");
      } else {
        setError(response.data.message || "Login failed. Please try again.");
      }
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      setError(err.response?.data?.message || "Server error. Try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError("");
    setSuccessMessage("");
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const res = await axios.post(`${import.meta.env.VITE_APP_API_URL}/api/google`, {
        name: user.displayName,
        email: user.email,
        imgUrl: user.photoURL,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setAuthData({
        userId: res.data.user._id, // <-- এই লাইনটি যোগ করুন
        email: user.email,
        isAuthenticated: true,
        name: user.displayName,
        imgUrl: user.photoURL,
        token: res.data.token,
        role: res.data.user.role,
      });
      setSuccessMessage("Login Successful with Google!");
      navigate("/");
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      setError(err.response?.data?.message || "Google Sign-In Failed. Please try again.");
      console.error("Google Sign-In Error", error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="flex w-full max-w-4xl bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Left Image Part */}
        <div className="w-1/2 hidden md:block bg-blue-100">
          <img
            src="/others/log.svg"
            alt="Login Illustration"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right Form Part */}
        <div className="w-full md:w-1/2 p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Log in to your account</h2>
          <p className="text-sm text-gray-600 mb-6">Enter your credentials below</p>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {successMessage}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                {/* <Link 
                  to="/forgotpassword" 
                  className="text-sm text-blue-500 hover:underline"
                >
                  Forgot password?
                </Link> */}
              </div>
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

                            <Link 
                  to="/forgotpassword" 
                  className="text-sm  mt-5 text-blue-500 hover:underline"
                >
                  Forgot password?
                </Link>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2 px-4 rounded-lg font-medium text-white ${
                isLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isLoading ? "Logging in..." : "Log In"}
            </button>

            <div className="flex items-center justify-center gap-2">
              <div className="w-full h-px bg-gray-300" />
              <span className="text-sm text-gray-500">or</span>
              <div className="w-full h-px bg-gray-300" />
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              type="button"
              className={`w-full flex items-center justify-center gap-2 border py-2 rounded ${
                isGoogleLoading ? "bg-gray-100 cursor-not-allowed" : "hover:bg-gray-100"
              }`}
            >
              <img
                src="https://cdn-icons-png.flaticon.com/512/281/281764.png"
                alt="Google logo"
                className="w-5 h-5"
              />
              {isGoogleLoading ? "Signing in..." : "Log in with Google"}
            </button>
          </form>

          <p className="text-sm text-center text-gray-600 mt-6">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-500 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
