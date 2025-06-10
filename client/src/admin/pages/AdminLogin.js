import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff, ShieldAlert } from "lucide-react";
import TourismLogo from "../components/img/1738398998646-Tourism_logo.png";
import DolphinSpinner from "../../user/components/DolphinSpinner";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";
const LOGIN_TIMEOUT = 30000;

const AdminLogin = () => {
  const [username, setUsername] = useState(""),
    [password, setPassword] = useState(""),
    [showPassword, setShowPassword] = useState(false),
    [error, setError] = useState(""),
    [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    if (isSubmitting) return;
    setError(""); setIsSubmitting(true);
    const timeoutId = setTimeout(() => {
      setIsSubmitting(false);
      setError("Login is taking longer than expected. Please try again.");
    }, LOGIN_TIMEOUT);
    try {
      const { data } = await axios.post(`${API_BASE_URL}/auth/admin/login`, { username, password });
      clearTimeout(timeoutId);
      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("user", JSON.stringify(data.user));
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-cyan-400 to-teal-500 p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <img src={TourismLogo} alt="Panglao Logo 2" className="w-20 h-20 object-contain mb-4" />
          <h1 className="text-xl font-semibold text-center text-gray-800 mb-2">Panglao Tourist Data Management System</h1>
          <div className="flex items-center gap-2 text-gray-600">
            <ShieldAlert size={20} /><span className="font-medium">Administrator Access</span>
          </div>
        </div>
        {error && <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
              autoComplete="username"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-gradient-to-r from-cyan-400 to-teal-500 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 ${isSubmitting ? "opacity-75 cursor-not-allowed" : "hover:opacity-90"}`}
          >
            {isSubmitting ? (<><DolphinSpinner size="sm" />Authenticating...</>) : "Login as Administrator"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;