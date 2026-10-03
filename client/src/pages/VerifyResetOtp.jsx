import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../configs/api";
import toast from "react-hot-toast";
import OtpInput from "react-otp-input";

const VerifyResetOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(60);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  useEffect(() => {
    if (seconds <= 0) return;

    const timer = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds]);

  const verifyOtp = async () => {
    if (otp.length !== 6) {
      return toast.error("Enter 6 digit OTP");
    }

    try {
      setLoading(true);

      const { data } = await api.post("/api/users/verify-reset-otp", {
        email,
        otp,
      });

      toast.success(data.message);

      // Persist resetToken in sessionStorage (survives refresh)
      sessionStorage.setItem("resetToken", data.resetToken);
      sessionStorage.setItem("resetEmail", email);

      navigate("/reset-password");
    } catch (error) {
      toast.error(error.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    try {
      setResending(true);

      const { data } = await api.post("/api/users/forgot-password", {
        email,
      });

      toast.success(data.message);

      setSeconds(60);
      setOtp("");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-[400px]">
        <h1 className="text-2xl font-bold text-center">Reset Password</h1>

        <p className="text-gray-500 mt-2 text-center">OTP has been sent to</p>

        <p className="font-semibold text-center mb-6">{email}</p>

        <OtpInput
          value={otp}
          onChange={setOtp}
          numInputs={6}
          renderSeparator={<span className="w-2"></span>}
          renderInput={(props) => (
            <input
              {...props}
              className="!w-12 !h-14 border border-gray-300 rounded-lg text-center text-xl font-semibold focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
            />
          )}
        />

        <button
          onClick={verifyOtp}
          disabled={loading}
          className="mt-6 w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700">
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        <div className="mt-5 text-center">
          {seconds > 0 ? (
            <p>Resend OTP in {seconds}s</p>
          ) : (
            <button
              disabled={resending}
              onClick={resendOtp}
              className="text-green-600 font-semibold disabled:text-gray-400">
              {resending ? "Sending..." : "Resend OTP"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyResetOtp;