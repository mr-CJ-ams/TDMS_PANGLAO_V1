/**
 * Login.jsx
 * 
 * Panglao Tourist Data Management System - User Login Page
 * 
 * =========================
 * Overview:
 * =========================
 * This file implements the login page for users of the Panglao TDMS frontend. It provides a secure, user-friendly interface for users to authenticate with their email and password, and handles navigation based on user roles (admin or regular user).
 * 
 * =========================
 * Responsibilities:
 * =========================
 * - Renders the login form with email and password fields, including password visibility toggle.
 * - Handles form submission, sending login credentials to the backend API for authentication.
 * - Displays loading spinner and error messages for failed login attempts or deactivated accounts.
 * - Stores JWT token and user information in sessionStorage upon successful login.
 * - Redirects users to the appropriate dashboard (admin or user) based on their role.
 * - Provides navigation links for signup, password recovery, and help/support.
 * 
 * =========================
 * Key Features:
 * =========================
 * - Uses React hooks for state management and navigation.
 * - Integrates with axios for HTTP requests to the backend API.
 * - Implements a login timeout to handle slow or failed requests gracefully.
 * - Shows a branded logo and styled UI for a professional user experience.
 * - Supports password visibility toggle for better usability.
 * 
 * =========================
 * Typical Usage:
 * =========================
 * - Accessed via the "/login" route in the frontend application.
 * - Used by both new and returning users to access their accounts.
 * - Redirects to "/admin/dashboard" for admins and "/user/dashboard" for regular users.
 * 
 * =========================
 * Developer Notes:
 * =========================
 * - Update API_BASE_URL as needed for different environments.
 * - Extend error handling for more granular feedback if required.
 * - For additional authentication features (e.g., social login), add logic here.
 * 
 * =========================
 * Related Files:
 * =========================
 * - ../components/DolphinSpinner.jsx   (loading spinner component)
 * - ../components/img/Tourism_logo.png (logo image)
 * - src/user/pages/Signup.jsx          (signup page)
 * - src/user/pages/ForgotPassword.jsx  (password recovery page)
 * - src/user/pages/HelpSupportPage.jsx (help/support page)
 * 
 * =========================
 * Author: Carlojead Amaquin
 * Date: [2025-08-21]
 */


import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, HelpCircle } from "lucide-react";
import DolphinSpinner from "../components/DolphinSpinner";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const LOGIN_TIMEOUT = 30000;

const Login = () => {
  const [email, setEmail] = useState(""),
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
      const { data } = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
      clearTimeout(timeoutId);
      if (data.message === "Account is deactivated") {
        setError("Your account has been deactivated. Please contact the administrator.");
        return;
      }
      sessionStorage.setItem("token", data.token);

      // Only store safe fields
      const safeUser = {
        user_id: data.user.user_id,
        role: data.user.role,
        company_name: data.user.company_name,
        accommodation_type: data.user.accommodation_type,
        number_of_rooms: data.user.number_of_rooms,
        region: data.user.region,
        province: data.user.province,
        municipality: data.user.municipality,
        barangay: data.user.barangay,
        is_active: data.user.is_active,
        is_approved: data.user.is_approved,
        email_verified: data.user.email_verified,
        // Add other non-sensitive fields as needed
      };
      sessionStorage.setItem("user", JSON.stringify(safeUser));
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
            <img src="/img/Tourism_logo.png" alt="Panglao Logo 2" className="w-20 h-20 object-contain" />
          </div>
          <h1 className="text-xl font-semibold text-center text-gray-800">Panglao Tourist Data Management System</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
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
