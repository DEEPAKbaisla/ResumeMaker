import { Lock, Mail, User2Icon } from "lucide-react";
import React from "react";
import { useDispatch } from "react-redux";
import { login } from "../app/features/authSlice";
import toast from "react-hot-toast";
import api from "../configs/api";

const Login = () => {
  const dispatch = useDispatch();
  // state for login or register
  const query = new URLSearchParams(window.location.search);
  const urlState = query.get("state");
  const [state, setState] = React.useState(urlState || "login");

  // state for input value
  const [formdata, setFormData] = React.useState({
    name: "",
    email: "",
    password: "",
  });

  // handle change input value
  const onChangeHandler = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // handle submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post(`/api/users/${state}`, formdata);
      dispatch(login(data));
      localStorage.setItem("token", data.token);
      toast.success(data.message);
    } catch (error) {
      toast(error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="w-full sm:w-[350px] text-center border border-zinc-300/60 dark:border-zinc-700 rounded-2xl px-8 bg-white">
        <h1 className="text-zinc-900 text-3xl mt-10 font-medium">
          {state === "login" ? "Login" : "Register"}
        </h1>
        <p className="text-zinc-500 text-sm mt-2 pb-6">
          Please {state === "login" ? "sign in" : "sign up"} to continue
        </p>

        {state !== "login" && (
          <div className="flex items-center w-full mt-4 bg-white  border border-zinc-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
            {/* User Icon */}
            <User2Icon size={16} color="#6B7280" />
            <input
              type="text"
              id="text"
              placeholder="Name"
              className="bg-transparent text-zinc-600  placeholder-zinc-500  outline-none text-sm w-full h-full"
              name="name"
              value={formdata.name}
              onChange={onChangeHandler}
              required
            />
          </div>
        )}

        <div className="flex items-center w-full mt-4 bg-white  border border-zinc-300/80  h-12 rounded-full overflow-hidden pl-6 gap-2">
          {/* Mail Icon */}
          <Mail size={13} color="#6B7280" />
          <input
            type="email"
            placeholder="Email id"
            className="bg-transparent text-zinc-600  placeholder-zinc-500 outline-none text-sm w-full h-full"
            name="email"
            value={formdata.email}
            onChange={onChangeHandler}
            required
          />
        </div>

        <div className="flex items-center mt-4 w-full bg-white border border-zinc-300/80  h-12 rounded-full overflow-hidden pl-6 gap-2">
          {/* Lock Icon */}
          <Lock size={13} color="#6B7280" />
          <input
            type="password"
            placeholder="Password"
            className="bg-transparent text-zinc-600  placeholder-zinc-500  outline-none text-sm w-full h-full"
            name="password"
            value={formdata.password}
            onChange={onChangeHandler}
            required
          />
        </div>

        <div className="mt-5 text-left">
          <a className="text-sm text- -500 " href="#">
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          className="mt-2 w-full h-11 rounded-full text-white bg-green-500 hover:opacity-90 transition-opacity">
          {state === "login" ? "Login" : "Create Account"}
        </button>

        <p className="text-zinc-500  text-sm mt-3 mb-11">
          {state === "login"
            ? "Don't have an account? "
            : "Already have an account? "}
          <button
            type="button"
            className="text-green-500 "
            onClick={() =>
              setState((prev) => (prev === "login" ? "register" : "login"))
            }>
            {state === "login" ? "Register" : "Login"}
          </button>
        </p>
      </form>
    </div>
  );
};

export default Login;
