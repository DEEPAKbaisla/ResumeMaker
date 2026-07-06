import React from "react";
import { Link } from "react-router-dom";

const CallToAction = () => {
  return (
    <div id="cta" className="w-full bg-slate-50 py-24 px-4 md:px-16">
      <div className="max-w-5xl mx-auto relative rounded-3xl overflow-hidden shadow-xl">
        {/* Dynamic Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-500 via-emerald-400 to-green-600"></div>
        
        {/* Content */}
        <div className="relative z-10 border border-green-400 rounded-3xl p-10 sm:p-16 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="text-center md:text-left max-w-xl">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              Ready to land your dream job?
            </h2>
            <p className="text-green-50 text-lg">
              Build a professional, ATS-friendly resume that helps you stand out from the crowd and get hired faster.
            </p>
          </div>
          <div className="shrink-0">
            <Link
              to="/app"
              className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-green-700 font-bold rounded-full hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg">
              <span className="relative flex items-center gap-2">
                Create your resume now
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="group-hover:translate-x-1 transition-transform duration-300">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallToAction;
