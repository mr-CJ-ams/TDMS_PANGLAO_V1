import React from "react";
import { Navigate } from "react-router-dom";
import { ProtectedRouteProps } from "../types";

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, isAdmin = false }) => {
  const token = sessionStorage.getItem("token");
  const user = JSON.parse(sessionStorage.getItem("user") || "null"); // Get user details

  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/login" />;
  }

  // If the route is for admins, check the user's role
  if (isAdmin && user?.role !== "admin") {
    return <Navigate to="/login" />; // Redirect to login if not an admin
  }

  // If authenticated (and authorized for admin routes), render the children
  return <>{children}</>;
};

export default ProtectedRoute;