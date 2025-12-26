import React from "react";
import { Navigate } from "react-router-dom";
import Cookies from "universal-cookie";

const cookies = new Cookies();

const ProtectedRoute = ({ children, role }) => {
  const token = cookies.get("authToken");
  const user = JSON.parse(localStorage.getItem("userInfo"));

  // Not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Role check
  if (role && user?.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
