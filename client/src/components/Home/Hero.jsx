import React from "react";
import logo from "../../assets/logo.svg";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const Hero = () => {
  const { user } = useSelector((state) => state.auth);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      title: "ATS Friendly",
      desc: "Optimized for modern applicant tracking systems.",
    },
    {
      title: "AI Powered",
      desc: "Generate resumes with AI assistance in seconds.",
    },
    {
      title: "Professional Templates",
      desc: "Choose from recruiter-approved resume designs.",
    },
    {
  title: "AI Resume Matcher",
  desc: "Analyze resume against any job description with AI",
}
  ];

  return (
    <>
      <div className="min-h-screen pb-20 bg-slate-50 text-slate-900 overflow-hidden font-sans">
        {/* Navbar */}
        <nav
          className={`fixed left-0 right-0 z-50 flex items-center justify-between w-full px-6 md:px-16 lg:px-24 xl:px-40 text-sm transition-all duration-300 ${
            isScrolled
              ? "top-0 py-3 bg-white/85 backdrop-blur-md border-b border-slate-200 shadow-sm"
              : "top-[45px] sm:top-10 py-5 bg-transparent border-b border-transparent"
          }`}>
          <a href="#" className="flex items-center gap-2">
            <img src={logo} alt="logo" className="h-9 w-auto" />
            <span className="font-bold text-lg tracking-tight text-slate-800">
              ResumeMaker
            </span>
          </a>

          <div className="hidden md:flex items-center gap-8 text-slate-600 font-medium">
            <a href="#" className="hover:text-green-600 transition">
              Home
            </a>
            <a href="#features" className="hover:text-green-600 transition">
              Features
            </a>
            <a href="#testimonial" className="hover:text-green-600 transition">
              Testimonials
            </a>
            <a href="#cta" className="hover:text-green-600 transition">
              Contact
            </a>
          </div>

          <div className="flex gap-4">
            <Link
              to="/app?state=login"
              className="hidden md:block px-5 py-2 hover:text-green-600 transition text-slate-600 font-medium"
              hidden={user}>
              Login
            </Link>
            <Link
              to="/app?state=register"
              className="hidden md:flex items-center justify-center px-5 py-2 bg-slate-900 text-white hover:bg-slate-800 active:scale-95 transition-all rounded-full font-medium shadow-sm"
              hidden={user}>
              Get started
            </Link>
            <Link
              to="/app"
              className="hidden md:flex items-center justify-center px-6 py-2 bg-slate-900 text-white hover:bg-slate-800 transition-all rounded-full font-medium shadow-sm"
              hidden={!user}>
              Dashboard
            </Link>
          </div>

          <button
            onClick={() => setMenuOpen(true)}
            className="md:hidden text-slate-800 active:scale-90 transition">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="26"
              height="26"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="lucide lucide-menu">
              <path d="M4 5h16M4 12h16M4 19h16" />
            </svg>
          </button>
        </nav>

        {/* Mobile Menu */}
        <div
          className={`fixed inset-0 z-[100] bg-white/95 text-slate-900 backdrop-blur-xl flex flex-col items-center justify-center text-lg gap-8 md:hidden transition-all duration-300 ${
            menuOpen ? "opacity-100 visible" : "opacity-0 invisible"
          }`}>
          <a
            href="#"
            onClick={() => setMenuOpen(false)}
            className="hover:text-green-600 transition font-medium">
            Home
          </a>
          <a
            href="#features"
            onClick={() => setMenuOpen(false)}
            className="hover:text-green-600 transition font-medium">
            Features
          </a>
          <a
            href="#testimonial"
            onClick={() => setMenuOpen(false)}
            className="hover:text-green-600 transition font-medium">
            Testimonials
          </a>
          <a
            href="#cta"
            onClick={() => setMenuOpen(false)}
            className="hover:text-green-600 transition font-medium">
            Contact
          </a>
          <button
            onClick={() => setMenuOpen(false)}
            className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 transition rounded-full flex items-center justify-center text-slate-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-x">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Hero Section */}
        <div className="relative flex flex-col items-center justify-center text-center px-4 md:px-16 pt-40 lg:pt-48 pb-20">
          {/* Animated Background Gradients */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-green-300/40 rounded-full blur-[120px] -z-10 pointer-events-none mix-blend-multiply animate-pulse"></div>
          <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-emerald-200/50 rounded-full blur-[100px] -z-10 pointer-events-none mix-blend-multiply"></div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 bg-white/60 backdrop-blur-sm mb-8 text-xs font-medium text-slate-600 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
            ResumeMaker 2.0 is live
          </div>

          {/* Headline + CTA */}
          <h1 className="text-5xl md:text-7xl font-bold max-w-4xl tracking-tight leading-[1.1] mb-6 text-slate-900">
            Land your dream job with{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">
              AI-powered
            </span>{" "}
            resumes.
          </h1>

          <p className="max-w-xl text-slate-600 text-lg mb-10 leading-relaxed">
            Create, edit and download professional resumes with intelligent AI
            assistance. Built for the modern job market.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link
              to="/app"
              className="w-full sm:w-auto bg-slate-900 text-white hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all duration-200 rounded-full px-8 py-3.5 font-medium flex items-center justify-center gap-2 shadow-md hover:shadow-lg">
              Get started for free
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-arrow-right">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 border border-slate-300 hover:bg-slate-100 active:scale-95 transition-all duration-200 rounded-full px-8 py-3.5 text-slate-700 font-medium cursor-pointer shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-play">
                <polygon points="6 3 20 12 6 21 6 3" />
              </svg>
              Watch demo
            </button>
          </div>

          {/* Social Proof */}
          <div className="mt-20 pt-10 border-t border-slate-200 w-full max-w-6xl">
            <p className="text-center text-sm text-slate-500 uppercase tracking-widest mb-10">
              Why Choose Resume Builder
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {features.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl border border-slate-200 p-5 text-center shadow-sm hover:shadow-md transition">
                  <h3 className="font-semibold text-slate-900">{item.title}</h3>
                  <p className="text-sm text-slate-500 mt-2">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
          
          #root {
            font-family: 'Inter', sans-serif;
            background-color: #f8fafc;
          }
        `}
      </style>
    </>
  );
};

export default Hero;
