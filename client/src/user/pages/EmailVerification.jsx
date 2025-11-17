/**
 * EmailVerification.jsx
 * 
 * Panglao Tourist Data Management System - Email Verification Page (Frontend)
 * 
 * =========================
 * Overview:
 * =========================
 * This React component handles the user interface and logic for verifying a user's email address after registration.
 * It is accessed via a verification link sent to the user's email, which includes a token and email as query parameters.
 * 
 * =========================
 * Responsibilities:
 * =========================
 * - Extracts the verification token and email from the URL query parameters.
 * - Sends a request to the backend API to verify the user's email address.
 * - Handles different verification states: verifying, success, and error.
 * - If verification fails, checks if the email is already verified and displays an appropriate message.
 * - Provides options for users to continue registration or request a new verification email.
 * 
 * =========================
 * Key Features:
 * =========================
 * - Uses React Router's useSearchParams to read URL parameters.
 * - Displays loading, success, and error states with clear feedback and icons.
 * - Integrates with the backend via fetch API for verification and status checks.
 * - Responsive and accessible UI with branding and navigation options.
 * 
 * =========================
 * Typical Usage:
 * =========================
 * - Accessed via a verification link sent to the user's email (e.g., /email-verification?token=...&email=...).
 * - Used by users to confirm their email address before completing registration.
 * 
 * =========================
 * Developer Notes:
 * =========================
 * - The backend endpoint for email verification is GET /auth/verify-email.
 * - The backend endpoint for checking verification status is GET /auth/check-email-verification.
 * - Update this component if the verification flow or UI requirements change.
 * 
 * =========================
 * Related Files:
 * =========================
 * - src/user/pages/Signup.jsx                (initiates email verification)
 * - server/controllers/authController.js     (handles backend verification logic)
 * - server/routes/auth.js                    (defines backend verification routes)
 * - utils/emailVerification.js               (generates and sends verification emails)
 * 
 * =========================
 * Author: Carlojead Amaquin
 * Date: [2025-08-21]
 */

import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { authAPI } from "../../services/api";

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState("verifying"); // "verifying", "success", "error"
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    const emailParam = searchParams.get("email");

    if (!token || !emailParam) {
      setVerificationStatus("error");
      setMessage("Invalid verification link. Please request a new verification email.");
      return;
    }

    setEmail(emailParam);

    // Verify the email
    const verifyEmail = async () => {
      try {
        const response = await authAPI.verifyEmail(emailParam, token);

        if (response.success) {
          setVerificationStatus("success");
          setMessage(response.message);
        } else {
          // If verification failed, check if email is already verified
          const statusRes = await authAPI.checkEmailVerification(emailParam);
          if (statusRes.success && statusRes.verified) {
            setVerificationStatus("success");
            setMessage("Your email is already verified! You can now complete your registration.");
          } else {
            setVerificationStatus("error");
            setMessage(response.message || "Verification failed. Please try again.");
          }
        }
      } catch (error) {
        console.error("Verification error:", error);
        setVerificationStatus("error");
        setMessage("An error occurred during verification. Please try again.");
      }
    };

    verifyEmail();
  }, [searchParams]);

  const handleContinueToRegistration = () => {
    navigate("/signup", { state: { verifiedEmail: email } });
  };

  const handleRequestNewVerification = () => {
    navigate("/signup", { state: { requestVerification: true } });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-cyan-400 to-teal-500 p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-4 mb-4">
            <img src="/img/Tourism_logo.png" alt="Panglao Logo" className="w-20 h-20 object-contain" />
          </div>
          <h1 className="text-xl font-semibold text-center text-gray-800">
            Email Verification
          </h1>
        </div>

        <div className="text-center">
          {verificationStatus === "verifying" && (
            <div className="space-y-4">
              <Loader2 className="w-12 h-12 text-cyan-500 animate-spin mx-auto" />
              <p className="text-gray-600">Verifying your email address...</p>
            </div>
          )}

          {verificationStatus === "success" && (
            <div className="space-y-4">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
              <h2 className="text-lg font-semibold text-green-700">Email Verified!</h2>
              <p className="text-gray-600">{message}</p>
              <button
                onClick={handleContinueToRegistration}
                className="w-full bg-gradient-to-r from-cyan-400 to-teal-500 text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Continue to Registration
              </button>
            </div>
          )}

          {verificationStatus === "error" && (
            <div className="space-y-4">
              <XCircle className="w-12 h-12 text-red-500 mx-auto" />
              <h2 className="text-lg font-semibold text-red-700">Verification Failed</h2>
              <p className="text-gray-600">{message}</p>
              <button
                onClick={handleRequestNewVerification}
                className="w-full bg-gradient-to-r from-cyan-400 to-teal-500 text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Request New Verification
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/signup")}
            className="text-cyan-600 hover:text-cyan-700 text-sm"
          >
            Back to Signup
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
