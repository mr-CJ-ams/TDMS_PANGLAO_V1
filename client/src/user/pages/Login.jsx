import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, HelpCircle } from "lucide-react";
import TourismLogo from "../components/img/Tourism_logo.png";
import DolphinSpinner from "../components/DolphinSpinner";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const LOGIN_TIMEOUT = 30000;

const Login = () => {
  const [username, setUsername] = useState(""),
    [password, setPassword] = useState(""),
    [showPassword, setShowPassword] = useState(false),
    [isSubmitting, setIsSubmitting] = useState(false),
    [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true); setError(null);
    const timeoutId = setTimeout(() => {
      setIsSubmitting(false);
      setError("Login is taking longer than expected. Please try again.");
    }, LOGIN_TIMEOUT);
    try {
      const { data } = await axios.post(`${API_BASE_URL}/auth/login`, { username, password });
      clearTimeout(timeoutId);
      if (data.message === "Account is deactivated") {
        setError("Your account has been deactivated. Please contact the administrator.");
        return;
      }
      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("user", JSON.stringify(data.user));
      if (data.user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/user/dashboard");
      }
    } catch {
      setError("Invalid credentials or account is deactivated");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-cyan-400 to-teal-500 p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-4 mb-4">
            <img src={TourismLogo} alt="Panglao Logo 2" className="w-20 h-20 object-contain" />
          </div>
          <h1 className="text-xl font-semibold text-center text-gray-800">Panglao Tourist Data Management System</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoComplete="username"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-gradient-to-r from-cyan-400 to-teal-500 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-opacity ${
              isSubmitting ? "opacity-75 cursor-not-allowed" : "hover:opacity-90"
            }`}
          >
            {isSubmitting ? (<><DolphinSpinner size="sm" />Logging in...</>) : "Login"}
          </button>
        </form>
        <div className="mt-6 space-y-2 text-center">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link to="/signup" className="text-cyan-600 hover:text-cyan-700">Sign up</Link>
          </p>
          <p>
            <Link to="/forgot-password" className="text-cyan-600 hover:text-cyan-700">Forgot Password?</Link>
          </p>

        </div>
      </div>
      <button
        onClick={() => navigate("/help-support")}
        className="fixed bottom-6 right-6 text-amber-500 hover:text-amber-600 transition-colors"
      >
        <HelpCircle size={32} />
      </button>
    </div>
  );
};

export default Login;