import React, { useEffect, useState } from "react";
import { Check, X, Loader2 } from "lucide-react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(null); // Removed TypeScript type annotations
  const [isLoading, setIsLoading] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    hasLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
  });

  const { token } = useParams();
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

  useEffect(() => {
    const validatePassword = (password) => {
      setPasswordValidation({
        hasLength: password.length >= 8,
        hasUpperCase: /[A-Z]/.test(password),
        hasLowerCase: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
      });
    };
    validatePassword(password);
  }, [password]);

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);
  const passwordsMatch = password === confirmPassword && confirmPassword !== "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage({
        type: "error",
        text: "Passwords do not match",
      });
      return;
    }
    if (!isPasswordValid) {
      setMessage({
        type: "error",
        text: "Password does not meet all requirements",
      });
      return;
    }
    setIsLoading(true);
    setMessage(null);
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/reset-password`, {
        token,
        password,
      });
      setMessage({
        type: "success",
        text: res.data.message,
      });
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err.response?.data?.message ||
          "Error: Could not reset password. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const ValidationIcon = ({ isValid }) =>
    isValid ? (
      <Check className="w-4 h-4 text-emerald-500" />
    ) : (
      <X className="w-4 h-4 text-rose-500" />
    );

  return (
    <div className="min-h-screen bg-gradient-to-r from-cyan-400 to-teal-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Reset Password
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all"
                placeholder="Enter new password"
              />
              {/* Password Requirements */}
              <div className="mt-3 p-4 bg-white rounded-lg space-y-2 border border-gray-100">
                <div className="flex items-center gap-2 text-sm">
                  <ValidationIcon isValid={passwordValidation.hasLength} />
                  <span
                    className={
                      passwordValidation.hasLength
                        ? "text-gray-700"
                        : "text-gray-500"
                    }
                  >
                    At least 8 characters
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <ValidationIcon isValid={passwordValidation.hasUpperCase} />
                  <span
                    className={
                      passwordValidation.hasUpperCase
                        ? "text-gray-700"
                        : "text-gray-500"
                    }
                  >
                    One uppercase letter
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <ValidationIcon isValid={passwordValidation.hasLowerCase} />
                  <span
                    className={
                      passwordValidation.hasLowerCase
                        ? "text-gray-700"
                        : "text-gray-500"
                    }
                  >
                    One lowercase letter
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <ValidationIcon isValid={passwordValidation.hasNumber} />
                  <span
                    className={
                      passwordValidation.hasNumber
                        ? "text-gray-700"
                        : "text-gray-500"
                    }
                  >
                    One number
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Confirm new password"
                className={`w-full px-4 py-2 border rounded-lg transition-all focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 ${confirmPassword && !passwordsMatch ? "border-rose-500 bg-rose-50" : confirmPassword && passwordsMatch ? "border-emerald-500 bg-emerald-50" : "border-gray-200"}`}
              />
              {confirmPassword && !passwordsMatch && (
                <p className="text-sm text-rose-500 mt-1">
                  Passwords do not match
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading || !isPasswordValid || !passwordsMatch}
              className="w-full px-4 py-2 bg-gradient-to-r from-cyan-400 to-teal-500 text-white rounded-lg hover:from-cyan-500 hover:to-teal-600 focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium shadow-lg shadow-cyan-500/25"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Resetting Password...
                </>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>
          {message && (
            <div
              className={`mt-4 p-4 rounded-lg ${message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}
            >
              {message.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;