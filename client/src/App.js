import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Signup from "./user/pages/Signup";
import Login from "./user/pages/Login";
import AdminLogin from "./admin/pages/AdminLogin";
import AdminDashboard from "./admin/pages/AdminDashboard";
import UserDashboard from "./user/pages/UserDashboard";
import ProtectedRoute from "./components/ProtectRoute";
import ForgotPassword from "./user/pages/ForgotPassword";
import ResetPassword from "./user/pages/ResetPassword";
import SubmissionDetails from "./user/pages/SubmissionDetails";
import MainDashboard from "./admin/pages/MainDashboard";
import "bootstrap/dist/css/bootstrap.min.css";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} /> {/* Add this line */}
        <Route path="/admin/login" element={<AdminLogin />} />
        {/* Protected Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute isAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/dashboard"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/submission-details/:submissionId"
          element={<SubmissionDetails />}
        />
        <Route path="/main-dashboard" element={<MainDashboard />} />
      </Routes>
    </Router>
  );
};

export default App;