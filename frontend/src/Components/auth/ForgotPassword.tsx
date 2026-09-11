



import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";

const ForgotPassword: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    if (!email) {
      setMessage({ text: "Email is required", type: "error" });
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_APP_API_URL}/api/reset-password-send-otp`, { email });
      setMessage({ text: "OTP sent to your email", type: "success" });
      setStep(2);
    } catch (error) {
      let errorMessage = "Failed to send OTP";
      if (error instanceof AxiosError && error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      setMessage({
        text: errorMessage,
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setMessage({ text: "OTP is required", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_APP_API_URL}/api/reset-password-verify-otp`, {
        email,
        code: otp
      });
      
      if (response.data.success) {
        setMessage({ text: "OTP verified successfully", type: "success" });
        setStep(3);
      } else {
        setMessage({ text: "Invalid OTP", type: "error" });
      }
    } catch (error) {
      let errorMessage = "OTP verification failed";
      if (error instanceof AxiosError && error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      setMessage({
        text: errorMessage,
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setMessage({ 
        text: "Password must be at least 6 characters", 
        type: "error" 
      });
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_APP_API_URL}/api/reset-password`, {
        email,
        newPassword
      });
      
      setMessage({ 
        text: "Password reset successfully", 
        type: "success" 
      });
      
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      let errorMessage = "Password reset failed";
      if (error instanceof AxiosError && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      setMessage({
        text: errorMessage,
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-semibold text-center mb-4 text-gray-800">
        Reset Password
      </h2>

      {/* Status message display */}
      {message.text && (
        <p 
          className={`text-center mb-4 ${
            message.type === "error" ? "text-red-500" : "text-green-500"
          }`}
        >
          {message.text}
        </p>
      )}

      {/* Step 1: Email input */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>
          
          <button
            className={`w-full py-2 px-4 rounded-md text-white ${
              loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
            onClick={handleSendOtp}
            disabled={loading}
          >
            {loading ? "Processing..." : "Send OTP"}
          </button>
        </div>
      )}

      {/* Step 2: OTP verification */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              OTP Code
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP from email"
            />
          </div>
          
          <button
            className={`w-full py-2 px-4 rounded-md text-white ${
              loading ? "bg-green-400" : "bg-green-600 hover:bg-green-700"
            }`}
            onClick={handleVerifyOtp}
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </div>
      )}

      {/* Step 3: New password */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password (min 6 characters)"
            />
          </div>
          
          <button
            className={`w-full py-2 px-4 rounded-md text-white ${
              loading ? "bg-purple-400" : "bg-purple-600 hover:bg-purple-700"
            }`}
            onClick={handleResetPassword}
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;