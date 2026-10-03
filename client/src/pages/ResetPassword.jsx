import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import api from "../configs/api";
import toast from "react-hot-toast";
import { Helmet } from "react-helmet-async";

const PasswordInput = ({
  label,
  value,
  onChange,
  show,
  onToggleShow,
  error,
  name,
  autoComplete,
}) => (
  <div className="relative w-full">
    <div className="flex items-center w-full mb-4 bg-slate-50 border border-slate-200 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100 transition-all h-12 rounded-xl overflow-hidden px-4 gap-3">
      <Lock size={18} className="text-slate-400" />
      <input
        type={show ? "text" : "password"}
        placeholder={label}
        name={name}
        autoComplete={autoComplete}
        className="no-global-input bg-transparent text-slate-800 placeholder-slate-400 outline-none text-sm w-full h-full font-medium pr-12"
        value={value}
        onChange={onChange}
        required
      />
      <button
        type="button"
        onClick={onToggleShow}
        className="absolute right-4 text-slate-400 hover:text-slate-600 transition-colors p-1"
        aria-label={show ? "Hide password" : "Show password"}>
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
    {error && (
      <p className="text-red-500 text-xs mt-1 ml-2 text-left">{error}</p>
    )}
  </div>
);

const ResetPassword = () => {
  const navigate = useNavigate();

  // Read resetToken from sessionStorage (persists across refresh)
  const resetToken = sessionStorage.getItem("resetToken");
  const resetEmail = sessionStorage.getItem("resetEmail");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_-])[A-Za-z\d@$!%*?&.#_-]{8,}$/;

  const isPasswordValid = passwordRegex.test(password);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const isFormValid = isPasswordValid && passwordsMatch;

  useEffect(() => {
    if (!resetToken) {
      toast.error("Session expired. Please request a new password reset.");
      navigate("/forgot-password");
    }
  }, [resetToken, navigate]);

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    
    // Real-time validation
    if (value.length > 0 && !passwordRegex.test(value)) {
      setPasswordError("Password does not meet requirements");
    } else {
      setPasswordError("");
    }
    
    // Check match if confirm already has value
    if (confirmPassword.length > 0) {
      if (value !== confirmPassword) {
        setConfirmError("Passwords do not match");
      } else {
        setConfirmError("");
      }
    }
  };

  const handleConfirmChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    
    if (value.length > 0 && value !== password) {
      setConfirmError("Passwords do not match");
    } else {
      setConfirmError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Final validation
    if (!isPasswordValid) {
      setPasswordError("Password does not meet requirements");
      return;
    }
    if (!passwordsMatch) {
      setConfirmError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post("/api/users/reset-password", {
        resetToken,
        newPassword: password,
      });

      toast.success(data.message);
      
      // Clear sessionStorage after successful reset
      sessionStorage.removeItem("resetToken");
      sessionStorage.removeItem("resetEmail");
      
      navigate("/login");
    } catch (error) {
      const message = error.response?.data?.message || "Password reset failed";
      toast.error(message);
      
      // If token invalid/expired, redirect to start over
      if (message.includes("Invalid") || message.includes("expired")) {
        sessionStorage.removeItem("resetToken");
        sessionStorage.removeItem("resetEmail");
        setTimeout(() => navigate("/forgot-password"), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Reset Password | AI Resume Builder</title>
        <meta
          name="description"
          content="Create a new strong password for your account."
        />
      </Helmet>
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 font-sans p-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-green-100 to-transparent -z-10"></div>
        <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-200/50 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-green-200/50 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

        <form
          onSubmit={handleSubmit}
          className="w-full sm:w-[400px] text-center border border-slate-200 rounded-3xl p-10 bg-white shadow-xl shadow-slate-200/50 relative z-10">
          <h1 className="text-slate-900 text-3xl font-bold tracking-tight mb-2">
            Set New Password
          </h1>
          <p className="text-slate-500 text-sm mb-8">
            {resetEmail ? `Resetting password for ${resetEmail}` : "Your new password must be different from previous passwords."}
          </p>

          <PasswordInput
            label="New Password"
            value={password}
            onChange={handlePasswordChange}
            show={showPassword}
            onToggleShow={() => setShowPassword(!showPassword)}
            error={passwordError}
            name="newPassword"
            autoComplete="new-password"
          />

          <PasswordInput
            label="Confirm Password"
            value={confirmPassword}
            onChange={handleConfirmChange}
            show={showConfirmPassword}
            onToggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
            error={confirmError}
            name="confirmPassword"
            autoComplete="new-password"
          />

          {passwordsMatch && confirmPassword.length > 0 && (
            <div className="mb-6 flex items-center gap-2 text-green-500 text-sm justify-center">
              <CheckCircle size={16} />
              <span>Passwords match</span>
            </div>
          )}

          <div className="mb-6">
            <p className={`text-xs text-left leading-5 ${
              isPasswordValid ? "text-green-500" : "text-slate-500"
            }`}>
              Password must contain:
              <br />
              <span className={isPasswordValid ? "text-green-500" : ""}>
                • At least 8 characters
              </span>
              <br />
              <span className={isPasswordValid ? "text-green-500" : ""}>
                • One uppercase letter
              </span>
              <br />
              <span className={isPasswordValid ? "text-green-500" : ""}>
                • One lowercase letter
              </span>
              <br />
              <span className={isPasswordValid ? "text-green-500" : ""}>
                • One number
              </span>
              <br />
              <span className={isPasswordValid ? "text-green-500" : ""}>
                • One special character (@$!%*?&.#_-)
              </span>
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !isFormValid}
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
                Resetting...
              </>
            ) : (
              "Reset Password"
            )}
          </button>

          <p className="text-slate-500 text-sm mt-8">
            Remember your password?{" "}
            <button
              type="button"
              className="text-green-600 font-semibold hover:text-green-700 transition-colors"
              onClick={() => navigate("/login")}>
              Sign in
            </button>
          </p>
        </form>
      </div>
    </>
  );
};

export default ResetPassword;