import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import Loader from "./Loader.jsx";

const ProtectedRoute = () => {
  const { user, loading } = useSelector((state) => state.auth);
  const location = useLocation();

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    const redirectPath = encodeURIComponent(location.pathname + location.search);
    sessionStorage.setItem("authRedirect", redirectPath);
    return <Navigate to={`/login?redirect=${redirectPath}`} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;