import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AxiosError } from "axios";

const Step3: React.FC = () => {
  const { authData, setAuthData } = useAuth();
  // newEmail এর টাইপ string হবে এবং null এর জন্য ফলব্যাক হিসেবে empty string
  const [newEmail, setNewEmail] = useState<string>(authData.email ?? "");
  const [token, setToken] = useState<string>("");
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // Countdown timer for resend email
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Navigate when authData.isAuthenticated changes to true
  useEffect(() => {
    if (success) {
      navigate("/");
    }
  }, [success, navigate]);

  const sendVerificationEmail = async () => {
    if (!newEmail) {
      setError("Please enter an email address");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      await axios.post(`${import.meta.env.VITE_APP_API_URL}/api/send-otp`, {
        email: newEmail,
      });

      setAuthData({ ...authData, email: newEmail });
      setEmailSent(true);
      setCountdown(120);
      setShowEmailInput(false);
      setSuccessMessage(`Verification code sent to ${newEmail}`);
    } catch (error) {
      const err = error as AxiosError<{ error: string }>;
      setError(err?.response?.data?.error || "Failed to send verification email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async () => {
    if (!token) {
      setError("Please enter the verification code");
      return;
    }

    if (token.length < 6) {
      setError("Verification code must be 6 digits");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await axios.post(`${import.meta.env.VITE_APP_API_URL}/api/verify-otp-and-register`, {
        email: newEmail,
        token,
        name: authData.name ?? "", // null ফলব্যাক
        password: authData.password ?? "", // null ফলব্যাক
        imgUrl: authData.imgUrl ?? "", // null ফলব্যাক
      });

      console.log("API Response:", response.data);

      if (response.data.success) {
        setSuccessMessage(response.data.message || "Registration successful!");
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        setAuthData({
          ...authData,
          isAuthenticated: true,
          userId: response.data.user._id ?? null,
          email: newEmail,
          token: response.data.token ?? null,
          role: response.data.user.role ?? null,
          name: response.data.user.name ?? "", // null ফলব্যাক
          imgUrl: response.data.user.imgUrl ?? "", // null ফলব্যাক
        });

        setSuccess(true);
      } else {
        setError(response.data.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      const err = error as { response?: { data?: { error?: string } } };
      setError(err.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = () => {
    if (countdown === 0) {
      sendVerificationEmail();
    }
  };

  const handleChangeEmailClick = () => {
    setShowEmailInput(true);
    setEmailSent(false);
    setToken("");
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Verify Your Email</h2>
        <p className="text-gray-600">
          {emailSent
            ? `We've sent a verification code to ${newEmail}`
            : "Please verify your email address to continue"}
        </p>
      </div>

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

      {!emailSent ? (
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex justify-between items-center">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-blue-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span className="font-medium text-blue-800">{authData.email ?? "No email provided"}</span>
            </div>
            <button
              onClick={() => setShowEmailInput(true)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Change
            </button>
          </div>

          {showEmailInput && (
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  New email address
                </label>
                <input
                  type="email"
                  id="email"
                  value={newEmail} // এখানে newEmail সবসময় string হবে
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter new email"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowEmailInput(false);
                    setNewEmail(authData.email ?? "");
                  }}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={sendVerificationEmail}
                  disabled={isLoading}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium text-white ${
                    isLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isLoading ? "Sending..." : "Send Code"}
                </button>
              </div>
            </div>
          )}

          {!showEmailInput && (
            <button
              onClick={sendVerificationEmail}
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white ${
                isLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isLoading ? "Sending..." : "Send Verification Code"}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                Verification Code
              </label>
              <input
                type="text"
                id="code"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter 6-digit code"
                maxLength={6}
              />
            </div>

            <div className="flex justify-between items-center text-sm">
              <button
                onClick={handleResendCode}
                disabled={countdown > 0}
                className={`text-blue-600 hover:text-blue-800 ${
                  countdown > 0 ? "text-gray-400 cursor-not-allowed" : ""
                }`}
              >
                {countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}
              </button>
              <button
                onClick={handleChangeEmailClick}
                className="text-gray-600 hover:text-gray-800"
              >
                Change Email
              </button>
            </div>
          </div>

          <button
            onClick={verifyEmail}
            disabled={isLoading || !token}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white ${
              isLoading || !token
                ? "bg-green-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isLoading ? "Verifying..." : "Verify Email"}
          </button>
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-gray-200">
        <button
          onClick={() => navigate(-1)}
          className="w-full py-2 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default Step3;
