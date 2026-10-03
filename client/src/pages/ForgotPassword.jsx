import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Mail, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../configs/api";
import toast from "react-hot-toast";
import { Helmet } from "react-helmet-async";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  
  // Get email from navigation state (user clicked "Forgot password?" from login)
  const loginEmail = location.state?.email || "";
  
  // Auto-fill email priority:
  // 1. Email from login attempt
  // 2. Logged-in user's email
  // 3. sessionStorage from previous reset flow
  const savedEmail = sessionStorage.getItem("resetEmail") || "";
  const initialEmail = loginEmail || user?.email || savedEmail || "";
  
  const [email, setEmail] = React.useState(initialEmail);
  const [loading, setLoading] = React.useState(false);
  
  // If email is auto-filled from login or auth, make it read-only
  const isEmailPrefilled = !!loginEmail || !!user?.email;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      return toast.error("Email is required");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return toast.error("Please enter a valid email address");
    }

    setLoading(true);

    try {
      const { data } = await api.post("/api/users/forgot-password", { email });

      toast.success(data.message);

      // Store email in sessionStorage for subsequent steps
      sessionStorage.setItem("resetEmail", email);

      navigate("/verify-reset-otp", {
        state: { email },
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send reset OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Forgot Password | AI Resume Builder</title>
        <meta
          name="description"
          content="Request a password reset link to securely regain access to your account."
        />
      </Helmet>
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 font-sans p-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-green-100 to-transparent -z-10"></div>
        <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-200/50 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-green-200/50 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

        <Link
          to="/login"
          className="absolute top-8 left-8 text-slate-500 hover:text-slate-800 font-medium flex items-center gap-2 transition-colors">
          <ArrowLeft size={20} />
          Back to Login
        </Link>

        <form
          onSubmit={handleSubmit}
          className="w-full sm:w-[400px] text-center border border-slate-200 rounded-3xl p-10 bg-white shadow-xl shadow-slate-200/50 relative z-10">
          <h1 className="text-slate-900 text-3xl font-bold tracking-tight mb-2">
            Forgot Password?
          </h1>
          <p className="text-slate-500 text-sm mb-8">
            {isEmailPrefilled 
              ? `Sending reset OTP to your registered email: ${email}` 
              : "Enter your email address and we'll send you a 6-digit OTP to reset your password."}
          </p>

          <div className="flex items-center w-full mb-4 bg-slate-50 border border-slate-200 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100 transition-all h-12 rounded-xl overflow-hidden px-4 gap-3">
            <Mail size={18} className="text-slate-400" />
            <input
              type="email"
              placeholder="Email address"
              className={`bg-transparent text-slate-800 placeholder-slate-400 outline-none text-sm w-full h-full font-medium ${isEmailPrefilled ? "bg-slate-100 cursor-not-allowed" : ""}`}
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              readOnly={isEmailPrefilled}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-full text-white font-medium bg-slate-900 hover:bg-slate-800 disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all">
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                Sending OTP...
              </>
            ) : (
              "Send Reset OTP"
            )}
          </button>

          <p className="text-slate-500 text-sm mt-8">
            Remember your password?{" "}
            <Link
              to="/login"
              className="text-green-600 font-semibold hover:text-green-700 transition-colors">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </>
  );
};

export default ForgotPassword;