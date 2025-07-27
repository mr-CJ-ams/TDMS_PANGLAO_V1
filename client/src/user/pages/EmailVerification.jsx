import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import TourismLogo from "../components/img/Tourism_logo.png";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

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
        const response = await fetch(
          `${API_BASE_URL}/auth/verify-email?token=${token}&email=${encodeURIComponent(emailParam)}`
        );
        const data = await response.json();

        if (data.success) {
          setVerificationStatus("success");
          setMessage(data.message);
        } else {
          // If verification failed, check if email is already verified
          const statusRes = await fetch(`${API_BASE_URL}/auth/check-email-verification?email=${encodeURIComponent(emailParam)}`);
          const statusData = await statusRes.json();
          if (statusData.success && statusData.verified) {
            setVerificationStatus("success");
            setMessage("Your email is already verified! You can now complete your registration.");
          } else {
            setVerificationStatus("error");
            setMessage(data.message || "Verification failed. Please try again.");
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
            <img src={TourismLogo} alt="Panglao Logo" className="w-20 h-20 object-contain" />
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
            onClick={() => navigate("/login")}
            className="text-cyan-600 hover:text-cyan-700 text-sm"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification; 