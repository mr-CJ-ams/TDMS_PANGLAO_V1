import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Check, X, Loader } from "lucide-react";
import TourismLogo from "../components/img/Tourism_logo.png"
const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    hasLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecial: false,
  });
  const { token } = useParams();
  const navigate = useNavigate();
  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";
  useEffect(() => {
    const validatePassword = (password) => {
      setPasswordValidation({
        hasLength: password.length >= 8,
        hasUpperCase: /[A-Z]/.test(password),
        hasLowerCase: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      });
    };
    validatePassword(password);
  }, [password]);
  const isPasswordValid = Object.values(passwordValidation).every(Boolean);
  const doPasswordsMatch = password === confirmPassword;
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isPasswordValid) {
      setMessage("Please ensure password meets all requirements");
      setStatus("error");
      return;
    }
    if (!doPasswordsMatch) {
      setMessage("Passwords do not match");
      setStatus("error");
      return;
    }
    setStatus("loading");
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/reset-password`, {
        token,
        password,
      });
      setMessage(res.data.message);
      setStatus("success");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setMessage("Error: Could not reset password. Please try again.");
      setStatus("error");
    }
  };
  const ValidationIcon = ({ isValid }) =>
    isValid ? (
      <Check className="w-4 h-4 text-green-500" />
    ) : (
      <X className="w-4 h-4 text-red-500" />
    );
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-cyan-400 to-teal-500 p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-4 mb-4">
            <img
              src={TourismLogo}
              alt="Panglao Logo 1"
              className="w-20 h-20 object-contain"
            />
          </div>
          <h1 className="text-xl font-semibold text-center text-gray-800">
            Panglao Tourist Data Management System
          </h1>
        </div>
        <div className="mb-6">
          <h2 className="text-xl font-medium text-gray-900 text-center">
            Reset Password
          </h2>
          <p className="mt-2 text-sm text-gray-600 text-center">
            Please enter your new password below
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <ValidationIcon isValid={passwordValidation.hasLength} />
                <span>At least 8 characters</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <ValidationIcon isValid={passwordValidation.hasUpperCase} />
                <span>One uppercase letter</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <ValidationIcon isValid={passwordValidation.hasLowerCase} />
                <span>One lowercase letter</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <ValidationIcon isValid={passwordValidation.hasNumber} />
                <span>One number</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <ValidationIcon isValid={passwordValidation.hasSpecial} />
                <span>One special character</span>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {confirmPassword && (
              <div className="mt-2 flex items-center gap-2 text-sm">
                <ValidationIcon isValid={doPasswordsMatch} />
                <span>Passwords match</span>
              </div>
            )}
          </div>
          {message && (
            <div
              className={`p-4 rounded-lg ${status === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}
            >
              {message}
            </div>
          )}
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-gradient-to-r from-cyan-400 to-teal-500 text-white py-2 rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50 flex items-center justify-center"
          >
            {status === "loading" ? (
              <>
                <Loader className="animate-spin -ml-1 mr-2 h-5 w-5" />
                Resetting Password...
              </>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>
        {status === "success" && (
          <p className="mt-4 text-sm text-gray-600 text-center">
            Redirecting to login page in 3 seconds...
          </p>
        )}
      </div>
    </div>
  );
};
export default ResetPassword;
