/**
 * EmailVerificationRequest.jsx
 * 
 * Panglao Tourist Data Management System - Email Verification Request Page (Frontend)
 * 
 * =========================
 * Overview:
 * =========================
 * This React component provides the user interface and logic for requesting a verification email during user registration.
 * It allows users to enter their email address and receive a verification link to complete the registration process.
 * 
 * =========================
 * Responsibilities:
 * =========================
 * - Accepts user email input and validates its format.
 * - Submits a request to the backend API to send a verification email.
 * - Displays loading, success, and error states based on the API response.
 * - Provides navigation options to continue registration or return to the signup page.
 * - Pre-fills the email field if the user arrives from the signup page.
 * 
 * =========================
 * Key Features:
 * =========================
 * - Uses React Router's useNavigate and useLocation for navigation and state management.
 * - Shows real-time feedback for form submission and errors.
 * - Integrates with the backend via fetch API for sending verification requests.
 * - Responsive and accessible UI with branding and visual feedback.
 * 
 * =========================
 * Typical Usage:
 * =========================
 * - Accessed by users who need to verify their email before completing registration.
 * - Used after signup or when a user requests a new verification email.
 * 
 * =========================
 * Developer Notes:
 * =========================
 * - The backend endpoint for requesting email verification is POST /auth/request-email-verification.
 * - Update this component if the verification flow or UI requirements change.
 * - Ensure email validation matches backend requirements.
 * 
 * =========================
 * Related Files:
 * =========================
 * - src/user/pages/Signup.jsx                (initiates email verification flow)
 * - server/controllers/authController.js     (handles backend verification logic)
 * - server/routes/auth.js                    (defines backend verification routes)
 * - utils/emailVerification.js               (generates and sends verification emails)
 * 
 * =========================
 * Author: Carlojead Amaquin
 * Date: [2025-08-21]
 */

import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import TourismLogo from "../components/img/Tourism_logo.png";
import DolphinSpinner from "../components/DolphinSpinner";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const EmailVerificationRequest = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  // Pre-fill email if coming from signup page
  React.useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/request-email-verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setMessage(data.message);
      } else {
        setError(data.message || "Failed to send verification email");
      }
    } catch (err) {
      console.error("Error requesting verification:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinueToRegistration = () => {
    navigate("/signup", { state: { verifiedEmail: email } });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-cyan-400 to-teal-500 p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-4 mb-4">
            <img src={TourismLogo} alt="Panglao Logo" className="w-20 h-20 object-contain" />
          </div>
          <h1 className="text-xl font-semibold text-center text-gray-800">
            Verify Your Email
          </h1>
          <p className="text-gray-600 text-center mt-2">
            We'll send you a verification link to complete your registration
          </p>
        </div>

        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter your email address"
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-gradient-to-r from-cyan-400 to-teal-500 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-opacity ${
                isSubmitting ? "opacity-75 cursor-not-allowed" : "hover:opacity-90"
              }`}
            >
              {isSubmitting ? (
                <>
                  <DolphinSpinner size="sm" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail size={20} />
                  Send Verification Email
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
            <h2 className="text-lg font-semibold text-green-700">Email Sent!</h2>
            <p className="text-gray-600">{message}</p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                Please check your inbox and click the verification link. 
                If you don't see the email, check your spam folder.
              </p>
            </div>
            <button
              onClick={handleContinueToRegistration}
              className="w-full bg-gradient-to-r from-cyan-400 to-teal-500 text-white py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Continue to Registration
            </button>
          </div>
        )}

        <div className="mt-6 space-y-2 text-center">
          <button
            onClick={() => navigate("/signup")}
            className="flex items-center gap-2 text-cyan-600 hover:text-cyan-700 mx-auto"
          >
            <ArrowLeft size={16} />
            Back to Signup
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationRequest; 