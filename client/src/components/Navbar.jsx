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
    <div className="shadow bg-white">
      <nav className="flex items-center justify-between max-w-7xl mx-auto px-4 py-3.5 text-slate-800 transition-all">
        <Link to="/">
          <img src={logo} alt="logo" className="h-11 -auto" />
        </Link>
        <div className="flex itmes-center gap-4 text-sm ">
          <p className="max-sm:hidden py-3 ">Hi ,{user?.name}</p>
          <button
            onClick={logoutuser}
            className="bg-white hover:bg-slate-300 border-gray-200 px-7 py-1.5 rounded-full active:scale-95 transition-all">
            Logout
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
