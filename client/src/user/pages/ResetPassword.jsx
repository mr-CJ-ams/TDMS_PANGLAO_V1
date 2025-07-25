import { useEffect, useState } from "react";
import { Check, X, Loader2 } from "lucide-react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const ResetPassword = () => {
  const [password, setPassword] = useState(""),
    [confirmPassword, setConfirmPassword] = useState(""),
    [message, setMessage] = useState(null),
    [isLoading, setIsLoading] = useState(false),
    [passwordValidation, setPasswordValidation] = useState({
      hasLength: false, hasUpperCase: false, hasLowerCase: false, hasNumber: false,
    });
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    setPasswordValidation({
      hasLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
    });
  }, [password]);

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);
  const passwordsMatch = password === confirmPassword && confirmPassword !== "";

  const handleSubmit = async e => {
    e.preventDefault();
    if (!passwordsMatch) return setMessage({ type: "error", text: "Passwords do not match" });
    if (!isPasswordValid) return setMessage({ type: "error", text: "Password does not meet all requirements" });
    setIsLoading(true); setMessage(null);
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/reset-password`, { token, password });
      setMessage({ type: "success", text: res.data.message });
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Error: Could not reset password. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const ValidationIcon = ({ isValid }) =>
    isValid ? <Check className="w-4 h-4 text-emerald-500" /> : <X className="w-4 h-4 text-rose-500" />;

  return (
    <div className="min-h-screen bg-gradient-to-r from-cyan-400 to-teal-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Reset Password</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required minLength={8}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all"
                placeholder="Enter new password"
              />
              <div className="mt-3 p-4 bg-white rounded-lg space-y-2 border border-gray-100">
                {[
                  { valid: passwordValidation.hasLength, text: "At least 8 characters" },
                  { valid: passwordValidation.hasUpperCase, text: "One uppercase letter" },
                  { valid: passwordValidation.hasLowerCase, text: "One lowercase letter" },
                  { valid: passwordValidation.hasNumber, text: "One number" }
                ].map(({ valid, text }) => (
                  <div key={text} className="flex items-center gap-2 text-sm">
                    <ValidationIcon isValid={valid} />
                    <span className={valid ? "text-gray-700" : "text-gray-500"}>{text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required minLength={8}
                placeholder="Confirm new password"
                className={`w-full px-4 py-2 border rounded-lg transition-all focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 ${
                  confirmPassword && !passwordsMatch ? "border-rose-500 bg-rose-50" :
                  confirmPassword && passwordsMatch ? "border-emerald-500 bg-emerald-50" : "border-gray-200"
                }`}
              />
              {confirmPassword && !passwordsMatch && (
                <p className="text-sm text-rose-500 mt-1">Passwords do not match</p>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading || !isPasswordValid || !passwordsMatch}
              className="w-full px-4 py-2 bg-gradient-to-r from-cyan-400 to-teal-500 text-white rounded-lg hover:from-cyan-500 hover:to-teal-600 focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium shadow-lg shadow-cyan-500/25"
            >
              {isLoading ? (<><Loader2 className="w-4 h-4 animate-spin" />Resetting Password...</>) : "Reset Password"}
            </button>
          </form>
          {message && (
            <div className={`mt-4 p-4 rounded-lg ${message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}>
              {message.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;