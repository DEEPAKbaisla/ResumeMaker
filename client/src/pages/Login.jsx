import { Lock, Mail, User2Icon } from "lucide-react";
import React from "react";
import { useDispatch } from "react-redux";
import { login } from "../app/features/authSlice";
import toast from "react-hot-toast";
import api from "../configs/api";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const query = new URLSearchParams(window.location.search);
  const urlState = query.get("state");
  const [state, setState] = React.useState(urlState || "login");
  const [loading, setLoading] = React.useState(false);

  const [formdata, setFormData] = React.useState({
    name: "",
    email: "",
    password: "",
  });

  const onChangeHandler = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (state === "register") {
        const passwordRegex =
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_-])[A-Za-z\d@$!%*?&.#_-]{8,}$/;

        if (!passwordRegex.test(formdata.password)) {
          setLoading(false);

          return toast.error("weak password");
        }
      }
      if (state === "login") {
        const { data } = await api.post("/api/users/login", formdata);

        dispatch(login(data));

        localStorage.setItem("token", data.token);

        toast.success(data.message);

        return;
      }

      // Register

      const { data } = await api.post("/api/users/send-otp", formdata);

      toast.success(data.message);

      navigate("/verify-otp", {
        state: {
          email: formdata.email,
        },
      });
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Login | AI Resume Builder</title>

        <meta
          name="description"
          content="Login securely to access your resumes and continue building professional ATS-friendly resumes."
        />
      </Helmet>
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 font-sans p-4 relative overflow-hidden">
        {/* Aesthetic Background Accents */}

        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-green-100 to-transparent -z-10"></div>
        <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-200/50 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-green-200/50 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

        <Link
          to="/"
          className="absolute top-8 left-8 text-slate-500 hover:text-slate-800 font-medium flex items-center gap-2 transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back to Home
        </Link>

        <form
          onSubmit={handleSubmit}
          className="w-full sm:w-[400px] text-center border border-slate-200 rounded-3xl p-10 bg-white shadow-xl shadow-slate-200/50 relative z-10">
          <h1 className="text-slate-900 text-3xl font-bold tracking-tight mb-2">
            {state === "login" ? "Welcome back" : "Create an account"}
          </h1>
          <p className="text-slate-500 text-sm mb-8">
            {state === "login"
              ? "Enter your details to sign in"
              : "Sign up to start building your resume"}
          </p>

          {state !== "login" && (
            <div className="flex items-center w-full mb-4 bg-slate-50 border border-slate-200 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100 transition-all h-12 rounded-xl overflow-hidden px-4 gap-3">
              <User2Icon size={18} className="text-slate-400" />
              <input
                type="text"
                id="name"
                placeholder="Full Name"
                className="no-global-input bg-transparent text-slate-800 placeholder-slate-400 outline-none text-sm w-full h-full font-medium"
                name="name"
                value={formdata.name}
                onChange={onChangeHandler}
                required
              />
            </div>
          )}

          <div className="flex items-center w-full mb-4 bg-slate-50 border border-slate-200 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100 transition-all h-12 rounded-xl overflow-hidden px-4 gap-3">
            <Mail size={18} className="text-slate-400" />
            <input
              type="email"
              placeholder="Email address"
              className="bg-transparent text-slate-800 placeholder-slate-400 outline-none text-sm w-full h-full font-medium"
              name="email"
              value={formdata.email}
              onChange={onChangeHandler}
              required
            />
          </div>

          <div className="flex items-center w-full mb-2 bg-slate-50 border border-slate-200 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100 transition-all h-12 rounded-xl overflow-hidden px-4 gap-3">
            <Lock size={18} className="text-slate-400" />
            <input
              type="password"
              placeholder="Password"
              className="bg-transparent text-slate-800 placeholder-slate-400 outline-none text-sm w-full h-full font-medium"
              name="password"
              value={formdata.password}
              onChange={onChangeHandler}
              required
            />
          </div>

          {state === "register" && (
            <div className="mb-6">
              <p className="text-xs text-slate-500 text-left leading-5">
                Password must contain:
                <br />
                • At least 8 characters
                <br />
                • One uppercase letter
                <br />
                • One lowercase letter
                <br />
                • One number
                <br />• One special character (@$!%*?&.#_-)
              </p>
            </div>
          )}

          {state === "login" && (
            <div className="mb-8 text-right">
              <a
                className="text-sm font-medium text-slate-500 hover:text-green-600 transition-colors"
                href="#">
                Forgot password?
              </a>
            </div>
          )}

          {state !== "login" && <div className="mb-6"></div>}

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

                {state === "login" ? "Signing In..." : "Creating Account..."}
              </>
            ) : state === "login" ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </button>

          <p className="text-slate-500 text-sm mt-8">
            {state === "login"
              ? "Don't have an account? "
              : "Already have an account? "}
            <button
              type="button"
              className="text-green-600 font-semibold hover:text-green-700 transition-colors"
              onClick={() =>
                setState((prev) => (prev === "login" ? "register" : "login"))
              }>
              {state === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </form>
      </div>
    </>
  );
};

export default Login;
