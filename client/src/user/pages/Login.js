import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, BarChart2 } from "lucide-react"; // Import BarChart2 icon
import TourismLogo from "../components/img/Tourism_logo.png";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login`, {
        username,
        password,
      });
      sessionStorage.setItem("token", res.data.token);
      sessionStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/user/dashboard");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDashboardClick = () => {
    navigate("/main-dashboard"); // Navigate to MainDashboard
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-cyan-400 to-teal-500 p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-4 mb-4">
            <img
              src={TourismLogo}
              alt="Panglao Logo 2"
              className="w-20 h-20 object-contain"
            />
          </div>
          <h1 className="text-xl font-semibold text-center text-gray-800">
            Panglao Tourist Data Management System
          </h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
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
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-400 to-teal-500 text-white py-2 rounded-lg hover:opacity-90 transition-opacity font-medium"
          >
            Login
          </button>
        </form>
        <div className="mt-6 space-y-2 text-center">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link to="/signup" className="text-cyan-600 hover:text-cyan-700">
              Sign up
            </Link>
          </p>
          <p>
            <Link
              to="/forgot-password"
              className="text-cyan-600 hover:text-cyan-700"
            >
              Forgot Password?
            </Link>
          </p>
          <p>
            <Link
              to="/admin/login"
              className="text-cyan-600 hover:text-cyan-700"
            >
              Login as Administrator
            </Link>
          </p>
        </div>
      </div>

      {/* Add the Statistics/Data Button */}
      <button
        onClick={handleDashboardClick}
        className="fixed bottom-6 right-6 p-4 text-white rounded-full shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center"
        style={{ 
          backgroundColor: "#FF6F00", // Amber color for logout
          width: "56px", 
          height: "56px" }} // Fixed size for a circular button
      >
        <BarChart2 size={35} /> {/* BarChart2 icon */}
      </button>
    </div>
  );
};

export default Login;