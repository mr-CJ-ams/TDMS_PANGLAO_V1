import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import TourismLogo from "../components/img/Tourism_logo.png";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

const ForgotPassword = () => {
  const [email, setEmail] = useState(""),
    [message, setMessage] = useState(""),
    [isLoading, setIsLoading] = useState(false),
    [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true); setMessage("");
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });
      setMessage(res.data.message); setIsSuccess(true);
    } catch (err) {
      setMessage("Error: Could not send reset link. Please try again."); setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-cyan-400 to-teal-500 p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <img src={TourismLogo} alt="Panglao Logo 2" className="w-20 h-20 object-contain mb-4" />
          <h1 className="text-xl font-semibold text-center text-gray-800">Panglao Tourist Data Management System</h1>
        </div>
        <div className="text-center mb-6">
          <h2 className="text-xl font-medium text-gray-900">Forgot Password</h2>
          <p className="text-gray-600 mt-2">Enter your email address and we'll send you a link to reset your password</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
              placeholder="Enter your email"
            />
          </div>
          {message && (
            <div className={`p-4 rounded-lg ${isSuccess ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
              {message}
            </div>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-cyan-400 to-teal-500 text-white py-2 rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50"
          >
            {isLoading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
        <div className="mt-6 text-center">
          <Link to="/login" className="inline-flex items-center text-cyan-600 hover:text-cyan-700 gap-1">
            <ArrowLeft size={16} />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
