import React from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.svg";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../app/features/authSlice";
import {
  FileTextIcon,
  BrainIcon,
  FilePenLineIcon,
  LogOutIcon,
} from "lucide-react";

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logoutuser = () => {
    navigate("/");
    dispatch(logout());
  };

  return (
    <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 print:hidden">
      <nav className="flex items-center justify-between max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 text-slate-800 transition-all">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src={logo} alt="logo" className="h-8 sm:h-9 w-auto" />
          <span className="font-bold text-base sm:text-lg tracking-tight text-slate-800 hidden sm:block">
            ResumeMaker
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-5 text-sm font-medium">
          <Link
            to="/app"
            className="flex items-center gap-1.5 text-slate-600 hover:text-green-600 transition-colors font-semibold">
            <FileTextIcon className="size-4" />
            My Resumes
          </Link>
          <Link
            to="/app/interview-prep"
            className="flex items-center gap-1.5 text-slate-600 hover:text-green-600 transition-colors font-semibold">
            <BrainIcon className="size-4" />
            AI Interview Prep
          </Link>

          {/* <Link
            to="/app/pdf-editor"
            className="flex items-center gap-1.5 text-slate-600 hover:text-green-600 transition-colors font-semibold">
            <FilePenLineIcon className="size-4" />
            PDF Editor
          </Link> */}

          <p className="text-slate-400 border-l border-slate-200 pl-4 text-sm">
            Hi, <span className="capitalize font-semibold text-slate-700">{user?.name}</span>
          </p>
          <button
            onClick={logoutuser}
            className="flex items-center gap-2 text-slate-600 hover:text-white bg-slate-100 hover:bg-red-600 border border-slate-200 px-4 py-2 rounded-full active:scale-95 transition-all shadow-sm cursor-pointer text-sm font-semibold">
            <LogOutIcon className="size-4" />
            Logout
          </button>
        </div>

        {/* Mobile Icon Nav */}
        <div className="flex md:hidden items-center gap-1">
          <Link
            to="/app"
            title="My Resumes"
            className="p-2.5 rounded-xl text-slate-500 hover:text-green-600 hover:bg-green-50 transition-all">
            <FileTextIcon className="size-5" />
          </Link>
          <Link
            to="/app/interview-prep"
            title="AI Interview Prep"
            className="p-2.5 rounded-xl text-slate-500 hover:text-green-600 hover:bg-green-50 transition-all">
            <BrainIcon className="size-5" />
          </Link>

          {/* <Link
            to="/app/pdf-editor"
            title="PDF Editor"
            className="p-2.5 rounded-xl text-slate-500 hover:text-green-600 hover:bg-green-50 transition-all">
            <FilePenLineIcon className="size-5" />
          </Link> */}
          
          <div className="w-px h-5 bg-slate-200 mx-1" />
          <button
            onClick={logoutuser}
            title="Logout"
            className="p-2.5 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer">
            <LogOutIcon className="size-5" />
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;

