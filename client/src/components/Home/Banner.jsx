import React from "react";

const Banner = () => {
  return (
    <div className="w-full py-2.5 font-medium text-sm text-center bg-gradient-to-r from-green-100 to-emerald-50 text-green-900 border-b border-green-200">
      <p className="flex items-center justify-center gap-2">
        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white bg-green-600">
          New
        </span>
        AI Feature Added: Generate Impactful Content Instantly
      </p>
    </div>
  );
};

export default Banner;
