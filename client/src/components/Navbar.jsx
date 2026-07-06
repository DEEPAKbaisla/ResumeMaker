import React from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.svg";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../app/features/authSlice";

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const logoutuser = () => {
    navigate("/");
    dispatch(logout());
  };
  return (
    <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <nav className="flex items-center justify-between max-w-7xl mx-auto px-6 py-4 text-slate-800 transition-all">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="logo" className="h-9 w-auto" />
          <span className="font-bold text-lg tracking-tight text-slate-800 hidden sm:block">
            ResumeMaker
          </span>
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium">
          <p className="max-sm:hidden text-slate-600">
            Hi , <span className="capitalize">{user?.name}</span>{" "}
          </p>
          <button
            onClick={logoutuser}
            className="flex items-center gap-2 text-slate-600 hover:text-white bg-slate-100 hover:bg-red-600 border border-slate-200 px-5 py-2 rounded-full active:scale-95 transition-all shadow-sm">
            Logout
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" x2="9" y1="12" y2="12" />
            </svg>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
