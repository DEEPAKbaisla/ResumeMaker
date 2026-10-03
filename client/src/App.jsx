import React, { useEffect, lazy, Suspense } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Toaster } from "react-hot-toast";

import api from "./configs/api";
import { login, setLoading } from "./app/features/authSlice";

// Lazy-loaded pages
const Home = lazy(() => import("./pages/Home"));
const Layout = lazy(() => import("./pages/Layout"));
const ResumeBuilder = lazy(() => import("./pages/ResumeBuilder"));
const Preview = lazy(() => import("./pages/Preview"));
const Login = lazy(() => import("./pages/Login"));
const VerifyOtp = lazy(() => import("./pages/VerifyOtp"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const InterviewPrep = lazy(() => import("./pages/InterviewPrep"));
const InterviewReport = lazy(() => import("./pages/InterviewReport"));
// const PdfEditor = lazy(() => import("./pages/PdfEditor"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const VerifyResetOtp = lazy(() => import("./pages/VerifyResetOtp"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));

const App = () => {
  const dispatch = useDispatch();

  const getUserData = async () => {
    const token = localStorage.getItem("token");

    try {
      if (!token) {
        dispatch(setLoading(false));
        return;
      }

      const { data } = await api.get("/api/users/data", {
        headers: { Authorization: token },
      });

      if (data.user) {
        dispatch(login({ token, user: data.user }));
      } else {
        dispatch(setLoading(false));
      }
    } catch (error) {
      dispatch(setLoading(false));
      console.log(
        "Fetch user data error:",
        error.response?.data || error.message,
      );
    }
  };

  useEffect(() => {
    getUserData();
  }, []);

  const Loader = () => {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex gap-2">
          <span className="h-3 w-3 rounded-full bg-green-600 animate-bounce"></span>
          <span
            className="h-3 w-3 rounded-full bg-green-600 animate-bounce"
            style={{ animationDelay: "0.15s" }}></span>
          <span
            className="h-3 w-3 rounded-full bg-green-600 animate-bounce"
            style={{ animationDelay: "0.3s" }}></span>
        </div>
      </div>
    );
  };
  const location = useLocation();

  useEffect(() => {
    window.gtag?.("config", "G-E1VY11LGJ3", {
      page_path: location.pathname,
    });
  }, [location.pathname]);

  return (
    <>
      {/* <Toaster /> */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: "#fff",
            color: "#111827",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "16px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
          },
          success: {
            iconTheme: {
              primary: "#22c55e",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />

      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <Loader />
          </div>
        }>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-reset-otp" element={<VerifyResetOtp />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route element={<ProtectedRoute />}>
            <Route path="app" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="builder/:resumeId" element={<ResumeBuilder />} />
              <Route path="interview-prep" element={<InterviewPrep />} />
              <Route path="interview-prep/:interviewId" element={<InterviewReport />} />
              {/* <Route path="pdf-editor" element={<PdfEditor />} /> */}
            </Route>
          </Route>

          <Route path="view/:resumeId" element={<Preview />} />
        </Routes>
      </Suspense>
    </>
  );
};

export default App;
